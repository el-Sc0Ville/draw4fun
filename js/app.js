/* =========================================================
   Ellie's Drawing Ranch — app
   ========================================================= */
(function () {
  'use strict';
  const CFG = Object.assign({ name: 'Ellie', defaultLang: 'en', avatarImage: '', fullscreen: true }, window.ELLIE_CONFIG || {});
  const NAME = CFG.name;
  const W = 1200, H = 900, NS = 'http://www.w3.org/2000/svg';
  const ART = window.ART, STR = window.STR, SPIN = window.SPIN;
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.prototype.slice.call(document.querySelectorAll(s));
  const rnd = (a) => a[Math.floor(Math.random() * a.length)];
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const x = a[i]; a[i] = a[j]; a[j] = x; } return a; };

  // ---------- storage (safe) ----------
  const store = {
    get(k, d) { try { const v = localStorage.getItem('ellie.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('ellie.' + k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  };
  const S = {
    lang: store.get('lang', CFG.defaultLang), theme: store.get('theme', 'ranch'), level: store.get('level', 1),
    sound: store.get('sound', true), voice: store.get('voice', true), pony: store.get('pony', null), stickers: store.get('stickers', {})
  };
  if (!STR[S.lang]) S.lang = 'en';

  // ---------- words ----------
  function raw(key, lang) { return key.split('.').reduce((o, k) => (o ? o[k] : undefined), STR[lang || S.lang]); }
  function fill(s, vars) {
    const v = Object.assign({ name: NAME, pony: S.pony || '' }, vars || {});
    return String(s).replace(/\{(\w+)\}/g, (m, k) => (v[k] != null ? v[k] : m));
  }
  function t(key, vars) {
    let v = raw(key); if (v == null) v = raw(key, 'en'); if (v == null) return key;
    if (Array.isArray(v)) v = rnd(v);
    return fill(v, vars);
  }

  // ---------- constants ----------
  const THEMES = {
    ranch: { emoji: '🐴', color: '#7CCBFF', stamps: ['🐴', '🐎', '🥕', '🍎', '🌻', '🌳', '🐣', '🌞'] },
    unicorn: { emoji: '🦄', color: '#F7B8E6', stamps: ['🦄', '🌈', '💖', '⭐', '🧁', '🌸', '👑', '🎀'] },
    sea: { emoji: '🐠', color: '#1FA9C9', stamps: ['🐠', '🐟', '🐙', '🐬', '🐳', '🐚', '🦀', '⭐'] },
    night: { emoji: '🌙', color: '#3A3480', stamps: ['🌙', '⭐', '🌟', '🚀', '☁️', '🦉', '✨', '🦄'] }
  };
  const EXTRA_STAMPS = ['💖', '⭐', '🌈', '🦋', '🐞', '🍓', '🎈', '🌷'];
  const PALETTE = ['#E63946', '#FF8C42', '#FFD23F', '#8AC926', '#2A9D58', '#2EC4B6', '#4CC9F0', '#3A6EE8', '#8E5BE8', '#FF6FB5', '#FFD3B6', '#9C6644', '#2B2B2B', '#FFFFFF'];
  const STICKERS = ['🐴', '🦄', '🐎', '🌈', '⭐', '🌟', '💖', '🧁', '🍎', '🥕', '🌻', '🌸', '🦋', '🐞', '🐠', '🐬', '🐳', '🐚', '🌙', '🚀', '👑', '🎀', '🍓', '🍦', '🎈', '🐱', '🐶', '🐰', '🦊', '🐢'];
  const PONIES = {
    Caramel: { coat: '#D9A066', snout: '#F3D2B0', mane: '#FFE08A' },
    Luna: { coat: '#EEF0F7', snout: '#FFFFFF', mane: '#B9A6FF' },
    Cocoa: { coat: '#8B5A3C', snout: '#C99A78', mane: '#3E2A1E' },
    Daisy: { coat: '#F2C94C', snout: '#FFE9A8', mane: '#FFFFFF' }
  };
  const LW = [9, 7, 5.5];
  const SIZES = [8, 18, 34], STAMP_SIZES = [70, 110, 160];
  const TOOLS = ['crayon', 'brush', 'rainbow', 'sparkle', 'stamp', 'fill', 'eraser'];

  // ================= SOUND =================
  let AC = null;
  function audio() {
    if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; } }
    if (AC && AC.state === 'suspended') { try { AC.resume(); } catch (e) { /* ignore */ } }
    return AC;
  }
  function tone(f, d, type, v, f2, delay) {
    if (!S.sound) return; const a = audio(); if (!a) return;
    d = d || 0.12; v = v || 0.15;
    const t0 = a.currentTime + (delay || 0), o = a.createOscillator(), g = a.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t0);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + d);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(v, t0 + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
    o.connect(g); g.connect(a.destination); o.start(t0); o.stop(t0 + d + 0.05);
  }
  function noise(d, f1, f2, v) {
    if (!S.sound) return; const a = audio(); if (!a) return;
    const len = Math.floor(a.sampleRate * d), buf = a.createBuffer(1, len, a.sampleRate), ch = buf.getChannelData(0);
    for (let i = 0; i < len; i++) ch[i] = Math.random() * 2 - 1;
    const src = a.createBufferSource(); src.buffer = buf;
    const bp = a.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 1.4;
    const t0 = a.currentTime; bp.frequency.setValueAtTime(f1, t0); bp.frequency.exponentialRampToValueAtTime(f2, t0 + d);
    const g = a.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(v || 0.3, t0 + d * 0.3); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
    src.connect(bp); bp.connect(g); g.connect(a.destination); src.start(t0);
  }
  const PENTA = [0, 2, 4, 7, 9];
  const sfx = {
    tap: () => tone(660, 0.08, 'triangle', 0.12, 880),
    pick: () => tone(520, 0.1, 'sine', 0.14, 780),
    boing: () => tone(260, 0.28, 'sine', 0.2, 720),
    bloop: () => { tone(220, 0.16, 'sine', 0.22, 520); tone(520, 0.12, 'sine', 0.12, 780, 0.08); },
    nope: () => tone(220, 0.18, 'square', 0.06, 160),
    undo: () => tone(700, 0.12, 'triangle', 0.12, 420),
    tick: () => tone(1400, 0.03, 'square', 0.04),
    ding: () => { tone(988, 0.25, 'sine', 0.16); tone(1319, 0.3, 'sine', 0.1, null, 0.05); },
    dot: (i) => { const st = PENTA[i % 5] + 12 * Math.floor(i / 5); tone(392 * Math.pow(2, Math.min(st, 30) / 12), 0.22, 'triangle', 0.18); },
    whoosh: () => noise(0.5, 400, 3500, 0.35),
    tada: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.3, 'triangle', 0.16, null, i * 0.09)); },
    giggle: () => { [880, 990, 1100, 990, 1180].forEach((f, i) => tone(f, 0.07, 'sine', 0.1, f * 1.1, i * 0.07)); }
  };
  function neigh() {
    if (!S.sound) return; const a = audio(); if (!a) return;
    const t0 = a.currentTime, o = a.createOscillator(), lfo = a.createOscillator(), lg = a.createGain();
    o.type = 'sawtooth'; lfo.frequency.setValueAtTime(9, t0); lfo.frequency.linearRampToValueAtTime(18, t0 + 0.9); lg.gain.value = 110;
    lfo.connect(lg); lg.connect(o.frequency);
    o.frequency.setValueAtTime(650, t0); o.frequency.linearRampToValueAtTime(1150, t0 + 0.16); o.frequency.exponentialRampToValueAtTime(380, t0 + 0.95);
    const bp = a.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1300; bp.Q.value = 1.1;
    const g = a.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.22, t0 + 0.05);
    g.gain.setValueAtTime(0.22, t0 + 0.6); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1);
    o.connect(bp); bp.connect(g); g.connect(a.destination); o.start(t0); lfo.start(t0); o.stop(t0 + 1.05); lfo.stop(t0 + 1.05);
  }

  // ================= VOICE =================
  let voices = [];
  const hasSpeech = 'speechSynthesis' in window;
  function loadVoices() { try { voices = window.speechSynthesis.getVoices() || []; } catch (e) { voices = []; } }
  if (hasSpeech) { loadVoices(); try { window.speechSynthesis.onvoiceschanged = loadVoices; } catch (e) { /* ignore */ } }
  let emojiRe = null; try { emojiRe = new RegExp('\\p{Extended_Pictographic}|\\uFE0F|\\u200D', 'gu'); } catch (e) { emojiRe = null; }
  function say(text) {
    if (!S.voice || !hasSpeech || !text) return;
    try {
      const ss = window.speechSynthesis; ss.cancel();
      const clean = emojiRe ? String(text).replace(emojiRe, '') : String(text);
      const u = new SpeechSynthesisUtterance(clean);
      const prefs = S.lang === 'fr' ? ['fr-ca', 'fr-fr', 'fr'] : ['en-us', 'en-ca', 'en-gb', 'en'];
      u.lang = S.lang === 'fr' ? 'fr-CA' : 'en-US';
      let v = null;
      for (const p of prefs) { v = voices.find((x) => x.lang && x.lang.replace('_', '-').toLowerCase().indexOf(p) === 0); if (v) break; }
      if (v) u.voice = v;
      u.rate = 0.95; u.pitch = 1.15;
      ss.speak(u);
    } catch (e) { /* ignore */ }
  }
  function hush() { if (hasSpeech) { try { window.speechSynthesis.cancel(); } catch (e) { /* ignore */ } } }

  // ================= UI helpers =================
  let toastT = null;
  function toast(msg) {
    const el = $('#toast'); el.textContent = msg; el.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 2200);
  }
  function show(id) {
    $$('.screen').forEach((s) => s.classList.toggle('active', s.id === id));
    if (id !== 'work') stopLessonAnim();
    if (id === 'work') requestAnimationFrame(fitStage);
  }
  let modalT = null, modalOnClose = null;
  function openModal(html, opts) {
    opts = opts || {};
    const m = $('#modal'); $('#modalCard').innerHTML = html; m.classList.remove('hidden');
    m.dataset.tap = opts.tapClose ? '1' : '';
    modalOnClose = opts.onClose || null;
    clearTimeout(modalT); if (opts.auto) modalT = setTimeout(closeModal, opts.auto);
  }
  function closeModal() {
    clearTimeout(modalT); $('#modal').classList.add('hidden'); $('#modalCard').innerHTML = '';
    const cb = modalOnClose; modalOnClose = null; if (cb) cb();
  }
  $('#modal').addEventListener('click', (e) => { if ($('#modal').dataset.tap === '1' || e.target.id === 'modal') closeModal(); });
  function jump(el) { el.classList.remove('jump'); void el.offsetWidth; el.classList.add('jump'); }

  // ---------- confetti ----------
  const fx = $('#fx'), fctx = fx.getContext('2d');
  let parts = [], fxRun = false;
  const FX_COLORS = ['#FF6B6B', '#FFD23F', '#8AC926', '#4CC9F0', '#9B5DE5', '#FF6FB5', '#FF8C42'];
  function starPath(ctx, x, y, R, r) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) { const rad = i % 2 ? r : R, a = (-90 + i * 36) * Math.PI / 180; ctx[i ? 'lineTo' : 'moveTo'](x + rad * Math.cos(a), y + rad * Math.sin(a)); }
    ctx.closePath();
  }
  function confetti(n) {
    n = n || 90; fx.width = innerWidth; fx.height = innerHeight;
    for (let i = 0; i < n; i++) {
      parts.push({ x: innerWidth / 2 + (Math.random() - 0.5) * innerWidth * 0.4, y: innerHeight * 0.5, vx: (Math.random() - 0.5) * 16, vy: -Math.random() * 15 - 6,
        r: Math.random() * 360, vr: (Math.random() - 0.5) * 20, s: 9 + Math.random() * 10, c: rnd(FX_COLORS), star: Math.random() < 0.35, life: 0 });
    }
    if (!fxRun) { fxRun = true; requestAnimationFrame(fxTick); }
  }
  function fxTick() {
    fctx.clearRect(0, 0, fx.width, fx.height);
    parts = parts.filter((p) => p.y < fx.height + 40 && p.life < 260);
    for (const p of parts) {
      p.life++; p.vy += 0.35; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      fctx.save(); fctx.translate(p.x, p.y); fctx.rotate(p.r * Math.PI / 180); fctx.fillStyle = p.c;
      if (p.star) { starPath(fctx, 0, 0, p.s * 0.8, p.s * 0.35); fctx.fill(); } else fctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
      fctx.restore();
    }
    if (parts.length) requestAnimationFrame(fxTick); else { fxRun = false; fctx.clearRect(0, 0, fx.width, fx.height); }
  }

  // ================= THEME / SCENE =================
  function buildScene() {
    const th = S.theme; let h = '';
    const hills = `<svg class="hills" viewBox="0 0 1000 300" preserveAspectRatio="none"><path d="M0 170Q250 60 500 150T1000 120V300H0Z" style="fill:var(--ground)"/><path d="M0 230Q300 150 600 220T1000 200V300H0Z" style="fill:var(--ground2)"/></svg>`;
    const r = (a, b) => Math.round(a + Math.random() * (b - a));
    if (th === 'ranch') {
      h += '<div class="deco sun" style="right:6vw;top:9vh"></div>';
      for (let i = 0; i < 3; i++) h += `<div class="deco cloud" style="top:${8 + i * 12}vh;animation-duration:${55 + i * 20}s;animation-delay:-${i * 19}s"></div>`;
    } else if (th === 'unicorn') {
      h += '<div class="deco rainbow" style="left:50%;bottom:20vh;margin-left:-35vmin"></div>';
      for (let i = 0; i < 2; i++) h += `<div class="deco cloud" style="top:${10 + i * 14}vh;animation-duration:${60 + i * 25}s;animation-delay:-${i * 30}s"></div>`;
      for (let i = 0; i < 7; i++) h += `<div class="deco sparkle-deco" style="left:${r(3, 95)}vw;top:${r(5, 65)}vh;animation-delay:-${r(0, 30) / 10}s">✨</div>`;
    } else if (th === 'sea') {
      for (let i = 0; i < 10; i++) h += `<div class="deco bubble-deco" style="left:${r(2, 97)}vw;bottom:-30px;width:${r(14, 30)}px;height:auto;aspect-ratio:1;animation-duration:${r(9, 18)}s;animation-delay:-${r(0, 160) / 10}s"></div>`;
    } else {
      h += '<div class="deco moon" style="right:10vw;top:8vh"></div>';
      for (let i = 0; i < 18; i++) h += `<div class="deco twinkle" style="left:${r(2, 97)}vw;top:${r(3, 68)}vh;animation-delay:-${r(0, 24) / 10}s"></div>`;
    }
    $('#scene').innerHTML = h + hills;
    const meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.setAttribute('content', THEMES[th].color);
  }
  function applyTheme() {
    document.body.dataset.theme = S.theme;
    buildScene();
    $$('#themeBtns button').forEach((b) => b.classList.toggle('on', b.dataset.theme === S.theme));
    WS.stamp = THEMES[S.theme].stamps[0];
  }
  function applyPony() {
    const p = PONIES[S.pony] || PONIES.Caramel, st = document.body.style;
    st.setProperty('--coat', p.coat); st.setProperty('--snout', p.snout); st.setProperty('--mane', p.mane);
  }
  function applyLang() {
    $$('[data-t]').forEach((el) => { el.textContent = t(el.dataset.t); });
    document.documentElement.lang = S.lang;
    document.title = t('title1') + ' ' + t('title2');
    $$('#langToggle button').forEach((b) => b.classList.toggle('on', b.dataset.lang === S.lang));
    $('#themeBtns').innerHTML = Object.keys(THEMES).map((k) =>
      `<button data-theme="${k}" style="background:${THEMES[k].color}" aria-label="${t('th_' + k)}" class="${k === S.theme ? 'on' : ''}">${THEMES[k].emoji}</button>`).join('');
    $('#levelBtns').innerHTML = [1, 2, 3].map((l) =>
      `<button data-level="${l}" class="${l === S.level ? 'on' : ''}"><span class="stars">${'⭐'.repeat(l)}</span>${t('lv' + l)}</button>`).join('');
    updateStickerNum();
  }
  function setBubble(text) { const b = $('#bubble'); b.textContent = text; b.style.animation = 'none'; void b.offsetWidth; b.style.animation = ''; }
  function updateStickerNum() { $('#stickerNum').textContent = Object.keys(S.stickers).length; }

  // ================= DRAWING ENGINE =================
  const stage = $('#stage'), paint = $('#paint'), lineart = $('#lineart'), overlay = $('#overlay');
  let pctx; try { pctx = paint.getContext('2d', { willReadFrequently: true }); } catch (e) { pctx = paint.getContext('2d'); }
  let lctx; try { lctx = lineart.getContext('2d', { willReadFrequently: true }); } catch (e) { lctx = lineart.getContext('2d'); }
  const WS = { mode: 'draw', tool: 'crayon', color: '#E63946', size: 1, stamp: '🐴', undo: [], rewarded: false, wall: null };

  function fitStage() {
    const wrap = $('#stageWrap'); const ww = wrap.clientWidth, wh = wrap.clientHeight;
    if (!ww || !wh) return;
    let w = ww, h = (w * 3) / 4; if (h > wh) { h = wh; w = (h * 4) / 3; }
    stage.style.width = Math.floor(w) + 'px'; stage.style.height = Math.floor(h) + 'px';
  }
  window.addEventListener('resize', () => { if ($('#work').classList.contains('active')) fitStage(); });
  window.addEventListener('orientationchange', () => setTimeout(fitStage, 300));

  function hexRgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }

  function drawShapes(ctx, shapes, level, lw, scale) {
    ctx.save(); if (scale) ctx.scale(scale, scale);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.strokeStyle = '#000';
    for (const s of shapes) {
      const d = s[0], fm = s[1] || 'w', lv = s[2] || 1, m = s[3] || 1;
      if (lv > level) continue;
      let p; try { p = new Path2D(d); } catch (e) { continue; }
      if (fm === 'w') { ctx.fillStyle = '#fff'; ctx.fill(p); } else if (fm === 'k') { ctx.fillStyle = '#000'; ctx.fill(p); }
      ctx.lineWidth = lw * m; ctx.stroke(p);
    }
    ctx.restore();
  }
  function setLineArt(shapes, level) {
    lctx.clearRect(0, 0, W, H); WS.wall = null;
    if (!shapes) return;
    lctx.fillStyle = '#fff'; lctx.fillRect(0, 0, W, H);
    drawShapes(lctx, shapes, level, LW[level - 1]);
    const id = lctx.getImageData(0, 0, W, H), d = id.data, wall = new Uint8Array(W * H);
    for (let i = 0, j = 0; i < d.length; i += 4, j++) {
      const a = 255 - ((d[i] + d[i + 1] + d[i + 2]) / 3);
      d[i] = 52; d[i + 1] = 38; d[i + 2] = 70; d[i + 3] = a;
      wall[j] = a > 110 ? 1 : 0;
    }
    lctx.putImageData(id, 0, 0); WS.wall = wall;
  }
  function resetPaint(img) {
    pctx.globalCompositeOperation = 'source-over'; pctx.globalAlpha = 1;
    pctx.fillStyle = '#fff'; pctx.fillRect(0, 0, W, H);
    if (img) { const im = new Image(); im.onload = () => pctx.drawImage(im, 0, 0, W, H); im.src = img; }
  }
  function pushUndo() { try { WS.undo.push(pctx.getImageData(0, 0, W, H)); if (WS.undo.length > 8) WS.undo.shift(); } catch (e) { /* ignore */ } }

  // crayon texture
  const patCache = {};
  function crayonPattern(hex) {
    if (patCache[hex]) return patCache[hex];
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const x = c.getContext('2d'), rgb = hexRgb(hex), id = x.createImageData(64, 64);
    for (let i = 0; i < id.data.length; i += 4) {
      const n = Math.random(); id.data[i] = rgb[0]; id.data[i + 1] = rgb[1]; id.data[i + 2] = rgb[2]; id.data[i + 3] = n < 0.12 ? 0 : (165 + n * 90) | 0;
    }
    x.putImageData(id, 0, 0);
    return (patCache[hex] = pctx.createPattern(c, 'repeat'));
  }

  // flood fill (respects line art)
  function floodFill(x0, y0, hex) {
    x0 = Math.round(x0); y0 = Math.round(y0);
    if (x0 < 0 || y0 < 0 || x0 >= W || y0 >= H) return false;
    const img = pctx.getImageData(0, 0, W, H), px = new Uint32Array(img.data.buffer), wall = WS.wall;
    let start = y0 * W + x0;
    if (wall && wall[start]) {
      let found = -1;
      for (let r = 1; r < 16 && found < 0; r++) {
        for (const o of [[r, 0], [-r, 0], [0, r], [0, -r], [r, r], [-r, -r], [r, -r], [-r, r]]) {
          const xx = x0 + o[0], yy = y0 + o[1];
          if (xx >= 0 && yy >= 0 && xx < W && yy < H && !wall[yy * W + xx]) { found = yy * W + xx; break; }
        }
      }
      if (found < 0) return false; start = found;
    }
    const sc = px[start], sr = sc & 255, sg = (sc >> 8) & 255, sb = (sc >> 16) & 255;
    const rgb = hexRgb(hex), fc = ((255 << 24) | (rgb[2] << 16) | (rgb[1] << 8) | rgb[0]) >>> 0;
    if (Math.abs(sr - rgb[0]) + Math.abs(sg - rgb[1]) + Math.abs(sb - rgb[2]) < 12) return false;
    const tol = 100, seen = new Uint8Array(W * H);
    const ok = (i) => {
      if (seen[i] || (wall && wall[i])) return false;
      const c = px[i];
      return Math.abs((c & 255) - sr) + Math.abs(((c >> 8) & 255) - sg) + Math.abs(((c >> 16) & 255) - sb) <= tol;
    };
    const stack = [start];
    while (stack.length) {
      const i = stack.pop(); if (!ok(i)) continue;
      const y = (i / W) | 0, x = i - y * W;
      let xl = x, xr = x;
      while (xl > 0 && ok(y * W + xl - 1)) xl--;
      while (xr < W - 1 && ok(y * W + xr + 1)) xr++;
      let up = false, dn = false;
      for (let xx = xl; xx <= xr; xx++) {
        const k = y * W + xx; seen[k] = 1; px[k] = fc;
        if (y > 0) { const u = k - W; if (ok(u)) { if (!up) { stack.push(u); up = true; } } else up = false; }
        if (y < H - 1) { const v = k + W; if (ok(v)) { if (!dn) { stack.push(v); dn = true; } } else dn = false; }
      }
    }
    // grow 2px under the ink so no white halos
    if (wall) {
      for (let pass = 0; pass < 2; pass++) {
        const add = [];
        for (let i = W; i < W * H - W; i++) {
          if (!seen[i] && wall[i] && (seen[i - 1] || seen[i + 1] || seen[i - W] || seen[i + W])) add.push(i);
        }
        for (const i of add) { seen[i] = 1; px[i] = fc; }
      }
    }
    pctx.putImageData(img, 0, 0);
    return true;
  }

  function drawEmoji(ch, x, y, size, rot) {
    pctx.save(); pctx.translate(x, y); pctx.rotate(rot || 0);
    pctx.font = `${size}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji","Android Emoji",sans-serif`;
    pctx.textAlign = 'center'; pctx.textBaseline = 'middle'; pctx.globalAlpha = 1;
    pctx.fillText(ch, 0, 0); pctx.restore();
  }

  let pid = null, last = null, lastMid = null, hue = Math.random() * 360, sparkAcc = 0;
  function pos(e) { const r = stage.getBoundingClientRect(); return { x: ((e.clientX - r.left) * W) / r.width, y: ((e.clientY - r.top) * H) / r.height }; }
  function strokeStyle(dist) {
    const sz = SIZES[WS.size]; pctx.globalCompositeOperation = 'source-over'; pctx.globalAlpha = 1; pctx.lineCap = 'round'; pctx.lineJoin = 'round';
    switch (WS.tool) {
      case 'crayon': pctx.strokeStyle = crayonPattern(WS.color); pctx.lineWidth = sz; break;
      case 'brush': pctx.strokeStyle = WS.color; pctx.lineWidth = sz * 1.25; break;
      case 'rainbow': hue = (hue + (dist || 0) * 0.5) % 360; pctx.strokeStyle = `hsl(${hue},90%,58%)`; pctx.lineWidth = sz * 1.25; break;
      case 'sparkle': pctx.strokeStyle = WS.color; pctx.lineWidth = Math.max(4, sz * 0.5); break;
      case 'eraser': pctx.strokeStyle = '#fff'; pctx.lineWidth = sz * 2; break;
    }
  }
  function sparkles(p, dist) {
    sparkAcc += dist; const sz = SIZES[WS.size];
    while (sparkAcc > 16) {
      sparkAcc -= 16;
      const a = Math.random() * Math.PI * 2, r = Math.random() * sz * 1.8 + 6;
      pctx.fillStyle = `hsl(${Math.random() * 360},95%,62%)`;
      starPath(pctx, p.x + Math.cos(a) * r, p.y + Math.sin(a) * r, 6 + Math.random() * sz * 0.35, 2.5 + Math.random() * 2); pctx.fill();
    }
  }
  function dab(p) {
    strokeStyle(0); pctx.beginPath(); pctx.moveTo(p.x, p.y); pctx.lineTo(p.x + 0.1, p.y + 0.1); pctx.stroke();
    if (WS.tool === 'sparkle') sparkles(p, 40);
  }
  function strokeTo(p) {
    const dist = Math.hypot(p.x - last.x, p.y - last.y); if (dist < 1.2) return;
    const mid = { x: (last.x + p.x) / 2, y: (last.y + p.y) / 2 };
    strokeStyle(dist); pctx.beginPath(); pctx.moveTo(lastMid.x, lastMid.y); pctx.quadraticCurveTo(last.x, last.y, mid.x, mid.y); pctx.stroke();
    if (WS.tool === 'sparkle') sparkles(p, dist);
    last = p; lastMid = mid;
  }
  function placeStamp(p) {
    drawEmoji(WS.stamp, p.x, p.y, STAMP_SIZES[WS.size], (Math.random() - 0.5) * 0.5); sfx.boing(); last = p;
  }

  function onDown(p) {
    if (WS.mode === 'dots') return dotsDown(p);
    closeTray();
    if (WS.mode === 'lesson' && LS.done === false) { /* drawing allowed */ }
    pushUndo();
    if (WS.tool === 'fill') { if (floodFill(p.x, p.y, WS.color)) sfx.bloop(); else { WS.undo.pop(); sfx.nope(); } return; }
    if (WS.tool === 'stamp') { placeStamp(p); return; }
    last = p; lastMid = p; dab(p);
  }
  function onMove(p) {
    if (WS.mode === 'dots') return dotsMove(p);
    if (!last || WS.tool === 'fill') return;
    if (WS.tool === 'stamp') { if (Math.hypot(p.x - last.x, p.y - last.y) > STAMP_SIZES[WS.size] * 0.9) placeStamp(p); return; }
    strokeTo(p);
  }
  function onUp() {
    if (WS.mode === 'dots') return dotsUp();
    if (last && WS.tool !== 'stamp' && WS.tool !== 'fill') { strokeStyle(0); pctx.beginPath(); pctx.moveTo(lastMid.x, lastMid.y); pctx.lineTo(last.x, last.y); pctx.stroke(); }
    last = null; lastMid = null;
  }
  stage.addEventListener('pointerdown', (e) => {
    if (pid !== null || (e.target.closest && e.target.closest('button'))) return;
    pid = e.pointerId; try { stage.setPointerCapture(pid); } catch (er) { /* ignore */ }
    audio(); onDown(pos(e)); e.preventDefault();
  });
  stage.addEventListener('pointermove', (e) => {
    if (e.pointerId !== pid) return;
    const evs = typeof e.getCoalescedEvents === 'function' ? e.getCoalescedEvents() : null;
    if (evs && evs.length) for (const ev of evs) onMove(pos(ev)); else onMove(pos(e));
    e.preventDefault();
  });
  const endPtr = (e) => { if (e.pointerId !== pid) return; pid = null; onUp(); };
  stage.addEventListener('pointerup', endPtr);
  stage.addEventListener('pointercancel', endPtr);
  stage.addEventListener('contextmenu', (e) => e.preventDefault());
  document.addEventListener('gesturestart', (e) => e.preventDefault());

  // ---------- palette & tools ----------
  function renderPalette() {
    $('#palette').innerHTML = PALETTE.map((c) => `<button class="crayon ${c === WS.color ? 'on' : ''}" data-c="${c}" style="--c:${c}" aria-label="${c}"><i></i></button>`).join('');
  }
  function toolIcon(k) {
    const c = WS.color, cs = c === '#FFFFFF' ? '#d8d0e0' : c;
    switch (k) {
      case 'crayon': return `<svg viewBox="0 0 48 48"><g transform="rotate(45 24 24)"><rect x="18" y="13" width="12" height="31" rx="2" fill="${c}" stroke="rgba(0,0,0,.3)" stroke-width="1.5"/><path d="M18 13L24 2L30 13Z" fill="${c}" stroke="rgba(0,0,0,.3)" stroke-width="1.5"/><rect x="18" y="19" width="12" height="4" fill="rgba(0,0,0,.18)"/><rect x="18" y="35" width="12" height="4" fill="rgba(0,0,0,.18)"/></g></svg>`;
      case 'brush': return `<svg viewBox="0 0 48 48"><g transform="rotate(40 24 24)"><rect x="21" y="21" width="6" height="25" rx="3" fill="#C98B5A"/><rect x="19" y="16" width="10" height="7" rx="1" fill="#B8B8C8"/><path d="M19 17C19 9 22 4 24 1C26 4 29 9 29 17Z" fill="${c}" stroke="rgba(0,0,0,.25)" stroke-width="1.2"/></g></svg>`;
      case 'rainbow': return '<svg viewBox="0 0 48 48" fill="none" stroke-width="5" stroke-linecap="round"><path d="M5 36A19 19 0 0 1 43 36" stroke="#FF6B6B"/><path d="M11 36A13 13 0 0 1 37 36" stroke="#FFD23F"/><path d="M17 36A7 7 0 0 1 31 36" stroke="#4CC9F0"/></svg>';
      case 'sparkle': return '<svg viewBox="0 0 48 48"><path d="M24 4L28 20L44 24L28 28L24 44L20 28L4 24L20 20Z" fill="#FFD23F" stroke="#E9A800" stroke-width="1.5" stroke-linejoin="round"/><circle cx="39" cy="9" r="3.5" fill="#FF6FB5"/><circle cx="9" cy="39" r="3.5" fill="#4CC9F0"/></svg>';
      case 'stamp': return `<span style="font-size:30px;line-height:1">${WS.stamp}</span>`;
      case 'fill': return `<svg viewBox="0 0 48 48"><path d="M8 20L24 9L36 27L20 38Z" fill="#AEB8CC" stroke="#5E6A80" stroke-width="2.5" stroke-linejoin="round"/><path d="M8 20C14 24 26 18 24 9" fill="none" stroke="#5E6A80" stroke-width="2.5"/><path d="M8 20C4 26 4 34 7 40" stroke="${cs}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M38 31C44 36 44 43 40 45C36 43 35 37 38 31Z" fill="${cs}"/></svg>`;
      case 'eraser': return '<svg viewBox="0 0 48 48"><g transform="rotate(-30 24 24)"><rect x="7" y="15" width="34" height="19" rx="5" fill="#FF9EB5" stroke="rgba(0,0,0,.25)" stroke-width="1.5"/><rect x="7" y="15" width="13" height="19" rx="5" fill="#7DB8F5"/></g></svg>';
    }
    return '';
  }
  function renderTools() {
    const c = WS.color === '#FFFFFF' ? '#cfc6d8' : WS.color;
    const tools = TOOLS.map((k) => `<button class="tool ${WS.tool === k ? 'on' : ''}" data-tool="${k}" aria-label="${t('tool_' + k)}">${toolIcon(k)}</button>`).join('');
    const sizes = [0, 1, 2].map((i) => `<button class="tool ${WS.size === i ? 'on' : ''}" data-size="${i}" aria-label="size ${i + 1}"><span class="sz" style="width:${[10, 18, 28][i]}px;height:${[10, 18, 28][i]}px;background:${c}"></span></button>`).join('');
    $('#tools').innerHTML = tools + sizes;
  }
  $('#palette').addEventListener('click', (e) => {
    const b = e.target.closest('.crayon'); if (!b) return;
    WS.color = b.dataset.c; if (WS.tool === 'eraser' || WS.tool === 'rainbow' || WS.tool === 'stamp') WS.tool = WS.mode === 'color' ? 'fill' : 'crayon';
    sfx.pick(); renderPalette(); renderTools(); closeTray();
  });
  $('#tools').addEventListener('click', (e) => {
    const b = e.target.closest('.tool'); if (!b) return;
    if (b.dataset.size != null) { WS.size = +b.dataset.size; sfx.tap(); renderTools(); return; }
    const k = b.dataset.tool;
    if (k === 'stamp') { if (WS.tool === 'stamp' && !$('#stampTray').classList.contains('hidden')) closeTray(); else openTray(); }
    else closeTray();
    WS.tool = k; sfx.pick(); renderTools(); say(t('tool_' + k));
  });
  function openTray() {
    const list = THEMES[S.theme].stamps.concat(EXTRA_STAMPS.filter((s) => THEMES[S.theme].stamps.indexOf(s) < 0));
    const tr = $('#stampTray');
    tr.innerHTML = list.map((s) => `<button data-s="${s}" class="${s === WS.stamp ? 'on' : ''}">${s}</button>`).join('');
    tr.classList.remove('hidden');
  }
  function closeTray() { $('#stampTray').classList.add('hidden'); }
  $('#stampTray').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    WS.stamp = b.dataset.s; WS.tool = 'stamp'; sfx.boing(); closeTray(); renderTools();
  });

  // ---------- top actions ----------
  $('#undoBtn').addEventListener('click', () => {
    if (WS.undo.length) { pctx.putImageData(WS.undo.pop(), 0, 0); sfx.undo(); } else sfx.nope();
  });
  $('#clearBtn').addEventListener('click', () => {
    pushUndo(); stage.classList.remove('shake'); void stage.offsetWidth; stage.classList.add('shake'); sfx.whoosh();
    setTimeout(() => { pctx.fillStyle = '#fff'; pctx.globalCompositeOperation = 'source-over'; pctx.fillRect(0, 0, W, H); }, 220);
  });
  $('#saveBtn').addEventListener('click', () => saveDrawing());
  $('#sayBtn').addEventListener('click', () => say($('#bannerText').textContent));
  $('#workHome').addEventListener('click', goHome);

  function setBanner(emoji, text) {
    $('#bannerEmoji').textContent = emoji || ''; $('#bannerText').textContent = text || '';
    const b = $('#banner'); b.classList.remove('flash'); void b.offsetWidth; b.classList.add('flash');
  }

  function startWork(mode, opts) {
    opts = opts || {};
    WS.mode = mode; $('#work').dataset.mode = mode;
    WS.undo = []; WS.rewarded = false; pid = null; last = null;
    overlay.innerHTML = ''; $('#guideCrayon').classList.add('hidden'); $('#colorItBtn').classList.add('hidden');
    closeTray(); stopLessonAnim();
    resetPaint(opts.image);
    setLineArt(opts.shapes || null, opts.lineLevel || S.level);
    WS.tool = mode === 'color' ? 'fill' : 'crayon';
    if (mode === 'lesson') WS.color = '#2B2B2B';
    if (THEMES[S.theme].stamps.indexOf(WS.stamp) < 0 && EXTRA_STAMPS.indexOf(WS.stamp) < 0) WS.stamp = THEMES[S.theme].stamps[0];
    renderPalette(); renderTools();
    show('work');
  }

  // ---------- saving ----------
  function getGallery() { return store.get('gallery', []); }
  function setGallery(g) { return store.set('gallery', g); }
  function composite(scale) {
    const c = document.createElement('canvas'); c.width = Math.round(W * scale); c.height = Math.round(H * scale);
    const x = c.getContext('2d'); x.drawImage(paint, 0, 0, c.width, c.height); x.drawImage(lineart, 0, 0, c.width, c.height); return c;
  }
  function saveDrawing(silent) {
    let url; try { url = composite(0.75).toDataURL('image/jpeg', 0.82); } catch (e) { toast('🙈'); return; }
    const g = getGallery(); g.unshift({ id: Date.now(), img: url });
    while (g.length > 30) g.pop();
    while (!setGallery(g) && g.length > 1) g.pop();
    sfx.tada(); confetti(70);
    if (!silent) toast('⭐ ' + t('saved'));
    if (!WS.rewarded) { WS.rewarded = true; setTimeout(giveSticker, 700); } else say(t('saved'));
  }

  // ---------- stickers ----------
  function giveSticker() {
    const owned = S.stickers, unowned = STICKERS.filter((s) => !owned[s]);
    const s = unowned.length ? rnd(unowned) : rnd(STICKERS);
    owned[s] = (owned[s] || 0) + 1; store.set('stickers', owned); updateStickerNum();
    neigh(); setTimeout(() => say(t('praise') + ' ' + t('gotSticker')), 600);
    openModal(`<div class="reward-emoji">${s}</div><h3>${t('gotSticker')}</h3><div class="muted">${t('tapToClose')}</div>`, { tapClose: true, auto: 4500 });
    confetti(120);
  }
  function showStickers() {
    const owned = S.stickers, n = Object.keys(owned).length;
    $('#stickerCount').textContent = t('stickerCount', { n, total: STICKERS.length });
    $('#stickerGrid').innerHTML = STICKERS.map((s) => owned[s]
      ? `<button class="sticker" data-s="${s}">${s}${owned[s] > 1 ? `<span class="cnt">×${owned[s]}</span>` : ''}</button>`
      : '<div class="sticker locked">?</div>').join('');
    show('stickers'); say(t('stickerCount', { n, total: STICKERS.length }));
  }
  $('#stickerGrid').addEventListener('click', (e) => { const b = e.target.closest('.sticker[data-s]'); if (b) { jump(b); sfx.boing(); } });

  // ================= CONNECT THE DOTS =================
  const DS = { id: null, pts: [], next: 0, done: true, drag: false, hintT: null };
  function svgEl(tag, attrs, parent) { const el = document.createElementNS(NS, tag); for (const k in attrs) el.setAttribute(k, attrs[k]); if (parent) parent.appendChild(el); return el; }
  function startDots(id) {
    startWork('dots');
    DS.id = id; DS.pts = ART.dotPoints(ART.DOTS[id], S.level); DS.next = 0; DS.done = false; DS.drag = false;
    const pts = DS.pts; let cx = 0, cy = 0; pts.forEach((p) => { cx += p[0]; cy += p[1]; }); cx /= pts.length; cy /= pts.length;
    svgEl('g', { id: 'dLines' }, overlay);
    svgEl('line', { id: 'rubber', class: 'rubber', x1: 0, y1: 0, x2: 0, y2: 0, visibility: 'hidden' }, overlay);
    const g = svgEl('g', { id: 'dPts' }, overlay);
    pts.forEach((p, i) => {
      // label sits outside the shape, along the local outward normal
      const a = pts[(i - 1 + pts.length) % pts.length], b = pts[(i + 1) % pts.length];
      let dx = -(b[1] - a[1]), dy = b[0] - a[0];
      if (dx * (p[0] - cx) + dy * (p[1] - cy) < 0) { dx = -dx; dy = -dy; }
      const L = Math.hypot(dx, dy) || 1;
      const dg = svgEl('g', { class: 'dot', id: 'd' + i }, g);
      svgEl('circle', { class: 'halo', cx: p[0], cy: p[1], r: 30 }, dg);
      svgEl('circle', { class: 'core', cx: p[0], cy: p[1], r: 11 }, dg);
      const tx = svgEl('text', { x: Math.round(p[0] + (dx / L) * 36), y: Math.round(p[1] + (dy / L) * 36 + 10), 'text-anchor': 'middle' }, dg);
      tx.textContent = i + 1;
    });
    markNext();
    setBanner('✨', t('dotsStart')); say(t('dotsStart'));
  }
  function markNext() {
    clearTimeout(DS.hintT);
    $$('#dPts .dot').forEach((d) => d.classList.remove('next', 'hint'));
    const el = document.getElementById('d' + DS.next); if (!el) return;
    if (S.level < 3) el.classList.add('next'); else DS.hintT = setTimeout(() => el.classList.add('hint'), 5000);
  }
  const hitR = () => [52, 42, 36][S.level - 1];
  function nearIdx(p) { const pts = DS.pts; for (let i = 0; i < pts.length; i++) if (Math.hypot(p.x - pts[i][0], p.y - pts[i][1]) < hitR()) return i; return -1; }
  function dotsDown(p) {
    if (DS.done) return; DS.drag = true;
    const i = nearIdx(p);
    if (i === DS.next) connect();
    else if (i >= 0 && i > DS.next) {
      sfx.nope(); const el = document.getElementById('d' + DS.next);
      if (el) { el.classList.remove('wobble'); void el.getBoundingClientRect(); el.classList.add('wobble'); el.classList.add('hint'); }
      say(t('dotsNext', { n: DS.next + 1 }));
    }
    dotsMove(p);
  }
  function dotsMove(p) {
    if (!DS.drag || DS.done) return;
    const pts = DS.pts, rb = document.getElementById('rubber');
    if (DS.next > 0 && rb) { const a = pts[DS.next - 1]; rb.setAttribute('x1', a[0]); rb.setAttribute('y1', a[1]); rb.setAttribute('x2', p.x); rb.setAttribute('y2', p.y); rb.setAttribute('visibility', 'visible'); }
    const n = pts[DS.next]; if (n && Math.hypot(p.x - n[0], p.y - n[1]) < hitR()) connect();
  }
  function dotsUp() { DS.drag = false; const rb = document.getElementById('rubber'); if (rb) rb.setAttribute('visibility', 'hidden'); }
  function addLine(a, b) { svgEl('line', { class: 'dline', x1: a[0], y1: a[1], x2: b[0], y2: b[1] }, document.getElementById('dLines')); }
  function connect() {
    const i = DS.next, pts = DS.pts, el = document.getElementById('d' + i);
    if (el) { el.classList.remove('next', 'hint'); el.classList.add('done'); }
    if (i > 0) addLine(pts[i - 1], pts[i]);
    sfx.dot(i); DS.next++;
    if (DS.next >= pts.length) { addLine(pts[pts.length - 1], pts[0]); finishDots(); } else markNext();
  }
  function finishDots() {
    DS.done = true; dotsUp(); clearTimeout(DS.hintT);
    const pts = DS.pts, d = 'M' + pts.map((p) => p.join(' ')).join('L') + 'Z';
    const fillCol = getComputedStyle(document.body).getPropertyValue('--accent').trim() || '#FF7A59';
    const shapeG = svgEl('g', { class: 'reveal' }); overlay.insertBefore(shapeG, overlay.firstChild);
    svgEl('path', { d, fill: fillCol, 'fill-opacity': 0.3, stroke: 'none' }, shapeG);
    const ex = svgEl('g', { class: 'reveal' }, overlay);
    for (const s of ART.DOTS[DS.id].extras) {
      svgEl('path', { d: s[0], fill: s[1] === 'k' ? '#3A2A4A' : s[1] === 'w' ? '#fff' : 'none', stroke: '#3A2A4A', 'stroke-width': 8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, ex);
    }
    const thing = t('things.' + DS.id);
    setBanner('🎉', t('dotsDone', { thing }));
    sfx.tada(); confetti(110);
    say(t('dotsDone', { thing }) + ' ' + t('praise'));
    $('#colorItBtn').classList.remove('hidden');
    setTimeout(giveSticker, 1700);
  }
  $('#colorItBtn').addEventListener('click', () => {
    const pts = DS.pts, d = 'M' + pts.map((p) => p.join(' ')).join('L') + 'Z', id = DS.id;
    const shapes = [[d, 'w', 1]].concat(ART.DOTS[id].extras);
    sfx.pick(); startWork('color', { shapes, lineLevel: 1 });
    setBanner('🎨', t('fillHint')); say(t('fillHint'));
  });

  // ================= DRAW WITH ME (lessons) =================
  const LS = { id: null, step: 0, raf: null, timers: [], done: false };
  function stopLessonAnim() {
    if (LS.raf) cancelAnimationFrame(LS.raf); LS.raf = null;
    LS.timers.forEach(clearTimeout); LS.timers = [];
    const gc = $('#guideCrayon'); if (gc) gc.classList.add('hidden');
  }
  function startLesson(id) {
    startWork('lesson'); LS.id = id; LS.step = 0; LS.done = false;
    $('#nextStep').classList.remove('hidden'); renderStep();
  }
  function renderStep() {
    stopLessonAnim();
    const L = ART.LESSONS[LS.id], st = L.steps[LS.step], n = L.steps.length;
    overlay.innerHTML = '';
    $('#stepDots').innerHTML = L.steps.map((_, i) => `<i class="${i < LS.step ? 'done' : i === LS.step ? 'now' : ''}"></i>`).join('');
    $('#prevStep').style.visibility = LS.step > 0 ? 'visible' : 'hidden';
    $('#nextStep').textContent = LS.step === n - 1 ? '✓' : '➜';
    const txt = t('steps.' + st.k);
    setBanner(L.emoji, t('step', { n: LS.step + 1, total: n }) + ' · ' + txt);
    let speak = txt; if (LS.step === 0) speak += ' ' + (S.level === 3 ? t('watchIt') : t('traceIt'));
    say(speak);
    if (st.k === 'color') { WS.tool = 'fill'; renderTools(); }
    if (S.level === 1) {
      L.steps.slice(0, LS.step).forEach((ps) => ps.d.forEach((d) => svgEl('path', { d, class: 'guide prev' }, overlay)));
    }
    if (!st.d.length) return;
    const paths = st.d.map((d) => svgEl('path', { d, class: 'guide' }, overlay));
    animateGuides(paths);
  }
  function animateGuides(paths) {
    const lens = paths.map((p) => { try { return p.getTotalLength() || 1; } catch (e) { return 1; } });
    paths.forEach((p, i) => { p.style.strokeDasharray = lens[i] + ' ' + lens[i]; p.style.strokeDashoffset = lens[i]; });
    const gc = $('#guideCrayon'); gc.classList.remove('hidden');
    let idx = 0, t0 = null;
    function frame(ts) {
      if (t0 == null) t0 = ts;
      const p = paths[idx], L = lens[idx], per = Math.max(450, L * 1.5), k = Math.min(1, (ts - t0) / per);
      p.style.strokeDashoffset = L * (1 - k);
      try { const pt = p.getPointAtLength(L * k); gc.style.left = (pt.x / W) * 100 + '%'; gc.style.top = (pt.y / H) * 100 + '%'; } catch (e) { /* ignore */ }
      if (k >= 1) { idx++; t0 = ts; if (idx >= paths.length) { gc.classList.add('hidden'); LS.raf = null; finishGuides(paths); return; } }
      LS.raf = requestAnimationFrame(frame);
    }
    LS.raf = requestAnimationFrame(frame);
  }
  function finishGuides(paths) {
    paths.forEach((p) => { p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; if (S.level < 3) p.classList.add('dash'); if (S.level === 2) p.classList.add('faint'); });
    if (S.level === 3) LS.timers.push(setTimeout(() => paths.forEach((p) => p.classList.add('gone')), 2200));
  }
  $('#nextStep').addEventListener('click', () => {
    const L = ART.LESSONS[LS.id];
    if (LS.step >= L.steps.length - 1) {
      LS.done = true; stopLessonAnim(); overlay.innerHTML = ''; $('#nextStep').classList.add('hidden');
      $('#stepDots').innerHTML = L.steps.map(() => '<i class="done"></i>').join('');
      setBanner('🎉', t('praise')); saveDrawing(true);
      return;
    }
    LS.step++; sfx.pick(); renderStep();
  });
  $('#prevStep').addEventListener('click', () => { if (LS.step > 0) { LS.step--; sfx.undo(); $('#nextStep').classList.remove('hidden'); renderStep(); } });

  // ================= PICKERS =================
  function themeFirst(obj) {
    const ids = Object.keys(obj), mine = ids.filter((k) => (obj[k].themes || []).indexOf(S.theme) >= 0);
    return mine.concat(ids.filter((k) => mine.indexOf(k) < 0));
  }
  let pickerKind = null;
  function card(inner, label, onClick, i) {
    const b = document.createElement('button'); b.className = 'card'; b.style.animationDelay = (i || 0) * 0.05 + 's';
    if (typeof inner === 'string') b.innerHTML = inner; else b.appendChild(inner);
    const l = document.createElement('span'); l.innerHTML = label; b.appendChild(l);
    b.addEventListener('click', () => { sfx.pick(); onClick(); });
    return b;
  }
  const mysteryColors = ['#FF6B6B', '#FFB703', '#4CC9F0', '#8AC926', '#9B5DE5', '#FF6FB5', '#FF8C42', '#2EC4B6'];
  function showPicker(kind) {
    pickerKind = kind; const cards = $('#cards'); cards.innerHTML = ''; let title = '', i = 0;
    const randomCard = (fn) => cards.appendChild(card('<div class="mystery" style="background:linear-gradient(135deg,#FF6B6B,#FFD23F,#4CC9F0,#9B5DE5)">🎲</div>', t('random'), fn, i++));
    if (kind === 'color') {
      title = t('pickPage'); const ids = themeFirst(ART.PAGES);
      randomCard(() => startColor(rnd(ids.slice(0, 3))));
      ids.forEach((id) => {
        const c = document.createElement('canvas'); c.width = 360; c.height = 270;
        const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, 360, 270);
        drawShapes(x, ART.PAGES[id].shapes(), S.level, LW[S.level - 1] * 1.4, 0.3);
        cards.appendChild(card(c, t('pages.' + id), () => startColor(id), i++));
      });
    } else if (kind === 'dots') {
      title = t('pickDots'); const ids = themeFirst(ART.DOTS);
      randomCard(() => startDots(rnd(ids)));
      shuffle(ids.slice(0, 4)).concat(ids.slice(4)).forEach((id, j) => {
        const n = ART.dotPoints(ART.DOTS[id], S.level).length;
        cards.appendChild(card(`<div class="mystery" style="background:${mysteryColors[j % mysteryColors.length]}">?</div>`, `<span class="badge">1 → ${n}</span>`, () => startDots(id), i++));
      });
    } else {
      title = t('pickLesson'); const ids = themeFirst(ART.LESSONS);
      randomCard(() => startLesson(rnd(ids)));
      ids.forEach((id) => {
        const L = ART.LESSONS[id];
        const paths = L.steps.reduce((a, s) => a.concat(s.d), []).map((d) => `<path d="${d}"/>`).join('');
        const svg = `<div class="thumb"><svg viewBox="0 0 1200 900"><g fill="none" stroke="#3A2A4A" stroke-width="14" stroke-linecap="round" stroke-linejoin="round">${paths}</g></svg></div>`;
        cards.appendChild(card(svg, L.emoji + ' ' + t('lessons.' + id), () => startLesson(id), i++));
      });
    }
    $('#pickerTitle').textContent = title; show('picker');
  }
  $('#pickerSay').addEventListener('click', () => say($('#pickerTitle').textContent));
  function startColor(id) {
    const pg = ART.PAGES[id];
    startWork('color', { shapes: pg.shapes(), lineLevel: S.level });
    setBanner(pg.emoji, t('pages.' + id) + ' — ' + t('fillHint'));
    say(t('fillHint'));
  }

  // ================= SURPRISE SPINNER =================
  let spinning = false, spinResult = null;
  const reelKinds = () => (S.level === 1 ? ['who', 'where'] : S.level === 2 ? ['who', 'doing', 'where'] : ['who', 'doing', 'where', 'bonus']);
  function pool(k) {
    if (k === 'doing') return SPIN.doing; if (k === 'bonus') return SPIN.bonus;
    const th = SPIN[k][S.theme] || []; return SPIN[k].base.concat(th, th);
  }
  const word = (item) => fill(item[S.lang === 'fr' ? 2 : 1]);
  function showSpin() {
    spinResult = null; $('#drawItBtn').classList.add('hidden'); $('#spinSentence').textContent = '';
    $('#spinBtn').innerHTML = '🎲 ' + t('spin');
    $('#reels').innerHTML = reelKinds().map((k) => `<div class="reel ${k === 'bonus' ? 'bonus' : ''}" data-k="${k}"><div class="re">❓</div><div class="rw"></div></div>`).join('');
    show('spin'); say(t('say_spin'));
  }
  function doSpin() {
    if (spinning) return; spinning = true; hush();
    $('#drawItBtn').classList.add('hidden'); $('#spinSentence').textContent = '';
    const reels = $$('#reels .reel'), picks = [];
    reels.forEach((r, i) => {
      const k = r.dataset.k, P = pool(k); r.classList.remove('landed'); r.classList.add('spinning');
      const iv = setInterval(() => { const it = rnd(P); r.querySelector('.re').textContent = it[0]; r.querySelector('.rw').textContent = word(it); sfx.tick(); }, 90);
      setTimeout(() => {
        clearInterval(iv); const it = rnd(P); picks[i] = { k, it };
        r.querySelector('.re').textContent = it[0]; r.querySelector('.rw').textContent = word(it);
        r.classList.remove('spinning'); r.classList.add('landed'); sfx.ding();
        if (i === reels.length - 1) setTimeout(() => finishSpin(picks), 350);
      }, 1000 + i * 650);
    });
  }
  function finishSpin(picks) {
    spinning = false;
    const get = (k) => { const p = picks.find((x) => x.k === k); return p ? word(p.it) : ''; };
    let s = t('drawPrefix') + ' ' + [get('who'), get('doing'), get('where')].filter(Boolean).join(' ') + '!';
    const b = get('bonus'); if (b) s += ' ' + t('bonus') + ' ' + b;
    spinResult = { text: s, emoji: picks.map((p) => p.it[0]).join('') };
    $('#spinSentence').textContent = s; say(s);
    $('#drawItBtn').classList.remove('hidden'); $('#spinBtn').innerHTML = '🎲 ' + t('again');
  }
  $('#spinBtn').addEventListener('click', doSpin);
  $('#spinSay').addEventListener('click', () => say($('#spinSentence').textContent || t('say_spin')));
  $('#drawItBtn').addEventListener('click', () => {
    if (!spinResult) return; sfx.pick(); startWork('draw'); setBanner(spinResult.emoji, spinResult.text);
  });

  // ================= GALLERY =================
  function showGallery() {
    const g = getGallery(), grid = $('#galleryGrid');
    if (!g.length) {
      grid.innerHTML = `<div class="empty">🖼️<br>${t('galleryEmpty')}<br><button class="pill-btn go" id="emptyDraw">🖍️ ${t('act_draw')}</button></div>`;
      $('#emptyDraw').addEventListener('click', () => { sfx.pick(); startDraw(); });
      say(t('galleryEmpty'));
    } else {
      grid.innerHTML = g.map((d, i) => `<button data-i="${i}"><img src="${d.img}" alt=""></button>`).join('');
      say(t('gallery'));
    }
    show('gallery');
  }
  $('#galleryGrid').addEventListener('click', (e) => { const b = e.target.closest('button[data-i]'); if (b) { sfx.pick(); openViewer(+b.dataset.i); } });
  function openViewer(i) {
    const d = getGallery()[i]; if (!d) return;
    openModal(`<img class="big" src="${d.img}" alt=""><div class="row">
      <button class="pill-btn go" id="vKeep">✏️ ${t('keepDrawing')}</button>
      <button class="pill-btn" id="vDown">⬇️ ${t('download')}</button>
      <button class="pill-btn" id="vDel">🗑️</button>
      <button class="pill-btn" id="vClose">✖</button></div>`);
    $('#vKeep').addEventListener('click', () => { closeModal(); startWork('draw', { image: d.img }); setBanner('🖍️', t('say_draw')); });
    $('#vDown').addEventListener('click', () => downloadImg(d.img, d.id));
    $('#vClose').addEventListener('click', closeModal);
    $('#vDel').addEventListener('click', () => confirmBox(t('reallyDelete'), () => {
      const g = getGallery(); g.splice(i, 1); setGallery(g); showGallery();
    }));
  }
  function downloadImg(url, id) {
    const dt = new Date(id || Date.now()), stamp = dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0');
    const a = document.createElement('a'); a.href = url; a.download = `${NAME.toLowerCase()}-drawing-${stamp}.jpg`;
    document.body.appendChild(a); a.click(); a.remove();
  }
  function confirmBox(q, yes) {
    openModal(`<h3>${q}</h3><div class="row"><button class="pill-btn" id="cNo">${t('no')}</button><button class="pill-btn go" id="cYes" style="background:#FF6B6B">${t('yes')}</button></div>`);
    $('#cNo').addEventListener('click', closeModal);
    $('#cYes').addEventListener('click', () => { closeModal(); yes(); });
  }

  // ================= PONY / GROWN-UPS =================
  function ponyPicker(first) {
    const html = `<h3>${t('ponyAsk')}</h3><div class="pony-pick">${Object.keys(PONIES).map((n) => {
      const p = PONIES[n];
      return `<button data-p="${n}" class="${S.pony === n ? 'on' : ''}" style="--coat:${p.coat};--snout:${p.snout};--mane:${p.mane}">${ART.PONY}<span>${n}</span></button>`;
    }).join('')}</div>`;
    openModal(html);
    say(t('ponyAsk'));
    $$('.pony-pick button').forEach((b) => b.addEventListener('click', () => {
      S.pony = b.dataset.p; store.set('pony', S.pony); applyPony(); neigh(); closeModal();
      setBubble(t('hello')); jump($('#ponyWrap'));
      setTimeout(() => say(first ? t('greet') : t('ponyHi')), 500);
    }));
  }
  function openParents() {
    const row = (label, id, on) => `<div class="set-row"><span>${label}</span><button class="pill-btn ${on ? 'on' : ''}" id="${id}">${on ? t('on') : t('off')}</button></div>`;
    openModal(`<h3>👪 ${t('grownups')}</h3>
      ${row(t('voice'), 'pVoice', S.voice)}${row(t('sounds'), 'pSound', S.sound)}
      <div class="set-row"><span>${t('renamePony')}</span><button class="pill-btn" id="pPony">🐴 ${S.pony || ''}</button></div>
      <div class="set-row"><span>${t('wipeGallery')}</span><button class="pill-btn warn" id="pWipeG">🗑️</button></div>
      <div class="set-row"><span>${t('wipeStickers')}</span><button class="pill-btn warn" id="pWipeS">🗑️</button></div>
      <p class="muted">${t('tipHome')}</p>
      <div class="row"><button class="pill-btn go" id="pClose">${t('close')}</button></div>`);
    $('#pVoice').addEventListener('click', () => { S.voice = !S.voice; store.set('voice', S.voice); if (!S.voice) hush(); openParents(); });
    $('#pSound').addEventListener('click', () => { S.sound = !S.sound; store.set('sound', S.sound); updateSoundBtn(); openParents(); });
    $('#pPony').addEventListener('click', () => ponyPicker(false));
    $('#pWipeG').addEventListener('click', () => confirmBox(t('wipeGallery') + '?', () => { setGallery([]); toast('✔'); }));
    $('#pWipeS').addEventListener('click', () => confirmBox(t('wipeStickers') + '?', () => { S.stickers = {}; store.set('stickers', {}); updateStickerNum(); toast('✔'); }));
    $('#pClose').addEventListener('click', closeModal);
  }
  (function holdToOpen() {
    const b = $('#parentBtn'); let tm = null, opened = false;
    const start = (e) => { e.preventDefault(); opened = false; b.classList.add('holding'); tm = setTimeout(() => { opened = true; b.classList.remove('holding'); openParents(); }, 1300); };
    const stop = () => { clearTimeout(tm); if (b.classList.contains('holding') && !opened) toast('⚙️ ' + t('holdOpen')); b.classList.remove('holding'); };
    b.addEventListener('pointerdown', start); b.addEventListener('pointerup', stop); b.addEventListener('pointerleave', stop); b.addEventListener('pointercancel', stop);
    b.addEventListener('contextmenu', (e) => e.preventDefault());
  })();
  function updateSoundBtn() { $('#soundBtn').textContent = S.sound ? '🔊' : '🔇'; }

  // ================= HOME =================
  function goHome() { hush(); stopLessonAnim(); show('home'); setBubble(t('hello')); }
  function startDraw() { startWork('draw'); setBanner('🖍️', t('say_draw')); say(t('say_draw')); }
  function go(act) {
    sfx.tap();
    if (act === 'draw') return startDraw();
    if (act === 'spin') return showSpin();
    showPicker(act === 'color' ? 'color' : act === 'dots' ? 'dots' : 'lesson');
    say(t('say_' + act));
  }
  $$('.tile').forEach((b) => b.addEventListener('click', () => go(b.dataset.act)));
  $$('[data-home]').forEach((b) => b.addEventListener('click', () => { sfx.tap(); goHome(); }));
  $('#themeBtns').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    S.theme = b.dataset.theme; store.set('theme', S.theme); applyTheme(); sfx.ding(); jump($('#ponyWrap'));
    say(t('th_' + S.theme)); setBubble(THEMES[S.theme].emoji + ' ' + t('th_' + S.theme));
  });
  $('#levelBtns').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    S.level = +b.dataset.level; store.set('level', S.level);
    $$('#levelBtns button').forEach((x) => x.classList.toggle('on', +x.dataset.level === S.level));
    sfx.pick(); say(raw('lvSay')[S.level - 1]);
  });
  $('#langToggle').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    S.lang = b.dataset.lang; store.set('lang', S.lang); applyLang(); sfx.pick(); setBubble(t('hello')); say(t('greetNoPony'));
  });
  $('#soundBtn').addEventListener('click', () => { S.sound = !S.sound; store.set('sound', S.sound); updateSoundBtn(); sfx.pick(); });
  $('#stickerBtn').addEventListener('click', () => { sfx.tap(); showStickers(); });
  $('#galleryBtn').addEventListener('click', () => { sfx.tap(); showGallery(); });
  $('#ellieWrap').addEventListener('click', () => { jump($('#ellieWrap')); sfx.giggle(); const s = t('ellieTap'); setBubble(s); say(s); });
  $('#ponyWrap').addEventListener('click', () => { jump($('#ponyWrap')); neigh(); const s = t('ponyTap'); setBubble(s); setTimeout(() => say(s), 700); });

  $('#goBtn').addEventListener('click', () => {
    audio(); sfx.tada();
    if (CFG.fullscreen) {
      const el = document.documentElement, rf = el.requestFullscreen || el.webkitRequestFullscreen;
      if (rf) { try { const p = rf.call(el); if (p && p.catch) p.catch(() => {}); } catch (e) { /* ignore */ } }
    }
    show('home'); setBubble(t('hello'));
    if (!S.pony || !PONIES[S.pony]) setTimeout(() => ponyPicker(true), 400);
    else { neigh(); setTimeout(() => say(t('greet')), 500); }
  });

  document.addEventListener('visibilitychange', () => { if (document.hidden) hush(); });

  // ================= INIT =================
  (function init() {
    const defs = document.createElement('div');
    defs.innerHTML = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">${ART.DEFS}</svg>`;
    document.body.insertBefore(defs.firstChild, document.body.firstChild);
    const avatar = CFG.avatarImage ? `<img src="${CFG.avatarImage}" alt="${NAME}">` : ART.ellieSVG('ellie');
    $('#ellieWrap').innerHTML = avatar;
    $('#ponyWrap').innerHTML = ART.PONY;
    $('#splashArt').innerHTML = (CFG.avatarImage ? `<img class="ellie" src="${CFG.avatarImage}" alt="">` : ART.ellieSVG('ellie')) + ART.PONY;
    $('#workHome').innerHTML = CFG.avatarImage ? `<img src="${CFG.avatarImage}" alt="" style="width:100%;height:100%;object-fit:cover">` : ART.ellieSVG('ellie', '74 66 172 172');
    applyPony(); applyLang(); applyTheme(); updateSoundBtn();
  })();

  // test hook (harmless)
  window.__ellie = { S, WS, startDots, startLesson, startColor, startDraw, showSpin, showGallery, showStickers, showPicker, giveSticker, goHome, DS };
})();
