import React from 'react';
import { ImageBackground, ScrollView, Share, StyleSheet, Text, View, Alert } from 'react-native';
import { LunaButton } from '../components/LunaButton';
import { MobileScreenHeader } from '../components/MobileScreenHeader';
import { SurfaceCard } from '../components/SurfaceCard';
import { ContextSignal } from '../types';
import { colors } from '../theme/tokens';

export function MyDayWithLunaScreen({
  context,
  onBack,
  onSpeak,
}: {
  context: ContextSignal;
  onBack: () => void;
  onSpeak: () => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ImageBackground source={require('../../assets/bg-soft-1.webp')} imageStyle={styles.heroImage} style={styles.heroCard}>
        <View style={styles.heroOverlay}>
          <MobileScreenHeader title="My Day with Luna29" subtitle="A calm personal note for today." onBack={onBack} tone="light" />
        </View>
      </ImageBackground>

      <SurfaceCard>
        <Text style={styles.mainText}>Today may feel a little slower.</Text>
        <Text style={styles.mainText}>Sleep was shorter last night, and your body is in the luteal phase.</Text>
        <Text style={styles.mainText}>It may help to keep the evening gentle.</Text>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Signals</Text>
        <View style={styles.signalWrap}>
          <View style={styles.signal}><Text style={styles.label}>Body</Text><Text style={styles.value}>{context.cycle}</Text></View>
          <View style={styles.signal}><Text style={styles.label}>Energy</Text><Text style={styles.value}>{context.energy}</Text></View>
          <View style={styles.signal}><Text style={styles.label}>Mood</Text><Text style={styles.value}>{context.mood}</Text></View>
          <View style={styles.signal}><Text style={styles.label}>Sleep</Text><Text style={styles.value}>{context.sleep}</Text></View>
        </View>
      </SurfaceCard>

      <SurfaceCard style={styles.noteCard}>
        <Text style={styles.note}>Nothing is wrong with today. Your body just asks for a little more rest.</Text>
        <View style={styles.actionsRow}>
          <LunaButton
            variant="secondary"
            onPress={() => {
              Alert.alert('Saved', 'My Day note saved to your Luna29 story.');
            }}
          >
            Save
          </LunaButton>
          <LunaButton
            variant="secondary"
            onPress={() => {
              void Share.share({
                title: 'My Day with Luna29',
                message: `My Day with Luna29\n\nBody: ${context.cycle}\nEnergy: ${context.energy}\nMood: ${context.mood}\nSleep: ${context.sleep}`,
              });
            }}
          >
            Share
          </LunaButton>
          <LunaButton onPress={onSpeak}>Speak to Luna29</LunaButton>
        </View>
      </SurfaceCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  mainText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  signalWrap: {
    gap: 8,
  },
  signal: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardStrong,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  label: {
    fontSize: 12,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    fontWeight: '700',
  },
  value: {
    marginTop: 3,
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  note: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  heroCard: {
    minHeight: 132,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  heroImage: {
    resizeMode: 'cover',
  },
  heroOverlay: {
    flex: 1,
    padding: 14,
    justifyContent: 'center',
    backgroundColor: 'rgba(58, 39, 82, 0.25)',
  },
  noteCard: {
    backgroundColor: 'rgba(245, 237, 253, 0.82)',
  },
});
