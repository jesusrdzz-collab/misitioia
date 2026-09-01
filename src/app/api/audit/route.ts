import type { NextRequest } from 'next/server'
import { corsJson, corsPreflight } from '@/features/embed/cors'
import { getEmbedSiteByToken, rememberOrigin, saveAudit } from '@/features/embed/store'
import { runAudit } from '@/features/embed/audit'
import { generateRecommendations } from '@/features/embed/recommendations'
import type { PageSignals } from '@/features/embed/types'

/**
 * Auditoría AEO del sitio del cliente (Fase 8). CORS abierto: el widget la llama
 * desde el dominio del cliente. Read-only: recibe señales del DOM, calcula un
 * puntaje por reglas, pide recomendaciones a Gemini y guarda el reporte.
 * NO modifica el sitio del cliente.
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export function OPTIONS() {
  return corsPreflight()
}

function normalizeSignals(raw: unknown, fallbackUrl: string): PageSignals {
  const s = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const arr = (v: unknown, n: number): string[] =>
    Array.isArray(v) ? v.map((x) => String(x).slice(0, 200)).slice(0, n) : []
  const url = String(s.url || fallbackUrl || '')
  let origin = String(s.origin || '')
  if (!origin && url) {
    try { origin = new URL(url).origin } catch { origin = '' }
  }
  return {
    url,
    origin,
    title: s.title != null ? String(s.title).slice(0, 300) : null,
    metaDescription: s.metaDescription != null ? String(s.metaDescription).slice(0, 500) : null,
    canonical: s.canonical != null ? String(s.canonical).slice(0, 500) : null,
    lang: s.lang != null ? String(s.lang).slice(0, 20) : null,
    h1: arr(s.h1, 5),
    h2: arr(s.h2, 12),
    jsonLdCount: Number.isFinite(Number(s.jsonLdCount)) ? Number(s.jsonLdCount) : 0,
    jsonLdTypes: arr(s.jsonLdTypes, 10),
    hasLlmsTxt: !!s.hasLlmsTxt,
    hasViewport: !!s.hasViewport,
    hasOgTitle: !!s.hasOgTitle,
    hasOgImage: !!s.hasOgImage,
    isHttps: !!s.isHttps,
    wordCount: Number.isFinite(Number(s.wordCount)) ? Number(s.wordCount) : 0,
    textSample: s.textSample != null ? String(s.textSample).slice(0, 1500) : '',
  }
}

export async function POST(req: NextRequest) {
  let body: { token?: string; url?: string; signals?: unknown }
  try {
    body = await req.json()
  } catch {
    return corsJson({ error: 'JSON inválido' }, 400)
  }

  const site = await getEmbedSiteByToken(String(body.token || ''))
  if (!site) return corsJson({ error: 'Token inválido' }, 401)

  const signals = normalizeSignals(body.signals, String(body.url || ''))
  const { score, checks } = runAudit(signals)

  const { recommendations, model } = await generateRecommendations(
    signals,
    score,
    checks,
    process.env.GEMINI_API_KEY,
  )

  const fails = checks.filter((c) => c.status === 'fail').length
  const warns = checks.filter((c) => c.status === 'warn').length
  const summary =
    `Puntaje AEO: ${score}/100. ` +
    (fails === 0 && warns === 0
      ? 'El sitio cumple los puntos clave para buscadores e IA.'
      : `${fails} problema(s) crítico(s) y ${warns} mejora(s) recomendada(s).`)

  const report = { score, checks, recommendations, summary, model }

  try {
    await rememberOrigin(site.id, signals.origin || null)
    await saveAudit({ embedSiteId: site.id, url: signals.url || null, signals, report })
  } catch {
    // No romper la respuesta al widget si falla el guardado.
  }

  return corsJson({ ok: true, score, summary, recommendations })
}
