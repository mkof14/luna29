import React, { useEffect, useMemo, useState } from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { LunaButton } from '../components/LunaButton';
import { MobileScreenHeader } from '../components/MobileScreenHeader';
import { SurfaceCard } from '../components/SurfaceCard';
import { colors } from '../theme/tokens';
import { BaseMobileLang, MobileLang, resolveLangBase } from '../i18n/mobileCopy';

const copyByLang: Record<BaseMobileLang, Record<string, string>> = {
  en: {
    headerTitle: 'Speak freely. Luna29 is listening.',
    headerSubtitle: 'There is no right way to say it. A few honest words are enough.',
    title: 'Voice Reflection',
    text: 'Record a short reflection about how you feel and what happened during your day.',
    recording: 'Recording',
    ready: 'Ready',
    note: '30-60 seconds is enough.',
    startWith: 'You can start with:',
    placeholder: 'Add a short line if you want...',
    tap: 'Tap to record',
    stop: 'Stop',
    finish: 'Finish',
    back: 'Back',
    fallback: 'You shared that the day felt full and emotionally heavy.',
  },
  ru: {
    headerTitle: 'Говорите свободно. Luna29 слушает.',
    headerSubtitle: 'Нет правильного способа это сказать. Достаточно нескольких честных слов.',
    title: 'Голосовая заметка',
    text: 'Запишите короткое отражение о том, как вы себя чувствуете и что происходило сегодня.',
    recording: 'Запись',
    ready: 'Готово',
    note: '30-60 секунд достаточно.',
    startWith: 'Можно начать с:',
    placeholder: 'Добавьте короткую строку, если хотите...',
    tap: 'Начать запись',
    stop: 'Стоп',
    finish: 'Завершить',
    back: 'Назад',
    fallback: 'Вы поделились, что день был насыщенным и эмоционально тяжелым.',
  },
  es: {
    headerTitle: 'Habla libremente. Luna29 esta escuchando.',
    headerSubtitle: 'No hay una forma correcta de decirlo. Unas palabras honestas son suficientes.',
    title: 'Nota de voz',
    text: 'Graba una breve reflexion sobre como te sentiste y que paso durante tu dia.',
    recording: 'Grabando',
    ready: 'Lista',
    note: '30-60 segundos son suficientes.',
    startWith: 'Puedes empezar con:',
    placeholder: 'Agrega una linea corta si quieres...',
    tap: 'Tocar para grabar',
    stop: 'Detener',
    finish: 'Finalizar',
    back: 'Atras',
    fallback: 'Compartiste que el dia se sintio intenso y emocionalmente pesado.',
  },
};

const promptsByLang: Record<BaseMobileLang, string[]> = {
  en: ['What felt heavy today?', 'What felt easier than expected?', 'What is still on your mind?', 'How does your body feel tonight?'],
  ru: ['Что сегодня ощущалось тяжелым?', 'Что оказалось легче, чем ожидалось?', 'Что все еще у вас в мыслях?', 'Как ваше тело ощущается сегодня вечером?'],
  es: ['Que se sintio pesado hoy?', 'Que se sintio mas facil de lo esperado?', 'Que sigue en tu mente?', 'Como se siente tu cuerpo esta noche?'],
};

