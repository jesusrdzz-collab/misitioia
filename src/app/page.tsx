import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <header className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMS41IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDgpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI2cpIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+')] opacity-50" />
        <nav className="relative z-10 max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌐</span>
            <span className="text-xl font-bold text-white">MiSitio IA</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-blue-100 hover:text-white transition-colors"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/registro"
              className="text-sm bg-white text-blue-700 px-4 py-2 rounded-full font-medium hover:bg-blue-50 transition-colors"
            >
              Empieza gratis
            </Link>
          </div>
        </nav>

        <div className="relative z-10 max-w-4xl mx-auto px-4 py-20 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/30 border border-blue-400/30 rounded-full text-blue-100 text-sm mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Creado con inteligencia artificial
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
            Tu página web lista
            <br />
            <span className="text-blue-200">en minutos, no en semanas</span>
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-10">
            Generamos la página web de tu negocio con IA. Sin diseñadores,
            sin programadores, sin esperar. Publicada y lista para recibir clientes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/registro"
              className="w-full sm:w-auto bg-white text-blue-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-colors shadow-lg shadow-blue-900/20"
            >
              Crear mi sitio gratis →
            </Link>
            <Link
              href="#planes"
              className="w-full sm:w-auto border border-blue-400/40 text-white px-8 py-4 rounded-xl font-medium text-lg hover:bg-blue-600/30 transition-colors"
            >
              Ver planes
            </Link>
          </div>
        </div>
      </header>

      {/* Cómo funciona */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
            ¿Cómo funciona?
          </h2>
          <p className="text-center text-gray-500 mb-16 max-w-xl mx-auto">
            Tres pasos. Cero complicaciones.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                emoji: '🤖',
                title: 'La IA genera tu sitio',
                desc: 'Usamos la información pública de tu negocio para crear tu página automáticamente.',
              },
              {
                step: '2',
                emoji: '✏️',
                title: 'Tú lo personalizas',
                desc: 'Reclama tu sitio, edita textos, agrega productos y ajusta los detalles.',
              },
              {
                step: '3',
                emoji: '🚀',
                title: 'Publicado al instante',
                desc: 'Tu página queda en tu-negocio.misitioia.com lista para compartir con tus clientes.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative text-center p-8 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {item.step}
                </div>
                <div className="text-4xl mb-4 mt-2">{item.emoji}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Planes */}
      <section id="planes" className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
            Planes simples, sin letra chiquita
          </h2>
          <p className="text-center text-gray-500 mb-16 max-w-xl mx-auto">
            Empieza gratis. Crece cuando lo necesites.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Gratis */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 flex flex-col">
              <div className="text-sm font-medium text-gray-500 mb-2">GRATIS</div>
              <div className="text-4xl font-bold text-gray-900 mb-1">$0</div>
              <div className="text-sm text-gray-400 mb-6">por siempre</div>
              <ul className="space-y-3 text-gray-600 mb-8 flex-1">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  Página web estática con tu info
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  Subdominio tu-negocio.misitioia.com
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  Edición básica de contenido
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  Catálogo de productos
                </li>
              </ul>
              <Link
                href="/registro"
                className="block text-center py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Empezar gratis
              </Link>
            </div>

            {/* Nivel 2 */}
            <div className="bg-white rounded-2xl p-8 border-2 border-blue-500 flex flex-col relative shadow-xl shadow-blue-100">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                POPULAR
              </div>
              <div className="text-sm font-medium text-blue-600 mb-2">NIVEL 2</div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-bold text-gray-900">$349</span>
                <span className="text-lg text-gray-500">MXN</span>
              </div>
              <div className="text-sm text-gray-400 mb-6">por mes</div>
              <ul className="space-y-3 text-gray-600 mb-8 flex-1">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  Todo lo del plan gratis
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">★</span>
                  <span className="font-medium">Asistente de IA</span> que contesta por ti
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">★</span>
                  <span className="font-medium">Chat en vivo</span> en tu página
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">★</span>
                  CRM: ve quién te escribió
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">★</span>
                  Relevo humano cuando tú quieras
                </li>
              </ul>
              <Link
                href="/registro?plan=nivel_2"
                className="block text-center py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
              >
                Activar Nivel 2
              </Link>
            </div>

            {/* Nivel 3 */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 flex flex-col">
              <div className="text-sm font-medium text-gray-500 mb-2">NIVEL 3</div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-bold text-gray-900">$699</span>
                <span className="text-lg text-gray-500">MXN</span>
              </div>
              <div className="text-sm text-gray-400 mb-6">por mes</div>
              <ul className="space-y-3 text-gray-600 mb-8 flex-1">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  Todo lo del Nivel 2
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">★</span>
                  <span className="font-medium">Dominio propio</span> (tunegocio.com)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">★</span>
                  <span className="font-medium">WhatsApp integrado</span> con IA
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">★</span>
                  Conversaciones ilimitadas
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">★</span>
                  Soporte prioritario
                </li>
              </ul>
              <Link
                href="/registro?plan=nivel_3"
                className="block text-center py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Activar Nivel 3
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-900 text-gray-400">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌐</span>
            <span className="text-sm font-medium text-white">MiSitio IA</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacidad
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Términos
            </Link>
          </div>
          <div className="text-sm">
            © {new Date().getFullYear()} MiSitio IA
          </div>
        </div>
      </footer>
    </div>
  )
}
