import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { SiteNav } from '@/features/marketing/components/SiteNav'
import { SiteFooter } from '@/features/marketing/components/SiteFooter'
import { COMPETITORS } from '@/features/comparativa/competitors'
import { SITE_URL } from '@/features/marketing/brand'

export const metadata: Metadata = {
  title: 'Comparativas: MiSitio IA vs Wix, Hostinger, Squarespace y más',
  description:
    'Comparativas honestas de MiSitio IA frente a Wix, Hostinger AI, Base44, Durable, GoDaddy Airo, Framer, Squarespace y las agencias tradicionales. Punto por punto, sin humo.',
  alternates: { canonical: `${SITE_URL}/comparativa` },
  openGraph: {
    title: 'El museo de comparaciones de MiSitio IA',
    description:
      'MiSitio IA vs las plataformas más conocidas. Comparativas honestas, punto por punto.',
    url: `${SITE_URL}/comparativa`,
    images: [{ url: '/img/comparativa-hero.webp' }],
  },
}

export default function ComparativaIndex() {
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Comparativas de MiSitio IA',
    itemListElement: COMPETITORS.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: `MiSitio IA vs ${c.name}`,
      url: `${SITE_URL}/comparativa/${c.slug}`,
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <div className="flex min-h-screen flex-col bg-[#fdfbf7] text-stone-800">
        <SiteNav />

        <section className="relative overflow-hidden border-b border-stone-200">
          <div className="pointer-events-none absolute -top-24 right-0 h-80 w-80 rounded-full bg-orange-200/40 blur-3xl" />
          <div className="relative mx-auto max-w-4xl px-4 py-16 text-center md:py-20">
            <p className="text-sm font-semibold uppercase tracking-wider text-orange-600">El museo de comparaciones</p>
            <h1
              className="mx-auto mt-3 max-w-3xl text-3xl font-bold leading-tight text-stone-900 md:text-5xl"
              style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
            >
              MiSitio IA frente a todos los demás
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-stone-600">
              Sin exagerar y sin inventar. Reconocemos lo bueno de cada opción y te decimos, punto
              por punto, dónde MiSitio IA hace algo que las demás no: darte una página que además
              atiende y vende sola.
            </p>
          </div>
        </section>

        <section className="px-4 py-16">
          <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2">
            {COMPETITORS.map((c) => (
              <Link
                key={c.slug}
                href={`/comparativa/${c.slug}`}
                className="group flex flex-col rounded-2xl border border-stone-200 bg-white p-7 transition-all hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-500">
                    {c.category}
                  </span>
                  <span className="text-sm text-stone-400 transition-transform group-hover:translate-x-1">→</span>
                </div>
                <h2 className="mt-4 text-xl font-bold text-stone-900">
                  MiSitio IA <span className="text-stone-400">vs</span> {c.name}
                </h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-stone-600">“{c.hook}”</p>
                <span className="mt-4 text-sm font-semibold text-orange-700">Ver la comparativa completa</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="px-4 pb-20">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 rounded-3xl border border-stone-200 bg-white p-8 md:flex-row md:p-10">
            <div className="w-full md:w-1/2">
              <div className="overflow-hidden rounded-2xl border border-stone-200">
                <Image
                  src="/img/comparativa-hero.webp"
                  alt="Comparación de opciones para crear tu sitio web"
                  width={1344}
                  height={768}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <h2
                className="text-2xl font-bold text-stone-900 md:text-3xl"
                style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
              >
                Lo que ninguna de ellas te da
              </h2>
              <p className="mt-3 text-stone-600">
                Un asistente de IA que atiende y vende por ti 24/7, agenda videollamadas y se conecta
                a tu WhatsApp. Todo en español y pensado para negocios de México.
              </p>
              <Link
                href="/registro"
                className="mt-6 inline-block rounded-xl bg-orange-600 px-7 py-3.5 font-semibold text-white transition-colors hover:bg-orange-700"
              >
                Crear mi sitio gratis →
              </Link>
            </div>
          </div>
        </section>

        <SiteFooter />
      </div>
    </>
  )
}
