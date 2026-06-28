import React, { useEffect, useMemo, useState } from 'react';
import { ImageBackground, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { LunaButton } from '../components/LunaButton';
import { MobileScreenHeader } from '../components/MobileScreenHeader';
import { SurfaceCard } from '../components/SurfaceCard';
import { colors } from '../theme/tokens';
import { MobileLang, resolveLangBase } from '../i18n/mobileCopy';
import { loadSectionState, saveSectionState } from '../services/mobileState';

export function BridgeMobileScreen({
  onBack,
  onOpenVoice,
  lang,
}: {
  onBack: () => void;
  onOpenVoice: () => void;
  lang: MobileLang;
}) {
  const copy = {
    en: {
      title: 'The Bridge',
      subtitle: 'Find calm words for your state.',
      hero: 'For yourself first. And if you choose, for someone close to you.',
      card: 'Partner message',
      msg: 'Today my energy may be lower. I slept less last night and need a gentler pace this evening.',
      create: 'Create message from voice note',
      share: 'Explain today to my partner',
    },
    ru: {
      title: 'The Bridge',
      subtitle: 'Находите спокойные слова для своего состояния.',
      hero: 'Сначала для себя. И, если хотите, для близкого человека.',
      card: 'Сообщение для партнера',
      msg: 'Сегодня у меня может быть меньше энергии. Я спала меньше и мне нужен более спокойный вечер.',
      create: 'Создать сообщение из голосовой заметки',
      share: 'Объяснить сегодняшний день партнеру',
    },
    es: {
      title: 'The Bridge',
      subtitle: 'Encuentra palabras calmadas para tu estado.',
      hero: 'Primero para ti. Y, si quieres, para alguien cercano.',
      card: 'Mensaje para pareja',
      msg: 'Hoy mi energia puede estar mas baja. Dormi menos y necesito una tarde mas suave.',
      create: 'Crear mensaje desde nota de voz',
      share: 'Explicar hoy a mi pareja',
    },
  }[resolveLangBase(lang)];

  const [tone, setTone] = useState<'soft' | 'direct' | 'supportive'>('soft');
  const [context, setContext] = useState('Work pressure and short sleep.');

  useEffect(() => {
    void (async () => {
      const loaded = await loadSectionState('bridge', { tone: 'soft', context: 'Work pressure and short sleep.' });
      const nextTone = loaded.tone === 'direct' || loaded.tone === 'supportive' ? loaded.tone : 'soft';
      setTone(nextTone);
      setContext(typeof loaded.context === 'string' && loaded.context.trim() ? loaded.context : 'Work pressure and short sleep.');
    })();
  }, []);

  useEffect(() => {
    void saveSectionState('bridge', { tone, context });
  }, [tone, context]);

  const partnerMessage = useMemo(() => {
    if (tone === 'direct') {
      return `Today I may be lower in energy. ${context} Please keep plans simple tonight.`;
    }
    if (tone === 'supportive') {
      return `I need a little more support tonight. ${context} A calm evening would help me recover.`;
    }
    return `${copy.msg} ${context}`;
  }, [context, copy.msg, tone]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <MobileScreenHeader title={copy.title} subtitle={copy.subtitle} onBack={onBack} />

      <ImageBackground source={require('../../assets/bg-soft-2.webp')} imageStyle={styles.image} style={styles.hero}>
        <View style={styles.overlay}>
          <Text style={styles.heroText}>{copy.hero}</Text>
        </View>
      </ImageBackground>

      <SurfaceCard>
        <Text style={styles.cardTitle}>{copy.card}</Text>
        <View style={styles.row}>
          <LunaButton variant={tone === 'soft' ? 'primary' : 'secondary'} onPress={() => setTone('soft')}>Soft</LunaButton>
          <LunaButton variant={tone === 'direct' ? 'primary' : 'secondary'} onPress={() => setTone('direct')}>Direct</LunaButton>
          <LunaButton variant={tone === 'supportive' ? 'primary' : 'secondary'} onPress={() => setTone('supportive')}>Supportive</LunaButton>
        </View>
        <TextInput value={context} onChangeText={setContext} placeholder="Extra context" placeholderTextColor={colors.textMuted} style={styles.input} />
        <Text style={styles.text}>{partnerMessage}</Text>
        <LunaButton variant="secondary" onPress={onOpenVoice}>{copy.create}</LunaButton>
        <LunaButton
          variant="secondary"
          onPress={() => {
            void Share.share({
              message: partnerMessage,
              title: 'Luna29 partner message',
            });
          }}
        >
          {copy.share}
        </LunaButton>
      </SurfaceCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  hero: { minHeight: 170, borderRadius: 22, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  image: { resizeMode: 'cover' },
  overlay: { flex: 1, backgroundColor: 'rgba(48, 35, 65, 0.34)', justifyContent: 'flex-end', padding: 14 },
  heroText: { color: '#fff', fontSize: 16, lineHeight: 22, fontWeight: '600' },
  cardTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
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
  row: { gap: 8 },
  text: { fontSize: 15, lineHeight: 22, color: colors.textSecondary },
});
