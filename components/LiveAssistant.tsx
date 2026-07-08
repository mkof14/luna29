import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Logo } from './Logo';
import { Mic, MicOff, Moon, Sun, Volume2, VolumeX } from 'lucide-react';
import { Language, LangCopy, getLang } from '../constants';
import {
  DEFAULT_LUNA_PERSONA_ID,
  type LunaVoicePersonaId,
  personaIntroByLang,
} from '../utils/lunaVoicePersonas';
import {
  fetchVoiceServiceConfig,
  isVoiceAiEnabled,
  requestLunaVoiceResponse,
  type VoiceServiceConfig,
} from '../services/voiceConversationService';

type ConnectionStatus = 'IDLE' | 'CONNECTING' | 'CONNECTED' | 'ERROR';
type AssistantTheme = 'light' | 'dark';

interface ChatMessage {
  role: 'user' | 'luna' | 'system';
  text: string;
}

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

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructorLike;
    webkitSpeechRecognition?: SpeechRecognitionConstructorLike;
  }
}

const TypewriterText: React.FC<{ text: string; speed?: number }> = ({ text, speed = 12 }) => {
  const [typed, setTyped] = useState('');

  useEffect(() => {
    if (!text) {
      setTyped('');
      return;
    }
    let index = 0;
    setTyped('');
    const timer = window.setInterval(() => {
      index += 1;
      setTyped(text.slice(0, index));
      if (index >= text.length) {
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return <span>{typed}</span>;
};

const copyByLang: LangCopy< {
  live: string;
  micOn: string;
  micOff: string;
  speakerLive: string;
  speakerMuted: string;
  placeholder: string;
  localMode: string;
  intro: string;
  unsupported: string;
  micDenied: string;
  noSpeech: string;
  syncInterrupted: string;
  initFailed: string;
  restart: string;
  thinking?: string;
  previewBadge?: string;
  previewIntro?: string;
  previewNote?: string;
  turnsLeft?: string;
  limitReached?: string;
  signInCta?: string;
  signUpCta?: string;
  memberOnlyVoice?: string;
}> = {
  en: {
    live: 'Live', micOn: 'On', micOff: 'Off', speakerLive: 'Live', speakerMuted: 'Muted',
    placeholder: 'Share your reflection...',
    localMode: '',
    intro: 'I am here with you — voice or text. Share what feels most alive right now.',
    unsupported: 'Voice recognition is not supported in this browser.',
    micDenied: 'Microphone access denied. Check browser settings.',
    noSpeech: "I could not catch speech. Please try again.",
    syncInterrupted: 'Sync Interrupted',
    initFailed: 'The assistant failed to initialize.',
    restart: 'Restart',
    thinking: 'Luna is listening…',
    previewBadge: 'Preview',
    previewIntro: 'Welcome — this is a short Luna29 Live preview. Ask one question about how you feel today.',
    previewNote: 'Full voice AI, Luna personas, and cycle-aware replies unlock in Member Zone.',
    turnsLeft: '{n} preview messages left',
    limitReached: 'Preview limit reached. Sign in for full Luna29 Live with AI voice and your rhythm data.',
    signInCta: 'Sign in',
    signUpCta: 'Create free account',
    memberOnlyVoice: 'Premium Luna voice — members only',
  },
  ru: {
    live: 'Live', micOn: 'Вкл', micOff: 'Выкл', speakerLive: 'Звук', speakerMuted: 'Тихо',
    placeholder: 'Поделитесь вашим состоянием...',
    localMode: '',
    intro: 'Я рядом — голосом или текстом. Расскажи, что сейчас чувствуется сильнее всего.',
    unsupported: 'Распознавание речи не поддерживается в этом браузере.',
    micDenied: 'Доступ к микрофону запрещен. Проверьте настройки браузера.',
    noSpeech: 'Не удалось распознать речь. Попробуйте еще раз.',
    syncInterrupted: 'Связь прервана',
    initFailed: 'Ассистент не смог инициализироваться.',
    restart: 'Перезапустить',
    thinking: 'Luna слушает…',
    previewBadge: 'Preview',
    previewIntro: 'Это короткий preview Luna29 Live. Спросите, как вы себя чувствуете сегодня.',
    previewNote: 'Полный AI-голос, персоны Luna и ответы с учётом цикла — в Member Zone после входа.',
    turnsLeft: 'Осталось {n} сообщений preview',
    limitReached: 'Лимит preview исчерпан. Войдите для полного Luna29 Live с AI-голосом и вашими данными.',
    signInCta: 'Войти',
    signUpCta: 'Создать аккаунт',
    memberOnlyVoice: 'Голос Luna Premium — только для участников',
  },
  uk: {
    live: 'Live', micOn: 'Увiмк', micOff: 'Вимк', speakerLive: 'Звук', speakerMuted: 'Тихо',
    placeholder: 'Поділіться своїм станом...',
    localMode: '[Локальний режим: відповіді ШІ у dev працюють локально]',
    intro: 'Я доступна у голосовому та текстовому режимі. Розкажіть, що зараз найважливіше.',
    unsupported: 'Розпізнавання мовлення не підтримується в цьому браузері.',
    micDenied: 'Доступ до мікрофона заборонено. Перевірте налаштування браузера.',
    noSpeech: 'Не вдалося розпізнати мовлення. Спробуйте ще раз.',
    syncInterrupted: 'Звʼязок перервано',
    initFailed: 'Локальний асистент не зміг ініціалізуватись.',
    restart: 'Перезапустити',
  },
  es: {
    live: 'Live', micOn: 'On', micOff: 'Off', speakerLive: 'Audio', speakerMuted: 'Mudo',
    placeholder: 'Comparte tu estado...',
    localMode: '[Modo local activo: la IA usa respuestas locales en dev]',
    intro: 'Estoy disponible en modo voz + texto. Comparte lo más importante ahora.',
    unsupported: 'El reconocimiento de voz no es compatible con este navegador.',
    micDenied: 'Acceso al micrófono denegado. Revisa la configuración.',
    noSpeech: 'No se detectó voz. Inténtalo de nuevo.',
    syncInterrupted: 'Sincronización interrumpida',
    initFailed: 'El asistente local no pudo inicializarse.',
    restart: 'Reiniciar',
  },
  fr: {
    live: 'Live', micOn: 'On', micOff: 'Off', speakerLive: 'Audio', speakerMuted: 'Muet',
    placeholder: 'Partagez votre état...',
    localMode: '[Mode local actif : réponses IA locales en dev]',
    intro: 'Je suis disponible en mode voix + texte. Partagez ce qui est le plus important maintenant.',
    unsupported: 'La reconnaissance vocale n’est pas prise en charge par ce navigateur.',
    micDenied: 'Accès microphone refusé. Vérifiez les paramètres.',
    noSpeech: 'Aucune voix détectée. Réessayez.',
    syncInterrupted: 'Synchronisation interrompue',
    initFailed: 'L’assistant local n’a pas pu s’initialiser.',
    restart: 'Redémarrer',
  },
  de: {
    live: 'Live', micOn: 'An', micOff: 'Aus', speakerLive: 'Ton', speakerMuted: 'Stumm',
    placeholder: 'Teile deinen Zustand...',
    localMode: '[Lokaler Modus aktiv: KI antwortet lokal im Dev-Modus]',
    intro: 'Ich bin im Sprach- und Textmodus verfügbar. Teile, was jetzt am wichtigsten ist.',
    unsupported: 'Spracherkennung wird in diesem Browser nicht unterstützt.',
    micDenied: 'Mikrofonzugriff verweigert. Bitte Einstellungen prüfen.',
    noSpeech: 'Keine Sprache erkannt. Bitte erneut versuchen.',
    syncInterrupted: 'Sync unterbrochen',
    initFailed: 'Der lokale Assistent konnte nicht initialisiert werden.',
    restart: 'Neustart',
  },
  zh: {
    live: 'Live', micOn: '开', micOff: '关', speakerLive: '声音', speakerMuted: '静音',
    placeholder: '请描述你当前的状态...',
    localMode: '[本地模式：开发环境下 AI 使用本地回复]',
    intro: '我支持语音与文字模式。请告诉我你现在最重要的感受。',
    unsupported: '当前浏览器不支持语音识别。',
    micDenied: '麦克风权限被拒绝，请检查浏览器设置。',
    noSpeech: '未检测到语音，请重试。',
    syncInterrupted: '同步中断',
    initFailed: '本地助手初始化失败。',
    restart: '重启',
  },
  ja: {
    live: 'Live', micOn: 'On', micOff: 'Off', speakerLive: '音声', speakerMuted: 'ミュート',
    placeholder: 'いまの状態を共有してください...',
    localMode: '[ローカルモード: dev では AI 応答はローカル処理です]',
    intro: '音声とテキストで利用できます。いま一番大事なことを話してください。',
    unsupported: 'このブラウザは音声認識に対応していません。',
    micDenied: 'マイクへのアクセスが拒否されました。設定を確認してください。',
    noSpeech: '音声を検出できませんでした。もう一度お試しください。',
    syncInterrupted: '同期が中断されました',
    initFailed: 'ローカルアシスタントを初期化できませんでした。',
    restart: '再起動',
  },
  pt: {
    live: 'Live', micOn: 'On', micOff: 'Off', speakerLive: 'Som', speakerMuted: 'Mudo',
    placeholder: 'Compartilhe seu estado...',
    localMode: '[Modo local ativo: IA usa respostas locais em dev]',
    intro: 'Estou disponível em voz + texto. Compartilhe o que é mais importante agora.',
    unsupported: 'Reconhecimento de voz não é suportado neste navegador.',
    micDenied: 'Acesso ao microfone negado. Verifique as configurações.',
    noSpeech: 'Nenhuma fala detectada. Tente novamente.',
    syncInterrupted: 'Sincronização interrompida',
    initFailed: 'O assistente local não conseguiu inicializar.',
    restart: 'Reiniciar',
  },
  ar: {
    live: 'مباشر', micOn: 'تشغيل', micOff: 'إيقاف', speakerLive: 'صوت', speakerMuted: 'صامت',
    placeholder: 'شاركي ما تشعرين به...',
    localMode: '',
    intro: 'أنا هنا معكِ — صوتاً أو نصاً. شاركي ما يشعركِ بالحياة الآن.',
    unsupported: 'التعرف على الصوت غير مدعوم في هذا المتصفح.',
    micDenied: 'تم رفض الوصول إلى الميكروفون. تحققي من إعدادات المتصفح.',
    noSpeech: 'لم ألتقط كلاماً. حاولي مرة أخرى.',
    syncInterrupted: 'انقطعت المزامنة',
    initFailed: 'تعذّر تهيئة المساعد.',
    restart: 'إعادة التشغيل',
    thinking: 'Luna تستمع…',
  },
  he: {
    live: 'חי', micOn: 'פועל', micOff: 'כבוי', speakerLive: 'שמע', speakerMuted: 'מושתק',
    placeholder: 'שתפי מה שאת מרגישה...',
    localMode: '',
    intro: 'אני כאן איתך — קול או טקסט. שתפי מה מרגיש הכי חי עכשיו.',
    unsupported: 'זיהוי קול לא נתמך בדפדפן הזה.',
    micDenied: 'הגישה למיקרופון נדחתה. בדקי את הגדרות הדפדפן.',
    noSpeech: 'לא תפסתי דיבור. נסי שוב.',
    syncInterrupted: 'הסנכרון נקטע',
    initFailed: 'העוזרת לא הצליחה להתאתחל.',
    restart: 'הפעלה מחדש',
    thinking: 'Luna מקשיבה…',
  },
};

const recognitionLangByUi: LangCopy<string> = {
  en: 'en-US',
  ru: 'ru-RU',
  uk: 'uk-UA',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  zh: 'zh-CN',
  ja: 'ja-JP',
  pt: 'pt-PT',
  ar: 'ar-SA',
  he: 'he-IL',
};

const buildLocalReply = (input: string, snapshot: string, lang: Language): string => {
  const text = input.toLowerCase();
  const words = text.split(/\s+/).filter(Boolean);

  const intents = {
    stress: /(stress|anx|panic|overwhelm|трев|стресс|паник|перегруз|трив|стрес|ansie|anxie|estres|stres|焦虑|压力|不安|不安定|不安感)/i,
    sleep: /(sleep|insomnia|tired|fatigue|сон|устал|бессон|втом|cansad|fatig|sommeil|mude|schlaf|疲劳|睡眠|眠れ)/i,
    relationship: /(partner|relationship|husband|wife|couple|отнош|партнер|ссора|конфликт|relacion|pareja|relation|couple|beziehung|关系|伴侣|関係)/i,
    focus: /(focus|concentr|brain fog|fog|attention|концентр|фокус|туман|уваг|concentr|atencion|attention|fokus|集中|专注|集中力)/i,
  };

  const toneByLang: LangCopy< {
    clarify: string;
    crisis: string;
    section: { observe: string; step: string; next: string };
    stress: { observe: string; step: string; next: string };
    sleep: { observe: string; step: string; next: string };
    relationship: { observe: string; step: string; next: string };
    focus: { observe: string; step: string; next: string };
    general: { observe: string; step: string; next: string };
  }> = {
    en: {
      clarify: 'To keep this useful, share 3 points: body signal, emotion, and context of the moment.',
      crisis: 'If you are in immediate danger, contact local emergency services now. I can help you create one short safety step.',
      section: { observe: 'Observation', step: 'Immediate step', next: 'Next check-in' },
      stress: {
        observe: `Stress load appears high. Current state snapshot: "${snapshot}".`,
        step: 'Reduce decision load for 20 minutes: one task, one timer, no multitasking.',
        next: 'Re-check pulse, jaw tension, and breath pace after the timer.',
      },
      sleep: {
        observe: `Recovery signal looks low. Current state snapshot: "${snapshot}".`,
        step: 'Start wind-down protocol now: lower light, hydrate, remove stimulating input.',
        next: 'Set a fixed sleep window and keep wake time stable tomorrow.',
      },
      relationship: {
        observe: 'Communication risk is elevated when state is overloaded.',
        step: 'Use one clear sentence: “I am overloaded and need 20 minutes to reset.”',
        next: 'Return with one concrete request and one appreciation.',
      },
      focus: {
        observe: 'Focus bandwidth is fragmented.',
        step: 'Switch to a 15-minute single-focus block and remove non-essential tabs/alerts.',
        next: 'Log what improved: clarity, speed, or error rate.',
      },
      general: {
        observe: `I am tracking your state snapshot: "${snapshot}".`,
        step: 'Pick one smallest useful action for the next 10 minutes.',
        next: 'Report what changed in body, mood, and clarity.',
      },
    },
    ru: {
      clarify: 'Чтобы ответ был точным, дайте 3 пункта: сигнал тела, эмоция и контекст момента.',
      crisis: 'Если есть риск немедленной опасности, срочно свяжитесь с экстренной службой. Я помогу сформулировать один безопасный шаг.',
      section: { observe: 'Наблюдение', step: 'Шаг сейчас', next: 'Следующая проверка' },
      stress: {
        observe: `Похоже, уровень стресса высокий. Текущий снимок: "${snapshot}".`,
        step: 'На 20 минут снизьте нагрузку решений: одна задача, один таймер, без многозадачности.',
        next: 'После таймера проверьте пульс, напряжение челюсти и ритм дыхания.',
      },
      sleep: {
        observe: `Сигнал восстановления снижен. Текущий снимок: "${snapshot}".`,
        step: 'Запустите вечерний протокол: приглушите свет, вода, уберите стимулирующий контент.',
        next: 'Зафиксируйте стабильное окно сна и время подъема на завтра.',
      },
      relationship: {
        observe: 'При перегрузке растет риск конфликтной коммуникации.',
        step: 'Одна фраза: «Я перегружена, мне нужно 20 минут восстановиться».',
        next: 'Вернитесь с одной конкретной просьбой и одной благодарностью.',
      },
      focus: {
        observe: 'Фокус фрагментирован, когнитивный шум повышен.',
        step: 'Сделайте 15 минут в моно-режиме: одна задача, убрать лишние вкладки и уведомления.',
        next: 'Отметьте, что изменилось: ясность, скорость или ошибки.',
      },
      general: {
        observe: `Я отслеживаю ваш снимок состояния: "${snapshot}".`,
        step: 'Выберите одно минимальное полезное действие на ближайшие 10 минут.',
        next: 'Проверьте, что изменилось в теле, эмоциях и ясности мысли.',
      },
    },
    uk: { clarify: 'Щоб відповідь була точною, дайте 3 пункти: сигнал тіла, емоція та контекст.', crisis: 'Якщо є негайна небезпека, зверніться до екстреної служби. Я допоможу сформувати один безпечний крок.', section: { observe: 'Спостереження', step: 'Крок зараз', next: 'Наступна перевірка' }, stress: { observe: `Рівень стресу, ймовірно, високий. Поточний знімок: "${snapshot}".`, step: 'На 20 хвилин зменште навантаження рішень: одне завдання, один таймер, без мультизадачності.', next: 'Після таймера перевірте пульс, щелепу та ритм дихання.' }, sleep: { observe: `Сигнал відновлення знижений. Поточний знімок: "${snapshot}".`, step: 'Запустіть вечірній протокол: менше світла, вода, без стимулюючого контенту.', next: 'Зафіксуйте стабільне вікно сну і час підйому.' }, relationship: { observe: 'При перевантаженні ризик конфліктної комунікації вищий.', step: 'Одна фраза: «Я перевантажена, мені потрібно 20 хвилин на відновлення».', next: 'Поверніться з одним конкретним проханням і однією вдячністю.' }, focus: { observe: 'Фокус фрагментований.', step: '15 хвилин одного фокусу: одна задача, без зайвих вкладок і сповіщень.', next: 'Зафіксуйте, що змінилось: ясність, швидкість чи помилки.' }, general: { observe: `Я бачу ваш поточний знімок: "${snapshot}".`, step: 'Оберіть одну найменшу корисну дію на 10 хвилин.', next: 'Оцініть зміни в тілі, настрої та ясності.' } },
    es: { clarify: 'Para responder con precisión, comparte 3 puntos: señal corporal, emoción y contexto.', crisis: 'Si hay peligro inmediato, contacta servicios de emergencia locales ahora.', section: { observe: 'Observación', step: 'Paso inmediato', next: 'Siguiente chequeo' }, stress: { observe: `La carga de estrés parece alta. Estado actual: "${snapshot}".`, step: 'Reduce decisiones por 20 minutos: una tarea, un temporizador, sin multitarea.', next: 'Revisa pulso, tensión mandibular y ritmo respiratorio.' }, sleep: { observe: `La recuperación parece baja. Estado actual: "${snapshot}".`, step: 'Inicia protocolo nocturno: baja luz, hidrátate y reduce estímulos.', next: 'Define ventana fija de sueño y hora de despertar.' }, relationship: { observe: 'Con sobrecarga, aumenta el riesgo de conflicto en conversación.', step: 'Usa una frase clara: “Estoy sobrecargada y necesito 20 minutos para regularme”.', next: 'Vuelve con una petición concreta y una apreciación.' }, focus: { observe: 'La atención está fragmentada.', step: 'Haz un bloque de 15 minutos de foco único, sin alertas.', next: 'Registra si mejoró claridad, velocidad o errores.' }, general: { observe: `Estoy siguiendo tu estado: "${snapshot}".`, step: 'Elige la acción útil más pequeña para los próximos 10 minutos.', next: 'Revisa qué cambió en cuerpo, ánimo y claridad.' } },
    fr: { clarify: 'Pour une réponse précise, donnez 3 points : signal corporel, émotion, contexte.', crisis: 'En cas de danger immédiat, contactez les urgences locales maintenant.', section: { observe: 'Observation', step: 'Action immédiate', next: 'Prochain point' }, stress: { observe: `La charge de stress semble élevée. État actuel : "${snapshot}".`, step: 'Réduisez la charge décisionnelle 20 minutes : une tâche, un minuteur, sans multitâche.', next: 'Revérifiez pouls, tension de mâchoire et rythme respiratoire.' }, sleep: { observe: `Le signal de récupération est bas. État actuel : "${snapshot}".`, step: 'Lancez un protocole du soir : lumière basse, hydratation, moins de stimulation.', next: 'Fixez une fenêtre de sommeil stable et l’heure de réveil.' }, relationship: { observe: 'Sous surcharge, le risque de tension relationnelle augmente.', step: 'Une phrase claire : « Je suis surchargée, j’ai besoin de 20 minutes pour me réguler. »', next: 'Revenez avec une demande concrète et une appréciation.' }, focus: { observe: 'L’attention est fragmentée.', step: 'Faites 15 minutes de focus unique sans alertes.', next: 'Notez l’impact sur clarté, vitesse et erreurs.' }, general: { observe: `Je suis votre état actuel : "${snapshot}".`, step: 'Choisissez la plus petite action utile pour 10 minutes.', next: 'Revérifiez corps, humeur et clarté.' } },
    de: { clarify: 'Für eine präzise Antwort nenne 3 Punkte: Körpersignal, Emotion, Kontext.', crisis: 'Bei akuter Gefahr kontaktiere sofort den lokalen Notruf.', section: { observe: 'Beobachtung', step: 'Sofortschritt', next: 'Nächster Check' }, stress: { observe: `Die Stresslast wirkt hoch. Aktueller Zustand: "${snapshot}".`, step: 'Für 20 Minuten Entscheidungsdruck senken: eine Aufgabe, ein Timer, kein Multitasking.', next: 'Danach Puls, Kieferspannung und Atemtempo prüfen.' }, sleep: { observe: `Erholungssignal ist niedrig. Aktueller Zustand: "${snapshot}".`, step: 'Abendprotokoll starten: Licht senken, Wasser, weniger Reize.', next: 'Stabiles Schlaffenster und feste Aufstehzeit setzen.' }, relationship: { observe: 'Bei Überlastung steigt das Konfliktrisiko in Gesprächen.', step: 'Ein klarer Satz: „Ich bin überlastet und brauche 20 Minuten zur Regulation.“', next: 'Mit einer konkreten Bitte und einer Wertschätzung zurückkehren.' }, focus: { observe: 'Fokusbandbreite ist fragmentiert.', step: '15 Minuten Single-Focus ohne unnötige Tabs/Benachrichtigungen.', next: 'Notiere Wirkung auf Klarheit, Tempo und Fehler.' }, general: { observe: `Ich verfolge deinen Zustand: "${snapshot}".`, step: 'Wähle die kleinste sinnvolle Aktion für die nächsten 10 Minuten.', next: 'Prüfe Veränderung bei Körper, Stimmung, Klarheit.' } },
    zh: { clarify: '为了得到准确建议，请提供3点：身体信号、情绪、当下场景。', crisis: '如有紧急危险，请立即联系当地急救服务。', section: { observe: '观察', step: '当前步骤', next: '下一次检查' }, stress: { observe: `当前压力负荷偏高。状态快照：“${snapshot}”。`, step: '接下来20分钟降低决策负担：只做一件事，一个计时器，不多任务。', next: '计时结束后复查脉搏、下颌紧张和呼吸节律。' }, sleep: { observe: `恢复信号偏低。状态快照：“${snapshot}”。`, step: '立即进入睡前协议：调暗光线、补水、减少刺激输入。', next: '设定固定睡眠窗口和起床时间。' }, relationship: { observe: '过载状态下，沟通冲突风险会上升。', step: '使用一句清晰表达：“我现在过载，需要20分钟恢复。”', next: '恢复后带着一个具体请求和一句感谢再沟通。' }, focus: { observe: '注意力带宽被分散。', step: '进行15分钟单任务专注，关闭不必要标签和提醒。', next: '记录清晰度、速度、错误率是否改善。' }, general: { observe: `我正在跟踪你的状态：“${snapshot}”。`, step: '为接下来10分钟选择一个最小但有效的动作。', next: '再检查身体、情绪、清晰度的变化。' } },
    ja: { clarify: '精度の高い回答のため、身体サイン・感情・状況の3点を共有してください。', crisis: '緊急の危険がある場合は、すぐに地域の緊急窓口へ連絡してください。', section: { observe: '観察', step: '今の一歩', next: '次のチェック' }, stress: { observe: `ストレス負荷が高い可能性があります。状態スナップショット:「${snapshot}」。`, step: '20分だけ意思決定負荷を下げます。1タスク・1タイマー・マルチタスクなし。', next: '終了後に脈拍、顎の緊張、呼吸リズムを再確認。' }, sleep: { observe: `回復シグナルが低下しています。状態スナップショット:「${snapshot}」。`, step: '就寝前プロトコルを開始：照明を落とし、水分補給、刺激入力を減らす。', next: '睡眠時間帯と起床時刻を固定する。' }, relationship: { observe: '過負荷時は会話の摩擦リスクが上がります。', step: '明確な一文:「いま過負荷なので、20分リセットしたいです。」', next: '戻るときは具体的な依頼1つと感謝1つ。' }, focus: { observe: '集中の帯域が分散しています。', step: '15分の単一集中ブロックへ。不要な通知とタブを止める。', next: '明瞭さ・速度・ミス率の変化を記録。' }, general: { observe: `現在の状態を追跡しています:「${snapshot}」。`, step: '次の10分で最小の有効アクションを1つ選ぶ。', next: '身体・気分・思考の明瞭さの変化を確認。' } },
    pt: { clarify: 'Para uma resposta precisa, compartilhe 3 pontos: sinal corporal, emoção e contexto.', crisis: 'Se houver perigo imediato, contate o serviço de emergência local agora.', section: { observe: 'Observação', step: 'Passo imediato', next: 'Próximo check-in' }, stress: { observe: `A carga de estresse parece alta. Estado atual: "${snapshot}".`, step: 'Reduza decisões por 20 minutos: uma tarefa, um timer, sem multitarefa.', next: 'Revise pulso, tensão mandibular e ritmo da respiração.' }, sleep: { observe: `O sinal de recuperação está baixo. Estado atual: "${snapshot}".`, step: 'Inicie protocolo noturno: menos luz, hidratação e menos estímulos.', next: 'Defina janela fixa de sono e horário de despertar.' }, relationship: { observe: 'Com sobrecarga, o risco de conflito na conversa aumenta.', step: 'Use uma frase clara: “Estou sobrecarregada e preciso de 20 minutos para me regular”.', next: 'Volte com um pedido concreto e uma apreciação.' }, focus: { observe: 'A atenção está fragmentada.', step: 'Faça um bloco de 15 minutos de foco único, sem alertas.', next: 'Registre melhora em clareza, velocidade ou erros.' }, general: { observe: `Estou acompanhando seu estado: "${snapshot}".`, step: 'Escolha a menor ação útil para os próximos 10 minutos.', next: 'Reavalie mudanças no corpo, humor e clareza.' } },
  ar: {
      clarify: 'للإفادة، شاركي 3 نقاط: إشارة الجسم، الشعور، وسياق اللحظة.',
      crisis: 'إذا كنتِ في خطر فوري، تواصلِي مع خدمات الطوارئ المحلية الآن. يمكنني مساعدتكِ على صياغة خطوة أمان واحدة.',
      section: { observe: 'ملاحظة', step: 'خطوة فورية', next: 'فحص لاحق' },
      stress: {
        observe: `يبدو أن حِمل التوتر مرتفع. لقطة الحالة الحالية: "${snapshot}".`,
        step: 'قلّلي قراراتكِ لـ 20 دقيقة: مهمة واحدة، مؤقت واحد، بلا تعدد مهام.',
        next: 'أعيدي فحص النبض، توتر الفك، وإيقاع التنفس بعد المؤقت.',
      },
      sleep: {
        observe: `إشارة التعافي منخفضة. لقطة الحالة: "${snapshot}".`,
        step: 'ابدئي بروتوكول الاسترخاء: إضاءة أخف، ترطيب، وإزالة المُحفّزات.',
        next: 'ثبّتي نافذة نوم ثابتة ووقت استيقاظ منتظم غداً.',
      },
      relationship: {
        observe: 'خطر التواصل يرتفع عندما تكونين مُحمّلة.',
        step: 'جملة واحدة واضحة: «أنا مُحمّلة وأحتاج 20 دقيقة لأستعيد توازني».',
        next: 'عودي بطلب واحد محدّد وامتنان واحد.',
      },
      focus: {
        observe: 'عرض التركيز مُجزّأ.',
        step: 'انتقلي إلى 15 دقيقة تركيز واحد وأغلقي التبويبات والتنبيهات غير الضرورية.',
        next: 'سجّلي ما تحسّن: الوضوح، السرعة، أو الأخطاء.',
      },
      general: {
        observe: `أتابع لقطة حالتكِ: "${snapshot}".`,
        step: 'اختاري أصغر فعل مفيد للـ 10 دقائق القادمة.',
        next: 'أبلغيني ما تغيّر في الجسم والمزاج والوضوح.',
      },
    },
  he: {
      clarify: 'כדי שזה יהיה שימושי, שתפי 3 נקודות: אות גוף, רגש והקשר של הרגע.',
      crisis: 'אם את בסכנה מיידית, פני לשירותי החירום המקומיים עכשיו. אני יכולה לעזור לנסח צעד בטיחות קצר.',
      section: { observe: 'תצפית', step: 'צעד מיידי', next: 'בדיקה הבאה' },
      stress: {
        observe: `עומס הלחץ נראה גבוה. צילום מצב נוכחי: "${snapshot}".`,
        step: 'הפחיתי עומס החלטות ל-20 דקות: משימה אחת, טיימר אחד, בלי ריבוי משימות.',
        next: 'בדקי שוב דופק, מתח לסת וקצב נשימה אחרי הטיימר.',
      },
      sleep: {
        observe: `אות ההתאוששות נמוכה. צילום מצב: "${snapshot}".`,
        step: 'התחילי פרוטוקול הרגעה: תאורה נמוכה, הידרציה, פחות גירויים.',
        next: 'קבעי חלון שינה קבוע ושעת התעוררות יציבה למחר.',
      },
      relationship: {
        observe: 'סיכון תקשורת עולה כשיש עומס.',
        step: 'משפט אחד ברור: «אני בעומס ואני צריכה 20 דקות לאיפוס».',
        next: 'חזרי עם בקשה קונקרטית אחת והערכה אחת.',
      },
      focus: {
        observe: 'רוחב הריכוז מפוזר.',
        step: 'עברי ל-15 דקות של פוקוס יחיד והסירי טאבים והתראות לא חיוניות.',
        next: 'רשמי מה השתפר: בהירות, מהירות או שגיאות.',
      },
      general: {
        observe: `אני עוקבת אחרי צילום המצב שלך: "${snapshot}".`,
        step: 'בחרי את הפעולה הקטנה והשימושית ביותר ל-10 הדקות הבאות.',
        next: 'דווחי מה השתנה בגוף, במצב הרוח ובבהירות.',
      },
    },};

  const c = getLang(toneByLang, lang) || toneByLang.en;
  if (/(suicid|self-harm|kill myself|убью себя|не хочу жить|опасно|emergency)/i.test(text)) {
    return c.crisis;
  }
  if (words.length < 3) {
    return c.clarify;
  }

  const selected = intents.stress.test(text) ? c.stress
    : intents.sleep.test(text) ? c.sleep
      : intents.relationship.test(text) ? c.relationship
        : intents.focus.test(text) ? c.focus
          : c.general;

  return `${c.section.observe}: ${selected.observe}\n${c.section.step}: ${selected.step}\n${c.section.next}: ${selected.next}`;
};

import {
  consumePublicLiveTurn,
  isPublicLiveLimitReached,
  publicLiveTurnsLeft,
} from '../utils/liveAssistantAccess';

export type LiveAssistantAccessMode = 'member' | 'public';

export const LiveAssistant: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  stateSnapshot: string;
  lang?: Language;
  accessMode?: LiveAssistantAccessMode;
  onSignIn?: () => void;
  onSignUp?: () => void;
}> = ({
  isOpen,
  onClose,
  stateSnapshot,
  lang = 'en',
  accessMode = 'member',
  onSignIn,
  onSignUp,
}) => {
  const isPublicPreview = accessMode === 'public';
  const idleBars = useMemo(() => Array.from({ length: 10 }, (_, i) => (i % 2 === 0 ? 8 : 10)), []);
  const [status, setStatus] = useState<ConnectionStatus>('IDLE');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [textInput, setTextInput] = useState('');
  const [interimText, setInterimText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioBars, setAudioBars] = useState<number[]>(idleBars);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [assistantTheme, setAssistantTheme] = useState<AssistantTheme>('dark');
  const [personaId, setPersonaId] = useState<LunaVoicePersonaId>(DEFAULT_LUNA_PERSONA_ID);
  const [voiceConfig, setVoiceConfig] = useState<VoiceServiceConfig | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [publicTurnsLeft, setPublicTurnsLeft] = useState(() => publicLiveTurnsLeft());
  const publicLimitReached = isPublicPreview && publicTurnsLeft <= 0;
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const recognitionActiveRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const replyAudioRef = useRef<HTMLAudioElement | null>(null);
  const voiceSendTimerRef = useRef<number | null>(null);
  const pendingVoiceTextRef = useRef('');
  const locale = recognitionLangByUi[lang] || recognitionLangByUi.en;
  const copy = getLang(copyByLang, lang) || copyByLang.en;

  const themeClasses = useMemo(
    () => ({
      light: 'bg-gradient-to-b from-white via-[#fbf8ff] to-[#f5f8ff] text-slate-900 border-slate-200',
      dark: 'bg-gradient-to-b from-[#081228] via-[#0b1730] to-[#091425] text-slate-100 border-[#1e3357]',
    }),
    []
  );

  const stopAudioVisualizer = () => {
    if (animationIdRef.current !== null) {
      cancelAnimationFrame(animationIdRef.current);
      animationIdRef.current = null;
    }
    analyserRef.current = null;
    if (audioContextRef.current) {
      void audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setAudioBars(idleBars);
  };

  const animateAudioBars = () => {
    const analyser = analyserRef.current;
    if (!analyser) {
      setAudioBars(idleBars);
      return;
    }

    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    const nextBars = new Array(10).fill(8);
    const binSize = Math.max(1, Math.floor(data.length / nextBars.length));

    for (let i = 0; i < nextBars.length; i += 1) {
      let sum = 0;
      const start = i * binSize;
      const end = Math.min(data.length, start + binSize);
      for (let j = start; j < end; j += 1) {
        sum += data[j];
      }
      const avg = end > start ? sum / (end - start) : 0;
      const normalized = Math.min(1, Math.pow(avg / 255, 0.82) * 1.45);
      nextBars[i] = Math.max(8, Math.min(58, 8 + normalized * 50));
    }

    setAudioBars(nextBars);
    animationIdRef.current = requestAnimationFrame(animateAudioBars);
  };

  const startAudioVisualizer = async () => {
    if (analyserRef.current) return;
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    const context = new AudioContext();
    const source = context.createMediaStreamSource(stream);
    const analyser = context.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.82;
    source.connect(analyser);

    streamRef.current = stream;
    audioContextRef.current = context;
    analyserRef.current = analyser;

    animateAudioBars();
  };

  const stopListening = () => {
    recognitionActiveRef.current = false;
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
    }
    stopAudioVisualizer();
    setIsListening(false);
    setInterimText('');
  };

  const speakReply = (text: string) => {
    if (isSpeakerMuted || !window.speechSynthesis || !text.trim()) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = locale;
    const voices = window.speechSynthesis.getVoices();
    const base = locale.toLowerCase().split('-')[0];
    const exact = voices.find((v) => v.lang.toLowerCase() === locale.toLowerCase());
    const byBase = voices.find((v) => v.lang.toLowerCase().startsWith(base));
    utterance.voice = exact || byBase || null;
    utterance.rate = 0.95;
    utterance.pitch = 1.02;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopReplyAudio = () => {
    if (replyAudioRef.current) {
      replyAudioRef.current.pause();
      replyAudioRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const playReplyAudio = (base64: string) => {
    if (isSpeakerMuted || !base64) return;
    stopReplyAudio();
    try {
      const audio = new Audio(`data:audio/mpeg;base64,${base64}`);
      replyAudioRef.current = audio;
      audio.onplay = () => setIsSpeaking(true);
      audio.onended = () => {
        setIsSpeaking(false);
        replyAudioRef.current = null;
      };
      audio.onerror = () => setIsSpeaking(false);
      void audio.play();
    } catch {
      setIsSpeaking(false);
    }
  };

  const sendUserMessage = useCallback(async (raw: string) => {
    const msg = raw.trim();
    if (!msg || status !== 'CONNECTED' || isThinking) return;

    if (isPublicPreview && isPublicLiveLimitReached()) {
      setMessages((prev) => [...prev, { role: 'system', text: copy.limitReached || copy.previewNote || '' }]);
      return;
    }

    setMessages((prev) => [...prev, { role: 'user', text: msg }]);
    setTextInput('');
    setInterimText('');
    setIsThinking(true);

    const history = messages
      .filter((m) => m.role === 'user' || m.role === 'luna')
      .slice(-6)
      .map((m) => ({ role: m.role === 'luna' ? 'assistant' as const : 'user' as const, text: m.text }));

    try {
      if (isPublicPreview) {
        consumePublicLiveTurn();
        const left = publicLiveTurnsLeft();
        setPublicTurnsLeft(left);
        if (left <= 0) {
          stopListening();
          setIsMicMuted(true);
        }
        const reply = buildLocalReply(msg, stateSnapshot, lang);
        setMessages((prev) => [...prev, { role: 'luna', text: reply }]);
        speakReply(reply);
      } else if (isVoiceAiEnabled() && (voiceConfig?.enabled || voiceConfig?.ttsEnabled)) {
        const clientMessageId =
          typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
            ? crypto.randomUUID()
            : `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
        const result = await requestLunaVoiceResponse({
          transcript: msg,
          lang,
          personaId,
          mode: 'live',
          history,
          context: { stateSnapshot },
          withAudio: !isSpeakerMuted,
          clientMessageId,
          inputMode: 'text',
        });
        setMessages((prev) => [...prev, { role: 'luna', text: result.text }]);
        if (result.audio) {
          playReplyAudio(result.audio);
        } else {
          speakReply(result.text);
        }
      } else {
        const reply = buildLocalReply(msg, stateSnapshot, lang);
        setMessages((prev) => [...prev, { role: 'luna', text: reply }]);
        speakReply(reply);
      }
    } finally {
      setIsThinking(false);
    }
  }, [copy.limitReached, copy.previewNote, isPublicPreview, isSpeakerMuted, isThinking, lang, messages, personaId, stateSnapshot, status, voiceConfig?.enabled, voiceConfig?.ttsEnabled]);

  const startListening = () => {
    if (isMicMuted || status !== 'CONNECTED') return;
    if (isPublicPreview && isPublicLiveLimitReached()) return;
    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      setMessages((prev) => [...prev, { role: 'system', text: copy.unsupported }]);
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setMessages((prev) => [...prev, { role: 'system', text: copy.unsupported }]);
      return;
    }

    const begin = async () => {
      try {
        await startAudioVisualizer();
      } catch {
        setMessages((prev) => [...prev, { role: 'system', text: copy.micDenied }]);
        setIsMicMuted(true);
        return;
      }

      if (!recognitionRef.current) {
      const recognition = new SpeechRecognitionCtor();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = locale;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: SpeechRecognitionEventLike) => {
        let finalChunk = '';
        let interimChunk = '';
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const transcript = event.results[i][0]?.transcript || '';
          if (event.results[i].isFinal) {
            finalChunk += transcript;
          } else {
            interimChunk += transcript;
          }
        }

        if (finalChunk.trim()) {
          pendingVoiceTextRef.current = pendingVoiceTextRef.current
            ? `${pendingVoiceTextRef.current} ${finalChunk.trim()}`
            : finalChunk.trim();
          setTextInput(pendingVoiceTextRef.current);
          if (voiceSendTimerRef.current) {
            window.clearTimeout(voiceSendTimerRef.current);
          }
          voiceSendTimerRef.current = window.setTimeout(() => {
            const toSend = pendingVoiceTextRef.current.trim();
            pendingVoiceTextRef.current = '';
            if (toSend) {
              void sendUserMessage(toSend);
            }
          }, 1400);
        }
        setInterimText(interimChunk.trim());
      };

      recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
        setIsListening(false);
        setInterimText('');
        if (event.error === 'not-allowed') {
          setMessages((prev) => [...prev, { role: 'system', text: copy.micDenied }]);
          setIsMicMuted(true);
          return;
        }
        if (event.error === 'no-speech') {
          setMessages((prev) => [...prev, { role: 'system', text: copy.noSpeech }]);
          return;
        }
        setMessages((prev) => [...prev, { role: 'system', text: event.error }]);
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimText('');
        if (!isMicMuted && recognitionActiveRef.current) {
          recognition.start();
        }
      };

      recognitionRef.current = recognition;
      }

      recognitionRef.current.lang = locale;
      recognitionActiveRef.current = true;
      recognitionRef.current.start();
    };

    void begin();
  };

  const cleanup = () => {
    setStatus('IDLE');
    setMessages([]);
    setTextInput('');
    setInterimText('');
    setIsListening(false);
    setIsSpeaking(false);
    setIsThinking(false);
    pendingVoiceTextRef.current = '';
    if (voiceSendTimerRef.current) {
      window.clearTimeout(voiceSendTimerRef.current);
      voiceSendTimerRef.current = null;
    }
    stopListening();
    stopReplyAudio();
    stopAudioVisualizer();
  };

  const introForPersona = useMemo(() => {
    const byLang = personaIntroByLang[lang] || personaIntroByLang.en;
    return byLang?.[personaId] || copy.intro;
  }, [copy.intro, lang, personaId]);

  useEffect(() => {
    if (!isOpen || isPublicPreview) return;
    void fetchVoiceServiceConfig().then(setVoiceConfig);
  }, [isOpen, isPublicPreview]);

  const startSession = () => {
    if (status !== 'IDLE') return;
    setStatus('CONNECTING');
    if (isPublicPreview) {
      setPublicTurnsLeft(publicLiveTurnsLeft());
    }

    setTimeout(() => {
      setStatus('CONNECTED');
      if (isPublicPreview) {
        setIsMicMuted(true);
      }
      const opening: ChatMessage[] = [
        {
          role: 'luna',
          text: isPublicPreview ? copy.previewIntro || copy.intro : introForPersona,
        },
      ];
      if (isPublicPreview) {
        opening.unshift({ role: 'system', text: copy.previewNote || '' });
      } else if (!isVoiceAiEnabled() || !(voiceConfig?.enabled || voiceConfig?.ttsEnabled)) {
        opening.unshift({ role: 'system', text: copy.localMode || copy.intro });
      }
      if (isPublicPreview && isPublicLiveLimitReached()) {
        opening.push({ role: 'system', text: copy.limitReached || '' });
      }
      setMessages(opening);
    }, 280);
  };

  const handleSendText = () => {
    void sendUserMessage(textInput);
  };

  useEffect(() => {
    if (isOpen) {
      startSession();
    } else {
      cleanup();
    }
    return () => {
      cleanup();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || status !== 'CONNECTED') return;
    if (!isMicMuted) {
      startListening();
    } else {
      stopListening();
    }
  }, [isMicMuted, status, locale]);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, interimText]);

  useEffect(() => {
    if (!isListening) {
      setAudioBars(idleBars);
    }
  }, [isListening, idleBars]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[400] bg-black/45 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
      <div className="relative w-full max-w-md h-[80vh] md:h-[75vh] rounded-[3.7rem] p-[1.5px] bg-[conic-gradient(from_160deg_at_50%_50%,rgba(244,114,182,0.9),rgba(167,139,250,0.9),rgba(96,165,250,0.9),rgba(52,211,153,0.9),rgba(244,114,182,0.9))] shadow-[0_30px_80px_rgba(44,71,132,0.55)]">
        <div className={`relative w-full h-full flex flex-col rounded-[3.5rem] border overflow-hidden transition-all duration-500 ${themeClasses[assistantTheme]}`}>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(75%_60%_at_20%_0%,rgba(255,255,255,0.18),transparent_62%),radial-gradient(70%_70%_at_90%_100%,rgba(139,92,246,0.18),transparent_65%)] dark:bg-[radial-gradient(75%_60%_at_20%_0%,rgba(96,165,250,0.14),transparent_62%),radial-gradient(70%_70%_at_90%_100%,rgba(244,114,182,0.16),transparent_65%)]" />

          <nav className="relative p-6 flex justify-between items-center border-b border-inherit bg-inherit/40 backdrop-blur-md z-20">
            <div className="flex items-center gap-4">
              <div className="flex items-end gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${status === 'CONNECTED' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse' : status === 'CONNECTING' ? 'bg-amber-500 animate-pulse' : 'bg-slate-500'}`} />
                <Logo size="sm" className="!text-[2rem] !leading-none !pt-0 pointer-events-none" />
                <span className="mb-1 text-[10px] font-black uppercase tracking-widest opacity-60">{copy.live}</span>
                {isPublicPreview && (
                  <span className="mb-1 text-[8px] font-black uppercase tracking-widest text-amber-500/90">{copy.previewBadge}</span>
                )}
                {!isPublicPreview && voiceConfig?.ttsEnabled && (
                  <span className="mb-1 text-[8px] font-bold uppercase tracking-widest text-violet-400/90">ElevenLabs</span>
                )}
                <span className="mb-1 ml-1 flex items-end gap-[2px] h-3">
                  {audioBars.slice(0, 6).map((height, idx) => (
                    <span
                      key={idx}
                      className={`w-[2px] rounded-full transition-all duration-100 ${isListening ? 'bg-cyan-400' : 'bg-slate-400/60 dark:bg-slate-500/60'}`}
                      style={{ height: `${Math.max(2, Math.round(height * 0.22))}px` }}
                    />
                  ))}
                </span>
              </div>

              {status === 'CONNECTED' && (
                <div className="flex gap-3 animate-in fade-in slide-in-from-left-4">
                  <div className="flex items-center gap-1.5 bg-inherit border border-inherit rounded-full px-2 py-1 shadow-sm">
                    <button
                      onClick={() => setIsMicMuted((prev) => !prev)}
                      className={`w-7 h-7 flex items-center justify-center rounded-full transition-all ${isMicMuted ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'bg-emerald-500/20 text-emerald-500 shadow-lg shadow-emerald-500/20'}`}
                    >
                      {isMicMuted ? <MicOff size={12} /> : <Mic size={12} />}
                    </button>
                    <span className={`text-[8px] font-black uppercase tracking-widest ${isMicMuted ? 'text-rose-500' : 'opacity-65'}`}>
                      {isMicMuted ? copy.micOff : copy.micOn}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-inherit border border-inherit rounded-full px-2 py-1 shadow-sm">
                    <button
                      onClick={() => setIsSpeakerMuted((prev) => !prev)}
                      className={`w-7 h-7 flex items-center justify-center rounded-full transition-all ${isSpeakerMuted ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'bg-violet-500/20 text-violet-300 shadow-lg shadow-violet-500/25'}`}
                    >
                      {isSpeakerMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
                    </button>
                    <span className={`text-[8px] font-black uppercase tracking-widest ${isSpeakerMuted ? 'text-rose-500' : 'opacity-65'}`}>
                      {isSpeakerMuted ? copy.speakerMuted : copy.speakerLive}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setAssistantTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
                aria-label={assistantTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                className={`relative w-16 h-8 rounded-full border overflow-hidden transition-all duration-500 ${
                  assistantTheme === 'dark'
                    ? 'bg-gradient-to-r from-indigo-950 via-slate-900 to-blue-950 border-slate-700'
                    : 'bg-gradient-to-r from-amber-200 via-orange-100 to-sky-200 border-amber-300'
                }`}
              >
                <span className="absolute inset-0 opacity-70 pointer-events-none">
                  <span className={`absolute left-2 top-1.5 transition-opacity duration-500 ${assistantTheme === 'dark' ? 'opacity-0' : 'opacity-100'}`}>
                    <Sun size={12} className="text-amber-500 animate-pulse" />
                  </span>
                  <span className={`absolute right-2 top-1.5 transition-opacity duration-500 ${assistantTheme === 'dark' ? 'opacity-100' : 'opacity-0'}`}>
                    <Moon size={12} className="text-blue-200 animate-pulse" />
                  </span>
                </span>
                <span
                  className={`absolute top-[2px] w-7 h-7 rounded-full shadow-lg transition-all duration-500 flex items-center justify-center ${
                    assistantTheme === 'dark'
                      ? 'left-[34px] bg-gradient-to-br from-blue-300 via-indigo-300 to-slate-400 text-indigo-950'
                      : 'left-[2px] bg-gradient-to-br from-amber-300 via-orange-200 to-yellow-100 text-amber-700'
                  }`}
                >
                  {assistantTheme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
                </span>
              </button>
              <button onClick={() => { cleanup(); onClose(); }} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-500/10 transition-colors text-2xl font-light">×</button>
            </div>
          </nav>

          {isPublicPreview && status === 'CONNECTED' && !publicLimitReached && (
            <p className="relative z-20 px-6 py-2 text-[9px] font-black uppercase tracking-[0.18em] text-center text-amber-600 dark:text-amber-300 bg-amber-500/10 border-b border-amber-500/20">
              {(copy.turnsLeft || '{n} left').replace('{n}', String(publicTurnsLeft))}
            </p>
          )}

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 no-scrollbar relative z-20" ref={scrollRef}>
            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : m.role === 'system' ? 'items-center' : 'items-start'} animate-in fade-in slide-in-from-bottom-2`}>
                <div className={`max-w-[90%] px-5 py-3 rounded-3xl text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-luna-purple text-white rounded-tr-none font-bold shadow-lg shadow-violet-500/25'
                    : m.role === 'system'
                      ? 'text-[9px] font-black uppercase opacity-65 text-center py-2'
                      : 'bg-inherit border border-inherit rounded-tl-none font-medium italic opacity-95 shadow-md'
                }`}>
                  {m.role === 'luna' ? <TypewriterText text={m.text} /> : <span>{m.text}</span>}
                </div>
              </div>
            ))}
          </div>

          {status === 'CONNECTED' && (
            <footer className="relative p-6 border-t border-inherit bg-inherit/40 backdrop-blur-md z-20 space-y-3">
              {!isPublicPreview && (voiceConfig?.personas?.length ?? 0) > 1 && (
                <div className="flex flex-wrap gap-2 justify-center">
                  {voiceConfig!.personas.map((persona) => (
                    <button
                      key={persona.id}
                      type="button"
                      onClick={() => setPersonaId(persona.id as LunaVoicePersonaId)}
                      className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                        personaId === persona.id
                          ? 'bg-luna-purple text-white border-luna-purple shadow-md shadow-luna-purple/30'
                          : 'border-inherit opacity-70 hover:opacity-100'
                      }`}
                    >
                      {persona.name}
                    </button>
                  ))}
                </div>
              )}
              {publicLimitReached ? (
                <div className="space-y-3 text-center">
                  <p className="text-sm font-medium opacity-80">{copy.limitReached}</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {onSignIn && (
                      <button type="button" onClick={onSignIn} className="px-5 py-2.5 rounded-full border border-luna-purple/40 text-[10px] font-black uppercase tracking-[0.14em] text-luna-purple">
                        {copy.signInCta}
                      </button>
                    )}
                    {onSignUp && (
                      <button type="button" onClick={onSignUp} className="px-5 py-2.5 rounded-full bg-luna-purple text-white text-[10px] font-black uppercase tracking-[0.14em]">
                        {copy.signUpCta}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
              <>
              {isThinking && (
                <p className="text-center text-[10px] font-semibold uppercase tracking-widest opacity-60">{copy.thinking || 'Luna is listening…'}</p>
              )}
              <div className="relative bg-inherit rounded-[2rem] border-2 border-inherit shadow-[0_12px_35px_rgba(49,74,131,0.25)] flex items-end gap-2 p-1.5">
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendText();
                    }
                  }}
                  placeholder={copy.placeholder}
                  className="flex-1 bg-transparent p-3 outline-none text-sm resize-none min-h-[44px] max-h-[120px]"
                  rows={1}
                  disabled={isThinking}
                />
                <button onClick={handleSendText} disabled={!textInput.trim() || isThinking} className="w-10 h-10 flex items-center justify-center rounded-full bg-luna-purple text-white disabled:opacity-20 flex-shrink-0 mb-0.5 shadow-lg shadow-luna-purple/30">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
              </div>
              {isPublicPreview && (
                <p className="text-[9px] font-semibold text-center opacity-60">{copy.memberOnlyVoice}</p>
              )}
              </>
              )}
            </footer>
          )}

          {status === 'ERROR' && (
            <div className="absolute inset-0 bg-rose-500/20 backdrop-blur-sm flex items-center justify-center p-8 z-[50]">
              <div className="bg-inherit p-10 rounded-[3rem] border-2 border-rose-500 text-center space-y-6 shadow-2xl">
                <h3 className="text-xl font-black text-rose-500 uppercase tracking-tighter">{copy.syncInterrupted}</h3>
                <p className="text-sm font-medium opacity-70">{copy.initFailed}</p>
                <button onClick={() => { cleanup(); startSession(); }} className="w-full py-4 bg-rose-500 text-white font-black uppercase rounded-full shadow-lg shadow-rose-500/20">{copy.restart}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
