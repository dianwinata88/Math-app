import { pick, randInt, randInts, shuffle } from '../../core/rng';
import type { Question, Rng, UnitDef } from '../../core/types';
import { level, matchPairs, mc, numPad, orderSeq, trueFalse } from '../helpers';
import {
  CLOCK_HALF,
  CLOCK_HOUR,
  capitalizeWord,
  compareSymbol,
  equalShareFacts,
  formatCents,
  formatDollars,
  numericDistractors,
} from './shared';
import {
  ampmBank,
  estimateObjects,
  fractionWordBank,
  graphSubjects,
  measureTools,
  multCombos,
  polyBank,
  solidBank,
  storyThings,
} from './g2-pack-banks';

type McExtra = Omit<Partial<Question>, 'kind' | 'prompt' | 'answer' | 'options'>;

const fmtTime = (hour: number, minute: number) => `${hour}:${String(minute).padStart(2, '0')}`;

function uniqueInts(rng: Rng, count: number, draw: () => number): number[] {
  const values = new Set<number>();
  while (values.size < count) values.add(draw());
  return [...values];
}

function mcNum(
  rng: Rng,
  prompt: string,
  answer: number,
  candidates: number[],
  extra: McExtra = {},
  options: { count?: number; min?: number; max?: number } = {},
): Question {
  return mc(prompt, String(answer), numericDistractors(rng, answer, candidates, options), rng, extra);
}

