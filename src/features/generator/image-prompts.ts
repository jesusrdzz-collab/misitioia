/**
 * Prompts de imágenes IA por giro (Sprint 6-sep-2026 + ampliación 7-sep-2026).
 * Cada giro tiene 3 escenas: hero (16:9), about (4:3), catalog (1:1).
 * Los prompts van en inglés porque Gemini image genera mejor con inglés.
 * El texto va con NOTXT desde images.ts.
 *
 * Fix P0 pre-campaña Meta (7-sep-2026):
 *   - Ampliamos catálogo a giros profesionales (seguros, finanzas, contabilidad,
 *     legal, marketing, fotografía, eventos, escuela, restaurante, cafetería,
 *     minisúper, farmacia, construcción). Antes caían al genérico terracota.
 *   - Fallback inteligente cuando `giro='otros'`: usa `giroLibre + descripcion`
 *     como contexto y NO cae al genérico storefront (que producía cerámica/
 *     artesanía en cliente de seguros).
 */

export interface PromptTriple {
  hero: string
  about: string
  catalog: string
}

const BASE =
  'professional documentary photography, warm natural lighting, cinematic, ' +
  '4k detail, shallow depth of field, magazine editorial quality, ' +
  'authentic small business feel, latin american setting.'

/**
 * BASE profesional (oficinas, servicios). Sustituye el latin american storefront
 * feel por un tono office / desk cuando el giro es de servicios profesionales.
 */
const BASE_PRO =
  'professional editorial photography, warm neutral palette (beige/cream/soft blue), ' +
  'clean modern office feel, natural window light, magazine quality, ' +
  '4k detail, shallow depth of field, latin american mexican professional context.'

