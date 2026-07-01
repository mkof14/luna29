import { LangCopy } from '../../constants';
import { LegalDocSection } from './types';
import { LEGAL_ENTITY_NAME, LEGAL_PRIVACY_EMAIL, LEGAL_SUPPORT_EMAIL, LEGAL_WEBSITE } from './entity';

export const LEGAL_CONTACT_SECTION: LangCopy<LegalDocSection> = {
  en: {
    heading: 'Contact',
    body: `Questions about this document may be sent to ${LEGAL_PRIVACY_EMAIL}. General support: ${LEGAL_SUPPORT_EMAIL}. Controller: ${LEGAL_ENTITY_NAME}. Website: ${LEGAL_WEBSITE}. We respond to verified privacy requests within timeframes required by applicable law.`,
  },
  ru: {
    heading: 'Контакты',
    body: `Вопросы по этому документу: ${LEGAL_PRIVACY_EMAIL}. Поддержка: ${LEGAL_SUPPORT_EMAIL}. Оператор: ${LEGAL_ENTITY_NAME}. Сайт: ${LEGAL_WEBSITE}. На верифицированные запросы по конфиденциальности отвечаем в сроки, установленные применимым правом.`,
  },
  uk: {
    heading: 'Контакти',
    body: `Питання щодо цього документа: ${LEGAL_PRIVACY_EMAIL}. Підтримка: ${LEGAL_SUPPORT_EMAIL}. Оператор: ${LEGAL_ENTITY_NAME}. Сайт: ${LEGAL_WEBSITE}. На верифіковані запити щодо конфіденційності відповідаємо у строки, передбачені застосовним правом.`,
  },
  es: {
    heading: 'Contacto',
    body: `Preguntas sobre este documento: ${LEGAL_PRIVACY_EMAIL}. Soporte: ${LEGAL_SUPPORT_EMAIL}. Responsable: ${LEGAL_ENTITY_NAME}. Sitio web: ${LEGAL_WEBSITE}. Respondemos solicitudes de privacidad verificadas en los plazos exigidos por la ley aplicable.`,
  },
  fr: {
    heading: 'Contact',
    body: `Questions sur ce document : ${LEGAL_PRIVACY_EMAIL}. Assistance : ${LEGAL_SUPPORT_EMAIL}. Responsable : ${LEGAL_ENTITY_NAME}. Site : ${LEGAL_WEBSITE}. Nous répondons aux demandes de confidentialité vérifiées dans les délais requis par la loi applicable.`,
  },
  de: {
    heading: 'Kontakt',
    body: `Fragen zu diesem Dokument: ${LEGAL_PRIVACY_EMAIL}. Support: ${LEGAL_SUPPORT_EMAIL}. Verantwortlicher: ${LEGAL_ENTITY_NAME}. Website: ${LEGAL_WEBSITE}. Wir beantworten verifizierte Datenschutzanfragen innerhalb der gesetzlich vorgeschriebenen Fristen.`,
  },
  zh: {
    heading: '联系方式',
    body: `有关本文档的问题请发送至 ${LEGAL_PRIVACY_EMAIL}。一般支持：${LEGAL_SUPPORT_EMAIL}。控制者：${LEGAL_ENTITY_NAME}。网站：${LEGAL_WEBSITE}。我们将在适用法律要求的期限内回复经核实的隐私请求。`,
  },
  ja: {
    heading: 'お問い合わせ',
    body: `本ドキュメントに関するお問い合わせ：${LEGAL_PRIVACY_EMAIL}。一般サポート：${LEGAL_SUPPORT_EMAIL}。管理者：${LEGAL_ENTITY_NAME}。ウェブサイト：${LEGAL_WEBSITE}。確認済みのプライバシーリクエストには、適用法で要求される期間内に回答します。`,
  },
  pt: {
    heading: 'Contato',
    body: `Dúvidas sobre este documento: ${LEGAL_PRIVACY_EMAIL}. Suporte: ${LEGAL_SUPPORT_EMAIL}. Controlador: ${LEGAL_ENTITY_NAME}. Site: ${LEGAL_WEBSITE}. Respondemos solicitações de privacidade verificadas nos prazos exigidos pela lei aplicável.`,
  },
  ar: {
    heading: 'التواصل',
    body: `أسئلة حول هذا المستند: ${LEGAL_PRIVACY_EMAIL}. الدعم: ${LEGAL_SUPPORT_EMAIL}. المشغّل: ${LEGAL_ENTITY_NAME}. الموقع: ${LEGAL_WEBSITE}. نرد على طلبات الخصوصية الموثّقة ضمن المهل التي يفرضها القانون المعمول به.`,
  },
  he: {
    heading: 'יצירת קשר',
    body: `שאלות על מסמך זה: ${LEGAL_PRIVACY_EMAIL}. תמיכה: ${LEGAL_SUPPORT_EMAIL}. בעל השליטה: ${LEGAL_ENTITY_NAME}. אתר: ${LEGAL_WEBSITE}. אנו מגיבים לבקשות פרטיות מאומתות בתוך המועדים הנדרשים על פי דין.`,
  },
};
