import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { ROOT_DOMAIN } from '@/lib/domain'

/**
 * Subdominios reservados — NO son sitios de negocios.
 * Pasan directo a las rutas de Next.js (panel admin, API, etc.)
 */
const RESERVED_SUBDOMAINS = new Set([
  'www',
  'app',     // Panel del negocio
  'admin',   // Panel admin interno
  'api',     // API pública (futuro)
  'mail',
  'ftp',
])

/**
 * Busca el slug de un sitio por su dominio personalizado (sites.custom_domain).
 * Consulta ligera a PostgREST con la anon key (segura en el runtime edge del
 * middleware): la RLS pública permite SELECT de sitios no dados de baja.
 * Devuelve null ante cualquier fallo para caer con gracia al flujo normal.
 */
async function lookupSlugByCustomDomain(host: string): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null

  // El dominio se guarda normalizado sin "www.", así que lo quitamos también
  // aquí para que www.minegocio.com resuelva al mismo sitio que el apex.
  const lookupHost = host.replace(/^www\./, '')

  try {
    const res = await fetch(
      `${url}/rest/v1/sites?select=slug&custom_domain=eq.${encodeURIComponent(lookupHost)}&limit=1`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: 'no-store' },
    )
    if (!res.ok) return null
    const rows = (await res.json()) as Array<{ slug?: string }>
    return rows[0]?.slug ?? null
  } catch {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const url = request.nextUrl.clone()

  // Las rutas /api/* deben resolverse a su handler real en CUALQUIER host (apex,
  // subdominio de negocio o dominio propio). Sin esto, la reescritura a
  // /sites/{slug} de más abajo convertía p.ej. `negocio.misitio.site/api/victoria`
  // en `/sites/negocio/api/victoria` (inexistente) y rompía el widget de Victoria.
  if (request.nextUrl.pathname.startsWith('/api')) {
    return updateSession(request)
  }

  // Extraer subdominio: "mi-negocio.misitio.site" → "mi-negocio"
  // En dev: "mi-negocio.localhost:3000" → "mi-negocio"
  const isLocalhost = hostname.includes('localhost')

  // —— Dominio personalizado del cliente ——
  // Un host que NO es localhost, NO es el apex {ROOT_DOMAIN} y NO es un
  // subdominio *.{ROOT_DOMAIN} es un dominio propio del cliente (p.ej.
  // minegocio.com). Solo en ese caso buscamos el sitio por custom_domain y
  // reescribimos a /sites/{slug}, igual que la ruta de subdominio.
  //
  // Por qué NO afecta a los hosts misitio.site: `isMisitioHost` es true para el
  // apex y para cualquier `*.{ROOT_DOMAIN}`, así que esos NUNCA entran a esta
  // rama y siguen exactamente el flujo original de abajo. Los .vercel.app y los
  // hosts sin coincidencia también caen al flujo original (no hay slug).
  const hostNoPort = hostname.split(':')[0]
  const isMisitioHost = hostNoPort === ROOT_DOMAIN || hostNoPort.endsWith(`.${ROOT_DOMAIN}`)
  if (!isLocalhost && !isMisitioHost && !hostNoPort.endsWith('.vercel.app')) {
    const slug = await lookupSlugByCustomDomain(hostNoPort)
    if (slug) {
      url.pathname = `/sites/${slug}${url.pathname === '/' ? '' : url.pathname}`
      const response = NextResponse.rewrite(url)
      response.headers.set('x-site-slug', slug)
      return response
    }
    // Sin coincidencia → continúa al flujo normal (landing / preview).
  }

  const currentHost = isLocalhost
    ? hostname.split('.localhost')[0]
    : hostname.replace(`.${ROOT_DOMAIN}`, '')

  // Si NO hay subdominio (es el dominio raíz o localhost sin prefijo)
  const isRootDomain =
    currentHost === ROOT_DOMAIN ||
    currentHost === hostname ||
    currentHost === 'localhost:3000' ||
    currentHost === 'localhost'

  if (isRootDomain) {
    // Dominio raíz → landing page de MiSitio IA (ruta normal de Next.js)
    return updateSession(request)
  }

  // Subdominio reservado → dejar pasar a rutas normales
  if (RESERVED_SUBDOMAINS.has(currentHost)) {
    return updateSession(request)
  }

  // Subdominio de negocio → reescribir a /sites/[slug]
  url.pathname = `/sites/${currentHost}${url.pathname === '/' ? '' : url.pathname}`
  const response = NextResponse.rewrite(url)

  // Pasar el slug como header para que la página lo lea
  response.headers.set('x-site-slug', currentHost)

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico, sitemap.xml, robots.txt
     * - archivos públicos con extensión
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
}
