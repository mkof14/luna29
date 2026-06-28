import React from 'react';
import { Language, LangCopy, getLang } from '../constants';
import { Logo } from './Logo';

interface StandaloneLaunchSplashProps {
  lang: Language;
}

export const StandaloneLaunchSplash: React.FC<StandaloneLaunchSplashProps> = ({ lang }) => {
  const copyByLang: LangCopy< { subtitle: string }> = {
    en: { subtitle: 'Women health understanding system' },
    ru: { subtitle: 'Система понимания женского здоровья' },
    uk: { subtitle: 'Система розуміння жіночого здоровʼя' },
    es: { subtitle: 'Sistema para comprender la salud femenina' },
    fr: { subtitle: 'Systeme de comprehension de la sante feminine' },
    de: { subtitle: 'System fur besseres Verstandnis der Frauengesundheit' },
    zh: { subtitle: '女性健康理解系统' },
    ja: { subtitle: '女性の健康理解システム' },
    pt: { subtitle: 'Sistema de entendimento da saude da mulher' },
    ar: { subtitle: 'نظام لفهم صحة المرأة' },
    he: { subtitle: 'מערכת להבנת בריאות האישה' },
  };
  const copy = getLang(copyByLang, lang) || copyByLang.en;

  return (
    <div className="fixed inset-0 z-[1400] md:hidden overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#171334] via-[#1d1a45] to-[#0e2c57]" />
      <div className="absolute -top-16 -left-12 h-64 w-64 rounded-full bg-luna-purple/40 blur-[80px]" />
      <div className="absolute top-1/3 -right-16 h-72 w-72 rounded-full bg-luna-teal/30 blur-[90px]" />
      <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-luna-coral/28 blur-[90px]" />

      <div className="relative h-full flex flex-col items-center justify-center px-6 text-center">
        <div className="animate-in fade-in zoom-in-95 duration-700 space-y-4">
          <Logo size="lg" className="text-8xl md:text-9xl text-white drop-shadow-[0_8px_22px_rgba(0,0,0,0.45)]" />
          <p className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-200/90">{copy.subtitle}</p>
        </div>
      </div>
    </div>
  );
};

