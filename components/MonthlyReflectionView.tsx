import React, { useMemo, useState } from 'react';
import { ArrowLeft, Share2 } from 'lucide-react';
import { Language, getLang } from '../constants';
import { CyclePhase, HealthEvent, SystemState } from '../types';
import { shareTextSafely } from '../utils/share';

interface MonthlyReflectionViewProps {
  lang: Language;
  currentPhase: CyclePhase;
  systemState: SystemState;
  events: HealthEvent[];
  onBack: () => void;
}

export const MonthlyReflectionView: React.FC<MonthlyReflectionViewProps> = ({
  lang,
  currentPhase,
  systemState,
  events,
  onBack,
}) => {
  const [feedback, setFeedback] = useState('');

  const copyByLang: Partial<Record<
    Language,
    {
      back: string;
      title: string;
      subtitle: string;
      share: string;
      shared: string;
      copied: string;
      failed: string;
      monthLabel: string;
      insightTitle: string;
      hintA: string;
      hintB: string;
      hintC: string;
    }
  >> = {
    en: {
      back: 'Back',
      title: 'Your month with Luna29',
      subtitle: 'A gentle look at what Luna29 is starting to notice.',
      share: 'Share this note',
      shared: 'Shared.',
      copied: 'Copied.',
      failed: 'Could not share right now.',
      monthLabel: 'Monthly note',
      insightTitle: 'Insights from your month',
      hintA: 'Your energy often softens before your cycle.',
      hintB: 'Short sleep can make the next day feel heavier.',
      hintC: 'Work days can feel more demanding in your notes.',
    },
    ru: {
      back: 'Назад',
      title: 'Ваш месяц с Luna29',
      subtitle: 'Бережный взгляд на то, что Luna29 начинает замечать.',
      share: 'Поделиться этой заметкой',
      shared: 'Отправлено.',
      copied: 'Скопировано.',
      failed: 'Сейчас не удалось поделиться.',
      monthLabel: 'Месячная заметка',
      insightTitle: 'Инсайты за месяц',
      hintA: 'Энергия часто смягчается перед циклом.',
      hintB: 'Короткий сон может делать следующий день тяжелее.',
      hintC: 'В рабочих днях в заметках чаще появляется напряжение.',
    },
    uk: {
      back: 'Назад',
      title: 'Ваш місяць з Luna29',
      subtitle: 'Бережний погляд на те, що Luna29 починає помічати.',
      share: 'Поділитися цією нотаткою',
      shared: 'Надіслано.',
      copied: 'Скопійовано.',
      failed: 'Зараз не вдалося поділитися.',
      monthLabel: 'Місячна нотатка',
      insightTitle: 'Інсайти за місяць',
      hintA: 'Енергія часто стає м’якшою перед циклом.',
      hintB: 'Короткий сон може робити наступний день важчим.',
      hintC: 'У робочі дні у нотатках частіше з’являється напруга.',
    },
    ar: {
      back: 'رجوع',
      title: 'شهركِ مع Luna29',
      subtitle: 'نظرة لطيفة على ما بدأت Luna29 تلاحظه.',
      share: 'مشاركة هذه الملاحظة',
      shared: 'تمت المشاركة.',
      copied: 'تم النسخ.',
      failed: 'تعذّرت المشاركة الآن.',
      monthLabel: 'ملاحظة شهرية',
      insightTitle: 'رؤى من شهركِ',
      hintA: 'طاقتكِ غالباً تلين قبل دورتكِ.',
      hintB: 'النوم القصير قد يجعل اليوم التالي أثقل.',
      hintC: 'أيام العمل قد تبدو أكثر طلباً في ملاحظاتكِ.',
    },
    he: {
      back: 'חזרה',
      title: 'החודש שלך עם Luna29',
      subtitle: 'מבט עדין על מה ש-Luna29 מתחילה לשים לב אליו.',
      share: 'שתפי את ההערה הזו',
      shared: 'שותף.',
      copied: 'הועתק.',
      failed: 'לא ניתן לשתף כרגע.',
      monthLabel: 'הערה חודשית',
      insightTitle: 'תובנות מהחודש שלך',
      hintA: 'האנרגיה שלך לעיתים רכה יותר לפני המחזור.',
      hintB: 'שינה קצרה יכולה להפוך את היום הבא לכבד יותר.',
      hintC: 'ימי עבודה לעיתים מרגישים דורשים יותר בהערות שלך.',
    },
  };
  const defaultCopy = copyByLang.en!;
  const copy = getLang(copyByLang, lang) || defaultCopy;

  const insights = useMemo(() => {
    const checkins = events.filter((event) => event.type === 'DAILY_CHECKIN');
    const shortSleepCount = checkins.filter((event) => {
      const payload = event.payload as { metrics?: Record<string, number> };
      return (payload.metrics?.sleep ?? 50) < 45;
    }).length;
    const pressureMentions = events
      .filter((event) => event.type === 'AUDIO_REFLECTION')
      .filter((event) => /(work|office|deadline|meeting|job|pressure)/i.test(((event.payload as { text?: string }).text || '').toLowerCase()))
      .length;

    const rows = [copy.hintA];
    if (shortSleepCount >= 2 || (systemState.lastCheckin?.metrics?.sleep ?? 50) < 45) rows.push(copy.hintB);
    if (pressureMentions >= 2 || currentPhase === CyclePhase.LUTEAL) rows.push(copy.hintC);
    return rows.slice(0, 3);
  }, [copy.hintA, copy.hintB, copy.hintC, currentPhase, events, systemState.lastCheckin?.metrics?.sleep]);

  const handleShare = async () => {
    const text = `${copy.title}\n\n${insights.map((line) => `• ${line}`).join('\n')}`;
    const result = await shareTextSafely(text, copy.title);
    if (result === 'shared') setFeedback(copy.shared);
    else if (result === 'copied') setFeedback(copy.copied);
    else setFeedback(copy.failed);
  };

  return (
    <section className="max-w-4xl mx-auto p-6 md:p-8 space-y-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-luna-purple transition-colors"
      >
        <ArrowLeft size={14} /> {copy.back}
      </button>

      <article className="rounded-[2.2rem] border border-slate-200/75 dark:border-[#2a4670] bg-white/82 dark:bg-[#081a3d]/92 p-6 md:p-8 shadow-luna-rich space-y-5">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-luna-purple">{copy.monthLabel}</p>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100">{copy.title}</h1>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{copy.subtitle}</p>

        <div className="rounded-2xl bg-slate-100/85 dark:bg-slate-800/65 p-4 space-y-3">
          <p className="text-sm font-black text-slate-800 dark:text-slate-100">{copy.insightTitle}</p>
          {insights.map((line) => (
            <p key={line} className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {line}
            </p>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-luna-purple text-white text-[11px] font-black uppercase tracking-[0.15em] hover:brightness-105 transition-all"
          >
            <Share2 size={14} /> {copy.share}
          </button>
          {feedback && <p className="text-xs font-semibold text-slate-500 dark:text-slate-300">{feedback}</p>}
        </div>
      </article>
    </section>
  );
};
