import React from 'react';
import { AdminZoneCopy } from '../../utils/adminZoneCopy';
import { useAdminTheme } from './AdminThemeContext';
import { adminBtnSecondary } from './adminStyles';
import {
  copyTextSafely,
  downloadHtmlFile,
  downloadTextFile,
  exportHtmlAsPdf,
  printHtmlDocument,
  shareContent,
} from '../../utils/adminDocumentActions';

type AdminActionBarProps = {
  copy: AdminZoneCopy;
  title: string;
  html?: string;
  text?: string;
  filename?: string;
  onFeedback?: (msg: string) => void;
  compact?: boolean;
};

/** Copy · Share · Print · Download · PDF — reusable across templates, campaigns, audit. */
export const AdminActionBar: React.FC<AdminActionBarProps> = ({
  copy,
  title,
  html = '',
  text = '',
  filename = 'luna29-export',
  onFeedback,
  compact = false,
}) => {
  const { mode } = useAdminTheme();
  const btn = `${adminBtnSecondary(mode)} ${compact ? 'px-2 py-1.5 text-[9px]' : ''}`;

  const notify = (msg: string) => onFeedback?.(msg);

  const runCopy = async () => {
    const payload = text || html.replace(/<[^>]+>/g, ' ').trim();
    const ok = await copyTextSafely(payload);
    notify(ok ? copy.actionsCopied : 'Copy failed.');
  };

  const runShare = async () => {
    const ok = await shareContent({ title, text: text || title, url: typeof window !== 'undefined' ? window.location.href : undefined });
    notify(ok ? copy.actionsShared : copy.actionsCopied);
    if (!ok) await runCopy();
  };

  const runPrint = () => {
    if (!html) return;
    printHtmlDocument(title, html);
  };

  const runDownload = () => {
    if (html) downloadHtmlFile(filename, html);
    else if (text) downloadTextFile(`${filename}.txt`, text);
  };

  const runPdf = () => {
    if (!html) return;
    exportHtmlAsPdf(title, html);
  };

  return (
    <div className={`flex flex-wrap gap-2 ${compact ? '' : 'pt-2'}`}>
      <button type="button" className={btn} onClick={() => void runCopy()}>{copy.actionsCopy}</button>
      <button type="button" className={btn} onClick={() => void runShare()}>{copy.actionsShare}</button>
      <button type="button" className={btn} onClick={runPrint} disabled={!html}>{copy.actionsPrint}</button>
      <button type="button" className={btn} onClick={runDownload} disabled={!html && !text}>{copy.actionsDownload}</button>
      <button type="button" className={btn} onClick={runPdf} disabled={!html}>{copy.actionsPdf}</button>
    </div>
  );
};
