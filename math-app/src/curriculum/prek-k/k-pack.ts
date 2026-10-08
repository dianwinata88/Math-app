import { randInt, randInts, shuffle } from '../../core/rng';
import type { Question, Rng, UnitDef } from '../../core/types';
import { level, matchPairs, mc, numPad, orderSeq, trueFalse } from '../helpers';
import {
  CONTAINERS,
  HEAVY_THINGS,
  LIGHT_THINGS,
  NUMBER_WORDS,
  PATTERN_SETS,
  SHAPES_2D,
  SHAPE_OBJECTS_2D,
  SHORT_THINGS,
  SOLIDS_3D,
  TALL_THINGS,
} from './banks';
import { choose, chooseDistinct, pickChoices, repeat } from './choices';
import {
  CLOCK_EMOJIS,
  COUNTING_OBJECTS,
  DAYS,
  GRAPH_SETS,
  LINEUP_CRITTERS,
  MEASURE_TOOLS,
  ORDINAL_WORDS,
  SORT_SETS,
  STORY_PROPS,
  packNumberQuestion,
  rowGroups,
  tallyText,
  tenFrame,
} from './k-pack-banks';

function numberMc(
  rng: Rng,
  prompt: string,
  answer: number,
  preferred: number[],
  options: { count?: number; min?: number; max?: number } = {},
  visual?: Question['visual'],
  hint?: string,
): Question {
  return packNumberQuestion('multiple-choice', prompt, answer, pickChoices(rng, answer, preferred, { count: 4, min: 0, ...options }), visual, hint);
}

function countTap(
  rng: Rng,
  prompt: string,
  answer: number,
  preferred: number[],
  options: { count?: number; min?: number; max?: number } = {},
  visual?: Question['visual'],
  hint?: string,
): Question {
  return packNumberQuestion('count-tap', prompt, answer, pickChoices(rng, answer, preferred, { count: 4, min: 0, ...options }), visual, hint);
}

function twoColorSpill(whole: number, first: number, firstEmoji: string, secondEmoji: string): string {
  const firstRow = `${firstEmoji.repeat(Math.min(first, 5))}${first > 5 ? `\n${firstEmoji.repeat(first - 5)}` : ''}`;
  const second = whole - first;
  const secondRow = `${secondEmoji.repeat(Math.min(second, 5))}${second > 5 ? `\n${secondEmoji.repeat(second - 5)}` : ''}`;
  return `${firstRow}\n${secondRow}`;
}

function dayDistractors(rng: Rng, answer: string, count = 3): string[] {
  return chooseDistinct(rng, DAYS.filter((day) => day !== answer), count);
}

