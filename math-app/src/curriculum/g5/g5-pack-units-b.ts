import { pick, randInt, randInts, shuffle } from '../../core/rng';
import type { UnitDef } from '../../core/types';
import { level, matchPairs, numPad, orderSeq, trueFalse } from '../helpers';
import { add, buildMc, decLabel, fracLabel, formatMoney, mul, simplify, sub } from './math';
import {
  cargoThings, clockAfter, crewNames, decMc, fmtClock, fracMc, makeLinePlot, mcPool, moneyMc,
  properFraction, stationSnacks,
} from './g5-pack-helpers';

// ---------------------------------------------------------------------------
// Unit 8 — measurement
// ---------------------------------------------------------------------------

const supply: UnitDef = {
  id: 'g5.pack-supply',
  title: 'Supply Bay: Conversions & Volume',
  emoji: '📦',
  domain: 'measurement',
  levels: [
    level('g5.pack-supply.metric-len', 'Metric Length', 'number-pad', 1, (rng) => {
      if (rng() < 0.5) {
        const n = randInt(rng, 2, 45);
        return numPad(`Convert the antenna span: ${n} km = ? m`, n * 1000, { hint: '1 km = 1000 m.' });
      }
      const n = randInt(rng, 2, 95);
      return numPad(`Convert the panel length: ${n} m = ? cm`, n * 100, { hint: '1 m = 100 cm.' });
    }),
    level('g5.pack-supply.metric-mass', 'Metric Mass', 'number-pad', 1, (rng) => {
      const n = randInt(rng, 2, 85);
      return numPad(`A supply pod masses ${n} kg. How many grams is that?`, n * 1000, { hint: '1 kg = 1000 g.' });
    }),
    level('g5.pack-supply.metric-vol', 'Tank Capacity', 'number-pad', 1, (rng) => {
      const n = randInt(rng, 2, 75);
      return numPad(`A coolant tank holds ${n} L. How many mL is that?`, n * 1000, { hint: '1 L = 1000 mL.' });
    }),
    level('g5.pack-supply.custom-len', 'Customary Length', 'number-pad', 1, (rng) => {
      const mode = randInt(rng, 0, 2);
      if (mode === 0) {
        const n = randInt(rng, 2, 30);
        return numPad(`A gangway is ${n} ft long. How many inches?`, n * 12, { hint: '1 ft = 12 in.' });
      }
      if (mode === 1) {
        const n = randInt(rng, 2, 20);
        return numPad(`A tether is ${n} yd long. How many feet?`, n * 3, { hint: '1 yd = 3 ft.' });
      }
      const n = randInt(rng, 2, 15);
      return numPad(`A tether is ${n} yd long. How many inches?`, n * 36, { hint: 'Convert yd → ft → in.' });
    }),
    level('g5.pack-supply.custom-cap', 'Cafeteria Capacity', 'number-pad', 1, (rng) => {
      const mode = randInt(rng, 0, 2);
      if (mode === 0) {
        const n = randInt(rng, 2, 12);
        return numPad(`The soup kettle holds ${n} gal. How many quarts?`, n * 4, { hint: '1 gal = 4 qt.' });
      }
      if (mode === 1) {
        const n = randInt(rng, 2, 16);
        return numPad(`The dispenser holds ${n} qt. How many pints?`, n * 2, { hint: '1 qt = 2 pt.' });
      }
      const n = randInt(rng, 2, 8);
      return numPad(`A water jug holds ${n} gal. How many cups?`, n * 16, { hint: '1 gal = 16 cups.' });
    }),
    level('g5.pack-supply.custom-weight', 'Cargo Scale', 'number-pad', 1, (rng) => {
      if (rng() < 0.6) {
        const n = randInt(rng, 2, 40);
        return numPad(`A crate weighs ${n} lb. How many ounces?`, n * 16, { hint: '1 lb = 16 oz.' });
      }
      const n = randInt(rng, 2, 6);
      return numPad(`A hauler carries ${n} tons. How many pounds?`, n * 2000, { hint: '1 ton = 2000 lb.' });
    }),
    level('g5.pack-supply.two-step', 'Two-Part Measure', 'number-pad', 2, (rng) => {
      const mode = randInt(rng, 0, 2);
      if (mode === 0) {
        const m = randInt(rng, 2, 9); const cm = randInt(rng, 10, 99);
        return numPad(`A cable is ${m} m ${cm} cm long. Write its length in cm.`, m * 100 + cm, {
          visual: { text: `${m} m ${cm} cm` }, hint: 'Convert the meters first, then add.',
        });
      }
      if (mode === 1) {
        const kg = randInt(rng, 2, 9); const g = randInt(rng, 100, 900);
        return numPad(`A pod masses ${kg} kg ${g} g. Write it in grams.`, kg * 1000 + g, {
          visual: { text: `${kg} kg ${g} g` }, hint: 'Convert the kilograms first, then add.',
        });
      }
      const ft = randInt(rng, 2, 9); const inches = randInt(rng, 1, 11);
      return numPad(`A hatch is ${ft} ft ${inches} in tall. Write it in inches.`, ft * 12 + inches, {
        visual: { text: `${ft} ft ${inches} in` }, hint: 'Convert the feet first, then add.',
      });
    }),
    level('g5.pack-supply.compare', 'Which Holds More?', 'multiple-choice', 2, (rng) => {
      const options: { label: string; cm: number }[] = [];
      const seen = new Set<number>();
      const draws = [
        () => ({ label: `${randInt(rng, 150, 950)} cm`, cm: 0 }),
        () => ({ label: `${randInt(rng, 2, 9)} m`, cm: 0 }),
        () => ({ label: `${randInt(rng, 1500, 9500)} mm`, cm: 0 }),
        () => ({ label: `${randInt(rng, 20, 90)} dm`, cm: 0 }),
      ];
      while (options.length < 4) {
        const pickDraw = draws[randInt(rng, 0, draws.length - 1)]();
        const num = Number(pickDraw.label.split(' ')[0]);
        const unit = pickDraw.label.split(' ')[1];
        pickDraw.cm = unit === 'cm' ? num : unit === 'm' ? num * 100 : unit === 'dm' ? num * 10 : Math.floor(num / 10);
        if (seen.has(pickDraw.cm) || options.some((o) => o.label === pickDraw.label)) continue;
        seen.add(pickDraw.cm);
        options.push(pickDraw);
      }
      const greatest = rng() < 0.5;
      const target = options.reduce((best, o) => (greatest ? o.cm > best.cm : o.cm < best.cm) ? o : best, options[0]);
      return mcPool(rng, `Which length is ${greatest ? 'greatest' : 'least'}?`, target.label,
        options.filter((o) => o !== target).map((o) => o.label),
        { hint: 'Convert all lengths to cm before comparing.' });
    }),
    level('g5.pack-supply.restock', 'Restock Level', 'number-pad', 2, (rng) => {
      const cap = randInt(rng, 3, 12) * 1000;
      const inside = randInt(rng, 1000, cap - 500);
      return numPad(`An oxygen tank holds ${cap} mL of compressed gas and currently has ${inside} mL. How many mL are needed to fill it?`, cap - inside, {
        hint: 'Capacity − current amount.',
      });
    }),
    level('g5.pack-supply.to-big', 'Small to Big', 'multiple-choice', 2, (rng) => {
      const mode = randInt(rng, 0, 2);
      if (mode === 0) {
        const n = randInt(rng, 150, 950) ; const answer = n * 10;
        return decMc(rng, `Convert: ${n} cm = ? m`, answer, 1000,
          [n * 100, n, n * 1000], { hint: '100 cm = 1 m, so move the point 2 places left.' });
      }
      if (mode === 1) {
        const n = randInt(rng, 1200, 9800); const answer = n;
        return decMc(rng, `Convert: ${n} mL = ? L`, answer, 1000,
          [n * 10, Math.floor(n / 10), n + 1000], { hint: '1000 mL = 1 L, so divide by 1000.' });
      }
      const n = pick(rng, [24, 36, 48, 60, 72, 84]);
      const ft = n / 12;
      return buildMc(`Convert: ${n} in = ? ft`, { label: String(ft), value: ft },
        [ft + 1, ft + 2, n, n * 12].map((value) => ({ label: String(value), value })),
        rng, { hint: '12 in = 1 ft, so divide by 12.' });
    }),
    level('g5.pack-supply.volume-miss', 'Crate Volume', 'number-pad', 3, (rng) => {
      if (rng() < 0.5) {
        const l = randInt(rng, 4, 14); const w = randInt(rng, 2, 9); const h = randInt(rng, 2, 8);
        return numPad(`A storage crate is ${l} cm × ${w} cm × ${h} cm. Find its volume in cm³.`, l * w * h, {
          visual: { text: `${l} × ${w} × ${h}` }, hint: 'V = l × w × h.',
        });
      }
      const l = randInt(rng, 3, 12); const w = randInt(rng, 2, 8); const h = randInt(rng, 2, 8);
      const v = l * w * h;
      return numPad(`A crate has volume ${v} cm³. It is ${l} cm long and ${w} cm wide. How high is it?`, h, {
        visual: { text: `${l} × ${w} × ? = ${v}` }, hint: 'Divide the volume by length × width.',
      });
    }),
    level('g5.pack-supply.word-convert', 'Ribbon Cutter', 'number-pad', 3, (rng) => {
      const mode = randInt(rng, 0, 1);
      if (mode === 0) {
        const k = pick(rng, [4, 5, 10]);
        const m = randInt(rng, 1, 6);
        return numPad(`A cable ${m} m long is cut into ${k} equal pieces. How many cm is each piece?`, (m * 100) / k, {
          visual: { text: `${m} m ÷ ${k}` }, hint: 'Convert to cm before dividing.',
        });
      }
      const per = pick(rng, [200, 250, 400, 500]);
      const count = randInt(rng, 2, 8);
      return numPad(`${count} identical battery packs share ${per * count} g of charge equally. How many grams does each get?`, per, {
        visual: { text: `${per * count} g ÷ ${count}` }, hint: 'Divide the total by the number of packs.',
      });
    }),
  ],
};

