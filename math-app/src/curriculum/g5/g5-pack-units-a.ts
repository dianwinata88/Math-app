import { pick, randInt, randInts, shuffle } from '../../core/rng';
import type { UnitDef } from '../../core/types';
import { level, matchPairs, numPad, orderSeq, trueFalse } from '../helpers';
import { add, buildMc, compare, decLabel, div, fracLabel, gcd, mul, roundDecimal, simplify, sub } from './math';
import type { Frac } from './math';
import {
  cargoThings, decMc, fracMc, mcPool, mixedLabel, mixedNumber, numWords,
  properFraction, shapeClues, shapeStatements, stationSnacks,
} from './g5-pack-helpers';

const superscripts = ['', '¹', '²', '³', '⁴'];

// ---------------------------------------------------------------------------
// Unit 1 — counting
// ---------------------------------------------------------------------------

const airlock: UnitDef = {
  id: 'g5.pack-airlock',
  title: 'Airlock: Cube & Decimal Counting',
  emoji: '🛂',
  domain: 'counting',
  levels: [
    level('g5.pack-airlock.cubes-layer', 'Count the Layer', 'number-pad', 1, (rng) => {
      const rows = randInt(rng, 3, 6);
      const perRow = randInt(rng, 3, Math.floor(30 / rows));
      return numPad(`A cargo shelf layer holds ${rows} rows of ${perRow} unit cubes. How many cubes in one layer?`, rows * perRow, {
        visual: { emoji: '🧊', groups: Array.from({ length: rows }, () => perRow) },
        hint: 'Rows × cubes in each row.',
      });
    }),
    level('g5.pack-airlock.cubes-stack', 'Stack the Cubes', 'number-pad', 1, (rng) => {
      const rows = randInt(rng, 2, 6); const perRow = randInt(rng, 2, 7); const layers = randInt(rng, 2, 5);
      return numPad(`A supply pod packs ${layers} layers. Each layer has ${rows} rows of ${perRow} unit cubes. How many cubes in all?`, rows * perRow * layers, {
        visual: { text: `${layers} layers × (${rows} × ${perRow})` },
        hint: 'Count one layer first, then multiply by the layers.',
      });
    }),
    level('g5.pack-airlock.count-tenths', 'Tenth Steps', 'multiple-choice', 1, (rng) => {
      const start = randInt(rng, 4, 85);
      const answer = start + 1;
      return decMc(rng, `The dial counts on by tenths: ${decLabel(start, 10)}, ${decLabel(answer, 10)}, ___.`, answer + 1, 10,
        [answer, answer + 2, answer * 10, Math.max(1, start - 9)],
        { hint: 'Each step adds one tenth.' });
    }),
    level('g5.pack-airlock.count-hundredths', 'Hundredth Ladder', 'order-sequence', 1, (rng) => {
      const start = randInt(rng, 12, 88);
      const length = randInt(rng, 4, 5);
      return orderSeq(`Count on by hundredths starting at ${decLabel(start, 100)}.`,
        Array.from({ length }, (_, i) => decLabel(start + i, 100)));
    }),
    level('g5.pack-airlock.count-fractions', 'Fraction Count-Up', 'multiple-choice', 1, (rng) => {
      const d = pick(rng, [3, 4, 5, 6, 8]);
      const s = randInt(rng, 1, d - 2);
      const shown = [s, s + 1, s + 2].map((n) => `${n}/${d}`).join(', ');
      const answer = simplify({ n: s + 3, d });
      return fracMc(rng, `The gauge counts on by ${d === 4 ? 'fourths' : d === 8 ? 'eighths' : d === 3 ? 'thirds' : d === 5 ? 'fifths' : 'sixths'}: ${shown}, ___.`,
        answer,
        [simplify({ n: s + 4, d }), simplify({ n: s + 3, d: d + 1 }), simplify({ n: s + 2, d }), simplify({ n: s + 3, d: d - 1 })],
        { hint: `Every step adds 1/${d}.` });
    }),
    level('g5.pack-airlock.cubes-partial', 'Top It Off', 'number-pad', 2, (rng) => {
      const rows = randInt(rng, 2, 5); const perRow = randInt(rng, 3, 7);
      const layers = randInt(rng, 2, 4); const extra = randInt(rng, 1, rows * perRow - 1);
      return numPad(`A pod has ${layers - 1} full layers of ${rows} × ${perRow} cubes, plus ${extra} loose cubes on top. How many cubes so far?`,
        (layers - 1) * rows * perRow + extra, {
          visual: { text: `${layers - 1} × ${rows} × ${perRow} + ${extra}` },
          hint: 'Full layers first, then add the loose cubes.',
        });
    }),
    level('g5.pack-airlock.cubes-missing', 'Fill the Crate', 'number-pad', 2, (rng) => {
      const rows = randInt(rng, 3, 6); const perRow = randInt(rng, 4, 8); const layers = randInt(rng, 2, 5);
      const capacity = rows * perRow * layers;
      const inside = randInt(rng, 5, capacity - 5);
      return numPad(`A crate fits ${rows} × ${perRow} × ${layers} cubes exactly. It already holds ${inside}. How many more cubes fill it?`, capacity - inside, {
        visual: { text: `${capacity} total − ${inside} inside` },
        hint: 'Find the capacity, then subtract what is inside.',
      });
    }),
    level('g5.pack-airlock.odometer', 'Rover Odometer', 'multiple-choice', 2, (rng) => {
      const start = randInt(rng, 11, 95); const steps = randInt(rng, 2, 5);
      const answer = start + steps;
      return decMc(rng, `The rover odometer shows ${decLabel(start, 10)} km. It counts on ${steps} tenths. What does it show?`, answer, 10,
        [answer + 1, Math.max(1, answer - 1), answer + 10, answer + steps * 10],
        { hint: `${steps} tenths is ${decLabel(steps, 10)} km.` });
    }),
    level('g5.pack-airlock.count-halves', 'Half-Step Sort', 'order-sequence', 2, (rng) => {
      const start = randInt(rng, 2, 60);
      return orderSeq(`Count on by 0.5 starting at ${decLabel(start, 10)}.`,
        Array.from({ length: 5 }, (_, i) => decLabel(start + i * 5, 10)));
    }),
    level('g5.pack-airlock.cubes-two', 'Twin Pods', 'number-pad', 2, (rng) => {
      const a = [randInt(rng, 2, 5), randInt(rng, 2, 6), randInt(rng, 2, 4)];
      const b = [randInt(rng, 2, 5), randInt(rng, 2, 6), randInt(rng, 2, 4)];
      return numPad(`Pod A packs ${a[0]} × ${a[1]} × ${a[2]} cubes and Pod B packs ${b[0]} × ${b[1]} × ${b[2]}. How many cubes in both?`,
        a[0] * a[1] * a[2] + b[0] * b[1] * b[2], {
          visual: { text: `A: ${a.join(' × ')}\nB: ${b.join(' × ')}` },
          hint: 'Count each pod, then add.',
        });
    }),
    level('g5.pack-airlock.quarter-drone', 'Drone Launch Count', 'multiple-choice', 3, (rng) => {
      const start = randInt(rng, 5, 60) * 5;
      const answer = start + 25;
      return decMc(rng, `Drones launch every 0.25 s. The clock counts ${decLabel(start, 100)}, ___.`, answer, 100,
        [answer + 25, answer + 50, Math.max(1, answer - 25), answer + 100],
        { hint: 'Each tick adds 25 hundredths of a second.' });
    }),
  ],
};

// ---------------------------------------------------------------------------
// Unit 2 — operations
// ---------------------------------------------------------------------------

