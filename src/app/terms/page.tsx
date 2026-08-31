import type { Metadata } from 'next'
import { LegalArticle } from '@/features/marketing/legal/LegalArticle'
import { buildProductLegal } from '@/features/marketing/legal/product-legal'
import { SITE_URL } from '@/features/marketing/brand'

/**
 * Alias en inglés requerido por la fábrica (/terms). Canónica apunta a la
 * versión en español para evitar contenido duplicado.
 */
export const metadata: Metadata = {
  title: 'Términos y Condiciones — MiSitio IA',
  description: 'Términos y Condiciones del servicio de MiSitio IA.',
  alternates: { canonical: `${SITE_URL}/terminos` },
}

export default function Page() {
  return <LegalArticle doc={buildProductLegal('terminos')} />
}