// ---------------------------------------------------------------------------
// Unit 9 — data
// ---------------------------------------------------------------------------

const lab: UnitDef = {
  id: 'g5.pack-lab',
  title: 'Bio Lab: Data & Line Plots',
  emoji: '🧫',
  domain: 'data',
  levels: [
    level('g5.pack-lab.plot-count', 'Count the Samples', 'number-pad', 1, (rng) => {
      const plot = makeLinePlot(rng, 'kg', pick(rng, [4, 8]));
      return numPad('How many asteroid samples were weighed in all?', plot.totalMarks, {
        visual: { text: plot.text }, hint: 'Count every ✕ on the line plot.',
      });
    }),
    level('g5.pack-lab.plot-row', 'Read a Row', 'number-pad', 1, (rng) => {
      const plot = makeLinePlot(rng, pick(rng, ['kg', 'L']), 8);
      const index = randInt(rng, 0, plot.positions.length - 1);
      const label = fracLabel(simplify({ n: plot.positions[index], d: 8 }));
      return numPad(`How many samples measured exactly ${label}?`, plot.counts[index], {
        visual: { text: plot.text }, hint: 'Find the row for that value and count its marks.',
      });
    }),
    level('g5.pack-lab.bar-read', 'Bar Chart Scan', 'multiple-choice', 1, (rng) => {
      const categories = shuffle(rng, ['Comets', 'Meteors', 'Moons', 'Craters', 'Nebulas']).slice(0, 4);
      const counts = shuffle(rng, [2, 4, 5, 7]);
      const board = categories.map((name, i) => `${name} | ${'▓'.repeat(counts[i])}`).join('\n');
      const most = rng() < 0.5;
      const target = categories[counts.indexOf(most ? Math.max(...counts) : Math.min(...counts))];
      return mcPool(rng, `Which object was observed ${most ? 'most' : 'least'} often?`, target,
        categories.filter((name) => name !== target), {
          visual: { text: board }, hint: 'Compare the bar lengths row by row.',
        });
    }),
    level('g5.pack-lab.picto', 'Symbol Tally', 'number-pad', 1, (rng) => {
      const per = pick(rng, [2, 4, 5, 10]);
      const rows = randInt(rng, 2, 3);
      const counts = Array.from({ length: rows }, () => randInt(rng, 2, 5));
      const total = counts.reduce((sum, c) => sum + c, 0) * per;
      const board = counts.map((c) => '⭐'.repeat(c)).join('\n');
      return numPad(`Each ⭐ stands for ${per} meteor sightings. How many sightings are shown?`, total, {
        visual: { text: `⭐ = ${per}\n${board}` }, hint: `Count the stars, then multiply by ${per}.`,
      });
    }),
    level('g5.pack-lab.table-total', 'Log Table Total', 'number-pad', 1, (rng) => {
      const names = shuffle(rng, crewNames).slice(0, 3);
      const counts = names.map(() => randInt(rng, 12, 88));
      const board = names.map((name, i) => `${name} | ${counts[i]}`).join('\n');
      if (rng() < 0.5) {
        return numPad('How many experiments did the three officers run in total?', counts.reduce((a, b) => a + b, 0), {
          visual: { text: `Experiments run\n${board}` }, hint: 'Add all three numbers.',
        });
      }
      const [i, j] = randInts(rng, 0, 2, 2);
      const hi = counts[i] >= counts[j] ? i : j;
      const lo = hi === i ? j : i;
      return numPad(`How many more experiments did ${names[hi]} run than ${names[lo]}?`, counts[hi] - counts[lo], {
        visual: { text: `Experiments run\n${board}` }, hint: 'Subtract the smaller number from the larger.',
      });
    }),
    level('g5.pack-lab.plot-total', 'Total the Samples', 'multiple-choice', 2, (rng) => {
      const plot = makeLinePlot(rng, 'kg', 8);
      const answer = simplify({ n: plot.totalUnits, d: 8 });
      return fracMc(rng, 'What is the total mass of all samples?', answer,
        [
          simplify({ n: plot.totalUnits + 1, d: 8 }),
          simplify({ n: Math.max(1, plot.totalUnits - 1), d: 8 }),
          simplify({ n: plot.totalMarks, d: 8 }),
        ], { visual: { text: plot.text }, hint: 'Multiply each value by its count, then add.' });
    }),
    level('g5.pack-lab.plot-range', 'Heaviest vs Lightest', 'multiple-choice', 2, (rng) => {
      const plot = makeLinePlot(rng, 'kg', 8);
      const answer = simplify({ n: plot.positions[plot.positions.length - 1] - plot.positions[0], d: 8 });
      const wording = pick(rng, [
        'What is the difference between the heaviest and lightest samples?',
        'Find the range of the sample masses shown on the plot.',
        'How much heavier is the heaviest sample than the lightest?',
        'Spread check: subtract the smallest mass from the largest.',
      ]);
      return fracMc(rng, wording, answer,
        [
          simplify({ n: plot.positions[plot.positions.length - 1], d: 8 }),
          simplify({ n: plot.positions[0], d: 8 }),
          simplify({ n: plot.positions[plot.positions.length - 1] + plot.positions[0], d: 8 }),
        ], { visual: { text: plot.text }, hint: 'Subtract the smallest reading from the largest.' });
    }),
    level('g5.pack-lab.plot-diff', 'Compare Two Rows', 'multiple-choice', 2, (rng) => {
      const plot = makeLinePlot(rng, 'kg', 8);
      const heavy = plot.positions[plot.positions.length - 1];
      const light = plot.positions[0];
      const heavyTotal = heavy * plot.counts[plot.counts.length - 1];
      const lightTotal = light * plot.counts[0];
      const answer = simplify({ n: Math.abs(heavyTotal - lightTotal), d: 8 });
      return fracMc(rng, `How much more do the ${fracLabel(simplify({ n: heavy, d: 8 }))} kg samples weigh in total than the ${fracLabel(simplify({ n: light, d: 8 }))} kg samples?`, answer,
        [
          simplify({ n: heavyTotal + lightTotal, d: 8 }),
          simplify({ n: Math.abs(heavyTotal - lightTotal) + 1, d: 8 }),
          simplify({ n: heavy - light, d: 8 }),
        ], { visual: { text: plot.text }, hint: 'Total each row first: value × count.' });
    }),
    level('g5.pack-lab.plot-share', 'Equal Shares', 'multiple-choice', 2, (rng) => {
      const plot = makeLinePlot(rng, 'kg', 8);
      const beakers = plot.totalMarks;
      const answer = simplify({ n: plot.totalUnits, d: 8 * beakers });
      return fracMc(rng, `All the sample mass is poured equally into ${beakers} beakers. How much goes in each?`, answer,
        [
          simplify({ n: plot.totalUnits, d: 8 }),
          simplify({ n: plot.totalUnits, d: 8 * (beakers + 1) }),
          simplify({ n: beakers, d: plot.totalUnits }),
        ], { visual: { text: plot.text }, hint: 'Total mass ÷ number of beakers.' });
    }),
    level('g5.pack-lab.plot-tf', 'Plot Claim Check', 'true-false', 3, (rng) => {
      const plot = makeLinePlot(rng, 'kg', 8);
      const mode = randInt(rng, 0, 1);
      if (mode === 0) {
        const threshold = pick(rng, [3, 4, 5]);
        const heavy = plot.positions.reduce((sum, p, i) => sum + (p >= threshold ? plot.counts[i] : 0), 0);
        const claim = pick(rng, ['more than', 'fewer than']);
        const truth = claim === 'more than' ? heavy * 2 > plot.totalMarks : heavy * 2 < plot.totalMarks;
        return trueFalse(`${claim === 'more than' ? 'More' : 'Fewer'} than half of the samples weigh at least ${fracLabel(simplify({ n: threshold, d: 8 }))} kg.`, truth, {
          visual: { text: plot.text }, hint: 'Count the marks at or above the cutoff and compare to the total.',
        });
      }
      const index = randInt(rng, 0, plot.positions.length - 1);
      const shown = pick(rng, [plot.counts[index], plot.counts[index] + 1, Math.max(1, plot.counts[index] - 1)]);
      return trueFalse(`Exactly ${shown} samples weigh ${fracLabel(simplify({ n: plot.positions[index], d: 8 }))} kg.`, shown === plot.counts[index], {
        visual: { text: plot.text }, hint: 'Count the marks on that row.',
      });
    }),
  ],
};

