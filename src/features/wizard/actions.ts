'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase/server'
import { authorizeSiteAccess } from '@/features/editor/authorize'
import { resolveUniqueSlug } from '@/features/generator/slug'
import { templateForGiro } from '@/features/generator/templates'
import { GIRO_NOMBRE, giroNombre } from '@/features/generator/giros'
import { generateSiteImages } from '@/features/generator/images'
import { regenerateImageWithLock } from '@/features/generator/regen-lock'
import { suggestTemplateForGiro, TEMPLATE_REGISTRY } from '@/features/templates/registry'
import { recalculateLegalReady } from '@/lib/legal-guard'

/**
 * Server Actions del wizard de 3 pasos (Sprint 6-sep-2026).
 *
 * Pasos:
 *   1a - preview: nombre + giro + descripción libre → crea sitio con
 *        datos ficticios placeholder, plantilla sugerida por giro, imágenes
 *        vía fallback stock (rápido, sin IA). El cliente ve cómo se vería.
 *   1b - publicable: teléfono/WhatsApp, correo, dirección, responsable,
 *        domicilio del responsable. Recalcula legal_ready.
 *   2  - plantilla: cliente elige entre las 5.
 *   3  - imágenes: subir propias o regenerar con IA. Al terminar → /editar.
 *
 * Persistencia: cada paso guarda en BD + actualiza sites.wizard_step. Si el
 * cliente cierra el navegador puede volver a /crear y retomar donde lo dejó
 * (getMyLastWizardSite).
 */

async function currentUserEmail(): Promise<string | null> {
  const supabase = await createServerSupabase()
  const { data } = await supabase.auth.getUser()
  return data.user?.email ?? null
}

// ————————————————————————————————————————————————————————————————
// Paso 1a — Crear preview
// ————————————————————————————————————————————————————————————————

const paso1aSchema = z.object({
  business_name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres.').max(120),
  giro: z.string().trim().max(60).optional().nullable(),
  /**
   * Solo se guarda cuando `giro='otros'` — texto libre del cliente para
   * describir su giro real. Alimenta los prompts de IA y previene que las
   * imágenes caigan al genérico (terracota/artesanía) por default.
   * Fix P0 pre-campaña Meta 2026-09-07.
   */
  giro_libre: z.string().trim().min(3).max(80).optional().nullable(),
  descripcion: z.string().trim().max(600).optional().nullable(),
})

export interface WizardActionResult {
  ok: boolean
  siteId?: string
  slug?: string
  error?: string
}

/**
 * Crea el sitio en estado 'reclamado' con placeholders. Regresa siteId para
 * que la página redirija al paso 1b.
 * Datos de contacto/dirección se dejan NULL (los completa el paso 1b);
 * legal_ready = false hasta entonces.
 */
