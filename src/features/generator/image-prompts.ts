/**
 * Prompts de imágenes IA por giro (Sprint 6-sep-2026).
 * Cada giro tiene 3 escenas: hero (16:9), about (4:3), catalog (1:1).
 * Los prompts van en inglés porque Gemini image genera mejor con inglés.
 * El texto va con NOTXT desde images.ts.
 */

interface PromptTriple {
  hero: string
  about: string
  catalog: string
}

const BASE =
  'professional documentary photography, warm natural lighting, cinematic, ' +
  '4k detail, shallow depth of field, magazine editorial quality, ' +
  'authentic small business feel, latin american setting.'

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
  generico: {
    hero: `wide shot of a warm friendly small mexican business storefront interior, shop owner smiling at a customer, natural afternoon light, welcoming atmosphere. ${BASE}`,
    about: `medium shot of business owner hands shaking hands with a happy customer, trust and warmth. ${BASE}`,
    catalog: `neat product display on wood shelf with warm ambient side light, aesthetic and inviting. ${BASE}`,
  },
}

const GIRO_TO_GROUP: Record<string, string> = {
  veterinaria: 'salud_animal', 'tienda-mascotas': 'salud_animal',
  refaccionaria: 'automotriz', 'taller-mecanico': 'automotriz', 'taller-motos': 'automotriz', llantera: 'automotriz',
  dentista: 'dentista', fisioterapia: 'salud', nutriologo: 'salud', optica: 'salud',
  estetica: 'belleza', barberia: 'barberia', spa: 'belleza',
  gimnasio: 'fitness',
  boutique: 'retail', zapateria: 'retail', joyeria: 'retail', muebleria: 'retail', floreria: 'retail',
  'telas-merceria': 'retail', papeleria: 'retail',
  panaderia: 'panaderia',
  ferreteria: 'ferreteria',
  'material-construccion': 'construccion', vidrieria: 'construccion',
  herreria: 'herreria',
  carpinteria: 'construccion', remodelaciones: 'construccion', plomeria: 'construccion',
  electricista: 'construccion', cerrajeria: 'construccion', tapiceria: 'construccion',
  'aire-acondicionado': 'hogar', 'renta-mobiliario': 'hogar', 'salon-fiestas': 'hogar', purificadora: 'hogar',
}

export function promptForGiro(giro: string | null | undefined): PromptTriple {
  if (!giro) return PROMPTS.generico
  const group = GIRO_TO_GROUP[giro] ?? 'generico'
  return PROMPTS[group] ?? PROMPTS.generico
}
