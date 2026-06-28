
import React from 'react';
import { Logo } from './Logo';
import { PricingCopy } from '../types/uiCopy';

interface PricingViewProps {
  ui: PricingCopy;
  onSelect: (tier: 'monthly' | 'yearly') => void;
}

export const PricingView: React.FC<PricingViewProps> = ({ ui, onSelect }) => {
  const pillars = [
    { icon: '🔒', title: 'Privacy by Design', desc: 'Health data stays on your device. You control what leaves it.' },
    { icon: '🧬', title: 'Clear Logic', desc: 'Deterministic rhythm mapping with optional AI context.' },
    { icon: '🎨', title: 'Calm Experience', desc: 'Wellness as observation, not overload.' }
  ];

  return (
    <div className="fixed inset-0 z-[500] bg-slate-50 dark:bg-slate-950 overflow-y-auto animate-in fade-in duration-700 overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-luna-purple/5 dark:bg-luna-purple/10 rounded-full blur-[120px] animate-blob-slow" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-luna-teal/5 dark:bg-luna-teal/10 rounded-full blur-[100px] animate-blob-reverse" />

      <div className="max-w-5xl mx-auto px-6 py-20 space-y-24 relative z-10">
        
        <header className="text-center space-y-8">
          <Logo size="lg" className="mx-auto" />
          <div className="space-y-4">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 dark:text-slate-100 uppercase leading-[0.9]">
              Reclaim Your <br/> <span className="text-luna-purple">Sovereignty.</span>
            </h2>
            <p className="text-xl font-medium text-slate-500 italic max-w-2xl mx-auto">Choose a plan to support private, independent health mapping.</p>
          </div>
        </header>

        {/* Value Pillars - Marketing Boost */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((p, i) => (
            <div key={i} className="p-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] border border-slate-100 dark:border-slate-800 text-center space-y-3">
              <span className="text-3xl block mb-2">{p.icon}</span>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em]">{p.title}</h4>
              <p className="text-xs font-bold text-slate-400 italic">{p.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-white dark:bg-slate-900 p-12 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-xl space-y-10 flex flex-col justify-between hover:-translate-y-2 transition-all duration-500 group">
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">{ui.pricing.monthly}</h3>
                <span className="text-[9px] font-black px-4 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 uppercase tracking-widest">Standard</span>
              </div>
              <div className="space-y-1">
                <span className="text-6xl font-black text-slate-900 dark:text-slate-100">{ui.pricing.monthlyPrice}</span>
                <p className="text-xs font-black uppercase text-slate-400 tracking-widest">{ui.pricing.perMonth}</p>
              </div>
              <ul className="space-y-4 pt-8 border-t border-slate-100 dark:border-slate-800">
                {ui.pricing.features.map((f: string, i: number) => (
                  <li key={i} className="flex gap-4 items-center text-sm font-medium text-slate-600 dark:text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-luna-teal shadow-lg shadow-luna-teal/40" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <button onClick={() => onSelect('monthly')} className="w-full py-6 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-black uppercase tracking-[0.3em] rounded-full hover:scale-[1.02] active:scale-95 transition-all mt-10 shadow-2xl">
              Start Monthly
            </button>
          </div>

          <div className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 p-12 rounded-[4rem] shadow-luna space-y-10 flex flex-col justify-between hover:-translate-y-2 transition-all duration-500 relative ring-8 ring-luna-purple/10 group overflow-hidden">
            <div className="absolute top-0 right-0 m-8 px-5 py-2 bg-luna-purple text-white rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse z-20">
              Save $30/Year
            </div>
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-luna-purple/20 blur-3xl rounded-full" />
            
            <div className="space-y-6 relative z-10">
              <div className="flex justify-between items-start">
                <h3 className="text-2xl font-black uppercase tracking-tight">{ui.pricing.yearly}</h3>
                <span className="text-[9px] font-black px-4 py-1.5 bg-white/10 dark:bg-black/10 rounded-full uppercase tracking-widest">Recommended</span>
              </div>
              <div className="space-y-1">
                <span className="text-6xl font-black">{ui.pricing.yearlyPrice}</span>
                <p className="text-xs font-black uppercase opacity-60 tracking-widest">{ui.pricing.perYear}</p>
              </div>
              <ul className="space-y-4 pt-8 border-t border-white/10 dark:border-black/10">
                {ui.pricing.features.map((f: string, i: number) => (
                  <li key={i} className="flex gap-4 items-center text-sm font-medium opacity-90">
                    <div className="w-1.5 h-1.5 rounded-full bg-luna-purple shadow-lg shadow-luna-purple/40" />
                    {f}
                  </li>
                ))}
                <li className="flex gap-4 items-center text-sm font-black text-luna-teal">
                  <div className="w-1.5 h-1.5 rounded-full bg-luna-teal shadow-lg shadow-luna-teal/40" />
                  Free Security Audits
                </li>
              </ul>
            </div>
            <button onClick={() => onSelect('yearly')} className="w-full py-6 bg-luna-purple text-white font-black uppercase tracking-[0.3em] rounded-full hover:shadow-2xl hover:scale-[1.02] transition-all mt-10 shadow-2xl relative z-10">
              Unlock Full Circle
            </button>
          </div>
        </div>

        <footer className="text-center space-y-6 pt-10">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.4em]">Local-First Health Data • No Data Selling • Account Billing Only on Server</p>
          <div className="flex justify-center gap-8 opacity-40">
            <span className="text-[10px] font-black uppercase tracking-widest">You Control Export</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Non-Medical Clarity</span>
            <span className="text-[10px] font-black uppercase tracking-widest">7-Day Trial</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
