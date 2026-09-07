-- Fix P0 pre-campaña Meta (2026-09-07):
-- Añade giro_libre para cuando el cliente elige "otros" en el wizard
-- y describe su giro con texto libre. Se usa en los prompts de IA y como
-- contexto para plantillas cuando el giro no está en el catálogo.
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS giro_libre TEXT;

COMMENT ON COLUMN public.sites.giro_libre IS 'Texto libre cuando giro="otros" o cuando el giro del catálogo no describe bien el negocio. Prioridad para prompts de IA.';
