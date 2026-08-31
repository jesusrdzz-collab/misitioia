import type { AppliedChange } from './types'
import {
  EDIT_TOOL_DECLARATIONS,
  CREATE_SITE_DECLARATION,
  executeTool,
  type ExecCtx,
} from './tools'

/**
 * Agente editor: bucle de tool-calling con Gemini.
 *
 * Reimplementa el patrón del generador (fetch directo a la REST de Gemini, sin
 * SDK extra) pero con function calling: interpreta el mensaje del dueño y ejecuta
 * herramientas que editan el contenido estructurado en Supabase.
 */

const GEMINI_MODEL = 'gemini-2.5-flash'
const ENDPOINT = (key: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`

const MAX_STEPS = 6

interface Part {
  text?: string
  functionCall?: { name: string; args?: Record<string, unknown> }
  functionResponse?: { name: string; response: Record<string, unknown> }
}
interface Content {
  role: string
  parts: Part[]
}

function systemPrompt(mode: 'edit' | 'create', snapshot: string): string {
  const reglas = `REGLAS INVIOLABLES:
- Hablas español mexicano, cálido, claro y breve. Nada de marketing barato.
- EDITAS/REDACTAS con lo que el dueño te dice; NO INVENTAS datos (servicios, precios, teléfonos, direcciones, horarios). Si te falta un dato para hacer un cambio, PREGÚNTALO en vez de inventarlo.
- Cuando el dueño pida un cambio concreto, usa la herramienta adecuada para aplicarlo. Puedes usar varias herramientas en un turno.
- Los colores van en hex (#rrggbb). Si el dueño describe un color por nombre, tradúcelo a un hex razonable.
- Si el dueño adjunta una imagen, su URL aparece en el mensaje. Úsala con setLogo, setHeroImage o addProduct según lo que pida.
- Después de aplicar cambios, confirma en una frase corta qué hiciste. No repitas todo el contenido del sitio.`

  if (mode === 'create') {
    return `Eres el asistente de MiSitio IA que crea el sitio web de un negocio conversando con su dueño.
Tu meta: reunir lo mínimo (nombre del negocio y giro) y llamar a createSite. Luego refina con las demás herramientas.
Si el dueño ya te dio nombre y giro, crea el sitio de inmediato; no pidas datos de más antes de crearlo. Después puedes preguntar por horario, servicios, contacto, etc.

${reglas}`
  }

  return `Eres el asistente de MiSitio IA que ayuda al dueño de un negocio a editar su página web por chat.

ESTADO ACTUAL DEL SITIO:
${snapshot}

${reglas}`
}

async function callGemini(
  apiKey: string,
  system: string,
  contents: Content[],
  declarations: readonly unknown[],
): Promise<Content | null> {
  const res = await fetch(ENDPOINT(apiKey), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: system }] },
      contents,
      tools: [{ functionDeclarations: declarations }],
      generationConfig: { temperature: 0.5, maxOutputTokens: 4096 },
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Gemini HTTP ${res.status}: ${body.slice(0, 300)}`)
  }

  const data = (await res.json()) as {
    candidates?: { content?: Content }[]
  }
  return data.candidates?.[0]?.content ?? null
}

export interface RunAgentArgs {
  apiKey: string
  mode: 'edit' | 'create'
  snapshot: string
  /** Historial previo (sin el mensaje nuevo). */
  history: Array<{ role: 'user' | 'assistant'; content: string }>
  /** Mensaje nuevo del usuario (ya incluye texto de imágenes adjuntas si las hay). */
  userMessage: string
  ctx: ExecCtx
}

export interface RunAgentResult {
  reply: string
  changes: AppliedChange[]
}

/**
 * Corre un turno completo del agente: puede encadenar varias herramientas.
 */
export async function runEditorAgent(args: RunAgentArgs): Promise<RunAgentResult> {
  const { apiKey, mode, snapshot, history, userMessage, ctx } = args
  if (!apiKey) throw new Error('GEMINI_API_KEY no configurada')

  const declarations =
    mode === 'create'
      ? [CREATE_SITE_DECLARATION, ...EDIT_TOOL_DECLARATIONS]
      : EDIT_TOOL_DECLARATIONS

  const system = systemPrompt(mode, snapshot)

  const contents: Content[] = history.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))
  contents.push({ role: 'user', parts: [{ text: userMessage }] })

  const changes: AppliedChange[] = []
  const textChunks: string[] = []

  for (let step = 0; step < MAX_STEPS; step++) {
    const modelContent = await callGemini(apiKey, system, contents, declarations)
    if (!modelContent) break

    const parts = modelContent.parts ?? []
    const calls = parts.filter((p): p is Part & { functionCall: NonNullable<Part['functionCall']> } => !!p.functionCall)
    for (const p of parts) if (p.text) textChunks.push(p.text)

    if (calls.length === 0) break // el modelo terminó con texto

    // Registrar el turno del modelo tal cual
    contents.push({ role: 'model', parts })

    // Ejecutar cada llamada y construir las respuestas
    const responseParts: Part[] = []
    for (const call of calls) {
      const { name, args: callArgs } = call.functionCall
      let outcome
      try {
        outcome = await executeTool(ctx, name, callArgs ?? {})
      } catch (e) {
        outcome = { ok: false, summary: `Error al aplicar ${name}: ${(e as Error).message}` }
      }
      if (outcome.ok) changes.push({ tool: name, summary: outcome.summary })
      responseParts.push({
        functionResponse: {
          name,
          response: { ok: outcome.ok, message: outcome.summary },
        },
      })
    }
    contents.push({ role: 'user', parts: responseParts })
  }

  let reply = textChunks.join('\n').trim()
  if (!reply) {
    reply = changes.length
      ? `Listo. ${changes.map((c) => c.summary).join(' ')}`
      : 'No pude aplicar el cambio. ¿Puedes darme más detalle?'
  }

  return { reply, changes }
}
