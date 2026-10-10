# MathQuest

MathQuest is a game-based math adventure for children ages 3–12, from PreK through Grade 5. Kids practice through short interactive levels, a personalized daily plan, collectible stickers, stars, coins, and practice streaks.

## Run the app

```bash
npm ci
npm start
```

For web development use `npm run web`. Quality gates:

```bash
npm run typecheck
npm run lint
npm test -- --ci
npx expo export --platform web --output-dir /tmp/mq-web
```

## Architecture

- `src/app/` contains Expo Router routes: onboarding, home/adventure map, daily practice, level play, rewards, and the parent profile.
- `src/core/` contains the question/session engine, deterministic RNG, storage, adaptive plan builder, curriculum lookup, rewards, and app state.
- `src/curriculum/helpers.ts` provides deterministic builders shared by all curriculum bands.
- `src/curriculum/<band>/index.ts` contains grade and unit content.
- `src/games/` renders each supported game kind and runs question sessions.
- `src/ui/` contains the visual theme and reusable components.
- `__tests__/` validates question contracts, curriculum structure, and core engine behavior.

Profiles are persisted locally with AsyncStorage. MathQuest is a standalone Expo project with its own npm lockfile; it is not part of the Expo monorepo workspaces.

## Game catalog

MathQuest ships **1340 playable levels** across 7 grades and all 13 domains. Every level is a `LevelDef` with a deterministic `generate(rng)` factory, validated by `__tests__/catalog.test.ts` (≥1000 levels + full domain coverage per grade) and per-pack coverage tests (each level × 200 seeds).

| Grade | Ages | Units | Levels |
| --- | --- | --- | --- |
| PreK | 3–4 | 23 | 177 |
| K | 5–6 | 24 | 191 |
| Grade 1 | 6–7 | 23 | 188 |
| Grade 2 | 7–8 | 25 | 210 |
| Grade 3 | 8–9 | 23 | 188 |
| Grade 4 | 9–10 | 23 | 192 |
| Grade 5 | 10–12 | 23 | 194 |

Every grade covers all 13 domains: counting, operations, place-value, fractions, decimals, geometry, measurement, data, money, time, patterns, word-problems, algebra. The full unit/level tree is generated into `docs/catalog.json` via `DUMP_CATALOG=1 npx jest dump-catalog --ci` (also emits `docs/level-ids.json` for the web crawler).

Game mechanics: `multiple-choice`, `count-tap`, `number-pad`, `match-pairs`, `order-sequence`, `true-false`.

To add more levels, follow `docs/level-pack-spec.md`: author a self-contained `<grade>-pack.ts` exporting a `UnitDef[]`, register it in your grade file only, and add a `coverage-<grade>-pack.test.ts`.

## Documentation

Player-facing docs live in `docs/` as static HTML — open them directly or serve the folder on any static host:

- `docs/guide/index.html` — user guide: onboarding, Adventure Map, daily practice, rewards/stickers, question types, Parent Area, FAQ.
- `docs/wiki/index.html` — wiki index linking to a page per grade (all 164 units / 1340 levels), a page per domain topic, the question-type reference, and the grade × topic coverage matrix.

The wiki is generated from the live catalog — after adding or changing levels, regenerate it with:

```bash
python3 scripts/build-wiki.py
```

## Curriculum band contract

Each band child owns only its assigned directory and its own coverage test:

| Band | Owned directory | Grades |
| --- | --- | --- |
| PreK–K | `src/curriculum/prek-k/` | `prek`, `k` |
| Grades 1–2 | `src/curriculum/g1-g2/` | `g1`, `g2` |
| Grades 3–4 | `src/curriculum/g3-g4/` | `g3`, `g4` |
| Grade 5 | `src/curriculum/g5/` | `g5` |

Use the shared builders from `src/curriculum/helpers.ts` (`numberChoices`, `mc`, `numPad`, `trueFalse`, `matchPairs`, `orderSeq`, and `level`). Export your grades from the existing band file using its current export name; do not edit `src/core/curriculum.ts` or other bands.

Every level id must be `${gradeId}.${unitSlug}.${levelSlug}` (for example, `g2.money.make-change`). Generators must be deterministic for a given RNG seed, satisfy the question contract in `__tests__/helpers/validate.ts`, and vary across seeds. Each grade must have at least three levels in every required domain, at least 15 total levels, and at least three game kinds. Difficulties must be non-decreasing within each unit.

Required domains:

| Grade | Domains |
| --- | --- |
| `prek` | counting, patterns, geometry, measurement |
| `k` | counting, operations, place-value, geometry, measurement |
| `g1` | operations, place-value, measurement, time, geometry, data |
| `g2` | operations, place-value, money, time, measurement, geometry, data |
| `g3` | operations, fractions, measurement, time, data, geometry, word-problems |
| `g4` | operations, place-value, fractions, decimals, geometry, measurement, patterns |
| `g5` | operations, fractions, decimals, geometry, algebra, measurement, word-problems |

Add only your band's test file (for example, `__tests__/coverage-prek-k.test.ts`) and call `assertGradeCoverage` for every grade you own. Do not add coverage tests for another band or edit the shared structure test.

Run the gates before handing off:

```bash
npm run typecheck
npm run lint
npm test -- --ci
npx expo export --platform web --output-dir /tmp/mq-web
```
