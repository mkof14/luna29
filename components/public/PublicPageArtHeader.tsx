import React from 'react';
import { PUBLIC_PAGE_ART, PublicArtPage } from '../../utils/publicPageArt';

type Props = {
  page: PublicArtPage;
  eyebrow: string;
  title?: string;
};

/** Themed watercolor strip — visible but quiet, above public page content. */
export const PublicPageArtHeader: React.FC<Props> = ({ page, eyebrow, title }) => {
  const src = PUBLIC_PAGE_ART[page] ?? PUBLIC_PAGE_ART.home;
  return (
    <div className="public-page-art-header relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] border border-slate-200/50 dark:border-slate-700/45 mb-8 md:mb-10 min-h-[160px] md:min-h-[200px] shadow-[0_16px_48px_rgba(109,92,121,0.08)]">
      <img src={src} alt="" aria-hidden className="public-page-art-header__image absolute inset-0 h-full w-full object-cover object-[center_32%]" />
      <div className="absolute inset-0 bg-gradient-to-br from-white/55 via-slate-100/35 to-[#f5ebe4]/40 dark:from-slate-950/65 dark:via-slate-950/45 dark:to-[#1e1b4b]/35" />
      <div className="member-hero-art__fade pointer-events-none absolute inset-x-0 bottom-0 h-[55%]" />
      <div className="relative z-10 flex flex-col justify-end h-full min-h-[inherit] p-6 md:p-8">
        <p className="text-[10px] font-black uppercase tracking-[0.45em] text-luna-purple drop-shadow-sm">{eyebrow}</p>
        {title && (
          <h1 className="text-2xl md:text-4xl font-black tracking-tight text-slate-800 dark:text-slate-50 mt-2 drop-shadow-sm">
            {title}
          </h1>
        )}
      </div>
    </div>
  );
};
