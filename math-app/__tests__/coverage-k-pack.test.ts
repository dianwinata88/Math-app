import { createRng } from '../src/core/rng';
import { kPack } from '../src/curriculum/prek-k/k-pack';
import type { Domain } from '../src/core/types';
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

describe('Kindergarten expansion pack coverage', () => {
  const levels = kPack.flatMap((unit) => unit.levels);

  it('has at least 140 new levels', () => {
    expect(levels.length).toBeGreaterThanOrEqual(140);
  });

  it('covers all 13 domains', () => {
    const domains = new Set(kPack.map((unit) => unit.domain));
    for (const domain of ALL_DOMAINS) {
      expect(domains.has(domain)).toBe(true);
    }
  });

  it('uses unique k.* ids and non-decreasing difficulty per unit', () => {
    const ids = levels.map((level) => level.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(id.startsWith('k.')).toBe(true);
    }
    for (const unit of kPack) {
      expect(unit.levels.length).toBeGreaterThanOrEqual(3);
      for (let index = 1; index < unit.levels.length; index += 1) {
        expect(unit.levels[index].difficulty).toBeGreaterThanOrEqual(unit.levels[index - 1].difficulty);
      }
    }
  });

  it('generates deterministic, valid questions for seeds 1..200', () => {
    for (const level of levels) {
      for (let seed = 1; seed <= 200; seed += 1) {
        const question = level.generate(createRng(seed));
        validateQuestion(question, level);
        expect(level.generate(createRng(seed))).toEqual(question);
      }
    }
  });
});
