import { pick, randInt, randInts, shuffle } from '../../core/rng';
import type { UnitDef } from '../../core/types';
import { level, matchPairs, numPad, orderSeq, trueFalse } from '../helpers';
import { board, countTap, fmt, labelMc, name, numMc } from './util';
import { CREW_DEEDS, emojiBoard, FRUITS, GROUP_SPOTS, moneyLabel, SEA_THINGS, TREATS } from './g3-pack-data';

/* Grade 3 pack — number-side units: counting, multiplication, division,
   place value, decimals, patterns and algebra. */

function skipCountShip(): UnitDef {
  return {
    id: 'g3.pack-counting',
    title: 'Skip-Count Ship',
    emoji: '🚢',
    domain: 'counting',
    levels: [
      level('g3.pack-counting.tens', 'Sail by Tens', 'order-sequence', 1, (rng) => {
        const start = randInt(rng, 1, 80) * 10;
        return orderSeq(
          `The ship counts by 10s starting at ${start}. Tap the next stops in order!`,
          Array.from({ length: 5 }, (_, index) => String(start + 10 * (index + 1))),
        );
      }),
      level('g3.pack-counting.fives', 'Hop by Fives', 'order-sequence', 1, (rng) => {
        const start = randInt(rng, 1, 60) * 5;
        return orderSeq(
          `Count by 5s starting at ${start}. Put the next numbers in order.`,
          Array.from({ length: 5 }, (_, index) => String(start + 5 * (index + 1))),
        );
      }),
      level('g3.pack-counting.crew', 'Count the Crew', 'count-tap', 1, (rng) => {
        const item = pick(rng, SEA_THINGS);
        const count = randInt(rng, 12, 28);
        return countTap(`Count all the ${item.plural} on deck!`, count, [count - 1, count + 1, count + 2, count - 2], rng, {
          visual: board(emojiBoard(item.emoji, count)),
        });
      }),
      level('g3.pack-counting.hundreds', 'Hundred Hop', 'multiple-choice', 1, (rng) => {
        const start = randInt(rng, 1, 7) * 100;
        const answer = start + 200;
        return numMc(`The logbook counts by 100s: ${fmt(start)}, ${fmt(start + 100)}, ___`, answer, [answer + 100, answer - 100, answer + 10], rng, {
          hint: 'Count by hundreds: 200, 300, 400…',
        });
      }),
      level('g3.pack-counting.next-isle', 'Next Isle Number', 'number-pad', 2, (rng) => {
        const start = randInt(rng, 104, 995);
        return numPad(`The map marks islands ${fmt(start)}, ${fmt(start + 1)}, ${fmt(start + 2)}. What is the next island number?`, start + 3, {
          visual: { text: `${fmt(start)} → ${fmt(start + 1)} → ${fmt(start + 2)} → ?` },
          hint: 'Count on by ones.',
        });
      }),
      level('g3.pack-counting.skip-gap', 'Missing Plank', 'multiple-choice', 2, (rng) => {
        const step = pick(rng, [2, 5, 10] as const);
        const start = randInt(rng, 2, 30) * step;
        const gapIndex = randInt(rng, 1, 3);
        const missing = start + step * gapIndex;
        const display = Array.from({ length: 5 }, (_, index) => (index === gapIndex ? '⭐' : String(start + step * index))).join(', ');
        return numMc(`The ship counts by ${step}s. What number is under the ⭐?\n${display}`, missing, [missing + step, missing - step, missing + 1], rng, {
          hint: `Keep counting by ${step}s.`,
        });
      }),
      level('g3.pack-counting.back-tide', 'Backward Tide', 'order-sequence', 2, (rng) => {
        const start = randInt(rng, 20, 95) * 10;
        return orderSeq(
          `The tide rolls back by 10s from ${fmt(start)}. Count backward in order!`,
          Array.from({ length: 5 }, (_, index) => String(start - 10 * (index + 1))),
        );
      }),
      level('g3.pack-counting.group-count', 'Count the Groups', 'multiple-choice', 2, (rng) => {
        const item = pick(rng, TREATS);
        const spot = pick(rng, GROUP_SPOTS);
        const groups = randInt(rng, 3, 5);
        const size = randInt(rng, 3, 6);
        const answer = groups * size;
        return numMc(
          `${groups} ${spot} hold ${size} ${item.plural} each. Count by ${size}s to find the total!`,
          answer,
          [groups + size, answer + size, answer - size],
          rng,
          { visual: { emoji: item.emoji, groups: Array.from({ length: groups }, () => size) }, hint: `${size}, ${size * 2}, ${size * 3}… keep going!` },
        );
      }),
      level('g3.pack-counting.leap-tide', 'Leap by 25s', 'order-sequence', 3, (rng) => {
        const step = pick(rng, [25, 50] as const);
        const start = randInt(rng, 1, 8) * step;
        return orderSeq(
          `The giant leaps by ${step}s from ${fmt(start)}. Put the next landings in order.`,
          Array.from({ length: 5 }, (_, index) => String(start + step * (index + 1))),
        );
      }),
      level('g3.pack-counting.count-on-big', 'Count On, Captain', 'number-pad', 3, (rng) => {
        const start = randInt(rng, 55, 95) * 10 + randInt(rng, 1, 9);
        const hops = randInt(rng, 3, 5);
        return numPad(`Start at ${fmt(start)} and count on by 10s ${hops} times. Where do you land?`, start + 10 * hops, {
          hint: `Each hop adds 10: ${fmt(start + 10)}, ${fmt(start + 20)}…`,
        });
      }),
    ],
  };
}

const TIMES_STORIES = [
  { groups: 'rowboats', item: 'pirates', emoji: '🏴‍☠️' },
  { groups: 'parrot perches', item: 'parrots', emoji: '🦜' },
  { groups: 'treasure maps', item: 'X marks', emoji: '✖️' },
  { groups: 'sea bags', item: 'shells', emoji: '🐚' },
  { groups: 'island stalls', item: 'coconuts', emoji: '🥥' },
] as const;