// ---------------------------------------------------------------------------
// Unit 10 — money
// ---------------------------------------------------------------------------

const credits: UnitDef = {
  id: 'g5.pack-credits',
  title: 'Quartermaster: Station Credits',
  emoji: '💳',
  domain: 'money',
  levels: [
    level('g5.pack-credits.cost-total', 'Snack Cart Total', 'multiple-choice', 1, (rng) => {
      const price = randInt(rng, 105, 995);
      const count = randInt(rng, 2, 8);
      const answer = price * count;
      const item = pick(rng, stationSnacks);
      return moneyMc(rng, `Each pack of ${item} costs ${formatMoney(price)}. What do ${count} packs cost?`, answer,
        [answer + 100, Math.max(1, answer - 100), answer * 10, price * (count + 1)],
        { hint: `Multiply ${formatMoney(price)} by ${count}.` });
    }),
    level('g5.pack-credits.change', 'Change Due', 'multiple-choice', 1, (rng) => {
      const price = randInt(rng, 135, 880);
      const payment = (Math.floor(price / 500) + 1) * 500;
      const answer = payment - price;
      return moneyMc(rng, `A space sticker costs ${formatMoney(price)}. ${pick(rng, crewNames)} pays ${formatMoney(payment)}. How much change is due?`, answer,
        [answer + 100, Math.max(1, answer - 100), payment + price, price],
        { hint: 'Subtract the price from the payment.' });
    }),
    level('g5.pack-credits.earnings', 'Shift Pay', 'number-pad', 1, (rng) => {
      const rate = randInt(rng, 8, 25); const hours = randInt(rng, 2, 9);
      return numPad(`${pick(rng, crewNames)} earns ${rate} credits per hour and works ${hours} hours. How many credits?`, rate * hours, {
        visual: { text: `${rate} × ${hours}` }, hint: 'Rate × hours.',
      });
    }),
    level('g5.pack-credits.two-items', 'Two-Item Order', 'multiple-choice', 1, (rng) => {
      const a = randInt(rng, 2, 6); const p = randInt(rng, 120, 480);
      const b = randInt(rng, 2, 5); const q = randInt(rng, 105, 395);
      const answer = a * p + b * q;
      return moneyMc(rng, `The crew orders ${a} meal packs at ${formatMoney(p)} each and ${b} tool kits at ${formatMoney(q)} each. What is the total?`, answer,
        [a * p + b * q - 100, a * p + b * q + 100, (a + b) * p, a * p + b * q + p],
        { hint: 'Find each subtotal, then add.' });
    }),
    level('g5.pack-credits.unit-price', 'Per-Pack Price', 'multiple-choice', 2, (rng) => {
      const count = pick(rng, [2, 4, 5, 8]);
      const each = randInt(rng, 105, 475);
      const total = each * count;
      return moneyMc(rng, `A bundle of ${count} badges costs ${formatMoney(total)}. What does one badge cost?`, each,
        [each + 100, Math.max(1, each - 50), total - count, each * 2],
        { hint: `Divide ${formatMoney(total)} by ${count}.` });
    }),
    level('g5.pack-credits.budget', 'Budget Check', 'number-pad', 2, (rng) => {
      const price = randInt(rng, 130, 490);
      const budget = randInt(rng, 10, 30) * 100;
      return numPad(`Each patch costs ${formatMoney(price)}. With ${formatMoney(budget)} to spend, how many patches can the crew buy at most?`, Math.floor(budget / price), {
        hint: 'Divide the budget by the price and drop the leftover.',
      });
    }),
    level('g5.pack-credits.money-tf', 'Price Claim', 'true-false', 2, (rng) => {
      const count = randInt(rng, 2, 9); const price = randInt(rng, 115, 690);
      const total = count * price;
      const relation = pick(rng, ['more than', 'less than']);
      const claimed = rng() < 0.5 ? Math.ceil(total / 100) * 100 : Math.floor(total / 100) * 100;
      const actual = relation === 'more than' ? total > claimed : total < claimed;
      return trueFalse(`Buying ${count} meal pouches at ${formatMoney(price)} each costs ${relation} ${formatMoney(claimed)}.`, actual, {
        hint: 'Find the total first, then compare.',
      });
    }),
    level('g5.pack-credits.split', 'Split the Bill', 'multiple-choice', 2, (rng) => {
      const k = pick(rng, [2, 4, 5]);
      const each = randInt(rng, 115, 640);
      const total = each * k;
      return moneyMc(rng, `${k} crew members split a ${formatMoney(total)} supply order equally. How much does each pay?`, each,
        [each + 50, Math.max(1, each - 50), total - k, each * 2],
        { hint: `Divide ${formatMoney(total)} by ${k}.` });
    }),
    level('g5.pack-credits.compare-deal', 'Better Bundle', 'multiple-choice', 2, (rng) => {
      const count = pick(rng, [3, 4, 5, 6]);
      const perPack = randInt(rng, 60, 190);
      const packPrice = perPack * count;
      const single = perPack + randInt(rng, 5, 40);
      const answer = single - perPack;
      return moneyMc(rng, `A ${count}-pack of patches costs ${formatMoney(packPrice)}; a single patch costs ${formatMoney(single)}. How much cheaper per patch is the ${count}-pack?`, answer,
        [answer + 5, Math.max(1, answer - 5), single * count - packPrice, perPack],
        { hint: 'Find the per-patch price in the pack first.' });
    }),
    level('g5.pack-credits.savings', 'Savings Plan', 'number-pad', 3, (rng) => {
      const start = randInt(rng, 5, 40) * 100;
      const weekly = randInt(rng, 4, 15) * 100;
      const weeks = randInt(rng, 3, 9);
      const answer = (start + weekly * weeks) / 100;
      return numPad(`${pick(rng, crewNames)} starts with ${formatMoney(start)} and saves ${formatMoney(weekly)} each week for ${weeks} weeks. How many credits do they have?`, answer, {
        visual: { text: `${formatMoney(start)} + ${weeks} × ${formatMoney(weekly)}` },
        hint: 'Total = start + weekly × weeks, in dollars.',
      });
    }),
  ],
};

