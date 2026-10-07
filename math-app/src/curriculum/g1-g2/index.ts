import { randInt } from '../../core/rng';
import type { GradeDef } from '../../core/types';
import { level, matchPairs, mc, numberChoices, numPad, trueFalse } from '../helpers';

export const g1g2: GradeDef[] = [
  {
    id: 'g1',
    title: 'Grade 1',
    ages: '6–7',
    units: [{
      id: 'g1.addition',
      title: 'Addition Adventure',
      emoji: '➕',
      domain: 'operations',
      levels: [
        level('g1.addition.add-within-ten', 'Add Within 10', 'multiple-choice', 1, (rng) => {
          const a = randInt(rng, 0, 5);
          const b = randInt(rng, 0, 5);
          const answer = a + b;
          return {
            kind: 'multiple-choice',
            prompt: `${a} + ${b} = ?`,
            options: numberChoices(rng, answer, { min: 0, max: 12 }),
            answer: String(answer),
          };
        }),
        level('g1.addition.add-within-twenty', 'Add Within 20', 'number-pad', 2, (rng) => {
          const a = randInt(rng, 6, 12);
          const b = randInt(rng, 1, 8);
          return numPad(`${a} + ${b} = ?`, a + b, { visual: { text: `${a} + ${b} =` } });
        }),
        level('g1.addition.fact-families', 'Fact Families', 'true-false', 3, (rng) => {
          const a = randInt(rng, 2, 9);
          const b = randInt(rng, 1, 8);
          const isTrue = rng() > 0.45;
          return trueFalse(`${a} + ${b} = ${a + b + (isTrue ? 0 : 1)}`, isTrue);
        }),
      ],
    }],
  },
  {
    id: 'g2',
    title: 'Grade 2',
    ages: '7–8',
    units: [{
      id: 'g2.addition',
      title: 'Big Number Builders',
      emoji: '🧱',
      domain: 'operations',
      levels: [
        level('g2.addition.two-digit-sums', 'Two-Digit Sums', 'multiple-choice', 1, (rng) => {
          const a = randInt(rng, 12, 48);
          const b = randInt(rng, 11, 39);
          const answer = a + b;
          return mc(`${a} + ${b} = ?`, String(answer), [String(answer + 10), String(answer - 1), String(answer + 1)], rng);
        }),
        level('g2.addition.subtraction', 'Subtraction Mission', 'number-pad', 2, (rng) => {
          const a = randInt(rng, 25, 90);
          const b = randInt(rng, 1, Math.min(24, a));
          return numPad(`${a} − ${b} = ?`, a - b, { visual: { text: `${a} − ${b} =` } });
        }),
        level('g2.addition.number-facts', 'Number Fact Pairs', 'match-pairs', 3, (rng) => {
          const base = randInt(rng, 3, 7);
          const pairs = [0, 1, 2].map((offset) => {
            const left = base + offset;
            return { left: `${left} + 2`, right: String(left + 2) };
          });
          return matchPairs('Match each sum to its answer.', pairs);
        }),
      ],
    }],
  },
];
