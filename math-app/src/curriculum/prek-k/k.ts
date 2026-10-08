import { randInt, randInts } from '../../core/rng';
import type { GradeDef, Question, Rng } from '../../core/types';
import { level, matchPairs, mc, numPad, orderSeq, trueFalse } from '../helpers';
import {
  CONTAINERS,
  HEAVY_THINGS,
  LIGHT_THINGS,
  NUMBER_WORDS,
  PATTERN_SETS,
  SHAPES_2D,
  SOLIDS_3D,
  STORY_CONTEXTS,
} from './banks';
import { choose, chooseDistinct, pickChoices, repeat } from './choices';
import { kPack } from './k-pack';

const FOOD = ['🍎', '🍌', '🍓', '🍪', '🧁'] as const;
const POSITION_LABELS = ['⬆️ above', '⬇️ below', '➡️ beside'] as const;
const POSITION_NAMES = ['above', 'below', 'beside'] as const;
const POSITION_OBJECTS = ['🐦', '🐱', '⚽', '🎈', '🐞'] as const;
const POSITION_REFERENCES = ['🌳', '🪑', '📦', '🏠', '🛏️'] as const;

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

function promptForStory(a: number, b: number, noun: string, place: string, joining: boolean): string {
  return joining
    ? `${a} ${noun} ${place}. ${b} more come. How many now?`
    : `${a} ${noun} ${place}. ${b} go away. How many are left?`;
}

function positionVisual(subject: string, reference: string, position: string): string {
  if (position === 'above') return `${subject}\n${reference}`;
  if (position === 'below') return `${reference}\n${subject}`;
  return `${reference} ${subject}`;
}

function positionQuestion(rng: Rng, trueFalseMode: boolean): Question {
  const subject = choose(rng, POSITION_OBJECTS);
  const reference = choose(rng, POSITION_REFERENCES);
  const actual = choose(rng, POSITION_NAMES);
  const visual = { text: positionVisual(subject, reference, actual) };

  if (!trueFalseMode) {
    const index = POSITION_NAMES.indexOf(actual);
    return mc(`Where is the ${subject}?`, POSITION_LABELS[index], POSITION_LABELS.filter((_, optionIndex) => optionIndex !== index), rng, { visual, hint: 'Look at the top and the bottom.' });
  }

  const claim = randInt(rng, 0, 1) === 0 ? actual : choose(rng, POSITION_NAMES.filter((name) => name !== actual));
  return trueFalse(`The ${subject} is ${claim} the ${reference}.`, claim === actual, { visual, hint: 'Above means on top.' });
}

function trueFalseComparison(rng: Rng): Question {
  const relation = choose(rng, ['more than', 'less than', 'equal to'] as const);
  const isTrue = randInt(rng, 0, 1) === 1;
  let first: number;
  let second: number;
  if (relation === 'equal to') {
    first = randInt(rng, 0, 10);
    second = isTrue ? first : choose(rng, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter((value) => value !== first));
  } else if ((relation === 'more than') === isTrue) {
    first = randInt(rng, 1, 10);
    second = randInt(rng, 0, first - 1);
  } else {
    first = randInt(rng, 0, 9);
    second = randInt(rng, first + 1, 10);
  }
  return trueFalse(`${first} is ${relation} ${second}.`, isTrue, { visual: { text: `${first}  ?  ${second}` }, hint: 'The bigger number is further along when you count.' });
}

function addSubCheck(rng: Rng): Question {
  const addition = randInt(rng, 0, 1) === 0;
  let first: number;
  let second: number;
  if (addition) {
    first = randInt(rng, 0, 10);
    second = randInt(rng, 0, 10 - first);
  } else {
    first = randInt(rng, 0, 10);
    second = randInt(rng, 0, first);
  }
  const operator = addition ? '+' : '−';
  const correct = addition ? first + second : first - second;
  const shown = randInt(rng, 0, 1) === 0
    ? correct
    : choose(rng,
      [correct - 1, correct + 1, addition ? first - second : first + second]
        .filter((value) => value >= 0 && value <= 10 && value !== correct),
    );
  const statement = `${first} ${operator} ${second} = ${shown}`;
  return trueFalse(statement, shown === correct, { visual: { text: statement }, hint: 'Use your fingers to check.' });
}

