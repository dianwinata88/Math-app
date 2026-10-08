import { createRng } from '../src/core/rng';
import { getGrade } from '../src/core/curriculum';
import type { GradeId, LevelDef, Question } from '../src/core/types';

const GRADE_IDS: GradeId[] = ['prek', 'k'];
const PREK_EMOJIS = ['🐶', '🐱', '🐰', '🐥', '🦴', '🎾', '🐞', '🌼', '🦋', '🐿️'];

type Sample = { gradeId: GradeId; level: LevelDef; seed: number; question: Question };
let samples: Sample[] = [];

function generateAllSamples(): Sample[] {
  return GRADE_IDS.flatMap((gradeId) =>
    getGrade(gradeId).units.flatMap((unit) =>
      unit.levels.flatMap((level) =>
        Array.from({ length: 300 }, (_, index) => {
          const seed = index + 1;
          return { gradeId, level, seed, question: level.generate(createRng(seed)) };
        }),
      ),
    ),
  );
}

function samplesFor(levelId: string): Sample[] {
  return samples.filter((sample) => sample.level.id === levelId);
}

function repeatedEmojiCount(value: string, count: number): boolean {
  return PREK_EMOJIS.some((emoji) => value === emoji.repeat(count));
}

function numericValues(value: string): number[] {
  return (value.match(/\d+/g) ?? []).map(Number);
}

function patternPeriod(items: string[], hole: number): number | undefined {
  const shownLength = hole === items.length - 1 ? items.length - 1 : items.length;
  return [2, 3, 4].find((period) => {
    if (shownLength < period * 2) return false;
    for (let index = 0; index + period < items.length; index += 1) {
      if (items[index] !== '❓' && items[index + period] !== '❓' && items[index] !== items[index + period]) return false;
    }
    return true;
  });
}

function visualPosition(question: Question): { subject: string; reference: string; position: string } {
  const subject = question.prompt.match(/(?:Where is the |The )(.+?)(?:\?| is )/)?.[1] ?? '';
  const text = question.visual?.text ?? '';
  const referenceInPrompt = question.prompt.match(/ the (.+?)\./)?.[1];
  const lines = text.split('\n');
  const reference = referenceInPrompt ?? (lines.length === 2
    ? lines[0] === subject ? lines[1] : lines[0]
    : text.split(' ').find((item) => item !== subject) ?? '');
  let position = 'beside';
  if (text === `${subject}\n${reference}`) position = 'above';
  else if (text === `${reference}\n${subject}`) position = 'below';
  return { subject, reference, position };
}

beforeAll(() => {
  samples = generateAllSamples();
});

