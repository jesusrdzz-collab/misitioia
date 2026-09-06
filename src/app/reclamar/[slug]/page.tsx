import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getSiteBySlug, getCanonicalSlugForLegacy } from '@/lib/sites/queries'
import { ClaimForm } from '@/features/claims/ClaimForm'
import { BRAND, ROOT_DOMAIN } from '@/features/marketing/brand'

/**
 * "Reclama tu página" — flujo público para que un dueño pida tomar control
 * del sitio de su negocio. Sustituye al botón anónimo de "darla de baja".
 * Un humano revisa cada solicitud con la evidencia adjunta.
 */

export const metadata: Metadata = {
  title: `Reclamar mi página — ${BRAND.name}`,
  description:
    'Si tu negocio ya tiene una página publicada en MiSitio IA y quieres tomar control, envíanos tus datos y evidencia. Un humano revisará y te contactará.',
  robots: { index: false, follow: false },
}

interface Props {
  params: Promise<{ slug: string }>
}

export default async function ReclamarPage({ params }: Props) {
  const { slug: rawSlug } = await params

  // Compat con slug legacy con guion → si no existe, buscamos su canónico.
  let data = await getSiteBySlug(rawSlug)
  let slug = rawSlug
  if (!data && rawSlug.includes('-')) {
    const canonical = await getCanonicalSlugForLegacy(rawSlug)
    if (canonical) {
      data = await getSiteBySlug(canonical)
      slug = canonical
    }
  }

  if (!data) notFound()

  const { site } = data
  const siteUrl = `https://${slug}.${ROOT_DOMAIN}`

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 text-gray-900">
      <div className="mx-auto max-w-2xl">
        <Link
          href={siteUrl}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <span aria-hidden>←</span> Volver a la página del negocio
        </Link>

        <header className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            {BRAND.name}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Reclama tu página
          </h1>
          <p className="mt-3 text-gray-600 leading-relaxed">
            Vas a solicitar tomar control de la página de{' '}
            <strong className="text-gray-900">{site.business_name}</strong>{' '}
            ({siteUrl}). Un humano revisará tu solicitud con la evidencia que
            adjuntes y te contactará en 24–48 horas.
          </p>
        </header>

        <section className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">Por qué pedimos evidencia</p>
          <p className="mt-1 leading-relaxed">
            La página se armó con datos públicos y aún no está reclamada.
            Antes de entregarla o darla de baja, verificamos que quien la
            pide sea realmente del negocio — así protegemos al dueño legítimo
            de que un tercero cambie o quite su página sin permiso.
          </p>
        </section>

        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <ClaimForm slug={slug} businessName={site.business_name} />
        </section>

        <p className="mt-6 text-xs text-gray-500 leading-relaxed">
          Si eres el dueño y quieres editar tu página, entra por{' '}
          <Link
            href={`https://${ROOT_DOMAIN}/editar`}
            className="underline hover:text-gray-800"
          >
            {ROOT_DOMAIN}/editar
          </Link>{' '}
          con la misma cuenta con la que registraste el negocio.
        </p>
      </div>
    </main>
  )
}
