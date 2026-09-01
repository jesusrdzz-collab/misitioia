import { NextResponse } from 'next/server'
import { EMBED_SCRIPT } from '@/features/embed/snippet'

/**
 * Sirve el snippet universal como application/javascript.
 *
 * Uso en cualquier sitio:
 *   <script src="https://misitio.site/embed/v1.js" data-site="TOKEN" async></script>
 *
 * Es un asset estático (no depende de sesión ni de env): la base de la API la
 * deriva el propio script del origen de su src.
 */
export const dynamic = 'force-static'
export const revalidate = 3600

export function GET() {
  return new NextResponse(EMBED_SCRIPT, {
    status: 200,
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
