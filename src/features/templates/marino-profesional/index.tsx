/**
 * Plantilla `marino-profesional` — estilo UENI mejorado.
 * Hero foto full-bleed con overlay, doble barra superior (navy + blanca con CTA
 * naranja), títulos de sección grandes centrados en navy.
 */

import type { TemplateRenderProps } from '../types'
import { SiteFooter } from '@/features/sites/components/SiteFooter'
import { Stars } from '../shared/Stars'

const NAVY = '#0f2c5c'
const NAVY_DARK = '#0a1f42'
const AMBER = '#f97316'

export function MarinoProfesionalTemplate({ data, business, emoji, base, wa, tel, mapEmbed, mapLink, extras }: TemplateRenderProps) {
  const { site, content, products } = data
  const services = content?.services ?? []
  const highlights = content?.highlights ?? []
  const hours = content?.working_hours ?? null
  const logoUrl = content?.logo_url || null
  const heroImage = content?.hero_image_url || null
  const aboutImage = content?.about_image_url || null
  const heading = { fontFamily: 'var(--font-body), ui-sans-serif, system-ui, sans-serif', letterSpacing: '-0.01em' } as const

  return (
    <main className="min-h-screen bg-white text-slate-800" style={{ fontFamily: 'var(--font-body), ui-sans-serif, system-ui, sans-serif' }}>
      <div className="text-white text-[13px]" style={{ background: NAVY }}>
        <div className="max-w-7xl mx-auto px-5 h-11 flex items-center justify-between">
          <nav className="flex items-center gap-6 overflow-x-auto">
            <a href="#sobre" className="hover:text-amber-300">Sobre nosotros</a>
            <a href="#servicios" className="hover:text-amber-300">Servicios</a>
            {products.length > 0 && <a href="#catalogo" className="hover:text-amber-300">Catálogo</a>}
            <a href="#contacto" className="hover:text-amber-300">Contacto</a>
          </nav>
          {business.phone && (
            <a href={tel ?? '#'} className="hidden sm:inline-flex items-center gap-2 text-white/90 hover:text-white shrink-0">
              <span aria-hidden>📞</span><span className="font-semibold tracking-wide">{business.phone}</span>
            </a>
          )}
        </div>
      </div>

      <div className="sticky top-0 z-30 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {logoUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={logoUrl} alt={`Logo de ${site.business_name}`} className="h-10 w-10 rounded-md object-cover" />
            ) : (
              <div className="h-10 w-10 rounded-md flex items-center justify-center text-white text-xl" style={{ background: NAVY }}>{emoji}</div>
            )}
            <div className="min-w-0">
              <p className="font-bold text-lg truncate leading-tight" style={{ ...heading, color: NAVY_DARK }}>{site.business_name}</p>
              {business.location && (<p className="text-[11px] uppercase tracking-widest text-slate-400 truncate">{business.location}</p>)}
            </div>
          </div>
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="shrink-0 inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-md shadow-md hover:brightness-110 text-white" style={{ background: AMBER }}>
              <span aria-hidden>✉️</span><span>Enviar Mensaje</span>
            </a>
          )}
        </div>
      </div>

      <header className="relative">
        <div className="relative h-[420px] md:h-[540px] overflow-hidden bg-slate-900">
          {heroImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={heroImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0" style={{ background: `linear-gradient(120deg, ${NAVY_DARK}, ${NAVY})` }} />
          )}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(10,31,66,0.35) 0%, rgba(10,31,66,0.85) 100%)' }} />
          <div className="relative h-full max-w-7xl mx-auto px-5 flex items-end pb-10 md:pb-16">
            <div className="max-w-2xl text-white">
              <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-amber-300 mb-3 font-semibold">{business.giroNombre}</p>
              <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4" style={heading}>{content?.hero_title || site.business_name}</h1>
              {content?.hero_subtitle && (<p className="text-base md:text-lg text-white/85 leading-relaxed mb-6 max-w-xl">{content.hero_subtitle}</p>)}
              {business.rating != null && (
                <div className="inline-flex items-center gap-2 mb-6">
                  <Stars rating={business.rating} color="#fbbf24" />
                  <span className="font-semibold">{business.rating}</span>
                  {business.reviewsCount != null && (<span className="text-white/70 text-sm">· {business.reviewsCount} reseñas en Google</span>)}
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-3">
                {wa && (<a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md font-semibold text-white shadow-lg hover:brightness-110" style={{ background: AMBER }}>💬 WhatsApp</a>)}
                {tel && (<a href={tel} className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md font-semibold border-2 border-white/80 text-white hover:bg-white/10">📞 Llamar ahora</a>)}
              </div>
            </div>
          </div>
        </div>
      </header>

      {highlights.length > 0 && (
        <section className="bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-5 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
            {highlights.slice(0, 4).map((h, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: NAVY }}>✓</div>
                <p className="text-sm text-slate-700 leading-snug">{h}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {content?.about_text && (
        <section id="sobre" className="py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-5">
            <h2 className="text-center text-4xl md:text-5xl font-extrabold mb-14" style={{ ...heading, color: NAVY }}>Descripción</h2>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {aboutImage ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={aboutImage} alt="" className="w-full h-80 md:h-96 object-cover rounded-lg shadow-xl" />
              ) : (
                <div className="w-full h-80 md:h-96 rounded-lg" style={{ background: `linear-gradient(140deg, ${NAVY} 0%, ${NAVY_DARK} 100%)` }} />
              )}
              <div>
                <h3 className="text-2xl md:text-3xl font-bold mb-5" style={{ ...heading, color: NAVY_DARK }}>
                  {business.location ? `Tu negocio de confianza en ${business.location}` : 'Nuestro compromiso contigo'}
                </h3>
                <p className="text-slate-700 leading-relaxed text-base md:text-lg">{content.about_text}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {services.length > 0 && (
        <section id="servicios" className="py-20 md:py-28 bg-slate-50 border-y border-slate-100">
          <div className="max-w-6xl mx-auto px-5">
            <h2 className="text-center text-4xl md:text-5xl font-extrabold mb-14" style={{ ...heading, color: NAVY }}>Facilidades</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((s, i) => (
                <div key={i} className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="h-12 w-12 rounded-full flex items-center justify-center text-xl mb-4 text-white" style={{ background: NAVY }} aria-hidden>{s.icon || emoji}</div>
                  <h3 className="font-bold text-lg mb-2" style={{ ...heading, color: NAVY_DARK }}>{s.name}</h3>
                  {s.description && <p className="text-slate-600 text-sm leading-relaxed">{s.description}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {products.length > 0 && (
        <section id="catalogo" className="py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-5">
            <h2 className="text-center text-4xl md:text-5xl font-extrabold mb-14" style={{ ...heading, color: NAVY }}>Productos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => {
                const img = p.image_url || content?.catalog_placeholder_url || null
                return (
                  <div key={p.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    {img && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={img} alt={p.name} className="w-full h-48 object-cover" />
                    )}
                    <div className="p-5 text-center">
                      <h3 className="font-bold text-base mb-2" style={{ ...heading, color: NAVY_DARK }}>{p.name}</h3>
                      {p.description && <p className="text-slate-500 text-sm mb-3 line-clamp-2">{p.description}</p>}
                      {p.price != null && (<p className="font-extrabold text-xl" style={{ color: AMBER }}>${p.price.toLocaleString('es-MX')} {p.currency}</p>)}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      <section id="contacto" className="py-20 md:py-28 bg-slate-50 border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid md:grid-cols-2 gap-10">
            {hours && Object.keys(hours).length > 0 && (
              <div>
                <h2 className="text-3xl md:text-4xl font-extrabold mb-8" style={{ ...heading, color: NAVY }}>Horario de apertura</h2>
                <ul className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-sm">
                  {Object.entries(hours).map(([day, range]) => (
                    <li key={day} className="flex justify-between px-5 py-3.5 border-b border-slate-100 last:border-0 text-sm">
                      <span className="font-semibold" style={{ color: NAVY_DARK }}>{day}</span>
                      <span className="text-slate-600">{range}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-8" style={{ ...heading, color: NAVY }}>Contacto</h2>
              <ul className="space-y-3 text-slate-700">
                {business.address && (<li className="flex items-start gap-3"><span className="text-lg" aria-hidden>📍</span><span>{business.address}</span></li>)}
                {business.phone && (<li className="flex items-center gap-3"><span className="text-lg" aria-hidden>📞</span>{tel ? <a href={tel} className="hover:underline">{business.phone}</a> : <span>{business.phone}</span>}</li>)}
                {business.email && (<li className="flex items-center gap-3"><span className="text-lg" aria-hidden>✉️</span><a href={`mailto:${business.email}`} className="hover:underline">{business.email}</a></li>)}
              </ul>
              <div className="mt-6 flex flex-wrap gap-3">
                {wa && (<a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-white px-5 py-3 rounded-md font-semibold shadow-md hover:brightness-110" style={{ background: AMBER }}>💬 WhatsApp</a>)}
                {mapLink && (<a href={mapLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border-2 px-5 py-3 rounded-md font-semibold hover:bg-white" style={{ borderColor: NAVY, color: NAVY }}>🗺️ Cómo llegar</a>)}
              </div>
            </div>
          </div>
          {mapEmbed && (
            <div className="mt-10 rounded-lg overflow-hidden border border-slate-200 shadow-md min-h-[320px]">
              <iframe title={`Mapa de ${site.business_name}`} src={mapEmbed} className="w-full h-full min-h-[320px]" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            </div>
          )}
        </div>
      </section>

      {wa && (
        <section className="py-16 text-center text-white" style={{ background: NAVY }}>
          <div className="max-w-2xl mx-auto px-5">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4" style={heading}>Contáctanos hoy mismo</h2>
            <p className="text-white/80 mb-8 text-lg">Respondemos rápido con toda la información que necesitas.</p>
            <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-block px-8 py-4 rounded-md font-bold shadow-lg text-white hover:brightness-110" style={{ background: AMBER }}>💬 Enviar mensaje</a>
          </div>
        </section>
      )}

      <SiteFooter businessName={site.business_name} slug={site.slug} base={base} accent={NAVY} />
      {extras}
    </main>
  )
}

export function MarinoProfesionalPreview() {
  return (
    <svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="mp-photo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#374151" />
          <stop offset="100%" stopColor="#111827" />
        </linearGradient>
      </defs>
      <rect width="300" height="200" fill="#ffffff" />
      <rect x="0" y="0" width="300" height="12" fill={NAVY} />
      <rect x="0" y="12" width="300" height="18" fill="#ffffff" />
      <rect x="10" y="17" width="8" height="8" rx="1" fill={NAVY} />
      <rect x="22" y="19" width="80" height="4" rx="1" fill={NAVY_DARK} />
      <rect x="240" y="16" width="50" height="10" rx="2" fill={AMBER} />
      <rect x="0" y="30" width="300" height="100" fill={NAVY_DARK} />
      <rect x="0" y="30" width="300" height="100" fill="url(#mp-photo)" opacity="0.5" />
      <rect x="15" y="85" width="60" height="4" rx="1" fill={AMBER} />
      <rect x="15" y="95" width="140" height="7" rx="1" fill="#ffffff" />
      <rect x="15" y="107" width="110" height="4" rx="1" fill="#ffffff" opacity="0.7" />
      <rect x="15" y="115" width="55" height="10" rx="1" fill={AMBER} />
      <rect x="80" y="145" width="140" height="8" rx="1" fill={NAVY} />
      <rect x="20" y="160" width="80" height="30" rx="2" fill="#ffffff" stroke="#e2e8f0" />
      <rect x="110" y="160" width="80" height="30" rx="2" fill="#ffffff" stroke="#e2e8f0" />
      <rect x="200" y="160" width="80" height="30" rx="2" fill="#ffffff" stroke="#e2e8f0" />
      <circle cx="60" cy="175" r="4" fill={NAVY} />
      <circle cx="150" cy="175" r="4" fill={NAVY} />
      <circle cx="240" cy="175" r="4" fill={NAVY} />
    </svg>
  )
}
