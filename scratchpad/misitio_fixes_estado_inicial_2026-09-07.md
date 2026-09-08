# Estado inicial — Fixes P0 MiSitio antes de Meta
**Fecha inicio:** 2026-09-07 07:51 Monterrey (UTC-6)
**Rama:** main (auto deploy Vercel)
**Último commit:** 52c967a feat(ig-publisher)

## Site de prueba: cdc19d33-a19e-4bf6-9840-2bc1b4f90900 "Seguros Jr"
- `giro = 'agencia-viajes'` ← ORIGEN DEL PROBLEMA. No hay "seguros" en el catálogo, Jesús seleccionó el más parecido.
- `slug = 'segurosjr'`
- `tenant_id = 067ddbfb-f505-4b39-a535-94275a1e4c21`
- `template = 'neutro-minimalista'`
- `status = 'reclamado'`, `wizard_step = 'done'`

## Archivos clave identificados

| Fix | Archivo |
|-----|---------|
| Catálogo giros | `src/features/generator/giros.ts` (40 slugs actuales) |
| Selector wizard | `src/features/wizard/components/Paso1aForm.tsx` |
| Server action wizard | `src/features/wizard/actions.ts` |
| Prompts IA por giro | `src/features/generator/image-prompts.ts` (13 grupos) |
| Fallback stock | `src/features/generator/stock-fallback.ts` |
| Generación imgs | `src/features/generator/images.ts` |
| WhatsApp helper | `src/features/sites/contact.ts` (`waHref`) |
| Renderer sitio público | `src/app/sites/[slug]/page.tsx` |
| Renderer templates | `src/features/templates/{terracota-classic,marino-profesional,verde-natural,rosa-premium,neutro-minimalista}/index.tsx` |

## Schema `sites` (columns actuales)
```
id, tenant_id, slug, business_name, giro, template, status, source,
lead_id, custom_domain, claimed_at, created_at, updated_at,
meta_pixel_id, ga_measurement_id, analytics_enabled_at,
previous_slugs, legal_ready, wizard_step
```
NO existe `giro_libre` → migration necesaria.

## Análisis raíz del bug de imágenes
1. Jesús eligió `giro='agencia-viajes'` (no había "seguros")
2. `promptForGiro('agencia-viajes')` → no está en `GIRO_TO_GROUP` → cae a `'generico'`
3. `'generico'` genera "warm friendly small mexican business storefront interior" → imágenes de tienda/artesanía terracota
4. Confirmado también en `stock-fallback.ts` GIRO_TO_GROUP (agencia-viajes no existe → generico → imagen 1441986300917 de Unsplash tipo storefront)

## Giros que YA existen (revisar duplicados antes de crear)
aire-acondicionado, boutique, dentista, estetica, ferreteria, floreria, gimnasio, muebleria, refaccionaria, taller-mecanico, veterinaria, agencia-viajes, barberia, imprenta, inmobiliaria, llantera, material-construccion, optica, panaderia, papeleria, purificadora, tienda-mascotas, vidrieria, zapateria, carpinteria, cerrajeria, electricista, herreria, joyeria, plomeria, renta-mobiliario, salon-fiestas, spa, taller-motos, tapiceria, uniformes, fisioterapia, nutriologo, remodelaciones, telas-merceria

## Giros a AÑADIR (10+)
- seguros
- finanzas (asesor financiero)
- contabilidad
- asesoria-legal (despacho jurídico)
- agencia-marketing (publicidad)
- fotografia
- eventos-catering
- escuela (academia)
- restaurante
- cafeteria
- minisuper (abarrotes)
- farmacia
- construccion-general (albañilería — distinto de material-construccion)
- **otros** (siempre al final; abre `giro_libre` input)

## Cómo se usa `wa` prop en templates
Los 5 templates leen `wa: string | null` como href para `<a href={wa}>💬 WhatsApp</a>`. No modifican nada; basta con inyectar `?text=...` al construir `wa` en `sites/[slug]/page.tsx`.

## Plan
1. Migration → añadir columna `giro_libre TEXT` a `sites`.
2. Ampliar `giros.ts` con nuevos slugs + orden alfa + "otros" al final.
3. Actualizar `Paso1aForm.tsx` — cuando giro='otros', mostrar input `giro_libre`.
4. Actualizar `wizard/actions.ts` schema + insert para incluir `giro_libre`.
5. Ampliar `image-prompts.ts` con prompts nuevos + fallback smart usando `giro_libre` + `descripcion`.
6. Ampliar `stock-fallback.ts` para los nuevos grupos.
7. Extender `waHref` para aceptar mensaje opcional + helper `waMessageForGiro`.
8. Pasar mensaje en `sites/[slug]/page.tsx`.
9. Regenerar 3 imágenes de "Seguros Jr" via server action (después de arreglar giro).
10. Corregir `giro='seguros'` en el site cdc19d33 en BD.
