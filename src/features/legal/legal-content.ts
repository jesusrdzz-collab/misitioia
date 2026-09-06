/**
 * Generador de páginas legales por sitio (español mexicano).
 *
 * - Aviso de Privacidad: plantilla conforme a la LFPDPPP (Ley Federal de
 *   Protección de Datos Personales en Posesión de los Particulares) y su
 *   Reglamento. Incluye responsable, domicilio, medios de contacto para
 *   ejercer derechos ARCO, transferencias, cookies y cambios al aviso.
 * - Términos y Condiciones: titular, objeto del sitio, aceptación por uso,
 *   propiedad intelectual, enlaces a terceros, limitación de responsabilidad,
 *   ley aplicable y jurisdicción, contacto legal.
 * - Política de Cookies: definición, tipos, gestión y consentimiento LFPDPPP.
 *
 * REGLA: nada inventado. Los datos reales del negocio (nombre, ubicación,
 * contacto) se insertan; si falta un dato (ej. RFC, correo), se usa un
 * placeholder claro con instrucción de cómo completarlo — NO se inventa.
 */
import type { BusinessView } from '@/features/sites/business'
import { ROOT_DOMAIN } from '@/lib/domain'

export type LegalKind = 'terminos' | 'aviso-de-privacidad' | 'cookies'

/**
 * Herramientas de analítica activas en el sitio del cliente. Cuando alguno
 * está activo, las páginas legales (aviso de privacidad y cookies) mencionan
 * el tratamiento por terceros — condicional a que el negocio los tenga.
 */
export interface LegalAnalyticsFlags {
  meta: boolean
  ga: boolean
}

export interface LegalSection {
  heading: string
  /** Párrafos; una cadena que empieza con "- " se renderiza como viñeta. */
  body: string[]
}

export interface LegalDoc {
  kind: LegalKind
  title: string
  updated: string
  intro: string[]
  sections: LegalSection[]
}

const UPDATED = 'Última actualización: 6 de septiembre de 2026'

/**
 * "por qué placeholder honesto y no valor genérico": si el negocio aún no
 * capturó su domicilio/correo/teléfono, decirlo explícitamente cumple la
 * LFPDPPP mejor que inventar un dato — y le indica al dueño exactamente
 * dónde completarlo desde el panel.
 */
const PLACEHOLDER_MISSING = (label: string) =>
  `[${label} pendiente de configurar — el negocio puede agregarlo desde su panel de MiSitio IA]`

/**
 * Línea de "medios de contacto" formateada como oración. Se usa como
 * complemento después de "puede ejercer sus derechos" o similar.
 * Si no hay ningún dato, retorna el fallback con el propio sitio.
 */
function contactSentence(b: BusinessView): string {
  const parts: string[] = []
  if (b.email) parts.push(`correo electrónico ${b.email}`)
  if (b.phone) parts.push(`teléfono ${b.phone}`)
  if (b.whatsapp && b.whatsapp !== b.phone) parts.push(`WhatsApp ${b.whatsapp}`)
  if (b.address) parts.push(`domicilio en ${b.address}`)
  if (!parts.length) {
    return `a través de los medios de contacto publicados en ${b.url}`
  }
  return parts.join(', ')
}

/** Bloque expandido "Identificación del responsable" — se usa en aviso y términos. */
function responsibleBlock(b: BusinessView): string[] {
  const nombre = b.name
  const domicilio = b.address
    ? b.address + (b.location ? `, ${b.location}` : '')
    : b.location
    ? `${b.location} ${PLACEHOLDER_MISSING('calle y número')}`
    : PLACEHOLDER_MISSING('domicilio completo')

  const correo = b.email || PLACEHOLDER_MISSING('correo de contacto')
  const telefono =
    b.phone || b.whatsapp || PLACEHOLDER_MISSING('teléfono de contacto')

  return [
    `- **Nombre comercial del responsable:** ${nombre}.`,
    `- **Domicilio para oír y recibir notificaciones:** ${domicilio}.`,
    `- **Correo electrónico de contacto:** ${correo}.`,
    `- **Teléfono de contacto:** ${telefono}.`,
    `- **Sitio web:** ${b.url}.`,
  ]
}

