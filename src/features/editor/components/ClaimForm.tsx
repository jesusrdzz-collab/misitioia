'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { claimSite } from '../actions'

/**
 * Reclamar un sitio existente por su subdominio (slug). El dueño llegó con el
 * enlace de su página ya generada; aquí la vincula a su correo para editarla.
 */
export function ClaimForm() {
  const [slug, setSlug] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const clean = slug.trim().toLowerCase().replace(/\..*$/, '')
      const res = await claimSite(clean)
      if (res.ok && res.siteId) router.push(`/editar?site=${res.siteId}`)
      else setError(res.error || 'No se pudo reclamar el sitio.')
    })
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Subdominio de tu página
      </label>
      <div className="flex items-center gap-2">
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="tu-negocio"
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
        />
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60"
      >
        {pending ? 'Verificando…' : 'Reclamar mi sitio'}
      </button>
    </form>
  )
}
