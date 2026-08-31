/**
 * Dominio raíz de la plataforma, configurable por entorno.
 *
 * Producción: misitio.site  (subdominios: negocio.misitio.site, panel: app.misitio.site)
 * Se puede sobreescribir con NEXT_PUBLIC_ROOT_DOMAIN sin tocar código.
 *
 * La lógica de subdominio NO depende de un dominio fijo: el slug se deriva del
 * host quitando este ROOT_DOMAIN, y sigue funcionando en la URL de prueba
 * (misitioia.vercel.app/sites/{slug}).
 */
export const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'misitio.site'

/** URL canónica de un sitio de negocio: https://{slug}.{ROOT_DOMAIN} */
export function siteUrl(slug: string): string {
  return `https://${slug}.${ROOT_DOMAIN}`
}

/** Host de un subdominio de negocio: {slug}.{ROOT_DOMAIN} */
export function siteHost(slug: string): string {
  return `${slug}.${ROOT_DOMAIN}`
}
