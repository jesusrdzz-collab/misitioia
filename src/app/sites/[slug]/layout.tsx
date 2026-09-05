import { Playfair_Display, Inter } from 'next/font/google'
import { getSiteAnalyticsBySlug } from '@/features/analytics/queries'
import { AnalyticsScripts } from '@/features/analytics/components/AnalyticsScripts'
import { CookieConsentBanner } from '@/features/analytics/components/CookieConsentBanner'
import { siteBasePath } from '@/features/sites/base-path'

/**
 * Layout de los sitios generados: carga la tipografía premium (display serif
 * + cuerpo sans) y la expone como variables CSS. Aplica al sitio y a sus
 * páginas legales, para branding consistente.
 *
 * Inyecta Meta Pixel + GA4 (Fase A) si:
 *   1) el plan del tenant NO es 'free', Y
 *   2) el dueño configuró al menos un ID en el panel /editar/analiticas.
 * Los scripts respetan el consentimiento de cookies (por defecto denegado)
 * y se disparan cuando el visitante acepta el banner de abajo.
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

interface Props {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

export default async function SiteLayout({ children, params }: Props) {
  const { slug } = await params

  const analytics = await getSiteAnalyticsBySlug(slug)
  const canTrack =
    !!analytics &&
    analytics.plan !== 'free' &&
    (!!analytics.metaPixelId || !!analytics.gaMeasurementId)

  const base = await siteBasePath(slug)
  const cookiesPath = `${base}/cookies`

  return (
    <div
      className={`${display.variable} ${body.variable}`}
      style={{ fontFamily: 'var(--font-body), ui-sans-serif, system-ui, sans-serif' }}
    >
      {children}
      {canTrack && analytics && (
        <>
          <AnalyticsScripts
            metaPixelId={analytics.metaPixelId}
            gaMeasurementId={analytics.gaMeasurementId}
          />
          <CookieConsentBanner cookiesPath={cookiesPath} enabled={true} />
        </>
      )}
    </div>
  )
}
