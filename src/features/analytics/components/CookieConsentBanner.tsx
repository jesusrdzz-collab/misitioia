'use client'

import { useEffect, useState } from 'react'

/**
 * Banner de consentimiento de cookies para los sitios publicados.
 *
 * Aparece al pie del sitio la primera vez que un visitante entra (o si su
 * elección expiró) y ofrece dos opciones:
 *   - "Aceptar":       guarda `cookieConsent=granted` con TTL de 12 meses y
 *                       emite `cookie-consent-changed` con `granted: true` para
 *                       que Pixel/GA disparen su PageView.
 *   - "Solo esenciales": guarda `cookieConsent=denied` con TTL de 12 meses;
 *                       Pixel/GA se quedan en su estado por defecto (denegado).
 *
 * La elección persiste en `localStorage` con timestamp. Al reabrir el sitio se
 * respeta y el banner NO vuelve a mostrarse hasta que caduca (o si el usuario
 * la limpia).
 *
 * El banner se muestra siempre que el sitio tenga analíticas activas
 * (`enabled`), incluso si el visitante ya aceptó — porque en cargas posteriores
 * el estado guardado dispara `granted` automáticamente desde AnalyticsScripts,
 * y el banner solo aparece cuando aún no hay elección persistida.
 */

interface Props {
  cookiesPath: string
  enabled: boolean
}

const KEY = 'cookieConsent'
const KEY_AT = 'cookieConsent_at'
const TTL_MS = 365 * 24 * 60 * 60 * 1000 // 12 meses

function readStored(): 'granted' | 'denied' | null {
  try {
    const value = window.localStorage.getItem(KEY)
    const at = window.localStorage.getItem(KEY_AT)
    if (!value) return null
    if (at) {
      const parsed = Number.parseInt(at, 10)
      if (Number.isFinite(parsed) && Date.now() - parsed > TTL_MS) {
        window.localStorage.removeItem(KEY)
        window.localStorage.removeItem(KEY_AT)
        return null
      }
    }
    if (value === 'granted' || value === 'denied') return value
    return null
  } catch {
    return null
  }
}

function persist(value: 'granted' | 'denied') {
  try {
    window.localStorage.setItem(KEY, value)
    window.localStorage.setItem(KEY_AT, String(Date.now()))
  } catch {
    // Modo privado / storage bloqueado: la elección solo dura esta visita.
  }
  try {
    const evt = new CustomEvent('cookie-consent-changed', {
      detail: { granted: value === 'granted' },
    })
    window.dispatchEvent(evt)
  } catch {
    // Sin CustomEvent (browsers muy viejos): silencioso; no bloquea la UI.
  }
}

export function CookieConsentBanner({ cookiesPath, enabled }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!enabled) return
    const stored = readStored()
    if (stored == null) setVisible(true)
  }, [enabled])

  if (!enabled || !visible) return null

  function choose(value: 'granted' | 'denied') {
    persist(value)
    setVisible(false)
  }

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Aviso de cookies"
      className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3 sm:px-5 sm:pb-5"
    >
      <div className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white/95 backdrop-blur shadow-xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <p className="text-sm text-gray-700 leading-relaxed flex-1">
            Usamos cookies para entender cómo se navega el sitio y mostrar mejores anuncios.
            Puedes aceptarlas o quedarte solo con las esenciales.{' '}
            <a href={cookiesPath} className="text-blue-600 hover:underline">
              Más información
            </a>
            .
          </p>
          <div className="flex flex-wrap gap-2 sm:shrink-0">
            <button
              onClick={() => choose('denied')}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Solo esenciales
            </button>
            <button
              onClick={() => choose('granted')}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
