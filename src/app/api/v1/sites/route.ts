import { NextResponse, type NextRequest } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase/server'
import { requireApiCaller } from '@/lib/api-auth'

/**
 * GET /api/v1/sites — lista los sitios del dueño autenticado (Bearer o cookie).
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const caller = await requireApiCaller(req, 'read')
  if (caller instanceof NextResponse) return caller
  if (!caller.email) {
    return NextResponse.json(
      { error: 'La cuenta no tiene correo asociado.' },
      { status: 403 },
    )
  }

  const admin = await createAdminSupabase()
  const { data: tenants } = await admin
    .from('tenants')
    .select('id')
    .eq('owner_email', caller.email.toLowerCase().trim())

  const tenantIds = (tenants ?? []).map((t) => (t as { id: string }).id)
  if (tenantIds.length === 0) return NextResponse.json({ sites: [] })

  const { data: sites, error } = await admin
    .from('sites')
    .select('id, slug, business_name, status, giro, custom_domain, created_at, updated_at')
    .in('tenant_id', tenantIds)
    .neq('status', 'dado_de_baja')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    sites: (sites ?? []).map((s) => {
      const row = s as {
        id: string
        slug: string
        business_name: string
        status: string
        giro: string | null
        custom_domain: string | null
        created_at: string
        updated_at: string
      }
      return {
        id: row.id,
        slug: row.slug,
        businessName: row.business_name,
        status: row.status,
        giro: row.giro,
        customDomain: row.custom_domain,
        url: `https://${row.slug}.misitio.site`,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }
    }),
  })
}
