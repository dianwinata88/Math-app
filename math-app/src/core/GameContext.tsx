import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { getGrade, GRADES, isUnitMastered } from './curriculum';
import { nextStreak, todayISO, unlockedStickers } from './rewards';
import { loadProfile, newProfile, saveProfile, type LevelProgress, type Profile } from './storage';
import type { GradeId } from './types';

interface GameContextValue {
  profile: Profile | null;
  loading: boolean;
  createProfile: (name: string, avatar: string, gradeId: GradeId) => Promise<void>;
  setGrade: (gradeId: GradeId) => Promise<void>;
  recordLevelResult: (levelId: string, correct: number, total: number, stars: number, xp: number, coins: number) => Promise<void>;
  recordDailyDone: (coins: number) => Promise<void>;
  resetAll: () => Promise<void>;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile().then((p) => {
      setProfile(p);
      setLoading(false);
    });
  }, []);

  const persist = useCallback(async (p: Profile) => {
    setProfile(p);
    await saveProfile(p);
  }, []);

  const createProfile = useCallback(
    async (name: string, avatar: string, gradeId: GradeId) => {
      await persist(newProfile(name, avatar, gradeId));
    },
    [persist],
  );

  const setGrade = useCallback(
    async (gradeId: GradeId) => {
      if (!profile) return;
      await persist({ ...profile, gradeId });
    },
    [profile, persist],
  );

  const recordLevelResult = useCallback(
    async (levelId: string, correct: number, total: number, stars: number, xp: number, coins: number) => {
      if (!profile) return;
      const prev: LevelProgress = profile.progress[levelId] ?? { stars: 0, plays: 0, bestCorrect: 0, bestTotal: 0 };
      const next: LevelProgress = {
        stars: Math.max(prev.stars, stars),
        plays: prev.plays + 1,
        bestCorrect: Math.max(prev.bestCorrect, correct),
        bestTotal: Math.max(prev.bestTotal, total),
      };
      const progress = { ...profile.progress, [levelId]: next };
      const grade = profile.gradeId ? getGrade(profile.gradeId) : null;
      const masteredUnits = grade ? grade.units.filter((u) => isUnitMastered(u, progress)).length : 0;
      const totalStars = GRADES.reduce(
        (s, g) => s + g.units.flatMap((u) => u.levels).reduce((t, l) => t + (progress[l.id]?.stars ?? 0), 0),
        0,
      );
      const ctx = {
        totalStars,
        coins: profile.coins + coins,
        streakCount: profile.streak.count,
        completedDaily: profile.daily.total > 0 && profile.daily.done >= profile.daily.total,
        perfectRounds: profile.perfectRounds + (correct === total ? 1 : 0),
        masteredUnits,
      };
      const stickers = [...new Set([...profile.stickers, ...unlockedStickers(ctx)])];
      await persist({
        ...profile,
        coins: profile.coins + coins,
        xp: profile.xp + xp,
        progress,
        stickers,
        perfectRounds: ctx.perfectRounds,
      });
    },
    [profile, persist],
  );

  const recordDailyDone = useCallback(async (coins: number) => {
    if (!profile) return;
    const today = todayISO();
    const count = nextStreak(profile.streak.lastDate, profile.streak.count, today);
    const totalStars = GRADES.reduce(
      (s, g) => s + g.units.flatMap((u) => u.levels).reduce((t, l) => t + (profile.progress[l.id]?.stars ?? 0), 0),
      0,
    );
    const ctx = {
      totalStars,
      coins: profile.coins + coins,
      streakCount: count,
      completedDaily: true,
      perfectRounds: profile.perfectRounds,
      masteredUnits: 0,
    };
    const stickers = [...new Set([...profile.stickers, ...unlockedStickers(ctx)])];
    const dailyTotal = profile.daily.total || 10;
    await persist({
      ...profile,
      coins: profile.coins + coins,
      streak: { count, lastDate: today },
      daily: { date: today, done: dailyTotal, total: dailyTotal },
      stickers,
    });
  }, [profile, persist]);

  const resetAll = useCallback(async () => {
    setProfile(null);
    await AsyncStorage.removeItem('mathquest.profile.v1');
  }, []);

  const value = useMemo(
    () => ({ profile, loading, createProfile, setGrade, recordLevelResult, recordDailyDone, resetAll }),
    [profile, loading, createProfile, setGrade, recordLevelResult, recordDailyDone, resetAll],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameProvider');
  return ctx;
}
