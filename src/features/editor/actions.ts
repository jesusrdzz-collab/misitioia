'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase/server'
import { authorizeSiteAccess } from './authorize'
import { buildSiteSnapshot } from './context'
import { runEditorAgent } from './agent'
import type { ExecCtx } from './tools'
import type { ChatMessage, EditorTurnResult } from './types'

/**
 * Server Actions del editor por chat (Fase 4).
 *
 * Patrón de seguridad:
 *  - La sesión del dueño se lee server-side (createServerSupabase → cookies/JWT).
 *  - La autorización comprueba que el sitio es suyo (authorizeSiteAccess).
 *  - Las escrituras usan el cliente admin (service_role) YA autorizadas y
 *    acotadas al siteId. Esto evita el bug conocido de createBrowserClient sin JWT.
 */

async function currentUserEmail(): Promise<string | null> {
  const supabase = await createServerSupabase()
  const { data } = await supabase.auth.getUser()
  return data.user?.email ?? null
}

function origin(h: Headers): string {
  const explicit = h.get('origin')
  if (explicit) return explicit
  const host = h.get('host') || 'localhost:3000'
  const proto = host.includes('localhost') ? 'http' : 'https'
  return `${proto}://${host}`
}

/** Envía el magic link al correo del dueño. */
export async function sendMagicLink(
  email: string,
  next: string,
): Promise<{ ok: boolean; error?: string }> {
  const clean = email.trim().toLowerCase()
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(clean)) {
    return { ok: false, error: 'Escribe un correo válido.' }
  }
  const supabase = await createServerSupabase()
  const h = await headers()
  const redirectTo = `${origin(h)}/auth/callback?next=${encodeURIComponent(next)}`

  const { error } = await supabase.auth.signInWithOtp({
    email: clean,
    options: { emailRedirectTo: redirectTo, shouldCreateUser: true },
  })
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function signOut(): Promise<void> {
  const supabase = await createServerSupabase()
  await supabase.auth.signOut()
}

/**
 * Reclama un sitio sin dueño (owner_email null) vinculándolo al correo del
 * usuario autenticado. Verificación v1: el dueño tiene el enlace con su slug y
 * controla un correo real (magic link). Marca el sitio como 'reclamado'.
 */
export async function claimSite(
  slug: string,
): Promise<{ ok: boolean; siteId?: string; error?: string }> {
  const email = await currentUserEmail()
  if (!email) return { ok: false, error: 'Inicia sesión primero.' }

  const admin = await createAdminSupabase()
  const { data: site } = await admin
    .from('sites')
    .select('id, tenant_id, status, tenants(owner_email)')
    .eq('slug', slug.trim().toLowerCase())
    .maybeSingle()

  if (!site) return { ok: false, error: 'No encontré un sitio con ese subdominio.' }

  const tenant = site.tenants as unknown as { owner_email: string | null } | null
  const owner = tenant?.owner_email?.toLowerCase().trim()
  if (owner && owner !== email.toLowerCase().trim()) {
    return { ok: false, error: 'Ese sitio ya tiene otro dueño.' }
  }

  await admin.from('tenants').update({ owner_email: email }).eq('id', site.tenant_id)
  if (site.status === 'generado') {
    await admin
      .from('sites')
      .update({ status: 'reclamado', claimed_at: new Date().toISOString() })
      .eq('id', site.id)
  }

  return { ok: true, siteId: site.id }
}

/** Sube una imagen del sitio a Supabase Storage y devuelve su URL pública. */
export async function uploadSiteImage(
  formData: FormData,
): Promise<{ ok: boolean; url?: string; error?: string }> {
  const email = await currentUserEmail()
  if (!email) return { ok: false, error: 'Inicia sesión primero.' }

  const siteId = String(formData.get('siteId') || '')
  const file = formData.get('file')
  if (!(file instanceof File)) return { ok: false, error: 'No recibí ninguna imagen.' }
  if (file.size > 5 * 1024 * 1024) return { ok: false, error: 'La imagen supera 5 MB.' }

  const authorized = await authorizeSiteAccess(siteId, email)
  if (!authorized) return { ok: false, error: 'No tienes acceso a este sitio.' }

  const ext = (file.name.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '')
  const path = `${authorized.tenantId}/${authorized.siteId}/${Date.now()}.${ext}`

  const admin = await createAdminSupabase()
  const bytes = new Uint8Array(await file.arrayBuffer())
  const { error } = await admin.storage.from('site-images').upload(path, bytes, {
    contentType: file.type || 'image/png',
    upsert: true,
  })
  if (error) return { ok: false, error: error.message }

  const { data } = admin.storage.from('site-images').getPublicUrl(path)
  return { ok: true, url: data.publicUrl }
}

