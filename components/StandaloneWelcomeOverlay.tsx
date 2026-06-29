import React, { useEffect, useState } from 'react';
import { Language, LangCopy, getLang } from '../constants';
import { Logo } from './Logo';

interface StandaloneWelcomeOverlayProps {
  lang: Language;
}

const STORAGE_KEY = 'luna_standalone_welcome_seen_v1';

export const StandaloneWelcomeOverlay: React.FC<StandaloneWelcomeOverlayProps> = ({ lang }) => {
  const [visible, setVisible] = useState(false);

  const copyByLang: LangCopy< { title: string; subtitle: string; continue: string }> = {
    en: { title: 'App Mode Active', subtitle: 'Luna29 is running full-screen like a native app.', continue: 'Continue' },
    ru: { title: 'Режим App Активен', subtitle: 'Luna29 запущена в полноэкранном режиме, как приложение.', continue: 'Продолжить' },
    uk: { title: 'Режим App Активний', subtitle: 'Luna29 запущено у повноекранному режимі, як застосунок.', continue: 'Продовжити' },
    es: { title: 'Modo App Activo', subtitle: 'Luna29 funciona a pantalla completa como app nativa.', continue: 'Continuar' },
    fr: { title: 'Mode App Actif', subtitle: 'Luna29 fonctionne en plein ecran comme une app native.', continue: 'Continuer' },
    de: { title: 'App-Modus Aktiv', subtitle: 'Luna29 lauft im Vollbild wie eine native App.', continue: 'Weiter' },
    zh: { title: 'App 模式已启用', subtitle: 'Luna29 正在以全屏原生应用方式运行。', continue: '继续' },
    ja: { title: 'アプリモード有効', subtitle: 'Luna29 はネイティブアプリのように全画面で動作中です。', continue: '続行' },
    pt: { title: 'Modo App Ativo', subtitle: 'Luna29 esta em tela cheia como aplicativo nativo.', continue: 'Continuar' },
    ar: { title: 'وضع التطبيق مفعّل', subtitle: 'Luna29 تعمل بملء الشاشة مثل تطبيق أصلي.', continue: 'متابعة' },
    he: { title: 'מצב אפליקציה פעיל', subtitle: 'Luna29 פועלת במסך מלא כמו אפליקציה מקורית.', continue: 'המשך' },};

  const copy = getLang(copyByLang, lang) || copyByLang.en;

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (typeof (window.navigator as Navigator & { standalone?: boolean }).standalone === 'boolean' &&
        Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone));
    if (!standalone) return;

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (!isMobile) return;

    let seen = false;
    try {
      seen = localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      seen = false;
    }
    if (seen) return;

    setVisible(true);
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    const timer = window.setTimeout(() => setVisible(false), 3200);
    return () => window.clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[1200] md:hidden bg-slate-950/55 backdrop-blur-sm flex items-center justify-center px-5">
      <div className="w-full max-w-sm rounded-[2rem] border border-slate-200/80 dark:border-slate-700/80 bg-white/95 dark:bg-slate-900/95 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.35)] text-center space-y-4">
        <div className="flex justify-center">
          <Logo size="md" className="text-6xl leading-none" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-luna-purple">{copy.title}</p>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{copy.subtitle}</p>
        <button
          onClick={() => setVisible(false)}
          className="px-5 py-2.5 rounded-full bg-luna-purple text-white text-[10px] font-black uppercase tracking-[0.15em]"
        >
          {copy.continue}
        </button>
      </div>
    </div>
  );
};

