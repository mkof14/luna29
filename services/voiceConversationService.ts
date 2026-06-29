import type { Language } from '../constants';
import {
  DEFAULT_LUNA_PERSONA_ID,
  LUNA_PERSONA_FALLBACK,
  type LunaVoicePersonaId,
  type LunaVoicePersonaPublic,
  type VoiceConversationMode,
  type VoiceHistoryTurn,
} from '../utils/lunaVoicePersonas';

const API_BASE_STORAGE_KEY = 'luna_api_base_url';

export type VoiceConversationResult = {
  text: string;
  audio: string | null;
  personaId: LunaVoicePersonaId;
  followUpQuestion?: string | null;
  provider: string;
  ttsProvider?: string | null;
};

export type VoiceServiceConfig = {
  enabled: boolean;
  ttsEnabled: boolean;
  llmEnabled?: boolean;
  provider: string;
  modelId?: string;
  personas: LunaVoicePersonaPublic[];
};

const isLocalHostRuntime = () => {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1';
};

const getApiBase = (): string => {
  if (typeof window === 'undefined') return '';
  const fromStorage = localStorage.getItem(API_BASE_STORAGE_KEY)?.trim();
  if (!fromStorage) return '';
  try {
    const url = new URL(fromStorage.startsWith('http') ? fromStorage : `http://${fromStorage}`);
    if (!isLocalHostRuntime() && (url.hostname === 'localhost' || url.hostname === '127.0.0.1')) return '';
  } catch {
    return '';
  }
  return fromStorage.replace(/\/$/, '');
};

const apiUrl = (path: string) => {
  const base = getApiBase();
  if (base) return `${base}${path}`;
  if (typeof window !== 'undefined') return path;
  return path;
};

const voiceAiExplicitlyDisabled = () => {
  const flag = import.meta.env.VITE_ENABLE_VOICE_AI;
  return flag === false || flag === 'false' || flag === '0';
};

/** Voice AI runs when backend is configured; set VITE_ENABLE_VOICE_AI=false to disable. */
export const isVoiceAiEnabled = () => !voiceAiExplicitlyDisabled();

export const fetchVoiceServiceConfig = async (): Promise<VoiceServiceConfig> => {
  try {
    const res = await fetch(apiUrl('/api/voice/config'), { credentials: 'include' });
    if (!res.ok) throw new Error('config unavailable');
    const data = (await res.json()) as VoiceServiceConfig;
    return {
      ...data,
      personas: data.personas?.length ? data.personas : LUNA_PERSONA_FALLBACK,
    };
  } catch {
    return {
      enabled: false,
      ttsEnabled: false,
      provider: 'local',
      personas: LUNA_PERSONA_FALLBACK,
    };
  }
};

export const requestLunaVoiceResponse = async (params: {
  transcript: string;
  lang: Language;
  personaId?: LunaVoicePersonaId;
  mode?: VoiceConversationMode;
  history?: VoiceHistoryTurn[];
  context?: Record<string, unknown>;
  withAudio?: boolean;
}): Promise<VoiceConversationResult> => {
  const {
    transcript,
    lang,
    personaId = DEFAULT_LUNA_PERSONA_ID,
    mode = 'live',
    history = [],
    context = {},
    withAudio = true,
  } = params;

  if (voiceAiExplicitlyDisabled()) {
    return localVoiceFallback(transcript, lang, personaId);
  }

  try {
    const res = await fetch(apiUrl('/api/voice/respond'), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript,
        lang,
        personaId,
        mode,
        history,
        context,
        withAudio,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(typeof err?.error === 'string' ? err.error : `Voice API ${res.status}`);
    }

    const data = (await res.json()) as VoiceConversationResult;
    return {
      text: data.text,
      audio: data.audio ?? null,
      personaId: (data.personaId as LunaVoicePersonaId) || personaId,
      followUpQuestion: data.followUpQuestion ?? null,
      provider: data.provider || 'gemini',
      ttsProvider: data.ttsProvider ?? null,
    };
  } catch {
    return localVoiceFallback(transcript, lang, personaId);
  }
};

const localVoiceFallback = (transcript: string, lang: Language, personaId: LunaVoicePersonaId): VoiceConversationResult => {
  const ru = lang === 'ru' || lang === 'uk';
  const text = transcript.trim()
    ? ru
      ? 'Я слышу тебя. Спасибо, что поделилась. Что сейчас было бы самым бережным шагом?'
      : 'I hear you. Thank you for sharing. What would feel like the kindest next step right now?'
    : ru
      ? 'Я рядом. Расскажи, что сейчас внутри — я слушаю.'
      : 'I am here. Tell me what is inside right now — I am listening.';

  return { text, audio: null, personaId, provider: 'local', followUpQuestion: null, ttsProvider: null };
};
