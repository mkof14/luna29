import { SystemState, PartnerNoteInput, PartnerNoteOutput, BridgeReflectionInput, BridgeLetterOutput } from '../types';

const LANG_RU = 'ru';

const fallbackByLang = (ru: string, en: string, lang: string = 'en') =>
  lang === LANG_RU ? ru : en;

export const generateBridgeLetter = async (
  input: BridgeReflectionInput
): Promise<BridgeLetterOutput | { error: { code: string; message: string } }> => {
  const content = [
    input.reflection.quiet_presence,
    input.reflection.not_meaning,
    input.reflection.kindness_needed,
  ]
    .filter(Boolean)
    .map((s) => s.trim())
    .join(' ')
    .trim();

  if (!content) {
    return {
      error: {
        code: 'GENERATION_ERROR',
        message: 'Please add a few reflection details first.',
      },
    };
  }

  const letter = fallbackByLang(
    `Сейчас во мне есть: ${input.reflection.quiet_presence || 'тихое напряжение'}. Это не означает: ${input.reflection.not_meaning || 'что между нами что-то не так'}. Мне было бы бережно: ${input.reflection.kindness_needed || 'чуть больше тишины и мягкости сегодня'}. Я рядом и ценю нашу связь.`,
    `What is present in me now: ${input.reflection.quiet_presence || 'a quiet tension'}. This does not mean: ${input.reflection.not_meaning || 'something is wrong between us'}. What would feel kind: ${input.reflection.kindness_needed || 'a little more calm and softness tonight'}. I care about us and we are okay.`,
    input.language || 'en'
  );

  return {
    meta: {
      language: input.language || 'en',
      contains_medical: false,
      contains_therapy_language: false,
      contains_blame: false,
    },
    bridge_letter: {
      content: letter,
    },
  };
};

export const generatePartnerNote = async (
  input: PartnerNoteInput
): Promise<PartnerNoteOutput | { error: { code: string; message: string } }> => {
  const lang = input.language || 'en';
  const partner = input.partner_name?.trim() || fallbackByLang('партнер', 'partner', lang);

  const textBase = fallbackByLang(
    `Привет, ${partner}. Сегодня у меня более чувствительное состояние. Это не про тебя и не про наши отношения. Мне поможет спокойный вечер без перегруза. Я рядом и ценю нас.`,
    `Hey ${partner}, I am in a more sensitive state today. This is not about you or our relationship. It would help to keep tonight calm and simple. I care about us and we are okay.`,
    lang
  );

  const noteBase = fallbackByLang(
    `Сегодня мой внутренний ресурс ниже обычного, поэтому я реагирую тоньше. Это не претензия и не дистанция от тебя. Мне поможет один спокойный вечер и чуть больше мягкости в общении. Ты важен(а) для меня, и между нами все стабильно.`,
    `My internal bandwidth is lower today, so I am reacting more sensitively than usual. This is not criticism and not distance from you. One calm evening and gentle communication would help me reset. You matter to me, and we are stable.`,
    lang
  );

  const letterBase = fallbackByLang(
    `Я хочу поделиться состоянием заранее, чтобы между нами было больше ясности. Сегодня у меня меньше энергии и больше чувствительности, поэтому мне сложнее держать обычный темп. Это не про тебя и не про наши отношения. Мне поможет простой и тихий вечер без сложных разговоров. Спасибо, что рядом. Я дорожу нами.`,
    `I want to share my state in advance so we can stay clear and close. Today I have less energy and more sensitivity, so my usual pace is harder to maintain. This is not about you or our relationship. It would help to keep tonight simple and quiet without heavy conversations. Thank you for being here. I care about us.`,
    lang
  );

  const mk = (base: string, idPrefix: string) => [
    { id: `${idPrefix}_1`, content: base },
    { id: `${idPrefix}_2`, content: `${base} ${fallbackByLang('Это временно.', 'This is temporary.', lang)}` },
    { id: `${idPrefix}_3`, content: `${base} ${fallbackByLang('Мне важно сохранить контакт с тобой.', 'Staying connected with you matters to me.', lang)}` },
  ];

  return {
    meta: {
      language: lang,
      contains_medical: false,
      contains_blame: false,
      safety_flags: [],
    },
    messages: {
      text: mk(textBase, 'text'),
      note: mk(noteBase, 'note'),
      letter: mk(letterBase, 'letter'),
    },
  };
};

