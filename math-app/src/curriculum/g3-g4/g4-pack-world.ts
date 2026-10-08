import { pick, randInt, shuffle } from '../../core/rng';
import type { UnitDef } from '../../core/types';
import { level, matchPairs, numPad, orderSeq, trueFalse } from '../helpers';
import { board, clock, dec, distractors, fmt, labelMc, name } from './util';

/* Grade 4 expansion pack — world-side units: geometry, measurement, data, money, time, word problems. */

const QUAD_CLUES: [string, string, string[]][] = [
  ['4 right angles and 4 equal sides', 'Square', ['Rectangle', 'Rhombus', 'Trapezoid']],
  ['4 right angles, with only opposite sides equal', 'Rectangle', ['Square', 'Rhombus', 'Trapezoid']],
  ['4 equal sides but no right angles', 'Rhombus', ['Square', 'Rectangle', 'Trapezoid']],
  ['exactly 1 pair of parallel sides', 'Trapezoid', ['Rectangle', 'Parallelogram', 'Rhombus']],
  ['2 pairs of parallel sides and no right angles', 'Parallelogram', ['Rectangle', 'Square', 'Trapezoid']],
];

const QUAD_FACTS: [string, boolean][] = [
  ['Every square is a rectangle.', true],
  ['Every rectangle is a square.', false],
  ['A parallelogram has 2 pairs of parallel sides.', true],
  ['Every rhombus is a square.', false],
  ['A trapezoid has no parallel sides.', false],
  ['Every square is a rhombus.', true],
  ['A trapezoid has 2 pairs of parallel sides.', false],
  ['Every rectangle is a parallelogram.', true],
];

const TRIANGLE_CLUES: [string, string, string[]][] = [
  ['a right angle and 2 equal sides', 'right isosceles', ['right scalene', 'acute isosceles', 'equilateral']],
  ['3 equal sides and 3 equal angles', 'equilateral', ['isosceles', 'scalene', 'right isosceles']],
  ['an obtuse angle and 2 equal sides', 'obtuse isosceles', ['acute isosceles', 'right isosceles', 'obtuse scalene']],
  ['all acute angles and no equal sides', 'acute scalene', ['acute isosceles', 'obtuse scalene', 'equilateral']],
  ['a right angle and no equal sides', 'right scalene', ['right isosceles', 'acute scalene', 'equilateral']],
];

const ANGLE_SCENES: [string, string, string[]][] = [
  ['A door opened halfway to a right angle', '45°', ['15°', '90°', '135°']],
  ['A book opened flat', '180°', ['90°', '100°', '45°']],
  ['A tiny sliver of a pizza slice', '15°', ['85°', '90°', '150°']],
  ['Two castle walls meeting in a corner', '90°', ['45°', '60°', '120°']],
  ['A dragon wing stretched almost flat', '170°', ['80°', '20°', '90°']],
  ['A ladder leaning halfway between flat and straight up', '45°', ['15°', '90°', '180°']],
];

const PARALLEL_CLUES: [string, string, string[]][] = [
  ['exactly 1 pair of parallel sides', 'Trapezoid', ['Rectangle', 'Parallelogram', 'Rhombus']],
  ['2 pairs of parallel sides', 'Parallelogram', ['Trapezoid', 'Triangle', 'Pentagon']],
  ['no parallel sides at all', 'Scalene triangle', ['Rectangle', 'Trapezoid', 'Parallelogram']],
];

const PERPENDICULAR_COUNT: [string, number][] = [
  ['a rectangle', 4],
  ['a square', 4],
  ['a right triangle', 1],
  ['a slanted parallelogram (no right angles)', 0],
];

const SYMMETRY_COUNT: [string, number][] = [
  ['an equilateral triangle', 3],
  ['a square', 4],
  ['a rectangle that is not a square', 2],
  ['the letter H', 2],
  ['the letter A', 1],
  ['a regular pentagon', 5],
  ['an isosceles triangle', 1],
];

const SYMMETRY_PICK: [string, string, string[]][] = [
  ['exactly 2 lines of symmetry', 'H', ['A', 'F', 'Z']],
  ['exactly 1 line of symmetry', 'A', ['H', 'Z', 'S']],
  ['no lines of symmetry', 'F', ['A', 'H', 'O']],
  ['exactly 1 line of symmetry', 'isosceles triangle', ['equilateral triangle', 'square', 'rectangle']],
];

const SHAPE_MATCH_BANK: { left: string; right: string }[] = [
  { left: 'Square', right: '4 equal sides and 4 right angles' },
  { left: 'Rectangle', right: '4 right angles, opposite sides equal' },
  { left: 'Rhombus', right: '4 equal sides, no right angles needed' },
  { left: 'Trapezoid', right: 'exactly 1 pair of parallel sides' },
  { left: 'Parallelogram', right: '2 pairs of parallel sides' },
  { left: 'Right triangle', right: 'has one 90° angle' },
  { left: 'Equilateral triangle', right: '3 equal sides' },
  { left: 'Scalene triangle', right: 'no equal sides' },
];

const TURNS: [string, number][] = [
  ['a half turn and then a quarter turn', 270],
  ['three quarter turns in a row', 270],
  ['two half turns in a row', 360],
  ['two quarter turns in a row', 180],
  ['one half turn', 180],
  ['a half turn and two quarter turns', 360],
  ['five quarter turns in a row', 450],
];

