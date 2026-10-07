import { recordAnswer, starsFor } from '../src/core/engine';
import type { SessionState } from '../src/core/engine';
import type { LevelDef, Question } from '../src/core/types';

const level: LevelDef = {
  id: 'test.level',
  title: 'Test',
  kind: 'number-pad',
  questions: 2,
  difficulty: 1,
  generate: () => ({ kind: 'number-pad', prompt: '1 + 1?', answer: '2' }),
};
const question: Question = { kind: 'number-pad', prompt: '1 + 1?', answer: '2' };

describe('session engine', () => {
  it('awards stars at the 0.9, 0.7, and 0.5 thresholds', () => {
    expect(starsFor(9, 10)).toBe(3);
    expect(starsFor(7, 10)).toBe(2);
    expect(starsFor(5, 10)).toBe(1);
    expect(starsFor(4, 10)).toBe(0);
    expect(starsFor(0, 0)).toBe(0);
  });

  it('records answers without mutating the prior state', () => {
    const state: SessionState = {
      level,
      questions: [question, question],
      index: 0,
      correct: 0,
      results: [],
      done: false,
    };
    const next = recordAnswer(state, true);
    expect(next).toMatchObject({ index: 1, correct: 1, results: [true], done: false });
    expect(state).toMatchObject({ index: 0, correct: 0, results: [], done: false });
    expect(recordAnswer(next, false)).toMatchObject({ index: 2, correct: 1, results: [true, false], done: true });
  });
});
