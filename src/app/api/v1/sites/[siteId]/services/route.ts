import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createAdminSupabase } from '@/lib/supabase/server'
import { requireApiCaller, authorizeSiteForCaller } from '@/lib/api-auth'
import type { ServiceItem, SiteContent } from '@/lib/types/site'

/**
 * GET/PUT /api/v1/sites/{siteId}/services — reemplaza la lista completa de servicios.
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const schema = z
  .array(
    z.object({
      name: z.string().min(1).max(80),
      description: z.string().max(240).nullable().optional(),
      icon: z.string().max(8).nullable().optional(),
    }),
  )
  .max(12)

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
    .from('site_content')
    .select('services')
    .eq('site_id', authz.siteId)
    .maybeSingle()

  const services = ((data as Partial<SiteContent> | null)?.services ?? []) as ServiceItem[]
  return NextResponse.json({ services })
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> },
) {
  const { siteId } = await params
  const caller = await requireApiCaller(req, 'write')
  if (caller instanceof NextResponse) return caller

  const authz = await authorizeSiteForCaller(caller, siteId)
  if (authz instanceof NextResponse) return authz

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido.' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Cada servicio necesita nombre.' },
      { status: 400 },
    )
  }

  const clean: ServiceItem[] = parsed.data.map((s) => ({
    name: s.name,
    description: s.description ?? null,
    icon: s.icon ?? null,
  }))

  const admin = await createAdminSupabase()
  const { error } = await admin
    .from('site_content')
    .update({ services: clean, updated_at: new Date().toISOString() })
    .eq('site_id', authz.siteId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, services: clean })
}
