/**
 * Integración "Victoria de regreso" (Konnex ⇄ MiSitio IA).
 *
 * Los sitios hospedados (slug.misitio.site) conectan de regreso a la Victoria
 * central de Konnex a través de un proxy server-side (`/api/victoria`). Este
 * módulo concentra:
 *   - La URL base de Konnex (una sola fuente de verdad, configurable por env).
 *   - Los dos llamados HTTP al backend de Konnex (chat + medidor de uso).
 *
 * ⚠️ INERTE hasta que Konnex despliegue los endpoints y se aprovisione un
 *    `konnex_webchat_token` por tenant. Construido para "just work" al
 *    configurarse. Ver contrato:
 *    ESTUDIO/CONTRATO_VICTORIA_KONNEX_MISITIO_2026-09-01.md
 *
 * El token por-tenant NUNCA se expone al navegador: sólo este módulo (server)
 * y el proxy lo manejan.
 */

/**
 * URL base del backend de Konnex.
 *
 * Default = https://app.konnex.center (producción actual de Konnex/APP VENTAS
 * 247). La URL real se confirma al momento del deploy de Konnex; se puede
 * sobreescribir sin tocar código con la variable de entorno KONNEX_WEBCHAT_BASE.
 */
export const KONNEX_WEBCHAT_BASE = (
  process.env.KONNEX_WEBCHAT_BASE || 'https://app.konnex.center'
).replace(/\/+$/, '')

/** Timeout por defecto para los llamados a Konnex (ms). */
const KONNEX_TIMEOUT_MS = 20_000

/** `fetch` con timeout vía AbortController (server-side). */
async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

// ————————————————————————————————————————————————————————————————
// Chat: POST {KONNEX}/api/webchat/message
// ————————————————————————————————————————————————————————————————

export type VictoriaMessageResult =
  | { ok: true; respuesta: string }
  | { ok: false; error: string; status?: number }

/**
 * Envía un mensaje del visitante a la Victoria del tenant y devuelve su
 * respuesta. `token` es el `konnex_webchat_token` del tenant (server-side).
 */
export async function sendVictoriaMessage(params: {
  token: string
  sessionId: string
  texto: string
  timeoutMs?: number
}): Promise<VictoriaMessageResult> {
  const { token, sessionId, texto, timeoutMs = KONNEX_TIMEOUT_MS } = params

  let res: Response
  try {
    res = await fetchWithTimeout(
      `${KONNEX_WEBCHAT_BASE}/api/webchat/message`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, sessionId, texto }),
        cache: 'no-store',
      },
      timeoutMs,
    )
  } catch (e) {
    const aborted = e instanceof Error && e.name === 'AbortError'
    return { ok: false, error: aborted ? 'victoria_timeout' : 'victoria_unreachable' }
  }

  if (!res.ok) {
    // 400 / 401 / 403 / 429 según el contrato.
    return { ok: false, error: 'victoria_http_error', status: res.status }
  }

  let data: { ok?: boolean; respuesta?: unknown; error?: unknown }
  try {
    data = (await res.json()) as typeof data
  } catch {
    return { ok: false, error: 'victoria_bad_response' }
  }

  const respuesta = typeof data.respuesta === 'string' ? data.respuesta : ''
  if (data.ok && respuesta) return { ok: true, respuesta }

  return {
    ok: false,
    error: typeof data.error === 'string' ? data.error : 'victoria_bad_response',
  }
}

// ————————————————————————————————————————————————————————————————
// Medidor: GET {KONNEX}/api/webchat/usage?token=...
// ————————————————————————————————————————————————————————————————

export type VictoriaUsageResult =
  | { ok: true; tenantId: string; period: string; conversations: number }
  | { ok: false; error: string; status?: number }

/**
 * Consulta el conteo de conversaciones del periodo actual para el tenant.
 * El `token` va como query param del lado servidor (nunca en el navegador).
 */
export async function fetchVictoriaUsage(params: {
  token: string
  timeoutMs?: number
}): Promise<VictoriaUsageResult> {
  const { token, timeoutMs = KONNEX_TIMEOUT_MS } = params

  let res: Response
  try {
    res = await fetchWithTimeout(
      `${KONNEX_WEBCHAT_BASE}/api/webchat/usage?token=${encodeURIComponent(token)}`,
      { method: 'GET', cache: 'no-store' },
      timeoutMs,
    )
  } catch (e) {
    const aborted = e instanceof Error && e.name === 'AbortError'
    return { ok: false, error: aborted ? 'victoria_timeout' : 'victoria_unreachable' }
  }

  if (!res.ok) {
    return { ok: false, error: 'victoria_http_error', status: res.status }
  }

  let data: {
    ok?: boolean
    tenantId?: unknown
    period?: unknown
    conversations?: unknown
    error?: unknown
  }
  try {
    data = (await res.json()) as typeof data
  } catch {
    return { ok: false, error: 'victoria_bad_response' }
  }

  const conversations = typeof data.conversations === 'number' ? data.conversations : NaN
  if (data.ok && !Number.isNaN(conversations)) {
    return {
      ok: true,
      tenantId: typeof data.tenantId === 'string' ? data.tenantId : '',
      period: typeof data.period === 'string' ? data.period : currentUsagePeriod(),
      conversations,
    }
  }

  return {
    ok: false,
    error: typeof data.error === 'string' ? data.error : 'victoria_bad_response',
  }
}

/** Periodo de uso "YYYY-MM" en hora de México (America/Mexico_City). */
export function currentUsagePeriod(): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(new Date())
  const year = parts.find((p) => p.type === 'year')?.value ?? '0000'
  const month = parts.find((p) => p.type === 'month')?.value ?? '01'
  return `${year}-${month}`
}
