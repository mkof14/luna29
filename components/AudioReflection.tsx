import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Square, Save, Share2, X, Sparkles, RefreshCw } from 'lucide-react';
import { dataService } from '../services/dataService';
import { generatePsychologistResponse } from '../services/geminiService';
import { isVoiceAiEnabled, requestLunaVoiceResponse } from '../services/voiceConversationService';
import { isAiProcessingAllowed } from '../utils/aiConsent';
import { Language, LangCopy, getLang } from '../constants';

type SpeechRecognitionAlternativeLike = {
  transcript: string;
};

type SpeechRecognitionResultLike = {
  isFinal: boolean;
  0: SpeechRecognitionAlternativeLike;
};

type SpeechRecognitionResultListLike = {
  length: number;
  [index: number]: SpeechRecognitionResultLike;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: SpeechRecognitionResultListLike;
};

type SpeechRecognitionErrorEventLike = {
  error: string;
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechRecognitionConstructorLike = new () => SpeechRecognitionLike;
type SavedVoiceClip = {
  id: string;
  createdAt: string;
  locale: string;
  transcript: string;
  audioDataUrl: string;
};

const VOICE_CLIPS_STORAGE_KEY = 'luna_voice_clips_v1';

type VoiceReflectionUiCopy = {
  listeningLine: string;
  voiceTitle: string;
  voiceSupport: string;
  tapToRecord: string;
  shortEnough: string;
  promptsTitle: string;
  prompt1: string;
  prompt2: string;
  prompt3: string;
  prompt4: string;
  reassurance: string;
  recordingState: string;
  finish: string;
  discard: string;
  reflectionReceived: string;
  reflectionTitle: string;
  reflectionFallback: string;
  suggestionTitle: string;
  suggestionText: string;
  seeRhythm: string;
  saveReflection: string;
  shareReflection: string;
  saving: string;
  copied: string;
  shareError: string;
  previousDayLabel: string;
  compareToday: string;
};

const voiceUiByLang: LangCopy< VoiceReflectionUiCopy> = {
  en: {
    listeningLine: 'Speak freely. Luna29 is listening.',
    voiceTitle: 'Voice Note',
    voiceSupport: 'Record a short note about how you feel and what happened during your day.',
    tapToRecord: 'Tap to record',
    shortEnough: '30–60 seconds is enough.',
    promptsTitle: 'You can start with:',
    prompt1: 'What felt heavy today?',
    prompt2: 'What felt easier than expected?',
    prompt3: 'What is still on your mind?',
    prompt4: 'How does your body feel tonight?',
    reassurance: 'There is no right way to say it. A few honest words are enough.',
    recordingState: 'Recording',
    finish: 'Finish',
    discard: 'Discard',
    reflectionReceived: 'Note received',
    reflectionTitle: "Here's your note",
    reflectionFallback: 'You sounded tired today. You mentioned pressure at work. You slept less than usual.',
    suggestionTitle: 'Suggestion',
    suggestionText: 'Take a slow evening and sleep earlier tonight.',
    seeRhythm: 'See your rhythm',
    saveReflection: 'Save note',
    shareReflection: 'Share note',
    saving: 'Saving...',
    copied: 'Note copied.',
    shareError: 'Could not share right now.',
    previousDayLabel: 'Yesterday you shared',
    compareToday: 'How does today feel compared to yesterday?',
  },
  ru: {
    listeningLine: 'Говорите свободно. Luna29 слушает.',
    voiceTitle: 'Голосовая заметка',
    voiceSupport: 'Запишите короткую заметку о том, как вы себя чувствуете и что произошло за день.',
    tapToRecord: 'Нажмите, чтобы записать',
    shortEnough: 'Достаточно 30–60 секунд.',
    promptsTitle: 'Можно начать с:',
    prompt1: 'Что сегодня было тяжелым?',
    prompt2: 'Что оказалось легче, чем ожидалось?',
    prompt3: 'Что все еще не выходит из головы?',
    prompt4: 'Как чувствует себя ваше тело сегодня вечером?',
    reassurance: 'Здесь нет правильных слов. Достаточно нескольких честных фраз.',
    recordingState: 'Запись',
    finish: 'Завершить',
    discard: 'Удалить',
    reflectionReceived: 'Заметка получена',
    reflectionTitle: 'Вот ваша заметка',
    reflectionFallback: 'Вы звучали уставшей. Вы упомянули давление на работе. Вы спали меньше обычного.',
    suggestionTitle: 'Рекомендация',
    suggestionText: 'Сделайте спокойный вечер и постарайтесь лечь спать раньше.',
    seeRhythm: 'Смотреть ритм',
    saveReflection: 'Сохранить заметку',
    shareReflection: 'Поделиться заметкой',
    saving: 'Сохранение...',
    copied: 'Заметка скопирована.',
    shareError: 'Сейчас не удалось поделиться.',
    previousDayLabel: 'Вчера вы говорили',
    compareToday: 'Как сегодняшний день ощущается по сравнению со вчерашним?',
  },
  uk: {
    listeningLine: 'Говоріть вільно. Luna29 слухає.',
    voiceTitle: 'Голосова нотатка',
    voiceSupport: 'Запишіть коротку нотатку про те, як ви почуваєтесь і що сталося протягом дня.',
    tapToRecord: 'Натисніть, щоб записати',
    shortEnough: '30–60 секунд достатньо.',
    promptsTitle: 'Можна почати з:',
    prompt1: 'Що сьогодні було важким?',
    prompt2: 'Що виявилося легшим, ніж очікувалось?',
    prompt3: 'Що досі не виходить з голови?',
    prompt4: 'Як почувається ваше тіло сьогодні ввечері?',
    reassurance: 'Тут немає правильних слів. Достатньо кількох чесних фраз.',
    recordingState: 'Запис',
    finish: 'Завершити',
    discard: 'Скасувати',
    reflectionReceived: 'Нотатку отримано',
    reflectionTitle: 'Ось ваша нотатка',
    reflectionFallback: 'Ви звучали втомлено. Ви згадали тиск на роботі. Ви спали менше звичного.',
    suggestionTitle: 'Рекомендація',
    suggestionText: 'Зробіть спокійний вечір і спробуйте лягти спати раніше.',
    seeRhythm: 'Переглянути ритм',
    saveReflection: 'Зберегти нотатку',
    shareReflection: 'Поділитися нотаткою',
    saving: 'Збереження...',
    copied: 'Нотатку скопійовано.',
    shareError: 'Зараз не вдалося поділитися.',
    previousDayLabel: 'Учора ви казали',
    compareToday: 'Як сьогоднішній день відчувається порівняно з учорашнім?',
  },
  es: {
    listeningLine: 'Habla con libertad. Luna29 te está escuchando.',
    voiceTitle: 'Nota de voz',
    voiceSupport: 'Graba una breve nota sobre cómo te sientes y qué pasó durante tu día.',
    tapToRecord: 'Toca para grabar',
    shortEnough: '30–60 segundos son suficientes.',
    promptsTitle: 'Puedes empezar con:',
    prompt1: '¿Qué se sintió pesado hoy?',
    prompt2: '¿Qué fue más fácil de lo esperado?',
    prompt3: '¿Qué sigue en tu mente?',
    prompt4: '¿Cómo se siente tu cuerpo esta noche?',
    reassurance: 'No hay una forma correcta de decirlo. Unas palabras honestas son suficientes.',
    recordingState: 'Grabando',
    finish: 'Finalizar',
    discard: 'Descartar',
    reflectionReceived: 'Nota recibida',
    reflectionTitle: 'Aquí está tu nota',
    reflectionFallback: 'Hoy sonabas cansada. Mencionaste presión en el trabajo. Dormiste menos de lo habitual.',
    suggestionTitle: 'Sugerencia',
    suggestionText: 'Regálate una noche tranquila y duerme un poco antes.',
    seeRhythm: 'Ver tu ritmo',
    saveReflection: 'Guardar nota',
    shareReflection: 'Compartir nota',
    saving: 'Guardando...',
    copied: 'Nota copiada.',
    shareError: 'No se pudo compartir ahora.',
    previousDayLabel: 'Yesterday you shared',
    compareToday: 'How does today feel compared to yesterday?',
  },
  fr: {
    listeningLine: 'Parlez librement. Luna29 vous écoute.',
    voiceTitle: 'Note vocale',
    voiceSupport: 'Enregistrez une courte note sur ce que vous ressentez et ce qui s’est passé aujourd’hui.',
    tapToRecord: 'Touchez pour enregistrer',
    shortEnough: '30 à 60 secondes suffisent.',
    promptsTitle: 'Vous pouvez commencer par :',
    prompt1: 'Qu’est-ce qui a été lourd aujourd’hui ?',
    prompt2: 'Qu’est-ce qui a été plus simple que prévu ?',
    prompt3: 'Qu’est-ce qui reste dans votre esprit ?',
    prompt4: 'Comment votre corps se sent-il ce soir ?',
    reassurance: 'Il n’y a pas de bonne façon de le dire. Quelques mots sincères suffisent.',
    recordingState: 'Enregistrement',
    finish: 'Terminer',
    discard: 'Annuler',
    reflectionReceived: 'Note reçue',
    reflectionTitle: 'Voici votre note',
    reflectionFallback: 'Vous sembliez fatiguée aujourd’hui. Vous avez mentionné une pression au travail. Vous avez moins dormi que d’habitude.',
    suggestionTitle: 'Suggestion',
    suggestionText: 'Accordez-vous une soirée plus lente et couchez-vous un peu plus tôt.',
    seeRhythm: 'Voir votre rythme',
    saveReflection: 'Enregistrer la note',
    shareReflection: 'Partager la note',
    saving: 'Enregistrement...',
    copied: 'Note copiée.',
    shareError: 'Partage impossible pour le moment.',
    previousDayLabel: 'Yesterday you shared',
    compareToday: 'How does today feel compared to yesterday?',
  },
  de: {
    listeningLine: 'Sprich frei. Luna29 hört dir zu.',
    voiceTitle: 'Sprachnotiz',
    voiceSupport: 'Nimm eine kurze Notiz darüber auf, wie du dich fühlst und was heute passiert ist.',
    tapToRecord: 'Tippen zum Aufnehmen',
    shortEnough: '30–60 Sekunden reichen aus.',
    promptsTitle: 'Du kannst so beginnen:',
    prompt1: 'Was hat sich heute schwer angefühlt?',
    prompt2: 'Was war leichter als erwartet?',
    prompt3: 'Was beschäftigt dich noch?',
    prompt4: 'Wie fühlt sich dein Körper heute Abend an?',
    reassurance: 'Es gibt keinen richtigen Weg, es zu sagen. Ein paar ehrliche Worte reichen.',
    recordingState: 'Aufnahme',
    finish: 'Beenden',
    discard: 'Verwerfen',
    reflectionReceived: 'Notiz erhalten',
    reflectionTitle: 'Hier ist deine Notiz',
    reflectionFallback: 'Du klangst heute müde. Du hast Druck bei der Arbeit erwähnt. Du hast weniger geschlafen als sonst.',
    suggestionTitle: 'Vorschlag',
    suggestionText: 'Mach dir einen ruhigen Abend und geh heute etwas früher schlafen.',
    seeRhythm: 'Deinen Rhythmus sehen',
    saveReflection: 'Notiz speichern',
    shareReflection: 'Notiz teilen',
    saving: 'Speichern...',
    copied: 'Notiz kopiert.',
    shareError: 'Teilen ist gerade nicht möglich.',
    previousDayLabel: 'Yesterday you shared',
    compareToday: 'How does today feel compared to yesterday?',
  },
  zh: {
    listeningLine: '请自然表达，Luna29 正在倾听。',
    voiceTitle: '语音笔记',
    voiceSupport: '录一段简短笔记，说说你的感受和今天发生的事。',
    tapToRecord: '点击开始录音',
    shortEnough: '30–60 秒就够了。',
    promptsTitle: '你可以这样开始：',
    prompt1: '今天什么让你感到沉重？',
    prompt2: '什么比预期更轻松？',
    prompt3: '你现在还在想什么？',
    prompt4: '今晚你的身体感觉如何？',
    reassurance: '没有标准答案。几句真诚的话就足够。',
    recordingState: '录音中',
    finish: '完成',
    discard: '丢弃',
    reflectionReceived: '已收到笔记',
    reflectionTitle: '这是你的笔记',
    reflectionFallback: '你今天听起来有些疲惫。你提到工作上的压力。你的睡眠比平时少。',
    suggestionTitle: '建议',
    suggestionText: '今晚放慢节奏，尽量早点休息。',
    seeRhythm: '查看你的节律',
    saveReflection: '保存笔记',
    shareReflection: '分享笔记',
    saving: '保存中...',
    copied: '笔记已复制。',
    shareError: '暂时无法分享。',
    previousDayLabel: 'Yesterday you shared',
    compareToday: 'How does today feel compared to yesterday?',
  },
  ja: {
    listeningLine: '自由に話してください。Luna29 はあなたの声を聴いています。',
    voiceTitle: 'ボイスノート',
    voiceSupport: '今日の気持ちや出来事について、短いメモを録音しましょう。',
    tapToRecord: 'タップして録音',
    shortEnough: '30〜60秒で十分です。',
    promptsTitle: 'こんな始め方でも大丈夫です：',
    prompt1: '今日は何が重く感じましたか？',
    prompt2: '予想より楽だったことは？',
    prompt3: 'まだ心に残っていることは？',
    prompt4: '今夜、体はどんな感覚ですか？',
    reassurance: '正しい言い方はありません。正直な言葉を少し話すだけで十分です。',
    recordingState: '録音中',
    finish: '完了',
    discard: '破棄',
    reflectionReceived: 'メモを受け取りました',
    reflectionTitle: 'あなたのメモ',
    reflectionFallback: '今日は疲れているように聞こえました。仕事のプレッシャーについて話していました。睡眠はいつもより短めでした。',
    suggestionTitle: '提案',
    suggestionText: '今夜はゆっくり過ごして、少し早めに休みましょう。',
    seeRhythm: 'リズムを見る',
    saveReflection: 'メモを保存',
    shareReflection: 'メモを共有',
    saving: '保存中...',
    copied: 'メモをコピーしました。',
    shareError: '今は共有できません。',
    previousDayLabel: 'Yesterday you shared',
    compareToday: 'How does today feel compared to yesterday?',
  },
  pt: {
    listeningLine: 'Fale com liberdade. Luna29 está ouvindo você.',
    voiceTitle: 'Nota de voz',
    voiceSupport: 'Grave uma nota curta sobre como você se sente e o que aconteceu no seu dia.',
    tapToRecord: 'Toque para gravar',
    shortEnough: '30–60 segundos já são suficientes.',
    promptsTitle: 'Você pode começar com:',
    prompt1: 'O que pesou hoje?',
    prompt2: 'O que foi mais fácil do que o esperado?',
    prompt3: 'O que ainda está na sua mente?',
    prompt4: 'Como seu corpo se sente esta noite?',
    reassurance: 'Não existe jeito certo de dizer. Algumas palavras honestas já bastam.',
    recordingState: 'Gravando',
    finish: 'Finalizar',
    discard: 'Descartar',
    reflectionReceived: 'Nota recebida',
    reflectionTitle: 'Aqui está sua nota',
    reflectionFallback: 'Você soou cansada hoje. Você mencionou pressão no trabalho. Dormiu menos do que o normal.',
    suggestionTitle: 'Sugestão',
    suggestionText: 'Tenha uma noite mais tranquila e tente dormir um pouco mais cedo.',
    seeRhythm: 'Ver seu ritmo',
    saveReflection: 'Salvar nota',
    shareReflection: 'Compartilhar nota',
    saving: 'Salvando...',
    copied: 'Nota copiada.',
    shareError: 'Não foi possível compartilhar agora.',
    previousDayLabel: 'Yesterday you shared',
    compareToday: 'How does today feel compared to yesterday?',
  },
  ar: {
    listeningLine: 'Speak freely. Luna29 is listening.',
    voiceTitle: 'Voice Note',
    voiceSupport: 'Record a short note about how you feel and what happened during your day.',
    tapToRecord: 'Tap to record',
    shortEnough: '30–60 seconds is enough.',
    promptsTitle: 'You can start with:',
    prompt1: 'What felt heavy today?',
    prompt2: 'What felt easier than expected?',
    prompt3: 'What is still on your mind?',
    prompt4: 'How does your body feel tonight?',
    reassurance: 'There is no right way to say it. A few honest words are enough.',
    recordingState: 'Recording',
    finish: 'Finish',
    discard: 'Discard',
    reflectionReceived: 'Note received',
    reflectionTitle: "Here's your note",
    reflectionFallback: 'You sounded tired today. You mentioned pressure at work. You slept less than usual.',
    suggestionTitle: 'Suggestion',
    suggestionText: 'Take a slow evening and sleep earlier tonight.',
    seeRhythm: 'See your rhythm',
    saveReflection: 'Save note',
    shareReflection: 'Share note',
    saving: 'Saving...',
    copied: 'Note copied.',
    shareError: 'Could not share right now.',
    previousDayLabel: 'Yesterday you shared',
    compareToday: 'How does today feel compared to yesterday?',
  },
  he: {
    listeningLine: 'Speak freely. Luna29 is listening.',
    voiceTitle: 'Voice Note',
    voiceSupport: 'Record a short note about how you feel and what happened during your day.',
    tapToRecord: 'Tap to record',
    shortEnough: '30–60 seconds is enough.',
    promptsTitle: 'You can start with:',
    prompt1: 'What felt heavy today?',
    prompt2: 'What felt easier than expected?',
    prompt3: 'What is still on your mind?',
    prompt4: 'How does your body feel tonight?',
    reassurance: 'There is no right way to say it. A few honest words are enough.',
    recordingState: 'Recording',
    finish: 'Finish',
    discard: 'Discard',
    reflectionReceived: 'Note received',
    reflectionTitle: "Here's your note",
    reflectionFallback: 'You sounded tired today. You mentioned pressure at work. You slept less than usual.',
    suggestionTitle: 'Suggestion',
    suggestionText: 'Take a slow evening and sleep earlier tonight.',
    seeRhythm: 'See your rhythm',
    saveReflection: 'Save note',
    shareReflection: 'Share note',
    saving: 'Saving...',
    copied: 'Note copied.',
    shareError: 'Could not share right now.',
    previousDayLabel: 'Yesterday you shared',
    compareToday: 'How does today feel compared to yesterday?',
  },};

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructorLike;
    webkitSpeechRecognition?: SpeechRecognitionConstructorLike;
    webkitAudioContext?: typeof AudioContext;
  }
}

