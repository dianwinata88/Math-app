import { createRng, randInt } from '../src/core/rng';

describe('deterministic random number generator', () => {
  it('repeats the same values for the same seed', () => {
    const first = createRng(42);
    const second = createRng(42);
    expect(Array.from({ length: 20 }, first)).toEqual(Array.from({ length: 20 }, second));
  });

  it('keeps integer values in the inclusive range', () => {
    const rng = createRng(7);
    const values = Array.from({ length: 100 }, () => randInt(rng, 3, 11));
    expect(values.every((value) => value >= 3 && value <= 11 && Number.isInteger(value))).toBe(true);
  });
});
