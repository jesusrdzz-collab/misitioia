'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import type { PlanLevel } from '@/lib/types/site'
import { Banner, inputClass, labelClass, type Feedback } from '@/features/dashboard/components/ui'
import { saveAnalyticsIds } from '../actions'

/**
 * Panel "Analíticas" (Fase A):
 *  - Guarda el Pixel de Meta y el Measurement ID de GA4 del sitio.
 *  - En plan `free` la vista está en modo lectura con candado + CTA a `/editar/plan`.
 *  - Validación cliente (regex) + servidor (Zod). El servidor manda siempre.
 *
 * Referencia UX: PixelYourSite — un panel dedicado, campos claros y una señal
 * inmediata (banner) de que quedó guardado. Ligero, sin explicaciones de más.
 */

interface Props {
  siteId: string
  plan: PlanLevel
  initialMetaPixelId: string | null
  initialGaMeasurementId: string | null
  planUpgradeHref: string
}

const META_PIXEL_RE = /^[0-9]{15,16}$/
const GA4_RE = /^G-[A-Z0-9]{8,12}$/

function normalize(v: string): string {
  return v.trim()
}

export function AnalyticsPanel({
  siteId,
  plan,
  initialMetaPixelId,
  initialGaMeasurementId,
  planUpgradeHref,
}: Props) {
  const locked = plan === 'free'
  const [meta, setMeta] = useState(initialMetaPixelId ?? '')
  const [ga, setGa] = useState(initialGaMeasurementId ?? '')
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [pending, startTransition] = useTransition()

  const metaError =
    !locked && meta.trim().length > 0 && !META_PIXEL_RE.test(normalize(meta))
      ? 'Debe tener 15 o 16 dígitos.'
      : null
  const gaError =
    !locked && ga.trim().length > 0 && !GA4_RE.test(normalize(ga).toUpperCase())
      ? 'Debe empezar con G- (por ejemplo G-ABC12345).'
      : null

  function save() {
    if (locked || metaError || gaError) return
    setFeedback(null)
    startTransition(async () => {
      const res = await saveAnalyticsIds(siteId, {
        metaPixelId: normalize(meta),
        gaMeasurementId: normalize(ga),
      })
      if (res.ok) {
        setFeedback({
          kind: 'ok',
          text: 'Guardado. En unos segundos empezarás a ver datos en Meta y Google.',
        })
      } else {
        setFeedback({ kind: 'error', text: res.error ?? 'No se pudo guardar.' })
      }
    })
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Analíticas</h1>
        <p className="text-gray-500 text-sm mt-1">
          Conecta tu Pixel de Meta y Google Analytics para medir visitas y campañas.
        </p>
      </div>

      {locked && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <span className="text-2xl" aria-hidden>
              🔒
            </span>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold text-amber-900">
                Analíticas disponibles desde el plan Emprende
              </h2>
              <p className="mt-1 text-sm text-amber-800">
                Sube tu plan para conectar tu Pixel de Meta y Google Analytics.
                Tus visitas se empezarán a medir el mismo día.
              </p>
              <Link
                href={planUpgradeHref}
                className="mt-3 inline-flex items-center rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
              >
                Sube a Emprende
              </Link>
            </div>
          </div>
        </div>
      )}

      <Banner feedback={feedback} />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6 mb-6">
        <label htmlFor="meta-pixel" className={labelClass}>
          Pixel de Meta (Facebook / Instagram)
        </label>
        <input
          id="meta-pixel"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          className={inputClass}
          value={meta}
          onChange={(e) => setMeta(e.target.value)}
          placeholder="123456789012345"
          disabled={locked || pending}
          aria-invalid={metaError ? 'true' : 'false'}
          aria-describedby="meta-pixel-help"
        />
        <p id="meta-pixel-help" className="mt-2 text-xs text-gray-500">
          Lo encuentras en{' '}
          <a
            href="https://business.facebook.com/events_manager2/list/pixel"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Meta Events Manager
          </a>
          {' '}→ Fuentes de datos → tu Pixel. Son 15 o 16 dígitos.
        </p>
        {metaError && <p className="mt-2 text-xs text-red-600">{metaError}</p>}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6 mb-6">
        <label htmlFor="ga-measurement" className={labelClass}>
          Google Analytics 4 (Measurement ID)
        </label>
        <input
          id="ga-measurement"
          type="text"
          autoComplete="off"
          className={inputClass}
          value={ga}
          onChange={(e) => setGa(e.target.value)}
          placeholder="G-ABC12345"
          disabled={locked || pending}
          aria-invalid={gaError ? 'true' : 'false'}
          aria-describedby="ga-measurement-help"
        />
        <p id="ga-measurement-help" className="mt-2 text-xs text-gray-500">
          Lo encuentras en{' '}
          <a
            href="https://analytics.google.com/analytics/web/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Google Analytics
          </a>
          {' '}→ Administrar → Flujos de datos → tu flujo web. Empieza con G-.
        </p>
        {gaError && <p className="mt-2 text-xs text-red-600">{gaError}</p>}
      </div>

      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900 mb-6">
        <p>
          <strong>Consentimiento:</strong> por ley, no disparamos tu Pixel ni GA hasta que
          el visitante acepta las cookies. En su primera visita verá un aviso al pie de tu
          página; a partir de ese momento se registran sus visitas de forma normal.
        </p>
      </div>

      {!locked && (
        <div className="mt-6">
          <button
            type="button"
            onClick={save}
            disabled={pending || Boolean(metaError) || Boolean(gaError)}
            className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {pending ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      )}
    </div>
  )
}