describe('PreK and Kindergarten generated-question math', () => {
  it('has the specified curriculum shape and globally valid numeric options and hints', () => {
    const prek = getGrade('prek');
    const kindergarten = getGrade('k');
    expect(prek.units).toHaveLength(9);
    expect(prek.units.flatMap((unit) => unit.levels)).toHaveLength(29);
    expect(kindergarten.units).toHaveLength(24);
    expect(kindergarten.units.flatMap((unit) => unit.levels)).toHaveLength(191);

    for (const gradeId of GRADE_IDS) {
      const grade = getGrade(gradeId);
      for (const unit of grade.units) {
        expect(unit.id).toMatch(new RegExp(`^${gradeId}\\.`));
        for (const level of unit.levels) {
          expect(level.id).toMatch(new RegExp(`^${gradeId}\\.${unit.id.slice(gradeId.length + 1)}\\.`));
        }
      }
    }

    for (const { level, question } of samples) {
      for (const option of question.options ?? []) {
        if (/^\d+$/.test(option.label)) expect(Number(option.label)).toBeGreaterThanOrEqual(0);
      }
      if (question.kind === 'number-pad') expect(Number(question.answer)).toBeLessThanOrEqual(100);
      if (level.difficulty === 3) expect(question.hint).toBeTruthy();
      if (question.options) {
        expect(new Set(question.options.map((option) => option.label)).size).toBe(question.options.length);
        expect(question.options.filter((option) => option.id === question.answer)).toHaveLength(1);
      }
    }
  });

  it('matches count-tap answers and the counting pair levels', () => {
    for (const { level, question } of samples) {
      if (question.kind === 'count-tap' && !question.prompt.includes('more make 10')) {
        const visual = question.visual;
        const count = visual?.count ?? visual?.groups?.reduce((sum, value) => sum + value, 0);
        expect(count).toBeDefined();
        expect(Number(question.answer)).toBe(count);
      }
    }

    for (const levelId of ['prek.matching.match-3', 'prek.matching.match-4', 'prek.matching.match-5']) {
      for (const { question } of samplesFor(levelId)) {
        for (const pair of question.pairs ?? []) {
          expect(PREK_EMOJIS.some((emoji) => pair.right === emoji.repeat(Number(pair.left)))).toBe(true);
        }
      }
    }
    for (const { question } of samplesFor('k.teens.teen-match')) {
      for (const pair of question.pairs ?? []) {
        const ones = Number(pair.left.match(/\d+$/)?.[0]);
        expect(Number(pair.right)).toBe(10 + ones);
      }
    }
    for (const { question } of samplesFor('k.bonds.ten-pairs')) {
      for (const pair of question.pairs ?? []) expect(Number(pair.left) + Number(pair.right)).toBe(10);
    }
  });

  it('answers size and comparison questions using the displayed quantities', () => {
    const bigThings = ['🐘', '🐳', '🦒', '🚌', '🏠', '🌳'];
    const smallThings = ['🐭', '🐜', '🐞', '🍓', '🔑', '🐣'];
    for (const { question } of samplesFor('prek.size.big-small')) {
      const answer = (question.options ?? []).find((option) => option.id === question.answer)?.label;
      expect(question.options).toHaveLength(2);
      if (question.prompt.includes('bigger')) {
        expect(bigThings).toContain(answer);
        expect((question.options ?? []).some((option) => smallThings.includes(option.label))).toBe(true);
      } else {
        expect(smallThings).toContain(answer);
        expect((question.options ?? []).some((option) => bigThings.includes(option.label))).toBe(true);
      }
    }
    for (const { question } of samplesFor('prek.compare.which-more')) {
      const lengths = (question.options ?? []).map((option) => option.label.length);
      const target = question.prompt.includes('more') ? Math.max(...lengths) : Math.min(...lengths);
      expect((question.options ?? []).find((option) => option.id === question.answer)?.label.length).toBe(target);
    }
    for (const levelId of ['prek.size.long-short', 'prek.size.tall-short', 'k.measure.longer']) {
      for (const { question } of samplesFor(levelId)) {
        const marker = levelId === 'prek.size.long-short' ? '🚃' : levelId === 'prek.size.tall-short' ? '🧱' : '🟩';
        const lengths = (question.options ?? []).map((option) => option.label.match(new RegExp(marker, 'gu'))?.length ?? 0);
        const asksMax = /longest|tallest|longer/.test(question.prompt);
        const target = asksMax ? Math.max(...lengths) : Math.min(...lengths);
        const answer = (question.options ?? []).find((option) => option.id === question.answer);
        expect(answer?.label.match(new RegExp(marker, 'gu'))?.length ?? 0).toBe(target);
      }
    }

    for (const levelId of ['prek.compare.more-fewer-same', 'k.compare.fewer-side']) {
      for (const { question } of samplesFor(levelId)) {
        const [left, right] = question.visual?.groups ?? [];
        const answer = left === right ? '🟰 Same' : levelId === 'k.compare.fewer-side'
          ? left < right ? '⬅️ Left' : '➡️ Right'
          : left > right ? '⬅️ Left' : '➡️ Right';
        expect(question.answer).toBe(answer);
      }
    }
  });

  it('orders number and length sequences correctly', () => {
    for (const { level, question } of samples) {
      if (question.kind !== 'order-sequence') continue;
      if (level.id.startsWith('prek.order.') || level.id === 'k.count100.by-ones') {
        const values = (question.sequence ?? []).map(Number);
        expect(values.every((value, index) => index === 0 || value === values[index - 1] + 1)).toBe(true);
      }
      if (level.id === 'k.count100.by-tens') {
        const values = (question.sequence ?? []).map(Number);
        expect(values.every((value, index) => index === 0 || value === values[index - 1] + 10)).toBe(true);
      }
    }
    for (const { question } of samplesFor('k.measure.order-length')) {
      const lengths = (question.sequence ?? []).map((item) => item.match(/🟩/gu)?.length ?? 0);
      expect(lengths.every((length, index) => index === 0 || length > lengths[index - 1])).toBe(true);
    }
  });

  it('recomputes numeric answers from operation, bond, teen, and sequence prompts', () => {
    for (const { question } of samplesFor('prek.order.what-next')) {
      const values = numericValues(question.visual?.text ?? '');
      expect(Number(question.answer)).toBe(values[values.length - 1] + 1);
    }
    for (const { question } of samplesFor('k.count100.next-number')) {
      const terms = numericValues(question.visual?.text ?? '');
      const step = terms[1] - terms[0];
      expect(terms.every((value, index) => index === 0 || value - terms[index - 1] === step)).toBe(true);
      expect(Number(question.answer)).toBe(terms[terms.length - 1] + step);
    }
    for (const { question } of samplesFor('k.patterns.growing-numbers')) {
      const terms = numericValues(question.visual?.text ?? '');
      const step = terms[1] - terms[0];
      expect(Number(question.answer)).toBe(terms[terms.length - 1] + step);
    }

    for (const { question } of samplesFor('k.addsub.take-away')) {
      const [first, second] = numericValues(question.prompt);
      expect(Number(question.answer)).toBe(first - second);
    }
    for (const { question } of samplesFor('k.addsub.add-pad')) {
      const [first, second] = numericValues(question.visual?.text ?? '');
      expect(Number(question.answer)).toBe(first + second);
    }
    for (const { question } of samplesFor('k.bonds.bond-parts')) {
      const [whole, part] = numericValues(question.prompt);
      expect(Number(question.answer)).toBe(whole - part);
    }
    for (const { question } of samplesFor('k.stories.join-story')) {
      const [first, second] = numericValues(question.prompt);
      expect(Number(question.answer)).toBe(first + second);
    }
    for (const { question } of samplesFor('k.stories.take-story')) {
      const [first, second] = numericValues(question.prompt);
      expect(Number(question.answer)).toBe(first - second);
    }
    for (const { question } of samplesFor('k.stories.story-pad')) {
      const [first, second] = numericValues(question.prompt);
      expect(Number(question.answer)).toBe(question.prompt.includes('more come') ? first + second : first - second);
    }
    for (const { question } of samplesFor('k.teens.ten-and-ones')) {
      const ones = Number(question.prompt.match(/10 \+ (\d+)/)?.[1]);
      expect(Number(question.answer)).toBe(10 + ones);
    }
    for (const { question } of samplesFor('k.teens.how-many-ones')) {
      const number = numericValues(question.prompt)[0];
      expect(Number(question.answer)).toBe(number - 10);
    }
    for (const { question } of samplesFor('k.teens.build-teen')) {
      const ones = Number(question.prompt.match(/and (\d+) ones/)?.[1]);
      expect(Number(question.answer)).toBe(10 + ones);
    }
    for (const { question } of samplesFor('k.bonds.ten-frame')) {
      expect(Number(question.answer)).toBe((question.visual?.text?.match(/⚪/gu) ?? []).length);
    }
  });

  it('re-derives true-false claims and spatial relationships', () => {
    for (const { question } of samplesFor('prek.numbers.zero-hero')) {
      const actual = question.visual?.count ?? 0;
      const claim = numericValues(question.prompt)[0];
      expect(question.answer).toBe(String(actual === claim));
    }
    for (const { question } of samplesFor('prek.compare.true-or-false')) {
      const [left, right] = question.visual?.groups ?? [];
      const expected = question.prompt.includes('more') ? left > right : left < right;
      expect(question.answer).toBe(String(expected));
    }
    for (const { question } of samplesFor('k.addsub.add-sub-check')) {
      const match = question.prompt.match(/^(\d+) ([+−]) (\d+) = (\d+)$/);
      expect(match).not.toBeNull();
      const [, firstText, operator, secondText, shownText] = match!;
      const first = Number(firstText);
      const second = Number(secondText);
      const shown = Number(shownText);
      expect(question.answer).toBe(String(operator === '+' ? first + second === shown : first - second === shown));
    }
    for (const { question } of samplesFor('k.compare.true-false')) {
      const [, firstText, relation, secondText] = question.prompt.match(/^(\d+) is (more than|less than|equal to) (\d+)\.$/)!;
      const first = Number(firstText);
      const second = Number(secondText);
      const result = relation === 'more than' ? first > second : relation === 'less than' ? first < second : first === second;
      expect(question.answer).toBe(String(result));
    }

    for (const levelId of ['k.shapes.positions', 'k.shapes.position-check']) {
      for (const { question } of samplesFor(levelId)) {
        const actual = visualPosition(question);
        expect(actual.subject).not.toBe('');
        expect(actual.reference).not.toBe('');
        if (levelId === 'k.shapes.positions') {
          const answer = question.answer.replace(/^(⬆️|⬇️|➡️) /, '');
          expect(answer).toBe(actual.position);
        } else {
          const claim = question.prompt.match(/ is (above|below|beside) the /)?.[1];
          expect(question.answer).toBe(String(claim === actual.position));
        }
      }
    }
  });

  it('uses the smallest displayed pattern period to fill the missing item', () => {
    const patternIds = [
      'prek.patterns.ab',
      'prek.patterns.aab-abb',
      'prek.patterns.missing',
      'k.patterns.abc',
      'k.patterns.aabb',
    ];
    for (const levelId of patternIds) {
      for (const { question } of samplesFor(levelId)) {
        const items = question.visual?.items ?? [];
        const hole = items.indexOf('❓');
        expect(hole).toBeGreaterThanOrEqual(0);
        const period = patternPeriod(items, hole);
        expect(period).toBeDefined();
        const phase = items
          .map((item, index) => ({ item, index }))
          .filter(({ item, index }) => index !== hole && index % period! === hole % period!)
          .map(({ item }) => item);
        expect(phase.length).toBeGreaterThan(0);
        expect(new Set(phase).size).toBe(1);
        expect(question.answer).toBe(phase[0]);
        expect((question.options ?? []).some((option) => option.label !== question.answer)).toBe(true);
      }
    }
  });
});
