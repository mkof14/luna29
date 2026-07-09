import React, { useState } from 'react';
import { Language } from '../constants';
import { clearLunaLocalData, downloadLunaLocalDataExport } from '../utils/privacyCompliance';
import { deleteAuthenticatedAccount } from '../services/accountDeletionService';
import {
  getLegalDoc,
  getLegalEffectiveDate,
  getLegalNavLabels,
  getLegalUi,
  LEGAL_DOC_META,
  LegalDocType,
  LegalNavDocType,
} from '../utils/legal';
import { LunaMenuLabel } from './SmoothLangText';
import { PublicHeroBlock } from './public/PublicHeroBlock';
import { PUBLIC_PAGE_ART, PublicArtPage } from '../utils/publicPageArt';
import { getMemberHeroImage } from '../utils/memberHeroImages';
import { MEMBER_PAGE_KNOWLEDGE } from '../utils/memberPageStyles';
import { MemberBackButton } from './member/MemberBackButton';
import {
  PUBLIC_BODY,
  PUBLIC_CARD,
  PUBLIC_CARD_SOFT,
  PUBLIC_CHIP,
  PUBLIC_EYEBROW,
  PUBLIC_H1,
  PUBLIC_H2,
  PUBLIC_PAGE_STACK,
  PUBLIC_SHELL,
  PUBLIC_SHELL_INNER,
  PUBLIC_SHELL_PAD,
  PUBLIC_SURFACE,
} from './public/publicPageStyles';

export type { LegalDocType };

interface LegalDocumentViewProps {
  lang: Language;
  doc: LegalDocType;
  onBack?: () => void;
  onNavigateDoc?: (doc: LegalNavDocType) => void;
  mode?: 'member' | 'public';
}

