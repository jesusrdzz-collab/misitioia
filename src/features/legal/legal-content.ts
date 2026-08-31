/**
 * Generador de páginas legales por sitio (español mexicano).
 *
 * - Aviso de Privacidad: plantilla conforme a la LFPDPPP (Ley Federal de
 *   Protección de Datos Personales en Posesión de los Particulares).
 * - Términos y Condiciones: términos de servicio estándar.
 * - Política de Cookies.
 *
 * REGLA: nada inventado. Los datos reales del negocio (nombre, ubicación,
 * contacto) se insertan; si falta un dato (ej. RFC, correo), se usa un
 * placeholder claro o el genérico legal correcto — NO se inventa.
 */
import type { BusinessView } from '@/features/sites/business'

export type LegalKind = 'terminos' | 'aviso-de-privacidad' | 'cookies'

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

const UPDATED = 'Última actualización: 31 de agosto de 2026'

function contactLine(b: BusinessView): string {
  const parts: string[] = []
  if (b.email) parts.push(`correo electrónico ${b.email}`)
  if (b.phone) parts.push(`teléfono ${b.phone}`)
  if (b.address) parts.push(`domicilio en ${b.address}`)
  if (!parts.length) return `a través de los medios de contacto publicados en ${b.url}`
  return parts.join(', ')
}

function locationText(b: BusinessView): string {
  return b.location ? ` con operaciones en ${b.location}` : ''
}

/** Aviso de Privacidad conforme a la LFPDPPP. */
export function buildAvisoPrivacidad(b: BusinessView): LegalDoc {
  const responsable = b.name
  return {
    kind: 'aviso-de-privacidad',
    title: 'Aviso de Privacidad',
    updated: UPDATED,
    intro: [
      `En cumplimiento con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP), su Reglamento y demás normatividad aplicable en México, ${responsable} (en adelante, "el Responsable")${locationText(
        b,
      )} pone a su disposición el presente Aviso de Privacidad.`,
      `El Responsable es quien recaba y da tratamiento a sus datos personales y puede ser contactado ${contactLine(
        b,
      )}.`,
    ],
    sections: [
      {
        heading: '1. Datos personales que recabamos',
        body: [
          'Para las finalidades señaladas en este aviso, podemos recabar los siguientes datos personales:',
          '- Datos de identificación y contacto: nombre, teléfono y correo electrónico.',
          '- Datos que usted proporcione voluntariamente al comunicarse con nosotros por WhatsApp, teléfono, correo o formularios del sitio.',
          'No recabamos datos personales sensibles salvo que resulte estrictamente necesario para el servicio solicitado y previo su consentimiento.',
        ],
      },
      {
        heading: '2. Finalidades del tratamiento',
        body: [
          'Finalidades primarias (necesarias para la relación con usted):',
          '- Atender sus solicitudes, cotizaciones, dudas y comentarios.',
          '- Brindar los productos o servicios que nos solicite.',
          '- Dar seguimiento y contactarle en relación con su solicitud.',
          'Finalidades secundarias (que usted puede rechazar):',
          '- Enviarle promociones, novedades y encuestas de calidad. Si no desea que sus datos se usen para estos fines, puede indicárnoslo mediante los datos de contacto de este aviso.',
        ],
      },
      {
        heading: '3. Transferencia de datos',
        body: [
          'Sus datos personales no serán transferidos ni comercializados con terceros sin su consentimiento, salvo las excepciones previstas en el artículo 37 de la LFPDPPP (por ejemplo, cuando la transferencia sea requerida por autoridad competente).',
          'Podemos apoyarnos en proveedores de servicios tecnológicos (por ejemplo, hospedaje del sitio web y mensajería) que actúan como encargados y únicamente tratan los datos conforme a nuestras instrucciones.',
        ],
      },
      {
        heading: '4. Derechos ARCO',
        body: [
          'Usted tiene derecho a Acceder, Rectificar y Cancelar sus datos personales, así como a Oponerse a su tratamiento o revocar el consentimiento otorgado (Derechos ARCO).',
          `Para ejercer cualquiera de estos derechos, puede enviar su solicitud ${contactLine(
            b,
          )}. La solicitud deberá contener su nombre, medio para comunicarle la respuesta y la descripción clara de los datos y del derecho que desea ejercer.`,
        ],
      },
      {
        heading: '5. Uso de cookies y tecnologías de rastreo',
        body: [
          'Nuestro sitio web puede utilizar cookies y tecnologías similares para mejorar su experiencia de navegación. Puede consultar el detalle en nuestra Política de Cookies y configurar su navegador para deshabilitarlas.',
        ],
      },
      {
        heading: '6. Cambios al Aviso de Privacidad',
        body: [
          `El presente Aviso de Privacidad puede sufrir modificaciones o actualizaciones. Cualquier cambio se hará de su conocimiento a través de ${b.url}.`,
        ],
      },
      {
        heading: '7. Consentimiento',
        body: [
          'Al proporcionar sus datos personales por cualquier medio y/o utilizar nuestros servicios, usted manifiesta su conformidad con el presente Aviso de Privacidad.',
        ],
      },
    ],
  }
}

