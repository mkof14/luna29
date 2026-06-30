import React from 'react';
import { Calendar, Heart, MapPin, Mic, Sparkles, Users } from 'lucide-react';
import { Logo } from '../Logo';
import { PUBLIC_BTN_PRIMARY, PUBLIC_BTN_PRIMARY_GLOW, PUBLIC_BTN_SECONDARY } from './publicButtonStyles';
import { LUNA_BRAND_PATHS } from '../../utils/lunaBrandAssets';
import type { HomeStory } from '../../utils/publicLandingNarratives';
import type { PublicHomeContent } from '../../utils/publicHomeContent';

type HormoneFocus = {
  title: string;
  subtitle: string;
  cards: Array<{ hormone: string; why: string }>;
};

type PublicHomeSectionProps = {
  homeEyebrow: string;
  homePatternNote: string;
  homeStory: HomeStory;
  homeContent: PublicHomeContent;
  hormoneFocus: HormoneFocus;
  calendarService: { title: string; body: string };
  onSignIn: () => void;
  onStartTrial: () => void;
  onNavigate: (page: 'map' | 'bridge' | 'calendar' | 'how_it_works' | 'ritual' | 'pricing' | 'about') => void;
};

const flowIcons = [Heart, Mic, Sparkles] as const;
const productIcons = [MapPin, Mic, Heart, Sparkles, Calendar] as const;

