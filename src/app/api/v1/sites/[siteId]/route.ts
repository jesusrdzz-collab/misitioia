import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createAdminSupabase } from '@/lib/supabase/server'
import { requireApiCaller, authorizeSiteForCaller } from '@/lib/api-auth'
import { recalculateLegalReady } from '@/lib/legal-guard'
import type { SiteContent } from '@/lib/types/site'

/**
 * GET/PATCH /api/v1/sites/{siteId}
 *
 * GET   → sitio + contenido editable + horarios + redes.
 * PATCH → actualiza contacto, ubicación, "acerca de", horarios y redes.
 *         Es el equivalente a `saveVictoriaBasics` del panel, pero por REST.
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const contentPatchSchema = z.object({
  about_text: z.string().max(1500).nullable().optional(),
  contact_phone: z.string().max(40).nullable().optional(),
  contact_whatsapp: z.string().max(40).nullable().optional(),
  contact_email: z.string().max(160).nullable().optional(),
  contact_address: z.string().max(300).nullable().optional(),
  responsable_nombre: z.string().max(200).nullable().optional(),
  responsable_domicilio: z.string().max(400).nullable().optional(),
  ciudad: z.string().max(120).nullable().optional(),
  zona: z.string().max(120).nullable().optional(),
  estado: z.string().max(120).nullable().optional(),
  social_facebook: z.string().max(300).nullable().optional(),
  social_instagram: z.string().max(300).nullable().optional(),
  working_hours: z.record(z.string(), z.string()).nullable().optional(),
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
  const { data: siteRow } = await admin
    .from('sites')
    .select('*')
    .eq('id', authz.siteId)
    .maybeSingle()
  const { data: contentRow } = await admin
    .from('site_content')
    .select('*')
    .eq('site_id', authz.siteId)
    .maybeSingle()

  return NextResponse.json({ site: siteRow, content: contentRow })
}

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

  const parsed = contentPatchSchema.safeParse(body)
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

  await recalculateLegalReady(admin, authz.siteId)

  const { data: contentRow } = await admin
    .from('site_content')
    .select('*')
    .eq('site_id', authz.siteId)
    .maybeSingle()

  return NextResponse.json({ ok: true, content: contentRow as SiteContent | null })
}
