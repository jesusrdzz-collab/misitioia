import type { Metadata } from 'next'
import { LegalArticle } from '@/features/marketing/legal/LegalArticle'
import { buildProductLegal } from '@/features/marketing/legal/product-legal'
import { SITE_URL } from '@/features/marketing/brand'

export const metadata: Metadata = {
  title: 'Términos y Condiciones — MiSitio IA',
  description:
    'Términos y Condiciones del servicio de MiSitio IA: descripción del servicio, planes, pagos, uso aceptable y responsabilidades.',
  alternates: { canonical: `${SITE_URL}/terminos` },
}

export default function Page() {
  return <LegalArticle doc={buildProductLegal('terminos')} />
}
