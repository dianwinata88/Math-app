import { randInt, shuffle } from '../core/rng';
import type { ChoiceOption, LevelDef, Question, Rng } from '../core/types';

export function numberChoices(
  rng: Rng,
  answer: number,
  { count = 4, min = 0, max = Math.max(answer + count + 2, count - 1) }: { count?: number; min?: number; max?: number } = {},
): ChoiceOption[] {
  if (count < 2 || max - min + 1 < count || answer < min || answer > max) {
    throw new Error('numberChoices requires an answer in range and enough values for at least two choices');
  }

  const values = new Set<number>([answer]);
  const nearby: number[] = [];
  for (let distance = 1; distance <= max - min; distance++) {
    if (answer - distance >= min) nearby.push(answer - distance);
    if (answer + distance <= max) nearby.push(answer + distance);
  }

  while (values.size < count) {
    const candidates = nearby.filter((value) => !values.has(value));
    if (candidates.length === 0) break;
    values.add(candidates[randInt(rng, 0, candidates.length - 1)]);
  }

  while (values.size < count) {
    values.add(randInt(rng, min, max));
  }

  return shuffle(rng, [...values]).map((value) => ({ id: String(value), label: String(value) }));
}

export function mc(
  prompt: string,
  answerLabel: string,
  distractorLabels: string[],
  rng: Rng,
  extra: Omit<Partial<Question>, 'kind' | 'prompt' | 'answer' | 'options'> = {},
): Question {
  const labels = [...new Set([answerLabel, ...distractorLabels])];
  if (labels.length < 2 || labels.length > 6 || labels.filter((label) => label === answerLabel).length !== 1) {
    throw new Error('mc requires two to six unique labels including the answer');
  }
  const options = shuffle(rng, labels.map((label) => ({ id: label, label })));
  return { ...extra, kind: 'multiple-choice', prompt, answer: answerLabel, options };
}

export function numPad(
  prompt: string,
  answer: number,
  extra: Omit<Partial<Question>, 'kind' | 'prompt' | 'answer'> = {},
): Question {
  return { ...extra, kind: 'number-pad', prompt, answer: String(answer) };
}

export function trueFalse(
  prompt: string,
  isTrue: boolean,
  extra: Omit<Partial<Question>, 'kind' | 'prompt' | 'answer'> = {},
): Question {
  return { ...extra, kind: 'true-false', prompt, answer: String(isTrue) };
}

export function matchPairs(prompt: string, pairs: { left: string; right: string }[]): Question {
  return { kind: 'match-pairs', prompt, answer: pairs.map((pair) => pair.right).join('-'), pairs };
}

export function orderSeq(prompt: string, sequence: string[]): Question {
  return { kind: 'order-sequence', prompt, answer: sequence.join('-'), sequence };
}

export function level(
  id: string,
  title: string,
  kind: LevelDef['kind'],
  difficulty: LevelDef['difficulty'],
  generate: LevelDef['generate'],
  questions = 6,
): LevelDef {
  return { id, title, kind, difficulty, generate, questions };
}
