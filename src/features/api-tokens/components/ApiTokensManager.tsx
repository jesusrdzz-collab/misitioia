'use client'

import { useState, useTransition } from 'react'

/**
 * Gestor de API tokens (cliente).
 *
 * Responsabilidades:
 *  - Lista los tokens existentes en una tabla.
 *  - Abre un modal para crear uno nuevo (nombre, scopes, expiración).
 *  - Al crearlo, muestra el plaintext UNA sola vez con botón de copiar.
 *  - Permite revocar un token con confirmación.
 *
 * Habla con `/api/tokens` y `/api/tokens/[id]` vía fetch. Como esos endpoints
 * ya validan sesión con cookies, aquí sólo pasamos `credentials: 'include'`.
 */

export interface ApiTokenRow {
  id: string
  name: string
  token_prefix: string
  scopes: string[] | null
  last_used_at: string | null
  expires_at: string | null
  revoked_at: string | null
  created_at: string
}

interface CreatedToken {
  id: string
  name: string
  prefix: string
  scopes: string[]
  plaintext: string
  expiresAt: string | null
}

interface Props {
  initialTokens: ApiTokenRow[]
}

const SCOPES_UI: Array<{ id: string; label: string; help: string }> = [
  { id: 'read', label: 'Leer', help: 'Consultar sitios, catálogo y analíticas.' },
  { id: 'write', label: 'Escribir', help: 'Editar datos, apariencia, catálogo.' },
  { id: 'admin', label: 'Admin', help: 'Cambios sensibles (dominio, plan).' },
]

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function isExpired(iso: string | null): boolean {
  if (!iso) return false
  const t = new Date(iso).getTime()
  return !Number.isNaN(t) && t <= Date.now()
}

function statusOf(t: ApiTokenRow): 'activo' | 'revocado' | 'expirado' {
  if (t.revoked_at) return 'revocado'
  if (isExpired(t.expires_at)) return 'expirado'
  return 'activo'
}

