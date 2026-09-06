/**
 * Plantilla `neutro-minimalista` — quinta plantilla (Sprint 6-sep-2026).
 *
 * Filosofía: foto grande + tipografía protagonista. Agnóstica de giro; sirve
 * como fallback universal cuando el negocio no encaja en las otras cuatro
 * paletas (terracota, marino, verde, rosa).
 *
 * Paleta: fondo off-white, texto casi negro, acento azul petróleo sutil.
 * Ni naranjas ni rosas. Cero ornamento — mucho whitespace, jerarquía por
 * tamaño y peso tipográfico.
 *
 * Hero: foto full-bleed grande con máscara oscura sutil en la parte inferior;
 * el título vive sobre la foto en la esquina inferior izquierda. Sin pill de
 * categoría (el nombre y el lugar son suficientes).
 */

import type { TemplateRenderProps } from '../types'
import { SiteFooter } from '@/features/sites/components/SiteFooter'
import { Stars } from '../shared/Stars'

const INK = '#111111'
const INK_SOFT = '#2a2a2a'
const PAPER = '#fafaf9'
const RULE = '#e7e5e4'
const ACCENT = '#264653'

export function NeutroMinimalistaTemplate({ data, business, emoji, base, wa, tel, mapEmbed, mapLink, extras }: TemplateRenderProps) {
  const { site, content, products } = data
  const services = content?.services ?? []
  const highlights = content?.highlights ?? []
  const hours = content?.working_hours ?? null
  const logoUrl = content?.logo_url || null
  const heroImage = content?.hero_image_url || null
  const aboutImage = content?.about_image_url || null
  const display = { fontFamily: 'var(--font-body), ui-sans-serif, system-ui, sans-serif', letterSpacing: '-0.02em' } as const
  const serif = { fontFamily: 'var(--font-display), Georgia, serif' } as const

  return (
    <main
      className="min-h-screen"
      style={{ background: PAPER, color: INK, fontFamily: 'var(--font-body), ui-sans-serif, system-ui, sans-serif' }}
    >
      {/* Top bar - minimal, no color block */}
      <div className="sticky top-0 z-30 backdrop-blur" style={{ background: `${PAPER}cc`, borderBottom: `1px solid ${RULE}` }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {logoUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={logoUrl} alt={`Logo de ${site.business_name}`} className="h-9 w-9 rounded object-cover shrink-0" />
            ) : (
              <span className="text-xl shrink-0" aria-hidden>{emoji}</span>
            )}
            <span className="font-semibold truncate" style={{ ...display, color: INK }}>{site.business_name}</span>
          </div>
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full text-white hover:opacity-90 transition-opacity"
              style={{ background: INK }}
            >
              <span aria-hidden>💬</span><span className="hidden sm:inline">Escribir</span>
            </a>
          )}
        </div>
      </div>

      {/* Hero: foto ambiental full-bleed grande, título encima abajo-izquierda */}
      <header className="relative">
        <div className="relative w-full overflow-hidden" style={{ background: '#ddd7cf' }}>
          <div className="relative h-[62vh] min-h-[440px] md:min-h-[560px] max-h-[720px]">
            {heroImage ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={heroImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #ddd7cf 0%, #a89f96 100%)` }} />
            )}
            {/* Máscara oscura sutil solo en la parte inferior */}
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)' }}
              aria-hidden
            />
            <div className="relative h-full max-w-6xl mx-auto px-6 flex items-end pb-10 md:pb-14">
              <div className="max-w-3xl text-white">
                {business.location && (
                  <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-white/70 mb-4 font-medium">{business.location}</p>
                )}
                <h1 className="text-4xl md:text-6xl leading-[1.05] mb-4 font-medium" style={serif}>
                  {content?.hero_title || site.business_name}
                </h1>
                {content?.hero_subtitle && (
                  <p className="text-base md:text-lg text-white/85 leading-relaxed max-w-xl mb-6">{content.hero_subtitle}</p>
                )}
                {business.rating != null && (
                  <div className="inline-flex items-center gap-2 mb-6 text-white/90">
                    <Stars rating={business.rating} color="#fde68a" />
                    <span className="font-semibold">{business.rating}</span>
                    {business.reviewsCount != null && <span className="text-white/70 text-sm">· {business.reviewsCount} reseñas</span>}
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-3">
                  {wa && (
                    <a
                      href={wa}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold text-sm text-white hover:opacity-90"
                      style={{ background: INK }}
                    >
                      Escríbenos por WhatsApp
                    </a>
                  )}
                  {tel && (
                    <a
                      href={tel}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold text-sm border border-white/70 text-white hover:bg-white/10"
                    >
                      Llamar ahora
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {highlights.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 py-14 md:py-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {highlights.slice(0, 4).map((h, i) => (
              <div key={i}>
                <div className="text-xs uppercase tracking-[0.25em] font-semibold mb-3" style={{ color: ACCENT }}>{String(i + 1).padStart(2, '0')}</div>
                <p className="text-[15px] leading-relaxed" style={{ color: INK_SOFT }}>{h}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {content?.about_text && (
        <section id="sobre" className="border-t" style={{ borderColor: RULE }}>
          <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
            <div className="grid md:grid-cols-12 gap-10 md:gap-14 items-start">
              <div className="md:col-span-4">
                <p className="text-xs uppercase tracking-[0.3em] font-semibold" style={{ color: ACCENT }}>Sobre</p>
                <h2 className="mt-4 text-3xl md:text-5xl font-medium leading-[1.05]" style={serif}>Nuestro trabajo</h2>
              </div>
              <div className="md:col-span-8">
                {aboutImage && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={aboutImage} alt="" className="w-full h-72 md:h-96 object-cover rounded-md mb-8" />
                )}
                <p className="text-lg md:text-xl leading-relaxed" style={{ color: INK_SOFT, ...serif, fontStyle: 'normal' }}>{content.about_text}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {services.length > 0 && (
        <section id="servicios" className="border-t" style={{ borderColor: RULE }}>
          <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
            <div className="mb-14 md:mb-20">
              <p className="text-xs uppercase tracking-[0.3em] font-semibold" style={{ color: ACCENT }}>Servicios</p>
              <h2 className="mt-4 text-3xl md:text-5xl font-medium leading-[1.05]" style={serif}>Qué hacemos</h2>
            </div>
            <ul className="divide-y" style={{ borderColor: RULE }}>
              {services.map((s, i) => (
                <li key={i} className="grid md:grid-cols-12 gap-6 py-7 md:py-9 border-t" style={{ borderColor: RULE }}>
                  <div className="md:col-span-1 text-sm font-mono" style={{ color: ACCENT }}>{String(i + 1).padStart(2, '0')}</div>
                  <div className="md:col-span-4">
                    <h3 className="text-xl md:text-2xl font-medium" style={{ ...serif, color: INK }}>{s.name}</h3>
                  </div>
                  <div className="md:col-span-7">
                    {s.description && <p className="text-[15px] leading-relaxed" style={{ color: INK_SOFT }}>{s.description}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {products.length > 0 && (
        <section id="catalogo" className="border-t" style={{ borderColor: RULE }}>
          <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
            <div className="mb-14 md:mb-20">
              <p className="text-xs uppercase tracking-[0.3em] font-semibold" style={{ color: ACCENT }}>Catálogo</p>
              <h2 className="mt-4 text-3xl md:text-5xl font-medium leading-[1.05]" style={serif}>Lo que puedes encontrar</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-14">
              {products.map((p) => {
                const img = p.image_url || content?.catalog_placeholder_url || null
                return (
                  <article key={p.id}>
                    {img && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={img} alt={p.name} className="w-full aspect-[4/3] object-cover rounded-sm mb-5" />
                    )}
                    <h3 className="text-lg md:text-xl font-medium mb-2" style={{ ...serif, color: INK }}>{p.name}</h3>
                    {p.description && <p className="text-sm mb-3 leading-relaxed" style={{ color: INK_SOFT }}>{p.description}</p>}
                    {p.price != null && (
                      <p className="text-base font-semibold" style={{ color: ACCENT }}>${p.price.toLocaleString('es-MX')} {p.currency}</p>
                    )}
                  </article>
                )
              })}
            </div>
          </div>
        </section>
      )}

      <section id="contacto" className="border-t" style={{ borderColor: RULE, background: '#f2efeb' }}>
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
          <div className="grid md:grid-cols-12 gap-10">
            <div className="md:col-span-5">
              <p className="text-xs uppercase tracking-[0.3em] font-semibold" style={{ color: ACCENT }}>Contacto</p>
              <h2 className="mt-4 text-3xl md:text-5xl font-medium leading-[1.05] mb-8" style={serif}>Ven a vernos o escríbenos</h2>
              <ul className="space-y-4 text-[15px]" style={{ color: INK_SOFT }}>
                {business.address && (
                  <li className="flex items-start gap-3"><span className="text-lg" aria-hidden>📍</span><span>{business.address}</span></li>
                )}
                {business.phone && (
                  <li className="flex items-center gap-3"><span className="text-lg" aria-hidden>📞</span>{tel ? <a href={tel} className="hover:underline">{business.phone}</a> : <span>{business.phone}</span>}</li>
                )}
                {business.email && (
                  <li className="flex items-center gap-3"><span className="text-lg" aria-hidden>✉️</span><a href={`mailto:${business.email}`} className="hover:underline">{business.email}</a></li>
                )}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                {wa && (
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-full font-semibold text-sm hover:opacity-90"
                    style={{ background: INK }}
                  >
                    WhatsApp
                  </a>
                )}
                {mapLink && (
                  <a
                    href={mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 border px-6 py-3 rounded-full font-semibold text-sm hover:bg-white"
                    style={{ borderColor: INK_SOFT, color: INK_SOFT }}
                  >
                    Cómo llegar
                  </a>
                )}
              </div>
            </div>
            <div className="md:col-span-7">
              {hours && Object.keys(hours).length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xs uppercase tracking-[0.3em] font-semibold mb-4" style={{ color: ACCENT }}>Horario</h3>
                  <ul className="rounded-md overflow-hidden bg-white border" style={{ borderColor: RULE }}>
                    {Object.entries(hours).map(([day, range]) => (
                      <li key={day} className="flex justify-between px-5 py-3 border-b last:border-0 text-sm" style={{ borderColor: RULE }}>
                        <span className="font-medium" style={{ color: INK }}>{day}</span>
                        <span style={{ color: INK_SOFT }}>{range}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {mapEmbed && (
                <div className="rounded-md overflow-hidden border shadow-sm min-h-[280px]" style={{ borderColor: RULE }}>
                  <iframe title={`Mapa de ${site.business_name}`} src={mapEmbed} className="w-full h-full min-h-[280px]" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {wa && (
        <section className="border-t py-20 md:py-24 text-center" style={{ borderColor: RULE, background: INK, color: '#ffffff' }}>
          <div className="max-w-2xl mx-auto px-6">
            <h2 className="text-3xl md:text-5xl font-medium mb-4 leading-tight" style={serif}>Cuando estés listo, aquí estamos.</h2>
            <p className="text-white/70 mb-8 text-base md:text-lg">Escríbenos y respondemos el mismo día.</p>
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-3.5 rounded-full font-semibold bg-white text-neutral-900 hover:opacity-90"
            >
              Escríbenos por WhatsApp
            </a>
          </div>
        </section>
      )}

      <SiteFooter businessName={site.business_name} slug={site.slug} base={base} accent={ACCENT} />
      {extras}
    </main>
  )
}

export function NeutroMinimalistaPreview() {
  return (
    <svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="nm-hero" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a89f96" />
          <stop offset="100%" stopColor="#3f3833" />
        </linearGradient>
      </defs>
      <rect width="300" height="200" fill={PAPER} />
      {/* Top bar minimal */}
      <rect x="0" y="0" width="300" height="18" fill={PAPER} stroke={RULE} />
      <rect x="12" y="6" width="8" height="8" rx="1" fill={INK} />
      <rect x="26" y="8" width="60" height="4" rx="1" fill={INK} />
      <rect x="248" y="5" width="44" height="10" rx="5" fill={INK} />
      {/* Hero full-bleed photo */}
      <rect x="0" y="18" width="300" height="120" fill="url(#nm-hero)" />
      <rect x="0" y="118" width="300" height="20" fill="#000" opacity="0.45" />
      <rect x="16" y="70" width="60" height="3" rx="1" fill="#ffffff" opacity="0.7" />
      <rect x="16" y="82" width="180" height="10" rx="1" fill="#ffffff" opacity="0.95" />
      <rect x="16" y="98" width="120" height="4" rx="1" fill="#ffffff" opacity="0.75" />
      <rect x="16" y="118" width="70" height="12" rx="6" fill={INK} />
      {/* Content — spacious, typographic */}
      <rect x="16" y="148" width="24" height="4" rx="1" fill={ACCENT} />
      <rect x="16" y="156" width="90" height="7" rx="1" fill={INK} />
      <rect x="16" y="170" width="180" height="3" rx="1" fill="#9c968f" />
      <rect x="16" y="178" width="150" height="3" rx="1" fill="#9c968f" />
      <rect x="16" y="186" width="120" height="3" rx="1" fill="#9c968f" />
    </svg>
  )
}
