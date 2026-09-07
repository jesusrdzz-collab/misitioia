'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { savePaso1bAction } from '../actions'
import { siteUrl } from '@/lib/domain'

/**
 * Paso 1b — datos que hacen el sitio publicable.
 * Todos son obligatorios por LFPDPPP (aviso de privacidad válido) y por
 * calidad mínima del sitio: teléfono/WhatsApp, correo, dirección, nombre
 * del responsable, domicilio del responsable.
 *
 * Checkbox "usar la misma" para que el responsable_domicilio no obligue a
 * escribir dos veces cuando el responsable vive en el mismo local.
 */

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] as const

interface Props {
  siteId: string
  slug: string
  businessName: string
  initial: {
    contact_phone: string | null
    contact_whatsapp: string | null
    contact_email: string | null
    contact_address: string | null
    responsable_nombre: string | null
    responsable_domicilio: string | null
    working_hours: Record<string, string> | null
  }
}

export function Paso1bForm({ siteId, slug, businessName, initial }: Props) {
  const router = useRouter()

  const [phone, setPhone] = useState(initial.contact_phone ?? '')
  const [whatsapp, setWhatsapp] = useState(initial.contact_whatsapp ?? '')
  const [email, setEmail] = useState(initial.contact_email ?? '')
  const [address, setAddress] = useState(initial.contact_address ?? '')
  const [respNombre, setRespNombre] = useState(initial.responsable_nombre ?? businessName ?? '')
  const [respDomicilio, setRespDomicilio] = useState(initial.responsable_domicilio ?? '')
  const [sameAddress, setSameAddress] = useState(
    (initial.contact_address ?? '') === (initial.responsable_domicilio ?? '') || !initial.responsable_domicilio,
  )
  const [hours, setHours] = useState<Record<string, string>>(() => {
    const base: Record<string, string> = {}
    for (const d of DAYS) base[d] = initial.working_hours?.[d] ?? ''
    return base
  })

  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const working_hours: Record<string, string> = {}
    for (const d of DAYS) if (hours[d]?.trim()) working_hours[d] = hours[d].trim()

    startTransition(async () => {
      const res = await savePaso1bAction(siteId, {
        contact_phone: phone.trim() || null,
        contact_whatsapp: whatsapp.trim() || null,
        contact_email: email.trim(),
        contact_address: address.trim(),
        responsable_nombre: respNombre.trim(),
        responsable_domicilio_igual: sameAddress,
        responsable_domicilio: sameAddress ? null : respDomicilio.trim() || null,
        working_hours: Object.keys(working_hours).length ? working_hours : null,
      })
      if (res.ok) {
        router.push(`/crear/paso-2?site=${siteId}`)
      } else {
        setError(res.error ?? 'Revisa los datos y vuelve a intentar.')
      }
    })
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-5xl font-medium text-neutral-900 tracking-tight mb-3">
          Tus datos para publicar
        </h1>
        <p className="text-stone-600 text-base md:text-lg max-w-xl mx-auto">
          Estos datos aparecen en tu sitio y en tu aviso de privacidad. Son obligatorios por ley
          en México (LFPDPPP). Puedes editarlos cuando quieras desde tu panel.
        </p>
        <a
          href={siteUrl(slug)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-4 text-sm text-orange-600 hover:underline font-medium"
        >
          Ver mi preview en otra pestaña ↗
        </a>
      </div>

      <form
        onSubmit={submit}
        className="bg-white rounded-3xl shadow-xl border border-stone-200 p-6 md:p-10 space-y-8"
      >
        <section>
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Contacto del negocio</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-neutral-800 mb-1">
                Teléfono
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="81 1234 5678"
                maxLength={40}
                className="w-full rounded-xl border border-stone-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label htmlFor="whatsapp" className="block text-sm font-medium text-neutral-800 mb-1">
                WhatsApp
              </label>
              <input
                id="whatsapp"
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="81 1234 5678"
                maxLength={40}
                className="w-full rounded-xl border border-stone-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs text-stone-500">
                Al menos uno de los dos es obligatorio. Puedes usar el mismo número.
              </p>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="email" className="block text-sm font-medium text-neutral-800 mb-1">
                Correo electrónico *
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hola@minegocio.com"
                maxLength={160}
                className="w-full rounded-xl border border-stone-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-neutral-800 mb-1">
                Dirección física del negocio *
              </label>
              <input
                id="address"
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Calle, número, colonia, ciudad, estado"
                maxLength={300}
                className="w-full rounded-xl border border-stone-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <p className="text-xs text-stone-500 mt-1">
                Aparece en tu sitio y en el mapa. Aunque atiendas a domicilio, indica dónde te ubicas.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-amber-300 bg-amber-50/60 p-5">
          <h2 className="text-lg font-semibold text-neutral-900">Responsable de datos (LFPDPPP)</h2>
          <p className="text-xs text-neutral-700 mt-1 mb-4">
            La ley mexicana exige que tu aviso de privacidad diga quién es el responsable de los
            datos personales que recibes. Suele ser tu nombre completo o el de la razón social del
            negocio.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="respNombre" className="block text-sm font-medium text-neutral-800 mb-1">
                Nombre del responsable *
              </label>
              <input
                id="respNombre"
                type="text"
                required
                value={respNombre}
                onChange={(e) => setRespNombre(e.target.value)}
                placeholder="Tu nombre completo o razón social"
                maxLength={200}
                className="w-full rounded-xl border border-stone-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label htmlFor="respDomicilio" className="block text-sm font-medium text-neutral-800 mb-1">
                Domicilio del responsable *
              </label>
              <input
                id="respDomicilio"
                type="text"
                value={sameAddress ? address : respDomicilio}
                onChange={(e) => setRespDomicilio(e.target.value)}
                placeholder={sameAddress ? 'Usando la dirección del negocio' : 'Calle, número, colonia, ciudad, estado'}
                disabled={sameAddress}
                maxLength={400}
                className="w-full rounded-xl border border-stone-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-stone-100 disabled:text-stone-500"
              />
              <label className="mt-2 flex items-center gap-2 text-xs text-neutral-700">
                <input
                  type="checkbox"
                  checked={sameAddress}
                  onChange={(e) => setSameAddress(e.target.checked)}
                  className="rounded border-stone-300"
                />
                Usar la misma dirección del negocio
              </label>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">Horario (opcional)</h2>
          <p className="text-xs text-stone-500 mb-4">
            Deja en blanco si no aplica; usa "Cerrado" para los días que no atiendes.
          </p>
          <div className="space-y-2">
            {DAYS.map((d) => (
              <div key={d} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-sm text-stone-700 font-medium">{d}</span>
                <input
                  className="flex-1 rounded-xl border border-stone-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={hours[d]}
                  onChange={(e) => setHours((prev) => ({ ...prev, [d]: e.target.value }))}
                  placeholder="9:00 - 18:00 o Cerrado"
                />
              </div>
            ))}
          </div>
        </section>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-neutral-900 text-white font-semibold py-3.5 text-base hover:bg-neutral-800 disabled:opacity-50 transition-colors"
        >
          {pending ? 'Guardando…' : 'Guardar y elegir plantilla →'}
        </button>
      </form>
    </div>
  )
}
