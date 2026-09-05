import { createClient } from '@supabase/supabase-js'
import type { PlanLevel } from '@/lib/types/site'

/**
 * Lectura pública, mínima y anónima, de los IDs de analíticas de un sitio para
 * inyectarlos en el layout del sitio publicado.
 *
 * Se corre en el servidor (RSC/ISR) pero usa el cliente anónimo — la lectura
 * está permitida por RLS igual que el resto de campos públicos del sitio.
 *
 * Devuelve null si el sitio no existe o está dado de baja. También devuelve el
 * plan del tenant para que el layout aplique el gate por plan sin re-consultar.
 */

export interface SiteAnalyticsConfig {
  plan: PlanLevel
  metaPixelId: string | null
  gaMeasurementId: string | null
}

function publicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  )
}

function normalizePlan(raw: string | null | undefined): PlanLevel {
  switch (raw) {
    case 'free':
    case 'emprende':
    case 'crece':
    case 'pro':
      return raw
    // Compatibilidad con valores legacy vistos en normalizePlan del panel.
    case 'nivel_2':
      return 'emprende'
    case 'nivel_3':
      return 'crece'
    default:
      return 'free'
  }
}

export async function getSiteAnalyticsBySlug(
  slug: string,
): Promise<SiteAnalyticsConfig | null> {
  const supabase = publicClient()
  const { data } = await supabase
    .from('sites')
    .select('meta_pixel_id, ga_measurement_id, tenants(plan)')
    .eq('slug', slug)
    .maybeSingle()

  if (!data) return null

  // Supabase modela relaciones anidadas como array o como objeto según el join.
  // Aceptamos ambas formas y sacamos el primer tenant si viene como array.
  const row = data as unknown as {
    meta_pixel_id: string | null
    ga_measurement_id: string | null
    tenants: { plan: string | null } | Array<{ plan: string | null }> | null
  }

  const tenant = Array.isArray(row.tenants) ? row.tenants[0] ?? null : row.tenants
  return {
    plan: normalizePlan(tenant?.plan ?? null),
    metaPixelId: row.meta_pixel_id ?? null,
    gaMeasurementId: row.ga_measurement_id ?? null,
  }
}
