import { NextResponse, type NextRequest } from 'next/server'
import {
  generateSiteFromLead,
  composeSiteContent,
  persistGeneratedSite,
} from '@/features/generator/generate-site'
import { listCandidateLeads } from '@/features/generator/lead-source'

/**
 * Fase 2 — Endpoint para disparar la generación de sitios.
 *
 * Protegido con GENERATOR_SECRET (header Authorization: Bearer <secret>).
 * Requiere en el entorno: GEMINI_API_KEY, SUPABASE_SERVICE_ROLE_KEY,
 * TERRALEADS_SUPABASE_URL, TERRALEADS_SUPABASE_SERVICE_KEY.
 *
 * Body:
 *   { "leadId": "uuid" }        → genera un sitio
 *   { "batch": 5 }              → genera hasta N sitios de leads candidatos
 */
export const runtime = 'nodejs'
export const maxDuration = 60

function authorized(req: NextRequest): boolean {
  const secret = process.env.GENERATOR_SECRET
  if (!secret) return false
  const auth = req.headers.get('authorization') || ''
  return auth === `Bearer ${secret}`
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'no autorizado' }, { status: 401 })
  }

  let body: { leadId?: string; batch?: number }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'body inválido' }, { status: 400 })
  }

  try {
    if (body.leadId) {
      const result = await generateSiteFromLead(body.leadId)
      return NextResponse.json({ ok: true, site: result })
    }

    if (body.batch && body.batch > 0) {
      const leads = await listCandidateLeads(Math.min(body.batch, 25))
      const results: Array<Record<string, unknown>> = []
      for (const lead of leads) {
        try {
          const composed = await composeSiteContent(lead)
          const site = await persistGeneratedSite(lead, composed)
          results.push({ leadId: lead.id, ok: true, slug: site.slug, url: site.url })
        } catch (e) {
          results.push({ leadId: lead.id, ok: false, error: (e as Error).message })
        }
      }
      return NextResponse.json({ ok: true, count: results.length, results })
    }

    return NextResponse.json({ error: 'especifica leadId o batch' }, { status: 400 })
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 })
  }
}