function timesTableTreasure(): UnitDef {
  return {
    id: 'g3.pack-times',
    title: 'Times-Table Treasure',
    emoji: '⚔️',
    domain: 'operations',
    levels: [
      level('g3.pack-times.facts-easy', 'First Facts', 'multiple-choice', 1, (rng) => {
        const a = randInt(rng, 2, 5);
        const b = randInt(rng, 2, 5);
        const answer = a * b;
        return numMc(`Quick, matey! What is ${a} × ${b}?`, answer, [a * (b + 1), a * (b - 1), (a + 1) * b, a + b], rng, {
          visual: { text: `${a} × ${b} = ?` },
        });
      }),
      level('g3.pack-times.flag-array', 'Flag Array', 'count-tap', 1, (rng) => {
        const rows = randInt(rng, 2, 4);
        const cols = randInt(rng, 3, 7);
        const emoji = pick(rng, ['🚩', '🏴', '🌺', '🐡'] as const);
        const answer = rows * cols;
        return countTap(`${rows} rows of ${cols} flags. How many flags in all?`, answer, [rows + cols, answer + rows, answer - 1], rng, {
          visual: { emoji, groups: Array.from({ length: rows }, () => cols) },
        });
      }),
      level('g3.pack-times.boat-groups', 'Boat Groups', 'multiple-choice', 1, (rng) => {
        const story = pick(rng, TIMES_STORIES);
        const groups = randInt(rng, 2, 6);
        const size = randInt(rng, 2, 6);
        const answer = groups * size;
        return numMc(`${groups} ${story.groups} carry ${size} ${story.item} each. How many ${story.item} in all?`, answer, [
          groups + size,
          answer + groups,
          answer - size,
        ], rng, { visual: { emoji: story.emoji, groups: Array.from({ length: groups }, () => size) } });
      }),
      level('g3.pack-times.ten-times', 'Ten Times', 'number-pad', 1, (rng) => {
        const n = randInt(rng, 3, 10);
        const tensFirst = rng() < 0.5;
        return numPad(`What is ${tensFirst ? `10 × ${n}` : `${n} × 10`}?`, n * 10, {
          hint: `${n} groups of 10 is ${n} tens.`,
        });
      }),
      level('g3.pack-times.facts-pro', 'Fact Master', 'number-pad', 2, (rng) => {
        const a = randInt(rng, 4, 10);
        const b = randInt(rng, 4, 10);
        return numPad(`What is ${a} × ${b}?`, a * b, {
          visual: { text: `${a} × ${b} = ?` },
          hint: a === b ? `Doubles help: ${a} × ${a} is a square number.` : `Try ${a} × ${Math.floor(b / 2)} doubled, or split ${b}.`,
        });
      }),
      level('g3.pack-times.swap', 'Swap the Factors', 'multiple-choice', 2, (rng) => {
        const a = randInt(rng, 3, 10);
        const b = randInt(rng, 2, 10);
        return numMc(`${a} × ${b} = ${b} × ___`, a, [b, a + 1, a - 1, a * b], rng, {
          visual: { text: `${a} × ${b} = ${b} × ?` },
          hint: 'Factors can swap places and the product stays the same.',
        });
      }),
      level('g3.pack-times.big-tens', 'Tens Armada', 'number-pad', 2, (rng) => {
        const a = randInt(rng, 2, 9);
        const tens = pick(rng, [2, 3, 4, 5, 6, 7, 8] as const) * 10;
        const swap = rng() < 0.5;
        const text = swap ? `${tens} × ${a}` : `${a} × ${tens}`;
        return numPad(`What is ${text}?`, a * tens, {
          visual: { text: `${text} = ?` },
          hint: `${a} × ${tens / 10} = ${a * (tens / 10)}, so ${a} × ${tens / 10} tens = ${a * (tens / 10)} tens.`,
        });
      }),
      level('g3.pack-times.split-fact', 'Split the Fact', 'number-pad', 2, (rng) => {
        const a = randInt(rng, 3, 9);
        const b = randInt(rng, 5, 9);
        const part = randInt(rng, 2, b - 2);
        return numPad(`${a} × ${b} = ${a} × ${part} + ${a} × ___`, b - part, {
          visual: { text: `${a} × ${b} = ${a} × ${part} + ${a} × ?` },
          hint: `Break ${b} into ${part} + ?`,
        });
      }),
      level('g3.pack-times.nine-sail', 'Nines Trick', 'number-pad', 2, (rng) => {
        const n = randInt(rng, 3, 9);
        return numPad(`Use the nines trick: 9 × ${n} = 10 × ${n} − ${n} = ?`, 9 * n, {
          hint: `10 × ${n} = ${10 * n}, then take away ${n}.`,
        });
      }),
      level('g3.pack-times.three-bags', 'Three Bags Deep', 'number-pad', 3, (rng) => {
        const a = randInt(rng, 2, 4);
        const b = randInt(rng, 2, 4);
        const c = randInt(rng, 2, 5);
        return numPad(`${a} chests have ${b} bags each, and each bag has ${c} gems. How many gems in all?`, a * b * c, {
          visual: { text: `${a} × ${b} × ${c} = ?` },
          hint: `First ${a} × ${b} = ${a * b} bags, then × ${c}.`,
        });
      }),
      level('g3.pack-times.prop-check', 'Property Check', 'true-false', 3, (rng) => {
        const a = randInt(rng, 2, 9);
        const b = randInt(rng, 3, 9);
        const part = randInt(rng, 1, b - 1);
        const c = randInt(rng, 2, 5);
        const forms: { left: [string, number]; right: [string, number] }[] = [
          { left: [`${a} × ${b}`, a * b], right: [`${b} × ${a}`, b * a] },
          { left: [`${a} × ${b}`, a * b], right: [`${a} × ${part} + ${a} × ${b - part}`, a * part + a * (b - part)] },
          { left: [`${a} × ${b}`, a * b], right: [`${a} + ${b}`, a + b] },
          { left: [`(${a} × ${b}) × ${c}`, a * b * c], right: [`${a} × (${b} × ${c})`, a * b * c] },
          { left: [`${a} × ${b}`, a * b], right: [`${a} × ${b - part}`, a * (b - part)] },
          { left: [`${a} × ${b}`, a * b], right: [`${a} × ${part} + ${b - part}`, a * part + (b - part)] },
        ];
        const { left, right } = pick(rng, forms);
        return trueFalse(`True or false? ${left[0]} = ${right[0]}`, left[1] === right[1], {
          visual: { text: `${left[0]} = ${right[0]}` },
          hint: 'You can swap factors or break one factor into parts.',
        });
      }),
    ],
  };
}

