import { pick, randInt, randInts, shuffle } from '../../core/rng';
import type { UnitDef } from '../../core/types';
import { level, matchPairs, mc, numPad, orderSeq, trueFalse } from '../helpers';
import { CLOCK_HALF, CLOCK_HOUR, capitalizeWord, formatCents, formatDollars, numericDistractors } from './shared';
import {
  centsToDollars,
  clockHandFacts,
  coinCombos,
  coinDecimals,
  coinRiddles,
  coins,
  composeFacts,
  dayEvents,
  decimalFacts,
  flatShapes,
  lengthEstimates,
  measureFacts,
  measureTools,
  realWorldShapes,
  shareFacts,
  shareMatchFacts,
  shapeFacts,
  solidShapes,
  storyObjects,
} from './g1-pack-banks';

const wrap12 = (hour: number) => ((hour - 1) % 12) + 1;
const coinCount = (count: number, coin: { name: string; plural: string }) => `${count} ${count === 1 ? coin.name : coin.plural}`;
const tallyFor = (count: number) => `${'||||| '.repeat(Math.floor(count / 5))}${'|'.repeat(count % 5)}`.trim();

export const g1PackWorld: UnitDef[] = [
  {
    id: 'g1.pack-time',
    title: 'Owl Clock Tower',
    emoji: '🦉',
    domain: 'time',
    levels: [
      level('g1.pack-time.read-hour', 'Read the Hour', 'multiple-choice', 1, (rng) => {
        const hour = randInt(rng, 1, 12);
        const answer = `${hour}:00`;
        const wrong = randInts(rng, 1, 12, 4).filter((value) => value !== hour).slice(0, 2).map((value) => `${value}:00`);
        return mc('What time does the clock show?', answer, [...wrong, `${hour}:30`], rng, { visual: { text: CLOCK_HOUR[hour - 1] }, hint: "The minute hand on 12 means o'clock" });
      }),
      level('g1.pack-time.read-half', 'Read the Half Hour', 'multiple-choice', 1, (rng) => {
        const hour = randInt(rng, 1, 12);
        const answer = `${hour}:30`;
        return mc('What time does the clock show?', answer, [`${wrap12(hour + 1)}:30`, `${hour}:00`, `${wrap12(hour - 1)}:30`], rng, { visual: { text: CLOCK_HALF[hour - 1] }, hint: 'The minute hand on 6 means half past' });
      }),
      level('g1.pack-time.hour-later', 'One Hour Later', 'number-pad', 1, (rng) => {
        const hour = randInt(rng, 1, 12);
        return numPad(`It is ${hour}:00. What hour is it one hour later? (type just the hour number)`, wrap12(hour + 1), { hint: 'The hour hand moves one number forward' });
      }),
      level('g1.pack-time.hands-tf', 'Clock Hands', 'true-false', 1, (rng) => {
        const fact = pick(rng, clockHandFacts);
        return trueFalse(fact.text, fact.truth, { hint: 'Short hand = hour, long hand = minutes' });
      }),
      level('g1.pack-time.clock-match', 'Clock Match-Up', 'match-pairs', 2, (rng) => {
        const hours = randInts(rng, 1, 12, 4);
        const pairs = hours.map((hour, index) => {
          const half = index % 2 === 1;
          return { left: half ? CLOCK_HALF[hour - 1] : CLOCK_HOUR[hour - 1], right: `${hour}:${half ? '30' : '00'}` };
        });
        return matchPairs('Match each clock to its time.', shuffle(rng, pairs));
      }),
      level('g1.pack-time.clock-tf', 'Is the Time Right?', 'true-false', 2, (rng) => {
        const hour = randInt(rng, 1, 12);
        const half = rng() < 0.5;
        const truth = rng() < 0.5;
        const claimed = truth ? `${hour}:${half ? '30' : '00'}` : `${hour}:${half ? '00' : '30'}`;
        return {
          ...trueFalse(`The clock shows ${claimed}.`, truth, { hint: 'Check where the minute hand points' }),
          visual: { text: half ? CLOCK_HALF[hour - 1] : CLOCK_HOUR[hour - 1] },
        };
      }),
      level('g1.pack-time.day-order', 'Order the Day', 'order-sequence', 2, (rng) => {
        const start = randInt(rng, 0, dayEvents.length - 4);
        return orderSeq('Put the events in order from morning to night.', dayEvents.slice(start, start + 4));
      }),
      level('g1.pack-time.match-words', 'Time in Words', 'match-pairs', 2, (rng) => {
        const hours = randInts(rng, 1, 12, 4);
        const pairs = hours.map((hour, index) => {
          const half = index % 2 === 1;
          return { left: `${hour}:${half ? '30' : '00'}`, right: half ? `half past ${hour}` : `${hour} o'clock` };
        });
        return matchPairs('Match each digital time to its words.', shuffle(rng, pairs));
      }),
      level('g1.pack-time.half-later', 'Half an Hour Later', 'multiple-choice', 3, (rng) => {
        const hour = randInt(rng, 1, 12);
        const answer = `${wrap12(hour + 1)}:00`;
        return mc(`It is ${hour}:30. What time is it half an hour later?`, answer, [`${hour}:00`, `${wrap12(hour + 1)}:30`, `${wrap12(hour + 2)}:00`], rng, { hint: 'Half past plus half an hour lands on the next hour' });
      }),
      level('g1.pack-time.time-words', 'Words to Numbers', 'multiple-choice', 3, (rng) => {
        const hour = randInt(rng, 1, 12);
        const half = rng() < 0.5;
        if (half) {
          const answer = `${hour}:30`;
          return mc(`"Half past ${hour}" is the same as?`, answer, [`${hour}:00`, `${wrap12(hour + 1)}:30`, `${wrap12(hour - 1)}:30`], rng, { hint: 'Half past means 30 minutes' });
        }
        const answer = `${hour}:00`;
        return mc(`"${hour} o'clock" is the same as?`, answer, [`${hour}:30`, `${wrap12(hour + 1)}:00`, `${wrap12(hour - 1)}:00`], rng, { hint: "O'clock means 00 minutes" });
      }),
      level('g1.pack-time.two-hours', 'Two Hours Later', 'multiple-choice', 3, (rng) => {
        const hour = randInt(rng, 1, 10);
        const answer = `${hour + 2}:00`;
        return mc(`It is ${hour}:00. What time is it two hours later?`, answer, [`${hour + 1}:00`, `${hour}:30`, `${hour}:00`], rng, { hint: 'Count the hour hand forward twice' });
      }),
    ],
  },
  {
    id: 'g1.pack-money',
    title: 'Coin Cave',
    emoji: '🪙',
    domain: 'money',
    levels: [
      level('g1.pack-money.coin-match', 'Coin Match', 'match-pairs', 1, (rng) => {
        const pairs = coins.map((coin) => ({ left: capitalizeWord(coin.name), right: formatCents(coin.value) }));
        return matchPairs('Match each coin to its value.', shuffle(rng, pairs));
      }),
      level('g1.pack-money.pennies', 'Count the Pennies', 'number-pad', 1, (rng) => {
        const n = randInt(rng, 2, 9);
        return numPad(`${n} ${n === 1 ? 'penny' : 'pennies'} is how many cents?`, n, { visual: { emoji: '🪙', count: n }, hint: 'Each penny is 1 cent' });
      }),
      level('g1.pack-money.nickels', 'Count the Nickels', 'number-pad', 1, (rng) => {
        const n = randInt(rng, 2, 8);
        return numPad(`${n} nickels is how many cents?`, n * 5, { hint: 'Count by 5s' });
      }),
      level('g1.pack-money.which-coin', 'Name the Coin', 'multiple-choice', 1, (rng) => {
        const coin = pick(rng, coins);
        return mc(`Which coin is worth ${formatCents(coin.value)}?`, capitalizeWord(coin.name), coins.filter((item) => item !== coin).map((item) => capitalizeWord(item.name)), rng);
      }),
      level('g1.pack-money.dimes', 'Count the Dimes', 'number-pad', 2, (rng) => {
        const n = randInt(rng, 2, 9);
        return numPad(`${n} dimes is how many cents?`, n * 10, { hint: 'Count by 10s' });
      }),
      level('g1.pack-money.nickel-penny', 'Nickels and Pennies', 'number-pad', 2, (rng) => {
        const nickels = randInt(rng, 1, 4);
        const pennies = randInt(rng, 1, 9);
        return numPad(`${coinCount(nickels, coins[1])} and ${coinCount(pennies, coins[0])} — how many cents?`, nickels * 5 + pennies, { hint: 'Count by 5s, then count on' });
      }),
      level('g1.pack-money.more-money', 'Which Is More?', 'multiple-choice', 2, (rng) => {
        const a = randInt(rng, 1, 4);
        let b = randInt(rng, 1, 4);
        if (a * 10 === b * 5) b = b === 4 ? 1 : b + 1;
        const dimesTotal = a * 10;
        const nickelsTotal = b * 5;
        const answer = dimesTotal > nickelsTotal ? `${a} dimes` : `${b} nickels`;
        return mc('Which is more money?', answer, [`${a} dimes`, `${b} nickels`, 'they are equal'].filter((label) => label !== answer), rng, { hint: 'Count by 10s for dimes and 5s for nickels' });
      }),
      level('g1.pack-money.combo-match', 'Coin Combo Match', 'match-pairs', 3, (rng) => {
        const pairs = shuffle(rng, coinCombos).slice(0, 4).map((combo) => ({ left: combo.text, right: formatCents(combo.total) }));
        return { ...matchPairs('Match each coin group to its value.', shuffle(rng, pairs)), hint: 'Add the value of every coin' };
      }),
      level('g1.pack-money.dime-penny', 'Dimes and Pennies', 'number-pad', 3, (rng) => {
        const dimes = randInt(rng, 1, 4);
        const pennies = randInt(rng, 1, 9);
        return numPad(`${coinCount(dimes, coins[2])} and ${coinCount(pennies, coins[0])} — how many cents?`, dimes * 10 + pennies, { hint: 'Count by 10s, then count on' });
      }),
      level('g1.pack-money.combo-total', 'Add Up the Coins', 'number-pad', 3, (rng) => {
        const quarters = randInt(rng, 0, 1);
        const dimes = randInt(rng, 0, 3);
        const pennies = randInt(rng, 1, 5);
        const parts = [quarters > 0 ? coinCount(quarters, coins[3]) : '', dimes > 0 ? coinCount(dimes, coins[2]) : '', coinCount(pennies, coins[0])].filter(Boolean).join(', ');
        return numPad(`${parts} — how many cents?`, quarters * 25 + dimes * 10 + pennies, { hint: 'Add the biggest coins first' });
      }),
      level('g1.pack-money.coin-riddle', 'Coin Riddles', 'multiple-choice', 3, (rng) => {
        const riddle = pick(rng, coinRiddles);
        return mc(riddle.clue, capitalizeWord(riddle.answer), coins.filter((coin) => coin.name !== riddle.answer).map((coin) => capitalizeWord(coin.name)), rng, { hint: 'Think about each coin\'s value' });
      }),
    ],
  },
  {
    id: 'g1.pack-data',
    title: 'Graph Grove',
    emoji: '🌳',
    domain: 'data',
    levels: [
      level('g1.pack-data.picture-read', 'Read the Picture Graph', 'number-pad', 1, (rng) => {
        const rows = shuffle(rng, storyObjects).slice(0, 3).map((item) => ({ ...item, count: randInt(rng, 1, 7) }));
        const chosen = pick(rng, rows);
        return numPad(`${rows.map((row) => `${capitalizeWord(row.plural)}: ${row.emoji.repeat(row.count)}`).join('\n')}\nHow many ${chosen.plural}?`, chosen.count, { hint: 'Count the pictures in that row' });
      }),
      level('g1.pack-data.tally', 'Tally Totals', 'number-pad', 1, (rng) => {
        const [first, second] = shuffle(rng, storyObjects).slice(0, 2);
        const a = randInt(rng, 1, 9);
        const b = randInt(rng, 1, 9);
        return numPad(`${capitalizeWord(first.plural)}: ${tallyFor(a)}\n${capitalizeWord(second.plural)}: ${tallyFor(b)}\nHow many votes in all?`, a + b, { hint: 'Count each bundle of 5, then count on' });
      }),
      level('g1.pack-data.most-fewest', 'Most and Least', 'multiple-choice', 1, (rng) => {
        const rows = shuffle(rng, storyObjects).slice(0, 3);
        const counts = randInts(rng, 1, 7, 3);
        const most = rng() < 0.5;
        const target = most ? Math.max(...counts) : Math.min(...counts);
        const index = counts.indexOf(target);
        const display = rows.map((row, i) => `${capitalizeWord(row.plural)}: ${row.emoji.repeat(counts[i])}`).join('\n');
        return mc(`${display}\nWhich has the ${most ? 'most' : 'fewest'}?`, rows[index].plural, rows.filter((_, i) => i !== index).map((row) => row.plural), rng);
      }),
      level('g1.pack-data.find-count', 'Find the Category', 'multiple-choice', 1, (rng) => {
        const rows = shuffle(rng, storyObjects).slice(0, 3);
        const counts = randInts(rng, 1, 8, 3);
        const index = randInt(rng, 0, 2);
        const display = rows.map((row, i) => `${capitalizeWord(row.plural)}: ${row.emoji.repeat(counts[i])}`).join('\n');
        return mc(`${display}\nWhich group has exactly ${counts[index]}?`, rows[index].plural, rows.filter((_, i) => i !== index).map((row) => row.plural), rng);
      }),
      level('g1.pack-data.bar-read', 'Read the Bar Graph', 'number-pad', 2, (rng) => {
        const rows = shuffle(rng, storyObjects).slice(0, 3).map((item) => ({ ...item, count: randInt(rng, 1, 8) }));
        const chosen = pick(rng, rows);
        return numPad(`${rows.map((row) => `${capitalizeWord(row.plural)}: ${'▇'.repeat(row.count)}`).join('\n')}\nHow many ${chosen.plural}?`, chosen.count, { hint: 'Count the bars in that row' });
      }),
      level('g1.pack-data.more-graph', 'How Many More on the Graph?', 'number-pad', 2, (rng) => {
        const [first, second] = shuffle(rng, storyObjects).slice(0, 2);
        const [smaller, bigger] = randInts(rng, 1, 8, 2);
        return numPad(`${capitalizeWord(first.plural)}: ${first.emoji.repeat(bigger)}\n${capitalizeWord(second.plural)}: ${second.emoji.repeat(smaller)}\nHow many more ${first.plural} than ${second.plural}?`, bigger - smaller, { hint: 'Find the difference between the rows' });
      }),
      level('g1.pack-data.total-graph', 'Total the Graph', 'number-pad', 2, (rng) => {
        const rows = shuffle(rng, storyObjects).slice(0, 3).map((item) => ({ ...item, count: randInt(rng, 1, 6) }));
        return numPad(`${rows.map((row) => `${capitalizeWord(row.plural)}: ${row.emoji.repeat(row.count)}`).join('\n')}\nHow many in all?`, rows.reduce((sum, row) => sum + row.count, 0), { hint: 'Add all three rows' });
      }),
      level('g1.pack-data.order-categories', 'Order the Graph', 'order-sequence', 2, (rng) => {
        const rows = shuffle(rng, storyObjects).slice(0, 4);
        const counts = randInts(rng, 1, 9, 4);
        const sequence = rows.map((row, i) => ({ label: `${row.plural} (${counts[i]})`, count: counts[i] })).sort((a, b) => a.count - b.count).map((entry) => entry.label);
        return orderSeq('Order the groups from fewest to most.', sequence);
      }),
      level('g1.pack-data.missing-row', 'Find the Missing Row', 'number-pad', 3, (rng) => {
        const [first, second, third] = shuffle(rng, storyObjects).slice(0, 3);
        const total = randInt(rng, 12, 20);
        const a = randInt(rng, 3, 8);
        const b = randInt(rng, 3, Math.min(8, total - a - 1));
        const answer = total - a - b;
        return numPad(`${total} votes in all.\n${capitalizeWord(first.plural)}: ${a}\n${capitalizeWord(second.plural)}: ${b}\n${capitalizeWord(third.plural)}: ?`, answer, { hint: 'Add the two rows you can see, then find what is left' });
      }),
      level('g1.pack-data.graph-tf', 'Graph True or False', 'true-false', 3, (rng) => {
        const [first, second] = shuffle(rng, storyObjects).slice(0, 2);
        const [a, b] = randInts(rng, 1, 8, 2);
        const claimMore = rng() < 0.5;
        const truth = claimMore ? b > a : b < a;
        return trueFalse(`${capitalizeWord(first.plural)}: ${a}\n${capitalizeWord(second.plural)}: ${b}\n${capitalizeWord(second.plural)} got ${claimMore ? 'more' : 'fewer'} votes than ${first.plural}.`, truth, { hint: 'Compare the two rows' });
      }),
      level('g1.pack-data.add-two-rows', 'Add Two Rows', 'number-pad', 3, (rng) => {
        const [first, second, third] = shuffle(rng, storyObjects).slice(0, 3);
        const a = randInt(rng, 2, 8);
        const b = randInt(rng, 2, 8);
        const c = randInt(rng, 1, 6);
        return numPad(`${capitalizeWord(first.plural)}: ${first.emoji.repeat(a)}\n${capitalizeWord(second.plural)}: ${second.emoji.repeat(b)}\n${capitalizeWord(third.plural)}: ${third.emoji.repeat(c)}\nHow many ${first.plural} and ${second.plural} together?`, a + b, { hint: 'Add just the two rows asked about' });
      }),
    ],
  },
  {
    id: 'g1.pack-measure',
    title: 'Ruler River',
    emoji: '📏',
    domain: 'measurement',
    levels: [
      level('g1.pack-measure.cube-length', 'How Many Cubes Long?', 'count-tap', 1, (rng) => {
        const count = randInt(rng, 2, 10);
        const unit = pick(rng, [{ emoji: '🟩', name: 'cubes' }, { emoji: '📎', name: 'paper clips' }]);
        return {
          ...mc(`The ribbon is this many ${unit.name} long. How long is it?`, String(count), numericDistractors(rng, count, [count - 1, count + 1, count + 2], { min: 0, max: 14 }), rng),
          kind: 'count-tap',
          visual: { emoji: unit.emoji, count },
        };
      }),
      level('g1.pack-measure.order-length', 'Line Up by Length', 'order-sequence', 1, (rng) => {
        const objects = shuffle(rng, ['pencil', 'ribbon', 'snake', 'straw', 'shoelace', 'paintbrush']).slice(0, 3);
        const lengths = randInts(rng, 2, 12, 3);
        const sequence = objects.map((name, i) => ({ label: `${name} (${lengths[i]} cubes)`, length: lengths[i] })).sort((a, b) => a.length - b.length).map((entry) => entry.label);
        return orderSeq('Order from shortest to longest.', sequence);
      }),
      level('g1.pack-measure.longest-shortest', 'Longest or Shortest?', 'multiple-choice', 1, (rng) => {
        const objects = shuffle(rng, ['pencil', 'ribbon', 'snake', 'straw', 'shoelace', 'paintbrush']).slice(0, 3);
        const lengths = randInts(rng, 2, 12, 3);
        const askLong = rng() < 0.5;
        const target = askLong ? Math.max(...lengths) : Math.min(...lengths);
        const index = lengths.indexOf(target);
        const labels = objects.map((name, i) => `${name} (${lengths[i]} cubes)`);
        return mc(`Which is the ${askLong ? 'longest' : 'shortest'}?`, labels[index], labels.filter((label) => label !== labels[index]), rng);
      }),
      level('g1.pack-measure.ruler-read', 'Read the Ruler', 'number-pad', 1, (rng) => {
        const length = randInt(rng, 2, 10);
        const object = pick(rng, ['pencil', 'worm', 'ribbon', 'straw']);
        return numPad(`The ${object} starts at 0 and ends at ${length} on an inch ruler. How many inches long is it?`, length, { hint: 'Start at 0 and read the end mark' });
      }),
      level('g1.pack-measure.ruler-offset', 'Not Starting at Zero', 'number-pad', 2, (rng) => {
        const start = randInt(rng, 1, 6);
        const length = randInt(rng, 2, 9);
        const object = pick(rng, ['crayon', 'feather', 'stick', 'leaf']);
        return numPad(`The ${object} starts at ${start} and ends at ${start + length} on the ruler. How many inches long?`, length, { hint: `Subtract: ${start + length} − ${start}` });
      }),
      level('g1.pack-measure.best-unit', 'Pick the Best Unit', 'multiple-choice', 2, (rng) => {
        const tool = pick(rng, measureTools);
        return mc(`What is the best unit to measure ${tool.object}?`, tool.answer, tool.distractors, rng, { hint: 'Small things use small units' });
      }),
      level('g1.pack-measure.compare-ribbons', 'Compare the Ribbons', 'number-pad', 2, (rng) => {
        const [smaller, bigger] = randInts(rng, 3, 12, 2);
        return numPad(`The red ribbon is ${smaller} cubes long and the blue ribbon is ${bigger} cubes long. How much longer is the blue one?`, bigger - smaller, { hint: 'Subtract the shorter length' });
      }),
      level('g1.pack-measure.estimate', 'About How Long?', 'multiple-choice', 2, (rng) => {
        const item = pick(rng, lengthEstimates);
        return mc(`About how long is ${item.object}?`, item.answer, item.distractors, rng, { hint: 'Think about the real object' });
      }),
      level('g1.pack-measure.ribbon-left', 'Cut Some Off', 'number-pad', 3, (rng) => {
        const a = randInt(rng, 6, 15);
        const b = randInt(rng, 1, a - 1);
        const subtract = rng() < 0.6;
        if (subtract) {
          return numPad(`A ribbon is ${a} paper clips long. You cut off a piece ${b} clips long. How long is the ribbon now?`, a - b, { hint: 'Subtract the part you cut' });
        }
        return numPad(`A red string is ${a} cubes long and a green string is ${b} cubes long. How long are they end to end?`, a + b, { hint: 'End to end means add' });
      }),
      level('g1.pack-measure.how-much-longer', 'How Much Longer in Inches?', 'number-pad', 3, (rng) => {
        const [smaller, bigger] = randInts(rng, 2, 15, 2);
        const [first, second] = shuffle(rng, ['crayon', 'marker', 'paintbrush', 'spoon']).slice(0, 2);
        return numPad(`A ${first} is ${bigger} inches long. A ${second} is ${smaller} inches long. How much longer is the ${first}?`, bigger - smaller, { hint: 'Subtract the shorter object' });
      }),
      level('g1.pack-measure.measure-tf', 'Measuring Facts', 'true-false', 3, (rng) => {
        const fact = pick(rng, measureFacts);
        return trueFalse(fact.text, fact.truth, { hint: 'Think about real objects and their sizes' });
      }),
    ],
  },
  {
    id: 'g1.pack-geometry',
    title: 'Shape Summit',
    emoji: '🔷',
    domain: 'geometry',
    levels: [
      level('g1.pack-geometry.name-flat', 'Name the Flat Shape', 'multiple-choice', 1, (rng) => {
        const shape = pick(rng, flatShapes);
        const clue = shape.sides === 0 ? 'I am round and have no sides.' : `I have ${shape.sides} sides and ${shape.corners} corners.`;
        return mc(`${clue} What shape am I?`, shape.name, shuffle(rng, flatShapes.filter((item) => item.name !== shape.name)).slice(0, 3).map((item) => item.name), rng, { visual: { text: shape.emoji } });
      }),
      level('g1.pack-geometry.count-sides', 'Count the Sides', 'number-pad', 1, (rng) => {
        const shape = pick(rng, flatShapes);
        return numPad(`How many sides does a ${shape.name} have?`, shape.sides, { visual: { text: shape.emoji } });
      }),
      level('g1.pack-geometry.count-corners', 'Count the Corners', 'number-pad', 1, (rng) => {
        const shape = pick(rng, flatShapes);
        return numPad(`How many corners does a ${shape.name} have?`, shape.corners, { visual: { text: shape.emoji }, hint: 'Corners are where two sides meet' });
      }),
      level('g1.pack-geometry.flat-solid', 'Flat or Solid?', 'multiple-choice', 1, (rng) => {
        const flat = rng() < 0.5;
        const shape = flat ? pick(rng, flatShapes) : pick(rng, solidShapes);
        const answer = flat ? 'flat (2-D)' : 'solid (3-D)';
        return mc(`Is a ${shape.name} flat or solid?`, answer, [flat ? 'solid (3-D)' : 'flat (2-D)', 'a number'].filter((label) => label !== answer), rng, { hint: 'Flat shapes lie on paper; solid shapes you can hold' });
      }),
      level('g1.pack-geometry.rule-shape', 'Which Shape Fits?', 'multiple-choice', 2, (rng) => {
        const fact = pick(rng, shapeFacts.filter((entry) => flatShapes.some((shape) => shape.name === entry.shape)));
        return mc(`Which shape has ${fact.fact}?`, fact.shape, shuffle(rng, flatShapes.filter((shape) => shape.name !== fact.shape)).slice(0, 3).map((shape) => shape.name), rng);
      }),
      level('g1.pack-geometry.face-shape', 'Faces of Solids', 'multiple-choice', 2, (rng) => {
        const shape = pick(rng, solidShapes.filter((item) => item.flatFaces > 0));
        return mc(`A ${shape.name} has a flat face shaped like a ?`, shape.faceShape, shuffle(rng, ['square', 'circle', 'triangle', 'rectangle'].filter((name) => name !== shape.faceShape)).slice(0, 3), rng, { hint: 'Picture the flat bottom of the solid' });
      }),
      level('g1.pack-geometry.world-shape', 'Shapes in the World', 'multiple-choice', 2, (rng) => {
        const item = pick(rng, realWorldShapes);
        return mc(`What solid shape is ${item.object}?`, item.shape, solidShapes.filter((shape) => shape.name !== item.shape).map((shape) => shape.name), rng);
      }),
      level('g1.pack-geometry.count-type', 'How Many of That Shape?', 'number-pad', 2, (rng) => {
        const target = pick(rng, flatShapes.filter((shape) => shape.name !== 'circle'));
        const triangleLike = ['triangle', 'trapezoid'];
        const decoys = shuffle(rng, flatShapes.filter((shape) => shape !== target && !(triangleLike.includes(target.name) && triangleLike.includes(shape.name)))).slice(0, 3);
        const count = randInt(rng, 2, 5);
        const items = shuffle(rng, [...Array(count).fill(target.emoji), ...decoys.map((shape) => shape.emoji)]);
        return { ...numPad(`${items.join(' ')}\nHow many are ${target.name}s?`, count, { hint: `Only count the ${target.name}s` }), visual: { items } };
      }),
      level('g1.pack-geometry.count-faces', 'Count the Flat Faces', 'number-pad', 3, (rng) => {
        const shape = pick(rng, solidShapes);
        return numPad(`How many flat faces does a ${shape.name} have?`, shape.flatFaces, { hint: 'Curved surfaces are not flat faces' });
      }),
      level('g1.pack-geometry.compose', 'Build a Shape', 'multiple-choice', 3, (rng) => {
        const fact = pick(rng, composeFacts);
        return mc(`${capitalizeWord(fact.parts)} can make ?`, fact.result, fact.distractors, rng, { hint: 'Picture putting the pieces together' });
      }),
      level('g1.pack-geometry.shape-match', 'Shape Facts Match', 'match-pairs', 3, (rng) => {
        const pairs = shuffle(rng, shapeFacts).slice(0, 4).map((entry) => ({ left: entry.shape, right: entry.fact }));
        return { ...matchPairs('Match each shape to its fact.', shuffle(rng, pairs)), hint: 'Count sides, corners, or faces' };
      }),
    ],
  },
  {
    id: 'g1.pack-fractions',
    title: 'Pizza Fraction Falls',
    emoji: '🍕',
    domain: 'fractions',
    levels: [
      level('g1.pack-fractions.name-shares', 'Name the Shares', 'multiple-choice', 1, (rng) => {
        const food = pick(rng, ['🍕 pizza', '🍪 cookie', '🍰 cake', '🥪 sandwich']);
        return mc(`A ${food} is cut into 2 equal pieces. Each piece is a ?`, 'one half', ['one third', 'one fourth', 'one whole'], rng, { hint: 'Two equal shares are halves' });
      }),
      level('g1.pack-fractions.count-pieces', 'Count the Pieces', 'number-pad', 1, (rng) => {
        const halves = rng() < 0.5;
        const n = halves ? 2 : 4;
        return numPad(`A pie is cut into ${halves ? 'halves' : 'fourths'}. How many pieces make the whole pie?`, n, { hint: 'Every piece is an equal share' });
      }),
      level('g1.pack-fractions.half-set', 'Half of a Set', 'number-pad', 1, (rng) => {
        const item = pick(rng, storyObjects);
        const half = randInt(rng, 2, 8);
        return { ...numPad(`What is one half of ${2 * half}?`, half, { hint: 'Split into two equal groups' }), visual: { emoji: item.emoji, groups: [half, half] } };
      }),
      level('g1.pack-fractions.fourths-name', 'Four Equal Shares', 'multiple-choice', 2, (rng) => {
        const food = pick(rng, ['🧇 waffle', '🍕 pizza', '🍫 chocolate bar', '🥧 pie']);
        return mc(`A ${food} is cut into 4 equal pieces. Each piece is a ?`, 'one fourth', ['one half', 'one third', 'one whole'], rng, { hint: 'Four equal shares are fourths' });
      }),
      level('g1.pack-fractions.fourth-set', 'A Fourth of a Set', 'number-pad', 2, (rng) => {
        const item = pick(rng, storyObjects);
        const fourth = randInt(rng, 1, 5);
        return { ...numPad(`What is one fourth of ${4 * fourth}?`, fourth, { hint: 'Split into four equal groups' }), visual: { emoji: item.emoji, groups: [fourth, fourth, fourth, fourth] } };
      }),
      level('g1.pack-fractions.tap-half', 'Tap the Half', 'count-tap', 2, (rng) => {
        const item = pick(rng, storyObjects);
        const half = randInt(rng, 2, 8);
        return {
          ...mc(`Half of the ${item.plural} are red. How many are red?`, String(half), numericDistractors(rng, half, [half - 1, half + 1, 2 * half], { min: 0, max: 18 }), rng),
          kind: 'count-tap',
          visual: { emoji: item.emoji, groups: [half, half] },
          hint: 'Half means one of the two equal groups',
        };
      }),
      level('g1.pack-fractions.equal-parts', 'Equal or Not?', 'multiple-choice', 2, (rng) => {
        const fourths = rng() < 0.5;
        const answer = fourths ? '4 equal parts' : '2 equal parts';
        return mc(`Which picture shows ${fourths ? 'fourths' : 'halves'}?`, answer, [`${fourths ? 4 : 2} parts with different sizes`, fourths ? '2 equal parts' : '4 equal parts', '3 equal parts'].filter((label) => label !== answer), rng, { hint: 'Equal shares are all the same size' });
      }),
      level('g1.pack-fractions.shares-left', 'Pieces Left', 'number-pad', 2, (rng) => {
        const fourths = rng() < 0.5;
        const total = fourths ? 4 : 2;
        const eaten = randInt(rng, 1, total - 1);
        return numPad(`A pie is cut into ${fourths ? 'fourths' : 'halves'} (${total} equal pieces). You eat ${eaten}. How many pieces are left?`, total - eaten);
      }),
      level('g1.pack-fractions.bigger-share', 'Which Share Is Bigger?', 'multiple-choice', 3, (rng) => {
        const n = randInt(rng, 2, 8);
        return mc(`Which is bigger: one half of ${2 * n} or one fourth of ${2 * n}?`, 'one half', ['one fourth', 'they are equal'], rng, { hint: `One half of ${2 * n} is ${n}; one fourth is smaller` });
      }),
      level('g1.pack-fractions.share-match', 'Share Match', 'match-pairs', 3, (rng) => {
        const pairs = shuffle(rng, shareMatchFacts).slice(0, 4).map((entry) => ({ left: entry.left, right: entry.right }));
        return { ...matchPairs('Match each share to its answer.', shuffle(rng, pairs)), hint: 'Halves split into 2 groups; fourths into 4' };
      }),
      level('g1.pack-fractions.shares-tf', 'Share True or False', 'true-false', 3, (rng) => {
        const fact = pick(rng, shareFacts);
        return trueFalse(fact.text, fact.truth, { hint: 'Equal shares are the same size' });
      }),
    ],
  },
  {
    id: 'g1.pack-decimals',
    title: 'Penny Decimal Dock',
    emoji: '💲',
    domain: 'decimals',
    levels: [
      level('g1.pack-decimals.cents-dollars', 'Cents to Dollars', 'match-pairs', 1, (rng) => {
        const pairs = shuffle(rng, centsToDollars).slice(0, 4).map((entry) => ({ left: entry.cents, right: entry.dollars }));
        return matchPairs('Match each amount to how it is written.', shuffle(rng, pairs));
      }),
      level('g1.pack-decimals.read-money', 'Read a Money Amount', 'multiple-choice', 1, (rng) => {
        const entry = pick(rng, centsToDollars);
        const value = parseInt(entry.cents, 10);
        const answer = `${value} cents`;
        return mc(`${entry.dollars} is how many cents?`, answer, [`${Math.floor(value / 10)} cents`, `${value * 10} cents`, `${value + 5} cents`].filter((label) => label !== answer), rng, { hint: 'The numbers after the dollar dot are cents' });
      }),
      level('g1.pack-decimals.dollar-cents', 'Dollars to Cents', 'number-pad', 1, (rng) => {
        const dollars = randInt(rng, 1, 5);
        return numPad(`${formatDollars(dollars * 100)} is how many cents?`, dollars * 100, { hint: 'One dollar is 100 cents' });
      }),
      level('g1.pack-decimals.write-cents', 'Write the Cents', 'number-pad', 2, (rng) => {
        const cents = randInt(rng, 5, 95);
        return numPad(`${formatDollars(cents)} is how many cents?`, cents, { hint: 'Drop the dollar sign and dot' });
      }),
      level('g1.pack-decimals.dollars-cents', 'Dollars and Cents', 'multiple-choice', 2, (rng) => {
        const dollars = randInt(rng, 1, 5);
        const cents = pick(rng, [25, 50, 75]);
        const answer = `${dollars} ${dollars === 1 ? 'dollar' : 'dollars'} and ${cents} cents`;
        return mc(`${formatDollars(dollars * 100 + cents)} means ?`, answer, [`${cents} dollars and ${dollars} cents`, `${dollars} dollars and ${dollars} cents`, `${dollars + 1} dollars and ${cents} cents`], rng, { hint: 'The number before the dot is dollars' });
      }),
      level('g1.pack-decimals.which-more', 'Which Is More Money?', 'multiple-choice', 2, (rng) => {
        const [first, second] = shuffle(rng, centsToDollars).slice(0, 2);
        const a = parseInt(first.cents, 10);
        const b = parseInt(second.cents, 10);
        const answer = a > b ? first.dollars : second.dollars;
        return mc('Which is more money?', answer, [first.dollars, second.dollars, 'they are equal'].filter((label) => label !== answer), rng, { hint: 'Bigger cents means more money' });
      }),
      level('g1.pack-decimals.write-decimal', 'Write It with a Dollar Sign', 'multiple-choice', 2, (rng) => {
        const cents = pick(rng, [15, 25, 35, 45, 55, 65, 75, 85, 95]);
        const answer = formatDollars(cents);
        return mc(`How do you write ${cents} cents with a dollar sign?`, answer, [`$${cents}.00`, `$0.0${cents % 10}`], rng, { hint: 'Cents go after the dot' });
      }),
      level('g1.pack-decimals.coin-decimal', 'Coins to Dollars Match', 'match-pairs', 3, (rng) => {
        const pairs = shuffle(rng, coinDecimals).slice(0, 4);
        return { ...matchPairs('Match each coin to its written value.', shuffle(rng, pairs)), hint: 'A dime is $0.10 and a nickel is $0.05' };
      }),
      level('g1.pack-decimals.decimal-tf', 'Money Writing True or False', 'true-false', 3, (rng) => {
        const fact = pick(rng, decimalFacts);
        return trueFalse(fact.text, fact.truth, { hint: 'Cents go after the dollar dot' });
      }),
      level('g1.pack-decimals.same-money', 'Same Amount', 'multiple-choice', 3, (rng) => {
        const cents = pick(rng, [10, 25, 40, 50, 60, 75, 90]);
        const answer = formatDollars(cents);
        return mc(`Which shows the same amount as ${formatCents(cents)}?`, answer, [`$${cents}.00`, `$0.0${Math.floor(cents / 10)}`, formatDollars(cents + 5)].filter((label) => label !== answer), rng, { hint: 'Cents are written after the dot' });
      }),
    ],
  },
];
