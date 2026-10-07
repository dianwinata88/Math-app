import { shuffle } from '../../core/rng';
import type { Rng } from '../../core/types';

export function numericDistractors(
  rng: Rng,
  answer: number,
  candidates: number[],
  { count = 3, min = 0, max = Infinity }: { count?: number; min?: number; max?: number } = {},
): string[] {
  const values = [...new Set(shuffle(rng, candidates.filter(
    (value) => Number.isInteger(value) && value !== answer && value >= min && value <= max,
  )))].slice(0, count);
  for (let distance = 1; values.length < count; distance += 1) {
    for (const value of [answer - distance, answer + distance]) {
      if (value >= min && value <= max && value !== answer && !values.includes(value)) values.push(value);
      if (values.length === count) break;
    }
  }
  return values.map(String);
}

export function compareSymbol(a: number, b: number): '<' | '>' | '=' {
  return a < b ? '<' : a > b ? '>' : '=';
}

export const CLOCK_HOUR = ['🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚', '🕛'];
export const CLOCK_HALF = ['🕜', '🕝', '🕞', '🕟', '🕠', '🕡', '🕢', '🕣', '🕤', '🕥', '🕦', '🕧'];

export function formatCents(n: number): string {
  return `${n}¢`;
}

export function formatDollars(cents: number): string {
  return `$${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, '0')}`;
}

export const jungleAnimals = [
  { plural: 'monkeys', emoji: '🐒' },
  { plural: 'parrots', emoji: '🦜' },
  { plural: 'frogs', emoji: '🐸' },
  { plural: 'tigers', emoji: '🐯' },
  { plural: 'elephants', emoji: '🐘' },
  { plural: 'giraffes', emoji: '🦒' },
  { plural: 'zebras', emoji: '🦓' },
  { plural: 'snakes', emoji: '🐍' },
];

export const jungleFoods = [
  { plural: 'bananas', emoji: '🍌' },
  { plural: 'mangoes', emoji: '🥭' },
  { plural: 'coconuts', emoji: '🥥' },
];

export const reefAnimals = [
  { plural: 'fish', emoji: '🐠' },
  { plural: 'crabs', emoji: '🦀' },
  { plural: 'shells', emoji: '🐚' },
  { plural: 'starfish', emoji: '⭐' },
  { plural: 'octopuses', emoji: '🐙' },
  { plural: 'turtles', emoji: '🐢' },
  { plural: 'dolphins', emoji: '🐬' },
];

export const g1Shapes = [
  { name: 'triangle', riddle: 'I have 3 straight sides and 3 corners.', sides: 3 },
  { name: 'square', riddle: 'I have 4 equal sides and 4 corners.', sides: 4 },
  { name: 'rectangle', riddle: 'I have 4 sides and 4 corners. Opposite sides match.', sides: 4 },
  { name: 'circle', riddle: 'I am round and have no straight sides.', sides: 0 },
  { name: 'hexagon', riddle: 'I have 6 straight sides and 6 corners.', sides: 6 },
  { name: 'trapezoid', riddle: 'I have 4 sides and one pair of parallel sides.', sides: 4 },
  { name: 'cube', riddle: 'I am a solid shape with 6 square faces.', sides: 0 },
  { name: 'cone', riddle: 'I have one round base and a point.', sides: 0 },
  { name: 'cylinder', riddle: 'I have two flat circles and one curved surface.', sides: 0 },
  { name: 'sphere', riddle: 'I am a perfectly round solid shape.', sides: 0 },
];

export const equalShareFacts = [
  { text: '2 halves make 1 whole.', truth: true },
  { text: 'A quarter is bigger than a half.', truth: false },
  { text: '4 fourths make 1 whole.', truth: true },
  { text: 'Equal shares are the same size.', truth: true },
  { text: 'A whole can be split into 3 thirds.', truth: true },
  { text: 'One half is smaller than one fourth.', truth: false },
  { text: 'Cutting a whole into more equal parts makes smaller parts.', truth: true },
  { text: 'Two fourths are the same as one half.', truth: true },
];

export const measurementFacts = [
  { text: '1 inch is longer than 1 centimeter.', truth: true },
  { text: '12 inches make 1 foot.', truth: true },
  { text: '100 centimeters make 1 meter.', truth: true },
  { text: 'A centimeter is longer than an inch.', truth: false },
  { text: '8 cm is shorter than 8 in.', truth: true },
  { text: 'A meter is shorter than a centimeter.', truth: false },
  { text: '3 feet make 1 yard.', truth: true },
  { text: 'A centimeter is a unit for measuring length.', truth: true },
];
