import { randInt } from '../../core/rng';
import type { UnitDef } from '../../core/types';
import { level, trueFalse } from '../helpers';
import { add, buildMc, compare, fracLabel, gcd, simplify, sub } from './math';
import type { Frac } from './math';

function properFraction(rng: () => number, minD = 2, maxD = 12): Frac {
  let d = randInt(rng, minD, maxD);
  let n = randInt(rng, 1, d - 1);
  while (gcd(n, d) !== 1) {
    d = randInt(rng, minD, maxD);
    n = randInt(rng, 1, d - 1);
  }
  return { n, d };
}

function candidatesFor(values: Frac[]) {
  return values.map((value) => ({ label: fracLabel(value), value }));
}

export const fractionReactor: UnitDef = {
  id: 'g5.fraction-reactor',
  title: 'Fraction Reactor: Add & Subtract',
  emoji: '⚛️',
  domain: 'fractions',
  levels: [
    level('g5.fraction-reactor.add-unlike', 'Fuse Unlike Fractions', 'multiple-choice', 1, (rng) => {
      const a = properFraction(rng); let b = properFraction(rng);
      while (a.d === b.d) b = properFraction(rng);
      const answer = add(a, b);
      const n1 = simplify({ n: a.n + b.n, d: a.d + b.d });
      const n2 = simplify({ n: a.n * b.d + b.n, d: a.d * b.d });
      const n3 = simplify({ n: a.n + b.n * a.d, d: a.d * b.d });
      return buildMc(`Mission: add ${a.n}/${a.d} + ${b.n}/${b.d}.`, {
        label: fracLabel(answer), value: answer,
      }, candidatesFor([n1, n2, n3, { n: answer.n + 1, d: answer.d }]), rng, {
        hint: 'Rename the fractions with a common denominator, then simplify.',
      }, (value) => fracLabel(typeof value === 'number' ? { n: value, d: 1 } : value));
    }),
    level('g5.fraction-reactor.subtract-unlike', 'Vent the Difference', 'multiple-choice', 2, (rng) => {
      let a = properFraction(rng); let b = properFraction(rng);
      while (a.d === b.d || compare(a, b) <= 0) { a = properFraction(rng); b = properFraction(rng); }
      const answer = sub(a, b);
      const n1 = simplify({ n: a.n - b.n, d: a.d + b.d });
      const n2 = simplify({ n: a.n * b.d - b.n, d: a.d * b.d });
      const n3 = simplify({ n: a.n - b.n * a.d, d: a.d * b.d });
      return buildMc(`Station log: calculate ${a.n}/${a.d} − ${b.n}/${b.d}.`, {
        label: fracLabel(answer), value: answer,
      }, candidatesFor([n1, n2, n3, { n: answer.n + 1, d: answer.d }]), rng, {
        hint: 'Use a common denominator before subtracting the numerators.',
      }, (value) => fracLabel(typeof value === 'number' ? { n: value, d: 1 } : value));
    }),
    level('g5.fraction-reactor.mixed-numbers', 'Mixed-Number Merge', 'multiple-choice', 2, (rng) => {
      const firstPart = properFraction(rng, 2, 8); let secondPart = properFraction(rng, 2, 8);
      while (firstPart.d === secondPart.d) secondPart = properFraction(rng, 2, 8);
      const d1 = firstPart.d; const d2 = secondPart.d;
      const n1 = firstPart.n; const n2 = secondPart.n;
      const subtracting = rng() < 0.5;
      const wholeA = randInt(rng, 3, 6); const wholeB = randInt(rng, 1, 2);
      let first: Frac = { n: wholeA * d1 + n1, d: d1 };
      let second: Frac = { n: wholeB * d2 + n2, d: d2 };
      if (subtracting && compare({ n: n1, d: d1 }, { n: n2, d: d2 }) <= 0) {
        first = { n: (wholeA + 1) * d1 + n1, d: d1 };
      }
      const answer = subtracting ? sub(first, second) : add(first, second);
      const operation = subtracting ? '−' : '+';
      const firstLabel = `${Math.floor(first.n / first.d)} ${first.n % first.d}/${first.d}`;
      const secondLabel = `${Math.floor(second.n / second.d)} ${second.n % second.d}/${second.d}`;
      const candidates = [
        { n: answer.n + answer.d, d: answer.d },
        { n: answer.n - 1, d: answer.d },
        { n: answer.n + 1, d: answer.d + 1 },
        { n: first.n + second.n, d: first.d + second.d },
      ];
      return buildMc(`Merge ${firstLabel} ${operation} ${secondLabel}.`, {
        label: fracLabel(answer), value: answer,
      }, candidatesFor(candidates), rng, {
        hint: 'Convert mixed numbers to improper fractions before operating.',
      }, (value) => fracLabel(typeof value === 'number' ? { n: value, d: 1 } : value));
    }),
    level('g5.fraction-reactor.reasonable', 'Benchmark Check', 'true-false', 3, (rng) => {
      const a = properFraction(rng); const b = properFraction(rng);
      const sum = add(a, b);
      const benchmark = rng() < 0.5 ? { n: 1, d: 2 } : { n: 1, d: 1 };
      const relation = rng() < 0.5 ? 'greater than' : 'less than';
      const relationResult = relation === 'greater than' ? compare(sum, benchmark) > 0 : compare(sum, benchmark) < 0;
      return trueFalse(`${a.n}/${a.d} + ${b.n}/${b.d} is ${relation} ${fracLabel(benchmark)}.`, relationResult, {
        hint: 'Compare each fraction to 0, 1/2, and 1.',
      });
    }),
  ],
};
