/* draw4fun pack: horsesfarm */
(function () {
  'use strict';
  const H = window.ART.helpers, ell = H.ell, circ = H.circ, rr = H.rr, star = H.starD, heart = H.heartD;
  const L = window.PAPER.lessons;

  // ---- tiny geometry helpers so that lines MEET exactly ----
  const f = (n) => Math.round(n * 10) / 10;
  const R = (d) => (d * Math.PI) / 180;
  const E = (cx, cy, rx, ry, rot) => ({ cx, cy, rx, ry, rot: rot || 0 });
  const grow = (e, d) => E(e.cx, e.cy, e.rx + d, e.ry + d, e.rot);
  function loc(e, x, y) { // local (x,y) inside a (rotated) ellipse -> page point
    const c = Math.cos(R(e.rot)), s = Math.sin(R(e.rot));
    return [e.cx + x * c - y * s, e.cy + x * s + y * c];
  }
  const pt = (e, a) => loc(e, e.rx * Math.cos(R(a)), e.ry * Math.sin(R(a))); // point on outline at angle a (deg, y down)
  const S = (p) => f(p[0]) + ' ' + f(p[1]);
  const P = (e, a) => S(pt(e, a));
  const eD = (e) => ell(e.cx, e.cy, e.rx, e.ry, e.rot);
  const arc = (e, a1, a2) => `M${P(e, a1)}A${e.rx} ${e.ry} ${e.rot} ${Math.abs(a2 - a1) > 180 ? 1 : 0} ${a2 > a1 ? 1 : 0} ${P(e, a2)}`;
  function inside(e, p) { // <1 when p is inside ellipse e
    const c = Math.cos(R(-e.rot)), s = Math.sin(R(-e.rot)), dx = p[0] - e.cx, dy = p[1] - e.cy;
    const x = dx * c - dy * s, y = dx * s + dy * c;
    return (x * x) / (e.rx * e.rx) + (y * y) / (e.ry * e.ry);
  }
  function cross(e1, e2, a0, a1) { // angle on e1 (between a0..a1) where e1 crosses e2's outline
    let g0 = inside(e2, pt(e1, a0)) - 1;
    for (let i = 0; i < 50; i++) { const m = (a0 + a1) / 2, gm = inside(e2, pt(e1, m)) - 1; if ((gm < 0) === (g0 < 0)) { a0 = m; g0 = gm; } else a1 = m; }
    return (a0 + a1) / 2;
  }
  function bumpPts(e, a1, a2, n, p0, p1) { // p0, points of e between angles a1..a2, p1
    const pts = [p0 || pt(e, a1)];
    for (let i = 1; i < n; i++) pts.push(pt(e, a1 + ((a2 - a1) * i) / n));
    pts.push(p1 || pt(e, a2));
    return pts;
  }
  function linePts(p0, p1, n, bow) { // points along a gentle curve from p0 to p1
    const dx = p1[0] - p0[0], dy = p1[1] - p0[1], len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len, pts = [];
    for (let i = 0; i <= n; i++) { const t = i / n, b = bow * Math.sin(Math.PI * t); pts.push([p0[0] + dx * t + nx * b, p0[1] + dy * t + ny * b]); }
    return pts;
  }
  function bumps(pts, sweep, k, large, noMove) { // round bumps between points (sweep 1 = bulge to the left of travel)
    let d = noMove ? '' : 'M' + S(pts[0]);
    for (let i = 1; i < pts.length; i++) {
      const c = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]), r = f((c / 2) * (k || 1.05));
      d += `A${r} ${r} 0 ${large ? 1 : 0} ${sweep} ${S(pts[i])}`;
    }
    return d;
  }
  const bz = (p0, p1, p2, p3, t) => { const u = 1 - t; return [0, 1].map((i) => u * u * u * p0[i] + 3 * u * u * t * p1[i] + 3 * u * t * t * p2[i] + t * t * t * p3[i]); };
  const qm = (a, c, b) => [0.25 * a[0] + 0.5 * c[0] + 0.25 * b[0], 0.25 * a[1] + 0.5 * c[1] + 0.25 * b[1]];
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  // an ear (or horn) growing out of ellipse e between angles a1 < a2
  function ear(e, a1, a2, len, spread) {
    const big = grow(e, len), mid = grow(e, len * 0.7), m = (a1 + a2) / 2;
    return `M${P(e, a1)}Q${P(mid, a1 - spread)} ${P(big, m)}Q${P(mid, a2 + spread)} ${P(e, a2)}`;
  }
  // 3 little lashes on the top-outer side of an eye (side -1 = left eye, 1 = right eye)
  function lashes(cx, cy, rx, ry, side) {
    const e = E(cx, cy, rx, ry), e2 = E(cx, cy, rx + 17, ry + 17);
    return [205, 232, 259].map((a0) => { const a = side > 0 ? 540 - a0 : a0; return `M${P(e, a)}L${P(e2, a)}`; }).join('');
  }
  function blob(cx, cy, r, n, rot) { // a wobbly spot
    const e = E(cx, cy, r, r * 0.8, rot || 0), pts = bumpPts(e, 0, 360, n || 5);
    return bumps(pts, 1, 1.35) + 'Z';
  }

  // =====================================================================
  // CUTE PONY (front view)
  // =====================================================================
  (function () {
    const mz = E(600, 580, 150, 95), hd = E(600, 410, 175, 180), me = E(600, 445, 238, 215);
    const aL = cross(hd, mz, 90, 180), aR = cross(hd, mz, 0, 90);
    const earP = (s) => { // s=-1 left, 1 right
      const A = s < 0 ? 226 : 314, B = s < 0 ? 251 : 289, tip = [600 + s * 128, 150];
      const a1 = s < 0 ? 232 : 308, a2 = s < 0 ? 246 : 294, tip2 = [600 + s * 118, 190];
      return [`M${P(hd, A)}Q${f(600 + s * 150)} 200 ${S(tip)}Q${f(600 + s * 80)} 170 ${P(hd, B)}`,
        `M${P(hd, a1)}Q${f(600 + s * 128)} 215 ${S(tip2)}Q${f(600 + s * 88)} 200 ${P(hd, a2)}`];
    };
    L.ponyFront = {
      name: ['Cute pony', 'Joli poney'], emoji: '🐴', level: 2, cat: 'horses',
      steps: [
        { t: ['Draw a wide oval for the nose.', 'Dessine un ovale large pour le museau.'], d: [eD(mz)] },
        { t: ['Draw a big round head on top.', 'Dessine une grosse tête ronde par-dessus.'], d: [arc(hd, aL, 360 + aR)] },
        { t: ['Add two pointy ears.', 'Ajoute deux oreilles pointues.'], d: [...earP(-1), ...earP(1)] },
        { t: ['Give her fluffy bangs and a wavy mane!', 'Donne-lui une frange frisée et une crinière ondulée!'], d: [
          `M${P(hd, 253)}C500 280 505 365 562 358C548 325 572 300 600 338C612 300 652 298 662 345C705 335 705 268 ${P(hd, 287)}`,
          bumps(bumpPts(me, 221, 158, 5, pt(hd, 222), pt(mz, 183)), 0, 1.08)] },
        { t: ['Draw two big eyes with lashes.', 'Dessine deux grands yeux avec des cils.'], d: [[ell(525, 440, 26, 34), 'k'], [ell(675, 440, 26, 34), 'k'], lashes(525, 440, 26, 34, -1), lashes(675, 440, 26, 34, 1)] },
        { t: ['Add nostrils, a smile and rosy cheeks.', 'Ajoute les narines, un sourire et des joues roses.'], d: [[ell(550, 572, 13, 10), 'k'], [ell(650, 572, 13, 10), 'k'], 'M555 618Q600 645 645 618', ell(482, 490, 19, 11), ell(718, 490, 19, 11)] }
      ],
      colors: [[600, 400, '#F2B66D'], [600, 625, '#FFE3C4'], [474, 168, '#F2B66D'], [726, 168, '#F2B66D'], [500, 235, '#FF9EC4'], [700, 235, '#FF9EC4'],
        [600, 280, '#FF6FAE'], [400, 420, '#FF6FAE'], [482, 490, '#FF8FB0'], [718, 490, '#FF8FB0']]
    };
  })();

  // =====================================================================
  // ROCKING HORSE
  // =====================================================================
  (function () {
    const bd = E(560, 440, 200, 95), hd = E(820, 250, 108, 66, 30);
    const yB = (x) => bd.cy + bd.ry * Math.sqrt(1 - ((x - bd.cx) / bd.rx) ** 2);
    const yR = (x) => 60 + Math.sqrt(700 * 700 - (x - 560) ** 2), yR2 = (x) => 60 + Math.sqrt(742 * 742 - (x - 560) ** 2);
    const legs = [[390, 432, 315, 357], [455, 495, 405, 445], [625, 665, 675, 715], [688, 728, 785, 825]];
    const legD = [], hoofD = [];
    legs.forEach(([a, b, c, d]) => {
      const A = [a, yB(a)], B = [b, yB(b)], C = [c, yR(c)], D = [d, yR(d)];
      legD.push(`M${S(A)}L${S(C)}`, `M${S(B)}L${S(D)}`);
      hoofD.push(`M${S(lerp(A, C, 0.8))}L${S(lerp(B, D, 0.8))}`);
    });
    const rocker = `M225 ${f(yR(225))}A700 700 0 0 0 895 ${f(yR(895))}A23 23 0 0 1 895 ${f(yR2(895))}A742 742 0 0 1 225 ${f(yR2(225))}A23 23 0 0 1 225 ${f(yR(225))}Z`;
    const maneP = linePts(pt(hd, 212), pt(bd, -100), 6, 8);
    L.rockingHorse = {
      name: ['Rocking horse', 'Cheval à bascule'], emoji: '🐴', level: 3, cat: 'horses',
      steps: [
        { t: ['Draw a long oval for the body.', 'Dessine un long ovale pour le corps.'], d: [eD(bd)] },
        { t: ['Draw the head, like a tilted egg.', 'Dessine la tête, comme un œuf penché.'], d: [eD(hd)] },
        { t: ['Join them with a neck.', 'Relie-les avec un cou.'], d: [`M${P(hd, 195)}Q690 262 ${P(bd, -72)}`, `M${P(hd, 118)}Q748 330 ${P(bd, -32)}`] },
        { t: ['Add two ears and a bumpy mane.', 'Ajoute deux oreilles et une crinière en bosses.'], d: [ear(hd, 219, 238, 80, 3), ear(hd, 243, 262, 80, 3), bumps(maneP, 0, 1.1)] },
        { t: ['Draw a big curved rocker, like a smile.', 'Dessine une grande bascule courbée, comme un sourire.'], d: [rocker] },
        { t: ['Draw four legs down to the rocker.', "Dessine quatre pattes jusqu'à la bascule."], d: [...legD, ...hoofD] },
        { t: ['Swish! Add a long tail.', 'Ajoute une longue queue!'], d: [`M${P(bd, 190)}C290 380 250 480 285 590C300 540 330 490 ${P(bd, 168)}`] },
        { t: ['Add a saddle with a heart, an eye and a smile.', 'Ajoute une selle avec un cœur, un œil et un sourire.'], d: [`M${P(bd, -122)}Q560 495 ${P(bd, -58)}`, heart(560, 388, 22),
          [circ(...loc(hd, -15, -16), 14), 'k'], [ell(...loc(hd, 78, 10), 9, 7, 30), 'k'], `M${S(loc(hd, 34, 32))}Q${S(loc(hd, 58, 48))} ${S(loc(hd, 84, 30))}`] }
      ],
      colors: [[500, 470, '#FFC8DD'], [...loc(hd, 40, 0), '#FFC8DD'], [700, 330, '#FFC8DD'], [560, 780, '#4CC9F0'], [560, 365, '#E63946'], [560, 392, '#FFD23F'], [290, 540, '#A06CD5'],
        ...legs.map(([a, b, c, d]) => [(a + c) / 2 + 20 - 20 + ((b - a) / 2), (yB(a) + yR(c)) / 2, '#FFC8DD']),
        ...legs.map(([a, b, c, d]) => [(c + d) / 2, yR(c) - 14, '#5A3A2A']),
        [...lerp(maneP[3], qm(pt(hd, 195), [690, 262], pt(bd, -72)), 0.3), '#A06CD5'], [...pt(grow(hd, 40), 228), '#FFC8DD'], [...pt(grow(hd, 40), 252), '#FFC8DD']]
    };
  })();

  // =====================================================================
  // CAROUSEL HORSE
  // =====================================================================
  (function () {
    const bd = E(590, 470, 180, 88), hd = E(835, 250, 102, 62, 40);
    const yT = (x) => bd.cy - bd.ry * Math.sqrt(1 - ((x - bd.cx) / bd.rx) ** 2), yBo = (x) => bd.cy + bd.ry * Math.sqrt(1 - ((x - bd.cx) / bd.rx) ** 2);
    const top = 100 + Math.sqrt(22 * 22 - 12 * 12), base = E(590, 830, 46, 15), baseTop = 830 - 15 * Math.sqrt(1 - (12 / 46) ** 2);
    const pole = [circ(590, 100, 22), `M578 ${f(top)}L578 ${f(yT(578))}`, `M602 ${f(top)}L602 ${f(yT(602))}`, `M578 ${f(yBo(578))}L578 ${f(baseTop)}`, `M602 ${f(yBo(602))}L602 ${f(baseTop)}`, eD(base)];
    const stripeY = [], stripes = [];
    for (let y = 165; y < yT(590) - 25; y += 48) stripeY.push(y);
    for (let y = yBo(590) + 45; y < baseTop - 25; y += 48) stripeY.push(y);
    stripeY.forEach((y) => stripes.push(`M578 ${f(y + 10)}L602 ${f(y - 10)}`));
    const stripeSeeds = [];
    stripeY.forEach((y, i) => stripeSeeds.push([590, y - 24, i % 2 ? '#FFF3B0' : '#FFD23F'], [590, y + 24, i % 2 ? '#FFD23F' : '#FFF3B0']));
    const back1 = [pt(bd, 118), pt(bd, 135)], back2 = [pt(bd, 145), pt(bd, 163)];
    const backLeg = ([A, B], dx, y) => { const C = [A[0] + dx, y], D = [B[0] + dx, y - 6]; return [`M${S(A)}L${S(C)}L${S(D)}L${S(B)}`, `M${S(lerp(A, C, 0.85))}L${S(lerp(B, D, 0.85))}`]; };
    const maneP = linePts(pt(hd, 208), pt(bd, -100), 6, 10);
    L.carouselHorse = {
      name: ['Carousel horse', 'Cheval de manège'], emoji: '🎠', level: 3, cat: 'horses',
      steps: [
        { t: ['Draw an oval for the body.', 'Dessine un ovale pour le corps.'], d: [eD(bd)] },
        { t: ['Draw the head, like a tilted egg.', 'Dessine la tête, comme un œuf penché.'], d: [eD(hd)] },
        { t: ['Join them with a neck.', 'Relie-les avec un cou.'], d: [`M${P(hd, 192)}Q705 275 ${P(bd, -65)}`, `M${P(hd, 120)}Q765 360 ${P(bd, -28)}`] },
        { t: ['Add two ears and a curly mane.', 'Ajoute deux oreilles et une crinière bouclée.'], d: [ear(hd, 216, 235, 78, 3), ear(hd, 240, 259, 78, 3), bumps(maneP, 0, 1.0, true)] },
        { t: ['Draw the legs. The front legs jump up high!', 'Dessine les pattes. Celles en avant sautent bien haut!'], d: [
          `M${P(bd, 12)}Q840 492 855 535L852 600L815 600L818 560Q800 540 ${P(bd, 42)}`, 'M853 578L816.6 578',
          `M${P(bd, 52)}Q765 560 772 610L768 668L733 666L738 622Q722 590 ${P(bd, 72)}`, ...backLeg(back1, -15, 715), ...backLeg(back2, -45, 695)] },
        { t: ['Add a long flowing tail.', 'Ajoute une longue queue qui flotte au vent.'], d: [`M${P(bd, 190)}C330 420 290 530 330 650C345 590 368 530 ${P(bd, 170)}`] },
        { t: ['Draw the magic pole with stripes.', 'Dessine le poteau magique avec des rayures.'], d: [...pole, ...stripes] },
        { t: ['Add a saddle with a star, an eye and a smile.', 'Ajoute une selle avec une étoile, un œil et un sourire.'], d: [`M${P(bd, -128)}Q590 520 ${P(bd, -52)}`, star(590, 425, 26, 11),
          [circ(...loc(hd, -14, -16), 14), 'k'], [ell(...loc(hd, 74, 10), 9, 7, 40), 'k'], `M${S(loc(hd, 32, 30))}Q${S(loc(hd, 54, 46))} ${S(loc(hd, 78, 28))}`] }
      ],
      colors: [[480, 480, '#E9E3FF'], [700, 470, '#E9E3FF'], [...loc(hd, 40, 0), '#E9E3FF'], [730, 330, '#E9E3FF'], [590, 395, '#4CC9F0'], [590, 427, '#FFD23F'], [335, 560, '#FF6FB5'],
        [...lerp(maneP[3], qm(pt(hd, 192), [705, 275], pt(bd, -65)), 0.3), '#FF6FB5'], [...pt(grow(hd, 30), 225.5), '#E9E3FF'], [...pt(grow(hd, 30), 249.5), '#E9E3FF'],
        [800, 520, '#E9E3FF'], [750, 580, '#E9E3FF'], [834, 590, '#FFD23F'], [752, 655, '#FFD23F'],
        [...lerp(lerp(back1[0], back1[1], 0.5), [back1[0][0] - 15, 712], 0.5), '#E9E3FF'], [...lerp(lerp(back2[0], back2[1], 0.5), [back2[0][0] - 45, 692], 0.5), '#E9E3FF'],
        [...lerp(lerp(back1[0], back1[1], 0.5), [back1[0][0] - 15, 712], 0.93), '#FFD23F'], [...lerp(lerp(back2[0], back2[1], 0.5), [back2[0][0] - 45, 692], 0.93), '#FFD23F'],
        [590, 100, '#FFD23F'], [590, 832, '#E63946'], ...stripeSeeds]
    };
  })();

  // =====================================================================
  // UNICORN (sitting, chibi)
  // =====================================================================
  (function () {
    const hd = E(600, 300, 160, 135), me = E(600, 330, 205, 185);
    const bL = [pt(hd, 115), [480, 500], [445, 660], [450, 790]], bR = [pt(hd, 65), [720, 500], [755, 660], [750, 790]];
    const T = bz(...bL, 0.55), T2 = bz(...bR, 0.55), K1 = bz(...bR, 0.86), K2 = bz(...bR, 0.62);
    const hL = pt(hd, 258), hR = pt(hd, 282), tip = [600, 40];
    const stripes = [0.25, 0.48, 0.7].map((t) => `M${S(lerp(hL, tip, t))}L${S(lerp(hR, tip, t - 0.1))}`);
    const B0 = bz(...bL, 0.3);
    L.unicornSitting = {
      name: ['Sitting unicorn', 'Licorne assise'], emoji: '🦄', level: 3, cat: 'horses',
      steps: [
        { t: ['Draw a big round head.', 'Dessine une grosse tête ronde.'], d: [eD(hd)] },
        { t: ['Add an oval nose with nostrils and a smile.', 'Ajoute un museau ovale avec des narines et un sourire.'], d: [ell(600, 366, 80, 44), [ell(572, 358, 9, 7), 'k'], [ell(628, 358, 9, 7), 'k'], 'M575 385Q600 399 625 385'] },
        { t: ['Add two pointy ears and a magic horn!', 'Ajoute deux oreilles pointues et une corne magique!'], d: [ear(hd, 221, 243, 75, -3), ear(hd, 297, 319, 75, -3), `M${S(hL)}L${S(tip)}L${S(hR)}`, ...stripes] },
        { t: ['Draw her body and two front legs.', 'Dessine son corps et deux pattes en avant.'], d: [`M${S(bL[0])}C480 500 445 660 450 790L750 790C755 660 720 500 ${S(bR[0])}`, 'M548 790L548 630', 'M600 790L600 630', 'M652 790L652 630', 'M548 758L652 758'] },
        { t: ['Add the back legs with little hooves.', 'Ajoute les pattes arrière avec des petits sabots.'], d: [
          `M${S(T)}C${f(T[0] + 70)} ${f(T[1] - 10)} 535 690 525 790`, 'M458 790Q458 828 490 828Q522 828 522 790',
          `M${S(T2)}C${f(T2[0] - 70)} ${f(T2[1] - 10)} 665 690 675 790`, 'M742 790Q742 828 710 828Q678 828 678 790'] },
        { t: ['Give her a swoopy lock and a long mane.', 'Donne-lui une belle mèche et une longue crinière.'], d: [
          `M${P(hd, 256)}C590 235 560 290 498 268C522 245 518 214 ${P(hd, 246)}`,
          bumps(bumpPts(me, 216, 150, 5, pt(hd, 215), B0), 0, 1.08)] },
        { t: ['Swish! Add a tail and a star on her tummy.', 'Ajoute une queue et une étoile sur son bedon!'], d: [`M${S(K1)}C850 800 920 700 885 600C870 655 815 650 ${S(K2)}`, star(600, 540, 34, 15)] },
        { t: ['Draw big sparkly eyes and rosy cheeks.', 'Dessine de grands yeux brillants et des joues roses.'], d: [[ell(538, 292, 20, 25), 'k'], [ell(662, 292, 20, 25), 'k'], lashes(538, 292, 20, 25, -1), lashes(662, 292, 20, 25, 1), ell(492, 336, 18, 11), ell(708, 336, 18, 11)] }
      ],
      colors: [[600, 200, '#F7F3FF'], [600, 380, '#FFE4F1'], [600, 600, '#F7F3FF'], [...pt(grow(hd, 30), 232), '#F7F3FF'], [...pt(grow(hd, 30), 308), '#F7F3FF'],
        [...lerp(lerp(hL, hR, 0.5), tip, 0.12), '#FFD23F'], [...lerp(lerp(hL, hR, 0.5), tip, 0.36), '#FFF3B0'], [...lerp(lerp(hL, hR, 0.5), tip, 0.58), '#FFD23F'], [...lerp(lerp(hL, hR, 0.5), tip, 0.82), '#FFF3B0'],
        [530, 245, '#B388FF'], [420, 330, '#FF6FB5'], [600, 540, '#FFD23F'],
        [482, 720, '#F7F3FF'], [718, 720, '#F7F3FF'], [574, 774, '#C9B6FF'], [626, 774, '#C9B6FF'], [490, 810, '#C9B6FF'], [710, 810, '#C9B6FF'],
        [850, 680, '#B388FF'], [492, 336, '#FF9EC4'], [708, 336, '#FF9EC4']]
    };
  })();

  // =====================================================================
  // FOAL (lying down)
  // =====================================================================
  (function () {
    const bd = E(560, 610, 220, 112), hd = E(800, 405, 135, 92, 30);
    const nb = pt(hd, 165), nf = pt(hd, 100), cb = [640, 425], cf = [738, 520];
    const maneP = linePts(pt(hd, 205), pt(bd, -88), 5, 12);
    L.foal = {
      name: ['Baby foal', 'Bébé poulain'], emoji: '🐎', level: 2, cat: 'horses',
      steps: [
        { t: ["Draw a long oval. She's lying down!", 'Dessine un long ovale. Elle est couchée!'], d: [eD(bd)] },
        { t: ['Draw the head, like a tilted egg.', 'Dessine la tête, comme un œuf penché.'], d: [eD(hd), `M${P(hd, -62)}Q${S(loc(hd, 40, 0))} ${P(hd, 62)}`] },
        { t: ['Join the head and body with a neck.', 'Relie la tête et le corps avec un cou.'], d: [`M${S(nb)}Q${S(cb)} ${P(bd, -72)}`, `M${S(nf)}Q${S(cf)} ${P(bd, -30)}`] },
        { t: ['Add two ears and a fluffy mane.', 'Ajoute deux oreilles et une crinière toute douce.'], d: [ear(hd, 222, 242, 62, 2), ear(hd, 247, 267, 62, 2), bumps(maneP, 0, 1.08)] },
        { t: ['Draw her folded legs.', 'Dessine ses pattes pliées.'], d: [`M${P(bd, 18)}L870 672Q905 682 905 710L905 732L760 732Q700 732 ${P(bd, 62)}`, 'M870 672L870 732',
          `M${P(bd, 128)}Q405 755 440 758L500 758Q525 758 ${P(bd, 108)}`] },
        { t: ['Add a little tail and some spots.', 'Ajoute une petite queue et des taches.'], d: [`M${P(bd, 192)}C290 570 280 660 310 700C330 670 345 650 ${P(bd, 170)}`, circ(430, 585, 24), circ(482, 638, 16), circ(398, 642, 14)] },
        { t: ['Draw a big eye, a nostril and a smile.', 'Dessine un gros œil, une narine et un sourire.'], d: [[ell(...loc(hd, -22, -20), 18, 25), 'k'], lashes(...loc(hd, -22, -20), 18, 25, -1), [ell(...loc(hd, 108, -10), 10, 8, 30), 'k'], `M${S(loc(hd, 74, 46))}Q${S(loc(hd, 98, 50))} ${S(loc(hd, 116, 30))}`] }
      ],
      colors: [[600, 610, '#D9A066'], [...loc(hd, -40, 10), '#D9A066'], [...loc(hd, 85, 15), '#F2D0A9'], [...lerp(qm(nb, cb, pt(bd, -72)), qm(nf, cf, pt(bd, -30)), 0.5), '#D9A066'], [430, 585, '#FFF8EE'], [482, 638, '#FFF8EE'], [398, 642, '#FFF8EE'],
        [...pt(grow(hd, 30), 232), '#D9A066'], [...pt(grow(hd, 30), 257), '#D9A066'], [...lerp(maneP[2], qm(nb, cb, pt(bd, -72)), 0.3), '#7A4E2D'],
        [800, 700, '#D9A066'], [888, 715, '#7A4E2D'], [465, 745, '#7A4E2D'], [305, 650, '#7A4E2D']]
    };
  })();

  // =====================================================================
  // LUCKY HORSESHOE
  // =====================================================================
  (function () {
    const oc = E(600, 440, 250, 250), ring = E(600, 440, 200, 200);
    const holes = [168, 135, 105, 75, 45, 12].map((a) => { const p = pt(ring, a); return [ell(p[0], p[1], 14, 8, a + 90), 'k']; });
    const kL = (y) => [560.9 + ((y - 686.9) / 55.1) * 11.1, y], kR = (y) => [1200 - kL(y)[0], y];
    const kb = (t) => { const u = 1 - t; return [u * u * 572 + 2 * u * t * 600 + t * t * 628, u * u * 742 + 2 * u * t * 750 + t * t * 742]; };
    L.horseshoe = {
      name: ['Lucky horseshoe', 'Fer à cheval chanceux'], emoji: '🍀', level: 1, cat: 'horses',
      steps: [
        { t: ['Draw a big letter U.', 'Dessine un gros U.'], d: ['M350 250L350 440A250 250 0 0 0 850 440L850 250'] },
        { t: ['Draw a smaller U inside and round the ends.', 'Dessine un plus petit U dedans et arrondis les bouts.'], d: ['M350 250Q400 215 450 250L450 440A150 150 0 0 0 750 440L750 250Q800 215 850 250'] },
        { t: ['Add little nail holes.', 'Ajoute des petits trous pour les clous.'], d: [...holes, [ell(400, 300, 8, 14), 'k'], [ell(800, 300, 8, 14), 'k']] },
        { t: ['Tie a pretty bow at the bottom.', 'Attache une jolie boucle en bas.'], d: [`M${P(oc, 99)}L572 742Q600 750 628 742L${P(oc, 81)}`,
          `M${S(kL(705))}C520 680 445 690 450 740C455 790 530 775 ${S(kL(730))}`, `M${S(kR(705))}C680 680 755 690 750 740C745 790 670 775 ${S(kR(730))}`,
          `M${S(kb(0.18))}L548 838L574 824L590 842L${S(kb(0.45))}`, `M${S(kb(0.82))}L652 838L626 824L610 842L${S(kb(0.55))}`] },
        { t: ['Add a heart and sparkles for good luck!', 'Ajoute un cœur et des étoiles pour la chance!'], d: [heart(600, 405, 68), star(245, 200, 44, 19), star(960, 190, 36, 15), star(240, 560, 26, 11), star(975, 520, 30, 13)] }
      ],
      colors: [[600, 640, '#FFC93C'], [600, 715, '#FF3D7F'], [480, 740, '#FF8FC0'], [720, 740, '#FF8FC0'], [568, 800, '#FF8FC0'], [632, 800, '#FF8FC0'], [600, 420, '#FF5A7A'],
        [245, 200, '#FFE066'], [960, 190, '#FFE066'], [240, 560, '#FFE066'], [975, 520, '#FFE066']]
    };
  })();

  // =====================================================================
  // COW
  // =====================================================================
  (function () {
    const mz = E(760, 480, 118, 72), hd = E(760, 340, 135, 128);
    const aL = cross(hd, mz, 90, 180), aR = cross(hd, mz, 0, 90);
    const tb = [[360, 352], [290, 360], [285, 470], [295, 560]], T = bz(...tb, 0.22);
    const leg = (a, b) => `M${a} 632L${a} 770L${b} 770L${b} 632M${a} 742L${b} 742`;
    L.cow = {
      name: ['Cow', 'Vache'], emoji: '🐮', level: 2, cat: 'animals',
      steps: [
        { t: ['Draw a wide oval nose with two nostrils.', 'Dessine un museau ovale avec deux narines.'], d: [eD(mz), [ell(718, 472, 14, 10), 'k'], [ell(802, 472, 14, 10), 'k']] },
        { t: ['Draw a big round head on top.', 'Dessine une grosse tête ronde par-dessus.'], d: [arc(hd, aL, 360 + aR)] },
        { t: ['Add floppy ears and little horns.', 'Ajoute des oreilles et des petites cornes.'], d: [ear(hd, 194, 216, 80, 16), ear(hd, 324, 346, 80, 16), ear(hd, 240, 256, 52, -2), ear(hd, 284, 300, 52, -2)] },
        { t: ['Draw two eyes and a happy smile.', 'Dessine deux yeux et un beau sourire.'], d: [[ell(712, 345, 14, 19), 'k'], [ell(808, 345, 14, 19), 'k'], 'M728 512Q760 532 792 512'] },
        { t: ['Draw a big body, like a pillow.', 'Dessine un gros corps, comme un oreiller.'], d: [`M${P(hd, 172)}C560 350 420 345 360 352C290 360 285 470 295 560C302 625 330 632 380 632L640 632C670 632 680 600 ${P(mz, 155)}`] },
        { t: ['Add four legs and a pink udder.', 'Ajoute quatre pattes et un pis rose.'], d: [leg(385, 430), leg(448, 493), leg(545, 590), leg(603, 640), 'M499 632C501 676 537 676 539 632'] },
        { t: ['Add a tail and big spots. Moo!', 'Ajoute une queue et des grosses taches. Meuh!'], d: [`M${S(T)}C245 420 232 500 248 545`, 'M248 545C222 560 228 602 250 602C272 602 276 560 248 545Z',
          blob(430, 450, 52, 5, 10), blob(560, 560, 40, 5, -20), blob(555, 410, 30, 5, 0), blob(820, 268, 32, 5, 15)] }
      ],
      colors: [[760, 520, '#FFB8C8'], [700, 260, '#FFF8EE'], [500, 500, '#FFF8EE'], [...pt(grow(hd, 40), 205), '#FFF8EE'], [...pt(grow(hd, 40), 335), '#FFF8EE'], [...pt(grow(hd, 25), 248), '#FFE9A8'], [...pt(grow(hd, 25), 292), '#FFE9A8'],
        [430, 450, '#3A2A4A'], [560, 560, '#3A2A4A'], [555, 410, '#3A2A4A'], [820, 268, '#3A2A4A'], [250, 580, '#3A2A4A'],
        [407, 690, '#FFF8EE'], [470, 690, '#FFF8EE'], [567, 690, '#FFF8EE'], [621, 690, '#FFF8EE'], [407, 756, '#5A3A2A'], [470, 756, '#5A3A2A'], [567, 756, '#5A3A2A'], [621, 756, '#5A3A2A'], [519, 648, '#FF9EB5']]
    };
  })();

  // =====================================================================
  // PIG
  // =====================================================================
  (function () {
    const bd = E(600, 460, 240, 215);
    const foot = (a1, a2, x) => `M${P(bd, a1)}Q${x - 37} 722 ${x - 7} 722L${x} 708L${x + 7} 722Q${x + 37} 722 ${P(bd, a2)}`;
    L.pig = {
      name: ['Piggy', 'Petit cochon'], emoji: '🐷', level: 1, cat: 'animals',
      steps: [
        { t: ['Draw a big round ball.', 'Dessine une grosse boule toute ronde.'], d: [eD(bd)] },
        { t: ['Add a snout with two nostrils.', 'Ajoute un groin avec deux narines.'], d: [ell(600, 510, 85, 58), [ell(570, 510, 12, 20), 'k'], [ell(630, 510, 12, 20), 'k']] },
        { t: ['Add two pointy ears.', 'Ajoute deux oreilles pointues.'], d: [ear(bd, 232, 256, 100, -4), ear(bd, 284, 308, 100, -4)] },
        { t: ['Draw eyes, rosy cheeks and a smile.', 'Dessine les yeux, des joues roses et un sourire.'], d: [[circ(515, 412, 18), 'k'], [circ(685, 412, 18), 'k'], ell(452, 500, 30, 18), ell(748, 500, 30, 18), 'M560 598Q600 622 640 598'] },
        { t: ['Add little feet and a curly tail!', 'Ajoute des petits pieds et une queue en tire-bouchon!'], d: [foot(112, 96, 541), foot(84, 68, 659), `M${P(bd, -5)}C900 450 930 400 905 380C880 362 855 395 880 410C905 425 935 400 940 370`] }
      ],
      colors: [[600, 330, '#FFB3C7'], [600, 545, '#FF8FAB'], [...pt(grow(bd, 40), 243), '#FF8FAB'], [...pt(grow(bd, 40), 297), '#FF8FAB'], [452, 500, '#FF6F91'], [748, 500, '#FF6F91'], [541, 690, '#FF8FAB'], [659, 690, '#FF8FAB']]
    };
  })();

  // =====================================================================
  // SHEEP
  // =====================================================================
  (function () {
    const hd = E(600, 400, 112, 128);
    const capP = bumpPts(E(600, 360, 150, 165), 203, 337, 6, pt(hd, 203), pt(hd, 337));
    const bodyP = bumpPts(E(600, 545, 275, 192), 244, -64, 22, pt(hd, 190), pt(hd, 350));
    const legAt = (x) => { let i = 1; for (let k = 1; k < bodyP.length - 1; k++) if (bodyP[k][1] > 600 && Math.abs(bodyP[k][0] - x) < Math.abs(bodyP[i][0] - x)) i = k; return [bodyP[i], bodyP[i + 1]].sort((p, q) => p[0] - q[0]); };
    const legs = [legAt(545), legAt(655 + 30)];
    const legD = legs.map(([A, B]) => `M${S(A)}L${f(A[0])} 822Q${f(A[0])} 840 ${f(A[0] + 15)} 840L${f(B[0] - 15)} 840Q${f(B[0])} 840 ${f(B[0])} 822L${S(B)}M${f(A[0])} 808L${f(B[0])} 808`);
    L.sheep = {
      name: ['Fluffy sheep', 'Mouton tout doux'], emoji: '🐑', level: 2, cat: 'animals',
      steps: [
        { t: ['Draw an oval for the face.', 'Dessine un ovale pour le visage.'], d: [eD(hd)] },
        { t: ['Add a fluffy wool hat on top.', 'Ajoute une tuque de laine toute frisée.'], d: [bumps(capP, 1, 1.05)] },
        { t: ['Draw a big fluffy cloud for the body.', 'Dessine un gros nuage tout frisé pour le corps.'], d: [bumps(bodyP, 0, 1.05)] },
        { t: ['Add two ears on the sides.', 'Ajoute deux oreilles sur les côtés.'], d: [ear(hd, 140, 164, 70, 10), ear(hd, 16, 40, 70, 10)] },
        { t: ['Draw two little legs.', 'Dessine deux petites pattes.'], d: legD },
        { t: ['Draw eyes, a pink nose and a smile.', 'Dessine les yeux, un nez rose et un sourire.'], d: [[circ(560, 408, 14), 'k'], [circ(640, 408, 14), 'k'], 'M585 452Q600 444 615 452Q610 468 600 470Q590 468 585 452Z', 'M600 470Q594 490 578 486', 'M600 470Q606 490 622 486', ell(540, 452, 16, 10), ell(660, 452, 16, 10)] }
      ],
      colors: [[600, 420, '#F9D5C5'], [600, 300, '#FFF3D6'], [420, 600, '#FFF3D6'], [780, 600, '#FFF3D6'], [...pt(grow(hd, 35), 152), '#F9D5C5'], [...pt(grow(hd, 35), 28), '#F9D5C5'],
        ...legs.map(([A, B]) => [(A[0] + B[0]) / 2, 790, '#6D5A6E']), ...legs.map(([A, B]) => [(A[0] + B[0]) / 2, 826, '#3A2A4A']), [600, 458, '#FF8FA8'], [540, 452, '#FFB3C7'], [660, 452, '#FFB3C7']]
    };
  })();

  // =====================================================================
  // DUCK
  // =====================================================================
  (function () {
    const hd = E(470, 320, 125, 120);
    L.duck = {
      name: ['Duckling', 'Petit canard'], emoji: '🦆', level: 1, cat: 'animals',
      steps: [
        { t: ['Draw a round head.', 'Dessine une tête ronde.'], d: [eD(hd)] },
        { t: ['Add a flat beak.', 'Ajoute un bec tout plat.'], d: [`M${P(hd, 200)}C290 252 205 278 210 322C214 364 290 388 ${P(hd, 160)}`, `M210 322Q290 330 ${P(hd, 180)}`] },
        { t: ['Draw the body with a pointy tail.', 'Dessine le corps avec une queue pointue.'], d: [`M${P(hd, 102)}C340 500 360 690 560 695C730 700 860 640 920 470C860 520 760 510 700 450C660 410 620 390 ${P(hd, 22)}`] },
        { t: ['Draw a wing.', 'Dessine une aile.'], d: ['M560 545C610 470 760 490 800 535C770 548 760 562 735 568C752 592 705 612 680 600C640 622 565 615 560 545Z'] },
        { t: ['Add an eye, a cheek and little waves.', 'Ajoute un œil, une joue et des petites vagues.'], d: [[circ(425, 292, 17), 'k'], ell(410, 352, 22, 13), 'M240 790Q290 770 340 790T440 790T540 790T640 790T740 790T840 790T940 790'] }
      ],
      colors: [[480, 300, '#FFE066'], [620, 640, '#FFE066'], [290, 300, '#FF8C42'], [290, 345, '#FF7A2F'], [680, 560, '#FFD23F'], [410, 352, '#FF9EB5']]
    };
  })();

  // =====================================================================
  // HEN
  // =====================================================================
  (function () {
    const bd = E(590, 480, 225, 210);
    const toes = (x) => `M${x} 770L${x - 35} 790M${x} 770L${x + 35} 790M${x} 770L${x} 800`;
    L.hen = {
      name: ['Hen', 'Poule'], emoji: '🐔', level: 2, cat: 'animals',
      steps: [
        { t: ['Draw a big round body.', 'Dessine un gros corps tout rond.'], d: [eD(bd)] },
        { t: ['Add fluffy tail feathers.', 'Ajoute des plumes de queue.'], d: [`M${P(bd, -58)}C730 200 800 180 820 240C870 210 930 250 905 310C960 320 965 400 ${P(bd, -8)}`, `M820 240Q780 290 ${P(bd, -42)}`, `M905 310Q860 350 ${P(bd, -24)}`] },
        { t: ['Draw a red comb on top.', 'Dessine une crête rouge sur le dessus.'], d: [bumps(bumpPts(bd, 234, 280, 3), 1, 1.45, true)] },
        { t: ['Add a little beak and a wattle.', 'Ajoute un petit bec et un barbillon.'], d: [`M${P(bd, 191)}L292 402L${P(bd, 212)}`, `M${P(bd, 187)}C318 468 308 540 338 548C362 554 372 522 ${P(bd, 174)}`] },
        { t: ['Draw a wing.', 'Dessine une aile.'], d: ['M520 520C600 450 740 470 760 540C735 545 730 560 710 565C725 590 690 610 665 600C630 625 540 610 520 520Z'] },
        { t: ['Add two legs with toes.', 'Ajoute deux pattes avec des orteils.'], d: [`M${P(bd, 100)}L545 770`, toes(545), `M${P(bd, 80)}L635 770`, toes(635)] },
        { t: ['Draw an eye and a rosy cheek. Cluck!', 'Dessine un œil et une joue rose. Cot cot!'], d: [[circ(440, 400, 16), 'k'], ell(452, 450, 20, 12)] }
      ],
      colors: [[600, 420, '#F4A259'], [780, 260, '#8D5A3B'], [870, 300, '#B5651D'], [900, 380, '#8D5A3B'], ...[0, 1, 2].map((i) => [...pt(grow(bd, 30), 234 + (46 / 3) * (i + 0.5)), '#E63946']),
        [340, 405, '#FFC93C'], [340, 505, '#E63946'], [650, 540, '#C9733A'], [452, 450, '#FF9EB5']]
    };
  })();

  // =====================================================================
  // BARN
  // =====================================================================
  (function () {
    const win = (x, y, s) => [rr(x, y, s, s, 8), `M${x + s / 2} ${y}L${x + s / 2} ${y + s}`, `M${x} ${y + s / 2}L${x + s} ${y + s / 2}`];
    const winSeeds = (x, y, s, c) => [[x + s / 4, y + s / 4, c], [x + 3 * s / 4, y + s / 4, c], [x + s / 4, y + 3 * s / 4, c], [x + 3 * s / 4, y + 3 * s / 4, c]];
    const post = (x) => rr(x, 660, 30, 160, 8);
    L.barn = {
      name: ['Red barn', 'Grange rouge'], emoji: '🚜', level: 3, cat: 'things',
      steps: [
        { t: ['Draw a big box for the barn.', 'Dessine une grosse boîte pour la grange.'], d: ['M360 460L360 820L840 820L840 460Z'] },
        { t: ['Draw the roof, with a bend on each side.', 'Dessine le toit, avec un pli de chaque côté.'], d: ['M360 460L395 300L600 185L805 300L840 460'] },
        { t: ['Draw a second line inside the roof.', 'Dessine une deuxième ligne dans le toit.'], d: ['M392 460L422 318L600 218L778 318L808 460'] },
        { t: ['Draw two big doors.', 'Dessine deux grandes portes.'], d: ['M480 820L480 590L720 590L720 820', 'M600 590L600 820'] },
        { t: ['Make an X on each door.', 'Fais un X sur chaque porte.'], d: ['M480 590L600 820M600 590L480 820', 'M600 590L720 820M720 590L600 820'] },
        { t: ['Add a window up high for the hay.', 'Ajoute une fenêtre en haut pour le foin.'], d: win(550, 300, 100) },
        { t: ['Add two small windows.', 'Ajoute deux petites fenêtres.'], d: [...win(392, 515, 60), ...win(748, 515, 60)] },
        { t: ['Draw a little fence on each side.', 'Dessine une petite clôture de chaque côté.'], d: [post(170), post(255), post(915), post(1000), 'M200 700L255 700M200 760L255 760M285 700L360 700M285 760L360 760', 'M840 700L915 700M840 760L915 760M945 700L1000 700M945 760L1000 760'] }
      ],
      colors: [[420, 700, '#E63946'], [600, 270, '#E63946'], [600, 205, '#F1FAEE'], [380, 420, '#F1FAEE'], [820, 420, '#F1FAEE'],
        [540, 640, '#B5172A'], [540, 785, '#B5172A'], [500, 705, '#C1121F'], [580, 705, '#C1121F'], [660, 640, '#B5172A'], [660, 785, '#B5172A'], [620, 705, '#C1121F'], [700, 705, '#C1121F'],
        ...winSeeds(550, 300, 100, '#FFE066'), ...winSeeds(392, 515, 60, '#FFE066'), ...winSeeds(748, 515, 60, '#FFE066'),
        [185, 740, '#C98B5A'], [270, 740, '#C98B5A'], [930, 740, '#C98B5A'], [1015, 740, '#C98B5A'], [227, 730, '#C98B5A'], [322, 730, '#C98B5A'], [877, 730, '#C98B5A'], [972, 730, '#C98B5A']]
    };
  })();
})();
