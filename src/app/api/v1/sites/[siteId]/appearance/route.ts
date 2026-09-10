import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createAdminSupabase } from '@/lib/supabase/server'
import { requireApiCaller, authorizeSiteForCaller } from '@/lib/api-auth'

/**
 * PATCH /api/v1/sites/{siteId}/appearance — cambia colores/emoji/imágenes de portada.
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

const schema = z.object({
  primary_color: z.string().regex(HEX).optional(),
  accent_color: z.string().regex(HEX).optional(),
  emoji: z.string().max(8).nullable().optional(),
  hero_title: z.string().max(160).nullable().optional(),
  hero_subtitle: z.string().max(240).nullable().optional(),
  hero_image_url: z.string().max(600).nullable().optional(),
  about_image_url: z.string().max(600).nullable().optional(),
  logo_url: z.string().max(600).nullable().optional(),
})

export async function PATCH(
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
      { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' },
      { status: 400 },
    )
  }

  const patch: Record<string, unknown> = {
    ...parsed.data,
    updated_at: new Date().toISOString(),
  }
  const admin = await createAdminSupabase()
  const { error } = await admin
    .from('site_content')
    .update(patch)
    .eq('site_id', authz.siteId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
