import React, { useState } from 'react';
import { PUBLIC_BTN_PRIMARY, PUBLIC_BTN_PRIMARY_GLOW, PUBLIC_BTN_SECONDARY, PUBLIC_BTN_SECONDARY_ACCENT } from './publicButtonStyles';
import { PublicHeroBlock } from './PublicHeroBlock';
import { PUBLIC_PAGE_ART } from '../../utils/publicPageArt';
import {
  PUBLIC_BODY,
  PUBLIC_CARD,
  PUBLIC_CARD_SOFT,
  PUBLIC_CHIP,
  PUBLIC_EYEBROW,
  PUBLIC_H3,
  PUBLIC_PAGE_STACK,
  PUBLIC_SHELL,
  PUBLIC_SHELL_INNER,
  PUBLIC_SHELL_PAD,
  PUBLIC_SURFACE,
} from './publicPageStyles';
import { Language } from '../../constants';
import { FREE_FEATURES, PAID_FEATURES } from '../../utils/subscriptionAccess';
import { getLabsViewLocalizedContent } from '../../utils/labsViewContent';
import {
  downloadPublicSampleReport,
  previewPublicSampleReport,
  printPublicSampleReportPdf,
} from '../../utils/publicSampleReportPreview';

interface PublicPricingSectionProps {
  lang: Language;
  pricingLabel: string;
  billingPeriod: 'month' | 'year';
  setBillingPeriod: (value: 'month' | 'year') => void;
  pricingCopy: {
    title: string;
    subtitle: string;
    month: string;
    year: string;
    monthNote: string;
    yearNote: string;
    saveBadge: string;
    cta: string;
    recommended: string;
  };
  pricingUi: {
    monthToggle: string;
    yearToggle: string;
    trialBadge: string;
    trialDaysLeft: string;
    flexibleBilling: string;
    planCompare: string;
    monthly: string;
    yearly: string;
    cancelAnyTime: string;
    bestValue: string;
    includes: string;
    includesText: string;
    memberAccess: string;
    featurePrivate: string;
    featureBodyMap: string;
    featureBridge: string;
    featureReports: string;
    continueTrial: string;
    startTrial: string;
    subscribeCta: string;
    freeAccountCta: string;
    freeTier?: string;
    paidTier?: string;
  };
  trialState: { status: 'active' | 'expired' } | null;
  trialDaysLeft: number;
  onSignUp: () => void;
  onStartTrial: () => void;
  onSubscribe: () => void;
  trialFeedback: string;
}