function locationText(b: BusinessView): string {
  return b.location ? ` con operaciones en ${b.location}` : ''
}

function analyticsProvidersLine(flags?: LegalAnalyticsFlags): string | null {
  if (!flags) return null
  const parts: string[] = []
  if (flags.meta) parts.push('Meta Platforms, Inc. (Pixel de Facebook e Instagram)')
  if (flags.ga) parts.push('Google LLC (Google Analytics 4)')
  if (parts.length === 0) return null
  return `Este sitio utiliza además herramientas de medición y publicidad de terceros: ${parts.join(
    ' y ',
  )}. Estas herramientas pueden recabar datos técnicos y de comportamiento de navegación en su dispositivo, únicamente después de que usted otorgue su consentimiento a través del aviso de cookies mostrado al pie del sitio. Usted puede revocar su consentimiento en cualquier momento borrando las cookies desde la configuración de su navegador.`
}

/** Aviso de Privacidad conforme a la LFPDPPP y su Reglamento. */
export function buildAvisoPrivacidad(
  b: BusinessView,
  analytics?: LegalAnalyticsFlags,
): LegalDoc {
  const responsable = b.name
  const analyticsLine = analyticsProvidersLine(analytics)
  return {
    kind: 'aviso-de-privacidad',
    title: 'Aviso de Privacidad Integral',
    updated: UPDATED,
    intro: [
      `En cumplimiento con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP), su Reglamento, los Lineamientos del Aviso de Privacidad y demás normatividad aplicable en los Estados Unidos Mexicanos, ${responsable} (en adelante, "el Responsable")${locationText(
        b,
      )} pone a su disposición el presente Aviso de Privacidad Integral, aplicable a todos los datos personales recabados a través del sitio ${b.url}, así como por vía telefónica, correo electrónico, WhatsApp, formularios de contacto y de forma presencial en nuestro domicilio.`,
      `Este aviso rige el tratamiento de todos los datos personales que usted proporcione al Responsable, incluyendo aquellos obtenidos de forma directa, indirecta o a través de fuentes de acceso público, en términos del artículo 10 del Reglamento de la LFPDPPP.`,
    ],
    sections: [
      {
        heading: '1. Identificación y domicilio del responsable',
        body: [
          'El responsable del tratamiento de sus datos personales, en términos del artículo 3, fracción XIV de la LFPDPPP, es:',
          ...responsibleBlock(b),
          `Para cualquier duda relacionada con este Aviso o con el tratamiento de sus datos personales, puede contactarnos ${contactSentence(
            b,
          )}.`,
        ],
      },
      {
        heading: '2. Datos personales que recabamos',
        body: [
          'Para las finalidades señaladas en este aviso, el Responsable podrá recabar las siguientes categorías de datos personales, directamente del titular o a través de los medios electrónicos que ponemos a su disposición:',
          '- Datos de identificación: nombre completo, apellidos y, en su caso, denominación o razón social si es persona moral.',
          '- Datos de contacto: teléfono, WhatsApp, correo electrónico y, cuando aplique, domicilio para envío o facturación.',
          '- Datos que usted proporcione voluntariamente al comunicarse con nosotros por cualquiera de los canales de atención (formularios del sitio, chat en línea, redes sociales, teléfono, correo, WhatsApp o presencialmente).',
          '- Datos técnicos y de navegación cuando visita nuestro sitio: dirección IP, tipo de dispositivo, navegador, sistema operativo y páginas visitadas — únicamente para operar y mejorar el sitio.',
          'No recabamos datos personales sensibles (origen racial o étnico, estado de salud presente o futuro, información genética, creencias religiosas, filosóficas y morales, afiliación sindical, opiniones políticas o preferencia sexual) salvo que resulten estrictamente necesarios para el servicio solicitado y previa manifestación expresa de su consentimiento por escrito.',
          'No recabamos datos personales de menores de edad de forma consciente. Si detectamos que se han recibido datos de un menor, procederemos a eliminarlos.',
        ],
      },
      {
        heading: '3. Finalidades del tratamiento',
        body: [
          'Sus datos personales serán utilizados para las siguientes finalidades primarias, necesarias para dar cumplimiento a la relación jurídica que usted origina o para prestar los servicios que solicita:',
          '- Atender sus solicitudes, cotizaciones, consultas, dudas, quejas, sugerencias y comentarios.',
          '- Brindar los productos y/o servicios que nos solicite y darles seguimiento hasta su entrega o conclusión.',
          '- Contactarle por los medios que nos proporcionó para dar respuesta a su solicitud y realizar aclaraciones si son necesarias.',
          '- Emitir comprobantes, facturas y realizar las operaciones administrativas, contables y fiscales asociadas al servicio.',
          '- Cumplir con obligaciones legales, requerimientos de autoridad competente y auditorías internas.',
          'Adicionalmente, y sólo si usted no manifiesta su oposición, podremos utilizar sus datos personales para las siguientes finalidades secundarias, que no son necesarias para la relación jurídica pero nos permiten brindarle un mejor servicio:',
          '- Enviarle promociones, novedades, invitaciones a eventos y encuestas de calidad.',
          '- Elaborar estudios internos sobre hábitos de consumo y mejorar nuestros productos y servicios.',
          `Si usted no desea que sus datos personales se utilicen para las finalidades secundarias, puede manifestar su negativa desde este momento enviándonos su solicitud ${contactSentence(
            b,
          )}. Su negativa no será motivo para negarle los servicios que solicita.`,
        ],
      },
      {
        heading: '4. Transferencia de datos personales',
        body: [
          'Le informamos que sus datos personales pueden ser transferidos y tratados dentro y fuera del país por personas distintas al Responsable, en los siguientes casos y siempre bajo las medidas de seguridad legalmente exigibles:',
          '- A autoridades competentes, cuando la transferencia sea legalmente exigida en términos del artículo 37 de la LFPDPPP.',
          '- A proveedores de servicios tecnológicos que actúan como encargados y únicamente tratan los datos conforme a nuestras instrucciones (hospedaje del sitio web, mensajería, correo transaccional, procesamiento de pagos y respaldo).',
          `- A MiSitio IA (marca operada por Konnex 24/7), plataforma que aloja este sitio y opera el asistente conversacional que atiende sus solicitudes en línea. MiSitio IA actúa exclusivamente como encargado del tratamiento por cuenta del Responsable, con contrato de confidencialidad, y no utiliza los datos para finalidad propia distinta a la operación del servicio. Puede consultar sus términos en https://${ROOT_DOMAIN}/privacy.`,
          'Salvo los supuestos anteriores, sus datos personales no serán transferidos ni comercializados con terceros sin su consentimiento expreso. Al utilizar nuestros servicios y no manifestar oposición, usted otorga su consentimiento para las transferencias necesarias descritas en este apartado.',
        ],
      },
      {
        heading: '5. Derechos ARCO y revocación del consentimiento',
        body: [
          'De conformidad con los artículos 22 a 35 de la LFPDPPP, usted o su representante legal tienen derecho a:',
          '- **Acceder** a los datos personales que poseemos y conocer los detalles de su tratamiento.',
          '- **Rectificar** los datos personales cuando sean inexactos o incompletos.',
          '- **Cancelar** los datos personales cuando considere que no se requieren para alguna de las finalidades señaladas, estén siendo utilizados para finalidades no consentidas o haya finalizado la relación con el Responsable.',
          '- **Oponerse** al tratamiento de sus datos personales para fines específicos.',
          'Asimismo, puede en cualquier momento **revocar el consentimiento** que nos ha otorgado para el tratamiento de sus datos personales; sin embargo, esta revocación no tendrá efectos retroactivos y, en algunos casos, la revocación puede implicar que ya no le podamos seguir prestando el servicio solicitado.',
          `Para ejercer cualquiera de estos derechos, envíenos su solicitud ${contactSentence(
            b,
          )}, indicando: (a) su nombre completo y medio para comunicarle la respuesta, (b) documento que acredite su identidad o, en su caso, la representación legal, (c) descripción clara y precisa de los datos personales sobre los que busca ejercer alguno de los derechos, y (d) cualquier otro elemento que facilite la localización de los datos.`,
          'El Responsable dará respuesta a su solicitud en un plazo máximo de 20 días hábiles contados a partir de su recepción y, si resulta procedente, hará efectivo el derecho ARCO solicitado dentro de los 15 días hábiles siguientes a la comunicación de la respuesta.',
          'Si considera que su derecho a la protección de datos ha sido vulnerado o presume alguna violación a la LFPDPPP, puede acudir al Instituto Nacional de Transparencia, Acceso a la Información y Protección de Datos Personales (INAI) — www.inai.org.mx.',
        ],
      },
      {
        heading: '6. Uso de cookies y tecnologías de rastreo',
        body: [
          'Nuestro sitio web utiliza cookies y tecnologías similares (etiquetas de píxel, almacenamiento local del navegador) para operar correctamente, recordar sus preferencias y, cuando aplique, medir el uso agregado del sitio.',
          `Para el detalle de las cookies utilizadas, su finalidad y la forma de administrarlas, consulte nuestra Política de Cookies en ${b.url}/cookies. Usted puede configurar su navegador para bloquearlas o eliminarlas.`,
          ...(analyticsLine ? [analyticsLine] : []),
        ],
      },
      {
        heading: '7. Medidas de seguridad',
        body: [
          'El Responsable ha implementado medidas de seguridad administrativas, técnicas y físicas razonables para proteger sus datos personales frente a daño, pérdida, alteración, destrucción o uso, acceso o tratamiento no autorizado, en términos del artículo 19 de la LFPDPPP. Estas medidas se revisan periódicamente conforme al estado de la técnica y al riesgo asociado al tratamiento.',
        ],
      },
      {
        heading: '8. Cambios al Aviso de Privacidad',
        body: [
          `El presente Aviso de Privacidad puede sufrir modificaciones, cambios o actualizaciones derivadas de nuevos requerimientos legales, de nuestras propias necesidades por los productos o servicios que ofrecemos, de nuestras prácticas de privacidad, de cambios en nuestro modelo de negocio o por otras causas. Cualquier modificación se hará de su conocimiento a través de su publicación en ${b.url}/aviso-de-privacidad, indicando la fecha de la última actualización.`,
        ],
      },
      {
        heading: '9. Consentimiento del titular',
        body: [
          'Al proporcionar sus datos personales por cualquier medio (formularios del sitio, chat en línea, correo electrónico, WhatsApp, teléfono o presencialmente) y/o al utilizar nuestros servicios sin manifestar oposición, usted reconoce haber leído y comprendido este Aviso de Privacidad y otorga su consentimiento tácito para el tratamiento de sus datos personales conforme a lo aquí expuesto, en términos del artículo 8 de la LFPDPPP.',
        ],
      },
    ],
  }
}

