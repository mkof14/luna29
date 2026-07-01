import React from 'react';
import { PublicHeroBlock } from './public/PublicHeroBlock';
import { PUBLIC_PAGE_ART, PublicArtPage } from '../utils/publicPageArt';
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
import { MemberBackButton } from './member/MemberBackButton';
import { Language } from '../constants';
import { MEMBER_PAGE_KNOWLEDGE } from '../utils/memberPageStyles';

export type KnowledgeStat = { label: string; value: string };

export type KnowledgePageShellProps = {
  lang: Language;
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
  mode?: 'public' | 'member';
  children: React.ReactNode;
};

export const KnowledgePageShell: React.FC<KnowledgePageShellProps> = ({
  lang,
  eyebrow,
  titleA,
  titleB,
  subtitle,
  stats,
  onBack,
  footerTitle,
  footerQuote,
  heroPage = 'learning',
  mode = 'public',
  children,
}) => {
  const isMember = mode === 'member';
  const title = [titleA, titleB].filter(Boolean).join(' ').trim();
  const heroImage = PUBLIC_PAGE_ART[heroPage] ?? PUBLIC_PAGE_ART.learning;
  const wrapperClass = isMember
    ? `${MEMBER_PAGE_KNOWLEDGE}`
    : 'luna-page-shell luna-page-knowledge max-w-6xl mx-auto p-6 md:p-8 pb-32';

  return (
    <section className={`${wrapperClass} animate-in fade-in duration-500`}>
      {onBack && isMember && <MemberBackButton lang={lang} onClick={onBack} />}
      {onBack && !isMember && (
        <button
          type="button"
          onClick={onBack}
          className="mb-6 group inline-flex items-center gap-3 rounded-full border border-slate-300/90 dark:border-slate-400/55 bg-white/92 dark:bg-slate-800/92 px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.22em] text-slate-700 dark:text-slate-100 hover:text-luna-purple transition-all"
        >
          ← Back
        </button>
      )}

      <div className={PUBLIC_PAGE_STACK}>
        <section className={`${PUBLIC_SHELL} luna-page-knowledge ${PUBLIC_SHELL_PAD}`}>
          <div className={PUBLIC_SHELL_INNER}>
            <PublicHeroBlock
              eyebrow={eyebrow || titleA}
              title={title}
              subtitle={subtitle}
              image={heroImage}
              imageAlt={title}
            />
          </div>
        </section>

        {stats && stats.length > 0 && (
          <section className={`${PUBLIC_SHELL} luna-page-knowledge ${PUBLIC_SHELL_PAD}`}>
            <div className={`${PUBLIC_SHELL_INNER} grid grid-cols-2 md:grid-cols-4 gap-3`}>
              {stats.map((stat) => (
                <article key={stat.label} className={PUBLIC_CARD}>
                  <p className="text-xl md:text-2xl font-black text-luna-purple">{stat.value}</p>
                  <p className={`mt-1 ${PUBLIC_H3}`}>{stat.label}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className={`${PUBLIC_SHELL} luna-page-knowledge ${PUBLIC_SHELL_PAD}`}>
          <div className={`${PUBLIC_SHELL_INNER} ${PUBLIC_SURFACE}`}>{children}</div>
        </section>

        <section className={`${PUBLIC_SHELL} luna-page-journey ${PUBLIC_SHELL_PAD}`}>
          <div className={`${PUBLIC_SHELL_INNER} rounded-[1.6rem] sm:rounded-[2rem] border border-slate-800/10 bg-gradient-to-br from-slate-950 via-[#1a1030] to-slate-950 p-8 md:p-12 text-center text-white shadow-2xl`}>
            <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.28em] text-white/45">{footerTitle}</p>
            <p className={`mx-auto mt-4 max-w-3xl ${PUBLIC_BODY} !text-white/90`}>{footerQuote}</p>
          </div>
        </section>
      </div>
    </section>
  );
};
