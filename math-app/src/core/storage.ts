import AsyncStorage from '@react-native-async-storage/async-storage';

import type { GradeId } from './types';

const KEY = 'mathquest.profile.v1';

export interface LevelProgress {
  stars: number;
  plays: number;
  bestCorrect: number;
  bestTotal: number;
}

export interface Profile {
  name: string;
  avatar: string;
  gradeId: GradeId | null;
  coins: number;
  xp: number;
  progress: Record<string, LevelProgress>;
  stickers: string[];
  streak: { count: number; lastDate: string | null };
  daily: { date: string | null; done: number; total: number };
  perfectRounds: number;
}

export function newProfile(name: string, avatar: string, gradeId: GradeId): Profile {
  return {
    name,
    avatar,
    gradeId,
    coins: 0,
    xp: 0,
    progress: {},
    stickers: [],
    streak: { count: 0, lastDate: null },
    daily: { date: null, done: 0, total: 0 },
    perfectRounds: 0,
  };
}

export async function loadProfile(): Promise<Profile | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Profile) : null;
  } catch {
    return null;
  }
}

export async function saveProfile(profile: Profile): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(profile));
}

export async function clearProfile(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
