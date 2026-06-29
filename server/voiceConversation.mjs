import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
const ELEVENLABS_API_KEY = String(process.env.ELEVENLABS_API_KEY || '').trim();
const ELEVENLABS_MODEL_ID = String(process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2').trim();

const DEFAULT_VOICE = String(process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL').trim();

/** Luna voice personas — one spirit, tuned for real-time women's wellness conversation. */
export const LUNA_VOICE_PERSONAS = [
  {
    id: 'luna',
    name: 'Luna',
    tagline: 'Warm presence · daily reflection',
    description: 'Calm, attentive, feminine. Listens first, reflects back, asks one honest question.',
    voiceId: String(process.env.ELEVENLABS_VOICE_LUNA || DEFAULT_VOICE).trim(),
    modelId: ELEVENLABS_MODEL_ID,
    stability: 0.42,
    similarityBoost: 0.82,
    style: 0.38,
  },
  {
    id: 'luna_soft',
    name: 'Luna Soft',
    tagline: 'Gentle grounding · evening reset',
    description: 'Slower pace, softer tone. For overwhelm, fatigue, and end-of-day decompression.',
    voiceId: String(process.env.ELEVENLABS_VOICE_LUNA_SOFT || 'XB0fDUnXU5powFXDhCwa').trim(),
    modelId: ELEVENLABS_MODEL_ID,
    stability: 0.55,
    similarityBoost: 0.78,
    style: 0.28,
  },
  {
    id: 'luna_clear',
    name: 'Luna Clear',
    tagline: 'Focused clarity · practical steps',
    description: 'Direct but kind. Helps name patterns and choose one next step without pressure.',
    voiceId: String(process.env.ELEVENLABS_VOICE_LUNA_CLEAR || '21m00Tcm4TlvDq8ikWAM').trim(),
    modelId: ELEVENLABS_MODEL_ID,
    stability: 0.48,
    similarityBoost: 0.85,
    style: 0.32,
  },
];

const personaById = new Map(LUNA_VOICE_PERSONAS.map((p) => [p.id, p]));

export const getPublicVoiceConfig = () => ({
  enabled: Boolean(GEMINI_API_KEY || ELEVENLABS_API_KEY),
  ttsEnabled: Boolean(ELEVENLABS_API_KEY),
  llmEnabled: Boolean(GEMINI_API_KEY),
  provider: ELEVENLABS_API_KEY && GEMINI_API_KEY ? 'gemini+elevenlabs' : ELEVENLABS_API_KEY ? 'elevenlabs' : GEMINI_API_KEY ? 'gemini' : 'local',
  modelId: ELEVENLABS_MODEL_ID,
  personas: LUNA_VOICE_PERSONAS.map(({ id, name, tagline, description }) => ({
    id,
    name,
    tagline,
    description,
  })),
});

export const listElevenLabsVoices = async () => {
  if (!ELEVENLABS_API_KEY) return [];
  const response = await fetch('https://api.elevenlabs.io/v1/voices', {
    headers: { 'xi-api-key': ELEVENLABS_API_KEY },
  });
  if (!response.ok) return [];
  const data = await response.json();
  const voices = Array.isArray(data?.voices) ? data.voices : [];
  return voices.map((v) => ({
    voiceId: v.voice_id,
    name: v.name,
    labels: v.labels || {},
    previewUrl: v.preview_url || null,
  }));
};

const LANG_LABELS = {
  en: 'English',
  ru: 'Russian',
  uk: 'Ukrainian',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  zh: 'Chinese',
  ja: 'Japanese',
  pt: 'Portuguese',
  ar: 'Arabic',
  he: 'Hebrew',
};

const resolvePersona = (personaId) => personaById.get(String(personaId || 'luna').trim()) || LUNA_VOICE_PERSONAS[0];

const buildSystemPrompt = ({ lang, persona, mode, context }) => {
  const language = LANG_LABELS[lang] || LANG_LABELS.en;
  const contextLine = context?.cycleDay
    ? `Cycle context (if useful): day ${context.cycleDay}, phase hint: ${context.phase || 'unknown'}.`
    : '';
  const stateLine = context?.stateSnapshot ? `Recent state snapshot: ${context.stateSnapshot}.` : '';

  return `You are ${persona.name}, the living voice of Luna29 — an intelligent companion for women in real time.

Identity & spirit:
- Feminine, grounded, truthful, warm. You speak like a perceptive friend who respects biology and emotion equally.
- You are NOT a doctor, therapist, or crisis line. No diagnosis, no prescriptions, no clinical labels.
- You listen deeply, mirror what you heard, ask ONE thoughtful follow-up question when it helps, and offer ONE gentle practical suggestion when appropriate.
- Short spoken answers: 2–4 sentences, conversational, no bullet lists, no markdown, no emojis.
- Reply in ${language} unless the user clearly uses another language.

Mode: ${mode || 'live'}.
${contextLine}
${stateLine}

Safety: If immediate danger or self-harm, urge contacting local emergency services first, then stay present.

Style: living dialogue — "I hear…", "It sounds like…", "What would feel kind right now?" — never robotic or corporate.`;
};

const sanitizeHistory = (history) => {
  if (!Array.isArray(history)) return [];
  return history
    .slice(-8)
    .map((item) => ({
      role: item?.role === 'assistant' || item?.role === 'luna' ? 'model' : 'user',
      text: String(item?.text || item?.content || '').trim().slice(0, 1200),
    }))
    .filter((item) => item.text);
};

const localFallbackReply = (transcript, lang) => {
  const ru = lang === 'ru' || lang === 'uk';
  if (!transcript.trim()) {
    return ru ? 'Я рядом. Расскажи, что сейчас внутри — я слушаю.' : 'I am here. Tell me what is inside right now — I am listening.';
  }
  return ru
    ? 'Я слышу тебя. Спасибо, что поделилась. Давай сегодня держать мягкий темп — что сейчас было бы самым бережным шагом?'
    : 'I hear you. Thank you for sharing. Let us keep today gentle — what would feel like the kindest next step right now?';
};

export const generateLunaTextReply = async ({ transcript, lang = 'en', personaId, mode, history, context }) => {
  const text = String(transcript || '').trim().slice(0, 2000);
  const persona = resolvePersona(personaId);

  if (!GEMINI_API_KEY) {
    return {
      text: localFallbackReply(text, lang),
      personaId: persona.id,
      provider: 'local',
      followUpQuestion: null,
    };
  }

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  const system = buildSystemPrompt({ lang, persona, mode, context });
  const prior = sanitizeHistory(history);

  const contents = [
    ...prior.map((turn) => ({
      role: turn.role,
      parts: [{ text: turn.text }],
    })),
    {
      role: 'user',
      parts: [{ text: text || (lang === 'ru' ? 'Привет.' : 'Hello.') }],
    },
  ];

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    config: { systemInstruction: system },
    contents,
  });

  const reply = String(response?.text || '').trim() || localFallbackReply(text, lang);

  const questionMatch = reply.match(/([^.!?]*\?)\s*$/);
  const followUpQuestion = questionMatch ? questionMatch[1].trim() : null;

  return {
    text: reply,
    personaId: persona.id,
    provider: 'gemini',
    followUpQuestion,
  };
};

