// Edge function: campana-snapshot
// Corre cada 1h vía pg_cron. Consulta Meta Insights (nivel `ad`, date_preset=today)
// para la campaña MiSitio y upsertea filas en public.campana_metrics_hourly.
//
// Token en vault.secrets name='meta_ads_token' — se lee vía RPC public.get_meta_ads_token()
// (SECURITY DEFINER, sólo service_role).

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const AD_ACCOUNT = "act_1606757793297187";
const CAMPAIGN_ID = "120249815842560789";
const V = "v24.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface InsightAction { action_type: string; value: string }
interface InsightRow {
  ad_id?: string; ad_name?: string;
  adset_id?: string; adset_name?: string;
  campaign_id?: string; campaign_name?: string;
  impressions?: string; clicks?: string; spend?: string;
  cpm?: string; cpc?: string; ctr?: string;
  reach?: string; frequency?: string;
  actions?: InsightAction[];
  date_start?: string; date_stop?: string;
}

Deno.serve(async (_req: Request) => {
  const t0 = Date.now();
  const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false },
  });

  // 1. Token desde vault
  const { data: tokRow, error: tokErr } = await admin.rpc("get_meta_ads_token");
  if (tokErr || !tokRow) {
    return json({ ok: false, error: "no_token", detail: tokErr?.message }, 500);
  }
  const TOKEN: string = tokRow as unknown as string;

  // 2. Meta Insights
  const fields = [
    "ad_id","ad_name","adset_id","adset_name","campaign_id","campaign_name",
    "impressions","clicks","spend","cpm","cpc","ctr","reach","frequency",
    "actions","date_start","date_stop",
  ].join(",");
  const params = new URLSearchParams({
    level: "ad",
    date_preset: "today",
    fields,
    limit: "200",
    access_token: TOKEN,
    filtering: JSON.stringify([{ field: "campaign.id", operator: "IN", value: [CAMPAIGN_ID] }]),
  });
  const url = `https://graph.facebook.com/${V}/${AD_ACCOUNT}/insights?${params.toString()}`;
  const res = await fetch(url);
  const body = await res.json();
  if (!res.ok || body.error) {
    return json({ ok: false, error: "meta_error", detail: body.error?.message ?? res.statusText, status: res.status }, 500);
  }
  const rows: InsightRow[] = body.data ?? [];

  // 3. Bucket horario en zona MX
  const hourBucket = hourBucketMx();

  const upserts = rows.map((r) => ({
    ad_id: r.ad_id ?? "unknown",
    ad_name: r.ad_name ?? null,
    adset_id: r.adset_id ?? null,
    campaign_id: r.campaign_id ?? CAMPAIGN_ID,
    hour_bucket: hourBucket,
    impressions: Number(r.impressions ?? 0),
    clicks: Number(r.clicks ?? 0),
    spend: Number(r.spend ?? 0),
    cpm: r.cpm ? Number(r.cpm) : null,
    cpc: r.cpc ? Number(r.cpc) : null,
    ctr: r.ctr ? Number(r.ctr) : null,
    reach: r.reach ? Number(r.reach) : null,
    frequency: r.frequency ? Number(r.frequency) : null,
    actions: r.actions ?? null,
    date_start: r.date_start ?? null,
    date_stop: r.date_stop ?? null,
    recorded_at: new Date().toISOString(),
  }));

  let inserted = 0;
  if (upserts.length > 0) {
    const { error, count } = await admin
      .from("campana_metrics_hourly")
      .upsert(upserts, { onConflict: "ad_id,hour_bucket", count: "exact" });
    if (error) {
      return json({ ok: false, error: "db_error", detail: error.message }, 500);
    }
    inserted = count ?? upserts.length;
  }

  return json({
    ok: true,
    rows: rows.length,
    upserted: inserted,
    hour_bucket: hourBucket,
    elapsed_ms: Date.now() - t0,
  });
});

function hourBucketMx(): string {
  // Trunca la hora actual a la HH:00 de America/Mexico_City (UTC-6, sin DST hoy)
  const now = new Date();
  const mx = new Date(now.getTime() - 6 * 60 * 60 * 1000);
  mx.setUTCMinutes(0, 0, 0);
  // Retornamos como ISO con offset -06:00 para que Postgres lo interprete bien
  const iso = mx.toISOString().replace("Z", "-06:00");
  return iso;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
