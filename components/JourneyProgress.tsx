import React from 'react';
import { Language, LangCopy, getLang } from '../constants';

type JourneyStep = 1 | 2 | 3;

interface JourneyProgressProps {
  lang: Language;
  currentStep: JourneyStep;
}

const copyByLang: LangCopy< { title: string; steps: [string, string, string] }> = {
  en: { title: 'Member Path', steps: ['Home', 'Cycle', 'Bridge'] },
  ru: { title: 'Путь Внутри Luna29', steps: ['Home', 'Cycle', 'Bridge'] },
  uk: { title: 'Шлях Усередині Luna29', steps: ['Home', 'Cycle', 'Bridge'] },
  es: { title: 'Ruta De Miembro', steps: ['Home', 'Cycle', 'Bridge'] },
  fr: { title: 'Parcours Membre', steps: ['Home', 'Cycle', 'Bridge'] },
  de: { title: 'Mitgliederpfad', steps: ['Home', 'Cycle', 'Bridge'] },
  zh: { title: '成员路径', steps: ['Home', 'Cycle', 'Bridge'] },
  ja: { title: 'メンバーパス', steps: ['Home', 'Cycle', 'Bridge'] },
  pt: { title: 'Caminho Da Membro', steps: ['Home', 'Cycle', 'Bridge'] },
  ar: { title: 'Member Path', steps: ['Home', 'Cycle', 'Bridge'] },
  he: { title: 'Member Path', steps: ['Home', 'Cycle', 'Bridge'] },};

export const JourneyProgress: React.FC<JourneyProgressProps> = ({ lang, currentStep }) => {
  const copy = getLang(copyByLang, lang) || copyByLang.en;

  return (
    <section className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/75 dark:bg-slate-900/55 p-4 md:p-5 shadow-luna-rich">
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">{copy.title}</p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {copy.steps.map((label, index) => {
          const step = (index + 1) as JourneyStep;
          const isCurrent = step === currentStep;
          const isCompleted = step < currentStep;

          return (
            <div
              key={label}
              className={`rounded-2xl border px-3 py-3 text-center ${
                isCurrent
                  ? 'border-luna-purple bg-luna-purple/12'
                  : isCompleted
                  ? 'border-emerald-300/70 bg-emerald-50 dark:border-emerald-700/60 dark:bg-emerald-900/20'
                  : 'border-slate-200/80 bg-slate-50/80 dark:border-slate-700/80 dark:bg-slate-900/60'
              }`}
            >
              <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isCurrent ? 'text-luna-purple' : isCompleted ? 'text-emerald-600 dark:text-emerald-300' : 'text-slate-500 dark:text-slate-400'}`}>
                {step}/3
              </p>
              <p className="mt-1 text-xs md:text-sm font-black text-slate-800 dark:text-slate-100">{label}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
