import { randInt, randInts } from '../../core/rng';
import type { ChoiceOption, Question, UnitDef } from '../../core/types';
import { level, matchPairs, mc, numPad, orderSeq, trueFalse } from '../helpers';
import {
  COLOR_GROUPS,
  CONTAINERS,
  HEAVY_THINGS,
  LIGHT_THINGS,
  NUMBER_WORDS,
  PATTERN_SETS,
  PREK_CRITTERS,
  SHORT_THINGS,
  SMALL_THINGS,
  STORY_CONTEXTS,
  TALL_THINGS,
} from './banks';
import { choose, chooseDistinct, pickChoices, repeat } from './choices';

const FRUIT = ['🍎', '🍌', '🍇', '🍓', '🍊', '🫐'] as const;
const SNACKS = ['🍪', '🍓', '🥕', '🍇', '🫐'] as const;
const TOYS = ['🧸', '⚽', '🪀', '🚗', '🎈', '🪁', '📚', '🧩'] as const;
const HOUSEHOLD = ['📱', '🍎', '🧦', '📖', '🥄', '👟'] as const;
const MONEY_ITEMS = ['🪙', '💵', '💳'] as const;

const PACK_SHAPES = [
  { name: 'circle', glyph: '🔴' },
  { name: 'square', glyph: '🟦' },
  { name: 'triangle', glyph: '🔺' },
  { name: 'rectangle', glyph: '▬' },
  { name: 'oval', glyph: '🥚' },
  { name: 'star', glyph: '⭐' },
  { name: 'heart', glyph: '❤️' },
  { name: 'diamond', glyph: '🔷' },
] as const;

const PACK_SHAPE_OBJECTS = [
  { shape: 'circle', items: ['🍪', '🍩', '🌕', '⚽'] },
  { shape: 'square', items: ['🖼️', '🧇', '🔲'] },
  { shape: 'triangle', items: ['🍕', '⚠️', '📐'] },
  { shape: 'rectangle', items: ['🚪', '📱', '💵'] },
  { shape: 'oval', items: ['🥚', '🏈', '🍉'] },
  { shape: 'star', items: ['🌟', '✨'] },
  { shape: 'heart', items: ['💝', '💌'] },
  { shape: 'diamond', items: ['💎', '🔶'] },
] as const;

const SHAPE_PATTERN_SET = ['🔺', '🔷', '⭐', '🔴'] as const;
const PACK_PATTERN_SETS: readonly (readonly string[])[] = [
  PATTERN_SETS.colors,
  PATTERN_SETS.animals,
  PATTERN_SETS.fruit,
  PATTERN_SETS.dino,
  SHAPE_PATTERN_SET,
];

const POSITION_PAIRS = [
  { thing: '🐱', place: '🛏️' },
  { thing: '🐶', place: '☂️' },
  { thing: '🐰', place: '🥕' },
  { thing: '🦊', place: '🌳' },
] as const;

const ROLLERS = ['⚽', '🏀', '🌍', '🍊', '🪙'] as const;
const SLIDERS = ['📦', '📖', '🚪', '🖼️', '🍦'] as const;

const LONG_THINGS = ['🐍', '🚂', '🧣', '🌉'] as const;
const TINY_THINGS = ['🐛', '🐞', '🍓', '🔑'] as const;

const DAY_CLAIMS = [
  { text: 'We eat breakfast in the morning.', value: true },
  { text: 'We sleep at night. 😴', value: true },
  { text: 'The sun ☀️ shines in the day.', value: true },
  { text: 'We see stars ⭐ at night.', value: true },
  { text: 'The moon 🌙 comes out in the morning.', value: false },
  { text: 'We eat breakfast at night.', value: false },
  { text: 'The sun ☀️ shines while we sleep.', value: false },
  { text: 'We go to sleep at lunchtime.', value: false },
] as const;

const ORDINAL_WORDS = ['1st', '2nd', '3rd', '4th', '5th'] as const;

/** Split a count into visual rows of at most `size` (keeps emoji rows ≤8 glyphs). */
function rowsOf(n: number, size = 8): number[] {
  const groups: number[] = [];
  let left = n;
  while (left > 0) {
    groups.push(Math.min(size, left));
    left -= size;
  }
  return groups;
}

function emojiVisual(emoji: string, n: number): Question['visual'] {
  return n <= 8 ? { emoji, count: n } : { emoji, groups: rowsOf(n) };
}

function numQ(
  kind: 'multiple-choice' | 'count-tap',
  prompt: string,
  answer: number,
  options: ChoiceOption[],
  visual?: Question['visual'],
  hint?: string,
): Question {
  return { kind, prompt, answer: String(answer), options, visual, hint };
}

function twoRows(first: string, a: number, second: string, b: number): Question['visual'] {
  return { text: `${repeat(first, a)}\n${repeat(second, b)}` };
}

