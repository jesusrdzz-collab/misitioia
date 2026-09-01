import Stripe from 'stripe'

/**
 * Cliente Stripe + mapas plan⇄precio⇄cuota (fuente única de verdad).
 *
 * El cliente se inicializa de forma perezosa: NUNCA se crea en el import
 * (así el build no truena cuando STRIPE_SECRET_KEY no está en el entorno).
 * Llama a `getStripe()` dentro de cada handler de ruta.
 *
 * Los IDs de precio NUNCA se hardcodean: vienen de variables de entorno.
 */

/** Versión de API fijada (coincide con la del SDK stripe@22). */
const STRIPE_API_VERSION = '2026-08-26.dahlia'

/** Los 4 planes del producto. Coinciden con tenants.plan (CHECK) y PLANS. */
export type PlanId = 'free' | 'emprende' | 'crece' | 'pro'
/** Planes de pago (los que tienen precio en Stripe). */
export type PaidPlan = 'emprende' | 'crece' | 'pro'

/** Cuota de conversaciones incluidas por plan (fuente única). */
export const PLAN_QUOTA: Record<PlanId, number> = {
  free: 25,
  emprende: 100,
  crece: 400,
  pro: 1000,
}

/**
 * Plan de pago → ID de precio de Stripe (desde el entorno).
 * Se lee en tiempo de ejecución para no romper el build sin env.
 */
export function planPriceId(plan: PaidPlan): string {
  const map: Record<PaidPlan, string | undefined> = {
    emprende: process.env.STRIPE_PRICE_EMPRENDE,
    crece: process.env.STRIPE_PRICE_CRECE,
    pro: process.env.STRIPE_PRICE_PRO,
  }
  const priceId = map[plan]
  if (!priceId) {
    throw new Error(`Falta la variable de entorno del precio para el plan "${plan}".`)
  }
  return priceId
}

/** Alias tipo objeto para lecturas cómodas: PLAN_PRICE[plan]. */
export const PLAN_PRICE: Record<PaidPlan, () => string> = {
  emprende: () => planPriceId('emprende'),
  crece: () => planPriceId('crece'),
  pro: () => planPriceId('pro'),
}

/**
 * Reverso: dado un price id de Stripe, ¿a qué plan de pago corresponde?
 * Devuelve null si no coincide con ninguno configurado.
 */
export function priceIdToPlan(priceId: string | null | undefined): PaidPlan | null {
  if (!priceId) return null
  const paid: PaidPlan[] = ['emprende', 'crece', 'pro']
  for (const plan of paid) {
    const configured =
      plan === 'emprende'
        ? process.env.STRIPE_PRICE_EMPRENDE
        : plan === 'crece'
          ? process.env.STRIPE_PRICE_CRECE
          : process.env.STRIPE_PRICE_PRO
    if (configured && configured === priceId) return plan
  }
  return null
}

/**
 * Como `priceIdToPlan` pero con fallback a 'free' (para el webhook: un precio
 * desconocido o ausente equivale a sin suscripción de pago).
 */
export function planFromPriceId(priceId: string | null | undefined): PlanId {
  return priceIdToPlan(priceId) ?? 'free'
}

let cached: Stripe | null = null

/**
 * Devuelve el cliente Stripe, creándolo la primera vez. Lanza un error claro
 * si falta STRIPE_SECRET_KEY (secreto de servidor, nunca en el cliente).
 */
export function getStripe(): Stripe {
  if (cached) return cached
  const secret = process.env.STRIPE_SECRET_KEY
  if (!secret) {
    throw new Error('STRIPE_SECRET_KEY no está configurada en el entorno.')
  }
  cached = new Stripe(secret, { apiVersion: STRIPE_API_VERSION })
  return cached
}
