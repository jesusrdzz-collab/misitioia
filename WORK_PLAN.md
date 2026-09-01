# WORK_PLAN - MiSitio IA (Creador de Sitios Web con IA)
> **Estado**: 🟢 EN PRODUCCIÓN (operando + cobrando en real; Victoria "de regreso" verificada en vivo 1-sep)
> **Última actualización**: 2026-09-01
> **Producto core COMPLETO y en producción.** Pendientes = mejoras, no bloqueos: conectar Victoria a la home de misitio.site (en curso, falta token del tenant Konnex ffd460a0), checkout de créditos #102, SMTP magic link #101 (Google login ya funciona), auto-attach de dominio propio con token scoped #100. **FINALIZADO solo lo marca Jesús.**
> **Fase actual**: Fase 9 — lanzamiento y monetización (logo oficial + login Google en prod + panel del cliente + Stripe)
>
> ✅ **SESIÓN 1-sep-2026 (grande):**
> - **Logo oficial** (hexágono MS) en nav, login (lockup), selector e íconos PWA/favicon — desplegado.
> - **Login con Google EN PRODUCCIÓN**: OAuth client + consent publicado (Search Console verificado) + provider Supabase. **Custom Domain `auth.misitio.site`** activo → el login ya NO muestra `supabase.co` (memoria `supabase-login-dominio-propio`). `NEXT_PUBLIC_SUPABASE_URL` apunta al dominio propio.
> - **Runtime encendido**: `GEMINI_API_KEY` + `SUPABASE_SERVICE_ROLE_KEY` en Vercel (la service_role se había corrompido al pegar por Chrome → 401 en la creación; corregida por API. Memoria `vercel-secret-paste-chrome-corrupts`). **Creación de sitios funcionando.**
> - **Panel del cliente** (menú lateral): Mi sitio · Datos de Victoria (contacto/horarios/servicios/catálogo con precios) · Instalar · Conectar dominio · Mi plan. Desplegado.
> - **Stripe billing EN LIVE** ✅: `/api/stripe/checkout|webhook|portal` + PlanPanel; BD 4 planes + columnas de suscripción. Prueba de cobro test ✅ (webhook→BD verificado). Pasado a **LIVE** (precios+webhook live, cuenta principal 51SS39y). Además se crearon en LIVE los **5 paquetes de créditos Konnex** (para #102). Solo pendiente de #102 el checkout que suma al monedero compartido.
> - **Puente de Victoria (de regreso a Konnex), lado MiSitio HECHO** ✅ (commit eafe49d, INERTE): widget en `/sites/[slug]`, proxy `/api/victoria` (token server-side), medidor en PlanPanel. El lado Konnex (endpoints webchat) está construido/revisado pero se despliega vía el agente de Jesús en la **rama v7** (#099). Ver `ESTUDIO/CONTRATO_VICTORIA_KONNEX_MISITIO_2026-09-01.md` + memorias `victoria-kb-en-konnex`, `konnex-ramas-y-deploy`.
> - **Pendientes derivados**: activar Victoria (deploy Konnex v7 + token) #099, checkout de créditos al monedero #102, dominio-cliente automático #100, unificar planes/SMTP #101, Stripe live prueba real (NO cobrarse) #098.
> **Fase 8 (previa)**: plugin/embed para sitios que YA existen ✅ MVP funcional — snippet universal + Victoria embebida + auditoría AEO + /instalar + plugin WordPress
> **Planes (landing, actualizado 31-ago-2026)**: modelo nuevo en USD — Free $0 (25 conv Victoria) · Emprende $10 (100) · Crece $25 (400, destacado) · Pro $50 (1,000). Diferenciador = nº de conversaciones/mes; excedente a granel con créditos Konnex. Fuente: `ESTUDIO/PLANES_Y_CREDITOS_MISITIO_IA_2026-08-31.md` (en `PROYECTOS/ESTUDIO/`). Reemplaza los viejos $0/$349/$699 MXN.
> **Dominio**: **misitio.site** (comprado vía Vercel, conectándose por Jesús). Subdominios `negocio.misitio.site`, panel `app.misitio.site`. Configurable por env `NEXT_PUBLIC_ROOT_DOMAIN` (default `misitio.site`, ver `src/lib/domain.ts`). ⚠️ Falta poner `NEXT_PUBLIC_ROOT_DOMAIN=misitio.site` en el env de Vercel.
> **Supabase**: ✅ mthlqoploeisigzvwory (ACTIVE_HEALTHY, us-east-1)
> **Repo**: ✅ https://github.com/jesusrdzz-collab/misitioia
> **Vercel**: ✅ https://misitioia.vercel.app (deploy exitoso)

---

## Decisiones de arquitectura tomadas

### 5b — Reusar Konnex como motor de chat/CRM/IA (CONFIRMADO 27-ago-2026)
- **Decisión:** El nivel 2 (de pago) NO reimplementa bandeja, CRM, Victoria ni handover. En su lugar, crea un tenant de Konnex con canal `webchat`.
- **Razón:** Reimplementar son ~62,294 líneas / 134 archivos / 10-16 semanas. Agregar canal web a Konnex son ~1,500 líneas / 1-2 semanas. El canal `webchat` ya existe en el tipo `Platform` de Konnex.
- **Implicación:** MiSitio IA tiene su propio Supabase multi-tenant para sitios/contenido/productos/suscripciones. Las conversaciones/CRM se sirven desde Konnex vía API. El dueño del negocio ve todo desde el panel de MiSitio IA.
- **Costos internos:** No hay licencia Konnex — es nuestro. Costo real por tenant nivel 2: ~$1-3 USD/mes (tokens Gemini). Margen: ~$16-18 USD sobre los $349 MXN.

### Nombre y dominio (CONFIRMADO 27-ago-2026)
- **Nombre:** MiSitio IA
- **Dominio:** misitioia.com ($11.25 USD/año, verificado disponible)
- **Subdominios de clientes:** `negocio.misitioia.com`
- **Panel admin:** `app.misitioia.com`

### Base de código reutilizable de PAG WEB TIENDA MIRAGE
- **Stack Mirage:** Vite + React 19 (JSX, no TSX) — NO es Next.js. El sub-proyecto `src/` tiene un skeleton Next.js 16 vacío.
- **Reutilizable (~60%):** UI del chat widget (shell, animaciones, teaser bubble), componentes de catálogo (ProductCard, filtros, modales), panel admin, hooks de UI.
- **NO reutilizable:** System prompt hardcodeado de MIRA, integración WooCommerce, credenciales hardcodeadas, tracking con IDs fijos, schema single-tenant.
- **Decisión:** No copiar código de Mirage directamente. Tomar los patrones y componentes como referencia, reescribir en TypeScript con multi-tenancy desde el día 1.

---

## Fases de desarrollo

### Fase 0 — Setup inicial
> **Estado:** EN PROGRESO
> **Criterio de terminado:** `prueba.misitioia.com` sirve una página real

- [ ] 0.1 Comprar dominio `misitioia.com` en Vercel — **PENDIENTE: compra manual** por Jesús en https://vercel.com/domains/search?q=misitioia.com
- [x] 0.2 Crear proyecto Supabase "MiSitio IA" — ref `mthlqoploeisigzvwory`, us-east-1
- [x] 0.3 Inicializar proyecto Next.js 16 + TypeScript + Tailwind — Next.js 16.3.3, React 19.2.8, Tailwind 4
- [x] 0.4 Crear repo GitHub `misitioia` — https://github.com/jesusrdzz-collab/misitioia
- [ ] 0.5 Configurar dominio comodín `*.misitioia.com` en Vercel — **requiere 0.1**
- [x] 0.6 Deploy inicial — https://misitioia.vercel.app ✅ live
- [ ] 0.7 Definir topes de conversaciones por nivel y costo de excedente
- [x] 0.8 Middleware de subdomain routing (slug → /sites/[slug])
- [x] 0.9 Supabase client/server helpers (@supabase/ssr)
- [x] 0.10 Tipos TypeScript del sistema multi-tenant
- [x] 0.11 Landing page con pricing ($0 / $349 / $699 MXN)
- [x] 0.12 Página placeholder de sitio de negocio

### Fase 1 — Multi-tenant + enrutamiento por subdominio
> **Estado:** ✅ COMPLETA (31-ago-2026)
> **Criterio de terminado:** Dos sitios distintos en dos subdominios ✅

- [x] 1.1 Migración Supabase: tablas `tenants`, `sites`, `site_content`, `site_products` — aplicada (migración `phase1_multitenant_core`)
- [x] 1.2 RLS por `tenant_id` en todas las tablas — políticas por dueño (email JWT = owner_email) + lectura pública de sitios publicados. Advisor de seguridad en verde.
- [x] 1.3 Middleware Next.js: host → subdominio → `/sites/[slug]` (ya existía; validado). En Next 16 es "Proxy (Middleware)".
- [x] 1.4 Reserva de subdominios — tabla `reserved_subdomains` (18 slugs) + set fallback en código (`slug.ts`)
- [x] 1.5 Resolución de colisiones — `resolveUniqueSlug()` con sufijo `-2, -3...` (`src/features/generator/slug.ts`)
- [x] 1.6 Dos sitios reales en dos slugs distintos, aislados por tenant: `casa-de-bienestar-animal-de-san-nicolas` (tenant eec8...) y `refaccionaria-sam` (tenant 2c09...). En producción resuelven a `{slug}.misitioia.com` vía el middleware existente.

### Fase 2 — GENERADOR AUTOMÁTICO (⚡ LA MÁS URGENTE)
> **Estado:** ✅ FUNCIONAL end-to-end (31-ago-2026). Runtime en prod pendiente SOLO de service keys (ver abajo).
> **Criterio de terminado:** De una fila de `leads` sale una página publicada ✅ (2 sitios reales generados)
> **Dependencia:** La campaña de llamadas ya tiene qué prometer.

- [x] 2.1 Función `generateSiteFromLead(leadId)` — `src/features/generator/generate-site.ts`. Separada en `composeSiteContent()` (puro, redacción) + `persistGeneratedSite()` (BD, service_role). Lee lead de TerraLeads vía `lead-source.ts`.
- [x] 2.2 Prompt a Gemini — `src/features/generator/gemini.ts`. Reglas anti-invención y anti-marketing-barato (patrón reimplementado de `ai-lead-gen`). Modelo `gemini-2.5-flash`, `responseMimeType: application/json`, `maxOutputTokens: 8192` (los tokens de "thinking" cuentan → 2048 truncaba el JSON). Salida validada/saneada.
- [x] 2.3 Plantilla por giro — `src/features/generator/templates.ts` (8 plantillas: salud_animal, automotriz, salud, belleza, fitness, retail, construccion, hogar, generico) + mapa de los 40 giros. Paleta y emoji distintos por giro.
- [x] 2.4 Página estática con ISR — `revalidate = 3600` en `/sites/[slug]`.
- [x] 2.5 URL del sitio: `{slug}.misitioia.com` (prod) / `misitioia.vercel.app/sites/{slug}` (mientras no haya dominio).
- [x] 2.6 Estado `generado` (sin reclamar) por defecto.
- [x] 2.7 Meta `noindex, nofollow` hasta reclamar — `generateMetadata` indexa solo si status ∈ {reclamado, activo}.
- [x] 2.8 Baja inmediata — enlace en footer → `/baja/[slug]` con Server Action que pone `dado_de_baja` (RLS lo oculta al instante).
- [x] 2.9 Generación en lote — `listCandidateLeads()` + endpoint `POST /api/generate` `{ "batch": N }` (protegido con `GENERATOR_SECRET`).
- [x] 2.10 Prueba real — `scripts/generate-test-site.ts` corrió sobre 2 leads reales (veterinaria 899 reseñas, refaccionaria 693) → 2 sitios publicados, verificados por lectura anon (RLS).

**⚠️ Pendiente para runtime automático en producción (NO bloquea; equivalente al dominio):**
`.env.local` y env de Vercel necesitan `SUPABASE_SERVICE_ROLE_KEY` (MiSitio) y `TERRALEADS_SUPABASE_SERVICE_KEY` (lectura de leads) + `GENERATOR_SECRET`. No son recuperables por MCP (son secretos). La prueba real usó Gemini real + persistencia vía MCP (elevado). Una vez cargadas las keys, `POST /api/generate` genera solo.

### Fase 2.5 — Pulido (legales + AEO + rediseño)
> **Estado:** ✅ COMPLETA (31-ago-2026)
> **Criterio de terminado:** Los 2 sitios de prueba tienen páginas legales, AEO por sitio y nuevo diseño moderno. Build + typecheck en verde, deploy READY.

**Mejora 1 — Páginas legales por sitio**
- [x] 2.5.1 Generador legal desde plantilla mexicana — `src/features/legal/legal-content.ts` (Aviso de Privacidad conforme LFPDPPP, Términos de servicio estándar, Política de Cookies). Rellena datos reales del negocio; nada inventado (usa genéricos legales donde falta el dato).
- [x] 2.5.2 Rutas `/terminos`, `/aviso-de-privacidad`, `/cookies` bajo `src/app/sites/[slug]/` + render `src/features/legal/LegalPage.tsx` con branding del giro.
- [x] 2.5.3 Footer del sitio enlaza las 3 legales — `src/features/sites/components/SiteFooter.tsx`. Enlaces context-aware (`src/features/sites/base-path.ts`): funcionan en subdominio y en la URL de prueba `/sites/{slug}`.

**Mejora 2 — AEO (visibilidad para chatbots de IA)**
- [x] 2.5.4 JSON-LD `LocalBusiness` por sitio con datos reales (name, address, telephone, aggregateRating real, openingHours, sameAs) — `src/features/aeo/structured-data.ts`. Presente SIEMPRE (describe negocio real).
- [x] 2.5.5 `meta robots` gateado por estado: `generado` → `noindex,nofollow`; `reclamado`/`activo` → `index,follow` + `max-snippet:-1, max-image-preview:large, max-video-preview:-1`.
- [x] 2.5.6 `/llms.txt` por sitio — `src/app/sites/[slug]/llms.txt/route.ts` + `src/features/aeo/llms.ts`. Siempre disponible (solo describe negocio real; no publica en Google).
- [x] 2.5.7 `robots.txt` de plataforma — `src/app/robots.ts`. Permite bots IA (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended, CCBot, cohere-ai, Bytespider, Amazonbot, Meta-ExternalAgent). Apunta al sitemap.
- [x] 2.5.8 `sitemap.ts` — `src/app/sitemap.ts` lista SOLO sitios `reclamado`/`activo` (los `generado` NO van al sitemap). `listIndexableSites()` en queries.

**Decisión de gating AEO por estado (documentada):**
| Elemento | `generado` (sin reclamar) | `reclamado` / `activo` |
|---|---|---|
| meta robots | `noindex, nofollow` | `index, follow` + flags snippet |
| En sitemap.xml | ❌ No | ✅ Sí |
| JSON-LD LocalBusiness | ✅ Sí (negocio real) | ✅ Sí |
| /llms.txt | ✅ Sí (negocio real) | ✅ Sí |
| robots.txt (permite bots IA) | ✅ Sí (nivel plataforma, no por status) | ✅ Sí |

Razón: no publicamos en Google miles de sitios sin reclamar (anti-spam SEO), pero el JSON-LD y el llms.txt de datos reales sí ayudan a que la IA reconozca el negocio cuando el dueño pregunte. `dado_de_baja` queda oculto por RLS → 404 en todo.

**Mejora 3 — Rediseño moderno y elegante**
- [x] 2.5.9 Tipografía premium — `src/app/sites/[slug]/layout.tsx` carga Playfair Display (display) + Inter (cuerpo) vía next/font, con fallbacks.
- [x] 2.5.10 Rediseño `src/app/sites/[slug]/page.tsx`: barra sticky con CTA, hero con glows + curva SVG + rating con estrellas reales, highlights flotantes, sección "conócenos" con tarjeta de rating, servicios con hover-lift + barra de acento, catálogo, contacto con mapa embebido de Google (sin API key) + horarios, banda CTA final. Mobile-first. Personalización por giro conservada (color + emoji por rubro).
- [x] 2.5.11 Validado: build + typecheck verde; ambos sitios de prueba renderizan 200; JSON-LD, llms.txt, robots.txt y sitemap verificados por curl.

### Fase 3 — Plantillas por giro
> **Estado:** PENDIENTE
> **Criterio de terminado:** Una veterinaria y una refaccionaria se ven distintas y correctas

- [ ] 3.1 Diseño base: plantilla genérica responsive
- [ ] 3.2 Variantes para los 10 giros de mayor prioridad (prioridad 10 en giros_catalogo):
  - veterinaria, dentista, gimnasio, estética, refaccionaria, aire acondicionado, taller mecánico, mueblería, boutique, ferretería
- [ ] 3.3 Paleta de colores y estilo por giro
- [ ] 3.4 Secciones condicionales (ej: "Nuestros servicios" vs "Nuestro menú")
- [ ] 3.5 Imágenes genéricas por giro (stock o generadas)

### Fase 4 — EDITOR TIPO CHAT (Base44/Hostinger AI) ⚡ nueva Fase 4
> **Estado:** ✅ v1 FUNCIONAL (31-ago-2026). Loop chat→IA→edición→preview probado end-to-end con Gemini real.
> **Criterio de terminado:** El dueño edita/crea su página conversando por chat y ve el preview en vivo ✅
> **Cambio de alcance:** El editor ya NO es un panel de formularios; es un **chat conversacional** con dos entradas: edición del sitio generado y **creación autoservicio** desde cero (sin depender de TerraLeads).

**UI de chat + preview en vivo**
- [x] 4.1 `EditorWorkspace` (2 paneles, mobile-first): hilo de mensajes + input + subida de imágenes + preview en `<iframe>` del sitio real (`/sites/{slug}`) que se recarga al aplicar cambios (cache-bust `?preview=N`). Toggle Chat/Vista previa en móvil. — `src/features/editor/components/EditorWorkspace.tsx`
- [x] 4.2 Burbujas de chat con lista de cambios aplicados (✓ por herramienta) + adjuntos de imagen.

**Auth por magic link (Supabase, sin password)**
- [x] 4.3 `LoginGate` (client) → Server Action `sendMagicLink` (server-side, setea verifier PKCE en cookie) → `emailRedirectTo=/auth/callback`.
- [x] 4.4 `GET /auth/callback` → `exchangeCodeForSession(code)` → redirige a `next`. `signOut` action.
- [x] 4.5 El dueño solo edita SU sitio: `authorizeSiteAccess(siteId, email)` compara `tenants.owner_email` con el email del JWT. Escrituras con service_role SOLO tras autorizar (evita el bug de `createBrowserClient` sin JWT — data 100% server-side con Server Actions).

**Agente de IA con tool-calling (Gemini `gemini-2.5-flash`)**
- [x] 4.6 Loop de function-calling por fetch REST (mismo patrón del generador, sin SDK extra) — `src/features/editor/agent.ts`. Encadena varias herramientas en un turno; máx 6 pasos.
- [x] 4.7 8 herramientas de edición + 1 de creación, con args validados por Zod — `src/features/editor/tools.ts`: `updateBusinessInfo`, `updateBranding` (color/emoji), `updateHours`, `setServices`, `addProduct`, `updateProduct`, `setLogo`, `setHeroImage`, `createSite`.
- [x] 4.8 Regla anti-invención heredada: si falta un dato, el chat lo PIDE (no inventa). System prompt en español mexicano, anti-marketing-barato.
- [x] 4.9 Contexto del sitio (snapshot) inyectado al modelo, incluye `product_id` para `updateProduct` — `src/features/editor/context.ts`.

**Imágenes (Supabase Storage multi-tenant)**
- [x] 4.10 Bucket `site-images` (público para render) + columnas `logo_url`, `hero_image_url`, `emoji` en `site_content` (migración `phase4_editor_images_and_storage`).
- [x] 4.11 Políticas por tenant en `storage.objects` (insert/update/delete solo el dueño de la carpeta `{tenant_id}/...`; lectura pública). Advisor de seguridad en verde.
- [x] 4.12 Server Action `uploadSiteImage` (autoriza → sube con service_role → URL pública). El render del sitio muestra logo (barra), portada (hero) y emoji custom.

**Creación autoservicio (`/crear`) y edición (`/editar`)**
- [x] 4.13 `/crear`: chat en blanco → herramienta `createSite` crea tenant+site+content reusando `resolveUniqueSlug()` y `templateForGiro()`, estado `reclamado`, dueño = email autenticado. Tras crear, las siguientes herramientas editan el sitio nuevo en el mismo turno.
- [x] 4.14 `/editar`: tras magic link, lista los sitios del dueño (o abre directo si es uno); si no tiene, ofrece **reclamar por slug** (`ClaimForm` → `claimSite`) o crear uno nuevo.
- [x] 4.15 Re-render tras cada cambio: `revalidatePath('/sites/{slug}')` en la Server Action → preview e ISR reflejan la edición.
- [x] 4.16 Landing (`/`) enlaza a `/crear` y `/editar` (antes apuntaba a `/registro` y `/login` inexistentes).

**Validación**
- [x] 4.17 `npm run typecheck` + `npm run build` en verde (todas las rutas presentes: `/crear`, `/editar`, `/auth/callback`). Pages renderizan 200 en runtime (LoginGate sin sesión).
- [x] 4.18 Loop de IA probado con Gemini real (`scripts/test-editor-agent.ts`): mensaje "cambia color + agrega 2 servicios + pon horario" → 3 herramientas correctas, args válidos (hex exacto, servicios, horario 7 días con Domingo Cerrado), confirmación natural en español.

**⚠️ Pendiente para runtime prod (NO bloquea; secretos que carga Jesús):**
- `SUPABASE_SERVICE_ROLE_KEY` y `GEMINI_API_KEY` en el env de Vercel (ya usados por el generador; el editor los reutiliza). Local: `SUPABASE_SERVICE_ROLE_KEY` está VACÍA en `.env.local`, por eso el test de BD usa un cliente simulado; el loop de IA sí es real.
- `NEXT_PUBLIC_ROOT_DOMAIN=misitio.site` en Vercel.
- Auth Supabase: agregar la URL de redirect (`https://misitio.site/auth/callback`, `https://misitioia.vercel.app/auth/callback` y `http://localhost:3000/auth/callback`) al allow-list de Redirect URLs, y tener SMTP para enviar el magic link.
- **Nota de seguridad (v1):** reclamar un sitio `generado` (sin dueño) solo pide el slug + un correo verificado por magic link. Endurecer la verificación (ej. código al teléfono/correo de la ficha) queda para una iteración posterior.

### Fase 5 — Widget de chat + canal web en Konnex
> **Estado:** PENDIENTE
> **Criterio de terminado:** El asistente contesta sobre el catálogo y el relevo humano funciona

- [ ] 5.1 Widget de chat frontend embebible (componente React)
- [ ] 5.2 En Konnex: webhook endpoint `POST /api/webhooks/webchat` (~200 loc)
- [ ] 5.3 En Konnex: pipeline mensaje web → Victoria → respuesta
- [ ] 5.4 Base de conocimiento por tenant alimentada desde datos del sitio
- [ ] 5.5 Victoria contesta sobre el catálogo del negocio
- [ ] 5.6 Handover: si el visitante pide humano, notificar al dueño
- [ ] 5.7 Tope de conversaciones mensual + aviso de límite

### Fase 5b — Onboarding Konnex programático
> **Estado:** PENDIENTE
> **Criterio de terminado:** Al subir a nivel 2, se crea tenant Konnex automáticamente

- [ ] 5b.1 API para crear tenant en Konnex desde MiSitio IA
- [ ] 5b.2 Vincular tenant Konnex ↔ sitio en MiSitio IA
- [ ] 5b.3 Panel MiSitio IA muestra conversaciones desde Konnex
- [ ] 5b.4 El dueño ve bandeja y CRM desde el panel de MiSitio IA

### Fase 6 — Stripe, planes y topes
> **Estado:** PENDIENTE
> **Criterio de terminado:** Se puede pagar, subir de plan, y el tope se respeta

- [ ] 6.1 Productos y precios en Stripe (cuenta principal)
- [ ] 6.2 Checkout flow para nivel 2 y nivel 3
- [ ] 6.3 Webhook de Stripe → activar/desactivar features por nivel
- [ ] 6.4 Sistema de topes de conversaciones con contador
- [ ] 6.5 Opción de comprar conversaciones adicionales
- [ ] 6.6 Migración a dominio propio (nivel 3): redirect 301, SSL

### Fase 7 — Entregables obligatorios de la fábrica
> **Estado:** PENDIENTE
> **Criterio de terminado:** Checklist de la fábrica completo

- [ ] 7.1 Landing page en `/` (la de MiSitio IA como producto)
- [ ] 7.2 Aviso de privacidad en `/privacy`
- [ ] 7.3 Términos y condiciones en `/terms`
- [ ] 7.4 Mobile responsive en todos los módulos
- [ ] 7.5 PWA manifest + iconos

---

## Datos técnicos de referencia

### TerraLeads (fuente de leads)
- **Supabase project:** `xnffgxnzwqqkghdwhxyj`
- **Tabla `leads`:** 45 registros, 40 sin sitio web (89%)
- **Campos útiles:** business_name, giro, address, phone_primary, rating, reviews_count, categoria_google, social_facebook, social_instagram, place_id, ciudad, zona, estado
- **raw_data.outscraper:** working_hours (JSON español), category, subtypes, verified, google_id
- **raw_data.crawl:** social, whatsapps, emails, phones
- **NO incluye:** fotos, texto de reseñas
- **Tabla `giros_catalogo`:** 40 giros (20 activos), con slug, nombre y prioridad

### Konnex (motor de chat/CRM/IA)
- **Supabase project:** `pnbzsljqymoghmebyxru`
- **Canales soportados:** whatsapp | instagram | facebook | email | **webchat** | tiktok | twitter
- **Modelo IA Victoria:** gemini-2.5-flash-lite (configurable via env VICTORIA_AI_MODEL)
- **SDK:** @google/generative-ai (Gemini directo)
- **Realtime:** Sí, Supabase Realtime para inbox
- **Tamaño total:** 153,755 loc, 119 API routes

### PAG WEB TIENDA MIRAGE (referencia de código)
- **Stack real (en producción):** Vite + React 19 (JSX) — NO es Next.js
- **Chat widget MIRA:** `mirage-ai-widget/src/components/ChatWidget.jsx` (1,876 líneas)
- **Modelo:** gemini-2.5-flash (frontend directo, sin streaming)
- **Catálogo:** WooCommerce REST API → componentes React (ProductCard, ProductDetailModal, ProductFilters)
- **Single-tenant:** hardcodeado a Tienda Mirage

---

## Skills activados
> Pendiente: seleccionar 5-10 skills del repositorio una vez inicie la fase 1.

---

## Aprendizajes (Auto-Blindaje)

### 2026-08-27: No copiar código Mirage directamente
- **Error potencial:** Mirage es Vite + JSX single-tenant. Copiar y adaptar sería más trabajo que reescribir con multi-tenancy desde cero en Next.js + TypeScript.
- **Fix:** Usar Mirage como referencia de patrones (especialmente ChatWidget y catálogo), no como código base.
- **Aplicar en:** Este proyecto.

### 2026-08-27: Outscraper no incluye fotos ni texto de reseñas
- **Dato:** El payload de TerraLeads tiene `reviews` como número (ej: 49), no como texto. No hay URLs de fotos.
- **Fix:** Arrancar páginas sin foto (genérica por giro) y con "4.9 ★ (49 reseñas)" sin texto.
- **Aplicar en:** Generador automático (fase 2).

### 2026-08-31: gemini-2.5-flash gasta tokens de "thinking" del presupuesto
- **Error:** Con `maxOutputTokens: 2048` + `responseMimeType: application/json`, el JSON salía truncado (finishReason MAX_TOKENS) porque los `thoughtsTokenCount` cuentan contra el tope.
- **Fix:** Subir a `maxOutputTokens: 8192`. Para JSON grande, dar aire de sobra.
- **Aplicar en:** Toda llamada a gemini-2.5-flash que devuelva JSON estructurado.

### 2026-08-31: working_hours de Outscraper es {dia: [rango]} con días en minúscula/acento
- **Dato:** `raw_data.outscraper.working_hours` = `{"lunes":["8a.m.-4p.m."],"domingo":["Cerrado"]}`. Valor = ARRAY, día en español minúscula con acento.
- **Fix:** `normalizeWorkingHours()` mapea a `{"Lunes":"8 a.m. – 4 p.m."}` respetando orden lunes→domingo, tolera "miercoles"/"sabado" sin acento.
- **Aplicar en:** Generador (fase 2), y cualquier consumo de horarios de TerraLeads.

### 2026-08-31: git user.email del repo estaba mal (jesus2rdzz con "2")
- **Error:** El repo tenía `user.email = jesus2rdzz@gmail.com`; Vercel bloquea deploys si el autor no coincide con la cuenta.
- **Fix:** `git config user.email jesusrdzz@gmail.com` (sin "2") en el repo.
- **Aplicar en:** Este repo (misitioia).

### 2026-08-31: RLS — el sitio público se sirve con anon key, la generación con service_role
- **Decisión:** Las páginas generadas SON públicas. Política de SELECT para `anon` sobre sitios con status ≠ dado_de_baja → el render usa la anon key (no requiere sesión). La escritura (generador) usa service_role (bypass RLS). Evita el bug de `createBrowserClient` sin JWT porque el render no depende de sesión.
- **Aplicar en:** Render de sitios (fase 2+).

---

### 2026-08-31: Enlaces del sitio deben ser context-aware (subdominio vs /sites/{slug})
- **Error potencial:** El middleware reescribe `{slug}.misitioia.com/x` → `/sites/{slug}/x` (deja header `x-site-slug`), pero la URL de prueba `misitioia.vercel.app/sites/{slug}` NO se reescribe. Un enlace fijo (`/terminos` o `/sites/{slug}/terminos`) funciona en un contexto y rompe en el otro.
- **Fix:** `siteBasePath()` (`src/features/sites/base-path.ts`) lee `x-site-slug`: si está → base '' (subdominio); si no → base `/sites/{slug}` (URL de prueba). Todos los enlaces internos del sitio y legales usan esa base.
- **Aplicar en:** Todo enlace interno dentro de `/sites/[slug]`.

### 2026-08-31: JSON-LD y llms.txt NO se gatean por estado; meta robots y sitemap SÍ
- **Decisión:** El gating anti-spam SEO (no indexar sitios sin reclamar) aplica SOLO a `meta robots` (noindex en `generado`) y al `sitemap` (excluye `generado`). El JSON-LD LocalBusiness y el `/llms.txt` describen un negocio real y se sirven siempre (ayudan a la IA a reconocer el negocio sin publicarlo en Google). `dado_de_baja` → RLS lo oculta → 404 en todo.
- **Aplicar en:** AEO de sitios (fase 2.5+).

### 2026-08-31: Fuentes premium por next/font en layout de /sites, no en el root
- **Dato:** El root `layout.tsx` carga Inter global. Para el look premium de los sitios (Playfair Display display + Inter body) se creó `src/app/sites/[slug]/layout.tsx` con next/font exponiendo `--font-display`/`--font-body`. Las fuentes se aplican con `style={{fontFamily:'var(--font-display), serif'}}` (Tailwind v4, sin config extra).
- **Aplicar en:** Render de sitios y páginas legales.

### 2026-08-31: Gemini tool-calling por REST — mismo patrón del generador, sin SDK
- **Dato:** El agente editor NO usa Vercel AI SDK; hace `fetch` a `.../models/gemini-2.5-flash:generateContent` con `tools:[{functionDeclarations}]`. El loop: leer `candidates[0].content.parts` → si hay `functionCall`, se re-agrega ese `content` (role `model`) y se responde con un `content` role `user` con parts `functionResponse` → repetir (máx 6). Termina cuando el modelo devuelve solo texto. Probado real: encadena 3+ herramientas en un turno.
- **Dato clave:** `updateHours` recibe `hours: [{day,hours}]` (array), NO un objeto de llaves dinámicas — el schema de function-calling de Gemini no maneja bien objetos con claves arbitrarias. Se convierte a `{Lunes: "..."}` en el executor.
- **Aplicar en:** Cualquier agente con herramientas sobre Gemini directo.

### 2026-08-31: Escrituras del editor con service_role tras autorizar (no createBrowserClient)
- **Decisión:** El editor autoriza en el servidor (`authorizeSiteAccess`: `tenants.owner_email` == email del JWT leído con `createServerSupabase`) y luego escribe con el cliente admin (service_role), acotado al `siteId`. Se evita por completo `createBrowserClient` con RLS (bug conocido: no manda JWT en queries → arrays vacíos). Toda la data del editor viaja por Server Actions.
- **Aplicar en:** Todo el editor y futuros paneles con RLS.

### 2026-08-31: Magic link server-side — verifier PKCE en cookie, callback exchange
- **Dato:** `sendMagicLink` corre como Server Action con `createServerSupabase` (cookies escribibles en Server Actions) → setea el code-verifier en cookie. El email vuelve a `/auth/callback?code=...&next=...` y ahí `exchangeCodeForSession(code)` lee el verifier de la cookie. No hace falta browser client ni tocar plantillas de correo. Requiere las Redirect URLs en el allow-list de Supabase Auth.
- **Aplicar en:** Auth sin password en cualquier proyecto Next + Supabase.

### 2026-08-31: ROOT_DOMAIN centralizado y configurable (misitioia.com → misitio.site)
- **Error potencial:** El default del dominio estaba repetido como literal `'misitioia.com'` en 7+ archivos. Al cambiar a `misitio.site` había riesgo de dejar alguno viejo.
- **Fix:** `src/lib/domain.ts` exporta `ROOT_DOMAIN` (`NEXT_PUBLIC_ROOT_DOMAIN || 'misitio.site'`) + `siteUrl()`/`siteHost()`. Todos los módulos importan de ahí. El slug se deriva del host quitando `ROOT_DOMAIN`; sigue funcionando en `misitioia.vercel.app/sites/{slug}`.
- **Aplicar en:** Cualquier dato derivado del dominio (URLs canónicas, sitemap, subdominios, middleware).

## 📦 Insumo externo reutilizable (agregado 31-ago-2026)

Del análisis de `REPOS EXTERNOS/` (6 repos de daniel-carreon, 28-ago), lo útil para MiSitio IA:

- **`ai-lead-gen`** (⚠️ SIN licencia — reimplementar el patrón, NO copiar código textual): pipeline
  de minería de negocios de **Google Maps vía Apify** (`compass~crawler-google-places`) →
  enriquecer emails (`vdrmota~contact-info-scraper`) → "línea rompehielo" con Gemini. Alimenta a
  **TerraLeads**, que es la fuente de la **Fase 2 (generador automático)** de MiSitio IA. Más y
  mejores leads = más páginas generadas = más embudo. Entrada: cuenta Apify + 2 actores. Ojo ToS
  Google Maps para SaaS comercial.
- **`saas-factory-agencia`** (SIN licencia — patrón): **agente vendedor configurable desde la BD**
  (system_prompt/modelo/temperatura editables desde admin sin redeploy). Útil para que cada sitio
  generado tenga su chatbot de ventas ajustable por tenant sin tocar código.

Contexto completo del embudo en `ESTUDIO/PLAN_MAESTRO_ADQUISICION_AUTOMATICA.md`.

---

## Fase 7 — Sitio público del producto (cara pública de MiSitio IA)
> **Estado:** ✅ COMPLETA (31-ago-2026) · rama `feat/sitio-publico-producto` (worktree aislado, sin merge a main)
> **Criterio de terminado:** Landing premium + legales del producto + museo de comparativas + AEO + imágenes + PWA. `npm run build` y `typecheck` en verde.
> **Dominio de producción:** `misitio.site` (canónicas y AEO usan `NEXT_PUBLIC_ROOT_DOMAIN`, default cambiado a `misitio.site`).

Construida la **cara pública del PRODUCTO** en las rutas raíz, sin tocar `/sites/[slug]`
(los sitios generados de la Fase 2.5), ni el middleware/proxy, ni el editor.

**Posicionamiento "Caballo de Troya":** todo el copy insiste en que el sitio gratis es el gancho
y el valor real es Victoria (IA que atiende/vende 24/7 + videollamada). "Los demás te dan una
página estática; nosotros una que vende sola." Español mexicano, cálido y profesional.

### 7.1 Landing `/` (rediseño premium)
- [x] `src/app/page.tsx` reescrita: hero con imagen IA + glows, "cómo funciona" (3 pasos), sección
  Victoria (fondo oscuro), features (6), teaser de comparativas, prueba social (stats), pricing
  **$0 / $349 / $699 MXN**, FAQ (acordeón `<details>` nativo, sin JS), CTA final. Mobile-first.
  Tipografía Playfair Display (display) + Inter (cuerpo).
- [x] Componentes en `src/features/marketing/`: `brand.ts` (fuente única de precios/enlaces),
  `components/SiteNav.tsx`, `components/SiteFooter.tsx`, `components/Pricing.tsx`,
  `data/faq.ts` (FAQ compartida landing + JSON-LD).

### 7.2 Páginas legales del producto
- [x] `src/features/marketing/legal/product-legal.ts` — Aviso de Privacidad (LFPDPPP), Términos y
  Política de Cookies del **producto** (MiSitio IA como empresa; distinto del generador legal de
  los sitios). `LegalArticle.tsx` para render.
- [x] Rutas: `/aviso-de-privacidad`, `/terminos`, `/cookies` + **alias** `/privacy` y `/terms`
  (requisito fábrica; canónica de los alias apunta a la versión en español). Enlazadas en el footer.

### 7.3 Museo de comparativas
- [x] `src/features/comparativa/competitors.ts` — **8 competidores**: Wix, Hostinger AI, Base44,
  Durable, GoDaddy Airo, Framer, Squarespace, agencia/freelancer tradicional. Cada uno abre con un
  **dolor único y específico** de ESE competidor (no genérico). Tabla factual y honesta (9 filas,
  reconoce lo bueno de cada uno; NO inventa cifras ni copia contenido). Cierre con diferencial
  (sitio + Victoria + videollamada).
- [x] Rutas `/comparativa` (índice) + `/comparativa/[slug]` (SSG, `generateStaticParams`).
  JSON-LD `FAQPage` + `BreadcrumbList` + `ItemList`, meta por comparativa.

### 7.4 AEO (stack de la fábrica)
- [x] `robots.ts` (ya existía) — default de dominio → `misitio.site`; permite bots IA (GPTBot,
  OAI-SearchBot, ChatGPT-User, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended, CCBot,
  cohere-ai, Amazonbot, Meta-ExternalAgent, +extras).
- [x] `sitemap.ts` — ahora incluye **landing + legales + comparativas** (producto SÍ se indexa),
  además de los sitios reclamados/activos. Listado de sitios envuelto en try/catch (build no truena
  si Supabase no está disponible).
- [x] `/llms.txt` del producto — `src/app/llms.txt/route.ts` (qué es, diferencial, planes, FAQ,
  comparativas).
- [x] JSON-LD `Organization` + `SoftwareApplication` + `FAQPage` en la landing
  (`src/features/marketing/structured-data.ts`).
- [x] `meta robots` del producto: `index,follow` + `max-snippet:-1, max-image-preview:large,
  max-video-preview:-1` en el root layout. Canónicas con `https://misitio.site`.

### 7.5 Imágenes de calidad (generadas con Replicate/Flux)
- [x] `scripts/generate-marketing-images.mjs` (lee `REPLICATE_API_TOKEN` de env; no hardcodea token).
  **6 imágenes** webp en `public/img/`: `hero`, `og-image`, `feature-victoria`, `feature-generate`,
  `showcase-devices`, `comparativa-hero`. Estilo cálido, negocios mexicanos, mockups en celular.
  Modelo `black-forest-labs/flux-dev`, output webp optimizado.

### 7.6 PWA (requisito fábrica)
- [x] `src/app/manifest.ts` (Next metadata route → `/manifest.webmanifest`), `display: standalone`,
  `theme_color #ea580c`.
- [x] `scripts/generate-icons.mjs` (sharp) → `public/icon-192.png`, `icon-512.png`,
  `apple-touch-icon.png`, `favicon.png`. Icono de marca: ventana de sitio + burbuja de chat.
- [x] Metadata en `layout.tsx`: `manifest`, `icons`, `appleWebApp`, `themeColor` (viewport).

### Archivos compartidos tocados (para el merge — mínimos)
- `src/app/layout.tsx` — fuentes (Playfair+Inter), metadata/PWA/icons, `metadataBase` → `misitio.site`.
- `src/app/globals.css` — body usa Inter; removido el override forzado de dark-mode (evita fondos
  oscuros inesperados en el producto). No afecta `/sites` (tienen su propio wrapper de estilos).
- `src/app/robots.ts` y `src/app/sitemap.ts` — default de dominio → `misitio.site`; sitemap suma
  rutas del producto y vuelve resiliente el listado de sitios.
- `src/app/page.tsx` — reemplazada (era la landing básica).
- `package.json` / `package-lock.json` — agregado `sharp` (usado por el script de iconos; también
  lo aprovecha Next para optimización de imágenes).

### Verificación
- [x] `npm run typecheck` verde. `npm run build` verde (23 rutas; `/sites/*` intacto).
- [x] Todas las rutas del producto responden 200 (landing, legales, alias, comparativa índice + 8
  slugs, llms.txt, manifest, robots, sitemap). Imágenes e iconos sirven 200.
- Nota: en este worktree no hay `.env.local`; el middleware requiere `NEXT_PUBLIC_SUPABASE_URL/ANON`
  para no arrojar 500. Para verificación local se usó un `.env.local` con placeholders (gitignored,
  ya removido). En Vercel las env reales ya existen.

---

## Fase 8 — Plugin/embed para sitios que YA existen
> **Estado:** ✅ MVP FUNCIONAL (31-ago-2026) · rama `main`.
> **Criterio de terminado:** Un sitio ajeno (WordPress/Wix/cualquiera) pega un snippet (o instala el
> plugin), aparece Victoria y se corre una auditoría AEO que el dueño ve en `/instalar`. Build +
> typecheck en verde; advisor de seguridad en verde; loop probado con Gemini real.

**Objetivo de negocio:** captar clientes que YA tienen web. Pegan un código y (1) se les inyecta el
chat de Victoria, (2) hacemos una auditoría AEO de su página, (3) queda la base para mejorar su sitio.
Sirve por **snippet universal** (cualquier sitio) y por **plugin de WordPress** (envuelve el snippet).

### 🛡️ Guardarraíl de confianza (NO negociable)
El embed **NO modifica en vivo** el sitio del cliente. Solo (a) inyecta el widget de Victoria,
(b) LEE el DOM para la auditoría y (c) genera recomendaciones. Cualquier "aplicar cambios" al sitio
del cliente queda para una fase futura **con aprobación explícita**.

### 8.1 Snippet universal (JS vanilla, corre en sitios ajenos)
- [x] `src/app/embed/v1.js/route.ts` — sirve `application/javascript` estático (cache 1h). Uso:
  `<script src="https://misitio.site/embed/v1.js" data-site="TOKEN" async></script>`.
- [x] `src/features/embed/snippet.ts` — el script: lee `data-site` y deriva la base de la API del
  `src` del propio `<script>` (no se interpola en build); inyecta el widget de Victoria en un
  **Shadow DOM** (estilos aislados, no chocan con el anfitrión); recolecta señales del DOM y las
  POSTea a `/api/audit`; el chat habla con `/api/webchat`. Burbuja + panel mobile-friendly.
- [x] Señales recolectadas: url, title, meta description, canonical, lang, h1/h2, nº y tipos de
  JSON-LD, `/llms.txt` (HEAD al mismo origen del anfitrión), viewport, OG, https, wordCount, muestra
  de texto.

### 8.2 `/api/webchat` — Victoria embebida (CORS abierto)
- [x] `src/app/api/webchat/route.ts` (+ `OPTIONS` preflight) — valida token → `embed_site`, arma el
  contexto desde la última auditoría y responde con **Gemini `gemini-2.5-flash-lite`**.
- [x] `src/features/embed/webchat.ts` — system prompt anti-invención: Victoria responde SOLO con el
  conocimiento del sitio; si no sabe (precio, disponibilidad), NO inventa y ofrece tomar datos de
  contacto. Probado real: contesta "¿venden filtros?" y NO inventa el precio de una batería.

### 8.3 `/api/audit` — auditoría AEO (CORS abierto, read-only)
- [x] `src/app/api/audit/route.ts` (+ `OPTIONS`) — valida token, normaliza señales, corre reglas,
  pide recomendaciones a Gemini y **guarda el reporte**. Devuelve resumen. No modifica el sitio.
- [x] `src/features/embed/audit.ts` — 12 checks ponderados (title, meta description, JSON-LD,
  llms.txt, h1, h2, lang, canonical, OG, https, viewport, contenido) → **puntaje 0..100 determinista**
  (el puntaje NO depende de la IA).
- [x] `src/features/embed/recommendations.ts` — recomendaciones priorizadas en español con Gemini
  (`gemini-2.5-flash-lite`); **fallback determinista** si no hay API key o falla. Probado real:
  puntaje 60/100 + 5 recomendaciones accionables.

### 8.4 DB (migración `phase8_embed_and_audits`) + RLS
- [x] Tabla `embed_sites` (sitio ajeno + `token` público `mst_…` + owner_email + origin/platform/
  status) y `embed_audits` (url, signals jsonb, score, report jsonb, summary, model).
- [x] **RLS**: el dueño ve lo suyo por email del JWT (SELECT/INSERT/UPDATE/DELETE en `embed_sites`;
  SELECT en `embed_audits` vía subconsulta al dueño). La escritura de auditoría va por **service_role**
  desde `/api/audit` tras validar el token (bypass RLS). **Advisor de seguridad en verde.**
- [x] `src/features/embed/store.ts` — helpers con cliente admin: `generateEmbedToken`,
  `getEmbedSiteByToken`, `rememberOrigin`, `saveAudit`, `getLatestAudit`, `createEmbedSite`,
  `listEmbedSitesForOwner`, `ownsEmbedSite`.

### 8.5 Página `/instalar` (panel del cliente)
- [x] `src/app/instalar/page.tsx` (auth por magic link/Google reusando `LoginGate`) — lista los
  `embed_sites` del dueño con su última auditoría.
- [x] `src/features/embed/components/InstallPanel.tsx` — genera el snippet con su token (botón
  copiar), instrucciones (WordPress/Wix/genérico) y **resultados AEO** (puntaje, resumen,
  recomendaciones, detalle de checks). `src/features/embed/actions.ts` → `createEmbedSiteAction`.
- [x] Enlace "Ya tengo web" → `/instalar` en el nav del producto (`marketing/brand.ts`).

### 8.6 Plugin de WordPress (wrapper del snippet)
- [x] `wordpress-plugin/misitio-ia/misitio-ia.php` — registra Ajustes → MiSitio IA con el **token**
  del sitio y **encola el snippet** (`wp_enqueue_script` + filtro `script_loader_tag` para añadir
  `data-site` y `async`). Base sobreescribible con filtro `misitio_ia_base_url`.
- [x] `wordpress-plugin/misitio-ia/readme.txt` — instalación y FAQ.

### El snippet que copia el cliente
```html
<script src="https://misitio.site/embed/v1.js" data-site="mst_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" async></script>
```

### Verificación
- [x] `npm run typecheck` + `npm run build` en verde (26 rutas; nuevas: `/api/audit`, `/api/webchat`,
  `/embed/v1.js`, `/instalar`; `/sites/*` intacto).
- [x] Motor de auditoría (reglas) probado: score 60/100 con statuses correctos.
- [x] Recomendaciones Gemini reales (`scripts/test-embed.ts`): 5 recomendaciones accionables.
- [x] Victoria embebida real (`scripts/test-embed-chat.ts`): responde desde el conocimiento del sitio
  y NO inventa datos que no tiene.
- [x] Esquema + FK + RLS probados vía MCP (insert `embed_sites`+`embed_audits`, read-back, cleanup).
  Advisor de seguridad: sin lints.

**⚠️ Pendiente para runtime prod (NO bloquea; secretos que carga Jesús):**
- `SUPABASE_SERVICE_ROLE_KEY` y `GEMINI_API_KEY` en el env de Vercel (ya usados por generador/editor;
  el embed los reutiliza). Local: `SUPABASE_SERVICE_ROLE_KEY` sigue VACÍA en `.env.local`, por eso el
  guardado en BD se validó vía MCP; la lógica de auditoría/chat sí es real.
- El snippet apunta a `https://${NEXT_PUBLIC_ROOT_DOMAIN}/embed/v1.js` (default `misitio.site`).
- Auth de `/instalar` reusa el magic link/Google del editor (mismas Redirect URLs y SMTP).
- **Futuro (fuera del MVP):** vincular el `embed_site` a un tenant Konnex (canal webchat) para bandeja/
  CRM/relevo humano; y la fase de "aplicar cambios" al sitio del cliente con aprobación explícita.

### Aprendizajes (Auto-Blindaje) — Fase 8

#### 2026-08-31: El snippet embebido debe aislarse con Shadow DOM
- **Error potencial:** un widget inyectado en sitios ajenos hereda/rompe los estilos del anfitrión.
- **Fix:** `host.attachShadow({mode:'open'})` + todo el CSS dentro del shadow. Estilos scoped, cero
  colisión con el sitio del cliente.
- **Aplicar en:** cualquier widget que corra en dominios ajenos.

#### 2026-08-31: Endpoints del widget = CORS abierto + validación por token (no sesión)
- **Dato:** `/api/webchat` y `/api/audit` los llama el widget desde el dominio del cliente → requieren
  `Access-Control-Allow-Origin: *` y manejar `OPTIONS`. La autorización NO es por cookie/sesión sino
  por **token** (`mst_…`) → `embed_site`. La escritura de auditoría usa service_role (bypass RLS).
- **Aplicar en:** cualquier API pública consumida por un embed de terceros.

#### 2026-08-31: El puntaje de auditoría es determinista; la IA solo explica
- **Decisión:** el score 0..100 sale de reglas ponderadas (`audit.ts`), NO de Gemini. Gemini solo
  prioriza y redacta las recomendaciones, con fallback determinista si falla. Así el puntaje es
  estable y reproducible aunque la IA varíe o no esté disponible.
- **Aplicar en:** cualquier "scoring" que combine reglas + IA.

#### 2026-08-31: Servir JS estático como string sin backticks ni ${} internos
- **Dato:** `snippet.ts` exporta el script como template literal; para servirlo tal cual, el JS
  interno se escribe con comillas y concatenación (sin backticks ni `${}`), y la base de la API se
  deriva en runtime del `src` del `<script>` en vez de interpolarse en build. Así el mismo archivo
  sirve en cualquier dominio de la plataforma.
- **Aplicar en:** cualquier asset JS servido desde un route handler.

---

## Ajustes Post-Entrega — Landing (2026-08-31)

Revisión del landing del producto según feedback directo de Jesús. Alcance: solo
la cara pública `/` y AEO. No se tocó `/sites/[slug]`, el editor (`/crear`,`/editar`),
ni el embed (`/instalar`).

### 1. Identidad de marca "by Konnex 24/7" (semilla de identidad de la fábrica)
- `brand.ts`: nuevos campos `parent: 'Konnex 24/7'` y `parentTagline`; tagline global
  cambiado a "La página web que nace lista para la era de la búsqueda con IA.".
- `SiteNav.tsx`: sello "by Konnex 24/7" bajo el wordmark, sutil (uppercase, stone-400).
- `SiteFooter.tsx`: línea "MiSitio IA es tecnología de Konnex 24/7…" + copyright con ambas marcas.
- JSON-LD Organization: `parentOrganization` = Konnex 24/7 + `slogan`.

### 2. Cambio de énfasis → el punto de flexión / búsqueda con IA (lo central)
- **Hero** reescrito: gancho "Ya no solo se googlea: la gente le pregunta a la IA qué
  comprar" + el problema (webs invisibles para ChatGPT/Gemini/Perplexity) + "nace lista (AEO)".
- **Nueva sección "El punto de flexión"** (`#era-ia`): imagen + explicación del cambio de era.
- **Nueva sección línea de tiempo** (`Timeline.tsx` + `data/timeline.ts`): 4 eras (Web 1.0 →
  Google/Bing → redes sociales → AHORA: preguntarle a la IA). Visual, sistemática, sin muro de texto.
- CTA final y metadata (page + layout) realineados al ángulo AEO.

### 3. Refuerzo de la promesa: GRATIS + facilísimo; Victoria como add-on
- **Nueva sección "Gratis y facilísimo"** (`#gratis`): otros cobran, nosotros regalamos la web;
  "solo dices qué quieres" / "dile tu giro y la IA fabrica todo".
- **Sección Victoria** reencuadrada como "el complemento de automatización (opcional)"; se aclara
  que la WEB es gratis y Victoria es el upsell (probable gratis, actívala cuando la ocupes).
- Sección Planes: encabezado "La web es gratis. Automatizar es opcional.". Proof rebalanceado.

### 4. Imágenes nuevas (Replicate / Flux 1.1 Pro, guardadas en `public/img/` webp)
- `era-ia.webp` — dueña viendo cómo la IA recomienda su producto (sección flexión).
- `facil-crear.webp` — dueño viendo a la IA armar su sitio (sección gratis+fácil).
- `busqueda-ia.webp` — mano con teléfono y asistente de voz IA (sección timeline).

### 5. Coherencia AEO
- `/llms.txt`: intro + sección "Qué lo hace diferente" reescritas al ángulo AEO + parentesco Konnex.
- `faq.ts`: nueva pregunta "¿Qué significa que mi página esté 'lista para la IA' (AEO)?".
- JSON-LD SoftwareApplication/Organization: descripciones con AEO + gratis + Victoria opcional.
- `layout.tsx`: title/description/keywords al ángulo AEO.

### 6. Logo profesional propio (reemplaza el emoji 🌐)
- **Logomark SVG vectorial** (`components/Logo.tsx` + `public/logo.svg`): squircle naranja
  (gradiente `#fb923c`→`#ea580c`), burbuja de chat blanca con cola + chispa de IA naranja.
  Nítido de 16px a 512px, combina con Playfair.
- Cableado en `SiteNav.tsx` y `SiteFooter.tsx` (reemplaza `BRAND.emoji`; el sello "by Konnex" se queda).
- Íconos regenerados con sharp desde el SVG: `favicon.png` (64), `icon-192.png`, `icon-512.png`,
  `apple-touch-icon.png` (180). manifest.ts/metadata `icons` ya apuntaban a esos archivos.
- `og-image.webp` se dejó como está (imagen de marketing real; un logo empeoraría el OG).

### Validación
- `npm run typecheck` ✅ · `npm run build` ✅ (Compiled successfully; `/` estático).
- QA en dev: hero, flexión, timeline (4 eras), gratis+fácil, logo+sello en nav renderizan;
  assets `img/*` + íconos + `logo.svg` + `/llms.txt` sirven 200.

### Aprendizajes (Auto-Blindaje)
- **Logo pro = SVG, no raster IA:** los logos generados por IA en raster salen borrosos/con
  artefactos. El logotipo final se dibuja en SVG (crisp a cualquier tamaño) y los PNG (favicon/PWA)
  se rasterizan desde ese SVG con sharp (`density` alto). Replicate solo para explorar concepto.
- **sharp en script suelto:** importar `sharp` como bare specifier y correr el `.mjs` DESDE la raíz
  del proyecto (no con ruta `C:/...` en el import ESM, que rompe con ERR_UNSUPPORTED_ESM_URL_SCHEME).
