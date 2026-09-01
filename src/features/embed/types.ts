/**
 * Tipos de la Fase 8 — Plugin/embed para sitios que YA existen.
 *
 * Un `EmbedSite` es un sitio ajeno (WordPress, Wix o cualquiera) que instaló
 * nuestro snippet universal. Se identifica con un token público. Sobre él
 * corremos una auditoría AEO (solo lectura) y le inyectamos el chat de Victoria.
 */

export type EmbedStatus = 'activo' | 'pausado'

export interface EmbedSite {
  id: string
  owner_email: string
  tenant_id: string | null
  token: string
  name: string
  origin: string | null
  platform: string | null
  status: EmbedStatus
  konnex_tenant_id: string | null
  created_at: string
  updated_at: string
}

/**
 * Señales que el snippet recolecta de la página del cliente y POSTea a /api/audit.
 * Todo se lee del DOM del sitio anfitrión; nada se modifica.
 */
export interface PageSignals {
  url: string
  origin: string
  title: string | null
  metaDescription: string | null
  canonical: string | null
  lang: string | null
  h1: string[]
  h2: string[]
  jsonLdCount: number
  jsonLdTypes: string[]
  hasLlmsTxt: boolean
  hasViewport: boolean
  hasOgTitle: boolean
  hasOgImage: boolean
  isHttps: boolean
  wordCount: number
  textSample: string
}

/** Un check individual de la auditoría AEO. */
export interface AuditCheck {
  id: string
  label: string
  status: 'ok' | 'warn' | 'fail'
  detail: string
  weight: number
}

/** Reporte estructurado que se guarda por sitio. */
export interface AuditReport {
  score: number
  checks: AuditCheck[]
  recommendations: string[]
  summary: string
  model: string | null
}

/** Fila de auditoría tal como se guarda / se lee para el panel. */
export interface EmbedAudit {
  id: string
  embed_site_id: string
  url: string | null
  signals: PageSignals | Record<string, unknown>
  score: number | null
  report: AuditReport | Record<string, unknown>
  summary: string | null
  model: string | null
  created_at: string
}
