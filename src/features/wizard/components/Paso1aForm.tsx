'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createPreviewSiteAction } from '../actions'
import { sendMagicLink, signUpWithPassword } from '@/features/editor/actions'
import { GIRO_NOMBRE, GIRO_OTROS } from '@/features/generator/giros'

/**
 * Paso 1a — datos mínimos para generar el preview del sitio.
 *
 * Flujo actualizado 2026-09-09 (fix embudo Meta):
 *
 * 1. La página se renderiza SIEMPRE, con o sin sesión. El copy prometía
 *    "aún no pedimos tus datos" pero el LoginGate previo entregaba lo
 *    contrario y mataba el 100% del tráfico frío. Ahora el usuario llena
 *    nombre + giro + descripción sin obstáculos.
 *
 * 2. Al hacer submit:
 *      - Si isAuthed=true: llama al action normal y salta a paso-1b.
 *      - Si isAuthed=false: guarda el payload en sessionStorage y muestra un
 *        prompt de correo/Google inline ("guardamos lo que escribiste, sólo
 *        falta identificarte"). Después del auth vuelve a /crear/paso-1a y
 *        auto-hidrata + auto-envía en montaje.
 *
 * 3. Auto-envío en montaje: si isAuthed=true y hay draft en sessionStorage,
 *    se rehidrata el estado y se dispara el action UNA vez (borramos el draft
 *    antes para prevenir loop).
 */

const DRAFT_KEY = '_mis_wizard_1a_draft'

interface Draft {
  businessName: string
  giro: string
  giroLibre: string
  descripcion: string
}

const GIROS_ORDERED = Object.entries(GIRO_NOMBRE)
  .filter(([slug]) => slug !== GIRO_OTROS)
  .map(([slug, label]) => ({ slug, label }))
  .sort((a, b) => a.label.localeCompare(b.label, 'es'))

const OTROS_OPTION = { slug: GIRO_OTROS, label: GIRO_NOMBRE[GIRO_OTROS] }

