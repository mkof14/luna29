
import React, { useState } from 'react';
import { HormoneData } from '../types';
import { Logo } from './Logo';
import { Language, LangCopy, getLang } from '../constants';
import { getLocalizedHormone } from '../utils/hormoneLocalization';
import { briefService } from '../services/briefService';
import { dataService } from '../services/dataService';

interface HormoneDetailProps {
  hormone: HormoneData;
  lang: Language;
  onClose: () => void;
}

const HormoneDetail: React.FC<HormoneDetailProps> = ({ hormone, lang, onClose }) => {
  const displayHormone = getLocalizedHormone(hormone, lang);
  const [briefFeedback, setBriefFeedback] = useState('');
  const copyByLang: LangCopy< {
    back: string; currentState: string; coreMarker: string; howItFeels: string; yourExperience: string; dailyImpact: string;
    howItWorks: string; whatItAffects: string; whatItAffectsSub: string; whatInfluences: string; whatInfluencesSub: string;
    talkToDoctor: string; talkToDoctorSub: string; questionsToAsk: string; doctorHint: string; addToBrief: string;
    privacy: string; privacySub: string; briefAdded: string; briefUpdated: string;
  }> = {
    en: { back: 'Back', currentState: 'Current State', coreMarker: 'Core Marker', howItFeels: 'How it feels', yourExperience: 'Your experience', dailyImpact: 'Daily impact', howItWorks: 'How it works', whatItAffects: 'What it affects', whatItAffectsSub: 'Where this marker signals changes.', whatInfluences: 'What influences this', whatInfluencesSub: 'Variables that shift this baseline.', talkToDoctor: 'Talk to your doctor', talkToDoctorSub: 'Structured vocabulary for your consultation.', questionsToAsk: 'Questions to ask', doctorHint: 'Use these questions to start clinical dialogue.', addToBrief: 'Add to Brief', privacy: 'Privacy Promise Active', privacySub: 'Luna29 is a digital mirror. This mapping is observational and reflects your reported patterns across your rhythm history.', briefAdded: 'Added to Brief', briefUpdated: 'Brief updated' },
    ru: { back: 'Назад', currentState: 'Текущее состояние', coreMarker: 'Ключевой маркер', howItFeels: 'Как ощущается', yourExperience: 'Ваш опыт', dailyImpact: 'Ежедневное влияние', howItWorks: 'Как это работает', whatItAffects: 'На что влияет', whatItAffectsSub: 'Где этот маркер отражает изменения.', whatInfluences: 'Что на это влияет', whatInfluencesSub: 'Факторы, сдвигающие этот baseline.', talkToDoctor: 'Обсудите с врачом', talkToDoctorSub: 'Структурированные формулировки для консультации.', questionsToAsk: 'Вопросы врачу', doctorHint: 'Используйте эти вопросы для клинического диалога.', addToBrief: 'Добавить в бриф', privacy: 'Режим приватности активен', privacySub: 'Luna29 — цифровое зеркало. Эта карта наблюдательная и отражает ваши паттерны по истории ритма.', briefAdded: 'Добавлено в бриф', briefUpdated: 'Бриф обновлен' },
    uk: { back: 'Назад', currentState: 'Поточний стан', coreMarker: 'Ключовий маркер', howItFeels: 'Як відчувається', yourExperience: 'Ваш досвід', dailyImpact: 'Щоденний вплив', howItWorks: 'Як це працює', whatItAffects: 'На що впливає', whatItAffectsSub: 'Де цей маркер показує зміни.', whatInfluences: 'Що на це впливає', whatInfluencesSub: 'Фактори, що зміщують цей baseline.', talkToDoctor: 'Обговоріть з лікарем', talkToDoctorSub: 'Структурована лексика для консультації.', questionsToAsk: 'Питання до лікаря', doctorHint: 'Використайте ці питання для клінічного діалогу.', addToBrief: 'Додати в бриф', privacy: 'Режим приватності активний', privacySub: 'Luna29 — цифрове дзеркало. Ця карта є спостережною і відображає ваші патерни ритму.', briefAdded: 'Додано у бриф', briefUpdated: 'Бриф оновлено' },
    es: { back: 'Atrás', currentState: 'Estado actual', coreMarker: 'Marcador clave', howItFeels: 'Cómo se siente', yourExperience: 'Tu experiencia', dailyImpact: 'Impacto diario', howItWorks: 'Cómo funciona', whatItAffects: 'Qué afecta', whatItAffectsSub: 'Dónde este marcador señala cambios.', whatInfluences: 'Qué lo influye', whatInfluencesSub: 'Variables que desplazan esta línea base.', talkToDoctor: 'Habla con tu médico', talkToDoctorSub: 'Vocabulario estructurado para tu consulta.', questionsToAsk: 'Preguntas para hacer', doctorHint: 'Usa estas preguntas para iniciar el diálogo clínico.', addToBrief: 'Añadir al resumen', privacy: 'Promesa de privacidad activa', privacySub: 'Luna29 es un espejo digital. Este mapa es observacional y refleja tus patrones reportados.', briefAdded: 'Anadido al resumen', briefUpdated: 'Resumen actualizado' },
    fr: { back: 'Retour', currentState: 'État actuel', coreMarker: 'Marqueur clé', howItFeels: 'Ressenti', yourExperience: 'Votre expérience', dailyImpact: 'Impact quotidien', howItWorks: 'Comment cela fonctionne', whatItAffects: 'Ce que cela affecte', whatItAffectsSub: 'Là où ce marqueur signale des changements.', whatInfluences: "Ce qui l'influence", whatInfluencesSub: 'Variables qui déplacent cette ligne de base.', talkToDoctor: 'Parlez à votre médecin', talkToDoctorSub: 'Vocabulaire structuré pour votre consultation.', questionsToAsk: 'Questions à poser', doctorHint: 'Utilisez ces questions pour lancer le dialogue clinique.', addToBrief: 'Ajouter au brief', privacy: 'Promesse de confidentialité active', privacySub: 'Luna29 est un miroir numérique. Cette cartographie est observationnelle et reflète vos schémas déclarés.', briefAdded: 'Ajoute au brief', briefUpdated: 'Brief mis a jour' },
    de: { back: 'Zurück', currentState: 'Aktueller Zustand', coreMarker: 'Kernmarker', howItFeels: 'Wie es sich anfühlt', yourExperience: 'Deine Erfahrung', dailyImpact: 'Tägliche Wirkung', howItWorks: 'Wie es wirkt', whatItAffects: 'Was es beeinflusst', whatItAffectsSub: 'Wo dieser Marker Veränderungen signalisiert.', whatInfluences: 'Was das beeinflusst', whatInfluencesSub: 'Variablen, die diese Basislinie verschieben.', talkToDoctor: 'Mit dem Arzt besprechen', talkToDoctorSub: 'Strukturierte Sprache für deine Konsultation.', questionsToAsk: 'Fragen an den Arzt', doctorHint: 'Nutze diese Fragen für den klinischen Dialog.', addToBrief: 'Zum Brief hinzufügen', privacy: 'Datenschutz aktiv', privacySub: 'Luna29 ist ein digitaler Spiegel. Diese Abbildung ist beobachtend und spiegelt deine gemeldeten Muster.', briefAdded: 'Zum Brief hinzugefugt', briefUpdated: 'Brief aktualisiert' },
    zh: { back: '返回', currentState: '当前状态', coreMarker: '核心指标', howItFeels: '主观感受', yourExperience: '你的体验', dailyImpact: '日常影响', howItWorks: '作用机制', whatItAffects: '影响范围', whatItAffectsSub: '该指标在哪些方面提示变化。', whatInfluences: '影响因素', whatInfluencesSub: '会改变该基线的变量。', talkToDoctor: '与医生沟通', talkToDoctorSub: '用于就诊沟通的结构化表达。', questionsToAsk: '可提问的问题', doctorHint: '使用这些问题开启临床沟通。', addToBrief: '加入简报', privacy: '隐私承诺已启用', privacySub: 'Luna29 是数字镜像工具。该映射用于观察，反映你记录的节律模式。', briefAdded: '已加入简报', briefUpdated: '简报已更新' },
    ja: { back: '戻る', currentState: '現在の状態', coreMarker: 'コアマーカー', howItFeels: '体感', yourExperience: 'あなたの体験', dailyImpact: '日常への影響', howItWorks: '仕組み', whatItAffects: '影響する領域', whatItAffectsSub: 'このマーカーが変化を示す領域です。', whatInfluences: '影響要因', whatInfluencesSub: 'このベースラインを動かす要因。', talkToDoctor: '医師に相談', talkToDoctorSub: '受診時に使える構造化された語彙。', questionsToAsk: '確認したい質問', doctorHint: 'これらの質問で臨床対話を始めましょう。', addToBrief: 'ブリーフに追加', privacy: 'プライバシー保護有効', privacySub: 'Luna29はデジタルミラーです。このマッピングは観察目的で、記録されたパターンを反映します。', briefAdded: 'ブリーフに追加しました', briefUpdated: 'ブリーフを更新しました' },
    pt: { back: 'Voltar', currentState: 'Estado atual', coreMarker: 'Marcador central', howItFeels: 'Como se sente', yourExperience: 'Sua experiência', dailyImpact: 'Impacto diário', howItWorks: 'Como funciona', whatItAffects: 'O que afeta', whatItAffectsSub: 'Onde este marcador sinaliza mudanças.', whatInfluences: 'O que influencia isso', whatInfluencesSub: 'Variáveis que alteram essa linha de base.', talkToDoctor: 'Converse com seu médico', talkToDoctorSub: 'Vocabulário estruturado para sua consulta.', questionsToAsk: 'Perguntas para fazer', doctorHint: 'Use essas perguntas para iniciar o diálogo clínico.', addToBrief: 'Adicionar ao resumo', privacy: 'Promessa de privacidade ativa', privacySub: 'Luna29 é um espelho digital. Este mapeamento é observacional e reflete seus padrões reportados.', briefAdded: 'Adicionado ao resumo', briefUpdated: 'Resumo atualizado' },
  };
  const statusByLang: LangCopy< Record<string, string>> = {
    en: { Steady: 'Steady', Sensitive: 'Sensitive', Stressed: 'Stressed', Changing: 'Changing', Active: 'Active', Quiet: 'Quiet' },
    ru: { Steady: 'Стабильно', Sensitive: 'Чувствительно', Stressed: 'Напряженно', Changing: 'Меняется', Active: 'Активно', Quiet: 'Спокойно' },
    uk: { Steady: 'Стабільно', Sensitive: 'Чутливо', Stressed: 'Напружено', Changing: 'Змінюється', Active: 'Активно', Quiet: 'Спокійно' },
    es: { Steady: 'Estable', Sensitive: 'Sensible', Stressed: 'En estrés', Changing: 'Cambiando', Active: 'Activo', Quiet: 'Calmo' },
    fr: { Steady: 'Stable', Sensitive: 'Sensible', Stressed: 'Stressé', Changing: 'En changement', Active: 'Actif', Quiet: 'Calme' },
    de: { Steady: 'Stabil', Sensitive: 'Sensibel', Stressed: 'Gestresst', Changing: 'Verändert sich', Active: 'Aktiv', Quiet: 'Ruhig' },
    zh: { Steady: '稳定', Sensitive: '敏感', Stressed: '压力状态', Changing: '变化中', Active: '活跃', Quiet: '平静' },
    ja: { Steady: '安定', Sensitive: '敏感', Stressed: 'ストレス状態', Changing: '変化中', Active: '活性', Quiet: '静穏' },
    pt: { Steady: 'Estável', Sensitive: 'Sensível', Stressed: 'Estressado', Changing: 'Mudando', Active: 'Ativo', Quiet: 'Calmo' },
  };
  const copy = getLang(copyByLang, lang);
  const handleAddToBrief = () => {
    const result = briefService.addHormone(displayHormone);
    dataService.logEvent('INSIGHT_GENERATED', {
      source: 'hormone_detail',
      action: 'add_to_brief',
      hormoneId: displayHormone.id,
      questionCount: displayHormone.generalDoctorQuestions.length,
    });
    setBriefFeedback(result.created ? copy.briefAdded : copy.briefUpdated);
    window.setTimeout(() => setBriefFeedback(''), 1800);
  };
  return (
    <div data-testid="hormone-detail" className="fixed inset-0 z-[250] bg-slate-50/98 dark:bg-slate-950/98 backdrop-blur-2xl overflow-y-auto animate-in slide-in-from-bottom duration-700 ease-out no-scrollbar">
      {/* STICKY HEADER */}
      <nav className="sticky top-0 bg-white/60 dark:bg-slate-950/60 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/50 px-8 py-5 flex justify-between items-center z-[260] shadow-sm">
        <button 
          data-testid="hormone-detail-back"
          onClick={onClose} 
          className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 hover:text-luna-purple transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          {copy.back}
        </button>
        
        <div className="flex items-center gap-4">
           <div className="flex flex-col items-end">
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{copy.currentState}</span>
             <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{getLang(statusByLang, lang)[displayHormone.status] || displayHormone.status}</span>
           </div>
           <div className="w-3 h-3 rounded-full animate-status-pulse shadow-[0_0_15px_rgba(0,0,0,0.1)]" style={{ backgroundColor: hormone.color, boxShadow: `0 0 20px ${hormone.color}88` }} />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-16 pb-32 space-y-20 relative">
        {/* HERO SECTION */}
        <header className="space-y-12 animate-in fade-in slide-in-from-top-4 duration-1000 fill-mode-both">
          <div className="flex flex-col md:flex-row md:items-end gap-10">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-rose-400/10 to-purple-400/10 rounded-[3.5rem] blur-2xl group-hover:blur-3xl transition-all" />
              <div className="relative z-10 text-8xl p-12 bg-white dark:bg-slate-900 rounded-[3.5rem] w-fit shadow-luna-deep border border-slate-200 dark:border-slate-800 flex items-center justify-center animate-float">
                {hormone.icon}
              </div>
            </div>
            <div className="space-y-3 pb-2 text-center md:text-left">
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-950 dark:text-slate-100 leading-none">{displayHormone.name}</h1>
              <div className="flex items-center justify-center md:justify-start gap-3">
                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[9px] font-black uppercase text-slate-500 tracking-widest border border-slate-200 dark:border-slate-700">
                  ID: {displayHormone.id.toUpperCase()}
                </span>
                <div className="h-px w-12 bg-slate-200 dark:bg-slate-800" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{copy.coreMarker}</span>
              </div>
            </div>
          </div>
          
          <div className="relative animate-in fade-in duration-1000 delay-300 fill-mode-both">
            <p className="text-3xl md:text-5xl font-medium italic text-slate-800 dark:text-slate-200 leading-[1.1] max-w-3xl border-l-[8px] border-luna-purple pl-10 py-2">
              "{displayHormone.description}"
            </p>
          </div>
        </header>

        {/* EXPERIENCE CARDS */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 fill-mode-both">
          <div className="group space-y-6 p-10 bg-white dark:bg-slate-900 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-luna-rich hover:shadow-luna-deep transition-all hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: hormone.color }} />
              <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.3em]">{copy.howItFeels}</h3>
            </div>
            <p className="text-2xl leading-relaxed text-slate-900 dark:text-slate-100 italic font-bold">
              {displayHormone.imbalanceFeeling}
            </p>
            <div className="pt-4 flex items-center justify-between">
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{copy.yourExperience}</span>
              <div className="text-xs opacity-20">👁️</div>
            </div>
          </div>

          <div className="group space-y-6 p-10 bg-white dark:bg-slate-900 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-luna-rich hover:shadow-luna-deep transition-all hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-8 rounded-full opacity-30" style={{ backgroundColor: hormone.color }} />
              <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.3em]">{copy.dailyImpact}</h3>
            </div>
            <p className="text-2xl leading-relaxed text-slate-900 dark:text-slate-100 font-bold">
              {displayHormone.dailyImpact}
            </p>
            <div className="pt-4 flex items-center justify-between">
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{copy.howItWorks}</span>
              <div className="text-xs opacity-20">⚙️</div>
            </div>
          </div>
        </section>

        {/* SYSTEMIC INFLUENCE GRID */}
        <section className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-700 fill-mode-both">
           <div className="text-center space-y-3">
              <h3 className="text-[11px] font-black uppercase text-slate-500 tracking-[0.5em]">{copy.whatItAffects}</h3>
              <p className="text-sm font-medium text-slate-400 italic">{copy.whatItAffectsSub}</p>
           </div>
           <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {displayHormone.affects.map((area, idx) => (
                <div key={idx} className="p-8 bg-white dark:bg-slate-900/40 rounded-[2.5rem] border border-slate-200 dark:border-slate-800/50 hover:border-luna-purple transition-all group flex flex-col items-center text-center space-y-4 shadow-sm hover:shadow-md">
                   <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-lg shadow-inner group-hover:rotate-6 transition-transform">📍</div>
                   <p className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">{area}</p>
                </div>
              ))}
           </div>
        </section>

        {/* STATE INFLUENCERS (DRIVERS) */}
        <section className="p-12 bg-slate-950 dark:bg-slate-100 text-white dark:text-slate-900 rounded-[4rem] space-y-12 shadow-luna-deep animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-900 fill-mode-both overflow-hidden relative">
           <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[size:24px_24px]" />
           
           <div className="text-center space-y-3 relative z-10">
              <h3 className="text-[11px] font-black uppercase opacity-50 tracking-[0.4em]">{copy.whatInfluences}</h3>
              <p className="text-lg font-bold italic">{copy.whatInfluencesSub}</p>
           </div>
           
           <div className="flex flex-wrap justify-center gap-4 relative z-10">
              {displayHormone.drivers.map((driver, idx) => (
                <span key={idx} className="px-8 py-4 bg-white/10 dark:bg-black/5 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 dark:border-black/5 hover:bg-white/20 transition-all cursor-default">
                   {driver}
                </span>
              ))}
           </div>
        </section>

        {/* DOCTOR PREPARATION (HIGH CONTRAST) */}
        <section className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-[1100ms] fill-mode-both">
          <div className="text-center space-y-3">
            <h3 className="text-[11px] font-black uppercase text-slate-500 tracking-[0.4em]">{copy.talkToDoctor}</h3>
            <p className="text-sm font-medium text-slate-400 italic">{copy.talkToDoctorSub}</p>
          </div>
          
          <div className="p-12 bg-white dark:bg-slate-900 border-[6px] border-slate-950 dark:border-slate-100 rounded-[4rem] space-y-12 shadow-luna-deep relative group">
             <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-9xl group-hover:scale-110 transition-transform">📋</div>
             
             <div className="space-y-8 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-950 dark:bg-slate-100 flex items-center justify-center text-white dark:text-slate-950 text-sm shadow-lg">?</div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{copy.questionsToAsk}</h4>
                </div>
                
                <div className="grid grid-cols-1 gap-8">
                  {displayHormone.generalDoctorQuestions.map((q, i) => (
                    <div key={i} className="flex gap-8 items-start group/q">
                       <span className="w-12 h-12 flex-shrink-0 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-black group-hover/q:bg-luna-purple group-hover/q:text-white transition-all shadow-sm">{i+1}</span>
                       <p className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 group-hover/q:translate-x-1 transition-transform leading-relaxed">
                         "{q}"
                       </p>
                    </div>
                  ))}
                </div>
             </div>
             
             <div className="pt-10 border-t-2 border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-center md:text-left">
                  {copy.doctorHint}
                </p>
                <button
                  data-testid="hormone-add-to-brief"
                  type="button"
                  onClick={handleAddToBrief}
                  className="px-10 py-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-luna-purple hover:text-white transition-all shadow-sm"
                >
                  {copy.addToBrief}
                </button>
             </div>
             {briefFeedback && (
               <p data-testid="hormone-add-feedback" className="text-[10px] font-black uppercase tracking-[0.15em] text-luna-purple">
                 {briefFeedback}
               </p>
             )}
          </div>
        </section>
        
        <footer className="text-center pt-24 border-t border-slate-200 dark:border-slate-800 space-y-4">
           <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.6em] animate-pulse">{copy.privacy}</p>
           <p className="text-xs text-slate-500 italic max-w-sm mx-auto leading-relaxed">
             {copy.privacySub}
           </p>
        </footer>
      </div>
    </div>
  );
};

export default HormoneDetail;
