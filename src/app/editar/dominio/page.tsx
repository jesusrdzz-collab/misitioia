import { createAdminSupabase } from '@/lib/supabase/server'
import { LoginGate } from '@/features/editor/components/LoginGate'
import { DashboardShell } from '@/features/dashboard/components/DashboardShell'
import { DomainPanel } from '@/features/dashboard/components/DomainPanel'
import { resolveDashboardSite } from '@/features/dashboard/resolve-site'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Conectar dominio — MiSitio IA', robots: { index: false } }

interface Props {
  searchParams: Promise<{ site?: string }>
}

export default async function DominioPage({ searchParams }: Props) {
  const { site: siteParam } = await searchParams
  const resolved = await resolveDashboardSite(siteParam)

  if (resolved.status === 'no-auth') {
    return <LoginGate next="/editar/dominio" title="Entra a tu panel" />
  }

  const { site } = resolved
  const admin = await createAdminSupabase()
  const { data: row } = await admin
    .from('sites')
    .select('custom_domain')
    .eq('id', site.siteId)
    .maybeSingle()

  const customDomain = (row as { custom_domain: string | null } | null)?.custom_domain ?? null

  return (
    <DashboardShell active="dominio" siteId={site.siteId} slug={site.slug} businessName={site.businessName}>
      <DomainPanel siteId={site.siteId} slug={site.slug} initialCustomDomain={customDomain} />
    </DashboardShell>
  )
}
