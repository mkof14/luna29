import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export type AccordionItem = {
  title: string;
  body: string;
};

export type AccordionCategory = {
  title: string;
  intro?: string;
  items: AccordionItem[];
};

interface AccordionSectionsProps {
  categories: AccordionCategory[];
  openFirst?: boolean;
  variant?: 'default' | 'knowledge';
}

export const AccordionSections: React.FC<AccordionSectionsProps> = ({
  categories,
  openFirst = false,
  variant = 'default',
}) => {
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [openItems, setOpenItems] = useState<Record<string, boolean>>(() => {
    if (!openFirst || !categories[0]?.items.length) return {};
    return { '0-0': true } as Record<string, boolean>;
  });

  const activeCategory = categories[activeCategoryIndex] || categories[0];
  if (!activeCategory) return null;

  const isKnowledge = variant === 'knowledge';

  const toggleItem = (catIdx: number, itemIdx: number) => {
    const key = `${catIdx}-${itemIdx}`;
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <section className="space-y-8 md:space-y-10">
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2 md:gap-2.5">
          {categories.map((cat, idx) => {
            const isActive = idx === activeCategoryIndex;
            return (
              <button
                key={`${cat.title}-${idx}`}
                type="button"
                onClick={() => {
                  setActiveCategoryIndex(idx);
                  setOpenItems(openFirst ? { [`${idx}-0`]: true } : {});
                }}
                className={`px-4 py-2.5 rounded-full text-[10px] md:text-[11px] font-black uppercase tracking-[0.14em] transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-luna-purple to-violet-600 text-white shadow-luna-rich scale-[1.02]'
                    : 'bg-slate-100/90 dark:bg-slate-800/88 text-slate-700 dark:text-slate-100 border border-slate-300/75 dark:border-slate-500/45 hover:bg-slate-200 dark:hover:bg-slate-700/90 hover:border-luna-purple/35'
                }`}
              >
                {cat.title}
              </button>
            );
          })}
        </div>
      )}

      <article className="space-y-7 md:space-y-8">
        <div className="flex flex-col md:flex-row md:items-end gap-3 md:gap-6">
          <div className="flex items-center gap-4 shrink-0">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-luna-purple/10 text-sm font-black text-luna-purple">
              {String(activeCategoryIndex + 1).padStart(2, '0')}
            </span>
            <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-slate-100">{activeCategory.title}</h3>
          </div>
          <div className="hidden md:block flex-1 h-px bg-gradient-to-r from-slate-200 via-luna-purple/30 to-transparent dark:from-slate-700 dark:via-luna-purple/40" />
        </div>

        {activeCategory.intro && (
          <p className={`max-w-4xl leading-relaxed ${isKnowledge ? 'text-base md:text-lg text-slate-600 dark:text-slate-300 font-medium border-l-4 border-luna-purple/35 pl-5' : 'text-base md:text-lg text-slate-600 dark:text-slate-400 font-medium'}`}>
            {activeCategory.intro}
          </p>
        )}

        <div className="grid grid-cols-1 gap-3 md:gap-4">
          {activeCategory.items.map((item, j) => {
            const isOpen = openItems[`${activeCategoryIndex}-${j}`];
            return (
              <div
                key={`${item.title}-${j}`}
                className={`rounded-[1.8rem] md:rounded-[2rem] transition-all duration-400 overflow-hidden ${
                  isOpen
                    ? 'border-2 border-luna-purple/50 bg-gradient-to-br from-violet-50/80 via-white to-teal-50/40 dark:from-slate-900/80 dark:via-slate-900/60 dark:to-slate-800/40 shadow-luna-rich'
                    : 'border border-slate-200/90 dark:border-slate-700/80 bg-white/60 dark:bg-slate-900/35 hover:border-luna-purple/25 hover:shadow-md'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleItem(activeCategoryIndex, j)}
                  className="w-full p-5 md:p-7 flex items-start justify-between text-left group gap-4"
                  aria-expanded={isOpen}
                >
                  <span className={`text-base md:text-lg font-bold leading-snug pr-2 transition-colors ${isOpen ? 'text-luna-purple' : 'text-slate-800 dark:text-slate-100 group-hover:text-luna-purple'}`}>
                    {item.title}
                  </span>
                  <div className={`mt-0.5 w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all shrink-0 ${isOpen ? 'bg-luna-purple text-white rotate-180' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-luna-purple/10 group-hover:text-luna-purple'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.32, ease: [0.04, 0.62, 0.23, 0.98] }}
                    >
                      <div className="px-5 md:px-7 pb-6 md:pb-7">
                        <div className="h-px bg-gradient-to-r from-luna-purple/20 via-slate-200 to-transparent dark:via-slate-700 mb-5" />
                        <p className="text-[15px] md:text-base text-slate-600 dark:text-slate-300 font-medium leading-[1.75] whitespace-pre-line">{item.body}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </article>
    </section>
  );
};
