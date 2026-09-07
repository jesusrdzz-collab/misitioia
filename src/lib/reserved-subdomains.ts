/**
 * Subdominios reservados de la plataforma.
 *
 * Un nombre en esta lista NO puede ser usado como slug de sitio de negocio.
 * La usan:
 *  - El middleware (para dejar pasar `app.misitio.site` al panel en vez de
 *    interpretarlo como slug de negocio).
 *  - La generación de slug en el wizard (para rechazar/renombrar colisiones).
 *
 * Fuente única de verdad para no desincronizar los dos usos. Al agregar un
 * subdominio nuevo del sistema, sólo se toca aquí.
 */
export const RESERVED_SUBDOMAINS: ReadonlySet<string> = new Set([
  // Panel / auth
  'www',
  'app',
  'admin',
  'panel',
  'dashboard',
  'auth',
  'login',
  'signup',
  'registro',

  // Servicios / infra
  'api',
  'cdn',
  'static',
  'assets',
  'mail',
  'email',
  'ftp',
  'blog',
  'help',
  'soporte',
  'status',

  // Marca / rutas propias del producto
  'misitio',
  'misitioia',
  'reclamar',

  // Preview hosts de Vercel (para no confundirlos si alguien apunta CNAME).
  // Sólo los que Vercel genera para este proyecto — cualquiera con "misitioia-"
  // en el subdominio del apex `misitio.site` se trata como reservado también,
  // ver `isReservedSubdomain` abajo.
])

/**
 * Devuelve true si `sub` es un subdominio reservado (o encaja con un patrón
 * reservado, p.ej. previews de Vercel del propio proyecto).
 */
export function isReservedSubdomain(sub: string): boolean {
  if (!sub) return true
  const normalized = sub.toLowerCase()
  if (RESERVED_SUBDOMAINS.has(normalized)) return true
  // Previews de Vercel del proyecto MiSitio IA: siempre empiezan por
  // "misitioia" y suelen llevar hashes/branches con guiones. Nunca son sitios
  // de negocio, así que los tratamos como reservados a nivel de patrón.
  if (normalized.startsWith('misitioia')) return true
  return false
}
