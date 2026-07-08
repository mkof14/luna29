/**
 * Thin authenticated client for Pattern Candidate Engine v1 (Task 5).
 * No UI wiring. No speculative state.
 */
export type PatternCandidateStatus = 'candidate' | 'confirmed' | 'rejected' | 'stale' | 'invalidated';

export type PatternCandidateType =
  | 'repeated_signal'
  | 'repeated_co_occurrence'
  | 'repeated_temporal_proximity'
  | 'sustained_recording_increase';

export type PatternCandidateRecord = {
  id: string;
  user_id: string;
  event_type: 'pattern_candidate';
  occurred_at: string;
  created_at: string;
  updated_at: string;
  source: string;
  payload: {
    candidate_type: PatternCandidateType;
    candidate_key: string;
    title: string;
    description: string;
    semantics: Record<string, boolean | string>;
    status: PatternCandidateStatus;
    confidence_band: 'low' | 'moderate' | 'strong';
    evidence_count: number;
    active_days: number;
    first_evidence_at: string | null;
    latest_evidence_at: string | null;
    evidence_window_start: string | null;
    evidence_window_end: string | null;
    evidence_signal_ids: string[];
    evidence_observation_ids: string[];
    signal_definitions: Array<{ signal_type: string; normalized_value: string | null }>;
    threshold_definition: Record<string, unknown>;
    uncertainty_summary: Record<string, unknown>;
    generated_by: string;
    engine_version: string;
    generated_at: string;
    last_evaluated_at: string;
    invalidation_reason: string | null;
    user_confirmed_at: string | null;
    user_rejected_at: string | null;
    supersedes_candidate_id: string | null;
    timezone?: string;
    [key: string]: unknown;
  };
  schema_version: number;
  client_event_id: string | null;
  deleted_at: string | null;
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
  return raw ? (JSON.parse(raw) as T & { error?: string; code?: string }) : ({} as T & { error?: string });
};

export const evaluatePatternCandidates = async (params: {
  timezone?: string;
  window_days?: number;
} = {}) => {
  const response = await fetch(apiUrl('/api/personal/pattern-candidates/evaluate'), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await parseJson<{
    candidates: PatternCandidateRecord[];
    created: number;
    updated: number;
    invalidated: number;
    stale: number;
    suppressed_rejected: number;
    evaluated_at: string;
    engine_version: string;
    threshold_version: string;
  }>(response);
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
};

export const listPatternCandidates = async (params: {
  status?: PatternCandidateStatus;
  candidate_type?: PatternCandidateType;
  since?: string;
  limit?: number;
  offset?: number;
  timezone?: string;
} = {}) => {
  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);
  if (params.candidate_type) query.set('candidate_type', params.candidate_type);
  if (params.since) query.set('since', params.since);
  if (params.limit != null) query.set('limit', String(params.limit));
  if (params.offset != null) query.set('offset', String(params.offset));
  if (params.timezone) query.set('timezone', params.timezone);
  const suffix = query.toString() ? `?${query.toString()}` : '';
  const response = await fetch(apiUrl(`/api/personal/pattern-candidates${suffix}`), {
    method: 'GET',
    credentials: 'include',
  });
  const data = await parseJson<{
    candidates: PatternCandidateRecord[];
    total: number;
    limit: number;
    offset: number;
  }>(response);
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
};

export const getPatternCandidate = async (candidateId: string) => {
  const response = await fetch(
    apiUrl(`/api/personal/pattern-candidates/${encodeURIComponent(candidateId)}`),
    { method: 'GET', credentials: 'include' },
  );
  const data = await parseJson<{ candidate: PatternCandidateRecord }>(response);
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
};

export const confirmPatternCandidate = async (candidateId: string) => {
  const response = await fetch(
    apiUrl(`/api/personal/pattern-candidates/${encodeURIComponent(candidateId)}/confirm`),
    { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: '{}' },
  );
  const data = await parseJson<{ ok: boolean; candidate: PatternCandidateRecord }>(response);
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
};

export const rejectPatternCandidate = async (candidateId: string) => {
  const response = await fetch(
    apiUrl(`/api/personal/pattern-candidates/${encodeURIComponent(candidateId)}/reject`),
    { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: '{}' },
  );
  const data = await parseJson<{ ok: boolean; candidate: PatternCandidateRecord }>(response);
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
};

export const patternCandidatesService = {
  evaluate: evaluatePatternCandidates,
  list: listPatternCandidates,
  get: getPatternCandidate,
  confirm: confirmPatternCandidate,
  reject: rejectPatternCandidate,
};
