import { createAdminSupabase } from '@/lib/supabase/server'

/**
 * Autorización del editor por chat.
 *
 * Un dueño solo puede editar SU sitio. Verificamos que el sitio pertenezca a un
 * tenant cuyo `owner_email` coincide con el email del usuario autenticado.
 * Las escrituras posteriores usan el cliente admin (service_role, bypass RLS)
 * SOLO después de pasar por aquí, y siempre acotadas al siteId autorizado.
 */

export interface AuthorizedSite {
  siteId: string
  tenantId: string
  slug: string
  businessName: string
  giro: string | null
  status: string
}

/**
 * Devuelve los datos del sitio si `userEmail` es su dueño; null si no.
 */
export async function authorizeSiteAccess(
  siteId: string,
  userEmail: string,
): Promise<AuthorizedSite | null> {
  if (!siteId || !userEmail) return null

  const admin = await createAdminSupabase()
  const { data: site } = await admin
    .from('sites')
    .select('id, tenant_id, slug, business_name, giro, status, tenants(owner_email)')
    .eq('id', siteId)
    .maybeSingle()

  if (!site) return null

  const tenant = site.tenants as unknown as { owner_email: string | null } | null
  const owner = tenant?.owner_email?.toLowerCase().trim()
  if (!owner || owner !== userEmail.toLowerCase().trim()) return null

  return {
    siteId: site.id,
    tenantId: site.tenant_id,
    slug: site.slug,
    businessName: site.business_name,
    giro: site.giro,
    status: site.status,
  }
}

/** Lista los sitios que pertenecen a `userEmail` (para el selector del panel). */
export async function listSitesForOwner(userEmail: string): Promise<
  Array<{ siteId: string; slug: string; businessName: string; status: string; giro: string | null }>
> {
  if (!userEmail) return []
  const admin = await createAdminSupabase()

  const { data: tenants } = await admin
    .from('tenants')
    .select('id')
    .eq('owner_email', userEmail.toLowerCase().trim())

  const tenantIds = (tenants ?? []).map((t) => (t as { id: string }).id)
  if (tenantIds.length === 0) return []

  const { data: sites } = await admin
    .from('sites')
    .select('id, slug, business_name, status, giro')
    .in('tenant_id', tenantIds)
    .neq('status', 'dado_de_baja')
    .order('created_at', { ascending: false })

  return (sites ?? []).map((s) => {
    const row = s as { id: string; slug: string; business_name: string; status: string; giro: string | null }
    return {
      siteId: row.id,
      slug: row.slug,
      businessName: row.business_name,
      status: row.status,
      giro: row.giro,
    }
  })
}
