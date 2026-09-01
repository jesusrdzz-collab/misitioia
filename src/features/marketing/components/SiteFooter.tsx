import Link from 'next/link'
import { BRAND } from '../brand'
import { LogoMark } from './Logo'

/**
 * Footer del producto. Enlaza legales (con alias) y comparativas.
 */
const COMPARATIVAS = [
  { label: 'vs Wix', href: '/comparativa/wix' },
  { label: 'vs Hostinger AI', href: '/comparativa/hostinger-ai' },
  { label: 'vs Base44', href: '/comparativa/base44' },
  { label: 'vs una agencia', href: '/comparativa/agencia-tradicional' },
]

export function SiteFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-stone-800 bg-stone-950 px-4 py-14 text-stone-400">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2">
              <LogoMark className="h-7 w-7 flex-shrink-0" />
              <span
                className="text-base font-bold text-white"
                style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
              >
                {BRAND.name}
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-stone-500">
              La página web que nace lista para la era de la búsqueda con IA. Hecha para negocios de México.
            </p>
            <p className="mt-4 text-xs font-medium text-stone-500">
              {BRAND.name} es {BRAND.parentTagline}, el ecosistema de herramientas que ayuda a tu
              negocio a vender más.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">Producto</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/#como-funciona" className="hover:text-white">Cómo funciona</Link></li>
              <li><Link href="/#victoria" className="hover:text-white">Victoria (IA)</Link></li>
              <li><Link href="/#planes" className="hover:text-white">Planes y precios</Link></li>
              <li><Link href="/crear" className="hover:text-white">Crear mi sitio</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">Comparativas</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {COMPARATIVAS.map((c) => (
                <li key={c.href}><Link href={c.href} className="hover:text-white">{c.label}</Link></li>
              ))}
              <li><Link href="/comparativa" className="font-medium text-orange-400 hover:text-orange-300">Ver todas →</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">Legal</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/aviso-de-privacidad" className="hover:text-white">Aviso de privacidad</Link></li>
              <li><Link href="/terminos" className="hover:text-white">Términos y condiciones</Link></li>
              <li><Link href="/cookies" className="hover:text-white">Política de cookies</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-stone-800 pt-6 text-sm text-stone-500 md:flex-row">
          <span>© {year} {BRAND.name} · {BRAND.parent}. Todos los derechos reservados.</span>
          <span>Hecho con IA en México 🇲🇽</span>
        </div>
      </div>
    </footer>
  )
}
