import { pick, randInt } from '../../core/rng';
import type { UnitDef } from '../../core/types';
import { level, numPad } from '../helpers';
import { buildMc, fracLabel, simplify, volumeStructures } from './math';
import type { Frac } from './math';

export const cargoHold: UnitDef = {
  id: 'g5.cargo-hold',
  title: 'Cargo Hold: Measurement & Volume',
  emoji: '📦',
  domain: 'measurement',
  levels: [
    level('g5.cargo-hold.convert', 'Unit Converter', 'number-pad', 1, (rng) => {
      const conversion = randInt(rng, 0, 11);
      let prompt: string; let answer: number;
      if (conversion === 0) { const n = randInt(rng, 2, 35); prompt = `${n} km = ? m`; answer = n * 1000; }
      else if (conversion === 1) { const n = randInt(rng, 2, 75); prompt = `${n} m = ? cm`; answer = n * 100; }
      else if (conversion === 2) { const n = randInt(rng, 2, 42); prompt = `${n} kg = ? g`; answer = n * 1000; }
      else if (conversion === 3) { const n = randInt(rng, 2, 48); prompt = `${n} L = ? mL`; answer = n * 1000; }
      else if (conversion === 4) { const n = randInt(rng, 3, 36); prompt = `${n} ft = ? in`; answer = n * 12; }
      else if (conversion === 5) { const n = randInt(rng, 2, 20); prompt = `${n} yd = ? in`; answer = n * 3 * 12; }
      else if (conversion === 6) { const n = randInt(rng, 2, 10); prompt = `${n} gal = ? qt`; answer = n * 4; }
      else if (conversion === 7) { const n = randInt(rng, 2, 10); prompt = `${n} gal = ? pt`; answer = n * 8; }
      else if (conversion === 8) { const n = randInt(rng, 2, 10); prompt = `${n} gal = ? cups`; answer = n * 16; }
      else if (conversion === 9) { const h = randInt(rng, 1, 8); const m = randInt(rng, 5, 55); prompt = `${h} h ${m} min = ? min`; answer = h * 60 + m; }
      else if (conversion === 10) { const n = randInt(rng, 2, 40); prompt = `${n} lb = ? oz`; answer = n * 16; }
      else { const m = randInt(rng, 1, 8); const cm = randInt(rng, 10, 99); prompt = `${m} m ${cm} cm = ? cm`; answer = m * 100 + cm; }
      return numPad(`Convert the cargo measure: ${prompt}.`, answer, { visual: { text: prompt } });
    }),
    level('g5.cargo-hold.volume', 'Pack the Crate', 'number-pad', 2, (rng) => {
      const structure = pick(rng, volumeStructures);
      if (rng() < 0.5) {
        const rows = randInt(rng, 3, 7); const perRow = randInt(rng, 3, 8); const layers = randInt(rng, 2, 6);
        const answer = rows * perRow * layers;
        return numPad(`A ${structure} has ${rows} rows of ${perRow} unit cubes in ${layers} layers. How many cubes fit?`, answer, {
          visual: { text: `🧊 ${rows} rows × ${perRow} cubes × ${layers} layers` },
        });
      }
      const l = randInt(rng, 3, 12); const w = randInt(rng, 2, 9); const h = randInt(rng, 2, 8);
      return numPad(`A ${structure} is ${l} cm long, ${w} cm wide, and ${h} cm high. Find its volume in cm³.`, l * w * h, {
        visual: { text: `${l} × ${w} × ${h} cm³` },
      });
    }),
    level('g5.cargo-hold.additive-volume', 'Combined Modules', 'number-pad', 3, (rng) => {
      if (rng() < 0.5) {
        const a = [randInt(rng, 2, 7), randInt(rng, 2, 8), randInt(rng, 2, 6)];
        const b = [randInt(rng, 2, 7), randInt(rng, 2, 8), randInt(rng, 2, 6)];
        const volumeA = a[0] * a[1] * a[2]; const volumeB = b[0] * b[1] * b[2];
        return numPad(`Two non-overlapping cargo prisms have dimensions ${a.join(' × ')} and ${b.join(' × ')} units. Find their combined volume.`, volumeA + volumeB, {
          visual: { text: `Module A: ${a.join(' × ')}\nModule B: ${b.join(' × ')}` },
          hint: 'Find each prism’s volume, then add.',
        });
      }
      const length = randInt(rng, 3, 12); const width = randInt(rng, 2, 9); const height = randInt(rng, 2, 8);
      const volume = length * width * height;
      return numPad(`A cargo module has volume ${volume} cm³, length ${length} cm, and width ${width} cm. Find its height.`, height, {
        visual: { text: `${length} × ${width} × ? = ${volume} cm³` },
        hint: 'Divide the volume by the two known dimensions.',
      });
    }),
    level('g5.cargo-hold.line-plot', 'Sample Line Plot', 'multiple-choice', 3, (rng) => {
      const positions = [1, 2, 3, 4, 5, 6, 7];
      const selected = [...new Set(positions.filter(() => rng() < 0.65))];
      if (selected.length < 3) [1, 4, 7].forEach((value) => selected.includes(value) || selected.push(value));
      selected.sort((a, b) => a - b);
      const counts = selected.map(() => randInt(rng, 1, 3));
      const totalCount = counts.reduce((sum, count) => sum + count, 0);
      const totalEighths = selected.reduce((sum, value, index) => sum + value * counts[index], 0);
      const type = randInt(rng, 0, 2);
      const plot = selected.map((value, index) => `${fracLabel(simplify({ n: value, d: 8 }))} kg | ${'✕'.repeat(counts[index])}`).join('\n');
      let answer: Frac; let prompt: string; let wrong: Frac[];
      if (type === 0) {
        answer = simplify({ n: totalEighths, d: 8 });
        prompt = 'What is the total mass of the asteroid samples?';
        wrong = [simplify({ n: totalEighths + 1, d: 8 }), simplify({ n: Math.max(1, totalEighths - 1), d: 8 }), simplify({ n: totalCount, d: 8 })];
      } else if (type === 1) {
        answer = simplify({ n: selected[selected.length - 1] - selected[0], d: 8 });
        prompt = 'What is the difference between the heaviest and lightest samples?';
        wrong = [simplify({ n: selected[selected.length - 1], d: 8 }), simplify({ n: selected[0], d: 8 }), simplify({ n: selected[selected.length - 1] + selected[0], d: 8 })];
      } else {
        answer = simplify({ n: totalEighths, d: 8 * totalCount });
        prompt = `How much sample mass goes in each of ${totalCount} beakers?`;
        wrong = [simplify({ n: totalEighths, d: 8 }), simplify({ n: totalCount, d: totalEighths }), simplify({ n: totalEighths, d: 8 * (totalCount + 1) })];
      }
      return buildMc(prompt, { label: fracLabel(answer), value: answer }, wrong.map((value) => ({
        label: fracLabel(value), value,
      })), rng, { visual: { text: plot }, hint: 'Count each mark and use the fraction named on its line.' },
      (value) => fracLabel(typeof value === 'number' ? { n: value, d: 1 } : value));
    }),
  ],
};
