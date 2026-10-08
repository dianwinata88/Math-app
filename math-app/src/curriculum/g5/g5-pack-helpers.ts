import { randInt, shuffle } from '../../core/rng';
import type { Question, Rng } from '../../core/types';
import { mc } from '../helpers';
import { buildMc, decLabel, formatMoney, fracLabel, gcd, simplify } from './math';
import type { ExactValue, Frac } from './math';

export type McExtra = Omit<Partial<Question>, 'kind' | 'prompt' | 'answer' | 'options'>;

/** Reduced proper fraction with denominator in [minD, maxD]. */
export function properFraction(rng: Rng, minD = 2, maxD = 12): Frac {
  let d = randInt(rng, minD, maxD);
  let n = randInt(rng, 1, d - 1);
  while (gcd(n, d) !== 1) {
    d = randInt(rng, minD, maxD);
    n = randInt(rng, 1, d - 1);
  }
  return { n, d };
}

/** Mixed number n/d with whole part in [minW, maxW], denominator in [minD, maxD]. */
export function mixedNumber(rng: Rng, minW = 1, maxW = 4, minD = 2, maxD = 9): Frac {
  const part = properFraction(rng, minD, maxD);
  const whole = randInt(rng, minW, maxW);
  return { n: whole * part.d + part.n, d: part.d };
}

export function mixedLabel(f: Frac): string {
  const whole = Math.floor(f.n / f.d);
  const rest = f.n % f.d;
  return rest === 0 ? String(whole) : `${whole} ${rest}/${f.d}`;
}

/** Multiple-choice where every option is an exact fraction value. */
export function fracMc(
  rng: Rng,
  prompt: string,
  answer: Frac,
  wrongs: ExactValue[],
  extra: McExtra = {},
): Question {
  return buildMc(prompt, { label: fracLabel(answer), value: answer },
    wrongs.map((value) => ({
      label: typeof value === 'number' ? String(value) : fracLabel(value),
      value,
    })), rng, extra,
    (value) => fracLabel(typeof value === 'number' ? { n: value, d: 1 } : value));
}

/** Multiple-choice where every option is a decimal stored as integer `scale`-ths. */
export function decMc(
  rng: Rng,
  prompt: string,
  answer: number,
  scale: number,
  wrongs: number[],
  extra: McExtra = {},
): Question {
  return buildMc(prompt, { label: decLabel(answer, scale), value: answer },
    wrongs.map((value) => ({ label: decLabel(value, scale), value })), rng, extra,
    (value) => decLabel(typeof value === 'number' ? value : value.n, scale));
}

/** Multiple-choice where every option is a money amount in cents. */
export function moneyMc(
  rng: Rng,
  prompt: string,
  answerCents: number,
  wrongCents: number[],
  extra: McExtra = {},
): Question {
  return buildMc(prompt, { label: formatMoney(answerCents), value: answerCents },
    wrongCents.map((value) => ({ label: formatMoney(value), value })), rng, extra,
    (value) => formatMoney(typeof value === 'number' ? value : value.n));
}

/** Multiple-choice with arbitrary string labels; picks 3 unique distractors from the pool. */
export function mcPool(
  rng: Rng,
  prompt: string,
  answer: string,
  pool: readonly string[],
  extra: McExtra = {},
): Question {
  const distractors: string[] = [];
  for (const candidate of shuffle(rng, [...pool])) {
    if (candidate === answer || distractors.includes(candidate)) continue;
    distractors.push(candidate);
    if (distractors.length === 3) break;
  }
  if (distractors.length < 3) {
    throw new Error('mcPool needs at least three unique choices besides the answer');
  }
  return mc(prompt, answer, distractors, rng, extra);
}

const WORDS_UNDER_20 = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
  'seventeen', 'eighteen', 'nineteen',
];
const TENS_WORDS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

/** Number word form for 1..999 ("four hundred two"). */
export function numWords(n: number): string {
  if (n < 20) return WORDS_UNDER_20[n];
  if (n < 100) {
    const ones = n % 10;
    return ones === 0 ? TENS_WORDS[Math.floor(n / 10)] : `${TENS_WORDS[Math.floor(n / 10)]} ${WORDS_UNDER_20[ones]}`;
  }
  const rest = n % 100;
  return rest === 0
    ? `${WORDS_UNDER_20[Math.floor(n / 100)]} hundred`
    : `${WORDS_UNDER_20[Math.floor(n / 100)]} hundred ${numWords(rest)}`;
}

/** 12-hour clock label "H:MM". */
export function fmtClock(hour: number, minute: number): string {
  return `${hour}:${String(minute).padStart(2, '0')}`;
}

/** Total minutes to a 12-hour clock label, wrapping past 12. */
export function clockAfter(hour: number, minute: number, deltaMinutes: number): string {
  const total = ((hour - 1) * 60 + minute + deltaMinutes) % 720;
  return fmtClock(Math.floor(total / 60) + 1, total % 60);
}

