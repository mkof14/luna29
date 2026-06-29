
import React from 'react';
import { motion } from 'motion/react';
import { CyclePhase } from '../types';
import { PHASE_INFO, LangCopy, getLang } from '../constants';
import { Language } from '../constants';
import PhaseIndicator from './PhaseIndicator';
import { JourneyProgress } from './JourneyProgress';
import {
  CYCLE_PHASE_NAMES,
  CYCLE_UI_COPY,
  CYCLE_LUNA_BALANCE_COPY,
  CYCLE_INNER_WEATHER_COPY,
  CYCLE_PHASE_SEASON_COPY,
  CYCLE_SENSITIVITY_LABELS,
} from '../utils/memberCoreI18n';

interface CycleTimelineProps {
  currentDay: number;
  onDayChange: (day: number) => void;
  lang?: Language;
  isDetailed?: boolean;
  onBack?: () => void;
}

const CycleTimeline: React.FC<CycleTimelineProps> = ({ currentDay, onDayChange, lang = 'en', isDetailed = false, onBack }) => {
  const currentPhase = currentDay <= 5 ? CyclePhase.MENSTRUAL : 
                       currentDay <= 12 ? CyclePhase.FOLLICULAR : 
                       currentDay <= 15 ? CyclePhase.OVULATORY : CyclePhase.LUTEAL;
  
  const info = PHASE_INFO[currentPhase];
  const scrubberPos = `${((currentDay - 1) / 27) * 100}%`;
  const phaseNamesByLang = CYCLE_PHASE_NAMES;
  const uiByLang = CYCLE_UI_COPY;
  const lunaBalanceByLang = CYCLE_LUNA_BALANCE_COPY;
  const innerWeatherByLang = CYCLE_INNER_WEATHER_COPY;
  const phaseSeasonByLang = CYCLE_PHASE_SEASON_COPY;
  const sensitivityByLang = CYCLE_SENSITIVITY_LABELS;
  const ui = getLang(uiByLang, lang);
  const lunaBalance = getLang(lunaBalanceByLang, lang) || lunaBalanceByLang.en;
  const innerWeather = getLang(innerWeatherByLang, lang) || innerWeatherByLang.en;

  return (
    <div className="w-full luna-page-shell luna-page-ritual animate-in fade-in duration-1000 space-y-8 p-8 md:p-10 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-24 -right-20 w-80 h-80 rounded-full bg-luna-purple/28 blur-[110px]" />
      <div className="pointer-events-none absolute bottom-10 -left-20 w-80 h-80 rounded-full bg-luna-teal/24 blur-[110px]" />
      <div className="pointer-events-none absolute top-1/3 left-1/3 w-72 h-72 rounded-full bg-luna-coral/20 blur-[120px]" />
      {onBack && (
        <button 
          onClick={onBack} 
          className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-luna-purple transition-all mb-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          {ui.back}
        </button>
      )}
      <JourneyProgress lang={lang} currentStep={2} />

      <div className="relative w-full h-40 mb-12 overflow-hidden bg-gradient-to-br from-[#faedf5]/88 via-[#eee3f2]/82 to-[#e2ebf8]/78 dark:from-slate-900/55 dark:to-slate-900/45 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-[0_18px_42px_rgba(91,74,131,0.2)] dark:shadow-[0_14px_34px_rgba(0,0,0,0.38)]">
        <svg viewBox="0 0 1000 200" className="absolute inset-0 w-full h-full preserve-3d" preserveAspectRatio="none">
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ec4899" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <path 
            d="M0,150 C150,150 250,50 400,50 C550,50 650,150 800,150 C950,150 1000,100 1000,100 L1000,200 L0,200 Z" 
            fill="url(#waveGradient)"
            className="animate-wave-flow"
          />
          <path 
            d="M0,150 C150,150 250,50 400,50 C550,50 650,150 800,150 C950,150 1000,100 1000,100" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5"
            strokeOpacity="0.1"
          />
          <line 
            x1={(currentDay / 28) * 1000} 
            y1="0" 
            x2={(currentDay / 28) * 1000} 
            y2="200" 
            stroke="currentColor" 
            strokeWidth="1" 
            strokeDasharray="4 4" 
            opacity="0.2"
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <span className="text-sm md:text-base font-black uppercase tracking-[0.2em] text-pink-500 mb-2 block">{ui.internalSeason}</span>
            <h3 className="text-3xl font-black uppercase tracking-tighter">{getLang(phaseSeasonByLang, lang)[currentPhase] || info.description}</h3>
          </div>
        </div>
      </div>

      <section className="rounded-[2.6rem] border border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-br from-[#f3e5f1]/94 via-[#e8e1f2]/92 to-[#dde9f7]/90 dark:from-[#07122c]/92 dark:via-[#0c1c3d]/90 dark:to-[#10264b]/88 p-7 md:p-8 shadow-[0_24px_56px_rgba(92,72,132,0.22)] dark:shadow-[0_22px_52px_rgba(0,0,0,0.45)] space-y-5">
        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-slate-900 dark:text-slate-100">{lunaBalance.title}</h2>
        <p className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">{lunaBalance.subtitle}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {lunaBalance.points.map((point) => (
            <div
              key={point}
              className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-700/70 p-4 text-center shadow-[0_12px_28px_rgba(94,76,136,0.2)] dark:shadow-[0_10px_24px_rgba(0,0,0,0.36)]"
              style={{
                backgroundImage: "url('/images/voice-journal-bg.webp')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(140deg,rgba(255,248,255,0.72),rgba(240,230,248,0.58),rgba(222,232,247,0.52))] dark:bg-[linear-gradient(140deg,rgba(8,13,29,0.7),rgba(13,24,47,0.64),rgba(18,34,63,0.58))]" />
              <p className="relative text-xs md:text-sm font-black uppercase tracking-[0.14em] text-slate-800 dark:text-slate-100">{point}</p>
            </div>
          ))}
        </div>
        <p className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">{lunaBalance.summary}</p>
      </section>

      <article className="rounded-[2.4rem] border border-slate-200/80 dark:border-slate-800/88 bg-gradient-to-br from-[#f5e9f3]/90 via-[#ece6f2]/86 to-[#e3ebf8]/82 dark:from-[#050f23]/95 dark:via-[#08162f]/93 dark:to-[#0c1f3f]/91 p-6 md:p-7 shadow-[0_18px_42px_rgba(91,73,130,0.18)] dark:shadow-[0_20px_44px_rgba(0,0,0,0.5)]">
        <p className="text-base md:text-lg font-black uppercase tracking-[0.2em] text-luna-purple mb-3">{innerWeather.title}</p>
        <p className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">{innerWeather.intro}</p>
        <ul className="mt-3 space-y-1">
          <li className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">• {innerWeather.points[0]}</li>
          <li className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">• {innerWeather.points[1]}</li>
          <li className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">• {innerWeather.points[2]}</li>
        </ul>
        <p className="mt-4 text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">
          {innerWeather.line1}
          <br />
          {innerWeather.line2}
        </p>
        <p className="mt-3 text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">
          {innerWeather.line3}
        </p>
      </article>

      <div className="space-y-16">
        <PhaseIndicator 
          phase={currentPhase}
          range={info.range}
          description={info.description}
          feeling={info.feeling}
        />

        <div className="space-y-10 bg-gradient-to-br from-[#f6ebf4]/84 via-[#ede5f2]/80 to-[#e4ecf8]/76 dark:from-slate-900/58 dark:via-slate-900/46 dark:to-slate-900/34 p-10 rounded-[3rem] border border-slate-200/80 dark:border-slate-800 shadow-[0_18px_42px_rgba(91,73,130,0.18)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.4)]">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm md:text-base font-black uppercase tracking-[0.2em] text-slate-400">{ui.cycleRegulator}</h4>
            <span className="px-4 py-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-[10px] font-black uppercase tracking-widest">{ui.day} {currentDay}</span>
          </div>
          
          <div className="relative h-20 flex items-center px-4">
            <input 
              type="range" 
              min="1" 
              max="28" 
              value={currentDay} 
              onChange={(e) => onDayChange(parseInt(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
            />
            
            {/* Track Background */}
            <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded-full relative overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-500 via-luna-purple to-indigo-500 transition-all duration-300"
                style={{ width: scrubberPos }}
              />
            </div>

            {/* Phase Markers on Track */}
            <div className="absolute inset-x-4 h-4 flex justify-between items-center pointer-events-none px-1">
               {[1, 6, 13, 16].map(day => (
                 <div key={day} className="w-1 h-1 bg-white/50 rounded-full" />
               ))}
            </div>

            {/* Handle */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-14 h-14 bg-white dark:bg-slate-900 border-[6px] border-slate-900 dark:border-slate-100 rounded-full shadow-2xl transition-all duration-300 z-20 flex items-center justify-center group"
              style={{ left: `calc(${scrubberPos} - 28px)`, marginLeft: '1rem' }}
            >
              <div className="flex flex-col items-center">
                <div className="flex gap-0.5 mb-1">
                  <div className="w-1 h-1 bg-slate-400 rounded-full animate-pulse" />
                  <div className="w-1 h-1 bg-slate-400 rounded-full animate-pulse delay-75" />
                  <div className="w-1 h-1 bg-slate-400 rounded-full animate-pulse delay-150" />
                </div>
                <span className="text-[11px] font-black leading-none">{currentDay}</span>
              </div>
              
              {/* Visual "Drag Me" Hint */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-slate-900 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md pointer-events-none">
                {ui.slideToAdjust}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 text-[9px] font-black text-slate-400 uppercase tracking-widest px-4 text-center">
            <div className={currentDay <= 5 ? 'text-pink-500' : ''}>{getLang(phaseNamesByLang, lang)[CyclePhase.MENSTRUAL]}</div>
            <div className={currentDay > 5 && currentDay <= 12 ? 'text-luna-purple' : ''}>{getLang(phaseNamesByLang, lang)[CyclePhase.FOLLICULAR]}</div>
            <div className={currentDay > 12 && currentDay <= 15 ? 'text-indigo-500' : ''}>{getLang(phaseNamesByLang, lang)[CyclePhase.OVULATORY]}</div>
            <div className={currentDay > 15 ? 'text-slate-900 dark:text-white' : ''}>{getLang(phaseNamesByLang, lang)[CyclePhase.LUTEAL]}</div>
          </div>
        </div>

        <article className="rounded-[2.6rem] border border-slate-200/80 dark:border-slate-800/88 bg-gradient-to-br from-[#f1e3ef]/92 via-[#e5e0ef]/90 to-[#dae5f5]/88 dark:from-[#061126]/94 dark:via-[#08162f]/92 dark:to-[#0d1f3c]/90 p-7 md:p-8 shadow-[0_20px_46px_rgba(92,73,132,0.18)] dark:shadow-[0_20px_44px_rgba(0,0,0,0.5)] space-y-3">
          <p className="text-sm md:text-base font-black uppercase tracking-[0.2em] text-luna-purple">{lunaBalance.appliedTitle}</p>
          <p className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">{lunaBalance.appliedBody}</p>
        </article>

        {isDetailed && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
             {Object.entries(info.sensitivity).map(([key, val], index) => {
               const icons: Record<string, string> = { mood: '🎭', energy: '⚡', social: '🤝' };
               const colors: Record<string, string> = { 
                 mood: 'from-rose-500/20 to-rose-500/5 border-rose-200/50 dark:border-rose-900/30 text-rose-600 dark:text-rose-400',
                 energy: 'from-amber-500/20 to-amber-500/5 border-amber-200/50 dark:border-amber-900/30 text-amber-600 dark:text-amber-400',
                 social: 'from-indigo-500/20 to-indigo-500/5 border-indigo-200/50 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400'
               };

               const glowColors: Record<string, string> = {
                 mood: 'bg-rose-500',
                 energy: 'bg-amber-500',
                 social: 'bg-indigo-500'
               };
               
               return (
                 <motion.div 
                   key={key}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: index * 0.1 }}
                   whileHover={{ y: -8, scale: 1.02 }}
                   className={`relative p-10 rounded-[3rem] border-2 bg-gradient-to-b shadow-xl flex flex-col items-center text-center gap-8 overflow-hidden group ${colors[key]}`}
                 >
                   {/* Background Glow */}
                   <div className={`absolute -bottom-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity ${glowColors[key]}`} />
                   
                   <motion.div 
                     whileHover={{ rotate: [0, -10, 10, 0] }}
                     className="w-24 h-24 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-5xl shadow-2xl border border-current/10 relative z-10"
                   >
                     {icons[key]}
                   </motion.div>

                   <div className="space-y-3 relative z-10">
                     <span className="text-sm font-black uppercase tracking-[0.22em] opacity-50 block">{key} {ui.mode}</span>
                     <p className="text-3xl font-black uppercase tracking-tighter leading-none">{getLang(sensitivityByLang, lang)[val] || val}</p>
                   </div>
                   
                   {/* Visual Meter */}
                   <div className="w-full space-y-3 relative z-10">
                     <div className="w-full h-2 bg-slate-200/50 dark:bg-slate-800/50 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ 
                            width: val === 'Full' || val === 'Radiant' || val === 'Outgoing' ? '100%' :
                                   val === 'Rising' || val === 'Bright' || val === 'Open' ? '70%' :
                                   val === 'Grounding' || val === 'Reflective' || val === 'Guarded' ? '40%' : '20%'
                          }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className="h-full bg-current shadow-[0_0_10px_rgba(0,0,0,0.1)]" 
                        />
                     </div>
                     <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest opacity-40">
                       <span>{ui.min}</span>
                       <span>{ui.peak}</span>
                     </div>
                   </div>

                   {/* Subtle Tip */}
                   <div className="pt-4 border-t border-current/10 w-full relative z-10">
                     <p className="text-[9px] font-bold uppercase tracking-wider opacity-70">
                       {val === 'Radiant' || val === 'Full' || val === 'Outgoing' ? ui.peakCapacity :
                        val === 'Reflective' || val === 'Guarded' ? ui.conserveEnergy : ui.steadyState}
                     </p>
                   </div>
                 </motion.div>
               );
             })}
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes wave-flow {
          0% { transform: translateX(0); }
          50% { transform: translateX(-10px); }
          100% { transform: translateX(0); }
        }
        .animate-wave-flow {
          animation: wave-flow 10s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default CycleTimeline;
