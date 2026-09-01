import type { NextRequest } from 'next/server'
import { corsJson, corsPreflight } from '@/features/embed/cors'
import { getEmbedSiteByToken, getLatestAudit } from '@/features/embed/store'
import { runWebchat, type WebchatMessage } from '@/features/embed/webchat'

/**
 * Chat de Victoria para el widget embebido (Fase 8). CORS abierto: lo consume el
 * widget desde el dominio del cliente. Acotado por token → embed_site.
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export function OPTIONS() {
  return corsPreflight()
}

function sanitizeHistory(raw: unknown): WebchatMessage[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((m): m is { role: string; content: string } =>
      !!m && typeof m === 'object' && 'role' in m && 'content' in m,
    )
    .map<WebchatMessage>((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content).slice(0, 2000),
    }))
    .slice(-16)
}

export async function POST(req: NextRequest) {
  let body: { token?: string; messages?: unknown; message?: string }
  try {
    body = await req.json()
  } catch {
    return corsJson({ error: 'JSON inválido' }, 400)
  }

  const token = String(body.token || '')
  const site = await getEmbedSiteByToken(token)
  if (!site) return corsJson({ error: 'Token inválido' }, 401)

  const history = sanitizeHistory(body.messages)
  // El último mensaje del usuario es el que se responde; si viene `message`, tiene prioridad.
  let message = String(body.message || '').slice(0, 2000).trim()
  if (!message && history.length && history[history.length - 1].role === 'user') {
    message = history.pop()!.content
  }
  if (!message) return corsJson({ error: 'Mensaje vacío' }, 400)

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return corsJson({ reply: 'El asistente aún no está configurado. Intenta más tarde.' }, 200)

  try {
    const audit = await getLatestAudit(site.id)
    const reply = await runWebchat({ apiKey, site, audit, history, message })
    return corsJson({ reply })
  } catch (e) {
    return corsJson({ error: (e as Error).message, reply: 'Perdón, no pude responder ahora.' }, 200)
  }
}
