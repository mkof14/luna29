import React from 'react';
import { Language } from '../../constants';
import { getMemberPageIntro, MemberIntroPageId } from '../../utils/memberPageIntros';
import { getMemberHeroImage } from '../../utils/memberHeroImages';
import { TabType } from '../../utils/navigation';
import { TAB_INTRO_PAGE, getLunaPageTheme } from '../../utils/lunaPageThemes';
import { LunaPageHeroSection } from '../shared/LunaPageHeroSection';

type MemberPageIntroProps = {
  lang: Language;
  page: MemberIntroPageId;
  tab?: TabType;
  className?: string;
};

const introPageToTab = (page: MemberIntroPageId): TabType | undefined =>
  (Object.entries(TAB_INTRO_PAGE).find(([, introPage]) => introPage === page)?.[0] as TabType | undefined);

export const MemberPageIntro: React.FC<MemberPageIntroProps> = ({ lang, page, tab, className = '' }) => {
  const intro = getMemberPageIntro(lang, page);
  const resolvedTab = tab ?? introPageToTab(page) ?? 'dashboard';
  const theme = getLunaPageTheme(resolvedTab);
  const image = getMemberHeroImage(resolvedTab);

  return (
    <div className={className}>
      <LunaPageHeroSection
        themeClass={theme.shellClass}
        eyebrow={intro.eyebrow}
        title={intro.title}
        subtitle={intro.body}
        image={image}
        imageAlt={intro.title}
        tips={intro.tips}
      />
    </div>
  );
};
