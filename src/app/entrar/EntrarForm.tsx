'use client'

import { useState, useTransition } from 'react'
import { sendMagicLink } from '@/features/editor/actions'

/**
 * Formulario de entrada por magic link (Client Component).
 *
 * Reutiliza el server action `sendMagicLink(email, next)` que ya llama a
 * `supabase.auth.signInWithOtp` con el `emailRedirectTo` correcto
 * (`/auth/callback?next=/editar`). No hablamos con Supabase desde el navegador
 * para respetar el patrón de la fábrica (CLAUDE.md · 2026-02-27:
 * createBrowserClient no adjunta JWT en queries con RLS; para auth simple sí
 * sirve, pero preferimos consistencia y evitar duplicar el redirect).
 */
export function EntrarForm() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const res = await sendMagicLink(email, '/editar')
      if (res.ok) {
        setSent(true)
      } else {
        setError(
          res.error ||
            'Hubo un problema. Intenta de nuevo o escríbenos por WhatsApp.',
        )
      }
    })
  }

  if (sent) {
    return (
      <div
        className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center"
        role="status"
        aria-live="polite"
      >
        <div className="mb-2 text-3xl" aria-hidden>
          📬
        </div>
        <p className="text-sm font-semibold text-emerald-900">
          Listo. Revisa tu correo
        </p>
        <p className="mt-1 text-sm leading-relaxed text-emerald-800">
          Te llegó un link para entrar a{' '}
          <strong className="break-all">{email}</strong>. Si no lo ves en
          1 minuto, revisa la carpeta de spam.
        </p>
        <button
          type="button"
          onClick={() => {
            setSent(false)
            setEmail('')
          }}
          className="mt-4 text-xs font-medium text-emerald-800 underline underline-offset-2 hover:text-emerald-900"
        >
          Usar otro correo
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-3" noValidate>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-stone-700">
          Tu correo
        </span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@correo.com"
          disabled={pending}
          className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-base text-stone-900 outline-none transition-colors placeholder:text-stone-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:opacity-60"
        />
      </label>

      {error && (
        <p
          className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || !email.trim()}
        className="w-full rounded-xl bg-orange-600 px-5 py-3 text-base font-semibold text-white shadow-sm shadow-orange-600/20 transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'Enviando link…' : 'Enviar link'}
      </button>

      <p className="text-center text-xs leading-relaxed text-stone-400">
        Sin contraseñas. El link llega en menos de 1 minuto.
      </p>
    </form>
  )
}