/** Términos y Condiciones de servicio estándar (nivel bufete B2B mexicano). */
export function buildTerminos(b: BusinessView): LegalDoc {
  return {
    kind: 'terminos',
    title: 'Términos y Condiciones de Uso',
    updated: UPDATED,
    intro: [
      `Los presentes Términos y Condiciones (los "Términos") regulan el acceso y uso del sitio web ${b.url} (el "Sitio") y de los productos, servicios, contenidos y funcionalidades que a través de él se ofrecen por parte de ${b.name} (en adelante, "el Negocio" o "el Titular")${locationText(
        b,
      )}.`,
      'Al acceder o utilizar el Sitio, usted (el "Usuario") declara haber leído, entendido y aceptado íntegramente estos Términos y el Aviso de Privacidad correspondiente. Si no está de acuerdo con cualquiera de sus disposiciones, deberá abstenerse de utilizar el Sitio.',
    ],
    sections: [
      {
        heading: '1. Titular y datos de contacto',
        body: [
          'El titular del Sitio y responsable de su operación es:',
          ...responsibleBlock(b),
          `Para consultas legales, comerciales o de servicio, puede contactar al Titular ${contactSentence(
            b,
          )}.`,
        ],
      },
      {
        heading: '2. Objeto',
        body: [
          `Este Sitio tiene como finalidad presentar información sobre ${b.name}, su actividad como ${b.giroNombre}, los productos y/o servicios que ofrece, así como facilitar el contacto y la comunicación con clientes, prospectos y personas interesadas.`,
          'El Sitio puede incluir formularios de contacto, catálogo de productos o servicios, información de horarios y ubicación, así como un asistente conversacional automatizado que responde consultas frecuentes.',
        ],
      },
      {
        heading: '3. Aceptación de los Términos',
        body: [
          'La navegación en el Sitio, el envío de cualquier formulario o el inicio de una conversación con el asistente implican la aceptación expresa de estos Términos y del Aviso de Privacidad. La aceptación se otorga sin necesidad de manifestación adicional.',
          'El Titular podrá modificar estos Términos en cualquier momento. Las modificaciones surtirán efectos desde su publicación en el Sitio. Se recomienda al Usuario revisar periódicamente el contenido de esta página.',
        ],
      },
      {
        heading: '4. Información publicada',
        body: [
          'El Titular procura que la información publicada sea veraz y esté actualizada; sin embargo, no garantiza que se encuentre libre de errores u omisiones. Los precios, promociones, disponibilidad, horarios y demás datos comerciales pueden cambiar sin previo aviso.',
          'La información de contacto, dirección y horarios se muestra con fines informativos. Se recomienda confirmar cualquier dato directamente con el Titular antes de acudir a sus instalaciones, agendar servicios o realizar una compra.',
          'Las respuestas del asistente conversacional se generan a partir de los datos que el Titular ha configurado y de reglas automatizadas. En caso de discrepancia entre la respuesta del asistente y la información oficial confirmada por el Titular, prevalecerá esta última.',
        ],
      },
      {
        heading: '5. Uso permitido del Sitio',
        body: [
          'El Usuario se compromete a utilizar el Sitio conforme a la ley, la moral, las buenas costumbres, el orden público y los presentes Términos. En particular, el Usuario se abstendrá de:',
          '- Realizar cualquier acción que pueda dañar, inutilizar, sobrecargar o deteriorar el Sitio o impedir su normal utilización.',
          '- Introducir o difundir virus informáticos o cualquier otro código malicioso.',
          '- Intentar acceder de forma no autorizada a áreas restringidas del Sitio o a sistemas informáticos del Titular o de terceros.',
          '- Utilizar el Sitio con fines fraudulentos, engañosos o ilícitos.',
          '- Suplantar la identidad de otras personas o entidades.',
        ],
      },
      {
        heading: '6. Propiedad intelectual e industrial',
        body: [
          `Las marcas, nombres comerciales, logotipos, textos, fotografías, gráficos, iconos, código fuente, bases de datos y demás contenidos publicados en el Sitio son propiedad de ${b.name} o de sus respectivos titulares y están protegidos por la legislación mexicana e internacional en materia de propiedad intelectual e industrial.`,
          'Queda expresamente prohibida su reproducción, distribución, comunicación pública, transformación o cualquier otra forma de explotación, total o parcial, por cualquier medio, sin la autorización expresa y por escrito del Titular o de sus respectivos propietarios.',
          'El uso no autorizado de estos contenidos puede constituir una infracción a la Ley Federal del Derecho de Autor, a la Ley Federal de Protección a la Propiedad Industrial y a la legislación aplicable, sujeta a las sanciones civiles, penales y administrativas correspondientes.',
        ],
      },
      {
        heading: '7. Enlaces a sitios de terceros',
        body: [
          'El Sitio puede incluir enlaces o referencias a sitios web, aplicaciones o servicios operados por terceros (por ejemplo, redes sociales, mapas, pasarelas de pago o servicios de mensajería). Estos enlaces se ofrecen únicamente para conveniencia del Usuario.',
          'El Titular no controla ni asume responsabilidad alguna por el contenido, las políticas de privacidad o las prácticas de dichos terceros. El acceso a esos sitios se realiza bajo la exclusiva responsabilidad del Usuario y sujeto a los términos y condiciones que en ellos se establezcan.',
        ],
      },
      {
        heading: '8. Limitación de responsabilidad',
        body: [
          'El Titular no será responsable por daños directos, indirectos, incidentales o consecuentes derivados de:',
          '- El uso o la imposibilidad de uso del Sitio o de cualquiera de sus funcionalidades.',
          '- Interrupciones, fallas, retrasos o errores en el funcionamiento del Sitio ocasionados por causas ajenas al control razonable del Titular, incluyendo caso fortuito o fuerza mayor.',
          '- La información publicada por terceros o transmitida a través de enlaces.',
          '- Decisiones que el Usuario tome basándose en la información publicada, sin haber confirmado previamente los datos relevantes con el Titular.',
          'En todo caso, la responsabilidad total del Titular por cualquier reclamación relacionada con el uso del Sitio se limitará al monto que efectivamente haya sido pagado por el Usuario al Titular en los tres meses anteriores al hecho que dio origen a la reclamación, en la medida permitida por la legislación aplicable.',
        ],
      },
      {
        heading: '9. Protección de datos personales',
        body: [
          `El tratamiento de los datos personales que el Usuario proporcione a través del Sitio se rige por el Aviso de Privacidad publicado en ${b.url}/aviso-de-privacidad, el cual forma parte integrante de estos Términos.`,
        ],
      },
      {
        heading: '10. Legislación aplicable y jurisdicción',
        body: [
          'Estos Términos se rigen e interpretan conforme a las leyes de los Estados Unidos Mexicanos.',
          'Para la resolución de cualquier controversia derivada de la interpretación, cumplimiento o ejecución de los presentes Términos, las partes se someten expresamente a la jurisdicción y competencia de los tribunales del domicilio del Titular, renunciando expresamente a cualquier otra jurisdicción que pudiera corresponderles por razón de sus domicilios presentes o futuros.',
        ],
      },
      {
        heading: '11. Contacto para consultas legales',
        body: [
          `Cualquier notificación, aclaración, reclamación o consulta de carácter legal deberá dirigirse al Titular ${contactSentence(
            b,
          )}.`,
        ],
      },
    ],
  }
}

