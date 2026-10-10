import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { allLevels, gradeStars, GRADES } from '../core/curriculum';
import { useGame } from '../core/GameContext';
import { BigButton, Card, Screen } from '../ui/components';
import { colors, gradeColors, radius } from '../ui/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, setGrade, resetAll } = useGame();
  const [confirmReset, setConfirmReset] = useState(false);

  if (!profile) {
    return <Screen><Text testID="profile-loading" style={styles.title}>Loading parent area…</Text></Screen>;
  }

  const reset = async () => {
    await resetAll();
    router.replace('/onboarding');
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <BigButton testID="profile-back" label="Back to map" emoji="🗺️" onPress={() => router.replace('/home')} />
        <Text testID="profile-title" style={styles.title}>Parent Area ⚙️</Text>
        <Card style={styles.playerCard}>
          <Text style={styles.avatar}>{profile.avatar}</Text>
          <View>
            <Text testID="profile-name" style={styles.playerName}>{profile.name}</Text>
            <Text style={styles.playerCaption}>Choose the current learning grade</Text>
          </View>
        </Card>
        <Text testID="grade-progress-heading" style={styles.heading}>Grade progress</Text>
        {GRADES.map((grade) => {
          const earned = gradeStars(grade, profile.progress);
          const max = allLevels(grade).length * 3;
          const active = profile.gradeId === grade.id;
          return (
            <Pressable
              key={grade.id}
              testID={`profile-grade-${grade.id}`}
              accessibilityRole="button"
              accessibilityLabel={`${grade.title}, ${earned} of ${max} stars${active ? ', selected' : ''}`}
              onPress={() => setGrade(grade.id)}
              style={[styles.gradeRow, { borderColor: gradeColors[grade.id] }, active && styles.selected]}>
              <View style={styles.gradeInfo}>
                <Text style={styles.gradeName}>{grade.title}</Text>
                <Text style={styles.gradeAge}>Ages {grade.ages}</Text>
              </View>
              <Text testID={`profile-stars-${grade.id}`} style={styles.stars}>⭐ {earned} / {max}</Text>
              {active ? <Text style={styles.current}>Current</Text> : null}
            </Pressable>
          );
        })}
        <BigButton testID="reset-progress" label="Reset all progress" emoji="🧹" color={colors.coral} onPress={() => setConfirmReset(true)} />
        {confirmReset ? (
          <View style={styles.confirmOverlay}>
            <Card style={styles.confirmCard}>
              <Text testID="reset-confirm-title" style={styles.confirmTitle}>Reset MathQuest?</Text>
              <Text style={styles.confirmCopy}>This will erase your profile, stars, coins, and stickers.</Text>
              <View style={styles.confirmActions}>
                <BigButton testID="reset-cancel" label="Keep playing" color={colors.inkSoft} onPress={() => setConfirmReset(false)} />
                <BigButton testID="reset-confirm" label="Reset" color={colors.coral} onPress={reset} />
              </View>
            </Card>
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { alignSelf: 'center', width: '100%', maxWidth: 660, padding: 18, gap: 14, alignItems: 'center' },
  title: { color: colors.bubblegumDeep, fontSize: 29, textAlign: 'center', fontWeight: '900' },
  playerCard: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { fontSize: 44 },
  playerName: { color: colors.ink, fontSize: 21, fontWeight: '900' },
  playerCaption: { color: colors.inkSoft, fontSize: 14 },
  heading: { color: colors.ink, alignSelf: 'flex-start', fontSize: 20, fontWeight: '900', marginTop: 4 },
  gradeRow: { width: '100%', minHeight: 72, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderWidth: 3, borderRadius: radius.md, backgroundColor: colors.card, gap: 8 },
  selected: { backgroundColor: '#FFE9F3' },
  gradeInfo: { flex: 1 },
  gradeName: { color: colors.ink, fontSize: 18, fontWeight: '900' },
  gradeAge: { color: colors.inkSoft, fontSize: 13, marginTop: 2 },
  stars: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  current: { color: colors.bubblegumDeep, fontSize: 12, fontWeight: '900' },
  confirmOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0008', padding: 20 },
  confirmCard: { width: '100%', maxWidth: 440, alignItems: 'center', gap: 14 },
  confirmTitle: { color: colors.ink, fontSize: 23, fontWeight: '900' },
  confirmCopy: { color: colors.inkSoft, fontSize: 15, textAlign: 'center' },
  confirmActions: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'center' },
});
