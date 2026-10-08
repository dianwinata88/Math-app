import { createRng } from '../src/core/rng';
import type { Domain } from '../src/core/types';
import { g2Pack } from '../src/curriculum/g1-g2/g2-pack';
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

describe('Grade 2 expansion pack', () => {
  it('has at least 140 levels', () => {
    const levels = g2Pack.flatMap((unit) => unit.levels);
    expect(levels.length).toBeGreaterThanOrEqual(140);
  });

  it('covers all 13 domains', () => {
    const covered = new Set(g2Pack.map((unit) => unit.domain));
    for (const domain of ALL_DOMAINS) {
      expect(covered.has(domain)).toBe(true);
    }
  });

  it('uses unique pack level and unit ids', () => {
    const unitIds = g2Pack.map((unit) => unit.id);
    expect(new Set(unitIds).size).toBe(unitIds.length);
    const levelIds = g2Pack.flatMap((unit) => unit.levels.map((level) => level.id));
    expect(new Set(levelIds).size).toBe(levelIds.length);
    for (const id of levelIds) {
      expect(id.startsWith('g2.pack-')).toBe(true);
    }
  });

  it('validates deterministic questions for every pack level', () => {
    for (const unit of g2Pack) {
      for (const level of unit.levels) {
        for (let seed = 1; seed <= 200; seed += 1) {
          const question = level.generate(createRng(seed));
          validateQuestion(question, level);
          expect(level.generate(createRng(seed))).toEqual(question);
        }
      }
    }
  });
});
