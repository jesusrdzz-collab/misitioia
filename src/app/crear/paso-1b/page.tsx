import { redirect } from 'next/navigation'
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase/server'
import { LoginGate } from '@/features/editor/components/LoginGate'
import { WizardShell } from '@/features/wizard/components/WizardShell'
import { Paso1bForm } from '@/features/wizard/components/Paso1bForm'
import { authorizeSiteAccess } from '@/features/editor/authorize'
import type { SiteContent } from '@/lib/types/site'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Paso 2 — Tus datos', robots: { index: false } }

interface Props {
  searchParams: Promise<{ site?: string }>
}

export default async function Paso1bPage({ searchParams }: Props) {
  const { site: siteParam } = await searchParams
  if (!siteParam) redirect('/crear/paso-1a')

  const supabase = await createServerSupabase()
  const { data } = await supabase.auth.getUser()
  if (!data.user?.email) {
    return <LoginGate next={`/crear/paso-1b?site=${siteParam}`} title="Continuar creando tu página" />
  }

  const authorized = await authorizeSiteAccess(siteParam, data.user.email)
  if (!authorized) redirect('/crear/paso-1a')

  const admin = await createAdminSupabase()
  const { data: contentRow } = await admin
    .from('site_content')
    .select('*')
    .eq('site_id', authorized.siteId)
    .maybeSingle()

  const content = (contentRow as SiteContent | null) ?? null

  return (
    <WizardShell current="paso-1b">
      <Paso1bForm
        siteId={authorized.siteId}
        slug={authorized.slug}
        businessName={authorized.businessName}
        initial={{
          contact_phone: content?.contact_phone ?? null,
          contact_whatsapp: content?.contact_whatsapp ?? null,
          contact_email: content?.contact_email ?? null,
          contact_address: content?.contact_address ?? null,
          responsable_nombre: content?.responsable_nombre ?? null,
          responsable_domicilio: content?.responsable_domicilio ?? null,
          working_hours: content?.working_hours ?? null,
        }}
      />
    </WizardShell>
  )
}