export const prekPack: UnitDef[] = [
  {
    id: 'prek.pack-count',
    title: 'Counting Train',
    emoji: '🚂',
    domain: 'counting',
    levels: [
      level('prek.pack-count.fruit-rows', 'Count Both Kinds', 'multiple-choice', 1, (rng) => {
        const [first, second] = chooseDistinct(rng, FRUIT, 2);
        const a = randInt(rng, 2, 5);
        const b = randInt(rng, 1, 4);
        const total = a + b;
        return numQ('multiple-choice', `Count all the ${first} and ${second}!`, total,
          pickChoices(rng, total, [a, b, total - 1, total + 1], { count: 4, min: 1, max: 12 }),
          twoRows(first, a, second, b), 'Point to each fruit as you count!');
      }, 5),
      level('prek.pack-count.to-10', 'Big Count to 10', 'count-tap', 1, (rng) => {
        const { emoji } = choose(rng, PREK_CRITTERS);
        const count = randInt(rng, 6, 10);
        return numQ('count-tap', `How many ${emoji} do you see?`, count,
          pickChoices(rng, count, [count - 1, count + 1, count - 2, count + 2], { count: 4, min: 1, max: 12 }),
          emojiVisual(emoji, count), 'Count one row, then the next!');
      }),
      level('prek.pack-count.fingers', 'Finger Count', 'count-tap', 1, (rng) => {
        const count = randInt(rng, 1, 5);
        return numQ('count-tap', 'How many fingers are up? ☝️', count,
          pickChoices(rng, count, [count - 1, count + 1, 5], { count: 3, min: 1, max: 6 }),
          emojiVisual('☝️', count), 'Touch each finger and count!');
      }, 5),
      level('prek.pack-count.show-me', 'Show Me!', 'multiple-choice', 1, (rng) => {
        const { emoji } = choose(rng, PREK_CRITTERS);
        const count = randInt(rng, 2, 6);
        const wrongs = chooseDistinct(rng, [1, 2, 3, 4, 5, 6, 7].filter((v) => v !== count), 3);
        return mc(`Show me ${count}! Which is ${count} ${emoji}?`, repeat(emoji, count),
          wrongs.map((w) => repeat(emoji, w)), rng,
          { hint: 'Count each row slowly — one at a time!' });
      }),
      level('prek.pack-count.mixed-rows', 'Mixed Animal Rows', 'multiple-choice', 2, (rng) => {
        const [first, second] = chooseDistinct(rng, PREK_CRITTERS, 2);
        const a = randInt(rng, 4, 7);
        const b = randInt(rng, 3, 7);
        const total = a + b;
        return numQ('multiple-choice', `How many animals in all? Count the ${first.emoji} and the ${second.emoji}!`, total,
          pickChoices(rng, total, [a, b, total - 1, total + 1], { count: 4, min: 1, max: 16 }),
          twoRows(first.emoji, a, second.emoji, b), 'Count the first row, then keep going!');
      }),
      level('prek.pack-count.to-20', 'Count to 20', 'count-tap', 2, (rng) => {
        const { emoji } = choose(rng, PREK_CRITTERS);
        const count = randInt(rng, 11, 20);
        return numQ('count-tap', `How many ${emoji}? Count them all!`, count,
          pickChoices(rng, count, [count - 1, count + 1, count - 10, count - 2], { count: 4, min: 1, max: 22 }),
          emojiVisual(emoji, count), 'Say "ten" after the first ten, then count on!');
      }),
      level('prek.pack-count.type-it', 'Type the Count', 'number-pad', 2, (rng) => {
        const { emoji } = choose(rng, PREK_CRITTERS);
        const count = randInt(rng, 4, 10);
        return numPad(`How many ${emoji}? Type the number!`, count,
          { visual: emojiVisual(emoji, count), hint: 'Count first, then tap the keys!' });
      }),
      level('prek.pack-count.before', 'What Comes Before?', 'multiple-choice', 2, (rng) => {
        const n = randInt(rng, 2, 9);
        return numQ('multiple-choice', `What number comes right before ${n}?`, n - 1,
          pickChoices(rng, n - 1, [n, n + 1, n - 2], { count: 3, min: 0, max: 10 }),
          { text: `❓ , ${n}` }, 'Count up and stop one number early!');
      }),
      level('prek.pack-count.word-match', 'Number Words', 'match-pairs', 2, (rng) => {
        const nums = randInts(rng, 1, 10, 4);
        return { ...matchPairs('Match each number word to its number!',
          nums.map((n) => ({ left: NUMBER_WORDS[n], right: String(n) }))),
          hint: 'Say the word out loud — what number is it?' };
      }),
      level('prek.pack-count.is-it', 'Is That Many?', 'true-false', 3, (rng) => {
        const { emoji } = choose(rng, PREK_CRITTERS);
        const count = randInt(rng, 4, 12);
        const claim = randInt(rng, 0, 1) === 0 ? count : count + choose(rng, [-1, 1, 2]);
        return trueFalse(`Are there ${claim} ${emoji}?`, claim === count,
          { visual: emojiVisual(emoji, count), hint: 'Count first — then decide!' });
      }),
      level('prek.pack-count.teen-type', 'Type the Teen', 'number-pad', 3, (rng) => {
        const extra = randInt(rng, 1, 8);
        return numPad(`A full ten-frame and ${extra} more! Type the teen number.`, 10 + extra,
          { visual: { emoji: choose(rng, PREK_CRITTERS).emoji, groups: [5, 5, extra] },
            hint: 'A full ten is 10 — count on from there!' });
      }),
      level('prek.pack-count.order-cards', 'Number Card Order', 'order-sequence', 3, (rng) => {
        const start = randInt(rng, 1, 7);
        const len = randInt(rng, 3, 5);
        return { ...orderSeq('Put the number cards in order — smallest first!',
          Array.from({ length: len }, (_, i) => String(start + i))),
          hint: 'Find the smallest number to start!' };
      }),
    ],
  },
  {
    id: 'prek.pack-compare',
    title: 'More or Less?',
    emoji: '⚖️',
    domain: 'counting',
    levels: [
      level('prek.pack-compare.more', 'More Please!', 'multiple-choice', 1, (rng) => {
        const [first, second] = chooseDistinct(rng, FRUIT, 2);
        const [a, b] = chooseDistinct(rng, [1, 2, 3, 4, 5, 6], 2);
        const answer = a > b ? `${first} row` : `${second} row`;
        return mc('Which row has more?', answer,
          [a > b ? `${second} row` : `${first} row`, 'Same! 🟰'], rng,
          { visual: twoRows(first, a, second, b), hint: 'Count each row — which number is bigger?' });
      }, 5),
      level('prek.pack-compare.fewer', 'Fewer Please!', 'multiple-choice', 1, (rng) => {
        const [first, second] = chooseDistinct(rng, FRUIT, 2);
        const [a, b] = chooseDistinct(rng, [1, 2, 3, 4, 5, 6], 2);
        const answer = a < b ? `${first} row` : `${second} row`;
        return mc('Which row has fewer?', answer,
          [a < b ? `${second} row` : `${first} row`, 'Same! 🟰'], rng,
          { visual: twoRows(first, a, second, b), hint: 'Count each row — which number is smaller?' });
      }, 5),
      level('prek.pack-compare.same', 'Same or Not?', 'true-false', 1, (rng) => {
        const emoji = choose(rng, PREK_CRITTERS).emoji;
        const same = randInt(rng, 0, 1) === 0;
        const a = randInt(rng, 2, 6);
        const b = same ? a : choose(rng, [1, 2, 3, 4, 5, 6, 7].filter((v) => v !== a));
        return trueFalse('Do both rows have the same number?', same,
          { visual: twoRows(emoji, a, emoji, b), hint: 'Pair them up — does everyone have a partner?' });
      }, 5),
      level('prek.pack-compare.mfs', 'More, Fewer, or Same', 'multiple-choice', 2, (rng) => {
        const [first, second] = chooseDistinct(rng, FRUIT, 2);
        const same = randInt(rng, 0, 2) === 0;
        const a = randInt(rng, 1, 6);
        const b = same ? a : choose(rng, [1, 2, 3, 4, 5, 6].filter((v) => v !== a));
        const answer = a > b ? `More ${first}` : a < b ? `Fewer ${first}` : 'Same! 🟰';
        return mc(`Are there more ${first}, fewer ${first}, or the same as ${second}?`, answer,
          [`More ${first}`, `Fewer ${first}`, 'Same! 🟰'].filter((o) => o !== answer), rng,
          { visual: twoRows(first, a, second, b), hint: `Compare the ${first} row to the ${second} row.` });
      }),
      level('prek.pack-compare.enough', 'Enough for Everyone?', 'multiple-choice', 2, (rng) => {
        const pups = randInt(rng, 2, 6);
        const bones = choose(rng, [pups - 1, pups, pups + 1]);
        const enough = bones >= pups;
        return mc(`${pups} pups 🐶 and ${bones} bones 🦴 — is there a bone for every pup?`,
          enough ? 'Yes, enough! ✅' : 'Not enough! ❌',
          [enough ? 'Not enough! ❌' : 'Yes, enough! ✅'], rng,
          { visual: twoRows('🐶', pups, '🦴', bones), hint: 'Give each pup a bone — any left over or missing?' });
      }),
      level('prek.pack-compare.more-tf', 'More or Not?', 'true-false', 2, (rng) => {
        const [a, b] = chooseDistinct(rng, [1, 2, 3, 4, 5, 6, 7], 2);
        const asksMore = randInt(rng, 0, 1) === 0;
        return trueFalse(asksMore ? 'Does the 🍇 row have more?' : 'Does the 🍇 row have fewer?',
          asksMore ? a > b : a < b,
          { visual: twoRows('🍇', a, '🍓', b), hint: 'Count both rows!' });
      }),
      level('prek.pack-compare.bigger-num', 'Bigger Number', 'multiple-choice', 2, (rng) => {
        const [a, b] = chooseDistinct(rng, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 2);
        const answer = Math.max(a, b);
        return numQ('multiple-choice', `Which number is bigger — ${a} or ${b}?`, answer,
          pickChoices(rng, answer, [Math.min(a, b), answer + 1, answer - 1], { count: 4, min: 0, max: 12 }),
          { text: `${a}   vs   ${b}` }, 'Which one do you say later when you count?');
      }),
      level('prek.pack-compare.smaller-num', 'Smaller Number', 'multiple-choice', 2, (rng) => {
        const [a, b] = chooseDistinct(rng, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 2);
        const answer = Math.min(a, b);
        return numQ('multiple-choice', `Which number is smaller — ${a} or ${b}?`, answer,
          pickChoices(rng, answer, [Math.max(a, b), answer + 1, answer - 1], { count: 4, min: 0, max: 12 }),
          { text: `${a}   vs   ${b}` }, 'Which one do you say first when you count?');
      }),
      level('prek.pack-compare.most', 'The Most!', 'multiple-choice', 3, (rng) => {
        const fruit = chooseDistinct(rng, FRUIT, 3);
        const counts = chooseDistinct(rng, [2, 3, 4, 5, 6, 7, 8], 3);
        const best = counts.indexOf(Math.max(...counts));
        const labels = fruit.map((f) => `${f} row`);
        return mc('Which row has the MOST?', labels[best],
          labels.filter((_, i) => i !== best), rng,
          { visual: { text: fruit.map((f, i) => repeat(f, counts[i])).join('\n') },
            hint: 'Count each row — the biggest number wins!' });
      }),
      level('prek.pack-compare.least', 'The Least!', 'multiple-choice', 3, (rng) => {
        const fruit = chooseDistinct(rng, FRUIT, 3);
        const counts = chooseDistinct(rng, [2, 3, 4, 5, 6, 7, 8], 3);
        const fewest = counts.indexOf(Math.min(...counts));
        const labels = fruit.map((f) => `${f} row`);
        return mc('Which row has the FEWEST?', labels[fewest],
          labels.filter((_, i) => i !== fewest), rng,
          { visual: { text: fruit.map((f, i) => repeat(f, counts[i])).join('\n') },
            hint: 'Count each row — the smallest number wins!' });
      }),
      level('prek.pack-compare.make-same', 'Make It Fair!', 'multiple-choice', 3, (rng) => {
        const a = randInt(rng, 3, 8);
        const gap = randInt(rng, 1, Math.min(4, a - 1));
        const b = a - gap;
        return numQ('multiple-choice',
          `Top row has ${a} 🍎 and bottom row has ${b}. How many more 🍎 does the bottom need to be the same?`, gap,
          pickChoices(rng, gap, [gap + 1, gap - 1, a, b].filter((v) => v >= 1), { count: 4, min: 1, max: 8 }),
          twoRows('🍎', a, '🍎', b), 'Give the bottom row apples until they match!');
      }),
      level('prek.pack-compare.extra', 'Count the Extras', 'multiple-choice', 3, (rng) => {
        const b = randInt(rng, 1, 5);
        const extra = randInt(rng, 1, 4);
        const a = b + extra;
        return numQ('multiple-choice', 'How many MORE 🦋 are in the top row? Count the extras!', extra,
          pickChoices(rng, extra, [extra + 1, extra - 1, a, b].filter((v) => v >= 1), { count: 4, min: 1, max: 9 }),
          twoRows('🦋', a, '🦋', b), 'Pair them up — the leftovers are the extras!');
      }),
    ],
  },
  {
    id: 'prek.pack-add',
    title: 'Snack Sums',
    emoji: '🍪',
    domain: 'operations',
    levels: [
      level('prek.pack-add.count-all', 'Count Them All', 'count-tap', 1, (rng) => {
        const snack = choose(rng, SNACKS);
        const a = randInt(rng, 1, 3);
        const b = randInt(rng, 1, 5 - a);
        const total = a + b;
        return numQ('count-tap', 'How many snacks in all?', total,
          pickChoices(rng, total, [a, b, total + 1], { count: 4, min: 1, max: 7 }),
          { emoji: snack, groups: [a, b] }, 'Count the first bunch, then keep counting!');
      }, 5),
      level('prek.pack-add.and', 'And Makes More', 'multiple-choice', 1, (rng) => {
        const snack = choose(rng, SNACKS);
        const a = randInt(rng, 1, 3);
        const b = randInt(rng, 1, 5 - a);
        const total = a + b;
        return numQ('multiple-choice', `${a} ${snack} and ${b} more! How many ${snack} in all?`, total,
          pickChoices(rng, total, [a, b, total + 1, total - 1], { count: 4, min: 1, max: 7 }),
          { emoji: snack, groups: [a, b] }, 'Put the two bunches together and count all!');
      }),
      level('prek.pack-add.one-more', 'One More!', 'multiple-choice', 1, (rng) => {
        const { emoji } = choose(rng, PREK_CRITTERS);
        const a = randInt(rng, 1, 5);
        const answer = a + 1;
        return numQ('multiple-choice', `${a} ${emoji} are playing. One more ${emoji} comes! How many now?`, answer,
          pickChoices(rng, answer, [a, answer + 1, answer + 2], { count: 4, min: 1, max: 8 }),
          { emoji, groups: [a, 1] }, 'Just count one more!');
      }, 5),
      level('prek.pack-add.plus5', 'Adding to 5', 'multiple-choice', 2, (rng) => {
        const snack = choose(rng, SNACKS);
        const a = randInt(rng, 1, 4);
        const b = randInt(rng, 1, 5 - a);
        const total = a + b;
        return numQ('multiple-choice', `${a} + ${b} = ?`, total,
          pickChoices(rng, total, [total + 1, total - 1, a, b], { count: 4, min: 1, max: 7 }),
          { emoji: snack, groups: [a, b] }, 'Put them together and count all!');
      }),
      level('prek.pack-add.type5', 'Type the Sum', 'number-pad', 2, (rng) => {
        const snack = choose(rng, SNACKS);
        const a = randInt(rng, 1, 4);
        const b = randInt(rng, 1, 5 - a);
        return numPad(`${a} + ${b} = ?`, a + b,
          { visual: { emoji: snack, groups: [a, b] }, hint: 'Count every snack!' });
      }),
      level('prek.pack-add.pic10', 'Bigger Add', 'count-tap', 2, (rng) => {
        const snack = choose(rng, SNACKS);
        const a = randInt(rng, 3, 7);
        const b = randInt(rng, 2, 10 - a);
        const total = a + b;
        return numQ('count-tap', 'How many snacks in all?', total,
          pickChoices(rng, total, [total - 1, total + 1, a, b], { count: 4, min: 1, max: 12 }),
          { emoji: snack, groups: [a, b] }, 'Count the first bunch, then count on!');
      }),
      level('prek.pack-add.fingers', 'Finger Adding', 'multiple-choice', 2, (rng) => {
        const a = randInt(rng, 1, 5);
        const b = randInt(rng, 1, 5);
        const total = a + b;
        return numQ('multiple-choice', `Hold up ${a} fingers and ${b} fingers. How many fingers up in all?`, total,
          pickChoices(rng, total, [a, b, total - 1, total + 1], { count: 4, min: 1, max: 10 }),
          { emoji: '☝️', groups: [a, b] }, 'Count all the fingers that are up!');
      }),
      level('prek.pack-add.true', 'True Adding?', 'true-false', 3, (rng) => {
        const a = randInt(rng, 1, 4);
        const b = randInt(rng, 1, 4);
        const total = a + b;
        const claim = randInt(rng, 0, 1) === 0 ? total : total + choose(rng, [-1, 1, 2]);
        return trueFalse(`Is ${a} + ${b} = ${claim}?`, claim === total,
          { visual: { text: `${a} + ${b} = ?` }, hint: 'Count it out — does it match?' });
      }),
      level('prek.pack-add.match', 'Sum Match', 'match-pairs', 3, (rng) => {
        const sums = randInts(rng, 3, 8, 3);
        const pairs = sums.map((total) => {
          const a = randInt(rng, 1, total - 1);
          return { left: `${a} + ${total - a}`, right: String(total) };
        });
        return { ...matchPairs('Match each adding problem to its answer!', pairs),
          hint: 'Count the two parts together.' };
      }),
      level('prek.pack-add.hiding', 'Hiding Snacks', 'multiple-choice', 3, (rng) => {
        const snack = choose(rng, SNACKS);
        const total = randInt(rng, 4, 8);
        const shown = randInt(rng, 1, total - 1);
        const hiding = total - shown;
        return numQ('multiple-choice', `${total} ${snack} in all — ${shown} are here. How many are hiding?`, hiding,
          pickChoices(rng, hiding, [shown, total, hiding + 1, hiding - 1].filter((v) => v >= 1), { count: 4, min: 1, max: 9 }),
          { text: `${repeat(snack, shown)} + ❓ = ${total}` }, 'Count up from what you see to the total!');
      }),
      level('prek.pack-add.big-type', 'Type the Big Sum', 'number-pad', 3, (rng) => {
        const snack = choose(rng, SNACKS);
        const a = randInt(rng, 4, 8);
        const b = randInt(rng, 2, 10 - a);
        return numPad(`${a} + ${b} = ?`, a + b,
          { visual: { emoji: snack, groups: [a, b] }, hint: 'Keep counting past 5!' });
      }),
    ],
  },
  {
    id: 'prek.pack-teens',
    title: 'Ten & Teens',
    emoji: '🔟',
    domain: 'place-value',
    levels: [
      level('prek.pack-teens.frame', 'Ten-Frame Count', 'count-tap', 2, (rng) => {
        const extra = randInt(rng, 1, 8);
        const total = 10 + extra;
        return numQ('count-tap', 'The ten-frame is full! How many in all?', total,
          pickChoices(rng, total, [extra, total - 1, total + 1, 10], { count: 4, min: 1, max: 20 }),
          { emoji: choose(rng, PREK_CRITTERS).emoji, groups: [5, 5, extra] },
          'Start at 10, then count on!');
      }, 5),
      level('prek.pack-teens.ten-plus', 'Ten and More', 'multiple-choice', 2, (rng) => {
        const extra = randInt(rng, 1, 8);
        return numQ('multiple-choice', `10 and ${extra} more make...`, 10 + extra,
          pickChoices(rng, 10 + extra, [extra, 10 + extra + 1, 10 + extra - 1, 10], { count: 4, min: 1, max: 20 }),
          { emoji: '🔵', groups: [5, 5, extra] }, '10 plus some makes a teen number!');
      }),
      level('prek.pack-teens.build', 'Build a Teen', 'multiple-choice', 2, (rng) => {
        const extra = randInt(rng, 1, 8);
        return numQ('multiple-choice', `Make ${10 + extra}! You have 10 — how many more do you need?`, extra,
          pickChoices(rng, extra, [extra + 1, extra - 1, 10, 10 + extra], { count: 4, min: 0, max: 18 }),
          { text: `10 + ❓ = ${10 + extra}` }, 'A teen number is 10 and some more.');
      }),
      level('prek.pack-teens.symbolic', 'Ten Plus', 'multiple-choice', 2, (rng) => {
        const extra = randInt(rng, 1, 8);
        return numQ('multiple-choice', `10 + ${extra} = ?`, 10 + extra,
          pickChoices(rng, 10 + extra, [extra, 10 + extra + 1, 10 + extra - 1, 10], { count: 4, min: 1, max: 20 }),
          { text: `10 + ${extra} =` }, 'Ten plus a little is a teen!');
      }),
      level('prek.pack-teens.type', 'Type the Teen', 'number-pad', 3, (rng) => {
        const extra = randInt(rng, 1, 8);
        return numPad('How many? A full ten-frame plus more!', 10 + extra,
          { visual: { emoji: '🔵', groups: [5, 5, extra] }, hint: 'Type the teen number!' });
      }),
      level('prek.pack-teens.bigger', 'Bigger Teen', 'multiple-choice', 3, (rng) => {
        const [a, b] = chooseDistinct(rng, [11, 12, 13, 14, 15, 16, 17, 18], 2);
        const answer = Math.max(a, b);
        return numQ('multiple-choice', `Which is bigger — ${a} or ${b}?`, answer,
          pickChoices(rng, answer, [Math.min(a, b), answer + 1, answer - 1], { count: 4, min: 9, max: 20 }),
          { text: `${a}   vs   ${b}` }, 'More extras on top of 10 means bigger!');
      }),
      level('prek.pack-teens.tf', 'Teen True?', 'true-false', 3, (rng) => {
        const extra = randInt(rng, 1, 8);
        const claim = randInt(rng, 0, 1) === 0
          ? extra
          : choose(rng, [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((v) => v !== extra));
        return trueFalse(`Is ${10 + extra} the same as 10 and ${claim}?`, claim === extra,
          { visual: { text: `${10 + extra} = 10 + ❓` }, hint: 'What part of a teen is the extra?' });
      }),
      level('prek.pack-teens.match', 'Teen Match', 'match-pairs', 3, (rng) => {
        const extras = randInts(rng, 1, 8, 3);
        return { ...matchPairs('Match each teen number to its parts!',
          extras.map((e) => ({ left: `10 + ${e}`, right: String(10 + e) }))),
          hint: 'A teen is 10 plus the extra.' };
      }),
      level('prek.pack-teens.count-on', 'Count On Past 10', 'multiple-choice', 3, (rng) => {
        const start = choose(rng, [10, 12, 14]);
        return numQ('multiple-choice', 'What comes next?', start + 3,
          pickChoices(rng, start + 3, [start + 2, start + 4, start + 1, start - 1], { count: 4, min: 8, max: 20 }),
          { text: `${start}, ${start + 1}, ${start + 2}, ❓` }, 'Keep counting up!');
      }),
      level('prek.pack-teens.before', 'Before the Teen', 'multiple-choice', 3, (rng) => {
        const n = randInt(rng, 12, 18);
        return numQ('multiple-choice', `What comes right before ${n}?`, n - 1,
          pickChoices(rng, n - 1, [n, n + 1, n - 2, n - 10], { count: 4, min: 1, max: 20 }),
          { text: `❓ , ${n}` }, 'Count up and stop one early!');
      }),
    ],
  },
  {
    id: 'prek.pack-frac',
    title: 'Fair Share',
    emoji: '🍰',
    domain: 'fractions',
    levels: [
      level('prek.pack-frac.share', 'Share It Fair', 'multiple-choice', 2, (rng) => {
        const total = choose(rng, [4, 6, 8]);
        const snack = choose(rng, SNACKS);
        return numQ('multiple-choice', `Share ${total} ${snack} fairly between 2 friends. How many does each get?`, total / 2,
          pickChoices(rng, total / 2, [total / 2 - 1, total / 2 + 1, total], { count: 4, min: 1, max: 10 }),
          { emoji: snack, count: total }, 'Fair means both friends get the SAME number!');
      }, 5),
      level('prek.pack-frac.half-split', 'Pick the Fair Split', 'multiple-choice', 2, (rng) => {
        const total = choose(rng, [4, 6, 8]);
        const a = total / 2;
        const wrongs = chooseDistinct(rng, [1, 2, 3, 4, 5].filter((v) => v !== a && v < total && total - v !== v), 2);
        return mc(`Which is a fair split of ${total} 🍪?`, `${a} and ${a}`,
          wrongs.map((w) => `${w} and ${total - w}`), rng,
          { visual: { emoji: '🍪', count: total }, hint: 'A fair split has two equal parts!' });
      }),
      level('prek.pack-frac.fair-tf', 'Is It Fair?', 'true-false', 2, (rng) => {
        const fair = randInt(rng, 0, 1) === 0;
        const a = randInt(rng, 2, 5);
        const b = fair ? a : choose(rng, [1, 2, 3, 4, 5, 6].filter((v) => v !== a && Math.abs(v - a) <= 3));
        return trueFalse('Two friends shared the snacks like this. Was it fair?', fair,
          { visual: { emoji: '🍪', groups: [a, b] }, hint: 'Fair means both got the SAME number!' });
      }, 5),
      level('prek.pack-frac.half-row', 'Half the Row', 'multiple-choice', 2, (rng) => {
        const total = choose(rng, [4, 6, 8]);
        const a = total / 2;
        const wrongs = chooseDistinct(rng, [1, 2, 3, 4, 5].filter((v) => v !== a && v < total), 2);
        return mc(`Which row is HALF of ${total} 🍎?`, repeat('🍎', a),
          wrongs.map((w) => repeat('🍎', w)), rng,
          { visual: { emoji: '🍎', count: total }, hint: 'Half is two same-size bunches!' });
      }),
      level('prek.pack-frac.half-of', 'Half Of', 'multiple-choice', 3, (rng) => {
        const total = choose(rng, [4, 6, 8, 10]);
        return numQ('multiple-choice', `What is half of ${total}?`, total / 2,
          pickChoices(rng, total / 2, [total / 2 - 1, total / 2 + 1, total], { count: 4, min: 1, max: 10 }),
          { emoji: '🍓', groups: [total / 2, total / 2] }, 'Half means two equal parts!');
      }),
      level('prek.pack-frac.half-type', 'Type the Half', 'number-pad', 3, (rng) => {
        const total = choose(rng, [4, 6, 8, 10]);
        return numPad(`Half of ${total} is... type it!`, total / 2,
          { visual: { emoji: '🍇', count: total }, hint: 'Split into two same-size bunches!' });
      }),
      level('prek.pack-frac.share-type', 'Type the Share', 'number-pad', 3, (rng) => {
        const per = choose(rng, [2, 3, 4]);
        const total = per * 2;
        return numPad(`${total} 🥕 shared fairly by 2 bunnies — each gets?`, per,
          { visual: { emoji: '🥕', count: total }, hint: 'One for you, one for me...' });
      }),
      level('prek.pack-frac.match', 'Half Match', 'match-pairs', 3, (rng) => {
        const totals = chooseDistinct(rng, [4, 6, 8, 10], 3);
        return { ...matchPairs('Match each number to its half!',
          totals.map((t) => ({ left: `half of ${t}`, right: String(t / 2) }))),
          hint: 'Half of 4 is 2 — it makes two equal parts!' };
      }),
      level('prek.pack-frac.three-share', 'Three Friends Share', 'multiple-choice', 3, (rng) => {
        const per = choose(rng, [1, 2, 3]);
        const total = per * 3;
        return numQ('multiple-choice', `${total} 🍓 for 3 friends, all the same! How many each?`, per,
          pickChoices(rng, per, [per + 1, per + 2, total - 1], { count: 4, min: 1, max: 9 }),
          { emoji: '🍓', count: total }, 'One for each friend, then around again!');
      }),
      level('prek.pack-frac.half-tf', 'Half or Not?', 'true-false', 3, (rng) => {
        const total = choose(rng, [4, 6, 8]);
        const right = randInt(rng, 0, 1) === 0;
        const claim = right ? total / 2
          : choose(rng, [1, 2, 3, 4, 5].filter((v) => v !== total / 2 && v < total));
        return trueFalse(`Is ${claim} half of ${total}?`, claim === total / 2,
          { visual: { emoji: '🍪', count: total }, hint: 'Does it make two equal parts?' });
      }),
    ],
  },
  {
    id: 'prek.pack-tens',
    title: 'Ten Buddies',
    emoji: '🌈',
    domain: 'decimals',
    levels: [
      level('prek.pack-tens.frame-more', 'Fill the Frame', 'multiple-choice', 2, (rng) => {
        const filled = randInt(rng, 3, 8);
        const need = 10 - filled;
        return numQ('multiple-choice', `The ten-frame has ${filled} dots. How many more to fill it up?`, need,
          pickChoices(rng, need, [filled, need + 1, need - 1, 10].filter((v) => v >= 1), { count: 4, min: 1, max: 10 }),
          { emoji: '🔵', groups: filled > 5 ? [5, filled - 5] : [filled] },
          'Count the empty spots!');
      }, 5),
      level('prek.pack-tens.partner', 'Ten Partner', 'multiple-choice', 2, (rng) => {
        const a = randInt(rng, 1, 9);
        const b = 10 - a;
        return numQ('multiple-choice', `${a} and ___ make 10!`, b,
          pickChoices(rng, b, [a, b + 1, b - 1, 10].filter((v) => v >= 1), { count: 4, min: 1, max: 10 }),
          { text: `${a} + ❓ = 10` }, 'Count up from the number to 10!');
      }),
      level('prek.pack-tens.type', 'Type the Partner', 'number-pad', 2, (rng) => {
        const a = randInt(rng, 1, 9);
        return numPad(`${a} + ❓ = 10. Type the missing number!`, 10 - a,
          { visual: { text: `${a} + ❓ = 10` }, hint: 'Count up to 10!' });
      }),
      level('prek.pack-tens.tf', 'Makes Ten?', 'true-false', 3, (rng) => {
        const a = randInt(rng, 1, 9);
        const b = randInt(rng, 0, 1) === 0
          ? 10 - a
          : choose(rng, [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((v) => v !== 10 - a));
        return trueFalse(`Do ${a} and ${b} make 10?`, a + b === 10,
          { visual: { text: `${a} + ${b}` }, hint: 'Count them together — is it exactly 10?' });
      }),
      level('prek.pack-tens.match', 'Ten Buddy Match', 'match-pairs', 3, (rng) => {
        const parts = chooseDistinct(rng, [1, 2, 3, 4, 5], 4);
        return { ...matchPairs('Match the numbers that make 10 together!',
          parts.map((p) => ({ left: String(p), right: String(10 - p) }))),
          hint: 'Ten buddies are two numbers that add to 10!' };
      }),
      level('prek.pack-tens.pick-pair', 'Pick the Pair', 'multiple-choice', 3, (rng) => {
        const a = randInt(rng, 1, 9);
        const wrongs = chooseDistinct(rng, [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((v) => v !== a && v !== 10 - a), 2);
        return mc('Which pair makes exactly 10?', `${a} + ${10 - a}`,
          wrongs.map((w) => `${a} + ${w}`), rng,
          { hint: 'Count each pair — which one lands on 10?' });
      }),
      level('prek.pack-tens.buddies-order', 'Buddy Order', 'order-sequence', 3, (rng) => {
        const start = randInt(rng, 1, 3);
        const seq = Array.from({ length: 4 }, (_, i) => `${start + i} + ${10 - start - i}`);
        return { ...orderSeq('Put the ten-buddies in order — smallest first number first!', seq),
          hint: 'The first number counts up: 1, 2, 3...' };
      }),
      level('prek.pack-tens.count-frame', 'Count the Empty', 'count-tap', 3, (rng) => {
        const filled = randInt(rng, 2, 8);
        const need = 10 - filled;
        return numQ('count-tap', 'The ten-frame is partly full. How many more make 10?', need,
          pickChoices(rng, need, [filled, need + 1, need - 1].filter((v) => v >= 1), { count: 4, min: 1, max: 10 }),
          { emoji: '🔵', groups: filled > 5 ? [5, filled - 5] : [filled] },
          'The frame holds 10 — count what is missing!');
      }),
      level('prek.pack-tens.gap', 'Count to 10 Gap', 'multiple-choice', 3, (rng) => {
        const n = randInt(rng, 2, 9);
        return numQ('multiple-choice', `Counting to 10: ${n - 1}, ❓, ${n + 1} — what is missing?`, n,
          pickChoices(rng, n, [n - 1, n + 1, 10], { count: 4, min: 1, max: 10 }),
          { text: `${n - 1}, ❓, ${n + 1}` }, 'Say the numbers in order!');
      }),
    ],
  },
  {
    id: 'prek.pack-shapes',
    title: 'Shape Safari',
    emoji: '🔷',
    domain: 'geometry',
    levels: [
      level('prek.pack-shapes.find', 'Shape Find', 'multiple-choice', 1, (rng) => {
        const shape = choose(rng, PACK_SHAPES);
        const distractors = chooseDistinct(rng, PACK_SHAPES.filter((s) => s !== shape), 3);
        return mc(`Tap the ${shape.name}!`, `${shape.glyph} ${shape.name}`,
          distractors.map((s) => `${s.glyph} ${s.name}`), rng,
          { hint: `The ${shape.name} looks like ${shape.glyph}!` });
      }, 5),
      level('prek.pack-shapes.name-it', 'Name That Shape', 'multiple-choice', 1, (rng) => {
        const shape = choose(rng, PACK_SHAPES);
        const distractors = chooseDistinct(rng, PACK_SHAPES.filter((s) => s !== shape), 3);
        return mc('What shape is this?', shape.name,
          distractors.map((s) => s.name), rng,
          { visual: { text: shape.glyph }, hint: 'Say its name out loud!' });
      }, 5),
      level('prek.pack-shapes.object', 'Shape in the World', 'multiple-choice', 1, (rng) => {
        const entry = choose(rng, PACK_SHAPE_OBJECTS);
        const object = choose(rng, entry.items);
        const shape = PACK_SHAPES.find((s) => s.name === entry.shape)!;
        const distractors = chooseDistinct(rng, PACK_SHAPES.filter((s) => s !== shape), 3);
        return mc(`The ${object} is shaped like a...`, `${shape.glyph} ${shape.name}`,
          distractors.map((s) => `${s.glyph} ${s.name}`), rng,
          { hint: 'Look at the edges — what shape do you see?' });
      }),
      level('prek.pack-shapes.sides', 'Count the Sides', 'multiple-choice', 2, (rng) => {
        const shape = choose(rng, [
          { name: 'triangle', sides: 3 },
          { name: 'square', sides: 4 },
          { name: 'rectangle', sides: 4 },
        ]);
        return numQ('multiple-choice', `How many sides does a ${shape.name} have?`, shape.sides,
          pickChoices(rng, shape.sides, [shape.sides + 1, shape.sides - 1, 3, 4, 0], { count: 4, min: 0, max: 6 }),
          { text: shape.name === 'triangle' ? '🔺' : shape.name === 'square' ? '🟦' : '▬' },
          'Trace each side with your finger and count!');
      }),
      level('prek.pack-shapes.corners', 'Count the Corners', 'multiple-choice', 2, (rng) => {
        const shape = choose(rng, [
          { name: 'circle', glyph: '🔴', corners: 0 },
          { name: 'oval', glyph: '🥚', corners: 0 },
          { name: 'triangle', glyph: '🔺', corners: 3 },
          { name: 'square', glyph: '🟦', corners: 4 },
          { name: 'rectangle', glyph: '▬', corners: 4 },
          { name: 'diamond', glyph: '🔷', corners: 4 },
        ]);
        return numQ('multiple-choice', `How many corners does a ${shape.name} have?`, shape.corners,
          pickChoices(rng, shape.corners, [shape.corners + 1, shape.corners - 1, 0, 3, 4, 5], { count: 4, min: 0, max: 6 }),
          { text: shape.glyph }, 'Touch each pointy corner and count!');
      }),
      level('prek.pack-shapes.match-name', 'Shape Name Match', 'match-pairs', 2, (rng) => {
        const shapes = chooseDistinct(rng, PACK_SHAPES, 4);
        return { ...matchPairs('Match each shape to its name!',
          shapes.map((s) => ({ left: s.glyph, right: s.name }))),
          hint: 'Say the name as you tap each shape!' };
      }),
      level('prek.pack-shapes.same-as', 'Same Shape', 'multiple-choice', 2, (rng) => {
        const shape = choose(rng, PACK_SHAPES);
        const distractors = chooseDistinct(rng, PACK_SHAPES.filter((s) => s !== shape), 3);
        return mc('Which one is the SAME shape?', shape.glyph,
          distractors.map((s) => s.glyph), rng,
          { visual: { text: shape.glyph }, hint: 'Match it to the big shape!' });
      }),
      level('prek.pack-shapes.where', 'Where Is It?', 'multiple-choice', 2, (rng) => {
        const pair = choose(rng, POSITION_PAIRS);
        const pos = choose(rng, ['on', 'under', 'next to'] as const);
        const scene = pos === 'on' ? `${pair.thing}\n${pair.place}`
          : pos === 'under' ? `${pair.place}\n${pair.thing}` : `${pair.thing}   ${pair.place}`;
        return mc(`Where is the ${pair.thing}?`, pos,
          ['on', 'under', 'next to', 'behind', 'in'].filter((w) => w !== pos), rng,
          { visual: { text: scene }, hint: 'Is it on top, below, or beside?' });
      }),
      level('prek.pack-shapes.pick-scene', 'Put It There!', 'multiple-choice', 3, (rng) => {
        const pair = choose(rng, POSITION_PAIRS);
        const pos = choose(rng, ['on', 'under', 'next to'] as const);
        const scenes: Record<string, string> = {
          on: `${pair.thing}\n${pair.place}`,
          under: `${pair.place}\n${pair.thing}`,
          'next to': `${pair.thing}   ${pair.place}`,
        };
        return mc(`Put the ${pair.thing} ${pos.toUpperCase()} the ${pair.place}! Which picture?`, scenes[pos],
          ['on', 'under', 'next to'].filter((w) => w !== pos).map((w) => scenes[w]), rng,
          { hint: `Does the ${pair.thing} sit on top or below?` });
      }),
      level('prek.pack-shapes.shape-tf', 'Shape or Not?', 'true-false', 3, (rng) => {
        const entry = choose(rng, PACK_SHAPE_OBJECTS);
        const object = choose(rng, entry.items);
        const claim = randInt(rng, 0, 1) === 0
          ? entry.shape
          : choose(rng, PACK_SHAPES.filter((s) => s.name !== entry.shape)).name;
        return trueFalse(`Is the ${object} a ${claim}?`, claim === entry.shape,
          { hint: 'Look at its outline!' });
      }),
      level('prek.pack-shapes.side-order', 'Side Order', 'order-sequence', 3, (rng) => {
        const sets = [
          ['🔴 circle (0)', '🔺 triangle (3)', '🟦 square (4)'],
          ['🥚 oval (0)', '🔺 triangle (3)', '▬ rectangle (4)'],
          ['🔴 circle (0)', '🔺 triangle (3)', '🔷 diamond (4)'],
        ] as const;
        return { ...orderSeq('Order the shapes — fewest sides first!', [...choose(rng, sets)]),
          hint: 'Count the sides of each shape!' };
      }),
      level('prek.pack-shapes.rolls', 'Roll or Slide?', 'multiple-choice', 3, (rng) => {
        const roller = choose(rng, ROLLERS);
        const sliders = chooseDistinct(rng, SLIDERS, 3);
        return mc('Which one can ROLL?', roller, sliders, rng,
          { hint: 'Round things roll — flat and cornered things slide!' });
      }),
    ],
  },
  {
    id: 'prek.pack-measure',
    title: 'Size Up!',
    emoji: '🦒',
    domain: 'measurement',
    levels: [
      level('prek.pack-measure.heavy', 'Heavy Pick', 'multiple-choice', 1, (rng) => {
        const heavy = choose(rng, HEAVY_THINGS);
        const light = chooseDistinct(rng, LIGHT_THINGS, 3);
        return mc('Which one is HEAVY?', heavy, [...light], rng,
          { hint: 'Heavy things are hard to pick up!' });
      }, 5),
      level('prek.pack-measure.light', 'Light Pick', 'multiple-choice', 1, (rng) => {
        const light = choose(rng, LIGHT_THINGS);
        const heavies = chooseDistinct(rng, HEAVY_THINGS, 3);
        return mc('Which one is LIGHT?', light, [...heavies], rng,
          { hint: 'Light things float or are easy to carry!' });
      }, 5),
      level('prek.pack-measure.holds', 'Holds More', 'multiple-choice', 1, (rng) => {
        const [a, b] = chooseDistinct(rng, CONTAINERS, 2);
        const sizes: Record<string, number> = { spoon: 1, cup: 2, bucket: 3, bathtub: 4 };
        const answer = sizes[a.name] > sizes[b.name] ? a : b;
        return mc(`Which holds MORE water — the ${a.name} ${a.emoji} or the ${b.name} ${b.emoji}?`,
          `${answer.emoji} ${answer.name}`, [`${answer === a ? b.emoji : a.emoji} ${answer === a ? b.name : a.name}`], rng,
          { hint: 'Which one is bigger inside?' });
      }, 5),
      level('prek.pack-measure.taller', 'Taller Please', 'multiple-choice', 2, (rng) => {
        const tall = choose(rng, TALL_THINGS);
        const shorts = chooseDistinct(rng, SHORT_THINGS, 3);
        return mc('Which one is TALLER?', tall, [...shorts], rng,
          { hint: 'Tall things reach high up!' });
      }),
      level('prek.pack-measure.longer', 'Longer Please', 'multiple-choice', 2, (rng) => {
        const long = choose(rng, LONG_THINGS);
        const tinies = chooseDistinct(rng, TINY_THINGS, 3);
        return mc('Which one is LONGER?', long, [...tinies], rng,
          { hint: 'Long things stretch far!' });
      }),
      level('prek.pack-measure.heavy-tf', 'Heavy or Not?', 'true-false', 2, (rng) => {
        const heavy = choose(rng, HEAVY_THINGS);
        const light = choose(rng, LIGHT_THINGS);
        const first = randInt(rng, 0, 1) === 0 ? heavy : light;
        const second = first === heavy ? light : heavy;
        return trueFalse(`Is the ${first} heavier than the ${second}?`, first === heavy,
          { hint: 'Think about picking them up!' });
      }),
      level('prek.pack-measure.order-size', 'Size Line-Up', 'order-sequence', 2, (rng) => {
        const sets = [
          ['🐜', '🐶', '🐘'],
          ['🐛', '🐱', '🐴'],
          ['🌱', '🌷', '🌳'],
          ['🐭', '🐕', '🐄'],
        ] as const;
        return { ...orderSeq('Line them up — smallest to biggest!', [...choose(rng, sets)]),
          hint: 'Start with the tiniest!' };
      }),
      level('prek.pack-measure.heaviest', 'The Heaviest!', 'multiple-choice', 3, (rng) => {
        const heavy = choose(rng, HEAVY_THINGS);
        const others = chooseDistinct(rng, [...LIGHT_THINGS, ...SMALL_THINGS], 3);
        return mc('Which is the HEAVIEST?', heavy, others, rng,
          { hint: 'Which would be hardest to lift?' });
      }),
      level('prek.pack-measure.lightest', 'The Lightest!', 'multiple-choice', 3, (rng) => {
        const light = choose(rng, LIGHT_THINGS);
        const others = chooseDistinct(rng, HEAVY_THINGS, 3);
        return mc('Which is the LIGHTEST?', light, others, rng,
          { hint: 'Which could float away?' });
      }),
      level('prek.pack-measure.order-tall', 'Tall Order', 'order-sequence', 3, (rng) => {
        const sets = [
          ['🍄', '🐕', '🦒'],
          ['🌷', '🏠', '🗼'],
          ['🐣', '🐕', '🏢'],
          ['🌱', '🌵', '🌳'],
        ] as const;
        return { ...orderSeq('Line them up — shortest to tallest!', [...choose(rng, sets)]),
          hint: 'Look at how high each one reaches!' };
      }),
      level('prek.pack-measure.order-holds', 'Fill Order', 'order-sequence', 3, (rng) => {
        const sizes: Record<string, number> = { spoon: 1, cup: 2, bucket: 3, bathtub: 4 };
        const picked = chooseDistinct(rng, CONTAINERS, randInt(rng, 3, 4))
          .sort((a, b) => sizes[a.name] - sizes[b.name]);
        return { ...orderSeq('Order by how much water they hold — least to most!',
          picked.map((c) => `${c.emoji} ${c.name}`)),
          hint: 'A spoon holds just a sip — a bathtub holds lots!' };
      }),
      level('prek.pack-measure.small-pick', 'Small Pick', 'multiple-choice', 3, (rng) => {
        const small = choose(rng, SMALL_THINGS);
        const bigs = chooseDistinct(rng, [...TALL_THINGS, ...HEAVY_THINGS], 3);
        return mc('Which one is the SMALLEST?', small, bigs, rng,
          { hint: 'Which fits in your pocket?' });
      }),
    ],
  },
  {
    id: 'prek.pack-data',
    title: 'Sort & Count',
    emoji: '📊',
    domain: 'data',
    levels: [
      level('prek.pack-data.more', 'Chart: More', 'multiple-choice', 1, (rng) => {
        const [first, second] = chooseDistinct(rng, FRUIT, 2);
        const [a, b] = chooseDistinct(rng, [1, 2, 3, 4, 5, 6, 7], 2);
        const answer = a > b ? first : second;
        return mc(`We counted fruit! Did we get more ${first} or more ${second}? Look — which row is longer?`, answer,
          [answer === first ? second : first], rng,
          { visual: twoRows(first, a, second, b), hint: 'The longer row has more!' });
      }, 5),
      level('prek.pack-data.fewer', 'Chart: Fewer', 'multiple-choice', 1, (rng) => {
        const [first, second] = chooseDistinct(rng, FRUIT, 2);
        const [a, b] = chooseDistinct(rng, [1, 2, 3, 4, 5, 6, 7], 2);
        const answer = a < b ? first : second;
        return mc(`Look at the picture chart! Which did we collect fewer of — ${first} or ${second}?`, answer,
          [answer === first ? second : first], rng,
          { visual: twoRows(first, a, second, b), hint: 'The shorter row has fewer!' });
      }, 5),
      level('prek.pack-data.all-color', 'All One Color', 'multiple-choice', 1, (rng) => {
        const group = choose(rng, COLOR_GROUPS);
        const right = chooseDistinct(rng, group.items, 3).join(' ');
        const others = chooseDistinct(rng, COLOR_GROUPS.filter((g) => g !== group), 2);
        const wrongs = others.map((g) => {
          const mixed = [choose(rng, g.items), choose(rng, group.items), choose(rng, g.items)];
          return mixed.join(' ');
        });
        return mc(`Sort by color! Which row is ALL ${group.name}?`, right, wrongs, rng,
          { visual: { text: group.square }, hint: `Everything in the row must be ${group.name}!` });
      }),
      level('prek.pack-data.belongs', 'It Belongs!', 'multiple-choice', 2, (rng) => {
        const group = choose(rng, COLOR_GROUPS);
        const item = choose(rng, group.items);
        const others = chooseDistinct(rng, COLOR_GROUPS.filter((g) => g !== group), 3)
          .map((g) => choose(rng, g.items));
        return mc(`Sort it! Which belongs in the ${group.square} ${group.name} pile?`, item, others, rng,
          { hint: 'Look at its color, not what it is!' });
      }),
      level('prek.pack-data.row-count', 'Count the Row', 'multiple-choice', 2, (rng) => {
        const fruit = chooseDistinct(rng, FRUIT, 3);
        const counts = chooseDistinct(rng, [1, 2, 3, 4, 5, 6, 7], 3);
        const target = randInt(rng, 0, 2);
        const answer = counts[target];
        return numQ('multiple-choice', `Our chart shows three rows! How many ${fruit[target]} are there?`, answer,
          pickChoices(rng, answer, counts.filter((_, i) => i !== target), { count: 4, min: 1, max: 9 }),
          { text: fruit.map((f, i) => repeat(f, counts[i])).join('\n') },
          'Only count the row it asks about!');
      }),
      level('prek.pack-data.chart-most', 'Most Picked', 'multiple-choice', 2, (rng) => {
        const pets = chooseDistinct(rng, ['🐶', '🐱', '🐰', '🐠', '🐹'], 3);
        const counts = chooseDistinct(rng, [1, 2, 3, 4, 5, 6, 7], 3);
        const best = counts.indexOf(Math.max(...counts));
        return mc('Friends voted for pets! Which pet got the MOST votes?', pets[best],
          pets.filter((_, i) => i !== best), rng,
          { visual: { text: pets.map((p, i) => repeat(p, counts[i])).join('\n') },
            hint: 'Each emoji is one vote — the longest row wins!' });
      }),
      level('prek.pack-data.sort-shape', 'Shape Piles', 'multiple-choice', 2, (rng) => {
        const shape = choose(rng, PACK_SHAPES);
        const right = repeat(shape.glyph, 3);
        const wrongShapes = chooseDistinct(rng, PACK_SHAPES.filter((s) => s !== shape), 2);
        const wrongs = wrongShapes.map((s) => `${shape.glyph} ${s.glyph} ${shape.glyph}`);
        return mc(`Sort by shape! Which row is ALL ${shape.name}s?`, right, wrongs, rng,
          { hint: `Every piece must be a ${shape.name}!` });
      }),
      level('prek.pack-data.how-many-more', 'How Many More', 'multiple-choice', 3, (rng) => {
        const [first, second] = chooseDistinct(rng, FRUIT, 2);
        const b = randInt(rng, 1, 5);
        const diff = randInt(rng, 1, 3);
        const a = b + diff;
        return numQ('multiple-choice', `The chart shows our fruit! How many MORE ${first} than ${second}?`, diff,
          pickChoices(rng, diff, [diff + 1, diff - 1, a, b].filter((v) => v >= 1), { count: 4, min: 1, max: 8 }),
          twoRows(first, a, second, b), 'Pair them up and count the extras!');
      }),
      level('prek.pack-data.type-row', 'Type the Row', 'number-pad', 3, (rng) => {
        const fruit = chooseDistinct(rng, FRUIT, 3);
        const counts = chooseDistinct(rng, [2, 3, 4, 5, 6, 7, 8], 3);
        const target = randInt(rng, 0, 2);
        return numPad(`Read the chart! Type how many ${fruit[target]} we counted.`, counts[target],
          { visual: { text: fruit.map((f, i) => repeat(f, counts[i])).join('\n') },
            hint: `Only count the ${fruit[target]} row!` });
      }),
      level('prek.pack-data.match', 'Chart Match', 'match-pairs', 3, (rng) => {
        const fruit = chooseDistinct(rng, FRUIT, 3);
        const counts = randInts(rng, 1, 8, 3);
        return { ...matchPairs('Match each row to its count!',
          fruit.map((f, i) => ({ left: `${f} row`, right: String(counts[i]) }))),
          hint: 'Count each row, then find its number!' };
      }),
    ],
  },
  {
    id: 'prek.pack-money',
    title: 'Piggy Bank',
    emoji: '🐷',
    domain: 'money',
    levels: [
      level('prek.pack-money.is-money', 'Spot the Money', 'multiple-choice', 1, (rng) => {
        const money = choose(rng, MONEY_ITEMS);
        const others = chooseDistinct(rng, TOYS, 3);
        return mc('Which one is money?', money, others, rng,
          { hint: 'Money is what we use to buy things!' });
      }, 5),
      level('prek.pack-money.coin-find', 'Find the Coin', 'multiple-choice', 1, (rng) => {
        const money = choose(rng, MONEY_ITEMS);
        const name = money === '🪙' ? 'coin' : money === '💵' ? 'dollar bill' : 'card';
        const others = chooseDistinct(rng, [...TOYS, ...HOUSEHOLD], 3);
        return mc(`Tap the ${name}!`, money, others, rng,
          { hint: 'A coin is round and shiny — and it is money!' });
      }, 5),
      level('prek.pack-money.buy-with', 'What Buys Things?', 'multiple-choice', 1, (rng) => {
        const treat = choose(rng, ['a toy 🧸', 'ice cream 🍦', 'a book 📚', 'a ball ⚽']);
        const others = chooseDistinct(rng, ['A banana 🍌', 'A rock 🪨', 'A teddy 🧸', 'A crayon 🖍️'], 3);
        return mc(`What do we use to buy ${treat} at the store?`, 'Money! 🪙', others, rng,
          { hint: 'We trade money for things we want!' });
      }),
      level('prek.pack-money.count-coins', 'Count the Coins', 'count-tap', 2, (rng) => {
        const count = randInt(rng, 2, 8);
        return numQ('count-tap', 'How many coins are in the piggy bank?', count,
          pickChoices(rng, count, [count - 1, count + 1, count + 2], { count: 4, min: 1, max: 10 }),
          { emoji: '🪙', count }, 'Count each shiny coin!');
      }),
      level('prek.pack-money.money-tf', 'Money or Not?', 'true-false', 2, (rng) => {
        const item = choose(rng, [...MONEY_ITEMS, ...TOYS, ...HOUSEHOLD]);
        const isMoney = MONEY_ITEMS.includes(item as (typeof MONEY_ITEMS)[number]);
        return trueFalse(`Is this money? ${item}`, isMoney,
          { hint: 'Money is coins and dollar bills!' });
      }),
      level('prek.pack-money.all-money', 'All Money Row', 'multiple-choice', 2, (rng) => {
        const right = `${choose(rng, MONEY_ITEMS)} ${choose(rng, MONEY_ITEMS)} ${choose(rng, MONEY_ITEMS)}`;
        const wrongs = [
          `${choose(rng, MONEY_ITEMS)} ${choose(rng, TOYS)} ${choose(rng, MONEY_ITEMS)}`,
          `${choose(rng, TOYS)} ${choose(rng, TOYS)} ${choose(rng, TOYS)}`,
        ];
        return mc('Which row is ALL money?', right, [...new Set(wrongs)], rng,
          { hint: 'Every single thing in the row must be money!' });
      }),
      level('prek.pack-money.not-money', 'Not Money', 'multiple-choice', 3, (rng) => {
        const toy = choose(rng, TOYS);
        const monies = chooseDistinct(rng, MONEY_ITEMS, 2);
        return mc('Which one is NOT money?', toy, monies, rng,
          { hint: 'Two of them are money — one is not!' });
      }),
      level('prek.pack-money.piggy-job', 'Piggy Job', 'multiple-choice', 3, (rng) => {
        const prompt = choose(rng, ['What does a piggy bank 🐷 do?', 'Where do we keep saved money?', 'What saves our coins?']);
        const answer = choose(rng, ['Keeps coins safe! 🪙', 'Saves money! 🐷']);
        const others = chooseDistinct(rng, ['Eats snacks 🍪', 'Plays music 🎵', 'Grows flowers 🌼', 'Drinks water 💧'], 2);
        return mc(prompt, answer, others, rng,
          { hint: 'A piggy bank saves money for later!' });
      }),
      level('prek.pack-money.money-order', 'Save It Up', 'order-sequence', 3, (rng) => {
        const steps = choose(rng, [
          ['Get coins 🪙', 'Put them in the piggy 🐷', 'Buy a treat 🍦'],
          ['Earn a coin 🪙', 'Save it in the bank 🏦', 'Buy a gift 🎁'],
          ['Find a coin 🪙', 'Drop it in the piggy 🐷', 'Buy a toy 🧸'],
        ] as const);
        return { ...orderSeq('Put the steps in order!', [...steps]),
          hint: 'First you get money, then you save it, then you spend it!' };
      }),
    ],
  },
  {
    id: 'prek.pack-time',
    title: 'Day & Night',
    emoji: '🌞',
    domain: 'time',
    levels: [
      level('prek.pack-time.sun-when', 'Sun Time', 'multiple-choice', 1, (rng) => {
        const askSun = randInt(rng, 0, 1) === 0;
        return mc(askSun ? 'When do we see the sun ☀️?' : 'When do we see the moon 🌙?',
          askSun ? 'In the day! ☀️' : 'At night 🌙',
          [askSun ? 'At night 🌙' : 'In the day! ☀️'], rng,
          { hint: 'The sun is up in the day — the moon at night!' });
      }, 4),
      level('prek.pack-time.sleep-when', 'Sleepy Time', 'multiple-choice', 1, (rng) => {
        const askSleep = randInt(rng, 0, 1) === 0;
        const wrongs = askSleep
          ? ['In the morning ☀️', 'At lunch 🍽️', 'At the park 🛝']
          : ['At night 🌙', 'At dinner 🍽️', 'In the bath 🛁'];
        return mc(askSleep ? 'When do we sleep? 😴' : 'When do we wake up? 🥱',
          askSleep ? 'At night 🌙' : 'In the morning ☀️', chooseDistinct(rng, wrongs, 2), rng,
          { hint: 'We sleep when it is dark — we wake when it is light!' });
      }, 4),
      level('prek.pack-time.morning-do', 'Morning Do', 'multiple-choice', 1, (rng) => {
        const morning = randInt(rng, 0, 1) === 0;
        const answer = morning ? choose(rng, ['Wake up! 🥱', 'Eat breakfast 🥣']) : 'See the moon 🌙';
        const pool = morning
          ? ['Look at stars ⭐', 'Go to sleep 😴', 'Eat dinner 🍽️']
          : ['Eat breakfast 🍳', 'Play at the park 🛝', 'Go to school 🏫'];
        return mc(morning ? 'What do we do in the MORNING?' : 'What do we do at NIGHT?', answer,
          chooseDistinct(rng, pool.filter((p) => p !== answer), 3), rng,
          { hint: morning ? 'Morning is when the day starts!' : 'Night is dark — moon and sleep!' });
      }),
      level('prek.pack-time.night-do', 'Night Do', 'multiple-choice', 2, (rng) => {
        const answer = choose(rng, ['Sleep! 😴', 'Take a bath 🛁', 'Eat dinner 🍽️']);
        const others = chooseDistinct(rng, ['Eat breakfast 🍳', 'Play at the park 🛝', 'Go to school 🏫'], 3);
        return mc('What do we do at NIGHT?', answer, others, rng,
          { hint: 'Night is dark — dinner, bath, and bed!' });
      }),
      level('prek.pack-time.day-tf', 'Day or Night?', 'true-false', 2, (rng) => {
        const claim = choose(rng, DAY_CLAIMS);
        return trueFalse(claim.text, claim.value,
          { hint: 'Think about your day!' });
      }),
      level('prek.pack-time.order-morning', 'Morning Order', 'order-sequence', 2, (rng) => {
        const routines = [
          ['Wake up 🥱', 'Brush teeth 🪥', 'Eat breakfast 🥣', 'Get dressed 👕'],
          ['Wake up 🥱', 'Get dressed 👕', 'Eat breakfast 🥣', 'Go play 🎈'],
          ['Wake up 🥱', 'Eat breakfast 🥣', 'Brush teeth 🪥', 'Go to school 🏫'],
        ] as const;
        return { ...orderSeq('Put the morning in order!', [...choose(rng, routines)]),
          hint: 'First your eyes open!' };
      }),
      level('prek.pack-time.order-night', 'Bedtime Order', 'order-sequence', 2, (rng) => {
        const routines = [
          ['Eat dinner 🍽️', 'Take a bath 🛁', 'Brush teeth 🪥', 'Go to sleep 😴'],
          ['Eat dinner 🍽️', 'Brush teeth 🪥', 'Read a story 📖', 'Go to sleep 😴'],
          ['Take a bath 🛁', 'Put on pajamas 🩳', 'Brush teeth 🪥', 'Go to sleep 😴'],
        ] as const;
        return { ...orderSeq('Put the bedtime routine in order!', [...choose(rng, routines)]),
          hint: 'Sleep is always last!' };
      }),
      level('prek.pack-time.first-do', 'First Thing', 'multiple-choice', 3, (rng) => {
        const morning = randInt(rng, 0, 1) === 0;
        const answer = morning ? 'Wake up! 🥱' : 'Eat dinner 🍽️';
        const pool = morning
          ? ['Eat breakfast 🥣', 'Brush teeth 🪥', 'Get dressed 👕', 'Go play 🎈']
          : ['Take a bath 🛁', 'Brush teeth 🪥', 'Go to sleep 😴', 'Read a story 📖'];
        return mc(morning ? 'What do we do FIRST in the morning?' : 'What do we do FIRST at bedtime?', answer,
          chooseDistinct(rng, pool, 3), rng,
          { hint: 'What starts the routine?' });
      }),
      level('prek.pack-time.last-do', 'Last Thing', 'multiple-choice', 3, (rng) => {
        const night = randInt(rng, 0, 1) === 0;
        const answer = night ? 'Sleep! 😴' : 'Go play! 🎈';
        const pool = night
          ? ['Take a bath 🛁', 'Eat dinner 🍽️', 'Brush teeth 🪥']
          : ['Wake up 🥱', 'Eat breakfast 🥣', 'Brush teeth 🪥'];
        return mc(night ? 'What do we do LAST at night?' : 'What do we do LAST in the morning?', answer,
          chooseDistinct(rng, pool, 3), rng,
          { hint: 'What finishes the routine?' });
      }),
      level('prek.pack-time.after-wake', 'Then What?', 'multiple-choice', 3, (rng) => {
        const steps = choose(rng, [
          ['Wake up 🥱', 'Eat breakfast 🥣'],
          ['Eat dinner 🍽️', 'Take a bath 🛁'],
          ['Take a bath 🛁', 'Brush teeth 🪥'],
          ['Brush teeth 🪥', 'Go to sleep 😴'],
          ['Eat breakfast 🥣', 'Get dressed 👕'],
        ] as const);
        const [did, next] = steps;
        const others = chooseDistinct(rng, ['Take a bath 🛁', 'Eat breakfast 🥣', 'Brush teeth 🪥', 'Go to sleep 😴', 'Get dressed 👕']
          .filter((s) => s !== did && s !== next), 3);
        return mc(`We ${did.split(' ')[0].toLowerCase() === 'wake' ? 'just woke up 🥱' : `just did this: ${did}`}. What comes next?`, next, others, rng,
          { hint: 'Think about your routine — what happens after?' });
      }),
    ],
  },
  {
    id: 'prek.pack-patterns',
    title: 'Pattern Party',
    emoji: '🎉',
    domain: 'patterns',
    levels: [
      level('prek.pack-patterns.ab-next', 'AB Next', 'multiple-choice', 1, (rng) => {
        const set = choose(rng, PACK_PATTERN_SETS);
        const [first, second, extra] = chooseDistinct(rng, set, 3);
        const length = randInt(rng, 5, 7);
        const answer = [first, second][length % 2];
        return mc('What comes next?', answer,
          [first, second, extra].filter((item) => item !== answer), rng,
          { visual: { items: [...Array.from({ length }, (_, i) => [first, second][i % 2]), '❓'] },
            hint: 'Say the pattern out loud!' });
      }, 5),
      level('prek.pack-patterns.ab-two', 'Two Come Next', 'multiple-choice', 1, (rng) => {
        const set = choose(rng, PACK_PATTERN_SETS);
        const [first, second] = chooseDistinct(rng, set, 2);
        const length = choose(rng, [4, 5]);
        const nextTwo = `${[first, second][length % 2]} ${[first, second][(length + 1) % 2]}`;
        const wrongs = [`${first} ${first}`, `${second} ${second}`, `${[first, second][(length + 1) % 2]} ${[first, second][length % 2]}`];
        return mc('What TWO come next?', nextTwo, [...new Set(wrongs)], rng,
          { visual: { items: [...Array.from({ length }, (_, i) => [first, second][i % 2]), '❓', '❓'] },
            hint: 'Keep the A-B, A-B going!' });
      }),
      level('prek.pack-patterns.aab', 'AAB Next', 'multiple-choice', 2, (rng) => {
        const set = choose(rng, PACK_PATTERN_SETS);
        const [first, second, extra] = chooseDistinct(rng, set, 3);
        const core = [first, first, second];
        const length = randInt(rng, 6, 7);
        const answer = core[length % 3];
        return mc('What comes next?', answer,
          [first, second, extra].filter((item) => item !== answer), rng,
          { visual: { items: [...Array.from({ length }, (_, i) => core[i % 3]), '❓'] },
            hint: 'Two of the same, then the other!' });
      }),
      level('prek.pack-patterns.abb', 'ABB Next', 'multiple-choice', 2, (rng) => {
        const set = choose(rng, PACK_PATTERN_SETS);
        const [first, second, extra] = chooseDistinct(rng, set, 3);
        const core = [first, second, second];
        const length = randInt(rng, 6, 7);
        const answer = core[length % 3];
        return mc('What comes next?', answer,
          [first, second, extra].filter((item) => item !== answer), rng,
          { visual: { items: [...Array.from({ length }, (_, i) => core[i % 3]), '❓'] },
            hint: 'One of one, two of the other!' });
      }),
      level('prek.pack-patterns.abc', 'ABC Next', 'multiple-choice', 2, (rng) => {
        const set = choose(rng, PACK_PATTERN_SETS);
        const [a, b, c] = chooseDistinct(rng, set, 3);
        const extra = choose(rng, set.filter((item) => item !== a && item !== b && item !== c));
        const core = [a, b, c];
        const length = randInt(rng, 5, 6);
        const answer = core[length % 3];
        return mc('What comes next?', answer,
          [a, b, c, extra].filter((item) => item !== answer), rng,
          { visual: { items: [...Array.from({ length }, (_, i) => core[i % 3]), '❓'] },
            hint: 'Three different friends take turns!' });
      }),
      level('prek.pack-patterns.which-ab', 'Which Is AB?', 'multiple-choice', 2, (rng) => {
        const set = choose(rng, PACK_PATTERN_SETS);
        const [first, second] = chooseDistinct(rng, set, 2);
        const right = `${first}${second}${first}${second}`;
        const wrongPool = [`${first}${first}${second}${second}`, `${first}${second}${second}${first}`, `${first}${first}${first}${second}`];
        const wrongs = chooseDistinct(rng, wrongPool.filter((w) => w !== right), 2);
        return mc('Which row is an AB pattern?', right, wrongs, rng,
          { hint: 'AB goes one, other, one, other!' });
      }),
      level('prek.pack-patterns.first-piece', 'Missing First', 'multiple-choice', 3, (rng) => {
        const set = choose(rng, PACK_PATTERN_SETS);
        const [first, second, extra] = chooseDistinct(rng, set, 3);
        const core = [first, second];
        const items: string[] = Array.from({ length: 6 }, (_, i) => core[i % 2]);
        items[0] = '❓';
        return mc('What is missing at the START?', first,
          [second, extra], rng,
          { visual: { items }, hint: 'Read the pattern backward!' });
      }),
      level('prek.pack-patterns.pattern-tf', 'Pattern True?', 'true-false', 3, (rng) => {
        const set = choose(rng, PACK_PATTERN_SETS);
        const [first, second, extra] = chooseDistinct(rng, set, 3);
        const length = randInt(rng, 4, 6);
        const real = [first, second][length % 2];
        const claim = randInt(rng, 0, 1) === 0 ? real : extra;
        return trueFalse(`Does ${claim} come next?`, claim === real,
          { visual: { items: [...Array.from({ length }, (_, i) => [first, second][i % 2]), '❓'] },
            hint: 'Say the pattern out loud!' });
      }),
      level('prek.pack-patterns.wrong-spot', 'Spot the Mistake', 'multiple-choice', 3, (rng) => {
        const set = choose(rng, PACK_PATTERN_SETS);
        const [first, second] = chooseDistinct(rng, set, 2);
        const items: string[] = Array.from({ length: 5 }, (_, i) => [first, second][i % 2]);
        const wrong = randInt(rng, 0, 4);
        items[wrong] = [first, second][(wrong + 1) % 2];
        return mc('Which piece is WRONG in the pattern?', ORDINAL_WORDS[wrong],
          ORDINAL_WORDS.filter((w) => w !== ORDINAL_WORDS[wrong]), rng,
          { visual: { items }, hint: 'Follow the pattern — where does it break?' });
      }),
      level('prek.pack-patterns.core-match', 'Core Match', 'match-pairs', 3, (rng) => {
        const [c1, c2] = chooseDistinct(rng, PACK_PATTERN_SETS, 2);
        const [a1, b1] = chooseDistinct(rng, c1, 2);
        const [a2, b2] = chooseDistinct(rng, c2, 2);
        const [a3, b3, c3] = chooseDistinct(rng, c1.filter((x) => x !== a1 && x !== b1).concat(c2.filter((x) => x !== a2 && x !== b2)), 3);
        const pairs = [
          { left: `${a1}${b1}${a1}${b1}`, right: `${a1}${b1}` },
          { left: `${a2}${b2}${b2}${a2}${b2}${b2}`, right: `${a2}${b2}${b2}` },
          { left: `${a3}${b3}${c3}${a3}${b3}${c3}`, right: `${a3}${b3}${c3}` },
        ];
        return { ...matchPairs('Match each pattern to the piece that repeats!', pairs),
          hint: 'Find the smallest piece that repeats!' };
      }),
      level('prek.pack-patterns.long-ab', 'Long AB', 'multiple-choice', 3, (rng) => {
        const set = choose(rng, PACK_PATTERN_SETS);
        const [first, second, extra] = chooseDistinct(rng, set, 3);
        const length = 8;
        const answer = [first, second][length % 2];
        return mc('What comes next in this long pattern?', answer,
          [first, second, extra].filter((item) => item !== answer), rng,
          { visual: { items: [...Array.from({ length }, (_, i) => [first, second][i % 2]), '❓'] },
            hint: 'The pattern never stops taking turns!' });
      }),
    ],
  },
  {
    id: 'prek.pack-stories',
    title: 'Story Counts',
    emoji: '📖',
    domain: 'word-problems',
    levels: [
      level('prek.pack-stories.count', 'Story Count', 'multiple-choice', 1, (rng) => {
        const story = choose(rng, STORY_CONTEXTS);
        const count = randInt(rng, 2, 7);
        return numQ('multiple-choice', `${count} ${story.emoji} ${story.noun} sit ${story.place}. How many ${story.noun}?`, count,
          pickChoices(rng, count, [count - 1, count + 1, count + 2], { count: 4, min: 1, max: 9 }),
          emojiVisual(story.emoji, count), 'Count each one in the story!');
      }, 5),
      level('prek.pack-stories.tap', 'Story Tap', 'count-tap', 1, (rng) => {
        const story = choose(rng, STORY_CONTEXTS);
        const count = randInt(rng, 3, 9);
        return numQ('count-tap', `The story has ${story.noun} ${story.place}! Tap-count them.`, count,
          pickChoices(rng, count, [count - 1, count + 1, count - 2], { count: 4, min: 1, max: 11 }),
          emojiVisual(story.emoji, count), 'Point and count each friend!');
      }),
      level('prek.pack-stories.one-more', 'One More Joins', 'multiple-choice', 2, (rng) => {
        const story = choose(rng, STORY_CONTEXTS);
        const a = randInt(rng, 1, 6);
        return numQ('multiple-choice',
          `${a} ${story.noun} ${story.place}. One more ${story.emoji} comes! How many ${story.noun} now?`, a + 1,
          pickChoices(rng, a + 1, [a, a + 2, a + 3], { count: 4, min: 1, max: 9 }),
          { emoji: story.emoji, groups: [a, 1] }, 'Just count one more!');
      }),
      level('prek.pack-stories.two-more', 'Two More Join', 'multiple-choice', 2, (rng) => {
        const story = choose(rng, STORY_CONTEXTS);
        const a = randInt(rng, 1, 6);
        return numQ('multiple-choice',
          `${a} ${story.noun} ${story.place}. Two more ${story.emoji} come! How many ${story.noun} now?`, a + 2,
          pickChoices(rng, a + 2, [a, a + 1, a + 3], { count: 4, min: 1, max: 9 }),
          { emoji: story.emoji, groups: [a, 2] }, 'Count on two more!');
      }),
      level('prek.pack-stories.one-away', 'One Goes Away', 'multiple-choice', 2, (rng) => {
        const story = choose(rng, STORY_CONTEXTS);
        const a = randInt(rng, 2, 7);
        return numQ('multiple-choice',
          `${a} ${story.noun} ${story.place}. One ${story.emoji} leaves! How many ${story.noun} stay?`, a - 1,
          pickChoices(rng, a - 1, [a, a + 1, a - 2], { count: 4, min: 0, max: 8 }),
          { emoji: story.emoji, count: a }, 'One goes away — count back one!');
      }),
      level('prek.pack-stories.altogether', 'All Together', 'multiple-choice', 2, (rng) => {
        const story = choose(rng, STORY_CONTEXTS);
        const a = randInt(rng, 1, 3);
        const b = randInt(rng, 1, 6 - a);
        return numQ('multiple-choice',
          `${a} ${story.noun} here and ${b} ${story.noun} there ${story.place}. How many ${story.noun} in all?`, a + b,
          pickChoices(rng, a + b, [a, b, a + b + 1], { count: 4, min: 1, max: 8 }),
          { emoji: story.emoji, groups: [a, b] }, 'Count both groups together!');
      }),
      level('prek.pack-stories.type', 'Type the Story', 'number-pad', 3, (rng) => {
        const story = choose(rng, STORY_CONTEXTS);
        const a = randInt(rng, 2, 5);
        const b = randInt(rng, 1, 8 - a);
        return numPad(`${a} ${story.noun} and ${b} more ${story.emoji} join ${story.place}. How many ${story.noun}? Type it!`, a + b,
          { visual: { emoji: story.emoji, groups: [a, b] }, hint: 'Count all of them!' });
      }),
      level('prek.pack-stories.story-tf', 'Story True?', 'true-false', 3, (rng) => {
        const story = choose(rng, STORY_CONTEXTS);
        const count = randInt(rng, 3, 8);
        const claim = randInt(rng, 0, 1) === 0 ? count : count + choose(rng, [-1, 1, 2]);
        return trueFalse(`${count} ${story.noun} ${story.place}. Is that ${claim} ${story.noun}?`, claim === count,
          { visual: emojiVisual(story.emoji, count), hint: 'Count them yourself!' });
      }),
      level('prek.pack-stories.two-away', 'Two Leave', 'multiple-choice', 3, (rng) => {
        const story = choose(rng, STORY_CONTEXTS);
        const a = randInt(rng, 3, 8);
        return numQ('multiple-choice',
          `${a} ${story.noun} ${story.place}. Two ${story.emoji} go away! How many ${story.noun} stay?`, a - 2,
          pickChoices(rng, a - 2, [a, a - 1, a - 3, a + 1].filter((v) => v >= 0), { count: 4, min: 0, max: 9 }),
          { emoji: story.emoji, count: a }, 'Count back two!');
      }),
      level('prek.pack-stories.who-more', 'Who Has More?', 'multiple-choice', 3, (rng) => {
        const kids = chooseDistinct(rng, [
          { name: 'Sam', emoji: '👦' }, { name: 'Mia', emoji: '👧' },
          { name: 'Leo', emoji: '🧒' }, { name: 'Ava', emoji: '👶' },
        ] as const, 2);
        const [a, b] = chooseDistinct(rng, [1, 2, 3, 4, 5, 6], 2);
        const snack = choose(rng, SNACKS);
        const answer = a > b ? `${kids[0].name} ${kids[0].emoji}` : `${kids[1].name} ${kids[1].emoji}`;
        return mc(`${kids[0].name} has ${a} ${snack} and ${kids[1].name} has ${b} ${snack}. Who has more?`, answer,
          [a > b ? `${kids[1].name} ${kids[1].emoji}` : `${kids[0].name} ${kids[0].emoji}`, 'Same! 🟰'], rng,
          { visual: twoRows(snack, a, snack, b), hint: 'Compare the two numbers!' });
      }),
    ],
  },
  {
    id: 'prek.pack-algebra',
    title: 'Missing Pieces',
    emoji: '🧩',
    domain: 'algebra',
    levels: [
      level('prek.pack-algebra.gap-num', 'Number Gap', 'multiple-choice', 2, (rng) => {
        const n = randInt(rng, 1, 6);
        const answer = n + 2;
        return numQ('multiple-choice', `${n}, ${n + 1}, ❓, ${n + 3} — what number is hiding?`, answer,
          pickChoices(rng, answer, [n, n + 1, n + 3, answer + 1], { count: 4, min: 1, max: 10 }),
          { text: `${n}, ${n + 1}, ❓, ${n + 3}` }, 'Count in order — which number is missing?');
      }),
      level('prek.pack-algebra.next-gap', 'Gap to Fill', 'multiple-choice', 2, (rng) => {
        const n = randInt(rng, 1, 7);
        return numQ('multiple-choice', `${n}, ${n + 1}, ❓ — what comes next?`, n + 2,
          pickChoices(rng, n + 2, [n, n + 1, n + 3], { count: 4, min: 1, max: 10 }),
          { text: `${n}, ${n + 1}, ❓` }, 'Keep counting up!');
      }),
      level('prek.pack-algebra.first-in-line', 'First in Line', 'multiple-choice', 2, (rng) => {
        const line = chooseDistinct(rng, PREK_CRITTERS, 4).map((c) => c.emoji);
        return mc('Who is FIRST in line?', line[0], line.slice(1), rng,
          { visual: { items: line }, hint: 'First means the very front!' });
      }),
      level('prek.pack-algebra.last-in-line', 'Last in Line', 'multiple-choice', 2, (rng) => {
        const line = chooseDistinct(rng, PREK_CRITTERS, 4).map((c) => c.emoji);
        return mc('Who is LAST in line?', line[3], line.slice(0, 3), rng,
          { visual: { items: line }, hint: 'Last means the very end!' });
      }),
      level('prek.pack-algebra.missing-two', 'Two Missing', 'multiple-choice', 3, (rng) => {
        const start = randInt(rng, 1, 5);
        const seq = [start, start + 1, start + 2, start + 3, start + 4];
        const shown = seq.map((v, i) => (i === 1 || i === 3 ? '❓' : String(v))).join(', ');
        const answer = `${seq[1]} and ${seq[3]}`;
        const wrongs = chooseDistinct(rng, [
          `${seq[0]} and ${seq[2]}`, `${seq[2]} and ${seq[4]}`,
          `${seq[1] - 1} and ${seq[3] - 1}`, `${seq[1] + 2} and ${seq[3] + 2}`,
        ], 3);
        return mc(`Two numbers are hiding: ${shown} — which two?`, answer, wrongs, rng,
          { hint: 'Count through the whole line!' });
      }),
      level('prek.pack-algebra.shape-gap', 'Shape Gap', 'multiple-choice', 3, (rng) => {
        const set = choose(rng, [SHAPE_PATTERN_SET, PATTERN_SETS.dino, PATTERN_SETS.fruit]);
        const [a, b, extra] = chooseDistinct(rng, set, 3);
        const core = randInt(rng, 0, 1) === 0 ? [a, b] : [a, b, b];
        const items: string[] = Array.from({ length: 6 }, (_, i) => core[i % core.length]);
        const missing = randInt(rng, 1, 4);
        const answer = core[missing % core.length];
        items[missing] = '❓';
        return mc('Which piece is missing?', answer,
          [a, b, extra].filter((item) => item !== answer), rng,
          { visual: { items }, hint: 'Find the repeating part first!' });
      }),
      level('prek.pack-algebra.equal-tf', 'Equal Plates?', 'true-false', 3, (rng) => {
        const equal = randInt(rng, 0, 1) === 0;
        const a = randInt(rng, 2, 6);
        const b = equal ? a : choose(rng, [1, 2, 3, 4, 5, 6].filter((v) => v !== a));
        return trueFalse('Are the two plates equal?', equal,
          { visual: { emoji: '🍪', groups: [a, b] }, hint: 'Equal means the same number on both sides!' });
      }),
      level('prek.pack-algebra.between', 'In Between', 'multiple-choice', 3, (rng) => {
        const n = randInt(rng, 1, 8);
        return numQ('multiple-choice', `What number is BETWEEN ${n} and ${n + 2}?`, n + 1,
          pickChoices(rng, n + 1, [n, n + 2, n + 3], { count: 4, min: 1, max: 10 }),
          { text: `${n}, ❓, ${n + 2}` }, 'It sits right in the middle!');
      }),
      level('prek.pack-algebra.missing-start', 'Missing First Number', 'multiple-choice', 3, (rng) => {
        const n = randInt(rng, 2, 7);
        return numQ('multiple-choice', `❓, ${n}, ${n + 1}, ${n + 2} — which number starts the line?`, n - 1,
          pickChoices(rng, n - 1, [n, n + 1, n - 2], { count: 4, min: 0, max: 9 }),
          { text: `❓, ${n}, ${n + 1}, ${n + 2}` }, 'Count backward one!');
      }),
      level('prek.pack-algebra.type-gap', 'Type the Gap', 'number-pad', 3, (rng) => {
        const n = randInt(rng, 1, 7);
        return numPad(`${n}, ${n + 1}, ❓, ${n + 3} — type the missing number!`, n + 2,
          { visual: { text: `${n}, ${n + 1}, ❓, ${n + 3}` }, hint: 'Say the numbers in order!' });
      }),
    ],
  },
];
