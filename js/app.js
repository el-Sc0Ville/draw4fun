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
    sound: store.get('sound', true), voice: store.get('voice', true), pony: store.get('pony', null), stickers: store.get('stickers', {}),
    photo: store.get('photoBtn', true)
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
    night: { emoji: '🌙', color: '#3A3480', stamps: ['🌙', '⭐', '🌟', '🚀', '☁️', '🦉', '✨', '🦄'] },
    halloween: { emoji: '🎃', color: '#3D1F63', stamps: ['🎃', '👻', '🦇', '🕷️', '🕸️', '🍬', '🍭', '🌕'] }
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
  // all step-by-step drawings (paper library + the original on-tablet lessons)
  const LESSONS = (() => {
    const P = window.PAPER || { lessons: {}, legacy: {} }, out = {};
    Object.keys(ART.LESSONS).forEach((id) => {
      if (P.legacy[id]) out[id] = Object.assign({}, ART.LESSONS[id], P.legacy[id], { steps: ART.LESSONS[id].steps.filter((x) => x.d.length) });
    });
    return Object.assign(out, P.lessons);
  })();
  const CAT_EMOJI = { all: '🌈', new: '✨', horses: '🐴', animals: '🐾', sea: '🐠', yummy: '🍓', magic: '🔮', things: '🚗', halloween: '🎃' };
  const HALLOWEEN_SEASON = (() => { const d = new Date(), m = d.getMonth(), day = d.getDate(); return m === 9 || (m === 8 && day >= 20) || (m === 10 && day <= 3); })();
  const CATS = ['all', 'new'].concat(HALLOWEEN_SEASON ? ['halloween'] : [], ['horses', 'animals', 'sea', 'yummy', 'magic', 'things'], HALLOWEEN_SEASON ? [] : ['halloween']);
  const THEME_CAT = { ranch: 'horses', unicorn: 'magic', sea: 'sea', night: 'magic', halloween: 'halloween' };
  // ---- "seen" drawings + drawing of the day ----
  // ✓ "tried" = she started or finished it. (Carries over drawings she opened before this update.)
  const tried = store.get('paperTried', null) || (() => { const o = {}, sn = store.get('paperSeen', {}); Object.keys(sn).forEach((k) => { o[k] = { t: sn[k] }; }); return o; })();
  store.set('paperTried', tried);
  const isNew = (id) => !tried[id];
  function markTried(id, extra) { if (!LESSONS[id]) return; tried[id] = Object.assign(tried[id] || {}, { t: Date.now() }, extra || {}); store.set('paperTried', tried); }
  function lessonSvg(id) {
    const L = LESSONS[id];
    const paths = L.steps.reduce((a, st) => a.concat(st.d), []).map((d) => `<path d="${Array.isArray(d) ? d[0] : d}"${Array.isArray(d) && d[1] === 'k' ? ' fill="#3A2A4A"' : ''}/>`).join('');
    return `<svg viewBox="0 0 1200 900"><g fill="none" stroke="#3A2A4A" stroke-width="14" stroke-linecap="round" stroke-linejoin="round">${paths}</g></svg>`;
  }
  const lessonShapes = (L) => L.steps.reduce((a, st) => a.concat(st.d.map((d) => [Array.isArray(d) ? d[0] : d, Array.isArray(d) && d[1] === 'k' ? 'k' : 'n', 1])), []);
  const ORDER = (() => { // stable shuffled order so every day brings a different drawing
    const ids = Object.keys(LESSONS).sort(); let seed = 20261010;
    const r = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
    for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const x = ids[i]; ids[i] = ids[j]; ids[j] = x; }
    const h = ids.filter((id) => LESSONS[id].cat === 'horses'); if (h.length) { ids.splice(ids.indexOf(h[0]), 1); ids.unshift(h[0]); }
    return ids;
  })();
  function todayKey() { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function drawingOfTheDay() {
    const key = todayKey(), cur = store.get('dotd', null);
    if (cur && cur.date === key && LESSONS[cur.id]) return cur.id;
    const dayN = Math.floor(new Date(key.replace(/-/g, '/')).getTime() / 864e5);
    let id = null;
    if (!cur) id = ORDER.find((c) => LESSONS[c].cat === 'horses' && isNew(c)) || null; // the very first one is a horse!
    if (!id && HALLOWEEN_SEASON) id = ORDER.find((c) => LESSONS[c].cat === 'halloween' && isNew(c)) || null; // spooky season
    for (let k = 0; k < ORDER.length && !id; k++) { const c = ORDER[(dayN + k) % ORDER.length]; if (isNew(c)) { id = c; break; } }
    if (!id) id = ORDER[dayN % ORDER.length];
    store.set('dotd', { date: key, id }); return id;
  }
  function updateTodayPill() {
    const el = document.getElementById('todayPill'); if (!el) return;
    const id = drawingOfTheDay(); el.textContent = t('act_together_sub') + ' · 🌟 ' + t('today') + ': ' + LESSONS[id].emoji + ' ' + lessonName(id);
  }
  const pd = (d) => (Array.isArray(d) ? d[0] : d);
  const isK = (d) => Array.isArray(d) && d[1] === 'k';
  const li = () => (S.lang === 'fr' ? 1 : 0);
  function lessonName(id) { const L = LESSONS[id]; return L.name ? L.name[li()] : t('lessons.' + id); }
  function stepText(st) { return st.t ? st.t[li()] : t('steps.' + st.k); }

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
  // Picks the nicest voice on the device: Canadian first, then US/UK; skips robotic & novelty voices.
  // Grown-ups can override it in the ⚙️ menu (saved per language).
  let voices = [];
  const hasSpeech = 'speechSynthesis' in window;
  function loadVoices() { try { voices = window.speechSynthesis.getVoices() || []; } catch (e) { voices = []; } }
  if (hasSpeech) {
    loadVoices();
    try { window.speechSynthesis.onvoiceschanged = loadVoices; } catch (e) { /* ignore */ }
    let vTries = 0; const vPoll = setInterval(() => { loadVoices(); if (voices.length || ++vTries > 24) clearInterval(vPoll); }, 250);
  }
  let emojiRe = null; try { emojiRe = new RegExp('\\p{Extended_Pictographic}|\\uFE0F|\\u200D', 'gu'); } catch (e) { emojiRe = null; }
  const BAD_VOICE = /albert|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|junior|ralph|\bfred\b|kathy|eddy|\bflo\b|grandma|grandpa|\breed\b|rocko|sandy|shelley|deranged|hysterical|novelty|espeak/i;
  const NICE_VOICE = /premium|enhanced|natural|neural|wavenet|siri|google|samantha|\bava\b|allison|susan|\bzoe\b|nicky|karen|moira|tessa|serena|joanna|salli|kendra|kimberly|\bivy\b|am[ée]lie|aur[ée]lie|audrey|\bmarie\b|chantal|\bjulie\b|sylvie|c[ée]line|l[ée]a\b/i;
  const vlang = (v) => String(v.lang || '').replace(/_/g, '-').toLowerCase();
  const langPrefs = () => (S.lang === 'fr' ? ['fr-ca', 'fr-fr', 'fr-be', 'fr-ch', 'fr'] : ['en-ca', 'en-us', 'en-gb', 'en-au', 'en-ie', 'en-nz', 'en']);
  function voiceScore(v) {
    const L = vlang(v), prefs = langPrefs(), idx = prefs.findIndex((p) => L.indexOf(p) === 0);
    if (idx < 0) return -1;
    const n = String(v.name || '');
    let sc = 100 + (prefs.length - idx) * 8;
    if (BAD_VOICE.test(n)) sc -= 200;
    if (NICE_VOICE.test(n)) sc += 25;
    if (/premium|enhanced|neural|natural/i.test(n)) sc += 20;
    if (/compact/i.test(n)) sc -= 10;
    if (v.localService === false) sc += 4;
    return sc;
  }
  function voicesForLang() { return voices.filter((v) => voiceScore(v) >= 0).sort((x, y) => voiceScore(y) - voiceScore(x)); }
  const voiceId = (v) => v.voiceURI || v.name;
  function pickVoice() {
    const chosen = store.get('voice_' + S.lang, null);
    if (chosen) { const v = voices.find((x) => voiceId(x) === chosen); if (v) return v; }
    const list = voicesForLang();
    return list.length && voiceScore(list[0]) > 0 ? list[0] : null;
  }
  let sayT = null, laterT = null;
  function sayLater(text, ms) { clearTimeout(laterT); laterT = setTimeout(() => { laterT = null; say(text); }, ms || 500); }
  function say(text, force, queue) {
    if (!queue) clearTimeout(laterT);
    if ((!S.voice && !force) || !hasSpeech || !text) return;
    try {
      const ss = window.speechSynthesis;
      const clean = (emojiRe ? String(text).replace(emojiRe, '') : String(text)).replace(/\s+/g, ' ').trim();
      if (!clean) return;
      const u = new SpeechSynthesisUtterance(clean);
      const v = pickVoice();
      if (v) { u.voice = v; u.lang = v.lang; } else u.lang = S.lang === 'fr' ? 'fr-CA' : 'en-US';
      u.rate = store.get('voiceRate', 1); u.pitch = 1; u.volume = 1;
      if (queue && (ss.speaking || ss.pending)) { ss.speak(u); return; }
      clearTimeout(sayT);
      if (ss.speaking || ss.pending) { ss.cancel(); sayT = setTimeout(() => { try { ss.speak(u); } catch (e) { /* ignore */ } }, 90); }
      else ss.speak(u);
    } catch (e) { /* ignore */ }
  }
  function hush() { clearTimeout(sayT); if (hasSpeech) { try { window.speechSynthesis.cancel(); } catch (e) { /* ignore */ } } }

  // ================= UI helpers =================
  let toastT = null;
  function toast(msg) {
    const el = $('#toast'); el.textContent = msg; el.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 2200);
  }
  let tapGuardUntil = 0;
  const guardTaps = (ms) => { if (window.__ellieNoGuard) return; tapGuardUntil = Date.now() + (ms || 350); }; // (test scripts can switch it off)
  document.addEventListener('click', (e) => { if (Date.now() < tapGuardUntil) { e.stopPropagation(); e.preventDefault(); } }, true);
  let pickScroll = 0;
  function show(id) {
    const cur = document.querySelector('.screen.active');
    if (cur && cur.id === 'picker' && id !== 'picker') pickScroll = $('#cards').scrollTop;
    if (!cur || cur.id !== id) guardTaps();
    if (id !== 'spin') clearSpinTimers();
    $$('.screen').forEach((s) => s.classList.toggle('active', s.id === id));
    if (id !== 'work') stopLessonAnim();
    if (id !== 'paper') { stopPaperAnim(); wakeOff(); }
    if (id === 'work') requestAnimationFrame(fitStage);
  }
  // Pop-ups (menus, viewer, camera) get their own history step, so the tablet's Back button closes them first.
  const SID = Date.now() + '' + Math.floor(Math.random() * 1e6);
  let ovPushed = false, ignorePop = 0, afterPop = null;
  function ovOpen() { if (ovPushed) return; try { history.pushState({ d: NAV.length, sid: SID, ov: 1 }, ''); ovPushed = true; } catch (e) { /* ignore */ } }
  function ovRelease(then) {
    if (ovPushed) {
      ovPushed = false; ignorePop++; afterPop = then || null;
      try { history.back(); } catch (e) { ignorePop = Math.max(0, ignorePop - 1); afterPop = null; if (then) then(); }
    } else if (then) then();
  }
  let modalT = null, modalOnClose = null;
  function openModal(html, opts) {
    opts = opts || {};
    const m = $('#modal'); $('#modalCard').innerHTML = html; m.classList.remove('hidden');
    m.dataset.tap = opts.tapClose ? '1' : '';
    modalOnClose = opts.onClose || null;
    clearTimeout(modalT); if (opts.auto) modalT = setTimeout(() => closeModal(), opts.auto);
    ovOpen();
  }
  function hideModal() {
    clearTimeout(modalT); $('#modal').classList.add('hidden'); $('#modalCard').innerHTML = '';
    const cb = modalOnClose; modalOnClose = null; if (cb) cb();
  }
  function closeModal(then) { hideModal(); if ($('#camera').classList.contains('hidden')) ovRelease(then); else if (then) then(); }
  $('#modal').addEventListener('click', (e) => { if ($('#modal').dataset.tap === '1' || e.target.id === 'modal') closeModal(); });
  function jump(el) { el.classList.remove('jump'); void el.offsetWidth; el.classList.add('jump'); }

  // ================= NAVIGATION =================
  // One back arrow on every screen. Each screen is a step on a stack; the tablet's own back button
  // (Fire / Android) walks the same stack instead of leaving the app.
  const NAV = [];
  function navInit() { NAV.length = 0; NAV.push({ screen: 'home', restore: goHomeView }); try { history.replaceState({ d: 1, sid: SID }, ''); } catch (e) { /* ignore */ } }
  function nav(screen, restore, mode) {
    if (mode === 'none') return;
    if (mode === 'replace' && NAV.length > 1) { NAV[NAV.length - 1] = { screen, restore }; try { history.replaceState({ d: NAV.length, sid: SID }, ''); } catch (e) { /* ignore */ } return; }
    NAV.push({ screen, restore }); try { history.pushState({ d: NAV.length, sid: SID }, ''); } catch (e) { /* ignore */ }
  }
  function closeOverlaysSilently() {
    if (!$('#modal').classList.contains('hidden')) hideModal();
    if (!$('#camera').classList.contains('hidden')) closeCamera(true);
  }
  function popTo(depth) {
    depth = Math.max(1, Math.min(depth, NAV.length));
    if (depth === NAV.length) return;
    NAV.length = depth;
    ovPushed = false; closeOverlaysSilently(); hush();
    NAV[NAV.length - 1].restore();
  }
  function navBack() {
    sfx.tap();
    if (NAV.length <= 1) { goHomeView(); return; }
    let viaHistory = false;
    try { if (history.state && history.state.sid === SID && history.state.d === NAV.length && !history.state.ov) { history.back(); viaHistory = true; } } catch (e) { /* ignore */ }
    if (!viaHistory) popTo(NAV.length - 1);
  }
  window.addEventListener('popstate', (e) => {
    if (ignorePop > 0) { ignorePop--; const f = afterPop; afterPop = null; if (f) f(); return; }
    if (ovPushed) { ovPushed = false; closeOverlaysSilently(); return; } // Back closes the pop-up only
    const st = e.state || {}, d = st.d || 1;
    if (st.sid && st.sid !== SID) { // leftovers from before a page reload
      if (NAV.length === 1) { try { history.go(-d); } catch (er) { /* ignore */ } } else popTo(NAV.length - 1);
      return;
    }
    if (d < NAV.length) popTo(d);
    else if (d > NAV.length) { ignorePop++; try { history.go(-(d - NAV.length)); } catch (er) { ignorePop--; } } // no "forward"
  });

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
    const th = S.theme; let h = '', tail = '';
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
    } else if (th === 'halloween') {
      h += '<div class="deco hmoon" style="right:8vw;top:7vh"></div>';
      for (let i = 0; i < 10; i++) h += `<div class="deco twinkle" style="left:${r(2, 97)}vw;top:${r(3, 45)}vh;animation-delay:-${r(0, 24) / 10}s"></div>`;
      for (let i = 0; i < 4; i++) h += `<div class="deco bat" style="top:${r(8, 42)}vh;animation-duration:${r(16, 26)}s;animation-delay:-${r(0, 220) / 10}s"><span>🦇</span></div>`;
      h += '<div class="deco ghosty" style="left:5vw;top:24vh">👻</div>';
      tail = '<div class="deco pump" style="left:3vw;bottom:3vh">🎃</div><div class="deco pump small" style="right:4vw;bottom:5vh">🎃</div>';
    } else {
      h += '<div class="deco moon" style="right:10vw;top:8vh"></div>';
      for (let i = 0; i < 18; i++) h += `<div class="deco twinkle" style="left:${r(2, 97)}vw;top:${r(3, 68)}vh;animation-delay:-${r(0, 24) / 10}s"></div>`;
    }
    $('#scene').innerHTML = h + hills + tail;
    const meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.setAttribute('content', THEMES[th].color);
  }
  function applyTheme() {
    if (!THEMES[S.theme]) S.theme = 'ranch';
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
    if (typeof updateTodayPill === 'function') updateTodayPill();
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
    if (img) { // fit (never stretch) — photos are wider than the page
      const im = new Image();
      im.onload = () => { const sc = Math.min(W / im.width, H / im.height), dw = im.width * sc, dh = im.height * sc; pctx.drawImage(im, (W - dw) / 2, (H - dh) / 2, dw, dh); };
      im.src = img;
    }
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
    if (Date.now() < tapGuardUntil) return; // second half of a double-tap that opened this screen
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
  // A fast finger-lift on the canvas made Chromium swallow the NEXT tap (felt like "Color it" needed a double tap).
  const noFling = (e) => { if (e.target.closest && e.target.closest('button')) return; if (e.cancelable) e.preventDefault(); };
  stage.addEventListener('touchstart', noFling, { passive: false });
  stage.addEventListener('touchmove', noFling, { passive: false });
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

  function setBanner(emoji, text) {
    $('#bannerEmoji').textContent = emoji || ''; $('#bannerText').textContent = text || '';
    $('#banner').classList.toggle('long', String(text || '').length > 70);
    const b = $('#banner'); b.classList.remove('flash'); void b.offsetWidth; b.classList.add('flash');
  }

  function startWork(mode, opts) {
    opts = opts || {};
    WS.mode = mode; $('#work').dataset.mode = mode;
    WS.undo = []; WS.rewarded = false; pid = null; last = null;
    overlay.innerHTML = ''; overlay.classList.remove('tight'); $('#guideCrayon').classList.add('hidden'); $('#colorItBtn').classList.add('hidden');
    closeTray(); stopLessonAnim();
    resetPaint(opts.image);
    setLineArt(opts.shapes || null, opts.lineLevel || S.level);
    WS.tool = mode === 'color' ? 'fill' : 'crayon';
    if (mode === 'lesson') WS.color = '#2B2B2B';
    if (THEMES[S.theme].stamps.indexOf(WS.stamp) < 0 && EXTRA_STAMPS.indexOf(WS.stamp) < 0) WS.stamp = THEMES[S.theme].stamps[0];
    WS.lessonId = opts.lessonId || null;
    renderPalette(); renderTools();
    show('work');
    nav('work', () => show('work'), opts.nav || 'push');
  }

  // ---------- saving ----------
  // ---------- gallery: pictures live in IndexedDB (lots of room); the small list stays in localStorage ----------
  const GCACHE = {};
  function gcachePut(id, url) { GCACHE[id] = url; const k = Object.keys(GCACHE); while (k.length > 40) delete GCACHE[k.shift()]; }
  let gdbP = null;
  function gdb() {
    if (gdbP) return gdbP;
    gdbP = new Promise((resolve) => {
      try {
        if (!window.indexedDB) { resolve(null); return; }
        const req = indexedDB.open('draw4fun', 1);
        req.onupgradeneeded = () => { try { req.result.createObjectStore('img'); } catch (e) { /* ignore */ } };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
        req.onblocked = () => resolve(null);
      } catch (e) { resolve(null); }
    });
    return gdbP;
  }
  function idb(mode, fn) {
    return gdb().then((db) => new Promise((res) => {
      if (!db) { res(null); return; }
      try {
        const tx = db.transaction('img', mode), r = fn(tx.objectStore('img'));
        tx.oncomplete = () => res(r && r.result !== undefined && mode === 'readonly' ? r.result : true);
        tx.onerror = tx.onabort = () => res(null);
      } catch (e) { res(null); }
    }));
  }
  function getGallery() { return store.get('gallery', []); }
  function setGallery(g) { return store.set('gallery', g); }
  function galleryImg(item) {
    if (!item) return Promise.resolve(null);
    if (item.img) return Promise.resolve(item.img);
    if (GCACHE[item.id]) return Promise.resolve(GCACHE[item.id]);
    return idb('readonly', (st) => st.get(item.id)).then((v) => { if (typeof v === 'string') { gcachePut(item.id, v); return v; } return null; });
  }
  function addToGallery(url) {
    const g = getGallery(), id = Date.now();
    gcachePut(id, url); g.unshift({ id });
    while (g.length > 200) { const old = g.pop(); idb('readwrite', (st) => st.delete(old.id)); }
    setGallery(g);
    idb('readwrite', (st) => st.put(url, id)).then((ok) => {
      if (ok) return;
      // no IndexedDB on this device: keep the picture inside the list (smaller limit, oldest drop off)
      const g2 = getGallery(), it = g2.find((x) => x.id === id); if (!it) return;
      it.img = url;
      while (g2.length > 1 && JSON.stringify(g2).length > 2400000) g2.pop();
      if (!setGallery(g2)) toast('🙈');
    });
    return id;
  }
  function removeFromGallery(id) { setGallery(getGallery().filter((x) => x.id !== id)); delete GCACHE[id]; idb('readwrite', (st) => st.delete(id)); }
  function wipeGallery() { setGallery([]); Object.keys(GCACHE).forEach((k) => delete GCACHE[k]); idb('readwrite', (st) => st.clear()); }
  function migrateGallery() { // pictures saved by the previous version sat inside localStorage
    const g = getGallery(); if (!g.some((x) => x.img)) return;
    gdb().then((db) => {
      if (!db) return;
      let chain = Promise.resolve();
      g.filter((x) => x.img).forEach((it) => {
        chain = chain.then(() => idb('readwrite', (st) => st.put(it.img, it.id)).then((ok) => { if (ok) { gcachePut(it.id, it.img); delete it.img; } }));
      });
      chain.then(() => setGallery(g));
    });
  }
  function fillImgs(root) {
    const byId = {}; getGallery().forEach((x) => { byId[x.id] = x; });
    root.querySelectorAll('img[data-gid]').forEach((im) => {
      galleryImg(byId[im.dataset.gid]).then((url) => { if (url) im.src = url; });
    });
  }
  function composite(scale) {
    const c = document.createElement('canvas'); c.width = Math.round(W * scale); c.height = Math.round(H * scale);
    const x = c.getContext('2d'); x.drawImage(paint, 0, 0, c.width, c.height); x.drawImage(lineart, 0, 0, c.width, c.height); return c;
  }
  function saveDrawing(silent) {
    let url; try { url = composite(0.75).toDataURL('image/jpeg', 0.82); } catch (e) { toast('🙈'); return; }
    const gid = addToGallery(url);
    if (WS.lessonId) markTried(WS.lessonId, { img: gid });
    sfx.tada(); confetti(70);
    if (!silent) toast('⭐ ' + t('saved'));
    if (!WS.rewarded) { WS.rewarded = true; setTimeout(giveSticker, 700); } else say(t('saved'));
  }

  // ---------- stickers ----------
  function giveSticker() {
    const owned = S.stickers, unowned = STICKERS.filter((s) => !owned[s]);
    const s = unowned.length ? rnd(unowned) : rnd(STICKERS);
    owned[s] = (owned[s] || 0) + 1; store.set('stickers', owned); updateStickerNum();
    neigh(); setTimeout(() => say(t('praise') + ' ' + t('gotSticker'), false, true), 600);
    // a little pop-up that never blocks her taps, then flies to the sticker book
    const pop = $('#stickerPop');
    pop.innerHTML = `<div class="sp-emoji">${s}</div><div class="sp-text">${t('gotSticker')}</div>`;
    pop.classList.remove('show', 'fly'); void pop.offsetWidth; pop.classList.add('show');
    clearTimeout(popT1); clearTimeout(popT2);
    popT1 = setTimeout(() => pop.classList.add('fly'), 2300);
    popT2 = setTimeout(() => pop.classList.remove('show', 'fly'), 3050);
    confetti(110);
  }
  let popT1 = null, popT2 = null;
  function showStickers(navMode) {
    const owned = S.stickers, n = Object.keys(owned).length;
    $('#stickerCount').textContent = t('stickerCount', { n, total: STICKERS.length });
    $('#stickerGrid').innerHTML = STICKERS.map((s) => owned[s]
      ? `<button class="sticker" data-s="${s}">${s}${owned[s] > 1 ? `<span class="cnt">×${owned[s]}</span>` : ''}</button>`
      : '<div class="sticker locked">?</div>').join('');
    show('stickers'); say(t('stickerCount', { n, total: STICKERS.length }));
    nav('stickers', () => showStickers('none'), navMode || 'push');
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
    overlay.classList.toggle('tight', pts.length > 22);
    // labels sit outside the shape (along the outward normal), then get nudged apart so numbers never overlap
    const labs = pts.map((p, i) => {
      const a = pts[(i - 1 + pts.length) % pts.length], b = pts[(i + 1) % pts.length];
      let dx = -(b[1] - a[1]), dy = b[0] - a[0];
      if (dx * (p[0] - cx) + dy * (p[1] - cy) < 0) { dx = -dx; dy = -dy; }
      const L = Math.hypot(dx, dy) || 1; dx /= L; dy /= L;
      return { x: p[0] + dx * 34, y: p[1] + dy * 34, nx: dx, ny: dy };
    });
    const minGap = pts.length > 22 ? 31 : 36, n = labs.length;
    for (let it = 0; it < 30; it++) { // numbers push each other apart, stay off the dots, and stay near their own dot
      let moved = false;
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          let dx = labs[j].x - labs[i].x, dy = labs[j].y - labs[i].y, d = Math.hypot(dx, dy);
          if (d < minGap) {
            if (d < 0.01) { dx = labs[j].nx; dy = labs[j].ny; d = 1; }
            const push = (minGap - d) / 2 + 0.5; labs[i].x -= (dx / d) * push; labs[i].y -= (dy / d) * push; labs[j].x += (dx / d) * push; labs[j].y += (dy / d) * push; moved = true;
          }
        }
      }
      for (let i = 0; i < n; i++) {
        for (let k = 0; k < n; k++) {
          const dx = labs[i].x - pts[k][0], dy = labs[i].y - pts[k][1], d = Math.hypot(dx, dy);
          if (d < 23) { const push = 23 - d; labs[i].x += (d ? dx / d : labs[i].nx) * push; labs[i].y += (d ? dy / d : labs[i].ny) * push; moved = true; }
        }
        const dx = labs[i].x - pts[i][0], dy = labs[i].y - pts[i][1], d = Math.hypot(dx, dy);
        if (d > 60) { labs[i].x = pts[i][0] + (dx / d) * 60; labs[i].y = pts[i][1] + (dy / d) * 60; }
      }
      if (!moved) break;
    }
    pts.forEach((p, i) => {
      const dg = svgEl('g', { class: 'dot', id: 'd' + i }, g);
      svgEl('circle', { class: 'halo', cx: p[0], cy: p[1], r: 30 }, dg);
      svgEl('circle', { class: 'core', cx: p[0], cy: p[1], r: 11 }, dg);
      const tx = svgEl('text', { x: Math.round(labs[i].x), y: Math.round(labs[i].y + 10), 'text-anchor': 'middle' }, dg);
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
    sfx.pick(); startWork('color', { shapes, lineLevel: 1, nav: 'replace' });
    setBanner('🎨', t('fillHint')); say(t('fillHint'));
  });

  // ================= DRAW WITH ME (lessons) =================
  const LS = { id: null, step: 0, raf: null, timers: [], done: false, steps: [] };
  function stopLessonAnim() {
    if (LS.raf) cancelAnimationFrame(LS.raf); LS.raf = null;
    LS.timers.forEach(clearTimeout); LS.timers = [];
    const gc = $('#guideCrayon'); if (gc) gc.classList.add('hidden');
  }
  function startLesson(id) {
    startWork('lesson', { lessonId: id }); LS.id = id; LS.step = 0; LS.done = false; markTried(id);
    LS.steps = LESSONS[id].steps.concat([{ k: 'color', d: [] }]);
    $('#nextStep').classList.remove('hidden'); renderStep();
  }
  function renderStep() {
    stopLessonAnim();
    const L = { emoji: LESSONS[LS.id].emoji, steps: LS.steps }, st = L.steps[LS.step], n = L.steps.length;
    overlay.innerHTML = '';
    $('#stepDots').innerHTML = L.steps.map((_, i) => `<i class="${i < LS.step ? 'done' : i === LS.step ? 'now' : ''}"></i>`).join('');
    $('#prevStep').style.visibility = LS.step > 0 ? 'visible' : 'hidden';
    $('#nextStep').textContent = LS.step === n - 1 ? '✓' : '➜';
    const txt = stepText(st);
    setBanner(L.emoji, t('step', { n: LS.step + 1, total: n }) + ' · ' + txt);
    let speak = txt; if (LS.step === 0) speak += ' ' + (S.level === 3 ? t('watchIt') : t('traceIt'));
    say(speak);
    if (st.k === 'color') { WS.tool = 'fill'; if (WS.color === '#2B2B2B') WS.color = '#FF6FB5'; renderPalette(); renderTools(); }
    $('#skipStep').style.visibility = st.k === 'color' ? 'hidden' : 'visible';
    if (S.level === 1) {
      L.steps.slice(0, LS.step).forEach((ps) => ps.d.forEach((d) => svgEl('path', { d: pd(d), class: 'guide prev' }, overlay)));
    }
    if (!st.d.length) return;
    const paths = st.d.map((d) => svgEl('path', { d: pd(d), class: 'guide' }, overlay));
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
    const L = { steps: LS.steps };
    if (LS.step >= L.steps.length - 1) {
      LS.done = true; stopLessonAnim(); overlay.innerHTML = ''; $('#nextStep').classList.add('hidden');
      $('#prevStep').style.visibility = 'hidden'; $('#skipStep').style.visibility = 'hidden';
      $('#stepDots').innerHTML = L.steps.map(() => '<i class="done"></i>').join('');
      setBanner('🎉', t('praise')); saveDrawing(true);
      return;
    }
    LS.step++; sfx.pick(); renderStep();
  });
  $('#skipStep').addEventListener('click', () => { // ⏩ show the whole drawing and jump to coloring
    setLineArt(lessonShapes(LESSONS[LS.id]), 1); LS.step = LS.steps.length - 1; sfx.pick();
    $('#nextStep').classList.remove('hidden'); renderStep();
  });
  $('#prevStep').addEventListener('click', () => { if (LS.step > 0 && !LS.done) { LS.step--; sfx.undo(); $('#nextStep').classList.remove('hidden'); renderStep(); } });


  // ================= DRAW TOGETHER (copy on paper) =================
  const PV = { id: null, step: -1, raf: null, rewarded: false, wake: null, cache: {} };
  const pStage = $('#paperStage'), pSvg = $('#paperSvg'), pColor = $('#paperColor'), pcx = pColor.getContext('2d');
  function fitPaper() {
    const wrap = $('#paperWrap'), ww = wrap.clientWidth, wh = wrap.clientHeight; if (!ww || !wh) return;
    let w = ww, h = (w * 3) / 4; if (h > wh) { h = wh; w = (h * 4) / 3; }
    pStage.style.width = Math.floor(w) + 'px'; pStage.style.height = Math.floor(h) + 'px';
  }
  window.addEventListener('resize', () => { if ($('#paper').classList.contains('active')) fitPaper(); });
  window.addEventListener('orientationchange', () => setTimeout(fitPaper, 300));
  function wakeOn() {
    try { if (navigator.wakeLock && !PV.wake) navigator.wakeLock.request('screen').then((l) => { PV.wake = l; l.addEventListener('release', () => { PV.wake = null; }); }).catch(() => {}); } catch (e) { /* ignore */ }
  }
  function wakeOff() { try { if (PV.wake) { PV.wake.release(); PV.wake = null; } } catch (e) { /* ignore */ } }
  document.addEventListener('visibilitychange', () => { if (!document.hidden && $('#paper').classList.contains('active')) wakeOn(); });
  function stopPaperAnim() { if (PV.raf) cancelAnimationFrame(PV.raf); PV.raf = null; const c = $('#paperCrayon'); if (c) c.classList.add('hidden'); }

  function openPaper(id, opts) {
    opts = opts || {};
    const L = LESSONS[id];
    PV.id = id; PV.step = opts.atEnd ? L.steps.length : -1; PV.rewarded = !!opts.atEnd; PV.skipped = !!opts.atEnd;
    $('#paperTitle').textContent = L.emoji + ' ' + lessonName(id);
    show('paper'); wakeOn();
    requestAnimationFrame(() => { fitPaper(); renderPaper(); });
    nav('paper', () => restorePaper(id), opts.nav || 'push');
  }
  function restorePaper(id) {
    if (PV.id !== id) { PV.id = id; PV.step = -1; }
    $('#paperTitle').textContent = LESSONS[id].emoji + ' ' + lessonName(id);
    show('paper'); wakeOn();
    requestAnimationFrame(() => { fitPaper(); renderPaper(true); });
  }
  function colorLesson(id, navMode) {
    const L = LESSONS[id];
    startWork('color', { shapes: lessonShapes(L), lineLevel: 1, lessonId: id, nav: navMode || 'push' });
    setBanner(L.emoji, lessonName(id) + ' — ' + t('fillHint')); say(t('fillHint'));
  }
  function paperPath(d, cls) { return svgEl('path', { d: pd(d), class: cls + (isK(d) ? ' k' : '') }, pSvg); }
  function setPaperText(big, small, hint) {
    $('#paperText').innerHTML = `<b>${big}</b><span>${small}</span>${hint ? `<em>${hint}</em>` : ''}`;
  }
  function renderPaper(quiet) {
    stopPaperAnim();
    const L = LESSONS[PV.id], n = L.steps.length, s = PV.step, intro = s < 0, end = s >= n;
    const wasEnd = PV.wasEnd; PV.wasEnd = end; PV.wasEndPrev = wasEnd;
    pSvg.innerHTML = ''; pColor.classList.remove('show');
    $('#paperDots').innerHTML = L.steps.map((_, i) => `<i class="${i < s ? 'done' : i === s ? 'now' : ''}"></i>`).join('');
    $('#paperEnd').classList.toggle('hidden', !end);
    $('#paperNav').classList.toggle('hidden', end);
    $('#pSkip').classList.toggle('hidden', end);
    $('#pPhoto').classList.toggle('hidden', !S.photo);
    $('#pBack').style.visibility = intro ? 'hidden' : 'visible';
    $('#pReplay').style.visibility = intro ? 'hidden' : 'visible';
    $('#stepBadge').textContent = intro ? '✏️' : end ? '🎉' : String(s + 1);
    $('#pNext').textContent = intro ? '▶' : '➜';
    pStage.classList.toggle('intro', intro);
    requestAnimationFrame(fitPaper);
    if (intro) {
      L.steps.forEach((st) => st.d.forEach((d) => paperPath(d, 'ink')));
      const big = t('paperIntro', { thing: lessonName(PV.id) });
      setPaperText(big, t('paperIntroSub'));
      PV.lastSay = big + ' ' + t('paperIntroSub'); if (!quiet) say(PV.lastSay);
      return;
    }
    if (end) {
      L.steps.forEach((st) => st.d.forEach((d) => paperPath(d, 'ink')));
      markTried(PV.id);
      setPaperText(t('doneDrawing'), t('colorYours'));
      PV.lastSay = t('doneDrawing') + ' ' + t('colorYours'); if (!quiet) say(PV.lastSay);
      if (!PV.wasEndPrev) guardTaps(); // a double-tap on ➜ must not hit the end-screen buttons
      setTimeout(showColorIdea, 30);
      if (!PV.rewarded) { PV.rewarded = true; if (!PV.skipped) { sfx.tada(); confetti(120); setTimeout(giveSticker, 1600); } }
      return;
    }
    if (s === 0) markTried(PV.id);
    L.steps.slice(0, s).forEach((st) => st.d.forEach((d) => paperPath(d, 'ink')));
    const fresh = L.steps[s].d.map((d) => paperPath(d, 'new'));
    const txt = stepText(L.steps[s]);
    setPaperText(t('stepN', { n: s + 1 }) + ' <small>/ ' + n + '</small>', txt, t('copyPink'));
    PV.lastSay = s === 0 ? txt + ' ' + t('copyPink') : txt; if (!quiet) say(PV.lastSay);
    animatePaper(fresh);
  }
  function animatePaper(paths) {
    const lens = paths.map((p) => { try { return p.getTotalLength() || 1; } catch (e) { return 1; } });
    paths.forEach((p, i) => { p.style.strokeDasharray = lens[i] + ' ' + lens[i]; p.style.strokeDashoffset = lens[i]; });
    const cr = $('#paperCrayon'); cr.classList.remove('hidden');
    let idx = 0, t0 = null;
    function frame(ts) {
      if (t0 == null) t0 = ts;
      const p = paths[idx], L = lens[idx], per = Math.max(700, L * 2.1), k = Math.min(1, (ts - t0) / per);
      const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      p.style.strokeDashoffset = L * (1 - e);
      try { const pt = p.getPointAtLength(L * e); cr.style.left = (pt.x / W) * 100 + '%'; cr.style.top = (pt.y / H) * 100 + '%'; } catch (er) { /* ignore */ }
      if (k >= 1) {
        p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; p.classList.add('filled');
        idx++; t0 = ts;
        if (idx >= paths.length) { cr.classList.add('hidden'); PV.raf = null; return; }
      }
      PV.raf = requestAnimationFrame(frame);
    }
    PV.raf = requestAnimationFrame(frame);
  }
  // paint a "color idea" by pouring colors into the closed shapes
  function colorize(L) {
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const x = c.getContext('2d'); x.lineCap = 'round'; x.lineJoin = 'round'; x.lineWidth = 10; x.strokeStyle = '#000'; x.fillStyle = '#000';
    L.steps.forEach((st) => st.d.forEach((d) => { let p; try { p = new Path2D(pd(d)); } catch (e) { return; } if (isK(d)) x.fill(p); x.stroke(p); }));
    const src = x.getImageData(0, 0, W, H).data, N = W * H, wall = new Uint8Array(N);
    for (let i = 0, j = 3; i < N; i++, j += 4) wall[i] = src[j] > 90 ? 1 : 0;
    const out = x.createImageData(W, H), px = new Uint32Array(out.data.buffer), done = new Uint8Array(N);
    const seeds = [];
    (L.colors || []).forEach((cc) => {
      if (cc[0] === 'grid') { for (let yy = cc[2]; yy <= cc[4]; yy += cc[5]) for (let xx = cc[1]; xx <= cc[3]; xx += cc[5]) seeds.push([xx, yy, cc[6]]); }
      else seeds.push(cc);
    });
    const vis = new Uint8Array(N);
    for (const sd of seeds) {
      const sx = sd[0] | 0, sy = sd[1] | 0; if (sx <= 0 || sy <= 0 || sx >= W - 1 || sy >= H - 1) continue;
      const rgb = hexRgb(sd[2]), col = ((255 << 24) | (rgb[2] << 16) | (rgb[1] << 8) | rgb[0]) >>> 0;
      let st = sy * W + sx;
      if (wall[st] || (done[st] && px[st] !== col)) {
        let found = -1;
        for (let r = 3; r <= 21 && found < 0; r += 3) {
          for (let q = 0; q < 16; q++) {
            const xx = Math.round(sx + r * Math.cos(q * Math.PI / 8)), yy = Math.round(sy + r * Math.sin(q * Math.PI / 8));
            if (xx <= 0 || yy <= 0 || xx >= W - 1 || yy >= H - 1) continue;
            const k = yy * W + xx; if (!wall[k] && !done[k] && !vis[k]) { found = k; break; }
          }
        }
        if (found < 0) continue;
        st = found;
      } else if (done[st] || vis[st]) continue;
      const region = [], stack = [st]; let leak = false; vis[st] = 1;
      while (stack.length) {
        const i = stack.pop(); region.push(i);
        const y = (i / W) | 0, xx = i - y * W;
        if (xx === 0 || xx === W - 1 || y === 0 || y === H - 1) { leak = true; break; }
        const nb = [i - 1, i + 1, i - W, i + W];
        for (let q = 0; q < 4; q++) { const k = nb[q]; if (!vis[k] && !wall[k] && !done[k]) { vis[k] = 1; stack.push(k); } }
      }
      if (leak) continue; // that seed was outside the drawing: skip it
      for (const i of region) { px[i] = col; done[i] = 1; }
    }
    for (let pass = 0; pass < 4; pass++) {
      const add = [];
      for (let i = W; i < N - W; i++) {
        if (done[i] || !wall[i]) continue;
        const n = done[i - 1] ? i - 1 : done[i + 1] ? i + 1 : done[i - W] ? i - W : done[i + W] ? i + W : -1;
        if (n >= 0) add.push(i, n);
      }
      for (let k = 0; k < add.length; k += 2) { px[add[k]] = px[add[k + 1]]; done[add[k]] = 1; }
    }
    return out;
  }
  function colorIdea(id) { // small cache (each picture is ~4 MB in memory)
    const c = PV.cache;
    if (c[id]) { const v = c[id]; delete c[id]; c[id] = v; return v; }
    const v = colorize(LESSONS[id]); c[id] = v;
    const keys = Object.keys(c); while (keys.length > 4) delete c[keys.shift()];
    return v;
  }
  function showColorIdea() {
    const L = LESSONS[PV.id]; if (!L.colors || !L.colors.length) return;
    pcx.clearRect(0, 0, W, H); pcx.putImageData(colorIdea(PV.id), 0, 0);
    requestAnimationFrame(() => pColor.classList.add('show'));
  }
  $('#pNext').addEventListener('click', () => { sfx.pick(); PV.step++; renderPaper(); });
  $('#pBack').addEventListener('click', () => { if (PV.step > -1) { sfx.undo(); PV.step--; renderPaper(); } });
  $('#pReplay').addEventListener('click', () => { sfx.tap(); renderPaper(); });
  pStage.addEventListener('click', () => { if (PV.step >= 0 && PV.step < LESSONS[PV.id].steps.length) { sfx.tap(); renderPaper(); } });
  $('#paperSay').addEventListener('click', () => say(PV.lastSay || $('#paperText').textContent));
  $('#pAgain').addEventListener('click', () => { sfx.pick(); PV.step = 0; PV.rewarded = false; PV.skipped = false; renderPaper(); });
  $('#pTablet').addEventListener('click', () => { sfx.pick(); startLesson(PV.id); });
  $('#pSkip').addEventListener('click', () => { // ⏩ jump straight to the finished drawing
    const n = LESSONS[PV.id].steps.length; if (PV.step < Math.floor(n / 2)) PV.skipped = true;
    sfx.pick(); PV.step = n; renderPaper();
  });
  $('#pColor').addEventListener('click', () => { sfx.pick(); colorLesson(PV.id); });
  $('#pPhoto').addEventListener('click', () => { sfx.tap(); openCamera(PV.id); });
  // ================= CAMERA: "Show me your drawing" =================
  // Front camera with a 3-2-1 countdown; saves her photo side by side with the intended result.
  const CAM = { stream: null, id: null, shot: null, busy: false };
  function refImage(id) {
    const L = LESSONS[id], c = document.createElement('canvas'); c.width = W; c.height = H;
    const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, W, H);
    if (L.colors && L.colors.length) {
      const tc = document.createElement('canvas'); tc.width = W; tc.height = H; tc.getContext('2d').putImageData(colorIdea(id), 0, 0); x.drawImage(tc, 0, 0);
    }
    x.lineCap = 'round'; x.lineJoin = 'round'; x.lineWidth = 10; x.strokeStyle = '#3A2A4A'; x.fillStyle = '#3A2A4A';
    L.steps.forEach((st) => st.d.forEach((d) => { let p; try { p = new Path2D(pd(d)); } catch (e) { return; } if (isK(d)) x.fill(p); x.stroke(p); }));
    return c;
  }
  function camState(mode) {
    $('#camVideo').classList.toggle('hidden', mode !== 'live');
    $('#camShot').classList.toggle('hidden', mode !== 'shot');
    $('#camSnap').classList.toggle('hidden', mode !== 'live');
    $('#camApp').classList.toggle('hidden', mode !== 'fallback');
    $('#camRetake').classList.toggle('hidden', mode !== 'shot');
    $('#camKeep').classList.toggle('hidden', mode !== 'shot');
    $('#camCount').textContent = '';
  }
  function openCamera(id) {
    CAM.id = id; CAM.shot = null; CAM.busy = false;
    const rc = $('#camRef'), rx = rc.getContext('2d'); rx.clearRect(0, 0, rc.width, rc.height); rx.drawImage(refImage(id), 0, 0, rc.width, rc.height);
    camState('live'); $('#camText').textContent = t('camHold');
    $('#camera').classList.remove('hidden'); say(t('camHold'));
    ovOpen(); startStream();
  }
  function startStream() {
    const md = navigator.mediaDevices;
    if (!md || !md.getUserMedia) { camFallback(); return; }
    md.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } }, audio: false })
      .then((st) => {
        if ($('#camera').classList.contains('hidden')) { st.getTracks().forEach((tr) => tr.stop()); return; }
        CAM.stream = st; const v = $('#camVideo'); v.srcObject = st; const pl = v.play(); if (pl && pl.catch) pl.catch(() => {});
        if (CAM.wantSnap) { CAM.wantSnap = false; setTimeout(startCountdown, 400); }
      })
      .catch(() => camFallback());
  }
  function camFallback() { camState('fallback'); $('#camText').textContent = t('camNo'); }
  function stopStream() {
    if (CAM.stream) { CAM.stream.getTracks().forEach((tr) => { try { tr.stop(); } catch (e) { /* ignore */ } }); CAM.stream = null; }
    const v = $('#camVideo'); if (v) { try { v.srcObject = null; } catch (e) { /* ignore */ } }
  }
  function closeCamera(silent) {
    const wasOpen = !$('#camera').classList.contains('hidden');
    stopStream(); CAM.busy = false; CAM.wantSnap = false; $('#camera').classList.add('hidden');
    if (wasOpen && !silent) ovRelease();
  }
  function takeShot() {
    const v = $('#camVideo'), c = $('#camShot'), vw = v.videoWidth || 1280, vh = v.videoHeight || 960;
    c.width = vw; c.height = vh; c.getContext('2d').drawImage(v, 0, 0, vw, vh);
    CAM.shot = c; const f = $('#camFlash'); f.classList.remove('go'); void f.offsetWidth; f.classList.add('go');
    tone(1300, 0.08, 'square', 0.07); stopStream(); camState('shot');
    $('#camText').textContent = t('camWow'); say(t('camWow')); confetti(60);
  }
  $('#camSnap').addEventListener('click', () => {
    if (!CAM.stream) { CAM.wantSnap = true; $('#camCount').textContent = '⏳'; return; }
    startCountdown();
  });
  function startCountdown() {
    if (CAM.busy || !CAM.stream) return; CAM.busy = true; let n = 3; const cnt = $('#camCount');
    const tick = () => {
      if ($('#camera').classList.contains('hidden') || !CAM.stream) { CAM.busy = false; cnt.textContent = ''; return; }
      if (n > 0) { cnt.textContent = n; tone(600 + (3 - n) * 140, 0.16, 'sine', 0.18); n--; setTimeout(tick, 800); return; }
      cnt.textContent = ''; CAM.busy = false; takeShot();
    };
    tick();
  }
  $('#camRetake').addEventListener('click', () => { sfx.tap(); CAM.shot = null; camState('live'); $('#camText').textContent = t('camHold'); startStream(); });
  $('#camClose').addEventListener('click', () => { sfx.tap(); closeCamera(); });
  $('#camApp').addEventListener('click', () => { sfx.tap(); $('#photoInput').click(); });
  $('#photoInput').addEventListener('change', (e) => { // camera-app fallback
    const file = e.target.files && e.target.files[0]; e.target.value = '';
    if (!file) return;
    const url = URL.createObjectURL(file), im = new Image();
    im.onload = () => {
      const sc = Math.min(1, 1280 / Math.max(im.width, im.height)), c = $('#camShot');
      c.width = Math.round(im.width * sc); c.height = Math.round(im.height * sc);
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
      CAM.shot = c; camState('shot'); $('#camText').textContent = t('camWow'); say(t('camWow')); confetti(60);
    };
    im.onerror = () => URL.revokeObjectURL(url);
    im.src = url;
  });
  function rrPath(x, X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
  function sideBySide(shot, ref, id) {
    const c = document.createElement('canvas'); c.width = 1400; c.height = 760;
    const x = c.getContext('2d'); x.fillStyle = '#FFF8E6'; x.fillRect(0, 0, 1400, 760);
    const frame = (img, fx, fy, fw, fh, cover) => {
      x.save(); rrPath(x, fx, fy, fw, fh, 28); x.clip(); x.fillStyle = '#fff'; x.fillRect(fx, fy, fw, fh);
      const iw = img.width, ih = img.height, sc = cover ? Math.max(fw / iw, fh / ih) : Math.min(fw / iw, fh / ih), dw = iw * sc, dh = ih * sc;
      x.drawImage(img, fx + (fw - dw) / 2, fy + (fh - dh) / 2, dw, dh); x.restore();
      x.lineWidth = 8; x.strokeStyle = '#FFD23F'; rrPath(x, fx, fy, fw, fh, 28); x.stroke();
    };
    frame(shot, 40, 100, 640, 480, true); frame(ref, 720, 100, 640, 480, false);
    const font = (px) => `bold ${px}px Fredoka, "Chalkboard SE", "Comic Sans MS", sans-serif`;
    x.fillStyle = '#3A2A4A'; x.textAlign = 'center'; x.font = font(44); x.fillText(`${NAME} · ${lessonName(id)}`, 700, 68);
    x.font = font(34); x.fillText(t('myDrawing'), 360, 636); x.fillText(t('theIdea'), 1040, 636);
    let dateTxt = ''; try { dateTxt = new Date().toLocaleDateString(S.lang === 'fr' ? 'fr-CA' : 'en-CA', { year: 'numeric', month: 'long', day: 'numeric' }); } catch (e) { /* ignore */ }
    x.font = font(26); x.fillStyle = '#9a8aaa'; x.fillText(dateTxt, 700, 716);
    const out = document.createElement('canvas'); out.width = 1100; out.height = Math.round(760 * 1100 / 1400);
    out.getContext('2d').drawImage(c, 0, 0, out.width, out.height); return out;
  }
  $('#camKeep').addEventListener('click', () => {
    if (!CAM.shot) return;
    let url; try { url = sideBySide(CAM.shot, $('#camRef'), CAM.id).toDataURL('image/jpeg', 0.78); } catch (e) { toast('🙈'); return; }
    const gid = addToGallery(url); markTried(CAM.id, { photo: gid });
    sfx.tada(); confetti(110); neigh(); toast('⭐ ' + t('photoSaved')); sayLater(t('photoSaved'), 500);
    closeCamera();
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden && CAM.stream) closeCamera(); });

  // ================= PICKERS =================
  function themeFirst(obj) {
    const ids = Object.keys(obj), mine = ids.filter((k) => (obj[k].themes || []).indexOf(S.theme) >= 0);
    return mine.concat(ids.filter((k) => mine.indexOf(k) < 0));
  }
  let pickerKind = null, togetherCat = 'all', pickerToken = 0;
  function card(inner, label, onClick, i) {
    const b = document.createElement('button'); b.className = 'card'; b.style.animationDelay = Math.min(i || 0, 14) * 0.04 + 's';
    if (typeof inner === 'string') b.innerHTML = inner; else b.appendChild(inner);
    const l = document.createElement('span'); l.innerHTML = label; b.appendChild(l);
    b.addEventListener('click', () => { sfx.pick(); onClick(); });
    return b;
  }
  const mysteryColors = ['#FF6B6B', '#FFB703', '#4CC9F0', '#8AC926', '#9B5DE5', '#FF6FB5', '#FF8C42', '#2EC4B6'];
  function showPicker(kind, navMode) {
    pickerKind = kind; pickerToken++; const cards = $('#cards'); cards.innerHTML = ''; let title = '', i = 0;
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
      const want = THEME_CAT[S.theme] || 'horses';
      const more = Object.keys(LESSONS).filter((id) => LESSONS[id].cat === want)
        .concat(HALLOWEEN_SEASON && want !== 'halloween' ? Object.keys(LESSONS).filter((id) => LESSONS[id].cat === 'halloween') : []).slice(0, 16);
      if (more.length) {
        const h = document.createElement('div'); h.className = 'section-title'; h.textContent = '🎨 ' + t('moreToColor'); cards.appendChild(h);
        more.forEach((id) => cards.appendChild(card(`<div class="thumb paper-thumb">${lessonSvg(id)}</div>`, `${LESSONS[id].emoji} ${lessonName(id)}`, () => colorLesson(id), i++)));
      }
    } else if (kind === 'dots') {
      title = t('pickDots'); const ids = themeFirst(ART.DOTS);
      randomCard(() => startDots(rnd(ids)));
      shuffle(ids.slice(0, 4)).concat(ids.slice(4)).forEach((id, j) => {
        const n = ART.dotPoints(ART.DOTS[id], S.level).length;
        cards.appendChild(card(`<div class="mystery" style="background:${mysteryColors[j % mysteryColors.length]}">?</div>`, `<span class="badge">1 → ${n}</span>`, () => startDots(id), i++));
      });
    } else {
      title = t('pickTogether');
      cards.appendChild(buildTogetherTop());
      const chips = document.createElement('div'); chips.className = 'chips';
      chips.innerHTML = CATS.map((c) => {
        const n = c === 'new' ? Object.keys(LESSONS).filter(isNew).length : 0;
        return `<button data-c="${c}" class="${c === togetherCat ? 'on' : ''}">${CAT_EMOJI[c]} ${t('cat_' + c)}${c === 'new' ? ` <i>${n}</i>` : ''}</button>`;
      }).join('');
      chips.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; togetherCat = b.dataset.c; sfx.pick(); showPicker('lesson', 'none'); });
      cards.appendChild(chips);
      const ids = Object.keys(LESSONS).filter((id) => togetherCat === 'all' || (togetherCat === 'new' ? isNew(id) : LESSONS[id].cat === togetherCat))
        .sort((a, b) => ((isNew(a) ? 0 : 1) - (isNew(b) ? 0 : 1)) || (LESSONS[a].level - LESSONS[b].level) || ((LESSONS[a].cat === 'horses' ? 0 : 1) - (LESSONS[b].cat === 'horses' ? 0 : 1)));
      if (!ids.length) {
        const e = document.createElement('div'); e.className = 'empty'; e.textContent = '🏆 ' + t('allTried'); cards.appendChild(e);
      } else {
        randomCard(() => openPaper(rnd(ids)));
        const token = ++pickerToken; let k = 0;
        const batch = () => { // first cards now, the rest in quick batches (keeps slower tablets snappy)
          if (token !== pickerToken) return;
          const frag = document.createDocumentFragment();
          for (let n = 0; n < (k === 0 ? 10 : 16) && k < ids.length; n++, k++) {
            const id = ids[k], L = LESSONS[id];
            const cd = card(togetherThumb(id), `${L.emoji} ${lessonName(id)}<span class="lvl">${'⭐'.repeat(L.level)}</span>`, () => openPaper(id), i++);
            cd.dataset.id = id; if (!isNew(id)) cd.classList.add('tried');
            frag.appendChild(cd);
          }
          cards.appendChild(frag);
          if (k < ids.length) setTimeout(batch, 16);
        };
        batch();
      }
    }
    $('#pickerTitle').textContent = title; show('picker');
    nav('picker', () => restorePicker(kind), navMode || 'push');
  }
  $('#pickerSay').addEventListener('click', () => say($('#pickerTitle').textContent));
  const togetherBadge = (id) => (isNew(id) ? `<b class="new-badge">${t('newBadge')}</b>` : '<i class="done-badge">✓</i>');
  const togetherThumb = (id, big) => `<div class="thumb paper-thumb${big ? ' big' : ''}">${togetherBadge(id)}${lessonSvg(id)}</div>`;
  function buildTogetherTop() {
    const tid = drawingOfTheDay(), TL = LESSONS[tid];
    const feat = card(togetherThumb(tid, true), `<span class="today-tag">🌟 ${t('todayTitle')}</span>${TL.emoji} ${lessonName(tid)}<span class="lvl">${'⭐'.repeat(TL.level)}</span>`, () => openPaper(tid), 0);
    feat.classList.add('today-card'); feat.dataset.id = tid;
    // 🕘 recently done (her photo or colored version when she made one)
    const all = Object.keys(LESSONS), nTried = all.filter((id) => tried[id]).length;
    const recent = all.filter((id) => tried[id]).sort((a, b) => tried[b].t - tried[a].t).slice(0, 12);
    const top = document.createElement('div'); top.className = 'top-row' + (recent.length ? '' : ' solo'); top.appendChild(feat);
    if (recent.length) {
      const inGal = {}; getGallery().forEach((g) => { inGal[g.id] = 1; });
      const mini = (id) => {
        const r = tried[id], gid = (r.photo && inGal[r.photo] && r.photo) || (r.img && inGal[r.img] && r.img);
        return `<button class="mini" data-id="${id}"><span class="mini-img">${gid ? `<img data-gid="${gid}" alt="">` : lessonSvg(id)}</span><span class="mini-name">${LESSONS[id].emoji} ${lessonName(id)}</span><i class="done-badge">✓</i></button>`;
      };
      const rs = document.createElement('div'); rs.className = 'recent';
      rs.innerHTML = `<div class="recent-head"><b>🕘 ${t('recentDone')}</b><span class="progress">✓ ${t('triedCount', { n: nTried, total: all.length })}</span></div><div class="recent-strip">${recent.map(mini).join('')}</div>`;
      rs.addEventListener('click', (e) => { const b = e.target.closest('[data-id]'); if (b) { sfx.pick(); openPaper(b.dataset.id, { atEnd: true }); } });
      fillImgs(rs); top.appendChild(rs);
    }
    return top;
  }
  function refreshTogether() {
    const cards = $('#cards');
    cards.querySelectorAll('.card[data-id]').forEach((cd) => {
      const id = cd.dataset.id, th = cd.querySelector('.thumb'); if (!th || !LESSONS[id]) return;
      const old = th.querySelector('.new-badge, .done-badge'); if (old) old.remove();
      th.insertAdjacentHTML('afterbegin', togetherBadge(id));
      if (!cd.classList.contains('today-card')) cd.classList.toggle('tried', !isNew(id));
    });
    const top = cards.querySelector('.top-row'); if (top) top.replaceWith(buildTogetherTop());
    const nb = cards.querySelector('.chips button[data-c="new"] i'); if (nb) nb.textContent = Object.keys(LESSONS).filter(isNew).length;
  }
  function restorePicker(kind) {
    if (pickerKind === kind && $('#cards').children.length) {
      show('picker'); if (kind === 'lesson') refreshTogether();
      const y = pickScroll; requestAnimationFrame(() => { $('#cards').scrollTop = y; });
    } else showPicker(kind, 'none');
  }
  function startColor(id) {
    const pg = ART.PAGES[id];
    startWork('color', { shapes: pg.shapes(), lineLevel: S.level });
    setBanner(pg.emoji, t('pages.' + id) + ' — ' + t('fillHint'));
    say(t('fillHint'));
  }

  // ================= SURPRISE SPINNER =================
  let spinning = false, spinResult = null, spinTimers = [], spinToken = 0;
  function clearSpinTimers() { spinTimers.forEach((x) => { clearTimeout(x); clearInterval(x); }); spinTimers = []; spinning = false; spinToken++; $$('#reels .reel').forEach((r) => r.classList.remove('spinning')); }
  const reelKinds = () => (S.level === 1 ? ['who', 'where'] : S.level === 2 ? ['who', 'doing', 'where'] : ['who', 'doing', 'where', 'bonus']);
  function pool(k) {
    if (k === 'doing') { const dt = (SPIN.doingTheme && SPIN.doingTheme[S.theme]) || []; return SPIN.doing.concat(dt, dt); }
    if (k === 'bonus') return SPIN.bonus;
    const th = SPIN[k][S.theme] || []; return SPIN[k].base.concat(th, th);
  }
  const word = (item) => fill(item[S.lang === 'fr' ? 2 : 1]);
  function showSpin(navMode) {
    clearSpinTimers(); spinResult = null; $('#drawItBtn').classList.add('hidden'); $('#spinSentence').textContent = '';
    $('#spinBtn').innerHTML = '🎲 ' + t('spin');
    $('#reels').innerHTML = reelKinds().map((k) => `<div class="reel ${k === 'bonus' ? 'bonus' : ''}" data-k="${k}"><div class="re">❓</div><div class="rw"></div></div>`).join('');
    show('spin'); say(t('say_spin'));
    nav('spin', () => show('spin'), navMode || 'push');
  }
  function doSpin() {
    if (spinning) return; spinning = true; hush();
    const tok = ++spinToken;
    $('#drawItBtn').classList.add('hidden'); $('#spinSentence').textContent = '';
    const reels = $$('#reels .reel'), picks = [];
    reels.forEach((r, i) => {
      const k = r.dataset.k, P = pool(k); r.classList.remove('landed'); r.classList.add('spinning');
      const iv = setInterval(() => { const it = rnd(P); r.querySelector('.re').textContent = it[0]; r.querySelector('.rw').textContent = word(it); sfx.tick(); }, 90);
      spinTimers.push(iv);
      spinTimers.push(setTimeout(() => {
        clearInterval(iv); if (tok !== spinToken) return;
        const it = rnd(P); picks[i] = { k, it };
        r.querySelector('.re').textContent = it[0]; r.querySelector('.rw').textContent = word(it);
        r.classList.remove('spinning'); r.classList.add('landed'); sfx.ding();
        if (i === reels.length - 1) spinTimers.push(setTimeout(() => { if (tok === spinToken) finishSpin(picks); }, 350));
      }, 1000 + i * 650));
    });
  }
  function finishSpin(picks) {
    spinning = false;
    const get = (k) => { const p = picks.find((x) => x.k === k); return p ? word(p.it) : ''; };
    let s = t('drawPrefix') + ' ' + [get('who'), get('doing'), get('where')].filter(Boolean).join(' ') + '!';
    const b = get('bonus'); if (b) s += ' ' + t('bonus') + ' ' + b;
    spinResult = { text: s, emoji: picks.map((p) => p.it[0]).join('') };
    $('#spinSentence').textContent = s; if ($('#spin').classList.contains('active')) say(s);
    $('#drawItBtn').classList.remove('hidden'); $('#spinBtn').innerHTML = '🎲 ' + t('again');
  }
  $('#spinBtn').addEventListener('click', doSpin);
  $('#spinSay').addEventListener('click', () => say($('#spinSentence').textContent || t('say_spin')));
  $('#drawItBtn').addEventListener('click', () => {
    if (!spinResult) return; sfx.pick(); startWork('draw'); setBanner(spinResult.emoji, spinResult.text);
  });

  // ================= GALLERY =================
  function showGallery(navMode) {
    const g = getGallery(), grid = $('#galleryGrid');
    if (!g.length) {
      grid.innerHTML = `<div class="empty">🖼️<br>${t('galleryEmpty')}<br><button class="pill-btn go" id="emptyDraw">🖍️ ${t('act_draw')}</button></div>`;
      $('#emptyDraw').addEventListener('click', () => { sfx.pick(); startDraw(); });
      say(t('galleryEmpty'));
    } else {
      grid.innerHTML = g.map((d, i) => `<button data-i="${i}"><img data-gid="${d.id}" alt=""></button>`).join('');
      fillImgs(grid);
      say(t('gallery'));
    }
    show('gallery');
    nav('gallery', () => showGallery('none'), navMode || 'push');
  }
  $('#galleryGrid').addEventListener('click', (e) => { const b = e.target.closest('button[data-i]'); if (b) { sfx.pick(); openViewer(+b.dataset.i); } });
  function openViewer(i) {
    const d = getGallery()[i]; if (!d) return;
    galleryImg(d).then((url) => {
      if (!url) { toast('🙈'); return; }
      openModal(`<img class="big" src="${url}" alt=""><div class="row">
        <button class="pill-btn go" id="vKeep">✏️ ${t('keepDrawing')}</button>
        <button class="pill-btn" id="vDown">⬇️ ${t('download')}</button>
        <button class="pill-btn" id="vDel">🗑️</button>
        <button class="pill-btn" id="vClose">✖</button></div>`);
      $('#vKeep').addEventListener('click', () => closeModal(() => { startWork('draw', { image: url }); setBanner('🖍️', t('say_draw')); }));
      $('#vDown').addEventListener('click', () => downloadImg(url, d.id));
      $('#vClose').addEventListener('click', () => closeModal());
      $('#vDel').addEventListener('click', () => confirmBox(t('reallyDelete'), () => { removeFromGallery(d.id); showGallery('none'); }));
    });
  }
  function downloadImg(url, id) {
    const dt = new Date(id || Date.now()), stamp = dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0');
    const a = document.createElement('a'); a.href = url; a.download = `${NAME.toLowerCase()}-drawing-${stamp}.jpg`;
    document.body.appendChild(a); a.click(); a.remove();
  }
  function confirmBox(q, yes) {
    openModal(`<h3>${q}</h3><div class="row"><button class="pill-btn" id="cNo">${t('no')}</button><button class="pill-btn go" id="cYes" style="background:#FF6B6B">${t('yes')}</button></div>`);
    $('#cNo').addEventListener('click', () => closeModal());
    $('#cYes').addEventListener('click', () => closeModal(yes));
  }

  // ================= PONY / GROWN-UPS =================
  function ponyPicker(first) {
    const html = `<h3>${t('ponyAsk')}</h3><div class="pony-pick">${Object.keys(PONIES).map((n) => {
      const p = PONIES[n];
      return `<button data-p="${n}" class="${S.pony === n ? 'on' : ''}" style="--coat:${p.coat};--snout:${p.snout};--mane:${p.mane}">${ART.PONY}<span>${n}</span></button>`;
    }).join('')}</div>`;
    openModal(html, { onClose: () => { if (!S.pony) { S.pony = 'Caramel'; store.set('pony', S.pony); applyPony(); } } });
    say(t('ponyAsk'));
    $$('.pony-pick button').forEach((b) => b.addEventListener('click', () => {
      S.pony = b.dataset.p; store.set('pony', S.pony); applyPony(); neigh(); closeModal();
      setBubble(t('hello')); jump($('#ponyWrap'));
      sayLater(first ? t('greet') : t('ponyHi'), 500);
    }));
  }
  const esc = (x) => String(x).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function openParents() {
    const row = (label, id, on) => `<div class="set-row"><span>${label}</span><button class="pill-btn ${on ? 'on' : ''}" id="${id}">${on ? t('on') : t('off')}</button></div>`;
    const cur = store.get('voice_' + S.lang, null) ? pickVoice() : null, slow = store.get('voiceRate', 1) < 1;
    openModal(`<h3>👪 ${t('grownups')}</h3>
      ${row(t('voice'), 'pVoice', S.voice)}
      <div class="set-row"><span>${t('chooseVoice')}</span><button class="pill-btn" id="pVoicePick">🗣️ ${cur ? esc(cur.name) : t('voiceAuto')}</button></div>
      <div class="set-row"><span>${t('voiceSpeed')}</span><button class="pill-btn" id="pRate">${slow ? '🐢 ' + t('slow') : '🐇 ' + t('normal')}</button></div>
      ${row(t('sounds'), 'pSound', S.sound)}
      ${row(t('photoBtn'), 'pPhotoOpt', S.photo)}
      <div class="set-row"><span>${t('renamePony')}</span><button class="pill-btn" id="pPony">🐴 ${S.pony || ''}</button></div>
      <div class="set-row"><span>${t('wipeGallery')}</span><button class="pill-btn warn" id="pWipeG">🗑️</button></div>
      <div class="set-row"><span>${t('wipeStickers')}</span><button class="pill-btn warn" id="pWipeS">🗑️</button></div>
      <div class="set-row"><span>${t('wipeTried')}</span><button class="pill-btn warn" id="pWipeT">🗑️</button></div>
      <p class="muted">${t('tipHome')}</p>
      <div class="row"><button class="pill-btn go" id="pClose">${t('close')}</button></div>`);
    $('#pVoice').addEventListener('click', () => { S.voice = !S.voice; store.set('voice', S.voice); if (!S.voice) hush(); openParents(); });
    $('#pVoicePick').addEventListener('click', openVoicePicker);
    $('#pRate').addEventListener('click', () => { store.set('voiceRate', slow ? 1 : 0.85); openParents(); say(t('voiceTest'), true); });
    $('#pSound').addEventListener('click', () => { S.sound = !S.sound; store.set('sound', S.sound); updateSoundBtn(); openParents(); });
    $('#pPhotoOpt').addEventListener('click', () => { S.photo = !S.photo; store.set('photoBtn', S.photo); openParents(); });
    $('#pPony').addEventListener('click', () => ponyPicker(false));
    $('#pWipeG').addEventListener('click', () => confirmBox(t('wipeGallery') + '?', () => { wipeGallery(); toast('✔'); }));
    $('#pWipeS').addEventListener('click', () => confirmBox(t('wipeStickers') + '?', () => { S.stickers = {}; store.set('stickers', {}); updateStickerNum(); toast('✔'); }));
    $('#pWipeT').addEventListener('click', () => confirmBox(t('wipeTried') + '?', () => { Object.keys(tried).forEach((k) => delete tried[k]); store.set('paperTried', tried); store.set('paperSeen', {}); toast('✔'); }));
    $('#pClose').addEventListener('click', () => closeModal());
  }
  function openVoicePicker() {
    loadVoices();
    const list = voicesForLang().slice(0, 16), cur = store.get('voice_' + S.lang, '') || '';
    const opts = [`<button class="voice-opt ${!cur ? 'on' : ''}" data-v="">✨ ${t('voiceAuto')}</button>`]
      .concat(list.map((v) => `<button class="voice-opt ${cur === voiceId(v) ? 'on' : ''}" data-v="${esc(voiceId(v))}">${esc(v.name)} <small>${esc(v.lang)}</small></button>`));
    openModal(`<h3>🗣️ ${t('chooseVoice')}</h3><p class="muted">${list.length ? t('voiceHelp') : t('voiceNone')}</p>
      <div class="voice-list">${opts.join('')}</div><div class="row"><button class="pill-btn go" id="vpDone">${t('close')}</button></div>`);
    $$('.voice-opt').forEach((b) => b.addEventListener('click', () => {
      store.set('voice_' + S.lang, b.dataset.v || null);
      $$('.voice-opt').forEach((x) => x.classList.toggle('on', x === b));
      say(t('voiceTest'), true);
    }));
    $('#vpDone').addEventListener('click', openParents);
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
  function goHomeView() { hush(); stopLessonAnim(); show('home'); setBubble(t('hello')); updateTodayPill(); }
  function startDraw() { startWork('draw'); setBanner('🖍️', t('say_draw')); say(t('say_draw')); }
  function go(act) {
    sfx.tap();
    if (act === 'draw') return startDraw();
    if (act === 'spin') return showSpin();
    showPicker(act === 'color' ? 'color' : act === 'dots' ? 'dots' : 'lesson');
    if (act === 'together') { const id = drawingOfTheDay(); say(t('say_together') + ' ' + t('todaySay', { thing: lessonName(id) })); return; }
    say(t('say_' + act));
  }
  $$('.tile').forEach((b) => b.addEventListener('click', () => go(b.dataset.act)));
  $$('[data-back]').forEach((b) => b.addEventListener('click', navBack));
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
  $('#ponyWrap').addEventListener('click', () => { jump($('#ponyWrap')); neigh(); const s = t('ponyTap'); setBubble(s); sayLater(s, 700); });

  $('#goBtn').addEventListener('click', () => {
    audio(); sfx.tada();
    if (CFG.fullscreen && fsSupported && !isFs()) enterFs();
    show('home'); setBubble(t('hello'));
    if (!S.pony || !PONIES[S.pony]) setTimeout(() => ponyPicker(true), 400);
    else { neigh(); sayLater(t('greet'), 500); }
  });

  document.addEventListener('visibilitychange', () => { if (document.hidden) hush(); });

  // ---------- full screen ----------
  const fsEl = document.documentElement;
  const isStandalone = !!(window.navigator.standalone || (window.matchMedia && window.matchMedia('(display-mode: standalone), (display-mode: fullscreen)').matches));
  const fsSupported = !!(fsEl.requestFullscreen || fsEl.webkitRequestFullscreen) && !isStandalone;
  const isFs = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
  function enterFs() { try { const rf = fsEl.requestFullscreen || fsEl.webkitRequestFullscreen; const pr = rf.call(fsEl); if (pr && pr.catch) pr.catch(() => {}); } catch (e) { /* ignore */ } }
  function toggleFs() { try { if (isFs()) (document.exitFullscreen || document.webkitExitFullscreen).call(document); else enterFs(); } catch (e) { /* ignore */ } }
  const FS_IN = '<svg viewBox="0 0 24 24" width="26" height="26"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" fill="none" stroke="#555" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const FS_OUT = '<svg viewBox="0 0 24 24" width="26" height="26"><path d="M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5" fill="none" stroke="#555" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  function updFs() { const b = $('#fsBtn'); if (b) b.innerHTML = isFs() ? FS_OUT : FS_IN; }
  $('#fsBtn').classList.toggle('hidden', !fsSupported);
  $('#fsBtn').addEventListener('click', () => { sfx.tap(); toggleFs(); });
  document.addEventListener('fullscreenchange', updFs); document.addEventListener('webkitfullscreenchange', updFs); updFs();

  // ================= INIT =================
  (function init() {
    const defs = document.createElement('div');
    defs.innerHTML = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">${ART.DEFS}</svg>`;
    document.body.insertBefore(defs.firstChild, document.body.firstChild);
    const avatar = CFG.avatarImage ? `<img src="${CFG.avatarImage}" alt="${NAME}">` : ART.ellieSVG('ellie');
    $('#ellieWrap').innerHTML = avatar;
    $('#ponyWrap').innerHTML = ART.PONY;
    $('#splashArt').innerHTML = (CFG.avatarImage ? `<img class="ellie" src="${CFG.avatarImage}" alt="">` : ART.ellieSVG('ellie')) + ART.PONY;
    applyPony(); applyLang(); applyTheme(); updateSoundBtn(); navInit(); migrateGallery();
  })();

  // test hook (harmless)
  window.__ellie = { drawingOfTheDay, ORDER, tried, markTried, colorLesson, openCamera, closeCamera, CAM, LESSONS, openPaper, PV, colorize, S, WS, startDots, startLesson, startColor, startDraw, showSpin, showGallery, showStickers, showPicker, giveSticker, goHomeView, navBack, NAV, pickVoice, voicesForLang, DS };
})();
