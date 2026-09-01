import { createAdminSupabase } from '@/lib/supabase/server'
import { LoginGate } from '@/features/editor/components/LoginGate'
import { DashboardShell } from '@/features/dashboard/components/DashboardShell'
import { PlanPanel } from '@/features/dashboard/components/PlanPanel'
import { resolveDashboardSite } from '@/features/dashboard/resolve-site'
import { getVictoriaUsage } from '@/features/billing/usage'
import { PLAN_QUOTA, type PlanId } from '@/lib/stripe'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Mi plan — MiSitio IA', robots: { index: false } }

interface Props {
  searchParams: Promise<{ site?: string; checkout?: string }>
}

/**
 * Normaliza el valor guardado en tenants.plan a un PlanId válido.
 * Acepta los valores nuevos ('free'|'emprende'|'crece'|'pro') y, por
 * compatibilidad, los legacy ('gratis'|'nivel_2'|'nivel_3').
 */
function normalizePlan(raw: string | null | undefined): PlanId {
  switch (raw) {
    case 'free':
    case 'emprende':
    case 'crece':
    case 'pro':
      return raw
    case 'nivel_2':
      return 'emprende'
    case 'nivel_3':
      return 'crece'
    default:
      return 'free'
  }
}

export default async function PlanPage({ searchParams }: Props) {
  const { site: siteParam, checkout } = await searchParams
  const resolved = await resolveDashboardSite(siteParam)

  if (resolved.status === 'no-auth') {
    return <LoginGate next="/editar/plan" title="Entra a tu panel" />
  }

  const { site } = resolved
  const admin = await createAdminSupabase()
  const { data: tenant } = await admin
    .from('tenants')
    .select('plan, plan_status, current_period_end, conversations_included, stripe_subscription_id')
    .eq('id', site.tenantId)
    .maybeSingle()

  const row = tenant as {
    plan: string | null
    plan_status: string | null
    current_period_end: string | null
    conversations_included: number | null
    stripe_subscription_id: string | null
  } | null

  const currentPlanId = normalizePlan(row?.plan)
  const conversationsIncluded = row?.conversations_included ?? PLAN_QUOTA[currentPlanId]
  const checkoutStatus = checkout === 'success' ? 'success' : checkout === 'cancel' ? 'cancel' : null

  // Uso de Victoria ya persistido (sin llamar a Konnex en cada carga). El panel
  // ofrece un botón para refrescar bajo demanda vía server action autorizada.
  const usage = await getVictoriaUsage(site.tenantId)

  return (
    <DashboardShell active="plan" siteId={site.siteId} slug={site.slug} businessName={site.businessName}>
      <PlanPanel
        siteId={site.siteId}
        currentPlanId={currentPlanId}
        planStatus={row?.plan_status ?? 'active'}
        currentPeriodEndIso={row?.current_period_end ?? null}
        conversationsIncluded={conversationsIncluded}
        hasSubscription={Boolean(row?.stripe_subscription_id)}
        checkout={checkoutStatus}
        conversationsUsed={usage.conversationsUsed}
        usageConfigured={usage.configured}
        usageSyncedAtIso={usage.usageSyncedAtIso}
      />
    </DashboardShell>
  )
}
