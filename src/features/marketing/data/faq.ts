/**
 * Preguntas frecuentes del producto. Se usan tanto en la sección FAQ de la
 * landing como en el JSON-LD FAQPage (AEO). Una sola fuente de verdad.
 */
export interface FaqItem {
  q: string
  a: string
}

export const FAQ: FaqItem[] = [
  {
    q: '¿Qué hace diferente a MiSitio IA de Wix, Hostinger o una agencia?',
    a: 'Las demás plataformas te dan una página bonita y ahí termina su trabajo: tú tienes que contestar cada mensaje. MiSitio IA te da la página y, en el plan de pago, le conecta a Victoria, un asistente de inteligencia artificial que atiende a tus clientes 24/7 por WhatsApp y por tu sitio, responde dudas, cotiza y hasta agenda videollamadas. No es una página que se ve bien: es una página que vende sola.',
  },
  {
    q: '¿Qué significa que mi página esté “lista para la IA” (AEO)?',
    a: 'La forma de buscar está cambiando: cada vez más gente le pregunta a ChatGPT, Gemini o Perplexity qué comprar o a qué negocio acudir, en lugar de usar Google. Esos asistentes solo recomiendan lo que entienden. AEO (Answer Engine Optimization) es preparar tu página para que los buscadores de IA la lean, la entiendan y te recomienden: datos estructurados (schema.org), un resumen legible por máquinas (llms.txt), información clara de tu negocio y permiso explícito para los rastreadores de IA. MiSitio IA hace todo eso por ti desde el primer minuto; la mayoría de las páginas hechas en otro lado no lo tienen y quedan invisibles para la IA.',
  },
  {
    q: '¿De verdad es gratis? ¿Cuál es el truco?',
    a: 'El plan gratis es gratis para siempre: tu página profesional en un subdominio tunegocio.misitio.site, con tu catálogo y tu información. No pedimos tarjeta. Ganamos cuando tu negocio crece y decides subir al plan con Victoria, dominio propio o WhatsApp conectado. La página gratis es nuestra carta de presentación, no una prueba con fecha de vencimiento.',
  },
  {
    q: '¿Cuánto tarda en estar lista mi página?',
    a: 'Minutos. Nuestra IA arma la primera versión con la información pública de tu negocio (nombre, giro, horarios, ubicación, calificación). Tú la reclamas, ajustas textos y fotos, y queda publicada al instante. No hay que esperar semanas a un diseñador ni pelear con un editor complicado.',
  },
  {
    q: '¿Qué es Victoria y cómo me ayuda a vender?',
    a: 'Victoria es una asistente de ventas con inteligencia artificial que ya lleva meses vendiendo de verdad en otros negocios. Conoce tu catálogo, tus precios y tus horarios; contesta en español, con la voz de tu marca, a cualquier hora. Cuando el cliente está listo, agenda una videollamada o te pasa la conversación para que la cierres tú. Es como tener un vendedor que nunca duerme.',
  },
  {
    q: '¿Necesito saber de tecnología o diseño?',
    a: 'No. Si sabes usar WhatsApp, sabes usar MiSitio IA. El editor es de autoservicio: cambias un texto, agregas un producto o subes una foto, le das guardar y se refleja en tu página. Nada de código ni de configuraciones raras.',
  },
  {
    q: '¿Puedo usar mi propio dominio (tunegocio.com)?',
    a: 'Sí, en el plan Nivel 3. Conectamos tu dominio propio con certificado de seguridad incluido y, si ya tenías uno, migramos sin perder tus enlaces. También conectamos tu WhatsApp para que Victoria conteste ahí mismo.',
  },
  {
    q: '¿Mis datos y los de mis clientes están seguros?',
    a: 'Sí. Tu información y la de tus clientes se tratan conforme a la Ley Federal de Protección de Datos Personales (LFPDPPP). No vendemos ni compartimos tus datos, y tú eres siempre el dueño de tu contenido y de tus conversaciones.',
  },
  {
    q: '¿Y si ya no quiero mi página?',
    a: 'La das de baja cuando quieras, a un clic, sin llamadas de retención ni preguntas incómodas. Sin permanencia forzada en ningún plan.',
  },
]
