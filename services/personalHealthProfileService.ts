/**
 * Authenticated client for the session-owned Personal Health Profile.
 * The server resolves the owner from the session; never send user_id.
 */

export type ProfileSectionId =
  | 'about'
  | 'body'
  | 'health_history'
  | 'medications'
  | 'family_history'
  | 'sleep'
  | 'nutrition'
  | 'activity'
  | 'stress'
  | 'womens_health'
  | 'goals'
  | 'care_context'
  | 'data_sources';

export type PersonalHealthProfile = {
  user_id?: string;
  sections: Partial<Record<ProfileSectionId, Record<string, unknown>>>;
  completion_percent: number;
  profile_preferences?: Record<string, unknown>;
  profile_version?: number;
  updated_at?: string | null;
  [key: string]: unknown;
};

export type ProfileCompletion = {
  completion_percent: number;
  completed_sections?: ProfileSectionId[];
  recommended_next_section?: ProfileSectionId | null;
  applicable_sections?: ProfileSectionId[];
};

export type PersonalHealthFact = {
  id: string;
  section: ProfileSectionId;
  fact_key: string;
  value_json: unknown;
  display_label?: string | null;
  source?: string;
  trust_state: 'unreviewed' | 'confirmed' | 'corrected' | 'rejected' | string;
  confidence?: string | null;
  updated_at?: string;
};

export type ProfileUnavailable = { unavailable: true; code?: string; error?: string };
type ApiResult<T> = T | ProfileUnavailable;

export const isProfileUnavailable = <T extends object>(result: ApiResult<T>): result is ProfileUnavailable =>
  'unavailable' in result && (result as ProfileUnavailable).unavailable === true;

export type ProfileQuestion = {
  id: string;
  section: ProfileSectionId;
  prompt: string;
  reason?: string;
  field?: string;
};

