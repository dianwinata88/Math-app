import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { checkAnswer } from '../core/engine';
import { createRng, shuffle } from '../core/rng';
import type { Question } from '../core/types';
import { BigButton, Card, MascotBubble, NumberPad, Visual } from '../ui/components';
import { colors, radius } from '../ui/theme';

interface Props {
  question: Question;
  /** Called once per question with the verdict; parent advances. */
  onResult: (correct: boolean) => void;
}

function seedFrom(value: string): number {
  let seed = 7;
  for (const char of value) seed = (Math.imul(seed, 31) + char.charCodeAt(0)) >>> 0;
  return seed;
}

/**
 * Renders one question for any GameKind. Kinds that need interaction
 * (match-pairs, order-sequence) self-judge and report a single verdict.
 */
export function GameRenderer({ question, onResult }: Props) {
  switch (question.kind) {
    case 'multiple-choice':
    case 'count-tap':
      return <ChoiceGame question={question} onResult={onResult} />;
    case 'number-pad':
      return <NumberPadGame question={question} onResult={onResult} />;
    case 'true-false':
      return <TrueFalseGame question={question} onResult={onResult} />;
    case 'match-pairs':
      return <MatchPairsGame question={question} onResult={onResult} />;
    case 'order-sequence':
      return <OrderSequenceGame question={question} onResult={onResult} />;
  }
}

function Prompt({ question }: { question: Question }) {
  return (
    <Card style={styles.promptCard}>
      <Text testID="question-prompt" style={styles.prompt}>{question.prompt}</Text>
      {question.visual ? <Visual spec={question.visual} /> : null}
      {question.hint ? <Text style={styles.hint}>💡 {question.hint}</Text> : null}
    </Card>
  );
}

