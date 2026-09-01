import { NextResponse, type NextRequest } from 'next/server'
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase/server'
import { authorizeSiteAccess } from '@/features/editor/authorize'
import { getStripe, planPriceId, type PaidPlan } from '@/lib/stripe'

/**
 * POST /api/stripe/checkout
 * Body: { plan: 'emprende'|'crece'|'pro', siteId }
 *
 * Crea una Checkout Session de suscripción. El precio y el tenant SIEMPRE se
 * derivan en el servidor a partir del sitio autorizado — nunca se confía en el
 * cliente para el precio ni el tenant.
 */
export const runtime = 'nodejs'

const PAID_PLANS: PaidPlan[] = ['emprende', 'crece', 'pro']

function isPaidPlan(value: unknown): value is PaidPlan {
  return typeof value === 'string' && (PAID_PLANS as string[]).includes(value)
}

export async function POST(req: NextRequest) {
  let body: { plan?: unknown; siteId?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Body inválido.' }, { status: 400 })
  }

  const { plan, siteId } = body
  if (!isPaidPlan(plan)) {
    return NextResponse.json({ ok: false, error: 'Plan inválido.' }, { status: 400 })
  }
  if (typeof siteId !== 'string' || !siteId) {
    return NextResponse.json({ ok: false, error: 'Falta siteId.' }, { status: 400 })
  }

  // 1) Sesión + autorización del sitio → tenant.
  const supabase = await createServerSupabase()
  const { data: userData } = await supabase.auth.getUser()
  const email = userData.user?.email
  if (!email) {
    return NextResponse.json({ ok: false, error: 'No autenticado.' }, { status: 401 })
  }

  const authorized = await authorizeSiteAccess(siteId, email)
  if (!authorized) {
    return NextResponse.json({ ok: false, error: 'Sitio no autorizado.' }, { status: 403 })
  }
  const tenantId = authorized.tenantId

  // 2) Cliente Stripe existente o nuevo (guardado en tenants.stripe_customer_id).
  const admin = await createAdminSupabase()
  const { data: tenant } = await admin
    .from('tenants')
    .select('stripe_customer_id, owner_email')
    .eq('id', tenantId)
    .maybeSingle()

  const stripe = getStripe()
  let customerId = (tenant as { stripe_customer_id: string | null } | null)?.stripe_customer_id ?? null

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: (tenant as { owner_email: string | null } | null)?.owner_email ?? email,
      metadata: { tenant_id: tenantId },
    })
    customerId = customer.id
    await admin.from('tenants').update({ stripe_customer_id: customerId }).eq('id', tenantId)
  }

  // 3) Checkout Session de suscripción. Precio derivado del plan en servidor.
  const origin = req.nextUrl.origin
  let priceId: string
  try {
    priceId = planPriceId(plan)
  } catch (err) {
    console.error('[stripe/checkout] precio no configurado', (err as Error).message)
    return NextResponse.json({ ok: false, error: 'Configuración de pago incompleta.' }, { status: 500 })
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: tenantId,
      subscription_data: { metadata: { tenant_id: tenantId, plan } },
      metadata: { tenant_id: tenantId, plan },
      allow_promotion_codes: true,
      success_url: `${origin}/editar/plan?site=${encodeURIComponent(siteId)}&checkout=success`,
      cancel_url: `${origin}/editar/plan?site=${encodeURIComponent(siteId)}&checkout=cancel`,
    })

    if (!session.url) {
      return NextResponse.json({ ok: false, error: 'Stripe no devolvió URL.' }, { status: 502 })
    }
    return NextResponse.json({ ok: true, url: session.url })
  } catch (err) {
    console.error('[stripe/checkout] error creando sesión', (err as Error).message)
    return NextResponse.json({ ok: false, error: 'No se pudo iniciar el pago.' }, { status: 502 })
  }
}