const reactor: UnitDef = {
  id: 'g5.pack-reactor',
  title: 'Reactor Core: Big Operations',
  emoji: '🔋',
  domain: 'operations',
  levels: [
    level('g5.pack-reactor.mul-2x1', 'Two-Digit Boost', 'number-pad', 1, (rng) => {
      const a = randInt(rng, 21, 98); const b = randInt(rng, 3, 9);
      return numPad(`Engine log: ${a} × ${b} = ?`, a * b, { visual: { text: `${a} × ${b}` } });
    }),
    level('g5.pack-reactor.mul-3x1', 'Thruster Product', 'number-pad', 1, (rng) => {
      const a = randInt(rng, 102, 899); const b = randInt(rng, 2, 9);
      return numPad(`Engine log: ${a} × ${b} = ?`, a * b, { visual: { text: `${a} × ${b}` } });
    }),
    level('g5.pack-reactor.div-1', 'Single-Digit Split', 'number-pad', 1, (rng) => {
      const divisor = randInt(rng, 3, 9); const quotient = randInt(rng, 12, 99);
      const dividend = divisor * quotient;
      return numPad(`Split the supply run: ${dividend} ÷ ${divisor} = ?`, quotient, {
        visual: { text: `${dividend} ÷ ${divisor}` },
        hint: 'Multiply back to check your quotient.',
      });
    }),
    level('g5.pack-reactor.missing-factor', 'Missing Booster', 'multiple-choice', 1, (rng) => {
      const divisor = randInt(rng, 6, 45); const quotient = randInt(rng, 12, 87);
      const product = divisor * quotient;
      return buildMc(`__ × ${divisor} = ${product}. What number fills the blank?`,
        { label: String(quotient), value: quotient },
        [quotient + 1, Math.max(1, quotient - 1), quotient + 10, quotient * 10].map((value) => ({ label: String(value), value })),
        rng, { hint: 'Divide the product by the known factor.' });
    }),
    level('g5.pack-reactor.mul-3x2', 'Full Throttle Multiply', 'number-pad', 2, (rng) => {
      const a = randInt(rng, 102, 899); const b = randInt(rng, 12, 89);
      return numPad(`Engine log: ${a} × ${b} = ?`, a * b, { visual: { text: `${a} × ${b}` }, hint: 'Multiply by the tens, then the ones, and add.' });
    }),
    level('g5.pack-reactor.div-2', 'Two-Digit Divider', 'number-pad', 2, (rng) => {
      const divisor = randInt(rng, 12, 48); const quotient = randInt(rng, 13, 89);
      const dividend = divisor * quotient;
      return numPad(`Split the supply run: ${dividend} ÷ ${divisor} = ?`, quotient, {
        visual: { text: `${dividend} ÷ ${divisor}` },
        hint: 'Estimate first: about how many times does the divisor fit?',
      });
    }),
    level('g5.pack-reactor.div-remainder', 'Leftover Readout', 'multiple-choice', 2, (rng) => {
      const divisor = randInt(rng, 7, 45); const quotient = randInt(rng, 9, 60);
      const remainder = randInt(rng, 1, divisor - 1);
      const dividend = divisor * quotient + remainder;
      const answer = `${quotient} R ${remainder}`;
      const wrongs = [
        `${quotient + 1} R ${remainder}`,
        `${quotient} R ${remainder === divisor - 1 ? remainder - 1 : remainder + 1}`,
        `${quotient - 1} R ${Math.min(divisor - 1, remainder + Math.floor(divisor / 2))}`,
        `${quotient + 1} R 0`,
      ];
      return mcPool(rng, `Mission math: ${dividend} ÷ ${divisor} = ?`, answer, wrongs, {
        visual: { text: `${dividend} ÷ ${divisor}` },
        hint: 'The remainder must be smaller than the divisor.',
      });
    }),
    level('g5.pack-reactor.oo-parens', 'Priority Codes', 'number-pad', 2, (rng) => {
      const template = randInt(rng, 0, 2);
      if (template === 0) {
        const a = randInt(rng, 4, 30); const b = randInt(rng, 2, 20); const c = randInt(rng, 2, 9);
        return numPad(`Decode: (${a} + ${b}) × ${c} = ?`, (a + b) * c, {
          visual: { text: `(${a} + ${b}) × ${c}` }, hint: 'Parentheses first.',
        });
      }
      if (template === 1) {
        const c = randInt(rng, 2, 9); const q = randInt(rng, 4, 30); const a = c * q + randInt(rng, 1, c * 4);
        const b = a - c * q;
        return numPad(`Decode: (${a} − ${b}) ÷ ${c} = ?`, q, {
          visual: { text: `(${a} − ${b}) ÷ ${c}` }, hint: 'Subtract inside the parentheses first.',
        });
      }
      const a = randInt(rng, 5, 15); const b = randInt(rng, 4, 9);
      const d = randInt(rng, 2, 9);
      const c = randInt(rng, 1, Math.floor((a * b - 1) / d));
      return numPad(`Decode: ${a} × ${b} − ${c} × ${d} = ?`, a * b - c * d, {
        visual: { text: `${a} × ${b} − ${c} × ${d}` }, hint: 'Multiplications before subtraction.',
      });
    }),
    level('g5.pack-reactor.which-first', 'Which Step First?', 'multiple-choice', 2, (rng) => {
      const a = randInt(rng, 5, 40); const b = randInt(rng, 3, 15);
      const c = randInt(rng, 6, 30); const d = randInt(rng, 2, c - 1);
      const answer = `${c} − ${d}`;
      return mcPool(rng, `In ${a} + ${b} × (${c} − ${d}), which part is calculated first?`, answer,
        [`${a} + ${b}`, `${b} × ${c}`, `${a} + ${b} × ${c}`, `${b} × (${c} − ${d})`],
        { visual: { text: `${a} + ${b} × (${c} − ${d})` }, hint: 'Parentheses always come first.' });
    }),
    level('g5.pack-reactor.chain', 'Chain Command', 'number-pad', 2, (rng) => {
      const b = randInt(rng, 2, 9); const c = randInt(rng, 2, 9);
      const a = randInt(rng, b * c + 5, b * c + 60);
      const d = randInt(rng, 1, 40);
      return numPad(`Run the chain: ${a} − ${b} × ${c} + ${d} = ?`, a - b * c + d, {
        visual: { text: `${a} − ${b} × ${c} + ${d}` },
        hint: 'Multiply first, then work left to right.',
      });
    }),
    level('g5.pack-reactor.oo-nested', 'Nested Brackets', 'number-pad', 3, (rng) => {
      const template = randInt(rng, 0, 1);
      if (template === 0) {
        const c = randInt(rng, 2, 9); const d = randInt(rng, 1, 12);
        const inner = randInt(rng, 1, 15); const b = inner + c + d;
        const a = randInt(rng, 2, 9);
        return numPad(`Decode: ${a} × [${b} − (${c} + ${d})] = ?`, a * inner, {
          visual: { text: `${a} × [${b} − (${c} + ${d})]` }, hint: 'Innermost parentheses first.',
        });
      }
      const c = randInt(rng, 2, 8); const q = randInt(rng, 4, 24);
      const b = randInt(rng, 2, 9); const a = c * q - b * randInt(rng, 1, 5);
      const second = c * q - a;
      return numPad(`Decode: [${a} + ${second}] ÷ ${c} = ?`, q, {
        visual: { text: `[${a} + ${second}] ÷ ${c}` }, hint: 'Add inside the brackets, then divide.',
      });
    }),
    level('g5.pack-reactor.estimate', 'Quick Estimate', 'multiple-choice', 3, (rng) => {
      const a = randInt(rng, 210, 880); const b = randInt(rng, 3, 9);
      const rounded = Math.round(a / 100) * 100;
      const answer = rounded * b;
      return buildMc(`Estimate ${a} × ${b} by rounding ${a} to the nearest hundred first.`,
        { label: String(answer), value: answer },
        [(rounded - 100) * b, (a - (a % 10)) * b, a * b, (rounded + 100) * b].map((value) => ({ label: String(value), value })),
        rng, { hint: `${a} rounds to ${rounded}.` });
    }),
  ],
};

// ---------------------------------------------------------------------------
// Unit 3 — place value
// ---------------------------------------------------------------------------

