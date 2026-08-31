/**
 * Prueba del agente editor (Fase 4): chat → IA (Gemini tool-calling) → ejecución
 * de herramientas. Valida que Gemini interprete el mensaje del dueño y llame a
 * las herramientas correctas con args válidos (Zod), y que el executor las aplique.
 *
 * La capa de BD se simula con un cliente falso que registra las operaciones,
 * porque la service_role key no está provisionada localmente (ver WORK_PLAN).
 * El loop de IA + validación de args + mapeo de herramientas es real (Gemini real).
 *
 * Uso:  npx tsx scripts/test-editor-agent.ts
 */
import { readFileSync } from 'node:fs'
import { runEditorAgent } from '../src/features/editor/agent'
import type { ExecCtx } from '../src/features/editor/tools'

for (const line of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/)
  if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}

const apiKey = process.env.GEMINI_API_KEY!

// —— Cliente Supabase falso que registra operaciones ——
const ops: string[] = []
function fakeBuilder(table: string, action = 'select', payload?: unknown): unknown {
  const result = { data: { id: `mock-${table}-id` }, error: null }
  const handler: ProxyHandler<() => void> = {
    get(_t, prop) {
      if (prop === 'then') {
        // Hacerlo awaitable
        return (resolve: (v: unknown) => void) => resolve(result)
      }
      return (...args: unknown[]) => {
        if (prop === 'update' || prop === 'insert') {
          ops.push(`${table}.${String(prop)}(${JSON.stringify(args[0])})`)
          return fakeBuilder(table, String(prop), args[0])
        }
        return fakeBuilder(table, String(prop), payload)
      }
    },
  }
  return new Proxy(function () {}, handler)
}
const fakeAdmin = { from: (table: string) => fakeBuilder(table) } as unknown as ExecCtx['admin']

const snapshot = `Negocio: Refaccionaria SAM.
Giro: refaccionaria
Estado: generado
Título hero: Refaccionaria SAM
Colores: primario #b91c1c / acento #7f1d1d
Servicios (0): (ninguno)
Horario: (sin definir)
Productos: (ninguno)`

async function main() {
  const ctx: ExecCtx = {
    admin: fakeAdmin,
    ownerEmail: 'test@misitio.site',
    siteId: 'mock-site-id',
    tenantId: 'mock-tenant-id',
    slug: 'refaccionaria-sam',
    giro: 'refaccionaria',
    businessName: 'Refaccionaria SAM.',
  }

  const message =
    'Cambia el color primario a azul marino (#1e3a5f) y agrega dos servicios: ' +
    '"Venta de baterías" y "Cambio de aceite". También pon el horario de lunes a viernes de 9 a 18 y sábado de 9 a 14.'
  console.log('=== MENSAJE DUEÑO ===\n' + message + '\n')

  const result = await runEditorAgent({
    apiKey,
    mode: 'edit',
    snapshot,
    history: [],
    userMessage: message,
    ctx,
  })

  console.log('=== RESPUESTA IA ===\n' + result.reply + '\n')
  console.log('=== CAMBIOS APLICADOS ===')
  for (const c of result.changes) console.log(`  [${c.tool}] ${c.summary}`)
  console.log('\n=== OPERACIONES DE BD (simuladas) ===')
  for (const o of ops) console.log('  ' + o)
}

main().catch((e) => {
  console.error('ERROR:', e)
  process.exit(1)
})
