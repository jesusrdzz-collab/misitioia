/**
 * Nombre legible por giro (catálogo maestro de MiSitio).
 * Sincronizado con la tabla giros_catalogo de TerraLeads + ampliaciones
 * pre-campaña Meta 2026-09-07 (+ giros profesionales que estaban faltando y
 * el slug especial "otros" que abre el input de giro libre).
 * Se usa para el prompt de Gemini y las etiquetas del sitio.
 */
export const GIRO_NOMBRE: Record<string, string> = {
  // ——— Servicios profesionales (nuevos 2026-09-07)
  seguros: 'seguros',
  finanzas: 'finanzas / asesor financiero',
  contabilidad: 'contabilidad',
  'asesoria-legal': 'asesoría legal / despacho jurídico',
  'agencia-marketing': 'agencia de marketing / publicidad',
  fotografia: 'fotografía',
  eventos: 'eventos / catering',
  // ——— Educación y comida (nuevos 2026-09-07)
  escuela: 'escuela / academia',
  restaurante: 'restaurante',
  cafeteria: 'cafetería',
  // ——— Retail básico (nuevos 2026-09-07)
  minisuper: 'minisúper / abarrotes',
  farmacia: 'farmacia',
  // ——— Servicios técnicos ampliados
  construccion: 'construcción / albañilería',

  // ——— Catálogo original (40 giros)
  'aire-acondicionado': 'aire acondicionado',
  boutique: 'boutique de ropa',
  dentista: 'consultorio dental',
  estetica: 'estética / salón de belleza',
  ferreteria: 'ferretería',
  floreria: 'florería',
  gimnasio: 'gimnasio',
  muebleria: 'mueblería',
  refaccionaria: 'refaccionaria',
  'taller-mecanico': 'taller mecánico',
  veterinaria: 'veterinaria',
  'agencia-viajes': 'agencia de viajes',
  barberia: 'barbería',
  imprenta: 'imprenta',
  inmobiliaria: 'inmobiliaria',
  llantera: 'llantera',
  'material-construccion': 'material de construcción',
  optica: 'óptica',
  panaderia: 'panadería / pastelería',
  papeleria: 'papelería',
  purificadora: 'purificadora de agua',
  'tienda-mascotas': 'tienda de mascotas',
  vidrieria: 'vidriería',
  zapateria: 'zapatería',
  carpinteria: 'carpintería',
  cerrajeria: 'cerrajería',
  electricista: 'electricista',
  herreria: 'herrería',
  joyeria: 'joyería',
  plomeria: 'plomería',
  'renta-mobiliario': 'renta de mobiliario',
  'salon-fiestas': 'salón de fiestas',
  spa: 'spa / masajes',
  'taller-motos': 'taller de motos',
  tapiceria: 'tapicería',
  uniformes: 'uniformes',
  fisioterapia: 'fisioterapia',
  nutriologo: 'nutriólogo',
  remodelaciones: 'remodelaciones',
  'telas-merceria': 'telas y mercería',

  // ——— Slug especial: siempre al final del selector (ver GIROS_ORDERED)
  otros: 'Otros (describe tu giro)',
}

/**
 * Slug reservado para "otros" — el UI debe mostrar un input libre cuando
 * el usuario elige este valor, y el sistema usa ese texto libre en los
 * prompts de IA (ver `giroContext`).
 */
export const GIRO_OTROS = 'otros'

export function giroNombre(giro: string | null | undefined): string {
  if (!giro) return 'negocio local'
  return GIRO_NOMBRE[giro] ?? giro.replace(/-/g, ' ')
}

/**
 * Contexto humano que describe el giro real de un negocio. Prioriza el
 * texto libre si viene (caso `giro='otros'`), cae al catálogo si no.
 * Se usa como semilla para prompts de imágenes cuando no hay match en el
 * mapa de PROMPTS por giro.
 */
export function giroContext(
  giro: string | null | undefined,
  giroLibre: string | null | undefined,
): string {
  const libre = (giroLibre ?? '').trim()
  if (giro === GIRO_OTROS && libre) return libre
  if (!giro && libre) return libre
  return giroNombre(giro)
}
