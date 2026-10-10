/* draw4fun pack: yummy */
(function () {
  'use strict';
  const H = window.ART.helpers, ell = H.ell, circ = H.circ, rr = H.rr, star = H.starD, heart = H.heartD;
  const L = window.PAPER.lessons;

  // ---------- little math helpers (so lines meet exactly on earlier outlines) ----------
  const f = (n) => Math.round(n * 10) / 10;
  const P = (p) => f(p[0]) + ' ' + f(p[1]);
  const D2R = Math.PI / 180;
  const onC = (cx, cy, r, deg) => [cx + r * Math.cos(deg * D2R), cy + r * Math.sin(deg * D2R)];
  function bz(a, b, c, d, t) {
    const u = 1 - t;
    return [u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0],
      u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1]];
  }
  // point on a cubic whose x is closest to the wanted x
  function bzAtX(a, b, c, d, x) {
    let best = 0, bd = 1e9;
    for (let i = 0; i <= 400; i++) { const p = bz(a, b, c, d, i / 400); const e = Math.abs(p[0] - x); if (e < bd) { bd = e; best = i / 400; } }
    return bz(a, b, c, d, best);
  }
  // wavy drip line from (x0,y) to (x1,y): n drips hanging down
  function drips(x0, x1, y, n, d) {
    const w = (x1 - x0) / n; let s = `M${f(x0)} ${f(y)}`;
    for (let i = 0; i < n; i++) {
      const x = x0 + i * w, dd = d * (i % 2 ? 0.75 : 1.25);
      s += `C${f(x + 0.05 * w)} ${f(y + 1.33 * dd)} ${f(x + 0.55 * w)} ${f(y + 1.33 * dd)} ${f(x + 0.6 * w)} ${f(y)}`;
      s += `Q${f(x + 0.8 * w)} ${f(y - 0.35 * d)} ${f(x + w)} ${f(y)}`;
    }
    return s;
  }
  const seg = (x, y, len, deg) => { const a = onC(x, y, len / 2, deg), b = onC(x, y, -len / 2, deg); return `M${P(b)}L${P(a)}`; };

  // ================= DONUT =================
  (function () {
    const cx = 600, cy = 450;
    let fr = '';
    for (let a = 0; a <= 360; a += 2) { const r = 205 + 16 * Math.sin(8 * a * D2R); fr += (a ? 'L' : 'M') + P(onC(cx, cy, r, a)); }
    fr += 'Z';
    const spr = [[200, 125, 30], [228, 165, 120], [255, 125, 70], [285, 165, 10], [312, 125, 140], [338, 165, 60], [5, 130, 100], [30, 165, 20], [160, 165, 45], [180, 115, 150], [135, 170, 100], [50, 125, 160]]
      .map(([a, r, rot]) => { const p = onC(cx, cy, r, a); return seg(p[0], p[1], 28, rot); });
    L.donut = {
      name: ['Donut', 'Beigne'], emoji: '🍩', level: 1, cat: 'yummy',
      steps: [
        { t: ['Draw a big circle.', 'Dessine un gros cercle.'], d: [circ(cx, cy, 260)] },
        { t: ['Draw a little hole in the middle.', 'Dessine un petit trou au milieu.'], d: [circ(cx, cy, 78)] },
        { t: ['Add wavy frosting around the hole.', 'Ajoute un glaçage tout ondulé autour du trou.'], d: [fr] },
        { t: ['Give it a happy face!', 'Donne-lui un visage tout content!'], d: [[ell(550, 562, 13, 17), 'k'], [ell(650, 562, 13, 17), 'k'], 'M580 586Q600 606 620 586', ell(512, 590, 21, 13), ell(688, 590, 21, 13)] },
        { t: ['Add lots of sprinkles!', 'Ajoute plein de petits bonbons!'], d: spr }
      ],
      colors: [[cx + 238, cy, '#F2B66D'], [cx - 140, cy, '#FF8FC0'], [512, 590, '#FF5C8A'], [688, 590, '#FF5C8A']]
    };
  })();

  // ================= PIZZA =================
  L.pizza = {
    name: ['Pizza slice', 'Pointe de pizza'], emoji: '🍕', level: 1, cat: 'yummy',
    steps: [
      { t: ['Draw a long puffy crust.', 'Dessine une longue croûte toute gonflée.'], d: [rr(350, 170, 500, 90, 45)] },
      { t: ['Draw a big pointy triangle under it.', 'Dessine un grand triangle pointu en dessous.'], d: ['M405 260L600 800L795 260'] },
      { t: ['Add round pepperoni.', 'Ajoute des pepperonis tout ronds.'], d: [circ(520, 372, 45), circ(668, 408, 42), circ(598, 585, 40)] },
      { t: ['Add two little olives.', 'Ajoute deux petites olives.'], d: [circ(612, 312, 18), circ(548, 478, 18), circ(645, 495, 17)] },
      { t: ['Make the cheese drip. Yum!', 'Fais couler le fromage. Miam!'], d: ['M492.8 503C452 538 440 612 470 624C498 634 510 602 518.1 573.2'] }
    ],
    colors: [[600, 215, '#E9A857'], [600, 720, '#FFD43B'], [478, 590, '#FFD43B'], [520, 372, '#E63946'], [668, 408, '#E63946'], [598, 585, '#E63946'], [612, 312, '#6A994E'], [548, 478, '#6A994E'], [645, 495, '#6A994E']]
  };

  // ================= STRAWBERRY =================
  (function () {
    const S0 = [[600, 290], [440, 250], [330, 350], [365, 490]], S3 = [[835, 490], [870, 350], [760, 250], [600, 290]];
    const body = 'M600 290C440 250 330 350 365 490C400 630 520 760 600 795C680 760 800 630 835 490C870 350 760 250 600 290Z';
    const lp = bz(...S0, 0.55), rp = bz(...S3, 0.45);
    const zig = `M${P(lp)}L430 410L470 368L515 425L556 372L600 435L644 372L685 425L730 368L770 410L${P(rp)}`;
    const s1 = bzAtX(...S0, 588), s2 = bzAtX(...S3, 612);
    const stem = `M${P(s1)}C584 250 572 226 548 206Q560 186 580 196C606 220 612 252 ${P(s2)}`;
    const seeds = [[465, 470, -20], [600, 485, 0], [735, 470, 20], [440, 570, -15], [760, 570, 15], [530, 650, -10], [670, 650, 10], [600, 728, 0]]
      .map(([x, y, r]) => [ell(x, y, 7, 11, r + 90 - 90), 'k']);
    L.strawberry = {
      name: ['Strawberry', 'Fraise'], emoji: '🍓', level: 2, cat: 'yummy',
      steps: [
        { t: ['Draw a big strawberry shape, round on top and pointy at the bottom.', 'Dessine une grosse fraise, ronde en haut et pointue en bas.'], d: [body] },
        { t: ['Draw zig-zag leaves across the top.', 'Dessine des feuilles en zigzag sur le dessus.'], d: [zig] },
        { t: ['Add a little stem.', 'Ajoute une petite queue.'], d: [stem] },
        { t: ['Draw two eyes and a smile.', 'Dessine deux yeux et un sourire.'], d: [[ell(540, 540, 14, 19), 'k'], [ell(660, 540, 14, 19), 'k'], 'M578 574Q600 596 622 574'] },
        { t: ['Add rosy cheeks.', 'Ajoute des joues roses.'], d: [ell(497, 580, 22, 13), ell(703, 580, 22, 13)] },
        { t: ['Sprinkle little seeds all over.', 'Ajoute des petits pépins partout.'], d: seeds }
      ],
      colors: [[620, 690, '#FF4D6D'], [600, 330, '#4CAF50'], [592, 255, '#7BC67E'], [497, 580, '#FFB3C6'], [703, 580, '#FFB3C6']]
    };
  })();

  // ================= WATERMELON =================
  (function () {
    const cx = 600, cy = 330;
    const seeds = [[25, 195], [50, 195], [75, 195], [105, 195], [130, 195], [155, 195], [40, 120], [140, 120]]
      .map(([a, r]) => { const p = onC(cx, cy, r, a); return [ell(p[0], p[1], 8, 13, a - 90), 'k']; });
    L.watermelon = {
      name: ['Watermelon', "Melon d'eau"], emoji: '🍉', level: 1, cat: 'yummy',
      steps: [
        { t: ['Draw a big half circle, like a smile.', 'Dessine un grand demi-cercle, comme un sourire.'], d: ['M280 330L920 330A320 320 0 0 1 280 330Z'] },
        { t: ['Draw two curved lines for the peel.', "Dessine deux lignes courbes pour l'écorce."], d: ['M885 330A285 285 0 0 1 315 330', 'M855 330A255 255 0 0 1 345 330'] },
        { t: ['Draw two eyes and a smile.', 'Dessine deux yeux et un sourire.'], d: [[ell(555, 398, 13, 18), 'k'], [ell(645, 398, 13, 18), 'k'], 'M580 428Q600 448 620 428'] },
        { t: ['Add rosy cheeks.', 'Ajoute des joues roses.'], d: [ell(515, 435, 20, 12), ell(685, 435, 20, 12)] },
        { t: ['Add little black seeds.', 'Ajoute des petits pépins noirs.'], d: seeds }
      ],
      colors: [[cx, cy + 303, '#2D9C4A'], [cx, cy + 270, '#C7F0B8'], [cx, 500, '#FF5C77'], [515, 435, '#FFB3C6'], [685, 435, '#FFB3C6']]
    };
  })();

  // ================= APPLE =================
  (function () {
    const A0 = [[600, 300], [530, 240], [360, 250], [350, 430]], A4 = [[850, 430], [840, 250], [670, 240], [600, 300]];
    const body = 'M600 300C530 240 360 250 350 430C340 610 460 770 560 755Q600 745 640 755C740 770 860 610 850 430C840 250 670 240 600 300Z';
    const s1 = bzAtX(...A0, 588), s2 = bzAtX(...A4, 612);
    const R = [[632, 196], [616, 222], [612, 255], s2];
    const stem = `M${P(s1)}C588 250 592 215 612 185L632 196C616 222 612 255 ${P(s2)}`;
    const la = bz(...R, 0.12), lb = bz(...R, 0.5);
    const leaf = `M${P(la)}C680 165 730 140 780 160C750 215 690 240 ${P(lb)}`;
    const vm = bz(...R, 0.3);
    L.apple = {
      name: ['Apple', 'Pomme'], emoji: '🍎', level: 1, cat: 'yummy',
      steps: [
        { t: ['Draw a big round apple with a little dip on top.', 'Dessine une grosse pomme ronde avec un petit creux en haut.'], d: [body] },
        { t: ['Add a stem in the dip.', 'Ajoute une queue dans le creux.'], d: [stem] },
        { t: ['Draw a leaf on the stem.', 'Dessine une feuille sur la queue.'], d: [leaf] },
        { t: ['Draw a line in the leaf.', 'Dessine une ligne dans la feuille.'], d: [`M${P(vm)}Q690 190 735 175`] },
        { t: ['Add a shiny spot. So shiny!', 'Ajoute un reflet. Que ça brille!'], d: ['M425 455Q428 385 480 350'] }
      ],
      colors: [[600, 550, '#E63946'], [600, 240, '#8B5A2B'], [700, 175, '#57CC99'], [720, 200, '#57CC99']]
    };
  })();

  // ================= COOKIE =================
  (function () {
    const cx = 600, cy = 460, R = 260;
    const p1 = onC(cx, cy, R, -75), p2 = onC(cx, cy, R * 0.8, -58), p3 = onC(cx, cy, R * 0.8, -32), p4 = onC(cx, cy, R, -15);
    const chips = [[470, 370, 20], [590, 315, -30], [500, 500, 40], [645, 455, 10], [760, 520, -20], [560, 625, 30], [695, 620, -40], [425, 600, 0], [610, 690, 15], [380, 470, 60], [700, 365, 0]]
      .map(([x, y, r]) => [ell(x, y, 19, 14, r), 'k']);
    L.cookie = {
      name: ['Cookie', 'Biscuit'], emoji: '🍪', level: 1, cat: 'yummy',
      steps: [
        { t: ['Draw a big round cookie, but leave a gap at the top.', 'Dessine un gros biscuit rond, mais laisse une ouverture en haut.'], d: [`M${P(p4)}A${R} ${R} 0 1 1 ${P(p1)}`] },
        { t: ['Close it with a big bite! Chomp!', 'Ferme-le avec une grosse bouchée! Crounch!'], d: [`M${P(p1)}A48 48 0 0 0 ${P(p2)}A48 48 0 0 0 ${P(p3)}A48 48 0 0 0 ${P(p4)}`] },
        { t: ['Add chocolate chips and color them in.', 'Ajoute des pépites de chocolat et colorie-les.'], d: chips },
        { t: ['Draw little crumbs near the bite.', 'Dessine des petites miettes près de la bouchée.'], d: [[circ(870, 250, 10), 'k'], [circ(905, 300, 7), 'k'], [circ(840, 200, 7), 'k'], [circ(925, 230, 9), 'k']] }
      ],
      colors: [[560, 420, '#E0A458']]
    };
  })();

  // ================= BIRTHDAY CAKE =================
  (function () {
    const candles = [510, 600, 690];
    L.birthdayCake = {
      name: ['Birthday cake', 'Gâteau de fête'], emoji: '🎂', level: 3, cat: 'yummy',
      steps: [
        { t: ['Draw a big box for the bottom of the cake.', 'Dessine une grosse boîte pour le bas du gâteau.'], d: ['M330 780L330 555Q330 525 360 525L840 525Q870 525 870 555L870 780Z'] },
        { t: ['Put it on a plate.', 'Mets-le sur une assiette.'], d: ['M330 780L262 780Q240 815 285 820L915 820Q960 815 938 780L870 780'] },
        { t: ['Add drippy frosting.', 'Ajoute du glaçage qui coule.'], d: [drips(330, 870, 590, 6, 28)] },
        { t: ['Draw a smaller box on top.', 'Dessine une plus petite boîte par-dessus.'], d: ['M420 525L420 365Q420 335 450 335L750 335Q780 335 780 365L780 525'] },
        { t: ['Add drippy frosting on top too.', 'Ajoute du glaçage qui coule en haut aussi.'], d: [drips(420, 780, 398, 4, 26)] },
        { t: ['Draw three candles.', 'Dessine trois chandelles.'], d: candles.map((x) => `M${x - 14} 335L${x - 14} 245L${x + 14} 245L${x + 14} 335`) },
        { t: ['Light them up with little flames!', 'Allume-les avec des petites flammes!'], d: candles.map((x) => `M${x} 230C${x - 18} 208 ${x - 10} 186 ${x} 164C${x + 10} 186 ${x + 18} 208 ${x} 230Z`) },
        { t: ['Decorate with hearts and dots!', 'Décore avec des cœurs et des pois!'], d: [heart(460, 690, 32), heart(600, 690, 32), heart(740, 690, 32), circ(510, 480, 18), circ(600, 480, 18), circ(690, 480, 18)] }
      ],
      colors: [[600, 750, '#FFB3D1'], [600, 560, '#FFF3C4'], [450, 490, '#BDE0FE'], [450, 360, '#FFF3C4'], [600, 800, '#CDB4DB'],
        [510, 290, '#FFD23F'], [600, 290, '#7BDFF2'], [690, 290, '#FFD23F'], [510, 210, '#FF8C42'], [600, 210, '#FF8C42'], [690, 210, '#FF8C42'],
        [460, 695, '#FF4D8D'], [600, 695, '#FF4D8D'], [740, 695, '#FF4D8D'], [510, 480, '#FF6FB5'], [600, 480, '#FFD23F'], [690, 480, '#7BD389']]
    };
  })();

  // ================= LOLLIPOP =================
  (function () {
    const cx = 600, cy = 330, R = 210;
    const arms = [], ends = [];
    for (let k = 0; k < 6; k++) {
      const a = k * 60 - 90, c = onC(cx, cy, 140, a - 60), e = onC(cx, cy, R, a);
      arms.push(`M${cx} ${cy}Q${P(c)} ${P(e)}`);
      ends.push([[cx, cy], c, e]);
    }
    const qp = (q, t) => { const u = 1 - t; return [u * u * q[0][0] + 2 * u * t * q[1][0] + t * t * q[2][0], u * u * q[0][1] + 2 * u * t * q[1][1] + t * t * q[2][1]]; };
    const cols = ['#FF6FB5', '#FFE066', '#7BDFF2', '#B9FBC0', '#C3A6FF', '#FFB86B'];
    const seedsC = ends.map((q, k) => { const a = qp(q, 0.7), b = qp(ends[(k + 1) % 6], 0.7); return [Math.round((a[0] + b[0]) / 2), Math.round((a[1] + b[1]) / 2), cols[k]]; });
    const yb = f(cy + Math.sqrt(R * R - 15 * 15));
    L.lollipop = {
      name: ['Lollipop', 'Suçon'], emoji: '🍭', level: 1, cat: 'yummy',
      steps: [
        { t: ['Draw a big circle.', 'Dessine un gros cercle.'], d: [circ(cx, cy, R)] },
        { t: ['Draw swirly lines from the middle to the edge.', 'Dessine des lignes en tourbillon du milieu jusqu’au bord.'], d: arms },
        { t: ['Add a long stick.', 'Ajoute un long bâton.'], d: [`M585 ${yb}L585 815Q600 832 615 815L615 ${yb}`] },
        { t: ['Tie a bow on the stick.', 'Attache une boucle sur le bâton.'], d: ['M585 612C515 565 495 668 585 642', 'M615 612C685 565 705 668 615 642'] },
        { t: ['Add two ribbons hanging down.', 'Ajoute deux rubans qui pendent.'], d: ['M585 652L548 712L570 718L585 690', 'M615 652L652 712L630 718L615 690'] }
      ],
      colors: seedsC.concat([[600, 760, '#FFF8E7'], [550, 625, '#9B5DE5'], [650, 625, '#9B5DE5'], [566, 702, '#9B5DE5'], [634, 702, '#9B5DE5']])
    };
  })();

  // ================= POPSICLE =================
  L.popsicle = {
    name: ['Popsicle', 'Popsicle'], emoji: '🍧', level: 1, cat: 'yummy',
    steps: [
      { t: ['Draw a tall shape with a round top.', 'Dessine une grande forme avec le dessus tout rond.'], d: ['M440 620L440 300A160 160 0 0 1 760 300L760 620Q760 650 730 650L470 650Q440 650 440 620Z'] },
      { t: ['Add a stick at the bottom.', 'Ajoute un bâton en bas.'], d: ['M570 650L570 790A30 30 0 0 0 630 790L630 650'] },
      { t: ['Draw a drippy line across the top.', 'Dessine une ligne qui coule en haut.'], d: [drips(440, 760, 395, 4, 26)] },
      { t: ['Give it a sweet face with rosy cheeks.', 'Donne-lui un beau visage avec des joues roses.'], d: [[ell(545, 520, 13, 18), 'k'], [ell(655, 520, 13, 18), 'k'], 'M580 550Q600 570 620 550', ell(503, 556, 20, 12), ell(697, 556, 20, 12)] },
      { t: ['Add sprinkles on top!', 'Ajoute des petits bonbons sur le dessus!'], d: [seg(520, 300, 26, 30), seg(600, 230, 26, 120), seg(680, 300, 26, 60), seg(560, 355, 26, 150), seg(645, 355, 26, 20), seg(490, 365, 24, 100), seg(715, 360, 24, 140), seg(600, 300, 24, 0)] }
    ],
    colors: [[600, 600, '#8EE3EF'], [600, 180, '#FF6FB5'], [503, 556, '#FFB3C6'], [697, 556, '#FFB3C6'], [600, 760, '#E0B07A']]
  };

  // ================= MILKSHAKE =================
  (function () {
    const C1 = [[560, 285], [585, 225], [680, 225], [690, 290]], C2 = [[690, 290], [760, 280], [805, 340], [775, 370]];
    const cream = 'M420 400C365 395 365 315 435 318C440 250 530 240 560 285C585 225 680 225 690 290C760 280 805 340 775 370C800 385 795 402 780 400';
    // cherry: an arc that sits in the cream
    const ca = bz(...C1, 0.18), cb = bz(...C1, 0.5), cr = 42;
    const mx = (ca[0] + cb[0]) / 2, my = (ca[1] + cb[1]) / 2, hc = Math.hypot(cb[0] - ca[0], cb[1] - ca[1]) / 2;
    const nx = (cb[1] - ca[1]) / (2 * hc), ny = -(cb[0] - ca[0]) / (2 * hc), hh = Math.sqrt(cr * cr - hc * hc);
    const cc = [mx + nx * hh, my + ny * hh];
    const top = [cc[0], cc[1] - cr];
    const cherry = `M${P(ca)}A${cr} ${cr} 0 1 1 ${P(cb)}`;
    // straw
    const sa = bz(...C2, 0.12), sb = bz(...C2, 0.4), dir = [0.34, -0.94];
    const proj = (sb[0] - sa[0]) * dir[0] + (sb[1] - sa[1]) * dir[1];
    const Ls = 215, ta = [sa[0] + dir[0] * Ls, sa[1] + dir[1] * Ls], tb = [sb[0] + dir[0] * (Ls - proj), sb[1] + dir[1] * (Ls - proj)];
    const straw = `M${P(sa)}L${P(ta)}L${P(tb)}L${P(sb)}`;
    const stripes = [55, 110, 165].map((s) => `M${P([sa[0] + dir[0] * s, sa[1] + dir[1] * s])}L${P([sb[0] + dir[0] * (s - proj), sb[1] + dir[1] * (s - proj)])}`);
    const xl = (y) => 420 + 58 * (y - 400) / 385, xr = (y) => 780 - 58 * (y - 400) / 385;
    const gl = [560, 615].map((y) => `M${f(xl(y))} ${y}L${f(xr(y))} ${y}`);
    const sseed = (s) => { const m = [(sa[0] + sb[0]) / 2, (sa[1] + sb[1]) / 2]; return [Math.round(m[0] + dir[0] * s), Math.round(m[1] + dir[1] * s)]; };
    L.milkshake = {
      name: ['Milkshake', 'Lait frappé'], emoji: '🥤', level: 2, cat: 'yummy',
      steps: [
        { t: ['Draw a tall glass, wide at the top.', 'Dessine un grand verre, large en haut.'], d: ['M420 400L478 785Q481 805 500 805L700 805Q719 805 722 785L780 400Z'] },
        { t: ['Add a puffy cloud of whipped cream.', 'Ajoute un gros nuage de crème fouettée.'], d: [cream] },
        { t: ['Put a cherry on top!', 'Mets une cerise sur le dessus!'], d: [cherry, `M${P(top)}Q${f(top[0] + 8)} ${f(top[1] - 45)} ${f(top[0] + 45)} ${f(top[1] - 62)}`] },
        { t: ['Draw a straw.', 'Dessine une paille.'], d: [straw] },
        { t: ['Add stripes on the straw.', 'Ajoute des rayures sur la paille.'], d: stripes },
        { t: ['Draw a band on the glass.', 'Dessine une bande sur le verre.'], d: gl },
        { t: ['Add sprinkles on the cream!', 'Ajoute des petits bonbons sur la crème!'], d: [seg(470, 345, 24, 30), seg(530, 300, 24, 120), seg(520, 370, 24, 60), seg(620, 330, 24, 150), seg(700, 340, 24, 20), seg(600, 375, 22, 100), seg(445, 375, 22, 140)] }
      ],
      colors: [[600, 480, '#FF9EC4'], [600, 700, '#FF9EC4'], [600, 588, '#FF6FB5'], [520, 330, '#FFF8E7'], [cc[0] | 0, cc[1] | 0, '#E63946'],
        sseed(25).concat('#4CC9F0'), sseed(82).concat('#FFFFFF'), sseed(137).concat('#4CC9F0'), sseed(190).concat('#FFFFFF')]
    };
  })();

  // ================= CARROT =================
  (function () {
    const tq = (t) => [470 + 260 * t, 320 - 80 * t * (1 - t)];
    const EL = [[600, 810], [540, 690], [455, 460], [470, 320]], ER = [[730, 320], [745, 460], [660, 690], [600, 810]];
    const body = 'M470 320Q600 280 730 320C745 460 660 690 600 810C540 690 455 460 470 320Z';
    const leaves = [
      `M${P(tq(0.17))}C470 250 420 190 420 118C480 150 540 220 ${P(tq(0.36))}`,
      `M${P(tq(0.42))}C560 230 570 140 600 72C630 140 640 230 ${P(tq(0.58))}`,
      `M${P(tq(0.64))}C660 220 720 150 780 118C780 190 730 250 ${P(tq(0.83))}`
    ];
    const lines = [[EL, 0.62, 1], [EL, 0.42, 1], [EL, 0.24, 1], [ER, 0.45, -1], [ER, 0.65, -1]].map(([E, t, s]) => {
      const p = bz(...E, t); return `M${P(p)}Q${f(p[0] + s * 25)} ${f(p[1] - 6)} ${f(p[0] + s * 48)} ${f(p[1] + 2)}`;
    });
    L.carrot = {
      name: ['Carrot', 'Carotte'], emoji: '🥕', level: 2, cat: 'yummy',
      steps: [
        { t: ['Draw a long carrot, pointy at the bottom.', 'Dessine une longue carotte, pointue en bas.'], d: [body] },
        { t: ['Add three leafy tops.', 'Ajoute trois feuilles sur le dessus.'], d: leaves },
        { t: ['Draw little lines on the sides.', 'Dessine des petites lignes sur les côtés.'], d: lines },
        { t: ['Draw two eyes and a smile.', 'Dessine deux yeux et un sourire.'], d: [[ell(555, 415, 13, 18), 'k'], [ell(645, 415, 13, 18), 'k'], 'M580 446Q600 466 620 446'] },
        { t: ['Add rosy cheeks.', 'Ajoute des joues roses.'], d: [ell(517, 452, 21, 13), ell(683, 452, 21, 13)] },
        { t: ['Ponies love carrots! Add a heart.', 'Les poneys adorent les carottes! Ajoute un cœur.'], d: [heart(860, 330, 40)] }
      ],
      colors: [[600, 560, '#FF8C42'], [470, 200, '#57CC99'], [600, 180, '#4CAF50'], [730, 200, '#57CC99'], [517, 452, '#FF5D8F'], [683, 452, '#FF5D8F'], [860, 340, '#FF4D8D']]
    };
  })();

  // ================= PANCAKES =================
  (function () {
    const p2L = [[340, 345], [300, 370], [300, 505], [380, 512]];
    const a = bz(...p2L, 0.6), b = [1200 - a[0], a[1]];
    const sl = onC(405, 345, 65, 212), sr = onC(795, 345, 65, -32);
    L.pancakes = {
      name: ['Pancakes', 'Crêpes'], emoji: '🥞', level: 3, cat: 'yummy',
      steps: [
        { t: ['Draw a long, round pancake.', 'Dessine une longue crêpe toute ronde.'], d: [rr(340, 280, 520, 130, 65)] },
        { t: ['Draw another pancake under it.', 'Dessine une autre crêpe en dessous.'], d: ['M340 345C300 370 300 505 380 512L820 512C900 505 900 370 860 345'] },
        { t: ['And one more at the bottom!', 'Et une de plus en bas!'], d: [`M${P(a)}C285 512 285 610 370 618L830 618C915 610 915 512 ${P(b)}`] },
        { t: ['Put the stack on a plate.', 'Mets la pile dans une assiette.'], d: ['M450 618C350 650 225 642 218 678C212 716 400 730 600 730C800 730 988 716 982 678C975 642 850 650 750 618'] },
        { t: ['Pour yummy syrup on top.', 'Verse du bon sirop sur le dessus.'], d: [drips(sl[0], sr[0], sl[1], 5, 34)] },
        { t: ['Add a square of butter.', 'Ajoute un carré de beurre.'], d: ['M535 280L550 228Q553 220 562 220L638 220Q647 220 650 228L665 280'] },
        { t: ['Make the butter shine!', 'Fais briller le beurre!'], d: ['M572 242L600 242'] }
      ],
      colors: [[600, 300, '#D4892A'], [600, 392, '#F7C873'], [600, 465, '#F2B65C'], [600, 570, '#F7C873'], [600, 690, '#A8DADC'], [620, 260, '#FFE45E']]
    };
  })();
})();
