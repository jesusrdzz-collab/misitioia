import type { LeadForGeneration, ServiceItem } from '@/lib/types/site'

/**
 * Redacción de los textos del sitio con Gemini.
 *
 * Reimplementa el PATRÓN de `REPOS EXTERNOS/ai-lead-gen` (sales-agent.ts):
 * prompt en español latino, reglas anti-marketing-barato, ejemplos, y salida
 * acotada. Aquí lo extendemos de una "línea rompehielo" a los textos completos
 * del sitio.
 *
 * REGLA NO NEGOCIABLE (heredada del PROJECT_BRIEF):
 *   Gemini REDACTA, no INVENTA. Solo puede usar los datos verificados que se le
 *   pasan. Si un dato no está en la ficha, no se menciona. Prohibido inventar
 *   servicios, precios, años de experiencia, premios o promesas.
 */

const GEMINI_MODEL = 'gemini-2.5-flash'
const GEMINI_ENDPOINT = (model: string, key: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`

export interface GeneratedCopy {
  hero_title: string
  hero_subtitle: string
  about_text: string
  services: ServiceItem[]
  highlights: string[]
  meta_title: string
  meta_description: string
}

function buildPrompt(lead: LeadForGeneration, giroNombre: string): string {
  const ubicacion = [lead.zona, lead.ciudad, lead.estado]
    .filter(Boolean)
    .join(', ')

  // Solo datos VERIFICADOS. Lo que no existe, se marca como "no disponible"
  // para que el modelo sepa que NO debe mencionarlo.
  const ficha = {
    nombre_negocio: lead.business_name,
    giro: giroNombre,
    categoria_google: lead.categoria_google || 'no disponible',
    ubicacion: ubicacion || 'no disponible',
    telefono: lead.phone_primary || 'no disponible',
    calificacion: lead.rating != null ? `${lead.rating} de 5` : 'no disponible',
    numero_de_resenas: lead.reviews_count != null ? String(lead.reviews_count) : 'no disponible',
  }

  return `ERES UN COPYWRITER PROFESIONAL DE SITIOS WEB PARA NEGOCIOS LOCALES DE MÉXICO.
Tu trabajo es redactar los textos del sitio web de un negocio a partir ÚNICAMENTE de su ficha verificada de Google.

⛔ REGLA ABSOLUTA E INVIOLABLE: REDACTAS, NO INVENTAS.
- Usa SOLO los datos de la FICHA de abajo. Está prohibido inventar servicios, productos, precios, años de experiencia, número de empleados, premios, certificaciones, marcas, promesas o cualquier dato que no esté en la ficha.
- Si un campo dice "no disponible", NO lo menciones ni lo insinúes. No rellenes con supuestos.
- Los "servicios" que generes deben ser los TÍPICOS y genéricos del giro (${ficha.giro}), redactados de forma neutral, SIN afirmar que este negocio en particular los ofrece todos ni prometer resultados. Preséntalos como "lo que suele ofrecer un negocio de este giro", en lenguaje natural.

TONO:
- Cálido, cercano y profesional. Español de México, natural, como habla un negocio de barrio bien hecho.
- PROHIBIDO el marketing barato: nada de "lleva tu negocio al siguiente nivel", "potencia", "somos los mejores", "líderes indiscutibles", signos de exclamación exagerados, ni superlativos vacíos.
- Frases cortas. Concreto sobre el negocio y su ubicación.

FICHA VERIFICADA DEL NEGOCIO:
${JSON.stringify(ficha, null, 2)}

DEVUELVE ÚNICAMENTE un objeto JSON válido (sin texto antes ni después, sin bloques de código markdown) con EXACTAMENTE esta forma:
{
  "hero_title": "string — 4 a 8 palabras. El nombre del negocio o su promesa central honesta.",
  "hero_subtitle": "string — 1 frase, máx 20 palabras. Qué es y dónde está, sin exagerar.",
  "about_text": "string — 2 a 4 frases sobre el negocio basadas SOLO en la ficha (giro, ubicación, y si hay, su reputación por reseñas). Nada inventado.",
  "services": [ { "name": "string corto", "description": "1 frase neutral", "icon": "1 emoji relevante" } ],
  "highlights": [ "string — 3 a 4 puntos cortos y verdaderos derivados de la ficha (ej: ubicación, calificación si existe). Sin inventar." ],
  "meta_title": "string — título SEO, máx 60 caracteres, incluye nombre y ciudad si hay.",
  "meta_description": "string — descripción SEO honesta, máx 155 caracteres."
}

Para "services" genera entre 3 y 6 elementos típicos del giro. Si el giro no permite inferir servicios con seguridad, usa categorías amplias y neutrales.`
}

function stripToJson(text: string): string {
  let t = text.trim()
  // Quitar fences ```json ... ```
  t = t.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')
  const start = t.indexOf('{')
  const end = t.lastIndexOf('}')
  if (start >= 0 && end > start) t = t.slice(start, end + 1)
  return t.trim()
}

/**
 * Llama a Gemini y devuelve los textos del sitio.
 * Lanza si la API falla o devuelve JSON no parseable.
 */
export async function generateCopy(
  lead: LeadForGeneration,
  giroNombre: string,
  apiKey: string,
): Promise<{ copy: GeneratedCopy; model: string }> {
  if (!apiKey) throw new Error('GEMINI_API_KEY no configurada')

  const prompt = buildPrompt(lead, giroNombre)

  const res = await fetch(GEMINI_ENDPOINT(GEMINI_MODEL, apiKey), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
      },
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Gemini HTTP ${res.status}: ${body.slice(0, 300)}`)
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[]
  }
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!raw) throw new Error('Gemini no devolvió texto')

  let parsed: GeneratedCopy
  try {
    parsed = JSON.parse(stripToJson(raw)) as GeneratedCopy
  } catch {
    throw new Error(`Gemini devolvió JSON inválido: ${raw.slice(0, 300)}`)
  }

  // Saneado defensivo
  const copy: GeneratedCopy = {
    hero_title: String(parsed.hero_title || lead.business_name).slice(0, 120),
    hero_subtitle: String(parsed.hero_subtitle || '').slice(0, 220),
    about_text: String(parsed.about_text || '').slice(0, 1200),
    services: Array.isArray(parsed.services)
      ? parsed.services.slice(0, 8).map((s) => ({
          name: String(s?.name || '').slice(0, 80),
          description: s?.description ? String(s.description).slice(0, 240) : null,
          icon: s?.icon ? String(s.icon).slice(0, 8) : null,
        }))
      : [],
    highlights: Array.isArray(parsed.highlights)
      ? parsed.highlights.slice(0, 6).map((h) => String(h).slice(0, 160))
      : [],
    meta_title: String(parsed.meta_title || lead.business_name).slice(0, 70),
    meta_description: String(parsed.meta_description || '').slice(0, 160),
  }

  return { copy, model: GEMINI_MODEL }
}
