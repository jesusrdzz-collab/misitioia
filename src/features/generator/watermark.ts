/**
 * Watermark "misitio.site" para todas las imágenes generadas con IA
 * (Sprint nocturno 7-sep-2026).
 *
 * Jesús pidió textual: "asegurate de darle atribuciones a mi sitio" — cada
 * creativo generado por MiSitio lleva marca discreta de la plataforma en la
 * esquina inferior derecha. Es firma, no logo dominante: se ve pero no
 * ensucia el diseño del cliente.
 *
 * Reglas del sello:
 *  - Texto: "misitio.site" (minúsculas, hostname puro)
 *  - Fuente: system-ui bold (Sharp/librsvg elige la fuente disponible;
 *    en Vercel Linux usa DejaVu Sans Bold). Tamaño ~2.4% del alto (mín 14 px)
 *  - Color: blanco con opacidad 0.55
 *  - Padding desde la esquina inferior derecha: 3% del lado corto (mín 20 px)
 *  - Sombra ligera detrás para que se lea sobre imágenes claras
 *
 * Falla suave: si Sharp truena por algún motivo, devolvemos los bytes
 * originales sin marca. Nunca dejamos que el watermark tumbe el pipeline.
 */

import sharp from 'sharp'

/** Composita "misitio.site" en la esquina inferior derecha de un PNG. */
export async function applyMisitioWatermark(input: Uint8Array): Promise<Uint8Array> {
  try {
    const img = sharp(Buffer.from(input))
    const meta = await img.metadata()
    const width = meta.width ?? 0
    const height = meta.height ?? 0
    if (!width || !height) return input

    // Tamaño del sello relativo al alto de la imagen — mínimo 14 px, máximo 26 px
    const fontSize = Math.max(14, Math.min(26, Math.round(height * 0.024)))
    const paddingBase = Math.min(width, height)
    const padding = Math.max(20, Math.round(paddingBase * 0.03))

    const svg = buildWatermarkSvg(width, height, fontSize, padding)
    const overlay = Buffer.from(svg)

    const out = await img
      .composite([{ input: overlay, top: 0, left: 0 }])
      .png({ compressionLevel: 9 })
      .toBuffer()

    return new Uint8Array(out)
  } catch (e) {
    console.warn('[watermark] Sharp falló, devuelvo imagen sin marca:', (e as Error).message)
    return input
  }
}

/**
 * SVG del tamaño exacto de la imagen con el texto en la esquina inferior
 * derecha. Un <filter> difumina una copia oscura del texto para que se lea
 * sobre fondos claros u oscuros por igual.
 */
function buildWatermarkSvg(
  width: number,
  height: number,
  fontSize: number,
  padding: number,
): string {
  const x = width - padding
  const y = height - padding
  const text = 'misitio.site'
  // Fuentes en orden: preferimos Inter/Helvetica/Arial (comunes en macOS y CDNs)
  // y caemos en DejaVu Sans (default en Linux/Vercel) y sans-serif.
  const fontStack =
    "'Inter','Helvetica Neue','Arial','DejaVu Sans','Liberation Sans',sans-serif"

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <filter id="mishadow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="0.9" />
    </filter>
  </defs>
  <g style="font-family: ${fontStack}; font-weight: 700; font-size: ${fontSize}px; letter-spacing: 0.02em;">
    <text x="${x}" y="${y}" fill="rgba(0,0,0,0.45)" text-anchor="end" filter="url(#mishadow)">${text}</text>
    <text x="${x}" y="${y}" fill="rgba(255,255,255,0.85)" text-anchor="end">${text}</text>
  </g>
</svg>`
}