export function Paso1aForm({ isAuthed }: { isAuthed: boolean }) {
  const router = useRouter()
  const [businessName, setBusinessName] = useState('')
  const [giro, setGiro] = useState('')
  const [giroLibre, setGiroLibre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  // Auth prompt inline (aparece tras submit sin sesión)
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)
  const [email, setEmail] = useState('')
  const [magicSent, setMagicSent] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [magicPending, startMagicTransition] = useTransition()

  // Registro con email + contraseña (2026-09-11 — tercera puerta post-signup).
  // 'choose' es la UI por defecto; 'password' abre el sub-form.
  const [authMode, setAuthMode] = useState<'choose' | 'password'>('choose')
  const [password, setPassword] = useState('')
  const [passwordPending, startPasswordTransition] = useTransition()

  const autoSubmittedRef = useRef(false)

  const needsGiroLibre = giro === GIRO_OTROS

  function saveDraft(): Draft {
    const draft: Draft = {
      businessName: businessName.trim(),
      giro,
      giroLibre: giroLibre.trim(),
      descripcion: descripcion.trim(),
    }
    try {
      window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    } catch {
      /* sessionStorage puede fallar en modo privado; el fallback es re-tipear */
    }
    return draft
  }

  function submitPayload(payload: Draft) {
    startTransition(async () => {
      const res = await createPreviewSiteAction({
        business_name: payload.businessName,
        giro: payload.giro || null,
        giro_libre: payload.giro === GIRO_OTROS ? payload.giroLibre : null,
        descripcion: payload.descripcion || null,
      })
      if (res.ok && res.siteId) {
        // Limpiamos el draft — ya se persistió como site real.
        try {
          window.sessionStorage.removeItem(DRAFT_KEY)
        } catch {
          /* ok */
        }
        router.push(`/crear/paso-1b?site=${res.siteId}`)
      } else {
        setError(res.error ?? 'No se pudo crear la vista previa.')
      }
    })
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setAuthError(null)
    if (needsGiroLibre && giroLibre.trim().length < 3) {
      setError('Describe brevemente tu giro (mínimo 3 caracteres).')
      return
    }
    const draft = saveDraft()
    if (!isAuthed) {
      // Sin sesión: mostrar prompt inline y esperar login. El auto-submit
      // ocurre al volver a esta misma ruta con sesión.
      setShowAuthPrompt(true)
      return
    }
    submitPayload(draft)
  }

  function submitMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setAuthError(null)
    saveDraft() // asegurar que el draft esté persistido antes de salir
    startMagicTransition(async () => {
      const res = await sendMagicLink(email, '/crear/paso-1a')
      if (res.ok) setMagicSent(true)
      else setAuthError(res.error || 'No se pudo enviar el enlace.')
    })
  }

  function submitPasswordSignup(e: React.FormEvent) {
    e.preventDefault()
    setAuthError(null)
    saveDraft() // preserva el draft antes de que router refresque
    startPasswordTransition(async () => {
      const res = await signUpWithPassword(email, password)
      if (!res.ok) {
        setAuthError(res.error || 'No se pudo crear la cuenta.')
        return
      }
      // Sesión activa (cookies puestas). Un refresh del router re-renderea el
      // Server Component con isAuthed=true → el useEffect abajo re-hidrata el
      // draft y auto-envía el paso 1a.
      router.refresh()
    })
  }

  // Rehidratación + auto-submit al volver del auth.
  useEffect(() => {
    if (autoSubmittedRef.current) return
    let raw: string | null = null
    try {
      raw = window.sessionStorage.getItem(DRAFT_KEY)
    } catch {
      return
    }
    if (!raw) return
    try {
      const parsed = JSON.parse(raw) as Partial<Draft>
      if (typeof parsed.businessName === 'string') setBusinessName(parsed.businessName)
      if (typeof parsed.giro === 'string') setGiro(parsed.giro)
      if (typeof parsed.giroLibre === 'string') setGiroLibre(parsed.giroLibre)
      if (typeof parsed.descripcion === 'string') setDescripcion(parsed.descripcion)
      // Si YA está autenticado y hay draft válido, auto-envía inmediatamente.
      if (
        isAuthed &&
        typeof parsed.businessName === 'string' &&
        parsed.businessName.trim().length >= 2
      ) {
        autoSubmittedRef.current = true
        const clean: Draft = {
          businessName: parsed.businessName.trim(),
          giro: (parsed.giro ?? '') as string,
          giroLibre: (parsed.giroLibre ?? '') as string,
          descripcion: (parsed.descripcion ?? '') as string,
        }
        submitPayload(clean)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthed])

  return (
    <div className="mx-auto max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-5xl font-medium text-neutral-900 tracking-tight mb-3">
          Empecemos con lo básico
        </h1>
        <p className="text-stone-600 text-base md:text-lg">
          En 30 segundos tendrás tu sitio listo para ver. Todavía no publicamos nada — es solo tu preview.
        </p>
      </div>

      <form
        onSubmit={submit}
        className="bg-white rounded-3xl shadow-xl border border-stone-200 p-6 md:p-10 space-y-6"
      >
        <div>
          <label htmlFor="business_name" className="block text-sm font-semibold text-neutral-900 mb-2">
            ¿Cómo se llama tu negocio?
          </label>
          <input
            id="business_name"
            type="text"
            required
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="Ej. Herrería San Juan"
            maxLength={120}
            className="w-full rounded-xl border border-stone-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        <div>
          <label htmlFor="giro" className="block text-sm font-semibold text-neutral-900 mb-2">
            ¿A qué se dedica?
          </label>
          <select
            id="giro"
            value={giro}
            onChange={(e) => setGiro(e.target.value)}
            className="w-full rounded-xl border border-stone-300 px-4 py-3 text-base bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="">Selecciona tu giro (opcional)</option>
            {GIROS_ORDERED.map((g) => (
              <option key={g.slug} value={g.slug}>
                {g.label}
              </option>
            ))}
            <option key={OTROS_OPTION.slug} value={OTROS_OPTION.slug}>
              {OTROS_OPTION.label}
            </option>
          </select>
          <p className="text-xs text-stone-500 mt-2">
            Si no aparece exactamente, elige el más parecido o usa &ldquo;Otros&rdquo; para describirlo.
          </p>
        </div>

        {needsGiroLibre && (
          <div>
            <label htmlFor="giro_libre" className="block text-sm font-semibold text-neutral-900 mb-2">
              Describe tu giro
            </label>
            <input
              id="giro_libre"
              type="text"
              value={giroLibre}
              onChange={(e) => setGiroLibre(e.target.value)}
              placeholder="Ej. clínica de acupuntura, correduría pública, tienda naturista"
              maxLength={80}
              className="w-full rounded-xl border border-orange-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            <p className="text-xs text-stone-500 mt-2">
              Escríbelo en 3–8 palabras. Lo usamos para que las imágenes de IA se vean apropiadas a tu giro.
            </p>
          </div>
        )}

        <div>
          <label htmlFor="descripcion" className="block text-sm font-semibold text-neutral-900 mb-2">
            Cuéntanos brevemente qué vendes o qué haces
          </label>
          <textarea
            id="descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Ej. Fabricamos rejas, portones y protecciones a la medida en Monterrey."
            rows={4}
            maxLength={600}
            className="w-full rounded-xl border border-stone-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-y"
          />
          <p className="text-xs text-stone-500 mt-2 text-right">{descripcion.length}/600</p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={pending || businessName.trim().length < 2}
          className="w-full rounded-xl bg-neutral-900 text-white font-semibold py-3.5 text-base hover:bg-neutral-800 disabled:opacity-50 transition-colors"
        >
          {pending ? 'Creando tu preview…' : 'Crear mi preview →'}
        </button>

        <p className="text-xs text-stone-500 text-center">
          {isAuthed
            ? 'Aún no pediremos tus datos de contacto. Solo queremos que veas cómo se verá tu sitio.'
            : 'Al continuar te pediremos sólo tu correo para poder guardar tu sitio (sin contraseñas).'}
        </p>
      </form>

      {showAuthPrompt && !isAuthed && (
        <div className="mt-6 bg-white rounded-3xl shadow-xl border border-stone-200 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-medium text-neutral-900 mb-2">
            Ya casi está listo tu preview
          </h2>
          <p className="text-sm text-stone-600 mb-5">
            Guardamos lo que escribiste. Sólo necesitamos tu correo para poder mostrártelo
            (sin contraseñas). Te tomará 10 segundos.
          </p>

          {magicSent ? (
            <div className="text-center bg-green-50 border border-green-100 rounded-2xl p-5">
              <div className="text-3xl mb-2">📬</div>
              <p className="text-green-800 font-medium">Revisa tu correo</p>
              <p className="text-green-700 text-sm mt-1">
                Te enviamos un enlace a <strong>{email}</strong>. Ábrelo desde este mismo dispositivo
                y regresarás aquí para ver tu sitio.
              </p>
            </div>
          ) : authMode === 'password' ? (
            <form onSubmit={submitPasswordSignup} className="space-y-3">
              <div>
                <label htmlFor="signup_email" className="block text-sm font-semibold text-neutral-900 mb-1.5">
                  Tu correo
                </label>
                <input
                  id="signup_email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none"
                />
              </div>
              <div>
                <label htmlFor="signup_password" className="block text-sm font-semibold text-neutral-900 mb-1.5">
                  Crea una contraseña
                </label>
                <input
                  id="signup_password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none"
                />
                <p className="text-xs text-stone-500 mt-1.5">
                  Guárdala — la usarás para volver a entrar a editar tu sitio.
                </p>
              </div>
              {authError && <p className="text-red-600 text-sm">{authError}</p>}
              <button
                type="submit"
                disabled={passwordPending || password.length < 8}
                className="w-full bg-neutral-900 text-white font-semibold py-3 rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-60"
              >
                {passwordPending ? 'Creando cuenta…' : 'Crear cuenta y ver mi sitio'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('choose')
                  setAuthError(null)
                }}
                className="w-full text-sm text-stone-500 hover:text-neutral-900 underline underline-offset-4"
              >
                ← Volver a las otras opciones
              </button>
            </form>
          ) : (
            <>
              <a
                href={`/auth/google?next=${encodeURIComponent('/crear/paso-1a')}`}
                onClick={() => saveDraft()}
                className="w-full flex items-center justify-center gap-3 bg-white border border-stone-300 text-neutral-900 font-medium py-3 rounded-xl hover:bg-stone-50 transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                  <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z" />
                  <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z" />
                  <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z" />
                  <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.42 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z" />
                </svg>
                Continuar con Google
              </a>

              <div className="flex items-center gap-3 my-4">
                <span className="h-px flex-1 bg-stone-200" />
                <span className="text-xs text-stone-400">o con tu correo</span>
                <span className="h-px flex-1 bg-stone-200" />
              </div>

              <form onSubmit={submitMagicLink} className="space-y-3">
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none"
                />
                {authError && <p className="text-red-600 text-sm">{authError}</p>}
                <button
                  type="submit"
                  disabled={magicPending}
                  className="w-full bg-neutral-900 text-white font-semibold py-3 rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-60"
                >
                  {magicPending ? 'Enviando…' : 'Enviar enlace y ver mi sitio'}
                </button>
              </form>

              <div className="flex items-center gap-3 my-4">
                <span className="h-px flex-1 bg-stone-200" />
                <span className="text-xs text-stone-400">o crea una contraseña</span>
                <span className="h-px flex-1 bg-stone-200" />
              </div>

              <button
                type="button"
                onClick={() => {
                  setAuthError(null)
                  setAuthMode('password')
                }}
                className="w-full flex items-center justify-center gap-3 bg-white border border-stone-300 text-neutral-900 font-medium py-3 rounded-xl hover:bg-stone-50 transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="10" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Crear cuenta con contraseña
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
