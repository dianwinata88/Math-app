import { pick, randInt } from '../../core/rng';
import type { UnitDef } from '../../core/types';
import { level, matchPairs, numPad, orderSeq } from '../helpers';
import { buildMc, decLabel, roundDecimal } from './math';

export const decimalDock: UnitDef = {
  id: 'g5.decimal-dock',
  title: 'Decimal Docking Bay',
  emoji: '🛰️',
  domain: 'decimals',
  levels: [
    level('g5.decimal-dock.powers-of-ten', 'Power-of-10 Thrusters', 'number-pad', 1, (rng) => {
      const template = randInt(rng, 0, 3);
      let text: string; let answer: number;
      if (template === 0) {
        const n = randInt(rng, 12, 9876); const k = randInt(rng, 1, n > 999 ? 3 : 4);
        const superscripts = ['', '¹', '²', '³', '⁴'];
        text = `${n} × 10${superscripts[k]}`; answer = n * 10 ** k;
      } else if (template === 1) {
        const n = pick(rng, [36, 47, 52, 68, 75, 84]);
        text = `${decLabel(n, 10, 1)} × 100`; answer = n * 10;
      } else if (template === 2) {
        const n = pick(rng, [25, 35, 45, 65, 75, 85]);
        text = `${decLabel(n, 100, 2)} × 1000`; answer = n * 10;
      } else {
        const value = pick(rng, [1200, 2400, 3500, 4700, 6800, 9200]);
        text = `${value} ÷ 100`; answer = value / 100;
      }
      return numPad(`Calculate ${text}.`, answer, { visual: { text }, hint: 'Each power of 10 shifts digits one place.' });
    }),
    level('g5.decimal-dock.decimal-forms', 'Signal Forms', 'match-pairs', 1, (rng) => {
      const values = new Set<number>();
      while (values.size < 3) {
        const digits = [randInt(rng, 1, 9), randInt(rng, 1, 9), randInt(rng, 1, 9)];
        values.add(digits[0] * 100 + digits[1] * 10 + digits[2]);
      }
      const pairs = [...values].map((value) => {
        const hundreds = Math.floor(value / 100); const tens = Math.floor(value / 10) % 10; const ones = value % 10;
        return {
          left: decLabel(value, 1000, 3),
          right: `${hundreds} × 0.1 + ${tens} × 0.01 + ${ones} × 0.001`,
        };
      });
      return matchPairs('Match each decimal signal to its expanded form.', pairs);
    }),
    level('g5.decimal-dock.compare-round', 'Compare & Round', 'multiple-choice', 2, (rng) => {
      if (rng() < 0.5) {
        const readings = ['0.5', '0.45', '0.405', '0.054'];
        const greatest = rng() < 0.5;
        const values = [500, 450, 405, 54];
        const index = greatest ? 0 : 3;
        const answer = readings[index];
        const candidates = readings.map((label, i) => ({ label, value: values[i] })).filter((candidate) => candidate.label !== answer);
        return buildMc(`Which reading is ${greatest ? 'greatest' : 'least'}?`, { label: answer, value: values[index] }, candidates, rng, {
          hint: 'Compare equal place values from left to right; extra digits do not always mean greater.',
        });
      }
      const value = pick(rng, [3476, 2183, 2995, 6412, 7855, 1204]);
      const place = pick(rng, [0, 1, 2]);
      const divisor = [1000, 100, 10][place];
      const rounded = roundDecimal(value, 1000, place);
      const answer = decLabel(rounded, 1000, place);
      const trunc = Math.floor(value / divisor) * divisor;
      const wrongPlace = roundDecimal(value, 1000, place === 0 ? 2 : place === 1 ? 1 : 0);
      const candidates = [
        { label: decLabel(trunc, 1000, place), value: trunc },
        { label: decLabel(wrongPlace, 1000, place), value: wrongPlace },
        { label: decLabel(rounded + divisor, 1000, place), value: rounded + divisor },
        { label: decLabel(Math.max(0, rounded - divisor), 1000, place), value: Math.max(0, rounded - divisor) },
      ];
      return buildMc(`Round ${decLabel(value, 1000, 3)} to the nearest ${['whole number', 'tenth', 'hundredth'][place]}.`, {
        label: answer, value: rounded,
      }, candidates, rng, { hint: 'Look one place to the right of the rounding place.' }, (candidate) => (
        typeof candidate === 'number' ? decLabel(candidate, 1000, place) : decLabel(candidate.n, 1000, place)
      ));
    }),
    level('g5.decimal-dock.order', 'Docking Queue', 'order-sequence', 3, (rng) => {
      const values = new Set<number>();
      while (values.size < 5) {
        const precision = randInt(rng, 0, 2);
        const value = precision === 0 ? randInt(rng, 1, 9) * 100
          : precision === 1 ? randInt(rng, 10, 99) * 10 : randInt(rng, 100, 999);
        values.add(value);
      }
      const sequence = [...values].sort((a, b) => a - b).map((value) => {
        const places = value % 100 !== 0 ? 3 : value % 10 !== 0 ? 2 : 1;
        return decLabel(value, 1000, places);
      });
      return orderSeq('Order the docking codes from least to greatest.', sequence);
    }),
  ],
};
