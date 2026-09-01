/**
 * Prueba de humo de la Fase 8 (embed/plugin). Corre con:
 *   npx tsx --env-file=.env.local scripts/test-embed.ts
 *
 * Verifica: motor de auditoría (reglas) + recomendaciones Gemini + Victoria
 * webchat + persistencia (crear embed_site, guardar auditoría, leerla).
 */
import { runAudit } from '@/features/embed/audit'
import { generateRecommendations } from '@/features/embed/recommendations'
import { runWebchat } from '@/features/embed/webchat'
import {
  createEmbedSite,
  getEmbedSiteByToken,
  saveAudit,
  getLatestAudit,
} from '@/features/embed/store'
import type { PageSignals } from '@/features/embed/types'

const signals: PageSignals = {
  url: 'https://ejemplo-negocio.com/',
  origin: 'https://ejemplo-negocio.com',
  title: 'Refaccionaria El Tornillo',
  metaDescription: null,
  canonical: null,
  lang: 'es',
  h1: ['Refaccionaria El Tornillo'],
  h2: ['Autopartes', 'Contacto'],
  jsonLdCount: 0,
  jsonLdTypes: [],
  hasLlmsTxt: false,
  hasViewport: true,
  hasOgTitle: false,
  hasOgImage: false,
  isHttps: true,
  wordCount: 120,
  textSample:
    'Refaccionaria El Tornillo. Vendemos autopartes, filtros, aceites y accesorios para auto en Monterrey. Abierto de lunes a sábado.',
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY
  console.log('GEMINI_API_KEY presente:', !!apiKey)

  // 1. Auditoría por reglas
  const { score, checks } = runAudit(signals)
  console.log('\n[1] Puntaje AEO:', score, '/100')
  console.log('    checks:', checks.map((c) => `${c.id}=${c.status}`).join(' '))

  // 2. Recomendaciones (Gemini real)
  const { recommendations, model } = await generateRecommendations(signals, score, checks, apiKey)
  console.log('\n[2] Recomendaciones (modelo:', model, '):')
  recommendations.forEach((r, i) => console.log(`    ${i + 1}. ${r}`))

  // 3. Persistencia: crear embed_site, guardar auditoría, leerla
  const site = await createEmbedSite({
    ownerEmail: 'test-embed@misitio.site',
    name: 'Refaccionaria El Tornillo (test)',
    platform: 'wordpress',
  })
  console.log('\n[3] embed_site creado. token:', site.token)

  const byToken = await getEmbedSiteByToken(site.token)
  console.log('    getEmbedSiteByToken ok:', byToken?.id === site.id)

  await saveAudit({
    embedSiteId: site.id,
    url: signals.url,
    signals,
    report: { score, checks, recommendations, summary: `Puntaje ${score}/100`, model },
  })
  const latest = await getLatestAudit(site.id)
  console.log('    auditoría guardada y leída. score:', latest?.score)

  // 4. Victoria webchat (Gemini real)
  if (apiKey) {
    const reply = await runWebchat({
      apiKey,
      site,
      audit: latest,
      history: [],
      message: '¿Venden filtros de aceite?',
    })
    console.log('\n[4] Victoria responde:', reply)
  }

  console.log('\nOK. Prueba de humo completada.')
}

main().catch((e) => {
  console.error('FALLÓ:', e)
  process.exit(1)
})
