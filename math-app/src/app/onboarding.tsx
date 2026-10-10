import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useGame } from '../core/GameContext';
import { GRADES } from '../core/curriculum';
import type { GradeId } from '../core/types';
import { BigButton, Card, Screen } from '../ui/components';
import { colors, gradeColors, radius } from '../ui/theme';

const avatars = ['🦊', '🐼', '🦁', '🐸', '🐵', '🐨', '🐯', '🐰'];

export default function OnboardingScreen() {
  const router = useRouter();
  const { createProfile } = useGame();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(avatars[0]);
  const [gradeId, setGradeId] = useState<GradeId>('prek');

  const finish = async () => {
    await createProfile(name.trim(), avatar, gradeId);
    router.replace('/home');
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text testID="onboarding-title" style={styles.title}>Let’s start your quest!</Text>
        <Text testID="onboarding-step" style={styles.step}>Step {step} of 3</Text>
        {step === 1 ? (
          <View style={styles.panel}>
            <Text testID="name-prompt" style={styles.prompt}>What should we call you?</Text>
            <TextInput
              testID="child-name-input"
              accessibilityLabel="Your name"
              value={name}
              onChangeText={setName}
              placeholder="Type your name"
              maxLength={24}
              style={styles.input}
              returnKeyType="next"
              onSubmitEditing={() => name.trim() && setStep(2)}
            />
            <BigButton testID="name-continue" label="Next" emoji="➡️" disabled={!name.trim()} onPress={() => setStep(2)} />
          </View>
        ) : null}
        {step === 2 ? (
          <View style={styles.panel}>
            <Text testID="avatar-prompt" style={styles.prompt}>Pick your adventure buddy</Text>
            <View style={styles.grid}>
              {avatars.map((item) => (
                <Pressable
                  key={item}
                  testID={`avatar-${item}`}
                  accessibilityRole="button"
                  accessibilityLabel={`Choose ${item}`}
                  onPress={() => setAvatar(item)}
                  style={[styles.avatar, avatar === item && styles.avatarSelected]}>
                  <Text style={styles.avatarEmoji}>{item}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.actions}>
              <BigButton testID="avatar-back" label="Back" color={colors.inkSoft} onPress={() => setStep(1)} />
              <BigButton testID="avatar-continue" label="Next" emoji="➡️" onPress={() => setStep(3)} />
            </View>
          </View>
        ) : null}
        {step === 3 ? (
          <View style={styles.panel}>
            <Text testID="grade-prompt" style={styles.prompt}>Choose your grade</Text>
            <View style={styles.gradeGrid}>
              {GRADES.map((grade) => (
                <Pressable
                  key={grade.id}
                  testID={`onboarding-grade-${grade.id}`}
                  accessibilityRole="button"
                  onPress={() => setGradeId(grade.id)}
                  style={[styles.gradeCard, { borderColor: gradeColors[grade.id] }, gradeId === grade.id && { backgroundColor: `${gradeColors[grade.id]}1A` }]}>
                  <Text style={styles.gradeTitle}>{grade.title}</Text>
                  <Text style={styles.gradeAge}>Ages {grade.ages}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.actions}>
              <BigButton testID="grade-back" label="Back" color={colors.inkSoft} onPress={() => setStep(2)} />
              <BigButton testID="create-profile" label="Let’s go!" emoji="🚀" color={colors.leaf} onPress={finish} />
            </View>
          </View>
        ) : null}
        <Card style={styles.mascotCard}>
          <Text testID="onboarding-mascot" style={styles.mascot}>{avatar}</Text>
          <Text style={styles.mascotCopy}>Big adventures start with little steps!</Text>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, alignItems: 'center', padding: 20, gap: 14 },
  title: { color: colors.ink, fontSize: 28, fontWeight: '800', textAlign: 'center', letterSpacing: 0.2, marginTop: 18 },
  step: { color: colors.inkSoft, fontSize: 14, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
  panel: { width: '100%', maxWidth: 540, gap: 18, alignItems: 'center' },
  prompt: { color: colors.ink, fontSize: 21, fontWeight: '800', textAlign: 'center' },
  input: { width: '100%', padding: 14, backgroundColor: colors.card, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, fontSize: 20, color: colors.ink },
  grid: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  avatar: { width: 76, height: 76, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md },
  avatarSelected: { borderColor: colors.skyDeep, borderWidth: 2, backgroundColor: colors.sky },
  avatarEmoji: { fontSize: 40 },
  gradeGrid: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  gradeCard: { width: '30%', minWidth: 118, alignItems: 'center', backgroundColor: colors.card, borderWidth: 1.5, borderRadius: radius.md, paddingVertical: 14, paddingHorizontal: 8 },
  gradeTitle: { color: colors.ink, fontSize: 18, fontWeight: '800' },
  gradeAge: { color: colors.inkSoft, fontSize: 13, marginTop: 3 },
  actions: { flexDirection: 'row', gap: 12, alignItems: 'center', justifyContent: 'center' },
  mascotCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10 },
  mascot: { fontSize: 36 },
  mascotCopy: { color: colors.inkSoft, fontSize: 15, fontWeight: '600', flexShrink: 1 },
});
