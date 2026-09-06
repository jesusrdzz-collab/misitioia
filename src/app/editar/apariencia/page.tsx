import { createAdminSupabase } from '@/lib/supabase/server'
import { LoginGate } from '@/features/editor/components/LoginGate'
import { DashboardShell } from '@/features/dashboard/components/DashboardShell'
import { resolveDashboardSite } from '@/features/dashboard/resolve-site'
import { TemplateGrid } from '@/features/templates/components/TemplateGrid'
import type { SiteContent } from '@/lib/types/site'
import type { DashboardSection } from '@/features/dashboard/components/DashboardShell'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Apariencia — MiSitio IA', robots: { index: false } }

interface Props {
  searchParams: Promise<{ site?: string }>
}

export default async function AparienciaPage({ searchParams }: Props) {
  const { site: siteParam } = await searchParams
  const resolved = await resolveDashboardSite(siteParam)
  if (resolved.status === 'no-auth') {
    return <LoginGate next="/editar/apariencia" title="Entra a tu panel" />
  }

  const { site } = resolved
  const admin = await createAdminSupabase()

  const [{ data: siteRow }, { data: contentRow }] = await Promise.all([
    admin.from('sites').select('template').eq('id', site.siteId).maybeSingle(),
    admin.from('site_content').select('*').eq('site_id', site.siteId).maybeSingle(),
  ])

  const currentTemplate = (siteRow?.template as string | undefined) ?? 'terracota-classic'
  const content = (contentRow as SiteContent | null) ?? null

  const currentImages = {
    hero: content?.hero_image_url ?? null,
    about: content?.about_image_url ?? null,
    catalog: content?.catalog_placeholder_url ?? null,
  }

  const activeSection = 'apariencia' as DashboardSection

  return (
    <DashboardShell active={activeSection} siteId={site.siteId} slug={site.slug} businessName={site.businessName}>
      <TemplateGrid siteId={site.siteId} slug={site.slug} currentTemplate={currentTemplate} currentImages={currentImages} />
    </DashboardShell>
  )
}
