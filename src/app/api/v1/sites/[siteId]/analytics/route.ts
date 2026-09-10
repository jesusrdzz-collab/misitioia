import { NextResponse, type NextRequest } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase/server'
import { requireApiCaller, authorizeSiteForCaller } from '@/lib/api-auth'

/**
 * GET /api/v1/sites/{siteId}/analytics
 *
 * Devuelve la configuración de analíticas del sitio: Meta Pixel ID, GA4
 * Measurement ID y desde cuándo están activas. Las métricas reales viven
 * en Meta Events Manager / Google Analytics y las consulta el cliente allá.
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> },
) {
  const { siteId } = await params
  const caller = await requireApiCaller(req, 'read')
  if (caller instanceof NextResponse) return caller

  const authz = await authorizeSiteForCaller(caller, siteId)
  if (authz instanceof NextResponse) return authz

  const admin = await createAdminSupabase()
  const { data } = await admin
    .from('sites')
    .select('meta_pixel_id, ga_measurement_id, analytics_enabled_at')
    .eq('id', authz.siteId)
    .maybeSingle()

  const row = (data as {
    meta_pixel_id: string | null
    ga_measurement_id: string | null
    analytics_enabled_at: string | null
  } | null) ?? {
    meta_pixel_id: null,
    ga_measurement_id: null,
    analytics_enabled_at: null,
  }

  return NextResponse.json({
    slug: authz.slug,
    metaPixelId: row.meta_pixel_id,
    gaMeasurementId: row.ga_measurement_id,
    analyticsEnabledAt: row.analytics_enabled_at,
    note:
      'Las métricas de tráfico se ven en Meta Events Manager (business.facebook.com/events_manager) y en Google Analytics (analytics.google.com) usando los IDs de arriba.',
  })
}