const SHARE_TALES = [
  (total: number, each: number) => `${total} pearls are packed ${each} to a pouch.`,
  (total: number, each: number) => `${total} mangoes go ${each} to a basket.`,
  (total: number, each: number) => `${total} arrows are bundled ${each} to a quiver.`,
  (total: number, each: number) => `${total} shells are strung ${each} to a necklace.`,
] as const;

function divisionDocksPack(): UnitDef {
  return {
    id: 'g3.pack-divide',
    title: 'Division Raft',
    emoji: '🛶',
    domain: 'operations',
    levels: [
      level('g3.pack-divide.share-fruit', 'Share the Fruit', 'multiple-choice', 1, (rng) => {
        const item = pick(rng, FRUITS);
        const people = randInt(rng, 2, 6);
        const each = randInt(rng, 2, 8);
        const total = people * each;
        return numMc(`${total} ${item.plural} are shared equally by ${people} pirates. How many ${item.plural} does each pirate get?`, each, [
          people,
          total - people,
          each + 1,
          each - 1,
        ], rng, { visual: { text: `${total} ÷ ${people}` }, hint: 'Sharing equally means divide.' });
      }),
      level('g3.pack-divide.bucket-groups', 'How Many Buckets?', 'multiple-choice', 1, (rng) => {
        const story = pick(rng, SHARE_TALES);
        const groups = randInt(rng, 2, 8);
        const each = randInt(rng, 2, 9);
        const total = groups * each;
        return numMc(`${story(total, each)} How many groups can be made?`, groups, [each, total - each, groups + 1, groups - 1], rng, {
          visual: { text: `${total} ÷ ${each}` },
          hint: `Count by ${each}s up to ${total}.`,
        });
      }),
      level('g3.pack-divide.facts-easy', 'Dockside Division', 'number-pad', 1, (rng) => {
        const divisor = randInt(rng, 2, 5);
        const quotient = randInt(rng, 2, 9);
        return numPad(`What is ${divisor * quotient} ÷ ${divisor}?`, quotient, {
          visual: { text: `${divisor * quotient} ÷ ${divisor} = ?` },
        });
      }),
      level('g3.pack-divide.family-help', 'Fact Helper', 'multiple-choice', 1, (rng) => {
        const a = randInt(rng, 2, 9);
        const b = randInt(rng, 2, 9);
        const total = a * b;
        return labelMc(
          `Which multiplication fact helps you find ${total} ÷ ${a}?`,
          `${a} × ${b} = ${total}`,
          [`${a} × ${b + 1} = ${a * (b + 1)}`, `${a + 1} × ${b} = ${(a + 1) * b}`, `${a} + ${b} = ${a + b}`],
          rng,
          { hint: 'Division undoes multiplication.' },
        );
      }),
      level('g3.pack-divide.facts', 'Wave Divider', 'number-pad', 2, (rng) => {
        const divisor = randInt(rng, 3, 10);
        const quotient = randInt(rng, 3, 10);
        return numPad(`What is ${divisor * quotient} ÷ ${divisor}?`, quotient, {
          visual: { text: `${divisor * quotient} ÷ ${divisor} = ?` },
          hint: `Think: ${divisor} × ? = ${divisor * quotient}`,
        });
      }),
      level('g3.pack-divide.missing-divisor', 'Missing Divisor', 'number-pad', 2, (rng) => {
        const divisor = randInt(rng, 2, 10);
        const quotient = randInt(rng, 2, 10);
        return numPad(`Find the missing number: ${divisor * quotient} ÷ ⭐ = ${quotient}`, divisor, {
          visual: { text: `${divisor * quotient} ÷ ⭐ = ${quotient}` },
          hint: `Ask: ${quotient} × what = ${divisor * quotient}?`,
        });
      }),
      level('g3.pack-divide.match-facts', 'Fact Family Raft', 'match-pairs', 2, (rng) => {
        const used = new Set<number>();
        const pairs: { left: string; right: string }[] = [];
        while (pairs.length < 4) {
          const a = randInt(rng, 2, 9);
          const b = randInt(rng, 2, 9);
          const product = a * b;
          const left = `${product} ÷ ${a}`;
          const right = `${a} × ${b} = ${product}`;
          if (used.has(product) || pairs.some((pair) => pair.right === right)) continue;
          used.add(product);
          pairs.push({ left, right });
        }
        return matchPairs('Match each division to the multiplication fact that solves it.', pairs);
      }),
      level('g3.pack-divide.check-divide', 'Check the Division', 'true-false', 2, (rng) => {
        const divisor = randInt(rng, 2, 10);
        const quotient = randInt(rng, 2, 10);
        const total = divisor * quotient;
        const shown = rng() < 0.5 ? quotient : quotient + pick(rng, [-1, 1, 2] as const);
        return trueFalse(`A pirate says ${total} ÷ ${divisor} = ${shown}. Is that right?`, shown === quotient, {
          visual: { text: `${total} ÷ ${divisor} = ${shown}?` },
          hint: `Check: ${divisor} × ${shown} should equal ${total}.`,
        });
      }),
      level('g3.pack-divide.tens-div', 'Divide the Tens', 'number-pad', 2, (rng) => {
        const quotient = randInt(rng, 2, 9);
        const divisor = pick(rng, [2, 3, 4, 5, 6, 8, 9] as const);
        const total = divisor * quotient * 10;
        return numPad(`What is ${total} ÷ ${divisor}?`, quotient * 10, {
          visual: { text: `${total} ÷ ${divisor} = ?` },
          hint: `${divisor * quotient} ÷ ${divisor} = ${quotient}, so ${total} ÷ ${divisor} = ${quotient} tens.`,
        });
      }),
      level('g3.pack-divide.pick-equation', 'Pick the Equation', 'multiple-choice', 3, (rng) => {
        const groups = randInt(rng, 2, 9);
        const each = randInt(rng, 2, 9);
        const total = groups * each;
        return labelMc(
          `${name(rng)} splits ${total} stickers into ${groups} equal piles. Which equation shows the split?`,
          `${total} ÷ ${groups} = ${each}`,
          [`${total} × ${groups} = ${total * groups}`, `${total} − ${groups} = ${total - groups}`, `${total} + ${groups} = ${total + groups}`],
          rng,
          { hint: 'Equal piles means divide.' },
        );
      }),
      level('g3.pack-divide.rope-pieces', 'Rope Pieces', 'number-pad', 3, (rng) => {
        const pieces = randInt(rng, 4, 10);
        const each = randInt(rng, 3, 9);
        const take = randInt(rng, 2, 4);
        const total = pieces * each;
        return numPad(`A ${total}-meter rope is cut into ${pieces} equal pieces. How many meters are ${take} pieces together?`, each * take, {
          visual: { text: `${total} ÷ ${pieces} = ${each}; ${each} × ${take} = ?` },
          hint: `Find one piece first: ${total} ÷ ${pieces}.`,
        });
      }),
    ],
  };
}

