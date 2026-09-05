# 🎯 UENI — Análisis competitivo + plan de acción para MiSitio IA

> **Fecha:** 4-sep-2026 (Monterrey, MX · America/Mexico_City · UTC−6)
> **Autor:** Claude (agente de background, sesión de Jesús)
> **Amplía:** [NOTA_COMPETIDOR_UENI_04SEP2026.md](./NOTA_COMPETIDOR_UENI_04SEP2026.md)
> **Estado del entregable:** Documento de análisis + entrada de competidor agregada en código (sin deploy). Landing intacta.

---

## Resumen ejecutivo

**UENI es el competidor directo más grande y establecido que tiene MiSitio IA hoy.** Fundado en 2014 en Londres por Christine Telyan y Anh Pham Vu (~$31 M USD levantados, 120 empleados), opera en 6 países incluyendo México oficialmente, dice haber construido **700,000 sitios** y tiene **4.7 en Trustpilot con 9,257 reseñas** — la mayoría positivas por su servicio humano. Su gancho público: *"Creamos la web de tu pequeño negocio en 7 días por MXN$1,399"*. Es la primera vez que la fábrica se topa con un competidor con esa combinación de tamaño, presencia real en México y modelo "done-for-you". Ignorarlo sería un error.

**La buena noticia son tres huecos estructurales explotables**, no de estilo. **(1)** El "$79 USD one-time" es *bait*: es solo la cuota de setup — el servicio real cuesta **$24.99 a $124.99 USD/mes** ($439 MXN/mes en el sitio mexicano). El plan de entrada solo trae **30 días de edits**; después de eso cambiar un teléfono o subir una foto se paga o se contrata Plus. Reddit, Trustpilot y foros mexicanos coinciden en la queja de "hidden monthly fees". **(2)** Las páginas legales de sus clientes vienen por default con la frase literal *"Por favor, contáctanos para nuestros Términos y Condiciones completos"* — el mismo placeholder está en Términos, Aviso Legal y Política del Comerciante del ejemplo real que verificamos, y con `lastRevised: 30 de agosto de 2022`. Un sitio así **no pasa las políticas de Meta** para conectar WhatsApp Business Cloud API (incidente Héctor, Konnex, 14-ago). **(3)** UENI **no tiene `llms.txt`, su `robots.txt` no nombra ningún bot de IA**, el HTML es una SPA de React con `data-react-helmet` que muchos crawlers de IA no ejecutan, y sus sitios de clientes se sirven en subdominios `ueniweb.com` — todo lo contrario del stack AEO que Konnex/Mirage/Listo POS ya montaron el 28-ago. En Answer Engines nacemos con ventaja de fábrica.

**Recomendación en una línea:** publicar `/comparativa/ueni` con los tres huecos documentados y precio en pesos, sumar la línea *"legales completas y válidas, sin trampa para tu WhatsApp Business"* al pitch del plan gratis, y no volver a cambiar el mensaje del "0% comisión / gratis para siempre" hasta que UENI corrija su modelo de setup + mensualidad — que, si lo hacen, tardará meses.

---

## 1. UENI la empresa

### 1.1 Ficha básica (verificada)

| Dato | Valor | Fuente |
|---|---|---|
| Fundación | 2014 (incorporada 29-dic-2014) | Wikipedia / Crunchbase / GOV.UK |
| Fundadores | Christine Telyan (CEO), Anh Pham Vu | ueni.com/es-mx/about-us |
| HQ | Londres, UK + Nueva York | ueni.com about |
| Plantilla | 120 profesionales | ueni.com about |
| Funding | $31.1 M USD en 4 rondas (última: Angel $12 M oct-2019) | Tracxn / Crustdata |
| Países servidos | Estados Unidos, Reino Unido, Canadá, España, **México**, Brasil | ueni.com footer selector |
| Trustpilot | 4.7 / 5 con 9,257 reseñas | Trustpilot (nz.trustpilot.com/review/ueni.com) |
| Reclamo "sitios construidos" | **"700,000 websites"** (aparece en el home en-us) | ueni.com/en-us/ verbatim |
| Teléfono US | (205) 551-9730 | ueni.com |
| Email | help@ueni.com | ueni.com |

**Nota sobre el "700,000":** el número está en el home actual (`ueni.com/en-us/`) pero no encontramos el año exacto en que lo empezaron a comunicar ni un breakdown geográfico. Nueve mil doscientas cincuenta y siete reseñas en Trustpilot es un piso de operación real; el número de sitios es plausible pero **no independientemente verificado**. Aun tomado con 50% de descuento (350K) sigue siendo un mercado enorme — que es justo lo que Jesús destacó como *"lo bueno del hallazgo"*.

### 1.2 Modelo de negocio real (no el del marketing)

Lo que UENI comunica al mundo:

> *"Creamos la web de tu pequeño negocio en 7 días por MXN$1,399"* — ueni.com/es-mx (verbatim, 4-sep-2026)
>
> *"$79 to launch, then a simple monthly plan from $24.99/mo. No hidden fees"* — home en-us (verbatim)

Lo que en realidad se paga:

| Concepto | Precio (US) | Precio (MX) |
|---|---|---|
| **Setup one-time** (descontado de $599) | $79 USD | **$1,399 MXN** |
| Website Launch (mensual) | $24.99 USD/mo | **$439 MXN/mo** desde |
| Plus (mensual) | $59 USD/mo | ~ |
| Ecommerce (mensual) | $99 USD/mo | ~ |
| Growth (mensual) | $124.99 USD/mo | ~ |

