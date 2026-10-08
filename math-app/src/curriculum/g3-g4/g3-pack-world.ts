import { pick, randInt, randInts, shuffle } from '../../core/rng';
import type { UnitDef } from '../../core/types';
import { level, matchPairs, numPad, trueFalse } from '../helpers';
import { board, clockFromMinutes, countTap, distractors, grid, labelMc, name, NAMES, numMc } from './util';
import { emojiBoard, fractionWords, moneyLabel, pickTwo, SEA_THINGS, TREATS } from './g3-pack-data';

/* Grade 3 pack — world-side units: fractions, geometry, measurement, data,
   money, time and two-step word problems. */

const PACK_DENOMS = [2, 3, 4, 6, 8] as const;
const PIES = ['pie', 'pizza', 'cake', 'orange', 'tortilla'] as const;

function fractionFiesta(): UnitDef {
  return {
    id: 'g3.pack-fraction',
    title: 'Fraction Fiesta',
    emoji: '🍰',
    domain: 'fractions',
    levels: [
      level('g3.pack-fraction.name-part', 'Name the Slice', 'multiple-choice', 1, (rng) => {
        const d = pick(rng, PACK_DENOMS);
        const food = pick(rng, PIES);
        return labelMc(`A ${food} is cut into ${d} equal slices. What is one slice called?`, fractionWords(1, d), [
          `one ${d}`,
          `${d} wholes`,
          fractionWords(1, PACK_DENOMS[(PACK_DENOMS.indexOf(d) + 1) % PACK_DENOMS.length]),
        ], rng, { visual: { text: `1/${d}` }, hint: 'The bottom number names the size of each part.' });
      }),
      level('g3.pack-fraction.unit-fraction', 'Unit Fraction', 'multiple-choice', 1, (rng) => {
        const d = pick(rng, PACK_DENOMS);
        const n = randInt(rng, 2, d - 1);
        return labelMc(`A bar shows ${n} parts shaded out of ${d} equal parts. What fraction is shaded?`, `${n}/${d}`, [`${n}/${d - n}`, `${d - n}/${d}`, `${d}/${n}`], rng, {
          hint: 'Shaded parts on top, all parts on bottom.',
        });
      }),
      level('g3.pack-fraction.denominator', 'Bottom Number', 'multiple-choice', 1, (rng) => {
        const d = pick(rng, PACK_DENOMS);
        const n = randInt(rng, 1, d - 1);
        return labelMc(`In the fraction ${n}/${d}, what does the ${d} on the bottom tell you?`, `the pie is cut into ${d} equal parts`, [
          `${d} parts are shaded`,
          `there are ${d} pies`,
          `${d} people share it`,
        ], rng, { hint: 'The bottom number counts ALL the equal parts.' });
      }),
      level('g3.pack-fraction.slices-left', 'Slices Left', 'number-pad', 1, (rng) => {
        const d = pick(rng, [4, 6, 8] as const);
        const eaten = randInt(rng, 1, d - 2);
        return numPad(`A pizza has ${d} equal slices. The crew eats ${eaten}. How many slices are left?`, d - eaten, {
          visual: { text: `${d} − ${eaten}` },
          hint: 'Count the slices that are left.',
        });
      }),
      level('g3.pack-fraction.of-set', 'Fraction of the Crew', 'multiple-choice', 2, (rng) => {
        const [first, second] = pickTwo(rng, SEA_THINGS);
        const d = pick(rng, [4, 6, 8] as const);
        const n = randInt(rng, 1, d - 1);
        const visual = `${first.emoji.repeat(n)}${second.emoji.repeat(d - n)}`;
        return labelMc(
          `Here are ${d} sea friends. What fraction are ${first.plural}?\n${visual}`,
          `${n}/${d}`,
          [`${d - n}/${d}`, `${n}/${d - n}`, `${d}/${n}`],
          rng,
          { hint: `Count the ${first.plural} for the top; all ${d} friends go on the bottom.` },
        );
      }),
      level('g3.pack-fraction.star-line', 'Star on the Line', 'multiple-choice', 2, (rng) => {
        const d = pick(rng, PACK_DENOMS);
        const k = randInt(rng, 1, d - 1);
        const marks = Array.from({ length: d }, (_, i) => (i + 1 === k ? '⭐' : i + 1 === d ? '🏁' : '|')).join('—');
        return labelMc(
          `The line from 0 to 1 is split into ${d} equal jumps. What fraction is at the ⭐?`,
          `${k}/${d}`,
          [`${k + 1}/${d}`, `${k}/${d + 1}`, `${k - 1 === 0 ? k + 2 : k - 1}/${d}`],
          rng,
          { visual: { text: `0 —${marks}` }, hint: 'Count jumps from 0 to the star.' },
        );
      }),
      level('g3.pack-fraction.equivalent', 'Same-Size Shares', 'multiple-choice', 2, (rng) => {
        const d = pick(rng, [2, 3, 4] as const);
        const n = randInt(rng, 1, d - 1);
        const k = pick(rng, [2, 3] as const);
        const answer = `${n * k}/${d * k}`;
        return labelMc(`Which fraction is the same size as ${n}/${d}?`, answer, [`${n + k}/${d + k}`, `${n * k}/${d}`, `${n}/${d * k}`], rng, {
          visual: { text: `${n}/${d} = ?` },
          hint: `Multiply top and bottom by ${k}: ${n * k}/${d * k}.`,
        });
      }),
      level('g3.pack-fraction.whole-pie', 'The Whole Pie', 'multiple-choice', 2, (rng) => {
        const d = pick(rng, PACK_DENOMS);
        return labelMc(`${d}/${d} of a pie is the same as…`, '1 whole pie', ['0 pies', '1/2 a pie', `${d} whole pies`], rng, {
          visual: { text: `${d}/${d}` },
          hint: 'When top and bottom match, the whole thing is there!',
        });
      }),
      level('g3.pack-fraction.match-words', 'Fraction Words', 'match-pairs', 2, (rng) => {
        const picks = shuffle(rng, PACK_DENOMS).slice(0, 4);
        const pairs = picks.map((d) => {
          const n = randInt(rng, 1, d - 1);
          return { left: `${n}/${d}`, right: fractionWords(n, d) };
        });
        return matchPairs('Match each fraction to its name.', pairs);
      }),
      level('g3.pack-fraction.compare-den', 'More Slices Wins', 'multiple-choice', 3, (rng) => {
        const d = pick(rng, PACK_DENOMS);
        const [n1, n2] = randInts(rng, 1, d - 1, 2);
        const bigger = Math.max(n1, n2);
        return labelMc(`Same-size ${pick(rng, PIES)} slices! Which is more: ${n1}/${d} or ${n2}/${d}?`, `${bigger}/${d}`, [`${Math.min(n1, n2)}/${d}`, 'They are equal'], rng, {
          hint: 'Same size pieces — more pieces is more pie!',
        });
      }),
      level('g3.pack-fraction.compare-num', 'Smaller Pieces', 'multiple-choice', 3, (rng) => {
        const [d1, d2] = pickTwo(rng, PACK_DENOMS);
        const n = randInt(rng, 1, Math.min(d1, d2) - 1);
        const [bigger, smaller] = d1 < d2 ? [d1, d2] : [d2, d1];
        return labelMc(`Which is more: ${n}/${d1} or ${n}/${d2}?`, `${n}/${bigger}`, [`${n}/${smaller}`, 'They are equal'], rng, {
          hint: 'More equal parts means smaller pieces!',
        });
      }),
      level('g3.pack-fraction.missing-num', 'Hidden Numerator', 'number-pad', 3, (rng) => {
        const d = pick(rng, [2, 3, 4] as const);
        const n = randInt(rng, 1, d - 1);
        const k = pick(rng, [2, 3] as const);
        return numPad(`Find the missing number: ${n}/${d} = ⭐/${d * k}`, n * k, {
          visual: { text: `${n}/${d} = ⭐/${d * k}` },
          hint: `The bottom went × ${k} — do the same on top.`,
        });
      }),
    ],
  };
}

