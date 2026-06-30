import { AdminPermission, AdminRole, AuthSession } from '../types';

const API_BASE_STORAGE_KEY = 'luna_api_base_url';
const LOCAL_SESSION_KEY = 'luna_auth_session_v2';
const LOCAL_USERS_KEY = 'luna_auth_users_v2';

const SUPER_ADMIN_EMAIL = 'dnainform@gmail.com';
const DEV_SUPER_ADMIN_PASSWORD = (
  (import.meta.env.VITE_DEV_SUPER_ADMIN_PASSWORD as string | undefined)?.trim()
  || (import.meta.env.VITE_SUPER_ADMIN_BOOTSTRAP_PASSWORD as string | undefined)?.trim()
  || ''
);
const resolveSuperAdminFallbackPassword = (): string => {
  if (DEV_SUPER_ADMIN_PASSWORD) return DEV_SUPER_ADMIN_PASSWORD;
  if (typeof window === 'undefined') return '';
  const runtime = (window as Window & { __LUNA_SUPER_ADMIN_FALLBACK_PASSWORD?: string }).__LUNA_SUPER_ADMIN_FALLBACK_PASSWORD;
  if (typeof runtime === 'string' && runtime.trim().length > 0) return runtime.trim();
  return '';
};
const SUPER_ADMIN_FALLBACK_PASSWORD = resolveSuperAdminFallbackPassword();
const isLocalHostRuntime = (() => {
  if (typeof window === 'undefined') return false;
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
})();

const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  viewer: ['view_financials', 'view_technical_metrics'],
  operator: ['manage_services', 'view_technical_metrics'],
  content_manager: ['manage_marketing', 'manage_email_templates'],
  finance_manager: ['view_financials'],
  super_admin: [
    'manage_services',
    'manage_marketing',
    'manage_email_templates',
    'manage_admin_roles',
    'view_financials',
    'view_technical_metrics',
  ],
};

const ADMIN_EMAIL_RULES: Array<{ pattern: RegExp; role: AdminRole }> = [];

type StoredUser = {
  email: string;
  password: string;
  name: string;
  provider: 'password' | 'google';
  avatarUrl?: string;
};

let sessionCache: AuthSession | null = null;

const isLocalApiBase = (value: string): boolean => {
  try {
    const url = new URL(value.startsWith('http') ? value : `http://${value}`);
    return url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname === '[::1]';
  } catch {
    return false;
  }
};

const getApiBase = (): string => {
  // On localhost always use same-origin /api proxy — ignore stored production URLs.
  if (isLocalHostRuntime) return '';
  const fromEnv = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ?? '';
  const fromStorage = localStorage.getItem(API_BASE_STORAGE_KEY)?.trim() ?? '';
  const raw = fromEnv || fromStorage;
  if (!raw) return '';
  if (isLocalApiBase(raw)) return '';
  return raw.replace(/\/$/, '');
};

