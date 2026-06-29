import type { Language } from '../constants';
import { aiConsentHeaders, isAiProcessingAllowed } from '../utils/aiConsent';
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
  degraded?: boolean;
};

export type VoiceExtractTask =
  | 'checkin'
  | 'onboarding_checkin'
  | 'bridge_answer'
  | 'bridge_all'
  | 'partner_intake'
  | 'reflection';

export type VoiceCheckinExtract = {
  energy: number;
  mood: number;
  sleep: number;
  libido: number;
  irritability: number;
  stress: number;
  symptoms: string[];
  isPeriod: boolean;
  summary?: string;
};

export type VoiceExtractResult<T = Record<string, unknown>> = {
  task: VoiceExtractTask;
  data: T | null;
  provider: string;
  degraded?: boolean;
  error?: string;
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

const isLocalApiBase = (raw: string) => {
  try {
    const url = new URL(raw.startsWith('http') ? raw : `http://${raw}`);
    return url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  } catch {
    return false;
  }
};

const getApiBase = (): string => {
  if (typeof window === 'undefined') return '';
  if (isLocalHostRuntime()) return '';
  const fromEnv = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ?? '';
  const fromStorage = localStorage.getItem(API_BASE_STORAGE_KEY)?.trim() ?? '';
  const raw = fromEnv || fromStorage;
  if (!raw) return '';
  if (isLocalApiBase(raw)) return '';
  return raw.replace(/\/$/, '');
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

  if (voiceAiExplicitlyDisabled() || !isAiProcessingAllowed()) {
    return localVoiceFallback(transcript, lang, personaId);
  }

  try {
    const res = await fetch(apiUrl('/api/voice/respond'), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...aiConsentHeaders() },
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
      degraded: data.degraded ?? false,
    };
  } catch (error) {
    const fallback = localVoiceFallback(transcript, lang, personaId);
    fallback.degraded = true;
    return fallback;
  }
};

const localVoiceFallback = (transcript: string, lang: Language, personaId: LunaVoicePersonaId): VoiceConversationResult => {
  const ru = lang === 'ru' || lang === 'uk';
  const text = transcript.trim();
  const snippet = text.length > 72 ? `${text.slice(0, 72).trim()}…` : text;

  const reply = !text
    ? ru
      ? 'Я рядом. Расскажи, что сейчас внутри — я слушаю.'
      : 'I am here. Tell me what is inside right now — I am listening.'
    : ru
      ? `Я слышу: «${snippet}». Спасибо, что поделилась. Что сейчас было бы самым бережным шагом?`
      : `I hear: "${snippet}". Thank you for sharing. What would feel like the kindest next step right now?`;

  return { text: reply, audio: null, personaId, provider: 'local', followUpQuestion: null, ttsProvider: null, degraded: true };
};

export const requestVoiceExtract = async <T = Record<string, unknown>>(params: {
  task: VoiceExtractTask;
  transcript: string;
  lang: Language;
  context?: Record<string, unknown>;
}): Promise<VoiceExtractResult<T>> => {
  const { task, transcript, lang, context = {} } = params;

  if (voiceAiExplicitlyDisabled() || !isAiProcessingAllowed()) {
    return { task, data: null, provider: 'local', degraded: true, error: 'ai_consent_required' };
  }

  try {
    const res = await fetch(apiUrl('/api/voice/extract'), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...aiConsentHeaders() },
      body: JSON.stringify({ task, transcript, lang, context }),
    });

    if (!res.ok) {
      throw new Error(`Extract API ${res.status}`);
    }

    return (await res.json()) as VoiceExtractResult<T>;
  } catch {
    return { task, data: null, provider: 'local', degraded: true, error: 'request_failed' };
  }
};
