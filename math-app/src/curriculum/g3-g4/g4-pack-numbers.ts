import { pick, randInt, shuffle } from '../../core/rng';
import type { UnitDef } from '../../core/types';
import { level, matchPairs, mc, numPad, orderSeq, trueFalse } from '../helpers';
import { dec, distractors, fmt, gcd, labelMc, numMc } from './util';

/* Grade 4 expansion pack — number-side units (Dragon Kingdom continues). */

const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'] as const;
const TENS_WORD = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'] as const;

function threeDigitWords(n: number): string {
  const parts: string[] = [];
  const hundred = Math.floor(n / 100);
  const rest = n % 100;
  if (hundred > 0) parts.push(`${ONES[hundred]} hundred`);
  if (rest >= 20) {
    const ten = Math.floor(rest / 10);
    const one = rest % 10;
    parts.push(one > 0 ? `${TENS_WORD[ten]}-${ONES[one]}` : TENS_WORD[ten]);
  } else if (rest > 0) {
    parts.push(ONES[rest]);
  }
  return parts.join(' ');
}

/** 1..999999 -> "four hundred twelve thousand, three hundred five" */
function numWords(n: number): string {
  const thousands = Math.floor(n / 1000);
  const rest = n % 1000;
  const parts: string[] = [];
  if (thousands > 0) parts.push(`${threeDigitWords(thousands)} thousand`);
  if (rest > 0) parts.push(threeDigitWords(rest));
  return parts.join(', ');
}

function thousandLeapTrail() {
  return {
    id: 'g4.pack-counting',
    title: 'Thousand-Leap Trail',
    emoji: '🐾',
    domain: 'counting' as const,
    levels: [
      level('g4.pack-counting.skip-count', 'Skip-Count Leaps', 'order-sequence', 1, (rng) => {
        const step = pick(rng, [100, 200, 250, 500, 1000]);
        const start = randInt(rng, 1, 20) * step + randInt(rng, 0, step - 1);
        const terms = Array.from({ length: 5 }, (_, i) => start + i * step);
        return orderSeq(`Count by ${fmt(step)}s starting at ${fmt(start)}. Tap the numbers in order.`, terms.map(fmt));
      }),
      level('g4.pack-counting.next-term', 'Next Big Leap', 'number-pad', 1, (rng) => {
        const step = pick(rng, [50, 100, 200, 250, 500, 1000]);
        const start = randInt(rng, 3, 30) * step;
        const shown = Array.from({ length: 4 }, (_, i) => fmt(start + i * step));
        return numPad(`Keep counting: ${shown.join(', ')}, ?`, start + 4 * step, {
          hint: `Each jump adds ${fmt(step)}.`,
        });
      }),
      level('g4.pack-counting.across-boundary', 'Across the Boundary', 'number-pad', 1, (rng) => {
        const boundary = randInt(rng, 1, 9) * 100000;
        const step = pick(rng, [10, 100, 1000]);
        return numPad(`What is ${fmt(step)} more than ${fmt(boundary - step)}?`, boundary, {
          hint: 'Crossing a hundred thousand — the digits roll over like an odometer.',
        });
      }),
      level('g4.pack-counting.missing-multiple', 'Missing Multiple', 'multiple-choice', 1, (rng) => {
        const k = randInt(rng, 3, 12);
        const first = randInt(rng, 2, 8);
        const gap = randInt(rng, 1, 3);
        const answer = (first + gap) * k;
        const display = Array.from({ length: 5 }, (_, i) => (i === gap ? '?' : fmt((first + i) * k))).join(', ');
        return labelMc(`A dragon counts by ${k}s: ${display}. Which number is missing?`, fmt(answer), distractors(answer, [answer - k, answer + k, answer + 1, answer - 1]).map(fmt), rng, {
          hint: `Each step adds ${k}.`,
        });
      }),
      level('g4.pack-counting.count-back', 'Backward Over the Bridge', 'number-pad', 1, (rng) => {
        const step = pick(rng, [10, 100, 1000]);
        const boundary = randInt(rng, 2, 9) * 1000;
        const n = boundary + randInt(rng, 0, step - 1);
        return numPad(`Count back ${fmt(step)} from ${fmt(n)}.`, n - step, {
          hint: 'Counting back across a thousand changes more than one digit.',
        });
      }),
      level('g4.pack-counting.multiples-count', 'Multiple Counter', 'number-pad', 2, (rng) => {
        const k = randInt(rng, 3, 9);
        let limit = randInt(rng, k * 4 + 1, k * 15);
        while (limit % k === 0) limit = randInt(rng, k * 4 + 1, k * 15);
        return numPad(`Count by ${k}s: ${k}, ${2 * k}, ${3 * k} … How many numbers do you say before you pass ${limit}?`, Math.floor(limit / k), {
          hint: `How many groups of ${k} fit inside ${limit}?`,
        });
      }),
      level('g4.pack-counting.odd-steps', 'Odd-Sized Steps', 'number-pad', 2, (rng) => {
        const d = pick(rng, [15, 25, 45, 75, 125, 150]);
        const s = randInt(rng, 20, 400);
        const k = randInt(rng, 2, 4);
        return numPad(`Start at ${s} and count forward ${k} jumps of ${d}. Where do you land?`, s + k * d, {
          hint: `${k} jumps of ${d} is ${k * d} total. Add it to ${s}.`,
        });
      }),
      level('g4.pack-counting.did-you-say', 'Did You Say It?', 'true-false', 2, (rng) => {
        const k = randInt(rng, 3, 9);
        const start = randInt(rng, 0, 5) * k + (rng() < 0.5 ? 0 : randInt(rng, 1, k - 1));
        const inSeq = rng() < 0.5;
        const m = randInt(rng, 4, 15);
        const n = inSeq ? start + m * k : start + m * k + randInt(rng, 1, k - 1);
        return trueFalse(`Counting by ${k}s starting at ${start}, do you say ${n}?`, (n - start) % k === 0, {
          hint: `Is the gap between ${start} and ${n} an exact number of ${k}s?`,
        });
      }),
      level('g4.pack-counting.how-many-jumps', 'Jump Counter', 'number-pad', 3, (rng) => {
        const d = pick(rng, [250, 500, 1000, 2000]);
        const k = randInt(rng, 2, 9);
        const a = randInt(rng, 0, 5) * 1000;
        return numPad(`A dragon hops ${fmt(d)} leagues at a time from ${fmt(a)} to ${fmt(a + k * d)}. How many hops does it take?`, k, {
          hint: `Count up by ${fmt(d)}s until you land.`,
        });
      }),
      level('g4.pack-counting.million-neighbors', 'Million Neighbors', 'number-pad', 3, (rng) => {
        const v = pick(rng, [100000, 200000, 300000, 400000, 500000, 600000, 700000, 800000, 900000, 1000000]);
        const step = pick(rng, [10, 100, 1000]);
        const less = rng() < 0.6;
        return numPad(`What is ${fmt(step)} ${less ? 'less' : 'more'} than ${fmt(v)}?`, less ? v - step : v + step, {
          hint: 'Watch which place changes — and which digits roll over.',
        });
      }),
    ],
  };
}

