-- Fase A analytics: cada sitio del cliente puede tener su propio Pixel de Meta
-- y su propio GA4. Los IDs son por-sitio (no por-tenant) porque un mismo dueño
-- puede tener varios sitios, cada uno con su propio anunciante/medición.
-- El gating por plan se aplica en la capa de aplicación (server actions +
-- layout); la BD solo guarda los IDs.

ALTER TABLE public.sites
  ADD COLUMN IF NOT EXISTS meta_pixel_id text,
  ADD COLUMN IF NOT EXISTS ga_measurement_id text,
  ADD COLUMN IF NOT EXISTS analytics_enabled_at timestamptz;

COMMENT ON COLUMN public.sites.meta_pixel_id IS
  'Meta Pixel ID (Facebook/Instagram Ads) del sitio del cliente. 15-16 digitos. Solo se inyecta en planes != free.';
COMMENT ON COLUMN public.sites.ga_measurement_id IS
  'Google Analytics 4 Measurement ID del sitio del cliente. Formato G-XXXXXXXXXX. Solo se inyecta en planes != free.';
COMMENT ON COLUMN public.sites.analytics_enabled_at IS
  'Timestamp de la primera vez que el dueño guardo alguno de sus IDs de analiticas. Para telemetria.';
