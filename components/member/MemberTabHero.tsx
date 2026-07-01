import React from 'react';
import { Language, TranslationSchema } from '../../constants';
import { TabType } from '../../utils/navigation';
import { getMemberHeroImage } from '../../utils/memberHeroImages';
import { getLunaPageTheme, TAB_INTRO_PAGE } from '../../utils/lunaPageThemes';
import { LunaPageHeroSection } from '../shared/LunaPageHeroSection';
import { getMemberTabHeroCopy } from '../../utils/memberTabHeroCopy';

type MemberTabHeroProps = {
  tab: TabType;
  lang: Language;
  ui: TranslationSchema;
};

/** Ritual-style hero for member tabs without a dedicated intro block. */
export const MemberTabHero: React.FC<MemberTabHeroProps> = ({ tab, lang, ui }) => {
  if (TAB_INTRO_PAGE[tab]) return null;

  const theme = getLunaPageTheme(tab);
  const copy = getMemberTabHeroCopy(tab, lang, ui);

  return (
    <LunaPageHeroSection
      themeClass={theme.shellClass}
      eyebrow={copy.eyebrow}
      title={copy.title}
      subtitle={copy.subtitle}
      image={getMemberHeroImage(tab)}
      imageAlt={copy.title}
      caption={copy.caption}
    />
  );
};