// ---------------------------------------------------------------------------
// Unit 11 — time
// ---------------------------------------------------------------------------

const shift: UnitDef = {
  id: 'g5.pack-shift',
  title: 'Shift Scheduler: Time',
  emoji: '⏱️',
  domain: 'time',
  levels: [
    level('g5.pack-shift.h-to-min', 'Hours to Minutes', 'number-pad', 1, (rng) => {
      const h = randInt(rng, 1, 8); const m = randInt(rng, 5, 55);
      return numPad(`A duty shift lasts ${h} h ${m} min. How many minutes is that?`, h * 60 + m, {
        visual: { text: `${h} h ${m} min` }, hint: 'Each hour is 60 minutes.',
      });
    }),
    level('g5.pack-shift.min-to-h', 'Minutes to Hours', 'multiple-choice', 1, (rng) => {
      const h = randInt(rng, 1, 6); const m = pick(rng, [0, 15, 20, 30, 45]);
      const total = h * 60 + m;
      const fmt = (hh: number, mm: number) => (mm === 0 ? `${hh} h` : `${hh} h ${mm} min`);
      const answer = fmt(h, m);
      const pool = [fmt(h + 1, m), fmt(h, (m + 25) % 60), fmt(Math.max(1, h - 1), (m + 30) % 60), fmt(h, (m + 10) % 60)];
      return mcPool(rng, `Convert ${total} minutes to hours and minutes.`, answer, pool, {
        hint: '60 minutes make one hour.',
      });
    }),
    level('g5.pack-shift.elapsed', 'Same-Hour Gap', 'number-pad', 1, (rng) => {
      const h = randInt(rng, 1, 12);
      const m1 = randInt(rng, 0, 40); const m2 = randInt(rng, m1 + 5, 59);
      return numPad(`A drill runs from ${fmtClock(h, m1)} to ${fmtClock(h, m2)}. How many minutes is that?`, m2 - m1, {
        visual: { text: `${fmtClock(h, m1)} → ${fmtClock(h, m2)}` },
        hint: 'Subtract the start minutes from the end minutes.',
      });
    }),
    level('g5.pack-shift.elapsed-cross', 'Cross the Hour', 'number-pad', 1, (rng) => {
      const h = randInt(rng, 1, 10);
      const m1 = randInt(rng, 25, 55); const m2 = randInt(rng, 5, 30);
      const dur = 60 - m1 + m2;
      return numPad(`A repair runs from ${fmtClock(h, m1)} to ${fmtClock(h + 1, m2)}. How many minutes does it take?`, dur, {
        visual: { text: `${fmtClock(h, m1)} → ${fmtClock(h + 1, m2)}` },
        hint: 'Count minutes to the next hour, then add the rest.',
      });
    }),
    level('g5.pack-shift.end-time', 'When Does It End?', 'multiple-choice', 2, (rng) => {
      const h = randInt(rng, 1, 10); const m = randInt(rng, 5, 55);
      const dur = pick(rng, [20, 30, 40, 45, 50, 75, 90]);
      const answer = clockAfter(h, m, dur);
      const pool = [clockAfter(h, m, dur + 15), clockAfter(h, m, dur - 10), clockAfter(h, m, dur + 60), clockAfter(h, m, dur + 5)];
      return mcPool(rng, `A duty starts at ${fmtClock(h, m)} and lasts ${dur} minutes. When does it end?`, answer, pool, {
        visual: { text: `${fmtClock(h, m)} + ${dur} min` },
        hint: 'Add the minutes; roll over at 60.',
      });
    }),
    level('g5.pack-shift.start-time', 'When Did It Start?', 'multiple-choice', 2, (rng) => {
      const h = randInt(rng, 3, 11); const m = randInt(rng, 5, 55);
      const dur = pick(rng, [20, 30, 40, 45, 50, 75]);
      const startMinutes = (h - 1) * 60 + m - dur;
      const answer = fmtClock(Math.floor(startMinutes / 60) + 1, startMinutes % 60);
      const pool = [
        fmtClock(Math.floor((startMinutes + 15) / 60) + 1, (startMinutes + 15) % 60),
        fmtClock(Math.floor((startMinutes - 20) / 60) + 1, (startMinutes - 20) % 60),
        fmtClock(h, m),
        fmtClock(Math.floor((startMinutes + 60) / 60) + 1, startMinutes % 60),
      ];
      return mcPool(rng, `A meeting ended at ${fmtClock(h, m)} after ${dur} minutes. When did it start?`, answer, pool, {
        hint: 'Count backward the duration from the end time.',
      });
    }),
    level('g5.pack-shift.two-shifts', 'Double Shift', 'number-pad', 2, (rng) => {
      const h1 = randInt(rng, 1, 3); const m1 = pick(rng, [0, 15, 30, 45]);
      const h2 = randInt(rng, 1, 3); const m2 = pick(rng, [0, 15, 30, 45]);
      const total = h1 * 60 + m1 + h2 * 60 + m2;
      const fmt = (hh: number, mm: number) => (mm === 0 ? `${hh} h` : `${hh} h ${mm} min`);
      return numPad(`Two shifts last ${fmt(h1, m1)} and ${fmt(h2, m2)}. How many minutes total?`, total, {
        hint: 'Convert both to minutes, then add.',
      });
    }),
    level('g5.pack-shift.fits-gap', 'Does It Fit?', 'true-false', 2, (rng) => {
      const h = randInt(rng, 1, 9);
      const gap = pick(rng, [45, 60, 75, 90, 105]);
      const m = randInt(rng, 0, 30);
      const end = clockAfter(h, m, gap);
      const task = gap + pick(rng, [-15, -30, 0, 15, 20]);
      return trueFalse(`A task takes ${task} minutes. The slot is ${fmtClock(h, m)} to ${end}. The task fits in the slot.`, task <= gap, {
        visual: { text: `slot: ${gap} min` },
        hint: 'Compare the task length to the slot length.',
      });
    }),
    level('g5.pack-shift.sched-total', 'Triple Session', 'number-pad', 2, (rng) => {
      const k = randInt(rng, 2, 4);
      const h = randInt(rng, 1, 2); const m = pick(rng, [15, 20, 30, 45]);
      const each = h * 60 + m;
      return numPad(`${k} training sessions each last ${h} h ${m} min. How many minutes of training in all?`, each * k, {
        visual: { text: `${k} × (${h} h ${m} min)` },
        hint: 'Convert one session to minutes, then multiply.',
      });
    }),
    level('g5.pack-shift.ampm-tf', 'AM to PM', 'true-false', 3, (rng) => {
      const h = randInt(rng, 8, 11); const m = randInt(rng, 0, 45);
      const durH = randInt(rng, 1, 4); const durM = pick(rng, [0, 15, 30, 45]);
      const endTotal = h * 60 + m + durH * 60 + durM;
      const endH24 = Math.floor(endTotal / 60); const endM = endTotal % 60;
      const endH12 = ((endH24 - 1) % 12) + 1;
      const endMeridiem = endH24 >= 12 ? 'PM' : 'AM';
      const claimedCorrect = rng() < 0.5;
      let claimH = endH12; let claimM = endM; let claimMeridiem = endMeridiem;
      if (!claimedCorrect) {
        if (rng() < 0.5) claimM = (endM + pick(rng, [15, 30])) % 60;
        else claimH = (endH12 % 12) + 1;
      }
      return trueFalse(`A shift starts at ${fmtClock(h, m)} AM and lasts ${durH} h ${durM} min. It ends at ${fmtClock(claimH, claimM)} ${claimMeridiem}.`, claimedCorrect, {
        hint: 'Add the duration, then read the clock carefully.',
      });
    }),
  ],
};

