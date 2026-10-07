import { g1g2 } from '../curriculum/g1-g2';
import { g3g4 } from '../curriculum/g3-g4';
import { g5 } from '../curriculum/g5';
import { prekK } from '../curriculum/prek-k';
import type { GradeDef, GradeId, LevelDef, UnitDef } from './types';

/** Ordered youngest -> oldest. Children register their band's grades here. */
export const GRADES: GradeDef[] = [...prekK, ...g1g2, ...g3g4, ...g5];

export function getGrade(id: GradeId): GradeDef {
  const grade = GRADES.find((g) => g.id === id);
  if (!grade) throw new Error(`Unknown grade ${id}`);
  return grade;
}

export function allLevels(grade: GradeDef): LevelDef[] {
  return grade.units.flatMap((u) => u.levels);
}

export function findLevel(levelId: string): { level: LevelDef; unit: UnitDef; grade: GradeDef } | null {
  for (const grade of GRADES) {
    for (const unit of grade.units) {
      const level = unit.levels.find((l) => l.id === levelId);
      if (level) return { level, unit, grade };
    }
  }
  return null;
}

/**
 * Levels are sequential inside a unit: the first is always open and each next
 * one opens once the previous level earned at least one star.
 */
export function isLevelUnlocked(unit: UnitDef, levelId: string, progress: Record<string, { stars: number }>): boolean {
  const idx = unit.levels.findIndex((l) => l.id === levelId);
  if (idx <= 0) return true;
  return (progress[unit.levels[idx - 1].id]?.stars ?? 0) > 0;
}

/** Total stars earned inside a grade. */
export function gradeStars(grade: GradeDef, progress: Record<string, { stars: number }>): number {
  return allLevels(grade).reduce((sum, l) => sum + (progress[l.id]?.stars ?? 0), 0);
}

/** A unit is mastered when every level has 3 stars. */
export function isUnitMastered(unit: UnitDef, progress: Record<string, { stars: number }>): boolean {
  return unit.levels.every((l) => (progress[l.id]?.stars ?? 0) >= 3);
}
