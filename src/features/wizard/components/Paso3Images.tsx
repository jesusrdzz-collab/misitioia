'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  regenerateWizardImageAction,
  setWizardImageAction,
  finishWizardAction,
} from '../actions'
import { uploadSiteImage } from '@/features/editor/actions'
import { siteUrl } from '@/lib/domain'
import { trackFbq } from '@/features/marketing/lib/pixel'

type Slot = 'hero' | 'about' | 'catalog'

const SLOT_META: Record<Slot, { title: string; hint: string; ratio: string }> = {
  hero: {
    title: 'Portada (hero)',
    hint: 'La primera imagen que ve el visitante. Preferimos horizontal 16:9.',
    ratio: 'aspect-[16/9]',
  },
  about: {
    title: 'Sobre nosotros',
    hint: 'Foto del equipo, del local o del trabajo. Formato 4:3.',
    ratio: 'aspect-[4/3]',
  },
  catalog: {
    title: 'Catálogo (placeholder)',
    hint: 'Se usa cuando un producto no tiene foto propia. Cuadrada 1:1.',
    ratio: 'aspect-square',
  },
}

interface Props {
  siteId: string
  slug: string
  initial: { hero: string | null; about: string | null; catalog: string | null }
  /** Regens IA ya usadas por slot. 0 = habilitado, 1 = agotado. */
  regensUsed: { hero: number; about: number; catalog: number }
}

