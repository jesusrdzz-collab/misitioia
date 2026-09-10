/**
 * API Tokens — utilidades de generación y hasheo.
 *
 * Formato del plaintext: `sk_mi_` + 32 chars base62 ([0-9A-Za-z]).
 * El plaintext SÓLO se retorna al crear el token; en la BD guardamos su
 * SHA-256 hex (32 bytes → 64 chars). El prefix (primeros 12 chars, incluye
 * `sk_mi_` + 6 alfanuméricos) se guarda en claro para mostrarlo en la UI.
 *
 * Usa Web Crypto (`crypto.getRandomValues` + `crypto.subtle.digest`) para
 * funcionar tanto en Node (routes /api) como en Edge (middleware).
 */

export const TOKEN_PREFIX = 'sk_mi_'
export const TOKEN_BODY_LENGTH = 32

const BASE62_ALPHABET =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

/** Longitud total: `sk_mi_` (6) + 32 = 38. */
export const TOKEN_TOTAL_LENGTH = TOKEN_PREFIX.length + TOKEN_BODY_LENGTH

/** Chars del prefix visible: `sk_mi_` + 6 = 12 (para display en la UI). */
export const TOKEN_DISPLAY_PREFIX_LENGTH = TOKEN_PREFIX.length + 6

export interface GeneratedToken {
  /** Token completo en texto claro — SÓLO se muestra una vez. */
  plaintext: string
  /** Prefix visible (`sk_mi_XXXXXX`) para almacenar y mostrar en la UI. */
  prefix: string
  /** Hash SHA-256 hex del plaintext — es lo único que se guarda. */
  hash: string
}

/**
 * SHA-256 hex del plaintext usando Web Crypto (compatible con Edge y Node).
 */
export async function hashApiToken(plaintext: string): Promise<string> {
  const enc = new TextEncoder().encode(plaintext)
  const buf = await crypto.subtle.digest('SHA-256', enc)
  const bytes = new Uint8Array(buf)
  let hex = ''
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0')
  }
  return hex
}

/**
 * Genera 32 chars base62 aleatorios de forma criptográficamente segura.
 * Aplica rejection sampling uniforme: descartamos bytes > 247 (62·4=248) para
 * evitar el sesgo del módulo.
 */
function generateTokenBody(): string {
  let body = ''
  while (body.length < TOKEN_BODY_LENGTH) {
    // Pedimos el doble de lo que falta para reducir la probabilidad de
    // agotar el buffer por rejection sampling.
    const need = TOKEN_BODY_LENGTH - body.length
    const bytes = new Uint8Array(need * 2)
    crypto.getRandomValues(bytes)
    for (let i = 0; i < bytes.length && body.length < TOKEN_BODY_LENGTH; i++) {
      const b = bytes[i]
      if (b < 248) body += BASE62_ALPHABET[b % 62]
    }
  }
  return body
}

/** Genera un token nuevo aleatorio + su hash. */
export async function generateApiToken(): Promise<GeneratedToken> {
  const plaintext = TOKEN_PREFIX + generateTokenBody()
  const prefix = plaintext.slice(0, TOKEN_DISPLAY_PREFIX_LENGTH)
  const hash = await hashApiToken(plaintext)
  return { plaintext, prefix, hash }
}

/**
 * Extrae el token de un header `Authorization: Bearer <token>`.
 * Devuelve null si el header no cumple el formato o el token no
 * empieza con `sk_mi_`.
 */
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader) return null
  const match = authHeader.match(/^Bearer\s+(\S+)$/i)
  if (!match) return null
  const token = match[1]
  if (!token.startsWith(TOKEN_PREFIX)) return null
  // Longitud exacta esperada — bloquea variantes malformadas antes del DB.
  if (token.length !== TOKEN_TOTAL_LENGTH) return null
  return token
}

export type ApiTokenScope = 'read' | 'write' | 'admin'

/** Scopes válidos que la UI y el POST aceptan. */
export const VALID_SCOPES: readonly ApiTokenScope[] = ['read', 'write', 'admin']

export function isValidScope(x: string): x is ApiTokenScope {
  return (VALID_SCOPES as readonly string[]).includes(x)
}
