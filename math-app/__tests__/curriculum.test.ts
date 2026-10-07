import { getGrade, isLevelUnlocked } from '../src/core/curriculum';

describe('level unlocks', () => {
  it('opens the first level and unlocks each next level after a star', () => {
    const unit = getGrade('prek').units[0];
    const [first, second, third] = unit.levels;

    expect(isLevelUnlocked(unit, first.id, {})).toBe(true);
    expect(isLevelUnlocked(unit, second.id, {})).toBe(false);
    expect(isLevelUnlocked(unit, second.id, { [first.id]: { stars: 1 } })).toBe(true);
    expect(isLevelUnlocked(unit, third.id, { [first.id]: { stars: 1 } })).toBe(false);
    expect(isLevelUnlocked(unit, third.id, { [first.id]: { stars: 1 }, [second.id]: { stars: 1 } })).toBe(true);
  });
});
