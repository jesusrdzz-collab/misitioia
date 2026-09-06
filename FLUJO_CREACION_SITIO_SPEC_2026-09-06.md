# 🧭 Flujo de creación de sitio — MiSitio IA
> **Definido por Jesús Rodríguez · 6-sep-2026**
> Spec formal del wizard de creación. Sustituye cualquier flujo previo del generador.
> Este documento es la fuente de verdad; si el código actual difiere, el código se adapta.

---

## Principios

1. **3 pasos obligatorios**, mínimos necesarios para publicar un sitio profesional
2. **Todo lo demás va al panel** — el cliente lo agrega cuando quiera, sin presión
3. **Cero fricción para el free** — un negocio debe poder publicar su sitio en < 5 min
4. **Ningún sitio sale sin datos legales completos** — es un tema legal (LFPDPPP), no de UX

---

## PASO 1 · Datos base del negocio (obligatorio)

**Estado actual del wizard:** ya funciona — el chat con Gemini pregunta nombre + qué vende + los infiere de forma conversacional.

**Lo que se AGREGA (obligatorio antes de publicar):**

| Campo | Por qué | Va a |
|---|---|---|
| Datos de contacto (teléfono, WhatsApp, correo) | Cliente puede escribirte | Sitio + panel |
| Dirección física | Aparece en sitio + Google + JSON-LD para AEO | Sitio + JSON-LD LocalBusiness |
| **Domicilio del responsable de datos** | Obligatorio LFPDPPP para el aviso de privacidad | Aviso de privacidad |
| Nombre/razón social del responsable | Idem | Aviso de privacidad |

**Regla dura:** si algún campo falta, el sitio se publica pero el `sites.legal_ready = false` y se muestra banner al dueño "completa tus datos legales para pasar review de Meta/WhatsApp". Nunca se publica un sitio con las legales por default en blanco.

---

## PASO 2 · Elegir plantilla (obligatorio)

**Cliente ve:**
- Vista previa de SU sitio con datos del paso 1
- Selector de 5 plantillas predefinidas

**Cada plantilla trae ya combinado:**
- Paleta de colores (fondo, acentos, texto)
- Tipografía primaria + secundaria (pareado coherente)
- Formato de hero (centrado / lateral / fondo full)
- Estructura de secciones (orden, spacing, jerarquía visual)

**Sólo 5 plantillas — no más.** Jesús textual: *"esas plantillas ya deben estar prediseñadas solo ocupamos 5 no muchas"*. Menos opciones = decisión más rápida (regla de las mermeladas de Iyengar aplicada al propio producto).

**Nombres tentativos** (a definir con Jesús o al implementar):
1. Terracota Clásico (actual — mantener como default de retail/artesanía)
2. Marino Profesional (servicios formales, legal, medico)
3. Verde Natural (bienestar, veterinaria, alimentos)
4. Rosa Premium (estética, moda, salón)
5. Neutro Minimalista (cualquier giro, foto grande + tipografía)

**Cambio posterior:** desde `/editar/apariencia` el cliente puede cambiar plantilla con pocos clics — el contenido NO se pierde, solo cambia el tema visual.

---

## PASO 3 · Imágenes (obligatorio)

Cliente elige entre dos vías (o combina):

**Vía A — Subir sus propias fotos**
- Hero, sobre el negocio, catálogo
- Compresión y optimización automáticas

**Vía B — Imágenes generadas con IA**
- Gemini 2.5 Flash Image (Nano Banana), regla NOTXT
- Por giro del negocio
- Cliente puede regenerar hasta 3 veces por slot (costo controlado)

**Fallback si ni sube ni genera:** stock genérico por giro (Unsplash predefinido), para que ningún sitio se vea vacío.

---

## Pasos OPCIONALES (desde el panel, cuando el cliente quiera)

Todos en `/editar/*` con la sesión activa del dueño. Ninguno bloquea la publicación.

| Sección panel | Contenido |
|---|---|
| `/editar/datos` | Editar contacto, dirección, horarios, redes |
| `/editar/apariencia` | Cambiar plantilla, regenerar imágenes, subir logo |
| `/editar/catalogo` | Productos o servicios con precios y fotos |
| `/editar/sobre` | Historia, valores, equipo, info que consideren importante |
| `/editar/analiticas` | Meta Pixel ID + GA4 (gating por plan, ya implementado) |
| `/editar/dominio` | Conectar dominio propio (ya existe) |
| `/editar/plan` | Cambiar de plan (ya existe) |
| `/editar/legales` | Editar directamente los campos del aviso de privacidad y términos si el negocio quiere personalizarlos más allá del generado |

---

## Cambios respecto al estado actual del código

| Área | Actual | Debe ser |
|---|---|---|
| Wizard | Un solo chat con Gemini que genera todo de golpe | 3 pasos guiados con puntos de decisión del cliente |
| Datos legales | Se generan por default, pueden quedar incompletos | **Obligatorios en Paso 1**, sitio no se publica sin ellos |
| Plantillas | Solo una (terracota) | 5 plantillas + selector con vista previa |
| Imágenes | No hay | 3 imágenes IA generadas por Gemini o subidas por el cliente |
| Panel | Datos, Instalar, Dominio, Plan (+ Analytics recién) | Se suma **Apariencia** y **Sobre el negocio** |

---

## Impacto en el sprint en curso

El **Agente B (imágenes IA + plantillas)** ya escribió parte de esto:
- ✅ `src/features/generator/images.ts` — cliente Gemini ya commiteado
- ⚠️ Registry de plantillas, componentes de las 4 plantillas, panel `/editar/apariencia` — en working tree sin commitear
- ⚠️ Nombres actuales: `terracota-classic, marino-profesional, verde-natural, rosa-premium` — **son 4, no 5**

El **Agente A (fixes legales + slug + reclamación)** también quedó en working tree:
- ⚠️ Legales completas con responsable + domicilio + contacto — **exactamente lo que Jesús pide en Paso 1**

**Acción:** con la limpieza del enredo, se completa a 5 plantillas (añadir `neutro-minimalista`) y se integra la guardia legal del Paso 1.

---

## Riesgos de UX

- **Fricción del Paso 1** (obligar datos legales) puede espantar al 20-30% de clientes free que solo quieren "ver cómo se ve mi sitio". Mitigación: separar Paso 1 en 1a (nombre + qué vende + preview inmediata) y 1b (contacto + domicilio, antes de publicar). Preview no requiere Paso 1b.
- **5 plantillas** es un buen número, pero si Jesús o clientes piden variedad después, agregar más rompe el principio de las mermeladas. Alternativa: variantes de color dentro de cada plantilla (misma estructura, distinto color).

---

## Autor y estado

- Autor del spec: Jesús Rodríguez (5-sep + 6-sep-2026, conversaciones)
- Documentado por: Claude, 6-sep-2026 · v1
- Estado: **APROBADO para implementación** (queda anexado al brief del proyecto)
