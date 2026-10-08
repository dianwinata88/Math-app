import { pick, randInt, shuffle } from '../../core/rng';
import type { GradeDef, Rng } from '../../core/types';
import { level, matchPairs, numPad, orderSeq, trueFalse } from '../helpers';
import { board, clock, clockFromMinutes, countTap, fmt, grid, labelMc, name, numMc } from './util';
import { g3Pack } from './g3-pack';

/* Grade 3 world: Treasure Island 🏝️ — pirates, parrots, beaches and island markets. */

const GROUP_STORIES = [
  { groups: 'treasure chests', item: 'gold coins', emoji: '🪙' },
  { groups: 'nests', item: 'parrot eggs', emoji: '🥚' },
  { groups: 'baskets', item: 'mangoes', emoji: '🥭' },
  { groups: 'goal nets', item: 'soccer balls', emoji: '⚽' },
  { groups: 'space bags', item: 'moon rocks', emoji: '🌑' },
  { groups: 'tide pools', item: 'crabs', emoji: '🦀' },
  { groups: 'boxes', item: 'cupcakes', emoji: '🧁' },
] as const;

const ARRAY_EMOJI = ['🐢', '🐚', '🍉', '⭐', '🏀', '🐠'] as const;

const SHARE_STORIES = [
  (total: number, people: number) => `${total} gems are shared equally by ${people} pirates.`,
  (total: number, people: number) => `${total} cookies are shared equally by ${people} friends.`,
  (total: number, people: number) => `${total} fish are split equally into ${people} buckets.`,
  (total: number, people: number) => `${total} stickers go equally onto ${people} pages.`,
  (total: number, people: number) => `${total} moon rocks are packed equally into ${people} space boxes.`,
] as const;

const TRIPS = ['sailed', 'rowed', 'flew', 'hiked'] as const;

function multiplicationCove() {
  return {
    id: 'g3.multiplication',
    title: 'Parrot Multiplication Cove',
    emoji: '🦜',
    domain: 'operations' as const,
    levels: [
      level('g3.multiplication.equal-groups', 'Equal Groups', 'multiple-choice', 1, (rng) => {
        const story = pick(rng, GROUP_STORIES);
        const groups = randInt(rng, 2, 5);
        const size = randInt(rng, 2, 5);
        const answer = groups * size;
        return numMc(
          `There are ${groups} ${story.groups} with ${size} ${story.item} in each. How many ${story.item} in all?`,
          answer,
          [groups + size, answer + size, answer - size, answer + 1],
          rng,
          { visual: { emoji: story.emoji, groups: Array.from({ length: groups }, () => size) } },
        );
      }),
      level('g3.multiplication.arrays', 'Array Explorer', 'count-tap', 1, (rng) => {
        const rows = randInt(rng, 2, 5);
        const cols = randInt(rng, 2, 6);
        const emoji = pick(rng, ARRAY_EMOJI);
        const answer = rows * cols;
        return countTap(`${rows} rows of ${cols}. How many ${emoji} in the array?`, answer, [rows + cols, answer + rows, answer - cols, answer + 1], rng, {
          visual: grid(rows, cols, emoji),
        });
      }),
      level('g3.multiplication.skip-count', 'Times-Table Trail', 'order-sequence', 1, (rng) => {
        const factor = randInt(rng, 2, 10);
        const start = randInt(rng, 1, 5);
        const row = Array.from({ length: 5 }, (_, index) => String(factor * (start + index)));
        return orderSeq(`Follow the ${factor}s row of the times table! Tap from smallest to biggest.`, row);
      }),
      level('g3.multiplication.facts', 'Fact Fireworks', 'number-pad', 2, (rng) => {
        const a = randInt(rng, 2, 10);
        const b = randInt(rng, 2, 10);
        return numPad(`What is ${a} × ${b}?`, a * b, { visual: { text: `${a} × ${b} = ?` } });
      }),
      level('g3.multiplication.tens', 'Multiply by Tens', 'number-pad', 3, (rng) => {
        const a = randInt(rng, 2, 9);
        const b = randInt(rng, 2, 9);
        const tensFirst = rng() < 0.5;
        const text = tensFirst ? `${b * 10} × ${a}` : `${a} × ${b * 10}`;
        return numPad(`What is ${text}?`, a * b * 10, {
          visual: { text: `${text} = ?` },
          hint: `${a} × ${b} = ${a * b}, so ${a} × ${b} tens = ${a * b} tens.`,
        });
      }),
    ],
  };
}