**Costo real año 1 (plan de entrada MX):** `$1,399 + 12 × $439 = $6,667 MXN`.
**Renovación año 2:** `12 × $439 = $5,268 MXN`.

Quejas repetidas en Trustpilot y foros (verbatim de resultados de búsqueda):

> *"UENI makes accusations against competitors about hidden charges, but the company itself is guilty of the same issue, with additional options and premium subscriptions requiring extra payments that are hidden away, out of site."*

> *"Customers must pay $16.99 per month for their domain name, business email, website hosting, and other features necessary to maintain their business website."*

El propio pricing lo confirma sin querer: el plan **Launch** trae "30 days of edits". Para editar después del día 30 hay que subir a **Plus** ($59 USD/mo). O sea: el *"unlimited edits forever"* aplica solo al Plus en adelante. El de entrada te congela el sitio.

### 1.3 Reputación de servicio (lo que hacen bien)

Es honesto reconocerlo. El grueso de las reseñas 4-5 estrellas repite dos ideas:

1. **Servicio humano rápido**: la persona asignada resuelve, responde y a veces sobre-entrega ("*took my problem as if it were her own*", "*even doing more than expected*").
2. **Le quitan al dueño el trabajo de armar**: es *done-for-you*, no *do-it-yourself* — para un dueño que no tiene ni ganas ni tiempo de aprender un editor, esto es genuino valor.

Este es el respeto obligado. Cualquier ataque a UENI que no reconozca esto suena mal informado.

### 1.4 Presencia en México

Confirmado en `ueni.com/es-mx/`:
- Locale `es-MX` oficial.
- Precios en pesos.
- Blog con artículos específicos ("Pequeños negocios en México eligen redes sociales…").
- Cliente real en Zapopan, GDL, verificado desde su ficha de Google Maps (**ADI Alarmas**) — hosteado en su plataforma desde jun-2023.

**No están de paso.** Llevan años operando en México con cliente pagando en pesos.

---

## 2. UENI el producto (basado en un cliente real, ADI Alarmas)

### 2.1 Metodología

Analizamos el sitio `adi-alarmas.ueniweb.com` (cliente real de Zapopan, GDL) porque llegó vía prospección de Konnex — es exactamente el tipo de PyME que MiSitio va a apuntar. Descargamos por curl:

- `/` (home) — 1.83 MB de HTML
- `/terms-and-conditions`, `/legal-notice`, `/merchant-policy` (los tres legales)
- `/robots.txt`, `/sitemap.xml`, `/llms.txt`

Los archivos crudos quedan en el scratchpad de esta sesión (no en el repo).

### 2.2 Stack técnico

- **SPA de React** con react-helmet (visibles atributos `data-react-helmet="true"` en cada `<meta>`).
- Assets desde CDN propio: `s.uenicdn.com` y `img77.uenicdn.com` (Cloudinary por debajo).
- UI construida sobre **Material UI** (clases `MuiGrid-root`, `MuiGrid-item`).
- Sección "sobre nosotros" se llama internamente **"bobs"** (`Bobs.aboutUs`) — sistema de bloques prefabricados. Es un templating riguroso: cada cliente elige "bobs" (about, gallery, amenities, services) y UENI los rellena. No hay libertad de diseño.

### 2.3 SEO / Metadata (lo que sí traen)

Verificado en `adi-alarmas.ueniweb.com/`:

- `<title>Adi Alarmas - Instalaciones de seguridad | Zapopan</title>` ✅
- `meta name="description"` completo en español ✅
- Open Graph completo (`og:title`, `og:description`, `og:image`, `og:locale=es_MX`, `og:type=business.business`) ✅
- Metadatos Facebook business: locality, region, country, coordenadas, horarios ✅
- JSON-LD `LocalBusiness` con name, address, geo, telephone, openingHours, priceRange, sameAs (Google Place ID) ✅
- Sitemap.xml presente ✅

**Verdad incómoda:** en SEO on-page **UENI está bien**. No es el hueco. El hueco es AEO.

### 2.4 AEO / Answer Engines (lo que NO traen)

Este es el hueco grande, verificable en 30 segundos con curl:

- **`/llms.txt` devuelve el shell del SPA en HTML**, no un archivo de texto. Un bot de IA que lo pide recibe basura JavaScript que no puede parsear. **UENI no soporta el estándar `llmstxt.org`.**
- **`robots.txt` contenido literal:**
  ```
  User-agent: *
  Sitemap: https://ueniweb.com/sitemap/adi-alarmas.xml
  Sitemap: https://adi-alarmas.ueniweb.com/sitemap.xml
  Sitemap: https://ueniweb.com/sitemap-last-1000.xml
  ```
  Sin `User-agent: GPTBot`, sin `User-agent: ClaudeBot`, sin `User-agent: PerplexityBot`, sin `Google-Extended`, sin `OAI-SearchBot`, sin `Applebot-Extended`. Todos los bots reciben `*` (permitido por default), pero **ningún directive `max-snippet`, ningún reconocimiento explícito**. En 2026 esto ya no basta: los AI Overviews de Google y las citas de ChatGPT le dan preferencia a sitios que declaran explícitamente su postura hacia AI (política, no técnica).
