/**
 * Prueba real de Fase 2: corre el generador (código real) sobre leads reales
 * de TerraLeads y emite las filas listas para insertar.
 *
 * Uso:
 *   GEMINI_API_KEY=... npx tsx scripts/generate-test-site.ts
 *
 * Nota: la lectura de TerraLeads y la escritura en MiSitio en producción usan
 * service_role (env). Aquí los leads reales se pasan embebidos (obtenidos de
 * TerraLeads) y la salida JSON se persiste vía el MCP de Supabase, porque las
 * service_role keys aún no están provisionadas en el entorno local.
 */
import { generateCopy } from '../src/features/generator/gemini'
import { templateForGiro } from '../src/features/generator/templates'
import { giroNombre } from '../src/features/generator/giros'
import { normalizeWorkingHours } from '../src/features/generator/working-hours'
import { slugify } from '../src/features/generator/slug'
import type { LeadForGeneration } from '../src/lib/types/site'

const LEADS: LeadForGeneration[] = [
  {
    id: '3665c3cd-3ade-49b5-90af-bc495289443f',
    business_name: 'Casa de Bienestar Animal de San Nicolás',
    giro: 'veterinaria',
    address:
      'Av. Lic. Adolfo López Mateos Km 2.5, Col. Lagrange, 66490 San Nicolás de los Garza, N.L.',
    phone_primary: '8181581218',
    phone_whatsapp: null,
    email_primary: null,
    rating: 4.7,
    reviews_count: 899,
    categoria_google: null,
    social_facebook: null,
    social_instagram: null,
    ciudad: 'Monterrey',
    zona: 'San Nicolás de los Garza',
    estado: 'Nuevo León',
    website_url: null,
    raw_data: {
      outscraper: {
        working_hours: {
          lunes: ['8a.m.-4p.m.'],
          martes: ['8a.m.-4p.m.'],
          'miércoles': ['8a.m.-4p.m.'],
          jueves: ['8a.m.-4p.m.'],
          viernes: ['8a.m.-4p.m.'],
          'sábado': ['Cerrado'],
          domingo: ['Cerrado'],
        },
        subtypes: 'Veterinario',
      },
    },
  },
  {
    id: '1096e4ab-7693-4a3a-aae5-c334ccca1126',
    business_name: 'Refaccionaria SAM.',
    giro: 'refaccionaria',
    address:
      'Av. Diego Díaz de Berlanga 1311, Las Puentes 1 5o Sector, 66460 San Nicolás de los Garza, N.L.',
    phone_primary: '8117740346',
    phone_whatsapp: null,
    email_primary: null,
    rating: 4.5,
    reviews_count: 693,
    categoria_google: 'Tienda de repuestos para automóviles',
    social_facebook: null,
    social_instagram: null,
    ciudad: 'Monterrey',
    zona: 'San Nicolás de los Garza',
    estado: 'Nuevo León',
    website_url: null,
    raw_data: {
      outscraper: {
        working_hours: {
          lunes: ['8:30a.m.-7:30p.m.'],
          martes: ['8:30a.m.-7:30p.m.'],
          'miércoles': ['8:30a.m.-7:30p.m.'],
          jueves: ['8:30a.m.-7:30p.m.'],
          viernes: ['8:30a.m.-7:30p.m.'],
          'sábado': ['8:30a.m.-7:30p.m.'],
          domingo: ['9:30a.m.-3p.m.'],
        },
        category: 'Tienda de repuestos para automóviles',
      },
    },
  },
]

async function main() {
  const apiKey = process.env.GEMINI_API_KEY ?? ''
  const out: unknown[] = []

  for (const lead of LEADS) {
    const nombre = giroNombre(lead.giro)
    const template = templateForGiro(lead.giro)
    const { copy, model } = await generateCopy(lead, nombre, apiKey)
    const workingHours = normalizeWorkingHours(lead.raw_data?.outscraper?.working_hours)
    const slug = slugify(lead.business_name)

    out.push({
      lead_id: lead.id,
      slug,
      business_name: lead.business_name,
      giro: lead.giro,
      template: template.id,
      primary_color: template.primaryColor,
      accent_color: template.accentColor,
      ai_model: model,
      working_hours: workingHours,
      contact_phone: lead.phone_primary,
      contact_address: lead.address,
      rating: lead.rating,
      reviews_count: lead.reviews_count,
      ciudad: lead.ciudad,
      zona: lead.zona,
      estado: lead.estado,
      copy,
    })
  }

  console.log(JSON.stringify(out, null, 2))
}

main().catch((e) => {
  console.error('ERROR:', e)
  process.exit(1)
})
