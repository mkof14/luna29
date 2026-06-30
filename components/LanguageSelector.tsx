import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../constants';
import { LANGUAGE_PICKER } from '../utils/languages';
import { LunaShimmerText } from './SmoothLangText';

interface LanguageSelectorProps {
  current: Language;
  onSelect: (lang: Language) => void;
  variant?: 'default' | 'footer';
  menuAlign?: 'left' | 'right';
  menuPlacement?: 'bottom' | 'top';
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  current,
  onSelect,
  variant = 'default',
  menuAlign = 'right',
  menuPlacement = 'bottom',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLang = LANGUAGE_PICKER.find(l => l.code === current) || LANGUAGE_PICKER[0];

  const isFooter = variant === 'footer';
  const menuPositionClass =
    menuPlacement === 'top'
      ? `bottom-full mb-3 ${menuAlign === 'left' ? 'left-0' : 'right-0'}`
      : `top-full mt-4 ${menuAlign === 'left' ? 'left-0' : 'right-0'}`;

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={
          isFooter
            ? 'group flex items-center gap-2.5 text-left text-[13px] font-light tracking-[0.03em] text-slate-800 dark:text-slate-300 hover:text-luna-purple transition-colors outline-none'
            : 'group flex items-center gap-3 px-4 py-2.5 rounded-full bg-gradient-to-br from-white/85 to-white/55 dark:from-slate-900/75 dark:to-slate-900/45 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/80 shadow-[0_4px_20px_rgba(15,23,42,0.08)] dark:shadow-[0_6px_22px_rgba(2,6,23,0.35)] transition-all hover:border-luna-purple/70 hover:shadow-[0_8px_28px_rgba(109,40,217,0.2)] hover:-translate-y-0.5 active:scale-95 outline-none'
        }
        aria-label="Change language"
        aria-expanded={isOpen}
      >
        <span className={isFooter ? 'text-base leading-none' : 'w-7 h-7 rounded-full bg-gradient-to-br from-luna-purple/25 via-indigo-400/20 to-sky-300/35 dark:from-luna-purple/30 dark:via-indigo-400/20 dark:to-cyan-300/20 flex items-center justify-center text-base shadow-inner'} aria-hidden="true">
          {currentLang.flag}
        </span>
        <span className={isFooter ? 'font-semibold' : 'text-[10px] font-black tracking-[0.2em] uppercase'}>
          <LunaShimmerText
            text={isFooter ? currentLang.native : currentLang.label}
            className={isFooter ? 'font-semibold opacity-75 group-hover:opacity-100' : 'opacity-90 group-hover:opacity-100 transition-opacity'}
          />
        </span>
        {isFooter && (
          <span className="text-[10px] text-slate-400 dark:text-slate-500 group-hover:text-luna-purple/70" aria-hidden="true">
            ▾
          </span>
        )}
      </button>

      {isOpen && (
        <div className={`absolute ${menuPositionClass} w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-100 dark:border-slate-800 shadow-2xl rounded-[2.5rem] overflow-hidden z-[1000] animate-in fade-in zoom-in-95 duration-300`}>
          <div className="p-4 space-y-1">
            <div className="px-5 py-3 mb-2 border-b border-slate-100 dark:border-slate-800">
               <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500">Select Language</span>
            </div>
            {LANGUAGE_PICKER.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  onSelect(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full px-5 py-4 text-left flex items-center justify-between rounded-2xl transition-all ${
                  current === lang.code 
                    ? 'bg-luna-purple/10 text-luna-purple' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-base leading-none" aria-hidden="true">{lang.flag}</span>
                  <div className="flex flex-col">
                  <span className="text-xs font-black uppercase tracking-widest">{lang.native}</span>
                  <span className="text-[9px] font-bold opacity-40 italic">{lang.full}</span>
                  </div>
                </div>
                {current === lang.code && (
                  <div className="w-1.5 h-1.5 rounded-full bg-luna-purple shadow-[0_0_10px_rgba(109,40,217,0.5)]" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
