import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'
import { resolveUniqueSlug } from '@/features/generator/slug'
import { templateForGiro } from '@/features/generator/templates'
import { GIRO_NOMBRE } from '@/features/generator/giros'
import { siteHost } from '@/lib/domain'

/**
 * Herramientas del agente editor (Fase 4).
 *
 * Cada herramienta:
 *  - declara su firma para Gemini (functionDeclarations)
 *  - valida sus argumentos con Zod
 *  - aplica el cambio en Supabase usando el cliente admin (service_role),
 *    SIEMPRE acotada al siteId ya autorizado en la capa de acción.
 *
 * REGLA (heredada del generador): el asistente REDACTA/EDITA con lo que el
 * dueño dice; NO inventa datos. Si falta un dato, el prompt le pide preguntar.
 */

export interface ExecCtx {
  admin: SupabaseClient
  ownerEmail: string
  siteId: string | null
  tenantId: string | null
  slug: string | null
  giro: string | null
  /** Nombre del negocio (para slug en creación). */
  businessName: string | null
}

const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

// ————————————————————————————————————————————————————————————————
// Esquemas Zod
// ————————————————————————————————————————————————————————————————

const businessInfoSchema = z.object({
  business_name: z.string().min(1).max(120).optional(),
  hero_title: z.string().max(160).optional(),
  hero_subtitle: z.string().max(240).optional(),
  about_text: z.string().max(1500).optional(),
  contact_phone: z.string().max(40).optional(),
  contact_whatsapp: z.string().max(40).optional(),
  contact_email: z.string().max(160).optional(),
  contact_address: z.string().max(300).optional(),
  ciudad: z.string().max(120).optional(),
  zona: z.string().max(120).optional(),
  estado: z.string().max(120).optional(),
  social_facebook: z.string().max(300).optional(),
  social_instagram: z.string().max(300).optional(),
})

const brandingSchema = z.object({
  primary_color: z.string().regex(HEX).optional(),
  accent_color: z.string().regex(HEX).optional(),
  emoji: z.string().max(8).optional(),
})

const hoursSchema = z.object({
  hours: z
    .array(z.object({ day: z.string().min(1).max(20), hours: z.string().min(1).max(60) }))
    .min(1)
    .max(7),
})

const servicesSchema = z.object({
  services: z
    .array(
      z.object({
        name: z.string().min(1).max(80),
        description: z.string().max(240).optional(),
        icon: z.string().max(8).optional(),
      }),
    )
    .max(12),
})

const addProductSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(400).optional(),
  price: z.number().nonnegative().optional(),
  currency: z.string().max(8).optional(),
  image_url: z.string().url().max(600).optional(),
  category: z.string().max(80).optional(),
})

const updateProductSchema = z.object({
  product_id: z.string().uuid(),
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(400).optional(),
  price: z.number().nonnegative().optional(),
  currency: z.string().max(8).optional(),
  image_url: z.string().url().max(600).optional(),
  category: z.string().max(80).optional(),
  is_active: z.boolean().optional(),
})

const imageSchema = z.object({ image_url: z.string().url().max(600) })

const createSiteSchema = z.object({
  business_name: z.string().min(2).max(120),
  giro: z.string().max(60).optional(),
  ciudad: z.string().max(120).optional(),
  estado: z.string().max(120).optional(),
  contact_phone: z.string().max(40).optional(),
  contact_whatsapp: z.string().max(40).optional(),
  hero_title: z.string().max(160).optional(),
  hero_subtitle: z.string().max(240).optional(),
  about_text: z.string().max(1500).optional(),
})

// ————————————————————————————————————————————————————————————————
// Declaraciones para Gemini (function calling)
// ————————————————————————————————————————————————————————————————

const GIRO_SLUGS = Object.keys(GIRO_NOMBRE)

