/**
 * "Museo de comparación" — datos de cada competidor.
 *
 * Reglas:
 * - Cada comparativa abre con un DOLOR ÚNICO y específico de ESE competidor.
 * - La tabla es factual y honesta; reconocemos lo que el competidor hace bien.
 * - NO inventamos cifras de precios de competidores ni copiamos su contenido.
 *   Las filas comparan capacidades, no números.
 * - Cierre siempre con nuestro diferencial: sitio + Victoria (IA que vende) +
 *   videollamada, en español y para negocios de México.
 */

export type Cell = 'yes' | 'no' | 'partial'

export interface CompareRow {
  feature: string
  us: Cell
  them: Cell
  themNote?: string
}

export interface Competitor {
  slug: string
  name: string
  /** Categoría corta para el índice. */
  category: string
  /** Una línea que resume el dolor, para las tarjetas del índice. */
  hook: string
  /** Título del dolor, específico de este competidor. */
  painTitle: string
  /** El dolor desarrollado (2–3 párrafos), único de este competidor. */
  pain: string[]
  /** Reconocimiento honesto de en qué es bueno. */
  fair: string
  /** Para quién sí tiene sentido esa herramienta. */
  bestFor: string
  rows: CompareRow[]
  /** Cierre con el diferencial nuestro. */
  closing: string[]
  metaTitle: string
  metaDescription: string
}

/** Filas compartidas: el eje de la comparación es siempre el mismo. */
function rows(them: Partial<Record<string, [Cell, string?]>>): CompareRow[] {
  const base: { key: string; feature: string; us: Cell }[] = [
    { key: 'fast', feature: 'Publica tu sitio en minutos', us: 'yes' },
    { key: 'mx', feature: 'Pensado para negocios de México, en español', us: 'yes' },
    { key: 'free', feature: 'Plan gratis permanente y sin tu marca en planes de pago', us: 'yes' },
    { key: 'done', feature: 'Te lo entregamos ya hecho (no lo armas tú desde cero)', us: 'yes' },
    { key: 'assistant', feature: 'Asistente de IA que atiende y vende 24/7', us: 'yes' },
    { key: 'video', feature: 'Agenda videollamadas con tus clientes', us: 'yes' },
    { key: 'whatsapp', feature: 'Conecta tu WhatsApp con la IA', us: 'yes' },
    { key: 'crm', feature: 'CRM + bandeja de conversaciones del negocio', us: 'yes' },
    { key: 'easy', feature: 'Fácil como usar WhatsApp (curva mínima)', us: 'yes' },
  ]
  return base.map((b) => {
    const t = them[b.key]
    return {
      feature: b.feature,
      us: b.us,
      them: t ? t[0] : 'no',
      themNote: t ? t[1] : undefined,
    }
  })
}

