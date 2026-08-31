import Link from 'next/link'

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'misitioia.com'

interface Props {
  businessName: string
  slug: string
  /** Base de rutas ('' en subdominio, '/sites/{slug}' en URL de prueba). */
  base: string
  accent: string
}

/**
 * Footer compartido por el sitio y sus páginas legales. Enlaza las tres
 * páginas legales, la baja del sitio y la marca MiSitio IA.
 */
export function SiteFooter({ businessName, slug, base, accent }: Props) {
  const year = new Date().getFullYear()
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          <div className="max-w-sm">
            <p
              className="text-lg font-semibold text-white"
              style={{ fontFamily: 'var(--font-display), serif' }}
            >
              {businessName}
            </p>
            <p className="mt-2 text-sm text-gray-400">
              Página creada con{' '}
              <a
                href={`https://${ROOT_DOMAIN}`}
                className="underline decoration-gray-600 hover:text-white transition-colors"
              >
                MiSitio IA
              </a>
              .
            </p>
          </div>

          <nav className="flex flex-col gap-2 text-sm">
            <span className="text-xs uppercase tracking-wider text-gray-500 mb-1">Legal</span>
            <Link href={`${base}/terminos`} className="hover:text-white transition-colors">
              Términos y Condiciones
            </Link>
            <Link
              href={`${base}/aviso-de-privacidad`}
              className="hover:text-white transition-colors"
            >
              Aviso de Privacidad
            </Link>
            <Link href={`${base}/cookies`} className="hover:text-white transition-colors">
              Política de Cookies
            </Link>
          </nav>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <span>© {year} {businessName}. Todos los derechos reservados.</span>
          <span>
            ¿Es tu negocio y no quieres esta página?{' '}
            <Link
              href={`/baja/${slug}`}
              className="underline hover:text-gray-300 transition-colors"
              style={{ color: accent }}
            >
              Darla de baja
            </Link>
          </span>
        </div>
      </div>
    </footer>
  )
}
