import { createClient } from '@supabase/supabase-js'

/**
 * Cliente de SOLO LECTURA hacia el Supabase de TerraLeads.
 * Fuente de los leads que alimentan el generador (Fase 2).
 *
 * Requiere en el entorno:
 *   TERRALEADS_SUPABASE_URL
 *   TERRALEADS_SUPABASE_SERVICE_KEY  (service_role; NUNCA exponer al frontend)
 *
 * Nota: MiSitio IA solo LEE de TerraLeads. No escribe.
 */
export function createTerraLeadsClient() {
  const url = process.env.TERRALEADS_SUPABASE_URL
  const key = process.env.TERRALEADS_SUPABASE_SERVICE_KEY

  if (!url || !key) {
    throw new Error(
      'Faltan TERRALEADS_SUPABASE_URL o TERRALEADS_SUPABASE_SERVICE_KEY en el entorno',
    )
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
