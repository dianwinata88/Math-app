import { randInt, randInts } from '../../core/rng';
import type { GradeDef, Question, Rng } from '../../core/types';
import { level, matchPairs, mc, orderSeq, trueFalse } from '../helpers';
import {
  BIG_THINGS,
  COLOR_GROUPS,
  NUMBER_WORDS,
  PATTERN_SETS,
  PREK_CRITTERS,
  SHAPES_2D,
  SHAPE_OBJECTS_2D,
  SMALL_THINGS,
} from './banks';
import { choose, chooseDistinct, pickChoices, repeat } from './choices';

const LOOK_ALIKE: Record<number, number[]> = {
  0: [8],
  1: [7],
  2: [5],
  3: [8],
  5: [2],
  6: [9],
  7: [1],
  8: [3, 0],
  9: [6],
};
const PREK_PATTERN_SETS = [PATTERN_SETS.colors, PATTERN_SETS.animals, PATTERN_SETS.fruit];

function numberQuestion(
  kind: 'multiple-choice' | 'count-tap',
  prompt: string,
  answer: number,
  options: ReturnType<typeof pickChoices>,
  visual?: Question['visual'],
  hint?: string,
): Question {
  return { kind, prompt, answer: String(answer), options, visual, hint };
}

function objectForShape(shape: string) {
  return SHAPE_OBJECTS_2D.find((entry) => entry.shape === shape)!;
}

function oddColorQuestion(rng: Rng): Question {
  const [base, oddGroup] = chooseDistinct(rng, COLOR_GROUPS, 2);
  const ordinary = chooseDistinct(rng, base.items, 3);
  const odd = choose(rng, oddGroup.items.filter((item) => !ordinary.includes(item)));
  return mc('Which is a different color?', odd, ordinary, rng);
}

function oddShapeQuestion(rng: Rng): Question {
  const eligible = SHAPE_OBJECTS_2D.filter((shape) => shape.items.length >= 3);
  const base = choose(rng, eligible);
  const other = choose(rng, eligible.filter((shape) => shape.shape !== base.shape));
  const ordinary = chooseDistinct(rng, base.items, 3);
  const odd = choose(rng, other.items.filter((item) => !ordinary.includes(item)));
  return mc('Which is a different shape?', odd, ordinary, rng);
}