type ProfileEnvelope = {
  profile?: PersonalHealthProfile;
  completion?: ProfileCompletion;
  completion_percent?: number;
  sections?: unknown;
  facts?: PersonalHealthFact[];
  fact?: PersonalHealthFact;
  question?: ProfileQuestion | null;
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

const unwrapProfile = (data: ProfileEnvelope): PersonalHealthProfile => {
  const profile = data.profile || (data as PersonalHealthProfile);
  const completionPercent =
    data.completion?.completion_percent ??
    profile.completion_percent ??
    data.completion_percent ??
    0;
  return {
    ...profile,
    sections: profile.sections || {},
    completion_percent: Number(completionPercent) || 0,
  };
};

const request = async <T>(path: string, init?: RequestInit): Promise<ApiResult<T>> => {
  const response = await fetch(apiUrl(path), {
    credentials: 'include',
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
  });
  const data = await parseJson<T>(response);
  if (response.status === 503 && (data as { code?: string }).code === 'PROFILE_STORAGE_UNAVAILABLE') {
    return {
      unavailable: true,
      code: (data as { code?: string }).code,
      error: (data as { error?: string }).error,
    };
  }
  if (!response.ok) {
    const error = new Error((data as { error?: string }).error || `Request failed (${response.status})`) as Error & {
      status?: number;
      code?: string;
    };
    error.status = response.status;
    error.code = (data as { code?: string }).code;
    throw error;
  }
  return data;
};

export const getProfile = async (): Promise<ApiResult<PersonalHealthProfile>> => {
  const data = await request<ProfileEnvelope>('/api/personal/profile');
  if (isProfileUnavailable(data)) return data;
  return unwrapProfile(data);
};

export const patchProfile = async (patch: Record<string, unknown>): Promise<ApiResult<PersonalHealthProfile>> => {
  const data = await request<ProfileEnvelope>('/api/personal/profile', {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
  if (isProfileUnavailable(data)) return data;
  return unwrapProfile(data);
};

export const getCompletion = () =>
  request<ProfileCompletion>('/api/personal/profile/completion');

export const getSections = () =>
  request<{ sections: Array<{ id: ProfileSectionId; filled: boolean }> }>(
    '/api/personal/profile/sections',
  );

export const putSection = async (
  sectionId: ProfileSectionId,
  payload: Record<string, unknown>,
): Promise<ApiResult<PersonalHealthProfile>> => {
  const data = await request<ProfileEnvelope>(
    `/api/personal/profile/sections/${encodeURIComponent(sectionId)}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
  );
  if (isProfileUnavailable(data)) return data;
  return unwrapProfile(data);
};

export const listFacts = (params: { trust_state?: string; section?: ProfileSectionId; limit?: number } = {}) => {
  const query = new URLSearchParams();
  if (params.trust_state) query.set('trust_state', params.trust_state);
  if (params.section) query.set('section', params.section);
  if (params.limit != null) query.set('limit', String(params.limit));
  const suffix = query.toString() ? `?${query}` : '';
  return request<{ facts: PersonalHealthFact[] }>(`/api/personal/profile/facts${suffix}`);
};

export const createFact = (fact: Omit<PersonalHealthFact, 'id' | 'updated_at'> & { source?: string }) =>
  request<{ fact: PersonalHealthFact }>('/api/personal/profile/facts', {
    method: 'POST',
    body: JSON.stringify(fact),
  });

export const confirmFact = (factId: string) =>
  request<{ fact: PersonalHealthFact }>(`/api/personal/profile/facts/${encodeURIComponent(factId)}/confirm`, {
    method: 'POST',
    body: '{}',
  });

export const rejectFact = (factId: string) =>
  request<{ fact: PersonalHealthFact }>(`/api/personal/profile/facts/${encodeURIComponent(factId)}/reject`, {
    method: 'POST',
    body: '{}',
  });

export const correctFact = (
  factId: string,
  correction: { value_json?: unknown; display_label?: string; notes?: string },
) =>
  request<{ fact: PersonalHealthFact }>(`/api/personal/profile/facts/${encodeURIComponent(factId)}/correct`, {
    method: 'POST',
    body: JSON.stringify(correction),
  });

export const deleteFact = (factId: string) =>
  request<{ fact: PersonalHealthFact }>(`/api/personal/profile/facts/${encodeURIComponent(factId)}`, {
    method: 'DELETE',
  });

export const getNextQuestion = (surface = 'today') =>
  request<{ question: ProfileQuestion | null }>(
    `/api/personal/profile/questions/next?surface=${encodeURIComponent(surface)}`,
  );

export const respondQuestion = (
  questionId: string,
  result: 'add' | 'not_now' | 'does_not_apply' | 'completed' | string,
  sectionPatch?: { section: ProfileSectionId; data?: Record<string, unknown> } & Record<string, unknown>,
) =>
  request<PersonalHealthProfile | ProfileEnvelope>(
    `/api/personal/profile/questions/${encodeURIComponent(questionId)}/respond`,
    {
      method: 'POST',
      body: JSON.stringify({
        result,
        ...(sectionPatch ? { section_patch: sectionPatch } : {}),
      }),
    },
  );

/** Bounded report/Live context from server (confirmed facts prioritized). */
export const getProfileContext = (params: {
  reportType?: string;
  includeInferred?: boolean;
  maxFacts?: number;
  sections?: string;
} = {}) => {
  const query = new URLSearchParams();
  if (params.reportType) query.set('reportType', params.reportType);
  if (params.includeInferred) query.set('includeInferred', '1');
  if (params.maxFacts != null) query.set('maxFacts', String(params.maxFacts));
  if (params.sections) query.set('sections', params.sections);
  const suffix = query.toString() ? `?${query}` : '';
  return request<{
    status: string;
    facts: PersonalHealthFact[];
    missing_context?: string[];
    completion_percent?: number;
  }>(`/api/personal/profile/context${suffix}`);
};

export const personalHealthProfileService = {
  getProfile,
  patchProfile,
  getCompletion,
  getSections,
  putSection,
  listFacts,
  createFact,
  confirmFact,
  rejectFact,
  correctFact,
  deleteFact,
  getNextQuestion,
  respondQuestion,
  getProfileContext,
};
