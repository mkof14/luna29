import React, { useEffect, useState } from 'react';
import { ImageBackground, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { LunaButton } from '../components/LunaButton';
import { MobileScreenHeader } from '../components/MobileScreenHeader';
import { SurfaceCard } from '../components/SurfaceCard';
import { colors } from '../theme/tokens';
import { MobileLang, resolveLangBase } from '../i18n/mobileCopy';
import { loadSectionState, saveSectionState } from '../services/mobileState';

export function CreativeStudioMobileScreen({ onBack, lang }: { onBack: () => void; lang: MobileLang }) {
  const copy = {
    en: { title: 'Creative Studio', subtitle: 'Turn feelings into short expressive notes.', placeholder: 'Write one honest line about your day...' },
    ru: { title: 'Creative Studio', subtitle: 'Преобразуйте ощущения в короткие выразительные заметки.', placeholder: 'Напишите одну честную строку о дне...' },
    es: { title: 'Creative Studio', subtitle: 'Convierte sensaciones en notas expresivas cortas.', placeholder: 'Escribe una linea honesta sobre tu dia...' },
  }[resolveLangBase(lang)];

  const [draft, setDraft] = useState('Today felt slower, but I stayed kind to myself.');
  const [saved, setSaved] = useState<string[]>([]);

  useEffect(() => {
    void (async () => {
      const loaded = await loadSectionState('creative_studio', {
        draft: 'Today felt slower, but I stayed kind to myself.',
        saved: [],
      });
      setDraft(typeof loaded.draft === 'string' ? loaded.draft : 'Today felt slower, but I stayed kind to myself.');
      setSaved(Array.isArray(loaded.saved) ? loaded.saved.filter((item) => typeof item === 'string').slice(0, 5) : []);
    })();
  }, []);

  useEffect(() => {
    void saveSectionState('creative_studio', { draft, saved });
  }, [draft, saved]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ImageBackground source={require('../../assets/bg-soft-1.webp')} imageStyle={styles.heroImage} style={styles.heroCard}>
        <MobileScreenHeader title={copy.title} subtitle={copy.subtitle} onBack={onBack} tone="light" />
      </ImageBackground>

      <SurfaceCard>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder={copy.placeholder}
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          multiline
        />
        <View style={styles.row}>
          <LunaButton
            variant="secondary"
            onPress={() => {
              if (!draft.trim()) return;
              setSaved((current) => [draft.trim(), ...current].slice(0, 5));
            }}
          >
            Save card
          </LunaButton>
          <LunaButton
            variant="secondary"
            onPress={() => {
              if (!draft.trim()) return;
              void Share.share({ message: draft.trim(), title: 'Luna29 mood card' });
            }}
          >
            Share card
          </LunaButton>
        </View>
      </SurfaceCard>

      {saved.length > 0 ? (
        <SurfaceCard style={styles.cardAlt}>
          <Text style={styles.cardTitle}>Saved mood cards</Text>
          {saved.map((item, index) => (
            <Text key={`${item}-${index}`} style={styles.item}>• {item}</Text>
          ))}
        </SurfaceCard>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  heroCard: { minHeight: 132, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, padding: 14, justifyContent: 'center' },
  heroImage: { resizeMode: 'cover' },
  input: {
    minHeight: 110,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardStrong,
    paddingHorizontal: 12,
    paddingTop: 10,
    textAlignVertical: 'top',
    color: colors.textPrimary,
    fontSize: 14,
  },
  row: { gap: 8 },
  cardTitle: { fontSize: 18, color: colors.textPrimary, fontWeight: '700' },
  item: { fontSize: 14, lineHeight: 20, color: colors.textSecondary },
  cardAlt: { backgroundColor: 'rgba(248, 239, 255, 0.82)' },
});
