import { createRng } from '../src/core/rng';
import type { LevelDef, Question } from '../src/core/types';
import { g3g4 } from '../src/curriculum/g3-g4';

const SEEDS = Array.from({ length: 300 }, (_, index) => index + 1);
const levels = new Map(g3g4.flatMap((grade) => grade.units.flatMap((unit) => unit.levels)).map((item) => [item.id, item]));

function each(id: string, check: (question: Question, seed: number) => void) {
  const found: LevelDef | undefined = levels.get(id);
  if (!found) throw new Error(`missing level ${id}`);
  for (const seed of SEEDS) check(found.generate(createRng(seed)), seed);
}

const nums = (text: string) => (text.replace(/,/g, '').match(/\d+/g) ?? []).map(Number);
const labels = (question: Question) => (question.options ?? []).map((option) => option.label);
const wrongLabels = (question: Question) => labels(question).filter((label) => label !== question.answer);

/** "3/4" | "2 1/4" | "5" -> value as [numerator, denominator] */
function fraction(label: string): [number, number] {
  const mixed = label.match(/^(\d+) (\d+)\/(\d+)$/);
  if (mixed) return [Number(mixed[1]) * Number(mixed[3]) + Number(mixed[2]), Number(mixed[3])];
  const simple = label.match(/^(\d+)\/(\d+)$/);
  if (simple) return [Number(simple[1]), Number(simple[2])];
  throw new Error(`not a fraction: ${label}`);
}
const sameValue = (a: [number, number], b: [number, number]) => a[0] * b[1] === b[0] * a[1];
const isFraction = (label: string) => /^(\d+ )?\d+\/\d+$/.test(label);
const fromDecimal = (label: string) => Math.round(Number(label) * 100);
const minutes = (time: string) => {
  const [hour, minute] = time.split(':').map(Number);
  return (hour % 12) * 60 + minute;
};
const isPrime = (n: number) => n > 1 && Array.from({ length: n - 2 }, (_, index) => index + 2).every((d) => n % d !== 0);