const PROMPTS: Record<string, PromptTriple> = {
  salud_animal: {
    hero: `wide shot of a friendly small veterinary clinic in mexico, a happy dog being examined by a caring vet in scrubs, bright and clean interior, soft morning light through window, warm green and cream tones. ${BASE}`,
    about: `close medium shot of vet hands gently holding a small cat, warm and reassuring, blurred clinical background. ${BASE}`,
    catalog: `flat lay of pet care essentials: leash, brush, dog food bowl and toy, on soft cream background. ${BASE}`,
  },
  automotriz: {
    hero: `wide interior shot of a modern mexican mechanic workshop, mechanic with cap examining an engine bay, dramatic ambient light, orange sparks from welding in background. ${BASE}`,
    about: `medium shot of experienced mechanic hands using a wrench on a car engine, focus on tools and hands. ${BASE}`,
    catalog: `three auto parts arranged on a dark workbench: brake pad, oil filter, spark plug, clean product shot from above. ${BASE}`,
  },
  salud: {
    hero: `bright modern medical office in mexico, warm teal accents, a doctor in white coat smiling at a seated patient, welcoming atmosphere, soft afternoon light. ${BASE}`,
    about: `medium shot of doctor hands writing in a notebook next to a stethoscope, professional and reassuring. ${BASE}`,
    catalog: `medical essentials arranged neatly: stethoscope, thermometer and blood pressure cuff on soft teal background. ${BASE}`,
  },
  dentista: {
    hero: `bright modern dental clinic in mexico with turquoise accents, dentist in scrubs greeting a smiling patient in dental chair, soft window light. ${BASE}`,
    about: `close shot of dentist working with precision instruments, focus and care, blurred equipment behind. ${BASE}`,
    catalog: `dental care set: electric toothbrush, mirror instrument, clear aligner tray on soft mint background. ${BASE}`,
  },
  belleza: {
    hero: `elegant beauty salon interior in mexico, rose gold and blush pink accents, stylist working on a woman client at a mirror station, soft warm afternoon light. ${BASE}`,
    about: `close medium shot of stylist hands styling long hair with a brush, delicate and confident. ${BASE}`,
    catalog: `beauty essentials arranged on marble surface: makeup brushes, foundation, lipstick and mirror, blush pink tones. ${BASE}`,
  },
  barberia: {
    hero: `moody classic barbershop in mexico with dark wood and leather chairs, barber giving a fade haircut to a client, warm tungsten light. ${BASE}`,
    about: `close shot of barber hands using clippers with precision, focus on craft, blurred vintage barber station. ${BASE}`,
    catalog: `classic barber tools on leather: straight razor, clippers, comb, shaving cream, warm amber light. ${BASE}`,
  },
  fitness: {
    hero: `wide interior shot of a modern mexican gym, natural light from big windows, athlete lifting dumbbells with focus, industrial concrete and warm orange accents. ${BASE}`,
    about: `close medium shot of coach spotting a client at bench press, mentoring atmosphere. ${BASE}`,
    catalog: `gym gear flat lay: dumbbells, resistance bands, jump rope and towel on wood floor, dramatic side light. ${BASE}`,
  },
  retail: {
    hero: `warm boutique interior in mexico with wood shelves and hanging plants, curated products displayed neatly, natural afternoon light, cozy and inviting. ${BASE}`,
    about: `medium shot of shop owner hands wrapping a purchase in kraft paper, personal touch. ${BASE}`,
    catalog: `three neat product boxes arranged on wood surface with warm side light, aesthetic composition. ${BASE}`,
  },
  panaderia: {
    hero: `warm rustic mexican bakery interior with fresh bread on wooden shelves and pan dulce (conchas, bolillos) on display, baker in apron, golden morning light. ${BASE}`,
    about: `close medium shot of baker hands kneading dough on a floured wooden surface, warm and authentic. ${BASE}`,
    catalog: `flat lay of assorted mexican pan dulce (conchas, cuernos, orejas) on rustic wood, golden morning light. ${BASE}`,
  },
  construccion: {
    hero: `wide shot inside a small mexican workshop for metalwork or carpentry, craftsman working with tools, ambient sparks or wood shavings, warm industrial light. ${BASE}`,
    about: `close medium shot of skilled hands measuring and marking material with a pencil and metal ruler, craftsmanship focus. ${BASE}`,
    catalog: `craftsman tools arranged on workbench: measuring tape, hammer, level, safety glasses. ${BASE}`,
  },
  herreria: {
    hero: `wide interior shot of a mexican metal workshop, welder in mask working with bright orange sparks flying, industrial atmosphere with dark tones and warm sparks, cinematic dramatic light. ${BASE}`,
    about: `medium shot of blacksmith hands shaping metal on an anvil with a hammer, glowing forge in background, warm amber light. ${BASE}`,
    catalog: `finished metalwork samples: iron gate detail, custom lock and welded steel bracket on dark wood surface, dramatic side light. ${BASE}`,
  },
  ferreteria: {
    hero: `wide interior shot of a well-stocked mexican hardware store, shelves full of tools and hardware, worker helping a customer with a product, warm ambient light. ${BASE}`,
    about: `medium shot of worker hands showing hardware options to a customer, helpful and knowledgeable. ${BASE}`,
    catalog: `hardware essentials on workbench: screws, drill bits, tape measure and gloves, top-down flat lay. ${BASE}`,
  },
  hogar: {
    hero: `wide shot of a bright modern mexican home interior, technician in uniform working on air conditioning unit, natural window light, calm and professional atmosphere. ${BASE}`,
    about: `close shot of technician hands using a multimeter on electrical equipment, focused and skilled. ${BASE}`,
    catalog: `home service tools arranged neatly: multimeter, screwdriver set, and service kit on soft blue background. ${BASE}`,
  },

  // ——— Nuevos giros profesionales (Fix P0 2026-09-07)
  seguros: {
    hero: `wide shot of a modern clean insurance office interior in mexico, empty organized desk with laptop, folder and pen, blurred urban skyline through big window, warm neutral palette of beige and soft blue. ${BASE_PRO}`,
    about: `medium shot of two latin american professionals in business casual shaking hands across a clean desk in a modern insurance office, warm confident lighting, papers and pen in the foreground. ${BASE_PRO}`,
    catalog: `overhead flat lay of professional documents, calculator, fountain pen, ceramic coffee cup and eyeglasses on a clean beige desk, editorial composition. ${BASE_PRO}`,
  },
  finanzas: {
    hero: `wide shot of a modern mexican financial advisor office, laptop showing abstract soft gradient curves (no legible text, no numbers), organized desk with notepad, natural window light, blues and warm neutrals. ${BASE_PRO}`,
    about: `medium shot of a professional latin financial advisor smiling while sitting across from a client in a bright office, hands gesturing over a paper on the desk, warm confident lighting. ${BASE_PRO}`,
    catalog: `overhead flat lay of financial planning essentials: notebook, calculator, coffee cup and pen on soft beige desk, editorial photography. ${BASE_PRO}`,
  },
  contabilidad: {
    hero: `wide shot of a tidy accounting office interior in mexico, wooden bookshelf with binders in the background, empty organized desk with calculator, laptop and neatly stacked papers, natural afternoon light. ${BASE_PRO}`,
    about: `close medium shot of an accountant hands typing on a calculator and marking a printed report with a pen, focused and precise, blurred office in background. ${BASE_PRO}`,
    catalog: `overhead flat lay of accounting tools: printed spreadsheet abstract shapes (no legible numbers), calculator, pen, coffee cup and glasses on a clean wooden desk. ${BASE_PRO}`,
  },
  'asesoria-legal': {
    hero: `wide shot of an elegant law office interior in mexico, dark wood shelves filled with law books, an empty leather chair behind a wooden desk with a green banker lamp, dramatic warm side light. ${BASE_PRO}`,
    about: `medium shot of a latin american lawyer in suit smiling reassuringly at a seated client across a wooden desk, blurred law bookshelf in the background, warm serious atmosphere. ${BASE_PRO}`,
    catalog: `overhead flat lay of legal essentials: leather portfolio, fountain pen, brass gavel and stacked case files on dark wood, dramatic amber light. ${BASE_PRO}`,
  },
  'agencia-marketing': {
    hero: `wide shot of a creative marketing agency office in mexico, colorful walls with abstract shapes (no text), open workspace with laptops and creative post-its on a glass wall, natural bright light. ${BASE_PRO}`,
    about: `medium shot of a young diverse latin creative team collaborating around a laptop and paper mockups on a large table, warm afternoon light through windows, energetic mood. ${BASE_PRO}`,
    catalog: `overhead flat lay of creative agency essentials: camera, notebook with abstract sketches, colorful sticky notes, coffee cup and pens on a wooden desk. ${BASE_PRO}`,
  },
  fotografia: {
    hero: `wide shot of a professional photography studio in mexico with softbox lights, backdrop and camera on a tripod, moody warm light, clean minimalist workspace in background. ${BASE_PRO}`,
    about: `close medium shot of a photographer hands adjusting a professional camera settings, focused on craft, blurred studio lights in background, warm tones. ${BASE_PRO}`,
    catalog: `overhead flat lay of photography gear: dslr camera, prime lens, memory cards and lens cleaning cloth on dark wooden surface, dramatic side light. ${BASE_PRO}`,
  },
  eventos: {
    hero: `wide shot of an elegantly set up event table in an outdoor mexican garden or terrace, warm string lights above, floral centerpieces and neat place settings, golden hour light, romantic celebratory mood. ${BASE}`,
    about: `medium shot of catering hands plating a beautifully decorated dish, focused and delicate, blurred event kitchen in background, warm tones. ${BASE}`,
    catalog: `overhead flat lay of catering essentials: elegant plate with abstract garnish, cutlery, folded napkin, wine glass and small flowers on a linen tablecloth. ${BASE}`,
  },
  escuela: {
    hero: `wide shot of a bright modern mexican classroom or academy interior, empty organized wooden desks, clean whiteboard (no writing), colorful books on shelves, big windows with natural morning light, welcoming educational atmosphere. ${BASE}`,
    about: `medium shot of a warm latin american teacher smiling while explaining to two smiling students at a wooden table, notebooks and pencils, bright natural light. ${BASE}`,
    catalog: `overhead flat lay of educational essentials: notebooks, pencils, colored markers, books, small globe and apple on a wooden desk, editorial composition. ${BASE}`,
  },
  restaurante: {
    hero: `wide shot of a warm inviting mexican restaurant interior, dim ambient lighting with pendant lamps, wooden tables neatly set with plates and glasses, blurred kitchen in background, cozy dinner atmosphere. ${BASE}`,
    about: `medium shot of a chef hands plating a beautifully arranged mexican dish, steam rising softly, focused craft, warm kitchen light. ${BASE}`,
    catalog: `overhead flat lay of a rustic mexican dish beautifully plated with salsa, lime and cilantro on a ceramic plate on wooden table, appetite-inducing warm light. ${BASE}`,
  },
  cafeteria: {
    hero: `wide shot of a cozy warm mexican specialty cafe interior with wooden bar, espresso machine, hanging plants and pendant lights, morning golden light through the window, few empty stools. ${BASE}`,
    about: `close medium shot of a barista hands pouring latte art into a ceramic cup on a wooden bar, warm tones, blurred espresso machine behind. ${BASE}`,
    catalog: `overhead flat lay of a cafeteria set: latte with foam art in a ceramic cup, croissant on a plate, small book and green plant on wooden table, warm morning light. ${BASE}`,
  },
  minisuper: {
    hero: `wide shot of a clean well-organized small mexican convenience store interior, colorful shelves stocked with generic non-branded products (no readable labels), soft ceiling light, neat and inviting. ${BASE}`,
    about: `medium shot of a friendly latin american shop owner smiling at a customer across the counter, cash register visible, warm shop lighting. ${BASE}`,
    catalog: `overhead flat lay of neatly organized pantry essentials: unbranded canned goods, fruits, bread, milk carton on a wooden surface, editorial composition. ${BASE}`,
  },
  farmacia: {
    hero: `wide shot of a clean modern mexican pharmacy interior, neat shelves of unbranded medicine boxes (no readable labels), pharmacist in white coat visible in background, calm cool lighting. ${BASE_PRO}`,
    about: `medium shot of a latin pharmacist in white coat kindly attending a customer across the counter, both smiling, blurred medicine shelves behind, warm reassuring tone. ${BASE_PRO}`,
    catalog: `overhead flat lay of pharmacy essentials: unbranded pill bottles, a stethoscope, first aid kit and thermometer on a light surface, clean editorial composition. ${BASE_PRO}`,
  },

  generico: {
    hero: `wide shot of a warm friendly small mexican business storefront interior, shop owner smiling at a customer, natural afternoon light, welcoming atmosphere. ${BASE}`,
    about: `medium shot of business owner hands shaking hands with a happy customer, trust and warmth. ${BASE}`,
    catalog: `neat product display on wood shelf with warm ambient side light, aesthetic and inviting. ${BASE}`,
  },
}

