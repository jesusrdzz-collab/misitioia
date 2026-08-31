/**
 * AEO — JSON-LD schema.org LocalBusiness por sitio.
 *
 * Describe un NEGOCIO REAL con datos verificados del lead (nombre, giro,
 * ubicación, teléfono, rating y reseñas de Google). Ayuda a que ChatGPT,
 * Perplexity y Gemini reconozcan y citen el negocio.
 *
 * Decisión de producto: el JSON-LD puede estar SIEMPRE (incluso en 'generado'),
 * porque solo describe un negocio real — no publica el sitio en Google. Lo que
 * se gatea por estado es la indexación (meta robots) y el sitemap, no esto.
 */
import type { RenderableSite } from '@/lib/types/site'
import { toBusinessView } from '@/features/sites/business'

export function buildLocalBusinessJsonLd(data: RenderableSite): Record<string, unknown> {
  const b = toBusinessView(data)
  const { content } = data

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: b.name,
    url: b.url,
  }

  if (content?.about_text || content?.meta_description) {
    jsonLd.description = content.meta_description || content.about_text
  }

  if (b.giroNombre) {
    // Categoría legible del negocio (giro).
    jsonLd.additionalType = b.giroNombre
  }

  // Dirección — solo campos verificados.
  const address: Record<string, string> = { '@type': 'PostalAddress', addressCountry: 'MX' }
  if (b.address) address.streetAddress = b.address
  if (content?.ciudad) address.addressLocality = content.ciudad
  if (content?.zona && !content?.ciudad) address.addressLocality = content.zona
  if (content?.estado) address.addressRegion = content.estado
  if (Object.keys(address).length > 2) jsonLd.address = address

  if (b.phone) jsonLd.telephone = b.phone

  // Rating real de Google (verificado). Solo si hay reseñas.
  if (b.rating != null && b.reviewsCount != null && b.reviewsCount > 0) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: b.rating,
      reviewCount: b.reviewsCount,
      bestRating: 5,
      worstRating: 1,
    }
  }

  // Redes sociales verificadas → sameAs.
  const sameAs = [b.facebook, b.instagram].filter((s): s is string => !!s)
  if (sameAs.length) jsonLd.sameAs = sameAs

  // Horarios (si existen) → openingHours legible.
  if (content?.working_hours && Object.keys(content.working_hours).length) {
    jsonLd.openingHoursSpecification = Object.entries(content.working_hours).map(
      ([day, range]) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: day,
        description: range,
      }),
    )
  }

  return jsonLd
}
