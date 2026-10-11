/* draw4fun pack: halloween */
(function () {
  'use strict';
  const H = window.ART.helpers, ell = H.ell, circ = H.circ, rr = H.rr, star = H.starD, heart = H.heartD;
  const L = window.PAPER.lessons;

  // ---------- little geometry helpers (so lines MEET exactly) ----------
  const f = (n) => Math.round(n * 10) / 10;
  const RAD = Math.PI / 180;
  const P = (p) => f(p[0]) + ' ' + f(p[1]);
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  // ellipse e = [cx, cy, rx, ry, rotDeg]; point at angle a (degrees, y down)
  const ep = (e, a) => {
    const r = (e[4] || 0) * RAD, x = e[2] * Math.cos(a * RAD), y = e[3] * Math.sin(a * RAD);
    return [e[0] + x * Math.cos(r) - y * Math.sin(r), e[1] + x * Math.sin(r) + y * Math.cos(r)];
  };
  const E = (e) => ell(e[0], e[1], e[2], e[3], e[4] || 0);
  // < 1 when p is inside ellipse e
  const inE = (e, p) => {
    const r = -(e[4] || 0) * RAD, dx = p[0] - e[0], dy = p[1] - e[1];
    const x = dx * Math.cos(r) - dy * Math.sin(r), y = dx * Math.sin(r) + dy * Math.cos(r);
    return (x * x) / (e[2] * e[2]) + (y * y) / (e[3] * e[3]);
  };
  // 'A' command along ellipse e from angle a1 to angle a2 (a2 > a1 = clockwise on screen)
  const eA = (e, a1, a2) => `A${e[2]} ${e[3]} ${e[4] || 0} ${Math.abs(a2 - a1) > 180 ? 1 : 0} ${a2 > a1 ? 1 : 0} ${P(ep(e, a2))}`;
  // angle on ellipse e (between a0 and a1) where it crosses the outline of shape ins (ins(p) < 1 inside)
  function cross(e, a0, a1, ins) {
    let g0 = ins(ep(e, a0)) - 1;
    for (let i = 0; i < 60; i++) { const m = (a0 + a1) / 2, gm = ins(ep(e, m)) - 1; if ((gm < 0) === (g0 < 0)) { a0 = m; g0 = gm; } else a1 = m; }
    return (a0 + a1) / 2;
  }
  // point on an unrotated ellipse at a given x (s = -1 top, +1 bottom)
  const ex = (e, x, s) => [x, e[1] + s * e[3] * Math.sqrt(Math.max(0, 1 - Math.pow((x - e[0]) / e[2], 2)))];
  // cubic / quadratic bezier points
  const bz = (c, t) => { const u = 1 - t; return [0, 1].map((k) => u * u * u * c[0][k] + 3 * u * u * t * c[1][k] + 3 * u * t * t * c[2][k] + t * t * t * c[3][k]); };
  const qz = (c, t) => { const u = 1 - t; return [0, 1].map((k) => u * u * c[0][k] + 2 * u * t * c[1][k] + t * t * c[2][k]); };
  const Cs = (c) => `C${P(c[1])} ${P(c[2])} ${P(c[3])}`;
  const C = (c) => `M${P(c[0])}` + Cs(c);
  // point where a (monotonic between t0..t1) cubic reaches x (k = 0) or y (k = 1)
  function bzAt(c, v, k, t0, t1) {
    k = k || 0; let a = t0 == null ? 0 : t0, b = t1 == null ? 1 : t1;
    const up = bz(c, b)[k] > bz(c, a)[k];
    for (let i = 0; i < 50; i++) { const m = (a + b) / 2; if ((bz(c, m)[k] < v) === up) a = m; else b = m; }
    return bz(c, (a + b) / 2);
  }
  // rewrite every point of an absolute path (M L C Q A H V Z); fx maps [x, y] -> [x, y], ks scales arc radii
  function remap(d, fx, ks, flip) {
    const tok = d.match(/[A-Za-z]|-?\d*\.?\d+(?:e-?\d+)?/g); let out = '', cmd = '', args = [];
    const N = { M: 2, L: 2, C: 6, Q: 4, A: 7, Z: 0 };
    const flush = () => {
      if (!cmd) return; const n = N[cmd];
      if (n === 0) { out += 'Z'; return; }
      for (let i = 0; i < args.length; i += n) {
        const g = args.slice(i, i + n);
        if (cmd === 'A') { g[0] *= ks; g[1] *= ks; if (flip) { g[2] = -g[2]; g[4] = 1 - g[4]; } const q = fx([g[5], g[6]]); g[5] = q[0]; g[6] = q[1]; }
        else for (let j = 0; j < g.length; j += 2) { const q = fx([g[j], g[j + 1]]); g[j] = q[0]; g[j + 1] = q[1]; }
        out += cmd + g.map((v) => f(v)).join(' ');
      }
    };
    for (const t of tok) { if (/[A-Za-z]/.test(t)) { flush(); cmd = t; args = []; } else args.push(+t); }
    flush(); return out;
  }
  // mirror a path around x = ax (600 by default)
  const mir = (d, ax) => remap(d, (p) => [2 * (ax == null ? 600 : ax) - p[0], p[1]], 1, true);
  // scale a path by s, then move it by (tx, ty)
  const xf = (d, s, tx, ty) => remap(d, (p) => [p[0] * s + tx, p[1] * s + ty], s, false);
  const mp = (p) => [1200 - p[0], p[1]];
  // soft scallops through pts; dep > 0 bulges up when travelling to the right
  function scal(pts, dep, noMove) {
    let d = noMove ? '' : 'M' + P(pts[0]);
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy);
      d += `Q${P([(a[0] + b[0]) / 2 + (dy / l) * dep * 2, (a[1] + b[1]) / 2 - (dx / l) * dep * 2])} ${P(b)}`;
    }
    return d;
  }
  // round bumps through pts (sw 1 = bulge up when travelling to the right)
  function bumps(pts, sw) {
    let d = '';
    for (let i = 1; i < pts.length; i++) { const r = f(dist(pts[i], pts[i - 1]) / 2); d += `A${r} ${r} 0 0 ${sw} ${P(pts[i])}`; }
    return d;
  }
  // a little "sausage" arm from two points on the body to a round end
  function arm(b1, b2, hc, r) {
    const m = [(b1[0] + b2[0]) / 2, (b1[1] + b2[1]) / 2], len = dist(hc, m);
    const d = [(hc[0] - m[0]) / len, (hc[1] - m[1]) / len], n = [-d[1], d[0]];
    let s1 = [hc[0] + r * n[0], hc[1] + r * n[1]], s2 = [hc[0] - r * n[0], hc[1] - r * n[1]];
    if (dist(s1, b1) > dist(s2, b1)) { const t = s1; s1 = s2; s2 = t; }
    const v = [s1[0] - hc[0], s1[1] - hc[1]], sw = v[0] * d[1] - v[1] * d[0] < 0 ? 0 : 1;
    return { d: `M${P(b1)}L${P(s1)}A${r} ${r} 0 0 ${sw} ${P(s2)}L${P(b2)}`, s1, s2 };
  }
  // two sleeve lines from the body (b1, b2) that end on a round hand hc = [x, y, r]
  function sleeve(b1, b2, hc, spread) {
    const m = [(b1[0] + b2[0]) / 2, (b1[1] + b2[1]) / 2], a = Math.atan2(m[1] - hc[1], m[0] - hc[0]) / RAD, h = [hc[0], hc[1], hc[2], hc[2]];
    let p1 = ep(h, a - spread), p2 = ep(h, a + spread);
    if (dist(p1, b1) > dist(p2, b1)) { const t = p1; p1 = p2; p2 = t; }
    return `M${P(b1)}L${P(p1)}M${P(b2)}L${P(p2)}`;
  }
  // straight line from p to the edge of circle c = [cx, cy, r] (aimed at its centre)
  const toC = (p, c) => { const l = dist(p, c); return [c[0] - ((c[0] - p[0]) / l) * c[2], c[1] - ((c[1] - p[1]) / l) * c[2]]; };
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

  // ================= BAT =================
  {
    const B = [600, 500, 165, 150];
    const earL = `M${P(ep(B, 228))}L476 256L${P(ep(B, 262))}`;
    const S = ep(B, 205), A = ep(B, 160), T = [165, 325];
    const wingL = `M${P(S)}C380 385 268 296 ${P(T)}` + scal([T, [214, 478], [326, 500], A], 26, true);
    const pupil = (x) => [ell(x, 484, 17, 21), 'k'];
    L.bat = {
      name: ['Bat', 'Chauve-souris'], emoji: '🦇', level: 1, cat: 'halloween',
      steps: [
        { t: ['Draw a big round body.', 'Dessine un gros corps tout rond.'], d: [E(B)] },
        { t: ['Add two pointy ears.', 'Ajoute deux oreilles pointues.'], d: [earL, mir(earL)] },
        { t: ['Draw two big wings with bumpy edges.', 'Dessine deux grandes ailes avec des bosses en dessous.'], d: [wingL, mir(wingL)] },
        { t: ['Draw two big round eyes.', 'Dessine deux grands yeux ronds.'], d: [circ(540, 478, 40), circ(660, 478, 40), pupil(545), pupil(655)] },
        { t: ['Add a happy smile and pink cheeks.', 'Ajoute un beau sourire et des joues roses.'], d: ['M565 552Q600 580 635 552', ell(492, 540, 22, 13), ell(708, 540, 22, 13)] }
      ],
      colors: [[600, 620, '#5B4A7A'], [514, 330, '#5B4A7A'], [686, 330, '#5B4A7A'], [320, 420, '#4A3B63'], [880, 420, '#4A3B63'],
        [515, 466, '#FFFFFF'], [685, 466, '#FFFFFF'], [492, 540, '#FF9EC4'], [708, 540, '#FF9EC4']]
    };
  }

  // ================= BLACK CAT =================
  {
    const Hd = [600, 312, 180, 150];
    const earL = `M${P(ep(Hd, 213))}L450 84L${P(ep(Hd, 250))}`;
    const inL = `M${P(ep(Hd, 221))}L467 126L${P(ep(Hd, 243))}`;
    const n1 = ep(Hd, 116), n2 = ep(Hd, 64);
    const body = `M${P(n1)}C440 560 438 735 492 790L708 790C762 735 760 560 ${P(n2)}`;
    const cR = [[708, 790], [762, 735], [760, 560], n2];
    const t1 = bz(cR, 0.1), t2 = bz(cR, 0.26);
    const tail = `M${P(t1)}C830 800 935 760 935 660C935 590 885 555 850 572A16 16 0 0 0 862 600C890 592 902 625 900 660C898 720 830 720 ${P(t2)}`;
    const kn = [600, 505, 16, 14];
    const loopL = `M${P(ep(kn, 205))}C560 470 522 480 524 505C526 532 562 542 ${P(ep(kn, 155))}`;
    const pupil = (x) => [ell(x, 316, 17, 23), 'k'];
    L.blackCat = {
      name: ['Black cat', 'Chat noir'], emoji: '🐈', level: 2, cat: 'halloween',
      steps: [
        { t: ['Draw a big round head.', 'Dessine une grosse tête ronde.'], d: [E(Hd)] },
        { t: ['Add two pointy ears.', 'Ajoute deux oreilles pointues.'], d: [earL, mir(earL), inL, mir(inL)] },
        { t: ['Draw two big round eyes.', 'Dessine deux grands yeux ronds.'], d: [ell(530, 308, 36, 42), ell(670, 308, 36, 42), pupil(535), pupil(665)] },
        { t: ['Add a tiny nose, a smile and whiskers.', 'Ajoute un petit nez, un sourire et des moustaches.'], d: ['M584 372L616 372L600 390Z', 'M600 390Q588 416 566 406', 'M600 390Q612 416 634 406', 'M446 362L514 372', 'M458 398L516 392', 'M754 362L686 372', 'M742 398L684 392'] },
        { t: ['Draw her body sitting down, with two front paws.', 'Dessine son corps assis, avec deux pattes avant.'], d: [body, 'M562 790L562 712', 'M638 790L638 712'] },
        { t: ['Swish! Add a long curly tail.', 'Ajoute une longue queue toute bouclée.'], d: [tail] },
        { t: ['Give her a pretty bow!', 'Donne-lui une jolie boucle!'], d: [E(kn), loopL, mir(loopL)] }
      ],
      colors: [[600, 230, '#5B4A7A'], [600, 660, '#5B4A7A'], [440, 110, '#5B4A7A'], [760, 110, '#5B4A7A'], [478, 175, '#FF9EC4'], [722, 175, '#FF9EC4'],
        [505, 290, '#FFE066'], [695, 290, '#FFE066'], [600, 378, '#FF8FA8'], [900, 700, '#5B4A7A'], [600, 505, '#FF8C1A'], [545, 505, '#FF8C1A'], [655, 505, '#FF8C1A']]
    };
  }

  // ================= WITCH HAT =================
  {
    const BR = [600, 715, 345, 75];
    const bl = ex(BR, 430, -1), br = ex(BR, 770, -1);
    const sL = [bl, [462, 545], [508, 330], [580, 190]];
    const fl = [[580, 190], [608, 126], [702, 104], [788, 172]];
    const fu = [[788, 172], [722, 152], [668, 186], [652, 252]];
    const sR = [[652, 252], [672, 420], [732, 575], br];
    const cone = C(sL) + Cs(fl) + Cs(fu) + Cs(sR);
    const bY = 500, b1 = bzAt(sL, bY, 1), b2 = bzAt(sR, bY, 1);
    L.witchHat = {
      name: ['Witch hat', 'Chapeau de sorcière'], emoji: '🎩', level: 1, cat: 'halloween',
      steps: [
        { t: ['Draw a long flat oval for the brim.', 'Dessine un long ovale tout plat pour le bord.'], d: [E(BR)] },
        { t: ['Add a tall pointy hat with a floppy tip.', 'Ajoute un grand chapeau pointu avec le bout tout mou.'], d: [cone] },
        { t: ['Draw a band across the bottom.', 'Dessine une bande en bas du chapeau.'], d: [`M${P(b1)}Q600 ${bY + 30} ${P(b2)}`] },
        { t: ['Add a big square buckle.', 'Ajoute une grosse boucle carrée.'], d: [rr(553, 540, 94, 76, 12), rr(577, 560, 46, 36, 7)] },
        { t: ['Decorate it with stars!', 'Décore-le avec des étoiles!'], d: [star(570, 415, 42, 18), star(626, 302, 26, 11), star(300, 520, 30, 13), star(905, 455, 34, 15), star(880, 640, 20, 9)] }
      ],
      colors: [[600, 680, '#5B3A99'], [600, 470, '#8E5BE8'], [720, 158, '#8E5BE8'], [480, 600, '#8BE04E'], [720, 600, '#8BE04E'], [600, 530, '#8BE04E'], [600, 578, '#8BE04E'], [565, 578, '#FFD23F'],
        [570, 417, '#FFD23F'], [626, 304, '#FFD23F'], [300, 522, '#FFD23F'], [905, 457, '#FFD23F'], [880, 642, '#FFD23F']]
    };
  }

  // ================= CAULDRON =================
  {
    const pL = [[385, 404], [262, 515], [318, 772], [600, 772]];
    const pot = C(pL) + 'C882 772 938 515 815 404';
    const gx = [372, 466, 534, 630, 702, 776, 828];
    const goo = 'M372 320' + bumps(gx.map((x) => [x, 320]), 1);
    const fa = bz(pL, 0.82), fb = bz(pL, 0.94);
    const foot = `M${P(fa)}C${f(fa[0] - 4)} ${f(fa[1] + 52)} ${f(fb[0] + 4)} ${f(fb[1] + 52)} ${P(fb)}`;
    const gooSeeds = gx.slice(1).map((x, i) => [Math.round((x + gx[i]) / 2), Math.round(320 - (x - gx[i]) / 4), '#8BE04E']);
    L.cauldron = {
      name: ['Cauldron', 'Chaudron'], emoji: '🍲', level: 1, cat: 'halloween',
      steps: [
        { t: ['Draw a fat rim, like a long sausage.', 'Dessine un gros bord, comme une longue saucisse.'], d: [rr(330, 320, 540, 84, 42)] },
        { t: ['Draw a big round pot under it.', 'Dessine un gros chaudron tout rond en dessous.'], d: [pot] },
        { t: ['Add bubbly potion on top!', 'Ajoute une potion qui bouillonne sur le dessus!'], d: [goo] },
        { t: ['Give it two little feet.', 'Donne-lui deux petits pieds.'], d: [foot, mir(foot)] },
        { t: ['Pop! Draw bubbles floating up, and two stars.', 'Pop! Dessine des bulles qui montent, et deux étoiles.'], d: [circ(470, 215, 26), circ(578, 150, 34), circ(700, 205, 22), circ(772, 118, 15), star(320, 190, 28, 12), star(885, 250, 24, 10)] }
      ],
      colors: [[600, 600, '#5B4A7A'], [600, 362, '#8577A8']].concat(gooSeeds, [[510, 778, '#4A3B63'], [690, 778, '#4A3B63'],
        [470, 215, '#C6F7A0'], [578, 150, '#C6F7A0'], [700, 205, '#C6F7A0'], [772, 118, '#C6F7A0'], [320, 192, '#FFD23F'], [885, 252, '#FFD23F']])
    };
  }

  // ================= SPIDER =================
  {
    const S = [600, 525, 135, 128];
    const lg = (a, c, e) => `M${P(ep(S, a))}Q${P(c)} ${P(e)}`;
    const legs = [lg(214, [430, 300], [350, 405]), lg(192, [362, 405], [318, 500]), lg(168, [356, 520], [330, 610]), lg(146, [410, 645], [392, 722])];
    L.spider = {
      name: ['Spider', 'Araignée'], emoji: '🕷️', level: 1, cat: 'halloween',
      steps: [
        { t: ['Draw a big round body.', 'Dessine un gros corps tout rond.'], d: [E(S)] },
        { t: ['Draw a long thread up to the top.', "Dessine un long fil jusqu'en haut."], d: [`M600 ${525 - 128}L600 66`] },
        { t: ['Add four bendy legs on each side.', 'Ajoute quatre pattes pliées de chaque côté.'], d: legs.concat(legs.map((d) => mir(d))) },
        { t: ['Draw two big googly eyes.', 'Dessine deux grands yeux tout ronds.'], d: [circ(548, 500, 38), circ(652, 500, 38), [ell(552, 506, 16, 20), 'k'], [ell(648, 506, 16, 20), 'k']] },
        { t: ['Add a sweet smile and pink cheeks.', 'Ajoute un beau sourire et des joues roses.'], d: ['M566 576Q600 604 634 576', ell(510, 562, 18, 11), ell(690, 562, 18, 11)] }
      ],
      colors: [[600, 450, '#6B5591'], [524, 488, '#FFFFFF'], [676, 488, '#FFFFFF'], [510, 562, '#FF9EC4'], [690, 562, '#FF9EC4']]
    };
  }

  // ================= SPIDER WEB =================
  {
    const c = [600, 330], R = 265;
    const sp = (a, r) => [c[0] + r * Math.cos(a * RAD), c[1] + r * Math.sin(a * RAD)];
    const ring = (r) => { let d = 'M' + P(sp(0, r)); for (let k = 0; k < 8; k++) d += `Q${P(sp(k * 45 + 22.5, r * 0.8))} ${P(sp((k + 1) * 45, r))}`; return d + 'Z'; };
    const sag = (r) => r * (0.5 * Math.cos(22.5 * RAD) + 0.4); // how close each ring dips toward the middle
    const S = [600, 724, 62, 58];
    const lg = (a, cc, e) => `M${P(ep(S, a))}Q${P(cc)} ${P(e)}`;
    const legs = [lg(205, [500, 640], [470, 690]), lg(180, [490, 720], [460, 760]), lg(155, [505, 790], [490, 830])];
    const cells = (r, col) => [0, 1, 2, 3, 4, 5, 6, 7].map((k) => { const p = sp(k * 45 + 22.5, r); return [Math.round(p[0]), Math.round(p[1]), col]; });
    L.spiderWeb = {
      name: ['Spider web', "Toile d'araignée"], emoji: '🕸️', level: 2, cat: 'halloween',
      steps: [
        { t: ['Draw a big plus sign.', 'Dessine un grand signe plus.'], d: [`M600 ${c[1] - R}L600 ${c[1] + R}`, `M${c[0] - R} 330L${c[0] + R} 330`] },
        { t: ['Add a big X through the middle.', 'Ajoute un grand X au milieu.'], d: [`M${P(sp(225, R))}L${P(sp(45, R))}`, `M${P(sp(315, R))}L${P(sp(135, R))}`] },
        { t: ['Join the lines with little swoops, near the middle.', 'Relie les lignes avec des petits creux, près du milieu.'], d: [ring(80)] },
        { t: ['Draw a bigger ring around it.', 'Dessine un plus grand rond autour.'], d: [ring(160)] },
        { t: ['And a big ring near the ends!', 'Et un grand rond près des bouts!'], d: [ring(238)] },
        { t: ['Hang a tiny spider from a thread.', 'Accroche une petite araignée au bout d’un fil.'], d: [`M600 ${c[1] + R}L600 ${S[1] - S[3]}`, E(S)].concat(legs, legs.map((d) => mir(d))) },
        { t: ['Give her big eyes and a smile.', 'Donne-lui des grands yeux et un sourire.'], d: [circ(578, 714, 17), circ(622, 714, 17), [circ(581, 718, 8), 'k'], [circ(619, 718, 8), 'k'], 'M584 748Q600 760 616 748'] }
      ],
      colors: cells(sag(80) / 2, '#F3EDFF').concat(cells((sag(80) + sag(160)) / 2, '#E2D5FF'), cells((sag(160) + sag(238)) / 2, '#CDB8FF'),
        [[600, 690, '#5B4A7A'], [568, 708, '#FFFFFF'], [632, 708, '#FFFFFF']])
    };
  }

  // ================= CANDY CORN =================
  {
    const sL = [[600, 110], [565, 110], [430, 470], [405, 640]];
    const bL = [[405, 640], [390, 745], [470, 775], [600, 775]];
    const corn = C(sL) + Cs(bL) + 'C730 775 810 745 795 640C770 470 635 110 600 110Z';
    const s1 = bzAt(sL, 560, 1), s2 = bzAt(sL, 335, 1);
    const aL = bzAt(sL, 470, 1), hand = [318, 392, 26], ctl = [380, 470];
    const armL = `M${P(aL)}Q${P(ctl)} ${P(toC(ctl, hand))}`;
    const shoe = [522, 832, 40, 20], lx = 548, lt = bzAt(bL, lx, 0, 0.4, 1);
    const legL = `M${P(lt)}L${P(ex(shoe, lx, -1))}`;
    L.candyCorn = {
      name: ['Candy corn', 'Bonbon maïs'], emoji: '🍬', level: 1, cat: 'halloween',
      steps: [
        { t: ['Draw a tall triangle with round corners.', 'Dessine un grand triangle aux coins tout ronds.'], d: [corn] },
        { t: ['Draw a curvy line near the bottom.', 'Dessine une ligne courbée près du bas.'], d: [`M${P(s1)}Q600 600 ${P(mp(s1))}`] },
        { t: ['Draw another curvy line near the top.', 'Dessine une autre ligne courbée près du haut.'], d: [`M${P(s2)}Q600 370 ${P(mp(s2))}`] },
        { t: ['Give it a happy face!', 'Donne-lui un visage joyeux!'], d: [[ell(552, 420, 15, 20), 'k'], [ell(648, 420, 15, 20), 'k'], 'M576 466Q600 490 624 466', ell(516, 464, 20, 12), ell(684, 464, 20, 12)] },
        { t: ['Add little arms and legs. Yay!', 'Ajoute des petits bras et des petites jambes. Youpi!'], d: [armL, mir(armL), circ(hand[0], hand[1], hand[2]), circ(1200 - hand[0], hand[1], hand[2]), legL, mir(legL), E(shoe), E([1200 - shoe[0], shoe[1], shoe[2], shoe[3]])] }
      ],
      colors: [[600, 230, '#FFF8E7'], [600, 520, '#FF9F1C'], [600, 690, '#FFD23F'], [516, 464, '#FF6F91'], [684, 464, '#FF6F91'],
        [hand[0], hand[1], '#FFF8E7'], [1200 - hand[0], hand[1], '#FFF8E7'], [shoe[0], shoe[1], '#8E5BE8'], [1200 - shoe[0], shoe[1], '#8E5BE8']]
    };
  }

  // ================= HAUNTED HOUSE =================
  {
    const ry = 205 + (740 - 530) * 0.9;
    const tw = (y) => `M790 ${y + 72}L790 ${y + 25}A25 25 0 0 1 840 ${y + 25}L840 ${y + 72}Z`;
    const bat = (x, y, s) => { // little filled bat: right half, then the mirrored half backwards
      const p = (u, v) => P([x + u * s, y + v * s]);
      const R = [['L', 6, -20], ['L', 11, -9], ['Q', 26, -27, 50, -22], ['Q', 42, -11, 46, 0], ['Q', 36, -6, 30, 6], ['Q', 22, 0, 15, 10], ['Q', 8, 18, 0, 17]];
      const ends = [[0, -8]].concat(R.map((g) => (g[0] === 'L' ? [g[1], g[2]] : [g[3], g[4]])));
      let d = `M${p(0, -8)}`;
      R.forEach((g) => { d += g[0] === 'L' ? `L${p(g[1], g[2])}` : `Q${p(g[1], g[2])} ${p(g[3], g[4])}`; });
      for (let i = R.length - 1; i >= 0; i--) { const g = R[i], to = ends[i]; d += g[0] === 'L' ? `L${p(-to[0], to[1])}` : `Q${p(-g[1], g[2])} ${p(-to[0], to[1])}`; }
      return [d + 'Z', 'k'];
    };
    L.hauntedHouse = {
      name: ['Haunted house', 'Maison hantée'], emoji: '🏚️', level: 3, cat: 'halloween',
      steps: [
        { t: ['Draw a big box for the house.', 'Dessine une grande boîte pour la maison.'], d: ['M320 430L740 430L740 800L320 800Z'] },
        { t: ['Add a tall tower on the side.', 'Ajoute une grande tour sur le côté.'], d: ['M740 430L740 280L890 280L890 800L740 800'] },
        { t: ['Put a pointy roof on the house.', 'Mets un toit pointu sur la maison.'], d: [`M320 430L280 430L530 205L740 ${f(ry)}`] },
        { t: ['Give the tower a tall pointy roof.', 'Donne à la tour un grand toit pointu.'], d: ['M740 280L722 280L815 108L908 280L890 280'] },
        { t: ['Draw a door and some windows.', 'Dessine une porte et des fenêtres.'], d: ['M482 800L482 700A48 48 0 0 1 578 700L578 800', [circ(562, 752, 7), 'k'], 'M342 462L478 462L478 606L342 606Z',
          'M600 470L710 470L710 580L600 580Z', 'M655 470L655 580M600 525L710 525', circ(530, 330, 40), 'M490 330L570 330M530 290L530 370', tw(360), tw(560)] },
        { t: ['Draw a friendly ghost waving from the window!', 'Dessine un gentil fantôme qui te salue à la fenêtre!'], d: ['M368 606L368 548A42 42 0 0 1 452 548L452 606', 'M368 570Q348 580 368 592', 'M452 570Q472 580 452 592',
          [ell(396, 548, 8, 11), 'k'], [ell(424, 548, 8, 11), 'k'], 'M398 574Q410 586 422 574'] },
        { t: ['Draw a big round moon.', 'Dessine une grosse lune ronde.'], d: [circ(225, 160, 65), circ(205, 140, 14), circ(250, 188, 10)] },
        { t: ['Add little bats flying by!', 'Ajoute des petites chauves-souris qui volent!'], d: [bat(395, 105, 1.5), bat(985, 345, 1.25), star(990, 560, 24, 10), star(175, 330, 22, 9)] }
      ],
      colors: [[400, 700, '#A98BDB'], [815, 700, '#8E6BC8'], [430, 380, '#4A3B63'], [815, 230, '#4A3B63'], [530, 760, '#FF8C1A'], [355, 480, '#FFE066'],
        [410, 590, '#FFFFFF'], [358, 581, '#FFFFFF'], [462, 581, '#FFFFFF'], [627, 497, '#FFE066'], [682, 497, '#FFE066'], [627, 552, '#FFE066'], [682, 552, '#FFE066'], [510, 310, '#FFE066'], [550, 310, '#FFE066'], [510, 350, '#FFE066'], [550, 350, '#FFE066'],
        [815, 400, '#FFE066'], [815, 600, '#FFE066'], [240, 120, '#FFF3B0'], [205, 140, '#FFE066'], [250, 188, '#FFE066'], [990, 562, '#FFD23F'], [175, 332, '#FFD23F']]
    };
  }

  // ================= MUMMY =================
  {
    const Hd = [600, 285, 172, 145];
    const n1 = ep(Hd, 113), n2 = ep(Hd, 67);
    const bL = [n1, [478, 470], [462, 580], [470, 680]];
    const body = C(bL) + `L470 760Q470 790 500 790L566 790Q588 790 588 768L588 712Q600 700 612 712L612 768Q612 790 634 790L700 790Q730 790 730 760L730 680C738 580 722 470 ${P(n2)}`;
    const am = arm(bz(bL, 0.22), bz(bL, 0.48), [380, 470], 34);
    const wrapA = `M${P(lerp(bz(bL, 0.22), am.s1, 0.55))}L${P(lerp(bz(bL, 0.48), am.s2, 0.45))}`;
    L.mummy = {
      name: ['Mummy', 'Momie'], emoji: '🧻', level: 2, cat: 'halloween',
      steps: [
        { t: ['Draw a big round head.', 'Dessine une grosse tête ronde.'], d: [E(Hd)] },
        { t: ['Draw a chubby body with two short legs.', 'Dessine un petit corps dodu avec deux jambes courtes.'], d: [body] },
        { t: ['Add two arms sticking out.', 'Ajoute deux bras tendus.'], d: [am.d, mir(am.d)] },
        { t: ['Draw two lines across the face for the eyes.', 'Dessine deux lignes sur le visage pour les yeux.'], d: [`M${P(ep(Hd, 197))}Q600 232 ${P(ep(Hd, 343))}`, `M${P(ep(Hd, 163))}Q600 350 ${P(ep(Hd, 17))}`] },
        { t: ['Draw two big round eyes.', 'Dessine deux grands yeux ronds.'], d: [circ(546, 288, 32), circ(654, 288, 32), [ell(551, 293, 15, 18), 'k'], [ell(649, 293, 15, 18), 'k']] },
        { t: ['Wrap it up! Draw bandage lines all over.', 'Emballe-la! Dessine des bandelettes partout.'], d: [`M${P(ep(Hd, 215))}Q600 205 ${P(ep(Hd, 322))}`, `M${P(ep(Hd, 244))}Q610 165 ${P(ep(Hd, 292))}`,
          `M${P(bz(bL, 0.15))}Q600 470 ${P(mp(bz(bL, 0.34)))}`, `M${P(bz(bL, 0.66))}Q600 560 ${P(mp(bz(bL, 0.48)))}`, 'M470 700Q600 650 730 700', 'M470 745L588 738', 'M612 738L730 745', wrapA, mir(wrapA)] },
        { t: ['Add a sweet smile and pink cheeks.', 'Ajoute un beau sourire et des joues roses.'], d: ['M578 378Q600 396 622 378', ell(515, 372, 18, 11), ell(685, 372, 18, 11)] }
      ],
      colors: [[600, 180, '#FFF8E7'], [600, 150, '#EFE6D2'], [600, 220, '#EFE6D2'], [600, 288, '#4A3B63'], [524, 274, '#FFFFFF'], [676, 274, '#FFFFFF'], [600, 410, '#FFF8E7'], [515, 372, '#FFB4C8'], [685, 372, '#FFB4C8'],
        [600, 440, '#EFE6D2'], [600, 520, '#FFF8E7'], [600, 620, '#EFE6D2'], [530, 720, '#FFF8E7'], [670, 720, '#FFF8E7'], [530, 770, '#EFE6D2'], [670, 770, '#EFE6D2'],
        [470, 480, '#FFF8E7'], [730, 480, '#FFF8E7'], [385, 470, '#EFE6D2'], [815, 470, '#EFE6D2']]
    };
  }

  // ================= WITCH =================
  {
    const BR = [600, 300, 235, 40];
    const bl = ex(BR, 498, -1), br = ex(BR, 702, -1);
    const K = [568, 128], T = [452, 108], Top = [612, 74];
    const sL = [bl, [522, 215], [548, 165], K], sR = [Top, [650, 122], [682, 200], br];
    const hat = C(sL) + `C545 110 500 100 ${P(T)}C495 80 565 58 ${P(Top)}` + Cs(sR);
    const bY = 220, b1 = bzAt(sL, bY, 1), b2 = bzAt(sR, bY, 1);
    const Hc = [600, 428, 125, 125];
    const aL = cross(Hc, 180, 270, (p) => inE(BR, p)), aR = cross(Hc, 270, 360, (p) => inE(BR, p));
    const face = `M${P(ep(Hc, aL))}${eA(Hc, aL, aR - 360)}`;
    const g1 = ep(Hc, 204), g2 = ep(Hc, 336);
    const bangs = 'M' + P(g1) + scal([g1, [545, 392], [600, 388], [655, 392], g2], -9, true);
    const hb = ex(BR, 442, 1);
    const hairL = `M${P(hb)}C416 390 418 470 440 505C455 516 474 500 ${P(ep(Hc, 160))}`;
    const dn1 = ep(Hc, 107), dn2 = ep(Hc, 73);
    const hem = []; for (let i = 0; i <= 12; i++) hem.push([470 + (260 * i) / 12, i % 2 ? 780 : 760]);
    const dress = `M${P(dn1)}` + hem.map((p) => 'L' + P(p)).join('') + `L${P(dn2)}`;
    const side = (y) => [dn1[0] + ((470 - dn1[0]) * (y - dn1[1])) / (760 - dn1[1]), y];
    const hL = [452, 662, 25], hR = [792, 628, 25];
    const armL = sleeve(side(588), side(648), hL, 62), armR = sleeve(mp(side(588)), mp(side(648)), hR, 56);
    const dy = Math.sqrt(25 * 25 - 49), yT = f(hR[1] - dy), yB = f(hR[1] + dy);
    const boot = `M${P(hem[3])}L535 806Q512 808 492 792Q490 830 535 832L566 832Q${P([hem[5][0], 832])} ${f(hem[5][0])} 818L${P(hem[5])}`;
    L.witch = {
      name: ['Little witch', 'Petite sorcière'], emoji: '🧙', level: 3, cat: 'halloween',
      steps: [
        { t: ['Draw a wide flat hat brim.', 'Dessine un large bord de chapeau tout plat.'], d: [E(BR)] },
        { t: ['Add a pointy hat with a floppy tip and a band.', 'Ajoute un chapeau pointu au bout plié, avec une bande.'], d: [hat, `M${P(b1)}Q600 ${bY + 18} ${P(b2)}`, star(604, 160, 22, 9)] },
        { t: ['Draw her round face under the hat.', 'Dessine son visage tout rond sous le chapeau.'], d: [face] },
        { t: ['Draw her hair: bangs and two sides.', 'Dessine ses cheveux : une frange et les côtés.'], d: [bangs, hairL, mir(hairL)] },
        { t: ['Draw her eyes, a smile and rosy cheeks.', 'Dessine ses yeux, un sourire et des joues roses.'], d: [[ell(553, 445, 15, 21), 'k'], [ell(647, 445, 15, 21), 'k'], 'M539 431L528 421M661 431L672 421', 'M582 492Q600 507 618 492', ell(518, 482, 17, 10), ell(682, 482, 17, 10)] },
        { t: ['Draw a triangle dress with a zigzag bottom.', 'Dessine une robe en triangle avec le bas en zigzag.'], d: [dress] },
        { t: ['Add her arms and two pointy boots.', 'Ajoute ses bras et deux bottes pointues.'], d: [armL, armR, circ(hL[0], hL[1], hL[2]), circ(hR[0], hR[1], hR[2]), boot, mir(boot)] },
        { t: ['Give her a broom to fly on!', 'Donne-lui un balai pour voler!'], d: [`M785 ${yT}L785 528A7 7 0 0 1 799 528L799 ${yT}`, `M785 ${yB}L785 770M799 ${yB}L799 770`, 'M762 770L822 770L850 850L734 850Z', 'M777 770L764 850M792 770L792 850M807 770L820 850'] }
      ],
      colors: [[600, 320, '#5B3A99'], [640, 190, '#8E5BE8'], [600, 247, '#8BE04E'], [604, 162, '#FFD23F'], [600, 525, '#FFE3D3'], [600, 362, '#FF8C42'], [432, 420, '#FF8C42'], [768, 420, '#FF8C42'], [600, 680, '#8E5BE8'],
        [hL[0], hL[1], '#FFE3D3'], [hR[0], hR[1], '#FFE3D3'], lerp(side(618), hL, 0.5).concat('#8E5BE8'), lerp(mp(side(618)), hR, 0.5).concat('#8E5BE8'), [518, 482, '#FF9EB5'], [682, 482, '#FF9EB5'], [555, 815, '#4A3B63'], [645, 815, '#4A3B63'], [792, 560, '#9C6644'], [792, 710, '#9C6644'],
        [754, 830, '#FFD23F'], [780, 830, '#FFD23F'], [804, 830, '#FFD23F'], [830, 830, '#FFD23F']]
    };
  }

  // ================= MONSTER =================
  {
    const tL = [[420, 730], [380, 600], [390, 300], [600, 290]];
    const body = C(tL) + 'C810 300 820 600 780 730Q600 770 420 730Z';
    const h1 = bz(tL, 0.68), h2 = bz(tL, 0.83);
    const hornL = `M${P(h1)}C428 340 424 282 440 238C470 258 494 284 ${P(h2)}`;
    const am = arm(bz(tL, 0.4), bz(tL, 0.5), [322, 418], 28);
    const lipL = [[600, 682], [550, 682], [500, 640], [500, 565]];
    const tg = bzAt(lipL, 552, 0);
    const up = (x) => 565 + 50 * ((x - 500) / 200) * (1 - (x - 500) / 200);
    const bq = [[780, 730], [600, 770], [420, 730]];
    const ft = (t1, t2) => { const p = qz(bq, t1), q = qz(bq, t2); return `M${P(p)}C${f(p[0])} ${f(p[1] + 70)} ${f(q[0])} ${f(q[1] + 70)} ${P(q)}`; };
    const footL = ft(0.62, 0.86);
    L.monster = {
      name: ['Cute monster', 'Gentil monstre'], emoji: '👾', level: 2, cat: 'halloween',
      steps: [
        { t: ['Draw a big round body, like a gumdrop.', 'Dessine un gros corps tout rond, comme une jujube.'], d: [body] },
        { t: ['Add two little horns.', 'Ajoute deux petites cornes.'], d: [hornL, mir(hornL)] },
        { t: ['Draw one big eye in the middle.', 'Dessine un seul gros œil au milieu.'], d: [circ(600, 440, 82), [circ(606, 452, 38), 'k']] },
        { t: ['Add a big smile with one tooth.', 'Ajoute un grand sourire avec une dent.'], d: ['M500 565Q600 590 700 565C700 640 650 682 600 682C550 682 500 640 500 565Z', `M560 ${f(up(560))}L560 600L590 600L590 ${f(up(590))}`, `M${P(tg)}Q600 615 ${P(mp(tg))}`, ell(455, 598, 22, 13), ell(745, 598, 22, 13)] },
        { t: ['Give it two waving arms.', 'Donne-lui deux bras qui saluent.'], d: [am.d, mir(am.d)] },
        { t: ['Draw two chubby feet.', 'Dessine deux pieds tout dodus.'], d: [footL, mir(footL)] },
        { t: ['Add some fun spots!', 'Ajoute des taches rigolotes!'], d: [circ(728, 432, 15), circ(478, 655, 18), circ(722, 650, 14), circ(466, 470, 12)] }
      ],
      colors: [[600, 330, '#8BE04E'], [452, 300, '#FFD23F'], [748, 300, '#FFD23F'], [540, 430, '#FFFFFF'], [640, 610, '#4A3B63'], [575, 590, '#FFFFFF'], [600, 660, '#FF6F91'],
        [455, 598, '#FF9EC4'], [745, 598, '#FF9EC4'], [322, 418, '#8BE04E'], [878, 418, '#8BE04E'], [513, 775, '#76C93F'], [687, 775, '#76C93F'],
        [728, 432, '#B388FF'], [478, 655, '#B388FF'], [722, 650, '#B388FF'], [466, 470, '#B388FF']]
    };
  }

  // ================= CANDY BUCKET =================
  {
    const Rm = [600, 330, 230, 50];
    const bdL = [[370, 330], [262, 430], [262, 742], [600, 762]];
    const body = C(bdL) + 'C938 742 938 430 830 330';
    const k1 = bz(bdL, 0.06);
    const handle = `M${P(k1)}C330 0 870 0 ${P(mp(k1))}`;
    const rgL = [ex(Rm, 470, 1), [418, 470], [418, 650], bz(bdL, 0.83)];
    const lp = [690, 190, 50];
    const cw = [505, 250, 40, 40];
    const wa = cross(cw, 0, 90, (p) => inE(Rm, p)), wb = cross(cw, 90, 180, (p) => inE(Rm, p));
    const wrapped = `M${P(ep(cw, wa))}${eA(cw, wa, wb - 360)}`;
    const wL = `M${P(ep(cw, 198))}L428 218L436 268L${P(ep(cw, 165))}`;
    L.candyBucket = {
      name: ['Candy bucket', 'Seau à bonbons'], emoji: '🎃', level: 2, cat: 'halloween',
      steps: [
        { t: ['Draw a long oval for the top.', 'Dessine un long ovale pour le dessus.'], d: [E(Rm)] },
        { t: ['Draw a big round pumpkin bucket under it.', 'Dessine un gros seau citrouille tout rond en dessous.'], d: [body] },
        { t: ['Add a tall handle from side to side.', "Ajoute une grande poignée d'un côté à l'autre."], d: [handle] },
        { t: ['Draw pumpkin lines on the sides.', 'Dessine des lignes de citrouille sur les côtés.'], d: [C(rgL), mir(C(rgL))] },
        { t: ['Give it a jack-o’-lantern face!', 'Donne-lui un visage de citrouille!'], d: ['M508 515L548 445L588 515Z', 'M612 515L652 445L692 515Z', 'M584 565L600 538L616 565Z', 'M482 598L516 620L550 604L600 630L650 604L684 620L718 598Q600 752 482 598Z'] },
        { t: ['Fill it with yummy candy!', 'Remplis-le de bons bonbons!'], d: [wrapped, wL, mir(wL, cw[0]), `M${lp[0]} ${lp[1] + lp[2]}L${lp[0]} ${f(ex(Rm, lp[0], -1)[1])}`, circ(lp[0], lp[1], lp[2]), 'M690 190A8 8 0 0 1 706 190A14 14 0 0 1 678 190A20 20 0 0 1 718 190A26 26 0 0 1 666 190'] }
      ],
      colors: [[600, 420, '#FF9F1C'], [340, 560, '#FF8C1A'], [860, 560, '#FF8C1A'], [600, 330, '#B45309'], [548, 495, '#FFD84D'], [652, 495, '#FFD84D'], [600, 556, '#FFD84D'], [600, 660, '#FFD84D'],
        [505, 240, '#FF6FB5'], [446, 240, '#FFB4D8'], [564, 240, '#FFB4D8'], [690, 150, '#B388FF']]
    };
  }

  // ================= PONY IN A WITCH HAT =================
  {
    // the pony head from the "Pony" lesson, a little smaller and lower so the hat fits
    const s = 0.92, tx = 50, ty = 90, X = (d) => xf(d, s, tx, ty), Xp = (p) => [p[0] * s + tx, p[1] * s + ty];
    const hd = [560 * s + tx, 360 * s + ty, 140 * s, 140 * s];
    const BR = [560, 298, 205, 42, -7];
    const aL = cross(hd, 180, 270, (p) => inE(BR, p)), aR = cross(hd, 270, 400, (p) => inE(BR, p));
    const head = `M${P(ep(hd, aL))}${eA(hd, aL, aR - 360)}`;
    const cb1 = ep(BR, 250), cb2 = ep(BR, 290);
    const hat = `M${P(cb1)}C500 200 515 150 528 122C500 104 465 100 430 112C470 78 530 60 578 72C600 114 616 190 ${P(cb2)}`;
    const ear = (a1, a2, tip, bl) => {
      const p1 = ep(BR, a1), p2 = ep(BR, a2), q = (a, b, k) => { const m = lerp(a, b, 0.5), dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy); return [m[0] + (dy / l) * k, m[1] - (dx / l) * k]; };
      return `M${P(p1)}Q${P(q(p1, tip, bl))} ${P(tip)}Q${P(q(tip, p2, bl))} ${P(p2)}`;
    };
    const fA = ep(BR, 113), fB = ep(BR, 94), FT = [fA[0] + 30, fA[1] + 64];
    const forelock = `M${P(fA)}Q${P([fA[0] - 8, fA[1] + 40])} ${P(FT)}Q${P([fB[0] - 2, fB[1] + 30])} ${P(fB)}`;
    L.ponyCostume = {
      name: ['Witchy pony', 'Poney déguisé'], emoji: '🐴', level: 3, cat: 'halloween',
      steps: [
        { t: ['Start with the hat brim: a long flat oval.', 'Commence par le bord du chapeau : un long ovale tout plat.'], d: [E(BR)] },
        { t: ['Add a tall pointy hat with a star.', 'Ajoute un grand chapeau pointu avec une étoile.'], d: [hat, star(560, 168, 26, 11)] },
        { t: ['Draw a big round head under the hat.', 'Dessine une grosse tête ronde sous le chapeau.'], d: [head] },
        { t: ['Add a long nose.', 'Ajoute un long museau.'], d: [X('M692 408C800 400 862 480 822 542C782 602 622 592 545 499')] },
        { t: ['Add two ears popping out of the hat!', 'Ajoute deux oreilles qui sortent du chapeau!'], d: [ear(218, 246, [420, 170], 9), ear(296, 322, [702, 148], 9)] },
        { t: ['Draw the neck.', 'Dessine le cou.'], d: [X('M440 432C410 560 415 690 430 790'), X('M648 567C665 650 675 730 680 790'), X('M400 790Q555 806 710 790')] },
        { t: ['Give her a wavy mane!', 'Donne-lui une crinière toute frisée!'], d: [forelock, X('M434 300C390 318 402 380 365 420C408 432 388 500 350 542C398 552 390 622 360 672C405 676 418 735 412 792')] },
        { t: ['Draw a big eye, a nostril, a smile and a pink cheek.', 'Dessine un gros œil, une narine, un sourire et une joue rose.'], d: [[X(ell(600, 335, 22, 28)), 'k'], X('M584 305L572 290M598 302L596 286M612 306L620 292'), [X(ell(790, 482, 12, 8)), 'k'], X('M720 548Q760 566 798 540'), ell(648, 472, 18, 11)] }
      ],
      colors: [[500, 455, '#F4C99A'], Xp([740, 490]).concat('#FFE6CC'), Xp([540, 660]).concat('#F4C99A'), [560, 300, '#5B3A99'], [585, 225, '#8E5BE8'], [560, 170, '#FFD23F'], [426, 248, '#F4C99A'], [690, 216, '#F4C99A'],
        Xp([402, 600]).concat('#FF8C1A'), [fA[0] + 22, fA[1] + 24, '#FF8C1A'], [648, 472, '#FF9EB5']]
    };
  }
})();