export const EDIT_TOOL_DECLARATIONS = [
  {
    name: 'updateBusinessInfo',
    description:
      'Actualiza datos y textos del negocio: nombre, título/subtítulo del hero, texto "sobre nosotros", teléfono, WhatsApp, correo, dirección, ciudad, zona, estado, y redes sociales. Solo incluye los campos que el dueño pidió cambiar.',
    parameters: {
      type: 'OBJECT',
      properties: {
        business_name: { type: 'STRING', description: 'Nombre del negocio' },
        hero_title: { type: 'STRING', description: 'Título principal (4-8 palabras)' },
        hero_subtitle: { type: 'STRING', description: 'Subtítulo (1 frase)' },
        about_text: { type: 'STRING', description: 'Texto "sobre nosotros"' },
        contact_phone: { type: 'STRING' },
        contact_whatsapp: { type: 'STRING' },
        contact_email: { type: 'STRING' },
        contact_address: { type: 'STRING' },
        ciudad: { type: 'STRING' },
        zona: { type: 'STRING' },
        estado: { type: 'STRING' },
        social_facebook: { type: 'STRING', description: 'URL de Facebook' },
        social_instagram: { type: 'STRING', description: 'URL de Instagram' },
      },
    },
  },
  {
    name: 'updateBranding',
    description:
      'Cambia los colores de marca (primario y acento, en hex como #db2777) y/o el emoji del negocio.',
    parameters: {
      type: 'OBJECT',
      properties: {
        primary_color: { type: 'STRING', description: 'Color hex, ej #15803d' },
        accent_color: { type: 'STRING', description: 'Color hex, ej #166534' },
        emoji: { type: 'STRING', description: 'Un emoji, ej 🐾' },
      },
    },
  },
  {
    name: 'updateHours',
    description:
      'Reemplaza el horario de atención completo. Pasa la lista de días con su horario. Usa "Cerrado" para días sin servicio.',
    parameters: {
      type: 'OBJECT',
      properties: {
        hours: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              day: { type: 'STRING', description: 'ej: Lunes' },
              hours: { type: 'STRING', description: 'ej: 9:00 - 18:00 o Cerrado' },
            },
            required: ['day', 'hours'],
          },
        },
      },
      required: ['hours'],
    },
  },
  {
    name: 'setServices',
    description:
      'Reemplaza la lista completa de servicios del negocio. Cada servicio tiene nombre, descripción corta opcional y un emoji opcional.',
    parameters: {
      type: 'OBJECT',
      properties: {
        services: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              name: { type: 'STRING' },
              description: { type: 'STRING' },
              icon: { type: 'STRING', description: 'un emoji' },
            },
            required: ['name'],
          },
        },
      },
      required: ['services'],
    },
  },
  {
    name: 'addProduct',
    description: 'Agrega un producto al catálogo del negocio.',
    parameters: {
      type: 'OBJECT',
      properties: {
        name: { type: 'STRING' },
        description: { type: 'STRING' },
        price: { type: 'NUMBER', description: 'Precio en número, sin símbolo' },
        currency: { type: 'STRING', description: 'Por defecto MXN' },
        image_url: { type: 'STRING', description: 'URL de imagen ya subida' },
        category: { type: 'STRING' },
      },
      required: ['name'],
    },
  },
  {
    name: 'updateProduct',
    description:
      'Actualiza o desactiva un producto existente. Requiere el product_id (lo tienes en el contexto del sitio). Para "quitar" un producto, pon is_active en false.',
    parameters: {
      type: 'OBJECT',
      properties: {
        product_id: { type: 'STRING' },
        name: { type: 'STRING' },
        description: { type: 'STRING' },
        price: { type: 'NUMBER' },
        currency: { type: 'STRING' },
        image_url: { type: 'STRING' },
        category: { type: 'STRING' },
        is_active: { type: 'BOOLEAN' },
      },
      required: ['product_id'],
    },
  },
  {
    name: 'setLogo',
    description:
      'Define el logo del negocio con la URL de una imagen que el dueño ya subió (aparece en el mensaje como imagen adjunta).',
    parameters: {
      type: 'OBJECT',
      properties: { image_url: { type: 'STRING' } },
      required: ['image_url'],
    },
  },
  {
    name: 'setHeroImage',
    description:
      'Define la imagen de portada (hero) del sitio con la URL de una imagen que el dueño ya subió.',
    parameters: {
      type: 'OBJECT',
      properties: { image_url: { type: 'STRING' } },
      required: ['image_url'],
    },
  },
] as const

