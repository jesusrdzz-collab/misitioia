'use client'

import { useState, useTransition } from 'react'
import { ROOT_DOMAIN } from '@/lib/domain'
import type { DomainStatus, DnsRecord } from '@/lib/vercel-domains'
import { saveCustomDomain, refreshDomainStatus } from '../actions'

/**
 * Panel "Conectar dominio":
 *  - Muestra el subdominio en vivo del negocio con botón para copiar.
 *  - Permite guardar un dominio propio (se valida y guarda en minúsculas).
 *  - Adjunta el dominio al proyecto de Vercel y muestra el estado real de
 *    verificación (Pendiente / Verificado) + los registros DNS exactos.
 *  - Botón "Volver a verificar" que reconsulta el estado en Vercel.
 *
 * Móvil-first, paleta azul. No importa el módulo de Vercel (solo tipos): toda
 * la lógica con el token vive en Server Actions.
 */

interface Props {
  siteId: string
  slug: string
  initialCustomDomain: string | null
  initialStatus: DomainStatus | null
}

const CNAME_TARGET_FALLBACK = 'cname.vercel-dns.com'

function StatusBadge({ status }: { status: DomainStatus }) {
  if (status.state === 'verificado') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs font-semibold text-green-700">
        <span className="h-1.5 w-1.5 rounded-full bg-green-500" aria-hidden />
        Verificado
      </span>
    )
  }
  if (status.state === 'pendiente') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-700">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden />
        Pendiente
      </span>
    )
  }
  if (status.state === 'error') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-3 py-1 text-xs font-semibold text-red-700">
        Error al verificar
      </span>
    )
  }
  // no-configurado
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600">
      Conexión manual
    </span>
  )
}

function DnsTable({ records }: { records: DnsRecord[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm bg-white rounded-lg border border-blue-100">
        <thead>
          <tr className="border-b border-blue-100 text-left text-xs uppercase tracking-wide text-gray-400">
            <th className="px-3 py-2 font-medium">Tipo</th>
            <th className="px-3 py-2 font-medium">Nombre</th>
            <th className="px-3 py-2 font-medium">Valor</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r, i) => (
            <tr key={`${r.type}-${r.name}-${i}`} className="border-b border-blue-50 last:border-0">
              <td className="px-3 py-2 font-mono text-gray-900">{r.type}</td>
              <td className="px-3 py-2 font-mono text-gray-900">{r.name}</td>
              <td className="px-3 py-2 font-mono text-gray-900 break-all">{r.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function DomainPanel({ siteId, slug, initialCustomDomain, initialStatus }: Props) {
  const subdomainUrl = `https://${slug}.${ROOT_DOMAIN}`

  const [domain, setDomain] = useState(initialCustomDomain ?? '')
  const [saved, setSaved] = useState<string | null>(initialCustomDomain)
  const [status, setStatus] = useState<DomainStatus | null>(initialStatus)
  const [copied, setCopied] = useState(false)
  const [feedback, setFeedback] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)
  const [pending, startTransition] = useTransition()
  const [checking, startCheck] = useTransition()

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
        setStatus(res.status ?? null)
        setFeedback({
          kind: res.error ? 'error' : 'ok',
          text:
            res.error ??
            (value ? 'Dominio guardado. Agrega los registros DNS de abajo.' : 'Dominio eliminado.'),
        })
      } else {
        setFeedback({ kind: 'error', text: res.error ?? 'No se pudo guardar.' })
      }
    })
  }

  function recheck() {
    setFeedback(null)
    startCheck(async () => {
      const res = await refreshDomainStatus(siteId)
      if (res.ok) {
        setStatus(res.status ?? null)
        if (res.status?.state === 'verificado') {
          setFeedback({ kind: 'ok', text: '¡Tu dominio ya está verificado y en línea!' })
        } else if (res.status?.state === 'pendiente') {
          setFeedback({ kind: 'error', text: 'Aún no detectamos los registros DNS. Puede tardar unas horas.' })
        }
      } else {
        setFeedback({ kind: 'error', text: res.error ?? 'No se pudo verificar.' })
      }
    })
  }

  const hasVercel = status !== null && status.state !== 'no-configurado'
  const records: DnsRecord[] = status && 'records' in status ? status.records : []

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
        <div className="flex items-center justify-between gap-3 mb-1">
          <h2 className="text-sm font-semibold text-gray-900">Dominio personalizado</h2>
          {saved && status && <StatusBadge status={status} />}
        </div>
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
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <button
              onClick={recheck}
              disabled={checking}
              className="text-sm font-medium text-blue-600 hover:underline disabled:opacity-50"
            >
              {checking ? 'Verificando…' : 'Volver a verificar'}
            </button>
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
              Entra al panel donde compraste <strong>{saved}</strong> y agrega
              {records.length > 1 ? ' estos registros:' : ' este registro:'}
            </p>

            {hasVercel && records.length > 0 ? (
              <DnsTable records={records} />
            ) : (
              // Fallback cuando Vercel aún no está configurado: instrucción manual.
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
                      <td className="px-3 py-2 font-mono text-gray-900 break-all">{CNAME_TARGET_FALLBACK}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            <p className="text-xs text-blue-700 mt-3">
              {status?.state === 'verificado'
                ? '✅ Tu dominio ya apunta correctamente. ¡Listo!'
                : '🔧 Después de agregar los registros, presiona “Volver a verificar”. El DNS suele tardar de minutos a unas horas en propagarse.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
