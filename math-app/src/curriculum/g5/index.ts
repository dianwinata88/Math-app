import { randInt } from '../../core/rng';
import type { GradeDef } from '../../core/types';
import { level, matchPairs, mc, numPad } from '../helpers';

export const g5: GradeDef[] = [
  {
    id: 'g5',
    title: 'Grade 5',
    ages: '10–12',
    units: [{
      id: 'g5.algebra',
      title: 'Algebra Academy',
      emoji: '🧪',
      domain: 'algebra',
      levels: [
        level('g5.algebra.solve-addition', 'Balance the Equation', 'multiple-choice', 1, (rng) => {
          const answer = randInt(rng, 4, 18);
          const offset = randInt(rng, 2, 12);
          return mc(`x + ${offset} = ${answer + offset}. What is x?`, String(answer), [String(answer + 1), String(Math.max(0, answer - 1)), String(answer + 2)], rng);
        }),
        level('g5.algebra.solve-multiplication', 'Find the Factor', 'number-pad', 2, (rng) => {
          const answer = randInt(rng, 2, 12);
          const factor = randInt(rng, 2, 9);
          return numPad(`${factor}x = ${answer * factor}. What is x?`, answer, { visual: { text: `${factor} × ? = ${answer * factor}` } });
        }),
        level('g5.algebra.expression-pairs', 'Expression Match', 'match-pairs', 3, (rng) => {
          const value = randInt(rng, 4, 8);
          return matchPairs('Match each expression to its value when x equals the given number.', [
            { left: `x + 2 (x=${value})`, right: String(value + 2) },
            { left: `2x (x=${value})`, right: String(value * 2) },
            { left: `x − 1 (x=${value})`, right: String(value - 1) },
          ]);
        }),
      ],
    }],
  },
];
