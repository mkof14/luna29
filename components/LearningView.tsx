import React, { useEffect, useState } from 'react';
import { Language, LangCopy, getLang } from '../constants';
import { KnowledgePageShell } from './KnowledgePageShell';
import { AccordionSections } from './AccordionSections';
import type { TrainingViewCopy } from '../utils/trainingViewContent';
import type { AccordionCategory } from './AccordionSections';

interface TrainingViewProps {
  lang: Language;
  onBack?: () => void;
}

const STATS_BY_LANG: LangCopy<Array<{ label: string; value: string }>> = {
  en: [
    { label: 'Sections', value: '4' },
    { label: 'Terms', value: '14+' },
    { label: 'Languages', value: '11' },
    { label: 'Approach', value: 'Mirror' },
  ],
  ru: [
    { label: 'Разделы', value: '4' },
    { label: 'Термины', value: '14+' },
    { label: 'Языки', value: '11' },
    { label: 'Подход', value: 'Зеркало' },
  ],
  uk: [
    { label: 'Розділи', value: '4' },
    { label: 'Терміни', value: '14+' },
    { label: 'Мови', value: '11' },
    { label: 'Підхід', value: 'Дзеркало' },
  ],
  es: [
    { label: 'Secciones', value: '4' },
    { label: 'Términos', value: '14+' },
    { label: 'Idiomas', value: '11' },
    { label: 'Enfoque', value: 'Espejo' },
  ],
  fr: [
    { label: 'Sections', value: '4' },
    { label: 'Termes', value: '14+' },
    { label: 'Langues', value: '11' },
    { label: 'Approche', value: 'Miroir' },
  ],
  de: [
    { label: 'Abschnitte', value: '4' },
    { label: 'Begriffe', value: '14+' },
    { label: 'Sprachen', value: '11' },
    { label: 'Ansatz', value: 'Spiegel' },
  ],
  zh: [
    { label: '章节', value: '4' },
    { label: '术语', value: '14+' },
    { label: '语言', value: '11' },
    { label: '方法', value: '镜像' },
  ],
  ja: [
    { label: 'セクション', value: '4' },
    { label: '用語', value: '14+' },
    { label: '言語', value: '11' },
    { label: '姿勢', value: '鏡' },
  ],
  pt: [
    { label: 'Seções', value: '4' },
    { label: 'Termos', value: '14+' },
    { label: 'Idiomas', value: '11' },
    { label: 'Abordagem', value: 'Espelho' },
  ],
  ar: [
    { label: 'أقسام', value: '4' },
    { label: 'مصطلحات', value: '14+' },
    { label: 'لغات', value: '11' },
    { label: 'منهج', value: 'مرآة' },
  ],
  he: [
    { label: 'מדורים', value: '4' },
    { label: 'מונחים', value: '14+' },
    { label: 'שפות', value: '11' },
    { label: 'גישה', value: 'מראה' },
  ],
};

export const TrainingView: React.FC<TrainingViewProps> = ({ lang, onBack }) => {
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

  const [content, setContent] = useState<{ copy: TrainingViewCopy; categories: AccordionCategory[] } | null>(null);

  useEffect(() => {
    let alive = true;
    import('../utils/trainingViewContent').then((module) => {
      if (!alive) return;
      setContent(module.getTrainingViewContent(lang));
    });
    return () => {
      alive = false;
    };
  }, [lang]);

  if (!content) {
    return (
      <section className="max-w-6xl mx-auto pb-20 p-6 md:p-8">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{getLang(loadingByLang, lang) || loadingByLang.en}</p>
      </section>
    );
  }

  const { copy, categories } = content;
  const stats = getLang(STATS_BY_LANG, lang) || STATS_BY_LANG.en;

  return (
    <KnowledgePageShell
      eyebrow={copy.eyebrow}
      titleA={copy.titleA}
      titleB={copy.titleB}
      subtitle={copy.subtitle}
      stats={stats}
      backLabel={copy.back}
      onBack={onBack}
      footerTitle={copy.promiseTitle}
      footerQuote={copy.promiseQuote}
    >
      <AccordionSections categories={categories} openFirst variant="knowledge" />
    </KnowledgePageShell>
  );
};
