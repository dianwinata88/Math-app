import type { ChoiceOption, Question, Rng } from '../../core/types';
import { mc } from '../helpers';

/** Question factory shared by the K expansion pack (mirrors k.ts style). */
export function packNumberQuestion(
  kind: 'multiple-choice' | 'count-tap',
  prompt: string,
  answer: number,
  options: ChoiceOption[],
  visual?: Question['visual'],
  hint?: string,
): Question {
  return { kind, prompt, answer: String(answer), options, visual, hint };
}

/** Label-based multiple choice with a visual/hint. */
export function packMc(
  prompt: string,
  answerLabel: string,
  distractorLabels: string[],
  rng: Rng,
  extra: Omit<Partial<Question>, 'kind' | 'prompt' | 'answer' | 'options'> = {},
): Question {
  return mc(prompt, answerLabel, distractorLabels, rng, extra);
}

/** Split a count into emoji groups of at most 8 so rows fit a phone. */
export function rowGroups(count: number): number[] {
  const groups: number[] = [];
  let left = count;
  while (left > 8) {
    groups.push(8);
    left -= 8;
  }
  if (left > 0) groups.push(left);
  return groups;
}

/** Classic ten-frame text board: 5 filled/empty cells per row. */
export function tenFrame(filled: number, rows = 2): string {
  const lines: string[] = [];
  let left = filled;
  for (let row = 0; row < rows; row += 1) {
    const on = Math.min(5, Math.max(0, left));
    lines.push(`${'🟡'.repeat(on)}${'⚪'.repeat(5 - on)}`);
    left -= 5;
  }
  return lines.join('\n');
}

/** Tally marks in clusters of five, wrapped so no row tops 8 bars. */
export function tallyText(count: number): string {
  const fives = Math.floor(count / 5);
  const rest = count % 5;
  const clusters = [...Array(fives).fill('|||||'), ...(rest > 0 ? ['|'.repeat(rest)] : [])];
  const lines: string[] = [];
  for (let index = 0; index < clusters.length; index += 2) {
    lines.push(clusters.slice(index, index + 2).join(' '));
  }
  return lines.join('\n');
}

export const ORDINAL_WORDS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'] as const;

export const CLOCK_EMOJIS = ['🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚', '🕛'] as const;

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

export const LINEUP_CRITTERS = [
  { emoji: '🐶', name: 'dog' },
  { emoji: '🐱', name: 'cat' },
  { emoji: '🐰', name: 'bunny' },
  { emoji: '🐸', name: 'frog' },
  { emoji: '🐥', name: 'chick' },
  { emoji: '🦆', name: 'duck' },
  { emoji: '🐷', name: 'pig' },
  { emoji: '🐢', name: 'turtle' },
] as const;

export const COINS = [
  { name: 'penny', cents: 1, look: '🟤 brown coin' },
  { name: 'nickel', cents: 5, look: '⚪ thick silver coin' },
  { name: 'dime', cents: 10, look: '⚪ tiny silver coin' },
] as const;

export const COUNTING_OBJECTS = ['🍎', '⚽', '🌟', '🐠', '🌸', '🍪', '🐞', '🎈', '🧸', '🚗'] as const;

export const GRAPH_SETS: { title: string; rows: { emoji: string; name: string }[] }[] = [
  { title: 'pets', rows: [{ emoji: '🐶', name: 'dogs' }, { emoji: '🐱', name: 'cats' }, { emoji: '🐰', name: 'bunnies' }] },
  { title: 'fruits', rows: [{ emoji: '🍎', name: 'apples' }, { emoji: '🍌', name: 'bananas' }, { emoji: '🍇', name: 'grapes' }] },
  { title: 'rides', rows: [{ emoji: '🚗', name: 'cars' }, { emoji: '🚌', name: 'buses' }, { emoji: '🚲', name: 'bikes' }] },
  { title: 'weather', rows: [{ emoji: '☀️', name: 'sunny' }, { emoji: '🌧️', name: 'rainy' }, { emoji: '❄️', name: 'snowy' }] },
];

export const MEASURE_TOOLS = [
  { name: '📏 ruler', job: 'length' },
  { name: '⚖️ scale', job: 'weight' },
  { name: '🥤 cup', job: 'how much it holds' },
  { name: '🕐 clock', job: 'time' },
] as const;

export const STORY_PROPS = [
  { emoji: '🐦', noun: 'birds', place: 'in the tree' },
  { emoji: '🐟', noun: 'fish', place: 'in the pond' },
  { emoji: '🦋', noun: 'butterflies', place: 'on the flowers' },
  { emoji: '🍪', noun: 'cookies', place: 'on the plate' },
  { emoji: '🎈', noun: 'balloons', place: 'at the party' },
  { emoji: '🚗', noun: 'cars', place: 'in the lot' },
  { emoji: '🐿️', noun: 'squirrels', place: 'by the oak' },
] as const;

export const SORT_SETS = [
  { theme: 'fruits', members: ['🍎', '🍌', '🍇', '🍊'], outsiders: ['🚗', '⚽', '👟', '🐶'] },
  { theme: 'animals', members: ['🐶', '🐱', '🐰', '🐸'], outsiders: ['🍎', '🚗', '📦', '🪑'] },
  { theme: 'vehicles', members: ['🚗', '🚌', '🚲', '🚀'], outsiders: ['🍎', '🐶', '🧦', '📱'] },
  { theme: 'clothes', members: ['👕', '👖', '🧦', '🧢'], outsiders: ['🍕', '🐟', '🌵', '🔑'] },
] as const;