export const LegalDocumentView: React.FC<LegalDocumentViewProps> = ({ lang, doc, onBack, onNavigateDoc, mode = 'member' }) => {
  const copy = getLegalDoc(lang, doc);
  const ui = getLegalUi(lang);
  const navLabels = getLegalNavLabels(lang);
  const modeLabel = mode === 'public' ? ui.modePublic : ui.modeMember;
  const meta = LEGAL_DOC_META[doc];
  const effectiveDate = getLegalEffectiveDate(lang);
  const lastUpdated = effectiveDate;
  const [actionFeedback, setActionFeedback] = useState('');

  const downloadJson = (filename: string, payload: unknown) => {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const exportLocalData = async () => {
    try {
      const response = await fetch('/api/privacy/export', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (response.ok) {
        const payload = await response.json();
        downloadJson(`luna-server-export-${payload.requestId || Date.now()}.json`, payload);
        setActionFeedback(ui.feedbackServerExport);
        return;
      }
    } catch {
      // fallback to local export below
    }

    downloadLunaLocalDataExport();
    setActionFeedback(ui.feedbackLocalExport);
  };

  const deleteHealthData = async () => {
    const result = await deleteAuthenticatedAccount('support_only');
    if (result.ok) {
      setActionFeedback(ui.feedbackServerSupportDelete);
      return;
    }
    // Only anonymous/unauthenticated may fall back to local-only health purge.
    if (result.status === 401) {
      const removed = clearLunaLocalData(false);
      setActionFeedback(`${ui.feedbackLocalHealthDelete}: ${removed} keys.`);
      return;
    }
    setActionFeedback(result.error || 'Support data deletion failed. You can retry.');
  };

  const deleteAllData = async () => {
    const confirmed = window.confirm(ui.confirmDeleteAll);
    if (!confirmed) return;

    const result = await deleteAuthenticatedAccount('account');
    if (result.ok) {
      setActionFeedback(ui.feedbackServerAccountDelete);
      window.location.reload();
      return;
    }
    // Do not purge account keys on server failure — preserve retry capability.
    if (result.status === 401) {
      const removed = clearLunaLocalData(true);
      setActionFeedback(`${ui.feedbackAllLocalDelete}: ${removed} keys.`);
      window.location.reload();
      return;
    }
    setActionFeedback(result.error || 'Account deletion failed. You can retry.');
  };

  const docArtPage: PublicArtPage =
    doc === 'medical' ? 'medical' : doc === 'terms' ? 'terms' : doc === 'cookies' ? 'cookies' : doc === 'data_rights' ? 'data_rights' : 'privacy';
  const heroImage = mode === 'public' ? PUBLIC_PAGE_ART[docArtPage] : getMemberHeroImage(docArtPage === 'medical' ? 'medical' : docArtPage === 'terms' ? 'terms' : docArtPage === 'cookies' ? 'cookies' : docArtPage === 'data_rights' ? 'data_rights' : 'privacy');

  return (
    <article className={mode === 'public'
      ? `${PUBLIC_PAGE_STACK} max-w-5xl mx-auto pb-8`
      : `${MEMBER_PAGE_KNOWLEDGE} ${PUBLIC_PAGE_STACK}`}>
      {onBack && mode === 'member' && <MemberBackButton lang={lang} onClick={onBack} />}
      {onBack && mode === 'public' && (
        <button onClick={onBack} className={`${PUBLIC_CHIP} hover:border-luna-purple/45 transition-colors`}>
          ← {ui.back}
        </button>
      )}

      <section className={`${PUBLIC_SHELL} luna-page-questions ${PUBLIC_SHELL_PAD}`}>
        <div className={PUBLIC_SHELL_INNER}>
          <PublicHeroBlock
            eyebrow={modeLabel}
            title={copy.title}
            subtitle={copy.subtitle}
            image={heroImage}
            imageAlt={copy.title}
          />
        </div>
      </section>

      <section className={`${PUBLIC_SHELL} luna-page-questions ${PUBLIC_SHELL_PAD}`}>
        <div className={`${PUBLIC_SHELL_INNER} ${PUBLIC_SURFACE} space-y-4`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className={`${PUBLIC_CHIP} p-3`}>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">{ui.effectiveDate}</p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-100">{effectiveDate}</p>
          </div>
          <div className={`${PUBLIC_CHIP} p-3`}>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">{ui.lastUpdated}</p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-100">{lastUpdated}</p>
          </div>
        </div>
        </div>
      </section>
      <section className={mode === 'public' ? 'grid grid-cols-1 gap-5' : 'grid grid-cols-1 gap-5'}>
        {copy.sections.map((section) => (
          <article key={section.heading} className={mode === 'public' ? `${PUBLIC_CARD} space-y-2` : 'rounded-[2rem] border border-slate-200 dark:border-slate-700 luna-vivid-card p-6 md:p-7'}>
            <h2 className={mode === 'public' ? PUBLIC_H2 : 'text-xl font-black tracking-tight text-slate-900 dark:text-slate-100'}>{section.heading}</h2>
            <p className={`mt-2 ${mode === 'public' ? PUBLIC_BODY : 'text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed'}`}>{section.body}</p>
          </article>
        ))}
      </section>
      {doc === 'legal' && onNavigateDoc && (
        <section className={mode === 'public' ? `${PUBLIC_SURFACE} space-y-4` : 'rounded-[2rem] border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 p-6 md:p-7 space-y-4'}>
          <h2 className={mode === 'public' ? PUBLIC_H2 : 'text-xl font-black tracking-tight text-slate-900 dark:text-slate-100'}>{ui.documentsTitle}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(Object.keys(navLabels) as LegalNavDocType[]).map((docId) => (
              <button
                key={docId}
                type="button"
                onClick={() => onNavigateDoc(docId)}
                className="text-left px-4 py-3 rounded-2xl border border-slate-300/70 dark:border-slate-700/70 hover:border-luna-purple/45 transition-colors"
              >
                <span className="mr-2" aria-hidden="true">{LEGAL_DOC_META[docId].icon}</span>
                <LunaMenuLabel text={navLabels[docId]} muted className="font-semibold" />
              </button>
            ))}
          </div>
        </section>
      )}
      {doc === 'data_rights' && (
        <section className={mode === 'public' ? `${PUBLIC_SURFACE} space-y-4` : 'rounded-[2rem] border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 p-6 md:p-7 space-y-4'}>
          <h2 className={mode === 'public' ? PUBLIC_H2 : 'text-xl font-black tracking-tight text-slate-900 dark:text-slate-100'}>{ui.actionsTitle}</h2>
          <p className={mode === 'public' ? PUBLIC_BODY : 'text-sm font-semibold text-slate-700 dark:text-slate-300'}>
            {ui.actionsBody}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <button onClick={exportLocalData} className="px-4 py-2 rounded-full border border-luna-purple/40 text-luna-purple text-xs font-black uppercase tracking-[0.12em]">
              {ui.exportData}
            </button>
            <button onClick={deleteHealthData} className="px-4 py-2 rounded-full border border-amber-500/40 text-amber-600 text-xs font-black uppercase tracking-[0.12em]">
              {ui.deleteHealth}
            </button>
            <button onClick={deleteAllData} className="px-4 py-2 rounded-full border border-rose-500/40 text-rose-600 text-xs font-black uppercase tracking-[0.12em]">
              {ui.deleteAll}
            </button>
          </div>
          {actionFeedback && <p className={PUBLIC_BODY}>{actionFeedback}</p>}
        </section>
      )}
      <div className={mode === 'public' ? `${PUBLIC_CARD_SOFT}` : 'rounded-2xl border border-slate-300/70 dark:border-slate-700/70 bg-slate-100/85 dark:bg-slate-900/45 p-5'}>
        <p className={PUBLIC_EYEBROW}>{ui.legalNotice}</p>
        <p className={`mt-2 ${PUBLIC_BODY}`}>
          {ui.legalNoticeBody}
        </p>
        <p className={`mt-3 ${PUBLIC_BODY}`}>{ui.controllingLanguageNote}</p>
      </div>
    </article>
  );
};