- **No hay JSON-LD `FAQPage`**, `Product`, ni `Service`. Solo `LocalBusiness` genérico. UENI podría estar generando FAQs y respuestas ricas — no lo hace.
- El HTML se renderiza vía React en cliente. Los bots que no ejecutan JS (Applebot-Extended sin JS, Bytespider, mucho legacy) ven un HTML flaco.

Comparado con la fábrica: **Konnex/Mirage/Listo POS tienen `llms.txt` real, 18 bots IA nombrados en robots, `max-snippet:-1` en Googlebot** desde el 28-ago (ver memoria `aeo-stack-3-sitios`). MiSitio ya reproduce ese stack en cada sitio generado (Fase 2.5, `src/features/aeo/`). **En AEO nacemos con ventaja de fábrica sobre UENI. Es la única ventana antes de que la copien.**

### 2.5 Legales — el hallazgo del incidente ADI

**Extracto verbatim del payload SSR del sitio de ADI Alarmas**, presente idéntico en las 3 páginas legales:

```
"termsAndConditionsDefaultLastRevised": "última revisión: 30 de agosto de 2022"
"termsAndConditionsDefault":            "Por favor, contáctanos para nuestros
                                         Términos y Condiciones completos."
```

Es literalmente el placeholder de la plantilla de UENI. Sale así cuando el dueño del negocio no llena las legales — que es la mayoría, porque tampoco sabe qué poner. **UENI publica sitios vivos con las 3 legales vacías**, con la fecha de última revisión congelada en agosto de 2022.

Implicaciones concretas:

1. **Meta / WhatsApp Business Cloud API.** El onboarding de WhatsApp Business exige que la URL del negocio publique política de privacidad y términos válidos. Un placeholder "contáctanos" es motivo de rechazo o restricción — precisamente lo que le pasó al cliente Héctor de Konnex el 14-ago-2026. Un negocio con sitio UENI **no puede conectar WhatsApp Business API con normalidad**. Miles de sitios UENI mexicanos están en esa situación sin saberlo.
2. **LFPDPPP (México).** La Ley Federal de Protección de Datos Personales en Posesión de los Particulares exige un aviso de privacidad accesible al momento de recabar datos. Un formulario de contacto + placeholder = incumplimiento formal (aunque nadie lo persiga).
3. **Google Merchant / Shopping.** Rechazo automático de merchant si no hay términos + política de devolución.
4. **Meta Ads.** Cuentas restringidas cuando la landing no tiene política de privacidad válida.

MiSitio ya resuelve esto en Fase 2.5: `src/features/legal/legal-content.ts` genera **Aviso de Privacidad conforme LFPDPPP, Términos y Política de Cookies** rellenos con datos reales del negocio, y las rutas `/terminos`, `/aviso-de-privacidad`, `/cookies` sirven contenido real en cada sitio. Es una **ventaja regulatoria estructural**, no cosmética.

### 2.6 Personalización real

El sitio de ADI Alarmas se compone de secciones-bloque:
- Hero con imagen de stock (`shutterstock_416635009.jpg` — el archivo original en Cloudinary de UENI, verificable)
- 5 servicios listados sin descripción larga
- 3 "about" con textos genéricos de asesoramiento
- Galería
- Formulario de contacto con reCAPTCHA

**Todo el diseño se ve idéntico a cualquier otro UENI.** Es la misma plantilla Material UI con paleta de colores intercambiable. La personalización se limita al color de acento, el logo, las fotos y el texto. Para el dueño de la taquería está bien; para diferenciarse en un giro competido, no.

MiSitio ya tiene 9 templates por giro (Fase 2.3, `src/features/generator/templates.ts`) con paleta y emoji distintos por rubro. **Es un empate acotado, no una ventaja definitiva** — UENI también podría hacer templates por giro; simplemente eligió no invertir ahí.

### 2.7 Multi-idioma y content freshness

- `og:locale=es_MX` correctamente puesto — el contenido es en español mexicano, no traducción automática.
- Sitemap muestra `lastmod: 2023-06-30` en TODAS las páginas de contenido; solo `/booking` fue actualizada (`2026-07-21`). **El sitio de ADI no se ha actualizado en 3 años en su contenido.** El dueño paga la mensualidad (probablemente) y su página se quedó como el primer día.

Este es el retrato del cliente UENI promedio: **paga el setup + los primeros meses, no vuelve a tocar la página, y UENI tampoco.** Cuando el negocio cambia (nuevo servicio, cambio de teléfono, promoción de temporada), no hay editor autoservicio real accesible en el plan Launch — hay que pagar Plus.

### 2.8 Performance / Core Web Vitals

**No verificado.** Intentamos PageSpeed Insights API pública dos veces; devolvió HTTP 429 (rate-limited) para el URL. Se sugiere volver a correrlo desde otro rango de IP o directamente en `pagespeed.web.dev` cuando Jesús quiera cifras exactas. Observación cualitativa: el HTML pesa 1.83 MB en la primera carga y toda la interactividad se hidrata via React — no es una landing rápida.

### 2.9 UENI branding en el pie del formulario

Detectado en el payload del formulario de contacto de ADI Alarmas:

> *"...estoy de acuerdo con los [Términos y Condiciones](https://www.ueni.com/es-mx/terms) y la Política de Privacidad y Cookies de UENI, y cualesquiera términos y condiciones aplicables de Adi Alarmas."*

