import React, { useCallback, useState } from 'react';
import { Language, LangCopy, getLang } from '../constants';
import { VoiceCapturePanel } from './VoiceCapturePanel';
import { AiConsentGate } from './AiConsentGate';
import { requestLunaVoiceResponse } from '../services/voiceConversationService';
import { conversionEvents } from '../utils/conversionEvents';

const TEASER_TURNS_KEY = 'luna_voice_teaser_turns_v1';
const MAX_TEASER_TURNS = 3;

const copyByLang: LangCopy<{
  title: string;
  prompt: string;
  replyLabel: string;
  turnsLeft: string;
  limitReached: string;
  signUpCta: string;
}> = {
  en: {
    title: 'Try Luna29 voice — no account needed',
    prompt: 'Say how today feels in one or two sentences.',
    replyLabel: 'Luna29',
    turnsLeft: '{n} free turns left',
    limitReached: 'You’ve used your free preview. Create an account to keep reflecting with Luna29.',
    signUpCta: 'Create free account',
  },
  ru: {
    title: 'Попробуйте голос Luna29 — без аккаунта',
    prompt: 'Скажите в одном-двух предложениях, как ощущается сегодняшний день.',
    replyLabel: 'Luna29',
    turnsLeft: 'Осталось {n} бесплатных попыток',
    limitReached: 'Бесплатный превью лимит исчерпан. Создайте аккаунт, чтобы продолжить рефлексию с Luna29.',
    signUpCta: 'Создать аккаунт',
  },
  uk: {
    title: 'Спробуйте голос Luna29 — без акаунта',
    prompt: 'Скажіть в одному-двох реченнях, як відчувається сьогоднішній день.',
    replyLabel: 'Luna29',
    turnsLeft: 'Залишилось {n} безкоштовних спроб',
    limitReached: 'Ліміт безкоштовного превʼю вичерпано. Створіть акаунт, щоб продовжити.',
    signUpCta: 'Створити акаунт',
  },
  es: { title: 'Prueba la voz de Luna29 — sin cuenta', prompt: 'Di cómo se siente hoy en una o dos frases.', replyLabel: 'Luna29', turnsLeft: '{n} turnos gratis', limitReached: 'Has usado la vista previa gratuita.', signUpCta: 'Crear cuenta' },
  fr: { title: 'Essayez la voix Luna29 — sans compte', prompt: 'Dites en une ou deux phrases comment se passe la journée.', replyLabel: 'Luna29', turnsLeft: '{n} essais gratuits', limitReached: 'Aperçu gratuit terminé.', signUpCta: 'Créer un compte' },
  de: { title: 'Luna29 Stimme testen — ohne Konto', prompt: 'Sag in ein bis zwei Sätzen, wie sich heute anfühlt.', replyLabel: 'Luna29', turnsLeft: '{n} kostenlose Versuche', limitReached: 'Kostenlose Vorschau aufgebraucht.', signUpCta: 'Konto erstellen' },
  zh: { title: '试用 Luna29 语音 — 无需账号', prompt: '用一两句话说说今天的感受。', replyLabel: 'Luna29', turnsLeft: '剩余 {n} 次免费体验', limitReached: '免费预览已用完。', signUpCta: '创建账号' },
  ja: { title: 'Luna29 音声を試す — アカウント不要', prompt: '今日の気持ちを1〜2文で話してください。', replyLabel: 'Luna29', turnsLeft: '残り{n}回', limitReached: '無料プレビューは終了しました。', signUpCta: 'アカウント作成' },
  pt: { title: 'Experimente a voz Luna29 — sem conta', prompt: 'Diga em uma ou duas frases como está hoje.', replyLabel: 'Luna29', turnsLeft: '{n} tentativas grátis', limitReached: 'Prévia gratuita esgotada.', signUpCta: 'Criar conta' },
  ar: {
    title: 'Try Luna29 voice — no account needed',
    prompt: 'Say how today feels in one or two sentences.',
    replyLabel: 'Luna29',
    turnsLeft: '{n} free turns left',
    limitReached: 'You’ve used your free preview. Create an account to keep reflecting with Luna29.',
    signUpCta: 'Create free account',
  },
  he: {
    title: 'Try Luna29 voice — no account needed',
    prompt: 'Say how today feels in one or two sentences.',
    replyLabel: 'Luna29',
    turnsLeft: '{n} free turns left',
    limitReached: 'You’ve used your free preview. Create an account to keep reflecting with Luna29.',
    signUpCta: 'Create free account',
  },
};

const readTurns = (): number => {
  try {
    return Number(sessionStorage.getItem(TEASER_TURNS_KEY) || '0') || 0;
  } catch {
    return 0;
  }
};

type PublicVoiceTeaserProps = {
  lang: Language;
  onSignUp: () => void;
};

export const PublicVoiceTeaser: React.FC<PublicVoiceTeaserProps> = ({ lang, onSignUp }) => {
  const copy = getLang(copyByLang, lang) || copyByLang.en;
  const [turns, setTurns] = useState(readTurns);
  const [reply, setReply] = useState('');
  const [processing, setProcessing] = useState(false);

  const turnsLeft = Math.max(0, MAX_TEASER_TURNS - turns);
  const atLimit = turnsLeft <= 0;

  const handleTranscript = useCallback(async (transcript: string) => {
    if (!transcript.trim() || atLimit || processing) return;
    setProcessing(true);
    setReply('');
    try {
      conversionEvents.anonymousVoiceTeaser();
      const result = await requestLunaVoiceResponse({
        transcript,
        lang,
        mode: 'teaser',
        withAudio: false,
        context: { teaser: true },
      });
      setReply(result.text);
      const next = turns + 1;
      setTurns(next);
      sessionStorage.setItem(TEASER_TURNS_KEY, String(next));
    } finally {
      setProcessing(false);
    }
  }, [atLimit, lang, processing, turns]);

  return (
    <section className="rounded-[2rem] border border-luna-purple/25 bg-gradient-to-br from-luna-purple/8 via-white/80 to-violet-100/40 dark:from-luna-purple/15 dark:via-slate-900/60 dark:to-indigo-950/40 p-6 md:p-8 space-y-4">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-luna-purple">{copy.title}</p>
      {atLimit ? (
        <div className="space-y-4">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{copy.limitReached}</p>
          <button
            type="button"
            onClick={onSignUp}
            className="px-5 py-2.5 rounded-full bg-luna-purple text-white text-[11px] font-black uppercase tracking-[0.14em]"
          >
            {copy.signUpCta}
          </button>
        </div>
      ) : (
        <AiConsentGate lang={lang}>
          <VoiceCapturePanel
            lang={lang}
            prompt={copy.prompt}
            onTranscript={handleTranscript}
            isProcessing={processing}
            compact
            requireAiConsent={false}
          />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{copy.turnsLeft.replace('{n}', String(turnsLeft))}</p>
          {reply && (
            <div className="rounded-xl border border-luna-purple/20 bg-white/70 dark:bg-slate-900/50 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-luna-purple mb-1">{copy.replyLabel}</p>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{reply}</p>
            </div>
          )}
        </AiConsentGate>
      )}
    </section>
  );
};
