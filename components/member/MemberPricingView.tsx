import React, { useState } from 'react';
import { Language, LangCopy, getLang } from '../../constants';
import { getLandingNarratives } from '../../utils/publicLandingNarratives';
import { billingService } from '../../services/billingService';
import { conversionEvents } from '../../utils/conversionEvents';
import { MEMBER_BODY_TEXT, MEMBER_INNER_CARD, MEMBER_MUTED_TEXT, MEMBER_PAGE_PRICING, MEMBER_PAGE_TITLE, MEMBER_PRICE_LABEL, MEMBER_CHIP_ACTIVE, MEMBER_CHIP_INACTIVE } from '../../utils/memberPageStyles';
import { MemberBackButton } from './MemberBackButton';
import { PUBLIC_BTN_PRIMARY, PUBLIC_BTN_PRIMARY_GLOW } from '../public/publicButtonStyles';

type MemberPricingViewProps = {
  lang: Language;
  onBack: () => void;
};

const ctaByLang: LangCopy<{ trial: string; subscribe: string; note: string }> = {
  en: { trial: 'Start free trial', subscribe: 'Subscribe now', note: 'Cancel anytime · 7-day free trial included.' },
  ru: { trial: 'Начать пробный период', subscribe: 'Оформить подписку', note: 'Отмена в любой момент · 7 дней trial включены.' },
  uk: { trial: 'Почати пробний період', subscribe: 'Оформити підписку', note: 'Скасування будь-коли · 7 днів trial включено.' },
  es: { trial: 'Iniciar prueba gratis', subscribe: 'Suscribirse ahora', note: 'Cancela cuando quieras · 7 días de prueba incluidos.' },
  fr: { trial: 'Commencer l essai gratuit', subscribe: "S'abonner", note: 'Annulation à tout moment · essai 7 jours inclus.' },
  de: { trial: 'Kostenlose Testphase starten', subscribe: 'Jetzt abonnieren', note: 'Jederzeit kündbar · 7 Tage Test inklusive.' },
  zh: { trial: '开始免费试用', subscribe: '立即订阅', note: '随时取消 · 含 7 天试用。' },
  ja: { trial: '無料トライアルを開始', subscribe: '今すぐ登録', note: 'いつでも解約 · 7日間トライアル付き。' },
  pt: { trial: 'Iniciar teste gratuito', subscribe: 'Assinar agora', note: 'Cancele quando quiser · teste de 7 dias incluído.' },
  ar: { trial: 'ابدئي التجربة المجانية', subscribe: 'اشتركي الآن', note: 'إلغاء في أي وقت · تجربة 7 أيام مشمولة.' },
  he: { trial: 'התחילי ניסיון חינם', subscribe: 'הירשמי עכשיו', note: 'ביטול בכל עת · כולל 7 ימי ניסיון.' },
};

export const MemberPricingView: React.FC<MemberPricingViewProps> = ({ lang, onBack }) => {
  const [billingPeriod, setBillingPeriod] = useState<'month' | 'year'>('year');
  const pricing = getLandingNarratives(lang).pricingCopy;
  const cta = getLang(ctaByLang, lang) || ctaByLang.en;

  const startStripeCheckout = async () => {
    try {
      conversionEvents.checkoutStarted(billingPeriod);
      const session = await billingService.createCheckoutSession(billingPeriod);
      conversionEvents.trialStarted();
      window.location.href = session.url;
    } catch {
      // billing may be disabled locally
    }
  };

  const startTrial = () => {
    void startStripeCheckout();
  };

  const subscribe = () => {
    void startStripeCheckout();
  };

  const toggleByLang: LangCopy<{ month: string; year: string }> = {
    en: { month: 'Month', year: 'Year' },
    ru: { month: 'Месяц', year: 'Год' },
    uk: { month: 'Місяць', year: 'Рік' },
    es: { month: 'Mes', year: 'Año' },
    fr: { month: 'Mois', year: 'An' },
    de: { month: 'Monat', year: 'Jahr' },
    zh: { month: '月付', year: '年付' },
    ja: { month: '月額', year: '年額' },
    pt: { month: 'Mês', year: 'Ano' },
    ar: { month: 'شهري', year: 'سنوي' },
    he: { month: 'חודשי', year: 'שנתי' },
  };
  const toggle = getLang(toggleByLang, lang) || toggleByLang.en;

  return (
    <section className={MEMBER_PAGE_PRICING} data-testid="member-tab-pricing">
      <MemberBackButton lang={lang} onClick={onBack} />
      <div className="space-y-8">
        <header className="text-center space-y-3 max-w-3xl mx-auto">
          <h1 className={MEMBER_PAGE_TITLE}>{pricing.title}</h1>
          <p className={MEMBER_MUTED_TEXT}>{pricing.subtitle}</p>
          <p className={MEMBER_MUTED_TEXT}>{cta.note}</p>
          <div className="flex justify-center pt-2">
            <div className="inline-flex gap-1 rounded-full border border-slate-300/80 dark:border-slate-500/50 bg-white/80 dark:bg-slate-900/80 p-1">
              <button type="button" onClick={() => setBillingPeriod('month')} className={billingPeriod === 'month' ? MEMBER_CHIP_ACTIVE : MEMBER_CHIP_INACTIVE}>
                {toggle.month}
              </button>
              <button type="button" onClick={() => setBillingPeriod('year')} className={billingPeriod === 'year' ? MEMBER_CHIP_ACTIVE : MEMBER_CHIP_INACTIVE}>
                {toggle.year}
              </button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <article className={`${MEMBER_INNER_CARD} p-6 md:p-8 space-y-4 ${billingPeriod === 'month' ? 'ring-2 ring-luna-purple/35' : ''}`}>
            <p className={MEMBER_PRICE_LABEL}>{pricing.monthNote}</p>
            <p className="text-4xl font-black text-slate-900 dark:text-white">{pricing.month}</p>
            <p className={MEMBER_BODY_TEXT}>{pricing.recommended}</p>
            <button type="button" onClick={subscribe} className={`${PUBLIC_BTN_PRIMARY} ${PUBLIC_BTN_PRIMARY_GLOW} w-full justify-center`}>
              {cta.subscribe}
            </button>
          </article>
          <article className={`${MEMBER_INNER_CARD} p-6 md:p-8 space-y-4 ${billingPeriod === 'year' ? 'ring-2 ring-luna-purple/35' : ''}`}>
            <p className={MEMBER_PRICE_LABEL}>{pricing.saveBadge}</p>
            <p className="text-4xl font-black text-slate-900 dark:text-white">{pricing.year}</p>
            <p className={MEMBER_BODY_TEXT}>{pricing.yearNote}</p>
            <button type="button" onClick={subscribe} className={`${PUBLIC_BTN_PRIMARY} ${PUBLIC_BTN_PRIMARY_GLOW} w-full justify-center`}>
              {cta.subscribe}
            </button>
          </article>
        </div>
        <p className={`${MEMBER_MUTED_TEXT} text-center max-w-xl mx-auto`}>{cta.note}</p>
        <div className="flex justify-center">
          <button type="button" onClick={startTrial} className={MEMBER_CHIP_INACTIVE}>
            {cta.trial}
          </button>
        </div>
      </div>
    </section>
  );
};
