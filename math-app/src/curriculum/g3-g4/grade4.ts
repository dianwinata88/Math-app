import { pick, randInt, shuffle } from '../../core/rng';
import type { GradeDef, Rng } from '../../core/types';
import { level, matchPairs, numPad, orderSeq, trueFalse } from '../helpers';
import { g4Pack } from './g4-pack';
import { dec, fmt, gcd, labelMc, name, numMc } from './util';

/* Grade 4 world: Dragon Kingdom 🐉 — castles, knights, wizards and dragon treasure. */

const PLACES = [
  { value: 10, label: 'ten' },
  { value: 100, label: 'hundred' },
  { value: 1000, label: 'thousand' },
  { value: 10000, label: 'ten thousand' },
  { value: 100000, label: 'hundred thousand' },
] as const;

/** A number with all-different digits and a non-zero leading digit. */
function distinctDigitNumber(rng: Rng, length: number): string {
  const digits = shuffle(rng, ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']).slice(0, length);
  if (digits[0] === '0') [digits[0], digits[1]] = [digits[1], digits[0]];
  return digits.join('');
}

function castlePlaceValue() {
  return {
    id: 'g4.place-value',
    title: 'Castle Place Value',
    emoji: '🏰',
    domain: 'place-value' as const,
    levels: [
      level('g4.place-value.digit-value', 'Digit Treasure', 'multiple-choice', 1, (rng) => {
        const digits = distinctDigitNumber(rng, randInt(rng, 5, 7));
        const positions = [...digits].map((digit, index) => ({ digit: Number(digit), power: digits.length - 1 - index })).filter((item) => item.digit !== 0);
        const { digit, power } = pick(rng, positions);
        const answer = digit * 10 ** power;
        return numMc(
          `The dragon's treasure has ${fmt(Number(digits))} gems. What is the value of the digit ${digit}?`,
          answer,
          [digit * 10 ** (power + 1), power > 0 ? digit * 10 ** (power - 1) : digit * 100, digit, digit * 10 ** (power + 2)],
          rng,
          { visual: { text: fmt(Number(digits)) } },
        );
      }),
      level('g4.place-value.compare', 'Compare Big Numbers', 'true-false', 1, (rng) => {
        const digits = [...distinctDigitNumber(rng, randInt(rng, 4, 7))];
        let index = randInt(rng, 0, digits.length - 2);
        if (index === 0 && digits[1] === '0') index = 1;
        const swapped = [...digits];
        [swapped[index], swapped[index + 1]] = [swapped[index + 1], swapped[index]];
        const a = Number(digits.join(''));
        const b = Number(swapped.join(''));
        const symbol = rng() < 0.5 ? '>' : '<';
        return trueFalse(`True or false? ${fmt(a)} ${symbol} ${fmt(b)}`, symbol === '>' ? a > b : a < b, {
          visual: { text: `${fmt(a)} ${symbol} ${fmt(b)}` },
          hint: 'Compare digits from the left until they are different.',
        });
      }),
      level('g4.place-value.round', 'Round Any Place', 'multiple-choice', 2, (rng) => {
        let value = randInt(rng, 10000, 999999);
        const place = pick(rng, PLACES.filter((item) => item.value * 10 <= value));
        if (value % place.value === 0) value += randInt(rng, 1, place.value - 1);
        const down = Math.floor(value / place.value) * place.value;
        const answer = Math.round(value / place.value) * place.value;
        const other = answer === down ? down + place.value : down;
        return numMc(
          `Round ${fmt(value)} to the nearest ${place.label}.`,
          answer,
          [other, Math.round(value / (place.value * 10)) * place.value * 10, answer + place.value, answer - place.value],
          rng,
          { hint: 'Look at the digit just to the right of the rounding place.' },
        );
      }),
      level('g4.place-value.order', 'Order the Hoard', 'order-sequence', 3, (rng) => {
        const thousands = randInt(rng, 100, 989);
        const values = new Set<number>();
        while (values.size < 4) values.add(randInt(rng, thousands * 1000, (thousands + 10) * 1000 - 1));
        return orderSeq('Order the dragon hoards from least to greatest.', [...values].sort((a, b) => a - b).map(fmt));
      }),
    ],
  };
}

function knightCalculations() {
  return {
    id: 'g4.calculations',
    title: "Knight's Calculations",
    emoji: '⚔️',
    domain: 'operations' as const,
    levels: [
      level('g4.calculations.add', 'Big Sums', 'number-pad', 1, (rng) => {
        const a = randInt(rng, 1000, 600000);
        const b = randInt(rng, 1000, 1000000 - a);
        return numPad(`The kingdom has ${fmt(a)} sheep in the north and ${fmt(b)} in the south. How many sheep in all?`, a + b, {
          visual: { text: `${fmt(a)} + ${fmt(b)}` },
        });
      }),
      level('g4.calculations.subtract', 'Big Differences', 'number-pad', 2, (rng) => {
        const a = randInt(rng, 10000, 1000000);
        const b = randInt(rng, 1000, a - 1);
        return numPad(`A dragon guards ${fmt(a)} coins. Knights carry away ${fmt(b)}. How many coins are left?`, a - b, {
          visual: { text: `${fmt(a)} − ${fmt(b)}` },
          hint: 'Line up the place values and regroup carefully across zeros.',
        });
      }),
      level('g4.calculations.multiply-4x1', '4-Digit × 1-Digit', 'number-pad', 2, (rng) => {
        const a = randInt(rng, 1000, 9999);
        const b = randInt(rng, 2, 9);
        return numPad(`What is ${fmt(a)} × ${b}?`, a * b, {
          visual: { text: `${fmt(a)} × ${b}` },
          hint: `Break ${fmt(a)} into thousands, hundreds, tens and ones. Multiply each by ${b}, then add.`,
        });
      }),
      level('g4.calculations.multiply-2x2', '2-Digit × 2-Digit', 'number-pad', 3, (rng) => {
        const a = randInt(rng, 11, 99);
        const b = randInt(rng, 11, 99);
        const tens = Math.floor(b / 10) * 10;
        return numPad(`What is ${a} × ${b}?`, a * b, {
          visual: { text: `${a} × ${b}` },
          hint: `${a} × ${b} = ${a} × ${tens} + ${a} × ${b - tens}`,
        });
      }),
    ],
  };
}

const ROOM_STORIES = [
  (total: number, size: number) => ({ text: `${total} knights need rooms in the tower. Each room sleeps ${size}. How many rooms are needed?`, ask: 'up' }),
  (total: number, size: number) => ({ text: `${total} dragon eggs are packed in cartons of ${size}. How many full cartons are there?`, ask: 'down' }),
  (total: number, size: number) => ({ text: `${total} cookies are packed in boxes of ${size}. How many cookies are left over?`, ask: 'left' }),
  (total: number, size: number) => ({ text: `${total} players split into teams of ${size}. How many full teams can play?`, ask: 'down' }),
  (total: number, size: number) => ({ text: `${total} astronauts ride shuttles that hold ${size} each. How many shuttles are needed?`, ask: 'up' }),
] as const;

function dragonDivision() {
  return {
    id: 'g4.division',
    title: 'Dragon Egg Division',
    emoji: '🥚',
    domain: 'operations' as const,
    levels: [
      level('g4.division.remainders', 'Remainder Riddles', 'multiple-choice', 1, (rng) => {
        const divisor = randInt(rng, 2, 9);
        const quotient = randInt(rng, 2, 12);
        const remainder = randInt(rng, 1, divisor - 1);
        const dividend = quotient * divisor + remainder;
        return labelMc(
          `${dividend} eggs go into ${divisor} nests equally. What is ${dividend} ÷ ${divisor}?`,
          `${quotient} R ${remainder}`,
          [`${quotient + 1} R ${remainder}`, `${quotient - 1} R ${remainder + divisor}`, `${quotient} R ${remainder + 1 < divisor ? remainder + 1 : remainder - 1}`],
          rng,
          { visual: { text: `${dividend} ÷ ${divisor}` }, hint: 'The remainder must be smaller than the divisor.' },
        );
      }),
      level('g4.division.long-division', 'Long Division Lair', 'number-pad', 2, (rng) => {
        const divisor = randInt(rng, 2, 9);
        const form = randInt(rng, 0, 2);
        const remainder = form === 0 ? 0 : randInt(rng, 1, divisor - 1);
        const quotient = randInt(rng, Math.ceil(1000 / divisor), Math.floor((9999 - remainder) / divisor));
        const dividend = quotient * divisor + remainder;
        const ask = form === 2 ? 'remainder' : 'quotient';
        const prompt = form === 1 ? `${fmt(dividend)} ÷ ${divisor} = ? R ${remainder}. What is the quotient?` : `${fmt(dividend)} ÷ ${divisor}: what is the ${ask}?`;
        return numPad(prompt, form === 2 ? remainder : quotient, {
          visual: { text: `${fmt(dividend)} ÷ ${divisor}` },
          hint: 'Divide one place at a time: thousands, hundreds, tens, ones.',
        });
      }),
      level('g4.division.interpret', 'Leftover Logic', 'multiple-choice', 3, (rng) => {
        const size = randInt(rng, 3, 8);
        const quotient = randInt(rng, 2, 9);
        const remainder = randInt(rng, 1, size - 1);
        const total = quotient * size + remainder;
        const story = pick(rng, ROOM_STORIES)(total, size);
        const answer = story.ask === 'up' ? quotient + 1 : story.ask === 'down' ? quotient : remainder;
        return numMc(story.text, answer, [quotient, quotient + 1, remainder, size - remainder], rng, {
          hint: 'Think about what the leftover means in the story.',
        });
      }),
    ],
  };
}

const ODD_COMPOSITES = [21, 27, 33, 39, 49, 51, 57, 63, 69, 77, 81, 87, 91, 93] as const;
const PRIMES = [11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97] as const;
const PATTERN_EMOJI = ['🐉', '🔥', '🛡️', '⚔️', '👑', '💎', '🏰', '🧙'] as const;

function ruleTerms(kind: 'add' | 'subtract' | 'multiply', start: number, step: number, count: number): number[] {
  const terms = [start];
  while (terms.length < count) {
    const last = terms[terms.length - 1];
    terms.push(kind === 'add' ? last + step : kind === 'subtract' ? last - step : last * step);
  }
  return terms;
}

function wizardPatterns() {
  return {
    id: 'g4.patterns',
    title: 'Wizard Factors & Patterns',
    emoji: '🧙',
    domain: 'patterns' as const,
    levels: [
      level('g4.patterns.factors', 'Factor Spells', 'true-false', 1, (rng) => {
        const factor = randInt(rng, 2, 12);
        const isFactor = rng() < 0.5;
        const multiple = randInt(rng, 2, Math.floor(99 / factor));
        const number = isFactor ? factor * multiple : factor * multiple + randInt(rng, 1, factor - 1);
        const statement = rng() < 0.5 ? `${factor} is a factor of ${number}.` : `${number} is a multiple of ${factor}.`;
        return trueFalse(`True or false? ${statement}`, number % factor === 0, { hint: `Does ${factor} divide ${number} with no remainder?` });
      }),
      level('g4.patterns.rule-sequence', 'Follow the Rule', 'order-sequence', 1, (rng) => {
        const kind = pick(rng, ['add', 'add', 'subtract', 'multiply'] as const);
        const start = kind === 'add' ? randInt(rng, 1, 50) : kind === 'subtract' ? randInt(rng, 60, 100) : randInt(rng, 1, 4);
        const step = kind === 'multiply' ? randInt(rng, 2, 3) : randInt(rng, 2, 12);
        const rule = kind === 'add' ? `add ${step}` : kind === 'subtract' ? `subtract ${step}` : `multiply by ${step}`;
        return orderSeq(`Rule: start at ${start} and ${rule}. Tap the numbers in pattern order.`, ruleTerms(kind, start, step, 5).map(String));
      }),
      level('g4.patterns.prime-composite', 'Prime or Composite?', 'multiple-choice', 2, (rng) => {
        const askPrime = rng() < 0.5;
        const [answer, others] = askPrime
          ? [pick(rng, PRIMES), shuffle(rng, [...ODD_COMPOSITES]).slice(0, 3)]
          : [pick(rng, ODD_COMPOSITES), shuffle(rng, [...PRIMES]).slice(0, 3)];
        return labelMc(`Which number is ${askPrime ? 'prime' : 'composite'}?`, String(answer), others.map(String), rng, {
          hint: 'A prime number has exactly two factors: 1 and itself.',
        });
      }),
      level('g4.patterns.shape-pattern', 'Shape Pattern Magic', 'multiple-choice', 2, (rng) => {
        const pool = shuffle(rng, [...PATTERN_EMOJI]);
        const length = randInt(rng, 2, 4);
        const unit = pool.slice(0, length);
        const position = randInt(rng, length * 3 + 1, 30);
        const shown = Array.from({ length: length * 2 }, (_, index) => unit[index % length]);
        return labelMc(
          `The pattern repeats: ${shown.join(' ')} … What is shape number ${position}?`,
          unit[(position - 1) % length],
          [...unit, pool[length]],
          rng,
          { visual: { items: [...shown, '…'] }, hint: `The pattern repeats every ${length} shapes.` },
        );
      }),
      level('g4.patterns.rule-detective', 'Rule Detective', 'multiple-choice', 3, (rng) => {
        const kind = pick(rng, ['add', 'subtract', 'multiply'] as const);
        const start = kind === 'add' ? randInt(rng, 1, 30) : kind === 'subtract' ? randInt(rng, 60, 99) : randInt(rng, 1, 5);
        const step = kind === 'multiply' ? randInt(rng, 2, 3) : randInt(rng, 2, 12);
        const terms = ruleTerms(kind, start, step, 4);
        const answer = kind === 'add' ? `Add ${step}` : kind === 'subtract' ? `Subtract ${step}` : `Multiply by ${step}`;
        const wrong =
          kind === 'add'
            ? [`Add ${step + 1}`, `Subtract ${step}`, 'Multiply by 2', `Add ${step - 1}`]
            : kind === 'subtract'
              ? [`Subtract ${step + 1}`, `Add ${step}`, `Subtract ${step - 1}`]
              : [`Add ${start * step - start}`, `Multiply by ${step + 1}`, `Add ${start * step}`];
        return labelMc(`What is the rule? ${terms.join(', ')}, …`, answer, wrong, rng, {
          visual: { text: `${terms.join(', ')}, …` },
          hint: 'Check the rule works for EVERY step, not just the first one.',
        });
      }),
    ],
  };
}

const DENOMINATORS = [2, 3, 4, 5, 6, 8, 10, 12] as const;

function properFraction(rng: Rng, denominators: readonly number[] = DENOMINATORS): [number, number] {
  const d = pick(rng, denominators);
  return [randInt(rng, 1, d - 1), d];
}

function fractionHall() {
  return {
    id: 'g4.fractions',
    title: 'Fraction Feast Hall',
    emoji: '🥧',
    domain: 'fractions' as const,
    levels: [
      level('g4.fractions.equivalent', 'Equivalent Potions', 'number-pad', 1, (rng) => {
        let [a, b] = properFraction(rng);
        const shared = gcd(a, b);
        [a, b] = [a / shared, b / shared];
        const m = randInt(rng, 2, 5);
        const missingTop = rng() < 0.5;
        const text = missingTop ? `${a}/${b} = ?/${b * m}` : `${a}/${b} = ${a * m}/?`;
        return numPad(`Find the missing number: ${text}`, missingTop ? a * m : b * m, {
          visual: { text },
          hint: 'Multiply the top and bottom by the same number.',
        });
      }),
      level('g4.fractions.compare', 'Compare Unlike Fractions', 'multiple-choice', 2, (rng) => {
        let first = properFraction(rng);
        let second = properFraction(rng);
        while (first[1] === second[1] || first[0] * second[1] === second[0] * first[1]) {
          first = properFraction(rng);
          second = properFraction(rng);
        }
        const askGreater = rng() < 0.5;
        const firstBigger = first[0] * second[1] > second[0] * first[1];
        const [answer, other] = askGreater === firstBigger ? [first, second] : [second, first];
        return labelMc(
          `Which is ${askGreater ? 'greater' : 'smaller'}: ${first[0]}/${first[1]} or ${second[0]}/${second[1]}?`,
          `${answer[0]}/${answer[1]}`,
          [`${other[0]}/${other[1]}`, 'They are equal'],
          rng,
          { hint: 'Rename with a common denominator, or compare each to 1/2.' },
        );
      }),
      level('g4.fractions.add-subtract', 'Pie Plus & Minus', 'multiple-choice', 2, (rng) => {
        const d = randInt(rng, 3, 12);
        if (rng() < 0.5) {
          const a = randInt(rng, 1, d - 2);
          const b = randInt(rng, 1, d - a);
          return labelMc(
            `A dragon eats ${a}/${d} of a pie, then ${b}/${d} more. How much pie did it eat?`,
            `${a + b}/${d}`,
            [`${a + b}/${2 * d}`, ...(a !== b ? [`${Math.abs(a - b)}/${d}`] : []), `${a + b + 1}/${d}`],
            rng,
            { visual: { text: `${a}/${d} + ${b}/${d}` }, hint: 'Same denominator: add the numerators, keep the denominator.' },
          );
        }
        const a = randInt(rng, 2, d - 1);
        const b = randInt(rng, 1, a - 1);
        return labelMc(
          `There is ${a}/${d} of a pie. A knight eats ${b}/${d}. How much is left?`,
          `${a - b}/${d}`,
          [`${a + b}/${d}`, `${a - b + 1}/${d}`, `${a - b}/${d + 1}`],
          rng,
          { visual: { text: `${a}/${d} − ${b}/${d}` }, hint: 'Same denominator: subtract the numerators, keep the denominator.' },
        );
      }),
      level('g4.fractions.mixed-numbers', 'Mixed Number Magic', 'multiple-choice', 2, (rng) => {
        const d = randInt(rng, 2, 8);
        const whole = randInt(rng, 1, 5);
        const r = randInt(rng, 1, d - 1);
        const improper = whole * d + r;
        if (rng() < 0.5) {
          return labelMc(
            `Write ${improper}/${d} as a mixed number.`,
            `${whole} ${r}/${d}`,
            [`${whole + 1} ${r}/${d}`, ...(whole < d && whole !== r ? [`${r} ${whole}/${d}`] : []), ...(d - r !== r ? [`${whole} ${d - r}/${d}`] : []), `${whole} ${r}/${improper}`],
            rng,
            { visual: { text: `${improper}/${d}` }, hint: `How many groups of ${d} fit in ${improper}? The rest is the fraction.` },
          );
        }
        return labelMc(
          `Write ${whole} ${r}/${d} as a fraction.`,
          `${improper}/${d}`,
          [`${whole + r}/${d}`, `${whole * d}/${d}`, `${improper}/${whole * d}`, `${improper + d}/${d}`],
          rng,
          { visual: { text: `${whole} ${r}/${d}` }, hint: `${whole} wholes = ${whole * d}/${d}. Add ${r}/${d}.` },
        );
      }),
      level('g4.fractions.times-whole', 'Fraction × Whole', 'multiple-choice', 3, (rng) => {
        const n = randInt(rng, 2, 9);
        const [a, b] = properFraction(rng);
        const prompt = rng() < 0.5 ? `What is ${n} × ${a}/${b}?` : `Each of ${n} dragons eats ${a}/${b} of a pizza. How much pizza do they eat in all?`;
        return labelMc(prompt, `${n * a}/${b}`, [`${n * a}/${n * b}`, `${a}/${n * b}`, `${n + a}/${b}`, `${n * a + 1}/${b}`], rng, {
          visual: { text: `${n} × ${a}/${b}` },
          hint: `${n} × ${a}/${b} means ${n} groups of ${a}/${b}: multiply only the numerator.`,
        });
      }),
    ],
  };
}

function decimalTreasury() {
  return {
    id: 'g4.decimals',
    title: 'Decimal Treasury',
    emoji: '🪙',
    domain: 'decimals' as const,
    levels: [
      level('g4.decimals.tenths-hundredths', 'Tenths & Hundredths', 'multiple-choice', 1, (rng) => {
        const form = randInt(rng, 0, 2);
        const tenths = randInt(rng, 1, 9);
        const ones = randInt(rng, 1, 9);
        const value = form === 0 ? tenths * 10 : form === 1 ? randInt(rng, 1, 99) : tenths * 10 + ones;
        const words =
          form === 0 ? `${tenths} tenths` : form === 1 ? `${value} hundredth${value > 1 ? 's' : ''}` : `${tenths} tenths and ${ones} hundredths`;
        const swap = (value % 10) * 10 + Math.floor(value / 10);
        return labelMc(
          `Which decimal shows ${words}?`,
          dec(value),
          [value % 10 === 0 ? dec(value / 10) : dec(value * 10), dec(swap), dec(value * 10), dec(value + 100)],
          rng,
          { hint: '0.1 is one tenth. 0.01 is one hundredth.' },
        );
      }),
      level('g4.decimals.fraction-match', 'Fraction ↔ Decimal', 'match-pairs', 2, (rng) => {
        const [t1, t2] = shuffle(rng, [1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 2);
        const other = randInt(rng, 11, 99);
        const hundredths = [t1, other % 10 === 0 ? other + 1 : other];
        return matchPairs('Match each fraction to its decimal.', [
          { left: `${t1}/10`, right: dec(t1 * 10) },
          { left: `${t2}/10`, right: dec(t2 * 10) },
          ...hundredths.map((value) => ({ left: `${value}/100`, right: dec(value) })),
        ]);
      }),
      level('g4.decimals.compare', 'Compare Decimals', 'true-false', 2, (rng) => {
        const whole = rng() < 0.3 ? randInt(rng, 1, 3) * 100 : 0;
        const tenths = whole + randInt(rng, 1, 9) * 10;
        const hundredths = whole + randInt(rng, 1, 9) * 10 + randInt(rng, 1, 9);
        const [x, y] = rng() < 0.5 ? [tenths, hundredths] : [hundredths, tenths];
        const symbol = rng() < 0.5 ? '>' : '<';
        return trueFalse(`True or false? ${dec(x)} ${symbol} ${dec(y)}`, symbol === '>' ? x > y : x < y, {
          visual: { text: `${dec(x)} ${symbol} ${dec(y)}` },
          hint: 'Write both with two decimal places: 0.5 = 0.50.',
        });
      }),
      level('g4.decimals.order', 'Order the Coins', 'order-sequence', 3, (rng) => {
        const base = randInt(rng, 0, 1) * 100 + randInt(rng, 1, 8) * 10;
        const values = new Set<number>([base, base + randInt(rng, 1, 9)]);
        while (values.size < 4) {
          const value = randInt(rng, 1, 199);
          if (value % 100 !== 0) values.add(value);
        }
        return orderSeq('Order these decimals from least to greatest.', [...values].sort((a, b) => a - b).map(dec));
      }),
    ],
  };
}

function royalMeasures() {
  return {
    id: 'g4.measurement',
    title: 'Royal Measures',
    emoji: '📏',
    domain: 'measurement' as const,
    levels: [
      level('g4.measurement.length', 'Length Converter', 'number-pad', 1, (rng) => {
        const form = randInt(rng, 0, 3);
        if (form === 0) {
          const km = randInt(rng, 2, 9);
          return numPad(`The dragon flew ${km} km. How many meters is that?`, km * 1000, { hint: '1 km = 1,000 m' });
        }
        if (form === 1) {
          const m = randInt(rng, 2, 20);
          return numPad(`A castle wall is ${m} m tall. How many centimeters is that?`, m * 100, { hint: '1 m = 100 cm' });
        }
        if (form === 2) {
          const m = randInt(rng, 1, 9);
          const cm = randInt(rng, 1, 99);
          return numPad(`A knight's banner is ${m} m ${cm} cm long. How many centimeters is that?`, m * 100 + cm, { hint: '1 m = 100 cm' });
        }
        const km = randInt(rng, 1, 5);
        const m = randInt(rng, 1, 999);
        return numPad(`A race is ${km} km ${m} m long. How many meters is that?`, km * 1000 + m, { hint: '1 km = 1,000 m' });
      }),
      level('g4.measurement.mass-volume', 'Potion Scales', 'number-pad', 2, (rng) => {
        const form = randInt(rng, 0, 3);
        const big = randInt(rng, 2, 9);
        const small = randInt(rng, 1, 999);
        if (form === 0) return numPad(`A treasure chest has a mass of ${big} kg. How many grams is that?`, big * 1000, { hint: '1 kg = 1,000 g' });
        if (form === 1) return numPad(`A cauldron holds ${big} L of potion. How many milliliters is that?`, big * 1000, { hint: '1 L = 1,000 mL' });
        if (form === 2) return numPad(`A baby dragon weighs ${big} kg ${small} g. How many grams is that?`, big * 1000 + small, { hint: '1 kg = 1,000 g' });
        return numPad(`A fish tank holds ${big} L ${small} mL. How many milliliters is that?`, big * 1000 + small, { hint: '1 L = 1,000 mL' });
      }),
      level('g4.measurement.time', 'Time Converter', 'number-pad', 2, (rng) => {
        const form = randInt(rng, 0, 3);
        const a = randInt(rng, 2, 9);
        const b = randInt(rng, 1, 59);
        if (form === 0) return numPad(`The royal feast lasts ${a} hours. How many minutes is that?`, a * 60, { hint: '1 hour = 60 minutes' });
        if (form === 1) return numPad(`A wizard's spell lasts ${a} minutes. How many seconds is that?`, a * 60, { hint: '1 minute = 60 seconds' });
        if (form === 2) return numPad(`${name(rng)}'s soccer tournament lasts ${a} hours ${b} minutes. How many minutes is that?`, a * 60 + b, { hint: '1 hour = 60 minutes' });
        return numPad(`A dragon sleeps for ${a} days. How many hours is that?`, a * 24, { hint: '1 day = 24 hours' });
      }),
      level('g4.measurement.area-perimeter', 'Castle Floor Plans', 'number-pad', 3, (rng) => {
        const length = randInt(rng, 5, 25);
        const width = randInt(rng, 3, 20);
        const form = randInt(rng, 0, 4);
        if (form === 0) return numPad(`A throne room is ${length} m by ${width} m. What is its area in square meters?`, length * width, { hint: 'A = l × w' });
        if (form === 1) return numPad(`A dragon pen is ${length} m by ${width} m. What is its perimeter in meters?`, 2 * (length + width), { hint: 'P = 2 × (l + w)' });
        if (form === 2) {
          return numPad(`A garden has an area of ${length * width} square meters and a length of ${length} m. What is its width?`, width, { hint: 'w = A ÷ l' });
        }
        if (form === 3) {
          return numPad(`A courtyard has a perimeter of ${2 * (length + width)} m and a length of ${length} m. What is its width?`, width, { hint: 'w = P ÷ 2 − l' });
        }
        return numPad(`A square tower floor has a perimeter of ${4 * width} m. How long is each side?`, width, { hint: 'A square has 4 equal sides.' });
      }),
    ],
  };
}

const ANGLE_STORIES = [
  (degrees: number) => `The dragon opens its jaws to ${degrees}°.`,
  (degrees: number) => `The drawbridge is open at ${degrees}°.`,
  (degrees: number) => `A pizza slice has a ${degrees}° corner.`,
  (degrees: number) => `A skateboard ramp makes a ${degrees}° angle.`,
] as const;

const LINE_CLUES: [string, string][] = [
  ['Railroad tracks', 'Parallel'],
  ['The two lines of an = sign', 'Parallel'],
  ['The top and bottom edges of a door', 'Parallel'],
  ['Lines that never meet and stay the same distance apart', 'Parallel'],
  ['The lines in the letter T', 'Perpendicular'],
  ['The corner of a book page', 'Perpendicular'],
  ['The two lines of a plus sign +', 'Perpendicular'],
  ['Lines that cross to make 4 right angles', 'Perpendicular'],
  ['The blades of open scissors', 'Intersecting, not perpendicular'],
  ['Lines that cross but make no right angles', 'Intersecting, not perpendicular'],
  ['The two sides of the letter V', 'Intersecting, not perpendicular'],
];

const SYMMETRY_FACTS: [string, boolean][] = [
  ['A square has 4 lines of symmetry.', true],
  ['A rectangle that is not a square has 4 lines of symmetry.', false],
  ['A rectangle that is not a square has 2 lines of symmetry.', true],
  ['The letter A has a line of symmetry.', true],
  ['The letter F has a line of symmetry.', false],
  ['The letter H has a line of symmetry.', true],
  ['The letter Z has a line of symmetry.', false],
  ['The letter M has a line of symmetry.', true],
  ['The letter J has a line of symmetry.', false],
  ['A circle has many lines of symmetry.', true],
  ['An equilateral triangle has 3 lines of symmetry.', true],
  ['A scalene triangle has a line of symmetry.', false],
  ['A heart shape ❤️ has a line of symmetry.', true],
];

const TURN_FRACTIONS = [2, 3, 4, 6, 8, 10, 12] as const;

function angleTower() {
  return {
    id: 'g4.geometry',
    title: 'Angle Tower',
    emoji: '📐',
    domain: 'geometry' as const,
    levels: [
      level('g4.geometry.angle-types', 'Angle Types', 'multiple-choice', 1, (rng) => {
        const roll = rng();
        const degrees = roll < 0.15 ? 90 : roll < 0.25 ? 180 : randInt(rng, 4, 34) * 5;
        const answer = degrees < 90 ? 'Acute' : degrees === 90 ? 'Right' : degrees < 180 ? 'Obtuse' : 'Straight';
        return labelMc(`${pick(rng, ANGLE_STORIES)(degrees)} What kind of angle is it?`, answer, ['Acute', 'Right', 'Obtuse', 'Straight'], rng, {
          hint: 'Acute < 90° < Obtuse < 180°',
        });
      }),
      level('g4.geometry.angle-math', 'Angle Math', 'number-pad', 2, (rng) => {
        const form = randInt(rng, 0, 4);
        if (form === 0) {
          const parts = pick(rng, TURN_FRACTIONS);
          const k = randInt(rng, 1, parts - 1);
          return numPad(`A wizard turns ${k}/${parts} of a full circle. How many degrees is that?`, (360 / parts) * k, { hint: 'A full turn is 360°.' });
        }
        if (form === 1) {
          const hour = randInt(rng, 1, 6);
          return numPad(`A clock's minute hand moves from the 12 to the ${hour}. How many degrees does it turn?`, hour * 30, { hint: 'Each number on a clock is 30° apart.' });
        }
        if (form === 2) {
          const part = randInt(rng, 10, 80);
          return numPad(`A right angle is split into two angles. One is ${part}°. What is the other?`, 90 - part, { hint: 'A right angle is 90°.' });
        }
        if (form === 3) {
          const part = randInt(rng, 15, 165);
          return numPad(`A straight line is split into two angles. One is ${part}°. What is the other?`, 180 - part, { hint: 'A straight angle is 180°.' });
        }
        const a = randInt(rng, 15, 85);
        const b = randInt(rng, 15, 85);
        return numPad(`Two angles of ${a}° and ${b}° sit side by side. What is the total angle?`, a + b, { hint: 'Angles that share a side add together.' });
      }),
      level('g4.geometry.lines', 'Line Lookout', 'multiple-choice', 2, (rng) => {
        const [clue, answer] = pick(rng, LINE_CLUES);
        return labelMc(`${clue}: what kind of lines are these?`, answer, ['Parallel', 'Perpendicular', 'Intersecting, not perpendicular'], rng);
      }),
      level('g4.geometry.symmetry', 'Mirror Magic', 'true-false', 2, (rng) => {
        const [statement, truth] = pick(rng, SYMMETRY_FACTS);
        return trueFalse(`True or false? ${statement}`, truth, { hint: 'A line of symmetry folds a shape into two matching halves.' });
      }),
      level('g4.geometry.triangles', 'Triangle Trials', 'multiple-choice', 3, (rng) => {
        if (rng() < 0.6) {
          const kind = randInt(rng, 0, 2);
          let a: number;
          let b: number;
          if (kind === 0) {
            a = randInt(rng, 50, 80);
            b = randInt(rng, Math.max(91 - a, 20), 80);
          } else if (kind === 1) {
            a = 90;
            b = randInt(rng, 15, 75);
          } else {
            a = randInt(rng, 95, 150);
            b = randInt(rng, 10, 170 - a);
          }
          const angles = shuffle(rng, [a, b, 180 - a - b]);
          const largest = Math.max(...angles);
          const answer = largest < 90 ? 'Acute triangle' : largest === 90 ? 'Right triangle' : 'Obtuse triangle';
          return labelMc(`A triangle has angles of ${angles.join('°, ')}°. What kind of triangle is it?`, answer, ['Acute triangle', 'Right triangle', 'Obtuse triangle'], rng, {
            hint: 'Look at the biggest angle.',
          });
        }
        const kind = randInt(rng, 0, 2);
        const s = randInt(rng, 3, 12);
        let sides: number[];
        if (kind === 0) sides = [s, s, s];
        else if (kind === 1) sides = [s, s, s === 3 ? 4 : s - randInt(rng, 1, 2)];
        else sides = [s, s + 1, s + 2];
        const unique = new Set(sides).size;
        const answer = unique === 1 ? 'Equilateral' : unique === 2 ? 'Isosceles' : 'Scalene';
        return labelMc(`A triangle has sides of ${shuffle(rng, sides).join(' cm, ')} cm. What kind of triangle is it?`, answer, ['Equilateral', 'Isosceles', 'Scalene'], rng, {
          hint: 'Equilateral: 3 equal sides. Isosceles: 2 equal sides. Scalene: none equal.',
        });
      }),
    ],
  };
}

export const g4: GradeDef = {
  id: 'g4',
  title: 'Grade 4',
  ages: '9–10',
  units: [
    castlePlaceValue(),
    knightCalculations(),
    dragonDivision(),
    wizardPatterns(),
    fractionHall(),
    decimalTreasury(),
    royalMeasures(),
    angleTower(),
    ...g4Pack,
  ],
};