function roundUpReef(): UnitDef {
  return {
    id: 'g3.pack-place',
    title: 'Round-Up Reef',
    emoji: '🗺️',
    domain: 'place-value',
    levels: [
      level('g3.pack-place.digit-dig', 'Digit Dig', 'multiple-choice', 1, (rng) => {
        const digits = randInts(rng, 1, 9, 3);
        const digit = digits[0];
        const place = pick(rng, [10, 100] as const);
        const value = place === 100 ? digit * 100 + digits[1] * 10 + digits[2] : digits[1] * 100 + digit * 10 + digits[2];
        const answer = digit * place;
        return numMc(`In the number ${fmt(value)}, what is the value of the digit ${digit}?`, answer, [digit, answer * 10, answer / 10], rng, {
          hint: place === 100 ? 'Hundreds are worth 100 each.' : 'Tens are worth 10 each.',
        });
      }),
      level('g3.pack-place.expanded', 'Expand the Sail', 'multiple-choice', 1, (rng) => {
        const h = randInt(rng, 1, 9);
        const t = randInt(rng, 0, 9);
        const o = randInt(rng, 1, 9);
        const answer = h * 100 + t * 10 + o;
        const parts = t === 0 ? `${h * 100} + ${o}` : `${h * 100} + ${t * 10} + ${o}`;
        return numMc(`What number is ${parts}?`, answer, [answer + 100, answer - 10, h * 100 + t + o * 10, h + t * 10 + o * 100], rng, {
          visual: { text: `${parts} = ?` },
          hint: 'Add hundreds, tens, then ones.',
        });
      }),
      level('g3.pack-place.compare', 'Bigger Bounty', 'multiple-choice', 1, (rng) => {
        const a = randInt(rng, 110, 989);
        const b = a + pick(rng, [-100, -10, -1, 1, 10, 100] as const);
        const [first, second] = shuffle(rng, [a, b]);
        const greater = Math.max(first, second);
        return numMc(`Two ships hold ${fmt(first)} and ${fmt(second)} coins. Which number is greater?`, greater, [Math.min(first, second), greater + 100], rng, {
          hint: 'Compare the hundreds first.',
        });
      }),
      level('g3.pack-place.round-dinghy', 'Round the Dinghy', 'multiple-choice', 1, (rng) => {
        const value = randInt(rng, 12, 99);
        const down = Math.floor(value / 10) * 10;
        const answer = value % 10 >= 5 ? down + 10 : down;
        return numMc(
          `${name(rng)} spots ${value} dolphins. Round ${value} to the nearest 10.`,
          answer,
          [answer === down ? down + 10 : down, answer + 10, answer - 10, Math.round(value / 100) * 100],
          rng,
          { hint: 'Ones digit 5 or more? Round up.' },
        );
      }),
      level('g3.pack-place.round-galleon', 'Round the Galleon', 'multiple-choice', 2, (rng) => {
        const value = randInt(rng, 105, 995);
        const down = Math.floor(value / 100) * 100;
        const answer = value % 100 >= 50 ? down + 100 : down;
        return numMc(
          `A galleon sails ${value} miles. Round ${value} to the nearest 100.`,
          answer,
          [answer === down ? down + 100 : down, answer + 100, Math.round(value / 10) * 10, answer - 100],
          rng,
          { hint: 'Tens digit 5 or more? Round up.' },
        );
      }),
      level('g3.pack-place.add-fleet', 'Fleet Addition', 'number-pad', 2, (rng) => {
        const a = randInt(rng, 120, 650);
        const b = randInt(rng, 100, 980 - a);
        return numPad(`${name(rng)} ${pick(rng, CREW_DEEDS)} ${a} shells and ${b} pebbles. How many in all?`, a + b, {
          visual: { text: `${a} + ${b} = ?` },
          hint: 'Add ones, then tens, then hundreds.',
        });
      }),
      level('g3.pack-place.sub-fleet', 'Fleet Subtraction', 'number-pad', 2, (rng) => {
        const a = randInt(rng, 250, 999);
        const b = randInt(rng, 110, a - 100);
        return numPad(`The crew had ${fmt(a)} coins and spent ${b}. How many coins are left?`, a - b, {
          visual: { text: `${a} − ${b} = ?` },
          hint: 'Regroup a ten or a hundred when needed.',
        });
      }),
      level('g3.pack-place.order-isles', 'Order the Isles', 'order-sequence', 2, (rng) => {
        const numbers = randInts(rng, 105, 995, 4);
        return orderSeq('Four islands show their shell counts. Tap from smallest to biggest!', numbers.map(String));
      }),
      level('g3.pack-place.round-check', 'Roundabout Check', 'true-false', 2, (rng) => {
        const value = randInt(rng, 105, 995);
        const correct = (Math.floor(value / 100) + (value % 100 >= 50 ? 1 : 0)) * 100;
        const shown = rng() < 0.5 ? correct : correct + pick(rng, [-100, 100] as const);
        return trueFalse(`Does ${value} round to ${shown} (nearest 100)?`, shown === correct, {
          hint: 'Look at the tens digit.',
        });
      }),
      level('g3.pack-place.estimate-sum', 'Estimate the Haul', 'multiple-choice', 3, (rng) => {
        const a = randInt(rng, 120, 780);
        const b = randInt(rng, 110, 880);
        const round = (v: number) => Math.round(v / 100) * 100;
        const answer = round(a) + round(b);
        return numMc(`Estimate ${a} + ${b} by rounding each to the nearest 100.`, answer, [answer + 100, answer - 100, a + b], rng, {
          visual: { text: `${a} + ${b} ≈ ?` },
          hint: `${a} → ${round(a)} and ${b} → ${round(b)}.`,
        });
      }),
      level('g3.pack-place.make-thousand', 'Make a Thousand', 'number-pad', 3, (rng) => {
        const given = randInt(rng, 10, 99) * 10;
        return numPad(`The vault needs 1,000 coins. ${given} are inside. How many more are needed?`, 1000 - given, {
          visual: { text: `1,000 − ${given} = ?` },
          hint: 'Count up by tens to 1,000.',
        });
      }),
      level('g3.pack-place.jump-place', 'Jump a Place', 'multiple-choice', 3, (rng) => {
        const value = randInt(rng, 105, 890);
        const jump = pick(rng, [10, 100] as const);
        const dir = pick(rng, ['more', 'less'] as const);
        const answer = dir === 'more' ? value + jump : value - jump;
        return numMc(`What is ${jump} ${dir} than ${fmt(value)}?`, answer, [value + (dir === 'more' ? 1 : -1), value + (dir === 'more' ? 10 : -10) * (jump === 10 ? 10 : 1), answer + jump], rng, {
          hint: `Only the ${jump === 10 ? 'tens' : 'hundreds'} digit changes.`,
        });
      }),
    ],
  };
}

