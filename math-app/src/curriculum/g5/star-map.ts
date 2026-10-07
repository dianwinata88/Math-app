import { pick, randInt, shuffle } from '../../core/rng';
import type { UnitDef } from '../../core/types';
import { level, matchPairs, mc, trueFalse } from '../helpers';

const hierarchyFacts = [
  ['All squares are rectangles.', true],
  ['All rectangles are squares.', false],
  ['All squares are rhombuses.', true],
  ['All rhombuses are parallelograms.', true],
  ['All parallelograms are rectangles.', false],
  ['Every rectangle is a parallelogram.', true],
  ['Some rhombuses are squares.', true],
  ['A square is a regular quadrilateral.', true],
  ['All equilateral triangles are isosceles.', true],
  ['All isosceles triangles are equilateral.', false],
  ['A right triangle can also be isosceles.', true],
  ['A triangle can have two right angles.', false],
  ['An obtuse triangle can be equilateral.', false],
  ['A scalene triangle has no equal sides.', true],
  ['A rhombus always has four right angles.', false],
  ['All quadrilaterals have four sides.', true],
  ['A kite always has two pairs of parallel sides.', false],
] as const;

const hullFacts = [
  { prompt: '4 equal sides and 4 right angles', answer: 'Square', options: ['Square', 'Rectangle', 'Rhombus', 'Parallelogram'] },
  { prompt: '4 equal sides and no right angles', answer: 'Rhombus', options: ['Rhombus', 'Square', 'Rectangle', 'Parallelogram'] },
  { prompt: '2 pairs of parallel sides, 4 right angles, and not all sides equal', answer: 'Rectangle', options: ['Rectangle', 'Square', 'Rhombus', 'Parallelogram'] },
  { prompt: '2 pairs of parallel sides, no right angles, and adjacent sides unequal', answer: 'Parallelogram', options: ['Parallelogram', 'Rectangle', 'Square', 'Rhombus'] },
  { prompt: '4 sides, opposite sides parallel and equal, adjacent sides unequal, and no right angles', answer: 'Parallelogram', options: ['Parallelogram', 'Rectangle', 'Square', 'Rhombus'] },
  { prompt: '3 equal sides', answer: 'Equilateral triangle', options: ['Equilateral triangle', 'Isosceles triangle', 'Scalene triangle', 'Right triangle'] },
  { prompt: 'One angle greater than 90°', answer: 'Obtuse triangle', options: ['Obtuse triangle', 'Acute triangle', 'Right triangle', 'Equilateral triangle'] },
  { prompt: 'One 90° angle and two equal sides', answer: 'Right isosceles triangle', options: ['Right isosceles triangle', 'Right scalene triangle', 'Equilateral triangle', 'Obtuse triangle'] },
] as const;

const triangleFacts = [
  { left: 'Angles 60°, 60°, 60°', right: 'Equilateral' },
  { left: 'Angles 90°, 45°, 45°', right: 'Right isosceles' },
  { left: 'Angles 120°, 30°, 30°', right: 'Obtuse isosceles' },
  { left: 'Angles 50°, 60°, 70°', right: 'Acute scalene' },
  { left: 'Angles 90°, 30°, 60°', right: 'Right scalene' },
] as const;

export const starMap: UnitDef = {
  id: 'g5.star-map',
  title: 'Star Map: Coordinates & Shapes',
  emoji: '🌌',
  domain: 'geometry',
  levels: [
    level('g5.star-map.read-point', 'Plot the Coordinates', 'multiple-choice', 1, (rng) => {
      const x = randInt(rng, 2, 7); let y = randInt(rng, 2, 7);
      while (x === y) y = randInt(rng, 2, 7);
      if (rng() < 0.5) {
        const answer = `(${x}, ${y})`;
        return mc(`From the origin, go ${x} units right and ${y} units up. Which ordered pair marks the station?`, answer, [
          `(${y}, ${x})`, `(${x + 1}, ${y})`, `(${x}, ${y + 1})`,
        ], rng);
      }
      const startX = randInt(rng, 2, 6); let startY = randInt(rng, 2, 6);
      const right = randInt(rng, 1, 4); let up = randInt(rng, 1, 4);
      while (right === up) up = randInt(rng, 1, 4);
      while (startX + right === startY + up) startY = randInt(rng, 2, 6);
      const movedPoint = `(${startX + right}, ${startY + up})`;
      return mc(`Station is at (${startX}, ${startY}). Move ${right} right and ${up} up. Which ordered pair marks the station?`, movedPoint, [
        `(${startX + up}, ${startY + right})`, `(${startX + right - 1}, ${startY + up})`,
        startX - right >= 0 ? `(${startX - right}, ${startY + up})` : `(${startX + right}, ${startY + up + 1})`,
      ], rng);
    }),
    level('g5.star-map.hierarchy', 'Shape Family Tree', 'true-false', 2, (rng) => {
      const [text, answer] = pick(rng, hierarchyFacts);
      return trueFalse(text, answer, { hint: 'Check whether the statement is true for every shape in that family.' });
    }),
    level('g5.star-map.classify', 'Identify the Hull Shape', 'multiple-choice', 2, (rng) => {
      const fact = pick(rng, hullFacts);
      return mc(`Which is the most specific shape name for this hull? ${fact.prompt}.`, fact.answer, [
        ...fact.options.filter((option) => option !== fact.answer),
      ], rng, { hint: 'Choose the most specific shape that fits every property.' });
    }),
    level('g5.star-map.triangles', 'Triangle Sorting', 'match-pairs', 3, (rng) => {
      const selected = shuffle(rng, [...triangleFacts]).slice(0, 3);
      return matchPairs('Match each triangle’s angle measures to its classification.', selected.map(({ left, right }) => ({ left, right })));
    }),
  ],
};
