/**
 * Registro central de plantillas seleccionables (Sprint 6-sep-2026).
 * Cuando el `sites.template` no está en el mapa, caemos en el alias legacy
 * (por giro) y en último caso en `terracota-classic`.
 */

import type { TemplateDefinition } from './types'
import { TerracotaClassicTemplate, TerracotaClassicPreview } from './terracota-classic'
import { MarinoProfesionalTemplate, MarinoProfesionalPreview } from './marino-profesional'
import { VerdeNaturalTemplate, VerdeNaturalPreview } from './verde-natural'
import { RosaPremiumTemplate, RosaPremiumPreview } from './rosa-premium'

export const TEMPLATE_REGISTRY: Record<string, TemplateDefinition> = {
  'terracota-classic': {
    meta: {
      slug: 'terracota-classic',
      name: 'Terracota clásica',
      description: 'Cálida y confiable. Hero centrado con degradado naranja terracota y curva suave; tipografía Playfair Display + Inter.',
      goodFor: ['Herrería', 'Construcción', 'Oficios', 'Servicios técnicos'],
      defaultForGiros: ['herreria', 'carpinteria', 'material-construccion', 'remodelaciones', 'plomeria', 'electricista', 'cerrajeria', 'tapiceria', 'ferreteria', 'vidrieria', 'imprenta', 'uniformes'],
      palette: { primary: '#c2410c', accent: '#7c2d12', background: '#ffffff', text: '#111827' },
      displayFontLabel: 'Playfair Display',
    },
    Component: TerracotaClassicTemplate,
    Preview: TerracotaClassicPreview,
  },

  'marino-profesional': {
    meta: {
      slug: 'marino-profesional',
      name: 'Marino profesional',
      description: 'Serio y estructurado. Doble barra superior (navy + blanca con CTA naranja), hero con foto full-bleed. Estilo UENI mejorado.',
      goodFor: ['Automotriz', 'Seguridad', 'B2B', 'Aire acondicionado', 'Servicios técnicos'],
      defaultForGiros: ['refaccionaria', 'taller-mecanico', 'taller-motos', 'llantera', 'aire-acondicionado', 'purificadora'],
      palette: { primary: '#0f2c5c', accent: '#f97316', background: '#ffffff', text: '#0a1f42' },
      displayFontLabel: 'Inter Bold',
    },
    Component: MarinoProfesionalTemplate,
    Preview: MarinoProfesionalPreview,
  },

  'verde-natural': {
    meta: {
      slug: 'verde-natural',
      name: 'Verde natural',
      description: 'Cálido y orgánico. Hero a dos columnas con foto redondeada. Paleta verde salvia + crema. Ideal para cuidado y bienestar.',
      goodFor: ['Veterinaria', 'Salud', 'Fisioterapia', 'Nutrición', 'Wellness', 'Panadería'],
      defaultForGiros: ['veterinaria', 'tienda-mascotas', 'fisioterapia', 'nutriologo', 'optica', 'dentista', 'panaderia', 'gimnasio'],
      palette: { primary: '#3f6b3a', accent: '#22421f', background: '#f9f6ee', text: '#22221e' },
      displayFontLabel: 'Playfair Display',
    },
    Component: VerdeNaturalTemplate,
    Preview: VerdeNaturalPreview,
  },

  'rosa-premium': {
    meta: {
      slug: 'rosa-premium',
      name: 'Rosa premium',
      description: 'Elegante y femenina. Hero cinematográfico con foto y overlay burdeos, títulos serif grandes, acentos dorados.',
      goodFor: ['Estética', 'Belleza', 'Boutique', 'Spa', 'Barbería', 'Joyería', 'Florería'],
      defaultForGiros: ['estetica', 'spa', 'barberia', 'boutique', 'joyeria', 'floreria', 'zapateria', 'muebleria', 'telas-merceria'],
      palette: { primary: '#c2185b', accent: '#7d1b3b', background: '#fdf8f5', text: '#2a1b1f' },
      displayFontLabel: 'Playfair Display',
    },
    Component: RosaPremiumTemplate,
    Preview: RosaPremiumPreview,
  },
}

export const DEFAULT_TEMPLATE_SLUG = 'terracota-classic'

export function listTemplates(): TemplateDefinition[] {
  return [
    TEMPLATE_REGISTRY['terracota-classic'],
    TEMPLATE_REGISTRY['marino-profesional'],
    TEMPLATE_REGISTRY['verde-natural'],
    TEMPLATE_REGISTRY['rosa-premium'],
  ]
}

/**
 * Resuelve el slug de plantilla a la definición. Acepta:
 *  - slug del nuevo sistema (`terracota-classic`, …)
 *  - slug legacy por giro (`automotriz`, `salud_animal`, `belleza`, …)
 *  - null/undefined → default
 * Siempre devuelve algo (fallback a `terracota-classic`).
 */
export function resolveTemplate(templateSlug: string | null | undefined): TemplateDefinition {
  if (templateSlug && TEMPLATE_REGISTRY[templateSlug]) return TEMPLATE_REGISTRY[templateSlug]

  const LEGACY_ALIAS: Record<string, string> = {
    salud_animal: 'verde-natural',
    salud: 'verde-natural',
    fitness: 'verde-natural',
    automotriz: 'marino-profesional',
    hogar: 'marino-profesional',
    belleza: 'rosa-premium',
    retail: 'rosa-premium',
    construccion: 'terracota-classic',
    generico: 'terracota-classic',
  }
  if (templateSlug && LEGACY_ALIAS[templateSlug]) {
    return TEMPLATE_REGISTRY[LEGACY_ALIAS[templateSlug]]
  }
  return TEMPLATE_REGISTRY[DEFAULT_TEMPLATE_SLUG]
}

export function suggestTemplateForGiro(giro: string | null | undefined): string {
  if (!giro) return DEFAULT_TEMPLATE_SLUG
  for (const t of listTemplates()) {
    if (t.meta.defaultForGiros.includes(giro)) return t.meta.slug
  }
  return DEFAULT_TEMPLATE_SLUG
}
