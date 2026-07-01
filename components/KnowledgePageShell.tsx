import React from 'react';
import { PublicPageArtHeader } from './public/PublicPageArtHeader';
import type { PublicArtPage } from '../utils/publicPageArt';

export type KnowledgeStat = { label: string; value: string };

export type KnowledgePageShellProps = {
  eyebrow?: string;
  titleA: string;
  titleB: string;
  subtitle: string;
  stats?: KnowledgeStat[];
  backLabel?: string;
  onBack?: () => void;
  footerTitle: string;
  footerQuote: string;
  heroPage?: PublicArtPage;
  children: React.ReactNode;
};

export const KnowledgePageShell: React.FC<KnowledgePageShellProps> = ({
  eyebrow,
  titleA,
  titleB,
  subtitle,
  stats,
  backLabel,
  onBack,
  footerTitle,
  footerQuote,
  heroPage,
  children,
}) => (
  <div className="relative max-w-6xl mx-auto luna-page-shell luna-page-knowledge animate-in fade-in slide-in-from-bottom-10 duration-1000 px-4 md:px-8 pb-32 pt-2 md:pt-4">
    <div className="pointer-events-none absolute -top-24 right-0 w-72 h-72 rounded-full bg-luna-purple/15 blur-[100px]" />
    <div className="pointer-events-none absolute top-1/3 -left-20 w-64 h-64 rounded-full bg-luna-teal/12 blur-[90px]" />

    {onBack && backLabel && (
      <div className="relative z-10 flex justify-start mb-8">
        <button
          type="button"
          onClick={onBack}
          className="group inline-flex items-center gap-3 rounded-full border border-slate-200/80 dark:border-slate-700/80 bg-white/70 dark:bg-slate-900/60 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 hover:text-luna-purple hover:border-luna-purple/40 transition-all"
        >
          <span className="text-base group-hover:-translate-x-1 transition-transform">←</span>
          {backLabel}
        </button>
      </div>
    )}

    {heroPage ? (
      <div className="relative z-10 mb-8 md:mb-10 space-y-6">
        <PublicPageArtHeader page={heroPage} eyebrow={eyebrow || titleA} title={`${titleA} ${titleB}`.trim()} />
        <p className="mx-auto max-w-3xl text-center text-base md:text-xl text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{subtitle}</p>
        {stats && stats.length > 0 && (
          <div className="mx-auto grid max-w-4xl grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-[1.6rem] border border-slate-200/80 dark:border-slate-700/70 bg-white/75 dark:bg-slate-900/50 backdrop-blur-md px-4 py-4 text-center shadow-[0_8px_24px_rgba(71,85,105,0.08)]"
              >
                <p className="text-xl md:text-2xl font-black text-luna-purple">{stat.value}</p>
                <p className="mt-1 text-[9px] md:text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    ) : null}

    <header className={`relative z-10 text-center space-y-7 mb-14 md:mb-20 ${heroPage ? 'hidden' : ''}`}>
      {eyebrow && (
        <p className="inline-flex items-center gap-2 rounded-full border border-luna-purple/25 bg-luna-purple/8 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.32em] text-luna-purple">
          {eyebrow}
        </p>
      )}
      <h1 className="text-[clamp(2.4rem,6vw,5.5rem)] font-black tracking-tighter leading-[0.92] uppercase text-slate-950 dark:text-white">
        {titleA}
        <br />
        <span className="bg-gradient-to-r from-luna-purple via-fuchsia-500 to-luna-teal bg-clip-text text-transparent">{titleB}</span>
      </h1>
      <p className="mx-auto max-w-3xl text-base md:text-xl text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{subtitle}</p>

      {stats && stats.length > 0 && (
        <div className="mx-auto grid max-w-4xl grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[1.6rem] border border-slate-200/80 dark:border-slate-700/70 bg-white/75 dark:bg-slate-900/50 backdrop-blur-md px-4 py-4 text-center shadow-[0_8px_24px_rgba(71,85,105,0.08)]"
            >
              <p className="text-xl md:text-2xl font-black text-luna-purple">{stat.value}</p>
              <p className="mt-1 text-[9px] md:text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>
      )}
    </header>

    <div className="relative z-10 rounded-[2.5rem] md:rounded-[3rem] border border-slate-200/80 dark:border-slate-700/70 bg-white/72 dark:bg-slate-950/45 backdrop-blur-xl p-5 md:p-10 shadow-[0_20px_60px_rgba(71,85,105,0.12)] dark:shadow-[0_24px_70px_rgba(2,6,23,0.45)]">
      {children}
    </div>

    <footer className="relative z-10 mt-14 md:mt-20 overflow-hidden rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-800/10 bg-gradient-to-br from-slate-950 via-[#1a1030] to-slate-950 p-10 md:p-16 text-center text-white shadow-2xl">
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute -top-16 -left-16 h-56 w-56 rounded-full bg-luna-purple blur-[90px]" />
        <div className="absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-luna-teal blur-[100px]" />
      </div>
      <p className="relative z-10 text-[10px] md:text-xs font-black uppercase tracking-[0.28em] text-white/45">{footerTitle}</p>
      <p className="relative z-10 mx-auto mt-5 max-w-3xl text-lg md:text-2xl font-semibold leading-relaxed text-white/92">{footerQuote}</p>
    </footer>
  </div>
);
