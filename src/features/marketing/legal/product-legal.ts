/**
 * Contenido legal del PRODUCTO MiSitio IA (la empresa/plataforma), en español
 * mexicano. Distinto del generador legal de los sitios de negocios: aquí el
 * Responsable es MiSitio IA como prestador del servicio SaaS.
 *
 * - Aviso de Privacidad conforme a la LFPDPPP.
 * - Términos y Condiciones del servicio.
 * - Política de Cookies.
 */
import { BRAND } from '../brand'

export type ProductLegalKind = 'aviso-de-privacidad' | 'terminos' | 'cookies'

export interface LegalSection {
  heading: string
  body: string[]
}

export interface ProductLegalDoc {
  kind: ProductLegalKind
  title: string
  updated: string
  intro: string[]
  sections: LegalSection[]
}

const UPDATED = 'Última actualización: 31 de agosto de 2026'
const CONTACT = `correo electrónico ${BRAND.email}`

export function buildProductAviso(): ProductLegalDoc {
  return {
    kind: 'aviso-de-privacidad',
    title: 'Aviso de Privacidad',
    updated: UPDATED,
    intro: [
      `En cumplimiento con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP), su Reglamento y demás normatividad aplicable en México, ${BRAND.legalName} (en adelante, "MiSitio IA", "nosotros" o "el Responsable"), responsable de la plataforma disponible en ${BRAND.url}, pone a su disposición el presente Aviso de Privacidad.`,
      `El Responsable puede ser contactado a través de ${CONTACT}.`,
    ],
    sections: [
      {
        heading: '1. Datos personales que recabamos',
        body: [
          'Podemos recabar los siguientes datos, según los servicios que utilice:',
          '- Datos de identificación y contacto del titular de la cuenta: nombre, correo electrónico y teléfono.',
          '- Datos del negocio: nombre comercial, giro, domicilio, horarios, teléfono y contenido que usted publica en su sitio.',
          '- Datos de uso: información técnica de navegación (dirección IP, tipo de dispositivo y navegador) con fines de seguridad y mejora del servicio.',
          '- Datos de facturación: en los planes de pago, los datos necesarios para procesar el cobro, gestionados por nuestro procesador de pagos (no almacenamos los datos completos de su tarjeta).',
          'Como parte del servicio de asistente de inteligencia artificial (Victoria), podemos tratar el contenido de las conversaciones que los visitantes sostienen en su sitio, por cuenta y orden de usted.',
        ],
      },
      {
        heading: '2. Finalidades del tratamiento',
        body: [
          'Finalidades primarias (necesarias para prestarle el servicio):',
          '- Crear y administrar su cuenta y su sitio web.',
          '- Operar el asistente de inteligencia artificial y las funciones de mensajería, CRM y agenda de videollamadas.',
          '- Procesar pagos y administrar su suscripción.',
          '- Brindar soporte técnico y comunicarnos con usted sobre el servicio.',
          'Finalidades secundarias (que usted puede rechazar):',
          '- Enviarle novedades, mejoras del producto y contenido informativo. Puede oponerse escribiéndonos al correo de contacto.',
        ],
      },
      {
        heading: '3. Encargados y transferencias',
        body: [
          'Para operar la plataforma nos apoyamos en proveedores tecnológicos que actúan como encargados y tratan los datos únicamente conforme a nuestras instrucciones, entre ellos servicios de hospedaje e infraestructura en la nube, bases de datos, procesamiento de pagos, mensajería y modelos de inteligencia artificial.',
          'No vendemos ni comercializamos sus datos personales. Solo los transferimos cuando sea necesario para prestarle el servicio, cuando usted lo autorice, o en los supuestos del artículo 37 de la LFPDPPP (por ejemplo, requerimiento de autoridad competente).',
        ],
      },
      {
        heading: '4. Derechos ARCO y revocación',
        body: [
          'Usted tiene derecho a Acceder, Rectificar y Cancelar sus datos personales, así como a Oponerse a su tratamiento o revocar el consentimiento otorgado (Derechos ARCO).',
          `Para ejercerlos, envíe su solicitud a ${CONTACT}, indicando su nombre, el medio para responderle y la descripción clara del derecho que desea ejercer. Daremos respuesta en los plazos que marca la Ley.`,
        ],
      },
      {
        heading: '5. Datos de los visitantes de su sitio',
        body: [
          'Cuando un visitante interactúa con un sitio creado en MiSitio IA (por ejemplo, al escribir al asistente o dejar sus datos de contacto), usted, como titular de ese negocio, es el responsable del tratamiento de esos datos, y MiSitio IA actúa como encargado. Usted se obliga a contar con su propio aviso de privacidad y a tratar dicha información conforme a la Ley.',
        ],
      },
      {
        heading: '6. Seguridad y conservación',
        body: [
          'Implementamos medidas de seguridad administrativas, técnicas y físicas razonables para proteger sus datos. Conservamos la información durante el tiempo que mantenga su cuenta activa y el plazo adicional que exijan las obligaciones legales aplicables.',
        ],
      },
      {
        heading: '7. Cookies',
        body: [
          'Nuestro sitio utiliza cookies y tecnologías similares. Consulte el detalle en nuestra Política de Cookies.',
        ],
      },
      {
        heading: '8. Cambios al Aviso de Privacidad',
        body: [
          `Podemos actualizar este Aviso de Privacidad. Cualquier cambio se publicará en ${BRAND.url}/aviso-de-privacidad, indicando la fecha de última actualización.`,
        ],
      },
    ],
  }
}

