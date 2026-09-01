'use client'

import { useState, useTransition } from 'react'
import { ROOT_DOMAIN } from '@/lib/domain'
import { saveCustomDomain } from '../actions'

/**
 * Panel "Conectar dominio":
 *  - Muestra el subdominio en vivo del negocio con botón para copiar.
 *  - Permite guardar un dominio propio (se valida y guarda en minúsculas).
 *  - Da las instrucciones DNS (CNAME → cname.vercel-dns.com).
 *
 * NO llama a ninguna API de Vercel: la conexión automática la termina soporte.
 */

interface Props {
  siteId: string
  slug: string
  initialCustomDomain: string | null
}

const CNAME_TARGET = 'cname.vercel-dns.com'

export function DomainPanel({ siteId, slug, initialCustomDomain }: Props) {
  const subdomainUrl = `https://${slug}.${ROOT_DOMAIN}`

  const [domain, setDomain] = useState(initialCustomDomain ?? '')
  const [saved, setSaved] = useState<string | null>(initialCustomDomain)
  const [copied, setCopied] = useState(false)
  const [feedback, setFeedback] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)
  const [pending, startTransition] = useTransition()

  function copySubdomain() {
    navigator.clipboard?.writeText(subdomainUrl).then(
      () => {
        setCopied(true)
        setTimeout(() => setCopied(false), 1800)
      },
      () => setCopied(false),
    )
  }

  function save(value: string | null) {
    setFeedback(null)
    startTransition(async () => {
      const res = await saveCustomDomain(siteId, value)
      if (res.ok) {
        setSaved(value)
        setFeedback({ kind: 'ok', text: value ? 'Dominio guardado. Configura tu DNS abajo.' : 'Dominio eliminado.' })
      } else {
        setFeedback({ kind: 'error', text: res.error ?? 'No se pudo guardar.' })
      }
    })
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Conectar dominio</h1>
        <p className="text-gray-500 text-sm mt-1">Tu sitio ya está en línea. Conéctale tu propio dominio cuando quieras.</p>
      </div>

      {/* Subdominio en vivo */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-1">Tu dirección actual</h2>
        <p className="text-xs text-gray-400 mb-3">Este subdominio siempre funcionará, con o sin dominio propio.</p>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <a
            href={subdomainUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded-xl bg-gray-50 border border-gray-200 px-4 py-2.5 text-sm font-medium text-blue-600 hover:underline break-all"
          >
            {slug}.{ROOT_DOMAIN}
          </a>
          <button
            onClick={copySubdomain}
            className="shrink-0 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            {copied ? '¡Copiado!' : 'Copiar'}
          </button>
        </div>
      </div>

      {/* Dominio propio */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-1">Dominio personalizado</h2>
        <p className="text-xs text-gray-400 mb-3">Escribe el dominio que ya tienes (por ejemplo minegocio.com).</p>

        {feedback && (
          <div
            className={`mb-4 rounded-xl px-4 py-2.5 text-sm ${
              feedback.kind === 'ok'
                ? 'bg-green-50 text-green-700 border border-green-100'
                : 'bg-red-50 text-red-700 border border-red-100'
            }`}
          >
            {feedback.text}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="minegocio.com"
          />
          <button
            onClick={() => save(domain)}
            disabled={pending}
            className="shrink-0 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {pending ? 'Guardando…' : 'Guardar dominio'}
          </button>
        </div>

        {saved && (
          <div className="mt-3">
            <button
              onClick={() => {
                setDomain('')
                save(null)
              }}
              disabled={pending}
              className="text-sm text-red-600 hover:underline font-medium disabled:opacity-50"
            >
              Quitar dominio personalizado
            </button>
          </div>
        )}

        {/* Instrucciones DNS */}
        {saved && (
          <div className="mt-6 rounded-xl bg-blue-50 border border-blue-100 p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Configura tu DNS</h3>
            <p className="text-sm text-blue-800 mb-3">
              Entra al panel donde compraste <strong>{saved}</strong> y agrega este registro CNAME:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm bg-white rounded-lg border border-blue-100">
                <tbody>
                  <tr className="border-b border-blue-50">
                    <td className="px-3 py-2 font-medium text-gray-500 w-28">Tipo</td>
                    <td className="px-3 py-2 font-mono text-gray-900">CNAME</td>
                  </tr>
                  <tr className="border-b border-blue-50">
                    <td className="px-3 py-2 font-medium text-gray-500">Nombre</td>
                    <td className="px-3 py-2 font-mono text-gray-900">@ (o www)</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-gray-500">Valor</td>
                    <td className="px-3 py-2 font-mono text-gray-900 break-all">{CNAME_TARGET}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-blue-700 mt-3">
              🔧 La conexión automática está en camino. Por ahora, en cuanto guardes tu dominio y
              configures el CNAME, nuestro equipo termina la conexión (suele tardar unas horas).
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
