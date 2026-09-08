#!/usr/bin/env node
/**
 * Validación: cuando giro='otros' y giro_libre='clínica de acupuntura',
 * los prompts SMART generan imágenes de acupuntura (NO storefront artesanal).
 * Genera SOLO el hero para verificar (ahorra costo).
 */

import { writeFileSync, readFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, 'test_otros_after')
mkdirSync(OUT_DIR, { recursive: true })

let GEMINI_API_KEY = ''
for (const line of readFileSync('C:/Users/HP/PROYECTOS/ADGENESIS/.env.local', 'utf-8').split(/\r?\n/)) {
  const m = line.match(/^GEMINI_API_KEY=(.+)$/)
  if (m) GEMINI_API_KEY = m[1].replace(/^["']|["']$/g, '')
}

// Replicamos exactamente lo que produce image-prompts.ts::smartFallback
// con giro_libre='clínica de acupuntura' + descripcion='Tratamos dolor lumbar...'
const BASE_PRO =
  'professional editorial photography, warm neutral palette (beige/cream/soft blue), ' +
  'clean modern office feel, natural window light, magazine quality, ' +
  '4k detail, shallow depth of field, latin american mexican professional context.'
const NOTXT =
  'absolutely no text, no letters, no words, no numbers, no watermarks, ' +
  'no logos, no captions, no signs — the image must be completely free of any writing.'

const giro_libre = 'clínica de acupuntura'
const descripcion = 'Tratamos dolor lumbar, migrañas y estrés con acupuntura tradicional china.'

const heroPrompt = `Professional editorial photograph relevant to a mexican ${giro_libre}. The business: "${descripcion}". Clean modern real-world scene (interior, workspace or setting typical of this line of work), warm neutral palette of beige, cream and soft blue, natural window light, empty of foreground people, magazine editorial quality, 16:9 composition. ${BASE_PRO} ${NOTXT}`

console.log('PROMPT:', heroPrompt.slice(0, 200) + '...')

const res = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${GEMINI_API_KEY}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: heroPrompt }] }],
      generationConfig: {
        responseModalities: ['IMAGE'],
        imageConfig: { aspectRatio: '16:9' },
      },
    }),
  }
)
const data = await res.json()
const b64 = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData)?.inlineData?.data
if (!b64) {
  console.error('Sin imagen. finishReason=', data.candidates?.[0]?.finishReason)
  process.exit(1)
}
const bytes = Buffer.from(b64, 'base64')
const path = join(OUT_DIR, 'acupuntura_hero.png')
writeFileSync(path, bytes)
console.log(`OK ${bytes.length} bytes → ${path}`)
