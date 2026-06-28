import React, { useEffect, useState } from 'react';
import { Alert, ImageBackground, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { LanguageSelector } from '../components/LanguageSelector';
import { LunaButton } from '../components/LunaButton';
import { SurfaceCard } from '../components/SurfaceCard';
import { colors } from '../theme/tokens';
import { BaseMobileLang, MobileLang, resolveLangBase } from '../i18n/mobileCopy';
import { fetchMobileAuthProviders } from '../services/production';

const copyByLang: Record<BaseMobileLang, Record<string, string>> = {
  en: {
    back: 'Back',
    eyebrow: 'Luna29 Access',
    title: 'Welcome back',
    subtitle: 'Sign in to keep your daily story and insights across devices.',
    signIn: 'Sign in',
    signUp: 'Sign up',
    name: 'Name',
    email: 'Email',
    password: 'Password',
    hide: 'Hide',
    show: 'Show',
    wait: 'Please wait...',
    continue: 'Continue',
    create: 'Create account',
    providers: 'Sign in with providers',
    google: 'Continue with Google',
    apple: 'Continue with Apple',
    providerReady: 'Ready',
    providerPending: 'Setup required',
    providerInfo: 'Native provider login is prepared for production app builds.',
    providerTap: 'Provider sign-in will be enabled after native credentials are connected.',
  },
  ru: {
    back: 'Назад',
    eyebrow: 'Доступ Luna29',
    title: 'С возвращением',
    subtitle: 'Войдите, чтобы сохранить ваш ежедневный путь и инсайты на всех устройствах.',
    signIn: 'Войти',
    signUp: 'Регистрация',
    name: 'Имя',
    email: 'Email',
    password: 'Пароль',
    hide: 'Скрыть',
    show: 'Показать',
    wait: 'Подождите...',
    continue: 'Продолжить',
    create: 'Создать аккаунт',
    providers: 'Вход через провайдеров',
    google: 'Продолжить с Google',
    apple: 'Продолжить с Apple',
    providerReady: 'Готово',
    providerPending: 'Нужна настройка',
    providerInfo: 'Native provider login подготовлен для production-сборок.',
    providerTap: 'Вход через провайдеров будет включен после подключения native credentials.',
  },
  es: {
    back: 'Atras',
    eyebrow: 'Acceso Luna29',
    title: 'Bienvenida de nuevo',
    subtitle: 'Inicia sesion para mantener tu historia diaria e insights en todos tus dispositivos.',
    signIn: 'Entrar',
    signUp: 'Crear cuenta',
    name: 'Nombre',
    email: 'Email',
    password: 'Contrasena',
    hide: 'Ocultar',
    show: 'Mostrar',
    wait: 'Espera...',
    continue: 'Continuar',
    create: 'Crear cuenta',
    providers: 'Entrar con proveedores',
    google: 'Continuar con Google',
    apple: 'Continuar con Apple',
    providerReady: 'Listo',
    providerPending: 'Falta configurar',
    providerInfo: 'El acceso nativo con proveedores esta preparado para builds de produccion.',
    providerTap: 'El acceso con proveedores se activara cuando conectemos credenciales nativas.',
  },
};

export function AuthScreen({
  onSignIn,
  onSignUp,
  onBack,
  error,
  lang,
  setLang,
  themeMode,
  onToggleTheme,
}: {
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (name: string, email: string, password: string) => Promise<void>;
  onBack?: () => void;
  error?: string;
  lang: MobileLang;
  setLang: (lang: MobileLang) => void;
  themeMode: 'light' | 'dark';
  onToggleTheme: () => void;
}) {
  const baseLang = resolveLangBase(lang);
  const copy = copyByLang[baseLang];
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('Anna');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [providers, setProviders] = useState<{ google: boolean; apple: boolean; message: string } | null>(null);

  useEffect(() => {
    void (async () => {
      const next = await fetchMobileAuthProviders();
      setProviders(next);
    })();
  }, []);

  async function submit() {
    setSubmitting(true);
    try {
      if (mode === 'signin') {
        await onSignIn(email, password);
      } else {
        await onSignUp(name, email, password);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ImageBackground source={require('../../assets/home-hero.webp')} imageStyle={styles.heroImage} style={styles.hero}>
        {onBack ? (
          <LunaButton variant="ghost" onPress={onBack}>← {copy.back}</LunaButton>
        ) : null}
        <View style={styles.heroGlowTop} />
        <View style={styles.heroGlowBottom} />
        <Text style={styles.eyebrow}>{copy.eyebrow}</Text>
        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.subtitle}>{copy.subtitle}</Text>
      </ImageBackground>

      <SurfaceCard style={styles.providersCard}>
        <Text style={styles.providersTitle}>{baseLang === 'ru' ? 'Язык и тема' : baseLang === 'es' ? 'Idioma y tema' : 'Language and theme'}</Text>
        <LanguageSelector lang={lang} setLang={setLang} />
        <LunaButton variant="secondary" onPress={onToggleTheme}>
          {(baseLang === 'ru' ? 'Тема' : baseLang === 'es' ? 'Tema' : 'Theme')}: {themeMode === 'light' ? (baseLang === 'ru' ? 'Светлая' : baseLang === 'es' ? 'Claro' : 'Light') : (baseLang === 'ru' ? 'Темная' : baseLang === 'es' ? 'Oscuro' : 'Dark')}
        </LunaButton>
      </SurfaceCard>

      <SurfaceCard>
        <View style={styles.modeRow}>
          <LunaButton variant={mode === 'signin' ? 'primary' : 'secondary'} onPress={() => setMode('signin')}>{copy.signIn}</LunaButton>
          <LunaButton variant={mode === 'signup' ? 'primary' : 'secondary'} onPress={() => setMode('signup')}>{copy.signUp}</LunaButton>
        </View>

        {mode === 'signup' ? (
          <TextInput value={name} onChangeText={setName} placeholder={copy.name} style={styles.input} placeholderTextColor={colors.textMuted} />
        ) : null}
        <TextInput value={email} onChangeText={setEmail} placeholder={copy.email} style={styles.input} placeholderTextColor={colors.textMuted} autoCapitalize="none" keyboardType="email-address" />
        <View style={styles.passwordWrap}>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder={copy.password}
            style={[styles.input, styles.passwordInput]}
            placeholderTextColor={colors.textMuted}
            secureTextEntry={!showPassword}
          />
          <LunaButton variant="ghost" onPress={() => setShowPassword((prev) => !prev)}>
            {showPassword ? copy.hide : copy.show}
          </LunaButton>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <LunaButton onPress={submit}>{submitting ? copy.wait : mode === 'signin' ? copy.continue : copy.create}</LunaButton>
      </SurfaceCard>

      <SurfaceCard style={styles.providersCard}>
        <Text style={styles.providersTitle}>{copy.providers}</Text>
        <View style={styles.modeRow}>
          <LunaButton variant="secondary" onPress={() => Alert.alert(copy.providers, copy.providerTap)}>
            {copy.google} · {(providers?.google ?? false) ? copy.providerReady : copy.providerPending}
          </LunaButton>
          <LunaButton variant="secondary" onPress={() => Alert.alert(copy.providers, copy.providerTap)}>
            {copy.apple} · {(providers?.apple ?? false) ? copy.providerReady : copy.providerPending}
          </LunaButton>
        </View>
        <Text style={styles.providersText}>{providers?.message || copy.providerInfo}</Text>
      </SurfaceCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 14,
  },
  hero: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(200,168,224,0.6)',
    backgroundColor: '#f8eef8',
    padding: 18,
    gap: 8,
  },
  heroImage: {
    resizeMode: 'cover',
  },
  heroGlowTop: {
    position: 'absolute',
    width: 150,
    height: 150,
    top: -42,
    right: -36,
    borderRadius: 999,
    backgroundColor: '#efd9ff',
    opacity: 0.55,
  },
  heroGlowBottom: {
    position: 'absolute',
    width: 190,
    height: 130,
    bottom: -54,
    left: -42,
    borderRadius: 999,
    backgroundColor: '#fbdde8',
    opacity: 0.5,
  },
  eyebrow: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontWeight: '700',
    color: '#eddcf9',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff8ff',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: '#f4e4fa',
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  input: {
    minHeight: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(213,181,232,0.7)',
    backgroundColor: 'rgba(255,249,255,0.92)',
    paddingHorizontal: 13,
    color: '#4a3960',
  },
  error: {
    color: '#b64d67',
    fontSize: 13,
    fontWeight: '600',
  },
  passwordWrap: {
    gap: 6,
  },
  passwordInput: {
    width: '100%',
  },
  providersCard: {
    backgroundColor: 'rgba(255, 247, 255, 0.94)',
    borderColor: 'rgba(209,183,227,0.68)',
  },
  providersTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4a3960',
  },
  providersText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#826f99',
  },
});
