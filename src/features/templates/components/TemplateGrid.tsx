'use client'

import { useState, useTransition } from 'react'
import { listTemplates } from '../registry'
import { applyTemplateAction, regenerateImageAction } from '../actions'

interface Props {
  siteId: string
  slug: string
  currentTemplate: string
  currentImages: { hero: string | null; about: string | null; catalog: string | null }
}

export function TemplateGrid({ siteId, slug, currentTemplate, currentImages }: Props) {
  const templates = listTemplates()
  const [active, setActive] = useState(currentTemplate)
  const [feedback, setFeedback] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)
  const [pending, startTransition] = useTransition()

  const apply = (tplSlug: string) => {
    setFeedback(null)
    startTransition(async () => {
      const res = await applyTemplateAction(siteId, tplSlug)
      if (res.ok) {
        setActive(tplSlug)
        setFeedback({ kind: 'ok', text: '¡Listo! Plantilla aplicada. Abre tu sitio para verlo.' })
      } else {
        setFeedback({ kind: 'err', text: res.error ?? 'No se pudo aplicar.' })
      }
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Elige la apariencia</h2>
        <p className="text-sm text-gray-500 mt-1">
          Todos tus datos, servicios y catálogo se conservan al cambiar de plantilla. Solo cambia el look: colores, tipografía y estructura.
        </p>
      </div>

      {feedback && (
        <div className={`rounded-xl px-4 py-3 text-sm ${feedback.kind === 'ok' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {feedback.text}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {templates.map((t) => {
          const isActive = t.meta.slug === active
          return (
            <article key={t.meta.slug} className={`rounded-2xl border overflow-hidden transition-shadow ${isActive ? 'border-blue-500 ring-2 ring-blue-100 shadow-lg' : 'border-gray-200 hover:shadow-md'}`}>
              <div className="aspect-[3/2] bg-white border-b border-gray-100">
                <t.Preview />
              </div>
              <div className="p-5 bg-white">
                <div className="flex items-center justify-between mb-2 gap-2">
                  <h3 className="font-semibold text-gray-900">{t.meta.name}</h3>
                  {isActive && (<span className="text-[10px] uppercase tracking-widest text-blue-700 bg-blue-50 px-2 py-1 rounded-full font-semibold">Actual</span>)}
                </div>
                <p className="text-xs text-gray-500 leading-relaxed mb-4">{t.meta.description}</p>

                <div className="flex items-center gap-2 mb-4">
                  <span className="h-6 w-6 rounded-full border border-black/10" style={{ background: t.meta.palette.primary }} title={`Primario ${t.meta.palette.primary}`} />
                  <span className="h-6 w-6 rounded-full border border-black/10" style={{ background: t.meta.palette.accent }} title={`Acento ${t.meta.palette.accent}`} />
                  <span className="h-6 w-6 rounded-full border border-black/10" style={{ background: t.meta.palette.background }} title={`Fondo ${t.meta.palette.background}`} />
                  <span className="text-[11px] text-gray-400 ml-2">{t.meta.displayFontLabel}</span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {t.meta.goodFor.slice(0, 3).map((g) => (
                    <span key={g} className="text-[10px] uppercase tracking-wider text-gray-500 bg-gray-50 px-2 py-1 rounded-full">{g}</span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => apply(t.meta.slug)}
                    disabled={pending || isActive}
                    className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${isActive ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-gray-800'}`}
                  >
                    {isActive ? 'Plantilla actual' : pending ? 'Aplicando…' : 'Aplicar plantilla'}
                  </button>
                  <a
                    href={`/sites/${slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
                    title="Abrir sitio real"
                  >
                    ↗
                  </a>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      <div className="pt-4 border-t border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900">Imágenes generadas por IA</h2>
        <p className="text-sm text-gray-500 mt-1">
          Cada sitio nuevo recibe imágenes propias generadas para su giro. Si alguna no te gustó, regenérala aquí.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ImageSlot siteId={siteId} slot="hero" label="Imagen de portada (16:9)" current={currentImages.hero} />
        <ImageSlot siteId={siteId} slot="about" label="Imagen ‘sobre nosotros’ (4:3)" current={currentImages.about} />
        <ImageSlot siteId={siteId} slot="catalog" label="Placeholder de catálogo (1:1)" current={currentImages.catalog} />
      </div>
    </div>
  )
}

function ImageSlot({ siteId, slot, label, current }: { siteId: string; slot: 'hero' | 'about' | 'catalog'; label: string; current: string | null }) {
  const [url, setUrl] = useState<string | null>(current)
  const [source, setSource] = useState<'ai' | 'stock' | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const regen = () => {
    setMsg(null)
    startTransition(async () => {
      const res = await regenerateImageAction(siteId, slot)
      if (res.ok && res.url) {
        setUrl(res.url)
        setSource(res.source ?? null)
        setMsg(res.source === 'ai' ? '¡Imagen IA generada!' : 'Imagen fresca lista (fallback stock).')
      } else {
        setMsg(res.error ?? 'No se pudo regenerar.')
      }
    })
  }

  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white">
      <div className="aspect-[3/2] bg-gray-50 flex items-center justify-center">
        {url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={url} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs text-gray-400 uppercase tracking-widest">Sin imagen</span>
        )}
      </div>
      <div className="p-4">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {source && (<p className="text-[10px] uppercase tracking-widest text-gray-400 mt-1">{source === 'ai' ? 'Generada con IA' : 'Fallback stock'}</p>)}
        {msg && <p className="text-xs mt-2 text-gray-600">{msg}</p>}
        <button
          type="button"
          onClick={regen}
          disabled={pending}
          className="mt-3 w-full rounded-xl bg-gray-900 text-white text-xs font-semibold px-4 py-2 hover:bg-gray-800 disabled:opacity-60"
        >
          {pending ? 'Generando…' : '↻ Regenerar imagen'}
        </button>
      </div>
    </div>
  )
}
