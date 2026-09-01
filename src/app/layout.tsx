import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { SITE_URL, BRAND } from '@/features/marketing/brand'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

// Tipografía display premium para los títulos del producto (misma familia que
// usan los sitios generados, para branding consistente).
const playfair = Playfair_Display({
  variable: '--font-display',
  subsets: ['latin'],
  display: 'swap',
  weight: ['500', '600', '700', '800'],
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'MiSitio IA — Tu página web lista para la era de la búsqueda con IA',
    template: '%s | MiSitio IA',
  },
  description:
    'Creamos gratis la página web de tu negocio con IA, optimizada para los nuevos buscadores de IA (ChatGPT, Gemini, Perplexity) y para Google. Victoria, el asistente que atiende y vende por ti 24/7, es el complemento opcional.',
  applicationName: 'MiSitio IA',
  manifest: '/manifest.webmanifest',
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MiSitio IA',
  },
  keywords: [
    'crear página web',
    'sitio web con IA',
    'página web gratis México',
    'página web lista para IA',
    'AEO optimización para buscadores de IA',
    'aparecer en ChatGPT Gemini Perplexity',
    'asistente de ventas IA',
    'chatbot WhatsApp negocio',
    'MiSitio IA',
    'Konnex 24/7',
  ],
  authors: [{ name: BRAND.name }],
  creator: BRAND.name,
  publisher: BRAND.name,
}

export const viewport: Viewport = {
  themeColor: '#ea580c',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  )
}