const PACK_CLUES = [
  { clue: '4 square corners and all 4 sides equal', shape: 'Square' },
  { clue: '4 square corners but only opposite sides equal', shape: 'Rectangle' },
  { clue: 'all 4 sides equal but tilted, no square corners', shape: 'Rhombus' },
  { clue: 'opposite sides parallel and equal, but slanted corners', shape: 'Parallelogram' },
  { clue: 'only one pair of parallel sides', shape: 'Trapezoid' },
] as const;

const PACK_QUAD_FACTS: [string, boolean][] = [
  ['A quadrilateral has 4 vertices.', true],
  ['A trapezoid has 2 pairs of parallel sides.', false],
  ['Every rhombus is a parallelogram.', true],
  ['Every parallelogram is a rhombus.', false],
  ['A hexagon has 5 sides.', false],
  ['A rectangle has square corners.', true],
  ['A square is both a rectangle and a rhombus.', true],
  ['A parallelogram has no parallel sides.', false],
];

const PACK_SHAPE_MATCH = [
  { left: 'Pentagon', right: '5 sides' },
  { left: 'Octagon', right: '8 sides' },
  { left: 'Rhombus', right: 'equal sides, slanted' },
  { left: 'Trapezoid', right: 'one parallel pair' },
  { left: 'Rectangle', right: 'right angles' },
  { left: 'Hexagon', right: '6 sides' },
] as const;

const POLYGONS: [string, number][] = [
  ['triangle', 3],
  ['square', 4],
  ['pentagon', 5],
  ['hexagon', 6],
  ['heptagon', 7],
  ['octagon', 8],
];

function shapeDock(): UnitDef {
  return {
    id: 'g3.pack-shapes',
    title: 'Shape Dock',
    emoji: '⛵',
    domain: 'geometry',
    levels: [
      level('g3.pack-shapes.sides', 'Count the Sides', 'multiple-choice', 1, (rng) => {
        const [shape, sides] = pick(rng, POLYGONS);
        return numMc(`How many sides does a ${shape} have?`, sides, [sides + 1, sides - 1, sides + 2], rng, {
          hint: 'Count around the edge.',
        });
      }),
      level('g3.pack-shapes.quad-spot', 'Quad Spotter', 'multiple-choice', 1, (rng) => {
        const quad = pick(rng, ['Square', 'Rectangle', 'Rhombus', 'Trapezoid'] as const);
        const others = shuffle(rng, ['Triangle', 'Pentagon', 'Hexagon', 'Circle'] as const).slice(0, 3);
        return labelMc('Which of these is a quadrilateral?', quad, [...others], rng, {
          hint: 'Quadrilaterals have exactly 4 sides.',
        });
      }),
      level('g3.pack-shapes.corners', 'Corner Count', 'number-pad', 1, (rng) => {
        const [shape, sides] = pick(rng, POLYGONS);
        return numPad(`How many corners (vertices) does a ${shape} have?`, sides, {
          hint: 'A polygon has the same number of sides and corners.',
        });
      }),
      level('g3.pack-shapes.share-pie', 'Fair Shares', 'multiple-choice', 1, (rng) => {
        const d = pick(rng, [2, 3, 4, 6, 8] as const);
        const food = pick(rng, PIES);
        return labelMc(`A ${food} is split into ${d} equal parts. Each part is what fraction of the ${food}?`, `1/${d}`, [
          `${d}/1`,
          `1/${d + 1}`,
          `${d}/${d}`,
        ], rng, { hint: 'Equal parts make unit fractions: 1 over the number of parts.' });
      }),
      level('g3.pack-shapes.riddle', 'Shape Riddle', 'multiple-choice', 2, (rng) => {
        const target = pick(rng, PACK_CLUES);
        return labelMc(
          `I am a quadrilateral with ${target.clue}. Who am I?`,
          target.shape,
          shuffle(rng, PACK_CLUES.filter((item) => item.shape !== target.shape)).slice(0, 3).map((item) => item.shape),
          rng,
          { hint: 'Count sides, corners, and equal sides.' },
        );
      }),
      level('g3.pack-shapes.half-catch', 'Half the Catch', 'number-pad', 2, (rng) => {
        const half = randInt(rng, 2, 15);
        const total = half * 2;
        return numPad(`${total} fish swim in a net. Exactly half are silver. How many silver fish?`, half, {
          visual: { text: `1/2 of ${total}` },
          hint: 'Split into 2 equal groups.',
        });
      }),
      level('g3.pack-shapes.parallel', 'Parallel Pairs', 'multiple-choice', 2, (rng) => {
        const ask = pick(rng, [
          { q: 'Which shape always has 2 pairs of parallel sides?', answer: 'Parallelogram', wrongs: ['Trapezoid', 'Triangle', 'Pentagon'] },
          { q: 'Which shape has exactly 1 pair of parallel sides?', answer: 'Trapezoid', wrongs: ['Parallelogram', 'Rectangle', 'Rhombus'] },
          { q: 'Which of these has NO parallel sides?', answer: 'Triangle', wrongs: ['Rectangle', 'Parallelogram', 'Square'] },
          { q: 'Which quadrilateral has both pairs of opposite sides parallel?', answer: 'Rectangle', wrongs: ['Trapezoid', 'Triangle', 'Hexagon'] },
        ] as const);
        return labelMc(ask.q, ask.answer, [...ask.wrongs], rng, {
          hint: 'Parallel sides run the same way and never meet.',
        });
      }),
      level('g3.pack-shapes.strip-parts', 'Strip Parts', 'number-pad', 2, (rng) => {
        const parts = randInt(rng, 3, 6);
        const each = randInt(rng, 2, 8);
        return numPad(`A chocolate bar of ${parts * each} squares is split into ${parts} equal parts. How many squares are in each part?`, each, {
          visual: { text: `${parts * each} ÷ ${parts}` },
          hint: 'Equal parts means divide.',
        });
      }),
      level('g3.pack-shapes.truth-trick', 'Truth or Trick', 'true-false', 3, (rng) => {
        const [statement, truth] = pick(rng, PACK_QUAD_FACTS);
        return trueFalse(`True or false? ${statement}`, truth, {
          hint: 'A square is a special rectangle AND a special rhombus.',
        });
      }),
      level('g3.pack-shapes.match-clues', 'Clue Match', 'match-pairs', 3, (rng) => {
        const pairs = shuffle(rng, [...PACK_SHAPE_MATCH]).slice(0, 4).map((item) => ({ left: item.left, right: item.right }));
        return matchPairs('Match each shape to its clue.', pairs);
      }),
      level('g3.pack-shapes.frame-parts', 'Picture Frame Parts', 'number-pad', 3, (rng) => {
        const parts = randInt(rng, 3, 8);
        const shown = randInt(rng, 1, parts - 1);
        return numPad(`A flag is divided into ${parts} equal stripes. ${shown} stripe${shown > 1 ? 's are' : ' is'} already red. How many stripes are left to paint?`, parts - shown, {
          visual: { text: `${'🟥'.repeat(shown)}${'⬜'.repeat(parts - shown)}` },
          hint: `All ${parts} stripes minus the ${shown} red ones.`,
        });
      }),
    ],
  };
}

