'use client'

import { useState } from 'react'
import { PLANS, BRAND, type Plan } from '@/features/marketing/brand'
import type { PlanId } from '@/lib/stripe'
import { refreshMyVictoriaUsage } from '@/features/billing/usage'
import { Banner, type Feedback } from './ui'

/**
 * Panel "Mi plan" (cliente): resumen de facturación + tarjetas de planes con
 * checkout de Stripe. Los planes de pago abren Checkout (si no hay suscripción)
 * o el portal de facturación (si ya existe una, para evitar suscripciones
 * duplicadas). El estado real (plan, status, periodo, cuota) llega del servidor.
 */

interface Props {
  siteId: string
  currentPlanId: PlanId
  planStatus: string
  currentPeriodEndIso: string | null
  conversationsIncluded: number
  hasSubscription: boolean
  checkout: 'success' | 'cancel' | null
  /** Uso de Victoria: conversaciones del periodo (null = aún sin sincronizar). */
  conversationsUsed: number | null
  /** true si el tenant tiene token de Konnex (Victoria configurada). */
  usageConfigured: boolean
  /** ISO de la última sincronización con Konnex. */
  usageSyncedAtIso: string | null
}

const STATUS_LABEL: Record<string, { text: string; className: string }> = {
  active: { text: 'Activa', className: 'bg-green-100 text-green-700' },
  past_due: { text: 'Pago pendiente', className: 'bg-amber-100 text-amber-700' },
  canceled: { text: 'Cancelada', className: 'bg-gray-100 text-gray-600' },
}

function formatDate(iso: string | null): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }).format(d)
}

