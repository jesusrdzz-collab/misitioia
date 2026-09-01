import type { EmbedAudit, EmbedSite, PageSignals } from './types'

/**
 * Victoria para el widget embebido (Fase 8).
 *
 * Chat acotado al conocimiento del sitio del cliente. Para el MVP, el
 * conocimiento sale de la última auditoría (título, descripción, encabezados,
 * muestra de texto) + el nombre y dominio del embed_site. Victoria responde
 * SOLO con eso; si no sabe algo, lo dice y ofrece que dejen sus datos, en vez
 * de inventar. Modelo: gemini-2.5-flash-lite (mismo que Konnex).
 */

const GEMINI_MODEL = 'gemini-2.5-flash-lite'
const ENDPOINT = (key: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`

export interface WebchatMessage {
  role: 'user' | 'assistant'
  content: string
}

function knowledgeFromAudit(audit: EmbedAudit | null): string {
  if (!audit) return 'Aún no tengo un resumen del sitio.'
  const s = (audit.signals || {}) as Partial<PageSignals>
  const parts: string[] = []
  if (s.title) parts.push(`Título del sitio: ${s.title}`)
  if (s.metaDescription) parts.push(`Descripción: ${s.metaDescription}`)
  if (Array.isArray(s.h1) && s.h1.length) parts.push(`Encabezado principal: ${s.h1.join(' / ')}`)
  if (Array.isArray(s.h2) && s.h2.length) parts.push(`Secciones: ${s.h2.slice(0, 8).join(', ')}`)
  if (s.textSample) parts.push(`Extracto del contenido: ${String(s.textSample).slice(0, 1200)}`)
  return parts.join('\n') || 'Aún no tengo un resumen del sitio.'
}

function buildSystemPrompt(site: EmbedSite, audit: EmbedAudit | null): string {
  return `Eres Victoria, la asistente virtual del sitio "${site.name}"${
    site.origin ? ` (${site.origin})` : ''
  }. Atiendes a las personas que visitan la página.

REGLAS INVIOLABLES:
- Hablas español mexicano, cálido, breve y servicial. Nada de marketing barato.
- Respondes con base en el CONOCIMIENTO DEL SITIO de abajo. Si te preguntan algo que no está ahí (precios, disponibilidad, datos que no aparecen), NO lo inventes: dilo con honestidad y ofrece tomar sus datos (nombre y teléfono/correo) para que el negocio le contacte.
- No prometas cosas que el sitio no dice. No inventes servicios, precios ni horarios.
- Si detectas intención de compra o contacto, guía a la persona a dejar sus datos o a usar los medios de contacto del sitio.
- Respuestas cortas (1–3 frases). Una pregunta a la vez.

CONOCIMIENTO DEL SITIO:
${knowledgeFromAudit(audit)}`
}

/**
 * Corre un turno de Victoria embebida. Devuelve el texto de respuesta.
 */
export async function runWebchat(args: {
  apiKey: string
  site: EmbedSite
  audit: EmbedAudit | null
  history: WebchatMessage[]
  message: string
}): Promise<string> {
  const { apiKey, site, audit, history, message } = args
  if (!apiKey) throw new Error('GEMINI_API_KEY no configurada')

  const contents = history.slice(-12).map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))
  contents.push({ role: 'user', parts: [{ text: message }] })

  const res = await fetch(ENDPOINT(apiKey), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: buildSystemPrompt(site, audit) }] },
      contents,
      generationConfig: { temperature: 0.6, maxOutputTokens: 1024 },
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Gemini HTTP ${res.status}: ${body.slice(0, 200)}`)
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[]
  }
  const reply = data.candidates?.[0]?.content?.parts?.map((p) => p.text).filter(Boolean).join(' ')
  return (reply || '').trim() || 'Con gusto te ayudo. ¿Me repites tu pregunta?'
}
