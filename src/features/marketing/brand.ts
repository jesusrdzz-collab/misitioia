/**
 * Constantes de marca del PRODUCTO MiSitio IA.
 *
 * Fuente única de verdad para nombre, dominio, precios y enlaces de la cara
 * pública del producto (landing, legales, comparativas, AEO).
 */
export const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'misitio.site'
export const SITE_URL = `https://${ROOT_DOMAIN}`

export const BRAND = {
  name: 'MiSitio IA',
  legalName: 'MiSitio IA',
  tagline: 'La página web que además atiende y vende sola.',
  domain: ROOT_DOMAIN,
  url: SITE_URL,
  email: 'hola@misitio.site',
  emoji: '🌐',
} as const

export interface Plan {
  id: 'free' | 'emprende' | 'crece' | 'pro'
  label: string
  /** Precio en USD, ej. '$0', '$10'. */
  price: string
  /** Ej. 'para siempre' | 'al mes'. */
  priceNote: string
  /** Moneda mostrada junto al precio (los de pago = 'USD'). */
  currency?: string
  /** Aproximado en pesos, ej. '≈ $200 MXN/mes'. */
  priceApprox?: string
  /** Conversaciones de Victoria incluidas al mes (el diferenciador entre planes). */
  conversations: string
  /** Etiqueta opcional bajo las conversaciones, ej. 'degustación'. */
  conversationsTag?: string
  highlight?: boolean
  badge?: string
  tagline: string
  features: { text: string; strong?: boolean; star?: boolean }[]
  cta: string
  href: string
}

/**
 * Planes MiSitio IA (modelo 31-ago-2026).
 *
 * El diferenciador entre planes = nº de conversaciones que Victoria atiende al
 * mes en el sitio del cliente. Todos incluyen el sitio con IA, editable por
 * chat, subdominio, catálogo, páginas legales y AEO. Las conversaciones extra
 * se cobran a granel con créditos del monedero Konnex.
 * Ancla: ESTUDIO/PLANES_Y_CREDITOS_MISITIO_IA_2026-08-31.md
 */
export const PLANS: Plan[] = [
  {
    id: 'free',
    label: 'Free',
    price: '$0',
    priceNote: 'para siempre',
    conversations: '25',
    conversationsTag: 'degustación',
    tagline: 'Tu sitio y Victoria, sin pagar nada.',
    features: [
      { text: 'Victoria atiende y agenda videollamadas 24/7', strong: true, star: true },
      { text: 'Sitio web con IA, editable por chat' },
      { text: 'Subdominio tunegocio.misitio.site' },
      { text: 'Catálogo de productos o servicios' },
      { text: 'Páginas legales y optimización para Google e IA (AEO)' },
    ],
    cta: 'Empezar gratis',
    href: '/crear',
  },
  {
    id: 'emprende',
    label: 'Emprende',
    price: '$10',
    priceNote: 'al mes',
    currency: 'USD',
    priceApprox: '≈ $200 MXN/mes',
    conversations: '100',
    tagline: 'Para el negocio que ya recibe clientes.',
    features: [
      { text: 'Todo lo del plan Free', strong: true },
      { text: 'Victoria atiende y agenda videollamadas 24/7', star: true },
      { text: '¿Se acaban? Sigues con créditos Konnex', star: true },
    ],
    cta: 'Activar Emprende',
    href: '/crear?plan=emprende',
  },
  {
    id: 'crece',
    label: 'Crece',
    price: '$25',
    priceNote: 'al mes',
    currency: 'USD',
    priceApprox: '≈ $500 MXN/mes',
    conversations: '400',
    highlight: true,
    badge: 'EL MÁS POPULAR',
    tagline: 'Para el negocio con flujo constante.',
    features: [
      { text: 'Todo lo del plan Emprende', strong: true },
      { text: 'Mejor precio por conversación', star: true },
      { text: '¿Se acaban? Sigues con créditos Konnex', star: true },
    ],
    cta: 'Activar Crece',
    href: '/crear?plan=crece',
  },
  {
    id: 'pro',
    label: 'Pro',
    price: '$50',
    priceNote: 'al mes',
    currency: 'USD',
    priceApprox: '≈ $1,000 MXN/mes',
    conversations: '1,000',
    badge: 'MÁXIMO ALCANCE',
    tagline: 'Para el negocio que vende a todo volumen.',
    features: [
      { text: 'Todo lo del plan Crece', strong: true },
      { text: 'El mejor precio por conversación', star: true },
      { text: 'Soporte prioritario', star: true },
    ],
    cta: 'Activar Pro',
    href: '/crear?plan=pro',
  },
]

export const NAV_LINKS = [
  { label: 'Cómo funciona', href: '/#como-funciona' },
  { label: 'Victoria', href: '/#victoria' },
  { label: 'Planes', href: '/#planes' },
  { label: 'Comparativa', href: '/comparativa' },
  { label: 'Ya tengo web', href: '/instalar' },
]
