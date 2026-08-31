/**
 * AEO — /llms.txt por sitio.
 *
 * Markdown que describe el negocio para asistentes de IA (ChatGPT, Perplexity,
 * Claude, Gemini). Solo datos verificados del lead. Como solo describe un
 * negocio real, se sirve SIEMPRE (independiente del estado del sitio): no
 * publica el sitio en Google, solo ayuda a que la IA reconozca el negocio.
 */
import type { RenderableSite } from '@/lib/types/site'
import { toBusinessView } from '@/features/sites/business'

export function buildLlmsTxt(data: RenderableSite): string {
  const b = toBusinessView(data)
  const { content } = data
  const lines: string[] = []

  lines.push(`# ${b.name}`)
  lines.push('')
  if (content?.meta_description) {
    lines.push(`> ${content.meta_description}`)
    lines.push('')
  }

  lines.push('## Sobre el negocio')
  lines.push('')
  lines.push(`- **Nombre:** ${b.name}`)
  if (b.giroNombre) lines.push(`- **Giro:** ${b.giroNombre}`)
  if (b.location) lines.push(`- **Ubicación:** ${b.location}`)
  if (b.address) lines.push(`- **Dirección:** ${b.address}`)
  if (b.phone) lines.push(`- **Teléfono:** ${b.phone}`)
  if (b.email) lines.push(`- **Correo:** ${b.email}`)
  if (b.rating != null && b.reviewsCount != null && b.reviewsCount > 0) {
    lines.push(
      `- **Calificación:** ${b.rating}/5 en ${b.reviewsCount} reseñas de Google`,
    )
  }
  lines.push(`- **Sitio web:** ${b.url}`)
  lines.push('')

  if (content?.about_text) {
    lines.push('## Descripción')
    lines.push('')
    lines.push(content.about_text)
    lines.push('')
  }

  const services = content?.services ?? []
  if (services.length) {
    lines.push('## Servicios')
    lines.push('')
    for (const s of services) {
      lines.push(s.description ? `- **${s.name}:** ${s.description}` : `- ${s.name}`)
    }
    lines.push('')
  }

  const products = data.products ?? []
  if (products.length) {
    lines.push('## Catálogo')
    lines.push('')
    for (const p of products) {
      const price = p.price != null ? ` — $${p.price.toLocaleString('es-MX')} ${p.currency}` : ''
      lines.push(`- **${p.name}**${price}${p.description ? `: ${p.description}` : ''}`)
    }
    lines.push('')
  }

  if (content?.working_hours && Object.keys(content.working_hours).length) {
    lines.push('## Horario')
    lines.push('')
    for (const [day, range] of Object.entries(content.working_hours)) {
      lines.push(`- ${day}: ${range}`)
    }
    lines.push('')
  }

  const social = [b.facebook, b.instagram].filter((s): s is string => !!s)
  if (social.length) {
    lines.push('## Redes sociales')
    lines.push('')
    for (const s of social) lines.push(`- ${s}`)
    lines.push('')
  }

  lines.push('---')
  lines.push('')
  lines.push(
    `Página creada con MiSitio IA (https://${
      process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'misitioia.com'
    }). Datos verificados de fuentes públicas; el negocio puede solicitar cambios o baja.`,
  )
  lines.push('')

  return lines.join('\n')
}
