import React from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LanguageSelector } from '../components/LanguageSelector';
import { LunaButton } from '../components/LunaButton';
import { SurfaceCard } from '../components/SurfaceCard';
import { colors } from '../theme/tokens';
import { getMobileCopy, MobileLang, resolveLangBase } from '../i18n/mobileCopy';

export function PublicHomeScreen({
  onOpenAuth,
  onOpenAboutFlow,
  onOpenApp,
  onOpenMenu,
  onOpenFooter,
  onOpenSupport,
  onOpenLegal,
  lang,
  setLang,
  themeMode,
  onToggleTheme,
  loading = false,
}: {
  onOpenAuth: () => void;
  onOpenAboutFlow: () => void;
  onOpenApp: () => void;
  onOpenMenu?: () => void;
  onOpenFooter?: () => void;
  onOpenSupport?: () => void;
  onOpenLegal?: () => void;
  lang: MobileLang;
  setLang: (lang: MobileLang) => void;
  themeMode: 'light' | 'dark';
  onToggleTheme: () => void;
  loading?: boolean;
}) {
  const copy = getMobileCopy(lang);
  const baseLang = resolveLangBase(lang);
  const localized = {
    loading: baseLang === 'ru' ? 'Загрузка...' : baseLang === 'es' ? 'Cargando...' : 'Loading...',
    hint: baseLang === 'ru' ? 'Приватно. Спокойно. Лично.' : baseLang === 'es' ? 'Privado. Calmo. Personal.' : 'Private. Calm. Personal.',
    ritual: baseLang === 'ru' ? 'Небольшой ежедневный ритуал' : baseLang === 'es' ? 'Un pequeno ritual diario' : 'A small daily ritual',
    body: 'Your Body',
    bodyText: baseLang === 'ru' ? 'Ритмы и мягкий контекст.' : baseLang === 'es' ? 'Ritmos y contexto suave.' : 'Rhythms and gentle context.',
    senses: 'Your Senses',
    sensesText: baseLang === 'ru' ? 'Как вы ощущали день.' : baseLang === 'es' ? 'Como se sintio tu dia.' : 'How the day felt to you.',
    words: 'Your Words',
    wordsText: baseLang === 'ru' ? 'Голосовые заметки и отражения.' : baseLang === 'es' ? 'Notas de voz y reflexiones.' : 'Voice notes and reflections.',
    menu: baseLang === 'ru' ? 'Меню' : baseLang === 'es' ? 'Menu' : 'Menu',
    support: baseLang === 'ru' ? 'Поддержка' : baseLang === 'es' ? 'Soporte' : 'Support',
    signin: baseLang === 'ru' ? 'Вход / Админ' : baseLang === 'es' ? 'Entrar / Admin' : 'Sign in / Admin',
    oneMinute: baseLang === 'ru' ? 'Что можно сделать за одну минуту' : baseLang === 'es' ? 'Que puedes hacer en un minuto' : 'What you can do in one minute',
    s1: baseLang === 'ru' ? '1. Поговорить с Luna29' : baseLang === 'es' ? '1. Hablar con Luna29' : '1. Speak to Luna29',
    s2: baseLang === 'ru' ? '2. Сделать быстрый check-in' : baseLang === 'es' ? '2. Hacer un check-in rapido' : '2. Make a quick check-in',
    s3: baseLang === 'ru' ? '3. Получить мягкий отклик' : baseLang === 'es' ? '3. Recibir una reflexion suave' : '3. Receive a gentle reflection',
    pattern: baseLang === 'ru' ? 'Превью паттерна' : baseLang === 'es' ? 'Vista de patron' : 'Pattern preview',
    p1: baseLang === 'ru' ? 'Энергия может быть ниже, если сон короче.' : baseLang === 'es' ? 'La energia puede sentirse mas baja cuando duermes menos.' : 'Energy can feel lower when sleep is shorter.',
    p2: baseLang === 'ru' ? 'Luna29 помогает замечать это заранее и быть мягче к себе.' : baseLang === 'es' ? 'Luna29 te ayuda a notarlo antes y a tratar tu dia con mas suavidad.' : 'Luna29 helps you notice this early and stay gentle with your day.',
    footer: baseLang === 'ru' ? 'Футер' : baseLang === 'es' ? 'Footer' : 'Footer',
    supportFaq: baseLang === 'ru' ? 'Поддержка и FAQ' : baseLang === 'es' ? 'Soporte y FAQ' : 'Support & FAQ',
    legalPrivacy: baseLang === 'ru' ? 'Legal и Privacy' : baseLang === 'es' ? 'Legal y Privacy' : 'Legal & Privacy',
    openNow: baseLang === 'ru' ? 'Открыть апп сейчас' : baseLang === 'es' ? 'Abrir app ahora' : 'Open app now',
    includes: baseLang === 'ru' ? 'Что включает Luna29' : baseLang === 'es' ? 'Que incluye Luna29' : 'What Luna29 includes',
    startReflection: baseLang === 'ru' ? 'Начать заметку' : baseLang === 'es' ? 'Iniciar reflexion' : 'Start Reflection',
    startReflectionText: baseLang === 'ru' ? 'Говорите с Luna29 своими словами.' : baseLang === 'es' ? 'Habla con Luna29 con tus propias palabras.' : 'Speak with Luna29 in your own words.',
    checkin: 'Check-in',
    checkinText: baseLang === 'ru' ? 'Быстрый снимок настроения и энергии.' : baseLang === 'es' ? 'Resumen rapido de estado y energia.' : 'Quick mood and energy snapshot.',
    seeInsights: baseLang === 'ru' ? 'Смотреть инсайты' : baseLang === 'es' ? 'Ver insights' : 'See Insights',
    seeInsightsText: baseLang === 'ru' ? 'Мягкие паттерны по дням.' : baseLang === 'es' ? 'Patrones suaves a lo largo de los dias.' : 'Gentle patterns across your days.',
    bodyMap: 'Body Map',
    bodyMapText: lang === 'ru' ? 'Понимать сегодняшний день в спокойном контексте.' : lang === 'es' ? 'Entender hoy en un contexto calmado.' : 'Understand today in calm context.',
    home: 'Home',
    knowledge: 'Knowledge',
    controls: baseLang === 'ru' ? 'Быстрые настройки' : baseLang === 'es' ? 'Controles rapidos' : 'Quick controls',
    theme: baseLang === 'ru' ? 'Тема' : baseLang === 'es' ? 'Tema' : 'Theme',
    light: baseLang === 'ru' ? 'Светлая' : baseLang === 'es' ? 'Claro' : 'Light',
    dark: baseLang === 'ru' ? 'Темная' : baseLang === 'es' ? 'Oscuro' : 'Dark',
    openMenu: baseLang === 'ru' ? 'Меню' : baseLang === 'es' ? 'Menu' : 'Menu',
    openFooter: baseLang === 'ru' ? 'Футер' : baseLang === 'es' ? 'Footer' : 'Footer',
  };
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SurfaceCard style={styles.controlsCard}>
        <Text style={styles.controlsTitle}>{localized.controls}</Text>
        <LanguageSelector lang={lang} setLang={setLang} />
        <View style={styles.actionsRow}>
          <LunaButton variant="secondary" onPress={onToggleTheme}>
            {localized.theme}: {themeMode === 'light' ? localized.light : localized.dark}
          </LunaButton>
          <LunaButton variant="secondary" onPress={() => onOpenMenu?.()}>{localized.openMenu}</LunaButton>
          <LunaButton variant="secondary" onPress={() => onOpenFooter?.()}>{localized.openFooter}</LunaButton>
        </View>
      </SurfaceCard>

      <ImageBackground source={require('../../assets/home-hero.webp')} imageStyle={styles.heroImage} style={styles.hero}>
        <View style={styles.heroGlowTop} />
        <View style={styles.heroGlowBottom} />
        <View style={styles.heroTint}>
          <Text style={styles.eyebrow}>Luna29 Home</Text>
          <Text style={styles.title}>{copy.publicHome.title}</Text>
          <Text style={styles.subtitle}>{copy.publicHome.subtitle}</Text>
          <View style={styles.actionsRow}>
            <LunaButton onPress={onOpenApp}>{loading ? localized.loading : copy.publicHome.start}</LunaButton>
            <LunaButton variant="secondary" onPress={onOpenAboutFlow}>{copy.publicHome.how}</LunaButton>
            <LunaButton variant="ghost" onPress={onOpenApp}>{copy.publicHome.openApp}</LunaButton>
          </View>
          <Text style={styles.heroHint}>{localized.hint}</Text>
        </View>
      </ImageBackground>

      <SurfaceCard>
        <Text style={styles.cardTitle}>{localized.ritual}</Text>
        <View style={styles.pillars}>
          <View style={[styles.pillar, styles.pillarA]}>
            <Text style={styles.pillarTitle}>{localized.body}</Text>
            <Text style={styles.pillarText}>{localized.bodyText}</Text>
          </View>
          <View style={[styles.pillar, styles.pillarB]}>
            <Text style={styles.pillarTitle}>{localized.senses}</Text>
            <Text style={styles.pillarText}>{localized.sensesText}</Text>
          </View>
          <View style={[styles.pillar, styles.pillarC]}>
            <Text style={styles.pillarTitle}>{localized.words}</Text>
            <Text style={styles.pillarText}>{localized.wordsText}</Text>
          </View>
        </View>
      </SurfaceCard>

      <SurfaceCard style={styles.includesCard}>
        <Text style={styles.cardTitle}>{localized.includes}</Text>
        <View style={styles.includesGrid}>
          <View style={[styles.includeItem, styles.includeSoftPink]}>
            <Text style={styles.includeTitle}>{localized.startReflection}</Text>
            <Text style={styles.includeText}>{localized.startReflectionText}</Text>
          </View>
          <View style={[styles.includeItem, styles.includeSoftLilac]}>
            <Text style={styles.includeTitle}>{localized.checkin}</Text>
            <Text style={styles.includeText}>{localized.checkinText}</Text>
          </View>
          <View style={[styles.includeItem, styles.includeSoftPurple]}>
            <Text style={styles.includeTitle}>{localized.seeInsights}</Text>
            <Text style={styles.includeText}>{localized.seeInsightsText}</Text>
          </View>
          <View style={[styles.includeItem, styles.includeSoftWarm]}>
            <Text style={styles.includeTitle}>{localized.bodyMap}</Text>
            <Text style={styles.includeText}>{localized.bodyMapText}</Text>
          </View>
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.cardTitle}>{localized.menu}</Text>
        <View style={styles.actionsRow}>
          <LunaButton variant="secondary" onPress={onOpenApp}>{localized.home}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenAboutFlow}>{localized.knowledge}</LunaButton>
          <LunaButton variant="secondary" onPress={() => onOpenSupport?.()}>{localized.support}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenAuth}>{localized.signin}</LunaButton>
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.cardTitle}>{localized.oneMinute}</Text>
        <Text style={styles.listItem}>{localized.s1}</Text>
        <Text style={styles.listItem}>{localized.s2}</Text>
        <Text style={styles.listItem}>{localized.s3}</Text>
      </SurfaceCard>

      <SurfaceCard style={styles.patternCard}>
        <Text style={styles.patternLabel}>{localized.pattern}</Text>
        <Text style={styles.patternText}>{localized.p1}</Text>
        <Text style={styles.patternText}>{localized.p2}</Text>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.cardTitle}>{localized.footer}</Text>
        <View style={styles.actionsRow}>
          <LunaButton variant="secondary" onPress={() => onOpenSupport?.()}>{localized.supportFaq}</LunaButton>
          <LunaButton variant="secondary" onPress={() => onOpenLegal?.()}>{localized.legalPrivacy}</LunaButton>
          <LunaButton variant="ghost" onPress={onOpenApp}>{localized.openNow}</LunaButton>
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
  controlsCard: {
    backgroundColor: 'rgba(255, 248, 255, 0.94)',
    borderColor: 'rgba(209,183,227,0.68)',
  },
  controlsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4a3960',
  },
  hero: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(198, 165, 223, 0.58)',
    minHeight: 270,
  },
  heroImage: {
    resizeMode: 'cover',
  },
  heroTint: {
    flex: 1,
    padding: 20,
    gap: 8,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(72, 43, 95, 0.2)',
  },
  heroGlowTop: {
    position: 'absolute',
    width: 180,
    height: 180,
    right: -40,
    top: -50,
    borderRadius: 999,
    backgroundColor: '#f0d9ff',
    opacity: 0.55,
  },
  heroGlowBottom: {
    position: 'absolute',
    width: 220,
    height: 160,
    left: -60,
    bottom: -60,
    borderRadius: 999,
    backgroundColor: '#fbdde7',
    opacity: 0.5,
  },
  eyebrow: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    fontWeight: '700',
    color: colors.textMuted,
  },
  title: {
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '800',
    color: '#fff7ff',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: '#f5e9f7',
  },
  heroHint: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: '#f5dff7',
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#4a3960',
  },
  pillars: {
    gap: 8,
  },
  pillar: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(215, 190, 234, 0.72)',
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  pillarA: {
    backgroundColor: 'rgba(250, 232, 242, 0.72)',
  },
  pillarB: {
    backgroundColor: 'rgba(239, 233, 255, 0.76)',
  },
  pillarC: {
    backgroundColor: 'rgba(229, 237, 255, 0.72)',
  },
  pillarTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#6a3f8c',
    letterSpacing: 0.2,
  },
  pillarText: {
    marginTop: 2,
    fontSize: 14,
    color: '#665775',
  },
  listItem: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  patternCard: {
    borderColor: '#e9d2ec',
    backgroundColor: '#f9f3fb',
  },
  patternLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    fontWeight: '700',
    color: colors.accentStrong,
  },
  patternText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  includesCard: {
    backgroundColor: 'rgba(255, 249, 255, 0.92)',
    borderColor: 'rgba(209,183,227,0.68)',
  },
  includesGrid: {
    gap: 9,
  },
  includeItem: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(215,188,234,0.72)',
    paddingHorizontal: 13,
    paddingVertical: 12,
    gap: 2,
  },
  includeSoftPink: {
    backgroundColor: 'rgba(252, 232, 242, 0.6)',
  },
  includeSoftLilac: {
    backgroundColor: 'rgba(238, 233, 255, 0.62)',
  },
  includeSoftPurple: {
    backgroundColor: 'rgba(237, 224, 255, 0.7)',
  },
  includeSoftWarm: {
    backgroundColor: 'rgba(251, 236, 231, 0.62)',
  },
  includeTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#533768',
  },
  includeText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
