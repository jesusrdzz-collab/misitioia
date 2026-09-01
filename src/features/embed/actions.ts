'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabase } from '@/lib/supabase/server'
import { createEmbedSite } from './store'

/**
 * Server Actions del panel /instalar (Fase 8).
 * La sesión del dueño se lee server-side; el embed_site se crea a su nombre.
 */

async function currentUserEmail(): Promise<string | null> {
  const supabase = await createServerSupabase()
  const { data } = await supabase.auth.getUser()
  return data.user?.email ?? null
}

export async function createEmbedSiteAction(input: {
  name: string
  platform?: string
}): Promise<{ ok: boolean; token?: string; error?: string }> {
  const email = await currentUserEmail()
  if (!email) return { ok: false, error: 'Inicia sesión primero.' }

  const name = (input.name || '').trim()
  if (name.length < 2) return { ok: false, error: 'Escribe el nombre de tu sitio o negocio.' }

  try {
    const site = await createEmbedSite({
      ownerEmail: email,
      name,
      platform: input.platform || null,
    })
    revalidatePath('/instalar')
    return { ok: true, token: site.token }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}