export const CREATE_SITE_DECLARATION = {
  name: 'createSite',
  description:
    'Crea el sitio web del negocio desde cero. Llama esto UNA sola vez, cuando ya tengas al menos el nombre del negocio y su giro. Después podrás usar las otras herramientas para refinarlo.',
  parameters: {
    type: 'OBJECT',
    properties: {
      business_name: { type: 'STRING', description: 'Nombre del negocio' },
      giro: {
        type: 'STRING',
        description: `Giro del negocio. Usa uno de estos slugs si aplica: ${GIRO_SLUGS.join(', ')}`,
      },
      ciudad: { type: 'STRING' },
      estado: { type: 'STRING' },
      contact_phone: { type: 'STRING' },
      contact_whatsapp: { type: 'STRING' },
      hero_title: { type: 'STRING' },
      hero_subtitle: { type: 'STRING' },
      about_text: { type: 'STRING' },
    },
    required: ['business_name'],
  },
} as const

// ————————————————————————————————————————————————————————————————
// Ejecución
// ————————————————————————————————————————————————————————————————

export interface ToolOutcome {
  ok: boolean
  summary: string
}

async function updateContent(
  ctx: ExecCtx,
  patch: Record<string, unknown>,
): Promise<void> {
  const { error } = await ctx.admin
    .from('site_content')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('site_id', ctx.siteId)
  if (error) throw new Error(error.message)
}

async function touchSite(ctx: ExecCtx, patch: Record<string, unknown> = {}): Promise<void> {
  await ctx.admin
    .from('sites')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', ctx.siteId)
}

/**
 * Ejecuta una llamada a herramienta. Devuelve un resumen legible en español.
 * Muta ctx (siteId/slug) si se crea un sitio.
 */
export async function executeTool(
  ctx: ExecCtx,
  name: string,
  args: unknown,
): Promise<ToolOutcome> {
  // createSite es el único válido sin siteId
  if (name === 'createSite') {
    const a = createSiteSchema.parse(args)
    return createSite(ctx, a)
  }

  if (!ctx.siteId) {
    return { ok: false, summary: 'Primero hay que crear el sitio antes de editarlo.' }
  }

  switch (name) {
    case 'updateBusinessInfo': {
      const a = businessInfoSchema.parse(args)
      const { business_name, ...contentFields } = a
      const patch = Object.fromEntries(
        Object.entries(contentFields).filter(([, v]) => v !== undefined),
      )
      if (Object.keys(patch).length > 0) await updateContent(ctx, patch)
      if (business_name) await touchSite(ctx, { business_name })
      else await touchSite(ctx)
      const campos = [business_name ? 'nombre' : null, ...Object.keys(patch)]
        .filter(Boolean)
        .join(', ')
      return { ok: true, summary: `Datos actualizados: ${campos}.` }
    }

    case 'updateBranding': {
      const a = brandingSchema.parse(args)
      const patch = Object.fromEntries(Object.entries(a).filter(([, v]) => v !== undefined))
      if (Object.keys(patch).length === 0) return { ok: false, summary: 'No indicaste qué cambiar.' }
      await updateContent(ctx, patch)
      await touchSite(ctx)
      return { ok: true, summary: `Marca actualizada: ${Object.keys(patch).join(', ')}.` }
    }

    case 'updateHours': {
      const a = hoursSchema.parse(args)
      const map: Record<string, string> = {}
      for (const { day, hours } of a.hours) map[day] = hours
      await updateContent(ctx, { working_hours: map })
      await touchSite(ctx)
      return { ok: true, summary: `Horario actualizado (${a.hours.length} días).` }
    }

    case 'setServices': {
      const a = servicesSchema.parse(args)
      const services = a.services.map((s) => ({
        name: s.name,
        description: s.description ?? null,
        icon: s.icon ?? null,
      }))
      await updateContent(ctx, { services })
      await touchSite(ctx)
      return { ok: true, summary: `Servicios actualizados (${services.length}).` }
    }

    case 'addProduct': {
      const a = addProductSchema.parse(args)
      const { error } = await ctx.admin.from('site_products').insert({
        site_id: ctx.siteId,
        tenant_id: ctx.tenantId,
        name: a.name,
        description: a.description ?? null,
        price: a.price ?? null,
        currency: a.currency ?? 'MXN',
        image_url: a.image_url ?? null,
        category: a.category ?? null,
        is_active: true,
      })
      if (error) throw new Error(error.message)
      await touchSite(ctx)
      return { ok: true, summary: `Producto agregado: ${a.name}.` }
    }

    case 'updateProduct': {
      const a = updateProductSchema.parse(args)
      const { product_id, ...fields } = a
      const patch = Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined))
      const { error } = await ctx.admin
        .from('site_products')
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq('id', product_id)
        .eq('site_id', ctx.siteId)
      if (error) throw new Error(error.message)
      await touchSite(ctx)
      const accion = fields.is_active === false ? 'ocultado' : 'actualizado'
      return { ok: true, summary: `Producto ${accion}.` }
    }

    case 'setLogo': {
      const a = imageSchema.parse(args)
      await updateContent(ctx, { logo_url: a.image_url })
      await touchSite(ctx)
      return { ok: true, summary: 'Logo actualizado.' }
    }

    case 'setHeroImage': {
      const a = imageSchema.parse(args)
      await updateContent(ctx, { hero_image_url: a.image_url })
      await touchSite(ctx)
      return { ok: true, summary: 'Imagen de portada actualizada.' }
    }

    default:
      return { ok: false, summary: `Herramienta desconocida: ${name}.` }
  }
}