function shapeCitadel() {
  return {
    id: 'g4.pack-geometry',
    title: 'Shape Citadel',
    emoji: '🛡️',
    domain: 'geometry' as const,
    levels: [
      level('g4.pack-geometry.quad-riddle', 'Quadrilateral Riddles', 'multiple-choice', 1, (rng) => {
        const [clue, answer, wrongs] = pick(rng, QUAD_CLUES);
        return labelMc(`A dragon's shield has ${clue}. What shape is it?`, answer, wrongs, rng, {
          hint: 'Check both clues: the angles AND the sides.',
        });
      }),
      level('g4.pack-geometry.quad-family', 'Shape Family Tree', 'true-false', 1, (rng) => {
        const [statement, truth] = pick(rng, QUAD_FACTS);
        return trueFalse(`True or false? ${statement}`, truth, {
          hint: 'Think of the shape families — squares live inside rectangles.',
        });
      }),
      level('g4.pack-geometry.angle-scenes', 'Angle Benchmarks', 'multiple-choice', 1, (rng) => {
        const [scene, answer, wrongs] = pick(rng, ANGLE_SCENES);
        return labelMc(`${scene} makes about what angle?`, answer, wrongs, rng, {
          hint: 'Compare to benchmarks: a right angle is 90°, a straight line is 180°.',
        });
      }),
      level('g4.pack-geometry.angle-clock', 'Clock Angles', 'number-pad', 1, (rng) => {
        if (rng() < 0.5) {
          const hour = randInt(rng, 1, 6);
          return numPad(`At ${hour}:00, what angle do the clock hands make?`, hour * 30, {
            hint: 'Each number on the clock is 30° apart.',
          });
        }
        const move = randInt(rng, 1, 11);
        return numPad(`The minute hand moves from the 12 to the ${move}. How many degrees?`, move * 30, {
          hint: 'Each number on the clock is 30° apart.',
        });
      }),
      level('g4.pack-geometry.triangle-both', 'Triangle Double Check', 'multiple-choice', 2, (rng) => {
        const [clue, answer, wrongs] = pick(rng, TRIANGLE_CLUES);
        return labelMc(`A triangle has ${clue}. What kind is it?`, answer, wrongs, rng, {
          hint: 'Classify by angles (acute/right/obtuse) AND by sides (equi/iso/scalene).',
        });
      }),
      level('g4.pack-geometry.third-angle', 'The Missing Angle', 'number-pad', 2, (rng) => {
        const a = randInt(rng, 30, 120);
        const b = randInt(rng, 20, 170 - a);
        return numPad(`Two angles of a triangle are ${a}° and ${b}°. What is the third?`, 180 - a - b, {
          hint: `A triangle's angles always add to 180°.`,
        });
      }),
      level('g4.pack-geometry.parallel-count', 'Parallel Side Hunt', 'multiple-choice', 2, (rng) => {
        const [clue, answer, wrongs] = pick(rng, PARALLEL_CLUES);
        return labelMc(`Which shape has ${clue}?`, answer, wrongs, rng, {
          hint: 'Parallel sides never meet, no matter how far they run.',
        });
      }),
      level('g4.pack-geometry.perpendicular-pairs', 'Perpendicular Corners', 'number-pad', 1, (rng) => {
        const [shape, count] = pick(rng, PERPENDICULAR_COUNT);
        return numPad(`How many pairs of perpendicular sides does ${shape} have?`, count, {
          hint: 'Perpendicular sides meet at a right angle — count each corner where that happens.',
        });
      }),
      level('g4.pack-geometry.symmetry-count', 'Count the Mirrors', 'number-pad', 2, (rng) => {
        const [shape, count] = pick(rng, SYMMETRY_COUNT);
        return numPad(`How many lines of symmetry does ${shape} have?`, count, {
          hint: 'Each line of symmetry folds the shape into two matching halves.',
        });
      }),
      level('g4.pack-geometry.symmetry-pick', 'Symmetry Pick', 'multiple-choice', 3, (rng) => {
        const [clue, answer, wrongs] = pick(rng, SYMMETRY_PICK);
        return labelMc(`Which of these has ${clue}?`, answer, wrongs, rng, {
          hint: 'Imagine folding each one — do both halves match?',
        });
      }),
      level('g4.pack-geometry.shape-match', 'Shape Spec Match', 'match-pairs', 3, (rng) => {
        const pairs = shuffle(rng, SHAPE_MATCH_BANK).slice(0, 4);
        return { ...matchPairs('Match each shape to its description.', shuffle(rng, pairs)), hint: 'Match sides AND angles together.' };
      }),
      level('g4.pack-geometry.turn-degrees', 'Turn Total', 'number-pad', 3, (rng) => {
        const [move, degrees] = pick(rng, TURNS);
        return numPad(`A knight spins ${move}. How many degrees total?`, degrees, {
          hint: 'A quarter turn is 90°, a half turn is 180°.',
        });
      }),
    ],
  };
}

const UNIT_CLUES: [string, string, string[]][] = [
  ['the mass of a dragon egg', 'grams', ['kilograms', 'liters', 'meters']],
  ['the water in a potion bottle', 'milliliters', ['liters', 'grams', 'kilometers']],
  ['the height of a castle', 'meters', ['centimeters', 'millimeters', 'grams']],
  ['the distance between two kingdoms', 'kilometers', ['centimeters', 'grams', 'liters']],
  ['the mass of a horse', 'kilograms', ['grams', 'liters', 'meters']],
  ['the juice in a tiny cup', 'milliliters', ['liters', 'kilograms', 'meters']],
  ['the length of a dragon', 'meters', ['grams', 'liters', 'millimeters']],
];

const MEASURE_COMPARE: { labels: string[]; winner: string }[] = [
  { labels: ['3 ft', '40 in', '1 yd'], winner: '40 in' },
  { labels: ['2 m', '150 cm', '210 cm'], winner: '210 cm' },
  { labels: ['5 kg', '4,500 g', '5,500 g'], winner: '5,500 g' },
  { labels: ['2 L', '1,500 mL', '2,500 mL'], winner: '2,500 mL' },
  { labels: ['6 ft', '2 yd', '80 in'], winner: '80 in' },
  { labels: ['3 kg', '3,500 g', '2,900 g'], winner: '3,500 g' },
];

const CONVERT_MATCH_BANK: { left: string; right: string }[] = [
  { left: '2 ft', right: '24 in' },
  { left: '3 ft', right: '36 in' },
  { left: '2 m', right: '200 cm' },
  { left: '3 kg', right: '3,000 g' },
  { left: '2 L', right: '2,000 mL' },
  { left: '4 yd', right: '12 ft' },
  { left: '2 km', right: '2,000 m' },
  { left: '5 ft', right: '60 in' },
];