const MASS_ITEMS = [
  { item: 'a feather', best: 'grams (g)' },
  { item: 'a bag of apples', best: 'kilograms (kg)' },
  { item: 'a paper clip', best: 'grams (g)' },
  { item: 'a treasure chest of gold', best: 'kilograms (kg)' },
  { item: 'a gold coin', best: 'grams (g)' },
  { item: 'a big sea turtle', best: 'kilograms (kg)' },
] as const;

const VOLUME_ITEMS = [
  { item: 'a spoon of honey', best: 'milliliters (mL)' },
  { item: 'a rain barrel', best: 'liters (L)' },
  { item: 'an eyedropper of water', best: 'milliliters (mL)' },
  { item: 'a swimming pool', best: 'liters (L)' },
  { item: 'a small juice box', best: 'milliliters (mL)' },
  { item: 'a ship’s water tank', best: 'liters (L)' },
] as const;

const AREA_SPOTS = ['deck', 'sail', 'hut floor', 'beach towel', 'garden bed', 'dock'] as const;

function measureMarina(): UnitDef {
  return {
    id: 'g3.pack-measure',
    title: 'Measure Marina',
    emoji: '📏',
    domain: 'measurement',
    levels: [
      level('g3.pack-measure.unit-squares', 'Tile Count', 'count-tap', 1, (rng) => {
        const rows = randInt(rng, 2, 4);
        const cols = randInt(rng, 3, 7);
        const answer = rows * cols;
        return countTap('Each 🟩 is 1 square unit. What is the area of the dock floor?', answer, [2 * (rows + cols), answer + 1, answer - 1, rows + cols], rng, {
          visual: grid(rows, cols, '🟩'),
          hint: 'Count every tile.',
        });
      }),
      level('g3.pack-measure.grams-kg', 'Grams or Kilograms?', 'multiple-choice', 1, (rng) => {
        const target = pick(rng, MASS_ITEMS);
        return labelMc(`Which unit is best to measure the mass of ${target.item}?`, target.best, ['grams (g)', 'kilograms (kg)', 'liters (L)'].filter((u) => u !== target.best), rng, {
          hint: 'Light things use grams; heavy things use kilograms.',
        });
      }),
      level('g3.pack-measure.ml-l', 'Milliliters or Liters?', 'multiple-choice', 1, (rng) => {
        const target = pick(rng, VOLUME_ITEMS);
        return labelMc(`Which unit is best to measure ${target.item}?`, target.best, ['milliliters (mL)', 'liters (L)', 'kilograms (kg)'].filter((u) => u !== target.best), rng, {
          hint: 'Tiny amounts use mL; big amounts use L.',
        });
      }),
      level('g3.pack-measure.heavy-light', 'Heavier Haul', 'multiple-choice', 1, (rng) => {
        const kg = randInt(rng, 1, 8);
        const g = randInt(rng, 100, 900);
        return labelMc(`Which is heavier: a ${kg} kg anchor or a ${g} g coin?`, `the ${kg} kg anchor`, [`the ${g} g coin`, 'they are equal'], rng, {
          hint: `${kg} kg is ${kg * 1000} g — much more than ${g} g!`,
        });
      }),
      level('g3.pack-measure.ribbon', 'Ribbon Measure', 'number-pad', 1, (rng) => {
        const a = randInt(rng, 10, 60);
        const b = randInt(rng, 10, 89);
        return numPad(`Two ribbons are ${a} cm and ${b} cm long. Together they are ___ cm.`, a + b, {
          visual: { text: `${a} + ${b}` },
          hint: 'Add the lengths.',
        });
      }),
      level('g3.pack-measure.area-deck', 'Deck Area', 'number-pad', 2, (rng) => {
        const l = randInt(rng, 3, 12);
        const w = randInt(rng, 2, 9);
        return numPad(`A ${pick(rng, AREA_SPOTS)} is ${l} m long and ${w} m wide. What is its area in square meters?`, l * w, {
          visual: { text: `${l} m × ${w} m` },
          hint: 'Area = length × width.',
        });
      }),
      level('g3.pack-measure.fence', 'Fence the Fort', 'number-pad', 2, (rng) => {
        const l = randInt(rng, 4, 15);
        const w = randInt(rng, 2, 10);
        return numPad(`A fort is ${l} m long and ${w} m wide. How many meters of fence go all the way around?`, 2 * (l + w), {
          visual: { text: `${l} + ${w} + ${l} + ${w}` },
          hint: 'Add all four sides.',
        });
      }),
      level('g3.pack-measure.scale-grams', 'Weigh the Haul', 'number-pad', 2, (rng) => {
        const each = randInt(rng, 20, 90);
        const count = randInt(rng, 2, 9);
        return numPad(`Each treasure bag has a mass of ${each} g. What is the mass of ${count} bags?`, each * count, {
          visual: { text: `${each} g × ${count}` },
          hint: 'Multiply grams by the number of bags.',
        });
      }),
      level('g3.pack-measure.pour', 'Pour It Out', 'number-pad', 2, (rng) => {
        const liters = randInt(rng, 2, 9);
        const kind = rng() < 0.5;
        if (kind) {
          return numPad(`A barrel holds ${liters} liters of water. How many milliliters is that?`, liters * 1000, {
            hint: '1 liter = 1,000 milliliters.',
          });
        }
        const per = pick(rng, [2, 4, 5, 10] as const);
        return numPad(`${liters} jugs each hold ${per} liters. How many liters in all?`, liters * per, {
          hint: 'Multiply liters per jug by the number of jugs.',
        });
      }),
      level('g3.pack-measure.bigger-yard', 'Bigger Yard', 'multiple-choice', 3, (rng) => {
        const l1 = randInt(rng, 3, 9);
        const w1 = randInt(rng, 2, 9);
        const l2 = randInt(rng, 3, 9);
        let w2 = randInt(rng, 2, 9);
        while (l2 * w2 === l1 * w1) {
          w2 = randInt(rng, 2, 9);
        }
        const area1 = l1 * w1;
        const area2 = l2 * w2;
        const first = area1 > area2;
        return labelMc(
          `Garden A is ${l1} m × ${w1} m. Garden B is ${l2} m × ${w2} m. Which has the bigger area?`,
          `Garden ${first ? 'A' : 'B'} (${Math.max(area1, area2)} sq m)`,
          [`Garden ${first ? 'B' : 'A'} (${Math.min(area1, area2)} sq m)`, 'They are equal'],
          rng,
          { hint: `A: ${l1}×${w1} = ${area1}. B: ${l2}×${w2} = ${area2}.` },
        );
      }),
      level('g3.pack-measure.missing-length', 'Missing Length', 'number-pad', 3, (rng) => {
        const w = randInt(rng, 2, 9);
        const l = randInt(rng, w + 1, 12);
        const useArea = rng() < 0.5;
        if (useArea) {
          return numPad(`A rug has an area of ${l * w} square meters and a width of ${w} m. What is its length?`, l, {
            visual: { text: `${l * w} ÷ ${w} = ?` },
            hint: 'Area ÷ width = length.',
          });
        }
        return numPad(`A sandbox has a perimeter of ${2 * (l + w)} m. Its length is ${l} m. What is its width?`, w, {
          hint: `Half of ${2 * (l + w)} is ${l + w} — then subtract the length.`,
        });
      }),
      level('g3.pack-measure.half-covered', 'Half Covered', 'multiple-choice', 3, (rng) => {
        const l = randInt(rng, 2, 7) * 2;
        const w = randInt(rng, 2, 8);
        const area = l * w;
        return numMc(`A ${l} m × ${w} m deck is half covered by a sail. How many square meters are covered?`, area / 2, [area, area / 2 + 1, area / 4], rng, {
          hint: `Area is ${area}; half of it is covered.`,
        });
      }),
    ],
  };
}

