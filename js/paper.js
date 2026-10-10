/* =========================================================
   draw4fun — "Draw together" library (step-by-step drawings to copy on paper)
   Each drawing: { name:[en,fr], emoji, level 1-3, cat:'horses'|'animals'|'fun',
                   steps:[{ t:[en,fr], d:[ path | [path,'k'] ] }],
                   colors:[[x,y,'#hex'] ...]  // where to pour paint for the "color idea" }
   Space is 1200 x 900. [path,'k'] = filled in (eyes, dots).
   To add a drawing: copy one block below and change the paths & words.
   ========================================================= */
(function () {
  'use strict';
  const H = window.ART.helpers, ell = H.ell, circ = H.circ, rr = H.rr, star = H.starD;
  const f = (n) => Math.round(n * 10) / 10;
  function petal(cx, cy, r, a, len) {
    const P = (rad, deg) => `${f(cx + rad * Math.cos(deg * Math.PI / 180))} ${f(cy + rad * Math.sin(deg * Math.PI / 180))}`;
    return `M${P(r, a - 22)}C${P(r + len * 0.55, a - 42)} ${P(r + len * 1.05, a - 20)} ${P(r + len, a)}C${P(r + len * 1.05, a + 20)} ${P(r + len * 0.55, a + 42)} ${P(r, a + 22)}`;
  }

  const L = {};

  // ---------------- HORSES ----------------
  L.ponyHead = {
    name: ['Pony', 'Poney'], emoji: '🐴', level: 2, cat: 'horses',
    steps: [
      { t: ['Draw a big circle for the head.', 'Dessine un gros cercle pour la tête.'], d: [circ(560, 360, 140)] },
      { t: ['Add a long nose.', 'Ajoute un long museau.'], d: ['M692 408C800 400 862 480 822 542C782 602 622 592 545 499'] },
      { t: ['Draw two pointy ears.', 'Dessine deux oreilles pointues.'], d: ['M480 245L462 135L536 222', 'M592 224L622 110L640 246'] },
      { t: ['Draw the neck.', 'Dessine le cou.'], d: ['M440 432C410 560 415 690 430 790', 'M648 567C665 650 675 730 680 790', 'M400 790Q555 806 710 790'] },
      { t: ['Give her a wavy mane!', 'Donne-lui une crinière toute frisée!'], d: ['M536 222C505 272 560 300 592 224', 'M434 300C390 318 402 380 365 420C408 432 388 500 350 542C398 552 390 622 360 672C405 676 418 735 412 792'] },
      { t: ['Draw a big eye, a nostril and a smile.', 'Dessine un gros œil, une narine et un sourire.'], d: [[ell(600, 335, 22, 28), 'k'], 'M584 305L572 290M598 302L596 286M612 306L620 292', [ell(790, 482, 12, 8), 'k'], 'M720 548Q760 566 798 540'] }
    ],
    colors: [[500, 380, '#C98B5A'], [740, 490, '#EBC9A4'], [540, 660, '#C98B5A'], [482, 205, '#C98B5A'], [615, 190, '#C98B5A'], [402, 600, '#6B4226'], [560, 248, '#6B4226']]
  };
  L.unicornHead = {
    name: ['Unicorn', 'Licorne'], emoji: '🦄', level: 3, cat: 'horses',
    steps: [
      L.ponyHead.steps[0], L.ponyHead.steps[1], L.ponyHead.steps[2],
      { t: ['Add a magic horn!', 'Ajoute une corne magique!'], d: ['M545 222L567 80L590 224', 'M552 180L582 180M557 140L576 140M562 110L571 110'] },
      L.ponyHead.steps[3],
      { t: ['Give her a flowing mane!', 'Donne-lui une longue crinière!'], d: ['M434 300C390 318 402 380 365 420C408 432 388 500 350 542C398 552 390 622 360 672C405 676 418 735 412 792', 'M398 384Q412 390 427 392', 'M390 488Q410 492 430 490', 'M383 604Q402 606 421 603'] },
      { t: ['Draw her eye with lashes, a nostril and a smile.', 'Dessine son œil avec des cils, une narine et un sourire.'], d: L.ponyHead.steps[5].d },
      { t: ['Add a little star for magic!', 'Ajoute une petite étoile magique!'], d: [star(860, 230, 46, 20)] }
    ],
    colors: [[500, 380, '#F7F3FF'], [740, 490, '#FFE4F1'], [540, 660, '#F7F3FF'], [482, 205, '#F7F3FF'], [615, 190, '#F7F3FF'], [567, 200, '#FFD23F'], [567, 160, '#FFC93C'], [567, 125, '#FFD23F'],
      [408, 350, '#FF6B6B'], [412, 440, '#FFB703'], [398, 550, '#8AC926'], [410, 700, '#4CC9F0'], [860, 232, '#FFD23F']]
  };

  L.horse = {
    name: ['Horse', 'Cheval'], emoji: '🐎', level: 3, cat: 'horses',
    steps: [
      { t: ['Draw a big oval for the body.', 'Dessine un gros ovale pour le corps.'], d: [ell(530, 470, 230, 125)] },
      { t: ['Draw the head up high, like a bean.', 'Dessine la tête en haut, comme un haricot.'], d: ['M790 200C800 150 870 130 910 170C950 210 990 260 990 300C990 345 940 355 900 340C870 330 850 320 820 300C790 280 780 240 790 200Z'] },
      { t: ['Join the head and body with two lines.', 'Relie la tête et le corps avec deux lignes.'], d: ['M793 222C730 250 660 300 625 356', 'M842 314C800 350 760 380 738 412'] },
      { t: ['Add two pointy ears.', 'Ajoute deux oreilles pointues.'], d: ['M808 172Q800 112 826 92Q846 124 848 152', 'M858 150Q862 100 884 86Q894 124 892 160'] },
      { t: ['Draw four long legs with hooves.', 'Dessine quatre longues pattes avec des sabots.'], d: ['M360 556L360 740L406 740L406 576', 'M440 585L440 740L486 740L486 592', 'M600 589L600 740L646 740L646 578', 'M680 565L680 740L726 740L726 535', 'M360 712L406 712M440 712L486 712M600 712L646 712M680 712L726 712'] },
      { t: ['Give her a bumpy mane!', 'Donne-lui une crinière toute bosselée!'], d: ['M790 200Q770 168 745 195Q713 190 712 225Q680 222 672 258Q640 260 636 295Q604 300 604 335L600 351'] },
      { t: ['Swish! Draw a long tail.', 'Fouette! Dessine une longue queue.'], d: ['M303 440C240 420 200 480 215 545C225 600 195 645 232 690C252 640 272 610 280 560C285 520 296 495 304 490'] },
      { t: ['Draw an eye, a nostril and a smile.', 'Dessine un œil, une narine et un sourire.'], d: [[circ(872, 212, 14), 'k'], [ell(960, 300, 8, 6, 20), 'k'], 'M918 334Q945 347 970 328'] }
    ],
    colors: [[530, 470, '#C98B5A'], [900, 260, '#C98B5A'], [745, 320, '#C98B5A'], [383, 650, '#C98B5A'], [463, 650, '#C98B5A'], [623, 650, '#C98B5A'], [703, 650, '#C98B5A'],
      [383, 727, '#5A3A2A'], [463, 727, '#5A3A2A'], [623, 727, '#5A3A2A'], [703, 727, '#5A3A2A'], [750, 205, '#FFE08A'], [715, 240, '#FFE08A'], [676, 270, '#FFE08A'], [650, 300, '#FFE08A'], [622, 330, '#FFE08A'], [826, 130, '#C98B5A'], [874, 125, '#C98B5A'], [245, 560, '#FFE08A']]
  };
  L.seahorse = {
    name: ['Seahorse', 'Hippocampe'], emoji: '🌊', level: 2, cat: 'horses',
    steps: [
      { t: ['Draw a circle for the head.', 'Dessine un cercle pour la tête.'], d: [circ(620, 240, 80)] },
      { t: ['Add a long snout, like a straw.', 'Ajoute un long museau, comme une paille.'], d: ['M692 206L800 212C824 214 824 254 800 256L695 267'] },
      { t: ['Draw a round belly under the head.', 'Dessine un ventre tout rond sous la tête.'], d: ['M574 306C510 370 500 470 540 560C570 620 650 620 668 560C688 500 655 450 676 390C690 345 680 312 660 309'] },
      { t: ['Curl the tail like a snail shell.', "Enroule la queue comme une coquille d'escargot."], d: ['M556 590C536 660 568 730 640 730C700 730 720 670 680 650C650 636 630 670 655 680'] },
      { t: ['Add a little fin on the back.', 'Ajoute une petite nageoire sur le dos.'], d: ['M514 420C458 400 444 470 476 500C458 526 490 556 530 540'] },
      { t: ['Draw spikes on the head.', 'Dessine des pointes sur la tête.'], d: ['M586 168L594 124L615 160', 'M626 160L646 114L660 170'] },
      { t: ['Add an eye, belly stripes and bubbles!', 'Ajoute un œil, des rayures et des bulles!'], d: [[circ(645, 228, 14), 'k'], 'M600 380Q635 392 664 380', 'M592 430Q630 442 662 432', 'M592 480Q628 492 660 484', circ(860, 170, 22), circ(900, 110, 14), circ(880, 60, 9)] }
    ],
    colors: [[600, 255, '#FFB46B'], [760, 234, '#FFB46B'], [555, 450, '#FFB46B'], [630, 410, '#FFD3A8'], [630, 460, '#FFD3A8'], [482, 470, '#FF6FB5'], [596, 150, '#FF6FB5'], [642, 148, '#FF6FB5']]
  };

  // ---------------- ANIMALS ----------------
  L.chick = {
    name: ['Chick', 'Poussin'], emoji: '🐥', level: 2, cat: 'animals',
    steps: [
      { t: ['Draw a big round head.', 'Dessine une grosse tête ronde.'], d: [ell(600, 330, 170, 160)] },
      { t: ['Add a round body under the head.', 'Ajoute un corps tout rond sous la tête.'], d: ['M515 469C430 520 430 720 600 740C770 720 770 520 685 469'] },
      { t: ['Draw two eyes and little eyebrows.', 'Dessine deux yeux et des petits sourcils.'], d: [[ell(530, 335, 17, 24), 'k'], [ell(670, 335, 17, 24), 'k'], 'M500 285Q528 272 555 287', 'M645 287Q672 272 700 285'] },
      { t: ['Draw a little beak.', 'Dessine un petit bec.'], d: ['M556 400Q600 362 644 400Q600 424 556 400Z', 'M572 408Q600 452 628 408', 'M590 431C572 465 598 482 600 462C602 482 628 465 610 431'] },
      { t: ['Add three feathers on top of the head.', 'Ajoute trois plumes sur le dessus de la tête.'], d: ['M578 172C520 140 528 80 572 100C590 112 594 150 590 171', 'M594 171C580 100 640 70 645 120C646 145 626 162 610 170', 'M614 171C650 130 705 140 690 168C680 182 650 180 628 172'] },
      { t: ['Draw two little wings.', 'Dessine deux petites ailes.'], d: ['M510 545C472 580 467 628 480 662L502 646L512 670L532 646Q544 600 518 550', 'M690 545C728 580 733 628 720 662L698 646L688 670L668 646Q656 600 682 550'] },
      { t: ['Give it two little feet.', 'Donne-lui deux petites pattes.'], d: ['M565 738L560 790M530 805L560 790L590 805M560 790L560 815', 'M635 738L640 790M610 805L640 790L670 805M640 790L640 815'] }
    ],
    colors: [[600, 230, '#FFE066'], [600, 690, '#FFD23F'], [600, 392, '#FF8C42'], [600, 416, '#FF8C42'], [600, 450, '#FF5A5A'], [566, 125, '#FF8C42'], [625, 118, '#FF8C42'], [665, 166, '#FF8C42'], [505, 610, '#FFB703'], [695, 610, '#FFB703']]
  };
  L.bunny = {
    name: ['Bunny in a basket', 'Lapin dans un panier'], emoji: '🐰', level: 2, cat: 'animals',
    steps: [
      { t: ['Draw a round head.', 'Dessine une tête ronde.'], d: [ell(600, 385, 150, 125)] },
      { t: ['Draw two long ears and a little tuft.', 'Dessine deux longues oreilles et une petite touffe.'], d: ['M515 285C455 185 445 75 495 62C545 58 572 175 562 264', 'M685 285C745 185 755 75 705 62C655 58 628 175 638 264', 'M530 252C500 180 498 110 510 100C528 104 545 180 545 252Z', 'M670 252C700 180 702 110 690 100C672 104 655 180 655 252Z', 'M580 262L590 238L600 258L612 235L620 262'] },
      { t: ['Draw eyes, a nose and a smile.', 'Dessine les yeux, le nez et un sourire.'], d: [[ell(545, 385, 22, 28), 'k'], [ell(655, 385, 22, 28), 'k'], 'M584 430L616 430L600 446Z', 'M600 446Q592 468 572 460', 'M600 446Q608 468 628 460'] },
      { t: ['Draw the top of the basket.', 'Dessine le haut du panier.'], d: [rr(405, 515, 390, 55, 27)] },
      { t: ['Draw the basket under it.', 'Dessine le panier en dessous.'], d: ['M428 570L470 805L730 805L772 570'] },
      { t: ['Add two little paws holding on.', "Ajoute deux petites pattes qui s'accrochent."], d: ['M515 530C512 488 568 486 568 525', 'M632 525C632 486 688 488 685 530', 'M532 500L532 515M550 498L550 513', 'M650 498L650 513M668 500L668 515'] },
      { t: ['Draw lines to make it look woven.', 'Dessine des lignes pour faire le tressage.'], d: ['M520 575L535 800', 'M600 575L600 802', 'M680 575L665 800', 'M445 655L755 655', 'M459 730L741 730'] }
    ],
    colors: [[600, 480, '#ECE6F6'], [480, 150, '#ECE6F6'], [720, 150, '#ECE6F6'], [522, 180, '#FFB8C8'], [678, 180, '#FFB8C8'], [600, 437, '#FF8FA8'],
      [450, 545, '#9C6644'], [600, 545, '#9C6644'], [750, 545, '#9C6644'], [540, 512, '#ECE6F6'], [660, 512, '#ECE6F6'],
      [480, 615, '#D4A373'], [560, 615, '#C98B5A'], [640, 615, '#D4A373'], [720, 615, '#C98B5A'], [490, 692, '#C98B5A'], [565, 692, '#D4A373'], [635, 692, '#C98B5A'], [710, 692, '#D4A373'], [500, 768, '#D4A373'], [565, 768, '#C98B5A'], [635, 768, '#D4A373'], [700, 768, '#C98B5A']]
  };
  L.swan = {
    name: ['Swan', 'Cygne'], emoji: '🦢', level: 3, cat: 'animals',
    steps: [
      { t: ['Draw a big boat shape for the body.', 'Dessine une grande forme de bateau pour le corps.'], d: ['M430 540C380 650 480 750 640 750C800 750 920 680 980 470C900 540 820 560 760 540'] },
      { t: ['Draw a long curvy neck, like the letter S.', 'Dessine un long cou tout courbé, comme la lettre S.'], d: ['M430 540C390 440 560 400 520 290C500 230 450 215 418 222', 'M510 525C480 440 640 400 590 265C560 170 450 140 406 165', 'M510 525C600 520 700 530 760 540'] },
      { t: ['Draw a small head and a pointy beak.', 'Dessine une petite tête et un bec pointu.'], d: [ell(372, 200, 50, 42), 'M325 214L268 262L347 236', [circ(380, 192, 8), 'k']] },
      { t: ['Draw a big feathery wing.', 'Dessine une grande aile avec des plumes.'], d: ['M560 575C600 480 760 460 862 525C822 545 800 562 772 565C800 595 760 625 720 612C740 652 680 672 640 652C600 652 560 625 560 575Z'] },
      { t: ['Add little waves in the water.', "Ajoute des petites vagues dans l'eau."], d: ['M280 800Q330 780 380 800T480 800T580 800T680 800T780 800T880 800T980 800'] }
    ],
    colors: [[310, 240, '#FF8C42'], [700, 700, '#F4F8FF'], [700, 560, '#DCE8FF'], [372, 215, '#F4F8FF'], [500, 400, '#F4F8FF']]
  };
  L.cat = {
    name: ['Kitty', 'Chaton'], emoji: '🐱', level: 1, cat: 'animals',
    steps: [
      { t: ['Draw a big round head.', 'Dessine une grosse tête ronde.'], d: [ell(600, 380, 190, 160)] },
      { t: ['Add two pointy ears.', 'Ajoute deux oreilles pointues.'], d: ['M452 282L440 140L548 226', 'M652 226L760 140L748 282'] },
      { t: ['Draw the eyes, nose and mouth.', 'Dessine les yeux, le nez et la bouche.'], d: [[ell(530, 380, 22, 28), 'k'], [ell(670, 380, 22, 28), 'k'], 'M584 432L616 432L600 450Z', 'M600 450Q588 478 566 468', 'M600 450Q612 478 634 468'] },
      { t: ['Add whiskers!', 'Ajoute des moustaches!'], d: ['M430 430L522 446', 'M432 474L522 466', 'M770 430L678 446', 'M768 474L678 466'] },
      { t: ['Draw the body and front paws.', 'Dessine le corps et les pattes avant.'], d: ['M488 509C430 600 430 760 485 795L715 795C770 760 770 600 712 509', 'M560 795L560 730', 'M640 795L640 730'] },
      { t: ['Swish! Add a curly tail.', 'Ajoute une queue toute bouclée.'], d: ['M760 760C880 760 905 640 848 598'] }
    ],
    colors: [[600, 290, '#FFB46B'], [470, 220, '#FFB46B'], [730, 220, '#FFB46B'], [600, 640, '#FFB46B'], [600, 438, '#FF8FA8']]
  };
  L.snail = {
    name: ['Snail', 'Escargot'], emoji: '🐌', level: 1, cat: 'animals',
    steps: [
      { t: ['Draw a big circle for the shell.', 'Dessine un gros cercle pour la coquille.'], d: [circ(560, 450, 170)] },
      { t: ['Draw a swirl inside, round and round!', "Dessine un tourbillon à l'intérieur!"], d: ['M540 450A20 20 0 1 1 580 450A50 50 0 1 1 480 450A85 85 0 1 1 650 450A120 120 0 1 1 410 450'] },
      { t: ['Draw the body under the shell.', 'Dessine le corps sous la coquille.'], d: ['M330 652C380 640 415 610 440 570', 'M330 652L860 652C912 652 912 600 872 590'] },
      { t: ['Add a head that pokes out.', 'Ajoute une tête qui sort.'], d: ['M872 590C905 500 862 420 802 430C752 440 712 500 690 560'] },
      { t: ['Draw two antennas.', 'Dessine deux antennes.'], d: ['M815 432L795 352', 'M848 438L868 358', circ(793, 340, 12), circ(870, 346, 12)] },
      { t: ['Draw a happy face.', 'Dessine un visage content.'], d: [[circ(820, 500, 10), 'k'], 'M822 545Q845 560 866 542'] }
    ],
    colors: [[600, 600, '#FF8FC0'], [600, 640, '#A6D96A'], [785, 470, '#A6D96A'], [793, 340, '#FFD23F'], [870, 346, '#FFD23F']]
  };
  L.butterfly = {
    name: ['Butterfly', 'Papillon'], emoji: '🦋', level: 2, cat: 'animals',
    steps: [
      { t: ['Draw a long oval for the body.', 'Dessine un long ovale pour le corps.'], d: [ell(600, 470, 28, 150)] },
      { t: ['Draw two big wings on top.', 'Dessine deux grandes ailes en haut.'], d: ['M575 400C500 250 300 200 300 330C300 430 450 470 572 455', 'M625 400C700 250 900 200 900 330C900 430 750 470 628 455'] },
      { t: ['Add two smaller wings below.', 'Ajoute deux plus petites ailes en bas.'], d: ['M572 480C450 485 360 565 400 645C440 705 540 645 576 548', 'M628 480C750 485 840 565 800 645C760 705 660 645 624 548'] },
      { t: ['Add two curly antennas.', 'Ajoute deux antennes.'], d: ['M590 323C570 260 535 232 512 222', 'M610 323C630 260 665 232 688 222', [circ(505, 218, 12), 'k'], [circ(695, 218, 12), 'k']] },
      { t: ['Decorate the wings with circles.', 'Décore les ailes avec des cercles.'], d: [circ(430, 335, 42), circ(770, 335, 42), circ(470, 590, 28), circ(730, 590, 28)] },
      { t: ['Give it a happy face.', 'Donne-lui un visage content.'], d: [[circ(589, 360, 5), 'k'], [circ(611, 360, 5), 'k'], 'M590 380Q600 390 610 380'] }
    ],
    colors: [[360, 330, '#FF6FB5'], [840, 330, '#FF6FB5'], [430, 335, '#FFD23F'], [770, 335, '#FFD23F'], [420, 630, '#8E5BE8'], [780, 630, '#8E5BE8'], [470, 590, '#4CC9F0'], [730, 590, '#4CC9F0'], [600, 520, '#9C6644']]
  };
  L.owl = {
    name: ['Owl', 'Hibou'], emoji: '🦉', level: 2, cat: 'animals',
    steps: [
      { t: ['Draw a big egg shape.', "Dessine une grosse forme d'œuf."], d: ['M455 300C440 205 760 205 745 300C790 450 780 680 600 700C420 680 410 450 455 300Z'] },
      { t: ['Add two pointy tufts on top.', 'Ajoute deux petites pointes en haut.'], d: ['M457 282L440 185L515 240', 'M685 240L760 185L743 282'] },
      { t: ['Draw two big round eyes.', 'Dessine deux gros yeux ronds.'], d: [circ(530, 335, 62), circ(670, 335, 62), [circ(540, 340, 24), 'k'], [circ(660, 340, 24), 'k']] },
      { t: ['Add a little beak.', 'Ajoute un petit bec.'], d: ['M578 395L622 395L600 440Z'] },
      { t: ['Draw the wings on each side.', 'Dessine les ailes de chaque côté.'], d: ['M437 420C500 470 510 560 462 610', 'M763 420C700 470 690 560 738 610'] },
      { t: ['Draw little feathers on the belly.', 'Dessine des petites plumes sur le ventre.'], d: ['M552 510L570 528L588 510', 'M612 510L630 528L648 510', 'M582 560L600 578L618 560', 'M552 610L570 628L588 610', 'M612 610L630 628L648 610'] },
      { t: ['Put it on a branch with little feet.', 'Mets-le sur une branche avec des petites pattes.'], d: ['M300 718L900 718', 'M300 752L900 752', 'M300 718Q285 735 300 752', 'M900 718Q915 735 900 752', 'M560 700L555 735M580 702L580 735M620 702L620 735M640 700L645 735'] }
    ],
    colors: [[600, 660, '#B07B52'], [600, 250, '#B07B52'], [455, 220, '#B07B52'], [745, 220, '#B07B52'], [500, 300, '#FFE9A8'], [700, 300, '#FFE9A8'], [600, 412, '#FF8C42'],
      [455, 510, '#8B5E3C'], [745, 510, '#8B5E3C'], [400, 735, '#7A4E2D'], [800, 735, '#7A4E2D'], [600, 735, '#7A4E2D']]
  };
  L.turtle = {
    name: ['Turtle', 'Tortue'], emoji: '🐢', level: 1, cat: 'animals',
    steps: [
      { t: ['Draw a big dome for the shell.', 'Dessine un gros dôme pour la carapace.'], d: ['M350 600C350 380 850 380 850 600Z'] },
      { t: ['Draw a pattern on the shell.', 'Dessine des formes sur la carapace.'], d: ['M540 470L660 470L700 540L660 600L540 600L500 540Z', 'M540 470L495 448', 'M660 470L705 448', 'M500 540L364 541', 'M700 540L836 541'] },
      { t: ['Add a head with a happy face.', 'Ajoute une tête avec un visage content.'], d: ['M850 560C870 470 990 462 1000 540C1005 600 930 612 850 600', [circ(950, 525, 10), 'k'], 'M935 570Q960 585 985 565'] },
      { t: ['Draw the legs and a little tail.', 'Dessine les pattes et une petite queue.'], d: ['M420 600L410 680L480 680L490 600', 'M700 600L690 680L760 680L770 600', 'M352 590L300 612L355 600'] }
    ],
    colors: [[600, 535, '#8AC926'], [600, 430, '#2A9D58'], [420, 575, '#2A9D58'], [420, 500, '#2A9D58'], [780, 575, '#2A9D58'], [780, 500, '#2A9D58'], [920, 545, '#A6D96A'], [450, 640, '#A6D96A'], [730, 640, '#A6D96A']]
  };

  // ---------------- FUN STUFF ----------------
  L.cupcake = {
    name: ['Cupcake', 'Petit gâteau'], emoji: '🧁', level: 1, cat: 'yummy',
    steps: [
      { t: ['Draw the cup, like a bucket.', 'Dessine le moule, comme un seau.'], d: ['M420 525L482 790L718 790L780 525', 'M405 525L795 525'] },
      { t: ['Add lines on the cup.', 'Ajoute des lignes sur le moule.'], d: ['M480 528L515 788', 'M540 528L560 788', 'M600 528L600 788', 'M660 528L640 788', 'M720 528L685 788'] },
      { t: ['Draw big puffy frosting.', 'Dessine un gros glaçage tout gonflé.'], d: ['M410 522C340 515 348 420 440 425L760 425C852 420 860 515 790 522'] },
      { t: ['Add a smaller layer on top.', 'Ajoute un plus petit étage par-dessus.'], d: ['M455 425C395 420 405 335 482 338L718 338C795 335 805 420 745 425'] },
      { t: ['Finish with a pointy swirl!', 'Termine avec une pointe en tourbillon!'], d: ['M505 338C470 285 520 245 582 248C640 235 662 185 622 140C705 158 735 262 698 338'] },
      { t: ['Add sprinkles!', 'Ajoute des petits bonbons!'], d: ['M470 470L490 458', 'M540 490L562 494', 'M640 470L660 458', 'M720 492L742 484', 'M600 452L612 472', 'M520 385L540 375', 'M650 380L670 390', 'M590 300L605 285'] }
    ],
    colors: [[472, 650, '#FF6FB5'], [527, 650, '#FFC2DD'], [575, 650, '#FF6FB5'], [625, 650, '#FFC2DD'], [674, 650, '#FF6FB5'], [726, 650, '#FFC2DD'], [600, 500, '#FFD6E8'], [600, 395, '#FFB3D1'], [600, 300, '#FF8FC0']]
  };
  L.iceCream = {
    name: ['Ice cream', 'Crème glacée'], emoji: '🍦', level: 1, cat: 'yummy',
    steps: [
      { t: ['Draw a pointy cone.', 'Dessine un cornet pointu.'], d: ['M482 490L600 822L718 490'] },
      { t: ['Make a criss-cross pattern.', 'Fais un quadrillage en X.'], d: ['M506 556L653 673', 'M541 656L624 756', 'M694 556L547 673', 'M659 656L576 756', 'M560 492L688 573', 'M640 492L512 573'] },
      { t: ['Add a big scoop of ice cream.', 'Ajoute une grosse boule de crème glacée.'], d: ['M462 492C418 470 432 382 500 392C520 330 680 330 700 392C768 382 782 470 738 492Z'] },
      { t: ['Put a smaller scoop on top.', 'Mets une plus petite boule par-dessus.'], d: ['M504 383C470 300 540 248 600 258C662 248 732 300 696 383'] },
      { t: ['And a cherry on top!', 'Et une cerise sur le dessus!'], d: [circ(600, 226, 32), 'M600 194Q612 156 642 146'] },
      { t: ['Add sprinkles!', 'Ajoute des petits bonbons!'], d: ['M540 430L556 418', 'M610 420L628 428', 'M660 445L676 432', 'M560 320L575 306', 'M630 310L648 318'] }
    ],
    colors: [['grid', 490, 500, 710, 810, 22, '#E0A458'], [600, 450, '#FF9EC4'], [600, 300, '#B8F0D8'], [600, 228, '#E63946']]
  };
  L.flower = {
    name: ['Flower', 'Fleur'], emoji: '🌸', level: 1, cat: 'things',
    steps: [
      { t: ['Draw a circle in the middle.', 'Dessine un cercle au milieu.'], d: [circ(600, 300, 62)] },
      { t: ['Draw petals all around.', 'Dessine des pétales tout autour.'], d: [0, 60, 120, 180, 240, 300].map((a) => petal(600, 300, 62, a, 110)) },
      { t: ['Draw a long stem.', 'Dessine une longue tige.'], d: ['M592 362C578 500 600 620 590 770', 'M608 362C598 500 620 620 610 770'] },
      { t: ['Add two leaves.', 'Ajoute deux feuilles.'], d: ['M591 604C520 548 440 566 420 606C480 646 560 646 591 604', 'M608 523C680 468 760 488 780 528C720 568 640 568 608 523'] },
      { t: ['Plant it in a pot.', 'Plante-la dans un pot.'], d: [rr(475, 770, 250, 42, 8), 'M492 812L522 885L678 885L708 812'] },
      { t: ['Give your flower a smile!', 'Donne un sourire à ta fleur!'], d: [[circ(578, 290, 8), 'k'], [circ(622, 290, 8), 'k'], 'M578 318Q600 338 622 318'] }
    ],
    colors: [[600, 345, '#FFD23F']].concat([0, 60, 120, 180, 240, 300].map((a) => [Math.round(600 + 120 * Math.cos(a * Math.PI / 180)), Math.round(300 + 120 * Math.sin(a * Math.PI / 180)), '#FF6FB5']))
      .concat([[600, 450, '#2A9D58'], [500, 606, '#8AC926'], [700, 528, '#8AC926'], [520, 790, '#E07A5F'], [600, 850, '#F4A261']])
  };
  L.train = {
    name: ['Train', 'Train'], emoji: '🚂', level: 2, cat: 'things',
    steps: [
      { t: ['Draw the cabin with a roof and a window.', 'Dessine la cabine avec un toit et une fenêtre.'], d: [rr(690, 250, 270, 40, 10), 'M712 290L712 620L938 620L938 290', rr(748, 330, 144, 110, 18)] },
      { t: ['Draw a long body and a round front.', 'Dessine un long corps et un devant tout rond.'], d: ['M712 430L345 430', 'M712 620L345 620', ell(345, 525, 42, 95)] },
      { t: ['Add a tall chimney.', 'Ajoute une grande cheminée.'], d: ['M425 430L425 335L392 288L518 288L485 335L485 430'] },
      { t: ['Add a little bump on top.', 'Ajoute une petite bosse sur le dessus.'], d: ['M565 430Q565 382 605 382Q645 382 645 430'] },
      { t: ['Draw the wheels: round, round, round!', 'Dessine les roues : rond, rond, rond!'], d: [circ(420, 668, 45), circ(420, 668, 10), circ(545, 670, 50), circ(545, 670, 10), circ(675, 670, 50), circ(675, 670, 10), circ(845, 682, 62), circ(845, 682, 12)] },
      { t: ['Add the bumper in front.', 'Ajoute le pare-chocs devant.'], d: ['M312 590L248 705L370 705L362 615', 'M300 705L325 650'] },
      { t: ['Choo choo! Draw some smoke.', 'Tchou tchou! Dessine de la fumée.'], d: ['M430 245A40 40 0 0 1 470 185A55 55 0 0 1 570 165A45 45 0 0 1 645 205A35 35 0 0 1 625 262A40 40 0 0 1 555 265A40 40 0 0 1 485 268A30 30 0 0 1 430 245Z'] }
    ],
    colors: [[825, 540, '#E63946'], [820, 385, '#BDE7FF'], [825, 270, '#3A6EE8'], [550, 530, '#3A6EE8'], [605, 410, '#FFD23F'], [345, 525, '#FFD23F'], [455, 360, '#4A4A5A'], [540, 220, '#E8E8F0'],
      [420, 640, '#FF8C42'], [545, 640, '#FF8C42'], [675, 640, '#FF8C42'], [845, 640, '#FF8C42'], [330, 690, '#E63946'], [290, 680, '#E63946']]
  };
  L.mermaid = {
    name: ['Mermaid', 'Sirène'], emoji: '🧜', level: 3, cat: 'magic',
    steps: [
      { t: ['Draw a big round head.', 'Dessine une grosse tête ronde.'], d: [ell(600, 335, 150, 140)] },
      { t: ['Draw her hair and bangs.', 'Dessine ses cheveux et sa frange.'], d: ['M440 345C430 120 770 120 760 345', 'M452 318C500 300 548 262 575 232C605 282 690 300 748 318'] },
      { t: ['Add long hair on both sides.', 'Ajoute des longs cheveux des deux côtés.'], d: ['M440 345C428 460 420 560 452 645C470 630 490 612 512 598', 'M760 345C772 460 780 560 748 645C730 630 710 612 688 598'] },
      { t: ['Draw her eyes, a smile and rosy cheeks.', 'Dessine ses yeux, un sourire et des joues roses.'], d: [[ell(548, 355, 19, 25), 'k'], [ell(652, 355, 19, 25), 'k'], 'M578 410Q600 430 622 410', ell(510, 395, 16, 10), ell(690, 395, 16, 10)] },
      { t: ['Put a crown on her head!', 'Mets-lui une couronne sur la tête!'], d: ['M542 190L550 125L578 162L600 110L622 162L650 125L658 190'] },
      { t: ['Draw her body holding a star.', 'Dessine son corps qui tient une étoile.'], d: ['M522 455C512 520 508 560 512 600', 'M678 455C688 520 692 560 688 600', star(600, 540, 58, 25), circ(552, 552, 17), circ(648, 552, 17)] },
      { t: ['Give her a mermaid tail!', 'Donne-lui une queue de sirène!'], d: ['M512 600Q600 625 688 600', 'M512 600C502 680 560 722 600 742C640 722 698 680 688 600', 'M600 742C560 762 500 792 478 822C540 832 580 812 600 782C620 812 660 832 722 822C700 792 640 762 600 742'] }
    ],
    colors: [[600, 450, '#FFE3D3'], [470, 300, '#FFD86B'], [600, 222, '#FFD86B'], [630, 250, '#FFD86B'], [470, 520, '#FFD86B'], [730, 520, '#FFD86B'], [600, 680, '#2EC4B6'], [535, 812, '#2EC4B6'], [665, 812, '#2EC4B6'],
      [530, 490, '#FFE3D3'], [600, 540, '#FFD23F'], [600, 160, '#FFD23F'], [510, 395, '#FF9EB5'], [690, 395, '#FF9EB5'], [552, 552, '#FFE3D3'], [648, 552, '#FFE3D3'], [600, 608, '#C77DFF']]
  };
  L.rocket = {
    name: ['Rocket', 'Fusée'], emoji: '🚀', level: 2, cat: 'things',
    steps: [
      { t: ['Draw a tall rocket shape.', 'Dessine une grande fusée.'], d: ['M520 700L520 360C520 250 600 150 600 150C600 150 680 250 680 360L680 700Z'] },
      { t: ['Add a round window.', 'Ajoute une fenêtre ronde.'], d: [circ(600, 390, 52), circ(600, 390, 34)] },
      { t: ['Draw stripes on the rocket.', 'Dessine des lignes sur la fusée.'], d: ['M537 266L663 266', 'M520 620L680 620'] },
      { t: ['Add two fins.', 'Ajoute deux ailerons.'], d: ['M520 560L430 690L430 760L520 700', 'M680 560L770 690L770 760L680 700'] },
      { t: ['Whoosh! Draw the flames.', 'Vroum! Dessine les flammes.'], d: ['M545 700C535 765 570 805 600 860C630 805 665 765 655 700', 'M572 700C568 745 585 770 600 800C615 770 632 745 628 700'] },
      { t: ['Add stars in the sky.', 'Ajoute des étoiles dans le ciel.'], d: [star(300, 250, 44, 19), star(900, 320, 38, 16), star(860, 140, 26, 11), star(330, 560, 26, 11)] }
    ],
    colors: [[600, 520, '#F1F1F7'], [600, 210, '#E63946'], [600, 347, '#3A6EE8'], [600, 390, '#BDE7FF'], [600, 660, '#E63946'], [455, 700, '#E63946'], [745, 700, '#E63946'],
      [555, 730, '#FF8C42'], [600, 750, '#FFD23F'], [300, 250, '#FFD23F'], [900, 320, '#FFD23F'], [860, 140, '#FFD23F'], [330, 560, '#FFD23F']]
  };

  window.PAPER = {
    lessons: L,
    // extra info for the original on-tablet lessons in art.js
    legacy: {
      fishy: { level: 1, cat: 'sea', colors: [[560, 520, '#4CC9F0'], [900, 450, '#FF8C42'], [570, 270, '#FF8C42']] }
    }
  };
})();