export function ApiTokensManager({ initialTokens }: Props) {
  const [tokens, setTokens] = useState<ApiTokenRow[]>(initialTokens)
  const [creating, setCreating] = useState(false)
  const [created, setCreated] = useState<CreatedToken | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function reload() {
    try {
      const res = await fetch('/api/tokens', { credentials: 'include' })
      if (!res.ok) return
      const json = (await res.json()) as { tokens: ApiTokenRow[] }
      setTokens(json.tokens)
    } catch {
      // ignore
    }
  }

  async function handleRevoke(id: string, name: string) {
    if (!confirm(`¿Revocar el token "${name}"? Ya no podrá usarse.`)) return
    setError(null)
    try {
      const res = await fetch(`/api/tokens/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string }
        setError(j.error ?? 'No se pudo revocar.')
        return
      }
      await reload()
    } catch (e) {
      setError((e as Error).message)
    }
  }

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          {tokens.length === 0
            ? 'Aún no tienes tokens.'
            : `${tokens.length} token${tokens.length === 1 ? '' : 's'}.`}
        </p>
        <button
          onClick={() => {
            setCreated(null)
            setCreating(true)
          }}
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Nuevo token
        </button>
      </div>

      {tokens.length === 0 ? (
        <EmptyState onCreate={() => setCreating(true)} />
      ) : (
        <TokensTable tokens={tokens} onRevoke={handleRevoke} />
      )}

      {creating && (
        <CreateTokenModal
          onClose={() => setCreating(false)}
          onCreated={(t) => {
            setCreating(false)
            setCreated(t)
            void reload()
          }}
        />
      )}

      {created && <CreatedTokenModal token={created} onClose={() => setCreated(null)} />}
    </div>
  )
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl">
        🔑
      </div>
      <h3 className="text-base font-semibold text-gray-900">Crea tu primer token</h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
        Con un token puedes pedirle a ChatGPT, Claude o Zapier que edite tu sitio, agregue
        productos o revise tus analíticas — sin abrir el panel.
      </p>
      <button
        onClick={onCreate}
        className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
      >
        Nuevo token
      </button>
    </div>
  )
}

function TokensTable({
  tokens,
  onRevoke,
}: {
  tokens: ApiTokenRow[]
  onRevoke: (id: string, name: string) => void
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
            <th className="px-4 py-3 font-medium">Nombre</th>
            <th className="px-4 py-3 font-medium">Prefix</th>
            <th className="px-4 py-3 font-medium">Scopes</th>
            <th className="px-4 py-3 font-medium">Último uso</th>
            <th className="px-4 py-3 font-medium">Expira</th>
            <th className="px-4 py-3 font-medium">Estado</th>
            <th className="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody>
          {tokens.map((t) => {
            const st = statusOf(t)
            return (
              <tr key={t.id} className="border-b border-gray-50 last:border-0">
                <td className="px-4 py-3 font-medium text-gray-900">{t.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600">
                  {t.token_prefix}…
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {(t.scopes ?? []).map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center rounded-full bg-blue-50 border border-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">{formatDate(t.last_used_at)}</td>
                <td className="px-4 py-3 text-gray-500">{formatDate(t.expires_at)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={st} />
                </td>
                <td className="px-4 py-3 text-right">
                  {st === 'activo' ? (
                    <button
                      onClick={() => onRevoke(t.id, t.name)}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                    >
                      Revocar
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function StatusBadge({ status }: { status: 'activo' | 'revocado' | 'expirado' }) {
  if (status === 'activo') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-2.5 py-0.5 text-xs font-semibold text-green-700">
        <span className="h-1.5 w-1.5 rounded-full bg-green-500" aria-hidden />
        Activo
      </span>
    )
  }
  if (status === 'expirado') {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
        Expirado
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 border border-gray-200 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
      Revocado
    </span>
  )
}

function CreateTokenModal({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: (t: CreatedToken) => void
}) {
  const [name, setName] = useState('')
  const [selected, setSelected] = useState<Record<string, boolean>>({
    read: true,
    write: true,
    admin: false,
  })
  const [expiresAt, setExpiresAt] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const scopes = Object.entries(selected)
      .filter(([, v]) => v)
      .map(([k]) => k)
    if (scopes.length === 0) {
      setError('Elige al menos un scope.')
      return
    }
    const body: Record<string, unknown> = { name: name.trim(), scopes }
    if (expiresAt) {
      // El input datetime-local es en zona local; convertimos a ISO UTC.
      const d = new Date(expiresAt)
      if (Number.isNaN(d.getTime()) || d.getTime() <= Date.now()) {
        setError('La fecha de expiración debe ser futura.')
        return
      }
      body.expiresAt = d.toISOString()
    }
    startTransition(async () => {
      try {
        const res = await fetch('/api/tokens', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        const json = (await res.json()) as Partial<CreatedToken> & { error?: string }
        if (!res.ok) {
          setError(json.error ?? 'No se pudo crear el token.')
          return
        }
        if (!json.plaintext || !json.id) {
          setError('Respuesta inválida del servidor.')
          return
        }
        onCreated({
          id: json.id,
          name: json.name ?? name,
          prefix: json.prefix ?? '',
          scopes: json.scopes ?? scopes,
          plaintext: json.plaintext,
          expiresAt: json.expiresAt ?? null,
        })
      } catch (err) {
        setError((err as Error).message)
      }
    })
  }

  return (
    <Modal onClose={onClose} title="Nuevo token">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={80}
            placeholder="p. ej. ChatGPT — mi cuenta"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
          />
          <p className="mt-1 text-xs text-gray-400">
            Sólo para identificarlo — nadie más lo verá.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Scopes</label>
          <div className="space-y-2">
            {SCOPES_UI.map((s) => (
              <label
                key={s.id}
                className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3 cursor-pointer hover:border-blue-200"
              >
                <input
                  type="checkbox"
                  checked={!!selected[s.id]}
                  onChange={(e) =>
                    setSelected((prev) => ({ ...prev, [s.id]: e.target.checked }))
                  }
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900">{s.label}</div>
                  <div className="text-xs text-gray-500">{s.help}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Expira (opcional)
          </label>
          <input
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
          />
          <p className="mt-1 text-xs text-gray-400">
            Si lo dejas vacío, el token no expira hasta que lo revoques.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={pending}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {pending ? 'Creando…' : 'Crear token'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

function CreatedTokenModal({
  token,
  onClose,
}: {
  token: CreatedToken
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    try {
      await navigator.clipboard.writeText(token.plaintext)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <Modal onClose={onClose} title="Token creado">
      <div className="space-y-4">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
          <p className="text-sm font-semibold text-amber-900">Guárdalo ahora</p>
          <p className="mt-1 text-xs text-amber-800">
            Por seguridad no volverás a ver este token. Cópialo y pégalo en ChatGPT / Claude /
            Zapier ahora mismo. Si lo pierdes, tendrás que crear uno nuevo.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Tu token
          </label>
          <div className="flex items-stretch gap-2">
            <code className="flex-1 min-w-0 overflow-x-auto rounded-xl border border-gray-200 bg-gray-900 px-3 py-2.5 font-mono text-xs text-green-300">
              {token.plaintext}
            </code>
            <button
              onClick={copy}
              className="shrink-0 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>
        </div>

        <div className="rounded-xl bg-gray-50 p-3 text-xs text-gray-500 space-y-1">
          <div>
            <span className="font-medium text-gray-700">Nombre:</span> {token.name}
          </div>
          <div>
            <span className="font-medium text-gray-700">Scopes:</span> {token.scopes.join(', ')}
          </div>
          {token.expiresAt && (
            <div>
              <span className="font-medium text-gray-700">Expira:</span>{' '}
              {formatDate(token.expiresAt)}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Ya lo guardé
          </button>
        </div>
      </div>
    </Modal>
  )
}

function Modal({
  onClose,
  title,
  children,
}: {
  onClose: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  )
}
