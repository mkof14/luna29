import React from 'react';
import { PUBLIC_BTN_PRIMARY, PUBLIC_BTN_PRIMARY_GLOW, PUBLIC_BTN_SECONDARY } from './publicButtonStyles';
import { Language } from '../../constants';
import { FREE_FEATURES, PAID_FEATURES } from '../../utils/subscriptionAccess';

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
    featureAdmin: string;
    continueTrial: string;
    startTrial: string;
    freeTier?: string;
    paidTier?: string;
  };
  trialState: { status: 'active' | 'expired' } | null;
  trialDaysLeft: number;
  onSignUp: () => void;
  onStartTrial: () => void;
  trialFeedback: string;
}

export const PublicPricingSection: React.FC<PublicPricingSectionProps> = ({
  pricingLabel,
  billingPeriod,
  setBillingPeriod,
  pricingCopy,
  pricingUi,
  trialState,
  trialDaysLeft,
  onSignUp,
  onStartTrial,
  trialFeedback,
}) => {
  const freeTierLabel = pricingUi.freeTier || 'Free';
  const paidTierLabel = pricingUi.paidTier || 'Insights (Paid)';
  return (
    <section className="luna-page-shell luna-page-pricing luna-page-focus luna-focus-pricing animate-in fade-in duration-500 p-6 md:p-8">
      <div className="rounded-[3rem] border border-slate-200/70 dark:border-slate-800 luna-vivid-surface p-8 md:p-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(255,255,255,0.45),transparent_36%),radial-gradient(circle_at_82%_78%,rgba(167,139,250,0.2),transparent_38%),radial-gradient(circle_at_62%_28%,rgba(20,184,166,0.1),transparent_34%)]" />
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-luna-purple/38 blur-[130px]" />
        <div className="absolute -bottom-24 -left-20 w-80 h-80 rounded-full bg-luna-teal/34 blur-[140px]" />
        <div className="absolute top-1/3 -right-28 w-72 h-72 rounded-full bg-luna-coral/28 blur-[125px]" />
        <div className="absolute -top-16 left-1/3 w-72 h-72 rounded-full bg-rose-200/30 blur-[120px]" />

        <header className="relative z-10 space-y-3 text-center max-w-3xl mx-auto">
          <p className="text-sm md:text-base font-black uppercase tracking-[0.24em] text-luna-purple">{pricingLabel}</p>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-slate-100">{pricingCopy.title}</h2>
          <p className="text-base md:text-lg font-semibold text-slate-600 dark:text-slate-300">{pricingCopy.subtitle}</p>
        </header>

        <div className="relative z-10 mt-8 flex justify-center">
          <div className="inline-flex rounded-full border border-slate-300 dark:border-slate-700 luna-vivid-chip p-1 shadow-lg">
            <button
              onClick={() => setBillingPeriod('month')}
              className={`min-w-[110px] px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${billingPeriod === 'month' ? 'bg-luna-purple text-white shadow-luna-rich' : 'text-slate-500 hover:text-luna-purple'}`}
            >
              {pricingUi.monthToggle}
            </button>
            <button
              onClick={() => setBillingPeriod('year')}
              className={`min-w-[110px] px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${billingPeriod === 'year' ? 'bg-luna-purple text-white shadow-luna-rich' : 'text-slate-500 hover:text-luna-purple'}`}
            >
              {pricingUi.yearToggle}
            </button>
          </div>
        </div>

        <div className="relative z-10 mt-8 grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
          <article className="lg:col-span-3 rounded-[2.5rem] border border-slate-200/80 dark:border-slate-700/80 luna-vivid-card-alt-2 p-8 md:p-10 shadow-[0_18px_56px_rgba(71,48,104,0.18),0_6px_20px_rgba(86,140,155,0.14),inset_0_1px_0_rgba(255,255,255,0.5)]">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <p className="text-base md:text-lg font-black uppercase tracking-[0.16em] text-luna-purple">{pricingUi.memberAccess}</p>
              <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${trialState?.status === 'active' ? 'bg-emerald-100 border-emerald-300 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-600/40 dark:text-emerald-300' : billingPeriod === 'year' ? 'bg-luna-purple/10 border-luna-purple/30 text-luna-purple' : 'bg-slate-100 border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'}`}>
                {trialState?.status === 'active'
                  ? `${pricingUi.trialBadge} • ${pricingUi.trialDaysLeft.replace('{days}', String(trialDaysLeft))}`
                  : billingPeriod === 'year'
                  ? pricingCopy.saveBadge
                  : pricingUi.flexibleBilling}
              </span>
            </div>
            <div className="mt-5 flex items-end gap-3">
              <span className="text-7xl md:text-8xl font-black text-slate-900 dark:text-slate-100 leading-none">
                {billingPeriod === 'month' ? pricingCopy.month : pricingCopy.year}
              </span>
              <span className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 pb-2">
                {billingPeriod === 'month' ? pricingCopy.monthNote : pricingCopy.yearNote}
              </span>
            </div>
            <div className="mt-5 h-2 rounded-full bg-slate-200/80 dark:bg-slate-700/60 overflow-hidden">
              <div className={`h-full bg-gradient-to-r from-luna-purple via-luna-coral to-luna-teal ${billingPeriod === 'year' ? 'w-full' : 'w-3/4'} transition-all duration-500`} />
            </div>
            <ul className="mt-6 space-y-3">
              <li className="text-sm font-semibold text-slate-600 dark:text-slate-300">{pricingUi.featurePrivate}</li>
              <li className="text-sm font-semibold text-slate-600 dark:text-slate-300">{pricingUi.featureBodyMap}</li>
              <li className="text-sm font-semibold text-slate-600 dark:text-slate-300">{pricingUi.featureBridge}</li>
              <li className="text-sm font-semibold text-slate-600 dark:text-slate-300">{pricingUi.featureAdmin}</li>
            </ul>
            <div className="mt-8 flex flex-col md:flex-row gap-3 items-center">
              <button
                onClick={onSignUp}
                className={`${PUBLIC_BTN_PRIMARY} w-full md:w-auto px-8 py-4 text-[11px] tracking-[0.2em]`}
              >
                <span className={PUBLIC_BTN_PRIMARY_GLOW} />
                <span className="relative z-10">{pricingCopy.cta}</span>
              </button>
              <button
                onClick={onStartTrial}
                className={`${PUBLIC_BTN_SECONDARY} w-full md:w-auto px-8 py-4 text-[11px] tracking-[0.2em] text-luna-purple`}
              >
                {trialState?.status === 'active' ? pricingUi.continueTrial : pricingUi.startTrial}
              </button>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">{pricingCopy.recommended}</p>
            </div>
            {trialFeedback && (
              <p className="mt-3 text-xs font-black uppercase tracking-[0.15em] text-emerald-700 dark:text-emerald-300">{trialFeedback}</p>
            )}
          </article>

          <aside className="lg:col-span-2 rounded-[2.5rem] border border-slate-200/80 dark:border-slate-700/80 luna-vivid-card-alt-4 p-6 md:p-7 shadow-[0_14px_42px_rgba(74,58,116,0.16),0_5px_16px_rgba(71,126,143,0.14),inset_0_1px_0_rgba(255,255,255,0.45)] space-y-4">
            <h3 className="text-lg font-black uppercase tracking-[0.16em] text-slate-900 dark:text-slate-100">{pricingUi.planCompare}</h3>
            <div className={`rounded-2xl border p-4 transition-all shadow-sm ${billingPeriod === 'month' ? 'border-luna-purple/40 bg-luna-purple/10 shadow-[0_8px_20px_rgba(124,58,237,0.16)]' : 'border-slate-200 dark:border-slate-700 bg-gradient-to-br from-[#f8edf6]/85 via-[#f2effa]/82 to-[#eef1fb]/82 dark:bg-slate-800/50'}`}>
              <p className="text-sm md:text-base font-black uppercase tracking-[0.14em] text-slate-500">{pricingUi.monthly}</p>
              <p className="text-3xl font-black text-slate-900 dark:text-slate-100">$12.99</p>
              <p className="text-xs font-semibold text-slate-500">{pricingUi.cancelAnyTime}</p>
            </div>
            <div className={`rounded-2xl border p-4 transition-all shadow-sm ${billingPeriod === 'year' ? 'border-luna-purple/40 bg-luna-purple/10 shadow-[0_8px_20px_rgba(124,58,237,0.16)]' : 'border-slate-200 dark:border-slate-700 bg-gradient-to-br from-[#f4ebe1]/84 via-[#f1e8ee]/82 to-[#efe9f6]/82 dark:bg-slate-800/50'}`}>
              <p className="text-sm md:text-base font-black uppercase tracking-[0.14em] text-slate-500">{pricingUi.yearly}</p>
              <p className="text-3xl font-black text-slate-900 dark:text-slate-100">$89</p>
              <p className="text-xs font-semibold text-slate-500">{pricingUi.bestValue}</p>
            </div>
            <div className="rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 p-4">
              <p className="text-sm md:text-base font-black uppercase tracking-[0.14em] text-luna-purple mb-1">{pricingUi.includes}</p>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{pricingUi.includesText}</p>
            </div>
            <div className="rounded-2xl border border-slate-200/70 dark:border-slate-700/70 p-4 space-y-3">
              <p className="text-sm font-black uppercase tracking-[0.14em] text-slate-500">{freeTierLabel}</p>
              <ul className="space-y-2">
                {FREE_FEATURES.map((item) => (
                  <li key={item} className="text-xs font-semibold text-slate-600 dark:text-slate-300">• {item}</li>
                ))}
              </ul>
              <p className="text-sm font-black uppercase tracking-[0.14em] text-luna-purple pt-2">{paidTierLabel}</p>
              <ul className="space-y-2">
                {PAID_FEATURES.map((item) => (
                  <li key={item} className="text-xs font-semibold text-slate-600 dark:text-slate-300">• {item}</li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};
