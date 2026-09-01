import type { AuditCheck, PageSignals } from './types'

/**
 * Recomendaciones AEO en español, generadas por Gemini a partir de los checks.
 *
 * El puntaje NO depende de la IA (sale de las reglas en audit.ts). Aquí solo
 * pedimos priorizar y explicar en lenguaje del dueño, SIN inventar datos del
 * negocio. Si Gemini falla o no hay API key, caemos a recomendaciones derivadas
 * de los propios checks (fallback determinista) para no romper la auditoría.
 */

const GEMINI_MODEL = 'gemini-2.5-flash-lite'
const ENDPOINT = (key: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`

function fallbackRecommendations(checks: AuditCheck[]): string[] {
  return checks
    .filter((c) => c.status !== 'ok')
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 6)
    .map((c) => `${c.label}: ${c.detail}`)
}

function stripToJsonArray(text: string): string {
  let t = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')
  const start = t.indexOf('[')
  const end = t.lastIndexOf(']')
  if (start >= 0 && end > start) t = t.slice(start, end + 1)
  return t.trim()
}

export async function generateRecommendations(
  signals: PageSignals,
  score: number,
  checks: AuditCheck[],
  apiKey: string | undefined,
): Promise<{ recommendations: string[]; model: string | null }> {
  const pending = checks.filter((c) => c.status !== 'ok')
  if (pending.length === 0) {
    return { recommendations: ['Tu sitio ya cumple los puntos clave de AEO. Mantenlo así.'], model: null }
  }
  if (!apiKey) {
    return { recommendations: fallbackRecommendations(checks), model: null }
  }

  const prompt = `Eres un consultor de posicionamiento para buscadores y asistentes de IA (AEO/SEO) que ayuda a dueños de negocios en México.
Con base en la AUDITORÍA de abajo, escribe recomendaciones concretas y accionables, en español mexicano, cálido y sin tecnicismos innecesarios.

REGLAS:
- NO inventes datos del negocio (nombre, servicios, teléfonos). Solo hablas de mejoras técnicas y de contenido de la página.
- Prioriza por impacto: primero lo que más ayuda a que Google y las IAs entiendan y recomienden el sitio.
- Cada recomendación: 1 frase clara que diga QUÉ hacer y POR QUÉ ayuda. Nada de relleno ni marketing barato.
- Máximo 6 recomendaciones.

DATOS DE LA PÁGINA:
- URL: ${signals.url}
- Puntaje AEO actual: ${score}/100

CHECKS PENDIENTES (a mejorar):
${pending.map((c) => `- [${c.status}] ${c.label}: ${c.detail}`).join('\n')}

DEVUELVE ÚNICAMENTE un arreglo JSON de strings (sin texto antes ni después, sin markdown). Ejemplo: ["Recomendación 1", "Recomendación 2"]`

  try {
    const res = await fetch(ENDPOINT(apiKey), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 2048,
          responseMimeType: 'application/json',
        },
      }),
    })
    if (!res.ok) return { recommendations: fallbackRecommendations(checks), model: null }

    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[]
    }
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!raw) return { recommendations: fallbackRecommendations(checks), model: null }

    const parsed = JSON.parse(stripToJsonArray(raw)) as unknown
    if (!Array.isArray(parsed)) return { recommendations: fallbackRecommendations(checks), model: null }

    const recs = parsed
      .map((r) => String(r).trim())
      .filter(Boolean)
      .slice(0, 6)
    return recs.length
      ? { recommendations: recs, model: GEMINI_MODEL }
      : { recommendations: fallbackRecommendations(checks), model: null }
  } catch {
    return { recommendations: fallbackRecommendations(checks), model: null }
  }
}
