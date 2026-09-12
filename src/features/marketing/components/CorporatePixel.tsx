import Script from 'next/script'

/**
 * Meta Pixel corporativo — instrumentación de la app raíz `misitio.site`.
 *
 * Este pixel es el de la FÁBRICA (MiSitio, ID `2004614526913198`), NO el de
 * cada tenant/cliente. Se usa para trackear el funnel de la campaña de Meta
 * Ads: home → /crear/paso-1a → /crear/paso-1b → registro → tenant creado.
 *
 * El pixel de cada cliente se inyecta con `AnalyticsScripts.tsx` en los sitios
 * publicados de los tenants. No confundir.
 *
 * Consentimiento (LFPDPPP + política de la fábrica):
 *  - Se carga con `consent revoke` por defecto y el `PageView` se difiere.
 *  - Sólo se otorga consentimiento cuando `window.__msConsent.granted === true`
 *    o cuando llega el evento `cookie-consent-changed` con `detail.granted`.
 *  - Compatible con `CookieConsentBanner` que dispara el mismo evento.
 *
 * Si `NEXT_PUBLIC_META_PIXEL_ID_CORP` no está en env, el componente no
 * renderiza nada (fail-safe, no rompe la app).
 *
 * Los eventos custom `Lead` y `CompleteRegistration` se disparan desde los
 * puntos de conversión del funnel — ver `Paso1aForm.tsx` y `Paso3Images.tsx`.
 * Usar el patrón seguro:
 *   try { window.fbq && window.fbq('track', 'Lead') } catch(e) {}
 */

// Defensa en profundidad: escapa cualquier caracter que pudiera romper el
// script inline. El ID ya viene de env y es numérico, pero por si acaso.
function safeJsString(v: string): string {
  let out = ''
  for (let i = 0; i < v.length; i++) {
    const code = v.charCodeAt(i)
    const ch = v[i]
    const isSafe =
      (code >= 0x30 && code <= 0x39) || // 0-9
      (code >= 0x41 && code <= 0x5a) || // A-Z
      (code >= 0x61 && code <= 0x7a) || // a-z
      ch === '-' ||
      ch === '_'
    if (isSafe) {
      out += ch
    } else {
      out += `\\u${code.toString(16).padStart(4, '0')}`
    }
  }
  return out
}

export function CorporatePixel() {
  const rawId = process.env.NEXT_PUBLIC_META_PIXEL_ID_CORP
  if (!rawId || rawId.trim().length === 0) return null

  const id = safeJsString(rawId.trim())

  // Estado inicial de consentimiento + bootstrap del pixel. Un solo bloque
  // para que el orden sea determinístico (primero __msConsent, luego fbq).
  const bootstrap = `
(function(){
  try {
    if (!window.__msConsent) {
      var stored = null;
      try { stored = window.localStorage && window.localStorage.getItem('cookieConsent'); } catch(e) {}
      var initialGranted = stored === 'granted';
      window.__msConsent = { granted: initialGranted };
      var evt = new CustomEvent('cookie-consent-changed', { detail: { granted: initialGranted } });
      window.dispatchEvent(evt);
    }
  } catch (e) {}
})();
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbev' + 'ents.js');
try { fbq('consent', 'revoke'); } catch(e) {}
try { fbq('init', '${id}'); } catch(e) {}
(function(){
  function grant() {
    try { fbq('consent', 'grant'); fbq('track', 'PageView'); } catch(e) {}
  }
  if (window.__msConsent && window.__msConsent.granted) grant();
  window.addEventListener('cookie-consent-changed', function(e){
    if (e && e.detail && e.detail.granted) grant();
  });
})();
`

  return (
    <>
      <Script id="ms-corp-pixel" strategy="afterInteractive">
        {bootstrap}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          alt=""
          src={`https://www.facebook.com/tr?id=${encodeURIComponent(rawId.trim())}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  )
}
