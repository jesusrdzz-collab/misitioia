import Link from 'next/link'

/**
 * Banner amarillo persistente que se muestra arriba del contenido del panel
 * cuando el sitio del cliente todavía no tiene los datos legales obligatorios
 * completos (Sprint wizard 3 pasos, 6-sep-2026).
 *
 * Se renderiza server-side en cada página del panel (`/editar/*`) desde el
 * DashboardShell, tomando el flag `legal_ready` que ya viene con el sitio
 * autorizado. Es un componente puramente presentacional.
 */

interface Props {
  siteId: string
  /** Etiquetas legibles de los campos que faltan, del más importante al menos. */
  missing: string[]
}

export function LegalGuardBanner({ siteId, missing }: Props) {
  if (!missing || missing.length === 0) return null

  const q = `?site=${encodeURIComponent(siteId)}`
  const list = missing.slice(0, 3).join(' · ')

  return (
    <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <span className="text-2xl leading-none" aria-hidden>⚠️</span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-amber-900">
              Completa tus datos legales para publicar tu sitio con todo en regla
            </p>
            <p className="text-xs text-amber-800 mt-0.5">
              Te faltan: <span className="font-medium">{list}{missing.length > 3 ? '…' : ''}</span>
              {' '}
              Mientras tanto tu sitio está publicado pero no podrá activar Meta Pixel ni Google Analytics.
            </p>
          </div>
        </div>
        <Link
          href={`/editar/datos${q}`}
          className="shrink-0 inline-flex items-center justify-center rounded-xl bg-amber-600 text-white text-sm font-semibold px-4 py-2.5 hover:bg-amber-700"
        >
          Completar datos
        </Link>
      </div>
    </div>
  )
}