const digits: UnitDef = {
  id: 'g5.pack-digits',
  title: 'Digit Scope: Place Value & Powers of 10',
  emoji: '🔭',
  domain: 'place-value',
  levels: [
    level('g5.pack-digits.digit-value', 'Digit Value Scan', 'multiple-choice', 1, (rng) => {
      const [a, b, c, d] = randInts(rng, 1, 9, 4);
      const n = a * 1000 + b * 100 + c * 10 + d;
      const digitsArr = [a, b, c, d];
      const scales = [1000, 100, 10, 1];
      const place = randInt(rng, 0, 3);
      const digit = digitsArr[place];
      const answer = decLabel(digit * scales[place], 1000);
      const pool = scales.filter((_, i) => i !== place).map((scale) => decLabel(digit * scale, 1000));
      return mcPool(rng, `In ${decLabel(n, 1000)}, what is the value of the digit ${digit}?`, answer, pool, {
        visual: { text: decLabel(n, 1000) },
        hint: 'Ask which place the digit sits in.',
      });
    }),
    level('g5.pack-digits.pow-mult', 'Power Boost', 'number-pad', 1, (rng) => {
      const n = randInt(rng, 2, 987); const k = randInt(rng, 1, n > 99 ? 2 : 3);
      return numPad(`Boost: ${n} × 10${superscripts[k]} = ?`, n * 10 ** k, {
        visual: { text: `${n} × 10${superscripts[k]}` },
        hint: `Multiplying by 10${superscripts[k]} appends ${k} zero${k > 1 ? 's' : ''}.`,
      });
    }),
    level('g5.pack-digits.pow-div', 'Power Downshift', 'number-pad', 1, (rng) => {
      const k = randInt(rng, 1, 3); const m = randInt(rng, 2, 987);
      const n = m * 10 ** k;
      return numPad(`Downshift: ${n} ÷ 10${superscripts[k]} = ?`, m, {
        visual: { text: `${n} ÷ 10${superscripts[k]}` },
        hint: 'Dividing by a power of 10 removes trailing zeros.',
      });
    }),
    level('g5.pack-digits.shift-dir', 'Point Slide', 'multiple-choice', 1, (rng) => {
      const k = randInt(rng, 1, 3);
      const multiply = rng() < 0.5;
      const value = decLabel(randInt(rng, 12, 987), 100);
      const right = `${k} place${k > 1 ? 's' : ''} to the right`;
      const left = `${k} place${k > 1 ? 's' : ''} to the left`;
      const answer = multiply ? right : left;
      return mcPool(rng, `${value} ${multiply ? '×' : '÷'} 10${superscripts[k]} moves the decimal point how?`, answer,
        [multiply ? left : right,
          `${k + 1} place${k + 1 > 1 ? 's' : ''} to the right`,
          `${k + 1} place${k + 1 > 1 ? 's' : ''} to the left`,
          'The point stays in place'],
        { hint: 'Count the zeros in the power of 10.' });
    }),
    level('g5.pack-digits.expanded', 'Expanded Signals', 'match-pairs', 1, (rng) => {
      const values = new Set<number>();
      while (values.size < 4) values.add(randInt(rng, 1105, 9987));
      const pairs = [...values].map((value) => {
        const o = Math.floor(value / 1000); const t = Math.floor(value / 100) % 10;
        const h = Math.floor(value / 10) % 10; const th = value % 10;
        const parts = [`${o} × 1`];
        if (t) parts.push(`${t} × 0.1`);
        if (h) parts.push(`${h} × 0.01`);
        if (th) parts.push(`${th} × 0.001`);
        return { left: decLabel(value, 1000, 3), right: parts.join(' + ') };
      });
      return matchPairs('Match each decimal code to its expanded form.', pairs.slice(0, 3));
    }),
    level('g5.pack-digits.place-tf', 'Ten Times Check', 'true-false', 1, (rng) => {
      const d = randInt(rng, 1, 9);
      const placeA = pick(rng, [100, 10, 1]);   // tenths, hundredths, thousandths (in thousandths units)
      let placeB = pick(rng, [100, 10, 1]);
      const w1 = randInt(rng, 1, 9); const w2 = randInt(rng, 1, 9);
      const filler = randInt(rng, 0, 9);
      const buildNumber = (whole: number, place: number, fill: number): number => {
        const t = place === 100 ? d : fill;
        const h = place === 10 ? d : (fill + 3) % 10;
        const th = place === 1 ? d : (fill + 7) % 10;
        return whole * 1000 + t * 100 + h * 10 + th;
      };
      const a = buildNumber(w1, placeA, filler);
      let b = buildNumber(w2, placeB, (filler + 4) % 10);
      while (decLabel(b, 1000) === decLabel(a, 1000)) {
        placeB = pick(rng, [100, 10, 1]);
        b = buildNumber(randInt(rng, 1, 9), placeB, randInt(rng, 0, 9));
      }
      const actual = placeA / placeB;
      const claim = pick(rng, [1, 10, 100]);
      const claimText = claim === 1 ? 'the same value as' : `${claim} times the value of`;
      return trueFalse(`The ${d} in ${decLabel(a, 1000)} is ${claimText} the ${d} in ${decLabel(b, 1000)}.`, actual === claim, {
        visual: { text: `${decLabel(a, 1000)}   ${decLabel(b, 1000)}` },
        hint: 'A digit one place to the left is worth 10 times more.',
      });
    }),
    level('g5.pack-digits.pow-shift', 'Shift the Decimal', 'multiple-choice', 2, (rng) => {
      const template = randInt(rng, 0, 2);
      if (template === 0) {
        const n = randInt(rng, 12, 98); // 0.0n thousandths-scale
        const answer = n * 1000;
        return decMc(rng, `${decLabel(n, 1000)} × 10³ = ?`, answer, 1000,
          [n * 100, n * 10, n * 10000], { hint: '× 1000 moves the point 3 places right.' });
      }
      if (template === 1) {
        const n = randInt(rng, 12, 98);
        const answer = n * 10; // a.b ÷ 10 → 0.0ab? careful: (n tenths)/10 = n hundredths
        return decMc(rng, `${decLabel(n, 10)} ÷ 10 = ?`, answer, 1000,
          [n * 1000, n, n * 10000], { hint: '÷ 10 moves the point 1 place left.' });
      }
      const n = randInt(rng, 112, 987);
      const answer = n * 100; // a.bcd × 100 → shifts 2 right
      return decMc(rng, `${decLabel(n, 1000)} × 10² = ?`, answer, 1000,
        [n * 10, n, n * 1000], { hint: '× 100 moves the point 2 places right.' });
    }),
    level('g5.pack-digits.name-decimal', 'Name the Signal', 'multiple-choice', 2, (rng) => {
      const o = randInt(rng, 1, 9); const ths = randInt(rng, 105, 989);
      const value = o * 1000 + ths;
      const name = `${numWords(o)} and ${numWords(ths)} thousandths`;
      const reversed = Number(String(ths).padStart(3, '0').split('').reverse().join(''));
      const candidates = [
        o * 100 + (ths % 100),
        ths,
        o * 1000 + (reversed <= 999 ? reversed : ths + 1),
        (o + 1) * 1000 + ths,
        o * 1000 + (ths % 100) * 10 + Math.floor(ths / 100),
      ];
      return decMc(rng, `Write the number: "${name}".`, value, 1000, candidates, {
        hint: 'Thousandths need three digits after the point.',
      });
    }),
    level('g5.pack-digits.name-reverse', 'Read the Code', 'multiple-choice', 2, (rng) => {
      const o = randInt(rng, 1, 9); const ths = randInt(rng, 105, 989);
      const value = o * 1000 + ths;
      const answer = `${numWords(o)} and ${numWords(ths)} thousandths`;
      const pool = [
        `${numWords(o)} and ${numWords(ths)} hundredths`,
        `${numWords(ths)} thousandths`,
        `${numWords(o)} hundred ${numWords(ths % 100)} thousandths`,
        `${numWords(o + 1)} and ${numWords(ths)} thousandths`,
      ];
      return mcPool(rng, `Which is the word form of ${decLabel(value, 1000, 3)}?`, answer, pool, {
        hint: 'The last digit names the place: thousandths.',
      });
    }),
    level('g5.pack-digits.in-thousandths', 'Thousandth Counter', 'number-pad', 3, (rng) => {
      const mode = randInt(rng, 0, 2);
      if (mode === 0) {
        const v = randInt(rng, 1234, 9876);
        return numPad(`How many thousandths are in ${decLabel(v, 1000, 3)}?`, v, {
          hint: 'Think of the number as a fraction over 1000.',
        });
      }
      if (mode === 1) {
        const v = randInt(rng, 123, 987);
        return numPad(`How many hundredths are in ${decLabel(v, 100)}?`, v, {
          hint: 'Think of the number as a fraction over 100.',
        });
      }
      const v = randInt(rng, 12, 98);
      return numPad(`How many hundredths are in ${decLabel(v, 10)}?`, v * 10, {
        hint: `${decLabel(v, 10)} = ${decLabel(v * 10, 100)}`,
      });
    }),
    level('g5.pack-digits.digit-ratio', 'Same Digit, New Value', 'multiple-choice', 3, (rng) => {
      const d = randInt(rng, 1, 9);
      const mode = randInt(rng, 0, 2);
      let prompt: string; let answer: string;
      if (mode === 0) {
        prompt = `In ${d}.${d}${d}, the tenths digit is how many times the hundredths digit?`;
        answer = '10';
      } else if (mode === 1) {
        prompt = `In ${d}${d}.${d}, the tens digit is how many times the tenths digit?`;
        answer = '100';
      } else {
        prompt = `In ${d}.${d}${d}${d}, the tenths digit is how many times the thousandths digit?`;
        answer = '100';
      }
      return mcPool(rng, prompt, answer, ['1', '10', '100', '1000'], {
        visual: { text: prompt.split('In ')[1].split(',')[0] },
        hint: 'Each place to the left is worth 10 times the next.',
      });
    }),
  ],
};

