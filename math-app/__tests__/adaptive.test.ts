import { buildDailyPlan } from '../src/core/adaptive';
import { getGrade, isLevelUnlocked } from '../src/core/curriculum';
import type { LevelProgress } from '../src/core/storage';

describe('daily practice plans', () => {
  it('returns the requested number of questions only from unlocked levels', () => {
    const grade = getGrade('prek');
    const progress: Record<string, LevelProgress> = {};
    const plan = buildDailyPlan(grade, progress, 10, 123);
    const eligible = new Set(grade.units.flatMap((unit) => unit.levels
      .filter((level) => isLevelUnlocked(unit, level.id, progress))
      .map((level) => level.id)));

    expect(plan.questions).toHaveLength(10);
    expect(plan.questions.every(({ level }) => eligible.has(level.id))).toBe(true);
  });

  it('prefers unplayed levels when they are available', () => {
    const grade = getGrade('g1');
    const unit = grade.units[0];
    const [first, second] = unit.levels;
    const progress: Record<string, LevelProgress> = {
      [first.id]: { stars: 1, plays: 1, bestCorrect: 2, bestTotal: 6 },
      [second.id]: { stars: 1, plays: 1, bestCorrect: 2, bestTotal: 6 },
    };
    const plan = buildDailyPlan(grade, progress, 30, 456);
    const unplayed = new Set(grade.units.flatMap((item) => item.levels)
      .filter((level) => !progress[level.id])
      .map((level) => level.id));

    expect(plan.questions.some(({ level }) => unplayed.has(level.id))).toBe(true);
  });
});
