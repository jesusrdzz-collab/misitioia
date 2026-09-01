'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LogoMark } from '@/features/marketing/components/Logo'
import { signOut } from '@/features/editor/actions'

/**
 * Esqueleto del panel del cliente: sidebar de navegación a la izquierda
 * (drawer superpuesto en móvil) + área de contenido.
 *
 * Los enlaces llevan `?site=<id>` para que cada sección resuelva el mismo sitio
 * activo sin ambigüedad (igual que /editar).
 */

export type DashboardSection = 'sitio' | 'datos' | 'instalar' | 'dominio' | 'plan'

interface NavItem {
  key: DashboardSection
  label: string
  icon: string
  href: string
}

interface Props {
  active: DashboardSection
  siteId: string
  slug: string
  businessName: string
  children: React.ReactNode
}

export function DashboardShell({ active, siteId, slug, businessName, children }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  const q = `?site=${encodeURIComponent(siteId)}`
  const nav: NavItem[] = [
    { key: 'sitio', label: 'Mi sitio', icon: '🖥️', href: `/editar${q}` },
    { key: 'datos', label: 'Datos de Victoria', icon: '🤖', href: `/editar/datos${q}` },
    { key: 'instalar', label: 'Instalar en mi web', icon: '🧩', href: '/instalar' },
    { key: 'dominio', label: 'Conectar dominio', icon: '🌐', href: `/editar/dominio${q}` },
    { key: 'plan', label: 'Mi plan', icon: '💳', href: `/editar/plan${q}` },
  ]

  const SidebarBody = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-gray-100">
        <LogoMark className="h-9 w-9 shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{businessName}</p>
          <p className="text-xs text-gray-400 truncate">{slug}.misitio.site</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {nav.map((item) => {
          const isActive = item.key === active
          return (
            <Link
              key={item.key}
              href={item.href}
              onClick={() => setDrawerOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="text-lg" aria-hidden>{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-gray-100 p-3 space-y-1">
        <a
          href={`/sites/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        >
          <span className="text-lg" aria-hidden>↗</span>
          <span>Ver mi sitio</span>
        </a>
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            <span className="text-lg" aria-hidden>🚪</span>
            <span>Salir</span>
          </button>
        </form>
      </div>
    </div>
  )

  return (
    <div className="min-h-[100dvh] bg-gray-50 md:flex">
      {/* Sidebar escritorio */}
      <aside className="hidden md:flex md:w-60 md:shrink-0 md:flex-col md:border-r md:border-gray-100 md:bg-white md:h-[100dvh] md:sticky md:top-0">
        {SidebarBody}
      </aside>

      {/* Barra superior móvil */}
      <header className="md:hidden sticky top-0 z-30 flex h-14 items-center justify-between border-b border-gray-100 bg-white px-4">
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Abrir menú"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
        >
          <span className="text-lg">☰</span>
        </button>
        <div className="flex items-center gap-2 min-w-0">
          <LogoMark className="h-7 w-7 shrink-0" />
          <span className="text-sm font-semibold text-gray-900 truncate">{businessName}</span>
        </div>
        <span className="w-10" aria-hidden />
      </header>

      {/* Drawer móvil */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
          <div className="relative z-10 flex h-full w-72 max-w-[80%] flex-col bg-white shadow-xl">
            <button
              onClick={() => setDrawerOpen(false)}
              aria-label="Cerrar menú"
              className="absolute right-3 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100"
            >
              ✕
            </button>
            {SidebarBody}
          </div>
        </div>
      )}

      {/* Contenido */}
      <main className="flex-1 min-w-0">
        <div className="mx-auto w-full max-w-4xl p-4 md:p-8">{children}</div>
      </main>
    </div>
  )
}
