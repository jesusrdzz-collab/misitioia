'use client'

import { useState, useTransition } from 'react'
import { sendMagicLink } from '../actions'

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
          <div className="text-4xl mb-3">🪄</div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Te mandamos un enlace mágico a tu correo. Sin contraseñas.
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
        )}
      </div>
    </div>
  )
}
