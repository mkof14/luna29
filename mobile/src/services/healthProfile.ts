import { requestJson } from './api';

// Mobile UI entry is deferred; this service keeps the authenticated API ready.
export type MobileHealthProfile = { completion_percent: number; sections: Record<string, Record<string, unknown>> };
export type MobileHealthFact = { id: string; section: string; fact_key: string; value_json: unknown; trust_state: string };

export const fetchHealthProfile = async (mobileId?: string) => {
  const data = await requestJson<{ profile?: MobileHealthProfile } & MobileHealthProfile>(
    '/api/personal/profile',
    undefined,
    mobileId,
  );
  return data.profile || data;
};

export const putHealthProfileSection = async (
  sectionId: string,
  payload: Record<string, unknown>,
  mobileId?: string,
) => {
  const data = await requestJson<{ profile?: MobileHealthProfile } & MobileHealthProfile>(
    `/api/personal/profile/sections/${encodeURIComponent(sectionId)}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
    mobileId,
  );
  return data.profile || data;
};

const factAction = (factId: string, action: 'confirm' | 'reject', mobileId?: string) =>
  requestJson<{ fact: MobileHealthFact }>(`/api/personal/profile/facts/${encodeURIComponent(factId)}/${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  }, mobileId);

export const confirmHealthProfileFact = (factId: string, mobileId?: string) => factAction(factId, 'confirm', mobileId);
export const rejectHealthProfileFact = (factId: string, mobileId?: string) => factAction(factId, 'reject', mobileId);
export const correctHealthProfileFact = (factId: string, value_json: unknown, mobileId?: string) =>
  requestJson<{ fact: MobileHealthFact }>(`/api/personal/profile/facts/${encodeURIComponent(factId)}/correct`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value_json }),
  }, mobileId);

export const fetchNextHealthProfileQuestion = (mobileId?: string) =>
  requestJson<{ question: { id: string; section: string; prompt: string } | null }>('/api/personal/profile/questions/next?surface=mobile', undefined, mobileId);