/** Política de Cookies conforme a la LFPDPPP y buenas prácticas mexicanas. */
export function buildCookies(
  b: BusinessView,
  analytics?: LegalAnalyticsFlags,
): LegalDoc {
  const analyticsBullets: string[] = []
  if (analytics?.meta)
    analyticsBullets.push(
      '- Meta Pixel (Facebook e Instagram): cookies gestionadas por Meta Platforms, Inc. para medir la efectividad de campañas publicitarias y mostrar anuncios relevantes. Se activan únicamente si acepta el aviso de cookies. Consulte la política de privacidad de Meta en https://www.facebook.com/privacy/policy.',
    )
  if (analytics?.ga)
    analyticsBullets.push(
      '- Google Analytics 4: cookies gestionadas por Google LLC para conocer, de forma anónima y agregada, cómo se usa el sitio. Se activan únicamente si acepta el aviso de cookies. Consulte la política de privacidad de Google en https://policies.google.com/privacy.',
    )
  return {
    kind: 'cookies',
    title: 'Política de Cookies',
    updated: UPDATED,
    intro: [
      `Esta Política de Cookies explica cómo ${b.name} (en adelante, "el Responsable"), titular del sitio web ${b.url}, utiliza cookies y tecnologías similares durante su navegación.`,
      `El uso de cookies en el sitio se rige por la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) y complementa nuestro Aviso de Privacidad, disponible en ${b.url}/aviso-de-privacidad.`,
    ],
    sections: [
      {
        heading: '1. ¿Qué es una cookie?',
        body: [
          'Una cookie es un pequeño archivo de texto que un sitio web almacena en su dispositivo (computadora, teléfono o tableta) cuando lo visita. Las cookies permiten al sitio recordar sus preferencias (idioma, sesión iniciada, elementos en el carrito), medir el uso agregado del sitio y, en algunos casos, mostrar contenido o publicidad relevante.',
          'Junto a las cookies, algunos sitios utilizan tecnologías similares (etiquetas de píxel, web beacons, almacenamiento local del navegador o del dispositivo) que tienen finalidades análogas.',
        ],
      },
      {
        heading: '2. Tipos de cookies que utilizamos',
        body: [
          'En este Sitio pueden utilizarse los siguientes tipos de cookies:',
          '- **Cookies técnicas o estrictamente necesarias:** permiten el funcionamiento básico del Sitio, la carga correcta de sus páginas, la seguridad de la sesión y la memorización de preferencias esenciales (como la aceptación de este aviso de cookies). No requieren consentimiento porque son indispensables para prestar el servicio.',
          '- **Cookies de personalización:** recuerdan preferencias del usuario para mejorar la experiencia de navegación.',
          '- **Cookies de análisis o medición:** nos ayudan a entender, de forma agregada y anónima, cómo se usa el Sitio (páginas más visitadas, tiempo de permanencia, dispositivos utilizados) para mejorarlo. Se activan únicamente con su consentimiento.',
          '- **Cookies publicitarias y de terceros:** cuando el Sitio integra herramientas de medición o publicidad de terceros, estas pueden instalar cookies bajo sus propias políticas. Se activan únicamente con su consentimiento.',
          ...analyticsBullets,
          'Este sitio no utiliza cookies para recabar datos personales identificables sin su consentimiento.',
        ],
      },
      {
        heading: '3. Consentimiento del titular',
        body: [
          'Salvo por las cookies estrictamente necesarias, la instalación de cookies en su dispositivo requiere su consentimiento. Al aceptar el aviso de cookies que se muestra al ingresar al Sitio, o al continuar navegando sin manifestar oposición, usted otorga su consentimiento para el uso de cookies conforme a esta política.',
          'Puede retirar su consentimiento en cualquier momento eliminando las cookies almacenadas y ajustando la configuración de su navegador.',
        ],
      },
      {
        heading: '4. ¿Cómo administrar o eliminar las cookies?',
        body: [
          'Usted puede permitir, bloquear o eliminar las cookies instaladas en su dispositivo mediante la configuración de su navegador. A continuación, algunos enlaces útiles:',
          '- Google Chrome: https://support.google.com/chrome/answer/95647',
          '- Mozilla Firefox: https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias',
          '- Safari: https://support.apple.com/es-es/guide/safari/sfri11471/mac',
          '- Microsoft Edge: https://support.microsoft.com/es-es/microsoft-edge',
          'Al deshabilitar algunas cookies, ciertas funciones del Sitio podrían no operar correctamente o dejar de estar disponibles.',
        ],
      },
      {
        heading: '5. Cambios a esta política',
        body: [
          `Podemos actualizar esta Política de Cookies en cualquier momento para reflejar cambios normativos, técnicos o funcionales. La versión vigente estará siempre disponible en ${b.url}/cookies con la fecha de última actualización.`,
        ],
      },
      {
        heading: '6. Contacto',
        body: [
          `Si tiene dudas sobre esta Política de Cookies o desea ejercer sus derechos sobre los datos personales tratados a través de cookies, puede contactarnos ${contactSentence(
            b,
          )}.`,
        ],
      },
    ],
  }
}

export function buildLegalDoc(
  kind: LegalKind,
  b: BusinessView,
  analytics?: LegalAnalyticsFlags,
): LegalDoc {
  switch (kind) {
    case 'aviso-de-privacidad':
      return buildAvisoPrivacidad(b, analytics)
    case 'cookies':
      return buildCookies(b, analytics)
    case 'terminos':
    default:
      return buildTerminos(b)
  }
}
