/* draw4fun pack: sea */
(function () {
  'use strict';
  const H = window.ART.helpers, ell = H.ell, circ = H.circ, rr = H.rr, star = H.starD, heart = H.heartD;
  const L = window.PAPER.lessons;

  // ---- little math helpers so lines meet exactly on earlier outlines ----
  const f = (n) => Math.round(n * 10) / 10;
  const R = Math.PI / 180;
  // point on an ellipse at angle a (degrees) -> [x, y]
  const ep = (cx, cy, rx, ry, a) => [f(cx + rx * Math.cos(a * R)), f(cy + ry * Math.sin(a * R))];
  // point on a cubic / quadratic bezier at t -> [x, y]
  const cb = (p0, p1, p2, p3, t) => {
    const u = 1 - t;
    return [0, 1].map((i) => f(u * u * u * p0[i] + 3 * u * u * t * p1[i] + 3 * u * t * t * p2[i] + t * t * t * p3[i]));
  };
  const qb = (p0, p1, p2, t) => {
    const u = 1 - t;
    return [0, 1].map((i) => f(u * u * p0[i] + 2 * u * t * p1[i] + t * t * p2[i]));
  };
  const s = (p) => p[0] + ' ' + p[1];
  // mirror a path left <-> right around x = 600 (absolute M L C Q A Z only)
  const mirror = (d) => d.replace(/([MLCQAZ])([^MLCQAZ]*)/g, (m, c, args) => {
    const n = args.trim() ? args.trim().split(/[\s,]+/).map(Number) : [];
    if (c === 'A') {
      const o = [];
      for (let i = 0; i < n.length; i += 7) o.push(n[i], n[i + 1], -n[i + 2], n[i + 3], 1 - n[i + 4], f(1200 - n[i + 5]), n[i + 6]);
      return c + o.join(' ');
    }
    return c + n.map((v, i) => (i % 2 ? v : f(1200 - v))).join(' ');
  });

  // ================= WHALE =================
  (function () {
    const B = [540, 520, 290, 200];
    const e = (a) => ep(B[0], B[1], B[2], B[3], a);
    const tail = `M${s(e(-25))}Q862 400 875 330C820 300 808 240 838 222C870 232 890 270 893 300C905 262 935 232 968 238C978 275 948 318 905 336Q890 470 ${s(e(8))}`;
    const belly = `M${s(e(150))}Q540 735 ${s(e(30))}`;
    const flipper = `M${s(e(100))}C500 790 560 822 605 800C615 780 600 745 ${s(e(80))}`;
    const top = e(-118);
    L.whale = {
      name: ['Whale', 'Baleine'], emoji: '🐳', level: 1, cat: 'sea',
      steps: [
        { t: ['Draw a big oval for the body.', 'Dessine un gros ovale pour le corps.'], d: [ell(...B)] },
        { t: ['Add a tail that waves hello!', 'Ajoute une queue qui fait coucou!'], d: [tail] },
        { t: ['Draw a curvy line for the belly.', 'Dessine une ligne courbée pour le ventre.'], d: [belly] },
        { t: ['Add a little flipper and a happy face.', 'Ajoute une petite nageoire et un visage content.'], d: [flipper, [ell(372, 480, 18, 24), 'k'], 'M330 540Q352 562 382 545', ell(430, 548, 24, 14)] },
        { t: ['Make a splashy water spout on top!', "Fais un jet d'eau qui éclabousse sur le dessus!"], d: [`M${s(top)}L${top[0]} 260`, `M${top[0]} 260C${f(top[0] - 35)} 205 ${f(top[0] - 80)} 225 ${f(top[0] - 70)} 268`, `M${top[0]} 260C${f(top[0] + 35)} 205 ${f(top[0] + 80)} 225 ${f(top[0] + 70)} 268`, circ(f(top[0] - 75), 300, 9), circ(f(top[0] + 75), 300, 9)] }
      ],
      colors: [[560, 420, '#4CC9F0'], [870, 300, '#3AA8E0'], [850, 400, '#3AA8E0'], [540, 680, '#CDEFFF'], [560, 780, '#3AA8E0'], [430, 548, '#FF9EC4']]
    };
  })();

  // ================= OCTOPUS =================
  (function () {
    let legs = 'M390 500';
    for (let i = 0; i < 8; i++) {
      const xa = 390 + i * 52.5, xb = xa + 52.5, ya = i === 0 ? 500 : 580, yb = i === 7 ? 500 : 580;
      const xc = (xa + xb) / 2, k = i - 3.5, sh = k * 24, ty = 760 - Math.abs(k) * 22;
      legs += `C${f(xa + (i === 0 ? -6 : 0))} ${f(ya + (ty - ya) * 0.6)} ${f(xc + sh - 28)} ${f(ty)} ${f(xc + sh)} ${f(ty)}`;
      legs += `C${f(xc + sh + 28)} ${f(ty)} ${f(xb + (i === 7 ? 6 : 0))} ${f(yb + (ty - yb) * 0.6)} ${f(xb)} ${f(yb)}`;
    }
    L.octopus = {
      name: ['Octopus', 'Pieuvre'], emoji: '🐙', level: 2, cat: 'sea',
      steps: [
        { t: ['Draw a big round head, like a hill.', 'Dessine une grosse tête ronde, comme une colline.'], d: ['M390 500C345 140 855 140 810 500'] },
        { t: ['Add eight wiggly legs!', 'Ajoute huit pattes qui gigotent!'], d: [legs] },
        { t: ['Draw two big shiny eyes.', 'Dessine deux gros yeux brillants.'], d: [[ell(535, 420, 24, 32), 'k'], [ell(665, 420, 24, 32), 'k']] },
        { t: ['Add a sweet smile and pink cheeks.', 'Ajoute un beau sourire et des joues roses.'], d: ['M570 478Q600 505 630 478', ell(478, 475, 30, 18), ell(722, 475, 30, 18)] },
        { t: ['Draw some spots on the head.', 'Dessine des taches sur la tête.'], d: [circ(520, 320, 24), circ(690, 305, 18), circ(610, 262, 13)] },
        { t: ['Blow some bubbles!', 'Fais des bulles!'], d: [circ(880, 260, 28), circ(925, 185, 18), circ(900, 125, 11)] }
      ],
      colors: [[600, 360, '#B57BFF'], [520, 320, '#D9B8FF'], [690, 305, '#D9B8FF'], [610, 262, '#D9B8FF'], [478, 475, '#FF8FC0'], [722, 475, '#FF8FC0'], [880, 260, '#CDEFFF'], [925, 185, '#CDEFFF'], [900, 125, '#CDEFFF']]
    };
  })();

  // ================= CRAB =================
  (function () {
    const B = [600, 545, 230, 150];
    const e = (a) => ep(B[0], B[1], B[2], B[3], a);
    // body point at given x on the top half of the body
    const topAt = (x) => [x, f(B[1] - B[3] * Math.sqrt(1 - Math.pow((x - B[0]) / B[2], 2)))];
    const E = [515, 290, 52];
    const eyeL = circ(E[0], E[1], E[2]);
    const eA = ep(E[0], E[1], E[2], E[2], 115), eB = ep(E[0], E[1], E[2], E[2], 65);
    const stalk = `M${s(eA)}L${s(topAt(eA[0]))}M${s(eB)}L${s(topAt(eB[0]))}`;
    const C = [300, 330, 82];
    const c = (a) => ep(C[0], C[1], C[2], C[2], a);
    const claw = `M${s(c(-70))}A${C[2]} ${C[2]} 0 1 1 ${s(c(-115))}L${C[0] - 4} ${C[1] - 14}Z`;
    const cr = (a) => ep(1200 - C[0], C[1], C[2], C[2], a);
    const clawR = `M${s(cr(-110))}A${C[2]} ${C[2]} 0 1 0 ${s(cr(-65))}L${1200 - C[0] + 4} ${C[1] - 14}Z`;
    const arm = `M${s(c(62))}Q350 470 ${s(e(197))}M${s(c(25))}Q400 410 ${s(e(208))}`;
    const legs = `M${s(e(150))}Q345 625 322 690M${s(e(136))}Q392 672 382 740M${s(e(122))}Q470 712 462 772`;
    L.crab = {
      name: ['Crab', 'Crabe'], emoji: '🦀', level: 2, cat: 'sea',
      steps: [
        { t: ['Draw a wide oval for the body.', 'Dessine un ovale large pour le corps.'], d: [ell(...B)] },
        { t: ['Add two eyes up on little sticks.', 'Ajoute deux yeux sur des petits bâtons.'], d: [eyeL, mirror(eyeL), stalk, mirror(stalk)] },
        { t: ['Color the pupils and draw a big smile.', 'Colorie les pupilles et dessine un grand sourire.'], d: [[circ(E[0] + 8, E[1] + 8, 22), 'k'], [circ(1200 - E[0] - 8, E[1] + 8, 22), 'k'], 'M545 560Q600 615 655 560'] },
        { t: ['Draw two big pinchy claws.', 'Dessine deux grosses pinces.'], d: [claw, mirror(claw), arm, mirror(arm)] },
        { t: ['Add three little legs on each side.', 'Ajoute trois petites pattes de chaque côté.'], d: [legs, mirror(legs)] },
        { t: ['Finish with rosy cheeks and bubbles!', 'Termine avec des joues roses et des bulles!'], d: [ell(475, 560, 30, 18), ell(725, 560, 30, 18), circ(860, 160, 22), circ(905, 105, 13)] }
      ],
      colors: [[600, 470, '#FF5A5A'], [300, 360, '#FF5A5A'], [900, 360, '#FF5A5A'], [362, 440, '#FF7B6B'], [838, 440, '#FF7B6B'],
        [515, 370, '#FF7B6B'], [685, 370, '#FF7B6B'], [475, 560, '#FFB3C7'], [725, 560, '#FFB3C7'], [860, 160, '#CDEFFF'], [905, 105, '#CDEFFF']]
    };
  })();

  // ================= STARFISH =================
  (function () {
    const cx = 600, cy = 500, rv = 180, rc = 470;
    let d = '';
    for (let i = 0; i < 5; i++) {
      const a = -90 + i * 72;
      const v1 = ep(cx, cy, rv, rv, a - 36), c = ep(cx, cy, rc, rc, a), v2 = ep(cx, cy, rv, rv, a + 36);
      d += (i ? '' : 'M' + s(v1)) + 'Q' + s(c) + ' ' + s(v2);
    }
    d += 'Z';
    const dots = [];
    const seeds = [];
    for (let i = 0; i < 5; i++) {
      const a = -90 + i * 72;
      const p = ep(cx, cy, 245, 245, a);
      dots.push(circ(p[0], p[1], 22));
      seeds.push([p[0], p[1], '#FFE066']);
    }
    L.starfish = {
      name: ['Starfish', 'Étoile de mer'], emoji: '⭐', level: 1, cat: 'sea',
      steps: [
        { t: ['Draw a big chubby star.', 'Dessine une grosse étoile toute dodue.'], d: [d] },
        { t: ['Give it a happy face.', 'Donne-lui un visage content.'], d: [[ell(555, 490, 17, 23), 'k'], [ell(645, 490, 17, 23), 'k'], 'M570 545Q600 572 630 545'] },
        { t: ['Add pink cheeks.', 'Ajoute des joues roses.'], d: [ell(505, 540, 26, 15), ell(695, 540, 26, 15)] },
        { t: ['Draw a dot on each arm.', 'Dessine un point sur chaque bras.'], d: dots },
        { t: ['Add bubbles all around!', 'Ajoute des bulles partout autour!'], d: [circ(880, 200, 24), circ(920, 135, 14), circ(300, 210, 18)] }
      ],
      colors: [[600, 620, '#FF8C42'], [505, 540, '#FF6FB5'], [695, 540, '#FF6FB5']].concat(seeds, [[880, 200, '#CDEFFF'], [920, 135, '#CDEFFF'], [300, 210, '#CDEFFF']])
    };
  })();

  // ================= DOLPHIN =================
  (function () {
    const T1 = [850, 500], T2 = [828, 532];
    const back = [T1, [800, 330], [650, 240], [500, 250]];
    const belly1 = [[325, 430], [380, 500], [480, 540], [600, 535]];
    const belly2 = [[600, 535], [720, 530], [790, 520], T2];
    const body = `M${s(T1)}C800 330 650 240 500 250C400 256 340 300 322 360C290 362 250 370 245 395C242 425 280 432 325 430C380 500 480 540 600 535C720 530 790 520 ${s(T2)}`;
    const tail = `M${s(T1)}C890 490 950 465 985 440C990 500 950 545 905 555C935 590 955 640 945 680C895 660 850 600 ${s(T2)}`;
    const f1 = cb(...back, 0.62), f2 = cb(...back, 0.36);
    const fin = `M${s(f1)}C${f(f1[0] + 5)} ${f(f1[1] - 70)} ${f(f1[0] + 80)} ${f(f1[1] - 115)} ${f(f1[0] + 140)} ${f(f1[1] - 110)}C${f(f2[0] - 20)} ${f(f2[1] - 60)} ${f(f2[0] - 10)} ${f(f2[1] - 20)} ${s(f2)}`;
    const p1 = cb(...belly1, 0.5), p2 = cb(...belly1, 0.85);
    const flip = `M${s(p1)}C${f(p1[0] - 5)} ${f(p1[1] + 60)} ${f(p1[0] + 50)} ${f(p1[1] + 110)} ${f(p1[0] + 120)} ${f(p1[1] + 115)}C${f(p2[0] + 20)} ${f(p2[1] + 60)} ${f(p2[0] + 5)} ${f(p2[1] + 25)} ${s(p2)}`;
    const bl = cb(...belly2, 0.5);
    const bellyLine = `M350 398C430 445 540 480 ${s(bl)}`;
    L.dolphin = {
      name: ['Dolphin', 'Dauphin'], emoji: '🐬', level: 3, cat: 'sea',
      steps: [
        { t: ['Draw a big curvy body with a little nose.', 'Dessine un gros corps courbé avec un petit nez.'], d: [body] },
        { t: ['Add a tail at the end.', 'Ajoute une queue au bout.'], d: [tail] },
        { t: ['Draw a fin on the back.', 'Dessine un aileron sur le dos.'], d: [fin] },
        { t: ['Add a flipper under the tummy.', 'Ajoute une nageoire sous le bedon.'], d: [flip] },
        { t: ['Draw a smile from the nose.', 'Dessine un sourire à partir du nez.'], d: ['M245 398Q300 412 350 398'] },
        { t: ['Add a line for the belly.', 'Ajoute une ligne pour le ventre.'], d: [bellyLine] },
        { t: ['Draw an eye, a cheek and bubbles!', 'Dessine un œil, une joue et des bulles!'], d: [[ell(392, 340, 16, 22), 'k'], ell(430, 382, 22, 13), circ(250, 260, 22), circ(215, 200, 13), circ(240, 150, 8)] }
      ],
      colors: [[620, 340, '#4CA8F0'], [950, 480, '#4CA8F0'], [920, 620, '#4CA8F0'], [f(f1[0] + 60), f(f1[1] - 50), '#3A8ED8'], [f(p1[0] + 70), f(p1[1] + 55), '#3A8ED8'],
        [520, 500, '#D6F0FF'], [290, 415, '#D6F0FF'], [430, 382, '#FF9EC4'], [250, 260, '#CDEFFF'], [215, 200, '#CDEFFF']]
    };
  })();

  // ================= JELLYFISH =================
  (function () {
    let edge = 'M380 470';
    for (let i = 1; i <= 5; i++) edge += `A44 36 0 0 0 ${380 + i * 88} 470`;
    const tent = [];
    const lens = [260, 320, 350, 320, 260];
    for (let i = 0; i < 5; i++) {
      const x = 424 + i * 88, y0 = 506, ln = lens[i], w = (i % 2 ? -1 : 1) * 26;
      tent.push(`M${x} ${y0}C${x + w} ${y0 + ln * 0.2} ${x - w} ${y0 + ln * 0.35} ${x} ${y0 + ln * 0.5}C${x + w} ${y0 + ln * 0.65} ${x - w} ${y0 + ln * 0.8} ${x} ${y0 + ln}`);
    }
    L.jellyfish = {
      name: ['Jellyfish', 'Méduse'], emoji: '🌊', level: 1, cat: 'sea',
      steps: [
        { t: ['Draw a big round dome, like a hat.', 'Dessine un gros dôme rond, comme un chapeau.'], d: ['M380 470C355 165 845 165 820 470'] },
        { t: ['Close it with bumpy waves at the bottom.', 'Ferme-le avec des petites vagues en bas.'], d: [edge] },
        { t: ['Add long wiggly ribbons.', 'Ajoute des longs rubans qui ondulent.'], d: tent },
        { t: ['Draw a cute face.', 'Dessine un beau visage.'], d: [[ell(540, 385, 17, 23), 'k'], [ell(660, 385, 17, 23), 'k'], 'M575 430Q600 455 625 430', ell(488, 430, 26, 15), ell(712, 430, 26, 15)] },
        { t: ['Add a shine and some bubbles!', 'Ajoute un reflet et des bulles!'], d: ['M455 330Q475 280 525 262', circ(880, 230, 24), circ(920, 165, 14), circ(300, 620, 16)] }
      ],
      colors: [[600, 300, '#FF9EDB'], [600, 495, '#FF9EDB'], [488, 430, '#FF5FA8'], [712, 430, '#FF5FA8'], [880, 230, '#CDEFFF'], [920, 165, '#CDEFFF'], [300, 620, '#CDEFFF']]
    };
  })();

  // ================= PUFFERFISH =================
  (function () {
    const B = [600, 470, 230];
    const e = (a) => ep(B[0], B[1], B[2], B[2], a);
    const tail = `M${s(e(-20))}C885 340 930 330 952 352C935 420 935 520 952 588C930 610 885 600 ${s(e(20))}`;
    const fin = `M${s(e(-110))}C515 165 635 150 ${s(e(-72))}`;
    const spikeAngles = [35, 60, 85, 110, 135, 160, 185, 210, 235, 300, 325];
    const spikes = [], seeds = [];
    spikeAngles.forEach((a) => {
      const t = ep(B[0], B[1], 295, 295, a);
      spikes.push(`M${s(e(a - 7))}L${s(t)}L${s(e(a + 7))}`);
      seeds.push([...ep(B[0], B[1], 250, 250, a), '#FF8C42']);
    });
    L.pufferfish = {
      name: ['Pufferfish', 'Poisson-globe'], emoji: '🐡', level: 2, cat: 'sea',
      steps: [
        { t: ['Draw a big round ball.', 'Dessine une grosse balle ronde.'], d: [circ(...B)] },
        { t: ['Add a tail and a little fin on top.', 'Ajoute une queue et une petite nageoire en haut.'], d: [tail, fin] },
        { t: ['Draw little pointy spikes all around.', 'Dessine des petites pointes tout autour.'], d: spikes },
        { t: ['Draw two big eyes.', 'Dessine deux gros yeux.'], d: [circ(480, 430, 46), circ(620, 430, 46), [circ(488, 440, 21), 'k'], [circ(628, 440, 21), 'k']] },
        { t: ['Add a little round mouth and cheeks.', 'Ajoute une petite bouche ronde et des joues.'], d: [ell(550, 530, 22, 18), ell(440, 520, 28, 16), ell(670, 520, 28, 16)] },
        { t: ['Draw spots and bubbles!', 'Dessine des taches et des bulles!'], d: [circ(560, 625, 15), circ(650, 610, 13), circ(730, 545, 15), circ(735, 380, 13), circ(250, 260, 22), circ(215, 200, 13)] }
      ],
      colors: [[600, 340, '#FFD23F'], [910, 470, '#FF8C42'], [590, 205, '#FF8C42'], [550, 530, '#FF5A7A'], [440, 520, '#FF9EC4'], [670, 520, '#FF9EC4'],
        [560, 625, '#FFA94D'], [650, 610, '#FFA94D'], [730, 545, '#FFA94D'], [735, 380, '#FFA94D'], [250, 260, '#CDEFFF'], [215, 200, '#CDEFFF']].concat(seeds)
    };
  })();

  // ================= SHARK =================
  (function () {
    const T1 = [880, 430], T2 = [880, 500];
    const top = [T1, [760, 300], [450, 280], [330, 380]];
    const nose = [[330, 380], [270, 430], [280, 510], [340, 540]];
    const bot = [[340, 540], [460, 610], [760, 570], T2];
    const body = `M${s(T1)}C760 300 450 280 330 380C270 430 280 510 340 540C460 610 760 570 ${s(T2)}`;
    const tail = `M${s(T1)}C930 380 960 330 990 300C1000 380 975 440 950 465C975 495 1000 560 995 630C960 590 920 540 ${s(T2)}`;
    const a1 = cb(...top, 0.55), a2 = cb(...top, 0.3);
    const fin = `M${s(a1)}C${f(a1[0] + 20)} ${f(a1[1] - 90)} ${f(a1[0] + 70)} ${f(a1[1] - 150)} ${f(a1[0] + 110)} ${f(a1[1] - 165)}C${f(a2[0] - 30)} ${f(a2[1] - 90)} ${f(a2[0] - 10)} ${f(a2[1] - 40)} ${s(a2)}`;
    const b1 = cb(...bot, 0.3), b2 = cb(...bot, 0.48);
    const side = `M${s(b1)}C${f(b1[0] + 10)} ${f(b1[1] + 70)} ${f(b1[0] + 60)} ${f(b1[1] + 110)} ${f(b1[0] + 115)} ${f(b1[1] + 115)}C${f(b2[0] + 0)} ${f(b2[1] + 60)} ${f(b2[0] - 5)} ${f(b2[1] + 25)} ${s(b2)}`;
    const n1 = cb(...nose, 0.45), b3 = cb(...bot, 0.82);
    const bellyLine = `M${s(n1)}C380 470 600 480 ${s(b3)}`;
    const S0 = [335, 505], SC = [385, 550], S2 = [445, 508];
    const smile = `M${s(S0)}Q${s(SC)} ${s(S2)}`;
    const tooth = (t1, t2) => { const p = qb(S0, SC, S2, t1), q = qb(S0, SC, S2, t2); return `M${s(p)}L${f((p[0] + q[0]) / 2)} ${f((p[1] + q[1]) / 2 - 20)}L${s(q)}`; };
    L.shark = {
      name: ['Friendly shark', 'Requin gentil'], emoji: '🦈', level: 3, cat: 'sea',
      steps: [
        { t: ['Draw a big body with a round nose.', 'Dessine un gros corps avec un nez rond.'], d: [body] },
        { t: ['Add a tail like a moon.', 'Ajoute une queue en forme de lune.'], d: [tail] },
        { t: ['Draw a fin on the back.', 'Dessine un aileron sur le dos.'], d: [fin] },
        { t: ['Add a fin under the body.', 'Ajoute une nageoire sous le corps.'], d: [side] },
        { t: ['Draw a line for the white belly.', 'Dessine une ligne pour le ventre blanc.'], d: [bellyLine] },
        { t: ['Add a big eye and a pink cheek.', 'Ajoute un gros œil et une joue rose.'], d: [[ell(405, 405, 20, 26), 'k'], ell(460, 450, 24, 13)] },
        { t: ['Draw a smile with two tiny teeth.', 'Dessine un sourire avec deux toutes petites dents.'], d: [smile, tooth(0.3, 0.42), tooth(0.58, 0.7)] },
        { t: ['Add gills and bubbles!', 'Ajoute des branchies et des bulles!'], d: ['M540 385Q556 412 540 440', 'M575 380Q591 408 575 436', 'M610 378Q626 405 610 432', circ(240, 300, 22), circ(205, 240, 13), circ(230, 190, 8)] }
      ],
      colors: [[650, 380, '#7FA8D6'], [960, 380, '#6A93C4'], [960, 560, '#6A93C4'], [f(a1[0] + 60), f(a1[1] - 70), '#6A93C4'], [f(b1[0] + 55), f(b1[1] + 60), '#6A93C4'],
        [560, 520, '#EEF6FF'], [460, 450, '#FF9EC4'], [240, 300, '#CDEFFF'], [205, 240, '#CDEFFF']]
    };
  })();

  // ================= CLAM =================
  (function () {
    const C = [600, 540], Rf = 270;
    let fan = 'M330 540';
    const valleys = [];
    for (let k = 1; k <= 6; k++) {
      const p = ep(C[0], C[1], Rf, Rf, 180 + k * 30);
      fan += `A75 75 0 0 1 ${s(p)}`;
      if (k < 6) valleys.push(p);
    }
    const LP0 = [330, 540], LPC = [600, 310], LP2 = [870, 540];
    const lip = `M${s(LP0)}Q${s(LPC)} ${s(LP2)}`;
    const ribs = valleys.map((v, i) => `M${s(v)}L${s(qb(LP0, LPC, LP2, (i + 1) / 6))}`);
    const ribSeeds = [];
    const cols = ['#FFB3D1', '#FFD6E8'];
    for (let k = 0; k < 6; k++) {
      const p = ep(C[0], C[1], 250, 250, 195 + k * 30);
      const q = qb(LP0, LPC, LP2, (k + 0.5) / 6);
      ribSeeds.push([f((p[0] + q[0]) / 2), f((p[1] + q[1]) / 2), cols[k % 2]]);
    }
    L.clam = {
      name: ['Clam with a pearl', 'Coquillage avec une perle'], emoji: '🐚', level: 2, cat: 'sea',
      steps: [
        { t: ['Draw a bowl for the bottom shell.', 'Dessine un bol pour le bas du coquillage.'], d: ['M330 540Q600 610 870 540C860 700 720 780 600 780C480 780 340 700 330 540Z'] },
        { t: ['Draw a bumpy fan on top, wide open.', 'Dessine un éventail bosselé en haut, grand ouvert.'], d: [fan] },
        { t: ['Draw the inside edge of the top shell.', "Dessine le bord à l'intérieur du haut."], d: [lip] },
        { t: ['Add lines on the fan.', "Ajoute des lignes sur l'éventail."], d: ribs },
        { t: ['Put a round pearl inside!', "Mets une perle ronde à l'intérieur!"], d: [circ(600, 505, 48), 'M572 488Q578 470 596 466'] },
        { t: ['Give it a happy face and sparkles.', 'Donne-lui un visage content et des brillants.'], d: [[ell(530, 650, 15, 20), 'k'], [ell(670, 650, 15, 20), 'k'], 'M570 690Q600 715 630 690', ell(480, 690, 24, 14), ell(720, 690, 24, 14),
          'M960 360L960 420M930 390L990 390', 'M240 350L240 400M215 375L265 375'] }
      ],
      colors: [[600, 740, '#FF8FC0'], [600, 600, '#FF8FC0'], [700, 470, '#B57BFF'], [500, 470, '#B57BFF'], [600, 505, '#F7F3FF'], [480, 690, '#FF5FA8'], [720, 690, '#FF5FA8']].concat(ribSeeds)
    };
  })();

  // ================= SAILBOAT =================
  L.sailboat = {
    name: ['Sailboat', 'Voilier'], emoji: '⛵', level: 1, cat: 'sea',
    steps: [
      { t: ['Draw the boat, like a smiley bowl.', 'Dessine le bateau, comme un bol qui sourit.'], d: ['M300 600L900 600C860 700 780 740 720 740L480 740C420 740 340 700 300 600Z'] },
      { t: ['Draw a tall pole and a little flag.', 'Dessine un grand mât et un petit drapeau.'], d: ['M600 600L600 160', 'M600 160L685 186L600 212'] },
      { t: ['Add a big sail on one side.', 'Ajoute une grande voile sur un côté.'], d: ['M600 245Q770 390 835 560L600 560'] },
      { t: ['Add a smaller sail on the other side.', "Ajoute une plus petite voile de l'autre côté."], d: ['M600 300Q470 420 415 560L600 560'] },
      { t: ['Give the boat a happy face and waves!', 'Donne au bateau un visage content et des vagues!'], d: [[ell(530, 650, 15, 20), 'k'], [ell(670, 650, 15, 20), 'k'], 'M565 690Q600 715 635 690', ell(475, 680, 24, 14), ell(725, 680, 24, 14),
        'M220 790Q270 760 320 790Q370 820 420 790Q470 760 520 790Q570 820 620 790Q670 760 720 790Q770 820 820 790Q870 760 920 790Q955 810 980 795'] }
    ],
    colors: [[600, 640, '#FF5A5A'], [700, 470, '#FFFFFF'], [520, 480, '#FFD23F'], [625, 186, '#FF6FB5'], [475, 680, '#FFB3C7'], [725, 680, '#FFB3C7']]
  };

  // ================= SUBMARINE =================
  (function () {
    const B = [560, 500, 310, 180];
    const e = (a) => ep(B[0], B[1], B[2], B[3], a);
    const xAt = (y) => f(B[0] + B[2] * Math.sqrt(1 - Math.pow((y - B[1]) / B[3], 2)));
    const t1 = e(-111), t2 = e(-69);
    const tower = `M${s(t1)}L${f(t1[0] + 6)} 240Q${f(t1[0] + 6)} 220 ${f(t1[0] + 26)} 220L${f(t2[0] - 26)} 220Q${f(t2[0] - 6)} 220 ${f(t2[0] - 6)} 240L${s(t2)}`;
    const peri = 'M515 220L515 130Q515 112 533 112L585 112L585 146L540 146L540 220';
    const hub = `M${xAt(470)} 470L905 478L905 522L${xAt(530)} 530`;
    const blades = 'M905 486C895 425 945 395 965 420C985 448 945 485 905 495M905 514C895 575 945 605 965 580C985 552 945 515 905 505';
    L.submarine = {
      name: ['Submarine', 'Sous-marin'], emoji: '🚢', level: 2, cat: 'sea',
      steps: [
        { t: ['Draw a big long oval.', 'Dessine un gros ovale allongé.'], d: [ell(...B)] },
        { t: ['Add a little tower on top.', 'Ajoute une petite tour sur le dessus.'], d: [tower] },
        { t: ['Draw a periscope to look around.', 'Dessine un périscope pour regarder partout.'], d: [peri] },
        { t: ['Add two round windows.', 'Ajoute deux fenêtres rondes.'], d: [circ(610, 480, 44), circ(745, 480, 44)] },
        { t: ['Draw a propeller at the back.', "Dessine une hélice à l'arrière."], d: [hub, blades] },
        { t: ['Give it a happy face.', 'Donne-lui un visage content.'], d: [[ell(370, 465, 16, 22), 'k'], [ell(460, 465, 16, 22), 'k'], 'M385 525Q415 550 445 525', ell(330, 525, 22, 13), ell(500, 525, 22, 13)] },
        { t: ['Add bubbles floating up!', 'Ajoute des bulles qui montent!'], d: [circ(1000, 360, 22), circ(1030, 290, 14), circ(1005, 235, 9), circ(250, 300, 16)] }
      ],
      colors: [[560, 620, '#FFD23F'], [560, 280, '#FFB703'], [560, 129, '#9AA9C2'], [527, 180, '#9AA9C2'], [610, 480, '#9FE3FF'], [745, 480, '#9FE3FF'],
        [885, 500, '#FF8C42'], [945, 430, '#FF8C42'], [945, 570, '#FF8C42'], [330, 525, '#FF9EC4'], [500, 525, '#FF9EC4'], [1000, 360, '#CDEFFF'], [1030, 290, '#CDEFFF'], [250, 300, '#CDEFFF']]
    };
  })();

  // ================= LIGHTHOUSE =================
  (function () {
    const lx = (y) => f(520 - (y - 380) * 50 / 380), rx = (y) => f(680 + (y - 380) * 50 / 380);
    const stripe = (y) => `M${lx(y)} ${y}L${rx(y)} ${y}`;
    const beam = 'M545 255L380 205Q360 280 380 355L545 310';
    L.lighthouse = {
      name: ['Lighthouse', 'Phare'], emoji: '🗼', level: 3, cat: 'sea',
      steps: [
        { t: ['Draw a tall tower, wider at the bottom.', 'Dessine une grande tour, plus large en bas.'], d: ['M520 380L680 380L730 760L470 760Z'] },
        { t: ['Draw lines for the stripes.', 'Dessine des lignes pour les rayures.'], d: [stripe(470), stripe(560), stripe(650)] },
        { t: ['Add a balcony on top.', 'Ajoute un balcon en haut.'], d: ['M520 380L482 380Q470 380 470 368L470 352Q470 340 482 340L718 340Q730 340 730 352L730 368Q730 380 718 380L680 380'] },
        { t: ['Draw the lamp room with a bright light.', 'Dessine la pièce de la lampe avec une belle lumière.'], d: ['M545 340L545 230L655 230L655 340', circ(600, 285, 28)] },
        { t: ['Add a pointy roof with a ball on top.', 'Ajoute un toit pointu avec une boule en haut.'], d: ['M545 230L528 230Q518 230 525 222L600 150L675 222Q682 230 672 230L655 230', circ(600, 136, 14)] },
        { t: ['Draw a door and a little window.', 'Dessine une porte et une petite fenêtre.'], d: ['M570 760L570 700A30 30 0 0 1 630 700L630 760', rr(578, 495, 44, 44, 14)] },
        { t: ['Add shiny light beams!', 'Ajoute des rayons de lumière!'], d: [beam, mirror(beam)] },
        { t: ['Put it on rocks and add seagulls.', 'Mets-le sur des rochers et ajoute des goélands.'], d: ['M470 760C420 742 372 758 362 790C330 800 330 842 372 842L828 842C870 842 870 800 838 790C828 758 780 742 730 760',
          'M250 160Q275 135 300 160Q325 135 350 160', 'M860 110Q880 90 900 110Q920 90 940 110'] }
      ],
      colors: [[600, 420, '#FF5A5A'], [600, 515, '#FFFFFF'], [560, 610, '#FF5A5A'], [600, 710, '#FFFFFF'], [600, 360, '#3A4A6B'], [560, 250, '#BDEBFF'], [600, 285, '#FFE066'],
        [600, 200, '#FF5A5A'], [600, 136, '#FFD23F'], [600, 735, '#9C6644'], [600, 517, '#9FE3FF'], [440, 280, '#FFF3A6'], [760, 280, '#FFF3A6'], [400, 810, '#9AA0AE'], [800, 810, '#9AA0AE']]
    };
  })();
})();
