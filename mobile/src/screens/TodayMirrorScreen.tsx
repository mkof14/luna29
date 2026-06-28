import React from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LunaButton } from '../components/LunaButton';
import { MobileScreenHeader } from '../components/MobileScreenHeader';
import { SurfaceCard } from '../components/SurfaceCard';
import { ContextSignal } from '../types';
import { colors } from '../theme/tokens';
import { BaseMobileLang, MobileLang, resolveLangBase } from '../i18n/mobileCopy';

const copyByLang: Record<BaseMobileLang, Record<string, string>> = {
  en: {
    greeting: 'Good evening',
    subtitle: 'Today with Luna29',
    compare: 'How does today feel compared to yesterday?',
    speak: 'Speak to Luna29',
    quick: 'Quick check-in',
    today: 'Today',
    cycle: 'Cycle',
    energy: 'Energy',
    mood: 'Mood',
    sleep: 'Sleep',
  },
  ru: {
    greeting: 'Добрый вечер',
    subtitle: 'Сегодня с Luna29',
    compare: 'Как сегодня ощущается день по сравнению со вчера?',
    speak: 'Говорить с Luna29',
    quick: 'Быстрый check-in',
    today: 'Сегодня',
    cycle: 'Цикл',
    energy: 'Энергия',
    mood: 'Настроение',
    sleep: 'Сон',
  },
  es: {
    greeting: 'Buenas noches',
    subtitle: 'Hoy con Luna29',
    compare: 'Como se siente hoy comparado con ayer?',
    speak: 'Hablar con Luna29',
    quick: 'Check-in rapido',
    today: 'Hoy',
    cycle: 'Ciclo',
    energy: 'Energia',
    mood: 'Estado',
    sleep: 'Sueno',
  },
};

export function TodayMirrorScreen({
  userName,
  explanation,
  continuity,
  context,
  onSpeak,
  onQuickCheckIn,
  onBack,
  lang,
}: {
  userName: string;
  explanation: string;
  continuity: string;
  context: ContextSignal;
  onSpeak: () => void;
  onQuickCheckIn: () => void;
  onBack: () => void;
  lang: MobileLang;
}) {
  const copy = copyByLang[resolveLangBase(lang)];
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ImageBackground source={require('../../assets/bg-soft-2.webp')} imageStyle={styles.heroImage} style={styles.heroCard}>
        <View style={styles.heroOverlay}>
          <MobileScreenHeader title={`${copy.greeting}, ${userName}`} subtitle={copy.subtitle} onBack={onBack} tone="light" />
        </View>
      </ImageBackground>

      <SurfaceCard>
        <Text style={styles.text}>{explanation}</Text>
        <Text style={styles.textStrong}>{copy.compare}</Text>
        <Text style={styles.textMuted}>{continuity}</Text>
        <View style={styles.actionsRow}>
          <LunaButton onPress={onSpeak}>{copy.speak}</LunaButton>
          <LunaButton variant="secondary" onPress={onQuickCheckIn}>{copy.quick}</LunaButton>
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>{copy.today}</Text>
        <View style={styles.signalGrid}>
          <View style={styles.signalPill}><Text style={styles.signalLabel}>{copy.cycle}</Text><Text style={styles.signalValue}>{context.cycle}</Text></View>
          <View style={styles.signalPill}><Text style={styles.signalLabel}>{copy.energy}</Text><Text style={styles.signalValue}>{context.energy}</Text></View>
          <View style={styles.signalPill}><Text style={styles.signalLabel}>{copy.mood}</Text><Text style={styles.signalValue}>{context.mood}</Text></View>
          <View style={styles.signalPill}><Text style={styles.signalLabel}>{copy.sleep}</Text><Text style={styles.signalValue}>{context.sleep}</Text></View>
        </View>
      </SurfaceCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#4a3960',
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: '#665775',
  },
  textStrong: {
    fontSize: 15,
    lineHeight: 22,
    color: '#4e3d66',
    fontWeight: '700',
  },
  textMuted: {
    fontSize: 14,
    lineHeight: 21,
    color: '#8a769f',
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  signalGrid: {
    gap: 8,
  },
  signalPill: {
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(215,188,234,0.72)',
    backgroundColor: 'rgba(249, 238, 252, 0.92)',
  },
  signalLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
    color: colors.textMuted,
  },
  signalValue: {
    marginTop: 3,
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  heroCard: {
    minHeight: 144,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(198, 165, 223, 0.58)',
    overflow: 'hidden',
  },
  heroImage: {
    resizeMode: 'cover',
  },
  heroOverlay: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    backgroundColor: 'rgba(61, 41, 86, 0.21)',
  },
});