// ---------------------------------------------------------------------------
// Unit 12 — patterns
// ---------------------------------------------------------------------------

const signals: UnitDef = {
  id: 'g5.pack-signals',
  title: 'Twin Signals: Number Patterns',
  emoji: '📡',
  domain: 'patterns',
  levels: [
    level('g5.pack-signals.next-term', 'Next Ping', 'multiple-choice', 1, (rng) => {
      const s = randInt(rng, 1, 30); const p = randInt(rng, 2, 12);
      const shown = [s, s + p, s + 2 * p].join(', ');
      const answer = s + 3 * p;
      return mcPool(rng, `A signal starts at ${s} and adds ${p} each ping: ${shown}, ___.`, String(answer),
        [String(answer + p), String(answer - 1), String(answer + 1), String(s + 4 * p + 1)],
        { hint: `Each step adds ${p}.` });
    }),
    level('g5.pack-signals.find-rule', 'Name the Rule', 'multiple-choice', 1, (rng) => {
      const p = randInt(rng, 2, 9);
      const multiplicative = rng() < 0.4;
      if (multiplicative) {
        const s = randInt(rng, 2, 5);
        const seq = [s, s * 2, s * 4, s * 8].join(', ');
        return mcPool(rng, `The signal reads ${seq}. Which rule makes it?`, 'Multiply by 2',
          ['Add 2', `Add ${p}`, 'Multiply by 3', 'Add the previous two'],
          { hint: 'Each term is twice the one before.' });
      }
      const s = randInt(rng, 3, 40);
      const seq = [s, s + p, s + 2 * p, s + 3 * p].join(', ');
      return mcPool(rng, `The signal reads ${seq}. Which rule makes it?`, `Add ${p}`,
        [`Add ${p + 1}`, `Add ${p - 1}`, `Multiply by ${p}`, 'Subtract 2'],
        { hint: 'Check the difference between neighbors.' });
    }),
    level('g5.pack-signals.order-terms', 'Ping Order', 'order-sequence', 1, (rng) => {
      const s = randInt(rng, 2, 25); const p = randInt(rng, 2, 11);
      return orderSeq(`Order the first four pings of the rule "start at ${s}, add ${p}".`,
        [0, 1, 2, 3].map((i) => String(s + i * p)));
    }),
    level('g5.pack-signals.pair-nth', 'Paired Pings', 'multiple-choice', 1, (rng) => {
      const p = randInt(rng, 2, 8); const q = randInt(rng, 2, 8);
      const n = randInt(rng, 3, 6);
      const a = (n - 1) * p; const b = (n - 1) * q;
      const answer = `(${a}, ${b})`;
      return mcPool(rng, `Signals A and B both start at 0. A adds ${p} each step, B adds ${q}. What is the ${n}th ordered pair (A, B)?`, answer,
        [`(${b}, ${a})`, `(${n * p}, ${n * q})`, `(${a}, ${n * q})`, `(${n * p}, ${b})`],
        { visual: { text: `A: 0, ${p}, ${2 * p}, …\nB: 0, ${q}, ${2 * q}, …` },
          hint: 'Term n needs n − 1 additions from 0.' });
    }),
    level('g5.pack-signals.graph-pick', 'Point on the Path', 'multiple-choice', 2, (rng) => {
      const p = randInt(rng, 2, 6); const q = randInt(rng, 2, 6);
      const i = randInt(rng, 3, 5);
      const a = i * p; const b = i * q;
      const answer = `(${a}, ${b})`;
      return mcPool(rng, `Rule A starts at 0 and adds ${p}; rule B starts at 0 and adds ${q}. Which ordered pair will appear on the graph?`, answer,
        [`(${a + p}, ${b})`, `(${a}, ${b + q})`, `(${b}, ${a})`, `(${a + 1}, ${b + 1})`],
        { hint: 'Both rules tick the same number of steps.' });
    }),
    level('g5.pack-signals.ratio-tf', 'Ratio Radar', 'true-false', 2, (rng) => {
      const p = randInt(rng, 2, 8);
      const k = randInt(rng, 2, 4);
      const claimed = pick(rng, [k, k + 1, Math.max(1, k - 1)]);
      return trueFalse(`Signal A starts at 0 and adds ${p} each step; signal B starts at 0 and adds ${k * p}. The B term is always ${claimed} times the A term.`, claimed === k, {
        visual: { text: `A: 0, ${p}, ${2 * p}, …\nB: 0, ${k * p}, ${2 * k * p}, …` },
        hint: 'Compare how much each rule adds.',
      });
    }),
    level('g5.pack-signals.dot-pattern', 'Dot Figures', 'number-pad', 2, (rng) => {
      const mode = randInt(rng, 0, 2);
      if (mode === 0) {
        const n = randInt(rng, 4, 8);
        return numPad(`Each antenna figure uses the pattern 3n + 2 struts for figure n. How many struts does figure ${n} need?`, 3 * n + 2, {
          visual: { text: 'F1: 5  F2: 8  F3: 11' }, hint: 'Multiply the figure number by 3, then add 2.',
        });
      }
      if (mode === 1) {
        const n = randInt(rng, 5, 9);
        return numPad(`A beacon wall adds a row each figure: figure n has n(n + 1)/2 lights. How many lights in figure ${n}?`, (n * (n + 1)) / 2, {
          visual: { text: 'F1: 1  F2: 3  F3: 6  F4: 10' }, hint: 'Add all the rows from 1 to n.',
        });
      }
      const n = randInt(rng, 5, 12);
      return numPad(`Solar arrays follow the pattern 4n − 1 panels for figure n. How many panels in figure ${n}?`, 4 * n - 1, {
        visual: { text: 'F1: 3  F2: 7  F3: 11' }, hint: 'Multiply by 4, then subtract 1.',
      });
    }),
    level('g5.pack-signals.nonzero', 'Offset Signals', 'multiple-choice', 3, (rng) => {
      const a0 = randInt(rng, 2, 9); const p = randInt(rng, 2, 6);
      const b0 = randInt(rng, 0, 5); const q = randInt(rng, 2, 6);
      const i = randInt(rng, 2, 5);
      const a = a0 + i * p; const b = b0 + i * q;
      const answer = `(${a}, ${b})`;
      return mcPool(rng, `Signal A starts at ${a0} and adds ${p}; signal B starts at ${b0} and adds ${q}. Which is the pair at step ${i}?`, answer,
        [`(${b}, ${a})`, `(${a0 + (i - 1) * p}, ${b0 + (i - 1) * q})`, `(${a + p}, ${b + q})`, `(${a}, ${b0 + i * q + 1})`],
        { hint: 'Add the step amount i times to each starting value.' });
    }),
    level('g5.pack-signals.missing-pair', 'Complete the Table', 'multiple-choice', 3, (rng) => {
      const p = randInt(rng, 2, 7); const q = randInt(rng, 2, 7);
      const table = [1, 2, 3].map((i) => `(${i * p}, ${i * q})`).join('  ');
      const n = randInt(rng, 4, 5);
      const answer = `(${n * p}, ${n * q})`;
      return mcPool(rng, `The ping table reads ${table}. Following the pattern, what is pair ${n}?`, answer,
        [`(${n * p}, ${(n - 1) * q})`, `(${(n - 1) * p}, ${n * q})`, `(${n * q}, ${n * p})`, `(${n * p + p}, ${n * q + q})`],
        { visual: { text: table }, hint: 'Each coordinate grows by its own step.' });
    }),
    level('g5.pack-signals.term-match', 'Match the Ping', 'match-pairs', 3, (rng) => {
      const p = randInt(rng, 2, 7); const q = randInt(rng, 2, 7);
      const steps = shuffle(rng, [1, 2, 3, 4, 5]).slice(0, 3).sort((a, b) => a - b);
      const pairs = steps.map((i) => ({ left: `Step ${i}`, right: `(${i * p}, ${i * q})` }));
      return matchPairs(`Signals start at 0: A adds ${p}, B adds ${q}. Match each step to its ordered pair.`, pairs);
    }),
  ],
};