export const PublicPricingSection: React.FC<PublicPricingSectionProps> = ({
  lang,
  pricingLabel,
  billingPeriod,
  setBillingPeriod,
  pricingCopy,
  pricingUi,
  trialState,
  trialDaysLeft,
  onSignUp,
  onStartTrial,
  onSubscribe,
  trialFeedback,
}) => {
  const freeTierLabel = pricingUi.freeTier || 'Free';
  const paidTierLabel = pricingUi.paidTier || 'Insights (Paid)';
  const { reportUi, reportsUi } = getLabsViewLocalizedContent(lang, lang);
  const [sampleFeedback, setSampleFeedback] = useState('');
  const subscribeLabel =
    billingPeriod === 'month'
      ? pricingUi.subscribeCta.replace('{price}', pricingCopy.month)
      : pricingUi.subscribeCta.replace('{price}', pricingCopy.year);

  return (
    <section className={PUBLIC_PAGE_STACK}>
      <section className={`${PUBLIC_SHELL} luna-page-pricing luna-page-focus luna-focus-pricing ${PUBLIC_SHELL_PAD}`}>
        <div className={`${PUBLIC_SHELL_INNER} space-y-8`}>
          <PublicHeroBlock
            eyebrow={pricingLabel}
            title={pricingCopy.title}
            subtitle={pricingCopy.subtitle}
            image={PUBLIC_PAGE_ART.pricing}
            imageAlt="Luna29 pricing"
            imagePosition="center 30%"
            caption={pricingCopy.recommended}
          />

        <div className="flex justify-center">
          <div className={`inline-flex ${PUBLIC_CHIP} p-1 gap-1`}>
            <button
              type="button"
              onClick={() => setBillingPeriod('month')}
              className={`min-w-[110px] px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                billingPeriod === 'month'
                  ? 'bg-luna-purple text-white shadow-luna-rich'
                  : 'border border-slate-300/80 dark:border-slate-500/50 bg-white/75 dark:bg-slate-800/85 text-slate-700 dark:text-slate-100 hover:border-luna-purple/45'
              }`}
            >
              {pricingUi.monthToggle}
            </button>
            <button
              type="button"
              onClick={() => setBillingPeriod('year')}
              className={`min-w-[110px] px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                billingPeriod === 'year'
                  ? 'bg-luna-purple text-white shadow-luna-rich'
                  : 'border border-slate-300/80 dark:border-slate-500/50 bg-white/75 dark:bg-slate-800/85 text-slate-700 dark:text-slate-100 hover:border-luna-purple/45'
              }`}
            >
              {pricingUi.yearToggle}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch min-w-0 w-full">
          <article className={`lg:col-span-3 min-w-0 ${PUBLIC_CARD} luna-vivid-card-alt-2 p-5 sm:p-8 md:p-10`}>
            <div className="flex items-start sm:items-center justify-between gap-3 sm:gap-4 flex-wrap">
              <p className={PUBLIC_H3}>{pricingUi.memberAccess}</p>
              <span className={`${PUBLIC_CHIP} ${trialState?.status === 'active' ? 'border-emerald-300/50 text-emerald-700 dark:text-emerald-300' : ''}`}>
                {trialState?.status === 'active'
                  ? `${pricingUi.trialBadge} • ${pricingUi.trialDaysLeft.replace('{days}', String(trialDaysLeft))}`
                  : billingPeriod === 'year'
                    ? pricingCopy.saveBadge
                    : pricingUi.flexibleBilling}
              </span>
            </div>
            <div className="mt-5 flex flex-wrap items-end gap-x-3 gap-y-2 min-w-0">
              <span className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-slate-100 leading-none break-words">
                {billingPeriod === 'month' ? pricingCopy.month : pricingCopy.year}
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.16em] sm:tracking-[0.2em] text-slate-600 dark:text-slate-400 pb-1 sm:pb-2 max-w-full">
                {billingPeriod === 'month' ? pricingCopy.monthNote : pricingCopy.yearNote}
              </span>
            </div>
            <div className="mt-5 h-2 rounded-full bg-slate-200/80 dark:bg-slate-700/60 overflow-hidden">
              <div className={`h-full bg-gradient-to-r from-luna-purple via-luna-coral to-luna-teal ${billingPeriod === 'year' ? 'w-full' : 'w-3/4'} transition-all duration-500`} />
            </div>
            <ul className="mt-6 space-y-3">
              <li className={PUBLIC_BODY}>{pricingUi.featurePrivate}</li>
              <li className={PUBLIC_BODY}>{pricingUi.featureBodyMap}</li>
              <li className={PUBLIC_BODY}>{pricingUi.featureBridge}</li>
              <li className={PUBLIC_BODY}>{pricingUi.featureReports}</li>
            </ul>
            <div className="mt-8 flex flex-col gap-3">
              <button type="button" onClick={onStartTrial} className={`${PUBLIC_BTN_PRIMARY} w-full px-8 py-3 text-sm tracking-[0.06em]`}>
                <span className={PUBLIC_BTN_PRIMARY_GLOW} />
                <span className="relative z-10">{trialState?.status === 'active' ? pricingUi.continueTrial : pricingUi.startTrial}</span>
              </button>
              <button type="button" onClick={onSubscribe} className={`${PUBLIC_BTN_SECONDARY_ACCENT} w-full px-8 py-3 text-sm tracking-[0.06em]`}>
                {subscribeLabel}
              </button>
              <button type="button" onClick={onSignUp} className="w-full text-center text-sm font-semibold text-slate-600 dark:text-slate-300 underline underline-offset-4 hover:text-luna-purple transition-colors">
                {pricingUi.freeAccountCta}
              </button>
            </div>
            <p className="mt-3 text-[11px] font-medium text-slate-500 dark:text-slate-400">{pricingCopy.recommended}</p>
            {trialFeedback && <p className="mt-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">{trialFeedback}</p>}
          </article>

          <aside className={`lg:col-span-2 min-w-0 ${PUBLIC_SURFACE} luna-vivid-card-alt-4 space-y-4`}>
            <h3 className={PUBLIC_H3}>{pricingUi.planCompare}</h3>
            <div className={`${PUBLIC_CARD_SOFT} p-4 ${billingPeriod === 'month' ? 'ring-2 ring-luna-purple/30' : ''}`}>
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">{pricingUi.monthly}</p>
              <p className="text-3xl font-black text-slate-900 dark:text-slate-100">$12.99</p>
              <p className="text-xs font-semibold text-slate-500">{pricingUi.cancelAnyTime}</p>
            </div>
            <div className={`${PUBLIC_CARD_SOFT} p-4 ${billingPeriod === 'year' ? 'ring-2 ring-luna-purple/30' : ''}`}>
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">{pricingUi.yearly}</p>
              <p className="text-3xl font-black text-slate-900 dark:text-slate-100">$89</p>
              <p className="text-xs font-semibold text-slate-500">{pricingUi.bestValue}</p>
            </div>
            <div className={`${PUBLIC_CARD_SOFT} p-4 space-y-2`}>
              <p className={PUBLIC_H3}>{pricingUi.includes}</p>
              <p className={PUBLIC_BODY}>{pricingUi.includesText}</p>
            </div>
            <div className={`${PUBLIC_CARD_SOFT} p-4 space-y-3`}>
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">{freeTierLabel}</p>
              <ul className="space-y-2">
                {FREE_FEATURES.map((item) => (
                  <li key={item} className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    • {item}
                  </li>
                ))}
              </ul>
              <p className={`${PUBLIC_H3} pt-2`}>{paidTierLabel}</p>
              <ul className="space-y-2">
                {PAID_FEATURES.map((item) => (
                  <li key={item} className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    • {item}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        <article className={`${PUBLIC_CARD_SOFT} luna-vivid-card-alt-3 p-6 md:p-8 space-y-4`}>
          <div className="space-y-2">
            <p className={PUBLIC_EYEBROW}>{reportsUi.badge}</p>
            <p className={PUBLIC_H3}>{reportUi.sampleTitle}</p>
            <p className={PUBLIC_BODY}>{reportUi.sampleBody}</p>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {reportUi.serviceBullets.map((bullet) => (
              <li key={bullet} className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                • {bullet}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={async () => {
                const ok = await previewPublicSampleReport(lang);
                setSampleFeedback(ok ? reportUi.sampleTitle : reportUi.reportSubtitle);
              }}
              className={`${PUBLIC_BTN_SECONDARY_ACCENT} px-5 py-2.5 text-sm tracking-[0.06em]`}
            >
              {reportUi.sampleTitle}
            </button>
            <button
              type="button"
              onClick={async () => {
                await downloadPublicSampleReport(lang);
                setSampleFeedback(reportUi.sampleDownload);
              }}
              className={`${PUBLIC_BTN_SECONDARY} px-5 py-2.5 text-sm tracking-[0.06em]`}
            >
              {reportUi.sampleDownload}
            </button>
            <button
              type="button"
              onClick={async () => {
                const ok = await printPublicSampleReportPdf(lang);
                setSampleFeedback(ok ? reportUi.pdf : reportUi.reportSubtitle);
              }}
              className={`${PUBLIC_BTN_PRIMARY} px-5 py-2.5 text-sm tracking-[0.06em]`}
            >
              <span className={PUBLIC_BTN_PRIMARY_GLOW} />
              <span className="relative z-10">{reportUi.pdf}</span>
            </button>
          </div>
          {sampleFeedback && <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">{sampleFeedback}</p>}
        </article>
        </div>
      </section>
    </section>
  );
};
