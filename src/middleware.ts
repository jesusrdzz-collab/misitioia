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

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const url = request.nextUrl.clone()

  // Extraer subdominio: "mi-negocio.misitio.site" → "mi-negocio"
  // En dev: "mi-negocio.localhost:3000" → "mi-negocio"
  const isLocalhost = hostname.includes('localhost')
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
