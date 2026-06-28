import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Language, getLang } from '../constants';
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
      unavailable: 'Billing is not available yet.',
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
  };
  const defaultCopy = copyByLang.en!;
  const copy = getLang(copyByLang, lang) || defaultCopy;

  const [billingEnabled, setBillingEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<string>('');

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
      const payload = await billingService.createCheckoutSession('year');
      if (payload.url) window.location.href = payload.url;
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : copy.unavailable);
    }
  };

  return (
    <section className="max-w-4xl mx-auto p-6 md:p-8 space-y-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-luna-purple transition-colors"
      >
        <ArrowLeft size={14} /> {copy.back}
      </button>

      <article className="rounded-[2.4rem] border border-slate-200/80 dark:border-[#2a4670] bg-white/88 dark:bg-[#081a3d]/94 p-7 md:p-9 shadow-luna-rich space-y-6">
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-luna-purple">Luna29 Insights</p>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100">{copy.top}</h1>
          <p className="text-base font-medium text-slate-700 dark:text-slate-200">{copy.lineA}</p>
          <p className="text-base font-medium text-slate-700 dark:text-slate-200">{copy.lineB}</p>
        </div>

        <article className="rounded-2xl bg-slate-100/75 dark:bg-slate-800/60 p-5 space-y-2">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{copy.exampleA}</p>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{copy.exampleB}</p>
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

        <div className="rounded-2xl bg-slate-100/75 dark:bg-slate-800/60 p-5 space-y-1">
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{copy.annual}</p>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{copy.monthly}</p>
        </div>

        <div className="space-y-3">
          <button
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
      </article>
    </section>
  );
};
