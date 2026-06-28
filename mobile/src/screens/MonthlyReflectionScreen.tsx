import React from 'react';
import { ImageBackground, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { LunaButton } from '../components/LunaButton';
import { MobileScreenHeader } from '../components/MobileScreenHeader';
import { SurfaceCard } from '../components/SurfaceCard';
import { colors } from '../theme/tokens';
import { BaseMobileLang, MobileLang, resolveLangBase } from '../i18n/mobileCopy';

export function MonthlyReflectionScreen({
  onBack,
  lang,
}: {
  onBack: () => void;
  lang: MobileLang;
}) {
  const copyByLang: Record<BaseMobileLang, Record<string, string>> = {
    en: {
      title: 'Your month with Luna29',
      subtitle: 'A gentle monthly summary.',
      i1: 'Your energy tends to dip before your cycle.',
      i2: 'Sleep affects mood during work days.',
      i3: 'Evenings were calmer on days with voice notes.',
      share: 'Share this reflection',
      back: 'Back to Today',
    },
    ru: {
      title: 'Ваш месяц с Luna29',
      subtitle: 'Мягкий ежемесячный обзор.',
      i1: 'Энергия обычно снижается перед циклом.',
      i2: 'Сон влияет на настроение в рабочие дни.',
      i3: 'Вечера были спокойнее в дни с голосовыми заметками.',
      share: 'Поделиться обзором',
      back: 'Назад в Today',
    },
    es: {
      title: 'Tu mes con Luna29',
      subtitle: 'Un resumen mensual suave.',
      i1: 'Tu energia tiende a bajar antes del ciclo.',
      i2: 'El sueno afecta el estado en dias laborales.',
      i3: 'Las noches fueron mas calmadas en dias con notas de voz.',
      share: 'Compartir reflexion',
      back: 'Volver a Today',
    },
  };
  const copy = copyByLang[resolveLangBase(lang)];
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ImageBackground source={require('../../assets/bg-soft-2.webp')} imageStyle={styles.heroImage} style={styles.heroCard}>
        <View style={styles.heroOverlay}>
          <MobileScreenHeader title={copy.title} subtitle={copy.subtitle} onBack={onBack} tone="light" />
        </View>
      </ImageBackground>

      <SurfaceCard style={styles.monthCard}>
        <Text style={styles.item}>{copy.i1}</Text>
        <Text style={styles.item}>{copy.i2}</Text>
        <Text style={styles.item}>{copy.i3}</Text>
      </SurfaceCard>

      <View style={styles.actions}>
        <LunaButton
          variant="secondary"
          onPress={() => {
            void Share.share({
              title: copy.title,
              message: `${copy.title}\n\n• ${copy.i1}\n• ${copy.i2}\n• ${copy.i3}`,
            });
          }}
        >
          {copy.share}
        </LunaButton>
        <LunaButton variant="ghost" onPress={onBack}>{copy.back}</LunaButton>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  item: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
  },
  actions: {
    gap: 8,
  },
  heroCard: {
    minHeight: 132,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  heroImage: {
    resizeMode: 'cover',
  },
  heroOverlay: {
    flex: 1,
    padding: 14,
    justifyContent: 'center',
    backgroundColor: 'rgba(59, 39, 84, 0.27)',
  },
  monthCard: {
    backgroundColor: 'rgba(255, 249, 255, 0.86)',
  },
});
