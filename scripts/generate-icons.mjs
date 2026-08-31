/**
 * Genera los iconos PWA + favicon del producto MiSitio IA a partir de un SVG
 * de marca (ventana de sitio + burbuja de chat = "página que contesta").
 *
 * Uso: node scripts/generate-icons.mjs
 */
import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PUBLIC = join(__dirname, '..', 'public')

// SVG 512x512. Fondo naranja cálido, ventana de navegador blanca con burbuja de chat.
function svg(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f97316"/>
      <stop offset="1" stop-color="#ea580c"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#bg)"/>
  <!-- ventana de sitio -->
  <rect x="104" y="120" width="304" height="230" rx="28" fill="#ffffff"/>
  <rect x="104" y="120" width="304" height="56" rx="28" fill="#fde7d3"/>
  <rect x="104" y="150" width="304" height="26" fill="#fde7d3"/>
  <circle cx="140" cy="148" r="9" fill="#ea580c"/>
  <circle cx="170" cy="148" r="9" fill="#fbbf24"/>
  <circle cx="200" cy="148" r="9" fill="#f59e0b"/>
  <rect x="140" y="206" width="150" height="20" rx="10" fill="#fed7aa"/>
  <rect x="140" y="244" width="230" height="14" rx="7" fill="#f1e9e0"/>
  <rect x="140" y="272" width="200" height="14" rx="7" fill="#f1e9e0"/>
  <!-- burbuja de chat (el asistente) -->
  <g>
    <circle cx="356" cy="352" r="76" fill="#0c0a09"/>
    <circle cx="356" cy="352" r="76" fill="none" stroke="#ffffff" stroke-width="8" opacity="0.15"/>
    <circle cx="330" cy="352" r="11" fill="#ffffff"/>
    <circle cx="356" cy="352" r="11" fill="#ffffff"/>
    <circle cx="382" cy="352" r="11" fill="#ffffff"/>
  </g>
</svg>`
}

async function main() {
  const master = Buffer.from(svg(512))

  const targets = [
    { name: 'icon-512.png', size: 512 },
    { name: 'icon-192.png', size: 192 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'favicon.png', size: 48 },
  ]

  for (const t of targets) {
    await sharp(master).resize(t.size, t.size).png().toFile(join(PUBLIC, t.name))
    console.log(`✓ ${t.name}`)
  }

  // og-image de respaldo (si se prefiere sobre la generada por IA no se usa; dejamos la de IA).
  console.log('Iconos listos.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
