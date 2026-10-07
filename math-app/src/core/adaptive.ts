import { createRng, pick } from './rng';
import { isLevelUnlocked } from './curriculum';
import type { GradeDef, LevelDef, Question } from './types';
import type { LevelProgress } from './storage';

export interface DailyPlan {
  questions: { level: LevelDef; question: Question }[];
}

/**
 * Personalized daily practice: samples questions across the grade's units,
 * preferring levels the child hasn't finished or mastered (adaptive review).
 * Falls back to earlier unlocked levels when later ones are still locked.
 */
export function buildDailyPlan(
  grade: GradeDef,
  progress: Record<string, LevelProgress>,
  total = 10,
  seed = Date.now(),
): DailyPlan {
  const rng = createRng(seed);

  // Score each level: lower score = more urgently needs practice.
  const candidates: { level: LevelDef; score: number }[] = [];
  for (const unit of grade.units) {
    for (const level of unit.levels) {
      if (!isLevelUnlocked(unit, level.id, progress)) continue;
      const p = progress[level.id];
      const score = p ? p.stars * 2 + (p.bestTotal ? p.bestCorrect / p.bestTotal : 0) : -1;
      candidates.push({ level, score });
    }
  }
  candidates.sort((a, b) => a.score - b.score);

  // Take from the weakest levels, spread across units.
  const pool = candidates.slice(0, Math.max(3, Math.ceil(candidates.length / 2)));
  const questions: DailyPlan['questions'] = [];
  while (questions.length < total && pool.length > 0) {
    const { level } = pick(rng, pool);
    questions.push({ level, question: level.generate(rng) });
  }
  return { questions };
}
