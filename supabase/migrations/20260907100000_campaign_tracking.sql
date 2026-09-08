-- Tracking + atribución para la campaña Meta MiSitio (encendida 7-sep-2026).
-- Objetivo: cerrar el bucle click en ad → visita en misitio.site →
-- conversación con Victoria → signup → sitio creado. Sin instrumentación
-- interna es imposible saber qué anuncio de los 26 traer registros de verdad
-- (Meta reporta clics/LPV, pero no signup ni site creado).
--
-- Aplicado en producción (proyecto mthlqoploeisigzvwory) el 2026-09-07 vía
-- MCP apply_migration. Este archivo queda como respaldo versionable.

-- ————————————————————————————————————————————————————————————————
-- 1) visitor_hits — cada request de landing con fbclid/utm
-- ————————————————————————————————————————————————————————————————
CREATE TABLE IF NOT EXISTS public.visitor_hits (
  id           bigserial PRIMARY KEY,
  event_type   text        NOT NULL DEFAULT 'pageview'
               CHECK (event_type IN ('pageview','victoria_open','victoria_signup_redirect')),
  fbclid       text,
  utm_source   text,
  utm_medium   text,
  utm_campaign text,
  utm_content  text,
  utm_term     text,
  path         text        NOT NULL DEFAULT '/',
  referer      text,
  ip_hash      text,        -- HMAC-SHA256(ip, salt) — NUNCA IP en claro
  user_agent   text,
  session_id   text,        -- cookie _mis_sid para hilar múltiples hits
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS visitor_hits_fbclid_idx
  ON public.visitor_hits (fbclid) WHERE fbclid IS NOT NULL;
CREATE INDEX IF NOT EXISTS visitor_hits_created_idx
  ON public.visitor_hits (created_at DESC);
CREATE INDEX IF NOT EXISTS visitor_hits_event_idx
  ON public.visitor_hits (event_type, created_at DESC);

COMMENT ON TABLE public.visitor_hits IS
  'Instrumentación de tráfico de la campaña Meta MiSitio. Solo fbclid/utms/path/referer/UA/ip_hash — cero PII en claro.';

ALTER TABLE public.visitor_hits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.visitor_hits FROM PUBLIC, anon, authenticated;
-- service_role escribe desde /api/hit (server side); nadie más.

-- ————————————————————————————————————————————————————————————————
-- 2) Atribución en sitios creados y tenants
-- ————————————————————————————————————————————————————————————————
ALTER TABLE public.sites
  ADD COLUMN IF NOT EXISTS attribution_fbclid   text,
  ADD COLUMN IF NOT EXISTS attribution_ad_id    text,
  ADD COLUMN IF NOT EXISTS attribution_ad_name  text,
  ADD COLUMN IF NOT EXISTS attribution_source   text,   -- utm_source
  ADD COLUMN IF NOT EXISTS attribution_campaign text,   -- utm_campaign
  ADD COLUMN IF NOT EXISTS attribution_content  text,   -- utm_content (ad-level)
  ADD COLUMN IF NOT EXISTS attribution_captured_at timestamptz;

CREATE INDEX IF NOT EXISTS sites_attribution_fbclid_idx
  ON public.sites (attribution_fbclid) WHERE attribution_fbclid IS NOT NULL;
CREATE INDEX IF NOT EXISTS sites_attribution_ad_id_idx
  ON public.sites (attribution_ad_id) WHERE attribution_ad_id IS NOT NULL;

ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS attribution_fbclid   text,
  ADD COLUMN IF NOT EXISTS attribution_ad_id    text,
  ADD COLUMN IF NOT EXISTS attribution_ad_name  text,
  ADD COLUMN IF NOT EXISTS attribution_source   text,
  ADD COLUMN IF NOT EXISTS attribution_campaign text,
  ADD COLUMN IF NOT EXISTS attribution_content  text,
  ADD COLUMN IF NOT EXISTS attribution_captured_at timestamptz;