Cada sitio UENI **obliga al visitante a aceptar los términos de UENI antes de contactar al negocio**. El dueño del negocio no controla sus propios términos — los suplanta UENI. Es un detalle importante: **los datos de contacto que recibe el negocio están sujetos al contrato con UENI, no del negocio con su cliente.**

MiSitio no hace esto: los términos y avisos son del negocio, no de MiSitio IA. Punto de venta directo con dueños que entienden lo que significa.

---

## 3. Comparativa UENI vs MiSitio IA (honesta)

| Criterio | UENI | MiSitio IA | Comentario honesto |
|---|---|---|---|
| **Precio de entrada** | $1,399 MXN setup + $439/mo | **$0 permanente** (plan gratis) | Aquí no hay debate: MiSitio arranca en cero y UENI en ~$1,400 antes de la primera mensualidad. |
| **Tiempo de entrega** | 7 días | Minutos (generador automático desde ficha de Google) | Verificado en Fase 2 de MiSitio; 2 sitios reales generados 31-ago. |
| **Sitio ya listo antes del primer contacto** | No | **Sí — el imán de TerraLeads** | UENI espera a que el dueño llene el cuestionario. MiSitio se lo manda ya vivo. |
| **Legales completas y válidas** | No — placeholder "contáctanos" | **Sí — LFPDPPP + Términos + Cookies con datos reales** | Ventaja regulatoria: pasa Meta / WhatsApp Business Cloud API. |
| **Dominio propio** | Incluido desde el plan base | En Nivel 3 ($699 MXN/mo) | UENI gana en el plan Launch; MiSitio gana en costo total con plan gratis + subdominio. |
| **Subdominio propio del cliente** | `negocio.ueniweb.com` | `negocio.misitio.site` | Empate técnico. |
| **Personalización por giro** | Plantilla única, paleta cambia | 9 templates por giro | Empate acotado; ambos podrían mejorar. |
| **Editor autoservicio del dueño** | Solo desde Plus ($59 USD/mo); Launch trae 30 días | Fase 4 pendiente (por diseño va en el plan gratis) | Falta implementar en MiSitio. UENI lo tiene pero **detrás del plan Plus** — para el dueño del plan Launch, el editor no existe en la práctica. |
| **Asistente de IA que atiende y vende 24/7** | No | **Sí — Victoria, Nivel 2 ($349 MXN/mo)** | Ventaja diferencial definitiva. UENI no vende esto en ningún plan. |
| **WhatsApp conectado con IA** | No | Sí — Nivel 3 | Ventaja definitiva. UENI ofrece "listings" en Facebook/Yelp, no conexión IA a WhatsApp. |
| **CRM + bandeja unificada** | No | Sí (reusa Konnex) | Ventaja de ecosistema. |
| **Videollamada con clientes desde el sitio** | No | Sí (en la landing como diferencial) | Verificar que el módulo esté vivo antes de comunicarlo con fuerza. |
| **AEO nativo (llms.txt, bots IA en robots, max-snippet)** | No | **Sí — Fase 2.5 en producción** | Ventaja técnica de estándar de fábrica. |
| **JSON-LD LocalBusiness por sitio** | Sí | Sí | Empate. |
| **JSON-LD FAQPage, Service, Product** | No | Parcial (FAQPage en landing, falta por sitio) | Empate acotado; mejorable en ambos. |
| **Idioma** | Español mexicano real | Español mexicano real | Empate. |
| **Reputación / prueba social** | 4.7 / 9,257 en Trustpilot, 10+ años | 0 reseñas públicas | **UENI gana claramente aquí.** MiSitio es nuevo. |
| **Servicio humano ("hecho por ti")** | Sí, con persona asignada | No (100% automatizado) | UENI gana. Es una decisión de modelo, no un descuido. |
| **Cobertura geográfica probada** | 6 países, incl. México desde hace años | México (MVP) | UENI gana. |
| **Presencia en directorios (Yelp, FB Business, Google)** | Sí, lo publican en varios | Sí para Google (ficha), no proactivo en Yelp | UENI gana. |
| **Renovación con mensualidad obligatoria** | Sí | Solo si sube a Nivel 2/3; el gratis es gratis | MiSitio gana. |
| **Historial del cliente actualizado** | Congelado en la fecha de creación (sitios de 2023 sin cambios) | Requiere validar cuando entren clientes reales | Empate observado; hay que probarlo. |
| **Marca del proveedor en el pie del sitio del cliente** | UENI aparece en pie de formulario | MiSitio aparece solo en plan gratis (Nivel 2 lo quita) | Empate acotado; el modelo comercial es el mismo. |

**Balance:** MiSitio gana claramente en **precio, tiempo de entrega, legales, IA de ventas, AEO y ecosistema Konnex**. UENI gana claramente en **reputación, servicio humano, cobertura geográfica probada y años en el mercado**. Los otros criterios son empate o ligeramente inclinados.

---

## 4. Debilidades explotables (ordenadas por defensibilidad y facilidad de comunicar)

### 4.1 🥇 Precio real vs precio anunciado

