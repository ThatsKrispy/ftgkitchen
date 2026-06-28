/**
 * FTG Kitchen — ADA Accessibility Widget
 * Self-contained, no dependencies, persists via localStorage
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'ftg_a11y';
  const BRAND_LIME  = '#b0d050';
  const BRAND_NAVY  = '#0d1b24';

  // ── State ──────────────────────────────────────────────────────────────────
  const defaults = {
    fontSize:        0,     // -2 / -1 / 0 / 1 / 2
    contrast:        'off', // 'off' | 'high' | 'inverted'
    dyslexia:        false,
    reducedMotion:   false,
    highlightLinks:  false,
    bigCursor:       false,
    readingGuide:    false,
  };

  let state = Object.assign({}, defaults);
  try { Object.assign(state, JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')); } catch(_) {}

  // ── CSS injected into <head> ───────────────────────────────────────────────
  const styleEl = document.createElement('style');
  styleEl.id = 'ftg-a11y-css';
  document.head.appendChild(styleEl);

  function applyAll() {
    const rules = [];
    const html  = document.documentElement;

    // Font size
    const scales = [0.82, 0.91, 1, 1.12, 1.25];
    const scale  = scales[state.fontSize + 2] || 1;
    html.style.fontSize = scale === 1 ? '' : (scale * 16) + 'px';

    // Contrast
    html.classList.remove('ftg-contrast-high', 'ftg-contrast-inverted');
    if (state.contrast === 'high')     { rules.push(`body{filter:contrast(1.45) brightness(1.05)!important}`); }
    if (state.contrast === 'inverted') { rules.push(`html{filter:invert(1) hue-rotate(180deg)!important} img,video{filter:invert(1) hue-rotate(180deg)!important}`); }

    // Dyslexia font
    if (state.dyslexia) {
      rules.push(`*:not(.ftg-a11y-widget *){font-family:'Arial',sans-serif!important;letter-spacing:0.06em!important;word-spacing:0.18em!important;line-height:1.9!important}`);
    }

    // Reduced motion
    if (state.reducedMotion) {
      rules.push(`*{animation-duration:0.01ms!important;transition-duration:0.01ms!important}`);
    }

    // Highlight links
    if (state.highlightLinks) {
      rules.push(`a:not(.ftg-a11y-widget *){outline:2px solid ${BRAND_LIME}!important;outline-offset:2px!important;background:rgba(176,208,80,0.12)!important}`);
    }

    // Big cursor
    document.body.style.cursor = state.bigCursor ? 'none' : '';
    const bigCurEl = document.getElementById('ftg-bigcur');
    if (state.bigCursor && !bigCurEl) {
      const c = document.createElement('div');
      c.id = 'ftg-bigcur';
      c.style.cssText = 'position:fixed;top:0;left:0;width:40px;height:40px;border-radius:50%;border:3px solid '+BRAND_LIME+';pointer-events:none;z-index:99999;transform:translate(-50%,-50%);transition:left .08s,top .08s';
      document.body.appendChild(c);
      document.addEventListener('mousemove', e => { c.style.left=e.clientX+'px'; c.style.top=e.clientY+'px'; });
    } else if (!state.bigCursor && bigCurEl) {
      bigCurEl.remove();
    }

    // Reading guide
    const guideEl = document.getElementById('ftg-readguide');
    if (state.readingGuide && !guideEl) {
      const g = document.createElement('div');
      g.id = 'ftg-readguide';
      g.style.cssText = 'position:fixed;left:0;right:0;height:40px;background:rgba(176,208,80,0.12);border-top:1px solid rgba(176,208,80,0.4);border-bottom:1px solid rgba(176,208,80,0.4);pointer-events:none;z-index:99998;top:-100px;transition:top .04s';
      document.body.appendChild(g);
      document.addEventListener('mousemove', e => { g.style.top = (e.clientY - 20) + 'px'; });
    } else if (!state.readingGuide && guideEl) {
      guideEl.remove();
    }

    styleEl.textContent = rules.join('\n');
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch(_) {}
  }

  // ── Build Widget DOM ───────────────────────────────────────────────────────
  const widget = document.createElement('div');
  widget.className = 'ftg-a11y-widget';
  widget.setAttribute('role', 'region');
  widget.setAttribute('aria-label', 'Accessibility options');

  widget.innerHTML = `
<style>
.ftg-a11y-widget{position:fixed;bottom:24px;left:24px;z-index:99990;font-family:'Inter','Helvetica Neue',Arial,sans-serif;font-size:14px}
.ftg-a11y-widget *{box-sizing:border-box;cursor:pointer}

/* Trigger button */
#ftg-trigger{
  width:52px;height:52px;border-radius:50%;
  background:${BRAND_LIME};border:none;
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 4px 20px rgba(0,0,0,0.4);
  transition:transform .2s,box-shadow .2s;
  cursor:pointer;
}
#ftg-trigger:hover{transform:scale(1.1);box-shadow:0 6px 28px rgba(0,0,0,0.5)}
#ftg-trigger:focus-visible{outline:3px solid #fff;outline-offset:3px}
#ftg-trigger svg{width:26px;height:26px;fill:${BRAND_NAVY}}

