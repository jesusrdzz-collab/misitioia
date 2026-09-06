import { redirect } from 'next/navigation'
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase/server'
import { LoginGate } from '@/features/editor/components/LoginGate'
import { WizardShell } from '@/features/wizard/components/WizardShell'
import { Paso2Grid } from '@/features/wizard/components/Paso2Grid'
import { authorizeSiteAccess } from '@/features/editor/authorize'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Paso 3 — Elige plantilla', robots: { index: false } }

interface Props {
  searchParams: Promise<{ site?: string }>
}

export default async function Paso2Page({ searchParams }: Props) {
  const { site: siteParam } = await searchParams
  if (!siteParam) redirect('/crear/paso-1a')

  const supabase = await createServerSupabase()
  const { data } = await supabase.auth.getUser()
  if (!data.user?.email) {
    return <LoginGate next={`/crear/paso-2?site=${siteParam}`} title="Continuar creando tu página" />
  }

  const authorized = await authorizeSiteAccess(siteParam, data.user.email)
  if (!authorized) redirect('/crear/paso-1a')

  const admin = await createAdminSupabase()
  const { data: siteRow } = await admin
    .from('sites')
    .select('template')
    .eq('id', authorized.siteId)
    .maybeSingle()

  const currentTemplate =
    (siteRow as { template: string | null } | null)?.template ?? 'neutro-minimalista'

  return (
    <WizardShell current="paso-2">
      <Paso2Grid siteId={authorized.siteId} slug={authorized.slug} currentTemplate={currentTemplate} />
    </WizardShell>
  )
}
