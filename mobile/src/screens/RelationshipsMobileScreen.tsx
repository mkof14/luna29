import React, { useEffect, useMemo, useState } from 'react';
import { ImageBackground, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { LunaButton } from '../components/LunaButton';
import { MobileScreenHeader } from '../components/MobileScreenHeader';
import { SurfaceCard } from '../components/SurfaceCard';
import { colors } from '../theme/tokens';
import { MobileLang, resolveLangBase } from '../i18n/mobileCopy';
import { loadSectionState, saveSectionState } from '../services/mobileState';

export function RelationshipsMobileScreen({ onBack, lang }: { onBack: () => void; lang: MobileLang }) {
  const copy = {
    en: {
      title: 'Relationships',
      subtitle: 'Calm communication for close connection.',
      prompts: ['What felt heavy today?', 'What support do you need tonight?', 'What would make this evening gentler?'],
      message: 'Explain today to my partner',
      note: 'Use short, warm, concrete language.',
    },
    ru: {
      title: 'Отношения',
      subtitle: 'Спокойная коммуникация для близости.',
      prompts: ['Что сегодня было тяжёлым?', 'Какая поддержка нужна сегодня вечером?', 'Что сделает вечер мягче?'],
      message: 'Объяснить день партнеру',
      note: 'Используйте короткий, тёплый и конкретный язык.',
    },
    es: {
      title: 'Relaciones',
      subtitle: 'Comunicacion calmada para cercania.',
      prompts: ['Que se sintio pesado hoy?', 'Que apoyo necesitas esta noche?', 'Que haria la noche mas suave?'],
      message: 'Explicar hoy a mi pareja',
      note: 'Usa lenguaje corto, calido y concreto.',
    },
  }[resolveLangBase(lang)];

  const [selectedPrompt, setSelectedPrompt] = useState(copy.prompts[0]);

  useEffect(() => {
    void (async () => {
      const loaded = await loadSectionState('relationships', { selectedPrompt: copy.prompts[0] });
      if (typeof loaded.selectedPrompt === 'string' && copy.prompts.includes(loaded.selectedPrompt)) {
        setSelectedPrompt(loaded.selectedPrompt);
      }
    })();
  }, [copy.prompts]);

  useEffect(() => {
    void saveSectionState('relationships', { selectedPrompt });
  }, [selectedPrompt]);

  const partnerMessage = useMemo(
    () =>
      [
        'Today my energy may be lower.',
        'Sleep was shorter and sensitivity feels higher.',
        'A calm evening and gentle communication would help.',
      ].join('\n'),
    [],
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ImageBackground source={require('../../assets/bg-soft-2.webp')} imageStyle={styles.heroImage} style={styles.heroCard}>
        <MobileScreenHeader title={copy.title} subtitle={copy.subtitle} onBack={onBack} tone="light" />
      </ImageBackground>

      <SurfaceCard>
        <Text style={styles.text}>{copy.note}</Text>
        <View style={styles.stack}>
          {copy.prompts.map((prompt) => (
            <LunaButton key={prompt} variant={selectedPrompt === prompt ? 'primary' : 'secondary'} onPress={() => setSelectedPrompt(prompt)}>
              {prompt}
            </LunaButton>
          ))}
        </View>
      </SurfaceCard>

      <SurfaceCard style={styles.cardAlt}>
        <Text style={styles.cardTitle}>Bridge message</Text>
        <Text style={styles.text}>{selectedPrompt}</Text>
        <Text style={styles.text}>{partnerMessage}</Text>
        <LunaButton
          variant="secondary"
          onPress={() => {
            void Share.share({ message: `${selectedPrompt}\n\n${partnerMessage}`, title: 'Luna29 partner message' });
          }}
        >
          {copy.message}
        </LunaButton>
      </SurfaceCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  heroCard: { minHeight: 132, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, padding: 14, justifyContent: 'center' },
  heroImage: { resizeMode: 'cover' },
  cardTitle: { fontSize: 18, color: colors.textPrimary, fontWeight: '700' },
  text: { fontSize: 15, lineHeight: 22, color: colors.textSecondary },
  stack: { gap: 8 },
  cardAlt: { backgroundColor: 'rgba(248, 239, 255, 0.82)' },
});