function divisionDocks() {
  return {
    id: 'g3.division',
    title: 'Treasure Sharing Docks',
    emoji: '💰',
    domain: 'operations' as const,
    levels: [
      level('g3.division.share', 'Share the Loot', 'multiple-choice', 1, (rng) => {
        const people = randInt(rng, 2, 6);
        const each = randInt(rng, 2, 9);
        const total = people * each;
        return numMc(`${pick(rng, SHARE_STORIES)(total, people)} How many does each get?`, each, [people, total - people, each + 1, each - 1], rng, {
          visual: { text: `${total} ÷ ${people}` },
        });
      }),
      level('g3.division.facts', 'Division Dash', 'number-pad', 2, (rng) => {
        const divisor = randInt(rng, 2, 10);
        const quotient = randInt(rng, 2, 10);
        return numPad(`What is ${divisor * quotient} ÷ ${divisor}?`, quotient, { visual: { text: `${divisor * quotient} ÷ ${divisor} = ?` } });
      }),
      level('g3.division.unknown-factor', 'Missing Factor', 'number-pad', 2, (rng) => {
        const a = randInt(rng, 2, 10);
        const b = randInt(rng, 2, 10);
        const form = randInt(rng, 0, 2);
        const text = form === 0 ? `? × ${b} = ${a * b}` : form === 1 ? `${a} × ? = ${a * b}` : `${a * b} ÷ ? = ${a}`;
        const answer = form === 0 ? a : b;
        return numPad(`Find the missing number: ${text}`, answer, { visual: { text }, hint: 'Use a multiplication fact you know.' });
      }),
      level('g3.division.properties', 'Property Pirates', 'true-false', 3, (rng) => {
        const a = randInt(rng, 2, 9);
        const b = randInt(rng, 3, 9);
        const part = randInt(rng, 1, b - 1);
        const c = randInt(rng, 2, 5);
        const statements: [string, string][] = [
          [`${a} × ${b}`, `${b} × ${a}`],
          [`${a} × ${b}`, `${a} × ${part} + ${a} × ${b - part}`],
          [`${a} × ${b}`, `${a} × ${part} + ${b - part}`],
          [`${a} × ${b}`, `${a} + ${b}`],
          [`(${a} × ${b}) × ${c}`, `${a} × (${b} × ${c})`],
          [`${a + b} − ${b}`, `${b} − ${a + b}`],
        ];
        const [left, right] = statements[randInt(rng, 0, statements.length - 1)];
        const value = (expression: string) => evaluate(expression);
        return trueFalse(`True or false? ${left} = ${right}`, value(left) === value(right), {
          visual: { text: `${left} = ${right}` },
          hint: 'You can swap factors or break one apart: 8 × 7 = 8 × 5 + 8 × 2.',
        });
      }),
    ],
  };
}

/** Tiny evaluator for the generated property statements (×, −, +, parentheses). */
function evaluate(expression: string): number {
  const tokens = expression.match(/\d+|[×+−()]/g) ?? [];
  let index = 0;
  const factor = (): number => {
    const token = tokens[index++];
    if (token === '(') {
      const inner = sum();
      index += 1;
      return inner;
    }
    return Number(token);
  };
  const product = (): number => {
    let value = factor();
    while (tokens[index] === '×') {
      index += 1;
      value *= factor();
    }
    return value;
  };
  const sum = (): number => {
    let value = product();
    while (tokens[index] === '+' || tokens[index] === '−') {
      const op = tokens[index++];
      value = op === '+' ? value + product() : value - product();
    }
    return value;
  };
  return sum();
}

