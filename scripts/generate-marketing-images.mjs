/**
 * Genera el set de imágenes de marketing del PRODUCTO MiSitio IA con Replicate (Flux).
 *
 * Uso:  REPLICATE_API_TOKEN=xxxx node scripts/generate-marketing-images.mjs
 *
 * Guarda .webp optimizados en public/img/. No hardcodea el token (lo lee de env).
 */
import { writeFile, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', 'public', 'img')

const TOKEN = process.env.REPLICATE_API_TOKEN
if (!TOKEN) {
  console.error('Falta REPLICATE_API_TOKEN en el entorno.')
  process.exit(1)
}

const MODEL = 'black-forest-labs/flux-dev'

/** @type {{name:string, prompt:string, aspect:string}[]} */
const JOBS = [
  {
    name: 'hero',
    aspect: '16:9',
    prompt:
      'Cinematic warm photograph of a happy Mexican small business owner, a woman in her 40s in a cozy neighborhood shop (a bright taqueria / abarrotes), smiling while holding a modern smartphone that clearly shows a sleek professional website of her own business on screen. Soft golden morning light, shallow depth of field, warm terracotta and cream tones, authentic and aspirational, editorial commercial photography, high detail, no text overlays.',
  },
  {
    name: 'og-image',
    aspect: '16:9',
    prompt:
      'Elegant modern abstract background for a tech brand, warm gradient of terracotta orange, amber and deep indigo, soft flowing shapes and subtle grid, a stylized floating smartphone showing a clean website interface in the center, premium minimal, lots of clean negative space, no text, product marketing key visual.',
  },
  {
    name: 'feature-victoria',
    aspect: '4:3',
    prompt:
      'Warm modern illustration-photo hybrid of a smartphone floating with a friendly chat conversation interface glowing, representing a 24/7 AI sales assistant answering a customer, soft amber and indigo lighting, cozy premium feel, abstract soft bokeh background, no readable text, elegant and trustworthy.',
  },
  {
    name: 'feature-generate',
    aspect: '4:3',
    prompt:
      'A clean mockup of a beautiful modern small-business website displayed on a smartphone standing on a wooden cafe table, warm soft daylight, minimal elegant UI with a hero image and menu, Mexican small business aesthetic, shallow depth of field, premium product photography, no readable text.',
  },
  {
    name: 'showcase-devices',
    aspect: '16:9',
    prompt:
      'Three elegant smartphones floating at slight angles, each showing a different beautiful small-business website (a veterinary clinic, a hardware store, a beauty salon), clean modern UI, warm cream and terracotta studio background with soft shadows, premium tech marketing visual, crisp, no readable text.',
  },
  {
    name: 'comparativa-hero',
    aspect: '16:9',
    prompt:
      'Abstract conceptual visual of comparison and choice, two elegant paths merging, warm amber versus cool grey, a glowing checkmark, minimal premium editorial style, soft gradients, clean negative space, no text, sophisticated brand key visual.',
  },
]

async function generate(job) {
  const res = await fetch(`https://api.replicate.com/v1/models/${MODEL}/predictions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      Prefer: 'wait',
    },
    body: JSON.stringify({
      input: {
        prompt: job.prompt,
        aspect_ratio: job.aspect,
        output_format: 'webp',
        output_quality: 82,
        num_outputs: 1,
        go_fast: true,
      },
    }),
  })

  if (!res.ok) {
    const t = await res.text()
    throw new Error(`Replicate ${res.status}: ${t}`)
  }

  let pred = await res.json()

  // Si aún no terminó (Prefer:wait puede expirar), hacer polling.
  while (pred.status !== 'succeeded' && pred.status !== 'failed' && pred.status !== 'canceled') {
    await new Promise((r) => setTimeout(r, 2000))
    const poll = await fetch(pred.urls.get, { headers: { Authorization: `Bearer ${TOKEN}` } })
    pred = await poll.json()
  }

  if (pred.status !== 'succeeded') {
    throw new Error(`Predicción ${job.name} falló: ${pred.status} ${JSON.stringify(pred.error)}`)
  }

  const url = Array.isArray(pred.output) ? pred.output[0] : pred.output
  const img = await fetch(url)
  const buf = Buffer.from(await img.arrayBuffer())
  const dest = join(OUT_DIR, `${job.name}.webp`)
  await writeFile(dest, buf)
  console.log(`✓ ${job.name}.webp (${(buf.length / 1024).toFixed(0)} KB)`)
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  for (const job of JOBS) {
    try {
      console.log(`→ generando ${job.name} ...`)
      await generate(job)
    } catch (e) {
      console.error(`✗ ${job.name}:`, e.message)
    }
  }
  console.log('Listo.')
}

main()