const GRAPH_TOPICS = [
  { topic: 'favorite island animal', options: ['🐢 Turtles', '🦀 Crabs', '🐬 Dolphins', '🐙 Octopuses'] },
  { topic: 'favorite treasure', options: ['🪙 Coins', '💎 Gems', '📜 Maps', '🗝️ Keys'] },
  { topic: 'favorite island snack', options: ['🥥 Coconuts', '🍉 Melons', '🍌 Bananas', '🍍 Pineapples'] },
] as const;

function packBars(rng: () => number, count: number) {
  const scale = pick(rng, [2, 5, 10] as const);
  const topic = pick(rng, GRAPH_TOPICS);
  const options = shuffle(rng, [...topic.options]).slice(0, count);
  const lengths = randInts(rng, 1, 7, count);
  const lines = [`Each ▇ = ${scale} votes`, ...options.map((option, index) => `${option.split(' ')[0]} ${'▇'.repeat(lengths[index])}`)];
  return { scale, topic: topic.topic, options, lengths, visual: board(lines) };
}

function graphGrotto(): UnitDef {
  return {
    id: 'g3.pack-graphs',
    title: 'Graph Grotto',
    emoji: '📊',
    domain: 'data',
    levels: [
      level('g3.pack-graphs.icon-count', 'Icon Count', 'number-pad', 1, (rng) => {
        const item = pick(rng, SEA_THINGS);
        const scale = pick(rng, [2, 5, 10] as const);
        const icons = randInt(rng, 2, 8);
        return numPad(`Each ${item.emoji} on the picture graph stands for ${scale} ${item.plural}. How many ${item.plural} are shown?`, icons * scale, {
          visual: board([`${item.emoji} = ${scale} ${item.plural}`, ...emojiBoard(item.emoji, icons)]),
          hint: `Count by ${scale}s for each icon.`,
        });
      }),
      level('g3.pack-graphs.tall-bar', 'Tallest Bar', 'multiple-choice', 1, (rng) => {
        const graph = packBars(rng, 3);
        const top = graph.lengths.indexOf(Math.max(...graph.lengths));
        return labelMc(`Kids voted for their ${graph.topic}. Which got the most votes?`, graph.options[top], graph.options.filter((_, i) => i !== top), rng, {
          visual: graph.visual,
          hint: 'Look for the longest bar.',
        });
      }),
      level('g3.pack-graphs.key-says', 'The Key Says', 'multiple-choice', 1, (rng) => {
        const scale = pick(rng, [2, 5, 10] as const);
        const icons = randInt(rng, 2, 7);
        return numMc(`In this graph each ⚽ = ${scale} votes. How many votes is ${'⚽'.repeat(icons)}?`, icons * scale, [icons + scale, icons * scale + scale, icons], rng, {
          visual: { text: `⚽ = ${scale} votes` },
          hint: `Count by ${scale}s, ${icons} times.`,
        });
      }),
      level('g3.pack-graphs.read-row', 'Read the Row', 'number-pad', 1, (rng) => {
        const item = pick(rng, TREATS);
        const icons = randInt(rng, 3, 8);
        return numPad(`How many ${item.emoji} icons are in this row of the picture graph?`, icons, {
          visual: board(emojiBoard(item.emoji, icons)),
          hint: 'Count each icon once.',
        });
      }),
      level('g3.pack-graphs.more-votes', 'More Votes', 'number-pad', 2, (rng) => {
        const graph = packBars(rng, 2);
        const [first, second] = graph.lengths[0] > graph.lengths[1] ? [0, 1] : [1, 0];
        return numPad(
          `Kids voted for their ${graph.topic}. How many more votes did ${graph.options[first]} get than ${graph.options[second]}?`,
          (graph.lengths[first] - graph.lengths[second]) * graph.scale,
          { visual: graph.visual, hint: 'Find each total with the key, then subtract.' },
        );
      }),
      level('g3.pack-graphs.total-votes', 'All the Votes', 'number-pad', 2, (rng) => {
        const graph = packBars(rng, 3);
        return numPad(`Kids voted for their ${graph.topic}. How many votes were counted in all?`, graph.lengths.reduce((s, l) => s + l, 0) * graph.scale, {
          visual: graph.visual,
          hint: 'Multiply each bar by the key, then add.',
        });
      }),
      level('g3.pack-graphs.half-icon', 'Half an Icon', 'multiple-choice', 2, (rng) => {
        const scale = pick(rng, [4, 6, 8, 10] as const);
        const item = pick(rng, SEA_THINGS);
        return numMc(`Each ${item.emoji} stands for ${scale} ${item.plural}. What does half of an ${item.emoji} stand for?`, scale / 2, [scale, scale * 2, 1], rng, {
          visual: { text: `${item.emoji} = ${scale}` },
          hint: `Half of ${scale} is…`,
        });
      }),
      level('g3.pack-graphs.fewest', 'Smallest Bar', 'multiple-choice', 2, (rng) => {
        const graph = packBars(rng, 3);
        const low = graph.lengths.indexOf(Math.min(...graph.lengths));
        return labelMc(`Kids voted for their ${graph.topic}. Which got the fewest votes?`, graph.options[low], graph.options.filter((_, i) => i !== low), rng, {
          visual: graph.visual,
          hint: 'Look for the shortest bar.',
        });
      }),
      level('g3.pack-graphs.two-bars', 'Two Bars Together', 'number-pad', 3, (rng) => {
        const graph = packBars(rng, 2);
        return numPad(
          `Kids voted for their ${graph.topic}. How many votes did ${graph.options[0]} and ${graph.options[1]} get together?`,
          (graph.lengths[0] + graph.lengths[1]) * graph.scale,
          { visual: graph.visual, hint: 'Multiply each bar by the key, then add the two totals.' },
        );
      }),
      level('g3.pack-graphs.scale-detective', 'Scale Detective', 'multiple-choice', 3, (rng) => {
        const scale = pick(rng, [2, 4, 5] as const);
        const lengths = randInts(rng, 2, 6, 3);
        return numMc(
          `A graph shows ${lengths.map((l) => `${l} ▇ = ${l * scale} votes`).join(', ')}. What does each ▇ stand for?`,
          scale,
          [scale + 1, scale * 2, scale - 1 === 0 ? scale + 2 : scale - 1],
          rng,
          { hint: `Divide votes by bars: ${lengths[0] * scale} ÷ ${lengths[0]}.` },
        );
      }),
    ],
  };
}