- **Qué es:** UENI vende *"$79 to launch"* y esconde $24.99–$124.99 USD/mo. En México: *"MXN$1,399"* setup y $439 MXN/mo desde.
- **Por qué es defendible:** está en su propio pricing. No podemos ser refutados. Y el modelo comercial no lo pueden cambiar sin dejar de ser rentables (los $79 de setup no cubren un diseñador humano de 7 días).
- **Cómo lo comunicamos:** una fila en la comparativa con la matemática desnuda. *"UENI: $6,667 MXN el primer año. MiSitio IA: $0 para siempre."*
- **Riesgo:** que UENI reduzca su setup o incluya mensualidad en el precio comunicado. Pero les tomaría meses cambiar toda la comunicación global.

### 4.2 🥇 Legales vacías = riesgo Meta / WhatsApp Business

- **Qué es:** placeholder literal *"contáctanos para nuestros Términos y Condiciones completos"* en las 3 legales del sitio del cliente.
- **Por qué es defendible:** verificable en 5 segundos por cualquier prospecto que abra el pie de su propio sitio UENI. No es opinión, es su HTML.
- **Cómo lo comunicamos:** *"Un sitio con legales vacías te puede impedir conectar WhatsApp Business. MiSitio IA las genera completas y conforme a la ley mexicana."* Bonus: cita del incidente Héctor como caso real.
- **Riesgo:** que UENI arregle el default. Es un cambio de una plantilla — podrían hacerlo en semanas si detectan el ángulo de ataque. **Por eso conviene explotar el mensaje pronto.**

### 4.3 🥈 Sin AEO = invisible para ChatGPT/Claude/Perplexity

- **Qué es:** sin llms.txt real, sin bots IA nombrados en robots, HTML servido por SPA sin SSR fuerte, sin JSON-LD FAQPage.
- **Por qué es defendible:** verificable con `curl` (`/llms.txt` devuelve HTML, `/robots.txt` no tiene un solo `User-agent: GPTBot`). Fábrica ya tiene el stack (memoria `aeo-stack-3-sitios`).
- **Cómo lo comunicamos:** *"Cuando alguien le pregunta a ChatGPT '¿dónde compro alarmas en Zapopan?', el sitio de ADI Alarmas (UENI) no aparece. El sitio hecho con MiSitio IA sí."* Es abstracto para el dueño de una taquería, pero convincente para el que ya oyó hablar de ChatGPT.
- **Riesgo:** medio-bajo. UENI tendría que rehacer parte de su renderer para servir SSR limpio a los bots IA — no es un cambio de una tarde.

### 4.4 🥈 Sin IA de ventas 24/7 — Victoria

- **Qué es:** UENI no ofrece asistente conversacional en ningún plan.
- **Por qué es defendible:** su propio pricing no lo incluye. Cuando el cliente pregunta "¿el sitio contesta?", su respuesta es "tiene formulario".
- **Cómo lo comunicamos:** ya está en la landing actual. Contra UENI el ángulo se refina: *"UENI te vende una página. MiSitio IA te vende ventas."*
- **Riesgo:** podrían integrar un chatbot genérico rápido — el ChatGPT-in-a-box de tercer party. Pero conectar con conocimiento propio del negocio + WhatsApp + relevo humano no es trivial (Konnex nos tomó meses).

### 4.5 🥉 Editor congelado tras 30 días en el plan Launch

- **Qué es:** el plan de entrada solo edita 30 días. Después hay que subir a Plus ($59 USD/mo).
- **Por qué es defendible:** lo dice su pricing.
- **Cómo lo comunicamos:** en el copy de MiSitio del plan gratis: *"Edita cuando quieras, para siempre, sin subir de plan."* — pero primero hay que entregar el editor de la Fase 4.
- **Riesgo:** UENI podría cambiar el plan Launch a "edits ilimitados" en cualquier momento; es una decisión de precios.

---

## 5. Fortalezas de UENI que hay que respetar (no atacar)

1. **10+ años operando, 4.7 en Trustpilot con casi 10 K reseñas.** MiSitio es nuevo. Presumir madurez que no tenemos es dispararse en el pie. Estrategia: no compararnos en "años"; compararnos en "cómo está hecho el sitio y qué te cuesta".

2. **Servicio humano con persona asignada.** Un segmento de dueños prefiere hablar con humano. No es nuestro cliente ideal. Estrategia: dejarlo pasar, no combatir el modelo servicio-a-la-medida.

3. **Presencia en 6 países.** No competimos por el mercado global; competimos por México. Estrategia: reforzar "hecho en México para negocios de México".

4. **"Nunca hemos tenido una brecha de seguridad" (dicen 10+ años).** No hay razón para atacar esto — MiSitio tampoco ha tenido brechas (aún). Estrategia: silencio.

5. **Presencia en múltiples directorios (Yelp, FB Business, Google, listings automáticos).** MiSitio no hace esto proactivo. Estrategia: no mencionarlo; si un cliente lo pregunta, decir la verdad: "hoy no; nuestra apuesta es que Victoria convierta las visitas que ya tienes".

6. **Trustpilot 9,257 reseñas.** Prueba social masiva. Estrategia: acumular reseñas propias antes de compararnos en volumen.

---

## 6. Plan de mejoras a MiSitio IA (accionable, por impacto)

### 6.1 🔴 Publicar `/comparativa/ueni` (30-60 min, hecho parcialmente)

