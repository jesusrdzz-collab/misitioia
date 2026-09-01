import Link from 'next/link'
import { BRAND, NAV_LINKS } from '../brand'
import { LogoMark } from './Logo'

/**
 * Barra de navegación del producto. Sticky, translúcida, con CTA a registro.
 * Server component (sin estado): el menú móvil usa <details> nativo.
 */
export function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/70 bg-[#fdfbf7]/85 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
        <Link href="/" className="flex items-center gap-2">
          <LogoMark className="h-9 w-9 flex-shrink-0" />
          <span className="flex flex-col leading-none">
            <span
              className="text-lg font-bold tracking-tight text-stone-900"
              style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
            >
              {BRAND.name}
            </span>
            <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-stone-400">
              by {BRAND.parent}
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-stone-600 transition-colors hover:text-orange-700"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/editar"
            className="hidden rounded-full px-4 py-2 text-sm font-medium text-stone-600 transition-colors hover:text-stone-900 sm:block"
          >
            Entrar
          </Link>
          <Link
            href="/crear"
            className="rounded-full bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-orange-600/20 transition-colors hover:bg-orange-700"
          >
            Crear mi sitio gratis
          </Link>
        </div>
      </nav>
    </header>
  )
}
