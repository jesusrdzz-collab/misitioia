import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { SiteNav } from '@/features/marketing/components/SiteNav'
import { SiteFooter } from '@/features/marketing/components/SiteFooter'
import { Pricing } from '@/features/marketing/components/Pricing'
import { FAQ } from '@/features/marketing/data/faq'
import { SITE_URL } from '@/features/marketing/brand'
import {
  organizationJsonLd,
  softwareApplicationJsonLd,
  faqPageJsonLd,
  jsonLdScript,
} from '@/features/marketing/structured-data'

export const metadata: Metadata = {
  title: 'MiSitio IA — Tu página web con un asistente que vende solo',
  description:
    'Creamos la página web de tu negocio con IA, gratis. Y en el plan de pago le conectamos a Victoria: atiende y vende por ti 24/7 por WhatsApp y web, y agenda videollamadas. La única web que además convierte.',
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: 'MiSitio IA — La página web que además vende sola',
    description:
      'Página web con IA + un asistente (Victoria) que atiende y vende 24/7. Empieza gratis.',
    url: SITE_URL,
    siteName: 'MiSitio IA',
    locale: 'es_MX',
    type: 'website',
    images: [{ url: '/img/og-image.webp', width: 1344, height: 768, alt: 'MiSitio IA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MiSitio IA — La página web que además vende sola',
    description: 'Página web con IA + un asistente que vende 24/7. Empieza gratis.',
    images: ['/img/og-image.webp'],
  },
}

const STEPS = [
  {
    n: '1',
    emoji: '🤖',
    title: 'La IA arma tu sitio',
    desc: 'Con la información pública de tu negocio creamos tu página profesional en minutos. Sin diseñadores, sin esperar semanas.',
  },
  {
    n: '2',
    emoji: '✏️',
    title: 'Tú le das el toque',
    desc: 'Reclama tu sitio y ajusta textos, fotos y productos desde un editor tan fácil como usar WhatsApp. Guardas y se publica al instante.',
  },
  {
    n: '3',
    emoji: '💬',
    title: 'Victoria empieza a vender',
    desc: 'Activa el asistente de IA y tu página deja de ser un folleto: contesta, cotiza y agenda videollamadas por ti, de día y de noche.',
  },
]

const FEATURES = [
  { emoji: '⚡', title: 'Lista en minutos', desc: 'Nada de esperar semanas a un desarrollador. Tu página existe y funciona el mismo día.' },
  { emoji: '📱', title: 'Perfecta en el celular', desc: 'Se ve impecable en cualquier teléfono, que es donde tus clientes te van a buscar.' },
  { emoji: '🔎', title: 'Te encuentran en Google y en la IA', desc: 'Optimizada para buscadores y para asistentes como ChatGPT, Gemini y Perplexity.' },
  { emoji: '🗓️', title: 'Agenda videollamadas', desc: 'Victoria coordina reuniones por video con tus clientes, sin que tú muevas un dedo.' },
  { emoji: '🧾', title: 'Catálogo con tus productos', desc: 'Muestra lo que vendes con precios y fotos. Actualízalo cuando quieras.' },
  { emoji: '🔒', title: 'Tus datos, protegidos', desc: 'Cumplimos la Ley Federal de Protección de Datos. Tú eres dueño de tu contenido.' },
]

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(organizationJsonLd())} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(softwareApplicationJsonLd())} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faqPageJsonLd())} />

      <div className="flex min-h-screen flex-col bg-[#fdfbf7] text-stone-800">
        <SiteNav />

        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-orange-200/40 blur-3xl" />
          <div className="pointer-events-none absolute top-40 -left-24 h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl" />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:grid-cols-2 md:py-24">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-sm font-medium text-orange-700">
                <span className="h-2 w-2 animate-pulse rounded-full bg-orange-500" />
                Sitio web + vendedor con IA, en un solo lugar
              </div>
              <h1
                className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight text-stone-900 md:text-6xl"
                style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
              >
                Tu página web que, además,{' '}
                <span className="text-orange-600">atiende y vende sola</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-stone-600">
                Las demás plataformas te dan una página bonita y ahí te dejan. Nosotros te damos la
                página <strong className="font-semibold text-stone-800">y</strong> a Victoria: un
                asistente de IA que contesta, cotiza y agenda videollamadas por ti, 24/7. Empieza
                gratis.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/crear"
                  className="rounded-xl bg-orange-600 px-8 py-4 text-center text-lg font-semibold text-white shadow-lg shadow-orange-600/25 transition-colors hover:bg-orange-700"
                >
                  Crear mi sitio gratis →
                </Link>
                <Link
                  href="#victoria"
                  className="rounded-xl border border-stone-300 px-8 py-4 text-center text-lg font-medium text-stone-700 transition-colors hover:bg-white"
                >
                  Conoce a Victoria
                </Link>
              </div>
              <p className="mt-4 text-sm text-stone-500">
                Sin tarjeta. Sin permanencia. Tu página lista hoy mismo.
              </p>
            </div>

            <div className="relative">
              <div className="overflow-hidden rounded-3xl border border-stone-200 shadow-2xl shadow-stone-300/40">
                <Image
                  src="/img/hero.webp"
                  alt="Dueña de un negocio mexicano sonriendo mientras ve su sitio web en el celular"
                  width={1344}
                  height={768}
                  priority
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-stone-100 bg-white px-5 py-3 shadow-xl sm:block">
                <div className="text-xs text-stone-500">Victoria, ahora</div>
                <div className="text-sm font-semibold text-stone-800">“¡Claro! Te agendo la videollamada 🎥”</div>
              </div>
            </div>
          </div>
        </section>

        {/* PROBLEMA / DIFERENCIAL */}
        <section className="border-y border-stone-200 bg-white px-4 py-16">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-orange-600">El detalle que cambia todo</p>
            <h2
              className="mx-auto mt-3 max-w-3xl text-2xl font-bold leading-snug text-stone-900 md:text-4xl"
              style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
            >
              Una página estática solo se ve bonita. La tuya <span className="text-orange-600">contesta.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-stone-600">
              El 89% de los negocios pequeños no tiene sitio web, y de los que lo tienen, casi
              ninguno responde cuando el cliente escribe a medianoche. Ahí se pierde la venta.
              MiSitio IA cierra esa fuga.
            </p>
          </div>
        </section>

        {/* CÓMO FUNCIONA */}
        <section id="como-funciona" className="px-4 py-20">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <h2
                className="text-3xl font-bold text-stone-900 md:text-4xl"
                style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
              >
                De cero a vendiendo, en 3 pasos
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-stone-500">Sin complicaciones. Sin código. Sin esperar.</p>
            </div>
            <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
              {STEPS.map((s) => (
                <div key={s.n} className="relative rounded-2xl border border-stone-200 bg-white p-8 transition-all hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg">
                  <div className="absolute -top-4 left-8 flex h-9 w-9 items-center justify-center rounded-full bg-orange-600 text-sm font-bold text-white">
                    {s.n}
                  </div>
                  <div className="mt-2 text-4xl">{s.emoji}</div>
                  <h3 className="mt-4 text-xl font-semibold text-stone-900">{s.title}</h3>
                  <p className="mt-2 leading-relaxed text-stone-600">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* VICTORIA — el caballo de Troya */}
        <section id="victoria" className="bg-stone-950 px-4 py-24 text-white">
          <div className="mx-auto grid max-w-6xl items-center gap-14 md:grid-cols-2">
            <div className="order-2 md:order-1">
              <div className="overflow-hidden rounded-3xl border border-stone-800 shadow-2xl">
                <Image
                  src="/img/feature-victoria.webp"
                  alt="Asistente de IA Victoria contestando una conversación en el celular"
                  width={1024}
                  height={768}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-500/10 px-3 py-1 text-sm font-medium text-orange-300">
                ✨ Incluido desde el Nivel 2
              </div>
              <h2
                className="mt-5 text-3xl font-bold leading-tight md:text-5xl"
                style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
              >
                Conoce a Victoria, tu vendedora que nunca duerme
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-stone-300">
                Victoria ya lleva meses vendiendo de verdad en otros negocios. Conoce tu catálogo,
                tus precios y tus horarios. Contesta en español, con la voz de tu marca, a cualquier
                hora — y cuando el cliente está listo, agenda una videollamada o te pasa la
                conversación para que cierres tú.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  ['🕐', 'Atiende 24/7', 'Ni un mensaje sin respuesta, ni de madrugada ni en domingo.'],
                  ['🎥', 'Agenda videollamadas', 'Coordina reuniones por video con tus clientes automáticamente.'],
                  ['🤝', 'Relevo humano', 'Cuando quieras, tomas la conversación tú mismo. Victoria se hace a un lado.'],
                  ['📲', 'También en tu WhatsApp', 'En el Nivel 3, Victoria contesta también desde tu número.'],
                ].map(([e, t, d]) => (
                  <li key={t} className="flex items-start gap-4">
                    <span className="text-2xl">{e}</span>
                    <div>
                      <div className="font-semibold text-white">{t}</div>
                      <div className="text-stone-400">{d}</div>
                    </div>
                  </li>
                ))}
              </ul>
              <Link
                href="/crear?plan=nivel_2"
                className="mt-9 inline-block rounded-xl bg-orange-600 px-8 py-4 font-semibold text-white transition-colors hover:bg-orange-700"
              >
                Quiero a Victoria vendiendo por mí →
              </Link>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="px-4 py-20">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <h2
                className="text-3xl font-bold text-stone-900 md:text-4xl"
                style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
              >
                Todo lo que tu negocio necesita en línea
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-stone-500">Una sola herramienta, sin piezas sueltas.</p>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <div key={f.title} className="rounded-2xl border border-stone-200 bg-white p-6">
                  <div className="text-3xl">{f.emoji}</div>
                  <h3 className="mt-3 text-lg font-semibold text-stone-900">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* COMPARATIVA teaser */}
        <section className="bg-white px-4 py-20">
          <div className="mx-auto max-w-4xl rounded-3xl border border-stone-200 bg-gradient-to-br from-stone-50 to-orange-50/40 p-10 text-center md:p-14">
            <h2
              className="text-2xl font-bold text-stone-900 md:text-4xl"
              style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
            >
              ¿Cómo nos comparamos con Wix, Hostinger o una agencia?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-stone-600">
              Hicimos la tarea por ti. Comparativas honestas, punto por punto, contra las opciones
              más conocidas del mercado.
            </p>
            <Link
              href="/comparativa"
              className="mt-8 inline-block rounded-xl border border-stone-300 bg-white px-8 py-3.5 font-semibold text-stone-800 transition-colors hover:border-orange-300 hover:text-orange-700"
            >
              Ver el museo de comparaciones →
            </Link>
          </div>
        </section>

        {/* PROOF */}
        <section className="px-4 py-16">
          <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-3">
            {[
              ['89%', 'de los negocios pequeños aún no tiene sitio web propio'],
              ['24/7', 'Victoria atiende sin descanso, incluso mientras duermes'],
              ['Minutos', 'es lo que tarda tu página en estar publicada'],
            ].map(([big, small]) => (
              <div key={big} className="rounded-2xl border border-stone-200 bg-white p-8 text-center">
                <div
                  className="text-4xl font-bold text-orange-600"
                  style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
                >
                  {big}
                </div>
                <p className="mt-2 text-sm text-stone-600">{small}</p>
              </div>
            ))}
          </div>
        </section>

        {/* PLANES */}
        <section id="planes" className="bg-stone-50 px-4 py-20">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <h2
                className="text-3xl font-bold text-stone-900 md:text-4xl"
                style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
              >
                Empieza gratis. Crece cuando lo necesites.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-stone-500">
                Sin letra chiquita. Sin permanencia. La mitad de lo que cobra la agencia más barata.
              </p>
            </div>
            <div className="mt-14">
              <Pricing />
            </div>
            <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-stone-500">
              Los planes de pago incluyen un tope mensual de conversaciones de Victoria, visible en
              todo momento, con opción de ampliarlo cuando tu negocio lo pida.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-4 py-20">
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <h2
                className="text-3xl font-bold text-stone-900 md:text-4xl"
                style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
              >
                Preguntas frecuentes
              </h2>
            </div>
            <div className="mt-10 divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-white">
              {FAQ.map((item, i) => (
                <details key={i} className="group px-6 py-5 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 text-left font-semibold text-stone-900">
                    {item.q}
                    <span className="text-orange-500 transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 leading-relaxed text-stone-600">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="px-4 pb-24">
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-orange-600 px-6 py-16 text-center text-white md:py-20">
            <div className="pointer-events-none absolute -top-16 -right-10 h-64 w-64 rounded-full bg-orange-400/40 blur-3xl" />
            <h2
              className="relative text-3xl font-bold md:text-5xl"
              style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
            >
              Tu competencia tarda semanas. Tú, minutos.
            </h2>
            <p className="relative mx-auto mt-4 max-w-2xl text-lg text-orange-50">
              Crea la página de tu negocio gratis y deja que Victoria empiece a vender por ti.
            </p>
            <Link
              href="/crear"
              className="relative mt-8 inline-block rounded-xl bg-white px-8 py-4 text-lg font-semibold text-orange-700 shadow-lg transition-transform hover:scale-[1.02]"
            >
              Crear mi sitio gratis →
            </Link>
          </div>
        </section>

        <SiteFooter />
      </div>
    </>
  )
}