// ---------------------------------------------------------------------------
// Unit 13 — algebra
// ---------------------------------------------------------------------------

const cipher: UnitDef = {
  id: 'g5.pack-cipher',
  title: 'Cipher Deck: Expressions',
  emoji: '🔐',
  domain: 'algebra',
  levels: [
    level('g5.pack-cipher.eval-x', 'Decode the Variable', 'number-pad', 1, (rng) => {
      const a = randInt(rng, 2, 9); const n = randInt(rng, 3, 12); const b = randInt(rng, 1, a * n - 1);
      return numPad(`If n = ${n}, evaluate ${a} × n − ${b}.`, a * n - b, {
        visual: { text: `${a} × ${n} − ${b}` }, hint: 'Replace n with its value, then multiply first.',
      });
    }),
    level('g5.pack-cipher.write-expr', 'Write the Code', 'multiple-choice', 1, (rng) => {
      const k = randInt(rng, 2, 6); const a = randInt(rng, 3, 15); const b = randInt(rng, 2, 12);
      const answer = `${k} × (${a} + ${b})`;
      return mcPool(rng, `Write "${k} times the sum of ${a} and ${b}" as an expression.`, answer,
        [`${k} × ${a} + ${b}`, `(${k} + ${a}) × ${b}`, `${k} + ${a} × ${b}`, `${k} × (${a} − ${b})`],
        { hint: '"The sum of" groups the addition in parentheses.' });
    }),
    level('g5.pack-cipher.eval-two', 'Two Variables', 'number-pad', 1, (rng) => {
      const x = randInt(rng, 2, 9); const y = randInt(rng, 2, 9);
      const mode = randInt(rng, 0, 1);
      if (mode === 0) {
        return numPad(`If a = ${x} and b = ${y}, evaluate 2 × a + b.`, 2 * x + y, {
          visual: { text: `2 × ${x} + ${y}` }, hint: 'Substitute both values, multiply first.',
        });
      }
      const k = randInt(rng, 2, 5);
      return numPad(`If a = ${x} and b = ${y}, evaluate a + ${k} × b.`, x + k * y, {
        visual: { text: `${x} + ${k} × ${y}` }, hint: 'Substitute, then multiply before adding.',
      });
    }),
    level('g5.pack-cipher.eval-parens', 'Parenthesis Power', 'number-pad', 1, (rng) => {
      const c = randInt(rng, 2, 6);
      const x = randInt(rng, 4, 15); const y = randInt(rng, 1, x - 1);
      return numPad(`If a = ${x}, b = ${y}, and c = ${c}, evaluate (a − b) × c.`, (x - y) * c, {
        visual: { text: `(${x} − ${y}) × ${c}` }, hint: 'Parentheses first.',
      });
    }),
    level('g5.pack-cipher.which-expr', 'Match the Mission', 'multiple-choice', 2, (rng) => {
      const k = randInt(rng, 2, 6); const extra = randInt(rng, 2, 9);
      const answer = `${k} × n + ${extra}`;
      return mcPool(rng, `Each of n shuttles carries ${k} pods, plus ${extra} pods ride in reserve. Which expression gives the total pods?`, answer,
        [`${k} × (n + ${extra})`, `${extra} × n + ${k}`, `n + ${k} × ${extra}`, `(n + ${k}) × ${extra}`],
        { hint: 'n groups of k plus a constant extra.' });
    }),
    level('g5.pack-cipher.expr-match', 'Phrase Match', 'match-pairs', 2, (rng) => {
      const bank = [
        { left: 'three more than n', right: 'n + 3' },
        { left: 'three times n', right: '3 × n' },
        { left: 'n doubled, then plus 5', right: '2 × n + 5' },
        { left: 'five less than n', right: 'n − 5' },
        { left: 'half of n', right: 'n ÷ 2' },
        { left: 'n increased by twice 4', right: 'n + 8' },
        { left: 'ten minus n', right: '10 − n' },
        { left: 'n groups of 7', right: '7 × n' },
      ];
      const selected = drawThree(rng, bank);
      return matchPairs('Match each phrase to its expression.', selected);
    }),
    level('g5.pack-cipher.prop-tf', 'Expression Laws', 'true-false', 2, (rng) => {
      const k = randInt(rng, 2, 6); const a = randInt(rng, 2, 9); const b = randInt(rng, 2, 9);
      const correct = rng() < 0.5;
      const claim = correct ? `${k} × ${a} + ${k} × ${b}` : `${k} × ${a} + ${b}`;
      return trueFalse(`${k} × (${a} + ${b}) is equal to ${claim}.`, correct, {
        hint: 'Distribute the multiplier to both terms inside the parentheses.',
      });
    }),
    level('g5.pack-cipher.solve-add', 'Find the Addend', 'number-pad', 3, (rng) => {
      const x = randInt(rng, 8, 75); const a = randInt(rng, 9, 60);
      return numPad(`Solve for x: x + ${a} = ${x + a}.`, x, {
        visual: { text: `x + ${a} = ${x + a}` }, hint: 'Subtract the known addend from the sum.',
      });
    }),
    level('g5.pack-cipher.solve-mult', 'Find the Factor', 'number-pad', 3, (rng) => {
      const k = randInt(rng, 3, 12); const x = randInt(rng, 4, 15);
      return numPad(`Solve for x: ${k} × x = ${k * x}.`, x, {
        visual: { text: `${k} × x = ${k * x}` }, hint: 'Divide the product by the known factor.',
      });
    }),
    level('g5.pack-cipher.balance', 'Balance the Beam', 'multiple-choice', 3, (rng) => {
      const b = randInt(rng, 3, 12); const c = randInt(rng, 3, 12);
      const a = randInt(rng, 5, b * c - 5);
      const answer = b * c - a;
      return mcPool(rng, `What number makes ${a} + ___ = ${b} × ${c} true?`, String(answer),
        [String(answer + 1), String(Math.max(1, answer - 1)), String(b * c), String(a + b * c)],
        { hint: `Compute ${b} × ${c} first, then subtract ${a}.` });
    }),
    level('g5.pack-cipher.formula-term', 'Term Formula', 'number-pad', 3, (rng) => {
      const m = randInt(rng, 2, 7); const c = randInt(rng, 1, 15); const n = randInt(rng, 4, 9);
      return numPad(`A signal pattern follows term = ${m} × n + ${c}. What is the ${n}th term?`, m * n + c, {
        visual: { text: `term = ${m}n + ${c}` }, hint: `Substitute ${n} for n.`,
      });
    }),
  ],
};

