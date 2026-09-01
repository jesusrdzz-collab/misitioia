'use client'

import { useState, useTransition } from 'react'
import { createEmbedSiteAction } from '../actions'
import type { AuditCheck } from '../types'

interface AuditView {
  score: number
  summary: string
  recommendations: string[]
  checks: AuditCheck[]
  createdAt: string | null
}
interface SiteView {
  id: string
  name: string
  token: string
  origin: string | null
  createdAt: string
  audit: AuditView | null
}

interface Props {
  email: string
  sites: SiteView[]
  scriptBase: string
}

function snippetFor(base: string, token: string): string {
  return `<script src="${base}/embed/v1.js" data-site="${token}" async></script>`
}

export function InstallPanel({ email, sites, scriptBase }: Props) {
  const [name, setName] = useState('')
  const [platform, setPlatform] = useState('wordpress')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function create(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const res = await createEmbedSiteAction({ name, platform })
      if (!res.ok) setError(res.error || 'No se pudo generar el código.')
      else {
        setName('')
        // La página se revalida en el server action; recargamos para verlo.
        window.location.reload()
      }
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔌</span>
            <span className="font-bold text-gray-900">Instalar Victoria en mi sitio</span>
          </div>
          <span className="text-xs text-gray-400 truncate max-w-[40%]">{email}</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-8 space-y-8">
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h1 className="text-xl font-bold text-gray-900">
            ¿Ya tienes página? Súmale Victoria en 2 minutos.
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Funciona en WordPress, Wix o cualquier sitio. Pegas un código y listo: aparece el chat de
            Victoria y hacemos una auditoría de tu página para buscadores e IA.{' '}
            <strong>No modificamos tu sitio</strong> — solo agregamos el asistente y te damos
            recomendaciones.
          </p>

          <form onSubmit={create} className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre de tu negocio o sitio"
              className="px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none"
            />
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none bg-white"
            >
              <option value="wordpress">WordPress</option>
              <option value="wix">Wix</option>
              <option value="otro">Otro</option>
            </select>
            <button
              type="submit"
              disabled={pending}
              className="bg-orange-600 text-white font-semibold px-5 py-3 rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-60 whitespace-nowrap"
            >
              {pending ? 'Generando…' : 'Generar código'}
            </button>
          </form>
          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        </section>

        {sites.length === 0 ? (
          <p className="text-center text-gray-400 text-sm">
            Aún no has generado ningún código. Crea el primero arriba.
          </p>
        ) : (
          sites.map((s) => (
            <SiteCard key={s.id} site={s} scriptBase={scriptBase} />
          ))
        )}
      </main>
    </div>
  )
}

function SiteCard({ site, scriptBase }: { site: SiteView; scriptBase: string }) {
  const [copied, setCopied] = useState(false)
  const snippet = snippetFor(scriptBase, site.token)

  function copy() {
    navigator.clipboard?.writeText(snippet).then(
      () => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      },
      () => {},
    )
  }

  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-lg font-semibold text-gray-900">{site.name}</h2>
        {site.origin && <span className="text-xs text-gray-400">{site.origin}</span>}
      </div>

      {/* Snippet universal */}
      <div className="mt-4">
        <p className="text-sm font-medium text-gray-700 mb-2">
          1. Pega este código antes de <code className="text-orange-600">&lt;/body&gt;</code> en tu
          sitio:
        </p>
        <div className="relative">
          <pre className="bg-gray-900 text-gray-100 text-xs sm:text-sm rounded-xl p-4 overflow-x-auto">
            <code>{snippet}</code>
          </pre>
          <button
            onClick={copy}
            className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1.5 rounded-lg"
          >
            {copied ? '¡Copiado!' : 'Copiar'}
          </button>
        </div>
      </div>

      {/* Instrucciones */}
      <details className="mt-4 group">
        <summary className="cursor-pointer text-sm font-medium text-orange-600">
          ¿Cómo lo instalo? (WordPress, Wix y genérico)
        </summary>
        <div className="mt-3 text-sm text-gray-600 space-y-3">
          <div>
            <p className="font-semibold text-gray-800">WordPress</p>
            <p>
              Opción fácil: instala el plugin <strong>MiSitio IA</strong>, ve a Ajustes → MiSitio IA
              y pega tu token: <code className="text-orange-600 break-all">{site.token}</code>.
              Opción manual: usa un plugin como “Insert Headers and Footers” y pega el código de
              arriba en el pie.
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-800">Wix</p>
            <p>
              Panel → Configuración → Código personalizado → Agregar código. Pega el snippet, elige
              “Cuerpo - final” y aplícalo a todas las páginas.
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-800">Cualquier otro sitio</p>
            <p>Pega el snippet antes de la etiqueta de cierre &lt;/body&gt; de tu plantilla.</p>
          </div>
        </div>
      </details>

      {/* Auditoría AEO */}
      <div className="mt-6 border-t border-gray-100 pt-5">
        <p className="text-sm font-medium text-gray-700 mb-3">
          2. Auditoría de tu sitio para buscadores e IA (AEO)
        </p>
        {site.audit ? (
          <AuditBlock audit={site.audit} />
        ) : (
          <p className="text-sm text-gray-500">
            Aún no hay auditoría. En cuanto instales el código y alguien abra tu página, aquí
            aparecerá el reporte con tu puntaje y recomendaciones.
          </p>
        )}
      </div>
    </section>
  )
}

function AuditBlock({ audit }: { audit: AuditView }) {
  const color =
    audit.score >= 80 ? 'text-green-600' : audit.score >= 55 ? 'text-amber-600' : 'text-red-600'
  const ring =
    audit.score >= 80 ? 'border-green-200 bg-green-50' : audit.score >= 55 ? 'border-amber-200 bg-amber-50' : 'border-red-200 bg-red-50'

  return (
    <div>
      <div className={`flex items-center gap-4 rounded-xl border ${ring} p-4`}>
        <div className={`text-3xl font-bold ${color}`}>{audit.score}</div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">Puntaje AEO / 100</div>
          <p className="text-sm text-gray-700">{audit.summary}</p>
        </div>
      </div>

      {audit.recommendations.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-semibold text-gray-800 mb-2">Recomendaciones</p>
          <ul className="space-y-1.5">
            {audit.recommendations.map((r, i) => (
              <li key={i} className="text-sm text-gray-600 flex gap-2">
                <span className="text-orange-500">→</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {audit.checks.length > 0 && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-medium text-gray-500">
            Ver el detalle de los {audit.checks.length} puntos revisados
          </summary>
          <ul className="mt-3 space-y-2">
            {audit.checks.map((c) => (
              <li key={c.id} className="text-sm flex gap-2">
                <span>
                  {c.status === 'ok' ? '✅' : c.status === 'warn' ? '⚠️' : '❌'}
                </span>
                <span>
                  <span className="font-medium text-gray-800">{c.label}.</span>{' '}
                  <span className="text-gray-600">{c.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}
