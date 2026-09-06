/**
 * Guardia legal de sitios (Sprint wizard 3 pasos, 6-sep-2026).
 *
 * Regla: ningún sitio se publica sin datos legales obligatorios. Si le faltan,
 * el sitio sigue publicándose pero:
 *   - Bandera `sites.legal_ready = false`
 *   - Panel del dueño muestra banner amarillo con CTA "completar datos"
 *   - Layout público NO renderiza scripts de Meta Pixel/GA4 (coherente con
 *     LFPDPPP: sin aviso de privacidad completo, no puedes activar trackers)
 *
 * Los campos obligatorios corresponden al Paso 1b del wizard (spec en
 * `FLUJO_CREACION_SITIO_SPEC_2026-09-06.md`) y a lo mínimo que exige la
 * LFPDPPP para publicar un aviso de privacidad válido.
 */

import type { SiteContent } from '@/lib/types/site'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Snapshot mínimo de los datos que verifica la guardia.
 * Trabaja sobre un subconjunto del `SiteContent` para poder usarse desde el
 * wizard antes de tener toda la fila en memoria.
 */
export interface LegalRequiredFields {
  contact_phone?: string | null
  contact_whatsapp?: string | null
  contact_email?: string | null
  contact_address?: string | null
  responsable_nombre?: string | null
  responsable_domicilio?: string | null
}

/**
 * Campos que SON obligatorios para que el sitio pase el gate legal.
 * Al menos UNO de {phone, whatsapp}; correo; dirección física; nombre del
 * responsable; domicilio del responsable.
 */
export const LEGAL_REQUIRED_LABELS: Record<string, string> = {
  contact: 'Teléfono o WhatsApp',
  contact_email: 'Correo electrónico',
  contact_address: 'Dirección física',
  responsable_nombre: 'Nombre del responsable de datos',
  responsable_domicilio: 'Domicilio del responsable',
}

function isFilled(v: string | null | undefined): boolean {
  return typeof v === 'string' && v.trim().length > 0
}

/**
 * Devuelve true si el sitio tiene TODOS los campos legales obligatorios.
 * NO consulta BD — recibe el snapshot ya cargado.
 */
export function checkLegalReady(input: LegalRequiredFields): boolean {
  const hasContact = isFilled(input.contact_phone) || isFilled(input.contact_whatsapp)
  return (
    hasContact &&
    isFilled(input.contact_email) &&
    isFilled(input.contact_address) &&
    isFilled(input.responsable_nombre) &&
    isFilled(input.responsable_domicilio)
  )
}

/**
 * Devuelve la lista de campos que faltan (por su label legible).
 * Útil para armar el banner "completa estos datos".
 */
export function missingLegalFields(input: LegalRequiredFields): string[] {
  const missing: string[] = []
  if (!isFilled(input.contact_phone) && !isFilled(input.contact_whatsapp)) {
    missing.push(LEGAL_REQUIRED_LABELS.contact)
  }
  if (!isFilled(input.contact_email)) missing.push(LEGAL_REQUIRED_LABELS.contact_email)
  if (!isFilled(input.contact_address)) missing.push(LEGAL_REQUIRED_LABELS.contact_address)
  if (!isFilled(input.responsable_nombre)) missing.push(LEGAL_REQUIRED_LABELS.responsable_nombre)
  if (!isFilled(input.responsable_domicilio)) missing.push(LEGAL_REQUIRED_LABELS.responsable_domicilio)
  return missing
}

/**
 * Recalcula `sites.legal_ready` a partir del `site_content` actual.
 * Idempotente. Retorna el valor final (true/false).
 * Se llama después de cada save del panel/wizard que toque estos campos.
 *
 * @param admin cliente admin (service_role) ya creado por el caller
 */
export async function recalculateLegalReady(
  admin: SupabaseClient,
  siteId: string,
): Promise<boolean> {
  const { data } = await admin
    .from('site_content')
    .select('contact_phone, contact_whatsapp, contact_email, contact_address, responsable_nombre, responsable_domicilio')
    .eq('site_id', siteId)
    .maybeSingle()

  const ready = data ? checkLegalReady(data as LegalRequiredFields) : false

  await admin
    .from('sites')
    .update({ legal_ready: ready, updated_at: new Date().toISOString() })
    .eq('id', siteId)

  return ready
}

/**
 * Conveniencia para el layout público: dado un `SiteContent` cargado,
 * decide si se pueden inyectar scripts de analytics (Meta Pixel / GA4).
 * Requiere legal_ready === true en el sitio.
 */
export function analyticsAllowed(legalReady: boolean, hasAnyAnalyticsId: boolean): boolean {
  return legalReady && hasAnyAnalyticsId
}

/**
 * Deriva un snapshot legal desde el `SiteContent` cargado.
 * Facilita usar `checkLegalReady` / `missingLegalFields` en cualquier página
 * del panel sin conocer el schema exacto.
 */
export function legalFieldsFromContent(content: SiteContent | null | undefined): LegalRequiredFields {
  if (!content) return {}
  return {
    contact_phone: content.contact_phone,
    contact_whatsapp: content.contact_whatsapp,
    contact_email: content.contact_email,
    contact_address: content.contact_address,
    responsable_nombre: content.responsable_nombre,
    responsable_domicilio: content.responsable_domicilio,
  }
}
