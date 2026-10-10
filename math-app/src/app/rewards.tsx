import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { gradeStars, GRADES, isUnitMastered } from '../core/curriculum';
import { useGame } from '../core/GameContext';
import { STICKERS, todayISO, unlockedStickers } from '../core/rewards';
import { BigButton, Card, Screen } from '../ui/components';
import { colors, radius } from '../ui/theme';

export default function RewardsScreen() {
  const router = useRouter();
  const { profile } = useGame();

  if (!profile) {
    return <Screen><Text testID="rewards-loading" style={styles.title}>Loading rewards…</Text></Screen>;
  }

  const totalStars = GRADES.reduce((sum, grade) => sum + gradeStars(grade, profile.progress), 0);
  const masteredUnits = GRADES.reduce((sum, grade) => sum + grade.units.filter((unit) => isUnitMastered(unit, profile.progress)).length, 0);
  const isDailyDone = profile.daily.date === todayISO() && profile.daily.total > 0 && profile.daily.done >= profile.daily.total;
  const earned = new Set([
    ...profile.stickers,
    ...unlockedStickers({
      totalStars,
      coins: profile.coins,
      streakCount: profile.streak.count,
      completedDaily: isDailyDone,
      perfectRounds: profile.perfectRounds,
      masteredUnits,
    }),
  ]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <BigButton testID="rewards-back" label="Back to map" emoji="🗺️" onPress={() => router.replace('/home')} />
        <Text testID="rewards-title" style={styles.title}>Your Treasure Chest 🎁</Text>
        <View style={styles.stats}>
          <Card style={styles.statCard}><Text style={styles.statEmoji}>🪙</Text><Text testID="rewards-coins" style={styles.statValue}>{profile.coins}</Text><Text style={styles.statLabel}>Coins</Text></Card>
          <Card style={styles.statCard}><Text style={styles.statEmoji}>✨</Text><Text testID="rewards-xp" style={styles.statValue}>{profile.xp}</Text><Text style={styles.statLabel}>XP</Text></Card>
          <Card style={styles.statCard}><Text style={styles.statEmoji}>🔥</Text><Text testID="rewards-streak" style={styles.statValue}>{profile.streak.count}</Text><Text style={styles.statLabel}>Day streak</Text></Card>
        </View>
        <Text testID="sticker-heading" style={styles.heading}>Sticker collection</Text>
        <View style={styles.grid}>
          {STICKERS.map((sticker) => {
            const unlocked = earned.has(sticker.id);
            return (
              <View
                key={sticker.id}
                testID={`sticker-${sticker.id}`}
                style={[styles.sticker, !unlocked && styles.locked]}>
                <Text style={[styles.stickerEmoji, !unlocked && styles.greyed]}>{sticker.emoji}</Text>
                <Text style={styles.stickerName}>{sticker.name}</Text>
                <Text style={styles.stickerRule}>{unlocked ? 'Unlocked!' : sticker.rule}</Text>
              </View>
            );
          })}
        </View>
        <BigButton testID="rewards-profile" label="Parent profile" emoji="👤" color={colors.grape} onPress={() => router.push('/profile')} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { alignSelf: 'center', width: '100%', maxWidth: 720, padding: 18, gap: 16, alignItems: 'center' },
  title: { color: colors.ink, fontSize: 28, textAlign: 'center', fontWeight: '900' },
  stats: { width: '100%', flexDirection: 'row', justifyContent: 'center', gap: 10 },
  statCard: { flex: 1, maxWidth: 190, alignItems: 'center', paddingVertical: 14, paddingHorizontal: 8 },
  statEmoji: { fontSize: 28 },
  statValue: { color: colors.ink, fontSize: 24, fontWeight: '900' },
  statLabel: { color: colors.inkSoft, fontSize: 13, fontWeight: '700' },
  heading: { color: colors.ink, fontSize: 21, fontWeight: '900', alignSelf: 'flex-start' },
  grid: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  sticker: { width: '30%', minWidth: 150, minHeight: 136, padding: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card, borderWidth: 2, borderColor: colors.sun, borderRadius: radius.md, gap: 4 },
  locked: { borderColor: colors.locked, backgroundColor: '#EFE7D5' },
  stickerEmoji: { fontSize: 38 },
  greyed: { opacity: 0.35 },
  stickerName: { color: colors.ink, fontSize: 14, fontWeight: '900', textAlign: 'center' },
  stickerRule: { color: colors.inkSoft, fontSize: 11, fontWeight: '600', textAlign: 'center' },
});