/**
 * Mapa slug de giro → grupo de prompts. Cuando un giro nuevo se agrega en
 * `giros.ts` DEBE aparecer aquí (o cae a `generico`).
 * Fix 2026-09-07: los giros profesionales apuntan a sus propios grupos.
 */
const GIRO_TO_GROUP: Record<string, string> = {
  veterinaria: 'salud_animal', 'tienda-mascotas': 'salud_animal',
  refaccionaria: 'automotriz', 'taller-mecanico': 'automotriz', 'taller-motos': 'automotriz', llantera: 'automotriz',
  dentista: 'dentista', fisioterapia: 'salud', nutriologo: 'salud', optica: 'salud',
  estetica: 'belleza', barberia: 'barberia', spa: 'belleza',
  gimnasio: 'fitness',
  boutique: 'retail', zapateria: 'retail', joyeria: 'retail', muebleria: 'retail', floreria: 'retail',
  'telas-merceria': 'retail', papeleria: 'retail', uniformes: 'retail',
  panaderia: 'panaderia',
  ferreteria: 'ferreteria',
  'material-construccion': 'construccion', vidrieria: 'construccion',
  herreria: 'herreria',
  carpinteria: 'construccion', remodelaciones: 'construccion', plomeria: 'construccion',
  electricista: 'construccion', cerrajeria: 'construccion', tapiceria: 'construccion',
  construccion: 'construccion',
  'aire-acondicionado': 'hogar', 'renta-mobiliario': 'hogar', 'salon-fiestas': 'hogar', purificadora: 'hogar',
  imprenta: 'agencia-marketing',

  // Profesionales (nuevos 2026-09-07)
  seguros: 'seguros',
  finanzas: 'finanzas',
  inmobiliaria: 'seguros', // usa el look de oficina profesional (mejora sobre generico)
  contabilidad: 'contabilidad',
  'asesoria-legal': 'asesoria-legal',
  'agencia-marketing': 'agencia-marketing',
  fotografia: 'fotografia',
  eventos: 'eventos',
  'agencia-viajes': 'eventos', // look de servicio de eventos/viajes elegante (era generico terracota)
  escuela: 'escuela',
  restaurante: 'restaurante',
  cafeteria: 'cafeteria',
  minisuper: 'minisuper',
  farmacia: 'farmacia',
}

