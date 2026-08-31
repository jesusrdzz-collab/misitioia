# 🌐 Brief de proyecto — Creador de sitios web con IA

> **Estado: EN DESARROLLO.** Fases 0–2.5 ✅ y Fase 4 (editor tipo chat) v1 funcional.
> Creado 20-ago-2026 · Nace de `PORTAFOLIO_SAAS_FACTORY.md` → PROYECTO A (Web Builder IA) y de
> `TERRALEADS/PLAN_MARKETING.md` (la página gratis como imán de prospección).
> **Este documento es el punto de entrada del agente de desarrollo.** Léelo completo antes de codear.
>
> **Nombre/dominio (31-ago-2026):** **MiSitio IA** en **misitio.site** (comprado vía Vercel).
> Subdominios de clientes `negocio.misitio.site`, panel `app.misitio.site`. El dominio es
> configurable por env `NEXT_PUBLIC_ROOT_DOMAIN` (default `misitio.site`, ver `src/lib/domain.ts`);
> la URL de prueba sigue siendo `misitioia.vercel.app/sites/{slug}`.
>
> **⚡ Cambio de alcance (31-ago-2026) — el editor es un CHAT, no un panel de formularios.**
> El frontend de edición/creación es un **chat conversacional estilo Base44/Hostinger AI** (dos
> paneles: hilo + vista previa en vivo), con **dos entradas**: (1) **edición** del sitio ya generado
> —el dueño reclama y refina su página hablando— y (2) **creación autoservicio** —un negocio nuevo
> describe lo que quiere y se le crea el sitio desde cero, sin depender de TerraLeads—. Un agente de
> IA con tool-calling (Gemini) ejecuta herramientas que editan el contenido estructurado en Supabase;
> las imágenes (logo, portada, fotos) se guardan en Supabase Storage multi-tenant. Detalle e
> implementación en `WORK_PLAN.md` (Fase 4).

---

## 1. Por qué existe, y la doble función que lo hace distinto

El portafolio ya lo tenía especificado con scorecard **29/35, prioridad ALTA**: 60% del código
reutilizable de `PAG WEB TIENDA MIRAGE`, 3-4 semanas, planes de $199 / $399 / $599 MXN al mes.

Lo que cambia ahora es que **tiene dos funciones a la vez**, y la primera es la que manda:

### Función 1 — Imán de prospección (la urgente)

`[BD]` De los negocios que TerraLeads scrapea, **el 89% no tiene sitio web propio**. Ese es su dolor
y es nuestra entrada.

**La vuelta de tuerca:** no se le invita a construir su página. **Se le manda ya construida y
publicada.**

No es *"regístrate y arma tu sitio"*, es *"esta es la página de tu negocio, ya está en línea,
míra­la"*. Y se puede hacer **sin pedirle absolutamente nada**, porque todo sale de la ficha de
Google que ya scrapeamos: nombre, giro, dirección, teléfono, horarios, calificación, reseñas y
fotos.

Un correo —o un WhatsApp— con la página real de su negocio funcionando no compite con ningún PDF.

### Función 2 — Producto de pago (la del portafolio)

Subdominio gratis permanente. Se cobra cuando quiere **dominio propio**, **asistente de IA** o
**editar su catálogo**. Es la escalera de planes ya definida.

**El costo marginal de una página estática en subdominio es casi cero**, y cada una queda como
escaparate nuestro con nuestra marca al pie. Regalarlas para siempre es marketing, no pérdida.

---

## 2. Nombres propuestos

| # | Nombre | Razonamiento | Dominio |
|---|---|---|---|
| 1 | **MiSitio IA** | Dice qué es en español y trae la IA. `taqueria-la-papita.misitioia.com` se lee y se dicta bien | `misitioia.com` ✅ **libre — $11.25** |
| 2 | **Tu Página IA** | Más directo todavía; habla de tú | `tupaginaia.com` ✅ **libre — $11.25** |
| 3 | **SitioFactory** | Hereda el lenguaje de "fábrica" del ecosistema | `sitiofactory.com` ✅ **libre — $11.25** |
| 4 | **Página en Minutos** | El nombre ES la promesa. Bueno para SEO de cola larga | `paginaenminutos.com` ✅ **libre — $11.25** |
| 5 | **WebFactory** | El nombre del portafolio. `.com` tomado; el mexicano cuesta 3× | `webfactory.com.mx` ✅ libre — $33.99 |

