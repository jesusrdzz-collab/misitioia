import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

interface SitePageProps {
  params: Promise<{ slug: string }>
}

/**
 * Página dinámica de un sitio de negocio.
 * Se accede vía subdominio: mi-negocio.misitioia.com
 * El middleware reescribe a /sites/mi-negocio
 *
 * TODO (Fase 1): Cargar datos reales de Supabase por tenant_id
 * TODO (Fase 2): Renderizar plantilla según giro
 * TODO (Fase 3): ISR/SSG para rendimiento
 */
export async function generateMetadata({ params }: SitePageProps): Promise<Metadata> {
  const { slug } = await params

  // TODO: Cargar meta desde Supabase
  return {
    title: `${slug} — MiSitio IA`,
    robots: {
      index: false,
      follow: false,
    },
  }
}

export default async function SitePage({ params }: SitePageProps) {
  const { slug } = await params

  // Placeholder — Fase 1 reemplazará con datos reales de Supabase
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="text-center p-8 max-w-md">
        <div className="text-6xl mb-4">🏪</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {slug.replace(/-/g, ' ')}
        </h1>
        <p className="text-gray-500 text-lg mb-6">
          Sitio en construcción
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          Próximamente disponible
        </div>
        <p className="text-xs text-gray-400 mt-8">
          Creado con{' '}
          <a href="https://misitioia.com" className="underline hover:text-gray-600">
            MiSitio IA
          </a>
        </p>
      </div>
    </main>
  )
}
