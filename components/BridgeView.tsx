
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { generateBridgeLetter } from '../services/geminiService';
import { BridgeReflectionInput, BridgeLetterOutput } from '../types';
import { incrementBridgeUsage, parseBridgeUsage } from '../utils/runtimeGuards';
import { normalizeBridgeReflectionInput } from '../utils/bridge';
import { shareTextSafely } from '../utils/share';
import { Language, getLang } from '../constants';
import { JourneyProgress } from './JourneyProgress';
import { useSubscriptionAccess } from '../hooks/useSubscriptionAccess';
import { canUseBridgeReflection } from '../utils/subscriptionAccess';
import { BRIDGE_FLOW_COPY, BRIDGE_INFO_COPY } from '../utils/memberCoreI18n';
import { MemberIconBackButton } from './member/MemberIconBackButton';
import { MemberPageIntro } from './member/MemberPageIntro';
import { LunaPageContentSection } from './shared/LunaPageContentSection';
import { getLunaPageTheme } from '../utils/lunaPageThemes';

type BridgeStep = 'entry' | 'reflection' | 'result';

export const BridgeView: React.FC<{ lang: Language; onBack: () => void }> = ({ lang, onBack }) => {
  const { premiumActive } = useSubscriptionAccess();
  const copy = getLang(BRIDGE_FLOW_COPY, lang) || BRIDGE_FLOW_COPY.en;
  const info = getLang(BRIDGE_INFO_COPY, lang) || BRIDGE_INFO_COPY.en;
  const [step, setStep] = useState<BridgeStep>('entry');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState(['', '', '']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [letter, setLetter] = useState<BridgeLetterOutput | null>(null);
  const [typedLetter, setTypedLetter] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [usageCount, setUsageCount] = useState(0);

  const questions = [copy.q1, copy.q2, copy.q3];

  useEffect(() => {
    if (!letter?.bridge_letter.content) {
      setTypedLetter('');
      return;
    }
    let index = 0;
    setTypedLetter('');
    const timer = window.setInterval(() => {
      index += 1;
      setTypedLetter(letter.bridge_letter.content.slice(0, index));
      if (index >= letter.bridge_letter.content.length) {
        clearInterval(timer);
      }
    }, 10);
    return () => clearInterval(timer);
  }, [letter]);

  useEffect(() => {
    const now = new Date();
    const usage = parseBridgeUsage(localStorage.getItem('luna_bridge_usage'), now);
    setUsageCount(usage.count);
    localStorage.setItem('luna_bridge_usage', JSON.stringify(usage));
  }, []);

  const handleContinue = () => {
    setError(null);
    if (!canUseBridgeReflection(usageCount, premiumActive)) {
      setError(copy.weeklyLimit);
      return;
    }
    setStep('reflection');
  };

  const handleAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (questionIndex < 2) {
      setQuestionIndex(prev => prev + 1);
    } else {
      handleGenerate();
    }
  };

  const handleGenerate = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setError(null);
    setStep('result');
    
    const input: BridgeReflectionInput = normalizeBridgeReflectionInput({
      language: lang,
      reflection: {
        quiet_presence: answers[0],
        not_meaning: answers[1],
        kindness_needed: answers[2]
      }
    });

    try {
      const result = await generateBridgeLetter(input);
      
      if ('error' in result) {
        setError(result.error.message);
      } else {
        setLetter(result);
        const next = incrementBridgeUsage(localStorage.getItem('luna_bridge_usage'), new Date());
        setUsageCount(next.count);
        localStorage.setItem('luna_bridge_usage', JSON.stringify(next));
      }
    } catch (_e) {
      setError(copy.generateError);
    }
    setIsGenerating(false);
  };

  const handleShare = async () => {
    if (!letter) return;
    setShareFeedback(null);

    const result = await shareTextSafely(letter.bridge_letter.content, copy.shareTitle);
    if (result === 'shared') setShareFeedback(copy.shared);
    else if (result === 'copied') setShareFeedback(copy.copied);
    else setShareFeedback(copy.shareError);
  };

  return (
    <>
      <MemberIconBackButton lang={lang} onClick={onBack} className="mb-0" />
      <MemberPageIntro lang={lang} page="bridge" tab="bridge" />

      <LunaPageContentSection themeClass={getLunaPageTheme('bridge').shellClass} padded={false} className="min-h-[70vh] flex flex-col text-center space-y-10">
      <JourneyProgress lang={lang} currentStep={3} />
      <section className="rounded-[2.6rem] border border-slate-200/70 dark:border-slate-800/80 bg-gradient-to-br from-[#f6ebf4]/90 via-[#eee8f3]/86 to-[#e5edf9]/82 dark:from-[#07122a]/94 dark:via-[#0b1a35]/92 dark:to-[#112446]/90 p-7 md:p-9 shadow-[0_18px_46px_rgba(88,70,126,0.18)] dark:shadow-[0_22px_54px_rgba(0,0,0,0.5)] space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
          <article className="rounded-[2rem] border border-slate-200/70 dark:border-slate-800/85 bg-white/75 dark:bg-slate-900/55 p-5 md:p-6 space-y-3">
            <p className="text-base md:text-lg font-black uppercase tracking-[0.18em] text-luna-purple">{info.problemTitle}</p>
            <p className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">{info.problemBody}</p>
          </article>
          <article className="rounded-[2rem] border border-slate-200/70 dark:border-slate-800/85 bg-white/75 dark:bg-slate-900/55 p-5 md:p-6 space-y-3">
            <p className="text-base md:text-lg font-black uppercase tracking-[0.18em] text-luna-purple">{info.helpsTitle}</p>
            <ul className="space-y-1">
              <li className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">• {info.helps[0]}</li>
              <li className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">• {info.helps[1]}</li>
              <li className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">• {info.helps[2]}</li>
            </ul>
            <p className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200">{info.unique}</p>
          </article>
        </div>
        <article className="rounded-[2rem] border border-slate-200/70 dark:border-slate-800/85 bg-gradient-to-br from-[#f3e8f2]/86 via-[#eae5f2]/82 to-[#e2eaf8]/78 dark:from-[#081329]/92 dark:via-[#0c1a34]/90 dark:to-[#122344]/88 p-5 md:p-6 text-left space-y-3">
          <p className="text-base md:text-lg font-black uppercase tracking-[0.18em] text-luna-purple">{info.howTitle}</p>
          <ul className="space-y-1">
            <li className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">1. {info.how[0]}</li>
            <li className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">2. {info.how[1]}</li>
            <li className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">3. {info.how[2]}</li>
          </ul>
        </article>
        <article className="rounded-[2rem] border border-slate-200/70 dark:border-slate-800/85 bg-white/72 dark:bg-slate-900/52 p-5 md:p-6 text-left space-y-3">
          <p className="text-base md:text-lg font-black uppercase tracking-[0.18em] text-luna-purple">{info.commentsTitle}</p>
          {info.comments.map((item) => (
            <div key={item.author} className="rounded-2xl border border-slate-200/70 dark:border-slate-800/85 bg-slate-50/70 dark:bg-slate-950/35 p-4">
              <p className="text-sm md:text-base font-semibold italic text-slate-700 dark:text-slate-200">“{item.quote}”</p>
              <p className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{item.author}</p>
            </div>
          ))}
        </article>
      </section>
      <AnimatePresence mode="wait">
        {step === 'entry' && (
          <motion.div 
            key="entry"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
          >
            <p className="text-lg md:text-xl font-medium italic text-slate-800 dark:text-slate-200 leading-relaxed max-w-2xl">
              "{copy.entryQuote}"
            </p>
            <button 
              onClick={handleContinue}
              className="px-12 py-5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-full text-xs font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all"
            >
              {copy.continue}
            </button>
            {error && <p className="text-rose-500 text-xs font-bold uppercase tracking-widest">{error}</p>}
          </motion.div>
        )}

        {step === 'reflection' && (
          <motion.div 
            key="reflection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-xl space-y-12"
          >
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">{copy.question} {questionIndex + 1} {copy.of3}</span>
              <h3 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {questions[questionIndex]}
              </h3>
            </div>

            <form onSubmit={handleAnswerSubmit} className="space-y-8">
              <input 
                autoFocus
                type="text"
                value={answers[questionIndex]}
                onChange={(e) => {
                  const newAnswers = [...answers];
                  newAnswers[questionIndex] = e.target.value;
                  setAnswers(newAnswers);
                }}
                className="w-full bg-transparent border-b-2 border-slate-200 dark:border-slate-800 focus:border-luna-purple py-4 text-2xl outline-none transition-all text-center italic"
                placeholder={copy.placeholder}
              />
              <button 
                type="submit"
                disabled={!answers[questionIndex].trim()}
                className="px-10 py-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-full text-[10px] font-black uppercase tracking-widest disabled:opacity-20 transition-all"
              >
                {questionIndex < 2 ? copy.next : copy.form}
              </button>
            </form>
          </motion.div>
        )}

        {step === 'result' && (
          <motion.div 
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-2xl space-y-12"
          >
            {isGenerating ? (
              <div className="space-y-8 animate-pulse">
                <div className="w-16 h-16 border-4 border-luna-purple border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{copy.forming}</p>
              </div>
            ) : error ? (
              <div className="space-y-8">
                <div className="text-5xl">⚠️</div>
                <p className="text-rose-500 font-bold">{error}</p>
                <button onClick={onBack} className="px-8 py-3 bg-slate-900 text-white rounded-full font-black uppercase tracking-widest">{copy.back}</button>
              </div>
            ) : letter ? (
              <div className="space-y-12 animate-in fade-in zoom-in-95 duration-1000">
                <div className="p-10 md:p-16 luna-vivid-surface rounded-[4rem] text-left">
                  <p className="text-xl md:text-2xl leading-relaxed italic text-slate-700 dark:text-slate-200 whitespace-pre-wrap">
                    {typedLetter || letter.bridge_letter.content}
                  </p>
                </div>

                <div className="space-y-8">
                  <p className="text-lg font-bold italic text-slate-500">
                    "{copy.resultQuote}"
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button 
                      onClick={() => onBack()}
                      className="px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all"
                    >
                      {copy.keep}
                    </button>
                    <button 
                      onClick={handleShare}
                      className="px-10 py-5 luna-vivid-chip text-slate-600 dark:text-slate-200 rounded-full text-[10px] font-black uppercase tracking-widest hover:border-luna-purple transition-all"
                    >
                      {copy.share}
                    </button>
                  </div>
                  {shareFeedback && (
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{shareFeedback}</p>
                  )}
                </div>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
      </LunaPageContentSection>
    </>
  );
};
