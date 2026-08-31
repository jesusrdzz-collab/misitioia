import type { MetadataRoute } from 'next'
import { listIndexableSites } from '@/lib/sites/queries'

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'misitioia.com'

/**
 * Sitemap de la plataforma.
 *
 * Lista SOLO los sitios reclamados/activos (no los 'generado', para no publicar
 * en Google miles de sitios sin reclamar). Cada sitio vive en su subdominio
 * {slug}.misitioia.com, junto con sus páginas legales.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = `https://${ROOT_DOMAIN}`
  const entries: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
  ]

  const sites = await listIndexableSites()
  for (const s of sites) {
    const siteUrl = `https://${s.slug}.${ROOT_DOMAIN}`
    const lastModified = s.updated_at ? new Date(s.updated_at) : new Date()
    entries.push(
      { url: siteUrl, lastModified, changeFrequency: 'weekly', priority: 0.8 },
      { url: `${siteUrl}/terminos`, lastModified, changeFrequency: 'yearly', priority: 0.2 },
      { url: `${siteUrl}/aviso-de-privacidad`, lastModified, changeFrequency: 'yearly', priority: 0.2 },
      { url: `${siteUrl}/cookies`, lastModified, changeFrequency: 'yearly', priority: 0.2 },
    )
  }

  return entries
}
