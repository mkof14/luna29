import React, { useEffect, useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Language, getLang } from '../constants';
import { MemberIconBackButton } from './member/MemberIconBackButton';
import { MemberPageIntro } from './member/MemberPageIntro';
import { LunaPageContentSection } from './shared/LunaPageContentSection';
import { getLunaPageTheme } from '../utils/lunaPageThemes';
import { billingService } from '../services/billingService';

interface InsightsPaywallViewProps {
  lang: Language;
  onBack: () => void;
}

export const InsightsPaywallView: React.FC<InsightsPaywallViewProps> = ({ lang, onBack }) => {
  const copyByLang: Partial<Record<
    Language,
    {
      top: string;
      lineA: string;
      lineB: string;
      exampleA: string;
      exampleB: string;
      sectionA: string;
      sectionB: string;
      sectionC: string;
      annual: string;
      monthly: string;
      cta: string;
      trial: string;
      cancel: string;
      back: string;
      unavailable: string;
      loading: string;
    }
  >> = {
    en: {
      top: 'Luna29 is beginning to understand your rhythm.',
      lineA: 'Unlock deeper insights about your body,',
      lineB: 'energy, and emotional patterns.',
      exampleA: 'Your energy often drops two days before your cycle begins.',
      exampleB: 'Short sleep also makes the next day heavier.',
      sectionA: 'Personal patterns',
      sectionB: 'Monthly notes',
      sectionC: 'Deeper voice insights',
      annual: '$89 per year',
      monthly: 'or $12.99 monthly',
      cta: 'Unlock deeper insights',
      trial: '7-day free trial',
      cancel: 'Cancel anytime',
      back: 'Back',
      unavailable: 'Billing is temporarily unavailable. Try again shortly.',
      loading: 'Checking billing...',
    },
    ru: {
      top: 'Luna29 начинает понимать ваш ритм.',
      lineA: 'Откройте глубокие инсайты о теле,',
      lineB: 'энергии и эмоциональных паттернах.',
      exampleA: 'Энергия часто снижается за два дня до начала цикла.',
      exampleB: 'Короткий сон также делает следующий день тяжелее.',
      sectionA: 'Личные паттерны',
      sectionB: 'Месячные заметки',
      sectionC: 'Глубокие voice-инсайты',
      annual: '$89 в год',
      monthly: 'или $12.99 в месяц',
      cta: 'Unlock deeper insights',
      trial: '7 дней бесплатного trial',
      cancel: 'Можно отменить в любое время',
      back: 'Назад',
      unavailable: 'Billing пока недоступен.',
      loading: 'Проверка billing...',
    },
    uk: {
      top: 'Luna29 починає розуміти ваш ритм.',
      lineA: 'Відкрийте глибші інсайти про тіло,',
      lineB: 'енергію та емоційні патерни.',
      exampleA: 'Енергія часто знижується за два дні до початку циклу.',
      exampleB: 'Короткий сон також робить наступний день важчим.',
      sectionA: 'Персональні патерни',
      sectionB: 'Місячні нотатки',
      sectionC: 'Глибші voice-інсайти',
      annual: '$89 на рік',
      monthly: 'або $12.99 щомісяця',
      cta: 'Unlock deeper insights',
      trial: '7-денний безкоштовний trial',
      cancel: 'Можна скасувати будь-коли',
      back: 'Назад',
      unavailable: 'Billing поки недоступний.',
      loading: 'Перевірка billing...',
    },
    ar: {
      top: 'Luna29 بدأت تفهم إيقاعكِ.',
      lineA: 'افتحي رؤى أعمق عن جسمكِ،',
      lineB: 'طاقتكِ وأنماطكِ العاطفية.',
      exampleA: 'طاقتكِ غالباً تنخفض قبل يومين من بدء دورتكِ.',
      exampleB: 'النوم القصير يجعل اليوم التالي أثقل أيضاً.',
      sectionA: 'أنماط شخصية',
      sectionB: 'ملاحظات شهرية',
      sectionC: 'رؤى صوتية أعمق',
      annual: '$89 سنوياً',
      monthly: 'أو $12.99 شهرياً',
      cta: 'افتحي رؤى أعمق',
      trial: 'تجربة مجانية 7 أيام',
      cancel: 'إلغاء في أي وقت',
      back: 'رجوع',
      unavailable: 'الفوترة غير متاحة بعد.',
      loading: 'جارٍ التحقق من الفوترة...',
    },
    he: {
      top: 'Luna29 מתחילה להבין את הקצב שלך.',
      lineA: 'פתחי תובנות עמוקות יותר על הגוף שלך,',
      lineB: 'האנרגיה והדפוסים הרגשיים.',
      exampleA: 'האנרגיה שלך לעיתים יורדת יומיים לפני תחילת המחזור.',
      exampleB: 'שינה קצרה גם הופכת את היום הבא לכבד יותר.',
      sectionA: 'דפוסים אישיים',
      sectionB: 'הערות חודשיות',
      sectionC: 'תובנות קול עמוקות יותר',
      annual: '$89 לשנה',
      monthly: 'או $12.99 לחודש',
      cta: 'פתחי תובנות עמוקות יותר',
      trial: 'ניסיון חינם ל-7 ימים',
      cancel: 'ביטול בכל עת',
      back: 'חזרה',
      unavailable: 'חיוב עדיין לא זמין.',
      loading: 'בודקת חיוב...',
    },
  };
  const defaultCopy = copyByLang.en!;
  const copy = getLang(copyByLang, lang) || defaultCopy;

  const [billingEnabled, setBillingEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<string>('');
  const [billingPeriod, setBillingPeriod] = useState<'month' | 'year'>('year');

  useEffect(() => {
    let mounted = true;
    billingService
      .getStatus()
      .then((payload) => {
        if (!mounted) return;
        setBillingEnabled(Boolean(payload.enabled));
      })
      .catch(() => {
        if (!mounted) return;
        setBillingEnabled(false);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const sections = useMemo(() => [copy.sectionA, copy.sectionB, copy.sectionC], [copy.sectionA, copy.sectionB, copy.sectionC]);

  const handleUnlock = async () => {
    if (!billingEnabled) {
      setFeedback(copy.unavailable);
      return;
    }
    try {
      const payload = await billingService.createCheckoutSession(billingPeriod);
      if (payload.url) window.location.href = payload.url;
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : copy.unavailable);
    }
  };

  return (
    <>
      <MemberIconBackButton lang={lang} onClick={onBack} className="mb-0" />
      <MemberPageIntro lang={lang} page="insights_paywall" tab="insights_paywall" />

      <LunaPageContentSection themeClass={getLunaPageTheme('insights_paywall').shellClass}>
        <div className="space-y-2">
          <p className="text-base font-medium text-slate-700 dark:text-slate-200">{copy.lineA} {copy.lineB}</p>
        </div>

        <article className="rounded-2xl bg-slate-100/75 dark:bg-slate-800/60 p-5 space-y-2">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Insights are built from your check-ins and reflections — never sample health information.
          </p>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Unlock deeper pattern discovery after you subscribe.
          </p>
        </article>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {sections.map((section) => (
            <article key={section} className="rounded-2xl border border-slate-200/80 dark:border-slate-700/70 bg-white/80 dark:bg-slate-900/55 p-4">
              <div className="inline-flex items-center gap-2 text-luna-purple">
                <Sparkles size={13} />
                <p className="text-sm font-black">{section}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            data-testid="insights-period-year"
            onClick={() => setBillingPeriod('year')}
            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
              billingPeriod === 'year'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'bg-slate-200/80 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
            }`}
          >
            {copy.annual}
          </button>
          <button
            type="button"
            data-testid="insights-period-month"
            onClick={() => setBillingPeriod('month')}
            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
              billingPeriod === 'month'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'bg-slate-200/80 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
            }`}
          >
            {copy.monthly}
          </button>
        </div>

        <div className="space-y-3">
          <button
            data-testid="insights-unlock"
            onClick={handleUnlock}
            disabled={loading}
            className="w-full md:w-auto px-8 py-3 rounded-full bg-luna-purple text-white text-[11px] font-black uppercase tracking-[0.16em] hover:brightness-105 transition-all disabled:opacity-45"
          >
            {copy.cta}
          </button>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{copy.trial}</p>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{copy.cancel}</p>
          {loading && <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{copy.loading}</p>}
          {feedback && <p className="text-xs font-semibold text-rose-500 dark:text-rose-300">{feedback}</p>}
        </div>
      </LunaPageContentSection>
    </>
  );
};
