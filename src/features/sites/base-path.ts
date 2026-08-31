import { headers } from 'next/headers'

/**
 * Base de rutas del sitio, según cómo se está sirviendo:
 *
 * - Vía subdominio de negocio ({slug}.misitio.site): el middleware reescribe
 *   y deja el header `x-site-slug`. Las rutas internas son limpias → base ''.
 *   Un enlace a "/terminos" lo reescribe el middleware a /sites/{slug}/terminos.
 * - Vía URL de prueba (misitioia.vercel.app/sites/{slug}): no hay reescritura,
 *   así que las rutas deben incluir el prefijo → base '/sites/{slug}'.
 *
 * Así los enlaces del footer y las páginas legales funcionan en ambos casos.
 */
export async function siteBasePath(slug: string): Promise<string> {
  const h = await headers()
  const viaSubdomain = !!h.get('x-site-slug')
  return viaSubdomain ? '' : `/sites/${slug}`
}
