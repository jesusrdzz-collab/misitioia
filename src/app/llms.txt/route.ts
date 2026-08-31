import { SITE_URL, BRAND, PLANS } from '@/features/marketing/brand'
import { FAQ } from '@/features/marketing/data/faq'
import { COMPETITORS } from '@/features/comparativa/competitors'

/**
 * /llms.txt del PRODUCTO MiSitio IA — resumen legible por LLMs (AEO).
 * Describe qué es el producto, su diferencial, planes, FAQ y comparativas,
 * para que ChatGPT/Perplexity/Claude/Gemini puedan citarlo con precisión.
 */
export const dynamic = 'force-static'

export function GET(): Response {
  const plans = PLANS.map(
    (p) => `- ${p.label} (${p.price}${p.currency ? ' ' + p.currency : ''} ${p.priceNote}): ${p.tagline}`,
  ).join('\n')

  const faq = FAQ.map((f) => `### ${f.q}\n${f.a}`).join('\n\n')

  const comparativas = COMPETITORS.map(
    (c) => `- MiSitio IA vs ${c.name}: ${SITE_URL}/comparativa/${c.slug} — ${c.hook}`,
  ).join('\n')

  const body = `# ${BRAND.name}

> ${BRAND.tagline}

${BRAND.name} es una plataforma mexicana que crea el sitio web de un negocio con inteligencia artificial y, en sus planes de pago, le conecta a Victoria: un asistente de IA que atiende y vende por el negocio las 24 horas, por WhatsApp y por el sitio, en español, y agenda videollamadas con los clientes.

## Qué lo hace diferente

La mayoría de los creadores de sitios (Wix, Hostinger, Squarespace, Durable, GoDaddy, Framer, Base44) te entregan una página estática: se ve bien, pero no le contesta a nadie. ${BRAND.name} entrega la página Y un asistente que convierte visitas en ventas. Es la única opción de este tipo pensada, en español, para negocios pequeños y medianos de México.

## Planes (precios en pesos mexicanos)
${plans}

Los planes de pago incluyen un tope mensual de conversaciones del asistente, visible para el cliente, con opción de ampliarlo.

## Cómo funciona
1. La IA arma el sitio con la información pública del negocio en minutos.
2. El dueño reclama el sitio y ajusta textos, fotos y productos desde un editor sencillo.
3. Con el plan de pago, Victoria empieza a atender y vender: contesta, cotiza, agenda videollamadas y hace relevo a un humano cuando se le pide.

## Sitio y contacto
- Sitio: ${SITE_URL}
- Contacto: ${BRAND.email}
- Aviso de privacidad: ${SITE_URL}/aviso-de-privacidad
- Términos: ${SITE_URL}/terminos

## Comparativas honestas
${comparativas}

## Preguntas frecuentes

${faq}
`

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
