import { createRng } from '../src/core/rng';
import type { Domain } from '../src/core/types';
import { g1Pack } from '../src/curriculum/g1-g2/g1-pack';
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

describe('Grade 1 expansion pack', () => {
  const levels = g1Pack.flatMap((unit) => unit.levels);

  it('has at least 140 levels', () => {
    expect(levels.length).toBeGreaterThanOrEqual(140);
  });

  it('covers all 13 domains', () => {
    const covered = new Set(g1Pack.map((unit) => unit.domain));
    for (const domain of ALL_DOMAINS) {
      expect(covered).toContain(domain);
    }
  });

  it('uses unique dotted ids starting with g1.', () => {
    const ids = levels.map((level) => level.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(id).toMatch(/^g1\.pack-/);
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
