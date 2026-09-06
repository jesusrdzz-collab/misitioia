import { createServerSupabase } from '@/lib/supabase/server'
import { LoginGate } from '@/features/editor/components/LoginGate'
import { WizardShell } from '@/features/wizard/components/WizardShell'
import { Paso1aForm } from '@/features/wizard/components/Paso1aForm'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Paso 1 — Crear mi sitio', robots: { index: false } }

export default async function Paso1aPage() {
  const supabase = await createServerSupabase()
  const { data } = await supabase.auth.getUser()

  if (!data.user?.email) {
    return <LoginGate next="/crear/paso-1a" title="Crea tu página" />
  }

  return (
    <WizardShell current="paso-1a">
      <Paso1aForm />
    </WizardShell>
  )
}