function royalWorkshop() {
  return {
    id: 'g4.pack-measure',
    title: 'Royal Workshop',
    emoji: '⚖️',
    domain: 'measurement' as const,
    levels: [
      level('g4.pack-measure.ft-to-in', 'Feet to Inches', 'number-pad', 1, (rng) => {
        const ft = randInt(rng, 2, 12);
        const reverse = rng() < 0.3;
        if (reverse) {
          return numPad(`A banner is ${ft * 12} inches long. How many feet is that?`, ft, { hint: '12 inches = 1 foot' });
        }
        return numPad(`A drawbridge chain is ${ft} feet long. How many inches is that?`, ft * 12, { hint: '1 foot = 12 inches' });
      }),
      level('g4.pack-measure.yd-ft', 'Yards and Feet', 'number-pad', 1, (rng) => {
        const yd = randInt(rng, 2, 15);
        if (rng() < 0.4) {
          return numPad(`A moat is ${yd * 3} feet wide. How many yards is that?`, yd, { hint: '3 feet = 1 yard' });
        }
        return numPad(`A jousting lane is ${yd} yards long. How many feet is that?`, yd * 3, { hint: '1 yard = 3 feet' });
      }),
      level('g4.pack-measure.best-unit', 'Pick the Right Unit', 'multiple-choice', 1, (rng) => {
        const [thing, answer, wrongs] = pick(rng, UNIT_CLUES);
        return labelMc(`What is the best unit to measure ${thing}?`, answer, wrongs, rng, {
          hint: 'Match the unit to the size of the thing.',
        });
      }),
      level('g4.pack-measure.in-feet-mixed', 'Feet + Inches Together', 'number-pad', 2, (rng) => {
        const ft = randInt(rng, 1, 9);
        const inch = randInt(rng, 1, 11);
        return numPad(`A knight's lance is ${ft} ft ${inch} in long. How many inches is that?`, ft * 12 + inch, {
          hint: `${ft} feet = ${ft * 12} inches, then add ${inch}.`,
        });
      }),
      level('g4.pack-measure.compare-measures', 'Measure Match-Up', 'multiple-choice', 2, (rng) => {
        const set = pick(rng, MEASURE_COMPARE);
        return labelMc(`Which is the greatest?`, set.winner, set.labels.filter((label) => label !== set.winner), rng, {
          hint: 'Convert them all to the same unit first.',
        });
      }),
      level('g4.pack-measure.mass-word', 'Cauldron Math', 'number-pad', 2, (rng) => {
        const kg = randInt(rng, 1, 6);
        const g = randInt(rng, 100, 900);
        const kg2 = randInt(rng, 1, 4);
        const g2 = randInt(rng, 100, 900);
        const subtract = rng() < 0.4;
        const total1 = kg * 1000 + g;
        const total2 = kg2 * 1000 + g2;
        if (subtract && total1 > total2) {
          return numPad(`A cauldron holds ${kg} kg ${g} g of stew. ${kg2} kg ${g2} g is served. How many grams are left?`, total1 - total2, {
            hint: `Convert both to grams: ${fmt(total1)} − ${fmt(total2)}.`,
          });
        }
        return numPad(`A recipe uses ${kg} kg ${g} g of flour and ${kg2} kg ${g2} g of sugar. How many grams in all?`, total1 + total2, {
          hint: `Convert both to grams: ${fmt(total1)} + ${fmt(total2)}.`,
        });
      }),
      level('g4.pack-measure.pour', 'Potion Pouring', 'number-pad', 1, (rng) => {
        const [liters, cup] = pick(rng, [
          [2, 500],
          [3, 500],
          [1, 250],
          [2, 250],
          [3, 250],
          [4, 500],
          [2, 200],
          [5, 500],
          [1, 200],
          [6, 300],
        ] as const);
        return numPad(`A ${liters} L cauldron fills ${cup} mL cups. How many full cups?`, (liters * 1000) / cup, {
          hint: `${liters} L = ${fmt(liters * 1000)} mL. Divide by ${cup}.`,
        });
      }),
      level('g4.pack-measure.poly-perimeter', 'Polygon Patrol', 'number-pad', 1, (rng) => {
        const count = randInt(rng, 4, 6);
        const sides = Array.from({ length: count }, () => randInt(rng, 3, 15));
        const total = sides.reduce((a, b) => a + b, 0);
        return numPad(`A dragon pen has ${count} sides: ${sides.join(', ')} meters. What is its perimeter?`, total, {
          hint: 'Perimeter = add all the sides.',
        });
      }),
      level('g4.pack-measure.two-rooms', 'Two-Room Castle', 'number-pad', 3, (rng) => {
        const l1 = randInt(rng, 3, 9);
        const w1 = randInt(rng, 3, 9);
        const l2 = randInt(rng, 3, 9);
        const w2 = randInt(rng, 3, 9);
        return numPad(`A castle has two rooms: ${l1} m × ${w1} m and ${l2} m × ${w2} m. What is the total area in square meters?`, l1 * w1 + l2 * w2, {
          hint: `Find each area: ${l1 * w1} + ${l2 * w2}.`,
        });
      }),
      level('g4.pack-measure.convert-match', 'Conversion Match', 'match-pairs', 2, (rng) => {
        const pairs = shuffle(rng, CONVERT_MATCH_BANK).slice(0, 4);
        return { ...matchPairs('Match each measurement to its equal value.', shuffle(rng, pairs)), hint: 'Know your facts: 12 in = 1 ft, 100 cm = 1 m, 1,000 g = 1 kg, 1,000 mL = 1 L.' };
      }),
      level('g4.pack-measure.square-chain', 'Square Squeeze', 'number-pad', 3, (rng) => {
        const s = randInt(rng, 3, 12);
        if (rng() < 0.5) {
          return numPad(`A square training yard has a perimeter of ${4 * s} m. What is its area in square meters?`, s * s, {
            hint: `Side = ${4 * s} ÷ 4 = ${s}. Area = side × side.`,
          });
        }
        return numPad(`A square rug has an area of ${s * s} square meters. What is its perimeter?`, 4 * s, {
          hint: `Side × side = ${s * s}, so the side is ${s}. Perimeter = 4 × ${s}.`,
        });
      }),
    ],
  };
}

const PLOT_FRACS = ['1/8', '1/4', '3/8', '1/2', '5/8', '3/4', '7/8'] as const;

function makeLinePlot(rng: () => number): { label: string; count: number }[] {
  const labels = shuffle(rng, [...PLOT_FRACS]).slice(0, 4);
  const order = PLOT_FRACS.map((f, i) => ({ f, i }));
  labels.sort((a, b) => order.find((o) => o.f === a)!.i - order.find((o) => o.f === b)!.i);
  return labels.map((label) => ({ label, count: randInt(rng, 1, 7) }));
}