// ---------------------------------------------------------------------------
// Unit 4 — fractions: add & subtract
// ---------------------------------------------------------------------------

const fractionFusion: UnitDef = {
  id: 'g5.pack-fraction-fusion',
  title: 'Fraction Fusion: Add & Subtract',
  emoji: '🧪',
  domain: 'fractions',
  levels: [
    level('g5.pack-fraction-fusion.add-like', 'Same-Denominator Mix', 'multiple-choice', 1, (rng) => {
      const d = randInt(rng, 3, 12);
      const [a, b] = randInts(rng, 1, d - 1, 2);
      const answer = simplify({ n: a + b, d });
      return fracMc(rng, `Charge the reactor: ${a}/${d} + ${b}/${d} = ?`, answer,
        [simplify({ n: a + b, d: d * 2 }), simplify({ n: Math.abs(a - b), d }), simplify({ n: a + b + 1, d })],
        { hint: 'Keep the denominator and add the numerators.' });
    }),
    level('g5.pack-fraction-fusion.sub-like', 'Vent the Same Units', 'multiple-choice', 1, (rng) => {
      const d = randInt(rng, 3, 12);
      const [low, high] = randInts(rng, 1, d - 1, 2);
      const answer = simplify({ n: high - low, d });
      return fracMc(rng, `Vent: ${high}/${d} − ${low}/${d} = ?`, answer,
        [simplify({ n: high + low, d }), simplify({ n: high - low, d: d * 2 }), simplify({ n: high - low + 1, d })],
        { hint: 'Keep the denominator and subtract the numerators.' });
    }),
    level('g5.pack-fraction-fusion.add-unit', 'Unit-Fraction Fusion', 'multiple-choice', 1, (rng) => {
      const [a, b] = randInts(rng, 2, 9, 2);
      const answer = add({ n: 1, d: a }, { n: 1, d: b });
      return fracMc(rng, `Fuse: 1/${a} + 1/${b} = ?`, answer,
        [simplify({ n: 2, d: a + b }), simplify({ n: 1, d: a * b }), simplify({ n: 2, d: a * b })],
        { hint: `Use common denominator ${a} × ${b}.` });
    }),
    level('g5.pack-fraction-fusion.sub-whole', 'Drain the Whole', 'multiple-choice', 1, (rng) => {
      const whole = randInt(rng, 1, 4);
      const f = properFraction(rng);
      const answer = sub({ n: whole, d: 1 }, f);
      return fracMc(rng, `The tank holds ${whole}. Drain ${fracLabel(f)}: ${whole} − ${fracLabel(f)} = ?`, answer,
        [f, simplify({ n: whole * f.d + f.n, d: f.d }), simplify({ n: whole + f.n, d: f.d }), { n: 1, d: f.d }],
        { hint: `Rename ${whole} as ${whole * f.d}/${f.d}.` });
    }),
    level('g5.pack-fraction-fusion.add-unlike', 'Cross-Feed Addition', 'multiple-choice', 2, (rng) => {
      const a = properFraction(rng); let b = properFraction(rng);
      while (b.d === a.d) b = properFraction(rng);
      const answer = add(a, b);
      return fracMc(rng, `Fuse: ${a.n}/${a.d} + ${b.n}/${b.d} = ?`, answer,
        [
          simplify({ n: a.n + b.n, d: a.d + b.d }),
          simplify({ n: a.n * b.d + b.n, d: a.d * b.d }),
          simplify({ n: answer.n + answer.d, d: answer.d }),
          simplify({ n: a.n * b.n, d: a.d * b.d }),
        ], { hint: 'Rename both fractions with a common denominator first.' });
    }),
    level('g5.pack-fraction-fusion.sub-unlike', 'Cross-Feed Subtraction', 'multiple-choice', 2, (rng) => {
      let a = properFraction(rng); let b = properFraction(rng);
      while (b.d === a.d || compare(a, b) <= 0) { a = properFraction(rng); b = properFraction(rng); }
      const answer = sub(a, b);
      return fracMc(rng, `Vent: ${a.n}/${a.d} − ${b.n}/${b.d} = ?`, answer,
        [
          simplify({ n: a.n * b.d - b.n, d: a.d * b.d }),
          simplify({ n: Math.abs(a.n - b.n), d: Math.abs(a.d - b.d) + 1 }),
          simplify({ n: a.n * b.d - b.n * a.d + a.d, d: a.d * b.d }),
        ], { hint: 'Common denominator first, then subtract the numerators.' });
    }),
    level('g5.pack-fraction-fusion.add-mixed', 'Mixed Merge', 'multiple-choice', 2, (rng) => {
      const first = mixedNumber(rng, 1, 4); let second = mixedNumber(rng, 1, 3);
      while (second.d === first.d) second = mixedNumber(rng, 1, 3);
      const answer = add(first, second);
      return fracMc(rng, `Merge: ${mixedLabel(first)} + ${mixedLabel(second)} = ?`, answer,
        [
          simplify({ n: first.n + second.n, d: first.d + second.d }),
          simplify({ n: answer.n + answer.d, d: answer.d }),
          simplify({ n: answer.n - 1, d: answer.d }),
        ], { hint: 'Convert to improper fractions or add wholes and parts separately.' });
    }),
    level('g5.pack-fraction-fusion.sub-mixed', 'Borrow Brigade', 'multiple-choice', 2, (rng) => {
      let partA = properFraction(rng, 2, 9); let partB = properFraction(rng, 2, 9);
      while (partB.d === partA.d || compare(partB, partA) <= 0) { partA = properFraction(rng, 2, 9); partB = properFraction(rng, 2, 9); }
      const w1 = randInt(rng, 3, 7); const w2 = randInt(rng, 1, w1 - 2);
      const first: Frac = { n: w1 * partA.d + partA.n, d: partA.d };
      const second: Frac = { n: w2 * partB.d + partB.n, d: partB.d };
      const answer = sub(first, second);
      return fracMc(rng, `Subtract with a trade: ${mixedLabel(first)} − ${mixedLabel(second)} = ?`, answer,
        [
          add(first, second),
          simplify({ n: first.n - second.n, d: Math.abs(first.d - second.d) + 1 }),
          simplify({ n: answer.n + answer.d, d: answer.d }),
          simplify({ n: Math.max(1, answer.n - 1), d: answer.d }),
        ], { hint: 'Borrow 1 from the whole part before subtracting the fractions.' });
    }),
    level('g5.pack-fraction-fusion.add-three', 'Triple Fusion', 'multiple-choice', 2, (rng) => {
      const ds = drawDistinctDenominators(rng);
      const fracs = ds.map((d) => properFractionWithDenominator(rng, d));
      const answer = add(add(fracs[0], fracs[1]), fracs[2]);
      return fracMc(rng, `Fuse all three: ${fracs.map((f) => `${f.n}/${f.d}`).join(' + ')} = ?`, answer,
        [
          simplify({ n: fracs[0].n + fracs[1].n + fracs[2].n, d: ds[0] + ds[1] + ds[2] }),
          sub(answer, { n: 1, d: answer.d }),
          add(answer, { n: 1, d: answer.d }),
          simplify({ n: answer.n, d: answer.d + 1 }),
        ], { hint: 'Find one common denominator for all three.' });
    }),
    level('g5.pack-fraction-fusion.benchmark', 'Benchmark Radar', 'true-false', 2, (rng) => {
      const a = properFraction(rng); const b = properFraction(rng);
      const sum = add(a, b);
      const claim = randInt(rng, 0, 2);
      const statement = claim === 0
        ? `less than 1/2`
        : claim === 1 ? 'between 1/2 and 1' : 'greater than 1';
      const truth = claim === 0 ? compare(sum, { n: 1, d: 2 }) < 0
        : claim === 1 ? compare(sum, { n: 1, d: 2 }) > 0 && compare(sum, { n: 1, d: 1 }) < 0
          : compare(sum, { n: 1, d: 1 }) > 0;
      return trueFalse(`${a.n}/${a.d} + ${b.n}/${b.d} is ${statement}.`, truth, {
        hint: 'Estimate each fraction against 1/2 before adding.',
      });
    }),
    level('g5.pack-fraction-fusion.missing-addend', 'The Missing Charge', 'multiple-choice', 3, (rng) => {
      let a = properFraction(rng); let total = properFraction(rng);
      while (total.d === a.d || compare(total, a) <= 0) { a = properFraction(rng); total = properFraction(rng); }
      const answer = sub(total, a);
      return fracMc(rng, `${a.n}/${a.d} + ___ = ${fracLabel(total)}. What fills the gap?`, answer,
        [add(total, a), a, simplify({ n: answer.n + answer.d, d: answer.d })],
        { hint: 'Subtract the known part from the total.' });
    }),
    level('g5.pack-fraction-fusion.word', 'Galley Fractions', 'multiple-choice', 3, (rng) => {
      const mode = randInt(rng, 0, 1);
      let a = properFraction(rng, 2, 8); let b = properFraction(rng, 2, 8);
      while (b.d === a.d) b = properFraction(rng, 2, 8);
      const item = pick(rng, stationSnacks);
      if (mode === 0) {
        const answer = add(a, b);
        return fracMc(rng, `The galley serves ${fracLabel(a)} kg of ${item} on shift 1 and ${fracLabel(b)} kg on shift 2. How much in all?`, answer,
          [
            simplify({ n: a.n + b.n, d: a.d + b.d }),
            simplify({ n: Math.abs(a.n * b.d - b.n * a.d), d: a.d * b.d }),
            simplify({ n: answer.n + answer.d, d: answer.d }),
          ], { hint: 'Add the two amounts with a common denominator.' });
      }
      while (compare(a, b) <= 0) { a = properFraction(rng, 2, 8); b = properFraction(rng, 2, 8); }
      const answer = sub(a, b);
      return fracMc(rng, `Shift 1 ate ${fracLabel(a)} kg of ${item} and shift 2 ate ${fracLabel(b)} kg. How much more did shift 1 eat?`, answer,
        [
          add(a, b),
          simplify({ n: a.n - b.n, d: a.d + b.d }),
          simplify({ n: answer.n + 1, d: answer.d }),
        ], { hint: 'Subtract the smaller amount from the larger.' });
    }),
  ],
};

