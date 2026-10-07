import { createRng } from '../src/core/rng';
import type { Frac } from '../src/curriculum/g5/math';
import { g5 } from '../src/curriculum/g5';
import { decLabel, fracLabel, gcd, roundDecimal, simplify } from '../src/curriculum/g5/math';
import type { LevelDef, Question } from '../src/core/types';

const levels = g5[0].units.flatMap((unit) => unit.levels);
const getLevel = (id: string): LevelDef => {
  const found = levels.find((item) => item.id === id);
  if (!found) throw new Error(`Missing level ${id}`);
  return found;
};
const generate = (id: string, seed: number): Question => getLevel(id).generate(createRng(seed));

function fraction(n: number, d: number): Frac {
  if (d < 0) return fraction(-n, -d);
  const divisor = gcd(n, d);
  return { n: n / divisor, d: d / divisor };
}

function sameFraction(a: Frac, b: Frac): boolean {
  return a.n * b.d === b.n * a.d;
}

function parseFraction(label: string): Frac | null {
  const mixed = label.match(/^(\d+) (\d+)\/(\d+)$/);
  if (mixed) return fraction(Number(mixed[1]) * Number(mixed[3]) + Number(mixed[2]), Number(mixed[3]));
  const simple = label.match(/^(-?\d+)\/(\d+)$/);
  if (simple) return fraction(Number(simple[1]), Number(simple[2]));
  const decimal = label.match(/^(-?\d+)(?:\.(\d+))?$/);
  if (!decimal) return null;
  const places = decimal[2]?.length ?? 0;
  const scale = 10 ** places;
  return fraction(Number(decimal[1]) * scale + Number(decimal[2] ?? '0'), scale);
}

function assertFractionLabel(label: string, expected: Frac): void {
  const actual = parseFraction(label);
  expect(actual).not.toBeNull();
  expect(sameFraction(actual!, expected)).toBe(true);
}

function evaluate(expression: string): number {
  const tokens = expression.match(/\d+|[()[\]×÷+−]/g) ?? [];
  let index = 0;
  const factor = (): number => {
    const token = tokens[index++];
    if (/^\d+$/.test(token)) return Number(token);
    if (token === '(' || token === '[') {
      const value = sum();
      const close = tokens[index++];
      if ((token === '(' && close !== ')') || (token === '[' && close !== ']')) throw new Error(expression);
      return value;
    }
    throw new Error(expression);
  };
  const product = (): number => {
    let value = factor();
    while (tokens[index] === '×' || tokens[index] === '÷') {
      const operation = tokens[index++];
      const next = factor();
      value = operation === '×' ? value * next : value / next;
    }
    return value;
  };
  const sum = (): number => {
    let value = product();
    while (tokens[index] === '+' || tokens[index] === '−') {
      const operation = tokens[index++];
      const next = product();
      value = operation === '+' ? value + next : value - next;
    }
    return value;
  };
  const result = sum();
  if (index !== tokens.length) throw new Error(expression);
  return result;
}

function parseKnownNumeric(label: string): Frac | null {
  if (/^\$\d+\.\d{2}$/.test(label)) {
    const [whole, cents] = label.slice(1).split('.');
    return fraction(Number(whole) * 100 + Number(cents), 100);
  }
  return parseFraction(label);
}

function allAnswers(id: string): Question[] {
  return Array.from({ length: 300 }, (_, index) => generate(id, index + 1));
}

describe('Grade 5 exact math helpers', () => {
  it('simplifies fractions and formats whole, proper, and mixed values', () => {
    expect(gcd(48, 18)).toBe(6);
    expect(simplify({ n: 18, d: 24 })).toEqual({ n: 3, d: 4 });
    expect(simplify({ n: 6, d: -8 })).toEqual({ n: -3, d: 4 });
    expect(fracLabel({ n: 12, d: 4 })).toBe('3');
    expect(fracLabel({ n: 9, d: 4 })).toBe('2 1/4');
    expect(fracLabel({ n: 3, d: 4 })).toBe('3/4');
  });

  it('formats and rounds decimal integers without floating point artifacts', () => {
    expect(decLabel(3476, 1000, 1)).toBe('3.476');
    expect(decLabel(3000, 1000, 2)).toBe('3.00');
    expect(roundDecimal(2995, 1000, 2)).toBe(3000);
    expect(decLabel(roundDecimal(2995, 1000, 2), 1000, 2)).toBe('3.00');
  });
});

