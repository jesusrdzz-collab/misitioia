import type { SupabaseClient } from '@supabase/supabase-js'
import { giroNombre } from '@/features/generator/giros'
import { siteHost } from '@/lib/domain'

/**
 * Construye un "snapshot" legible del estado actual del sitio para dárselo al
 * agente como contexto. Incluye los product_id (necesarios para updateProduct).
 */
export async function buildSiteSnapshot(
  admin: SupabaseClient,
  siteId: string,
): Promise<string> {
  const { data: site } = await admin
    .from('sites')
    .select('slug, business_name, giro, status')
    .eq('id', siteId)
    .maybeSingle()

  if (!site) return 'El sitio aún no existe.'

  const { data: content } = await admin
    .from('site_content')
    .select('*')
    .eq('site_id', siteId)
    .maybeSingle()

  const { data: products } = await admin
    .from('site_products')
    .select('id, name, price, currency, is_active, category')
    .eq('site_id', siteId)
    .order('sort_order', { ascending: true })

  const c = (content ?? {}) as Record<string, unknown>
  const services = Array.isArray(c.services) ? (c.services as Array<{ name: string }>) : []
  const hours = (c.working_hours as Record<string, string> | null) ?? null

  const lines: string[] = []
  lines.push(`Negocio: ${site.business_name}`)
  lines.push(`Giro: ${giroNombre(site.giro)}`)
  lines.push(`Subdominio: ${siteHost(site.slug)}`)
  lines.push(`Estado: ${site.status}`)
  lines.push(`Título hero: ${c.hero_title ?? '(vacío)'}`)
  lines.push(`Subtítulo hero: ${c.hero_subtitle ?? '(vacío)'}`)
  lines.push(`Sobre nosotros: ${c.about_text ? String(c.about_text).slice(0, 200) : '(vacío)'}`)
  lines.push(`Colores: primario ${c.primary_color ?? '?'} / acento ${c.accent_color ?? '?'}`)
  lines.push(`Emoji: ${c.emoji ?? '(usa el del giro)'}`)
  lines.push(`Logo: ${c.logo_url ? 'sí' : 'no'} · Portada: ${c.hero_image_url ? 'sí' : 'no'}`)
  lines.push(
    `Contacto: tel ${c.contact_phone ?? '—'} · wa ${c.contact_whatsapp ?? '—'} · correo ${c.contact_email ?? '—'}`,
  )
  lines.push(`Dirección: ${c.contact_address ?? '—'}`)
  lines.push(
    `Servicios (${services.length}): ${services.map((s) => s.name).join(', ') || '(ninguno)'}`,
  )
  lines.push(
    `Horario: ${hours ? Object.entries(hours).map(([d, h]) => `${d} ${h}`).join(' · ') : '(sin definir)'}`,
  )

  const prods = (products ?? []) as Array<{
    id: string
    name: string
    price: number | null
    is_active: boolean
  }>
  if (prods.length > 0) {
    lines.push('Productos:')
    for (const p of prods) {
      lines.push(
        `  - ${p.name}${p.price != null ? ` ($${p.price})` : ''}${p.is_active ? '' : ' [oculto]'} — product_id: ${p.id}`,
      )
    }
  } else {
    lines.push('Productos: (ninguno)')
  }

  return lines.join('\n')
}
