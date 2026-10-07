import { pick, randInt } from '../../core/rng';
import type { UnitDef } from '../../core/types';
import { level, mc, numPad, trueFalse } from '../helpers';

export const codes: UnitDef = {
  id: 'g5.codes',
  title: 'Command Codes: Expressions',
  emoji: '🧮',
  domain: 'algebra',
  levels: [
    level('g5.codes.order-of-ops', 'Decode the Order', 'number-pad', 1, (rng) => {
      const template = randInt(rng, 0, 4);
      let expression: string;
      let answer: number;
      if (template === 0) {
        const a = randInt(rng, 3, 30); const b = randInt(rng, 2, 8); const c = randInt(rng, 2, 9);
        expression = `${a} + ${b} × ${c}`; answer = a + b * c;
      } else if (template === 1) {
        const a = randInt(rng, 2, 20); const b = randInt(rng, 2, 15); const c = randInt(rng, 2, 8);
        expression = `(${a} + ${b}) × ${c}`; answer = (a + b) * c;
      } else if (template === 2) {
        const a = randInt(rng, 2, 9); const c = randInt(rng, 1, 8); const b = c + randInt(rng, 2, 8); const d = randInt(rng, 1, 20);
        expression = `${a} × (${b} − ${c}) + ${d}`; answer = a * (b - c) + d;
      } else if (template === 3) {
        const c = randInt(rng, 2, 9); const quotient = randInt(rng, 3, 30); const a = randInt(rng, 1, c * quotient - 1);
        const b = c * quotient - a;
        expression = `[${a} + ${b}] ÷ ${c}`; answer = quotient;
      } else {
        const a = randInt(rng, 2, 9); const d = randInt(rng, 1, 8); const c = d + randInt(rng, 1, 8); const b = randInt(rng, 2, 15);
        expression = `${a} × [${b} + (${c} − ${d})]`; answer = a * (b + c - d);
      }
      return numPad(`Evaluate the command code: ${expression}`, answer, {
        visual: { text: expression },
        hint: 'Parentheses/brackets first, then × and ÷, then + and −.',
      });
    }),
    level('g5.codes.write-expression', 'Translate the Transmission', 'multiple-choice', 2, (rng) => {
      const type = randInt(rng, 0, 3);
      if (type === 0) {
        return mc('Transmission: “3 times the sum of 8 and 7.” Which expression matches?', '3 × (8 + 7)', [
          '3 × 8 + 7', '(3 + 8) × 7', '3 + 8 × 7',
        ], rng, { hint: 'The phrase “the sum” keeps the addition together.' });
      }
      if (type === 1) {
        const a = randInt(rng, 11, 29); const b = randInt(rng, 2, 9); let c = randInt(rng, 3, 8);
        while (b === c) c = randInt(rng, 3, 8);
        return mc(`Add ${a} and ${b}, then multiply by ${c}. Which expression matches?`, `(${a} + ${b}) × ${c}`, [
          `${a} + ${b} × ${c}`, `(${a} + ${c}) × ${b}`, `${a} × (${b} + ${c})`,
        ], rng, { hint: 'Group the sum before multiplying.' });
      }
      if (type === 2) {
        const a = randInt(rng, 24, 60); const c = randInt(rng, 2, 7); const b = randInt(rng, c + 1, 9);
        return mc(`Subtract ${b} from ${a}, then divide by ${c}. Which expression matches?`, `(${a} − ${b}) ÷ ${c}`, [
          `${a} − ${b} ÷ ${c}`, `(${a} ÷ ${c}) − ${b}`, `${a} ÷ (${b} − ${c})`,
        ], rng, { hint: 'Do the subtraction before dividing.' });
      }
      const a = randInt(rng, 14, 40); const b = randInt(rng, 2, 10);
      return mc(`Double the difference of ${a} and ${b}. Which expression matches?`, `2 × (${a} − ${b})`, [
        `2 × ${a} − ${b}`, `(${a} + ${b}) × 2`, `2 + ${a} − ${b}`,
      ], rng, { hint: 'The difference is the grouped subtraction.' });
    }),
    level('g5.codes.interpret', 'Compare Without Computing', 'true-false', 2, (rng) => {
      const a = randInt(rng, 1200, 9800); const b = randInt(rng, 300, 999);
      const truths = [
        `3 × (${a} + ${b}) is three times as large as ${a} + ${b}.`,
        `(${a} × ${b}) ÷ 2 is half of ${a} × ${b}.`,
      ];
      const falses = [
        `(n + m) × 4 is 4 more than n + m.`,
        `a + (b × 5) is 5 times as large as a + b.`,
      ];
      const isTrue = rng() < 0.5;
      return trueFalse(pick(rng, isTrue ? truths : falses), isTrue, {
        hint: 'Use the operation structure instead of calculating.',
      });
    }),
    level('g5.codes.two-rules', 'Twin Signal Patterns', 'multiple-choice', 3, (rng) => {
      const p = randInt(rng, 3, 11); const k = randInt(rng, 2, 4); const q = k * p;
      if (rng() < 0.5) {
        const n = randInt(rng, 3, 6); const a = (n - 1) * p; const b = (n - 1) * q;
        const answer = `(${a}, ${b})`;
        const options = [answer, `(${b}, ${a})`, `(${n * p}, ${n * q})`, `(${a}, ${n * q})`];
        return mc(`Rule A adds ${p} each time; Rule B adds ${q} each time. Which ordered pair uses the ${n}th terms?`, answer, options.filter((option) => option !== answer), rng, {
          visual: { text: `A: 0, ${p}, ${2 * p}, …  B: 0, ${q}, ${2 * q}, …` },
          hint: 'The first term is 0, so the nth term uses n − 1 additions.',
        });
      }
      return mc(`Rule A adds ${p}; Rule B adds ${q}. B’s term is always how many times A’s term?`, String(k), [
        String(k - 1), String(k + 1), String(k + p),
      ], rng, {
        visual: { text: `A: 0, ${p}, ${2 * p}, …  B: 0, ${q}, ${2 * q}, …` },
        hint: 'Compare the amount added by each rule.',
      });
    }),
  ],
};
