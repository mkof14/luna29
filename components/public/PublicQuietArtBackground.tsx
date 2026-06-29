import React from 'react';
import { PUBLIC_PAGE_ART, PublicArtPage } from '../../utils/publicPageArt';

type Props = {
  page: PublicArtPage;
};

/** Site-wide quiet watercolor wash behind public pages; home uses the main hero art. */
export const PublicQuietArtBackground: React.FC<Props> = ({ page }) => {
  const src = PUBLIC_PAGE_ART[page] ?? PUBLIC_PAGE_ART.home;
  const isHome = page === 'home';

  return (
    <div
      className={`public-quiet-art pointer-events-none absolute inset-0 z-0 overflow-hidden ${isHome ? 'public-quiet-art--home' : ''}`}
      aria-hidden
    >
      <img
        src={src}
        alt=""
        className={`public-quiet-art__image absolute inset-0 h-full w-full object-cover ${
          isHome ? 'public-quiet-art__image--home object-[center_42%]' : 'object-[center_36%]'
        }`}
      />
      {isHome ? (
        <>
          <div className="absolute inset-0 bg-[#f3f0f8]/28 dark:bg-[#0b0d1f]/42" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/38 via-white/18 to-[#f3f0f8]/52 dark:from-[#0b0d1f]/55 dark:via-[#0b0d1f]/38 dark:to-[#0b0d1f]/72" />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#f5ebe4]/12 via-transparent to-[#d6dff7]/10 dark:from-[#1e1b4b]/16 dark:to-transparent" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-100/50 via-slate-100/62 to-slate-100/78 dark:from-slate-950/55 dark:via-slate-950/72 dark:to-slate-950/88" />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#f5ebe4]/25 via-transparent to-[#d6dff7]/20 dark:from-[#1e1b4b]/20 dark:to-transparent" />
        </>
      )}
    </div>
  );
};
