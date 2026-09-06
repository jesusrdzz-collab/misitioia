-- Sprint wizard 3 pasos (6-sep-2026)
-- 1) legal_ready flag: si false, el sitio se publica pero (a) muestra banner
--    al dueño y (b) NO renderiza scripts de Meta Pixel/GA4 (coherente con
--    LFPDPPP: sin aviso de privacidad completo, no puedes activar trackers).
-- 2) responsable_nombre / responsable_domicilio en site_content:
--    OBLIGATORIOS por LFPDPPP para el aviso de privacidad ("responsable del
--    tratamiento de datos personales"). Se recolectan en el paso 1b del wizard.
-- 3) wizard_step: dónde se quedó el cliente si cerró el navegador durante la
--    creación (retomar desde ahí).

-- ---------- sites.legal_ready ----------
ALTER TABLE public.sites
  ADD COLUMN IF NOT EXISTS legal_ready boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.sites.legal_ready IS
  'true cuando el sitio tiene los datos legales obligatorios completos (contacto, dirección, responsable, domicilio del responsable). Mientras sea false, el panel muestra banner al dueño y se bloquean los scripts de Meta/GA. Recalculado por checkLegalReady() en cada save del panel/wizard.';

-- ---------- sites.wizard_step ----------
ALTER TABLE public.sites
  ADD COLUMN IF NOT EXISTS wizard_step text;

COMMENT ON COLUMN public.sites.wizard_step IS
  'Último paso del wizard de creación en el que quedó el cliente: paso-1a | paso-1b | paso-2 | paso-3 | done. Permite retomar donde lo dejó si cerró el navegador. Null en sitios generados desde TerraLeads.';

-- ---------- site_content.responsable_nombre + responsable_domicilio ----------
ALTER TABLE public.site_content
  ADD COLUMN IF NOT EXISTS responsable_nombre text,
  ADD COLUMN IF NOT EXISTS responsable_domicilio text;

COMMENT ON COLUMN public.site_content.responsable_nombre IS
  'Nombre o razón social del responsable del tratamiento de datos personales (LFPDPPP, art. 3 fr. XIV). Puede coincidir con business_name o no. Obligatorio para publicar con legal_ready=true.';

COMMENT ON COLUMN public.site_content.responsable_domicilio IS
  'Domicilio para oír y recibir notificaciones del responsable (LFPDPPP). Puede coincidir con contact_address (checkbox "usar la misma") o ser distinto (ej. domicilio fiscal). Obligatorio para publicar con legal_ready=true.';
