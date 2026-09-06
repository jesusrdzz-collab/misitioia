'use client'

/**
 * Formulario de reclamación de negocio. Envía FormData al server action
 * `submitSiteClaim` (incluye el archivo de evidencia). Maneja estado local
 * (envío / éxito / error) sin librerías adicionales.
 */
import { useState } from 'react'
import { submitSiteClaim } from './actions'

interface Props {
  slug: string
  businessName: string
}

type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'success' }
  | { kind: 'error'; message: string }

export function ClaimForm({ slug, businessName }: Props) {
  const [status, setStatus] = useState<Status>({ kind: 'idle' })

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (status.kind === 'sending') return
    setStatus({ kind: 'sending' })
    const form = e.currentTarget
    const formData = new FormData(form)
    formData.set('slug', slug)
    const result = await submitSiteClaim(formData)
    if (result.ok) {
      setStatus({ kind: 'success' })
      form.reset()
    } else {
      setStatus({ kind: 'error', message: result.error || 'No se pudo enviar' })
    }
  }

  if (status.kind === 'success') {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900">
        <div className="text-3xl mb-2">Solicitud recibida</div>
        <p className="text-sm leading-relaxed">
          Gracias. Recibimos tu solicitud para <strong>{businessName}</strong>.
          Una persona del equipo la revisará con tus datos y la evidencia que
          adjuntaste. Si todo cuadra, te contactamos en 24–48 horas al correo
          que registraste para darte acceso.
        </p>
        <p className="mt-3 text-xs text-emerald-800">
          Mientras tanto, la página sigue funcionando. Nada se dio de baja de
          manera automática — así protegemos a los verdaderos dueños.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="claimant_name"
          className="block text-sm font-medium text-gray-800 mb-1"
        >
          Tu nombre completo
        </label>
        <input
          id="claimant_name"
          name="claimant_name"
          type="text"
          required
          maxLength={120}
          autoComplete="name"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="claimant_email"
            className="block text-sm font-medium text-gray-800 mb-1"
          >
            Correo electrónico
          </label>
          <input
            id="claimant_email"
            name="claimant_email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div>
          <label
            htmlFor="claimant_phone"
            className="block text-sm font-medium text-gray-800 mb-1"
          >
            Teléfono o WhatsApp <span className="text-gray-400">(opcional)</span>
          </label>
          <input
            id="claimant_phone"
            name="claimant_phone"
            type="tel"
            autoComplete="tel"
            maxLength={40}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="relation"
          className="block text-sm font-medium text-gray-800 mb-1"
        >
          ¿Cuál es tu relación con el negocio?
        </label>
        <select
          id="relation"
          name="relation"
          required
          defaultValue=""
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
        >
          <option value="" disabled>
            Selecciona una opción
          </option>
          <option value="dueno">Soy el dueño / propietario</option>
          <option value="apoderado">Soy apoderado legal</option>
          <option value="gerente">Soy gerente o encargado</option>
          <option value="empleado">Soy empleado autorizado</option>
          <option value="otro">Otra (explica en el mensaje)</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium text-gray-800 mb-1"
        >
          Cuéntanos por qué es tu negocio
        </label>
        <textarea
          id="message"
          name="message"
          required
          minLength={20}
          maxLength={4000}
          rows={5}
          placeholder="Ej. Soy dueño de la herrería desde 2015, tengo el RFC a mi nombre. La página tiene mi dirección y teléfono pero no la subí yo — la vi en Google y quiero tomar control."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div>
        <label
          htmlFor="evidence"
          className="block text-sm font-medium text-gray-800 mb-1"
        >
          Evidencia <span className="text-gray-400">(recomendado)</span>
        </label>
        <input
          id="evidence"
          name="evidence"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/heic,application/pdf"
          className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-800 hover:file:bg-gray-200"
        />
        <p className="mt-1 text-xs text-gray-500">
          Sube factura del negocio, comprobante de domicilio, INE, acta
          constitutiva o poder notarial. PNG, JPG, WEBP, HEIC o PDF, máximo
          10 MB. Sin evidencia también podemos revisar tu caso, pero puede
          tardar más.
        </p>
      </div>

      {status.kind === 'error' && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {status.message}
        </div>
      )}

      <button
        type="submit"
        disabled={status.kind === 'sending'}
        className="w-full rounded-xl bg-gray-900 py-3 text-white font-medium transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-500"
      >
        {status.kind === 'sending' ? 'Enviando...' : 'Enviar solicitud para revisión'}
      </button>

      <p className="text-xs text-gray-500 leading-relaxed">
        Al enviar aceptas que revisemos tus datos y evidencia. Nada se da
        de baja de forma automática — un humano lo analiza. Tratamos tus
        datos conforme a la LFPDPPP y sólo para atender esta solicitud.
      </p>
    </form>
  )
}