function formatDateTime(iso: string | null): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function PlanPanel({
  siteId,
  currentPlanId,
  planStatus,
  currentPeriodEndIso,
  conversationsIncluded,
  hasSubscription,
  checkout,
  conversationsUsed,
  usageConfigured,
  usageSyncedAtIso,
}: Props) {
  const [pendingPlan, setPendingPlan] = useState<string | null>(null)
  const [usedCount, setUsedCount] = useState<number | null>(conversationsUsed)
  const [syncedAt, setSyncedAt] = useState<string | null>(usageSyncedAtIso)
  const [refreshing, setRefreshing] = useState(false)
  const [feedback, setFeedback] = useState<Feedback | null>(
    checkout === 'success'
      ? { kind: 'ok', text: '¡Listo! Tu pago se procesó. Tu plan se activa en unos segundos.' }
      : checkout === 'cancel'
        ? { kind: 'error', text: 'Cancelaste el pago. No se hizo ningún cargo.' }
        : null,
  )

  const currentPlan = PLANS.find((p) => p.id === currentPlanId) ?? PLANS[0]
  const status = STATUS_LABEL[planStatus] ?? STATUS_LABEL.active
  const renewLabel = formatDate(currentPeriodEndIso)

  async function post(url: string, body: Record<string, string>, key: string) {
    setFeedback(null)
    setPendingPlan(key)
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = (await res.json()) as { ok?: boolean; url?: string; error?: string }
      if (data.ok && data.url) {
        window.location.assign(data.url)
        return
      }
      setFeedback({ kind: 'error', text: data.error ?? 'No se pudo continuar. Intenta de nuevo.' })
    } catch {
      setFeedback({ kind: 'error', text: 'Error de conexión. Intenta de nuevo.' })
    } finally {
      setPendingPlan(null)
    }
  }

  function goCheckout(plan: Plan) {
    void post('/api/stripe/checkout', { plan: plan.id, siteId }, plan.id)
  }
  function goPortal() {
    void post('/api/stripe/portal', { siteId }, 'portal')
  }

  async function refreshUsage() {
    if (refreshing) return
    setRefreshing(true)
    setFeedback(null)
    try {
      const res = await refreshMyVictoriaUsage(siteId)
      if (res.ok && res.usage) {
        setUsedCount(res.usage.conversationsUsed)
        setSyncedAt(res.usage.usageSyncedAtIso)
      } else if (res.error === 'not_configured') {
        setFeedback({ kind: 'error', text: 'Victoria aún no está activa en tu sitio. La activamos pronto.' })
      } else {
        // Konnex inalcanzable: conservamos el último dato conocido.
        if (res.usage) {
          setUsedCount(res.usage.conversationsUsed)
          setSyncedAt(res.usage.usageSyncedAtIso)
        }
        setFeedback({ kind: 'error', text: 'No pudimos actualizar el uso ahora. Mostramos el último dato disponible.' })
      }
    } catch {
      setFeedback({ kind: 'error', text: 'Error de conexión al actualizar el uso.' })
    } finally {
      setRefreshing(false)
    }
  }

  const usagePct =
    usedCount != null && conversationsIncluded > 0
      ? Math.min(100, Math.round((usedCount / conversationsIncluded) * 100))
      : 0
  const overQuota = usedCount != null && usedCount > conversationsIncluded
  const syncedLabel = formatDateTime(syncedAt)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Mi plan</h1>
        <p className="text-gray-500 text-sm mt-1">Administra tu suscripción y las conversaciones de Victoria.</p>
      </div>

      <Banner feedback={feedback} />

      {/* Resumen de facturación */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-bold text-gray-900">Plan {currentPlan.label}</h2>
          {currentPlanId !== 'free' && (
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${status.className}`}>
              {status.text}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-gray-600">
          <strong className="text-gray-900">{conversationsIncluded}</strong> conversaciones de Victoria al mes.
        </p>
        {currentPlanId !== 'free' && renewLabel && (
          <p className="mt-1 text-xs text-gray-400">
            {planStatus === 'canceled' ? 'Acceso hasta el' : 'Se renueva el'} {renewLabel}.
          </p>
        )}

        {hasSubscription && (
          <button
            onClick={goPortal}
            disabled={pendingPlan !== null}
            className="mt-4 rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            {pendingPlan === 'portal' ? 'Abriendo…' : 'Administrar suscripción'}
          </button>
        )}
      </div>

      {/* Medidor de conversaciones de Victoria */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Conversaciones de Victoria</h2>
            <p className="mt-0.5 text-sm text-gray-600">
              <strong className="text-gray-900">{usedCount != null ? usedCount : '—'}</strong>
              {' / '}
              {conversationsIncluded} este mes
            </p>
          </div>
          <button
            onClick={refreshUsage}
            disabled={refreshing}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-60"
          >
            {refreshing ? 'Actualizando…' : 'Actualizar'}
          </button>
        </div>

        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className={`h-full rounded-full transition-all ${overQuota ? 'bg-amber-500' : 'bg-blue-500'}`}
            style={{ width: `${usagePct}%` }}
          />
        </div>

        {!usageConfigured ? (
          <p className="mt-2 text-xs text-gray-400">
            Victoria se activa en tu sitio muy pronto. Aquí verás cuántas conversaciones atiende cada mes.
          </p>
        ) : overQuota ? (
          <p className="mt-2 text-xs text-amber-600">
            Alcanzaste tu cuota del mes. Puedes seguir atendiendo con créditos Konnex — escríbenos a {BRAND.email}.
          </p>
        ) : syncedLabel ? (
          <p className="mt-2 text-xs text-gray-400">Actualizado el {syncedLabel}.</p>
        ) : (
          <p className="mt-2 text-xs text-gray-400">Aún sin sincronizar. Toca “Actualizar”.</p>
        )}
      </div>

      {/* Tarjetas de planes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PLANS.map((p) => {
          const isCurrent = p.id === currentPlanId
          const isPaid = p.id !== 'free'
          const busy = pendingPlan === p.id
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
                  {p.currency ? `${p.currency} ` : ''}
                  {p.priceNote}
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
                ) : isPaid ? (
                  hasSubscription ? (
                    <button
                      onClick={goPortal}
                      disabled={pendingPlan !== null}
                      className="block w-full rounded-xl bg-blue-600 text-white text-sm font-semibold py-2.5 text-center hover:bg-blue-700 disabled:opacity-60"
                    >
                      {pendingPlan === 'portal' ? 'Abriendo…' : `Cambiar a ${p.label}`}
                    </button>
                  ) : (
                    <button
                      onClick={() => goCheckout(p)}
                      disabled={pendingPlan !== null}
                      className="block w-full rounded-xl bg-blue-600 text-white text-sm font-semibold py-2.5 text-center hover:bg-blue-700 disabled:opacity-60"
                    >
                      {busy ? 'Redirigiendo…' : `Activar ${p.label}`}
                    </button>
                  )
                ) : hasSubscription ? (
                  <button
                    onClick={goPortal}
                    disabled={pendingPlan !== null}
                    className="block w-full rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold py-2.5 text-center hover:bg-gray-50 disabled:opacity-60"
                  >
                    {pendingPlan === 'portal' ? 'Abriendo…' : 'Cambiar a Free'}
                  </button>
                ) : (
                  <div className="w-full rounded-xl bg-gray-50 text-gray-400 text-sm font-medium py-2.5 text-center">
                    Plan gratuito
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <p className="mt-6 text-xs text-gray-400">
        ¿Se te acaban las conversaciones? Puedes seguir con créditos Konnex. Escríbenos a {BRAND.email}.
      </p>
    </div>
  )
}
