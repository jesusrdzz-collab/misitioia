/**
 * Atribución de campañas (fbclid + UTMs) para Meta MiSitio.
 *
 * El anuncio de Meta manda al visitante con `?fbclid=...` y opcionalmente
 * `?utm_source=...&utm_campaign=...&utm_content=...`. Guardamos esos valores
 * en cookies (30 días) para poder "sellar" el signup / la creación de sitio
 * con el anuncio que trajo al usuario, aunque tarde días en registrarse.
 *
 * Cero PII: solo IDs opacos de campaña.
 */

import type { NextRequest, NextResponse } from 'next/server'
import { cookies as nextCookies } from 'next/headers'

export const ATTRIBUTION_COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 días

export const ATTRIBUTION_COOKIES = {
  fbclid: '_mis_fbclid',
  utmSource: '_mis_utm_source',
  utmMedium: '_mis_utm_medium',
  utmCampaign: '_mis_utm_campaign',
  utmContent: '_mis_utm_content',
  utmTerm: '_mis_utm_term',
  sid: '_mis_sid',
  landingAt: '_mis_land_at',
} as const

export interface AttributionData {
  fbclid: string | null
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  utmContent: string | null
  utmTerm: string | null
  landingAt: string | null
  sessionId: string | null
}

/** Lee del querystring de un request cualquier fbclid/utm que venga. */
export function readAttributionFromUrl(request: NextRequest): Partial<AttributionData> {
  const p = request.nextUrl.searchParams
  const pick = (k: string) => {
    const v = p.get(k)
    return v && v.length > 0 && v.length <= 500 ? v : null
  }
  return {
    fbclid: pick('fbclid'),
    utmSource: pick('utm_source'),
    utmMedium: pick('utm_medium'),
    utmCampaign: pick('utm_campaign'),
    utmContent: pick('utm_content'),
    utmTerm: pick('utm_term'),
  }
}

function newSessionId(): string {
  // 128-bit random hex, cheap and unique enough para agrupar hits de una visita
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Escribe (si vienen) las cookies de atribución en la respuesta del middleware.
 * También garantiza que exista `_mis_sid` para agrupar hits de la sesión.
 */
export function stampAttributionCookies(
  request: NextRequest,
  response: NextResponse,
): NextResponse {
  const attr = readAttributionFromUrl(request)
  const opts = {
    httpOnly: false, // El cliente NO necesita leerla; pero non-httpOnly permite un debug fácil desde DevTools sin exponer nada sensible (son IDs opacos de campaña).
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ATTRIBUTION_COOKIE_MAX_AGE,
  }

  const set = (name: string, value: string | null | undefined) => {
    if (!value) return
    response.cookies.set(name, value, opts)
  }

  if (attr.fbclid) {
    set(ATTRIBUTION_COOKIES.fbclid, attr.fbclid)
    set(ATTRIBUTION_COOKIES.landingAt, new Date().toISOString())
  }
  set(ATTRIBUTION_COOKIES.utmSource, attr.utmSource)
  set(ATTRIBUTION_COOKIES.utmMedium, attr.utmMedium)
  set(ATTRIBUTION_COOKIES.utmCampaign, attr.utmCampaign)
  set(ATTRIBUTION_COOKIES.utmContent, attr.utmContent)
  set(ATTRIBUTION_COOKIES.utmTerm, attr.utmTerm)

  // sid — si no existe ya, lo creamos
  const existingSid = request.cookies.get(ATTRIBUTION_COOKIES.sid)?.value
  if (!existingSid) {
    response.cookies.set(ATTRIBUTION_COOKIES.sid, newSessionId(), {
      ...opts,
      maxAge: 60 * 60 * 24 * 365, // 1 año — para hilar visitas del mismo navegador
    })
  }

  return response
}

/**
 * Lectura de la atribución guardada en cookies desde un Server Action /
 * Server Component. Devuelve los IDs que se guardaron en la primera visita.
 */
export async function readStoredAttribution(): Promise<AttributionData> {
  const c = await nextCookies()
  const get = (k: string) => c.get(k)?.value ?? null
  return {
    fbclid: get(ATTRIBUTION_COOKIES.fbclid),
    utmSource: get(ATTRIBUTION_COOKIES.utmSource),
    utmMedium: get(ATTRIBUTION_COOKIES.utmMedium),
    utmCampaign: get(ATTRIBUTION_COOKIES.utmCampaign),
    utmContent: get(ATTRIBUTION_COOKIES.utmContent),
    utmTerm: get(ATTRIBUTION_COOKIES.utmTerm),
    landingAt: get(ATTRIBUTION_COOKIES.landingAt),
    sessionId: get(ATTRIBUTION_COOKIES.sid),
  }
}

/**
 * HMAC-SHA-256 opcional para hashear IPs. Salt via env `HIT_IP_SALT`.
 * Sin salt configurado, devuelve null (mejor no guardar que guardar mal).
 */
export async function hashIp(ip: string | null | undefined): Promise<string | null> {
  if (!ip) return null
  const salt = process.env.HIT_IP_SALT
  if (!salt) return null
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(salt),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(ip))
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, '0')).join('')
}
