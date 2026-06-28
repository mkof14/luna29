import React, { useEffect, useMemo, useState } from 'react';
import { ImageBackground, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { LunaButton } from '../components/LunaButton';
import { MobileScreenHeader } from '../components/MobileScreenHeader';
import { SurfaceCard } from '../components/SurfaceCard';
import { colors } from '../theme/tokens';
import { MobileLang, resolveLangBase } from '../i18n/mobileCopy';
import { loadSectionState, saveSectionState } from '../services/mobileState';

const phases = ['Follicular', 'Ovulatory', 'Luteal', 'Menstrual'];

export function BodyMapScreen({ onBack, lang }: { onBack: () => void; lang: MobileLang }) {
  const copy = {
    en: {
      title: 'Body Map',
      subtitle: 'Read your day through body signals.',
      hero: 'Cycle, energy, mood, and recovery in one calm map.',
      today: 'Today signals',
      cycle: 'Cycle',
      energy: 'Energy',
      mood: 'Mood',
      recovery: 'Recovery',
      action: 'Save body map note',
      share: 'Share my day card',
    },
    ru: {
      title: 'Body Map',
      subtitle: 'Считывайте день через сигналы тела.',
      hero: 'Цикл, энергия, настроение и восстановление в одной спокойной карте.',
      today: 'Сигналы сегодня',
      cycle: 'Цикл',
      energy: 'Энергия',
      mood: 'Настроение',
      recovery: 'Восстановление',
      action: 'Сохранить заметку карты тела',
      share: 'Поделиться карточкой дня',
    },
    es: {
      title: 'Body Map',
      subtitle: 'Lee tu dia a traves de senales del cuerpo.',
      hero: 'Ciclo, energia, estado de animo y recuperacion en un mapa tranquilo.',
      today: 'Senales de hoy',
      cycle: 'Ciclo',
      energy: 'Energia',
      mood: 'Animo',
      recovery: 'Recuperacion',
      action: 'Guardar nota del mapa corporal',
      share: 'Compartir tarjeta de mi dia',
    },
  }[resolveLangBase(lang)];

  const [phase, setPhase] = useState('Luteal');
  const [energy, setEnergy] = useState(36);
  const [mood, setMood] = useState(44);
  const [recovery, setRecovery] = useState(58);

  useEffect(() => {
    void (async () => {
      const loaded = await loadSectionState('body_map', { phase: 'Luteal', energy: 36, mood: 44, recovery: 58 });
      setPhase(typeof loaded.phase === 'string' ? loaded.phase : 'Luteal');
      setEnergy(typeof loaded.energy === 'number' ? loaded.energy : 36);
      setMood(typeof loaded.mood === 'number' ? loaded.mood : 44);
      setRecovery(typeof loaded.recovery === 'number' ? loaded.recovery : 58);
    })();
  }, []);

  useEffect(() => {
    void saveSectionState('body_map', { phase, energy, mood, recovery });
  }, [phase, energy, mood, recovery]);

  const summary = useMemo(() => {
    if (energy < 40) return 'Lower today';
    if (energy < 70) return 'Moderate';
    return 'Higher today';
  }, [energy]);

  const dayCard = `${copy.cycle}: Day 17 · ${phase}\n${copy.energy}: ${summary}\n${copy.mood}: ${mood}% steady\n${copy.recovery}: ${recovery}%`;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <MobileScreenHeader title={copy.title} subtitle={copy.subtitle} onBack={onBack} />

      <ImageBackground source={require('../../assets/bg-soft-3.webp')} imageStyle={styles.image} style={styles.hero}>
        <View style={styles.overlay}>
          <Text style={styles.heroText}>{copy.hero}</Text>
        </View>
      </ImageBackground>

      <SurfaceCard>
        <Text style={styles.cardTitle}>{copy.today}</Text>
        <View style={styles.pills}>
          {phases.map((item) => (
            <LunaButton key={item} variant={phase === item ? 'primary' : 'secondary'} onPress={() => setPhase(item)}>
              {item}
            </LunaButton>
          ))}
        </View>

        <View style={styles.metricRow}>
          <Text style={styles.label}>{copy.energy}</Text>
          <LunaButton variant="ghost" onPress={() => setEnergy((current) => Math.max(10, current - 5))}>-</LunaButton>
          <Text style={styles.value}>{energy}%</Text>
          <LunaButton variant="ghost" onPress={() => setEnergy((current) => Math.min(100, current + 5))}>+</LunaButton>
        </View>

        <View style={styles.metricRow}>
          <Text style={styles.label}>{copy.mood}</Text>
          <LunaButton variant="ghost" onPress={() => setMood((current) => Math.max(10, current - 5))}>-</LunaButton>
          <Text style={styles.value}>{mood}%</Text>
          <LunaButton variant="ghost" onPress={() => setMood((current) => Math.min(100, current + 5))}>+</LunaButton>
        </View>

        <View style={styles.metricRow}>
          <Text style={styles.label}>{copy.recovery}</Text>
          <LunaButton variant="ghost" onPress={() => setRecovery((current) => Math.max(10, current - 5))}>-</LunaButton>
          <Text style={styles.value}>{recovery}%</Text>
          <LunaButton variant="ghost" onPress={() => setRecovery((current) => Math.min(100, current + 5))}>+</LunaButton>
        </View>
      </SurfaceCard>

      <SurfaceCard style={styles.cardAlt}>
        <Text style={styles.label}>{copy.cycle}</Text>
        <Text style={styles.value}>Day 17 · {phase}</Text>
        <Text style={styles.text}>{copy.energy}: {summary}</Text>
        <View style={styles.stack}>
          <LunaButton variant="secondary" onPress={() => undefined}>{copy.action}</LunaButton>
          <LunaButton variant="secondary" onPress={() => void Share.share({ message: dayCard, title: 'My Day with Luna29' })}>
            {copy.share}
          </LunaButton>
        </View>
      </SurfaceCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  hero: { minHeight: 180, borderRadius: 22, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  image: { resizeMode: 'cover' },
  overlay: { flex: 1, backgroundColor: 'rgba(54, 39, 68, 0.3)', justifyContent: 'flex-end', padding: 14 },
  heroText: { color: '#fff', fontSize: 16, lineHeight: 22, fontWeight: '600' },
  cardTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  pills: { gap: 8 },
  metricRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { fontSize: 12, color: colors.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  value: { fontSize: 16, color: colors.textPrimary, fontWeight: '700' },
  text: { fontSize: 14, lineHeight: 21, color: colors.textSecondary },
  stack: { gap: 8 },
  cardAlt: { backgroundColor: 'rgba(248, 239, 255, 0.82)' },
});
