/**
 * Helper client-side para disparar eventos custom del Meta Pixel corporativo.
 *
 * Reglas:
 *  - No dispara si el usuario no aceptó cookies (`window.__msConsent.granted`
 *    debe ser true). Si el pixel se cargó en modo revoke, `fbq('track', ...)`
 *    igual encola pero no envía — este guard es defensa extra.
 *  - Silencioso: cualquier excepción se traga (instrumentación NUNCA rompe
 *    la app).
 *  - Solo corre en cliente. En SSR es no-op.
 */

// Declaración local del global. Evitamos contaminar un .d.ts global porque
// `fbq` solo debería usarse desde este helper.
interface Fbq {
  (command: 'track', eventName: string, params?: Record<string, unknown>): void
  (command: 'trackCustom', eventName: string, params?: Record<string, unknown>): void
  (command: 'consent', action: 'grant' | 'revoke'): void
  (command: 'init', pixelId: string): void
}

interface MsConsent {
  granted: boolean
}

declare global {
  interface Window {
    fbq?: Fbq
    __msConsent?: MsConsent
  }
}

/**
 * Dispara un evento estándar del Pixel (Lead, CompleteRegistration, etc.).
 * Silencioso ante errores. Solo dispara si consent está otorgado.
 */
export function trackFbq(eventName: string, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return
  try {
    if (!window.__msConsent?.granted) return
    if (typeof window.fbq !== 'function') return
    if (params) {
      window.fbq('track', eventName, params)
    } else {
      window.fbq('track', eventName)
    }
  } catch {
    // Silencioso — instrumentación no rompe la app.
  }
}
