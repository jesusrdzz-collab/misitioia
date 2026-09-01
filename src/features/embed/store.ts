import { createAdminSupabase } from '@/lib/supabase/server'
import type { AuditReport, EmbedAudit, EmbedSite, PageSignals } from './types'

/**
 * Acceso a datos de la Fase 8. Todo pasa por el cliente admin (service_role):
 *  - Los endpoints públicos (/api/webchat, /api/audit) validan el token y luego
 *    leen/escriben con service_role, acotado a ESE embed_site.
 *  - El panel /instalar autoriza por owner_email (server-side) y también usa admin,
 *    evitando el bug de createBrowserClient sin JWT.
 */

/** Genera un token público para el snippet: `mst_` + 32 hex. */
export function generateEmbedToken(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  return `mst_${hex}`
}

/** Valida un token del snippet y devuelve el embed_site activo, o null. */
export async function getEmbedSiteByToken(token: string): Promise<EmbedSite | null> {
  const clean = (token || '').trim()
  if (!clean.startsWith('mst_')) return null

  const admin = await createAdminSupabase()
  const { data } = await admin
    .from('embed_sites')
    .select('*')
    .eq('token', clean)
    .maybeSingle()

  const site = data as EmbedSite | null
  if (!site || site.status !== 'activo') return null
  return site
}

/** Registra el origin real la primera vez que se ve (no pisa uno ya guardado). */
export async function rememberOrigin(siteId: string, origin: string | null): Promise<void> {
  if (!origin) return
  const admin = await createAdminSupabase()
  const { data } = await admin
    .from('embed_sites')
    .select('origin')
    .eq('id', siteId)
    .maybeSingle()
  const current = (data as { origin: string | null } | null)?.origin
  if (current) return
  await admin
    .from('embed_sites')
    .update({ origin, updated_at: new Date().toISOString() })
    .eq('id', siteId)
}

/** Guarda un reporte de auditoría (service_role). */
export async function saveAudit(input: {
  embedSiteId: string
  url: string | null
  signals: PageSignals
  report: AuditReport
}): Promise<void> {
  const admin = await createAdminSupabase()
  await admin.from('embed_audits').insert({
    embed_site_id: input.embedSiteId,
    url: input.url,
    signals: input.signals,
    score: input.report.score,
    report: input.report,
    summary: input.report.summary,
    model: input.report.model,
  })
}

/** Último reporte de auditoría de un sitio (para dar contexto a Victoria y al panel). */
export async function getLatestAudit(embedSiteId: string): Promise<EmbedAudit | null> {
  const admin = await createAdminSupabase()
  const { data } = await admin
    .from('embed_audits')
    .select('*')
    .eq('embed_site_id', embedSiteId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return (data as EmbedAudit | null) ?? null
}

/** Crea un embed_site para el dueño autenticado y devuelve el token. */
export async function createEmbedSite(input: {
  ownerEmail: string
  name: string
  platform?: string | null
}): Promise<EmbedSite> {
  const admin = await createAdminSupabase()
  const token = generateEmbedToken()
  const { data, error } = await admin
    .from('embed_sites')
    .insert({
      owner_email: input.ownerEmail.trim().toLowerCase(),
      name: input.name.trim().slice(0, 120) || 'Mi sitio',
      platform: input.platform ?? null,
      token,
    })
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return data as EmbedSite
}

/** Lista los embed_sites del dueño. */
export async function listEmbedSitesForOwner(ownerEmail: string): Promise<EmbedSite[]> {
  const admin = await createAdminSupabase()
  const { data } = await admin
    .from('embed_sites')
    .select('*')
    .eq('owner_email', ownerEmail.trim().toLowerCase())
    .order('created_at', { ascending: false })
  return (data as EmbedSite[]) ?? []
}

/** Comprueba que un embed_site es del dueño (para leer sus auditorías). */
export async function ownsEmbedSite(embedSiteId: string, ownerEmail: string): Promise<boolean> {
  const admin = await createAdminSupabase()
  const { data } = await admin
    .from('embed_sites')
    .select('owner_email')
    .eq('id', embedSiteId)
    .maybeSingle()
  const owner = (data as { owner_email: string } | null)?.owner_email
  return !!owner && owner.toLowerCase().trim() === ownerEmail.toLowerCase().trim()
}