const COIN_PAIRS: Record<string, string> = {
  '1/10': '0.1',
  '2/10': '0.2',
  '3/10': '0.3',
  '5/10': '0.5',
  '7/10': '0.7',
  '9/10': '0.9',
};

function dimeDecimals(): UnitDef {
  return {
    id: 'g3.pack-decimals',
    title: 'Dime Decimals',
    emoji: '🪙',
    domain: 'decimals',
    levels: [
      level('g3.pack-decimals.dime-tenths', 'Dimes Are Tenths', 'multiple-choice', 1, (rng) => {
        const n = randInt(rng, 2, 9);
        return labelMc(`Each dime is 1/10 of a dollar. ${n} dimes is what part of a dollar?`, `0.${n}`, [`${n}.0`, `0.0${n}`, `1/${n}`], rng, {
          visual: { text: '🪙'.repeat(n) },
          hint: 'Tenths go right after the decimal point.',
        });
      }),
      level('g3.pack-decimals.tenth-read', 'Read the Tenths', 'multiple-choice', 1, (rng) => {
        const n = randInt(rng, 2, 9);
        return labelMc(`What does 0.${n} mean?`, `${n} tenths`, [`${n} hundredths`, `${n} wholes`, `${n} tens`], rng, {
          hint: 'The first place after the point is tenths.',
        });
      }),
      level('g3.pack-decimals.money-form', 'Write the Money', 'multiple-choice', 1, (rng) => {
        const dollars = randInt(rng, 1, 9);
        const dimes = randInt(rng, 1, 9);
        return labelMc(
          `${dollars} dollar${dollars > 1 ? 's' : ''} and ${dimes} dime${dimes > 1 ? 's' : ''} is written as…`,
          `$${dollars}.${dimes}0`,
          [`$${dollars}.0${dimes}`, `$${dollars}${dimes}.00`, `$0.${dollars}${dimes}`],
          rng,
          { hint: 'Dimes are tenths of a dollar.' },
        );
      }),
      level('g3.pack-decimals.cents-dime', 'Dime Cents', 'number-pad', 1, (rng) => {
        const n = randInt(rng, 2, 9);
        return numPad(`How many cents is ${n} dimes?`, n * 10, {
          visual: { text: '🪙'.repeat(n) },
          hint: 'Each dime is 10 cents.',
        });
      }),
      level('g3.pack-decimals.compare', 'Bigger Pouch', 'multiple-choice', 2, (rng) => {
        const dollars = randInt(rng, 0, 4);
        const [cents1, cents2] = randInts(rng, 5, 95, 2);
        const a = moneyLabel(dollars * 100 + cents1);
        const b = moneyLabel(dollars * 100 + cents2);
        const bigger = moneyLabel(Math.max(dollars * 100 + cents1, dollars * 100 + cents2));
        return labelMc(`Which pouch is worth more: ${a} or ${b}?`, bigger, [moneyLabel(Math.min(dollars * 100 + cents1, dollars * 100 + cents2))], rng, {
          hint: 'Dollars tie — compare the cents.',
        });
      }),
      level('g3.pack-decimals.match-tenths', 'Tenths Match', 'match-pairs', 2, (rng) => {
        const keys = shuffle(rng, Object.keys(COIN_PAIRS)).slice(0, 4);
        return matchPairs('Match each fraction to its decimal.', keys.map((key) => ({ left: key, right: COIN_PAIRS[key] })));
      }),
      level('g3.pack-decimals.cents-worth', 'Cents Worth', 'number-pad', 2, (rng) => {
        const dollars = randInt(rng, 1, 9);
        const cents = randInt(rng, 1, 9) * 10 + randInt(rng, 0, 9);
        return numPad(`How many cents is $${dollars}.${String(cents).padStart(2, '0')}?`, dollars * 100 + cents, {
          hint: `$${dollars} is ${dollars * 100} cents, plus ${cents}.`,
        });
      }),
      level('g3.pack-decimals.tenth-line', 'Tenths Trail', 'multiple-choice', 2, (rng) => {
        const n = randInt(rng, 2, 7);
        return labelMc(
          'This path marks tenths between 0 and 1. What decimal hides under ⭐?',
          `0.${n}`,
          [`0.${n - 1}`, `0.${n + 1}`, `${n}.0`],
          rng,
          { visual: { text: `0 — 0.${n - 1} — ⭐ — 0.${n + 1} — 1` }, hint: 'Count by tenths: 0.1, 0.2, 0.3…' },
        );
      }),
      level('g3.pack-decimals.order-coins', 'Order the Pouches', 'order-sequence', 3, (rng) => {
        const dollars = randInt(rng, 0, 3);
        const cents = randInts(rng, 5, 95, 4);
        return orderSeq('Line up the money pouches from least to most!', cents.map((cent) => `$${dollars}.${String(cent).padStart(2, '0')}`));
      }),
      level('g3.pack-decimals.add-tenths', 'Add the Tenths', 'multiple-choice', 3, (rng) => {
        const a = randInt(rng, 1, 5);
        const b = randInt(rng, 1, 9 - a);
        return labelMc(`What is 0.${a} + 0.${b}?`, `0.${a + b}`, [`0.0${a + b}`, `${a + b}.0`, `0.${a}${b}`], rng, {
          hint: `Add the tenths: ${a} tenths + ${b} tenths.`,
        });
      }),
    ],
  };
}

