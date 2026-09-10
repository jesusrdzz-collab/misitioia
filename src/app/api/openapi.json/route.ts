import { NextResponse } from 'next/server'

/**
 * GET /api/openapi.json — catálogo público OpenAPI 3.1 de la API de MiSitio.
 *
 * Diseñado para pegarse en ChatGPT / Claude / Gemini / Zapier como conector.
 * Todos los endpoints exigen `Authorization: Bearer sk_mi_...`; el token se
 * crea desde /settings/api-tokens.
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
// Cache CDN 5 minutos — el catálogo cambia rara vez.
export const revalidate = 300

const BASE_URL = 'https://misitio.site'

const spec = {
  openapi: '3.1.0',
  info: {
    title: 'MiSitio IA API',
    version: '1.0.0',
    description:
      'API pública de MiSitio IA. Permite a un cliente (ChatGPT, Claude, Gemini, Zapier o cualquier script) leer y editar sus sitios, catálogo, apariencia y datos de contacto de la misma cuenta con la que entra al panel en misitio.site. Autenticación: token Bearer con prefijo `sk_mi_`, creado desde /settings/api-tokens.',
    contact: {
      name: 'MiSitio IA',
      url: 'https://misitio.site',
    },
  },
  servers: [{ url: BASE_URL }],
  security: [{ bearerAuth: [] }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        description:
          'Token personal creado desde /settings/api-tokens. Formato: `sk_mi_` + 32 caracteres.',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: { error: { type: 'string' } },
        required: ['error'],
      },
      Site: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          slug: { type: 'string' },
          businessName: { type: 'string' },
          status: {
            type: 'string',
            enum: ['generado', 'reclamado', 'activo', 'dado_de_baja'],
          },
          giro: { type: 'string', nullable: true },
          customDomain: { type: 'string', nullable: true },
          url: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'slug', 'businessName', 'status'],
      },
      SiteContent: {
        type: 'object',
        properties: {
          about_text: { type: 'string', nullable: true },
          contact_phone: { type: 'string', nullable: true },
          contact_whatsapp: { type: 'string', nullable: true },
          contact_email: { type: 'string', nullable: true },
          contact_address: { type: 'string', nullable: true },
          responsable_nombre: { type: 'string', nullable: true },
          responsable_domicilio: { type: 'string', nullable: true },
          ciudad: { type: 'string', nullable: true },
          zona: { type: 'string', nullable: true },
          estado: { type: 'string', nullable: true },
          social_facebook: { type: 'string', nullable: true },
          social_instagram: { type: 'string', nullable: true },
          working_hours: {
            type: 'object',
            additionalProperties: { type: 'string' },
            nullable: true,
            description:
              'Mapa día→rango horario, ej. { "Lunes": "9:00-18:00", "Domingo": "Cerrado" }',
          },
          primary_color: { type: 'string', description: 'Hex color, e.g. #1e40af' },
          accent_color: { type: 'string' },
          emoji: { type: 'string', nullable: true },
          hero_title: { type: 'string', nullable: true },
          hero_subtitle: { type: 'string', nullable: true },
          hero_image_url: { type: 'string', nullable: true },
          about_image_url: { type: 'string', nullable: true },
          logo_url: { type: 'string', nullable: true },
        },
      },
      Service: {
        type: 'object',
        properties: {
          name: { type: 'string', maxLength: 80 },
          description: { type: 'string', maxLength: 240, nullable: true },
          icon: { type: 'string', maxLength: 8, nullable: true },
        },
        required: ['name'],
      },
      Product: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          site_id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          description: { type: 'string', nullable: true },
          price: { type: 'number', nullable: true },
          currency: { type: 'string', default: 'MXN' },
          image_url: { type: 'string', nullable: true },
          category: { type: 'string', nullable: true },
          is_active: { type: 'boolean' },
          sort_order: { type: 'integer' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      ProductInput: {
        type: 'object',
        properties: {
          name: { type: 'string', maxLength: 120 },
          description: { type: 'string', maxLength: 400, nullable: true },
          price: { type: 'number', minimum: 0, nullable: true },
          currency: { type: 'string', maxLength: 8, default: 'MXN' },
          image_url: { type: 'string', maxLength: 600, nullable: true },
          category: { type: 'string', maxLength: 80, nullable: true },
          is_active: { type: 'boolean' },
          sort_order: { type: 'integer' },
        },
        required: ['name'],
      },
      Analytics: {
        type: 'object',
        properties: {
          slug: { type: 'string' },
          metaPixelId: { type: 'string', nullable: true },
          gaMeasurementId: { type: 'string', nullable: true },
          analyticsEnabledAt: { type: 'string', format: 'date-time', nullable: true },
          note: { type: 'string' },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: 'Token inválido o expirado.',
        content: {
          'application/json': { schema: { $ref: '#/components/schemas/Error' } },
        },
      },
      Forbidden: {
        description: 'El token no tiene permiso o el sitio no pertenece al dueño.',
        content: {
          'application/json': { schema: { $ref: '#/components/schemas/Error' } },
        },
      },
      NotFound: {
        description: 'Recurso no encontrado.',
        content: {
          'application/json': { schema: { $ref: '#/components/schemas/Error' } },
        },
      },
    },
  },
  paths: {
    '/api/v1/sites': {
      get: {
        summary: 'Listar mis sitios',
        description: 'Devuelve todos los sitios asociados al dueño del token.',
        tags: ['Sitios'],
        responses: {
          '200': {
            description: 'Lista de sitios.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    sites: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Site' },
                    },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/v1/sites/{siteId}': {
      parameters: [
        {
          name: 'siteId',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
      ],
      get: {
        summary: 'Ver un sitio',
        description: 'Sitio + contenido editable + servicios + horarios.',
        tags: ['Sitios'],
        responses: {
          '200': {
            description: 'Detalle del sitio.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    site: { $ref: '#/components/schemas/Site' },
                    content: { $ref: '#/components/schemas/SiteContent' },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
      patch: {
        summary: 'Editar datos del sitio',
        description:
          'Actualiza contacto, ubicación, "acerca de", horarios y redes sociales. Cualquier campo faltante se conserva sin cambios.',
        tags: ['Sitios'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SiteContent' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Sitio actualizado.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ok: { type: 'boolean' },
                    content: { $ref: '#/components/schemas/SiteContent' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Datos inválidos.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Error' } },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/api/v1/sites/{siteId}/appearance': {
      parameters: [
        {
          name: 'siteId',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
      ],
      patch: {
        summary: 'Editar apariencia',
        description:
          'Cambia colores (hex), emoji, títulos del hero e imágenes de portada del sitio.',
        tags: ['Apariencia'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  primary_color: { type: 'string' },
                  accent_color: { type: 'string' },
                  emoji: { type: 'string', nullable: true },
                  hero_title: { type: 'string', nullable: true },
                  hero_subtitle: { type: 'string', nullable: true },
                  hero_image_url: { type: 'string', nullable: true },
                  about_image_url: { type: 'string', nullable: true },
                  logo_url: { type: 'string', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Apariencia actualizada.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { ok: { type: 'boolean' } },
                },
              },
            },
          },
          '400': {
            description: 'Datos inválidos.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Error' } },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/api/v1/sites/{siteId}/services': {
      parameters: [
        {
          name: 'siteId',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
      ],
      get: {
        summary: 'Listar servicios',
        tags: ['Servicios'],
        responses: {
          '200': {
            description: 'Servicios del sitio.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    services: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Service' },
                    },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
      put: {
        summary: 'Reemplazar servicios',
        description:
          'Reemplaza la lista completa de servicios (máximo 12). Cada uno necesita al menos un nombre.',
        tags: ['Servicios'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Service' },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Servicios guardados.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ok: { type: 'boolean' },
                    services: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Service' },
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Datos inválidos.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Error' } },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/api/v1/sites/{siteId}/products': {
      parameters: [
        {
          name: 'siteId',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
      ],
      get: {
        summary: 'Listar productos',
        tags: ['Catálogo'],
        responses: {
          '200': {
            description: 'Productos del catálogo.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    products: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Product' },
                    },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
      post: {
        summary: 'Crear producto',
        tags: ['Catálogo'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProductInput' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Producto creado.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ok: { type: 'boolean' },
                    product: { $ref: '#/components/schemas/Product' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Datos inválidos.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Error' } },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/api/v1/sites/{siteId}/products/{productId}': {
      parameters: [
        {
          name: 'siteId',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
        {
          name: 'productId',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
      ],
      patch: {
        summary: 'Actualizar producto',
        tags: ['Catálogo'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProductInput' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Producto actualizado.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ok: { type: 'boolean' },
                    product: { $ref: '#/components/schemas/Product' },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        summary: 'Eliminar producto',
        tags: ['Catálogo'],
        responses: {
          '200': {
            description: 'Producto eliminado.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { ok: { type: 'boolean' } },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/api/v1/sites/{siteId}/analytics': {
      parameters: [
        {
          name: 'siteId',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
      ],
      get: {
        summary: 'Configuración de analíticas',
        description:
          'Meta Pixel ID y GA4 Measurement ID del sitio. Las métricas reales viven en Meta Events Manager y Google Analytics.',
        tags: ['Analíticas'],
        responses: {
          '200': {
            description: 'Configuración.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Analytics' },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
  },
  tags: [
    { name: 'Sitios', description: 'Gestión de sitios del dueño.' },
    { name: 'Apariencia', description: 'Colores, imágenes y textos del hero.' },
    { name: 'Servicios', description: 'Lista de servicios/ofertas.' },
    { name: 'Catálogo', description: 'Productos del sitio.' },
    { name: 'Analíticas', description: 'IDs de Meta Pixel y GA4.' },
  ],
} as const

export function GET() {
  return NextResponse.json(spec, {
    headers: {
      // Cachable en el edge — el spec cambia rara vez.
      'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=86400',
      // CORS para que ChatGPT / Claude puedan pedirlo desde su cliente.
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    },
  })
}

export function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    },
  })
}
