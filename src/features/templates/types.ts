/**
 * Sistema de plantillas seleccionables (Sprint 6-sep-2026).
 * Cada plantilla es un componente que renderiza el sitio completo tomando un RenderProps.
 * El slug de la plantilla vive en `sites.template` y decide qué componente monta
 * `/sites/[slug]/page.tsx`.
 */

import type { ReactNode } from 'react'
import type { RenderableSite } from '@/lib/types/site'
import type { BusinessView } from '@/features/sites/business'

export interface TemplateRenderProps {
  data: RenderableSite
  business: BusinessView
  emoji: string
  base: string
  wa: string | null
  tel: string | null
  mapEmbed: string | null
  mapLink: string | null
  extras?: ReactNode
}

export interface TemplateMetadata {
  slug: string
  name: string
  description: string
  goodFor: string[]
  defaultForGiros: string[]
  palette: { primary: string; accent: string; background: string; text: string }
  displayFontLabel: string
}

export interface TemplateDefinition {
  meta: TemplateMetadata
  Component: (props: TemplateRenderProps) => ReactNode
  Preview: (props: { businessName?: string }) => ReactNode
}
