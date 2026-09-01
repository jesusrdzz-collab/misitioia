import { createAdminSupabase } from '@/lib/supabase/server'
import { LoginGate } from '@/features/editor/components/LoginGate'
import { DashboardShell } from '@/features/dashboard/components/DashboardShell'
import { DatosVictoriaForm } from '@/features/dashboard/components/DatosVictoriaForm'
import { resolveDashboardSite } from '@/features/dashboard/resolve-site'
import type { VictoriaBasics } from '@/features/dashboard/actions'
import type { ServiceItem, SiteContent, SiteProduct } from '@/lib/types/site'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Datos de Victoria — MiSitio IA', robots: { index: false } }

interface Props {
  searchParams: Promise<{ site?: string }>
}

export default async function DatosPage({ searchParams }: Props) {
  const { site: siteParam } = await searchParams
  const resolved = await resolveDashboardSite(siteParam)

  if (resolved.status === 'no-auth') {
    return <LoginGate next="/editar/datos" title="Entra a tu panel" />
  }

  const { site } = resolved
  const admin = await createAdminSupabase()

  const [{ data: contentRow }, { data: productRows }] = await Promise.all([
    admin.from('site_content').select('*').eq('site_id', site.siteId).maybeSingle(),
    admin
      .from('site_products')
      .select('*')
      .eq('site_id', site.siteId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true }),
  ])

  const content = (contentRow as SiteContent) ?? null
  const products = (productRows as SiteProduct[]) ?? []

  const basics: VictoriaBasics = {
    about_text: content?.about_text ?? null,
    contact_phone: content?.contact_phone ?? null,
    contact_whatsapp: content?.contact_whatsapp ?? null,
    contact_email: content?.contact_email ?? null,
    contact_address: content?.contact_address ?? null,
    ciudad: content?.ciudad ?? null,
    zona: content?.zona ?? null,
    estado: content?.estado ?? null,
    social_facebook: content?.social_facebook ?? null,
    social_instagram: content?.social_instagram ?? null,
    working_hours: content?.working_hours ?? null,
  }
  const services: ServiceItem[] = content?.services ?? []

  return (
    <DashboardShell active="datos" siteId={site.siteId} slug={site.slug} businessName={site.businessName}>
      <DatosVictoriaForm
        siteId={site.siteId}
        initialBasics={basics}
        initialServices={services}
        initialProducts={products}
      />
    </DashboardShell>
  )
}
