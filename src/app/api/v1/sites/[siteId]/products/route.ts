import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createAdminSupabase } from '@/lib/supabase/server'
import { requireApiCaller, authorizeSiteForCaller } from '@/lib/api-auth'
import type { SiteProduct } from '@/lib/types/site'

/**
 * GET/POST /api/v1/sites/{siteId}/products
 *
 * GET  → lista los productos del catálogo (activos e inactivos).
 * POST → crea un producto nuevo.
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const productCreateSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(400).nullable().optional(),
  price: z.number().nonnegative().nullable().optional(),
  currency: z.string().max(8).optional(),
  image_url: z.string().max(600).nullable().optional(),
  category: z.string().max(80).nullable().optional(),
  is_active: z.boolean().optional(),
  sort_order: z.number().int().optional(),
})

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
  const { data, error } = await admin
    .from('site_products')
    .select('*')
    .eq('site_id', authz.siteId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ products: (data as SiteProduct[]) ?? [] })
}

export async function POST(
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

  const parsed = productCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' },
      { status: 400 },
    )
  }
  const p = parsed.data

  const admin = await createAdminSupabase()
  const { data, error } = await admin
    .from('site_products')
    .insert({
      site_id: authz.siteId,
      tenant_id: authz.tenantId,
      name: p.name,
      description: p.description ?? null,
      price: p.price ?? null,
      currency: p.currency || 'MXN',
      image_url: p.image_url || null,
      category: p.category ?? null,
      is_active: p.is_active ?? true,
      sort_order: p.sort_order ?? 0,
    })
    .select('*')
    .single()

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? 'No se pudo crear el producto.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true, product: data as SiteProduct })
}