function plotVisual(cats: { label: string; count: number }[]) {
  return board(cats.map((cat) => `${cat.label} in  ${'🟦'.repeat(cat.count)}`));
}

function dragonCensus() {
  return {
    id: 'g4.pack-data',
    title: 'Dragon Census',
    emoji: '📊',
    domain: 'data' as const,
    levels: [
      level('g4.pack-data.plot-count', 'Plot the Count', 'number-pad', 1, (rng) => {
        const cats = makeLinePlot(rng);
        const total = cats.reduce((a, c) => a + c.count, 0);
        return numPad(`The line plot shows ribbon lengths. How many ribbons were measured in all?`, total, {
          visual: plotVisual(cats),
          hint: 'Count every square on the plot.',
        });
      }),
      level('g4.pack-data.plot-most', 'Most Common Length', 'multiple-choice', 1, (rng) => {
        let cats = makeLinePlot(rng);
        while (cats.filter((c) => c.count === Math.max(...cats.map((x) => x.count))).length !== 1) cats = makeLinePlot(rng);
        const winner = cats.reduce((best, c) => (c.count > best.count ? c : best));
        return labelMc(`Which ribbon length was measured the most times?`, `${winner.label} in`, cats.filter((c) => c !== winner).map((c) => `${c.label} in`), rng, {
          visual: plotVisual(cats),
          hint: 'The tallest column of squares wins.',
        });
      }),
      level('g4.pack-data.table-total', 'Census Totals', 'number-pad', 1, (rng) => {
        const kinds = shuffle(rng, ['Knights', 'Archers', 'Wizards', 'Bards', 'Scouts', 'Healers']).slice(0, 3);
        const counts = kinds.map(() => randInt(rng, 8, 60));
        const rows = kinds.map((k, i) => `${k}: ${counts[i]}`).join(',  ');
        return numPad(`Kingdom census: ${rows}. How many people are counted in all?`, counts.reduce((a, b) => a + b, 0), {
          hint: 'Add all three groups together.',
        });
      }),
      level('g4.pack-data.table-pick', 'Top of the Table', 'multiple-choice', 1, (rng) => {
        const names = shuffle(rng, ['Storm', 'Ember', 'Frost', 'Ash', 'Blaze', 'Slate']).slice(0, 4);
        const values = new Set<number>();
        while (values.size < 4) values.add(randInt(rng, 20, 95));
        const rows = names.map((n, i) => ({ n, v: [...values][i] }));
        const askMost = rng() < 0.5;
        const winner = rows.reduce((best, r) => (askMost ? (r.v > best.v ? r : best) : r.v < best.v ? r : best));
        return labelMc(`Dragon weights in stones: ${rows.map((r) => `${r.n} ${r.v}`).join(',  ')}. Which dragon is ${askMost ? 'heaviest' : 'lightest'}?`, winner.n, rows.filter((r) => r !== winner).map((r) => r.n), rng, {
          hint: `Scan the numbers for the ${askMost ? 'biggest' : 'smallest'} one.`,
        });
      }),
      level('g4.pack-data.plot-diff', 'Plot Gap', 'number-pad', 2, (rng) => {
        const cats = makeLinePlot(rng);
        const counts = cats.map((c) => c.count);
        const diff = Math.max(...counts) - Math.min(...counts);
        return numPad(`The line plot shows ribbon lengths. How many more ribbons were measured at the most common length than the least?`, diff, {
          visual: plotVisual(cats),
          hint: 'Find the tallest and shortest columns, then subtract.',
        });
      }),
      level('g4.pack-data.plot-over', 'Over the Mark', 'number-pad', 2, (rng) => {
        let cats = makeLinePlot(rng);
        const threshold = pick(rng, ['1/4', '3/8', '1/2'] as const);
        const tIndex = PLOT_FRACS.indexOf(threshold);
        let total = cats.filter((c) => PLOT_FRACS.indexOf(c.label as (typeof PLOT_FRACS)[number]) > tIndex).reduce((a, c) => a + c.count, 0);
        while (total === 0) {
          cats = makeLinePlot(rng);
          total = cats.filter((c) => PLOT_FRACS.indexOf(c.label as (typeof PLOT_FRACS)[number]) > tIndex).reduce((a, c) => a + c.count, 0);
        }
        return numPad(`How many ribbons measured MORE than ${threshold} inch?`, total, {
          visual: plotVisual(cats),
          hint: `Only count the columns longer than ${threshold} in.`,
        });
      }),
      level('g4.pack-data.pictograph-read', 'Ticket Pictograph', 'number-pad', 1, (rng) => {
        const scale = pick(rng, [2, 5, 10]);
        const days = shuffle(rng, ['Mon', 'Wed', 'Fri', 'Sat', 'Sun']).slice(0, 3);
        const counts = days.map(() => randInt(rng, 2, 7));
        const askIndex = randInt(rng, 0, days.length - 1);
        const lines = days.map((d, i) => `${d}  ${'🟦'.repeat(counts[i])}`);
        return numPad(`Each 🟦 = ${scale} tickets sold. How many tickets were sold on ${days[askIndex]}?`, counts[askIndex] * scale, {
          visual: board(lines),
          hint: `Count the squares on ${days[askIndex]}, then multiply by ${scale}.`,
        });
      }),
      level('g4.pack-data.pictograph-diff', 'Pictograph Gap', 'number-pad', 2, (rng) => {
        const scale = pick(rng, [2, 5, 10]);
        const days = shuffle(rng, ['Mon', 'Wed', 'Fri', 'Sat']).slice(0, 3);
        let counts = days.map(() => randInt(rng, 2, 7));
        const [a, b] = [randInt(rng, 0, 2), randInt(rng, 0, 2)];
        const [i, j] = a === b ? [a, (a + 1) % 3] : [a, b];
        while (counts[i] === counts[j]) counts = days.map(() => randInt(rng, 2, 7));
        const lines = days.map((d, k) => `${d}  ${'🟩'.repeat(counts[k])}`);
        return numPad(`Each 🟩 = ${scale} gold pieces found. How many more pieces were found on ${days[i]} than ${days[j]}?`, Math.abs(counts[i] - counts[j]) * scale, {
          visual: board(lines),
          hint: `Compare the rows: (${Math.max(counts[i], counts[j])} − ${Math.min(counts[i], counts[j])}) × ${scale}.`,
        });
      }),
      level('g4.pack-data.plot-match', 'Plot Match-Up', 'match-pairs', 2, (rng) => {
        let cats = makeLinePlot(rng);
        while (new Set(cats.map((c) => c.count)).size !== cats.length) cats = makeLinePlot(rng);
        const pairs = cats.map((c) => ({ left: `${c.label} in`, right: `${c.count}` }));
        return { ...matchPairs('Match each ribbon length to how many times it was measured.', shuffle(rng, pairs)), visual: plotVisual(cats) };
      }),
      level('g4.pack-data.plot-total', 'Ribbon Total', 'multiple-choice', 3, (rng) => {
        const cats = makeLinePlot(rng);
        const cat = pick(rng, cats);
        const [n, d] = cat.label.split('/').map(Number);
        const answer = `${cat.count * n}/${d}`;
        const wrongs = [`${cat.count * n + n}/${d}`, `${cat.count * n - n}/${d}`, `${cat.count * n}/${d * 2}`, `${cat.count}/${d}`];
        return labelMc(`All the ribbons that measure ${cat.label} in are laid end to end. What is their total length?`, answer, wrongs.filter((w) => w !== answer), rng, {
          visual: plotVisual(cats),
          hint: `${cat.count} ribbons of ${cat.label} in each: ${cat.count} × ${cat.label}.`,
        });
      }),
    ],
  };
}

