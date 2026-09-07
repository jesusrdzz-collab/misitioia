/**
 * Helpers de contacto compartidos por el render del sitio, el header y el
 * footer. Un solo lugar para normalizar teléfono → tel: / wa.me.
 *
 * Fix P0 pre-campaña Meta (2026-09-07): añadimos el texto pre-llenado en el
 * link de WhatsApp para reducir la fricción (antes el cliente abría un chat
 * vacío y tenía que escribir desde cero). El mensaje depende del giro para
 * que suene natural: "quiero cotización" en seguros/finanzas, "agendar cita"
 * en clínicas/estética, "hacer reserva" en restaurantes, etc.
 */

export function telHref(phone: string | null | undefined): string | null {
  if (!phone) return null
  const digits = phone.replace(/[^\d+]/g, '')
  return digits ? `tel:${digits}` : null
}

/**
 * Construye una URL wa.me lista para abrir un chat de WhatsApp. Cuando se
 * pasa `text`, se envía como mensaje pre-llenado (URL-encoded).
 */
export function waHref(
  phone: string | null | undefined,
  text?: string | null,
): string | null {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '')
  if (!digits) return null
  // Números mexicanos de 10 dígitos → anteponer lada país 52.
  const withCc = digits.length === 10 ? `52${digits}` : digits
  const base = `https://wa.me/${withCc}`
  const trimmed = (text ?? '').trim()
  if (!trimmed) return base
  return `${base}?text=${encodeURIComponent(trimmed)}`
}

/**
 * Mapa de giro → mensaje pre-llenado natural. Se agrupan por intención:
 *   - cotización: seguros, finanzas, contabilidad, legal, inmobiliaria,
 *     marketing, construcción, imprenta, herrería, remodelaciones
 *   - cita: dental, estética, spa, veterinaria, fisioterapia, barbería,
 *     nutriólogo, óptica
 *   - reserva: restaurante, cafetería, salón de fiestas
 *   - producto: boutique, ferretería, farmacia, florería, minisúper,
 *     papelería, joyería, zapatería, mueblería, telas, muebles,
 *     purificadora, tienda de mascotas
 *   - servicio: taller mecánico/motos, aire acondicionado, plomería,
 *     electricista, cerrajería, carpintería, tapicería, llantera,
 *     refaccionaria, vidriería
 *   - inscripción: escuela, gimnasio
 *   - evento: eventos, catering, fotografía, agencia viajes, renta mobiliario
 *   - fallback (otros / desconocido): interés general
 */
const WA_INTENT_BY_GIRO: Record<string, string> = {
  // cotización
  seguros: 'Hola, me interesa una cotización',
  finanzas: 'Hola, me interesa una cotización',
  contabilidad: 'Hola, me interesa una cotización',
  'asesoria-legal': 'Hola, me interesa una cotización',
  inmobiliaria: 'Hola, me interesa una cotización',
  'agencia-marketing': 'Hola, me interesa una cotización',
  construccion: 'Hola, me interesa una cotización',
  'material-construccion': 'Hola, me interesa una cotización',
  remodelaciones: 'Hola, me interesa una cotización',
  imprenta: 'Hola, me interesa una cotización',
  herreria: 'Hola, me interesa una cotización',
  carpinteria: 'Hola, me interesa una cotización',
  uniformes: 'Hola, me interesa una cotización',

  // cita
  dentista: 'Hola, quiero agendar una cita',
  estetica: 'Hola, quiero agendar una cita',
  spa: 'Hola, quiero agendar una cita',
  veterinaria: 'Hola, quiero agendar una cita',
  fisioterapia: 'Hola, quiero agendar una cita',
  barberia: 'Hola, quiero agendar una cita',
  nutriologo: 'Hola, quiero agendar una cita',
  optica: 'Hola, quiero agendar una cita',

  // reserva
  restaurante: 'Hola, quiero hacer una reserva',
  cafeteria: 'Hola, quiero hacer una reserva',
  'salon-fiestas': 'Hola, quiero hacer una reserva',

  // producto
  boutique: 'Hola, me interesa un producto',
  ferreteria: 'Hola, me interesa un producto',
  farmacia: 'Hola, me interesa un producto',
  floreria: 'Hola, me interesa un producto',
  minisuper: 'Hola, me interesa un producto',
  papeleria: 'Hola, me interesa un producto',
  joyeria: 'Hola, me interesa un producto',
  zapateria: 'Hola, me interesa un producto',
  muebleria: 'Hola, me interesa un producto',
  'telas-merceria': 'Hola, me interesa un producto',
  purificadora: 'Hola, me interesa un producto',
  'tienda-mascotas': 'Hola, me interesa un producto',
  panaderia: 'Hola, me interesa un producto',

  // servicio
  'taller-mecanico': 'Hola, necesito un servicio',
  'taller-motos': 'Hola, necesito un servicio',
  'aire-acondicionado': 'Hola, necesito un servicio',
  plomeria: 'Hola, necesito un servicio',
  electricista: 'Hola, necesito un servicio',
  cerrajeria: 'Hola, necesito un servicio',
  tapiceria: 'Hola, necesito un servicio',
  llantera: 'Hola, necesito un servicio',
  refaccionaria: 'Hola, necesito un servicio',
  vidrieria: 'Hola, necesito un servicio',

  // inscripción
  escuela: 'Hola, quiero información sobre inscripciones',
  gimnasio: 'Hola, quiero información sobre inscripciones',

  // evento
  eventos: 'Hola, quiero cotizar un evento',
  'agencia-viajes': 'Hola, quiero cotizar un viaje',
  fotografia: 'Hola, quiero cotizar una sesión',
  'renta-mobiliario': 'Hola, quiero cotizar renta de mobiliario',
}

/**
 * Devuelve el mensaje pre-llenado sugerido para un giro. Si el giro no está
 * mapeado (incluido `otros`, giros nuevos aún sin clasificar o sitios muy
 * viejos con `giro=null`), devuelve un fallback genérico y educado.
 */
export function waMessageForGiro(giro: string | null | undefined): string {
  if (!giro) return 'Hola, vi su sitio y me interesa más información'
  return (
    WA_INTENT_BY_GIRO[giro] ?? 'Hola, vi su sitio y me interesa más información'
  )
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
