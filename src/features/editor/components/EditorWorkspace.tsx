'use client'

import { useRef, useState, useTransition, useEffect } from 'react'
import { sendEditorMessage, uploadSiteImage, signOut } from '../actions'
import type { ChatMessage, AppliedChange } from '../types'
import { ROOT_DOMAIN } from '@/lib/domain'

interface Props {
  mode: 'edit' | 'create'
  initialSiteId: string | null
  initialSlug: string | null
  businessName: string | null
}

interface UiMessage extends ChatMessage {
  changes?: AppliedChange[]
  error?: boolean
}

const WELCOME_EDIT =
  '¡Hola! Soy tu asistente. Dime qué quieres cambiar de tu página: textos, colores, horario, servicios, productos o fotos. Por ejemplo: "cambia el color a azul marino" o "agrega el servicio de baño para mascotas".'
const WELCOME_CREATE =
  '¡Hola! Vamos a crear la página de tu negocio. Para empezar, dime el nombre de tu negocio y a qué se dedica (por ejemplo: "Tacos El Güero, taquería en Monterrey").'

export function EditorWorkspace({ mode, initialSiteId, initialSlug, businessName }: Props) {
  const [messages, setMessages] = useState<UiMessage[]>([
    { role: 'assistant', content: mode === 'create' ? WELCOME_CREATE : WELCOME_EDIT },
  ])
  const [input, setInput] = useState('')
  const [siteId, setSiteId] = useState<string | null>(initialSiteId)
  const [slug, setSlug] = useState<string | null>(initialSlug)
  const [name, setName] = useState<string | null>(businessName)
  const [pendingImages, setPendingImages] = useState<string[]>([])
  const [previewVersion, setPreviewVersion] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [mobileView, setMobileView] = useState<'chat' | 'preview'>('chat')
  const [pending, startTransition] = useTransition()

  const threadRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, pending])

  const previewUrl = slug ? `/sites/${slug}?preview=${previewVersion}` : null

  function send() {
    const text = input.trim()
    if ((!text && pendingImages.length === 0) || pending) return

    const userMsg: UiMessage = {
      role: 'user',
      content: text || '(imagen adjunta)',
      images: pendingImages.length ? [...pendingImages] : undefined,
    }
    const history = messages.map((m) => ({ role: m.role, content: m.content, images: m.images }))
    const imagesToSend = [...pendingImages]

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setPendingImages([])

    startTransition(async () => {
      const res = await sendEditorMessage({
        mode,
        siteId,
        history,
        message: text || 'Usa la imagen adjunta.',
        images: imagesToSend,
      })

      if (res.error) {
        setMessages((prev) => [...prev, { role: 'assistant', content: res.error!, error: true }])
        return
      }

      if (res.siteId && res.siteId !== siteId) setSiteId(res.siteId)
      if (res.slug && res.slug !== slug) setSlug(res.slug)
      if (res.created && res.slug) setName(res.slug)

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: res.reply, changes: res.changes },
      ])

      if (res.changes.length > 0 || res.created) {
        setPreviewVersion((v) => v + 1)
        if (res.created) setMobileView('preview')
      }
    })
  }

  async function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!siteId) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Primero creemos tu sitio (dime nombre y giro). Después podrás subir tu logo y fotos.',
          error: true,
        },
      ])
      return
    }
    setUploading(true)
    const fd = new FormData()
    fd.set('siteId', siteId)
    fd.set('file', file)
    const res = await uploadSiteImage(fd)
    setUploading(false)
    if (res.ok && res.url) {
      setPendingImages((prev) => [...prev, res.url!])
    } else {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: res.error || 'No pude subir la imagen.', error: true },
      ])
    }
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-gray-50">
      {/* Header */}
      <header className="shrink-0 h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg">🛠️</span>
          <span className="font-semibold text-gray-900 truncate">
            {name || 'Nuevo sitio'}
          </span>
          {slug && <span className="hidden sm:inline text-xs text-gray-400">{slug}.{ROOT_DOMAIN}</span>}
        </div>
        <div className="flex items-center gap-2">
          {siteId && (
            <a
              href={`/editar/datos?site=${siteId}`}
              className="text-sm font-medium text-gray-600 hover:text-blue-600"
              title="Abrir el panel (datos de Victoria, dominio, plan)"
            >
              Panel
            </a>
          )}
          {slug && (
            <a
              href={`/sites/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline hidden sm:inline"
            >
              Ver sitio ↗
            </a>
          )}
          <form action={signOut}>
            <button className="text-sm text-gray-500 hover:text-gray-800">Salir</button>
          </form>
        </div>
      </header>

      {/* Toggle móvil */}
      <div className="md:hidden shrink-0 flex bg-white border-b border-gray-100">
        {(['chat', 'preview'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setMobileView(v)}
            className={`flex-1 py-2.5 text-sm font-medium ${
              mobileView === v ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
            }`}
          >
            {v === 'chat' ? '💬 Chat' : '👁️ Vista previa'}
          </button>
        ))}
      </div>

      {/* Cuerpo: 2 paneles */}
      <div className="flex-1 min-h-0 flex">
        {/* Chat */}
        <section
          className={`${
            mobileView === 'chat' ? 'flex' : 'hidden'
          } md:flex flex-col w-full md:w-[440px] md:border-r border-gray-100 bg-white min-h-0`}
        >
          <div ref={threadRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <MessageBubble key={i} m={m} />
            ))}
            {pending && (
              <div className="flex items-center gap-1.5 text-gray-400 text-sm px-1">
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" />
              </div>
            )}
          </div>

          {/* Adjuntos pendientes */}
          {pendingImages.length > 0 && (
            <div className="px-4 pt-2 flex gap-2 flex-wrap">
              {pendingImages.map((url, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={url} alt="adjunto" className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
              ))}
            </div>
          )}

          {/* Input */}
          <div className="shrink-0 border-t border-gray-100 p-3">
            <div className="flex items-end gap-2">
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading || pending}
                title="Subir imagen"
                className="shrink-0 w-10 h-10 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                {uploading ? '…' : '📎'}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickImage} />
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    send()
                  }
                }}
                rows={1}
                placeholder="Escribe lo que quieres cambiar…"
                className="flex-1 resize-none max-h-32 px-3 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
              />
              <button
                onClick={send}
                disabled={pending}
                className="shrink-0 w-10 h-10 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
              >
                ➤
              </button>
            </div>
          </div>
        </section>

        {/* Preview */}
        <section
          className={`${
            mobileView === 'preview' ? 'flex' : 'hidden'
          } md:flex flex-1 flex-col bg-gray-100 min-h-0`}
        >
          {previewUrl ? (
            <iframe
              key={previewVersion}
              title="Vista previa del sitio"
              src={previewUrl}
              className="w-full h-full border-0 bg-white"
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <div className="text-5xl mb-3">🌐</div>
                <p className="text-gray-500 max-w-xs">
                  Aquí verás tu página en vivo. Cuéntame de tu negocio en el chat para crearla.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function MessageBubble({ m }: { m: UiMessage }) {
  const isUser = m.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-sm'
            : m.error
              ? 'bg-red-50 text-red-700 border border-red-100 rounded-bl-sm'
              : 'bg-gray-100 text-gray-800 rounded-bl-sm'
        }`}
      >
        {m.images && m.images.length > 0 && (
          <div className="flex gap-1.5 mb-2 flex-wrap">
            {m.images.map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={url} alt="adjunto" className="w-16 h-16 rounded-lg object-cover" />
            ))}
          </div>
        )}
        <p className="whitespace-pre-wrap">{m.content}</p>
        {m.changes && m.changes.length > 0 && (
          <ul className="mt-2 pt-2 border-t border-black/5 space-y-0.5">
            {m.changes.map((c, i) => (
              <li key={i} className="text-xs text-gray-500 flex items-center gap-1">
                <span className="text-green-600">✓</span> {c.summary}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
