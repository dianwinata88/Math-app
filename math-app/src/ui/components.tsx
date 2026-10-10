import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius } from './theme';
import type { VisualSpec } from '../core/types';

export function Screen({ children, bg = colors.cream }: { children: React.ReactNode; bg?: string }) {
  return <SafeAreaView style={[styles.screen, { backgroundColor: bg }]}>{children}</SafeAreaView>;
}

export function BigButton({
  label,
  onPress,
  color = colors.skyDeep,
  disabled,
  emoji,
  testID,
}: {
  label: string;
  onPress: () => void;
  color?: string;
  disabled?: boolean;
  emoji?: string;
  testID?: string;
}) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.bigButton,
        { backgroundColor: disabled ? colors.locked : color },
        pressed && !disabled && { opacity: 0.88 },
      ]}>
      <Text style={styles.bigButtonText}>
        {emoji ? `${emoji} ` : ''}
        {label}
      </Text>
    </Pressable>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function ProgressBar({ value, color = colors.leaf }: { value: number; color?: string }) {
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${Math.min(100, Math.max(0, value * 100))}%`, backgroundColor: color }]} />
    </View>
  );
}

export function StarRow({ stars, size = 22 }: { stars: number; size?: number }) {
  return (
    <Text style={{ fontSize: size, letterSpacing: 2, color: colors.gold }}>
      {'★'.repeat(stars)}
      <Text style={{ color: colors.locked }}>{'★'.repeat(Math.max(0, 3 - stars))}</Text>
    </Text>
  );
}

/** Renders a VisualSpec: emoji groups, big text, or an item row. */
export function Visual({ spec }: { spec: VisualSpec }) {
  if (spec.text) return <Text style={styles.visualText}>{spec.text}</Text>;
  if (spec.groups) {
    return (
      <View style={styles.visualRow}>
        {spec.groups.map((n, i) => (
          <View key={i} style={styles.visualGroup}>
            <Text style={styles.visualEmoji}>{(spec.emoji ?? '🍎').repeat(n)}</Text>
          </View>
        ))}
      </View>
    );
  }
  if (spec.items) {
    return <Text style={styles.visualEmoji}>{spec.items.join('  ')}</Text>;
  }
  if (spec.count != null) {
    return <Text style={styles.visualEmoji}>{(spec.emoji ?? '🍎').repeat(spec.count)}</Text>;
  }
  return null;
}

export function NumberPad({ onKey, onSubmit }: { onKey: (digit: string) => void; onSubmit: () => void }) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', '⏎'];
  return (
    <View style={styles.pad}>
      {keys.map((k) => (
        <Pressable
          key={k}
          testID={`number-pad-${k === '⌫' ? 'delete' : k === '⏎' ? 'submit' : k}`}
          accessibilityRole="button"
          accessibilityLabel={k === '⏎' ? 'Submit' : k === '⌫' ? 'Delete' : `Digit ${k}`}
          onPress={() => (k === '⌫' ? onKey('backspace') : k === '⏎' ? onSubmit() : onKey(k))}
          style={({ pressed }) => [styles.padKey, pressed && { backgroundColor: colors.sky }]}>
          <Text style={styles.padKeyText}>{k}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export function MascotBubble({ text, emoji = '🦉' }: { text: string; emoji?: string }) {
  return (
    <View style={styles.mascotRow}>
      <Text style={styles.mascotEmoji}>{emoji}</Text>
      <View style={styles.mascotBubble}>
        <Text style={styles.mascotText}>{text}</Text>
      </View>
    </View>
  );
}

export function Pill({ label, color = colors.skyDeep, textColor = '#fff' }: { label: string; color?: string; textColor?: string }) {
  return (
    <View style={[styles.pill, { backgroundColor: color }]}>
      <Text style={[styles.pillText, { color: textColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  bigButton: {
    paddingVertical: 15,
    paddingHorizontal: 26,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigButtonText: { color: '#fff', fontSize: 19, fontWeight: '700', letterSpacing: 0.3 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: colors.border, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  visualText: { fontSize: 48, fontWeight: '800', color: colors.ink, textAlign: 'center' },
  visualRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  visualGroup: { backgroundColor: colors.paper, borderRadius: radius.sm, padding: 8, borderWidth: 1, borderColor: colors.border },
  visualEmoji: { fontSize: 34, textAlign: 'center', letterSpacing: 4 },
  pad: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, maxWidth: 360 },
  padKey: {
    width: '28%',
    aspectRatio: 1.6,
    backgroundColor: colors.card,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  padKeyText: { fontSize: 26, fontWeight: '700', color: colors.ink },
  mascotRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingHorizontal: 8 },
  mascotEmoji: { fontSize: 38 },
  mascotBubble: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mascotText: { fontSize: 16, color: colors.ink, fontWeight: '600' },
  pill: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: radius.pill },
  pillText: { fontSize: 13, fontWeight: '700' },
});