const COINS = [
  { name: 'penny', plural: 'pennies', cents: 1 },
  { name: 'nickel', plural: 'nickels', cents: 5 },
  { name: 'dime', plural: 'dimes', cents: 10 },
  { name: 'quarter', plural: 'quarters', cents: 25 },
] as const;

const SNACKS_PRICED = [
  { name: 'juice box', cents: 85 },
  { name: 'mango', cents: 60 },
  { name: 'crackers', cents: 45 },
  { name: 'cookie', cents: 75 },
  { name: 'coconut cup', cents: 90 },
] as const;

function coinCove(): UnitDef {
  return {
    id: 'g3.pack-coins',
    title: 'Coin Cove',
    emoji: '💰',
    domain: 'money',
    levels: [
      level('g3.pack-coins.coin-facts', 'Coin Facts', 'multiple-choice', 1, (rng) => {
        const coin = pick(rng, COINS);
        return labelMc(`How many cents is a ${coin.name} worth?`, `${coin.cents}¢`, distractors(coin.cents, [1, 5, 10, 25, 50, 100]).slice(0, 3).map((v) => `${v}¢`), rng, {
          hint: 'Penny 1¢, nickel 5¢, dime 10¢, quarter 25¢.',
        });
      }),
      level('g3.pack-coins.piggy', 'Piggy Count', 'number-pad', 1, (rng) => {
        const picks = shuffle(rng, [...COINS]).slice(0, randInt(rng, 2, 3));
        const counts = picks.map(() => randInt(rng, 1, 3));
        const total = picks.reduce((sum, coin, i) => sum + coin.cents * counts[i], 0);
        const desc = picks.map((coin, i) => `${counts[i]} ${counts[i] === 1 ? coin.name : coin.plural}`).join(' + ');
        return numPad(`How many cents is ${desc}?`, total, {
          hint: 'Add each coin’s value.',
        });
      }),
      level('g3.pack-coins.bill-coins', 'Bills and Coins', 'number-pad', 1, (rng) => {
        const dollars = randInt(rng, 1, 3);
        const quarters = randInt(rng, 1, 3);
        return numPad(`${name(rng)} has ${dollars} dollar bill${dollars > 1 ? 's' : ''} and ${quarters} quarter${quarters > 1 ? 's' : ''}. How many cents in all?`, dollars * 100 + quarters * 25, {
          hint: `A dollar is 100¢ and a quarter is 25¢.`,
        });
      }),
      level('g3.pack-coins.which-pouch', 'Which Pouch?', 'multiple-choice', 1, (rng) => {
        const a = { dimes: randInt(rng, 1, 3), nickels: randInt(rng, 0, 3), pennies: randInt(rng, 0, 4) };
        let b = { dimes: randInt(rng, 1, 3), nickels: randInt(rng, 0, 3), pennies: randInt(rng, 0, 4) };
        let av = a.dimes * 10 + a.nickels * 5 + a.pennies;
        let bv = b.dimes * 10 + b.nickels * 5 + b.pennies;
        if (av === bv) {
          b = { ...b, pennies: b.pennies + 1 };
          bv += 1;
        }
        const describe = (p: typeof a) => `${p.dimes} dime${p.dimes === 1 ? '' : 's'}, ${p.nickels} nickel${p.nickels === 1 ? '' : 's'}, ${p.pennies} penn${p.pennies === 1 ? 'y' : 'ies'}`;
        return labelMc(
          `Pouch A: ${describe(a)}. Pouch B: ${describe(b)}. Which pouch has more cents?`,
          `Pouch ${av > bv ? 'A' : 'B'}`,
          [`Pouch ${av > bv ? 'B' : 'A'}`, 'They are equal'],
          rng,
          { hint: 'Dimes 10¢, nickels 5¢, pennies 1¢.' },
        );
      }),
      level('g3.pack-coins.make-100', 'Make a Dollar', 'number-pad', 2, (rng) => {
        const have = randInt(rng, 20, 95);
        return numPad(`${name(rng)} has ${have}¢. How many more cents make a whole dollar?`, 100 - have, {
          hint: `Count up from ${have}¢ to 100¢.`,
        });
      }),
      level('g3.pack-coins.change', 'Change Please', 'number-pad', 2, (rng) => {
        const price = randInt(rng, 15, 95);
        return numPad(`A shell costs ${price}¢. You pay with a dollar (100¢). How many cents change do you get?`, 100 - price, {
          visual: { text: `100 − ${price}` },
          hint: 'Subtract the price from 100.',
        });
      }),
      level('g3.pack-coins.coin-match', 'Coin Match', 'match-pairs', 2, (rng) => {
        const count = randInt(rng, 3, 4);
        const pairs = shuffle(rng, [...COINS]).slice(0, count).map((coin) => ({ left: coin.name, right: `${coin.cents}¢` }));
        return matchPairs('Match each coin to its value.', pairs);
      }),
      level('g3.pack-coins.snack-total', 'Snack Total', 'number-pad', 2, (rng) => {
        const [first, second] = pickTwo(rng, SNACKS_PRICED);
        return numPad(`${name(rng)} buys a ${first.name} (${first.cents}¢) and a ${second.name} (${second.cents}¢). How many cents in all?`, first.cents + second.cents, {
          hint: 'Add the two prices.',
        });
      }),
      level('g3.pack-coins.fewest', 'Fewest Coins', 'multiple-choice', 3, (rng) => {
        const target = pick(rng, [30, 35, 40, 45, 60] as const);
        const options =
          target === 30
            ? ['1 quarter + 1 nickel', '3 dimes', '6 nickels']
            : target === 35
              ? ['1 quarter + 1 dime', '7 nickels', '3 dimes + 1 nickel']
              : target === 40
                ? ['1 quarter + 1 dime + 1 nickel', '4 dimes', '8 nickels']
                : target === 45
                  ? ['1 quarter + 2 dimes', '9 nickels', '4 dimes + 1 nickel']
                  : ['2 quarters + 1 dime', '6 dimes', '12 nickels'];
        const winners: Record<number, string> = {
          30: '1 quarter + 1 nickel',
          35: '1 quarter + 1 dime',
          40: '1 quarter + 1 dime + 1 nickel',
          45: '1 quarter + 2 dimes',
          60: '2 quarters + 1 dime',
        };
        return labelMc(`Which set makes ${target}¢ with the fewest coins?`, winners[target], options.filter((o) => o !== winners[target]), rng, {
          hint: 'Big coins mean fewer coins!',
        });
      }),
      level('g3.pack-coins.enough', 'Enough Gold?', 'true-false', 3, (rng) => {
        const dollars = randInt(rng, 3, 8);
        const purse = dollars * 100;
        const p1 = randInt(rng, 120, dollars * 50);
        const p2 = randInt(rng, 100, dollars * 60);
        const total = p1 + p2;
        return trueFalse(`${name(rng)} has $${dollars}.00. A map costs ${moneyLabel(p1)} and a compass ${moneyLabel(p2)}. Is $${dollars}.00 enough for both?`, total <= purse, {
          visual: { text: `${moneyLabel(p1)} + ${moneyLabel(p2)}` },
          hint: `Add the prices first: ${moneyLabel(total)}.`,
        });
      }),
    ],
  };
}

