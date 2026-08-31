import type { Metadata } from 'next'
import { LegalArticle } from '@/features/marketing/legal/LegalArticle'
import { buildProductLegal } from '@/features/marketing/legal/product-legal'
import { SITE_URL } from '@/features/marketing/brand'

export const metadata: Metadata = {
  title: 'Aviso de Privacidad — MiSitio IA',
  description:
    'Aviso de Privacidad de MiSitio IA conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).',
  alternates: { canonical: `${SITE_URL}/aviso-de-privacidad` },
}

export default function Page() {
  return <LegalArticle doc={buildProductLegal('aviso-de-privacidad')} />
}
