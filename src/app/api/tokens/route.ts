import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase/server'
import {
  generateApiToken,
  isValidScope,
  VALID_SCOPES,
  type ApiTokenScope,
} from '@/lib/api-tokens'

/**
 * Gestión de API tokens del usuario autenticado.
 *
 * IMPORTANTE: SÓLO se acepta autenticación por cookie de sesión (nunca Bearer).
 * Un token no puede crear ni listar otros tokens — eso lo hace sólo el humano
 * que entró con Google / magic link.
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const createTokenSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio.').max(80),
  scopes: z.array(z.string()).optional(),
  /** ISO string opcional. Si viene, debe ser futuro. */
  expiresAt: z.string().datetime().optional().nullable(),
})

/**
 * Guarda mediante cookie de sesión. Si viene con Bearer (o sin sesión) → 401.
 * Devuelve el user.id del dueño autenticado.
 */
async function requireCookieUser(
  req: NextRequest,
): Promise<{ userId: string } | NextResponse> {
  // El middleware pone x-api-token-id sólo cuando entró un Bearer válido.
  // Bloqueamos gestión de tokens vía Bearer para no darle escalada de privilegio.
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
  return { userId: user.id }
}

export async function GET(req: NextRequest) {
  const authed = await requireCookieUser(req)
  if (authed instanceof NextResponse) return authed

  const admin = await createAdminSupabase()
  const { data, error } = await admin
    .from('api_tokens')
    .select(
      'id, name, token_prefix, scopes, last_used_at, expires_at, revoked_at, created_at',
    )
    .eq('user_id', authed.userId)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ tokens: data ?? [] })
}

export async function POST(req: NextRequest) {
  const authed = await requireCookieUser(req)
  if (authed instanceof NextResponse) return authed

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido.' }, { status: 400 })
  }

  const parsed = createTokenSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' },
      { status: 400 },
    )
  }

  const { name, expiresAt } = parsed.data

  // Scopes: normalizar y filtrar a los válidos. Si no llega nada, default seguro.
  const rawScopes = parsed.data.scopes ?? ['read', 'write']
  const scopes: ApiTokenScope[] = Array.from(
    new Set(
      rawScopes
        .map((s) => s.trim().toLowerCase())
        .filter((s): s is ApiTokenScope => isValidScope(s)),
    ),
  )
  if (scopes.length === 0) {
    return NextResponse.json(
      { error: `Elige al menos un scope: ${VALID_SCOPES.join(', ')}.` },
      { status: 400 },
    )
  }

  if (expiresAt) {
    const exp = new Date(expiresAt)
    if (Number.isNaN(exp.getTime()) || exp.getTime() <= Date.now()) {
      return NextResponse.json(
        { error: 'La fecha de expiración debe ser futura.' },
        { status: 400 },
      )
    }
  }

  const { plaintext, prefix, hash } = await generateApiToken()

  const admin = await createAdminSupabase()
  const { data, error } = await admin
    .from('api_tokens')
    .insert({
      user_id: authed.userId,
      name,
      token_prefix: prefix,
      token_hash: hash,
      scopes,
      expires_at: expiresAt ?? null,
    })
    .select('id, name, token_prefix, scopes, expires_at, created_at')
    .single()

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? 'No se pudo crear el token.' },
      { status: 500 },
    )
  }

  // PLAINTEXT devuelto UNA sola vez. No queda en BD.
  return NextResponse.json({
    id: data.id,
    name: data.name,
    prefix: data.token_prefix,
    scopes: data.scopes,
    expiresAt: data.expires_at,
    createdAt: data.created_at,
    plaintext,
  })
}
