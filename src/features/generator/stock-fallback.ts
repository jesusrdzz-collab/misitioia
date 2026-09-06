/**
 * Fallback de imágenes cuando Gemini falla. Fotos Unsplash (licencia libre).
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
  generico: {
    hero: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80',
    about: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80',
    catalog: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=900&q=80',
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

export function stockImageFor(giro: string | null | undefined, slot: 'hero' | 'about' | 'catalog'): string | null {
  const group = giro ? GIRO_TO_GROUP[giro] ?? 'generico' : 'generico'
  const set = STOCK[group] ?? STOCK.generico
  return set?.[slot] ?? null
}