function drawDistinctDenominators(rng: () => number): number[] {
  return shuffle(rng, [2, 3, 4, 6]).slice(0, 3);
}

function properFractionWithDenominator(rng: () => number, d: number): Frac {
  let n = randInt(rng, 1, d - 1);
  while (gcd(n, d) !== 1) n = randInt(rng, 1, d - 1);
  return { n, d };
}

// ---------------------------------------------------------------------------
// Unit 5 — fractions: multiply & divide
// ---------------------------------------------------------------------------

const gravityForge: UnitDef = {
  id: 'g5.pack-gravity',
  title: 'Gravity Forge: Multiply & Divide Fractions',
  emoji: '🪐',
  domain: 'fractions',
  levels: [
    level('g5.pack-gravity.of-set', 'Fraction of a Crew', 'number-pad', 1, (rng) => {
      const d = pick(rng, [2, 3, 4, 5, 6, 8, 10, 12]);
      const n = randInt(rng, 1, d - 1);
      const total = d * randInt(rng, 2, 9);
      const answer = (total / d) * n;
      const thing = pick(rng, cargoThings);
      return numPad(`What is ${n}/${d} of ${total} ${thing}?`, answer, {
        visual: { text: `${n}/${d} of ${total}` },
        hint: `Divide ${total} into ${d} equal groups first.`,
      });
    }),
    level('g5.pack-gravity.times-whole', 'Whole-Number Boost', 'multiple-choice', 1, (rng) => {
      const f = properFraction(rng, 2, 9);
      const whole = randInt(rng, 2, 8);
      const answer = mul(f, { n: whole, d: 1 });
      return fracMc(rng, `Boost: ${fracLabel(f)} × ${whole} = ?`, answer,
        [
          simplify({ n: f.n + whole, d: f.d }),
          simplify({ n: f.n, d: f.d * whole }),
          simplify({ n: f.n * whole, d: 1 }),
        ], { hint: 'Multiply the numerator by the whole number.' });
    }),
    level('g5.pack-gravity.times-frac', 'Fraction × Fraction', 'multiple-choice', 2, (rng) => {
      const a = properFraction(rng, 2, 9); const b = properFraction(rng, 2, 9);
      const answer = mul(a, b);
      return fracMc(rng, `Multiply: ${a.n}/${a.d} × ${b.n}/${b.d} = ?`, answer,
        [
          simplify({ n: a.n + b.n, d: a.d + b.d }),
          simplify({ n: a.n * b.d + b.n * a.d, d: a.d * b.d }),
          simplify({ n: a.n * b.n, d: a.d + b.d }),
          simplify({ n: a.n * b.d, d: a.d * b.n }),
        ], { hint: 'Top × top, bottom × bottom, then simplify.' });
    }),
    level('g5.pack-gravity.area', 'Greenhouse Plot Area', 'multiple-choice', 2, (rng) => {
      const a = properFraction(rng, 2, 7); const b = properFraction(rng, 2, 7);
      const answer = mul(a, b);
      return fracMc(rng, `A greenhouse bed is ${fracLabel(a)} m by ${fracLabel(b)} m. What is its area in m²?`, answer,
        [
          add(a, b),
          simplify({ n: a.n + b.n, d: a.d * b.d }),
          simplify({ n: a.n * b.n, d: a.d + b.d }),
        ], { hint: 'Area = length × width, even for fractions.' });
    }),
    level('g5.pack-gravity.mixed-times', 'Mixed Thrust', 'multiple-choice', 2, (rng) => {
      const whole = randInt(rng, 2, 6);
      const part = properFraction(rng, 2, 6);
      const mixed: Frac = { n: whole * part.d + part.n, d: part.d };
      const factor = randInt(rng, 2, 5);
      const answer = mul(mixed, { n: factor, d: 1 });
      return fracMc(rng, `Boost: ${mixedLabel(mixed)} × ${factor} = ?`, answer,
        [
          simplify({ n: whole * factor * part.d + part.n, d: part.d }),
          simplify({ n: mixed.n + factor, d: mixed.d }),
          simplify({ n: mixed.n, d: mixed.d * factor }),
        ], { hint: 'Rename the mixed number as an improper fraction first.' });
    }),
    level('g5.pack-gravity.unit-div', 'Split a Unit Fraction', 'multiple-choice', 2, (rng) => {
      const k = randInt(rng, 2, 9); const m = randInt(rng, 2, 7);
      const answer = div({ n: 1, d: k }, { n: m, d: 1 });
      return fracMc(rng, `A 1/${k} ration bar is split among ${m} cadets: 1/${k} ÷ ${m} = ?`, answer,
        [
          { n: m, d: k },
          { n: k, d: m },
          simplify({ n: 1, d: k + m }),
        ], { hint: 'Dividing by m makes m times as many shares, each m times smaller.' });
    }),
    level('g5.pack-gravity.whole-div-unit', 'How Many Fit?', 'number-pad', 2, (rng) => {
      const m = randInt(rng, 2, 12); const k = randInt(rng, 2, 9);
      const thing = pick(rng, ['reserve tank', 'battery pack', 'coolant drum', 'grain silo']);
      return numPad(`The ${thing} holds ${m} full units. How many 1/${k}-unit portions fit inside?  (${m} ÷ 1/${k})`, m * k, {
        visual: { text: `${m} ÷ 1/${k}` },
        hint: 'Each unit holds k portions.',
      });
    }),
    level('g5.pack-gravity.servings', 'Serving Splitter', 'number-pad', 2, (rng) => {
      const k = pick(rng, [2, 3, 4, 5, 8]);
      const m = randInt(rng, 2, 9);
      const food = pick(rng, stationSnacks);
      return numPad(`The galley has ${m} trays of ${food}. Each serving is 1/${k} of a tray. How many servings is that?`, m * k, {
        hint: `Every tray makes ${k} servings.`,
      });
    }),
    level('g5.pack-gravity.frac-div-whole', 'Share the Remainder', 'multiple-choice', 2, (rng) => {
      const f = properFraction(rng, 2, 8); const m = randInt(rng, 2, 6);
      const answer = div(f, { n: m, d: 1 });
      return fracMc(rng, `Split ${fracLabel(f)} of a tank equally among ${m} crews: ${fracLabel(f)} ÷ ${m} = ?`, answer,
        [
          mul(f, { n: m, d: 1 }),
          simplify({ n: f.n * m, d: f.d }),
          simplify({ n: f.n, d: f.d + m }),
        ], { hint: 'Dividing by m is the same as multiplying by 1/m.' });
    }),
    level('g5.pack-gravity.scaling', 'Scale Sense', 'true-false', 3, (rng) => {
      const n = randInt(rng, 2, 20);
      const mode = randInt(rng, 0, 2);
      const factor = mode === 0 ? properFraction(rng, 2, 8)
        : mode === 1 ? { n: 1, d: 1 }
          : (() => {
            const d = randInt(rng, 2, 6); const nn = randInt(rng, d + 1, d * 2 - 1);
            return simplify({ n: nn, d });
          })();
      const label = factor.d === 1 ? String(factor.n) : fracLabel(factor);
      const relation = pick(rng, ['greater than', 'less than', 'equal to']);
      const cmp = compare(mul({ n, d: 1 }, factor), { n, d: 1 });
      const truth = relation === 'greater than' ? cmp > 0 : relation === 'less than' ? cmp < 0 : cmp === 0;
      return trueFalse(`${n} × ${label} is ${relation} ${n}.`, truth, {
        hint: 'A factor below 1 shrinks the number; above 1 grows it.',
      });
    }),
    level('g5.pack-gravity.recipe', 'Galley Recipe Scale', 'multiple-choice', 3, (rng) => {
      const per = properFraction(rng, 2, 6);
      const batches = randInt(rng, 3, 8);
      const answer = mul(per, { n: batches, d: 1 });
      const food = pick(rng, ['algae wraps', 'moon muffins', 'space oats', 'comet stew']);
      return fracMc(rng, `One batch of ${food} needs ${fracLabel(per)} cup of starch. How much for ${batches} batches?`, answer,
        [
          simplify({ n: per.n + batches, d: per.d }),
          simplify({ n: per.n, d: per.d * batches }),
          add(per, { n: batches, d: 1 }),
        ], { hint: `Multiply ${fracLabel(per)} by ${batches}.` });
    }),
    level('g5.pack-gravity.compare-products', 'Greatest Harvest', 'multiple-choice', 3, (rng) => {
      const ofs = shuffle(rng, [12, 16, 18, 20, 24, 28]).slice(0, 4);
      const combos = ofs.map((of) => ({ frac: properFraction(rng, 2, 6), of }));
      const valuesOf = () => combos.map(({ frac, of }) => mul(frac, { n: of, d: 1 }));
      let best = 0;
      for (let attempt = 0; attempt < 30; attempt += 1) {
        const values = valuesOf();
        best = values.reduce((top, v, i) => (compare(v, values[top]) > 0 ? i : top), 0);
        const tied = values.some((v, i) => i !== best && compare(v, values[best]) === 0);
        if (!tied) break;
        const tiedIndex = values.findIndex((v, i) => i !== best && compare(v, values[best]) === 0);
        combos[tiedIndex] = { frac: properFraction(rng, 2, 6), of: ofs[tiedIndex] };
      }
      const labels = combos.map(({ frac, of }) => `${fracLabel(frac)} of ${of}`);
      return mcPool(rng, 'Which harvest is greatest?', labels[best], labels.filter((_, i) => i !== best), {
        hint: 'Find each fraction of the whole, then compare.',
      });
    }),
  ],
};

