/**
 * Generación y resolución de colisiones de subdominios (slugs).
 *
 * Reglas:
 *  - Solo [a-z0-9-], sin acentos, sin dobles guiones, 3–40 chars.
 *  - No puede ser un subdominio reservado (www, app, api...).
 *  - Si el slug ya existe, se agrega sufijo -2, -3, ... (NO error).
 */

const FALLBACK_RESERVED = new Set([
  'www', 'app', 'admin', 'api', 'mail', 'ftp', 'cdn', 'assets', 'static',
  'blog', 'help', 'soporte', 'status', 'dashboard', 'login', 'registro',
  'signup', 'misitioia',
])

/** Convierte un nombre de negocio en un slug base limpio. */
export function slugify(input: string): string {
  const base = input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // quitar acentos
    .toLowerCase()
    .replace(/&/g, ' y ')
    .replace(/[^a-z0-9]+/g, '-')     // no alfanumérico → guion
    .replace(/-+/g, '-')             // colapsar guiones
    .replace(/^-|-$/g, '')           // recortar guiones extremos

  let slug = base.slice(0, 40).replace(/-$/g, '')
  if (slug.length < 3) slug = `${slug}-negocio`.replace(/^-/, 'negocio')
  return slug
}

export interface SlugResolverDeps {
  /** true si el slug ya existe como sitio */
  slugExists: (slug: string) => Promise<boolean>
  /** true si el slug está en la tabla de reservados */
  isReserved?: (slug: string) => Promise<boolean>
}

/**
 * Resuelve un slug único y no reservado a partir de un nombre de negocio.
 * Agrega sufijo numérico ante colisiones.
 */
export async function resolveUniqueSlug(
  businessName: string,
  deps: SlugResolverDeps,
): Promise<string> {
  const base = slugify(businessName)

  const reserved = async (s: string): Promise<boolean> => {
    if (FALLBACK_RESERVED.has(s)) return true
    if (deps.isReserved) return deps.isReserved(s)
    return false
  }

  let candidate = base
  // Si el base choca con un reservado, arrancamos con sufijo desde el inicio.
  if (await reserved(candidate)) candidate = `${base}-2`

  let n = 2
  // Límite de seguridad para no ciclar infinito.
  while ((await deps.slugExists(candidate)) || (await reserved(candidate))) {
    candidate = `${base}-${n}`
    n += 1
    if (n > 1000) {
      candidate = `${base}-${Date.now().toString(36)}`
      break
    }
  }
  return candidate
}
