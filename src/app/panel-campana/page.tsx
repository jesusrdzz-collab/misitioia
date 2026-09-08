/**
 * Dashboard interno de la campaña Meta MiSitio (7-sep-2026).
 * Solo accesible por el email admin (jesus2rdzz@gmail.com).
 * Server Component, revalidate 5 min.
 */

import { Suspense } from 'react'
import type { Metadata } from 'next'
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase/server'
import {
  getCampaignInsights,
  landingPageViews,
  META_AD_ACCOUNT_ID,
  META_CAMPAIGN_ID,
} from '@/lib/meta-ads'

export const dynamic = 'force-dynamic'
export const revalidate = 300 // 5 min

export const metadata: Metadata = {
  title: 'Panel Campaña Meta · MiSitio (interno)',
  robots: { index: false, follow: false },
}

const ADMIN_EMAILS = new Set(
  (process.env.PANEL_CAMPANA_EMAILS || 'jesus2rdzz@gmail.com')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),
)

interface PageData {
  ok: boolean
  error?: string
  admin: {
    ad_account: string
    campaign_id: string
  }
  today: {
    impressions: number
    clicks: number
    spend: number
    lpv: number
    ads: Array<{
      ad_id: string
      ad_name: string
      impressions: number
      clicks: number
      spend: number
      lpv: number
      ctr: number
    }>
  } | null
  visitor_hits: {
    today_pageviews: number
    today_unique_sessions: number
    today_unique_fbclids: number
    victoria_opens_today: number
    last_20: Array<{
      id: number
      event_type: string
      fbclid: string | null
      utm_content: string | null
      path: string
      referer: string | null
      created_at: string
    }>
  }
  sites: {
    total: number
    today: number
    attributed_today: number
    top_ads: Array<{ ad_id: string | null; ad_name: string | null; count: number }>
  }
}

async function loadData(): Promise<PageData> {
  const admin = await createAdminSupabase()
  const nowIsoMx = () => new Date().toLocaleString('en-CA', { timeZone: 'America/Mexico_City' })

  // 1. Meta insights (falla ruidosamente si el token no está)
  let meta: PageData['today'] = null
  let metaError: string | null = null
  try {
    const rows = await getCampaignInsights({ level: 'ad', datePreset: 'today' })
    const ads = rows.map((r) => ({
      ad_id: r.ad_id ?? '',
      ad_name: r.ad_name ?? '',
      impressions: Number(r.impressions ?? 0),
      clicks: Number(r.clicks ?? 0),
      spend: Number(r.spend ?? 0),
      lpv: landingPageViews(r),
      ctr: Number(r.ctr ?? 0),
    }))
    meta = {
      impressions: ads.reduce((s, a) => s + a.impressions, 0),
      clicks: ads.reduce((s, a) => s + a.clicks, 0),
      spend: ads.reduce((s, a) => s + a.spend, 0),
      lpv: ads.reduce((s, a) => s + a.lpv, 0),
      ads: ads.sort((a, b) => b.lpv - a.lpv || b.impressions - a.impressions),
    }
  } catch (e) {
    metaError = (e as Error).message
  }

  // 2. Visitor hits — today (MX)
  const { data: hitsDaily } = await admin
    .from('victoria_funnel_daily')
    .select('*')
    .order('dia', { ascending: false })
    .limit(1)

  const todayHits = hitsDaily?.[0] ?? {
    dia: null,
    pageviews: 0,
    victoria_opens: 0,
    victoria_to_signup: 0,
    unique_fbclids: 0,
    unique_sessions: 0,
  }

  const { data: last20 } = await admin
    .from('visitor_hits')
    .select('id, event_type, fbclid, utm_content, path, referer, created_at')
    .order('created_at', { ascending: false })
    .limit(20)

  // 3. Sites — total y hoy
  const startOfDayUtc = new Date()
  // Aproximación: día MX comienza cuando UTC=06:00 (offset -6). No es perfecto
  // pero es suficiente para el dashboard interno.
  startOfDayUtc.setUTCHours(6, 0, 0, 0)

  const { count: totalSites } = await admin
    .from('sites')
    .select('*', { count: 'exact', head: true })

  const { count: todaySites } = await admin
    .from('sites')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startOfDayUtc.toISOString())

  const { count: attributedToday } = await admin
    .from('sites')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startOfDayUtc.toISOString())
    .not('attribution_fbclid', 'is', null)

  const { data: topAdsRaw } = await admin
    .from('sites')
    .select('attribution_ad_id, attribution_ad_name')
    .not('attribution_fbclid', 'is', null)
    .limit(500)

  const topAdCounts = new Map<string, { ad_id: string | null; ad_name: string | null; count: number }>()
  for (const row of topAdsRaw ?? []) {
    const key = String(row.attribution_ad_id ?? row.attribution_ad_name ?? 'orgánico o sin ad_id')
    const prev = topAdCounts.get(key)
    if (prev) prev.count += 1
    else topAdCounts.set(key, { ad_id: row.attribution_ad_id ?? null, ad_name: row.attribution_ad_name ?? null, count: 1 })
  }
  const topAds = [...topAdCounts.values()].sort((a, b) => b.count - a.count).slice(0, 5)

  return {
    ok: !metaError,
    error: metaError ?? undefined,
    admin: { ad_account: META_AD_ACCOUNT_ID, campaign_id: META_CAMPAIGN_ID },
    today: meta,
    visitor_hits: {
      today_pageviews: Number(todayHits.pageviews ?? 0),
      today_unique_sessions: Number(todayHits.unique_sessions ?? 0),
      today_unique_fbclids: Number(todayHits.unique_fbclids ?? 0),
      victoria_opens_today: Number(todayHits.victoria_opens ?? 0),
      last_20: (last20 ?? []) as PageData['visitor_hits']['last_20'],
    },
    sites: {
      total: totalSites ?? 0,
      today: todaySites ?? 0,
      attributed_today: attributedToday ?? 0,
      top_ads: topAds,
    },
  }
}

