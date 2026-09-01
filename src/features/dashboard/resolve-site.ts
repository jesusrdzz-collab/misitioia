import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { authorizeSiteAccess, listSitesForOwner, type AuthorizedSite } from '@/features/editor/authorize'

/**
 * Resuelve el sitio activo para las páginas del panel, replicando la lógica de
 * /editar:
 *   - Sin sesión → { status: 'no-auth' } (la página muestra LoginGate).
 *   - ?site=<id> autorizado → ese sitio.
 *   - Un solo sitio del dueño → ese sitio.
 *   - Ninguno o varios (ambiguo) → redirige a /editar para elegir/crear.
 */
export type ResolvedSite =
  | { status: 'no-auth' }
  | { status: 'ok'; email: string; site: AuthorizedSite }

export async function resolveDashboardSite(siteParam?: string): Promise<ResolvedSite> {
  const supabase = await createServerSupabase()
  const { data } = await supabase.auth.getUser()
  const email = data.user?.email
  if (!email) return { status: 'no-auth' }

  if (siteParam) {
    const authorized = await authorizeSiteAccess(siteParam, email)
    if (authorized) return { status: 'ok', email, site: authorized }
  }

  const sites = await listSitesForOwner(email)
  if (sites.length === 1) {
    const authorized = await authorizeSiteAccess(sites[0].siteId, email)
    if (authorized) return { status: 'ok', email, site: authorized }
  }

  // Sin sitios o ambiguo → que /editar resuelva (selector / reclamar / crear).
  redirect('/editar')
}