export function Paso3Images({ siteId, slug, initial, regensUsed }: Props) {
  const router = useRouter()
  const [images, setImages] = useState(initial)
  const [regens, setRegens] = useState(regensUsed)
  const [pending, startTransition] = useTransition()

  function update(slot: Slot, url: string | null) {
    setImages((prev) => ({ ...prev, [slot]: url }))
  }

  function markRegenUsed(slot: Slot) {
    setRegens((prev) => ({ ...prev, [slot]: 1 }))
  }

  function finish() {
    // Meta Pixel: tenant/site creado y publicado — punto máximo del funnel.
    // Se dispara ANTES del server action porque éste hace redirect() y no
    // regresa control al cliente. Si por alguna razón la autorización falla,
    // el server action redirige a /crear/paso-1a (falso positivo aceptable —
    // el usuario ya completó los 3 pasos, aunque no autoricemos su site).
    trackFbq('CompleteRegistration', {
      content_name: 'wizard_completado',
      status: 'site_publicado',
    })
    startTransition(async () => {
      // Server action is a redirect() → nunca resuelve; el push es no-op tras.
      await finishWizardAction(siteId)
    })
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-5xl font-medium text-neutral-900 tracking-tight mb-3">
          Últimos toques: imágenes
        </h1>
        <p className="text-stone-600 text-base md:text-lg max-w-2xl mx-auto">
          Sube tus propias fotos o deja que la IA las genere para ti. Todo se puede cambiar
          después desde tu panel.
        </p>
        <a
          href={siteUrl(slug)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-4 text-sm text-orange-600 hover:underline font-medium"
        >
          Ver mi sitio en otra pestaña ↗
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {(['hero', 'about', 'catalog'] as Slot[]).map((slot) => (
          <ImageSlotCard
            key={slot}
            slot={slot}
            siteId={siteId}
            url={images[slot]}
            regenUsed={regens[slot] > 0}
            onChange={(url) => update(slot, url)}
            onRegenUsed={() => markRegenUsed(slot)}
          />
        ))}
      </div>

      <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <a
          href={`/crear/paso-2?site=${siteId}`}
          className="text-sm text-stone-500 hover:text-neutral-900 underline underline-offset-4"
        >
          ← Volver a plantilla
        </a>
        <button
          type="button"
          onClick={finish}
          disabled={pending}
          className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold px-8 py-3.5 hover:brightness-110 disabled:opacity-60 shadow-lg"
        >
          {pending ? 'Publicando…' : '¡Publicar mi sitio! →'}
        </button>
      </div>
    </div>
  )
}

interface SlotCardProps {
  slot: Slot
  siteId: string
  url: string | null
  regenUsed: boolean
  onChange: (url: string | null) => void
  onRegenUsed: () => void
}

function ImageSlotCard({ slot, siteId, url, regenUsed, onChange, onRegenUsed }: SlotCardProps) {
  const meta = SLOT_META[slot]
  const [source, setSource] = useState<'ai' | 'stock' | 'uploaded' | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [uploading, setUploading] = useState(false)
  const [localRegenUsed, setLocalRegenUsed] = useState(regenUsed)

  function regen() {
    setMsg(null)
    startTransition(async () => {
      const res = await regenerateWizardImageAction(siteId, slot)
      if (res.ok && res.url) {
        onChange(res.url)
        setSource(res.source ?? null)
        setMsg(res.source === 'ai' ? '✨ Nueva imagen generada con IA.' : 'Imagen de galería aplicada.')
        // Solo bloqueamos si Gemini realmente generó (source='ai').
        // Un fallback a stock no consumió el candado.
        if (res.source === 'ai') {
          setLocalRegenUsed(true)
          onRegenUsed()
        }
      } else {
        if (res.code === 'REGEN_LIMIT_REACHED') {
          setLocalRegenUsed(true)
          onRegenUsed()
        }
        setMsg(res.error ?? 'No se pudo generar.')
      }
    })
  }

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setMsg(null)
    setUploading(true)

    const fd = new FormData()
    fd.append('file', file)
    fd.append('siteId', siteId)
    const up = await uploadSiteImage(fd)
    if (!up.ok || !up.url) {
      setMsg(up.error ?? 'No se pudo subir la imagen.')
      setUploading(false)
      return
    }

    const save = await setWizardImageAction(siteId, { slot, image_url: up.url })
    if (!save.ok) {
      setMsg(save.error ?? 'No se pudo guardar.')
    } else {
      onChange(up.url)
      setSource('uploaded')
      setMsg('Imagen subida correctamente.')
    }
    setUploading(false)
  }

  const busy = pending || uploading

  return (
    <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
      <div className={`${meta.ratio} bg-stone-100 flex items-center justify-center`}>
        {url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={url} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs text-stone-400 uppercase tracking-widest">Sin imagen</span>
        )}
      </div>
      <div className="p-4 space-y-3">
        <div>
          <p className="text-sm font-semibold text-neutral-900">{meta.title}</p>
          <p className="text-xs text-stone-500 mt-1">{meta.hint}</p>
          {source && (
            <p className="text-[10px] uppercase tracking-widest text-stone-400 mt-2">
              {source === 'ai' ? 'Generada con IA' : source === 'uploaded' ? 'Foto propia' : 'De galería'}
            </p>
          )}
        </div>
        {msg && <p className="text-xs text-stone-600">{msg}</p>}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={regen}
            disabled={busy || localRegenUsed}
            title={
              localRegenUsed
                ? 'Ya usaste la regeneración con IA de esta foto. Puedes subir la tuya sin límite.'
                : undefined
            }
            className="w-full rounded-xl bg-neutral-900 text-white text-xs font-semibold px-3 py-2.5 hover:bg-neutral-800 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {localRegenUsed
              ? '✓ Regeneración IA usada'
              : pending
                ? 'Generando…'
                : '✨ Generar con IA'}
          </button>
          {localRegenUsed && (
            <p className="text-[10px] text-stone-500 text-center leading-snug">
              Puedes subir tu propia foto sin límite.
            </p>
          )}
          <label className="w-full">
            <span className="block w-full text-center rounded-xl border border-stone-300 text-neutral-900 text-xs font-semibold px-3 py-2.5 hover:bg-stone-50 cursor-pointer">
              {uploading ? 'Subiendo…' : '📷 Subir mi foto'}
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={upload}
              disabled={busy}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  )
}
