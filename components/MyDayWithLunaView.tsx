import React, { useMemo, useState } from 'react';
import { Mic, Save, Share2 } from 'lucide-react';
import { Language, getLang } from '../constants';
import { CyclePhase, HealthEvent, SystemState } from '../types';
import { dataService } from '../services/dataService';
import { shareTextSafely } from '../utils/share';
import { MemberIconBackButton } from './member/MemberIconBackButton';
import { MemberPageIntro } from './member/MemberPageIntro';
import { LunaPageContentSection } from './shared/LunaPageContentSection';
import { getLunaPageTheme } from '../utils/lunaPageThemes';

interface MyDayWithLunaViewProps {
  lang: Language;
  currentPhase: CyclePhase;
  systemState: SystemState;
  events: HealthEvent[];
  onSpeak: () => void;
  onBack: () => void;
}

type CardImageInput = {
  title: string;
  topLine: string;
  sleepLine: string;
  eveningLine: string;
  energyLabel: string;
  moodLabel: string;
  cycleLabel: string;
  signalEnergy: string;
  signalMood: string;
  signalCycle: string;
};

const drawRoundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
};

const buildMyDayCardBlob = async (input: CardImageInput): Promise<Blob | null> => {
  const canvas = document.createElement('canvas');
  canvas.width = 1400;
  canvas.height = 900;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  bg.addColorStop(0, '#f8ecf2');
  bg.addColorStop(0.5, '#efe6f8');
  bg.addColorStop(1, '#f9f4ef');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const cardX = 80;
  const cardY = 80;
  const cardW = canvas.width - 160;
  const cardH = canvas.height - 160;
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 42);
  ctx.fillStyle = 'rgba(255,255,255,0.72)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(170,126,178,0.38)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#422c5d';
  ctx.font = '700 56px Georgia, serif';
  ctx.fillText(input.title, 140, 185);

  ctx.fillStyle = '#3a2f4d';
  ctx.font = '600 42px "Inter", sans-serif';
  ctx.fillText(input.topLine, 140, 258);

  ctx.fillStyle = '#554a68';
  ctx.font = '500 30px "Inter", sans-serif';
  ctx.fillText(input.sleepLine, 140, 320);
  ctx.fillText(input.eveningLine, 140, 372);

  const signalY = 450;
  const signalW = 360;
  const signalH = 220;
  const gap = 30;
  const signals = [
    { title: input.signalEnergy, value: input.energyLabel },
    { title: input.signalMood, value: input.moodLabel },
    { title: input.signalCycle, value: input.cycleLabel },
  ];

  signals.forEach((signal, index) => {
    const x = 140 + index * (signalW + gap);
    drawRoundedRect(ctx, x, signalY, signalW, signalH, 28);
    ctx.fillStyle = 'rgba(244, 236, 250, 0.85)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(156, 111, 171, 0.32)';
    ctx.stroke();

    ctx.fillStyle = '#6f538e';
    ctx.font = '700 24px "Inter", sans-serif';
    ctx.fillText(signal.title, x + 28, signalY + 56);

    ctx.fillStyle = '#32274a';
    ctx.font = '600 34px "Inter", sans-serif';
    ctx.fillText(signal.value, x + 28, signalY + 130);
  });

  return await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
};

