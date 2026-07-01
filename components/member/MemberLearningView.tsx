import React, { useEffect, useMemo, useState } from 'react';
import { Language, LangCopy, getLang } from '../../constants';
import type { AccordionCategory } from '../AccordionSections';
import type { LearningViewCopy } from '../../utils/learningViewContent';
import { MEMBER_BODY_TEXT, MEMBER_INNER_CARD, MEMBER_MUTED_TEXT, MEMBER_PAGE_KNOWLEDGE, MEMBER_SECTION_EYEBROW } from '../../utils/memberPageStyles';
import { MemberBackButton } from './MemberBackButton';
import { LunaPageHeroSection } from '../shared/LunaPageHeroSection';
import { getMemberHeroImage } from '../../utils/memberHeroImages';
import { getLunaPageTheme } from '../../utils/lunaPageThemes';
import { PUBLIC_PAGE_STACK } from '../public/publicPageStyles';

type MemberLearningViewProps = {
  lang: Language;
  onBack: () => void;
};

const backByLang: LangCopy<string> = {
  en: 'Back to Today',
  ru: 'Назад к Today',
  uk: 'Назад до Today',
  es: 'Volver a Today',
  fr: 'Retour à Today',
  de: 'Zurück zu Today',
  zh: '返回 Today',
  ja: 'Today へ戻る',
  pt: 'Voltar ao Today',
  ar: 'العودة إلى Today',
  he: 'חזרה ל-Today',
};