const COIN_SETS: { left: string; cents: number }[] = [
  { left: '2 quarters + 1 dime', cents: 60 },
  { left: '3 quarters + 1 nickel', cents: 80 },
  { left: '1 quarter + 4 dimes', cents: 65 },
  { left: '1 quarter + 2 dimes + 2 nickels', cents: 55 },
  { left: '3 dimes + 4 nickels', cents: 50 },
  { left: '4 quarters + 3 pennies', cents: 103 },
  { left: '2 quarters + 5 dimes', cents: 100 },
  { left: '1 quarter + 1 dime + 4 pennies', cents: 39 },
  { left: '5 dimes + 3 nickels', cents: 65 },
];

const MONEY_COMPARE: { a: string; b: string; va: number; vb: number }[] = [
  { a: '4 dimes', b: '3 quarters', va: 40, vb: 75 },
  { a: '2 quarters', b: '6 dimes', va: 50, vb: 60 },
  { a: '5 nickels', b: '1 quarter + 2 dimes', va: 25, vb: 45 },
  { a: '3 quarters', b: '8 dimes', va: 75, vb: 80 },
  { a: '9 dimes', b: '3 quarters + 2 nickels', va: 90, vb: 85 },
];

const MONEY_FACTS: [string, boolean][] = [
  ['4 quarters make $1.00.', true],
  ['7 dimes make 70¢.', true],
  ['3 quarters make 65¢.', false],
  ['$2.50 is more than 250¢.', false],
  ['2 quarters + 4 dimes = 90¢.', true],
  ['10 nickels = $0.50.', true],
  ['150¢ is $15.00.', false],
  ['A $5 bill is worth 20 quarters.', true],
];

function royalMint() {
  return {
    id: 'g4.pack-money',
    title: 'Royal Mint',
    emoji: '💰',
    domain: 'money' as const,
    levels: [
      level('g4.pack-money.coins-value', 'Count the Coins', 'multiple-choice', 1, (rng) => {
        const q = randInt(rng, 0, 3);
        const d = randInt(rng, 0, 4);
        const n = randInt(rng, 0, 2);
        const p = randInt(rng, 0, 4);
        const parts = [
          q > 0 ? `${q} quarter${q > 1 ? 's' : ''}` : '',
          d > 0 ? `${d} dime${d > 1 ? 's' : ''}` : '',
          n > 0 ? `${n} nickel${n > 1 ? 's' : ''}` : '',
          p > 0 ? `${p} penn${p > 1 ? 'ies' : 'y'}` : '',
        ].filter(Boolean);
        if (parts.length === 0) parts.push('1 quarter');
        const cents = q * 25 + d * 10 + n * 5 + p || 25;
        const wrongs = distractors(cents, [cents + 5, cents - 5, cents + 10, cents - 10, cents + 15], 3);
        return labelMc(`A purse holds ${parts.join(', ')}. How many cents is that?`, `${cents}¢`, wrongs.map((w) => `${w}¢`), rng, {
          hint: 'Quarters are 25¢, dimes 10¢, nickels 5¢, pennies 1¢.',
        });
      }),
      level('g4.pack-money.bills-coins', 'Bills and Coins', 'multiple-choice', 1, (rng) => {
        const tens = randInt(rng, 1, 3);
        const fives = randInt(rng, 0, 2);
        const ones = randInt(rng, 0, 4);
        const total = tens * 10 + fives * 5 + ones;
        const parts = [`${tens} $10 bill${tens > 1 ? 's' : ''}`];
        if (fives > 0) parts.push(`${fives} $5 bill${fives > 1 ? 's' : ''}`);
        if (ones > 0) parts.push(`${ones} $1 coin${ones > 1 ? 's' : ''}`);
        const wrongs = distractors(total, [total + 5, total - 5, total + 10, total - 10, total + 1], 3);
        return labelMc(`${name(rng)} has ${parts.join(', ')}. How much money is that?`, `$${total}`, wrongs.map((w) => `$${w}`), rng, {
          hint: `Tens first: ${tens} × $10 = $${tens * 10}, then add the rest.`,
        });
      }),
      level('g4.pack-money.add-money', 'Purse Plus', 'number-pad', 1, (rng) => {
        const a = randInt(rng, 5, 80);
        const b = randInt(rng, 5, 80);
        return numPad(`${name(rng)} earns $${a} at the market and $${b} at the fair. How many dollars in all?`, a + b, {
          hint: 'Just add the dollar amounts.',
        });
      }),
      level('g4.pack-money.money-compare', 'Which Purse Wins?', 'multiple-choice', 1, (rng) => {
        const set = pick(rng, MONEY_COMPARE);
        const askMore = rng() < 0.6;
        const winner = askMore ? (set.va > set.vb ? set.a : set.b) : set.va < set.vb ? set.a : set.b;
        return labelMc(`Which is ${askMore ? 'more' : 'less'} money: ${set.a} or ${set.b}?`, winner, [askMore ? (set.va > set.vb ? set.b : set.a) : set.va < set.vb ? set.b : set.a, 'they are equal'], rng, {
          hint: `Count each purse in cents: ${set.va}¢ vs ${set.vb}¢.`,
        });
      }),
      level('g4.pack-money.make-change', 'Change Back', 'number-pad', 2, (rng) => {
        const paid = pick(rng, [5, 10, 20]);
        const priceCents = randInt(rng, 110, paid * 100 - 105);
        return numPad(`${name(rng)} pays with a $${paid} bill for a $${dec(priceCents)} toy. How many cents of change?`, paid * 100 - priceCents, {
          hint: `$${paid} = ${paid * 100}¢. Subtract ${priceCents}¢.`,
        });
      }),
      level('g4.pack-money.two-step', 'Market Math', 'number-pad', 2, (rng) => {
        const n = randInt(rng, 2, 5);
        const price = randInt(rng, 6, 15);
        const paid = pick(rng, [50, 100]);
        if (n * price >= paid) {
          return numPad(`${name(rng)} buys ${n} shields at $${price} each. How much do they cost in all?`, n * price, {
            hint: `${n} × $${price}.`,
          });
        }
        return numPad(`${name(rng)} buys ${n} shields at $${price} each and pays with $${paid}. How much change?`, paid - n * price, {
          hint: `First ${n} × $${price} = $${n * price}, then subtract from $${paid}.`,
        });
      }),
      level('g4.pack-money.money-order', 'Order the Purses', 'order-sequence', 2, (rng) => {
        const cents = new Set<number>();
        while (cents.size < 4) cents.add(randInt(rng, 105, 9999));
        return orderSeq('Order the amounts from least to greatest.', [...cents].sort((a, b) => a - b).map((c) => `$${dec(c)}`));
      }),
      level('g4.pack-money.coins-match', 'Coin Combo Match', 'match-pairs', 2, (rng) => {
        const sets = shuffle(rng, COIN_SETS.filter((s, i, arr) => arr.findIndex((x) => x.cents === s.cents) === i)).slice(0, 4);
        const pairs = sets.map((s) => ({ left: s.left, right: `${s.cents}¢` }));
        return { ...matchPairs('Match each coin set to its value.', shuffle(rng, pairs)), hint: 'Quarter = 25¢, dime = 10¢, nickel = 5¢, penny = 1¢.' };
      }),
      level('g4.pack-money.money-true', 'Money Truths', 'true-false', 2, (rng) => {
        const [statement, truth] = pick(rng, MONEY_FACTS);
        return trueFalse(`True or false? ${statement}`, truth, {
          hint: 'Convert both sides to cents to compare.',
        });
      }),
      level('g4.pack-money.unit-price', 'Unit Price Puzzles', 'number-pad', 3, (rng) => {
        const unit = randInt(rng, 3, 12);
        const k = randInt(rng, 2, 6);
        const m = randInt(rng, 2, 6);
        return numPad(`${k} spell books cost $${k * unit}. How much do ${m} books cost?`, unit * m, {
          hint: `One book costs $${k * unit} ÷ ${k} = $${unit}.`,
        });
      }),
    ],
  };
}

