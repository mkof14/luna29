import React from 'react';
import { ImageBackground, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LanguageSelector } from '../components/LanguageSelector';
import { LunaButton } from '../components/LunaButton';
import { MobileScreenHeader } from '../components/MobileScreenHeader';
import { SurfaceCard } from '../components/SurfaceCard';
import { BaseMobileLang, MobileLang, resolveLangBase } from '../i18n/mobileCopy';
import { PUBLIC_WEB_PATHS, publicWebLink, type PublicWebPathKey } from '../config/publicWeb';

const links = (Object.keys(PUBLIC_WEB_PATHS) as PublicWebPathKey[]).map((key) => ({
  key,
  section:
    key === 'home' || key === 'ritual' || key === 'body' || key === 'bridge' || key === 'pricing'
      ? 'public'
      : key === 'faq' || key === 'contact' || key === 'partnerFaq'
        ? 'support'
        : 'legal',
  url: publicWebLink(key),
}));

const socialLinks = [
  { key: 'facebook', url: 'https://facebook.com', icon: 'f', color: '#1877F2' },
  { key: 'instagram', url: 'https://instagram.com', icon: '◎', color: '#DD2A7B' },
  { key: 'youtube', url: 'https://youtube.com', icon: '▶', color: '#FF0000' },
  { key: 'tiktok', url: 'https://tiktok.com', icon: '♪', color: '#111111' },
] as const;

const copyByLang: Record<BaseMobileLang, Record<string, string>> = {
  en: {
    title: 'Footer links',
    subtitle: 'All public, support, legal, and account links from Luna29.',
    publicTitle: 'Public',
    supportTitle: 'Support',
    legalTitle: 'Legal',
    internalTitle: 'App navigation',
    accountTitle: 'Account',
    socialTitle: 'Social',
    home: 'Home',
    ritual: 'Ritual Path',
    body: 'Body Map',
    bridge: 'The Bridge',
    pricing: 'Pricing',
    faq: 'FAQ',
    about: 'About Luna29',
    how: 'How It Works',
    contact: 'Contact',
    privacy: 'Privacy',
    terms: 'Terms',
    medical: 'Disclaimer',
    cookies: 'Cookies',
    dataRights: 'Data Rights',
    partnerFaq: 'Partner FAQ',
    facebook: 'Facebook',
    instagram: 'Instagram',
    youtube: 'YouTube',
    tiktok: 'TikTok',
    today: 'Today',
    story: 'Your Story',
    rhythm: 'Rhythm',
    you: 'You',
    menu: 'Menu',
    auth: 'Sign In / Admin Login',
    publicHome: 'Public Home',
    member: 'Member Zone',
    admin: 'Admin Zone',
  },
  ru: {
    title: 'Ссылки футера',
    subtitle: 'Все публичные, support, legal и account-ссылки Luna29.',
    publicTitle: 'Публично',
    supportTitle: 'Поддержка',
    legalTitle: 'Юридически',
    internalTitle: 'Навигация приложения',
    accountTitle: 'Аккаунт',
    socialTitle: 'Соцсети',
    home: 'Home',
    ritual: 'Ritual Path',
    body: 'Body Map',
    bridge: 'The Bridge',
    pricing: 'Pricing',
    faq: 'FAQ',
    about: 'About Luna29',
    how: 'How It Works',
    contact: 'Contact',
    privacy: 'Privacy',
    terms: 'Terms',
    medical: 'Disclaimer',
    cookies: 'Cookies',
    dataRights: 'Data Rights',
    partnerFaq: 'Partner FAQ',
    facebook: 'Facebook',
    instagram: 'Instagram',
    youtube: 'YouTube',
    tiktok: 'TikTok',
    today: 'Сегодня',
    story: 'История',
    rhythm: 'Ритм',
    you: 'Вы',
    menu: 'Меню',
    auth: 'Вход / Админ логин',
    publicHome: 'Публичный Home',
    member: 'Мембер Зона',
    admin: 'Админ Зона',
  },
  es: {
    title: 'Links del footer',
    subtitle: 'Todos los links publicos, soporte, legales y de cuenta de Luna29.',
    publicTitle: 'Publico',
    supportTitle: 'Soporte',
    legalTitle: 'Legal',
    internalTitle: 'Navegacion de app',
    accountTitle: 'Cuenta',
    socialTitle: 'Social',
    home: 'Home',
    ritual: 'Ritual Path',
    body: 'Body Map',
    bridge: 'The Bridge',
    pricing: 'Pricing',
    faq: 'FAQ',
    about: 'About Luna29',
    how: 'How It Works',
    contact: 'Contact',
    privacy: 'Privacy',
    terms: 'Terms',
    medical: 'Disclaimer',
    cookies: 'Cookies',
    dataRights: 'Data Rights',
    partnerFaq: 'Partner FAQ',
    facebook: 'Facebook',
    instagram: 'Instagram',
    youtube: 'YouTube',
    tiktok: 'TikTok',
    today: 'Hoy',
    story: 'Tu historia',
    rhythm: 'Ritmo',
    you: 'Tu',
    menu: 'Menu',
    auth: 'Entrar / Admin login',
    publicHome: 'Home publico',
    member: 'Zona miembro',
    admin: 'Zona admin',
  },
};

