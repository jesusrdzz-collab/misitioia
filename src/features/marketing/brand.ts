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
  id: 'gratis' | 'nivel_2' | 'nivel_3'
  label: string
  price: string
  priceNote: string
  currency?: string
  highlight?: boolean
  badge?: string
  tagline: string
  features: { text: string; strong?: boolean; star?: boolean }[]
  cta: string
  href: string
}

export const PLANS: Plan[] = [
  {
    id: 'gratis',
    label: 'Gratis',
    price: '$0',
    priceNote: 'para siempre',
    tagline: 'Tu negocio, en línea hoy mismo.',
    features: [
      { text: 'Página web profesional con tu información' },
      { text: 'Subdominio tunegocio.misitio.site' },
      { text: 'Catálogo de productos o servicios' },
      { text: 'Edición básica de contenido' },
      { text: 'Optimizada para Google y celular' },
    ],
    cta: 'Empezar gratis',
    href: '/crear',
  },
  {
    id: 'nivel_2',
    label: 'Nivel 2',
    price: '$349',
    priceNote: 'por mes',
    currency: 'MXN',
    highlight: true,
    badge: 'EL QUE VENDE SOLO',
    tagline: 'Victoria contesta y vende por ti, 24/7.',
    features: [
      { text: 'Todo lo del plan gratis' },
      { text: 'Victoria: asistente de IA que atiende y vende 24/7', strong: true, star: true },
      { text: 'Agenda videollamadas con tus clientes', strong: true, star: true },
      { text: 'Chat en vivo con relevo humano cuando quieras', star: true },
      { text: 'CRM: ve quién te escribió y qué pidió', star: true },
      { text: 'Editor autoservicio · sin nuestra marca', star: true },
    ],
    cta: 'Activar Nivel 2',
    href: '/crear?plan=nivel_2',
  },
  {
    id: 'nivel_3',
    label: 'Nivel 3',
    price: '$699',
    priceNote: 'por mes',
    currency: 'MXN',
    badge: 'TODO CONECTADO',
    tagline: 'Tu dominio propio y WhatsApp con IA.',
    features: [
      { text: 'Todo lo del Nivel 2' },
      { text: 'Dominio propio (tunegocio.com)', strong: true, star: true },
      { text: 'WhatsApp conectado con Victoria', strong: true, star: true },
      { text: 'Analítica de conversaciones y ventas', star: true },
      { text: 'Más conversaciones incluidas', star: true },
      { text: 'Soporte prioritario', star: true },
    ],
    cta: 'Activar Nivel 3',
    href: '/crear?plan=nivel_3',
  },
]

export const NAV_LINKS = [
  { label: 'Cómo funciona', href: '/#como-funciona' },
  { label: 'Victoria', href: '/#victoria' },
  { label: 'Planes', href: '/#planes' },
  { label: 'Comparativa', href: '/comparativa' },
]
