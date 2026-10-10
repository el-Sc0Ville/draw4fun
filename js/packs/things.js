/* draw4fun pack: things */
(function () {
  'use strict';
  const H = window.ART.helpers, ell = H.ell, circ = H.circ, rr = H.rr, star = H.starD, heart = H.heartD;
  const L = window.PAPER.lessons;

  // ---------- little local helpers ----------
  const f = (n) => Math.round(n * 10) / 10;
  const R = (d) => d * Math.PI / 180;
  // point on an ellipse at angle a (degrees), as [x, y]
  const ep = (cx, cy, rx, ry, a) => [f(cx + rx * Math.cos(R(a))), f(cy + ry * Math.sin(R(a)))];
  // same, as "x y" string for paths
  const P = (cx, cy, rx, ry, a) => ep(cx, cy, rx, ry, a).join(' ');
  const S = (p) => p[0] + ' ' + p[1];
  // cubic bezier point
  const bez = (p0, p1, p2, p3, t) => {
    const u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
    return [f(a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0]), f(a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1])];
  };
  // fluffy cloud (flat bottom)
  function cloud(cx, cy, s) {
    const p = (x, y) => `${f(cx + x * s)} ${f(cy + y * s)}`;
    return `M${p(-1.2, 0.35)}A${f(0.42 * s)} ${f(0.42 * s)} 0 0 1 ${p(-0.65, -0.2)}A${f(0.55 * s)} ${f(0.55 * s)} 0 0 1 ${p(0.35, -0.35)}A${f(0.48 * s)} ${f(0.48 * s)} 0 0 1 ${p(1.2, 0.35)}Z`;
  }
  // raindrop
  function drop(x, y, s) {
    return `M${x} ${f(y - 1.5 * s)}C${f(x + 0.3 * s)} ${f(y - 0.8 * s)} ${f(x + s)} ${f(y - 0.2 * s)} ${f(x + s)} ${f(y + 0.3 * s)}A${s} ${s} 0 0 1 ${f(x - s)} ${f(y + 0.3 * s)}C${f(x - s)} ${f(y - 0.2 * s)} ${f(x - 0.3 * s)} ${f(y - 0.8 * s)} ${x} ${f(y - 1.5 * s)}Z`;
  }
  // bumpy (tree-top) outline: bumps between points on an ellipse, angles listed in order (clockwise)
  function bumpy(cx, cy, rx, ry, angles) {
    let d = 'M' + P(cx, cy, rx, ry, angles[0]);
    for (let i = 1; i < angles.length; i++) {
      const a = ep(cx, cy, rx, ry, angles[i - 1]), b = ep(cx, cy, rx, ry, angles[i]);
      const ch = Math.hypot(b[0] - a[0], b[1] - a[1]), r = f(ch * 0.56);
      d += `A${r} ${r} 0 0 1 ${S(b)}`;
    }
    return d + 'Z';
  }
  // kite bow: two triangles meeting at a point on the string (perpendicular to the string direction)
  function bow(x, y, tx, ty, s) {
    const l = Math.hypot(tx, ty), ux = tx / l, uy = ty / l, nx = -uy, ny = ux;
    const tri = (k) => `M${f(x)} ${f(y)}L${f(x + k * nx * s * 1.2 + ux * s * 0.7)} ${f(y + k * ny * s * 1.2 + uy * s * 0.7)}L${f(x + k * nx * s * 1.2 - ux * s * 0.7)} ${f(y + k * ny * s * 1.2 - uy * s * 0.7)}Z`;
    return [tri(1), tri(-1)];
  }

  // ---------------- CAR ----------------
  L.car = {
    name: ['Car', 'Auto'], emoji: '🚗', level: 1, cat: 'things',
    steps: [
      { t: ['Draw a long box with two bumps for the wheels.', 'Dessine une longue boîte avec deux bosses pour les roues.'],
        d: ['M340 450H860Q910 450 910 500V610Q910 660 860 660H820A90 90 0 0 0 640 660H560A90 90 0 0 0 380 660H340Q290 660 290 610V500Q290 450 340 450Z'] },
      { t: ['Add the roof on top.', 'Ajoute le toit sur le dessus.'], d: ['M400 450L470 325Q480 305 505 305L680 305Q705 305 720 325L800 450'] },
      { t: ['Draw two windows.', 'Dessine deux fenêtres.'], d: ['M440 435L490 335Q495 325 507 325L585 325L585 435Z', 'M615 435L615 325L675 325Q690 325 698 337L765 435Z'] },
      { t: ['Add two round wheels.', 'Ajoute deux roues bien rondes.'], d: [circ(470, 662, 66), circ(470, 662, 22), circ(730, 662, 66), circ(730, 662, 22)] },
      { t: ['Give your car a happy face and a light!', 'Donne à ton auto un beau sourire et une lumière!'],
        d: [[ell(565, 512, 13, 17), 'k'], [ell(635, 512, 13, 17), 'k'], 'M580 548Q600 566 620 548', ell(532, 550, 15, 9), ell(668, 550, 15, 9), ell(880, 520, 12, 20)] }
    ],
    colors: [[350, 600, '#FF6FB5'], [600, 380, '#FF6FB5'], [530, 400, '#BDE7FF'], [680, 400, '#BDE7FF'],
      [470, 610, '#4A4A5A'], [730, 610, '#4A4A5A'], [470, 662, '#E8E8F0'], [730, 662, '#E8E8F0'], [532, 550, '#E63946'], [668, 550, '#E63946'], [880, 520, '#FFD23F']]
  };

  // ---------------- AIRPLANE ----------------
  const AE = [600, 470, 320, 100];
  const ap = (a) => P(AE[0], AE[1], AE[2], AE[3], a);
  const stripeX = f(320 * Math.sqrt(1 - 0.16));
  L.airplane = {
    name: ['Airplane', 'Avion'], emoji: '✈️', level: 2, cat: 'things',
    steps: [
      { t: ['Draw a long oval for the plane.', 'Dessine un long ovale pour l’avion.'], d: [ell(600, 470, 320, 100)] },
      { t: ['Add the tail at the back.', 'Ajoute la queue à l’arrière.'], d: [`M${ap(192)}L272 282Q270 258 296 262L338 270Q358 274 368 296L${ap(232)}`] },
      { t: ['Draw two big wings.', 'Dessine deux grandes ailes.'],
        d: [`M${ap(-75)}L548 255Q532 240 512 250L${ap(-115)}`, `M${ap(75)}L548 685Q532 700 512 690L${ap(115)}`] },
      { t: ['Add round windows and the front window.', 'Ajoute des hublots ronds et la fenêtre du pilote.'],
        d: [circ(430, 450, 20), circ(500, 450, 20), circ(570, 450, 20), circ(640, 450, 20), circ(710, 450, 20), 'M770 425L830 425Q858 435 872 462L770 462Z'] },
      { t: ['Draw a stripe along the plane.', 'Dessine une ligne tout le long de l’avion.'], d: [`M${f(600 - stripeX)} 510L${f(600 + stripeX)} 510`] },
      { t: ['Zoom! Add fluffy clouds.', 'Zoum! Ajoute des nuages tout doux.'], d: [cloud(900, 200, 65), cloud(300, 740, 60), cloud(930, 680, 45)] }
    ],
    colors: [[600, 400, '#FFFFFF'], [400, 480, '#F1F1F7'], [600, 540, '#3A6EE8'], [320, 330, '#FF6FB5'], [560, 310, '#FF6FB5'], [560, 630, '#FF6FB5'],
      [430, 450, '#BDE7FF'], [500, 450, '#BDE7FF'], [570, 450, '#BDE7FF'], [640, 450, '#BDE7FF'], [710, 450, '#BDE7FF'], [810, 445, '#BDE7FF'],
      [900, 200, '#E3F2FD'], [300, 740, '#E3F2FD'], [930, 680, '#E3F2FD']]
  };

  // ---------------- HOT AIR BALLOON ----------------
  L.hotAirBalloon = {
    name: ['Hot air balloon', 'Montgolfière'], emoji: '🎈', level: 2, cat: 'things',
    steps: [
      { t: ['Draw a big balloon shape.', 'Dessine un gros ballon.'], d: ['M530 570C350 470 370 120 600 120C830 120 850 470 670 570Z'] },
      { t: ['Draw curvy stripes from the top.', 'Dessine des lignes courbes à partir du haut.'], d: ['M600 120C470 170 470 450 565 570', 'M600 120L600 570', 'M600 120C730 170 730 450 635 570'] },
      { t: ['Add four ropes going down.', 'Ajoute quatre cordes qui descendent.'], d: ['M530 570L540 680', 'M565 570L580 680', 'M635 570L620 680', 'M670 570L660 680'] },
      { t: ['Draw the basket.', 'Dessine le panier.'], d: [rr(525, 680, 150, 30, 12), 'M540 710L556 800L644 800L660 710'] },
      { t: ['Add lines on the basket.', 'Ajoute des lignes sur le panier.'], d: ['M580 710L586 800', 'M620 710L614 800', 'M548 755L652 755'] },
      { t: ['Add clouds and little birds.', 'Ajoute des nuages et des petits oiseaux.'], d: [cloud(270, 300, 70), cloud(940, 460, 60), cloud(290, 680, 50), 'M830 200Q850 180 870 200Q890 180 910 200', 'M900 270Q915 255 930 270Q945 255 960 270'] }
    ],
    colors: [[470, 330, '#FF6FB5'], [560, 330, '#FFD23F'], [640, 330, '#FF6FB5'], [730, 330, '#FFD23F'], [600, 695, '#A0522D'],
      ['grid', 545, 715, 655, 795, 14, '#E0A458'], [270, 300, '#E3F2FD'], [940, 460, '#E3F2FD'], [290, 680, '#E3F2FD']]
  };

  // ---------------- HOUSE ----------------
  const roofY = (x) => f(230 + (x - 600) * 240 / 260);
  L.house = {
    name: ['House', 'Maison'], emoji: '🏠', level: 1, cat: 'things',
    steps: [
      { t: ['Draw a big square.', 'Dessine un gros carré.'], d: ['M380 470L380 800L820 800L820 470Z'] },
      { t: ['Put a pointy roof on top.', 'Mets un toit pointu par-dessus.'], d: ['M380 470L340 470L600 230L860 470L820 470'] },
      { t: ['Draw a round door.', 'Dessine une porte arrondie.'], d: ['M545 800L545 670Q545 615 600 615Q655 615 655 670L655 800', [circ(635, 715, 9), 'k']] },
      { t: ['Add two windows.', 'Ajoute deux fenêtres.'], d: [rr(420, 530, 100, 90, 12), 'M470 530L470 620', 'M420 575L520 575', rr(680, 530, 100, 90, 12), 'M730 530L730 620', 'M680 575L780 575'] },
      { t: ['Add a chimney and a round window.', 'Ajoute une cheminée et une fenêtre ronde.'], d: [`M720 ${roofY(720)}L720 260L780 260L780 ${roofY(780)}`, circ(600, 370, 40)] }
    ],
    colors: [[450, 720, '#FFD6E8'], [480, 430, '#E63946'], [750, 320, '#A0522D'], [600, 370, '#FFD23F'], [600, 720, '#9B5DE5'],
      [445, 552, '#BDE7FF'], [495, 552, '#BDE7FF'], [445, 598, '#BDE7FF'], [495, 598, '#BDE7FF'],
      [705, 552, '#BDE7FF'], [755, 552, '#BDE7FF'], [705, 598, '#BDE7FF'], [755, 598, '#BDE7FF']]
  };

  // ---------------- APPLE TREE ----------------
  const crownAngles = [100];
  for (let i = 1; i <= 9; i++) crownAngles.push(100 + i * 340 / 9);
  crownAngles.push(460);
  const apples = [[470, 300], [610, 245], [730, 330], [520, 430], [660, 440], [390, 410]];
  L.tree = {
    name: ['Apple tree', 'Pommier'], emoji: '🌳', level: 1, cat: 'things',
    steps: [
      { t: ['Draw a big fluffy cloud shape.', 'Dessine un gros nuage tout bouffant.'], d: [bumpy(600, 350, 260, 200, crownAngles)] },
      { t: ['Draw the trunk and the ground.', 'Dessine le tronc et le sol.'], d: [`M${P(600, 350, 260, 200, 100)}Q548 700 515 800`, `M${P(600, 350, 260, 200, 80)}Q652 700 685 800`, 'M360 800L840 800'] },
      { t: ['Add yummy apples.', 'Ajoute des belles pommes.'], d: apples.map(([x, y]) => circ(x, y, 26)).concat(apples.map(([x, y]) => `M${x} ${y - 26}Q${x + 3} ${y - 40} ${x + 12} ${y - 46}`)) },
      { t: ['Add a hole in the trunk and some grass.', 'Ajoute un trou dans le tronc et du gazon.'], d: [ell(610, 690, 13, 20), 'M400 800L410 776L420 800L430 770L440 800', 'M720 800L730 776L740 800L750 770L760 800'] },
      { t: ['One apple fell down!', 'Une pomme est tombée!'], d: [circ(800, 772, 26), 'M800 746Q803 732 812 726'] }
    ],
    colors: [[600, 200, '#5CC85C'], [600, 620, '#A0522D'], [610, 690, '#5A3215'], [800, 772, '#E63946']].concat(apples.map(([x, y]) => [x, y, '#E63946']))
  };

  // ---------------- UMBRELLA ----------------
  const drops = [[230, 250], [340, 110], [960, 250], [860, 105], [220, 560], [975, 560], [300, 730], [900, 720]];
  L.umbrella = {
    name: ['Umbrella', 'Parapluie'], emoji: '☂️', level: 2, cat: 'things',
    steps: [
      { t: ['Draw a big round dome.', 'Dessine un grand dôme rond.'], d: ['M300 470C300 250 440 180 600 180C760 180 900 250 900 470'] },
      { t: ['Close it with four little bumps.', 'Ferme-le avec quatre petites bosses.'], d: ['M900 470A75 40 0 0 0 750 470A75 40 0 0 0 600 470A75 40 0 0 0 450 470A75 40 0 0 0 300 470'] },
      { t: ['Draw lines from the top to each point.', 'Dessine des lignes du haut jusqu’à chaque pointe.'], d: ['M600 180Q500 260 450 470', 'M600 180L600 470', 'M600 180Q700 260 750 470', 'M600 180L600 142', [circ(600, 132, 11), 'k']] },
      { t: ['Add a long handle like a J.', 'Ajoute une longue poignée comme un J.'], d: ['M600 470L600 730Q600 780 645 780Q690 780 690 740'] },
      { t: ['Draw raindrops all around.', 'Dessine des gouttes de pluie tout autour.'], d: drops.map(([x, y]) => drop(x, y, 18)) },
      { t: ['Splash! Add a puddle.', 'Splash! Ajoute une flaque d’eau.'], d: [ell(620, 830, 180, 22)] }
    ],
    colors: [[380, 380, '#FF6FB5'], [540, 350, '#FFC2DD'], [660, 350, '#FF6FB5'], [820, 380, '#FFC2DD'], [620, 830, '#BDE7FF']].concat(drops.map(([x, y]) => [x, y + 5, '#4CC9F0']))
  };

  // ---------------- KITE ----------------
  const kp1 = [600, 540], kc1 = [530, 600], kc2 = [670, 640], kp2 = [600, 700], kc3 = [530, 760], kc4 = [660, 800], kp3 = [610, 855];
  const bezT = (p0, p1, p2, p3) => [p3[0] + p2[0] - p1[0] - p0[0], p3[1] + p2[1] - p1[1] - p0[1]]; // direction at t=0.5
  const kb = [[bez(kp1, kc1, kc2, kp2, 0.5), bezT(kp1, kc1, kc2, kp2)], [bez(kp2, kc3, kc4, kp3, 0.5), bezT(kp2, kc3, kc4, kp3)]];
  const bowSeeds = (b, col) => { const [[x, y], [tx, ty]] = b, l = Math.hypot(tx, ty), nx = -ty / l * 34, ny = tx / l * 34; return [[f(x + nx), f(y + ny), col], [f(x - nx), f(y - ny), col]]; };
  L.kite = {
    name: ['Kite', 'Cerf-volant'], emoji: '🎏', level: 1, cat: 'things',
    steps: [
      { t: ['Draw a big diamond.', 'Dessine un gros losange.'], d: ['M600 90L775 290L600 540L425 290Z'] },
      { t: ['Draw a cross inside.', 'Dessine une croix à l’intérieur.'], d: ['M600 90L600 540', 'M425 290L775 290'] },
      { t: ['Add a wiggly tail.', 'Ajoute une queue toute ondulée.'], d: [`M${S(kp1)}C${S(kc1)} ${S(kc2)} ${S(kp2)}C${S(kc3)} ${S(kc4)} ${S(kp3)}`] },
      { t: ['Put two bows on the tail.', 'Mets deux boucles sur la queue.'], d: bow(kb[0][0][0], kb[0][0][1], kb[0][1][0], kb[0][1][1], 42).concat(bow(kb[1][0][0], kb[1][0][1], kb[1][1][0], kb[1][1][1], 42)) },
      { t: ['Add clouds in the sky.', 'Ajoute des nuages dans le ciel.'], d: [cloud(270, 230, 70), cloud(930, 420, 60), cloud(290, 600, 45)] }
    ],
    colors: [[540, 240, '#FF6FB5'], [660, 240, '#FFD23F'], [540, 350, '#4CC9F0'], [660, 350, '#9B5DE5']]
      .concat(bowSeeds(kb[0], '#FF6FB5'), bowSeeds(kb[1], '#FFD23F'), [[270, 230, '#E3F2FD'], [930, 420, '#E3F2FD'], [290, 600, '#E3F2FD']])
  };

  // ---------------- ROBOT ----------------
  L.robot = {
    name: ['Robot', 'Robot'], emoji: '🤖', level: 2, cat: 'things',
    steps: [
      { t: ['Draw a big square head.', 'Dessine une grosse tête carrée.'], d: [rr(440, 170, 320, 240, 50)] },
      { t: ['Add a little neck and a body.', 'Ajoute un petit cou et un corps.'], d: ['M565 410L565 440', 'M635 410L635 440', rr(460, 440, 280, 230, 36)] },
      { t: ['Give it a cute face!', 'Donne-lui une face toute mignonne!'], d: [[ell(540, 285, 24, 30), 'k'], [ell(660, 285, 24, 30), 'k'], 'M570 345Q600 370 630 345', ell(495, 340, 20, 12), ell(705, 340, 20, 12)] },
      { t: ['Add an antenna and two ears.', 'Ajoute une antenne et deux oreilles.'], d: ['M600 170L600 112', circ(600, 92, 20), 'M440 255L412 255Q402 255 402 265L402 315Q402 325 412 325L440 325', 'M760 255L788 255Q798 255 798 265L798 315Q798 325 788 325L760 325'] },
      { t: ['Draw two arms.', 'Dessine deux bras.'], d: ['M460 490L410 490Q378 490 378 522L378 600A22 22 0 0 0 422 600L422 545Q422 535 432 535L460 535', 'M740 490L790 490Q822 490 822 522L822 600A22 22 0 0 1 778 600L778 545Q778 535 768 535L740 535'] },
      { t: ['Draw a screen with a heart and three buttons.', 'Dessine un écran avec un cœur et trois boutons.'], d: [rr(530, 478, 140, 100, 18), heart(600, 522, 28), circ(560, 622, 13), circ(600, 622, 13), circ(640, 622, 13)] },
      { t: ['Add legs and feet.', 'Ajoute les jambes et les pieds.'], d: ['M525 670L525 730', 'M565 670L565 730', rr(500, 730, 90, 44, 20), 'M635 670L635 730', 'M675 670L675 730', rr(610, 730, 90, 44, 20)] }
    ],
    colors: [[600, 210, '#8EC5FF'], [490, 640, '#8EC5FF'], [600, 425, '#C9D3E0'], [495, 340, '#FF9EB5'], [705, 340, '#FF9EB5'], [600, 92, '#FF6FB5'],
      [420, 290, '#FFD23F'], [780, 290, '#FFD23F'], [400, 560, '#8EC5FF'], [800, 560, '#8EC5FF'], [550, 500, '#FFD23F'], [600, 530, '#FF6FB5'],
      [560, 622, '#E63946'], [600, 622, '#3A6EE8'], [640, 622, '#5CC85C'], [545, 700, '#C9D3E0'], [655, 700, '#C9D3E0'], [545, 752, '#9B5DE5'], [655, 752, '#9B5DE5']]
  };

  // ---------------- SNOWMAN ----------------
  L.snowman = {
    name: ['Snowman', 'Bonhomme de neige'], emoji: '⛄', level: 1, cat: 'things',
    steps: [
      { t: ['Draw a big snowball.', 'Dessine une grosse boule de neige.'], d: [circ(600, 680, 170)] },
      { t: ['Add a smaller snowball for the head.', 'Ajoute une plus petite boule pour la tête.'], d: ['M554.2 516.3A125 125 0 1 1 645.8 516.3'] },
      { t: ['Draw eyes, a carrot nose and a smile.', 'Dessine les yeux, un nez en carotte et un sourire.'],
        d: [[circ(555, 378, 13), 'k'], [circ(645, 378, 13), 'k'], 'M598 410L685 430L598 440Z', [circ(550, 462, 7), 'k'], [circ(574, 476, 7), 'k'], [circ(600, 481, 7), 'k'], [circ(626, 476, 7), 'k'], [circ(650, 462, 7), 'k']] },
      { t: ['Put a tall hat on his head.', 'Mets-lui un grand chapeau sur la tête.'], d: [rr(500, 247, 200, 28, 12), 'M530 247L542 140Q543 130 553 130L647 130Q657 130 658 140L670 247', 'M534.1 210L665.9 210'] },
      { t: ['Add stick arms and buttons.', 'Ajoute des bras en branches et des boutons.'],
        d: [`M${P(600, 680, 170, 170, -150)}L330 505`, 'M330 505L308 470', 'M330 505L290 502', `M${P(600, 680, 170, 170, -30)}L870 505`, 'M870 505L892 470', 'M870 505L910 502',
          [circ(600, 600, 13), 'k'], [circ(600, 668, 13), 'k'], [circ(600, 736, 13), 'k']] }
    ],
    colors: [[600, 790, '#EAF6FF'], [600, 320, '#EAF6FF'], [620, 425, '#FF8C42'], [600, 170, '#3A6EE8'], [600, 228, '#FF6FB5'], [600, 261, '#3A6EE8']]
  };

  // ---------------- BICYCLE ----------------
  const BR = [360, 640], BF = [840, 640], WR = 140, HUB = 16;
  const at = (c, r, a) => [f(c[0] + r * Math.cos(R(a))), f(c[1] + r * Math.sin(R(a)))];
  const bS = at(BR, 260, -57), bB = at(BR, 220, 3), bT = [755, 410], bHd = [775, 470];
  const forkA = Math.atan2(bHd[1] - BF[1], bHd[0] - BF[0]) * 180 / Math.PI;
  const spokes = (c, a0) => [0, 1, 2, 3, 4, 5].map((k) => `M${S(at(c, HUB, a0 + k * 60))}L${S(at(c, WR, a0 + k * 60))}`);
  const tTop = (x) => f(410 - (x - 755) * 12 / 135);
  const flowers = [[788, 352], [835, 338], [878, 356]];
  L.bicycle = {
    name: ['Bicycle', 'Vélo'], emoji: '🚲', level: 3, cat: 'things',
    steps: [
      { t: ['Draw two big round wheels.', 'Dessine deux grosses roues rondes.'], d: [circ(BR[0], BR[1], WR), circ(BF[0], BF[1], WR)] },
      { t: ['Add a little circle and spokes in each wheel.', 'Ajoute un petit rond et des rayons dans chaque roue.'], d: [circ(BR[0], BR[1], HUB), circ(BF[0], BF[1], HUB)].concat(spokes(BR, -57), spokes(BF, forkA)) },
      { t: ['Draw the frame: a shape with four corners.', 'Dessine le cadre : une forme à quatre coins.'], d: [`M${S(bS)}L${S(bT)}L${S(bHd)}L${S(bB)}Z`] },
      { t: ['Connect the frame to the back wheel.', 'Attache le cadre à la roue arrière.'], d: [`M${S(bS)}L${S(at(BR, WR, -57))}`, `M${S(bB)}L${S(at(BR, WR, 3))}`] },
      { t: ['Draw the fork and the handlebars.', 'Dessine la fourche et le guidon.'], d: [`M${S(bHd)}L${S(at(BF, WR, forkA))}`, 'M755 410L742 370', 'M742 370C725 352 700 345 672 352', [circ(668, 353, 11), 'k']] },
      { t: ['Add a comfy seat.', 'Ajoute un siège confortable.'], d: [`M${S(bS)}L485.7 375`, 'M420 365Q480 340 545 355Q555 375 530 375L440 375Q418 375 420 365Z'] },
      { t: ['Add a pedal.', 'Ajoute une pédale.'], d: [[circ(bB[0], bB[1], 14), 'k'], `M${S(bB)}L612 715`, rr(587, 715, 52, 16, 7)] },
      { t: ['Put a basket of flowers in front!', 'Mets un panier de fleurs à l’avant!'],
        d: ['M755 410L890 398L875 470L775 470', `M805 ${tTop(805)}L805 470`, `M845 ${tTop(845)}L845 470`]
          .concat(flowers.map(([x, y]) => circ(x, y, 21)), flowers.map(([x, y]) => [circ(x, y, 7), 'k']), flowers.map(([x, y]) => `M${x} ${y + 21}L${x} ${tTop(x)}`)) }
    ],
    colors: [[652, 488, '#FF6FB5'], [525, 560, '#FF6FB5'], [430, 368, '#9B5DE5'], [613, 723, '#4A4A5A'], [BR[0], BR[1], '#FFD23F'], [BF[0], BF[1], '#FFD23F'],
      [785, 440, '#E0A458'], [825, 440, '#E0A458'], [862, 440, '#E0A458']]
      .concat([0, 1, 2, 3, 4, 5].map((k) => at(BR, 80, -27 + k * 60).concat('#E8E8F0')), [0, 1, 2, 3, 4, 5].map((k) => at(BF, 80, forkA + 30 + k * 60).concat('#E8E8F0')),
        flowers.map(([x, y], i) => [x + 14, y, ['#FF6FB5', '#FFD23F', '#FF6FB5'][i]]))
  };

  // ---------------- SUN ----------------
  const SC = [600, 450], SR = 180;
  const bigRays = [0, 45, 90, 135, 180, 225, 270, 315];
  const smallRays = bigRays.map((a) => a + 22.5);
  L.sun = {
    name: ['Sun', 'Soleil'], emoji: '🌞', level: 1, cat: 'things',
    steps: [
      { t: ['Draw a big circle.', 'Dessine un gros cercle.'], d: [circ(SC[0], SC[1], SR)] },
      { t: ['Add two big shiny eyes.', 'Ajoute deux grands yeux brillants.'], d: [[ell(535, 420, 20, 26), 'k'], [ell(665, 420, 20, 26), 'k']] },
      { t: ['Draw a big smile and rosy cheeks.', 'Dessine un grand sourire et des joues roses.'], d: ['M555 490Q600 535 645 490', ell(495, 482, 24, 14), ell(705, 482, 24, 14)] },
      { t: ['Add pointy rays all around.', 'Ajoute des rayons pointus tout autour.'], d: bigRays.map((a) => `M${S(at(SC, SR, a - 12))}L${S(at(SC, 300, a))}L${S(at(SC, SR, a + 12))}`) },
      { t: ['Add round rays in between.', 'Ajoute des rayons ronds entre les autres.'], d: smallRays.map((a) => `M${S(at(SC, SR, a - 8))}C${S(at(SC, 285, a - 9))} ${S(at(SC, 285, a + 9))} ${S(at(SC, SR, a + 8))}`) }
    ],
    colors: [[600, 600, '#FFD23F'], [495, 482, '#FF9EB5'], [705, 482, '#FF9EB5']].concat(bigRays.map((a) => at(SC, 225, a).concat('#FF8C42')), smallRays.map((a) => at(SC, 205, a).concat('#FFB703')))
  };

  // ---------------- TEAPOT ----------------
  const TE = [480, 570, 185, 150];
  const tp = (a) => P(TE[0], TE[1], TE[2], TE[3], a);
  const c0 = [890, 765], c1 = [935, 765], c2 = [975, 730], c3 = [975, 640];
  const ch1 = bez(c0, c1, c2, c3, 0.85), ch2 = bez(c0, c1, c2, c3, 0.45);
  L.teapot = {
    name: ['Teapot', 'Théière'], emoji: '☕', level: 3, cat: 'things',
    steps: [
      { t: ['Draw a big round belly.', 'Dessine un gros ventre tout rond.'], d: [ell(480, 570, 185, 150)] },
      { t: ['Add the lid and a little knob.', 'Ajoute le couvercle et une petite poignée.'], d: [`M${tp(-125)}C385 375 575 375 ${tp(-55)}`, circ(480, 373, 20)] },
      { t: ['Draw the spout.', 'Dessine le bec verseur.'], d: [`M${tp(160)}C240 625 195 540 175 445L210 435C225 490 250 530 ${tp(195)}`] },
      { t: ['Add a round handle.', 'Ajoute une anse bien ronde.'], d: [`M${tp(-25)}C760 460 790 660 ${tp(25)}`, `M${tp(-10)}C715 530 720 615 ${tp(12)}`] },
      { t: ['Give it a little foot.', 'Donne-lui un petit pied.'], d: [`M${tp(112)}L400 755L560 755L${tp(68)}`] },
      { t: ['Draw a sweet face!', 'Dessine une face toute douce!'], d: [[ell(430, 575, 15, 19), 'k'], [ell(530, 575, 15, 19), 'k'], 'M462 610Q480 628 498 610', ell(400, 612, 18, 11), ell(560, 612, 18, 11)] },
      { t: ['Draw a teacup on a plate.', 'Dessine une tasse sur une soucoupe.'], d: [ell(890, 640, 85, 20), `M805 640C805 730 845 765 ${S(c0)}C${S(c1)} ${S(c2)} ${S(c3)}`, `M${S(ch1)}C1035 ${f(ch1[1] - 15)} 1040 ${f(ch2[1] + 5)} ${S(ch2)}`, ell(890, 787, 125, 22)] },
      { t: ['Add steam and a little heart.', 'Ajoute de la vapeur et un petit cœur.'], d: ['M860 600C845 580 875 565 860 545', 'M920 600C905 580 935 565 920 545', heart(890, 485, 28)] }
    ],
    colors: [[480, 680, '#FF9EC4'], [480, 410, '#FFD23F'], [480, 373, '#FF6FB5'], [250, 540, '#FF9EC4'], [740, 560, '#FF9EC4'], [480, 735, '#FFD23F'],
      [400, 612, '#FF4D8D'], [560, 612, '#FF4D8D'], [890, 700, '#BDE7FF'], [890, 640, '#C68B59'], [890, 795, '#FFD23F'], [890, 490, '#FF6FB5']]
  };
})();