export const k: GradeDef = {
  id: 'k',
  title: 'K',
  ages: '5–6',
  units: [
    {
      id: 'k.count100',
      title: 'Dino Trail to 100',
      emoji: '🦕',
      domain: 'counting',
      levels: [
        level('k.count100.by-ones', 'Count by 1s', 'order-sequence', 1, (rng) => {
          const start = randInt(rng, 1, 96);
          return orderSeq('Count up by 1s!', Array.from({ length: 5 }, (_, index) => String(start + index)));
        }),
        level('k.count100.by-tens', 'Count by 10s', 'order-sequence', 2, (rng) => {
          const start = randInt(rng, 1, 6) * 10;
          return orderSeq('Count up by 10s!', Array.from({ length: 5 }, (_, index) => String(start + index * 10)));
        }),
        level('k.count100.next-number', "What's Next?", 'multiple-choice', 3, (rng) => {
          const byOnes = randInt(rng, 0, 1) === 0;
          if (byOnes) {
            const current = randInt(rng, 3, 99);
            const answer = current + 1;
            return numberQuestion(
              'multiple-choice',
              "What's next?",
              answer,
              pickChoices(rng, answer, [current, current + 2, current + 10, current - 1], { count: 4, min: 0, max: 110 }),
              { text: `${current - 2}, ${current - 1}, ${current}, ?` },
              'Ones go up by 1. Tens go up by 10.',
            );
          }
          const current = randInt(rng, 3, 9) * 10;
          const answer = current + 10;
          return numberQuestion(
            'multiple-choice',
            "What's next?",
            answer,
            pickChoices(rng, answer, [current + 1, current + 20, current], { count: 4, min: 0, max: 110 }),
            { text: `${current - 20}, ${current - 10}, ${current}, ?` },
            'Ones go up by 1. Tens go up by 10.',
          );
        }),
      ],
    },
    {
      id: 'k.count20',
      title: 'Egg Count to 20',
      emoji: '🥚',
      domain: 'counting',
      levels: [
        level('k.count20.count-teens', 'Count to 20', 'count-tap', 1, (rng) => {
          const count = randInt(rng, 11, 20);
          return numberQuestion('count-tap', 'How many eggs?', count, pickChoices(rng, count, [count - 1, count + 1, count - 10], { count: 4, min: 1, max: 21 }), { emoji: '🥚', groups: [10, count - 10] });
        }),
        level('k.count20.find-numeral', 'Find the Number', 'multiple-choice', 2, (rng) => {
          const number = randInt(rng, 0, 20);
          const reversed = number >= 10 ? Number(String(number).split('').reverse().join('')) : null;
          const preferred = [reversed, number + 1, number - 1, number + 10].filter((value): value is number => value !== null && value <= 30);
          return numberQuestion('multiple-choice', `Find ${NUMBER_WORDS[number]}!`, number, pickChoices(rng, number, preferred, { count: 4, min: 0, max: 99 }));
        }),
        level('k.count20.write-numeral', 'Write the Number', 'number-pad', 3, (rng) => {
          const number = randInt(rng, 0, 20);
          return numPad(`Type the number ${NUMBER_WORDS[number]}.`, number, {
            visual: { text: `🦖 ${NUMBER_WORDS[number]}` },
            hint: number >= 11 ? 'Teen numbers start with 1!' : 'Count on your fingers.',
          });
        }),
      ],
    },
    {
      id: 'k.compare',
      title: 'Dino Weigh-In',
      emoji: '⚖️',
      domain: 'counting',
      levels: [
        level('k.compare.bigger-number', 'Which Is More?', 'multiple-choice', 1, (rng) => {
          const [first, second] = chooseDistinct(rng, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 2);
          const asksMore = randInt(rng, 0, 1) === 0;
          const answer = asksMore ? Math.max(first, second) : Math.min(first, second);
          return mc(asksMore ? 'Which is more?' : 'Which is less?', String(answer), [String(answer === first ? second : first)], rng);
        }),
        level('k.compare.fewer-side', 'More, Fewer, Same', 'multiple-choice', 2, (rng) => {
          const first = randInt(rng, 1, 10);
          const same = randInt(rng, 0, 2) === 0;
          const second = same ? first : choose(rng, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter((value) => value !== first));
          const answer = first === second ? '🟰 Same' : first < second ? '⬅️ Left' : '➡️ Right';
          return mc('Which side has fewer?', answer, ['⬅️ Left', '➡️ Right', '🟰 Same'].filter((choice) => choice !== answer), rng, {
            visual: { emoji: '🦕', groups: [first, second] },
          });
        }),
        level('k.compare.true-false', 'True or False?', 'true-false', 3, trueFalseComparison),
      ],
    },
    {
      id: 'k.addsub',
      title: 'Snack Shack',
      emoji: '🍎',
      domain: 'operations',
      levels: [
        level('k.addsub.add-pictures', 'Add the Snacks', 'count-tap', 1, (rng) => {
          const first = randInt(rng, 1, 5);
          const second = randInt(rng, 1, 10 - first);
          const answer = first + second;
          const emoji = choose(rng, FOOD);
          return numberQuestion(
            'count-tap',
            `${first} + ${second} = ?`,
            answer,
            pickChoices(rng, answer, [answer - 1, answer + 1, Math.abs(first - second), answer + 2], { count: 4, min: 0, max: 11 }),
            { emoji, groups: [first, second] },
          );
        }),
        level('k.addsub.take-away', 'Take Away', 'multiple-choice', 2, (rng) => {
          const first = randInt(rng, 3, 10);
          const second = randInt(rng, 1, first - 1);
          const answer = first - second;
          const food = choose(rng, FOOD);
          const preferred = [first + second <= 10 ? first + second : answer + 2, answer + 1, answer - 1, first];
          return numberQuestion('multiple-choice', `${first} ${food}. Eat ${second}. How many left?`, answer, pickChoices(rng, answer, preferred, { count: 4, min: 0, max: 20 }), { emoji: food, count: first });
        }),
        level('k.addsub.add-pad', 'Adding Pad', 'number-pad', 3, (rng) => {
          const first = randInt(rng, 0, 10);
          const second = randInt(rng, 0, 10 - first);
          return numPad(`${first} + ${second} = ?`, first + second, { visual: { text: `${first} + ${second} =` }, hint: 'Start at the bigger number and count on.' });
        }),
        level('k.addsub.add-sub-check', 'Check It!', 'true-false', 3, addSubCheck),
      ],
    },
    {
      id: 'k.bonds',
      title: 'Make-10 Lagoon',
      emoji: '🔟',
      domain: 'operations',
      levels: [
        level('k.bonds.bond-parts', 'Number Bonds', 'multiple-choice', 1, (rng) => {
          const whole = randInt(rng, 3, 10);
          const part = randInt(rng, 0, whole);
          const answer = whole - part;
          return numberQuestion('multiple-choice', `${whole} is ${part} and ?`, answer, pickChoices(rng, answer, [whole, answer + 1, answer - 1, part], { count: 4, min: 0, max: 10 }), { text: `${whole} = ${part} + ?` });
        }),
        level('k.bonds.ten-frame', 'Ten Frame', 'count-tap', 2, (rng) => {
          const filled = randInt(rng, 1, 9);
          const text = `${'🟡'.repeat(Math.min(filled, 5))}${'⚪'.repeat(5 - Math.min(filled, 5))}\n${'🟡'.repeat(Math.max(0, filled - 5))}${'⚪'.repeat(5 - Math.max(0, filled - 5))}`;
          const answer = 10 - filled;
          return numberQuestion('count-tap', 'How many more make 10?', answer, pickChoices(rng, answer, [filled, answer + 1, answer - 1], { count: 4, min: 0, max: 10 }), { text }, 'Count the empty spots.');
        }),
        level('k.bonds.ten-pairs', 'Ten Buddies', 'match-pairs', 3, (rng) => {
          const values = randInts(rng, 1, 9, 4);
          return {
            ...matchPairs('Match pairs that make 10!', values.map((value) => ({ left: String(value), right: String(10 - value) }))),
            hint: 'Use your 10 fingers!',
          };
        }),
      ],
    },
    {
      id: 'k.stories',
      title: 'Story Swamp',
      emoji: '📖',
      domain: 'word-problems',
      levels: [
        level('k.stories.join-story', 'Join Stories', 'multiple-choice', 1, (rng) => {
          const context = choose(rng, STORY_CONTEXTS);
          const first = randInt(rng, 1, 6);
          const second = randInt(rng, 1, Math.min(4, 10 - first));
          const answer = first + second;
          return numberQuestion('multiple-choice', promptForStory(first, second, context.noun, context.place, true), answer, pickChoices(rng, answer, [answer - 1, answer + 1, first > second ? first - second : first], { count: 4, min: 0, max: 12 }), { emoji: context.emoji, groups: [first, second] });
        }),
        level('k.stories.take-story', 'Take-Away Stories', 'multiple-choice', 2, (rng) => {
          const context = choose(rng, STORY_CONTEXTS);
          const first = randInt(rng, 3, 10);
          const second = randInt(rng, 1, first - 1);
          const answer = first - second;
          return numberQuestion('multiple-choice', promptForStory(first, second, context.noun, context.place, false), answer, pickChoices(rng, answer, [first + second <= 12 ? first + second : answer + 2, answer + 1, answer - 1], { count: 4, min: 0, max: 12 }), { emoji: context.emoji, count: first });
        }),
        level('k.stories.story-pad', 'Story Solver', 'number-pad', 3, (rng) => {
          const context = choose(rng, STORY_CONTEXTS);
          const joining = randInt(rng, 0, 1) === 0;
          if (joining) {
            const first = randInt(rng, 1, 6);
            const second = randInt(rng, 1, Math.min(4, 10 - first));
            return numPad(promptForStory(first, second, context.noun, context.place, true), first + second, {
              visual: { emoji: context.emoji, groups: [first, second] },
              hint: 'Is the group getting bigger or smaller?',
            });
          }
          const first = randInt(rng, 3, 10);
          const second = randInt(rng, 1, first - 1);
          return numPad(promptForStory(first, second, context.noun, context.place, false), first - second, {
            visual: { emoji: context.emoji, count: first },
            hint: 'Is the group getting bigger or smaller?',
          });
        }),
      ],
    },
    {
      id: 'k.teens',
      title: 'Ten Frame Caves',
      emoji: '🧱',
      domain: 'place-value',
      levels: [
        level('k.teens.ten-and-ones', '10 and Some More', 'multiple-choice', 1, (rng) => {
          const ones = randInt(rng, 1, 9);
          const answer = 10 + ones;
          return numberQuestion('multiple-choice', `10 + ${ones} = ?`, answer, pickChoices(rng, answer, [Number(`${ones}1`), answer - 1, answer + 1, ones], { count: 4, min: 0, max: 99 }), { emoji: '🟦', groups: [10, ones] });
        }),
        level('k.teens.how-many-ones', 'How Many Ones?', 'multiple-choice', 2, (rng) => {
          const number = randInt(rng, 11, 19);
          const answer = number - 10;
          return numberQuestion(`multiple-choice`, `${number} is 10 and how many ones?`, answer, pickChoices(rng, answer, [answer + 1, answer - 1, 1, number], { count: 4, min: 0, max: 20 }));
        }),
        level('k.teens.teen-match', 'Teen Match', 'match-pairs', 3, (rng) => {
          const values = randInts(rng, 1, 9, 4);
          return {
            ...matchPairs('Match each to its teen number!', values.map((ones) => ({ left: `10 + ${ones}`, right: String(10 + ones) }))),
            hint: '10 + 3 is 13.',
          };
        }),
        level('k.teens.build-teen', 'Build a Teen', 'number-pad', 3, (rng) => {
          const ones = randInt(rng, 0, 9);
          const visualText = ones === 0 ? '🔟 + 0' : `🔟 + ${'⚫'.repeat(ones)}`;
          return numPad(`1 ten and ${ones} ones = ?`, 10 + ones, { visual: { text: visualText }, hint: 'Write 1 for the ten, then the ones.' });
        }),
      ],
    },
    {
      id: 'k.shapes',
      title: 'Shape Safari',
      emoji: '🔺',
      domain: 'geometry',
      levels: [
        level('k.shapes.solid-names', 'Name the Solid', 'multiple-choice', 1, (rng) => {
          const solid = choose(rng, SOLIDS_3D);
          const object = choose(rng, solid.items);
          return mc('What shape is it?', solid.name, SOLIDS_3D.filter((item) => item.name !== solid.name).map((item) => item.name), rng, { visual: { text: object } });
        }),
        level('k.shapes.flat-or-solid', 'Flat or Solid?', 'multiple-choice', 2, (rng) => {
          const isSolid = randInt(rng, 0, 1) === 1;
          const visual = isSolid
            ? choose(rng, choose(rng, SOLIDS_3D).items)
            : choose(rng, SHAPES_2D).glyph;
          const answer = isSolid ? '🧊 Solid (3D)' : '⬜ Flat (2D)';
          return mc('Flat or solid?', answer, [isSolid ? '⬜ Flat (2D)' : '🧊 Solid (3D)'], rng, { visual: { text: visual } });
        }),
        level('k.shapes.solid-match', 'Solid Match', 'match-pairs', 2, (rng) => {
          const solids = chooseDistinct(rng, SOLIDS_3D, randInt(rng, 3, 4));
          return matchPairs('Match each object to its solid!', solids.map((solid) => ({ left: choose(rng, solid.items), right: solid.name })));
        }),
        level('k.shapes.positions', 'Where Is It?', 'multiple-choice', 3, (rng) => positionQuestion(rng, false)),
        level('k.shapes.position-check', 'True or False?', 'true-false', 3, (rng) => positionQuestion(rng, true)),
      ],
    },
    {
      id: 'k.measure',
      title: 'Measure Mountain',
      emoji: '📏',
      domain: 'measurement',
      levels: [
        level('k.measure.longer', 'Longer Snake', 'multiple-choice', 1, (rng) => {
          const lengths = chooseDistinct(rng, [2, 3, 4, 5, 6, 7], 2);
          const asksLonger = randInt(rng, 0, 1) === 0;
          const target = asksLonger ? Math.max(...lengths) : Math.min(...lengths);
          const labels = lengths.map((length) => `🐍${repeat('🟩', length)}`);
          const answer = labels[lengths.indexOf(target)];
          return mc(asksLonger ? 'Which snake is longer?' : 'Which snake is shorter?', answer, labels.filter((label) => label !== answer), rng);
        }),
        level('k.measure.heavier', 'Heavy or Light?', 'multiple-choice', 2, (rng) => {
          const heavy = choose(rng, HEAVY_THINGS);
          const light = choose(rng, LIGHT_THINGS);
          const asksHeavier = randInt(rng, 0, 1) === 0;
          return mc(asksHeavier ? 'Which is heavier?' : 'Which is lighter?', asksHeavier ? heavy : light, [asksHeavier ? light : heavy], rng);
        }),
        level('k.measure.holds-more', 'Holds More', 'multiple-choice', 3, (rng) => {
          const [first, second] = chooseDistinct(rng, CONTAINERS, 2).sort((left, right) => CONTAINERS.indexOf(left) - CONTAINERS.indexOf(right));
          const asksMore = randInt(rng, 0, 1) === 0;
          const selected = asksMore ? second : first;
          const answer = `${selected.emoji} ${selected.name}`;
          const distractor = `${(asksMore ? first : second).emoji} ${(asksMore ? first : second).name}`;
          return mc(asksMore ? 'Which holds more water?' : 'Which holds less water?', answer, [distractor], rng, { hint: 'A bigger container holds more.' });
        }),
        level('k.measure.order-length', 'Short to Long', 'order-sequence', 3, (rng) => {
          const count = randInt(rng, 3, 4);
          const lengths = randInts(rng, 1, 6, count);
          return { ...orderSeq('Tap shortest to longest!', lengths.map((length) => repeat('🟩', length))), hint: 'Look at the length of each one.' };
        }),
      ],
    },
    {
      id: 'k.patterns',
      title: 'Fossil Patterns',
      emoji: '🦴',
      domain: 'patterns',
      levels: [
        level('k.patterns.abc', 'ABC Patterns', 'multiple-choice', 1, (rng) => {
          const set = choose(rng, Object.values(PATTERN_SETS));
          const [first, second, third, extra] = chooseDistinct(rng, set, 4);
          const core = [first, second, third];
          const length = randInt(rng, 6, 8);
          const answer = core[length % 3];
          return mc('What comes next?', answer, [first, second, third, extra].filter((item) => item !== answer), rng, {
            visual: { items: [...Array.from({ length }, (_, index) => core[index % 3]), '❓'] },
          });
        }),
        level('k.patterns.aabb', 'AABB Patterns', 'multiple-choice', 2, (rng) => {
          const set = choose(rng, Object.values(PATTERN_SETS));
          const [first, second, extra] = chooseDistinct(rng, set, 3);
          const core = [first, first, second, second];
          const length = randInt(rng, 8, 10);
          const answer = core[length % 4];
          return mc('What comes next?', answer, [first, second, extra].filter((item) => item !== answer), rng, {
            visual: { items: [...Array.from({ length }, (_, index) => core[index % 4]), '❓'] },
          });
        }),
        level('k.patterns.growing-numbers', 'Number Patterns', 'multiple-choice', 3, (rng) => {
          const step = choose(rng, [1, 2, 5, 10]);
          const start = step === 10 ? choose(rng, [0, 10, 20]) : randInt(rng, 0, 20);
          const terms = Array.from({ length: 4 }, (_, index) => start + step * index);
          const answer = start + step * 4;
          return numberQuestion('multiple-choice', 'What comes next?', answer, pickChoices(rng, answer, [answer - 1, answer + step, terms[3] + 1], { count: 4, min: 0, max: 120 }), {
            text: `${terms.join(', ')}, ?`,
          }, 'How much does it grow each time?');
        }),
      ],
    },
    ...kPack,
  ],
};