**Recomendación: MiSitio IA.** Es el más corto de los libres (11 caracteres), y como el dominio
hospeda **subdominios de clientes**, la longitud importa más que en un producto normal. Además el
dueño de una taquería entiende "mi sitio" sin explicación; "WebFactory" no le dice nada.

---

## 3. Arquitectura

### Base existente

**60% del código sale de `PAG WEB TIENDA MIRAGE`** (en producción): catálogo de productos, widget de
chat con MIRA basado en Gemini, integración con WooCommerce, seguimiento de ventas.

**Lo que hay que construir encima:** multi-tenancy, generador automático desde la ficha de Google,
enrutamiento por subdominio, panel del negocio y facturación.

### Stack (Golden Path de la fábrica)

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 + React 19 + TypeScript |
| UI | Tailwind CSS 3.4 |
| BD + Auth | Supabase (PostgreSQL + RLS), multi-tenant |
| IA | Gemini 2.0 Flash (ya probado en MIRA) |
| Pagos | Stripe |
| Deploy | Vercel |
| Estado / Validación | Zustand / Zod |

### Enrutamiento por subdominio — la pieza técnica central

`negocio.misitioia.com` tiene que resolver a la página correcta. En Vercel se hace con **dominio
comodín** (`*.misitioia.com`) más middleware de Next.js que lee el host, saca el subdominio y carga
el tenant.

**Puntos a resolver desde el diseño, no después:**

- Certificado SSL para comodín (Vercel lo resuelve, verificar límites del plan)
- Reserva de subdominios: `www`, `app`, `admin`, `api`, `mail` y demás no pueden asignarse a clientes
- Colisiones de nombre: dos taquerías "La Papita" necesitan sufijo, no un error
- Migración a dominio propio sin romper enlaces ni SEO (redirección 301 permanente)
- Las páginas deben ser **estáticas y rápidas**: es un negocio de volumen, no se renderiza cada
  visita en servidor

### El generador automático

Entrada: una fila de `leads` de TerraLeads. Salida: una página publicada.

| Dato | De dónde sale |
|---|---|
| Nombre, giro, dirección, teléfono, horarios | Ficha de Google (ya scrapeada) |
| Calificación y reseñas | Ficha de Google |
| Fotos | Ficha de Google |
| Redes sociales | `social_facebook`, `social_instagram` |
| Textos descriptivos | Gemini, **solo sobre datos verificados** |
| Plantilla visual | Por giro (veterinaria ≠ refaccionaria ≠ boutique) |

**Regla heredada del plan de marketing y no negociable: Gemini redacta, no inventa.** Si el dato no
está en la ficha, no se menciona. Una página que le atribuye al negocio servicios que no da es peor
que no mandarle nada — y aquí es más grave que en un correo, porque queda publicada.

---

## 4. Multi-tenant

`tenant_id` + RLS, igual que Konnex y que la plataforma de llamadas.

| Tabla | Para qué |
|---|---|
| `sitios` | Un renglón por página: subdominio, tenant, plan, estado |
| `sitio_contenido` | Secciones editables |
| `sitio_productos` | Catálogo (reutiliza el modelo de Mirage) |
| `sitio_leads` | Quién contactó desde esa página |
| `conversaciones_chat` | Historial del asistente IA por sitio |
| `plantillas_giro` | Plantilla visual y textos base por giro |

**Estados de un sitio:** `generado` (creado por nosotros, aún sin reclamar) → `reclamado` (el dueño
entró) → `activo` (de pago). El estado `generado` es la clave del imán: la página existe y funciona
antes de que el dueño sepa que existe.

---

## 5. Modelo de negocio (revisado 22-ago con precios de mercado)

### Lo que cobra el mercado mexicano hoy (verificado 22-ago-2026)

| Opcion | Precio mensual |
|---|---|
| Wix / Squarespace en Mexico | $0 - $500 MXN |
| Plataformas de autoservicio en general | $500 - $3,000 MXN |
| Mantenimiento basico (hosting + dominio + SSL) | $300 - $800 MXN |
| Agencia con mantenimiento activo | **$1,500 - $4,000 MXN** |

**Donde nos paramos:** por debajo de Wix en el nivel de entrada y **muy por debajo de cualquier
agencia**. Para un negocio chico la comparacion no es contra Wix — es contra los $5,000 a $15,000
MXN que le pidieron una vez por una pagina que nunca le entregaron.

