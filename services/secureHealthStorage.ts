/**
 * Encrypted at-rest wrapper for sensitive Luna localStorage keys (Web Crypto AES-GCM).
 * Requires user PIN/passphrase once per session; falls back to plaintext when unavailable.
 */
const ENCRYPTED_PREFIX = 'enc:v1:';
const SESSION_KEY_STORAGE = 'luna_health_crypto_key_v1';

const SENSITIVE_KEYS = new Set([
  'luna_event_log_v3',
  'luna_voice_clips_v1',
  'luna_labs_draft_v1',
]);

let sessionKey: CryptoKey | null = null;

const getSubtle = () => (typeof window !== 'undefined' ? window.crypto?.subtle : undefined);

export const isSecureHealthStorageSupported = () => Boolean(getSubtle());

const importKeyFromPassphrase = async (passphrase: string): Promise<CryptoKey> => {
  const subtle = getSubtle();
  if (!subtle) throw new Error('Web Crypto unavailable');
  const material = await subtle.importKey('raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  return subtle.deriveKey(
    { name: 'PBKDF2', salt: new TextEncoder().encode('luna29-health-v1'), iterations: 120_000, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
};

export const unlockHealthStorage = async (passphrase: string): Promise<boolean> => {
  try {
    sessionKey = await importKeyFromPassphrase(passphrase);
    sessionStorage.setItem(SESSION_KEY_STORAGE, '1');
    return true;
  } catch {
    return false;
  }
};

export const lockHealthStorage = () => {
  sessionKey = null;
  sessionStorage.removeItem(SESSION_KEY_STORAGE);
};

export const isHealthStorageUnlocked = () => sessionKey !== null;

const encryptText = async (plain: string): Promise<string> => {
  if (!sessionKey) return plain;
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plain);
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, sessionKey, encoded);
  const combined = new Uint8Array(iv.length + cipher.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(cipher), iv.length);
  return ENCRYPTED_PREFIX + btoa(String.fromCharCode(...combined));
};

const decryptText = async (stored: string): Promise<string> => {
  if (!stored.startsWith(ENCRYPTED_PREFIX) || !sessionKey) return stored.replace(ENCRYPTED_PREFIX, '');
  const raw = Uint8Array.from(atob(stored.slice(ENCRYPTED_PREFIX.length)), (c) => c.charCodeAt(0));
  const iv = raw.slice(0, 12);
  const data = raw.slice(12);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, sessionKey, data);
  return new TextDecoder().decode(plain);
};

export const secureGetItem = async (key: string): Promise<string | null> => {
  const raw = localStorage.getItem(key);
  if (!raw || !SENSITIVE_KEYS.has(key)) return raw;
  if (!raw.startsWith(ENCRYPTED_PREFIX)) return raw;
  try {
    return await decryptText(raw);
  } catch {
    return null;
  }
};

export const secureSetItem = async (key: string, value: string): Promise<void> => {
  if (!SENSITIVE_KEYS.has(key) || !sessionKey) {
    localStorage.setItem(key, value);
    return;
  }
  localStorage.setItem(key, await encryptText(value));
};

export const migrateSensitiveKeysToEncrypted = async (): Promise<number> => {
  if (!sessionKey) return 0;
  let count = 0;
  for (const key of SENSITIVE_KEYS) {
    const raw = localStorage.getItem(key);
    if (!raw || raw.startsWith(ENCRYPTED_PREFIX)) continue;
    await secureSetItem(key, raw);
    count += 1;
  }
  return count;
};
