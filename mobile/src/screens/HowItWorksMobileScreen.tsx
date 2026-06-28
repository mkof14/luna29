import React from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MobileScreenHeader } from '../components/MobileScreenHeader';
import { SurfaceCard } from '../components/SurfaceCard';
import { colors } from '../theme/tokens';
import { MobileLang, resolveLangBase } from '../i18n/mobileCopy';

export function HowItWorksMobileScreen({ onBack, lang }: { onBack: () => void; lang: MobileLang }) {
  const copy = {
    en: { title: 'How Luna29 works', subtitle: 'Open, reflect, receive, continue.', steps: ['Open Luna29', 'Speak or quick check-in', 'Receive reflection', 'See rhythm context'] },
    ru: { title: 'Как работает Luna29', subtitle: 'Открыть, отразить, получить, продолжить.', steps: ['Открыть Luna29', 'Голос или быстрый check-in', 'Получить отражение', 'Посмотреть ритм'] },
    es: { title: 'Como funciona Luna29', subtitle: 'Abrir, reflejar, recibir, continuar.', steps: ['Abrir Luna29', 'Hablar o check-in rapido', 'Recibir reflexion', 'Ver contexto del ritmo'] },
  }[resolveLangBase(lang)];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ImageBackground source={require('../../assets/bg-soft-2.webp')} imageStyle={styles.heroImage} style={styles.heroCard}>
        <MobileScreenHeader title={copy.title} subtitle={copy.subtitle} onBack={onBack} tone="light" />
      </ImageBackground>
      <SurfaceCard>
        <View style={styles.stack}>{copy.steps.map((step) => <Text key={step} style={styles.item}>• {step}</Text>)}</View>
      </SurfaceCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  heroCard: { minHeight: 132, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, padding: 14, justifyContent: 'center' },
  heroImage: { resizeMode: 'cover' },
  stack: { gap: 8 },
  item: { fontSize: 15, lineHeight: 22, color: colors.textSecondary },
});
