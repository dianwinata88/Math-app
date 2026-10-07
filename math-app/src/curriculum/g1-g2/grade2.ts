import { pick, randInt, randInts, shuffle } from '../../core/rng';
import type { GradeDef } from '../../core/types';
import { level, matchPairs, mc, numPad, orderSeq, trueFalse } from '../helpers';
import {
  formatCents,
  formatDollars,
  measurementFacts,
  numericDistractors,
  reefAnimals,
} from './shared';

const formatTime = (hour: number, minute: number) => `${hour}:${String(minute).padStart(2, '0')}`;
const nounWithCount = (count: number, item: { singular: string; plural: string }) => `${count} ${count === 1 ? item.singular : item.plural}`;
const reefStoryObjects = [
  { singular: 'soccer ball', plural: 'soccer balls', emoji: '⚽' },
  { singular: 'rocket', plural: 'rockets', emoji: '🚀' },
  { singular: 'cupcake', plural: 'cupcakes', emoji: '🧁' },
  { singular: 'shell', plural: 'shells', emoji: '🐚' },
];

export const grade2: GradeDef = {
  id: 'g2',
  title: 'Grade 2',
  ages: '7–8',
  units: [
    {
      id: 'g2.fluency',
      title: 'Dolphin Dash',
      emoji: '🐬',
      domain: 'operations',
      levels: [
        level('g2.fluency.add-facts', 'Addition Facts', 'multiple-choice', 1, (rng) => {
          const a = randInt(rng, 0, 15);
          const b = randInt(rng, 0, 20 - a);
          const answer = a + b;
          return mc(`${a} + ${b} = ?`, String(answer), numericDistractors(rng, answer, [answer - 1, answer + 1, a + b + 2], { min: 0, max: 20 }), rng);
        }),
        level('g2.fluency.subtract-facts', 'Subtraction Facts', 'number-pad', 1, (rng) => {
          const a = randInt(rng, 1, 20);
          const b = randInt(rng, 0, a);
          return numPad(`${a} − ${b} = ?`, a - b, { visual: { text: `${a} − ${b} =` } });
        }),
        level('g2.fluency.fact-family-match', 'Fact Family Match', 'match-pairs', 2, (rng) => {
          const results = randInts(rng, 3, 20, 3);
          const pairs = results.map((result) => {
            const a = randInt(rng, 1, result - 1);
            const b = result - a;
            const left = `${a} + ${b} = ${result}`;
            const right = rng() < 0.5 ? `${result} − ${b} = ${a}` : `${result} − ${a} = ${b}`;
            return { left, right };
          });
          return matchPairs('Match each addition fact to its related subtraction fact.', shuffle(rng, pairs));
        }),
      ],
    },
    {
      id: 'g2.within-100',
      title: 'Coral Carry Cove',
      emoji: '🪸',
      domain: 'operations',
      levels: [
        level('g2.within-100.regroup-add', 'Regrouping Addition', 'number-pad', 1, (rng) => {
          const tensA = randInt(rng, 1, 6);
          const onesA = randInt(rng, 2, 9);
          const tensB = randInt(rng, 1, 8 - tensA);
          const onesB = randInt(rng, 10 - onesA, 9);
          const a = tensA * 10 + onesA;
          const b = tensB * 10 + onesB;
          return numPad(`${a} + ${b} = ?`, a + b, { visual: { text: `${a} + ${b} =` }, hint: 'Add the ones, then regroup a ten' });
        }),
        level('g2.within-100.regroup-subtract', 'Regrouping Subtraction', 'number-pad', 2, (rng) => {
          const tensA = randInt(rng, 2, 9);
          const onesA = randInt(rng, 0, 8);
          const tensB = randInt(rng, 1, tensA - 1);
          const onesB = randInt(rng, onesA + 1, 9);
          const a = tensA * 10 + onesA;
          const b = tensB * 10 + onesB;
          return numPad(`${a} − ${b} = ?`, a - b, { visual: { text: `${a} − ${b} =` }, hint: 'Trade a ten for 10 ones' });
        }),
        level('g2.within-100.reef-stories', 'Reef Stories', 'multiple-choice', 2, (rng) => {
          const animals = shuffle(rng, reefAnimals.filter((item) => item.singular !== 'shell')).slice(0, 3);
          const [first, second, third] = animals;
          const objects = pick(rng, reefStoryObjects);
          const twoStep = rng() < 0.25;
          const a = randInt(rng, 10, 45);
          let answer: number;
          let prompt: string;
          let wrongOperation: number;
          if (twoStep) {
            const b = randInt(rng, 5, 30);
            const c = randInt(rng, 1, a + b);
            answer = a + b - c;
            prompt = rng() < 0.5
              ? `A reef has ${nounWithCount(a, first)}. ${nounWithCount(b, second)} ${b === 1 ? 'swims' : 'swim'} over. ${nounWithCount(c, third)} ${c === 1 ? 'swims' : 'swim'} away. How many animals now?`
              : `There are ${a} ${objects.plural} ${objects.emoji}. ${b} more arrive. ${c} are given away. How many ${objects.plural} now?`;
            wrongOperation = a + b;
          } else if (rng() < 0.5) {
            const b = randInt(rng, 5, 30);
            answer = a + b;
            prompt = rng() < 0.5
              ? `A reef has ${nounWithCount(a, first)}. ${nounWithCount(b, second)} ${b === 1 ? 'swims' : 'swim'} over. How many animals now?`
              : `There are ${a} ${objects.plural} ${objects.emoji}. ${b} more arrive. How many ${objects.plural} now?`;
            wrongOperation = Math.abs(a - b);
          } else {
            const b = randInt(rng, 1, a);
            answer = a - b;
            prompt = rng() < 0.5
              ? `A reef has ${nounWithCount(a, first)}. ${nounWithCount(b, first)} ${b === 1 ? 'swims' : 'swim'} away. How many ${first.plural} remain?`
              : `There are ${a} ${objects.plural} ${objects.emoji}. ${b} are given away. How many ${objects.plural} remain?`;
            wrongOperation = a + b;
          }
          return mc(prompt, String(answer), numericDistractors(rng, answer, [wrongOperation, answer - 10, answer + 10, answer - 1, answer + 1], { min: 0, max: 100 }), rng);
        }),
        level('g2.within-100.add-within-1000', 'Add Within 1,000', 'number-pad', 3, (rng) => {
          const a = randInt(rng, 100, 699);
          const b = randInt(rng, 100, Math.min(299, 999 - a));
          return numPad(`${a} + ${b} = ?`, a + b, { hint: 'Add hundreds, tens, and ones' });
        }),
        level('g2.within-100.subtract-within-1000', 'Subtract Within 1,000', 'number-pad', 3, (rng) => {
          const a = randInt(rng, 200, 999);
          const b = randInt(rng, 100, a);
          return numPad(`${a} − ${b} = ?`, a - b, { visual: { text: `${a} − ${b} =` }, hint: 'Subtract each place value carefully' });
        }),
      ],
    },
    {
      id: 'g2.place-value',
      title: 'Treasure Place Value',
      emoji: '🏴‍☠️',
      domain: 'place-value',
      levels: [
        level('g2.place-value.hundreds-tens-ones', 'Hundreds, Tens, and Ones', 'number-pad', 1, (rng) => {
          const hundreds = randInt(rng, 1, 9);
          const tens = rng() < 0.25 ? 0 : randInt(rng, 1, 9);
          const ones = rng() < 0.25 ? 0 : randInt(rng, 1, 9);
          return numPad(`${hundreds} hundreds, ${tens} tens, ${ones} ones`, hundreds * 100 + tens * 10 + ones);
        }),
        level('g2.place-value.skip-count', 'Skip Count', 'order-sequence', 1, (rng) => {
          const step = pick(rng, [5, 10, 100]);
          const start = step === 100 ? randInt(rng, 101, 599) : randInt(rng, 100, 999 - 4 * step);
          return orderSeq(`Count by ${step} from ${start}.`, Array.from({ length: 5 }, (_, i) => String(start + i * step)));
        }),
        level('g2.place-value.expanded-form', 'Expanded Form Match', 'match-pairs', 2, (rng) => {
          const bank = [
            { left: '300 + 40 + 5', right: '345' },
            { left: '600 + 7', right: '607' },
            { left: '200 + 30 + 8', right: '238' },
            { left: '500 + 60 + 2', right: '562' },
            { left: '700 + 20 + 9', right: '729' },
            { left: '400 + 80 + 1', right: '481' },
          ];
          return matchPairs('Match each expanded form to its number.', shuffle(rng, shuffle(rng, bank).slice(0, 4)));
        }),
        level('g2.place-value.digit-value', 'Value of a Digit', 'multiple-choice', 2, (rng) => {
          const [hundreds, tens, ones] = randInts(rng, 1, 9, 3);
          const place = randInt(rng, 0, 2);
          const digits = [hundreds, tens, ones];
          const value = digits[place] * [100, 10, 1][place];
          const number = hundreds * 100 + tens * 10 + ones;
          const otherPlace = place === 0 ? 1 : place === 1 ? 2 : 0;
          const distractors = place === 2
            ? [digits[place] * 10, digits[place] * 100, digits[otherPlace] * [100, 10, 1][otherPlace]]
            : place === 1
              ? [digits[place], digits[place] * 100, digits[otherPlace] * [100, 10, 1][otherPlace]]
              : [digits[place], digits[place] * 10, digits[otherPlace] * [100, 10, 1][otherPlace]];
          return mc(`In ${number}, what is the value of the ${digits[place]}?`, String(value), distractors.map(String), rng);
        }),
        level('g2.place-value.compare-three-digit', 'Compare Three-Digit Numbers', 'multiple-choice', 3, (rng) => {
          const a = randInt(rng, 100, 999);
          const sameHundreds = rng() < 0.5;
          const b = sameHundreds ? Math.floor(a / 100) * 100 + randInt(rng, 0, 99) : randInt(rng, 100, 999);
          const answer = a < b ? '<' : a > b ? '>' : '=';
          return mc(`${a} ? ${b}`, answer, ['<', '>', '='].filter((value) => value !== answer), rng, { visual: { text: `${a} ○ ${b}` }, hint: 'Compare hundreds first' });
        }),
      ],
    },
    {
      id: 'g2.even-arrays',
      title: 'Starfish Arrays',
      emoji: '⭐',
      domain: 'operations',
      levels: [
        level('g2.even-arrays.even-or-odd', 'Even or Odd', 'multiple-choice', 1, (rng) => {
          const number = randInt(rng, 2, 99);
          const answer = number % 2 === 0 ? 'Even' : 'Odd';
          const visual = number <= 20 ? { emoji: '⭐', count: number } : { text: String(number) };
          return mc(`Is ${number} even or odd?`, answer, [answer === 'Even' ? 'Odd' : 'Even'], rng, { visual });
        }),
        level('g2.even-arrays.array-count', 'Count the Array', 'count-tap', 2, (rng) => {
          const rows = randInt(rng, 2, 5);
          const columns = randInt(rng, 2, 5);
          const answer = rows * columns;
          return {
            ...mc('How many shells are in all?', String(answer), numericDistractors(rng, answer, [answer - columns, answer + rows, answer - 1], { min: 0, max: 25 }), rng),
            kind: 'count-tap',
            visual: { emoji: '🐚', groups: Array.from({ length: rows }, () => columns) },
          };
        }),
        level('g2.even-arrays.array-to-addition', 'Arrays as Repeated Addition', 'match-pairs', 3, (rng) => {
          const rows = randInts(rng, 2, 5, 3);
          const pairs = rows.map((row) => {
            const columns = randInt(rng, 2, 5);
            return { left: `${row} rows of ${columns}`, right: Array.from({ length: row }, () => String(columns)).join(' + ') };
          });
          return { ...matchPairs('Match each array to repeated addition.', pairs), hint: 'Add the same number for each row' };
        }),
      ],
    },
    {
      id: 'g2.money',
      title: 'Pirate Coin Market',
      emoji: '🪙',
      domain: 'money',
      levels: [
        level('g2.money.coin-values', 'Coin Values', 'match-pairs', 1, (rng) => {
          const coins = shuffle(rng, [
            { left: 'Penny 🟤', right: formatCents(1) },
            { left: 'Nickel 🪙', right: formatCents(5) },
            { left: 'Dime ⚪', right: formatCents(10) },
            { left: 'Quarter 🪙', right: formatCents(25) },
            { left: 'Dollar 💵', right: formatCents(100) },
          ]).slice(0, 4);
          return matchPairs('Match each coin to its value.', shuffle(rng, coins));
        }),
        level('g2.money.count-coins', 'Count the Coins', 'number-pad', 2, (rng) => {
          const quarters = randInt(rng, 1, 3);
          const dimes = randInt(rng, 0, 4);
          const nickels = randInt(rng, 0, 3);
          const pennies = randInt(rng, 0, 4);
          const answer = quarters * 25 + dimes * 10 + nickels * 5 + pennies;
          const coinCount = (count: number, singular: string, plural: string) => `${count} ${count === 1 ? singular : plural}`;
          const prompt = `${coinCount(quarters, 'quarter', 'quarters')}, ${coinCount(dimes, 'dime', 'dimes')}, ${coinCount(nickels, 'nickel', 'nickels')}, ${coinCount(pennies, 'penny', 'pennies')}\nHow many cents?`;
          return numPad(prompt, answer, { hint: 'Add the value of each coin' });
        }),
        level('g2.money.dollars-and-cents', 'Dollars and Cents', 'multiple-choice', 2, (rng) => {
          const dollars = randInt(rng, 1, 5);
          const dimes = randInt(rng, 1, 9);
          const answer = dollars * 100 + dimes * 10;
          const candidates = [dollars * 100 + dimes, (dollars + dimes) * 100, answer + 100, answer - 10, answer + 10];
          const labels = numericDistractors(rng, answer, candidates, { count: 3, min: 0, max: 999 }).map((value) => formatDollars(Number(value)));
          return mc(`${dollars} ${dollars === 1 ? 'dollar' : 'dollars'} and ${dimes} ${dimes === 1 ? 'dime' : 'dimes'} is how much?`, formatDollars(answer), labels, rng);
        }),
        level('g2.money.make-change', 'Make Change', 'number-pad', 3, (rng) => {
          const paid = rng() < 0.5 ? 50 : 100;
          const price = randInt(rng, 5, paid - 1);
          return numPad(`A toy costs ${formatCents(price)}. You pay ${formatCents(paid)}. How many cents back?`, paid - price, { hint: 'Count up from the price' });
        }),
      ],
    },
    {
      id: 'g2.time',
      title: 'Lighthouse Clock',
      emoji: '🗼',
      domain: 'time',
      levels: [
        level('g2.time.five-minutes', 'Count by Five Minutes', 'multiple-choice', 1, (rng) => {
          const minuteHand = randInt(rng, 1, 11);
          const answer = minuteHand * 5;
          return mc(`The minute hand is on the ${minuteHand}. How many minutes after the hour?`, String(answer), numericDistractors(rng, answer, [minuteHand, answer - 5, answer + 5, answer + 10], { min: 0, max: 60 }), rng);
        }),
        level('g2.time.read-the-clock', 'Read the Clock', 'multiple-choice', 2, (rng) => {
          const hour = randInt(rng, 1, 11);
          const minuteHand = randInt(rng, 1, 11);
          const minute = minuteHand * 5;
          const answer = formatTime(hour, minute);
          const labels = [answer, formatTime(hour, minuteHand), formatTime(hour === 11 ? 12 : hour + 1, minute), formatTime(minuteHand, 20)];
          return mc(`The hour hand is between the ${hour} and the ${hour + 1}. The minute hand is on the ${minuteHand}. What time is it?`, answer, [...new Set(labels.filter((label) => label !== answer))].slice(0, 3), rng);
        }),
        level('g2.time.am-pm', 'AM or PM?', 'multiple-choice', 2, (rng) => {
          const activities = [
            { text: 'eat breakfast', answer: 'AM' },
            { text: 'start school', answer: 'AM' },
            { text: 'watch the sunset', answer: 'PM' },
            { text: 'eat dinner', answer: 'PM' },
            { text: 'go to bed at night', answer: 'PM' },
          ];
          const activity = pick(rng, activities);
          return mc(`When do you usually ${activity.text}?`, activity.answer, [activity.answer === 'AM' ? 'PM' : 'AM'], rng);
        }),
        level('g2.time.minutes-later', 'Minutes Later', 'multiple-choice', 3, (rng) => {
          const hour = randInt(rng, 1, 11);
          const minute = randInt(rng, 0, 10) * 5;
          const add = randInt(rng, 5, 30);
          const total = minute + add;
          const answer = formatTime(hour + Math.floor(total / 60), total % 60);
          const wrongDirection = formatTime(hour, Math.max(0, minute - add));
          const oneHour = formatTime(hour === 11 ? 12 : hour + 1, minute);
          const distractors = [...new Set([wrongDirection, oneHour, formatTime(hour, (minute + 5) % 60), formatTime(hour, (minute + 30) % 60)].filter((value) => value !== answer))].slice(0, 3);
          return mc(`It is ${formatTime(hour, minute)}. What time is it ${add} minutes later?`, answer, distractors, rng, { hint: 'Add the minutes, regrouping at 60' });
        }),
      ],
    },
    {
      id: 'g2.measure',
      title: 'Whale Measuring Lab',
      emoji: '🐋',
      domain: 'measurement',
      levels: [
        level('g2.measure.best-estimate', 'Best Estimate', 'multiple-choice', 1, (rng) => {
          const estimates = [
            { object: 'a crayon', answer: '9 cm', distractors: ['90 cm', '9 m', '1 cm'] },
            { object: 'a pencil', answer: '7 in', distractors: ['7 cm', '70 in', '7 ft'] },
            { object: 'a door', answer: '2 m', distractors: ['2 cm', '20 m', '2 ft'] },
            { object: 'a paper clip', answer: '3 cm', distractors: ['30 cm', '3 m', '3 mm'] },
            { object: 'a school bus', answer: '12 m', distractors: ['12 cm', '120 m', '12 ft'] },
            { object: 'a book', answer: '10 in', distractors: ['10 cm', '100 in', '10 ft'] },
            { object: 'a shoe', answer: '25 cm', distractors: ['25 in', '250 cm', '25 m'] },
            { object: 'a spoon', answer: '15 cm', distractors: ['15 mm', '150 cm', '15 m'] },
            { object: 'a desk', answer: '1 m', distractors: ['1 cm', '10 m', '1 in'] },
            { object: 'a baby whale', answer: '4 m', distractors: ['4 cm', '40 m', '4 ft'] },
          ];
          const item = pick(rng, estimates);
          return mc(`About how long is ${item.object}?`, item.answer, item.distractors, rng);
        }),
        level('g2.measure.ruler-read', 'Read a Ruler', 'number-pad', 2, (rng) => {
          const start = randInt(rng, 0, 8);
          const length = randInt(rng, 2, 12);
          const end = start + length;
          return numPad(`The eel starts at ${start} and ends at ${end} on a centimeter ruler. How long?`, length, { hint: 'Subtract the start' });
        }),
        level('g2.measure.inches-vs-cm', 'Inches and Centimeters', 'true-false', 2, (rng) => {
          const fact = pick(rng, measurementFacts);
          return trueFalse(fact.text, fact.truth);
        }),
        level('g2.measure.how-much-longer', 'How Much Longer?', 'number-pad', 3, (rng) => {
          const [first, second] = shuffle(rng, reefAnimals).slice(0, 2);
          const a = randInt(rng, 25, 99);
          const difference = randInt(rng, 5, 25);
          const b = a - difference;
          return numPad(`A ${first.singular} is ${a} cm long. A ${second.singular} is ${b} cm long. How much longer is the ${first.singular}?`, difference, { hint: 'Subtract the shorter length' });
        }),
      ],
    },
    {
      id: 'g2.data',
      title: 'Reef Graph Survey',
      emoji: '📈',
      domain: 'data',
      levels: [
        level('g2.data.bar-graph', 'Read a Bar Graph', 'number-pad', 1, (rng) => {
          const rows = shuffle(rng, reefAnimals).slice(0, 3).map((item) => ({ ...item, count: randInt(rng, 1, 10) }));
          const chosen = pick(rng, rows);
          return numPad(`${rows.map((row) => `${row.emoji} ${'▇'.repeat(row.count)}`).join('\n')}\nHow many ${chosen.plural}?`, chosen.count);
        }),
        level('g2.data.picture-graph-key', 'Picture Graph Key', 'number-pad', 2, (rng) => {
          const rows = shuffle(rng, reefAnimals).slice(0, 3).map((item) => ({ ...item, count: randInt(rng, 1, 5) }));
          const chosen = pick(rng, rows);
          return numPad(`Key: each picture = 2\n${rows.map((row) => `${row.emoji} ${row.emoji.repeat(row.count)}`).join('\n')}\nHow many ${chosen.plural}?`, chosen.count * 2, { hint: 'Each picture counts 2' });
        }),
        level('g2.data.line-plot', 'Read a Line Plot', 'number-pad', 3, (rng) => {
          const lengths = [2, 3, 4, 5];
          const counts = lengths.map(() => randInt(rng, 1, 4));
          const longer = rng() < 0.5;
          const target = pick(rng, lengths);
          const answer = longer
            ? counts.reduce((sum, count, index) => sum + (lengths[index] > target ? count : 0), 0)
            : counts[lengths.indexOf(target)];
          const question = longer ? `How many shells are longer than ${target} in?` : `How many shells are ${target} in?`;
          return numPad(`${lengths.map((length, index) => `${length} in ${'✖️'.repeat(counts[index])}`).join('\n')}\n${question}`, answer, { hint: 'Count the marks on the plot' });
        }),
      ],
    },
    {
      id: 'g2.shapes',
      title: 'Shipwreck Shapes',
      emoji: '🔷',
      domain: 'geometry',
      levels: [
        level('g2.shapes.sides-and-angles', 'Sides and Angles', 'multiple-choice', 1, (rng) => {
          const shapes = [
            { name: 'triangle', sides: 3 },
            { name: 'quadrilateral', sides: 4 },
            { name: 'pentagon', sides: 5 },
            { name: 'hexagon', sides: 6 },
          ];
          const shape = pick(rng, shapes);
          if (rng() < 0.5) {
            const answer = String(shape.sides);
            return mc(`How many sides does a ${shape.name} have?`, answer, shapes.filter((item) => item !== shape).map((item) => String(item.sides)), rng);
          }
          const distractors = shuffle(rng, shapes.filter((item) => item !== shape)).slice(0, 3).map((item) => item.name);
          return mc(`Which shape has ${shape.sides} sides?`, shape.name, distractors, rng);
        }),
        level('g2.shapes.faces', 'Faces, Edges, and Vertices', 'number-pad', 2, (rng) => {
          const properties = [
            { shape: 'cube', property: 'faces', value: 6 },
            { shape: 'cube', property: 'edges', value: 12 },
            { shape: 'cube', property: 'vertices', value: 8 },
            { shape: 'rectangular prism', property: 'faces', value: 6 },
            { shape: 'rectangular prism', property: 'edges', value: 12 },
            { shape: 'rectangular prism', property: 'vertices', value: 8 },
            { shape: 'square pyramid', property: 'faces', value: 5 },
            { shape: 'square pyramid', property: 'edges', value: 8 },
            { shape: 'square pyramid', property: 'vertices', value: 5 },
            { shape: 'triangular prism', property: 'faces', value: 5 },
            { shape: 'triangular prism', property: 'edges', value: 9 },
            { shape: 'triangular prism', property: 'vertices', value: 6 },
          ];
          const item = pick(rng, properties);
          return numPad(`How many ${item.property} does a ${item.shape} have?`, item.value);
        }),
        level('g2.shapes.partition-rectangle', 'Partition a Rectangle', 'count-tap', 2, (rng) => {
          const rows = randInt(rng, 2, 4);
          const columns = randInt(rng, 2, 5);
          const answer = rows * columns;
          return {
            ...mc('How many equal squares are in the rectangle?', String(answer), numericDistractors(rng, answer, [answer - columns, answer + rows, answer - 1], { min: 0, max: 20 }), rng),
            kind: 'count-tap',
            visual: { emoji: '🟦', groups: Array.from({ length: rows }, () => columns) },
          };
        }),
        level('g2.shapes.equal-shares', 'Equal Shares', 'multiple-choice', 3, (rng) => {
          const count = pick(rng, [2, 3, 4]);
          const food = pick(rng, ['🍕', '🍰', '🥪']);
          const answer = count === 2 ? 'halves' : count === 3 ? 'thirds' : 'fourths';
          const prompt = `A ${food} is cut into ${count} equal shares. What are the shares called?`;
          return mc(prompt, answer, ['halves', 'thirds', 'fourths'].filter((value) => value !== answer), rng, { hint: 'Equal shares are the same size' });
        }),
      ],
    },
  ],
};
