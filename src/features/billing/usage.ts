'use server'

import { createServerSupabase, createAdminSupabase } from '@/lib/supabase/server'
import { authorizeSiteAccess } from '@/features/editor/authorize'
import { fetchVictoriaUsage, currentUsagePeriod } from '@/lib/konnex'

/**
 * Medidor de conversaciones de Victoria (integración "de regreso" con Konnex).
 *
 * `syncVictoriaUsage` consulta el conteo del periodo a Konnex con el token del
 * tenant y persiste `conversations_used`, `usage_period` y `usage_synced_at`.
 * Todo server-side: el token nunca sale al navegador.
 *
 * INERTE hasta que Konnex despliegue `/api/webchat/usage` y el tenant tenga
 * `konnex_webchat_token`. Si Konnex está inalcanzable, se conserva el último
 * valor sincronizado (la UI muestra "—" o el último dato).
 */

export interface VictoriaUsage {
  conversationsUsed: number | null
  conversationsIncluded: number
  usagePeriod: string | null
  usageSyncedAtIso: string | null
  /** true si el tenant tiene token aprovisionado (Victoria configurada). */
  configured: boolean
}

interface TenantUsageRow {
  konnex_webchat_token: string | null
  conversations_used: number | null
  conversations_included: number | null
  usage_period: string | null
  usage_synced_at: string | null
}

/** Lee el estado de uso ya persistido de un tenant (sin llamar a Konnex). */
export async function getVictoriaUsage(tenantId: string): Promise<VictoriaUsage> {
  const admin = await createAdminSupabase()
  const { data } = await admin
    .from('tenants')
    .select(
      'konnex_webchat_token, conversations_used, conversations_included, usage_period, usage_synced_at',
    )
    .eq('id', tenantId)
    .maybeSingle()

  const row = data as TenantUsageRow | null
  return {
    conversationsUsed: row?.conversations_used ?? null,
    conversationsIncluded: row?.conversations_included ?? 0,
    usagePeriod: row?.usage_period ?? null,
    usageSyncedAtIso: row?.usage_synced_at ?? null,
    configured: Boolean(row?.konnex_webchat_token),
  }
}

export interface SyncResult {
  ok: boolean
  /** 'not_configured' | 'unreachable' | error de Konnex | undefined si ok. */
  error?: string
  usage?: VictoriaUsage
}

/**
 * Sincroniza el uso de Victoria desde Konnex y lo persiste en `tenants`.
 * Devuelve el estado actualizado (o el último conocido si Konnex falla).
 */
export async function syncVictoriaUsage(tenantId: string): Promise<SyncResult> {
  const admin = await createAdminSupabase()

  const { data } = await admin
    .from('tenants')
    .select(
      'konnex_webchat_token, conversations_used, conversations_included, usage_period, usage_synced_at',
    )
    .eq('id', tenantId)
    .maybeSingle()

  const row = data as TenantUsageRow | null
  const token = row?.konnex_webchat_token
  if (!token) {
    return { ok: false, error: 'not_configured', usage: await getVictoriaUsage(tenantId) }
  }

  const result = await fetchVictoriaUsage({ token })
  if (!result.ok) {
    // Konnex inalcanzable: conservamos el último dato sincronizado.
    return { ok: false, error: result.error, usage: await getVictoriaUsage(tenantId) }
  }

  const nowIso = new Date().toISOString()
  const period = result.period || currentUsagePeriod()

  const { error } = await admin
    .from('tenants')
    .update({
      conversations_used: result.conversations,
      usage_period: period,
      usage_synced_at: nowIso,
    })
    .eq('id', tenantId)

  if (error) {
    return { ok: false, error: error.message, usage: await getVictoriaUsage(tenantId) }
  }

  return {
    ok: true,
    usage: {
      conversationsUsed: result.conversations,
      conversationsIncluded: row?.conversations_included ?? 0,
      usagePeriod: period,
      usageSyncedAtIso: nowIso,
      configured: true,
    },
  }
}

/**
 * Server action autorizada que el panel del cliente puede llamar para refrescar
 * el uso de SU sitio. Verifica que el sitio pertenece al usuario autenticado
 * antes de sincronizar (mismo patrón que el resto del dashboard).
 */
export async function refreshMyVictoriaUsage(siteId: string): Promise<SyncResult> {
  const supabase = await createServerSupabase()
  const { data } = await supabase.auth.getUser()
  const email = data.user?.email
  if (!email) return { ok: false, error: 'no_auth' }

  const authorized = await authorizeSiteAccess(siteId, email)
  if (!authorized) return { ok: false, error: 'forbidden' }

  return syncVictoriaUsage(authorized.tenantId)
}
