import React, { useState } from 'react';
import { ImageBackground, Linking, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { LunaButton } from '../components/LunaButton';
import { MobileScreenHeader } from '../components/MobileScreenHeader';
import { SurfaceCard } from '../components/SurfaceCard';
import { colors } from '../theme/tokens';
import { MobileLang, resolveLangBase } from '../i18n/mobileCopy';
import { env, hasApiBaseUrl } from '../config/env';
import { publicWebLink } from '../config/publicWeb';

export function ContactMobileScreen({ onBack, lang }: { onBack: () => void; lang: MobileLang }) {
  const copy = {
    en: { title: 'Contact', subtitle: 'Reach Luna29 support and partnership team.', mail: 'Email support', site: 'Open Luna29 website', send: 'Send message' },
    ru: { title: 'Контакты', subtitle: 'Связь с поддержкой и партнёрской командой Luna29.', mail: 'Написать в поддержку', site: 'Открыть сайт Luna29', send: 'Отправить сообщение' },
    es: { title: 'Contacto', subtitle: 'Contacta soporte y equipo de alianzas de Luna29.', mail: 'Enviar email a soporte', site: 'Abrir sitio Luna29', send: 'Enviar mensaje' },
  }[resolveLangBase(lang)];

  const [name, setName] = useState('Anna');
  const [email, setEmail] = useState('dnainform@gmail.com');
  const [message, setMessage] = useState('I need support with my Luna29 account.');
  const [status, setStatus] = useState('');

  async function sendMessage() {
    if (!hasApiBaseUrl) {
      setStatus('Message saved locally. API URL is not configured.');
      return;
    }
    try {
      const response = await fetch(`${env.apiBaseUrl}/api/public/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name, email, subject: 'support', message }),
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) {
        setStatus(String(json?.error || 'Unable to send message.'));
        return;
      }
      setStatus('Message sent successfully.');
    } catch {
      setStatus('Unable to send message right now.');
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ImageBackground source={require('../../assets/bg-soft-3.webp')} imageStyle={styles.heroImage} style={styles.heroCard}>
        <MobileScreenHeader title={copy.title} subtitle={copy.subtitle} onBack={onBack} tone="light" />
      </ImageBackground>
      <SurfaceCard>
        <Text style={styles.text}>dnainform@gmail.com</Text>
        <LunaButton variant="secondary" onPress={() => void Linking.openURL('mailto:dnainform@gmail.com')}>{copy.mail}</LunaButton>
        <LunaButton variant="secondary" onPress={() => void Linking.openURL(publicWebLink('home'))}>{copy.site}</LunaButton>
      </SurfaceCard>

      <SurfaceCard style={styles.cardAlt}>
        <TextInput value={name} onChangeText={setName} placeholder="Name" placeholderTextColor={colors.textMuted} style={styles.input} />
        <TextInput value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor={colors.textMuted} style={styles.input} />
        <TextInput value={message} onChangeText={setMessage} placeholder="Message" placeholderTextColor={colors.textMuted} style={[styles.input, styles.bigInput]} multiline />
        <LunaButton onPress={() => void sendMessage()}>{copy.send}</LunaButton>
        {status ? <Text style={styles.status}>{status}</Text> : null}
      </SurfaceCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  heroCard: { minHeight: 132, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, padding: 14, justifyContent: 'center' },
  heroImage: { resizeMode: 'cover' },
  text: { fontSize: 15, lineHeight: 22, color: colors.textSecondary },
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
  bigInput: { minHeight: 90, paddingTop: 10, textAlignVertical: 'top' },
  status: { fontSize: 13, color: '#7a4f7b', fontWeight: '600' },
  cardAlt: { backgroundColor: 'rgba(248, 239, 255, 0.82)' },
});