const guideByLang: LangCopy<{ title: string; body: string; tipA: string; tipB: string; tipC: string }> = {
  en: {
    title: 'How to read Learning',
    body: 'Learning is a structured library — not FAQ. Move section by section. Each block explains Luna29 language, physiology context, and daily practice without diagnosis.',
    tipA: 'Start with Foundations if Luna29 terms feel new.',
    tipB: 'Open one accordion item at a time — slow reading beats scanning.',
    tipC: 'Return to Voice Note or Today when a term connects to your day.',
  },
  ru: {
    title: 'Как читать раздел Обучение',
    body: 'Обучение — структурированная библиотека, не FAQ. Идите по разделам. Каждый блок объясняет язык Luna29, физиологический контекст и практику без диагностики.',
    tipA: 'Начните с Foundations, если термины Luna29 новые.',
    tipB: 'Открывайте по одному пункту — медленное чтение лучше беглого просмотра.',
    tipC: 'Возвращайтесь в Voice Note или Today, когда термин связался с вашим днём.',
  },
  uk: {
    title: 'Як читати розділ Навчання',
    body: 'Навчання — структурована бібліотека, не FAQ. Рухайтесь розділами. Кожен блок пояснює мову Luna29, фізіологічний контекст і практику без діагностики.',
    tipA: 'Почніть із Foundations, якщо терміни Luna29 нові.',
    tipB: 'Відкривайте по одному пункту — повільне читання краще за пробіг.',
    tipC: 'Повертайтесь у Voice Note або Today, коли термін повʼязався з вашим днем.',
  },
  es: {
    title: 'Cómo leer Aprendizaje',
    body: 'Aprendizaje es una biblioteca estructurada — no FAQ. Avanza sección por sección. Cada bloque explica el lenguaje Luna29, contexto fisiológico y práctica sin diagnóstico.',
    tipA: 'Empieza con Foundations si los términos son nuevos.',
    tipB: 'Abre un ítem a la vez — leer despacio funciona mejor.',
    tipC: 'Vuelve a Voice Note o Today cuando un término conecte con tu día.',
  },
  fr: {
    title: 'Comment lire Apprentissage',
    body: 'Apprentissage est une bibliothèque structurée — pas une FAQ. Avancez section par section. Chaque bloc explique le langage Luna29, le contexte physiologique et la pratique sans diagnostic.',
    tipA: 'Commencez par Foundations si les termes sont nouveaux.',
    tipB: 'Ouvrez un item à la fois — lire lentement vaut mieux.',
    tipC: 'Revenez à Voice Note ou Today quand un terme parle à votre journée.',
  },
  de: {
    title: 'So liest man Lernen',
    body: 'Lernen ist eine strukturierte Bibliothek — keine FAQ. Gehen Sie Abschnitt für Abschnitt. Jeder Block erklärt Luna29-Sprache, physiologischen Kontext und Praxis ohne Diagnose.',
    tipA: 'Starten Sie mit Foundations, wenn Begriffe neu sind.',
    tipB: 'Öffnen Sie jeweils einen Punkt — langsam lesen hilft mehr.',
    tipC: 'Zurück zu Voice Note oder Today, wenn ein Begriff zum Tag passt.',
  },
  zh: {
    title: '如何阅读学习页',
    body: '学习页是结构化资料库，不是 FAQ。请按章节阅读。每个板块解释 Luna29 语言、生理背景与实践方式，不做诊断。',
    tipA: '若术语陌生，从 Foundations 开始。',
    tipB: '一次只展开一项——慢读比扫读更有效。',
    tipC: '当某个术语与今天有关时，回到 Voice Note 或 Today。',
  },
  ja: {
    title: '学習ページの読み方',
    body: '学習はFAQではなく構造化ライブラリです。セクションごとに進めてください。各ブロックはLuna29の言語、生理背景、診断にしない実践を説明します。',
    tipA: '用語が新しい場合は Foundations から。',
    tipB: '一度に1項目だけ開く——ゆっくり読む方が効果的です。',
    tipC: '用語が今日とつながったら Voice Note や Today へ戻る。',
  },
  pt: {
    title: 'Como ler Aprendizagem',
    body: 'Aprendizagem é biblioteca estruturada — não FAQ. Avance seção por seção. Cada bloco explica linguagem Luna29, contexto fisiológico e prática sem diagnóstico.',
    tipA: 'Comece por Foundations se os termos forem novos.',
    tipB: 'Abra um item por vez — ler devagar funciona melhor.',
    tipC: 'Volte ao Voice Note ou Today quando um termo conectar com o dia.',
  },
  ar: {
    title: 'كيف تقرئين التعلّم',
    body: 'التعلّم مكتبة منظّمة — وليست FAQ. انتقلي قسمًا بقسم. كل جزء يشرح لغة Luna29 والسياق الفسيولوجي والممارسة دون تشخيص.',
    tipA: 'ابدئي بـ Foundations إذا كانت المصطلحات جديدة.',
    tipB: 'افتحي عنصرًا واحدًا في كل مرة — القراءة البطيئة أفضل.',
    tipC: 'عودي إلى Voice Note أو Today عندما يرتبط مصطلح بيومك.',
  },
  he: {
    title: 'איך לקרוא את הלימוד',
    body: 'לימוד הוא ספרייה מובנית — לא FAQ. התקדמי לפי סעיפים. כל בלוק מסביר את שפת Luna29, הקשר פיזיולוגי ותרגול בלי אבחון.',
    tipA: 'התחילי ב-Foundations אם המונחים חדשים.',
    tipB: 'פתחי פריט אחד בכל פעם — קריאה איטית עדיפה.',
    tipC: 'חזרי ל-Voice Note או Today כשמונח מתחבר ליום שלך.',
  },
};