const DURATION_MATCH_BANK: { left: string; right: string }[] = [
  { left: '2 h 15 min', right: '135 min' },
  { left: '1 h 40 min', right: '100 min' },
  { left: '3 h 5 min', right: '185 min' },
  { left: '90 min', right: '1 h 30 min' },
  { left: '2 h 30 min', right: '150 min' },
  { left: '4 h 10 min', right: '250 min' },
  { left: '75 min', right: '1 h 15 min' },
];

const DURATION_LIST: { label: string; minutes: number }[] = [
  { label: '2 h', minutes: 120 },
  { label: '150 min', minutes: 150 },
  { label: '2 h 45 min', minutes: 165 },
  { label: '95 min', minutes: 95 },
  { label: '1 h 20 min', minutes: 80 },
  { label: '2 h 5 min', minutes: 125 },
  { label: '105 min', minutes: 105 },
  { label: '3 h', minutes: 180 },
];

const CLOCK_WORDS: [string, string][] = [
  ['quarter past 7', '7:15'],
  ['half past 9', '9:30'],
  ['quarter to 5', '4:45'],
  ['quarter past 12', '12:15'],
  ['half past 3', '3:30'],
  ['quarter to 11', '10:45'],
];

function clockworkTower() {
  return {
    id: 'g4.pack-time',
    title: 'Clockwork Tower',
    emoji: '🕰️',
    domain: 'time' as const,
    levels: [
      level('g4.pack-time.elapsed-same', 'Same-Hour Sprint', 'number-pad', 1, (rng) => {
        const h = randInt(rng, 1, 11);
        const m1 = randInt(rng, 0, 40);
        const m2 = randInt(rng, m1 + 5, 59);
        return numPad(`A quest runs from ${clock(h, m1)} to ${clock(h, m2)}. How many minutes?`, m2 - m1, {
          hint: `Both times are in the ${h} o'clock hour — subtract the minutes.`,
        });
      }),
      level('g4.pack-time.end-time', 'When Does It End?', 'multiple-choice', 1, (rng) => {
        const h = randInt(rng, 1, 10);
        const m = randInt(rng, 0, 30);
        const dur = pick(rng, [15, 20, 30, 40, 45]);
        const end = h * 60 + m + dur;
        const endH = Math.floor(end / 60);
        const endM = end % 60;
        const answer = clock(endH, endM);
        const wrongs = [clock(endH, Math.min(endM + 15, 59)), clock(Math.min(endH + 1, 12), endM), clock(endH, Math.max(endM - 15, 0))];
        return labelMc(`A spell lesson starts at ${clock(h, m)} and lasts ${dur} minutes. When does it end?`, answer, [...new Set(wrongs.filter((w) => w !== answer))], rng, {
          hint: `Add ${dur} to the minutes — it rolls into the next hour after 60.`,
        });
      }),
      level('g4.pack-time.weeks-days', 'Weeks to Days', 'number-pad', 1, (rng) => {
        const w = randInt(rng, 2, 9);
        if (rng() < 0.4) {
          return numPad(`A dragon's nap lasts ${w * 7} days. How many weeks is that?`, w, { hint: '7 days = 1 week' });
        }
        return numPad(`The royal festival lasts ${w} weeks. How many days is that?`, w * 7, { hint: '1 week = 7 days' });
      }),
      level('g4.pack-time.quarter-half', 'Quarter & Half Hours', 'multiple-choice', 1, (rng) => {
        const [words, answer] = pick(rng, CLOCK_WORDS);
        const wrongs = new Set<string>();
        while (wrongs.size < 3) {
          const w = clock(randInt(rng, 1, 12), pick(rng, [0, 15, 30, 45]));
          if (w !== answer) wrongs.add(w);
        }
        return labelMc(`The town crier says "${words}". What time is it?`, answer, [...wrongs], rng, {
          hint: 'Quarter past = :15, half past = :30, quarter to = :45 of the hour BEFORE.',
        });
      }),
      level('g4.pack-time.elapsed-hours', 'Across the Hours', 'number-pad', 2, (rng) => {
        const h1 = randInt(rng, 1, 8);
        const m1 = randInt(rng, 0, 45);
        const h2 = randInt(rng, h1 + 1, 11);
        const m2 = randInt(rng, 0, 59);
        const total = (h2 - h1) * 60 + (m2 - m1);
        return numPad(`A carriage ride runs from ${clock(h1, m1)} to ${clock(h2, m2)}. How many minutes is that?`, total, {
          hint: `Count to the next hour first, then add the hours and the leftover minutes.`,
        });
      }),
      level('g4.pack-time.start-time', 'When Did It Start?', 'multiple-choice', 2, (rng) => {
        const h = randInt(rng, 2, 11);
        const m = randInt(rng, 30, 59);
        const dur = pick(rng, [15, 20, 25, 30]);
        const start = h * 60 + m - dur;
        const answer = clock(Math.floor(start / 60), start % 60);
        const wrongs = [clock(Math.floor(start / 60), (start % 60) + 15 < 60 ? (start % 60) + 15 : (start % 60) - 15), clock(Math.floor((start + 30) / 60), (start + 30) % 60), clock(h, m)];
        return labelMc(`The feast ended at ${clock(h, m)} after lasting ${dur} minutes. When did it start?`, answer, [...new Set(wrongs.filter((w) => w !== answer))], rng, {
          hint: `Count backward ${dur} minutes from ${clock(h, m)}.`,
        });
      }),
      level('g4.pack-time.duration-match', 'Duration Match', 'match-pairs', 2, (rng) => {
        const pairs = shuffle(rng, DURATION_MATCH_BANK).slice(0, 4);
        return { ...matchPairs('Match each duration to its equal value.', shuffle(rng, pairs)), hint: 'Every hour hides 60 minutes.' };
      }),
      level('g4.pack-time.cross-hour', 'Over the Top of the Hour', 'multiple-choice', 3, (rng) => {
        const m = randInt(rng, 35, 55);
        const dur = randInt(rng, 60 - m + 5, 60 - m + 30);
        const end = 11 * 60 + m + dur;
        const answer = clock(Math.floor(end / 60), end % 60);
        const wrongs = [clock(11, (m + dur) % 60), clock(Math.floor(end / 60) + 1, end % 60), clock(Math.floor(end / 60), (end % 60) + 10 < 60 ? (end % 60) + 10 : (end % 60) - 10)];
        return labelMc(`The clock shows 11:${m < 10 ? `0${m}` : m}. In ${dur} minutes it will be…`, answer, [...new Set(wrongs.filter((w) => w !== answer))], rng, {
          hint: `Roll past 12 o'clock — don't stay stuck at 11:${m + dur}.`,
        });
      }),
      level('g4.pack-time.longest', 'Longest Duration', 'multiple-choice', 2, (rng) => {
        let options = shuffle(rng, DURATION_LIST).slice(0, 4);
        while (new Set(options.map((o) => o.minutes)).size !== 4) options = shuffle(rng, DURATION_LIST).slice(0, 4);
        const askLongest = rng() < 0.6;
        const winner = options.reduce((best, o) => (askLongest ? (o.minutes > best.minutes ? o : best) : o.minutes < best.minutes ? o : best));
        return labelMc(`Which is the ${askLongest ? 'longest' : 'shortest'}?`, winner.label, options.filter((o) => o !== winner).map((o) => o.label), rng, {
          hint: 'Convert everything to minutes first.',
        });
      }),
      level('g4.pack-time.schedule-total', 'Schedule Sum', 'number-pad', 3, (rng) => {
        const d1 = pick(rng, [45, 60, 75, 90]);
        const d2 = pick(rng, [30, 45, 60, 75]);
        const day1 = pick(rng, ['Monday', 'Tuesday', 'Thursday']);
        const day2 = pick(rng, ['Wednesday', 'Friday']);
        return numPad(`Dragon training runs ${d1} minutes on ${day1} and ${d2} minutes on ${day2}. How many minutes per week?`, d1 + d2, {
          hint: 'Add the two session lengths.',
        });
      }),
    ],
  };
}

