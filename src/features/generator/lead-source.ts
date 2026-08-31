import { createTerraLeadsClient } from '@/lib/supabase/terraleads'
import type { LeadForGeneration } from '@/lib/types/site'

const LEAD_COLUMNS = [
  'id',
  'business_name',
  'giro',
  'address',
  'phone_primary',
  'phone_whatsapp',
  'email_primary',
  'rating',
  'reviews_count',
  'categoria_google',
  'social_facebook',
  'social_instagram',
  'ciudad',
  'zona',
  'estado',
  'website_url',
  'raw_data',
].join(',')

/** Lee un lead de TerraLeads y lo devuelve con la forma mínima del generador. */
export async function fetchLeadForGeneration(
  leadId: string,
): Promise<LeadForGeneration> {
  const supabase = createTerraLeadsClient()
  const { data, error } = await supabase
    .from('leads')
    .select(LEAD_COLUMNS)
    .eq('id', leadId)
    .single()

  if (error) throw new Error(`No se pudo leer el lead ${leadId}: ${error.message}`)
  if (!data) throw new Error(`Lead ${leadId} no encontrado en TerraLeads`)

  return data as unknown as LeadForGeneration
}

/**
 * Lista leads candidatos para generación en lote (Fase 2.9):
 * sin sitio web propio, con nombre y giro, ordenados por reputación.
 */
export async function listCandidateLeads(limit = 20): Promise<LeadForGeneration[]> {
  const supabase = createTerraLeadsClient()
  const { data, error } = await supabase
    .from('leads')
    .select(LEAD_COLUMNS)
    .or('website_url.is.null,website_url.eq.')
    .not('business_name', 'is', null)
    .not('giro', 'is', null)
    .order('reviews_count', { ascending: false, nullsFirst: false })
    .limit(limit)

  if (error) throw new Error(`No se pudieron listar leads: ${error.message}`)
  return (data ?? []) as unknown as LeadForGeneration[]
}
