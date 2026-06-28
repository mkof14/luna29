import React from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MobileScreenHeader } from '../components/MobileScreenHeader';
import { SurfaceCard } from '../components/SurfaceCard';
import { colors } from '../theme/tokens';
import { MobileLang, resolveLangBase } from '../i18n/mobileCopy';

export function AboutLunaMobileScreen({ onBack, lang }: { onBack: () => void; lang: MobileLang }) {
  const copy = {
    en: {
      title: 'About Luna29',
      subtitle: 'A calm daily companion for women.',
      body:
        'Luna29 helps you understand your day through body rhythm, daily signals, and voice notes. The goal is a simple daily habit that feels personal and supportive.',
      pillars: ['Your Body', 'Your Senses', 'Your Words'],
    },
    ru: {
      title: 'О Luna29',
      subtitle: 'Спокойный ежедневный companion для женщин.',
      body:
        'Luna29 помогает понимать день через ритм тела, сигналы и голосовые заметки. Цель — простой ежедневный ритуал с персональной поддержкой.',
      pillars: ['Ваше тело', 'Ваши ощущения', 'Ваши слова'],
    },
    es: {
      title: 'Acerca de Luna29',
      subtitle: 'Una companera diaria y calmada para mujeres.',
      body:
        'Luna29 te ayuda a entender tu dia con ritmo corporal, senales diarias y notas de voz. El objetivo es un habito diario simple y personal.',
      pillars: ['Tu cuerpo', 'Tus sensaciones', 'Tus palabras'],
    },
  }[resolveLangBase(lang)];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ImageBackground source={require('../../assets/bg-soft-1.webp')} imageStyle={styles.heroImage} style={styles.heroCard}>
        <MobileScreenHeader title={copy.title} subtitle={copy.subtitle} onBack={onBack} tone="light" />
      </ImageBackground>
      <SurfaceCard>
        <Text style={styles.text}>{copy.body}</Text>
      </SurfaceCard>
      <SurfaceCard style={styles.cardAlt}>
        <Text style={styles.cardTitle}>Luna29 foundation</Text>
        <View style={styles.row}>
          {copy.pillars.map((pillar) => (
            <View key={pillar} style={styles.pill}>
              <Text style={styles.pillText}>{pillar}</Text>
            </View>
          ))}
        </View>
      </SurfaceCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  heroCard: { minHeight: 132, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, padding: 14, justifyContent: 'center' },
  heroImage: { resizeMode: 'cover' },
  text: { fontSize: 15, lineHeight: 22, color: colors.textSecondary },
  cardTitle: { fontSize: 18, color: colors.textPrimary, fontWeight: '700' },
  row: { gap: 8 },
  pill: { borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.cardStrong, paddingHorizontal: 10, paddingVertical: 9 },
  pillText: { fontSize: 14, color: colors.textPrimary, fontWeight: '700' },
  cardAlt: { backgroundColor: 'rgba(248, 239, 255, 0.82)' },
});