function drawThree<T>(rng: () => number, bank: readonly T[]): T[] {
  return shuffle(rng, [...bank]).slice(0, 3);
}

// ---------------------------------------------------------------------------
// Unit 14 — word problems
// ---------------------------------------------------------------------------

const deepMissions: UnitDef = {
  id: 'g5.pack-missions',
  title: 'Deep Space Missions',
  emoji: '🚀',
  domain: 'word-problems',
  levels: [
    level('g5.pack-missions.mul-sub', 'Supply Ledger', 'number-pad', 1, (rng) => {
      const a = randInt(rng, 4, 12); const b = randInt(rng, 12, 45); const u = randInt(rng, 10, a * b - 10);
      const thing = pick(rng, cargoThings);
      return numPad(`The station stocked ${a} crates of ${b} ${thing} each. The crew used ${u}. How many remain?`, a * b - u, {
        visual: { text: `${a} × ${b} − ${u}` }, hint: 'Find the total first, then subtract what was used.',
      });
    }),
    level('g5.pack-missions.round-up', 'Every Seat Counts', 'number-pad', 1, (rng) => {
      const people = randInt(rng, 47, 220); const cap = randInt(rng, 9, 24);
      const full = Math.floor(people / cap); const rem = people % cap;
      const answer = rem === 0 ? full : full + 1;
      return numPad(`${people} crew members need transport pods that seat ${cap} each. How many pods are required?`, answer, {
        hint: 'Leftover crew still need a pod — round up.',
      });
    }),
    level('g5.pack-missions.remainder', 'Leftover Cells', 'number-pad', 1, (rng) => {
      const total = randInt(rng, 50, 240); const per = randInt(rng, 7, 25);
      return numPad(`${total} battery cells pack into cases of ${per}. After filling complete cases, how many cells are left over?`, total % per, {
        hint: 'Divide and find the remainder.',
      });
    }),
    level('g5.pack-missions.dec-context', 'Fuel Receipt', 'multiple-choice', 1, (rng) => {
      const a = randInt(rng, 125, 750); const b = randInt(rng, 80, Math.min(a - 5, 400));
      const subtract = rng() < 0.5;
      const answer = subtract ? a - b : a + b;
      const verb = subtract
        ? `A tank held ${decLabel(a, 100)} L and the crew used ${decLabel(b, 100)} L. How much is left?`
        : `Two tanks hold ${decLabel(a, 100)} L and ${decLabel(b, 100)} L. How much fuel in all?`;
      return decMc(rng, verb, answer, 100,
        [answer + 100, Math.max(1, answer - 100), a + b, Math.abs(a - b) + 10],
        { hint: 'Line up the decimal points.' });
    }),
    level('g5.pack-missions.three-step', 'Docking Manifest', 'number-pad', 1, (rng) => {
      const a = randInt(rng, 3, 9); const b = randInt(rng, 12, 30);
      const c = randInt(rng, 2, 7); const d = randInt(rng, 8, 25);
      return numPad(`Docking bay A unloads ${a} pods of ${b} crates; bay B unloads ${c} pods of ${d} crates. How many crates in all?`, a * b + c * d, {
        visual: { text: `${a} × ${b} + ${c} × ${d}` }, hint: 'Total each bay first, then add.',
      });
    }),
    level('g5.pack-missions.earn-save', 'Save the Rest', 'number-pad', 2, (rng) => {
      const a = randInt(rng, 40, 95); const b = randInt(rng, 10, a - 10); const c = randInt(rng, 2, 8);
      return numPad(`${pick(rng, crewNames)} earns ${a} credits per week, spends ${b}, and saves the rest. How many credits after ${c} weeks?`, (a - b) * c, {
        visual: { text: `(${a} − ${b}) × ${c}` }, hint: 'Find the weekly savings first.',
      });
    }),
    level('g5.pack-missions.frac-word', 'Ration Fraction', 'multiple-choice', 2, (rng) => {
      const full = properFraction(rng, 2, 6);
      const used = properFraction(rng, 2, 5);
      const answer = mul(full, used);
      const item = pick(rng, cargoThings);
      return fracMc(rng, `A storage bay is ${fracLabel(full)} full of ${item}. The crew uses ${fracLabel(used)} of that supply for a mission. What fraction of the whole bay was used?`, answer,
        [
          sub(full, used),
          add(full, used),
          simplify({ n: full.n + used.n, d: full.d + used.d }),
        ], { hint: '"Of that supply" means multiply the fractions.' });
    }),
    level('g5.pack-missions.legs', 'Journey Segments', 'number-pad', 2, (rng) => {
      const legs = randInt(rng, 2, 4); const dist = randInt(rng, 45, 130);
      const total = legs * dist + randInt(rng, 30, 150);
      return numPad(`A shuttle route is ${total} km. The crew has flown ${legs} segments of ${dist} km each. How many km remain?`, total - legs * dist, {
        visual: { text: `${total} − ${legs} × ${dist}` }, hint: 'Subtract the distance already flown.',
      });
    }),
    level('g5.pack-missions.backwards', 'Reverse the Log', 'number-pad', 2, (rng) => {
      const end = randInt(rng, 30, 120); const removed = randInt(rng, 8, 40);
      const added = randInt(rng, 12, Math.min(55, end + removed - 5));
      const start = end + removed - added;
      return numPad(`A cargo hold received ${added} crates and shipped out ${removed}. It now holds ${end}. How many did it start with?`, start, {
        hint: 'Work backward: add back what left, subtract what arrived.',
      });
    }),
    level('g5.pack-missions.compare-plans', 'Which Fleet?', 'multiple-choice', 3, (rng) => {
      const a = randInt(rng, 3, 7); const s1 = randInt(rng, 20, 45);
      const b = randInt(rng, 3, 7); const s2 = randInt(rng, 20, 45);
      const totalA = a * s1; const totalB = b * s2;
      if (totalA === totalB) {
        return mcPool(rng, `Plan A: ${a} shuttles × ${s1} seats. Plan B: ${b} shuttles × ${s2} seats. Which moves more people?`, 'They are equal',
          ['Plan A', 'Plan B', `Plan A by ${s1}`, `Plan B by ${s2}`],
          { hint: 'Compute both totals.' });
      }
      const winner = totalA > totalB ? 'A' : 'B';
      const diff = Math.abs(totalA - totalB);
      const answer = `Plan ${winner} by ${diff}`;
      return mcPool(rng, `Plan A: ${a} shuttles × ${s1} seats. Plan B: ${b} shuttles × ${s2} seats. Which moves more people, and by how many?`, answer,
        [`Plan ${winner === 'A' ? 'B' : 'A'} by ${diff}`, `Plan ${winner} by ${diff + s1}`, 'They are equal', `Plan ${winner} by ${Math.abs(s1 - s2)}`],
        { hint: 'Compute both totals, then subtract.' });
    }),
    level('g5.pack-missions.rate', 'Docking Rate', 'multiple-choice', 3, (rng) => {
      const k = pick(rng, [3, 4, 5, 6, 10, 12, 15, 20]);
      const hours = randInt(rng, 2, 5);
      const answer = (hours * 60) / k;
      return mcPool(rng, `A supply drone docks every ${k} minutes. How many drones dock in ${hours} hour${hours > 1 ? 's' : ''}?`, String(answer),
        [String(answer + 1), String(Math.max(1, answer - 1)), String(hours * k), String(Math.floor((hours * 60) / k) + hours)],
        { hint: `Convert ${hours} h to ${hours * 60} min, then divide by ${k}.` });
    }),
    level('g5.pack-missions.volume-word', 'Habitat Module', 'number-pad', 3, (rng) => {
      const mode = randInt(rng, 0, 1);
      if (mode === 0) {
        const l = randInt(rng, 5, 14); const w = randInt(rng, 3, 9); const h = randInt(rng, 2, 7);
        return numPad(`A habitat module is ${l} m long, ${w} m wide, and ${h} m tall. How many cubic meters of air does it hold?`, l * w * h, {
          visual: { text: `${l} × ${w} × ${h}` }, hint: 'Volume = length × width × height.',
        });
      }
      const l = randInt(rng, 4, 10); const w = randInt(rng, 3, 8); const h = randInt(rng, 2, 6);
      const v = l * w * h;
      return numPad(`A module holds ${v} m³ of air. It is ${l} m long and ${w} m wide. How tall is it?`, h, {
        visual: { text: `${l} × ${w} × ? = ${v}` }, hint: 'Divide the volume by length × width.',
      });
    }),
  ],
};

export const g5PackUnitsB: UnitDef[] = [
  supply, lab, credits, shift, signals, cipher, deepMissions,
];
