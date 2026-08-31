/**
 * Nombre legible por giro (slug de giros_catalogo de TerraLeads).
 * Sincronizado con la tabla giros_catalogo (40 giros).
 * Se usa para el prompt de Gemini y las etiquetas del sitio.
 */
export const GIRO_NOMBRE: Record<string, string> = {
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
}

export function giroNombre(giro: string | null | undefined): string {
  if (!giro) return 'negocio local'
  return GIRO_NOMBRE[giro] ?? giro.replace(/-/g, ' ')
}
