import { Language, LangCopy } from '../constants';
import { SUPPORTED_LANGUAGES } from '../utils/languages';

export type LocalizedText = LangCopy<string>;
const TRANSLATION_CACHE_KEY = 'luna_translation_cache_v1';

const phraseDictionary: Record<string, Partial<Record<Language, string>>> = {
  'manual dispatch': {
    ru: 'Ручная отправка',
    uk: 'Ручне надсилання',
    es: 'Envío manual',
    fr: 'Envoi manuel',
    de: 'Manueller Versand',
    zh: '手动发送',
    ja: '手動送信',
    pt: 'Envio manual'
  },
  'new signup': {
    ru: 'Новая регистрация',
    uk: 'Нова реєстрація',
    es: 'Nuevo registro',
    fr: 'Nouvelle inscription',
    de: 'Neue Registrierung',
    zh: '新注册',
    ja: '新規登録',
    pt: 'Novo cadastro'
  },
  'forgot password': {
    ru: 'Забытый пароль',
    uk: 'Забутий пароль',
    es: 'Olvidó su contraseña',
    fr: 'Mot de passe oublié',
    de: 'Passwort vergessen',
    zh: '忘记密码',
    ja: 'パスワード再設定',
    pt: 'Esqueceu a senha'
  },
  '7 days before renewal': {
    ru: 'За 7 дней до продления',
    uk: 'За 7 днів до продовження',
    es: '7 días antes de la renovación',
    fr: '7 jours avant renouvellement',
    de: '7 Tage vor Verlängerung',
    zh: '续费前7天',
    ja: '更新7日前',
    pt: '7 dias antes da renovação'
  },
  'cancel intent': {
    ru: 'Намерение отменить',
    uk: 'Намір скасувати',
    es: 'Intención de cancelar',
    fr: 'Intention de résilier',
    de: 'Kündigungsabsicht',
    zh: '取消意图',
    ja: '解約意向',
    pt: 'Intenção de cancelar'
  },
  'not set': {
    ru: 'Не задано',
    uk: 'Не задано',
    es: 'Sin fecha',
    fr: 'Non défini',
    de: 'Nicht gesetzt',
    zh: '未设置',
    ja: '未設定',
    pt: 'Não definido'
  }
};

const getDictionaryTranslation = (value: string, targetLang: Language): string | null => {
  const key = value.trim().toLowerCase();
  const mapped = phraseDictionary[key]?.[targetLang];
  return mapped && mapped.trim().length > 0 ? mapped : null;
};

const normalizeText = (value: string): string => value.trim().replace(/\s+/g, ' ');

const getFallbackLocalizedText = (value: string, sourceLang: Language): LocalizedText => {
  const normalized = normalizeText(value);
  return SUPPORTED_LANGUAGES.reduce((acc, lang) => {
    if (lang === sourceLang) {
      acc[lang] = normalized;
      return acc;
    }
    acc[lang] = getDictionaryTranslation(normalized, lang) || normalized;
    return acc;
  }, {} as LocalizedText);
};

type TranslationCache = Record<string, string>;

const readCache = (): TranslationCache => {
  try {
    const raw = localStorage.getItem(TRANSLATION_CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as TranslationCache;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const writeCache = (cache: TranslationCache) => {
  try {
    localStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // no-op
  }
};

const buildCacheKey = (text: string, sourceLang: Language, targetLang: Language): string =>
  `${sourceLang}:${targetLang}:${normalizeText(text).toLowerCase()}`;

const inFlightTranslations = new Map<string, Promise<string | null>>();

const getTranslationEndpoint = (): string => {
  try {
    const value = localStorage.getItem('luna_translate_api_url')?.trim();
    return value || '';
  } catch {
    return '';
  }
};

const getTranslationApiKey = (): string => {
  try {
    const value = localStorage.getItem('luna_translate_api_key')?.trim();
    return value || '';
  } catch {
    return '';
  }
};

const translateWithApi = async (
  text: string,
  sourceLang: Language,
  targetLang: Language
): Promise<string | null> => {
  const normalizedText = normalizeText(text);
  const cacheKey = buildCacheKey(normalizedText, sourceLang, targetLang);
  const cache = readCache();
  if (cache[cacheKey]) return cache[cacheKey];

  const existing = inFlightTranslations.get(cacheKey);
  if (existing) return existing;

  const endpoint = getTranslationEndpoint();
  if (!endpoint) return null;

  const request = (async () => {
    try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const apiKey = getTranslationApiKey();
    if (apiKey) {
      headers.Authorization = `Bearer ${apiKey}`;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({ text: normalizedText, sourceLang, targetLang }),
    });

    if (!response.ok) return null;

    const data = await response.json() as { translation?: string };
      const translation = typeof data.translation === 'string' ? normalizeText(data.translation) : '';
      if (!translation) return null;

      const nextCache = readCache();
      nextCache[cacheKey] = translation;
      writeCache(nextCache);
      return translation;
    } catch {
      return null;
    } finally {
      inFlightTranslations.delete(cacheKey);
    }
  })();

  inFlightTranslations.set(cacheKey, request);
  return request;
};

export const localizeText = async (value: string, sourceLang: Language): Promise<LocalizedText> => {
  const normalized = normalizeText(value);
  const fallback = getFallbackLocalizedText(normalized, sourceLang);

  const translations = await Promise.all(
    SUPPORTED_LANGUAGES.map(async (targetLang) => {
      if (targetLang === sourceLang) return [targetLang, normalized] as const;

      const fromApi = await translateWithApi(normalized, sourceLang, targetLang);
      return [targetLang, fromApi || fallback[targetLang]] as const;
    })
  );

  return translations.reduce((acc, [lang, translated]) => {
    acc[lang] = translated ?? fallback[lang] ?? normalized;
    return acc;
  }, {} as LocalizedText);
};

export const seedLocalizedText = (value: string, sourceLang: Language): LocalizedText =>
  getFallbackLocalizedText(value, sourceLang);

export const localizeFields = async (
  fields: Record<string, string>,
  sourceLang: Language
): Promise<Record<string, LocalizedText>> => {
  const entries = await Promise.all(
    Object.entries(fields).map(async ([key, text]) => [key, await localizeText(text, sourceLang)] as const)
  );

  return entries.reduce((acc, [key, localized]) => {
    acc[key] = localized;
    return acc;
  }, {} as Record<string, LocalizedText>);
};

export const resolveLocalizedText = (value: string | LocalizedText, lang: Language): string => {
  if (typeof value === 'string') return value;

  const direct = value[lang]?.trim();
  if (direct) return direct;

  const english = value.en?.trim();
  if (english) return english;

  return SUPPORTED_LANGUAGES.map((code) => value[code]?.trim()).find(Boolean) || '';
};
