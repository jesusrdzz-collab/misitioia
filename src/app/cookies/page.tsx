import type { Metadata } from 'next'
import { LegalArticle } from '@/features/marketing/legal/LegalArticle'
import { buildProductLegal } from '@/features/marketing/legal/product-legal'
import { SITE_URL } from '@/features/marketing/brand'

export const metadata: Metadata = {
  title: 'Política de Cookies — MiSitio IA',
  description: 'Cómo MiSitio IA utiliza cookies y tecnologías similares, y cómo puedes administrarlas.',
  alternates: { canonical: `${SITE_URL}/cookies` },
}

export default function Page() {
  return <LegalArticle doc={buildProductLegal('cookies')} />
}
