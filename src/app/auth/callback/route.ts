import { NextResponse, type NextRequest } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

/**
 * Callback del magic link. Supabase devuelve un `code` (PKCE) que intercambiamos
 * por una sesión. El verifier vive en cookie (lo puso sendMagicLink server-side).
 * Luego redirige a `next` (por defecto /editar).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/editar'

  if (code) {
    const supabase = await createServerSupabase()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/editar?error=auth`)
}
