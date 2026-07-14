
import React, { useState } from 'react';
import { TRANSLATIONS, Language, LangCopy, getLang } from '../constants';
import { MemberIconBackButton } from './member/MemberIconBackButton';
import { LunaPageHeroSection } from './shared/LunaPageHeroSection';
import { LunaPageContentSection } from './shared/LunaPageContentSection';
import { PUBLIC_PAGE_STACK } from './public/publicPageStyles';
import { MEMBER_INNER_CARD, MEMBER_BODY_TEXT, MEMBER_PAGE_ROOT, MEMBER_SECTION_EYEBROW } from '../utils/memberPageStyles';
import { getLunaPageTheme } from '../utils/lunaPageThemes';
import { getMemberTabHeroCopy } from '../utils/memberTabHeroCopy';
import { getMemberHeroImage } from '../utils/memberHeroImages';
import { getPublicChromeCopy } from '../utils/publicChromeCopy';
import { motion, AnimatePresence } from 'motion/react';

export const PartnerFAQView: React.FC<{ lang: Language; onBack: () => void }> = ({ lang, onBack }) => {
  const ui = TRANSLATIONS[lang];
  const chrome = getPublicChromeCopy(lang);
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  type PartnerFaqItem = (typeof ui.bridge.partnerFAQ.items)[number];
  type PartnerFaqCopy = {
    back: string;
    philosophy: string;
    quote: string;
    reportsTitle: string;
    reportsLead: string;
    reportsPoints: string[];
    sayLabel: string;
    avoidLabel: string;
    examplesTitle?: string;
    examples?: Array<{ scene: string; say: string; avoid: string }>;
  };
  const copyByLang: LangCopy<PartnerFaqCopy> = {
    en: {
      back: 'Back',
      philosophy: 'Luna29 Philosophy',
      quote: '"We believe that understanding biological context is the shortest path to empathy in relationships."',
      reportsTitle: 'How Partners Use My Health Reports',
      reportsLead: 'Reports help couples discuss health with less conflict: what changed, why it may happen, and what support is useful now.',
      reportsPoints: ['Use report language to discuss needs without blame.', 'Bring report to clinician and decide next tests together.', 'Share only ID/no name if privacy is needed.'],
      sayLabel: 'Say:',
      avoidLabel: 'Avoid:',
      examplesTitle: 'Partner spirit in practice',
      examples: [
        { scene: 'Low energy evening', say: 'I hear that your body is asking for rest. I can handle dinner — no fixing needed.', avoid: 'Why are you always tired? You just need to push through.' },
        { scene: 'Before a hard conversation', say: 'I want to understand your capacity today. We can pause if it gets heavy.', avoid: 'We need to talk now — this cannot wait.' },
        { scene: 'After a health report', say: 'The report names a pattern, not a verdict. What would feel supportive this week?', avoid: 'The report proves you should change everything immediately.' },
      ],
    },
    ru: {
      back: 'Назад',
      philosophy: 'Философия Luna29',
      quote: '«Мы верим, что понимание биологического контекста - это самый короткий путь к эмпатии в отношениях».',
      reportsTitle: 'Как партнёру использовать мои отчёты о здоровье',
      reportsLead: 'Отчеты помогают обсуждать здоровье без конфликтов: что изменилось, почему это могло случиться и какая поддержка нужна сейчас.',
      reportsPoints: ['Используйте язык отчета для разговора без обвинений.', 'Берите отчет к врачу и вместе решайте, какие анализы нужны дальше.', 'При необходимости делитесь только ID без имени.'],
      sayLabel: 'Сказать:',
      avoidLabel: 'Избегать:',
      examplesTitle: 'Дух партнёрства на практике',
      examples: [
        { scene: 'Вечер с низкой энергией', say: 'Слышу, что тело просит отдых. Я могу взять ужин — без «исправлений».', avoid: 'Почему ты всегда устаёшь? Просто нужно собраться.' },
        { scene: 'Перед сложным разговором', say: 'Хочу понять твой ресурс сегодня. Можем поставить паузу, если станет тяжело.', avoid: 'Нам нужно поговорить прямо сейчас — это не может ждать.' },
        { scene: 'После health report', say: 'Отчёт называет паттерн, не приговор. Что было бы поддержкой на этой неделе?', avoid: 'Отчёт доказывает, что тебе нужно срочно всё менять.' },
      ],
    },
    uk: {
      back: 'Назад',
      philosophy: 'Філософія Luna29',
      quote: '«Ми віримо, що розуміння біологічного контексту - найкоротший шлях до емпатії у стосунках».',
      reportsTitle: 'Як партнеру користуватись моїми звітами про здоров’я',
      reportsLead: 'Звіти допомагають обговорювати здоровʼя без конфлікту: що змінилось, чому це могло статися і яка підтримка потрібна зараз.',
      reportsPoints: ['Використовуйте мову звіту для розмови без звинувачень.', 'Беріть звіт до лікаря й разом вирішуйте наступні аналізи.', 'За потреби діліться лише ID без імені.'],
      sayLabel: 'Сказати:',
      avoidLabel: 'Уникати:',
    },
    es: {
      back: 'Atrás',
      philosophy: 'Filosofía Luna29',
      quote: '"Creemos que comprender el contexto biológico es el camino más corto hacia la empatía en las relaciones."',
      reportsTitle: 'Cómo la pareja usa mis informes de salud',
      reportsLead: 'El reporte facilita conversaciones sin fricción: qué cambió, por qué pudo pasar y qué apoyo conviene ahora.',
      reportsPoints: ['Usa el lenguaje del reporte para hablar sin culpas.', 'Llévenlo a consulta y definan próximos estudios juntos.', 'Comparte solo ID/sin nombre si necesitas privacidad.'],
      sayLabel: 'Decir:',
      avoidLabel: 'Evitar:',
    },
    fr: {
      back: 'Retour',
      philosophy: 'Philosophie Luna29',
      quote: '"Nous croyons que comprendre le contexte biologique est le chemin le plus court vers l’empathie dans les relations."',
      reportsTitle: 'Comment le couple utilise mes rapports de santé',
      reportsLead: 'Le rapport aide à parler de santé sans tension: ce qui a changé, pourquoi et quel soutien est utile maintenant.',
      reportsPoints: ['Utilisez le rapport pour dialoguer sans reproches.', 'Apportez-le en consultation pour planifier les examens.', 'Partagez uniquement l ID si la confidentialité est prioritaire.'],
      sayLabel: 'Dire :',
      avoidLabel: 'Éviter :',
    },
    de: {
      back: 'Zurück',
      philosophy: 'Luna29 Philosophie',
      quote: '"Wir glauben, dass das Verständnis des biologischen Kontexts der kürzeste Weg zu Empathie in Beziehungen ist."',
      reportsTitle: 'Wie Partner meine Gesundheitsberichte nutzen',
      reportsLead: 'Berichte helfen bei ruhigen Gesprächen: was sich geändert hat, warum es so sein kann und welche Unterstützung jetzt passt.',
      reportsPoints: ['Mit Berichtssprache ohne Vorwürfe sprechen.', 'Zum Arzttermin mitnehmen und nächste Tests gemeinsam planen.', 'Bei Bedarf nur ID ohne Namen teilen.'],
      sayLabel: 'Sagen:',
      avoidLabel: 'Vermeiden:',
    },
    zh: {
      back: '返回',
      philosophy: 'Luna29 理念',
      quote: '“我们相信，理解生理背景是通往关系共情的最短路径。”',
      reportsTitle: '伴侣如何使用我的健康报告',
      reportsLead: '报告让沟通更平稳：发生了什么变化、可能原因、当下需要怎样的支持。',
      reportsPoints: ['用报告语言沟通，减少指责。', '带去就医沟通，一起决定下一步检查。', '如需隐私，可仅分享 ID 不含姓名。'],
      sayLabel: '可以说：',
      avoidLabel: '避免：',
    },
    ja: {
      back: '戻る',
      philosophy: 'Luna29の哲学',
      quote: '「生物学的な文脈を理解することが、関係性における共感への最短ルートだと私たちは考えています。」',
      reportsTitle: 'パートナー向けマイヘルスレポート活用',
      reportsLead: 'レポートにより、何が変化し、なぜ起こり得るか、今どんな支援が有効かを落ち着いて話せます。',
      reportsPoints: ['責めずに話すための共通言語として使う。', '受診時に持参し、次の検査を一緒に決める。', '必要ならIDのみ共有してプライバシーを守る。'],
      sayLabel: '言う：',
      avoidLabel: '避ける：',
    },
    pt: {
      back: 'Voltar',
      philosophy: 'Filosofia Luna29',
      quote: '"Acreditamos que compreender o contexto biológico é o caminho mais curto para a empatia nos relacionamentos."',
      reportsTitle: 'Como o parceiro usa meus relatórios de saúde',
      reportsLead: 'O relatório facilita conversas sem conflito: o que mudou, por que pode ter ocorrido e qual apoio faz sentido agora.',
      reportsPoints: ['Use a linguagem do relatório para conversar sem culpa.', 'Levem o relatório à consulta e definam próximos exames juntos.', 'Compartilhe só ID/sem nome quando precisar de privacidade.'],
      sayLabel: 'Dizer:',
      avoidLabel: 'Evitar:',
    },
  ar: {
      back: 'رجوع',
      philosophy: 'فلسفة Luna29',
      quote: '«نؤمن أن فهم السياق البيولوجي هو أقصر طريق إلى التعاطف في العلاقات.»',
      reportsTitle: 'كيف يستخدم الشريك تقاريري الصحية',
      reportsLead: 'التقارير تساعد الأزواج على مناقشة الصحة بتعارض أقل: ما الذي تغيّر، ولماذا قد يحدث، وأي دعم مفيد الآن.',
      reportsPoints: ['استخدمي لغة التقرير للنقاش بلا لوم.', 'اصطحبي التقرير إلى الطبيب وقرّرا معًا الاختبارات التالية.', 'شاركي المعرّف فقط بلا اسم عند الحاجة للخصوصية.'],
      sayLabel: 'قولي:',
      avoidLabel: 'تجنّبي:',
      examplesTitle: 'روح الشراكة عمليًا',
      examples: [
        { scene: 'مساء طاقة منخفضة', say: 'أسمع أن جسدك يطلب راحة. يمكنني تدبير العشاء — بلا «إصلاح».', avoid: 'لماذا أنتِ دائمًا متعبة؟ فقط ادفعِ نفسك.' },
        { scene: 'قبل حديث صعب', say: 'أريد فهم طاقتك اليوم. يمكننا التوقف إن ثقل الأمر.', avoid: 'يجب أن نتحدث الآن — هذا لا ينتظر.' },
        { scene: 'بعد تقرير صحي', say: 'التقرير يسمّي نمطًا لا حكمًا. ما الذي يبدو داعمًا هذا الأسبوع؟', avoid: 'التقرير يثبت أنه يجب تغيير كل شيء فورًا.' },
      ],
    },
  he: {
      back: 'חזרה',
      philosophy: 'פילוסופיית Luna29',
      quote: '«אנחנו מאמינים שהבנת ההקשר הביולוגי היא הדרך הקצרה ביותר לאמפתיה במערכות יחסים.»',
      reportsTitle: 'איך בן/בת הזוג משתמשים בדוחות הבריאות',
      reportsLead: 'הדוחות עוזרים לזוגות לדבר על בריאות עם פחות קונפליקט: מה השתנה, למה זה עשוי לקרות, ואיזו תמיכה מועילה עכשיו.',
      reportsPoints: ['השתמשו בשפת הדוח לשיחה בלי האשמה.', 'הביאו את הדוח לרופא והחליטו יחד על בדיקות הבאות.', 'שתפו רק מזהה בלי שם כשצריך פרטיות.'],
      sayLabel: 'לומר:',
      avoidLabel: 'להימנע:',
      examplesTitle: 'רוח שותפות בפועל',
      examples: [
        { scene: 'ערב אנרגיה נמוכה', say: 'אני שומע/ת שהגוף מבקש מנוחה. אני יכול/ה לטפל בארוחה — בלי «לתקן».', avoid: 'למה את תמיד עייפה? פשוט תתגברי.' },
        { scene: 'לפני שיחה קשה', say: 'אני רוצה להבין את הקיבולת שלך היום. אפשר להשהות אם זה נהיה כבד.', avoid: 'צריך לדבר עכשיו — זה לא יכול לחכות.' },
        { scene: 'אחרי דוח בריאות', say: 'הדוח שם דפוס, לא פסק דין. מה ירגיש תומך השבוע?', avoid: 'הדוח מוכיח שצריך לשנות הכול מיד.' },
      ],
    },};
  const copy = getLang(copyByLang, lang);
  const enPartnerCopy = copyByLang.en;
  const examplesTitle = copy.examplesTitle ?? enPartnerCopy.examplesTitle;
  const examples = copy.examples ?? enPartnerCopy.examples ?? [];

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const hero = getMemberTabHeroCopy('partner_faq', lang, ui);
  const themeClass = getLunaPageTheme('partner_faq').shellClass;

  return (
    <section className={`${MEMBER_PAGE_ROOT} ${themeClass}`} data-testid="partner-faq-root">
      <MemberIconBackButton lang={lang} onClick={onBack} className="mb-0" />

      <div className={PUBLIC_PAGE_STACK}>
        <LunaPageHeroSection
          themeClass={themeClass}
          eyebrow={hero.eyebrow}
          title={hero.title}
          subtitle={ui.bridge.partnerFAQ.subtitle}
          image={getMemberHeroImage('partner_faq')}
          imageAlt={hero.title}
          chip={
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-luna-purple dark:text-[#d8b4fe]">
              {ui.bridge.partnerFAQ.title}
            </span>
          }
        />

        <LunaPageContentSection themeClass={themeClass} padded={false} className="space-y-12">
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

      <section className="space-y-4">
        <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">{examplesTitle}</h3>
        <div className="grid grid-cols-1 gap-4">
          {examples.map((item) => (
            <article key={item.scene} className={`${MEMBER_INNER_CARD} p-6 md:p-7 space-y-3`}>
              <p className={MEMBER_SECTION_EYEBROW}>{item.scene}</p>
              <p className={MEMBER_BODY_TEXT}><span className="font-black text-emerald-700 dark:text-emerald-300">{copy.sayLabel} </span>{item.say}</p>
              <p className={MEMBER_BODY_TEXT}><span className="font-black text-rose-700 dark:text-rose-300">{copy.avoidLabel} </span>{item.avoid}</p>
            </article>
          ))}
        </div>
      </section>

      <article className="p-8 md:p-10 rounded-[2.5rem] border-2 border-luna-purple/30 luna-vivid-card-alt-4 shadow-[0_14px_34px_rgba(76,29,149,0.14)] space-y-4">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-luna-purple">{chrome.healthReportsTitle}</p>
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
        </LunaPageContentSection>
      </div>
    </section>
  );
};
