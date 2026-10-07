import { mc } from '../helpers';
import type { Question, Rng } from '../../core/types';

export interface Frac {
  n: number;
  d: number;
}

export type ExactValue = number | Frac;
export interface Candidate {
  label: string;
  value: ExactValue;
}

export function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) [x, y] = [y, x % y];
  return x || 1;
}

export function simplify(f: Frac): Frac {
  if (f.d === 0) throw new Error('A fraction denominator cannot be zero');
  const sign = f.d < 0 ? -1 : 1;
  const divisor = gcd(f.n, f.d);
  return { n: (f.n / divisor) * sign, d: Math.abs(f.d) / divisor };
}

export function add(a: Frac, b: Frac): Frac {
  return simplify({ n: a.n * b.d + b.n * a.d, d: a.d * b.d });
}

export function sub(a: Frac, b: Frac): Frac {
  return simplify({ n: a.n * b.d - b.n * a.d, d: a.d * b.d });
}

export function mul(a: Frac, b: Frac): Frac {
  return simplify({ n: a.n * b.n, d: a.d * b.d });
}

export function div(a: Frac, b: Frac): Frac {
  if (b.n === 0) throw new Error('Cannot divide by zero');
  return simplify({ n: a.n * b.d, d: a.d * b.n });
}

export function compare(a: Frac, b: Frac): number {
  return Math.sign(a.n * b.d - b.n * a.d);
}

export function fracLabel(f: Frac): string {
  const value = simplify(f);
  if (value.n === 0) return '0';
  if (value.d === 1) return String(value.n);
  const whole = Math.trunc(value.n / value.d);
  const remainder = Math.abs(value.n % value.d);
  if (whole !== 0) return `${whole} ${remainder}/${value.d}`;
  return `${value.n}/${value.d}`;
}

export function decLabel(value: number, scale: number, minPlaces = 0): string {
  const places = String(scale).length - 1;
  if (!Number.isInteger(scale) || scale < 1 || 10 ** places !== scale) {
    throw new Error('Decimal scale must be a positive power of ten');
  }
  const negative = value < 0 ? '-' : '';
  const digits = String(Math.abs(value)).padStart(places + 1, '0');
  const whole = digits.slice(0, digits.length - places) || '0';
  if (places === 0) return `${negative}${whole}`;
  const fraction = digits.slice(-places);
  const trimmed = fraction.replace(/0+$/, '');
  const shown = trimmed.padEnd(Math.min(minPlaces, places), '0');
  return shown ? `${negative}${whole}.${shown}` : `${negative}${whole}`;
}

export function roundDecimal(value: number, scale: number, places: number): number {
  const factor = scale / 10 ** places;
  return Math.floor((value + factor / 2) / factor) * factor;
}

function asFraction(value: ExactValue): Frac {
  return typeof value === 'number' ? { n: value, d: 1 } : simplify(value);
}

function sameValue(a: ExactValue, b: ExactValue): boolean {
  return compare(asFraction(a), asFraction(b)) === 0;
}

function isNegative(value: ExactValue): boolean {
  return asFraction(value).n < 0;
}

export function buildMc(
  prompt: string,
  answer: Candidate,
  candidates: Candidate[],
  rng: Rng,
  extra: Omit<Partial<Question>, 'kind' | 'prompt' | 'answer' | 'options'> = {},
  fallbackLabel: (value: ExactValue) => string = (value) => String(value),
): Question {
  const selected: Candidate[] = [];
  const labels = new Set([answer.label]);
  for (const candidate of candidates) {
    if (isNegative(candidate.value) || sameValue(candidate.value, answer.value) || labels.has(candidate.label)) continue;
    selected.push(candidate);
    labels.add(candidate.label);
    if (selected.length === 3) break;
  }
  for (let offset = 1; selected.length < 3; offset += 1) {
    const base = asFraction(answer.value);
    for (const direction of [-1, 1]) {
      if (selected.length === 3) break;
      const value = simplify({ n: base.n + direction * offset * base.d, d: base.d });
      const label = fallbackLabel(value.d === 1 ? value.n : value);
      if (value.n < 0 || labels.has(label) || sameValue(value, answer.value)) continue;
      selected.push({ label, value });
      labels.add(label);
    }
  }
  return mc(prompt, answer.label, selected.map((candidate) => candidate.label), rng, extra);
}

export function formatMoney(cents: number): string {
  return `$${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, '0')}`;
}

export const supplyContainers = ['cargo crates', 'storage pods', 'supply lockers'];
export const supplyItems = ['meal pouches', 'fuel cells', 'oxygen canisters', 'Europa fish samples'];
export const transportContexts = [
  { name: 'shuttles', capacity: 'seats', travelers: 'crew members' },
  { name: 'Europa subs', capacity: 'berths', travelers: 'researchers' },
  { name: 'zero-g soccer teams', capacity: 'players', travelers: 'players' },
];
export const volumeStructures = ['cargo crate', 'Europa aquarium tank', 'bio-dome pet habitat'];
export const decimalSupplies = ['fuel cells in liters (L)', 'oxygen in kilograms (kg)'];
export const shareContexts = ['fuel-cell reserve', 'bio-dome juice', 'ration bars', 'Europa sub oxygen'];
export const fractionMissionFoods = ['space-café snack', 'Europa algae pizza', 'fruit pouch'];
export const engineLogs = ['Station log', 'Rover bay log', 'Crew report'];
