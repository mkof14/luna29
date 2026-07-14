/**
 * Capture and persist UTM / click IDs for analytics attribution.
 */
const UTM_STORAGE_KEY = 'luna_utm_v1';
const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'gclid',
  'fbclid',
] as const;

export type UtmAttribution = Partial<Record<(typeof UTM_KEYS)[number], string>> & {
  capturedAt?: string;
  landingPath?: string;
};

const readParams = (): UtmAttribution => {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const next: UtmAttribution = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key)?.trim();
    if (value) next[key] = value.slice(0, 180);
  }
  return next;
};

export const captureUtmFromLocation = (): UtmAttribution => {
  if (typeof window === 'undefined') return {};
  const incoming = readParams();
  if (!Object.keys(incoming).length) return readStoredUtm();

  const payload: UtmAttribution = {
    ...incoming,
    capturedAt: new Date().toISOString(),
    landingPath: window.location.pathname || '/',
  };
  try {
    localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore quota / private mode
  }
  return payload;
};

export const readStoredUtm = (): UtmAttribution => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(UTM_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as UtmAttribution;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

/** Flat string map safe for gtag event params. */
export const utmEventParams = (): Record<string, string> => {
  const utm = readStoredUtm();
  const out: Record<string, string> = {};
  for (const key of UTM_KEYS) {
    const value = utm[key];
    if (value) out[key] = value;
  }
  if (utm.landingPath) out.landing_path = utm.landingPath;
  return out;
};