// ---------------------------------------------------------------------------
// Unit 6 — decimals
// ---------------------------------------------------------------------------

const dock: UnitDef = {
  id: 'g5.pack-dock',
  title: 'Docking Bay: Decimal Ops',
  emoji: '🛰️',
  domain: 'decimals',
  levels: [
    level('g5.pack-dock.add-tenths', 'Tenths Top-Up', 'multiple-choice', 1, (rng) => {
      const a = randInt(rng, 11, 85); const b = randInt(rng, 11, 85);
      const answer = a + b;
      return decMc(rng, `Fuel log: ${decLabel(a, 10)} + ${decLabel(b, 10)} = ?`, answer, 10,
        [answer + 10, Math.max(1, answer - 10), a + Math.floor(b / 10) + 1],
        { hint: 'Line up the decimal points.' });
    }),
    level('g5.pack-dock.sub-tenths', 'Tenths Burn-Off', 'multiple-choice', 1, (rng) => {
      const b = randInt(rng, 11, 80); const a = randInt(rng, b + 5, b + 85);
      const answer = a - b;
      return decMc(rng, `Fuel log: ${decLabel(a, 10)} − ${decLabel(b, 10)} = ?`, answer, 10,
        [answer + 10, Math.max(1, answer - 10), a + b],
        { hint: 'Line up the decimal points.' });
    }),
    level('g5.pack-dock.compare', 'Radar Readings', 'multiple-choice', 1, (rng) => {
      const values = new Set<number>();
      while (values.size < 4) {
        values.add(pick(rng, [randInt(rng, 1, 9) * 100, randInt(rng, 10, 99) * 10, randInt(rng, 100, 999)]));
      }
      const list = [...values];
      const greatest = rng() < 0.5;
      const target = greatest ? Math.max(...list) : Math.min(...list);
      const answer = decLabel(target, 1000);
      const pool = list.filter((v) => v !== target).map((v) => decLabel(v, 1000));
      return mcPool(rng, `Which sensor reading is ${greatest ? 'greatest' : 'least'}?`, answer, pool, {
        hint: 'Compare digits place by place from the left.',
      });
    }),
    level('g5.pack-dock.add-hundredths', 'Hundredths Refuel', 'multiple-choice', 1, (rng) => {
      const a = randInt(rng, 105, 855); const b = randInt(rng, 105, 855);
      const answer = a + b;
      return decMc(rng, `Fuel log: ${decLabel(a, 100)} + ${decLabel(b, 100)} = ?`, answer, 100,
        [answer + 100, Math.max(1, answer - 100), a + Math.floor(b / 10), answer + 10],
        { hint: 'Hundredths line up with hundredths.' });
    }),
    level('g5.pack-dock.mult-whole', 'Decimal Boost', 'multiple-choice', 1, (rng) => {
      const a = randInt(rng, 12, 95); // tenths
      const n = randInt(rng, 2, 8);
      const answer = a * n; // hundredths
      return decMc(rng, `Scale the formula: ${decLabel(a, 10)} × ${n} = ?`, answer, 100,
        [answer * 10, Math.floor(answer / 10), answer + 100, a * 10 + n * 10],
        { hint: `Multiply ${a} tenths by ${n}, then place the point.` });
    }),
    level('g5.pack-dock.sub-align', 'Alignment Check', 'multiple-choice', 2, (rng) => {
      const a = randInt(rng, 150, 955); // hundredths
      const b = randInt(rng, 15, Math.min(88, Math.floor(a / 10) - 2)); // tenths
      const answer = a - b * 10;
      return decMc(rng, `Fuel log: ${decLabel(a, 100)} − ${decLabel(b, 10)} = ?`, answer, 100,
        [a - b, answer - 10, answer + 10, Math.max(1, a - b * 100)],
        { hint: `Rewrite ${decLabel(b, 10)} as ${decLabel(b * 10, 100)} before subtracting.` });
    }),
    level('g5.pack-dock.round', 'Rounding Ring', 'multiple-choice', 2, (rng) => {
      const v = randInt(rng, 1005, 9895);
      const place = pick(rng, [0, 1, 2]);
      const divisor = [1000, 100, 10][place];
      const rounded = roundDecimal(v, 1000, place);
      const placeName = ['whole number', 'tenth', 'hundredth'][place];
      const candidates = [
        Math.floor(v / divisor) * divisor,
        rounded + divisor,
        Math.max(0, rounded - divisor),
        roundDecimal(v, 1000, (place + 1) % 3),
      ];
      return decMc(rng, `Round ${decLabel(v, 1000, 3)} to the nearest ${placeName}.`, rounded, 1000,
        candidates, { hint: 'Check the digit one place to the right of the rounding place.' });
    }),
    level('g5.pack-dock.order', 'Docking Order', 'order-sequence', 2, (rng) => {
      const values = new Set<number>();
      while (values.size < 5) {
        const precision = randInt(rng, 0, 2);
        values.add(precision === 0 ? randInt(rng, 1, 9) * 100
          : precision === 1 ? randInt(rng, 10, 99) * 10 : randInt(rng, 100, 999));
      }
      const sequence = [...values].sort((x, y) => x - y).map((v) => decLabel(v, 1000));
      return orderSeq('Order the docking codes from least to greatest.', sequence);
    }),
    level('g5.pack-dock.missing-addend', 'The Missing Reading', 'multiple-choice', 2, (rng) => {
      const a = randInt(rng, 15, 80); const total = randInt(rng, a + 10, a + 95);
      const answer = total - a;
      return decMc(rng, `${decLabel(a, 10)} + ___ = ${decLabel(total, 10)}. Which reading fills the gap?`, answer, 10,
        [answer + 10, Math.max(1, answer - 10), total, total + a],
        { hint: 'Subtract the known reading from the total.' });
    }),
    level('g5.pack-dock.mult-tenths', 'Tenth × Tenth', 'multiple-choice', 3, (rng) => {
      const a = randInt(rng, 2, 9); const b = randInt(rng, 2, 9);
      const answer = a * b; // hundredths
      return decMc(rng, `Multiply: 0.${a} × 0.${b} = ?`, answer, 100,
        [answer * 10, Math.max(1, Math.floor(answer / 10)), (a + b) * 10, a * b + 10],
        { hint: `${a} × ${b} = ${a * b}; two decimal places in the product.` });
    }),
    level('g5.pack-dock.div-whole', 'Decimal Split', 'multiple-choice', 3, (rng) => {
      const divisor = pick(rng, [2, 3, 4, 5, 6, 8]);
      const quotient = randInt(rng, 11, 85); // tenths
      const dividend = quotient * divisor; // tenths
      return decMc(rng, `Split: ${decLabel(dividend, 10)} ÷ ${divisor} = ?`, quotient, 10,
        [quotient * 10, Math.floor(quotient / 10), quotient + 10, Math.max(1, quotient - divisor)],
        { hint: 'Divide as usual, then place the point above.' });
    }),
    level('g5.pack-dock.div-tenths', 'Tenth Divisor', 'multiple-choice', 3, (rng) => {
      const divisorTenths = pick(rng, [2, 4, 5, 8]); // 0.2, 0.4, 0.5, 0.8
      const quotient = randInt(rng, 3, 15); // whole or .5 steps stored as tenths
      const dividend = divisorTenths * quotient * 10; // hundredths
      return decMc(rng, `Split: ${decLabel(dividend, 100)} ÷ ${decLabel(divisorTenths, 10)} = ?`, quotient * 10, 10,
        [quotient * 100, quotient, quotient * 10 + divisorTenths],
        { hint: `How many ${decLabel(divisorTenths, 10)}s fit inside ${decLabel(dividend, 100)}?` });
    }),
  ],
};

