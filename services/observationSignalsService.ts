/**
 * Thin authenticated client for observation + structured signal extraction (Task 3).
 * Does not replace localStorage event log. Opt-in from eligible surfaces.
 */
export type ObservationRecord = {
  id: string;
  user_id: string;
  event_type: 'observation';
  occurred_at: string;
  created_at: string;
  updated_at: string;
  source: string;
  payload: Record<string, unknown>;
  schema_version: number;
  client_event_id: string | null;
  deleted_at: string | null;
};

export type SignalRecord = {
  id: string;
  user_id: string;
  event_type: 'signal';
  occurred_at: string;
  created_at: string;
  updated_at: string;
  source: string;
  payload: Record<string, unknown>;
  schema_version: number;
  client_event_id: string | null;
  deleted_at: string | null;
};

export type ObservationCreateResult = {
  observation: ObservationRecord;
  signals: SignalRecord[];
  extraction: {
    status: string;
    reason?: string | null;
    provider?: string | null;
    extractor_version?: string | null;
    signal_count?: number;
  };
};

const apiUrl = (path: string) => {
  const fromEnv = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ?? '';
  const base =
    fromEnv && !fromEnv.includes('localhost') && !fromEnv.includes('127.0.0.1')
      ? fromEnv.replace(/\/$/, '')
      : '';
  return `${base}${path}`;
};

const parseJson = async <T>(response: Response): Promise<T & { error?: string; code?: string }> => {
  const raw = await response.text();
  return raw ? (JSON.parse(raw) as T & { error?: string; code?: string }) : ({} as T & { error?: string; code?: string });
};

export type CreateObservationInput = {
  raw_text: string;
  observation_kind?: string;
  input_mode?: string;
  source_surface?: string;
  language?: string;
  transcript_status?: string;
  session_id?: string;
  original_event_id?: string;
  client_event_id?: string;
  occurred_at?: string;
  extract?: boolean;
};

/**
 * Persist a source observation and optionally run structured signal extraction.
 * Fire-and-forget safe: callers may ignore failures without blocking local UX.
 */
export const createObservationWithExtraction = async (
  input: CreateObservationInput,
): Promise<ObservationCreateResult> => {
  const response = await fetch(apiUrl('/api/personal/observations'), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const data = await parseJson<ObservationCreateResult>(response);
  if (!response.ok) {
    const err = new Error(data.error || `Request failed (${response.status})`) as Error & {
      status?: number;
      code?: string;
    };
    err.status = response.status;
    err.code = data.code;
    throw err;
  }
  return {
    observation: data.observation,
    signals: Array.isArray(data.signals) ? data.signals : [],
    extraction: data.extraction || { status: 'unknown' },
  };
};

export const listObservations = async (params: {
  since?: string;
  until?: string;
  limit?: number;
  offset?: number;
} = {}) => {
  const query = new URLSearchParams();
  if (params.since) query.set('since', params.since);
  if (params.until) query.set('until', params.until);
  if (params.limit != null) query.set('limit', String(params.limit));
  if (params.offset != null) query.set('offset', String(params.offset));
  const suffix = query.toString() ? `?${query.toString()}` : '';
  const response = await fetch(apiUrl(`/api/personal/observations${suffix}`), {
    method: 'GET',
    credentials: 'include',
  });
  const data = await parseJson<{ events: ObservationRecord[]; total: number; limit: number; offset: number }>(
    response,
  );
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
};

export const listSignals = async (params: {
  since?: string;
  until?: string;
  limit?: number;
  offset?: number;
  user_status?: string;
  source_observation_id?: string;
} = {}) => {
  const query = new URLSearchParams();
  if (params.since) query.set('since', params.since);
  if (params.until) query.set('until', params.until);
  if (params.limit != null) query.set('limit', String(params.limit));
  if (params.offset != null) query.set('offset', String(params.offset));
  if (params.user_status) query.set('user_status', params.user_status);
  if (params.source_observation_id) query.set('source_observation_id', params.source_observation_id);
  const suffix = query.toString() ? `?${query.toString()}` : '';
  const response = await fetch(apiUrl(`/api/personal/signals${suffix}`), {
    method: 'GET',
    credentials: 'include',
  });
  const data = await parseJson<{ events: SignalRecord[]; total: number; limit: number; offset: number }>(response);
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
};

export const confirmSignal = async (signalId: string) => {
  const response = await fetch(apiUrl(`/api/personal/signals/${encodeURIComponent(signalId)}/confirm`), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  const data = await parseJson<{ signal: SignalRecord }>(response);
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
};

export const rejectSignal = async (signalId: string) => {
  const response = await fetch(apiUrl(`/api/personal/signals/${encodeURIComponent(signalId)}/reject`), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  const data = await parseJson<{ signal: SignalRecord }>(response);
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
};

export const correctSignal = async (
  signalId: string,
  correction: {
    normalized_value?: string | null;
    display_label?: string;
    negated?: boolean;
    uncertain?: boolean;
    note?: string;
  },
) => {
  const response = await fetch(apiUrl(`/api/personal/signals/${encodeURIComponent(signalId)}/correct`), {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(correction),
  });
  const data = await parseJson<{ signal: SignalRecord }>(response);
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
};

export const observationSignalsService = {
  createObservationWithExtraction,
  listObservations,
  listSignals,
  confirmSignal,
  rejectSignal,
  correctSignal,
};
