
import React, { useState } from 'react';
import { TRANSLATIONS, Language, LangCopy, getLang } from '../constants';
import { motion, AnimatePresence } from 'motion/react';

export const PartnerFAQView: React.FC<{ lang: Language; onBack: () => void }> = ({ lang, onBack }) => {
  const ui = TRANSLATIONS[lang];
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  type PartnerFaqItem = (typeof ui.bridge.partnerFAQ.items)[number];
  const copyByLang: LangCopy< {
    back: string;
    philosophy: string;
    quote: string;
    reportsTitle: string;
    reportsLead: string;
    reportsPoints: string[];
  }> = {
    en: {
      back: 'Back',
      philosophy: 'Luna29 Philosophy',
      quote: '"We believe that understanding biological context is the shortest path to empathy in relationships."',
      reportsTitle: 'How Partners Use My Health Reports',
      reportsLead: 'Reports help couples discuss health with less conflict: what changed, why it may happen, and what support is useful now.',
      reportsPoints: ['Use report language to discuss needs without blame.', 'Bring report to clinician and decide next tests together.', 'Share only ID/no name if privacy is needed.'],
    },
    ru: {
      back: 'Назад',
      philosophy: 'Философия Luna29',
      quote: '«Мы верим, что понимание биологического контекста - это самый короткий путь к эмпатии в отношениях».',
      reportsTitle: 'Как Партнеру Использовать My Health Reports',
      reportsLead: 'Отчеты помогают обсуждать здоровье без конфликтов: что изменилось, почему это могло случиться и какая поддержка нужна сейчас.',
      reportsPoints: ['Используйте язык отчета для разговора без обвинений.', 'Берите отчет к врачу и вместе решайте, какие анализы нужны дальше.', 'При необходимости делитесь только ID без имени.'],
    },
    uk: {
      back: 'Назад',
      philosophy: 'Філософія Luna29',
      quote: '«Ми віримо, що розуміння біологічного контексту - найкоротший шлях до емпатії у стосунках».',
      reportsTitle: 'Як Партнеру Користуватись My Health Reports',
      reportsLead: 'Звіти допомагають обговорювати здоровʼя без конфлікту: що змінилось, чому це могло статися і яка підтримка потрібна зараз.',
      reportsPoints: ['Використовуйте мову звіту для розмови без звинувачень.', 'Беріть звіт до лікаря й разом вирішуйте наступні аналізи.', 'За потреби діліться лише ID без імені.'],
    },
    es: {
      back: 'Atrás',
      philosophy: 'Filosofía Luna29',
      quote: '"Creemos que comprender el contexto biológico es el camino más corto hacia la empatía en las relaciones."',
      reportsTitle: 'Cómo La Pareja Usa My Health Reports',
      reportsLead: 'El reporte facilita conversaciones sin fricción: qué cambió, por qué pudo pasar y qué apoyo conviene ahora.',
      reportsPoints: ['Usa el lenguaje del reporte para hablar sin culpas.', 'Llévenlo a consulta y definan próximos estudios juntos.', 'Comparte solo ID/sin nombre si necesitas privacidad.'],
    },
    fr: {
      back: 'Retour',
      philosophy: 'Philosophie Luna29',
      quote: '"Nous croyons que comprendre le contexte biologique est le chemin le plus court vers l’empathie dans les relations."',
      reportsTitle: 'Comment Le Couple Utilise My Health Reports',
      reportsLead: 'Le rapport aide à parler de santé sans tension: ce qui a changé, pourquoi et quel soutien est utile maintenant.',
      reportsPoints: ['Utilisez le rapport pour dialoguer sans reproches.', 'Apportez-le en consultation pour planifier les examens.', 'Partagez uniquement l ID si la confidentialité est prioritaire.'],
    },
    de: {
      back: 'Zurück',
      philosophy: 'Luna29 Philosophie',
      quote: '"Wir glauben, dass das Verständnis des biologischen Kontexts der kürzeste Weg zu Empathie in Beziehungen ist."',
      reportsTitle: 'Wie Partner My Health Reports Nutzen',
      reportsLead: 'Berichte helfen bei ruhigen Gesprächen: was sich geändert hat, warum es so sein kann und welche Unterstützung jetzt passt.',
      reportsPoints: ['Mit Berichtssprache ohne Vorwürfe sprechen.', 'Zum Arzttermin mitnehmen und nächste Tests gemeinsam planen.', 'Bei Bedarf nur ID ohne Namen teilen.'],
    },
    zh: {
      back: '返回',
      philosophy: 'Luna29 理念',
      quote: '“我们相信，理解生理背景是通往关系共情的最短路径。”',
      reportsTitle: '伴侣如何使用 My Health Reports',
      reportsLead: '报告让沟通更平稳：发生了什么变化、可能原因、当下需要怎样的支持。',
      reportsPoints: ['用报告语言沟通，减少指责。', '带去就医沟通，一起决定下一步检查。', '如需隐私，可仅分享 ID 不含姓名。'],
    },
    ja: {
      back: '戻る',
      philosophy: 'Luna29の哲学',
      quote: '「生物学的な文脈を理解することが、関係性における共感への最短ルートだと私たちは考えています。」',
      reportsTitle: 'パートナー向け My Health Reports 活用',
      reportsLead: 'レポートにより、何が変化し、なぜ起こり得るか、今どんな支援が有効かを落ち着いて話せます。',
      reportsPoints: ['責めずに話すための共通言語として使う。', '受診時に持参し、次の検査を一緒に決める。', '必要ならIDのみ共有してプライバシーを守る。'],
    },
    pt: {
      back: 'Voltar',
      philosophy: 'Filosofia Luna29',
      quote: '"Acreditamos que compreender o contexto biológico é o caminho mais curto para a empatia nos relacionamentos."',
      reportsTitle: 'Como O Parceiro Usa My Health Reports',
      reportsLead: 'O relatório facilita conversas sem conflito: o que mudou, por que pode ter ocorrido e qual apoio faz sentido agora.',
      reportsPoints: ['Use a linguagem do relatório para conversar sem culpa.', 'Levem o relatório à consulta e definam próximos exames juntos.', 'Compartilhe só ID/sem nome quando precisar de privacidade.'],
    },
  ar: {
      back: 'Back',
      philosophy: 'Luna29 Philosophy',
      quote: '"We believe that understanding biological context is the shortest path to empathy in relationships."',
      reportsTitle: 'How Partners Use My Health Reports',
      reportsLead: 'Reports help couples discuss health with less conflict: what changed, why it may happen, and what support is useful now.',
      reportsPoints: ['Use report language to discuss needs without blame.', 'Bring report to clinician and decide next tests together.', 'Share only ID/no name if privacy is needed.'],
    },
  he: {
      back: 'Back',
      philosophy: 'Luna29 Philosophy',
      quote: '"We believe that understanding biological context is the shortest path to empathy in relationships."',
      reportsTitle: 'How Partners Use My Health Reports',
      reportsLead: 'Reports help couples discuss health with less conflict: what changed, why it may happen, and what support is useful now.',
      reportsPoints: ['Use report language to discuss needs without blame.', 'Bring report to clinician and decide next tests together.', 'Share only ID/no name if privacy is needed.'],
    },};
  const copy = getLang(copyByLang, lang);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto luna-page-shell luna-page-partner space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 p-8 md:p-10 pb-40">
      <header className="flex justify-between items-center">
        <button onClick={onBack} className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-luna-purple transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          {copy.back}
        </button>
        <div className="px-4 py-1.5 bg-luna-purple/10 rounded-full border border-luna-purple/20">
          <span className="text-[10px] font-black uppercase text-luna-purple tracking-widest">{ui.bridge.partnerFAQ.title}</span>
        </div>
      </header>

      <div className="text-center space-y-4">
        <h2 className="text-5xl font-black tracking-tight uppercase">{ui.bridge.partnerFAQ.title}</h2>
        <p className="text-sm font-medium text-slate-400 uppercase tracking-[0.3em]">{ui.bridge.partnerFAQ.subtitle}</p>
      </div>

      <div className="space-y-4">
        {ui.bridge.partnerFAQ.items.map((item: PartnerFaqItem, idx: number) => (
          <div 
            key={idx} 
            className={`border-2 rounded-[2.5rem] transition-all duration-500 overflow-hidden ${openIndex === idx ? 'border-luna-purple luna-vivid-card shadow-luna-rich' : 'border-slate-100 dark:border-slate-800 luna-vivid-card-soft'}`}
          >
            <button 
              onClick={() => toggle(idx)}
              className="w-full p-8 md:p-10 flex items-center justify-between text-left group"
            >
              <span className={`text-xl md:text-2xl font-bold transition-colors ${openIndex === idx ? 'text-luna-purple' : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                {item.q}
              </span>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${openIndex === idx ? 'bg-luna-purple text-white rotate-180' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </div>
            </button>
            
            <AnimatePresence>
              {openIndex === idx && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                >
                  <div className="px-8 md:px-10 pb-10">
                    <div className="h-px bg-slate-100 dark:bg-slate-800 mb-8" />
                    <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium italic leading-relaxed">
                      "{item.a}"
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <article className="p-8 md:p-10 rounded-[2.5rem] border-2 border-luna-purple/30 luna-vivid-card-alt-4 shadow-[0_14px_34px_rgba(76,29,149,0.14)] space-y-4">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-luna-purple">My Health Reports</p>
        <h3 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">{copy.reportsTitle}</h3>
        <p className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">{copy.reportsLead}</p>
        <ul className="space-y-2">
          {copy.reportsPoints.map((point) => (
            <li key={point} className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">
              • {point}
            </li>
          ))}
        </ul>
      </article>

      <div className="p-12 luna-vivid-surface text-slate-900 dark:text-slate-100 rounded-[4rem] text-center space-y-6 shadow-2xl">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40">{copy.philosophy}</p>
        <p className="text-xl font-bold italic leading-tight max-w-2xl mx-auto">
          {copy.quote}
        </p>
      </div>
    </div>
  );
};
