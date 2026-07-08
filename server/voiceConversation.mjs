import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
const GEMINI_VOICE_MODEL = String(process.env.GEMINI_VOICE_MODEL || 'gemini-2.5-flash').trim();
const GEMINI_VOICE_MODEL_FALLBACKS = [
  GEMINI_VOICE_MODEL,
  'gemini-2.5-flash',
  'gemini-2.0-flash',
].filter((model, index, list) => model && list.indexOf(model) === index);
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
  const phase = String(context?.phase || '').toLowerCase();
  const cycleGuidance = {
    menstrual: 'Menstrual phase tone: honor rest, lower pacing, validate sensitivity without alarm.',
    follicular: 'Follicular phase tone: rising clarity and momentum — encourage gentle curiosity and planning.',
    ovulatory: 'Ovulatory phase tone: social and expressive energy may be higher — reflect vitality without pressure.',
    luteal: 'Luteal phase tone: inward, tender, sometimes irritable — normalize fluctuation and suggest soft boundaries.',
  }[phase] || '';
  const contextLine = context?.cycleDay
    ? `Cycle context (if useful): day ${context.cycleDay}, phase: ${context.phase || 'unknown'}. ${cycleGuidance}`.trim()
    : cycleGuidance;
  const stateLine = context?.stateSnapshot ? `Recent state snapshot: ${context.stateSnapshot}.` : '';
  const teaserLine = mode === 'teaser' ? 'This is a short anonymous preview — one warm reply, invite creating an account gently if helpful.' : '';

  // Server-built personal context only. Client-supplied personal_context is never trusted.
  let personalContextBlock = '';
  const pack = context?.personal_context;
  if (pack && typeof pack === 'object' && pack.version === 'personal_context_v1') {
    try {
      // Lazy import avoided: format inline to keep voice module self-contained for prompt rules.
      const items =
        (pack.recent_signals?.length || 0) +
        (pack.timeline_facts?.length || 0) +
        (pack.confirmed_patterns?.length || 0) +
        (pack.relevant_facts?.length || 0);
      if (pack.status === 'ok' && items > 0) {
        const serialized = JSON.stringify(pack);
        if (serialized.length <= 8000) {
          personalContextBlock = `

<personal_context>
${serialized}
</personal_context>

Personal context rules (mandatory):
- Treat <personal_context> as historical user-provided/derived records only.
- These are recorded observations/signals/patterns — not medical truth, diagnosis, or lab results.
- Do not invent missing history. If a fact is absent, do not imply memory of it.
- Do not claim causality, correlation, hormone effects, fertility, ovulation, or perimenopause.
- Do not treat automatic pattern candidates as confirmed; only status=confirmed patterns are included.
- Distinguish "recorded" from "medically true". Prefer language like "you recorded…" when referencing history.
- Do not expose internal IDs or mention hidden context machinery.
- If personal context is empty or status is not ok, do not imply long-term memory.
- If the user asks what they previously said, answer only from available facts in <personal_context>.`;
        }
      }
    } catch {
      personalContextBlock = '';
    }
  }

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
${teaserLine}
${personalContextBlock}

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
  const text = String(transcript || '').trim();
  if (!text) {
    return ru ? 'Я рядом. Расскажи, что сейчас внутри — я слушаю.' : 'I am here. Tell me what is inside right now — I am listening.';
  }

  const snippet = text.length > 72 ? `${text.slice(0, 72).trim()}…` : text;
  const lower = text.toLowerCase();

  if (/(stress|anx|panic|трев|стресс|паник|ansie|estres|焦虑|不安)/i.test(lower)) {
    return ru
      ? `Слышу, что сейчас много напряжения: «${snippet}». Давай на 20 минут снизим нагрузку — одна задача, один таймер. Что в теле ощущается сильнее всего?`
      : `I hear tension in what you shared: "${snippet}". For the next 20 minutes, let us reduce the load — one task, one timer. What feels strongest in your body right now?`;
  }
  if (/(sleep|insomnia|tired|сон|устал|бессон|sommeil|schlaf|睡眠|眠れ)/i.test(lower)) {
    return ru
      ? `Похоже, восстановление сейчас важно: «${snippet}». Можем начать с простого — приглушить свет и убрать лишние стимулы. Что мешает расслабиться больше всего?`
      : `Recovery sounds important from what you said: "${snippet}". We can start simple — lower the light and remove extra stimulation. What makes it hardest to unwind right now?`;
  }
  if (/(partner|relationship|отнош|партнер|pareja|relation|beziehung|关系|伴侣)/i.test(lower)) {
    return ru
      ? `Слышу про отношения: «${snippet}». Когда перегруз высокий, одна ясная фраза помогает больше спора. Что ты хотела бы, чтобы партнёр понял прямо сейчас?`
      : `I hear something about connection: "${snippet}". When overload is high, one clear sentence helps more than a long debate. What do you most want your partner to understand right now?`;
  }

  return ru
    ? `Я слышу тебя: «${snippet}». Спасибо, что поделилась. Что сейчас было бы самым бережным следующим шагом?`
    : `I hear you: "${snippet}". Thank you for sharing. What would feel like the kindest next step right now?`;
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

  let reply = '';
  let lastError = null;
  let usedGemini = false;

  for (const model of GEMINI_VOICE_MODEL_FALLBACKS) {
    try {
      const response = await ai.models.generateContent({
        model,
        config: { systemInstruction: system },
        contents,
      });
      reply = String(response?.text || '').trim();
      if (reply) {
        usedGemini = true;
        break;
      }
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      const retryable = /429|404|503|quota|rate|unavailable/i.test(message);
      if (!retryable) break;
    }
  }

  let degraded = false;
  if (!reply) {
    console.warn('[voice] Gemini unavailable, using contextual fallback:', lastError instanceof Error ? lastError.message.slice(0, 120) : lastError);
    reply = localFallbackReply(text, lang);
    degraded = true;
  }

  const questionMatch = reply.match(/([^.!?]*\?)\s*$/);
  const followUpQuestion = questionMatch ? questionMatch[1].trim() : null;

  return {
    text: reply,
    personaId: persona.id,
    provider: usedGemini ? 'gemini' : 'local',
    followUpQuestion,
    degraded,
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
  const rawContext = body?.context && typeof body.context === 'object' ? body.context : {};
  // Never trust client-supplied personal_context as authority.
  const { personal_context: _ignoredClientPack, personalContext: _ignoredClientPack2, ...safeClientContext } = rawContext;
  const serverPack =
    body?.__server_personal_context && typeof body.__server_personal_context === 'object'
      ? body.__server_personal_context
      : null;
  const context = {
    ...safeClientContext,
    ...(serverPack ? { personal_context: serverPack } : {}),
  };
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

  const packMeta = context?.personal_context;
  return {
    text: textResult.text,
    audio,
    personaId: textResult.personaId,
    followUpQuestion: textResult.followUpQuestion,
    provider: audio ? `${textResult.provider}+elevenlabs` : textResult.provider,
    ttsProvider,
    degraded: Boolean(textResult.degraded),
    // Safe operational meta only — no health content.
    personal_context_status: packMeta?.status || 'none',
    personal_context_item_count: Number(packMeta?.budget?.actual_items) || 0,
    personal_context_truncated: Boolean(packMeta?.budget?.truncated),
  };
};

