'use client'

import { useState, useTransition } from 'react'
import type { ServiceItem, SiteProduct } from '@/lib/types/site'
import { saveVictoriaBasics, saveServices, type VictoriaBasics } from '../actions'
import { Banner, Card, SaveButton, inputClass, labelClass, type Feedback } from './ui'
import { CatalogSection } from './CatalogSection'

/**
 * Formulario estructurado para que el negocio cargue los datos que Victoria usa
 * para vender: contacto y ubicación, "acerca de", servicios y catálogo.
 * Todo pasa por Server Actions (nunca createBrowserClient bajo RLS).
 */

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] as const

type Tab = 'contacto' | 'acerca' | 'servicios' | 'catalogo'

interface Props {
  siteId: string
  initialBasics: VictoriaBasics
  initialServices: ServiceItem[]
  initialProducts: SiteProduct[]
}

export function DatosVictoriaForm({ siteId, initialBasics, initialServices, initialProducts }: Props) {
  const [tab, setTab] = useState<Tab>('contacto')

  const TABS: { key: Tab; label: string }[] = [
    { key: 'contacto', label: 'Contacto y ubicación' },
    { key: 'acerca', label: 'Acerca de' },
    { key: 'servicios', label: 'Servicios' },
    { key: 'catalogo', label: 'Catálogo' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Datos de Victoria</h1>
        <p className="text-gray-500 text-sm mt-1">
          Esta es la información que Victoria usa para atender y vender por ti. Mantenla al día.
        </p>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto -mx-1 px-1 pb-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'contacto' && <ContactSection siteId={siteId} initial={initialBasics} />}
      {tab === 'acerca' && <AboutSection siteId={siteId} initial={initialBasics.about_text ?? ''} />}
      {tab === 'servicios' && <ServicesSection siteId={siteId} initial={initialServices} />}
      {tab === 'catalogo' && <CatalogSection siteId={siteId} initial={initialProducts} />}
    </div>
  )
}

// ————————————————————————————————————————————————————————————————
// Contacto y ubicación (+ horarios + redes)
// ————————————————————————————————————————————————————————————————

