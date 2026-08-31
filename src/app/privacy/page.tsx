import type { Metadata } from 'next'
import { LegalArticle } from '@/features/marketing/legal/LegalArticle'
import { buildProductLegal } from '@/features/marketing/legal/product-legal'
import { SITE_URL } from '@/features/marketing/brand'

/**
 * Alias en inglés requerido por la fábrica (/privacy). Canónica apunta a la
 * versión en español para evitar contenido duplicado.
 */
export const metadata: Metadata = {
  title: 'Aviso de Privacidad — MiSitio IA',
  description:
    'Aviso de Privacidad de MiSitio IA conforme a la LFPDPPP.',
  alternates: { canonical: `${SITE_URL}/aviso-de-privacidad` },
}

export default function Page() {
  return <LegalArticle doc={buildProductLegal('aviso-de-privacidad')} />
}
