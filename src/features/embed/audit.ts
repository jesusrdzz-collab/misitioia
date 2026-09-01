import type { AuditCheck, PageSignals } from './types'

/**
 * Motor de auditoría AEO (Answer Engine Optimization) por reglas.
 *
 * Analiza las señales que el snippet recolectó del sitio del cliente y produce
 * checks + un puntaje 0..100. Es determinista y no toca el sitio del cliente
 * (read-only). Las recomendaciones en prosa las genera Gemini aparte
 * (recommendations.ts), pero el puntaje sale SOLO de estas reglas.
 *
 * El foco es la visibilidad ante buscadores y chatbots de IA: título y
 * descripción claros, datos estructurados (JSON-LD), llms.txt, encabezados,
 * idioma declarado, https y suficiente texto que la IA pueda citar.
 */

export function runAudit(signals: PageSignals): {
  score: number
  checks: AuditCheck[]
} {
  const checks: AuditCheck[] = []

  const title = (signals.title || '').trim()
  checks.push({
    id: 'title',
    label: 'Título de la página',
    weight: 14,
    ...(title.length === 0
      ? { status: 'fail', detail: 'La página no tiene <title>. Es lo primero que lee un buscador o una IA.' }
      : title.length < 15 || title.length > 65
        ? { status: 'warn', detail: `El título mide ${title.length} caracteres. Lo ideal es entre 15 y 60.` }
        : { status: 'ok', detail: `Título presente y con buena longitud (${title.length} caracteres).` }),
  })

  const desc = (signals.metaDescription || '').trim()
  checks.push({
    id: 'meta_description',
    label: 'Meta descripción',
    weight: 12,
    ...(desc.length === 0
      ? { status: 'fail', detail: 'Falta la meta descripción. Es el resumen que muestran Google y las IAs.' }
      : desc.length < 50 || desc.length > 165
        ? { status: 'warn', detail: `La descripción mide ${desc.length} caracteres. Apunta a 70–160.` }
        : { status: 'ok', detail: `Meta descripción presente (${desc.length} caracteres).` }),
  })

  checks.push({
    id: 'jsonld',
    label: 'Datos estructurados (JSON-LD)',
    weight: 18,
    ...(signals.jsonLdCount === 0
      ? { status: 'fail', detail: 'No hay JSON-LD. Sin datos estructurados, la IA no entiende qué tipo de negocio eres.' }
      : {
          status: 'ok',
          detail: `Tiene ${signals.jsonLdCount} bloque(s) JSON-LD${
            signals.jsonLdTypes.length ? ` (${signals.jsonLdTypes.join(', ')})` : ''
          }.`,
        }),
  })

  checks.push({
    id: 'llms_txt',
    label: 'Archivo llms.txt',
    weight: 12,
    ...(signals.hasLlmsTxt
      ? { status: 'ok', detail: 'Tiene /llms.txt: le habla directo a los modelos de IA.' }
      : { status: 'warn', detail: 'No tiene /llms.txt. Es el estándar emergente para que las IAs te resuman bien.' }),
  })

  checks.push({
    id: 'h1',
    label: 'Encabezado principal (H1)',
    weight: 10,
    ...(signals.h1.length === 0
      ? { status: 'fail', detail: 'No hay un H1. El encabezado principal le dice a la IA de qué trata la página.' }
      : signals.h1.length > 1
        ? { status: 'warn', detail: `Hay ${signals.h1.length} H1. Lo recomendable es uno solo por página.` }
        : { status: 'ok', detail: `Un H1 claro: “${signals.h1[0].slice(0, 60)}”.` }),
  })

  checks.push({
    id: 'headings',
    label: 'Subtítulos (H2)',
    weight: 6,
    ...(signals.h2.length === 0
      ? { status: 'warn', detail: 'No hay subtítulos H2. Ayudan a la IA a mapear las secciones del contenido.' }
      : { status: 'ok', detail: `Tiene ${signals.h2.length} subtítulo(s) H2.` }),
  })

  checks.push({
    id: 'lang',
    label: 'Idioma declarado',
    weight: 6,
    ...(signals.lang
      ? { status: 'ok', detail: `El idioma está declarado (lang="${signals.lang}").` }
      : { status: 'warn', detail: 'Falta el atributo lang en <html>. Declara el idioma (ej. es-MX).' }),
  })

  checks.push({
    id: 'canonical',
    label: 'URL canónica',
    weight: 6,
    ...(signals.canonical
      ? { status: 'ok', detail: 'Tiene URL canónica: evita contenido duplicado.' }
      : { status: 'warn', detail: 'Sin <link rel="canonical">. Ayuda a que los buscadores no dupliquen tu página.' }),
  })

  checks.push({
    id: 'og',
    label: 'Vista previa social (Open Graph)',
    weight: 6,
    ...(signals.hasOgTitle && signals.hasOgImage
      ? { status: 'ok', detail: 'Tiene Open Graph con título e imagen para compartir.' }
      : { status: 'warn', detail: 'Faltan etiquetas Open Graph (og:title / og:image) para verse bien al compartir.' }),
  })

  checks.push({
    id: 'https',
    label: 'HTTPS',
    weight: 6,
    ...(signals.isHttps
      ? { status: 'ok', detail: 'El sitio carga por HTTPS.' }
      : { status: 'fail', detail: 'El sitio no usa HTTPS. Buscadores e IAs penalizan sitios sin candado.' }),
  })

  checks.push({
    id: 'viewport',
    label: 'Diseño móvil (viewport)',
    weight: 4,
    ...(signals.hasViewport
      ? { status: 'ok', detail: 'Declara viewport: se adapta a celular.' }
      : { status: 'warn', detail: 'Falta la etiqueta viewport. Sin ella la página no se ve bien en celular.' }),
  })

  checks.push({
    id: 'content',
    label: 'Contenido suficiente',
    weight: 4,
    ...(signals.wordCount < 80
      ? { status: 'warn', detail: `Solo detecté ~${signals.wordCount} palabras. La IA necesita texto para poder citarte.` }
      : { status: 'ok', detail: `Contenido suficiente (~${signals.wordCount} palabras).` }),
  })

  // Puntaje ponderado: ok=1, warn=0.5, fail=0.
  const totalWeight = checks.reduce((s, c) => s + c.weight, 0)
  const earned = checks.reduce((s, c) => {
    const f = c.status === 'ok' ? 1 : c.status === 'warn' ? 0.5 : 0
    return s + c.weight * f
  }, 0)
  const score = totalWeight > 0 ? Math.round((earned / totalWeight) * 100) : 0

  return { score, checks }
}
