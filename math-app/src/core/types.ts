export type GradeId = 'prek' | 'k' | 'g1' | 'g2' | 'g3' | 'g4' | 'g5';

export type GameKind =
  | 'multiple-choice'
  | 'count-tap'
  | 'number-pad'
  | 'match-pairs'
  | 'order-sequence'
  | 'true-false';

export type Domain =
  | 'counting'
  | 'operations'
  | 'place-value'
  | 'fractions'
  | 'decimals'
  | 'geometry'
  | 'measurement'
  | 'data'
  | 'money'
  | 'time'
  | 'patterns'
  | 'word-problems'
  | 'algebra';

export interface ChoiceOption {
  id: string;
  label: string;
  emoji?: string;
}

export interface VisualSpec {
  /** Emoji repeated `count` times, e.g. 🍎🍎🍎 */
  emoji?: string;
  count?: number;
  /** Render several emoji groups, e.g. [3, 2] -> 🍎🍎🍎 + 🍎🍎 */
  groups?: number[];
  /** Big display text, e.g. "3 + 4 =" */
  text?: string;
  /** A row of distinct emojis, e.g. shapes to compare */
  items?: string[];
}

export interface Question {
  kind: GameKind;
  prompt: string;
  visual?: VisualSpec;
  /** multiple-choice / count-tap options. true-false supplies [True, False] automatically. */
  options?: ChoiceOption[];
  /** match-pairs: left item <-> right item correct mapping. */
  pairs?: { left: string; right: string }[];
  /** order-sequence: the items in their correct order. */
  sequence?: string[];
  /**
   * Canonical answer.
   * multiple-choice / count-tap: the correct option id.
   * number-pad: the expected number as a string.
   * true-false: 'true' or 'false'.
   * match-pairs / order-sequence are self-judged by the renderer; still set answer
   * to a short readable summary for review (e.g. "3-5-7-9").
   */
  answer: string;
  hint?: string;
  xp?: number;
}

export type Rng = () => number;

export interface LevelDef {
  /** Globally unique, dotted: 'prek.counting.to5' */
  id: string;
  title: string;
  kind: GameKind;
  /** Questions per play session (4-8 recommended). */
  questions: number;
  difficulty: 1 | 2 | 3;
  /** Deterministic question factory; must honor the level's kind contract. */
  generate: (rng: Rng) => Question;
}

export interface UnitDef {
  id: string;
  title: string;
  emoji: string;
  domain: Domain;
  levels: LevelDef[];
}

export interface GradeDef {
  id: GradeId;
  title: string;
  ages: string;
  units: UnitDef[];
}
