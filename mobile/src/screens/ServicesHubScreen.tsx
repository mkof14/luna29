import React from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LanguageSelector } from '../components/LanguageSelector';
import { LunaButton } from '../components/LunaButton';
import { MobileScreenHeader } from '../components/MobileScreenHeader';
import { SurfaceCard } from '../components/SurfaceCard';
import { colors } from '../theme/tokens';
import { getMobileCopy, MobileLang, resolveLangBase } from '../i18n/mobileCopy';

export function ServicesHubScreen({
  onBack,
  onOpenToday,
  onOpenStory,
  onOpenRhythm,
  onOpenYou,
  onOpenPublicHome,
  onOpenAuth,
  onOpenMemberZone,
  onOpenFooterLinks,
  onOpenAdmin,
  onOpenBodyMap,
  onOpenRitualPath,
  onOpenBridge,
  onOpenKnowledge,
  onOpenHealthReports,
  onOpenSupport,
  onOpenVoice,
  onOpenRelationships,
  onOpenFamily,
  onOpenCreative,
  onOpenMedicationNotes,
  onOpenResetRoom,
  onOpenVoiceFiles,
  onOpenHowItWorks,
  onOpenContact,
  onOpenAbout,
  lang,
  setLang,
  themeMode,
  onToggleTheme,
}: {
  onBack: () => void;
  onOpenToday: () => void;
  onOpenStory: () => void;
  onOpenRhythm: () => void;
  onOpenYou: () => void;
  onOpenPublicHome: () => void;
  onOpenAuth: () => void;
  onOpenMemberZone: () => void;
  onOpenFooterLinks: () => void;
  onOpenAdmin: () => void;
  onOpenBodyMap: () => void;
  onOpenRitualPath: () => void;
  onOpenBridge: () => void;
  onOpenKnowledge: () => void;
  onOpenHealthReports: () => void;
  onOpenSupport: () => void;
  onOpenVoice: () => void;
  onOpenRelationships: () => void;
  onOpenFamily: () => void;
  onOpenCreative: () => void;
  onOpenMedicationNotes: () => void;
  onOpenResetRoom: () => void;
  onOpenVoiceFiles: () => void;
  onOpenHowItWorks: () => void;
  onOpenContact: () => void;
  onOpenAbout: () => void;
  lang: MobileLang;
  setLang: (lang: MobileLang) => void;
  themeMode: 'light' | 'dark';
  onToggleTheme: () => void;
}) {
  const baseLang = resolveLangBase(lang);
  const copy = getMobileCopy(lang).services;
  const extraCopy: Record<string, string> = {
    en: {
      today: 'Today',
      story: 'Your Story',
      rhythm: 'Rhythm',
      you: 'You',
      quickNav: 'Quick navigation',
      publicHome: 'Public Home',
      auth: 'Sign in / Admin Login',
      member: 'Member Zone',
      footer: 'Footer Links',
      admin: 'Admin Zone',
      coreTitle: 'Core pages',
      supportTitle: 'Support and guidance',
      extraTitle: 'Extra tools',
      relationships: 'Relationships',
      family: 'Family',
      creative: 'Creative Studio',
      meds: 'Medication Notes',
      reset: 'Reset Room',
      voiceFiles: 'My Voice Files',
      how: 'How Luna29 works',
      contact: 'Contact',
      about: 'About Luna29',
      includesTitle: 'What Luna29 services include',
      mapTitle: 'Luna29 map',
      mapScreens: 'Screens',
      mapScreensText: 'Today, Story, Rhythm, You, Public Home, Auth.',
      mapLogic: 'Logic',
      mapLogicText: 'Daily loop: open, reflect, receive, continue.',
      mapServices: 'Services',
      mapServicesText: 'Voice notes, reports, body map, support.',
      mapFunctions: 'Functions',
      mapFunctionsText: 'Language, theme, sharing, access and admin.',
      voiceTitle: 'Voice notes',
      voiceText: 'Speak naturally and receive a calm response.',
      reportsTitle: 'Health reports',
      reportsText: 'Build a simple report for doctor visits and sharing.',
      contextTitle: 'Body context',
      contextText: 'Read cycle, mood, sleep, and energy in one place.',
      safetyTitle: 'Support and safety',
      safetyText: 'FAQ, partner guidance, legal and privacy controls.',
    },
    ru: {
      today: 'Сегодня',
      story: 'История',
      rhythm: 'Ритм',
      you: 'Вы',
      quickNav: 'Быстрая навигация',
      publicHome: 'Публичный Home',
      auth: 'Вход / Админ логин',
      member: 'Мембер Зона',
      footer: 'Ссылки футера',
      admin: 'Админ Зона',
      coreTitle: 'Основные страницы',
      supportTitle: 'Поддержка и помощь',
      extraTitle: 'Дополнительные инструменты',
      relationships: 'Отношения',
      family: 'Семья',
      creative: 'Творческая студия',
      meds: 'Заметки по препаратам',
      reset: 'Reset Room',
      voiceFiles: 'Мои голосовые файлы',
      how: 'Как работает Luna29',
      contact: 'Контакты',
      about: 'О Luna29',
      includesTitle: 'Что включает Luna29',
      mapTitle: 'Карта Luna29',
      mapScreens: 'Скрины',
      mapScreensText: 'Today, Story, Rhythm, You, Public Home, Auth.',
      mapLogic: 'Логика',
      mapLogicText: 'Ежедневный цикл: открыть, заметка, отклик, продолжить.',
      mapServices: 'Сервисы',
      mapServicesText: 'Голосовые заметки, отчеты, body map, поддержка.',
      mapFunctions: 'Функции',
      mapFunctionsText: 'Язык, тема, шаринг, доступ и админ.',
      voiceTitle: 'Голосовые заметки',
      voiceText: 'Говорите свободно и получайте спокойный отклик.',
      reportsTitle: 'Отчеты здоровья',
      reportsText: 'Собирайте понятный отчет для врача и обмена.',
      contextTitle: 'Контекст тела',
      contextText: 'Цикл, настроение, сон и энергия в одном месте.',
      safetyTitle: 'Поддержка и безопасность',
      safetyText: 'FAQ, партнерская помощь, юридические и privacy-контроли.',
    },
    es: {
      today: 'Hoy',
      story: 'Tu historia',
      rhythm: 'Ritmo',
      you: 'Tu',
      quickNav: 'Navegacion rapida',
      publicHome: 'Home publico',
      auth: 'Entrar / Admin login',
      member: 'Zona miembro',
      footer: 'Links del footer',
      admin: 'Zona admin',
      coreTitle: 'Paginas clave',
      supportTitle: 'Soporte y guia',
      extraTitle: 'Herramientas extra',
      relationships: 'Relaciones',
      family: 'Familia',
      creative: 'Estudio creativo',
      meds: 'Notas de medicacion',
      reset: 'Reset Room',
      voiceFiles: 'Mis archivos de voz',
      how: 'Como funciona Luna29',
      contact: 'Contacto',
      about: 'Sobre Luna29',
      includesTitle: 'Que incluye Luna29',
      mapTitle: 'Mapa de Luna29',
      mapScreens: 'Pantallas',
      mapScreensText: 'Today, Story, Rhythm, You, Public Home, Auth.',
      mapLogic: 'Logica',
      mapLogicText: 'Bucle diario: abrir, reflejar, recibir, continuar.',
      mapServices: 'Servicios',
      mapServicesText: 'Notas de voz, informes, body map, soporte.',
      mapFunctions: 'Funciones',
      mapFunctionsText: 'Idioma, tema, compartir, acceso y admin.',
      voiceTitle: 'Notas de voz',
      voiceText: 'Habla con calma y recibe una respuesta suave.',
      reportsTitle: 'Informes de salud',
      reportsText: 'Crea un informe claro para visitas medicas y compartir.',
      contextTitle: 'Contexto corporal',
      contextText: 'Ciclo, estado, sueno y energia en un solo lugar.',
      safetyTitle: 'Soporte y seguridad',
      safetyText: 'FAQ, guia para pareja, controles legales y de privacidad.',
    },
  }[baseLang];
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <MobileScreenHeader title={copy.title} subtitle={copy.subtitle} onBack={onBack} />

      <SurfaceCard style={styles.controlsCard}>
        <Text style={styles.cardTitle}>{baseLang === 'ru' ? 'Язык и тема' : baseLang === 'es' ? 'Idioma y tema' : 'Language and theme'}</Text>
        <LanguageSelector lang={lang} setLang={setLang} />
        <LunaButton variant="secondary" onPress={onToggleTheme}>
          {(baseLang === 'ru' ? 'Тема' : baseLang === 'es' ? 'Tema' : 'Theme')}: {themeMode === 'light' ? (baseLang === 'ru' ? 'Светлая' : baseLang === 'es' ? 'Claro' : 'Light') : (baseLang === 'ru' ? 'Темная' : baseLang === 'es' ? 'Oscuro' : 'Dark')}
        </LunaButton>
      </SurfaceCard>

      <ImageBackground source={require('../../assets/home-hero.webp')} imageStyle={styles.heroImage} style={styles.heroCard}>
        <View style={styles.heroOverlay}>
          <Text style={styles.heroTitle}>{copy.heroTitle}</Text>
          <Text style={styles.heroText}>{copy.heroText}</Text>
          <LunaButton onPress={onOpenVoice}>{copy.speak}</LunaButton>
        </View>
      </ImageBackground>

      <SurfaceCard>
        <Text style={styles.cardTitle}>{extraCopy.quickNav}</Text>
        <View style={styles.stack}>
          <LunaButton variant="secondary" onPress={onOpenToday}>{extraCopy.today}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenStory}>{extraCopy.story}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenRhythm}>{extraCopy.rhythm}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenYou}>{extraCopy.you}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenPublicHome}>{extraCopy.publicHome}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenAuth}>{extraCopy.auth}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenMemberZone}>{extraCopy.member}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenFooterLinks}>{extraCopy.footer}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenAdmin}>{extraCopy.admin}</LunaButton>
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.cardTitle}>{extraCopy.coreTitle}</Text>
        <View style={styles.stack}>
          <LunaButton variant="secondary" onPress={onOpenBodyMap}>{copy.bodyMap}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenRitualPath}>{copy.ritualPath}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenBridge}>{copy.bridge}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenKnowledge}>{copy.knowledge}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenHealthReports}>{copy.reports}</LunaButton>
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.cardTitle}>{extraCopy.supportTitle}</Text>
        <View style={styles.stack}>
          <LunaButton variant="secondary" onPress={onOpenSupport}>{copy.support}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenRelationships}>{extraCopy.relationships}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenFamily}>{extraCopy.family}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenHowItWorks}>{extraCopy.how}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenContact}>{extraCopy.contact}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenAbout}>{extraCopy.about}</LunaButton>
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.cardTitle}>{extraCopy.extraTitle}</Text>
        <View style={styles.stack}>
          <LunaButton variant="secondary" onPress={onOpenCreative}>{extraCopy.creative}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenMedicationNotes}>{extraCopy.meds}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenResetRoom}>{extraCopy.reset}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenVoiceFiles}>{extraCopy.voiceFiles}</LunaButton>
        </View>
      </SurfaceCard>

      <SurfaceCard style={styles.infoCard}>
        <Text style={styles.cardTitle}>{extraCopy.mapTitle}</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoTitle}>{extraCopy.mapScreens}</Text>
            <Text style={styles.infoText}>{extraCopy.mapScreensText}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoTitle}>{extraCopy.mapLogic}</Text>
            <Text style={styles.infoText}>{extraCopy.mapLogicText}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoTitle}>{extraCopy.mapServices}</Text>
            <Text style={styles.infoText}>{extraCopy.mapServicesText}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoTitle}>{extraCopy.mapFunctions}</Text>
            <Text style={styles.infoText}>{extraCopy.mapFunctionsText}</Text>
          </View>
        </View>
      </SurfaceCard>

      <SurfaceCard style={styles.infoCard}>
        <Text style={styles.cardTitle}>{extraCopy.includesTitle}</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoTitle}>{extraCopy.voiceTitle}</Text>
            <Text style={styles.infoText}>{extraCopy.voiceText}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoTitle}>{extraCopy.reportsTitle}</Text>
            <Text style={styles.infoText}>{extraCopy.reportsText}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoTitle}>{extraCopy.contextTitle}</Text>
            <Text style={styles.infoText}>{extraCopy.contextText}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoTitle}>{extraCopy.safetyTitle}</Text>
            <Text style={styles.infoText}>{extraCopy.safetyText}</Text>
          </View>
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
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 260,
  },
  heroImage: {
    resizeMode: 'cover',
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(72, 47, 88, 0.28)',
    padding: 18,
    justifyContent: 'flex-end',
    gap: 8,
  },
  heroTitle: {
    fontSize: 29,
    lineHeight: 34,
    fontWeight: '700',
    color: '#fff',
  },
  heroText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#f8edf7',
    fontWeight: '500',
  },
  cardTitle: {
    fontSize: 18,
    color: colors.textPrimary,
    fontWeight: '800',
  },
  controlsCard: {
    backgroundColor: 'rgba(255, 248, 255, 0.94)',
    borderColor: 'rgba(209,183,227,0.68)',
  },
  stack: {
    gap: 8,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 249, 255, 0.92)',
    borderColor: 'rgba(209,183,227,0.68)',
  },
  infoGrid: {
    gap: 8,
  },
  infoItem: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(248, 238, 253, 0.82)',
    paddingHorizontal: 11,
    paddingVertical: 10,
    gap: 2,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
});