describe('Grade 5 generator invariants', () => {
  it('evaluates every generated order-of-operations code exactly', () => {
    for (const question of allAnswers('g5.codes.order-of-ops')) {
      expect(Number(question.answer)).toBe(evaluate(question.visual!.text!));
    }
  });

  it('checks large-number multiplication, division, and remainders', () => {
    for (const question of allAnswers('g5.engine-room.multiply')) {
      const match = question.visual!.text!.match(/^(\d+) × (\d+)$/)!;
      expect(Number(question.answer)).toBe(Number(match[1]) * Number(match[2]));
    }
    for (const question of allAnswers('g5.engine-room.divide')) {
      const match = question.visual!.text!.match(/^(\d+) ÷ (\d+)$/)!;
      expect(Number(question.answer) * Number(match[2])).toBe(Number(match[1]));
    }
    for (const question of allAnswers('g5.engine-room.remainders')) {
      const [dividend, divisor] = question.visual!.text!.split(' ÷ ').map(Number);
      const [, quotient, remainder] = question.answer.match(/^(\d+) R (\d+)$/)!;
      expect(Number(quotient) * divisor + Number(remainder)).toBe(dividend);
      expect(Number(remainder)).toBeGreaterThan(0);
      expect(Number(remainder)).toBeLessThan(divisor);
    }
  });

  it('checks powers of ten and decimal operation results', () => {
    for (const question of allAnswers('g5.decimal-dock.powers-of-ten')) {
      const text = question.visual!.text!;
      const power = text.match(/^(\d+) × 10([¹²³⁴])$/);
      if (power) {
        const exponent = '¹²³⁴'.indexOf(power[2]) + 1;
        expect(Number(question.answer)).toBe(Number(power[1]) * 10 ** exponent);
      } else if (text.includes(' × 1000')) {
        const value = parseFraction(text.split(' × ')[0])!;
        expect(Number(question.answer) * value.d).toBe(value.n * 1000);
      } else if (text.includes(' × 100')) {
        const value = parseFraction(text.split(' × ')[0])!;
        expect(Number(question.answer) * value.d).toBe(value.n * 100);
      } else {
        const [value, divisor] = text.split(' ÷ ').map(Number);
        expect(Number(question.answer) * divisor).toBe(value);
      }
    }

    for (const question of allAnswers('g5.fuel-lab.add-sub')) {
      const [, a, operator, b] = question.prompt.match(/([\d.]+) ([+−]) ([\d.]+) = \?/)!;
      const left = parseFraction(a)!; const right = parseFraction(b)!;
      const expected = operator === '+'
        ? fraction(left.n * right.d + right.n * left.d, left.d * right.d)
        : fraction(left.n * right.d - right.n * left.d, left.d * right.d);
      assertFractionLabel(question.answer, expected);
    }
    for (const id of ['g5.fuel-lab.multiply', 'g5.fuel-lab.divide']) {
      for (const question of allAnswers(id)) {
        const text = question.prompt.match(/([\d.]+) ([×÷]) ([\d.]+) = \?/)!;
        const a = parseFraction(text[1])!; const b = parseFraction(text[3])!;
        const expected = text[2] === '×'
          ? fraction(a.n * b.n, a.d * b.d)
          : fraction(a.n * b.d, a.d * b.n);
        assertFractionLabel(question.answer, expected);
      }
    }
  });

  it('matches each thousandths decimal with its expanded form', () => {
    for (const question of allAnswers('g5.decimal-dock.decimal-forms')) {
      expect(question.pairs).toHaveLength(3);
      for (const pair of question.pairs!) {
        const decimal = pair.left.match(/^0\.(\d)(\d)(\d)$/)!;
        const expanded = pair.right.match(/^(\d) × 0\.1 \+ (\d) × 0\.01 \+ (\d) × 0\.001$/)!;
        expect(expanded.slice(1)).toEqual(decimal.slice(1));
      }
    }
  });

  it('rounds decimals correctly and orders decimal codes strictly', () => {
    for (const question of allAnswers('g5.decimal-dock.compare-round')) {
      if (question.prompt.startsWith('Which reading')) {
        const labels = ['0.5', '0.45', '0.405', '0.054'];
        const values = labels.map((label) => parseFraction(label)!.n / parseFraction(label)!.d);
        const answer = labels[values.indexOf(question.prompt.includes('greatest') ? Math.max(...values) : Math.min(...values))];
        expect(question.answer).toBe(answer);
      } else {
        const [, value, place] = question.prompt.match(/Round ([\d.]+) to the nearest (whole number|tenth|hundredth)/)!;
        const exact = parseFraction(value)!;
        const thousandths = Math.round(exact.n * 1000 / exact.d);
        const digits = place === 'whole number' ? 0 : place === 'tenth' ? 1 : 2;
        const factor = 10 ** (3 - digits);
        const rounded = Math.floor((thousandths + factor / 2) / factor) * factor;
        expect(question.answer).toBe(decLabel(rounded, 1000, digits));
      }
    }
    for (const question of allAnswers('g5.decimal-dock.order')) {
      const values = question.sequence!.map((value) => {
        const exact = parseFraction(value)!;
        return exact.n / exact.d;
      });
      for (let index = 1; index < values.length; index += 1) expect(values[index]).toBeGreaterThan(values[index - 1]);
    }
  });

  it('re-derives unlike-fraction and mixed-number answers from each prompt', () => {
    for (const id of ['g5.fraction-reactor.add-unlike', 'g5.fraction-reactor.subtract-unlike']) {
      for (const question of allAnswers(id)) {
        const match = question.prompt.match(/(\d+)\/(\d+) ([+−]) (\d+)\/(\d+)/);
        expect(match).not.toBeNull();
        const [, a, b, operation, c, d] = match!;
        const numerator = operation === '+'
          ? Number(a) * Number(d) + Number(c) * Number(b)
          : Number(a) * Number(d) - Number(c) * Number(b);
        assertFractionLabel(question.answer, fraction(numerator, Number(b) * Number(d)));
      }
    }
    for (const question of allAnswers('g5.fraction-reactor.mixed-numbers')) {
      const match = question.prompt.match(/Merge (\d+) (\d+)\/(\d+) ([+−]) (\d+) (\d+)\/(\d+)/)!;
      const first = { n: Number(match[1]) * Number(match[3]) + Number(match[2]), d: Number(match[3]) };
      const second = { n: Number(match[5]) * Number(match[7]) + Number(match[6]), d: Number(match[7]) };
      const result = match[4] === '+'
        ? fraction(first.n * second.d + second.n * first.d, first.d * second.d)
        : fraction(first.n * second.d - second.n * first.d, first.d * second.d);
      assertFractionLabel(question.answer, result);
    }
  });

  it('re-derives fraction products and unit-fraction division answers', () => {
    for (const question of allAnswers('g5.gravity-lab.multiply')) {
      const pair = question.prompt.match(/(\d+)\/(\d+) × (\d+)\/(\d+)/);
      if (pair) {
        assertFractionLabel(question.answer, fraction(Number(pair[1]) * Number(pair[3]), Number(pair[2]) * Number(pair[4])));
      } else {
        const whole = question.prompt.match(/(\d+)\/(\d+) × (\d+) = \?/)!;
        assertFractionLabel(question.answer, fraction(Number(whole[1]) * Number(whole[3]), Number(whole[2])));
      }
    }
    for (const question of allAnswers('g5.gravity-lab.mixed-multiply')) {
      const [, aw, an, ad, bw, bn, bd] = question.prompt.match(/(\d+) (\d+)\/(\d+) × (\d+) (\d+)\/(\d+)/)!;
      const first = Number(aw) * Number(ad) + Number(an);
      const second = Number(bw) * Number(bd) + Number(bn);
      assertFractionLabel(question.answer, fraction(first * second, Number(ad) * Number(bd)));
    }
    for (const question of allAnswers('g5.gravity-lab.divide-unit')) {
      let numerator: number; let denominator: number;
      const share = question.prompt.match(/Split (\d+)\/(\d+).*?(\d+) crew/);
      const juice = question.prompt.match(/Share (\d+)\/(\d+) L.*?(\d+) crew/);
      const scoops = question.prompt.match(/How many (\d+)\/(\d+)-cup scoops fill (\d+) cups/);
      const packs = question.prompt.match(/How many (\d+)\/(\d+)-unit packs fit into (\d+) units/);
      if (share || juice) {
        const data = share ?? juice!;
        numerator = Number(data[1]);
        denominator = Number(data[2]) * Number(data[3]);
      } else if (scoops || packs) {
        const data = scoops ?? packs!;
        numerator = Number(data[3]) * Number(data[2]);
        denominator = Number(data[1]);
      } else {
        throw new Error(`Unrecognized unit-fraction prompt: ${question.prompt}`);
      }
      assertFractionLabel(question.answer, fraction(numerator, denominator));
    }
  });

  it('checks volume, additive volume, conversions, and triangle angle classifications', () => {
    for (const question of allAnswers('g5.cargo-hold.volume')) {
      const cubes = question.visual!.text!.match(/(\d+) rows × (\d+) cubes × (\d+) layers/);
      if (cubes) expect(Number(question.answer)).toBe(Number(cubes[1]) * Number(cubes[2]) * Number(cubes[3]));
      else {
        const dims = question.visual!.text!.match(/(\d+) × (\d+) × (\d+) cm³/)!;
        expect(Number(question.answer)).toBe(Number(dims[1]) * Number(dims[2]) * Number(dims[3]));
      }
    }
    for (const question of allAnswers('g5.cargo-hold.additive-volume')) {
      const prism = question.visual!.text!.match(/Module A: (\d+) × (\d+) × (\d+)\nModule B: (\d+) × (\d+) × (\d+)/);
      if (prism) {
        const [, a, b, c, d, e, f] = prism;
        expect(Number(question.answer)).toBe(Number(a) * Number(b) * Number(c) + Number(d) * Number(e) * Number(f));
      } else {
        const missing = question.visual!.text!.match(/(\d+) × (\d+) × \? = (\d+) cm³/)!;
        expect(Number(question.answer) * Number(missing[1]) * Number(missing[2])).toBe(Number(missing[3]));
      }
    }
    for (const question of allAnswers('g5.cargo-hold.convert')) {
      const text = question.visual!.text!;
      const match = text.match(/^(\d+) (km|m|kg|L|ft|yd|gal|lb) = \? (m|cm|g|mL|in|qt|pt|cups|oz)$/);
      const duration = text.match(/^(\d+) h (\d+) min = \? min$/);
      const combined = text.match(/^(\d+) m (\d+) cm = \? cm$/);
      let expected: number;
      if (duration) expected = Number(duration[1]) * 60 + Number(duration[2]);
      else if (combined) expected = Number(combined[1]) * 100 + Number(combined[2]);
      else {
        expect(match).not.toBeNull();
        const amount = Number(match![1]); const from = match![2]; const to = match![3];
        const factors: Record<string, number> = {
          km: 1000, m: 100, kg: 1000, L: 1000, ft: 12, yd: 36,
          gal: to === 'qt' ? 4 : to === 'pt' ? 8 : 16, lb: 16,
        };
        expected = amount * factors[from];
        if (from === 'm' && to === 'cm') expected = amount * 100;
      }
      expect(Number(question.answer)).toBe(expected);
    }
    const triangles = allAnswers('g5.star-map.triangles');
    for (const question of triangles) {
      for (const pair of question.pairs!) {
        const angles = [...pair.left.matchAll(/(\d+)°/g)].map((match) => Number(match[1]));
        expect(angles.reduce((sum, angle) => sum + angle, 0)).toBe(180);
        const rightAngle = angles.includes(90);
        const equalSides = new Set(angles).size < 3;
        const obtuse = angles.some((angle) => angle > 90);
        const classification = obtuse ? 'Obtuse isosceles'
          : rightAngle && equalSides ? 'Right isosceles'
            : rightAngle ? 'Right scalene'
              : equalSides ? 'Equilateral' : 'Acute scalene';
        expect(pair.right).toBe(classification);
      }
    }
  });

  it('re-derives sample line-plot totals, differences, and equal shares', () => {
    for (const question of allAnswers('g5.cargo-hold.line-plot')) {
      const entries = [...question.prompt.matchAll(/(\d+)\/8 kg \| (✕+)/g)].map((match) => ({
        eighths: Number(match[1]),
        count: match[2].length,
      }));
      const totalEighths = entries.reduce((sum, entry) => sum + entry.eighths * entry.count, 0);
      const totalCount = entries.reduce((sum, entry) => sum + entry.count, 0);
      if (question.prompt.includes('total mass')) {
        assertFractionLabel(question.answer, fraction(totalEighths, 8));
      } else if (question.prompt.includes('difference between')) {
        assertFractionLabel(question.answer, fraction(entries[entries.length - 1].eighths - entries[0].eighths, 8));
      } else {
        const beakers = Number(question.prompt.match(/shared equally among (\d+) beakers/)![1]);
        expect(beakers).toBe(totalCount);
        assertFractionLabel(question.answer, fraction(totalEighths, 8 * beakers));
      }
    }
  });

  it('checks fraction mission arithmetic and exact credit-budget change', () => {
    for (const question of allAnswers('g5.missions.fraction-mission')) {
      const route = question.prompt.match(/travels (\d+)\/(\d+) km, then (\d+)\/(\d+) km/);
      const batches = question.prompt.match(/Each space café batch needs (\d+)\/(\d+) cup.*?(\d+) batches/);
      if (route) {
        const answer = fraction(Number(route[1]) * Number(route[4]) + Number(route[3]) * Number(route[2]), Number(route[2]) * Number(route[4]));
        assertFractionLabel(question.answer, answer);
      } else if (batches) {
        assertFractionLabel(question.answer, fraction(Number(batches[1]) * Number(batches[3]), Number(batches[2])));
      } else {
        expect(question.prompt).toContain('1/3 of the remaining 3/4');
        assertFractionLabel(question.answer, fraction(1, 4));
      }
    }
    for (const question of allAnswers('g5.missions.decimal-budget')) {
      const match = question.prompt.match(/each food pouch for \$(\d+)\.(\d{2}).*?buys (\d+).*?pays \$(\d+)\.(\d{2})/)!;
      const price = Number(match[1]) * 100 + Number(match[2]);
      const quantity = Number(match[3]);
      const payment = Number(match[4]) * 100 + Number(match[5]);
      const change = payment - price * quantity;
      expect(question.answer).toBe(`$${Math.floor(change / 100)}.${String(change % 100).padStart(2, '0')}`);
    }
  });

  it('checks benchmark statements and plotted coordinates', () => {
    for (const question of allAnswers('g5.fraction-reactor.reasonable')) {
      const match = question.prompt.match(/(\d+)\/(\d+) \+ (\d+)\/(\d+) is (greater than|less than) (\d+(?:\/\d+)?)/)!;
      const sum = fraction(Number(match[1]) * Number(match[4]) + Number(match[3]) * Number(match[2]), Number(match[2]) * Number(match[4]));
      const benchmark = parseFraction(match[6])!;
      const comparison = sum.n * benchmark.d - benchmark.n * sum.d;
      expect(question.answer).toBe(String(match[5] === 'greater than' ? comparison > 0 : comparison < 0));
    }
    for (const question of allAnswers('g5.star-map.read-point')) {
      const answer = question.answer.match(/^\((\d+), (\d+)\)$/)!;
      const prompt = question.prompt.match(/origin, go (\d+) units right and (\d+) units up/)
        ?? question.prompt.match(/at \((\d+), (\d+)\). Move 2 right and 3 up/);
      if (question.prompt.includes('origin')) {
        expect(answer[1]).toBe(prompt![1]);
        expect(answer[2]).toBe(prompt![2]);
      } else {
        expect(Number(answer[1])).toBe(Number(prompt![1]) + 2);
        expect(Number(answer[2])).toBe(Number(prompt![2]) + 3);
      }
    }
  });

  it('keeps all generated choice sets valid and true-false levels balanced', () => {
    for (const level of levels) {
      const truthValues = new Set<string>();
      for (let seed = 1; seed <= 300; seed += 1) {
        const question = level.generate(createRng(seed));
        if (question.kind === 'multiple-choice') {
          expect(question.options).toHaveLength(4);
          const answer = question.options!.find((option) => option.id === question.answer)!;
          const parsedAnswer = parseKnownNumeric(answer.label);
          for (const option of question.options!) {
            const parsed = parseKnownNumeric(option.label);
            if (parsed) expect(parsed.n).toBeGreaterThanOrEqual(0);
            if (option.id !== question.answer && parsed && parsedAnswer) expect(sameFraction(parsed, parsedAnswer)).toBe(false);
          }
        } else if (question.kind === 'number-pad') {
          expect(Number(question.answer)).toBeGreaterThanOrEqual(0);
        } else if (question.kind === 'true-false') {
          truthValues.add(question.answer);
        }
      }
      if (level.kind === 'true-false') expect(truthValues).toEqual(new Set(['true', 'false']));
    }
  });
});