const coinNoun = (count: number, singular: string, plural: string) => `${count} ${count === 1 ? singular : plural}`;
const ONES_WORDS = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
const TENS_WORDS = ['', 'ten', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

export const g2Pack: UnitDef[] = [
  {
    id: 'g2.pack-counting',
    title: 'Number Line Lagoon',
    emoji: '🐟',
    domain: 'counting',
    levels: [
      level('g2.pack-counting.skip-forward', 'Hop Forward', 'order-sequence', 1, (rng) => {
        const step = pick(rng, [2, 5, 10]);
        const start = randInt(rng, 1, 40);
        return orderSeq(`Put the numbers in order counting by ${step}s.`, Array.from({ length: 5 }, (_, i) => String(start + i * step)));
      }),
      level('g2.pack-counting.line-gap', 'Fill the Line', 'number-pad', 1, (rng) => {
        const step = pick(rng, [1, 2, 5, 10]);
        const start = randInt(rng, 5, 120);
        return numPad(`${start}, ${start + step}, __, ${start + 3 * step}\nWhat number fills the blank?`, start + 2 * step, { hint: `Count on by ${step}s` });
      }),
      level('g2.pack-counting.count-on', 'Count On', 'number-pad', 1, (rng) => {
        const start = randInt(rng, 15, 90);
        const more = randInt(rng, 2, 9);
        return numPad(`Start at ${start}. Count on ${more}. Where do you land?`, start + more, { hint: 'Count up one at a time' });
      }),
      level('g2.pack-counting.count-back', 'Count Back', 'number-pad', 1, (rng) => {
        const start = randInt(rng, 20, 99);
        const less = randInt(rng, 2, 9);
        return numPad(`Start at ${start}. Count back ${less}. Where do you land?`, start - less, { hint: 'Count down one at a time' });
      }),
      level('g2.pack-counting.next-three', 'What Comes Next?', 'multiple-choice', 1, (rng) => {
        const start = randInt(rng, 95, 990);
        const answer = start + 3;
        return mcNum(rng, `What number comes next? ${start}, ${start + 1}, ${start + 2}, __`, answer, [start + 4, start - 1, answer + 10, answer - 10]);
      }),
      level('g2.pack-counting.between', 'Between Two Numbers', 'multiple-choice', 2, (rng) => {
        const a = randInt(rng, 100, 980);
        const b = a + randInt(rng, 2, 15);
        const inside = randInt(rng, a + 1, b - 1);
        return mcNum(rng, `Which number is between ${a} and ${b}?`, inside, [a - randInt(rng, 1, 8), b + randInt(rng, 1, 8), a, b]);
      }),
      level('g2.pack-counting.skip-backward', 'Slide Backward', 'order-sequence', 2, (rng) => {
        const step = pick(rng, [2, 5, 10]);
        const last = randInt(rng, 60, 199);
        return orderSeq(`Count backward by ${step}s from ${last}.`, Array.from({ length: 5 }, (_, i) => String(last - i * step)));
      }),
      level('g2.pack-counting.hundred-hops', 'Hundred Hops', 'order-sequence', 2, (rng) => {
        const forward = rng() < 0.5;
        const start = forward ? randInt(rng, 23, 480) : randInt(rng, 350, 880);
        return orderSeq(`Count ${forward ? 'forward' : 'backward'} by 100s from ${start}.`, Array.from({ length: 4 }, (_, i) => String(start + (forward ? 1 : -1) * i * 100)));
      }),
      level('g2.pack-counting.odd-even-big', 'Even or Odd Explorer', 'multiple-choice', 2, (rng) => {
        const number = randInt(rng, 100, 999);
        const answer = number % 2 === 0 ? 'Even' : 'Odd';
        return mc(`Is ${number} even or odd?`, answer, [answer === 'Even' ? 'Odd' : 'Even'], rng, { hint: 'Look at the ones digit' });
      }),
      level('g2.pack-counting.find-odd', 'Find the Odd One', 'multiple-choice', 2, (rng) => {
        const odd = randInt(rng, 51, 499) * 2 - 1;
        const evens = uniqueInts(rng, 3, () => randInt(rng, 50, 500) * 2);
        return mc('Which number is odd?', String(odd), evens.map(String), rng, { hint: 'Odd numbers end in 1, 3, 5, 7, or 9' });
      }),
      level('g2.pack-counting.even-pairs', 'Even Pairs', 'number-pad', 2, (rng) => {
        const pairs = randInt(rng, 2, 15);
        return numPad(`${pairs * 2} starfish share into pairs evenly. How many pairs?`, pairs, {
          visual: { emoji: '⭐', groups: Array.from({ length: pairs }, () => 2) },
          hint: 'An even number splits into pairs with none left over',
        });
      }),
    ],
  },
  {
    id: 'g2.pack-fluent-100',
    title: 'Turtle Sprint',
    emoji: '🐢',
    domain: 'operations',
    levels: [
      level('g2.pack-fluent-100.add-flat', 'Smooth Sailing Addition', 'number-pad', 1, (rng) => {
        const tensA = randInt(rng, 1, 7);
        const tensB = randInt(rng, 1, 8 - tensA);
        const onesA = randInt(rng, 0, 9);
        const onesB = randInt(rng, 0, 9 - onesA);
        const a = tensA * 10 + onesA;
        const b = tensB * 10 + onesB;
        return numPad(`${a} + ${b} = ?`, a + b, { visual: { text: `${a} + ${b} =` } });
      }),
      level('g2.pack-fluent-100.sub-flat', 'Smooth Sailing Subtraction', 'number-pad', 1, (rng) => {
        const tensA = randInt(rng, 2, 9);
        const onesA = randInt(rng, 0, 9);
        const tensB = randInt(rng, 1, tensA - 1);
        const onesB = randInt(rng, 0, onesA);
        const a = tensA * 10 + onesA;
        const b = tensB * 10 + onesB;
        return numPad(`${a} − ${b} = ?`, a - b, { visual: { text: `${a} − ${b} =` } });
      }),
      level('g2.pack-fluent-100.make-ten', 'Make a Ten', 'multiple-choice', 1, (rng) => {
        const a = randInt(rng, 6, 9);
        const need = 10 - a;
        const b = randInt(rng, need + 1, 9);
        const answer = b - need;
        return mcNum(rng, `${a} + ${b} is the same as ${a} + ${need} + ?`, answer, [need, b, answer - 1, answer + 1], { hint: 'Make a ten first' }, { min: 0 });
      }),
      level('g2.pack-fluent-100.near-double', 'Near Doubles', 'multiple-choice', 1, (rng) => {
        const a = randInt(rng, 4, 9);
        const answer = a + a + 1;
        return mcNum(rng, `Use a double: ${a} + ${a + 1} = ?`, answer, [a + a, a + a + 2, answer - 1, answer + 10], { hint: `${a} + ${a} = ${a + a}, then add 1` }, { min: 0 });
      }),
      level('g2.pack-fluent-100.add-carry', 'Carry a Ten', 'number-pad', 2, (rng) => {
        const tensA = randInt(rng, 2, 8);
        const onesA = randInt(rng, 2, 9);
        const tensB = randInt(rng, 0, 8 - tensA);
        const onesB = randInt(rng, 10 - onesA, 9);
        const a = tensA * 10 + onesA;
        const b = tensB * 10 + onesB;
        return numPad(`${a} + ${b} = ?`, a + b, { hint: 'Regroup ones into a ten' });
      }),
      level('g2.pack-fluent-100.sub-borrow', 'Trade a Ten', 'number-pad', 2, (rng) => {
        const tensA = randInt(rng, 3, 9);
        const onesA = randInt(rng, 0, 7);
        const tensB = randInt(rng, 1, tensA - 1);
        const onesB = randInt(rng, onesA + 1, 9);
        const a = tensA * 10 + onesA;
        const b = tensB * 10 + onesB;
        return numPad(`${a} − ${b} = ?`, a - b, { hint: 'Trade a ten for 10 ones' });
      }),
      level('g2.pack-fluent-100.add-three', 'Three Number Sprint', 'number-pad', 2, (rng) => {
        const a = randInt(rng, 10, 40);
        const b = randInt(rng, 10, 30);
        const c = randInt(rng, 5, 99 - a - b);
        return numPad(`${a} + ${b} + ${c} = ?`, a + b + c, { hint: 'Add two numbers first' });
      }),
      level('g2.pack-fluent-100.tens-add', 'Tens Only', 'number-pad', 2, (rng) => {
        const tensA = randInt(rng, 3, 9);
        const tensB = randInt(rng, 1, tensA - 1);
        const a = tensA * 10;
        const b = tensB * 10;
        const subtract = rng() < 0.5;
        return numPad(subtract ? `${a} − ${b} = ?` : `${a} + ${b} = ?`, subtract ? a - b : a + b, { hint: 'Count the tens' });
      }),
      level('g2.pack-fluent-100.fact-family-tf', 'Fact Family Check', 'true-false', 2, (rng) => {
        const a = randInt(rng, 20, 70);
        const b = randInt(rng, 10, 99 - a);
        const truth = rng() < 0.5;
        const shown = truth ? a : a + pick(rng, [-1, 1, 10]);
        return trueFalse(`If ${a} + ${b} = ${a + b}, then ${a + b} − ${b} = ${shown}.`, truth, { hint: 'Addition and subtraction are fact family partners' });
      }),
      level('g2.pack-fluent-100.mixed-chain', 'Two-Step Chain', 'number-pad', 3, (rng) => {
        if (rng() < 0.5) {
          const a = randInt(rng, 30, 80);
          const b = randInt(rng, 10, 99 - a);
          const c = randInt(rng, 5, a + b - 1);
          return numPad(`${a} + ${b} − ${c} = ?`, a + b - c, { hint: 'Work left to right' });
        }
        const a = randInt(rng, 40, 90);
        const d = randInt(rng, 10, a - 10);
        const e = randInt(rng, 1, 99 - (a - d));
        return numPad(`${a} − ${d} + ${e} = ?`, a - d + e, { hint: 'Work left to right' });
      }),
      level('g2.pack-fluent-100.sum-to-100', 'Partners of 100', 'multiple-choice', 3, (rng) => {
        const right = pick(rng, [[25, 75], [35, 65], [45, 55], [15, 85], [65, 35], [55, 45]]);
        const wrong = shuffle(rng, [[20, 60], [35, 55], [45, 65], [70, 40], [25, 85], [15, 75], [55, 65], [30, 50]]).slice(0, 3);
        const fmt = (pair: number[]) => `${pair[0]} and ${pair[1]}`;
        return mc('Which pair makes 100?', fmt(right), wrong.map(fmt), rng, { hint: 'Tens make 9 tens, ones make 10' });
      }),
      level('g2.pack-fluent-100.compensation', 'Shift One Over', 'multiple-choice', 3, (rng) => {
        const a = pick(rng, [38, 39, 48, 49, 58, 59, 68, 69]);
        const b = randInt(rng, 12, 40);
        const answer = b - 1;
        return mcNum(rng, `${a} + ${b} is the same as ${a + 1} + ?`, answer, [b + 1, b, answer - 1, a + 1], { hint: 'Add 1 to one number, take 1 from the other' }, { min: 0 });
      }),
    ],
  },
  {
    id: 'g2.pack-to-1000',
    title: 'Whale Deep Addition',
    emoji: '🐋',
    domain: 'operations',
    levels: [
      level('g2.pack-to-1000.add-hundreds', 'Hundred Buddies', 'number-pad', 1, (rng) => {
        const h1 = randInt(rng, 1, 8);
        const h2 = randInt(rng, 1, 9 - h1);
        return numPad(`${h1 * 100} + ${h2 * 100} = ?`, (h1 + h2) * 100);
      }),
      level('g2.pack-to-1000.sub-hundreds', 'Hundred Takeaway', 'number-pad', 1, (rng) => {
        const h1 = randInt(rng, 2, 9);
        const h2 = randInt(rng, 1, h1 - 1);
        return numPad(`${h1 * 100} − ${h2 * 100} = ?`, (h1 - h2) * 100);
      }),
      level('g2.pack-to-1000.tens-3digit', 'Tens in the Deep', 'number-pad', 1, (rng) => {
        const hundreds = randInt(rng, 1, 9);
        const tensA = randInt(rng, 1, 8);
        const tensB = randInt(rng, 1, 9 - tensA);
        const a = hundreds * 100 + tensA * 10;
        const b = tensB * 10;
        return numPad(`${a} + ${b} = ?`, a + b);
      }),
      level('g2.pack-to-1000.jump-100', 'Jump a Hundred', 'number-pad', 1, (rng) => {
        if (rng() < 0.5) {
          const n = randInt(rng, 101, 898);
          return numPad(`${n} + 100 = ?`, n + 100, { hint: 'Only the hundreds digit changes' });
        }
        const a = randInt(rng, 150, 999);
        return numPad(`${a} − 100 = ?`, a - 100, { hint: 'Only the hundreds digit changes' });
      }),
      level('g2.pack-to-1000.add-no-carry', 'Three-Digit Addition', 'number-pad', 2, (rng) => {
        const h1 = randInt(rng, 1, 8);
        const t1 = randInt(rng, 0, 9);
        const o1 = randInt(rng, 0, 9);
        const h2 = randInt(rng, 1, 9 - h1);
        const t2 = randInt(rng, 0, 9 - t1);
        const o2 = randInt(rng, 0, 9 - o1);
        const a = h1 * 100 + t1 * 10 + o1;
        const b = h2 * 100 + t2 * 10 + o2;
        return numPad(`${a} + ${b} = ?`, a + b, { hint: 'Add ones, then tens, then hundreds' });
      }),
      level('g2.pack-to-1000.sub-no-borrow', 'Three-Digit Subtraction', 'number-pad', 2, (rng) => {
        const h1 = randInt(rng, 2, 9);
        const t1 = randInt(rng, 0, 9);
        const o1 = randInt(rng, 0, 9);
        const h2 = randInt(rng, 1, h1 - 1);
        const t2 = randInt(rng, 0, t1);
        const o2 = randInt(rng, 0, o1);
        const a = h1 * 100 + t1 * 10 + o1;
        const b = h2 * 100 + t2 * 10 + o2;
        return numPad(`${a} − ${b} = ?`, a - b);
      }),
      level('g2.pack-to-1000.add-carry-ones', 'Carry into the Tens', 'number-pad', 2, (rng) => {
        const o1 = randInt(rng, 2, 9);
        const t1 = randInt(rng, 0, 8);
        const h1 = randInt(rng, 1, 8);
        const o2 = randInt(rng, 10 - o1, 9);
        const t2 = randInt(rng, 0, 8 - t1);
        const h2 = randInt(rng, 1, 9 - h1);
        const a = h1 * 100 + t1 * 10 + o1;
        const b = h2 * 100 + t2 * 10 + o2;
        return numPad(`${a} + ${b} = ?`, a + b, { hint: 'Watch the ones column' });
      }),
      level('g2.pack-to-1000.sub-borrow-tens', 'Borrow from the Tens', 'number-pad', 2, (rng) => {
        const o1 = randInt(rng, 0, 7);
        const t1 = randInt(rng, 1, 9);
        const h1 = randInt(rng, 2, 9);
        const o2 = randInt(rng, o1 + 1, 9);
        const t2 = randInt(rng, 0, t1 - 1);
        const h2 = randInt(rng, 1, h1 - 1);
        const a = h1 * 100 + t1 * 10 + o1;
        const b = h2 * 100 + t2 * 10 + o2;
        return numPad(`${a} − ${b} = ?`, a - b, { hint: 'Borrow from the tens place' });
      }),
      level('g2.pack-to-1000.break-apart', 'Break It Apart', 'multiple-choice', 2, (rng) => {
        const h = randInt(rng, 1, 8) * 100;
        const rest = randInt(rng, 11, 99);
        const b = h + rest;
        const a = randInt(rng, 101, 999 - b);
        return mcNum(rng, `${a} + ${b} = ${a} + ${h} + ?`, rest, [rest + 10, rest - 10, h, rest + 100], { hint: 'Split the second number into hundreds and the rest' }, { min: 1 });
      }),
      level('g2.pack-to-1000.add-carry-twice', 'Double Carry', 'number-pad', 3, (rng) => {
        const o1 = randInt(rng, 2, 9);
        const t1 = randInt(rng, 1, 8);
        const h1 = randInt(rng, 1, 7);
        const o2 = randInt(rng, 10 - o1, 9);
        const t2 = randInt(rng, 10 - (t1 + 1), 9);
        const h2 = randInt(rng, 1, 8 - h1);
        const a = h1 * 100 + t1 * 10 + o1;
        const b = h2 * 100 + t2 * 10 + o2;
        return numPad(`${a} + ${b} = ?`, a + b, { hint: 'You may carry twice' });
      }),
      level('g2.pack-to-1000.sub-zero', 'Across the Zero', 'number-pad', 3, (rng) => {
        const h1 = randInt(rng, 2, 9);
        const o1 = randInt(rng, 1, 8);
        const a = h1 * 100 + o1;
        const o2 = randInt(rng, o1 + 1, 9);
        const t2 = randInt(rng, 1, 8);
        const h2 = randInt(rng, 0, h1 - 2);
        const b = h2 * 100 + t2 * 10 + o2;
        return numPad(`${a} − ${b} = ?`, a - b, { hint: 'Borrow from the hundreds, through the zero' });
      }),
      level('g2.pack-to-1000.estimate', 'Round the Reef', 'multiple-choice', 3, (rng) => {
        const a = randInt(rng, 120, 480);
        const b = randInt(rng, 110, 460);
        const answer = Math.round((a + b) / 100) * 100;
        return mcNum(rng, `About how much is ${a} + ${b}? Round to the nearest hundred.`, answer, [answer - 100, answer + 100, Math.round(a / 100) * 100, answer + 200], { hint: 'Round each number to the nearest hundred first' }, { count: 3, min: 100 });
      }),
    ],
  },
  {
    id: 'g2.pack-place',
    title: 'Sunken Treasure',
    emoji: '💎',
    domain: 'place-value',
    levels: [
      level('g2.pack-place.blocks', 'Block Builder', 'number-pad', 1, (rng) => {
        const flats = randInt(rng, 1, 9);
        const rods = randInt(rng, 0, 9);
        const units = randInt(rng, 0, 9);
        return numPad(`${flats} ${flats === 1 ? 'flat' : 'flats'}, ${rods} ${rods === 1 ? 'rod' : 'rods'}, ${units} ${units === 1 ? 'unit' : 'units'}. What number?`, flats * 100 + rods * 10 + units, { hint: 'A flat is 100, a rod is 10, a unit is 1' });
      }),
      level('g2.pack-place.tens-digit', 'Tens Detective', 'number-pad', 1, (rng) => {
        const n = randInt(rng, 100, 999);
        return numPad(`What is the tens digit of ${n}?`, Math.floor(n / 10) % 10);
      }),
      level('g2.pack-place.expanded-add', 'Squash the Stretch', 'number-pad', 1, (rng) => {
        const h = randInt(rng, 1, 9);
        const t = randInt(rng, 0, 9);
        const o = randInt(rng, 1, 9);
        return numPad(`${h * 100} + ${t * 10} + ${o} = ?`, h * 100 + t * 10 + o);
      }),
      level('g2.pack-place.stretch-out', 'Stretch It Out', 'multiple-choice', 2, (rng) => {
        const [h, t, o] = randInts(rng, 1, 9, 3);
        const n = h * 100 + t * 10 + o;
        const answer = `${h * 100} + ${t * 10} + ${o}`;
        const wrongs = [`${h * 100} + ${t} + ${o}`, `${h * 100} + ${t * 10} + ${o * 10}`, `${h * 10} + ${t * 10} + ${o}`];
        return mc(`What is ${n} in expanded form?`, answer, wrongs, rng);
      }),
      level('g2.pack-place.names', 'Name That Number', 'multiple-choice', 2, (rng) => {
        const [h, t, o] = randInts(rng, 1, 9, 3);
        const n = h * 100 + t * 10 + o;
        const name = `${ONES_WORDS[h]} hundred ${TENS_WORDS[t]} ${ONES_WORDS[o]}`;
        const wrongs = [
          `${ONES_WORDS[h]} hundred ${TENS_WORDS[o]} ${ONES_WORDS[t]}`,
          `${ONES_WORDS[o]} hundred ${TENS_WORDS[t]} ${ONES_WORDS[h]}`,
          `${ONES_WORDS[h]} hundred ${TENS_WORDS[h]} ${ONES_WORDS[o]}`,
        ];
        return mc(`Which is the number name for ${n}?`, name, wrongs, rng);
      }),
      level('g2.pack-place.words-to-num', 'Words to Number', 'number-pad', 2, (rng) => {
        const [h, t, o] = randInts(rng, 1, 9, 3);
        return numPad(`Write the number: ${ONES_WORDS[h]} hundred ${TENS_WORDS[t]} ${ONES_WORDS[o]}`, h * 100 + t * 10 + o);
      }),
      level('g2.pack-place.digit-value', 'Digit Value Dive', 'number-pad', 2, (rng) => {
        const [h, t, o] = randInts(rng, 1, 9, 3);
        const n = h * 100 + t * 10 + o;
        const place = randInt(rng, 0, 2);
        const digits = [h, t, o];
        return numPad(`In ${n}, what is the value of the digit ${digits[place]}?`, digits[place] * [100, 10, 1][place], { hint: 'Think about which place it sits in' });
      }),
      level('g2.pack-place.ten-more-less', 'Ten Up, Ten Down', 'number-pad', 2, (rng) => {
        const n = randInt(rng, 112, 978);
        const up = rng() < 0.5;
        return numPad(up ? `What is 10 more than ${n}?` : `What is 10 less than ${n}?`, up ? n + 10 : n - 10);
      }),
      level('g2.pack-place.hundred-more-less', 'Hundred Up, Hundred Down', 'number-pad', 3, (rng) => {
        const n = randInt(rng, 150, 880);
        const up = rng() < 0.5;
        return numPad(up ? `100 more than ${n} is ?` : `100 less than ${n} is ?`, up ? n + 100 : n - 100, { hint: 'Only the hundreds digit changes' });
      }),
      level('g2.pack-place.zero-hero', 'Zero Hero', 'multiple-choice', 3, (rng) => {
        const h = randInt(rng, 1, 9);
        const o = randInt(rng, 1, 9);
        const answer = h * 100 + o;
        const wrongs = uniqueInts(rng, 3, () => randInt(rng, 1, 9) * 100 + randInt(rng, 1, 9) * 10 + randInt(rng, 1, 9));
        return mc('Which number has zero tens?', String(answer), wrongs.map(String), rng, { hint: 'Look at the middle digit' });
      }),
      level('g2.pack-place.match-zero', 'Stretchy Zero Match', 'match-pairs', 3, (rng) => {
        const numbers = uniqueInts(rng, 4, () => {
          const h = randInt(rng, 1, 9);
          return rng() < 0.5 ? h * 100 + randInt(rng, 1, 9) : h * 100 + randInt(rng, 1, 9) * 10;
        });
        const pairs = numbers.map((n) => ({ left: `${Math.floor(n / 100) * 100} + ${n % 100}`, right: String(n) }));
        return { ...matchPairs('Match each expanded form to its number.', shuffle(rng, pairs)), hint: 'Watch for the zero place' };
      }),
      level('g2.pack-place.tens-in', 'Tens Altogether', 'multiple-choice', 3, (rng) => {
        const tens = randInt(rng, 11, 99);
        return mcNum(rng, `${tens} tens is the same as which number?`, tens * 10, [tens, tens * 100, tens * 10 - 10, tens * 10 + 100], { hint: `${tens} tens = ${tens} × 10` }, { min: 0 });
      }),
    ],
  },
  {
    id: 'g2.pack-compare',
    title: 'Pearl Parade',
    emoji: '🦪',
    domain: 'place-value',
    levels: [
      level('g2.pack-compare.greater', 'Bigger Pearl', 'multiple-choice', 1, (rng) => {
        const [a, b] = randInts(rng, 100, 999, 2);
        const distractors = numericDistractors(rng, b, [a, b - 10, a - 5, a + 5], { count: 2, max: b - 1 });
        return mc(`Which number is greater, ${a} or ${b}?`, String(b), distractors, rng, { hint: 'Compare hundreds first' });
      }),
      level('g2.pack-compare.sign', 'Pick the Sign', 'multiple-choice', 1, (rng) => {
        const a = randInt(rng, 100, 999);
        const b = randInt(rng, 100, 999);
        const answer = compareSymbol(a, b);
        return mc('Which sign makes it true?', answer, ['<', '>', '='].filter((value) => value !== answer), rng, { visual: { text: `${a} ○ ${b}` }, hint: 'Compare the hundreds first' });
      }),
      level('g2.pack-compare.least', 'Smallest Shell', 'multiple-choice', 1, (rng) => {
        const nums = randInts(rng, 100, 999, 3);
        return mc('Which number is the least?', String(nums[0]), nums.slice(1).map(String), rng, { visual: { text: nums.join('   ') } });
      }),
      level('g2.pack-compare.greatest', 'Grandest Pearl', 'multiple-choice', 1, (rng) => {
        const nums = randInts(rng, 100, 999, 3);
        return mc('Which number is the greatest?', String(nums[2]), nums.slice(0, 2).map(String), rng, { visual: { text: nums.join('   ') } });
      }),
      level('g2.pack-compare.order-up', 'Line Them Up', 'order-sequence', 2, (rng) => {
        const nums = randInts(rng, 100, 999, 4);
        return orderSeq('Order from least to greatest.', nums.map(String));
      }),
      level('g2.pack-compare.order-down', 'Biggest Splash First', 'order-sequence', 2, (rng) => {
        const nums = randInts(rng, 100, 999, 4);
        return orderSeq('Order from greatest to least.', nums.map(String).reverse());
      }),
      level('g2.pack-compare.next-door', 'Number Neighbors', 'number-pad', 2, (rng) => {
        const n = randInt(rng, 105, 995);
        const more = rng() < 0.5;
        return numPad(more ? `What number is 1 more than ${n}?` : `What number is 1 less than ${n}?`, more ? n + 1 : n - 1);
      }),
      level('g2.pack-compare.closest', 'Closest Cove', 'multiple-choice', 2, (rng) => {
        const target = randInt(rng, 2, 9) * 100;
        const delta = randInt(rng, 1, 30) * (rng() < 0.5 ? -1 : 1);
        const answer = target + delta;
        const wrongs = uniqueInts(rng, 3, () => target + randInt(rng, 35, 99) * (rng() < 0.5 ? -1 : 1));
        return mc(`Which number is closest to ${target}?`, String(answer), wrongs.map(String), rng);
      }),
      level('g2.pack-compare.biggest-build', 'Build the Biggest', 'multiple-choice', 3, (rng) => {
        const [d1, d2, d3] = randInts(rng, 1, 9, 3);
        const answer = d3 * 100 + d2 * 10 + d1;
        const wrongs = new Set<number>();
        while (wrongs.size < 3) {
          const [x, y, z] = shuffle(rng, [d1, d2, d3]);
          const value = x * 100 + y * 10 + z;
          if (value !== answer) wrongs.add(value);
        }
        return mc(`Use the digits ${d1}, ${d2}, ${d3}. What is the greatest number you can make?`, String(answer), [...wrongs].map(String), rng, { hint: 'Put the biggest digit in the hundreds place' });
      }),
      level('g2.pack-compare.compare-tf', 'True Compare', 'true-false', 3, (rng) => {
        const [a, b] = randInts(rng, 100, 999, 2);
        const correct = compareSymbol(a, b);
        const shown = rng() < 0.5 ? correct : pick(rng, ['<', '>'].filter((s) => s !== correct));
        return trueFalse(`${a} ${shown} ${b}`, shown === correct, { hint: 'Compare hundreds, then tens, then ones' });
      }),
      level('g2.pack-compare.mixed-order', 'Mixed Lineup', 'order-sequence', 3, (rng) => {
        const h = randInt(rng, 1, 9);
        const rests = randInts(rng, 0, 99, 4);
        const nums = rests.map((rest) => h * 100 + rest);
        const ascending = rng() < 0.5;
        return { ...orderSeq(ascending ? 'Order from least to greatest.' : 'Order from greatest to least.', (ascending ? nums : [...nums].reverse()).map(String)), hint: 'Same hundreds — compare the tens' };
      }),
    ],
  },
  {
    id: 'g2.pack-arrays',
    title: 'Crab Array Cove',
    emoji: '🦀',
    domain: 'operations',
    levels: [
      level('g2.pack-arrays.count', 'Crab Count', 'count-tap', 1, (rng) => {
        const rows = randInt(rng, 2, 5);
        const columns = randInt(rng, 2, 6);
        const answer = rows * columns;
        return {
          ...mcNum(rng, 'How many crabs in all?', answer, [answer - columns, answer + rows, rows + columns, answer - 1], {}, { min: 1, max: 30 }),
          kind: 'count-tap' as const,
          visual: { emoji: '🦀', groups: Array.from({ length: rows }, () => columns) },
        };
      }),
      level('g2.pack-arrays.rows-cols', 'Rows and Columns', 'multiple-choice', 1, (rng) => {
        const rows = randInt(rng, 2, 5);
        const columns = randInt(rng, 2, 5);
        const askRows = rng() < 0.5;
        const answer = askRows ? rows : columns;
        return mcNum(rng, askRows ? 'How many rows are in the array?' : 'How many columns are in the array?', answer, [askRows ? columns : rows, answer - 1, answer + 1, rows * columns], {
          visual: { emoji: '🐚', groups: Array.from({ length: rows }, () => columns) },
        }, { min: 1 });
      }),
      level('g2.pack-arrays.repeated-add', 'Same Number Again', 'number-pad', 1, (rng) => {
        const n = randInt(rng, 2, 5);
        const times = randInt(rng, 2, 5);
        return numPad(`${Array.from({ length: times }, () => n).join(' + ')} = ?`, n * times, { hint: 'Add the same number again and again' });
      }),
      level('g2.pack-arrays.to-addition', 'Array to Addition', 'multiple-choice', 2, (rng) => {
        const rows = randInt(rng, 2, 5);
        const columns = randInt(rng, 2, 5);
        const answer = Array.from({ length: rows }, () => String(columns)).join(' + ');
        const wrongs = [...new Set([
          Array.from({ length: columns }, () => String(rows)).join(' + '),
          `${rows} + ${columns}`,
          Array.from({ length: rows }, () => String(columns + 1)).join(' + '),
          `${rows} + ${rows} + ${columns}`,
          String(rows * columns + 1),
        ])].filter((wrong) => wrong !== answer).slice(0, 3);
        return mc(`${rows} rows of ${columns} makes which addition sentence?`, answer, wrongs, rng, { hint: 'One addend per row' });
      }),
      level('g2.pack-arrays.to-mult', 'Meet Multiplication', 'multiple-choice', 2, (rng) => {
        const times = randInt(rng, 2, 5);
        const n = randInt(rng, 2, 5);
        const answer = `${times} × ${n}`;
        const wrongs = [`${times} + ${n}`, `${times} × ${n + 1}`, `${times + 1} × ${n}`].filter((wrong) => wrong !== answer);
        return mc(`${Array.from({ length: times }, () => n).join(' + ')} is the same as which multiplication?`, answer, [...new Set(wrongs)], rng, { hint: 'Count how many times the number repeats' });
      }),
      level('g2.pack-arrays.mult-facts', 'Times Table Tide', 'number-pad', 2, (rng) => {
        const a = randInt(rng, 1, 5);
        const b = randInt(rng, 1, 5);
        return numPad(`${a} × ${b} = ?`, a * b, { hint: `Think ${a} groups of ${b}` });
      }),
      level('g2.pack-arrays.match-mult', 'Match the Treasure', 'match-pairs', 2, (rng) => {
        const combos = shuffle(rng, multCombos);
        const usedProducts = new Set<number>();
        const pairs: { left: string; right: string }[] = [];
        for (const [a, b] of combos) {
          if (pairs.length === 4) break;
          if (usedProducts.has(a * b)) continue;
          usedProducts.add(a * b);
          pairs.push({ left: `${a} × ${b}`, right: String(a * b) });
        }
        return matchPairs('Match each multiplication to its answer.', pairs);
      }),
      level('g2.pack-arrays.equal-groups', 'Equal Groups Story', 'number-pad', 2, (rng) => {
        const bags = randInt(rng, 2, 5);
        const each = randInt(rng, 2, 5);
        const thing = pick(rng, storyThings);
        return numPad(`${bags} bags. Each bag has ${each} ${thing.plural} ${thing.emoji}. How many ${thing.plural} in all?`, bags * each, { hint: 'Add equal groups' });
      }),
      level('g2.pack-arrays.mult-tf', 'Times Check', 'true-false', 2, (rng) => {
        const a = randInt(rng, 2, 5);
        const b = randInt(rng, 2, 5);
        const truth = rng() < 0.5;
        const shown = truth ? a * b : a * b + pick(rng, [1, -1, a]);
        return trueFalse(`${a} × ${b} = ${shown}`, truth);
      }),
      level('g2.pack-arrays.word-array', 'Muffin Trays', 'number-pad', 3, (rng) => {
        const rows = randInt(rng, 2, 5);
        const columns = randInt(rng, 2, 5);
        const item = pick(rng, [['muffins', '🧁'], ['stickers', '🏷️'], ['chairs', '🪑'], ['cups', '🥤']]);
        return numPad(`A tray has ${rows} rows with ${columns} ${item[0]} in each row. How many ${item[0]} in all?`, rows * columns, { hint: 'Multiply rows by columns' });
      }),
      level('g2.pack-arrays.order-products', 'Smallest to Largest', 'order-sequence', 3, (rng) => {
        const combos = shuffle(rng, multCombos);
        const used = new Set<number>();
        const chosen: [number, number][] = [];
        for (const combo of combos) {
          if (chosen.length === 4) break;
          if (!used.has(combo[0] * combo[1])) {
            used.add(combo[0] * combo[1]);
            chosen.push(combo);
          }
        }
        const sequence = chosen.sort((x, y) => x[0] * x[1] - y[0] * y[1]).map(([a, b]) => `${a} × ${b}`);
        return { ...orderSeq('Order the multiplications from smallest to largest answer.', sequence), hint: 'Multiply each one first' };
      }),
      level('g2.pack-arrays.which-array', 'Build the Array', 'multiple-choice', 3, (rng) => {
        const a = randInt(rng, 2, 5);
        const b = pick(rng, [2, 3, 4, 5].filter((value) => value !== a));
        const answer = `${a} rows of ${b}`;
        const wrongs = [`${b} rows of ${a}`, `${a} rows of ${a}`, `${b} rows of ${b}`].filter((wrong) => wrong !== answer);
        return mc(`Which array matches ${a} × ${b}?`, answer, [...new Set(wrongs)], rng, { hint: 'The first number counts the rows' });
      }),
    ],
  },
  {
    id: 'g2.pack-money',
    title: 'Doubloon Market',
    emoji: '🏴‍☠️',
    domain: 'money',
    levels: [
      level('g2.pack-money.value-to-coin', 'Worth Its Weight', 'match-pairs', 1, (rng) => {
        const bank = shuffle(rng, [
          { left: '1¢', right: 'penny' },
          { left: '5¢', right: 'nickel' },
          { left: '10¢', right: 'dime' },
          { left: '25¢', right: 'quarter' },
          { left: '100¢', right: 'dollar bill' },
        ]).slice(0, 4);
        return matchPairs('Match each value to its coin or bill.', bank);
      }),
      level('g2.pack-money.pennies-nickels', 'Pennies and Nickels', 'number-pad', 1, (rng) => {
        const nickels = randInt(rng, 1, 6);
        const pennies = randInt(rng, 1, 9);
        return numPad(`${coinNoun(nickels, 'nickel', 'nickels')} and ${coinNoun(pennies, 'penny', 'pennies')} — how many cents?`, nickels * 5 + pennies, { hint: 'A nickel is 5¢' });
      }),
      level('g2.pack-money.dimes-pennies', 'Dimes and Pennies', 'number-pad', 1, (rng) => {
        const dimes = randInt(rng, 1, 8);
        const pennies = randInt(rng, 1, 9);
        return numPad(`${coinNoun(dimes, 'dime', 'dimes')} and ${coinNoun(pennies, 'penny', 'pennies')} — how many cents?`, dimes * 10 + pennies, { hint: 'A dime is 10¢' });
      }),
      level('g2.pack-money.worth-more', 'Worth More?', 'multiple-choice', 1, (rng) => {
        const a = randInt(rng, 1, 4);
        let b = randInt(rng, 1, 6);
        while (b * 5 === a * 10) b = randInt(rng, 1, 6);
        const leftLabel = coinNoun(a, 'dime', 'dimes');
        const rightLabel = coinNoun(b, 'nickel', 'nickels');
        const answer = a * 10 > b * 5 ? leftLabel : rightLabel;
        return mc('Which is worth more?', answer, [answer === leftLabel ? rightLabel : leftLabel, 'They are equal'], rng, { hint: 'A dime is 10¢, a nickel is 5¢' });
      }),
      level('g2.pack-money.mixed-coins', 'Coin Mix', 'number-pad', 2, (rng) => {
        const quarters = randInt(rng, 0, 2);
        const dimes = randInt(rng, 0, 4);
        const nickels = randInt(rng, 1, 3);
        const answer = quarters * 25 + dimes * 10 + nickels * 5;
        const parts: string[] = [];
        if (quarters > 0) parts.push(coinNoun(quarters, 'quarter', 'quarters'));
        if (dimes > 0) parts.push(coinNoun(dimes, 'dime', 'dimes'));
        parts.push(coinNoun(nickels, 'nickel', 'nickels'));
        return numPad(`${parts.join(', ')} — how many cents?`, answer, { hint: 'Quarters are 25¢, dimes 10¢, nickels 5¢' });
      }),
      level('g2.pack-money.bills', 'Bills and Coins', 'number-pad', 2, (rng) => {
        const useFive = rng() < 0.4;
        const ones = useFive ? 0 : randInt(rng, 1, 4);
        const cents = randInt(rng, 5, 95);
        const total = (useFive ? 500 : ones * 100) + cents;
        const description = useFive ? `a $5 bill and ${formatCents(cents)} in coins` : `${ones} $1 ${ones === 1 ? 'bill' : 'bills'} and ${formatCents(cents)} in coins`;
        return numPad(`${capitalizeWord(description)} — how many cents in all?`, total, { hint: '100 cents make a dollar' });
      }),
      level('g2.pack-money.two-items', 'Two Treasure Prices', 'number-pad', 2, (rng) => {
        const things = shuffle(rng, storyThings).slice(0, 2);
        const p1 = randInt(rng, 15, 80);
        const p2 = randInt(rng, 15, 99 - p1);
        return numPad(`A ${things[0].singular} costs ${formatCents(p1)}. A ${things[1].singular} costs ${formatCents(p2)}. How much for both?`, p1 + p2, { hint: 'Add the cents together' });
      }),
      level('g2.pack-money.cents-to-dollars', 'Cents to Dollars', 'multiple-choice', 2, (rng) => {
        const dollars = randInt(rng, 1, 5);
        const cents = randInt(rng, 1, 9) * 10;
        const total = dollars * 100 + cents;
        const wrongs = [...new Set([formatDollars(cents * 10 + dollars), formatDollars(total + 100), formatDollars(total - 10)])].filter((wrong) => wrong !== formatDollars(total));
        return mc(`${total}¢ is the same as how many dollars?`, formatDollars(total), wrongs, rng, { hint: '100¢ = $1.00' });
      }),
      level('g2.pack-money.make-amount', 'Make the Price', 'multiple-choice', 2, (rng) => {
        const options = [
          { coins: '2 quarters, 1 dime', value: 60 },
          { coins: '2 quarters, 2 dimes, 1 nickel', value: 75 },
          { coins: '1 quarter, 3 dimes', value: 55 },
          { coins: '3 quarters, 1 nickel', value: 80 },
          { coins: '2 dimes, 3 nickels', value: 35 },
          { coins: '1 quarter, 4 dimes', value: 65 },
          { coins: '4 dimes, 2 nickels', value: 50 },
        ];
        const target = pick(rng, options);
        const wrongs = shuffle(rng, options.filter((option) => option.value !== target.value)).slice(0, 3).map((option) => option.coins);
        return mc(`Which coins make ${formatCents(target.value)}?`, target.coins, wrongs, rng);
      }),
      level('g2.pack-money.change-dollar', 'Change from a Dollar', 'number-pad', 3, (rng) => {
        const price = randInt(rng, 15, 95);
        return numPad(`A ${pick(rng, storyThings).singular} costs ${formatCents(price)}. You pay with a $1 bill. How many cents change?`, 100 - price, { hint: 'Count up from the price to 100' });
      }),
      level('g2.pack-money.change-five', 'Change from Five', 'number-pad', 3, (rng) => {
        const price = randInt(rng, 105, 495);
        return numPad(`A toy boat costs ${formatDollars(price)}. You pay with a $5 bill. How many cents change?`, 500 - price, { hint: 'Count up to 500 cents' });
      }),
      level('g2.pack-money.story', 'Market Story', 'multiple-choice', 3, (rng) => {
        const thing = pick(rng, storyThings);
        const price = randInt(rng, 30, 70);
        const extra = randInt(rng, 5, 99 - price);
        const pay = (Math.floor((price + extra) / 100) + 1) * 100;
        const answer = pay - (price + extra);
        const prompt = `You buy a ${thing.singular} for ${formatCents(price)} and a card for ${formatCents(extra)}. You pay ${formatDollars(pay)}. How much change?`;
        const labels = numericDistractors(rng, answer, [pay - price, 100 - price, answer - 10, answer + 10, price + extra], { min: 0 }).map((value) => formatCents(Number(value)));
        return mc(prompt, formatCents(answer), labels, rng, { hint: 'Add the prices first, then subtract from what you paid' });
      }),
    ],
  },
  {
    id: 'g2.pack-time',
    title: 'Tide Clock',
    emoji: '⏰',
    domain: 'time',
    levels: [
      level('g2.pack-time.count-clock', 'Clock Count', 'order-sequence', 1, (rng) => {
        const start = pick(rng, [0, 5, 10]);
        return orderSeq('Put the clock minutes in order.', Array.from({ length: 5 }, (_, i) => `:${String(start + i * 5).padStart(2, '0')}`));
      }),
      level('g2.pack-time.hand', 'Which Hand?', 'multiple-choice', 1, (rng) => {
        const askHour = rng() < 0.5;
        return mc(askHour ? 'The short hand on a clock shows the __.' : 'The long hand on a clock shows the __.', askHour ? 'hour' : 'minutes', [askHour ? 'minutes' : 'hour', 'seconds'], rng);
      }),
      level('g2.pack-time.ampm', 'Morning or Night?', 'multiple-choice', 1, (rng) => {
        const activity = pick(rng, ampmBank);
        return mc(`When do you usually ${activity.text}?`, activity.answer, [activity.answer === 'AM' ? 'PM' : 'AM'], rng, { hint: 'AM is morning, PM is afternoon and night' });
      }),
      level('g2.pack-time.read', 'Clock Reader', 'multiple-choice', 2, (rng) => {
        const hour = randInt(rng, 1, 12);
        const m5 = randInt(rng, 0, 11);
        const minute = m5 * 5;
        const answer = fmtTime(hour, minute);
        const wrongs = [...new Set([
          fmtTime(hour === 12 ? 1 : hour + 1, minute),
          fmtTime(hour, (minute + 10) % 60),
          fmtTime(m5 === 0 ? 12 : m5, (hour * 5) % 60),
        ])].filter((wrong) => wrong !== answer).slice(0, 3);
        return mc(`The hour hand points past the ${hour}. The minute hand points to the ${m5 === 0 ? 12 : m5}. What time is it?`, answer, wrongs, rng, { hint: 'Count the minutes by 5s' });
      }),
      level('g2.pack-time.phrases', 'Quarter and Half', 'multiple-choice', 2, (rng) => {
        const hour = randInt(rng, 1, 12);
        const phrase = pick(rng, ['quarter past', 'half past']);
        const minute = phrase === 'quarter past' ? 15 : 30;
        const answer = fmtTime(hour, minute);
        const wrongs = [...new Set([
          fmtTime(hour, minute === 15 ? 45 : 15),
          fmtTime(hour === 12 ? 1 : hour + 1, minute),
          fmtTime(hour, minute === 15 ? 25 : 35),
        ])].filter((wrong) => wrong !== answer).slice(0, 3);
        return mc(`${capitalizeWord(phrase)} ${hour} is the same as what time?`, answer, wrongs, rng, { hint: 'A quarter is 15 minutes, a half is 30' });
      }),
      level('g2.pack-time.phrase-match', 'Time Words Match', 'match-pairs', 2, (rng) => {
        const hours = randInts(rng, 1, 11, 4);
        const kinds = shuffle(rng, ['quarter past', 'half past', "o'clock", 'quarter to']);
        const pairs = hours.map((hour, index) => {
          const kind = kinds[index];
          const right = kind === 'quarter past' ? fmtTime(hour, 15) : kind === 'half past' ? fmtTime(hour, 30) : kind === "o'clock" ? fmtTime(hour, 0) : fmtTime(hour, 45);
          return { left: `${kind} ${kind === 'quarter to' ? hour + 1 : hour}`, right };
        });
        return matchPairs('Match each time in words to the clock time.', pairs);
      }),
      level('g2.pack-time.clock-emoji', 'Emoji Clocks', 'multiple-choice', 2, (rng) => {
        const half = rng() < 0.5;
        const hourIndex = randInt(rng, 0, 11);
        const face = half ? CLOCK_HALF[hourIndex] : CLOCK_HOUR[hourIndex];
        const shown = hourIndex + 1;
        const answer = fmtTime(shown, half ? 30 : 0);
        const wrongs = [...new Set([
          fmtTime(shown, half ? 0 : 30),
          fmtTime(shown === 12 ? 1 : shown + 1, half ? 30 : 0),
          fmtTime(shown, 15),
        ])].filter((wrong) => wrong !== answer).slice(0, 3);
        return mc(`${face} What time does the clock show?`, answer, wrongs, rng);
      }),
      level('g2.pack-time.earlier', 'Minutes Earlier', 'multiple-choice', 3, (rng) => {
        const hour = randInt(rng, 1, 12);
        const minute = randInt(rng, 2, 11) * 5;
        const back = pick(rng, [5, 10, 15, 20, 25, 30, 35, 40, 45].filter((value) => value < minute));
        const answer = fmtTime(hour, minute - back);
        const wrongs = [...new Set([
          fmtTime(hour, (minute + back) % 60),
          fmtTime(hour === 12 ? 1 : hour + 1, minute - back),
          fmtTime(hour, minute),
        ])].filter((wrong) => wrong !== answer).slice(0, 3);
        return mc(`It is ${fmtTime(hour, minute)}. What time was it ${back} minutes earlier?`, answer, wrongs, rng, { hint: 'Count back by 5s' });
      }),
      level('g2.pack-time.hours-later', 'Hours Later', 'number-pad', 3, (rng) => {
        const start = randInt(rng, 1, 9);
        const later = randInt(rng, 1, 12 - start);
        return numPad(`A trip starts at ${start}:00 and ends ${later} ${later === 1 ? 'hour' : 'hours'} later. What hour does it end?`, start + later, { hint: 'Count the hours forward' });
      }),
      level('g2.pack-time.elapsed', 'How Many Minutes?', 'multiple-choice', 3, (rng) => {
        const hour = randInt(rng, 1, 11);
        const startIndex = randInt(rng, 0, 9);
        const endIndex = randInt(rng, startIndex + 1, 11);
        const answer = (endIndex - startIndex) * 5;
        return mcNum(rng, `From ${fmtTime(hour, startIndex * 5)} to ${fmtTime(hour, endIndex * 5)} — how many minutes pass?`, answer, [answer - 5, answer + 5, endIndex * 5, answer + 15], { hint: 'Count by 5s' }, { min: 5 });
      }),
      level('g2.pack-time.later', 'Minutes Later', 'multiple-choice', 3, (rng) => {
        const hour = randInt(rng, 1, 11);
        const minute = randInt(rng, 0, 10) * 5;
        const add = pick(rng, [10, 15, 20, 30]);
        const total = minute + add;
        const answer = fmtTime(hour + Math.floor(total / 60), total % 60);
        const wrongs = [...new Set([
          fmtTime(hour, Math.max(0, minute - add)),
          fmtTime(hour + 1, minute),
          fmtTime(hour, (minute + 5) % 60),
        ])].filter((wrong) => wrong !== answer).slice(0, 3);
        return mc(`It is ${fmtTime(hour, minute)}. What time is it ${add} minutes later?`, answer, wrongs, rng, { hint: 'Add the minutes, regroup at 60' });
      }),
    ],
  },
  {
    id: 'g2.pack-measure',
    title: 'Otter Tool Shop',
    emoji: '🦦',
    domain: 'measurement',
    levels: [
      level('g2.pack-measure.tool', 'Pick the Tool', 'multiple-choice', 1, (rng) => {
        const item = pick(rng, measureTools);
        const wrongs = [...new Set(measureTools.map((entry) => entry.tool).filter((tool) => tool !== item.tool))].slice(0, 3);
        return mc(`What is the best tool to measure ${item.object}?`, item.tool, shuffle(rng, wrongs), rng);
      }),
      level('g2.pack-measure.longer-unit', 'Longer Unit?', 'multiple-choice', 1, (rng) => {
        const pairs: [string, string, string][] = [['inch', 'foot', 'foot'], ['centimeter', 'meter', 'meter'], ['inch', 'centimeter', 'inch'], ['foot', 'yard', 'yard']];
        const pair = pick(rng, pairs);
        const other = pair[2] === pair[0] ? pair[1] : pair[0];
        return mc(`Which is longer, 1 ${pair[0]} or 1 ${pair[1]}?`, `1 ${pair[2]}`, [`1 ${other}`, 'They are the same'], rng);
      }),
      level('g2.pack-measure.unit-pick', 'Which Unit?', 'multiple-choice', 1, (rng) => {
        const items = [
          { object: 'a paper clip', unit: 'centimeters' },
          { object: 'a pencil', unit: 'inches' },
          { object: 'a garden', unit: 'meters' },
          { object: 'a bed', unit: 'feet' },
          { object: 'a river', unit: 'meters' },
          { object: 'a lunchbox', unit: 'inches' },
        ];
        const item = pick(rng, items);
        const wrongs = shuffle(rng, ['inches', 'feet', 'centimeters', 'meters'].filter((unit) => unit !== item.unit)).slice(0, 3);
        return mc(`What unit is best to measure ${item.object}?`, item.unit, wrongs, rng);
      }),
      level('g2.pack-measure.feet-inches', 'Feet to Inches', 'number-pad', 2, (rng) => {
        const feet = randInt(rng, 1, 6);
        return numPad(`${feet} ${feet === 1 ? 'foot' : 'feet'} = how many inches?`, feet * 12, { hint: '1 foot = 12 inches' });
      }),
      level('g2.pack-measure.meters-cm', 'Meters to Centimeters', 'number-pad', 2, (rng) => {
        const meters = randInt(rng, 1, 9);
        return numPad(`${meters} ${meters === 1 ? 'meter' : 'meters'} = how many centimeters?`, meters * 100, { hint: '1 meter = 100 centimeters' });
      }),
      level('g2.pack-measure.ruler-gap', 'Broken Ruler', 'number-pad', 2, (rng) => {
        const start = randInt(rng, 1, 8);
        const length = randInt(rng, 2, 11);
        const unit = pick(rng, ['in', 'cm']);
        return numPad(`A ribbon starts at ${start} ${unit} and ends at ${start + length} ${unit} on the ruler. How long is it?`, length, { hint: 'Subtract the starting mark' });
      }),
      level('g2.pack-measure.how-longer', 'How Much Longer?', 'number-pad', 2, (rng) => {
        const unit = pick(rng, ['in', 'cm', 'ft']);
        const object = pick(rng, ['board', 'rope', 'ribbon']);
        const a = randInt(rng, 15, 60);
        const difference = randInt(rng, 2, 14);
        return numPad(`One ${object} is ${a} ${unit} long. Another is ${a - difference} ${unit} long. How much longer is the first?`, difference, { hint: 'Subtract the shorter length' });
      }),
      level('g2.pack-measure.mixed-compare', 'Units Mix-Up', 'multiple-choice', 2, (rng) => {
        const cm = randInt(rng, 15, 60);
        return mc(`A ribbon is about ${cm} cm or ${Math.round(cm / 2.54)} in. Which unit gives the bigger number?`, 'centimeters', ['inches', 'They give the same number'], rng, { hint: 'Centimeters are smaller, so you need more of them' });
      }),
      level('g2.pack-measure.estimate', 'Best Guess', 'multiple-choice', 3, (rng) => {
        const item = pick(rng, estimateObjects);
        return mc(`About how long is ${item.object}?`, item.answer, item.distractors, rng, { hint: 'Picture the real object in your mind' });
      }),
      level('g2.pack-measure.length-story', 'Ribbon Story', 'number-pad', 3, (rng) => {
        const a = randInt(rng, 30, 90);
        const cut = randInt(rng, 5, a - 10);
        const unit = pick(rng, ['cm', 'in']);
        return numPad(`A ribbon is ${a} ${unit} long. You cut off ${cut} ${unit}. How long is it now?`, a - cut, { hint: 'Subtract the part you cut' });
      }),
      level('g2.pack-measure.order-lengths', 'Line Up the Lengths', 'order-sequence', 3, (rng) => {
        const unit = pick(rng, ['cm', 'in']);
        const lengths = randInts(rng, 3, 60, 4);
        return { ...orderSeq('Order the lengths from shortest to longest.', lengths.map((length) => `${length} ${unit}`)), hint: 'Smallest number first' };
      }),
    ],
  },
  {
    id: 'g2.pack-data',
    title: 'Pelican Graph Pier',
    emoji: '📊',
    domain: 'data',
    levels: [
      level('g2.pack-data.bar-read', 'Bar Graph Look', 'number-pad', 1, (rng) => {
        const rows = shuffle(rng, graphSubjects).slice(0, 3).map((subject) => ({ ...subject, count: randInt(rng, 1, 8) }));
        const chosen = pick(rng, rows);
        return numPad(`${rows.map((row) => `${capitalizeWord(row.name)}: ${'▇'.repeat(row.count)}`).join('\n')}\nHow many ${chosen.name}?`, chosen.count, { hint: 'Count the bars in that row' });
      }),
      level('g2.pack-data.bar-most', 'Tallest Bar', 'multiple-choice', 1, (rng) => {
        const rows = shuffle(rng, graphSubjects).slice(0, 3);
        const counts = randInts(rng, 1, 8, 3);
        const graph = rows.map((row) => `${capitalizeWord(row.name)}: ${'▇'.repeat(counts[rows.indexOf(row)])}`).join('\n');
        const most = rows[2].name;
        return mc(`${graph}\nWhich has the most?`, most, rows.slice(0, 2).map((row) => row.name), rng);
      }),
      level('g2.pack-data.pic-total', 'Picture Graph Total', 'number-pad', 1, (rng) => {
        const rows = shuffle(rng, graphSubjects).slice(0, 3).map((subject) => ({ ...subject, count: randInt(rng, 1, 4) }));
        const answer = rows.reduce((sum, row) => sum + row.count, 0) * 2;
        return numPad(`Key: each picture = 2\n${rows.map((row) => `${capitalizeWord(row.name)}: ${row.emoji.repeat(row.count)}`).join('\n')}\nHow many in all?`, answer, { hint: 'Add all the pictures, then double' });
      }),
      level('g2.pack-data.pic-key5', 'Picture Graph ×5', 'number-pad', 2, (rng) => {
        const rows = shuffle(rng, graphSubjects).slice(0, 3).map((subject) => ({ ...subject, count: randInt(rng, 1, 5) }));
        const chosen = pick(rng, rows);
        return numPad(`Key: each picture = 5\n${rows.map((row) => `${capitalizeWord(row.name)}: ${row.emoji.repeat(row.count)}`).join('\n')}\nHow many ${chosen.name}?`, chosen.count * 5, { hint: 'Count the pictures, then count by 5s' });
      }),
      level('g2.pack-data.bar-diff', 'Graph Compare', 'number-pad', 2, (rng) => {
        const rows = shuffle(rng, graphSubjects).slice(0, 3);
        const counts = randInts(rng, 1, 8, 3);
        const graph = rows.map((row, index) => `${capitalizeWord(row.name)}: ${'▇'.repeat(counts[index])}`).join('\n');
        return numPad(`${graph}\nHow many more ${rows[2].name} than ${rows[0].name}?`, counts[2] - counts[0], { hint: 'Subtract the smaller bar' });
      }),
      level('g2.pack-data.line-count', 'Marks on the Plot', 'number-pad', 2, (rng) => {
        const lengths = [4, 5, 6, 7];
        const counts = lengths.map(() => randInt(rng, 1, 4));
        const target = pick(rng, lengths);
        const plot = lengths.map((length, index) => `${length} in  ${'✖️'.repeat(counts[index])}`).join('\n');
        return numPad(`${plot}\nHow many shells measure ${target} in?`, counts[lengths.indexOf(target)], { hint: 'Count the marks above that length' });
      }),
      level('g2.pack-data.line-most', 'Most Common Mark', 'multiple-choice', 2, (rng) => {
        const lengths = [3, 4, 5, 6];
        const counts = shuffle(rng, randInts(rng, 1, 4, 4));
        const plot = lengths.map((length, index) => `${length} in  ${'✖️'.repeat(counts[index])}`).join('\n');
        const mostIndex = counts.indexOf(Math.max(...counts));
        const wrongs = lengths.filter((_, index) => index !== mostIndex).map((length) => `${length} in`);
        return mc(`${plot}\nWhich length has the most marks?`, `${lengths[mostIndex]} in`, wrongs, rng);
      }),
      level('g2.pack-data.tally', 'Tally Up', 'number-pad', 2, (rng) => {
        const groups = randInt(rng, 1, 2);
        const extra = randInt(rng, 1, 4);
        const tally = `${Array.from({ length: groups }, () => '|||||').join(' ')} ${'|'.repeat(extra)}`;
        return numPad(`Count the tally marks: ${tally}`, groups * 5 + extra, { hint: 'Each group of 5 counts quickly' });
      }),
      level('g2.pack-data.pic-big-total', 'Big Graph Total', 'number-pad', 3, (rng) => {
        const key = pick(rng, [2, 3]);
        const rows = shuffle(rng, graphSubjects).slice(0, 4).map((subject) => ({ ...subject, count: randInt(rng, 1, 4) }));
        const answer = rows.reduce((sum, row) => sum + row.count, 0) * key;
        return numPad(`Key: each picture = ${key}\n${rows.map((row) => `${capitalizeWord(row.name)}: ${row.emoji.repeat(row.count)}`).join('\n')}\nHow many in all?`, answer, { hint: 'Add the pictures, then multiply by the key' });
      }),
      level('g2.pack-data.line-total', 'Total on the Plot', 'number-pad', 3, (rng) => {
        const lengths = [2, 3, 4, 5];
        const counts = lengths.map(() => randInt(rng, 0, 3));
        const plot = lengths.map((length, index) => `${length} in  ${'✖️'.repeat(counts[index])}`).join('\n');
        const answer = counts.reduce((sum, count) => sum + count, 0);
        return numPad(`${plot}\nHow many shells were measured in all?`, answer, { hint: 'Count every mark on the plot' });
      }),
      level('g2.pack-data.graph-tf', 'Graph Detective', 'true-false', 3, (rng) => {
        const rows = shuffle(rng, graphSubjects).slice(0, 2);
        const [low, high] = randInts(rng, 1, 8, 2);
        const graph = `${capitalizeWord(rows[0].name)}: ${'▇'.repeat(low)}\n${capitalizeWord(rows[1].name)}: ${'▇'.repeat(high)}`;
        const claimMore = rng() < 0.5;
        const statement = claimMore ? `${capitalizeWord(rows[0].name)} have more than ${rows[1].name}.` : `${capitalizeWord(rows[0].name)} have fewer than ${rows[1].name}.`;
        return trueFalse(`${graph}\n${statement}`, !claimMore, { hint: 'Compare the bar lengths' });
      }),
    ],
  },
  {
    id: 'g2.pack-shapes',
    title: 'Sea Glass Shapes',
    emoji: '🔷',
    domain: 'geometry',
    levels: [
      level('g2.pack-shapes.sides', 'Count the Sides', 'number-pad', 1, (rng) => {
        const shape = pick(rng, polyBank);
        return numPad(`How many sides does a ${shape.name} have?`, shape.sides);
      }),
      level('g2.pack-shapes.name-it', 'Name by Sides', 'multiple-choice', 1, (rng) => {
        const shape = pick(rng, polyBank);
        const wrongs = shuffle(rng, polyBank.filter((entry) => entry !== shape)).slice(0, 3).map((entry) => entry.name);
        return mc(`I am a flat shape with ${shape.sides} sides. What am I?`, shape.name, wrongs, rng);
      }),
      level('g2.pack-shapes.quad', 'Quad Squad', 'multiple-choice', 1, (rng) => {
        const quads = ['square', 'rectangle', 'rhombus', 'trapezoid'];
        const nonQuads = ['triangle', 'pentagon', 'hexagon', 'circle'];
        const answer = pick(rng, quads);
        return mc('Which shape is a quadrilateral?', answer, shuffle(rng, nonQuads).slice(0, 3), rng, { hint: 'Quad means four sides' });
      }),
      level('g2.pack-shapes.corners', 'Corner Counter', 'number-pad', 2, (rng) => {
        const shape = pick(rng, polyBank);
        return numPad(`How many corners does a ${shape.name} have?`, shape.sides, { hint: 'A corner is where two sides meet' });
      }),
      level('g2.pack-shapes.cube-facts', 'Solid Facts', 'number-pad', 2, (rng) => {
        const shape = pick(rng, solidBank);
        const property = pick(rng, ['faces', 'edges', 'vertices'] as const);
        return numPad(`How many ${property} does a ${shape.name} have?`, shape[property]);
      }),
      level('g2.pack-shapes.face-shape', 'Face Finder', 'multiple-choice', 2, (rng) => {
        const items = [
          { question: 'What shape is each face of a cube?', answer: 'squares', wrong: ['triangles', 'circles', 'rectangles'] },
          { question: 'What shape are the side faces of a square pyramid?', answer: 'triangles', wrong: ['squares', 'circles', 'rectangles'] },
          { question: 'What shape are the flat ends of a cylinder?', answer: 'circles', wrong: ['squares', 'triangles', 'ovals'] },
          { question: 'What shape are the side faces of a triangular prism?', answer: 'rectangles', wrong: ['triangles', 'circles', 'pentagons'] },
        ];
        const item = pick(rng, items);
        return mc(item.question, item.answer, item.wrong, rng);
      }),
      level('g2.pack-shapes.tiles', 'Tile the Floor', 'count-tap', 2, (rng) => {
        const rows = randInt(rng, 2, 4);
        const columns = randInt(rng, 2, 6);
        const answer = rows * columns;
        return {
          ...mcNum(rng, 'How many square tiles cover the floor?', answer, [answer - columns, answer + rows, rows + columns, answer - 1], {}, { min: 1, max: 24 }),
          kind: 'count-tap' as const,
          visual: { emoji: '🟨', groups: Array.from({ length: rows }, () => columns) },
        };
      }),
      level('g2.pack-shapes.shape-tf', 'Shape Facts', 'true-false', 2, (rng) => {
        const facts = [
          { text: 'A square is a quadrilateral.', truth: true },
          { text: 'A pentagon has 6 sides.', truth: false },
          { text: 'A cube has 6 faces.', truth: true },
          { text: 'A rectangle has 4 square corners.', truth: true },
          { text: 'A triangle has 4 sides.', truth: false },
          { text: 'A hexagon has more sides than a pentagon.', truth: true },
          { text: 'A circle has 2 corners.', truth: false },
          { text: 'All quadrilaterals have 4 sides.', truth: true },
        ];
        const fact = pick(rng, facts);
        return trueFalse(fact.text, fact.truth);
      }),
      level('g2.pack-shapes.solid-match', 'Solid Match', 'match-pairs', 3, (rng) => {
        const bank = shuffle(rng, [
          { left: 'cube', right: '6 square faces' },
          { left: 'square pyramid', right: '5 faces' },
          { left: 'cylinder', right: '2 flat faces' },
          { left: 'sphere', right: '0 faces' },
          { left: 'cone', right: '1 flat face' },
        ]).slice(0, 4);
        return { ...matchPairs('Match each solid to its faces.', bank), hint: 'Picture each solid and count its flat faces' };
      }),
      level('g2.pack-shapes.riddle', 'Solid Riddle', 'multiple-choice', 3, (rng) => {
        const items = [
          { riddle: 'I have 6 square faces and 12 edges.', answer: 'cube', wrong: ['sphere', 'cone', 'square pyramid'] },
          { riddle: 'I roll and have 2 flat circle faces.', answer: 'cylinder', wrong: ['cone', 'cube', 'sphere'] },
          { riddle: 'I have one flat face and one pointy top.', answer: 'cone', wrong: ['cylinder', 'cube', 'sphere'] },
          { riddle: 'I have no faces, no edges, and no corners.', answer: 'sphere', wrong: ['cube', 'cone', 'cylinder'] },
        ];
        const item = pick(rng, items);
        return mc(`${item.riddle} What am I?`, item.answer, item.wrong, rng, { hint: 'Count what the riddle describes' });
      }),
      level('g2.pack-shapes.how-cut', 'How Was It Cut?', 'multiple-choice', 3, (rng) => {
        const rows = randInt(rng, 2, 4);
        const columns = randInt(rng, 2, 5);
        const answer = `${rows} rows and ${columns} columns`;
        const wrongs = [...new Set([`${rows + 1} rows and ${columns} columns`, `${rows} rows and ${columns + 1} columns`, `${columns} rows and ${columns} columns`])].filter((wrong) => wrong !== answer).slice(0, 3);
        return mc(`A rectangle is cut into ${rows * columns} equal squares. How was it cut?`, answer, wrongs, rng, { hint: 'Rows times columns gives the total' });
      }),
    ],
  },
  {
    id: 'g2.pack-fractions',
    title: 'Sand Dollar Shares',
    emoji: '🍕',
    domain: 'fractions',
    levels: [
      level('g2.pack-fractions.shaded', 'Shaded Parts', 'multiple-choice', 1, (rng) => {
        const parts = pick(rng, [2, 3, 4]);
        const shaded = randInt(rng, 1, parts - 1);
        const answer = `${shaded}/${parts}`;
        const pool = ['1/2', '1/3', '2/3', '1/4', '3/4', '2/4', '3/2'];
        const wrongs = shuffle(rng, pool.filter((fraction) => fraction !== answer)).slice(0, 3);
        return mc(`${shaded} of ${parts} equal parts are shaded. What fraction is shaded?`, answer, wrongs, rng);
      }),
      level('g2.pack-fractions.name-share', 'Share Names', 'multiple-choice', 1, (rng) => {
        const fact = pick(rng, fractionWordBank);
        return mc(`A pizza is split into ${fact.parts} equal slices. Each slice is called a ___.`, fact.single, fractionWordBank.filter((entry) => entry !== fact).map((entry) => entry.single), rng);
      }),
      level('g2.pack-fractions.equal-tf', 'Fair Shares', 'true-false', 1, (rng) => {
        const fact = pick(rng, equalShareFacts);
        return trueFalse(fact.text, fact.truth);
      }),
      level('g2.pack-fractions.make-whole', 'Make a Whole', 'number-pad', 2, (rng) => {
        const fact = pick(rng, fractionWordBank);
        return numPad(`How many ${fact.name} make 1 whole?`, fact.parts);
      }),
      level('g2.pack-fractions.bigger-piece', 'Bigger Piece', 'multiple-choice', 2, (rng) => {
        const pair = pick(rng, [['1/2', '1/3'], ['1/2', '1/4'], ['1/3', '1/4'], ['2/3', '1/3'], ['3/4', '1/4'], ['2/4', '1/4']]);
        return mc(`Which piece is bigger: ${pair[0]} or ${pair[1]} of a cookie?`, pair[0], [pair[1], 'They are the same size'], rng, { hint: 'Fewer equal parts means bigger pieces' });
      }),
      level('g2.pack-fractions.word-match', 'Fraction Words', 'match-pairs', 2, (rng) => {
        const bank = shuffle(rng, [
          { left: '1/2', right: 'one half' },
          { left: '1/3', right: 'one third' },
          { left: '2/3', right: 'two thirds' },
          { left: '1/4', right: 'one fourth' },
          { left: '3/4', right: 'three fourths' },
        ]).slice(0, 4);
        return matchPairs('Match each fraction to its name.', bank);
      }),
      level('g2.pack-fractions.of-set', 'Half the Shells', 'number-pad', 2, (rng) => {
        const parts = pick(rng, [2, 3, 4]);
        const each = randInt(rng, 2, 6);
        const total = each * parts;
        const name = parts === 2 ? 'half' : parts === 3 ? 'third' : 'fourth';
        return numPad(`You have ${total} shells 🐚. One ${name} of them are pink. How many are pink?`, each, { hint: `Split ${total} into ${parts} equal groups` });
      }),
      level('g2.pack-fractions.not-shaded', 'Unshaded Part', 'number-pad', 3, (rng) => {
        const parts = pick(rng, [2, 3, 4]);
        const shaded = randInt(rng, 1, parts - 1);
        return numPad(`A waffle is split into ${parts} equal parts. ${shaded} ${shaded === 1 ? 'is' : 'are'} eaten. How many parts are left?`, parts - shaded, { hint: 'Start with all the parts' });
      }),
      level('g2.pack-fractions.frac-story', 'Pizza Story', 'multiple-choice', 3, (rng) => {
        const parts = pick(rng, [3, 4]);
        const eaten = randInt(rng, 1, parts - 1);
        const left = parts - eaten;
        const answer = `${left}/${parts}`;
        const wrongs = [...new Set([`${eaten}/${parts}`, `1/${parts}`, `${parts}/${eaten}`])].filter((wrong) => wrong !== answer).slice(0, 3);
        return mc(`A pizza has ${parts} equal slices. You eat ${eaten}. What fraction is left?`, answer, wrongs, rng, { hint: 'Count the slices that remain' });
      }),
      level('g2.pack-fractions.draw-fraction', 'Picture the Fraction', 'multiple-choice', 3, (rng) => {
        const parts = pick(rng, [2, 3, 4]);
        const shaded = randInt(rng, 1, parts - 1);
        const answer = `${'🔵'.repeat(shaded)}${'⚪'.repeat(parts - shaded)}`;
        const wrongs = [...new Set([
          `${'🔵'.repeat(parts - shaded)}${'⚪'.repeat(shaded)}`,
          '🔵'.repeat(parts),
          '⚪'.repeat(parts),
          `🔵${'⚪'.repeat(parts - 1)}`,
          `⚪${'🔵'.repeat(shaded)}`,
          `🔵⚪${'⚪'.repeat(parts - 2)}`,
        ])].filter((wrong) => wrong !== answer).slice(0, 3);
        return mc(`Which row shows ${shaded}/${parts} shaded blue?`, answer, wrongs, rng, { hint: 'Blue dots are the shaded parts' });
      }),
    ],
  },
  {
    id: 'g2.pack-patterns',
    title: 'Seaweed Stairs',
    emoji: '🌿',
    domain: 'patterns',
    levels: [
      level('g2.pack-patterns.grow', 'Growing Steps', 'number-pad', 1, (rng) => {
        const step = pick(rng, [2, 5, 10]);
        const start = randInt(rng, 1, 40);
        return numPad(`${Array.from({ length: 4 }, (_, i) => start + i * step).join(', ')}, ?`, start + 4 * step, { hint: `Count on by ${step}s` });
      }),
      level('g2.pack-patterns.shrink', 'Shrinking Steps', 'number-pad', 1, (rng) => {
        const step = pick(rng, [2, 5, 10]);
        const start = randInt(rng, 60, 120);
        return numPad(`${[0, 1, 2, 3].map((i) => start - i * step).join(', ')}, ?`, start - 4 * step, { hint: `Count back by ${step}s` });
      }),
      level('g2.pack-patterns.order', 'Pattern Line-Up', 'order-sequence', 1, (rng) => {
        const step = pick(rng, [3, 5, 10]);
        const start = randInt(rng, 2, 50);
        return orderSeq('Put the pattern in order.', [0, 1, 2, 3, 4].map((i) => String(start + i * step)));
      }),
      level('g2.pack-patterns.gap', 'Missing Step', 'number-pad', 2, (rng) => {
        const step = pick(rng, [2, 4, 5, 10]);
        const start = randInt(rng, 10, 60);
        return numPad(`${[0, 1, 2, 4].map((i) => start + i * step).join(', ')}, ?`, start + 3 * step, { hint: 'Find the rule, then fill the gap' });
      }),
      level('g2.pack-patterns.rule', 'Name the Rule', 'multiple-choice', 2, (rng) => {
        const step = pick(rng, [2, 3, 5, 10]);
        const start = randInt(rng, 3, 50);
        const sequence = [0, 1, 2, 3].map((i) => start + i * step).join(', ');
        const wrongs = shuffle(rng, [2, 3, 5, 10, 20].filter((value) => value !== step)).slice(0, 3).map((value) => `+${value}`);
        return mc(`What is the rule? ${sequence}`, `+${step}`, wrongs, rng);
      }),
      level('g2.pack-patterns.shrink-rule', 'Shrinking Rule', 'multiple-choice', 2, (rng) => {
        const step = pick(rng, [2, 5, 10]);
        const start = randInt(rng, 60, 150);
        const sequence = [0, 1, 2, 3].map((i) => start - i * step).join(', ');
        const wrongs = shuffle(rng, [`+${step}`, `−${step === 2 ? 5 : 2}`, `−${step * 2}`]).slice(0, 3);
        return mc(`What is the rule? ${sequence}`, `−${step}`, wrongs, rng);
      }),
      level('g2.pack-patterns.tf', 'Rule Check', 'true-false', 2, (rng) => {
        const step = pick(rng, [2, 5, 10]);
        const start = randInt(rng, 5, 60);
        const truth = rng() < 0.5;
        const last = truth ? start + 3 * step : start + 3 * step + pick(rng, [1, -1, step]);
        return trueFalse(`The rule is +${step}: ${start}, ${start + step}, ${start + 2 * step}, ${last}`, truth, { hint: 'Check each step' });
      }),
      level('g2.pack-patterns.hundreds', 'Hundred Steps', 'number-pad', 3, (rng) => {
        const up = rng() < 0.5;
        const start = up ? randInt(rng, 50, 400) : randInt(rng, 500, 900);
        const sequence = [0, 1, 2].map((i) => start + (up ? 1 : -1) * i * 100).join(', ');
        return numPad(`${sequence}, ?`, start + (up ? 300 : -300), { hint: 'Watch the hundreds digit' });
      }),
      level('g2.pack-patterns.skip-one', 'Skip a Step', 'number-pad', 3, (rng) => {
        const step = pick(rng, [2, 5, 10]);
        const start = randInt(rng, 4, 50);
        return numPad(`${[0, 1, 2, 4].map((i) => start + i * step).join(', ')}, ?`, start + 5 * step, { hint: 'One step is hiding' });
      }),
      level('g2.pack-patterns.find-start', 'Where It Began', 'number-pad', 3, (rng) => {
        const step = pick(rng, [5, 10]);
        const start = randInt(rng, 15, 80);
        return numPad(`The rule is +${step}. __, ${start}, ${start + step}, ${start + 2 * step}\nWhat is the first number?`, start - step, { hint: 'Go back one step' });
      }),
    ],
  },
  {
    id: 'g2.pack-word',
    title: 'Dolphin Detective',
    emoji: '🐬',
    domain: 'word-problems',
    levels: [
      level('g2.pack-word.join', 'Join Story', 'number-pad', 1, (rng) => {
        const thing = pick(rng, storyThings);
        const a = randInt(rng, 12, 60);
        const b = randInt(rng, 5, 99 - a);
        return numPad(`You have ${a} ${thing.plural} ${thing.emoji}. You find ${b} more. How many ${thing.plural} now?`, a + b);
      }),
      level('g2.pack-word.separate', 'Give-Away Story', 'number-pad', 1, (rng) => {
        const thing = pick(rng, storyThings);
        const a = randInt(rng, 20, 90);
        const b = randInt(rng, 3, a - 5);
        return numPad(`You had ${a} ${thing.plural} ${thing.emoji}. You gave away ${b}. How many are left?`, a - b);
      }),
      level('g2.pack-word.compare', 'Who Has More?', 'number-pad', 1, (rng) => {
        const thing = pick(rng, storyThings);
        const a = randInt(rng, 15, 80);
        const difference = randInt(rng, 3, 14);
        return numPad(`Sam has ${a} ${thing.plural}. Mia has ${a - difference} ${thing.plural}. How many more does Sam have?`, difference, { hint: 'Compare the two amounts' });
      }),
      level('g2.pack-word.two-step', 'Two-Step Trip', 'number-pad', 2, (rng) => {
        const thing = pick(rng, storyThings);
        const a = randInt(rng, 15, 50);
        const b = randInt(rng, 5, 40);
        const c = randInt(rng, 2, a + b - 5);
        return numPad(`A tank has ${a} ${thing.plural}. ${b} more arrive. Then ${c} swim away. How many ${thing.plural} now?`, a + b - c, { hint: 'Add first, then subtract' });
      }),
      level('g2.pack-word.two-step-sub', 'Add After Away', 'number-pad', 2, (rng) => {
        const thing = pick(rng, storyThings);
        const a = randInt(rng, 30, 80);
        const b = randInt(rng, 5, 25);
        const c = randInt(rng, 3, 99 - (a - b));
        return numPad(`There were ${a} ${thing.plural}. ${b} were taken away. Then ${c} more were found. How many now?`, a - b + c, { hint: 'Subtract first, then add' });
      }),
      level('g2.pack-word.money', 'Pocket Money', 'number-pad', 2, (rng) => {
        const have = randInt(rng, 40, 90);
        const spend = randInt(rng, 10, have - 10);
        const earn = randInt(rng, 5, 30);
        return numPad(`You have ${have}¢. You buy a sticker for ${spend}¢, then earn ${earn}¢. How many cents now?`, have - spend + earn);
      }),
      level('g2.pack-word.start-unknown', 'Missing Start', 'multiple-choice', 2, (rng) => {
        const thing = pick(rng, storyThings);
        const got = randInt(rng, 5, 25);
        const now = got + randInt(rng, 5, 50);
        const answer = now - got;
        return mcNum(rng, `You had some ${thing.plural}. You got ${got} more. Now you have ${now}. How many did you start with?`, answer, [now + got, now, got, answer - 1], {}, { min: 0 });
      }),
      level('g2.pack-word.choose-eq', 'Pick the Equation', 'multiple-choice', 2, (rng) => {
        const a = randInt(rng, 20, 80);
        const b = randInt(rng, 3, 15);
        const c = randInt(rng, 3, 15);
        const answer = `${a} − ${b} + ${c}`;
        const wrongs = [`${a} + ${b} + ${c}`, `${a} − ${b} − ${c}`, `${a} + ${b} − ${c}`];
        return mc(`${a} fish are in a tank. ${b} swim away. ${c} swim over. Which equation finds how many fish now?`, answer, wrongs, rng);
      }),
      level('g2.pack-word.three-add', 'Three Baskets', 'number-pad', 3, (rng) => {
        const thing = pick(rng, storyThings);
        const a = randInt(rng, 8, 40);
        const b = randInt(rng, 8, 40);
        const c = randInt(rng, 8, 99 - a - b);
        return numPad(`Three baskets hold ${a}, ${b}, and ${c} ${thing.plural}. How many in all?`, a + b + c, { hint: 'Add all three amounts' });
      }),
      level('g2.pack-word.both-ways', 'Total Together', 'number-pad', 3, (rng) => {
        const thing = pick(rng, storyThings);
        const a = randInt(rng, 10, 40);
        const more = randInt(rng, 3, 20);
        return numPad(`Kai has ${a} ${thing.plural}. Liv has ${more} more than Kai. How many ${thing.plural} do they have together?`, a + a + more, { hint: "Find Liv's amount first" });
      }),
      level('g2.pack-word.length', 'Length Story', 'number-pad', 3, (rng) => {
        const a = randInt(rng, 20, 60);
        const b = randInt(rng, 10, a - 5);
        const c = randInt(rng, 5, 20);
        return numPad(`A rope is ${a} cm long. You cut off ${b} cm, then tie on ${c} cm. How long is it now?`, a - b + c, { hint: 'Subtract, then add' });
      }),
    ],
  },
  {
    id: 'g2.pack-missing',
    title: 'Mystery Bubbles',
    emoji: '🫧',
    domain: 'algebra',
    levels: [
      level('g2.pack-missing.addend', 'Missing Addend', 'number-pad', 1, (rng) => {
        const a = randInt(rng, 3, 50);
        const answer = randInt(rng, 2, 40);
        return numPad(`${a} + ? = ${a + answer}`, answer, { visual: { text: `${a} + ? = ${a + answer}` }, hint: 'Count up from the number you know' });
      }),
      level('g2.pack-missing.start-add', 'Hidden Start', 'number-pad', 1, (rng) => {
        const answer = randInt(rng, 5, 60);
        const b = randInt(rng, 3, 30);
        return numPad(`? + ${b} = ${answer + b}`, answer, { hint: 'Subtract to find the start' });
      }),
      level('g2.pack-missing.sub', 'Missing Piece', 'number-pad', 1, (rng) => {
        const a = randInt(rng, 15, 90);
        const answer = randInt(rng, 3, a - 5);
        return numPad(`${a} − ? = ${a - answer}`, answer, { hint: 'What was taken away?' });
      }),
      level('g2.pack-missing.minuend', 'Missing First', 'number-pad', 2, (rng) => {
        const b = randInt(rng, 4, 40);
        const c = randInt(rng, 5, 50);
        return numPad(`? − ${b} = ${c}`, b + c, { hint: 'Add the parts to find the start' });
      }),
      level('g2.pack-missing.balance', 'Balance the Scale', 'multiple-choice', 2, (rng) => {
        const b = randInt(rng, 2, 9);
        const c = randInt(rng, 2, 9);
        const a = randInt(rng, 2, b + c - 1);
        const answer = b + c - a;
        return mcNum(rng, `${a} + ? = ${b} + ${c}`, answer, [a + b, b + c, a, answer + 1], { hint: 'Find the total on the right first' }, { min: 0 });
      }),
      level('g2.pack-missing.tf', 'Equation Check', 'true-false', 2, (rng) => {
        const a = randInt(rng, 5, 15);
        const b = randInt(rng, 3, 12);
        const truth = rng() < 0.5;
        const rhs = truth ? a + b : a + b + pick(rng, [1, -1, 2]);
        const shownA = rhs + randInt(rng, 3, 15);
        const shownB = shownA - rhs;
        return trueFalse(`${a} + ${b} = ${shownA} − ${shownB}`, truth, { hint: 'Work out both sides' });
      }),
      level('g2.pack-missing.three', 'Three Addends', 'number-pad', 2, (rng) => {
        const a = randInt(rng, 4, 20);
        const b = randInt(rng, 4, 20);
        const answer = randInt(rng, 2, 15);
        return numPad(`${a} + ${b} + ? = ${a + b + answer}`, answer, { hint: 'Add the two you know first' });
      }),
      level('g2.pack-missing.same-sum', 'Same Sum', 'multiple-choice', 3, (rng) => {
        const a = randInt(rng, 3, 12);
        const b = randInt(rng, 3, 12);
        return mcNum(rng, `${a} + ${b} = ? + ${a}`, b, [a, b - 1, b + 1, a + b], { hint: 'Both sides must match' }, { min: 1 });
      }),
      level('g2.pack-missing.big', 'Big Missing Addend', 'number-pad', 3, (rng) => {
        const a = randInt(rng, 110, 600);
        const answer = randInt(rng, 50, 300);
        return numPad(`${a} + ? = ${a + answer}`, answer, { hint: 'Subtract the known part' });
      }),
      level('g2.pack-missing.match', 'Bubble Match', 'match-pairs', 3, (rng) => {
        const answers = randInts(rng, 3, 20, 4);
        const pairs = answers.map((ans) => {
          const k = randInt(rng, 2, 15);
          return rng() < 0.5
            ? { left: `${ans + k} − ? = ${k}`, right: String(ans) }
            : { left: `? + ${k} = ${ans + k}`, right: String(ans) };
        });
        return { ...matchPairs('Match each equation to its missing number.', pairs), hint: 'Solve for ? in each card' };
      }),
    ],
  },
  {
    id: 'g2.pack-decimals',
    title: 'Pearl Point',
    emoji: '⚪',
    domain: 'decimals',
    levels: [
      level('g2.pack-decimals.read-money', 'Dollar Dots', 'multiple-choice', 1, (rng) => {
        const dollars = randInt(rng, 1, 5);
        const cents = pick(rng, [5, 10, 15, 20, 25, 30, 35, 40, 45, 50]);
        const answer = formatDollars(dollars * 100 + cents);
        const wrongs = [...new Set([
          formatDollars(dollars * 100 + (cents === 5 ? 15 : 5)),
          formatDollars(cents * 10 + dollars),
          formatDollars((dollars + 1) * 100 + cents),
        ])].filter((wrong) => wrong !== answer).slice(0, 3);
        return mc(`Which is ${dollars} ${dollars === 1 ? 'dollar' : 'dollars'} and ${cents} cents?`, answer, wrongs, rng);
      }),
      level('g2.pack-decimals.dime-tenth', 'Dime Is a Tenth', 'multiple-choice', 1, (rng) => {
        const dimes = randInt(rng, 1, 9);
        const answer = formatDollars(dimes * 10);
        const wrongs = [...new Set([formatDollars(dimes), formatDollars(dimes * 100), formatDollars(dimes * 10 + 100)])].filter((wrong) => wrong !== answer);
        return mc(`${coinNoun(dimes, 'dime', 'dimes')} make which amount?`, answer, wrongs, rng, { hint: 'One dime is $0.10' });
      }),
      level('g2.pack-decimals.half', 'Half with a Dot', 'multiple-choice', 1, (rng) => {
        const n = randInt(rng, 1, 9);
        const answer = `${n}.5`;
        return mc(`${n} and a half meters is written as ___ m.`, answer, [`${n}.2`, `${n}.1`, `${n + 1}.5`], rng, { hint: 'A half is written .5' });
      }),
      level('g2.pack-decimals.build', 'Build the Amount', 'multiple-choice', 2, (rng) => {
        const dollars = randInt(rng, 1, 4);
        const dimes = randInt(rng, 1, 9);
        const pennies = randInt(rng, 1, 9);
        const answer = formatDollars(dollars * 100 + dimes * 10 + pennies);
        const wrongs = [...new Set([
          formatDollars(dollars * 100 + pennies * 10 + dimes),
          formatDollars(dimes * 100 + dollars * 10 + pennies),
          formatDollars(dollars * 100 + dimes * 10 + pennies + 10),
          formatDollars(pennies * 100 + dimes * 10 + dollars),
          formatDollars(dollars * 100 + dimes * 10 + pennies + 100),
        ])].filter((wrong) => wrong !== answer).slice(0, 3);
        return mc(`${coinNoun(dollars, '$1 bill', '$1 bills')}, ${coinNoun(dimes, 'dime', 'dimes')}, ${coinNoun(pennies, 'penny', 'pennies')} = ?`, answer, wrongs, rng, { hint: 'Dimes fill the tenths spot' });
      }),
      level('g2.pack-decimals.compare', 'Money Compare', 'multiple-choice', 2, (rng) => {
        const dollars = randInt(rng, 1, 5);
        const centsA = pick(rng, [5, 10, 25, 50]);
        const centsB = pick(rng, [1, 15, 20, 75].filter((value) => value !== centsA));
        const a = dollars * 100 + centsA;
        const b = dollars * 100 + centsB;
        return mc('Which amount is more?', formatDollars(Math.max(a, b)), [formatDollars(Math.min(a, b)), 'They are equal'], rng, { hint: 'Same dollars — compare the cents' });
      }),
      level('g2.pack-decimals.order', 'Price Line-Up', 'order-sequence', 2, (rng) => {
        const amounts = randInts(rng, 25, 495, 4).map((value) => formatDollars(value));
        return orderSeq('Order the prices from least to most.', amounts);
      }),
      level('g2.pack-decimals.tenths-line', 'Tenths on the Line', 'order-sequence', 3, (rng) => {
        const start = randInt(rng, 1, 5);
        return { ...orderSeq('Put the decimals in order from least to greatest.', [0, 1, 2, 3, 4].map((i) => `${start}.${i}`)), hint: 'The digit after the dot counts tenths' };
      }),
      level('g2.pack-decimals.round-dollar', 'Nearest Dollar', 'multiple-choice', 3, (rng) => {
        const dollars = randInt(rng, 1, 5);
        const cents = randInt(rng, 1, 99);
        const answer = cents >= 50 ? `$${dollars + 1}.00` : `$${dollars}.00`;
        const wrongs = [...new Set([cents >= 50 ? `$${dollars}.00` : `$${dollars + 1}.00`, formatDollars(dollars * 100 + cents), `$${dollars + 2}.00`])].filter((wrong) => wrong !== answer);
        return mc(`Round ${formatDollars(dollars * 100 + cents)} to the nearest dollar.`, answer, wrongs, rng, { hint: '50¢ or more rounds up' });
      }),
    ],
  },
];
