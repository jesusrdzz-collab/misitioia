import { createServerSupabase } from '@/lib/supabase/server'
import { EditorWorkspace } from '@/features/editor/components/EditorWorkspace'
import { LoginGate } from '@/features/editor/components/LoginGate'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Crear mi sitio por chat — MiSitio IA',
  robots: { index: false },
}

/**
 * Creación autoservicio en modo AVANZADO (chat con IA). Sprint wizard 3 pasos
 * (6-sep-2026): antes vivía en /crear; ahora es la ruta de "rescate" al chat
 * clásico, enlazada desde el header del wizard. El flujo primario es
 * /crear/paso-1a → paso-1b → paso-2 → paso-3.
 */
export default async function CrearChatPage() {
  const supabase = await createServerSupabase()
  const { data } = await supabase.auth.getUser()

  if (!data.user?.email) {
    return <LoginGate next="/crear-chat" title="Crea tu página con IA" />
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
