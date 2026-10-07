import { pick, randInt } from '../../core/rng';
import type { UnitDef } from '../../core/types';
import { level } from '../helpers';
import { buildMc, decLabel, decimalSupplies } from './math';

export const fuelLab: UnitDef = {
  id: 'g5.fuel-lab',
  title: 'Fuel Lab: Decimal Operations',
  emoji: '⛽',
  domain: 'decimals',
  levels: [
    level('g5.fuel-lab.add-sub', 'Mix the Fuel', 'multiple-choice', 1, (rng) => {
      const isAddition = rng() < 0.5;
      const a = randInt(rng, 125, 725); const b = randInt(rng, 80, isAddition ? 420 : a - 1);
      const answer = isAddition ? a + b : a - b;
      const misaligned = isAddition ? a + Math.floor(b / 10) : a - Math.floor(b / 10);
      const candidates = [misaligned, answer + 10, Math.max(0, answer - 10), answer + 100, Math.max(0, answer - 100)];
      const resource = pick(rng, decimalSupplies);
      return buildMc(`${resource}: ${decLabel(a, 100)} ${isAddition ? '+' : '−'} ${decLabel(b, 100)} = ?`, {
        label: decLabel(answer, 100), value: answer,
      }, candidates.map((value) => ({ label: decLabel(value, 100), value })), rng, {
        hint: 'Line up the decimal points before adding or subtracting.',
      }, (value) => decLabel(typeof value === 'number' ? value : value.n, 100));
    }),
    level('g5.fuel-lab.multiply', 'Scale the Formula', 'multiple-choice', 2, (rng) => {
      const wholeMultiply = rng() < 0.5;
      let prompt: string; let answer: number; let added: number;
      if (wholeMultiply) {
        const decimal = pick(rng, [125, 250, 375, 425, 650, 875]);
        const whole = randInt(rng, 2, 6);
        prompt = `${decLabel(decimal, 100)} × ${whole} = ?`;
        answer = decimal * whole * 10; added = decimal * 10 + whole * 1000;
      } else {
        const x = pick(rng, [3, 4, 6, 7, 8, 9]); const y = pick(rng, [2, 3, 4, 5, 6, 8, 9]);
        prompt = `0.${x} × 0.${y} = ?`; answer = x * y * 10; added = (x + y) * 100;
      }
      const candidates = [answer * 10, Math.floor(answer / 10), added, answer + 100, Math.max(0, answer - 100)];
      return buildMc(prompt, { label: decLabel(answer, 1000), value: answer },
        candidates.map((value) => ({ label: decLabel(value, 1000), value })), rng, {
          hint: 'Estimate the product, then place the decimal point.',
        }, (value) => decLabel(typeof value === 'number' ? value : value.n, 1000));
    }),
    level('g5.fuel-lab.divide', 'Split the Supply', 'multiple-choice', 3, (rng) => {
      const template = randInt(rng, 0, 2);
      let prompt: string; let answer: number; let productInstead: number;
      if (template === 0) {
        const quotient = randInt(rng, 12, 48) * 100;
        const divisor = randInt(rng, 2, 6);
        const dividend = quotient * divisor;
        prompt = `${decLabel(dividend, 1000)} ÷ ${divisor} = ?`;
        answer = quotient; productInstead = dividend * divisor;
      } else if (template === 1) {
        const quotient = randInt(rng, 4, 12); const divisorTenths = pick(rng, [4, 5, 6, 8]);
        const dividend = quotient * divisorTenths * 100;
        const divisor = divisorTenths * 100;
        prompt = `${decLabel(dividend, 1000)} ÷ ${decLabel(divisor, 1000)} = ?`;
        answer = quotient * 1000; productInstead = Math.floor(dividend * divisor / 1000);
      } else {
        const quotient = randInt(rng, 4, 12); const divisorTenths = 5;
        const dividend = quotient * divisorTenths * 100;
        prompt = `${decLabel(dividend, 1000)} ÷ 0.5 = ?`;
        answer = quotient * 1000; productInstead = Math.floor(dividend * 500 / 1000);
      }
      const candidates = [answer * 10, Math.floor(answer / 10), productInstead, answer + 1000, Math.max(0, answer - 1000)];
      return buildMc(prompt, { label: decLabel(answer, 1000), value: answer },
        candidates.map((value) => ({ label: decLabel(value, 1000), value })), rng, {
          hint: 'Use multiplication to check a quotient.',
        }, (value) => decLabel(typeof value === 'number' ? value : value.n, 1000));
    }),
  ],
};