function numberBay() {
  return {
    id: 'g3.place-value',
    title: 'Big Number Bay',
    emoji: '🗺️',
    domain: 'place-value' as const,
    levels: [
      level('g3.place-value.round-10', 'Round to 10', 'multiple-choice', 1, (rng) => {
        const value = randInt(rng, 10, 99) * 10 + randInt(rng, 1, 9);
        const down = Math.floor(value / 10) * 10;
        const answer = value % 10 >= 5 ? down + 10 : down;
        return numMc(
          `${name(rng)} ${pick(rng, TRIPS)} ${value} miles. Round ${value} to the nearest 10.`,
          answer,
          [answer === down ? down + 10 : down, Math.round(value / 100) * 100, answer + 10, answer - 10],
          rng,
          { hint: 'Look at the ones digit: 5 or more rounds up.' },
        );
      }),
      level('g3.place-value.round-100', 'Round to 100', 'multiple-choice', 2, (rng) => {
        const value = randInt(rng, 1, 9) * 100 + randInt(rng, 1, 99);
        const down = Math.floor(value / 100) * 100;
        const answer = value % 100 >= 50 ? down + 100 : down;
        return numMc(
          `The island has ${value} palm trees. Round ${value} to the nearest 100.`,
          answer,
          [answer === down ? down + 100 : down, Math.round(value / 10) * 10, answer + 100, answer - 100],
          rng,
          { hint: 'Look at the tens digit: 5 or more rounds up.' },
        );
      }),
      level('g3.place-value.add-1000', 'Add to 1,000', 'number-pad', 2, (rng) => {
        const a = randInt(rng, 120, 780);
        const b = randInt(rng, 100, 1000 - a);
        const who = name(rng);
        return numPad(`${who} found ${a} shells on Monday and ${b} on Tuesday. How many shells in all?`, a + b, { visual: { text: `${a} + ${b}` } });
      }),
      level('g3.place-value.subtract-1000', 'Subtract from 1,000', 'number-pad', 3, (rng) => {
        const a = randInt(rng, 300, 1000);
        const b = randInt(rng, 101, a - 50);
        return numPad(`A ship carries ${fmt(a)} barrels. ${b} roll off at the dock. How many are left?`, a - b, {
          visual: { text: `${a} − ${b}` },
          hint: 'Regroup when the top digit is smaller.',
        });
      }),
    ],
  };
}

const EQUIVALENTS: Record<string, string[]> = {
  '1/2': ['2/4', '3/6', '4/8'],
  '1/3': ['2/6'],
  '2/3': ['4/6'],
  '1/4': ['2/8'],
  '3/4': ['6/8'],
  '1': ['2/2', '3/3', '4/4', '6/6', '8/8'],
};
const DENOMINATORS = [2, 3, 4, 6, 8] as const;
const FOODS = ['pizza', 'chocolate bar', 'sandwich', 'pie', 'seaweed roll'] as const;

function numberLine(parts: number, at: number): string {
  const marks = Array.from({ length: parts }, (_, index) => (index + 1 === at ? '—⭐' : index + 1 === parts ? '—' : '—|'));
  return `0 ${marks.join('')} 1`;
}

