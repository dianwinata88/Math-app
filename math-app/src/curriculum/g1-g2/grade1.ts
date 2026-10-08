import { pick, randInt, randInts, shuffle } from '../../core/rng';
import type { GradeDef } from '../../core/types';
import { level, matchPairs, mc, numPad, orderSeq, trueFalse } from '../helpers';
import { g1Pack } from './g1-pack';
import {
  CLOCK_HALF,
  CLOCK_HOUR,
  capitalizeWord,
  compareSymbol,
  equalShareFacts,
  g1Shapes,
  jungleAnimals,
  jungleFoods,
  numericDistractors,
} from './shared';

const animal = (rng: () => number) => pick(rng, jungleAnimals);
const threeDimensionalShapeNames = new Set(['cube', 'cone', 'cylinder', 'sphere']);
const twoDimensionalShapeNames = ['triangle', 'square', 'rectangle', 'circle', 'hexagon', 'trapezoid'];

export const grade1: GradeDef = {
  id: 'g1',
  title: 'Grade 1',
  ages: '6–7',
  units: [
    {
      id: 'g1.add-sub',
      title: 'Monkey Math Vines',
      emoji: '🐒',
      domain: 'operations',
      levels: [
        level('g1.add-sub.add-to-ten', 'Add to Ten', 'count-tap', 1, (rng) => {
          const a = randInt(rng, 1, 8);
          const b = randInt(rng, 1, 10 - a);
          const answer = a + b;
          return {
            ...mc('How many bananas in all?', String(answer), numericDistractors(rng, answer, [answer - 1, answer + 1, a + b + 2], { min: 0, max: 10 }), rng),
            kind: 'count-tap',
            visual: { emoji: '🍌', groups: [a, b] },
          };
        }),
        level('g1.add-sub.add-within-twenty', 'Add Within Twenty', 'number-pad', 1, (rng) => {
          const a = randInt(rng, 2, 15);
          const b = randInt(rng, 1, 20 - a);
          return numPad(`${a} + ${b} = ?`, a + b, { visual: { text: `${a} + ${b} =` } });
        }),
        level('g1.add-sub.take-away', 'Take Away', 'multiple-choice', 2, (rng) => {
          const a = randInt(rng, 5, 20);
          const b = randInt(rng, 1, a);
          const answer = a - b;
          return mc(`${a} − ${b} = ?`, String(answer), numericDistractors(rng, answer, [a + b, answer - 1, answer + 1, b], { min: 0, max: 40 }), rng, { visual: { text: `${a} − ${b} =` } });
        }),
        level('g1.add-sub.fact-match', 'Fact Match', 'match-pairs', 3, (rng) => {
          const answers = randInts(rng, 4, 20, 4);
          const pairs = answers.map((answer, index) => ({
            left: index % 2 === 0 || answer > 18 ? `${answer - 2} + 2` : `${answer + 2} − 2`,
            right: String(answer),
          }));
          return { ...matchPairs('Match each fact to its answer.', shuffle(rng, pairs)), hint: 'Use addition and subtraction facts together' };
        }),
      ],
    },
    {
      id: 'g1.equations',
      title: 'Parrot Puzzle Rock',
      emoji: '🦜',
      domain: 'operations',
      levels: [
        level('g1.equations.missing-addend', 'Missing Addend', 'number-pad', 1, (rng) => {
          const a = randInt(rng, 1, 9);
          const answer = randInt(rng, 1, 9);
          const c = a + answer;
          return numPad(`${a} + ? = ${c}`, answer, { visual: { text: `${a} + ? = ${c}` } });
        }),
        level('g1.equations.missing-part', 'Find the Missing Part', 'multiple-choice', 2, (rng) => {
          const mode = randInt(rng, 0, 1);
          const answer = randInt(rng, 1, 12);
          const extra = randInt(rng, 1, 20 - answer);
          const a = mode === 0 ? answer + extra : extra;
          const b = mode === 0 ? extra : answer;
          const prompt = mode === 0 ? `${a} − ? = ${b}` : `? − ${a} = ${b}`;
          const missing = mode === 0 ? answer : a + b;
          return mc(prompt, String(missing), numericDistractors(rng, missing, [a + b, missing - 1, missing + 1], { min: 0, max: 20 }), rng);
        }),
        level('g1.equations.true-false-equations', 'True or False Equations', 'true-false', 2, (rng) => {
          const mode = randInt(rng, 0, 3);
          const a = randInt(rng, 1, 9);
          const b = randInt(rng, 1, 9);
          const truth = rng() < 0.5;
          if (mode === 0) return trueFalse(`${a + b} = ${truth ? a + b : a + b + 1}`, truth);
          if (mode === 1) return trueFalse(`${a + b + (truth ? 0 : 1)} = ${a} + ${b}`, truth);
          if (mode === 2) return trueFalse(`${a} + ${b} = ${a + b + (truth ? 0 : 1)}`, truth);
          return trueFalse(`${a + b} = ${a} + ${b}`, true);
        }),
        level('g1.equations.balance', 'Balance the Equations', 'true-false', 3, (rng) => {
          const a = randInt(rng, 1, 9);
          const b = randInt(rng, 1, 9);
          const c = randInt(rng, 1, 9);
          const truth = rng() < 0.5;
          if (truth) {
            const d = a + b - randInt(rng, 0, a + b - 1);
            const rightA = a + b - d;
            const left = a + b;
            return trueFalse(`${a} + ${b} = ${rightA} + ${d}`, left === rightA + d, { hint: 'Both sides must have the same value' });
          }
          const d = randInt(rng, 1, 9);
          return trueFalse(`${a} + ${b} = ${c} + ${d}`, a + b === c + d, { hint: 'Both sides must have the same value' });
        }),
      ],
    },
    {
      id: 'g1.stories',
      title: 'Safari Story Trail',
      emoji: '🦒',
      domain: 'word-problems',
      levels: [
        level('g1.stories.add-stories', 'Adding Safari Stories', 'multiple-choice', 1, (rng) => {
          const first = animal(rng);
          const second = animal(rng);
          const a = randInt(rng, 1, 9);
          const b = randInt(rng, 1, 20 - a);
          const answer = a + b;
          return mc(`There are ${a} ${first.plural} and ${b} ${second.plural}. How many animals in all?`, String(answer), numericDistractors(rng, answer, [a, b, answer - 1, answer + 1], { min: 0, max: 20 }), rng);
        }),
        level('g1.stories.take-away-stories', 'Taking Away Stories', 'number-pad', 2, (rng) => {
          const kind = animal(rng);
          const total = randInt(rng, 5, 20);
          const taken = randInt(rng, 1, total - 1);
          return numPad(`There are ${total} ${kind.plural}. ${taken} go away. How many are left?`, total - taken);
        }),
        level('g1.stories.compare-stories', 'Compare Safari Stories', 'number-pad', 3, (rng) => {
          const food = pick(rng, jungleFoods);
          const more = randInt(rng, 3, 9);
          const fewer = randInt(rng, 1, 12);
          return numPad(`Tia has ${fewer + more} ${food.plural}, Leo has ${fewer}. How many more does Tia have?`, more, { hint: 'Find the difference between the amounts' });
        }),
      ],
    },
    {
      id: 'g1.tens-ones',
      title: 'Elephant Tens & Ones',
      emoji: '🐘',
      domain: 'place-value',
      levels: [
        level('g1.tens-ones.count-to-120', 'Count to 120', 'order-sequence', 1, (rng) => {
          const start = randInt(rng, 90, 116);
          return orderSeq('Put the numbers in order from least to greatest.', Array.from({ length: 5 }, (_, i) => String(start + i)));
        }),
        level('g1.tens-ones.tens-and-ones', 'Tens and Ones', 'number-pad', 1, (rng) => {
          const hundreds = rng() < 0.18;
          const tens = hundreds ? randInt(rng, 10, 11) : randInt(rng, 1, 9);
          const ones = randInt(rng, 0, 9);
          const answer = tens * 10 + ones;
          return numPad(`${tens} tens and ${ones} ones`, answer);
        }),
        level('g1.tens-ones.compare-two-digit', 'Compare Two-Digit Numbers', 'multiple-choice', 2, (rng) => {
          const a = randInt(rng, 10, 99);
          const b = rng() < 0.17 ? a : randInt(rng, 10, 99);
          const answer = compareSymbol(a, b);
          return mc('Which sign goes in the circle?', answer, ['<', '>', '='].filter((symbol) => symbol !== answer), rng, { visual: { text: `${a} ○ ${b}` } });
        }),
        level('g1.tens-ones.ten-more-ten-less', 'Ten More or Ten Less', 'number-pad', 2, (rng) => {
          const value = randInt(rng, 10, 99);
          const more = rng() < 0.5;
          return numPad(`${more ? '10 more' : '10 less'} than ${value}`, value + (more ? 10 : -10));
        }),
      ],
    },
    {
      id: 'g1.add-100',
      title: 'Jungle River to 100',
      emoji: '🛶',
      domain: 'operations',
      levels: [
        level('g1.add-100.plus-ones', 'Add Ones Without Regrouping', 'number-pad', 1, (rng) => {
          const ones = randInt(rng, 0, 8);
          const addend = randInt(rng, 1, 9 - ones);
          const a = randInt(rng, 1, 9) * 10 + ones;
          return numPad(`${a} + ${addend} = ?`, a + addend, { visual: { text: `${a} + ${addend} =` } });
        }),
        level('g1.add-100.plus-tens', 'Add Tens', 'multiple-choice', 2, (rng) => {
          const a = randInt(rng, 20, 89);
          const tens = randInt(rng, 1, Math.min(10, Math.floor((100 - a) / 10)));
          const b = tens * 10;
          const answer = a + b;
          return mc(`${a} + ${b} = ?`, String(answer), numericDistractors(rng, answer, [a + tens, answer - 10, answer + 10], { min: 0, max: 110 }), rng);
        }),
        level('g1.add-100.minus-tens', 'Subtract Tens', 'multiple-choice', 2, (rng) => {
          const a = randInt(rng, 2, 9) * 10;
          const b = randInt(rng, 1, Math.floor(a / 10)) * 10;
          const answer = a - b;
          return mc(`${a} − ${b} = ?`, String(answer), numericDistractors(rng, answer, [a + b, answer - 10, answer + 10], { min: 0, max: 180 }), rng);
        }),
        level('g1.add-100.make-a-ten-sums', 'Make a Ten First', 'number-pad', 3, (rng) => {
          const addend = randInt(rng, 1, 9);
          const ones = randInt(rng, 10 - addend, 9);
          const tens = randInt(rng, 1, Math.floor((100 - ones - addend) / 10));
          const a = tens * 10 + ones;
          return numPad(`${a} + ${addend} = ?`, a + addend, { visual: { text: `${a} + ${addend} =` }, hint: 'Make the next ten first' });
        }),
      ],
    },
    {
      id: 'g1.measure',
      title: 'Snake Ruler Ridge',
      emoji: '🐍',
      domain: 'measurement',
      levels: [
        level('g1.measure.measure-units', 'Measure with Units', 'count-tap', 1, (rng) => {
          const count = randInt(rng, 2, 9);
          const emoji = rng() < 0.5 ? '📎' : '🟩';
          const unit = emoji === '📎' ? 'paper clips' : 'cubes';
          return {
            ...mc(`The snake is this many ${unit} long. How long?`, String(count), numericDistractors(rng, count, [count - 1, count + 1, count + 2], { min: 0, max: 12 }), rng),
            kind: 'count-tap',
            visual: { emoji, count },
          };
        }),
        level('g1.measure.longer-shorter', 'Longer or Shorter', 'multiple-choice', 2, (rng) => {
          const selected = shuffle(rng, jungleAnimals).slice(0, 3);
          const lengths = randInts(rng, 2, 12, 3);
          const askLonger = rng() < 0.5;
          const winner = selected[lengths.indexOf(askLonger ? Math.max(...lengths) : Math.min(...lengths))];
          const labels = selected.map((item, index) => `${item.singular} (${lengths[index]} cubes)`);
          return mc(`Which is the ${askLonger ? 'longest' : 'shortest'}? ${labels.join(', ')}`, labels[selected.indexOf(winner)], labels.filter((label) => label !== labels[selected.indexOf(winner)]), rng, {
            visual: { items: selected.map((item) => item.emoji) },
          });
        }),
        level('g1.measure.order-by-length', 'Order by Length', 'order-sequence', 2, (rng) => {
          const selected = shuffle(rng, jungleAnimals).slice(0, 4);
          const lengths = randInts(rng, 2, 12, 4);
          const sequence = selected.map((item, index) => ({ label: `${item.emoji} ${lengths[index]} cubes`, length: lengths[index] }))
            .sort((a, b) => a.length - b.length).map((item) => item.label);
          return orderSeq('Order from shortest to longest.', sequence);
        }),
        level('g1.measure.compare-indirect', 'Compare Indirectly', 'true-false', 3, (rng) => {
          const animals = shuffle(rng, jungleAnimals).slice(0, 3);
          const [first, second, third] = animals;
          const truth = rng() < 0.5;
          const conclusion = truth
            ? `the ${first.singular} is longer than the ${third.singular}`
            : `the ${third.singular} is longer than the ${first.singular}`;
          return trueFalse(`The ${first.singular} is longer than the ${second.singular}. The ${second.singular} is longer than the ${third.singular}. So ${conclusion}.`, truth, { hint: 'Compare the lengths of the first and last' });
        }),
      ],
    },
    {
      id: 'g1.time',
      title: 'Lion Clock Tower',
      emoji: '🦁',
      domain: 'time',
      levels: [
        level('g1.time.oclock', 'O’Clock', 'multiple-choice', 1, (rng) => {
          const hour = randInt(rng, 1, 12);
          const answer = `${hour}:00`;
          const wrongHours = randInts(rng, 1, 12, 4).filter((value) => value !== hour).slice(0, 3).map((value) => `${value}:00`);
          const half = `${hour}:30`;
          return mc(`What time does the clock show?`, answer, [...wrongHours.slice(0, 2), half], rng, { visual: { text: CLOCK_HOUR[hour - 1] } });
        }),
        level('g1.time.half-past', 'Half Past', 'multiple-choice', 2, (rng) => {
          const hour = randInt(rng, 1, 12);
          const answer = `${hour}:30`;
          const next = `${hour === 12 ? 1 : hour + 1}:30`;
          const swap = `${hour}:00`;
          return mc('What time does the clock show?', answer, [next, swap, `${hour === 12 ? 1 : hour + 1}:00`], rng, { visual: { text: CLOCK_HALF[hour - 1] } });
        }),
        level('g1.time.clock-match', 'Match the Clocks', 'match-pairs', 2, (rng) => {
          const hours = randInts(rng, 1, 12, 4);
          const pairs = hours.map((hour, index) => {
            const half = index % 2 === 1;
            return { left: half ? CLOCK_HALF[hour - 1] : CLOCK_HOUR[hour - 1], right: `${hour}:${half ? '30' : '00'}` };
          });
          return matchPairs('Match each clock to its time.', shuffle(rng, pairs));
        }),
        level('g1.time.time-words', 'Time Words', 'true-false', 3, (rng) => {
          const hour = randInt(rng, 1, 12);
          const isHalf = rng() < 0.5;
          const truth = rng() < 0.5;
          const statement = isHalf
            ? `Half past ${hour} is ${truth ? `${hour}:30` : `${hour === 12 ? 1 : hour + 1}:30`}.`
            : `${hour} o'clock is ${truth ? `${hour}:00` : `${hour}:30`}.`;
          return trueFalse(statement, truth, { hint: 'Half past means 30 minutes' });
        }),
      ],
    },
    {
      id: 'g1.shapes',
      title: 'Hidden Shape Temple',
      emoji: '🔺',
      domain: 'geometry',
      levels: [
        level('g1.shapes.name-the-shape', 'Name the Shape', 'multiple-choice', 1, (rng) => {
          const shape = pick(rng, g1Shapes);
          const labels = threeDimensionalShapeNames.has(shape.name)
            ? [...threeDimensionalShapeNames]
            : twoDimensionalShapeNames;
          return mc(shape.riddle, shape.name, shuffle(rng, labels.filter((label) => label !== shape.name)).slice(0, 3), rng);
        }),
        level('g1.shapes.count-sides', 'Count Sides and Corners', 'number-pad', 1, (rng) => {
          const shape = pick(rng, g1Shapes.filter((item) => ['triangle', 'square', 'rectangle', 'hexagon', 'trapezoid'].includes(item.name)));
          return numPad(`How many sides does a ${shape.name} have?`, shape.sides);
        }),
        level('g1.shapes.halves-quarters', 'Halves and Quarters', 'multiple-choice', 2, (rng) => {
          const quarters = rng() < 0.5;
          const food = pick(rng, ['🍕', '🍰', '🥪']);
          const answer = quarters ? 'fourths (quarters)' : 'halves';
          const prompt = quarters ? `A ${food} is cut into 4 equal parts. What are the parts called?` : `A ${food} is cut into 2 equal parts. What are the parts called?`;
          return mc(prompt, answer, ['halves', 'thirds', 'fourths (quarters)'].filter((label) => label !== answer), rng);
        }),
        level('g1.shapes.equal-shares', 'Equal Shares', 'true-false', 3, (rng) => {
          const fact = pick(rng, equalShareFacts);
          return trueFalse(fact.text, fact.truth, { hint: 'Equal shares are the same size' });
        }),
      ],
    },
    {
      id: 'g1.data',
      title: 'Animal Tally Camp',
      emoji: '📊',
      domain: 'data',
      levels: [
        level('g1.data.read-tally', 'Read a Tally', 'number-pad', 1, (rng) => {
          const count = randInt(rng, 1, 15);
          const tally = `${'||||| '.repeat(Math.floor(count / 5))}${'|'.repeat(count % 5)}`.trim();
          const kind = animal(rng);
          return numPad(`${capitalizeWord(kind.plural)}: ${tally}\nHow many?`, count);
        }),
        level('g1.data.picture-graph-most', 'Picture Graph: Most and Fewest', 'multiple-choice', 2, (rng) => {
          const selected = shuffle(rng, jungleAnimals).slice(0, 3);
          const counts = randInts(rng, 1, 7, 3);
          const most = rng() < 0.5;
          const targetCount = most ? Math.max(...counts) : Math.min(...counts);
          const index = counts.indexOf(targetCount);
          const rows = selected.map((item, i) => `${capitalizeWord(item.plural)}: ${item.emoji.repeat(counts[i])}`);
          return mc(`${rows.join('\n')}\nWhich has the ${most ? 'most' : 'fewest'}?`, selected[index].plural, selected.filter((_, i) => i !== index).map((item) => item.plural), rng);
        }),
        level('g1.data.how-many-more', 'How Many More?', 'number-pad', 2, (rng) => {
          const first = animal(rng);
          const second = pick(rng, jungleAnimals.filter((item) => item !== first));
          const difference = randInt(rng, 1, 5);
          const smaller = randInt(rng, 1, 10 - difference);
          const bigger = smaller + difference;
          return numPad(`${capitalizeWord(first.plural)}: ${first.emoji.repeat(bigger)}\n${capitalizeWord(second.plural)}: ${second.emoji.repeat(smaller)}\nHow many more ${first.plural} than ${second.plural}?`, difference);
        }),
        level('g1.data.graph-total', 'Add the Graph Rows', 'number-pad', 3, (rng) => {
          const rows = shuffle(rng, jungleAnimals).slice(0, 3).map((item) => ({ ...item, count: randInt(rng, 1, 9) }));
          return numPad(`${rows.map((row) => `${capitalizeWord(row.plural)}: ${row.count}`).join('\n')}\nHow many animals in all?`, rows.reduce((sum, row) => sum + row.count, 0), { hint: 'Add the rows together' });
        }),
      ],
    },
    ...g1Pack,
  ],
};
