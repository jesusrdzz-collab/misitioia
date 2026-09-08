# Campaña MiSitio IA — Log Diario

> **Meta:** validar que la campaña Meta genera registros + creaciones de sitio (no solo LPV).
> **Presupuesto:** $150 MXN/día (Advantage+ · MX · 25+ · Traffic LPV). Escalar cuando validemos.
> **Encendida:** 2026-09-07 22:58 -0600 MTY (start_time reportado por Meta para la campaña).
> **Panel interno:** [https://misitio.site/panel-campana](https://misitio.site/panel-campana) (login con `jesus2rdzz@gmail.com`).
> **Ad Account:** `act_1606757793297187` (Jr Diseño y Publicidad)
> **Campaign ID:** `120249815842560789` (MiSitio · Prospeccion Sept 2026)
> **Ad Set ID:** `120249815842640789` (Advantage+ · MX · 25+ · Traffic LPV)

---

## Métricas clave a monitorear (diario)

| # | Métrica | Fuente | Objetivo día 1 (validación) |
|---|---|---|---|
| 1 | Impresiones | Meta API (`insights` level=ad) | > 3,000 |
| 2 | Clicks | Meta API | > 60 |
| 3 | Landing Page Views (LPV) | Meta API (`actions.landing_page_view`) | > 30 |
| 4 | Visitantes únicos misitio.site | Supabase `visitor_hits` (unique `session_id`) | > 20 |
| 5 | Sessions atribuidas a Meta (fbclid) | Supabase `visitor_hits` (unique `fbclid`) | > 10 |
| 6 | Victoria opens | Supabase `visitor_hits` (`event_type=victoria_open`) | > 5 |
| 7 | Signups (auth.users nuevos) | Supabase auth | > 3 |
| 8 | Sitios creados | Supabase `sites` (created hoy) | > 1 |
| 9 | Sitios con atribución Meta | Supabase `sites` (`attribution_fbclid` NOT NULL) | > 1 |
| 10 | Costo por LPV | Meta API (`spend/lpv`) | < $5 MXN |
| 11 | Costo por sitio creado | calculado (`spend/sites_hoy`) | referencia |

**El objetivo del DÍA 1 no es rentabilidad — es que las tuberías reporten.** Si LPV llegan pero
`visitor_hits` sale en cero, hay un bug en el beacon; si `visitor_hits` llegan pero `sites` en cero,
hay fricción en el flujo de creación.

---

## Día 0 — 2026-09-06 (sábado) — Setup pre-campaña

**Estado:** cero pauta, prep total del cañón.

**Trabajo hecho:**
- 26 AdCreatives armados en Ads Manager (14 imágenes + 12 UGC videos)
- Cuenta migrada a Jr Diseño y Publicidad (`act_1606757793297187`); `instagram_user_id`
  apuntado a `@jrdesarrollodigital` para que los ads aparezcan también en el feed IG
- 13 publicaciones orgánicas encoladas en `ig_publish_queue` (variante Copy A de cada anuncio) —
  cron `*/5 * * * *` publica al ritmo del rate limit de Meta
- Sprint MiSitio: watermark `misitio.site` en todas las imágenes generadas por IA
- 5 plantillas de sitio ya funcionando (herramienta post-signup lista)

**Commits del día:**
- `2401433` feat(creativos): watermark `misitio.site` en imagenes generadas por IA
- `52c967a` feat(ig-publisher): cola pg_cron para publicar 12 posts orgánicos en @jrdesarrollodigital

**Métricas:** N/A — campaña apagada.

---

## Día 1 — 2026-09-07 (domingo) — Encendido + instrumentación

**Estado:** campaña ACTIVE. Start time reportado por Meta: `22:58:04 -0600`. Instrumentación
terminada durante la tarde para que las primeras impresiones ya caigan capturadas.

### Trabajo hecho HOY (por bloques)

#### Bloque 1 — Fixes P0 pre-campaña (commit `aa8ea97`)
- Catálogo de giros: 54 opciones + "Otros" (para no perder al que no encaja)
- Prompts de imagen por giro (dejaron de generarse fotos genéricas de "negocio bonito")
- WhatsApp del sitio publicado ahora arranca con texto pre-llenado ("Hola, vi su web…")

#### Bloque 2 — Candado 1 regen por foto (commit `aaf4c46`)
- CAS `<slot>_regens_used = 0 → 1` para hero/about/catalog: cada dueño puede regenerar cada
  imagen 1 sola vez con Gemini. Tope duro de costo antes de encender pauta.
- Si Gemini cae a stock: se hace rollback del contador (no penalizamos algo que no gastó).

#### Bloque 3 — Subdominios (commit `9c991f8`)
- Todo sitio publicado se sirve en `{slug}.misitio.site` (comodín ya montado en Vercel).
- 301 automático desde `misitio.site/sites/{slug}` para no perder legacy links.
- Middleware wizard/panel actualizado para enlazar al subdominio del sitio del cliente.

#### Bloque 4 — Sistema de tracking + dashboard (esta entrega — 18:14 MTY)

**Migrations aplicadas** (`supabase/migrations/20260907100000_campaign_tracking.sql`,
`campaign_tracking` en producción):
- `visitor_hits` (fbclid, utm_*, path, referer, ip_hash HMAC, user_agent, session_id)
- Columnas de atribución en `sites` y `tenants`: `attribution_fbclid`, `attribution_ad_id`,
  `attribution_ad_name`, `attribution_source`, `attribution_campaign`, `attribution_content`,
  `attribution_captured_at`
- `campana_metrics_hourly` (snapshot horario Meta Insights por `ad_id`, UNIQUE `(ad_id, hour_bucket)`)
- Vista `victoria_funnel_daily` para agregación diaria
- Función `get_meta_ads_token()` SECURITY DEFINER (patrón `ig_page_token`)
- Vault secret `meta_ads_token` instalado (id `5acfe198-4a1e-41d6-8a8d-7479f592954a`, 206 chars)

**Código nuevo:**
- `src/lib/attribution.ts` — cookies `_mis_fbclid`, `_mis_utm_*`, `_mis_sid`, `_mis_land_at`; helpers `stampAttributionCookies` (middleware) + `readStoredAttribution` (server actions) + `hashIp` (HMAC-SHA-256, salt via `HIT_IP_SALT`)
- `src/middleware.ts` — envuelve TODAS las respuestas con `stampAttributionCookies` (apex/api/subdominio/dominio-propio/legacy)
- `src/app/api/hit/route.ts` — endpoint POST anónimo (service_role, RLS revoked). Cero PII en claro.
- `src/features/analytics/components/HitBeacon.tsx` — beacon cliente montado en root layout; usa `navigator.sendBeacon` con fallback a `fetch keepalive`. Guard por sessionStorage: 1 hit por `(path, eventType)` por load.
- `src/features/editor/tools.ts` — `createSite` sella `attribution_*` en `sites` y `tenants` desde `ExecCtx.attribution`.
- `src/features/editor/actions.ts` — lee cookies con `readStoredAttribution` al armar el `ExecCtx`.
- `src/lib/meta-ads.ts` — cliente Meta Insights server-side; helpers `getCampaignInsights`, `landingPageViews`, `actionValue`.
- `src/app/panel-campana/page.tsx` — dashboard interno server-component, `revalidate: 300`, protegido por email (`PANEL_CAMPANA_EMAILS` env).
- `supabase/functions/campana-snapshot/index.ts` — edge function que lee token de vault, hace GET a Meta Insights nivel `ad` para la campaña, upsertea en `campana_metrics_hourly` con `(ad_id, hour_bucket)` como clave única.

**pg_cron activo** (`jobid=2`, `campana-snapshot`, schedule `5 * * * *`): dispara la edge function al minuto 5 de cada hora.

**Env vars en Vercel producción:**
- `META_ADS_TOKEN` (long-lived de wclimas, 206 chars)
- `HIT_IP_SALT` (32-byte hex, aleatorio recién generado)
- `PANEL_CAMPANA_EMAILS` = `jesus2rdzz@gmail.com`

**Smoke test edge function (18:14 MTY):**
```
POST /functions/v1/campana-snapshot → {"ok":true,"rows":0,"upserted":0,"hour_bucket":"2026-09-07T18:00:00.000-06:00","elapsed_ms":1126}
```
`rows: 0` porque el campaign `start_time` = `22:58 -0600`; a las 18:14 aún no había impresiones (esperado).
Función OK, token OK, upsert OK.

### Anuncios en la campaña (26 activos)

Todos en el ad set `120249815842640789` (Advantage+ · MX · 25+ · Traffic LPV). Ping ejecutado
2026-09-07 18:14 MTY, todos con `status=ACTIVE`.

**14 imágenes (7 conceptos × 2 variantes A/B):**

| Ad ID | Nombre | Pilar/Concepto |
|---|---|---|
| 120249815869740789 | v1_mecanico_A | Invisibilidad — el mecánico |
| 120249815869770789 | v1_mecanico_B | Invisibilidad — el mecánico |
| 120249815869750789 | v2_dental_A | Vergüenza — sin web dental |
| 120249815869700789 | v2_dental_B | Vergüenza — sin web dental |
| 120249815869810789 | v3_cliente_A | Dinero — pierde clientes |
| 120249815869780789 | v3_cliente_B | Dinero — pierde clientes |
| 120249815870120789 | v4_tiendita_A | Competencia — la tiendita local |
| 120249815870180789 | v4_tiendita_B | Competencia — la tiendita local |
| 120249815870050789 | v5_laptop_A | Solución — genera en 60s |
| 120249815870160789 | v5_laptop_B | Solución — genera en 60s |
| 120249815870190789 | v6_30k_A | Dinero — cuánto cobran |
| 120249815870140789 | v6_30k_B | Dinero — cuánto cobran |
| 120249815870520789 | v7_reunion_A | Vergüenza — la reunión |
| 120249815870490789 | v7_reunion_B | Vergüenza — la reunión |

**12 UGC videos (3 conceptos × 2 géneros × 2 variantes):**

| Ad ID | Nombre |
|---|---|
| 120249815870810789 | ugc_v1_hombre_A |
| 120249815870850789 | ugc_v1_hombre_B |
| 120249815871820789 | ugc_v1_mujer_A |
| 120249815872000789 | ugc_v1_mujer_B |
| 120249815870960789 | ugc_v2_hombre_A |
| 120249815870930789 | ugc_v2_hombre_B |
| 120249815871940789 | ugc_v2_mujer_A |
| 120249815872030789 | ugc_v2_mujer_B |
| 120249815871280789 | ugc_v3_hombre_A |
| 120249815871370789 | ugc_v3_hombre_B |
| 120249815872670789 | ugc_v3_mujer_A |
| 120249815872600789 | ugc_v3_mujer_B |

Tabla de conversión por anuncio se va llenando automáticamente en `campana_metrics_hourly` y
las columnas `attribution_ad_id` de `sites` — visibles en `/panel-campana`.

### Métricas del día — 2026-09-07

**Cierre 18:14 MTY (aún antes del start_time real 22:58):**
- Impresiones: 0 (campaña aún no arranca)
- Clicks: 0
- LPV: 0
- Gasto: $0
- Visitantes propios: — (el beacon apenas se acaba de encender; los primeros hits caerán con la primera impresión Meta)
- Sitios creados hoy: consultar con `/panel-campana`

Rellenar mañana cierre 23:59 MTY.

---

## Día 2, 3, 4... — placeholder

Rellenar al cierre de cada día con:
- Impresiones / Clicks / LPV / Gasto (de Meta)
- Visitor hits + Victoria opens (de Supabase)
- Signups + Sitios creados hoy (auth.users + sites)
- Top 3 ads por LPV
- Top 3 ads por sitios creados
- Decisiones tomadas (pausar / duplicar presupuesto / etc.)

---

## Cambios de código relevantes por día

| Fecha | Commit | Feature |
|---|---|---|
| 2026-09-06 | `2401433` | Watermark `misitio.site` |
| 2026-09-06 | `52c967a` | Cola pg_cron IG publisher orgánico |
| 2026-09-07 | `aa8ea97` | 3 fixes P0 pre-campaña (giros +Otros, prompts, WA pre-llenado) |
| 2026-09-07 | `aaf4c46` | Candado 1 regen por foto |
| 2026-09-07 | `9c991f8` | Subdominios `{slug}.misitio.site` + 301 legacy |
| 2026-09-07 | (esta entrega) | Sistema de tracking + `/panel-campana` + edge `campana-snapshot` + pg_cron |

---

## Deuda técnica remanente (honesta)

- **Legal — cookie `_mis_sid` y `_mis_fbclid` sin banner de consentimiento.** Son IDs opacos y no PII directamente, pero para GDPR/LFPDPPP estricto convendría mencionarlas en el aviso de privacidad (`/aviso-de-privacidad`). Bajo impacto porque no cruzamos data con terceros; alto retorno si Jesús quiere blindar antes de escalar el gasto.
- **Atribución solo por cookie de primera visita.** Si el usuario limpia cookies o entra en otro navegador antes de crear su sitio, perdemos el fbclid. Mejoras futuras: usar `session_id` en el POST del beacon para hilar hits del mismo dispositivo, y guardar el último fbclid visto antes del signup.
- **`fbclid → ad_id` sin mapeo directo.** Meta manda el `fbclid` pero para saber a QUÉ ad pertenece, hay que usar `?utm_content={{ad.id}}` en las URLs de los anuncios. Cuando Jesús añada `utm_content={{ad.id}}` en cada URL de destino en Ads Manager, el mapeo queda automático. Mientras tanto, se usa `attribution_fbclid` como proxy (todo lo que trae fbclid vino de la campaña — aún no de qué ad).
- **Beacon en subdominios de clientes.** El `HitBeacon` también dispara en `{slug}.misitio.site` (viene en el layout raíz). Es intencional (queremos ver también qué pasa dentro de los sitios generados), pero conviene revisar por si se desea filtrar.
- **Vista `victoria_funnel_daily` solo cuenta lo que ya guardamos como event_type.** El evento `victoria_open` requiere instrumentar el widget de Victoria para POSTear al beacon con `event_type='victoria_open'` cuando abre. Eso queda como próximo pequeño commit (todavía no hecho — el widget existente NO llama al beacon).
- **Snapshot horario acumula filas por día × ads.** ~24 horas × 26 ads = 624 filas/día. En 3 meses son ~56k filas — trivial en Postgres, pero conviene VACUUM o roll-up mensual antes de fin de año.
