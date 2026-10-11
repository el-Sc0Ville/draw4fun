/* draw4fun pack: magic */
(function () {
  'use strict';
  const H = window.ART.helpers, ell = H.ell, circ = H.circ, rr = H.rr, star = H.starD, heart = H.heartD;
  const L = window.PAPER.lessons;

  // ---------- little geometry helpers (so lines meet exactly) ----------
  const f = (n) => Math.round(n * 10) / 10;
  const RAD = Math.PI / 180;
  const P = (p) => f(p[0]) + ' ' + f(p[1]);
  // point on ellipse at angle a (degrees, y down)
  const ep = (e, a) => [e[0] + e[2] * Math.cos(a * RAD), e[1] + e[3] * Math.sin(a * RAD)];
  // point on ellipse at given x (s = -1 top, +1 bottom)
  const ex = (e, x, s) => [x, e[1] + s * e[3] * Math.sqrt(Math.max(0, 1 - Math.pow((x - e[0]) / e[2], 2)))];
  const E = (e) => ell(e[0], e[1], e[2], e[3]);
  // cubic bezier point
  const bz = (c, t) => { const u = 1 - t; return [0, 1].map((k) => u * u * u * c[0][k] + 3 * u * u * t * c[1][k] + 3 * u * t * t * c[2][k] + t * t * t * c[3][k]); };
  const qz = (c, t) => { const u = 1 - t; return [0, 1].map((k) => u * u * c[0][k] + 2 * u * t * c[1][k] + t * t * c[2][k]); };
  const C = (c) => `M${P(c[0])}C${P(c[1])} ${P(c[2])} ${P(c[3])}`;
  // t where a monotonic cubic reaches x (or y with k=1)
  function bzAt(c, v, k) {
    k = k || 0; let a = 0, b = 1; const up = bz(c, 1)[k] > bz(c, 0)[k];
    for (let i = 0; i < 40; i++) { const m = (a + b) / 2; if ((bz(c, m)[k] < v) === up) a = m; else b = m; }
    return bz(c, (a + b) / 2);
  }
  // mirror a path (M L C Q A H V Z, absolute) around x = 600
  function mir(d) {
    const tok = d.match(/[A-Za-z]|-?\d*\.?\d+(?:e-?\d+)?/g); let out = '', cmd = '', args = [];
    const N = { M: 2, L: 2, C: 6, Q: 4, A: 7, H: 1, V: 1, Z: 0 };
    const flush = () => {
      if (!cmd) return; const n = N[cmd];
      if (n === 0) { out += 'Z'; return; }
      for (let i = 0; i < args.length; i += n) {
        const g = args.slice(i, i + n);
        if (cmd === 'A') { g[2] = -g[2]; g[4] = 1 - g[4]; g[5] = 1200 - g[5]; }
        else if (cmd === 'H') g[0] = 1200 - g[0];
        else if (cmd !== 'V') for (let j = 0; j < g.length; j += 2) g[j] = 1200 - g[j];
        out += cmd + g.map((v) => f(v)).join(' ');
      }
    };
    for (const t of tok) { if (/[A-Za-z]/.test(t)) { flush(); cmd = t; args = []; } else args.push(+t); }
    flush(); return out;
  }
  // circle / circle intersections
  function cx2(a, b) {
    const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy);
    if (d > a[2] + b[2] || d < Math.abs(a[2] - b[2])) return [];
    const l = (a[2] * a[2] - b[2] * b[2] + d * d) / (2 * d), h = Math.sqrt(Math.max(0, a[2] * a[2] - l * l));
    const mx = a[0] + (dx * l) / d, my = a[1] + (dy * l) / d;
    return [[mx + (h * dy) / d, my - (h * dx) / d], [mx - (h * dy) / d, my + (h * dx) / d]];
  }
  // arc on circle c from p to q (sweep 1 = clockwise on screen), picks the large-arc flag
  function arc(c, p, q, sw) {
    let a1 = Math.atan2(p[1] - c[1], p[0] - c[0]), a2 = Math.atan2(q[1] - c[1], q[0] - c[0]);
    let span = sw ? a2 - a1 : a1 - a2; while (span < 0) span += 2 * Math.PI;
    return `A${c[2]} ${c[2]} 0 ${span > Math.PI ? 1 : 0} ${sw} ${P(q)}`;
  }
  // a little "sausage" arm from two points on the body to a round hand
  function arm(b1, b2, hc, r) {
    const m = [(b1[0] + b2[0]) / 2, (b1[1] + b2[1]) / 2], len = Math.hypot(hc[0] - m[0], hc[1] - m[1]);
    const d = [(hc[0] - m[0]) / len, (hc[1] - m[1]) / len], n = [-d[1], d[0]];
    let s1 = [hc[0] + r * n[0], hc[1] + r * n[1]], s2 = [hc[0] - r * n[0], hc[1] - r * n[1]];
    if (Math.hypot(s1[0] - b1[0], s1[1] - b1[1]) > Math.hypot(s2[0] - b1[0], s2[1] - b1[1])) { const t = s1; s1 = s2; s2 = t; }
    const v = [s1[0] - hc[0], s1[1] - hc[1]], sw = v[0] * d[1] - v[1] * d[0] < 0 ? 0 : 1;
    return `M${P(b1)}L${P(s1)}A${r} ${r} 0 0 ${sw} ${P(s2)}L${P(b2)}`;
  }
  const spark = (x, y, s) => star(x, y, s, s * 0.32, 4, -90); // 4-point twinkle

  // ================= FAIRY =================
  {
    const hd = [600, 290, 140, 130];
    const capL = ep(hd, 175), capR = ep(hd, 5), bgL = ep(hd, 195), bgR = ep(hd, 345);
    const nL = ep(hd, 100), nR = ep(hd, 80);
    const hemY = 650, hemL = 460;
    const dx = (y) => nL[0] + (hemL - nL[0]) * (y - nL[1]) / (hemY - nL[1]); // left dress edge
    const D = (y) => [dx(y), y];
    let hem = `M${P(nL)}L${hemL} ${hemY}`;
    for (let i = 0; i < 5; i++) hem += `Q${hemL + 28 + i * 56} ${hemY + 24} ${hemL + 56 * (i + 1)} ${hemY}`;
    hem += `L${P(nR)}`;
    const wingL = `M${P(D(432))}C520 418 470 395 430 345C385 288 300 300 305 375C310 440 380 470 ${P(D(486))}`;
    const armL = arm(D(512), D(542), [445, 590], 17);
    const armR = mir(armL), hand = [755, 590];
    const st = [835, 455];
    L.fairy = {
      name: ['Fairy', 'Fée'], emoji: '🧚', level: 3, cat: 'magic',
      steps: [
        { t: ['Draw a big round head.', 'Dessine une grosse tête ronde.'], d: [E(hd)] },
        { t: ['Draw her hair and her bangs.', 'Dessine ses cheveux et sa frange.'], d: [`M${P(capL)}C440 60 760 60 ${P(capR)}`, `M${P(bgL)}C510 250 560 225 585 185C610 230 680 250 ${P(bgR)}`] },
        { t: ['Draw sweet eyes, a smile and pink cheeks.', 'Dessine des beaux yeux, un sourire et des joues roses.'], d: [[ell(548, 318, 18, 24), 'k'], [ell(652, 318, 18, 24), 'k'], 'M578 368Q600 388 622 368', ell(508, 356, 17, 10), ell(692, 356, 17, 10)] },
        { t: ['Draw a dress like a triangle, with a wavy bottom.', 'Dessine une robe en triangle, avec le bas en vagues.'], d: [hem] },
        { t: ['Add two big pretty wings.', 'Ajoute deux grandes ailes toutes jolies.'], d: [wingL, mir(wingL)] },
        { t: ['Draw her arms and her legs.', 'Dessine ses bras et ses jambes.'], d: [armL, armR, `M572 ${hemY}L572 ${f(ex([562, 738, 26, 14], 572, -1)[1])}`, `M628 ${hemY}L628 ${f(ex([638, 738, 26, 14], 628, -1)[1])}`, ell(562, 738, 26, 14), ell(638, 738, 26, 14)] },
        { t: ['Give her a magic wand with a star!', 'Donne-lui une baguette magique avec une étoile!'], d: [`M${P([hand[0] + 12, hand[1] - 12])}L${P([st[0], st[1] + 20])}`, star(st[0], st[1], 46, 20), spark(905, 370, 22), spark(905, 530, 16), circ(780, 500, 7)] }
      ],
      colors: [[600, 400, '#FFE3D3'], [600, 140, '#FF8FC8'], [540, 205, '#FF8FC8'], [600, 560, '#C77DFF'], [380, 380, '#9BE7FF'], [820, 380, '#9BE7FF'],
        [445, 590, '#FFE3D3'], [755, 590, '#FFE3D3'], [562, 742, '#FF6FB5'], [638, 742, '#FF6FB5'], [st[0], st[1], '#FFD23F'], [508, 356, '#FF9EB5'], [692, 356, '#FF9EB5']]
    };
  }

  // ================= PRINCESS =================
  {
    const hd = [600, 285, 135, 125];
    const capL = ep(hd, 175), capR = ep(hd, 5);
    const cap = [capL, [440, 70], [760, 70], capR];
    const bgL = ep(hd, 195), bgM = ep(hd, 290), bgR = ep(hd, 345);
    const cA = bzAt(cap, 540), cB = bzAt(cap, 660);
    const nL = ep(hd, 100), nR = ep(hd, 80);
    const wL = [562, 530], wR = [638, 530];
    const side = (y) => [nL[0] + (wL[0] - nL[0]) * (y - nL[1]) / (wL[1] - nL[1]), y];
    const s1 = side(422), s2 = side(482);
    const slv = `M${P(s1)}C515 395 468 440 495 488C512 512 548 500 ${P(s2)}`;
    const hairL = `M${P(capL)}C440 380 420 470 445 520C462 548 485 520 495 488`;
    const skirt = `M${P(wL)}C500 580 430 700 400 800Q600 840 800 800C770 700 700 580 ${P(wR)}`;
    L.princess = {
      name: ['Princess', 'Princesse'], emoji: '👸', level: 3, cat: 'magic',
      steps: [
        { t: ['Draw a big round head.', 'Dessine une grosse tête ronde.'], d: [E(hd)] },
        { t: ['Draw her hair with a swoosh of bangs.', 'Dessine ses cheveux avec une frange de côté.'], d: [C(cap), `M${P(bgL)}C540 255 610 220 ${P(bgM)}C670 212 700 238 ${P(bgR)}`] },
        { t: ['Draw her eyes with lashes, a smile and cheeks.', 'Dessine ses yeux avec des cils, un sourire et des joues.'], d: [[ell(550, 308, 17, 23), 'k'], [ell(650, 308, 17, 23), 'k'], 'M536 290L524 280M664 290L676 280', 'M580 356Q600 374 620 356', ell(512, 343, 16, 10), ell(688, 343, 16, 10)] },
        { t: ['Put a sparkly crown on her head!', 'Mets-lui une couronne brillante sur la tête!'], d: [`M${P(cA)}L528 80L570 105L600 64L630 105L672 80L${P(cB)}`, [circ(600, 110, 8), 'k']] },
        { t: ['Draw her top with puffy sleeves.', 'Dessine le haut de sa robe avec des manches bouffantes.'], d: [`M${P(nL)}L${P(wL)}L${P(wR)}L${P(nR)}`, slv, mir(slv)] },
        { t: ['Draw a big princess skirt!', 'Dessine une grande jupe de princesse!'], d: [skirt] },
        { t: ['Add her long hair down the sides.', 'Ajoute ses longs cheveux sur les côtés.'], d: [hairL, mir(hairL)] },
        { t: ['Decorate the dress with hearts.', 'Décore la robe avec des cœurs.'], d: [heart(600, 462, 20), heart(520, 720, 26), heart(680, 720, 26), heart(600, 640, 26)] }
      ],
      colors: [[600, 390, '#FFE3D3'], [600, 143, '#9C6644'], [560, 200, '#9C6644'], [690, 212, '#9C6644'], [600, 90, '#FFD23F'], [470, 450, '#9C6644'], [730, 450, '#9C6644'], [600, 500, '#FF6FB5'], [530, 450, '#FFB4D8'], [670, 450, '#FFB4D8'],
        [600, 760, '#FF9EC4'], [600, 462, '#FFF1F7'], [520, 722, '#FFF1F7'], [680, 722, '#FFF1F7'], [600, 642, '#FFF1F7'], [512, 343, '#FF9EB5'], [688, 343, '#FF9EB5']]
    };
  }

  // ================= CASTLE =================
  {
    const flag = (x, y) => [`M${x} ${y}L${x} ${y - 55}`, `M${x} ${y - 55}L${x + 42} ${y - 42}L${x} ${y - 29}`];
    const winA = (x, y) => `M${x - 16} ${y + 34}L${x - 16} ${y}A16 16 0 0 1 ${x + 16} ${y}L${x + 16} ${y + 34}Z`;
    let bat = '';
    for (const x of [430, 480, 680, 730]) bat += `M${x} 480L${x} 450L${x + 30} 450L${x + 30} 480`;
    L.castle = {
      name: ['Castle', 'Château'], emoji: '🏰', level: 2, cat: 'magic',
      steps: [
        { t: ['Draw a big square wall.', 'Dessine un grand mur carré.'], d: ['M420 480L420 800L780 800L780 480Z'] },
        { t: ['Add a tall tower on each side.', 'Ajoute une grande tour de chaque côté.'], d: ['M420 480L420 380L310 380L310 800L420 800', 'M780 480L780 380L890 380L890 800L780 800'] },
        { t: ['Put a tower in the middle, on top.', 'Mets une tour au milieu, sur le dessus.'], d: ['M530 480L530 300L670 300L670 480'] },
        { t: ['Give every tower a pointy roof.', 'Donne un toit pointu à chaque tour.'], d: ['M310 380L365 235L420 380', 'M780 380L835 235L890 380', 'M530 300L600 150L670 300'] },
        { t: ['Add little flags on top!', 'Ajoute des petits drapeaux en haut!'], d: [...flag(365, 235), ...flag(835, 235), ...flag(600, 150)] },
        { t: ['Draw a big door and some windows.', 'Dessine une grande porte et des fenêtres.'], d: ['M550 800L550 712A50 50 0 0 1 650 712L650 800', [circ(632, 760, 7), 'k'], winA(365, 470), winA(835, 470), winA(365, 620), winA(835, 620), circ(600, 380, 32)] },
        { t: ['Make bumps along the top of the wall.', 'Fais des petites bosses en haut du mur.'], d: [bat] }
      ],
      colors: [[480, 650, '#E9DDFF'], [365, 700, '#D7C4FF'], [835, 700, '#D7C4FF'], [600, 440, '#D7C4FF'], [365, 330, '#FF6FB5'], [835, 330, '#FF6FB5'], [600, 260, '#FF6FB5'],
        [380, 192, '#FFD23F'], [850, 192, '#FFD23F'], [615, 107, '#FFD23F'], [600, 760, '#B07A4F'], [365, 490, '#8FD3FF'], [835, 490, '#8FD3FF'], [365, 640, '#8FD3FF'], [835, 640, '#8FD3FF'], [600, 380, '#8FD3FF'],
        [445, 468, '#E9DDFF'], [495, 468, '#E9DDFF'], [695, 468, '#E9DDFF'], [745, 468, '#E9DDFF']]
    };
  }

  // ================= CROWN =================
  L.crown = {
    name: ['Crown', 'Couronne'], emoji: '👑', level: 1, cat: 'magic',
    steps: [
      { t: ['Draw a long rounded band.', 'Dessine une longue bande arrondie.'], d: [rr(400, 600, 400, 100, 20)] },
      { t: ['Draw three pointy peaks on top.', 'Dessine trois pointes sur le dessus.'], d: ['M420 600L390 380L495 490L600 320L705 490L810 380L780 600'] },
      { t: ['Put a little ball on each peak.', 'Mets une petite boule sur chaque pointe.'], d: [circ(390, 355, 25), circ(600, 295, 25), circ(810, 355, 25)] },
      { t: ['Add shiny jewels: a heart and a star!', 'Ajoute des bijoux brillants : un cœur et une étoile!'], d: [heart(600, 640, 30), circ(485, 650, 20), circ(715, 650, 20), star(600, 470, 40, 18)] },
      { t: ['Make it sparkle!', 'Fais-la briller!'], d: [spark(290, 300, 34), spark(920, 280, 30), spark(300, 640, 24), spark(905, 620, 26)] }
    ],
    colors: [[600, 560, '#FFD23F'], [600, 680, '#FFB703'], [390, 355, '#FF6FB5'], [600, 295, '#C77DFF'], [810, 355, '#FF6FB5'], [600, 645, '#FF3D7F'], [485, 650, '#4CC9F0'], [715, 650, '#4CC9F0'], [600, 472, '#FFF3B0'],
      [290, 300, '#FFD23F'], [920, 280, '#FFD23F'], [300, 640, '#FFD23F'], [905, 620, '#FFD23F']]
  };

  // ================= DRAGON =================
  {
    const hd = [600, 290, 175, 145];
    const bL = ep(hd, 122), bR = ep(hd, 58);
    const bodyL = [bL, [415, 470], [420, 712], [600, 712]];
    const bodyR = [bR, [785, 470], [780, 712], [600, 712]];
    const body = `M${P(bL)}C415 470 420 712 600 712C780 712 785 470 ${P(bR)}`;
    const bel = [600, 592, 88, 92];
    const stripe = (y) => { const h = bel[2] * Math.sqrt(1 - Math.pow((y - bel[1]) / bel[3], 2)); return `M${f(600 - h)} ${y}Q600 ${y + 16} ${f(600 + h)} ${y}`; };
    const hL1 = ep(hd, 238), hL2 = ep(hd, 255);
    const hornL = `M${P(hL1)}C498 135 488 110 492 82C522 98 545 120 ${P(hL2)}`;
    const k1 = ex(hd, 572, -1), k2 = ex(hd, 600, -1), k3 = ex(hd, 628, -1);
    const spikes = `M${P(k1)}L586 112L${P(k2)}L614 112L${P(k3)}`;
    const w1 = bz(bodyL, 0.1), w2 = bz(bodyL, 0.4);
    const wingL = `M${P(w1)}C430 430 380 375 315 345C322 385 310 415 335 440C318 465 335 492 368 498C372 525 410 535 ${P(w2)}`;
    const f1 = bz(bodyL, 0.78), f2 = bz(bodyL, 0.97);
    const footL = `M${P(f1)}C438 735 468 778 522 778C558 778 574 752 ${P(f2)}`;
    const t1 = bz(bodyR, 0.5), t2 = bz(bodyR, 0.76);
    const tip = [912, 455];
    const tail = `M${P(t2)}C830 690 905 620 ${P(tip)}C882 545 830 585 ${P(t1)}`;
    L.dragon = {
      name: ['Baby dragon', 'Bébé dragon'], emoji: '🐉', level: 3, cat: 'magic',
      steps: [
        { t: ['Draw a big round head.', 'Dessine une grosse tête ronde.'], d: [E(hd)] },
        { t: ['Add a chubby body under it.', 'Ajoute un corps tout dodu en dessous.'], d: [body] },
        { t: ['Draw a big belly with stripes.', 'Dessine un gros ventre avec des rayures.'], d: [E(bel), stripe(545), stripe(592), stripe(639)] },
        { t: ['Add two little horns and spikes on top.', 'Ajoute deux petites cornes et des pics sur le dessus.'], d: [hornL, mir(hornL), spikes] },
        { t: ['Draw big eyes, a little nose and a smile.', 'Dessine des grands yeux, un petit nez et un sourire.'], d: [[ell(528, 290, 25, 32), 'k'], [ell(672, 290, 25, 32), 'k'], [ell(580, 345, 8, 6), 'k'], [ell(620, 345, 8, 6), 'k'], 'M555 375Q600 408 645 375', ell(478, 345, 21, 13), ell(722, 345, 21, 13)] },
        { t: ['Give it two little wings.', 'Donne-lui deux petites ailes.'], d: [wingL, mir(wingL)] },
        { t: ['Draw two chubby feet.', 'Dessine deux pieds tout ronds.'], d: [footL, mir(footL), 'M487 758L489 778M512 762L513 778', 'M713 758L711 778M688 762L687 778'] },
        { t: ['Swish! Add a tail with a heart.', 'Hop! Ajoute une queue avec un cœur.'], d: [tail, heart(tip[0], tip[1] - 40, 40)] }
      ],
      colors: [[600, 200, '#7FD6A4'], [460, 560, '#7FD6A4'], [600, 530, '#FFF1B8'], [600, 575, '#FFF1B8'], [600, 620, '#FFF1B8'], [600, 665, '#FFF1B8'], [505, 120, '#FFD23F'], [695, 120, '#FFD23F'], [586, 135, '#FFB703'], [614, 135, '#FFB703'],
        [345, 400, '#C77DFF'], [855, 400, '#C77DFF'], [500, 760, '#7FD6A4'], [700, 760, '#7FD6A4'], [815, 615, '#7FD6A4'], [tip[0], tip[1] - 35, '#FF6FB5'], [478, 345, '#FF9EB5'], [722, 345, '#FF9EB5']]
    };
  }

  // ================= WAND =================
  {
    const sc = [600, 290], R = 170, r = 75;
    const iL = [sc[0], sc[1] + r], oL = [sc[0] + R * Math.cos(126 * RAD), sc[1] + R * Math.sin(126 * RAD)];
    const yAt = (x) => iL[1] + (oL[1] - iL[1]) * (iL[0] - x) / (iL[0] - oL[0]);
    const top = f(yAt(578));
    const bow = 'M578 470C510 420 480 520 578 500', bowT = 'M578 500L540 575L566 570L578 535';
    L.wand = {
      name: ['Magic wand', 'Baguette magique'], emoji: '✨', level: 1, cat: 'magic',
      steps: [
        { t: ['Draw a big star.', 'Dessine une grosse étoile.'], d: [star(sc[0], sc[1], R, r)] },
        { t: ['Draw a long stick under the star.', "Dessine un long bâton sous l'étoile."], d: [`M578 ${top}L578 790A22 22 0 0 0 622 790L622 ${top}`] },
        { t: ['Tie a pretty bow on the stick.', 'Attache une jolie boucle sur le bâton.'], d: ['M578 470L622 470M578 500L622 500', bow, mir(bow), bowT, mir(bowT)] },
        { t: ['Give the star a happy face!', "Donne un visage joyeux à l'étoile!"], d: [[ell(560, 290, 13, 18), 'k'], [ell(640, 290, 13, 18), 'k'], 'M578 325Q600 345 622 325'] },
        { t: ['Add sparkles all around!', 'Ajoute des brillants tout autour!'], d: [spark(330, 170, 38), spark(870, 200, 32), spark(330, 520, 26), spark(850, 560, 34), circ(390, 640, 9), circ(800, 680, 9), circ(880, 400, 8)] }
      ],
      colors: [[600, 250, '#FFD23F'], [600, 650, '#FF8FC8'], [600, 430, '#FF8FC8'], [600, 485, '#C77DFF'], [540, 470, '#C77DFF'], [660, 470, '#C77DFF'], [562, 548, '#C77DFF'], [638, 548, '#C77DFF'],
        [330, 170, '#FFD23F'], [870, 200, '#FFD23F'], [330, 520, '#FFD23F'], [850, 560, '#FFD23F']]
    };
  }

  // ================= RAINBOW =================
  {
    const base = 700, bumps = [[205, 640, 70], [325, 572, 120], [458, 640, 70]];
    const yb = 700;
    const b0 = [bumps[0][0] - Math.sqrt(bumps[0][2] ** 2 - (yb - bumps[0][1]) ** 2), yb];
    const b3 = [bumps[2][0] + Math.sqrt(bumps[2][2] ** 2 - (yb - bumps[2][1]) ** 2), yb];
    const i01 = cx2(bumps[0], bumps[1]).sort((a, b) => a[1] - b[1])[0];
    const i12 = cx2(bumps[1], bumps[2]).sort((a, b) => a[1] - b[1])[0];
    const cloudL = `M${P(b0)}${arc(bumps[0], b0, i01, 1)}${arc(bumps[1], i01, i12, 1)}${arc(bumps[2], i12, b3, 1)}Z`;
    const inside = (p, c) => Math.hypot(p[0] - c[0], p[1] - c[1]) < c[2] - 0.5;
    const rc = [600, base];
    const hit = (rad) => {
      let best = null;
      for (const b of bumps) for (const p of cx2([rc[0], rc[1], rad], b)) {
        if (p[1] >= yb || p[0] > 600) continue;
        if (bumps.some((o) => o !== b && inside(p, o))) continue;
        if (!best || p[1] < best[1]) best = p;
      }
      return best;
    };
    const band = (rad) => { const a = hit(rad), b = [1200 - a[0], a[1]]; return `M${P(a)}${arc([rc[0], rc[1], rad], a, b, 1)}`; };
    const radii = [430, 375, 320, 265, 210, 155];
    const face = (x) => [[ell(x - 30, 610, 10, 13), 'k'], [ell(x + 30, 610, 10, 13), 'k'], `M${x - 18} 638Q${x} 656 ${x + 18} 638`];
    L.rainbow = {
      name: ['Rainbow', 'Arc-en-ciel'], emoji: '🌈', level: 1, cat: 'magic',
      steps: [
        { t: ['Draw a fluffy cloud on each side.', 'Dessine un nuage tout doux de chaque côté.'], d: [cloudL, mir(cloudL)] },
        { t: ['Draw a big arch from cloud to cloud.', "Dessine une grande arche d'un nuage à l'autre."], d: [band(radii[0])] },
        { t: ['Draw two more arches just inside.', 'Dessine deux autres arches juste en dedans.'], d: [band(radii[1]), band(radii[2])] },
        { t: ['Keep going: three more arches!', 'Continue : encore trois arches!'], d: [band(radii[3]), band(radii[4]), band(radii[5])] },
        { t: ['Give the clouds happy faces!', 'Donne des visages joyeux aux nuages!'], d: [...face(325), ...face(875)] }
      ],
      colors: [[600, base - 402, '#FF5A5A'], [600, base - 347, '#FFA94D'], [600, base - 292, '#FFE066'], [600, base - 237, '#69DB7C'], [600, base - 182, '#4DABF7'], [325, 530, '#FFFFFF'], [875, 530, '#FFFFFF']]
    };
  }

  // ================= GEM =================
  L.gem = {
    name: ['Diamond', 'Diamant'], emoji: '💎', level: 2, cat: 'magic',
    steps: [
      { t: ['Draw the gem shape: flat on top, pointy at the bottom.', 'Dessine le bijou : plat en haut, pointu en bas.'], d: ['M450 300L750 300L870 430L600 800L330 430Z'] },
      { t: ['Draw a line across.', 'Dessine une ligne de travers.'], d: ['M330 430L870 430'] },
      { t: ['Zigzag along the top part.', 'Fais un zigzag dans le haut.'], d: ['M450 300L510 430L600 300L690 430L750 300'] },
      { t: ['Draw two lines down to the point.', "Dessine deux lignes jusqu'à la pointe."], d: ['M510 430L600 800L690 430'] },
      { t: ['Give your gem a cute face!', 'Donne un visage mignon à ton bijou!'], d: [[ell(572, 505, 10, 14), 'k'], [ell(628, 505, 10, 14), 'k'], 'M585 540Q600 553 615 540'] },
      { t: ['Make it sparkle!', 'Fais-le briller!'], d: [spark(300, 250, 40), spark(910, 300, 32), spark(870, 640, 28), spark(330, 640, 24), circ(250, 450, 8), circ(960, 470, 8)] }
    ],
    colors: [[420, 400, '#9BE7FF'], [510, 340, '#5CD3F5'], [600, 395, '#9BE7FF'], [690, 340, '#5CD3F5'], [780, 400, '#9BE7FF'], [480, 520, '#5CD3F5'], [600, 620, '#C7F2FF'], [720, 520, '#5CD3F5'],
      [300, 250, '#FFD23F'], [910, 300, '#FFD23F'], [870, 640, '#FFD23F'], [330, 640, '#FFD23F']]
  };

  // ================= MUSHROOM HOUSE =================
  {
    const qb = [[320, 480], [600, 540], [880, 480]];
    const sL = qz(qb, (450 - 320) / 560), sR = qz(qb, (750 - 320) / 560);
    const winX = (x) => [circ(x, 620, 36), `M${x - 36} 620L${x + 36} 620`, `M${x} 584L${x} 656`];
    const tuft = (x) => `M${x - 14} 800L${x - 8} 778L${x} 800L${x + 8} 774L${x + 14} 800`;
    const flw = (x, y) => [`M${x} 800L${x} ${y + 20}`, circ(x, y, 20)];
    L.mushroomHouse = {
      name: ['Mushroom house', 'Maison champignon'], emoji: '🍄', level: 2, cat: 'magic',
      steps: [
        { t: ['Draw a big round mushroom top.', 'Dessine un gros chapeau de champignon tout rond.'], d: ['M320 480C300 200 900 200 880 480Q600 540 320 480Z'] },
        { t: ['Draw the house under it.', 'Dessine la maison en dessous.'], d: [`M${P(sL)}C440 600 420 720 430 800L770 800C780 720 760 600 ${P(sR)}`] },
        { t: ['Add a round door.', 'Ajoute une porte toute ronde.'], d: ['M552 800L552 700A48 48 0 0 1 648 700L648 800', [circ(632, 752, 7), 'k']] },
        { t: ['Draw two round windows.', 'Dessine deux fenêtres rondes.'], d: [...winX(490), ...winX(710)] },
        { t: ['Put big spots on the top.', 'Mets des grosses taches sur le chapeau.'], d: [circ(445, 400, 40), circ(600, 345, 40), circ(755, 400, 40), circ(545, 455, 18), circ(668, 452, 18)] },
        { t: ['Add grass and little flowers.', 'Ajoute du gazon et des petites fleurs.'], d: ['M240 800L430 800', 'M770 800L960 800', tuft(300), tuft(900), tuft(470), ...flw(340, 730), ...flw(860, 730), ...flw(395, 755)] }
      ],
      colors: [[520, 340, '#FF5A6E'], [445, 400, '#FFFFFF'], [600, 345, '#FFFFFF'], [755, 400, '#FFFFFF'], [545, 455, '#FFFFFF'], [668, 452, '#FFFFFF'], [600, 610, '#FFF1D6'], [600, 760, '#B07A4F'],
        [472, 602, '#FFE066'], [508, 602, '#FFE066'], [472, 638, '#FFE066'], [508, 638, '#FFE066'], [692, 602, '#FFE066'], [728, 602, '#FFE066'], [692, 638, '#FFE066'], [728, 638, '#FFE066'],
        [340, 730, '#FF9EC4'], [860, 730, '#C77DFF'], [395, 755, '#FFD23F']]
    };
  }

  // ================= SLEEPY MOON =================
  {
    const o = [540, 460, 300], i = [690, 380, 250];
    const pts = cx2(o, i).sort((a, b) => a[1] - b[1]), T = pts[0], B = pts[1];
    const moon = `M${P(T)}${arc(o, T, B, 0)}${arc(i, B, T, 1)}Z`;
    L.sleepyMoon = {
      name: ['Sleepy moon', 'Lune endormie'], emoji: '🌙', level: 1, cat: 'magic',
      steps: [
        { t: ['Draw a big banana-shaped moon.', 'Dessine une grosse lune en forme de banane.'], d: [moon] },
        { t: ['Draw a sleepy closed eye with lashes.', 'Dessine un œil fermé qui dort, avec des cils.'], d: ['M330 470Q365 500 400 470', 'M340 482L330 498M365 490L365 507M390 482L400 498'] },
        { t: ['Add a little smile and a pink cheek.', 'Ajoute un petit sourire et une joue rose.'], d: ['M380 560Q405 578 428 558', ell(330, 545, 22, 13)] },
        { t: ['Draw twinkly stars in the sky.', 'Dessine des étoiles qui brillent dans le ciel.'], d: [star(820, 300, 50, 22), star(900, 560, 36, 16), star(880, 760, 30, 13)] },
        { t: ['Shhh... write Zzz, she is sleeping!', 'Chut... écris Zzz, elle fait dodo!'], d: ['M640 170L690 170L640 220L690 220', 'M720 110L752 110L720 142L752 142', 'M780 70L800 70L780 90L800 90'] }
      ],
      colors: [[300, 400, '#FFE066'], [330, 545, '#FF9EB5'], [820, 302, '#FFD23F'], [900, 562, '#FFD23F'], [880, 762, '#FFD23F']]
    };
  }

  // ================= GHOST =================
  {
    let g = 'M420 700L420 390C420 160 780 160 780 390L780 700';
    for (let k = 0; k < 6; k++) { const x0 = 780 - k * 60; g += `Q${x0 - 30} 752 ${x0 - 60} 700`; }
    g += 'Z';
    const armL = 'M420 480C372 488 340 525 350 550C360 572 400 555 420 540';
    L.ghost = {
      name: ['Friendly ghost', 'Gentil fantôme'], emoji: '👻', level: 1, cat: 'halloween',
      steps: [
        { t: ['Draw a tall ghost with a wavy bottom.', 'Dessine un grand fantôme avec le bas en vagues.'], d: [g] },
        { t: ['Add two little arms.', 'Ajoute deux petits bras.'], d: [armL, mir(armL)] },
        { t: ['Draw two big eyes.', 'Dessine deux grands yeux.'], d: [[ell(540, 390, 24, 32), 'k'], [ell(660, 390, 24, 32), 'k']] },
        { t: ['Add a happy smile and pink cheeks.', 'Ajoute un sourire joyeux et des joues roses.'], d: ['M565 455Q600 505 635 455Q600 466 565 455Z', ell(495, 445, 20, 12), ell(705, 445, 20, 12)] },
        { t: ['Boo! Add stars around it.', 'Bouh! Ajoute des étoiles autour.'], d: [star(280, 260, 42, 18), star(925, 300, 36, 16), star(900, 640, 26, 11), star(290, 650, 30, 13)] }
      ],
      colors: [[600, 600, '#F3F0FF'], [372, 528, '#F3F0FF'], [828, 528, '#F3F0FF'], [600, 470, '#FF6F91'], [495, 445, '#FFB4D0'], [705, 445, '#FFB4D0'],
        [280, 262, '#FFD23F'], [925, 302, '#FFD23F'], [900, 642, '#FF9F1C'], [290, 652, '#FF9F1C']]
    };
  }

  // ================= PUMPKIN =================
  {
    const c = [600, 545, 150, 220];
    const a1 = ep(c, 240), a2 = ep(c, 120), b1 = ep(c, 300), b2 = ep(c, 60);
    const lobeL = `M${P(a1)}C400 300 290 420 290 545C290 670 400 790 ${P(a2)}`;
    const s1 = ex(c, 572, -1), s2 = ex(c, 628, -1);
    const stemR = [s2, [628, 300], [630, 270], [640, 238]];
    const lf = bz(stemR, 0.55);
    const stem = `M${P(s1)}C575 290 570 262 556 238Q598 220 640 238C630 270 628 300 ${P(s2)}`;
    const mt = [[720, 575], [600, 635], [480, 575]];
    const m1 = qz(mt, (720 - 615) / 240), m2 = qz(mt, (720 - 585) / 240);
    L.pumpkin = {
      name: ['Pumpkin', 'Citrouille'], emoji: '🎃', level: 2, cat: 'halloween',
      steps: [
        { t: ['Draw a tall oval in the middle.', 'Dessine un grand ovale au milieu.'], d: [E(c)] },
        { t: ['Add a round bump on each side.', 'Ajoute une bosse ronde de chaque côté.'], d: [lobeL, mir(lobeL)] },
        { t: ['Draw a little stem on top.', 'Dessine une petite tige sur le dessus.'], d: [stem] },
        { t: ['Add a leaf and a curly vine.', 'Ajoute une feuille et une vrille toute frisée.'], d: [`M${P(lf)}C680 230 735 225 770 250C740 285 690 290 ${P(lf)}`, 'M562 252C520 240 495 270 505 292C515 312 545 300 535 282'] },
        { t: ['Draw two triangle eyes and a nose.', 'Dessine deux yeux en triangle et un nez.'], d: [['M505 495L545 425L585 495Z', 'k'], ['M615 495L655 425L695 495Z', 'k'], ['M584 545L600 518L616 545Z', 'k']] },
        { t: ['Give it a big friendly smile!', 'Donne-lui un grand sourire gentil!'], d: [`M480 575Q600 740 720 575Q600 635 480 575Z`, `M${P(m1)}L615 636L585 636L${P(m2)}`] }
      ],
      colors: [[600, 400, '#FF9F1C'], [380, 545, '#FF8C1A'], [820, 545, '#FF8C1A'], [600, 270, '#8B5A2B'], [720, 255, '#69C46B'], [540, 617, '#FFE066'], [660, 617, '#FFE066'], [600, 622, '#FFFFFF']]
    };
  }
})();