/** Términos y Condiciones de servicio estándar. */
export function buildTerminos(b: BusinessView): LegalDoc {
  return {
    kind: 'terminos',
    title: 'Términos y Condiciones',
    updated: UPDATED,
    intro: [
      `Los presentes Términos y Condiciones regulan el acceso y uso del sitio web ${b.url} y de los servicios ofrecidos por ${b.name} (en adelante, "el Negocio")${locationText(
        b,
      )}.`,
      'Al acceder o utilizar este sitio, usted acepta quedar obligado por estos Términos y Condiciones. Si no está de acuerdo, le pedimos abstenerse de utilizar el sitio.',
    ],
    sections: [
      {
        heading: '1. Objeto',
        body: [
          `Este sitio tiene como finalidad presentar información sobre ${b.name}, su ${b.giroNombre}, sus productos y/o servicios, así como facilitar el contacto con clientes y personas interesadas.`,
        ],
      },
      {
        heading: '2. Información publicada',
        body: [
          'El Negocio procura que la información publicada sea veraz y esté actualizada; sin embargo, no garantiza que se encuentre libre de errores u omisiones. Los precios, promociones, horarios y disponibilidad pueden cambiar sin previo aviso.',
          'La información de contacto, dirección y horarios se muestra con fines informativos. Le recomendamos confirmar cualquier dato directamente con el Negocio antes de acudir o realizar una compra.',
        ],
      },
      {
        heading: '3. Uso del sitio',
        body: [
          'Usted se compromete a utilizar el sitio de forma lícita y a no realizar acciones que puedan dañarlo, sobrecargarlo o afectar su normal funcionamiento, ni a utilizarlo con fines fraudulentos.',
        ],
      },
      {
        heading: '4. Propiedad intelectual',
        body: [
          `Las marcas, nombres comerciales, logotipos y contenidos mostrados pertenecen a ${b.name} o a sus respectivos titulares. Queda prohibida su reproducción o uso sin autorización.`,
        ],
      },
      {
        heading: '5. Contacto y comunicaciones',
        body: [
          `Cualquier comunicación relacionada con productos, servicios, cotizaciones o reclamaciones podrá realizarse ${contactLine(
            b,
          )}.`,
        ],
      },
      {
        heading: '6. Limitación de responsabilidad',
        body: [
          'El Negocio no será responsable por daños derivados del uso o imposibilidad de uso del sitio, ni por interrupciones ocasionadas por causas ajenas a su control.',
        ],
      },
      {
        heading: '7. Legislación aplicable',
        body: [
          'Estos Términos y Condiciones se rigen por la legislación de los Estados Unidos Mexicanos. Para cualquier controversia, las partes se someten a los tribunales competentes del domicilio del Negocio, renunciando a cualquier otro fuero.',
        ],
      },
    ],
  }
}

/** Política de Cookies. */
export function buildCookies(b: BusinessView): LegalDoc {
  return {
    kind: 'cookies',
    title: 'Política de Cookies',
    updated: UPDATED,
    intro: [
      `Esta Política de Cookies explica cómo el sitio web ${b.url} de ${b.name} utiliza cookies y tecnologías similares.`,
    ],
    sections: [
      {
        heading: '1. ¿Qué son las cookies?',
        body: [
          'Las cookies son pequeños archivos de texto que un sitio web almacena en su dispositivo cuando lo visita. Sirven para recordar sus preferencias y mejorar su experiencia de navegación.',
        ],
      },
      {
        heading: '2. ¿Qué cookies utilizamos?',
        body: [
          '- Cookies técnicas o necesarias: permiten el funcionamiento básico del sitio y su correcta visualización.',
          '- Cookies de análisis (si aplican): nos ayudan a entender de forma agregada y anónima cómo se usa el sitio para mejorarlo.',
          'Este sitio no utiliza cookies para recabar datos personales identificables sin su consentimiento.',
        ],
      },
      {
        heading: '3. ¿Cómo puede administrar las cookies?',
        body: [
          'Usted puede permitir, bloquear o eliminar las cookies instaladas en su dispositivo mediante la configuración de su navegador. Al deshabilitar algunas cookies, ciertas funciones del sitio podrían no operar correctamente.',
        ],
      },
      {
        heading: '4. Cambios a esta política',
        body: [
          `Podemos actualizar esta Política de Cookies en cualquier momento. La versión vigente estará siempre disponible en ${b.url}.`,
        ],
      },
    ],
  }
}

export function buildLegalDoc(kind: LegalKind, b: BusinessView): LegalDoc {
  switch (kind) {
    case 'aviso-de-privacidad':
      return buildAvisoPrivacidad(b)
    case 'cookies':
      return buildCookies(b)
    case 'terminos':
    default:
      return buildTerminos(b)
  }
}
