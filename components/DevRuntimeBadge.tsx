import React, { useMemo, useState } from 'react';
import { hardResetLocalDev, isLocalRuntimeHost } from '../utils/devRuntime';

export const DevRuntimeBadge: React.FC = () => {
  const [busy, setBusy] = useState(false);

  const { port, hostWarning } = useMemo(() => {
    if (typeof window === 'undefined') {
      return { port: '3000', hostWarning: false };
    }
    return {
      port: window.location.port || '80',
      hostWarning: window.location.hostname !== 'localhost',
    };
  }, []);

  if (!import.meta.env.DEV) return null;

  const handleReset = async () => {
    setBusy(true);
    try {
      await hardResetLocalDev();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed bottom-3 left-3 z-[9999] flex flex-col items-start gap-2 pointer-events-auto">
      <div className="rounded-full border border-amber-400/60 bg-amber-100/95 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-amber-900 shadow-lg dark:border-amber-500/50 dark:bg-amber-950/90 dark:text-amber-100">
        Dev · localhost:{port}
      </div>
      {hostWarning && (
        <p className="max-w-[220px] rounded-xl border border-red-300/70 bg-red-50/95 px-3 py-2 text-[10px] font-semibold text-red-700 dark:border-red-500/40 dark:bg-red-950/90 dark:text-red-200">
          Use http://localhost:3000 — not {typeof window !== 'undefined' ? window.location.host : '127.0.0.1'}.
        </p>
      )}
      <button
        type="button"
        onClick={() => void handleReset()}
        disabled={busy}
        className="rounded-full border border-amber-500/50 bg-white/95 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-amber-900 shadow-md hover:bg-amber-50 disabled:opacity-60 dark:bg-slate-900/95 dark:text-amber-100"
      >
        {busy ? 'Resetting…' : 'Reset browser cache'}
      </button>
      {!isLocalRuntimeHost() && (
        <a
          href="http://localhost:3000"
          className="text-[10px] font-semibold text-amber-900 underline underline-offset-2 dark:text-amber-100"
        >
          Open localhost:3000
        </a>
      )}
    </div>
  );
};
