import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { LoginGate } from '@/features/editor/components/LoginGate'
import { LogoMark } from '@/features/marketing/components/Logo'
import { getMyLastWizardSite } from '@/features/wizard/actions'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Crear mi sitio — MiSitio IA',
  robots: { index: false },
}

/**
 * Landing del wizard. Si el cliente no tiene sesión, LoginGate. Si tiene un
 * wizard a medio hacer, ofrece retomar. Si no, redirige al paso 1a.
 */
export default async function CrearLandingPage() {
  const supabase = await createServerSupabase()
  const { data } = await supabase.auth.getUser()

  if (!data.user?.email) {
    return <LoginGate next="/crear" title="Crea tu página" />
  }

  const pending = await getMyLastWizardSite()

  if (!pending) {
    redirect('/crear/paso-1a')
  }

  const resumeHref =
    pending.step === 'paso-1b'
      ? `/crear/paso-1b?site=${pending.siteId}`
      : pending.step === 'paso-2'
        ? `/crear/paso-2?site=${pending.siteId}`
        : `/crear/paso-3?site=${pending.siteId}`

  return (
    <div className="min-h-[100dvh] bg-stone-50 flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex flex-col items-center gap-1">
            <LogoMark className="h-12 w-12" />
            <span className="font-semibold text-neutral-900">MiSitio IA</span>
          </Link>
        </div>
        <div className="bg-white rounded-3xl shadow-xl border border-stone-200 p-8">
          <h1 className="text-2xl font-medium text-neutral-900 mb-2">
            Tienes un sitio a medio configurar
          </h1>
          <p className="text-sm text-stone-600 mb-6">
            Estabas creando <span className="font-semibold">{pending.businessName}</span> y te
            quedaste en <span className="font-semibold">{stepLabel(pending.step)}</span>. ¿Continuar?
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href={resumeHref}
              className="rounded-xl bg-neutral-900 text-white font-semibold px-5 py-3 text-center hover:bg-neutral-800"
            >
              Continuar donde me quedé →
            </Link>
            <Link
              href="/crear/paso-1a"
              className="rounded-xl border border-stone-300 text-neutral-900 font-semibold px-5 py-3 text-center hover:bg-stone-50"
            >
              Empezar uno nuevo
            </Link>
            <Link
              href="/crear-chat"
              className="text-xs text-stone-500 hover:text-neutral-900 text-center underline underline-offset-4 pt-2"
            >
              Prefiero chatear con IA
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function stepLabel(step: string): string {
  switch (step) {
    case 'paso-1b':
      return 'los datos de contacto'
    case 'paso-2':
      return 'la elección de plantilla'
    case 'paso-3':
      return 'las imágenes'
    default:
      return 'la creación'
  }
}