export interface LinePlot {
  positions: number[];
  counts: number[];
  text: string;
  totalUnits: number;
  totalMarks: number;
}

/** Builds a fraction line-plot board: `3/8 kg | ✕✕` rows, at most 7 rows, 1-3 marks each. */
export function makeLinePlot(rng: Rng, unitName: string, denominator: number): LinePlot {
  const positions: number[] = [];
  for (let n = 1; n < denominator; n += 1) {
    if (rng() < 0.6) positions.push(n);
  }
  while (positions.length < 3) {
    const n = randInt(rng, 1, denominator - 1);
    if (!positions.includes(n)) positions.push(n);
  }
  positions.sort((a, b) => a - b);
  const counts = positions.map(() => randInt(rng, 1, 3));
  const text = positions
    .map((n, index) => `${fracLabel(simplify({ n, d: denominator }))} ${unitName} | ${'✕'.repeat(counts[index])}`)
    .join('\n');
  const totalUnits = positions.reduce((sum, n, index) => sum + n * counts[index], 0);
  const totalMarks = counts.reduce((sum, c) => sum + c, 0);
  return { positions, counts, text, totalUnits, totalMarks };
}

/** Draws `count` distinct items from a bank, shuffled. */
export function drawDistinct<T>(rng: Rng, bank: readonly T[], count: number): T[] {
  return shuffle(rng, [...bank]).slice(0, count);
}

export const crewNames = ['Commander Reyes', 'Pilot Amara', 'Engineer Diaz', 'Dr. Okafor', 'Cadet Lin', 'Nav Officer Park'];
export const cargoThings = ['fuel cells', 'ration packs', 'oxygen canisters', 'water tanks', 'star charts', 'med kits'];
export const stationSnacks = ['astro crackers', 'juice pouches', 'moon muffins', 'comet candies'];
export const routeStops = ['Dock 7', 'the observatory', 'the greenhouse', 'Lab B', 'the antenna array'];

export const shapeStatements: readonly (readonly [string, boolean])[] = [
  ['All squares are rectangles.', true],
  ['All rectangles are squares.', false],
  ['All squares are rhombuses.', true],
  ['All rhombuses are squares.', false],
  ['Every rectangle is a parallelogram.', true],
  ['Every parallelogram is a rectangle.', false],
  ['All parallelograms are quadrilaterals.', true],
  ['All quadrilaterals are parallelograms.', false],
  ['A square is a regular quadrilateral.', true],
  ['A rhombus always has four right angles.', false],
  ['All trapezoids are parallelograms.', false],
  ['Every square is a parallelogram.', true],
  ['An equilateral triangle is also isosceles.', true],
  ['An isosceles triangle is always equilateral.', false],
  ['A scalene triangle has no equal sides.', true],
  ['A right triangle can be isosceles.', true],
  ['An obtuse triangle can be equilateral.', false],
  ['A triangle can have two right angles.', false],
  ['Every trapezoid has at least one pair of parallel sides.', true],
  ['All rectangles have four equal sides.', false],
];

export const shapeClues: readonly { clue: string; name: string; pool: string[] }[] = [
  { clue: '4 equal sides and 4 right angles', name: 'Square', pool: ['Rectangle', 'Rhombus', 'Parallelogram', 'Trapezoid'] },
  { clue: '4 equal sides and no right angles', name: 'Rhombus', pool: ['Square', 'Rectangle', 'Parallelogram', 'Trapezoid'] },
  { clue: '4 right angles but only opposite sides equal', name: 'Rectangle', pool: ['Square', 'Rhombus', 'Parallelogram', 'Kite'] },
  { clue: '2 pairs of parallel sides, no right angles, adjacent sides unequal', name: 'Parallelogram', pool: ['Rectangle', 'Rhombus', 'Trapezoid', 'Square'] },
  { clue: 'exactly 1 pair of parallel sides', name: 'Trapezoid', pool: ['Parallelogram', 'Rectangle', 'Rhombus', 'Square'] },
  { clue: '2 pairs of equal adjacent sides and no parallel sides', name: 'Kite', pool: ['Rhombus', 'Parallelogram', 'Trapezoid', 'Rectangle'] },
  { clue: '3 equal sides', name: 'Equilateral triangle', pool: ['Isosceles triangle', 'Scalene triangle', 'Right triangle', 'Obtuse triangle'] },
  { clue: '3 different side lengths', name: 'Scalene triangle', pool: ['Isosceles triangle', 'Equilateral triangle', 'Right triangle', 'Acute triangle'] },
  { clue: 'one angle greater than 90°', name: 'Obtuse triangle', pool: ['Acute triangle', 'Right triangle', 'Equilateral triangle', 'Isosceles triangle'] },
  { clue: 'one 90° angle and two equal sides', name: 'Right isosceles triangle', pool: ['Right scalene triangle', 'Equilateral triangle', 'Acute triangle', 'Obtuse triangle'] },
];