- **Qué:** entrada en `src/features/comparativa/competitors.ts` con dolor único, tabla honesta, cierre. Se agrega automáticamente al listado `/comparativa/`, al llms.txt del producto y al sitemap.
- **Estado:** **ya agregada en `src/features/comparativa/competitors.ts`** en esta sesión (slug `ueni`), pero **NO deployada**. Requiere `npm run build && npm run typecheck` en verde y decisión de Jesús para push.
- **Impacto:** captura búsquedas "UENI alternativa", "UENI México", "UENI opiniones dueños" — todas son cola larga con intención alta.
- **Sin dependencias.**

### 6.2 🔴 Ajustar copy del pitch del plan gratis con el hueco de legales

- **Qué:** en la landing y en las comparativas, agregar la línea *"Legales completas y válidas — no un placeholder que impide conectar WhatsApp Business"*.
- **Dónde:** `src/features/marketing/brand.ts` (feature del plan gratis) + `src/app/page.tsx` (sección de features).
- **Recomendación:** no meter la referencia directa a UENI en la landing; sí meter la idea genérica. Contra UENI se comunica en `/comparativa/ueni`. Es más fuerte porque no suena a ataque.
- **Impacto:** convierte una fortaleza técnica (Fase 2.5.1 ya hecha) en argumento de venta.
- **Esfuerzo:** 30 min.

### 6.3 🟠 Redactar el llms.txt del producto con posicionamiento contra UENI

- **Qué:** en `src/app/llms.txt/route.ts` la sección "Qué lo hace diferente" hoy nombra Wix, Hostinger, Squarespace, Durable, GoDaddy, Framer, Base44. **Agregar UENI a esa lista.** Se hace en 1 línea.
- **Dónde:** ya se auto-genera desde COMPETITORS — se resuelve solo cuando entra la entrada de 6.1.
- **Bonus:** agregar a la sección "Qué lo hace diferente" una línea explícita: *"Y a diferencia de servicios `done-for-you` como UENI que cobran setup + mensualidad, MiSitio IA arranca gratis y solo cobra cuando el negocio quiere que su sitio venda por él."*
- **Esfuerzo:** 10 min.

### 6.4 🟠 FAQPage con preguntas UENI-específicas

- **Qué:** agregar en `src/features/marketing/data/faq.ts` preguntas específicas:
  - *"¿Qué diferencia hay entre MiSitio IA y UENI?"*
  - *"¿Es cierto que UENI cobra mensualidad además del setup?"*
  - *"¿Puedo migrar de UENI a MiSitio IA?"* (respuesta: no hay migración automática — se genera un sitio nuevo desde la ficha de Google en minutos).
  - *"¿Por qué las páginas legales importan para conectar WhatsApp Business?"*
- **Dónde:** `src/features/marketing/data/faq.ts`. Se refleja automático en la landing y en el JSON-LD FAQPage.
- **Impacto:** captura búsquedas informacionales; alimenta AI Overviews.
- **Esfuerzo:** 45 min de redacción.

### 6.5 🟠 Migración desde UENI — página landing dedicada

- **Qué:** página `/migra-desde-ueni` con:
  - "Pega la URL de tu sitio actual UENI" → parsea el subdominio.
  - "Vamos a generar tu MiSitio IA desde tu ficha de Google" → llama al generador Fase 2.
  - Copy: *"En minutos tienes un sitio nuevo con legales completas, Victoria vendiendo por ti, y sin cuota de setup. Cuando estés listo, cancelas UENI."*
- **Dónde:** `src/app/migra-desde-ueni/page.tsx`. Reusa el generador existente.
- **Impacto:** captura la intención "cambiar de UENI" — un segmento que ya paga y ya está descontento; conversión potencial alta.
- **Esfuerzo:** 2-3 h.
- **Depende de:** Fase 4 (panel del dueño) para que el cliente pueda editar y publicar tras la migración. Sin Fase 4, la página existe pero no cierra el ciclo.

### 6.6 🟡 Verificación de estado del propio sitio del producto contra los estándares

- **Qué:** correr chequeo AEO sobre `misitio.site` (cuando esté vivo el dominio) o sobre `misitioia.vercel.app`:
  - `curl /llms.txt` → confirmar que responde texto plano ✅ (verificado por WORK_PLAN Fase 7.4)
  - `curl /robots.txt` → confirmar 18 bots ✅ (verificado)
  - PageSpeed Insights de la landing → LCP <2.5s, CLS <0.1
  - Google Rich Results Test → JSON-LD válido
- **Impacto:** confirmar que el sello técnico que vendemos existe. Riesgo reputacional si nos ganan el hueco por descuido nuestro.
- **Esfuerzo:** 30 min una vez desplegado el dominio final.

### 6.7 🟡 Prensa / SEO cruzado — post de blog "¿UENI o MiSitio IA?"

- **Qué:** post honesto y bien escrito comparando los dos. Sin ataques baratos. Se posiciona para "UENI vs MiSitio IA", "UENI opiniones", "UENI México precio".
- **Dónde:** `src/app/blog/ueni-vs-misitio/page.tsx` (crear estructura /blog primero).
- **Esfuerzo:** 4-6 h de escritura + estructura /blog.
- **Depende de:** decisión estratégica de si queremos abrir /blog ahora.

### 6.8 🟡 Reforzar la prueba social propia

