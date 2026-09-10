import { NextResponse, type NextRequest } from 'next/server'
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase/server'

/**
 * Helpers para autenticar route handlers de la API pública (Bearer o cookie).
 *
 * El middleware YA validó el Bearer contra `api_tokens` y adjuntó:
 *   - x-user-id
 *   - x-api-token-id
 *   - x-api-token-scopes  (csv)
 *
 * Aquí sólo leemos esos headers, o caemos a cookies si no vinieron.
 */

export interface ApiCaller {
  userId: string
  email: string | null
  scopes: string[]
  /** true si vino vía Bearer, false si vino por cookie de sesión. */
  viaBearer: boolean
}

export type ApiScope = 'read' | 'write' | 'admin'

/**
 * Resuelve el llamador. Si viene por Bearer, ya tiene los headers puestos por
 * el middleware. Si no, se busca la sesión por cookie. Nunca lanza; devuelve
 * un Response 401/403 si falla.
 */
export async function requireApiCaller(
  req: NextRequest,
  requiredScope: ApiScope = 'read',
): Promise<ApiCaller | NextResponse> {
  const tokenId = req.headers.get('x-api-token-id')

  if (tokenId) {
    const userId = req.headers.get('x-user-id')
    const scopesCsv = req.headers.get('x-api-token-scopes') ?? ''
    const scopes = scopesCsv
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    if (!userId) {
      return NextResponse.json({ error: 'Token inválido.' }, { status: 401 })
    }
    if (!hasScope(scopes, requiredScope)) {
      return NextResponse.json(
        { error: `El token no tiene el permiso "${requiredScope}".` },
        { status: 403 },
      )
    }
    // Email opcional — no bloqueamos si no logramos leerlo.
    const admin = await createAdminSupabase()
    const { data: userRow } = await admin.auth.admin.getUserById(userId)
    return {
      userId,
      email: userRow?.user?.email ?? null,
      scopes,
      viaBearer: true,
    }
  }

  const supabase = await createServerSupabase()
  const { data } = await supabase.auth.getUser()
  const user = data.user
  if (!user) {
    return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
  }
  return {
    userId: user.id,
    email: user.email ?? null,
    // Sesión con cookies → acceso pleno (equivalente a admin).
    scopes: ['read', 'write', 'admin'],
    viaBearer: false,
  }
}

function hasScope(scopes: string[], required: ApiScope): boolean {
  if (scopes.includes('admin')) return true
  return scopes.includes(required)
}

/**
 * Autoriza que el `siteId` pertenece al usuario del llamador, buscando por
 * `owner_email` en `tenants`. Devuelve el sitio o un Response 403/404.
 *
 * Reutilizamos el mismo modelo que `authorizeSiteAccess` del editor (el sitio
 * pertenece al tenant, y el tenant tiene un owner_email). El Bearer también
 * usa el email del user de auth para hacer el match.
 */
export async function authorizeSiteForCaller(
  caller: ApiCaller,
  siteId: string,
): Promise<
  | { ok: true; siteId: string; tenantId: string; slug: string }
  | NextResponse
> {
  const admin = await createAdminSupabase()

  // Prefer email (matches tenants.owner_email); fallback ninguno si no hay.
  if (!caller.email) {
    return NextResponse.json(
      { error: 'La cuenta no tiene correo asociado.' },
      { status: 403 },
    )
  }

  const { data: site } = await admin
    .from('sites')
    .select('id, tenant_id, slug, tenants(owner_email)')
    .eq('id', siteId)
    .maybeSingle()

  if (!site) {
    return NextResponse.json({ error: 'Sitio no encontrado.' }, { status: 404 })
  }

  const tenant = site.tenants as unknown as { owner_email: string | null } | null
  const owner = tenant?.owner_email?.toLowerCase().trim()
  if (!owner || owner !== caller.email.toLowerCase().trim()) {
    return NextResponse.json(
      { error: 'No tienes acceso a este sitio.' },
      { status: 403 },
    )
  }

  return { ok: true, siteId: site.id, tenantId: site.tenant_id, slug: site.slug }
}
