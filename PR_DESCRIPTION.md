# Fase A — Analíticas del cliente: Pixel de Meta + GA4 con consentimiento

## Qué se hizo

Se conecta el Pixel de Meta y Google Analytics 4 al sitio publicado del cliente
sin exponer ningún secreto y respetando la LFPDPPP:

1. **Migración BD** — `supabase/migrations/20260905005000_add_analytics_ids_to_sites.sql`.
   Agrega tres columnas a `public.sites` (por-sitio, no por-tenant: un mismo
   dueño puede tener varios sitios con distinto anunciante):

   - `meta_pixel_id text` (nullable)
   - `ga_measurement_id text` (nullable)
   - `analytics_enabled_at timestamptz` (nullable — cuándo se guardó por primera vez)

   Se aplicó a Supabase por MCP (`apply_migration`) — proyecto `mthlqoploeisigzvwory`
   ("MiSitio IA"). Sin RLS nueva: se hereda de `sites`.

2. **Panel del cliente** — nueva ruta `/editar/analiticas`:
   - `src/app/editar/analiticas/page.tsx` (server component; lee sesión y plan).
   - `src/features/analytics/components/AnalyticsPanel.tsx` (formulario cliente).
   - Se agregó "Analíticas" al `DashboardShell` con ícono 📈.
   - Plan `free` → vista bloqueada con candado + CTA "Sube a Emprende".
   - Plan `emprende|crece|pro` → formulario con dos campos, validación en
     cliente y servidor, ayuda con link a Meta Events Manager y Google Analytics.

3. **Server action + validación** — `src/features/analytics/actions.ts` y
   `src/features/analytics/validation.ts`:
   - `saveAnalyticsIds(siteId, { metaPixelId, gaMeasurementId })`.
   - Flujo: sesión → `authorizeSiteAccess` → gate por plan (rechaza `free`) →
     Zod (regex conservador: Pixel `^[0-9]{15,16}$`, GA4 `^G-[A-Z0-9]{8,12}$`)
     → escritura por service_role acotada al siteId.
   - Marca `analytics_enabled_at` la primera vez que se guarda un ID.
   - Revalida `/editar/analiticas` y el layout del sitio.

4. **Inyección en el sitio publicado** —
   `src/app/sites/[slug]/layout.tsx` ahora carga (server-side) el plan del
   tenant + IDs del sitio vía nuevo helper anónimo
   `src/features/analytics/queries.ts` (`getSiteAnalyticsBySlug`).
   - Los scripts se renderizan sólo si `plan !== 'free'` Y hay al menos un ID.
   - `src/features/analytics/components/AnalyticsScripts.tsx` inyecta:
     - Meta Pixel: init, `consent revoke` por defecto, PageView diferido
       hasta consentimiento; `<noscript>` fallback.
     - GA4: `gtag('consent', 'default', ...denied)` (Consent Mode v2),
       `send_page_view: false`, `page_view` disparado al aceptar.
   - Ambos escuchan el `CustomEvent('cookie-consent-changed')` que emite el banner.
   - `next/script` con `strategy="afterInteractive"`.
   - Los IDs se escapan antes de inyectarlos aunque ya vengan validados
     (defensa en profundidad, `safeJsString`).

5. **Banner de consentimiento** —
   `src/features/analytics/components/CookieConsentBanner.tsx`. Client
   component al pie del sitio. Botones "Aceptar" (granted) y "Solo esenciales"
   (denied). Persiste en `localStorage.cookieConsent` + `cookieConsent_at` con
   TTL 12 meses; try/catch en todos los accesos. Aparece sólo si no hay
   elección persistida y sólo cuando el layout activa `enabled={true}` (ya
   filtrado por plan + ID). Link a `/cookies` del propio sitio.

6. **Aviso de privacidad / cookies del sitio del cliente** —
   `src/features/legal/legal-content.ts` acepta ahora un `LegalAnalyticsFlags`
   opcional. Cuando el sitio tiene analíticas activas:
   - En Aviso de Privacidad (sección 5, cookies): se añade un párrafo
     mencionando a Meta Platforms y/o Google como responsables externos y que
     nada se dispara sin consentimiento.
   - En Política de Cookies (sección 2): se añaden viñetas específicas por
     proveedor activo.
   Las páginas `/sites/[slug]/aviso-de-privacidad/page.tsx` y `/cookies/page.tsx`
   ahora leen los IDs para pasar esos flags.

