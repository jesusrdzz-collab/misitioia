import { createAdminSupabase } from '@/lib/supabase/server'
import type { LeadForGeneration } from '@/lib/types/site'
import { fetchLeadForGeneration } from './lead-source'
import { generateCopy, type GeneratedCopy } from './gemini'
import { templateForGiro } from './templates'
import { giroNombre } from './giros'
import { normalizeWorkingHours } from './working-hours'
import { resolveUniqueSlug } from './slug'
import { ROOT_DOMAIN } from '@/lib/domain'

/**
 * Fase 2 — Generador automático de sitios.
 *
 * generateSiteFromLead(leadId):
 *   lead de TerraLeads → Gemini redacta textos → plantilla por giro →
 *   sitio publicado en estado 'generado' (noindex hasta reclamar).
 *
 * Parte PURA (composeSiteContent) separada de la PERSISTENCIA para poder
 * probar la redacción sin escribir en BD.
 */

export interface ComposedSite {
  giro: string | null
  giro_nombre: string
  template: string
  primary_color: string
  accent_color: string
  copy: GeneratedCopy
  working_hours: ReturnType<typeof normalizeWorkingHours>
  ai_model: string
}

/**
 * Redacta el contenido de un sitio a partir del lead (SIN tocar BD).
 * Requiere una GEMINI_API_KEY.
 */
export async function composeSiteContent(
  lead: LeadForGeneration,
  apiKey: string = process.env.GEMINI_API_KEY ?? '',
): Promise<ComposedSite> {
  const nombre = giroNombre(lead.giro)
  const template = templateForGiro(lead.giro)
  const { copy, model } = await generateCopy(lead, nombre, apiKey)
  const working_hours = normalizeWorkingHours(lead.raw_data?.outscraper?.working_hours)

  return {
    giro: lead.giro,
    giro_nombre: nombre,
    template: template.id,
    primary_color: template.primaryColor,
    accent_color: template.accentColor,
    copy,
    working_hours,
    ai_model: model,
  }
}

export interface GenerateResult {
  siteId: string
  tenantId: string
  slug: string
  url: string
  status: 'generado'
}

/**
 * Persiste un sitio generado (tenant + site + site_content) usando el cliente
 * admin (service_role) que hace bypass de RLS. Idempotente por lead_id: si ya
 * existe un sitio para ese lead, lo devuelve sin duplicar.
 */
export async function persistGeneratedSite(
  lead: LeadForGeneration,
  composed: ComposedSite,
): Promise<GenerateResult> {
  const supabase = await createAdminSupabase()

  // Idempotencia: ¿ya hay sitio para este lead?
  const { data: existing } = await supabase
    .from('sites')
    .select('id, tenant_id, slug, status')
    .eq('lead_id', lead.id)
    .maybeSingle()

  if (existing) {
    return {
      siteId: existing.id,
      tenantId: existing.tenant_id,
      slug: existing.slug,
      url: `https://${existing.slug}.${ROOT_DOMAIN}`,
      status: 'generado',
    }
  }

  // Slug único y no reservado
  const slug = await resolveUniqueSlug(lead.business_name, {
    slugExists: async (s) => {
      const { data } = await supabase.from('sites').select('id').eq('slug', s).maybeSingle()
      return !!data
    },
    isReserved: async (s) => {
      const { data } = await supabase
        .from('reserved_subdomains')
        .select('slug')
        .eq('slug', s)
        .maybeSingle()
      return !!data
    },
  })

  // 1) tenant
  const { data: tenant, error: tErr } = await supabase
    .from('tenants')
    .insert({
      owner_email: lead.email_primary,
      owner_phone: lead.phone_whatsapp || lead.phone_primary,
      plan: 'free',
    })
    .select('id')
    .single()
  if (tErr || !tenant) throw new Error(`Error creando tenant: ${tErr?.message}`)

  // 2) site
  const { data: site, error: sErr } = await supabase
    .from('sites')
    .insert({
      tenant_id: tenant.id,
      slug,
      business_name: lead.business_name,
      giro: lead.giro,
      template: composed.template,
      status: 'generado',
      source: 'terraleads',
      lead_id: lead.id,
    })
    .select('id')
    .single()
  if (sErr || !site) throw new Error(`Error creando site: ${sErr?.message}`)

  // 3) site_content
  const { error: cErr } = await supabase.from('site_content').insert({
    site_id: site.id,
    tenant_id: tenant.id,
    hero_title: composed.copy.hero_title,
    hero_subtitle: composed.copy.hero_subtitle,
    about_text: composed.copy.about_text,
    services: composed.copy.services,
    highlights: composed.copy.highlights,
    contact_phone: lead.phone_primary,
    contact_whatsapp: lead.phone_whatsapp,
    contact_email: lead.email_primary,
    contact_address: lead.address,
    working_hours: composed.working_hours,
    social_facebook: lead.social_facebook,
    social_instagram: lead.social_instagram,
    rating: lead.rating,
    reviews_count: lead.reviews_count,
    ciudad: lead.ciudad,
    zona: lead.zona,
    estado: lead.estado,
    meta_title: composed.copy.meta_title,
    meta_description: composed.copy.meta_description,
    primary_color: composed.primary_color,
    accent_color: composed.accent_color,
    ai_model: composed.ai_model,
    generated_at: new Date().toISOString(),
  })
  if (cErr) throw new Error(`Error creando site_content: ${cErr.message}`)

  return {
    siteId: site.id,
    tenantId: tenant.id,
    slug,
    url: `https://${slug}.${ROOT_DOMAIN}`,
    status: 'generado',
  }
}

/**
 * Pipeline completo: leadId (TerraLeads) → sitio publicado en MiSitio IA.
 * Esta es la función que dispara la campaña (Fase 2.1).
 */
export async function generateSiteFromLead(leadId: string): Promise<GenerateResult> {
  const lead = await fetchLeadForGeneration(leadId)
  const composed = await composeSiteContent(lead)
  return persistGeneratedSite(lead, composed)
}
