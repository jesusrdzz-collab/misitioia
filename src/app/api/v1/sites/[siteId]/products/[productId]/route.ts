import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createAdminSupabase } from '@/lib/supabase/server'
import { requireApiCaller, authorizeSiteForCaller } from '@/lib/api-auth'
import type { SiteProduct } from '@/lib/types/site'

/**
 * PATCH/DELETE /api/v1/sites/{siteId}/products/{productId}
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const productPatchSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(400).nullable().optional(),
  price: z.number().nonnegative().nullable().optional(),
  currency: z.string().max(8).optional(),
  image_url: z.string().max(600).nullable().optional(),
  category: z.string().max(80).nullable().optional(),
  is_active: z.boolean().optional(),
  sort_order: z.number().int().optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string; productId: string }> },
) {
  const { siteId, productId } = await params
  if (!UUID_RE.test(productId)) {
    return NextResponse.json({ error: 'productId inválido.' }, { status: 400 })
  }

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

  const parsed = productPatchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' },
      { status: 400 },
    )
  }

  const patch: Record<string, unknown> = {
    ...parsed.data,
    updated_at: new Date().toISOString(),
  }

  const admin = await createAdminSupabase()
  const { data, error } = await admin
    .from('site_products')
    .update(patch)
    .eq('id', productId)
    .eq('site_id', authz.siteId)
    .select('*')
    .maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Producto no encontrado.' }, { status: 404 })

  return NextResponse.json({ ok: true, product: data as SiteProduct })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string; productId: string }> },
) {
  const { siteId, productId } = await params
  if (!UUID_RE.test(productId)) {
    return NextResponse.json({ error: 'productId inválido.' }, { status: 400 })
  }

  const caller = await requireApiCaller(req, 'write')
  if (caller instanceof NextResponse) return caller

  const authz = await authorizeSiteForCaller(caller, siteId)
  if (authz instanceof NextResponse) return authz

  const admin = await createAdminSupabase()
  const { error } = await admin
    .from('site_products')
    .delete()
    .eq('id', productId)
    .eq('site_id', authz.siteId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
