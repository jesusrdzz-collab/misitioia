import { createAdminSupabase } from '@/lib/supabase/server'
import type { SiteContent } from '@/lib/types/site'
import { legalFieldsFromContent, missingLegalFields } from '@/lib/legal-guard'

/**
 * Devuelve la lista de campos legales que faltan para el sitio dado, o `[]`
 * si el sitio ya está en regla. Usado por las páginas del panel para decidir
 * si renderizar el LegalGuardBanner arriba del contenido.
 *
 * Server-side. Idempotente y barato — una única consulta por página.
 */
export async function getLegalMissingForSite(siteId: string): Promise<string[]> {
  const admin = await createAdminSupabase()
  const { data: siteRow } = await admin
    .from('sites')
    .select('legal_ready')
    .eq('id', siteId)
    .maybeSingle()
  const legalReady = (siteRow as { legal_ready: boolean | null } | null)?.legal_ready === true
  if (legalReady) return []

  const { data: contentRow } = await admin
    .from('site_content')
    .select('contact_phone, contact_whatsapp, contact_email, contact_address, responsable_nombre, responsable_domicilio')
    .eq('site_id', siteId)
    .maybeSingle()

  return missingLegalFields(legalFieldsFromContent(contentRow as SiteContent | null))
}
