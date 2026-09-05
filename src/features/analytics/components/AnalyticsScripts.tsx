import Script from 'next/script'

/**
 * Inyecta los scripts de Meta Pixel y Google Analytics 4 en el layout del sitio
 * publicado.
 *
 * Consentimiento (LFPDPPP + politica de la fabrica):
 *  - Meta Pixel se carga con consent revoke por defecto y el PageView se
 *    difiere: se emite solo cuando el visitante acepta las cookies (evento
 *    "cookie-consent-changed" con detail granted). Si el consentimiento ya
 *    estaba dado en localStorage, se emite un evento inicial que otorga el
 *    consentimiento inmediatamente.
 *  - GA4 usa el Consent Mode v2: por defecto analytics_storage=denied (y
 *    tambien los publicitarios). Al aceptar cookies se hace update granted
 *    y se dispara el page_view.
 *
 * Nada de esto se renderiza si el sitio no debe tener analiticas (el layout
 * decide antes: plan != free Y algun ID configurado).
 */

interface Props {
  metaPixelId: string | null
  gaMeasurementId: string | null
}

// Defensa en profundidad: escapa cualquier caracter que pudiera romper el
// script inline. Los IDs ya vienen validados por Zod contra un regex estricto.
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

export function AnalyticsScripts({ metaPixelId, gaMeasurementId }: Props) {
  if (!metaPixelId && !gaMeasurementId) return null

  const parts: string[] = []

  // Estado inicial de consentimiento (leemos localStorage antes de todo).
  parts.push(`
(function(){
  try {
    var stored = null;
    try { stored = window.localStorage && window.localStorage.getItem('cookieConsent'); } catch(e) {}
    var initialGranted = stored === 'granted';
    window.__msConsent = { granted: initialGranted };
    var evt = new CustomEvent('cookie-consent-changed', { detail: { granted: initialGranted } });
    window.dispatchEvent(evt);
  } catch (e) {}
})();
`)

  if (metaPixelId) {
    const id = safeJsString(metaPixelId)
    parts.push(`
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbev' + 'ents.js');
fbq('consent', 'revoke');
fbq('init', '${id}');
(function(){
  function grant() {
    try { fbq('consent', 'grant'); fbq('track', 'PageView'); } catch(e) {}
  }
  if (window.__msConsent && window.__msConsent.granted) grant();
  window.addEventListener('cookie-consent-changed', function(e){
    if (e && e.detail && e.detail.granted) grant();
  });
})();
`)
  }

  if (gaMeasurementId) {
    const id = safeJsString(gaMeasurementId)
    parts.push(`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);} window.gtag = gtag;
gtag('consent', 'default', {
  'ad_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied',
  'analytics_storage': 'denied',
  'wait_for_update': 500
});
gtag('js', new Date());
gtag('config', '${id}', { 'send_page_view': false, 'anonymize_ip': true });
(function(){
  function grant() {
    try {
      gtag('consent', 'update', {
        'ad_storage': 'granted',
        'ad_user_data': 'granted',
        'ad_personalization': 'granted',
        'analytics_storage': 'granted'
      });
      gtag('event', 'page_view');
    } catch(e) {}
  }
  if (window.__msConsent && window.__msConsent.granted) grant();
  window.addEventListener('cookie-consent-changed', function(e){
    if (e && e.detail && e.detail.granted) grant();
  });
})();
`)
  }

  return (
    <>
      <Script id="ms-analytics-init" strategy="afterInteractive">
        {parts.join('\n')}
      </Script>
      {gaMeasurementId && (
        <Script
          id="ms-ga-src"
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaMeasurementId)}`}
        />
      )}
      {metaPixelId && (
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            alt=""
            src={`https://www.facebook.com/tr?id=${encodeURIComponent(metaPixelId)}&ev=PageView&noscript=1`}
          />
        </noscript>
      )}
    </>
  )
}
