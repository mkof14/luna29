import React from 'react';
import { Language, LangCopy, getLang } from '../../constants';
import { MEMBER_BACK_BUTTON } from '../../utils/memberPageStyles';

const backByLang: LangCopy<string> = {
  en: 'Back',
  ru: 'Назад',
  uk: 'Назад',
  es: 'Volver',
  fr: 'Retour',
  de: 'Zurück',
  zh: '返回',
  ja: '戻る',
  pt: 'Voltar',
  ar: 'رجوع',
  he: 'חזרה',
};

type MemberBackButtonProps = {
  lang: Language;
  onClick: () => void;
  label?: string;
};

export const MemberBackButton: React.FC<MemberBackButtonProps> = ({ lang, onClick, label }) => (
  <div className="flex justify-start mb-6">
    <button type="button" onClick={onClick} className={MEMBER_BACK_BUTTON}>
      <span className="text-base group-hover:-translate-x-1 transition-transform" aria-hidden="true">
        ←
      </span>
      {label || getLang(backByLang, lang) || backByLang.en}
    </button>
  </div>
);