function questTales() {
  return {
    id: 'g4.pack-word',
    title: 'Quest Tales',
    emoji: '📜',
    domain: 'word-problems' as const,
    levels: [
      level('g4.pack-word.two-step', 'Earn and Spend', 'number-pad', 1, (rng) => {
        const hero = name(rng);
        const a = randInt(rng, 200, 900);
        const b = randInt(rng, 100, 500);
        const c = randInt(rng, 50, a + b - 50);
        return numPad(`${hero} has ${a} coins, earns ${b} more, then spends ${c}. How many coins are left?`, a + b - c, {
          hint: `Add first: ${a} + ${b}, then subtract ${c}.`,
        });
      }),
      level('g4.pack-word.mult-sub', 'Boxes and Bites', 'number-pad', 2, (rng) => {
        const n = randInt(rng, 3, 9);
        const m = randInt(rng, 25, 90);
        const eaten = randInt(rng, 10, n * m - 50);
        return numPad(`The kitchen bakes ${n} trays of ${m} tarts. The dragons eat ${eaten}. How many tarts are left?`, n * m - eaten, {
          hint: `First ${n} × ${m} = ${n * m}, then subtract.`,
        });
      }),
      level('g4.pack-word.mult-add', 'Crates Plus Extras', 'number-pad', 2, (rng) => {
        const n = randInt(rng, 3, 9);
        const m = randInt(rng, 24, 85);
        const extra = randInt(rng, 10, 99);
        return numPad(`A warehouse stores ${n} crates of ${m} potions, plus ${extra} loose potions. How many potions in all?`, n * m + extra, {
          hint: `First ${n} × ${m} = ${n * m}, then add ${extra}.`,
        });
      }),
      level('g4.pack-word.div-then', 'Share and Share Alike', 'number-pad', 2, (rng) => {
        const d = randInt(rng, 3, 8);
        const q = randInt(rng, 60, 300);
        const gift = randInt(rng, 5, q - 10);
        return numPad(`${fmt(q * d)} gems are split equally among ${d} treasure chests. Each chest then gives ${gift} gems to the wizard. How many gems does each chest keep?`, q - gift, {
          hint: `First ${fmt(q * d)} ÷ ${d} = ${q}, then −${gift}.`,
        });
      }),
      level('g4.pack-word.compare-who', 'Who Collected More?', 'number-pad', 2, (rng) => {
        const [a, b] = shuffle(rng, NAMES_FOR_WORDS(rng)).slice(0, 2);
        const p1 = randInt(rng, 4, 9) * randInt(rng, 25, 60);
        let p2 = randInt(rng, 4, 9) * randInt(rng, 25, 60);
        while (p1 === p2) p2 = randInt(rng, 4, 9) * randInt(rng, 25, 60);
        return numPad(`${a} collects ${p1} acorns and ${b} collects ${p2}. How many more does the winner have?`, Math.abs(p1 - p2), {
          hint: 'Subtract the smaller pile from the bigger one.',
        });
      }),
      level('g4.pack-word.unit-rate', 'Pack Pricing', 'number-pad', 2, (rng) => {
        const unit = randInt(rng, 4, 15);
        const k = randInt(rng, 3, 6);
        const m = randInt(rng, 2, 9);
        return numPad(`${k} snack packs cost $${k * unit}. At that rate, how much do ${m} packs cost?`, unit * m, {
          hint: `Find one pack first: $${k * unit} ÷ ${k} = $${unit}.`,
        });
      }),
      level('g4.pack-word.fence', 'Fence the Field', 'number-pad', 2, (rng) => {
        const l = randInt(rng, 8, 25);
        const w = randInt(rng, 4, l - 1);
        return numPad(`A rectangular sheep pen is ${l} m long and ${w} m wide. How much fencing goes around it?`, 2 * (l + w), {
          hint: `Perimeter = 2 × (length + width).`,
        });
      }),
      level('g4.pack-word.frac-story', 'Pie Story', 'multiple-choice', 2, (rng) => {
        const d = pick(rng, [6, 8, 10, 12]);
        const a = randInt(rng, 1, Math.floor(d / 2));
        const b = randInt(rng, 1, d - a - 1);
        const eaten = rng() < 0.5;
        if (eaten) {
          const answer = `${a + b}/${d}`;
          const wrongs = [`${a + b}/${2 * d}`, a !== b ? `${Math.abs(a - b)}/${d}` : `${a + b - 1}/${d}`, `${a + b + 1}/${d}`];
          return labelMc(`${name(rng)} eats ${a}/${d} of a pie, then ${b}/${d} more. How much pie is eaten?`, answer, wrongs, rng, {
            visual: { text: `${a}/${d} + ${b}/${d}` },
            hint: 'Same denominator — add the tops only.',
          });
        }
        const answer = `${d - a - b}/${d}`;
        return labelMc(`${name(rng)}'s pie has ${a}/${d} eaten at lunch and ${b}/${d} at dinner. How much is LEFT?`, answer, [`${a + b}/${d}`, `${d - a}/${d}`, `${d - b}/${d}`], rng, {
          hint: `A whole pie is ${d}/${d}. Subtract what was eaten.`,
        });
      }),
      level('g4.pack-word.elapsed-story', 'Journey Time', 'number-pad', 2, (rng) => {
        const h = randInt(rng, 6, 10);
        const m1 = randInt(rng, 5, 55);
        const dur = randInt(rng, 40, 140);
        const end = h * 60 + m1 + dur;
        return numPad(`A knight rides from ${clock(h, m1)} until ${clock(Math.floor(end / 60), end % 60)}. How many minutes is the ride?`, dur, {
          hint: 'Count the minutes forward to the arrival time.',
        });
      }),
      level('g4.pack-word.remainder-story', 'Boxes and Leftovers', 'number-pad', 3, (rng) => {
        const size = randInt(rng, 4, 9);
        const q = randInt(rng, 12, 60);
        const r = randInt(rng, 1, size - 1);
        const total = q * size + r;
        const leftover = rng() < 0.5;
        return numPad(
          leftover
            ? `A bakery packs ${total} muffins into boxes of ${size}. How many muffins are left over?`
            : `A bakery packs ${total} muffins into boxes of ${size}. How many FULL boxes are there?`,
          leftover ? r : q,
          { hint: `${total} ÷ ${size} = ${q} R ${r}. What does the question ask for?` },
        );
      }),
      level('g4.pack-word.money-two-step', 'Shopping Spree', 'number-pad', 3, (rng) => {
        const hero = name(rng);
        const n = randInt(rng, 2, 5);
        const price = randInt(rng, 12, 29);
        const paid = pick(rng, [100, 150, 200]);
        if (n * price >= paid) {
          return numPad(`${hero} buys ${n} games at $${price} each with $${paid}. Is $${paid} enough? Type the total cost.`, n * price, {
            hint: `${n} × $${price} = ?`,
          });
        }
        return numPad(`${hero} has $${paid} and buys ${n} games at $${price} each. How much money is left?`, paid - n * price, {
          hint: `First ${n} × $${price} = $${n * price}, then subtract.`,
        });
      }),
    ],
  };
}

const NAMES_BANK = ['Mia', 'Leo', 'Ava', 'Kai', 'Zoe', 'Omar', 'Ivy', 'Raj'] as const;
function NAMES_FOR_WORDS(rng: () => number): string[] {
  return shuffle(rng, [...NAMES_BANK]);
}

const byDifficulty = (unit: UnitDef): UnitDef => ({ ...unit, levels: [...unit.levels].sort((a, b) => a.difficulty - b.difficulty) });

export const g4PackWorld: UnitDef[] = [shapeCitadel(), royalWorkshop(), dragonCensus(), royalMint(), clockworkTower(), questTales()].map(byDifficulty);
