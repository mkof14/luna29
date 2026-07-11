import React, { useEffect, useState } from 'react';
import { Language, LangCopy, getLang } from '../constants';
import { versionedStaticAsset } from '../utils/staticAssetUrl';
import { MEMBER_PAGE_KNOWLEDGE } from '../utils/memberPageStyles';
import { MemberBackButton } from './member/MemberBackButton';
import { PublicHeroBlock } from './public/PublicHeroBlock';
import { PUBLIC_PAGE_ART } from '../utils/publicPageArt';
import {
  PUBLIC_BODY,
  PUBLIC_CARD,
  PUBLIC_H3,
  PUBLIC_PAGE_STACK,
  PUBLIC_SHELL,
  PUBLIC_SHELL_INNER,
  PUBLIC_SHELL_PAD,
  PUBLIC_SURFACE,
} from './public/publicPageStyles';
import { HEALTH_PROFILE_COPY } from '../utils/healthProfileCopy';

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

  useEffect(() => {
    if (!content) return;
    if (typeof window === 'undefined') return;
    if (window.location.hash !== '#personal-health-profile') return;
    const timer = window.setTimeout(() => {
      document.getElementById('personal-health-profile')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
    return () => window.clearTimeout(timer);
  }, [content]);

  if (!content) {
    return (
      <section className={`${mode === 'public' ? 'luna-page-shell luna-page-knowledge p-6 md:p-8' : MEMBER_PAGE_KNOWLEDGE} animate-in fade-in duration-500`}>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">{getLang(loadingByLang, lang) || loadingByLang.en}</p>
      </section>
    );
  }
  const { about, reportExplainer } = content;
  const wrapperClass = mode === 'public' ? 'luna-page-shell luna-page-knowledge p-6 md:p-8' : MEMBER_PAGE_KNOWLEDGE;

  return (
    <section className={`${wrapperClass} animate-in fade-in duration-500 max-w-6xl mx-auto`}>
      {onBack && mode === 'member' && <MemberBackButton lang={lang} onClick={onBack} />}
      {onBack && mode === 'public' && (
        <button onClick={onBack} className="mb-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400 hover:text-luna-purple transition-all">
          ← Back
        </button>
      )}

      <div className={PUBLIC_PAGE_STACK}>
        <section className={`${PUBLIC_SHELL} luna-page-knowledge ${PUBLIC_SHELL_PAD}`}>
          <div className={PUBLIC_SHELL_INNER}>
            <PublicHeroBlock
              eyebrow={about.eyebrow}
              title={about.title}
              subtitle={about.lead}
              image={PUBLIC_PAGE_ART.about}
              imageAlt={about.title}
            />
          </div>
        </section>

        <section className={`${PUBLIC_SHELL} luna-page-knowledge ${PUBLIC_SHELL_PAD}`}>
          <div className={`${PUBLIC_SHELL_INNER} ${PUBLIC_SURFACE} space-y-5`}>
            <p className={PUBLIC_BODY}>{about.intro}</p>
          </div>
        </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-1">
        <article className={PUBLIC_CARD}>
          <h3 className={PUBLIC_H3}>{about.block1Title}</h3>
          <p className={`mt-3 ${PUBLIC_BODY}`}>{about.block1Text1}</p>
          <p className={`mt-2 ${PUBLIC_BODY}`}>{about.block1Text2}</p>
        </article>

        <article className={PUBLIC_CARD}>
          <h3 className={PUBLIC_H3}>{about.block2Title}</h3>
          <p className={`mt-3 ${PUBLIC_BODY}`}>{about.block2Text1}</p>
          <p className={`mt-2 ${PUBLIC_BODY}`}>{about.block2Text2}</p>
        </article>
      </div>

      <section
        id="personal-health-profile"
        data-testid="public-personal-health-profile"
        className={`${PUBLIC_SHELL} luna-page-knowledge ${PUBLIC_SHELL_PAD}`}
      >
        <div className={`${PUBLIC_SHELL_INNER} ${PUBLIC_SURFACE} space-y-4`}>
          <h3 className={PUBLIC_H3}>{HEALTH_PROFILE_COPY.entryPublicTitle}</h3>
          <p className={PUBLIC_BODY}>{HEALTH_PROFILE_COPY.entryPublicBody}</p>
          <ul className="space-y-1.5">
            {HEALTH_PROFILE_COPY.entryPublicBullets.map((item) => (
              <li key={item} className={PUBLIC_BODY}>
                • {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={`${PUBLIC_SHELL} luna-page-reports ${PUBLIC_SHELL_PAD}`}>
        <div className={`${PUBLIC_SHELL_INNER} ${PUBLIC_SURFACE} space-y-4`}>
        <p className={PUBLIC_H3}>My Health Reports</p>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{reportExplainer.title}</h3>
        <p className={PUBLIC_BODY}>{reportExplainer.body1}</p>
        <p className={PUBLIC_BODY}>{reportExplainer.body2}</p>
        <ul className="space-y-1.5">
          {reportExplainer.bullets.map((item) => (
            <li key={item} className={PUBLIC_BODY}>• {item}</li>
          ))}
        </ul>
        </div>
      </section>

      <section className={`${PUBLIC_SHELL} luna-page-journey ${PUBLIC_SHELL_PAD}`}>
        <div className={`${PUBLIC_SHELL_INNER} grid grid-cols-1 lg:grid-cols-2 gap-6 items-center`}>
          <div className={`${PUBLIC_CARD} space-y-4`}>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{about.finalTitle}</h3>
            <p className={PUBLIC_BODY}>{about.finalText1}</p>
            <p className={PUBLIC_BODY}>{about.finalText2}</p>
            <p className={PUBLIC_BODY}>{about.finalText3}</p>
          </div>
          <aside className="relative h-64 md:h-80 rounded-[1.4rem] overflow-hidden border border-slate-200/80 dark:border-slate-700/80">
            <img
              src={versionedStaticAsset('/images/window_reflection_portrait.webp')}
              alt="Luna29 Reflection Portrait"
              className="h-full w-full object-cover"
              style={{ objectPosition: '50% 28%' }}
            />
          </aside>
        </div>
      </section>
      </div>
    </section>
  );
};
