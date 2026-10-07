export interface Sticker {
  id: string;
  emoji: string;
  name: string;
  rule: string;
}

export const STICKERS: Sticker[] = [
  { id: 'first-star', emoji: '⭐', name: 'First Star', rule: 'Earn your first star' },
  { id: 'ten-stars', emoji: '🚀', name: 'Rocket Learner', rule: 'Collect 10 stars' },
  { id: 'twentyfive-stars', emoji: '🦄', name: 'Unicorn Scholar', rule: 'Collect 25 stars' },
  { id: 'fifty-stars', emoji: '👑', name: 'Math Royalty', rule: 'Collect 50 stars' },
  { id: 'streak-3', emoji: '🔥', name: 'On Fire', rule: 'Practice 3 days in a row' },
  { id: 'streak-7', emoji: '💎', name: 'Diamond Streak', rule: 'Practice 7 days in a row' },
  { id: 'hundred-coins', emoji: '🪙', name: 'Coin Collector', rule: 'Save 100 coins' },
  { id: 'unit-master', emoji: '🏆', name: 'Unit Master', rule: 'Get 3 stars on every level of a unit' },
  { id: 'daily-hero', emoji: '🦸', name: 'Daily Hero', rule: 'Finish a daily practice' },
  { id: 'perfect-round', emoji: '🎯', name: 'Bullseye', rule: 'Finish a level with zero mistakes' },
];

export interface StickerContext {
  totalStars: number;
  coins: number;
  streakCount: number;
  completedDaily: boolean;
  perfectRounds: number;
  masteredUnits: number;
}

/** Returns sticker ids the context qualifies for. */
export function unlockedStickers(ctx: StickerContext): string[] {
  const ids: string[] = [];
  if (ctx.totalStars >= 1) ids.push('first-star');
  if (ctx.totalStars >= 10) ids.push('ten-stars');
  if (ctx.totalStars >= 25) ids.push('twentyfive-stars');
  if (ctx.totalStars >= 50) ids.push('fifty-stars');
  if (ctx.streakCount >= 3) ids.push('streak-3');
  if (ctx.streakCount >= 7) ids.push('streak-7');
  if (ctx.coins >= 100) ids.push('hundred-coins');
  if (ctx.masteredUnits >= 1) ids.push('unit-master');
  if (ctx.completedDaily) ids.push('daily-hero');
  if (ctx.perfectRounds >= 1) ids.push('perfect-round');
  return ids;
}

export function todayISO(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/**
 * Advance a streak given the previous last-practice date.
 * Same day -> unchanged count; yesterday -> +1; otherwise resets to 1.
 */
export function nextStreak(lastDate: string | null, currentCount: number, today = todayISO()): number {
  if (!lastDate) return 1;
  if (lastDate === today) return currentCount;
  const last = new Date(`${lastDate}T00:00:00Z`).getTime();
  const cur = new Date(`${today}T00:00:00Z`).getTime();
  const diffDays = Math.round((cur - last) / 86_400_000);
  return diffDays === 1 ? currentCount + 1 : 1;
}
