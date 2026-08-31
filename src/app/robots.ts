import type { MetadataRoute } from 'next'
import { ROOT_DOMAIN } from '@/lib/domain'

/**
 * robots.txt a nivel plataforma.
 *
 * - Permite explícitamente los bots de IA (GPTBot, ClaudeBot, PerplexityBot,
 *   etc.) para AEO — que ChatGPT/Perplexity/Claude/Gemini puedan leer y citar
 *   los sitios de negocios.
 * - Bloquea rutas internas (API, panel, baja, registro/login).
 * - El gating por estado del sitio (generado = noindex) vive en el `meta robots`
 *   de cada página; robots.txt no puede distinguir por status.
 * - Apunta al sitemap (solo sitios reclamados/activos).
 */
const AI_BOTS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-Web',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
  'cohere-ai',
  'Bytespider',
  'Amazonbot',
  'Meta-ExternalAgent',
]

const DISALLOW = ['/api/', '/login', '/registro', '/baja/', '/app/', '/admin/']

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: DISALLOW },
      ...AI_BOTS.map((bot) => ({ userAgent: bot, allow: '/', disallow: DISALLOW })),
    ],
    sitemap: `https://${ROOT_DOMAIN}/sitemap.xml`,
    host: `https://${ROOT_DOMAIN}`,
  }
}
