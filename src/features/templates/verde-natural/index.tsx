/**
 * Plantilla `verde-natural` — cálida y orgánica.
 * Hero dos columnas (texto+foto redondeada), paleta verde salvia + crema.
 * Ideal para veterinarias, salud, bienestar.
 */

import type { TemplateRenderProps } from '../types'
import { SiteFooter } from '@/features/sites/components/SiteFooter'
import { Stars } from '../shared/Stars'

const OLIVE = '#3f6b3a'
const OLIVE_DARK = '#22421f'
const CREAM = '#f9f6ee'
const CREAM_DARK = '#f0eadb'
const INK = '#22221e'

export function VerdeNaturalTemplate({ data, business, emoji, base, wa, tel, mapEmbed, mapLink, extras }: TemplateRenderProps) {
  const { site, content, products } = data
  const services = content?.services ?? []
  const highlights = content?.highlights ?? []
  const hours = content?.working_hours ?? null
  const logoUrl = content?.logo_url || null
  const heroImage = content?.hero_image_url || null
  const aboutImage = content?.about_image_url || null
  const display = { fontFamily: 'var(--font-display), Georgia, serif' } as const

  return (
    <main className="min-h-screen" style={{ background: CREAM, color: INK, fontFamily: 'var(--font-body), ui-sans-serif, system-ui, sans-serif' }}>
      <div className="sticky top-0 z-30 backdrop-blur" style={{ background: 'rgba(249,246,238,0.85)', borderBottom: `1px solid ${CREAM_DARK}` }}>
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {logoUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={logoUrl} alt={`Logo de ${site.business_name}`} className="h-10 w-10 rounded-full object-cover shrink-0" style={{ boxShadow: `0 0 0 3px ${CREAM}` }} />
            ) : (
              <div className="h-10 w-10 rounded-full flex items-center justify-center text-white text-xl shrink-0" style={{ background: OLIVE }}>{emoji}</div>
            )}
            <div className="min-w-0">
              <p className="text-base font-semibold truncate leading-tight" style={{ ...display, color: OLIVE_DARK }}>{site.business_name}</p>
              <p className="text-[11px] uppercase tracking-widest truncate" style={{ color: OLIVE }}>{business.giroNombre}</p>
            </div>
          </div>
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="shrink-0 inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full text-white hover:brightness-110" style={{ background: OLIVE_DARK }}>
              <span aria-hidden>💬</span><span className="hidden sm:inline">Escríbenos</span>
            </a>
          )}
        </div>
      </div>

      <header className="relative overflow-hidden" style={{ background: CREAM }}>
        <div className="max-w-6xl mx-auto px-5 py-16 md:py-24 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: CREAM_DARK, color: OLIVE_DARK }}>
              <span aria-hidden>{emoji}</span>
              {business.location ?? business.giroNombre}
            </span>
            <h1 className="mt-5 text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05]" style={{ ...display, color: OLIVE_DARK }}>
              {content?.hero_title || site.business_name}
            </h1>
            {content?.hero_subtitle && (<p className="mt-5 text-lg leading-relaxed max-w-lg" style={{ color: '#5b5b52' }}>{content.hero_subtitle}</p>)}
            {business.rating != null && (
              <div className="mt-6 inline-flex items-center gap-2">
                <Stars rating={business.rating} color="#c48b0d" />
                <span className="font-semibold" style={{ color: OLIVE_DARK }}>{business.rating}</span>
                {business.reviewsCount != null && (<span className="text-sm" style={{ color: '#7c7c72' }}>· {business.reviewsCount} reseñas</span>)}
              </div>
            )}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              {wa && (<a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 text-white px-7 py-3 rounded-full font-medium shadow-md hover:brightness-110" style={{ background: OLIVE }}>💬 WhatsApp</a>)}
              {tel && (<a href={tel} className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full font-medium border" style={{ borderColor: OLIVE, color: OLIVE_DARK }}>📞 Llamar</a>)}
            </div>
          </div>
          <div className="relative">
            {heroImage ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={heroImage} alt="" className="w-full h-[380px] md:h-[460px] object-cover rounded-[2rem] shadow-2xl" />
            ) : (
              <div className="w-full h-[380px] md:h-[460px] rounded-[2rem]" style={{ background: `linear-gradient(140deg, ${OLIVE}, ${OLIVE_DARK})` }} />
            )}
            <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full opacity-40" style={{ background: OLIVE }} aria-hidden />
            <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full opacity-25" style={{ background: OLIVE_DARK }} aria-hidden />
          </div>
        </div>
      </header>

      {highlights.length > 0 && (
        <section style={{ background: CREAM_DARK }} className="py-10">
          <div className="max-w-6xl mx-auto px-5 grid grid-cols-2 md:grid-cols-4 gap-6">
            {highlights.slice(0, 4).map((h, i) => (
              <div key={i} className="text-center">
                <div className="mx-auto h-10 w-10 rounded-full flex items-center justify-center text-white text-base font-bold mb-3" style={{ background: OLIVE }}>✓</div>
                <p className="text-sm leading-snug" style={{ color: OLIVE_DARK }}>{h}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {content?.about_text && (
        <section className="py-20 md:py-28" style={{ background: CREAM }}>
          <div className="max-w-5xl mx-auto px-5">
            <div className="max-w-2xl mx-auto text-center mb-12">
              <span className="text-xs uppercase tracking-[0.3em] font-semibold" style={{ color: OLIVE }}>Nuestra historia</span>
              <h2 className="mt-3 text-3xl md:text-5xl font-bold" style={{ ...display, color: OLIVE_DARK }}>Un lugar hecho con cariño</h2>
            </div>
            <div className="grid md:grid-cols-5 gap-10 items-center">
              {aboutImage ? (
                <div className="md:col-span-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={aboutImage} alt="" className="w-full h-72 object-cover rounded-[1.5rem] shadow-xl" />
                </div>
              ) : (
                <div className="md:col-span-2 w-full h-72 rounded-[1.5rem]" style={{ background: `linear-gradient(140deg, ${OLIVE} 0%, ${OLIVE_DARK} 100%)` }} />
              )}
              <div className="md:col-span-3">
                <p className="text-lg leading-relaxed" style={{ color: '#3b3b34' }}>{content.about_text}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {services.length > 0 && (
        <section className="py-20 md:py-28" style={{ background: CREAM_DARK }}>
          <div className="max-w-6xl mx-auto px-5">
            <div className="max-w-2xl mx-auto text-center mb-14">
              <span className="text-xs uppercase tracking-[0.3em] font-semibold" style={{ color: OLIVE }}>Lo que ofrecemos</span>
              <h2 className="mt-3 text-3xl md:text-5xl font-bold" style={{ ...display, color: OLIVE_DARK }}>Nuestros servicios</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {services.map((s, i) => (
                <div key={i} className="p-7 rounded-[1.5rem] hover:-translate-y-1 transition-all" style={{ background: CREAM }}>
                  <div className="h-11 w-11 rounded-full flex items-center justify-center text-white text-lg mb-4" style={{ background: OLIVE }}>{s.icon || emoji}</div>
                  <h3 className="text-lg font-semibold mb-2" style={{ ...display, color: OLIVE_DARK }}>{s.name}</h3>
                  {s.description && <p className="text-sm leading-relaxed" style={{ color: '#5b5b52' }}>{s.description}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {products.length > 0 && (
        <section className="py-20 md:py-28" style={{ background: CREAM }}>
          <div className="max-w-6xl mx-auto px-5">
            <h2 className="text-center text-3xl md:text-5xl font-bold mb-14" style={{ ...display, color: OLIVE_DARK }}>Catálogo</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => {
                const img = p.image_url || content?.catalog_placeholder_url || null
                return (
                  <div key={p.id} className="rounded-[1.5rem] overflow-hidden shadow-lg" style={{ background: CREAM_DARK }}>
                    {img && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={img} alt={p.name} className="w-full h-48 object-cover" />
                    )}
                    <div className="p-5">
                      <h3 className="font-semibold text-lg" style={{ ...display, color: OLIVE_DARK }}>{p.name}</h3>
                      {p.description && <p className="text-sm mt-1" style={{ color: '#5b5b52' }}>{p.description}</p>}
                      {p.price != null && (<p className="mt-3 font-bold text-lg" style={{ color: OLIVE }}>${p.price.toLocaleString('es-MX')} {p.currency}</p>)}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      <section className="py-20 md:py-28" style={{ background: CREAM_DARK }}>
        <div className="max-w-6xl mx-auto px-5">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <span className="text-xs uppercase tracking-[0.3em] font-semibold" style={{ color: OLIVE }}>Visítanos</span>
            <h2 className="mt-3 text-3xl md:text-5xl font-bold" style={{ ...display, color: OLIVE_DARK }}>Estamos aquí para ayudarte</h2>
          </div>
          <div className="grid lg:grid-cols-2 gap-10">
            <div className="space-y-8">
              <ul className="space-y-4" style={{ color: '#3b3b34' }}>
                {business.address && (<li className="flex items-start gap-3"><span className="text-xl" aria-hidden>📍</span><span>{business.address}</span></li>)}
                {business.phone && (<li className="flex items-center gap-3"><span className="text-xl" aria-hidden>📞</span>{tel ? <a href={tel} className="hover:underline">{business.phone}</a> : <span>{business.phone}</span>}</li>)}
                {business.email && (<li className="flex items-center gap-3"><span className="text-xl" aria-hidden>✉️</span><a href={`mailto:${business.email}`} className="hover:underline">{business.email}</a></li>)}
              </ul>
              {hours && Object.keys(hours).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3" style={{ ...display, color: OLIVE_DARK }}>Horario</h3>
                  <ul className="rounded-2xl overflow-hidden" style={{ background: CREAM }}>
                    {Object.entries(hours).map(([day, range]) => (
                      <li key={day} className="flex justify-between px-4 py-3 border-b last:border-0 text-sm" style={{ borderColor: CREAM_DARK, color: '#3b3b34' }}>
                        <span className="font-medium">{day}</span>
                        <span style={{ color: '#7c7c72' }}>{range}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                {wa && (<a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-full font-medium shadow" style={{ background: OLIVE }}>💬 WhatsApp</a>)}
                {mapLink && (<a href={mapLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium border" style={{ borderColor: OLIVE, color: OLIVE_DARK }}>🗺️ Cómo llegar</a>)}
              </div>
            </div>
            {mapEmbed && (
              <div className="rounded-3xl overflow-hidden shadow-lg min-h-[320px]">
                <iframe title={`Mapa de ${site.business_name}`} src={mapEmbed} className="w-full h-full min-h-[320px]" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
              </div>
            )}
          </div>
        </div>
      </section>

      <SiteFooter businessName={site.business_name} slug={site.slug} base={base} accent={OLIVE} />
      {extras}
    </main>
  )
}

export function VerdeNaturalPreview() {
  return (
    <svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="300" height="200" fill={CREAM} />
      <rect x="0" y="0" width="300" height="20" fill={CREAM} />
      <circle cx="14" cy="10" r="5" fill={OLIVE} />
      <rect x="24" y="7" width="70" height="6" rx="1" fill={OLIVE_DARK} />
      <rect x="250" y="5" width="40" height="10" rx="5" fill={OLIVE_DARK} />
      <rect x="0" y="20" width="300" height="130" fill={CREAM} />
      <rect x="15" y="45" width="120" height="12" rx="2" fill={OLIVE_DARK} />
      <rect x="15" y="63" width="100" height="6" rx="1" fill={OLIVE} opacity="0.7" />
      <rect x="15" y="95" width="50" height="12" rx="6" fill={OLIVE} />
      <rect x="70" y="95" width="50" height="12" rx="6" fill={CREAM_DARK} stroke={OLIVE} />
      <rect x="155" y="40" width="130" height="105" rx="16" fill={OLIVE_DARK} />
      <circle cx="145" cy="40" r="12" fill={OLIVE} opacity="0.4" />
      <circle cx="295" cy="145" r="18" fill={OLIVE_DARK} opacity="0.25" />
      <rect x="0" y="150" width="300" height="24" fill={CREAM_DARK} />
      <circle cx="45" cy="162" r="4" fill={OLIVE} />
      <circle cx="115" cy="162" r="4" fill={OLIVE} />
      <circle cx="185" cy="162" r="4" fill={OLIVE} />
      <circle cx="255" cy="162" r="4" fill={OLIVE} />
      <rect x="30" y="182" width="70" height="14" rx="7" fill={CREAM_DARK} />
      <rect x="115" y="182" width="70" height="14" rx="7" fill={CREAM_DARK} />
      <rect x="200" y="182" width="70" height="14" rx="7" fill={CREAM_DARK} />
    </svg>
  )
}
