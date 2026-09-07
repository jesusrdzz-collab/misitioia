-- Cola de publicaciones orgánicas a Instagram @jrdigutal desde MiSitio.
-- Origen: entrega nocturna del 7-sep-2026 — publicar 13 posts orgánicos alineados
-- con los 26 anuncios de MiSitio (variante Copy A). IG API rechaza scheduled_publish_time
-- para nuestra app, así que caemos en pg_cron + edge function ig-publisher.
--
-- Aplicado en producción (proyecto mthlqoploeisigzvwory) el 2026-09-07 06:57 UTC
-- vía MCP execute_sql/apply_migration. Este archivo queda como respaldo versionable.

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE TABLE IF NOT EXISTS public.ig_publish_queue (
  id            bigserial PRIMARY KEY,
  ig_user_id    text        NOT NULL,
  kind          text        NOT NULL CHECK (kind IN ('photo','video')),
  media_url     text        NOT NULL,
  caption       text        NOT NULL,
  scheduled_at  timestamptz NOT NULL,
  status        text        NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','container_pending','published','failed')),
  creation_id   text,
  published_id  text,
  attempts      int         NOT NULL DEFAULT 0,
  error         text,
  container_created_at timestamptz,
  published_at         timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ig_publish_queue_scheduled_idx
  ON public.ig_publish_queue (status, scheduled_at);

ALTER TABLE public.ig_publish_queue ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ig_publish_queue FROM PUBLIC, anon, authenticated;

-- Token de página FB (para publicar como @jrdigutal) vive en vault.secrets con name='ig_page_token'.
-- Se materializa/actualiza fuera de esta migración (no lo commiteamos).

CREATE OR REPLACE FUNCTION public.get_ig_page_token()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, vault
AS $$
  SELECT decrypted_secret
    FROM vault.decrypted_secrets
   WHERE name = 'ig_page_token'
   LIMIT 1;
$$;

REVOKE EXECUTE ON FUNCTION public.get_ig_page_token() FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.get_ig_page_token() TO service_role;

-- El schedule vive en cron.job — se levanta con:
--   SELECT cron.schedule('ig-publisher', '*/5 * * * *', $CRON$
--     SELECT net.http_post(
--       url := 'https://mthlqoploeisigzvwory.supabase.co/functions/v1/ig-publisher',
--       headers := jsonb_build_object('Content-Type', 'application/json'),
--       body := jsonb_build_object('trigger', 'pg_cron'),
--       timeout_milliseconds := 60000
--     );
--   $CRON$);
--
-- La edge function ig-publisher lee filas 'pending' cuya scheduled_at <= now(),
-- crea el media container en Graph API v24.0/17841425238793372/media, y publica.
-- Ver supabase/functions/ig-publisher/index.ts.
