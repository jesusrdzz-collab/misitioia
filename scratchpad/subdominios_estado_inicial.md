# Estado inicial migración subdominios wildcard — 07-sep-2026 08:32 MTY

## Ya funciona ✅
- Middleware ya extrae subdomain y hace rewrite a `/sites/[slug]` (con custom_domain fallback + legacy slugs con guion).
- `siteUrl(slug)` en `src/lib/domain.ts` ya devuelve `https://{slug}.{ROOT_DOMAIN}`.
- Metadata de `/sites/[slug]/page.tsx` ya usa `b.url` en `alternates.canonical` y `openGraph.url`.
- `sitemap.ts` ya emite `https://{slug}.{ROOT_DOMAIN}` para cada sitio.
- `SiteFooter`, `LegalPage`, JSON-LD, llms.txt ya son URL-neutrales (usan `base` o `b.url`).
- Smoke inicial: `misitio.site/` 200, `misitio.site/sites/segurosjr` 200, `segurosjr.misitio.site/` 200.

## Falta ❌
1. **301** desde `misitio.site/sites/{slug}[/rest]` → `https://{slug}.misitio.site[/rest]`.
2. **Links "Ver mi sitio"** en apex apuntan a `/sites/${slug}` (interno) en 7 lugares:
   - `Paso1bForm.tsx:92` (wizard)
   - `Paso2Grid.tsx:52` (wizard)
   - `Paso3Images.tsx:72` (wizard)
   - `TemplateGrid.tsx:88` (panel apariencia)
   - `EditorWorkspace.tsx:148` (chat editor)
   - `DashboardShell.tsx:83` (sidebar panel)
   - `baja/[slug]/page.tsx:69` (link "No, volver")
3. **RESERVED_SUBDOMAINS** (middleware) sólo tiene 6 nombres; slug.ts tiene 21. Falta unificar y añadir 'panel', 'signup', 'auth', 'email' + preview hosts de Vercel.
4. **twitter card** ausente en metadata del site.
5. **metadataBase** ausente en metadata del site.

## No tocar
- `revalidatePath('/sites/{slug}')` — es la ruta Next.js interna, correcta.
- `previewUrl = '/sites/${slug}?preview=X'` en `EditorWorkspace.tsx:46` — iframe interno del editor, apex-origin.
- El wizard slug.ts genera slugs sin guiones; el middleware ya redirige legacy con guion al canónico.
