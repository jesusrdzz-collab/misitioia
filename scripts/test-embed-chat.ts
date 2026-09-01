/**
 * Prueba de Victoria embebida sin DB.
 *   npx tsx --env-file=.env.local scripts/test-embed-chat.ts
 */
import { runWebchat } from '@/features/embed/webchat'
import type { EmbedAudit, EmbedSite } from '@/features/embed/types'

const site: EmbedSite = {
  id: 'test', owner_email: 'x@x.com', tenant_id: null,
  token: 'mst_x', name: 'Refaccionaria El Tornillo', origin: 'https://ejemplo-negocio.com',
  platform: 'wordpress', status: 'activo', konnex_tenant_id: null,
  created_at: '', updated_at: '',
}
const audit = {
  id: 'a', embed_site_id: 'test', url: 'https://ejemplo-negocio.com/',
  signals: {
    title: 'Refaccionaria El Tornillo',
    h1: ['Refaccionaria El Tornillo'],
    h2: ['Autopartes', 'Filtros y aceites', 'Contacto'],
    textSample: 'Vendemos autopartes, filtros de aceite, baterías y accesorios para auto en Monterrey. Lunes a sábado 9am-7pm. Tel 81-1234-5678.',
  },
  score: 60, report: {}, summary: '', model: null, created_at: '',
} as unknown as EmbedAudit

async function main() {
  const apiKey = process.env.GEMINI_API_KEY!
  const r1 = await runWebchat({ apiKey, site, audit, history: [], message: '¿Venden filtros de aceite?' })
  console.log('[Victoria sabe]:', r1)
  const r2 = await runWebchat({ apiKey, site, audit, history: [], message: '¿Cuánto cuesta una batería Bosch?' })
  console.log('[Victoria NO inventa]:', r2)
}
main().catch((e) => { console.error(e); process.exit(1) })
