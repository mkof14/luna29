import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type AdminThemeMode = 'light' | 'dark';

type AdminThemeContextValue = {
  mode: AdminThemeMode;
  setMode: (mode: AdminThemeMode) => void;
  toggle: () => void;
};

const STORAGE_KEY = 'luna29-admin-theme';

const AdminThemeContext = createContext<AdminThemeContextValue | null>(null);

const readStoredMode = (): AdminThemeMode => {
  if (typeof window === 'undefined') return 'dark';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const AdminThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<AdminThemeMode>(() => readStoredMode());

  const setMode = useCallback((next: AdminThemeMode) => {
    setModeState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const toggle = useCallback(() => {
    setMode(mode === 'dark' ? 'light' : 'dark');
  }, [mode, setMode]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  const value = useMemo(() => ({ mode, setMode, toggle }), [mode, setMode, toggle]);

  return <AdminThemeContext.Provider value={value}>{children}</AdminThemeContext.Provider>;
};

export const useAdminTheme = (): AdminThemeContextValue => {
  const ctx = useContext(AdminThemeContext);
  if (!ctx) throw new Error('useAdminTheme must be used within AdminThemeProvider');
  return ctx;
};

export const useAdminThemeOptional = (): AdminThemeContextValue | null =>
  useContext(AdminThemeContext);