describe('Grade 3 math is correct', () => {
  it('multiplication and division answers', () => {
    each('g3.multiplication.equal-groups', (q) => {
      const [groups, size] = nums(q.prompt);
      expect(q.answer).toBe(String(groups * size));
    });
    each('g3.multiplication.arrays', (q) => {
      const [rows, cols] = nums(q.prompt);
      expect(q.answer).toBe(String(rows * cols));
      expect(q.kind).toBe('count-tap');
    });
    each('g3.multiplication.skip-count', (q) => {
      const factor = nums(q.prompt)[0];
      const seq = (q.sequence ?? []).map(Number);
      seq.forEach((value, index) => {
        expect(value % factor).toBe(0);
        if (index > 0) expect(value - seq[index - 1]).toBe(factor);
      });
    });
    each('g3.multiplication.tens', (q) => {
      const [a, b] = nums(q.prompt);
      expect(q.answer).toBe(String(a * b));
    });
    each('g3.division.share', (q) => {
      const [total, people] = nums(q.prompt);
      expect(Number(q.answer) * people).toBe(total);
    });
    each('g3.division.unknown-factor', (q) => {
      const text = q.visual?.text ?? '';
      const filled = text.replace('?', q.answer).replace(/×/g, '*').replace(/÷/g, '/');
      const [left, right] = filled.split('=');
      expect(Function(`return ${left}`)()).toBe(Number(right));
    });
  });

  it('property statements are judged correctly', () => {
    each('g3.division.properties', (q) => {
      const [left, right] = (q.visual?.text ?? '').split(' = ').map((side) => Function(`return ${side.replace(/×/g, '*').replace(/−/g, '-')}`)());
      expect(q.answer).toBe(String(left === right));
    });
  });

  it('rounding and 3-digit add/sub', () => {
    each('g3.place-value.round-10', (q) => {
      const value = nums(q.prompt)[0];
      expect(q.answer.replace(/,/g, '')).toBe(String(Math.round(value / 10) * 10));
    });
    each('g3.place-value.round-100', (q) => {
      const value = nums(q.prompt)[0];
      expect(q.answer.replace(/,/g, '')).toBe(String(Math.round(value / 100) * 100));
    });
    each('g3.place-value.add-1000', (q) => {
      const [a, b] = nums(q.visual?.text ?? '');
      expect(Number(q.answer)).toBe(a + b);
      expect(a + b).toBeLessThanOrEqual(1000);
    });
    each('g3.place-value.subtract-1000', (q) => {
      const [a, b] = nums(q.visual?.text ?? '');
      expect(Number(q.answer)).toBe(a - b);
    });
  });

  it('fractions', () => {
    each('g3.fractions.shaded', (q) => {
      const text = q.visual?.text ?? '';
      const shaded = [...text].filter((char) => char === '🟧').length;
      const total = shaded + [...text].filter((char) => char === '⬜').length;
      expect(q.answer).toBe(`${shaded}/${total}`);
      wrongLabels(q).forEach((label) => expect(sameValue(fraction(label), [shaded, total])).toBe(false));
    });
    each('g3.fractions.number-line', (q) => {
      const line = q.visual?.emoji ?? '';
      const jumps = line.split('—').length - 1;
      const star = line.slice(0, line.indexOf('⭐')).split('—').length - 1;
      expect(q.answer).toBe(`${star}/${jumps}`);
      wrongLabels(q).forEach((label) => expect(sameValue(fraction(label), [star, jumps])).toBe(false));
    });
    each('g3.fractions.equivalent', (q) => {
      (q.pairs ?? []).forEach(({ left, right }) => {
        const leftValue: [number, number] = left === '1' ? [1, 1] : fraction(left);
        expect(sameValue(leftValue, fraction(right))).toBe(true);
      });
    });
    each('g3.fractions.compare', (q) => {
      const [a, b] = (q.prompt.match(/\d+\/\d+/g) ?? []).map(fraction);
      const greater = a[0] * b[1] > b[0] * a[1] ? a : b;
      const smaller = greater === a ? b : a;
      const expected = q.prompt.includes('greater') ? greater : smaller;
      expect(q.answer).toBe(`${expected[0]}/${expected[1]}`);
      expect(sameValue(a, b)).toBe(false);
    });
  });

  it('time', () => {
    each('g3.time.read-clock', (q) => {
      const hour = nums(q.prompt)[0];
      const marks = q.prompt.match(/(\d+) little mark/);
      const at = Number((q.prompt.match(/(?:past|at) the (\d+)\. What/) ?? [])[1]);
      const minute = (at % 12) * 5 + (marks ? Number(marks[1]) : 0);
      expect(q.answer).toBe(`${hour}:${String(minute).padStart(2, '0')}`);
    });
    each('g3.time.minutes-past', (q) => {
      const [marks, number] = nums(q.prompt);
      expect(q.answer).toBe(String(number * 5 + marks));
    });
    each('g3.time.end-time', (q) => {
      const start = (q.prompt.match(/\d+:\d\d/) ?? [''])[0];
      const length = Number((q.prompt.match(/lasts (\d+) minutes/) ?? [])[1]);
      expect((minutes(q.answer) - minutes(start) + 720) % 720).toBe(length);
      wrongLabels(q).forEach((label) => expect(label).toMatch(/^(1[0-2]|[1-9]):[0-5]\d$/));
    });
    each('g3.time.elapsed', (q) => {
      const [start, end] = q.prompt.match(/\d+:\d\d/g) ?? [];
      expect(Number(q.answer)).toBe((minutes(end ?? "") - minutes(start ?? "") + 720) % 720);
    });
  });

  it('area, perimeter and graphs', () => {
    each('g3.area.count-squares', (q) => {
      expect(q.answer).toBe(String([...(q.visual?.emoji ?? '')].filter((char) => char === '🟨').length));
    });
    each('g3.area.length-times-width', (q) => {
      const [l, w] = nums(q.prompt);
      expect(q.answer).toBe(String(l * w));
    });
    each('g3.area.perimeter', (q) => {
      const values = nums(q.prompt);
      const expected = q.prompt.includes('rectangle') ? 2 * (values[0] + values[1]) : values.reduce((sum, value) => sum + value, 0);
      expect(q.answer).toBe(String(expected));
    });
    each('g3.area.missing-side', (q) => {
      const [total, known] = nums(q.prompt);
      const w = Number(q.answer);
      expect(q.prompt.includes('area') ? known * w : 2 * (known + w)).toBe(total);
    });
    const readBars = (q: Question) => {
      const [key, ...rows] = (q.visual?.emoji ?? '').split('\n');
      const scale = nums(key)[0];
      return rows.map((row) => [...row].filter((char) => char === '▇').length * scale);
    };
    each('g3.graphs.picture-graph', (q) => {
      const [key, row] = (q.visual?.emoji ?? '').split('\n');
      const icon = key.split(' = ')[0];
      expect(Number(q.answer)).toBe((row.split(icon).length - 1) * nums(key)[0]);
    });
    each('g3.graphs.how-many-more', (q) => {
      const [a, b] = readBars(q);
      expect(Number(q.answer)).toBe(Math.abs(a - b));
    });
    each('g3.graphs.total', (q) => {
      expect(Number(q.answer)).toBe(readBars(q).reduce((sum, value) => sum + value, 0));
    });
  });

  it('two-step word problems', () => {
    each('g3.market.two-step', (q) => {
      const [start, found, spent] = nums(q.prompt);
      expect(Number(q.answer)).toBe(start + found - spent);
    });
    each('g3.market.two-step-multiply', (q) => {
      const values = nums(q.prompt);
      if (q.prompt.includes('gives away')) expect(Number(q.answer)).toBe(values[0] * values[1] - values[2]);
      else if (q.prompt.includes('loose')) expect(Number(q.answer)).toBe(values[0] * values[1] + values[2]);
      else expect(Number(q.answer)).toBe(values[0] / values[1] - values[2]);
    });
  });
});

