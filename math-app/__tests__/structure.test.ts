import { GRADES } from '../src/core/curriculum';
import { createRng } from '../src/core/rng';
import { validateQuestion } from './helpers/validate';

describe('curriculum structure', () => {
  it('registers all seven grades in order', () => {
    expect(GRADES.map((grade) => grade.id)).toEqual(['prek', 'k', 'g1', 'g2', 'g3', 'g4', 'g5']);
  });

  it('uses globally unique level ids', () => {
    const ids = GRADES.flatMap((grade) => grade.units.flatMap((unit) => unit.levels.map((level) => level.id)));
    expect(new Set(ids).size).toBe(ids.length);
  });

  for (const grade of GRADES) {
    it(`validates deterministic questions for ${grade.id}`, () => {
      for (const unit of grade.units) {
        for (const level of unit.levels) {
          for (let seed = 1; seed <= 200; seed += 1) {
            const question = level.generate(createRng(seed));
            validateQuestion(question, level);
            expect(level.generate(createRng(seed))).toEqual(question);
          }
        }
      }
    });
  }
});