function fractionFeast() {
  return {
    id: 'g3.fractions',
    title: 'Fraction Feast',
    emoji: '🍕',
    domain: 'fractions' as const,
    levels: [
      level('g3.fractions.shaded', 'Shaded Parts', 'multiple-choice', 1, (rng) => {
        const d = pick(rng, DENOMINATORS);
        const n = randInt(rng, 1, d - 1);
        return labelMc(
          `The ${pick(rng, FOODS)} has ${d} equal parts. What fraction is orange?`,
          `${n}/${d}`,
          [`${d - n}/${d}`, `${n}/${d - n}`, `${d}/${n}`, `${n}/${d + 1}`],
          rng,
          { visual: { text: '🟧'.repeat(n) + '⬜'.repeat(d - n) } },
        );
      }),
      level('g3.fractions.number-line', 'Number Line Hop', 'multiple-choice', 2, (rng) => {
        const d = pick(rng, DENOMINATORS);
        const k = randInt(rng, 1, d - 1);
        return labelMc(
          `From 0 to 1 is cut into ${d} equal jumps. What fraction is at the ⭐?`,
          `${k}/${d}`,
          [`${k + 1}/${d}`, `${k - 1}/${d}`, `${k}/${d + 1}`, `${d}/${k}`].filter((label) => !label.startsWith('0/')),
          rng,
          { visual: board([numberLine(d, k)]), hint: 'Count the jumps from 0 to the star.' },
        );
      }),
      level('g3.fractions.equivalent', 'Equal Shares Match', 'match-pairs', 2, (rng) => {
        const bases = shuffle(rng, Object.keys(EQUIVALENTS)).slice(0, randInt(rng, 3, 4));
        return matchPairs(
          'Match each fraction to an equivalent fraction.',
          bases.map((base) => ({ left: base, right: pick(rng, EQUIVALENTS[base]) })),
        );
      }),
      level('g3.fractions.compare', 'Bigger Slice', 'multiple-choice', 3, (rng) => {
        const sameDenominator = rng() < 0.5;
        const askGreater = rng() < 0.5;
        let first: [number, number];
        let second: [number, number];
        if (sameDenominator) {
          const d = pick(rng, DENOMINATORS);
          const [x, y] = shuffle(rng, Array.from({ length: d - 1 }, (_, index) => index + 1)).slice(0, 2);
          first = [x ?? 1, d];
          second = [y ?? d, d];
          if (first[0] === second[0]) second = [d, d];
        } else {
          const [d1, d2] = shuffle(rng, [...DENOMINATORS]).slice(0, 2);
          const n = randInt(rng, 1, Math.min(d1, d2) - 1);
          first = [n, d1];
          second = [n, d2];
        }
        const firstBigger = first[0] * second[1] > second[0] * first[1];
        const answer = askGreater === firstBigger ? first : second;
        const other = answer === first ? second : first;
        return labelMc(
          `Which fraction is ${askGreater ? 'greater' : 'smaller'}: ${first[0]}/${first[1]} or ${second[0]}/${second[1]}?`,
          `${answer[0]}/${answer[1]}`,
          [`${other[0]}/${other[1]}`, 'They are equal'],
          rng,
          { hint: sameDenominator ? 'Same size pieces? More pieces is more.' : 'Same top number? More parts means smaller pieces!' },
        );
      }),
    ],
  };
}

const ACTIVITIES = ['soccer practice', 'a piano lesson', 'a space movie', 'swim class', 'baking cookies', 'the dolphin show', 'a treasure hunt'] as const;

