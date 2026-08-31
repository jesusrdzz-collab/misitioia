import Link from 'next/link'
import { SiteNav } from '../components/SiteNav'
import { SiteFooter } from '../components/SiteFooter'
import type { ProductLegalDoc } from './product-legal'

/**
 * Render de una página legal del producto. Renderiza párrafos y viñetas
 * (líneas que empiezan con "- ").
 */
export function LegalArticle({ doc }: { doc: ProductLegalDoc }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#fdfbf7] text-stone-800">
      <SiteNav />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-14 md:py-20">
        <Link href="/" className="text-sm font-medium text-orange-700 hover:text-orange-800">
          ← Volver al inicio
        </Link>
        <h1
          className="mt-6 text-3xl font-bold text-stone-900 md:text-4xl"
          style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
        >
          {doc.title}
        </h1>
        <p className="mt-2 text-sm text-stone-500">{doc.updated}</p>

        <div className="mt-8 space-y-4">
          {doc.intro.map((p, i) => (
            <p key={i} className="leading-relaxed text-stone-700">{p}</p>
          ))}
        </div>

        <div className="mt-10 space-y-10">
          {doc.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="text-xl font-semibold text-stone-900">{s.heading}</h2>
              <div className="mt-3 space-y-3">
                {renderBody(s.body)}
              </div>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

function renderBody(body: string[]) {
  const out: React.ReactNode[] = []
  let bullets: string[] = []

  const flush = (key: string) => {
    if (bullets.length) {
      out.push(
        <ul key={`ul-${key}`} className="list-disc space-y-1.5 pl-5 text-stone-700">
          {bullets.map((b, i) => (
            <li key={i} className="leading-relaxed">{b.replace(/^-\s*/, '')}</li>
          ))}
        </ul>,
      )
      bullets = []
    }
  }

  body.forEach((line, i) => {
    if (line.startsWith('- ')) {
      bullets.push(line)
    } else {
      flush(`b-${i}`)
      out.push(<p key={`p-${i}`} className="leading-relaxed text-stone-700">{line}</p>)
    }
  })
  flush('end')
  return out
}