const apiUrl = (path: string) => {
  const base = getApiBase();
  return `${base}${path}`;
};

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const normalizeName = (email: string, fallback = 'Luna29 Member'): string => {
  const local = email.split('@')[0] || '';
  const cleaned = local.replace(/[._-]+/g, ' ').trim();
  if (!cleaned) return fallback;
  return cleaned
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const resolveRole = (email: string): AdminRole => {
  const normalized = normalizeEmail(email);
  if (normalized === SUPER_ADMIN_EMAIL) return 'super_admin';
  return 'viewer';
};

const toBase64Json = (value: unknown): string => btoa(unescape(encodeURIComponent(JSON.stringify(value))));

const fromBase64Json = <T>(raw: string): T | null => {
  try {
    const parsed = decodeURIComponent(escape(atob(raw)));
    return JSON.parse(parsed) as T;
  } catch {
    return null;
  }
};

const saveLocalSession = (session: AuthSession) => {
  localStorage.setItem(LOCAL_SESSION_KEY, toBase64Json(session));
};

const getLocalUsers = (): StoredUser[] => {
  const raw = localStorage.getItem(LOCAL_USERS_KEY);
  if (!raw) return [];
  const parsed = fromBase64Json<StoredUser[]>(raw);
  return Array.isArray(parsed) ? parsed : [];
};

const saveLocalUsers = (users: StoredUser[]) => {
  localStorage.setItem(LOCAL_USERS_KEY, toBase64Json(users));
};

const ensureLocalSuperAdmin = () => {
  if (!isLocalHostRuntime || !SUPER_ADMIN_FALLBACK_PASSWORD) return;
  const users = getLocalUsers();
  const existingIndex = users.findIndex((item) => normalizeEmail(item.email) === SUPER_ADMIN_EMAIL);
  const superAdminUser: StoredUser = {
    email: SUPER_ADMIN_EMAIL,
    password: SUPER_ADMIN_FALLBACK_PASSWORD,
    name: 'Luna29 Super Admin',
    provider: 'password',
  };
  if (existingIndex >= 0) {
    if (users[existingIndex].password === SUPER_ADMIN_FALLBACK_PASSWORD) return;
    users[existingIndex] = { ...users[existingIndex], ...superAdminUser };
    saveLocalUsers(users);
    return;
  }
  saveLocalUsers([superAdminUser, ...users]);
};

const buildSession = (params: { email: string; name?: string; provider: 'password' | 'google'; avatarUrl?: string }): AuthSession => {
  const email = normalizeEmail(params.email);
  const role = resolveRole(email);
  return {
    id: toBase64Json(`${params.provider}:${email}`).slice(0, 24),
    email,
    name: params.name || normalizeName(email),
    provider: params.provider,
    role,
    permissions: ROLE_PERMISSIONS[role],
    lastLoginAt: new Date().toISOString(),
    avatarUrl: params.avatarUrl,
  };
};

const decodeGoogleJwt = (credential: string): { email?: string; name?: string; picture?: string } => {
  try {
    const [, payload] = credential.split('.');
    if (!payload) return {};
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const claims = fromBase64Json<Record<string, unknown>>(normalized);
    if (!claims) return {};
    return {
      email: typeof claims.email === 'string' ? claims.email : undefined,
      name: typeof claims.name === 'string' ? claims.name : undefined,
      picture: typeof claims.picture === 'string' ? claims.picture : undefined,
    };
  } catch {
    return {};
  }
};

const isNetworkError = (error: unknown): boolean => {
  if (!(error instanceof Error)) return false;
  if (error.name === 'AbortError') return true;
  const msg = error.message.toLowerCase();
  return msg.includes('failed to fetch') || msg.includes('networkerror') || msg.includes('load failed');
};

const REQUEST_TIMEOUT_MS = 8000;

const localFallbackOverrideEnabled = (): boolean => {
  if (!isLocalHostRuntime) return false;
  try {
    return localStorage.getItem('luna_allow_local_auth_fallback') === 'true';
  } catch {
    return false;
  }
};
const canUseLocalFallback = (): boolean => isLocalHostRuntime || localFallbackOverrideEnabled();

const requestJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(apiUrl(path), {
      ...init,
      signal: init?.signal ?? controller.signal,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
    });

    const raw = await response.text();
    const data = raw ? (JSON.parse(raw) as T & { error?: string }) : ({} as T & { error?: string });

    if (!response.ok) {
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    return data as T;
  } finally {
    window.clearTimeout(timeoutId);
  }
};

const normalizeSession = (session: AuthSession): AuthSession => {
  const nextRole = resolveRole(session.email);
  return {
    ...session,
    role: nextRole,
    permissions: ROLE_PERMISSIONS[nextRole],
  };
};

