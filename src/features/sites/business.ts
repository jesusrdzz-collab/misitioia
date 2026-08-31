/**
 * Vista normalizada de un sitio para render, AEO y páginas legales.
 * Deriva de RenderableSite todo lo que se repite en varios lugares
 * (URL canónica, si se indexa, ubicación legible, nombre del giro, etc.)
 * para no recalcular ni desincronizar reglas.
 */
import type { RenderableSite, SiteStatus } from '@/lib/types/site'
import { giroNombre } from '@/features/generator/giros'

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'misitioia.com'

/** Un sitio reclamado o activo SÍ se publica en buscadores. Generado NO. */
export function isIndexable(status: SiteStatus): boolean {
  return status === 'reclamado' || status === 'activo'
}

export interface BusinessView {
  slug: string
  name: string
  giroNombre: string
  /** Ubicación legible: "San Nicolás de los Garza, Nuevo León" */
  location: string | null
  address: string | null
  phone: string | null
  whatsapp: string | null
  email: string | null
  rating: number | null
  reviewsCount: number | null
  facebook: string | null
  instagram: string | null
  /** URL canónica del sitio: https://{slug}.{ROOT_DOMAIN} */
  url: string
  indexable: boolean
  primaryColor: string
  accentColor: string
}

export function toBusinessView(data: RenderableSite): BusinessView {
  const { site, content } = data

  const locationParts = [content?.zona || content?.ciudad, content?.estado].filter(
    (p): p is string => !!p,
  )
  const location = locationParts.length ? locationParts.join(', ') : null

  const ratingNum =
    content?.rating != null ? Number(content.rating) : null

  return {
    slug: site.slug,
    name: site.business_name,
    giroNombre: giroNombre(site.giro),
    location,
    address: content?.contact_address ?? null,
    phone: content?.contact_phone ?? null,
    whatsapp: content?.contact_whatsapp ?? null,
    email: content?.contact_email ?? null,
    rating: ratingNum != null && !Number.isNaN(ratingNum) ? ratingNum : null,
    reviewsCount: content?.reviews_count ?? null,
    facebook: content?.social_facebook ?? null,
    instagram: content?.social_instagram ?? null,
    url: `https://${site.slug}.${ROOT_DOMAIN}`,
    indexable: isIndexable(site.status),
    primaryColor: content?.primary_color || '#2563eb',
    accentColor: content?.accent_color || '#1e40af',
  }
}
