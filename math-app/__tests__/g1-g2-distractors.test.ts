import { createRng } from '../src/core/rng';
import { GRADES } from '../src/core/curriculum';

const binaryOrTernarySets = [
  ['<', '>', '='],
  ['Even', 'Odd'],
  ['AM', 'PM'],
];

function numericValue(label: string): number | null {
  if (/^\d+$/.test(label)) return Number(label);
  const dollars = label.match(/^\$(\d+)\.(\d{2})$/);
  if (dollars) return Number(dollars[1]) * 100 + Number(dollars[2]);
  const time = label.match(/^(\d{1,2}):(\d{2})$/);
  if (time) return Number(time[1]) * 60 + Number(time[2]);
  return null;
}

describe('Grades 1–2 distractors and level contracts', () => {
  const grades = GRADES.filter((grade) => grade.id === 'g1' || grade.id === 'g2');

  it('keeps numeric choices plausible and number-pad answers in range over 500 seeds', () => {
    for (const grade of grades) {
      for (const unit of grade.units) {
        for (const level of unit.levels) {
          for (let seed = 1; seed <= 500; seed += 1) {
            const question = level.generate(createRng(seed));
            if (question.kind === 'multiple-choice' || question.kind === 'count-tap') {
              const options = question.options ?? [];
              const labels = options.map((option) => option.label);
              const sorted = [...labels].sort();
              const isFixedSet = binaryOrTernarySets.some((set) => JSON.stringify([...set].sort()) === JSON.stringify(sorted));
              expect(options.length).toBeGreaterThanOrEqual(isFixedSet ? 2 : 3);
              const answerValue = numericValue(question.answer);
              for (const option of options) {
                const value = numericValue(option.label);
                if (value !== null) {
                  expect(value).toBeGreaterThanOrEqual(0);
                  if (option.id !== question.answer && answerValue !== null) expect(value).not.toBe(answerValue);
                }
              }
            }
            if (question.kind === 'number-pad') {
              const answer = Number(question.answer);
              expect(answer).toBeGreaterThanOrEqual(0);
              expect(answer).toBeLessThanOrEqual(1000);
            }
          }
        }
      }
    }
  });

  it('varies true-false answers and supplies hints for every difficulty-three level', () => {
    for (const grade of grades) {
      for (const unit of grade.units) {
        for (const level of unit.levels) {
          if (level.difficulty === 3) {
            expect(level.generate(createRng(1)).hint).toBeTruthy();
          }
          if (level.kind === 'true-false') {
            const answers = new Set(Array.from({ length: 500 }, (_, index) => level.generate(createRng(index + 1)).answer));
            expect(answers).toEqual(new Set(['true', 'false']));
          }
        }
      }
    }
  });

  it('keeps the requested band size', () => {
    for (const grade of grades) {
      const levels = grade.units.flatMap((unit) => unit.levels);
      expect(grade.units.length).toBeGreaterThanOrEqual(6);
      expect(grade.units.length).toBeLessThanOrEqual(9);
      expect(levels.length).toBeGreaterThanOrEqual(20);
      expect(levels.length).toBeLessThanOrEqual(35);
    }
  });
});
