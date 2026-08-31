import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase/server'
import { authorizeSiteAccess, listSitesForOwner } from '@/features/editor/authorize'
import { EditorWorkspace } from '@/features/editor/components/EditorWorkspace'
import { LoginGate } from '@/features/editor/components/LoginGate'
import { ClaimForm } from '@/features/editor/components/ClaimForm'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Editar mi sitio — MiSitio IA', robots: { index: false } }

interface Props {
  searchParams: Promise<{ site?: string; error?: string }>
}

export default async function EditarPage({ searchParams }: Props) {
  const { site: siteParam } = await searchParams

  const supabase = await createServerSupabase()
  const { data } = await supabase.auth.getUser()
  const email = data.user?.email

  if (!email) {
    return <LoginGate next="/editar" title="Entra a tu panel" />
  }

  // Sitio específico solicitado y autorizado → abrir editor
  if (siteParam) {
    const authorized = await authorizeSiteAccess(siteParam, email)
    if (authorized) {
      return (
        <EditorWorkspace
          mode="edit"
          initialSiteId={authorized.siteId}
          initialSlug={authorized.slug}
          businessName={authorized.businessName}
        />
      )
    }
  }

  const sites = await listSitesForOwner(email)

  // Un solo sitio → abrir directo
  if (sites.length === 1) {
    const s = sites[0]
    return (
      <EditorWorkspace
        mode="edit"
        initialSiteId={s.siteId}
        initialSlug={s.slug}
        businessName={s.businessName}
      />
    )
  }

  // Varios sitios → selector
  if (sites.length > 1) {
    return (
      <SelectorShell email={email}>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tus sitios</h2>
        <ul className="space-y-2">
          {sites.map((s) => (
            <li key={s.siteId}>
              <Link
                href={`/editar?site=${s.siteId}`}
                className="block p-4 rounded-xl border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                <div className="font-medium text-gray-900">{s.businessName}</div>
                <div className="text-sm text-gray-400">{s.slug} · {s.status}</div>
              </Link>
            </li>
          ))}
        </ul>
      </SelectorShell>
    )
  }

  // Sin sitios → reclamar o crear
  return (
    <SelectorShell email={email}>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Aún no tienes un sitio</h2>
      <p className="text-sm text-gray-500 mb-5">
        Si ya te generamos una página, reclámala con su subdominio. Si no, créala desde cero.
      </p>
      <ClaimForm />
      <div className="mt-6 pt-6 border-t border-gray-100 text-center">
        <Link href="/crear" className="text-blue-600 font-medium hover:underline">
          Crear un sitio nuevo →
        </Link>
      </div>
    </SelectorShell>
  )
}

function SelectorShell({ email, children }: { email: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-3xl mb-2">🛠️</div>
          <p className="text-sm text-gray-400">Sesión: {email}</p>
        </div>
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">{children}</div>
      </div>
    </div>
  )
}
