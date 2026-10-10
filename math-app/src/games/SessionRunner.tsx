import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { starsFor, xpEarned } from '../core/engine';
import type { Question } from '../core/types';
import { BigButton, Card, ProgressBar, StarRow, Visual } from '../ui/components';
import { colors } from '../ui/theme';
import { GameRenderer } from './GameRenderer';

interface Props {
  title: string;
  questions: Question[];
  onExit: () => void;
  onFinish: (correct: number, total: number, xp: number) => void;
}

/** Runs a list of questions end-to-end with progress, then a results screen. */
export function SessionRunner({ title, questions, onExit, onFinish }: Props) {
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const done = index >= questions.length;
  const correct = results.filter(Boolean).length;
  const xp = useMemo(() => xpEarned(questions, results), [questions, results]);

  if (done) {
    return (
      <View style={styles.results}>
        <Text testID="session-results-title" style={styles.resultsTitle}>{correct === questions.length ? '🎉 Amazing!' : correct >= questions.length / 2 ? '💪 Good job!' : '🌱 Keep growing!'}</Text>
        <StarRow stars={starsFor(correct, questions.length)} size={44} />
        <Text testID="session-results-score" style={styles.resultsScore}>
          {correct} / {questions.length} correct
        </Text>
        <Text testID="session-results-xp" style={styles.resultsXp}>+{xp} XP</Text>
        <BigButton testID="collect-rewards" label="Collect rewards" color={colors.bubblegum} emoji="🍬" onPress={() => onFinish(correct, questions.length, xp)} />
      </View>
    );
  }

  const q = questions[index];
  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <Text testID="session-exit" accessibilityRole="button" style={styles.exit} onPress={onExit}>✕</Text>
        <View style={{ flex: 1 }}>
          <ProgressBar value={index / questions.length} color={colors.bubblegum} />
        </View>
        <Text testID="session-question-counter" style={styles.counter}>
          {index + 1}/{questions.length}
        </Text>
      </View>
      <Text testID="session-title" style={styles.title}>{title}</Text>
      {feedback === 'correct' ? <Text testID="session-feedback-correct" style={styles.fbGood}>✅ Correct!</Text> : null}
      {feedback === 'wrong' ? (
        <Card style={styles.fbCard}>
          <Text testID="session-feedback-wrong" style={styles.fbWrong}>Not quite — the answer was {q.answer}</Text>
          {q.visual ? <Visual spec={q.visual} /> : null}
        </Card>
      ) : null}
      <GameRenderer
        key={index}
        question={q}
        onResult={(ok) => {
          setFeedback(ok ? 'correct' : 'wrong');
          setResults((r) => [...r, ok]);
          setTimeout(() => {
            setFeedback(null);
            setIndex((i) => i + 1);
          }, 700);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 8 },
  exit: { fontSize: 24, color: colors.inkSoft, padding: 4 },
  counter: { fontSize: 16, fontWeight: '800', color: colors.bubblegumDeep },
  title: { fontSize: 18, fontWeight: '700', color: colors.inkSoft, textAlign: 'center', marginTop: 4 },
  fbGood: { fontSize: 20, fontWeight: '800', color: colors.leaf, textAlign: 'center' },
  fbCard: { marginHorizontal: 16, alignItems: 'center', gap: 6 },
  fbWrong: { fontSize: 16, fontWeight: '700', color: colors.coral },
  results: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18, padding: 24 },
  resultsTitle: { fontSize: 34, fontWeight: '900', color: colors.bubblegumDeep },
  resultsScore: { fontSize: 22, fontWeight: '800', color: colors.ink },
  resultsXp: { fontSize: 18, fontWeight: '800', color: colors.gold },
});
