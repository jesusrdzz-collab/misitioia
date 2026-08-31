import type { MetadataRoute } from 'next'
import { listIndexableSites } from '@/lib/sites/queries'
import { competitorSlugs } from '@/features/comparativa/competitors'

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'misitio.site'

/**
 * Sitemap de la plataforma.
 *
 * Incluye:
 * - Las páginas del PRODUCTO (landing, legales, comparativas) — SÍ se indexan.
 * - SOLO los sitios de negocio reclamados/activos (no los 'generado', para no
 *   publicar en Google miles de sitios sin reclamar). Cada uno vive en su
 *   subdominio {slug}.misitio.site, junto con sus páginas legales.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = `https://${ROOT_DOMAIN}`
  const now = new Date()

  // Páginas del producto (cara pública).
  const productPaths: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
    { path: '', priority: 1, freq: 'weekly' },
    { path: '/comparativa', priority: 0.7, freq: 'monthly' },
    { path: '/aviso-de-privacidad', priority: 0.3, freq: 'yearly' },
    { path: '/terminos', priority: 0.3, freq: 'yearly' },
    { path: '/cookies', priority: 0.3, freq: 'yearly' },
  ]

  const entries: MetadataRoute.Sitemap = productPaths.map((p) => ({
    url: `${base}${p.path}`,
    lastModified: now,
    changeFrequency: p.freq,
    priority: p.priority,
  }))

  for (const slug of competitorSlugs()) {
    entries.push({
      url: `${base}/comparativa/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    })
  }

  // Los sitios de negocio se agregan de forma defensiva: si Supabase no está
  // disponible en tiempo de build (p. ej. sin env keys), el sitemap del PRODUCTO
  // sigue generándose en vez de romper todo el build.
  try {
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
  } catch (err) {
    console.error('[sitemap] no se pudieron listar los sitios de negocio:', err)
  }

  return entries
}