function scaleMultipliers() {
  return {
    id: 'g4.pack-multiply',
    title: 'Dragon Scale Multipliers',
    emoji: '🐉',
    domain: 'operations' as const,
    levels: [
      level('g4.pack-multiply.times-3x1', '3-Digit × 1-Digit', 'number-pad', 1, (rng) => {
        const a = randInt(rng, 100, 999);
        const b = randInt(rng, 3, 9);
        return numPad(`What is ${a} × ${b}?`, a * b, {
          visual: { text: `${a} × ${b}` },
          hint: `Multiply the hundreds, tens and ones by ${b}, then add.`,
        });
      }),
      level('g4.pack-multiply.times-10-100', 'Zeros Are Easy', 'number-pad', 1, (rng) => {
        const form = randInt(rng, 0, 2);
        if (form === 0) {
          const n = randInt(rng, 12, 987);
          const p = pick(rng, [10, 100, 1000]);
          return numPad(`What is ${n} × ${p}?`, n * p, { hint: `Multiplying by ${p} slides the digits and adds zeros.` });
        }
        if (form === 1) {
          const a = randInt(rng, 2, 9) * 10;
          const b = randInt(rng, 2, 9) * 10;
          return numPad(`What is ${a} × ${b}?`, a * b, { hint: `${a / 10} × ${b / 10} = ${(a * b) / 100}, then add two zeros.` });
        }
        const a = randInt(rng, 1, 9) * 100;
        const b = randInt(rng, 2, 9) * 10;
        return numPad(`What is ${a} × ${b}?`, a * b, { hint: `${a / 100} × ${b / 10} = ${(a * b) / 1000}, then add three zeros.` });
      }),
      level('g4.pack-multiply.multiply-match', 'Product Pairs', 'match-pairs', 1, (rng) => {
        const base = pick(rng, [12, 15, 18, 24, 25, 36]);
        const multipliers = shuffle(rng, [2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 4);
        const pairs = multipliers.map((m) => ({ left: `${base} × ${m}`, right: String(base * m) }));
        return { ...matchPairs('Match each multiplication to its product.', shuffle(rng, pairs)), hint: `Every card multiplies ${base}.` };
      }),
      level('g4.pack-multiply.partial-products', 'Partial Product Pieces', 'number-pad', 2, (rng) => {
        const a = randInt(rng, 1000, 9999);
        const b = randInt(rng, 2, 9);
        const parts: [string, number][] = [
          ['thousands', Math.floor(a / 1000) * 1000 * b],
          ['hundreds', Math.floor((a % 1000) / 100) * 100 * b],
          ['tens', Math.floor((a % 100) / 10) * 10 * b],
          ['ones', (a % 10) * b],
        ];
        const [place, value] = pick(rng, parts.filter((part) => part[1] > 0));
        return numPad(`To find ${fmt(a)} × ${b}, a knight uses partial products. What is the ${place} part?`, value, {
          visual: { text: `${fmt(a)} × ${b}` },
          hint: `Take the ${place} digit's value from ${fmt(a)} and multiply by ${b}.`,
        });
      }),
      level('g4.pack-multiply.estimate-product', 'Estimate the Product', 'multiple-choice', 2, (rng) => {
        const a = randInt(rng, 2100, 9800);
        const b = randInt(rng, 3, 9);
        const rounded = Math.round(a / 1000) * 1000;
        const answer = rounded * b;
        return numMc(
          `Estimate ${fmt(a)} × ${b} by rounding ${fmt(a)} to the nearest thousand.`,
          answer,
          [a * b, Math.floor(a / 1000) * 1000 * b, Math.ceil(a / 100) * 100 * b, answer + b * 1000],
          rng,
          { hint: `${fmt(a)} rounds to ${fmt(rounded)}.` },
        );
      }),
      level('g4.pack-multiply.missing-factor', 'Missing Factor', 'number-pad', 2, (rng) => {
        const b = randInt(rng, 2, 9);
        const f = pick(rng, [randInt(rng, 2, 9) * 10, randInt(rng, 2, 9) * 100, randInt(rng, 11, 99)]);
        return numPad(`${b} × ? = ${fmt(b * f)}`, f, {
          visual: { text: `${b} × ? = ${fmt(b * f)}` },
          hint: `Divide ${fmt(b * f)} by ${b}.`,
        });
      }),
      level('g4.pack-multiply.times-word', 'Treasure Multiplier', 'number-pad', 2, (rng) => {
        const a = randInt(rng, 215, 987);
        const b = randInt(rng, 3, 9);
        const story = pick(rng, [
          `A caravan carries ${a} gems on each of ${b} wagons. How many gems in all?`,
          `The royal mint stamps ${a} coins each day for ${b} days. How many coins?`,
          `${b} knights each collect ${a} dragon scales. How many scales in all?`,
          `Each of the ${b} towers holds ${a} arrows. How many arrows are there?`,
        ]);
        return numPad(story, a * b, { hint: `Multiply ${a} × ${b}.` });
      }),
      level('g4.pack-multiply.distributive', 'Break-Apart Check', 'true-false', 2, (rng) => {
        const a = randInt(rng, 23, 98);
        const b = randInt(rng, 3, 9);
        const t = Math.floor(a / 10) * 10;
        const o = a % 10;
        const truth = rng() < 0.5;
        let rhs = `${t} × ${b} + ${o} × ${b}`;
        if (!truth) {
          const wrongs = [`${t} + ${o} × ${b}`];
          if (o > 0) wrongs.push(`${t} × ${b} + ${o}`, `${t} × ${b} - ${o} × ${b}`);
          else wrongs.push(`${t} × ${b} + ${t}`, `${t - 10} × ${b} + ${o + 10} × ${b}`);
          rhs = pick(rng, wrongs);
        }
        return trueFalse(`True or false? ${a} × ${b} = ${rhs}`, truth, {
          hint: `Break ${a} into ${t} + ${o} and multiply BOTH parts by ${b}.`,
        });
      }),
      level('g4.pack-multiply.area-model', 'Complete the Area Model', 'number-pad', 3, (rng) => {
        const a = randInt(rng, 2, 9) * 10 + randInt(rng, 1, 9);
        const b = randInt(rng, 2, 9) * 10 + randInt(rng, 1, 9);
        const a0 = Math.floor(a / 10) * 10;
        const a1 = a % 10;
        const b0 = Math.floor(b / 10) * 10;
        const b1 = b % 10;
        const parts = [a0 * b0, a0 * b1, a1 * b0, a1 * b1];
        return numPad(`Area model for ${a} × ${b}: ${parts.map(fmt).join(' + ')}. What is ${a} × ${b}?`, a * b, {
          visual: { text: `${a} × ${b}` },
          hint: 'Add the four partial products.',
        });
      }),
      level('g4.pack-multiply.order-products', 'Order the Products', 'order-sequence', 3, (rng) => {
        const exprs: { label: string; value: number }[] = [];
        while (exprs.length < 4) {
          const a = randInt(rng, 12, 98);
          const b = randInt(rng, 3, 9);
          const label = `${a} × ${b}`;
          if (exprs.every((expr) => expr.value !== a * b && expr.label !== label)) exprs.push({ label, value: a * b });
        }
        return orderSeq('Order the expressions from smallest product to largest.', [...exprs].sort((x, y) => x.value - y.value).map((expr) => expr.label));
      }),
      level('g4.pack-multiply.triple', 'Three-Factor Tangle', 'number-pad', 3, (rng) => {
        const [a, b, c] = pick(rng, [
          [25, 4, 6],
          [25, 4, 8],
          [5, 16, 2],
          [8, 5, 7],
          [20, 5, 9],
          [4, 25, 12],
          [2, 50, 13],
          [15, 6, 2],
          [12, 5, 6],
        ]);
        return numPad(`What is ${a} × ${b} × ${c}?`, a * b * c, {
          hint: `Multiply ${a} × ${b} first — it makes a friendly number.`,
        });
      }),
    ],
  };
}

function trollDivision() {
  return {
    id: 'g4.pack-divide',
    title: 'Bridge Troll Division',
    emoji: '🌉',
    domain: 'operations' as const,
    levels: [
      level('g4.pack-divide.div-3x1', 'Three-Digit Split', 'number-pad', 1, (rng) => {
        const d = randInt(rng, 2, 9);
        const q = randInt(rng, 34, Math.floor(999 / d));
        const dividend = q * d;
        return numPad(`What is ${fmt(dividend)} ÷ ${d}?`, q, {
          visual: { text: `${fmt(dividend)} ÷ ${d}` },
          hint: 'Break the dividend into parts that divide evenly.',
        });
      }),
      level('g4.pack-divide.div-10-100', 'Divide by 10 & 100', 'number-pad', 1, (rng) => {
        const base = randInt(rng, 11, 99);
        const p = pick(rng, [10, 100]);
        return numPad(`What is ${fmt(base * p)} ÷ ${p}?`, base, {
          hint: `Dividing by ${p} slides every digit ${p === 10 ? 'one' : 'two'} place${p === 10 ? '' : 's'} smaller.`,
        });
      }),
      level('g4.pack-divide.divisible', 'Divisible or Not?', 'multiple-choice', 1, (rng) => {
        const k = pick(rng, [3, 9]);
        const v = k * randInt(rng, 30, 110);
        const wrongs = [v + 1, v + 2, v + 4, v + 5, v + 7].filter((x) => x % k !== 0).slice(0, 3);
        return labelMc(`Which number is divisible by ${k}?`, String(v), wrongs.map(String), rng, {
          hint: `Add the digits — the sum must be divisible by ${k}.`,
        });
      }),
      level('g4.pack-divide.divide-match', 'Quotient Pairs', 'match-pairs', 1, (rng) => {
        const pairs: { left: string; right: string }[] = [];
        while (pairs.length < 4) {
          const d = randInt(rng, 3, 9);
          const q = randInt(rng, 5, 19);
          const r = randInt(rng, 1, d - 1);
          const left = `${q * d + r} ÷ ${d}`;
          const right = `${q} R ${r}`;
          if (pairs.every((pair) => pair.left !== left && pair.right !== right)) pairs.push({ left, right });
        }
        return { ...matchPairs('Match each division to its quotient.', shuffle(rng, pairs)), hint: 'Multiply back and add the remainder to check.' };
      }),
      level('g4.pack-divide.check-division', 'Check the Division', 'true-false', 2, (rng) => {
        const d = randInt(rng, 3, 9);
        const q = randInt(rng, 8, 99);
        const r = randInt(rng, 1, d - 1);
        const dividend = q * d + r;
        const truth = rng() < 0.5;
        let cq = q;
        let cr = r;
        if (!truth) {
          const wrongs: [number, number][] = [
            [q + 1, r],
            [q - 1, r],
          ];
          if (r + 1 < d) wrongs.push([q, r + 1]);
          if (r - 1 > 0) wrongs.push([q, r - 1]);
          [cq, cr] = pick(rng, wrongs);
        }
        return trueFalse(`True or false? ${fmt(dividend)} ÷ ${d} = ${cq} R ${cr}`, cq * d + cr === dividend && cr < d, {
          hint: `Check: ${d} × quotient + remainder must equal ${fmt(dividend)}.`,
        });
      }),
      level('g4.pack-divide.missing-dividend', 'Missing Dividend', 'number-pad', 2, (rng) => {
        const d = randInt(rng, 3, 9);
        const q = randInt(rng, 25, 300);
        if (rng() < 0.5) {
          return numPad(`? ÷ ${d} = ${q}`, q * d, { hint: `Multiply ${q} × ${d}.` });
        }
        const r = randInt(rng, 1, d - 1);
        return numPad(`? ÷ ${d} = ${q} R ${r}`, q * d + r, { hint: `${q} × ${d} + ${r}.` });
      }),
      level('g4.pack-divide.divide-story', 'Fair Share Story', 'number-pad', 2, (rng) => {
        const d = randInt(rng, 3, 9);
        const q = randInt(rng, 120, Math.floor(9999 / d));
        const total = q * d;
        const story = pick(rng, [
          `A bakery packs ${fmt(total)} rolls into boxes of ${d}. How many boxes are filled?`,
          `${fmt(total)} coins are shared equally by ${d} dragons. How many coins each?`,
          `A library shelves ${fmt(total)} books on ${d} carts equally. How many books per cart?`,
          `${fmt(total)} knights march in ${d} equal columns. How many in each column?`,
        ]);
        return numPad(story, q, { hint: `Divide ${fmt(total)} by ${d} one place at a time.` });
      }),
      level('g4.pack-divide.estimate-quotient', 'Estimate the Quotient', 'multiple-choice', 2, (rng) => {
        const d = randInt(rng, 3, 9);
        const approx = pick(rng, [200, 300, 400, 500, 600, 700, 800, 900]);
        const dividend = approx * d + randInt(rng, -15 * d, 15 * d);
        return numMc(`Estimate ${fmt(dividend)} ÷ ${d}.`, approx, [approx - 100, approx + 100, Math.round(dividend / d), approx + d * 10], rng, {
          hint: `${fmt(dividend)} is close to ${fmt(approx * d)} — and ${fmt(approx * d)} ÷ ${d} is friendly.`,
        });
      }),
      level('g4.pack-divide.zero-quotient', 'Zero Inside!', 'number-pad', 3, (rng) => {
        const d = randInt(rng, 2, 9);
        const q = pick(rng, [102, 103, 104, 105, 106, 107, 108, 109, 201, 203, 204, 205, 206, 207, 208, 209, 302, 304, 305, 306, 402, 405, 406, 408, 506, 507, 603, 608, 702, 704, 801, 806, 901, 905]);
        const dividend = q * d;
        return numPad(`What is ${fmt(dividend)} ÷ ${d}?`, q, {
          visual: { text: `${fmt(dividend)} ÷ ${d}` },
          hint: 'Careful — the quotient has a 0 inside. Keep every place value!',
        });
      }),
      level('g4.pack-divide.greatest-quotient', 'Greatest Quotient', 'multiple-choice', 3, (rng) => {
        const exprs: { label: string; q: number }[] = [];
        while (exprs.length < 4) {
          const d = randInt(rng, 3, 9);
          const q = randInt(rng, 20, 120);
          const label = `${d * q} ÷ ${d}`;
          if (exprs.every((expr) => expr.q !== q && expr.label !== label)) exprs.push({ label, q });
        }
        const winner = exprs.reduce((best, expr) => (expr.q > best.q ? expr : best));
        return labelMc('Which expression has the greatest quotient?', winner.label, exprs.filter((expr) => expr !== winner).map((expr) => expr.label), rng, {
          hint: 'Bigger dividend with the same divisor wins — but check each one.',
        });
      }),
    ],
  };
}

function columnClub() {
  return {
    id: 'g4.pack-fluency',
    title: 'Castle Column Club',
    emoji: '🏯',
    domain: 'operations' as const,
    levels: [
      level('g4.pack-fluency.add-big', 'Five-Digit Sums', 'number-pad', 1, (rng) => {
        const a = randInt(rng, 10000, 500000);
        const b = randInt(rng, 10000, 900000 - a);
        return numPad(`What is ${fmt(a)} + ${fmt(b)}?`, a + b, {
          visual: { text: `${fmt(a)} + ${fmt(b)}` },
          hint: 'Line up the places and add right to left.',
        });
      }),
      level('g4.pack-fluency.missing-addend', 'Missing Addend', 'number-pad', 1, (rng) => {
        const a = randInt(rng, 1500, 450000);
        const b = randInt(rng, 1000, 400000);
        return numPad(`${fmt(a)} + ? = ${fmt(a + b)}`, b, {
          visual: { text: `${fmt(a)} + ? = ${fmt(a + b)}` },
          hint: `Subtract ${fmt(a)} from ${fmt(a + b)}.`,
        });
      }),
      level('g4.pack-fluency.three-addends', 'Triple Treasure Sum', 'number-pad', 1, (rng) => {
        const a = randInt(rng, 100, 5000);
        const b = randInt(rng, 100, 5000);
        const c = randInt(rng, 100, 5000);
        return numPad(`What is ${fmt(a)} + ${fmt(b)} + ${fmt(c)}?`, a + b + c, {
          hint: 'Add two numbers first, then the third.',
        });
      }),
      level('g4.pack-fluency.estimate-sum', 'Estimate the Sum', 'multiple-choice', 1, (rng) => {
        const a = randInt(rng, 11000, 48000);
        const b = randInt(rng, 11000, 48000);
        const answer = Math.round(a / 1000) * 1000 + Math.round(b / 1000) * 1000;
        return numMc(
          `Estimate ${fmt(a)} + ${fmt(b)} by rounding each to the nearest thousand.`,
          answer,
          [a + b, Math.floor(a / 1000) * 1000 + Math.floor(b / 1000) * 1000, answer + 1000, answer - 1000],
          rng,
          { hint: `${fmt(a)} ≈ ${fmt(Math.round(a / 1000) * 1000)} and ${fmt(b)} ≈ ${fmt(Math.round(b / 1000) * 1000)}.` },
        );
      }),
      level('g4.pack-fluency.sub-zeros', 'Subtract Across Zeros', 'number-pad', 2, (rng) => {
        const a = randInt(rng, 2, 9) * 10000 + randInt(rng, 0, 9) * 100 + randInt(rng, 0, 9);
        const b = randInt(rng, 1000, a - 1);
        return numPad(`What is ${fmt(a)} − ${fmt(b)}?`, a - b, {
          visual: { text: `${fmt(a)} − ${fmt(b)}` },
          hint: 'Borrow through the zeros — each zero becomes a 9 after regrouping.',
        });
      }),
      level('g4.pack-fluency.mixed-add-sub', 'Add, Then Subtract', 'number-pad', 2, (rng) => {
        const a = randInt(rng, 2000, 50000);
        const b = randInt(rng, 1000, 30000);
        const c = randInt(rng, 500, a + b - 500);
        return numPad(`What is ${fmt(a)} + ${fmt(b)} − ${fmt(c)}?`, a + b - c, {
          hint: 'Do the addition first, then subtract.',
        });
      }),
      level('g4.pack-fluency.equation-check', 'Equation Detective', 'true-false', 2, (rng) => {
        const a = randInt(rng, 10000, 60000);
        const b = randInt(rng, 10000, 90000 - a);
        const truth = rng() < 0.5;
        const claimed = truth ? a + b : a + b + pick(rng, [1, 10, 100, 1000]);
        return trueFalse(`True or false? ${fmt(a)} + ${fmt(b)} = ${fmt(claimed)}`, claimed === a + b, {
          hint: 'Add the numbers yourself, then compare.',
        });
      }),
      level('g4.pack-fluency.estimate-diff', 'Estimate the Difference', 'multiple-choice', 3, (rng) => {
        const a = randInt(rng, 40000, 99000);
        const b = randInt(rng, 11000, a - 11000);
        const answer = Math.round(a / 1000) * 1000 - Math.round(b / 1000) * 1000;
        return numMc(
          `Estimate ${fmt(a)} − ${fmt(b)} by rounding each to the nearest thousand.`,
          answer,
          [a - b, Math.floor(a / 1000) * 1000 - Math.floor(b / 1000) * 1000, answer + 1000, answer - 1000],
          rng,
          { hint: 'Round each number BEFORE you subtract.' },
        );
      }),
      level('g4.pack-fluency.make-million', 'Make a Million', 'number-pad', 3, (rng) => {
        const b = randInt(rng, 300000, 750000);
        return numPad(`? + ${fmt(b)} = 1,000,000`, 1000000 - b, {
          visual: { text: `? + ${fmt(b)} = 1,000,000` },
          hint: `Subtract ${fmt(b)} from 1,000,000.`,
        });
      }),
      level('g4.pack-fluency.which-equals', 'Which Equals?', 'multiple-choice', 3, (rng) => {
        const t = randInt(rng, 40, 90) * 1000 + randInt(rng, 111, 999);
        const hi = Math.ceil(t / 10000) * 10000;
        const correct = `${fmt(hi)} − ${fmt(hi - t)}`;
        const wrongs = shuffle(rng, [
          `${fmt(hi)} − ${fmt(hi - t + 100)}`,
          `${fmt(hi)} − ${fmt(hi - t - 100)}`,
          `${fmt(hi - 10000)} + ${fmt(t - (hi - 10000) + 1000)}`,
          `${fmt(hi)} + ${fmt(hi - t)}`,
        ]).slice(0, 3);
        return labelMc(`Which expression equals ${fmt(t)}?`, correct, wrongs, rng, {
          hint: `Compute each one — only one lands exactly on ${fmt(t)}.`,
        });
      }),
    ],
  };
}

const PLACE_NAMES = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands', 'hundred thousands'] as const;

function gemChamber() {
  return {
    id: 'g4.pack-place',
    title: 'Gem Chamber of Millions',
    emoji: '💎',
    domain: 'place-value' as const,
    levels: [
      level('g4.pack-place.word-form', 'Words to Digits', 'number-pad', 1, (rng) => {
        const n = randInt(rng, 10000, 999999);
        return numPad(`Write in digits: ${numWords(n)}.`, n, {
          hint: 'The word "thousand" splits the number into two chunks.',
        });
      }),
      level('g4.pack-place.expanded', 'Expanded Form Forge', 'number-pad', 1, (rng) => {
        let n = randInt(rng, 100000, 999999);
        let parts: number[] = [];
        while (parts.length < 3) {
          n = randInt(rng, 100000, 999999);
          parts = [100000, 10000, 1000, 100, 10, 1]
            .map((place) => Math.floor(n / place) % 10 * place)
            .filter((part) => part > 0);
        }
        return numPad(`${parts.map(fmt).join(' + ')} = ?`, n, {
          visual: { text: `${parts.map(fmt).join(' + ')}` },
          hint: 'Stack the place values — zeros hold the empty spots.',
        });
      }),
      level('g4.pack-place.ten-times', 'Ten Times Up', 'multiple-choice', 1, (rng) => {
        const [bigger, smaller] = pick(rng, [
          [50000, 5000],
          [700000, 7000],
          [4000, 400],
          [90000, 900],
          [6000, 60],
          [300000, 300],
          [80000, 8000],
          [200000, 20000],
        ] as const);
        const answer = String(bigger / smaller);
        return labelMc(
          `The digit in ${fmt(bigger)} is worth how many times the same digit in ${fmt(smaller)}?`,
          answer,
          ['1', '10', '100', '1000'].filter((x) => x !== answer),
          rng,
          { hint: 'Each step left in place value is ×10.' },
        );
      }),
      level('g4.pack-place.rename', 'Rename the Number', 'number-pad', 1, (rng) => {
        const form = randInt(rng, 0, 3);
        if (form === 0) {
          const n = randInt(rng, 11, 99);
          return numPad(`${n} hundreds = ?`, n * 100, { hint: 'A hundred is 100 — multiply!' });
        }
        if (form === 1) {
          const n = randInt(rng, 11, 99);
          return numPad(`${n} tens = ?`, n * 10, { hint: 'A ten is 10 — multiply!' });
        }
        if (form === 2) {
          const n = randInt(rng, 11, 99);
          return numPad(`${n} thousands = ?`, n * 1000, { hint: 'A thousand is 1,000 — multiply!' });
        }
        const n = randInt(rng, 2, 9);
        return numPad(`${n} ten-thousands = ?`, n * 10000, { hint: 'A ten-thousand is 10,000 — multiply!' });
      }),
      level('g4.pack-place.compare-sign', 'Choose the Sign', 'multiple-choice', 1, (rng) => {
        const a = randInt(rng, 10000, 999999);
        const b = rng() < 0.15 ? a : randInt(rng, 10000, 999999);
        const answer = a > b ? '>' : a < b ? '<' : '=';
        return labelMc('Which sign goes in the circle?', answer, ['<', '>', '='].filter((s) => s !== answer), rng, {
          visual: { text: `${fmt(a)} ○ ${fmt(b)}` },
          hint: 'Compare digits from the left until they differ.',
        });
      }),
      level('g4.pack-place.round-check', 'Round Checker', 'true-false', 1, (rng) => {
        const place = pick(rng, [100, 1000, 10000]);
        const v = randInt(rng, place * 3, 999999);
        const truth = rng() < 0.5;
        const actual = Math.round(v / place) * place;
        const claimed = truth ? actual : actual + pick(rng, [place, -place, place * 2]);
        const label = PLACE_NAMES[Math.log10(place)];
        return trueFalse(`True or false? ${fmt(v)} rounded to the nearest ${label} is ${fmt(claimed)}.`, claimed === actual, {
          hint: `Look at the digit just right of the ${label} place.`,
        });
      }),
      level('g4.pack-place.round-numPad', 'Round It Yourself', 'number-pad', 2, (rng) => {
        const place = pick(rng, [1000, 10000, 100000]);
        let v = randInt(rng, place, 999999);
        while (v % place === 0) v += randInt(rng, 1, place - 1);
        const label = PLACE_NAMES[Math.log10(place)];
        return numPad(`Round ${fmt(v)} to the nearest ${label}.`, Math.round(v / place) * place, {
          hint: 'Check the digit just right of the rounding place: 5 or more rounds up.',
        });
      }),
      level('g4.pack-place.greatest-number', 'Build the Biggest', 'multiple-choice', 2, (rng) => {
        const digits = shuffle(rng, ['1', '2', '3', '4', '5', '6', '7', '8', '9']).slice(0, 5);
        const desc = [...digits].sort().reverse().join('');
        const asc = [...digits].sort().join('');
        const swap = desc.slice(0, 1) + desc.slice(2, 3) + desc.slice(1, 2) + desc.slice(3);
        const rand = shuffle(rng, digits).join('');
        return labelMc(`Arrange the digits ${digits.join(', ')} to make the greatest number.`, fmt(Number(desc)), [asc, swap, rand].map((s) => fmt(Number(s))), rng, {
          hint: 'Put the biggest digit in the biggest place.',
        });
      }),
      level('g4.pack-place.place-detective', 'Place Detective', 'multiple-choice', 2, (rng) => {
        const d = String(randInt(rng, 1, 9));
        const p = randInt(rng, 1, 5);
        const make = (digit: string, power: number): number => {
          const others = shuffle(rng, ['1', '2', '3', '4', '5', '6', '7', '8', '9'].filter((x) => x !== digit));
          const arr = Array.from({ length: 6 }, () => others.pop()!);
          arr[5 - power] = digit;
          return Number(arr.join(''));
        };
        const answer = make(d, p);
        const wrongs = new Set<number>();
        while (wrongs.size < 3) {
          const w = make(d, randInt(rng, 0, 5));
          if (w !== answer) wrongs.add(w);
        }
        return labelMc(`Which number has a ${d} in the ${PLACE_NAMES[p]} place?`, fmt(answer), [...wrongs].map(fmt), rng, {
          hint: `Count places from the right: the ${PLACE_NAMES[p]} is position ${p + 1}.`,
        });
      }),
      level('g4.pack-place.order-big', 'Order the Gems', 'order-sequence', 2, (rng) => {
        const values = new Set<number>();
        while (values.size < 4) values.add(randInt(rng, 10000, 999999));
        return orderSeq('Order the gem hoards from least to greatest.', [...values].sort((a, b) => a - b).map(fmt));
      }),
      level('g4.pack-place.which-place', 'Which Place?', 'multiple-choice', 3, (rng) => {
        const places = [10, 100, 1000, 10000, 100000];
        let v = 0;
        let chosen = 100;
        let target = 0;
        for (let tries = 0; tries < 500; tries += 1) {
          v = randInt(rng, 10000, 999999);
          const rounded = places.map((p) => Math.round(v / p) * p);
          const uniquePlaces = places.filter((p, i) => rounded.filter((r) => r === rounded[i]).length === 1 && rounded[i] !== v);
          if (uniquePlaces.length > 0) {
            chosen = pick(rng, uniquePlaces);
            target = Math.round(v / chosen) * chosen;
            break;
          }
        }
        return labelMc(
          `${fmt(v)} rounded to the nearest ________ is ${fmt(target)}. What fills the blank?`,
          PLACE_NAMES[Math.log10(chosen)],
          places.filter((p) => p !== chosen).map((p) => PLACE_NAMES[Math.log10(p)]),
          rng,
          { hint: 'Try rounding to each place until one lands on the target.' },
        );
      }),
    ],
  };
}

const FRAC_BANK = ['1/2', '1/3', '2/3', '1/4', '3/4', '2/5', '3/5', '4/5', '1/6', '5/6', '3/8', '5/8', '7/8', '2/10', '3/10', '7/10', '9/10', '5/12', '7/12', '11/12'] as const;

function dragonPieBakery() {
  return {
    id: 'g4.pack-fractions',
    title: 'Dragon Pie Bakery',
    emoji: '🥧',
    domain: 'fractions' as const,
    levels: [
      level('g4.pack-fractions.equivalent-pick', 'Pick the Match', 'multiple-choice', 1, (rng) => {
        const b = pick(rng, [2, 3, 4, 5, 6, 8]);
        const a = randInt(rng, 1, b - 1);
        const g = gcd(a, b);
        const [na, nb] = [a / g, b / g];
        const m = randInt(rng, 2, 4);
        const correct = `${na * m}/${nb * m}`;
        const wrongs = [`${na * m}/${nb * m + 1}`, `${na * m + 1}/${nb * m}`, `${na * (m + 1)}/${nb * m}`];
        return labelMc(`Which fraction is equivalent to ${na}/${nb}?`, correct, wrongs, rng, {
          hint: `Multiply the top and bottom of ${na}/${nb} by the same number.`,
        });
      }),
      level('g4.pack-fractions.benchmark', 'Closer to 0, 1/2, or 1?', 'multiple-choice', 1, (rng) => {
        let n = 1;
        let d = 4;
        let answer = '';
        for (let tries = 0; tries < 500; tries += 1) {
          d = pick(rng, [3, 4, 5, 6, 8, 10, 12]);
          n = randInt(rng, 1, d - 1);
          const dist0 = 2 * n;
          const distHalf = Math.abs(2 * n - d);
          const distOne = 2 * (d - n);
          const min = Math.min(dist0, distHalf, distOne);
          const winners = [dist0 === min, distHalf === min, distOne === min].filter(Boolean).length;
          if (winners === 1) {
            answer = dist0 === min ? '0' : distHalf === min ? '1/2' : '1';
            break;
          }
        }
        return labelMc(`Is ${n}/${d} closer to 0, 1/2, or 1?`, answer, ['0', '1/2', '1'].filter((x) => x !== answer), rng, {
          hint: `Double the numerator: ${2 * n} vs the denominator ${d} tells you which side of 1/2 it's on.`,
        });
      }),
      level('g4.pack-fractions.compare-same', 'Same Top, Different Bottom', 'true-false', 1, (rng) => {
        if (rng() < 0.5) {
          const n = randInt(rng, 1, 5);
          let d1 = randInt(rng, n + 1, 12);
          let d2 = randInt(rng, n + 1, 12);
          while (d2 === d1) d2 = randInt(rng, n + 1, 12);
          return trueFalse(`True or false? ${n}/${d1} > ${n}/${d2}`, n * d2 > n * d1, {
            hint: 'Same numerator: the BIGGER denominator means smaller pieces.',
          });
        }
        const d = randInt(rng, 4, 12);
        let a = randInt(rng, 1, d - 1);
        let b = randInt(rng, 1, d - 1);
        while (b === a) b = randInt(rng, 1, d - 1);
        return trueFalse(`True or false? ${a}/${d} > ${b}/${d}`, a > b, {
          hint: 'Same denominator: just compare the numerators.',
        });
      }),
      level('g4.pack-fractions.order-frac', 'Order the Slices', 'order-sequence', 1, (rng) => {
        const d = pick(rng, [6, 8, 10, 12]);
        const numerators = new Set<number>();
        while (numerators.size < 4) numerators.add(randInt(rng, 1, d - 1));
        return orderSeq(`Order the fractions from least to greatest.`, [...numerators].sort((a, b) => a - b).map((n) => `${n}/${d}`));
      }),
      level('g4.pack-fractions.add-mixed', 'Add Mixed Numbers', 'multiple-choice', 2, (rng) => {
        const d = randInt(rng, 3, 9);
        const w1 = randInt(rng, 1, 4);
        const w2 = randInt(rng, 1, 4);
        const r1 = randInt(rng, 1, d - 2);
        const r2 = randInt(rng, 1, d - 1 - r1);
        const answer = `${w1 + w2} ${r1 + r2}/${d}`;
        const wrongs = [`${w1 + w2 + 1} ${r1 + r2}/${d}`, `${w1 + w2} ${r1 + r2 + 1}/${d}`, `${w1 + w2} ${r1 + r2}/${2 * d}`];
        return labelMc(`What is ${w1} ${r1}/${d} + ${w2} ${r2}/${d}?`, answer, wrongs, rng, {
          visual: { text: `${w1} ${r1}/${d} + ${w2} ${r2}/${d}` },
          hint: 'Add the wholes, then add the fractions — the denominator stays.',
        });
      }),
      level('g4.pack-fractions.sub-mixed', 'Subtract Mixed Numbers', 'multiple-choice', 2, (rng) => {
        const d = randInt(rng, 3, 9);
        const w2 = randInt(rng, 1, 3);
        const w1 = randInt(rng, w2 + 1, 6);
        const r2 = randInt(rng, 1, d - 2);
        const r1 = randInt(rng, r2 + 1, d - 1);
        const answer = `${w1 - w2} ${r1 - r2}/${d}`;
        const wrongs = [`${w1 - w2 - 1} ${r1 - r2}/${d}`, `${w1 - w2} ${r2 - r1 + d}/${d}`, `${w1 - w2} ${r1 - r2 + 1}/${d}`, `${w1 + w2} ${r1 - r2}/${d}`];
        return labelMc(`What is ${w1} ${r1}/${d} − ${w2} ${r2}/${d}?`, answer, wrongs.filter((w) => w !== answer).slice(0, 3), rng, {
          visual: { text: `${w1} ${r1}/${d} − ${w2} ${r2}/${d}` },
          hint: 'Subtract the wholes, then subtract the fractions.',
        });
      }),
      level('g4.pack-fractions.missing-multiplier', 'Missing Multiplier', 'number-pad', 2, (rng) => {
        const d = pick(rng, [4, 5, 6, 8, 10]);
        const a = randInt(rng, 1, 3);
        const n = randInt(rng, 2, 9);
        return numPad(`What number goes in the box? □ × ${a}/${d} = ${n * a}/${d}`, n, {
          visual: { text: `□ × ${a}/${d} = ${n * a}/${d}` },
          hint: `${n * a} ÷ ${a} = ?`,
        });
      }),
      level('g4.pack-fractions.equivalent-match', 'Equivalent Match-Up', 'match-pairs', 2, (rng) => {
        const lefts = shuffle(rng, [...FRAC_BANK]).slice(0, 4);
        const pairs: { left: string; right: string }[] = [];
        for (const left of lefts) {
          const [a, b] = left.split('/').map(Number);
          for (let tries = 0; tries < 20; tries += 1) {
            const m = randInt(rng, 2, 4);
            const right = `${a * m}/${b * m}`;
            if (pairs.every((pair) => pair.right !== right)) {
              pairs.push({ left, right });
              break;
            }
          }
        }
        return { ...matchPairs('Match each fraction to an equivalent fraction.', shuffle(rng, pairs)), hint: 'Each right side is the left × the same number top and bottom.' };
      }),
      level('g4.pack-fractions.frac-of-number', 'Fraction of a Number', 'number-pad', 2, (rng) => {
        const d = pick(rng, [3, 4, 5, 6, 8, 10]);
        const whole = d * randInt(rng, 2, 8);
        const a = randInt(rng, 1, d - 1);
        return numPad(`A baker uses ${a}/${d} of ${whole} grams of flour. How many grams is that?`, (whole / d) * a, {
          hint: `${whole} ÷ ${d} = ${whole / d}, then × ${a}.`,
        });
      }),
      level('g4.pack-fractions.simplest', 'Simplest Form', 'multiple-choice', 3, (rng) => {
        const b = pick(rng, [4, 6, 8, 9, 10, 12]);
        const a = randInt(rng, 1, b - 1);
        const g = gcd(a, b);
        const [na, nb] = [a / g, b / g];
        const wrongs = [`${na}/${nb + 2}`, `${na + 1}/${nb}`, `${na}/${nb + na}`, `${na * 2}/${nb + 2}`];
        return labelMc(`Write ${a}/${b} in simplest form.`, `${na}/${nb}`, wrongs, rng, {
          hint: `Divide top and bottom by ${g}.`,
        });
      }),
      level('g4.pack-fractions.decompose', 'Break Apart the Fraction', 'multiple-choice', 3, (rng) => {
        const d = pick(rng, [8, 10, 12]);
        const n = randInt(rng, 4, d - 1);
        const part = randInt(rng, 1, n - 1);
        const answer = `${part}/${d} + ${n - part}/${d}`;
        const wrongs = [`${part}/${d} + ${n - part + 1}/${d}`, `${part - 1 < 1 ? part + 1 : part - 1}/${d} + ${n - part}/${d}`, `${n}/${d + 1} + ${part}/${d}`];
        return labelMc(`Which expression equals ${n}/${d}?`, answer, wrongs, rng, {
          hint: `The numerators must add to ${n} — denominators don't add.`,
        });
      }),
    ],
  };
}

function decimalLab() {
  return {
    id: 'g4.pack-decimals',
    title: "Wizard's Decimal Lab",
    emoji: '🧪',
    domain: 'decimals' as const,
    levels: [
      level('g4.pack-decimals.hundred-grid', 'Hundredth Grid', 'count-tap', 1, (rng) => {
        const count = randInt(rng, 12, 28);
        const groups: number[] = [];
        let left = count;
        while (left > 8) {
          groups.push(8);
          left -= 8;
        }
        groups.push(left);
        return {
          ...mc(
            `Each square is one hundredth. Count the shaded squares — how many hundredths?`,
            String(count),
            distractors(count, [count - 1, count + 1, count + 10, count - 10]).map(String),
            rng,
            { visual: { emoji: '🟦', groups }, hint: `That many hundredths writes the decimal ${dec(count)}.` },
          ),
          kind: 'count-tap',
        };
      }),
      level('g4.pack-decimals.decimal-words', 'Decimal Words', 'multiple-choice', 1, (rng) => {
        const whole = randInt(rng, 1, 9);
        const frac = randInt(rng, 11, 99);
        const value = whole * 100 + frac;
        const words = `${numWords(whole)} and ${numWords(frac)} hundredth${frac > 1 ? 's' : ''}`;
        const swap = (frac % 10) * 10 + Math.floor(frac / 10);
        return labelMc(`Which decimal shows "${words}"?`, dec(value), [dec(frac * 100 + whole), dec(whole * 100 + (swap === frac ? frac + 10 : swap)), dec(value + 100)], rng, {
          hint: 'The whole number sits left of the point; hundredths take two places.',
        });
      }),
      level('g4.pack-decimals.which-digit', 'Digit Places', 'multiple-choice', 1, (rng) => {
        const t = randInt(rng, 1, 9);
        const h = randInt(rng, 1, 9);
        const askTenths = rng() < 0.5;
        return labelMc(`In ${dec(t * 10 + h)}, which digit is in the ${askTenths ? 'tenths' : 'hundredths'} place?`, String(askTenths ? t : h), [String(askTenths ? h : t), String(randInt(rng, 1, 9)), '0'], rng, {
          visual: { text: dec(t * 10 + h) },
          hint: 'Tenths is just right of the point; hundredths is one more over.',
        });
      }),
      level('g4.pack-decimals.expanded-decimal', 'Tenths Plus Hundredths', 'multiple-choice', 1, (rng) => {
        const t = randInt(rng, 1, 9);
        const h = randInt(rng, 1, 9);
        const answer = t * 10 + h;
        const swap = h * 10 + t;
        return labelMc(`What is ${dec(t * 10)} + ${dec(h)}?`, dec(answer), [dec(swap), dec(answer + 10), dec(answer * 10)], rng, {
          visual: { text: `${dec(t * 10)} + ${dec(h)}` },
          hint: `Tenths go in the first place, hundredths in the second: ${dec(answer)}.`,
        });
      }),
      level('g4.pack-decimals.to-decimal', 'Fraction to Decimal', 'multiple-choice', 1, (rng) => {
        const h = randInt(rng, 11, 99);
        const useTenth = h % 10 === 0;
        const prompt = useTenth ? `${h / 10}/10` : `${h}/100`;
        return labelMc(`What is ${prompt} as a decimal?`, dec(h), [dec(h + 10), dec((h % 10) * 10 + Math.floor(h / 10)), dec(h + 100), dec(h * 2)], rng, {
          hint: useTenth ? 'Tenths take one decimal place.' : 'Hundredths take two decimal places.',
        });
      }),
      level('g4.pack-decimals.between', 'Between Two Decimals', 'multiple-choice', 1, (rng) => {
        const low = randInt(rng, 1, 6) * 10;
        const high = low + 20;
        const inside = low + randInt(rng, 3, 17);
        const wrongs = [low - randInt(rng, 2, 8), high + randInt(rng, 3, 15), high + 20 + randInt(rng, 1, 9)];
        return labelMc(`Which decimal is between ${dec(low)} and ${dec(high)}?`, dec(inside), wrongs.map(dec), rng, {
          hint: `Between ${dec(low)} and ${dec(high)} means it must be bigger than ${dec(low)} AND smaller than ${dec(high)}.`,
        });
      }),
      level('g4.pack-decimals.count-hundredths', 'Count the Hundredths', 'number-pad', 2, (rng) => {
        const value = pick(rng, [randInt(rng, 1, 9) * 10, randInt(rng, 10, 99), 100 + randInt(rng, 10, 99)]);
        return numPad(`How many hundredths are in ${dec(value)}?`, value, {
          hint: `${dec(value)} = ${value}/100.`,
        });
      }),
      level('g4.pack-decimals.compare-over-one', 'Compare Bigger Decimals', 'true-false', 2, (rng) => {
        const whole = randInt(rng, 1, 3);
        const tenths = whole * 100 + randInt(rng, 1, 9) * 10;
        let hundredths = whole * 100 + randInt(rng, 1, 99);
        while (hundredths === tenths) hundredths = whole * 100 + randInt(rng, 1, 99);
        const [x, y] = rng() < 0.5 ? [tenths, hundredths] : [hundredths, tenths];
        const symbol = rng() < 0.5 ? '>' : '<';
        return trueFalse(`True or false? ${dec(x)} ${symbol} ${dec(y)}`, symbol === '>' ? x > y : x < y, {
          visual: { text: `${dec(x)} ${symbol} ${dec(y)}` },
          hint: 'Line up the places — write both with two decimal places.',
        });
      }),
      level('g4.pack-decimals.to-fraction', 'Decimal to Fraction', 'multiple-choice', 3, (rng) => {
        const h = randInt(rng, 11, 99);
        const answer = `${h}/100`;
        const wrongs = [`${h}/10`, `${Math.floor(h / 10)}/${h % 10 || 10}`, `${h + 1}/100`, `${h % 10}${Math.floor(h / 10)}/100`];
        return labelMc(`Write ${dec(h)} as a fraction.`, answer, wrongs, rng, {
          hint: `${dec(h)} means ${h} hundredths.`,
        });
      }),
      level('g4.pack-decimals.decimal-sum', 'Add Tenths', 'multiple-choice', 3, (rng) => {
        const t1 = randInt(rng, 2, 9);
        const t2 = randInt(rng, 2, 9);
        const sum = (t1 + t2) * 10;
        return labelMc(`What is ${dec(t1 * 10)} + ${dec(t2 * 10)}?`, dec(sum), [dec(t1 + t2), dec(sum + 10), dec(sum * 10), dec(t2 * 10 + t1)], rng, {
          visual: { text: `${dec(t1 * 10)} + ${dec(t2 * 10)}` },
          hint: `Add the tenths: ${t1} + ${t2} = ${t1 + t2} tenths.`,
        });
      }),
    ],
  };
}

function enchantedPatterns() {
  return {
    id: 'g4.pack-patterns',
    title: 'Enchanted Patterns',
    emoji: '🔮',
    domain: 'patterns' as const,
    levels: [
      level('g4.pack-patterns.factor-pair', 'Factor Pair Finder', 'number-pad', 1, (rng) => {
        const a = pick(rng, [3, 4, 6, 7, 8, 9, 12]);
        const b = randInt(rng, 3, 12);
        return numPad(`Complete the factor pair: ${a} × ? = ${a * b}`, b, {
          visual: { text: `${a} × ? = ${a * b}` },
          hint: `${a * b} ÷ ${a} = ?`,
        });
      }),
      level('g4.pack-patterns.multiple-pick', 'Multiple Pick', 'multiple-choice', 1, (rng) => {
        const k = randInt(rng, 4, 12);
        const m = randInt(rng, 3, 9);
        const answer = k * m;
        const wrongs = [answer + 1, answer - 1, answer + 2, k * (m + 1) + 1].filter((x) => x % k !== 0);
        return labelMc(`Which number is a multiple of ${k}?`, String(answer), wrongs.map(String), rng, {
          hint: `${k} × ${m} = ${answer}.`,
        });
      }),
      level('g4.pack-patterns.rule-next', 'Next by the Rule', 'number-pad', 1, (rng) => {
        const kind = pick(rng, ['add', 'subtract', 'multiply'] as const);
        const step = kind === 'multiply' ? randInt(rng, 2, 3) : randInt(rng, 3, 12);
        const start = kind === 'subtract' ? randInt(rng, 80, 200) : randInt(rng, 2, 40);
        const terms = [start];
        while (terms.length < 4) {
          const last = terms[terms.length - 1];
          terms.push(kind === 'add' ? last + step : kind === 'subtract' ? last - step : last * step);
        }
        const rule = kind === 'add' ? `add ${step}` : kind === 'subtract' ? `subtract ${step}` : `multiply by ${step}`;
        return numPad(`Rule: ${rule}. ${terms.slice(0, 3).join(', ')}, ?`, terms[3], {
          visual: { text: `${terms.slice(0, 3).join(', ')}, ?` },
          hint: `Apply the rule to ${terms[2]}.`,
        });
      }),
      level('g4.pack-patterns.factor-count', 'Factor Counter', 'number-pad', 2, (rng) => {
        const n = pick(rng, [12, 16, 18, 20, 24, 25, 28, 30, 32, 36, 40, 42, 45, 48]);
        const count = Array.from({ length: n }, (_, i) => i + 1).filter((f) => n % f === 0).length;
        return numPad(`How many factors does ${n} have?`, count, {
          hint: `List them in pairs: 1 × ${n}, …`,
        });
      }),
      level('g4.pack-patterns.all-factors', 'All the Factors', 'multiple-choice', 2, (rng) => {
        const n = pick(rng, [12, 16, 18, 20, 24, 28, 30, 32, 36]);
        const factors = Array.from({ length: n }, (_, i) => i + 1).filter((f) => n % f === 0);
        const correct = factors.join(', ');
        const missing1 = factors.filter((f) => f !== 1).join(', ');
        const missingMid = factors.filter((f) => f !== factors[Math.floor(factors.length / 2)]).join(', ');
        const nonFactor = [...factors.slice(0, -1), n - 1].join(', ');
        return labelMc(`Which list has ALL the factors of ${n}?`, correct, [missing1, missingMid, nonFactor], rng, {
          hint: 'Check every listed number divides evenly — and nothing is missing.',
        });
      }),
      level('g4.pack-patterns.prime-list', 'Prime Lineup', 'multiple-choice', 2, (rng) => {
        const options = pick(rng, [
          { answer: '2, 3, 5, 7', wrongs: ['1, 3, 5, 7', '2, 3, 4, 5', '3, 5, 7, 9'] },
          { answer: '11, 13, 17, 19', wrongs: ['11, 13, 15, 17', '9, 11, 13, 15', '11, 14, 17, 19'] },
          { answer: '2, 5, 11, 13', wrongs: ['1, 5, 11, 13', '2, 5, 9, 13', '5, 11, 13, 21'] },
          { answer: '3, 5, 7, 11', wrongs: ['3, 5, 7, 9', '1, 3, 5, 7', '3, 6, 7, 11'] },
        ]);
        return labelMc('Which list contains ONLY prime numbers?', options.answer, options.wrongs, rng, {
          hint: 'A prime has exactly two factors: 1 and itself. Watch out for 1, 9, 15, 21.',
        });
      }),
      level('g4.pack-patterns.rule-feature', 'Pattern Feature', 'multiple-choice', 2, (rng) => {
        const start = randInt(rng, 2, 20);
        const step = randInt(rng, 2, 9);
        const terms = Array.from({ length: 4 }, (_, i) => start + i * step);
        const evenStep = step % 2 === 0;
        const answer = evenStep ? `All terms are ${start % 2 === 0 ? 'even' : 'odd'}` : 'The terms switch between even and odd';
        const wrongs = [
          evenStep ? 'The terms switch between even and odd' : `All terms are ${start % 2 === 0 ? 'even' : 'odd'}`,
          `All terms are multiples of ${step}`,
          'All terms end in the same digit',
        ];
        return labelMc(`Pattern: start at ${start}, rule "add ${step}": ${terms.join(', ')}, … What is always true?`, answer, wrongs, rng, {
          hint: `An ${step % 2 === 0 ? 'even' : 'odd'} step ${step % 2 === 0 ? 'keeps' : 'flips'} the parity every time.`,
        });
      }),
      level('g4.pack-patterns.in-out', 'Number Machine', 'number-pad', 1, (rng) => {
        const a = randInt(rng, 2, 9);
        const x = randInt(rng, 3, 12);
        const add = rng() < 0.7;
        const b = randInt(rng, 1, add ? 10 : Math.min(10, a * x - 1));
        return numPad(`Number machine: multiply by ${a}, then ${add ? 'add' : 'subtract'} ${b}. Input ${x} → output?`, add ? a * x + b : a * x - b, {
          hint: `First ${x} × ${a} = ${a * x}, then ${add ? '+' : '−'} ${b}.`,
        });
      }),
      level('g4.pack-patterns.lcm', 'Smallest Shared Multiple', 'number-pad', 3, (rng) => {
        const [a, b, l] = pick(rng, [
          [4, 6, 12],
          [3, 4, 12],
          [6, 8, 24],
          [4, 10, 20],
          [6, 9, 18],
          [5, 6, 30],
          [9, 12, 36],
          [10, 12, 60],
          [3, 8, 24],
          [8, 12, 24],
          [4, 14, 28],
          [6, 15, 30],
        ]);
        return numPad(`What is the smallest number that is a multiple of both ${a} and ${b}?`, l, {
          hint: `List multiples of the bigger one: ${b}, ${2 * b}, ${3 * b}… until ${a} divides it.`,
        });
      }),
      level('g4.pack-patterns.two-rules', 'Two-Rule Race', 'multiple-choice', 3, (rng) => {
        let sA = randInt(rng, 0, 15);
        let sB = randInt(rng, 0, 15);
        let dA = randInt(rng, 2, 9);
        let dB = randInt(rng, 2, 9);
        const n = randInt(rng, 4, 6);
        while (sA + (n - 1) * dA === sB + (n - 1) * dB || (sA === sB && dA === dB)) {
          sB = randInt(rng, 0, 15);
          dB = randInt(rng, 2, 9);
        }
        const termA = sA + (n - 1) * dA;
        const termB = sB + (n - 1) * dB;
        const answer = termA > termB ? 'Pattern A' : 'Pattern B';
        return labelMc(`Pattern A starts at ${sA} and adds ${dA}. Pattern B starts at ${sB} and adds ${dB}. Which has the greater ${n}th term?`, answer, [answer === 'Pattern A' ? 'Pattern B' : 'Pattern A', 'They are equal'], rng, {
          hint: `A's ${n}th term: ${sA} + ${n - 1} × ${dA}. B's: ${sB} + ${n - 1} × ${dB}.`,
        });
      }),
      level('g4.pack-patterns.grow-pattern', 'Growing Gaps', 'multiple-choice', 3, (rng) => {
        const start = randInt(rng, 1, 10);
        const base = randInt(rng, 1, 5);
        const terms = [start];
        for (let i = 0; i < 5; i += 1) terms.push(terms[terms.length - 1] + base + i);
        const answer = terms[5];
        return labelMc(`What comes next? ${terms.join(', ')}, ?`, String(answer), [answer - 1, answer + 1, answer + base, answer - base].map(String), rng, {
          visual: { text: `${terms.join(', ')}, ?` },
          hint: `The gaps grow: +${base}, +${base + 1}, +${base + 2}, +${base + 3}…`,
        });
      }),
    ],
  };
}

const EXPR_BANK: { expr: string; eval: (n: number) => number }[] = [
  { expr: 'n + 4', eval: (n) => n + 4 },
  { expr: '2 × n', eval: (n) => 2 * n },
  { expr: 'n − 4', eval: (n) => n - 4 },
  { expr: '3 × n + 1', eval: (n) => 3 * n + 1 },
  { expr: 'n ÷ 2', eval: (n) => n / 2 },
  { expr: 'n + 10', eval: (n) => n + 10 },
  { expr: '2 × n − 3', eval: (n) => 2 * n - 3 },
  { expr: 'n × n', eval: (n) => n * n },
];

function runeAlgebra() {
  return {
    id: 'g4.pack-algebra',
    title: 'Rune Algebra',
    emoji: '✨',
    domain: 'algebra' as const,
    levels: [
      level('g4.pack-algebra.eval', 'Plug It In', 'number-pad', 1, (rng) => {
        const a = randInt(rng, 2, 6);
        const n = randInt(rng, 2, 9);
        const plus = rng() < 0.5;
        const b = randInt(rng, 1, plus ? 9 : Math.min(9, a * n - 1));
        return numPad(`If n = ${n}, what is ${a} × n ${plus ? '+' : '−'} ${b}?`, plus ? a * n + b : a * n - b, {
          visual: { text: `n = ${n} → ${a}n ${plus ? '+' : '−'} ${b}` },
          hint: `Replace n with ${n}: ${a} × ${n} ${plus ? '+' : '−'} ${b}.`,
        });
      }),
      level('g4.pack-algebra.eval-2step', 'Divide & Tweak', 'number-pad', 2, (rng) => {
        const d = randInt(rng, 3, 9);
        const n = d * randInt(rng, 3, 9);
        const plus = rng() < 0.5;
        const b = randInt(rng, 1, plus ? 9 : Math.min(9, n / d - 1));
        return numPad(`If n = ${n}, what is n ÷ ${d} ${plus ? '+' : '−'} ${b}?`, plus ? n / d + b : n / d - b, {
          hint: `First ${n} ÷ ${d} = ${n / d}, then ${plus ? '+' : '−'} ${b}.`,
        });
      }),
      level('g4.pack-algebra.missing-num', 'Find the Missing Number', 'number-pad', 2, (rng) => {
        const form = randInt(rng, 0, 3);
        if (form === 0) {
          const a = randInt(rng, 3, 9);
          const x = randInt(rng, 3, 15);
          return numPad(`□ × ${a} = ${a * x}`, x, { hint: `${a * x} ÷ ${a} = ?` });
        }
        if (form === 1) {
          const b = randInt(rng, 100, 900);
          const x = randInt(rng, 100, 900);
          return numPad(`□ − ${fmt(b)} = ${fmt(x)}`, x + b, { hint: `Add ${fmt(b)} to ${fmt(x)}.` });
        }
        if (form === 2) {
          const a = randInt(rng, 3, 9);
          const x = randInt(rng, 12, 99);
          return numPad(`□ ÷ ${a} = ${x}`, a * x, { hint: `${x} × ${a} = ?` });
        }
        const a = randInt(rng, 100, 800);
        const x = randInt(rng, 100, 800);
        return numPad(`${fmt(a)} + □ = ${fmt(a + x)}`, x, { hint: `${fmt(a + x)} − ${fmt(a)} = ?` });
      }),
      level('g4.pack-algebra.expr-words', 'Words to Expressions', 'multiple-choice', 2, (rng) => {
        const a = randInt(rng, 2, 9);
        const b = randInt(rng, 2, 9);
        const plus = rng() < 0.5;
        const answer = `${a} × n ${plus ? '+' : '−'} ${b}`;
        const words = plus ? `${b} more than ${a} times n` : `${b} less than ${a} times n`;
        const wrongs = [`${a} × n ${plus ? '−' : '+'} ${b}`, `${b} × n ${plus ? '+' : '−'} ${a}`, `${a} × (n ${plus ? '+' : '−'} ${b})`];
        return labelMc(`Which expression means "${words}"?`, answer, wrongs, rng, {
          hint: `"${a} times n" is ${a} × n — then ${plus ? 'add' : 'subtract'} ${b}.`,
        });
      }),
      level('g4.pack-algebra.table-rule-out', 'Table Output', 'number-pad', 2, (rng) => {
        const a = randInt(rng, 2, 5);
        const b = randInt(rng, 1, 9);
        const xs = shuffle(rng, [1, 2, 3, 4, 5, 6]).slice(0, 3).sort((p, q) => p - q);
        const ask = randInt(rng, 7, 12);
        const rows = xs.map((x) => `${x} → ${a * x + b}`).join(',   ');
        return numPad(`Table rule: ${rows},   ${ask} → ?`, a * ask + b, {
          hint: `Each output is input × ${a} + ${b}.`,
        });
      }),
      level('g4.pack-algebra.pick-rule', 'Pick the Rule', 'multiple-choice', 2, (rng) => {
        const a = randInt(rng, 2, 5);
        const b = randInt(rng, 1, 9);
        const xs = [2, 3, 5];
        const rows = xs.map((x) => `${x} → ${a * x + b}`).join(',   ');
        const answer = `n × ${a} + ${b}`;
        const wrongs = [`n × ${a}`, `n + ${b}`, `n × ${a} − ${b}`];
        return labelMc(`Table: ${rows}. Which rule makes every row?`, answer, wrongs, rng, {
          hint: `Try n = ${xs[0]}: which rule gives ${a * xs[0] + b}?`,
        });
      }),
      level('g4.pack-algebra.compare-expr', 'Compare Expressions', 'true-false', 3, (rng) => {
        const n = randInt(rng, 3, 9);
        const a = randInt(rng, 2, 5);
        const b = randInt(rng, 1, 8);
        const c = randInt(rng, 2, 12);
        const left = a * n + b;
        const right = n + c;
        const symbol = rng() < 0.5 ? '>' : '<';
        return trueFalse(`For n = ${n}, is ${a} × n + ${b} ${symbol} n + ${c}?`, symbol === '>' ? left > right : left < right, {
          hint: `Left side is ${left}; right side is ${right}.`,
        });
      }),
      level('g4.pack-algebra.expr-match', 'Expression Match', 'match-pairs', 2, (rng) => {
        let n = randInt(rng, 4, 12);
        let chosen: { left: string; right: string }[] = [];
        for (let tries = 0; tries < 100; tries += 1) {
          n = randInt(rng, 4, 12);
          const options = shuffle(rng, EXPR_BANK.filter((entry) => Number.isInteger(entry.eval(n)) && entry.eval(n) > 0));
          chosen = [];
          const seen = new Set<number>();
          for (const entry of options) {
            const v = entry.eval(n);
            if (!seen.has(v)) {
              seen.add(v);
              chosen.push({ left: entry.expr, right: String(v) });
            }
            if (chosen.length === 4) break;
          }
          if (chosen.length === 4) break;
        }
        return { ...matchPairs(`For n = ${n}, match each expression to its value.`, shuffle(rng, chosen)), hint: `Replace n with ${n} in each card.` };
      }),
      level('g4.pack-algebra.solve-check', 'Which n Works?', 'multiple-choice', 3, (rng) => {
        const a = randInt(rng, 2, 6);
        const b = randInt(rng, 1, 9);
        const n = randInt(rng, 3, 12);
        const target = a * n + b;
        const wrongs = [n - 1, n + 1, n + 2].map(String);
        return labelMc(`Which value of n makes ${a} × n + ${b} = ${target} true?`, String(n), wrongs, rng, {
          hint: `${target} − ${b} = ${target - b}, then ÷ ${a}.`,
        });
      }),
      level('g4.pack-algebra.machine', 'Machine in Reverse', 'number-pad', 3, (rng) => {
        const a = randInt(rng, 2, 6);
        const b = randInt(rng, 1, 8);
        const input = randInt(rng, 3, 12);
        const output = a * input + b;
        return numPad(`Machine: multiply by ${a}, then add ${b}. The output is ${output} — what was the input?`, input, {
          hint: `Work backward: ${output} − ${b} = ${output - b}, then ÷ ${a}.`,
        });
      }),
    ],
  };
}

const byDifficulty = (unit: UnitDef): UnitDef => ({ ...unit, levels: [...unit.levels].sort((a, b) => a.difficulty - b.difficulty) });

export const g4PackNumbers: UnitDef[] = [
  thousandLeapTrail(),
  scaleMultipliers(),
  trollDivision(),
  columnClub(),
  gemChamber(),
  dragonPieBakery(),
  decimalLab(),
  enchantedPatterns(),
  runeAlgebra(),
].map(byDifficulty);
