'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase/server'
import { authorizeSiteAccess } from '@/features/editor/authorize'
import {
  addDomainToProject,
  removeDomainFromProject,
  getDomainStatus,
  type DomainStatus,
} from '@/lib/vercel-domains'
import type { ServiceItem, SiteProduct } from '@/lib/types/site'

/**
 * Server Actions del panel del cliente (dashboard "Datos de Victoria",
 * dominio y plan).
 *
 * Patrón de seguridad (idéntico al editor por chat):
 *  - La sesión del dueño se lee server-side (createServerSupabase → cookies/JWT).
 *  - Se autoriza que el sitio es suyo (authorizeSiteAccess).
 *  - Las escrituras usan el cliente admin (service_role) YA autorizadas y
 *    SIEMPRE acotadas al siteId/tenantId. NUNCA se escribe con
 *    createBrowserClient bajo RLS (bug conocido documentado en CLAUDE.md).
 */

export interface ActionResult {
  ok: boolean
  error?: string
}

export interface ProductInput {
  id?: string | null
  name: string
  description?: string | null
  price?: number | null
  currency?: string | null
  image_url?: string | null
  category?: string | null
  is_active?: boolean
  sort_order?: number
}

async function currentUserEmail(): Promise<string | null> {
  const supabase = await createServerSupabase()
  const { data } = await supabase.auth.getUser()
  return data.user?.email ?? null
}

/** Refresca las rutas del panel y la página pública del sitio. */
function revalidateSite(slug: string): void {
  revalidatePath('/editar/datos')
  revalidatePath('/editar/dominio')
  revalidatePath('/editar/plan')
  revalidatePath(`/sites/${slug}`)
  revalidatePath(`/sites/${slug}`, 'layout')
}

// ————————————————————————————————————————————————————————————————
// Esquemas
// ————————————————————————————————————————————————————————————————

const basicsSchema = z.object({
  about_text: z.string().max(1500).nullable().optional(),
  contact_phone: z.string().max(40).nullable().optional(),
  contact_whatsapp: z.string().max(40).nullable().optional(),
  contact_email: z.string().max(160).nullable().optional(),
  contact_address: z.string().max(300).nullable().optional(),
  ciudad: z.string().max(120).nullable().optional(),
  zona: z.string().max(120).nullable().optional(),
  estado: z.string().max(120).nullable().optional(),
  social_facebook: z.string().max(300).nullable().optional(),
  social_instagram: z.string().max(300).nullable().optional(),
  working_hours: z.record(z.string(), z.string()).nullable().optional(),
})

export type VictoriaBasics = z.infer<typeof basicsSchema>

const servicesSchema = z
  .array(
    z.object({
      name: z.string().min(1).max(80),
      description: z.string().max(240).nullable().optional(),
      icon: z.string().max(8).nullable().optional(),
    }),
  )
  .max(12)

const productSchema = z.object({
  id: z.string().uuid().nullable().optional(),
  name: z.string().min(1).max(120),
  description: z.string().max(400).nullable().optional(),
  price: z.number().nonnegative().nullable().optional(),
  currency: z.string().max(8).nullable().optional(),
  image_url: z.string().max(600).nullable().optional(),
  category: z.string().max(80).nullable().optional(),
  is_active: z.boolean().optional(),
  sort_order: z.number().int().optional(),
})

// hostname simple: labels alfanuméricos separados por punto, con al menos un punto.
const DOMAIN_RE = /^(?!-)[a-z0-9-]{1,63}(?<!-)(\.(?!-)[a-z0-9-]{1,63}(?<!-))+$/

// ————————————————————————————————————————————————————————————————
// Datos de Victoria
// ————————————————————————————————————————————————————————————————

/** Guarda contacto, ubicación, "acerca de", horarios y redes sociales. */
export async function saveVictoriaBasics(
  siteId: string,
  input: VictoriaBasics,
): Promise<ActionResult> {
  const email = await currentUserEmail()
  if (!email) return { ok: false, error: 'Tu sesión expiró. Vuelve a entrar.' }

  const authorized = await authorizeSiteAccess(siteId, email)
  if (!authorized) return { ok: false, error: 'No tienes acceso a este sitio.' }

  const parsed = basicsSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'Datos inválidos.' }

  const patch: Record<string, unknown> = {
    ...parsed.data,
    updated_at: new Date().toISOString(),
  }

  const admin = await createAdminSupabase()
  const { error } = await admin
    .from('site_content')
    .update(patch)
    .eq('site_id', authorized.siteId)
  if (error) return { ok: false, error: error.message }

  await admin
    .from('sites')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', authorized.siteId)

  revalidateSite(authorized.slug)
  return { ok: true }
}

