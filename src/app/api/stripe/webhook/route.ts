import { NextResponse, type NextRequest } from 'next/server'
import type Stripe from 'stripe'
import { createAdminSupabase } from '@/lib/supabase/server'
import { getStripe, planFromPriceId, PLAN_QUOTA, type PlanId } from '@/lib/stripe'

/**
 * POST /api/stripe/webhook
 *
 * Verifica la firma con el RAW body y sincroniza el estado de la suscripción
 * hacia tenants (vía service_role). Idempotente: cada evento reescribe el
 * estado final del tenant. Devuelve 200 rápido; 400 solo si la firma falla.
 *
 * Eventos manejados:
 *   - checkout.session.completed
 *   - customer.subscription.created
 *   - customer.subscription.updated
 *   - customer.subscription.deleted
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Mapea el status de Stripe a nuestro plan_status. */
function mapStatus(stripeStatus: Stripe.Subscription.Status): string {
  switch (stripeStatus) {
    case 'active':
    case 'trialing':
      return 'active'
    case 'past_due':
    case 'unpaid':
    case 'incomplete':
      return 'past_due'
    case 'canceled':
    case 'incomplete_expired':
      return 'canceled'
    default:
      return 'past_due'
  }
}

/** current_period_end vive en los items de la suscripción (SDK v22+). */
function periodEndIso(sub: Stripe.Subscription): string | null {
  const epoch = sub.items.data[0]?.current_period_end
  return typeof epoch === 'number' ? new Date(epoch * 1000).toISOString() : null
}

function customerIdOf(sub: Stripe.Subscription): string | null {
  return typeof sub.customer === 'string' ? sub.customer : (sub.customer?.id ?? null)
}

/**
 * Escribe el estado de una suscripción en el tenant correspondiente.
 * `deleted=true` fuerza plan='free' (cancelación efectiva).
 */
async function syncSubscription(
  sub: Stripe.Subscription,
  tenantIdHint: string | null,
  deleted: boolean,
): Promise<void> {
  const admin = await createAdminSupabase()
  const customerId = customerIdOf(sub)

  // Resolver tenant: metadata → hint → lookup por stripe_customer_id.
  let tenantId: string | null = sub.metadata?.tenant_id ?? tenantIdHint ?? null
  if (!tenantId && customerId) {
    const { data } = await admin
      .from('tenants')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .maybeSingle()
    tenantId = (data as { id: string } | null)?.id ?? null
  }
  if (!tenantId) {
    console.warn('[stripe/webhook] evento sin tenant resoluble', sub.id)
    return
  }

  const priceId = sub.items.data[0]?.price?.id ?? null
  const plan: PlanId = deleted ? 'free' : planFromPriceId(priceId)
  const planStatus = deleted ? 'canceled' : mapStatus(sub.status)

  const update: Record<string, string | number | null> = {
    plan,
    plan_status: planStatus,
    conversations_included: PLAN_QUOTA[plan],
    stripe_subscription_id: sub.id,
    current_period_end: periodEndIso(sub),
  }
  if (customerId) update.stripe_customer_id = customerId

  const { error } = await admin.from('tenants').update(update).eq('id', tenantId)
  if (error) {
    console.error('[stripe/webhook] error actualizando tenant', tenantId, error.message)
  }
}

export async function POST(req: NextRequest) {
  const raw = await req.text()
  const signature = req.headers.get('stripe-signature')
  const secret = process.env.STRIPE_WEBHOOK_SECRET

  if (!signature || !secret) {
    console.error('[stripe/webhook] falta firma o STRIPE_WEBHOOK_SECRET')
    return NextResponse.json({ error: 'Configuración de webhook incompleta.' }, { status: 400 })
  }

  const stripe = getStripe()
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(raw, signature, secret)
  } catch (err) {
    console.error('[stripe/webhook] firma inválida', (err as Error).message)
    return NextResponse.json({ error: 'Firma inválida.' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const subId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id
        const tenantHint = session.client_reference_id ?? session.metadata?.tenant_id ?? null
        if (subId) {
          const sub = await stripe.subscriptions.retrieve(subId)
          await syncSubscription(sub, tenantHint, false)
        }
        break
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        await syncSubscription(event.data.object, null, false)
        break
      }
      case 'customer.subscription.deleted': {
        await syncSubscription(event.data.object, null, true)
        break
      }
      default:
        // Ignoramos el resto en silencio.
        break
    }
  } catch (err) {
    // No propagamos: respondemos 200 para que Stripe no reintente en bucle por
    // errores de nuestro lado; el error queda en logs para diagnóstico.
    console.error('[stripe/webhook] error procesando', event.type, (err as Error).message)
  }

  return NextResponse.json({ received: true })
}
