import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';

import { coinsForStars, starsFor, startSession } from '../../core/engine';
import { findLevel } from '../../core/curriculum';
import { useGame } from '../../core/GameContext';
import { BigButton, Screen } from '../../ui/components';
import { colors } from '../../ui/theme';
import { SessionRunner } from '../../games/SessionRunner';

export default function PlayLevelScreen() {
  const { levelId } = useLocalSearchParams<{ levelId: string }>();
  const router = useRouter();
  const { recordLevelResult } = useGame();
  const found = findLevel(Array.isArray(levelId) ? levelId[0] : levelId);
  const session = useMemo(() => found ? startSession(found.level) : null, [found]);

  if (!found || !session) {
    return (
      <Screen>
        <Text testID="level-not-found" style={styles.message}>We couldn’t find that level.</Text>
        <BigButton testID="return-home" label="Back to map" onPress={() => router.replace('/home')} />
      </Screen>
    );
  }

  return (
    <Screen>
      <SessionRunner
        title={found.level.title}
        questions={session.questions}
        onExit={() => router.replace('/home')}
        onFinish={async (correct, total, xp) => {
          const stars = starsFor(correct, total);
          await recordLevelResult(found.level.id, correct, total, stars, xp, coinsForStars(stars, correct));
          router.replace('/home');
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  message: { color: colors.ink, fontSize: 24, fontWeight: '800', textAlign: 'center', margin: 30 },
});
