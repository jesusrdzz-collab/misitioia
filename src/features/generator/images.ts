/**
 * Generador de imágenes IA por sitio (Sprint 6-sep-2026).
 *
 * Doctrina heredada de AdGenesis (memoria `adgenesis-gemini-texto-espanol-falla`):
 *   - Gemini 2.5 Flash Image (Nano Banana) escribe MAL en español si le pides
 *     texto quemado. Regla NOTXT dura: nada de letras dentro de la imagen. El
 *     texto se coloca por CSS/HTML encima, jamás dentro del bitmap.
 *   - Fotografía realista (no ilustración cartoon) salvo giros lúdicos.
 *   - Fallback a stock por giro si Gemini falla o no hay API key: NUNCA
 *     dejamos la página sin imagen.
 *
 * Uso:
 *   const urls = await generateSiteImages({ businessName, giro, tenantId, siteId })
 *   → { hero_image_url, about_image_url, catalog_placeholder_url }
 *
 * Costo esperado: ~3 × $0.039 USD = ~$0.12 por sitio nuevo.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { stockImageFor } from './stock-fallback'
import { promptForGiro } from './image-prompts'
import { applyMisitioWatermark } from './watermark'

const IMAGE_MODEL = 'gemini-2.5-flash-image'
const IMAGE_ENDPOINT = (model: string, key: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`

/** Regla dura anti-texto que se aplica en TODO prompt de imagen. */
const NOTXT =
  'absolutely no text, no letters, no words, no numbers, no watermarks, ' +
  'no logos, no captions, no signs — the image must be completely free of ' +
  'any writing.'

export interface SiteImageResult {
  hero_image_url: string | null
  about_image_url: string | null
  catalog_placeholder_url: string | null
  /** cuántas se generaron con IA (no fallback). Para reporte de costo. */
  ai_generated: number
  /** costo aproximado en USD */
  estimated_cost_usd: number
}

export interface GenerateSiteImagesInput {
  businessName: string
  giro: string | null
  tenantId: string
  siteId: string
  /** Cliente admin (bypass RLS) para subir a Storage. */
  admin: SupabaseClient
  apiKey?: string
  /**
   * Cuando false, se salta la IA y usa directamente el fallback stock por giro.
   * Útil para el paso 1a del wizard: preview rápido y barato antes de que el
   * cliente decida seguir. Default true (comportamiento previo).
   */
  aiEnabled?: boolean
}

const COST_PER_IMAGE = 0.039 // USD, Gemini 2.5 Flash Image (Nano Banana)

/**
 * Genera 3 imágenes IA (hero 16:9, about 4:3, catalog 1:1) y las sube a
 * Supabase Storage. Falla suave a stock por giro si algo se cae.
 */
export async function generateSiteImages(
  input: GenerateSiteImagesInput,
): Promise<SiteImageResult> {
  // aiEnabled=false → forzamos stock (pasando apiKey vacío a tryGenerate)
  const apiKey =
    input.aiEnabled === false ? '' : (input.apiKey ?? process.env.GEMINI_API_KEY ?? '')
  const prompts = promptForGiro(input.giro)

  // Ejecutar en paralelo, cada uno con su fallback. Fallar en una no tumba
  // las otras.
  const [hero, about, catalog] = await Promise.all([
    tryGenerate({
      slot: 'hero',
      prompt: `${prompts.hero} ${NOTXT}`,
      aspectRatio: '16:9',
      giro: input.giro,
      apiKey,
      admin: input.admin,
      tenantId: input.tenantId,
      siteId: input.siteId,
    }),
    tryGenerate({
      slot: 'about',
      prompt: `${prompts.about} ${NOTXT}`,
      aspectRatio: '4:3',
      giro: input.giro,
      apiKey,
      admin: input.admin,
      tenantId: input.tenantId,
      siteId: input.siteId,
    }),
    tryGenerate({
      slot: 'catalog',
      prompt: `${prompts.catalog} ${NOTXT}`,
      aspectRatio: '1:1',
      giro: input.giro,
      apiKey,
      admin: input.admin,
      tenantId: input.tenantId,
      siteId: input.siteId,
    }),
  ])

  const ai_generated = [hero, about, catalog].filter((r) => r.source === 'ai').length

  return {
    hero_image_url: hero.url,
    about_image_url: about.url,
    catalog_placeholder_url: catalog.url,
    ai_generated,
    estimated_cost_usd: ai_generated * COST_PER_IMAGE,
  }
}

/**
 * Regenera UNA sola imagen (endpoint para el panel de apariencia).
 * Reemplaza el archivo del bucket y devuelve la nueva URL pública.
 */
