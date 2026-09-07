'use server'

import { revalidatePath } from 'next/cache'
import { createAdminSupabase, createServerSupabase } from '@/lib/supabase/server'
import { authorizeSiteAccess } from '@/features/editor/authorize'
import { TEMPLATE_REGISTRY } from './registry'
import { regenerateImageWithLock } from '@/features/generator/regen-lock'

/**
 * Server Actions del sistema de plantillas (Sprint 6-sep-2026).
 * Cada acción autoriza al dueño antes de escribir con service_role.
 */

async function currentUserEmail(): Promise<string | null> {
  const supabase = await createServerSupabase()
  const { data } = await supabase.auth.getUser()
  return data.user?.email ?? null
}

export async function applyTemplateAction(
  siteId: string,
  templateSlug: string,
): Promise<{ ok: boolean; error?: string }> {
  const email = await currentUserEmail()
  if (!email) return { ok: false, error: 'Inicia sesión primero.' }
  if (!TEMPLATE_REGISTRY[templateSlug]) return { ok: false, error: 'Esa plantilla no existe.' }

  const authorized = await authorizeSiteAccess(siteId, email)
  if (!authorized) return { ok: false, error: 'No tienes acceso a este sitio.' }

  const admin = await createAdminSupabase()
  const { error } = await admin
    .from('sites')
    .update({ template: templateSlug, updated_at: new Date().toISOString() })
    .eq('id', authorized.siteId)

  if (error) return { ok: false, error: error.message }

  revalidatePath(`/sites/${authorized.slug}`)
  revalidatePath(`/sites/${authorized.slug}`, 'layout')
  revalidatePath('/editar/apariencia')
  return { ok: true }
}

export async function regenerateImageAction(
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
  if (!email) return { ok: false, error: 'Inicia sesión primero.' }

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
  revalidatePath('/editar/apariencia')
  return {
    ok: true,
    url: result.url,
    source: result.source,
    regensRemaining: result.regensRemaining,
  }
}
