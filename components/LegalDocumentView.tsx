import React, { useState } from 'react';
import { Language } from '../constants';
import { clearLunaLocalData, downloadLunaLocalDataExport } from '../utils/privacyCompliance';
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
    try {
      const response = await fetch('/api/privacy/delete', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scope: 'support_only' }),
      });
      if (response.ok) {
        setActionFeedback(ui.feedbackServerSupportDelete);
        return;
      }
    } catch {
      // fallback to local delete below
    }
    const removed = clearLunaLocalData(false);
    setActionFeedback(`${ui.feedbackLocalHealthDelete}: ${removed} keys.`);
  };

  const deleteAllData = async () => {
    const confirmed = window.confirm(ui.confirmDeleteAll);
    if (!confirmed) return;

    try {
      const response = await fetch('/api/privacy/delete', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scope: 'account' }),
      });
      if (response.ok) {
        setActionFeedback(ui.feedbackServerAccountDelete);
        window.location.reload();
        return;
      }
    } catch {
      // fallback to local delete below
    }

    const removed = clearLunaLocalData(true);
    setActionFeedback(`${ui.feedbackAllLocalDelete}: ${removed} keys.`);
    window.location.reload();
  };

  return (
    <article className={mode === 'public'
      ? `${PUBLIC_PAGE_STACK} max-w-5xl mx-auto pb-8`
      : 'max-w-5xl mx-auto luna-page-shell luna-page-questions space-y-10 animate-in fade-in duration-700 pb-24 p-8 md:p-10'}>
      {onBack && (
        <button onClick={onBack} className={mode === 'public'
          ? `${PUBLIC_CHIP} hover:border-luna-purple/45 transition-colors`
          : 'text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-luna-purple transition-all'}>
          ← {ui.back}
        </button>
      )}
      <header className={mode === 'public'
        ? `${PUBLIC_SHELL} luna-page-questions ${PUBLIC_SHELL_PAD} space-y-4`
        : 'rounded-[2rem] border border-slate-200 dark:border-slate-700 luna-vivid-surface p-6 md:p-7 space-y-4'}>
        <div className={`${mode === 'public' ? PUBLIC_SHELL_INNER : ''} space-y-4`}>
        <div className="flex items-center gap-3">
          <span className="text-3xl" aria-hidden="true">{meta.icon}</span>
          <p className={mode === 'public' ? PUBLIC_EYEBROW : `text-[10px] font-black uppercase tracking-[0.4em] ${meta.accent}`}>{modeLabel}</p>
        </div>
        <h1 className={mode === 'public' ? PUBLIC_H1 : 'text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-slate-100'}>{copy.title}</h1>
        <p className={mode === 'public' ? PUBLIC_BODY : 'text-base font-semibold text-slate-600 dark:text-slate-300'}>{copy.subtitle}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
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
      </header>
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
