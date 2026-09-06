import { createClient } from '@supabase/supabase-js'
import type {
  RenderableSite,
  Site,
  SiteContent,
  SiteProduct,
} from '@/lib/types/site'

/**
 * Cliente anónimo puro para lectura pública de sitios.
 * Los sitios publicados son páginas públicas: la RLS permite SELECT a `anon`
 * de todo sitio cuyo status <> 'dado_de_baja'. No requiere sesión.
 */
function publicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  )
}

/**
 * Carga un sitio publicado por su slug (subdominio) para renderizarlo.
 * Devuelve null si no existe o está dado de baja (RLS lo oculta).
 */
export async function getSiteBySlug(slug: string): Promise<RenderableSite | null> {
  const supabase = publicClient()

  const { data: site } = await supabase
    .from('sites')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (!site) return null

  const [{ data: content }, { data: products }] = await Promise.all([
    supabase.from('site_content').select('*').eq('site_id', site.id).maybeSingle(),
    supabase
      .from('site_products')
      .select('*')
      .eq('site_id', site.id)
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
  ])

  return {
    site: site as Site,
    content: (content as SiteContent) ?? null,
    products: (products as SiteProduct[]) ?? [],
  }
}

/**
 * Busca el slug canónico de un sitio a partir de un slug anterior (legacy con
 * guiones). Devuelve el slug actual si el requerido está en `previous_slugs`
 * de algún sitio publicado. Devuelve null si no lo encuentra o si está dado
 * de baja.
 *
 * Se usa desde el middleware (subdominio) y desde la ruta [slug] para hacer
 * un 301 permanente sin romper enlaces vivos con guiones.
 */
export async function getCanonicalSlugForLegacy(
  legacySlug: string,
): Promise<string | null> {
  const supabase = publicClient()
  const { data } = await supabase
    .from('sites')
    .select('slug')
    .contains('previous_slugs', [legacySlug])
    .neq('status', 'dado_de_baja')
    .limit(1)
    .maybeSingle()
  return (data as { slug: string } | null)?.slug ?? null
}

/** Slugs de todos los sitios publicados (para SSG / generateStaticParams). */
export async function listPublishedSlugs(): Promise<string[]> {
  const supabase = publicClient()
  const { data } = await supabase
    .from('sites')
    .select('slug')
    .neq('status', 'dado_de_baja')
  return (data ?? []).map((r) => (r as { slug: string }).slug)
}

/**
 * Sitios indexables (reclamado/activo) para el sitemap de la plataforma.
 * Los sitios 'generado' NO van al sitemap: no se publican en buscadores hasta
 * que el dueño reclama su página (decisión de producto anti-spam SEO).
 */
export async function listIndexableSites(): Promise<
  Array<{ slug: string; updated_at: string }>
> {
  const supabase = publicClient()
  const { data } = await supabase
    .from('sites')
    .select('slug, updated_at')
    .in('status', ['reclamado', 'activo'])
  return (data ?? []) as Array<{ slug: string; updated_at: string }>
}
