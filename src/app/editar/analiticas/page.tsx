import { createAdminSupabase } from '@/lib/supabase/server'
import { LoginGate } from '@/features/editor/components/LoginGate'
import { DashboardShell } from '@/features/dashboard/components/DashboardShell'
import { AnalyticsPanel } from '@/features/analytics/components/AnalyticsPanel'
import { resolveDashboardSite } from '@/features/dashboard/resolve-site'
import type { PlanLevel } from '@/lib/types/site'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Analíticas — MiSitio IA', robots: { index: false } }

interface Props {
  searchParams: Promise<{ site?: string }>
}

/** Normaliza el plan (mismo criterio que las otras páginas del panel). */
function normalizePlan(raw: string | null | undefined): PlanLevel {
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

export default async function AnaliticasPage({ searchParams }: Props) {
  const { site: siteParam } = await searchParams
  const resolved = await resolveDashboardSite(siteParam)

  if (resolved.status === 'no-auth') {
    return <LoginGate next="/editar/analiticas" title="Entra a tu panel" />
  }

  const { site } = resolved
  const admin = await createAdminSupabase()

  const [{ data: siteRow }, { data: tenantRow }] = await Promise.all([
    admin
      .from('sites')
      .select('meta_pixel_id, ga_measurement_id')
      .eq('id', site.siteId)
      .maybeSingle(),
    admin.from('tenants').select('plan').eq('id', site.tenantId).maybeSingle(),
  ])

  const row = siteRow as {
    meta_pixel_id: string | null
    ga_measurement_id: string | null
  } | null

  const plan = normalizePlan((tenantRow as { plan: string | null } | null)?.plan)

  return (
    <DashboardShell
      active="analiticas"
      siteId={site.siteId}
      slug={site.slug}
      businessName={site.businessName}
    >
      <AnalyticsPanel
        siteId={site.siteId}
        plan={plan}
        initialMetaPixelId={row?.meta_pixel_id ?? null}
        initialGaMeasurementId={row?.ga_measurement_id ?? null}
        planUpgradeHref={`/editar/plan?site=${encodeURIComponent(site.siteId)}`}
      />
    </DashboardShell>
  )
}
