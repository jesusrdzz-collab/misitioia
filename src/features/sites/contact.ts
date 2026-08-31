/**
 * Helpers de contacto compartidos por el render del sitio, el header y el
 * footer. Un solo lugar para normalizar teléfono → tel: / wa.me.
 */

export function telHref(phone: string | null | undefined): string | null {
  if (!phone) return null
  const digits = phone.replace(/[^\d+]/g, '')
  return digits ? `tel:${digits}` : null
}

export function waHref(phone: string | null | undefined): string | null {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '')
  if (!digits) return null
  // Números mexicanos de 10 dígitos → anteponer lada país 52.
  const withCc = digits.length === 10 ? `52${digits}` : digits
  return `https://wa.me/${withCc}`
}

/** URL de Google Maps embebible (sin API key) a partir de una dirección. */
export function mapEmbedHref(address: string | null | undefined): string | null {
  if (!address) return null
  return `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`
}

/** URL de Google Maps para abrir en una pestaña nueva ("cómo llegar"). */
export function mapLinkHref(address: string | null | undefined): string | null {
  if (!address) return null
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
}
