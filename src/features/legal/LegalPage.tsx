import Link from 'next/link'
import type { BusinessView } from '@/features/sites/business'
import type { LegalDoc } from './legal-content'
import { SiteFooter } from '@/features/sites/components/SiteFooter'

interface Props {
  doc: LegalDoc
  business: BusinessView
  base: string
}

function renderBody(body: string[], accent: string) {
  const blocks: React.ReactNode[] = []
  let bullets: string[] = []

  const flush = (key: string) => {
    if (bullets.length) {
      blocks.push(
        <ul key={key} className="my-3 space-y-2 pl-1">
          {bullets.map((b, i) => (
            <li key={i} className="flex gap-2 text-gray-600 leading-relaxed">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: accent }} />
              <span>{b.replace(/^- /, '')}</span>
            </li>
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
      flush(`ul-${i}`)
      blocks.push(
        <p key={`p-${i}`} className="my-3 text-gray-600 leading-relaxed">
          {line}
        </p>,
      )
    }
  })
  flush('ul-end')
  return blocks
}

/** Página legal con branding del sitio (color del giro) + footer compartido. */
export function LegalPage({ doc, business, base }: Props) {
  return (
    <main
      className="min-h-screen bg-white text-gray-800 flex flex-col"
      style={{ fontFamily: 'var(--font-body), ui-sans-serif, system-ui, sans-serif' }}
    >
      <header
        className="text-white"
        style={{
          background: `linear-gradient(135deg, ${business.primaryColor}, ${business.accentColor})`,
        }}
      >
        <div className="max-w-3xl mx-auto px-6 py-10 md:py-14">
          <Link
            href={base || '/'}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm transition-colors"
          >
            <span aria-hidden>←</span> Volver al inicio
          </Link>
          <h1
            className="mt-4 text-3xl md:text-4xl font-bold leading-tight"
            style={{ fontFamily: 'var(--font-display), serif' }}
          >
            {doc.title}
          </h1>
          <p className="mt-2 text-white/80 text-sm">
            {business.name} · {doc.updated}
          </p>
        </div>
      </header>

      <article className="flex-1 max-w-3xl mx-auto px-6 py-12 md:py-16 w-full">
        {doc.intro.map((p, i) => (
          <p key={i} className="mb-4 text-gray-600 leading-relaxed">
            {p}
          </p>
        ))}

        {doc.sections.map((section, i) => (
          <section key={i} className="mt-8">
            <h2
              className="text-xl font-semibold text-gray-900 mb-2"
              style={{ fontFamily: 'var(--font-display), serif' }}
            >
              {section.heading}
            </h2>
            {renderBody(section.body, business.accentColor)}
          </section>
        ))}

        <div className="mt-12 flex flex-wrap gap-4 text-sm">
          <Link
            href={`${base}/terminos`}
            className="text-gray-500 hover:text-gray-900 underline transition-colors"
          >
            Términos
          </Link>
          <Link
            href={`${base}/aviso-de-privacidad`}
            className="text-gray-500 hover:text-gray-900 underline transition-colors"
          >
            Aviso de Privacidad
          </Link>
          <Link
            href={`${base}/cookies`}
            className="text-gray-500 hover:text-gray-900 underline transition-colors"
          >
            Cookies
          </Link>
        </div>
      </article>

      <SiteFooter
        businessName={business.name}
        slug={business.slug}
        base={base}
        accent={business.accentColor}
      />
    </main>
  )
}
