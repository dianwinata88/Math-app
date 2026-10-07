import { randInt, shuffle } from '../../core/rng';
import type { ChoiceOption, Rng } from '../../core/types';
import { mc } from '../helpers';

export function pickChoices(
  rng: Rng,
  answer: number,
  preferred: number[],
  { count = 4, min = 0, max = Math.max(answer + count + 2, count - 1) }: { count?: number; min?: number; max?: number } = {},
): ChoiceOption[] {
  if (count < 2 || max - min + 1 < count || answer < min || answer > max) {
    throw new Error('pickChoices requires an answer in range and enough values for at least two choices');
  }

  const values = [answer];
  for (const value of preferred) {
    if (value >= min && value <= max && value !== answer && !values.includes(value)) values.push(value);
    if (values.length === count) break;
  }

  const nearby: number[] = [];
  for (let distance = 1; distance <= max - min; distance += 1) {
    if (answer - distance >= min) nearby.push(answer - distance);
    if (answer + distance <= max) nearby.push(answer + distance);
  }
  while (values.length < count) {
    const candidates = nearby.filter((value) => !values.includes(value));
    if (!candidates.length) break;
    values.push(candidates[randInt(rng, 0, candidates.length - 1)]);
  }

  return shuffle(rng, values).map((value) => ({ id: String(value), label: String(value) }));
}

export function emojiOptions(rng: Rng, answerLabel: string, distractorLabels: string[]) {
  return mc('', answerLabel, distractorLabels, rng).options ?? [];
}

export function choose<T>(rng: Rng, values: readonly T[]): T {
  return values[randInt(rng, 0, values.length - 1)];
}

export function chooseDistinct<T>(rng: Rng, values: readonly T[], count: number): T[] {
  return shuffle(rng, [...values]).slice(0, count);
}

export function repeat(emoji: string, count: number): string {
  return emoji.repeat(count);
}
