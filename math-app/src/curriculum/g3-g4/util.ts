import { pick } from '../../core/rng';
import type { Question, Rng, VisualSpec } from '../../core/types';
import { mc } from '../helpers';

type Extra = Omit<Partial<Question>, 'kind' | 'prompt' | 'answer' | 'options'>;

export const NAMES = ['Mia', 'Leo', 'Ava', 'Kai', 'Zoe', 'Omar', 'Ivy', 'Raj', 'Lena', 'Theo', 'Nia', 'Sam'] as const;

export function name(rng: Rng): string {
  return pick(rng, NAMES);
}

/** 1234567 -> "1,234,567" */
export function fmt(value: number): string {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function pad2(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

export function clock(hour: number, minute: number): string {
  return `${hour}:${pad2(minute)}`;
}

/** Wraps a count of minutes after midnight onto a 12-hour clock face. */
export function clockFromMinutes(total: number): string {
  const hour24 = Math.floor(total / 60) % 24;
  const hour = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return clock(hour, total % 60);
}

/** Hundredths -> canonical decimal label, e.g. 62 -> "0.62", 50 -> "0.5", 307 -> "3.07". */
export function dec(hundredths: number): string {
  const whole = Math.floor(hundredths / 100);
  const rest = hundredths % 100;
  if (rest === 0) return String(whole);
  return rest % 10 === 0 ? `${whole}.${rest / 10}` : `${whole}.${pad2(rest)}`;
}

/** Multi-line picture rendered at emoji size (grids, graphs, number lines). */
export function board(lines: string[]): VisualSpec {
  return { emoji: lines.join('\n'), count: 1 };
}

export function grid(rows: number, cols: number, emoji: string): VisualSpec {
  return board(Array.from({ length: rows }, () => emoji.repeat(cols)));
}

/** Plausible numeric distractors: keeps candidates in priority order, then fills with nearby numbers. */
export function distractors(answer: number, candidates: number[], count = 3): number[] {
  const out: number[] = [];
  for (const value of candidates) {
    if (out.length < count && Number.isInteger(value) && value >= 0 && value !== answer && !out.includes(value)) out.push(value);
  }
  for (let step = 1; out.length < count; step += 1) {
    for (const value of [answer + step, answer - step]) {
      if (out.length < count && value >= 0 && !out.includes(value)) out.push(value);
    }
  }
  return out;
}

export function numMc(prompt: string, answer: number, candidates: number[], rng: Rng, extra: Extra = {}, format: (value: number) => string = fmt): Question {
  return mc(prompt, format(answer), distractors(answer, candidates).map(format), rng, extra);
}

export function countTap(prompt: string, answer: number, candidates: number[], rng: Rng, extra: Extra = {}): Question {
  return { ...numMc(prompt, answer, candidates, rng, extra), kind: 'count-tap' };
}

/** Multiple choice from string distractors: drops duplicates/answer, keeps the first `count`. */
export function labelMc(prompt: string, answer: string, candidates: string[], rng: Rng, extra: Extra = {}, count = 3): Question {
  const unique = [...new Set(candidates.filter((label) => label !== answer))].slice(0, count);
  return mc(prompt, answer, unique, rng, extra);
}

export function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}
