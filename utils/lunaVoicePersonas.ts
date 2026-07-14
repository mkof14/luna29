import type { Language } from '../constants';

export type LunaVoicePersonaId = 'luna' | 'luna_soft' | 'luna_clear';

export type LunaVoicePersonaPublic = {
  id: LunaVoicePersonaId;
  name: string;
  tagline: string;
  description: string;
};

export type VoiceConversationMode = 'live' | 'reflection' | 'guide' | 'teaser';

export type VoiceHistoryTurn = {
  role: 'user' | 'assistant' | 'luna';
  text: string;
};

export const DEFAULT_LUNA_PERSONA_ID: LunaVoicePersonaId = 'luna';

export const LUNA_PERSONA_FALLBACK: LunaVoicePersonaPublic[] = [
  {
    id: 'luna',
    name: 'Luna',
    tagline: 'Warm presence · daily reflection',
    description: 'Calm, attentive, feminine. Listens first, reflects back, asks one honest question.',
  },
  {
    id: 'luna_soft',
    name: 'Luna Soft',
    tagline: 'Gentle grounding · evening reset',
    description: 'Slower pace, softer tone. For overwhelm, fatigue, and end-of-day decompression.',
  },
  {
    id: 'luna_clear',
    name: 'Luna Clear',
    tagline: 'Focused clarity · practical steps',
    description: 'Direct but kind. Helps name patterns and choose one next step without pressure.',
  },
];

export const personaIntroByLang: Partial<Record<Language, Record<LunaVoicePersonaId, string>>> = {
  en: {
    luna: 'I am here with you — voice or text. Share what feels most alive right now.',
    luna_soft: 'Take a breath. I am listening softly. What wants to be heard tonight?',
    luna_clear: 'Let us name what is true today — one thing at a time.',
  },
  ru: {
    luna: 'Я рядом — голосом или текстом. Расскажи, что сейчас чувствуется сильнее всего.',
    luna_soft: 'Выдохни. Я слушаю мягко. Что хочет быть услышанным сегодня вечером?',
    luna_clear: 'Давай назовём, что правда сегодня — по одному шагу.',
  },
  uk: {
    luna: 'Я поруч — голосом або текстом. Поділися, що зараз відчувається найсильніше.',
    luna_soft: 'Зроби видих. Я слухаю м’яко. Що хоче бути почутим сьогодні ввечері?',
    luna_clear: 'Давай назвемо, що правда сьогодні — крок за кроком.',
  },
  es: {
    luna: 'Estoy aquí contigo — voz o texto. Comparte lo que se sienta más vivo ahora.',
    luna_soft: 'Respira. Escucho con suavidad. ¿Qué quiere ser escuchado esta noche?',
    luna_clear: 'Nombremos lo que es verdad hoy — una cosa a la vez.',
  },
  fr: {
    luna: 'Je suis là avec vous — voix ou texte. Partagez ce qui est le plus vivant maintenant.',
    luna_soft: 'Respirez. J’écoute doucement. Qu’est-ce qui veut être entendu ce soir ?',
    luna_clear: 'Nommons ce qui est vrai aujourd’hui — une chose à la fois.',
  },
  de: {
    luna: 'Ich bin hier bei dir — Stimme oder Text. Teile, was sich jetzt am lebendigsten anfühlt.',
    luna_soft: 'Atme. Ich höre sanft zu. Was will heute Abend gehört werden?',
    luna_clear: 'Nennen wir, was heute wahr ist — eins nach dem anderen.',
  },
  zh: {
    luna: '我在这里陪你——语音或文字。分享此刻最鲜活的感受。',
    luna_soft: '深呼吸。我温柔地听着。今晚什么想被听见？',
    luna_clear: '让我们说出今天真实的一件事——一次一件。',
  },
  ja: {
    luna: 'ここにいます — 声でも文字でも。今いちばん生きていることを話してください。',
    luna_soft: '息をして。やさしく聴いています。今夜、聞こえてほしいことは何ですか？',
    luna_clear: '今日ほんとうのことを名付けましょう — ひとつずつ。',
  },
  pt: {
    luna: 'Estou aqui com você — voz ou texto. Compartilhe o que está mais vivo agora.',
    luna_soft: 'Respire. Estou ouvindo com suavidade. O que quer ser ouvido esta noite?',
    luna_clear: 'Vamos nomear o que é verdade hoje — uma coisa de cada vez.',
  },
  ar: {
    luna: 'أنا هنا معكِ — صوتًا أو نصًا. شاركي ما يبدو أكثر حيوية الآن.',
    luna_soft: 'خذي نفسًا. أستمع بلطف. ما الذي يريد أن يُسمَع الليلة؟',
    luna_clear: 'لنسمِّ ما هو حقيقي اليوم — شيئًا واحدًا في كل مرة.',
  },
  he: {
    luna: 'אני כאן איתך — קול או טקסט. שתפי מה הכי חי עכשיו.',
    luna_soft: 'נשמי. אני מקשיבה בעדינות. מה רוצה להישמע הערב?',
    luna_clear: 'בואי נקרא בשם למה שנכון היום — דבר אחד בכל פעם.',
  },
};
