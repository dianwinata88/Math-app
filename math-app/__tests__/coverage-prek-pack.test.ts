import { createRng } from '../src/core/rng';
import type { Domain } from '../src/core/types';
import { prekPack } from '../src/curriculum/prek-k/prek-pack';
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

describe('PreK expansion pack', () => {
  const levels = prekPack.flatMap((unit) => unit.levels);

  it('adds at least 140 new levels', () => {
    expect(levels.length).toBeGreaterThanOrEqual(140);
  });

  it('covers every domain', () => {
    const covered = new Set(prekPack.map((unit) => unit.domain));
    for (const domain of ALL_DOMAINS) {
      expect(covered.has(domain)).toBe(true);
    }
  });

  it('keeps difficulty non-decreasing inside each unit', () => {
    for (const unit of prekPack) {
      for (let i = 1; i < unit.levels.length; i += 1) {
        expect(unit.levels[i].difficulty).toBeGreaterThanOrEqual(unit.levels[i - 1].difficulty);
      }
    }
  });

  for (const unit of prekPack) {
    for (const level of unit.levels) {
      it(`${level.id} generates deterministic valid questions`, () => {
        for (let seed = 1; seed <= 200; seed += 1) {
          const question = level.generate(createRng(seed));
          validateQuestion(question, level);
          expect(level.generate(createRng(seed))).toEqual(question);
        }
      });
    }
  }
});
