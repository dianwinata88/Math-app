import { createRng } from '../../src/core/rng';
import { GRADES } from '../../src/core/curriculum';
import type { Domain, GradeId, LevelDef } from '../../src/core/types';
import { validateQuestion } from './validate';

export const REQUIRED_DOMAINS: Record<GradeId, readonly Domain[]> = {
  prek: ['counting', 'patterns', 'geometry', 'measurement'],
  k: ['counting', 'operations', 'place-value', 'geometry', 'measurement'],
  g1: ['operations', 'place-value', 'measurement', 'time', 'geometry', 'data'],
  g2: ['operations', 'place-value', 'money', 'time', 'measurement', 'geometry', 'data'],
  g3: ['operations', 'fractions', 'measurement', 'time', 'data', 'geometry', 'word-problems'],
  g4: ['operations', 'place-value', 'fractions', 'decimals', 'geometry', 'measurement', 'patterns'],
  g5: ['operations', 'fractions', 'decimals', 'geometry', 'algebra', 'measurement', 'word-problems'],
};

function requireCoverage(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function questionForSeed(level: LevelDef, seed: number) {
  return level.generate(createRng(seed));
}

export function assertGradeCoverage(gradeId: GradeId): void {
  const grade = GRADES.find((item) => item.id === gradeId);
  requireCoverage(grade !== undefined, `Grade "${gradeId}" is missing from the curriculum`);
  const levels = grade.units.flatMap((unit) => unit.levels);

  for (const domain of REQUIRED_DOMAINS[gradeId]) {
    requireCoverage(grade.units.some((unit) => unit.domain === domain), `${gradeId} needs a unit in "${domain}"`);
  }
  for (const unit of grade.units) {
    requireCoverage(unit.levels.length >= 3, `${gradeId}.${unit.id} needs at least three levels`);
    for (let index = 1; index < unit.levels.length; index += 1) {
      requireCoverage(
        unit.levels[index].difficulty >= unit.levels[index - 1].difficulty,
        `${unit.id} difficulty must be non-decreasing at ${unit.levels[index].id}`,
      );
    }
  }

  requireCoverage(levels.length >= 15, `${gradeId} needs at least 15 levels; found ${levels.length}`);
  requireCoverage(new Set(levels.map((item) => item.kind)).size >= 3, `${gradeId} needs at least three game kinds`);

  for (const level of levels) {
    requireCoverage(level.id.startsWith(`${gradeId}.`), `${level.id} must start with "${gradeId}."`);
    for (let seed = 1; seed <= 200; seed += 1) {
      const question = questionForSeed(level, seed);
      validateQuestion(question, level);
      requireCoverage(
        JSON.stringify(question) === JSON.stringify(questionForSeed(level, seed)),
        `${level.id} is not deterministic for seed ${seed}`,
      );
    }

    const combinations = new Set<string>();
    for (let seed = 1; seed <= 50; seed += 1) {
      const question = questionForSeed(level, seed);
      combinations.add(`${question.prompt}\u0000${question.answer}`);
    }
    requireCoverage(combinations.size >= 2, `${level.id} must vary its prompt and answer across seeds`);
  }
}
