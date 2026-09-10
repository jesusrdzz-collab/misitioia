import { createServerSupabase, createAdminSupabase } from '@/lib/supabase/server'
import { LoginGate } from '@/features/editor/components/LoginGate'
import { ApiTokensManager, type ApiTokenRow } from '@/features/api-tokens/components/ApiTokensManager'
import Link from 'next/link'
import { LogoMark } from '@/features/marketing/components/Logo'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'API Tokens — MiSitio IA',
  robots: { index: false },
}

/**
 * Panel de API tokens del usuario. Los tokens permiten controlar MiSitio
 * desde ChatGPT, Claude, Gemini, Zapier o cualquier cliente que soporte
 * `Authorization: Bearer sk_mi_...`.
 */
export default async function ApiTokensPage() {
  const supabase = await createServerSupabase()
  const { data } = await supabase.auth.getUser()
  const user = data.user

  if (!user) {
    return <LoginGate next="/settings/api-tokens" title="Entra para gestionar tus tokens" />
  }

  const admin = await createAdminSupabase()
  const { data: rows } = await admin
    .from('api_tokens')
    .select('id, name, token_prefix, scopes, last_used_at, expires_at, revoked_at, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const tokens = (rows as ApiTokenRow[]) ?? []

  return (
    <div className="min-h-[100dvh] bg-gray-50">
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 md:px-8">
          <Link href="/editar" className="flex items-center gap-2">
            <LogoMark className="h-9 w-9" />
            <span className="text-sm font-semibold text-gray-900">MiSitio IA</span>
          </Link>
          <div className="text-xs text-gray-400 truncate">Sesión: {user.email}</div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-6 md:px-8 md:py-10">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight">API Tokens</h1>
          <p className="mt-2 text-sm text-gray-500 max-w-2xl">
            Conecta MiSitio con ChatGPT, Claude, Gemini o Zapier. Un token es una llave
            personal que autoriza cambios en tus sitios (editar datos, publicar productos,
            revisar analíticas) sin tener que abrir el panel.
          </p>
        </div>

        <ApiTokensManager initialTokens={tokens} />

        <section className="mt-10 rounded-2xl border border-gray-100 bg-white p-5 md:p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900">Cómo usarlo</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manda tu token como header <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">Authorization: Bearer sk_mi_…</code> en cualquier
            llamada a nuestra API.
          </p>
          <pre className="mt-4 overflow-x-auto rounded-xl bg-gray-900 p-4 text-xs text-gray-100">
{`curl https://misitio.site/api/openapi.json \\
  -H "Authorization: Bearer sk_mi_XXXXXXXX..."`}
          </pre>
          <p className="mt-4 text-sm text-gray-500">
            El catálogo público de endpoints (OpenAPI 3.1) está en{' '}
            <a
              href="/api/openapi.json"
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:underline"
            >
              /api/openapi.json
            </a>{' '}
            — pégaselo a ChatGPT o Claude para que aprenda a manejarlo solo.
          </p>
        </section>
      </main>
    </div>
  )
}