### La escalera

| Nivel | Precio | Que incluye |
|---|---|---|
| **1 — Gratis, permanente** | $0 | Pagina en subdominio nuestro, bien estructurada, catalogo basico. Con nuestra marca al pie |
| **2 — $349 MXN/mes** | ~19 USD | **Asistente de ventas con IA** + CRM + bandeja tipo WhatsApp + editor autoservicio + sin nuestra marca |
| **3 — $699 MXN/mes** | ~38 USD | + dominio propio + WhatsApp conectado + analitica + mas conversaciones |

**Por que se movio del $199/$399/$599 del portafolio:** el nivel 2 ahora incluye un asistente con IA,
que tiene **costo variable real por conversacion**. A $199 MXN (~11 USD) un negocio con trafico
alto se come el margen en tokens. $349 deja aire y sigue siendo la mitad de lo que cobra la agencia
mas barata.

### ⚠️ El tope de conversaciones no es opcional

El asistente cuesta dinero cada vez que habla. **Cada nivel lleva tope mensual de conversaciones**,
visible para el cliente, con opcion de comprar mas. Sin tope, un solo cliente pesado vuelve negativo
el margen de diez.

Definir en fase 0: cuantas conversaciones incluye cada nivel y cuanto cuesta el excedente.

### El plan gratis es marketing, no perdida

Una pagina estatica en subdominio cuesta casi nada de servir, y cada una es un escaparate con
nuestra marca al pie y un prospecto que ya nos conoce. **El nivel 1 no lleva asistente** — ahi esta
justo la razon para subir de nivel.

---

## 5b. La plataforma que compra el nivel 2

Esto es lo que Jesus definio el 22-ago y **cambia el tamano del proyecto**: ya no es un generador de
paginas, es una plataforma de ventas para el negocio.

### Las cuatro piezas

**1. Asistente de ventas con IA, atendiendo el sitio.** Le contesta al visitante, conoce el catalogo
y los datos del negocio, y busca cerrar. Necesita **base de conocimiento propia por tenant** — lo que
vende, precios, horarios, formas de pago, politicas. Sin esa base el asistente inventa, y ahi se
acaba la confianza.

**2. CRM del negocio.** Donde el dueno ve sus prospectos y el registro de sus ventas. No un CRM
generico: el minimo que le sirve a una refaccionaria o una veterinaria.

**3. Bandeja tipo WhatsApp.** Conversaciones del sitio presentadas como chat, no como tickets. El
caso de uso que lo justifica, en palabras de Jesus: *"si un cliente les dice 'yo no pedi ese
producto, pedi este', se van directo al chat y ahi lo ven"*. **La conversacion es la evidencia.**

**4. Chat en vivo con relevo humano.** Cuando el visitante esta activo, un vendedor del negocio puede
**entrar y tomar la conversacion**. El asistente se hace a un lado. Es exactamente el handover que
Konnex ya resuelve.

**5. Editor autoservicio.** El dueno agrega o quita datos de su pagina desde el portal — sus
servicios, sus precios, sus fotos — le da guardar y **se refleja en linea**. Sin pedirnos nada.

### 🔴 La decision de arquitectura mas importante del proyecto

**Konnex YA TIENE tres de esas cuatro piezas**, en produccion y probadas: bandeja omnicanal, CRM,
relevo humano con deteccion de peticion de humano, base de conocimiento por tenant, y un asistente
de ventas (Victoria) que lleva meses vendiendo de verdad.

**Construirlas de nuevo dentro de este proyecto seria duplicar la parte mas dificil de Konnex**, y
dejarnos dos bandejas, dos CRMs y dos handovers que mantener.

**Recomendacion: el nivel 2 no reimplementa nada — activa una cuenta de Konnex con el canal web.**

| Pieza | De donde sale |
|---|---|
| Pagina web y editor | Este proyecto |
| Widget de chat en el sitio | Este proyecto (front) |
| Asistente, bandeja, CRM, relevo humano, base de conocimiento | **Konnex, como canal nuevo `web`** |

**Lo que gana el negocio:** una sola bandeja donde ve su sitio y, cuando quiera, su WhatsApp.
**Lo que ganamos nosotros:** el nivel 3 deja de ser un plan y se vuelve **la puerta natural a
Konnex** — el dueno ya tiene a Victoria contestando en su pagina; conectar su WhatsApp es un clic.
Ese es el caballo de Troya funcionando completo.