-- ————————————————————————————————————————————————————————————————
-- 3) campana_metrics_hourly — snapshot de Meta Insights cada 1h
-- ————————————————————————————————————————————————————————————————
CREATE TABLE IF NOT EXISTS public.campana_metrics_hourly (
  id           bigserial PRIMARY KEY,
  recorded_at  timestamptz NOT NULL DEFAULT now(),
  hour_bucket  timestamptz NOT NULL,           -- date_trunc('hour', now() at time zone 'America/Mexico_City')
  ad_id        text        NOT NULL,
  ad_name      text,
  adset_id     text,
  campaign_id  text,
  impressions  bigint      NOT NULL DEFAULT 0,
  clicks       bigint      NOT NULL DEFAULT 0,
  spend        numeric(12,4) NOT NULL DEFAULT 0,
  cpm          numeric(12,4),
  cpc          numeric(12,4),
  ctr          numeric(12,4),
  reach        bigint,
  frequency    numeric(8,4),
  actions      jsonb,          -- LPV, ThruPlay, etc. tal cual devuelve Meta
  date_start   date,
  date_stop    date,
  UNIQUE (ad_id, hour_bucket)
);

CREATE INDEX IF NOT EXISTS campana_metrics_hour_idx
  ON public.campana_metrics_hourly (hour_bucket DESC, ad_id);
CREATE INDEX IF NOT EXISTS campana_metrics_ad_idx
  ON public.campana_metrics_hourly (ad_id, recorded_at DESC);

COMMENT ON TABLE public.campana_metrics_hourly IS
  'Snapshot horario de Meta Insights por ad. Ancla histórica aunque el dashboard falle.';

ALTER TABLE public.campana_metrics_hourly ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.campana_metrics_hourly FROM PUBLIC, anon, authenticated;

-- ————————————————————————————————————————————————————————————————
-- 4) victoria_funnel_daily view — resumen para el dashboard
-- ————————————————————————————————————————————————————————————————
CREATE OR REPLACE VIEW public.victoria_funnel_daily AS
SELECT
  DATE(created_at AT TIME ZONE 'America/Mexico_City') AS dia,
  COUNT(*) FILTER (WHERE event_type = 'pageview')                  AS pageviews,
  COUNT(*) FILTER (WHERE event_type = 'victoria_open')             AS victoria_opens,
  COUNT(*) FILTER (WHERE event_type = 'victoria_signup_redirect')  AS victoria_to_signup,
  COUNT(DISTINCT fbclid) FILTER (WHERE fbclid IS NOT NULL)         AS unique_fbclids,
  COUNT(DISTINCT session_id) FILTER (WHERE session_id IS NOT NULL) AS unique_sessions
FROM public.visitor_hits
GROUP BY 1
ORDER BY 1 DESC;

-- ————————————————————————————————————————————————————————————————
-- 5) Vault secret para el token Meta Ads (patrón ig_page_token)
-- ————————————————————————————————————————————————————————————————
-- El secret 'meta_ads_token' se INSERTA fuera de esta migración (contiene el
-- token de wclimas). Aquí solo dejamos la RPC que lo lee.

CREATE OR REPLACE FUNCTION public.get_meta_ads_token()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, vault
AS $$
  SELECT decrypted_secret
    FROM vault.decrypted_secrets
   WHERE name = 'meta_ads_token'
   LIMIT 1;
$$;

REVOKE EXECUTE ON FUNCTION public.get_meta_ads_token() FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.get_meta_ads_token() TO service_role;

-- El schedule pg_cron se levanta con:
--   SELECT cron.schedule('campana-snapshot', '5 * * * *', $CRON$
--     SELECT net.http_post(
--       url := 'https://mthlqoploeisigzvwory.supabase.co/functions/v1/campana-snapshot',
--       headers := jsonb_build_object('Content-Type', 'application/json'),
--       body := jsonb_build_object('trigger', 'pg_cron'),
--       timeout_milliseconds := 60000
--     );
--   $CRON$);
