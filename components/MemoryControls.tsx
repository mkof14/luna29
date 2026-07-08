import React, { useCallback, useEffect, useState } from 'react';
import { Language } from '../constants';
import {
  disableMemoryConsent,
  enableMemoryConsent,
  getMemoryConsent,
  MemoryConsentResponse,
} from '../services/memoryConsentService';
import {
  confirmSignal,
  correctSignal,
  listSignals,
  rejectSignal,
  SignalRecord,
} from '../services/observationSignalsService';
import { listPatternCandidates, PatternCandidateRecord } from '../services/patternCandidatesService';
import { personalEventsService } from '../services/personalEventsService';
import { trackEvent } from '../services/analyticsService';
import {
  formatSignalHeadline,
  getCorrectionOptionsForSignal,
  humanizeSignalType,
} from '../utils/memorySignalLabels';
import { MEMORY_COPY } from '../utils/memoryCopy';

export { MEMORY_COPY };

type Props = {
  lang: Language;
  /** Compact embed (e.g. LiveAssistant sheet). */
  compact?: boolean;
  surface?: 'profile' | 'luna_live' | 'memory_settings';
  onClose?: () => void;
  onConsentChange?: (consent: MemoryConsentResponse) => void;
};

const c = MEMORY_COPY;

const publicSignalView = (signal: SignalRecord) => {
  const p = (signal.payload || {}) as Record<string, unknown>;
  return {
    id: signal.id,
    signal_type: String(p.signal_type || ''),
    normalized_value: (p.normalized_value as string | null) ?? null,
    display_label: typeof p.display_label === 'string' ? p.display_label : null,
    user_status: String(p.user_status || 'unreviewed'),
    occurred_at: signal.occurred_at,
  };
};

