import Link from 'next/link'
import type { ReactNode } from 'react'
import { LogoMark } from '@/features/marketing/components/Logo'

/**
 * Layout compartido de los 4 pasos del wizard de creación (Sprint 6-sep-2026).
 * Header con logo + botón discreto "prefiero chatear con IA" (rescate al chat
 * clásico), barra de progreso, y contenedor centrado para el contenido del paso.
 *
 * Server component puro — sin estado local. Los pasos que necesitan
 * interactividad usan sus propios client components adentro.
 */

export type WizardStep = 'paso-1a' | 'paso-1b' | 'paso-2' | 'paso-3'

interface StepMeta {
  step: WizardStep
  label: string
}

const STEPS: StepMeta[] = [
  { step: 'paso-1a', label: 'Tu negocio' },
  { step: 'paso-1b', label: 'Datos de contacto' },
  { step: 'paso-2', label: 'Elige plantilla' },
  { step: 'paso-3', label: 'Imágenes' },
]

interface Props {
  current: WizardStep
  children: ReactNode
  /** Texto opcional que aparece debajo del título de bienvenida del header. */
  intro?: ReactNode
}

export function WizardShell({ current, children, intro }: Props) {
  const idx = STEPS.findIndex((s) => s.step === current)
  const total = STEPS.length
  const progressPct = ((idx + 1) / total) * 100

  return (
    <div className="min-h-[100dvh] bg-stone-50 flex flex-col">
      <header className="border-b border-stone-200 bg-white/70 backdrop-blur">
        <div className="max-w-4xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <LogoMark className="h-8 w-8" />
            <span className="font-semibold text-neutral-900">MiSitio IA</span>
          </Link>
          <Link
            href="/crear-chat"
            className="text-xs sm:text-sm text-stone-500 hover:text-stone-900 underline underline-offset-4 decoration-stone-300"
          >
            Prefiero chatear con IA
          </Link>
        </div>

        {/* Progreso: barra + etiquetas */}
        <div className="max-w-4xl mx-auto px-5 pb-4">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-widest text-stone-400 mb-2">
            {STEPS.map((s, i) => (
              <span
                key={s.step}
                className={i <= idx ? 'text-neutral-900 font-semibold' : ''}
              >
                {i + 1}. {s.label}
              </span>
            ))}
          </div>
          <div className="h-1.5 rounded-full bg-stone-200 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-5 py-10 md:py-16">
          {intro && <div className="mb-8 text-center">{intro}</div>}
          {children}
        </div>
      </main>

      <footer className="border-t border-stone-200 bg-white/50 py-4 text-center text-xs text-stone-400">
        Al continuar aceptas nuestros{' '}
        <Link href="/terminos" className="underline">
          Términos
        </Link>{' '}
        y{' '}
        <Link href="/aviso-de-privacidad" className="underline">
          Aviso de privacidad
        </Link>
        .
      </footer>
    </div>
  )
}
