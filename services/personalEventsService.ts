/**
 * Thin authenticated client for the server-backed personal event foundation.
 * Does not replace localStorage (`luna_event_log_v3`). Opt-in sync only.
 */
import { dataService } from './dataService';
import type { HealthEvent } from '../types';

export type PersonalEventRecord = {
  id: string;
  user_id: string;
  event_type: string;
  occurred_at: string;
  created_at: string;
  updated_at: string;
  source: string;
  payload: Record<string, unknown>;
  schema_version: number;
  client_event_id: string | null;
  deleted_at: string | null;
};

export type PersonalEventsListResult = {
  events: PersonalEventRecord[];
  total: number;
  limit: number;
  offset: number;
};

export type PersonalEventsSyncResult = {
  imported: number;
  updated: number;
  skipped: number;
  errors?: Array<{ index: number; error: string }>;
  events: PersonalEventRecord[];
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

const toLocalSyncShape = (event: HealthEvent) => ({
  id: event.id,
  type: event.type,
  timestamp: event.timestamp,
  version: event.version,
  payload: event.payload && typeof event.payload === 'object' ? event.payload : {},
  source: 'local_sync',
});

export const personalEventsService = {
  /**
   * Create one or more personal events for the authenticated user.
   * Server ignores any client-supplied user_id.
   */
  async createEvents(
    events: Array<{
      event_type?: string;
      type?: string;
      occurred_at?: string;
      timestamp?: string;
      payload?: Record<string, unknown>;
      source?: string;
      client_event_id?: string;
      id?: string;
      schema_version?: number;
      version?: number;
    }>,
  ): Promise<{ events: PersonalEventRecord[] }> {
    const response = await fetch(apiUrl('/api/personal/events'), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events }),
    });
    const data = await parseJson<{ events: PersonalEventRecord[] }>(response);
    if (!response.ok) {
      throw new Error(data.error || `Request failed (${response.status})`);
    }
    return { events: Array.isArray(data.events) ? data.events : [] };
  },

  async listEvents(params: {
    event_type?: string;
    since?: string;
    until?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<PersonalEventsListResult> {
    const query = new URLSearchParams();
    if (params.event_type) query.set('event_type', params.event_type);
    if (params.since) query.set('since', params.since);
    if (params.until) query.set('until', params.until);
    if (params.limit != null) query.set('limit', String(params.limit));
    if (params.offset != null) query.set('offset', String(params.offset));
    const suffix = query.toString() ? `?${query.toString()}` : '';
    const response = await fetch(apiUrl(`/api/personal/events${suffix}`), {
      method: 'GET',
      credentials: 'include',
    });
    const data = await parseJson<PersonalEventsListResult>(response);
    if (!response.ok) {
      throw new Error(data.error || `Request failed (${response.status})`);
    }
    return {
      events: Array.isArray(data.events) ? data.events : [],
      total: Number(data.total) || 0,
      limit: Number(data.limit) || 0,
      offset: Number(data.offset) || 0,
    };
  },

  async softDeleteEvent(eventId: string): Promise<{ ok: boolean; event: PersonalEventRecord }> {
    const response = await fetch(apiUrl(`/api/personal/events/${encodeURIComponent(eventId)}/delete`), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const data = await parseJson<{ ok: boolean; event: PersonalEventRecord }>(response);
    if (!response.ok) {
      throw new Error(data.error || `Request failed (${response.status})`);
    }
    return data;
  },

  /**
   * Opt-in sync of current localStorage event log to the authenticated server store.
   * Does not clear or mutate localStorage.
   */
  async syncLocalLog(events?: HealthEvent[]): Promise<PersonalEventsSyncResult> {
    const localEvents = events ?? dataService.getLog();
    const response = await fetch(apiUrl('/api/personal/events/sync-local'), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: localEvents.map(toLocalSyncShape) }),
    });
    const data = await parseJson<PersonalEventsSyncResult>(response);
    if (!response.ok) {
      throw new Error(data.error || `Request failed (${response.status})`);
    }
    return {
      imported: Number(data.imported) || 0,
      updated: Number(data.updated) || 0,
      skipped: Number(data.skipped) || 0,
      errors: data.errors,
      events: Array.isArray(data.events) ? data.events : [],
    };
  },
};
