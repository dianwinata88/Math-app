import { randInt } from '../../core/rng';
import type { GradeDef } from '../../core/types';
import { level, matchPairs, mc, numPad, trueFalse } from '../helpers';

export const g3g4: GradeDef[] = [
  {
    id: 'g3',
    title: 'Grade 3',
    ages: '8–9',
    units: [{
      id: 'g3.fractions',
      title: 'Fraction Friends',
      emoji: '🍕',
      domain: 'fractions',
      levels: [
        level('g3.fractions.equal-parts', 'Equal Parts', 'multiple-choice', 1, (rng) => {
          const denominator = randInt(rng, 2, 8);
          return mc(`A whole is split into ${denominator} equal parts. One part is called…`, `1/${denominator}`, [`2/${denominator}`, `1/${denominator + 1}`, `${denominator}/1`], rng);
        }),
        level('g3.fractions.numerator', 'Name the Numerator', 'number-pad', 2, (rng) => {
          const denominator = randInt(rng, 3, 9);
          const numerator = randInt(rng, 1, denominator - 1);
          return numPad(`What is the numerator in ${numerator}/${denominator}?`, numerator, { visual: { text: `${numerator} / ${denominator}` } });
        }),
        level('g3.fractions.fraction-pairs', 'Fraction Match', 'match-pairs', 3, (rng) => {
          const denominator = randInt(rng, 4, 8);
          return matchPairs('Match each fraction to the number of equal parts.', [
            { left: `1/${denominator}`, right: 'one part' },
            { left: `2/${denominator}`, right: 'two parts' },
            { left: `${denominator - 1}/${denominator}`, right: 'almost whole' },
          ]);
        }),
      ],
    }],
  },
  {
    id: 'g4',
    title: 'Grade 4',
    ages: '9–10',
    units: [{
      id: 'g4.decimals',
      title: 'Decimal Detectives',
      emoji: '🔎',
      domain: 'decimals',
      levels: [
        level('g4.decimals.tenths', 'Tenths Place', 'multiple-choice', 1, (rng) => {
          const tenths = randInt(rng, 1, 9);
          return mc(`Which decimal means ${tenths} tenths?`, `0.${tenths}`, [`${tenths}.0`, `0.0${tenths}`, `1.${tenths}`], rng);
        }),
        level('g4.decimals.add-tenths', 'Add Tenths', 'number-pad', 2, (rng) => {
          const a = randInt(rng, 1, 7);
          const b = randInt(rng, 1, 9 - a);
          return numPad(`How many tenths are ${a} tenths + ${b} tenths?`, a + b, { visual: { text: `${a} + ${b} tenths` } });
        }),
        level('g4.decimals.compare', 'Compare Decimals', 'true-false', 3, (rng) => {
          const tenths = randInt(rng, 1, 8);
          const isGreater = rng() > 0.5;
          return trueFalse(`Is 0.${tenths} ${isGreater ? 'greater' : 'less'} than 0.${tenths + 1}?`, !isGreater);
        }),
      ],
    }],
  },
];
