/**
 * Tipos del sistema multi-tenant de MiSitio IA.
 *
 * Flujo de estados:
 *   generado → reclamado → activo
 *   (cualquier estado) → dado_de_baja
 */

export type SiteStatus = 'generado' | 'reclamado' | 'activo' | 'dado_de_baja'

export type PlanLevel = 'gratis' | 'nivel_2' | 'nivel_3'

export interface Tenant {
  id: string
  slug: string                    // subdominio: "mi-negocio" → mi-negocio.misitioia.com
  business_name: string
  owner_email: string | null
  owner_phone: string | null
  plan: PlanLevel
  status: SiteStatus
  custom_domain: string | null    // Solo nivel 3
  konnex_tenant_id: string | null // Solo nivel 2+
  lead_id: string | null          // ID del lead en TerraLeads (si vino de ahí)
  created_at: string
  updated_at: string
  claimed_at: string | null
}

export interface SiteContent {
  id: string
  tenant_id: string
  giro: string                    // slug del giro (ej: "veterinaria")
  template: string                // nombre de la plantilla
  hero_title: string
  hero_subtitle: string
  about_text: string
  services: ServiceItem[]
  contact_phone: string | null
  contact_email: string | null
  contact_address: string | null
  working_hours: WorkingHours | null
  social_facebook: string | null
  social_instagram: string | null
  rating: number | null
  reviews_count: number | null
  meta_title: string
  meta_description: string
  primary_color: string           // hex
  accent_color: string            // hex
  created_at: string
  updated_at: string
}

export interface ServiceItem {
  name: string
  description: string | null
  icon: string | null             // emoji o nombre de icono
}

export interface WorkingHours {
  [day: string]: string           // ej: { "Lunes": "9:00-18:00", "Sábado": "9:00-14:00" }
}

export interface SiteProduct {
  id: string
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
 * Datos mínimos que el generador necesita de un lead de TerraLeads.
 * Solo los campos que realmente usamos, no toda la fila.
 */
export interface LeadForGeneration {
  id: string
  business_name: string
  giro: string
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
  raw_data: {
    outscraper?: {
      working_hours?: Record<string, string>
      category?: string
      subtypes?: string[]
      verified?: boolean
    }
  } | null
}
