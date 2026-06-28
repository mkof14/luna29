import React from 'react';

export const SystemLogicView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const principles = [
    { title: "Deterministic Core", text: "Luna29 uses established physiological rules to map subjective sensations (like energy levels and temperature) to probable hormonal states." },
    { title: "Temporal Synchronization", text: "Every data point is weighted by your current cycle day, ensuring your map reflects the natural seasonal shifts of your body." },
    { title: "Privacy First", text: "The system operates as a closed loop. All logic evaluation occur on your device, never in the cloud." },
  ];

  return (
    <article className="max-w-4xl mx-auto space-y-16 animate-in fade-in duration-1000 pb-32">
      <button onClick={onBack} className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-luna-purple transition-all">← Home</button>
      
      <header className="space-y-6">
        <h2 className="text-5xl font-black tracking-tight uppercase">System Logic</h2>
        <p className="text-xl text-slate-500 italic font-bold">Understanding the framework behind the mirror.</p>
      </header>

      <div className="grid grid-cols-1 gap-12">
        {principles.map((p, i) => (
          <div key={i} className="p-12 bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-luna border-2 border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-10 items-start">
            <span className="text-5xl opacity-20 font-black">0{i+1}</span>
            <div className="space-y-4">
              <h3 className="text-2xl font-black uppercase tracking-tight">{p.title}</h3>
              <p className="text-lg font-medium text-slate-600 dark:text-slate-400 leading-relaxed italic">{p.text}</p>
            </div>
          </div>
        ))}
      </div>

      <footer className="p-12 bg-slate-900 text-white rounded-[4rem] text-center space-y-6 shadow-xl">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60">Professional Standard</p>
        <p className="text-2xl font-bold leading-tight uppercase tracking-tighter">Luna29 is a synthesis of subjective observation and biological rhythm science.</p>
      </footer>
    </article>
  );
};