function fmt(n: number): string {
  return new Intl.NumberFormat('es-MX').format(n)
}
function money(n: number): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n)
}

async function Body() {
  const d = await loadData()
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 text-neutral-900">
      <header className="mb-6 flex items-baseline justify-between gap-3">
        <h1 className="text-2xl font-semibold">Campaña Meta · MiSitio</h1>
        <span className="text-xs text-neutral-500">
          Ad account {d.admin.ad_account} · Campaign {d.admin.campaign_id} · Revalida cada 5 min
        </span>
      </header>

      {d.error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <strong>Meta Insights falló:</strong> {d.error}. El token puede estar caducado o el `META_ADS_TOKEN` no está en Vercel.
        </div>
      )}

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-neutral-500">Hoy · Meta Ads</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="Impresiones" value={fmt(d.today?.impressions ?? 0)} />
          <StatCard label="Clicks" value={fmt(d.today?.clicks ?? 0)} />
          <StatCard label="LPV" value={fmt(d.today?.lpv ?? 0)} />
          <StatCard label="Gasto" value={money(d.today?.spend ?? 0)} />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-neutral-500">Hoy · Instrumentación propia</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="Pageviews (visitor_hits)" value={fmt(d.visitor_hits.today_pageviews)} />
          <StatCard label="Sessions únicas" value={fmt(d.visitor_hits.today_unique_sessions)} />
          <StatCard label="Fbclids únicos" value={fmt(d.visitor_hits.today_unique_fbclids)} />
          <StatCard label="Victoria opens" value={fmt(d.visitor_hits.victoria_opens_today)} />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-neutral-500">Sitios creados</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <StatCard label="Total histórico" value={fmt(d.sites.total)} />
          <StatCard label="Hoy" value={fmt(d.sites.today)} />
          <StatCard label="Hoy con atribución Meta" value={fmt(d.sites.attributed_today)} />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-neutral-500">Top 5 ads por LPV (hoy)</h2>
        <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50">
              <tr>
                <th className="p-3 text-left">Ad</th>
                <th className="p-3 text-right">Impr.</th>
                <th className="p-3 text-right">Clicks</th>
                <th className="p-3 text-right">CTR%</th>
                <th className="p-3 text-right">LPV</th>
                <th className="p-3 text-right">Gasto</th>
              </tr>
            </thead>
            <tbody>
              {(d.today?.ads ?? []).slice(0, 5).map((a) => (
                <tr key={a.ad_id} className="border-b border-neutral-100 last:border-0">
                  <td className="p-3">
                    <div className="font-medium">{a.ad_name || a.ad_id}</div>
                    <div className="text-xs text-neutral-500">{a.ad_id}</div>
                  </td>
                  <td className="p-3 text-right tabular-nums">{fmt(a.impressions)}</td>
                  <td className="p-3 text-right tabular-nums">{fmt(a.clicks)}</td>
                  <td className="p-3 text-right tabular-nums">{a.ctr.toFixed(2)}</td>
                  <td className="p-3 text-right tabular-nums font-semibold">{fmt(a.lpv)}</td>
                  <td className="p-3 text-right tabular-nums">{money(a.spend)}</td>
                </tr>
              ))}
              {(!d.today || d.today.ads.length === 0) && (
                <tr><td colSpan={6} className="p-6 text-center text-neutral-500">Sin datos de Meta (o campaña aún sin impresiones hoy).</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-neutral-500">Sitios con atribución — top 5</h2>
        <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50">
              <tr>
                <th className="p-3 text-left">Ad</th>
                <th className="p-3 text-right">Sitios creados</th>
              </tr>
            </thead>
            <tbody>
              {d.sites.top_ads.map((a, i) => (
                <tr key={i} className="border-b border-neutral-100 last:border-0">
                  <td className="p-3">
                    <div className="font-medium">{a.ad_name || 'sin ad_name'}</div>
                    <div className="text-xs text-neutral-500">{a.ad_id ?? '—'}</div>
                  </td>
                  <td className="p-3 text-right tabular-nums font-semibold">{a.count}</td>
                </tr>
              ))}
              {d.sites.top_ads.length === 0 && (
                <tr><td colSpan={2} className="p-6 text-center text-neutral-500">Aún no hay sitios con fbclid atribuido.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-4">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-neutral-500">Últimos 20 hits</h2>
        <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white text-xs">
          <table className="w-full">
            <thead className="border-b border-neutral-200 bg-neutral-50">
              <tr>
                <th className="p-2 text-left">Hora</th>
                <th className="p-2 text-left">Evento</th>
                <th className="p-2 text-left">Path</th>
                <th className="p-2 text-left">fbclid</th>
                <th className="p-2 text-left">utm_content</th>
                <th className="p-2 text-left">Referer</th>
              </tr>
            </thead>
            <tbody>
              {d.visitor_hits.last_20.map((h) => (
                <tr key={h.id} className="border-b border-neutral-100 last:border-0">
                  <td className="p-2 tabular-nums text-neutral-500">{new Date(h.created_at).toLocaleTimeString('es-MX', { timeZone: 'America/Mexico_City', hour12: false })}</td>
                  <td className="p-2">{h.event_type}</td>
                  <td className="p-2 truncate max-w-[240px]">{h.path}</td>
                  <td className="p-2 truncate max-w-[160px] font-mono text-[10px]">{h.fbclid ? h.fbclid.slice(0, 24) + '…' : '—'}</td>
                  <td className="p-2">{h.utm_content ?? '—'}</td>
                  <td className="p-2 truncate max-w-[240px] text-neutral-500">{h.referer ?? '—'}</td>
                </tr>
              ))}
              {d.visitor_hits.last_20.length === 0 && (
                <tr><td colSpan={6} className="p-6 text-center text-neutral-500">Aún no hay hits registrados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="text-xs uppercase tracking-wide text-neutral-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
    </div>
  )
}

export default async function PanelCampanaPage() {
  const supabase = await createServerSupabase()
  const { data: userData } = await supabase.auth.getUser()
  const email = userData.user?.email?.toLowerCase() ?? null

  if (!email || !ADMIN_EMAILS.has(email)) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="mb-2 text-xl font-semibold">Panel interno</h1>
        <p className="text-sm text-neutral-600">
          Este panel es solo para el equipo de MiSitio. Inicia sesión con la cuenta autorizada.
        </p>
      </div>
    )
  }

  return (
    <Suspense fallback={<div className="p-8 text-sm text-neutral-500">Cargando métricas…</div>}>
      <Body />
    </Suspense>
  )
}
