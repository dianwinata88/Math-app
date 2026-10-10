import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { DimensionValue } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius } from './theme';
import type { VisualSpec } from '../core/types';

// Deterministic star scatter rendered behind every screen.
const STARS: { top: DimensionValue; left: DimensionValue; size: number; opacity: number; glyph: string; color: string }[] = [
  { top: '4%', left: '8%', size: 16, opacity: 0.9, glyph: '✦', color: colors.sky },
  { top: '9%', left: '72%', size: 10, opacity: 0.7, glyph: '✦', color: colors.ink },
  { top: '3%', left: '45%', size: 8, opacity: 0.5, glyph: '·', color: colors.ink },
  { top: '16%', left: '30%', size: 12, opacity: 0.8, glyph: '✦', color: colors.gold },
  { top: '14%', left: '88%', size: 18, opacity: 0.85, glyph: '✦', color: colors.grape },
  { top: '26%', left: '6%', size: 9, opacity: 0.55, glyph: '·', color: colors.sky },
  { top: '30%', left: '58%', size: 13, opacity: 0.75, glyph: '✦', color: colors.ink },
  { top: '38%', left: '92%', size: 8, opacity: 0.5, glyph: '·', color: colors.ink },
  { top: '44%', left: '18%', size: 15, opacity: 0.8, glyph: '✦', color: colors.sky },
  { top: '52%', left: '82%', size: 11, opacity: 0.65, glyph: '✦', color: colors.gold },
  { top: '58%', left: '38%', size: 8, opacity: 0.45, glyph: '·', color: colors.ink },
  { top: '64%', left: '10%', size: 12, opacity: 0.7, glyph: '✦', color: colors.grape },
  { top: '70%', left: '66%', size: 16, opacity: 0.85, glyph: '✦', color: colors.sky },
  { top: '78%', left: '28%', size: 9, opacity: 0.5, glyph: '·', color: colors.ink },
  { top: '84%', left: '52%', size: 14, opacity: 0.75, glyph: '✦', color: colors.gold },
  { top: '90%', left: '86%', size: 10, opacity: 0.6, glyph: '✦', color: colors.ink },
  { top: '22%', left: '48%', size: 7, opacity: 0.4, glyph: '·', color: colors.sky },
  { top: '48%', left: '70%', size: 9, opacity: 0.5, glyph: '·', color: colors.ink },
  { top: '73%', left: '4%', size: 11, opacity: 0.6, glyph: '✦', color: colors.ink },
  { top: '94%', left: '20%', size: 8, opacity: 0.45, glyph: '·', color: colors.gold },
];

function Starfield() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {STARS.map((star, i) => (
        <Text
          key={i}
          style={{
            position: 'absolute',
            top: star.top,
            left: star.left,
            fontSize: star.size,
            opacity: star.opacity,
            color: star.color,
          }}>
          {star.glyph}
        </Text>
      ))}
    </View>
  );
}

export function Screen({ children, bg = colors.cream }: { children: React.ReactNode; bg?: string }) {
  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: bg }]}>
      <Starfield />
      {children}
    </SafeAreaView>
  );
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
        {
          backgroundColor: disabled ? colors.locked : color,
          shadowColor: disabled ? '#000' : color,
        },
        pressed && !disabled && { transform: [{ scale: 0.96 }] },
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
      <View style={[styles.progressFill, { width: `${Math.min(100, Math.max(0, value * 100))}%`, backgroundColor: color, shadowColor: color }]} />
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
          style={({ pressed }) => [styles.padKey, pressed && { backgroundColor: colors.nebula, borderColor: colors.sky }]}>
          <Text style={styles.padKeyText}>{k}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export function MascotBubble({ text, emoji = '🤖' }: { text: string; emoji?: string }) {
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
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF40',
    shadowOpacity: 0.55,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  bigButtonText: { color: '#fff', fontSize: 20, fontWeight: '800', letterSpacing: 0.5 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: `${colors.glow}3D`,
    shadowColor: colors.glow,
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
  },
  progressTrack: { height: 12, borderRadius: 6, backgroundColor: colors.void, overflow: 'hidden', borderWidth: 1, borderColor: `${colors.glow}30` },
  progressFill: { height: '100%', borderRadius: 6, shadowOpacity: 0.8, shadowRadius: 6, shadowOffset: { width: 0, height: 0 } },
  visualText: { fontSize: 52, fontWeight: '900', color: colors.ink, textAlign: 'center' },
  visualRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  visualGroup: { backgroundColor: colors.nebula, borderRadius: radius.md, padding: 8, borderWidth: 1, borderColor: `${colors.glow}26` },
  visualEmoji: { fontSize: 34, textAlign: 'center', letterSpacing: 4 },
  pad: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, maxWidth: 360 },
  padKey: {
    width: '28%',
    aspectRatio: 1.6,
    backgroundColor: colors.nebula,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: `${colors.glow}45`,
    shadowColor: colors.glow,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },
  padKeyText: { fontSize: 28, fontWeight: '800', color: colors.sky },
  mascotRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingHorizontal: 8 },
  mascotEmoji: { fontSize: 44 },
  mascotBubble: {
    flex: 1,
    backgroundColor: colors.nebula,
    borderRadius: radius.md,
    padding: 12,
    borderWidth: 2,
    borderColor: `${colors.glow}66`,
  },
  mascotText: { fontSize: 17, color: colors.ink, fontWeight: '600' },
  pill: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: radius.pill },
  pillText: { fontSize: 13, fontWeight: '800' },
});
