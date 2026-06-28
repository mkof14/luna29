import React from 'react';
import { ImageBackground, Linking, ScrollView, StyleSheet, Text } from 'react-native';
import { LunaButton } from '../components/LunaButton';
import { MobileScreenHeader } from '../components/MobileScreenHeader';
import { SurfaceCard } from '../components/SurfaceCard';
import { colors } from '../theme/tokens';
import { MobileLang, resolveLangBase } from '../i18n/mobileCopy';
import { publicWebLink } from '../config/publicWeb';

export function SupportScreen({
  onBack,
  onOpenPartnerFaq,
  onOpenLegal,
  lang,
}: {
  onBack: () => void;
  onOpenPartnerFaq: () => void;
  onOpenLegal: () => void;
  lang: MobileLang;
}) {
  const copy = {
    en: {
      title: 'Support & FAQ',
      subtitle: 'Help, safety, and contact.',
      q: 'Common questions',
      q1: 'How often should I use Luna29?\n30–60 seconds each evening is enough.',
      q2: 'Can I skip days?\nYes. Luna29 remains gentle and continuous.',
      q3: 'Can I talk to Luna29 instead of writing?\nYes. Voice Notes are the core daily action.',
      q4: 'Can I share my day with a partner?\nYes. Use “Explain today to my partner” in your member flow.',
      need: 'Need direct help?',
      contact: 'Contact support',
      faq: 'Open full FAQ',
      partner: 'Partner FAQ',
      legal: 'Legal & Privacy',
      emailLabel: 'Support email',
      safetyTitle: 'Safety and urgent support',
      safetyText: 'If you feel unsafe or in immediate distress, contact local emergency services right away.',
      docsTitle: 'Helpful links',
      docsText: 'Open core public pages and legal docs.',
      openHome: 'Open Luna29 Home',
    },
    ru: {
      title: 'Поддержка и FAQ',
      subtitle: 'Помощь, безопасность и контакт.',
      q: 'Частые вопросы',
      q1: 'Как часто использовать Luna29?\nДостаточно 30–60 секунд вечером.',
      q2: 'Можно пропускать дни?\nДа. Luna29 остается мягкой и последовательной.',
      q3: 'Можно говорить с Luna29 вместо текста?\nДа. Голосовые заметки — ключевое ежедневное действие.',
      q4: 'Можно поделиться днем с партнером?\nДа. Используйте “Explain today to my partner” в мембер-потоке.',
      need: 'Нужна помощь?',
      contact: 'Написать в поддержку',
      faq: 'Открыть полный FAQ',
      partner: 'Partner FAQ',
      legal: 'Право и приватность',
      emailLabel: 'Email поддержки',
      safetyTitle: 'Безопасность и срочная помощь',
      safetyText: 'Если вы в небезопасном состоянии или остром дистрессе, обратитесь в местные экстренные службы.',
      docsTitle: 'Полезные ссылки',
      docsText: 'Откройте ключевые публичные страницы и юридические документы.',
      openHome: 'Открыть Luna29 Home',
    },
    es: {
      title: 'Soporte y FAQ',
      subtitle: 'Ayuda, seguridad y contacto.',
      q: 'Preguntas comunes',
      q1: 'Con que frecuencia usar Luna29?\n30–60 segundos por la noche es suficiente.',
      q2: 'Puedo saltar dias?\nSi. Luna29 sigue siendo suave y continua.',
      q3: 'Puedo hablar con Luna29 en lugar de escribir?\nSi. Las notas de voz son la accion diaria principal.',
      q4: 'Puedo compartir mi dia con mi pareja?\nSi. Usa “Explain today to my partner” en tu flujo member.',
      need: 'Necesitas ayuda directa?',
      contact: 'Contactar soporte',
      faq: 'Abrir FAQ completa',
      partner: 'Partner FAQ',
      legal: 'Legal y privacidad',
      emailLabel: 'Email de soporte',
      safetyTitle: 'Seguridad y ayuda urgente',
      safetyText: 'Si te sientes insegura o en crisis inmediata, contacta servicios de emergencia locales.',
      docsTitle: 'Links utiles',
      docsText: 'Abre paginas publicas clave y documentos legales.',
      openHome: 'Abrir Luna29 Home',
    },
  }[resolveLangBase(lang)];
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ImageBackground source={require('../../assets/bg-soft-1.webp')} imageStyle={styles.heroImage} style={styles.heroCard}>
        <MobileScreenHeader title={copy.title} subtitle={copy.subtitle} onBack={onBack} tone="light" />
      </ImageBackground>

      <SurfaceCard style={styles.cardA}>
        <Text style={styles.cardTitle}>{copy.q}</Text>
        <Text style={styles.text}>{copy.q1}</Text>
        <Text style={styles.text}>{copy.q2}</Text>
        <Text style={styles.text}>{copy.q3}</Text>
        <Text style={styles.text}>{copy.q4}</Text>
      </SurfaceCard>

      <SurfaceCard style={styles.cardB}>
        <Text style={styles.cardTitle}>{copy.need}</Text>
        <Text style={styles.text}>{copy.emailLabel}: dnainform@gmail.com</Text>
        <LunaButton variant="secondary" onPress={() => void Linking.openURL('mailto:dnainform@gmail.com')}>{copy.contact}</LunaButton>
        <LunaButton variant="secondary" onPress={() => void Linking.openURL(publicWebLink('faq'))}>{copy.faq}</LunaButton>
        <LunaButton variant="secondary" onPress={onOpenPartnerFaq}>{copy.partner}</LunaButton>
        <LunaButton variant="secondary" onPress={onOpenLegal}>{copy.legal}</LunaButton>
      </SurfaceCard>

      <SurfaceCard style={styles.cardA}>
        <Text style={styles.cardTitle}>{copy.safetyTitle}</Text>
        <Text style={styles.text}>{copy.safetyText}</Text>
      </SurfaceCard>

      <SurfaceCard style={styles.cardB}>
        <Text style={styles.cardTitle}>{copy.docsTitle}</Text>
        <Text style={styles.text}>{copy.docsText}</Text>
        <LunaButton variant="secondary" onPress={() => void Linking.openURL(publicWebLink('home'))}>{copy.openHome}</LunaButton>
      </SurfaceCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  heroCard: {
    minHeight: 132,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    backgroundColor: 'rgba(59, 42, 82, 0.25)',
    justifyContent: 'center',
  },
  heroImage: { resizeMode: 'cover' },
  cardTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  text: { fontSize: 15, lineHeight: 22, color: colors.textSecondary },
  cardA: {
    backgroundColor: 'rgba(255, 249, 255, 0.86)',
  },
  cardB: {
    backgroundColor: 'rgba(245, 237, 253, 0.84)',
  },
});
