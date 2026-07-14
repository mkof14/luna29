import React, { useMemo, useState } from 'react';
import { Share2 } from 'lucide-react';
import { Language, getLang } from '../constants';
import { MemberIconBackButton } from './member/MemberIconBackButton';
import { MemberPageIntro } from './member/MemberPageIntro';
import { LunaPageContentSection } from './shared/LunaPageContentSection';
import { getLunaPageTheme } from '../utils/lunaPageThemes';
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
    es: {
      back: 'Atrás',
      title: 'Tu mes con Luna29',
      subtitle: 'Una mirada suave a lo que Luna29 empieza a notar.',
      share: 'Compartir esta nota',
      shared: 'Compartido.',
      copied: 'Copiado.',
      failed: 'No se pudo compartir ahora.',
      monthLabel: 'Nota mensual',
      insightTitle: 'Insights de tu mes',
      hintA: 'Tu energía suele suavizarse antes del ciclo.',
      hintB: 'Dormir poco puede hacer más pesado el día siguiente.',
      hintC: 'Los días de trabajo pueden sentirse más exigentes en tus notas.',
    },
    fr: {
      back: 'Retour',
      title: 'Votre mois avec Luna29',
      subtitle: 'Un regard doux sur ce que Luna29 commence à remarquer.',
      share: 'Partager cette note',
      shared: 'Partagé.',
      copied: 'Copié.',
      failed: 'Partage impossible pour le moment.',
      monthLabel: 'Note mensuelle',
      insightTitle: 'Insights de votre mois',
      hintA: 'Votre énergie s’adoucit souvent avant le cycle.',
      hintB: 'Un sommeil court peut rendre le lendemain plus lourd.',
      hintC: 'Les jours de travail peuvent sembler plus exigeants dans vos notes.',
    },
    de: {
      back: 'Zurück',
      title: 'Dein Monat mit Luna29',
      subtitle: 'Ein sanfter Blick darauf, was Luna29 zu bemerken beginnt.',
      share: 'Diese Notiz teilen',
      shared: 'Geteilt.',
      copied: 'Kopiert.',
      failed: 'Teilen gerade nicht möglich.',
      monthLabel: 'Monatsnotiz',
      insightTitle: 'Insights aus deinem Monat',
      hintA: 'Deine Energie wird vor dem Zyklus oft weicher.',
      hintB: 'Kurzer Schlaf kann den nächsten Tag schwerer machen.',
      hintC: 'Arbeitstage können sich in deinen Notizen anspruchsvoller anfühlen.',
    },
    zh: {
      back: '返回',
      title: '你与 Luna29 的这个月',
      subtitle: '温和地看看 Luna29 开始注意到什么。',
      share: '分享这条笔记',
      shared: '已分享。',
      copied: '已复制。',
      failed: '现在无法分享。',
      monthLabel: '月度笔记',
      insightTitle: '本月洞察',
      hintA: '精力常在周期前变柔和。',
      hintB: '睡眠不足可能让第二天更沉重。',
      hintC: '在笔记里，工作日可能感觉更吃力。',
    },
    ja: {
      back: '戻る',
      title: 'Luna29 との今月',
      subtitle: 'Luna29 が気づき始めていることをやさしく振り返ります。',
      share: 'このノートを共有',
      shared: '共有しました。',
      copied: 'コピーしました。',
      failed: '今は共有できません。',
      monthLabel: '月次ノート',
      insightTitle: '今月のインサイト',
      hintA: 'エネルギーは周期の前にやわらぐことが多いです。',
      hintB: '短い睡眠は翌日をより重く感じさせることがあります。',
      hintC: 'ノートでは仕事の日がより負担に感じられることがあります。',
    },
    pt: {
      back: 'Voltar',
      title: 'Seu mês com a Luna29',
      subtitle: 'Um olhar suave sobre o que a Luna29 começa a notar.',
      share: 'Compartilhar esta nota',
      shared: 'Compartilhado.',
      copied: 'Copiado.',
      failed: 'Não foi possível compartilhar agora.',
      monthLabel: 'Nota mensal',
      insightTitle: 'Insights do seu mês',
      hintA: 'Sua energia costuma amolecer antes do ciclo.',
      hintB: 'Sono curto pode deixar o dia seguinte mais pesado.',
      hintC: 'Dias de trabalho podem parecer mais exigentes nas suas notas.',
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
    <>
      <MemberIconBackButton lang={lang} onClick={onBack} className="mb-0" />
      <MemberPageIntro lang={lang} page="monthly_reflection" tab="monthly_reflection" />

      <LunaPageContentSection themeClass={getLunaPageTheme('monthly_reflection').shellClass} padded={false}>
      <article className="space-y-5">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{copy.monthLabel}</p>
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
      </LunaPageContentSection>
    </>
  );
};
