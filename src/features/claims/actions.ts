'use server'

/**
 * Reclamación de negocio ("es mi negocio, quiero tomar control").
 *
 * Sustituye al botón público "darla de baja" (que cualquiera podía disparar
 * sin verificación). Aquí el reclamante deja sus datos, sube evidencia
 * (factura, INE, comprobante de domicilio, poder) y un humano lo revisa
 * ANTES de que el sitio cambie de mano o se dé de baja.
 *
 * - Storage: bucket privado `claim-evidence`, ruta `{slug}/{uuid}-{filename}`
 * - BD: fila en `public.site_claims` con status='pendiente'
 * - Notificación: si `RESEND_API_KEY` está seteado, se envía correo a
 *   `NOTIFY_ADMIN_EMAIL` (default jesus2rdzz@gmail.com). Si no, sólo se loguea
 *   en Vercel — la fila de BD es la evidencia durable.
 */
import { z } from 'zod'
import { headers } from 'next/headers'
import { createAdminSupabase } from '@/lib/supabase/server'
import { BRAND, ROOT_DOMAIN } from '@/features/marketing/brand'

const RELATION_VALUES = ['dueno', 'gerente', 'apoderado', 'empleado', 'otro'] as const

const ClaimInputSchema = z.object({
  slug: z.string().min(1).max(120),
  claimant_name: z.string().trim().min(2, 'Escribe tu nombre completo').max(120),
  claimant_email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Correo inválido'),
  claimant_phone: z
    .string()
    .trim()
    .max(40)
    .optional()
    .transform((v) => (v && v.length ? v : undefined)),
  relation: z.enum(RELATION_VALUES),
  message: z
    .string()
    .trim()
    .min(20, 'Cuéntanos por qué es tu negocio (mínimo 20 caracteres)')
    .max(4000, 'Muy largo; sé breve'),
})

export interface ClaimResult {
  ok: boolean
  error?: string
  claimId?: string
}

const NOTIFY_EMAIL =
  process.env.NOTIFY_ADMIN_EMAIL || 'jesus2rdzz@gmail.com'
const RESEND_FROM =
  process.env.RESEND_FROM_EMAIL || `MiSitio IA <no-reply@${ROOT_DOMAIN}>`

async function notifyAdminViaResend(subject: string, textBody: string) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return { sent: false, reason: 'no_api_key' as const }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [NOTIFY_EMAIL],
        subject,
        text: textBody,
      }),
    })
    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      return { sent: false, reason: `resend_${res.status}`, detail }
    }
    return { sent: true }
  } catch (err) {
    return {
      sent: false,
      reason: 'resend_exception',
      detail: err instanceof Error ? err.message : String(err),
    }
  }
}

/**
 * Server action llamada desde el <form> de /reclamar/[slug]/page.tsx.
 * Recibe FormData (soporta el archivo de evidencia). Devuelve un objeto
 * serializable para que el componente muestre confirmación o error.
 */