- **Qué:** conseguir 5-10 reseñas de los primeros clientes reales (cuando existan) con foto y nombre del negocio.
- **Dónde:** landing + comparativas.
- **Esfuerzo:** trabajo comercial de Paty/Jesús, no técnico.
- **Nota:** hoy MiSitio no puede competir 9,257 vs 0. No mencionar volumen de reseñas en la landing hasta tener al menos 20-30 con foto.

---

## 7. Contenido SEO/AEO propuesto (drafts listos para usar)

### 7.1 Meta title + description de `/comparativa/ueni`

```
title:       MiSitio IA vs UENI: gratis vs $1,399 setup + mensualidad | MiSitio IA
description: UENI cobra MXN$1,399 de setup más $439/mes. MiSitio IA es gratis
             para siempre, con legales completas y un asistente de IA que vende
             por ti. Comparativa honesta para negocios de México.
```

### 7.2 Keywords objetivo (cola larga, alta intención)

- `UENI alternativa` (búsqueda informacional, comprador comparando)
- `UENI México precio` (búsqueda comercial, comprador confundido con el pricing)
- `UENI opiniones dueños negocio` (búsqueda de decisión final)
- `UENI cobra mensualidad` (búsqueda de queja — alta intención de abandono)
- `crear pagina web pequeña empresa México` (búsqueda genérica de arranque)
- `pagina web con IA en español` (búsqueda de tendencia)

### 7.3 Preguntas para FAQPage schema (drafts)

**P: ¿Es cierto que UENI cobra mensualidad además del setup?**
R: Sí. UENI publica *"$79 to launch"* como gancho, pero el servicio real cuesta entre $24.99 y $124.99 USD al mes. En México son MXN$1,399 de setup más $439 MXN/mes desde el plan de entrada — unos $6,667 MXN el primer año.

**P: ¿Qué pasa con las páginas legales que crea UENI?**
R: En los sitios UENI que revisamos, las páginas de Términos, Aviso Legal y Política del Comerciante vienen por default con el texto *"Por favor, contáctanos para nuestros Términos y Condiciones completos"*. Un sitio así puede impedir que conectes WhatsApp Business Cloud API o que Meta apruebe tus campañas.

**P: ¿Puedo migrar de UENI a MiSitio IA?**
R: No hay migración de datos automática porque los sitios están en plataformas distintas. Pero MiSitio IA genera tu sitio nuevo en minutos desde tu ficha de Google, con legales completas y sin cuota de setup, para que puedas comparar antes de cancelar UENI.

**P: ¿UENI es mejor porque lleva más años?**
R: UENI tiene 10+ años y presencia en 6 países — es respetable. La diferencia es lo que ofrece cada uno: UENI te da una página estática que tú pagas por siempre; MiSitio IA te da una página gratis y, si quieres, un asistente que vende por ti las 24 horas.

### 7.4 llms.txt — línea adicional propuesta

En la sección **"Qué lo hace diferente"** del actual `src/app/llms.txt/route.ts`, agregar:

> *"A diferencia de servicios done-for-you como UENI —que cobran setup ($79 USD o $1,399 MXN) más mensualidad ($24.99–$124.99 USD)— MiSitio IA arranca gratis para siempre y solo cobra cuando el negocio quiere que Victoria venda por él."*

### 7.5 Fila propuesta para la matriz de features (usable en varias páginas)

| | UENI | MiSitio IA |
|---|---|---|
| Precio primer año (plan de entrada, MX) | $6,667 MXN | **$0** |
| Legales completas conforme LFPDPPP | ❌ placeholder | ✅ generadas con datos reales |
| Asistente de IA que vende 24/7 | ❌ | ✅ Victoria (Nivel 2) |
| llms.txt / AEO nativo | ❌ | ✅ |
| Tiempo de entrega | 7 días | Minutos |
| Editor autoservicio en plan de entrada | ❌ (30 días) | ✅ |

---

## 8. Archivos tocados / creados en esta sesión

**Escrituras confirmadas (working tree, sin push, sin deploy):**

1. **`COMPETENCIA_UENI_ANALISIS_4SEP2026.md`** ← este documento
2. **`NOTA_COMPETIDOR_UENI_04SEP2026.md`** ← se agregó puntero en el head al análisis completo
3. **`WORK_PLAN.md`** ← se agregó sección "Fase 7.7 — Comparativa UENI" al final
4. **`src/features/comparativa/competitors.ts`** ← se agregó una entrada nueva `slug: 'ueni'` (novena posición) siguiendo el patrón exacto de las otras 8 entradas. La página `/comparativa/ueni` se genera automáticamente por `generateStaticParams`; el llms.txt del producto la incluye por iteración de `COMPETITORS`; el sitemap la recoge igual.

**No se tocó:**

- La landing (`src/app/page.tsx`).
- El middleware ni el generador de sitios.
- Los sitios generados en `/sites/[slug]`.
- Configuración de Vercel, Supabase, dominios, ni env.
- Sin `git add`, sin `git commit`, sin `git push`, sin `vercel --prod`.

**Recomendación de verificación antes de push:** `npm run typecheck && npm run build` desde `C:/Users/HP/PROYECTOS/misitioia-wt-sitio/` (repo canónico verificado — `misitioia-temp` es un skeleton menor sin `WORK_PLAN.md` ni `PROJECT_BRIEF.md`, no despliega producción).

---

## 9. Riesgos y lo que NO se hizo

### 9.1 No verificado

