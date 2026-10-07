import { nextStreak, unlockedStickers } from '../src/core/rewards';

describe('rewards and streaks', () => {
  it('starts, preserves, increments, and resets streaks', () => {
    expect(nextStreak(null, 0, '2025-03-10')).toBe(1);
    expect(nextStreak('2025-03-10', 4, '2025-03-10')).toBe(4);
    expect(nextStreak('2025-03-09', 4, '2025-03-10')).toBe(5);
    expect(nextStreak('2025-03-07', 4, '2025-03-10')).toBe(1);
  });

  it('unlocks stickers from the matching reward criteria', () => {
    expect(unlockedStickers({
      totalStars: 10,
      coins: 100,
      streakCount: 3,
      completedDaily: true,
      perfectRounds: 1,
      masteredUnits: 0,
    })).toEqual(expect.arrayContaining(['first-star', 'ten-stars', 'streak-3', 'hundred-coins', 'daily-hero', 'perfect-round']));
    expect(unlockedStickers({
      totalStars: 0,
      coins: 0,
      streakCount: 0,
      completedDaily: false,
      perfectRounds: 0,
      masteredUnits: 0,
    })).toEqual([]);
  });
});
