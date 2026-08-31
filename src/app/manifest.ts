import type { MetadataRoute } from 'next'

/**
 * PWA manifest del producto MiSitio IA.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MiSitio IA',
    short_name: 'MiSitio IA',
    description:
      'Tu página web con IA y un asistente que atiende y vende por ti 24/7. Empieza gratis.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fdfbf7',
    theme_color: '#ea580c',
    lang: 'es-MX',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
