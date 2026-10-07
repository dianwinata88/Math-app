import { createRng } from '../src/core/rng';
import { GRADES } from '../src/core/curriculum';
import type { Question } from '../src/core/types';
import { CLOCK_HALF } from '../src/curriculum/g1-g2/shared';

function question(levelId: string, seed: number): Question {
  const level = GRADES.flatMap((grade) => grade.units.flatMap((unit) => unit.levels)).find((item) => item.id === levelId);
  if (!level) throw new Error(`Missing level: ${levelId}`);
  return level.generate(createRng(seed));
}

function eachSeed(levelId: string, check: (item: Question) => void): void {
  for (let seed = 1; seed <= 300; seed += 1) check(question(levelId, seed));
}

function addOrSubtract(expression: string): number {
  const match = expression.match(/^(\d+)(?: ([+−]) (\d+))?$/);
  if (!match) throw new Error(`Unrecognized expression: ${expression}`);
  const left = Number(match[1]);
  if (!match[2]) return left;
  const right = Number(match[3]);
  return match[2] === '+' ? left + right : left - right;
}

describe('Grades 1–2 answer math', () => {
  it('computes Grade 1 missing addends and parts', () => {
    eachSeed('g1.equations.missing-addend', (item) => {
      const [, a, total] = item.prompt.match(/^(\d+) \+ \? = (\d+)$/)!;
      expect(item.answer).toBe(String(Number(total) - Number(a)));
    });
    eachSeed('g1.equations.missing-part', (item) => {
      const subtractKnown = item.prompt.match(/^(\d+) − \? = (\d+)$/);
      const findStart = item.prompt.match(/^\? − (\d+) = (\d+)$/);
      const answer = subtractKnown
        ? Number(subtractKnown[1]) - Number(subtractKnown[2])
        : Number(findStart![1]) + Number(findStart![2]);
      expect(item.answer).toBe(String(answer));
    });
  });

  it('checks Grade 1 equation truth and comparison answers', () => {
    for (const id of ['g1.equations.true-false-equations', 'g1.equations.balance']) {
      eachSeed(id, (item) => {
        const [left, right] = item.prompt.split(' = ');
        expect(item.answer).toBe(String(addOrSubtract(left) === addOrSubtract(right)));
      });
    }
    eachSeed('g1.tens-ones.compare-two-digit', (item) => {
      const [, a, b] = item.prompt.match(/^(\d+) \? (\d+)$/)!;
      expect(item.answer).toBe(String(Number(a) < Number(b) ? '<' : Number(a) > Number(b) ? '>' : '='));
    });
  });

  it('checks Grade 1 place-value, regrouping, and time answers', () => {
    eachSeed('g1.tens-ones.ten-more-ten-less', (item) => {
      const [, direction, value] = item.prompt.match(/^(10 more|10 less) than (\d+)$/)!;
      expect(item.answer).toBe(String(Number(value) + (direction === '10 more' ? 10 : -10)));
    });
    eachSeed('g1.tens-ones.tens-and-ones', (item) => {
      const [, tens, ones] = item.prompt.match(/^(\d+) tens and (\d+) ones$/)!;
      expect(item.answer).toBe(String(Number(tens) * 10 + Number(ones)));
    });
    eachSeed('g1.add-100.make-a-ten-sums', (item) => {
      const [, a, b] = item.prompt.match(/^(\d+) \+ (\d+) = \?$/)!;
      expect(item.answer).toBe(String(Number(a) + Number(b)));
      expect(Number(a) % 10 + Number(b)).toBeGreaterThan(9);
    });
    eachSeed('g1.time.half-past', (item) => {
      const hour = CLOCK_HALF.indexOf(item.visual?.text ?? '') + 1;
      expect(hour).toBeGreaterThan(0);
      expect(item.answer).toBe(`${hour}:30`);
    });
  });

  it('checks Grade 1 measurement wording and shape choices', () => {
    eachSeed('g1.measure.measure-units', (item) => {
      const unit = item.visual?.emoji === '📎' ? 'paper clips' : 'cubes';
      expect(item.prompt).toBe(`The snake is this many ${unit} long. How long?`);
    });
    eachSeed('g1.measure.longer-shorter', (item) => {
      const [, adjective, choices] = item.prompt.match(/^Which is the (longest|shortest)\? (.+)$/)!;
      const labels = choices.split(', ');
      const lengths = labels.map((label) => Number(label.match(/\((\d+) cubes\)$/)![1]));
      expect(labels.every((label) => /^(monkey|parrot|frog|tiger|elephant|giraffe|zebra|snake) \(\d+ cubes\)$/.test(label))).toBe(true);
      expect(item.answer).toBe(labels[lengths.indexOf(adjective === 'longest' ? Math.max(...lengths) : Math.min(...lengths))]);
    });
    eachSeed('g1.measure.compare-indirect', (item) => {
      const [, first, second, secondAgain, third, conclusionFirst, conclusionLast] = item.prompt.match(
        /^The (\w+) is longer than the (\w+)\. The (\w+) is longer than the (\w+)\. So the (\w+) is longer than the (\w+)\.$/,
      )!;
      expect(secondAgain).toBe(second);
      expect([conclusionFirst, conclusionLast]).toEqual(item.answer === 'true' ? [first, third] : [third, first]);
      expect(item.hint).toBeTruthy();
    });
    const threeDimensional = ['cube', 'cone', 'cylinder', 'sphere'];
    const twoDimensional = ['triangle', 'square', 'rectangle', 'circle', 'hexagon', 'trapezoid'];
    eachSeed('g1.shapes.name-the-shape', (item) => {
      const labels = (item.options ?? []).map((option) => option.label);
      const allowed = threeDimensional.includes(item.answer) ? threeDimensional : twoDimensional;
      expect(labels).toHaveLength(4);
      expect(new Set(labels).size).toBe(4);
      expect(labels).toContain(item.answer);
      expect(labels.every((label) => allowed.includes(label))).toBe(true);
    });
  });

  it('checks Grade 1 graph totals and tallies', () => {
    eachSeed('g1.data.how-many-more', (item) => {
      const [firstRow, secondRow] = item.prompt.split('\n');
      const [firstLabel, firstIcons] = firstRow.split(' ');
      const [secondLabel, secondIcons] = secondRow.split(' ');
      const bigger = Array.from(firstIcons).length;
      const smaller = Array.from(secondIcons).length;
      expect(firstIcons).toBe(firstLabel.repeat(bigger));
      expect(secondIcons).toBe(secondLabel.repeat(smaller));
      expect(bigger).toBeGreaterThanOrEqual(2);
      expect(bigger).toBeLessThanOrEqual(10);
      expect(smaller).toBeGreaterThanOrEqual(1);
      expect(bigger - smaller).toBeGreaterThanOrEqual(1);
      expect(bigger - smaller).toBeLessThanOrEqual(5);
      expect(item.answer).toBe(String(bigger - smaller));
    });
    eachSeed('g1.data.read-tally', (item) => {
      const tally = item.prompt.split('\n')[0].replace(/^\S+\s/, '');
      const count = tally.split(/\s+/).reduce((sum, group) => sum + group.length, 0);
      expect(item.answer).toBe(String(count));
    });
  });

  it('checks Grade 2 regrouping and arithmetic within 1,000', () => {
    eachSeed('g2.within-100.regroup-add', (item) => {
      const [, a, b] = item.prompt.match(/^(\d+) \+ (\d+) = \?$/)!;
      expect(Number(a) % 10 + Number(b) % 10).toBeGreaterThan(9);
      expect(item.answer).toBe(String(Number(a) + Number(b)));
    });
    eachSeed('g2.within-100.regroup-subtract', (item) => {
      const [, a, b] = item.prompt.match(/^(\d+) − (\d+) = \?$/)!;
      expect(Number(a) % 10).toBeLessThan(Number(b) % 10);
      expect(item.answer).toBe(String(Number(a) - Number(b)));
    });
    for (const id of ['g2.within-100.add-within-1000', 'g2.within-100.subtract-within-1000']) {
      eachSeed(id, (item) => {
        const [, a, operator, b] = item.prompt.match(/^(\d+) ([+−]) (\d+) = \?$/)!;
        const answer = operator === '+' ? Number(a) + Number(b) : Number(a) - Number(b);
        expect(answer).toBeGreaterThanOrEqual(0);
        expect(answer).toBeLessThanOrEqual(999);
        expect(item.answer).toBe(String(answer));
      });
    }
  });

  it('checks Grade 2 place-value and array pairs', () => {
    eachSeed('g2.fluency.fact-family-match', (item) => {
      const pairs = item.pairs ?? [];
      expect(pairs).toHaveLength(3);
      expect(new Set(pairs.map((pair) => pair.left)).size).toBe(3);
      expect(new Set(pairs.map((pair) => pair.right)).size).toBe(3);
      const families = pairs.map((pair) => {
        const [, aText, bText, totalText] = pair.left.match(/^(\d+) \+ (\d+) = (\d+)$/)!;
        const [, rightTotalText, subtrahendText, resultText] = pair.right.match(/^(\d+) − (\d+) = (\d+)$/)!;
        const a = Number(aText);
        const b = Number(bText);
        const total = Number(totalText);
        const rightTotal = Number(rightTotalText);
        const subtrahend = Number(subtrahendText);
        const result = Number(resultText);
        expect(a + b).toBe(total);
        expect(total).toBeLessThanOrEqual(20);
        expect(rightTotal).toBe(total);
        expect([[a, b], [b, a]]).toContainEqual([subtrahend, result]);
        return [a, b, total].sort((left, right) => left - right).join(',');
      });
      expect(new Set(families).size).toBe(3);
    });
    eachSeed('g2.place-value.hundreds-tens-ones', (item) => {
      const [, hundreds, tens, ones] = item.prompt.match(/^(\d+) hundreds, (\d+) tens, (\d+) ones$/)!;
      expect(item.answer).toBe(String(Number(hundreds) * 100 + Number(tens) * 10 + Number(ones)));
    });
    eachSeed('g2.place-value.expanded-form', (item) => {
      for (const pair of item.pairs ?? []) {
        expect(pair.left.split(' + ').reduce((sum, value) => sum + Number(value), 0)).toBe(Number(pair.right));
      }
    });
    eachSeed('g2.place-value.digit-value', (item) => {
      const [, number, digit] = item.prompt.match(/^In (\d+), what is the value of the (\d+)\?$/)!;
      const position = number.indexOf(digit);
      expect(item.answer).toBe(String(Number(digit) * 10 ** (number.length - position - 1)));
      const labels = (item.options ?? []).map((option) => option.id);
      expect(labels).toHaveLength(4);
      expect(new Set(labels).size).toBe(4);
      expect(labels.filter((label) => label === item.answer)).toHaveLength(1);
    });
    eachSeed('g2.place-value.compare-three-digit', (item) => {
      const [, a, b] = item.prompt.match(/^(\d+) \? (\d+)$/)!;
      expect(item.answer).toBe(String(Number(a) < Number(b) ? '<' : Number(a) > Number(b) ? '>' : '='));
    });
    eachSeed('g2.even-arrays.array-to-addition', (item) => {
      for (const pair of item.pairs ?? []) {
        const [, rows, columns] = pair.left.match(/^(\d+) rows of (\d+)$/)!;
        const terms = pair.right.split(' + ').map(Number);
        expect(terms).toEqual(Array(Number(rows)).fill(Number(columns)));
      }
    });
  });

  it('checks Grade 2 money and time answers', () => {
    eachSeed('g2.money.count-coins', (item) => {
      const [, quarters, quarterWord, dimes, dimeWord, nickels, nickelWord, pennies, pennyWord] = item.prompt.match(
        /^(\d+) (quarter|quarters), (\d+) (dime|dimes), (\d+) (nickel|nickels), (\d+) (penny|pennies)\nHow many cents\?$/,
      )!;
      expect(quarterWord).toBe(Number(quarters) === 1 ? 'quarter' : 'quarters');
      expect(dimeWord).toBe(Number(dimes) === 1 ? 'dime' : 'dimes');
      expect(nickelWord).toBe(Number(nickels) === 1 ? 'nickel' : 'nickels');
      expect(pennyWord).toBe(Number(pennies) === 1 ? 'penny' : 'pennies');
      const cents = Number(quarters) * 25 + Number(dimes) * 10 + Number(nickels) * 5 + Number(pennies);
      expect(item.answer).toBe(String(cents));
    });
    eachSeed('g2.money.dollars-and-cents', (item) => {
      const [, dollars, dollarWord, dimes, dimeWord] = item.prompt.match(/^(\d+) (dollar|dollars) and (\d+) (dime|dimes) is how much\?$/)!;
      expect(dollarWord).toBe(Number(dollars) === 1 ? 'dollar' : 'dollars');
      expect(dimeWord).toBe(Number(dimes) === 1 ? 'dime' : 'dimes');
      const cents = Number(dollars) * 100 + Number(dimes) * 10;
      expect(item.answer).toBe(`$${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, '0')}`);
    });
    eachSeed('g2.money.make-change', (item) => {
      const [, price, paid] = item.prompt.match(/costs (\d+)¢\. You pay (\d+)¢/)!;
      expect(item.answer).toBe(String(Number(paid) - Number(price)));
    });
    eachSeed('g2.time.read-the-clock', (item) => {
      const [, hour, nextHour, hand] = item.prompt.match(/hour hand is between the (\d+) and the (\d+)\. The minute hand is on the (\d+)/)!;
      expect(Number(nextHour)).toBe(Number(hour) + 1);
      expect(item.answer).toBe(`${hour}:${String(Number(hand) * 5).padStart(2, '0')}`);
    });
    eachSeed('g2.time.minutes-later', (item) => {
      const [, hour, minute, later] = item.prompt.match(/It is (\d+):(\d+)\. What time is it (\d+) minutes later/)!;
      const total = Number(minute) + Number(later);
      const expectedHour = Number(hour) + Math.floor(total / 60);
      expect(item.answer).toBe(`${expectedHour}:${String(total % 60).padStart(2, '0')}`);
    });
  });

  it('checks Grade 2 measurement, graphs, arrays, and faces', () => {
    const estimatedObjects = new Set<string>();
    eachSeed('g2.measure.best-estimate', (item) => {
      const [, object] = item.prompt.match(/^About how long is (.+)\?$/)!;
      estimatedObjects.add(object);
      const labels = (item.options ?? []).map((option) => option.label);
      expect(labels).toHaveLength(4);
      expect(new Set(labels).size).toBe(4);
      expect(labels).toContain(item.answer);
      expect(labels.every((label) => /(?:mm|cm|in|ft|m)$/.test(label))).toBe(true);
    });
    expect(estimatedObjects.size).toBeGreaterThanOrEqual(8);
    eachSeed('g2.measure.ruler-read', (item) => {
      const [, start, end] = item.prompt.match(/starts at (\d+) and ends at (\d+)/)!;
      expect(item.answer).toBe(String(Number(end) - Number(start)));
    });
    eachSeed('g2.measure.how-much-longer', (item) => {
      const [, first, firstLength, second, secondLength, asked] = item.prompt.match(
        /^A (\w+) is (\d+) cm long\. A (\w+) is (\d+) cm long\. How much longer is the (\w+)\?$/,
      )!;
      expect(['fish', 'crab', 'shell', 'starfish', 'octopus', 'turtle', 'dolphin']).toContain(first);
      expect(['fish', 'crab', 'shell', 'starfish', 'octopus', 'turtle', 'dolphin']).toContain(second);
      expect(asked).toBe(first);
      expect(Number(firstLength)).toBeGreaterThan(Number(secondLength));
      expect(item.answer).toBe(String(Number(firstLength) - Number(secondLength)));
    });
    eachSeed('g2.data.picture-graph-key', (item) => {
      const lines = item.prompt.split('\n');
      expect(lines[0]).toBe('Key: each picture = 2');
      const [, target] = lines[lines.length - 1].match(/^How many (.+)\?$/)!;
      const targetEmoji: Record<string, string> = {
        fish: '🐠',
        crabs: '🦀',
        shells: '🐚',
        starfish: '⭐',
        octopuses: '🐙',
        turtles: '🐢',
        dolphins: '🐬',
      };
      const row = lines.slice(1, -1).find((line) => line.startsWith(`${targetEmoji[target]} `))!;
      const [label, icons] = row.split(' ');
      const count = Array.from(icons).length;
      expect(label).toBe(targetEmoji[target]);
      expect(icons).toBe(label.repeat(count));
      expect(count).toBeGreaterThanOrEqual(1);
      expect(count).toBeLessThanOrEqual(5);
      expect(item.answer).toBe(String(count * 2));
    });
    let sawTwoStepStory = false;
    const storyObjectEmojis = new Set<string>();
    eachSeed('g2.within-100.reef-stories', (item) => {
      const values = [...item.prompt.matchAll(/\b(\d+)\b/g)].map((match) => Number(match[1]));
      const hasSecondStep = values.length === 3;
      if (hasSecondStep) sawTwoStepStory = true;
      for (const emoji of ['⚽', '🚀', '🧁', '🐚']) {
        if (item.prompt.includes(emoji)) storyObjectEmojis.add(emoji);
      }
      const hasAddition = item.prompt.includes('swim over') || item.prompt.includes('more arrive');
      const hasSubtraction = item.prompt.includes('swim away') || item.prompt.includes('given away');
      const expected = hasSecondStep
        ? values[0] + values[1] - values[2]
        : hasAddition
          ? values[0] + values[1]
          : values[0] - values[1];
      expect(values[0] + (hasAddition || hasSecondStep ? values[1] : 0)).toBeLessThanOrEqual(100);
      if (hasSecondStep || hasSubtraction) expect(expected).toBeGreaterThanOrEqual(0);
      expect(expected).toBeLessThanOrEqual(100);
      expect(item.answer).toBe(String(expected));
      const options = (item.options ?? []).map((option) => Number(option.id));
      expect(options).toHaveLength(4);
      expect(new Set(options).size).toBe(4);
      expect(options.every((value) => value >= 0)).toBe(true);
      expect(options.every((value) => value <= 100)).toBe(true);
      expect(options.filter((value) => value === expected)).toHaveLength(1);
      const animalAction = item.prompt.match(/\b(\d+) (\w+) (swims|swim) (over|away)/);
      if (animalAction) expect(animalAction[3]).toBe(Number(animalAction[1]) === 1 ? 'swims' : 'swim');
    });
    expect(sawTwoStepStory).toBe(true);
    expect(storyObjectEmojis.size).toBe(4);
    eachSeed('g2.data.line-plot', (item) => {
      const lines = item.prompt.split('\n');
      const questionLine = lines[lines.length - 1];
      const marks = lines.slice(0, -1).map((line) => {
        const [, length, icons] = line.match(/^(\d+) in (.+)$/)!;
        return { length: Number(length), count: icons.match(/✖️/g)?.length ?? 0 };
      });
      const longer = questionLine.match(/longer than (\d+) in/);
      const exact = questionLine.match(/are (\d+) in\?/);
      const answer = longer
        ? marks.filter((row) => row.length > Number(longer[1])).reduce((sum, row) => sum + row.count, 0)
        : marks.find((row) => row.length === Number(exact![1]))!.count;
      expect(item.answer).toBe(String(answer));
    });
    eachSeed('g2.shapes.partition-rectangle', (item) => {
      const groups = item.visual?.groups ?? [];
      expect(item.answer).toBe(String(groups.reduce((sum, group) => sum + group, 0)));
    });
    eachSeed('g2.shapes.faces', (item) => {
      const [, property, shape] = item.prompt.match(/^How many (\w+) does a (.+) have\?$/)!;
      const faces: Record<string, Record<string, number>> = {
        cube: { faces: 6, edges: 12, vertices: 8 },
        'rectangular prism': { faces: 6, edges: 12, vertices: 8 },
        'square pyramid': { faces: 5, edges: 8, vertices: 5 },
        'triangular prism': { faces: 5, edges: 9, vertices: 6 },
      };
      expect(item.answer).toBe(String(faces[shape][property]));
    });
  });
});
