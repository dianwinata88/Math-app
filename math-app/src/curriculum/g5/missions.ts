import { pick, randInt } from '../../core/rng';
import type { UnitDef } from '../../core/types';
import { level, numPad } from '../helpers';
import {
  add, buildMc, formatMoney, fractionMissionFoods, fracLabel, gcd, mul, sub,
  supplyContainers, supplyItems, transportContexts,
} from './math';
import type { Frac } from './math';

function properFraction(rng: () => number): Frac {
  let d = randInt(rng, 2, 9);
  let n = randInt(rng, 1, d - 1);
  while (gcd(n, d) !== 1) {
    d = randInt(rng, 2, 9);
    n = randInt(rng, 1, d - 1);
  }
  return { n, d };
}

export const missions: UnitDef = {
  id: 'g5.missions',
  title: 'Mission Control: Multi-Step Challenges',
  emoji: '🚀',
  domain: 'word-problems',
  levels: [
    level('g5.missions.supply-run', 'Supply Run', 'number-pad', 1, (rng) => {
      const containers = pick(rng, supplyContainers); const items = pick(rng, supplyItems);
      const groups = pick(rng, [18, 24, 32, 36, 42]); const perGroup = randInt(rng, 18, 45);
      const used = randInt(rng, 80, Math.min(250, groups * perGroup - 1));
      return numPad(`Mission: ${groups} ${containers} hold ${perGroup} ${items} each. After the crew uses ${used}, how many remain?`, groups * perGroup - used, {
        visual: { text: `${groups} × ${perGroup} − ${used}` },
      });
    }),
    level('g5.missions.crate-split', 'Shuttle Seats', 'number-pad', 2, (rng) => {
      const mode = randInt(rng, 0, 2);
      if (mode === 0) {
        const transport = pick(rng, transportContexts);
        const people = randInt(rng, 120, 230); const capacity = randInt(rng, 18, 35);
        const quotient = Math.floor(people / capacity); const remainder = people % capacity;
        return numPad(`${people} ${transport.travelers} need ${transport.name} with ${capacity} ${transport.capacity} each. How many are needed?`, quotient + (remainder > 0 ? 1 : 0), {
          visual: { text: `${people} ÷ ${capacity}` }, hint: 'Any travelers left over still need a place.',
        });
      }
      if (mode === 1) {
        const items = pick(rng, supplyItems); const containers = pick(rng, supplyContainers);
        const count = randInt(rng, 120, 230); const capacity = randInt(rng, 18, 35);
        return numPad(`${count} ${items} are packed into ${containers} of ${capacity} each. How many full containers can be filled?`, Math.floor(count / capacity), {
          visual: { text: `${count} ÷ ${capacity}` }, hint: 'Count only complete containers.',
        });
      }
      const transport = pick(rng, transportContexts);
      const people = randInt(rng, 120, 230); const capacity = randInt(rng, 18, 35);
      return numPad(`${people} ${transport.travelers} are split into groups of ${capacity} for ${transport.name}. How many are left over?`, people % capacity, {
        visual: { text: `${people} ÷ ${capacity}` }, hint: 'The remainder is what is left after full groups.',
      });
    }),
    level('g5.missions.fraction-mission', 'Fraction Field Mission', 'multiple-choice', 2, (rng) => {
      const scenario = randInt(rng, 0, 2); let prompt: string; let answer: Frac; let candidates: Frac[];
      if (scenario === 0) {
        const first = pick(rng, [{ n: 3, d: 4 }, { n: 2, d: 3 }, { n: 5, d: 6 }]);
        const second = pick(rng, [{ n: 2, d: 3 }, { n: 1, d: 2 }, { n: 3, d: 5 }]);
        answer = add(first, second);
        prompt = `A rover travels ${fracLabel(first)} km, then ${fracLabel(second)} km. How far does it travel in all?`;
        candidates = [sub(first, second), { n: first.n + second.n, d: first.d + second.d }, { n: answer.n + 1, d: answer.d }];
      } else if (scenario === 1) {
        const perBatch = pick(rng, [{ n: 2, d: 3 }, { n: 3, d: 4 }, { n: 1, d: 2 }]);
        const batches = randInt(rng, 2, 4);
        answer = mul(perBatch, { n: batches, d: 1 });
        prompt = `Each space café batch needs ${fracLabel(perBatch)} cup of fruit. How many cups are needed for ${batches} batches?`;
        candidates = [{ n: perBatch.n + batches, d: perBatch.d }, { n: perBatch.n, d: perBatch.d * batches }, { n: answer.n + 1, d: answer.d }];
      } else {
        const portion = properFraction(rng); const wholePortion = properFraction(rng);
        const food = pick(rng, fractionMissionFoods);
        answer = mul(portion, wholePortion);
        prompt = `A bio-dome pet eats ${fracLabel(portion)} of a ${fracLabel(wholePortion)} ${food}. What fraction of the whole item is eaten?`;
        candidates = [portion, wholePortion, { n: portion.n + wholePortion.n, d: portion.d + wholePortion.d }];
      }
      return buildMc(prompt, { label: fracLabel(answer), value: answer }, candidates.map((value) => ({
        label: fracLabel(value), value,
      })), rng, { hint: 'Show the fraction operation before simplifying.' },
      (value) => fracLabel(typeof value === 'number' ? { n: value, d: 1 } : value));
    }),
    level('g5.missions.decimal-budget', 'Credit Budget', 'multiple-choice', 3, (rng) => {
      const quantity = randInt(rng, 2, 7); const price = randInt(rng, 125, 699);
      const total = quantity * price;
      const payment = total < 2000 ? 2000 : 5000;
      const change = payment - total;
      const candidates = [change + 100, Math.max(0, change - 100), change + 250, Math.max(0, change - 250), total];
      return buildMc(`The zero-g café sells each food pouch for ${formatMoney(price)}. The crew buys ${quantity} and pays ${formatMoney(payment)}. How much change is due?`, {
        label: formatMoney(change), value: change,
      }, candidates.map((value) => ({ label: formatMoney(value), value })), rng, {
        hint: 'Find the total cost in cents, then subtract it from the payment.',
      }, (value) => formatMoney(typeof value === 'number' ? value : value.n));
    }),
  ],
};
