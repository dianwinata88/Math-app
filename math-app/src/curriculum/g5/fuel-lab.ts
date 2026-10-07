import { pick, randInt } from '../../core/rng';
import type { UnitDef } from '../../core/types';
import { level } from '../helpers';
import { buildMc, decLabel } from './math';

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
      return buildMc(`${decLabel(a, 100, 2)} ${isAddition ? '+' : '−'} ${decLabel(b, 100, 2)} = ?`, {
        label: decLabel(answer, 100, 2), value: answer,
      }, candidates.map((value) => ({ label: decLabel(value, 100, 2), value })), rng, {
        hint: 'Line up the decimal points before adding or subtracting.',
      }, (value) => decLabel(typeof value === 'number' ? value : value.n, 100, 2));
    }),
    level('g5.fuel-lab.multiply', 'Scale the Formula', 'multiple-choice', 2, (rng) => {
      const wholeMultiply = rng() < 0.5;
      let prompt: string; let answer: number; let added: number;
      if (wholeMultiply) {
        const decimal = pick(rng, [125, 250, 375, 425, 650, 875]);
        const whole = randInt(rng, 2, 6);
        prompt = `${decLabel(decimal, 100, 2)} × ${whole} = ?`;
        answer = decimal * whole; added = decimal + whole * 100;
      } else {
        const x = pick(rng, [3, 4, 6, 7, 8, 9]); const y = pick(rng, [2, 3, 4, 5, 6, 8, 9]);
        prompt = `0.${x} × 0.${y} = ?`; answer = x * y; added = x * 10 + y * 10;
      }
      const candidates = [answer * 10, Math.floor(answer / 10), added, answer + 10, Math.max(0, answer - 10)];
      return buildMc(prompt, { label: decLabel(answer, 100, 2), value: answer },
        candidates.map((value) => ({ label: decLabel(value, 100, 2), value })), rng, {
          hint: 'Estimate the product, then place the decimal point.',
        }, (value) => decLabel(typeof value === 'number' ? value : value.n, 100, 2));
    }),
    level('g5.fuel-lab.divide', 'Split the Supply', 'multiple-choice', 3, (rng) => {
      const template = randInt(rng, 0, 2);
      let prompt: string; let answer: number; let productInstead: number;
      if (template === 0) {
        const quotient = randInt(rng, 12, 48) * 10;
        const divisor = randInt(rng, 2, 6);
        const dividend = quotient * divisor;
        prompt = `${decLabel(dividend, 100, 1)} ÷ ${divisor} = ?`;
        answer = quotient; productInstead = dividend * divisor;
      } else if (template === 1) {
        const quotient = randInt(rng, 4, 12); const divisorTenths = pick(rng, [4, 5, 6, 8]);
        prompt = `${decLabel(quotient * divisorTenths, 10, 1)} ÷ ${decLabel(divisorTenths, 10, 1)} = ?`;
        answer = quotient * 100; productInstead = quotient * divisorTenths * divisorTenths;
      } else {
        const quotient = randInt(rng, 4, 12); const divisorTenths = 5;
        prompt = `${decLabel(quotient * divisorTenths, 10, 1)} ÷ 0.5 = ?`;
        answer = quotient * 100; productInstead = quotient * divisorTenths;
      }
      const candidates = [answer * 10, Math.floor(answer / 10), productInstead, answer + 100, Math.max(0, answer - 100)];
      return buildMc(prompt, { label: decLabel(answer, 100, 2), value: answer },
        candidates.map((value) => ({ label: decLabel(value, 100, 2), value })), rng, {
          hint: 'Use multiplication to check a quotient.',
        }, (value) => decLabel(typeof value === 'number' ? value : value.n, 100, 2));
    }),
  ],
};
