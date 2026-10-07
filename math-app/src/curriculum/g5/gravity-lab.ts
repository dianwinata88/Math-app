import { pick, randInt } from '../../core/rng';
import type { UnitDef } from '../../core/types';
import { level, matchPairs, trueFalse } from '../helpers';
import { buildMc, fracLabel, gcd, mul, shareContexts, simplify } from './math';
import type { Frac } from './math';

function properFraction(rng: () => number, minD = 2, maxD = 7): Frac {
  let d = randInt(rng, minD, maxD);
  let n = randInt(rng, 1, d - 1);
  while (gcd(n, d) !== 1) {
    d = randInt(rng, minD, maxD);
    n = randInt(rng, 1, d - 1);
  }
  return { n, d };
}

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
        a = properFraction(rng, 2, 5); const whole = randInt(rng, 2, 8);
        b = { n: whole, d: 1 };
        prompt = `${a.n}/${a.d} × ${whole} = ?`;
        wrong = [
          { n: a.n * whole, d: a.d },
          { n: a.n + whole, d: a.d },
          { n: a.n, d: a.d * whole },
          { n: a.n * whole, d: 1 },
        ];
      } else {
        a = properFraction(rng);
        b = properFraction(rng);
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
      const firstWhole = randInt(rng, 1, 3); const firstPart = properFraction(rng, 2, 5);
      const secondWhole = randInt(rng, 1, 3); const secondPart = properFraction(rng, 2, 5);
      const firstNumerator = firstPart.n; const firstDenominator = firstPart.d;
      const secondNumerator = secondPart.n; const secondDenominator = secondPart.d;
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
      const factorType = randInt(rng, 0, 2);
      const factor = factorType === 0 ? properFraction(rng, 2, 8)
        : factorType === 1 ? { n: 1, d: 1 }
          : (() => {
            const d = randInt(rng, 2, 7);
            let n = randInt(rng, d + 1, d * 2);
            while (gcd(n, d) !== 1) n = randInt(rng, d + 1, d * 2);
            return { n, d };
          })();
      const factorLabel = factor.n === factor.d ? '1' : `${factor.n}/${factor.d}`;
      const relation = factor.n < factor.d
        ? (rng() < 0.5 ? 'less than' : 'greater than')
        : factor.n === factor.d
          ? (rng() < 0.5 ? 'equal to' : 'less than')
          : (rng() < 0.5 ? 'greater than' : 'less than');
      const product = n * factor.n;
      const comparison = product - n * factor.d;
      const isTrue = relation === 'less than' ? comparison < 0
        : relation === 'greater than' ? comparison > 0 : comparison === 0;
      return trueFalse(`${n} × ${factorLabel} is ${relation} ${n}.`, isTrue, {
        hint: 'Multiplying by a fraction less than 1 makes it smaller.',
      });
    }),
    level('g5.gravity-lab.divide-unit', 'Unit Fraction Split', 'multiple-choice', 3, (rng) => {
      const k = randInt(rng, 2, 8); const m = randInt(rng, 2, 6);
      const context = pick(rng, shareContexts);
      const unitShare = rng() < 0.5;
      const prompt = unitShare
        ? `The ${context} holds 1/${k} unit. Split it among ${m} crew members. Calculate 1/${k} ÷ ${m}.`
        : `There are ${m} units of ${context}. How many 1/${k}-unit portions fit? Calculate ${m} ÷ 1/${k}.`;
      const answer: Frac = unitShare ? { n: 1, d: k * m } : { n: m * k, d: 1 };
      const wrong: Frac[] = [
        { n: m, d: k },
        { n: k, d: m },
        { n: 1, d: k * m },
        { n: m * k, d: 1 },
        { n: m + k, d: 1 },
      ];
      return buildMc(prompt, { label: fracLabel(answer), value: answer }, wrong.map((value) => ({
        label: fracLabel(value), value,
      })), rng, { hint: 'Dividing by a unit fraction asks how many unit-size groups fit.' },
      (value) => fracLabel(typeof value === 'number' ? { n: value, d: 1 } : value));
    }),
  ],
};
