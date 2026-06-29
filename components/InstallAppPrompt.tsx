import React, { useEffect, useMemo, useState } from 'react';
import { Language, getLang } from '../constants';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface InstallAppPromptProps {
  lang: Language;
}

const DISMISS_KEY = 'luna_install_prompt_dismissed_v1';

export const InstallAppPrompt: React.FC<InstallAppPromptProps> = ({ lang }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (typeof (window.navigator as Navigator & { standalone?: boolean }).standalone === 'boolean' &&
        Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone));
    setIsStandalone(standalone);

    const ua = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(ua);
    setIsIOS(ios);

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    };
  }, []);

  const copyByLang = {
    en: {
      title: 'Install Luna29 App',
      subtitle: 'Open faster and use full-screen like a native app.',
      install: 'Install',
      later: 'Later',
      iosHint: 'On iPhone: Share -> Add to Home Screen',
    },
    ru: {
      title: 'Установить Luna29',
      subtitle: 'Открывайте быстрее и в полноэкранном режиме, как приложение.',
      install: 'Установить',
      later: 'Позже',
      iosHint: 'На iPhone: Поделиться -> На экран Домой',
    },
    uk: {
      title: 'Встановити Luna29',
      subtitle: 'Відкривайте швидше та у повному екрані, як застосунок.',
      install: 'Встановити',
      later: 'Пізніше',
      iosHint: 'На iPhone: Поділитися -> На екран Додому',
    },
    es: {
      title: 'Instalar Luna29',
      subtitle: 'Abre mas rapido y en pantalla completa como una app.',
      install: 'Instalar',
      later: 'Luego',
      iosHint: 'En iPhone: Compartir -> Anadir a inicio',
    },
    fr: {
      title: 'Installer Luna29',
      subtitle: 'Ouvrez plus vite et en plein ecran comme une app.',
      install: 'Installer',
      later: 'Plus tard',
      iosHint: "Sur iPhone: Partager -> Sur l ecran d accueil",
    },
    de: {
      title: 'Luna29 installieren',
      subtitle: 'Schneller starten und im Vollbild wie eine App nutzen.',
      install: 'Installieren',
      later: 'Spater',
      iosHint: 'Auf iPhone: Teilen -> Zum Home-Bildschirm',
    },
    zh: {
      title: '安装 Luna29',
      subtitle: '像原生应用一样全屏打开，启动更快。',
      install: '安装',
      later: '稍后',
      iosHint: 'iPhone: 分享 -> 添加到主屏幕',
    },
    ja: {
      title: 'Luna29 をインストール',
      subtitle: 'ネイティブアプリのように全画面で素早く起動。',
      install: 'インストール',
      later: 'あとで',
      iosHint: 'iPhone: 共有 -> ホーム画面に追加',
    },
    pt: {
      title: 'Instalar Luna29',
      subtitle: 'Abra mais rapido e em tela cheia como app nativo.',
      install: 'Instalar',
      later: 'Depois',
      iosHint: 'No iPhone: Compartilhar -> Adicionar a Tela Inicial',
    },
  ar: {
      title: 'Install Luna29 App',
      subtitle: 'Open faster and use full-screen like a native app.',
      install: 'Install',
      later: 'Later',
      iosHint: 'On iPhone: Share -> Add to Home Screen',
    },
  he: {
      title: 'Install Luna29 App',
      subtitle: 'Open faster and use full-screen like a native app.',
      install: 'Install',
      later: 'Later',
      iosHint: 'On iPhone: Share -> Add to Home Screen',
    },};

  const copy = getLang(copyByLang, lang) || copyByLang.en;

  const canShow = useMemo(() => {
    if (isDismissed || isStandalone) return false;
    return Boolean(deferredPrompt) || isIOS;
  }, [deferredPrompt, isDismissed, isStandalone, isIOS]);

  const dismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // ignore storage errors
    }
  };

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  if (!canShow) return null;

  return (
    <aside
      className="fixed left-3 right-3 bottom-24 md:hidden z-[520] rounded-3xl border border-slate-200/90 dark:border-slate-700/90 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-4"
      style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-luna-purple">{copy.title}</p>
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{copy.subtitle}</p>
        {isIOS && !deferredPrompt && (
          <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300">{copy.iosHint}</p>
        )}
      </div>
      <div className="mt-3 flex items-center gap-2">
        {deferredPrompt && (
          <button
            onClick={install}
            className="px-4 py-2 rounded-full bg-luna-purple text-white text-[10px] font-black uppercase tracking-[0.14em]"
          >
            {copy.install}
          </button>
        )}
        <button
          onClick={dismiss}
          className="px-4 py-2 rounded-full border border-slate-300 dark:border-slate-600 text-[10px] font-black uppercase tracking-[0.14em] text-slate-600 dark:text-slate-300"
        >
          {copy.later}
        </button>
      </div>
    </aside>
  );
};

