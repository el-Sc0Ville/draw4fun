/* draw4fun pack: animals */
(function () {
  'use strict';
  const H = window.ART.helpers, ell = H.ell, circ = H.circ, rr = H.rr, star = H.starD, heart = H.heartD;
  const L = window.PAPER.lessons;

  // ---------- little geometry helpers (so new lines start and end exactly ON old lines) ----------
  const f = (n) => Math.round(n * 10) / 10;
  const RAD = Math.PI / 180;
  const E = (cx, cy, rx, ry, rot) => ({ cx, cy, rx, ry, rot: rot || 0 });
  function ep(e, deg) { // point on ellipse at parameter angle deg
    const t = deg * RAD, c = Math.cos(e.rot * RAD), s = Math.sin(e.rot * RAD);
    const x = e.rx * Math.cos(t), y = e.ry * Math.sin(t);
    return [e.cx + x * c - y * s, e.cy + x * s + y * c];
  }
  const S = (p) => f(p[0]) + ' ' + f(p[1]);
  function inE(e, x, y) {
    const c = Math.cos(-e.rot * RAD), s = Math.sin(-e.rot * RAD), dx = x - e.cx, dy = y - e.cy;
    const u = dx * c - dy * s, v = dx * s + dy * c;
    return (u * u) / (e.rx * e.rx) + (v * v) / (e.ry * e.ry) < 1;
  }
  const inside = (hosts, x, y) => hosts.some((h) => (typeof h === 'function' ? h(x, y) : inE(h, x, y)));
  const full = (e) => ell(e.cx, e.cy, e.rx, e.ry, e.rot);
  function arc(e, a0, a1) { // along the ellipse from angle a0 to a1 (a1 > a0)
    return `M${S(ep(e, a0))}A${e.rx} ${e.ry} ${e.rot} ${a1 - a0 > 180 ? 1 : 0} 1 ${S(ep(e, a1))}`;
  }
  function bumpRange(e, hosts) {
    const ins = (a) => { const p = ep(e, a); return inside(hosts, p[0], p[1]); };
    let s = null;
    for (let a = 0; a < 360; a += 0.5) if (ins(a - 0.5) && !ins(a)) { s = a; break; }
    if (s === null) return null;
    let en = s; while (!ins(en + 0.5) && en < s + 360) en += 0.5;
    let lo = s - 0.5, hi = s;
    for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (ins(m)) lo = m; else hi = m; }
    s = hi; lo = en; hi = en + 0.5;
    for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (ins(m)) hi = m; else lo = m; }
    return [s, lo];
  }
  function bump(e, hosts) { // only the part of ellipse e that sits OUTSIDE the earlier shapes
    const r = bumpRange(e, hosts);
    return r ? arc(e, r[0], r[1]) : full(e);
  }
  function bz(p0, p1, p2, p3, t) {
    const u = 1 - t;
    return [0, 1].map((k) => u * u * u * p0[k] + 3 * u * u * t * p1[k] + 3 * u * t * t * p2[k] + t * t * t * p3[k]);
  }
  function qz(p0, p1, p2, t) {
    const u = 1 - t;
    return [0, 1].map((k) => u * u * p0[k] + 2 * u * t * p1[k] + t * t * p2[k]);
  }

  // ======================= PUPPY =======================
  (function () {
    const head = E(600, 330, 180, 150);
    const earL = E(425, 360, 60, 115, 20), earR = E(775, 360, 60, 115, -20);
    const body = E(600, 620, 150, 165);
    const pawL = E(545, 785, 46, 28), pawR = E(655, 785, 46, 28);
    const m0 = [600, 415], mc = [585, 437], m1 = [565, 425];
    const t0 = qz(m0, mc, m1, 0.3), t1 = qz(m0, [615, 437], [635, 425], 0.3);
    const tail0 = ep(body, -18);
    L.puppy = {
      name: ['Puppy', 'Chiot'], emoji: '🐶', level: 1, cat: 'animals',
      steps: [
        { t: ['Draw a big round head.', 'Dessine une grosse tête ronde.'], d: [full(head)] },
        { t: ['Add two floppy ears.', 'Ajoute deux oreilles tombantes.'], d: [bump(earL, [head]), bump(earR, [head])] },
        { t: ['Draw two eyes, a round snout, a nose and a little tongue.', 'Dessine deux yeux, un museau rond, le nez et une petite langue.'],
          d: [[ell(530, 305, 20, 26), 'k'], [ell(670, 305, 20, 26), 'k'], ell(600, 400, 75, 55), [ell(600, 377, 26, 18), 'k'],
            'M600 393L600 415Q585 437 565 425', 'M600 415Q615 437 635 425', `M${S(t0)}Q600 470 ${S(t1)}`] },
        { t: ['Draw the body and two little paws.', 'Dessine le corps et deux petites pattes.'], d: [bump(body, [head, earL, earR]), bump(pawL, [body]), bump(pawR, [body])] },
        { t: ['Add a spot around one eye and a waggy tail!', "Ajoute une tache autour d'un œil et une queue qui frétille!"],
          d: [ell(672, 300, 46, 48), `M${S(tail0)}C820 560 850 480 815 445`] }
      ],
      colors: [[600, 230, '#F2C48D'], [380, 380, '#A86B3C'], [820, 380, '#A86B3C'], [672, 270, '#A86B3C'], [560, 420, '#FFF4E3'], [640, 420, '#FFF4E3'], [600, 437, '#FF7C9C'],
        [600, 650, '#F2C48D'], [545, 800, '#FFF4E3'], [655, 800, '#FFF4E3']]
    };
  })();

  // ======================= TEDDY BEAR =======================
  (function () {
    const head = E(600, 290, 160, 140);
    const earL = E(470, 175, 58, 58), earR = E(730, 175, 58, 58);
    const inL = E(474, 180, 32, 32), inR = E(726, 180, 32, 32);
    const body = E(600, 590, 170, 175);
    const armL = E(440, 580, 50, 90, 30), armR = E(760, 580, 50, 90, -30);
    const legL = E(510, 770, 70, 55), legR = E(690, 770, 70, 55);
    L.teddyBear = {
      name: ['Teddy bear', 'Ourson en peluche'], emoji: '🧸', level: 2, cat: 'animals',
      steps: [
        { t: ['Draw a big round head.', 'Dessine une grosse tête ronde.'], d: [full(head)] },
        { t: ['Add two round ears.', 'Ajoute deux oreilles rondes.'], d: [bump(earL, [head]), bump(earR, [head]), bump(inL, [head]), bump(inR, [head])] },
        { t: ['Draw the eyes, a round snout and a nose.', 'Dessine les yeux, un museau rond et le nez.'],
          d: [[ell(530, 270, 18, 22), 'k'], [ell(670, 270, 18, 22), 'k'], ell(600, 350, 70, 52), [ell(600, 330, 24, 16), 'k'], 'M600 346L600 368Q588 384 570 376', 'M600 368Q612 384 630 376'] },
        { t: ['Draw a big round tummy body.', 'Dessine un gros corps tout rond.'], d: [bump(body, [head])] },
        { t: ['Add two arms and two legs.', 'Ajoute deux bras et deux jambes.'], d: [bump(armL, [body, head]), bump(armR, [body, head]), bump(legL, [body]), bump(legR, [body])] },
        { t: ['Draw paw pads, a tummy and a little heart!', 'Dessine les coussinets, le bedon et un petit cœur!'],
          d: [ell(510, 790, 34, 24), ell(690, 790, 34, 24), ell(600, 615, 95, 90), heart(600, 610, 34)] }
      ],
      colors: [[600, 200, '#C08552'], [430, 160, '#C08552'], [770, 160, '#C08552'], [462, 190, '#F3D2AC'], [738, 190, '#F3D2AC'], [560, 360, '#F3D2AC'], [640, 360, '#F3D2AC'],
        [600, 500, '#C08552'], [400, 600, '#C08552'], [800, 600, '#C08552'], [470, 745, '#C08552'], [730, 745, '#C08552'], [510, 795, '#F3D2AC'], [690, 795, '#F3D2AC'],
        [600, 680, '#F3D2AC'], [600, 615, '#FF6F91']]
    };
  })();

  // ======================= PANDA =======================
  (function () {
    const head = E(600, 300, 175, 150);
    const earL = E(460, 170, 55, 55), earR = E(740, 170, 55, 55);
    const body = E(600, 610, 155, 165);
    const armL = E(455, 585, 48, 95, 30), armR = E(745, 585, 48, 95, -30);
    const legL = E(515, 775, 62, 48), legR = E(685, 775, 62, 48);
    L.panda = {
      name: ['Panda', 'Panda'], emoji: '🐼', level: 3, cat: 'animals',
      steps: [
        { t: ['Draw a big round head.', 'Dessine une grosse tête ronde.'], d: [full(head)] },
        { t: ['Add two round ears.', 'Ajoute deux oreilles rondes.'], d: [bump(earL, [head]), bump(earR, [head])] },
        { t: ['Draw two tilted ovals for the eye patches.', 'Dessine deux ovales penchés pour les taches des yeux.'], d: [ell(528, 305, 44, 60, 30), ell(672, 305, 44, 60, -30)] },
        { t: ['Add round eyes, a nose and a smile.', 'Ajoute des yeux ronds, le nez et un sourire.'],
          d: [circ(535, 296, 19), circ(665, 296, 19), [circ(538, 299, 9), 'k'], [circ(662, 299, 9), 'k'], [ell(600, 378, 22, 14), 'k'], 'M600 391L600 408Q588 425 572 417', 'M600 408Q612 425 628 417'] },
        { t: ['Draw the round body.', 'Dessine le corps tout rond.'], d: [bump(body, [head])] },
        { t: ['Add two arms and two legs.', 'Ajoute deux bras et deux jambes.'], d: [bump(armL, [body, head]), bump(armR, [body, head]), bump(legL, [body]), bump(legR, [body])] },
        { t: ['Draw a bamboo stick for a snack!', 'Dessine un bambou pour la collation!'],
          d: [rr(850, 380, 44, 400, 20), 'M850 480L894 480', 'M850 580L894 580', 'M850 680L894 680', 'M894 430Q940 380 985 395Q950 445 894 452', 'M894 620Q945 590 980 610Q940 652 894 645'] }
      ],
      colors: [[600, 200, '#FFFFFF'], [420, 150, '#33334A'], [780, 150, '#33334A'], [510, 340, '#33334A'], [690, 340, '#33334A'], [600, 600, '#FFFFFF'],
        [410, 620, '#33334A'], [790, 620, '#33334A'], [480, 790, '#33334A'], [720, 790, '#33334A'],
        [872, 430, '#8AC926'], [872, 530, '#8AC926'], [872, 630, '#8AC926'], [872, 730, '#8AC926'], [940, 410, '#4FA83D'], [940, 618, '#4FA83D']]
    };
  })();

  // ======================= FOX =======================
  (function () {
    const head = E(600, 300, 170, 135);
    const body = E(600, 590, 140, 165);
    const pawL = E(545, 755, 42, 26), pawR = E(655, 755, 42, 26);
    const A = ep(body, 25), B = ep(body, -35), T = [880, 380];
    const o1 = [860, 720], o2 = [945, 520], i1 = [835, 405], i2 = [775, 455];
    const tipA = bz(A, o1, o2, T, 0.78), tipB = bz(T, i1, i2, B, 0.22);
    const ear = (a0, a1, tip, b0, b1, tip2) => [`M${S(ep(head, a0))}L${tip}L${S(ep(head, a1))}`, `M${S(ep(head, b0))}L${tip2}L${S(ep(head, b1))}`];
    const eL = ear(212, 252, '452 92', 220, 244, '474 140'), eR = ear(288, 328, '748 92', 296, 320, '726 140');
    L.fox = {
      name: ['Fox', 'Renard'], emoji: '🦊', level: 2, cat: 'animals',
      steps: [
        { t: ['Draw a big round head.', 'Dessine une grosse tête ronde.'], d: [full(head)] },
        { t: ['Add two big pointy ears.', 'Ajoute deux grandes oreilles pointues.'], d: [eL[0], eR[0], eL[1], eR[1]] },
        { t: ['Draw a wavy line for the white cheeks.', 'Dessine une ligne en vague pour les joues blanches.'],
          d: [`M${S(ep(head, 162))}C475 370 552 388 600 356C648 388 725 370 ${S(ep(head, 18))}`] },
        { t: ['Add the eyes, a little nose and a smile.', 'Ajoute les yeux, un petit nez et un sourire.'],
          d: [[ell(530, 290, 17, 22), 'k'], [ell(670, 290, 17, 22), 'k'], [ell(600, 358, 22, 15), 'k'], 'M600 372Q592 392 574 384', 'M600 372Q608 392 626 384'] },
        { t: ['Draw the body and a white chest.', 'Dessine le corps et une poitrine blanche.'], d: [bump(body, [head]), `M${S(ep(head, 115))}C530 525 670 525 ${S(ep(head, 65))}`] },
        { t: ['Add two little paws.', 'Ajoute deux petites pattes.'], d: [bump(pawL, [body]), bump(pawR, [body])] },
        { t: ['Swish! A big fluffy tail with a white tip.', 'Une grosse queue touffue avec le bout blanc!'],
          d: [`M${S(A)}C${S(o1)} ${S(o2)} ${S(T)}C${S(i1)} ${S(i2)} ${S(B)}`, `M${S(tipA)}Q880 450 ${S(tipB)}`] }
      ],
      colors: [[600, 220, '#FF8C42'], [470, 160, '#FF8C42'], [730, 160, '#FF8C42'], [480, 190, '#FFD6BA'], [720, 190, '#FFD6BA'], [500, 400, '#FFF6EC'], [600, 420, '#FFF6EC'],
        [600, 640, '#FF8C42'], [600, 470, '#FFF6EC'], [545, 770, '#7A4E2D'], [655, 770, '#7A4E2D'], [840, 600, '#FF8C42'], [885, 410, '#FFF6EC']]
    };
  })();

  // ======================= LION =======================
  (function () {
    const face = E(600, 330, 135, 135);
    const core = E(600, 330, 170, 170);
    const puffs = [];
    for (let i = 0; i < 12; i++) { const a = (i * 30 - 90) * RAD; puffs.push(E(f(600 + 170 * Math.cos(a)), f(330 + 170 * Math.sin(a)), 62, 62)); }
    const mane = puffs.map((p, i) => bump(p, [core].concat(puffs.filter((q, j) => j !== i))));
    const earL = E(497, 222, 32, 32), earR = E(703, 222, 32, 32);
    const body = E(600, 650, 140, 155);
    const pawL = E(545, 805, 42, 26), pawR = E(655, 805, 42, 26);
    const tuft = E(860, 600, 24, 36, 25);
    const t0 = ep(body, 10), t1 = ep(tuft, 115);
    L.lion = {
      name: ['Lion', 'Lion'], emoji: '🦁', level: 2, cat: 'animals',
      steps: [
        { t: ['Draw a round face.', 'Dessine un visage tout rond.'], d: [full(face)] },
        { t: ['Draw a big fluffy mane all around.', 'Dessine une grosse crinière toute bouffante autour.'], d: mane },
        { t: ['Add two little round ears.', 'Ajoute deux petites oreilles rondes.'], d: [bump(earL, [face]), bump(earR, [face])] },
        { t: ['Draw the eyes, a nose and a smile.', 'Dessine les yeux, le nez et un sourire.'],
          d: [[ell(545, 310, 16, 21), 'k'], [ell(655, 310, 16, 21), 'k'], ['M574 358Q600 346 626 358Q616 386 600 388Q584 386 574 358Z', 'k'], 'M600 388L600 405Q586 425 566 413', 'M600 405Q614 425 634 413',
            [circ(530, 380, 5), 'k'], [circ(548, 395, 5), 'k'], [circ(670, 380, 5), 'k'], [circ(652, 395, 5), 'k']] },
        { t: ['Draw the body and two paws.', 'Dessine le corps et deux pattes.'], d: [bump(body, [core].concat(puffs)), bump(pawL, [body]), bump(pawR, [body])] },
        { t: ['Add a tail with a fluffy tip.', 'Ajoute une queue avec un bout tout touffu.'], d: [`M${S(t0)}C800 690 860 690 ${S(t1)}`, full(tuft)] }
      ],
      colors: [[600, 250, '#FFD27F'], [430, 330, '#E8892E'], [770, 330, '#E8892E'], [600, 140, '#E8892E'], [495, 212, '#FFD27F'], [705, 212, '#FFD27F'],
        [600, 680, '#FFD27F'], [545, 820, '#FFE7B3'], [655, 820, '#FFE7B3'], [860, 600, '#E8892E']]
    };
  })();

  // ======================= GIRAFFE =======================
  (function () {
    const body = E(500, 560, 190, 105);
    const head = E(760, 200, 85, 68);
    const snout = E(835, 222, 52, 42);
    const yB = (x) => 560 + 105 * Math.sqrt(1 - ((x - 500) / 190) ** 2);
    const leg = (x1, x2) => `M${x1} ${f(yB(x1))}L${x1} 800L${x2} 800L${x2} ${f(yB(x2))}`;
    const legs = [[365, 410], [432, 477], [548, 593], [615, 660]];
    const ballL = E(714, 72, 15, 15), ballR = E(786, 74, 15, 15);
    const tuft = E(282, 660, 16, 26, 10);
    L.giraffe = {
      name: ['Giraffe', 'Girafe'], emoji: '🦒', level: 3, cat: 'animals',
      steps: [
        { t: ['Draw a big oval for the body.', 'Dessine un gros ovale pour le corps.'], d: [full(body)] },
        { t: ['Draw a smaller oval way up high for the head.', 'Dessine un plus petit ovale tout en haut pour la tête.'], d: [full(head)] },
        { t: ['Join them with a long, long neck!', 'Relie-les avec un très long cou!'], d: [`M${S(ep(body, -25))}L${S(ep(head, 110))}`, `M${S(ep(body, -56))}L${S(ep(head, 152))}`] },
        { t: ['Add a round snout, an eye and a smile.', 'Ajoute un museau rond, un œil et un sourire.'],
          d: [bump(snout, [head]), [circ(760, 188, 12), 'k'], [circ(866, 212, 6), 'k'], 'M832 248Q852 258 868 244'] },
        { t: ['Draw two little horns and an ear.', 'Dessine deux petites cornes et une oreille.'],
          d: [`M${S(ep(head, 250))}L${S(ep(ballL, 95))}`, full(ballL), `M${S(ep(head, 278))}L${S(ep(ballR, 85))}`, full(ballR),
            `M${S(ep(head, 198))}Q640 180 620 148Q658 136 ${S(ep(head, 226))}`] },
        { t: ['Draw four long legs with hooves.', 'Dessine quatre longues pattes avec des sabots.'], d: legs.map((l) => leg(l[0], l[1])).concat([legs.map((l) => `M${l[0]} 772L${l[1]} 772`).join('')]) },
        { t: ['Add a little tail.', 'Ajoute une petite queue.'], d: [`M${S(ep(body, 192))}Q285 590 ${S(ep(tuft, 265))}`, full(tuft)] },
        { t: ['Decorate her with spots!', 'Décore-la avec des taches!'],
          d: [ell(410, 540, 36, 26, -15), ell(515, 600, 42, 28, 10), ell(570, 515, 30, 22, 5), ell(440, 615, 24, 16), ell(345, 580, 18, 22), ell(672, 385, 16, 22, 15), ell(697, 305, 14, 18, 15)] }
      ],
      colors: [[480, 490, '#FFD25A'], [740, 230, '#FFD25A'], [660, 450, '#FFD25A'], [850, 235, '#FFE7A8'], [714, 72, '#C77B30'], [786, 74, '#C77B30'], [728, 112, '#FFD25A'], [650, 165, '#FFD25A'],
        [387, 720, '#FFD25A'], [454, 720, '#FFD25A'], [570, 720, '#FFD25A'], [637, 720, '#FFD25A'], [387, 787, '#7A4E2D'], [454, 787, '#7A4E2D'], [570, 787, '#7A4E2D'], [637, 787, '#7A4E2D'],
        [282, 662, '#7A4E2D'], [410, 540, '#C77B30'], [515, 600, '#C77B30'], [570, 515, '#C77B30'], [440, 615, '#C77B30'], [345, 580, '#C77B30'], [672, 385, '#C77B30'], [697, 305, '#C77B30']]
    };
  })();

  // ======================= ELEPHANT =======================
  (function () {
    const head = E(600, 300, 150, 135);
    const earL = E(425, 300, 105, 125), earR = E(775, 300, 105, 125);
    const inL = E(430, 305, 68, 88), inR = E(770, 305, 68, 88);
    const body = E(600, 610, 160, 150);
    const legL = E(525, 752, 58, 45), legR = E(675, 752, 58, 45);
    const A = ep(head, 105), B = ep(head, 75);
    const nails = (cx) => `M${cx - 30} 785Q${cx - 22} 772 ${cx - 14} 785M${cx - 8} 788Q${cx} 775 ${cx + 8} 788M${cx + 14} 785Q${cx + 22} 772 ${cx + 30} 785`;
    L.elephant = {
      name: ['Elephant', 'Éléphant'], emoji: '🐘', level: 2, cat: 'animals',
      steps: [
        { t: ['Draw a big round head.', 'Dessine une grosse tête ronde.'], d: [full(head)] },
        { t: ['Add two giant floppy ears.', 'Ajoute deux énormes oreilles.'], d: [bump(earL, [head]), bump(earR, [head]), bump(inL, [head]), bump(inR, [head])] },
        { t: ['Draw a long trunk that curls up at the end.', 'Dessine une longue trompe qui roule au bout.'],
          d: [`M${S(A)}C555 540 610 612 672 588C708 572 704 520 674 528C650 535 640 490 ${S(B)}`] },
        { t: ['Add two eyes and pink cheeks.', 'Ajoute deux yeux et des joues roses.'], d: [[ell(545, 290, 15, 20), 'k'], [ell(655, 290, 15, 20), 'k'], circ(510, 350, 20), circ(690, 350, 20)] },
        { t: ['Draw a big round body.', 'Dessine un gros corps tout rond.'], d: [bump(body, [head, earL, earR])] },
        { t: ['Add two chubby feet with toenails.', 'Ajoute deux pieds dodus avec des ongles.'], d: [bump(legL, [body]), bump(legR, [body]), nails(525), nails(675)] }
      ],
      colors: [[600, 220, '#A9B8D8'], [340, 300, '#A9B8D8'], [860, 300, '#A9B8D8'], [410, 305, '#FFC2D4'], [790, 305, '#FFC2D4'], [585, 480, '#A9B8D8'], [510, 350, '#FF9EB5'], [690, 350, '#FF9EB5'],
        [500, 620, '#A9B8D8'], [510, 758, '#A9B8D8'], [690, 758, '#A9B8D8']]
    };
  })();

  // ======================= MONKEY =======================
  (function () {
    const head = E(600, 300, 155, 140);
    const earL = E(440, 310, 48, 48), earR = E(760, 310, 48, 48);
    const inL = E(440, 312, 28, 28), inR = E(760, 312, 28, 28);
    const body = E(600, 590, 125, 140);
    const armL = E(478, 570, 36, 80, 22), armR = E(722, 570, 36, 80, -22);
    const legL = E(530, 728, 50, 34), legR = E(670, 728, 50, 34);
    const t0 = ep(body, 42);
    L.monkey = {
      name: ['Monkey', 'Singe'], emoji: '🐵', level: 3, cat: 'animals',
      steps: [
        { t: ['Draw a big round head.', 'Dessine une grosse tête ronde.'], d: [full(head)] },
        { t: ['Add two round ears on the sides.', 'Ajoute deux oreilles rondes sur les côtés.'], d: [bump(earL, [head]), bump(earR, [head]), bump(inL, [head]), bump(inR, [head])] },
        { t: ['Draw the face shape, like a big peanut.', 'Dessine la forme du visage, comme une grosse arachide.'],
          d: ['M600 270C565 220 490 228 492 292C462 340 490 400 600 400C710 400 738 340 708 292C710 228 635 220 600 270Z'] },
        { t: ['Add the eyes, two nose dots and a big smile.', 'Ajoute les yeux, deux points pour le nez et un grand sourire.'],
          d: [[ell(552, 292, 16, 20), 'k'], [ell(648, 292, 16, 20), 'k'], [circ(588, 333, 6), 'k'], [circ(612, 333, 6), 'k'], 'M545 352Q600 395 655 352'] },
        { t: ['Draw the body and a round tummy.', 'Dessine le corps et un bedon tout rond.'], d: [bump(body, [head]), ell(600, 610, 72, 78)] },
        { t: ['Add two arms and two feet.', 'Ajoute deux bras et deux pieds.'], d: [bump(armL, [body, head]), bump(armR, [body, head]), bump(legL, [body]), bump(legR, [body])] },
        { t: ['Finish with a long curly tail!', 'Termine avec une longue queue en tire-bouchon!'], d: [`M${S(t0)}C800 760 880 660 840 590C815 548 770 580 800 605`] }
      ],
      colors: [[600, 190, '#A0663C'], [410, 330, '#A0663C'], [790, 330, '#A0663C'], [425, 312, '#F6D5B0'], [775, 312, '#F6D5B0'], [600, 380, '#F6D5B0'],
        [600, 500, '#A0663C'], [600, 610, '#F6D5B0'], [450, 610, '#A0663C'], [750, 610, '#A0663C'], [530, 750, '#F6D5B0'], [670, 750, '#F6D5B0']]
    };
  })();

  // ======================= PENGUIN =======================
  (function () {
    const body = E(600, 470, 175, 255);
    const finL = E(432, 500, 45, 110, 25), finR = E(768, 500, 45, 110, -25);
    const footL = E(540, 725, 56, 26), footR = E(660, 725, 56, 26);
    L.penguin = {
      name: ['Penguin', 'Pingouin'], emoji: '🐧', level: 1, cat: 'animals',
      steps: [
        { t: ['Draw a big tall egg.', 'Dessine un gros œuf tout grand.'], d: [full(body)] },
        { t: ['Draw the white tummy and face inside.', "Dessine le ventre et le visage blancs à l'intérieur."],
          d: ['M600 330C560 270 460 285 470 380C445 480 460 640 600 665C740 640 755 480 730 380C740 285 640 270 600 330Z'] },
        { t: ['Add two eyes, a little beak and pink cheeks.', 'Ajoute deux yeux, un petit bec et des joues roses.'],
          d: [[ell(545, 368, 15, 20), 'k'], [ell(655, 368, 15, 20), 'k'], 'M574 405L626 405L600 434Z', circ(522, 425, 17), circ(678, 425, 17)] },
        { t: ['Draw two flippers to wave hello!', 'Dessine deux ailerons pour dire bonjour!'], d: [bump(finL, [body]), bump(finR, [body])] },
        { t: ['Add two orange feet.', 'Ajoute deux pieds orange.'], d: [bump(footL, [body]), bump(footR, [body])] }
      ],
      colors: [[600, 250, '#2E3A59'], [430, 600, '#2E3A59'], [400, 520, '#2E3A59'], [800, 520, '#2E3A59'], [600, 550, '#FFFFFF'], [600, 415, '#FFB703'], [522, 425, '#FF9EB5'], [678, 425, '#FF9EB5'],
        [530, 738, '#FFB703'], [670, 738, '#FFB703']]
    };
  })();

  // ======================= FROG =======================
  (function () {
    const head = E(600, 380, 215, 140);
    const eyeL = E(480, 250, 70, 70), eyeR = E(720, 250, 70, 70);
    const body = E(600, 640, 165, 135);
    const footL = E(490, 772, 72, 30), footR = E(710, 772, 72, 30);
    L.frog = {
      name: ['Frog', 'Grenouille'], emoji: '🐸', level: 1, cat: 'animals',
      steps: [
        { t: ['Draw a wide oval for the head.', 'Dessine un ovale bien large pour la tête.'], d: [full(head)] },
        { t: ['Add two big round eyes on top.', 'Ajoute deux gros yeux ronds sur le dessus.'], d: [bump(eyeL, [head]), bump(eyeR, [head]), [circ(480, 228, 24), 'k'], [circ(720, 228, 24), 'k']] },
        { t: ['Draw a big smile, a nose and pink cheeks.', 'Dessine un grand sourire, le nez et des joues roses.'],
          d: ['M480 410Q600 500 720 410', [circ(578, 350, 6), 'k'], [circ(622, 350, 6), 'k'], ell(428, 400, 28, 18), ell(772, 400, 28, 18)] },
        { t: ['Draw the body and a round belly.', 'Dessine le corps et un ventre rond.'], d: [bump(body, [head]), ell(600, 668, 95, 68)] },
        { t: ['Add two big flat feet.', 'Ajoute deux grands pieds plats.'], d: [bump(footL, [body]), bump(footR, [body])] }
      ],
      colors: [[600, 300, '#7BC950'], [450, 215, '#7BC950'], [750, 215, '#7BC950'], [428, 400, '#FF9EB5'], [772, 400, '#FF9EB5'], [460, 620, '#7BC950'], [600, 670, '#DDF4B8'],
        [460, 785, '#4FA83D'], [740, 785, '#4FA83D']]
    };
  })();

  // ======================= HEDGEHOG =======================
  (function () {
    const body = E(560, 560, 230, 160);
    const a0 = 165, a1 = 300, n = 9;
    const pts = [], spikeSeeds = [];
    for (let k = 0; k <= 2 * n; k++) {
      const a = a0 + (k * (a1 - a0)) / (2 * n), sc = k % 2 ? 1.27 : 1;
      pts.push([body.cx + sc * body.rx * Math.cos(a * RAD), body.cy + sc * body.ry * Math.sin(a * RAD)]);
    }
    for (let k = 1; k < 2 * n; k += 2) {
      const p = pts[k], q = pts[k - 1], r = pts[k + 1];
      spikeSeeds.push([f(0.6 * p[0] + 0.2 * q[0] + 0.2 * r[0]), f(0.6 * p[1] + 0.2 * q[1] + 0.2 * r[1]), '#7A4E2D']);
    }
    const spikes = 'M' + pts.map(S).join('L');
    const snout = E(800, 582, 56, 40);
    const footL = E(450, 712, 42, 24), footR = E(700, 692, 42, 24);
    L.hedgehog = {
      name: ['Hedgehog', 'Hérisson'], emoji: '🦔', level: 2, cat: 'animals',
      steps: [
        { t: ['Draw a big oval for the body.', 'Dessine un gros ovale pour le corps.'], d: [full(body)] },
        { t: ['Draw pointy spikes all along the back.', 'Dessine des pics pointus tout le long du dos.'], d: [spikes] },
        { t: ['Draw a curvy line to make the face.', 'Dessine une ligne courbe pour faire le visage.'], d: [`M${S(ep(body, 300))}C600 480 585 640 ${S(ep(body, 82))}`] },
        { t: ['Add a pointy little snout with a nose.', 'Ajoute un petit museau pointu avec le nez.'], d: [bump(snout, [body]), [circ(852, 576, 14), 'k']] },
        { t: ['Draw an eye, a pink cheek and a smile.', 'Dessine un œil, une joue rose et un sourire.'], d: [[ell(712, 512, 13, 17), 'k'], ell(728, 560, 20, 13), 'M690 612Q718 632 748 608'] },
        { t: ['Add two tiny feet.', 'Ajoute deux tout petits pieds.'], d: [bump(footL, [body]), bump(footR, [body])] }
      ],
      colors: [[440, 520, '#A0663C'], [690, 470, '#F6D5B0'], [830, 595, '#F6D5B0'], [728, 560, '#FF9EB5'], [450, 727, '#F6D5B0'], [700, 707, '#F6D5B0']].concat(spikeSeeds)
    };
  })();

  // ======================= LADYBUG =======================
  (function () {
    const body = E(600, 500, 210, 200);
    const head = E(600, 295, 120, 100);
    const antL = ep(head, 238), antR = ep(head, 302);
    const legs = [160, 182, 204].map((a) => { const p = ep(body, a); return `M${S(p)}L${f(p[0] - 48)} ${f(p[1] + (a - 182) * 1.2)}`; })
      .concat([20, -2, -24].map((a) => { const p = ep(body, a); return `M${S(p)}L${f(p[0] + 48)} ${f(p[1] + (a + 2) * 1.2)}`; }));
    L.ladybug = {
      name: ['Ladybug', 'Coccinelle'], emoji: '🐞', level: 1, cat: 'animals',
      steps: [
        { t: ['Draw a big round body.', 'Dessine un gros corps tout rond.'], d: [full(body)] },
        { t: ['Add a round head on top.', 'Ajoute une tête ronde en haut.'], d: [bump(head, [body])] },
        { t: ['Draw a line down the middle and add spots.', 'Dessine une ligne au milieu et ajoute des points.'],
          d: ['M600 300L600 700', circ(510, 420, 36), circ(470, 560, 30), circ(540, 640, 26), circ(690, 420, 36), circ(730, 560, 30), circ(660, 640, 26)] },
        { t: ['Add a happy face and two antennas.', 'Ajoute un visage content et deux antennes.'],
          d: [circ(560, 245, 18), circ(640, 245, 18), [circ(562, 248, 9), 'k'], [circ(638, 248, 9), 'k'], 'M580 272Q600 286 620 272',
            `M${S(antL)}Q520 170 505 135`, [circ(500, 125, 14), 'k'], `M${S(antR)}Q680 170 695 135`, [circ(700, 125, 14), 'k']] },
        { t: ['Give her six little legs.', 'Donne-lui six petites pattes.'], d: legs }
      ],
      colors: [[480, 480, '#E63946'], [720, 480, '#E63946'], [600, 230, '#3E3E56'], [510, 420, '#2B2B3A'], [470, 560, '#2B2B3A'], [540, 640, '#2B2B3A'], [690, 420, '#2B2B3A'], [730, 560, '#2B2B3A'], [660, 640, '#2B2B3A']]
    };
  })();
})();