async function createSite(
  ctx: ExecCtx,
  a: z.infer<typeof createSiteSchema>,
): Promise<ToolOutcome> {
  if (ctx.siteId) {
    return { ok: false, summary: 'El sitio ya existe; usa las herramientas de edición.' }
  }

  const giro = a.giro && GIRO_NOMBRE[a.giro] ? a.giro : null
  const template = templateForGiro(giro)

  const slug = await resolveUniqueSlug(a.business_name, {
    slugExists: async (s) => {
      const { data } = await ctx.admin.from('sites').select('id').eq('slug', s).maybeSingle()
      return !!data
    },
    isReserved: async (s) => {
      const { data } = await ctx.admin
        .from('reserved_subdomains')
        .select('slug')
        .eq('slug', s)
        .maybeSingle()
      return !!data
    },
  })

  // 1) tenant (dueño = usuario autenticado) → estado reclamado (es autoservicio)
  const { data: tenant, error: tErr } = await ctx.admin
    .from('tenants')
    .insert({
      owner_email: ctx.ownerEmail,
      owner_phone: a.contact_whatsapp || a.contact_phone || null,
      plan: 'gratis',
    })
    .select('id')
    .single()
  if (tErr || !tenant) throw new Error(`Error creando tenant: ${tErr?.message}`)

  // 2) site
  const { data: site, error: sErr } = await ctx.admin
    .from('sites')
    .insert({
      tenant_id: tenant.id,
      slug,
      business_name: a.business_name,
      giro,
      template: template.id,
      status: 'reclamado',
      source: 'autoservicio',
      claimed_at: new Date().toISOString(),
    })
    .select('id')
    .single()
  if (sErr || !site) throw new Error(`Error creando site: ${sErr?.message}`)

  // 3) site_content base
  const { error: cErr } = await ctx.admin.from('site_content').insert({
    site_id: site.id,
    tenant_id: tenant.id,
    hero_title: a.hero_title || a.business_name,
    hero_subtitle: a.hero_subtitle || null,
    about_text: a.about_text || null,
    services: [],
    highlights: [],
    contact_phone: a.contact_phone || null,
    contact_whatsapp: a.contact_whatsapp || null,
    ciudad: a.ciudad || null,
    estado: a.estado || null,
    primary_color: template.primaryColor,
    accent_color: template.accentColor,
    generated_at: new Date().toISOString(),
  })
  if (cErr) throw new Error(`Error creando site_content: ${cErr.message}`)

  // Actualizar ctx para que las herramientas siguientes editen este sitio
  ctx.siteId = site.id
  ctx.tenantId = tenant.id
  ctx.slug = slug
  ctx.giro = giro
  ctx.businessName = a.business_name

  return { ok: true, summary: `Sitio creado: ${a.business_name} (${siteHost(slug)}).` }
}
