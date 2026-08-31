import { Playfair_Display, Inter } from 'next/font/google'

/**
 * Layout de los sitios generados: carga la tipografía premium (display serif
 * + cuerpo sans) y la expone como variables CSS. Aplica al sitio y a sus
 * páginas legales, para branding consistente.
 */
const display = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['500', '600', '700', '800'],
})

const body = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${display.variable} ${body.variable}`}
      style={{ fontFamily: 'var(--font-body), ui-sans-serif, system-ui, sans-serif' }}
    >
      {children}
    </div>
  )
}