export async function createPreviewSiteAction(input: unknown): Promise<WizardActionResult> {
  const email = await currentUserEmail()
  if (!email) return { ok: false, error: 'Tu sesión expiró. Vuelve a entrar.' }

  const parsed = paso1aSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }
  }
  const { business_name, giro: rawGiro, giro_libre: rawGiroLibre, descripcion } = parsed.data

  const giro = rawGiro && GIRO_NOMBRE[rawGiro] ? rawGiro : null
  // giro_libre solo importa cuando el cliente eligió "otros" en el selector;
  // si eligió un giro real del catálogo, ignoramos cualquier texto libre.
  const giroLibre = giro === 'otros' ? (rawGiroLibre?.trim() ?? null) : null
  const template = templateForGiro(giro)
  const templateSlug = suggestTemplateForGiro(giro)

  const admin = await createAdminSupabase()

  const slug = await resolveUniqueSlug(business_name, {
    slugExists: async (s) => {
      const { data } = await admin.from('sites').select('id').eq('slug', s).maybeSingle()
      return !!data
    },
    isReserved: async (s) => {
      const { data } = await admin
        .from('reserved_subdomains')
        .select('slug')
        .eq('slug', s)
        .maybeSingle()
      return !!data
    },
  })

  const { data: tenant, error: tErr } = await admin
    .from('tenants')
    .insert({ owner_email: email, plan: 'free' })
    .select('id')
    .single()
  if (tErr || !tenant) return { ok: false, error: `Error creando tenant: ${tErr?.message}` }

  const { data: site, error: sErr } = await admin
    .from('sites')
    .insert({
      tenant_id: tenant.id,
      slug,
      business_name,
      giro,
      giro_libre: giroLibre,
      template: templateSlug,
      status: 'reclamado',
      source: 'wizard',
      claimed_at: new Date().toISOString(),
      wizard_step: 'paso-1b',
    })
    .select('id')
    .single()
  if (sErr || !site) return { ok: false, error: `Error creando site: ${sErr?.message}` }

  // Imágenes rápidas via stock (paso 1a es preview, no queremos gastar
  // ~$0.12 de Gemini antes de que el cliente decida seguir). El paso 3
  // ofrecerá regenerar con IA si el cliente quiere.
  await generateSiteImages({
    businessName: business_name,
    giro,
    giroLibre,
    descripcion: descripcion?.trim() ?? null,
    tenantId: tenant.id,
    siteId: site.id,
    admin,
    aiEnabled: false, // solo stock — paso 3 upgrade a IA
  }).catch((e) => {
    console.warn('[wizard 1a] images falló:', (e as Error)?.message)
  })

  const heroTitle = business_name
  const heroSubtitle = descripcion?.trim()
    || (giro ? `Todo lo que necesitas de ${giroNombre(giro)}, hecho para ti.` : null)

  const { error: cErr } = await admin.from('site_content').insert({
    site_id: site.id,
    tenant_id: tenant.id,
    hero_title: heroTitle,
    hero_subtitle: heroSubtitle,
    about_text: descripcion?.trim() || null,
    services: [],
    highlights: [],
    primary_color: template.primaryColor,
    accent_color: template.accentColor,
    generated_at: new Date().toISOString(),
  })
  if (cErr) return { ok: false, error: `Error creando site_content: ${cErr.message}` }

  await recalculateLegalReady(admin, site.id)

  revalidatePath(`/sites/${slug}`)
  revalidatePath(`/sites/${slug}`, 'layout')

  return { ok: true, siteId: site.id, slug }
}

// ————————————————————————————————————————————————————————————————
// Paso 1b — Datos publicables (contacto + responsable)
// ————————————————————————————————————————————————————————————————

const paso1bSchema = z.object({
  contact_phone: z.string().trim().max(40).optional().nullable(),
  contact_whatsapp: z.string().trim().max(40).optional().nullable(),
  contact_email: z
    .string()
    .trim()
    .email('Escribe un correo válido.')
    .max(160),
  contact_address: z.string().trim().min(5, 'La dirección es obligatoria.').max(300),
  responsable_nombre: z.string().trim().min(2, 'El nombre del responsable es obligatorio.').max(200),
  responsable_domicilio_igual: z.boolean().optional(),
  responsable_domicilio: z.string().trim().max(400).optional().nullable(),
  working_hours: z.record(z.string(), z.string()).optional().nullable(),
})