function ContactSection({ siteId, initial }: { siteId: string; initial: VictoriaBasics }) {
  const [phone, setPhone] = useState(initial.contact_phone ?? '')
  const [whatsapp, setWhatsapp] = useState(initial.contact_whatsapp ?? '')
  const [email, setEmail] = useState(initial.contact_email ?? '')
  const [address, setAddress] = useState(initial.contact_address ?? '')
  const [ciudad, setCiudad] = useState(initial.ciudad ?? '')
  const [zona, setZona] = useState(initial.zona ?? '')
  const [estado, setEstado] = useState(initial.estado ?? '')
  const [facebook, setFacebook] = useState(initial.social_facebook ?? '')
  const [instagram, setInstagram] = useState(initial.social_instagram ?? '')
  const [hours, setHours] = useState<Record<string, string>>(() => {
    const base: Record<string, string> = {}
    for (const d of DAYS) base[d] = initial.working_hours?.[d] ?? ''
    return base
  })

  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [pending, startTransition] = useTransition()

  function save() {
    setFeedback(null)
    const working_hours: Record<string, string> = {}
    for (const d of DAYS) if (hours[d]?.trim()) working_hours[d] = hours[d].trim()

    const payload: VictoriaBasics = {
      contact_phone: phone.trim() || null,
      contact_whatsapp: whatsapp.trim() || null,
      contact_email: email.trim() || null,
      contact_address: address.trim() || null,
      ciudad: ciudad.trim() || null,
      zona: zona.trim() || null,
      estado: estado.trim() || null,
      social_facebook: facebook.trim() || null,
      social_instagram: instagram.trim() || null,
      working_hours: Object.keys(working_hours).length ? working_hours : null,
    }

    startTransition(async () => {
      const res = await saveVictoriaBasics(siteId, payload)
      setFeedback(res.ok ? { kind: 'ok', text: 'Datos guardados.' } : { kind: 'error', text: res.error ?? 'No se pudo guardar.' })
    })
  }

  return (
    <Card>
      <Banner feedback={feedback} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Teléfono</label>
          <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="81 1234 5678" />
        </div>
        <div>
          <label className={labelClass}>WhatsApp</label>
          <input className={inputClass} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="81 1234 5678" />
        </div>
        <div>
          <label className={labelClass}>Correo</label>
          <input className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="hola@negocio.com" />
        </div>
        <div>
          <label className={labelClass}>Dirección</label>
          <input className={inputClass} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Calle, número, colonia" />
        </div>
        <div>
          <label className={labelClass}>Ciudad</label>
          <input className={inputClass} value={ciudad} onChange={(e) => setCiudad(e.target.value)} placeholder="Monterrey" />
        </div>
        <div>
          <label className={labelClass}>Zona / colonia</label>
          <input className={inputClass} value={zona} onChange={(e) => setZona(e.target.value)} placeholder="Centro" />
        </div>
        <div>
          <label className={labelClass}>Estado</label>
          <input className={inputClass} value={estado} onChange={(e) => setEstado(e.target.value)} placeholder="Nuevo León" />
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Horario de atención</h3>
        <div className="space-y-2">
          {DAYS.map((d) => (
            <div key={d} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-sm text-gray-600">{d}</span>
              <input
                className={inputClass}
                value={hours[d]}
                onChange={(e) => setHours((prev) => ({ ...prev, [d]: e.target.value }))}
                placeholder="9:00 - 18:00 o Cerrado"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Facebook (URL)</label>
          <input className={inputClass} value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="https://facebook.com/…" />
        </div>
        <div>
          <label className={labelClass}>Instagram (URL)</label>
          <input className={inputClass} value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="https://instagram.com/…" />
        </div>
      </div>

      <SaveButton pending={pending} onClick={save} />
    </Card>
  )
}

// ————————————————————————————————————————————————————————————————
// Acerca de
// ————————————————————————————————————————————————————————————————

function AboutSection({ siteId, initial }: { siteId: string; initial: string }) {
  const [about, setAbout] = useState(initial)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [pending, startTransition] = useTransition()

  function save() {
    setFeedback(null)
    startTransition(async () => {
      const res = await saveVictoriaBasics(siteId, { about_text: about.trim() || null })
      setFeedback(res.ok ? { kind: 'ok', text: 'Guardado.' } : { kind: 'error', text: res.error ?? 'No se pudo guardar.' })
    })
  }

  return (
    <Card>
      <Banner feedback={feedback} />
      <label className={labelClass}>Sobre el negocio</label>
      <p className="text-xs text-gray-400 mb-2">
        Cuéntale a Victoria quién eres, qué te hace distinto y qué debe destacar al vender.
      </p>
      <textarea
        className={`${inputClass} min-h-40 resize-y`}
        value={about}
        maxLength={1500}
        onChange={(e) => setAbout(e.target.value)}
        placeholder="Somos una taquería familiar con más de 20 años…"
      />
      <p className="text-right text-xs text-gray-400 mt-1">{about.length}/1500</p>
      <SaveButton pending={pending} onClick={save} />
    </Card>
  )
}

// ————————————————————————————————————————————————————————————————
// Servicios
// ————————————————————————————————————————————————————————————————

function ServicesSection({ siteId, initial }: { siteId: string; initial: ServiceItem[] }) {
  const [items, setItems] = useState<ServiceItem[]>(initial)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [pending, startTransition] = useTransition()

  function update(i: number, patch: Partial<ServiceItem>) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)))
  }
  function add() {
    if (items.length >= 12) return
    setItems((prev) => [...prev, { name: '', description: '', icon: '' }])
  }
  function remove(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i))
  }

  function save() {
    setFeedback(null)
    const clean: ServiceItem[] = items
      .map((s) => ({
        name: s.name.trim(),
        description: (s.description ?? '').trim() || null,
        icon: (s.icon ?? '').toString().trim() || null,
      }))
      .filter((s) => s.name.length > 0)
    startTransition(async () => {
      const res = await saveServices(siteId, clean)
      if (res.ok) {
        setItems(clean)
        setFeedback({ kind: 'ok', text: 'Servicios guardados.' })
      } else {
        setFeedback({ kind: 'error', text: res.error ?? 'No se pudo guardar.' })
      }
    })
  }

  return (
    <Card>
      <Banner feedback={feedback} />
      {items.length === 0 && (
        <p className="text-sm text-gray-400 mb-4">Aún no hay servicios. Agrega el primero.</p>
      )}
      <div className="space-y-4">
        {items.map((s, i) => (
          <div key={i} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <div className="flex items-start gap-3">
              <input
                className={`${inputClass} bg-white w-16 text-center`}
                value={s.icon ?? ''}
                onChange={(e) => update(i, { icon: e.target.value })}
                placeholder="🐾"
                maxLength={8}
                aria-label="Emoji"
              />
              <input
                className={`${inputClass} bg-white flex-1`}
                value={s.name}
                onChange={(e) => update(i, { name: e.target.value })}
                placeholder="Nombre del servicio"
              />
              <button
                onClick={() => remove(i)}
                className="shrink-0 h-10 px-3 rounded-xl text-red-600 hover:bg-red-50 text-sm font-medium"
              >
                Quitar
              </button>
            </div>
            <textarea
              className={`${inputClass} bg-white mt-3 resize-y`}
              value={s.description ?? ''}
              onChange={(e) => update(i, { description: e.target.value })}
              placeholder="Descripción corta (opcional)"
              rows={2}
            />
          </div>
        ))}
      </div>

      <button
        onClick={add}
        disabled={items.length >= 12}
        className="mt-4 w-full rounded-xl border border-dashed border-gray-300 py-2.5 text-sm font-medium text-gray-600 hover:border-blue-400 hover:text-blue-600 disabled:opacity-50"
      >
        + Agregar servicio
      </button>

      <SaveButton pending={pending} onClick={save} />
    </Card>
  )
}
