import { getSiteBySlug } from '@/lib/sites/queries'
import { buildLlmsTxt } from '@/features/aeo/llms'

interface Ctx {
  params: Promise<{ slug: string }>
}

// Cachea 1 hora (negocio de volumen; datos cambian poco).
export const revalidate = 3600

/**
 * /llms.txt por sitio. Describe el negocio real para asistentes de IA.
 * Se sirve en cualquier estado publicado (no en 'dado_de_baja', que la RLS
 * oculta → getSiteBySlug devuelve null → 404). No indexa en Google; solo
 * ayuda a que la IA reconozca el negocio.
 */
export async function GET(_req: Request, { params }: Ctx) {
  const { slug } = await params
  const data = await getSiteBySlug(slug)
  if (!data) {
    return new Response('No encontrado', { status: 404 })
  }
  const body = buildLlmsTxt(data)
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
