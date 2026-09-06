'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { listTemplates } from '@/features/templates/registry'
import { savePaso2Action } from '../actions'

interface Props {
  siteId: string
  slug: string
  currentTemplate: string
}

/**
 * Paso 2 — grid con las 5 plantillas. Se muestra el preview SVG de cada
 * plantilla; el cliente puede abrir su sitio real en otra pestaña para ver
 * cómo se ve con sus datos.
 */
export function Paso2Grid({ siteId, slug, currentTemplate }: Props) {
  const router = useRouter()
  const templates = listTemplates()
  const [selected, setSelected] = useState(currentTemplate)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function apply(templateSlug: string) {
    setError(null)
    setSelected(templateSlug)
    startTransition(async () => {
      const res = await savePaso2Action(siteId, { template: templateSlug })
      if (!res.ok) {
        setError(res.error ?? 'No se pudo aplicar la plantilla.')
      }
    })
  }

  function continueNext() {
    router.push(`/crear/paso-3?site=${siteId}`)
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-5xl font-medium text-neutral-900 tracking-tight mb-3">
          Elige la apariencia de tu sitio
        </h1>
        <p className="text-stone-600 text-base md:text-lg max-w-2xl mx-auto">
          Cada plantilla ya viene con paleta, tipografía y estructura. Puedes cambiarla
          después sin perder ni un dato.
        </p>
        <a
          href={`/sites/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-4 text-sm text-orange-600 hover:underline font-medium"
        >
          Abrir mi sitio en otra pestaña para comparar ↗
        </a>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {templates.map((t) => {
          const isSelected = t.meta.slug === selected
          return (
            <article
              key={t.meta.slug}
              className={`rounded-2xl border bg-white overflow-hidden transition-shadow ${isSelected ? 'border-orange-500 ring-2 ring-orange-100 shadow-lg' : 'border-stone-200 hover:shadow-md'}`}
            >
              <div className="aspect-[3/2] bg-stone-50 border-b border-stone-100">
                <t.Preview />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-neutral-900">{t.meta.name}</h3>
                  {isSelected && (
                    <span className="text-[10px] uppercase tracking-widest text-orange-700 bg-orange-50 px-2 py-1 rounded-full font-semibold">
                      Elegida
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-500 leading-relaxed mb-4 line-clamp-3">
                  {t.meta.description}
                </p>
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className="h-5 w-5 rounded-full border border-black/10"
                    style={{ background: t.meta.palette.primary }}
                  />
                  <span
                    className="h-5 w-5 rounded-full border border-black/10"
                    style={{ background: t.meta.palette.accent }}
                  />
                  <span
                    className="h-5 w-5 rounded-full border border-black/10"
                    style={{ background: t.meta.palette.background }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => apply(t.meta.slug)}
                  disabled={pending}
                  className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${isSelected ? 'bg-orange-500 text-white' : 'bg-neutral-900 text-white hover:bg-neutral-800'} disabled:opacity-60`}
                >
                  {pending && isSelected ? 'Aplicando…' : isSelected ? '✓ Elegida' : 'Elegir esta'}
                </button>
              </div>
            </article>
          )
        })}
      </div>

      <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <a
          href={`/crear/paso-1b?site=${siteId}`}
          className="text-sm text-stone-500 hover:text-neutral-900 underline underline-offset-4"
        >
          ← Volver a datos
        </a>
        <button
          type="button"
          onClick={continueNext}
          disabled={pending}
          className="w-full sm:w-auto rounded-xl bg-neutral-900 text-white font-semibold px-8 py-3.5 hover:bg-neutral-800 disabled:opacity-60"
        >
          Usar esta plantilla y continuar →
        </button>
      </div>
    </div>
  )
}
