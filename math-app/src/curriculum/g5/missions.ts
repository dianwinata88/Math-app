import { pick, randInt } from '../../core/rng';
import type { UnitDef } from '../../core/types';
import { level, numPad } from '../helpers';
import { add, buildMc, formatMoney, fracLabel, mul, sub } from './math';
import type { Frac } from './math';

export const missions: UnitDef = {
  id: 'g5.missions',
  title: 'Mission Control: Multi-Step Challenges',
  emoji: '🚀',
  domain: 'word-problems',
  levels: [
    level('g5.missions.supply-run', 'Supply Run', 'number-pad', 1, (rng) => {
      const crates = pick(rng, [18, 24, 32, 36, 42]); const packs = randInt(rng, 18, 45);
      const eaten = randInt(rng, 80, Math.min(250, crates * packs - 1));
      return numPad(`Mission: ${crates} supply crates hold ${packs} meal packs each. After the crew uses ${eaten}, how many packs remain?`, crates * packs - eaten, {
        visual: { text: `${crates} × ${packs} − ${eaten}` },
      });
    }),
    level('g5.missions.crate-split', 'Shuttle Seats', 'number-pad', 2, (rng) => {
      const people = randInt(rng, 120, 230); const capacity = randInt(rng, 18, 35);
      const quotient = Math.floor(people / capacity); const remainder = people % capacity;
      const mode = randInt(rng, 0, 2);
      if (mode === 0) return numPad(`${people} crew need shuttles with ${capacity} seats each. How many shuttles are needed?`, quotient + (remainder > 0 ? 1 : 0), {
        visual: { text: `${people} ÷ ${capacity}` }, hint: 'Any crew left over still need a shuttle seat.',
      });
      if (mode === 1) return numPad(`${people} meal pouches are packed into boxes of ${capacity}. How many full boxes can be filled?`, quotient, {
        visual: { text: `${people} ÷ ${capacity}` }, hint: 'Count only complete boxes.',
      });
      return numPad(`${people} samples are packed ${capacity} per case. How many samples are left over?`, remainder, {
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
        const portion = { n: 1, d: 3 }; const pizza = { n: 3, d: 4 };
        answer = mul(portion, pizza);
        prompt = 'A crew member eats 1/3 of the remaining 3/4 of a pizza. What fraction of a whole pizza is eaten?';
        candidates = [{ n: 1, d: 3 }, { n: 3, d: 4 }, { n: 3, d: 7 }];
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
