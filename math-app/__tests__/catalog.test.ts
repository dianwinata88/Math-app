import { allLevels, GRADES } from '../src/core/curriculum';
import type { Domain } from '../src/core/types';

export const DOMAINS: Domain[] = [
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

describe('game catalog', () => {
  const total = GRADES.reduce((sum, grade) => sum + allLevels(grade).length, 0);

  it('has at least 1000 playable levels', () => {
    expect(total).toBeGreaterThanOrEqual(1000);
  });

  for (const grade of GRADES) {
    it(`covers every domain in ${grade.id}`, () => {
      const covered = new Set(grade.units.map((unit) => unit.domain));
      for (const domain of DOMAINS) {
        expect(covered).toContain(domain);
      }
    });
  }
});
