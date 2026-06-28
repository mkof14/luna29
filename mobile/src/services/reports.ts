import { env, hasApiBaseUrl } from '../config/env';
import { setMobileAuthToken } from './api';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'luna_mobile_token';

export type ReportInput = {
  cycleDay: string;
  sleep: string;
  energy: string;
  mood: string;
  source: string;
  note: string;
  hormones: {
    estradiol: string;
    progesterone: string;
    cortisol: string;
  };
  labs: {
    ferritin: string;
    tsh: string;
    vitaminD: string;
  };
};

export type ReportPayload = {
  id: string;
  generatedAt: string;
  text: string;
};

async function getToken() {
  try {
    return (await SecureStore.getItemAsync(TOKEN_KEY)) || '';
  } catch {
    return '';
  }
}

async function requestReports<T>(path: string, init?: RequestInit): Promise<T> {
  if (!hasApiBaseUrl) {
    throw new Error('Missing EXPO_PUBLIC_API_BASE_URL');
  }
  const token = await getToken();
  setMobileAuthToken(token);

  const headers = new Headers(init?.headers || {});
  headers.set('Accept', 'application/json');
  if (init?.method && init.method !== 'GET') headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    method: init?.method || 'GET',
    ...init,
    headers,
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(String(json?.error || `Request failed: ${response.status}`));
  }
  return json as T;
}

function localReportText(input: ReportInput, reportId: string) {
  return [
    'Luna29 Health Report',
    `Report ID: ${reportId}`,
    `Generated: ${new Date().toLocaleString()}`,
    '',
    'Today context',
    `Cycle day: ${input.cycleDay}`,
    `Sleep: ${input.sleep}`,
    `Energy: ${input.energy}`,
    `Mood: ${input.mood}`,
    `Source: ${input.source}`,
    '',
    'Hormones',
    `Estradiol: ${input.hormones.estradiol}`,
    `Progesterone: ${input.hormones.progesterone}`,
    `Cortisol: ${input.hormones.cortisol}`,
    '',
    'Lab markers',
    `Ferritin: ${input.labs.ferritin}`,
    `TSH: ${input.labs.tsh}`,
    `Vitamin D: ${input.labs.vitaminD}`,
    '',
    'Interpretation summary',
    '- Energy and mood can feel more sensitive after shorter sleep.',
    '- Luteal-phase timing may align with lower stress tolerance.',
    '- Track markers over time with your doctor for context.',
    '',
    'Gentle recommendation:',
    'Keep tonight slower, hydrate, and prioritize earlier sleep.',
    `Note: ${input.note || 'No additional notes.'}`,
    '',
    'LUNA29 IS NOT A DIAGNOSIS TOOL. IF NEEDED, CONTACT YOUR DOCTOR.',
  ].join('\n');
}

export async function generateReport(input: ReportInput): Promise<ReportPayload> {
  if (!hasApiBaseUrl) {
    const id = `LUNA29-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${Math.floor(Math.random() * 900 + 100)}`;
    return {
      id,
      generatedAt: new Date().toISOString(),
      text: localReportText(input, id),
    };
  }
  return requestReports<ReportPayload>('/api/mobile/reports/generate', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function saveReport(payload: ReportPayload): Promise<{ ok: boolean }> {
  if (!hasApiBaseUrl) return { ok: true };
  return requestReports<{ ok: boolean }>('/api/mobile/reports/save', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getReportHistory(): Promise<ReportPayload[]> {
  if (!hasApiBaseUrl) return [];
  return requestReports<ReportPayload[]>('/api/mobile/reports/history');
}

export async function preparePdf(reportId: string): Promise<{ ok: boolean; url?: string }> {
  if (!hasApiBaseUrl) return { ok: true };
  return requestReports<{ ok: boolean; url?: string }>(`/api/mobile/reports/${reportId}/pdf`, { method: 'POST' });
}

export async function runOcrIntake(textOrHint: string): Promise<{ ok: boolean; extractedText: string }> {
  if (!hasApiBaseUrl) {
    return { ok: true, extractedText: textOrHint };
  }
  return requestReports<{ ok: boolean; extractedText: string }>('/api/mobile/reports/ocr-intake', {
    method: 'POST',
    body: JSON.stringify({ input: textOrHint }),
  });
}
