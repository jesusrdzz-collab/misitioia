'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Widget de chat de Victoria para los sitios hospedados (slug.misitio.site).
 *
 * Burbuja flotante (abajo a la derecha) en el color del negocio; abre un panel
 * de chat que postea al proxy same-origin `/api/victoria`. El token de Konnex
 * NUNCA vive aquí: sólo se envía { slug, sessionId, texto } y el servidor
 * resuelve el token del tenant.
 *
 * Se monta SÓLO cuando el server confirmó que el tenant tiene token
 * (`enabled`); aun así maneja con gracia el caso `victoria_no_configurada`
 * (por si el token se retira) mostrando "disponible pronto" y ocultándose.
 *
 * Estilos self-contained con Tailwind; mobile-first y accesible.
 */

interface Props {
  slug: string
  primaryColor: string
  /** Mensaje de bienvenida configurable (default amable). */
  welcome?: string
}

type Role = 'user' | 'assistant'
interface ChatMessage {
  role: Role
  content: string
}

const SESSION_KEY = 'victoria_session_id'

function loadSessionId(slug: string): string {
  const key = `${SESSION_KEY}:${slug}`
  try {
    const existing = window.localStorage.getItem(key)
    if (existing) return existing
  } catch {
    // localStorage puede estar bloqueado (modo privado): usamos uno efímero.
  }
  const generated =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `s_${Date.now()}_${Math.random().toString(36).slice(2)}`
  try {
    window.localStorage.setItem(key, generated)
  } catch {
    // Se ignora: el sessionId vive sólo en memoria esta sesión.
  }
  return generated
}

export function VictoriaWidget({ slug, primaryColor, welcome }: Props) {
  const defaultWelcome =
    welcome || '¡Hola! Soy Victoria, tu asistente. ¿En qué puedo ayudarte hoy?'

  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [sessionId, setSessionId] = useState<string>('')
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: defaultWelcome },
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const scrollRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    setSessionId(loadSessionId(slug))
  }, [slug])

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, open, loading])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  async function send() {
    const texto = input.trim()
    if (!texto || loading) return

    setInput('')
    setError(null)
    setMessages((prev) => [...prev, { role: 'user', content: texto }])
    setLoading(true)

    try {
      const res = await fetch('/api/victoria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, sessionId, texto }),
      })
      const data = (await res.json()) as {
        ok?: boolean
        respuesta?: string
        error?: string
      }

      if (data.ok && data.respuesta) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.respuesta! }])
      } else if (data.error === 'victoria_no_configurada') {
        // Token retirado o aún no aprovisionado: ocultar con gracia.
        setHidden(true)
      } else {
        setError('No pude responder ahora. Intenta de nuevo en un momento.')
      }
    } catch {
      setError('Sin conexión. Revisa tu internet e intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void send()
    }
  }

  if (hidden) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      {open && (
        <div
          role="dialog"
          aria-label="Chat con Victoria"
          className="w-[calc(100vw-2rem)] max-w-sm h-[70vh] max-h-[520px] flex flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl"
        >
          {/* Encabezado */}
          <div
            className="flex items-center justify-between px-4 py-3 text-white"
            style={{ background: primaryColor }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-base"
                aria-hidden
              >
                💬
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-tight truncate">Victoria</p>
                <p className="text-[11px] leading-tight text-white/80">Asistente en línea</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar chat"
              className="rounded-full p-1.5 text-white/90 transition-colors hover:bg-white/15"
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
                <path
                  d="M5 5l10 10M15 5L5 15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* Conversación */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-gray-50 px-3 py-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'rounded-br-sm text-white'
                      : 'rounded-bl-sm border border-gray-100 bg-white text-gray-800'
                  }`}
                  style={m.role === 'user' ? { background: primaryColor } : undefined}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm border border-gray-100 bg-white px-3.5 py-2.5">
                  <span className="flex gap-1" aria-label="Victoria está escribiendo">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" />
                  </span>
                </div>
              </div>
            )}

            {error && (
              <p className="px-1 text-center text-xs text-red-500" role="alert">
                {error}
              </p>
            )}
          </div>

          {/* Entrada */}
          <div className="flex items-center gap-2 border-t border-gray-100 bg-white px-3 py-2.5">
            <label htmlFor="victoria-input" className="sr-only">
              Escribe tu mensaje
            </label>
            <input
              id="victoria-input"
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              maxLength={2000}
              disabled={loading}
              placeholder="Escribe tu mensaje…"
              className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-800 outline-none transition-colors focus:border-gray-300 focus:bg-white disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => void send()}
              disabled={loading || !input.trim()}
              aria-label="Enviar mensaje"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ background: primaryColor }}
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
                <path
                  d="M3 10l14-7-4 14-3-5-7-2z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Burbuja */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Cerrar chat de Victoria' : 'Abrir chat de Victoria'}
        aria-expanded={open}
        className="flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl transition-transform hover:-translate-y-0.5 active:scale-95"
        style={{ background: primaryColor }}
      >
        {open ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <span className="text-2xl" aria-hidden>
            💬
          </span>
        )}
      </button>
    </div>
  )
}
