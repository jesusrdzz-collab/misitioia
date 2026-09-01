/**
 * Snippet universal de MiSitio IA (Fase 8).
 *
 * JavaScript VANILLA (sin React) que corre en sitios AJENOS. Se sirve como
 * texto estático desde /embed/v1.js. Al cargar:
 *   1. Lee su token de data-site y su origen del src del propio <script>.
 *   2. Inyecta el widget de Victoria (burbuja + panel) en un Shadow DOM para
 *      aislar los estilos del sitio anfitrión.
 *   3. Recolecta señales de la página y las POSTea a /api/audit (auditoría AEO).
 *   4. El chat habla con /api/webchat (CORS abierto).
 *
 * NO modifica el sitio del cliente: solo agrega el widget y lee el DOM.
 *
 * Nota de implementación: se mantiene como string estático (sin backticks ni
 * ${} internos) para servirse tal cual; la base de la API se deriva en runtime
 * del src del script, no se interpola en build.
 */
export const EMBED_SCRIPT = `(function () {
  "use strict";
  try {
    var me = document.currentScript;
    if (!me) {
      var all = document.querySelectorAll('script[data-site]');
      me = all[all.length - 1];
    }
    if (!me) return;
    var TOKEN = me.getAttribute('data-site') || '';
    if (!TOKEN) { console.warn('[MiSitio IA] Falta data-site en el snippet.'); return; }
    var BASE = new URL(me.src, location.href).origin;
    if (window.__misitioIALoaded) return;
    window.__misitioIALoaded = true;

    /* ---------- Auditoría AEO (read-only) ---------- */
    function collectSignals() {
      function metaContent(sel) {
        var el = document.querySelector(sel);
        return el ? (el.getAttribute('content') || '').trim() : null;
      }
      function texts(sel, n) {
        var out = [];
        var nodes = document.querySelectorAll(sel);
        for (var i = 0; i < nodes.length && out.length < n; i++) {
          var t = (nodes[i].textContent || '').replace(/\\s+/g, ' ').trim();
          if (t) out.push(t.slice(0, 140));
        }
        return out;
      }
      var jsonLdTypes = [];
      var ld = document.querySelectorAll('script[type="application/ld+json"]');
      for (var i = 0; i < ld.length; i++) {
        try {
          var parsed = JSON.parse(ld[i].textContent || '{}');
          var arr = Array.isArray(parsed) ? parsed : [parsed];
          for (var j = 0; j < arr.length; j++) {
            var ty = arr[j] && arr[j]['@type'];
            if (ty) jsonLdTypes.push(String(Array.isArray(ty) ? ty[0] : ty));
          }
        } catch (e) {}
      }
      var bodyText = (document.body ? document.body.innerText || '' : '').replace(/\\s+/g, ' ').trim();
      var canonicalEl = document.querySelector('link[rel="canonical"]');
      return {
        url: location.href,
        origin: location.origin,
        title: (document.title || '').trim() || null,
        metaDescription: metaContent('meta[name="description"]'),
        canonical: canonicalEl ? canonicalEl.getAttribute('href') : null,
        lang: document.documentElement.getAttribute('lang') || null,
        h1: texts('h1', 5),
        h2: texts('h2', 12),
        jsonLdCount: ld.length,
        jsonLdTypes: jsonLdTypes,
        hasViewport: !!document.querySelector('meta[name="viewport"]'),
        hasOgTitle: !!metaContent('meta[property="og:title"]'),
        hasOgImage: !!metaContent('meta[property="og:image"]'),
        isHttps: location.protocol === 'https:',
        wordCount: bodyText ? bodyText.split(' ').length : 0,
        textSample: bodyText.slice(0, 1500)
      };
    }

    function runAudit() {
      var signals = collectSignals();
      var finish = function () {
        try {
          fetch(BASE + '/api/audit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: TOKEN, url: signals.url, signals: signals })
          }).catch(function () {});
        } catch (e) {}
      };
      /* llms.txt es del mismo origen que el sitio anfitrión: se puede consultar. */
      try {
        fetch(location.origin + '/llms.txt', { method: 'HEAD' })
          .then(function (r) { signals.hasLlmsTxt = !!(r && r.ok); finish(); })
          .catch(function () { signals.hasLlmsTxt = false; finish(); });
      } catch (e) { signals.hasLlmsTxt = false; finish(); }
    }

    /* ---------- Widget de Victoria (Shadow DOM) ---------- */
    var host = document.createElement('div');
    host.setAttribute('data-misitio-ia', '1');
    var shadow = host.attachShadow ? host.attachShadow({ mode: 'open' }) : host;
    document.body.appendChild(host);

    var css = ''
      + ':host,*{box-sizing:border-box}'
      + '.wrap{position:fixed;bottom:20px;right:20px;z-index:2147483000;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}'
      + '.bubble{width:60px;height:60px;border-radius:50%;background:#ea580c;color:#fff;border:none;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.25);font-size:26px;display:flex;align-items:center;justify-content:center;transition:transform .15s}'
      + '.bubble:hover{transform:scale(1.06)}'
      + '.panel{position:absolute;bottom:76px;right:0;width:340px;max-width:calc(100vw - 32px);height:480px;max-height:calc(100vh - 120px);background:#fff;border-radius:18px;box-shadow:0 16px 48px rgba(0,0,0,.3);display:none;flex-direction:column;overflow:hidden}'
      + '.panel.open{display:flex}'
      + '.hd{background:#ea580c;color:#fff;padding:14px 16px;font-weight:600;display:flex;align-items:center;gap:8px}'
      + '.hd .dot{width:8px;height:8px;border-radius:50%;background:#4ade80}'
      + '.hd .x{margin-left:auto;background:transparent;border:none;color:#fff;font-size:20px;cursor:pointer;line-height:1}'
      + '.msgs{flex:1;overflow-y:auto;padding:14px;background:#f8fafc;display:flex;flex-direction:column;gap:10px}'
      + '.m{max-width:82%;padding:9px 12px;border-radius:14px;font-size:14px;line-height:1.4;white-space:pre-wrap;word-wrap:break-word}'
      + '.m.bot{background:#fff;border:1px solid #e5e7eb;color:#111827;align-self:flex-start;border-bottom-left-radius:4px}'
      + '.m.usr{background:#ea580c;color:#fff;align-self:flex-end;border-bottom-right-radius:4px}'
      + '.m.typing{color:#6b7280;font-style:italic}'
      + '.ft{display:flex;gap:8px;padding:10px;border-top:1px solid #e5e7eb;background:#fff}'
      + '.ft input{flex:1;border:1px solid #d1d5db;border-radius:10px;padding:10px 12px;font-size:14px;outline:none}'
      + '.ft input:focus{border-color:#ea580c}'
      + '.ft button{background:#ea580c;color:#fff;border:none;border-radius:10px;padding:0 14px;cursor:pointer;font-size:16px}'
      + '.ft button:disabled{opacity:.5;cursor:default}'
      + '.brand{text-align:center;font-size:11px;color:#9ca3af;padding:4px}'
      + '.brand a{color:#9ca3af;text-decoration:none}';

    var style = document.createElement('style');
    style.textContent = css;
    shadow.appendChild(style);

    var wrap = document.createElement('div');
    wrap.className = 'wrap';
    wrap.innerHTML = ''
      + '<div class="panel" part="panel">'
      + '  <div class="hd"><span class="dot"></span><span>Victoria</span><button class="x" aria-label="Cerrar">&times;</button></div>'
      + '  <div class="msgs"></div>'
      + '  <div class="brand">con <a href="' + BASE + '" target="_blank" rel="noopener">MiSitio IA</a></div>'
      + '  <form class="ft"><input type="text" placeholder="Escribe tu mensaje..." autocomplete="off"/><button type="submit" aria-label="Enviar">&#10148;</button></form>'
      + '</div>'
      + '<button class="bubble" aria-label="Abrir chat">&#128172;</button>';
    shadow.appendChild(wrap);

    var panel = wrap.querySelector('.panel');
    var bubble = wrap.querySelector('.bubble');
    var closeBtn = wrap.querySelector('.x');
    var msgs = wrap.querySelector('.msgs');
    var form = wrap.querySelector('.ft');
    var input = wrap.querySelector('.ft input');
    var sendBtn = wrap.querySelector('.ft button');

    var history = [];
    var greeted = false;

    function addMsg(text, who, extraClass) {
      var d = document.createElement('div');
      d.className = 'm ' + (who === 'usr' ? 'usr' : 'bot') + (extraClass ? ' ' + extraClass : '');
      d.textContent = text;
      msgs.appendChild(d);
      msgs.scrollTop = msgs.scrollHeight;
      return d;
    }

    function openPanel() {
      panel.classList.add('open');
      if (!greeted) {
        greeted = true;
        addMsg('¡Hola! Soy Victoria. ¿En qué te puedo ayudar?', 'bot');
      }
      setTimeout(function () { input.focus(); }, 50);
    }
    function closePanel() { panel.classList.remove('open'); }

    bubble.addEventListener('click', function () {
      if (panel.classList.contains('open')) closePanel(); else openPanel();
    });
    closeBtn.addEventListener('click', closePanel);

    function send(text) {
      addMsg(text, 'usr');
      history.push({ role: 'user', content: text });
      input.value = '';
      sendBtn.disabled = true;
      var typing = addMsg('Victoria está escribiendo...', 'bot', 'typing');
      fetch(BASE + '/api/webchat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: TOKEN, url: location.href, messages: history })
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          typing.remove();
          var reply = (data && data.reply) ? data.reply : 'Perdón, no pude responder ahora. Intenta de nuevo.';
          addMsg(reply, 'bot');
          history.push({ role: 'assistant', content: reply });
        })
        .catch(function () {
          typing.remove();
          addMsg('Perdón, hubo un problema de conexión.', 'bot');
        })
        .then(function () { sendBtn.disabled = false; input.focus(); });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var text = (input.value || '').trim();
      if (text) send(text);
    });

    /* Correr auditoría una vez que la página esté lista. */
    if (document.readyState === 'complete') {
      setTimeout(runAudit, 800);
    } else {
      window.addEventListener('load', function () { setTimeout(runAudit, 800); });
    }
  } catch (e) {
    try { console.warn('[MiSitio IA] embed error', e); } catch (_) {}
  }
})();
`