export const MemberLearningView: React.FC<MemberLearningViewProps> = ({ lang, onBack }) => {
  const [content, setContent] = useState<{ copy: LearningViewCopy; categories: AccordionCategory[] } | null>(null);
  const [activeSection, setActiveSection] = useState(0);
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({ '0-0': true });

  useEffect(() => {
    let alive = true;
    import('../../utils/learningViewContent').then((module) => {
      if (!alive) return;
      setContent(module.getLearningViewContent(lang));
    });
    return () => {
      alive = false;
    };
  }, [lang]);

  useEffect(() => {
    setOpenItems({ [`${activeSection}-0`]: true });
  }, [activeSection]);

  const guide = getLang(guideByLang, lang) || guideByLang.en;
  const backLabel = getLang(backByLang, lang) || backByLang.en;

  const section = useMemo(() => {
    if (!content) return null;
    return content.categories[activeSection] || content.categories[0];
  }, [content, activeSection]);

  if (!content || !section) {
    return (
      <section className={MEMBER_PAGE_KNOWLEDGE}>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">Loading…</p>
      </section>
    );
  }

  const { copy, categories } = content;

  const toggleItem = (itemIdx: number) => {
    const key = `${activeSection}-${itemIdx}`;
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <section className={`${MEMBER_PAGE_KNOWLEDGE} luna-page-journey`} data-testid="member-tab-learning">
      <MemberBackButton lang={lang} onClick={onBack} label={backLabel} />

      <div className={PUBLIC_PAGE_STACK}>
        <LunaPageHeroSection
          themeClass={getLunaPageTheme('learning').shellClass}
          eyebrow={copy.eyebrow}
          title={`${copy.titleA} ${copy.titleB}`.trim()}
          subtitle={copy.subtitle}
          image={getMemberHeroImage('learning')}
          imageAlt={copy.titleA}
          tips={[guide.tipA, guide.tipB, guide.tipC]}
          tipsTitle={guide.title}
        />

      <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-8">
        <aside className={`${MEMBER_INNER_CARD} p-4 md:p-5 space-y-3 lg:sticky lg:top-28 self-start`}>
          <p className={MEMBER_SECTION_EYEBROW}>{copy.eyebrow}</p>
          <p className="text-sm font-black uppercase tracking-[0.12em] text-slate-900 dark:text-white">{copy.titleA} {copy.titleB}</p>
          <nav className="flex flex-col gap-1.5 pt-2" aria-label="Learning sections">
            {categories.map((cat, idx) => (
              <button
                key={`${cat.title}-${idx}`}
                type="button"
                onClick={() => setActiveSection(idx)}
                className={`text-left rounded-2xl px-3 py-3 transition-all ${
                  idx === activeSection
                    ? 'bg-luna-purple/15 border border-luna-purple/35 text-slate-900 dark:text-white'
                    : 'border border-transparent hover:bg-white/60 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-200'
                }`}
              >
                <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-luna-purple dark:text-[#d8b4fe]">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <span className="block text-sm font-bold leading-snug mt-1">{cat.title}</span>
                {cat.intro && <span className="block text-[11px] font-medium text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">{cat.intro}</span>}
              </button>
            ))}
          </nav>
        </aside>

        <div className="space-y-6">
          <header className={`${MEMBER_INNER_CARD} p-6 md:p-8 space-y-4`}>
            <p className={MEMBER_SECTION_EYEBROW}>{guide.title}</p>
            <p className={MEMBER_BODY_TEXT}>{copy.subtitle}</p>
            <p className={MEMBER_MUTED_TEXT}>{guide.body}</p>
            <ul className="space-y-2 pt-1">
              {[guide.tipA, guide.tipB, guide.tipC].map((tip) => (
                <li key={tip} className={`${MEMBER_MUTED_TEXT} pl-4 border-l-2 border-luna-purple/35`}>
                  {tip}
                </li>
              ))}
            </ul>
          </header>

          <article className={`${MEMBER_INNER_CARD} p-6 md:p-8 space-y-5`}>
            <div className="space-y-2">
              <p className={MEMBER_SECTION_EYEBROW}>{section.title}</p>
              {section.intro && <p className={MEMBER_BODY_TEXT}>{section.intro}</p>}
            </div>

            <div className="space-y-3">
              {section.items.map((item, itemIdx) => {
                const key = `${activeSection}-${itemIdx}`;
                const isOpen = Boolean(openItems[key]);
                return (
                  <div key={key} className="rounded-2xl border border-slate-200/85 dark:border-slate-500/45 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleItem(itemIdx)}
                      className="w-full text-left px-4 py-4 flex items-center justify-between gap-4 bg-white/70 dark:bg-slate-900/55 hover:bg-white dark:hover:bg-slate-900/75 transition-colors"
                    >
                      <span className="text-sm md:text-base font-black text-slate-900 dark:text-white">{item.title}</span>
                      <span className="text-luna-purple dark:text-[#d8b4fe] text-lg font-light">{isOpen ? '−' : '+'}</span>
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 border-t border-slate-200/70 dark:border-slate-600/45">
                        <p className={MEMBER_BODY_TEXT}>{item.body}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </article>

          <footer className={`${MEMBER_INNER_CARD} p-6 md:p-8 text-center space-y-3`}>
            <p className={MEMBER_SECTION_EYEBROW}>{copy.promiseTitle}</p>
            <p className={`${MEMBER_BODY_TEXT} italic max-w-3xl mx-auto`}>{copy.promiseQuote}</p>
          </footer>
        </div>
      </div>
      </div>
    </section>
  );
};
