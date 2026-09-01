/**
 * Conexión de dominios personalizados con la API de Vercel.
 *
 * Este módulo es SOLO de servidor (usa el token secreto de Vercel). Se llama
 * desde Server Actions (`saveCustomDomain`, `refreshDomainStatus`) y desde el
 * Server Component de la página de dominio. NUNCA debe importarse en un
 * componente cliente.
 *
 * Variables de entorno (las configura el dueño del proyecto en Vercel):
 *   - VERCEL_API_TOKEN   → token personal/equipo con permiso sobre el proyecto.
 *   - VERCEL_PROJECT_ID  → id del proyecto `misitioia` (prj_...).
 *   - VERCEL_TEAM_ID     → id del equipo (team_...), se manda como ?teamId=.
 *
 * DEGRADACIÓN GRACIOSA: si falta el token/projectId, todas las funciones
 * devuelven un estado `no-configurado` en vez de lanzar. Así el panel sigue
 * funcionando (guarda el dominio en BD y muestra instrucciones manuales)
 * aunque el token todavía no exista.
 */

const VERCEL_API = 'https://api.vercel.com'

// Valores estándar de Vercel para apuntar el DNS del cliente.
const VERCEL_A_IP = '76.76.21.21'
const VERCEL_CNAME_TARGET = 'cname.vercel-dns.com'

/** Un registro DNS que el cliente debe crear en su proveedor. */
export interface DnsRecord {
  type: 'A' | 'CNAME' | 'TXT'
  /** Host/Nombre del registro: '@' para el apex, 'www', '_vercel', etc. */
  name: string
  value: string
  /** Motivo (para retos de verificación de propiedad). */
  reason?: string
}

/** Estado de conexión de un dominio con Vercel, listo para el panel. */
export type DomainStatus =
  | { state: 'no-configurado' }
  | { state: 'error'; message: string }
  | {
      state: 'pendiente' | 'verificado'
      verified: boolean
      /** true si el DNS aún no apunta correctamente a Vercel. */
      misconfigured: boolean
      /** Registros DNS que el cliente debe agregar. */
      records: DnsRecord[]
    }

interface VercelConfig {
  token: string
  projectId: string
  teamId?: string
}

/** Lee la configuración de env; null si el token no está disponible. */
function readConfig(): VercelConfig | null {
  const token = process.env.VERCEL_API_TOKEN
  const projectId = process.env.VERCEL_PROJECT_ID
  const teamId = process.env.VERCEL_TEAM_ID
  if (!token || !projectId) return null
  return { token, projectId, teamId: teamId || undefined }
}

/** ¿Está lista la integración con Vercel? (token + projectId presentes). */
export function isVercelConfigured(): boolean {
  return readConfig() !== null
}

/** Agrega ?teamId= (o &teamId=) si hay equipo configurado. */
function withTeam(path: string, teamId?: string): string {
  if (!teamId) return path
  const sep = path.includes('?') ? '&' : '?'
  return `${path}${sep}teamId=${encodeURIComponent(teamId)}`
}