## Qué se probó (build local)

- `npx tsc --noEmit` — verde, sin errores.
- `npx next build` — verde. Ruta `/editar/analiticas` compila como `ƒ` (dinámica).
  Los sitios `/sites/[slug]` siguen dinámicos con revalidate 3600.
- La advertencia `[sitemap] supabaseUrl is required` es preexistente (env vars
  no disponibles en esta shell) y no bloquea el build.

## Qué falta para Fase B

- **Conversions API (server-side)** — capturar eventos `Lead`, `Contact` cuando
  el visitante manda WhatsApp / llama / usa el widget de Victoria. Requiere
  guardar el `access_token` del Pixel por sitio y montar un endpoint que envíe
  eventos por HTTP a `graph.facebook.com` con hash de IP/UA.
- **GA4 Measurement Protocol** equivalente para eventos server-side.
- Deduplicación cliente/servidor por `event_id`.
- Página de test/depuración para el cliente (ver eventos en tiempo real).

## Archivos tocados

Ver `git diff --cached --stat` — 14 archivos, +888/-9 líneas. Nada tocado
fuera de: `src/app/editar/analiticas`, `src/app/sites/[slug]/{layout,aviso*,cookies}`,
`src/features/{analytics,legal,dashboard}`, `src/lib/types/site.ts` y la nueva
migración en `supabase/migrations/`. **No se tocó:** landing, auth, generador,
Victoria, Stripe, ni middleware.

## Riesgos residuales — decidir antes del push

1. **Deploy Vercel con `jesus2rdzz@gmail.com`.** La memoria dice que ese email
   bloquea deploys de Vercel y hay que usar `jesusrdzz@gmail.com` (sin el 2).
   `git config user.email` en este repo local está en `jesus2rdzz@gmail.com`
   igual que en todos los commits anteriores del historial — parece que se
   está pusheando bien con esa cuenta actualmente, pero conviene confirmarlo
   antes del push.
2. **Regex conservador del Pixel ID** (`^[0-9]{15,16}$`). Pixels muy antiguos
   podrían ser algo más cortos. Recomiendo probar con **un Pixel real** antes
   de anunciar la función; si algún cliente lo tiene con menos dígitos, aflojar
   a 13-16.
3. **Fetch de analíticas en el layout del sitio.** Cada render del layout
   (ISR cada hora + revalidate on-save) hace una query extra a Supabase para
   plan+IDs. Es una query barata, indexada por `slug`, pero suma. Alternativa
   futura: componer el mismo objeto ya leído por `getSiteBySlug` en `page.tsx`
   y pasarlo por contexto (no crítico ahora — la ISR amortigua).
4. **`safeJsString` es defensivo, no cripto.** El regex de Zod ya garantiza
   que un ID válido sólo tiene `[0-9A-Z-]`; el escape es doble seguridad por
   si Zod cambia. No es una fuente de seguridad primaria.
5. **Consent Mode v2 y `wait_for_update: 500`.** Elegí 500ms como buffer entre
   el default `denied` y el update `granted`; suficiente para la mayoría de
   redes. Un usuario que acepte cookies en <500ms tras la carga inicial ya
   dispara `page_view` gracias al listener.
6. **Banner al pie sobre widget de Victoria.** El widget de Victoria también
   se ancla al pie derecho. Visualmente conviven (el banner ocupa ancho
   completo con max-w-3xl centrado; Victoria es una burbuja lateral), pero
   en móviles muy angostos podrían solaparse en la primera visita. En una
   siguiente pasada se puede subir el `z-index` de Victoria por encima o
   correrla mientras el banner esté visible.
7. **Pixel + GA sin CAPI aún.** iOS 14+ y bloqueadores hacen que Pixel
   client-only sub-reporte 25-40%. Fase B (CAPI) es la que devuelve fidelidad.

## Qué NO se pudo hacer (escalar decisiones)

- **No se pusheó** — sigue como commit local. Espero autorización explícita
  de Jesús (regla dura del brief).
- **No probé con un Pixel/GA reales.** No tengo IDs de prueba a mano. Recomendado
  probar con uno del propio Konnex antes de mencionar la función a clientes.
- **No modifiqué el widget de Victoria** para reservar espacio cuando el banner
  esté visible — riesgo residual #6 arriba. Si Jesús quiere, lo dejo listo en
  un pequeño follow-up.
