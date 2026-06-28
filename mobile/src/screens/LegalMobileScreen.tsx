import React from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LunaButton } from '../components/LunaButton';
import { MobileScreenHeader } from '../components/MobileScreenHeader';
import { SurfaceCard } from '../components/SurfaceCard';
import { colors } from '../theme/tokens';
import { MobileLang, resolveLangBase } from '../i18n/mobileCopy';

export function LegalMobileScreen({
  onBack,
  lang,
  onOpenTerms,
  onOpenMedical,
  onOpenCookies,
  onOpenDataRights,
}: {
  onBack: () => void;
  lang: MobileLang;
  onOpenTerms?: () => void;
  onOpenMedical?: () => void;
  onOpenCookies?: () => void;
  onOpenDataRights?: () => void;
}) {
  const copy = {
    en: {
      title: 'Legal & Privacy',
      subtitle: 'Clear rules, privacy, and user rights.',
      sections: [
        {
          title: 'Privacy Notice',
          body: 'Luna29 keeps personal reflections private and uses protected services for account and security workflows.',
        },
        {
          title: 'Terms of Use',
          body: 'By using Luna29, you agree to use the service respectfully and keep your account credentials secure.',
        },
        {
          title: 'Cookies & Device Data',
          body: 'Luna29 uses essential cookies and local device data to keep sessions, language, and core experience stable.',
        },
        {
          title: 'Data Rights',
          body: 'You can request access, correction, export, or deletion of personal data according to applicable laws.',
        },
        {
          title: 'Medical Disclaimer',
          body: 'Luna29 is an awareness companion and not a medical diagnosis tool. Consult your doctor when needed.',
        },
      ],
    },
    ru: {
      title: 'Право и приватность',
      subtitle: 'Понятные правила, приватность и права пользователя.',
      sections: [
        {
          title: 'Уведомление о приватности',
          body: 'Luna29 сохраняет личные записи приватными и использует защищенные сервисы для аккаунта и безопасности.',
        },
        {
          title: 'Условия использования',
          body: 'Используя Luna29, вы соглашаетесь бережно использовать сервис и хранить данные входа в безопасности.',
        },
        {
          title: 'Cookies и данные устройства',
          body: 'Luna29 использует базовые cookies и локальные данные устройства для сессии, языка и стабильной работы.',
        },
        {
          title: 'Права на данные',
          body: 'Вы можете запросить доступ, исправление, экспорт или удаление персональных данных по применимым законам.',
        },
        {
          title: 'Медицинский дисклеймер',
          body: 'Luna29 — инструмент осознанности, а не диагностика. При необходимости обратитесь к врачу.',
        },
      ],
    },
    es: {
      title: 'Legal y Privacidad',
      subtitle: 'Reglas claras, privacidad y derechos del usuario.',
      sections: [
        {
          title: 'Aviso de privacidad',
          body: 'Luna29 mantiene privadas las reflexiones personales y usa servicios protegidos para cuenta y seguridad.',
        },
        {
          title: 'Terminos de uso',
          body: 'Al usar Luna29 aceptas usar el servicio con cuidado y mantener seguras tus credenciales.',
        },
        {
          title: 'Cookies y datos del dispositivo',
          body: 'Luna29 usa cookies esenciales y datos locales para sesion, idioma y estabilidad de la experiencia.',
        },
        {
          title: 'Derechos de datos',
          body: 'Puedes solicitar acceso, correccion, exportacion o eliminacion de datos personales.',
        },
        {
          title: 'Descargo medico',
          body: 'Luna29 es una companera de conciencia, no una herramienta de diagnostico medico.',
        },
      ],
    },
  }[resolveLangBase(lang)];
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ImageBackground source={require('../../assets/bg-soft-3.webp')} imageStyle={styles.heroImage} style={styles.heroCard}>
        <View style={styles.heroOverlay}>
          <MobileScreenHeader title={copy.title} subtitle={copy.subtitle} onBack={onBack} tone="light" />
        </View>
      </ImageBackground>

      {copy.sections.map((section, index) => (
        <SurfaceCard key={section.title} style={index % 2 === 0 ? styles.blockA : styles.blockB}>
          <Text style={styles.title}>{section.title}</Text>
          <Text style={styles.body}>{section.body}</Text>
        </SurfaceCard>
      ))}

      <SurfaceCard style={styles.blockB}>
        <Text style={styles.title}>Detailed legal pages</Text>
        <View style={styles.stack}>
          <LunaButton variant="secondary" onPress={() => onOpenTerms?.()}>Terms of Use</LunaButton>
          <LunaButton variant="secondary" onPress={() => onOpenMedical?.()}>Medical Disclaimer</LunaButton>
          <LunaButton variant="secondary" onPress={() => onOpenCookies?.()}>Cookies</LunaButton>
          <LunaButton variant="secondary" onPress={() => onOpenDataRights?.()}>Data Rights</LunaButton>
        </View>
      </SurfaceCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  heroCard: { minHeight: 132, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  heroImage: { resizeMode: 'cover' },
  heroOverlay: { flex: 1, padding: 14, backgroundColor: 'rgba(57, 39, 79, 0.28)', justifyContent: 'center' },
  title: { fontSize: 18, lineHeight: 24, color: colors.textPrimary, fontWeight: '700' },
  body: { fontSize: 15, lineHeight: 22, color: colors.textSecondary },
  blockA: {
    backgroundColor: 'rgba(255, 249, 255, 0.86)',
  },
  blockB: {
    backgroundColor: 'rgba(245, 237, 253, 0.84)',
  },
  stack: {
    gap: 8,
  },
});