export const COMPETITORS: Competitor[] = [
  {
    slug: 'wix',
    name: 'Wix',
    category: 'Constructor todo-en-uno',
    hook: 'El domingo se te va arrastrando cajitas.',
    painTitle: 'Wix te da mil botones. Lo que no te da es tiempo.',
    pain: [
      'Wix es poderosísimo, y ese es justo el problema para un negocio pequeño. Abres el editor y te encuentras cientos de opciones: arrastra esta caja, alinea esta otra, elige entre docenas de plantillas casi iguales. El resultado es que el domingo que ibas a descansar se te va peleando con el editor en vez de atender clientes.',
      'Y cuando por fin la publicas en el plan gratis, la página lleva la marca de Wix y anuncios encima, con una dirección larga de wix.com. Para quitar eso hay que pagar.',
      'Al final tienes una página que se ve bien… y que sigue sin contestarle a nadie. Cada mensaje que llega, lo contestas tú.',
    ],
    fair:
      'Es justo decirlo: Wix es una de las plataformas más completas del mundo y su editor permite prácticamente cualquier diseño. Si tienes tiempo y ganas de armarlo tú, llega muy lejos.',
    bestFor: 'Quien disfruta diseñar y tiene horas para dedicarle al editor.',
    rows: rows({
      fast: ['partial', 'Su IA (ADI) ayuda, pero el ajuste fino es manual'],
      mx: ['partial', 'Disponible en español, pero no está pensado solo para SMB de México'],
      free: ['partial', 'Tiene plan gratis, pero con marca y anuncios de Wix'],
      done: ['no', 'Tú armas y mantienes la página'],
      assistant: ['no', 'Chat y formularios, no un vendedor con IA'],
      easy: ['partial', 'Muy flexible, pero con curva de aprendizaje real'],
    }),
    closing: [
      'MiSitio IA te quita el domingo de encima: te entregamos la página ya hecha, en español y pensada para tu negocio.',
      'Y le sumamos lo que Wix no tiene: Victoria, un asistente que contesta, cotiza y agenda videollamadas por ti las 24 horas. Tu página no solo se ve bien: vende.',
    ],
    metaTitle: 'MiSitio IA vs Wix: ¿cuál conviene para tu negocio? | MiSitio IA',
    metaDescription:
      'Comparativa honesta entre MiSitio IA y Wix para negocios de México. Wix te da un editor enorme; MiSitio IA te da la página ya hecha y un asistente de IA que vende 24/7.',
  },
  {
    slug: 'hostinger-ai',
    name: 'Hostinger AI',
    category: 'Hosting con creador IA',
    hook: 'Te arma la página en minutos… y ahí te suelta.',
    painTitle: 'Hostinger es una empresa de hosting. Tu venta no es su trabajo.',
    pain: [
      'El creador con IA de Hostinger es rápido y arma una página decente en un rato. El detalle es qué pasa después: Hostinger es, en el fondo, una empresa de hospedaje. Su negocio es rentarte servidor y dominio. Una vez que la página está montada, su trabajo terminó.',
      'Lo notas en la renovación: los precios de entrada suelen ser de gancho y al renovar el costo cambia. Y lo notas sobre todo cuando llega un cliente a medianoche: la página está ahí, bonita, pero muda. No hay nadie que conteste.',
      'Terminas con hosting y una página. No con un negocio que atiende solo.',
    ],
    fair:
      'Es justo reconocerlo: Hostinger es rápido, barato de entrada y su infraestructura es sólida. Como hosting, cumple.',
    bestFor: 'Quien busca hospedaje económico y solo necesita una página informativa.',
    rows: rows({
      fast: ['yes', 'Su creador con IA es genuinamente rápido'],
      mx: ['partial', 'Disponible en español, pero es una plataforma global de hosting'],
      free: ['no', 'Es un servicio de pago; el precio de entrada suele subir al renovar'],
      done: ['partial', 'La IA arma el borrador, pero el seguimiento es tuyo'],
      assistant: ['no', 'No incluye un asistente de ventas con IA'],
      easy: ['yes', 'El asistente de creación es sencillo'],
    }),
    closing: [
      'MiSitio IA no te renta un servidor: te entrega un negocio que atiende solo. La página es apenas el principio.',
      'Con Victoria contestando 24/7 y agendando videollamadas, tu sitio deja de ser un folleto mudo y empieza a cerrar ventas mientras tú descansas.',
    ],
    metaTitle: 'MiSitio IA vs Hostinger AI: página vs máquina de ventas | MiSitio IA',
    metaDescription:
      'Hostinger AI te arma la página y te suelta. MiSitio IA le suma Victoria, un asistente de IA que atiende y vende 24/7. Comparativa honesta para negocios de México.',
  },
  {
    slug: 'base44',
    name: 'Base44',
    category: 'Constructor de apps con IA',
    hook: 'Es para construir apps a punta de prompts, no para tu taquería.',
    painTitle: 'Base44 es genial… si lo tuyo es programar con prompts.',
    pain: [
      'Base44 es una herramienta impresionante para crear aplicaciones a punta de instrucciones a la IA. Le describes lo que quieres y te construye software a medida. Está pensada para creadores, makers y gente técnica que quiere levantar un producto.',
      'Ese es justo el desajuste. El dueño de una taquería, una refaccionaria o una estética no quiere "construir una app": quiere que su negocio aparezca en línea y que le contesten a sus clientes esta misma noche. Con una herramienta de este tipo terminas escribiendo prompts y ajustando lo que la IA generó, una y otra vez.',
      'Es potencia enfocada al armador técnico, no al dueño de un negocio local que solo quiere vender.',
    ],
    fair:
      'Seamos justos: para prototipar aplicaciones a medida con IA, Base44 es de lo más ágil que existe, y en su terreno brilla.',
    bestFor: 'Emprendedores técnicos que quieren construir una app o un producto a la medida.',
    rows: rows({
      fast: ['partial', 'Rápido para prototipos, pero orientado a construir software'],
      mx: ['no', 'Orientado a creadores técnicos, interfaz y enfoque en inglés'],
      free: ['partial', 'Tiene nivel gratuito, pero para construir apps, no sitios de negocio locales'],
      done: ['no', 'Tú describes y ajustas con prompts hasta lograrlo'],
      assistant: ['no', 'Construye apps; no incluye un vendedor de IA para tu negocio'],
      easy: ['partial', 'Sencillo para su público técnico, no para un dueño de negocio'],
    }),
    closing: [
      'MiSitio IA no te pide construir nada. Te entregamos la página de tu negocio ya publicada, en español, sin escribir un solo prompt.',
      'Y con Victoria vendiendo por ti y agendando videollamadas, tu tiempo se va a atender clientes, no a instruir a una IA.',
    ],
    metaTitle: 'MiSitio IA vs Base44: para dueños de negocio, no para makers | MiSitio IA',
    metaDescription:
      'Base44 construye apps con prompts para gente técnica. MiSitio IA te entrega la página de tu negocio ya hecha, en español, con un asistente de IA que vende. Comparativa honesta.',
  },
  {
    slug: 'durable',
    name: 'Durable',
    category: 'Creador IA ultrarrápido',
    hook: '30 segundos, sí. Pero queda genérica y en inglés.',
    painTitle: 'Durable es velocísimo. El problema es que se nota.',
    pain: [
      'Durable presume, con razón, que arma un sitio en unos 30 segundos. Es real y es impresionante. El costo de esa velocidad es que todas las páginas terminan pareciéndose: texto genérico, secciones de relleno y un molde que se repite de un negocio a otro.',
      'Además está pensado sobre todo para el mercado de Estados Unidos: el idioma por defecto es el inglés y el contenido que genera la IA suena a plantilla traducida, no a tu negocio de la colonia.',
      'Sale rápido, sí. Pero sale igual a otras mil, y sigue sin contestarle a tu cliente.',
    ],
    fair:
      'Hay que darle crédito: para tener algo publicado en menos de un minuto, Durable es de lo más veloz del mercado, y para validar una idea rápido, sirve.',
    bestFor: 'Quien quiere algo publicado en un minuto y no le importa que se vea genérico.',
    rows: rows({
      fast: ['yes', 'Genuinamente uno de los más rápidos que existen'],
      mx: ['no', 'Enfocado a EE. UU., por defecto en inglés'],
      free: ['partial', 'Prueba disponible; publicar/mantener requiere plan de pago'],
      done: ['partial', 'Rápido, pero el resultado tiende a ser genérico'],
      assistant: ['no', 'Incluye herramientas, no un vendedor con IA que agende videollamadas'],
      easy: ['yes', 'Muy simple de usar'],
    }),
    closing: [
      'MiSitio IA también es rápido, pero tu página se arma con los datos reales de tu negocio y una plantilla pensada para tu giro, en español mexicano.',
      'Y lo que ninguna página de 30 segundos te da: Victoria atendiendo y vendiendo 24/7, con videollamadas y relevo humano cuando tú quieras.',
    ],
    metaTitle: 'MiSitio IA vs Durable: velocidad con alma vs plantilla genérica | MiSitio IA',
    metaDescription:
      'Durable arma un sitio en 30 segundos, pero genérico y en inglés. MiSitio IA lo hace en español para tu giro y le suma un asistente de IA que vende. Comparativa honesta.',
  },
  {
    slug: 'godaddy-airo',
    name: 'GoDaddy Airo',
    category: 'Creador IA + ecosistema',
    hook: 'Cada clic te ofrece otro complemento de pago.',
    painTitle: 'Con Airo, tu página es el gancho para venderte todo lo demás.',
    pain: [
      'GoDaddy Airo arma un sitio con IA de forma decente. Pero GoDaddy vive de venderte cosas alrededor: dominio, correo profesional, marketing, protecciones, complementos. La experiencia está diseñada para que, a cada paso, te ofrezcan un extra de pago.',
      'Empiezas queriendo una página sencilla y terminas navegando un catálogo de upsells, decidiendo qué sí y qué no contratar. La página es la carnada; el ecosistema de complementos es el negocio.',
      'Y en medio de tanto add-on, la pregunta que de verdad importa —¿quién le contesta a mi cliente cuando escribe?— se queda sin responder.',
    ],
    fair:
      'Con justicia: GoDaddy es una marca enorme y confiable en dominios, y tener todo bajo un mismo techo le acomoda a algunas personas.',
    bestFor: 'Quien ya vive en el ecosistema GoDaddy y quiere todo en la misma cuenta.',
    rows: rows({
      fast: ['yes', 'Airo genera un borrador con IA rápidamente'],
      mx: ['partial', 'Disponible en español, pero es una plataforma global orientada a upsells'],
      free: ['no', 'El sitio es la entrada a complementos de pago'],
      done: ['partial', 'La IA arma el borrador; el resto lo configuras (y contratas) tú'],
      assistant: ['no', 'No incluye un asistente de ventas con IA para tu negocio'],
      easy: ['partial', 'El flujo de ventas cruzadas complica la experiencia'],
    }),
    closing: [
      'MiSitio IA no te vende un pasillo de complementos. Un plan claro, sin sorpresas, y tu página lista en español.',
      'Lo que sí te damos —y ningún add-on de GoDaddy sustituye— es a Victoria contestando y vendiendo por ti 24/7, con videollamadas incluidas.',
    ],
    metaTitle: 'MiSitio IA vs GoDaddy Airo: sin pasillo de upsells | MiSitio IA',
    metaDescription:
      'GoDaddy Airo usa tu página como gancho para venderte complementos. MiSitio IA te da un plan claro y un asistente de IA que vende 24/7. Comparativa honesta para México.',
  },
  {
    slug: 'framer',
    name: 'Framer',
    category: 'Herramienta de diseño web',
    hook: 'Precioso… si eres diseñador.',
    painTitle: 'Framer es hermoso. También es demasiada herramienta para un negocio local.',
    pain: [
      'Framer hace sitios espectaculares, con animaciones y un nivel de diseño que enamora. Pero es, en esencia, una herramienta profesional de diseño: está hecha para diseñadores, agencias y startups que saben de layouts, componentes y breakpoints.',
      'Para el dueño de una refaccionaria o una veterinaria, eso es como comprar una cámara de cine para tomar la foto del menú. La curva de aprendizaje es real, la interfaz está en inglés y el enfoque es el diseño, no salir a vender.',
      'Acabas con la posibilidad de un sitio bellísimo… que probablemente no vas a poder armar tú, y que de todos modos no le contesta a nadie.',
    ],
    fair:
      'Con toda justicia: en manos de un diseñador, Framer produce de los sitios más bonitos y pulidos que se pueden hacer hoy. En su terreno, es de lo mejor.',
    bestFor: 'Diseñadores, agencias y startups que quieren control total del diseño.',
    rows: rows({
      fast: ['partial', 'Rápido para quien sabe usarlo; no para un principiante'],
      mx: ['no', 'Orientado a diseñadores, interfaz en inglés'],
      free: ['partial', 'Tiene nivel gratuito con su subdominio y marca'],
      done: ['no', 'Tú (o un diseñador) construyen el sitio'],
      assistant: ['no', 'Herramienta de diseño; sin vendedor de IA ni videollamadas'],
      easy: ['no', 'Curva de aprendizaje pensada para perfiles de diseño'],
    }),
    closing: [
      'MiSitio IA te da un sitio elegante sin que tengas que ser diseñador ni tocar una sola herramienta compleja: llega ya hecho.',
      'Y mientras Framer se concentra en cómo se ve, MiSitio IA se concentra también en que venda: Victoria atiende, cotiza y agenda videollamadas por ti.',
    ],
    metaTitle: 'MiSitio IA vs Framer: para dueños de negocio, no para diseñadores | MiSitio IA',
    metaDescription:
      'Framer es una herramienta de diseño para profesionales. MiSitio IA te entrega el sitio ya hecho, en español, con un asistente de IA que vende 24/7. Comparativa honesta.',
  },
  {
    slug: 'squarespace',
    name: 'Squarespace',
    category: 'Constructor premium',
    hook: 'Plantillas hermosas, y tú sigues contestando cada mensaje a mano.',
    painTitle: 'Squarespace es elegante. Pero sigue siendo un folleto que no contesta.',
    pain: [
      'Squarespace tiene fama, y merecida, por sus plantillas elegantes. Se ve caro, se ve serio. El detalle es que, por más bonita que quede, sigue siendo una página estática: un folleto digital muy bien hecho.',
      'Está pensado sobre todo para el mercado angloparlante, con un enfoque de marca premium, y no está diseñado alrededor de la realidad de un negocio pequeño de México que recibe mensajes por WhatsApp a toda hora.',
      'Cuando el cliente escribe, no hay nadie del otro lado más que tú. La página se ve de lujo, pero el trabajo de contestar y cerrar sigue siendo 100% tuyo.',
    ],
    fair:
      'Es justo decirlo: en diseño y calidad de plantillas, Squarespace es de lo mejor, y para un portafolio o una marca visual, luce increíble.',
    bestFor: 'Marcas y portafolios que priorizan una estética premium por encima de todo.',
    rows: rows({
      fast: ['partial', 'Publicar es ágil, pero personalizar bien lleva tiempo'],
      mx: ['no', 'Enfocado al mercado angloparlante, sensibilidad premium global'],
      free: ['no', 'Solo prueba; luego es de pago, sin plan gratis permanente'],
      done: ['no', 'Tú eliges plantilla y armas el contenido'],
      assistant: ['no', 'Sitio estático; sin vendedor de IA ni videollamadas'],
      easy: ['partial', 'Más simple que otros, pero sigues armándolo tú'],
    }),
    closing: [
      'MiSitio IA también se ve elegante —con tipografía premium y un diseño pensado para tu giro— pero te lo entregamos ya hecho y en español.',
      'Y la diferencia de fondo: tu página no se queda callada. Victoria contesta, vende y agenda videollamadas por ti las 24 horas.',
    ],
    metaTitle: 'MiSitio IA vs Squarespace: elegante y que además vende | MiSitio IA',
    metaDescription:
      'Squarespace hace folletos digitales hermosos, pero tú sigues contestando todo. MiSitio IA le suma un asistente de IA que vende 24/7. Comparativa honesta para México.',
  },
  {
    slug: 'agencia-tradicional',
    name: 'Agencia o freelancer',
    category: 'Desarrollo a la medida',
    hook: 'Pagaste miles, esperaste meses, y cambiar un teléfono es un pleito.',
    painTitle: 'La agencia te cotiza en miles y te entrega en meses. Si es que entrega.',
    pain: [
      'La historia se repite en todos lados: un negocio pide una página, le cotizan varios miles de pesos, le prometen entregarla en unas semanas… y esas semanas se vuelven meses. A veces la página nunca llega, y el anticipo tampoco regresa.',
      'Y cuando por fin existe, empieza el otro viacrucis: para cambiar un teléfono, actualizar un horario o subir una foto nueva, hay que escribirle al que la hizo, esperar a que tenga tiempo y, con frecuencia, pagar otra vez. Tu página queda secuestrada por quien la construyó.',
      'Pagaste como para tener algo vivo y terminaste con algo estático que ni siquiera puedes editar tú.',
    ],
    fair:
      'Con justicia: una buena agencia o un freelancer con oficio pueden entregar un trabajo a la medida y con acompañamiento cercano que una plataforma no da. Esa cercanía tiene su valor.',
    bestFor: 'Proyectos grandes y a la medida con presupuesto y tiempo de sobra.',
    rows: rows({
      fast: ['no', 'Semanas o meses de espera es lo común'],
      mx: ['partial', 'Puede ser local, pero depende totalmente de con quién des'],
      free: ['no', 'Suele costar miles de pesos por adelantado'],
      done: ['partial', 'Te lo hacen, pero dependes de ellos para cada cambio'],
      assistant: ['no', 'Rara vez incluye un vendedor con IA que atienda 24/7'],
      easy: ['no', 'Editar requiere volver a pedirle (y pagarle) al desarrollador'],
    }),
    closing: [
      'MiSitio IA te da hoy, y gratis para empezar, lo que la agencia te cobra en miles y te entrega en meses. Y lo editas tú, cuando quieras, sin pedir permiso.',
      'Encima le sumamos algo que casi ninguna agencia incluye: Victoria vendiendo por ti 24/7, con videollamadas y relevo humano. Menos costo, menos espera, más ventas.',
    ],
    metaTitle: 'MiSitio IA vs agencia tradicional: hoy y gratis vs miles y meses | MiSitio IA',
    metaDescription:
      'Una agencia cotiza miles y entrega en meses, y editar depende de ellos. MiSitio IA te da la página hoy, la editas tú, y suma un asistente de IA que vende. Comparativa honesta.',
  },
  {
    slug: 'ueni',
    name: 'UENI',
    category: 'Servicio done-for-you',
    hook: 'Te venden "$79" y terminas pagando cada mes por siempre.',
    painTitle: 'UENI dice "$79 y listo". Después llega la mensualidad, y los cambios se cobran aparte.',
    pain: [
      'UENI hace publicidad con "creamos tu sitio en 7 días por MXN$1,399". La letra chica cuenta otra historia: eso es solo la cuota de setup — el servicio real cuesta $439 MXN al mes desde el plan de entrada, y sube hasta ~$2,500 MXN/mes en el plan Growth. Y en el plan de entrada, editar tu propio sitio solo está incluido los primeros 30 días: después de eso, cambiar un teléfono o subir una foto requiere subir al plan Plus.',
      'Suma un año: MXN$1,399 de setup + doce meses de $439 = MXN$6,667. Y el siguiente año son otros $5,268. Todo eso para un sitio con la misma plantilla que otros 700,000 de UENI, y que —lo verificamos en un cliente real de Zapopan— llega con las páginas legales vacías: "Por favor, contáctanos para nuestros Términos y Condiciones completos". Con esas legales tu WhatsApp Business puede quedar restringido cuando lo conectes.',
      'Y cuando alguien le pregunta a ChatGPT o Perplexity dónde comprar lo que tú vendes, tu sitio UENI no aparece: no tienen llms.txt, no permiten explícitamente a los bots de IA, y sirven todo desde una app de React que muchos crawlers no leen bien.',
    ],
    fair:
      'Es justo reconocerlo: UENI lleva más de 10 años operando, tiene 4.7 estrellas en Trustpilot con casi 10 mil reseñas, y su servicio humano —una persona real asignada a tu cuenta— es genuino. Para el dueño que quiere hablar con alguien y no tocar nada, cumple.',
    bestFor: 'Dueños que prefieren delegar todo a un humano por WhatsApp y que no piensan editar su sitio nunca más.',
    rows: rows({
      fast: ['no', 'Prometen 7 días; la primera versión llega en una semana'],
      mx: ['yes', 'Tienen locale es-MX y llevan años operando en México'],
      free: ['no', 'MXN$1,399 de setup + $439/mo obligatorio desde el plan de entrada'],
      done: ['yes', 'Sí te lo hacen (con humano asignado); ese es su modelo'],
      assistant: ['no', 'Ningún plan incluye asistente de IA para contestar y vender'],
      video: ['no', 'Formulario y booking sí; videollamada con clientes, no'],
      whatsapp: ['no', 'Listan tu WhatsApp; no conectan la IA a tu conversación'],
      crm: ['partial', 'Business Hub para mensajes; no es un CRM de ventas'],
      easy: ['partial', 'Editar tu propio sitio solo los primeros 30 días en el plan Launch'],
    }),
    closing: [
      'MiSitio IA arranca en cero pesos y se queda gratis para siempre. Cuando decidas que quieres que tu sitio venda solo, subes al plan que trae Victoria — un asistente de IA que contesta, cotiza y agenda videollamadas por ti las 24 horas, en español.',
      'Y desde el minuto uno tu sitio llega con legales completas y conformes a la ley mexicana, con estructura preparada para que ChatGPT y Google te encuentren, y con un editor que sigue siendo tuyo el año que viene y el otro.',
    ],
    metaTitle: 'MiSitio IA vs UENI: gratis vs $1,399 setup + mensualidad | MiSitio IA',
    metaDescription:
      'UENI cobra MXN$1,399 de setup más $439/mes y sus páginas legales vienen en blanco. MiSitio IA es gratis para siempre, con legales completas y un asistente de IA que vende por ti. Comparativa honesta para negocios de México.',
  },

]

export function getCompetitor(slug: string): Competitor | undefined {
  return COMPETITORS.find((c) => c.slug === slug)
}

export function competitorSlugs(): string[] {
  return COMPETITORS.map((c) => c.slug)
}
