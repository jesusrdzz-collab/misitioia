'use client'

import { useState, useTransition } from 'react'
import { sendMagicLink } from '../actions'
import { LogoLockup } from '@/features/marketing/components/Logo'

/**
 * Puerta de entrada por magic link. El dueño escribe su correo y recibe un
 * enlace; no hay contraseña. Mobile-first.
 */
export function LoginGate({ next, title }: { next: string; title: string }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const res = await sendMagicLink(email, next)
      if (res.ok) setSent(true)
      else setError(res.error || 'No se pudo enviar el enlace.')
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-5">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <div className="text-center mb-6">
          <LogoLockup className="mx-auto h-20 w-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Entra con Google o con un enlace mágico a tu correo. Sin contraseñas.
          </p>
        </div>

        {sent ? (
          <div className="text-center bg-green-50 border border-green-100 rounded-2xl p-6">
            <div className="text-3xl mb-2">📬</div>
            <p className="text-green-800 font-medium">Revisa tu correo</p>
            <p className="text-green-700 text-sm mt-1">
              Te enviamos un enlace a <strong>{email}</strong>. Ábrelo desde este dispositivo.
            </p>
          </div>
        ) : (
          <>
            <a
              href={`/auth/google?next=${encodeURIComponent(next)}`}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z" />
                <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z" />
                <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z" />
                <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.42 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z" />
              </svg>
              Continuar con Google
            </a>

            <div className="flex items-center gap-3 my-4">
              <span className="h-px flex-1 bg-gray-200" />
              <span className="text-xs text-gray-400">o con tu correo</span>
              <span className="h-px flex-1 bg-gray-200" />
            </div>

            <form onSubmit={submit} className="space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
            />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={pending}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {pending ? 'Enviando…' : 'Enviar enlace'}
            </button>
          </form>
          </>
        )}
      </div>
    </div>
  )
}
