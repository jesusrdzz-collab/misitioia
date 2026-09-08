/**
 * Cliente mínimo de Meta Marketing Insights para el dashboard interno de
 * la campaña MiSitio. Server-side only. Token vía env `META_ADS_TOKEN`.
 *
 * Endpoint: GET https://graph.facebook.com/v24.0/{ad_account_id}/insights
 * Docs: https://developers.facebook.com/docs/marketing-api/insights
 */

export const META_AD_ACCOUNT_ID = process.env.META_AD_ACCOUNT_ID || 'act_1606757793297187'
export const META_CAMPAIGN_ID   = process.env.META_CAMPAIGN_ID  || '120249815842560789'
export const META_GRAPH_VERSION = 'v24.0'

export interface InsightAction {
  action_type: string
  value: string
}

export interface InsightRow {
  ad_id?: string
  ad_name?: string
  adset_id?: string
  adset_name?: string
  campaign_id?: string
  campaign_name?: string
  impressions?: string
  clicks?: string
  spend?: string
  cpm?: string
  cpc?: string
  ctr?: string
  reach?: string
  frequency?: string
  actions?: InsightAction[]
  date_start?: string
  date_stop?: string
}

interface InsightsResponse {
  data?: InsightRow[]
  error?: { message: string; type?: string; code?: number }
}

export type DatePreset = 'today' | 'yesterday' | 'last_7d' | 'last_14d' | 'last_30d'

/** Extrae el valor de una action_type específica de un row de insights. */
export function actionValue(actions: InsightAction[] | undefined, type: string): number {
  if (!actions) return 0
  const found = actions.find((a) => a.action_type === type)
  return found ? Number(found.value) || 0 : 0
}

/**
 * Landing Page Views = evento estándar 'landing_page_view'.
 * Meta a veces lo entrega también como 'onsite_conversion.total_messaging_connection' —
 * no aplica en un objetivo de traffic/LPV. Aquí sólo miramos LPV pura.
 */
export function landingPageViews(row: InsightRow): number {
  return actionValue(row.actions, 'landing_page_view')
}

/**
 * Llama a Meta Insights a nivel `level` para la ad account y devuelve las rows.
 * Falla ruidosamente si la respuesta no es 2xx o Meta responde con error.
 */
export async function getCampaignInsights(opts: {
  level?: 'account' | 'campaign' | 'adset' | 'ad'
  datePreset?: DatePreset
  campaignId?: string | null
} = {}): Promise<InsightRow[]> {
  const level = opts.level ?? 'ad'
  const datePreset = opts.datePreset ?? 'today'
  const campaignId = opts.campaignId ?? META_CAMPAIGN_ID

  const token = process.env.META_ADS_TOKEN
  if (!token) throw new Error('META_ADS_TOKEN no configurado')

  const fields = [
    'ad_id',
    'ad_name',
    'adset_id',
    'adset_name',
    'campaign_id',
    'campaign_name',
    'impressions',
    'clicks',
    'spend',
    'cpm',
    'cpc',
    'ctr',
    'reach',
    'frequency',
    'actions',
    'date_start',
    'date_stop',
  ].join(',')

  const params = new URLSearchParams({
    level,
    date_preset: datePreset,
    fields,
    limit: '200',
    access_token: token,
  })
  if (campaignId) {
    params.set('filtering', JSON.stringify([
      { field: 'campaign.id', operator: 'IN', value: [campaignId] },
    ]))
  }

  const url = `https://graph.facebook.com/${META_GRAPH_VERSION}/${META_AD_ACCOUNT_ID}/insights?${params.toString()}`
  const res = await fetch(url, { cache: 'no-store' })
  const body = (await res.json()) as InsightsResponse
  if (!res.ok || body.error) {
    throw new Error(`Meta insights: ${body.error?.message ?? res.statusText} (HTTP ${res.status})`)
  }
  return body.data ?? []
}
