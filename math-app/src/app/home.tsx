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
    <Screen bg={colors.cream}>
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
          style={[styles.dailyCard, { backgroundColor: gradeColors[grade.id] }]}>
          <View style={styles.dailyCopy}>
            <Text testID="daily-card-title" style={styles.dailyTitle}>{dailyDone ? 'Daily Practice Done!' : 'Daily Practice'}</Text>
            <Text testID="daily-card-caption" style={styles.dailySubtitle}>{dailyDone ? 'You’re a practice champion! Come back tomorrow.' : '10 fun questions picked just for you'}</Text>
          </View>
          <Text style={styles.dailyEmoji}>{dailyDone ? '🍬' : '🍭'}</Text>
        </Pressable>

        <View style={styles.mapHeading}>
          <Text testID="adventure-map-title" style={styles.sectionTitle}>Your Adventure Map 🗺️</Text>
          <Text style={styles.mapSubtitle}>Choose a path and collect candy stars!</Text>
        </View>
        {grade.units.map((unit, unitIndex) => (
          <Card key={unit.id} style={[styles.unitCard, { borderColor: gradeColors[grade.id], backgroundColor: `${gradeColors[grade.id]}1A` }]}>
            <View style={styles.unitHeading}>
              <Text style={styles.unitEmoji}>{unit.emoji}</Text>
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
                      { backgroundColor: unlocked ? gradeColors[grade.id] : colors.locked },
                      levelIndex % 2 === 1 && styles.levelOffset,
                    ]}>
                    <View style={styles.levelShine} pointerEvents="none" />
                    <Text testID={`level-label-${level.id}`} style={styles.levelNumber}>{unlocked ? levelIndex + 1 : '🔒'}</Text>
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
        <Text style={styles.footerCandy}>🍬 🍭 🧁 🍩 🍪 🧁 🍭 🍬</Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 18, gap: 18, alignSelf: 'center', width: '100%', maxWidth: 760 },
  header: { gap: 12 },
  player: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 62, height: 62, lineHeight: 62, textAlign: 'center', fontSize: 40, backgroundColor: colors.card, borderRadius: 999, borderWidth: 4, borderColor: colors.bubblegum },
  greeting: { color: colors.bubblegumDeep, fontSize: 26, fontWeight: '900' },
  gradeLabel: { color: colors.inkSoft, fontSize: 15, fontWeight: '700', marginTop: 2 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  stat: { color: colors.ink, fontSize: 16, fontWeight: '800', backgroundColor: colors.card, borderRadius: radius.pill, paddingVertical: 8, paddingHorizontal: 14, borderWidth: 2, borderColor: '#F8D2E6' },
  dailyCard: { minHeight: 116, borderRadius: radius.lg, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 4, borderColor: 'rgba(255,255,255,0.65)', shadowColor: colors.bubblegumDeep, shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 4 },
  dailyCopy: { flex: 1, gap: 6, paddingRight: 8 },
  dailyTitle: { color: '#fff', fontSize: 25, fontWeight: '900', textShadowColor: 'rgba(74,53,86,0.25)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
  dailySubtitle: { color: 'rgba(255,255,255,0.95)', fontSize: 15, fontWeight: '700' },
  dailyEmoji: { fontSize: 46 },
  mapHeading: { alignItems: 'center', gap: 2 },
  sectionTitle: { color: colors.bubblegumDeep, fontSize: 25, fontWeight: '900', textAlign: 'center' },
  mapSubtitle: { color: colors.inkSoft, fontSize: 15, fontWeight: '600' },
  unitCard: { gap: 18, borderWidth: 3, borderColor: '#F0E7D2', overflow: 'hidden' },
  unitHeading: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  unitEmoji: { fontSize: 36 },
  unitTitles: { flex: 1 },
  unitTitle: { color: colors.ink, fontSize: 20, fontWeight: '900' },
  unitDomain: { color: colors.inkSoft, fontSize: 13, textTransform: 'capitalize', marginTop: 2 },
  unitBadge: { width: 36, height: 36, textAlign: 'center', lineHeight: 36, color: colors.ink, fontWeight: '900', borderRadius: 18, overflow: 'hidden', borderWidth: 3, borderColor: 'rgba(255,255,255,0.7)' },
  path: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 12 },
  level: { width: 92, minHeight: 94, borderRadius: 999, alignItems: 'center', justifyContent: 'center', padding: 8, gap: 2, borderWidth: 4, borderColor: 'rgba(255,255,255,0.75)', shadowColor: colors.bubblegumDeep, shadowOpacity: 0.22, shadowRadius: 6, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  levelShine: { position: 'absolute', top: 9, left: 14, width: 22, height: 12, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.55)', transform: [{ rotate: '-18deg' }] },
  levelOffset: { marginTop: 22 },
  levelNumber: { color: colors.ink, fontSize: 22, fontWeight: '900' },
  levelTitle: { color: colors.ink, fontSize: 11, fontWeight: '800', textAlign: 'center' },
  footerButtons: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  footerCandy: { textAlign: 'center', fontSize: 20, letterSpacing: 8, marginBottom: 16, opacity: 0.7 },
  loading: { color: colors.inkSoft, textAlign: 'center', fontSize: 18, marginTop: 80 },
});