const localAuth = {
  getSession(): AuthSession | null {
    ensureLocalSuperAdmin();
    const raw = localStorage.getItem(LOCAL_SESSION_KEY);
    if (!raw) return null;
    const parsed = fromBase64Json<AuthSession>(raw);
    if (!parsed?.email) return null;
    const normalized = normalizeSession(parsed);
    saveLocalSession(normalized);
    sessionCache = normalized;
    return normalized;
  },

  loginWithPassword(email: string, password: string): AuthSession {
    ensureLocalSuperAdmin();
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail || password.length < 1) {
      throw new Error('Provide a valid email and password.');
    }

    const users = getLocalUsers();
    const account = users.find((item) => normalizeEmail(item.email) === normalizedEmail);

    if (!account) {
      throw new Error('Account not found. Please sign up first.');
    }

    if (account.password !== password) {
      throw new Error('Incorrect password. Please try again.');
    }

    const session = buildSession({
      email: normalizedEmail,
      name: account.name,
      provider: account.provider === 'google' ? 'google' : 'password',
      avatarUrl: account.avatarUrl,
    });
    saveLocalSession(session);
    sessionCache = session;
    return session;
  },

  signupWithPassword(email: string, password: string): AuthSession {
    ensureLocalSuperAdmin();
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail || password.length < 6) {
      throw new Error('Provide a valid email and password (minimum 6 chars).');
    }

    const users = getLocalUsers();
    const exists = users.some((item) => normalizeEmail(item.email) === normalizedEmail);
    if (exists) {
      throw new Error('Account already exists. Please sign in.');
    }

    const nextUser: StoredUser = {
      email: normalizedEmail,
      password,
      name: normalizeName(normalizedEmail),
      provider: 'password',
    };

    saveLocalUsers([nextUser, ...users]);
    const session = buildSession({ email: nextUser.email, name: nextUser.name, provider: 'password' });
    saveLocalSession(session);
    sessionCache = session;
    return session;
  },

  loginWithGoogleCredential(credential: string): AuthSession {
    ensureLocalSuperAdmin();
    const decoded = decodeGoogleJwt(credential);
    if (!decoded.email) {
      throw new Error('Google authorization returned an invalid credential payload.');
    }

    const email = normalizeEmail(decoded.email);
    const users = getLocalUsers();
    const existing = users.find((item) => normalizeEmail(item.email) === email);

    if (!existing) {
      saveLocalUsers([
        {
          email,
          password: '',
          name: decoded.name || normalizeName(email),
          provider: 'google',
          avatarUrl: decoded.picture,
        },
        ...users,
      ]);
    }

    const session = buildSession({ email, name: decoded.name, provider: 'google', avatarUrl: decoded.picture });
    saveLocalSession(session);
    sessionCache = session;
    return session;
  },

  upsertSuperAdminPassword(email: string, password: string): AuthSession {
    const normalizedEmail = normalizeEmail(email);
    if (normalizedEmail !== SUPER_ADMIN_EMAIL) {
      throw new Error('Super admin fallback is only available for the primary admin email.');
    }
    if (password.length < 8) {
      throw new Error('Super admin password must contain at least 8 characters.');
    }

    const users = getLocalUsers();
    const nextUsers = [...users];
    const existingIndex = nextUsers.findIndex((item) => normalizeEmail(item.email) === normalizedEmail);
    const nextUser: StoredUser = {
      email: normalizedEmail,
      password,
      name: 'Luna29 Super Admin',
      provider: 'password',
    };

    if (existingIndex >= 0) {
      nextUsers[existingIndex] = { ...nextUsers[existingIndex], ...nextUser };
    } else {
      nextUsers.unshift(nextUser);
    }

    saveLocalUsers(nextUsers);
    const session = buildSession({ email: normalizedEmail, name: nextUser.name, provider: 'password' });
    saveLocalSession(session);
    sessionCache = session;
    return session;
  },

  updateRole(session: AuthSession, role: AdminRole): AuthSession {
    const next = {
      ...session,
      role,
      permissions: ROLE_PERMISSIONS[role],
    };
    saveLocalSession(next);
    sessionCache = next;
    return next;
  },

  logout() {
    localStorage.removeItem(LOCAL_SESSION_KEY);
    sessionCache = null;
  },
};