const PORT_EVENTS = ['a pearl-diving lesson', 'a sandcastle contest', 'a parrot show', 'a fishing trip', 'a map-making class', 'a cannonball splash-off'] as const;

function tickTockTavern(): UnitDef {
  return {
    id: 'g3.pack-time',
    title: 'Tick-Tock Tavern',
    emoji: '⏰',
    domain: 'time',
    levels: [
      level('g3.pack-time.clock-face', 'Face the Clock', 'multiple-choice', 1, (rng) => {
        const hour = randInt(rng, 1, 12);
        const step = randInt(rng, 1, 11);
        const minute = step * 5;
        return labelMc(
          `The minute hand points at the ${step} and the hour hand is just past the ${hour}. What time is it?`,
          `${hour}:${String(minute).padStart(2, '0')}`,
          [`${hour}:${String(step).padStart(2, '0')}`, `${(hour % 12) + 1}:${String(minute).padStart(2, '0')}`, `${hour}:${String((minute + 10) % 60).padStart(2, '0')}`],
          rng,
          { visual: { text: '🕰️' }, hint: 'The minute hand counts by 5s: the 4 means 20.' },
        );
      }),
      level('g3.pack-time.half-quarter', 'Halves and Quarters', 'multiple-choice', 1, (rng) => {
        const hour = randInt(rng, 1, 12);
        const phrase = pick(rng, [
          { say: `half past ${hour}`, time: `${hour}:30`, wrongs: [`${hour}:15`, `${hour}:45`, `${(hour % 12) + 1}:30`] },
          { say: `quarter past ${hour}`, time: `${hour}:15`, wrongs: [`${hour}:30`, `${hour}:45`, `${hour}:05`] },
          { say: `quarter to ${(hour % 12) + 1}`, time: `${hour}:45`, wrongs: [`${hour}:15`, `${(hour % 12) + 1}:15`, `${hour}:30`] },
        ] as const);
        return labelMc(`What time is “${phrase.say}”?`, phrase.time, [...phrase.wrongs], rng, {
          hint: 'A quarter is 15 minutes; half is 30.',
        });
      }),
      level('g3.pack-time.hour-minutes', 'Minutes in an Hour', 'number-pad', 1, (rng) => {
        const part = pick(rng, [2, 4] as const);
        return numPad(part === 2 ? 'How many minutes are in half an hour?' : 'How many minutes are in a quarter of an hour?', 60 / part, {
          hint: 'A whole hour has 60 minutes.',
        });
      }),
      level('g3.pack-time.am-pm', 'AM or PM?', 'multiple-choice', 1, (rng) => {
        const morning = rng() < 0.5;
        const event = morning ? pick(rng, ['eats breakfast', 'sails out at sunrise', 'starts school'] as const) : pick(rng, ['eats dinner', 'watches the sunset', 'goes to bed'] as const);
        const hour = randInt(rng, 1, 11);
        return labelMc(`${name(rng)} ${event} at ${hour} o’clock. Is that AM or PM?`, morning ? 'AM' : 'PM', [morning ? 'PM' : 'AM'], rng, {
          hint: 'AM is morning, PM is afternoon and night.',
        });
      }),
      level('g3.pack-time.tick-minute', 'Minute Tick', 'multiple-choice', 2, (rng) => {
        const hour = randInt(rng, 1, 12);
        const step = randInt(rng, 1, 11);
        const extra = randInt(rng, 1, 4);
        const minute = step * 5 + extra;
        return labelMc(
          `The minute hand is ${extra} little mark${extra > 1 ? 's' : ''} past the ${step}, and the hour hand is just past the ${hour}. What time is it?`,
          `${hour}:${String(minute).padStart(2, '0')}`,
          [`${hour}:${String(step * 5).padStart(2, '0')}`, `${hour}:${String(Math.min(minute + 5, 59)).padStart(2, '0')}`, `${(hour % 12) + 1}:${String(minute).padStart(2, '0')}`],
          rng,
          { hint: `Count by 5s to ${step * 5}, then add ${extra}.` },
        );
      }),
      level('g3.pack-time.sand-glass', 'Sand Glass', 'number-pad', 2, (rng) => {
        const hour = randInt(rng, 1, 11);
        const start = randInt(rng, 0, 30);
        const length = randInt(rng, 10, 59 - start);
        return numPad(
          `${pick(rng, PORT_EVENTS).replace(/^./, (c) => c.toUpperCase())} runs from ${hour}:${String(start).padStart(2, '0')} to ${hour}:${String(start + length).padStart(2, '0')}. How many minutes long is it?`,
          length,
          { hint: `${start + length} − ${start} minutes.` },
        );
      }),
      level('g3.pack-time.dock-time', 'Docking Time', 'multiple-choice', 2, (rng) => {
        const startTotal = randInt(rng, 8, 17) * 60 + randInt(rng, 0, 40);
        const length = randInt(rng, 10, 55);
        const end = startTotal + length;
        return labelMc(
          `A boat leaves at ${clockFromMinutes(startTotal)} and sails ${length} minutes. When does it dock?`,
          clockFromMinutes(end),
          [clockFromMinutes(end + 10), clockFromMinutes(end - 10), clockFromMinutes(end + 60)],
          rng,
          { hint: 'Count on to the next hour first.' },
        );
      }),
      level('g3.pack-time.later-tide', 'Later Tide', 'multiple-choice', 2, (rng) => {
        const hour = randInt(rng, 1, 11);
        const [m1, m2] = randInts(rng, 5, 55, 2);
        const later = Math.max(m1, m2);
        return labelMc(`Which time is later: ${hour}:${String(m1).padStart(2, '0')} or ${hour}:${String(m2).padStart(2, '0')}?`, `${hour}:${String(later).padStart(2, '0')}`, [`${hour}:${String(Math.min(m1, m2)).padStart(2, '0')}`, 'They are the same'], rng, {
          hint: 'Same hour — compare the minutes.',
        });
      }),
      level('g3.pack-time.voyage', 'Voyage Length', 'number-pad', 3, (rng) => {
        const startTotal = randInt(rng, 8, 16) * 60 + randInt(rng, 5, 55);
        const length = randInt(rng, 20, 95);
        const end = Math.min(startTotal + length, 23 * 60 + 30);
        const realLength = end - startTotal;
        return numPad(
          `A voyage starts at ${clockFromMinutes(startTotal)} and ends at ${clockFromMinutes(end)}. How many minutes did it take?`,
          realLength,
          { hint: 'Count up to the next hour, then add the rest.' },
        );
      }),
      level('g3.pack-time.start-back', 'When Did It Start?', 'multiple-choice', 3, (rng) => {
        const endTotal = randInt(rng, 9, 18) * 60 + randInt(rng, 10, 55);
        const length = randInt(rng, 10, 50);
        const start = endTotal - length;
        return labelMc(
          `${pick(rng, PORT_EVENTS).replace(/^./, (c) => c.toUpperCase())} ended at ${clockFromMinutes(endTotal)} after ${length} minutes. When did it start?`,
          clockFromMinutes(start),
          [clockFromMinutes(start + 60), clockFromMinutes(endTotal + length), clockFromMinutes(start - 10)],
          rng,
          { hint: 'Count backward from the end time.' },
        );
      }),
      level('g3.pack-time.time-pairs', 'Time Match', 'match-pairs', 3, (rng) => {
        const h = randInt(rng, 1, 9);
        const pairs = shuffle(rng, [
          { left: `quarter past ${h}`, right: `${h}:15` },
          { left: `half past ${h}`, right: `${h}:30` },
          { left: `quarter to ${h + 1}`, right: `${h}:45` },
          { left: `ten past ${h + 1}`, right: `${h + 1}:10` },
          { left: `twenty to ${h + 2}`, right: `${h + 1}:40` },
          { left: `five to ${h + 2}`, right: `${h + 1}:55` },
        ]).slice(0, 4);
        return matchPairs('Match each phrase to its clock time.', pairs);
      }),
    ],
  };
}

