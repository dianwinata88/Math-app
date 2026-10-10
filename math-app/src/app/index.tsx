import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';

import { useGame } from '../core/GameContext';
import { Screen } from '../ui/components';
import { colors } from '../ui/theme';

export default function IndexScreen() {
  const router = useRouter();
  const { loading, profile } = useGame();

  useEffect(() => {
    if (!loading) {
      router.replace(profile?.gradeId ? '/home' : '/onboarding');
    }
  }, [loading, profile, router]);

  return (
    <Screen>
      <Text testID="loading-title" style={styles.title}>MathQuest</Text>
      <Text testID="loading-caption" style={styles.caption}>Getting your adventure ready…</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.skyDeep, fontSize: 36, fontWeight: '800', textAlign: 'center', letterSpacing: 0.4, marginTop: 100 },
  caption: { color: colors.inkSoft, fontSize: 16, textAlign: 'center', marginTop: 10 },
});