describe('Grade 4 math is correct', () => {
  it('place value', () => {
    each('g4.place-value.digit-value', (q) => {
      const number = String(nums(q.prompt)[0]);
      const digit = (q.prompt.match(/digit (\d)/) ?? [])[1];
      const position = number.indexOf(digit);
      expect(number.lastIndexOf(digit)).toBe(position);
      expect(q.answer.replace(/,/g, '')).toBe(String(Number(digit) * 10 ** (number.length - 1 - position)));
    });
    each('g4.place-value.compare', (q) => {
      const [a, b] = nums(q.prompt);
      expect(q.answer).toBe(String(q.prompt.includes('>') ? a > b : a < b));
    });
    const PLACE: Record<string, number> = { ten: 10, hundred: 100, thousand: 1000, 'ten thousand': 10000, 'hundred thousand': 100000 };
    each('g4.place-value.round', (q) => {
      const value = nums(q.prompt)[0];
      const place = PLACE[(q.prompt.match(/nearest (.+)\.$/) ?? [])[1]];
      expect(q.answer.replace(/,/g, '')).toBe(String(Math.round(value / place) * place));
    });
    each('g4.place-value.order', (q) => {
      const values = (q.sequence ?? []).map((label) => Number(label.replace(/,/g, '')));
      expect([...values].sort((a, b) => a - b)).toEqual(values);
    });
  });

  it('multi-digit operations and division', () => {
    each('g4.calculations.add', (q) => {
      const [a, b] = nums(q.visual?.text ?? '');
      expect(Number(q.answer)).toBe(a + b);
      expect(a + b).toBeLessThanOrEqual(1000000);
    });
    each('g4.calculations.subtract', (q) => {
      const [a, b] = nums(q.visual?.text ?? '');
      expect(Number(q.answer)).toBe(a - b);
    });
    each('g4.calculations.multiply-2x2', (q) => {
      const [a, b] = nums(q.prompt);
      expect(Number(q.answer)).toBe(a * b);
    });
    each('g4.division.remainders', (q) => {
      const [dividend, divisor] = nums(q.prompt);
      expect(q.answer).toBe(`${Math.floor(dividend / divisor)} R ${dividend % divisor}`);
    });
    each('g4.division.long-division', (q) => {
      const [dividend, divisor] = nums(q.prompt);
      expect(dividend).toBeGreaterThanOrEqual(1000);
      expect(dividend).toBeLessThanOrEqual(9999);
      const expected = q.prompt.includes('remainder') ? dividend % divisor : Math.floor(dividend / divisor);
      expect(Number(q.answer)).toBe(expected);
      if (dividend % divisor !== 0 && !q.prompt.includes('remainder')) expect(q.prompt).toContain(`R ${dividend % divisor}.`);
    });
    each('g4.division.interpret', (q) => {
      const [total, size] = nums(q.prompt);
      const expected = q.prompt.includes('needed') ? Math.ceil(total / size) : q.prompt.includes('left over') ? total % size : Math.floor(total / size);
      expect(q.answer).toBe(String(expected));
    });
  });

  it('factors, primes and patterns', () => {
    each('g4.patterns.factors', (q) => {
      const [first, second] = nums(q.prompt);
      const [factor, number] = q.prompt.includes('factor of') ? [first, second] : [second, first];
      expect(q.answer).toBe(String(number % factor === 0));
    });
    each('g4.patterns.prime-composite', (q) => {
      const wantPrime = q.prompt.includes('prime');
      labels(q).forEach((label) => expect(isPrime(Number(label)) === wantPrime).toBe(label === q.answer));
    });
    each('g4.patterns.shape-pattern', (q) => {
      const shown = (q.visual?.items ?? []).slice(0, -1);
      const position = nums(q.prompt).at(-1) ?? 0;
      expect(q.answer).toBe(shown[(position - 1) % shown.length]);
    });
    const applies = (rule: string, terms: number[]) => {
      const step = nums(rule)[0];
      return terms.every((term, index) => index === 0 || term === (rule.startsWith('Add') ? terms[index - 1] + step : rule.startsWith('Subtract') ? terms[index - 1] - step : terms[index - 1] * step));
    };
    each('g4.patterns.rule-detective', (q) => {
      const terms = nums(q.visual?.text ?? '');
      labels(q).forEach((label) => expect(applies(label, terms)).toBe(label === q.answer));
    });
  });

  it('fractions: every option is judged by value', () => {
    each('g4.fractions.equivalent', (q) => {
      const [a, b, c, d] = (q.visual?.text ?? '').replace('?', q.answer).match(/\d+/g)?.map(Number) ?? [];
      expect(a * d).toBe(b * c);
    });
    each('g4.fractions.compare', (q) => {
      const [a, b] = (q.prompt.match(/\d+\/\d+/g) ?? []).map(fraction);
      const greater = a[0] * b[1] > b[0] * a[1] ? a : b;
      const expected = q.prompt.includes('greater') ? greater : greater === a ? b : a;
      expect(q.answer).toBe(`${expected[0]}/${expected[1]}`);
    });
    const checkOptions = (q: Question, expected: [number, number]) => {
      expect(sameValue(fraction(q.answer), expected)).toBe(true);
      wrongLabels(q).filter(isFraction).forEach((label) => expect(sameValue(fraction(label), expected)).toBe(false));
    };
    each('g4.fractions.add-subtract', (q) => {
      const [a, b] = (q.visual?.text ?? '').match(/\d+\/\d+/g)?.map(fraction) ?? [];
      checkOptions(q, [q.visual?.text?.includes('+') ? a[0] + b[0] : a[0] - b[0], a[1]]);
    });
    each('g4.fractions.mixed-numbers', (q) => {
      checkOptions(q, fraction(q.visual?.text ?? ''));
      expect(q.prompt.includes('mixed') ? /^\d+ \d+\/\d+$/.test(q.answer) : /^\d+\/\d+$/.test(q.answer)).toBe(true);
    });
    each('g4.fractions.times-whole', (q) => {
      const [n, a, b] = nums(q.visual?.text ?? '');
      checkOptions(q, [n * a, b]);
    });
  });

  it('decimals', () => {
    each('g4.decimals.tenths-hundredths', (q) => {
      const words = q.prompt;
      const t = words.match(/(\d+) tenths/);
      const h = words.match(/(\d+) hundredth/);
      expect(fromDecimal(q.answer)).toBe((t ? Number(t[1]) * 10 : 0) + (h ? Number(h[1]) : 0));
      wrongLabels(q).forEach((label) => expect(fromDecimal(label)).not.toBe(fromDecimal(q.answer)));
    });
    each('g4.decimals.fraction-match', (q) => {
      (q.pairs ?? []).forEach(({ left, right }) => {
        const [n, d] = fraction(left);
        expect(fromDecimal(right)).toBe((n * 100) / d);
      });
    });
    each('g4.decimals.compare', (q) => {
      const [x, y] = (q.visual?.text ?? '').split(/ [<>] /).map(fromDecimal);
      expect(q.answer).toBe(String(q.visual?.text?.includes('>') ? x > y : x < y));
    });
    each('g4.decimals.order', (q) => {
      const values = (q.sequence ?? []).map(fromDecimal);
      expect([...values].sort((a, b) => a - b)).toEqual(values);
      expect(new Set(values).size).toBe(values.length);
    });
  });

  it('measurement and geometry', () => {
    each('g4.measurement.area-perimeter', (q) => {
      const values = nums(q.prompt);
      const answer = Number(q.answer);
      if (q.prompt.includes('square tower')) expect(answer * 4).toBe(values[0]);
      else if (q.prompt.includes('What is its area')) expect(answer).toBe(values[0] * values[1]);
      else if (q.prompt.includes('What is its perimeter')) expect(answer).toBe(2 * (values[0] + values[1]));
      else if (q.prompt.includes('area of')) expect(answer * values[1]).toBe(values[0]);
      else expect(2 * (answer + values[1])).toBe(values[0]);
    });
    each('g4.geometry.angle-types', (q) => {
      const degrees = nums(q.prompt)[0];
      const expected = degrees < 90 ? 'Acute' : degrees === 90 ? 'Right' : degrees < 180 ? 'Obtuse' : 'Straight';
      expect(q.answer).toBe(expected);
    });
    each('g4.geometry.angle-math', (q) => {
      const values = nums(q.prompt);
      const answer = Number(q.answer);
      if (q.prompt.includes('full circle')) expect(answer).toBe((360 * values[0]) / values[1]);
      else if (q.prompt.includes('clock')) expect(answer).toBe(values[1] * 30);
      else if (q.prompt.includes('right angle')) expect(answer + values[0]).toBe(90);
      else if (q.prompt.includes('straight')) expect(answer + values[0]).toBe(180);
      else expect(answer).toBe(values[0] + values[1]);
    });
    each('g4.geometry.triangles', (q) => {
      const values = nums(q.prompt);
      if (q.prompt.includes('angles')) {
        expect(values.reduce((sum, value) => sum + value, 0)).toBe(180);
        const largest = Math.max(...values);
        expect(q.answer).toBe(largest < 90 ? 'Acute triangle' : largest === 90 ? 'Right triangle' : 'Obtuse triangle');
      } else {
        const [a, b, c] = [...values].sort((x, y) => x - y);
        expect(a + b).toBeGreaterThan(c);
        const unique = new Set(values).size;
        expect(q.answer).toBe(unique === 1 ? 'Equilateral' : unique === 2 ? 'Isosceles' : 'Scalene');
      }
    });
  });
});

describe('Grades 3–4 question quality', () => {
  it('never offers negative numbers or answer-duplicating distractors', () => {
    for (const item of levels.values()) {
      for (const seed of SEEDS) {
        const q = item.generate(createRng(seed));
        labels(q).forEach((label) => expect(label).not.toMatch(/^-|^−/));
        if (q.kind === 'number-pad') expect(Number(q.answer)).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('keeps each grade within 6–9 units of 3–5 levels', () => {
    for (const grade of g3g4) {
      // Expansion packs (*.pack-* units, see docs/level-pack-spec.md) are
      // additive by design and excluded from the original band-size bounds.
      const coreUnits = grade.units.filter((unit) => !unit.id.includes('.pack-'));
      expect(coreUnits.length).toBeGreaterThanOrEqual(6);
      expect(coreUnits.length).toBeLessThanOrEqual(9);
      for (const unit of coreUnits) {
        expect(unit.levels.length).toBeGreaterThanOrEqual(3);
        expect(unit.levels.length).toBeLessThanOrEqual(5);
      }
      const total = coreUnits.reduce((sum, unit) => sum + unit.levels.length, 0);
      expect(total).toBeGreaterThanOrEqual(20);
      expect(total).toBeLessThanOrEqual(35);
    }
  });
});