/**
 * Turno del editor por chat. En modo 'edit' requiere un siteId propio; en modo
 * 'create' crea el sitio dentro del turno (la herramienta createSite).
 */
export async function sendEditorMessage(input: {
  mode: 'edit' | 'create'
  siteId: string | null
  history: ChatMessage[]
  message: string
  images?: string[]
}): Promise<EditorTurnResult> {
  const fail = (error: string): EditorTurnResult => ({
    reply: '',
    changes: [],
    slug: null,
    siteId: input.siteId,
    created: false,
    error,
  })

  const email = await currentUserEmail()
  if (!email) return fail('Tu sesión expiró. Vuelve a entrar con tu correo.')

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return fail('Falta configurar GEMINI_API_KEY en el servidor.')

  const admin = await createAdminSupabase()

  const ctx: ExecCtx = {
    admin,
    ownerEmail: email,
    siteId: null,
    tenantId: null,
    slug: null,
    giro: null,
    businessName: null,
  }

  let snapshot = 'Aún no hay sitio; hay que crearlo.'

  if (input.mode === 'edit') {
    if (!input.siteId) return fail('No se indicó qué sitio editar.')
    const authorized = await authorizeSiteAccess(input.siteId, email)
    if (!authorized) return fail('No tienes acceso a este sitio.')
    ctx.siteId = authorized.siteId
    ctx.tenantId = authorized.tenantId
    ctx.slug = authorized.slug
    ctx.giro = authorized.giro
    ctx.businessName = authorized.businessName
    snapshot = await buildSiteSnapshot(admin, authorized.siteId)
  } else if (input.siteId) {
    // Modo create pero ya se creó el sitio en un turno previo: autorizar y editar.
    const authorized = await authorizeSiteAccess(input.siteId, email)
    if (authorized) {
      ctx.siteId = authorized.siteId
      ctx.tenantId = authorized.tenantId
      ctx.slug = authorized.slug
      ctx.giro = authorized.giro
      ctx.businessName = authorized.businessName
      snapshot = await buildSiteSnapshot(admin, authorized.siteId)
    }
  }

  // Componer el mensaje con las imágenes adjuntas (sus URLs) para el modelo.
  const imgNote =
    input.images && input.images.length > 0
      ? `\n\n[El dueño adjuntó estas imágenes ya subidas: ${input.images.join(', ')}]`
      : ''
  const userMessage = `${input.message}${imgNote}`

  // Modo efectivo para el agente: si ya hay sitio, usar herramientas de edición.
  const effectiveMode: 'edit' | 'create' = ctx.siteId ? 'edit' : 'create'

  let result
  try {
    result = await runEditorAgent({
      apiKey,
      mode: effectiveMode,
      snapshot,
      history: input.history.map((m) => ({ role: m.role, content: m.content })),
      userMessage,
      ctx,
    })
  } catch (e) {
    return fail(`No pude procesar el mensaje: ${(e as Error).message}`)
  }

  const created = input.mode === 'create' && !input.siteId && !!ctx.siteId

  // Refrescar el sitio estático para que el preview muestre los cambios.
  if (ctx.slug) {
    revalidatePath(`/sites/${ctx.slug}`)
    revalidatePath(`/sites/${ctx.slug}`, 'layout')
  }

  return {
    reply: result.reply,
    changes: result.changes,
    slug: ctx.slug,
    siteId: ctx.siteId,
    created,
  }
}
