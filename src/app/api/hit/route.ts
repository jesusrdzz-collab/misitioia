/**
 * POST /api/hit — instrumentación anónima de tráfico para la campaña Meta.
 *
 * Llamado desde el <HitBeacon /> del root layout justo después de mount.
 * Cero PII: solo IDs opacos (fbclid/utm), path, referer y hash HMAC de IP.
 * Escribe en public.visitor_hits usando el service_role (RLS revoked).
 *
 * Cuerpo JSON:
 * { event_type?: 'pageview'|'victoria_open'|'victoria_signup_redirect',
 *   path: string, referer?: string }
 *
 * Todo lo demás (fbclid/utms/session_id/user_agent/ip) se lee del server.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createAdminSupabase } from '@/lib/supabase/server'
import { ATTRIBUTION_COOKIES, hashIp } from '@/lib/attribution'

export const runtime = 'nodejs' // crypto.subtle en Node runtime (para HMAC)

const bodySchema = z.object({
  event_type: z
    .enum(['pageview', 'victoria_open', 'victoria_signup_redirect'])
    .default('pageview'),
  path: z.string().max(500).default('/'),
  referer: z.string().max(1000).optional().nullable(),
})

function pickIp(req: NextRequest): string | null {
  // Vercel manda x-forwarded-for; el primero es el cliente.
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0]?.trim() || null
  const real = req.headers.get('x-real-ip')
  return real || null
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let payload: z.infer<typeof bodySchema>
  try {
    const raw = await req.json()
    payload = bodySchema.parse(raw)
  } catch {
    // No devolvemos detalles — beacon fire-and-forget
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const c = req.cookies
  const cookieGet = (k: string) => c.get(k)?.value ?? null

  const ua = req.headers.get('user-agent') || null
  // truncamos UA a 512 chars por sanidad
  const uaTrimmed = ua && ua.length > 512 ? ua.slice(0, 512) : ua

  const ipHash = await hashIp(pickIp(req))

  const row = {
    event_type: payload.event_type,
    fbclid: cookieGet(ATTRIBUTION_COOKIES.fbclid),
    utm_source: cookieGet(ATTRIBUTION_COOKIES.utmSource),
    utm_medium: cookieGet(ATTRIBUTION_COOKIES.utmMedium),
    utm_campaign: cookieGet(ATTRIBUTION_COOKIES.utmCampaign),
    utm_content: cookieGet(ATTRIBUTION_COOKIES.utmContent),
    utm_term: cookieGet(ATTRIBUTION_COOKIES.utmTerm),
    path: payload.path.slice(0, 500),
    referer: payload.referer?.slice(0, 1000) ?? null,
    ip_hash: ipHash,
    user_agent: uaTrimmed,
    session_id: cookieGet(ATTRIBUTION_COOKIES.sid),
  }

  const admin = await createAdminSupabase()
  const { error } = await admin.from('visitor_hits').insert(row)
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ ok: false, error: 'POST only' }, { status: 405 })
}
