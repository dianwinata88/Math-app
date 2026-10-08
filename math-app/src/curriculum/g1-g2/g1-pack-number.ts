import { pick, randInt, randInts, shuffle } from '../../core/rng';
import type { UnitDef } from '../../core/types';
import { level, matchPairs, mc, numPad, orderSeq, trueFalse } from '../helpers';
import { capitalizeWord, compareSymbol, numericDistractors } from './shared';
import { emojiPatterns, kidNames, numberToWords, numberWords, parityFacts, storyObjects } from './g1-pack-banks';

const twoKids = (rng: () => number) => shuffle(rng, kidNames).slice(0, 2);

// Split a count into rows of five (ten-frame style) so no visual row exceeds 8 glyphs.
const inFives = (n: number): number[] => {
  const groups: number[] = [];
  let left = n;
  while (left > 8) {
    groups.push(5);
    left -= 5;
  }
  groups.push(left);
  return groups;
};

export const g1PackNumbers: UnitDef[] = [
  {
    id: 'g1.pack-counting',
    title: 'Counting Campfire',
    emoji: '🔢',
    domain: 'counting',
    levels: [
      level('g1.pack-counting.objects', 'Count the Treats', 'count-tap', 1, (rng) => {
        const item = pick(rng, storyObjects);
        const count = randInt(rng, 5, 18);
        return {
          ...mc(`How many ${item.plural}?`, String(count), numericDistractors(rng, count, [count - 1, count + 1, count + 2], { min: 0, max: 30 }), rng),
          kind: 'count-tap',
          visual: { emoji: item.emoji, count },
        };
      }),
      level('g1.pack-counting.forward', 'Count Forward', 'order-sequence', 1, (rng) => {
        const start = randInt(rng, 15, 115);
        return orderSeq('Put the numbers in counting order.', Array.from({ length: 5 }, (_, i) => String(start + i)));
      }),
      level('g1.pack-counting.backward', 'Count Backward', 'order-sequence', 1, (rng) => {
        const start = randInt(rng, 25, 120);
        return orderSeq('Put the numbers in order, counting backward.', Array.from({ length: 5 }, (_, i) => String(start - i)));
      }),
      level('g1.pack-counting.before', 'Just Before', 'number-pad', 1, (rng) => {
        const n = randInt(rng, 21, 120);
        return numPad(`What number comes just before ${n}?`, n - 1, { hint: 'Count backward one step' });
      }),
      level('g1.pack-counting.after', 'Just After', 'number-pad', 1, (rng) => {
        const n = randInt(rng, 1, 119);
        return numPad(`What number comes just after ${n}?`, n + 1, { hint: 'Count forward one step' });
      }),
      level('g1.pack-counting.missing', 'Missing Number', 'multiple-choice', 2, (rng) => {
        const start = randInt(rng, 10, 110);
        const gap = randInt(rng, 1, 3);
        const missing = start + gap;
        const display = Array.from({ length: 5 }, (_, i) => (i === gap ? '?' : String(start + i))).join(', ');
        return mc(`Which number is missing?\n${display}`, String(missing), numericDistractors(rng, missing, [missing - 1, missing + 1, missing + 10, start - 1], { min: 0, max: 120 }), rng);
      }),
      level('g1.pack-counting.words', 'Number Words', 'match-pairs', 2, (rng) => {
        const chosen = shuffle(rng, numberWords).slice(0, 4);
        return matchPairs('Match each number word to its number.', shuffle(rng, chosen.map((entry) => ({ left: entry.word, right: String(entry.value) }))));
      }),
      level('g1.pack-counting.count-on', 'Count On', 'number-pad', 2, (rng) => {
        const n = randInt(rng, 5, 100);
        const k = randInt(rng, 2, Math.min(9, 120 - n));
        return numPad(`Start at ${n} and count on ${k} more. Where do you land?`, n + k, { hint: `${n} … then count up ${k} more` });
      }),
      level('g1.pack-counting.tens-ones', 'Count Tens and Ones', 'count-tap', 2, (rng) => {
        const tens = randInt(rng, 1, 2);
        const ones = randInt(rng, 1, 9);
        const answer = tens * 10 + ones;
        return {
          ...mc('Count by tens and ones. How many squares?', String(answer), numericDistractors(rng, answer, [answer - 1, answer + 1, answer + 10, tens * 10], { min: 0, max: 40 }), rng),
          kind: 'count-tap',
          visual: { emoji: '🟦', groups: [...inFives(tens * 10), ...inFives(ones)] },
          hint: 'Count each row of ten first',
        };
      }),
      level('g1.pack-counting.more-fewer', 'Which Group Has More?', 'multiple-choice', 2, (rng) => {
        const [first, second] = shuffle(rng, storyObjects).slice(0, 2);
        const [a, b] = randInts(rng, 2, 8, 2);
        const askMore = rng() < 0.5;
        const winner = askMore ? second : first;
        return mc(
          `${capitalizeWord(first.plural)}: ${first.emoji.repeat(a)}\n${capitalizeWord(second.plural)}: ${second.emoji.repeat(b)}\nWhich group has ${askMore ? 'more' : 'fewer'}?`,
          winner.plural,
          [first.plural, second.plural, 'they are equal'].filter((label) => label !== winner.plural),
          rng,
        );
      }),
      level('g1.pack-counting.chart', 'Hundred Chart Neighbors', 'number-pad', 3, (rng) => {
        const n = randInt(rng, 11, 110);
        const below = rng() < 0.5;
        return numPad(
          below ? `On a 120 chart, what number is right below ${n}?` : `On a 120 chart, what number is right above ${n}?`,
          below ? n + 10 : n - 10,
          { hint: 'Moving down one row adds 10. Moving up takes away 10.' },
        );
      }),
    ],
  },
  {
    id: 'g1.pack-facts',
    title: 'Firefly Fact Forest',
    emoji: '✨',
    domain: 'operations',
    levels: [
      level('g1.pack-facts.add-ten', 'Sums to Ten', 'multiple-choice', 1, (rng) => {
        const a = randInt(rng, 1, 9);
        const b = randInt(rng, 1, 10 - a);
        const answer = a + b;
        return mc(`${a} + ${b} = ?`, String(answer), numericDistractors(rng, answer, [answer - 1, answer + 1, answer + 2, a], { min: 0, max: 15 }), rng, { visual: { text: `${a} + ${b} =` } });
      }),
      level('g1.pack-facts.sub-ten', 'Subtract Within Ten', 'number-pad', 1, (rng) => {
        const a = randInt(rng, 3, 10);
        const b = randInt(rng, 1, a);
        return numPad(`${a} − ${b} = ?`, a - b, { visual: { text: `${a} − ${b} =` } });
      }),
      level('g1.pack-facts.doubles', 'Doubles', 'multiple-choice', 1, (rng) => {
        const n = randInt(rng, 1, 9);
        const answer = 2 * n;
        return mc(`${n} + ${n} = ?`, String(answer), numericDistractors(rng, answer, [answer - 1, answer + 1, answer + 2], { min: 0, max: 20 }), rng, { visual: { emoji: '🐞', groups: [n, n] }, hint: 'A double is the same number twice' });
      }),
      level('g1.pack-facts.add-twenty', 'Add Up to Twenty', 'number-pad', 2, (rng) => {
        const a = randInt(rng, 5, 15);
        const b = randInt(rng, 3, 20 - a);
        return numPad(`${a} + ${b} = ?`, a + b, { visual: { text: `${a} + ${b} =` } });
      }),
      level('g1.pack-facts.sub-twenty', 'Subtract Within Twenty', 'number-pad', 2, (rng) => {
        const a = randInt(rng, 11, 20);
        const b = randInt(rng, 3, 9);
        return numPad(`${a} − ${b} = ?`, a - b, { visual: { text: `${a} − ${b} =` } });
      }),
      level('g1.pack-facts.doubles-plus-one', 'Doubles Plus One', 'multiple-choice', 2, (rng) => {
        const n = randInt(rng, 1, 9);
        const answer = 2 * n + 1;
        return mc(`${n} + ${n + 1} = ?`, String(answer), numericDistractors(rng, answer, [2 * n, 2 * n + 2, 2 * n + 3], { min: 0, max: 20 }), rng, { hint: `Use the double: ${n} + ${n} = ${2 * n}, then add 1` });
      }),
      level('g1.pack-facts.make-ten', 'Make a Ten to Add', 'number-pad', 2, (rng) => {
        const a = pick(rng, [7, 8, 9]);
        const b = randInt(rng, 11 - a, 9);
        return numPad(`${a} + ${b} = ?`, a + b, { visual: { text: `${a} + ${b} =` }, hint: `Make a ten first: ${a} + ${10 - a} = 10` });
      }),
      level('g1.pack-facts.three-addends', 'Add Three Numbers', 'number-pad', 2, (rng) => {
        const a = randInt(rng, 1, 8);
        const b = randInt(rng, 1, 8);
        const c = randInt(rng, 1, 20 - a - b);
        return numPad(`${a} + ${b} + ${c} = ?`, a + b + c, { hint: 'Add two numbers first, then add the third' });
      }),
      level('g1.pack-facts.fact-family', 'Fact Family Match', 'match-pairs', 2, (rng) => {
        const sums = randInts(rng, 6, 18, 4);
        const pairs = sums.map((sum) => {
          const a = randInt(rng, 1, sum - 1);
          return { left: `${a} + ${sum - a} = ${sum}`, right: `${sum} − ${a} = ${sum - a}` };
        });
        return { ...matchPairs('Match each addition fact to its subtraction fact.', shuffle(rng, pairs)), hint: 'Fact families use the same three numbers' };
      }),
      level('g1.pack-facts.commutative', 'Flip the Addends', 'match-pairs', 2, (rng) => {
        const sums = randInts(rng, 8, 18, 4);
        const pairs = sums.map((sum) => {
          const a = randInt(rng, 1, Math.floor((sum - 1) / 2));
          return { left: `${a} + ${sum - a}`, right: `${sum - a} + ${a}` };
        });
        return { ...matchPairs('Match each addition to its flip.', shuffle(rng, pairs)), hint: 'You can add in any order' };
      }),
      level('g1.pack-facts.mixed', 'Mixed Facts Sprint', 'number-pad', 3, (rng) => {
        const add = rng() < 0.5;
        if (add) {
          const a = randInt(rng, 8, 15);
          const b = randInt(rng, 4, 20 - a);
          return numPad(`${a} + ${b} = ?`, a + b, { visual: { text: `${a} + ${b} =` }, hint: 'Read the sign before you solve' });
        }
        const a = randInt(rng, 12, 20);
        const b = randInt(rng, 4, 9);
        return numPad(`${a} − ${b} = ?`, a - b, { visual: { text: `${a} − ${b} =` }, hint: 'Read the sign before you solve' });
      }),
    ],
  },
  {
    id: 'g1.pack-strategies',
    title: 'Monkey Strategy Grove',
    emoji: '🐒',
    domain: 'operations',
    levels: [
      level('g1.pack-strategies.count-on', 'Count On to Add', 'number-pad', 1, (rng) => {
        const a = randInt(rng, 4, 15);
        const b = randInt(rng, 1, 3);
        return numPad(`${a} + ${b} = ?`, a + b, { hint: `Start at ${a} and count on ${b}` });
      }),
      level('g1.pack-strategies.count-back', 'Count Back to Subtract', 'number-pad', 1, (rng) => {
        const a = randInt(rng, 5, 15);
        const b = randInt(rng, 1, 3);
        return numPad(`${a} − ${b} = ?`, a - b, { hint: `Start at ${a} and count back ${b}` });
      }),
      level('g1.pack-strategies.number-line', 'Number Line Hops', 'multiple-choice', 1, (rng) => {
        const start = randInt(rng, 2, 10);
        const jump = randInt(rng, 2, Math.min(9, 19 - start));
        const answer = start + jump;
        return mc(`A frog sits on ${start} and hops forward ${jump}. Where does it land?`, String(answer), numericDistractors(rng, answer, [answer - 1, answer + 1, start - jump], { min: 0, max: 20 }), rng, { visual: { text: `${start} + ${jump}` } });
      }),
      level('g1.pack-strategies.break-apart', 'Break Apart to Make Ten', 'multiple-choice', 2, (rng) => {
        const a = pick(rng, [8, 9]);
        const b = randInt(rng, 11 - a, 9);
        const missing = b - (10 - a);
        return mc(`${a} + ${b} = ${a} + ${10 - a} + ?`, String(missing), numericDistractors(rng, missing, [missing - 1, missing + 1, 10 - a, b], { min: 0, max: 12 }), rng, { hint: 'Break the second number to fill the ten' });
      }),
      level('g1.pack-strategies.doubles-minus-one', 'Doubles Minus One', 'multiple-choice', 2, (rng) => {
        const n = randInt(rng, 2, 9);
        const answer = 2 * n - 1;
        return mc(`${n} + ${n - 1} = ?`, String(answer), numericDistractors(rng, answer, [2 * n, 2 * n - 2, 2 * n + 1], { min: 0, max: 20 }), rng, { hint: `Use the double: ${n} + ${n} = ${2 * n}, then take 1` });
      }),
      level('g1.pack-strategies.ten-frame', 'Ten Frame Add', 'count-tap', 2, (rng) => {
        const ones = randInt(rng, 1, 9);
        const answer = 10 + ones;
        return {
          ...mc(`A ten frame is full and ${ones} more dots are below. How many dots in all?`, String(answer), numericDistractors(rng, answer, [answer - 1, answer + 1, ones, 10], { min: 0, max: 20 }), rng),
          kind: 'count-tap',
          visual: { emoji: '🔵', groups: [5, 5, ...inFives(ones)] },
        };
      }),
      level('g1.pack-strategies.subtract-to-ten', 'Subtract Through Ten', 'number-pad', 2, (rng) => {
        const a = randInt(rng, 12, 18);
        const b = randInt(rng, a - 9, 9);
        return numPad(`${a} − ${b} = ?`, a - b, { visual: { text: `${a} − ${b} =` }, hint: `Take away ${a - 10} to reach 10, then take the rest` });
      }),
      level('g1.pack-strategies.missing-jump', 'How Far Did It Hop?', 'number-pad', 2, (rng) => {
        const start = randInt(rng, 2, 10);
        const end = randInt(rng, start + 2, 19);
        return numPad(`A frog starts on ${start} and lands on ${end}. How far did it hop?`, end - start, { hint: 'Count up from the start to the landing spot' });
      }),
      level('g1.pack-strategies.doubles-plus-two', 'Doubles Plus Two', 'multiple-choice', 3, (rng) => {
        const n = randInt(rng, 3, 9);
        const answer = 2 * n + 2;
        return mc(`${n} + ${n + 2} = ?`, String(answer), numericDistractors(rng, answer, [2 * n + 1, 2 * n + 3, 2 * n, 2 * n + 4], { min: 0, max: 20 }), rng, { hint: `Use the double: ${n} + ${n} = ${2 * n}, then add 2` });
      }),
      level('g1.pack-strategies.make-ten-three', 'Find the Hidden Ten', 'number-pad', 3, (rng) => {
        const a = randInt(rng, 1, 9);
        const b = 10 - a;
        const c = randInt(rng, 1, 9);
        return numPad(`${a} + ${b} + ${c} = ?`, 10 + c, { hint: `${a} + ${b} makes a ten hiding in the problem` });
      }),
      level('g1.pack-strategies.related-facts', 'Related Facts', 'true-false', 3, (rng) => {
        const a = randInt(rng, 2, 9);
        const b = randInt(rng, 2, 9);
        const sum = a + b;
        const truth = rng() < 0.5;
        const claimed = truth ? b : b + pick(rng, [-1, 1]);
        return trueFalse(`If ${a} + ${b} = ${sum}, then ${sum} − ${a} = ${claimed}.`, truth, { hint: 'Use the fact family to check' });
      }),
    ],
  },
  {
    id: 'g1.pack-place-value',
    title: 'Turtle Tens Lagoon',
    emoji: '🐢',
    domain: 'place-value',
    levels: [
      level('g1.pack-place-value.tens-ones', 'Tens Plus Ones', 'number-pad', 1, (rng) => {
        const tens = randInt(rng, 1, 11);
        const ones = randInt(rng, 0, 9);
        return numPad(`${tens} tens and ${ones} ones`, tens * 10 + ones);
      }),
      level('g1.pack-place-value.tens-digit', 'How Many Tens?', 'multiple-choice', 1, (rng) => {
        const n = randInt(rng, 11, 99);
        const tens = Math.floor(n / 10);
        return mc(`How many tens are in ${n}?`, String(tens), numericDistractors(rng, tens, [n % 10, tens - 1, tens + 1], { min: 0, max: 12 }), rng);
      }),
      level('g1.pack-place-value.expanded', 'Expanded Form', 'number-pad', 1, (rng) => {
        const tens = randInt(rng, 1, 9);
        const ones = randInt(rng, 1, 9);
        return numPad(`${tens * 10} + ${ones} = ?`, tens * 10 + ones, { visual: { text: `${tens * 10} + ${ones} =` } });
      }),
      level('g1.pack-place-value.word-number', 'Word to Number', 'number-pad', 1, (rng) => {
        const n = randInt(rng, 21, 99);
        return numPad(`Write the number: ${numberToWords(n)}`, n, { hint: 'The first word is the tens' });
      }),
      level('g1.pack-place-value.block-model', 'Count the Blocks', 'count-tap', 1, (rng) => {
        const tens = randInt(rng, 1, 2);
        const ones = randInt(rng, 1, 9);
        const answer = tens * 10 + ones;
        return {
          ...mc('How many blocks in all?', String(answer), numericDistractors(rng, answer, [answer - 1, answer + 1, answer + 10, tens + ones], { min: 0, max: 40 }), rng),
          kind: 'count-tap',
          visual: { emoji: '🟧', groups: [...inFives(tens * 10), ...inFives(ones)] },
          hint: 'Each tall stack is ten blocks',
        };
      }),
      level('g1.pack-place-value.expanded-match', 'Expanded Form Match', 'match-pairs', 2, (rng) => {
        const tens = randInts(rng, 1, 9, 4);
        const pairs = tens.map((ten) => {
          const ones = randInt(rng, 1, 9);
          return { left: `${ten * 10} + ${ones}`, right: String(ten * 10 + ones) };
        });
        return matchPairs('Match each expanded form to its number.', shuffle(rng, pairs));
      }),
      level('g1.pack-place-value.compare', 'Compare the Numbers', 'multiple-choice', 2, (rng) => {
        const a = randInt(rng, 10, 99);
        const b = rng() < 0.15 ? a : randInt(rng, 10, 99);
        const answer = compareSymbol(a, b);
        return mc('Which sign goes in the circle?', answer, ['<', '>', '='].filter((symbol) => symbol !== answer), rng, { visual: { text: `${a} ○ ${b}` }, hint: 'Compare the tens first' });
      }),
      level('g1.pack-place-value.order', 'Order the Numbers', 'order-sequence', 2, (rng) => {
        const values = randInts(rng, 10, 99, 5);
        return orderSeq('Order from least to greatest.', values.map(String));
      }),
      level('g1.pack-place-value.ten-more-less', 'Ten Up, Ten Down', 'number-pad', 2, (rng) => {
        const n = randInt(rng, 21, 110);
        const more = rng() < 0.5;
        return numPad(`${more ? '10 more' : '10 less'} than ${n}`, more ? n + 10 : n - 10, { hint: 'Only the tens digit changes' });
      }),
      level('g1.pack-place-value.add-ones', 'Add a One-Digit Number', 'number-pad', 2, (rng) => {
        const tens = randInt(rng, 1, 9);
        const ones = randInt(rng, 0, 8);
        const addend = randInt(rng, 1, 9 - ones);
        const a = tens * 10 + ones;
        return numPad(`${a} + ${addend} = ?`, a + addend, { visual: { text: `${a} + ${addend} =` }, hint: 'Add the ones; the tens stay the same' });
      }),
      level('g1.pack-place-value.add-tens', 'Add Tens to a Number', 'number-pad', 3, (rng) => {
        const n = randInt(rng, 11, 80);
        const tens = randInt(rng, 1, Math.floor((120 - n) / 10));
        return numPad(`${n} + ${tens * 10} = ?`, n + tens * 10, { visual: { text: `${n} + ${tens * 10} =` }, hint: 'Add the tens digit' });
      }),
    ],
  },
  {
    id: 'g1.pack-stories',
    title: 'Safari Story Camp',
    emoji: '🦁',
    domain: 'word-problems',
    levels: [
      level('g1.pack-stories.add-to', 'Some More Come', 'number-pad', 1, (rng) => {
        const [first, second] = twoKids(rng);
        const item = pick(rng, storyObjects);
        const a = randInt(rng, 2, 10);
        const b = randInt(rng, 1, 20 - a);
        return numPad(`${first} has ${a} ${item.plural}. ${second} gives ${first} ${b} more. How many ${item.plural} does ${first} have now?`, a + b, { hint: 'Add the two amounts' });
      }),
      level('g1.pack-stories.take-from', 'Some Go Away', 'number-pad', 1, (rng) => {
        const name = pick(rng, kidNames);
        const item = pick(rng, storyObjects);
        const a = randInt(rng, 4, 15);
        const b = randInt(rng, 1, a - 1);
        return numPad(`${name} has ${a} ${item.plural}. ${name} gives away ${b}. How many ${item.plural} are left?`, a - b, { hint: 'Take away from the total' });
      }),
      level('g1.pack-stories.put-together', 'Put Them Together', 'multiple-choice', 1, (rng) => {
        const [first, second] = shuffle(rng, storyObjects).slice(0, 2);
        const a = randInt(rng, 2, 9);
        const b = randInt(rng, 2, 18 - a);
        const answer = a + b;
        return mc(`${a} ${first.plural} ${first.emoji} and ${b} ${second.plural} ${second.emoji} are in a basket. How many in all?`, String(answer), numericDistractors(rng, answer, [a, b, answer - 1, answer + 1], { min: 0, max: 20 }), rng);
      }),
      level('g1.pack-stories.take-apart', 'How Many Are Left Over?', 'number-pad', 2, (rng) => {
        const item = pick(rng, storyObjects);
        const total = randInt(rng, 5, 15);
        const part = randInt(rng, 1, total - 1);
        return numPad(`There are ${total} ${item.plural} in a box. ${part} are red. How many are NOT red?`, total - part, { hint: 'The two parts make the whole' });
      }),
      level('g1.pack-stories.missing-change-add', 'How Many Did They Get?', 'number-pad', 2, (rng) => {
        const name = pick(rng, kidNames);
        const item = pick(rng, storyObjects);
        const a = randInt(rng, 2, 10);
        const got = randInt(rng, 1, 9);
        return numPad(`${name} had ${a} ${item.plural}. ${name} got some more. Now ${name} has ${a + got}. How many did ${name} get?`, got, { hint: 'Count up from the start to the end' });
      }),
      level('g1.pack-stories.missing-change-take', 'How Many Went Away?', 'number-pad', 2, (rng) => {
        const name = pick(rng, kidNames);
        const item = pick(rng, storyObjects);
        const a = randInt(rng, 5, 15);
        const left = randInt(rng, 1, a - 1);
        return numPad(`${name} had ${a} ${item.plural}. Some were given away. Now ${name} has ${left}. How many were given away?`, a - left, { hint: 'Compare the start to what is left' });
      }),
      level('g1.pack-stories.compare-more', 'Find the Difference', 'number-pad', 2, (rng) => {
        const [first, second] = twoKids(rng);
        const item = pick(rng, storyObjects);
        const a = randInt(rng, 4, 15);
        const b = randInt(rng, 1, a - 1);
        return numPad(`${first} has ${a} ${item.plural}. ${second} has ${b}. How many more does ${first} have?`, a - b, { hint: 'Find the difference' });
      }),
      level('g1.pack-stories.compare-fewer', 'How Many Fewer?', 'number-pad', 2, (rng) => {
        const [first, second] = twoKids(rng);
        const item = pick(rng, storyObjects);
        const smaller = randInt(rng, 2, 12);
        const diff = randInt(rng, 1, Math.min(6, 19 - smaller));
        return numPad(`${first} has ${smaller + diff} ${item.plural}. ${second} has ${smaller}. How many fewer does ${second} have?`, diff, { hint: 'Find the difference' });
      }),
      level('g1.pack-stories.bigger-unknown', 'The Bigger Unknown', 'multiple-choice', 3, (rng) => {
        const [first, second] = twoKids(rng);
        const item = pick(rng, storyObjects);
        const a = randInt(rng, 2, 10);
        const b = randInt(rng, 1, 9);
        const answer = a + b;
        return mc(`${first} has ${a} ${item.plural}. ${second} has ${b} more than ${first}. How many does ${second} have?`, String(answer), numericDistractors(rng, answer, [a, b, answer - 1, answer + 1], { min: 0, max: 20 }), rng, { hint: '"More than" means add' });
      }),
      level('g1.pack-stories.two-step', 'Two-Step Story', 'number-pad', 3, (rng) => {
        const name = pick(rng, kidNames);
        const item = pick(rng, storyObjects);
        const a = randInt(rng, 5, 12);
        const b = randInt(rng, 1, 7);
        const c = randInt(rng, 1, a + b - 1);
        return numPad(`${name} had ${a} ${item.plural}, got ${b} more, then gave away ${c}. How many ${item.plural} now?`, a + b - c, { hint: 'Do one step at a time' });
      }),
      level('g1.pack-stories.story-equation', 'Match the Story', 'match-pairs', 3, (rng) => {
        const starts = randInts(rng, 5, 14, 3);
        const names = shuffle(rng, kidNames).slice(0, 3);
        const pairs = starts.map((start, index) => {
          const b = randInt(rng, 2, 6);
          const subtract = index === 1;
          return subtract
            ? { left: `${names[index]} had ${start} and gave away ${b}`, right: `${start} − ${b}` }
            : { left: `${names[index]} has ${start} and gets ${b} more`, right: `${start} + ${b}` };
        });
        return { ...matchPairs('Match each story to its equation.', shuffle(rng, pairs)), hint: 'Getting more means add; giving away means subtract' };
      }),
    ],
  },
  {
    id: 'g1.pack-algebra',
    title: 'Parrot Puzzle Peak',
    emoji: '🦜',
    domain: 'algebra',
    levels: [
      level('g1.pack-algebra.missing-addend', 'Find the Addend', 'number-pad', 1, (rng) => {
        const a = randInt(rng, 1, 9);
        const answer = randInt(rng, 1, 9);
        return numPad(`${a} + ? = ${a + answer}`, answer, { visual: { text: `${a} + ? = ${a + answer}` }, hint: 'Count up to the total' });
      }),
      level('g1.pack-algebra.missing-subtrahend', 'Missing Subtrahend', 'number-pad', 1, (rng) => {
        const a = randInt(rng, 4, 15);
        const left = randInt(rng, 1, a - 1);
        return numPad(`${a} − ? = ${left}`, a - left, { hint: 'How many were taken away?' });
      }),
      level('g1.pack-algebra.missing-addend-mc', 'Pick the Missing Number', 'multiple-choice', 1, (rng) => {
        const answer = randInt(rng, 2, 12);
        const b = randInt(rng, 1, 9);
        return mc(`? + ${b} = ${answer + b}`, String(answer), numericDistractors(rng, answer, [answer - 1, answer + 1, answer + b, b], { min: 0, max: 20 }), rng);
      }),
      level('g1.pack-algebra.missing-start', 'Missing Start', 'number-pad', 2, (rng) => {
        const b = randInt(rng, 1, 9);
        const c = randInt(rng, 1, 9);
        return numPad(`? − ${b} = ${c}`, b + c, { hint: 'Add the two numbers you can see' });
      }),
      level('g1.pack-algebra.equation-tf', 'True or False Equation', 'true-false', 2, (rng) => {
        const a = randInt(rng, 1, 9);
        const b = randInt(rng, 1, 9);
        const truth = rng() < 0.5;
        let claimed = a + b + pick(rng, [-2, -1, 1, 2]);
        if (claimed < 1) claimed = a + b + 2;
        return trueFalse(`${a} + ${b} = ${truth ? a + b : claimed}`, truth, { hint: 'Add the left side to check' });
      }),
      level('g1.pack-algebra.related-equation', 'Use the Fact You Know', 'multiple-choice', 2, (rng) => {
        const sum = randInt(rng, 8, 15);
        const a = randInt(rng, 1, Math.floor((sum - 1) / 2));
        const b = sum - a;
        return mc(`${sum} − ${a} = ${b}. So ${sum} − ${b} = ?`, String(a), numericDistractors(rng, a, [b, sum, a - 1, a + 1], { min: 0, max: 20 }), rng, { hint: 'Fact families swap the parts' });
      }),
      level('g1.pack-algebra.balance-tf', 'Do Both Sides Match?', 'true-false', 2, (rng) => {
        const a = randInt(rng, 1, 9);
        const b = randInt(rng, 1, 9);
        const sum = a + b;
        const truth = rng() < 0.5;
        if (truth) {
          const c = randInt(rng, 1, sum - 1);
          return trueFalse(`${a} + ${b} = ${c} + ${sum - c}`, true, { hint: 'Both sides must equal the same number' });
        }
        const c = randInt(rng, 1, 9);
        let d = randInt(rng, 1, 9);
        if (c + d === sum) d = (d % 9) + 1;
        return trueFalse(`${a} + ${b} = ${c} + ${d}`, false, { hint: 'Both sides must equal the same number' });
      }),
      level('g1.pack-algebra.missing-match', 'Missing Number Match', 'match-pairs', 2, (rng) => {
        const answers = randInts(rng, 1, 9, 4);
        const pairs = answers.map((answer) => {
          const k = randInt(rng, 1, 4);
          return { left: `${k} + ? = ${answer + k}`, right: String(answer) };
        });
        return matchPairs('Match each equation to its missing number.', shuffle(rng, pairs));
      }),
      level('g1.pack-algebra.pick-equation', 'Choose the Equation', 'multiple-choice', 2, (rng) => {
        const name = pick(rng, kidNames);
        const item = pick(rng, storyObjects);
        const a = randInt(rng, 3, 12);
        const b = randInt(rng, 2, Math.min(7, a - 1));
        const subtract = rng() < 0.5;
        if (subtract) {
          const answer = `${a} − ${b}`;
          return mc(`${name} had ${a} ${item.plural} and gave away ${b}. Which equation shows how many are left?`, answer, [`${a} + ${b}`, `${b} − ${a}`, `${a} − ${a}`], rng);
        }
        const answer = `${a} + ${b}`;
        return mc(`${name} has ${a} ${item.plural} and gets ${b} more. Which equation shows the total?`, answer, [`${a} − ${b}`, `${b} + ${a + b}`, `${a} + ${a}`], rng);
      }),
      level('g1.pack-algebra.missing-two-sides', 'Missing on Both Sides', 'number-pad', 3, (rng) => {
        const b = randInt(rng, 1, 9);
        const c = randInt(rng, 1, 9);
        const a = randInt(rng, 1, b + c - 1);
        return numPad(`${a} + ? = ${b} + ${c}`, b + c - a, { hint: `First add the right side: ${b} + ${c}` });
      }),
      level('g1.pack-algebra.equal-sums', 'Same Value Match', 'match-pairs', 3, (rng) => {
        const sums = randInts(rng, 6, 14, 4);
        const pairs = sums.map((sum) => {
          const a1 = randInt(rng, 1, sum - 1);
          const a2 = (a1 % (sum - 1)) + 1;
          return { left: `${a1} + ${sum - a1}`, right: `${a2} + ${sum - a2}` };
        });
        return { ...matchPairs('Match the additions that have the same value.', shuffle(rng, pairs)), hint: 'Find the sum of each side' };
      }),
    ],
  },
  {
    id: 'g1.pack-patterns',
    title: 'Chameleon Pattern Path',
    emoji: '🦎',
    domain: 'patterns',
    levels: [
      level('g1.pack-patterns.next-one', 'What Comes Next?', 'multiple-choice', 1, (rng) => {
        const a = randInt(rng, 10, 110);
        const answer = a + 3;
        return mc(`${a}, ${a + 1}, ${a + 2}, ?`, String(answer), numericDistractors(rng, answer, [a + 4, a + 5, a + 2, a + 10], { min: 0, max: 120 }), rng, { hint: 'The numbers are counting by 1' });
      }),
      level('g1.pack-patterns.skip-2', 'Skip Count by 2s', 'order-sequence', 1, (rng) => {
        const start = randInt(rng, 1, 30);
        return orderSeq(`Count by 2s starting at ${start}.`, Array.from({ length: 5 }, (_, i) => String(start + i * 2)));
      }),
      level('g1.pack-patterns.skip-5', 'Skip Count by 5s', 'order-sequence', 1, (rng) => {
        const start = randInt(rng, 0, 16) * 5;
        return orderSeq(`Count by 5s starting at ${start}.`, Array.from({ length: 5 }, (_, i) => String(start + i * 5)));
      }),
      level('g1.pack-patterns.skip-10', 'Skip Count by 10s', 'order-sequence', 1, (rng) => {
        const start = randInt(rng, 0, 8) * 10;
        return orderSeq(`Count by 10s starting at ${start}.`, Array.from({ length: 5 }, (_, i) => String(start + i * 10)));
      }),
      level('g1.pack-patterns.emoji-next', 'Finish the Pattern', 'multiple-choice', 1, (rng) => {
        const pattern = pick(rng, emojiPatterns);
        const length = randInt(rng, 5, 7);
        const row = Array.from({ length }, (_, i) => pattern[i % pattern.length]);
        const answer = pattern[length % pattern.length];
        const others = [...new Set(pattern.filter((item) => item !== answer))];
        const fillers = ['💧', '🔥', '🌸', '🍀', '🐸', '🍕'].filter((emoji) => !pattern.includes(emoji)).slice(0, 3 - others.length);
        return mc(`What comes next?\n${row.join('')}`, answer, [...others, ...fillers], rng, { hint: 'Find the part that repeats' });
      }),
      level('g1.pack-patterns.odd-even', 'Odd or Even?', 'multiple-choice', 2, (rng) => {
        const n = randInt(rng, 2, 60);
        const answer = n % 2 === 0 ? 'Even' : 'Odd';
        return mc(`Is ${n} odd or even?`, answer, [answer === 'Even' ? 'Odd' : 'Even'], rng, { hint: 'Even numbers end in 0, 2, 4, 6, or 8' });
      }),
      level('g1.pack-patterns.next-pattern', 'Keep the Pattern Going', 'multiple-choice', 2, (rng) => {
        const step = pick(rng, [2, 5, 10]);
        const start = randInt(rng, 1, 30);
        const answer = start + 4 * step;
        return mc(`${start}, ${start + step}, ${start + 2 * step}, ${start + 3 * step}, ?`, String(answer), numericDistractors(rng, answer, [answer - 1, answer + 1, answer + step, answer - step], { min: 0, max: 100 }), rng, { hint: `The pattern adds ${step} each time` });
      }),
      level('g1.pack-patterns.odd-even-tf', 'Even or Odd Check', 'true-false', 2, (rng) => {
        const n = randInt(rng, 2, 99);
        return trueFalse(`${n} is an even number.`, n % 2 === 0, { hint: 'Look at the ones digit' });
      }),
      level('g1.pack-patterns.pattern-gap', 'Fill the Pattern Gap', 'number-pad', 3, (rng) => {
        const step = pick(rng, [2, 5, 10]);
        const start = randInt(rng, 1, 40);
        const gap = randInt(rng, 1, 3);
        const answer = start + gap * step;
        const display = Array.from({ length: 5 }, (_, i) => (i === gap ? '?' : String(start + i * step))).join(', ');
        return numPad(`What number fills the gap?\n${display}`, answer, { hint: `The pattern counts by ${step}` });
      }),
      level('g1.pack-patterns.name-rule', 'Name the Rule', 'multiple-choice', 3, (rng) => {
        const step = pick(rng, [2, 5, 10]);
        const start = randInt(rng, 1, 20);
        const answer = `count by ${step}s`;
        return mc(`${start}, ${start + step}, ${start + 2 * step}, ${start + 3 * step}\nWhat is the rule?`, answer, ['count by 1s', 'count by 2s', 'count by 5s', 'count by 10s'].filter((label) => label !== answer), rng, { hint: 'Compare each number to the one before it' });
      }),
      level('g1.pack-patterns.parity-rules', 'Even and Odd Rules', 'true-false', 3, (rng) => {
        const fact = pick(rng, parityFacts);
        return trueFalse(fact.text, fact.truth, { hint: 'Try it with small numbers' });
      }),
    ],
  },
];
