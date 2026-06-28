import React from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MobileScreenHeader } from '../components/MobileScreenHeader';
import { SurfaceCard } from '../components/SurfaceCard';
import { defaultContextSignal } from '../data/mockData';
import { colors } from '../theme/tokens';
import { BaseMobileLang, MobileLang, resolveLangBase } from '../i18n/mobileCopy';

const copyByLang: Record<BaseMobileLang, Record<string, string>> = {
  en: {
    title: 'Rhythm',
    subtitle: 'A calm view of your cycle, energy, mood, and sleep trends.',
    todayRhythm: 'Today rhythm',
    cycle: 'Cycle',
    energy: 'Energy',
    mood: 'Mood',
    sleep: 'Sleep',
    patternTitle: 'Something Luna29 is starting to notice',
    stage1: 'Today may feel slower because sleep was shorter.',
    stage2: 'Energy often drops when sleep is shorter.',
    stage3a: 'Your energy tends to dip before your cycle.',
    stage3b: 'Sleep affects mood during the week.',
  },
  ru: {
    title: 'Ритм',
    subtitle: 'Спокойный взгляд на цикл, энергию, настроение и сон.',
    todayRhythm: 'Ритм сегодня',
    cycle: 'Цикл',
    energy: 'Энергия',
    mood: 'Настроение',
    sleep: 'Сон',
    patternTitle: 'Что Luna29 начинает замечать',
    stage1: 'Сегодня может ощущаться медленнее, потому что сон был короче.',
    stage2: 'Энергия часто снижается, когда сон короче.',
    stage3a: 'Энергия обычно снижается перед циклом.',
    stage3b: 'Сон влияет на настроение в течение недели.',
  },
  es: {
    title: 'Ritmo',
    subtitle: 'Una vista tranquila de tu ciclo, energia, estado y sueno.',
    todayRhythm: 'Ritmo de hoy',
    cycle: 'Ciclo',
    energy: 'Energia',
    mood: 'Estado',
    sleep: 'Sueno',
    patternTitle: 'Algo que Luna29 empieza a notar',
    stage1: 'Hoy puede sentirse mas lento porque dormiste menos.',
    stage2: 'La energia suele bajar cuando duermes menos.',
    stage3a: 'Tu energia tiende a bajar antes del ciclo.',
    stage3b: 'El sueno afecta el estado durante la semana.',
  },
};

export function RhythmScreen({ stage, onBack, lang }: { stage: 1 | 2 | 3; onBack?: () => void; lang: MobileLang }) {
  const copy = copyByLang[resolveLangBase(lang)];
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ImageBackground source={require('../../assets/bg-soft-2.webp')} imageStyle={styles.heroImage} style={styles.heroCard}>
        <View style={styles.heroOverlay}>
          <MobileScreenHeader title={copy.title} subtitle={copy.subtitle} onBack={onBack} tone="light" />
        </View>
      </ImageBackground>

      <SurfaceCard>
        <Text style={styles.cardTitle}>{copy.todayRhythm}</Text>
        <View style={styles.row}><Text style={styles.label}>{copy.cycle}</Text><Text style={styles.value}>{defaultContextSignal.cycle}</Text></View>
        <View style={styles.row}><Text style={styles.label}>{copy.energy}</Text><Text style={styles.value}>{defaultContextSignal.energy}</Text></View>
        <View style={styles.row}><Text style={styles.label}>{copy.mood}</Text><Text style={styles.value}>{defaultContextSignal.mood}</Text></View>
        <View style={styles.row}><Text style={styles.label}>{copy.sleep}</Text><Text style={styles.value}>{defaultContextSignal.sleep}</Text></View>
      </SurfaceCard>

      <SurfaceCard style={styles.insightCard}>
        <Text style={styles.cardTitle}>{copy.patternTitle}</Text>
        {stage === 1 ? <Text style={styles.text}>{copy.stage1}</Text> : null}
        {stage === 2 ? <Text style={styles.text}>{copy.stage2}</Text> : null}
        {stage === 3 ? (
          <View style={styles.stack}>
            <Text style={styles.text}>{copy.stage3a}</Text>
            <Text style={styles.text}>{copy.stage3b}</Text>
          </View>
        ) : null}
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#4a3960',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(215,188,234,0.72)',
    backgroundColor: 'rgba(249, 238, 252, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  label: {
    fontSize: 14,
    color: '#8a769f',
    fontWeight: '800',
  },
  value: {
    fontSize: 14,
    color: '#4e3d66',
    fontWeight: '700',
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    color: '#665775',
  },
  stack: {
    gap: 8,
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
    backgroundColor: 'rgba(61, 41, 87, 0.2)',
  },
  insightCard: {
    backgroundColor: 'rgba(244, 236, 253, 0.9)',
    borderColor: 'rgba(209,183,227,0.68)',
  },
});