export async function regenerateSingleImage(input: {
  slot: 'hero' | 'about' | 'catalog'
  giro: string | null
  tenantId: string
  siteId: string
  admin: SupabaseClient
  apiKey?: string
}): Promise<{ ok: boolean; url?: string; source?: 'ai' | 'stock'; error?: string }> {
  const apiKey = input.apiKey ?? process.env.GEMINI_API_KEY ?? ''
  const prompts = promptForGiro(input.giro)
  const promptText = prompts[input.slot]
  const aspectRatio =
    input.slot === 'hero' ? '16:9' : input.slot === 'about' ? '4:3' : '1:1'

  try {
    const result = await tryGenerate({
      slot: input.slot,
      prompt: `${promptText} ${NOTXT}`,
      aspectRatio,
      giro: input.giro,
      apiKey,
      admin: input.admin,
      tenantId: input.tenantId,
      siteId: input.siteId,
    })
    if (!result.url) return { ok: false, error: 'No se generó imagen' }
    return {
      ok: true,
      url: result.url,
      source: result.source === 'ai' ? 'ai' : 'stock',
    }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

// ————————————————————————————————————————————————————————————————
// Interno: llamar a Gemini + subir a Storage con fallback a stock
// ————————————————————————————————————————————————————————————————

interface GenSlot {
  slot: 'hero' | 'about' | 'catalog'
  prompt: string
  aspectRatio: '16:9' | '4:3' | '1:1'
  giro: string | null
  apiKey: string
  admin: SupabaseClient
  tenantId: string
  siteId: string
}

interface SlotResult {
  url: string | null
  source: 'ai' | 'stock' | 'none'
}

async function tryGenerate(gen: GenSlot): Promise<SlotResult> {
  if (gen.apiKey) {
    try {
      const bytes = await callGeminiImage(gen.prompt, gen.aspectRatio, gen.apiKey)
      if (bytes) {
        const url = await uploadImage(gen.admin, gen.tenantId, gen.siteId, gen.slot, bytes)
        if (url) return { url, source: 'ai' }
      }
    } catch (e) {
      // Log server-side; caemos a stock.
      console.warn(`[images] Gemini falló en ${gen.slot}:`, (e as Error).message)
    }
  }

  // Fallback: URL de stock por giro. No requiere subida.
  const stock = stockImageFor(gen.giro, gen.slot)
  return { url: stock, source: stock ? 'stock' : 'none' }
}

async function callGeminiImage(
  prompt: string,
  aspectRatio: '16:9' | '4:3' | '1:1',
  apiKey: string,
): Promise<Uint8Array | null> {
  const res = await fetch(IMAGE_ENDPOINT(IMAGE_MODEL, apiKey), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ['IMAGE'],
        imageConfig: { aspectRatio },
      },
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Gemini HTTP ${res.status}: ${body.slice(0, 200)}`)
  }

  const data = (await res.json()) as {
    candidates?: {
      finishReason?: string
      content?: { parts?: { inlineData?: { data?: string; mimeType?: string } }[] }
    }[]
  }

  const candidate = data.candidates?.[0]
  if (candidate?.finishReason === 'SAFETY') {
    throw new Error('Bloqueada por seguridad')
  }

  for (const part of candidate?.content?.parts ?? []) {
    const b64 = part.inlineData?.data
    if (b64) {
      return base64ToBytes(b64)
    }
  }
  return null
}

function base64ToBytes(b64: string): Uint8Array {
  const clean = b64.replace(/^data:image\/[a-z]+;base64,/, '')
  const buf = Buffer.from(clean, 'base64')
  return new Uint8Array(buf)
}

async function uploadImage(
  admin: SupabaseClient,
  tenantId: string,
  siteId: string,
  slot: string,
  bytes: Uint8Array,
): Promise<string | null> {
  // Watermark "misitio.site" antes de subir. Falla suave: si el watermark
  // truena devolvemos los bytes originales (nunca dejamos el pipeline sin
  // imagen por culpa de la marca).
  const stamped = await applyMisitioWatermark(bytes)

  // Path predecible por slot para que regenerar sobreescriba.
  // ai/{siteId}/{slot}-{timestamp}.png para que el cache-busting funcione.
  const path = `${tenantId}/${siteId}/ai/${slot}-${Date.now()}.png`
  const { error } = await admin.storage.from('site-images').upload(path, stamped, {
    contentType: 'image/png',
    upsert: true,
  })
  if (error) {
    console.warn('[images] upload falló:', error.message)
    return null
  }
  const { data } = admin.storage.from('site-images').getPublicUrl(path)
  return data.publicUrl
}
