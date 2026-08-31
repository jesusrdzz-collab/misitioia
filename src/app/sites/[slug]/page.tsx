import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getSiteBySlug } from '@/lib/sites/queries'
import { toBusinessView } from '@/features/sites/business'
import { siteBasePath } from '@/features/sites/base-path'
import { templateForGiro } from '@/features/generator/templates'
import { buildLocalBusinessJsonLd } from '@/features/aeo/structured-data'
import { SiteFooter } from '@/features/sites/components/SiteFooter'
import { telHref, waHref, mapEmbedHref, mapLinkHref } from '@/features/sites/contact'

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

function Stars({ rating, color }: { rating: number; color: string }) {
  const rounded = Math.round(rating)
  return (
    <span className="inline-flex" aria-label={`${rating} de 5 estrellas`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="18" height="18" viewBox="0 0 20 20" aria-hidden>
          <path
            d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.79L10 14.77l-5.2 2.73.99-5.79L1.58 7.62l5.82-.85L10 1.5z"
            fill={i < rounded ? color : 'rgba(0,0,0,0.12)'}
          />
        </svg>
      ))}
    </span>
  )
}

export default async function SitePage({ params }: SitePageProps) {
  const { slug } = await params
  const data = await getSiteBySlug(slug)
  if (!data) notFound()

  const { site, content, products } = data
  const b = toBusinessView(data)
  const base = await siteBasePath(slug)
  const template = templateForGiro(site.giro)
  const emoji = content?.emoji || template.emoji
  const logoUrl = content?.logo_url || null
  const heroImage = content?.hero_image_url || null

  const primary = b.primaryColor
  const accent = b.accentColor
  const services = content?.services ?? []
  const highlights = content?.highlights ?? []
  const hours = content?.working_hours ?? null
  const wa = waHref(b.whatsapp || b.phone)
  const tel = telHref(b.phone)
  const mapEmbed = mapEmbedHref(b.address)
  const mapLink = mapLinkHref(b.address)

  const jsonLd = buildLocalBusinessJsonLd(data)

  const display = { fontFamily: 'var(--font-display), Georgia, serif' } as const

  return (
    <>
      <script
        type="application/ld+json"
        // JSON-LD de negocio real; datos verificados del lead.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main
        className="min-h-screen bg-white text-gray-800"
        style={{ fontFamily: 'var(--font-body), ui-sans-serif, system-ui, sans-serif' }}
      >
        {/* Barra superior */}
        <div className="sticky top-0 z-30 backdrop-blur bg-white/80 border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 min-w-0">
              {logoUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={logoUrl} alt={`Logo de ${site.business_name}`} className="h-9 w-9 rounded-lg object-cover shrink-0" />
              ) : (
                <span className="text-xl shrink-0" aria-hidden>{emoji}</span>
              )}
              <span className="font-semibold text-gray-900 truncate" style={display}>
                {site.business_name}
              </span>
            </div>
            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-2 text-sm font-medium text-white px-4 py-2 rounded-full shadow-sm hover:opacity-90 transition-opacity"
                style={{ background: accent }}
              >
                <span aria-hidden>💬</span>
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
            )}
          </div>
        </div>

        {/* Hero */}
        <header
          className="relative overflow-hidden text-white"
          style={{ background: `linear-gradient(140deg, ${primary} 0%, ${accent} 100%)` }}
        >
          {heroImage && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={heroImage}
                alt=""
                aria-hidden
                className="absolute inset-0 w-full h-full object-cover opacity-35"
              />
              <div
                className="absolute inset-0"
                style={{ background: `linear-gradient(140deg, ${primary}cc 0%, ${accent}cc 100%)` }}
                aria-hidden
              />
            </>
          )}
          <div
            className="absolute -top-24 -right-16 w-80 h-80 rounded-full blur-3xl opacity-30"
            style={{ background: 'white' }}
            aria-hidden
          />
          <div
            className="absolute -bottom-32 -left-10 w-72 h-72 rounded-full blur-3xl opacity-20"
            style={{ background: 'white' }}
            aria-hidden
          />
          <div className="relative max-w-4xl mx-auto px-5 py-20 md:py-28 text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 border border-white/20 rounded-full text-sm mb-6">
              <span aria-hidden>{emoji}</span>
              <span className="capitalize">{b.giroNombre}</span>
              {b.location && <span className="opacity-80">· {b.location}</span>}
            </span>

            <h1
              className="text-4xl md:text-6xl font-bold leading-[1.1] mb-5 text-balance"
              style={display}
            >
              {content?.hero_title || site.business_name}
            </h1>

            {content?.hero_subtitle && (
              <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-8 leading-relaxed">
                {content.hero_subtitle}
              </p>
            )}

            {b.rating != null && (
              <div className="inline-flex items-center gap-2 mb-9 text-white/95">
                <Stars rating={b.rating} color="#ffd54a" />
                <span className="font-semibold">{b.rating}</span>
                {b.reviewsCount != null && (
                  <span className="text-white/75 text-sm">· {b.reviewsCount} reseñas en Google</span>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {wa && (
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto bg-white px-8 py-3.5 rounded-xl font-semibold shadow-xl shadow-black/10 hover:-translate-y-0.5 transition-transform"
                  style={{ color: accent }}
                >
                  💬 Escríbenos por WhatsApp
                </a>
              )}
              {tel && (
                <a
                  href={tel}
                  className="w-full sm:w-auto border border-white/40 px-8 py-3.5 rounded-xl font-medium hover:bg-white/10 transition-colors"
                >
                  📞 Llamar ahora
                </a>
              )}
            </div>
          </div>

          <svg className="relative block w-full h-8 md:h-12" viewBox="0 0 1440 48" preserveAspectRatio="none" aria-hidden>
            <path d="M0 48h1440V0c-240 32-480 48-720 48S240 32 0 0v48z" fill="white" />
          </svg>
        </header>

        {/* Highlights */}
        {highlights.length > 0 && (
          <section className="max-w-5xl mx-auto px-5 -mt-6 md:-mt-10 relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {highlights.map((h, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-100/60 p-5 text-center"
                >
                  <div className="text-2xl mb-2" aria-hidden>✓</div>
                  <p className="text-sm text-gray-700 leading-snug">{h}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Sobre nosotros */}
        {content?.about_text && (
          <section className="max-w-5xl mx-auto px-5 py-16 md:py-24">
            <div className="grid md:grid-cols-5 gap-10 items-center">
              <div className="md:col-span-3">
                <span
                  className="text-xs uppercase tracking-[0.2em] font-semibold"
                  style={{ color: accent }}
                >
                  {template.aboutLabel}
                </span>
                <h2 className="mt-3 text-3xl md:text-4xl font-bold text-gray-900 leading-tight" style={display}>
                  Conócenos
                </h2>
                <p className="mt-5 text-gray-600 text-lg leading-relaxed">{content.about_text}</p>
              </div>
              {b.rating != null && (
                <div className="md:col-span-2">
                  <div
                    className="rounded-3xl p-8 text-center text-white shadow-xl"
                    style={{ background: `linear-gradient(140deg, ${primary}, ${accent})` }}
                  >
                    <div className="text-6xl font-bold" style={display}>{b.rating}</div>
                    <div className="mt-2 flex justify-center">
                      <Stars rating={b.rating} color="#ffd54a" />
                    </div>
                    {b.reviewsCount != null && (
                      <p className="mt-3 text-white/85 text-sm">
                        Basado en {b.reviewsCount} reseñas de Google
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Servicios */}
        {services.length > 0 && (
          <section className="bg-gray-50 py-16 md:py-24 border-y border-gray-100">
            <div className="max-w-5xl mx-auto px-5">
              <div className="text-center max-w-2xl mx-auto mb-14">
                <span className="text-xs uppercase tracking-[0.2em] font-semibold" style={{ color: accent }}>
                  {template.servicesLabel}
                </span>
                <h2 className="mt-3 text-3xl md:text-4xl font-bold text-gray-900" style={display}>
                  Lo que hacemos por ti
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((s, i) => (
                  <div
                    key={i}
                    className="group relative bg-white rounded-2xl border border-gray-100 p-7 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden"
                  >
                    <div className="absolute inset-x-0 top-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: accent }} />
                    <div className="text-3xl mb-4" aria-hidden>{s.icon || emoji}</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1.5" style={display}>{s.name}</h3>
                    {s.description && <p className="text-gray-500 text-sm leading-relaxed">{s.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Catálogo */}
        {products.length > 0 && (
          <section className="py-16 md:py-24">
            <div className="max-w-5xl mx-auto px-5">
              <div className="text-center mb-14">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900" style={display}>Catálogo</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p) => (
                  <div key={p.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                    {p.image_url && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={p.image_url} alt={p.name} className="w-full h-44 object-cover" />
                    )}
                    <div className="p-5">
                      <h3 className="font-semibold text-gray-900" style={display}>{p.name}</h3>
                      {p.description && <p className="text-gray-500 text-sm mt-1">{p.description}</p>}
                      {p.price != null && (
                        <p className="mt-3 font-bold text-lg" style={{ color: accent }}>
                          ${p.price.toLocaleString('es-MX')} {p.currency}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Contacto + horarios + mapa */}
        <section className="bg-gray-50 py-16 md:py-24 border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-5">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs uppercase tracking-[0.2em] font-semibold" style={{ color: accent }}>
                Contacto
              </span>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold text-gray-900" style={display}>
                Visítanos o escríbenos
              </h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-10">
              <div className="space-y-8">
                <ul className="space-y-4 text-gray-700">
                  {b.address && (
                    <li className="flex items-start gap-3">
                      <span className="text-xl" aria-hidden>📍</span>
                      <span>{b.address}</span>
                    </li>
                  )}
                  {b.phone && (
                    <li className="flex items-center gap-3">
                      <span className="text-xl" aria-hidden>📞</span>
                      {tel ? <a href={tel} className="hover:underline">{b.phone}</a> : <span>{b.phone}</span>}
                    </li>
                  )}
                  {b.email && (
                    <li className="flex items-center gap-3">
                      <span className="text-xl" aria-hidden>✉️</span>
                      <a href={`mailto:${b.email}`} className="hover:underline">{b.email}</a>
                    </li>
                  )}
                  {(b.facebook || b.instagram) && (
                    <li className="flex items-center gap-4 pt-1">
                      {b.facebook && (
                        <a href={b.facebook} target="_blank" rel="noopener noreferrer" className="hover:underline">Facebook</a>
                      )}
                      {b.instagram && (
                        <a href={b.instagram} target="_blank" rel="noopener noreferrer" className="hover:underline">Instagram</a>
                      )}
                    </li>
                  )}
                </ul>

                {hours && Object.keys(hours).length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3" style={display}>Horario</h3>
                    <ul className="text-gray-700 rounded-2xl border border-gray-100 bg-white overflow-hidden">
                      {Object.entries(hours).map(([day, range]) => (
                        <li key={day} className="flex justify-between px-4 py-2.5 border-b border-gray-50 last:border-0 text-sm">
                          <span className="font-medium">{day}</span>
                          <span className="text-gray-500">{range}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  {wa && (
                    <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-xl font-medium shadow-sm hover:opacity-90 transition-opacity" style={{ background: accent }}>
                      💬 WhatsApp
                    </a>
                  )}
                  {mapLink && (
                    <a href={mapLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-white transition-colors">
                      🗺️ Cómo llegar
                    </a>
                  )}
                </div>
              </div>

              {mapEmbed && (
                <div className="rounded-3xl overflow-hidden border border-gray-100 shadow-lg min-h-[320px]">
                  <iframe
                    title={`Mapa de ${site.business_name}`}
                    src={mapEmbed}
                    className="w-full h-full min-h-[320px]"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* CTA final */}
        {wa && (
          <section className="py-16 md:py-20 text-center text-white" style={{ background: `linear-gradient(140deg, ${primary}, ${accent})` }}>
            <div className="max-w-2xl mx-auto px-5">
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={display}>
                {template.ctaLabel}
              </h2>
              <p className="text-white/85 mb-8 text-lg">Estamos listos para atenderte. Escríbenos y te respondemos pronto.</p>
              <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-block bg-white px-8 py-4 rounded-xl font-semibold shadow-xl hover:-translate-y-0.5 transition-transform" style={{ color: accent }}>
                💬 Escríbenos por WhatsApp
              </a>
            </div>
          </section>
        )}

        <SiteFooter businessName={site.business_name} slug={site.slug} base={base} accent={accent} />
      </main>
    </>
  )
}