function clockTower() {
  return {
    id: 'g3.time',
    title: 'Clock Tower Time',
    emoji: '🕰️',
    domain: 'time' as const,
    levels: [
      level('g3.time.read-clock', 'Read the Clock', 'multiple-choice', 1, (rng) => {
        const hour = randInt(rng, 1, 12);
        const minute = randInt(rng, 1, 59);
        const number = Math.floor(minute / 5);
        const marks = minute % 5;
        const label = number === 0 ? 12 : number;
        const longHand = marks === 0 ? `points at the ${label}` : `is ${marks} little mark${marks > 1 ? 's' : ''} past the ${label}`;
        return labelMc(
          `The short hand is between the ${hour} and the ${(hour % 12) + 1}. The long hand ${longHand}. What time is it?`,
          clock(hour, minute),
          [clock(label, (hour * 5) % 60), clock(hour, (number * 5 + (marks === 0 ? 5 : 0)) % 60), clock((hour % 12) + 1, minute), clock(hour, (minute + 10) % 60)],
          rng,
          { visual: { text: '🕰️' } },
        );
      }),
      level('g3.time.minutes-past', 'Minute Marks', 'number-pad', 2, (rng) => {
        const number = randInt(rng, 1, 11);
        const marks = randInt(rng, 1, 4);
        return numPad(`The long minute hand is ${marks} little mark${marks > 1 ? 's' : ''} past the ${number}. How many minutes past the hour is it?`, number * 5 + marks, {
          hint: 'Count by 5s to the number, then add the little marks.',
        });
      }),
      level('g3.time.end-time', 'When Does It End?', 'multiple-choice', 2, (rng) => {
        const start = randInt(rng, 7, 18) * 60 + randInt(rng, 0, 59);
        const length = randInt(rng, 10, 55);
        const end = start + length;
        const crossedHour = Math.floor(end / 60) !== Math.floor(start / 60);
        return labelMc(
          `${name(rng)} starts ${pick(rng, ACTIVITIES)} at ${clockFromMinutes(start)}. It lasts ${length} minutes. When does it end?`,
          clockFromMinutes(end),
          [
            crossedHour ? clockFromMinutes(end - 60) : clockFromMinutes(end + 60),
            clockFromMinutes(end + 10),
            clockFromMinutes(end - 10),
          ],
          rng,
          { hint: 'Count on to the next hour first.' },
        );
      }),
      level('g3.time.elapsed', 'Elapsed Time', 'number-pad', 3, (rng) => {
        const start = randInt(rng, 7, 18) * 60 + randInt(rng, 0, 59);
        const length = randInt(rng, 10, 90);
        return numPad(
          `${pick(rng, ACTIVITIES).replace(/^./, (c) => c.toUpperCase())} starts at ${clockFromMinutes(start)} and ends at ${clockFromMinutes(start + length)}. How many minutes long is it?`,
          length,
          { hint: 'Count up to the next hour, then add the rest.' },
        );
      }),
    ],
  };
}

const PLACES = ['sandcastle floor', 'garden', 'pirate rug', 'pool', 'dance floor', 'treasure map'] as const;

function sandcastleBuilders() {
  return {
    id: 'g3.area',
    title: 'Sandcastle Area & Perimeter',
    emoji: '🏰',
    domain: 'measurement' as const,
    levels: [
      level('g3.area.count-squares', 'Count the Squares', 'count-tap', 1, (rng) => {
        const rows = randInt(rng, 2, 5);
        const cols = randInt(rng, 2, 6);
        const answer = rows * cols;
        return countTap('Each 🟨 is 1 square unit. What is the area?', answer, [2 * (rows + cols), rows + cols, answer + 1, answer - 1], rng, {
          visual: grid(rows, cols, '🟨'),
        });
      }),
      level('g3.area.length-times-width', 'Length × Width', 'number-pad', 2, (rng) => {
        const length = randInt(rng, 2, 10);
        const width = randInt(rng, 2, 10);
        return numPad(`A ${pick(rng, PLACES)} is ${length} m long and ${width} m wide. What is its area in square meters?`, length * width, {
          visual: { text: `${length} m × ${width} m` },
          hint: 'Area = length × width.',
        });
      }),
      level('g3.area.perimeter', 'Fence Around', 'number-pad', 2, (rng) => {
        if (rng() < 0.5) {
          const length = randInt(rng, 3, 15);
          const width = randInt(rng, 2, 12);
          return numPad(`A rectangle ${pick(rng, PLACES)} is ${length} m long and ${width} m wide. What is its perimeter in meters?`, 2 * (length + width), {
            hint: 'Perimeter = add all four sides.',
          });
        }
        const sides = Array.from({ length: randInt(rng, 3, 5) }, () => randInt(rng, 2, 12));
        return numPad(`A fence goes around a shape with sides ${sides.join(' m, ')} m. What is the perimeter in meters?`, sides.reduce((sum, side) => sum + side, 0), {
          visual: { text: sides.join(' + ') },
          hint: 'Perimeter = add all the sides.',
        });
      }),
      level('g3.area.missing-side', 'Missing Side', 'number-pad', 3, (rng) => {
        const length = randInt(rng, 3, 10);
        const width = randInt(rng, 2, 10);
        if (rng() < 0.5) {
          return numPad(`A rectangle has an area of ${length * width} square cm. One side is ${length} cm. How long is the other side?`, width, {
            hint: 'Area = length × width, so divide the area by the side you know.',
          });
        }
        return numPad(`A rectangle has a perimeter of ${2 * (length + width)} cm. Its length is ${length} cm. What is its width?`, width, {
          hint: 'Half the perimeter is length + width.',
        });
      }),
    ],
  };
}