export const authService = {
  async getSession(): Promise<AuthSession | null> {
    try {
      const payload = await requestJson<{ session: AuthSession | null }>('/api/auth/session', { method: 'GET' });
      if (!payload.session) {
        if (isLocalHostRuntime) {
          const localSession = localAuth.getSession();
          if (localSession) {
            sessionCache = localSession;
            return localSession;
          }
        }
        if (!canUseLocalFallback()) return null;
        const fallback = localAuth.getSession();
        sessionCache = fallback;
        return fallback;
      }
      sessionCache = normalizeSession(payload.session);
      saveLocalSession(sessionCache);
      return sessionCache;
    } catch (error) {
      if (isLocalHostRuntime) {
        const localSession = localAuth.getSession();
        if (localSession) {
          sessionCache = localSession;
          return localSession;
        }
      }
      if (isNetworkError(error) && canUseLocalFallback()) {
        return localAuth.getSession();
      }
      return null;
    }
  },

  async loginWithPassword(email: string, password: string): Promise<AuthSession> {
    const normalizedEmail = normalizeEmail(email);
    if (password.length < 8) {
      throw new Error('Password must contain at least 8 characters.');
    }

    try {
      const payload = await requestJson<{ session: AuthSession }>('/api/auth/signin', {
        method: 'POST',
        body: JSON.stringify({ email: normalizedEmail, password }),
      });
      sessionCache = normalizeSession(payload.session);
      saveLocalSession(sessionCache);
      return sessionCache;
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      const is5xx = /status 5\d\d/.test(message);
      const is401 = /status 401|incorrect email or password/i.test(message);
      const canLocalSuperAdmin =
        isLocalHostRuntime
        && normalizedEmail === SUPER_ADMIN_EMAIL
        && password === SUPER_ADMIN_FALLBACK_PASSWORD;

      if (canLocalSuperAdmin || (isLocalHostRuntime && normalizedEmail === SUPER_ADMIN_EMAIL && (isNetworkError(error) || is5xx || is401))) {
        ensureLocalSuperAdmin();
        if (canLocalSuperAdmin || password === SUPER_ADMIN_FALLBACK_PASSWORD) {
          return localAuth.upsertSuperAdminPassword(normalizedEmail, password);
        }
      }
      if (isNetworkError(error) && canUseLocalFallback()) {
        return localAuth.loginWithPassword(email, password);
      }
      throw error;
    }
  },

  async signupWithPassword(email: string, password: string): Promise<AuthSession> {
    try {
      const payload = await requestJson<{ session: AuthSession }>('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      sessionCache = normalizeSession(payload.session);
      saveLocalSession(sessionCache);
      return sessionCache;
    } catch (error) {
      if (isNetworkError(error) && canUseLocalFallback()) {
        return localAuth.signupWithPassword(email, password);
      }
      throw error;
    }
  },

  async loginWithGoogleCredential(credential: string): Promise<AuthSession> {
    try {
      const payload = await requestJson<{ session: AuthSession }>('/api/auth/google', {
        method: 'POST',
        body: JSON.stringify({ credential }),
      });
      sessionCache = normalizeSession(payload.session);
      saveLocalSession(sessionCache);
      return sessionCache;
    } catch (error) {
      if (isLocalHostRuntime) {
        return localAuth.loginWithGoogleCredential(credential);
      }
      if (isNetworkError(error) && canUseLocalFallback()) {
        return localAuth.loginWithGoogleCredential(credential);
      }
      throw error;
    }
  },

  async updateRole(session: AuthSession, role: AdminRole): Promise<AuthSession> {
    try {
      const payload = await requestJson<{ session: AuthSession }>('/api/admin/role', {
        method: 'POST',
        body: JSON.stringify({ email: session.email, role }),
      });
      sessionCache = normalizeSession(payload.session);
      return sessionCache;
    } catch (error) {
      if (isNetworkError(error) && canUseLocalFallback()) {
        return localAuth.updateRole(session, role);
      }
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      await requestJson<{ ok: boolean }>('/api/auth/logout', { method: 'POST', body: JSON.stringify({}) });
    } catch (error) {
      if (!isNetworkError(error) && !canUseLocalFallback()) {
        throw error;
      }
    } finally {
      localAuth.logout();
      sessionCache = null;
    }
  },

  hasPermission(session: AuthSession | null, permission: AdminPermission): boolean {
    if (!session) return false;
    const role = resolveRole(session.email);
    const permissions = Array.isArray(session.permissions) && session.permissions.length > 0
      ? session.permissions
      : ROLE_PERMISSIONS[role];
    return permissions.includes(permission);
  },

  canAccessAdminWorkspace(session: AuthSession | null): boolean {
    if (!session) return false;
    const gates: AdminPermission[] = [
      'manage_admin_roles',
      'manage_services',
      'manage_marketing',
      'manage_email_templates',
      'view_financials',
      'view_technical_metrics',
    ];
    return gates.some((permission) => {
      const role = resolveRole(session.email);
      const permissions = Array.isArray(session.permissions) && session.permissions.length > 0
        ? session.permissions
        : ROLE_PERMISSIONS[role];
      return permissions.includes(permission);
    });
  },
};
