import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createAdminSupabase } from '@/lib/supabase/server'
import { sendVictoriaMessage } from '@/lib/konnex'

/**
 * Proxy server-side del widget de Victoria (integración "de regreso" con
 * Konnex). El widget corre en el MISMO sitio (slug.misitio.site o la home de
 * MiSitio), así que es same-origin: no requiere CORS.
 *
 * Dos modos (exactamente uno por request):
 *   1. Modo sitio — Body: { slug, sessionId, texto }. Resuelve el sitio por
 *      `slug` → su tenant → `konnex_webchat_token`.
 *   2. Modo self — Body: { self:true, sessionId, texto }. Es la Victoria de la
 *      propia MiSitio (homepage de marketing): el token sale de la variable de
 *      entorno KONNEX_SELF_WEBCHAT_TOKEN (tenant dedicado de MiSitio, cargado
 *      con su propia KB). No hay lookup a la BD.
 *
 * En ambos, si no hay token, responde { ok:false, error:'victoria_no_configurada' }
 * con 200 para que el widget muestre un estado amable. El token NUNCA sale al
 * navegador: se usa sólo aquí para llamar a Konnex.
 *
 * INERTE hasta que Konnex despliegue `/api/webchat/message` y se aprovisione
 * el token (por tenant o el self de MiSitio).
 * Ver ESTUDIO/CONTRATO_VICTORIA_KONNEX_MISITIO_2026-09-01.md
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Exactamente uno de `slug` (modo sitio) o `self:true` (modo self) por request.
const bodySchema = z
  .object({
    slug: z.string().min(1).max(120).optional(),
    self: z.literal(true).optional(),
    sessionId: z.string().min(1).max(120),
    texto: z.string().min(1).max(2000),
  })
  .refine((b) => (b.slug != null) !== (b.self === true), {
    message: 'Debe venir exactamente uno de slug o self',
  })

export async function POST(req: NextRequest) {
  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'json_invalido' }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'datos_invalidos' }, { status: 400 })
  }
  const { slug, self, sessionId, texto } = parsed.data

  // Resolver el token según el modo.
  let token: string | null | undefined

  if (self) {
    // Modo self: la Victoria de la propia MiSitio (homepage). Token por env.
    token = process.env.KONNEX_SELF_WEBCHAT_TOKEN
    if (!token) {
      // Sin aprovisionar → el widget se oculta con gracia.
      return NextResponse.json({ ok: false, error: 'victoria_no_configurada' }, { status: 200 })
    }
  } else {
    // Modo sitio: resolver el sitio → tenant (admin: bypass RLS, acotado al slug).
    const admin = await createAdminSupabase()
    const { data: site } = await admin
      .from('sites')
      .select('id, tenant_id, status')
      .eq('slug', slug as string)
      .maybeSingle()

    if (!site) {
      return NextResponse.json({ ok: false, error: 'sitio_no_encontrado' }, { status: 404 })
    }

    const { data: tenant } = await admin
      .from('tenants')
      .select('konnex_tenant_id, konnex_webchat_token')
      .eq('id', (site as { tenant_id: string }).tenant_id)
      .maybeSingle()

    token = (tenant as { konnex_webchat_token: string | null } | null)?.konnex_webchat_token
    if (!token) {
      // Aún sin aprovisionar → el widget muestra "disponible pronto".
      return NextResponse.json({ ok: false, error: 'victoria_no_configurada' }, { status: 200 })
    }
  }

  const result = await sendVictoriaMessage({ token, sessionId, texto })
  if (!result.ok) {
    // Falla de Konnex (inalcanzable, timeout, 4xx/429): estado amable, no 500.
    return NextResponse.json({ ok: false, error: result.error }, { status: 200 })
  }

  return NextResponse.json({ ok: true, respuesta: result.respuesta })
}
