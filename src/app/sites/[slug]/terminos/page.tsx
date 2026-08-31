import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getSiteBySlug } from '@/lib/sites/queries'
import { toBusinessView } from '@/features/sites/business'
import { siteBasePath } from '@/features/sites/base-path'
import { buildLegalDoc } from '@/features/legal/legal-content'
import { LegalPage } from '@/features/legal/LegalPage'

interface Props {
  params: Promise<{ slug: string }>
}

export const revalidate = 3600

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const data = await getSiteBySlug(slug)
  if (!data) return { title: 'No encontrado', robots: { index: false, follow: false } }
  const b = toBusinessView(data)
  return {
    title: `Términos y Condiciones — ${b.name}`,
    robots: { index: b.indexable, follow: b.indexable },
  }
}

export default async function TerminosPage({ params }: Props) {
  const { slug } = await params
  const data = await getSiteBySlug(slug)
  if (!data) notFound()
  const b = toBusinessView(data)
  const base = await siteBasePath(slug)
  return <LegalPage doc={buildLegalDoc('terminos', b)} business={b} base={base} />
}
