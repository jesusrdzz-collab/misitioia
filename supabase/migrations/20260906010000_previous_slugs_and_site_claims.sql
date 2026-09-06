-- Fase 9.1 legales+slugs+reclamación (6-sep-2026)
--
-- 1) previous_slugs[] permite redirección 301 desde slugs antiguos con guiones
--    a los canónicos concatenados. Los subdominios legacy siguen resolviendo.
-- 2) site_claims: bandeja de solicitudes "es mi negocio" con evidencia
--    subida por el reclamante; un humano las revisa manualmente.

-- ---------- previous_slugs en sites ----------
ALTER TABLE public.sites
  ADD COLUMN IF NOT EXISTS previous_slugs text[] NOT NULL DEFAULT ARRAY[]::text[];

COMMENT ON COLUMN public.sites.previous_slugs IS
  'Slugs anteriores de este sitio (usualmente con guiones antes de sep-2026). Se conservan para 301-redirect y para no romper enlaces vivos. El middleware busca aquí cuando el slug de la URL no existe como slug canónico.';

-- Índice para la búsqueda por miembro (previous_slugs @> ARRAY['x'])
CREATE INDEX IF NOT EXISTS sites_previous_slugs_gin
  ON public.sites USING GIN (previous_slugs);

-- Poblar previous_slugs para los sitios existentes con guiones y renombrar al
-- canónico concatenado. Se conserva el slug viejo en previous_slugs para el
-- 301. Solo aplica a los sitios que aún tengan guion en su slug actual.
DO $$
DECLARE
  r record;
  new_slug text;
  collision int;
BEGIN
  FOR r IN
    SELECT id, slug FROM public.sites WHERE slug LIKE '%-%'
  LOOP
    new_slug := replace(r.slug, '-', '');
    -- Si colisiona con un slug existente distinto al propio, sufijo numérico.
    SELECT count(*) INTO collision
      FROM public.sites
     WHERE slug = new_slug AND id <> r.id;
    IF collision > 0 THEN
      new_slug := new_slug || '2';
    END IF;
    -- No reasignar si por alguna razón ya coincide o el destino existe.
    IF new_slug <> r.slug THEN
      UPDATE public.sites
         SET slug = new_slug,
             previous_slugs = array_append(previous_slugs, r.slug)
       WHERE id = r.id;
    END IF;
  END LOOP;
END $$;

-- ---------- site_claims (reclamación de negocio) ----------
CREATE TABLE IF NOT EXISTS public.site_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  slug text NOT NULL,
  claimant_name text NOT NULL,
  claimant_email text NOT NULL,
  claimant_phone text,
  relation text NOT NULL,
  evidence_url text,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'pendiente'
    CHECK (status IN ('pendiente', 'aprobado', 'rechazado', 'contactado')),
  ip_address inet,
  user_agent text,
  admin_notes text,
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS site_claims_site_id_idx ON public.site_claims(site_id);
CREATE INDEX IF NOT EXISTS site_claims_status_idx ON public.site_claims(status);
CREATE INDEX IF NOT EXISTS site_claims_created_at_idx ON public.site_claims(created_at DESC);

COMMENT ON TABLE public.site_claims IS
  'Solicitudes públicas de "reclamación de negocio". Un tercero afirma ser el dueño de un sitio y sube evidencia. Un admin revisa y decide. NUNCA da de baja el sitio automáticamente — sustituye al botón público "darla de baja".';

-- RLS: sólo escritura pública (anon puede INSERT). Lectura sólo admin.
ALTER TABLE public.site_claims ENABLE ROW LEVEL SECURITY;

-- Anyone can create a claim (this is the whole point).
DROP POLICY IF EXISTS site_claims_public_insert ON public.site_claims;
CREATE POLICY site_claims_public_insert ON public.site_claims
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- No public reads. Server-side admin (service_role) hace bypass de RLS.
-- Los dueños autenticados pueden ver las reclamaciones de sus propios sitios
-- (útil para el panel del cliente en el futuro; hoy no se expone).
DROP POLICY IF EXISTS site_claims_owner_select ON public.site_claims;
CREATE POLICY site_claims_owner_select ON public.site_claims
  FOR SELECT TO authenticated
  USING (
    site_id IN (
      SELECT s.id FROM public.sites s
      JOIN public.tenants t ON t.id = s.tenant_id
      WHERE t.owner_email = (auth.jwt() ->> 'email')
    )
  );
