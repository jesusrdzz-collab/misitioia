import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteNav } from '@/features/marketing/components/SiteNav'
import { SiteFooter } from '@/features/marketing/components/SiteFooter'
import { Pricing } from '@/features/marketing/components/Pricing'
import {
  COMPETITORS,
  getCompetitor,
  competitorSlugs,
  type Cell,
} from '@/features/comparativa/competitors'
import { BRAND, SITE_URL } from '@/features/marketing/brand'

export const dynamicParams = false

export function generateStaticParams() {
  return competitorSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const c = getCompetitor(slug)
  if (!c) return {}
  return {
    title: c.metaTitle,
    description: c.metaDescription,
    alternates: { canonical: `${SITE_URL}/comparativa/${c.slug}` },
    openGraph: {
      title: c.metaTitle,
      description: c.metaDescription,
      url: `${SITE_URL}/comparativa/${c.slug}`,
      images: [{ url: '/img/comparativa-hero.webp' }],
    },
  }
}

function CellMark({ value }: { value: Cell }) {
  if (value === 'yes') return <span className="font-bold text-emerald-600">✓</span>
  if (value === 'partial') return <span className="font-bold text-amber-500">~</span>
  return <span className="font-bold text-stone-300">✕</span>
}

export default async function CompetitorPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const c = getCompetitor(slug)
  if (!c) notFound()

  const others = COMPETITORS.filter((x) => x.slug !== c.slug).slice(0, 3)

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `¿Qué diferencia a MiSitio IA de ${c.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${c.closing.join(' ')}`,
        },
      },
      {
        '@type': 'Question',
        name: `¿Para quién es mejor ${c.name}?`,
        acceptedAnswer: { '@type': 'Answer', text: c.bestFor },
      },
    ],
  }
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Comparativa', item: `${SITE_URL}/comparativa` },
      { '@type': 'ListItem', position: 3, name: `vs ${c.name}`, item: `${SITE_URL}/comparativa/${c.slug}` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <div className="flex min-h-screen flex-col bg-[#fdfbf7] text-stone-800">
        <SiteNav />

        <main className="flex-1">
          {/* Encabezado + dolor */}
          <section className="border-b border-stone-200 px-4 py-14 md:py-20">
            <div className="mx-auto max-w-3xl">
              <nav className="flex items-center gap-2 text-sm text-stone-500">
                <Link href="/comparativa" className="hover:text-orange-700">Comparativas</Link>
                <span>/</span>
                <span className="text-stone-700">vs {c.name}</span>
              </nav>
              <span className="mt-6 inline-block rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-500">
                {c.category}
              </span>
              <h1
                className="mt-4 text-3xl font-bold leading-tight text-stone-900 md:text-5xl"
                style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
              >
                {c.painTitle}
              </h1>
              <div className="mt-6 space-y-4 text-lg leading-relaxed text-stone-700">
                {c.pain.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          </section>

          {/* Reconocimiento honesto */}
          <section className="px-4 py-12">
            <div className="mx-auto max-w-3xl rounded-2xl border border-stone-200 bg-white p-7">
              <h2 className="text-lg font-semibold text-stone-900">Seamos justos con {c.name}</h2>
              <p className="mt-3 leading-relaxed text-stone-600">{c.fair}</p>
              <p className="mt-4 text-sm text-stone-500">
                <span className="font-semibold text-stone-700">Ideal para:</span> {c.bestFor}
              </p>
            </div>
          </section>

          {/* Tabla comparativa */}
          <section className="px-4 py-8">
            <div className="mx-auto max-w-3xl">
              <h2
                className="text-2xl font-bold text-stone-900 md:text-3xl"
                style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
              >
                Punto por punto
              </h2>
              <div className="mt-6 overflow-x-auto rounded-2xl border border-stone-200 bg-white">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-stone-200 bg-stone-50">
                      <th className="px-4 py-4 font-semibold text-stone-700">Característica</th>
                      <th className="px-4 py-4 text-center font-semibold text-orange-700">MiSitio IA</th>
                      <th className="px-4 py-4 text-center font-semibold text-stone-600">{c.name}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {c.rows.map((r, i) => (
                      <tr key={i} className="border-b border-stone-100 last:border-0">
                        <td className="px-4 py-4 text-stone-700">{r.feature}</td>
                        <td className="px-4 py-4 text-center text-lg"><CellMark value={r.us} /></td>
                        <td className="px-4 py-4 text-center">
                          <div className="text-lg"><CellMark value={r.them} /></div>
                          {r.themNote && (
                            <div className="mt-1 text-xs leading-snug text-stone-400">{r.themNote}</div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-stone-400">
                ✓ Sí · ~ Parcial o con condiciones · ✕ No. Comparación basada en el enfoque de cada
                producto; las funciones de cada plataforma pueden cambiar.
              </p>
            </div>
          </section>

          {/* Cierre diferencial */}
          <section className="px-4 py-12">
            <div className="mx-auto max-w-3xl rounded-3xl bg-stone-950 p-8 text-white md:p-12">
              <h2
                className="text-2xl font-bold md:text-3xl"
                style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
              >
                La diferencia que de verdad importa
              </h2>
              <div className="mt-4 space-y-4 text-lg leading-relaxed text-stone-300">
                {c.closing.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              <Link
                href="/crear"
                className="mt-8 inline-block rounded-xl bg-orange-600 px-8 py-4 font-semibold text-white transition-colors hover:bg-orange-700"
              >
                Crear mi sitio gratis con {BRAND.name} →
              </Link>
            </div>
          </section>

          {/* Planes */}
          <section className="px-4 py-12">
            <div className="mx-auto max-w-5xl">
              <h2
                className="text-center text-2xl font-bold text-stone-900 md:text-3xl"
                style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
              >
                Empieza gratis hoy
              </h2>
              <div className="mt-10">
                <Pricing />
              </div>
            </div>
          </section>

          {/* Otras comparativas */}
          <section className="px-4 py-12">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-lg font-semibold text-stone-900">Sigue comparando</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {others.map((o) => (
                  <Link
                    key={o.slug}
                    href={`/comparativa/${o.slug}`}
                    className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-700 transition-colors hover:border-orange-200 hover:text-orange-700"
                  >
                    vs {o.name} →
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </main>

        <SiteFooter />
      </div>
    </>
  )
}
