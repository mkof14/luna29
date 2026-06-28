import React from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MobileScreenHeader } from '../components/MobileScreenHeader';
import { SurfaceCard } from '../components/SurfaceCard';
import { colors } from '../theme/tokens';
import { MobileLang, resolveLangBase } from '../i18n/mobileCopy';

export function PartnerFAQMobileScreen({ onBack, lang }: { onBack: () => void; lang: MobileLang }) {
  const copy = {
    en: {
      title: 'Partner FAQ',
      subtitle: 'Simple answers for close support.',
      items: [
        {
          q: 'What is the best way to support her tonight?',
          a: 'Start with calm language. Ask what feels heavy and what might help right now.',
        },
        {
          q: 'How often should we use Luna29 together?',
          a: 'A short evening check-in is enough. Consistency is more important than volume.',
        },
        {
          q: 'How do we avoid conflict when energy is low?',
          a: 'Use bridge messages. Keep wording simple, kind, and specific to today.',
        },
        {
          q: 'What should I avoid saying on hard days?',
          a: 'Avoid fixing mode. Start with listening and gentle validation.',
        },
        {
          q: 'How can I use Luna29 with her daily?',
          a: 'Do one short evening check-in together and keep the tone calm.',
        },
      ],
    },
    ru: {
      title: 'Partner FAQ',
      subtitle: 'Простые ответы для близкой поддержки.',
      items: [
        { q: 'Как лучше поддержать ее сегодня?', a: 'Начните со спокойных слов. Спросите, что сейчас ощущается тяжелым.' },
        { q: 'Как часто использовать Luna29 вместе?', a: 'Достаточно короткой вечерней проверки. Регулярность важнее объема.' },
        { q: 'Как избегать конфликта при низкой энергии?', a: 'Используйте bridge-сообщения: коротко, мягко и по сути дня.' },
        { q: 'Чего лучше избегать в тяжелый день?', a: 'Не переходите в режим “исправить все”. Сначала выслушайте и поддержите.' },
        { q: 'Как использовать Luna29 вместе каждый день?', a: 'Делайте один короткий вечерний check-in в спокойном тоне.' },
      ],
    },
    es: {
      title: 'Partner FAQ',
      subtitle: 'Respuestas simples para apoyo cercano.',
      items: [
        { q: 'Cual es la mejor forma de apoyarla hoy?', a: 'Empieza con lenguaje calmado. Pregunta que se siente mas pesado.' },
        { q: 'Con que frecuencia usar Luna29 juntos?', a: 'Un check-in corto por la noche es suficiente.' },
        { q: 'Como evitar conflicto con energia baja?', a: 'Usa mensajes bridge: simples, amables y concretos.' },
        { q: 'Que evitar en un dia dificil?', a: 'Evita el modo de “arreglar todo”. Primero escucha y valida.' },
        { q: 'Como usar Luna29 juntos cada dia?', a: 'Haz un check-in breve por la noche y mantiene tono calmado.' },
      ],
    },
  }[resolveLangBase(lang)];
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ImageBackground source={require('../../assets/bg-soft-2.webp')} imageStyle={styles.heroImage} style={styles.heroCard}>
        <View style={styles.heroOverlay}>
          <MobileScreenHeader title={copy.title} subtitle={copy.subtitle} onBack={onBack} tone="light" />
        </View>
      </ImageBackground>
      {copy.items.map((item) => (
        <SurfaceCard key={item.q} style={styles.faqCard}>
          <Text style={styles.q}>{item.q}</Text>
          <Text style={styles.a}>{item.a}</Text>
        </SurfaceCard>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  heroCard: { minHeight: 130, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  heroImage: { resizeMode: 'cover' },
  heroOverlay: { flex: 1, padding: 14, backgroundColor: 'rgba(61, 41, 88, 0.27)', justifyContent: 'center' },
  q: { fontSize: 17, lineHeight: 23, color: colors.textPrimary, fontWeight: '700' },
  a: { fontSize: 15, lineHeight: 22, color: colors.textSecondary },
  faqCard: {
    backgroundColor: 'rgba(255, 248, 255, 0.84)',
  },
});