export const PublicHomeSection: React.FC<PublicHomeSectionProps> = ({
  homeEyebrow,
  homePatternNote,
  homeStory,
  homeContent,
  hormoneFocus,
  calendarService,
  onSignIn,
  onStartTrial,
  onNavigate,
}) => {
  const products = [...homeStory.sections.slice(0, 4), calendarService];
  const productHandlers: Array<() => void> = [
    () => onNavigate('map'),
    () => onNavigate('ritual'),
    () => onNavigate('bridge'),
    onSignIn,
    () => onNavigate('calendar'),
  ];

  return (
    <section className="space-y-10 md:space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-500">
      <section className="luna-page-shell luna-page-focus luna-focus-home overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] gap-6 md:gap-10 items-center p-5 sm:p-7 md:p-10 lg:p-12 min-w-0 w-full">
          <div className="space-y-5 md:space-y-6 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-luna-purple">{homeEyebrow}</p>
            <div className="space-y-2">
              <Logo size="sm" className="text-5xl md:text-6xl leading-none" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{homeContent.heroTagline}</p>
              <span className="inline-flex text-[10px] font-semibold uppercase tracking-[0.16em] text-luna-purple/90 bg-luna-purple/10 px-3 py-1 rounded-full">
                {homeContent.diffBadge}
              </span>
              <h1 className="text-2xl md:text-[2rem] font-black tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
                {homeContent.heroTitle}
              </h1>
            </div>
            <p className="max-w-xl text-base md:text-lg font-medium text-slate-700 dark:text-slate-200/90 leading-relaxed">
              {homeContent.heroSubtitle}
            </p>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-300">{homeStory.heroSub}</p>
            <p className="text-[12px] font-normal leading-relaxed text-slate-600 dark:text-slate-400">{homeContent.trustLine}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => onNavigate('ritual')}
                className="luna-vivid-card-soft luna-vivid-hover rounded-[1.3rem] p-4 text-left"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-luna-purple">{homeContent.doorCalmTitle}</p>
                <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-200">{homeContent.doorCalmBody}</p>
                <p className="mt-3 text-xs font-semibold text-luna-purple underline underline-offset-4">{homeContent.doorCalmCta}</p>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('calendar')}
                className="luna-vivid-card-soft luna-vivid-hover rounded-[1.3rem] p-4 text-left"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-luna-purple">{homeContent.doorDemoTitle}</p>
                <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-200">{homeContent.doorDemoBody}</p>
                <p className="mt-3 text-xs font-semibold text-luna-purple underline underline-offset-4">{homeContent.doorDemoCta}</p>
              </button>
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              <button
                type="button"
                onClick={onStartTrial}
                className={`${PUBLIC_BTN_PRIMARY} px-7 py-3 text-sm tracking-[0.06em]`}
              >
                <span className={PUBLIC_BTN_PRIMARY_GLOW} />
                <span className="relative z-10">{homeContent.trialCta}</span>
              </button>
              <button
                type="button"
                onClick={onSignIn}
                className={`${PUBLIC_BTN_SECONDARY} px-7 py-3 text-sm tracking-[0.06em]`}
              >
                {homeContent.freeCta}
              </button>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2.2rem] border border-slate-200/70 dark:border-slate-700/70 shadow-luna-deep">
            <img
              src={LUNA_BRAND_PATHS.hero}
              alt="Luna29"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="h-[280px] md:h-[340px] w-full object-cover object-[center_38%] [mask-image:linear-gradient(to_bottom,black_0%,black_78%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_0%,black_78%,transparent_100%)]"
            />
            <div className="absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-t from-slate-100/95 via-slate-100/40 to-transparent dark:from-slate-950/95 dark:via-slate-950/40" />
          </div>
        </div>
      </section>

      <section className="luna-page-shell luna-page-reports p-7 md:p-9">
        <div className="relative z-10 space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">{homeContent.patternTitle}</h2>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{homePatternNote}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[homeContent.patternOne, homeContent.patternTwo].map((pattern) => (
              <article key={pattern} className="luna-vivid-card-soft rounded-[1.3rem] p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-luna-purple">{homeContent.patternCardLabel}</p>
                <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">{pattern}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="luna-page-shell luna-page-voice p-7 md:p-9 space-y-5">
        <div className="relative z-10 space-y-2">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">{hormoneFocus.title}</h2>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300 max-w-2xl">{hormoneFocus.subtitle}</p>
        </div>
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {hormoneFocus.cards.map((card, index) => (
            <article
              key={card.hormone}
              className={`luna-vivid-card-soft rounded-[1.3rem] p-4 ${index % 2 === 1 ? 'luna-vivid-card-alt-3' : 'luna-vivid-card-alt-4'}`}
            >
              <p className="text-sm font-black text-slate-900 dark:text-slate-100">{card.hormone}</p>
              <p className="mt-2 text-sm font-medium leading-relaxed text-slate-700 dark:text-slate-200">{card.why}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="luna-page-shell luna-page-bridge p-7 md:p-9">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-6 items-start md:items-center min-w-0">
          <div className="space-y-3">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-luna-purple/14 text-luna-purple">
              <Users size={18} />
            </span>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">{homeContent.bridgeTeaserTitle}</h2>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300 max-w-xl">{homeContent.bridgeTeaserBody}</p>
            <p className="text-xs font-light text-slate-500 dark:text-slate-400">{homeContent.bridgePartnerNote}</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('bridge')}
            className={`${PUBLIC_BTN_SECONDARY} px-6 py-3 text-sm tracking-[0.06em] text-luna-purple shrink-0`}
          >
            {homeContent.bridgeTeaserCta}
          </button>
        </div>
      </section>

      <section className="luna-page-shell luna-page-journey p-7 md:p-9 space-y-5">
        <div className="relative z-10 space-y-2">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">{homeStory.flowTitle}</h2>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300 max-w-2xl">{homeStory.explainParagraphs[0]}</p>
        </div>
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-3">
          {homeStory.flowItems.map((item, index) => {
            const Icon = flowIcons[index] ?? Sparkles;
            return (
              <article
                key={item.title}
                className={`luna-vivid-card luna-vivid-hover rounded-[1.4rem] p-5 ${
                  index === 1 ? 'luna-vivid-card-alt-1' : index === 2 ? 'luna-vivid-card-alt-2' : ''
                }`}
              >
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-luna-purple/14 text-luna-purple">
                  <Icon size={16} />
                </span>
                <p className="mt-3 text-sm font-black uppercase tracking-[0.12em] text-luna-purple">{item.title}</p>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-700 dark:text-slate-200">{item.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="luna-page-shell luna-page-voice p-7 md:p-9 space-y-5">
        <div className="relative z-10 space-y-2">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">{homeStory.differenceTitle}</h2>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{homeStory.differenceBody}</p>
        </div>
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-3">
          {products.map((service, index) => {
            const Icon = productIcons[index] ?? Sparkles;
            return (
              <button
                key={service.title}
                type="button"
                onClick={productHandlers[index]}
                className={`luna-vivid-card-soft luna-vivid-hover rounded-[1.4rem] p-5 text-left w-full cursor-pointer ${
                  index % 2 === 1 ? 'luna-vivid-card-alt-3' : 'luna-vivid-card-alt-4'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-luna-purple/14 text-luna-purple">
                    <Icon size={16} />
                  </span>
                  <p className="text-sm font-black uppercase tracking-[0.12em] text-luna-purple">{service.title}</p>
                </div>
                <p className="mt-2 text-sm font-medium leading-relaxed text-slate-700 dark:text-slate-200">{service.body}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="luna-page-shell luna-page-pricing luna-page-focus luna-focus-pricing p-9 md:p-12 text-center">
        <div className="relative z-10 space-y-4">
          <h2 className="text-2xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100">{homeContent.finalTitle}</h2>
          <p className="text-base font-medium text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">{homeContent.finalBody}</p>
          <div className="flex flex-wrap justify-center gap-3 pt-3">
            <button
              type="button"
              onClick={onStartTrial}
              className={`${PUBLIC_BTN_PRIMARY} px-8 py-3 text-sm tracking-[0.06em]`}
            >
              <span className={PUBLIC_BTN_PRIMARY_GLOW} />
              <span className="relative z-10">{homeContent.finalTrialCta}</span>
            </button>
            <button
              type="button"
              onClick={onSignIn}
              className={`${PUBLIC_BTN_SECONDARY} px-8 py-3 text-sm tracking-[0.06em]`}
            >
              {homeContent.finalFreeCta}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('pricing')}
              className="px-4 py-3 text-sm font-semibold text-luna-purple underline underline-offset-4 hover:opacity-80"
            >
              {homeContent.pricingLink}
            </button>
          </div>
        </div>
      </section>
    </section>
  );
};
