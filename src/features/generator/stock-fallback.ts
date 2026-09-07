/**
 * Fallback de imágenes cuando Gemini falla. Fotos Unsplash (licencia libre).
 *
 * Fix P0 pre-campaña Meta (2026-09-07): añadimos grupos "profesional" (oficina),
 * "escuela", "restaurante", "cafeteria", "abarrotes", "farmacia", "eventos" y
 * "creativos" para que giros como seguros/finanzas/contabilidad/legal NO caigan
 * a `generico` (que sale como storefront artesanal → NO cuadra en seguros).
 */

interface StockTriple { hero: string; about: string; catalog: string }

const STOCK: Record<string, StockTriple> = {
  salud_animal: {
    hero: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=1600&q=80',
    about: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
    catalog: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=900&q=80',
  },
  automotriz: {
    hero: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1600&q=80',
    about: 'https://images.unsplash.com/photo-1632823469850-2f77dd9c7f93?auto=format&fit=crop&w=1200&q=80',
    catalog: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=900&q=80',
  },
  salud: {
    hero: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1600&q=80',
    about: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=1200&q=80',
    catalog: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=900&q=80',
  },
  dentista: {
    hero: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=1600&q=80',
    about: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80',
    catalog: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=900&q=80',
  },
  belleza: {
    hero: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=80',
    about: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
    catalog: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80',
  },
  barberia: {
    hero: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1600&q=80',
    about: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80',
    catalog: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=900&q=80',
  },
  fitness: {
    hero: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1600&q=80',
    about: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80',
    catalog: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80',
  },
  retail: {
    hero: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1600&q=80',
    about: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=1200&q=80',
    catalog: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
  },
  panaderia: {
    hero: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1600&q=80',
    about: 'https://images.unsplash.com/photo-1587244141378-cb5b6b3a8fe0?auto=format&fit=crop&w=1200&q=80',
    catalog: 'https://images.unsplash.com/photo-1568254183919-78a4f43a2877?auto=format&fit=crop&w=900&q=80',
  },
  construccion: {
    hero: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1600&q=80',
    about: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1200&q=80',
    catalog: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=900&q=80',
  },
  herreria: {
    hero: 'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?auto=format&fit=crop&w=1600&q=80',
    about: 'https://images.unsplash.com/photo-1583912267550-d6c2ac3196c0?auto=format&fit=crop&w=1200&q=80',
    catalog: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=900&q=80',
  },
  ferreteria: {
    hero: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1600&q=80',
    about: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=1200&q=80',
    catalog: 'https://images.unsplash.com/photo-1581091012184-5c8409bff103?auto=format&fit=crop&w=900&q=80',
  },
  hogar: {
    hero: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
    about: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80',
    catalog: 'https://images.unsplash.com/photo-1558449028-b53a39d100fc?auto=format&fit=crop&w=900&q=80',
  },

  // ——— Nuevos grupos profesionales (Fix P0 2026-09-07)
  profesional: {
    // Oficina moderna limpia, escritorio, laptop, luz natural.
    hero: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80',
    // Handshake profesional / reunión de negocios.
    about: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80',
    // Flat lay de escritorio con laptop, notebook y café.
    catalog: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80',
  },
  legal: {
    // Biblioteca con libros de derecho / oficina de abogado.
    hero: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1600&q=80',
    // Abogado firmando documento.
    about: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80',
    // Flat lay de papeles legales y pluma.
    catalog: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=80',
  },
  creativos: {
    // Agencia creativa / mesa con laptops y post-its.
    hero: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1600&q=80',
    // Equipo colaborando frente a laptop.
    about: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    // Escritorio creativo con notas y colores.
    catalog: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&w=900&q=80',
  },
  escuela: {
    // Aula moderna vacía.
    hero: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1600&q=80',
    // Profesor con estudiantes.
    about: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    // Útiles escolares flat lay.
    catalog: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80',
  },
  restaurante: {
    // Interior de restaurante cálido con mesas.
    hero: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80',
    // Chef emplatando.
    about: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=1200&q=80',
    // Platillo bien emplatado.
    catalog: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80',
  },
  cafeteria: {
    // Interior de café acogedor.
    hero: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1600&q=80',
    // Barista con latte art.
    about: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80',
    // Latte y croissant flat lay.
    catalog: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80',
  },
  abarrotes: {
    // Tienda pequeña con anaqueles.
    hero: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1600&q=80',
    // Tendero atendiendo.
    about: 'https://images.unsplash.com/photo-1608889476561-6242cfdbf622?auto=format&fit=crop&w=1200&q=80',
    // Productos de despensa flat lay.
    catalog: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80',
  },
  farmacia: {
    // Farmacia moderna limpia.
    hero: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=1600&q=80',
    // Farmacéutica atendiendo.
    about: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=1200&q=80',
    // Medicamentos flat lay.
    catalog: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=900&q=80',
  },
  eventos: {
    // Mesa de evento decorada.
    hero: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1600&q=80',
    // Catering emplatando.
    about: 'https://images.unsplash.com/photo-1519671845924-1fd18db430b8?auto=format&fit=crop&w=1200&q=80',
    // Elementos de catering flat lay.
    catalog: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=900&q=80',
  },
  fotografia: {
    // Cámara y estudio.
    hero: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1600&q=80',
    // Fotógrafo ajustando cámara.
    about: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80',
    // Equipo fotográfico flat lay.
    catalog: 'https://images.unsplash.com/photo-1493863641943-9b68992a8d07?auto=format&fit=crop&w=900&q=80',
  },

  generico: {
    hero: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80',
    about: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80',
    catalog: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80',
  },
}

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
  imprenta: 'creativos',

  // Profesionales (nuevos 2026-09-07)
  seguros: 'profesional',
  finanzas: 'profesional',
  contabilidad: 'profesional',
  inmobiliaria: 'profesional',
  'asesoria-legal': 'legal',
  'agencia-marketing': 'creativos',
  fotografia: 'fotografia',
  eventos: 'eventos',
  'agencia-viajes': 'eventos',
  escuela: 'escuela',
  restaurante: 'restaurante',
  cafeteria: 'cafeteria',
  minisuper: 'abarrotes',
  farmacia: 'farmacia',
}

export function stockImageFor(giro: string | null | undefined, slot: 'hero' | 'about' | 'catalog'): string | null {
  const group = giro ? GIRO_TO_GROUP[giro] ?? 'generico' : 'generico'
  const set = STOCK[group] ?? STOCK.generico
  return set?.[slot] ?? null
}
