import { randInt } from '../../core/rng';
import type { GradeDef } from '../../core/types';
import { level, mc, numPad, orderSeq } from '../helpers';

export const prekK: GradeDef[] = [
  {
    id: 'prek',
    title: 'PreK',
    ages: '3–4',
    units: [{
      id: 'prek.counting',
      title: 'Count the Critters',
      emoji: '🐞',
      domain: 'counting',
      levels: [
        level('prek.counting.tiny-groups', 'Tiny Groups', 'count-tap', 1, (rng) => {
          const count = randInt(rng, 1, 5);
          return { ...mc('How many ladybugs?', String(count), ['0', '6', '7', '8', '9'].filter((n) => n !== String(count)).slice(0, 3), rng), kind: 'count-tap', visual: { emoji: '🐞', count } };
        }),
        level('prek.counting.more-to-count', 'More to Count', 'multiple-choice', 2, (rng) => {
          const count = randInt(rng, 2, 8);
          return mc('How many stars can you see?', String(count), [String(count + 1), String(Math.max(1, count - 1)), String(count + 2)], rng, { visual: { emoji: '⭐', count } });
        }),
        level('prek.counting.count-to-five', 'Count to Five', 'order-sequence', 3, (rng) => {
          const start = randInt(rng, 1, 3);
          const sequence = Array.from({ length: 4 }, (_, index) => String(start + index));
          return orderSeq('Tap the numbers from small to big!', sequence);
        }),
      ],
    }],
  },
  {
    id: 'k',
    title: 'K',
    ages: '5–6',
    units: [{
      id: 'k.counting',
      title: 'Number Explorers',
      emoji: '🧭',
      domain: 'counting',
      levels: [
        level('k.counting.counting-on', 'Counting On', 'count-tap', 1, (rng) => {
          const count = randInt(rng, 5, 10);
          return { ...mc('How many friendly frogs?', String(count), [String(count - 2), String(count + 1), String(count + 2)], rng), kind: 'count-tap', visual: { emoji: '🐸', count } };
        }),
        level('k.counting.number-names', 'Number Names', 'multiple-choice', 2, (rng) => {
          const value = randInt(rng, 1, 10);
          const names = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
          return mc(`Which number is ${names[value - 1]}?`, String(value), [String((value % 10) + 1), String(Math.max(1, value - 1)), String((value + 2) % 10 + 1)], rng);
        }),
        level('k.counting.numbers-to-ten', 'Numbers to Ten', 'number-pad', 3, (rng) => {
          const answer = randInt(rng, 0, 10);
          return numPad('What number comes after?', answer, { visual: { text: `${answer - 1} → ?` } });
        }),
      ],
    }],
  },
];