/* Panel */
#ftg-panel{
  position:absolute;bottom:64px;left:0;
  width:300px;
  background:#1a2e3f;
  border:1px solid rgba(176,208,80,0.2);
  border-radius:16px;
  box-shadow:0 16px 60px rgba(0,0,0,0.6);
  overflow:hidden;
  display:none;
}
#ftg-panel.open{display:block}

#ftg-panel-head{
  background:#142030;
  padding:14px 16px 12px;
  display:flex;align-items:center;justify-content:space-between;
  border-bottom:1px solid rgba(176,208,80,0.12);
}
#ftg-panel-head h2{
  margin:0;font-size:13px;font-weight:700;
  letter-spacing:.08em;text-transform:uppercase;
  color:${BRAND_LIME};
}
#ftg-reset{
  font-size:11px;font-weight:600;color:rgba(200,220,232,0.5);
  background:none;border:none;padding:4px 8px;border-radius:4px;
  cursor:pointer;transition:color .2s;
}
#ftg-reset:hover{color:#fff}

#ftg-panel-body{padding:12px 14px;display:flex;flex-direction:column;gap:10px;max-height:75vh;overflow-y:auto}
#ftg-panel-body::-webkit-scrollbar{width:4px}
#ftg-panel-body::-webkit-scrollbar-thumb{background:rgba(176,208,80,0.3);border-radius:2px}

#ftg-close{
  display:block;width:100%;
  background:none;border:none;border-top:1px solid rgba(176,208,80,0.1);
  color:rgba(200,220,232,0.45);font-size:11px;font-weight:600;
  letter-spacing:.08em;text-transform:uppercase;
  padding:10px;cursor:pointer;transition:color .2s;
}
#ftg-close:hover{color:#fff}

/* Group label */
.ftg-group-label{
  font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;
  color:rgba(200,220,232,0.3);margin:4px 0 2px;padding:0 2px;
}

