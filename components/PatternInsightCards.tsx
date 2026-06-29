import React, { useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { Language, LangCopy, getLang } from '../constants';
import { HealthEvent } from '../types';

type PatternCard = { id: string; title: string; detail: string; confidence: 'learning' | 'emerging' | 'steady' };

const copyByLang: LangCopy<{
  title: string;
  learning: string;
  emerging: string;
  steady: string;
  empty: string;
  disclaimer: string;
}> = {
  en: {
    title: 'Pattern insights',
    learning: 'Learning',
    emerging: 'Emerging',
    steady: 'Steady',
    empty: 'Luna29 is still learning your rhythm. A few more check-ins will reveal patterns.',
    disclaimer: 'Observational guidance only. Not medical advice.',
  },
  ru: {
    title: 'Инсайты паттернов',
    learning: 'Изучаем',
    emerging: 'Проявляется',
    steady: 'Устойчиво',
    empty: 'Luna29 ещё изучает ваш ритм. Ещё несколько check-in покажут паттерны.',
    disclaimer: 'Наблюдательные подсказки. Не медицинский совет.',
  },
  uk: {
    title: 'Інсайти патернів',
    learning: 'Вивчаємо',
    emerging: 'Проявляється',
    steady: 'Стійко',
    empty: 'Luna29 ще вивчає ваш ритм. Ще кілька check-in покажуть патерни.',
    disclaimer: 'Лише спостережні підказки. Не медична порада.',
  },
  es: { title: 'Insights de patrones', learning: 'Aprendiendo', emerging: 'Emergiendo', steady: 'Estable', empty: 'Luna29 sigue aprendiendo tu ritmo.', disclaimer: 'Solo orientación observacional.' },
  fr: { title: 'Insights de tendances', learning: 'Apprentissage', emerging: 'Émergent', steady: 'Stable', empty: 'Luna29 apprend encore votre rythme.', disclaimer: 'Guidance observationnelle uniquement.' },
  de: { title: 'Muster-Insights', learning: 'Lernen', emerging: 'Entstehend', steady: 'Stabil', empty: 'Luna29 lernt deinen Rhythmus noch kennen.', disclaimer: 'Nur beobachtende Hinweise.' },
  zh: { title: '规律洞察', learning: '学习中', emerging: '浮现中', steady: '较稳定', empty: 'Luna29 仍在了解你的节律。', disclaimer: '仅为观察性提示。' },
  ja: { title: 'パターンインサイト', learning: '学習中', emerging: '浮上中', steady: '安定', empty: 'Luna29はまだリズムを学習中です。', disclaimer: '観察に基づくガイドです。' },
  pt: { title: 'Insights de padrões', learning: 'Aprendendo', emerging: 'Emergindo', steady: 'Estável', empty: 'A Luna29 ainda está aprendendo seu ritmo.', disclaimer: 'Apenas orientação observacional.' },
  ar: {
    title: 'Pattern insights',
    learning: 'Learning',
    emerging: 'Emerging',
    steady: 'Steady',
    empty: 'Luna29 is still learning your rhythm. A few more check-ins will reveal patterns.',
    disclaimer: 'Observational guidance only. Not medical advice.',
  },
  he: {
    title: 'Pattern insights',
    learning: 'Learning',
    emerging: 'Emerging',
    steady: 'Steady',
    empty: 'Luna29 is still learning your rhythm. A few more check-ins will reveal patterns.',
    disclaimer: 'Observational guidance only. Not medical advice.',
  },
};

const buildPatterns = (events: HealthEvent[]): PatternCard[] => {
  const checkins = events.filter((e) => e.type === 'DAILY_CHECKIN');
  const voices = events.filter((e) => e.type === 'AUDIO_REFLECTION');
  const total = checkins.length + voices.length;
  const cards: PatternCard[] = [];

  if (total < 3) {
    return cards;
  }

  const lowSleepCount = checkins.filter((e) => {
    const m = (e.payload as { metrics?: { sleep?: number } })?.metrics?.sleep;
    return typeof m === 'number' && m < 40;
  }).length;

  const lowEnergyCount = checkins.filter((e) => {
    const m = (e.payload as { metrics?: { energy?: number } })?.metrics?.energy;
    return typeof m === 'number' && m < 40;
  }).length;

  const workStressVoices = voices.filter((e) => {
    const t = String((e.payload as { text?: string })?.text || '').toLowerCase();
    return /work|office|deadline|meeting|job|pressure/.test(t);
  }).length;

  if (lowSleepCount >= 2 && lowEnergyCount >= 2) {
    cards.push({
      id: 'sleep-energy',
      title: 'Shorter sleep often pairs with lower energy',
      detail: 'On days after shorter sleep signals, energy readings tended to run lower.',
      confidence: total >= 8 ? 'steady' : 'emerging',
    });
  }

  if (workStressVoices >= 2) {
    cards.push({
      id: 'work-pressure',
      title: 'Work pressure shows up in evening reflections',
      detail: 'Voice notes recently mentioned work load — a softer evening pace may help.',
      confidence: workStressVoices >= 4 ? 'steady' : 'emerging',
    });
  }

  if (checkins.length >= 5) {
    cards.push({
      id: 'rhythm-building',
      title: 'Your daily rhythm is taking shape',
      detail: 'Consistent check-ins help Luna29 read your cycle and mood more clearly over time.',
      confidence: checkins.length >= 10 ? 'steady' : 'learning',
    });
  }

  return cards.slice(0, 3);
};

type PatternInsightCardsProps = {
  events: HealthEvent[];
  lang: Language;
  locked?: boolean;
  onUnlock?: () => void;
};

export const PatternInsightCards: React.FC<PatternInsightCardsProps> = ({ events, lang, locked = false, onUnlock }) => {
  const copy = getLang(copyByLang, lang) || copyByLang.en;
  const patterns = useMemo(() => buildPatterns(events), [events]);

  const confidenceLabel = (c: PatternCard['confidence']) =>
    c === 'steady' ? copy.steady : c === 'emerging' ? copy.emerging : copy.learning;

  if (locked) {
    return (
      <button
        type="button"
        onClick={onUnlock}
        className="w-full text-left rounded-[2rem] border border-luna-purple/30 bg-luna-purple/5 dark:bg-luna-purple/10 p-5 hover:bg-luna-purple/10 transition-colors"
      >
        <div className="inline-flex items-center gap-2 mb-2">
          <Sparkles size={14} className="text-luna-purple" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-luna-purple">{copy.title}</p>
        </div>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{copy.empty}</p>
      </button>
    );
  }

  return (
    <div className="space-y-4">
      <div className="inline-flex items-center gap-2">
        <Sparkles size={14} className="text-luna-purple" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-luna-purple">{copy.title}</p>
      </div>
      {patterns.length === 0 ? (
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{copy.empty}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {patterns.map((card) => (
            <article
              key={card.id}
              className="rounded-2xl border border-white/55 dark:border-white/10 bg-gradient-to-br from-[#ffffffde] via-[#fbf3ffdd] to-[#f2efffd8] dark:from-[#0c2348] dark:via-[#13315a] dark:to-[#183b66] p-4"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-luna-purple">{confidenceLabel(card.confidence)}</p>
              <p className="mt-1 text-sm font-black text-slate-800 dark:text-slate-100">{card.title}</p>
              <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">{card.detail}</p>
            </article>
          ))}
        </div>
      )}
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{copy.disclaimer}</p>
    </div>
  );
};
