/**
 * Tipos del editor por chat (Fase 4).
 */

export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  role: ChatRole
  content: string
  /** URLs de imágenes que el usuario adjuntó a este mensaje (ya subidas a Storage). */
  images?: string[]
}

/** Un cambio aplicado por una herramienta, para mostrarlo en el hilo. */
export interface AppliedChange {
  tool: string
  summary: string
}

/** Resultado de un turno del agente editor. */
export interface EditorTurnResult {
  /** Texto del asistente para mostrar en el chat. */
  reply: string
  /** Cambios aplicados en este turno (para feedback visual + refrescar preview). */
  changes: AppliedChange[]
  /** slug del sitio afectado (para recargar el preview); puede cambiar en modo creación. */
  slug: string | null
  /** siteId resultante (en modo creación, el recién creado). */
  siteId: string | null
  /** true si se creó un sitio nuevo en este turno. */
  created: boolean
  /** Mensaje de error legible, si el turno falló. */
  error?: string
}

export type EditorMode = 'edit' | 'create'
