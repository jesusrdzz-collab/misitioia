/**
 * Plantilla `rosa-premium` — elegante, femenina, cálida.
 * Hero full-bleed con foto y overlay burdeos, títulos Playfair, paleta
 * rosa/burdeos/crema/dorado. Ideal para estéticas, boutiques, spas.
 */

import type { TemplateRenderProps } from '../types'
import { SiteFooter } from '@/features/sites/components/SiteFooter'
import { Stars } from '../shared/Stars'

const ROSE = '#c2185b'
const BURGUNDY = '#7d1b3b'
const CREAM = '#fdf8f5'
const CREAM_DARK = '#f5e9e5'
const GOLD = '#c19257'
const INK = '#2a1b1f'

export function RosaPremiumTemplate({ data, business, emoji, base, wa, tel, mapEmbed, mapLink, extras }: TemplateRenderProps) {
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
      <div className="sticky top-0 z-30 backdrop-blur" style={{ background: 'rgba(253,248,245,0.85)', borderBottom: `1px solid ${CREAM_DARK}` }}>
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {logoUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={logoUrl} alt={`Logo de ${site.business_name}`} className="h-10 w-10 rounded-full object-cover shrink-0" style={{ boxShadow: `0 0 0 3px ${CREAM}` }} />
            ) : (
              <div className="h-10 w-10 rounded-full flex items-center justify-center text-white text-xl shrink-0" style={{ background: `linear-gradient(135deg, ${ROSE}, ${BURGUNDY})` }}>{emoji}</div>
            )}
            <div className="min-w-0">
              <p className="text-base font-semibold truncate leading-tight" style={{ ...display, color: BURGUNDY }}>{site.business_name}</p>
              <p className="text-[11px] uppercase tracking-widest truncate" style={{ color: GOLD }}>{business.giroNombre}</p>
            </div>
          </div>
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="shrink-0 inline-flex items-center gap-2 text-sm font-medium px-5 py-2 rounded-full text-white hover:brightness-110" style={{ background: `linear-gradient(135deg, ${ROSE}, ${BURGUNDY})` }}>
              <span aria-hidden>💬</span><span className="hidden sm:inline">Reserva</span>
            </a>
          )}
        </div>
      </div>

      <header className="relative overflow-hidden" style={{ background: BURGUNDY }}>
        <div className="relative h-[520px] md:h-[600px]">
          {heroImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={heroImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
          ) : (
            <div className="absolute inset-0" style={{ background: `linear-gradient(140deg, ${ROSE} 0%, ${BURGUNDY} 100%)` }} />
          )}
          <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, rgba(125,27,59,0.35) 0%, rgba(42,27,31,0.75) 100%)` }} />
          <div className="relative h-full max-w-6xl mx-auto px-5 flex flex-col items-center justify-center text-center text-white">
            <div className="mb-6 inline-flex items-center gap-3">
              <span className="h-px w-10" style={{ background: GOLD }} aria-hidden />
              <span className="text-xs uppercase tracking-[0.4em] font-semibold" style={{ color: GOLD }}>{business.giroNombre}</span>
              <span className="h-px w-10" style={{ background: GOLD }} aria-hidden />
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.05] max-w-3xl text-balance" style={display}>
              {content?.hero_title || site.business_name}
            </h1>
            {content?.hero_subtitle && (<p className="mt-6 text-base md:text-lg max-w-xl leading-relaxed text-white/90">{content.hero_subtitle}</p>)}
            {business.rating != null && (
              <div className="mt-6 inline-flex items-center gap-2">
                <Stars rating={business.rating} color={GOLD} />
                <span className="font-semibold">{business.rating}</span>
                {business.reviewsCount != null && (<span className="text-white/75 text-sm">· {business.reviewsCount} reseñas</span>)}
              </div>
            )}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              {wa && (<a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-semibold text-white shadow-lg hover:brightness-110" style={{ background: `linear-gradient(135deg, ${ROSE}, ${BURGUNDY})` }}>💬 Reserva tu cita</a>)}
              {tel && (<a href={tel} className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-semibold border-2 hover:bg-white/10" style={{ borderColor: GOLD, color: 'white' }}>📞 Llámanos</a>)}
            </div>
          </div>
        </div>
      </header>

      {highlights.length > 0 && (
        <section className="relative -mt-10 z-10">
          <div className="max-w-5xl mx-auto px-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {highlights.slice(0, 4).map((h, i) => (
                <div key={i} className="text-center p-5 rounded-2xl" style={{ background: CREAM, boxShadow: `0 10px 30px -10px rgba(125,27,59,0.25)` }}>
                  <div className="mx-auto h-9 w-9 rounded-full flex items-center justify-center text-white text-sm font-bold mb-3" style={{ background: `linear-gradient(135deg, ${ROSE}, ${BURGUNDY})` }}>✓</div>
                  <p className="text-sm leading-snug" style={{ color: BURGUNDY }}>{h}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {content?.about_text && (
        <section className="py-20 md:py-28">
          <div className="max-w-5xl mx-auto px-5">
            <div className="grid md:grid-cols-5 gap-12 items-center">
              <div className="md:col-span-2">
                {aboutImage ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={aboutImage} alt="" className="w-full h-96 object-cover rounded-[2rem] shadow-2xl" />
                ) : (
                  <div className="w-full h-96 rounded-[2rem]" style={{ background: `linear-gradient(140deg, ${ROSE}, ${BURGUNDY})` }} />
                )}
              </div>
              <div className="md:col-span-3">
                <span className="text-xs uppercase tracking-[0.3em] font-semibold" style={{ color: GOLD }}>Sobre nosotros</span>
                <h2 className="mt-3 text-3xl md:text-5xl font-bold leading-tight" style={{ ...display, color: BURGUNDY }}>Cada visita, una experiencia</h2>
                <p className="mt-5 text-lg leading-relaxed" style={{ color: '#514247' }}>{content.about_text}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {services.length > 0 && (
        <section className="py-20 md:py-28" style={{ background: CREAM_DARK }}>
          <div className="max-w-6xl mx-auto px-5">
            <div className="max-w-2xl mx-auto text-center mb-14">
              <span className="text-xs uppercase tracking-[0.3em] font-semibold" style={{ color: GOLD }}>Servicios</span>
              <h2 className="mt-3 text-3xl md:text-5xl font-bold" style={{ ...display, color: BURGUNDY }}>Diseñados para consentirte</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((s, i) => (
                <div key={i} className="relative p-8 rounded-[1.5rem] overflow-hidden hover:-translate-y-1 hover:shadow-2xl transition-all" style={{ background: CREAM, boxShadow: '0 5px 15px -5px rgba(125,27,59,0.15)' }}>
                  <div className="absolute top-0 left-0 h-1 w-full" style={{ background: `linear-gradient(90deg, ${ROSE}, ${GOLD})` }} />
                  <div className="text-3xl mb-4" aria-hidden>{s.icon || emoji}</div>
                  <h3 className="text-xl font-bold mb-2" style={{ ...display, color: BURGUNDY }}>{s.name}</h3>
                  {s.description && <p className="text-sm leading-relaxed" style={{ color: '#514247' }}>{s.description}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {products.length > 0 && (
        <section className="py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-5">
            <div className="text-center mb-14">
              <span className="text-xs uppercase tracking-[0.3em] font-semibold" style={{ color: GOLD }}>Nuestros productos</span>
              <h2 className="mt-3 text-3xl md:text-5xl font-bold" style={{ ...display, color: BURGUNDY }}>Boutique</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => {
                const img = p.image_url || content?.catalog_placeholder_url || null
                return (
                  <div key={p.id} className="rounded-[1.5rem] overflow-hidden bg-white shadow-md hover:shadow-2xl transition-shadow">
                    {img && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={img} alt={p.name} className="w-full h-56 object-cover" />
                    )}
                    <div className="p-6 text-center">
                      <h3 className="font-bold text-lg mb-1" style={{ ...display, color: BURGUNDY }}>{p.name}</h3>
                      {p.description && <p className="text-sm mb-3" style={{ color: '#7c6367' }}>{p.description}</p>}
                      {p.price != null && (<p className="font-bold text-xl" style={{ color: ROSE }}>${p.price.toLocaleString('es-MX')} {p.currency}</p>)}
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
            <span className="text-xs uppercase tracking-[0.3em] font-semibold" style={{ color: GOLD }}>Visítanos</span>
            <h2 className="mt-3 text-3xl md:text-5xl font-bold" style={{ ...display, color: BURGUNDY }}>Reserva tu momento</h2>
          </div>
          <div className="grid lg:grid-cols-2 gap-10">
            <div className="space-y-8">
              <ul className="space-y-4" style={{ color: '#514247' }}>
                {business.address && (<li className="flex items-start gap-3"><span className="text-xl" aria-hidden>📍</span><span>{business.address}</span></li>)}
                {business.phone && (<li className="flex items-center gap-3"><span className="text-xl" aria-hidden>📞</span>{tel ? <a href={tel} className="hover:underline">{business.phone}</a> : <span>{business.phone}</span>}</li>)}
                {business.email && (<li className="flex items-center gap-3"><span className="text-xl" aria-hidden>✉️</span><a href={`mailto:${business.email}`} className="hover:underline">{business.email}</a></li>)}
              </ul>
              {hours && Object.keys(hours).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3" style={{ ...display, color: BURGUNDY }}>Horario</h3>
                  <ul className="rounded-2xl overflow-hidden bg-white" style={{ border: `1px solid ${CREAM_DARK}` }}>
                    {Object.entries(hours).map(([day, range]) => (
                      <li key={day} className="flex justify-between px-4 py-3 border-b last:border-0 text-sm" style={{ borderColor: CREAM_DARK, color: '#514247' }}>
                        <span className="font-medium">{day}</span>
                        <span style={{ color: '#7c6367' }}>{range}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                {wa && (<a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-full font-medium shadow" style={{ background: `linear-gradient(135deg, ${ROSE}, ${BURGUNDY})` }}>💬 WhatsApp</a>)}
                {mapLink && (<a href={mapLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium border" style={{ borderColor: BURGUNDY, color: BURGUNDY }}>🗺️ Cómo llegar</a>)}
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

      <SiteFooter businessName={site.business_name} slug={site.slug} base={base} accent={ROSE} />
      {extras}
    </main>
  )
}

export function RosaPremiumPreview() {
  return (
    <svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="rp-hero" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={ROSE} />
          <stop offset="100%" stopColor={BURGUNDY} />
        </linearGradient>
        <linearGradient id="rp-btn" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={ROSE} />
          <stop offset="100%" stopColor={BURGUNDY} />
        </linearGradient>
      </defs>
      <rect width="300" height="200" fill={CREAM} />
      <rect x="0" y="0" width="300" height="18" fill={CREAM} />
      <circle cx="14" cy="9" r="5" fill={ROSE} />
      <rect x="24" y="6" width="70" height="6" rx="1" fill={BURGUNDY} />
      <rect x="248" y="4" width="45" height="10" rx="5" fill="url(#rp-btn)" />
      <rect x="0" y="18" width="300" height="130" fill="url(#rp-hero)" />
      <line x1="100" y1="55" x2="115" y2="55" stroke={GOLD} strokeWidth="1" />
      <line x1="185" y1="55" x2="200" y2="55" stroke={GOLD} strokeWidth="1" />
      <rect x="55" y="70" width="190" height="14" rx="2" fill="#ffffff" opacity="0.95" />
      <rect x="90" y="90" width="120" height="6" rx="1" fill="#ffffff" opacity="0.75" />
      <rect x="115" y="105" width="70" height="14" rx="7" fill="url(#rp-btn)" />
      <rect x="30" y="150" width="55" height="30" rx="6" fill={CREAM} />
      <rect x="95" y="150" width="55" height="30" rx="6" fill={CREAM} />
      <rect x="160" y="150" width="55" height="30" rx="6" fill={CREAM} />
      <rect x="225" y="150" width="55" height="30" rx="6" fill={CREAM} />
      <circle cx="57" cy="164" r="3" fill={ROSE} />
      <circle cx="122" cy="164" r="3" fill={ROSE} />
      <circle cx="187" cy="164" r="3" fill={ROSE} />
      <circle cx="252" cy="164" r="3" fill={ROSE} />
    </svg>
  )
}
