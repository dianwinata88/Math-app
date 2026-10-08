# Level Expansion Pack Spec

How to author a curriculum "pack" of new levels for a grade. Packs are additive:
new files only inside your own grade's directory, plus a one-line registration
inside your own grade's definition file. **Never edit `src/core/`, shared band
files (index.ts, shared.ts, banks.ts, choices.ts, util.ts), another grade's
files, or existing levels/tests.**

## Deliverables (per grade)

1. `src/curriculum/<band>/<grade>-pack.ts` — exports
   `export const <grade>Pack: UnitDef[]`. (Split into multiple files if cleaner,
   e.g. `<grade>-pack-helpers.ts`, all under the same band directory.)
2. Register it inside **your own grade file only** by appending the pack to the
   grade's `units` array:
   - `prek` → `src/curriculum/prek-k/prek.ts` (`units: [ ...existing, ...prekPack ]`)
   - `k` → `src/curriculum/prek-k/k.ts`
   - `g1` → `src/curriculum/g1-g2/grade1.ts`
   - `g2` → `src/curriculum/g1-g2/grade2.ts`
   - `g3` → `src/curriculum/g3-g4/grade3.ts`
   - `g4` → `src/curriculum/g3-g4/grade4.ts`
   - `g5` → `src/curriculum/g5/index.ts` (append `...g5Pack` to the `units` list)
3. `__tests__/coverage-<grade>-pack.test.ts` — iterates every level in your
   pack and, for seeds 1..200, asserts `level.generate(createRng(seed))` is
   deterministic (same seed → deep-equal question) and passes
   `validateQuestion(question, level)` from `__tests__/helpers/validate`.
   Model it on `__tests__/structure.test.ts` + the existing
   `coverage-<band>.test.ts` files.

## Authoring rules

- **At least 140 new levels** in your pack. Existing count does not count.
- **IDs**: `level()` id must be globally unique, dotted, start with your grade
  id: `<grade>.<slug>` (e.g. `g3.pack-mult-arrays`). Unit ids likewise
  `<grade>.pack-<domain-or-theme>`. Never reuse an existing id.
- **Domains**: cover ALL 13 `Domain` values: counting, operations, place-value,
  fractions, decimals, geometry, measurement, data, money, time, patterns,
  word-problems, algebra. Weight them to what is real for the grade (see the
  grade's existing units for the tone/range) — a PreK "algebra" unit is really
  "what comes next / missing part" thinking; scale accordingly.
- **Units**: group levels into themed units (emoji + kid-friendly title). Aim
  for 10–14 units × ~10–14 levels each.
- **Difficulty**: use `difficulty: 1|2|3` and order units' levels roughly
  easy→hard. Mix: about 40% diff-1, 40% diff-2, 20% diff-3.
- **Kinds**: use all six GameKinds across the pack where sensible —
  `multiple-choice`, `count-tap` (younger grades), `number-pad`,
  `match-pairs`, `order-sequence`, `true-false`. `number-pad` answers must be
  non-negative integers with ≤4 digits for young grades.
- **Determinism**: `generate(rng)` may ONLY use the passed `rng` — never
  `Math.random()`, `Date`, or module-level mutable state. Same seed → same
  question (the test checks 200 seeds per level).
- **Distractor quality**: wrong options must be plausible near-misses
  (off-by-one, place-value slips, operation confusion) — not random numbers.
  Options 2–6, unique ids AND labels, exactly one equals `answer`.
- **match-pairs**: 2–5 pairs, unique lefts and rights; set `answer` to a short
  summary string. **order-sequence**: 3–8 unique items, `answer =
  sequence.join('-')`. **true-false**: answer `'true'`/`'false'`.
- **Visuals**: `visual.emoji`/`count`/`groups`/`items`/`text`. Emoji boards
  render on phone width — keep any single row ≤8 glyphs, total `count` ≤ ~30,
  and put category names in the prompt when comparing groups.
- **Hints**: give `hint` on most levels; short, encouraging, teaches the move.
- **Uniqueness**: every level must be a distinct skill/combination — vary
  operation, number range, representation (visual vs symbolic vs word problem),
  and format. No near-duplicate titles.
- **Reuse helpers**: `src/curriculum/helpers.ts` (`level`, `mc`, `numPad`,
  `matchPairs`, `orderSeq`, `trueFalse`, `numberChoices`) and your band's
  shared helpers. You may add pack-local helpers inside your own pack files
  (e.g. `makeAddSubLevels`) — a compact spec table + factory beats 140
  copy-pasted blocks.
- Run gates before the PR: `cd math-app && npm run typecheck && npm run lint
  && npm test -- --ci`. All green = done.
