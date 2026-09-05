import { z } from 'zod'

/**
 * Validación de los IDs de analíticas de Fase A.
 *
 * - Meta Pixel: 15-16 dígitos (los IDs actuales de Meta caben en ese rango;
 *   los más antiguos pueden ser algo más cortos, pero el mínimo defensivo es 15
 *   para atrapar errores de copia).
 * - GA4 Measurement ID: `G-` seguido de 8-12 alfanuméricos en mayúsculas.
 *
 * Un ID mal escrito rompe el script en el sitio del cliente sin que Google/Meta
 * avisen; por eso preferimos rechazar en el guardado en lugar de dejar pasar.
 */

const META_PIXEL_RE = /^[0-9]{15,16}$/
const GA4_RE = /^G-[A-Z0-9]{8,12}$/

/** Un ID vacío se guarda como null (equivale a "desactivado"). */
export const analyticsIdsSchema = z.object({
  metaPixelId: z
    .string()
    .trim()
    .transform((v) => (v.length === 0 ? null : v))
    .nullable()
    .refine((v) => v === null || META_PIXEL_RE.test(v), {
      message: 'El Pixel ID de Meta debe tener 15 o 16 dígitos.',
    }),
  gaMeasurementId: z
    .string()
    .trim()
    .transform((v) => (v.length === 0 ? null : v.toUpperCase()))
    .nullable()
    .refine((v) => v === null || GA4_RE.test(v), {
      message: 'El ID de Google Analytics debe empezar con G- (por ejemplo G-ABC12345).',
    }),
})

export type AnalyticsIdsInput = z.input<typeof analyticsIdsSchema>
export type AnalyticsIds = z.output<typeof analyticsIdsSchema>
