import { LangCopy } from '../../constants';
import { LegalDocType } from './types';

export type LegalNavDocType = Exclude<LegalDocType, 'legal'>;

export const LEGAL_NAV_LABELS: LangCopy<Record<LegalNavDocType, string>> = {
  en: {
    privacy: 'Privacy',
    terms: 'Terms of Use',
    medical: 'Wellness Notice',
    cookies: 'Cookies',
    data_rights: 'Your Data',
  },
  ru: {
    privacy: 'Приватность',
    terms: 'Условия использования',
    medical: 'Wellness-уведомление',
    cookies: 'Cookies',
    data_rights: 'Ваши данные',
  },
  uk: {
    privacy: 'Приватність',
    terms: 'Умови використання',
    medical: 'Wellness-повідомлення',
    cookies: 'Cookies',
    data_rights: 'Ваші дані',
  },
  es: {
    privacy: 'Privacidad',
    terms: 'Condiciones de uso',
    medical: 'Aviso wellness',
    cookies: 'Cookies',
    data_rights: 'Tus datos',
  },
  fr: {
    privacy: 'Confidentialité',
    terms: "Conditions d'utilisation",
    medical: 'Avis wellness',
    cookies: 'Cookies',
    data_rights: 'Vos données',
  },
  de: {
    privacy: 'Datenschutz',
    terms: 'Nutzungsbedingungen',
    medical: 'Wellness-Hinweis',
    cookies: 'Cookies',
    data_rights: 'Ihre Daten',
  },
  zh: {
    privacy: '隐私',
    terms: '使用条款',
    medical: '健康提示',
    cookies: 'Cookie',
    data_rights: '您的数据',
  },
  ja: {
    privacy: 'プライバシー',
    terms: '利用規約',
    medical: 'ウェルネス通知',
    cookies: 'Cookie',
    data_rights: 'あなたのデータ',
  },
  pt: {
    privacy: 'Privacidade',
    terms: 'Termos de uso',
    medical: 'Aviso wellness',
    cookies: 'Cookies',
    data_rights: 'Seus dados',
  },
  ar: {
    privacy: 'الخصوصية',
    terms: 'شروط الاستخدام',
    medical: 'إشعار wellness',
    cookies: 'ملفات تعريف الارتباط',
    data_rights: 'بياناتك',
  },
  he: {
    privacy: 'פרטיות',
    terms: 'תנאי שימוש',
    medical: 'הודעת wellness',
    cookies: 'עוגיות',
    data_rights: 'הנתונים שלך',
  },
};

export const LEGAL_HUB_LABEL: LangCopy<string> = {
  en: 'Legal',
  ru: 'Юридическая информация',
  uk: 'Юридична інформація',
  es: 'Legal',
  fr: 'Juridique',
  de: 'Rechtliches',
  zh: '法律信息',
  ja: '法務情報',
  pt: 'Legal',
  ar: 'قانوني',
  he: 'משפטי',
};
