/**
 * Logomark de MiSitio IA — SVG vectorial nítido (reemplaza el emoji 🌐).
 *
 * Concepto: una burbuja de chat (tu sitio que conversa y vende) con una chispa
 * de IA dentro, sobre un squircle en la paleta cálida de la marca (orange-600).
 * Escala perfecto de favicon 16px a app-icon 512px.
 */
export function LogoMark({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="MiSitio IA"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="misitio-logo-g" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fb923c" />
          <stop offset="1" stopColor="#ea580c" />
        </linearGradient>
      </defs>
      {/* Squircle de fondo */}
      <rect width="64" height="64" rx="15" fill="url(#misitio-logo-g)" />
      {/* Burbuja de chat (cuerpo + cola, blanco) */}
      <rect x="14" y="15" width="36" height="25" rx="8" fill="#fff" />
      <path d="M24 35 L24 49 L34 37 Z" fill="#fff" />
      {/* Chispa de IA */}
      <path
        d="M32 18 C33 24 34 25 41 27 C34 29 33 30 32 36 C31 30 30 29 23 27 C30 25 31 24 32 18 Z"
        fill="#ea580c"
      />
    </svg>
  )
}