export const analyzeLabResults = async (results: string, systemState: SystemState, lang: string = 'en') => {
  const phase = systemState.currentDay <= 14 ? 'Follicular/Ovulatory window' : 'Luteal window';

  const text = fallbackByLang(
    `Локальный режим без AI: данные сохранены. День цикла: ${systemState.currentDay} (${phase}). Предварительно выделите отклоняющиеся значения, сопоставьте с референсами вашей лаборатории и обсудите динамику с врачом.`,
    `Local mode without AI: data captured. Cycle day: ${systemState.currentDay} (${phase}). Start by marking out-of-range values, compare with your lab's reference intervals, and review trend changes with your clinician.`,
    lang
  );

  return {
    text: `${text} Input snapshot: ${results.slice(0, 300)}`,
    sources: [],
  };
};

export const generateStateNarrative = async (
  phase: string,
  day: number,
  _hormones: unknown[],
  metrics: Record<string, number>,
  lang: string = 'en'
) => {
  const energy = metrics.energy ?? 3;
  const stress = metrics.stress ?? 3;

  if (lang === LANG_RU) {
    if (energy <= 2) return `День ${day}, ${phase}: ресурсы снижены, сегодня лучше мягкий темп.`;
    if (stress >= 4) return `День ${day}, ${phase}: нервная система чувствительна, бережный ритм будет опорой.`;
    return `День ${day}, ${phase}: состояние ровное, сохраняйте устойчивый ритм.`;
  }

  if (energy <= 2) return `Day ${day}, ${phase}: energy is lower, so a gentler pace may help.`;
  if (stress >= 4) return `Day ${day}, ${phase}: stress reactivity is elevated, so keep your rhythm simple.`;
  return `Day ${day}, ${phase}: your baseline looks steady today.`;
};

export const generateCulinaryInsight = async (
  phase: string,
  priorities: string[],
  _sensitivities: string[],
  lang: string = 'en'
) => {
  const core = priorities.slice(0, 3).join(', ') || fallbackByLang('магний, белок, клетчатка', 'magnesium, protein, fiber', lang);
  return fallbackByLang(
    `Фаза ${phase}: соберите тарелку вокруг ${core} и добавьте теплый, простой прием пищи без перегруза.`,
    `Phase ${phase}: build a plate around ${core} and keep one warm, simple meal today.`,
    lang
  );
};

export const generateEmpathyBridgeMessage = async (
  phase: string,
  _metrics: Record<string, number>,
  lang: string = 'en'
) => {
  return fallbackByLang(
    `Сегодня у меня более чувствительная фаза (${phase}). Мне поможет мягкий ритм и спокойный контакт.`,
    `I am in a more sensitive ${phase} phase today. A gentle pace and calm connection would help.`,
    lang
  );
};

export const generateStateVisual = async (_prompt: string, _aspectRatio: string = '1:1', _size: string = '1K') => {
  return null;
};

export const generatePsychologistResponse = async (
  text: string,
  lang: string = 'en'
): Promise<{ text: string; audio: string | null }> => {
  const normalized = text.trim();
  return {
    text: fallbackByLang(
      normalized
        ? `Спасибо, что поделилась. Я слышу: «${normalized.slice(0, 120)}». Это важно замечать.`
        : 'Спасибо, что нашла минутку для себя. Даже короткая пауза имеет значение.',
      normalized
        ? `Thank you for sharing. I hear: "${normalized.slice(0, 120)}". Noticing that matters.`
        : 'Thank you for taking a moment for yourself. Even a brief pause counts.',
      lang
    ),
    audio: null,
  };
};

export const startVeoVideo = async (_prompt: string) => {
  return null;
};
