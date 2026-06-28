import React, { useEffect, useState } from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LanguageSelector } from '../components/LanguageSelector';
import { LunaButton } from '../components/LunaButton';
import { MobileScreenHeader } from '../components/MobileScreenHeader';
import { SurfaceCard } from '../components/SurfaceCard';
import { getReminderPreview } from '../features/reminders';
import { freeFeatures, paidFeatures } from '../features/subscription';
import {
  fetchPushRegistrationStatus,
  getReminderPermissionState,
  registerDevicePushToken,
  requestReminderPermission,
  scheduleEveningReflectionReminder,
  sendPushTest,
  type ReminderPermissionState,
} from '../services/notifications';
import { colors } from '../theme/tokens';
import { BaseMobileLang, MobileLang, resolveLangBase } from '../i18n/mobileCopy';

export function YouScreen({
  dayOfMonth,
  onSignOut,
  onOpenPaywall,
  onOpenMonthly,
  onOpenVoice,
  onOpenQuickCheckIn,
  onOpenToday,
  onOpenStory,
  onOpenRhythm,
  onOpenTodayMirror,
  onOpenMyDay,
  onOpenResult,
  onOpenMemberZone,
  onOpenFooterLinks,
  onOpenAdmin,
  onOpenServices,
  onOpenPublicHome,
  onOpenAuth,
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
  onBack,
}: {
  dayOfMonth: number;
  onSignOut: () => Promise<void>;
  onOpenPaywall?: () => void;
  onOpenMonthly?: () => void;
  onOpenVoice?: () => void;
  onOpenQuickCheckIn?: () => void;
  onOpenToday?: () => void;
  onOpenStory?: () => void;
  onOpenRhythm?: () => void;
  onOpenTodayMirror?: () => void;
  onOpenMyDay?: () => void;
  onOpenResult?: () => void;
  onOpenMemberZone?: () => void;
  onOpenFooterLinks?: () => void;
  onOpenAdmin?: () => void;
  onOpenServices?: () => void;
  onOpenPublicHome?: () => void;
  onOpenAuth?: () => void;
  onOpenRelationships?: () => void;
  onOpenFamily?: () => void;
  onOpenCreative?: () => void;
  onOpenMedicationNotes?: () => void;
  onOpenResetRoom?: () => void;
  onOpenVoiceFiles?: () => void;
  onOpenHowItWorks?: () => void;
  onOpenContact?: () => void;
  onOpenAbout?: () => void;
  lang: MobileLang;
  setLang: (lang: MobileLang) => void;
  themeMode: 'light' | 'dark';
  onToggleTheme: () => void;
  onBack?: () => void;
}) {
  const copyByLang: Record<BaseMobileLang, Record<string, string>> = {
    en: {
      title: 'You',
      subtitle: 'Profile, reminders, privacy, and subscription.',
      profile: 'Profile',
      profileText: 'Preferences, privacy, and data controls.',
      theme: 'Theme',
      light: 'Light',
      dark: 'Dark',
      reminderPreview: 'Reminder preview',
      pushPermission: 'Push permission',
      enableReminders: 'Enable evening reminders',
      pushRegistered: 'Push registered',
      yes: 'yes',
      no: 'no',
      sendPushTest: 'Send push test',
      subPrep: 'Subscription preparation',
      free: 'Free',
      paidLater: 'Paid later',
      unlock: 'Unlock deeper insights',
      month: 'Your month with Luna29',
      allPages: 'All pages',
      allPagesText: 'Direct access to every main mobile screen.',
      today: 'Today',
      voice: 'Voice Reflection',
      quick: 'Quick check-in',
      result: 'Reflection Result',
      story: 'Your Story',
      rhythm: 'Rhythm',
      todayMirror: 'Today Mirror',
      myDay: 'My Day with Luna29',
      paywall: 'Insights Paywall',
      member: 'Member Zone',
      services: 'All Services',
      relationships: 'Relationships',
      family: 'Family',
      creative: 'Creative Studio',
      meds: 'Medication Notes',
      reset: 'Reset Room',
      voiceFiles: 'My Voice Files',
      how: 'How Luna29 works',
      contact: 'Contact',
      about: 'About Luna29',
      publicHome: 'Public Home',
      auth: 'Sign in / Admin',
      footerLinks: 'Footer links',
      admin: 'Admin',
      account: 'Account',
      signOut: 'Sign out',
    },
    ru: {
      title: 'Профиль',
      subtitle: 'Профиль, напоминания, приватность и подписка.',
      profile: 'Профиль',
      profileText: 'Настройки, приватность и управление данными.',
      theme: 'Тема',
      light: 'Светлая',
      dark: 'Темная',
      reminderPreview: 'Превью напоминания',
      pushPermission: 'Push-разрешение',
      enableReminders: 'Включить вечерние напоминания',
      pushRegistered: 'Push зарегистрирован',
      yes: 'да',
      no: 'нет',
      sendPushTest: 'Отправить push-тест',
      subPrep: 'Подготовка подписки',
      free: 'Бесплатно',
      paidLater: 'Платно позже',
      unlock: 'Открыть глубокие инсайты',
      month: 'Ваш месяц с Luna29',
      allPages: 'Все страницы',
      allPagesText: 'Прямой доступ ко всем основным экранам mobile.',
      today: 'Сегодня',
      voice: 'Голосовая заметка',
      quick: 'Быстрый check-in',
      result: 'Результат дня',
      story: 'Ваша история',
      rhythm: 'Ритм',
      todayMirror: 'Today Mirror',
      myDay: 'Мой день с Luna29',
      paywall: 'Экран подписки',
      member: 'Мембер Зона',
      services: 'Все сервисы',
      relationships: 'Relationships',
      family: 'Family',
      creative: 'Creative Studio',
      meds: 'Medication Notes',
      reset: 'Reset Room',
      voiceFiles: 'My Voice Files',
      how: 'Как работает Luna29',
      contact: 'Контакты',
      about: 'О Luna29',
      publicHome: 'Публичный Home',
      auth: 'Вход / Админ',
      footerLinks: 'Ссылки футера',
      admin: 'Админ',
      account: 'Аккаунт',
      signOut: 'Выйти',
    },
    es: {
      title: 'Tu perfil',
      subtitle: 'Perfil, recordatorios, privacidad y suscripcion.',
      profile: 'Perfil',
      profileText: 'Preferencias, privacidad y controles de datos.',
      theme: 'Tema',
      light: 'Claro',
      dark: 'Oscuro',
      reminderPreview: 'Vista previa del recordatorio',
      pushPermission: 'Permiso push',
      enableReminders: 'Activar recordatorios nocturnos',
      pushRegistered: 'Push registrado',
      yes: 'si',
      no: 'no',
      sendPushTest: 'Enviar prueba push',
      subPrep: 'Preparacion de suscripcion',
      free: 'Gratis',
      paidLater: 'De pago despues',
      unlock: 'Desbloquear insights profundos',
      month: 'Tu mes con Luna29',
      allPages: 'Todas las paginas',
      allPagesText: 'Acceso directo a todas las pantallas principales del mobile.',
      today: 'Hoy',
      voice: 'Nota de voz',
      quick: 'Check-in rapido',
      result: 'Resultado de reflexion',
      story: 'Tu historia',
      rhythm: 'Ritmo',
      todayMirror: 'Today Mirror',
      myDay: 'Mi dia con Luna29',
      paywall: 'Pantalla paywall',
      member: 'Zona miembro',
      services: 'Todos los servicios',
      relationships: 'Relationships',
      family: 'Family',
      creative: 'Creative Studio',
      meds: 'Medication Notes',
      reset: 'Reset Room',
      voiceFiles: 'My Voice Files',
      how: 'Como funciona Luna29',
      contact: 'Contacto',
      about: 'Sobre Luna29',
      publicHome: 'Home publico',
      auth: 'Entrar / Admin',
      footerLinks: 'Links del footer',
      admin: 'Admin',
      account: 'Cuenta',
      signOut: 'Cerrar sesion',
    },
  };
  const copy = copyByLang[resolveLangBase(lang)];
  const reminder = getReminderPreview(dayOfMonth);
  const [permission, setPermission] = useState<ReminderPermissionState>('undetermined');
  const [pushRegistered, setPushRegistered] = useState(false);
  const [pushCount, setPushCount] = useState(0);
  const [pushInfo, setPushInfo] = useState('');

  useEffect(() => {
    void (async () => {
      const state = await getReminderPermissionState();
      setPermission(state);
      try {
        const push = await fetchPushRegistrationStatus();
        setPushRegistered(push.registered);
        setPushCount(push.count);
      } catch {
        setPushRegistered(false);
      }
    })();
  }, []);

  async function enableReminders() {
    const state = await requestReminderPermission();
    setPermission(state);
    if (state === 'granted') {
      await scheduleEveningReflectionReminder();
      try {
        const registration = await registerDevicePushToken('Luna29 mobile');
        setPushRegistered(registration.registered);
        setPushCount(registration.count);
        setPushInfo(`Push token registered (${registration.count}).`);
      } catch (error) {
        setPushInfo(error instanceof Error ? error.message : 'Push registration failed.');
      }
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ImageBackground source={require('../../assets/bg-soft-1.webp')} imageStyle={styles.heroImage} style={styles.heroCard}>
        <View style={styles.heroOverlay}>
          <MobileScreenHeader title={copy.title} subtitle={copy.subtitle} onBack={onBack} tone="light" />
        </View>
      </ImageBackground>

      <SurfaceCard style={styles.profileCard}>
        <Text style={styles.cardTitle}>{copy.profile}</Text>
        <Text style={styles.text}>{copy.profileText}</Text>
        <View style={styles.langRow}>
          <LanguageSelector lang={lang} setLang={setLang} />
        </View>
        <LunaButton variant="secondary" onPress={onToggleTheme}>
          {copy.theme}: {themeMode === 'light' ? copy.light : copy.dark}
        </LunaButton>
      </SurfaceCard>

      <SurfaceCard style={styles.reminderCard}>
        <Text style={styles.cardTitle}>{copy.reminderPreview}</Text>
        <Text style={styles.text}>{reminder}</Text>
        <Text style={styles.meta}>{copy.pushPermission}: {permission}</Text>
        <Text style={styles.meta}>
          {copy.pushRegistered}: {pushRegistered ? `${copy.yes} (${pushCount})` : copy.no}
        </Text>
        {pushInfo ? <Text style={styles.meta}>{pushInfo}</Text> : null}
        <LunaButton variant="secondary" onPress={enableReminders}>{copy.enableReminders}</LunaButton>
        <LunaButton
          variant="secondary"
          onPress={async () => {
            try {
              const result = await sendPushTest();
              setPushInfo(result.message);
            } catch (error) {
              setPushInfo(error instanceof Error ? error.message : 'Push test failed.');
            }
          }}
        >
          {copy.sendPushTest}
        </LunaButton>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.cardTitle}>{copy.subPrep}</Text>
        <Text style={styles.blockTitle}>{copy.free}</Text>
        <View style={styles.stack}>{freeFeatures.map((item) => <Text key={item} style={styles.text}>• {item}</Text>)}</View>
        <Text style={styles.blockTitle}>{copy.paidLater}</Text>
        <View style={styles.stack}>{paidFeatures.map((item) => <Text key={item} style={styles.text}>• {item}</Text>)}</View>
        <View style={styles.stack}>
          <LunaButton variant="secondary" onPress={() => onOpenPaywall?.()}>{copy.unlock}</LunaButton>
          <LunaButton variant="secondary" onPress={() => onOpenMonthly?.()}>{copy.month}</LunaButton>
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.cardTitle}>{copy.allPages}</Text>
        <Text style={styles.text}>{copy.allPagesText}</Text>
        <View style={styles.stack}>
          <LunaButton variant="secondary" onPress={() => onOpenToday?.()}>{copy.today}</LunaButton>
          <LunaButton variant="secondary" onPress={() => onOpenVoice?.()}>{copy.voice}</LunaButton>
          <LunaButton variant="secondary" onPress={() => onOpenQuickCheckIn?.()}>{copy.quick}</LunaButton>
          <LunaButton variant="secondary" onPress={() => onOpenResult?.()}>{copy.result}</LunaButton>
          <LunaButton variant="secondary" onPress={() => onOpenStory?.()}>{copy.story}</LunaButton>
          <LunaButton variant="secondary" onPress={() => onOpenRhythm?.()}>{copy.rhythm}</LunaButton>
          <LunaButton variant="secondary" onPress={() => onOpenTodayMirror?.()}>{copy.todayMirror}</LunaButton>
          <LunaButton variant="secondary" onPress={() => onOpenMyDay?.()}>{copy.myDay}</LunaButton>
          <LunaButton variant="secondary" onPress={() => onOpenMonthly?.()}>{copy.month}</LunaButton>
          <LunaButton variant="secondary" onPress={() => onOpenPaywall?.()}>{copy.paywall}</LunaButton>
          <LunaButton variant="secondary" onPress={() => onOpenMemberZone?.()}>{copy.member}</LunaButton>
          <LunaButton variant="secondary" onPress={() => onOpenServices?.()}>{copy.services}</LunaButton>
          <LunaButton variant="secondary" onPress={() => onOpenRelationships?.()}>{copy.relationships}</LunaButton>
          <LunaButton variant="secondary" onPress={() => onOpenFamily?.()}>{copy.family}</LunaButton>
          <LunaButton variant="secondary" onPress={() => onOpenCreative?.()}>{copy.creative}</LunaButton>
          <LunaButton variant="secondary" onPress={() => onOpenMedicationNotes?.()}>{copy.meds}</LunaButton>
          <LunaButton variant="secondary" onPress={() => onOpenResetRoom?.()}>{copy.reset}</LunaButton>
          <LunaButton variant="secondary" onPress={() => onOpenVoiceFiles?.()}>{copy.voiceFiles}</LunaButton>
          <LunaButton variant="secondary" onPress={() => onOpenHowItWorks?.()}>{copy.how}</LunaButton>
          <LunaButton variant="secondary" onPress={() => onOpenContact?.()}>{copy.contact}</LunaButton>
          <LunaButton variant="secondary" onPress={() => onOpenAbout?.()}>{copy.about}</LunaButton>
          <LunaButton variant="secondary" onPress={() => onOpenPublicHome?.()}>{copy.publicHome}</LunaButton>
          <LunaButton variant="secondary" onPress={() => onOpenAuth?.()}>{copy.auth}</LunaButton>
          <LunaButton variant="secondary" onPress={() => onOpenFooterLinks?.()}>{copy.footerLinks}</LunaButton>
          <LunaButton variant="secondary" onPress={() => onOpenAdmin?.()}>{copy.admin}</LunaButton>
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.cardTitle}>{copy.account}</Text>
        <LunaButton variant="ghost" onPress={() => void onSignOut()}>{copy.signOut}</LunaButton>
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
  title: {
    display: 'none',
  },
  heroCard: {
    minHeight: 146,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(198, 165, 223, 0.58)',
  },
  heroImage: {
    resizeMode: 'cover',
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(58, 38, 78, 0.22)',
    padding: 16,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    color: '#4a3960',
    fontWeight: '800',
  },
  blockTitle: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    color: '#8a769f',
    fontWeight: '800',
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    color: '#665775',
  },
  meta: {
    fontSize: 12,
    color: '#8a769f',
    fontWeight: '600',
  },
  stack: {
    gap: 4,
  },
  langRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  profileCard: {
    backgroundColor: 'rgba(255, 249, 255, 0.94)',
    borderColor: 'rgba(209,183,227,0.68)',
  },
  reminderCard: {
    backgroundColor: 'rgba(243, 237, 253, 0.9)',
    borderColor: 'rgba(209,183,227,0.68)',
  },
});