const QUAD_CLUES = [
  { clue: '4 equal sides and 4 right angles', shape: 'Square' },
  { clue: '4 right angles, but not all sides are equal', shape: 'Rectangle' },
  { clue: '4 equal sides but no right angles', shape: 'Rhombus' },
  { clue: 'exactly one pair of parallel sides', shape: 'Trapezoid' },
  { clue: '2 pairs of parallel sides, no right angles, and not all sides equal', shape: 'Parallelogram' },
] as const;

const QUAD_FACTS: [string, boolean][] = [
  ['Every square is a rectangle.', true],
  ['Every rectangle is a square.', false],
  ['Every square is a rhombus.', true],
  ['Every rhombus is a square.', false],
  ['A rectangle is a quadrilateral.', true],
  ['A triangle is a quadrilateral.', false],
  ['A trapezoid has 4 sides.', true],
  ['A pentagon is a quadrilateral.', false],
  ['Every quadrilateral has 4 angles.', true],
  ['A rectangle always has 4 right angles.', true],
  ['A parallelogram always has 4 right angles.', false],
  ['A rhombus has 4 equal sides.', true],
];

const SHAPE_PROPERTIES = [
  { left: 'Square', right: 'equal sides + right angles' },
  { left: 'Rectangle', right: 'right angles, sides not all equal' },
  { left: 'Rhombus', right: 'equal sides, no right angles' },
  { left: 'Trapezoid', right: 'just 1 pair of parallel sides' },
  { left: 'Pentagon', right: '5 sides' },
  { left: 'Hexagon', right: '6 sides' },
  { left: 'Triangle', right: '3 sides' },
] as const;

function shapeShipyard() {
  return {
    id: 'g3.shapes',
    title: 'Shape Shipyard',
    emoji: '⛵',
    domain: 'geometry' as const,
    levels: [
      level('g3.shapes.classify', 'Name That Sail', 'multiple-choice', 1, (rng) => {
        const target = pick(rng, QUAD_CLUES);
        return labelMc(
          `A ship's sail is a quadrilateral with ${target.clue}. What shape is it?`,
          target.shape,
          shuffle(rng, QUAD_CLUES.map((item) => item.shape)),
          rng,
        );
      }),
      level('g3.shapes.true-false', 'Shape Truths', 'true-false', 2, (rng) => {
        const [statement, truth] = pick(rng, QUAD_FACTS);
        return trueFalse(statement, truth, { hint: 'A square is a special rectangle AND a special rhombus.' });
      }),
      level('g3.shapes.match', 'Shape Match-Up', 'match-pairs', 3, (rng) =>
        matchPairs('Match each shape to its clue.', shuffle(rng, [...SHAPE_PROPERTIES]).slice(0, 4).map((item) => ({ ...item })))),
    ],
  };
}

