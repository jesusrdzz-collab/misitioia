import type { Metadata } from 'next'
import Link from 'next/link'
import { LogoLockup } from '@/features/marketing/components/Logo'
import { EntrarForm } from './EntrarForm'

/**
 * Puerta pública de acceso — `/entrar` (11-sep-2026).
 *
 * ¿Por qué existe?
 *  - Victoria (chat de la home de MiSitio) hoy le decía a los clientes
 *    "ve a misitio.site/entrar" pero la URL respondía 404. Con este archivo
 *    la URL existe y el cliente ya vuelve a su editor.
 *  - Es el punto de entrada canónico para "clientes que ya se registraron y
 *    quieren volver a entrar", separado del wizard /crear (nuevos) y de
 *    /editar (que sigue funcionando con LoginGate embebido para quien llega
 *    directo por link magic ya autenticado).
 *
 * El formulario en sí es Client Component (necesita `useState`/`useTransition`
 * para el envío del magic link) — se aísla en `./EntrarForm` para mantener
 * este page.tsx como Server Component y así fijar la metadata sin trampas.
 */

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Entra a tu cuenta',
  description:
    'Vuelve a tu editor de MiSitio IA. Escribe tu correo y te mandamos un link mágico para entrar sin contraseña.',
  robots: { index: false, follow: false },
}

export default function EntrarPage() {
  return (
    <main className="min-h-screen bg-[#fdfbf7] px-4 py-10 sm:py-16">
      <div className="mx-auto flex max-w-md flex-col items-center">
        <Link href="/" className="mb-8 inline-flex items-center gap-2">
          <LogoLockup className="h-14 w-auto" />
        </Link>

        <div className="w-full rounded-3xl border border-stone-200 bg-white p-6 shadow-xl shadow-stone-900/5 sm:p-8">
          <div className="mb-6 text-center">
            <h1
              className="text-2xl font-bold text-stone-900 sm:text-3xl"
              style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
            >
              Entra a tu cuenta
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              Escribe tu correo y te mandamos un link mágico para volver a
              tu editor. No necesitas contraseña.
            </p>
          </div>

          <EntrarForm />

          <div className="mt-6 border-t border-stone-100 pt-5 text-center">
            <Link
              href="/"
              className="text-sm font-medium text-stone-500 transition-colors hover:text-stone-800"
            >
              ← Volver a la portada
            </Link>
          </div>
        </div>

        <p className="mt-6 max-w-sm text-center text-xs text-stone-400">
          ¿Aún no tienes cuenta?{' '}
          <Link
            href="/crear"
            className="font-medium text-orange-700 hover:underline"
          >
            Crear mi sitio gratis
          </Link>
        </p>
      </div>
    </main>
  )
}
