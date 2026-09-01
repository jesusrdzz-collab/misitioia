import { createAdminSupabase } from '@/lib/supabase/server'

/**
 * ¿El tenant tiene aprovisionado un `konnex_webchat_token`?
 *
 * Se usa server-side para decidir si se monta el <VictoriaWidget /> en la
 * página pública del sitio. El token NUNCA se envía al navegador: sólo se
 * devuelve un booleano. Mientras no exista token (Konnex no desplegado / sin
 * aprovisionar), el widget no se renderiza y la integración queda inerte.
 */
export async function tenantHasVictoria(tenantId: string): Promise<boolean> {
  if (!tenantId) return false
  const admin = await createAdminSupabase()
  const { data } = await admin
    .from('tenants')
    .select('konnex_webchat_token')
    .eq('id', tenantId)
    .maybeSingle()

  const token = (data as { konnex_webchat_token: string | null } | null)?.konnex_webchat_token
  return Boolean(token)
}
