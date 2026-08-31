import { createServerSupabase } from '@/lib/supabase/server'
import { EditorWorkspace } from '@/features/editor/components/EditorWorkspace'
import { LoginGate } from '@/features/editor/components/LoginGate'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Crear mi sitio — MiSitio IA', robots: { index: false } }

/**
 * Creación autoservicio: chat en blanco. El negocio describe lo que quiere y el
 * asistente crea el sitio desde cero (tenant + site + contenido), sin depender
 * de TerraLeads. Requiere sesión (magic link) para que el sitio quede a nombre
 * del dueño.
 */
export default async function CrearPage() {
  const supabase = await createServerSupabase()
  const { data } = await supabase.auth.getUser()

  if (!data.user?.email) {
    return <LoginGate next="/crear" title="Crea tu página" />
  }

  return (
    <EditorWorkspace
      mode="create"
      initialSiteId={null}
      initialSlug={null}
      businessName={null}
    />
  )
}
