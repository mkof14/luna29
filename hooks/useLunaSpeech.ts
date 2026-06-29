import { useCallback, useEffect, useRef, useState } from 'react';
import { Language } from '../constants';
import { useMobileVoiceCapabilities } from './useMobileVoiceCapabilities';

type SpeechRecognitionAlternativeLike = { transcript: string };
type SpeechRecognitionResultLike = { isFinal: boolean; 0: SpeechRecognitionAlternativeLike };
type SpeechRecognitionResultListLike = { length: number; [index: number]: SpeechRecognitionResultLike };
type SpeechRecognitionEventLike = { resultIndex: number; results: SpeechRecognitionResultListLike };
type SpeechRecognitionErrorEventLike = { error: string };
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

const recognitionLangByUi: Record<Language, string> = {
  en: 'en-US', ru: 'ru-RU', uk: 'uk-UA', es: 'es-ES', fr: 'fr-FR', de: 'de-DE',
  zh: 'zh-CN', ja: 'ja-JP', pt: 'pt-PT', ar: 'ar-SA', he: 'he-IL'};

export const speechLocaleForLang = (lang: Language) => recognitionLangByUi[lang] || recognitionLangByUi.en;

export const isSpeechRecognitionSupported = () =>
  typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

type UseLunaSpeechOptions = {
  lang: Language;
  continuous?: boolean;
  onFinal?: (text: string) => void;
  silenceMs?: number;
};

export const useLunaSpeech = ({ lang, continuous = true, onFinal, silenceMs = 1600 }: UseLunaSpeechOptions) => {
  const locale = speechLocaleForLang(lang);
  const mobileVoice = useMobileVoiceCapabilities();
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const activeRef = useRef(false);
  const pendingRef = useRef('');
  const timerRef = useRef<number | null>(null);
  const onFinalRef = useRef(onFinal);
  onFinalRef.current = onFinal;

  const clearSilenceTimer = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const flushPending = useCallback(() => {
    const text = pendingRef.current.trim();
    pendingRef.current = '';
    if (!text) return;
    setTranscript(text);
    onFinalRef.current?.(text);
  }, []);

  const scheduleFlush = useCallback(() => {
    clearSilenceTimer();
    timerRef.current = window.setTimeout(flushPending, silenceMs);
  }, [flushPending, silenceMs]);

  const stop = useCallback(() => {
    activeRef.current = false;
    clearSilenceTimer();
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setInterimText('');
    if (pendingRef.current.trim()) flushPending();
  }, [flushPending]);

  const reset = useCallback(() => {
    stop();
    pendingRef.current = '';
    setTranscript('');
    setInterimText('');
    setError(null);
  }, [stop]);

  const start = useCallback(() => {
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor) {
      setError('unsupported');
      return;
    }

    if (mobileVoice.isMobile) {
      mobileVoice.warmUpMicrophone().catch(() => undefined);
    }

    if (!recognitionRef.current) {
      const recognition = new Ctor();
      recognition.continuous = continuous;
      recognition.interimResults = true;
      recognition.lang = locale;

      recognition.onstart = () => setIsListening(true);

      recognition.onresult = (event: SpeechRecognitionEventLike) => {
        let finalChunk = '';
        let interimChunk = '';
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const piece = event.results[i][0]?.transcript || '';
          if (event.results[i].isFinal) finalChunk += piece;
          else interimChunk += piece;
        }
        if (finalChunk.trim()) {
          pendingRef.current = pendingRef.current
            ? `${pendingRef.current} ${finalChunk.trim()}`
            : finalChunk.trim();
          setTranscript(pendingRef.current);
          scheduleFlush();
        }
        setInterimText(interimChunk.trim());
      };

      recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
        setIsListening(false);
        setInterimText('');
        if (event.error === 'not-allowed') setError('mic-denied');
        else if (event.error === 'no-speech') setError('no-speech');
        else if (event.error !== 'aborted') setError(event.error);
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimText('');
        if (activeRef.current) {
          try {
            recognition.start();
          } catch {
            activeRef.current = false;
          }
        }
      };

      recognitionRef.current = recognition;
    }

    recognitionRef.current.lang = locale;
    activeRef.current = true;
    setError(null);
    try {
      recognitionRef.current.start();
    } catch {
      setError('start-failed');
    }
  }, [continuous, locale, scheduleFlush, mobileVoice]);

  const toggle = useCallback(() => {
    if (isListening) stop();
    else start();
  }, [isListening, start, stop]);

  useEffect(() => () => {
    activeRef.current = false;
    clearSilenceTimer();
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.abort();
    }
  }, []);

  return {
    transcript,
    interimText,
    isListening,
    error,
    supported: isSpeechRecognitionSupported(),
    start,
    stop,
    toggle,
    reset,
    setTranscript,
    displayText: [transcript, interimText].filter(Boolean).join(transcript && interimText ? ' ' : '')};
};