function treasureTales(): UnitDef {
  return {
    id: 'g3.pack-stories',
    title: 'Treasure Word Tales',
    emoji: '📜',
    domain: 'word-problems',
    levels: [
      level('g3.pack-stories.coins-tale', 'Coin Tale', 'number-pad', 1, (rng) => {
        const who = name(rng);
        const start = randInt(rng, 40, 90);
        const found = randInt(rng, 10, 60);
        const gave = randInt(rng, 5, start + found - 10);
        return numPad(`${who} had ${start} shells, found ${found} more, then gave away ${gave}. How many shells now?`, start + found - gave, {
          hint: 'Step 1: add. Step 2: subtract.',
        });
      }),
      level('g3.pack-stories.crates', 'Crates Plus', 'number-pad', 1, (rng) => {
        const crates = randInt(rng, 2, 8);
        const each = randInt(rng, 3, 9);
        const extra = randInt(rng, 2, 15);
        return numPad(`The dock has ${crates} crates with ${each} coconuts each, plus ${extra} loose ones. How many coconuts in all?`, crates * each + extra, {
          hint: 'Multiply first, then add the extras.',
        });
      }),
      level('g3.pack-stories.snack-attack', 'Snack Attack', 'number-pad', 1, (rng) => {
        const total = randInt(rng, 30, 80);
        const a = randInt(rng, 5, 20);
        const b = randInt(rng, 5, total - a - 5);
        return numPad(`The crew baked ${total} biscuits. They ate ${a} at lunch and ${b} at dinner. How many are left?`, total - a - b, {
          hint: 'Subtract twice.',
        });
      }),
      level('g3.pack-stories.teams', 'Dive Teams', 'number-pad', 1, (rng) => {
        const teams = randInt(rng, 2, 6);
        const each = randInt(rng, 3, 9);
        const boys = teams * each - randInt(rng, 1, teams * each - 1);
        const girls = teams * each - boys;
        return numPad(`${boys} boys and ${girls} girls split into ${teams} equal dive teams. How many kids are on each team?`, each, {
          hint: `First add ${boys} + ${girls}, then divide by ${teams}.`,
        });
      }),
      level('g3.pack-stories.sticker-haul', 'Sticker Haul', 'number-pad', 2, (rng) => {
        const packs = randInt(rng, 3, 9);
        const each = randInt(rng, 4, 10);
        const used = randInt(rng, 2, packs * each - 2);
        return numPad(`${name(rng)} buys ${packs} packs of ${each} stickers and uses ${used} on a map. How many stickers are left?`, packs * each - used, {
          hint: 'Multiply first, then subtract.',
        });
      }),
      level('g3.pack-stories.share-then-add', 'Share Then Add', 'number-pad', 2, (rng) => {
        const people = randInt(rng, 2, 8);
        const each = randInt(rng, 2, 9);
        const bonus = randInt(rng, 1, 12);
        return numPad(`${people * each} berries are shared equally by ${people} pirates. One pirate then finds ${bonus} more. How many berries does that pirate have now?`, each + bonus, {
          hint: `First ${people * each} ÷ ${people}, then add ${bonus}.`,
        });
      }),
      level('g3.pack-stories.fish-out', 'Fish Out', 'number-pad', 2, (rng) => {
        const tanks = randInt(rng, 2, 8);
        const each = randInt(rng, 2, 9);
        const escaped = randInt(rng, 5, 30);
        const start = tanks * each + escaped;
        return numPad(`A tanker holds ${start} fish. ${escaped} fish jump out. The rest split equally into ${tanks} tanks. How many fish per tank?`, each, {
          hint: `First subtract: ${start} − ${escaped} = ${tanks * each}. Then divide.`,
        });
      }),
      level('g3.pack-stories.twice-tale', 'Twice the Tale', 'number-pad', 2, (rng) => {
        const [who, friend] = pickTwo(rng, NAMES);
        const a = randInt(rng, 5, 25);
        return numPad(`${who} has ${a} gems. ${friend} has twice as many. How many gems do they have together?`, a * 3, {
          hint: `Twice ${a} is ${a * 2} — then add ${who}'s ${a}.`,
        });
      }),
      level('g3.pack-stories.pick-plan', 'Pick the Plan', 'multiple-choice', 3, (rng) => {
        const packs = randInt(rng, 2, 9);
        const each = randInt(rng, 3, 9);
        const eaten = randInt(rng, 2, 10);
        return labelMc(
          `${packs} bags of ${each} crackers. The crew eats ${eaten}. Which expression tells how many are left?`,
          `${packs} × ${each} − ${eaten}`,
          [`${packs} + ${each} − ${eaten}`, `${packs} × ${each} + ${eaten}`, `${each} − ${packs} + ${eaten}`],
          rng,
          { hint: 'Multiply to find the total first.' },
        );
      }),
      level('g3.pack-stories.left-share', 'Left to Share', 'number-pad', 3, (rng) => {
        const pirates = randInt(rng, 2, 8);
        const each = randInt(rng, 2, 9);
        const kept = randInt(rng, 5, 30);
        const total = pirates * each + kept;
        return numPad(`The crew finds ${total} shells. The captain keeps ${kept}, and the rest split equally among ${pirates} pirates. How many shells does each pirate get?`, each, {
          hint: `Subtract ${kept} first: ${total} − ${kept} = ${pirates * each}.`,
        });
      }),
      level('g3.pack-stories.two-groups', 'Two Groups Used', 'number-pad', 3, (rng) => {
        const a = randInt(rng, 6, 9);
        const b = randInt(rng, 6, 9);
        const c = randInt(rng, 2, 5);
        const d = randInt(rng, 2, 5);
        const earned = a * b;
        const used = c * d;
        return numPad(`${name(rng)} earns ${a} × ${b} shells and spends ${c} × ${d} on supplies. How many shells are left?`, earned - used, {
          visual: { text: `${a} × ${b} − ${c} × ${d}` },
          hint: `Earn ${earned}, spend ${used}.`,
        });
      }),
    ],
  };
}

export const g3PackWorld: UnitDef[] = [fractionFiesta(), shapeDock(), measureMarina(), graphGrotto(), coinCove(), tickTockTavern(), treasureTales()];
