import React, { useEffect, useMemo, useState } from 'react';
import { Language, getLang } from '../constants';
import {
  CRISIS_MAIN_COPY,
  CRISIS_BREATH_PHASE_COPY,
  CRISIS_SENSES_COPY,
  CRISIS_SHARE_MESSAGE,
} from '../utils/memberCoreI18n';

type GroundingState = {
  see: string[];
  feel: string[];
  hear: string[];
  smell: string[];
  taste: string[];
};

const NOTE_STORAGE_KEY = 'luna_reset_room_note_v1';
const GROUNDING_STORAGE_KEY = 'luna_reset_room_grounding_v1';
const STEPS_STORAGE_KEY = 'luna_reset_room_steps_v1';

const defaultGrounding: GroundingState = {
  see: Array(5).fill(''),
  feel: Array(4).fill(''),
  hear: Array(3).fill(''),
  smell: Array(2).fill(''),
  taste: Array(1).fill(''),
};

const defaultSteps = [false, false, false, false];

export const CrisisCenterView: React.FC<{ lang: Language; onBack: () => void }> = ({ lang, onBack }) => {
  const copy = getLang(CRISIS_MAIN_COPY, lang) || CRISIS_MAIN_COPY.en;
  const phaseText = getLang(CRISIS_BREATH_PHASE_COPY, lang) || CRISIS_BREATH_PHASE_COPY.en;
  const senses = getLang(CRISIS_SENSES_COPY, lang) || CRISIS_SENSES_COPY.en;
  const phases = useMemo(
    () => [
      { key: 'inhale', label: phaseText.inhale, sec: 4 },
      { key: 'hold', label: phaseText.hold, sec: 4 },
      { key: 'exhale', label: phaseText.exhale, sec: 6 },
    ],
    [phaseText.exhale, phaseText.hold, phaseText.inhale],
  );

  const [isRunning, setIsRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [phaseRemaining, setPhaseRemaining] = useState(phases[0].sec);
  const [cycles, setCycles] = useState(0);
  const [copyFeedback, setCopyFeedback] = useState('');

  const [grounding, setGrounding] = useState<GroundingState>(() => {
    try {
      const raw = localStorage.getItem(GROUNDING_STORAGE_KEY);
      if (!raw) return defaultGrounding;
      const parsed = JSON.parse(raw) as GroundingState;
      return {
        see: Array.isArray(parsed.see) ? parsed.see.slice(0, 5) : defaultGrounding.see,
        feel: Array.isArray(parsed.feel) ? parsed.feel.slice(0, 4) : defaultGrounding.feel,
        hear: Array.isArray(parsed.hear) ? parsed.hear.slice(0, 3) : defaultGrounding.hear,
        smell: Array.isArray(parsed.smell) ? parsed.smell.slice(0, 2) : defaultGrounding.smell,
        taste: Array.isArray(parsed.taste) ? parsed.taste.slice(0, 1) : defaultGrounding.taste,
      };
    } catch {
      return defaultGrounding;
    }
  });

  const [note, setNote] = useState(() => localStorage.getItem(NOTE_STORAGE_KEY) || '');
  const [steps, setSteps] = useState<boolean[]>(() => {
    try {
      const raw = localStorage.getItem(STEPS_STORAGE_KEY);
      if (!raw) return defaultSteps;
      const parsed = JSON.parse(raw) as boolean[];
      return Array.isArray(parsed) ? parsed.slice(0, 4) : defaultSteps;
    } catch {
      return defaultSteps;
    }
  });

  useEffect(() => {
    localStorage.setItem(GROUNDING_STORAGE_KEY, JSON.stringify(grounding));
  }, [grounding]);

  useEffect(() => {
    localStorage.setItem(NOTE_STORAGE_KEY, note);
  }, [note]);

  useEffect(() => {
    localStorage.setItem(STEPS_STORAGE_KEY, JSON.stringify(steps));
  }, [steps]);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setPhaseRemaining((prev) => {
        if (prev > 1) return prev - 1;
        setPhaseIndex((current) => {
          const next = (current + 1) % phases.length;
          if (next === 0) setCycles((old) => old + 1);
          return next;
        });
        return phases[(phaseIndex + 1) % phases.length].sec;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, phaseIndex, phases]);

  const updateGrounding = (sense: keyof GroundingState, index: number, value: string) => {
    setGrounding((prev) => {
      const next = [...prev[sense]];
      next[index] = value;
      return { ...prev, [sense]: next };
    });
  };

  const groundingProgress = useMemo(() => {
    const all = [...grounding.see, ...grounding.feel, ...grounding.hear, ...grounding.smell, ...grounding.taste];
    const done = all.filter((item) => item.trim().length > 0).length;
    return { done, total: 15, percent: Math.round((done / 15) * 100) };
  }, [grounding]);

  const resetBreathing = () => {
    setIsRunning(false);
    setPhaseIndex(0);
    setPhaseRemaining(phases[0].sec);
    setCycles(0);
  };

  const copyMessage = async () => {
    const message = getLang(CRISIS_SHARE_MESSAGE, lang) || CRISIS_SHARE_MESSAGE.en;
    try {
      await navigator.clipboard.writeText(message);
      setCopyFeedback(copy.copied);
      setTimeout(() => setCopyFeedback(''), 2000);
    } catch {
      setCopyFeedback(copy.copyFailed);
    }
  };

  const currentPhase = phases[phaseIndex];
  const phaseScale = currentPhase.key === 'inhale' ? 'scale-110' : currentPhase.key === 'hold' ? 'scale-95' : 'scale-75';
  const panelClass =
    'rounded-[2.3rem] border border-slate-300/80 dark:border-[#28406d] bg-gradient-to-br from-[#e8d7e3]/96 via-[#e1d4e6]/94 to-[#d7dfed]/92 dark:bg-none dark:!bg-[#0b1f45] p-7 shadow-[0_16px_48px_rgba(88,60,120,0.14),0_6px_20px_rgba(79,118,141,0.12),inset_0_1px_0_rgba(255,255,255,0.45)] dark:shadow-[0_22px_62px_rgba(0,0,0,0.72),0_10px_28px_rgba(18,40,83,0.45)]';
  const innerCardClass =
    'rounded-2xl border border-slate-300/70 dark:border-[#2e4c82] bg-gradient-to-br from-[#efe0e9]/94 via-[#e8ddef]/92 to-[#dfe6f3]/90 dark:bg-none dark:!bg-[#102a58] p-4';

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-6 duration-700 relative dark:text-slate-100">
      <div className="pointer-events-none absolute -top-24 -left-20 w-80 h-80 rounded-full bg-luna-purple/24 blur-[130px] dark:hidden" />
      <div className="pointer-events-none absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-luna-coral/18 blur-[130px] dark:hidden" />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 w-80 h-80 rounded-full bg-luna-teal/18 blur-[130px] dark:hidden" />
      <div className="pointer-events-none absolute -top-24 -left-20 w-80 h-80 rounded-full hidden dark:block bg-indigo-500/18 blur-[140px]" />
      <div className="pointer-events-none absolute top-1/3 -right-20 w-80 h-80 rounded-full hidden dark:block bg-cyan-400/12 blur-[145px]" />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 w-80 h-80 rounded-full hidden dark:block bg-fuchsia-500/14 blur-[140px]" />
      <button onClick={onBack} className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-luna-purple transition-all">← {copy.back}</button>

      <section className="rounded-[3rem] border border-slate-200/70 dark:border-slate-800/90 bg-gradient-to-br from-[#efe0e9]/96 via-[#e2d8e8]/94 to-[#d1c9d9]/92 dark:from-[#050a14]/98 dark:via-[#070d19]/97 dark:to-[#060b16]/96 p-8 md:p-10 shadow-[0_22px_70px_rgba(88,60,120,0.2),0_8px_26px_rgba(79,118,141,0.18)] dark:shadow-[0_30px_84px_rgba(0,0,0,0.76),0_12px_32px_rgba(26,46,84,0.3)] relative overflow-hidden">
        <div className="absolute -top-16 -right-20 w-80 h-80 rounded-full bg-luna-purple/30 dark:bg-indigo-500/24 blur-[120px]" />
        <div className="absolute -bottom-20 -left-16 w-80 h-80 rounded-full bg-luna-coral/22 dark:bg-cyan-400/16 blur-[120px]" />
        <div className="absolute inset-0 hidden dark:block bg-[radial-gradient(circle_at_18%_24%,rgba(129,140,248,0.2),transparent_38%),radial-gradient(circle_at_82%_76%,rgba(34,211,238,0.12),transparent_40%)]" />
        <header className="relative z-10 text-center space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-luna-purple">{copy.title}</p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-slate-100">{copy.demand}</h2>
          <p className="text-base md:text-lg font-semibold text-slate-600 dark:text-slate-300">{copy.subtitle}</p>
        </header>
      </section>

      <article className={`${panelClass} dark:from-[#040811]/98 dark:via-[#050b16]/97 dark:to-[#040913]/96 space-y-4`}>
        <h3 className="text-xl font-black tracking-tight">{copy.quickStartTitle}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {copy.quickStart.map((line) => (
            <div key={line} className={`${innerCardClass} px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-100`}>
              {line}
            </div>
          ))}
        </div>
      </article>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <article className={`xl:col-span-5 ${panelClass} space-y-5`}>
          <div className="space-y-1">
            <h3 className="text-xl font-black tracking-tight">{copy.breathTitle}</h3>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-200">{copy.breathProtocol}</p>
          </div>
          <div className="flex flex-col items-center py-4">
            <div className="relative w-56 h-56 flex items-center justify-center">
              <div className={`absolute inset-0 rounded-full bg-luna-purple/15 transition-transform duration-700 ${phaseScale}`} />
              <div className={`absolute inset-6 rounded-full border-2 border-luna-purple/35 transition-transform duration-700 ${phaseScale}`} />
              <div className="relative z-10 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.32em] text-luna-purple">{currentPhase.label}</p>
                <p className="text-6xl font-black text-slate-900 dark:text-slate-100 leading-none mt-2">{phaseRemaining}</p>
              </div>
            </div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-200 mt-3">{copy.cycles}: {cycles}</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => setIsRunning(true)} className="px-4 py-2.5 rounded-xl bg-luna-purple text-white text-[10px] font-black uppercase tracking-[0.2em] hover:brightness-110 transition-all">{copy.start}</button>
            <button onClick={() => setIsRunning(false)} className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-100 hover:text-luna-purple transition-colors">{copy.pause}</button>
            <button onClick={resetBreathing} className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-100 hover:text-luna-purple transition-colors">{copy.reset}</button>
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-200">{copy.breathingHint}</p>
        </article>

        <article className={`xl:col-span-7 ${panelClass} dark:from-[#040811]/98 dark:via-[#050b16]/97 dark:to-[#040913]/96 space-y-4`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-black tracking-tight">{copy.groundingTitle}</h3>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-100">{copy.groundingSubtitle}</p>
            </div>
            <span className="px-3 py-2 rounded-full bg-luna-purple/10 border border-luna-purple/30 text-[10px] font-black uppercase tracking-[0.2em] text-luna-purple">
              {groundingProgress.done}/{groundingProgress.total} • {groundingProgress.percent}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-slate-200/80 dark:bg-slate-700/70 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-luna-purple via-luna-coral to-luna-teal transition-all duration-500" style={{ width: `${groundingProgress.percent}%` }} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'see' as const, label: `5 ${senses.see}`, count: 5 },
              { key: 'feel' as const, label: `4 ${senses.feel}`, count: 4 },
              { key: 'hear' as const, label: `3 ${senses.hear}`, count: 3 },
              { key: 'smell' as const, label: `2 ${senses.smell}`, count: 2 },
              { key: 'taste' as const, label: `1 ${senses.taste}`, count: 1 },
            ].map((sense) => (
              <div key={sense.key} className={`${innerCardClass} space-y-2`}>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 dark:text-slate-100">{sense.label}</p>
                {Array.from({ length: sense.count }).map((_, idx) => (
                  <input
                    key={`${sense.key}-${idx}`}
                    value={grounding[sense.key][idx] || ''}
                    onChange={(e) => updateGrounding(sense.key, idx, e.target.value)}
                    placeholder={`...`}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white/90 dark:bg-slate-950/90 text-sm font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 ring-luna-purple/35"
                  />
                ))}
              </div>
            ))}
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-200">{copy.groundingHint}</p>
        </article>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <article className={`${panelClass} dark:from-[#040811]/98 dark:via-[#050b16]/97 dark:to-[#040913]/96 space-y-4`}>
          <h3 className="text-xl font-black tracking-tight">{copy.toolsTitle}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a href="tel:911" className="px-4 py-3 rounded-xl bg-rose-600 text-white text-center text-[11px] font-black uppercase tracking-[0.2em] hover:bg-rose-700 transition-colors">{copy.call911}</a>
            <a href="tel:988" className="px-4 py-3 rounded-xl bg-rose-100 dark:bg-rose-950/70 border border-rose-300/60 dark:border-rose-700/70 text-rose-700 dark:text-rose-200 text-center text-[11px] font-black uppercase tracking-[0.2em] hover:bg-rose-200/80 dark:hover:bg-rose-900/70 transition-colors">{copy.call988}</a>
            <button onClick={copyMessage} className="sm:col-span-2 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-[11px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-100 hover:text-luna-purple transition-colors">
              {copy.copyMessage}
            </button>
          </div>
          {copyFeedback && <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-300">{copyFeedback}</p>}
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-200">{copy.toolsHint}</p>
        </article>

        <article className={`${panelClass} space-y-4`}>
          <h3 className="text-xl font-black tracking-tight">{copy.checklistTitle}</h3>
          <div className="space-y-2">
            {copy.checklist.map((item, idx) => (
              <label key={item} className={`flex items-center gap-3 ${innerCardClass} p-3 cursor-pointer`}>
                <input
                  type="checkbox"
                  checked={Boolean(steps[idx])}
                  onChange={() => setSteps((prev) => prev.map((v, i) => (i === idx ? !v : v)))}
                  className="accent-luna-purple"
                />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-100">{item}</span>
              </label>
            ))}
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 dark:text-slate-100">{copy.noteTitle}</p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={copy.notePlaceholder}
              className="w-full min-h-28 rounded-2xl border border-slate-200 dark:border-slate-600 bg-white/90 dark:bg-slate-950/90 p-4 text-sm font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 ring-luna-purple/35"
            />
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-200">{copy.checklistHint}</p>
        </article>
      </div>

      <article className={`${panelClass} dark:from-[#040811]/98 dark:via-[#050b16]/97 dark:to-[#040913]/96 space-y-4`}>
        <h3 className="text-xl font-black tracking-tight">{copy.commentsTitle}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {copy.comments.map((item) => (
            <div key={`${item.author}-${item.quote.slice(0, 12)}`} className={`${innerCardClass} space-y-2`}>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-100 italic leading-relaxed">“{item.quote}”</p>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-luna-purple">{item.author}</p>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
};
