import { useEffect, useMemo, useState } from 'react';
import { Language, TRANSLATIONS } from '../constants';
import { isRtlLanguage, isSupportedLanguage } from '../utils/languages';
import { readLangFromUrl } from '../utils/urlRouting';

export const useAppPreferences = () => {
  const [lang, setLang] = useState<Language>(() => {
    const fromUrl = readLangFromUrl();
    if (fromUrl) return fromUrl;
    const saved = localStorage.getItem('luna_lang');
    return isSupportedLanguage(saved) ? saved : 'en';
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('luna_theme');
    return saved === 'dark' ? 'dark' : 'light';
  });

  const ui = useMemo(() => TRANSLATIONS[lang], [lang]);

  useEffect(() => {
    localStorage.setItem('luna_lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = isRtlLanguage(lang) ? 'rtl' : 'ltr';
  }, [lang]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('luna_theme', theme);
  }, [theme]);

  return { lang, setLang, theme, setTheme, ui };
};