**Lo que hay que construir en Konnex para que esto exista:** un canal `web` junto a WhatsApp,
Facebook e Instagram. Es la via mas corta y hay que confirmarla con el dueno antes de la fase 5.

**Si se decide NO reusar Konnex**, hay que asumirlo por escrito: son varias semanas mas de
desarrollo y un segundo sistema que mantener para siempre.

---

## 6. Fases de desarrollo

| Fase | Qué se construye | Criterio de terminado |
|---|---|---|
| 0 | Decidir nombre, comprar dominio, configurar comodín en Vercel | `prueba.<dominio>` sirve una página real |
| 1 | Multi-tenant en Supabase + enrutamiento por subdominio | Dos sitios distintos en dos subdominios |
| 2 | **Generador automático desde un `lead` de TerraLeads** | De una fila de `leads` sale una página publicada, sin tocar nada |
| 3 | Plantillas por giro (arrancar con los 10 de mayor prioridad) | Una veterinaria y una refaccionaria se ven distintas y correctas |
| 4 | Panel del negocio: reclamar sitio, editar, ver contactos | El dueño reclama su página y la edita |
| 5 | Widget de chat + **decision de reusar Konnex** (ver 5b) | El asistente contesta sobre el catálogo y el relevo humano funciona |
| 5b | CRM, bandeja y editor autoservicio — **o el canal `web` en Konnex** | El dueño edita su página y ve sus conversaciones |
| 6 | Stripe, planes y **topes de conversaciones** | Se puede pagar, subir de plan, y el tope se respeta |
| 7 | Entregables obligatorios: landing, /privacy, /terms, responsive, PWA | Checklist de la fábrica completo |

**La fase 2 es la que desbloquea la campaña**, y es más importante que las 3, 4 y 5 juntas. Sin
generador automático no hay imán, y sin imán la campaña de llamadas no tiene qué prometer.

### ⚠️ Dependencia que ordena las prioridades

**La plataforma de llamadas promete "te hacemos tu página gratis".** Si se marca el primer número
antes de que exista el generador, se quema el contacto y la marca en la misma llamada.

> **Fase 2 de este proyecto tiene que estar terminada ANTES de la fase 5 del proyecto de llamadas.**

---

## 7. Riesgos

| Riesgo | Mitigación |
|---|---|
| **Gemini inventa datos y quedan publicados** | Solo campos verificados. Muestreo humano antes de publicar en lote |
| **Páginas feas por giro equivocado** | Plantilla por giro, revisadas a ojo antes de soltarlas |
| **Fotos de Google con derechos** | Verificar términos de uso de las fotos de la ficha antes de republicarlas |
| **Un negocio no quiere su página publicada** | Baja inmediata a un clic, sin preguntar. Y no publicar en buscadores hasta que la reclamen |
| **Costo de hospedaje si escala a miles** | Páginas estáticas, no renderizado por visita. Medir desde la primera centena |
| **Colisión de subdominios** | Resuelto por diseño con sufijos, no con error |

**El riesgo legal que hay que aclarar en fase 0:** publicar una página de un negocio sin su
consentimiento, con sus datos públicos y sus fotos de Google. Los datos son públicos, pero **las
fotos pueden tener derechos de quien las subió**. Conviene arrancar con páginas sin foto o con foto
genérica del giro, y sumar las de Google solo cuando el dueño reclame el sitio.

---

## 8. Lo que NO se hace

- No se publica nada que Gemini haya inventado
- No se indexa en buscadores un sitio que el dueño todavía no reclama
- No se ignora una petición de baja
- No se republican fotos de Google sin verificar antes sus términos
- No se renderiza en servidor por visita: es un negocio de volumen
- No se arranca la campaña de llamadas antes de que la fase 2 esté lista

---

## 9. Relación con el resto del ecosistema

| Proyecto | Relación |
|---|---|
| **TerraLeads** | Le entrega los `leads` de donde salen las páginas |
| **Plataforma de llamadas** | Promete la página. **Depende de la fase 2 de este proyecto** |
| **Konnex / Victoria** | El dueño que ya tiene página y recibe mensajes es prospecto natural |
| **PAG WEB TIENDA MIRAGE** | Es la base: 60% del código y el asistente MIRA |
