import React, { useEffect, useState } from 'react';
import { Language, LangCopy, getLang } from '../constants';
import { versionedStaticAsset } from '../utils/staticAssetUrl';
import { PublicPageArtHeader } from './public/PublicPageArtHeader';

interface AboutLunaViewProps {
  lang: Language;
  mode?: 'public' | 'member';
  onBack?: () => void;
}

export const AboutLunaView: React.FC<AboutLunaViewProps> = ({ lang, mode = 'public', onBack }) => {
  const loadingByLang: LangCopy< string> = {
    en: 'Loading...',
    ru: 'Загрузка...',
    uk: 'Завантаження...',
    es: 'Cargando...',
    fr: 'Chargement...',
    de: 'Lädt...',
    zh: '加载中...',
    ja: '読み込み中...',
    pt: 'Carregando...',
    ar: 'جارٍ التحميل...',
    he: 'טוען...',};
  const [content, setContent] = useState<{
    about: {
      eyebrow: string;
      title: string;
      lead: string;
      intro: string;
      block1Title: string;
      block1Text1: string;
      block1Text2: string;
      block2Title: string;
      block2Text1: string;
      block2Text2: string;
      finalTitle: string;
      finalText1: string;
      finalText2: string;
      finalText3: string;
    };
    reportExplainer: { title: string; body1: string; body2: string; bullets: string[] };
  } | null>(null);
  useEffect(() => {
    let alive = true;
    import('../utils/aboutViewContent').then((module) => {
      if (!alive) return;
      setContent(module.getAboutViewContent(lang));
    });
    return () => {
      alive = false;
    };
  }, [lang]);
  if (!content) {
    return (
      <section className={`${mode === 'public' ? 'luna-page-shell luna-page-knowledge p-6 md:p-8' : 'max-w-6xl mx-auto pb-24'} animate-in fade-in duration-500`}>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{getLang(loadingByLang, lang) || loadingByLang.en}</p>
      </section>
    );
  }
  const { about, reportExplainer } = content;
  const wrapperClass = mode === 'public' ? 'luna-page-shell luna-page-knowledge p-6 md:p-8' : 'max-w-6xl mx-auto pb-24';

  return (
    <section className={`${wrapperClass} animate-in fade-in duration-500 space-y-7 max-w-6xl mx-auto`}>
      {onBack && (
        <button onClick={onBack} className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-luna-purple transition-all">
          ← Back
        </button>
      )}
      {mode === 'public' && (
        <PublicPageArtHeader page="about" eyebrow={about.eyebrow} title={about.title} />
      )}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <article className="lg:col-span-3 rounded-[2.8rem] border border-slate-300/75 dark:border-slate-800/90 bg-gradient-to-br from-slate-200/95 via-slate-100/95 to-indigo-100/70 dark:from-[#040a18] dark:via-[#081127] dark:to-[#0b1b3a] p-7 md:p-10 space-y-5 shadow-[0_18px_46px_rgba(71,85,105,0.22)] dark:shadow-[0_22px_60px_rgba(2,6,23,0.78)]">
          <p className="text-[10px] font-black uppercase tracking-[0.45em] text-luna-purple">{about.eyebrow}</p>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-slate-100">{about.title}</h2>
          <p className="text-base md:text-lg font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">{about.lead}</p>
          <p className="text-sm md:text-base font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">{about.intro}</p>
        </article>
        <article className="lg:col-span-2 rounded-[2.8rem] border border-slate-300/75 dark:border-slate-800/90 overflow-hidden bg-gradient-to-br from-slate-200/95 via-slate-100/95 to-sky-100/70 dark:bg-[#050b1a] p-4 md:p-5 shadow-[0_18px_46px_rgba(71,85,105,0.2)] dark:shadow-[0_22px_60px_rgba(2,6,23,0.75)]">
          <div className="relative rounded-[2rem] overflow-hidden mx-auto w-full max-w-[360px]">
            <img
              src={versionedStaticAsset('/images/Luna%20L%2044.png')}
              alt="Luna29 L 44"
              className="w-full h-auto object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/28 via-transparent to-white/8 dark:from-slate-950/35 dark:to-transparent" />
          </div>
          <div className="mt-4 rounded-2xl border border-slate-300/80 dark:border-slate-800/90 bg-slate-100/90 dark:bg-[#0a1328]/85 backdrop-blur-md px-4 py-3 shadow-[0_8px_22px_rgba(71,85,105,0.22)] dark:shadow-[0_10px_26px_rgba(2,6,23,0.65)]">
            <p className="text-[9px] font-black uppercase tracking-[0.35em] text-luna-purple">Luna29</p>
            <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">Luna29 — The physiology of feeling.</p>
          </div>
        </article>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <article className="rounded-[2.2rem] border border-slate-300/75 dark:border-slate-700/70 luna-vivid-card-alt-1 bg-gradient-to-br from-amber-100/85 via-rose-100/60 to-slate-100/90 dark:bg-none p-6 md:p-8 space-y-4 shadow-[0_14px_34px_rgba(100,116,139,0.2)] dark:shadow-none">
          <h3 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">{about.block1Title}</h3>
          <p className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">{about.block1Text1}</p>
          <p className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">{about.block1Text2}</p>
        </article>

        <article className="rounded-[2.2rem] border border-slate-300/75 dark:border-slate-700/70 luna-vivid-card-alt-3 bg-gradient-to-br from-indigo-100/80 via-sky-100/65 to-slate-100/90 dark:bg-none p-6 md:p-8 space-y-4 shadow-[0_14px_34px_rgba(100,116,139,0.22)] dark:shadow-none">
          <h3 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">{about.block2Title}</h3>
          <p className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">{about.block2Text1}</p>
          <p className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">{about.block2Text2}</p>
        </article>
      </div>

      <article className="rounded-[2.2rem] border border-slate-300/75 dark:border-slate-700/70 luna-vivid-card-alt-4 p-6 md:p-8 space-y-4 shadow-[0_14px_34px_rgba(100,116,139,0.2)]">
        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-luna-purple">My Health Reports</p>
        <h3 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">{reportExplainer.title}</h3>
        <p className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">{reportExplainer.body1}</p>
        <p className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">{reportExplainer.body2}</p>
        <ul className="space-y-1.5">
          {reportExplainer.bullets.map((item) => (
            <li key={item} className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">
              • {item}
            </li>
          ))}
        </ul>
      </article>

      <article className="rounded-[2.5rem] border border-slate-300/75 dark:border-slate-700/70 luna-vivid-card bg-gradient-to-br from-violet-100/70 via-slate-100/95 to-amber-100/70 dark:bg-none p-7 md:p-9 shadow-[0_16px_38px_rgba(71,85,105,0.2)] dark:shadow-none">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
          <div className="lg:col-span-3 space-y-5">
            <h3 className="text-2xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100">{about.finalTitle}</h3>
            <p className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">{about.finalText1}</p>
            <p className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">{about.finalText2}</p>
            <p className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">{about.finalText3}</p>
          </div>
          <aside className="lg:col-span-2 rounded-[2.5rem] border border-slate-200/80 dark:border-slate-700/80 luna-vivid-card-alt-4 p-3 md:p-4 shadow-[0_14px_42px_rgba(74,58,116,0.16),0_5px_16px_rgba(71,126,143,0.14),inset_0_1px_0_rgba(255,255,255,0.45)] space-y-3">
            <div className="relative z-10 h-64 md:h-[22rem] rounded-[2.2rem] overflow-hidden border border-transparent bg-transparent">
              <img
                src={versionedStaticAsset('/images/window_reflection_portrait.webp')}
                alt="Luna29 Reflection Portrait"
                className="absolute -top-8 inset-x-0 h-[calc(100%+2rem)] w-full object-cover"
                style={{ objectPosition: '50% 28%' }}
              />
              <div className="absolute -top-8 inset-x-0 h-[calc(100%+2rem)] bg-gradient-to-b from-[rgba(14,18,34,0.58)] via-[rgba(18,24,40,0.5)] to-[rgba(15,20,36,0.72)] dark:from-[rgba(8,12,24,0.72)] dark:via-[rgba(12,17,30,0.62)] dark:to-[rgba(8,12,24,0.78)]" />
            </div>
          </aside>
        </div>
      </article>
    </section>
  );
};
