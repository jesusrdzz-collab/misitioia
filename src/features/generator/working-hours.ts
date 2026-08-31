import type { WorkingHours } from '@/lib/types/site'

/**
 * Normaliza el working_hours de Outscraper a un objeto limpio.
 *
 * Entrada (raw_data.outscraper.working_hours):
 *   { "lunes": ["8a.m.-4p.m."], "domingo": ["Cerrado"], ... }
 *
 * Salida:
 *   { "Lunes": "8:00 a.m. – 4:00 p.m.", "Domingo": "Cerrado", ... }
 *
 * Se preserva el orden lunes→domingo. No inventa horarios: si un día no viene,
 * no aparece.
 */

const DAY_ORDER = [
  'lunes',
  'martes',
  'miércoles',
  'miercoles',
  'jueves',
  'viernes',
  'sábado',
  'sabado',
  'domingo',
]

const DAY_LABEL: Record<string, string> = {
  lunes: 'Lunes',
  martes: 'Martes',
  'miércoles': 'Miércoles',
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  'sábado': 'Sábado',
  sabado: 'Sábado',
  domingo: 'Domingo',
}

function cleanRange(raw: string): string {
  const v = raw.trim()
  if (/cerrad/i.test(v)) return 'Cerrado'
  if (/24\s*hora|abierto/i.test(v)) return 'Abierto 24 horas'
  // "8a.m.-4p.m." → "8:00 a.m. – 4:00 p.m."
  return v
    .replace(/\s+/g, '')
    .replace(/(\d)(a\.?m\.?|p\.?m\.?)/gi, '$1 $2') // separar número de am/pm
    .replace(/-/g, ' – ')
    .replace(/a\.?m\.?/gi, 'a.m.')
    .replace(/p\.?m\.?/gi, 'p.m.')
    .trim()
}

export function normalizeWorkingHours(
  raw: Record<string, string[]> | null | undefined,
): WorkingHours | null {
  if (!raw || typeof raw !== 'object') return null
  const out: WorkingHours = {}
  const seen = new Set<string>()

  for (const key of DAY_ORDER) {
    const label = DAY_LABEL[key]
    if (!label || seen.has(label)) continue
    const val = raw[key]
    if (val == null) continue
    const first = Array.isArray(val) ? val[0] : String(val)
    if (!first) continue
    out[label] = cleanRange(first)
    seen.add(label)
  }

  return Object.keys(out).length > 0 ? out : null
}
