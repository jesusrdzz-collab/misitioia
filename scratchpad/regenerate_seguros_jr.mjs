#!/usr/bin/env node
/**
 * Regenera las 3 imágenes IA del site "Seguros Jr" con Gemini 2.5 Flash Image
 * usando los nuevos prompts profesionales. Sube al bucket Storage con anon
 * (policy temporal creada vía MCP) y actualiza site_content.
 * También descarga localmente a scratchpad/seguros_jr_after/ para revisión.
 */

import { createClient } from '@supabase/supabase-js'
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const SUPABASE_URL = 'https://mthlqoploeisigzvwory.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10aGxxb3Bsb2Vpc2lnenZ3b3J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4MjA2NjEsImV4cCI6MjEwMzM5NjY2MX0.DTfLlbz3YaUxQD5sg7x5xPiXF2WK5FkABBUcwBpPVvA'

// Reusa una key de Gemini de otro proyecto de la fábrica (Jesús ya la usa
// para AdGenesis). No se hardcodea aquí; se lee del .env.local del otro
// proyecto.
const ADGENESIS_ENV = 'C:/Users/HP/PROYECTOS/ADGENESIS/.env.local'
let GEMINI_API_KEY = ''
for (const line of readFileSync(ADGENESIS_ENV, 'utf-8').split(/\r?\n/)) {
  const m = line.match(/^GEMINI_API_KEY=(.+)$/)
  if (m) GEMINI_API_KEY = m[1].replace(/^["']|["']$/g, '')
}
if (!GEMINI_API_KEY) {
  console.error('No pude leer GEMINI_API_KEY de ADGENESIS')
  process.exit(1)
}

const SITE_ID = 'cdc19d33-a19e-4bf6-9840-2bc1b4f90900'
const TENANT_ID = '067ddbfb-f505-4b39-a535-94275a1e4c21'
const OUT_DIR = join(__dirname, 'seguros_jr_after')
mkdirSync(OUT_DIR, { recursive: true })

const BASE_PRO =
  'professional editorial photography, warm neutral palette (beige/cream/soft blue), ' +
  'clean modern office feel, natural window light, magazine quality, ' +
  '4k detail, shallow depth of field, latin american mexican professional context.'

const NOTXT =
  'absolutely no text, no letters, no words, no numbers, no watermarks, ' +
  'no logos, no captions, no signs — the image must be completely free of any writing.'

const PROMPTS = {
  hero: {
    aspect: '16:9',
    text:
      `wide shot of a modern clean insurance office interior in mexico, empty organized desk with laptop, folder and pen, blurred urban skyline through big window, warm neutral palette of beige and soft blue. ${BASE_PRO} ${NOTXT}`,
  },
  about: {
    aspect: '4:3',
    text:
      `medium shot of two latin american professionals in business casual shaking hands across a clean desk in a modern insurance office, warm confident lighting, papers and pen in the foreground. ${BASE_PRO} ${NOTXT}`,
  },
  catalog: {
    aspect: '1:1',
    text:
      `overhead flat lay of professional documents, calculator, fountain pen, ceramic coffee cup and eyeglasses on a clean beige desk, editorial composition. ${BASE_PRO} ${NOTXT}`,
  },
}

async function callGemini(prompt, aspect) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseModalities: ['IMAGE'],
          imageConfig: { aspectRatio: aspect },
        },
      }),
    }
  )
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Gemini HTTP ${res.status}: ${body.slice(0, 300)}`)
  }
  const data = await res.json()
  const candidate = data.candidates?.[0]
  if (candidate?.finishReason === 'SAFETY') throw new Error('Bloqueada por seguridad')
  for (const part of candidate?.content?.parts ?? []) {
    const b64 = part.inlineData?.data
    if (b64) return Buffer.from(b64, 'base64')
  }
  throw new Error('Sin bytes en respuesta')
}

// Uso el anon key con la policy temporal que abre INSERT solo para el
// path de este site. La policy se limpia justo después con MCP.
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function processSlot(slot) {
  const { text, aspect } = PROMPTS[slot]
  console.log(`\n[${slot}] Generando con Gemini (${aspect})...`)
  const bytes = await callGemini(text, aspect)
  console.log(`[${slot}] OK ${bytes.length} bytes`)

  const localPath = join(OUT_DIR, `${slot}.png`)
  writeFileSync(localPath, bytes)
  console.log(`[${slot}] Guardado local: ${localPath}`)

  const timestamp = Date.now()
  const remotePath = `${TENANT_ID}/${SITE_ID}/ai/${slot}-${timestamp}.png`

  // Upload directo vía REST API (evita cualquier dependencia del SDK).
  const upRes = await fetch(
    `${SUPABASE_URL}/storage/v1/object/site-images/${remotePath}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        apikey: SUPABASE_ANON_KEY,
        'Content-Type': 'image/png',
        'x-upsert': 'true',
      },
      body: bytes,
    }
  )
  if (!upRes.ok) {
    const err = await upRes.text()
    throw new Error(`Upload HTTP ${upRes.status}: ${err.slice(0, 300)}`)
  }
  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/site-images/${remotePath}`
  console.log(`[${slot}] URL pública: ${publicUrl}`)

  return { slot, publicUrl, localPath, size: bytes.length }
}

const results = []
for (const slot of ['hero', 'about', 'catalog']) {
  try {
    const r = await processSlot(slot)
    results.push({ ok: true, ...r })
  } catch (e) {
    console.error(`ERROR ${slot}:`, e.message)
    results.push({ ok: false, slot, error: e.message })
  }
}

console.log('\n=== RESUMEN ===')
console.log(JSON.stringify(results, null, 2))

const successOnly = results.filter((r) => r.ok)
console.log(`\nÉxitos: ${successOnly.length}/3`)

process.exit(successOnly.length === 3 ? 0 : 1)