const SEA_ANIMALS = [
  { emoji: '🐢', plural: 'turtles' },
  { emoji: '🐟', plural: 'fish' },
  { emoji: '🦀', plural: 'crabs' },
  { emoji: '🐬', plural: 'dolphins' },
  { emoji: '🐙', plural: 'octopuses' },
] as const;

const VOTE_TOPICS = [
  { topic: 'favorite fruit', options: ['🍎 Apples', '🍌 Bananas', '🍇 Grapes', '🥭 Mangoes'] },
  { topic: 'favorite sport', options: ['⚽ Soccer', '🏀 Basketball', '🏊 Swimming', '🎾 Tennis'] },
  { topic: 'favorite pet', options: ['🐶 Dogs', '🐱 Cats', '🐠 Fish', '🐰 Rabbits'] },
  { topic: 'favorite planet', options: ['🪐 Saturn', '🔴 Mars', '🌍 Earth', '🔵 Neptune'] },
] as const;

function bars(rng: Rng, count: number) {
  const scale = pick(rng, [2, 5, 10] as const);
  const topic = pick(rng, VOTE_TOPICS);
  const options = shuffle(rng, [...topic.options]).slice(0, count);
  const lengths = shuffle(rng, Array.from({ length: 7 }, (_, index) => index + 1)).slice(0, count);
  const lines = [`Each ▇ = ${scale} votes`, ...options.map((option, index) => `${option.split(' ')[0]} ${'▇'.repeat(lengths[index])}`)];
  return { scale, topic: topic.topic, options, lengths, visual: board(lines) };
}

function islandGraphs() {
  return {
    id: 'g3.graphs',
    title: 'Island Graphs',
    emoji: '📊',
    domain: 'data' as const,
    levels: [
      level('g3.graphs.picture-graph', 'Picture Graph', 'number-pad', 1, (rng) => {
        const animal = pick(rng, SEA_ANIMALS);
        const scale = pick(rng, [2, 5, 10] as const);
        const icons = randInt(rng, 2, 8);
        const who = name(rng);
        return numPad(`In ${who}'s picture graph, each ${animal.emoji} means ${scale} ${animal.plural}. How many ${animal.plural} did ${who} see?`, icons * scale, {
          visual: board([`${animal.emoji} = ${scale}`, animal.emoji.repeat(icons)]),
        });
      }),
      level('g3.graphs.how-many-more', 'How Many More?', 'number-pad', 2, (rng) => {
        const graph = bars(rng, 2);
        const [first, second] = graph.lengths[0] > graph.lengths[1] ? [0, 1] : [1, 0];
        return numPad(
          `Kids voted for their ${graph.topic}. How many more votes did ${graph.options[first]} get than ${graph.options[second]}?`,
          (graph.lengths[first] - graph.lengths[second]) * graph.scale,
          { visual: graph.visual, hint: 'Find each total with the key, then subtract.' },
        );
      }),
      level('g3.graphs.total', 'Graph Totals', 'number-pad', 3, (rng) => {
        const graph = bars(rng, 3);
        return numPad(`Kids voted for their ${graph.topic}. How many votes are there in all? (${graph.options.join(', ')})`, graph.lengths.reduce((sum, length) => sum + length, 0) * graph.scale, {
          visual: graph.visual,
          hint: 'Multiply each bar by the key, then add.',
        });
      }),
    ],
  };
}

const UNIT_ITEMS = [
  { item: 'a paper clip', unit: 'grams (g)', what: 'mass' },
  { item: 'a strawberry', unit: 'grams (g)', what: 'mass' },
  { item: 'a pencil', unit: 'grams (g)', what: 'mass' },
  { item: 'a watermelon', unit: 'kilograms (kg)', what: 'mass' },
  { item: 'a bicycle', unit: 'kilograms (kg)', what: 'mass' },
  { item: 'a big dog', unit: 'kilograms (kg)', what: 'mass' },
  { item: 'a fish tank', unit: 'liters (L)', what: 'liquid volume' },
  { item: 'a bathtub', unit: 'liters (L)', what: 'liquid volume' },
  { item: 'a bucket of sea water', unit: 'liters (L)', what: 'liquid volume' },
] as const;

