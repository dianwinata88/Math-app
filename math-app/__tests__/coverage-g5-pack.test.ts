import { createRng } from '../src/core/rng';
import type { Domain } from '../src/core/types';
import { g5Pack } from '../src/curriculum/g5/g5-pack';
import { validateQuestion } from './helpers/validate';

const ALL_DOMAINS: Domain[] = [
  'counting',
  'operations',
  'place-value',
  'fractions',
  'decimals',
  'geometry',
  'measurement',
  'data',
  'money',
  'time',
  'patterns',
  'word-problems',
  'algebra',
];

describe('Grade 5 expansion pack', () => {
  const levels = g5Pack.flatMap((unit) => unit.levels);

  it('has at least 140 levels', () => {
    expect(levels.length).toBeGreaterThanOrEqual(140);
  });

  it('covers all 13 domains', () => {
    const domains = new Set(g5Pack.map((unit) => unit.domain));
    for (const domain of ALL_DOMAINS) {
      expect(domains.has(domain)).toBe(true);
    }
  });

  it('uses unique g5.pack-* ids and non-decreasing difficulty per unit', () => {
    const unitIds = g5Pack.map((unit) => unit.id);
    expect(new Set(unitIds).size).toBe(unitIds.length);
    const levelIds = levels.map((level) => level.id);
    expect(new Set(levelIds).size).toBe(levelIds.length);
    for (const id of levelIds) {
      expect(id.startsWith('g5.pack-')).toBe(true);
    }
    for (const unit of g5Pack) {
      expect(unit.id.startsWith('g5.pack-')).toBe(true);
      expect(unit.levels.length).toBeGreaterThanOrEqual(3);
      for (let index = 1; index < unit.levels.length; index += 1) {
        expect(unit.levels[index].difficulty).toBeGreaterThanOrEqual(unit.levels[index - 1].difficulty);
      }
    }
  });

  it('validates deterministic questions for every pack level across seeds 1..200', () => {
    for (const level of levels) {
      for (let seed = 1; seed <= 200; seed += 1) {
        const question = level.generate(createRng(seed));
        validateQuestion(question, level);
        expect(level.generate(createRng(seed))).toEqual(question);
      }
    }
  });
});
