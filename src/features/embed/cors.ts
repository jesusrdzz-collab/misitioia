import { NextResponse } from 'next/server'

/**
 * Los endpoints /api/webchat y /api/audit son consumidos por el widget que corre
 * en dominios AJENOS (el sitio del cliente). Por eso van con CORS abierto.
 * Solo exponen operaciones acotadas por token; no leen cookies ni sesión.
 */
export const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
}

/** Respuesta JSON con headers CORS. */
export function corsJson(body: unknown, status = 200): NextResponse {
  return NextResponse.json(body, { status, headers: CORS_HEADERS })
}

/** Preflight OPTIONS. */
export function corsPreflight(): NextResponse {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}
