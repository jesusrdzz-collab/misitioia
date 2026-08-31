import { NextResponse, type NextRequest } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

/**
 * Inicia el login con Google (OAuth). Server-side para mantener el verifier PKCE
 * en cookie, igual que el magic link — así `/auth/callback` intercambia el `code`
 * sin cambios. Requiere: proveedor Google habilitado en Supabase Auth + el
 * OAuth Client (Web) de Google con redirect a
 * https://{PROJECT_REF}.supabase.co/auth/v1/callback.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const next = searchParams.get('next') || '/editar'

  const supabase = await createServerSupabase()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  })

  if (error || !data?.url) {
    return NextResponse.redirect(`${origin}/editar?error=google`)
  }
  return NextResponse.redirect(data.url)
}
