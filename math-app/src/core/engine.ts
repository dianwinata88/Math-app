import { createRng } from './rng';
import type { LevelDef, Question } from './types';

export interface SessionState {
  level: LevelDef;
  questions: Question[];
  index: number;
  correct: number;
  results: boolean[];
  done: boolean;
}

export function startSession(level: LevelDef, seed = Date.now()): SessionState {
  const rng = createRng(seed);
  const questions = Array.from({ length: level.questions }, () => level.generate(rng));
  return { level, questions, index: 0, correct: 0, results: [], done: false };
}

/** Judge an answer for the kinds the engine owns; interactive kinds self-judge. */
export function checkAnswer(question: Question, input: string): boolean {
  return input.trim().toLowerCase() === question.answer.trim().toLowerCase();
}

export function recordAnswer(state: SessionState, wasCorrect: boolean): SessionState {
  const results = [...state.results, wasCorrect];
  const index = state.index + 1;
  return {
    ...state,
    index,
    results,
    correct: state.correct + (wasCorrect ? 1 : 0),
    done: index >= state.questions.length,
  };
}

export function starsFor(correct: number, total: number): 0 | 1 | 2 | 3 {
  if (total <= 0) return 0;
  const pct = correct / total;
  if (pct >= 0.9) return 3;
  if (pct >= 0.7) return 2;
  if (pct >= 0.5) return 1;
  return 0;
}

export function xpEarned(questions: Question[], results: boolean[]): number {
  return questions.reduce((sum, q, i) => sum + (results[i] ? q.xp ?? 10 : 2), 0);
}

export function coinsForStars(stars: number, correct: number): number {
  return stars * 5 + correct;
}