export const prek: GradeDef = {
  id: 'prek',
  title: 'PreK',
  ages: '3–4',
  units: [
    {
      id: 'prek.counting',
      title: 'Puppy Counting',
      emoji: '🐶',
      domain: 'counting',
      levels: [
        level('prek.counting.count-to-5', 'Count to 5', 'count-tap', 1, (rng) => {
          const { emoji } = choose(rng, PREK_CRITTERS);
          const count = randInt(rng, 1, 5);
          return numberQuestion('count-tap', `How many ${emoji}?`, count, pickChoices(rng, count, [count - 1, count + 1, count + 2], { count: 3, min: 1, max: 7 }), { emoji, count });
        }, 5),
        level('prek.counting.count-to-10', 'Count to 10', 'count-tap', 2, (rng) => {
          const { emoji } = choose(rng, PREK_CRITTERS);
          const count = randInt(rng, 6, 10);
          return numberQuestion('count-tap', `How many ${emoji}?`, count, pickChoices(rng, count, [count - 1, count + 1, count - 2], { count: 4, min: 1, max: 12 }), { emoji, count });
        }),
        level('prek.counting.which-group', 'Which Has N?', 'multiple-choice', 2, (rng) => {
          const { emoji } = choose(rng, PREK_CRITTERS);
          const count = randInt(rng, 2, 6);
          const answer = repeat(emoji, count);
          return mc(`Find ${count} ${emoji}!`, answer, [repeat(emoji, count - 1), repeat(emoji, count + 1)], rng);
        }),
        level('prek.counting.count-and-type', 'Count the Bones', 'count-tap', 3, (rng) => {
          const count = randInt(rng, 3, 10);
          const first = randInt(rng, 1, count - 1);
          const emoji = choose(rng, ['🦴', '🎾']);
          return numberQuestion(
            'count-tap',
            'How many in all?',
            count,
            pickChoices(rng, count, [first, count - first, count + 1, count - 1], { count: 4, min: 1, max: 12 }),
            { emoji, groups: [first, count - first] },
            'Count each one just once!',
          );
        }),
      ],
    },
    {
      id: 'prek.numbers',
      title: 'Doghouse Numbers',
      emoji: '🏠',
      domain: 'counting',
      levels: [
        level('prek.numbers.find-number', 'Find the Number', 'multiple-choice', 1, (rng) => {
          const number = randInt(rng, 0, 10);
          const word = NUMBER_WORDS[number];
          const options = pickChoices(rng, number, [...(LOOK_ALIKE[number] ?? []), number - 1, number + 1], { count: 3, min: 0, max: 10 });
          return numberQuestion('multiple-choice', `Tap the number ${word}!`, number, options, { text: `🐶 ${word}` });
        }, 5),
        level('prek.numbers.dice-dots', 'Dice Dots', 'multiple-choice', 2, (rng) => {
          const number = randInt(rng, 1, 6);
          const dice = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
          return numberQuestion('multiple-choice', 'How many dots?', number, pickChoices(rng, number, [number - 1, number + 1, number + 2], { count: 4, min: 1, max: 8 }), { text: dice[number - 1] });
        }),
        level('prek.numbers.zero-hero', 'Zero Hero', 'true-false', 3, (rng) => {
          const count = randInt(rng, 0, 10);
          const claim = count === 0
            ? randInt(rng, 0, 1) === 0 ? 0 : 1
            : randInt(rng, 0, 1) === 0 ? count : count + choose(rng, [-1, 1]);
          return trueFalse(`Is this ${claim}?`, claim === count, {
            visual: count > 0 ? { emoji: '🐶', count } : { text: '🥣' },
            hint: 'An empty bowl has 0!',
          });
        }),
      ],
    },
    {
      id: 'prek.matching',
      title: 'Match the Paws',
      emoji: '🐾',
      domain: 'counting',
      levels: [
        level('prek.matching.match-3', 'Match 3', 'match-pairs', 1, (rng) => {
          const emoji = choose(rng, PREK_CRITTERS).emoji;
          const counts = randInts(rng, 1, 5, 3);
          return matchPairs('Match number to group!', counts.map((count) => ({ left: String(count), right: repeat(emoji, count) })));
        }, 5),
        level('prek.matching.match-4', 'Match 4', 'match-pairs', 2, (rng) => {
          const emoji = choose(rng, PREK_CRITTERS).emoji;
          const counts = randInts(rng, 1, 8, 4);
          return matchPairs('Match number to group!', counts.map((count) => ({ left: String(count), right: repeat(emoji, count) })));
        }),
        level('prek.matching.match-5', 'Match 5', 'match-pairs', 3, (rng) => {
          const emoji = choose(rng, PREK_CRITTERS).emoji;
          const counts = randInts(rng, 1, 10, 5);
          return {
            ...matchPairs('Match number to group!', counts.map((count) => ({ left: String(count), right: repeat(emoji, count) }))),
            hint: 'Count each group, then find its number.',
          };
        }),
      ],
    },
    {
      id: 'prek.compare',
      title: 'Treat Compare',
      emoji: '🦴',
      domain: 'counting',
      levels: [
        level('prek.compare.which-more', 'Which Has More?', 'multiple-choice', 1, (rng) => {
          const [first, second] = chooseDistinct(rng, [1, 2, 3, 4, 5], 2);
          const emoji = choose(rng, PREK_CRITTERS).emoji;
          const asksMore = randInt(rng, 0, 1) === 0;
          const answer = asksMore ? Math.max(first, second) : Math.min(first, second);
          return mc(
            asksMore ? 'Which has more?' : 'Which has fewer?',
            repeat(emoji, answer),
            [repeat(emoji, answer === first ? second : first)],
            rng,
          );
        }, 5),
        level('prek.compare.more-fewer-same', 'More, Fewer, Same', 'multiple-choice', 2, (rng) => {
          const first = randInt(rng, 1, 6);
          const same = randInt(rng, 0, 2) === 0;
          const second = same ? first : choose(rng, [1, 2, 3, 4, 5, 6].filter((value) => value !== first));
          const answer = first === second ? '🟰 Same' : first > second ? '⬅️ Left' : '➡️ Right';
          return mc('Which side has more?', answer, ['⬅️ Left', '➡️ Right', '🟰 Same'].filter((choice) => choice !== answer), rng, {
            visual: { emoji: choose(rng, PREK_CRITTERS).emoji, groups: [first, second] },
          });
        }),
        level('prek.compare.true-or-false', 'More or Not?', 'true-false', 3, (rng) => {
          const [first, second] = chooseDistinct(rng, [1, 2, 3, 4, 5, 6, 7, 8], 2);
          const asksMore = randInt(rng, 0, 1) === 0;
          return trueFalse(
            asksMore ? 'Left has more?' : 'Left has fewer?',
            asksMore ? first > second : first < second,
            { visual: { emoji: choose(rng, PREK_CRITTERS).emoji, groups: [first, second] }, hint: 'Match them up one by one.' },
          );
        }),
      ],
    },
    {
      id: 'prek.order',
      title: 'Park Path 1–10',
      emoji: '🚶',
      domain: 'counting',
      levels: [
        level('prek.order.order-3', 'Line Up 3', 'order-sequence', 1, (rng) => {
          const start = randInt(rng, 1, 8);
          return orderSeq('Tap from small to big!', Array.from({ length: 3 }, (_, index) => String(start + index)));
        }, 5),
        level('prek.order.order-5', 'Line Up 5', 'order-sequence', 2, (rng) => {
          const start = randInt(rng, 1, 6);
          return orderSeq('Tap from small to big!', Array.from({ length: 5 }, (_, index) => String(start + index)));
        }),
        level('prek.order.what-next', 'What Comes Next?', 'multiple-choice', 3, (rng) => {
          const start = randInt(rng, 1, 7);
          const answer = start + 3;
          return numberQuestion(
            'multiple-choice',
            'What comes next?',
            answer,
            pickChoices(rng, answer, [answer - 1, answer + 1, start], { count: 3, min: 1, max: 10 }),
            { text: `${start}, ${start + 1}, ${start + 2}, ?` },
            'Count up one more!',
          );
        }),
      ],
    },
    {
      id: 'prek.shapes',
      title: 'Shape Garden',
      emoji: '🔷',
      domain: 'geometry',
      levels: [
        level('prek.shapes.find-shape', 'Find the Shape', 'multiple-choice', 1, (rng) => {
          const shape = choose(rng, SHAPES_2D);
          const distractors = chooseDistinct(rng, SHAPES_2D.filter((item) => item !== shape), 2);
          return mc(`Tap the ${shape.name}!`, shape.glyph, distractors.map((item) => item.glyph), rng);
        }, 5),
        level('prek.shapes.shape-hunt', 'Shape Hunt', 'multiple-choice', 2, (rng) => {
          const shape = choose(rng, SHAPES_2D);
          const object = choose(rng, objectForShape(shape.name).items);
          const distractors = chooseDistinct(rng, SHAPES_2D.filter((item) => item !== shape), 2);
          const label = `${shape.glyph} ${shape.name}`;
          return mc('What shape is it?', label, distractors.map((item) => `${item.glyph} ${item.name}`), rng, { visual: { text: object } });
        }),
        level('prek.shapes.shape-names', 'Shape Names', 'match-pairs', 2, (rng) => {
          const shapes = chooseDistinct(rng, SHAPES_2D, 3);
          return matchPairs('Match each shape to its name!', shapes.map((shape) => ({ left: shape.glyph, right: shape.name })));
        }),
        level('prek.shapes.corners', 'Count Corners', 'multiple-choice', 3, (rng) => {
          const shape = choose(rng, [
            { glyph: '🔺', corners: 3 },
            { glyph: '🟦', corners: 4 },
            { glyph: '▬', corners: 4 },
            { glyph: '🔴', corners: 0 },
          ]);
          return numberQuestion('multiple-choice', 'How many corners?', shape.corners, pickChoices(rng, shape.corners, [shape.corners + 1, shape.corners - 1, 0, 1, 2, 3, 4], { count: 3, min: 0, max: 5 }), { text: shape.glyph }, 'Touch each corner and count.');
        }),
      ],
    },
    {
      id: 'prek.patterns',
      title: 'Pattern Parade',
      emoji: '🎨',
      domain: 'patterns',
      levels: [
        level('prek.patterns.ab', 'AB Patterns', 'multiple-choice', 1, (rng) => {
          const set = choose(rng, PREK_PATTERN_SETS);
          const [first, second, extra] = chooseDistinct(rng, set, 3);
          const length = randInt(rng, 4, 5);
          const core = [first, second];
          const answer = core[length % 2];
          return mc('What comes next?', answer, [first, second, extra].filter((item) => item !== answer), rng, {
            visual: { items: [...Array.from({ length }, (_, index) => core[index % 2]), '❓'] },
          });
        }, 5),
        level('prek.patterns.aab-abb', 'AAB & ABB', 'multiple-choice', 2, (rng) => {
          const set = choose(rng, PREK_PATTERN_SETS);
          const [first, second, extra] = chooseDistinct(rng, set, 3);
          const core = randInt(rng, 0, 1) === 0 ? [first, first, second] : [first, second, second];
          const length = randInt(rng, 6, 8);
          const answer = core[length % 3];
          return mc('What comes next?', answer, [first, second, extra].filter((item) => item !== answer), rng, {
            visual: { items: [...Array.from({ length }, (_, index) => core[index % 3]), '❓'] },
          });
        }),
        level('prek.patterns.missing', 'Missing Piece', 'multiple-choice', 3, (rng) => {
          const set = choose(rng, PREK_PATTERN_SETS);
          const [first, second, extra] = chooseDistinct(rng, set, 3);
          const core = choose(rng, [[first, second], [first, first, second], [first, second, second]]);
          const index = randInt(rng, 2, 6);
          const answer = core[index % core.length];
          const items: string[] = Array.from({ length: 7 }, (_, position) => core[position % core.length]);
          items[index] = '❓';
          return mc('What is missing?', answer, [first, second, extra].filter((item) => item !== answer), rng, {
            visual: { items },
            hint: 'Say the pattern out loud!',
          });
        }),
      ],
    },
    {
      id: 'prek.size',
      title: 'Big & Small',
      emoji: '📏',
      domain: 'measurement',
      levels: [
        level('prek.size.big-small', 'Big or Small?', 'multiple-choice', 1, (rng) => {
          const big = choose(rng, BIG_THINGS);
          const small = choose(rng, SMALL_THINGS);
          const asksBigger = randInt(rng, 0, 1) === 0;
          return mc(asksBigger ? 'Which is bigger?' : 'Which is smaller?', asksBigger ? big : small, [asksBigger ? small : big], rng);
        }, 5),
        level('prek.size.long-short', 'Long or Short?', 'multiple-choice', 2, (rng) => {
          const lengths = chooseDistinct(rng, [1, 2, 3, 4, 5, 6], 3);
          const asksLongest = randInt(rng, 0, 1) === 0;
          const target = asksLongest ? Math.max(...lengths) : Math.min(...lengths);
          const labels = lengths.map((length) => `🚂${repeat('🚃', length)}`);
          const answer = labels[lengths.indexOf(target)];
          return mc(asksLongest ? 'Which train is longest?' : 'Which train is shortest?', answer, labels.filter((label) => label !== answer), rng);
        }),
        level('prek.size.tall-short', 'Tall Towers', 'multiple-choice', 3, (rng) => {
          const heights = chooseDistinct(rng, [1, 2, 3, 4, 5], 3);
          const asksTallest = randInt(rng, 0, 1) === 0;
          const target = asksTallest ? Math.max(...heights) : Math.min(...heights);
          const labels = heights.map((height) => Array(height).fill('🧱').join('\n'));
          const answer = labels[heights.indexOf(target)];
          return mc(asksTallest ? 'Which tower is tallest?' : 'Which tower is shortest?', answer, labels.filter((label) => label !== answer), rng, {
            hint: 'Look at the top of each tower.',
          });
        }),
      ],
    },
    {
      id: 'prek.sorting',
      title: 'Toy Sorting',
      emoji: '🧺',
      domain: 'data',
      levels: [
        level('prek.sorting.color-odd', 'Odd Color Out', 'multiple-choice', 1, oddColorQuestion, 5),
        level('prek.sorting.shape-odd', 'Odd Shape Out', 'multiple-choice', 2, oddShapeQuestion),
        level('prek.sorting.color-match', 'Color Match', 'match-pairs', 3, (rng) => {
          const groups = chooseDistinct(rng, COLOR_GROUPS, randInt(rng, 3, 4));
          return {
            ...matchPairs('Match each to its color!', groups.map((group) => ({ left: choose(rng, group.items), right: group.square }))),
            hint: 'Look at the color, not the thing.',
          };
        }),
      ],
    },
  ],
};
