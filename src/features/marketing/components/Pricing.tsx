import Link from 'next/link'
import { PLANS } from '../brand'

/**
 * Sección de precios reutilizable.
 *
 * Modelo 31-ago-2026: Free $0 (25 conv) · Emprende $10 (100) · Crece $25 (400) ·
 * Pro $50 (1,000). El diferenciador es el nº de conversaciones que Victoria
 * atiende al mes; el excedente corre a granel con créditos Konnex.
 */
export function Pricing() {
  return (
    <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {PLANS.map((plan) => {
        const featured = plan.highlight
        return (
          <div
            key={plan.id}
            className={
              featured
                ? 'relative flex flex-col rounded-3xl border-2 border-orange-500 bg-white p-7 shadow-xl shadow-orange-200/50'
                : 'relative flex flex-col rounded-3xl border border-stone-200 bg-white/70 p-7'
            }
          >
            {plan.badge && (
              <div
                className={
                  featured
                    ? 'absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-orange-600 px-4 py-1 text-xs font-bold tracking-wide text-white'
                    : 'absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-stone-800 px-4 py-1 text-xs font-bold tracking-wide text-white'
                }
              >
                {plan.badge}
              </div>
            )}
            <div className="mb-1 text-sm font-semibold uppercase tracking-wider text-stone-500">
              {plan.label}
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-bold text-stone-900">{plan.price}</span>
              {plan.currency && (
                <span className="text-base font-medium text-stone-400">{plan.currency}</span>
              )}
            </div>
            <div className="mt-0.5 text-sm text-stone-400">
              {plan.priceNote}
              {plan.priceApprox && <span className="ml-1 text-stone-400">· {plan.priceApprox}</span>}
            </div>

            {/* Diferenciador: conversaciones de Victoria incluidas */}
            <div
              className={
                featured
                  ? 'mt-5 rounded-2xl bg-orange-50 px-4 py-3 text-center'
                  : 'mt-5 rounded-2xl bg-stone-100/70 px-4 py-3 text-center'
              }
            >
              <div className="text-2xl font-bold text-orange-600">{plan.conversations}</div>
              <div className="text-xs font-medium text-stone-600">
                conversaciones de Victoria / mes
              </div>
              {plan.conversationsTag && (
                <div className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-stone-400">
                  {plan.conversationsTag}
                </div>
              )}
            </div>

            <p className="mt-4 text-sm font-medium text-stone-700">{plan.tagline}</p>

            <ul className="mt-5 mb-8 flex-1 space-y-3 text-sm">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2.5 text-stone-600">
                  <span className={f.star ? 'mt-0.5 text-orange-500' : 'mt-0.5 text-emerald-500'}>
                    {f.star ? '★' : '✓'}
                  </span>
                  <span className={f.strong ? 'font-semibold text-stone-800' : ''}>{f.text}</span>
                </li>
              ))}
            </ul>

            <Link
              href={plan.href}
              className={
                featured
                  ? 'block rounded-xl bg-orange-600 py-3.5 text-center font-semibold text-white transition-colors hover:bg-orange-700'
                  : 'block rounded-xl border border-stone-300 py-3.5 text-center font-semibold text-stone-700 transition-colors hover:border-stone-400 hover:bg-stone-50'
              }
            >
              {plan.cta}
            </Link>
          </div>
        )
      })}
    </div>
  )
}
