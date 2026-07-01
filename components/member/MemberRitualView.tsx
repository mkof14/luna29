import React, { Suspense, lazy } from 'react';
import { Language } from '../../constants';
import { MEMBER_PAGE_RITUAL } from '../../utils/memberPageStyles';
import { MemberBackButton } from './MemberBackButton';

const PublicRitualSection = lazy(() =>
  import('../public/PublicRitualSection').then((m) => ({ default: m.PublicRitualSection })),
);

type MemberRitualViewProps = {
  lang: Language;
  onBack: () => void;
};

export const MemberRitualView: React.FC<MemberRitualViewProps> = ({ lang, onBack }) => (
  <section className={MEMBER_PAGE_RITUAL} data-testid="member-tab-ritual_path">
    <MemberBackButton lang={lang} onClick={onBack} />
    <Suspense
      fallback={
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Loading…</p>
      }
    >
      <PublicRitualSection lang={lang} onSignIn={() => undefined} />
    </Suspense>
  </section>
);