const EMOJI_PATTERNS: string[][] = [
  ['🐚', '🐟'],
  ['⭐', '🌊', '🌊'],
  ['🦜', '🥥', '🌴'],
  ['🍉', '🍉', '🍓'],
];

function patternPier(): UnitDef {
  return {
    id: 'g3.pack-patterns',
    title: 'Pattern Pelican Pier',
    emoji: '🌀',
    domain: 'patterns',
    levels: [
      level('g3.pack-patterns.odd-even', 'Even or Odd?', 'multiple-choice', 1, (rng) => {
        const n = randInt(rng, 11, 999);
        return labelMc(`Is ${n} even or odd?`, n % 2 === 0 ? 'Even' : 'Odd', [n % 2 === 0 ? 'Odd' : 'Even'], rng, {
          hint: 'Look at the ones digit: 0, 2, 4, 6, 8 are even.',
        });
      }),
      level('g3.pack-patterns.next-bead', 'Next Bead', 'multiple-choice', 1, (rng) => {
        const pattern = pick(rng, EMOJI_PATTERNS);
        const repeats = randInt(rng, 2, 3);
        const shown = Array.from({ length: repeats }, () => pattern).flat();
        const nextIndex = randInt(rng, 0, pattern.length - 1);
        const tail = pattern.slice(0, nextIndex);
        return labelMc(
          `What comes next in the pattern?\n${[...shown, ...tail].join(' ')} ?`,
          pattern[nextIndex],
          pattern.filter((item) => item !== pattern[nextIndex]),
          rng,
          { hint: 'Find the part that repeats.' },
        );
      }),
      level('g3.pack-patterns.add-steps', 'Add-a-Step Trail', 'number-pad', 1, (rng) => {
        const step = pick(rng, [3, 4, 6, 7, 9] as const);
        const start = randInt(rng, 1, 9);
        const before = Array.from({ length: 3 }, (_, i) => start + step * i);
        return numPad(`The stepping stones go ${before.join(', ')}, ___ (+${step} each time). What is next?`, start + step * 3, {
          visual: { text: `${before.join(', ')}, ?` },
          hint: `Add ${step} to ${before[2]}.`,
        });
      }),
      level('g3.pack-patterns.even-product', 'Even Product?', 'true-false', 1, (rng) => {
        const a = pick(rng, [2, 4, 6, 8] as const);
        const b = randInt(rng, 3, 9);
        const claim = rng() < 0.7;
        return trueFalse(`${a} × ${b} is an ${claim ? 'even' : 'odd'} product.`, claim, {
          visual: { text: `${a} × ${b}` },
          hint: 'An even factor always makes an even product.',
        });
      }),
      level('g3.pack-patterns.rule-sail', 'Find the Rule', 'multiple-choice', 2, (rng) => {
        const step = pick(rng, [2, 3, 4, 5, 6, 10] as const);
        const start = randInt(rng, 2, 20);
        const seq = Array.from({ length: 4 }, (_, i) => start + step * i);
        return labelMc(
          `What is the rule for this pattern?\n${seq.join(', ')}`,
          `Add ${step}`,
          [`Add ${step + 1}`, `Add ${step - 1 === 0 ? step + 2 : step - 1}`, `Multiply by ${step}`],
          rng,
          { hint: 'How much does each number grow?' },
        );
      }),
      level('g3.pack-patterns.times-row', 'Times-Table Row', 'number-pad', 2, (rng) => {
        const factor = randInt(rng, 3, 9);
        const start = randInt(rng, 1, 6);
        const shown = Array.from({ length: 4 }, (_, i) => factor * (start + i));
        return numPad(`In the ${factor}s row of the times table: ${shown.join(', ')}, ___`, factor * (start + 4), {
          hint: `Count by ${factor}s.`,
        });
      }),
      level('g3.pack-patterns.odd-plus', 'Odd + Even', 'multiple-choice', 2, (rng) => {
        const forms = [
          { ask: 'odd + odd', answer: 'Even' },
          { ask: 'even + even', answer: 'Even' },
          { ask: 'odd + even', answer: 'Odd' },
        ] as const;
        const form = pick(rng, forms);
        const a = randInt(rng, 1, 9) * 2 + (form.ask.startsWith('odd') ? 1 : 0);
        const b = randInt(rng, 1, 9) * 2 + (form.ask.endsWith('odd') ? 1 : 0);
        return labelMc(`${a} + ${b} — is the sum even or odd?`, form.answer, [form.answer === 'Even' ? 'Odd' : 'Even'], rng, {
          visual: { text: `${a} + ${b}` },
          hint: 'odd + odd = even, odd + even = odd.',
        });
      }),
      level('g3.pack-patterns.odd-steps', 'Odd Steps', 'multiple-choice', 2, (rng) => {
        const start = randInt(rng, 1, 15) * 2 + 1;
        const seq = Array.from({ length: 4 }, (_, i) => start + 2 * i);
        const answer = start + 8;
        return numMc(`The odd numbers march on: ${seq.join(', ')}, ___`, answer, [answer + 1, answer - 1, answer + 2], rng, {
          hint: 'Odd numbers grow by 2.',
        });
      }),
      level('g3.pack-patterns.odd-one', 'Odd One Out', 'multiple-choice', 3, (rng) => {
        const step = pick(rng, [3, 4, 5, 6, 9] as const);
        const start = randInt(rng, 1, 5) * step;
        const seq = Array.from({ length: 5 }, (_, i) => start + step * i);
        const badIndex = randInt(rng, 1, 4);
        const bad = seq[badIndex] + randInt(rng, 1, step - 1);
        const shown = [...seq];
        shown[badIndex] = bad;
        return numMc(`One number breaks the +${step} pattern:\n${shown.join(', ')}\nWhich one?`, bad, [seq[badIndex], shown[badIndex - 1], shown[Math.min(badIndex + 1, 4)]], rng, {
          hint: `Every number should be ${step} more than the last.`,
        });
      }),
      level('g3.pack-patterns.double-trouble', 'Double Trouble', 'number-pad', 3, (rng) => {
        const start = randInt(rng, 2, 6);
        const shown = Array.from({ length: 4 }, (_, i) => start * 2 ** i);
        return numPad(`Each number doubles: ${shown.join(', ')}, ___`, start * 16, {
          hint: `Double ${shown[3]}.`,
        });
      }),
      level('g3.pack-patterns.two-rules', 'Two Rules at Once', 'multiple-choice', 3, (rng) => {
        const a = randInt(rng, 2, 9);
        const grow = randInt(rng, 2, 6);
        const first = [a, a + grow, a + grow * 2, a + grow * 3];
        const second = [a + 10, a + 20, a + 30, a + 40];
        const woven = [first[0], second[0], first[1], second[1], first[2], second[2]];
        return numMc(`Two patterns are woven together:\n${woven.join(', ')}, ___`, first[3], [second[3], first[3] + 1, second[2] + 10], rng, {
          hint: 'Check every other number — each has its own rule.',
        });
      }),
    ],
  };
}