export async function savePaso1bAction(
  siteId: string,
  input: unknown,
): Promise<WizardActionResult> {
  const email = await currentUserEmail()
  if (!email) return { ok: false, error: 'Tu sesión expiró. Vuelve a entrar.' }
  const authorized = await authorizeSiteAccess(siteId, email)
  if (!authorized) return { ok: false, error: 'No tienes acceso a este sitio.' }

  const parsed = paso1bSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Revisa los datos.' }
  }
  const d = parsed.data
  if (!d.contact_phone && !d.contact_whatsapp) {
    return { ok: false, error: 'Necesitamos al menos un teléfono o WhatsApp.' }
  }

  const domicilio = d.responsable_domicilio_igual
    ? d.contact_address
    : (d.responsable_domicilio || '').trim() || null

  if (!domicilio) {
    return { ok: false, error: 'El domicilio del responsable es obligatorio.' }
  }

  const admin = await createAdminSupabase()
  const patch = {
    contact_phone: d.contact_phone?.trim() || null,
    contact_whatsapp: d.contact_whatsapp?.trim() || null,
    contact_email: d.contact_email.trim(),
    contact_address: d.contact_address.trim(),
    responsable_nombre: d.responsable_nombre.trim(),
    responsable_domicilio: domicilio,
    working_hours: d.working_hours && Object.keys(d.working_hours).length ? d.working_hours : null,
    updated_at: new Date().toISOString(),
  }

  const { error: cErr } = await admin
    .from('site_content')
    .update(patch)
    .eq('site_id', authorized.siteId)
  if (cErr) return { ok: false, error: cErr.message }

  await admin
    .from('sites')
    .update({ wizard_step: 'paso-2', updated_at: new Date().toISOString() })
    .eq('id', authorized.siteId)

  await recalculateLegalReady(admin, authorized.siteId)

  revalidatePath(`/sites/${authorized.slug}`)
  revalidatePath(`/sites/${authorized.slug}`, 'layout')

  return { ok: true, siteId: authorized.siteId, slug: authorized.slug }
}

// ————————————————————————————————————————————————————————————————
// Paso 2 — Elegir plantilla
// ————————————————————————————————————————————————————————————————

const paso2Schema = z.object({
  template: z.string().min(1).max(60),
})

export async function savePaso2Action(
  siteId: string,
  input: unknown,
): Promise<WizardActionResult> {
  const email = await currentUserEmail()
  if (!email) return { ok: false, error: 'Tu sesión expiró. Vuelve a entrar.' }

  const authorized = await authorizeSiteAccess(siteId, email)
  if (!authorized) return { ok: false, error: 'No tienes acceso a este sitio.' }

  const parsed = paso2Schema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'Elige una plantilla.' }

  if (!TEMPLATE_REGISTRY[parsed.data.template]) {
    return { ok: false, error: 'Esa plantilla no existe.' }
  }

  const admin = await createAdminSupabase()
  const { error } = await admin
    .from('sites')
    .update({
      template: parsed.data.template,
      wizard_step: 'paso-3',
      updated_at: new Date().toISOString(),
    })
    .eq('id', authorized.siteId)
  if (error) return { ok: false, error: error.message }

  revalidatePath(`/sites/${authorized.slug}`)
  revalidatePath(`/sites/${authorized.slug}`, 'layout')

  return { ok: true, siteId: authorized.siteId, slug: authorized.slug }
}

// ————————————————————————————————————————————————————————————————
// Paso 3 — Imágenes (regenerar con IA / marcar done)
// ————————————————————————————————————————————————————————————————

/**
 * Regenera con IA una de las 3 imágenes del sitio en este paso 3.
 * Reusa la infra ya existente de regenerateSingleImage. El cliente puede
 * llamarla varias veces por slot (hero/about/catalog).
 */
export async function regenerateWizardImageAction(
  siteId: string,
  slot: 'hero' | 'about' | 'catalog',
): Promise<{
  ok: boolean
  url?: string
  source?: 'ai' | 'stock'
  error?: string
  code?: 'REGEN_LIMIT_REACHED' | 'GEN_FAILED' | 'DB_ERROR'
  regensRemaining?: number
}> {
  const email = await currentUserEmail()
  if (!email) return { ok: false, error: 'Tu sesión expiró.' }
  const authorized = await authorizeSiteAccess(siteId, email)
  if (!authorized) return { ok: false, error: 'No tienes acceso a este sitio.' }

  const admin = await createAdminSupabase()
  const result = await regenerateImageWithLock({
    slot,
    giro: authorized.giro,
    giroLibre: authorized.giroLibre,
    tenantId: authorized.tenantId,
    siteId: authorized.siteId,
    admin,
  })
  if (!result.ok) {
    return {
      ok: false,
      error: result.error ?? 'No se pudo regenerar la imagen.',
      code: result.code,
      regensRemaining: result.regensRemaining,
    }
  }

  revalidatePath(`/sites/${authorized.slug}`)
  revalidatePath(`/sites/${authorized.slug}`, 'layout')

  return {
    ok: true,
    url: result.url,
    source: result.source,
    regensRemaining: result.regensRemaining,
  }
}

