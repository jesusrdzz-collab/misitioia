-- Candado de 1 regeneración IA por foto por sitio (Sprint 7-sep-2026).
--
-- Antes de encender la campaña Meta necesitamos poner un tope duro al costo
-- de Gemini por sitio. Cada sitio puede regenerar CADA una de las 3 fotos
-- (hero, about, catalog) UNA SOLA VEZ. Después el botón queda deshabilitado.
--
--   Costo tope Gemini por sitio: 3 iniciales stock + 3 regens IA × $0.039
--                              = $0.117 USD (peor caso, cliente regenera las 3).
--
-- La subida de foto propia sigue siendo ilimitada (no cuesta tokens).
ALTER TABLE public.site_content
  ADD COLUMN IF NOT EXISTS hero_regens_used INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS about_regens_used INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS catalog_regens_used INT NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.site_content.hero_regens_used IS 'Regeneraciones IA usadas en hero (max 1) - candado costo Gemini';
COMMENT ON COLUMN public.site_content.about_regens_used IS 'Regeneraciones IA usadas en about (max 1) - candado costo Gemini';
COMMENT ON COLUMN public.site_content.catalog_regens_used IS 'Regeneraciones IA usadas en catalog (max 1) - candado costo Gemini';
