import React from 'react';
import { Download, FileText, Mail, Printer, Share2 } from 'lucide-react';

const actionBtn =
  'inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-slate-300/70 dark:border-slate-600/70 bg-white/80 dark:bg-slate-900/60 text-[10px] font-black uppercase tracking-[0.14em] text-slate-600 dark:text-slate-200 hover:border-luna-purple/50 hover:text-luna-purple transition-all';

type Props = {
  onShare: () => void;
  onPrint: () => void;
  onDownloadMonth: () => void;
  onDownloadYearIcs: () => void;
  onDownloadYearPdf: () => void;
  onSend: () => void;
  labels: {
    share: string;
    print: string;
    download: string;
    downloadYear: string;
    downloadPdf: string;
    send: string;
  };
  className?: string;
};

export const CalendarActionsBar: React.FC<Props> = ({
  onShare,
  onPrint,
  onDownloadMonth,
  onDownloadYearIcs,
  onDownloadYearPdf,
  onSend,
  labels,
  className = '',
}) => (
  <div className={`flex flex-wrap gap-2 luna-rhythm-calendar__actions ${className}`}>
    <button type="button" onClick={onShare} className={actionBtn}>
      <Share2 size={13} /> {labels.share}
    </button>
    <button type="button" onClick={onPrint} className={actionBtn}>
      <Printer size={13} /> {labels.print}
    </button>
    <button type="button" onClick={onDownloadYearPdf} className={`${actionBtn} border-luna-purple/35 text-luna-purple`}>
      <FileText size={13} /> {labels.downloadPdf}
    </button>
    <button type="button" onClick={onDownloadMonth} className={actionBtn}>
      <Download size={13} /> {labels.download}
    </button>
    <button type="button" onClick={onDownloadYearIcs} className={actionBtn}>
      <Download size={13} /> {labels.downloadYear}
    </button>
    <button type="button" onClick={onSend} className={actionBtn}>
      <Mail size={13} /> {labels.send}
    </button>
  </div>
);
