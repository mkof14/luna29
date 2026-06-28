import React from 'react';
import { Alert, ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LunaButton } from '../components/LunaButton';
import { MobileScreenHeader } from '../components/MobileScreenHeader';
import { SurfaceCard } from '../components/SurfaceCard';
import { BaseMobileLang, MobileLang, resolveLangBase } from '../i18n/mobileCopy';
import { fetchMobileBillingStatus } from '../services/production';

export function InsightsPaywallScreen({
  onBack,
  lang,
}: {
  onBack: () => void;
  lang: MobileLang;
}) {
  const [billingStatus, setBillingStatus] = React.useState<{
    enabled: boolean;
    monthlyPrice: string;
    yearlyPrice: string;
    trial: string;
    provider: string;
  } | null>(null);

  React.useEffect(() => {
    void (async () => {
      const next = await fetchMobileBillingStatus();
      setBillingStatus(next);
    })();
  }, []);

  const copyByLang: Record<BaseMobileLang, Record<string, string>> = {
    en: {
      title: 'Luna29 is beginning to understand your rhythm.',
      subtitle: 'Unlock deeper insights about your body, energy, and emotional patterns.',
      note1: 'Your energy often drops two days before your cycle begins.',
      note2: 'Short sleep also makes the next day heavier.',
      personal: 'Personal patterns',
      monthly: 'Monthly reflections',
      deeper: 'Deeper voice insights',
      price: '$89 / year or $12.99 / month',
      unlock: 'Unlock deeper insights',
      unlockTitle: 'Unlock insights',
      unlockText: 'Subscription checkout is being finalized. Pricing is already synced with website plans.',
      trial: '7-day free trial · Cancel anytime',
      provider: 'Billing provider',
      statusEnabled: 'Live',
      statusDisabled: 'Setup in progress',
      back: 'Back',
    },
    ru: {
      title: 'Luna29 начинает понимать ваш ритм.',
      subtitle: 'Откройте более глубокие инсайты о теле, энергии и эмоциональных паттернах.',
      note1: 'Энергия часто снижается за два дня до начала цикла.',
      note2: 'Короткий сон делает следующий день тяжелее.',
      personal: 'Личные паттерны',
      monthly: 'Ежемесячные отражения',
      deeper: 'Глубокие голосовые инсайты',
      price: '$89 / год или $12.99 / месяц',
      unlock: 'Открыть глубокие инсайты',
      unlockTitle: 'Открыть инсайты',
      unlockText: 'Checkout подписки завершается. Тарифы уже синхронизированы с сайтом.',
      trial: '7 дней бесплатно · Отмена в любое время',
      provider: 'Провайдер биллинга',
      statusEnabled: 'Включен',
      statusDisabled: 'Настраивается',
      back: 'Назад',
    },
    es: {
      title: 'Luna29 empieza a entender tu ritmo.',
      subtitle: 'Desbloquea insights mas profundos sobre tu cuerpo, energia y patrones emocionales.',
      note1: 'Tu energia suele bajar dos dias antes de tu ciclo.',
      note2: 'Dormir poco tambien hace mas pesado el dia siguiente.',
      personal: 'Patrones personales',
      monthly: 'Reflexiones mensuales',
      deeper: 'Insights de voz profundos',
      price: '$89 / ano o $12.99 / mes',
      unlock: 'Desbloquear insights profundos',
      unlockTitle: 'Desbloquear insights',
      unlockText: 'El checkout de suscripcion se esta finalizando. Los precios ya estan sincronizados con el sitio.',
      trial: 'Prueba gratis de 7 dias · Cancela cuando quieras',
      provider: 'Proveedor de pagos',
      statusEnabled: 'Activo',
      statusDisabled: 'Configuracion en progreso',
      back: 'Atras',
    },
  };
  const copy = copyByLang[resolveLangBase(lang)];
  const priceLine = billingStatus ? `${billingStatus.yearlyPrice} / year or ${billingStatus.monthlyPrice} / month` : copy.price;
  const trialLine = billingStatus?.trial ? `${billingStatus.trial} · Cancel anytime` : copy.trial;
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ImageBackground source={require('../../assets/bg-soft-3.webp')} imageStyle={styles.heroImage} style={styles.heroCard}>
        <View style={styles.heroOverlay}>
          <MobileScreenHeader
            title={copy.title}
            subtitle={copy.subtitle}
            onBack={onBack}
            tone="light"
          />
        </View>
      </ImageBackground>

      <SurfaceCard style={styles.priceCard}>
        <Text style={styles.note}>{copy.note1}</Text>
        <Text style={styles.note}>{copy.note2}</Text>
      </SurfaceCard>

      <SurfaceCard style={styles.featuresCard}>
        <View style={styles.featurePills}>
          <View style={[styles.featurePill, styles.featurePillA]}>
            <Text style={styles.section}>{copy.personal}</Text>
          </View>
          <View style={[styles.featurePill, styles.featurePillB]}>
            <Text style={styles.section}>{copy.monthly}</Text>
          </View>
          <View style={[styles.featurePill, styles.featurePillC]}>
            <Text style={styles.section}>{copy.deeper}</Text>
          </View>
        </View>
        <Text style={styles.price}>{priceLine}</Text>
        <Text style={styles.trial}>
          {copy.provider}: {billingStatus?.provider || 'disabled'} · {billingStatus?.enabled ? copy.statusEnabled : copy.statusDisabled}
        </Text>
        <LunaButton
          onPress={() => {
            Alert.alert(copy.unlockTitle, copy.unlockText);
          }}
        >
          {copy.unlock}
        </LunaButton>
        <Text style={styles.trial}>{trialLine}</Text>
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
  note: {
    fontSize: 15,
    lineHeight: 23,
    color: '#5e4e72',
    fontWeight: '500',
  },
  section: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4a3a5f',
    fontWeight: '600',
    textAlign: 'center',
  },
  price: {
    fontSize: 22,
    color: '#3f2f56',
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 2,
  },
  trial: {
    fontSize: 13,
    color: '#826f99',
    fontWeight: '600',
    textAlign: 'center',
  },
  heroCard: {
    minHeight: 160,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(197,164,221,0.55)',
    overflow: 'hidden',
  },
  heroImage: {
    resizeMode: 'cover',
  },
  heroOverlay: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    backgroundColor: 'rgba(63, 42, 86, 0.24)',
  },
  priceCard: {
    backgroundColor: 'rgba(255, 246, 255, 0.92)',
    borderColor: 'rgba(209,183,227,0.68)',
  },
  featuresCard: {
    backgroundColor: 'rgba(255, 248, 255, 0.94)',
    borderColor: 'rgba(209,183,227,0.68)',
  },
  featurePills: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  featurePill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  featurePillA: {
    backgroundColor: 'rgba(246, 225, 240, 0.85)',
    borderColor: 'rgba(221, 162, 201, 0.7)',
  },
  featurePillB: {
    backgroundColor: 'rgba(236, 229, 251, 0.9)',
    borderColor: 'rgba(190, 171, 234, 0.72)',
  },
  featurePillC: {
    backgroundColor: 'rgba(224, 237, 252, 0.86)',
    borderColor: 'rgba(171, 203, 236, 0.72)',
  },
});
