
import React from 'react';

interface LunaLiveButtonProps {
  onClick: () => void;
  isActive: boolean;
}

export const LunaLiveButton: React.FC<LunaLiveButtonProps> = ({ onClick, isActive }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-10 right-10 z-[350] group outline-none"
      aria-label="Luna29 Live Assistant"
    >
      {/* Outer Glow / Halo */}
      <div className={`absolute inset-[-20px] rounded-full blur-2xl transition-all duration-1000 ${isActive ? 'bg-luna-purple/40 opacity-100' : 'bg-luna-purple/5 opacity-0 group-hover:opacity-100'}`} />
      
      {/* Main Orb */}
      <div className={`relative w-[58px] h-[58px] md:w-[64px] md:h-[64px] rounded-full flex items-center justify-center transition-all duration-700 shadow-2xl border-2 ${isActive ? 'bg-slate-900 dark:bg-white border-luna-purple scale-110' : 'bg-white/95 dark:bg-slate-900 border-white dark:border-slate-800 group-hover:scale-105 animate-pulse'}`}>
        
        {/* Animated Waveform inside when active */}
        <div className="relative flex items-center justify-center">
          <span className={`absolute rounded-full bg-luna-purple/25 blur-md ${isActive ? 'inset-[-10px] animate-pulse' : 'inset-[-8px] animate-pulse'}`} />
          <img
            src="/images/luna-logo-transparent.webp"
            alt="Luna29 Live"
            className={`relative object-contain transition-transform duration-700 ${isActive ? 'h-[74px] w-[74px] md:h-[84px] md:w-[84px] scale-110' : 'h-[68px] w-[68px] md:h-[78px] md:w-[78px] group-hover:scale-110'}`}
          />
          <div className={`absolute rounded-full bg-luna-coral border-2 border-white dark:border-slate-900 animate-pulse ${isActive ? '-top-2 -right-2 w-5 h-5' : '-top-1 -right-1 w-4 h-4'}`} />
        </div>

        {/* Floating Label */}
        <div className="absolute right-full mr-6 top-1/2 -translate-y-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 pointer-events-none">
          <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl">
            Luna29 Live
          </div>
        </div>
      </div>

      {/* Radial Breathing Rings */}
      <div className="absolute inset-0 rounded-full border-2 border-luna-purple/25 animate-ping opacity-35" />
      <div className="absolute inset-[-14px] rounded-full border border-luna-teal/25 animate-pulse opacity-25" />
    </button>
  );
};
