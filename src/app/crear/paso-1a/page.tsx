import { createServerSupabase } from '@/lib/supabase/server'
import { WizardShell } from '@/features/wizard/components/WizardShell'
import { Paso1aForm } from '@/features/wizard/components/Paso1aForm'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Paso 1 — Crear mi sitio', robots: { index: false } }

/**
 * Paso 1a — punto de entrada del wizard.
 *
 * Renderiza el formulario SIEMPRE, incluso sin sesión. Fix embudo 2026-09-09:
 * antes bloqueábamos con LoginGate y perdíamos el 100% del tráfico frío de
 * Meta (14 fbclid en /crear, 0 al form). Ahora el usuario llena datos primero
 * y sólo se pide correo al momento de guardar (en el submit del propio form).
 */
export default async function Paso1aPage() {
  const supabase = await createServerSupabase()
  const { data } = await supabase.auth.getUser()
  const isAuthed = Boolean(data.user?.email)

  return (
    <WizardShell current="paso-1a">
      <Paso1aForm isAuthed={isAuthed} />
    </WizardShell>
  )
}
