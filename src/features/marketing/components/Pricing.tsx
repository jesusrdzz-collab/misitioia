import Link from 'next/link'
import { PLANS } from '../brand'

/**
 * Sección de precios reutilizable ($0 / $349 / $699 MXN).
 */
export function Pricing() {
  return (
    <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-3">
      {PLANS.map((plan) => {
        const featured = plan.highlight
        return (
          <div
            key={plan.id}
            className={
              featured
                ? 'relative flex flex-col rounded-3xl border-2 border-orange-500 bg-white p-8 shadow-xl shadow-orange-200/50 md:-my-3'
                : 'relative flex flex-col rounded-3xl border border-stone-200 bg-white/70 p-8'
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
              {plan.currency && <span className="text-base font-medium text-stone-400">{plan.currency}</span>}
            </div>
            <div className="mt-0.5 text-sm text-stone-400">{plan.priceNote}</div>
            <p className="mt-3 text-sm font-medium text-stone-700">{plan.tagline}</p>

            <ul className="mt-6 mb-8 flex-1 space-y-3 text-sm">
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
