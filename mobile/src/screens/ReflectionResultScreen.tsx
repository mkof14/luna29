import React from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LunaButton } from '../components/LunaButton';
import { MobileScreenHeader } from '../components/MobileScreenHeader';
import { SurfaceCard } from '../components/SurfaceCard';
import { colors } from '../theme/tokens';
import { ContextSignal, ReflectionPayload } from '../types';
import { BaseMobileLang, MobileLang, resolveLangBase } from '../i18n/mobileCopy';

const copyByLang: Record<BaseMobileLang, Record<string, string>> = {
  en: {
    greeting: 'Good evening',
    subline: 'Here is your reflection.',
    suggestion: 'A small suggestion for tonight',
    today: 'Today',
    cycle: 'Cycle',
    energy: 'Energy',
    mood: 'Mood',
    sleep: 'Sleep',
    patternTitle: 'Something Luna29 is starting to notice',
    noPattern: 'Luna29 is still learning about you. The more you reflect, the clearer your rhythm becomes.',
    recent: 'Recent thread',
    empty: 'Your story with Luna29 is just beginning.',
    seeRhythm: 'See your rhythm',
    save: 'Save reflection',
    share: 'Share reflection',
  },
  ru: {
    greeting: 'Добрый вечер',
    subline: 'Вот ваше отражение дня.',
    suggestion: 'Небольшая рекомендация на вечер',
    today: 'Сегодня',
    cycle: 'Цикл',
    energy: 'Энергия',
    mood: 'Настроение',
    sleep: 'Сон',
    patternTitle: 'Что Luna29 начинает замечать',
    noPattern: 'Luna29 все еще изучает ваш ритм. Чем чаще вы отражаете день, тем яснее становится картина.',
    recent: 'Недавняя нить',
    empty: 'Ваша история с Luna29 только начинается.',
    seeRhythm: 'Смотреть ритм',
    save: 'Сохранить',
    share: 'Поделиться',
  },
  es: {
    greeting: 'Buenas noches',
    subline: 'Aqui esta tu reflexion.',
    suggestion: 'Una pequena sugerencia para esta noche',
    today: 'Hoy',
    cycle: 'Ciclo',
    energy: 'Energia',
    mood: 'Estado',
    sleep: 'Sueno',
    patternTitle: 'Algo que Luna29 empieza a notar',
    noPattern: 'Luna29 aun esta aprendiendo sobre ti. Cuanto mas reflexionas, mas claro se vuelve tu ritmo.',
    recent: 'Hilo reciente',
    empty: 'Tu historia con Luna29 recien comienza.',
    seeRhythm: 'Ver tu ritmo',
    save: 'Guardar',
    share: 'Compartir',
  },
};

export function ReflectionResultScreen({
  userName,
  reflection,
  context,
  recentEntries,
  onSeeRhythm,
  onSave,
  onShare,
  onBackToday,
  hasPattern = true,
  lang,
}: {
  userName: string;
  reflection: ReflectionPayload;
  context: ContextSignal;
  recentEntries: Array<{ id: string; label: string; text: string }>;
  onSeeRhythm: () => void;
  onSave: () => void;
  onShare: () => void;
  onBackToday: () => void;
  hasPattern?: boolean;
  lang: MobileLang;
}) {
  const copy = copyByLang[resolveLangBase(lang)];
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ImageBackground source={require('../../assets/bg-soft-2.webp')} imageStyle={styles.headerImage} style={styles.headerCard}>
        <View style={styles.headerTint}>
          <View style={styles.headerWrap}>
            <MobileScreenHeader title={`${copy.greeting}, ${userName}`} subtitle={copy.subline} onBack={onBackToday} tone="light" />
            <Text style={styles.continuity}>{reflection.continuity}</Text>
          </View>
        </View>
      </ImageBackground>

      <SurfaceCard style={styles.primaryCard}>
        {reflection.shortSummary.map((line) => (
          <Text key={line} style={styles.text}>{line}</Text>
        ))}
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.cardTitle}>{copy.suggestion}</Text>
        {reflection.suggestion.map((line) => (
          <Text key={line} style={styles.text}>{line}</Text>
        ))}
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.cardTitle}>{copy.today}</Text>
        <Text style={styles.text}>{copy.cycle}: {context.cycle}</Text>
        <Text style={styles.text}>{copy.energy}: {context.energy}</Text>
        <Text style={styles.text}>{copy.mood}: {context.mood}</Text>
        <Text style={styles.text}>{copy.sleep}: {context.sleep}</Text>
      </SurfaceCard>

      <SurfaceCard style={styles.patternCard}>
        <Text style={styles.cardTitle}>{copy.patternTitle}</Text>
        <Text style={styles.text}>
          {hasPattern
            ? reflection.pattern
            : copy.noPattern}
        </Text>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.cardTitle}>{copy.recent}</Text>
        {recentEntries.length === 0 ? (
          <Text style={styles.text}>{copy.empty}</Text>
        ) : (
          recentEntries.slice(0, 4).map((entry) => (
            <View key={entry.id} style={styles.timelineItem}>
              <Text style={styles.timelineLabel}>{entry.label}</Text>
              <Text style={styles.text}>{entry.text}</Text>
            </View>
          ))
        )}
      </SurfaceCard>

      <View style={styles.actionsRow}>
        <LunaButton variant="secondary" onPress={onSeeRhythm}>{copy.seeRhythm}</LunaButton>
        <LunaButton variant="secondary" onPress={onSave}>{copy.save}</LunaButton>
        <LunaButton variant="secondary" onPress={onShare}>{copy.share}</LunaButton>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 14,
  },
  headerWrap: {
    gap: 4,
  },
  headerCard: {
    minHeight: 146,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(198, 165, 223, 0.58)',
    overflow: 'hidden',
  },
  headerImage: {
    resizeMode: 'cover',
  },
  headerTint: {
    flex: 1,
    padding: 16,
    backgroundColor: 'rgba(68, 44, 94, 0.22)',
  },
  greeting: {
    display: 'none',
  },
  subline: {
    display: 'none',
  },
  continuity: {
    fontSize: 14,
    lineHeight: 21,
    color: '#f6ebfc',
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 18,
    color: '#4a3960',
    fontWeight: '800',
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    color: '#665775',
  },
  actionsRow: {
    gap: 8,
  },
  primaryCard: {
    backgroundColor: 'rgba(255, 245, 251, 0.94)',
    borderColor: 'rgba(209,183,227,0.68)',
  },
  patternCard: {
    backgroundColor: 'rgba(245, 236, 253, 0.86)',
    borderColor: 'rgba(209,183,227,0.68)',
  },
  timelineItem: {
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(220,196,235,0.78)',
  },
  timelineLabel: {
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.accentStrong,
    fontWeight: '700',
    marginBottom: 4,
  },
});
