'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createPreviewSiteAction } from '../actions'
import { GIRO_NOMBRE, GIRO_OTROS } from '@/features/generator/giros'

/**
 * Paso 1a — datos mínimos para generar el preview del sitio.
 * Solo pide nombre + giro + descripción libre. Los datos de contacto/dirección
 * van en el Paso 1b. Al submit, crea el sitio en BD (estado 'reclamado') con
 * placeholders visibles y redirige a `/crear/paso-1b?site=<id>`.
 *
 * Fix P0 2026-09-07: si el giro es "otros", pedimos un input libre que se
 * guarda en `sites.giro_libre` y se usa en los prompts de IA para no caer
 * al genérico terracota/artesanía cuando el cliente vende, p.ej., seguros.
 */

const GIROS_ORDERED = Object.entries(GIRO_NOMBRE)
  .filter(([slug]) => slug !== GIRO_OTROS)
  .map(([slug, label]) => ({ slug, label }))
  .sort((a, b) => a.label.localeCompare(b.label, 'es'))

const OTROS_OPTION = { slug: GIRO_OTROS, label: GIRO_NOMBRE[GIRO_OTROS] }

export function Paso1aForm() {
  const router = useRouter()
  const [businessName, setBusinessName] = useState('')
  const [giro, setGiro] = useState('')
  const [giroLibre, setGiroLibre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const needsGiroLibre = giro === GIRO_OTROS

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (needsGiroLibre && giroLibre.trim().length < 3) {
      setError('Describe brevemente tu giro (mínimo 3 caracteres).')
      return
    }
    startTransition(async () => {
      const res = await createPreviewSiteAction({
        business_name: businessName,
        giro: giro || null,
        giro_libre: needsGiroLibre ? giroLibre.trim() : null,
        descripcion: descripcion || null,
      })
      if (res.ok && res.siteId) {
        router.push(`/crear/paso-1b?site=${res.siteId}`)
      } else {
        setError(res.error ?? 'No se pudo crear la vista previa.')
      }
    })
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-5xl font-medium text-neutral-900 tracking-tight mb-3">
          Empecemos con lo básico
        </h1>
        <p className="text-stone-600 text-base md:text-lg">
          En 30 segundos tendrás tu sitio listo para ver. Todavía no publicamos nada — es solo tu preview.
        </p>
      </div>

      <form
        onSubmit={submit}
        className="bg-white rounded-3xl shadow-xl border border-stone-200 p-6 md:p-10 space-y-6"
      >
        <div>
          <label htmlFor="business_name" className="block text-sm font-semibold text-neutral-900 mb-2">
            ¿Cómo se llama tu negocio?
          </label>
          <input
            id="business_name"
            type="text"
            required
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="Ej. Herrería San Juan"
            maxLength={120}
            className="w-full rounded-xl border border-stone-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        <div>
          <label htmlFor="giro" className="block text-sm font-semibold text-neutral-900 mb-2">
            ¿A qué se dedica?
          </label>
          <select
            id="giro"
            value={giro}
            onChange={(e) => setGiro(e.target.value)}
            className="w-full rounded-xl border border-stone-300 px-4 py-3 text-base bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="">Selecciona tu giro (opcional)</option>
            {GIROS_ORDERED.map((g) => (
              <option key={g.slug} value={g.slug}>
                {g.label}
              </option>
            ))}
            <option key={OTROS_OPTION.slug} value={OTROS_OPTION.slug}>
              {OTROS_OPTION.label}
            </option>
          </select>
          <p className="text-xs text-stone-500 mt-2">
            Si no aparece exactamente, elige el más parecido o usa &ldquo;Otros&rdquo; para describirlo.
          </p>
        </div>

        {needsGiroLibre && (
          <div>
            <label htmlFor="giro_libre" className="block text-sm font-semibold text-neutral-900 mb-2">
              Describe tu giro
            </label>
            <input
              id="giro_libre"
              type="text"
              value={giroLibre}
              onChange={(e) => setGiroLibre(e.target.value)}
              placeholder="Ej. clínica de acupuntura, correduría pública, tienda naturista"
              maxLength={80}
              className="w-full rounded-xl border border-orange-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            <p className="text-xs text-stone-500 mt-2">
              Escríbelo en 3–8 palabras. Lo usamos para que las imágenes de IA se vean apropiadas a tu giro.
            </p>
          </div>
        )}

        <div>
          <label htmlFor="descripcion" className="block text-sm font-semibold text-neutral-900 mb-2">
            Cuéntanos brevemente qué vendes o qué haces
          </label>
          <textarea
            id="descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Ej. Fabricamos rejas, portones y protecciones a la medida en Monterrey."
            rows={4}
            maxLength={600}
            className="w-full rounded-xl border border-stone-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-y"
          />
          <p className="text-xs text-stone-500 mt-2 text-right">{descripcion.length}/600</p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={pending || businessName.trim().length < 2}
          className="w-full rounded-xl bg-neutral-900 text-white font-semibold py-3.5 text-base hover:bg-neutral-800 disabled:opacity-50 transition-colors"
        >
          {pending ? 'Creando tu preview…' : 'Crear mi preview →'}
        </button>

        <p className="text-xs text-stone-500 text-center">
          Aún no pediremos tus datos de contacto. Solo queremos que veas cómo se verá tu sitio.
        </p>
      </form>
    </div>
  )
}
