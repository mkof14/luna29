import React from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MobileScreenHeader } from '../components/MobileScreenHeader';
import { SurfaceCard } from '../components/SurfaceCard';
import { StoryEntry } from '../types';
import { colors } from '../theme/tokens';
import { BaseMobileLang, MobileLang, resolveLangBase } from '../i18n/mobileCopy';

const copyByLang: Record<BaseMobileLang, Record<string, string>> = {
  en: {
    title: 'Your story with Luna29',
    subtitle: 'A short thread from your latest reflections.',
    empty: 'Your story with Luna29 is just beginning.',
  },
  ru: {
    title: 'Ваша история с Luna29',
    subtitle: 'Короткая нить ваших последних заметок.',
    empty: 'Ваша история с Luna29 только начинается.',
  },
  es: {
    title: 'Tu historia con Luna29',
    subtitle: 'Un hilo corto de tus reflexiones recientes.',
    empty: 'Tu historia con Luna29 recien comienza.',
  },
};

export function YourStoryScreen({ entries, onBack, lang }: { entries: StoryEntry[]; onBack?: () => void; lang: MobileLang }) {
  const copy = copyByLang[resolveLangBase(lang)];
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ImageBackground source={require('../../assets/bg-soft-1.webp')} imageStyle={styles.heroImage} style={styles.heroCard}>
        <View style={styles.heroOverlay}>
          <MobileScreenHeader title={copy.title} subtitle={copy.subtitle} onBack={onBack} tone="light" />
        </View>
      </ImageBackground>
      <SurfaceCard style={styles.storyCard}>
        {entries.length === 0 ? (
          <Text style={styles.empty}>{copy.empty}</Text>
        ) : (
          entries.slice(0, 4).map((entry, index) => (
            <View key={entry.id} style={[styles.item, index === Math.min(entries.length, 4) - 1 && styles.lastItem]}>
              <Text style={styles.itemLabel}>{entry.label}</Text>
              <Text style={styles.itemText}>{entry.text}</Text>
            </View>
          ))
        )}
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
  subtitle: {
    display: 'none',
  },
  item: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(220,196,235,0.78)',
    paddingBottom: 12,
    marginBottom: 12,
    gap: 4,
  },
  lastItem: {
    borderBottomWidth: 0,
    marginBottom: 0,
    paddingBottom: 0,
  },
  itemLabel: {
    fontSize: 12,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: '#8a769f',
    fontWeight: '800',
  },
  itemText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#4a3960',
    fontWeight: '500',
  },
  empty: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  heroCard: {
    minHeight: 144,
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
    backgroundColor: 'rgba(60, 41, 84, 0.22)',
  },
  storyCard: {
    backgroundColor: 'rgba(255, 249, 255, 0.94)',
    borderColor: 'rgba(209,183,227,0.68)',
  },
});
