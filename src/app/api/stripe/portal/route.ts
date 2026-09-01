import { NextResponse, type NextRequest } from 'next/server'
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase/server'
import { authorizeSiteAccess } from '@/features/editor/authorize'
import { getStripe } from '@/lib/stripe'

/**
 * POST /api/stripe/portal
 * Body: { siteId }
 *
 * Abre el portal de facturación de Stripe para que el dueño administre su
 * suscripción (cambiar plan, actualizar tarjeta, cancelar).
 */
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  let body: { siteId?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Body inválido.' }, { status: 400 })
  }

  const { siteId } = body
  if (typeof siteId !== 'string' || !siteId) {
    return NextResponse.json({ ok: false, error: 'Falta siteId.' }, { status: 400 })
  }

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

  const admin = await createAdminSupabase()
  const { data: tenant } = await admin
    .from('tenants')
    .select('stripe_customer_id')
    .eq('id', authorized.tenantId)
    .maybeSingle()

  const customerId = (tenant as { stripe_customer_id: string | null } | null)?.stripe_customer_id
  if (!customerId) {
    return NextResponse.json({ ok: false, error: 'No hay suscripción activa.' }, { status: 400 })
  }

  try {
    const stripe = getStripe()
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${req.nextUrl.origin}/editar/plan?site=${encodeURIComponent(siteId)}`,
    })
    return NextResponse.json({ ok: true, url: session.url })
  } catch (err) {
    console.error('[stripe/portal] error', (err as Error).message)
    return NextResponse.json({ ok: false, error: 'No se pudo abrir el portal.' }, { status: 502 })
  }
}
