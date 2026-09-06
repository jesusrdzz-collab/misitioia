# Sprint — Imágenes IA + Sistema de plantillas seleccionables

> **Iniciado:** 2026-09-06 · **Estado:** APLICADO EN main
> Feedback disparador de Jesús (6-sep, tras probar `herreria-san-juan.misitio.site`):
> *"La página no tiene imágenes IA y no hay opción para que el cliente elija plantilla.
> Estamos por debajo de la competencia (ADI Alarmas / UENI) que definimos como inferior."*

## Diagnóstico visual (6-sep 00:35 CDMX)

**`adi-alarmas.ueniweb.com` (UENI):** Fotografía real full-bleed en el hero, doble
barra superior (navy + blanca con CTA naranja "Enviar Mensaje"), títulos "Descripción"/
"Facilidades"/"Productos" grandes centrados en navy. Paleta navy `#0f2c5c` + naranja
`#f97316`. Tipografía sans-serif condensada.

**`herreria-san-juan.misitio.site` (nuestro):** Gradiente naranja sólido con pill
"Herrería" + título Playfair. **Cero imagen.** Naranja terracota `#c2410c`. Se
ve etéreo comparado con UENI, que compensa código pobre con una foto real grande.

## Alcance aplicado

### PARTE A — Imágenes IA
- `src/features/generator/images.ts`: cliente Gemini 2.5 Flash Image (Nano Banana) con
  NOTXT + upload a Supabase Storage bucket `site-images` en `{tenant}/{site}/ai/{slot}-{ts}.png`.
- `src/features/generator/image-prompts.ts`: prompts documentales en inglés por giro
  (14 grupos: salud_animal, automotriz, salud, dentista, belleza, barberia, fitness,
  retail, panaderia, construccion, herreria, ferreteria, hogar, generico).
- `src/features/generator/stock-fallback.ts`: URLs Unsplash por giro (fallback si
  Gemini falla o no hay API key). Nunca sitio sin imagen.
- Costo esperado: 3 × $0.039 = **~$0.12 USD por sitio nuevo**.

### PARTE B — Sistema de plantillas seleccionables (4)
| Slug | Look | Ideal para |
|---|---|---|
| `terracota-classic` | Actual (Playfair + Inter, naranja, hero gradiente) | Construcción, herrería, oficios |
| `marino-profesional` | Doble barra navy + naranja, hero foto full-bleed (UENI mejorado) | Automotriz, seguridad, servicios técnicos |
| `verde-natural` | Verde salvia + crema, hero dos columnas con foto | Salud, veterinaria, wellness, panadería |
| `rosa-premium` | Rosa/burdeos + crema + dorado, hero cinematográfico | Belleza, boutique, spa |

- `src/features/templates/registry.ts`: resuelve slug → componente con alias legacy
  (`automotriz` → `marino-profesional`, `salud_animal` → `verde-natural`, etc.).
- `src/features/templates/actions.ts`: `applyTemplateAction` + `regenerateImageAction`.
- `src/features/templates/components/TemplateGrid.tsx`: selector con preview SVG por
  plantilla + regeneración de imágenes por slot desde el panel.
- `src/app/editar/apariencia/page.tsx`: nueva sección "Apariencia" en el panel del cliente.
- `src/features/dashboard/components/DashboardShell.tsx`: nueva pestaña 🎨 Apariencia.

### Migración BD (aplicada)
- `sites.template` default cambiado a `'terracota-classic'`.
- Columnas nuevas: `site_content.about_image_url`, `site_content.catalog_placeholder_url`.

## Referencia
- Análisis competitivo previo: `COMPETENCIA_UENI_ANALISIS_4SEP2026.md`
- Doctrina NOTXT + text overlay: memoria `adgenesis-gemini-texto-espanol-falla`
