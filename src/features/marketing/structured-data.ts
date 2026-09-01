/**
 * JSON-LD (schema.org) del PRODUCTO MiSitio IA para AEO.
 *
 * - Organization: identidad de la empresa/marca.
 * - SoftwareApplication: el producto SaaS, con planes/precios.
 * - FAQPage: las preguntas frecuentes (mismas de la landing).
 *
 * Se serializa con JSON.stringify e inyecta con <script type="application/ld+json">.
 */
import { BRAND, SITE_URL, PLANS } from './brand'
import { FAQ } from './data/faq'

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: BRAND.name,
    legalName: BRAND.legalName,
    url: SITE_URL,
    email: BRAND.email,
    logo: `${SITE_URL}/icon-512.png`,
    image: `${SITE_URL}/img/og-image.webp`,
    slogan: BRAND.tagline,
    description:
      'MiSitio IA crea sitios web con inteligencia artificial para negocios en México, optimizados para la nueva era de la búsqueda con IA (AEO: ChatGPT, Gemini, Perplexity). La web es gratis; Victoria, un asistente que atiende y vende 24/7 por WhatsApp y web y agenda videollamadas, es el complemento opcional.',
    parentOrganization: { '@type': 'Organization', name: BRAND.parent },
    areaServed: { '@type': 'Country', name: 'México' },
    inLanguage: 'es-MX',
    sameAs: [] as string[],
  }
}

export function softwareApplicationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: BRAND.name,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: SITE_URL,
    description:
      'Plataforma que genera gratis la página web de tu negocio con IA, lista para los buscadores de IA (AEO: ChatGPT, Gemini, Perplexity) y para Google, y opcionalmente le suma un asistente de ventas (Victoria) que atiende 24/7 por WhatsApp y web y agenda videollamadas.',
    inLanguage: 'es-MX',
    offers: PLANS.map((p) => ({
      '@type': 'Offer',
      name: p.label,
      price: p.price.replace(/[^0-9]/g, '') || '0',
      priceCurrency: 'USD',
      description: p.tagline,
      category: p.id === 'free' ? 'free' : 'subscription',
    })),
    aggregateRating: undefined,
  }
}

export function faqPageJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }
}

/** Un <script> serializado para inyectar en el head/JSX. */
export function jsonLdScript(data: unknown) {
  return { __html: JSON.stringify(data) }
}
