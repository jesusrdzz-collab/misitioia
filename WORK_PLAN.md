# WORK_PLAN - MiSitio IA (Creador de Sitios Web con IA)
> **Estado**: EN DESARROLLO
> **Última actualización**: 2026-08-27
> **Fase actual**: Fase 0 — Setup inicial (casi completa)
> **Dominio**: misitioia.com (**pendiente de compra manual** — Vercel MCP no tiene permiso de compra)
> **Supabase**: ✅ mthlqoploeisigzvwory (ACTIVE_HEALTHY, us-east-1)
> **Repo**: ✅ https://github.com/jesusrdzz-collab/misitioia
> **Vercel**: ✅ https://misitioia.vercel.app (deploy exitoso)
> **URL compra dominio**: https://vercel.com/domains/search?q=misitioia.com ($11.25 USD)

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
> **Estado:** PENDIENTE
> **Criterio de terminado:** Dos sitios distintos en dos subdominios

- [ ] 1.1 Migración Supabase: tablas `tenants`, `sites`, `site_content`, `site_products`
- [ ] 1.2 RLS por `tenant_id` en todas las tablas
- [ ] 1.3 Middleware Next.js: leer host → extraer subdominio → cargar tenant
- [ ] 1.4 Reserva de subdominios (`www`, `app`, `admin`, `api`, `mail`)
- [ ] 1.5 Resolución de colisiones de nombre (sufijo automático)
- [ ] 1.6 Página de prueba A y página de prueba B en subdominios distintos

### Fase 2 — GENERADOR AUTOMÁTICO (⚡ LA MÁS URGENTE)
> **Estado:** PENDIENTE
> **Criterio de terminado:** De una fila de `leads` (TerraLeads, proyecto xnffgxnzwqqkghdwhxyj) sale una página publicada sin tocar nada
> **Dependencia:** La campaña de llamadas NO puede arrancar antes de que esto funcione

- [ ] 2.1 Función `generateSiteFromLead(leadId)`:
  - Lee lead de TerraLeads Supabase (proyecto `xnffgxnzwqqkghdwhxyj`)
  - Extrae: business_name, giro, address, phone, rating, reviews_count, working_hours, social_facebook, social_instagram, categoria_google
  - Campos en `raw_data.outscraper`: working_hours (JSON en español), category, subtypes, verified, place_id
  - **NO hay fotos en el payload** → arrancar sin fotos (genérica por giro o sin imagen)
  - **NO hay texto de reseñas** → solo mostrar "4.9 ★ (49 reseñas)"
- [ ] 2.2 Prompt a Gemini para redactar textos:
  - **REGLA NO NEGOCIABLE:** Gemini redacta, no inventa. Si el dato no está en la ficha, no se menciona.
  - Input: solo datos verificados del lead
  - Output: título, descripción corta, secciones (sobre nosotros, servicios, contacto)
  - Modelo: `gemini-2.5-flash` (verificado vivo)
- [ ] 2.3 Selección automática de plantilla por giro (mapeo `giros_catalogo` → plantilla visual)
- [ ] 2.4 Generación de página estática (ISR/SSG en Next.js)
- [ ] 2.5 Publicación automática en subdominio: `{slug}.misitioia.com`
- [ ] 2.6 Estado del sitio: `generado` (sin reclamar)
- [ ] 2.7 Meta tags: `noindex, nofollow` hasta que el dueño reclame
- [ ] 2.8 Botón/enlace de baja inmediata visible en el footer
- [ ] 2.9 Generación en lote: procesar N leads de una vez
- [ ] 2.10 Script de prueba: generar 3 páginas reales desde leads existentes

### Fase 3 — Plantillas por giro
> **Estado:** PENDIENTE
> **Criterio de terminado:** Una veterinaria y una refaccionaria se ven distintas y correctas

- [ ] 3.1 Diseño base: plantilla genérica responsive
- [ ] 3.2 Variantes para los 10 giros de mayor prioridad (prioridad 10 en giros_catalogo):
  - veterinaria, dentista, gimnasio, estética, refaccionaria, aire acondicionado, taller mecánico, mueblería, boutique, ferretería
- [ ] 3.3 Paleta de colores y estilo por giro
- [ ] 3.4 Secciones condicionales (ej: "Nuestros servicios" vs "Nuestro menú")
- [ ] 3.5 Imágenes genéricas por giro (stock o generadas)

### Fase 4 — Panel del negocio
> **Estado:** PENDIENTE
> **Criterio de terminado:** El dueño reclama su página y la edita

- [ ] 4.1 Auth con magic link (el dueño no tiene password, solo email/WhatsApp)
- [ ] 4.2 Flujo de "reclamar sitio" → estado `generado` → `reclamado`
- [ ] 4.3 Editor de contenido: nombre, horarios, teléfono, descripción, servicios
- [ ] 4.4 Editor de catálogo de productos (reusar patrón de Mirage)
- [ ] 4.5 Vista de contactos/leads que llegaron desde la página
- [ ] 4.6 Regenerar página al guardar cambios (estática, no por visita)

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