function missingNumberMast(): UnitDef {
  return {
    id: 'g3.pack-algebra',
    title: 'Missing-Number Mast',
    emoji: '🧮',
    domain: 'algebra',
    levels: [
      level('g3.pack-algebra.missing-add', 'Missing Addend', 'number-pad', 1, (rng) => {
        const a = randInt(rng, 15, 80);
        const b = randInt(rng, 10, 99 - a);
        const sum = a + b;
        const swap = rng() < 0.5;
        return numPad(`Find the missing number: ${swap ? `⭐ + ${a} = ${sum}` : `${a} + ⭐ = ${sum}`}`, b, {
          visual: { text: swap ? `⭐ + ${a} = ${sum}` : `${a} + ⭐ = ${sum}` },
          hint: `${sum} − ${a} tells you the missing part.`,
        });
      }),
      level('g3.pack-algebra.star-factor', 'Star Factor', 'number-pad', 1, (rng) => {
        const a = randInt(rng, 2, 9);
        const b = randInt(rng, 2, 9);
        const swap = rng() < 0.5;
        const text = swap ? `${a} × ⭐ = ${a * b}` : `⭐ × ${a} = ${a * b}`;
        return numPad(`Find ⭐: ${text}`, b, {
          visual: { text },
          hint: `Think: ${a} × ? = ${a * b}`,
        });
      }),
      level('g3.pack-algebra.star-value', 'What Is ⭐?', 'multiple-choice', 1, (rng) => {
        const a = randInt(rng, 2, 9);
        const b = randInt(rng, 2, 9);
        return numMc(`⭐ × ${a} = ${a * b}. What is ⭐?`, b, [a, a * b, b + 1, b - 1], rng, {
          visual: { text: `⭐ × ${a} = ${a * b}` },
          hint: 'Use the matching division fact.',
        });
      }),
      level('g3.pack-algebra.balance', 'Balance the Scale', 'true-false', 1, (rng) => {
        const a = randInt(rng, 5, 15);
        const b = randInt(rng, 5, 15);
        const sum = a + b;
        const c = randInt(rng, 1, sum - 1);
        const exact = sum - c;
        const equal = rng() < 0.5;
        const offset = pick(rng, [-2, -1, 1, 2] as const);
        const d = equal ? exact : Math.max(1, exact + offset);
        return trueFalse(`Do the scales balance? ${a} + ${b} = ${c} + ${d}`, sum === c + d, {
          visual: { text: `${a} + ${b} ⚖️ ${c} + ${d}` },
          hint: 'Add each side, then compare.',
        });
      }),
      level('g3.pack-algebra.missing-div', 'Divisor Star', 'number-pad', 2, (rng) => {
        const divisor = randInt(rng, 2, 10);
        const quotient = randInt(rng, 2, 10);
        return numPad(`Find ⭐: ${divisor * quotient} ÷ ⭐ = ${quotient}`, divisor, {
          visual: { text: `${divisor * quotient} ÷ ⭐ = ${quotient}` },
          hint: `Think: ${quotient} × ⭐ = ${divisor * quotient}`,
        });
      }),
      level('g3.pack-algebra.dividend-star', 'Dividend Star', 'number-pad', 2, (rng) => {
        const divisor = randInt(rng, 2, 10);
        const quotient = randInt(rng, 2, 9);
        return numPad(`Find ⭐: ⭐ ÷ ${divisor} = ${quotient}`, divisor * quotient, {
          visual: { text: `⭐ ÷ ${divisor} = ${quotient}` },
          hint: `⭐ = ${divisor} × ${quotient}`,
        });
      }),
      level('g3.pack-algebra.both-sides', 'Both Sides', 'number-pad', 2, (rng) => {
        const a = randInt(rng, 2, 9);
        const b = randInt(rng, 1, 9);
        const d = randInt(rng, 1, 9);
        const c = a + b + d;
        return numPad(`Find ⭐: ${a} + ⭐ = ${c} − ${d}`, b, {
          visual: { text: `${a} + ⭐ = ${c} − ${d}` },
          hint: `First find ${c} − ${d} = ${c - d}.`,
        });
      }),
      level('g3.pack-algebra.family-solve', 'Family Solve', 'multiple-choice', 2, (rng) => {
        const a = randInt(rng, 3, 9);
        const b = randInt(rng, 3, 9);
        const total = a * b;
        const askFirst = rng() < 0.5;
        return numMc(
          `You know ${a} × ${b} = ${total}. What is ${total} ÷ ${askFirst ? a : b}?`,
          askFirst ? b : a,
          [askFirst ? a : b, total, askFirst ? b + 1 : a + 1],
          rng,
          { hint: 'Multiplication and division are fact family partners.' },
        );
      }),
      level('g3.pack-algebra.mult-plus', 'Multiply Then Add', 'number-pad', 3, (rng) => {
        const a = randInt(rng, 2, 9);
        const b = randInt(rng, 2, 9);
        const extra = randInt(rng, 1, 9);
        return numPad(`Find ⭐: ${a} × ${b} + ⭐ = ${a * b + extra}`, extra, {
          visual: { text: `${a} × ${b} + ⭐ = ${a * b + extra}` },
          hint: `First ${a} × ${b} = ${a * b}.`,
        });
      }),
      level('g3.pack-algebra.inequality', 'Bigger Than', 'multiple-choice', 3, (rng) => {
        const a = randInt(rng, 2, 9);
        const b = randInt(rng, 2, 9);
        const product = a * b;
        const answer = product + randInt(rng, 1, 9);
        return numMc(`⭐ is greater than ${a} × ${b}. Which number could be ⭐?`, answer, [product, product - 1, product - randInt(rng, 2, 5)], rng, {
          visual: { text: `⭐ > ${a} × ${b}` },
          hint: `${a} × ${b} = ${product}. Pick a bigger number.`,
        });
      }),
      level('g3.pack-algebra.equation-match', 'Equation Match', 'match-pairs', 3, (rng) => {
        const forms = shuffle(rng, [0, 1, 2, 3]);
        const pairs: { left: string; right: string }[] = [];
        const used = new Set<string>();
        for (const form of forms) {
          if (pairs.length === 4) break;
          const a = randInt(rng, 2, 9);
          const b = randInt(rng, 2, 9);
          const total = a * b;
          const candidate =
            form === 0
              ? { left: `⭐ × ${a} = ${total}`, right: String(b) }
              : form === 1
                ? { left: `${total} ÷ ⭐ = ${a}`, right: String(b) }
                : form === 2
                  ? { left: `⭐ + ${a} = ${a + b}`, right: String(b) }
                  : { left: `${a + b} − ⭐ = ${a}`, right: String(b) };
          if (used.has(candidate.left) || pairs.some((pair) => pair.right === candidate.right)) continue;
          used.add(candidate.left);
          pairs.push(candidate);
        }
        while (pairs.length < 4) {
          const a = randInt(rng, 2, 9);
          const b = randInt(rng, 2, 9);
          const candidate = { left: `⭐ × ${a} = ${a * b}`, right: String(b) };
          if (used.has(candidate.left) || pairs.some((pair) => pair.right === candidate.right)) continue;
          used.add(candidate.left);
          pairs.push(candidate);
        }
        return matchPairs('Match each equation to the number ⭐ stands for.', pairs);
      }),
    ],
  };
}

export const g3PackNumbers: UnitDef[] = [skipCountShip(), timesTableTreasure(), divisionDocksPack(), roundUpReef(), dimeDecimals(), patternPier(), missingNumberMast()];
