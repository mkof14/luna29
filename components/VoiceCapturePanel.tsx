import React, { useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Language, LangCopy, getLang } from '../constants';
import { useLunaSpeech } from '../hooks/useLunaSpeech';
import { AiConsentGate } from './AiConsentGate';

const copyByLang: LangCopy<{
  tapSpeak: string;
  listening: string;
  processing: string;
  unsupported: string;
  micDenied: string;
  noSpeech: string;
  hint: string;
}> = {
  en: {
    tapSpeak: 'Tap to speak',
    listening: 'Listening…',
    processing: 'Understanding…',
    unsupported: 'Voice not supported in this browser. Type instead.',
    micDenied: 'Microphone access denied.',
    noSpeech: 'No speech detected. Try again.',
    hint: 'Speak naturally — Luna fills in the details.',
  },
  ru: {
    tapSpeak: 'Нажмите и говорите',
    listening: 'Слушаю…',
    processing: 'Понимаю…',
    unsupported: 'Голос не поддерживается. Можно написать текстом.',
    micDenied: 'Нет доступа к микрофону.',
    noSpeech: 'Речь не распознана. Попробуйте ещё раз.',
    hint: 'Говорите свободно — Luna заполнит детали.',
  },
  uk: {
    tapSpeak: 'Натисніть і говоріть',
    listening: 'Слухаю…',
    processing: 'Розумію…',
    unsupported: 'Голос не підтримується. Можна написати.',
    micDenied: 'Немає доступу до мікрофона.',
    noSpeech: 'Мовлення не розпізнано.',
    hint: 'Говоріть вільно — Luna заповнить деталі.',
  },
  es: { tapSpeak: 'Toca y habla', listening: 'Escuchando…', processing: 'Entendiendo…', unsupported: 'Voz no compatible.', micDenied: 'Micrófono denegado.', noSpeech: 'Sin voz detectada.', hint: 'Habla con naturalidad — Luna completa los detalles.' },
  fr: { tapSpeak: 'Appuyez et parlez', listening: 'J’écoute…', processing: 'Je comprends…', unsupported: 'Voix non prise en charge.', micDenied: 'Micro refusé.', noSpeech: 'Aucune voix.', hint: 'Parlez naturellement — Luna remplit les détails.' },
  de: { tapSpeak: 'Tippen und sprechen', listening: 'Ich höre…', processing: 'Verstehe…', unsupported: 'Sprache nicht unterstützt.', micDenied: 'Mikrofon verweigert.', noSpeech: 'Keine Sprache.', hint: 'Sprich natürlich — Luna füllt Details aus.' },
  zh: { tapSpeak: '点击说话', listening: '正在聆听…', processing: '理解中…', unsupported: '不支持语音。', micDenied: '麦克风被拒绝。', noSpeech: '未检测到语音。', hint: '自然说话——Luna 会填写细节。' },
  ja: { tapSpeak: 'タップして話す', listening: '聞いています…', processing: '理解中…', unsupported: '音声非対応。', micDenied: 'マイク拒否。', noSpeech: '音声なし。', hint: '自然に話してください——Lunaが詳細を入力します。' },
  pt: { tapSpeak: 'Toque e fale', listening: 'Ouvindo…', processing: 'Entendendo…', unsupported: 'Voz não suportada.', micDenied: 'Microfone negado.', noSpeech: 'Sem fala.', hint: 'Fale naturalmente — Luna preenche os detalhes.' },
  ar: {
    tapSpeak: 'Tap to speak',
    listening: 'Listening…',
    processing: 'Understanding…',
    unsupported: 'Voice not supported in this browser. Type instead.',
    micDenied: 'Microphone access denied.',
    noSpeech: 'No speech detected. Try again.',
    hint: 'Speak naturally — Luna fills in the details.',
  },
  he: {
    tapSpeak: 'Tap to speak',
    listening: 'Listening…',
    processing: 'Understanding…',
    unsupported: 'Voice not supported in this browser. Type instead.',
    micDenied: 'Microphone access denied.',
    noSpeech: 'No speech detected. Try again.',
    hint: 'Speak naturally — Luna fills in the details.',
  },
};

type VoiceCapturePanelProps = {
  lang: Language;
  prompt?: string;
  onTranscript: (text: string) => void;
  isProcessing?: boolean;
  compact?: boolean;
  autoStart?: boolean;
  requireAiConsent?: boolean;
  className?: string;
};

export const VoiceCapturePanel: React.FC<VoiceCapturePanelProps> = ({
  lang,
  prompt,
  onTranscript,
  isProcessing = false,
  compact = false,
  autoStart = false,
  requireAiConsent = true,
  className = '',
}) => {
  const copy = getLang(copyByLang, lang) || copyByLang.en;
  const speech = useLunaSpeech({ lang, onFinal: onTranscript });

  useEffect(() => {
    if (autoStart && speech.supported) speech.start();
    return () => speech.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]);

  const errorMessage =
    speech.error === 'unsupported' ? copy.unsupported
      : speech.error === 'mic-denied' ? copy.micDenied
        : speech.error === 'no-speech' ? copy.noSpeech
          : speech.error;

  const panel = (
    <div className={`rounded-[2rem] border-2 border-luna-purple/25 bg-gradient-to-br from-luna-purple/8 via-white/80 to-violet-100/40 dark:from-luna-purple/15 dark:via-slate-900/60 dark:to-indigo-950/40 p-5 space-y-4 ${className}`}>
      {prompt && (
        <p className="text-sm md:text-base font-semibold text-slate-800 dark:text-slate-100 leading-relaxed">{prompt}</p>
      )}
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-luna-purple/80">{copy.hint}</p>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={speech.toggle}
          disabled={isProcessing || !speech.supported}
          className={`relative flex-shrink-0 flex items-center justify-center rounded-full transition-all shadow-lg ${
            compact ? 'w-14 h-14' : 'w-16 h-16'
          } ${
            speech.isListening
              ? 'bg-rose-500 text-white shadow-rose-500/40 animate-pulse'
              : 'bg-luna-purple text-white shadow-luna-purple/35 hover:scale-105'
          } disabled:opacity-40`}
          aria-label={speech.isListening ? copy.listening : copy.tapSpeak}
        >
          {isProcessing ? (
            <Loader2 size={compact ? 22 : 26} className="animate-spin" />
          ) : speech.isListening ? (
            <MicOff size={compact ? 22 : 26} />
          ) : (
            <Mic size={compact ? 22 : 26} />
          )}
          {speech.isListening && (
            <span className="absolute inset-0 rounded-full border-2 border-rose-300 animate-ping opacity-60" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">
            {isProcessing ? copy.processing : speech.isListening ? copy.listening : copy.tapSpeak}
          </p>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200 min-h-[2.5rem] leading-relaxed">
            {speech.displayText || '…'}
          </p>
        </div>
      </div>

      {errorMessage && (
        <p className="text-xs font-semibold text-rose-500">{errorMessage}</p>
      )}
    </div>
  );

  if (!requireAiConsent) return panel;
  return <AiConsentGate lang={lang}>{panel}</AiConsentGate>;
};