/* Stepper (font size) */
.ftg-stepper{
  display:flex;align-items:center;gap:0;
  background:#0d1b24;border:1px solid rgba(176,208,80,0.15);border-radius:8px;overflow:hidden;
}
.ftg-stepper label{flex:1;padding:10px 12px;font-size:12px;font-weight:500;color:#c4d8e8;cursor:default}
.ftg-step-btn{
  width:38px;height:38px;background:none;border:none;
  color:#c4d8e8;font-size:18px;line-height:1;
  display:flex;align-items:center;justify-content:center;
  transition:background .15s,color .15s;
}
.ftg-step-btn:first-of-type{border-right:1px solid rgba(176,208,80,0.12)}
.ftg-step-btn:last-of-type{border-left:1px solid rgba(176,208,80,0.12)}
.ftg-step-btn:hover{background:rgba(176,208,80,0.1);color:${BRAND_LIME}}
.ftg-step-val{min-width:28px;text-align:center;font-size:12px;font-weight:700;color:${BRAND_LIME}}

/* Toggle row */
.ftg-toggle{
  display:flex;align-items:center;justify-content:space-between;gap:12px;
  padding:10px 12px;
  background:#0d1b24;border:1px solid rgba(176,208,80,0.15);border-radius:8px;
  transition:border-color .2s,background .2s;
  cursor:pointer;
}
.ftg-toggle.active{border-color:rgba(176,208,80,0.45);background:rgba(176,208,80,0.07)}
.ftg-toggle:hover{border-color:rgba(176,208,80,0.3)}
.ftg-toggle-label{font-size:12px;font-weight:500;color:#c4d8e8;line-height:1.3;user-select:none}
.ftg-toggle-label span{display:block;font-size:10px;font-weight:300;color:rgba(200,220,232,0.4);margin-top:2px}
.ftg-switch{
  width:34px;height:20px;border-radius:10px;background:rgba(255,255,255,0.1);
  position:relative;flex-shrink:0;transition:background .2s;
}
.ftg-switch::after{
  content:'';position:absolute;top:3px;left:3px;width:14px;height:14px;
  border-radius:50%;background:#fff;transition:transform .2s,background .2s;
}
.ftg-toggle.active .ftg-switch{background:${BRAND_LIME}}
.ftg-toggle.active .ftg-switch::after{transform:translateX(14px);background:${BRAND_NAVY}}

/* Contrast row */
.ftg-contrast-row{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
.ftg-contrast-btn{
  padding:8px 4px;border-radius:8px;border:1px solid rgba(176,208,80,0.15);
  background:#0d1b24;text-align:center;
  font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
  color:#c4d8e8;transition:all .15s;
}
.ftg-contrast-btn:hover{border-color:rgba(176,208,80,0.35);color:${BRAND_LIME}}
.ftg-contrast-btn.active{border-color:${BRAND_LIME};background:rgba(176,208,80,0.12);color:${BRAND_LIME}}
</style>

<button id="ftg-trigger" aria-label="Open accessibility options" aria-expanded="false" aria-controls="ftg-panel">
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M12 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm9 5H3a1 1 0 0 0 0 2h7v3l-2.5 7a1 1 0 0 0 1.9.66L12 14l2.6 5.66a1 1 0 0 0 1.9-.66L14 12V9h7a1 1 0 0 0 0-2z"/>
  </svg>
</button>

<div id="ftg-panel" role="dialog" aria-label="Accessibility options" aria-modal="false">
  <div id="ftg-panel-head">
    <h2>Accessibility</h2>
    <button id="ftg-reset" aria-label="Reset all accessibility settings">Reset all</button>
  </div>
  <div id="ftg-panel-body">

    <div class="ftg-group-label">Text size</div>
    <div class="ftg-stepper" role="group" aria-label="Text size">
      <button class="ftg-step-btn" id="ftg-font-down" aria-label="Decrease text size">−</button>
      <label>Text size</label>
      <span class="ftg-step-val" id="ftg-font-val" aria-live="polite">Normal</span>
      <button class="ftg-step-btn" id="ftg-font-up" aria-label="Increase text size">+</button>
    </div>

    <div class="ftg-group-label">Contrast</div>
    <div class="ftg-contrast-row" role="group" aria-label="Contrast options">
      <button class="ftg-contrast-btn" id="ftg-c-off"      aria-pressed="true">Normal</button>
      <button class="ftg-contrast-btn" id="ftg-c-high"     aria-pressed="false">High</button>
      <button class="ftg-contrast-btn" id="ftg-c-inverted" aria-pressed="false">Inverted</button>
    </div>

    <div class="ftg-group-label">Reading aids</div>
    <div class="ftg-toggle" id="ftg-dyslexia" role="switch" aria-checked="false" tabindex="0" aria-label="Dyslexia-friendly font">
      <div class="ftg-toggle-label">Dyslexia-friendly font<span>Easier-to-read spacing &amp; typeface</span></div>
      <div class="ftg-switch" aria-hidden="true"></div>
    </div>
    <div class="ftg-toggle" id="ftg-links" role="switch" aria-checked="false" tabindex="0" aria-label="Highlight all links">
      <div class="ftg-toggle-label">Highlight links<span>Outlines every link on the page</span></div>
      <div class="ftg-switch" aria-hidden="true"></div>
    </div>
    <div class="ftg-toggle" id="ftg-guide" role="switch" aria-checked="false" tabindex="0" aria-label="Reading guide">
      <div class="ftg-toggle-label">Reading guide<span>Follows your cursor line-by-line</span></div>
      <div class="ftg-switch" aria-hidden="true"></div>
    </div>

    <div class="ftg-group-label">Motion &amp; cursor</div>
    <div class="ftg-toggle" id="ftg-motion" role="switch" aria-checked="false" tabindex="0" aria-label="Reduce animations">
      <div class="ftg-toggle-label">Reduce animations<span>Pauses transitions &amp; effects</span></div>
      <div class="ftg-switch" aria-hidden="true"></div>
    </div>
    <div class="ftg-toggle" id="ftg-cursor" role="switch" aria-checked="false" tabindex="0" aria-label="Large cursor">
      <div class="ftg-toggle-label">Large cursor<span>Bigger, more visible pointer</span></div>
      <div class="ftg-switch" aria-hidden="true"></div>
    </div>

  </div>
  <button id="ftg-close" aria-label="Close accessibility panel">Close</button>
</div>
`;

  document.body.appendChild(widget);

  // ── Wire up controls ───────────────────────────────────────────────────────
  const trigger    = document.getElementById('ftg-trigger');
  const panel      = document.getElementById('ftg-panel');
  const fontVal    = document.getElementById('ftg-font-val');
  const sizeLabels = ['−2','−1','Normal','+1','+2'];

  function updateFontLabel() {
    fontVal.textContent = sizeLabels[state.fontSize + 2];
  }

  function setContrast(val) {
    state.contrast = val;
    ['off','high','inverted'].forEach(k => {
      const btn = document.getElementById('ftg-c-' + k);
      btn.classList.toggle('active', k === val);
      btn.setAttribute('aria-pressed', String(k === val));
    });
    applyAll();
  }

  function toggleState(key, elId) {
    state[key] = !state[key];
    const el = document.getElementById(elId);
    el.classList.toggle('active', state[key]);
    el.setAttribute('aria-checked', String(state[key]));
    applyAll();
  }

  function openPanel() {
    panel.classList.add('open');
    trigger.setAttribute('aria-expanded','true');
    document.getElementById('ftg-reset').focus();
  }
  function closePanel() {
    panel.classList.remove('open');
    trigger.setAttribute('aria-expanded','false');
    trigger.focus();
  }

  trigger.addEventListener('click', () => panel.classList.contains('open') ? closePanel() : openPanel());
  document.getElementById('ftg-close').addEventListener('click', closePanel);

  document.getElementById('ftg-font-up').addEventListener('click', () => {
    if (state.fontSize < 2) { state.fontSize++; updateFontLabel(); applyAll(); }
  });
  document.getElementById('ftg-font-down').addEventListener('click', () => {
    if (state.fontSize > -2) { state.fontSize--; updateFontLabel(); applyAll(); }
  });

  document.getElementById('ftg-c-off').addEventListener('click',      () => setContrast('off'));
  document.getElementById('ftg-c-high').addEventListener('click',     () => setContrast('high'));
  document.getElementById('ftg-c-inverted').addEventListener('click', () => setContrast('inverted'));

  ['ftg-dyslexia','ftg-links','ftg-guide','ftg-motion','ftg-cursor'].forEach(id => {
    const keyMap = { 'ftg-dyslexia':'dyslexia','ftg-links':'highlightLinks','ftg-guide':'readingGuide','ftg-motion':'reducedMotion','ftg-cursor':'bigCursor' };
    const el = document.getElementById(id);
    const handler = () => toggleState(keyMap[id], id);
    el.addEventListener('click', handler);
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handler(); } });
  });

  document.getElementById('ftg-reset').addEventListener('click', () => {
    state = Object.assign({}, defaults);
    document.documentElement.style.fontSize = '';
    updateFontLabel();
    setContrast('off');
    ['ftg-dyslexia','ftg-links','ftg-guide','ftg-motion','ftg-cursor'].forEach(id => {
      const el = document.getElementById(id);
      el.classList.remove('active');
      el.setAttribute('aria-checked','false');
    });
    applyAll();
  });

  // Close on outside click / Escape
  document.addEventListener('click', e => { if (!widget.contains(e.target)) closePanel(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closePanel(); });

  // Trap focus inside panel when open
  panel.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const focusable = [...panel.querySelectorAll('button,[tabindex="0"]')].filter(el => !el.disabled);
    const first = focusable[0], last = focusable[focusable.length-1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  // ── Apply saved state on load ──────────────────────────────────────────────
  updateFontLabel();
  setContrast(state.contrast);
  ['dyslexia','highlightLinks','readingGuide','reducedMotion','bigCursor'].forEach(key => {
    const idMap = { dyslexia:'ftg-dyslexia',highlightLinks:'ftg-links',readingGuide:'ftg-guide',reducedMotion:'ftg-motion',bigCursor:'ftg-cursor' };
    if (state[key]) {
      const el = document.getElementById(idMap[key]);
      el.classList.add('active');
      el.setAttribute('aria-checked','true');
    }
  });
  applyAll();

})();