export const synthesizeElevenLabs = async ({ text, personaId, lang = 'en' }) => {
  if (!ELEVENLABS_API_KEY || !text.trim()) {
    return { audio: null, mimeType: 'audio/mpeg' };
  }

  const persona = resolvePersona(personaId);
  const voiceId = persona.voiceId || DEFAULT_VOICE;

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`, {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text: text.slice(0, 2500),
      model_id: persona.modelId || ELEVENLABS_MODEL_ID,
      language_code: lang.slice(0, 2),
      voice_settings: {
        stability: persona.stability ?? 0.45,
        similarity_boost: persona.similarityBoost ?? 0.8,
        style: persona.style ?? 0.35,
        use_speaker_boost: true,
      },
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`ElevenLabs TTS failed (${response.status}): ${detail.slice(0, 200)}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  return {
    audio: buffer.toString('base64'),
    mimeType: 'audio/mpeg',
  };
};

export const handleVoiceConversation = async (body) => {
  const transcript = String(body?.transcript || body?.text || '').trim().slice(0, 2000);
  const lang = String(body?.lang || 'en').trim().slice(0, 8) || 'en';
  const personaId = String(body?.personaId || 'luna').trim();
  const mode = String(body?.mode || 'live').trim().slice(0, 32);
  const history = body?.history;
  const context = body?.context && typeof body.context === 'object' ? body.context : {};
  const withAudio = body?.withAudio !== false;

  const textResult = await generateLunaTextReply({
    transcript,
    lang,
    personaId,
    mode,
    history,
    context,
  });

  let audio = null;
  let ttsProvider = null;

  if (withAudio && ELEVENLABS_API_KEY) {
    try {
      const tts = await synthesizeElevenLabs({ text: textResult.text, personaId: textResult.personaId, lang });
      audio = tts.audio;
      ttsProvider = 'elevenlabs';
    } catch {
      audio = null;
      ttsProvider = 'browser-fallback';
    }
  }

  return {
    text: textResult.text,
    audio,
    personaId: textResult.personaId,
    followUpQuestion: textResult.followUpQuestion,
    provider: audio ? `${textResult.provider}+elevenlabs` : textResult.provider,
    ttsProvider,
  };
};
