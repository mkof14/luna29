/**
 * Thin authenticated client for the deterministic longitudinal timeline query layer.
 * No UI wiring. No LLM. Facts only.
 */
export type TimelineOccurrence = {
  signal_id: string;
  source_observation_id: string | null;
  occurred_at: string;
  local_day: string | null;
  signal_type: string | null;
  normalized_value: string | null;
  display_label: string | null;
  user_status: string;
  uncertain: boolean;
  negated: boolean;
  confidence: number | null;
  evidence_text: string | null;
  temporal_context: Record<string, unknown> | null;
  source_surface: string | null;
  extractor_version: string | null;
};

export type TimelineListResult = {
  items: Array<Record<string, unknown>>;
  total: number;
  limit: number;
  offset: number;
  timezone: string;
  timezone_fallback_used?: boolean;
  since: string | null;
  until: string | null;
};

export type SignalHistoryResult = {
  signal_type: string;
  subtype: string | null;
  timezone: string;
  recurrence: {
    occurrence_count: number;
    active_days: number;
    first_occurred_at: string | null;
    latest_occurred_at: string | null;
    days_between_first_and_latest: number | null;
    repeated: boolean;
    repeated_threshold: number;
    timezone: string;
    semantics: string;
  };
  status_distribution: Record<string, number>;
  uncertainty_distribution: Record<string, number>;
  negation_distribution: Record<string, number>;
  occurrences: TimelineOccurrence[];
  temporal_expressions: Array<Record<string, unknown> | null>;
  notes: Record<string, boolean>;
};

export type RecentChangesResult = {
  signal_type: string | null;
  subtype: string | null;
  timezone: string;
  window_days: number;
  current_window: { since: string; until: string };
  previous_window: { since: string; until: string };
  current_count: number;
  previous_count: number;
  absolute_delta: number;
  active_days_current: number;
  active_days_previous: number;
  presence_current: boolean;
  presence_previous: boolean;
  recording_change: string;
  semantics: string;
  language: string;
};

export type CoOccurrenceResult = {
  mode: string;
  within_hours: number | null;
  timezone: string;
  pairs: Array<Record<string, unknown>>;
  total_pairs: number;
  semantics: string;
  notes: Record<string, boolean>;
};

export type ObservationContextResult = {
  observation: {
    id: string;
    user_id: string;
    occurred_at: string;
    created_at: string;
    updated_at: string;
    observation_kind: string | null;
    source_surface: string | null;
    input_mode: string | null;
    language: string | null;
    raw_text: string;
    transcript_status: string | null;
    session_id: string | null;
    extraction: Record<string, unknown> | null;
  };
  linked_signals: TimelineOccurrence[];
};

const apiUrl = (path: string) => {
  const fromEnv = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ?? '';
  const base =
    fromEnv && !fromEnv.includes('localhost') && !fromEnv.includes('127.0.0.1')
      ? fromEnv.replace(/\/$/, '')
      : '';
  return `${base}${path}`;
};

const parseJson = async <T>(response: Response): Promise<T & { error?: string }> => {
  const raw = await response.text();
  return raw ? (JSON.parse(raw) as T & { error?: string }) : ({} as T & { error?: string });
};

const withQuery = (path: string, params: Record<string, string | number | boolean | undefined | null>) => {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    query.set(key, String(value));
  }
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return `${path}${suffix}`;
};

export const timelineService = {
  async listTimeline(params: {
    event_type?: string;
    signal_type?: string;
    since?: string;
    until?: string;
    include_candidates?: boolean;
    include_negated?: boolean;
    source_surface?: string;
    timezone?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<TimelineListResult> {
    const response = await fetch(apiUrl(withQuery('/api/personal/timeline', params)), {
      method: 'GET',
      credentials: 'include',
    });
    const data = await parseJson<TimelineListResult>(response);
    if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
    return data;
  },

  async getSignalHistory(
    signalType: string,
    params: {
      subtype?: string;
      since?: string;
      until?: string;
      include_candidates?: boolean;
      include_negated?: boolean;
      timezone?: string;
      repeated_threshold?: number;
    } = {},
  ): Promise<SignalHistoryResult> {
    const response = await fetch(
      apiUrl(withQuery(`/api/personal/timeline/signals/${encodeURIComponent(signalType)}`, params)),
      { method: 'GET', credentials: 'include' },
    );
    const data = await parseJson<SignalHistoryResult>(response);
    if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
    return data;
  },

  async getRecentChanges(params: {
    signal_type?: string;
    subtype?: string;
    window_days?: number;
    include_candidates?: boolean;
    include_negated?: boolean;
    timezone?: string;
    as_of?: string;
  } = {}): Promise<RecentChangesResult> {
    const response = await fetch(apiUrl(withQuery('/api/personal/timeline/recent-changes', params)), {
      method: 'GET',
      credentials: 'include',
    });
    const data = await parseJson<RecentChangesResult>(response);
    if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
    return data;
  },

  async getCoOccurrences(params: {
    mode?: 'same_local_day' | 'within_hours';
    signal_type_a?: string;
    signal_type_b?: string;
    subtype_a?: string;
    subtype_b?: string;
    within_hours?: number;
    since?: string;
    until?: string;
    include_candidates?: boolean;
    include_negated?: boolean;
    timezone?: string;
    limit?: number;
  } = {}): Promise<CoOccurrenceResult> {
    const response = await fetch(apiUrl(withQuery('/api/personal/timeline/co-occurrences', params)), {
      method: 'GET',
      credentials: 'include',
    });
    const data = await parseJson<CoOccurrenceResult>(response);
    if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
    return data;
  },

  async getObservationContext(
    observationId: string,
    params: { include_candidates?: boolean; include_negated?: boolean } = {},
  ): Promise<ObservationContextResult> {
    const response = await fetch(
      apiUrl(
        withQuery(`/api/personal/timeline/observations/${encodeURIComponent(observationId)}`, params),
      ),
      { method: 'GET', credentials: 'include' },
    );
    const data = await parseJson<ObservationContextResult>(response);
    if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
    return data;
  },

  async getTimelineSummary(params: {
    since?: string;
    until?: string;
    include_candidates?: boolean;
    include_negated?: boolean;
    timezone?: string;
  } = {}): Promise<Record<string, unknown>> {
    const response = await fetch(apiUrl(withQuery('/api/personal/timeline/summary', params)), {
      method: 'GET',
      credentials: 'include',
    });
    const data = await parseJson<Record<string, unknown>>(response);
    if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
    return data;
  },
};
