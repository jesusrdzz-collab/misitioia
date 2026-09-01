/**
 * Tipos del sistema multi-tenant de MiSitio IA.
 *
 * Modelo de 4 tablas:
 *   tenants (1) ── (N) sites (1) ── (1) site_content
 *                              └── (N) site_products
 *
 * Flujo de estados de un sitio:
 *   generado → reclamado → activo
 *   (cualquier estado) → dado_de_baja
 */

export type SiteStatus = 'generado' | 'reclamado' | 'activo' | 'dado_de_baja'

export type PlanLevel = 'free' | 'emprende' | 'crece' | 'pro'

export interface Tenant {
  id: string
  owner_email: string | null
  owner_phone: string | null
  plan: PlanLevel
  konnex_tenant_id: string | null // Solo nivel 2+
  created_at: string
  updated_at: string
}

export interface Site {
  id: string
  tenant_id: string
  slug: string                    // subdominio: "mi-negocio" → mi-negocio.misitio.site
  business_name: string
  giro: string | null             // slug del giro (ej: "veterinaria")
  template: string                // nombre de la plantilla visual
  status: SiteStatus
  source: string | null           // "terraleads" | "manual" | ...
  lead_id: string | null          // ID del lead en TerraLeads (si vino de ahí)
  custom_domain: string | null    // Solo nivel 3
  claimed_at: string | null
  created_at: string
  updated_at: string
}

export interface ServiceItem {
  name: string
  description: string | null
  icon: string | null             // emoji o nombre de icono
}

export interface WorkingHours {
  [day: string]: string           // ej: { "Lunes": "9:00-18:00", "Domingo": "Cerrado" }
}

export interface SiteContent {
  id: string
  site_id: string
  tenant_id: string
  hero_title: string | null
  hero_subtitle: string | null
  about_text: string | null
  logo_url: string | null
  hero_image_url: string | null
  emoji: string | null
  services: ServiceItem[]
  highlights: string[]
  contact_phone: string | null
  contact_whatsapp: string | null
  contact_email: string | null
  contact_address: string | null
  working_hours: WorkingHours | null
  social_facebook: string | null
  social_instagram: string | null
  rating: number | null
  reviews_count: number | null
  ciudad: string | null
  zona: string | null
  estado: string | null
  meta_title: string | null
  meta_description: string | null
  primary_color: string           // hex
  accent_color: string            // hex
  ai_model: string | null
  generated_at: string | null
  created_at: string
  updated_at: string
}

export interface SiteProduct {
  id: string
  site_id: string
  tenant_id: string
  name: string
  description: string | null
  price: number | null
  currency: string                // "MXN" por defecto
  image_url: string | null
  category: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

/**
 * Sitio + contenido listos para renderizar la página pública.
 */
export interface RenderableSite {
  site: Site
  content: SiteContent | null
  products: SiteProduct[]
}

/**
 * Datos mínimos que el generador necesita de un lead de TerraLeads.
 * Solo los campos que realmente usamos, no toda la fila.
 */
export interface LeadForGeneration {
  id: string
  business_name: string
  giro: string | null
  address: string | null
  phone_primary: string | null
  phone_whatsapp: string | null
  email_primary: string | null
  rating: number | null
  reviews_count: number | null
  categoria_google: string | null
  social_facebook: string | null
  social_instagram: string | null
  ciudad: string | null
  zona: string | null
  estado: string | null
  website_url: string | null
  /**
   * raw_data.outscraper.working_hours viene como
   * { "lunes": ["8a.m.-4p.m."], "domingo": ["Cerrado"], ... }
   */
  raw_data: {
    outscraper?: {
      working_hours?: Record<string, string[]>
      category?: string
      subtypes?: string | string[]
      verified?: boolean
    }
  } | null
}