function pirateMarket() {
  return {
    id: 'g3.market',
    title: 'Pirate Market Problems',
    emoji: '🛒',
    domain: 'word-problems' as const,
    levels: [
      level('g3.market.units', 'Pick the Unit', 'multiple-choice', 1, (rng) => {
        const target = pick(rng, UNIT_ITEMS);
        return labelMc(`Which unit is best to measure the ${target.what} of ${target.item}?`, target.unit, ['grams (g)', 'kilograms (kg)', 'liters (L)'], rng);
      }),
      level('g3.market.mass-volume', 'Scales & Jugs', 'number-pad', 2, (rng) => {
        const form = randInt(rng, 0, 3);
        const a = randInt(rng, 2, 9);
        const b = randInt(rng, 2, 9);
        if (form === 0) return numPad(`Each bucket holds ${a} liters of water. How many liters do ${b} buckets hold?`, a * b);
        if (form === 1) return numPad(`${a * b} kg of rice is packed into ${b} equal bags. How many kg in each bag?`, a);
        if (form === 2) {
          const melon = randInt(rng, 120, 480);
          const pineapple = randInt(rng, 100, 450);
          return numPad(`A mango has a mass of ${melon} g and a pineapple ${pineapple} g. What is their total mass in grams?`, melon + pineapple);
        }
        const jug = randInt(rng, 12, 40);
        const poured = randInt(rng, 3, jug - 2);
        return numPad(`A barrel has ${jug} liters of juice. The crew drinks ${poured} liters. How many liters are left?`, jug - poured);
      }),
      level('g3.market.two-step', 'Two-Step Treasure', 'number-pad', 2, (rng) => {
        const start = randInt(rng, 100, 500);
        const found = randInt(rng, 20, 200);
        const spent = randInt(rng, 10, start + found - 10);
        return numPad(`Captain ${name(rng)} had ${start} coins, found ${found} more, then spent ${spent}. How many coins now?`, start + found - spent, {
          hint: 'Step 1: add. Step 2: subtract.',
        });
      }),
      level('g3.market.two-step-multiply', 'Market Master', 'number-pad', 3, (rng) => {
        const packs = randInt(rng, 2, 9);
        const each = randInt(rng, 3, 10);
        const form = randInt(rng, 0, 2);
        if (form === 0) {
          const given = randInt(rng, 1, packs * each - 1);
          return numPad(`${name(rng)} buys ${packs} packs of ${each} stickers and gives away ${given}. How many stickers are left?`, packs * each - given, {
            hint: 'Multiply first, then subtract.',
          });
        }
        if (form === 1) {
          const extra = randInt(rng, 1, 20);
          return numPad(`The market has ${packs} crates with ${each} coconuts each, plus ${extra} loose coconuts. How many coconuts in all?`, packs * each + extra, {
            hint: 'Multiply first, then add.',
          });
        }
        const eaten = randInt(rng, 1, each - 1);
        return numPad(`${packs * each} bananas are shared equally by ${packs} monkeys. Each monkey eats ${eaten}. How many bananas does each monkey have left?`, each - eaten, {
          hint: 'Divide first, then subtract.',
        });
      }),
    ],
  };
}

export const g3: GradeDef = {
  id: 'g3',
  title: 'Grade 3',
  ages: '8–9',
  units: [
    multiplicationCove(),
    divisionDocks(),
    numberBay(),
    fractionFeast(),
    clockTower(),
    sandcastleBuilders(),
    shapeShipyard(),
    islandGraphs(),
    pirateMarket(),
    ...g3Pack,
  ],
};

