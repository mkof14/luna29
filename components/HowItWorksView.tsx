import React, { useEffect, useState } from 'react';
import { Language, LangCopy, getLang } from '../constants';
import type { Copy, ExtraHowCopy } from '../utils/howItWorksContent';
import { MEMBER_PAGE_KNOWLEDGE } from '../utils/memberPageStyles';
import { MemberBackButton } from './member/MemberBackButton';
import { PublicHeroBlock } from './public/PublicHeroBlock';
import { PUBLIC_PAGE_ART } from '../utils/publicPageArt';
import {
  PUBLIC_BODY,
  PUBLIC_CARD,
  PUBLIC_H3,
  PUBLIC_PAGE_STACK,
  PUBLIC_SHELL,
  PUBLIC_SHELL_INNER,
  PUBLIC_SHELL_PAD,
  PUBLIC_SURFACE,
} from './public/publicPageStyles';
import { getPublicChromeCopy } from '../utils/publicChromeCopy';

interface HowItWorksViewProps {
  lang: Language;
  onBack?: () => void;
  mode?: 'public' | 'member';
}

export const HowItWorksView: React.FC<HowItWorksViewProps> = ({ lang, onBack, mode = 'public' }) => {
  const loadingByLang: LangCopy< string> = {
    en: 'Loading...',
    ru: 'Загрузка...',
    uk: 'Завантаження...',
    es: 'Cargando...',
    fr: 'Chargement...',
    de: 'Lädt...',
    zh: '加载中...',
    ja: '読み込み中...',
    pt: 'Carregando...',
    ar: 'جارٍ التحميل...',
    he: 'טוען...',};
  const [activeStep, setActiveStep] = useState(0);
  const [content, setContent] = useState<{
    copy: LangCopy< Copy>;
    extra: LangCopy< ExtraHowCopy>;
  } | null>(null);
  useEffect(() => {
    let alive = true;
    import('../utils/howItWorksContent').then((module) => {
      if (!alive) return;
      setContent({ copy: module.COPY, extra: module.EXTRA_HOW_COPY });
    });
    return () => {
      alive = false;
    };
  }, []);
  if (!content) {
    return (
      <section className="max-w-6xl mx-auto pb-20 p-6 md:p-8 luna-page-shell luna-page-knowledge animate-in fade-in duration-500">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{getLang(loadingByLang, lang) || loadingByLang.en}</p>
      </section>
    );
  }
  const c = content.copy[lang] || content.copy.en;
  const extra = content.extra[lang] || content.extra.en;
  const cardTones = [
    'from-[#f7e7ea] to-[#f5edf8] dark:from-slate-800/70 dark:to-slate-800/50',
    'from-[#efe6f8] to-[#e8f0fb] dark:from-slate-800/65 dark:to-slate-800/45',
    'from-[#e8f3ef] to-[#edf0fb] dark:from-slate-800/60 dark:to-slate-800/50',
    'from-[#f6ece4] to-[#efe9f6] dark:from-slate-800/70 dark:to-slate-800/50',
  ];

  const FlowIcon: React.FC<{ type: 'pulse' | 'map' | 'guide' | 'bridge' }> = ({ type }) => {
    const common = 'w-11 h-11';
    if (type === 'pulse') {
      return (
        <svg viewBox="0 0 48 48" className={common} aria-hidden="true">
          <defs>
            <linearGradient id="lunaPulse" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#14b8a6" />
            </linearGradient>
          </defs>
          <circle cx="24" cy="24" r="20" fill="none" stroke="url(#lunaPulse)" strokeWidth="2.8" opacity="0.9" />
          <path d="M8 25h8l4-8 6 15 4-9h10" fill="none" stroke="url(#lunaPulse)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }
    if (type === 'map') {
      return (
        <svg viewBox="0 0 48 48" className={common} aria-hidden="true">
          <defs>
            <linearGradient id="lunaMap" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
          <path d="M10 12l10-4 8 4 10-4v28l-10 4-8-4-10 4V12z" fill="none" stroke="url(#lunaMap)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M20 8v28M28 12v28" fill="none" stroke="url(#lunaMap)" strokeWidth="2.2" opacity="0.85" />
        </svg>
      );
    }
    if (type === 'guide') {
      return (
        <svg viewBox="0 0 48 48" className={common} aria-hidden="true">
          <defs>
            <linearGradient id="lunaGuide" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
          <path d="M24 7c9 0 16 7 16 16 0 10-9 18-16 18S8 33 8 23c0-9 7-16 16-16z" fill="none" stroke="url(#lunaGuide)" strokeWidth="2.6" />
          <path d="M24 14v11m0 0l-5 5m5-5l5-5" fill="none" stroke="url(#lunaGuide)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 48 48" className={common} aria-hidden="true">
        <defs>
          <linearGradient id="lunaBridge" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
        <path d="M8 30c4-8 10-12 16-12s12 4 16 12" fill="none" stroke="url(#lunaBridge)" strokeWidth="2.8" strokeLinecap="round" />
        <path d="M10 35h28M16 35v-7m8 7v-9m8 9v-7" fill="none" stroke="url(#lunaBridge)" strokeWidth="2.6" strokeLinecap="round" />
      </svg>
    );
  };

  const chrome = getPublicChromeCopy(lang);
  const shellClass = mode === 'member' ? MEMBER_PAGE_KNOWLEDGE : 'luna-page-shell luna-page-knowledge animate-in fade-in duration-500 space-y-8 relative p-6 md:p-8 max-w-6xl mx-auto';

  return (
    <section className={shellClass}>
      {onBack && mode === 'member' && <MemberBackButton lang={lang} onClick={onBack} />}
      {onBack && mode === 'public' && (
        <button onClick={onBack} className="mb-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-luna-purple transition-all">
          {chrome.back}
        </button>
      )}

      <div className={PUBLIC_PAGE_STACK}>
        <section className={`${PUBLIC_SHELL} luna-page-knowledge ${PUBLIC_SHELL_PAD}`}>
          <div className={PUBLIC_SHELL_INNER}>
            <PublicHeroBlock
              eyebrow={c.eyebrow}
              title={c.title}
              subtitle={c.subtitle}
              image={PUBLIC_PAGE_ART.how_it_works}
              imageAlt={c.title}
            />
          </div>
        </section>

      <section className={`${PUBLIC_SHELL} luna-page-knowledge ${PUBLIC_SHELL_PAD}`}>
        <div className={`${PUBLIC_SHELL_INNER} ${PUBLIC_SURFACE} space-y-6`}>
        <h2 className={PUBLIC_H3}>{c.flowTitle}</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5">
          {c.flow.map((item, idx) => (
            <article
              key={item.step}
              onClick={() => setActiveStep(idx)}
              className={`rounded-3xl border p-6 space-y-3 shadow-[0_8px_30px_rgba(50,40,80,0.08)] cursor-pointer transition-all duration-300 hover:-translate-y-1 ${
                activeStep === idx
                  ? 'border-luna-purple/50 ring-2 ring-luna-purple/30 bg-gradient-to-br from-white/95 to-white/85 dark:from-slate-800/80 dark:to-slate-800/65'
                  : `border-slate-200/70 dark:border-slate-700/70 bg-gradient-to-br ${cardTones[idx]}`
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm md:text-base font-black uppercase tracking-[0.2em] text-luna-purple">{item.step}</span>
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl border border-white/60 dark:border-slate-700/80 bg-white/70 dark:bg-slate-900/60 shadow-sm">
                  <FlowIcon type={item.icon} />
                </span>
              </div>
              <h3 className="text-xl font-black tracking-tight">{item.title}</h3>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">{item.text}</p>
            </article>
          ))}
          </div>
          <aside className="rounded-3xl border border-slate-200/80 dark:border-slate-700/80 bg-gradient-to-br from-white/90 to-[#f4edf8]/90 dark:from-slate-900/70 dark:to-slate-800/70 p-6 shadow-luna-rich flex flex-col">
            <p className="text-sm md:text-base font-black uppercase tracking-[0.2em] text-luna-purple mb-2">{c.livePreview}</p>
            <div className="rounded-2xl border border-slate-200/70 dark:border-slate-700/70 bg-white/80 dark:bg-slate-900/55 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-black uppercase tracking-[0.16em] text-slate-500">{c.stepLabel}</span>
                <span className="text-xs font-black uppercase tracking-[0.2em] text-luna-purple">{c.flow[activeStep]?.step}</span>
              </div>
              <h4 className="text-lg font-black tracking-tight">{c.flow[activeStep]?.title}</h4>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{c.flow[activeStep]?.text}</p>
              <div className="pt-2">
                <div className="h-2 rounded-full bg-slate-200/80 dark:bg-slate-700/70 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-luna-purple via-luna-coral to-luna-teal transition-all duration-500"
                    style={{ width: `${((activeStep + 1) / c.flow.length) * 100}%` }}
                  />
                </div>
                <p className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  {activeStep + 1} {c.of} {c.flow.length}
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => setActiveStep((prev) => (prev === 0 ? c.flow.length - 1 : prev - 1))}
                className="px-3 py-2 rounded-xl border border-slate-300/80 dark:border-slate-700 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300 hover:text-luna-purple transition-colors"
              >
                {c.prev}
              </button>
              <button
                onClick={() => setActiveStep((prev) => (prev + 1) % c.flow.length)}
                className="px-3 py-2 rounded-xl bg-luna-purple text-white text-[10px] font-black uppercase tracking-[0.2em] hover:brightness-110 transition-all"
              >
                {c.next}
              </button>
            </div>
          </aside>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-[2.5rem] border border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-7 md:p-8 shadow-luna-rich space-y-5">
          <h3 className="text-2xl font-black tracking-tight">{c.benefitsTitle}</h3>
          {c.benefits.map((item) => (
            <article key={item.title} className="rounded-2xl border border-slate-200/70 dark:border-slate-700/70 bg-slate-50/85 dark:bg-slate-800/50 p-5">
              <h4 className="text-lg font-black tracking-tight mb-1">{item.title}</h4>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{item.text}</p>
            </article>
          ))}
        </div>
        <div className="rounded-[2.5rem] border border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-7 md:p-8 shadow-luna-rich space-y-5">
          <h3 className="text-2xl font-black tracking-tight">{c.faqTitle}</h3>
          {c.faq.map((item) => (
            <article key={item.q} className="rounded-2xl border border-slate-200/70 dark:border-slate-700/70 bg-slate-50/85 dark:bg-slate-800/50 p-5">
              <h4 className="text-base font-black tracking-tight mb-2">{item.q}</h4>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{item.a}</p>
            </article>
          ))}
          {onBack && (
            <button
              onClick={onBack}
              className="mt-2 px-6 py-3 rounded-full bg-luna-purple text-white text-[11px] font-black uppercase tracking-[0.2em] hover:scale-[1.03] active:scale-[0.98] transition-all"
            >
              {c.cta}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <article className="rounded-[2.5rem] border border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-7 md:p-8 shadow-luna-rich space-y-4">
          <h3 className="text-xl font-black tracking-tight">{extra.dailyTitle}</h3>
          <ul className="space-y-2">
            {extra.dailyItems.map((item) => (
              <li key={item} className="text-sm font-semibold text-slate-600 dark:text-slate-300">• {item}</li>
            ))}
          </ul>
        </article>
        <article className="rounded-[2.5rem] border border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-7 md:p-8 shadow-luna-rich space-y-4">
          <h3 className="text-xl font-black tracking-tight">{extra.onboardingTitle}</h3>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">{extra.onboardingBody}</p>
        </article>
        <article className="rounded-[2.5rem] border border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-7 md:p-8 shadow-luna-rich space-y-4">
          <h3 className="text-xl font-black tracking-tight">{extra.localModeTitle}</h3>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">{extra.localModeBody}</p>
        </article>
        <article className="rounded-[2.5rem] border border-slate-200/70 dark:border-slate-800 bg-gradient-to-br from-[#e9eefb]/90 to-[#dff6f3]/90 dark:from-slate-900/80 dark:to-slate-800/70 p-7 md:p-8 shadow-luna-rich space-y-4">
          <h3 className="text-xl font-black tracking-tight">{chrome.healthReportsTitle}</h3>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">{extra.reportsBody}</p>
        </article>
      </div>

      <div className="rounded-[2.5rem] border border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-7 md:p-8 shadow-luna-rich space-y-5">
        <h3 className="text-2xl font-black tracking-tight">{c.commentsTitle}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {c.comments.map((item) => (
            <article key={`${item.author}-${item.quote.slice(0, 12)}`} className="rounded-2xl border border-slate-200/70 dark:border-slate-700/70 bg-slate-50/85 dark:bg-slate-800/50 p-5 space-y-3">
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 leading-relaxed italic">“{item.quote}”</p>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-luna-purple">{item.author}</p>
            </article>
          ))}
        </div>
      </div>
        </div>
      </section>
      </div>
    </section>
  );
};