/**
 * Devuelve los 3 prompts (hero/about/catalog) para un giro.
 * Cuando el giro no está mapeado o es "otros", devuelve un fallback SMART:
 * usamos `giroLibre + descripcion` como semilla en lugar del genérico
 * terracota-storefront. Se llama con contexto ampliado para evitar sesgo.
 */
export function promptForGiro(
  giro: string | null | undefined,
  ctx?: { giroLibre?: string | null; descripcion?: string | null },
): PromptTriple {
  if (!giro) {
    return smartFallback(ctx?.giroLibre, ctx?.descripcion)
  }
  if (giro === 'otros') {
    return smartFallback(ctx?.giroLibre, ctx?.descripcion)
  }
  const group = GIRO_TO_GROUP[giro] ?? null
  if (group && PROMPTS[group]) return PROMPTS[group]
  // Giro conocido en el catálogo pero sin mapa (nuevo/experimental) —
  // preferimos el fallback smart al genérico terracota.
  return smartFallback(giro.replace(/-/g, ' '), ctx?.descripcion)
}

/**
 * Genera un PromptTriple bajo demanda usando el texto libre del cliente.
 * Cero terracota, cero artesanía. Modelo neutral moderno + tono del negocio.
 */
function smartFallback(
  giroLibre: string | null | undefined,
  descripcion: string | null | undefined,
): PromptTriple {
  const desc = (descripcion ?? '').trim().slice(0, 400)
  const giroClean = (giroLibre ?? '').trim().slice(0, 120)
  const subject = giroClean || 'small professional business'
  const business = desc ? ` The business: "${desc}".` : ''

  return {
    hero: `Professional editorial photograph relevant to a mexican ${subject}.${business} Clean modern real-world scene (interior, workspace or setting typical of this line of work), warm neutral palette of beige, cream and soft blue, natural window light, empty of foreground people, magazine editorial quality, 16:9 composition. ${BASE_PRO}`,
    about: `Professional editorial photograph of a latin american business owner or worker in a mexican ${subject}${business ? ' — ' + desc : ''}, medium shot, warm confident lighting, natural setting, 4:3 composition. ${BASE_PRO}`,
    catalog: `Editorial overhead flat lay of the typical tools, products or workspace of a mexican ${subject}${business ? ' — ' + desc : ''}, clean composition on a wooden or soft neutral surface, warm natural light, 1:1 composition. ${BASE_PRO}`,
  }
}
