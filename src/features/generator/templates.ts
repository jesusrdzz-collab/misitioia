/**
 * Mapeo giro (slug de giros_catalogo) → plantilla visual.
 *
 * Cada plantilla define paleta, emoji, y vocabulario de secciones para que
 * una veterinaria NO se vea igual que una refaccionaria. El componente de
 * render (src/app/sites/[slug]) usa estos valores.
 *
 * Fase 2: selección automática por giro.
 * Fase 3: las variantes se refinan por giro.
 */

export interface Template {
  id: string
  emoji: string
  primaryColor: string   // hex
  accentColor: string    // hex
  /** Etiqueta de la sección de oferta: "Servicios", "Refacciones", "Menú"... */
  servicesLabel: string
  /** Etiqueta de la sección "sobre el negocio" */
  aboutLabel: string
  /** Texto del botón principal de contacto */
  ctaLabel: string
}

export const TEMPLATES: Record<string, Template> = {
  salud_animal: {
    id: 'salud_animal',
    emoji: '🐾',
    primaryColor: '#15803d',
    accentColor: '#166534',
    servicesLabel: 'Nuestros servicios',
    aboutLabel: 'Sobre la clínica',
    ctaLabel: 'Agenda una cita',
  },
  automotriz: {
    id: 'automotriz',
    emoji: '🔧',
    primaryColor: '#b91c1c',
    accentColor: '#7f1d1d',
    servicesLabel: 'Servicios y refacciones',
    aboutLabel: 'Sobre el taller',
    ctaLabel: 'Pide tu cotización',
  },
  salud: {
    id: 'salud',
    emoji: '🩺',
    primaryColor: '#0d9488',
    accentColor: '#115e59',
    servicesLabel: 'Tratamientos y servicios',
    aboutLabel: 'Sobre nosotros',
    ctaLabel: 'Agenda tu consulta',
  },
  belleza: {
    id: 'belleza',
    emoji: '✨',
    primaryColor: '#db2777',
    accentColor: '#9d174d',
    servicesLabel: 'Nuestros servicios',
    aboutLabel: 'Sobre nosotros',
    ctaLabel: 'Reserva tu cita',
  },
  fitness: {
    id: 'fitness',
    emoji: '💪',
    primaryColor: '#ea580c',
    accentColor: '#9a3412',
    servicesLabel: 'Lo que ofrecemos',
    aboutLabel: 'Sobre el gimnasio',
    ctaLabel: 'Empieza hoy',
  },
  retail: {
    id: 'retail',
    emoji: '🛍️',
    primaryColor: '#7c3aed',
    accentColor: '#5b21b6',
    servicesLabel: 'Lo que encontrarás',
    aboutLabel: 'Sobre la tienda',
    ctaLabel: 'Visítanos',
  },
  construccion: {
    id: 'construccion',
    emoji: '🛠️',
    primaryColor: '#c2410c',
    accentColor: '#7c2d12',
    servicesLabel: 'Productos y servicios',
    aboutLabel: 'Sobre el negocio',
    ctaLabel: 'Solicita información',
  },
  hogar: {
    id: 'hogar',
    emoji: '🏠',
    primaryColor: '#2563eb',
    accentColor: '#1e40af',
    servicesLabel: 'Servicios',
    aboutLabel: 'Sobre nosotros',
    ctaLabel: 'Contáctanos',
  },
  generico: {
    id: 'generico',
    emoji: '🏪',
    primaryColor: '#2563eb',
    accentColor: '#1e40af',
    servicesLabel: 'Servicios',
    aboutLabel: 'Sobre nosotros',
    ctaLabel: 'Contáctanos',
  },
}

/**
 * Giro (slug) → id de plantilla.
 * Cualquier giro no listado cae en 'generico'.
 */
const GIRO_TO_TEMPLATE: Record<string, string> = {
  // salud animal
  veterinaria: 'salud_animal',
  'tienda-mascotas': 'salud_animal',
  // automotriz
  refaccionaria: 'automotriz',
  'taller-mecanico': 'automotriz',
  'taller-motos': 'automotriz',
  llantera: 'automotriz',
  // salud
  dentista: 'salud',
  fisioterapia: 'salud',
  nutriologo: 'salud',
  optica: 'salud',
  // belleza
  estetica: 'belleza',
  barberia: 'belleza',
  spa: 'belleza',
  // fitness
  gimnasio: 'fitness',
  // retail
  boutique: 'retail',
  zapateria: 'retail',
  joyeria: 'retail',
  muebleria: 'retail',
  floreria: 'retail',
  'telas-merceria': 'retail',
  papeleria: 'retail',
  panaderia: 'retail',
  // construcción / oficios
  ferreteria: 'construccion',
  'material-construccion': 'construccion',
  vidrieria: 'construccion',
  herreria: 'construccion',
  carpinteria: 'construccion',
  remodelaciones: 'construccion',
  plomeria: 'construccion',
  electricista: 'construccion',
  cerrajeria: 'construccion',
  tapiceria: 'construccion',
  // hogar / eventos / servicios
  'aire-acondicionado': 'hogar',
  'renta-mobiliario': 'hogar',
  'salon-fiestas': 'hogar',
  purificadora: 'hogar',
  imprenta: 'generico',
  uniformes: 'generico',
  'agencia-viajes': 'generico',
  inmobiliaria: 'generico',
}

export function templateForGiro(giro: string | null | undefined): Template {
  if (!giro) return TEMPLATES.generico
  const id = GIRO_TO_TEMPLATE[giro] ?? 'generico'
  return TEMPLATES[id] ?? TEMPLATES.generico
}
