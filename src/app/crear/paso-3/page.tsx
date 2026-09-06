import { redirect } from 'next/navigation'
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase/server'
import { LoginGate } from '@/features/editor/components/LoginGate'
import { WizardShell } from '@/features/wizard/components/WizardShell'
import { Paso3Images } from '@/features/wizard/components/Paso3Images'
import { authorizeSiteAccess } from '@/features/editor/authorize'
import type { SiteContent } from '@/lib/types/site'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Paso 4 — Imágenes', robots: { index: false } }

interface Props {
  searchParams: Promise<{ site?: string }>
}

export default async function Paso3Page({ searchParams }: Props) {
  const { site: siteParam } = await searchParams
  if (!siteParam) redirect('/crear/paso-1a')

  const supabase = await createServerSupabase()
  const { data } = await supabase.auth.getUser()
  if (!data.user?.email) {
    return <LoginGate next={`/crear/paso-3?site=${siteParam}`} title="Continuar creando tu página" />
  }

  const authorized = await authorizeSiteAccess(siteParam, data.user.email)
  if (!authorized) redirect('/crear/paso-1a')

  const admin = await createAdminSupabase()
  const { data: contentRow } = await admin
    .from('site_content')
    .select('hero_image_url, about_image_url, catalog_placeholder_url')
    .eq('site_id', authorized.siteId)
    .maybeSingle()

  const content = (contentRow as Partial<SiteContent> | null) ?? {}

  return (
    <WizardShell current="paso-3">
      <Paso3Images
        siteId={authorized.siteId}
        slug={authorized.slug}
        initial={{
          hero: content.hero_image_url ?? null,
          about: content.about_image_url ?? null,
          catalog: content.catalog_placeholder_url ?? null,
        }}
      />
    </WizardShell>
  )
}
