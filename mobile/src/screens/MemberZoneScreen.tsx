import React, { useMemo } from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LunaButton } from '../components/LunaButton';
import { MobileScreenHeader } from '../components/MobileScreenHeader';
import { SurfaceCard } from '../components/SurfaceCard';
import { colors } from '../theme/tokens';
import { BaseMobileLang, MobileLang, resolveLangBase } from '../i18n/mobileCopy';

const copyByLang: Record<BaseMobileLang, Record<string, string>> = {
  en: {
    title: 'Member Zone',
    subtitle: 'All member pages in one place.',
    todayFocus: 'Today focus',
    speak: 'Speak to Luna29',
    quick: 'Quick check-in',
    todayMirror: 'Today Mirror',
    myDay: 'My Day with Luna29',
    progress: 'Progress snapshot',
    weeklyCheckins: 'Weekly check-ins',
    voiceNotes: 'Voice notes',
    patterns: 'Patterns detected',
    reports: 'Reports saved',
    nav: 'Navigation',
    today: 'Today',
    story: 'Your Story',
    rhythm: 'Rhythm',
    month: 'Your month with Luna29',
    healthReports: 'Health Reports',
    unlock: 'Unlock deeper insights',
    services: 'All Services',
  },
  ru: {
    title: 'Мембер Зона',
    subtitle: 'Все страницы участника в одном месте.',
    todayFocus: 'Фокус на сегодня',
    speak: 'Говорить с Luna29',
    quick: 'Быстрый check-in',
    todayMirror: 'Today Mirror',
    myDay: 'Мой день с Luna29',
    progress: 'Снимок прогресса',
    weeklyCheckins: 'Check-ins за неделю',
    voiceNotes: 'Голосовые заметки',
    patterns: 'Найдено паттернов',
    reports: 'Сохранено отчетов',
    nav: 'Навигация',
    today: 'Сегодня',
    story: 'Ваша история',
    rhythm: 'Ритм',
    month: 'Ваш месяц с Luna29',
    healthReports: 'Health Reports',
    unlock: 'Открыть глубокие инсайты',
    services: 'Все сервисы',
  },
  es: {
    title: 'Zona miembro',
    subtitle: 'Todas las paginas de miembro en un solo lugar.',
    todayFocus: 'Enfoque de hoy',
    speak: 'Hablar con Luna29',
    quick: 'Check-in rapido',
    todayMirror: 'Today Mirror',
    myDay: 'Mi dia con Luna29',
    progress: 'Resumen de progreso',
    weeklyCheckins: 'Check-ins semanales',
    voiceNotes: 'Notas de voz',
    patterns: 'Patrones detectados',
    reports: 'Reportes guardados',
    nav: 'Navegacion',
    today: 'Hoy',
    story: 'Tu historia',
    rhythm: 'Ritmo',
    month: 'Tu mes con Luna29',
    healthReports: 'Health Reports',
    unlock: 'Desbloquear insights profundos',
    services: 'Todos los servicios',
  },
};

export function MemberZoneScreen({
  onBack,
  onOpenToday,
  onOpenStory,
  onOpenRhythm,
  onOpenVoice,
  onOpenQuickCheckIn,
  onOpenTodayMirror,
  onOpenMyDay,
  onOpenMonthly,
  onOpenPaywall,
  onOpenHealthReports,
  onOpenServices,
  lang,
}: {
  onBack: () => void;
  onOpenToday: () => void;
  onOpenStory: () => void;
  onOpenRhythm: () => void;
  onOpenVoice: () => void;
  onOpenQuickCheckIn: () => void;
  onOpenTodayMirror: () => void;
  onOpenMyDay: () => void;
  onOpenMonthly: () => void;
  onOpenPaywall: () => void;
  onOpenHealthReports: () => void;
  onOpenServices: () => void;
  lang: MobileLang;
}) {
  const copy = copyByLang[resolveLangBase(lang)];
  const metrics = useMemo(
    () => [
      { label: copy.weeklyCheckins, value: '5' },
      { label: copy.voiceNotes, value: '8' },
      { label: copy.patterns, value: '2' },
      { label: copy.reports, value: '3' },
    ],
    [copy.patterns, copy.reports, copy.voiceNotes, copy.weeklyCheckins],
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ImageBackground source={require('../../assets/bg-soft-2.webp')} imageStyle={styles.heroImage} style={styles.heroCard}>
        <View style={styles.heroOverlay}>
          <MobileScreenHeader title={copy.title} subtitle={copy.subtitle} onBack={onBack} tone="light" />
        </View>
      </ImageBackground>

      <SurfaceCard style={styles.cardA}>
        <Text style={styles.cardTitle}>{copy.todayFocus}</Text>
        <View style={styles.stack}>
          <LunaButton onPress={onOpenVoice}>{copy.speak}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenQuickCheckIn}>{copy.quick}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenTodayMirror}>{copy.todayMirror}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenMyDay}>{copy.myDay}</LunaButton>
        </View>
      </SurfaceCard>

      <SurfaceCard style={styles.cardB}>
        <Text style={styles.cardTitle}>{copy.progress}</Text>
        <View style={styles.metricsGrid}>
          {metrics.map((item) => (
            <View key={item.label} style={styles.metricBox}>
              <Text style={styles.metricValue}>{item.value}</Text>
              <Text style={styles.metricLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </SurfaceCard>

      <SurfaceCard style={styles.cardC}>
        <Text style={styles.cardTitle}>{copy.nav}</Text>
        <View style={styles.stack}>
          <LunaButton variant="secondary" onPress={onOpenToday}>{copy.today}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenStory}>{copy.story}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenRhythm}>{copy.rhythm}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenMonthly}>{copy.month}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenHealthReports}>{copy.healthReports}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenPaywall}>{copy.unlock}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenServices}>{copy.services}</LunaButton>
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
  heroCard: {
    minHeight: 128,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroImage: { resizeMode: 'cover' },
  heroOverlay: {
    flex: 1,
    padding: 14,
    justifyContent: 'center',
    backgroundColor: 'rgba(59, 39, 84, 0.26)',
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  stack: { gap: 8 },
  metricsGrid: { gap: 8 },
  metricBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardStrong,
    paddingHorizontal: 10,
    paddingVertical: 9,
    gap: 1,
  },
  metricValue: { fontSize: 20, color: colors.textPrimary, fontWeight: '800' },
  metricLabel: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  cardA: { backgroundColor: 'rgba(255, 249, 255, 0.86)' },
  cardB: { backgroundColor: 'rgba(245, 237, 253, 0.84)' },
  cardC: { backgroundColor: 'rgba(255, 251, 255, 0.82)' },
});
