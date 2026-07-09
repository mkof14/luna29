/**
 * LEGACY — Task 10: SAFE TO DELETE.
 * Orphaned rhythm-history strip. Zero Member Zone importers.
 * Not related to Task 5 pattern candidates or Today pattern experience.
 */
import React from 'react';

interface PatternDay {
  id: string;
  color: string;
  intensity: number; // 0 to 1
}

interface PatternStripProps {
  days: PatternDay[];
  label: string;
}

export const PatternStrip: React.FC<PatternStripProps> = ({ days, label }) => {
  return (
    <div className="w-full space-y-8 py-4">
      <div className="flex justify-between items-center">
        <span className="text-[12px] font-black uppercase text-slate-800 dark:text-slate-400 tracking-[0.5em]">
          {label}
        </span>
        <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-700 tracking-[0.3em]">
          Rhythm History
        </span>
      </div>
      
      <div className="flex justify-between items-center gap-3 md:gap-6 overflow-x-auto no-scrollbar pb-6">
        {days.map((day, i) => (
          <div 
            key={day.id} 
            className="flex-shrink-0 flex flex-col items-center space-y-3 animate-in fade-in slide-in-from-right-3"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div 
              className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white dark:border-slate-800 transition-all duration-700 hover:scale-125 cursor-help shadow-md"
              style={{ 
                backgroundColor: day.color,
                opacity: 0.6 + (day.intensity * 0.4),
                boxShadow: `0 8px 20px -4px ${day.color}66`
              }}
            />
          </div>
        ))}
      </div>
      
      <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
    </div>
  );
};
