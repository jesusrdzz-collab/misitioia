/**
 * Candado de 1 regeneración IA por foto por sitio (Sprint 7-sep-2026).
 *
 * Antes de encender la campaña Meta necesitamos un tope duro al costo de
 * Gemini por sitio. Este helper hace 3 cosas en orden:
 *
 *   1. Reserva atómicamente el slot: CAS `<slot>_regens_used = 0` → 1
 *      (si dos clics llegan a la vez, uno pierde la carrera).
 *   2. Llama a `regenerateSingleImage` (que usa Gemini).
 *   3. Si Gemini fue quien produjo la imagen (source='ai'): guarda la URL
 *      y deja el contador en 1 (usado).
 *      Si terminó cayendo a stock (source='stock'): guarda la URL y ROLL
 *      BACK del contador a 0 — el cliente no gastó Gemini, no lo penalizamos.
 *      Si falló todo: ROLL BACK del contador a 0 para que pueda retryar.
 *
 * Costo tope por sitio: 3 iniciales stock + 3 regens IA × $0.039 = $0.117 USD.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { regenerateSingleImage } from './images'

export type ImageSlot = 'hero' | 'about' | 'catalog'

export const REGEN_LIMIT_PER_SLOT = 1

const COUNTER_COLUMN: Record<ImageSlot, string> = {
  hero: 'hero_regens_used',
  about: 'about_regens_used',
  catalog: 'catalog_regens_used',
}

const IMAGE_COLUMN: Record<ImageSlot, string> = {
  hero: 'hero_image_url',
  about: 'about_image_url',
  catalog: 'catalog_placeholder_url',
}

export interface RegenLockInput {
  slot: ImageSlot
  siteId: string
  tenantId: string
  giro: string | null
  giroLibre: string | null
  admin: SupabaseClient
}

export type RegenLockErrorCode = 'REGEN_LIMIT_REACHED' | 'GEN_FAILED' | 'DB_ERROR'

export interface RegenLockResult {
  ok: boolean
  url?: string
  source?: 'ai' | 'stock'
  error?: string
  code?: RegenLockErrorCode
  /** Cuántas regens quedan en este slot (0 o 1). */
  regensRemaining?: number
}

/**
 * Regenera una imagen aplicando el candado de 1-uso por slot.
 */
export async function regenerateImageWithLock(input: RegenLockInput): Promise<RegenLockResult> {
  const counterCol = COUNTER_COLUMN[input.slot]
  const imageCol = IMAGE_COLUMN[input.slot]
  const nowIso = new Date().toISOString()

  // 1. Reservar el slot: CAS de 0 → 1. Si el update afecta 0 filas, ya está
  //    usado (otro clic ganó la carrera, o el cliente ya lo agotó).
  const { data: reserved, error: reserveErr } = await input.admin
    .from('site_content')
    .update({ [counterCol]: 1, updated_at: nowIso })
    .eq('site_id', input.siteId)
    .eq(counterCol, 0)
    .select('site_id')

  if (reserveErr) {
    return {
      ok: false,
      code: 'DB_ERROR',
      error: reserveErr.message,
    }
  }

  if (!reserved || reserved.length === 0) {
    return {
      ok: false,
      code: 'REGEN_LIMIT_REACHED',
      error: 'Ya usaste la regeneración de esta imagen. Puedes subir tu propia foto sin límite.',
      regensRemaining: 0,
    }
  }

  // 2. Slot reservado. Correr la generación real.
  const gen = await regenerateSingleImage({
    slot: input.slot,
    giro: input.giro,
    giroLibre: input.giroLibre,
    tenantId: input.tenantId,
    siteId: input.siteId,
    admin: input.admin,
  })

  // 3a. Falló todo → devolver el contador para que pueda retryar.
  if (!gen.ok || !gen.url) {
    await rollbackCounter(input.admin, input.siteId, counterCol)
    return {
      ok: false,
      code: 'GEN_FAILED',
      error: gen.error ?? 'No se pudo generar la imagen. Intenta de nuevo.',
      regensRemaining: 1,
    }
  }

  // 3b. Cayó a stock (no gastó Gemini) → devolver el contador y guardar URL.
  if (gen.source !== 'ai') {
    await rollbackCounter(input.admin, input.siteId, counterCol)
    const { error: saveErr } = await input.admin
      .from('site_content')
      .update({ [imageCol]: gen.url, updated_at: nowIso })
      .eq('site_id', input.siteId)
    if (saveErr) {
      return { ok: false, code: 'DB_ERROR', error: saveErr.message, regensRemaining: 1 }
    }
    return { ok: true, url: gen.url, source: 'stock', regensRemaining: 1 }
  }

  // 3c. Gemini SÍ generó → guardar URL, mantener contador en 1.
  const { error: saveErr } = await input.admin
    .from('site_content')
    .update({ [imageCol]: gen.url, updated_at: nowIso })
    .eq('site_id', input.siteId)

  if (saveErr) {
    // La imagen ya se subió al bucket. No podemos rollback confiable de la
    // URL, pero el contador se queda en 1 igual (el gasto de Gemini ocurrió).
    return { ok: false, code: 'DB_ERROR', error: saveErr.message, regensRemaining: 0 }
  }

  return { ok: true, url: gen.url, source: 'ai', regensRemaining: 0 }
}

async function rollbackCounter(
  admin: SupabaseClient,
  siteId: string,
  counterCol: string,
): Promise<void> {
  const { error } = await admin
    .from('site_content')
    .update({ [counterCol]: 0, updated_at: new Date().toISOString() })
    .eq('site_id', siteId)
  if (error) {
    console.warn(`[regen-lock] rollback ${counterCol} falló:`, error.message)
  }
}

/**
 * Lee el estado actual de regeneraciones para armar la UI (botones
 * habilitados / deshabilitados). Devuelve `null` si no hay `site_content`.
 */
export async function getRegenState(
  admin: SupabaseClient,
  siteId: string,
): Promise<Record<ImageSlot, number> | null> {
  const { data } = await admin
    .from('site_content')
    .select('hero_regens_used, about_regens_used, catalog_regens_used')
    .eq('site_id', siteId)
    .maybeSingle()
  if (!data) return null
  const row = data as {
    hero_regens_used: number | null
    about_regens_used: number | null
    catalog_regens_used: number | null
  }
  return {
    hero: row.hero_regens_used ?? 0,
    about: row.about_regens_used ?? 0,
    catalog: row.catalog_regens_used ?? 0,
  }
}