export const MemoryControls: React.FC<Props> = ({
  compact = false,
  surface = 'memory_settings',
  onClose,
  onConsentChange,
}) => {
  const [consent, setConsent] = useState<MemoryConsentResponse | null>(null);
  const [consentState, setConsentState] = useState<'loading' | 'ready' | 'unavailable' | 'error'>('loading');
  const [signals, setSignals] = useState<SignalRecord[]>([]);
  const [patterns, setPatterns] = useState<PatternCandidateRecord[]>([]);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');
  const [correctingId, setCorrectingId] = useState<string | null>(null);
  const [correctionValue, setCorrectionValue] = useState('');

  const applyConsent = (next: MemoryConsentResponse) => {
    setConsent(next);
    onConsentChange?.(next);
  };

  const refresh = useCallback(async () => {
    setActionError('');
    try {
      const next = await getMemoryConsent();
      if (next.status === 'consent_unavailable' || next.code) {
        applyConsent(next);
        setConsentState('unavailable');
        setSignals([]);
        setPatterns([]);
        return;
      }
      applyConsent(next);
      setConsentState('ready');
      trackEvent('memory_settings_viewed', { surface, action: 'view', result: 'ok' });

      const [sigRes, patRes] = await Promise.all([
        listSignals({ limit: 40 }).catch(() => ({ events: [] as SignalRecord[] })),
        listPatternCandidates({ limit: 20 }).catch(() => ({
          candidates: [] as PatternCandidateRecord[],
        })),
      ]);
      setSignals(Array.isArray(sigRes.events) ? sigRes.events : []);
      const pats = Array.isArray(patRes.candidates) ? patRes.candidates : [];
      setPatterns(
        pats.filter((p) => {
          const st = String(p.payload?.status || '');
          return st === 'candidate' || st === 'confirmed';
        }),
      );
    } catch {
      setConsentState('unavailable');
      applyConsent({
        status: 'consent_unavailable',
        consent_version: 'memory_consent_v1',
        enabled_at: null,
        disabled_at: null,
        memory_write_available: false,
      });
    }
  }, [surface, onConsentChange]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const memoryOn = consent?.status === 'enabled';

  const handleEnable = async () => {
    setBusy(true);
    setActionError('');
    try {
      const next = await enableMemoryConsent(surface);
      applyConsent(next);
      setConsentState(next.status === 'consent_unavailable' ? 'unavailable' : 'ready');
      trackEvent('memory_enabled', { surface, action: 'enable', result: 'ok' });
    } catch {
      setActionError(c.error);
      trackEvent('memory_enabled', { surface, action: 'enable', result: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const handleDisable = async () => {
    setBusy(true);
    setActionError('');
    try {
      const next = await disableMemoryConsent(surface);
      applyConsent(next);
      setConsentState(next.status === 'consent_unavailable' ? 'unavailable' : 'ready');
      trackEvent('memory_disabled', { surface, action: 'disable', result: 'ok' });
    } catch {
      setActionError(c.error);
      trackEvent('memory_disabled', { surface, action: 'disable', result: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const refreshSignals = async () => {
    const sigRes = await listSignals({ limit: 40 }).catch(() => ({ events: [] as SignalRecord[] }));
    setSignals(Array.isArray(sigRes.events) ? sigRes.events : []);
    const patRes = await listPatternCandidates({ limit: 20 }).catch(() => ({
      candidates: [] as PatternCandidateRecord[],
    }));
    const pats = Array.isArray(patRes.candidates) ? patRes.candidates : [];
    setPatterns(
      pats.filter((p) => {
        const st = String(p.payload?.status || '');
        return st === 'candidate' || st === 'confirmed';
      }),
    );
  };

  const handleConfirm = async (id: string) => {
    setBusy(true);
    setActionError('');
    try {
      await confirmSignal(id);
      trackEvent('memory_signal_confirmed', { surface: 'memory', action: 'confirm', result: 'ok' });
      await refreshSignals();
    } catch {
      setActionError(c.error);
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async (id: string) => {
    setBusy(true);
    setActionError('');
    try {
      await rejectSignal(id);
      trackEvent('memory_signal_rejected', { surface: 'memory', action: 'reject', result: 'ok' });
      await refreshSignals();
    } catch {
      setActionError(c.error);
    } finally {
      setBusy(false);
    }
  };

  const handleCorrect = async (signal: SignalRecord) => {
    if (!correctionValue) return;
    setBusy(true);
    setActionError('');
    try {
      await correctSignal(signal.id, {
        normalized_value: correctionValue,
      });
      trackEvent('memory_signal_corrected', { surface: 'memory', action: 'correct', result: 'ok' });
      setCorrectingId(null);
      setCorrectionValue('');
      await refreshSignals();
    } catch {
      setActionError(c.error);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: string) => {
    setBusy(true);
    setActionError('');
    try {
      await personalEventsService.softDeleteEvent(id);
      trackEvent('memory_item_deleted', { surface: 'memory', action: 'delete', result: 'ok' });
      await refreshSignals();
    } catch {
      setActionError(c.error);
    } finally {
      setBusy(false);
    }
  };

  const unreviewed = signals.filter((s) => publicSignalView(s).user_status === 'unreviewed');
  const confirmed = signals.filter((s) => {
    const st = publicSignalView(s).user_status;
    return st === 'confirmed' || st === 'corrected';
  });
  const remembered = [...confirmed, ...unreviewed].slice(0, 24);

  const statusLabel =
    consentState === 'unavailable' ? c.statusUnavailable : memoryOn ? c.statusOn : c.statusOff;

  return (
    <section
      data-testid="memory-controls"
      className={`space-y-5 ${compact ? '' : 'luna-vivid-surface p-6 md:p-8 rounded-[2rem]'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-slate-100">{c.title}</h2>
          <p
            data-testid="memory-status"
            className="mt-1 text-[11px] font-black uppercase tracking-[0.16em] text-luna-purple dark:text-[#d8b4fe]"
          >
            {statusLabel}
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100"
          >
            {c.close}
          </button>
        )}
      </div>

      {consentState === 'loading' && <p className="text-sm text-slate-500">{c.loading}</p>}

      {consentState === 'unavailable' && (
        <p data-testid="memory-unavailable" className="text-sm font-medium text-amber-700 dark:text-amber-300">
          {c.unavailable}
        </p>
      )}

      {consentState === 'ready' && (
        <>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{c.explanation}</p>

          <div className="flex flex-wrap gap-2">
            {memoryOn ? (
              <button
                type="button"
                data-testid="memory-disable"
                disabled={busy}
                onClick={() => void handleDisable()}
                className="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.14em] border border-slate-300 dark:border-slate-600"
              >
                {c.disable}
              </button>
            ) : (
              <button
                type="button"
                data-testid="memory-enable"
                disabled={busy}
                onClick={() => void handleEnable()}
                className="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.14em] bg-luna-purple text-white"
              >
                {c.enable}
              </button>
            )}
          </div>

          {memoryOn ? null : (
            <p data-testid="memory-off-copy" className="text-sm text-slate-500 dark:text-slate-400">
              {c.memoryOff}
            </p>
          )}
          <p data-testid="memory-disable-note" className="text-xs text-slate-500 dark:text-slate-400">
            {c.disableKeeps}
          </p>
        </>
      )}

      {actionError && <p className="text-xs font-bold text-rose-500">{actionError}</p>}

      {(consentState === 'ready' || consentState === 'unavailable') && (
        <>
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500 mb-2">{c.needsReview}</h3>
            {unreviewed.length === 0 ? (
              <p data-testid="memory-no-review" className="text-sm text-slate-500">
                {c.nothingReview}
              </p>
            ) : (
              <ul className="space-y-3" data-testid="memory-review-queue">
                {unreviewed.slice(0, 12).map((signal) => {
                  const view = publicSignalView(signal);
                  const options = getCorrectionOptionsForSignal(view.signal_type);
                  return (
                    <li
                      key={signal.id}
                      className="rounded-2xl border border-slate-200/80 dark:border-slate-700/60 p-3 space-y-2"
                    >
                      <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-300">
                        {c.inferred}
                      </p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {humanizeSignalType(view.signal_type)} — {formatSignalHeadline(view)}
                      </p>
                      {correctingId === signal.id ? (
                        <div className="flex flex-wrap gap-2 items-center">
                          <select
                            data-testid={`memory-correct-select-${signal.id}`}
                            value={correctionValue}
                            onChange={(e) => setCorrectionValue(e.target.value)}
                            className="text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent px-2 py-1"
                          >
                            <option value="">Select…</option>
                            {options.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt.replace(/_/g, ' ')}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            disabled={busy || !correctionValue}
                            onClick={() => void handleCorrect(signal)}
                            className="text-[10px] font-black uppercase tracking-widest text-luna-purple"
                          >
                            {c.saveCorrection}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCorrectingId(null);
                              setCorrectionValue('');
                            }}
                            className="text-[10px] font-black uppercase tracking-widest opacity-60"
                          >
                            {c.cancel}
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            data-testid={`memory-confirm-${signal.id}`}
                            disabled={busy}
                            onClick={() => void handleConfirm(signal.id)}
                            className="text-[10px] font-black uppercase tracking-widest text-emerald-600"
                          >
                            {c.confirm}
                          </button>
                          <button
                            type="button"
                            data-testid={`memory-reject-${signal.id}`}
                            disabled={busy}
                            onClick={() => void handleReject(signal.id)}
                            className="text-[10px] font-black uppercase tracking-widest text-rose-500"
                          >
                            {c.notRight}
                          </button>
                          {options.length > 0 && (
                            <button
                              type="button"
                              data-testid={`memory-correct-${signal.id}`}
                              disabled={busy}
                              onClick={() => {
                                setCorrectingId(signal.id);
                                setCorrectionValue(view.normalized_value || '');
                              }}
                              className="text-[10px] font-black uppercase tracking-widest text-luna-purple"
                            >
                              {c.correct}
                            </button>
                          )}
                          <button
                            type="button"
                            data-testid={`memory-delete-${signal.id}`}
                            disabled={busy}
                            onClick={() => void handleDelete(signal.id)}
                            className="text-[10px] font-black uppercase tracking-widest opacity-50"
                          >
                            {c.delete}
                          </button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500 mb-2">{c.confirmedByYou}</h3>
            {confirmed.length === 0 ? (
              <p className="text-sm text-slate-500">{c.nothingSaved}</p>
            ) : (
              <ul className="space-y-2" data-testid="memory-confirmed-list">
                {confirmed.slice(0, 12).map((signal) => {
                  const view = publicSignalView(signal);
                  return (
                    <li
                      key={signal.id}
                      className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 p-3"
                    >
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                          {c.youConfirmed}
                        </p>
                        <p className="text-sm font-semibold">
                          {humanizeSignalType(view.signal_type)} — {formatSignalHeadline(view)}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void handleDelete(signal.id)}
                        className="text-[10px] font-black uppercase tracking-widest opacity-50"
                      >
                        {c.delete}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500 mb-2">{c.patterns}</h3>
            {patterns.length === 0 ? (
              <p className="text-sm text-slate-500">{c.nothingSaved}</p>
            ) : (
              <ul className="space-y-2" data-testid="memory-patterns-list">
                {patterns.slice(0, 8).map((p) => {
                  const st = String(p.payload?.status || 'candidate');
                  const title = String(p.payload?.title || p.payload?.description || 'Pattern');
                  return (
                    <li key={p.id} className="rounded-2xl border border-slate-200/60 dark:border-slate-700/50 p-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        {st === 'confirmed' ? c.confirmedPattern : c.possiblePattern}
                      </p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</p>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500 mb-2">{c.whatRemembers}</h3>
            {remembered.length === 0 ? (
              <p data-testid="memory-nothing-saved" className="text-sm text-slate-500">
                {c.nothingSaved}
              </p>
            ) : (
              <p className="text-xs text-slate-500">{remembered.length} recent item(s) shown above.</p>
            )}
            <p className="mt-2 text-[11px] text-slate-400">{c.bulkDeferred}</p>
          </div>
        </>
      )}
    </section>
  );
};

export default MemoryControls;