export function VoiceReflectionScreen({
  onBack,
  onFinish,
  lang,
}: {
  onBack: () => void;
  onFinish: (entryText: string) => void;
  lang: MobileLang;
}) {
  const baseLang = resolveLangBase(lang);
  const copy = copyByLang[baseLang];
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [note, setNote] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState('');

  const promptSuggestions = promptsByLang[baseLang];

  useEffect(() => {
    if (!recording) return;
    const id = setInterval(() => {
      setSeconds((current) => {
        if (current >= 60) {
          setRecording(false);
          return 60;
        }
        return current + 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [recording]);

  const waveform = useMemo(() => {
    const amplitude = recording ? (seconds % 8) + 4 : 2;
    return new Array(12).fill(null).map((_, index) => {
      const relative = ((index + amplitude) % 6) + 1;
      return relative;
    });
  }, [recording, seconds]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ImageBackground source={require('../../assets/bg-soft-3.webp')} imageStyle={styles.leadImage} style={styles.leadCard}>
        <View style={styles.leadTint}>
          <MobileScreenHeader
            title={copy.headerTitle}
            subtitle={copy.headerSubtitle}
            onBack={onBack}
            tone="light"
          />
        </View>
      </ImageBackground>

      <SurfaceCard style={styles.heroCard}>
        <Text style={styles.cardTitle}>{copy.title}</Text>
        <Text style={styles.text}>{copy.text}</Text>
        <View style={[styles.recordOrb, recording && styles.recordOrbActive]}>
          <Text style={styles.recordOrbLabel}>{recording ? copy.recording : copy.ready}</Text>
          <Text style={styles.timer}>{String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}</Text>
        </View>
        <View style={styles.waveWrap}>
          {waveform.map((bar, index) => (
            <View key={index} style={[styles.waveBar, { height: 6 + bar * 4, opacity: recording ? 0.9 : 0.35 }]} />
          ))}
        </View>
        <Text style={styles.textMuted}>{copy.note}</Text>

        <View style={styles.promptWrap}>
          <Text style={styles.promptLabel}>{copy.startWith}</Text>
          <View style={styles.promptRow}>
            {promptSuggestions.map((prompt) => (
              <LunaButton
                key={prompt}
                variant={selectedPrompt === prompt ? 'primary' : 'secondary'}
                onPress={() => setSelectedPrompt(prompt)}
              >
                {prompt}
              </LunaButton>
            ))}
          </View>
        </View>

        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder={copy.placeholder}
          placeholderTextColor={colors.textMuted}
          multiline
          style={styles.input}
        />

        <View style={styles.actionsRow}>
          {!recording ? (
            <LunaButton onPress={() => setRecording(true)}>{copy.tap}</LunaButton>
          ) : (
            <LunaButton variant="danger" onPress={() => setRecording(false)}>{copy.stop}</LunaButton>
          )}
          <LunaButton
            variant="secondary"
            onPress={() => {
              const candidate = note.trim() || selectedPrompt || copy.fallback;
              onFinish(candidate);
            }}
          >
            {copy.finish}
          </LunaButton>
          <LunaButton variant="ghost" onPress={onBack}>{copy.back}</LunaButton>
        </View>
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
  heroCard: {
    gap: 12,
    backgroundColor: 'rgba(255, 249, 255, 0.94)',
    borderColor: 'rgba(209,183,227,0.68)',
  },
  leadCard: {
    minHeight: 156,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(198, 165, 223, 0.58)',
  },
  leadImage: {
    resizeMode: 'cover',
  },
  leadTint: {
    flex: 1,
    padding: 16,
    backgroundColor: 'rgba(56, 40, 88, 0.22)',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#4a3960',
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    color: '#665775',
  },
  textMuted: {
    fontSize: 13,
    color: '#8a769f',
    fontWeight: '600',
  },
  recordOrb: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(215,188,234,0.72)',
    backgroundColor: 'rgba(249,238,252,0.92)',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  recordOrbActive: {
    borderColor: colors.danger,
    backgroundColor: '#ffe4ef',
    shadowColor: '#c66085',
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  recordOrbLabel: {
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#8a769f',
    fontWeight: '700',
  },
  timer: {
    fontSize: 20,
    fontWeight: '800',
    color: '#4e3d66',
    marginTop: 2,
  },
  waveWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 5,
    minHeight: 32,
  },
  waveBar: {
    width: 8,
    borderRadius: 99,
    backgroundColor: colors.accent,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  promptWrap: {
    gap: 8,
  },
  promptLabel: {
    fontSize: 14,
    color: '#5f4f73',
    fontWeight: '700',
  },
  promptRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  input: {
    minHeight: 92,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(215,188,234,0.72)',
    backgroundColor: 'rgba(249, 238, 252, 0.92)',
    color: '#4a3960',
    paddingHorizontal: 12,
    paddingVertical: 10,
    textAlignVertical: 'top',
    fontSize: 15,
    lineHeight: 21,
  },
});
