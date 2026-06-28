import React, { useEffect, useState } from 'react';
import { ImageBackground, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { LunaButton } from '../components/LunaButton';
import { MobileScreenHeader } from '../components/MobileScreenHeader';
import { SurfaceCard } from '../components/SurfaceCard';
import { colors } from '../theme/tokens';
import { MobileLang, resolveLangBase } from '../i18n/mobileCopy';
import { loadSectionState, saveSectionState } from '../services/mobileState';

type VoiceItem = { id: string; label: string; text: string };

export function VoiceFilesMobileScreen({ onBack, lang }: { onBack: () => void; lang: MobileLang }) {
  const copy = {
    en: { title: 'My Voice Files', subtitle: 'Recent voice notes and continuity.' },
    ru: { title: 'Мои Voice Files', subtitle: 'Последние голосовые заметки и непрерывность.' },
    es: { title: 'Mis archivos de voz', subtitle: 'Notas de voz recientes y continuidad.' },
  }[resolveLangBase(lang)];

  const [items] = useState<VoiceItem[]>([
    { id: '1', label: 'Today', text: 'Work felt demanding.' },
    { id: '2', label: 'Yesterday', text: 'Energy felt calmer.' },
    { id: '3', label: '3 days ago', text: 'Sleep felt shorter.' },
  ]);
  const [activeId, setActiveId] = useState('1');

  useEffect(() => {
    void (async () => {
      const loaded = await loadSectionState('voice_files', { activeId: '1' });
      if (typeof loaded.activeId === 'string') {
        setActiveId(loaded.activeId);
      }
    })();
  }, []);

  useEffect(() => {
    void saveSectionState('voice_files', { activeId });
  }, [activeId]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ImageBackground source={require('../../assets/bg-soft-1.webp')} imageStyle={styles.heroImage} style={styles.heroCard}>
        <MobileScreenHeader title={copy.title} subtitle={copy.subtitle} onBack={onBack} tone="light" />
      </ImageBackground>

      <SurfaceCard>
        <View style={styles.stack}>
          {items.map((item) => (
            <View key={item.id} style={styles.entry}>
              <Text style={styles.entryLabel}>{item.label}</Text>
              <Text style={styles.entryText}>{item.text}</Text>
              <View style={styles.row}>
                <LunaButton variant={activeId === item.id ? 'primary' : 'secondary'} onPress={() => setActiveId(item.id)}>
                  {activeId === item.id ? 'Playing' : 'Play'}
                </LunaButton>
                <LunaButton variant="secondary" onPress={() => void Share.share({ message: `${item.label}: ${item.text}`, title: 'Luna29 voice note' })}>
                  Share
                </LunaButton>
              </View>
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
  stack: { gap: 8 },
  entry: { borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.cardStrong, padding: 10, gap: 6 },
  entryLabel: { fontSize: 12, letterSpacing: 0.4, color: colors.textMuted, fontWeight: '700' },
  entryText: { fontSize: 15, lineHeight: 21, color: colors.textPrimary, fontWeight: '600' },
  row: { gap: 8 },
});
