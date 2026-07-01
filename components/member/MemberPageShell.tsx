import React from 'react';
import { Language, TranslationSchema } from '../../constants';
import { TabType } from '../../utils/navigation';
import { MEMBER_PAGE_ROOT } from '../../utils/memberPageStyles';
import { getLunaPageTheme, TAB_SELF_CONTAINED_LAYOUT } from '../../utils/lunaPageThemes';
import { PUBLIC_PAGE_STACK } from '../public/publicPageStyles';
import { MemberTabHero } from './MemberTabHero';
import { MemberBackButton } from './MemberBackButton';

type MemberPageShellProps = {
  tab: TabType;
  lang: Language;
  ui: TranslationSchema;
  children: React.ReactNode;
  /** Skip outer stack — page renders full Public* layout itself. */
  selfContained?: boolean;
};

export const MemberPageShell: React.FC<MemberPageShellProps> = ({
  tab,
  lang,
  ui,
  children,
  selfContained,
}) => {
  const theme = getLunaPageTheme(tab);
  const isSelfContained = selfContained ?? TAB_SELF_CONTAINED_LAYOUT.has(tab);

  if (isSelfContained) {
    return <>{children}</>;
  }

  return (
    <section
      className={`${MEMBER_PAGE_ROOT} ${theme.shellClass}`}
      data-testid={`member-shell-${tab}`}
    >
      <div className={PUBLIC_PAGE_STACK}>
        <MemberTabHero tab={tab} lang={lang} ui={ui} />
        {children}
      </div>
    </section>
  );
};
