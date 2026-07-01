import React from 'react';
import { ArrowLeft } from 'lucide-react';
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

type MemberIconBackButtonProps = {
  lang: Language;
  onClick: () => void;
  label?: string;
  className?: string;
};

export const MemberIconBackButton: React.FC<MemberIconBackButtonProps> = ({ lang, onClick, label, className = '' }) => (
  <div className={`flex justify-start mb-6 ${className}`}>
    <button type="button" onClick={onClick} className={MEMBER_BACK_BUTTON}>
      <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" aria-hidden="true" />
      {label || getLang(backByLang, lang) || backByLang.en}
    </button>
  </div>
);