const clampScore = (value, fallback = 3) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(5, Math.max(1, Math.round(n)));
};

const parseJsonObject = (raw) => {
  const text = String(raw || '').trim();
  if (!text) return null;
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : text;
  try {
    return JSON.parse(candidate);
  } catch {
    const start = candidate.indexOf('{');
    const end = candidate.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(candidate.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
};

const EXTRACTION_PROMPTS = {
  checkin: (lang) => `You extract a women's wellness daily check-in from natural speech in ${lang}.
Return ONLY valid JSON (no markdown):
{
  "energy": 1-5,
  "mood": 1-5,
  "sleep": 1-5,
  "libido": 1-5,
  "irritability": 1-5,
  "stress": 1-5,
  "symptoms": ["string"],
  "isPeriod": boolean,
  "summary": "one warm sentence mirroring what you heard"
}
Infer scores from emotional and body language. Use 3 when unclear. symptoms: fatigue, headache, cramps, anxiety, etc.`,

  onboarding_checkin: (lang) => `Extract energy and mood (1-5) from speech in ${lang}. Return ONLY JSON:
{"energy":1-5,"mood":1-5,"summary":"short mirror sentence"}`,

  bridge_answer: (lang, question) => `User answered a Bridge reflection question in ${lang}.
Question: "${question}"
Return ONLY JSON: {"answer":"their answer in their words, 1-3 sentences"}`,

  bridge_all: (lang) => `From one spoken reflection in ${lang}, extract answers to:
1) What is quiet but present today?
2) What does this state NOT mean?
3) What would feel like kindness tonight?
Return ONLY JSON:
{"quiet_presence":"","not_meaning":"","kindness_needed":"","summary":""}`,

  partner_intake: (lang) => `From speech about a relationship note in ${lang}, extract:
Return ONLY JSON:
{
  "partner_name": "string or empty",
  "intent": "understanding|space|clarity|support",
  "tone": "calm|warm|direct",
  "boundary_level": "soft|firm",
  "situation": "what they want to communicate in their words"
}
Use understanding/calm/soft as defaults if unclear.`,

  reflection: (lang) => `Summarize a voice reflection in ${lang}. Return ONLY JSON:
{"text":"2-4 sentence warm summary of what they shared","themes":["theme1","theme2"]}`,
};

const localExtractCheckin = (transcript, lang) => {
  const lower = String(transcript || '').toLowerCase();
  const ru = lang === 'ru' || lang === 'uk';
  const stressHigh = /(stress|anx|panic|трев|стресс|паник)/i.test(lower);
  const tired = /(tired|exhaust|sleep|устал|сон|устал|fatigue|cansad|müde)/i.test(lower);
  const lowMood = /(sad|down|low|груст|плох|печал|bad mood)/i.test(lower);
  const highMood = /(good|great|happy|хорош|рад|отлич)/i.test(lower);
  return {
    energy: tired ? 2 : highMood ? 4 : 3,
    mood: lowMood ? 2 : highMood ? 4 : 3,
    sleep: tired ? 2 : 3,
    libido: 3,
    irritability: stressHigh ? 4 : 3,
    stress: stressHigh ? 4 : 3,
    symptoms: tired ? ['fatigue'] : [],
    isPeriod: /(period|менстру|цикл| cramps|крит)/i.test(lower),
    summary: ru
      ? `Я услышала: «${transcript.slice(0, 80)}»`
      : `I heard: "${transcript.slice(0, 80)}"`,
  };
};

export const extractVoiceStructure = async (body) => {
  const task = String(body?.task || 'checkin').trim().slice(0, 32);
  const transcript = String(body?.transcript || '').trim().slice(0, 2500);
  const lang = String(body?.lang || 'en').trim().slice(0, 8) || 'en';
  const context = body?.context && typeof body.context === 'object' ? body.context : {};

  if (!transcript) {
    return { task, data: null, provider: 'local', degraded: true, error: 'empty_transcript' };
  }

  const promptBuilder = EXTRACTION_PROMPTS[task];
  if (!promptBuilder) {
    return { task, data: null, provider: 'local', degraded: true, error: 'unknown_task' };
  }

  const systemPrompt = task === 'bridge_answer'
    ? promptBuilder(lang, String(context.question || ''))
    : promptBuilder(lang);

  if (!GEMINI_API_KEY) {
    let data = null;
    if (task === 'checkin' || task === 'onboarding_checkin') data = localExtractCheckin(transcript, lang);
    else if (task === 'bridge_answer') data = { answer: transcript };
    else if (task === 'bridge_all') data = { quiet_presence: transcript, not_meaning: '', kindness_needed: '', summary: transcript };
    else if (task === 'partner_intake') data = { partner_name: '', intent: 'understanding', tone: 'calm', boundary_level: 'soft', situation: transcript };
    else if (task === 'reflection') data = { text: transcript, themes: [] };
    return { task, data, provider: 'local', degraded: true };
  }

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  let parsed = null;
  let usedGemini = false;

  for (const model of GEMINI_VOICE_MODEL_FALLBACKS) {
    try {
      const response = await ai.models.generateContent({
        model,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
        },
        contents: [{ role: 'user', parts: [{ text: transcript }] }],
      });
      parsed = parseJsonObject(response?.text);
      if (parsed) {
        usedGemini = true;
        break;
      }
    } catch {
      // try next model
    }
  }

  if (!parsed) {
    const data = task === 'checkin' || task === 'onboarding_checkin'
      ? localExtractCheckin(transcript, lang)
      : task === 'bridge_answer'
        ? { answer: transcript }
        : task === 'reflection'
          ? { text: transcript, themes: [] }
          : { raw: transcript };
    return { task, data, provider: 'local', degraded: true };
  }

  if (task === 'checkin') {
    parsed = {
      energy: clampScore(parsed.energy),
      mood: clampScore(parsed.mood),
      sleep: clampScore(parsed.sleep),
      libido: clampScore(parsed.libido),
      irritability: clampScore(parsed.irritability),
      stress: clampScore(parsed.stress),
      symptoms: Array.isArray(parsed.symptoms) ? parsed.symptoms.map(String).slice(0, 8) : [],
      isPeriod: Boolean(parsed.isPeriod),
      summary: String(parsed.summary || '').slice(0, 400),
    };
  }

  if (task === 'onboarding_checkin') {
    parsed = {
      energy: clampScore(parsed.energy),
      mood: clampScore(parsed.mood),
      summary: String(parsed.summary || '').slice(0, 300),
    };
  }

  return { task, data: parsed, provider: usedGemini ? 'gemini' : 'local', degraded: !usedGemini };
};