export const MyDayWithLunaView: React.FC<MyDayWithLunaViewProps> = ({
  lang,
  currentPhase,
  systemState,
  events,
  onSpeak,
  onBack,
}) => {
  const copyByLang: Partial<Record<
    Language,
    {
      title: string;
      topLineSlow: string;
      topLineSteady: string;
      sleepShort: (phase: string) => string;
      sleepSteady: (phase: string) => string;
      eveningLine: string;
      body: string;
      cycle: string;
      energy: string;
      mood: string;
      lowerToday: string;
      steadyToday: string;
      sensitive: string;
      balanced: string;
      calmLine: string;
      save: string;
      share: string;
      speak: string;
      saved: string;
      copied: string;
      exported: string;
      failed: string;
      back: string;
      dayWord: string;
      phaseWord: string;
      notSet: string;
      progressionTitle: string;
      stageDaily: string;
      stagePattern: string;
      stageMonthly: string;
      patternHint: string;
      monthlyA: string;
      monthlyB: string;
    }
  >> = {
    en: {
      title: 'My Day with Luna29',
      topLineSlow: 'Today feels a little slower.',
      topLineSteady: 'Today feels a little steadier.',
      sleepShort: (phase) => `Sleep was shorter last night, and your body is in the ${phase} phase.`,
      sleepSteady: (phase) => `Sleep looked steadier last night, and your body is in the ${phase} phase.`,
      eveningLine: 'It may help to keep the evening gentle.',
      body: 'Body',
      cycle: 'Cycle',
      energy: 'Energy',
      mood: 'Mood',
      lowerToday: 'Lower today',
      steadyToday: 'Steadier today',
      sensitive: 'Sensitive',
      balanced: 'More balanced',
      calmLine: 'Nothing is wrong with today. Your body just asks for a little more rest.',
      save: 'Save',
      share: 'Share',
      speak: 'Speak to Luna29',
      saved: 'Saved.',
      copied: 'Copied.',
      exported: 'Card exported.',
      failed: 'Could not export card.',
      back: 'Back',
      dayWord: 'Day',
      phaseWord: 'phase',
      notSet: 'Not set',
      progressionTitle: 'Insight progression',
      stageDaily: 'Daily explanation',
      stagePattern: 'Pattern hint',
      stageMonthly: 'Monthly rhythm summary',
      patternHint: 'Energy often feels lower when sleep is shorter.',
      monthlyA: 'Your energy tends to dip before your cycle.',
      monthlyB: 'Sleep often affects mood during the week.',
    },
    ru: {
      title: 'Мой день с Luna29',
      topLineSlow: 'Сегодня день ощущается немного медленнее.',
      topLineSteady: 'Сегодня день ощущается немного ровнее.',
      sleepShort: (phase) => `Сон был короче прошлой ночью, и ваше тело сейчас в фазе ${phase}.`,
      sleepSteady: (phase) => `Сон был более ровным прошлой ночью, и ваше тело сейчас в фазе ${phase}.`,
      eveningLine: 'Вечером может помочь более мягкий ритм.',
      body: 'Тело',
      cycle: 'Цикл',
      energy: 'Энергия',
      mood: 'Настроение',
      lowerToday: 'Ниже сегодня',
      steadyToday: 'Ровнее сегодня',
      sensitive: 'Чувствительное',
      balanced: 'Более ровное',
      calmLine: 'С этим днем все в порядке. Ваше тело просто просит немного больше отдыха.',
      save: 'Сохранить',
      share: 'Поделиться',
      speak: 'Поговорить с Luna29',
      saved: 'Сохранено.',
      copied: 'Скопировано.',
      exported: 'Карточка экспортирована.',
      failed: 'Не удалось экспортировать карточку.',
      back: 'Назад',
      dayWord: 'День',
      phaseWord: 'фаза',
      notSet: 'Нет данных',
      progressionTitle: 'Развитие инсайтов',
      stageDaily: 'Ежедневное объяснение',
      stagePattern: 'Подсказка паттерна',
      stageMonthly: 'Месячный ритм',
      patternHint: 'Энергия часто ниже, когда сон короче.',
      monthlyA: 'Перед циклом энергия обычно немного снижается.',
      monthlyB: 'Сон часто влияет на настроение в течение недели.',
    },
    uk: {
      title: 'Мій день з Luna29',
      topLineSlow: 'Сьогодні день відчувається трохи повільнішим.',
      topLineSteady: 'Сьогодні день відчувається трохи рівнішим.',
      sleepShort: (phase) => `Сон був коротшим минулої ночі, а ваше тіло зараз у фазі ${phase}.`,
      sleepSteady: (phase) => `Сон був рівнішим минулої ночі, а ваше тіло зараз у фазі ${phase}.`,
      eveningLine: 'Увечері може допомогти м’якіший ритм.',
      body: 'Тіло',
      cycle: 'Цикл',
      energy: 'Енергія',
      mood: 'Настрій',
      lowerToday: 'Нижче сьогодні',
      steadyToday: 'Рівніше сьогодні',
      sensitive: 'Чутливий',
      balanced: 'Більш збалансований',
      calmLine: 'З цим днем все гаразд. Ваше тіло просто просить трохи більше відпочинку.',
      save: 'Зберегти',
      share: 'Поділитися',
      speak: 'Поговорити з Luna29',
      saved: 'Збережено.',
      copied: 'Скопійовано.',
      exported: 'Картку експортовано.',
      failed: 'Не вдалося експортувати картку.',
      back: 'Назад',
      dayWord: 'День',
      phaseWord: 'фаза',
      notSet: 'Немає даних',
      progressionTitle: 'Розвиток інсайтів',
      stageDaily: 'Щоденне пояснення',
      stagePattern: 'Підказка патерна',
      stageMonthly: 'Місячний ритм',
      patternHint: 'Енергія часто нижча, коли сон коротший.',
      monthlyA: 'Перед циклом енергія зазвичай трохи знижується.',
      monthlyB: 'Сон часто впливає на настрій протягом тижня.',
    },
    ar: {
      title: 'يومي مع Luna29',
      topLineSlow: 'اليوم يبدو أبطأ قليلاً.',
      topLineSteady: 'اليوم يبدو أكثر استقراراً.',
      sleepShort: (phase) => `النوم كان أقصر الليلة الماضية، وجسمكِ في مرحلة ${phase}.`,
      sleepSteady: (phase) => `النوم بدا أكثر استقراراً الليلة الماضية، وجسمكِ في مرحلة ${phase}.`,
      eveningLine: 'قد يساعدكِ جعل المساء ألطف.',
      body: 'الجسم',
      cycle: 'الدورة',
      energy: 'الطاقة',
      mood: 'المزاج',
      lowerToday: 'أقل اليوم',
      steadyToday: 'أكثر استقراراً اليوم',
      sensitive: 'حسّاس',
      balanced: 'أكثر توازناً',
      calmLine: 'لا خطأ في هذا اليوم. جسمكِ يطلب فقط قليلاً من الراحة.',
      save: 'حفظ',
      share: 'مشاركة',
      speak: 'تحدّثي مع Luna29',
      saved: 'تم الحفظ.',
      copied: 'تم النسخ.',
      exported: 'تم تصدير البطاقة.',
      failed: 'تعذّر تصدير البطاقة.',
      back: 'رجوع',
      dayWord: 'يوم',
      phaseWord: 'مرحلة',
      notSet: 'غير محدّد',
      progressionTitle: 'تطوّر الرؤى',
      stageDaily: 'شرح يومي',
      stagePattern: 'تلميح نمط',
      stageMonthly: 'ملخّص الإيقاع الشهري',
      patternHint: 'الطاقة غالباً تكون أقل عندما يكون النوم أقصر.',
      monthlyA: 'طاقتكِ تميل للانخفاض قبل دورتكِ.',
      monthlyB: 'النوم غالباً يؤثر على المزاج خلال الأسبوع.',
    },
    he: {
      title: 'היום שלי עם Luna29',
      topLineSlow: 'היום מרגיש קצת יותר איטי.',
      topLineSteady: 'היום מרגיש קצת יותר יציב.',
      sleepShort: (phase) => `השינה הייתה קצרה יותר אמש, והגוף שלך בשלב ${phase}.`,
      sleepSteady: (phase) => `השינה נראתה יציבה יותר אמש, והגוף שלך בשלב ${phase}.`,
      eveningLine: 'אולי יעזור לשמור על ערב עדין.',
      body: 'גוף',
      cycle: 'מחזור',
      energy: 'אנרגיה',
      mood: 'מצב רוח',
      lowerToday: 'נמוך יותר היום',
      steadyToday: 'יציב יותר היום',
      sensitive: 'רגיש',
      balanced: 'מאוזן יותר',
      calmLine: 'אין בעיה עם היום. הגוף שלך רק מבקש קצת יותר מנוחה.',
      save: 'שמירה',
      share: 'שיתוף',
      speak: 'דברי עם Luna29',
      saved: 'נשמר.',
      copied: 'הועתק.',
      exported: 'הכרטיס יוצא.',
      failed: 'לא ניתן לייצא את הכרטיס.',
      back: 'חזרה',
      dayWord: 'יום',
      phaseWord: 'שלב',
      notSet: 'לא הוגדר',
      progressionTitle: 'התפתחות תובנות',
      stageDaily: 'הסבר יומי',
      stagePattern: 'רמז לדפוס',
      stageMonthly: 'סיכום קצב חודשי',
      patternHint: 'אנרגיה לעיתים נמוכה יותר כשהשינה קצרה.',
      monthlyA: 'האנרגיה שלך נוטה לרדת לפני המחזור.',
      monthlyB: 'שינה לעיתים משפיעה על מצב הרוח במהלך השבוע.',
    },
  };

  const defaultCopy = copyByLang.en!;
  const copy = getLang(copyByLang, lang) || defaultCopy;
  const [feedback, setFeedback] = useState<string>('');

  const sleepScore = systemState.lastCheckin?.metrics?.sleep ?? 50;
  const energyScore = systemState.lastCheckin?.metrics?.energy ?? 50;
  const moodScore = systemState.lastCheckin?.metrics?.mood ?? 50;
  const sleepMinutes = typeof sleepScore === 'number' ? 240 + Math.round((Math.max(0, Math.min(100, sleepScore)) / 100) * 300) : null;
  const sleepLabel = sleepMinutes ? `${Math.floor(sleepMinutes / 60)}h ${String(sleepMinutes % 60).padStart(2, '0')}m` : copy.notSet;
  const phaseLabel = currentPhase.toLowerCase();
  const topLine = sleepScore < 45 || currentPhase === CyclePhase.LUTEAL || currentPhase === CyclePhase.MENSTRUAL ? copy.topLineSlow : copy.topLineSteady;
  const sleepLine = sleepScore < 45 ? copy.sleepShort(phaseLabel) : copy.sleepSteady(phaseLabel);
  const energyLabel = energyScore < 45 ? copy.lowerToday : copy.steadyToday;
  const moodLabel = moodScore < 45 ? copy.sensitive : copy.balanced;

  const latestVoiceText = useMemo(() => {
    const latestVoice = events
      .filter((event) => event.type === 'AUDIO_REFLECTION')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    if (!latestVoice) return '';
    const payload = latestVoice.payload as { text?: string };
    return (payload.text || '').toLowerCase();
  }, [events]);

  const summaryText = useMemo(() => {
    if (!latestVoiceText.trim()) return copy.calmLine;
    if (/(work|office|deadline|meeting|job|pressure)/i.test(latestVoiceText)) {
      return `${copy.calmLine} Your recent note also mentioned pressure.`;
    }
    if (/(tired|drained|sleep|overwhelmed|stress)/i.test(latestVoiceText)) {
      return `${copy.calmLine} Your recent note sounded tired.`;
    }
    return copy.calmLine;
  }, [copy.calmLine, latestVoiceText]);

  const insightStage = useMemo(() => {
    const activeDays = new Set(
      events
        .filter((event) => event.type === 'AUDIO_REFLECTION' || event.type === 'DAILY_CHECKIN')
        .map((event) => new Date(event.timestamp).toISOString().slice(0, 10))
    ).size;
    if (activeDays >= 30) return 'monthly' as const;
    if (activeDays >= 7) return 'pattern' as const;
    return 'daily' as const;
  }, [events]);

  const handleSave = () => {
    dataService.logEvent('INSIGHT_GENERATED', {
      source: 'my_day_with_luna',
      phase: currentPhase,
      sleep: sleepLabel,
      energy: energyLabel,
      mood: moodLabel,
    });
    setFeedback(copy.saved);
  };

  const handleShare = async () => {
    try {
      const blob = await buildMyDayCardBlob({
        title: copy.title,
        topLine,
        sleepLine,
        eveningLine: copy.eveningLine,
        energyLabel,
        moodLabel,
        cycleLabel: `${copy.dayWord} ${systemState.currentDay} · ${currentPhase} ${copy.phaseWord}`,
        signalEnergy: copy.energy,
        signalMood: copy.mood,
        signalCycle: copy.cycle,
      });
      if (!blob) {
        setFeedback(copy.failed);
        return;
      }

      const file = new File([blob], 'my-day-with-luna.png', { type: 'image/png' });
      const navigatorWithShare = navigator as Navigator & {
        canShare?: (data: ShareData) => boolean;
      };

      if (
        navigatorWithShare.share &&
        navigatorWithShare.canShare &&
        navigatorWithShare.canShare({ files: [file] })
      ) {
        await navigatorWithShare.share({
          title: copy.title,
          text: `${topLine}\n${sleepLine}`,
          files: [file],
        });
        setFeedback(copy.copied);
        return;
      }

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'my-day-with-luna.png';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);

      await shareTextSafely(`${copy.title}\n\n${topLine}\n${sleepLine}\n${copy.eveningLine}`, copy.title);
      setFeedback(copy.exported);
    } catch {
      setFeedback(copy.failed);
    }
  };

  return (
    <>
      <MemberIconBackButton lang={lang} onClick={onBack} className="mb-0" />
      <MemberPageIntro lang={lang} page="my_day" tab="my_day" />

      <LunaPageContentSection themeClass={getLunaPageTheme('my_day').shellClass} padded={false}>
      <article className="space-y-5">
        <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">{topLine}</p>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{sleepLine}</p>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-100">{copy.eveningLine}</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl bg-slate-100/85 dark:bg-slate-800/65 p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">{copy.body}</p>
            <p className="mt-1 text-sm font-black text-slate-900 dark:text-slate-100">{copy.cycle}</p>
            <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">{copy.dayWord} {systemState.currentDay} · {currentPhase} {copy.phaseWord}</p>
          </div>
          <div className="rounded-xl bg-slate-100/85 dark:bg-slate-800/65 p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">{copy.energy}</p>
            <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">{energyLabel}</p>
          </div>
          <div className="rounded-xl bg-slate-100/85 dark:bg-slate-800/65 p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">{copy.mood}</p>
            <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">{moodLabel}</p>
          </div>
        </div>

        <p className="rounded-xl bg-slate-100/75 dark:bg-slate-800/60 p-4 text-sm font-medium text-slate-700 dark:text-slate-200">
          {summaryText}
        </p>

        <article className="rounded-xl bg-slate-100/75 dark:bg-slate-800/60 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-luna-purple">{copy.progressionTitle}</p>
          {insightStage === 'daily' && (
            <div className="mt-2 space-y-1">
              <p className="text-sm font-black text-slate-800 dark:text-slate-100">{copy.stageDaily}</p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{topLine}</p>
            </div>
          )}
          {insightStage === 'pattern' && (
            <div className="mt-2 space-y-1">
              <p className="text-sm font-black text-slate-800 dark:text-slate-100">{copy.stagePattern}</p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{copy.patternHint}</p>
            </div>
          )}
          {insightStage === 'monthly' && (
            <div className="mt-2 space-y-1">
              <p className="text-sm font-black text-slate-800 dark:text-slate-100">{copy.stageMonthly}</p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{copy.monthlyA}</p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{copy.monthlyB}</p>
            </div>
          )}
        </article>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-luna-purple/14 hover:bg-luna-purple/22 text-luna-purple text-[11px] font-black uppercase tracking-[0.14em] transition-all"
          >
            <Save size={14} /> {copy.save}
          </button>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-200/70 dark:bg-slate-700/60 text-slate-700 dark:text-slate-200 text-[11px] font-black uppercase tracking-[0.14em] transition-all hover:bg-slate-300/70 dark:hover:bg-slate-600/70"
          >
            <Share2 size={14} /> {copy.share}
          </button>
          <button
            onClick={onSpeak}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-luna-purple text-white text-[11px] font-black uppercase tracking-[0.14em] transition-all hover:brightness-105"
          >
            <Mic size={14} /> {copy.speak}
          </button>
        </div>
        {feedback && <p className="text-xs font-semibold text-slate-500 dark:text-slate-300">{feedback}</p>}
      </article>
      </LunaPageContentSection>
    </>
  );
};
