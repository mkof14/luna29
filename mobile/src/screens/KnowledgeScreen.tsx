import React, { useMemo, useState } from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { LunaButton } from '../components/LunaButton';
import { MobileScreenHeader } from '../components/MobileScreenHeader';
import { SurfaceCard } from '../components/SurfaceCard';
import { colors } from '../theme/tokens';
import { MobileLang, resolveLangBase } from '../i18n/mobileCopy';

const topics = {
  en: [
    { title: 'Cycle rhythm', body: 'Understand how phases can change energy and sensitivity.' },
    { title: 'Sleep and mood', body: 'Short sleep often makes the next day feel heavier.' },
    { title: 'Stress signals', body: 'Learn your personal early signs before overload.' },
    { title: 'Voice notes', body: 'Your words help Luna29 understand what matters today.' },
  ],
  ru: [
    { title: 'Ритм цикла', body: 'Понимайте, как фазы влияют на энергию и чувствительность.' },
    { title: 'Сон и настроение', body: 'Короткий сон часто делает следующий день тяжелее.' },
    { title: 'Сигналы стресса', body: 'Замечайте ранние личные сигналы до перегруза.' },
    { title: 'Голосовые заметки', body: 'Ваши слова помогают Luna29 понять, что важно сегодня.' },
  ],
  es: [
    { title: 'Ritmo del ciclo', body: 'Entiende como las fases cambian energia y sensibilidad.' },
    { title: 'Sueno y animo', body: 'Dormir poco suele hacer el siguiente dia mas pesado.' },
    { title: 'Senales de estres', body: 'Aprende tus signos tempranos antes de la sobrecarga.' },
    { title: 'Notas de voz', body: 'Tus palabras ayudan a Luna29 a entender lo importante hoy.' },
  ],
};

export function KnowledgeScreen({ onBack, lang }: { onBack: () => void; lang: MobileLang }) {
  const head = {
    en: { title: 'Knowledge', subtitle: 'Clear guidance without overload.', search: 'Search topic...' },
    ru: { title: 'Knowledge', subtitle: 'Понятные ориентиры без перегруза.', search: 'Поиск темы...' },
    es: { title: 'Knowledge', subtitle: 'Guia clara sin sobrecarga.', search: 'Buscar tema...' },
  }[resolveLangBase(lang)];

  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const list = topics[resolveLangBase(lang)];
    if (!query.trim()) return list;
    return list.filter((topic) => `${topic.title} ${topic.body}`.toLowerCase().includes(query.toLowerCase()));
  }, [lang, query]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ImageBackground source={require('../../assets/bg-soft-3.webp')} imageStyle={styles.heroImage} style={styles.heroCard}>
        <View style={styles.heroOverlay}>
          <MobileScreenHeader title={head.title} subtitle={head.subtitle} onBack={onBack} tone="light" />
        </View>
      </ImageBackground>

      <SurfaceCard>
        <TextInput value={query} onChangeText={setQuery} placeholder={head.search} placeholderTextColor={colors.textMuted} style={styles.input} />
      </SurfaceCard>

      {filtered.map((topic, index) => (
        <SurfaceCard key={topic.title} style={index % 2 === 0 ? styles.cardA : styles.cardB}>
          <Text style={styles.cardTitle}>{topic.title}</Text>
          {expanded === topic.title ? <Text style={styles.text}>{topic.body}</Text> : null}
          <LunaButton variant="secondary" onPress={() => setExpanded((current) => (current === topic.title ? null : topic.title))}>
            {expanded === topic.title ? 'Hide details' : 'Read details'}
          </LunaButton>
        </SurfaceCard>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  heroCard: { minHeight: 130, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  heroImage: { resizeMode: 'cover' },
  heroOverlay: { flex: 1, padding: 14, backgroundColor: 'rgba(58, 38, 80, 0.26)', justifyContent: 'center' },
  input: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardStrong,
    paddingHorizontal: 12,
    color: colors.textPrimary,
    fontSize: 14,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  text: { fontSize: 15, lineHeight: 22, color: colors.textSecondary },
  cardA: { backgroundColor: 'rgba(255, 248, 255, 0.86)' },
  cardB: { backgroundColor: 'rgba(244, 236, 252, 0.84)' },
});