export function buildProductTerminos(): ProductLegalDoc {
  return {
    kind: 'terminos',
    title: 'Términos y Condiciones',
    updated: UPDATED,
    intro: [
      `Los presentes Términos y Condiciones regulan el acceso y uso de la plataforma MiSitio IA, disponible en ${BRAND.url}, operada por ${BRAND.legalName} (en adelante, "MiSitio IA").`,
      'Al crear una cuenta o utilizar el servicio, usted acepta estos Términos. Si no está de acuerdo, le pedimos abstenerse de usar la plataforma.',
    ],
    sections: [
      {
        heading: '1. Descripción del servicio',
        body: [
          'MiSitio IA es una plataforma que permite crear y publicar sitios web para negocios con apoyo de inteligencia artificial, y ofrece funciones adicionales en sus planes de pago, como un asistente de ventas con IA (Victoria), mensajería, CRM y agenda de videollamadas.',
          'El servicio se ofrece en distintos niveles: un plan gratuito y planes de pago con funciones ampliadas.',
        ],
      },
      {
        heading: '2. Cuenta y uso aceptable',
        body: [
          'Usted es responsable de la veracidad de la información de su cuenta y de mantener la confidencialidad de sus credenciales.',
          'Se compromete a usar la plataforma de forma lícita y a no publicar contenido ilegal, engañoso, que infrinja derechos de terceros o que promueva actividades prohibidas. Nos reservamos el derecho de suspender cuentas que incumplan estos Términos.',
        ],
      },
      {
        heading: '3. Contenido y propiedad',
        body: [
          'Usted conserva la titularidad del contenido que publica (textos, imágenes, catálogo). Al usar el servicio, nos otorga una licencia limitada para alojar, mostrar y procesar dicho contenido con el único fin de operar la plataforma.',
          'La tecnología, el software, la marca y el diseño de MiSitio IA son propiedad de MiSitio IA y están protegidos por la legislación aplicable.',
        ],
      },
      {
        heading: '4. Planes, pagos y cancelación',
        body: [
          'Los planes de pago se facturan por adelantado de forma mensual, en pesos mexicanos (MXN). Los precios pueden actualizarse con aviso previo.',
          'Los planes de pago incluyen un tope mensual de conversaciones del asistente de IA, visible en su panel, con opción de ampliarlo. El exceso puede requerir un cargo adicional que se le informará.',
          'Puede cancelar su suscripción en cualquier momento; la cancelación surte efecto al final del periodo ya pagado, sin permanencia forzosa.',
        ],
      },
      {
        heading: '5. Asistente de inteligencia artificial',
        body: [
          'El asistente Victoria genera respuestas de forma automatizada con base en la información que usted proporciona. Aunque procuramos su exactitud, usted es responsable de revisar y validar la información publicada y las respuestas relevantes para su negocio. MiSitio IA no garantiza resultados de ventas específicos.',
        ],
      },
      {
        heading: '6. Disponibilidad y limitación de responsabilidad',
        body: [
          'Procuramos la máxima disponibilidad del servicio, pero no garantizamos que esté libre de interrupciones. En la medida que permita la ley, MiSitio IA no será responsable por daños indirectos, pérdida de ganancias o de datos derivados del uso o imposibilidad de uso del servicio.',
        ],
      },
      {
        heading: '7. Terminación',
        body: [
          'Usted puede dejar de usar el servicio y dar de baja su sitio cuando lo desee. Podemos suspender o terminar el servicio en caso de incumplimiento de estos Términos o por requerimiento legal.',
        ],
      },
      {
        heading: '8. Legislación aplicable',
        body: [
          'Estos Términos se rigen por la legislación de los Estados Unidos Mexicanos. Para cualquier controversia, las partes se someten a los tribunales competentes de la República Mexicana, renunciando a cualquier otro fuero que pudiera corresponderles.',
        ],
      },
    ],
  }
}

export function buildProductCookies(): ProductLegalDoc {
  return {
    kind: 'cookies',
    title: 'Política de Cookies',
    updated: UPDATED,
    intro: [
      `Esta Política de Cookies explica cómo MiSitio IA (${BRAND.url}) utiliza cookies y tecnologías similares.`,
    ],
    sections: [
      {
        heading: '1. ¿Qué son las cookies?',
        body: [
          'Las cookies son pequeños archivos de texto que un sitio almacena en su dispositivo cuando lo visita. Sirven para que el sitio funcione, recordar sus preferencias y entender cómo se usa.',
        ],
      },
      {
        heading: '2. ¿Qué cookies utilizamos?',
        body: [
          '- Cookies necesarias: permiten el funcionamiento básico, el inicio de sesión y la seguridad. Sin ellas la plataforma no opera correctamente.',
          '- Cookies de preferencias: recuerdan ajustes como el idioma o la sesión.',
          '- Cookies de análisis: nos ayudan a entender de forma agregada y anónima cómo se usa la plataforma para mejorarla.',
          'No utilizamos cookies para vender su información a terceros.',
        ],
      },
      {
        heading: '3. ¿Cómo administrar las cookies?',
        body: [
          'Puede permitir, bloquear o eliminar las cookies desde la configuración de su navegador. Al deshabilitar algunas, ciertas funciones podrían dejar de operar correctamente.',
        ],
      },
      {
        heading: '4. Cambios a esta política',
        body: [
          `Podemos actualizar esta Política de Cookies. La versión vigente estará disponible en ${BRAND.url}/cookies.`,
        ],
      },
    ],
  }
}

export function buildProductLegal(kind: ProductLegalKind): ProductLegalDoc {
  switch (kind) {
    case 'aviso-de-privacidad':
      return buildProductAviso()
    case 'cookies':
      return buildProductCookies()
    case 'terminos':
    default:
      return buildProductTerminos()
  }
}
