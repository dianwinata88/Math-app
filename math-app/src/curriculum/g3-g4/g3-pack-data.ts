import { randInt } from '../../core/rng';
import type { Rng } from '../../core/types';

/* Shared story banks and tiny helpers for the Grade 3 expansion pack. */

export interface EmojiItem {
  emoji: string;
  one: string;
  plural: string;
}

export const SEA_THINGS: readonly EmojiItem[] = [
  { emoji: '🐚', one: 'seashell', plural: 'seashells' },
  { emoji: '⭐', one: 'starfish', plural: 'starfish' },
  { emoji: '🦀', one: 'crab', plural: 'crabs' },
  { emoji: '🐠', one: 'reef fish', plural: 'reef fish' },
  { emoji: '💎', one: 'gem', plural: 'gems' },
  { emoji: '🍓', one: 'berry', plural: 'berries' },
];

export const TREATS: readonly EmojiItem[] = [
  { emoji: '🧁', one: 'cupcake', plural: 'cupcakes' },
  { emoji: '🍪', one: 'cookie', plural: 'cookies' },
  { emoji: '🍩', one: 'donut', plural: 'donuts' },
  { emoji: '🍬', one: 'candy', plural: 'candies' },
];

export const FRUITS: readonly EmojiItem[] = [
  { emoji: '🍉', one: 'melon slice', plural: 'melon slices' },
  { emoji: '🍍', one: 'pineapple', plural: 'pineapples' },
  { emoji: '🥭', one: 'mango', plural: 'mangoes' },
  { emoji: '🍌', one: 'banana', plural: 'bananas' },
];

export const GROUP_SPOTS = ['map pockets', 'sea bags', 'treasure pouches', 'picnic baskets', 'shell boxes', 'ship crates'] as const;

export const CREW_DEEDS = [
  'found in a shipwreck',
  'won at the island games',
  'traded at the pirate market',
  'dug up on the beach',
  'collected on the reef',
] as const;

/** Split n into visual rows of at most `per` so boards stay ≤8 glyphs wide. */
export function rowsOf(n: number, per = 8): number[] {
  const out: number[] = [];
  let left = n;
  while (left > per) {
    out.push(per);
    left -= per;
  }
  out.push(left);
  return out;
}

/** Board lines repeating an emoji in rows of ≤8 glyphs. */
export function emojiBoard(emoji: string, n: number, per = 8): string[] {
  return rowsOf(n, per).map((count) => emoji.repeat(count));
}

/** Cents -> "$1.35" when ≥100, else "35¢". Use one style per question. */
export function centsLabel(cents: number): string {
  if (cents < 100) return `${cents}¢`;
  return `$${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, '0')}`;
}

/** Dollar-and-cents -> always "$1.35" style. */
export function moneyLabel(cents: number): string {
  return `$${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, '0')}`;
}

export const FRACTION_WORDS: Record<number, string> = {
  2: 'half',
  3: 'third',
  4: 'fourth',
  6: 'sixth',
  8: 'eighth',
};

/** n/d -> "three eighths" style word form (denominators from FRACTION_WORDS). */
export function fractionWords(n: number, d: number): string {
  const ordinals: Record<number, string> = { 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven' };
  const base = FRACTION_WORDS[d] ?? `${d}th`;
  return n === 1 ? `one ${base}` : `${ordinals[n] ?? String(n)} ${base}s`;
}

/** Two- or three-digit number with optional comma, e.g. 1000 -> "1,000". */
export function pickTwo<T>(rng: Rng, items: readonly T[]): [T, T] {
  const first = items[randInt(rng, 0, items.length - 1)];
  let second = items[randInt(rng, 0, items.length - 1)];
  while (second === first) {
    second = items[randInt(rng, 0, items.length - 1)];
  }
  return [first, second];
}
