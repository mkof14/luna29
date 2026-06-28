
import React from 'react';
import { UI_COPY, LangCopy, getLang } from '../constants';
import { Language } from '../constants';

interface Action {
  id: string;
  text: string;
  type: 'track' | 'discuss' | 'read';
}

export const NextActionsPanel: React.FC<{ actions: Action[]; lang?: Language }> = ({ actions, lang = 'en' }) => {
  const copyByLang: LangCopy< { balancedTitle: string; balancedBody: string; observation: string; note: string }> = {
    en: {
      balancedTitle: 'All systems are in balance',
      balancedBody: 'Today your body does not require any special observation prompts.',
      observation: 'Observation',
      note: 'These are not tasks, but themes for your inner dialogue.'
    },
    ru: {
      balancedTitle: 'Все системы в равновесии',
      balancedBody: 'Сегодня ваше тело не требует специальных запросов для наблюдения.',
      observation: 'Наблюдение',
      note: 'Это не задачи, а темы для вашего внутреннего диалога.'
    },
    uk: {
      balancedTitle: 'Усі системи в рівновазі',
      balancedBody: 'Сьогодні ваше тіло не потребує спеціальних запитів для спостереження.',
      observation: 'Спостереження',
      note: 'Це не задачі, а теми для вашого внутрішнього діалогу.'
    },
    es: {
      balancedTitle: 'Todos los sistemas en equilibrio',
      balancedBody: 'Hoy tu cuerpo no requiere solicitudes especiales de observación.',
      observation: 'Observación',
      note: 'No son tareas, son temas para tu diálogo interno.'
    },
    fr: {
      balancedTitle: 'Tous les systèmes sont équilibrés',
      balancedBody: "Aujourd'hui, votre corps ne nécessite pas de demandes particulières d'observation.",
      observation: 'Observation',
      note: "Ce ne sont pas des tâches, mais des thèmes pour votre dialogue intérieur."
    },
    de: {
      balancedTitle: 'Alle Systeme im Gleichgewicht',
      balancedBody: 'Heute benötigt dein Körper keine besonderen Beobachtungsimpulse.',
      observation: 'Beobachtung',
      note: 'Das sind keine Aufgaben, sondern Themen für deinen inneren Dialog.'
    },
    zh: {
      balancedTitle: '系统处于平衡状态',
      balancedBody: '今天你的身体不需要额外的观察提示。',
      observation: '观察',
      note: '这些不是任务，而是你内在对话的主题。'
    },
    ja: {
      balancedTitle: 'すべてのシステムは安定しています',
      balancedBody: '今日は特別な観察プロンプトは必要ありません。',
      observation: '観察',
      note: 'これはタスクではなく、内なる対話のテーマです。'
    },
    pt: {
      balancedTitle: 'Todos os sistemas em equilíbrio',
      balancedBody: 'Hoje seu corpo não requer solicitações especiais de observação.',
      observation: 'Observação',
      note: 'Isto não são tarefas, mas temas para seu diálogo interno.'
    }
  };
  const copy = getLang(copyByLang, lang);

  if (actions.length === 0) {
    return (
      <div className="py-12 px-8 border border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem] text-center">
        <p className="text-[10px] font-black uppercase text-slate-300 dark:text-slate-600 tracking-[0.4em] mb-2">{copy.balancedTitle}</p>
        <p className="text-[9px] text-slate-400 italic">{copy.balancedBody}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto">
      <h3 className="text-[10px] font-black uppercase text-slate-300 dark:text-slate-600 tracking-[0.4em] text-center mb-8">{UI_COPY.reflection.guidance}</h3>
      <div className="grid grid-cols-1 gap-4">
        {actions.map(action => (
          <div 
            key={action.id}
            className="w-full p-8 bg-white dark:bg-slate-900 border border-slate-50 dark:border-slate-800 rounded-[2rem] text-left flex items-center justify-between group hover:border-slate-200 dark:hover:border-slate-700 transition-all shadow-sm"
          >
            <div className="flex-1 pr-8">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300 italic leading-relaxed">"{action.text}"</span>
            </div>
            <div className="flex-none">
              <span className="text-[8px] px-3 py-1 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-black rounded-full uppercase tracking-widest">
                {copy.observation}
              </span>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[8px] text-center text-slate-300 uppercase tracking-widest mt-6">{copy.note}</p>
    </div>
  );
};
