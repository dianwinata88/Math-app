import { randInt } from '../../core/rng';
import type { UnitDef } from '../../core/types';
import { level, matchPairs, trueFalse } from '../helpers';
import { buildMc, fracLabel, mul, simplify } from './math';
import type { Frac } from './math';

export const gravityLab: UnitDef = {
  id: 'g5.gravity-lab',
  title: 'Gravity Lab: Multiply & Divide Fractions',
  emoji: '🪐',
  domain: 'fractions',
  levels: [
    level('g5.gravity-lab.as-division', 'Fractions Are Division', 'match-pairs', 1, (rng) => {
      const used = new Set<string>();
      const pairs = [];
      while (pairs.length < 3) {
        const a = randInt(rng, 2, 9); const b = randInt(rng, 2, 9);
        const value = simplify({ n: a, d: b });
        const key = `${value.n}/${value.d}`;
        if (used.has(key)) continue;
        used.add(key);
        pairs.push({ left: `${a} ÷ ${b}`, right: `${a}/${b}` });
      }
      return matchPairs('Match each division signal to its fraction.', pairs);
    }),
    level('g5.gravity-lab.multiply', 'Fraction Multiplier', 'multiple-choice', 2, (rng) => {
      const wholeMode = rng() < 0.5;
      let a: Frac; let b: Frac; let prompt: string; let wrong: Frac[];
      if (wholeMode) {
        const denominator = randInt(rng, 2, 5); const numerator = randInt(rng, 1, denominator - 1); const whole = randInt(rng, 2, 8);
        a = { n: numerator, d: denominator }; b = { n: whole, d: 1 };
        prompt = `${numerator}/${denominator} × ${whole} = ?`;
        wrong = [
          { n: numerator * whole, d: denominator * 1 },
          { n: numerator + whole, d: denominator },
          { n: numerator, d: denominator * whole },
          { n: numerator * whole, d: 1 },
        ];
      } else {
        a = { n: randInt(rng, 1, 4), d: randInt(rng, 2, 7) };
        b = { n: randInt(rng, 1, 4), d: randInt(rng, 2, 7) };
        prompt = `${a.n}/${a.d} × ${b.n}/${b.d} = ?`;
        wrong = [
          { n: a.n * b.n, d: a.d },
          { n: a.n * b.d + b.n * a.d, d: a.d * b.d },
          { n: a.n * b.d, d: a.d * b.n },
          { n: a.n + b.n, d: a.d + b.d },
        ];
      }
      const answer = mul(a, b);
      return buildMc(prompt, { label: fracLabel(answer), value: answer },
        wrong.map((value) => ({ label: fracLabel(value), value })), rng, {
          hint: 'Multiply numerators together and denominators together, then simplify.',
        }, (value) => fracLabel(typeof value === 'number' ? { n: value, d: 1 } : value));
    }),
    level('g5.gravity-lab.mixed-multiply', 'Mixed-Number Thrust', 'multiple-choice', 2, (rng) => {
      const firstWhole = randInt(rng, 1, 3); const firstNumerator = randInt(rng, 1, 3); const firstDenominator = randInt(rng, firstNumerator + 1, 5);
      const secondWhole = randInt(rng, 1, 3); const secondNumerator = randInt(rng, 1, 3); const secondDenominator = randInt(rng, secondNumerator + 1, 5);
      const first: Frac = { n: firstWhole * firstDenominator + firstNumerator, d: firstDenominator };
      const second: Frac = { n: secondWhole * secondDenominator + secondNumerator, d: secondDenominator };
      const answer = mul(first, second);
      const separate = simplify({
        n: firstWhole * secondWhole * firstDenominator * secondDenominator + firstNumerator * secondNumerator,
        d: firstDenominator * secondDenominator,
      });
      const candidates = [separate, { n: answer.n + answer.d, d: answer.d }, { n: answer.n - 1, d: answer.d }];
      return buildMc(`${firstWhole} ${firstNumerator}/${firstDenominator} × ${secondWhole} ${secondNumerator}/${secondDenominator} = ?`, {
        label: fracLabel(answer), value: answer,
      }, candidates.map((value) => ({ label: fracLabel(value), value })), rng, {
        hint: 'Rename each mixed number as an improper fraction first.',
      }, (value) => fracLabel(typeof value === 'number' ? { n: value, d: 1 } : value));
    }),
    level('g5.gravity-lab.scaling', 'Scale Factor Sense', 'true-false', 3, (rng) => {
      const n = randInt(rng, 2, 12);
      const statements = [
        { text: `5 × 3/4 is less than 5.`, answer: true },
        { text: `n × 7/5 is less than n when n = ${n}.`, answer: false },
        { text: `${n} × 1 is equal to ${n}.`, answer: true },
        { text: `${n} × 2/3 is greater than ${n}.`, answer: false },
      ];
      const statement = statements[randInt(rng, 0, statements.length - 1)];
      return trueFalse(statement.text, statement.answer, {
        hint: 'Multiplying by a fraction less than 1 makes it smaller.',
      });
    }),
    level('g5.gravity-lab.divide-unit', 'Unit Fraction Split', 'multiple-choice', 3, (rng) => {
      const scenario = randInt(rng, 0, 3);
      let prompt: string; let answer: Frac; let wrong: Frac[];
      if (scenario === 0) {
        prompt = 'Split 1/3 of a fuel cell evenly among 4 crew. How much does each receive?';
        answer = { n: 1, d: 12 }; wrong = [{ n: 4, d: 3 }, { n: 3, d: 4 }, { n: 4, d: 1 }];
      } else if (scenario === 1) {
        prompt = 'How many 1/4-unit packs fit into 5 units of cargo?';
        answer = { n: 20, d: 1 }; wrong = [{ n: 5, d: 4 }, { n: 1, d: 20 }, { n: 4, d: 5 }];
      } else if (scenario === 2) {
        prompt = 'Share 1/2 L of juice among 3 crew. How much juice is each share?';
        answer = { n: 1, d: 6 }; wrong = [{ n: 3, d: 2 }, { n: 2, d: 3 }, { n: 1, d: 5 }];
      } else {
        prompt = 'How many 1/3-cup scoops fill 4 cups?';
        answer = { n: 12, d: 1 }; wrong = [{ n: 4, d: 3 }, { n: 3, d: 4 }, { n: 1, d: 12 }];
      }
      return buildMc(prompt, { label: fracLabel(answer), value: answer }, wrong.map((value) => ({
        label: fracLabel(value), value,
      })), rng, { hint: 'Dividing by a unit fraction asks how many unit-size groups fit.' },
      (value) => fracLabel(typeof value === 'number' ? { n: value, d: 1 } : value));
    }),
  ],
};
