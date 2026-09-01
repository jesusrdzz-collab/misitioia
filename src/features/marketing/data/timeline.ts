/**
 * La evolución de cómo la gente encuentra negocios en línea.
 *
 * Es el corazón del mensaje nuevo (feedback 31-ago-2026): mostrar el punto de
 * flexión hacia la búsqueda con IA, de forma ordenada y profesional, sin muro
 * de texto. Se consume en <Timeline /> de la landing.
 */
export interface Era {
  /** Rango de años, ej. '1994–2003'. */
  years: string
  /** Etiqueta corta de la era. */
  tag: string
  /** Título de la era. */
  title: string
  /** 1–2 líneas describiendo cómo buscaba la gente en esa era. */
  desc: string
  emoji: string
  /** Marca la era actual (resalta visualmente). */
  now?: boolean
}

export const ERAS: Era[] = [
  {
    years: '1994–2003',
    tag: 'Web 1.0',
    title: 'Directorios y primeros buscadores',
    desc: 'Yahoo!, listas y blogs. Para encontrar un negocio navegabas categorías a mano, un enlace tras otro.',
    emoji: '🗂️',
  },
  {
    years: '2004–2010',
    tag: 'La era del buscador',
    title: 'Google y Bing lo cambian todo',
    desc: 'La gente empezó a “googlear”. Salir en la primera página era la diferencia entre existir y no existir.',
    emoji: '🔍',
  },
  {
    years: '2011–2022',
    tag: 'Redes sociales',
    title: 'Se busca en Facebook e Instagram',
    desc: 'El descubrimiento se mudó al feed. Un negocio se encontraba (y se juzgaba) por su perfil y sus reseñas.',
    emoji: '📱',
  },
  {
    years: '2023 → hoy',
    tag: 'El punto de flexión',
    title: 'Le preguntas a la IA qué comprar',
    desc: 'Cada vez menos Google, cada vez más “oye ChatGPT, ¿dónde compro esto?”. Pronto la IA comprará por ti — y solo recomienda lo que entiende.',
    emoji: '🤖',
    now: true,
  },
]