export function FooterLinksScreen({
  onBack,
  onOpenToday,
  onOpenStory,
  onOpenRhythm,
  onOpenYou,
  onOpenPublicHome,
  onOpenAuth,
  onOpenMemberZone,
  onOpenAdmin,
  onOpenServices,
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
  onOpenAdmin: () => void;
  onOpenServices: () => void;
  lang: MobileLang;
  setLang: (lang: MobileLang) => void;
  themeMode: 'light' | 'dark';
  onToggleTheme: () => void;
}) {
  const baseLang = resolveLangBase(lang);
  const copy = copyByLang[baseLang];
  const renderSectionLinks = (section: 'public' | 'support' | 'legal') => {
    return links
      .filter((item) => item.section === section)
      .map((item) => (
        <LunaButton
          key={item.url}
          variant="secondary"
          onPress={() => {
            void Linking.openURL(item.url);
          }}
        >
          {copy[item.key]}
        </LunaButton>
      ));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ImageBackground source={require('../../assets/bg-soft-3.webp')} imageStyle={styles.heroImage} style={styles.heroCard}>
        <View style={styles.heroOverlay}>
          <MobileScreenHeader title={copy.title} subtitle={copy.subtitle} onBack={onBack} tone="light" />
        </View>
      </ImageBackground>

      <SurfaceCard style={styles.linksCard}>
        <Text style={styles.cardTitle}>{baseLang === 'ru' ? 'Язык и тема' : baseLang === 'es' ? 'Idioma y tema' : 'Language and theme'}</Text>
        <LanguageSelector lang={lang} setLang={setLang} />
        <LunaButton variant="secondary" onPress={onToggleTheme}>
          {(baseLang === 'ru' ? 'Тема' : baseLang === 'es' ? 'Tema' : 'Theme')}: {themeMode === 'light' ? (baseLang === 'ru' ? 'Светлая' : baseLang === 'es' ? 'Claro' : 'Light') : (baseLang === 'ru' ? 'Темная' : baseLang === 'es' ? 'Oscuro' : 'Dark')}
        </LunaButton>
      </SurfaceCard>

      <SurfaceCard style={styles.linksCard}>
        <Text style={styles.cardTitle}>{copy.publicTitle}</Text>
        <View style={styles.stack}>{renderSectionLinks('public')}</View>
      </SurfaceCard>

      <SurfaceCard style={styles.linksCard}>
        <Text style={styles.cardTitle}>{copy.supportTitle}</Text>
        <View style={styles.stack}>{renderSectionLinks('support')}</View>
      </SurfaceCard>

      <SurfaceCard style={styles.linksCard}>
        <Text style={styles.cardTitle}>{copy.legalTitle}</Text>
        <View style={styles.stack}>{renderSectionLinks('legal')}</View>
      </SurfaceCard>

      <SurfaceCard style={styles.linksCard}>
        <Text style={styles.cardTitle}>{copy.internalTitle}</Text>
        <View style={styles.stack}>
          <LunaButton variant="secondary" onPress={onOpenToday}>{copy.today}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenStory}>{copy.story}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenRhythm}>{copy.rhythm}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenYou}>{copy.you}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenServices}>{copy.menu}</LunaButton>
        </View>
      </SurfaceCard>

      <SurfaceCard style={styles.linksCard}>
        <Text style={styles.cardTitle}>{copy.accountTitle}</Text>
        <View style={styles.stack}>
          <LunaButton variant="secondary" onPress={onOpenPublicHome}>{copy.publicHome}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenAuth}>{copy.auth}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenMemberZone}>{copy.member}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenAdmin}>{copy.admin}</LunaButton>
        </View>
      </SurfaceCard>

      <SurfaceCard style={styles.linksCard}>
        <Text style={styles.cardTitle}>{copy.socialTitle}</Text>
        <View style={styles.socialRow}>
          {socialLinks.map((item) => (
            <Pressable
              key={item.key}
              onPress={() => {
                void Linking.openURL(item.url);
              }}
              style={styles.socialChip}
            >
              <Text style={[styles.socialIcon, { color: item.color }]}>{item.icon}</Text>
              <Text style={styles.socialText}>{copy[item.key]}</Text>
            </Pressable>
          ))}
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#4a3960',
  },
  stack: {
    gap: 8,
  },
  socialRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  socialChip: {
    minHeight: 38,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(206,175,227,0.72)',
    backgroundColor: 'rgba(255, 244, 255, 0.86)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  socialIcon: {
    fontSize: 15,
    fontWeight: '900',
  },
  socialText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#564268',
  },
  heroCard: {
    minHeight: 146,
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
    backgroundColor: 'rgba(60, 40, 83, 0.22)',
  },
  linksCard: {
    backgroundColor: 'rgba(255, 249, 255, 0.94)',
    borderColor: 'rgba(209,183,227,0.68)',
  },
});
