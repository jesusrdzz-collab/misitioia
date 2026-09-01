import { createServerSupabase } from '@/lib/supabase/server'
import { LoginGate } from '@/features/editor/components/LoginGate'
import { listEmbedSitesForOwner, getLatestAudit } from '@/features/embed/store'
import { InstallPanel } from '@/features/embed/components/InstallPanel'
import type { AuditReport, EmbedAudit } from '@/features/embed/types'
import { ROOT_DOMAIN } from '@/lib/domain'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Instalar en mi sitio — MiSitio IA',
  robots: { index: false },
}

export default async function InstalarPage() {
  const supabase = await createServerSupabase()
  const { data } = await supabase.auth.getUser()
  const email = data.user?.email

  if (!email) {
    return <LoginGate next="/instalar" title="Conecta tu sitio actual" />
  }

  const sites = await listEmbedSitesForOwner(email)

  const withAudits = await Promise.all(
    sites.map(async (s) => {
      const audit: EmbedAudit | null = await getLatestAudit(s.id)
      const report = (audit?.report ?? null) as AuditReport | null
      return {
        id: s.id,
        name: s.name,
        token: s.token,
        origin: s.origin,
        createdAt: s.created_at,
        audit: report && typeof report.score === 'number'
          ? {
              score: report.score,
              summary: report.summary ?? audit?.summary ?? '',
              recommendations: Array.isArray(report.recommendations) ? report.recommendations : [],
              checks: Array.isArray(report.checks) ? report.checks : [],
              createdAt: audit?.created_at ?? null,
            }
          : null,
      }
    }),
  )

  const scriptBase = `https://${ROOT_DOMAIN}`

  return <InstallPanel email={email} sites={withAudits} scriptBase={scriptBase} />
}