- **PageSpeed / Core Web Vitals reales de UENI.** El API pública de PageSpeed devolvió HTTP 429 (rate-limited) 2 veces. Correr manualmente desde `pagespeed.web.dev` cuando Jesús quiera cifras exactas para armar un post más fuerte.
- **Fecha en que UENI empezó a comunicar los "700,000 sitios".** Es un número redondo típico de marketing; puede llevar meses estático. No lo pude fechar.
- **Split de sitios UENI por país.** Nada público. El sitio de ADI (Zapopan) confirma presencia; no sé cuántos clientes mexicanos exactamente tienen.
- **Trustpilot en su versión mexicana.** Miré `nz.trustpilot.com` (Nueva Zelanda, resultado del search en inglés). Habría que ver `es.trustpilot.com/review/ueni.com` con más volumen y filtro país=MX para saber si las quejas mexicanas tienen un patrón distinto.
- **Si Meta / WhatsApp está rechazando efectivamente sitios UENI.** El argumento se apoya en el incidente Héctor + política oficial de Meta, no en un contador de rechazos UENI-específico. Es sólido pero no medido.
- **Precio dinámico por país.** Verifiqué US ($79 + $24.99/mo) y MX ($1,399 + $439/mo). No verifiqué CO/CL/BR/ES.

### 9.2 Lo que NO se hizo (por diseño)

- **No se creó `/blog` ni post SEO.** Requiere decisión estratégica sobre abrir línea de contenidos ahora.
- **No se creó `/migra-desde-ueni`.** Depende de tener panel del dueño (Fase 4) para cerrar el ciclo — sin eso la página existe pero no convierte.
- **No se ajustó copy de la landing.** Explícitamente prohibido por Jesús. La línea sugerida ("legales completas y válidas") queda como recomendación para su decisión.
- **No se deployó nada.** Se agregó código sin `git push` ni `vercel --prod`.

### 9.3 Decisiones que quedan para Jesús

1. **¿Publicar la comparativa UENI en producción?** (Requiere `git add` + `commit` + `push` + `vercel --prod`.)
2. **¿Ajustar la landing con el argumento de las legales?** (Cambio a `page.tsx` + `brand.ts`.)
3. **¿Abrir línea de contenidos /blog?** (Post "MiSitio IA vs UENI" es SEO valioso.)
4. **¿Priorizar Fase 4 (panel del dueño) para desbloquear `/migra-desde-ueni`?**
5. **¿Incluir el hallazgo de UENI en el pitch de la campaña de llamadas de TerraLeads?** (Un dueño con sitio UENI es un prospecto especialmente calificado — ya paga por un sitio; puede pagar por uno mejor.)

---

## 10. Fuentes consultadas

Todas verificadas en esta sesión (4-sep-2026, 23:57–00:15 hora Monterrey):

1. `https://ueni.com/en-us/` — home US con "$79 to launch", "700,000 websites", teléfono, Trustpilot claim
2. `https://ueni.com/en-us/pricing/` — pricing completo con 4 tiers y setup $599/$79
3. `https://ueni.com/es-mx/` — home Mexico con "$1,399 MXN" y "MXN$439/mo"
4. `https://ueni.com/es-mx/web-gratis` — página que sugiere plan gratis pero no lo confirma
5. `https://ueni.com/es-mx/about-us` — founders, HQ, 120 empleados
6. `https://adi-alarmas.ueniweb.com/` — cliente real analizado (HTML, meta, JSON-LD)
7. `https://adi-alarmas.ueniweb.com/terms-and-conditions` — placeholder verbatim confirmado
8. `https://adi-alarmas.ueniweb.com/legal-notice` — mismo placeholder
9. `https://adi-alarmas.ueniweb.com/merchant-policy` — mismo placeholder
10. `https://adi-alarmas.ueniweb.com/robots.txt` — 4 líneas, cero bots IA nombrados
11. `https://adi-alarmas.ueniweb.com/sitemap.xml` — lastmod 2023-06-30 en contenido
12. `https://adi-alarmas.ueniweb.com/llms.txt` — devuelve HTML SPA (no soportan)
13. Trustpilot `nz.trustpilot.com/review/ueni.com` — 4.7/5 con 9,257 reseñas
14. Wikipedia `Anthony Rose (entrepreneur)` — descarta relación (Anthony Rose es de SeedLegals, no UENI)
15. Crunchbase / Tracxn / Crustdata — funding $31.1 M, 4 rondas, sede Londres
16. GOV.UK `find-and-update.company-information.service.gov.uk/company/09368082/filing-history` — fecha oficial de incorporación
17. Quejas verbatim en foros y reviews sobre "hidden fees" y "$16.99/mo" adicionales — extraídas de resultados de WebSearch de septiembre 2026

**Referencia interna:** memoria `C:/Users/HP/.claude/projects/C--Users-HP-PROYECTOS/memory/aeo-stack-3-sitios.md` (stack AEO de la fábrica).

---

*Fin del documento. Para cualquier verificación posterior, los HTMLs crudos del análisis quedaron en el scratchpad de la sesión: `C:/Users/HP/AppData/Local/Temp/claude/C--Users-HP-PROYECTOS/18d7b003-2f1b-4c99-9d7a-86b4e0bb6dd9/scratchpad/ueni/`. El scratchpad es efímero — si se necesita evidencia persistente, mover a `MEMORIA/` o al repo.*
