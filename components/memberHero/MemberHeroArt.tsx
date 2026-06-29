import React, { useState } from 'react';
import { TabType } from '../../utils/navigation';
import { getMemberHeroImage } from '../../utils/memberHeroImages';

type MemberHeroArtProps = {
  variant: TabType;
  className?: string;
};

export const MemberHeroArt: React.FC<MemberHeroArtProps> = ({ variant, className = '' }) => {
  const src = getMemberHeroImage(variant);
  const [failed, setFailed] = useState(false);

  return (
    <div className={`member-hero-art member-hero-art--painted absolute inset-0 overflow-hidden ${className}`}>
      <div className="member-hero-art__frame absolute inset-[3px] md:inset-1.5 rounded-[1.75rem] md:rounded-[2.25rem] border border-white/25 dark:border-white/10 pointer-events-none z-20" />
      {!failed ? (
        <img
          src={src}
          alt=""
          aria-hidden
          decoding="async"
          loading="eager"
          className="member-hero-art__photo absolute inset-0 h-full w-full object-cover object-[center_28%] scale-[1.04]"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="member-hero-art__fallback absolute inset-0 bg-gradient-to-br from-[#f5ebe4] via-[#e9dee6] to-[#d6dff7] dark:from-[#0f172a] dark:via-[#1e1b4b] dark:to-[#312e81]" />
      )}
      <div className="member-hero-art__vignette pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(109,92,121,0.12)_100%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.35)_100%)]" />
      <div className="member-hero-art__tone-light pointer-events-none absolute inset-0 bg-gradient-to-br from-white/22 via-transparent to-[#f2ccda]/18" />
      <div className="member-hero-art__tone-dark pointer-events-none absolute inset-0 hidden bg-gradient-to-br from-[#020617]/50 via-[#1e1b4b]/30 to-transparent" />
      <div className="member-hero-art__fade pointer-events-none absolute inset-x-0 bottom-0" />
    </div>
  );
};
