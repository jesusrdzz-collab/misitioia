import { createAdminSupabase } from '@/lib/supabase/server'
import { getSiteBySlug } from '@/lib/sites/queries'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dar de baja mi página — MiSitio IA',
  robots: { index: false, follow: false },
}

interface BajaPageProps {
  params: Promise<{ slug: string }>
}

/**
 * Fase 2.8 — Baja inmediata a un clic, sin preguntar.
 * El dueño puede quitar su página al instante. Al confirmar, el sitio pasa a
 * estado 'dado_de_baja' y la RLS deja de servirlo públicamente.
 */
async function darDeBaja(slug: string) {
  'use server'
  const supabase = await createAdminSupabase()
  await supabase
    .from('sites')
    .update({ status: 'dado_de_baja' })
    .eq('slug', slug)
}

export default async function BajaPage({ params }: BajaPageProps) {
  const { slug } = await params
  const data = await getSiteBySlug(slug)

  // Si ya no existe / ya está dado de baja, mostramos confirmación neutral.
  const yaDeBaja = !data

  const confirmar = darDeBaja.bind(null, slug)

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 p-8 text-center">
        {yaDeBaja ? (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Página dada de baja</h1>
            <p className="text-gray-500">
              Esta página ya no está publicada. Si fue un error, contáctanos y la reactivamos.
            </p>
          </>
        ) : (
          <>
            <div className="text-5xl mb-4">🗑️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              ¿Dar de baja esta página?
            </h1>
            <p className="text-gray-500 mb-6">
              Estás por quitar la página de{' '}
              <span className="font-medium text-gray-700">{data!.site.business_name}</span>. Dejará
              de estar en línea de inmediato. No se pregunta nada más.
            </p>
            <form action={confirmar}>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
              >
                Sí, dar de baja ahora
              </button>
            </form>
            <a
              href={`/sites/${slug}`}
              className="block mt-4 text-sm text-gray-400 hover:text-gray-600"
            >
              No, volver a mi página
            </a>
          </>
        )}
      </div>
    </main>
  )
}
