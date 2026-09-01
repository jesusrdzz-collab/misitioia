import { ERAS } from '../data/timeline'

/**
 * Línea de tiempo visual de la evolución de la búsqueda en línea.
 * Vertical en móvil, horizontal en desktop. La era actual (now) se resalta.
 */
export function Timeline() {
  return (
    <div className="relative">
      {/* Riel: vertical en móvil, horizontal en md+ */}
      <div className="pointer-events-none absolute left-[22px] top-2 bottom-2 w-px bg-gradient-to-b from-stone-200 via-stone-200 to-orange-300 md:left-0 md:right-0 md:top-[46px] md:bottom-auto md:h-px md:w-full md:bg-gradient-to-r" />

      <ol className="grid grid-cols-1 gap-8 md:grid-cols-4 md:gap-5">
        {ERAS.map((era) => (
          <li key={era.years} className="relative flex gap-5 md:flex-col md:gap-0">
            {/* Nodo */}
            <div className="relative z-10 flex-shrink-0">
              <div
                className={
                  era.now
                    ? 'flex h-11 w-11 items-center justify-center rounded-full bg-orange-600 text-lg shadow-lg shadow-orange-600/30 ring-4 ring-orange-100'
                    : 'flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white text-lg shadow-sm'
                }
              >
                {era.emoji}
              </div>
            </div>

            {/* Contenido */}
            <div className="md:mt-6">
              <div
                className={
                  era.now
                    ? 'text-xs font-bold uppercase tracking-wider text-orange-600'
                    : 'text-xs font-semibold uppercase tracking-wider text-stone-400'
                }
              >
                {era.years}
              </div>
              <div
                className={
                  era.now
                    ? 'mt-1 inline-flex rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-semibold text-orange-700'
                    : 'mt-1 inline-flex rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-semibold text-stone-500'
                }
              >
                {era.tag}
              </div>
              <h3 className="mt-2.5 text-base font-semibold leading-snug text-stone-900">
                {era.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-stone-600">{era.desc}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