async function vercelFetch(
  cfg: VercelConfig,
  path: string,
  init?: RequestInit,
): Promise<Response> {
  return fetch(`${VERCEL_API}${withTeam(path, cfg.teamId)}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    // Nunca cachear respuestas de la API de Vercel.
    cache: 'no-store',
  })
}

// —— Shapes parciales de la API de Vercel (solo lo que usamos) ——

interface VercelVerification {
  type?: string
  domain?: string
  value?: string
  reason?: string
}

interface VercelDomainResponse {
  name?: string
  verified?: boolean
  verification?: VercelVerification[]
  error?: { code?: string; message?: string }
}

interface VercelConfigResponse {
  misconfigured?: boolean
  recommendedIPv4?: Array<{ value?: string[] }> | string[]
  recommendedCNAME?: Array<{ value?: string }> | string[]
  error?: { code?: string; message?: string }
}

/**
 * Adjunta el dominio al proyecto de Vercel para que Vercel lo sirva.
 * Idempotente: si el dominio ya está en el proyecto, se considera éxito.
 */
export async function addDomainToProject(
  domain: string,
): Promise<{ ok: boolean; error?: string; alreadyExists?: boolean }> {
  const cfg = readConfig()
  if (!cfg) return { ok: false, error: 'no-configurado' }

  try {
    const res = await vercelFetch(cfg, `/v10/projects/${cfg.projectId}/domains`, {
      method: 'POST',
      body: JSON.stringify({ name: domain }),
    })

    if (res.ok) return { ok: true }

    const body = (await res.json().catch(() => null)) as VercelDomainResponse | null
    const code = body?.error?.code

    // El dominio ya pertenece a este proyecto → tratar como éxito.
    if (
      res.status === 409 ||
      code === 'domain_already_in_use_by_this_project' ||
      code === 'domain_already_exists'
    ) {
      return { ok: true, alreadyExists: true }
    }

    return { ok: false, error: body?.error?.message || `Vercel respondió ${res.status}` }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Error de red con Vercel' }
  }
}

/**
 * Quita el dominio del proyecto de Vercel. Best-effort: nunca lanza y los
 * fallos se ignoran (el dominio ya se borró de la BD de todas formas).
 */
export async function removeDomainFromProject(domain: string): Promise<void> {
  const cfg = readConfig()
  if (!cfg) return
  try {
    await vercelFetch(cfg, `/v9/projects/${cfg.projectId}/domains/${domain}`, {
      method: 'DELETE',
    })
  } catch {
    // Ignorado a propósito: es una limpieza opcional.
  }
}

/** Deriva el nombre/host relativo de un registro respecto al dominio raíz. */
function relativeName(recordDomain: string | undefined, rootDomain: string): string {
  if (!recordDomain || recordDomain === rootDomain) return '@'
  return recordDomain.endsWith(`.${rootDomain}`)
    ? recordDomain.slice(0, -(rootDomain.length + 1))
    : recordDomain
}

/**
 * Construye el registro DNS de enrutamiento recomendado.
 * - Apex (minegocio.com)      → A @ 76.76.21.21
 * - Subdominio (www.mineg...) → CNAME <label> cname.vercel-dns.com
 */
function routingRecord(domain: string): DnsRecord {
  const isSubdomain = domain.split('.').length > 2
  if (isSubdomain) {
    const label = domain.slice(0, domain.indexOf('.'))
    return { type: 'CNAME', name: label, value: VERCEL_CNAME_TARGET }
  }
  return { type: 'A', name: '@', value: VERCEL_A_IP }
}

/**
 * Lee el estado real del dominio en Vercel: si está verificado y qué registros
 * DNS necesita el cliente. Combina el objeto de dominio (retos de verificación)
 * con /config (flag misconfigured).
 */
export async function getDomainStatus(domain: string): Promise<DomainStatus> {
  const cfg = readConfig()
  if (!cfg) return { state: 'no-configurado' }

  try {
    const [domainRes, configRes] = await Promise.all([
      vercelFetch(cfg, `/v9/projects/${cfg.projectId}/domains/${domain}`),
      vercelFetch(cfg, `/v9/projects/${cfg.projectId}/domains/${domain}/config`),
    ])

    const domainBody = (await domainRes.json().catch(() => null)) as VercelDomainResponse | null

    if (!domainRes.ok || !domainBody) {
      const message = domainBody?.error?.message || `Vercel respondió ${domainRes.status}`
      return { state: 'error', message }
    }

    const configBody = (await configRes.json().catch(() => null)) as VercelConfigResponse | null
    const misconfigured = configBody?.misconfigured ?? false
    const verified = domainBody.verified ?? false

    // Registros de verificación de propiedad (TXT/CNAME que pide Vercel).
    const verificationRecords: DnsRecord[] = (domainBody.verification ?? [])
      .filter((v): v is VercelVerification & { value: string } => Boolean(v.value))
      .map((v) => ({
        type: (v.type?.toUpperCase() as DnsRecord['type']) || 'TXT',
        name: relativeName(v.domain, domain),
        value: v.value,
        reason: v.reason,
      }))

    // El registro de enrutamiento (A/CNAME) siempre se muestra.
    const records: DnsRecord[] = [routingRecord(domain), ...verificationRecords]

    return {
      state: verified ? 'verificado' : 'pendiente',
      verified,
      misconfigured,
      records,
    }
  } catch (err) {
    return { state: 'error', message: err instanceof Error ? err.message : 'Error de red con Vercel' }
  }
}