export const AudioReflection: React.FC<{ onBack: () => void, lang?: Language }> = ({ onBack, lang = 'en' }) => {
  const [voiceContent, setVoiceContent] = useState<import('../utils/voiceReflectionContent').VoiceReflectionCopy | null>(null);

  useEffect(() => {
    let alive = true;
    import('../utils/voiceReflectionContent').then((module) => {
      if (!alive) return;
      const next = module.getVoiceReflectionContent(lang);
      setVoiceContent(next.copy);
    });
    return () => {
      alive = false;
    };
  }, [lang]);

  const copy = voiceContent || {
    unsupported: 'Your browser does not support voice recognition. Please try Chrome or Safari.',
    listening: 'Listening...',
    micDenied: 'Microphone access denied. Check browser settings.',
    errorPrefix: 'Error',
    micAccess: 'Could not access microphone.',
    noSpeech: "I didn't catch that. Please try again.",
    unavailable: 'Luna29 is temporarily unavailable. Please try again.',
    back: 'Back to Journal',
    reflectionLabel: 'Live Note',
    subtitle: 'Speak your state. Luna29 is here to listen, understand, and respond.',
    holdToSpeak: 'Tap to speak',
    stopListening: 'Stop Listening',
    lunaReflecting: 'Luna29 is reflecting...',
    yourReflection: 'Your Note',
    lunaResponse: "Luna29's Response",
    reflecting: 'Reflecting...',
    listenAgain: 'Listen Again',
    save: 'Save to Journal',
    redo: 'Redo',
    recording: 'Recording...',
  };
  const ui = getLang(voiceUiByLang, lang) || voiceUiByLang.en;
  const recognitionLangByUi: LangCopy< string> = { en: 'en-US', ru: 'ru-RU', uk: 'uk-UA', es: 'es-ES', fr: 'fr-FR', de: 'de-DE', zh: 'zh-CN', ja: 'ja-JP', pt: 'pt-PT' };
  const recognitionLocales: Array<{ value: string; label: string }> = [
    { value: 'en-US', label: 'English (US)' },
    { value: 'ru-RU', label: 'Russian' },
    { value: 'uk-UA', label: 'Ukrainian' },
    { value: 'es-ES', label: 'Spanish' },
    { value: 'fr-FR', label: 'French' },
    { value: 'de-DE', label: 'German' },
    { value: 'zh-CN', label: 'Chinese' },
    { value: 'ja-JP', label: 'Japanese' },
    { value: 'pt-PT', label: 'Portuguese' },
  ];
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [interimTranscription, setInterimTranscription] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [audioLevel, setAudioLevel] = useState<number[]>(Array(12).fill(4));
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingStartedAt, setRecordingStartedAt] = useState<number | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string>("");
  const [displayedAiResponse, setDisplayedAiResponse] = useState("");
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [speakerMode, setSpeakerMode] = useState<'quiet' | 'normal' | 'loud'>('loud');
  const [speechVoices, setSpeechVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speechVoiceURI, setSpeechVoiceURI] = useState<string>(() => localStorage.getItem('luna_voice_uri') || '');
  const [speechLocale, setSpeechLocale] = useState<string>(() => {
    const stored = localStorage.getItem('luna_voice_locale');
    return stored || recognitionLangByUi[lang] || 'en-US';
  });
  const [sessionAudioDataUrl, setSessionAudioDataUrl] = useState<string | null>(null);
  const [isSavingRecording, setIsSavingRecording] = useState(false);
  const [savedVoiceClips, setSavedVoiceClips] = useState<SavedVoiceClip[]>(() => {
    try {
      const raw = localStorage.getItem(VOICE_CLIPS_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const recognitionActive = useRef(false);
  const isStoppingRecognitionRef = useRef(false);
  const isRecordingRef = useRef(false);
  const transcriptionRef = useRef("");
  const interimRef = useRef("");
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const playbackContextRef = useRef<AudioContext | null>(null);
  const playbackAnalyserRef = useRef<AnalyserNode | null>(null);
  const playbackGainRef = useRef<GainNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaChunksRef = useRef<BlobPart[]>([]);
  const recorderDataUrlPromiseRef = useRef<Promise<string | null> | null>(null);
  const recorderDataUrlResolveRef = useRef<((value: string | null) => void) | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const finalizeTimerRef = useRef<number | null>(null);
  const didFinalizeRef = useRef(false);
  const recognitionLang = speechLocale || recognitionLangByUi[lang] || navigator.language || 'en-US';
  const gainByMode: Record<'quiet' | 'normal' | 'loud', number> = { quiet: 0.35, normal: 1.0, loud: 1.8 };
  const speakingPalette = ['#f472b6', '#a78bfa', '#60a5fa', '#34d399', '#f59e0b'];
  const localeBase = recognitionLang.toLowerCase().split('-')[0];
  const localeVoices = speechVoices.filter((voice) => {
    const voiceLang = voice.lang.toLowerCase();
    return voiceLang === recognitionLang.toLowerCase() || voiceLang.startsWith(localeBase);
  });

  const scoreVoice = (voice: SpeechSynthesisVoice) => {
    const name = `${voice.name} ${voice.voiceURI}`.toLowerCase();
    let score = 0;
    if (voice.default) score += 1;
    if (name.includes('siri')) score += 8;
    if (name.includes('google')) score += 6;
    if (name.includes('natural')) score += 8;
    if (name.includes('neural')) score += 9;
    if (name.includes('enhanced')) score += 6;
    if (name.includes('premium')) score += 6;
    if (name.includes('online')) score += 3;
    if (name.includes('compact')) score -= 4;
    if (name.includes('espeak')) score -= 8;
    return score;
  };

  const bestLocaleVoice = localeVoices.slice().sort((a, b) => scoreVoice(b) - scoreVoice(a))[0] || null;

  const mapLocaleToLanguage = (locale: string): Language => {
    const base = locale.toLowerCase().split('-')[0];
    if (base === 'ru') return 'ru';
    if (base === 'uk') return 'uk';
    if (base === 'es') return 'es';
    if (base === 'fr') return 'fr';
    if (base === 'de') return 'de';
    if (base === 'zh') return 'zh';
    if (base === 'ja') return 'ja';
    if (base === 'pt') return 'pt';
    return 'en';
  };

  const blobToDataUrl = (blob: Blob): Promise<string | null> =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  useEffect(() => {
    if (!aiResponse) {
      setDisplayedAiResponse("");
      return;
    }
    let idx = 0;
    setDisplayedAiResponse("");
    const timer = window.setInterval(() => {
      idx += 1;
      setDisplayedAiResponse(aiResponse.slice(0, idx));
      if (idx >= aiResponse.length) {
        clearInterval(timer);
      }
    }, 12);
    return () => clearInterval(timer);
  }, [aiResponse]);

  useEffect(() => {
    if (!playbackGainRef.current) return;
    playbackGainRef.current.gain.value = isSpeakerMuted ? 0 : gainByMode[speakerMode];
  }, [gainByMode, isSpeakerMuted, speakerMode]);

  useEffect(() => {
    localStorage.setItem('luna_voice_locale', speechLocale);
  }, [speechLocale]);

  useEffect(() => {
    localStorage.setItem('luna_voice_uri', speechVoiceURI);
  }, [speechVoiceURI]);

  useEffect(() => {
    const mapped = recognitionLangByUi[lang] || 'en-US';
    const stored = localStorage.getItem('luna_voice_locale');
    if (!stored) setSpeechLocale(mapped);
  }, [lang]);

  useEffect(() => {
    if (!window.speechSynthesis) return;
    const loadVoices = () => setSpeechVoices(window.speechSynthesis.getVoices());
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  useEffect(() => {
    if (!localeVoices.length) return;
    if (speechVoiceURI && localeVoices.some((v) => v.voiceURI === speechVoiceURI)) return;
    if (bestLocaleVoice) {
      setSpeechVoiceURI(bestLocaleVoice.voiceURI);
    }
  }, [bestLocaleVoice, localeVoices, speechVoiceURI]);

  const finalizeRecognition = () => {
    if (didFinalizeRef.current) return;
    didFinalizeRef.current = true;

    if (finalizeTimerRef.current) {
      clearTimeout(finalizeTimerRef.current);
      finalizeTimerRef.current = null;
    }

    const finalText = (transcriptionRef.current + " " + interimRef.current).trim().replace(/\s+/g, " ");
    setInterimTranscription("");
    interimRef.current = "";

    if (finalText) {
      setTranscription(finalText);
      handleTranscription(finalText);
      return;
    }
    setError(copy.noSpeech);
  };

  // Initialize Speech Recognition once
  useEffect(() => {
    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      setError(copy.unsupported);
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = recognitionLang;

    recognition.onstart = () => {
      console.log("Speech recognition started");
      setStatusMsg(copy.listening);
    };

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      console.log("Recognition result:", { final, interim });

      if (final) {
        transcriptionRef.current += (transcriptionRef.current ? ' ' : '') + final;
        setTranscription(transcriptionRef.current);
      }
      interimRef.current = interim;
      setInterimTranscription(interim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
      console.error("Speech recognition error", event.error);
      if (event.error === 'not-allowed') {
        setError(copy.micDenied);
      } else if (event.error === 'language-not-supported') {
        recognition.lang = 'en-US';
        setSpeechLocale('en-US');
      } else if (event.error === 'no-speech') {
        // Ignore no-speech during active hold
      } else {
        setError(`${copy.errorPrefix}: ${event.error}`);
      }
    };

    recognition.onend = () => {
      console.log("Speech recognition ended");
      recognitionActive.current = false;
      setStatusMsg("");
      if (!isStoppingRecognitionRef.current) return;
      isStoppingRecognitionRef.current = false;
      finalizeRecognition();
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        try { recognitionRef.current.abort(); } catch (_e) {}
      }
    };
  }, [copy.errorPrefix, copy.listening, copy.micDenied, copy.noSpeech, copy.unsupported, recognitionLang]);

  // Audio Visualization Loop
  useEffect(() => {
    const updateLevels = () => {
      const activeAnalyser = analyserRef.current || playbackAnalyserRef.current;
      if (activeAnalyser) {
        const dataArray = new Uint8Array(activeAnalyser.frequencyBinCount);
        activeAnalyser.getByteFrequencyData(dataArray);
        const newLevels = Array(12).fill(0).map((_, i) => {
          const start = Math.floor(i * (dataArray.length / 12));
          const end = Math.floor((i + 1) * (dataArray.length / 12));
          let sum = 0;
          for (let j = start; j < end; j++) sum += dataArray[j];
          const avg = sum / (end - start);
          return Math.max(4, (avg / 255) * 60);
        });
        setAudioLevel(newLevels);
      } else if (isPlaying) {
        setAudioLevel(prev => prev.map(() => Math.random() * 30 + 5));
      } else {
        setAudioLevel(Array(12).fill(4));
      }
      animationIdRef.current = requestAnimationFrame(updateLevels);
    };

    animationIdRef.current = requestAnimationFrame(updateLevels);
    return () => {
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
    };
  }, [isPlaying]);

  const startRecording = async () => {
    setError(null);
    setTranscription("");
    transcriptionRef.current = "";
    interimRef.current = "";
    setInterimTranscription("");
    setAiResponse("");
    setDisplayedAiResponse("");
    setAudioBase64(null);
    setSessionAudioDataUrl(null);
    setIsSavingRecording(false);
    recorderDataUrlPromiseRef.current = null;
    recorderDataUrlResolveRef.current = null;
    stopAudio();
    didFinalizeRef.current = false;
    isStoppingRecognitionRef.current = false;
    if (finalizeTimerRef.current) {
      clearTimeout(finalizeTimerRef.current);
      finalizeTimerRef.current = null;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextCtor) {
          throw new Error('AudioContext is not supported');
        }
        audioContextRef.current = new AudioContextCtor();
      } else if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const analyser = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      if (typeof MediaRecorder !== 'undefined') {
        const mimeTypeCandidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
        const mimeType = mimeTypeCandidates.find((candidate) => MediaRecorder.isTypeSupported(candidate));
        const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
        mediaChunksRef.current = [];
        recorderDataUrlPromiseRef.current = new Promise<string | null>((resolve) => {
          recorderDataUrlResolveRef.current = resolve;
        });
        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            mediaChunksRef.current.push(event.data);
          }
        };
        recorder.onstop = async () => {
          if (!mediaChunksRef.current.length) {
            if (recorderDataUrlResolveRef.current) recorderDataUrlResolveRef.current(null);
            recorderDataUrlResolveRef.current = null;
            return;
          }
          const blob = new Blob(mediaChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
          const dataUrl = await blobToDataUrl(blob);
          if (dataUrl) {
            setSessionAudioDataUrl(dataUrl);
          }
          if (recorderDataUrlResolveRef.current) recorderDataUrlResolveRef.current(dataUrl);
          recorderDataUrlResolveRef.current = null;
        };
        mediaRecorderRef.current = recorder;
        recorder.start();
      }

      if (recognitionRef.current) {
        const recognition = recognitionRef.current;
        try {
          if (recognitionActive.current) {
            try { recognition.abort(); } catch (_e) {}
          }
          recognition.start();
          recognitionActive.current = true;
          console.log("Recognition started successfully");
        } catch (e) {
          console.warn("Recognition start error:", e);
          // Fallback: try to just start
          try { 
            recognition.abort();
            setTimeout(() => {
              recognition.start(); 
              recognitionActive.current = true;
            }, 100);
          } catch (_e2) {}
        }
      }
      setIsRecording(true);
      setRecordingStartedAt(Date.now());
    } catch (err) {
      console.error("Failed to start recording", err);
      setError(copy.micAccess);
    }
  };

  const stopRecording = () => {
    if (!isRecordingRef.current) return;
    setIsRecording(false);
    setRecordingStartedAt(null);
    isStoppingRecognitionRef.current = true;
    
    if (recognitionRef.current) {
      try { 
        recognitionRef.current.stop(); 
        recognitionActive.current = false;
      } catch (e) {
        console.warn("Recognition stop error:", e);
      }
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (_e) {}
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
      analyserRef.current = null;
    }
    
    finalizeTimerRef.current = window.setTimeout(() => {
      finalizeRecognition();
    }, 2000);
  };

  const handleTranscription = async (text: string) => {
    setIsAnalyzing(true);
    try {
      const langCode = mapLocaleToLanguage(recognitionLang);
      if (isVoiceAiEnabled() && isAiProcessingAllowed()) {
        const result = await requestLunaVoiceResponse({
          transcript: text,
          lang: langCode,
          mode: 'reflection',
          personaId: 'luna',
        });
        setAiResponse(result.text);
        if (result.audio) {
          setAudioBase64(result.audio);
          playAudio(result.audio);
        } else {
          speakText(result.text);
        }
        return;
      }

      const result = await generatePsychologistResponse(text, langCode);
      setAiResponse(result.text);
      if (result.audio) {
        setAudioBase64(result.audio);
        playAudio(result.audio);
      } else {
        speakText(result.text);
      }
    } catch (error) {
      console.error("AI Error:", error);
      setError(copy.unavailable);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const stopSpeechSynthesis = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
  };

  const speakText = (text: string) => {
    if (!text || isSpeakerMuted || !window.speechSynthesis) return;
    stopSpeechSynthesis();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = speechVoices.length ? speechVoices : window.speechSynthesis.getVoices();
    const selectedByUser = speechVoiceURI ? voices.find((voice) => voice.voiceURI === speechVoiceURI) : null;
    const exact = voices.find((voice) => voice.lang.toLowerCase() === recognitionLang.toLowerCase());
    const byBase = voices.find((voice) => voice.lang.toLowerCase().startsWith(localeBase));
    const naturalByBase = voices
      .filter((voice) => voice.lang.toLowerCase().startsWith(localeBase))
      .sort((a, b) => scoreVoice(b) - scoreVoice(a))[0];
    const selectedVoice = selectedByUser || naturalByBase || exact || byBase || null;
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    } else {
      utterance.lang = recognitionLang;
    }
    utterance.rate = speakerMode === 'quiet' ? 0.9 : speakerMode === 'normal' ? 0.96 : 1.0;
    utterance.pitch = 0.96;
    utterance.volume = speakerMode === 'quiet' ? 0.45 : speakerMode === 'normal' ? 0.9 : 1;
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => {
      setIsPlaying(false);
      setAudioLevel(Array(12).fill(4));
    };
    utterance.onerror = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
  };

  const playAudio = (base64: string) => {
    stopAudio();
    if (!base64) return;
    
    try {
      const audio = new Audio(`data:audio/mp3;base64,${base64}`);
      audioRef.current = audio;
      audio.crossOrigin = "anonymous";
      
      const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
      if (AudioContextCtor) {
        const playbackContext = new AudioContextCtor();
        playbackContextRef.current = playbackContext;
        const source = playbackContext.createMediaElementSource(audio);
        const gainNode = playbackContext.createGain();
        const analyser = playbackContext.createAnalyser();
        analyser.fftSize = 64;
        gainNode.gain.value = isSpeakerMuted ? 0 : gainByMode[speakerMode];
        source.connect(gainNode);
        gainNode.connect(analyser);
        analyser.connect(playbackContext.destination);
        playbackGainRef.current = gainNode;
        playbackAnalyserRef.current = analyser;
      }

      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => {
        setIsPlaying(false);
        setAudioLevel(Array(12).fill(4));
        playbackAnalyserRef.current = null;
        playbackGainRef.current = null;
        if (playbackContextRef.current) {
          playbackContextRef.current.close().catch(() => {});
          playbackContextRef.current = null;
        }
      };
      audio.onerror = () => setIsPlaying(false);
      
      audio.play().catch(err => {
        console.warn("Autoplay blocked:", err);
        setIsPlaying(false);
        if (aiResponse) speakText(aiResponse);
      });
    } catch (err) {
      console.error("Failed to initialize audio", err);
      setIsPlaying(false);
      if (aiResponse) speakText(aiResponse);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
    stopSpeechSynthesis();
    playbackAnalyserRef.current = null;
    playbackGainRef.current = null;
    if (playbackContextRef.current) {
      playbackContextRef.current.close().catch(() => {});
      playbackContextRef.current = null;
    }
  };

  const handleSave = async () => {
    if (isSavingRecording) return;
    setIsSavingRecording(true);
    let dataUrl = sessionAudioDataUrl;

    if (!dataUrl) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try { mediaRecorderRef.current.stop(); } catch (_e) {}
      }
      if (recorderDataUrlPromiseRef.current) {
        dataUrl = await recorderDataUrlPromiseRef.current;
      } else if (mediaChunksRef.current.length) {
        const blob = new Blob(mediaChunksRef.current, { type: mediaRecorderRef.current?.mimeType || 'audio/webm' });
        dataUrl = await blobToDataUrl(blob);
      }
    }

    if (dataUrl) {
      const clip: SavedVoiceClip = {
        id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
        createdAt: new Date().toISOString(),
        locale: recognitionLang,
        transcript: transcription || '',
        audioDataUrl: dataUrl,
      };
      try {
        const raw = localStorage.getItem(VOICE_CLIPS_STORAGE_KEY);
        const current = raw ? JSON.parse(raw) : [];
        const currentList: SavedVoiceClip[] = Array.isArray(current) ? current : [];
        const nextList = [clip, ...currentList].slice(0, 30);
        localStorage.setItem(VOICE_CLIPS_STORAGE_KEY, JSON.stringify(nextList));
        setSavedVoiceClips(nextList);
      } catch (_e) {
        setIsSavingRecording(false);
        setError('Could not save audio file. Storage is full or unavailable.');
        return;
      }
    }
    dataService.logEvent('AUDIO_REFLECTION', { text: transcription, ai_response: aiResponse });
    setIsSavingRecording(false);
    setStatusMsg(ui.copied);
  };

  const handleDeleteClip = (id: string) => {
    setSavedVoiceClips((prev) => prev.filter((clip) => clip.id !== id));
  };

  const handleClearAllClips = () => {
    setSavedVoiceClips([]);
  };

  const handleDownloadClip = (clip: SavedVoiceClip) => {
    const link = document.createElement('a');
    link.href = clip.audioDataUrl;
    const ts = clip.createdAt.replace(/[:.]/g, '-');
    link.download = `luna-voice-${ts}.webm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const discardCurrentReflection = () => {
    if (finalizeTimerRef.current) {
      clearTimeout(finalizeTimerRef.current);
      finalizeTimerRef.current = null;
    }
    didFinalizeRef.current = true;
    isStoppingRecognitionRef.current = false;
    recognitionActive.current = false;
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (_e) {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch (_e) {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
      analyserRef.current = null;
    }
    setIsRecording(false);
    setRecordingStartedAt(null);
    setRecordingSeconds(0);
    setTranscription('');
    setInterimTranscription('');
    transcriptionRef.current = '';
    interimRef.current = '';
    setAiResponse('');
    setDisplayedAiResponse('');
    setError(null);
    setSessionAudioDataUrl(null);
    setStatusMsg('');
    stopAudio();
  };

  const shareReflection = async () => {
    const payload = aiResponse || displayedAiResponse || transcription;
    if (!payload) return;
    const text = `Luna29 note:\n${payload}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Luna29 Note', text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setStatusMsg(ui.copied);
    } catch {
      setStatusMsg(ui.shareError);
    }
  };

  const profileName = useMemo(() => {
    try {
      const state = dataService.projectState(dataService.getLog());
      return state.profile?.name?.trim() || 'Anna';
    } catch {
      return 'Anna';
    }
  }, []);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const projectedState = useMemo(() => {
    try {
      return dataService.projectState(dataService.getLog());
    } catch {
      return null;
    }
  }, [transcription, aiResponse]);

  const currentDay = projectedState?.currentDay ?? 1;
  const cycleLength = projectedState?.cycleLength ?? 28;
  const lastCheckinMetrics = projectedState?.lastCheckin?.metrics || null;

  const cyclePhaseLabel = useMemo(() => {
    const day = Math.max(1, Math.min(currentDay, cycleLength));
    if (day <= 5) return 'Menstrual phase';
    if (day <= 13) return 'Follicular phase';
    if (day <= 16) return 'Ovulatory phase';
    return 'Luteal phase';
  }, [currentDay, cycleLength]);

  const contextLevel = (value?: number) => {
    if (typeof value !== 'number') return 'Not set yet';
    if (value < 34) return 'Low';
    if (value < 67) return 'Medium';
    return 'High';
  };

  const contextMood = (value?: number) => {
    if (typeof value !== 'number') return 'Not set yet';
    if (value < 34) return 'A little sensitive';
    if (value < 67) return 'Steady';
    return 'Open and social';
  };

  const contextSleep = (value?: number) => {
    if (typeof value !== 'number') return 'Not set yet';
    const totalMinutes = 240 + Math.round((Math.max(0, Math.min(100, value)) / 100) * 300);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h} hours ${m.toString().padStart(2, '0')} minutes`;
  };

  const heardLines = useMemo(() => {
    const source = (aiResponse || transcription || '').trim();
    const cleaned = source.replace(/\s+/g, ' ');
    const sentences = cleaned
      .split(/(?<=[.!?])\s+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 3);
    if (sentences.length >= 2) return sentences;
    return [
      'You sounded a little tired today.',
      'You mentioned pressure at work.',
      'You also said your sleep was shorter than usual.',
    ];
  }, [aiResponse, transcription]);

  const patternLine = useMemo(() => {
    try {
      const log = dataService.getLog();
      const meaningfulReflections = log.filter((event) => event.type === 'AUDIO_REFLECTION' || event.type === 'DAILY_CHECKIN').length;
      if (meaningfulReflections >= 4) {
        return 'Your energy often drops a couple of days before your cycle.';
      }
    } catch {
      // Keep learning state fallback.
    }
    return 'Luna29 is still learning about you. The more you reflect, the clearer your rhythm becomes.';
  }, [transcription, aiResponse]);

  const previousDayLine = useMemo(() => {
    const toDayKey = (iso: string) => new Date(iso).toISOString().slice(0, 10);
    const todayKey = new Date().toISOString().slice(0, 10);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().slice(0, 10);

    const describe = (event: { type: string; payload: unknown }) => {
      if (event.type === 'DAILY_CHECKIN') {
        const payload = event.payload as { metrics?: Record<string, number> };
        const sleep = payload.metrics?.sleep ?? 50;
        const energy = payload.metrics?.energy ?? 50;
        if (sleep < 45) return 'you felt tired after a short sleep.';
        if (energy < 45) return 'your energy felt lower.';
        return 'your day felt more balanced.';
      }
      const payload = event.payload as { text?: string; transcript?: string };
      const text = (payload?.text || payload?.transcript || '').toLowerCase();
      if (/(work|office|deadline|meeting|job|pressure)/i.test(text)) return 'work felt demanding.';
      if (/(sleep|tired|drained|insomnia|stress|overwhelmed)/i.test(text)) return 'you felt tired and needed rest.';
      if (/(calm|steady|better|lighter)/i.test(text)) return 'you felt calmer.';
      return 'you shared how your day felt.';
    };

    const timeline = dataService
      .getLog()
      .filter((event) => event.type === 'AUDIO_REFLECTION' || event.type === 'DAILY_CHECKIN')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const yesterdayEvent = timeline.find((event) => toDayKey(event.timestamp) === yesterdayKey);
    if (yesterdayEvent) return describe(yesterdayEvent);

    const previousEvent = timeline.find((event) => toDayKey(event.timestamp) !== todayKey);
    if (previousEvent) return describe(previousEvent);

    return '';
  }, [transcription, aiResponse]);

  const recentThread = useMemo(() => {
    const toDayStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const todayStart = toDayStart(new Date());

    const formatDayLabel = (iso: string) => {
      const date = new Date(iso);
      const diffDays = Math.floor((todayStart - toDayStart(date)) / 86400000);
      if (diffDays <= 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      return `${diffDays} days ago`;
    };

    const normalizeLine = (raw: string) => {
      const clean = raw.replace(/\s+/g, ' ').trim();
      if (!clean) return '';
      const firstSentence = clean.split(/(?<=[.!?])\s/)[0]?.trim() || clean;
      return firstSentence.length > 80 ? `${firstSentence.slice(0, 77).trim()}...` : firstSentence;
    };

    const fromLog = (() => {
      try {
        return dataService
          .getLog()
          .filter((event) => event.type === 'AUDIO_REFLECTION')
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .map((event) => {
            const payload = event.payload as { text?: string; transcript?: string };
            const line = normalizeLine(payload?.text || payload?.transcript || '');
            return line
              ? {
                  id: event.id,
                  dayLabel: formatDayLabel(event.timestamp),
                  text: line,
                }
              : null;
          })
          .filter(Boolean) as Array<{ id: string; dayLabel: string; text: string }>;
      } catch {
        return [] as Array<{ id: string; dayLabel: string; text: string }>;
      }
    })();

    const currentLine = normalizeLine(heardLines[0] || transcription || aiResponse || '');
    const withCurrent = currentLine
      ? [{ id: 'current', dayLabel: 'Today', text: currentLine }, ...fromLog.filter((entry) => entry.text !== currentLine)]
      : fromLog;

    return withCurrent.slice(0, 4);
  }, [aiResponse, heardLines, transcription]);

  const recordingTimerLabel = useMemo(() => {
    const m = Math.floor(recordingSeconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (recordingSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }, [recordingSeconds]);

  useEffect(() => {
    if (!isRecording || !recordingStartedAt) {
      setRecordingSeconds(0);
      return;
    }
    const id = window.setInterval(() => {
      setRecordingSeconds(Math.max(0, Math.floor((Date.now() - recordingStartedAt) / 1000)));
    }, 250);
    return () => window.clearInterval(id);
  }, [isRecording, recordingStartedAt]);

  useEffect(() => {
    return () => {
      if (finalizeTimerRef.current) {
        clearTimeout(finalizeTimerRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try { mediaRecorderRef.current.stop(); } catch (_e) {}
      }
      if (playbackContextRef.current) {
        playbackContextRef.current.close().catch(() => {});
      }
      stopSpeechSynthesis();
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto luna-page-shell luna-page-voice space-y-6 p-6 md:p-8">
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={onBack}
        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-luna-purple transition-all"
      >
        <X size={14} /> {copy.back}
      </motion.button>

      <header className="space-y-1">
        <p className="text-base font-semibold text-slate-700 dark:text-slate-200">{greeting}, {profileName}</p>
        <p className="text-sm italic font-medium text-slate-500 dark:text-slate-300">{ui.listeningLine}</p>
      </header>

      <main className="luna-vivid-surface p-8 md:p-10 rounded-[2.6rem] relative overflow-hidden border border-slate-200/70 dark:border-slate-700/55 shadow-[0_26px_70px_rgba(88,70,126,0.18)] dark:shadow-[0_30px_72px_rgba(0,0,0,0.5)]">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-luna-purple/12 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-rose-400/12 rounded-full blur-3xl" />

        <article className="relative z-10 mx-auto max-w-2xl rounded-[2rem] border border-slate-200/70 dark:border-slate-800/75 bg-white/78 dark:bg-slate-950/45 p-7 md:p-8 text-center shadow-[0_16px_36px_rgba(88,70,126,0.14)] dark:shadow-[0_18px_38px_rgba(0,0,0,0.42)]">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100">{ui.voiceTitle}</h2>
          <p className="mt-3 text-base font-medium text-slate-600 dark:text-slate-300">{ui.voiceSupport}</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{ui.shortEnough}</p>

          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="relative">
              {isRecording && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0.24 }}
                  animate={{ scale: 1.6, opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                  className="absolute inset-0 rounded-full bg-rose-400"
                />
              )}
              <button
                onClick={() => (isRecording ? stopRecording() : startRecording())}
                className={`relative w-28 h-28 rounded-full flex items-center justify-center text-white transition-all ${
                  isRecording ? 'bg-rose-500 hover:bg-rose-600 shadow-[0_0_32px_rgba(244,63,94,0.35)]' : 'bg-luna-purple hover:brightness-110 shadow-luna-deep'
                }`}
              >
                {isRecording ? <Square size={34} fill="currentColor" /> : <Mic size={34} />}
              </button>
            </div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{isRecording ? copy.recording : ui.tapToRecord}</p>

            <div className="h-12 flex items-center gap-1.5">
              {audioLevel.map((level, i) => (
                <motion.div
                  key={i}
                  animate={{ height: isRecording || isPlaying ? level : 4 }}
                  className={`w-1.5 rounded-full ${isRecording ? 'bg-rose-400' : 'bg-slate-300 dark:bg-slate-700'}`}
                  transition={{ type: 'spring', stiffness: 280, damping: 16 }}
                />
              ))}
            </div>
          </div>
        </article>

        <section className="relative z-10 mt-6 mx-auto max-w-2xl space-y-4 text-left">
          <div className="rounded-[1.5rem] border border-slate-200/70 dark:border-slate-800/75 bg-white/72 dark:bg-slate-900/40 p-5">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{ui.promptsTitle}</p>
            <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <p>• {ui.prompt1}</p>
              <p>• {ui.prompt2}</p>
              <p>• {ui.prompt3}</p>
              <p>• {ui.prompt4}</p>
            </div>
          </div>
          <p className="text-sm italic text-slate-500 dark:text-slate-300">{ui.reassurance}</p>
        </section>

        <AnimatePresence>
          {isRecording && (
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="relative z-10 mt-6 mx-auto max-w-2xl rounded-[1.6rem] border border-rose-200/70 dark:border-rose-800/65 bg-rose-50/70 dark:bg-rose-900/20 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-rose-700 dark:text-rose-300">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  {ui.recordingState}
                </span>
                <span className="text-sm font-black text-rose-700 dark:text-rose-300">{recordingTimerLabel}</span>
              </div>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                {(transcription || interimTranscription).trim() || copy.listening}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={stopRecording}
                  className="flex-1 min-w-[160px] py-2.5 rounded-full bg-rose-500 text-white text-[11px] font-black uppercase tracking-[0.16em]"
                >
                  {ui.finish}
                </button>
                <button
                  onClick={discardCurrentReflection}
                  className="flex-1 min-w-[160px] py-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-200 text-[11px] font-black uppercase tracking-[0.16em]"
                >
                  {ui.discard}
                </button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {(transcription || isAnalyzing || error) && !isRecording && (
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative z-10 mt-8 space-y-6 pt-7 border-t border-slate-200/70 dark:border-slate-700/60"
            >
              <div className="space-y-1 text-left max-w-3xl mx-auto">
                <p className="text-base font-semibold text-slate-700 dark:text-slate-200">{greeting}, {profileName}</p>
                <p className="text-sm text-slate-500 dark:text-slate-300">Here is your note.</p>
              </div>

              {isAnalyzing ? (
                <div className="max-w-3xl mx-auto rounded-[1.8rem] border border-slate-200/70 dark:border-slate-800/75 bg-white/75 dark:bg-slate-900/45 p-6">
                  <div className="flex justify-center gap-2">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ scale: [1, 1.5, 1], opacity: [0.28, 1, 0.28] }}
                        transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                        className="w-2.5 h-2.5 bg-luna-purple rounded-full"
                      />
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-center gap-2 text-luna-purple">
                    <Sparkles size={16} className="animate-pulse" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">{copy.lunaReflecting}</p>
                  </div>
                </div>
              ) : (
                <article className="max-w-3xl mx-auto rounded-[1.8rem] border border-slate-200/70 dark:border-slate-800/75 bg-white/78 dark:bg-slate-900/45 p-6 text-left">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-luna-purple mb-3">What Luna29 heard</p>
                  <div className="space-y-3 text-base leading-relaxed text-slate-700 dark:text-slate-200">
                    {heardLines.map((line, idx) => (
                      <p key={`${line.slice(0, 18)}-${idx}`} className="font-medium">
                        {line}
                      </p>
                    ))}
                    {error && (
                      <p className="text-rose-500 dark:text-rose-300">{error}</p>
                    )}
                  </div>
                  {previousDayLine && (
                    <div className="mt-4 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 p-3">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        {ui.previousDayLabel}: {previousDayLine}
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-300">{ui.compareToday}</p>
                    </div>
                  )}
                </article>
              )}

              {!isAnalyzing && (
                <>
                  <article className="max-w-3xl mx-auto rounded-[1.6rem] border border-luna-purple/25 bg-luna-purple/10 dark:bg-luna-purple/15 p-5 text-left">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-luna-purple">A small suggestion for tonight</p>
                    <div className="mt-2 space-y-2 text-base text-slate-800 dark:text-slate-100">
                      <p className="font-semibold">Take a slower evening.</p>
                      <p className="font-medium">Try to rest a little earlier tonight.</p>
                    </div>
                  </article>

                  <article className="max-w-3xl mx-auto rounded-[1.6rem] border border-slate-200/70 dark:border-slate-800/75 bg-white/70 dark:bg-slate-900/45 p-5 text-left">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-luna-purple">Today</p>
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="rounded-xl bg-slate-100/85 dark:bg-slate-800/65 p-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">Cycle</p>
                        <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">Day {currentDay} · {cyclePhaseLabel}</p>
                      </div>
                      <div className="rounded-xl bg-slate-100/85 dark:bg-slate-800/65 p-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">Energy</p>
                        <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">{contextLevel(lastCheckinMetrics?.energy)}</p>
                      </div>
                      <div className="rounded-xl bg-slate-100/85 dark:bg-slate-800/65 p-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">Mood</p>
                        <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">{contextMood(lastCheckinMetrics?.mood)}</p>
                      </div>
                      <div className="rounded-xl bg-slate-100/85 dark:bg-slate-800/65 p-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">Sleep</p>
                        <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">{contextSleep(lastCheckinMetrics?.sleep)}</p>
                      </div>
                    </div>
                  </article>

                  <article className="max-w-3xl mx-auto rounded-[1.6rem] border border-slate-200/70 dark:border-slate-800/75 bg-white/70 dark:bg-slate-900/45 p-5 text-left">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-luna-purple">Something Luna29 is starting to notice</p>
                    <p className="mt-2 text-base font-medium text-slate-700 dark:text-slate-200">{patternLine}</p>
                  </article>

                  <article className="max-w-3xl mx-auto rounded-[1.6rem] border border-slate-200/70 dark:border-slate-800/75 bg-white/70 dark:bg-slate-900/45 p-5 text-left">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-luna-purple">Recent thread</p>
                    {recentThread.length >= 2 ? (
                      <div className="mt-3 space-y-3">
                        {recentThread.map((entry) => (
                          <div key={entry.id} className="rounded-xl bg-slate-100/85 dark:bg-slate-800/65 p-3">
                            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">{entry.dayLabel}</p>
                            <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">{entry.text}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                        Your story with Luna29 is just beginning.
                      </p>
                    )}
                  </article>

                  <div className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-3">
                    {transcription && (
                      <button
                        onClick={() => {
                          void handleSave();
                        }}
                        disabled={isSavingRecording}
                        className="flex-1 py-2.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white/90 dark:bg-slate-900 text-slate-700 dark:text-slate-100 text-[10px] font-black uppercase tracking-[0.16em] hover:bg-slate-100 dark:hover:bg-slate-800 transition-all disabled:opacity-60"
                      >
                        <span className="inline-flex items-center justify-center gap-2">
                          <Save size={14} /> {isSavingRecording ? ui.saving : 'Save note'}
                        </span>
                      </button>
                    )}
                    <button
                      onClick={onBack}
                      className="flex-1 py-2.5 rounded-full border border-luna-purple/35 bg-luna-purple/12 text-luna-purple text-[10px] font-black uppercase tracking-[0.16em] hover:bg-luna-purple/20 transition-all"
                    >
                      See your rhythm
                    </button>
                    <button
                      onClick={() => {
                        void shareReflection();
                      }}
                      className="flex-1 py-2.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white/90 dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-[10px] font-black uppercase tracking-[0.16em] hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                    >
                      <span className="inline-flex items-center justify-center gap-2">
                        <Share2 size={14} /> Share note
                      </span>
                    </button>
                  </div>

                  <div className="max-w-3xl mx-auto">
                    <button
                      onClick={discardCurrentReflection}
                      className="py-2.5 px-4 rounded-full text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 hover:text-rose-500 transition-colors"
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <RefreshCw size={12} />
                        {copy.redo}
                      </span>
                    </button>
                  </div>
                </>
              )}
            </motion.section>
          )}
        </AnimatePresence>

        <details className="relative z-10 mt-8 max-w-3xl mx-auto">
          <summary className="cursor-pointer text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-luna-purple">
            Voice settings & saved files
          </summary>
          <section className="mt-3 rounded-[1.4rem] border border-slate-200/70 dark:border-slate-800/75 bg-white/70 dark:bg-slate-900/45 p-4 space-y-4 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={speechLocale}
                onChange={(e) => setSpeechLocale(e.target.value)}
                className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.16em] bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 outline-none"
              >
                {recognitionLocales.map((locale) => (
                  <option key={locale.value} value={locale.value}>
                    {locale.label}
                  </option>
                ))}
              </select>
              <select
                value={speechVoiceURI}
                onChange={(e) => setSpeechVoiceURI(e.target.value)}
                className="max-w-[260px] px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.08em] bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 outline-none"
              >
                <option value="">{bestLocaleVoice ? `Auto: ${bestLocaleVoice.name}` : 'Auto voice'}</option>
                {localeVoices.map((voice) => (
                  <option key={voice.voiceURI} value={voice.voiceURI}>
                    {voice.name}
                  </option>
                ))}
              </select>
            </div>
            {savedVoiceClips.length > 0 && (
              <div className="space-y-2 max-h-44 overflow-auto">
                {savedVoiceClips.slice(0, 5).map((clip, index) => (
                  <div key={clip.id} className="rounded-xl bg-slate-100/80 dark:bg-slate-800/80 p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                      File {savedVoiceClips.length - index}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => handleDownloadClip(clip)}
                        className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.16em] bg-luna-purple/15 text-luna-purple"
                      >
                        Download
                      </button>
                      <button
                        onClick={() => handleDeleteClip(clip.id)}
                        className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.16em] bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={handleClearAllClips}
                  className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.16em] bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-100"
                >
                  Clear all
                </button>
              </div>
            )}
          </section>
        </details>
      </main>

      {statusMsg && <p className="text-center text-xs text-slate-500 dark:text-slate-300">{statusMsg}</p>}
    </div>
  );
};