function ChoiceGame({ question, onResult }: Props) {
  const [picked, setPicked] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const options = question.options ?? [];
  return (
    <View style={styles.container}>
      <Prompt question={question} />
      <View style={styles.optionsGrid}>
        {options.map((opt) => {
          const isPicked = picked === opt.id;
          const isRight = locked && opt.id === question.answer;
          const isWrong = locked && isPicked && opt.id !== question.answer;
          return (
            <Pressable
              key={opt.id}
              testID={`answer-${opt.id}`}
              accessibilityRole="button"
              disabled={locked}
              onPress={() => {
                setPicked(opt.id);
                setLocked(true);
                const ok = checkAnswer(question, opt.id);
                setTimeout(() => onResult(ok), ok ? 500 : 900);
              }}
              style={[
                styles.option,
                isPicked && !locked && { borderColor: colors.bubblegum },
                isRight && { backgroundColor: colors.grass },
                isWrong && { backgroundColor: colors.coral },
              ]}>
              <Text testID={`answer-label-${opt.id}`} style={styles.optionText}>
                {opt.emoji ? `${opt.emoji} ` : ''}
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function NumberPadGame({ question, onResult }: Props) {
  const [value, setValue] = useState('');
  const [locked, setLocked] = useState(false);
  const submit = () => {
    if (locked || value === '') return;
    setLocked(true);
    const ok = checkAnswer(question, value);
    setTimeout(() => onResult(ok), ok ? 500 : 900);
  };
  return (
    <View style={styles.container}>
      <Prompt question={question} />
      <Card style={[styles.answerCard, locked && { borderColor: checkAnswer(question, value) ? colors.leaf : colors.coral, borderWidth: 4 }]}>
        <Text testID="number-pad-answer" style={styles.answerText}>{value === '' ? '?' : value}</Text>
      </Card>
      <NumberPad
        onKey={(k) => {
          if (locked) return;
          setValue((v) => (k === 'backspace' ? v.slice(0, -1) : (v + k).slice(0, 8)));
        }}
        onSubmit={submit}
      />
    </View>
  );
}

function TrueFalseGame({ question, onResult }: Props) {
  const options = useMemo(
    () => [
      { id: 'true', label: 'True', emoji: '✅' },
      { id: 'false', label: 'False', emoji: '❌' },
    ],
    [],
  );
  return <ChoiceGame question={{ ...question, options }} onResult={onResult} />;
}

function MatchPairsGame({ question, onResult }: Props) {
  const pairs = useMemo(() => question.pairs ?? [], [question.pairs]);
  const lefts = useMemo(() => pairs.map((p) => p.left), [pairs]);
  const rights = useMemo(
    () => shuffle(createRng(seedFrom(pairs.map((pair) => `${pair.left}:${pair.right}`).join('|'))), pairs.map((pair) => pair.right)),
    [pairs],
  );
  const [selLeft, setSelLeft] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState(0);
  const [flash, setFlash] = useState<string | null>(null);

  const tapRight = (right: string) => {
    if (!selLeft) return;
    const correct = pairs.find((p) => p.left === selLeft)?.right === right;
    if (correct) {
      const next = new Set(matched).add(selLeft);
      setMatched(next);
      setSelLeft(null);
      if (next.size === pairs.length) setTimeout(() => onResult(errors <= 1), 500);
    } else {
      setErrors((e) => e + 1);
      setFlash(right);
      setTimeout(() => setFlash(null), 400);
      setSelLeft(null);
    }
  };

  return (
    <View style={styles.container}>
      <Prompt question={question} />
      <MascotBubble text="Tap a card on the left, then its match on the right!" emoji="🐷" />
      <View style={styles.matchRow}>
        <View style={styles.matchCol}>
          {lefts.map((l) => (
            <Pressable
              key={l}
              testID={`match-left-${l}`}
              disabled={matched.has(l)}
              onPress={() => setSelLeft(l)}
              style={[styles.matchCard, matched.has(l) && styles.matched, selLeft === l && styles.selected]}>
              <Text style={styles.matchText}>{l}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.matchCol}>
          {rights.map((r) => {
            const ownerMatched = pairs.some((p) => p.right === r && matched.has(p.left));
            return (
              <Pressable
                key={r}
                testID={`match-right-${r}`}
                disabled={ownerMatched}
                onPress={() => tapRight(r)}
                style={[styles.matchCard, ownerMatched && styles.matched, flash === r && { backgroundColor: colors.coral }]}>
                <Text style={styles.matchText}>{r}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

function OrderSequenceGame({ question, onResult }: Props) {
  const sequence = useMemo(() => question.sequence ?? [], [question.sequence]);
  const shuffled = useMemo(() => shuffle(createRng(seedFrom(sequence.join('|'))), sequence), [sequence]);
  const [nextIdx, setNextIdx] = useState(0);
  const [wrong, setWrong] = useState<string | null>(null);
  const [errors, setErrors] = useState(0);

  const tap = (item: string) => {
    if (item === sequence[nextIdx]) {
      const done = nextIdx + 1;
      setNextIdx(done);
      if (done >= sequence.length) setTimeout(() => onResult(errors === 0), 500);
    } else {
      setErrors((e) => e + 1);
      setWrong(item);
      setTimeout(() => setWrong(null), 400);
    }
  };

  return (
    <View style={styles.container}>
      <Prompt question={question} />
      <MascotBubble text={`Tap them in order! (${nextIdx}/${sequence.length})`} emoji="🐭" />
      <View style={styles.seqWrap}>
        {shuffled.map((item) => {
          const used = sequence.indexOf(item) < nextIdx;
          return (
            <Pressable
              key={item}
              testID={`sequence-item-${item}`}
              disabled={used}
              onPress={() => tap(item)}
              style={[styles.seqItem, used && styles.matched, wrong === item && { backgroundColor: colors.coral }]}>
              <Text style={styles.seqText}>{item}</Text>
            </Pressable>
          );
        })}
      </View>
      {nextIdx >= sequence.length ? <BigButton testID="sequence-done" label="Done!" emoji="🍬" onPress={() => onResult(errors === 0)} color={colors.leaf} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 14, padding: 16 },
  promptCard: { gap: 14, alignItems: 'center' },
  prompt: { fontSize: 24, fontWeight: '800', color: colors.ink, textAlign: 'center' },
  hint: { fontSize: 14, color: colors.inkSoft },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  option: {
    minWidth: '44%',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 20,
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#F8D2E6',
    borderBottomWidth: 5,
    shadowColor: colors.bubblegumDeep,
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  optionText: { fontSize: 24, fontWeight: '800', color: colors.ink },
  answerCard: { alignSelf: 'center', minWidth: 140, alignItems: 'center', paddingVertical: 10, borderRadius: radius.pill },
  answerText: { fontSize: 40, fontWeight: '900', color: colors.bubblegumDeep },
  matchRow: { flexDirection: 'row', gap: 16, justifyContent: 'center' },
  matchCol: { gap: 10, flex: 1 },
  matchCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 16,
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#F8D2E6',
  },
  matched: { backgroundColor: colors.grass, opacity: 0.6 },
  selected: { borderColor: colors.bubblegum },
  matchText: { fontSize: 22, fontWeight: '800', color: colors.ink },
  seqWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  seqItem: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 4,
    borderColor: '#F8D2E6',
  },
  seqText: { fontSize: 26, fontWeight: '900', color: colors.ink },
});
