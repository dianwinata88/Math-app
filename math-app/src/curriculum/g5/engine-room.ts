import { randInt } from '../../core/rng';
import type { UnitDef } from '../../core/types';
import { level, mc, numPad } from '../helpers';

export const engineRoom: UnitDef = {
  id: 'g5.engine-room',
  title: 'Engine Room: Big Number Ops',
  emoji: '⚙️',
  domain: 'operations',
  levels: [
    level('g5.engine-room.multiply', 'Standard Algorithm Boost', 'number-pad', 1, (rng) => {
      const digits = rng() < 0.5 ? 3 : 4;
      const a = randInt(rng, digits === 3 ? 100 : 1000, digits === 3 ? 999 : 9999);
      const b = randInt(rng, 11, 99);
      return numPad(`Calculate ${a} × ${b}.`, a * b, { visual: { text: `${a} × ${b}` } });
    }),
    level('g5.engine-room.divide', 'Two-Digit Divisor Drill', 'number-pad', 2, (rng) => {
      const divisor = randInt(rng, 11, 99); const quotient = randInt(rng, 12, 99); const dividend = divisor * quotient;
      return numPad(`Calculate ${dividend} ÷ ${divisor}.`, quotient, { visual: { text: `${dividend} ÷ ${divisor}` } });
    }),
    level('g5.engine-room.remainders', 'Remainder Readout', 'multiple-choice', 3, (rng) => {
      const divisor = randInt(rng, 11, 99); const quotient = randInt(rng, 12, 85); const remainder = randInt(rng, 1, divisor - 1);
      const dividend = divisor * quotient + remainder;
      const answer = `${quotient} R ${remainder}`;
      const options = [answer, `${quotient + 1} R ${remainder}`, `${quotient} R ${remainder === divisor - 1 ? remainder - 1 : remainder + 1}`, `${quotient - 1} R ${remainder + divisor}`];
      return mc(`Divide ${dividend} by ${divisor}. Report the quotient and remainder.`, answer, options.filter((option) => option !== answer), rng, {
        visual: { text: `${dividend} ÷ ${divisor}` },
        hint: 'The remainder must be smaller than the divisor.',
      });
    }),
  ],
};