/** Reemplaza la lista completa de servicios. */
export async function saveServices(
  siteId: string,
  services: ServiceItem[],
): Promise<ActionResult> {
  const email = await currentUserEmail()
  if (!email) return { ok: false, error: 'Tu sesión expiró. Vuelve a entrar.' }

  const authorized = await authorizeSiteAccess(siteId, email)
  if (!authorized) return { ok: false, error: 'No tienes acceso a este sitio.' }

  const parsed = servicesSchema.safeParse(services)
  if (!parsed.success) return { ok: false, error: 'Revisa los servicios: cada uno necesita nombre.' }

  const clean: ServiceItem[] = parsed.data.map((s) => ({
    name: s.name,
    description: s.description ?? null,
    icon: s.icon ?? null,
  }))

  const admin = await createAdminSupabase()
  const { error } = await admin
    .from('site_content')
    .update({ services: clean, updated_at: new Date().toISOString() })
    .eq('site_id', authorized.siteId)
  if (error) return { ok: false, error: error.message }

  revalidateSite(authorized.slug)
  return { ok: true }
}

// ————————————————————————————————————————————————————————————————
// Catálogo de productos
// ————————————————————————————————————————————————————————————————

/** Lista los productos del sitio (activos e inactivos) para el panel. */
export async function listProducts(siteId: string): Promise<SiteProduct[]> {
  const email = await currentUserEmail()
  if (!email) return []

  const authorized = await authorizeSiteAccess(siteId, email)
  if (!authorized) return []

  const admin = await createAdminSupabase()
  const { data } = await admin
    .from('site_products')
    .select('*')
    .eq('site_id', authorized.siteId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  return (data as SiteProduct[]) ?? []
}

/** Crea o actualiza un producto del catálogo. */
export async function upsertProduct(
  siteId: string,
  product: ProductInput,
): Promise<ActionResult> {
  const email = await currentUserEmail()
  if (!email) return { ok: false, error: 'Tu sesión expiró. Vuelve a entrar.' }

  const authorized = await authorizeSiteAccess(siteId, email)
  if (!authorized) return { ok: false, error: 'No tienes acceso a este sitio.' }

  const parsed = productSchema.safeParse(product)
  if (!parsed.success) return { ok: false, error: 'Revisa el producto: el nombre es obligatorio.' }
  const p = parsed.data

  const admin = await createAdminSupabase()
  const fields = {
    name: p.name,
    description: p.description ?? null,
    price: p.price ?? null,
    currency: p.currency || 'MXN',
    image_url: p.image_url || null,
    category: p.category ?? null,
    is_active: p.is_active ?? true,
    sort_order: p.sort_order ?? 0,
    updated_at: new Date().toISOString(),
  }

  if (p.id) {
    const { error } = await admin
      .from('site_products')
      .update(fields)
      .eq('id', p.id)
      .eq('site_id', authorized.siteId)
    if (error) return { ok: false, error: error.message }
  } else {
    const { error } = await admin.from('site_products').insert({
      ...fields,
      site_id: authorized.siteId,
      tenant_id: authorized.tenantId,
    })
    if (error) return { ok: false, error: error.message }
  }

  revalidateSite(authorized.slug)
  return { ok: true }
}

/** Elimina un producto del catálogo. */
export async function deleteProduct(
  siteId: string,
  productId: string,
): Promise<ActionResult> {
  const email = await currentUserEmail()
  if (!email) return { ok: false, error: 'Tu sesión expiró. Vuelve a entrar.' }

  const authorized = await authorizeSiteAccess(siteId, email)
  if (!authorized) return { ok: false, error: 'No tienes acceso a este sitio.' }

  const admin = await createAdminSupabase()
  const { error } = await admin
    .from('site_products')
    .delete()
    .eq('id', productId)
    .eq('site_id', authorized.siteId)
  if (error) return { ok: false, error: error.message }

  revalidateSite(authorized.slug)
  return { ok: true }
}

// ————————————————————————————————————————————————————————————————
// Dominio personalizado
// ————————————————————————————————————————————————————————————————

/** Resultado de guardar/refrescar dominio: incluye el estado de Vercel. */
export interface DomainActionResult extends ActionResult {
  /** Estado de verificación en Vercel (undefined si se quitó el dominio). */
  status?: DomainStatus
}

/**
 * Guarda (o borra con null) el dominio personalizado del sitio.
 * Valida un hostname simple, lo normaliza a minúsculas y maneja el conflicto
 * de unicidad de forma amable.
 *
 * Tras guardar, adjunta el dominio al proyecto de Vercel (`addDomainToProject`)
 * y devuelve el estado de verificación (`getDomainStatus`) para que el panel
 * muestre los registros DNS reales. Si el token de Vercel no está configurado,
 * degrada con gracia: el dominio queda guardado y el estado es `no-configurado`.
 * Al quitar el dominio (null) se intenta desvincularlo de Vercel (best-effort).
 */
export async function saveCustomDomain(
  siteId: string,
  domain: string | null,
): Promise<DomainActionResult> {
  const email = await currentUserEmail()
  if (!email) return { ok: false, error: 'Tu sesión expiró. Vuelve a entrar.' }

  const authorized = await authorizeSiteAccess(siteId, email)
  if (!authorized) return { ok: false, error: 'No tienes acceso a este sitio.' }

  let value: string | null = null
  if (domain && domain.trim()) {
    value = domain
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/\/.*$/, '')
      .replace(/^www\./, '')
    if (!DOMAIN_RE.test(value)) {
      return { ok: false, error: 'Escribe un dominio válido, por ejemplo minegocio.com' }
    }
  }

  const admin = await createAdminSupabase()

  // Dominio previo: necesario para desvincularlo de Vercel si se está quitando.
  const { data: prevRow } = await admin
    .from('sites')
    .select('custom_domain')
    .eq('id', authorized.siteId)
    .maybeSingle()
  const previous = (prevRow as { custom_domain: string | null } | null)?.custom_domain ?? null

  const { error } = await admin
    .from('sites')
    .update({ custom_domain: value, updated_at: new Date().toISOString() })
    .eq('id', authorized.siteId)

  if (error) {
    // 23505 = unique_violation (el dominio ya está en uso por otro sitio).
    if (error.code === '23505') {
      return { ok: false, error: 'Ese dominio ya está registrado en otra cuenta.' }
    }
    return { ok: false, error: error.message }
  }

  revalidateSite(authorized.slug)

  // Quitar dominio → desvincular el anterior de Vercel (best-effort) y salir.
  if (!value) {
    if (previous) await removeDomainFromProject(previous)
    return { ok: true }
  }

  // Adjuntar a Vercel y leer estado. Nunca bloquea el guardado en BD.
  const attach = await addDomainToProject(value)
  if (!attach.ok && attach.error && attach.error !== 'no-configurado') {
    // El dominio quedó guardado, pero avisamos que Vercel falló.
    return {
      ok: true,
      error: `Guardado, pero Vercel no pudo conectarlo aún: ${attach.error}`,
      status: await getDomainStatus(value),
    }
  }

  return { ok: true, status: await getDomainStatus(value) }
}

/**
 * Vuelve a consultar el estado de verificación del dominio en Vercel.
 * Lo usa el botón "Volver a verificar" del panel. Requiere ser dueño del sitio.
 */
export async function refreshDomainStatus(siteId: string): Promise<DomainActionResult> {
  const email = await currentUserEmail()
  if (!email) return { ok: false, error: 'Tu sesión expiró. Vuelve a entrar.' }

  const authorized = await authorizeSiteAccess(siteId, email)
  if (!authorized) return { ok: false, error: 'No tienes acceso a este sitio.' }

  const admin = await createAdminSupabase()
  const { data: row } = await admin
    .from('sites')
    .select('custom_domain')
    .eq('id', authorized.siteId)
    .maybeSingle()

  const current = (row as { custom_domain: string | null } | null)?.custom_domain ?? null
  if (!current) return { ok: true }

  return { ok: true, status: await getDomainStatus(current) }
}
