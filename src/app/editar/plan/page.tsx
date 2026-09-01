import { createAdminSupabase } from '@/lib/supabase/server'
import { LoginGate } from '@/features/editor/components/LoginGate'
import { DashboardShell } from '@/features/dashboard/components/DashboardShell'
import { resolveDashboardSite } from '@/features/dashboard/resolve-site'
import { PLANS, BRAND, type Plan } from '@/features/marketing/brand'
import type { PlanLevel } from '@/lib/types/site'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Mi plan — MiSitio IA', robots: { index: false } }

interface Props {
  searchParams: Promise<{ site?: string }>
}

/**
 * Mapeo del plan almacenado (tenants.plan, 3 niveles legacy) al plan de display
 * (PLANS, 4 tarjetas). Solo para resaltar el plan actual.
 * TODO: cuando se unifique el modelo de planes (y se conecte Stripe), la BD
 * debería guardar directamente el id de PLANS ('free'|'emprende'|'crece'|'pro').
 */
const PLAN_LEVEL_TO_ID: Record<PlanLevel, Plan['id']> = {
  gratis: 'free',
  nivel_2: 'emprende',
  nivel_3: 'crece',
}

export default async function PlanPage({ searchParams }: Props) {
  const { site: siteParam } = await searchParams
  const resolved = await resolveDashboardSite(siteParam)

  if (resolved.status === 'no-auth') {
    return <LoginGate next="/editar/plan" title="Entra a tu panel" />
  }

  const { site } = resolved
  const admin = await createAdminSupabase()
  const { data: tenant } = await admin
    .from('tenants')
    .select('plan')
    .eq('id', site.tenantId)
    .maybeSingle()

  const planLevel = ((tenant as { plan: PlanLevel } | null)?.plan ?? 'gratis') as PlanLevel
  const currentId = PLAN_LEVEL_TO_ID[planLevel] ?? 'free'
  const currentPlan = PLANS.find((p) => p.id === currentId) ?? PLANS[0]

  // TODO(Stripe): el checkout aún no está conectado. El CTA "Subir de plan"
  // abre un correo a soporte; reemplazar por el flujo de pago cuando exista.
  const upgradeHref = (p: Plan) =>
    `mailto:${BRAND.email}?subject=${encodeURIComponent(`Subir a plan ${p.label} — ${site.businessName}`)}&body=${encodeURIComponent(
      `Hola, quiero subir mi sitio ${site.slug}.${BRAND.domain} al plan ${p.label}.`,
    )}`

  return (
    <DashboardShell active="plan" siteId={site.siteId} slug={site.slug} businessName={site.businessName}>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Mi plan</h1>
        <p className="text-gray-500 text-sm mt-1">
          Estás en el plan <strong className="text-gray-900">{currentPlan.label}</strong> —{' '}
          {currentPlan.conversations} conversaciones de Victoria al mes.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PLANS.map((p) => {
          const isCurrent = p.id === currentId
          return (
            <div
              key={p.id}
              className={`relative rounded-2xl border p-5 md:p-6 flex flex-col ${
                isCurrent ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-200' : 'border-gray-200 bg-white'
              }`}
            >
              {p.badge && !isCurrent && (
                <span className="absolute top-4 right-4 rounded-full bg-blue-100 text-blue-700 text-[10px] font-semibold px-2 py-0.5 uppercase tracking-wide">
                  {p.badge}
                </span>
              )}
              {isCurrent && (
                <span className="absolute top-4 right-4 rounded-full bg-blue-600 text-white text-[10px] font-semibold px-2 py-0.5 uppercase tracking-wide">
                  Plan actual
                </span>
              )}

              <h2 className="text-lg font-bold text-gray-900">{p.label}</h2>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-gray-900">{p.price}</span>
                <span className="text-sm text-gray-400">
                  {p.currency ? `${p.currency} ` : ''}{p.priceNote}
                </span>
              </div>
              {p.priceApprox && <p className="text-xs text-gray-400">{p.priceApprox}</p>}
              <p className="mt-3 text-sm text-gray-600">{p.tagline}</p>

              <div className="mt-3 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2 text-sm text-gray-700">
                <strong className="text-gray-900">{p.conversations}</strong> conversaciones/mes
                {p.conversationsTag ? ` · ${p.conversationsTag}` : ''}
              </div>

              <ul className="mt-4 space-y-1.5 flex-1">
                {p.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span className={f.strong ? 'font-medium text-gray-800' : ''}>{f.text}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5">
                {isCurrent ? (
                  <div className="w-full rounded-xl bg-gray-100 text-gray-500 text-sm font-medium py-2.5 text-center">
                    Tu plan actual
                  </div>
                ) : (
                  <a
                    href={upgradeHref(p)}
                    className="block w-full rounded-xl bg-blue-600 text-white text-sm font-semibold py-2.5 text-center hover:bg-blue-700"
                  >
                    Subir de plan
                  </a>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <p className="mt-6 text-xs text-gray-400">
        ¿Se te acaban las conversaciones? Puedes seguir con créditos Konnex. Escríbenos a {BRAND.email}.
      </p>
    </DashboardShell>
  )
}
