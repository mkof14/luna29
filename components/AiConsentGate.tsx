import React, { useEffect, useState } from 'react';
import { Language, LangCopy, getLang } from '../constants';
import { isAiProcessingAllowed } from '../utils/aiConsent';
import { savePrivacyConsent } from '../utils/privacyCompliance';

const copyByLang: LangCopy<{
  title: string;
  body: string;
  enable: string;
  decline: string;
}> = {
  en: {
    title: 'Enable AI voice processing',
    body: 'Luna29 sends your voice transcript to our secure server for understanding and reflection. You can change this anytime in Privacy settings.',
    enable: 'Allow AI processing',
    decline: 'Not now',
  },
  ru: {
    title: 'Включить AI-обработку голоса',
    body: 'Luna29 отправляет расшифровку голоса на защищённый сервер для понимания и рефлексии. Это можно изменить в настройках приватности.',
    enable: 'Разрешить AI-обработку',
    decline: 'Не сейчас',
  },
  uk: {
    title: 'Увімкнути AI-обробку голосу',
    body: 'Luna29 надсилає розшифровку голосу на захищений сервер. Це можна змінити в налаштуваннях приватності.',
    enable: 'Дозволити AI-обробку',
    decline: 'Не зараз',
  },
  es: { title: 'Activar procesamiento de voz con IA', body: 'Luna29 envía la transcripción a nuestro servidor seguro. Puedes cambiarlo en Privacidad.', enable: 'Permitir IA', decline: 'Ahora no' },
  fr: { title: 'Activer le traitement vocal IA', body: 'Luna29 envoie la transcription à notre serveur sécurisé. Modifiable dans Confidentialité.', enable: 'Autoriser l’IA', decline: 'Plus tard' },
  de: { title: 'KI-Sprachverarbeitung aktivieren', body: 'Luna29 sendet Transkripte an unseren sicheren Server. Änderbar in Datenschutz.', enable: 'KI erlauben', decline: 'Nicht jetzt' },
  zh: { title: '启用 AI 语音处理', body: 'Luna29 会将语音转写发送至安全服务器。可在隐私设置中更改。', enable: '允许 AI 处理', decline: '暂不' },
  ja: { title: 'AI音声処理を有効化', body: 'Luna29は音声テキストを安全なサーバーに送信します。プライバシー設定で変更できます。', enable: 'AI処理を許可', decline: '後で' },
  pt: { title: 'Ativar processamento de voz com IA', body: 'A Luna29 envia a transcrição ao servidor seguro. Alterável em Privacidade.', enable: 'Permitir IA', decline: 'Agora não' },
  ar: {
    title: 'تفعيل معالجة الصوت بالذكاء الاصطناعي',
    body: 'Luna29 ترسل نصّ صوتكِ إلى خادمنا الآمن للفهم والتأمل. يمكنكِ تغيير ذلك في أي وقت من إعدادات الخصوصية.',
    enable: 'السماح بمعالجة AI',
    decline: 'ليس الآن',
  },
  he: {
    title: 'הפעלת עיבוד קול AI',
    body: 'Luna29 שולחת את תמליל הקול שלך לשרת מאובטח להבנה ורפлексיה. אפשר לשנות זאת בכל עת בהגדרות הפרטיות.',
    enable: 'לאפשר עיבוד AI',
    decline: 'לא עכשיו',
  },
};

type AiConsentGateProps = {
  lang: Language;
  children: React.ReactNode;
  onDeclined?: () => void;
  onGranted?: () => void;
};

export const AiConsentGate: React.FC<AiConsentGateProps> = ({ lang, children, onDeclined, onGranted }) => {
  const copy = getLang(copyByLang, lang) || copyByLang.en;
  const [allowed, setAllowed] = useState(() => isAiProcessingAllowed());

  useEffect(() => {
    setAllowed(isAiProcessingAllowed());
  }, []);

  if (allowed) return <>{children}</>;

  return (
    <div className="rounded-[1.5rem] border border-luna-purple/30 bg-luna-purple/5 dark:bg-luna-purple/10 p-5 space-y-4">
      <p className="text-sm font-black text-slate-900 dark:text-slate-100">{copy.title}</p>
      <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">{copy.body}</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            savePrivacyConsent({ ai_processing: true });
            setAllowed(true);
            onGranted?.();
          }}
          className="px-4 py-2 rounded-full bg-luna-purple text-white text-[10px] font-black uppercase tracking-[0.14em]"
        >
          {copy.enable}
        </button>
        <button
          type="button"
          onClick={() => onDeclined?.()}
          className="px-4 py-2 rounded-full border border-slate-300 dark:border-slate-600 text-[10px] font-black uppercase tracking-[0.14em] text-slate-600 dark:text-slate-300"
        >
          {copy.decline}
        </button>
      </div>
    </div>
  );
};
