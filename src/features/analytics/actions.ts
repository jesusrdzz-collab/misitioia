'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase/server'
import { authorizeSiteAccess } from '@/features/editor/authorize'
import { analyticsIdsSchema, type AnalyticsIdsInput } from './validation'

/**
 * Server actions del panel "Analíticas" (Fase A: Pixel de Meta + GA4).
 *
 * Reglas de negocio:
 *  - Solo planes distintos de 'free' pueden guardar IDs. En `free` la UI está
 *    en modo lectura, pero validamos también aquí (defensa en profundidad).
 *  - Los IDs se validan con Zod (regex conservador). Un ID malformado se
 *    rechaza en el guardado; nunca llega a inyectarse en el sitio del cliente.
 *  - Nunca logueamos los IDs. Son datos del cliente, aunque no sean secretos.
 *
 * Patrón idéntico al resto del panel: sesión → authorizeSiteAccess → escritura
 * con admin (service_role) acotada al siteId autorizado.
 */

export interface ActionResult {
  ok: boolean
  error?: string
}

async function currentUserEmail(): Promise<string | null> {
  const supabase = await createServerSupabase()
  const { data } = await supabase.auth.getUser()
  return data.user?.email ?? null
}

/**
 * Guarda los IDs de Pixel de Meta y GA4 del sitio. Un ID vacío se guarda como
 * NULL (equivale a "desactivado"). Requiere plan != 'free'.
 */
export async function saveAnalyticsIds(
  siteId: string,
  input: AnalyticsIdsInput,
): Promise<ActionResult> {
  const email = await currentUserEmail()
  if (!email) return { ok: false, error: 'Tu sesión expiró. Vuelve a entrar.' }

  const authorized = await authorizeSiteAccess(siteId, email)
  if (!authorized) return { ok: false, error: 'No tienes acceso a este sitio.' }

  const parsed = analyticsIdsSchema.safeParse(input)
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? 'Revisa los IDs.'
    return { ok: false, error: first }
  }

  const admin = await createAdminSupabase()

  // Gate por plan: leemos el plan del tenant y bloqueamos free.
  const { data: tenantRow } = await admin
    .from('tenants')
    .select('plan')
    .eq('id', authorized.tenantId)
    .maybeSingle()

  const plan = (tenantRow as { plan: string | null } | null)?.plan ?? 'free'
  if (plan === 'free') {
    return {
      ok: false,
      error: 'Necesitas el plan Emprende (o superior) para activar tus analíticas.',
    }
  }

  const { metaPixelId, gaMeasurementId } = parsed.data

  // ¿Es la primera vez que se guardan? Marcamos analytics_enabled_at.
  const { data: siteRow } = await admin
    .from('sites')
    .select('analytics_enabled_at')
    .eq('id', authorized.siteId)
    .maybeSingle()

  const isFirst =
    (siteRow as { analytics_enabled_at: string | null } | null)?.analytics_enabled_at == null
  const now = new Date().toISOString()
  const hasAnyId = metaPixelId !== null || gaMeasurementId !== null

  const patch: Record<string, unknown> = {
    meta_pixel_id: metaPixelId,
    ga_measurement_id: gaMeasurementId,
    updated_at: now,
  }
  // Guardia legal: solo marcamos `analytics_enabled_at` cuando el sitio tiene
  // los datos legales completos. Aunque el ID se guarde, el layout no inyectará
  // los scripts hasta que `legal_ready = true` (revisado en getSiteAnalyticsBySlug).
  if (isFirst && hasAnyId) {
    const { data: siteRow2 } = await admin
      .from('sites')
      .select('legal_ready')
      .eq('id', authorized.siteId)
      .maybeSingle()
    const legalReady = (siteRow2 as { legal_ready: boolean | null } | null)?.legal_ready === true
    if (legalReady) patch.analytics_enabled_at = now
  }

  const { error } = await admin
    .from('sites')
    .update(patch)
    .eq('id', authorized.siteId)

  if (error) return { ok: false, error: 'No pudimos guardar. Intenta de nuevo.' }

  // Refresca el layout del sitio (donde viven los scripts) + el panel.
  revalidatePath('/editar/analiticas')
  revalidatePath(`/sites/${authorized.slug}`, 'layout')

  return { ok: true }
}
