import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { ROOT_DOMAIN } from '@/lib/domain'
import { isReservedSubdomain } from '@/lib/reserved-subdomains'
import { stampAttributionCookies } from '@/lib/attribution'

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

/**
 * Busca si `subdomain` es un slug anterior (con guiones) de algún sitio y
 * devuelve el slug canónico actual. Usado para 301-redirect desde subdominios
 * legacy creados antes del cambio "sin guiones" (6-sep-2026). Devuelve null
 * si no hay match — el flujo normal continúa (que responderá 404 si el slug
 * tampoco es actual).
 */
async function lookupCanonicalSlugForLegacy(
  subdomain: string,
): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  // Sólo aplica a slugs con guion; los demás no pueden ser "legacy".
  if (!subdomain.includes('-')) return null
  try {
    // PostgREST: cs (contains) sobre array text → previous_slugs @> '{value}'
    const res = await fetch(
      `${url}/rest/v1/sites?select=slug&previous_slugs=cs.%7B${encodeURIComponent(
        subdomain,
      )}%7D&status=neq.dado_de_baja&limit=1`,
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
    const apiRes = await updateSession(request)
    return stampAttributionCookies(request, apiRes)
  }

  // Extraer subdominio: "mi-negocio.misitio.site" → "mi-negocio"
  // En dev: "mi-negocio.localhost:3000" → "mi-negocio"
  const isLocalhost = hostname.includes('localhost')

  // —— 301 legacy /sites/{slug} → subdominio ——
  // Cuando alguien pide `misitio.site/sites/{slug}[/rest]` (o el mismo con www),
  // lo mandamos permanentemente a `https://{slug}.misitio.site[/rest]`.
  // Sólo en producción (apex real) y sólo en GET/HEAD; el iframe de preview del
  // editor (`/sites/{slug}?preview=N`) queda intacto porque el redirect saltea
  // cuando hay `?preview=` (así el editor sigue leyendo el sitio en su propio
  // origen). La URL de prueba `misitioia.vercel.app/sites/{slug}` NO se toca.
  const hostNoPortEarly = hostname.split(':')[0]
  const isApexOrWww =
    hostNoPortEarly === ROOT_DOMAIN || hostNoPortEarly === `www.${ROOT_DOMAIN}`
  const isSafeMethod = request.method === 'GET' || request.method === 'HEAD'
  if (
    isApexOrWww &&
    isSafeMethod &&
    request.nextUrl.pathname.startsWith('/sites/') &&
    !request.nextUrl.searchParams.has('preview')
  ) {
    const segments = request.nextUrl.pathname.split('/').filter(Boolean)
    // segments[0] === 'sites'; segments[1] === slug; segments[2+] === rest.
    const legacySlug = segments[1]
    const rest = segments.slice(2).join('/')
    if (legacySlug && !isReservedSubdomain(legacySlug)) {
      const target = new URL(request.url)
      target.host = `${legacySlug}.${ROOT_DOMAIN}`
      target.protocol = 'https:'
      target.port = ''
      target.pathname = rest ? `/${rest}` : '/'
      return stampAttributionCookies(request, NextResponse.redirect(target, 301))
    }
  }

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
      return stampAttributionCookies(request, response)
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
    const rootRes = await updateSession(request)
    return stampAttributionCookies(request, rootRes)
  }

  // Subdominio reservado → dejar pasar a rutas normales
  if (isReservedSubdomain(currentHost)) {
    const reservedRes = await updateSession(request)
    return stampAttributionCookies(request, reservedRes)
  }

  // Subdominios legacy con guion (herreria-san-juan) → 301 al canónico
  // concatenado (herreriasanjuan). Sólo cuando el subdominio esté registrado
  // como previous_slug de algún sitio publicado; los demás caen al flujo
  // normal (que responderá 404 si tampoco es canónico).
  if (currentHost.includes('-')) {
    const canonical = await lookupCanonicalSlugForLegacy(currentHost)
    if (canonical && canonical !== currentHost) {
      const redirect = new URL(request.url)
      const suffix = isLocalhost ? '.localhost' : `.${ROOT_DOMAIN}`
      // Mantener puerto si viene (localhost:3000, dev)
      const portMatch = hostname.match(/:(\d+)$/)
      const port = portMatch ? `:${portMatch[1]}` : ''
      redirect.host = `${canonical}${suffix}${port}`
      return stampAttributionCookies(request, NextResponse.redirect(redirect, 301))
    }
  }

  // Subdominio de negocio → reescribir a /sites/[slug]
  url.pathname = `/sites/${currentHost}${url.pathname === '/' ? '' : url.pathname}`
  const response = NextResponse.rewrite(url)

  // Pasar el slug como header para que la página lo lea
  response.headers.set('x-site-slug', currentHost)

  return stampAttributionCookies(request, response)
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