export const kPack: UnitDef[] = [
  {
    id: 'k.pack-count100',
    title: 'Parade to 100',
    emoji: '🎈',
    domain: 'counting',
    levels: [
      level('k.pack-count100.count-on', 'Count On!', 'order-sequence', 1, (rng) => {
        const start = randInt(rng, 2, 92);
        const length = randInt(rng, 4, 5);
        return orderSeq(`Count on from ${start}!`, Array.from({ length }, (_, index) => String(start + index)));
      }),
      level('k.pack-count100.how-many', 'How Many?', 'count-tap', 1, (rng) => {
        const count = randInt(rng, 3, 10);
        const emoji = choose(rng, COUNTING_OBJECTS);
        return countTap(rng, 'How many? Touch each one!', count, [count - 1, count + 1, count + 2], { max: 15 }, { emoji, groups: rowGroups(count) }, 'Count slowly. The last number is the answer!');
      }),
      level('k.pack-count100.lineup', 'Line Up!', 'multiple-choice', 1, (rng) => {
        const line = chooseDistinct(rng, LINEUP_CRITTERS, 5);
        const position = randInt(rng, 0, 4);
        const answer = `${line[position].emoji} ${line[position].name}`;
        return mc(
          `Who is ${ORDINAL_WORDS[position]} in line?`,
          answer,
          line.filter((_, index) => index !== position).map((critter) => `${critter.emoji} ${critter.name}`),
          rng,
          { visual: { items: line.map((critter) => critter.emoji) }, hint: 'Start counting from the left: 1st, 2nd, 3rd...' },
        );
      }),
      level('k.pack-count100.missing-gap', 'Find the Gap', 'multiple-choice', 2, (rng) => {
        const start = randInt(rng, 5, 88);
        const gap = randInt(rng, 1, 3);
        const sequence = Array.from({ length: 5 }, (_, index) => start + index);
        const answer = sequence[gap];
        return numberMc(
          rng,
          'Which number is hiding?',
          answer,
          [answer - 1, answer + 1, answer + 10, answer - 10],
          { max: 110 },
          { text: sequence.map((value, index) => (index === gap ? '❓' : String(value))).join(', ') },
          'Count each number out loud.',
        );
      }),
      level('k.pack-count100.before-after', 'Before & After', 'multiple-choice', 2, (rng) => {
        const number = randInt(rng, 2, 98);
        const asksBefore = randInt(rng, 0, 1) === 0;
        const answer = asksBefore ? number - 1 : number + 1;
        return numberMc(
          rng,
          `What comes ${asksBefore ? 'before' : 'after'} ${number}?`,
          answer,
          [number, asksBefore ? number + 1 : number - 1, answer + 10, answer - 10],
          { min: 1, max: 110 },
          undefined,
          'Count forward and backward in your head.',
        );
      }),
      level('k.pack-count100.count-back', 'Count Back', 'order-sequence', 2, (rng) => {
        const start = randInt(rng, 8, 60);
        const length = randInt(rng, 4, 5);
        return orderSeq('Count backward!', Array.from({ length }, (_, index) => String(start - index)));
      }),
      level('k.pack-count100.chart-gap', 'Chart Detective', 'multiple-choice', 2, (rng) => {
        const row = randInt(rng, 0, 8);
        const column = randInt(rng, 0, 9);
        const base = row * 10;
        const answer = base + column + 1;
        const rowText = Array.from({ length: 10 }, (_, index) => (index === column ? '❓' : String(base + index + 1))).join(' ');
        return numberMc(
          rng,
          'Which number is missing from the chart?',
          answer,
          [answer - 1, answer + 1, answer - 10, answer + 10],
          { min: 1, max: 100 },
          { text: rowText },
          'Each row counts up by 1. Each column counts up by 10.',
        );
      }),
      level('k.pack-count100.medal-order', 'Race Medals', 'order-sequence', 2, (rng) => {
        const start = randInt(rng, 1, 5);
        return orderSeq('Line up the medals!', Array.from({ length: 4 }, (_, index) => ORDINAL_WORDS[start - 1 + index]));
      }),
      level('k.pack-count100.hop-forward', 'Hop Forward', 'number-pad', 2, (rng) => {
        const start = randInt(rng, 5, 88);
        const hops = randInt(rng, 2, 9);
        return numPad(`Start at ${start}. Count on ${hops} more. Where do you land?`, start + hops, {
          visual: { text: `${start}  →  +${hops}  →  ?` },
          hint: 'Count on with your fingers.',
        });
      }),
      level('k.pack-count100.between', 'Squeezed In', 'multiple-choice', 3, (rng) => {
        const low = randInt(rng, 1, 90);
        const high = low + randInt(rng, 2, 6);
        const answer = randInt(rng, low + 1, high - 1);
        return numberMc(
          rng,
          `Which number is between ${low} and ${high}?`,
          answer,
          [low, high, answer - 10, answer + 10],
          { min: 1, max: 110 },
          { text: `${low} ... ? ... ${high}` },
          'It must be bigger than the first and smaller than the second.',
        );
      }),
      level('k.pack-count100.next-ten', 'Next Stop: Ten', 'multiple-choice', 3, (rng) => {
        const tens = randInt(rng, 1, 8);
        const number = tens * 10 + randInt(rng, 1, 9);
        const answer = (tens + 1) * 10;
        return numberMc(
          rng,
          `What is the next ten after ${number}?`,
          answer,
          [answer - 10, answer + 10, number + 1],
          { max: 110 },
          undefined,
          'Tens end in zero: 10, 20, 30...',
        );
      }),
      level('k.pack-count100.order-big', 'Big Number Order', 'order-sequence', 3, (rng) => {
        const numbers = randInts(rng, 20, 99, randInt(rng, 4, 5));
        return { ...orderSeq('Smallest to biggest!', numbers.map(String)), hint: 'Find the littlest first.' };
      }),
      level('k.pack-count100.count-check', 'Right After?', 'true-false', 3, (rng) => {
        const number = randInt(rng, 5, 97);
        const isTrue = randInt(rng, 0, 1) === 0;
        const claim = isTrue ? number + 1 : number - 1;
        return trueFalse(`${claim} comes right after ${number}.`, isTrue, {
          visual: { text: `${number}  →  ${claim}?` },
          hint: 'Right after means one more.',
        });
      }),
    ],
  },
  {
    id: 'k.pack-skipcount',
    title: 'Skip-Count Creek',
    emoji: '🐸',
    domain: 'counting',
    levels: [
      level('k.pack-skipcount.by-2s', 'Hop by 2s', 'order-sequence', 1, (rng) => {
        const start = randInt(rng, 0, 8) * 2;
        return orderSeq('Count by 2s!', Array.from({ length: 5 }, (_, index) => String(start + index * 2)));
      }),
      level('k.pack-skipcount.by-5s', 'Hop by 5s', 'order-sequence', 1, (rng) => {
        const start = randInt(rng, 0, 10) * 5;
        return orderSeq('Count by 5s!', Array.from({ length: 5 }, (_, index) => String(start + index * 5)));
      }),
      level('k.pack-skipcount.by-10s', 'Hop by 10s', 'order-sequence', 1, (rng) => {
        const start = randInt(rng, 1, 6) * 10;
        return orderSeq('Count by 10s!', Array.from({ length: 5 }, (_, index) => String(start + index * 10)));
      }),
      level('k.pack-skipcount.sock-pairs', 'Sock Pairs', 'count-tap', 1, (rng) => {
        const pairs = randInt(rng, 2, 4);
        const answer = pairs * 2;
        return countTap(rng, 'Count by 2s! How many socks?', answer, [answer - 1, answer + 1, answer + 2, pairs], { max: 12 }, { emoji: '🧦', groups: Array(pairs).fill(2) }, 'Each pair is 2 socks!');
      }),
      level('k.pack-skipcount.hand-fives', 'High-Five Count', 'count-tap', 2, (rng) => {
        const hands = randInt(rng, 2, 3);
        const answer = hands * 5;
        return countTap(rng, 'Count by 5s! How many fingers?', answer, [answer - 5, answer + 5, answer - 1, answer + 1], { max: 25 }, { emoji: '✋', groups: Array(hands).fill(5) }, 'Each hand has 5 fingers.');
      }),
      level('k.pack-skipcount.ten-frames', 'Ten-Frame Count', 'multiple-choice', 2, (rng) => {
        const frames = randInt(rng, 2, 6);
        const answer = frames * 10;
        return numberMc(rng, 'Count by 10s! How many dots?', answer, [answer - 10, answer + 10, answer - 5, answer + 1], { max: 90 }, { items: Array(frames).fill('🔟') }, 'Each full frame is 10.');
      }),
      level('k.pack-skipcount.next-2', 'Next by 2s', 'multiple-choice', 2, (rng) => {
        const start = randInt(rng, 0, 5) * 2;
        const answer = start + 8;
        return numberMc(rng, 'What comes next?', answer, [answer - 1, answer + 1, answer + 2], { max: 25 }, { text: `${start}, ${start + 2}, ${start + 4}, ${start + 6}, ?` }, 'Each hop is 2.');
      }),
      level('k.pack-skipcount.next-5', 'Next by 5s', 'multiple-choice', 2, (rng) => {
        const start = randInt(rng, 0, 8) * 5;
        const answer = start + 20;
        return numberMc(rng, 'What comes next?', answer, [answer - 5, answer + 5, answer - 1, answer + 1], { max: 70 }, { text: `${start}, ${start + 5}, ${start + 10}, ${start + 15}, ?` }, 'Each hop is 5.');
      }),
      level('k.pack-skipcount.next-10', 'Next by 10s', 'multiple-choice', 2, (rng) => {
        const start = randInt(rng, 1, 5) * 10;
        const answer = start + 40;
        return numberMc(rng, 'What comes next?', answer, [answer - 10, answer + 10, answer + 1, answer - 1], { max: 110 }, { text: `${start}, ${start + 10}, ${start + 20}, ${start + 30}, ?` }, 'Each hop is 10.');
      }),
      level('k.pack-skipcount.middle-gap', 'Missing Hop', 'multiple-choice', 3, (rng) => {
        const step = choose(rng, [2, 5, 10]);
        const start = randInt(rng, 0, 5) * step;
        const gap = randInt(rng, 1, 3);
        const sequence = Array.from({ length: 5 }, (_, index) => start + index * step);
        const answer = sequence[gap];
        return numberMc(
          rng,
          `Counting by ${step}s — what is missing?`,
          answer,
          [answer - 1, answer + 1, answer + step, answer - step],
          { max: 120 },
          { text: sequence.map((value, index) => (index === gap ? '❓' : String(value))).join(', ') },
          `Each hop is ${step}.`,
        );
      }),
      level('k.pack-skipcount.pad-next', 'Type the Next Hop', 'number-pad', 3, (rng) => {
        const step = choose(rng, [2, 5, 10]);
        const start = randInt(rng, 1, 5) * step;
        const terms = Array.from({ length: 4 }, (_, index) => start + index * step);
        return numPad(`${terms.join(', ')}, ?`, start + 4 * step, {
          visual: { text: `${terms.join(', ')}, ?` },
          hint: `Each hop is ${step}.`,
        });
      }),
      level('k.pack-skipcount.count-tf', 'Do We Say It?', 'true-false', 3, (rng) => {
        const step = choose(rng, [2, 5, 10]);
        const isTrue = randInt(rng, 0, 1) === 0;
        const said = isTrue ? randInt(rng, 2, 8) * step : randInt(rng, 2, 8) * step + (step === 2 ? 1 : randInt(rng, 1, step - 1));
        return trueFalse(`We say ${said} when counting by ${step}s.`, isTrue, {
          hint: `Counting by ${step}s: ${step}, ${step * 2}, ${step * 3}...`,
        });
      }),
    ],
  },
  {
    id: 'k.pack-addsub',
    title: 'Bakery Add & Take',
    emoji: '🧁',
    domain: 'operations',
    levels: [
      level('k.pack-addsub.add-5', 'Sprinkle Sums to 5', 'count-tap', 1, (rng) => {
        const first = randInt(rng, 1, 4);
        const second = randInt(rng, 1, 5 - first);
        const answer = first + second;
        return countTap(rng, `${first} + ${second} = ?`, answer, [first, second, answer - 1, answer + 1], { max: 8 }, { emoji: '🧁', groups: [first, second] }, 'Count all the cupcakes!');
      }),
      level('k.pack-addsub.add-10', 'Tray Sums to 10', 'count-tap', 1, (rng) => {
        const first = randInt(rng, 2, 7);
        const second = randInt(rng, 1, 10 - first);
        const answer = first + second;
        return countTap(rng, `${first} + ${second} = ?`, answer, [answer - 1, answer + 1, first, answer + 2], { max: 13 }, { emoji: '🍪', groups: [first, second] }, 'Put the groups together and count.');
      }),
      level('k.pack-addsub.plus-zero', 'Zero Magic', 'multiple-choice', 1, (rng) => {
        const number = randInt(rng, 1, 9);
        const addition = randInt(rng, 0, 1) === 0;
        return numberMc(
          rng,
          `${number} ${addition ? '+' : '−'} 0 = ?`,
          number,
          [number + 1, number - 1, 0, number + 10],
          { max: 20 },
          { text: `${number} ${addition ? '+' : '−'} 0 =` },
          'Zero means nothing changes!',
        );
      }),
      level('k.pack-addsub.take-5', 'Cookie Munch', 'multiple-choice', 1, (rng) => {
        const first = randInt(rng, 2, 5);
        const second = randInt(rng, 1, first - 1);
        const answer = first - second;
        return numberMc(rng, `${first} 🍪. We munch ${second}. How many left?`, answer, [answer + 1, answer - 1, first, second], { max: 6 }, { emoji: '🍪', count: first }, 'Start with all, take some away.');
      }),
      level('k.pack-addsub.take-10', 'Donut Dash', 'multiple-choice', 2, (rng) => {
        const first = randInt(rng, 5, 10);
        const second = randInt(rng, 1, first - 1);
        const answer = first - second;
        return numberMc(rng, `${first} − ${second} = ?`, answer, [answer + 1, answer - 1, first, first + second > 10 ? answer + 2 : first + second], { max: 11 }, { text: `${first} − ${second} =` }, 'Count back on your fingers.');
      }),
      level('k.pack-addsub.add-pad', 'Baker’s Pad', 'number-pad', 2, (rng) => {
        const first = randInt(rng, 1, 9);
        const second = randInt(rng, 1, 10 - first);
        return numPad(`${first} + ${second} = ?`, first + second, { visual: { text: `${first} + ${second} =` }, hint: 'Start at the bigger number and count on.' });
      }),
      level('k.pack-addsub.sub-pad', 'Take-Away Pad', 'number-pad', 2, (rng) => {
        const first = randInt(rng, 2, 9);
        const second = randInt(rng, 1, first - 1);
        return numPad(`${first} − ${second} = ?`, first - second, { visual: { text: `${first} − ${second} =` }, hint: 'Count back.' });
      }),
      level('k.pack-addsub.doubles', 'Double Trouble', 'multiple-choice', 2, (rng) => {
        const number = randInt(rng, 1, 5);
        const answer = number * 2;
        return numberMc(rng, `${number} + ${number} = ?`, answer, [answer - 1, answer + 1, number, answer + 2], { max: 12 }, { emoji: '🍩', groups: [number, number] }, 'Doubles: same number twice!');
      }),
      level('k.pack-addsub.miss-addend-5', 'Missing Sprinkle', 'multiple-choice', 2, (rng) => {
        const whole = randInt(rng, 3, 5);
        const part = randInt(rng, 1, whole - 1);
        const answer = whole - part;
        return numberMc(rng, `${part} + ? = ${whole}`, answer, [answer + 1, answer - 1, whole, part], { max: 7 }, { text: `${part} + ▢ = ${whole}` }, 'How many more make the whole?');
      }),
      level('k.pack-addsub.miss-part-10', 'Missing to 10', 'number-pad', 3, (rng) => {
        const part = randInt(rng, 1, 9);
        const leftSide = randInt(rng, 0, 1) === 0;
        return numPad(leftSide ? `? + ${part} = 10` : `${part} + ? = 10`, 10 - part, {
          visual: { text: tenFrame(part) },
          hint: 'Count the empty spots in the ten frame.',
        });
      }),
      level('k.pack-addsub.which-sign', 'Plus or Minus?', 'multiple-choice', 3, (rng) => {
        const first = randInt(rng, 3, 9);
        const second = randInt(rng, 1, first - 1);
        const addition = randInt(rng, 0, 1) === 0;
        const result = addition ? first + second : first - second;
        return mc(`${first} ? ${second} = ${result}. Which sign?`, addition ? '➕ plus' : '➖ minus', [addition ? '➖ minus' : '➕ plus', '＝ equals'], rng, {
          visual: { text: `${first} ? ${second} = ${result}` },
          hint: 'Did the number get bigger or smaller?',
        });
      }),
      level('k.pack-addsub.fact-match', 'Fact Families', 'match-pairs', 3, (rng) => {
        const values = randInts(rng, 2, 10, 4);
        return {
          ...matchPairs(
            'Match each fact to its answer!',
            values.map((value) => {
              if (randInt(rng, 0, 1) === 0) {
                const part = randInt(rng, 1, value - 1);
                return { left: `${part} + ${value - part}`, right: String(value) };
              }
              const total = value + randInt(rng, 1, 5);
              return { left: `${total} − ${total - value}`, right: String(value) };
            }),
          ),
          hint: 'Solve each side first.',
        };
      }),
      level('k.pack-addsub.expr-compare', 'Which Side Wins?', 'true-false', 3, (rng) => {
        const first = randInt(rng, 1, 9);
        const second = randInt(rng, 1, 10 - first);
        const leftValue = first + second;
        const third = randInt(rng, 1, 10);
        const taken = randInt(rng, 0, third - 1);
        const rightValue = third - taken;
        const relation = choose(rng, ['more than', 'less than', 'the same as'] as const);
        const correct = relation === 'more than' ? leftValue > rightValue : relation === 'less than' ? leftValue < rightValue : leftValue === rightValue;
        return trueFalse(`${first} + ${second} is ${relation} ${third} − ${taken}.`, correct, {
          visual: { text: `${first}+${second}  ?  ${third}−${taken}` },
          hint: 'Solve both sides, then compare.',
        });
      }),
    ],
  },
  {
    id: 'k.pack-teens',
    title: 'Ten-Frame Fort',
    emoji: '🏰',
    domain: 'place-value',
    levels: [
      level('k.pack-teens.teen-tap', 'Ten and More', 'multiple-choice', 1, (rng) => {
        const ones = randInt(rng, 1, 9);
        const answer = 10 + ones;
        const dots = `${'⚫'.repeat(Math.min(ones, 5))}${ones > 5 ? `\n${'⚫'.repeat(ones - 5)}` : ''}`;
        return numberMc(rng, 'How many in all?', answer, [ones, answer - 1, answer + 1, Number(`${ones}1`)], { min: 1, max: 25 }, { text: `🔟\n${dots}` }, 'Count the ten first, then the extras.');
      }),
      level('k.pack-teens.ten-plus', 'Ten Plus', 'multiple-choice', 1, (rng) => {
        const ones = randInt(rng, 1, 9);
        const answer = 10 + ones;
        return numberMc(rng, `10 + ${ones} = ?`, answer, [Number(`${ones}1`), ones, answer - 1, answer + 1], { max: 29 }, { text: `10 + ${ones} =` }, 'Teen numbers are 10 and some more.');
      }),
      level('k.pack-teens.teen-words', 'Teen Words', 'multiple-choice', 1, (rng) => {
        const number = randInt(rng, 11, 19);
        const reversed = Number(String(number).split('').reverse().join(''));
        return numberMc(rng, `Find ${NUMBER_WORDS[number]}!`, number, [reversed, number - 1, number + 1, number - 10], { min: 1, max: 99 }, undefined, 'Teen words end in -teen.');
      }),
      level('k.pack-teens.how-many-ones', 'Break the Teen', 'multiple-choice', 2, (rng) => {
        const number = randInt(rng, 11, 19);
        const answer = number - 10;
        return numberMc(rng, `${number} is 10 and how many more?`, answer, [10, number, answer + 1, answer - 1], { min: 0, max: 20 }, { text: `${number} = 10 + ?` }, 'Take away the ten. What is left?');
      }),
      level('k.pack-teens.teen-pad', 'Build the Teen', 'number-pad', 2, (rng) => {
        const ones = randInt(rng, 1, 9);
        const dots = `${'⚫'.repeat(Math.min(ones, 5))}${ones > 5 ? `\n${'⚫'.repeat(ones - 5)}` : ''}`;
        return numPad(`1 ten and ${ones} ones = ?`, 10 + ones, { visual: { text: `🔟\n${dots}` }, hint: 'Write the 1, then the ones.' });
      }),
      level('k.pack-teens.blocks-tap', 'Block Tower', 'multiple-choice', 2, (rng) => {
        const ones = randInt(rng, 2, 9);
        const answer = 10 + ones;
        const dots = `${'🟧'.repeat(Math.min(ones, 5))}${ones > 5 ? `\n${'🟧'.repeat(ones - 5)}` : ''}`;
        return numberMc(rng, 'How many blocks in the tower?', answer, [answer - 10, answer + 1, answer - 1, ones], { min: 1, max: 25 }, { text: `🔟\n${dots}` }, 'One tall stick is 10 blocks.');
      }),
      level('k.pack-teens.teen-after', 'Teen Neighbor', 'multiple-choice', 2, (rng) => {
        const number = randInt(rng, 11, 18);
        const asksBefore = randInt(rng, 0, 1) === 0;
        const answer = asksBefore ? number - 1 : number + 1;
        return numberMc(rng, `What comes ${asksBefore ? 'before' : 'after'} ${number}?`, answer, [number, asksBefore ? number + 1 : number - 1, answer + 10], { min: 1, max: 30 });
      }),
      level('k.pack-teens.teen-order', 'Teen Line-Up', 'order-sequence', 3, (rng) => {
        const numbers = randInts(rng, 11, 19, 4);
        return { ...orderSeq('Teens in order, smallest first!', numbers.map(String)), hint: 'All teens start with 1 — look at the ones.' };
      }),
      level('k.pack-teens.tens-ones-pad', 'Tens and Ones', 'number-pad', 3, (rng) => {
        const tens = randInt(rng, 1, 2);
        const ones = randInt(rng, 1, 9);
        const dots = `${'⚫'.repeat(Math.min(ones, 5))}${ones > 5 ? `\n${'⚫'.repeat(ones - 5)}` : ''}`;
        return numPad(`${tens} ten${tens > 1 ? 's' : ''} and ${ones} ones = ?`, tens * 10 + ones, {
          visual: { text: `${'🔟'.repeat(tens)}\n${dots}` },
          hint: 'Count the tens, then the ones.',
        });
      }),
      level('k.pack-teens.teen-compare', 'Which Is More?', 'multiple-choice', 3, (rng) => {
        const teen = randInt(rng, 11, 19);
        const tens = randInt(rng, 1, 2);
        const ones = randInt(rng, 0, 9);
        const composed = tens * 10 + ones;
        const shown = composed === teen ? composed + 2 : composed;
        const answer = Math.max(teen, shown);
        const other = Math.min(teen, shown);
        return numberMc(rng, `Which is more: ${teen} or ${tens} ten${tens > 1 ? 's' : ''} and ${ones} one${ones === 1 ? '' : 's'}?`, answer, [other], { min: 0, max: 30 }, undefined, 'Turn both into numbers, then compare.');
      }),
      level('k.pack-teens.teen-tf', 'Teen or Not?', 'true-false', 3, (rng) => {
        const number = randInt(rng, 11, 19);
        const ones = number - 10;
        const isTrue = randInt(rng, 0, 1) === 0;
        return trueFalse(
          isTrue ? `${number} is 1 ten and ${ones} ones.` : `${number} is ${ones} tens and 1 one.`,
          isTrue,
          { visual: { text: `🔟 + ${ones} = ${number}?` }, hint: 'A teen is 1 ten plus the ones.' },
        );
      }),
    ],
  },
  {
    id: 'k.pack-fractions',
    title: 'Half-Pie Shop',
    emoji: '🥧',
    domain: 'fractions',
    levels: [
      level('k.pack-fractions.fair-share', 'Fair or Not?', 'multiple-choice', 1, (rng) => {
        const food = choose(rng, ['🍕', '🥧', '🍫', '🍎'] as const);
        return mc(`Which share of the ${food} is fair for 2 kids?`, '🟰 same-size pieces', ['↕️ different-size pieces', '😈 one kid gets it all'], rng, {
          visual: { text: `${food} → 2 kids` },
          hint: 'Fair means everyone gets the same.',
        });
      }),
      level('k.pack-fractions.point-half', 'Show Me Half', 'multiple-choice', 1, (rng) => {
        const food = choose(rng, ['🍎', '🍊', '🍕', '🥪'] as const);
        return mc(`Which shows one half of the ${food}?`, '◐ half — one of two equal parts', ['⬤ the whole thing', '◔ a small bite'], rng, {
          visual: { text: `${food} cut in 2` },
          hint: 'Half means 2 equal pieces, take one.',
        });
      }),
      level('k.pack-fractions.tap-half', 'Pick Half!', 'multiple-choice', 1, (rng) => {
        const whole = choose(rng, [2, 4, 6, 8]);
        const answer = whole / 2;
        const emoji = choose(rng, ['🍓', '🍪', '🧁', '🍇'] as const);
        return numberMc(rng, `Half of ${whole} is ?`, answer, [whole, answer - 1, answer + 1, whole - 1], { min: 0, max: 9 }, { emoji, count: whole }, 'Split them into 2 equal groups.');
      }),
      level('k.pack-fractions.share-2', 'Share for Two', 'multiple-choice', 2, (rng) => {
        const whole = choose(rng, [4, 6, 8, 10]);
        const answer = whole / 2;
        const food = choose(rng, ['🧁', '🍪', '🍇', '🍓'] as const);
        return numberMc(rng, `2 friends share ${whole} ${food} fairly. Each gets ?`, answer, [answer + 1, answer - 1, whole, whole - 1], { max: 11 }, { emoji: food, count: Math.min(whole, 8) }, 'Give one to each friend, turn by turn.');
      }),
      level('k.pack-fractions.share-4', 'Share for Four', 'multiple-choice', 2, (rng) => {
        const whole = choose(rng, [4, 8]);
        const answer = whole / 4;
        return numberMc(rng, `4 friends share ${whole} 🍕 slices fairly. Each gets ?`, answer, [answer + 1, answer + 2, whole, whole / 2], { min: 0, max: 9 }, { text: `${whole} slices ÷ 4 friends` }, 'Deal them out one at a time.');
      }),
      level('k.pack-fractions.half-of', 'Half Of It', 'multiple-choice', 2, (rng) => {
        const whole = choose(rng, [4, 6, 8, 10, 12]);
        const answer = whole / 2;
        return numberMc(rng, `Half of ${whole} is ?`, answer, [answer + 1, answer - 1, whole, whole / 2 + 2], { min: 0, max: 13 }, { text: `${whole} → ◐ = ?` }, 'Half means split into 2 equal parts.');
      }),
      level('k.pack-fractions.half-check', 'Half True?', 'true-false', 2, (rng) => {
        const whole = choose(rng, [4, 6, 8, 10]);
        const half = whole / 2;
        const isTrue = randInt(rng, 0, 1) === 0;
        const shown = isTrue ? half : choose(rng, [half - 1, half + 1, whole].filter((value) => value !== half && value > 0));
        return trueFalse(`Half of ${whole} is ${shown}.`, isTrue, { visual: { text: `${whole} ÷ 2 = ${shown}?` }, hint: 'Both halves must be equal.' });
      }),
      level('k.pack-fractions.half-pad', 'Half Pad', 'number-pad', 3, (rng) => {
        const whole = choose(rng, [10, 12, 14, 16, 18, 20]);
        return numPad(`Half of ${whole} is ?`, whole / 2, { visual: { text: `${whole} → ◐` }, hint: 'Split it into two equal piles.' });
      }),
      level('k.pack-fractions.half-match', 'Half Pairs', 'match-pairs', 3, (rng) => {
        const wholes = chooseDistinct(rng, [4, 6, 8, 10, 12], 4);
        return {
          ...matchPairs('Match each number to its half!', wholes.map((whole) => ({ left: `half of ${whole}`, right: String(whole / 2) }))),
          hint: 'Half of 8 is 4.',
        };
      }),
      level('k.pack-fractions.fourths', 'Intro to Fourths', 'multiple-choice', 3, (rng) => {
        const food = choose(rng, ['🍫', '🍕', '🥧', '🧇'] as const);
        return mc(`A ${food} is cut into 4 equal pieces. Each piece is a ?`, 'fourth', ['half', 'whole', 'third'], rng, {
          visual: { text: `${food} cut in 4` },
          hint: 'Four equal pieces: each is a fourth.',
        });
      }),
    ],
  },
  {
    id: 'k.pack-decimals',
    title: 'Ten-for-One Bank',
    emoji: '🏦',
    domain: 'decimals',
    levels: [
      level('k.pack-decimals.ten-ones', 'Ten Ones Make...', 'multiple-choice', 1, (rng) => {
        const asksForward = randInt(rng, 0, 1) === 0;
        return asksForward
          ? mc('10 ones make 1 ?', 'ten', ['one', 'hundred', 'five'], rng, { visual: { text: `${'⚫'.repeat(5)}\n${'⚫'.repeat(5)}\n→ ?` }, hint: '10 little ones bundle into 1 ten.' })
          : mc('1 ten is how many ones?', '10 ones', ['1 one', '5 ones', '100 ones'], rng, { visual: { text: '🔟 → ?' }, hint: 'Unbundle the ten stick.' });
      }),
      level('k.pack-decimals.dime-worth', 'The Mighty Dime', 'multiple-choice', 1, (rng) => {
        const asksForward = randInt(rng, 0, 1) === 0;
        return asksForward
          ? mc('A dime is worth how many cents?', '10 cents', ['1 cent', '5 cents', '25 cents'], rng, { visual: { text: '🪙 dime = ?¢' }, hint: 'A dime trades for 10 pennies.' })
          : mc('10 pennies trade for 1 ?', 'dime', ['penny', 'nickel', 'dollar'], rng, { visual: { text: `${'🪙'.repeat(5)}\n${'🪙'.repeat(5)} → ?` }, hint: 'Ten little coins make one dime.' });
      }),
      level('k.pack-decimals.tenth-name', 'Name the Piece', 'multiple-choice', 1, (rng) => {
        const food = choose(rng, ['🍫', '🥖', '🍊'] as const);
        return mc(`A ${food} is split into 10 equal pieces. Each piece is one ?`, 'tenth', ['half', 'third', 'whole'], rng, {
          visual: { text: `${food} → 10 pieces` },
          hint: 'Ten equal pieces: each is a tenth.',
        });
      }),
      level('k.pack-decimals.dime-count', 'Dime Stacks', 'multiple-choice', 2, (rng) => {
        const dimes = randInt(rng, 2, 5);
        const answer = dimes * 10;
        return numberMc(rng, 'Count by 10s! How many cents?', answer, [answer - 10, answer + 10, answer + 5, dimes], { min: 5, max: 80 }, { items: Array(dimes).fill('🪙') }, 'Each dime is 10 cents.');
      }),
      level('k.pack-decimals.tenths-shade', 'Tenths Shaded', 'multiple-choice', 2, (rng) => {
        const filled = randInt(rng, 1, 9);
        const answer = `${filled} tenths`;
        const pool = ['1 tenth', '2 tenths', '3 tenths', '4 tenths', '5 tenths', '6 tenths', '7 tenths', '8 tenths', '9 tenths'];
        return mc('How much of the bar is shaded?', answer, chooseDistinct(rng, pool.filter((label) => label !== answer), 3), rng, {
          visual: { text: tenFrame(filled, 2) },
          hint: 'Count the yellow tenths.',
        });
      }),
      level('k.pack-decimals.tens-make', 'How Many Tens?', 'multiple-choice', 2, (rng) => {
        const tens = randInt(rng, 2, 6);
        const answer = tens;
        const total = tens * 10;
        const moneyStyle = randInt(rng, 0, 1) === 0;
        return numberMc(
          rng,
          moneyStyle ? `How many dimes make ${total} cents?` : `How many tens make ${total}?`,
          answer,
          [tens + 1, tens - 1, total, tens + 2],
          { min: 1, max: 12 },
          { text: `${total} = ${'🔟'.repeat(Math.min(tens, 6))} ?` },
          'Count by tens to reach the total.',
        );
      }),
      level('k.pack-decimals.dime-pad', 'Dime Pad', 'number-pad', 2, (rng) => {
        const dimes = randInt(rng, 2, 9);
        return numPad(`${dimes} dimes = ? cents`, dimes * 10, { visual: { items: Array(Math.min(dimes, 8)).fill('🪙') }, hint: 'Count by 10s.' });
      }),
      level('k.pack-decimals.tenths-whole', 'Make the Whole', 'multiple-choice', 3, (rng) => {
        const asksTenths = randInt(rng, 0, 1) === 0;
        return asksTenths
          ? mc('How many tenths make a whole?', '10 tenths', ['5 tenths', '2 tenths', '1 tenth'], rng, { visual: { text: tenFrame(10, 2) }, hint: 'Fill every spot!' })
          : mc('10 tenths is the same as ?', '1 whole', ['1 half', '2 wholes', '1 tenth'], rng, { visual: { text: tenFrame(10, 2) }, hint: 'A full bar is one whole.' });
      }),
      level('k.pack-decimals.tenths-match', 'Tenths Match', 'match-pairs', 3, (rng) => {
        const counts = randInts(rng, 1, 9, 4);
        return {
          ...matchPairs('Match the fraction to the words!', counts.map((count) => ({ left: `${count}/10`, right: `${count} tenths` }))),
          hint: '3/10 means 3 out of 10 pieces.',
        };
      }),
      level('k.pack-decimals.tenths-tf', 'Tenths Check', 'true-false', 3, (rng) => {
        const isTrue = randInt(rng, 0, 1) === 0;
        if (isTrue) {
          const count = randInt(rng, 1, 9);
          return trueFalse(`${count} tenths means ${count} of 10 equal pieces.`, true, { hint: 'The bottom number tells how many equal pieces in all.' });
        }
        const wrong = choose(rng, ['5 tenths is more than a whole.', '3 tenths is more than 10 tenths.', '4 tenths is the whole thing.'] as const);
        return trueFalse(wrong, false, { hint: 'You need 10 tenths for a whole.' });
      }),
    ],
  },
  {
    id: 'k.pack-geometry',
    title: 'Shape Workshop',
    emoji: '🧊',
    domain: 'geometry',
    levels: [
      level('k.pack-geometry.pick-flat', 'Find the Flat One', 'multiple-choice', 1, (rng) => {
        const flat = choose(rng, SHAPES_2D);
        const solids = chooseDistinct(rng, SOLIDS_3D, 3);
        const answer = `${flat.glyph} ${flat.name}`;
        return mc('Which shape is flat (2D)?', answer, solids.map((solid) => `${solid.items[0]} ${solid.name}`), rng, {
          hint: 'Flat shapes you can draw on paper. Solids you can hold.',
        });
      }),
      level('k.pack-geometry.pick-solid', 'Find the Solid', 'multiple-choice', 1, (rng) => {
        const solid = choose(rng, SOLIDS_3D);
        const object = choose(rng, solid.items);
        const others = chooseDistinct(rng, SOLIDS_3D.filter((item) => item.name !== solid.name), 3);
        return mc(`Which one is a ${solid.name}?`, object, others.map((item) => item.items[0]), rng, {
          hint: solid.name === 'sphere' ? 'Round like a ball.' : solid.name === 'cube' ? 'Six flat square faces.' : solid.name === 'cone' ? 'Pointy top, round bottom.' : 'Round like a can.',
        });
      }),
      level('k.pack-geometry.name-flat', 'Name That Shape', 'multiple-choice', 1, (rng) => {
        const object = choose(rng, SHAPE_OBJECTS_2D);
        const item = choose(rng, object.items);
        return mc(`What shape is the ${item}?`, object.shape, SHAPES_2D.map((shape) => shape.name).filter((name) => name !== object.shape).slice(0, 3), rng, {
          visual: { text: item },
          hint: 'Count the sides and corners.',
        });
      }),
      level('k.pack-geometry.sides', 'Count the Sides', 'multiple-choice', 2, (rng) => {
        const shape = choose(rng, [
          { name: 'triangle', glyph: '🔺', sides: 3 },
          { name: 'square', glyph: '🟦', sides: 4 },
          { name: 'rectangle', glyph: '▬', sides: 4 },
          { name: 'star', glyph: '⭐', sides: 10 },
        ] as const);
        return numberMc(rng, `How many sides does a ${shape.name} ${shape.glyph} have?`, shape.sides, [shape.sides - 1, shape.sides + 1, shape.sides + 2, 5], { min: 0, max: 12 }, { text: shape.glyph }, 'Trace each side with your finger.');
      }),
      level('k.pack-geometry.corners', 'Count the Corners', 'multiple-choice', 2, (rng) => {
        const shape = choose(rng, [
          { name: 'triangle', glyph: '🔺', corners: 3 },
          { name: 'square', glyph: '🟦', corners: 4 },
          { name: 'rectangle', glyph: '▬', corners: 4 },
        ] as const);
        return numberMc(rng, `How many corners does a ${shape.name} ${shape.glyph} have?`, shape.corners, [shape.corners - 1, shape.corners + 1, shape.corners + 2], { min: 0, max: 8 }, { text: shape.glyph }, 'Corners are the pointy parts.');
      }),
      level('k.pack-geometry.roll-stack', 'Roll or Stack?', 'multiple-choice', 2, (rng) => {
        const asksRoll = randInt(rng, 0, 1) === 0;
        const rollers = ['⚽', '🥫', '🍦'];
        const stackers = ['🎲', '📦', '🧊'];
        return asksRoll
          ? mc('Which one can roll?', choose(rng, rollers), chooseDistinct(rng, stackers, 2), rng, { hint: 'Round things roll!' })
          : mc('Which one stacks best on top?', choose(rng, stackers), chooseDistinct(rng, rollers, 2), rng, { hint: 'Flat faces stack up high.' });
      }),
      level('k.pack-geometry.shape-count', 'Shape Search', 'multiple-choice', 2, (rng) => {
        const glyphs = ['🔺', '🟦', '🔴', '⭐', '▬'] as const;
        const target = choose(rng, glyphs);
        const targetCount = randInt(rng, 1, 3);
        const others = chooseDistinct(rng, glyphs.filter((glyph) => glyph !== target), 2);
        const otherCount = randInt(rng, 1, 4);
        const board: string[] = [];
        for (let index = 0; index < targetCount; index += 1) board.push(target);
        for (let index = 0; index < otherCount; index += 1) board.push(others[index % others.length]);
        const padded = shuffle(rng, board).slice(0, 8);
        const targetName = SHAPES_2D.find((shape) => shape.glyph === target)?.name ?? 'shape';
        const targetInBoard = padded.filter((glyph) => glyph === target).length;
        return numberMc(rng, `How many ${targetName}s?`, targetInBoard, [targetInBoard + 1, targetInBoard - 1, padded.length], { min: 0, max: 8 }, { items: padded }, `Only count the ${targetName}s!`);
      }),
      level('k.pack-geometry.compose', 'Shape Builders', 'multiple-choice', 3, (rng) => {
        const combos = [
          { prompt: 'Two 🔺 triangles pushed together can make a ?', answer: 'square', distractors: ['circle', 'sphere', 'star'] },
          { prompt: 'Two 🟦 squares side by side make a ?', answer: 'rectangle', distractors: ['triangle', 'circle', 'cube'] },
          { prompt: 'Two ▬ rectangles stacked can make a bigger ?', answer: 'rectangle', distractors: ['circle', 'cone', 'sphere'] },
        ] as const;
        const combo = choose(rng, combos);
        return mc(combo.prompt, combo.answer, [...combo.distractors], rng, { hint: 'Push the pieces together in your mind.' });
      }),
      level('k.pack-geometry.faces', 'Face Count', 'multiple-choice', 3, (rng) => {
        const box = choose(rng, ['🎲', '📦', '🧊'] as const);
        return numberMc(rng, `How many flat faces does a cube ${box} have?`, 6, [4, 5, 8], { min: 0, max: 10 }, { text: box }, 'Count every flat side.');
      }),
      level('k.pack-geometry.object-match', 'Shape Object Match', 'match-pairs', 3, (rng) => {
        const objects = chooseDistinct(rng, SHAPE_OBJECTS_2D, 4);
        return {
          ...matchPairs('Match each thing to its shape!', objects.map((object) => ({ left: choose(rng, object.items), right: object.shape }))),
          hint: 'Look at the outline of each object.',
        };
      }),
      level('k.pack-geometry.solid-tf', 'Solid Truth', 'true-false', 3, (rng) => {
        const solid = choose(rng, SOLIDS_3D);
        const object = choose(rng, solid.items);
        const isTrue = randInt(rng, 0, 1) === 0;
        const claimed = isTrue ? solid.name : choose(rng, SOLIDS_3D.filter((item) => item.name !== solid.name)).name;
        return trueFalse(`A ${object} is a ${claimed}.`, isTrue, { visual: { text: `${object} → ${claimed}?` }, hint: 'Think about the shape of the object.' });
      }),
    ],
  },
  {
    id: 'k.pack-measure',
    title: 'Measure Meadow',
    emoji: '📐',
    domain: 'measurement',
    levels: [
      level('k.pack-measure.longer-bar', 'Longer Ribbon', 'multiple-choice', 1, (rng) => {
        const lengths = chooseDistinct(rng, [2, 3, 4, 5, 6, 7], 2);
        const labels = lengths.map((length) => `🎀${repeat('🟪', length)}`);
        const longer = labels[lengths.indexOf(Math.max(...lengths))];
        return mc('Which ribbon is longer?', longer, labels.filter((label) => label !== longer), rng, { hint: 'The one that stretches further.' });
      }),
      level('k.pack-measure.taller', 'Taller Tower', 'multiple-choice', 1, (rng) => {
        const tall = choose(rng, TALL_THINGS);
        const short = choose(rng, SHORT_THINGS);
        const asksTaller = randInt(rng, 0, 1) === 0;
        return mc(asksTaller ? 'Which is taller?' : 'Which is shorter?', asksTaller ? tall : short, [asksTaller ? short : tall], rng, {
          visual: { text: `${tall}  vs  ${short}` },
          hint: 'Tall things reach up high.',
        });
      }),
      level('k.pack-measure.shorter-bar', 'Shorter Pencil', 'multiple-choice', 1, (rng) => {
        const lengths = chooseDistinct(rng, [2, 3, 4, 5, 6, 7], 2);
        const labels = lengths.map((length) => `✏️${repeat('🟨', length)}`);
        const shorter = labels[lengths.indexOf(Math.min(...lengths))];
        return mc('Which pencil is shorter?', shorter, labels.filter((label) => label !== shorter), rng, { hint: 'Short means small from end to end.' });
      }),
      level('k.pack-measure.lighter', 'Light as a Feather', 'multiple-choice', 2, (rng) => {
        const heavy = choose(rng, HEAVY_THINGS);
        const light = choose(rng, LIGHT_THINGS);
        const asksLighter = randInt(rng, 0, 1) === 0;
        return mc(asksLighter ? 'Which is lighter?' : 'Which is heavier?', asksLighter ? light : heavy, [asksLighter ? heavy : light], rng, {
          visual: { text: `⚖️ ${heavy}  vs  ${light}` },
          hint: 'Light things are easy to lift.',
        });
      }),
      level('k.pack-measure.holds-least', 'Holds Least', 'multiple-choice', 2, (rng) => {
        const picks = chooseDistinct(rng, CONTAINERS, 3);
        const smallest = picks.reduce((a, b) => (CONTAINERS.indexOf(a) < CONTAINERS.indexOf(b) ? a : b));
        return mc('Which holds the least water?', `${smallest.emoji} ${smallest.name}`, picks.filter((item) => item !== smallest).map((item) => `${item.emoji} ${item.name}`), rng, {
          hint: 'The tiniest container holds the least.',
        });
      }),
      level('k.pack-measure.tool', 'Pick the Tool', 'multiple-choice', 2, (rng) => {
        const tool = choose(rng, MEASURE_TOOLS);
        return mc(`Which tool tells ${tool.job}?`, tool.name, MEASURE_TOOLS.filter((item) => item !== tool).map((item) => item.name), rng, {
          hint: 'Match the tool to the job.',
        });
      }),
      level('k.pack-measure.blocks-long', 'Blocks Long', 'count-tap', 2, (rng) => {
        const blocks = randInt(rng, 3, 8);
        const object = choose(rng, ['🥖', '🐍', '🚂', '📏'] as const);
        return countTap(rng, `How many blocks long is the ${object}?`, blocks, [blocks - 1, blocks + 1, blocks + 2], { max: 10 }, { emoji: '🟦', count: blocks }, 'Count each block along the thing.');
      }),
      level('k.pack-measure.tool-tf', 'Tool Check', 'true-false', 2, (rng) => {
        const tool = choose(rng, MEASURE_TOOLS);
        const isTrue = randInt(rng, 0, 1) === 0;
        const job = isTrue ? tool.job : choose(rng, MEASURE_TOOLS.filter((item) => item !== tool)).job;
        return trueFalse(`A ${tool.name.split(' ')[1]} tells ${job}.`, isTrue, {
          visual: { text: `${tool.name} → ${job}?` },
          hint: 'What is that tool for?',
        });
      }),
      level('k.pack-measure.order-height', 'Short to Tall', 'order-sequence', 3, (rng) => {
        const heights = randInts(rng, 1, 6, randInt(rng, 3, 4));
        return { ...orderSeq('Tap shortest to tallest!', heights.map((height) => repeat('🟧', height))), hint: 'Line them up by height.' };
      }),
      level('k.pack-measure.compare-tf', 'Measure Check', 'true-false', 3, (rng) => {
        const heavy = choose(rng, HEAVY_THINGS);
        const light = choose(rng, LIGHT_THINGS);
        const claims = [
          { text: `The ${heavy} is heavier than the ${light}.`, truth: true },
          { text: `The ${light} is heavier than the ${heavy}.`, truth: false },
          { text: 'A 🥄 spoon holds more than a 🛁 bathtub.', truth: false },
          { text: 'A 🛁 bathtub holds more than a 🥄 spoon.', truth: true },
        ] as const;
        const claim = choose(rng, claims);
        return trueFalse(claim.text, claim.truth, { hint: 'Think about real life!' });
      }),
      level('k.pack-measure.fills-faster', 'Fill It Up', 'multiple-choice', 3, (rng) => {
        const [small, big] = chooseDistinct(rng, CONTAINERS, 2).sort((a, b) => CONTAINERS.indexOf(a) - CONTAINERS.indexOf(b));
        const asksFaster = randInt(rng, 0, 1) === 0;
        const chosen = asksFaster ? big : small;
        const other = asksFaster ? small : big;
        return mc(asksFaster ? 'Which fills the 🪣 bucket faster?' : 'Which fills the 🪣 bucket slower?', `${chosen.emoji} ${chosen.name}`, [`${other.emoji} ${other.name}`], rng, {
          hint: 'A bigger scoop pours more each time.',
        });
      }),
    ],
  },
  {
    id: 'k.pack-data',
    title: 'Data Dock',
    emoji: '📊',
    domain: 'data',
    levels: [
      level('k.pack-data.tally-tap', 'Count Tallies', 'count-tap', 1, (rng) => {
        const count = randInt(rng, 3, 9);
        return countTap(rng, 'How many tally marks?', count, [count - 1, count + 1, count + 5, count + 2], { min: 1, max: 15 }, { emoji: '|', count }, 'Each | is one. ||||| is five!');
      }),
      level('k.pack-data.vote-count', 'Vote Count', 'count-tap', 1, (rng) => {
        const set = choose(rng, GRAPH_SETS);
        const row = choose(rng, set.rows);
        const count = randInt(rng, 3, 8);
        return countTap(rng, `How many votes for ${row.name}?`, count, [count - 1, count + 1, count + 2], { max: 10 }, { emoji: row.emoji, count }, 'Count the pictures in the row.');
      }),
      level('k.pack-data.belongs', 'It Belongs!', 'multiple-choice', 1, (rng) => {
        const set = choose(rng, SORT_SETS);
        const members = chooseDistinct(rng, set.members, 3);
        const answer = set.members.find((item) => !members.includes(item)) ?? set.members[0];
        return mc(`Which belongs with the ${set.theme}?`, answer, chooseDistinct(rng, set.outsiders, 3), rng, {
          visual: { items: members },
          hint: 'Think: does it match the group?',
        });
      }),
      level('k.pack-data.tally-read', 'Read Tallies', 'multiple-choice', 2, (rng) => {
        const count = randInt(rng, 4, 12);
        return numberMc(rng, 'How many votes do the tally marks show?', count, [count - 1, count + 1, count + 5, count - 5].filter((value) => value > 0), { min: 1, max: 18 }, { text: tallyText(count) }, 'Groups of 5 plus leftovers.');
      }),
      level('k.pack-data.graph-most', 'Most Votes', 'multiple-choice', 2, (rng) => {
        const set = choose(rng, GRAPH_SETS);
        const counts = randInts(rng, 1, 6, 3).sort((a, b) => a - b);
        const rows = set.rows.map((row, index) => ({ ...row, count: counts[index] }));
        const winner = rows.reduce((a, b) => (a.count > b.count ? a : b));
        const text = rows.map((row) => `${row.emoji} ${row.emoji.repeat(row.count)}`).join('\n');
        return mc(`Which ${set.title.slice(0, -1)} got the most votes?`, `${winner.emoji} ${winner.name}`, rows.filter((row) => row !== winner).map((row) => `${row.emoji} ${row.name}`), rng, {
          visual: { text },
          hint: 'The longest row has the most.',
        });
      }),
      level('k.pack-data.tally-match', 'Tally Match', 'match-pairs', 2, (rng) => {
        const counts = randInts(rng, 2, 9, 4);
        return {
          ...matchPairs('Match the tallies to the number!', counts.map((count) => ({ left: tallyText(count).replace('\n', ' '), right: String(count) }))),
          hint: '||||| is 5.',
        };
      }),
      level('k.pack-data.sort-set', 'All Alike', 'multiple-choice', 2, (rng) => {
        const set = choose(rng, SORT_SETS);
        const answer = chooseDistinct(rng, set.members, 3).join(' ');
        const wrongs = [
          chooseDistinct(rng, set.outsiders, 3).join(' '),
          [...chooseDistinct(rng, set.members, 2), choose(rng, set.outsiders)].join(' '),
        ];
        return mc(`Which row is ALL ${set.theme}?`, answer, wrongs, rng, { hint: 'Every picture must match.' });
      }),
      level('k.pack-data.graph-fewest', 'Fewest Votes', 'multiple-choice', 2, (rng) => {
        const set = choose(rng, GRAPH_SETS);
        const counts = randInts(rng, 1, 6, 3).sort((a, b) => a - b);
        const rows = set.rows.map((row, index) => ({ ...row, count: counts[index] }));
        const loser = rows.reduce((a, b) => (a.count < b.count ? a : b));
        const text = rows.map((row) => `${row.emoji} ${row.emoji.repeat(row.count)}`).join('\n');
        return mc(`Which ${set.title.slice(0, -1)} got the fewest votes?`, `${loser.emoji} ${loser.name}`, rows.filter((row) => row !== loser).map((row) => `${row.emoji} ${row.name}`), rng, {
          visual: { text },
          hint: 'The shortest row has the fewest.',
        });
      }),
      level('k.pack-data.graph-diff', 'How Many More?', 'number-pad', 3, (rng) => {
        const set = choose(rng, GRAPH_SETS);
        const [big, small] = randInts(rng, 1, 8, 2).sort((a, b) => b - a);
        const [winner, loser] = chooseDistinct(rng, set.rows, 2);
        return numPad(`How many more votes for ${winner.name} than ${loser.name}?`, big - small, {
          visual: { text: `${winner.emoji} ${winner.emoji.repeat(big)}\n${loser.emoji} ${loser.emoji.repeat(small)}` },
          hint: 'Line up the rows. Count the extras.',
        });
      }),
      level('k.pack-data.graph-total', 'Total Votes', 'number-pad', 3, (rng) => {
        const set = choose(rng, GRAPH_SETS);
        const counts = randInts(rng, 1, 6, 3).sort((a, b) => a - b);
        const total = counts.reduce((a, b) => a + b, 0);
        const text = set.rows.map((row, index) => `${row.emoji} ${row.emoji.repeat(counts[index])}`).join('\n');
        return numPad('How many votes in all?', total, { visual: { text }, hint: 'Add the three rows together.' });
      }),
      level('k.pack-data.tally-tf', 'Tally Truth', 'true-false', 3, (rng) => {
        const count = randInt(rng, 3, 9);
        const isTrue = randInt(rng, 0, 1) === 0;
        const claimed = isTrue ? count : count + choose(rng, [-1, 1, 5]);
        return trueFalse(`These tallies show ${claimed}.`, isTrue, { visual: { text: tallyText(count) }, hint: 'Count carefully — groups of 5 first.' });
      }),
      level('k.pack-data.graph-order', 'Order the Votes', 'order-sequence', 3, (rng) => {
        const set = choose(rng, GRAPH_SETS);
        const counts = randInts(rng, 1, 9, 3).sort((a, b) => a - b);
        const rows = set.rows.map((row, index) => ({ ...row, count: counts[index] }));
        return { ...orderSeq('Fewest votes to most!', rows.map((row) => `${row.emoji} ${row.count}`)), hint: 'Shortest row goes first.' };
      }),
    ],
  },
  {
    id: 'k.pack-money',
    title: 'Coin Cart',
    emoji: '🪙',
    domain: 'money',
    levels: [
      level('k.pack-money.coin-value', 'Coin Values', 'multiple-choice', 1, (rng) => {
        const coin = choose(rng, [
          { name: 'penny', cents: 1 },
          { name: 'nickel', cents: 5 },
          { name: 'dime', cents: 10 },
        ] as const);
        const answerLabel = `${coin.cents} cent${coin.cents > 1 ? 's' : ''}`;
        return mc(`A ${coin.name} is worth how many cents?`, answerLabel, ['1 cent', '5 cents', '10 cents', '25 cents'].filter((label) => label !== answerLabel), rng, {
          visual: { text: `🪙 ${coin.name} = ?¢` },
          hint: 'Penny 1, nickel 5, dime 10.',
        });
      }),
      level('k.pack-money.penny-count', 'Penny Parade', 'count-tap', 1, (rng) => {
        const count = randInt(rng, 3, 8);
        return countTap(rng, 'How many cents?', count, [count - 1, count + 1, count + 5], { max: 12 }, { emoji: '🪙', count }, 'Each penny is 1 cent.');
      }),
      level('k.pack-money.coin-name', 'Name the Coin', 'multiple-choice', 1, (rng) => {
        const coin = choose(rng, [
          { name: 'penny', cents: 1 },
          { name: 'nickel', cents: 5 },
          { name: 'dime', cents: 10 },
        ] as const);
        return mc(`This coin is worth ${coin.cents} cent${coin.cents > 1 ? 's' : ''}. What is it?`, coin.name, ['penny', 'nickel', 'dime', 'quarter'].filter((name) => name !== coin.name), rng, {
          visual: { text: `🪙 = ${coin.cents}¢` },
          hint: 'Penny 1, nickel 5, dime 10.',
        });
      }),
      level('k.pack-money.coin-match', 'Coin Match', 'match-pairs', 2, (rng) => {
        const picks = chooseDistinct(rng, ['penny', 'nickel', 'dime', 'quarter'] as const, 4);
        const valueFor = { penny: '1¢', nickel: '5¢', dime: '10¢', quarter: '25¢' } as const;
        return {
          ...matchPairs('Match each coin to its value!', picks.map((name) => ({ left: name, right: valueFor[name] }))),
          hint: 'Penny is the littlest value.',
        };
      }),
      level('k.pack-money.worth-most', 'Biggest Coin Value', 'multiple-choice', 2, (rng) => {
        const asksMost = randInt(rng, 0, 1) === 0;
        return mc(
          asksMost ? 'Which coin is worth the most?' : 'Which coin is worth the least?',
          asksMost ? 'dime' : 'penny',
          asksMost ? ['penny', 'nickel'] : ['nickel', 'dime'],
          rng,
          { hint: 'Dime beats nickel beats penny.' },
        );
      }),
      level('k.pack-money.nickel-pennies', 'Coin Trade', 'multiple-choice', 2, (rng) => {
        const asksNickel = randInt(rng, 0, 1) === 0;
        return asksNickel
          ? numberMc(rng, 'A nickel trades for how many pennies?', 5, [1, 4, 6, 10], { min: 1, max: 12 }, { text: '⚪ nickel = 🪙 ?' }, 'A nickel is 5 cents.')
          : numberMc(rng, 'A dime trades for how many pennies?', 10, [5, 9, 11, 1], { min: 1, max: 12 }, { text: '🪙 dime = 🪙 ?' }, 'A dime is 10 cents.');
      }),
      level('k.pack-money.pennies-pad', 'Penny Pad', 'number-pad', 2, (rng) => {
        const count = randInt(rng, 2, 9);
        return numPad(`${count} pennies = ? cents`, count, { visual: { emoji: '🪙', count: Math.min(count, 8) }, hint: 'Each penny is 1 cent.' });
      }),
      level('k.pack-money.more-money', 'More Money?', 'multiple-choice', 3, (rng) => {
        const pennies = randInt(rng, 2, 9);
        const coin = pennies >= 5 ? { name: 'nickel', cents: 5 } : { name: 'dime', cents: 10 };
        const coinMore = coin.cents > pennies;
        const answer = coinMore ? `1 ${coin.name}` : `${pennies} pennies`;
        return mc(`Which is more money: 1 ${coin.name} or ${pennies} pennies?`, answer, [coinMore ? `${pennies} pennies` : `1 ${coin.name}`], rng, {
          visual: { text: `${coin.name} = ${coin.cents}¢  vs  ${pennies} × 1¢` },
          hint: 'Turn everything into cents.',
        });
      }),
      level('k.pack-money.enough', 'Enough to Buy?', 'multiple-choice', 3, (rng) => {
        const cost = randInt(rng, 2, 9);
        const enough = randInt(rng, 0, 1) === 0;
        const have = enough ? cost + randInt(rng, 0, 3) : cost - randInt(rng, 1, cost - 1);
        const treat = choose(rng, ['🍬 candy', '🎈 balloon', '🍪 cookie', '🧃 juice box'] as const);
        return mc(`The ${treat} costs ${cost}¢. You have ${have} pennies. Can you buy it?`, enough ? '✅ Yes!' : '❌ No', [enough ? '❌ No' : '✅ Yes!'], rng, {
          visual: { text: `${treat.split(' ')[0]} ${cost}¢   you: ${have}¢` },
          hint: 'Do you have at least as many cents?',
        });
      }),
      level('k.pack-money.mixed-coins', 'Coin Combo', 'number-pad', 3, (rng) => {
        const dimes = randInt(rng, 1, 2);
        const pennies = randInt(rng, 1, 8);
        return numPad(`${dimes} dime${dimes > 1 ? 's' : ''} + ${pennies} pennies = ? cents`, dimes * 10 + pennies, {
          visual: { text: `${'🪙'.repeat(dimes)}\n${'🟤'.repeat(pennies)}` },
          hint: 'Count the dimes by 10s, then add pennies.',
        });
      }),
    ],
  },
  {
    id: 'k.pack-time',
    title: 'Clock Tower',
    emoji: '🕐',
    domain: 'time',
    levels: [
      level('k.pack-time.days-order', 'Days in Order', 'order-sequence', 1, (rng) => {
        const start = randInt(rng, 0, 3);
        return orderSeq('Put the days in order!', [...DAYS.slice(start, start + 4)]);
      }),
      level('k.pack-time.clock-read', 'Read the Clock', 'multiple-choice', 1, (rng) => {
        const hour = randInt(rng, 1, 12);
        return mc('What time is it?', `${hour} o'clock`, [`${(hour % 12) + 1} o'clock`, `${((hour + 1) % 12) + 1} o'clock`, `${((hour + 4) % 12) + 1} o'clock`], rng, {
          visual: { text: CLOCK_EMOJIS[hour - 1] },
          hint: 'The hour hand points at the number.',
        });
      }),
      level('k.pack-time.tomorrow', 'Tomorrow Is...', 'multiple-choice', 1, (rng) => {
        const day = randInt(rng, 0, 6);
        const answer = DAYS[(day + 1) % 7];
        return mc(`Today is ${DAYS[day]}. Tomorrow is ?`, answer, dayDistractors(rng, answer), rng, {
          hint: 'Days go in a circle: Sun → Mon → Tue...',
        });
      }),
      level('k.pack-time.clock-match', 'Clock Match', 'match-pairs', 2, (rng) => {
        const hours = chooseDistinct(rng, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 4);
        return {
          ...matchPairs('Match each clock to the time!', hours.map((hour) => ({ left: CLOCK_EMOJIS[hour - 1], right: `${hour} o'clock` }))),
          hint: 'Read the hour hand.',
        };
      }),
      level('k.pack-time.yesterday', 'Yesterday Was...', 'multiple-choice', 2, (rng) => {
        const day = randInt(rng, 0, 6);
        const answer = DAYS[(day + 6) % 7];
        return mc(`Today is ${DAYS[day]}. Yesterday was ?`, answer, dayDistractors(rng, answer), rng, {
          hint: 'Go one day backward.',
        });
      }),
      level('k.pack-time.which-clock', 'Pick the Clock', 'multiple-choice', 2, (rng) => {
        const hour = randInt(rng, 1, 12);
        const others = chooseDistinct(rng, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].filter((h) => h !== hour), 3);
        return mc(`Which clock shows ${hour} o'clock?`, CLOCK_EMOJIS[hour - 1], others.map((h) => CLOCK_EMOJIS[h - 1]), rng, {
          hint: 'Find the hand pointing at the right number.',
        });
      }),
      level('k.pack-time.hour-pad', 'Type the Hour', 'number-pad', 3, (rng) => {
        const hour = randInt(rng, 1, 12);
        return numPad(`${CLOCK_EMOJIS[hour - 1]} shows ? o'clock`, hour, { visual: { text: CLOCK_EMOJIS[hour - 1] }, hint: 'The hour hand points at the number.' });
      }),
      level('k.pack-time.clock-tf', 'Clock Check', 'true-false', 3, (rng) => {
        const hour = randInt(rng, 1, 12);
        const isTrue = randInt(rng, 0, 1) === 0;
        const claimed = isTrue ? hour : ((hour + randInt(rng, 1, 5)) % 12) + 1;
        return trueFalse(`${CLOCK_EMOJIS[hour - 1]} shows ${claimed} o'clock.`, isTrue, { visual: { text: CLOCK_EMOJIS[hour - 1] }, hint: 'Look at where the hand points.' });
      }),
      level('k.pack-time.weekend', 'Weekend Day?', 'multiple-choice', 3, (rng) => {
        const weekend = choose(rng, ['Saturday', 'Sunday'] as const);
        const weekdays = chooseDistinct(rng, DAYS.filter((d) => d !== 'Saturday' && d !== 'Sunday'), 3);
        return mc('Which day is a weekend day?', weekend, [...weekdays], rng, { hint: 'Weekend = Saturday and Sunday.' });
      }),
      level('k.pack-time.two-days', 'Two Days Later', 'multiple-choice', 3, (rng) => {
        const day = randInt(rng, 0, 6);
        const answer = DAYS[(day + 2) % 7];
        return mc(`Today is ${DAYS[day]}. What day is it in 2 days?`, answer, dayDistractors(rng, answer), rng, {
          hint: 'Hop two days forward.',
        });
      }),
    ],
  },
  {
    id: 'k.pack-patterns',
    title: 'Pattern Path',
    emoji: '🦴',
    domain: 'patterns',
    levels: [
      level('k.pack-patterns.ab', 'AB Patterns', 'multiple-choice', 1, (rng) => {
        const set = choose(rng, Object.values(PATTERN_SETS));
        const [first, second] = chooseDistinct(rng, set, 2);
        const length = randInt(rng, 5, 7);
        const core = [first, second];
        const answer = core[length % 2];
        return mc('What comes next?', answer, chooseDistinct(rng, set.filter((item) => item !== answer), 2), rng, {
          visual: { items: [...Array.from({ length }, (_, index) => core[index % 2]), '❓'] },
          hint: 'It goes back and forth: A, B, A, B.',
        });
      }),
      level('k.pack-patterns.abb', 'ABB Patterns', 'multiple-choice', 1, (rng) => {
        const set = choose(rng, Object.values(PATTERN_SETS));
        const [first, second] = chooseDistinct(rng, set, 2);
        const core = [first, second, second];
        const length = randInt(rng, 6, 8);
        const answer = core[length % 3];
        return mc('What comes next?', answer, chooseDistinct(rng, set.filter((item) => item !== answer), 2), rng, {
          visual: { items: [...Array.from({ length }, (_, index) => core[index % 3]), '❓'] },
          hint: 'Say it: A, B, B — then repeat.',
        });
      }),
      level('k.pack-patterns.aab', 'AAB Patterns', 'multiple-choice', 2, (rng) => {
        const set = choose(rng, Object.values(PATTERN_SETS));
        const [first, second] = chooseDistinct(rng, set, 2);
        const core = [first, first, second];
        const length = randInt(rng, 6, 8);
        const answer = core[length % 3];
        return mc('What comes next?', answer, chooseDistinct(rng, set.filter((item) => item !== answer), 2), rng, {
          visual: { items: [...Array.from({ length }, (_, index) => core[index % 3]), '❓'] },
          hint: 'Two of the same, then one different.',
        });
      }),
      level('k.pack-patterns.abc', 'ABC Patterns', 'multiple-choice', 2, (rng) => {
        const set = choose(rng, Object.values(PATTERN_SETS));
        const [first, second, third] = chooseDistinct(rng, set, 3);
        const core = [first, second, third];
        const length = randInt(rng, 6, 8);
        const answer = core[length % 3];
        return mc('What comes next?', answer, chooseDistinct(rng, set.filter((item) => item !== answer), 3), rng, {
          visual: { items: [...Array.from({ length }, (_, index) => core[index % 3]), '❓'] },
          hint: 'Three in a row, then repeat.',
        });
      }),
      level('k.pack-patterns.gap', 'Missing Piece', 'multiple-choice', 2, (rng) => {
        const set = choose(rng, Object.values(PATTERN_SETS));
        const [first, second] = chooseDistinct(rng, set, 2);
        const core = [first, second];
        const length = randInt(rng, 6, 7);
        const gap = randInt(rng, 1, length - 2);
        const items = Array.from({ length }, (_, index) => (index === gap ? '❓' : core[index % 2]));
        const answer = core[gap % 2];
        return mc('Which piece is missing?', answer, chooseDistinct(rng, set.filter((item) => item !== answer), 2), rng, {
          visual: { items },
          hint: 'Fill the hole so the pattern keeps going.',
        });
      }),
      level('k.pack-patterns.grow', 'Growing Towers', 'multiple-choice', 2, (rng) => {
        const emoji = choose(rng, ['⭐', '🟥', '🌼', '🐟'] as const);
        const steps = randInt(rng, 3, 4);
        const answer = emoji.repeat(steps + 1);
        const items = Array.from({ length: steps }, (_, index) => emoji.repeat(index + 1));
        return mc('What comes next?', answer, [emoji.repeat(Math.max(1, steps - 1)), emoji.repeat(steps + 2), emoji.repeat(steps)], rng, {
          visual: { items: [...items, '❓'] },
          hint: 'Each tower gets one more.',
        });
      }),
      level('k.pack-patterns.pattern-tf', 'Pattern Name', 'true-false', 2, (rng) => {
        const set = choose(rng, Object.values(PATTERN_SETS));
        const kind = choose(rng, ['AB', 'ABC'] as const);
        const picks = kind === 'AB' ? chooseDistinct(rng, set, 2) : chooseDistinct(rng, set, 3);
        const items = Array.from({ length: 6 }, (_, index) => picks[index % picks.length]);
        const isTrue = randInt(rng, 0, 1) === 0;
        const claim = isTrue ? kind : kind === 'AB' ? 'ABC' : 'AB';
        return trueFalse(`This is an ${claim} pattern.`, isTrue, { visual: { items }, hint: 'Find the repeating chunk.' });
      }),
      level('k.pack-patterns.num-grow', 'Number Stairs', 'multiple-choice', 3, (rng) => {
        const step = choose(rng, [2, 3, 4, 5]);
        const start = randInt(rng, 1, 10);
        const terms = Array.from({ length: 4 }, (_, index) => start + index * step);
        const answer = start + 4 * step;
        return numberMc(rng, 'What comes next?', answer, [answer - 1, answer + 1, answer - step, answer + step], { max: 60 }, { text: `${terms.join(', ')}, ?` }, `Each step is +${step}.`);
      }),
      level('k.pack-patterns.core', 'Find the Core', 'multiple-choice', 3, (rng) => {
        const set = choose(rng, Object.values(PATTERN_SETS));
        const [first, second] = chooseDistinct(rng, set, 2);
        const answer = `${first}${second}`;
        return mc('What is the repeating chunk (the core)?', answer, [`${second}${first}`, `${first}${first}`, `${second}${second}`], rng, {
          visual: { items: Array.from({ length: 6 }, (_, index) => [first, second][index % 2]) },
          hint: 'The smallest piece that repeats.',
        });
      }),
      level('k.pack-patterns.shrink', 'Shrinking Stairs', 'multiple-choice', 3, (rng) => {
        const step = choose(rng, [1, 2]);
        const start = randInt(rng, 8, 20);
        const terms = Array.from({ length: 4 }, (_, index) => start - index * step);
        const answer = start - 4 * step;
        return numberMc(rng, 'What comes next?', answer, [answer + 1, answer - 1, answer - step, answer + step], { min: 0, max: 25 }, { text: `${terms.join(', ')}, ?` }, 'Each step takes some away.');
      }),
      level('k.pack-patterns.pad', 'Pattern Pad', 'number-pad', 3, (rng) => {
        const step = choose(rng, [2, 3, 5]);
        const start = randInt(rng, 1, 8);
        const terms = Array.from({ length: 4 }, (_, index) => start + index * step);
        return numPad(`${terms.join(', ')}, ?`, start + 4 * step, { visual: { text: `${terms.join(', ')}, ?` }, hint: `Add ${step} each time.` });
      }),
    ],
  },
  {
    id: 'k.pack-stories',
    title: 'Story Stream',
    emoji: '📖',
    domain: 'word-problems',
    levels: [
      level('k.pack-stories.join-5', 'Come Along (to 5)', 'multiple-choice', 1, (rng) => {
        const prop = choose(rng, STORY_PROPS);
        const first = randInt(rng, 1, 3);
        const second = randInt(rng, 1, 5 - first);
        const answer = first + second;
        return numberMc(rng, `${first} ${prop.noun} ${prop.place}. ${second} more come. How many now?`, answer, [answer - 1, answer + 1, first - second > 0 ? first - second : second, answer + 2], { max: 8 }, { emoji: prop.emoji, groups: [first, second] }, 'Put the groups together and count.');
      }),
      level('k.pack-stories.take-5', 'Go Away (to 5)', 'multiple-choice', 1, (rng) => {
        const prop = choose(rng, STORY_PROPS);
        const first = randInt(rng, 2, 5);
        const second = randInt(rng, 1, first - 1);
        const answer = first - second;
        return numberMc(rng, `${first} ${prop.noun} ${prop.place}. ${second} go away. How many are left?`, answer, [answer + 1, answer - 1, first, first + second > 5 ? answer + 2 : first + second], { max: 7 }, { emoji: prop.emoji, count: first }, 'Start with all of them, then take away.');
      }),
      level('k.pack-stories.join-10', 'Come Along (to 10)', 'multiple-choice', 2, (rng) => {
        const prop = choose(rng, STORY_PROPS);
        const first = randInt(rng, 3, 7);
        const second = randInt(rng, 1, 10 - first);
        const answer = first + second;
        return numberMc(rng, `${first} ${prop.noun} ${prop.place}. ${second} more come. How many now?`, answer, [answer - 1, answer + 1, first, answer + 2], { max: 12 }, { emoji: prop.emoji, groups: [first, second] }, 'Count on from the first group.');
      }),
      level('k.pack-stories.take-10', 'Go Away (to 10)', 'multiple-choice', 2, (rng) => {
        const prop = choose(rng, STORY_PROPS);
        const first = randInt(rng, 5, 10);
        const second = randInt(rng, 1, first - 1);
        const answer = first - second;
        return numberMc(rng, `${first} ${prop.noun} ${prop.place}. ${second} go away. How many are left?`, answer, [answer + 1, answer - 1, first, second], { max: 11 }, { emoji: prop.emoji, count: first }, 'Cross out the ones that leave.');
      }),
      level('k.pack-stories.compare', 'Who Has More?', 'multiple-choice', 2, (rng) => {
        const prop = choose(rng, STORY_PROPS);
        const names = chooseDistinct(rng, ['Sam', 'Mia', 'Leo', 'Zoe', 'Max'], 2);
        const [big, small] = randInts(rng, 1, 9, 2).sort((a, b) => b - a);
        return numberMc(rng, `${names[0]} has ${big} ${prop.noun}. ${names[1]} has ${small}. How many more does ${names[0]} have?`, big - small, [big - small - 1, big - small + 1, small, big], { min: 0, max: 12 }, { emoji: prop.emoji, groups: [big, small] }, 'Line them up. Count the extras.');
      }),
      level('k.pack-stories.story-pad', 'Story Pad', 'number-pad', 2, (rng) => {
        const prop = choose(rng, STORY_PROPS);
        const joining = randInt(rng, 0, 1) === 0;
        if (joining) {
          const first = randInt(rng, 2, 7);
          const second = randInt(rng, 1, 10 - first);
          return numPad(`${first} ${prop.noun} ${prop.place}. ${second} more come. How many now?`, first + second, { visual: { emoji: prop.emoji, groups: [first, second] }, hint: 'Is the group getting bigger or smaller?' });
        }
        const first = randInt(rng, 4, 10);
        const second = randInt(rng, 1, first - 1);
        return numPad(`${first} ${prop.noun} ${prop.place}. ${second} go away. How many are left?`, first - second, { visual: { emoji: prop.emoji, count: first }, hint: 'Is the group getting bigger or smaller?' });
      }),
      level('k.pack-stories.story-tf', 'Story Check', 'true-false', 2, (rng) => {
        const prop = choose(rng, STORY_PROPS);
        const first = randInt(rng, 3, 8);
        const second = randInt(rng, 1, 3);
        const correct = first + second;
        const isTrue = randInt(rng, 0, 1) === 0;
        const shown = isTrue ? correct : correct + choose(rng, [-1, 1]);
        return trueFalse(`${first} ${prop.noun} ${prop.place}. ${second} more come. Now there are ${shown}.`, isTrue, {
          visual: { emoji: prop.emoji, count: Math.min(first, 8) },
          hint: `Count: ${first} and ${second} more is...`,
        });
      }),
      level('k.pack-stories.two-step', 'Two-Step Tale', 'multiple-choice', 3, (rng) => {
        const prop = choose(rng, STORY_PROPS);
        const first = randInt(rng, 3, 6);
        const second = randInt(rng, 1, 3);
        const third = randInt(rng, 1, Math.min(first + second - 1, 2));
        const answer = first + second - third;
        return numberMc(rng, `${first} ${prop.noun} ${prop.place}. ${second} more come. Then ${third} leave. How many now?`, answer, [answer - 1, answer + 1, first + second, answer + 2], { max: 12 }, { text: `${first} + ${second} − ${third} = ?` }, 'Do one step at a time.');
      }),
      level('k.pack-stories.miss-part', 'How Many Went?', 'multiple-choice', 3, (rng) => {
        const prop = choose(rng, STORY_PROPS);
        const first = randInt(rng, 5, 10);
        const left = randInt(rng, 1, first - 1);
        const answer = first - left;
        return numberMc(rng, `${first} ${prop.noun} ${prop.place}. Some go away. Now there are ${left}. How many went?`, answer, [answer - 1, answer + 1, left, first], { max: 11 }, { emoji: prop.emoji, count: first }, 'Count backward from the start.');
      }),
      level('k.pack-stories.which-eq', 'Match the Story', 'multiple-choice', 3, (rng) => {
        const prop = choose(rng, STORY_PROPS);
        const joining = randInt(rng, 0, 1) === 0;
        const first = randInt(rng, 3, 8);
        const second = randInt(rng, 1, 3);
        const answer = joining ? `${first} + ${second} = ${first + second}` : `${first} − ${second} = ${first - second}`;
        const distractors = joining
          ? [`${first} − ${second} = ${first - second}`, `${second} + ${first} = ${first + second + 1}`, `${first} + ${second + 1} = ${first + second + 1}`]
          : [`${first} + ${second} = ${first + second}`, `${second} − ${first} = ${Math.abs(second - first)}`, `${first} − ${second - 1} = ${first - second + 1}`];
        return mc(`Which number sentence matches? ${first} ${prop.noun}, ${second} ${joining ? 'come' : 'go away'}.`, answer, distractors, rng, {
          hint: 'Come = add. Go away = subtract.',
        });
      }),
      level('k.pack-stories.story-match', 'Story Match', 'match-pairs', 3, (rng) => {
        const answers = randInts(rng, 1, 9, 4);
        const pairs = answers.map((answer) => {
          const prop = choose(rng, STORY_PROPS);
          const total = answer + randInt(rng, 1, 3);
          return { left: `${total} ${prop.noun}, ${total - answer} leave`, right: String(answer) };
        });
        return { ...matchPairs('Match each story to how many are left!', pairs), hint: 'Solve each story first.' };
      }),
    ],
  },
  {
    id: 'k.pack-algebra',
    title: 'Balance Bridge',
    emoji: '⚖️',
    domain: 'algebra',
    levels: [
      level('k.pack-algebra.one-more', 'One More', 'multiple-choice', 1, (rng) => {
        const number = randInt(rng, 1, 19);
        return numberMc(rng, `One more than ${number} is ?`, number + 1, [number, number + 2, number - 1, number + 10], { min: 0, max: 30 }, { text: `${number} → ?` }, 'One more is the next counting number.');
      }),
      level('k.pack-algebra.one-less', 'One Less', 'multiple-choice', 1, (rng) => {
        const number = randInt(rng, 2, 20);
        return numberMc(rng, `One less than ${number} is ?`, number - 1, [number, number + 1, number - 2, number - 10], { min: 0, max: 21 }, { text: `? ← ${number}` }, 'One less is the number just before.');
      }),
      level('k.pack-algebra.color-spill', 'Spill the Beans', 'multiple-choice', 1, (rng) => {
        const whole = randInt(rng, 4, 9);
        const first = randInt(rng, 1, whole - 1);
        const answer = whole - first;
        return numberMc(rng, `${whole} beans spilled! How many are 🟨?`, answer, [answer - 1, answer + 1, first, whole], { max: 10 }, { text: twoColorSpill(whole, first, '🟥', '🟨') }, 'Both colors together make the whole.');
      }),
      level('k.pack-algebra.miss-addend', 'Missing Piece', 'multiple-choice', 2, (rng) => {
        const whole = randInt(rng, 5, 10);
        const part = randInt(rng, 1, whole - 1);
        const answer = whole - part;
        return numberMc(rng, `${part} + ? = ${whole}`, answer, [answer + 1, answer - 1, part, whole], { max: 11 }, { text: `${part} + ▢ = ${whole}` }, 'Count up from the part to the whole.');
      }),
      level('k.pack-algebra.same-value', 'Same or Not?', 'true-false', 2, (rng) => {
        const leftA = randInt(rng, 1, 5);
        const leftB = randInt(rng, 1, 5);
        const leftValue = leftA + leftB;
        const isTrue = randInt(rng, 0, 1) === 0;
        const rightA = randInt(rng, 1, leftValue - 1);
        const rightB = isTrue ? leftValue - rightA : leftValue - rightA + choose(rng, [-1, 1, 2].filter((d) => leftValue - rightA + d > 0 && leftValue - rightA + d !== leftValue - rightA));
        return trueFalse(`${leftA} + ${leftB} is the same as ${rightA} + ${rightB}.`, leftValue === rightA + rightB, {
          visual: { text: `${leftA}+${leftB}  ⚖️  ${rightA}+${rightB}` },
          hint: 'Solve each side, then compare.',
        });
      }),
      level('k.pack-algebra.make-ten', 'Make Ten', 'multiple-choice', 2, (rng) => {
        const part = randInt(rng, 1, 9);
        const answer = 10 - part;
        return numberMc(rng, `10 = ${part} + ?`, answer, [answer + 1, answer - 1, part, 10], { max: 11 }, { text: `10 = ${part} + ▢` }, 'Think of the ten frame.');
      }),
      level('k.pack-algebra.more-less-pad', 'More or Less Pad', 'number-pad', 2, (rng) => {
        const number = randInt(rng, 10, 30);
        const asksMore = randInt(rng, 0, 1) === 0;
        return numPad(`What is 1 ${asksMore ? 'more' : 'less'} than ${number}?`, asksMore ? number + 1 : number - 1, {
          visual: { text: `${number} ${asksMore ? '+ 1' : '− 1'} = ?` },
          hint: 'One neighbor before or after.',
        });
      }),
      level('k.pack-algebra.miss-addend-pad', 'Missing Piece Pad', 'number-pad', 3, (rng) => {
        const whole = randInt(rng, 6, 10);
        const part = randInt(rng, 1, whole - 1);
        const leftSide = randInt(rng, 0, 1) === 0;
        return numPad(leftSide ? `? + ${part} = ${whole}` : `${part} + ? = ${whole}`, whole - part, {
          visual: { text: `${leftSide ? '▢' : part} + ${leftSide ? part : '▢'} = ${whole}` },
          hint: 'Count on from the part you know.',
        });
      }),
      level('k.pack-algebra.balance', 'Balance It!', 'multiple-choice', 3, (rng) => {
        const leftA = randInt(rng, 2, 6);
        const leftB = randInt(rng, 2, 9 - leftA);
        const value = leftA + leftB;
        const rightA = randInt(rng, 1, value - 1);
        const answer = value - rightA;
        return numberMc(rng, `${leftA} + ${leftB} = ${rightA} + ?`, answer, [answer - 1, answer + 1, value, leftB], { max: 12 }, { text: `${leftA}+${leftB}  ⚖️  ${rightA}+▢` }, 'Both sides must be equal.');
      }),
      level('k.pack-algebra.bond-match', 'Bond Buddies', 'match-pairs', 3, (rng) => {
        const whole = choose(rng, [7, 8, 9]);
        const parts = randInts(rng, 1, whole - 1, 4);
        return {
          ...matchPairs(`Match the buddies that make ${whole}!`, parts.map((part) => ({ left: String(part), right: String(whole - part) }))),
          hint: `${whole} = a part + another part.`,
        };
      }),
      level('k.pack-algebra.equal-means', 'What Does = Mean?', 'multiple-choice', 3, (rng) => {
        const a = randInt(rng, 1, 5);
        const b = randInt(rng, 1, 5);
        return mc(`In ${a} + ${b} = ${a + b}, the = means ?`, 'the same as', ['more than', 'less than', 'plus'], rng, {
          visual: { text: `${a} + ${b} = ${a + b}` },
          hint: 'The two sides balance like a scale.',
        });
      }),
    ],
  },
];
