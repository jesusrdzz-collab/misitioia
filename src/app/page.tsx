import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { SiteNav } from '@/features/marketing/components/SiteNav'
import { SiteFooter } from '@/features/marketing/components/SiteFooter'
import { Pricing } from '@/features/marketing/components/Pricing'
import { Timeline } from '@/features/marketing/components/Timeline'
import { FAQ } from '@/features/marketing/data/faq'
import { SITE_URL } from '@/features/marketing/brand'
import { VictoriaWidget } from '@/features/sites/components/VictoriaWidget'
import {
  organizationJsonLd,
  softwareApplicationJsonLd,
  faqPageJsonLd,
  jsonLdScript,
} from '@/features/marketing/structured-data'

export const metadata: Metadata = {
  title: 'MiSitio IA — Tu página web lista para la era de la búsqueda con IA',
  description:
    'La forma de buscar cambió: cada vez menos Google, cada vez más preguntarle a ChatGPT, Gemini o Perplexity qué comprar. La mayoría de las webs son invisibles para esos buscadores de IA. MiSitio IA crea la tuya optimizada para ellos (AEO) y te la entrega gratis. Victoria, el asistente que atiende y vende 24/7, es el complemento opcional.',
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: 'MiSitio IA — La página web que nace lista para la búsqueda con IA',
    description:
      'Optimizada para los nuevos buscadores de IA (ChatGPT, Gemini, Perplexity), gratis. Victoria, tu asistente que vende 24/7, es el complemento opcional.',
    url: SITE_URL,
    siteName: 'MiSitio IA',
    locale: 'es_MX',
    type: 'website',
    images: [{ url: '/img/og-image.webp', width: 1344, height: 768, alt: 'MiSitio IA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MiSitio IA — La página web que nace lista para la búsqueda con IA',
    description: 'Optimizada para los buscadores de IA, gratis. Victoria (IA) es el complemento opcional.',
    images: ['/img/og-image.webp'],
  },
}

const STEPS = [
  {
    n: '1',
    emoji: '💬',
    title: 'Dile qué quieres',
    desc: 'Le platicas a la guía de IA qué necesitas. ¿No sabes ni por dónde empezar? Solo dile qué tipo de negocio tienes y ella fabrica todo por ti.',
  },
  {
    n: '2',
    emoji: '✨',
    title: 'La IA arma tu sitio gratis',
    desc: 'En minutos tienes una página profesional, lista para Google y para los buscadores de IA. Sin diseñadores, sin costo, sin esperar semanas.',
  },
  {
    n: '3',
    emoji: '🚀',
    title: 'Publica y (si quieres) automatiza',
    desc: 'Ajusta lo que quieras y publica al instante. Cuando estés listo, activa a Victoria para que atienda y venda por ti 24/7.',
  },
]

const FEATURES = [
  { emoji: '🤖', title: 'Lista para los buscadores de IA', desc: 'Nace optimizada (AEO) para que ChatGPT, Gemini y Perplexity la entiendan y te recomienden.' },
  { emoji: '🔎', title: 'Y también para Google', desc: 'SEO técnico bien hecho desde el primer día, para que te encuentren en todos lados.' },
  { emoji: '⚡', title: 'Lista en minutos', desc: 'Nada de esperar semanas a un desarrollador. Tu página existe y funciona el mismo día.' },
  { emoji: '📱', title: 'Perfecta en el celular', desc: 'Se ve impecable en cualquier teléfono, que es donde tus clientes te van a buscar.' },
  { emoji: '🧾', title: 'Catálogo con tus productos', desc: 'Muestra lo que vendes con precios y fotos. Actualízalo cuando quieras.' },
  { emoji: '🔒', title: 'Tus datos, protegidos', desc: 'Cumplimos la Ley Federal de Protección de Datos. Tú eres dueño de tu contenido.' },
]

export default function HomePage() {
  // Victoria en la propia home (modo self): sólo si el token dedicado de MiSitio
  // está aprovisionado en el entorno. El token NUNCA llega al cliente: pasamos
  // sólo el booleano; el widget postea { self:true } y el server resuelve el token.
  const hasVictoria = Boolean(process.env.KONNEX_SELF_WEBCHAT_TOKEN)

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
                La nueva era de la búsqueda con IA ya empezó
              </div>
              <h1
                className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight text-stone-900 md:text-6xl"
                style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
              >
                Ya no solo se googlea: la gente{' '}
                <span className="text-orange-600">le pregunta a la IA qué comprar</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-stone-600">
                La mayoría de las páginas de hoy son <strong className="font-semibold text-stone-800">invisibles</strong>{' '}
                para ChatGPT, Gemini y Perplexity. MiSitio IA crea la tuya{' '}
                <strong className="font-semibold text-stone-800">lista para esos buscadores de IA</strong> (AEO)
                — y te la entrega <strong className="font-semibold text-stone-800">gratis</strong>.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/crear"
                  className="rounded-xl bg-orange-600 px-8 py-4 text-center text-lg font-semibold text-white shadow-lg shadow-orange-600/25 transition-colors hover:bg-orange-700"
                >
                  Crear mi sitio gratis →
                </Link>
                <Link
                  href="#era-ia"
                  className="rounded-xl border border-stone-300 px-8 py-4 text-center text-lg font-medium text-stone-700 transition-colors hover:bg-white"
                >
                  Cómo cambió la búsqueda
                </Link>
              </div>
              <p className="mt-4 text-sm text-stone-500">
                Gratis de verdad. Sin tarjeta. Sin permanencia. Tu página lista hoy mismo.
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
                <div className="text-xs text-stone-500">Un cliente, hoy</div>
                <div className="text-sm font-semibold text-stone-800">“Oye IA, ¿dónde compro esto cerca? 🤔”</div>
              </div>
            </div>
          </div>
        </section>

        {/* EL PUNTO DE FLEXIÓN — problema */}
        <section id="era-ia" className="border-y border-stone-200 bg-white px-4 py-20">
          <div className="mx-auto grid max-w-6xl items-center gap-14 md:grid-cols-2">
            <div className="relative order-2 md:order-1">
              <div className="overflow-hidden rounded-3xl border border-stone-200 shadow-2xl shadow-stone-300/40">
                <Image
                  src="/img/era-ia.webp"
                  alt="Dueña de negocio viendo cómo un asistente de IA recomienda su producto a un cliente"
                  width={1344}
                  height={896}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            <div className="order-1 md:order-2">
              <p className="text-sm font-semibold uppercase tracking-wider text-orange-600">El punto de flexión</p>
              <h2
                className="mt-3 text-2xl font-bold leading-snug text-stone-900 md:text-4xl"
                style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
              >
                Tu web puede verse bonita y aun así ser <span className="text-orange-600">invisible para la IA.</span>
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-stone-600">
                La forma en que la gente busca y compra está cambiando: cada vez menos Google, cada vez
                más “pregúntale a la IA qué comprar” — y pronto le pedirán a la IA que compre por ellos.
                El problema es que los asistentes de IA solo recomiendan lo que <em>entienden</em>, y la
                mayoría de las páginas no están hechas para que las entiendan.
              </p>
              <p className="mt-4 text-lg leading-relaxed text-stone-600">
                Las páginas que hicieron en otro lado nacieron para la era anterior. La tuya, con
                MiSitio IA, <strong className="font-semibold text-stone-800">nace lista para esta</strong>.
              </p>
            </div>
          </div>
        </section>

        {/* TIMELINE — educativo */}
        <section className="px-4 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <h2
                className="text-3xl font-bold text-stone-900 md:text-4xl"
                style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
              >
                Cómo cambió la forma de encontrar un negocio
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-stone-500">
                Cada época tuvo su forma de buscar. La que no se adaptó, desapareció del mapa. Esta es
                la nueva.
              </p>
            </div>
            <div className="mx-auto mt-10 max-w-md overflow-hidden rounded-3xl border border-stone-200 shadow-xl shadow-stone-300/40">
              <Image
                src="/img/busqueda-ia.webp"
                alt="Una persona le pregunta a un asistente de voz con IA desde su teléfono"
                width={1344}
                height={896}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="mt-14">
              <Timeline />
            </div>
            <p className="mx-auto mt-14 max-w-2xl text-center text-lg font-medium text-stone-700">
              Estamos en el punto de flexión. Tu página con MiSitio IA{' '}
              <span className="text-orange-600">ya está preparada para el nuevo nivel.</span>
            </p>
          </div>
        </section>

        {/* PRUEBA TÚ MISMO */}
        <section className="px-4 py-20">
          <div className="mx-auto max-w-4xl overflow-hidden rounded-[2rem] border border-stone-800 bg-stone-950 px-6 py-14 text-white shadow-2xl shadow-stone-400/30 md:px-14">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-orange-400">La prueba honesta</p>
              <h2
                className="mx-auto mt-3 max-w-2xl text-3xl font-bold leading-tight md:text-4xl"
                style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
              >
                ¿No nos crees? Compruébalo con tu negocio ahora mismo.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-stone-300">
                Toma 30 segundos. Es la prueba más honesta que te podemos recomendar.
              </p>
            </div>

            <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-stone-700 bg-stone-900 p-5">
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                Tú, en ChatGPT o Gemini
              </div>
              <p className="mt-3 text-lg text-stone-100">
                “¿Dónde compro <span className="text-orange-400">[lo que tú vendes]</span> al mejor precio en <span className="text-orange-400">[tu ciudad]</span>?”
              </p>
            </div>

            <div className="mx-auto mt-8 grid max-w-2xl gap-4 sm:grid-cols-3">
              {[
                { n: '1', t: 'Abre ChatGPT o Gemini', d: 'En tu celular, ahora mismo.' },
                { n: '2', t: 'Pregunta como cliente', d: 'Por un producto que tú vendes, en tu ciudad.' },
                { n: '3', t: 'Mira quién aparece', d: '¿Estás tú… o solo tu competencia?' },
              ].map((s) => (
                <div key={s.n} className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5 text-center">
                  <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-orange-600 text-sm font-bold">
                    {s.n}
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-white">{s.t}</h3>
                  <p className="mt-1 text-sm text-stone-400">{s.d}</p>
                </div>
              ))}
            </div>

            <p className="mx-auto mt-10 max-w-2xl text-center text-lg text-stone-200">
              Si no apareces, no es que no existas: eres{' '}
              <span className="font-semibold text-orange-400">invisible para la IA</span>. Y en ese
              momento, alguien que quería comprarte le está comprando a quien la IA sí recomendó.{' '}
              <span className="font-semibold text-white">MiSitio IA te hace aparecer.</span>
            </p>

            <div className="mt-9 text-center">
              <Link
                href="/crear"
                className="inline-block rounded-xl bg-orange-600 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-orange-900/40 transition-colors hover:bg-orange-500"
              >
                Crear mi sitio gratis →
              </Link>
            </div>
          </div>
        </section>

        {/* GRATIS + FÁCIL */}
        <section id="gratis" className="bg-white px-4 py-20">
          <div className="mx-auto grid max-w-6xl items-center gap-14 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-orange-600">Gratis y facilísimo</p>
              <h2
                className="mt-3 text-2xl font-bold leading-snug text-stone-900 md:text-4xl"
                style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
              >
                Otros te cobran por hacerte una web. Nosotros te la <span className="text-orange-600">regalamos.</span>
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-stone-600">
                Un profesional o una app de las de siempre te cobran miles de pesos por una página. Aquí
                te la entregamos <strong className="font-semibold text-stone-800">gratis, sin pedirte nada a cambio</strong>.
                Sin tarjeta, sin prueba con fecha de vencimiento, sin letra chiquita.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  ['🗣️', 'Solo dices qué quieres', 'Le platicas a la guía de IA lo que necesitas y te lo arma. Tú mandas, ella construye.'],
                  ['🏪', '¿No sabes por dónde empezar?', 'Dile nada más qué tipo de negocio tienes y la IA fabrica todo: textos, secciones y catálogo.'],
                  ['💸', 'Cero costo, para siempre', 'Tu página en un subdominio nuestro, bien hecha y lista para la IA, sin pagar un peso.'],
                ].map(([e, t, d]) => (
                  <li key={t} className="flex items-start gap-4">
                    <span className="text-2xl">{e}</span>
                    <div>
                      <div className="font-semibold text-stone-900">{t}</div>
                      <div className="text-stone-600">{d}</div>
                    </div>
                  </li>
                ))}
              </ul>
              <Link
                href="/crear"
                className="mt-9 inline-block rounded-xl bg-orange-600 px-8 py-4 font-semibold text-white transition-colors hover:bg-orange-700"
              >
                Crear mi sitio gratis →
              </Link>
            </div>
            <div className="relative">
              <div className="overflow-hidden rounded-3xl border border-stone-200 shadow-2xl shadow-stone-300/40">
                <Image
                  src="/img/facil-crear.webp"
                  alt="Dueño de un negocio mexicano viendo cómo la IA arma su sitio web mientras platica con la guía"
                  width={1344}
                  height={896}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
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
                De una idea a tu página, en 3 pasos
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

        {/* VICTORIA — el complemento de automatización (add-on opcional) */}
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
                ✨ El complemento de automatización (opcional)
              </div>
              <h2
                className="mt-5 text-3xl font-bold leading-tight md:text-5xl"
                style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
              >
                ¿Quieres que además venda sola? Conoce a Victoria
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-stone-300">
                Tu página es gratis y es tuya. Victoria es el paso opcional: el asistente de IA que
                convierte tu sitio en un vendedor 24/7. Ya lleva meses vendiendo de verdad en otros
                negocios; conoce tu catálogo, tus precios y tus horarios, contesta en español con la
                voz de tu marca — y cuando el cliente está listo, agenda una videollamada o te pasa la
                conversación para que cierres tú. Pruébala gratis y actívala cuando la ocupes.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  ['🕐', 'Atiende 24/7', 'Ni un mensaje sin respuesta, ni de madrugada ni en domingo.'],
                  ['🎥', 'Agenda videollamadas', 'Coordina reuniones por video con tus clientes automáticamente.'],
                  ['🤝', 'Relevo humano', 'Cuando quieras, tomas la conversación tú mismo. Victoria se hace a un lado.'],
                  ['📲', 'También en tu WhatsApp', 'Victoria también puede contestar desde tu número de WhatsApp.'],
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
                href="/crear?plan=emprende"
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
              ['Gratis', 'tu página lista para la IA, sin pagar un peso'],
              ['Minutos', 'es lo que tarda tu página en estar publicada'],
              ['24/7', 'Victoria vende por ti cuando decides activarla'],
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
                La web es gratis. Automatizar es opcional.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-stone-500">
                Empieza gratis con tu sitio listo para la IA. Sube de plan solo cuando quieras que
                Victoria atienda más conversaciones al mes.
              </p>
            </div>
            <div className="mt-14">
              <Pricing />
            </div>
            <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-stone-500">
              La diferencia entre planes es cuántas conversaciones atiende Victoria al mes. Si se te
              acaban, sigues con créditos del monedero Konnex, sin cortar la venta. Precios en USD
              (aprox. en pesos, 1 USD ≈ 20 MXN).
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
              La búsqueda ya cambió. Que tu página no se quede atrás.
            </h2>
            <p className="relative mx-auto mt-4 max-w-2xl text-lg text-orange-50">
              Crea gratis la página de tu negocio, lista para la era de la IA. Y cuando quieras, deja
              que Victoria empiece a vender por ti.
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

      {hasVictoria && <VictoriaWidget mode="self" primaryColor="#ea580c" />}
    </>
  )
}
