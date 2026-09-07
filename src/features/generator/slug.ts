/**
 * Generación y resolución de colisiones de subdominios (slugs).
 *
 * Reglas (actualizadas 6-sep-2026, feedback de Jesús):
 *  - Solo [a-z0-9], sin acentos, **sin guiones ni separadores**, 3–40 chars.
 *  - Todas las palabras del nombre se concatenan: "Herrería San Juan" →
 *    "herreriasanjuan" (más fácil de teclar y dictar por WhatsApp/voz que
 *    "herreria-san-juan").
 *  - Si el slug colisiona con otro sitio o con un reservado, se agrega sufijo
 *    numérico "2", "3"... pegado (NO con guion). Ej: "herreriasanjuan2".
 *  - Los slugs con guiones creados antes del cambio siguen resolviendo tal
 *    cual — la BD no se toca; se agrega redirección desde el slug sin
 *    guiones al canónico existente si aún no existe uno nuevo con ese nombre.
 *  - No puede ser un subdominio reservado (www, app, api...).
 */

import { isReservedSubdomain } from '@/lib/reserved-subdomains'

/**
 * Convierte un nombre de negocio en un slug base limpio, sin separadores.
 * "Herrería San Juan" → "herreriasanjuan".
 */
export function slugify(input: string): string {
  const base = input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')         // quitar acentos
    .toLowerCase()
    .replace(/&/g, ' y ')
    .replace(/ñ/g, 'n')             // ñ → n (subdominio, sin unicode)
    .replace(/[^a-z0-9]+/g, '')     // TODO no alfanumérico se descarta
                                    // (espacios, guiones, puntos, símbolos)

  let slug = base.slice(0, 40)
  if (slug.length < 3) slug = `${slug}negocio`.replace(/^negocio$/, 'minegocio')
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
    if (isReservedSubdomain(s)) return true
    if (deps.isReserved) return deps.isReserved(s)
    return false
  }

  let candidate = base
  // Si el base choca con un reservado, arrancamos con sufijo desde el inicio.
  if (await reserved(candidate)) candidate = `${base}2`

  let n = 2
  // Límite de seguridad para no ciclar infinito.
  while ((await deps.slugExists(candidate)) || (await reserved(candidate))) {
    candidate = `${base}${n}`
    n += 1
    if (n > 1000) {
      candidate = `${base}${Date.now().toString(36)}`
      break
    }
  }
  return candidate
}