export async function submitSiteClaim(formData: FormData): Promise<ClaimResult> {
  const rawFile = formData.get('evidence')
  const file =
    rawFile instanceof File && rawFile.size > 0 ? rawFile : null

  const parsed = ClaimInputSchema.safeParse({
    slug: formData.get('slug'),
    claimant_name: formData.get('claimant_name'),
    claimant_email: formData.get('claimant_email'),
    claimant_phone: formData.get('claimant_phone') || undefined,
    relation: formData.get('relation'),
    message: formData.get('message'),
  })

  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return { ok: false, error: first?.message || 'Datos inválidos' }
  }

  const input = parsed.data

  // Validación de archivo si vino uno.
  if (file) {
    const ALLOWED = new Set([
      'image/png',
      'image/jpeg',
      'image/webp',
      'image/heic',
      'application/pdf',
    ])
    if (!ALLOWED.has(file.type)) {
      return {
        ok: false,
        error: 'Formato de archivo no permitido. Sube PNG, JPG, WEBP, HEIC o PDF.',
      }
    }
    if (file.size > 10 * 1024 * 1024) {
      return { ok: false, error: 'El archivo excede 10 MB.' }
    }
  }

  const supabase = await createAdminSupabase()

  // Verificar que el sitio exista y esté publicado.
  const { data: site } = await supabase
    .from('sites')
    .select('id, slug, business_name, status')
    .eq('slug', input.slug)
    .maybeSingle()

  if (!site || (site as { status: string }).status === 'dado_de_baja') {
    return { ok: false, error: 'Este sitio no existe o ya fue dado de baja.' }
  }

  // Subir evidencia si viene.
  let evidenceUrl: string | null = null
  if (file) {
    const safeName = file.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9._-]+/g, '-')
      .slice(0, 80)
    const objectPath = `${input.slug}/${crypto.randomUUID()}-${safeName}`

    const arrayBuffer = await file.arrayBuffer()
    const { error: upErr } = await supabase.storage
      .from('claim-evidence')
      .upload(objectPath, new Uint8Array(arrayBuffer), {
        contentType: file.type,
        upsert: false,
      })

    if (upErr) {
      console.error('[claims] evidence upload failed', upErr)
      return {
        ok: false,
        error:
          'No pudimos guardar tu evidencia. Puedes intentar de nuevo o continuar sin archivo.',
      }
    }
    evidenceUrl = objectPath
  }

  // Headers para trazabilidad (IP y UA — datos técnicos de LFPDPPP).
  const hdrs = await headers()
  const forwardedFor = hdrs.get('x-forwarded-for') || ''
  const ip = forwardedFor.split(',')[0]?.trim() || null
  const userAgent = hdrs.get('user-agent') || null

  const { data: claim, error: insErr } = await supabase
    .from('site_claims')
    .insert({
      site_id: (site as { id: string }).id,
      slug: input.slug,
      claimant_name: input.claimant_name,
      claimant_email: input.claimant_email,
      claimant_phone: input.claimant_phone ?? null,
      relation: input.relation,
      evidence_url: evidenceUrl,
      message: input.message,
      ip_address: ip,
      user_agent: userAgent,
    })
    .select('id')
    .single()

  if (insErr) {
    console.error('[claims] insert failed', insErr)
    return { ok: false, error: 'Ocurrió un error registrando tu solicitud.' }
  }

  const claimId = (claim as { id: string }).id
  const businessName = (site as { business_name: string }).business_name

  const subject = `[MiSitio IA] Nueva reclamación: ${businessName} (${input.slug})`
  const body = [
    `Nueva reclamación registrada en ${BRAND.name}.`,
    ``,
    `Sitio: ${businessName}`,
    `Slug: ${input.slug}`,
    `URL: https://${input.slug}.${ROOT_DOMAIN}`,
    ``,
    `--- Reclamante ---`,
    `Nombre: ${input.claimant_name}`,
    `Correo: ${input.claimant_email}`,
    `Teléfono: ${input.claimant_phone ?? '(no proporcionado)'}`,
    `Relación: ${input.relation}`,
    ``,
    `--- Mensaje ---`,
    input.message,
    ``,
    `--- Evidencia ---`,
    evidenceUrl
      ? `Archivo: bucket claim-evidence → ${evidenceUrl} (privado; genera URL firmada desde el admin)`
      : `Sin archivo adjunto (el reclamante no subió evidencia).`,
    ``,
    `--- Meta ---`,
    `IP: ${ip ?? 'desconocida'}`,
    `User-Agent: ${userAgent ?? 'desconocido'}`,
    `Claim ID: ${claimId}`,
    ``,
    `Revísala en Supabase → site_claims (status='pendiente').`,
  ].join('\n')

  const notif = await notifyAdminViaResend(subject, body)
  if (!notif.sent) {
    // La fila queda en BD como fuente de verdad; el correo es best-effort.
    console.warn(
      '[claims] admin notification not sent (fila queda en BD como respaldo):',
      notif,
    )
  }

  return { ok: true, claimId }
}
