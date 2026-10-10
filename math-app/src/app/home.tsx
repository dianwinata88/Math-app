import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { gradeStars, getGrade, isLevelUnlocked } from '../core/curriculum';
import { useGame } from '../core/GameContext';
import { todayISO } from '../core/rewards';
import { BigButton, Card, Screen, StarRow } from '../ui/components';
import { colors, gradeColors, radius } from '../ui/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { profile } = useGame();
  const grade = profile?.gradeId ? getGrade(profile.gradeId) : null;

  if (!profile || !grade) {
    return <Screen><Text testID="home-loading" style={styles.loading}>Loading your quest…</Text></Screen>;
  }

  const stars = gradeStars(grade, profile.progress);
  const dailyDone = profile.daily.date === todayISO() && profile.daily.total > 0 && profile.daily.done >= profile.daily.total;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.player}>
            <Text testID="home-avatar" style={styles.avatar}>{profile.avatar}</Text>
            <View>
              <Text testID="home-greeting" style={styles.greeting}>Hi, {profile.name}!</Text>
              <Text testID="home-grade" style={styles.gradeLabel}>{grade.title} • Ages {grade.ages}</Text>
            </View>
          </View>
          <View style={styles.stats}>
            <Text testID="home-coins" style={styles.stat}>🪙 {profile.coins}</Text>
            <Text testID="home-streak" style={styles.stat}>🔥 {profile.streak.count}</Text>
            <Text testID="home-stars" style={styles.stat}>⭐ {stars}</Text>
          </View>
        </View>

        <Pressable
          testID="daily-practice-card"
          accessibilityRole="button"
          onPress={() => router.push('/daily')}
          style={[styles.dailyCard, { borderLeftColor: gradeColors[grade.id] }]}>
          <View style={styles.dailyCopy}>
            <Text testID="daily-card-title" style={styles.dailyTitle}>{dailyDone ? 'Daily Practice Done!' : 'Daily Practice'}</Text>
            <Text testID="daily-card-caption" style={styles.dailySubtitle}>{dailyDone ? 'You’re a practice champion! Come back tomorrow.' : '10 fun questions picked just for you'}</Text>
          </View>
          <View style={[styles.dailyBadge, { backgroundColor: `${gradeColors[grade.id]}1A` }]}>
            <Text style={styles.dailyEmoji}>{dailyDone ? '✅' : '🚀'}</Text>
          </View>
        </Pressable>

        <View style={styles.mapHeading}>
          <Text testID="adventure-map-title" style={styles.sectionTitle}>Your Adventure Map</Text>
          <Text style={styles.mapSubtitle}>Choose a path and collect stars!</Text>
        </View>
        {grade.units.map((unit, unitIndex) => (
          <Card key={unit.id} style={styles.unitCard}>
            <View style={styles.unitHeading}>
              <View style={[styles.unitTile, { backgroundColor: `${gradeColors[grade.id]}1A` }]}>
                <Text style={styles.unitEmoji}>{unit.emoji}</Text>
              </View>
              <View style={styles.unitTitles}>
                <Text testID={`unit-title-${unit.id}`} style={styles.unitTitle}>{unit.title}</Text>
                <Text style={styles.unitDomain}>{unit.domain.replace('-', ' ')}</Text>
              </View>
              <Text style={[styles.unitBadge, { backgroundColor: gradeColors[grade.id] }]}>{unitIndex + 1}</Text>
            </View>
            <View style={styles.path}>
              {unit.levels.map((level, levelIndex) => {
                const unlocked = isLevelUnlocked(unit, level.id, profile.progress);
                const earned = profile.progress[level.id]?.stars ?? 0;
                return (
                  <Pressable
                    key={level.id}
                    testID={`level-${level.id}`}
                    accessibilityRole="button"
                    accessibilityLabel={`${level.title}${unlocked ? '' : ', locked'}`}
                    disabled={!unlocked}
                    onPress={() => router.push({ pathname: '/play/[levelId]', params: { levelId: level.id } })}
                    style={[
                      styles.level,
                      unlocked
                        ? { backgroundColor: `${gradeColors[grade.id]}14`, borderColor: gradeColors[grade.id] }
                        : styles.levelLocked,
                    ]}>
                    <Text testID={`level-label-${level.id}`} style={[styles.levelNumber, !unlocked && styles.levelNumberLocked]}>{unlocked ? levelIndex + 1 : '🔒'}</Text>
                    <Text style={styles.levelTitle} numberOfLines={2}>{level.title}</Text>
                    {unlocked ? <StarRow stars={earned} size={13} /> : null}
                  </Pressable>
                );
              })}
            </View>
          </Card>
        ))}
        <View style={styles.footerButtons}>
          <BigButton testID="open-rewards" label="Rewards" emoji="🎁" color={colors.grape} onPress={() => router.push('/rewards')} />
          <BigButton testID="open-profile" label="Profile" emoji="👤" color={colors.skyDeep} onPress={() => router.push('/profile')} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 20, alignSelf: 'center', width: '100%', maxWidth: 760 },
  header: { gap: 12 },
  player: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 56, height: 56, lineHeight: 56, textAlign: 'center', fontSize: 34, backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  greeting: { color: colors.ink, fontSize: 24, fontWeight: '800', letterSpacing: 0.2 },
  gradeLabel: { color: colors.inkSoft, fontSize: 14, fontWeight: '600', marginTop: 2 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stat: { color: colors.ink, fontSize: 15, fontWeight: '700', backgroundColor: colors.card, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, paddingVertical: 6, paddingHorizontal: 12 },
  dailyCard: { minHeight: 104, borderRadius: radius.md, padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderLeftWidth: 4 },
  dailyCopy: { flex: 1, gap: 4, paddingRight: 10 },
  dailyTitle: { color: colors.ink, fontSize: 22, fontWeight: '800' },
  dailySubtitle: { color: colors.inkSoft, fontSize: 14, fontWeight: '600' },
  dailyBadge: { width: 56, height: 56, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  dailyEmoji: { fontSize: 30 },
  mapHeading: { alignItems: 'center', gap: 2 },
  sectionTitle: { color: colors.ink, fontSize: 22, fontWeight: '800', textAlign: 'center', letterSpacing: 0.2 },
  mapSubtitle: { color: colors.inkSoft, fontSize: 14 },
  unitCard: { gap: 16 },
  unitHeading: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  unitTile: { width: 46, height: 46, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  unitEmoji: { fontSize: 26 },
  unitTitles: { flex: 1 },
  unitTitle: { color: colors.ink, fontSize: 18, fontWeight: '800' },
  unitDomain: { color: colors.inkSoft, fontSize: 12, textTransform: 'capitalize', letterSpacing: 0.4, marginTop: 2 },
  unitBadge: { width: 30, height: 30, textAlign: 'center', lineHeight: 30, color: '#FFFFFF', fontWeight: '800', fontSize: 15, borderRadius: radius.sm, overflow: 'hidden' },
  path: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 10 },
  level: { width: 88, minHeight: 90, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', padding: 8, gap: 2, borderWidth: 1.5 },
  levelLocked: { backgroundColor: colors.paper, borderColor: colors.border },
  levelNumber: { color: colors.ink, fontSize: 20, fontWeight: '800' },
  levelNumberLocked: { color: colors.inkSoft, fontSize: 16 },
  levelTitle: { color: colors.inkSoft, fontSize: 11, fontWeight: '600', textAlign: 'center' },
  footerButtons: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginBottom: 16 },
  loading: { color: colors.inkSoft, textAlign: 'center', fontSize: 18, marginTop: 80 },
});
