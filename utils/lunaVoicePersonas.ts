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
};
