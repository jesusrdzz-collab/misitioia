import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getSiteBySlug, getCanonicalSlugForLegacy } from '@/lib/sites/queries'
import { toBusinessView } from '@/features/sites/business'
import { siteBasePath } from '@/features/sites/base-path'
import { templateForGiro } from '@/features/generator/templates'
import { buildLocalBusinessJsonLd } from '@/features/aeo/structured-data'
import { VictoriaWidget } from '@/features/sites/components/VictoriaWidget'
import { tenantHasVictoria } from '@/features/sites/victoria-gate'
import { telHref, waHref, mapEmbedHref, mapLinkHref } from '@/features/sites/contact'
import { resolveTemplate } from '@/features/templates/registry'

interface SitePageProps {
  params: Promise<{ slug: string }>
}

// ISR: la página se regenera de forma estática, no por visita (negocio de volumen).
export const revalidate = 3600

export async function generateMetadata({ params }: SitePageProps): Promise<Metadata> {
  const { slug } = await params
  const data = await getSiteBySlug(slug)

  if (!data) {
    return { title: 'Sitio no encontrado — MiSitio IA', robots: { index: false, follow: false } }
  }

  const { site, content } = data
  const b = toBusinessView(data)
  // Gating AEO: sitio 'generado' (sin reclamar) → noindex,nofollow. Al reclamar
  // (reclamado/activo) → index,follow + flags de snippet para buscadores/IA.
  const claimed = b.indexable

  return {
    title: content?.meta_title || `${site.business_name} — ${b.giroNombre}`,
    description: content?.meta_description || undefined,
    alternates: { canonical: b.url },
    robots: claimed
      ? {
          index: true,
          follow: true,
          'max-snippet': -1,
          'max-image-preview': 'large',
          'max-video-preview': -1,
          googleBot: {
            index: true,
            follow: true,
            'max-snippet': -1,
            'max-image-preview': 'large',
            'max-video-preview': -1,
          },
        }
      : { index: false, follow: false },
    openGraph: {
      title: content?.meta_title || site.business_name,
      description: content?.meta_description || undefined,
      url: b.url,
      siteName: site.business_name,
      locale: 'es_MX',
      type: 'website',
    },
  }
}

/**
 * Página pública del sitio del cliente.
 *
 * Sprint 6-sep-2026: esta página delega en la plantilla que resuelve
 * `sites.template`. Todas las plantillas comparten los mismos props
 * (`TemplateRenderProps`), así que cambiar de plantilla nunca pierde datos.
 */
export default async function SitePage({ params }: SitePageProps) {
  const { slug } = await params
  const data = await getSiteBySlug(slug)
  if (!data) {
    // Compat legacy: si el slug con guiones es un `previous_slug`, 301 al
    // slug canónico concatenado (política del 6-sep-2026).
    if (slug.includes('-')) {
      const canonical = await getCanonicalSlugForLegacy(slug)
      if (canonical) redirect(`/sites/${canonical}`)
    }
    notFound()
  }

  const { site, content } = data
  const business = toBusinessView(data)
  const base = await siteBasePath(slug)
  const preset = templateForGiro(site.giro)
  const emoji = content?.emoji || preset.emoji

  const wa = waHref(business.whatsapp || business.phone)
  const tel = telHref(business.phone)
  const mapEmbed = mapEmbedHref(business.address)
  const mapLink = mapLinkHref(business.address)

  const jsonLd = buildLocalBusinessJsonLd(data)

  // Widget de Victoria: sólo en sitios reclamados/activos Y con token de
  // Konnex aprovisionado. El token nunca llega al cliente.
  const victoriaEnabled = business.indexable && (await tenantHasVictoria(site.tenant_id))

  const template = resolveTemplate(site.template)
  const TemplateComponent = template.Component

  return (
    <>
      <script
        type="application/ld+json"
        // JSON-LD de negocio real; datos verificados del lead.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TemplateComponent
        data={data}
        business={business}
        emoji={emoji}
        base={base}
        wa={wa}
        tel={tel}
        mapEmbed={mapEmbed}
        mapLink={mapLink}
        extras={victoriaEnabled ? <VictoriaWidget slug={site.slug} primaryColor={business.primaryColor} /> : null}
      />
    </>
  )
}
