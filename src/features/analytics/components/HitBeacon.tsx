'use client'

/**
 * Beacon anónimo — dispara UN POST a /api/hit por load de página.
 * Se monta en el root layout de MiSitio (apex/wizard/panel).
 *
 * No manda PII. El server lee fbclid/utms/session desde las cookies que el
 * middleware ya escribió, así el cliente sólo aporta path y referer.
 *
 * `sendBeacon` como plan A (sobrevive al unload/navigation); fetch como fallback.
 */

import { useEffect } from 'react'

interface Props {
  eventType?: 'pageview' | 'victoria_open' | 'victoria_signup_redirect'
}

export function HitBeacon({ eventType = 'pageview' }: Props) {
  useEffect(() => {
    // Guard: sólo un beacon por (path + eventType) por load
    const sessionKey = `_mis_beacon_${eventType}_${window.location.pathname}`
    if (sessionStorage.getItem(sessionKey)) return
    sessionStorage.setItem(sessionKey, '1')

    const body = JSON.stringify({
      event_type: eventType,
      path: window.location.pathname + window.location.search,
      referer: document.referrer || null,
    })

    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: 'application/json' })
        navigator.sendBeacon('/api/hit', blob)
      } else {
        void fetch('/api/hit', {
          method: 'POST',
          body,
          headers: { 'Content-Type': 'application/json' },
          keepalive: true,
        })
      }
    } catch {
      // silencioso — instrumentación no debe romper la app
    }
  }, [eventType])

  return null
}
