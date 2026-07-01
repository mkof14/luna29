import React, { useEffect, useState } from 'react';
import { Language, LangCopy, getLang } from '../constants';
import { KnowledgePageShell } from './KnowledgePageShell';
import { AccordionSections } from './AccordionSections';
import { MEMBER_PAGE_QUESTIONS, MEMBER_INNER_CARD, MEMBER_BODY_TEXT, MEMBER_SECTION_EYEBROW } from '../utils/memberPageStyles';
import type { AccordionCategory } from './AccordionSections';

interface FAQCopy {
  back: string;
  eyebrow: string;
  titleA: string;
  titleB: string;
  subtitle: string;
  promiseTitle: string;
  promiseQuote: string;
  highlightsTitle: string;
  highlights: Array<{ title: string; body: string }>;
}

export const FAQView: React.FC<{ lang?: Language; onBack?: () => void; mode?: 'public' | 'member' }> = ({
  lang = 'en',
  onBack,
  mode = 'member',
}) => {
  const loadingByLang: LangCopy<string> = {
    en: 'Loading...',
    ru: 'Загрузка...',
    uk: 'Завантаження...',
    es: 'Cargando...',
    fr: 'Chargement...',
    de: 'Lädt...',
    zh: '加载中...',
    ja: '読み込み中...',
    pt: 'Carregando...',
    ar: 'جاري التحميل...',
    he: 'טוען...',
  };

  const [content, setContent] = useState<{ categories: AccordionCategory[]; copy: FAQCopy } | null>(null);

  useEffect(() => {
    let alive = true;
    import('../utils/faqViewContent').then((module) => {
      if (!alive) return;
      setContent(module.getFAQViewContent(lang, mode));
    });
    return () => {
      alive = false;
    };
  }, [lang, mode]);

  useEffect(() => {
    setContent(null);
  }, [lang, mode]);

  if (!content) {
    return (
      <div className="max-w-6xl mx-auto p-8 md:p-10 pb-40 px-6">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{getLang(loadingByLang, lang) || loadingByLang.en}</p>
      </div>
    );
  }

  const { categories, copy } = content;

  const statsByLang: LangCopy<Array<{ label: string; value: string }>> = {
    en: [
      { label: 'Topics', value: `${categories.length}` },
      { label: 'Answers', value: `${categories.reduce((n, c) => n + c.items.length, 0)}+` },
      { label: 'Scope', value: 'Wellness' },
      { label: 'Clinical', value: 'No' },
    ],
    ru: [
      { label: 'Темы', value: `${categories.length}` },
      { label: 'Ответы', value: `${categories.reduce((n, c) => n + c.items.length, 0)}+` },
      { label: 'Фокус', value: 'Wellness' },
      { label: 'Клиника', value: 'Нет' },
    ],
    uk: [
      { label: 'Теми', value: `${categories.length}` },
      { label: 'Відповіді', value: `${categories.reduce((n, c) => n + c.items.length, 0)}+` },
      { label: 'Фокус', value: 'Wellness' },
      { label: 'Клініка', value: 'Ні' },
    ],
    es: [
      { label: 'Temas', value: `${categories.length}` },
      { label: 'Respuestas', value: `${categories.reduce((n, c) => n + c.items.length, 0)}+` },
      { label: 'Enfoque', value: 'Wellness' },
      { label: 'Clínico', value: 'No' },
    ],
    fr: [
      { label: 'Thèmes', value: `${categories.length}` },
      { label: 'Réponses', value: `${categories.reduce((n, c) => n + c.items.length, 0)}+` },
      { label: 'Focus', value: 'Wellness' },
      { label: 'Clinique', value: 'Non' },
    ],
    de: [
      { label: 'Themen', value: `${categories.length}` },
      { label: 'Antworten', value: `${categories.reduce((n, c) => n + c.items.length, 0)}+` },
      { label: 'Fokus', value: 'Wellness' },
      { label: 'Klinisch', value: 'Nein' },
    ],
    zh: [
      { label: '主题', value: `${categories.length}` },
      { label: '回答', value: `${categories.reduce((n, c) => n + c.items.length, 0)}+` },
      { label: '范围', value: 'Wellness' },
      { label: '临床', value: '否' },
    ],
    ja: [
      { label: 'トピック', value: `${categories.length}` },
      { label: '回答', value: `${categories.reduce((n, c) => n + c.items.length, 0)}+` },
      { label: '焦点', value: 'Wellness' },
      { label: '臨床', value: 'いいえ' },
    ],
    pt: [
      { label: 'Temas', value: `${categories.length}` },
      { label: 'Respostas', value: `${categories.reduce((n, c) => n + c.items.length, 0)}+` },
      { label: 'Foco', value: 'Wellness' },
      { label: 'Clínico', value: 'Não' },
    ],
    ar: [
      { label: 'مواضيع', value: `${categories.length}` },
      { label: 'إجابات', value: `${categories.reduce((n, c) => n + c.items.length, 0)}+` },
      { label: 'النطاق', value: 'Wellness' },
      { label: 'سريري', value: 'لا' },
    ],
    he: [
      { label: 'נושאים', value: `${categories.length}` },
      { label: 'תשובות', value: `${categories.reduce((n, c) => n + c.items.length, 0)}+` },
      { label: 'היקף', value: 'Wellness' },
      { label: 'קליני', value: 'לא' },
    ],
  };
  const stats = getLang(statsByLang, lang) || statsByLang.en;

  return (
    <KnowledgePageShell
      lang={lang}
      eyebrow={copy.eyebrow}
      titleA={copy.titleA}
      titleB={copy.titleB}
      subtitle={copy.subtitle}
      stats={stats}
      backLabel={copy.back}
      onBack={onBack}
      footerTitle={copy.promiseTitle}
      footerQuote={copy.promiseQuote}
      heroPage="faq"
      mode={mode}
    >
      <AccordionSections categories={categories} openFirst variant="knowledge" />

      {copy.highlights.length > 0 && (
        <section className="mt-12 md:mt-16 pt-10 border-t border-slate-200/80 dark:border-slate-700/70 space-y-6">
          <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-slate-100">{copy.highlightsTitle}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {copy.highlights.map((item) => (
              <article
                key={item.title}
                className="rounded-[1.6rem] border border-slate-200/80 dark:border-slate-700/70 bg-gradient-to-br from-violet-50/50 via-white to-teal-50/30 dark:from-slate-900/60 dark:via-slate-900/40 dark:to-slate-800/30 p-6 space-y-3"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-luna-purple">{item.title}</p>
                <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{item.body}</p>
              </article>
            ))}
          </div>
        </section>
      )}
    </KnowledgePageShell>
  );
};