// ---------------------------------------------------------------------------
// Unit 7 — geometry (coordinate plane + shape hierarchy)
// ---------------------------------------------------------------------------

const starChart: UnitDef = {
  id: 'g5.pack-star-chart',
  title: 'Star Chart: Coordinates & Shape Families',
  emoji: '🗺️',
  domain: 'geometry',
  levels: [
    level('g5.pack-star-chart.beacon', 'Mark the Beacon', 'multiple-choice', 1, (rng) => {
      const x = randInt(rng, 1, 8); let y = randInt(rng, 1, 8);
      while (y === x) y = randInt(rng, 1, 8);
      const answer = `(${x}, ${y})`;
      return mcPool(rng, `A beacon sits ${x} units right and ${y} units up from the origin. Which ordered pair marks it?`, answer,
        [`(${y}, ${x})`, `(${x + 1}, ${y})`, `(${x}, ${y + 1})`, `(${x}, ${y - 1 > 0 ? y - 1 : y + 2})`],
        { hint: 'Ordered pairs are (right, up) — x first, then y.' });
    }),
    level('g5.pack-star-chart.coord-name', 'X or Y?', 'multiple-choice', 1, (rng) => {
      const x = randInt(rng, 2, 9); let y = randInt(rng, 2, 9);
      while (y === x) y = randInt(rng, 2, 9);
      const askX = rng() < 0.5;
      const answer = String(askX ? x : y);
      return mcPool(rng, `In the ordered pair (${x}, ${y}), which number is the ${askX ? 'x' : 'y'}-coordinate?`, answer,
        [String(askX ? y : x), String(x + y), `(${x}, ${y})`, String(Math.abs(x - y))],
        { hint: `The ${askX ? 'x' : 'y'}-coordinate is the ${askX ? 'first' : 'second'} number.` });
    }),
    level('g5.pack-star-chart.dist-h', 'Horizontal Hop', 'number-pad', 1, (rng) => {
      const y = randInt(rng, 1, 9);
      const [x1, x2] = randInts(rng, 0, 9, 2);
      return numPad(`Two relays sit at (${x1}, ${y}) and (${x2}, ${y}). How many units apart are they?`, Math.abs(x2 - x1), {
        visual: { text: `(${x1}, ${y})   (${x2}, ${y})` },
        hint: 'Same y-coordinate — subtract the x values.',
      });
    }),
    level('g5.pack-star-chart.dist-v', 'Vertical Hop', 'number-pad', 1, (rng) => {
      const x = randInt(rng, 1, 9);
      const [y1, y2] = randInts(rng, 0, 9, 2);
      return numPad(`Two relays sit at (${x}, ${y1}) and (${x}, ${y2}). How many units apart are they?`, Math.abs(y2 - y1), {
        visual: { text: `(${x}, ${y1})   (${x}, ${y2})` },
        hint: 'Same x-coordinate — subtract the y values.',
      });
    }),
    level('g5.pack-star-chart.move', 'Relay Move', 'multiple-choice', 1, (rng) => {
      const sx = randInt(rng, 1, 5); const sy = randInt(rng, 1, 5);
      const r = randInt(rng, 1, 4); let u = randInt(rng, 1, 4);
      while (u === r) u = randInt(rng, 1, 4);
      const answer = `(${sx + r}, ${sy + u})`;
      return mcPool(rng, `A drone starts at (${sx}, ${sy}) and moves ${r} right and ${u} up. Where does it land?`, answer,
        [`(${sx + u}, ${sy + r})`, `(${sx + r}, ${sy + u + 1})`, `(${sx + r + 1}, ${sy + u})`, `(${sx}, ${sy + u})`],
        { hint: 'Right adds to x; up adds to y.' });
    }),
    level('g5.pack-star-chart.axis-tf', 'Line-Up Check', 'true-false', 1, (rng) => {
      const sameAxis = rng() < 0.5;
      const claim = pick(rng, ['vertical', 'horizontal']);
      let x1: number; let x2: number; let y1: number; let y2: number;
      if (sameAxis) {
        x1 = randInt(rng, 0, 9); x2 = x1;
        [y1, y2] = randInts(rng, 0, 9, 2);
      } else {
        y1 = randInt(rng, 0, 9); y2 = y1;
        [x1, x2] = randInts(rng, 0, 9, 2);
      }
      const actual = x1 === x2 ? 'vertical' : 'horizontal';
      return trueFalse(`(${x1}, ${y1}) and (${x2}, ${y2}) lie on the same ${claim} line.`, claim === actual, {
        hint: 'Same x means a vertical line; same y means horizontal.',
      });
    }),
    level('g5.pack-star-chart.shape-tf', 'Family Tree Facts', 'true-false', 2, (rng) => {
      const [statement, truth] = pick(rng, shapeStatements);
      return trueFalse(statement, truth, {
        hint: 'Check whether it holds for every shape in that family.',
      });
    }),
    level('g5.pack-star-chart.missing-angle', 'Hull Angle Check', 'number-pad', 2, (rng) => {
      const quad = rng() < 0.5;
      if (quad) {
        const a = randInt(rng, 40, 140); const b = randInt(rng, 40, 140);
        const c = randInt(rng, 30, Math.min(150, 340 - a - b));
        const answer = 360 - a - b - c;
        return numPad(`A hull panel is a quadrilateral with angles ${a}°, ${b}°, and ${c}°. Find the fourth angle.`, answer, {
          visual: { text: `${a}° + ${b}° + ${c}° + ? = 360°` },
          hint: 'Quadrilateral angles add to 360°.',
        });
      }
      const a = randInt(rng, 25, 120); const b = randInt(rng, 15, Math.min(155 - a, 140));
      const answer = 180 - a - b;
      return numPad(`A triangular sail has angles ${a}° and ${b}°. Find the third angle.`, answer, {
        visual: { text: `${a}° + ${b}° + ? = 180°` },
        hint: 'Triangle angles add to 180°.',
      });
    }),
    level('g5.pack-star-chart.rect-perim', 'Deck Perimeter', 'number-pad', 2, (rng) => {
      const [x1, x2] = randInts(rng, 0, 9, 2); const [y1, y2] = randInts(rng, 1, 9, 2);
      const dx = x2 - x1; const dy = y2 - y1;
      return numPad(`A cargo deck has corners (${x1}, ${y1}), (${x2}, ${y1}), (${x2}, ${y2}), (${x1}, ${y2}). What is its perimeter in units?`, 2 * (dx + dy), {
        visual: { text: `width ${dx}, height ${dy}` },
        hint: 'Perimeter = 2 × (width + height).',
      });
    }),
    level('g5.pack-star-chart.rect-area', 'Deck Area', 'number-pad', 2, (rng) => {
      const [x1, x2] = randInts(rng, 0, 9, 2); const [y1, y2] = randInts(rng, 1, 9, 2);
      const dx = x2 - x1; const dy = y2 - y1;
      return numPad(`A solar panel has corners (${x1}, ${y1}), (${x2}, ${y1}), (${x2}, ${y2}), (${x1}, ${y2}). What is its area in square units?`, dx * dy, {
        visual: { text: `width ${dx}, height ${dy}` },
        hint: 'Area = width × height.',
      });
    }),
    level('g5.pack-star-chart.path', 'Patrol Path', 'number-pad', 2, (rng) => {
      const [x1, x2] = randInts(rng, 0, 9, 2); const [y1, y2] = randInts(rng, 0, 9, 2);
      const dx = x2 - x1; const dy = y2 - y1;
      return numPad(`A patrol flies (${x1}, ${y1}) → (${x2}, ${y1}) → (${x2}, ${y2}). How many units does it travel?`, dx + dy, {
        visual: { text: `(${x1}, ${y1}) → (${x2}, ${y1}) → (${x2}, ${y2})` },
        hint: 'Add the horizontal leg and the vertical leg.',
      });
    }),
    level('g5.pack-star-chart.farther', 'Farther Beacon', 'multiple-choice', 3, (rng) => {
      const coords: [number, number][] = [];
      const seen = new Set<string>();
      while (coords.length < 4) {
        const x = randInt(rng, 1, 9); const y = randInt(rng, 1, 9);
        const key = `${x},${y}`;
        if (seen.has(key)) continue;
        const dist = x * x + y * y;
        if (coords.some((c) => c[0] * c[0] + c[1] * c[1] === dist)) continue;
        seen.add(key); coords.push([x, y]);
      }
      const best = coords.reduce((top, c, i) => (c[0] * c[0] + c[1] * c[1] > coords[top][0] ** 2 + coords[top][1] ** 2 ? i : top), 0);
      const answer = `(${coords[best][0]}, ${coords[best][1]})`;
      const pool = coords.filter((_, i) => i !== best).map(([x, y]) => `(${x}, ${y})`);
      return mcPool(rng, 'Which beacon is farthest from the origin (0, 0)?', answer, pool, {
        hint: 'Compare how far right plus how far up each point sits.',
      });
    }),
    level('g5.pack-star-chart.meet', 'Meeting Point', 'multiple-choice', 3, (rng) => {
      const y = randInt(rng, 1, 9);
      const gap = pick(rng, [4, 6, 8]);
      const x1 = randInt(rng, 0, Math.max(0, 9 - gap)); const x2 = x1 + gap;
      const mid = x1 + gap / 2;
      const answer = `(${mid}, ${y})`;
      return mcPool(rng, `Rovers at (${x1}, ${y}) and (${x2}, ${y}) drive toward each other and meet in the middle. Where do they meet?`, answer,
        [`(${x1 + gap / 2 - 1}, ${y})`, `(${x1 + gap / 2 + 1}, ${y})`, `(${mid}, ${y + 1})`, `(${x2}, ${y})`],
        { hint: 'The middle sits halfway between the two x-coordinates.' });
    }),
    level('g5.pack-star-chart.name-shape', 'Name the Hull', 'multiple-choice', 3, (rng) => {
      const clue = pick(rng, shapeClues);
      return mcPool(rng, `A hull plate has ${clue.clue}. What is its most specific name?`, clue.name, clue.pool, {
        hint: 'Pick the most specific shape that fits every property.',
      });
    }),
  ],
};

export const g5PackUnitsA: UnitDef[] = [
  airlock, reactor, digits, fractionFusion, gravityForge, dock, starChart,
];
