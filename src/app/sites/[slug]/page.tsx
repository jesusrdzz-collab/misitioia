import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getSiteBySlug } from '@/lib/sites/queries'

interface SitePageProps {
  params: Promise<{ slug: string }>
}

// ISR: la página se regenera de forma estática, no por visita (negocio de volumen).
export const revalidate = 3600

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'misitioia.com'

export async function generateMetadata({ params }: SitePageProps): Promise<Metadata> {
  const { slug } = await params
  const data = await getSiteBySlug(slug)

  if (!data) {
    return { title: 'Sitio no encontrado — MiSitio IA', robots: { index: false, follow: false } }
  }

  const { site, content } = data
  // noindex/nofollow hasta que el dueño reclame el sitio (Fase 2.7).
  const claimed = site.status === 'reclamado' || site.status === 'activo'

  return {
    title: content?.meta_title || `${site.business_name} — MiSitio IA`,
    description: content?.meta_description || undefined,
    robots: { index: claimed, follow: claimed },
  }
}

function telHref(phone: string | null): string | null {
  if (!phone) return null
  const digits = phone.replace(/[^\d+]/g, '')
  return digits ? `tel:${digits}` : null
}

function waHref(phone: string | null): string | null {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '')
  if (!digits) return null
  const withCc = digits.length === 10 ? `52${digits}` : digits
  return `https://wa.me/${withCc}`
}

export default async function SitePage({ params }: SitePageProps) {
  const { slug } = await params
  const data = await getSiteBySlug(slug)
  if (!data) notFound()

  const { site, content, products } = data
  const primary = content?.primary_color || '#2563eb'
  const accent = content?.accent_color || '#1e40af'
  const services = content?.services ?? []
  const highlights = content?.highlights ?? []
  const hours = content?.working_hours ?? null
  const phone = content?.contact_phone ?? null
  const whatsapp = content?.contact_whatsapp ?? null
  const wa = waHref(whatsapp || phone)
  const tel = telHref(phone)

  return (
    <main className="min-h-screen bg-white text-gray-800">
      {/* Hero */}
      <header
        className="relative text-white"
        style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
      >
        <div className="max-w-4xl mx-auto px-4 py-16 md:py-24 text-center">
          {content?.rating != null && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 rounded-full text-sm mb-5">
              <span>⭐ {content.rating}</span>
              {content.reviews_count != null && (
                <span className="opacity-90">· {content.reviews_count} reseñas en Google</span>
              )}
            </div>
          )}
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
            {content?.hero_title || site.business_name}
          </h1>
          {content?.hero_subtitle && (
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-8">
              {content.hero_subtitle}
            </p>
          )}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-white px-7 py-3 rounded-xl font-semibold shadow-lg"
                style={{ color: accent }}
              >
                Escríbenos por WhatsApp
              </a>
            )}
            {tel && (
              <a
                href={tel}
                className="w-full sm:w-auto border border-white/50 px-7 py-3 rounded-xl font-medium hover:bg-white/10 transition-colors"
              >
                Llamar ahora
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Highlights */}
      {highlights.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 -mt-8 md:-mt-10 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {highlights.map((h, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center text-sm text-gray-700"
              >
                {h}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Sobre nosotros */}
      {content?.about_text && (
        <section className="max-w-3xl mx-auto px-4 py-14 md:py-20 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-5" style={{ color: accent }}>
            Sobre nosotros
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">{content.about_text}</p>
        </section>
      )}

      {/* Servicios */}
      {services.length > 0 && (
        <section className="bg-gray-50 py-14 md:py-20">
          <div className="max-w-5xl mx-auto px-4">
            <h2
              className="text-2xl md:text-3xl font-bold text-center mb-12"
              style={{ color: accent }}
            >
              Nuestros servicios
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((s, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6">
                  <div className="text-3xl mb-3">{s.icon || '•'}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{s.name}</h3>
                  {s.description && <p className="text-gray-500 text-sm">{s.description}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Productos (catálogo, si hay) */}
      {products.length > 0 && (
        <section className="py-14 md:py-20">
          <div className="max-w-5xl mx-auto px-4">
            <h2
              className="text-2xl md:text-3xl font-bold text-center mb-12"
              style={{ color: accent }}
            >
              Catálogo
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  {p.image_url && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={p.image_url} alt={p.name} className="w-full h-44 object-cover" />
                  )}
                  <div className="p-5">
                    <h3 className="font-semibold text-gray-900">{p.name}</h3>
                    {p.description && <p className="text-gray-500 text-sm mt-1">{p.description}</p>}
                    {p.price != null && (
                      <p className="mt-2 font-bold" style={{ color: accent }}>
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

      {/* Contacto + horarios */}
      <section className="bg-gray-50 py-14 md:py-20">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-2xl font-bold mb-5" style={{ color: accent }}>
              Contáctanos
            </h2>
            <ul className="space-y-3 text-gray-700">
              {content?.contact_address && (
                <li className="flex items-start gap-3">
                  <span>📍</span>
                  <span>{content.contact_address}</span>
                </li>
              )}
              {phone && (
                <li className="flex items-center gap-3">
                  <span>📞</span>
                  {tel ? (
                    <a href={tel} className="hover:underline">{phone}</a>
                  ) : (
                    <span>{phone}</span>
                  )}
                </li>
              )}
              {content?.contact_email && (
                <li className="flex items-center gap-3">
                  <span>✉️</span>
                  <a href={`mailto:${content.contact_email}`} className="hover:underline">
                    {content.contact_email}
                  </a>
                </li>
              )}
              {(content?.social_facebook || content?.social_instagram) && (
                <li className="flex items-center gap-4 pt-1">
                  {content?.social_facebook && (
                    <a href={content.social_facebook} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      Facebook
                    </a>
                  )}
                  {content?.social_instagram && (
                    <a href={content.social_instagram} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      Instagram
                    </a>
                  )}
                </li>
              )}
            </ul>
          </div>

          {hours && Object.keys(hours).length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-5" style={{ color: accent }}>
                Horario
              </h2>
              <ul className="space-y-2 text-gray-700">
                {Object.entries(hours).map(([day, range]) => (
                  <li key={day} className="flex justify-between border-b border-gray-200 py-1.5">
                    <span className="font-medium">{day}</span>
                    <span className="text-gray-500">{range}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* Footer con marca + baja */}
      <footer className="py-8 px-4 bg-gray-900 text-gray-400 text-center text-sm">
        <p>
          {site.business_name} · Página creada con{' '}
          <a href={`https://${ROOT_DOMAIN}`} className="underline hover:text-white">
            MiSitio IA
          </a>
        </p>
        <p className="mt-2 text-xs text-gray-500">
          ¿Es tu negocio y no quieres esta página?{' '}
          <a href={`/baja/${site.slug}`} className="underline hover:text-gray-300">
            Darla de baja
          </a>
        </p>
      </footer>
    </main>
  )
}
