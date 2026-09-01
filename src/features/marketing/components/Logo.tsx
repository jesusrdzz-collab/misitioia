/**
 * Logo oficial de MiSitio IA — hexágono de circuitos "MS" + wordmark.
 * Reemplaza el logomark SVG naranja anterior. Assets con fondo transparente
 * en /public (generados desde el arte original).
 *
 *  - LogoMark    → solo el hexágono/mark (nav, íconos, favicon). Casi cuadrado.
 *  - LogoLockup  → lockup completo mark + "MI SITIO" + tagline (login, hero).
 */
export function LogoMark({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-mi-sitio-mark.png"
      alt="MiSitio IA"
      className={`${className} object-contain`}
    />
  )
}

export function LogoLockup({ className = 'h-24 w-auto' }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-mi-sitio.png"
      alt="MiSitio IA — Generación web inteligente"
      className={`${className} object-contain`}
    />
  )
}
