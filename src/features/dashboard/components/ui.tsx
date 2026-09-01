'use client'

/**
 * Piezas de UI compartidas por las secciones del panel (formularios de datos,
 * catálogo, etc.). Un solo lugar para inputs, tarjetas y feedback.
 */

export const inputClass =
  'w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm'
export const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5'

export interface Feedback {
  kind: 'ok' | 'error'
  text: string
}

export function Banner({ feedback }: { feedback: Feedback | null }) {
  if (!feedback) return null
  return (
    <div
      className={`mb-4 rounded-xl px-4 py-2.5 text-sm ${
        feedback.kind === 'ok'
          ? 'bg-green-50 text-green-700 border border-green-100'
          : 'bg-red-50 text-red-700 border border-red-100'
      }`}
    >
      {feedback.text}
    </div>
  )
}

export function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6">{children}</div>
}

export function SaveButton({ pending, onClick }: { pending: boolean; onClick: () => void }) {
  return (
    <div className="mt-6">
      <button
        onClick={onClick}
        disabled={pending}
        className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {pending ? 'Guardando…' : 'Guardar cambios'}
      </button>
    </div>
  )
}
