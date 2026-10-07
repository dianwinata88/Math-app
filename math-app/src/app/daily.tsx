import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';

import { coinsForStars, starsFor } from '../core/engine';
import { buildDailyPlan } from '../core/adaptive';
import { getGrade } from '../core/curriculum';
import { useGame } from '../core/GameContext';
import { todayISO } from '../core/rewards';
import { BigButton, Screen } from '../ui/components';
import { colors } from '../ui/theme';
import { SessionRunner } from '../games/SessionRunner';

function seedFrom(value: string): number {
  return [...value].reduce((seed, char) => Math.imul(seed, 31) + char.charCodeAt(0), 7) >>> 0;
}

export default function DailyPracticeScreen() {
  const router = useRouter();
  const { profile, recordDailyDone } = useGame();
  const grade = profile?.gradeId ? getGrade(profile.gradeId) : null;
  const plan = useMemo(
    () => grade && profile ? buildDailyPlan(grade, profile.progress, 10, seedFrom(`${todayISO()}:${grade.id}`)) : null,
    [grade, profile],
  );

  if (!profile || !grade || !plan) {
    return (
      <Screen>
        <Text testID="daily-unavailable" style={styles.message}>Your practice plan is getting ready.</Text>
        <BigButton testID="daily-return-home" label="Back to map" onPress={() => router.replace('/home')} />
      </Screen>
    );
  }

  return (
    <Screen>
      <SessionRunner
        title="Daily Practice"
        questions={plan.questions.map((item) => item.question)}
        onExit={() => router.replace('/home')}
        onFinish={async (correct, total) => {
          const coins = coinsForStars(starsFor(correct, total), correct);
          await recordDailyDone(coins);
          router.replace('/home');
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  message: { color: colors.ink, fontSize: 22, fontWeight: '800', textAlign: 'center', margin: 30 },
});