/**
 * Guarda una imagen subida por el cliente (URL ya en Storage o CDN) en el
 * slot correspondiente. La subida real la hace el componente con
 * uploadSiteImage (feature/editor).
 */
const setImageSchema = z.object({
  slot: z.enum(['hero', 'about', 'catalog']),
  image_url: z.string().url().max(600),
})

export async function setWizardImageAction(
  siteId: string,
  input: unknown,
): Promise<{ ok: boolean; error?: string }> {
  const email = await currentUserEmail()
  if (!email) return { ok: false, error: 'Tu sesión expiró.' }
  const authorized = await authorizeSiteAccess(siteId, email)
  if (!authorized) return { ok: false, error: 'No tienes acceso a este sitio.' }

  const parsed = setImageSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'Imagen inválida.' }

  const column =
    parsed.data.slot === 'hero'
      ? 'hero_image_url'
      : parsed.data.slot === 'about'
        ? 'about_image_url'
        : 'catalog_placeholder_url'

  const admin = await createAdminSupabase()
  const { error } = await admin
    .from('site_content')
    .update({ [column]: parsed.data.image_url, updated_at: new Date().toISOString() })
    .eq('site_id', authorized.siteId)
  if (error) return { ok: false, error: error.message }

  revalidatePath(`/sites/${authorized.slug}`)
  revalidatePath(`/sites/${authorized.slug}`, 'layout')

  return { ok: true }
}

/**
 * Marca el wizard como completado (`wizard_step = 'done'`) y redirige a
 * `/editar/mi-sitio` con un flag de bienvenida.
 */
export async function finishWizardAction(siteId: string): Promise<never> {
  const email = await currentUserEmail()
  if (!email) redirect('/crear/paso-1a')

  const authorized = await authorizeSiteAccess(siteId, email)
  if (!authorized) redirect('/crear/paso-1a')

  const admin = await createAdminSupabase()
  await admin
    .from('sites')
    .update({ wizard_step: 'done', updated_at: new Date().toISOString() })
    .eq('id', authorized.siteId)

  revalidatePath(`/sites/${authorized.slug}`)

  redirect(`/editar?site=${authorized.siteId}&welcome=1`)
}

// ————————————————————————————————————————————————————————————————
// Retomar desde donde el cliente se quedó
// ————————————————————————————————————————————————————————————————

/**
 * Devuelve el sitio más reciente del cliente que todavía esté en el wizard
 * (`wizard_step != 'done'` o null). Retorna null si no hay uno pendiente.
 * La landing /crear lo usa para ofrecer "retomar" antes de empezar de cero.
 */
export async function getMyLastWizardSite(): Promise<
  { siteId: string; slug: string; step: string; businessName: string } | null
> {
  const email = await currentUserEmail()
  if (!email) return null

  const admin = await createAdminSupabase()
  const { data: tenants } = await admin
    .from('tenants')
    .select('id')
    .eq('owner_email', email)
  const tenantIds = (tenants ?? []).map((t) => (t as { id: string }).id)
  if (tenantIds.length === 0) return null

  const { data: sites } = await admin
    .from('sites')
    .select('id, slug, wizard_step, business_name, status, created_at')
    .in('tenant_id', tenantIds)
    .neq('status', 'dado_de_baja')
    .in('wizard_step', ['paso-1b', 'paso-2', 'paso-3'])
    .order('created_at', { ascending: false })
    .limit(1)

  const row = (sites ?? [])[0] as
    | { id: string; slug: string; wizard_step: string; business_name: string }
    | undefined

  if (!row) return null
  return {
    siteId: row.id,
    slug: row.slug,
    step: row.wizard_step,
    businessName: row.business_name,
  }
}
