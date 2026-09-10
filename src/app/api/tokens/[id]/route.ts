import { NextResponse, type NextRequest } from 'next/server'
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase/server'

/**
 * DELETE /api/tokens/[id] — revoca (soft delete) el token cuyo id se pasa.
 * Sólo el dueño autenticado por cookie puede revocar. Bearer no aplica.
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: 'Id inválido.' }, { status: 400 })
  }

  // Los tokens NO pueden revocar tokens (bloqueo Bearer explícito).
  if (req.headers.get('x-api-token-id')) {
    return NextResponse.json(
      { error: 'Los tokens no pueden gestionarse con Bearer. Inicia sesión.' },
      { status: 403 },
    )
  }

  const supabase = await createServerSupabase()
  const { data } = await supabase.auth.getUser()
  const user = data.user
  if (!user) {
    return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
  }

  const admin = await createAdminSupabase()
  const { error, data: updated } = await admin
    .from('api_tokens')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .is('revoked_at', null)
    .select('id')
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  if (!updated) {
    return NextResponse.json(
      { error: 'Token no encontrado o ya revocado.' },
      { status: 404 },
    )
  }

  return NextResponse.json({ ok: true })
}
