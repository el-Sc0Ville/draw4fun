/* =========================================================
   Ellie's Drawing Ranch — artwork
   All drawings live in a 1200 x 900 space.
   A "shape" is [svgPathString, fill, minLevel, lineWidthMultiplier]
     fill: 'w' = white (covers what's behind), 'k' = black, 'n' = outline only
   ========================================================= */
(function () {
  'use strict';

  // ---------- path helpers ----------
  const f = (n) => Math.round(n * 10) / 10;
  function ell(cx, cy, rx, ry, deg) {
    deg = deg || 0;
    const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
    const x0 = f(cx + rx * c), y0 = f(cy + rx * s), x1 = f(cx - rx * c), y1 = f(cy - rx * s);
    return `M${x0} ${y0}A${rx} ${ry} ${deg} 1 1 ${x1} ${y1}A${rx} ${ry} ${deg} 1 1 ${x0} ${y0}Z`;
  }
  const circ = (cx, cy, r) => ell(cx, cy, r, r, 0);
  function rr(x, y, w, h, r) {
    return `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;
  }
  function starD(cx, cy, R, r, n, rot) {
    n = n || 5; rot = rot == null ? -90 : rot;
    let d = '';
    for (let i = 0; i < n * 2; i++) {
      const rad = i % 2 ? r : R, a = ((rot + (i * 180) / n) * Math.PI) / 180;
      d += (i ? 'L' : 'M') + f(cx + rad * Math.cos(a)) + ' ' + f(cy + rad * Math.sin(a));
    }
    return d + 'Z';
  }
  function heartD(cx, cy, s) {
    const p = (x, y) => `${f(cx + x * s)} ${f(cy + y * s)}`;
    return `M${p(0, -0.3)}C${p(-0.25, -0.75)} ${p(-1, -0.6)} ${p(-1, -0.1)}C${p(-1, 0.35)} ${p(-0.4, 0.65)} ${p(0, 1)}C${p(0.4, 0.65)} ${p(1, 0.35)} ${p(1, -0.1)}C${p(1, -0.6)} ${p(0.25, -0.75)} ${p(0, -0.3)}Z`;
  }
  function cloudD(cx, cy, s) {
    const p = (x, y) => `${f(cx + x * s)} ${f(cy + y * s)}`;
    return `M${p(-1.2, 0.35)}A${f(0.42 * s)} ${f(0.42 * s)} 0 0 1 ${p(-0.65, -0.2)}A${f(0.55 * s)} ${f(0.55 * s)} 0 0 1 ${p(0.35, -0.35)}A${f(0.48 * s)} ${f(0.48 * s)} 0 0 1 ${p(1.2, 0.35)}Z`;
  }
  function flower(cx, cy, r, lv) {
    const out = [];
    for (let i = 0; i < 5; i++) {
      const a = (i * 72 - 90) * Math.PI / 180;
      out.push([circ(f(cx + Math.cos(a) * r), f(cy + Math.sin(a) * r), r * 0.75), 'w', lv]);
    }
    out.push([circ(cx, cy, r * 0.6), 'w', lv]);
    return out;
  }
  function sun(cx, cy, r, lv) {
    const out = [];
    for (let i = 0; i < 8; i++) {
      const a = (i * 45) * Math.PI / 180;
      out.push([`M${f(cx + Math.cos(a) * (r + 18))} ${f(cy + Math.sin(a) * (r + 18))}L${f(cx + Math.cos(a) * (r + 48))} ${f(cy + Math.sin(a) * (r + 48))}`, 'n', lv]);
    }
    out.push([circ(cx, cy, r), 'w', lv]);
    return out;
  }
  const GROUND = ['M-20 792Q600 752 1220 792', 'n', 1];

  // ---------- the horse (used for horse, unicorn, pegasus) ----------
  function horse(v) {
    const S = [];
    // tail
    S.push(['M320 430C250 400 200 470 215 540C225 600 190 650 230 690C250 640 275 610 280 560C285 510 310 480 335 470Z']);
    S.push(['M262 470C240 520 248 580 230 640', 'n', 2]);
    // legs + hooves
    for (const x of [350, 430, 610, 690]) {
      S.push([rr(x, 500, 54, 260, 24)]);
      S.push([rr(x - 5, 730, 64, 38, 14)]);
    }
    // neck + mane
    S.push(['M600 410C630 310 710 220 800 185L865 290C820 320 775 390 750 465Z']);
    S.push(['M820 160C770 140 735 165 748 200C700 200 682 240 705 265C658 270 648 315 672 338C625 345 612 390 640 410L650 405C690 310 740 240 820 200Z']);
    S.push(['M760 215C735 240 715 270 700 300', 'n', 3]);
    // body
    S.push([ell(530, 470, 230, 125)]);
    if (v === 'pegasus') {
      S.push(['M470 380C400 280 420 160 520 110C515 160 560 170 555 205C605 195 630 245 600 270C640 280 640 330 600 345C570 370 520 385 470 380Z']);
      S.push(['M500 345C525 300 540 260 530 215', 'n', 2]);
      S.push(['M545 352C572 322 582 292 575 262', 'n', 2]);
    } else {
      S.push(['M468 346Q545 334 622 346L612 470Q545 482 478 470Z', 'w', 2]);
      S.push([heartD(545, 405, 30), 'w', 3]);
    }
    // spots (tricky level)
    S.push([ell(372, 430, 30, 20, -20), 'w', 3]);
    S.push([ell(400, 500, 20, 14, 10), 'w', 3]);
    S.push([ell(680, 520, 22, 15, -10), 'w', 3]);
    // ears + head
    S.push(['M808 178Q800 112 826 92Q848 126 850 165Z']);
    S.push(['M842 165Q852 104 878 88Q890 128 884 168Z']);
    S.push(['M790 200C800 150 870 130 910 170C950 210 990 260 990 300C990 345 940 355 900 340C870 330 850 320 820 300C790 280 780 240 790 200Z']);
    if (v === 'unicorn') {
      S.push(['M860 152L912 52L893 168Z']);
      S.push(['M870 132L899 128', 'n', 2]);
      S.push(['M879 110L903 106', 'n', 2]);
      S.push(['M889 89L907 86', 'n', 2]);
    }
    S.push(['M826 150C830 188 868 200 884 166C868 178 850 172 842 150Z', 'w', 3]);
    // face
    S.push([circ(872, 212, 15), 'k']);
    S.push([circ(877, 206, 5), 'w', 1, 0.3]);
    S.push([ell(960, 300, 8, 6, 20), 'n']);
    S.push(['M918 334Q945 347 970 328', 'n']);
    S.push([circ(905, 272, 16), 'n', 2, 0.6]);
    return S;
  }

  function fence(x0, x1, lv) {
    const S = [];
    S.push([`M${x0 - 10} 600L${x1 + 10} 600`, 'n', lv]);
    S.push([`M${x0 - 10} 680L${x1 + 10} 680`, 'n', lv]);
    for (let x = x0; x <= x1; x += 70) S.push([`M${x} 790L${x} 560L${x + 15} 540L${x + 30} 560L${x + 30} 790Z`, 'w', lv]);
    return S;
  }

  const PAGES = {
    horse: {
      themes: ['ranch'], emoji: '🐴',
      shapes() {
        return [].concat(
          sun(1060, 120, 55, 2),
          [[cloudD(240, 140, 110), 'w', 3], [cloudD(560, 90, 80), 'w', 3]],
          fence(40, 180, 2), fence(1020, 1160, 2),
          [GROUND],
          horse('horse'),
          flower(110, 830, 26, 3), flower(1090, 835, 26, 3), flower(990, 850, 20, 3)
        );
      }
    },
    unicorn: {
      themes: ['unicorn'], emoji: '🦄',
      shapes() {
        const S = [];
        for (const r of [560, 500, 440, 380]) S.push([`M${600 - r} 820A${r} ${r} 0 0 1 ${600 + r} 820`, 'n', 1]);
        S.push([cloudD(110, 790, 90), 'w', 2], [cloudD(1090, 790, 90), 'w', 2]);
        S.push([starD(150, 140, 50, 22), 'w', 2], [starD(1080, 150, 44, 19), 'w', 2]);
        S.push([heartD(1000, 330, 34), 'w', 3], [heartD(170, 360, 30), 'w', 3], [starD(560, 70, 30, 13), 'w', 3]);
        S.push(GROUND);
        return S.concat(horse('unicorn'));
      }
    },
    pegasus: {
      themes: ['night'], emoji: '🌙',
      shapes() {
        const S = [];
        S.push(['M210 70A100 100 0 1 0 300 230A78 78 0 1 1 210 70Z', 'w', 1]);
        for (const [x, y, R] of [[1060, 110, 46], [640, 70, 30], [1100, 380, 34]]) S.push([starD(x, y, R, R * 0.45), 'w', 2]);
        for (const [x, y] of [[420, 90], [960, 260], [140, 400], [1130, 560]]) S.push([starD(x, y, 22, 10), 'w', 3]);
        S.push(['M-20 845L20 840A80 80 0 0 1 170 790A95 95 0 0 1 350 780A90 90 0 0 1 520 790A100 100 0 0 1 710 785A90 90 0 0 1 880 790A95 95 0 0 1 1060 785A80 80 0 0 1 1180 830L1220 835', 'n', 1]);
        return S.concat(horse('pegasus'));
      }
    },
    seahorse: {
      themes: ['sea'], emoji: '🐠',
      shapes() {
        const S = [];
        S.push(['M-40 805Q120 770 280 805T600 805T920 805T1240 805', 'n', 1]);
        S.push(['M200 820C160 720 240 650 200 560C180 500 230 460 220 420C260 470 230 520 250 580C280 660 210 720 250 820Z', 'w', 2]);
        S.push(['M990 820C950 730 1030 660 990 580C975 530 1015 500 1010 470C1050 510 1020 550 1040 600C1070 680 1000 730 1040 820Z', 'w', 2]);
        S.push([starD(920, 790, 62, 28, 5, -100), 'w', 3]);
        S.push(['M330 820C330 760 420 740 450 790C460 810 440 830 420 830Z', 'w', 3]);
        S.push(['M900 470C940 420 1030 430 1050 470C1030 510 940 520 900 470ZM1050 470L1100 430L1100 510Z', 'w', 3]);
        S.push([circ(935, 465, 6), 'k', 3]);
        S.push([circ(870, 180, 24), 'w', 1], [circ(905, 118, 16), 'w', 1], [circ(885, 68, 11), 'w', 1]);
        S.push([circ(300, 250, 18), 'w', 2], [circ(330, 200, 11), 'w', 2]);
        // tail beads: tip first so bigger beads overlap
        const beads = [[690, 676, 15], [710, 682, 18], [722, 708, 21], [710, 738, 24], [676, 752, 28], [636, 742, 32], [602, 708, 37], [586, 658, 42], [592, 602, 48]];
        for (const [x, y, r] of beads) S.push([circ(x, y, r), 'w', 1]);
        S.push(['M520 420C450 380 430 470 470 520C450 540 480 580 530 560Z', 'w', 1]);
        S.push(['M480 450L525 470M470 500L528 515', 'n', 2]);
        S.push(['M590 300C510 360 500 470 540 560C570 620 650 620 670 560C690 500 660 450 680 390C700 340 680 300 650 290Z', 'w', 1]);
        for (const y of [370, 420, 470, 520]) S.push([`M${600} ${y}Q${640} ${y + 12} ${672} ${y - 4}`, 'n', 2]);
        S.push([rr(690, 222, 132, 46, 23), 'w', 1]);
        S.push(['M590 172L600 120L630 160Z', 'w', 1], ['M625 158L650 108L668 160Z', 'w', 1], ['M660 168L702 130L696 182Z', 'w', 1]);
        S.push([circ(640, 238, 82), 'w', 1]);
        S.push([circ(664, 226, 16), 'k', 1], [circ(669, 220, 5), 'w', 1, 0.3]);
        S.push([circ(690, 272, 14), 'n', 2, 0.6]);
        S.push(['M600 280Q620 300 650 296', 'n', 3]);
        return S;
      }
    },
    barn: {
      themes: ['ranch'], emoji: '🏡',
      shapes() {
        const S = [];
        S.push(...sun(1070, 120, 50, 2));
        S.push([cloudD(250, 130, 100), 'w', 3], [cloudD(800, 100, 70), 'w', 3]);
        S.push(GROUND);
        // apple tree
        S.push([rr(140, 520, 50, 270, 14), 'w', 2]);
        S.push(['M80 540A80 80 0 0 1 120 400A85 85 0 0 1 250 390A80 80 0 0 1 260 540Z', 'w', 2]);
        for (const [x, y] of [[130, 470], [200, 440], [225, 505], [165, 515]]) S.push([circ(x, y, 13), 'w', 3]);
        S.push(...fence(900, 1160, 2));
        S.push(['M380 790L380 450L600 300L820 450L820 790Z', 'w', 1]);
        S.push(['M340 470L600 270L860 470L828 488L600 318L372 488Z', 'w', 1]);
        S.push([rr(510, 600, 180, 190, 8), 'w', 1]);
        S.push(['M510 600L690 790M690 600L510 790', 'n', 1]);
        S.push([circ(600, 455, 50), 'w', 1]);
        S.push(['M600 405L600 505M550 455L650 455', 'n', 2]);
        S.push([rr(410, 560, 70, 70, 6), 'w', 2], [rr(720, 560, 70, 70, 6), 'w', 2]);
        S.push([rr(260, 700, 120, 90, 20), 'w', 3], ['M290 705L290 785M320 705L320 785M350 705L350 785', 'n', 3]);
        S.push(...flower(470, 835, 22, 3), ...flower(760, 840, 22, 3));
        return S;
      }
    },
    cupcake: {
      themes: ['unicorn'], emoji: '🧁',
      shapes() {
        const S = [];
        S.push([heartD(170, 220, 70), 'w', 2], [heartD(1030, 260, 60), 'w', 2]);
        S.push([starD(1040, 650, 50, 22), 'w', 3], [starD(150, 640, 44, 19), 'w', 3], [starD(230, 470, 24, 11), 'w', 3], [starD(980, 470, 24, 11), 'w', 3]);
        S.push(['M400 560L800 560L740 800L460 800Z', 'w', 1]);
        S.push(['M490 565L515 795M600 565L600 798M710 565L685 795', 'n', 1]);
        S.push(['M370 580C330 520 380 470 440 480C460 430 740 430 760 480C820 470 870 520 830 580Z', 'w', 1]);
        S.push([ell(600, 432, 190, 70), 'w', 1]);
        S.push([ell(600, 352, 120, 60), 'w', 1]);
        S.push(['M540 330C560 260 620 240 650 280C670 310 640 330 600 330Z', 'w', 1]);
        S.push([circ(600, 228, 38), 'w', 1]);
        S.push(['M600 192Q610 150 645 138', 'n', 1]);
        S.push([circ(588, 218, 8), 'w', 1, 0.3]);
        S.push([circ(545, 660, 13), 'k', 1], [circ(655, 660, 13), 'k', 1], ['M572 692Q600 718 628 692', 'n', 1]);
        S.push([circ(520, 700, 14), 'n', 2, 0.6], [circ(680, 700, 14), 'n', 2, 0.6]);
        for (const [x1, y1, x2, y2] of [[470, 520, 495, 505], [560, 535, 585, 540], [690, 515, 710, 530], [520, 420, 545, 410], [650, 440, 672, 425], [580, 365, 600, 380], [660, 350, 680, 340], [530, 350, 548, 335], [760, 540, 780, 525], [420, 545, 440, 535]]) {
          S.push([`M${x1} ${y1}L${x2} ${y2}`, 'n', 2]);
        }
        return S;
      }
    }
  };

  // ---------- connect-the-dots shapes ----------
  // key points: [x, y, corner?]. corner = sharp point.
  const starKeys = (() => {
    const k = [];
    for (let i = 0; i < 10; i++) {
      const rad = i % 2 ? 150 : 340, a = ((-90 + i * 36) * Math.PI) / 180;
      k.push([Math.round(600 + rad * Math.cos(a)), Math.round(480 + rad * Math.sin(a)), 1]);
    }
    return k;
  })();
  const face = (cx, cy, s) => [
    [circ(cx - 45 * s, cy, 14 * s), 'k'], [circ(cx + 45 * s, cy, 14 * s), 'k'],
    [`M${cx - 35 * s} ${cy + 45 * s}Q${cx} ${cy + 85 * s} ${cx + 35 * s} ${cy + 45 * s}`, 'n']
  ];
  const DOTS = {
    horseHead: {
      themes: ['ranch', 'night'], smooth: true,
      keys: [[430, 790, 1], [450, 520], [505, 320], [545, 215], [590, 80, 1], [670, 200], [775, 330], [850, 450], [845, 530], [770, 565], [665, 520, 1], [700, 790, 1]],
      extras: [[circ(655, 300, 18), 'k'], [ell(805, 478, 10, 7, 30), 'n'], ['M762 528Q792 540 818 520', 'n'],
        ['M560 250C525 270 515 310 540 330C500 350 495 390 522 410C485 430 485 470 510 490', 'n']]
    },
    heart: {
      themes: ['unicorn', 'ranch', 'sea'], smooth: true,
      keys: [[600, 330, 1], [680, 235], [800, 220], [880, 300], [860, 430], [600, 730, 1], [340, 430], [320, 300], [400, 220], [520, 235]],
      extras: face(600, 430, 1)
    },
    star: { themes: ['unicorn', 'night', 'sea'], smooth: false, keys: starKeys, extras: face(600, 480, 0.8) },
    barn: {
      themes: ['ranch'], smooth: false,
      keys: [[330, 780, 1], [330, 430, 1], [600, 230, 1], [870, 430, 1], [870, 780, 1]],
      extras: [[rr(520, 600, 160, 180, 6), 'n'], ['M520 600L680 780M680 600L520 780', 'n'], [circ(600, 440, 45), 'n']]
    },
    fish: {
      themes: ['sea'], smooth: true,
      keys: [[280, 460, 1], [400, 330], [580, 300], [740, 360], [815, 405, 1], [945, 315, 1], [935, 610, 1], [815, 515, 1], [740, 560], [580, 620], [400, 590]],
      extras: [[circ(390, 430, 20), 'k'], ['M300 500Q330 522 362 505', 'n'], ['M480 380Q525 460 480 540', 'n']]
    },
    moon: {
      themes: ['night'], smooth: true,
      keys: [[620, 170, 1], [430, 250], [360, 450], [430, 650], [620, 730, 1], [590, 610], [560, 450], [590, 290]],
      extras: [['M420 410Q442 432 464 410', 'n'], ['M430 505Q455 528 485 508', 'n']]
    },
    cupcake: {
      themes: ['unicorn'], smooth: true,
      keys: [[460, 780, 1], [740, 780, 1], [790, 540, 1], [830, 470], [760, 380], [680, 300], [600, 230, 1], [520, 300], [440, 380], [370, 470], [410, 540, 1]],
      extras: [['M410 540L790 540', 'n'], ['M520 560L540 770M600 560L600 775M680 560L660 770', 'n'], [circ(600, 195, 32), 'w']]
    },
    crown: {
      themes: ['unicorn', 'night'], smooth: false,
      keys: [[330, 700, 1], [330, 330, 1], [450, 500, 1], [600, 260, 1], [750, 500, 1], [870, 330, 1], [870, 700, 1]],
      extras: [['M330 570L870 570', 'n'], [circ(450, 635, 25), 'w'], [circ(600, 630, 30), 'w'], [circ(750, 635, 25), 'w']]
    }
  };

  // Hermite curve through key points; corners have zero tangent.
  function dotPoints(shape, level) {
    const K = shape.keys, n = K.length;
    const target = [10, 20, 30][level - 1] || 10;
    const sub = Math.max(1, Math.round(target / n));
    const tan = K.map((p, i) => {
      if (!shape.smooth || p[2]) return [0, 0];
      const a = K[(i - 1 + n) % n], b = K[(i + 1) % n];
      return [(b[0] - a[0]) * 0.5, (b[1] - a[1]) * 0.5];
    });
    const pts = [];
    const herm = (p0, p1, m0, m1, t) => {
      const t2 = t * t, t3 = t2 * t, h00 = 2 * t3 - 3 * t2 + 1, h10 = t3 - 2 * t2 + t, h01 = -2 * t3 + 3 * t2, h11 = t3 - t2;
      return [h00 * p0[0] + h10 * m0[0] + h01 * p1[0] + h11 * m1[0], h00 * p0[1] + h10 * m0[1] + h01 * p1[1] + h11 * m1[1]];
    };
    for (let i = 0; i < n; i++) {
      const p0 = K[i], p1 = K[(i + 1) % n], m0 = tan[i], m1 = tan[(i + 1) % n];
      // sample densely, then pick points evenly spaced by length
      const dense = [], acc = [0];
      for (let j = 0; j <= 48; j++) dense.push(herm(p0, p1, m0, m1, j / 48));
      for (let j = 1; j < dense.length; j++) acc.push(acc[j - 1] + Math.hypot(dense[j][0] - dense[j - 1][0], dense[j][1] - dense[j - 1][1]));
      const total = acc[acc.length - 1];
      for (let s = 0; s < sub; s++) {
        const target = (total * s) / sub; let j = 0;
        while (j < acc.length - 1 && acc[j + 1] < target) j++;
        const seg = acc[j + 1] - acc[j] || 1, k = (target - acc[j]) / seg, a = dense[j], b = dense[Math.min(j + 1, dense.length - 1)];
        pts.push([Math.round(a[0] + (b[0] - a[0]) * k), Math.round(a[1] + (b[1] - a[1]) * k)]);
      }
    }
    return pts;
  }

  // ---------- step-by-step lessons (guide paths) ----------
  const HORSE_STEPS = [
    { k: 'body', d: [ell(520, 480, 220, 110)] },
    { k: 'head', d: [ell(850, 285, 95, 62, 28)] },
    { k: 'neck', d: ['M660 410L780 315', 'M735 470L855 345'] },
    { k: 'legs', d: ['M360 560L360 765L405 765L405 575', 'M455 580L455 765L500 765L500 585', 'M600 580L600 765L645 765L645 580', 'M690 570L690 765L735 765L735 555'] },
    { k: 'ears', d: ['M790 235L798 160L835 222', 'M832 218L858 148L880 232'] },
    { k: 'mane', d: ['M792 236L760 252L772 280L738 300L748 330L708 350L718 380L672 402'] },
    { k: 'tail', d: ['M303 450C230 470 250 560 200 625C270 605 300 545 312 500'] },
    { k: 'face', d: [circ(862, 268, 11), 'M902 318Q925 336 948 318', circ(925, 300, 5)] },
    { k: 'color', d: [] }
  ];
  const LESSONS = {
    horse: { emoji: '🐴', themes: ['ranch'], steps: HORSE_STEPS },
    unicorn: {
      emoji: '🦄', themes: ['unicorn'],
      steps: (() => {
        const s = HORSE_STEPS.map(x => Object.assign({}, x));
        s.splice(5, 0, { k: 'horn', d: ['M826 205L872 92L866 220'] });
        s[6] = Object.assign({}, s[6], { k: 'rainbowMane' });
        return s;
      })()
    },
    pegasus: {
      emoji: '🌙', themes: ['night'],
      steps: (() => {
        const s = HORSE_STEPS.map(x => Object.assign({}, x));
        s.splice(4, 0, { k: 'wing', d: ['M470 385C400 290 420 170 520 120C515 170 560 180 555 215C605 205 630 255 600 280C640 290 640 335 600 350C570 375 520 390 470 385'] });
        return s;
      })()
    },
    cupcake: {
      emoji: '🧁', themes: ['unicorn', 'ranch'],
      steps: [
        { k: 'cup', d: ['M420 540L780 540L725 780L475 780Z'] },
        { k: 'cupLines', d: ['M510 545L530 775', 'M600 545L600 778', 'M690 545L670 775'] },
        { k: 'frosting', d: ['M400 540C360 470 420 420 470 440C490 360 710 360 730 440C780 420 840 470 800 540'] },
        { k: 'cherry', d: [circ(600, 345, 36), 'M600 310Q612 270 645 262'] },
        { k: 'sprinkles', d: ['M480 480L500 468', 'M560 450L582 456', 'M650 470L668 456', 'M720 500L742 492', 'M530 510L548 522', 'M610 505L632 498'] },
        { k: 'cupFace', d: [circ(550, 630, 11), circ(650, 630, 11), 'M570 668Q600 692 630 668'] },
        { k: 'color', d: [] }
      ]
    },
    fishy: {
      emoji: '🐟', themes: ['sea'],
      steps: [
        { k: 'fishBody', d: [ell(560, 450, 260, 160)] },
        { k: 'fishTail', d: ['M810 420L960 300L960 600L810 480'] },
        { k: 'fishFin', d: ['M500 300Q560 200 640 300'] },
        { k: 'fishEye', d: [circ(420, 420, 22)] },
        { k: 'fishSmile', d: ['M330 490Q370 520 410 495'] },
        { k: 'bubbles', d: [circ(250, 330, 20), circ(220, 260, 14), circ(240, 200, 9)] },
        { k: 'color', d: [] }
      ]
    }
  };

  // ---------- Ellie (cartoon avatar) ----------
  const ELLIE_DEFS = `
  <defs>
    <linearGradient id="eHair" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6D98F"/><stop offset="1" stop-color="#DFAF5F"/></linearGradient>
    <radialGradient id="eSkin" cx=".45" cy=".38" r=".75"><stop offset="0" stop-color="#FFE6D6"/><stop offset="1" stop-color="#F4C3A8"/></radialGradient>
    <linearGradient id="eDress" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFC7D6"/><stop offset="1" stop-color="#F8A9C2"/></linearGradient>
    <pattern id="eFlowers" width="30" height="30" patternUnits="userSpaceOnUse">
      <circle cx="7" cy="7" r="4" fill="#FFE1B3"/><circle cx="22" cy="18" r="3.5" fill="#BFD7FF"/><circle cx="12" cy="25" r="2.5" fill="#FFFFFF"/><circle cx="26" cy="4" r="2" fill="#FF8FB1"/>
    </pattern>
  </defs>`;
  const ELLIE_BODY = `
    <path d="M82 160C70 70 250 60 238 160L246 262C236 284 210 280 204 258L116 258C110 280 84 284 74 262Z" fill="url(#eHair)"/>
    <rect x="143" y="222" width="34" height="50" rx="14" fill="#EDB89C"/>
    <path d="M112 288C92 322 88 360 98 392" stroke="#F4C3A8" stroke-width="24" stroke-linecap="round" fill="none"/>
    <circle cx="99" cy="398" r="14" fill="#F4C3A8"/>
    <g fill="#FF8FB1"><circle cx="91" cy="378" r="4"/><circle cx="99" cy="380" r="4" fill="#FFFFFF"/><circle cx="107" cy="378" r="4"/></g>
    <path d="M118 272C135 262 185 262 202 272L248 420C200 438 120 438 72 420Z" fill="url(#eDress)"/>
    <path d="M118 272C135 262 185 262 202 272L248 420C200 438 120 438 72 420Z" fill="url(#eFlowers)" opacity=".9"/>
    <path d="M72 420C120 438 200 438 248 420" stroke="#F48FB1" stroke-width="4" fill="none" stroke-dasharray="2 7" stroke-linecap="round"/>
    <path d="M128 274L134 240M192 274L186 240" stroke="#F8A9C2" stroke-width="8" stroke-linecap="round"/>
    <path d="M104 312Q160 324 216 312L219 324Q160 336 101 324Z" fill="#EDBE52"/>
    <g fill="#FFF6CF"><circle cx="122" cy="320" r="2"/><circle cx="148" cy="324" r="2"/><circle cx="174" cy="324" r="2"/><circle cx="200" cy="320" r="2"/></g>
    <g class="wave">
      <path d="M206 288C236 272 256 242 262 208" stroke="#F4C3A8" stroke-width="24" stroke-linecap="round" fill="none"/>
      <g transform="rotate(22 268 160)">
        <rect x="256" y="112" width="24" height="82" rx="5" fill="#FF5DA2"/>
        <path d="M256 113L268 82L280 113Z" fill="#FFB3D1"/><path d="M263 96L268 82L273 96Z" fill="#E0307F"/>
        <rect x="256" y="130" width="24" height="9" fill="#E0307F" opacity=".55"/><rect x="256" y="168" width="24" height="9" fill="#E0307F" opacity=".55"/>
      </g>
      <circle cx="263" cy="200" r="15" fill="#F4C3A8"/>
      <g fill="#FFFFFF" stroke="#FF8FB1" stroke-width="1.5"><circle cx="252" cy="222" r="4"/><circle cx="259" cy="226" r="4"/><circle cx="266" cy="227" r="4"/></g>
    </g>
    <ellipse cx="82" cy="170" rx="12" ry="16" fill="#F4C3A8"/><ellipse cx="238" cy="170" rx="12" ry="16" fill="#F4C3A8"/>
    <ellipse cx="160" cy="160" rx="78" ry="80" fill="url(#eSkin)"/>
    <ellipse cx="112" cy="192" rx="16" ry="11" fill="#FF8FA8" opacity=".5"/><ellipse cx="208" cy="192" rx="16" ry="11" fill="#FF8FA8" opacity=".5"/>
    <g class="eyes">
      <ellipse cx="128" cy="164" rx="17" ry="20" fill="#fff"/><circle cx="130" cy="167" r="13" fill="#4F8FD8"/><circle cx="130" cy="168" r="7" fill="#1D2B4A"/><circle cx="135" cy="161" r="4.5" fill="#fff"/><circle cx="125" cy="172" r="2" fill="#fff"/>
      <ellipse cx="192" cy="164" rx="17" ry="20" fill="#fff"/><circle cx="190" cy="167" r="13" fill="#4F8FD8"/><circle cx="190" cy="168" r="7" fill="#1D2B4A"/><circle cx="195" cy="161" r="4.5" fill="#fff"/><circle cx="185" cy="172" r="2" fill="#fff"/>
      <path d="M109 154Q128 138 147 152M173 152Q192 138 211 154" stroke="#6B4A33" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M110 153L104 148M211 153L217 148" stroke="#6B4A33" stroke-width="3" stroke-linecap="round"/>
    </g>
    <path d="M110 133Q126 125 142 131M178 131Q194 125 210 133" stroke="#C9954F" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M156 184Q161 190 167 184" stroke="#DE9C86" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M126 202Q160 244 194 202Q160 213 126 202Z" fill="#9E3550"/>
    <path d="M132 205Q160 214 188 205L184 214Q160 222 136 214Z" fill="#fff"/>
    <ellipse cx="160" cy="228" rx="12" ry="5" fill="#FF7F96"/>
    <path d="M84 152C82 92 130 70 176 76C218 80 244 112 240 160C228 130 208 112 186 106C176 124 150 136 120 140C136 128 146 114 150 102C128 112 104 132 84 152Z" fill="url(#eHair)"/>
    <path d="M84 150C76 200 80 240 96 270C100 240 98 200 106 160Z" fill="url(#eHair)"/>
    <path d="M240 158C246 205 242 246 226 272C222 240 224 200 216 156Z" fill="url(#eHair)"/>
    <path d="M118 92Q150 79 182 86" stroke="#FFF3C9" stroke-width="6" fill="none" stroke-linecap="round" opacity=".85"/>
    <g transform="translate(218 104) rotate(20)"><path d="M0 0L-18 -12L-18 12Z M0 0L18 -12L18 12Z" fill="#FF6FA8"/><circle r="6" fill="#FF3D8B"/></g>`;
  const ellieSVG = (cls, viewBox) =>
    `<svg class="${cls || ''}" viewBox="${viewBox || '0 0 320 440'}" aria-hidden="true"><g class="bob">${ELLIE_BODY}</g></svg>`;

  // ---------- the pony friend ----------
  const PONY_DEFS = `<defs>
      <linearGradient id="pRainbow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF6B6B"/><stop offset=".25" stop-color="#FFD23F"/><stop offset=".5" stop-color="#8AC926"/><stop offset=".75" stop-color="#4CC9F0"/><stop offset="1" stop-color="#9B5DE5"/></linearGradient>
      <linearGradient id="pGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF1A8"/><stop offset="1" stop-color="#F2B833"/></linearGradient>
    </defs>`;
  const PONY = `
  <svg class="pony" viewBox="0 0 260 330" aria-hidden="true">
    <g class="pony-bob">
      <g class="acc acc-night"><path d="M205 210C250 160 262 110 240 70C230 110 205 120 200 140C190 120 170 120 165 140" fill="#FFFFFF" stroke="#C9C1F0" stroke-width="4"/><path d="M210 190C232 160 240 130 236 100" stroke="#C9C1F0" stroke-width="3" fill="none"/></g>
      <path class="coat" d="M90 330C80 250 100 175 140 135L222 152C200 205 200 262 212 330Z"/>
      <path class="mane" d="M150 98C212 86 246 128 228 160C252 182 246 222 222 232C246 252 240 292 214 304L204 160Z"/>
      <path class="coat" d="M120 72Q116 26 140 10Q160 40 158 76Z"/><path d="M128 62Q128 36 140 24Q150 44 150 68Z" fill="#FFB8C8"/>
      <path class="coat" d="M156 74Q166 30 190 20Q198 56 186 88Z"/>
      <path class="coat" d="M100 80C130 40 200 50 206 110C210 150 190 180 160 190C130 200 70 212 45 186C20 160 40 130 70 120C80 104 86 92 100 80Z"/>
      <ellipse class="snout" cx="68" cy="170" rx="44" ry="31"/>
      <ellipse cx="54" cy="166" rx="5" ry="7" fill="#5A3A2A"/><ellipse cx="82" cy="170" rx="5" ry="7" fill="#5A3A2A"/>
      <path d="M58 190Q80 202 100 186" stroke="#5A3A2A" stroke-width="4" fill="none" stroke-linecap="round"/>
      <ellipse cx="165" cy="155" rx="15" ry="10" fill="#FF8FA8" opacity=".55"/>
      <g class="p-eye"><ellipse cx="140" cy="122" rx="19" ry="23" fill="#fff"/><circle cx="137" cy="126" r="15" fill="#3B2A20"/><circle cx="142" cy="119" r="5" fill="#fff"/><circle cx="132" cy="132" r="2.5" fill="#fff"/></g>
      <path d="M121 104L112 96M128 100L123 90M136 99L134 88" stroke="#3B2A20" stroke-width="3.5" stroke-linecap="round"/>
      <path class="mane" d="M128 58C152 66 168 92 152 114C146 94 132 84 116 82C116 72 120 64 128 58Z"/>
      <g class="acc acc-unicorn"><path d="M126 62L116 0L150 56Z" fill="url(#pGold)" stroke="#E0A526" stroke-width="2"/><path d="M122 40L139 37M119 22L132 20" stroke="#E0A526" stroke-width="2.5"/></g>
      <g class="acc acc-ranch"><circle cx="112" cy="78" r="9" fill="#FF6FB5"/><circle cx="112" cy="78" r="3.5" fill="#FFD23F"/><circle cx="160" cy="66" r="10" fill="#FFD23F"/><circle cx="160" cy="66" r="4" fill="#FF8C42"/><circle cx="190" cy="84" r="9" fill="#9B5DE5"/><circle cx="190" cy="84" r="3.5" fill="#FFFFFF"/></g>
      <g class="acc acc-sea" fill="none" stroke="#FFFFFF" stroke-width="3"><circle cx="22" cy="120" r="10"/><circle cx="12" cy="88" r="7"/><circle cx="26" cy="60" r="5"/><path d="M205 175L212 160L219 175L234 177L222 187L226 202L212 194L198 202L202 187L190 177Z" fill="#FF8C42" stroke="#E86A1F"/></g>
    </g>
  </svg>`;

  window.ART = { DEFS: ELLIE_DEFS + PONY_DEFS, PAGES, DOTS, LESSONS, dotPoints, ellieSVG, PONY, helpers: { ell, circ, rr, starD, heartD } };
})();
