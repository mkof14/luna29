import React, { useState } from 'react';
import {Language, LangCopy } from '../constants';
import { clearLunaLocalData, downloadLunaLocalDataExport } from '../utils/privacyCompliance';

export type LegalDocType = 'privacy' | 'terms' | 'medical' | 'cookies' | 'data_rights';

interface LegalDocumentViewProps {
  lang: Language;
  doc: LegalDocType;
  onBack?: () => void;
  mode?: 'member' | 'public';
}

type DocContent = {
  title: string;
  subtitle: string;
  sections: Array<{ heading: string; body: string }>;
};

type DocMeta = {
  icon: string;
  accent: string;
};

const DOC_META: Record<LegalDocType, DocMeta> = {
  privacy: { icon: '🔒', accent: 'text-luna-purple' },
  terms: { icon: '📘', accent: 'text-indigo-500' },
  medical: { icon: '🩺', accent: 'text-rose-500' },
  cookies: { icon: '🍪', accent: 'text-amber-500' },
  data_rights: { icon: '⚖️', accent: 'text-teal-500' },
};

const EN_DOCS: Record<LegalDocType, DocContent> = {
  privacy: {
    title: 'Privacy Notice',
    subtitle: 'How Luna29 collects, stores, and uses information (U.S. oriented baseline notice).',
    sections: [
      { heading: 'Scope', body: 'This notice explains data processing for Luna29 services, public pages, and authenticated member tools.' },
      { heading: 'Data Categories', body: 'We may process account identifiers, usage logs, voluntary journal/check-in inputs, technical diagnostics, and support communications.' },
      { heading: 'Local-First Design', body: 'Core wellness records are designed to remain local when possible. Some features may use external processing providers that receive limited request payloads.' },
      { heading: 'Legal Bases and Purpose', body: 'We process data to provide service functionality, secure access, prevent abuse, respond to support requests, and satisfy legal obligations.' },
      { heading: 'Data Sharing', body: 'We do not sell personal data. We may share data with infrastructure/service providers acting under contract and with authorities when legally required.' },
      { heading: 'Retention', body: 'We retain data only as long as required for service operation, legal compliance, dispute resolution, and security.' },
      { heading: 'Security Incident Response', body: 'If a security incident is detected, Luna29 follows an internal response workflow: containment, impact assessment, remediation, and user notification where legally required.' },
      { heading: 'Children', body: 'Luna29 is not directed to children under 13 and is not intended for pediatric healthcare decision-making.' },
    ],
  },
  terms: {
    title: 'Terms of Use',
    subtitle: 'Baseline U.S. service terms for access and responsible usage.',
    sections: [
      { heading: 'Acceptance', body: 'By using Luna29, you agree to these terms. If you do not agree, do not use the service.' },
      { heading: 'No Medical Relationship', body: 'Use of Luna29 does not create a doctor-patient relationship or any licensed clinical provider relationship.' },
      { heading: 'Account Responsibility', body: 'You are responsible for account credentials, lawful use, and activity performed under your account.' },
      { heading: 'Acceptable Use', body: 'You must not misuse the platform, attempt unauthorized access, interfere with infrastructure, or upload unlawful content.' },
      { heading: 'Service Changes', body: 'Features may be modified, suspended, or removed. We may update terms and post revised effective dates.' },
      { heading: 'Liability Limits', body: 'To the maximum extent permitted by law, Luna29 is provided as-is without warranties and with limited liability.' },
      { heading: 'Governing Framework', body: 'These terms are intended to align with U.S. online service practices; jurisdiction-specific terms may apply where required.' },
    ],
  },
  medical: {
    title: 'Disclaimer',
    subtitle: 'Important safety and scope limitations.',
    sections: [
      { heading: 'Not a Medical Service or Device', body: 'Luna29 is not a medical service, medical device, diagnostic tool, or treatment provider.' },
      { heading: 'No Diagnosis or Treatment', body: 'Luna29 does not diagnose conditions, prescribe treatments, provide medication instructions, or replace clinical judgment.' },
      { heading: 'Not Emergency Care', body: 'Luna29 is not for emergency response. If you may be in danger, call local emergency services immediately.' },
      { heading: 'Informational Use Only', body: 'All outputs are informational and reflective. Medical decisions must be made with a licensed healthcare professional.' },
      { heading: 'No Monitoring Guarantee', body: 'Luna29 does not provide continuous clinical monitoring and must not be relied upon for urgent medical supervision.' },
    ],
  },
  cookies: {
    title: 'Cookies and Tracking Notice',
    subtitle: 'How browser storage and technical tracking are used.',
    sections: [
      { heading: 'Essential Storage', body: 'We use local storage/session data for auth state, language/theme preferences, and basic product continuity.' },
      { heading: 'Analytics and Diagnostics', body: 'Where enabled, technical metrics may be collected to improve stability, performance, and abuse prevention.' },
      { heading: 'No Behavioral Ad Sale', body: 'We do not sell your personal data for cross-context behavioral advertising.' },
      { heading: 'Controls', body: 'You can clear local storage, adjust browser settings, and use built-in controls where available.' },
    ],
  },
  data_rights: {
    title: 'U.S. Data Rights Notice',
    subtitle: 'Consumer rights aligned to CCPA/CPRA-style disclosures.',
    sections: [
      { heading: 'Right to Know', body: 'You may request categories and specific pieces of personal information processed about you.' },
      { heading: 'Right to Delete', body: 'You may request deletion of eligible personal information, subject to legal exceptions.' },
      { heading: 'Right to Correct', body: 'You may request correction of inaccurate personal information where applicable.' },
      { heading: 'Right to Opt-Out', body: 'Where legally applicable, you may opt out of sale/share of personal information. Luna29 states it does not sell personal data.' },
      { heading: 'Non-Discrimination', body: 'We do not discriminate against users for exercising applicable privacy rights.' },
      { heading: 'How to Submit Requests', body: 'Use the Contact channel for privacy/legal requests. We may verify identity before fulfilling requests.' },
    ],
  },
};

const RU_DOCS: Partial<Record<LegalDocType, DocContent>> = {
  medical: {
    title: 'Дисклеймер',
    subtitle: 'Важные ограничения и правила безопасности.',
    sections: [
      { heading: 'Не медицинский сервис и не устройство', body: 'Luna29 не является медицинским сервисом, медицинским устройством, диагностическим инструментом или поставщиком лечения.' },
      { heading: 'Нет диагностики и лечения', body: 'Luna29 не ставит диагнозы, не назначает лечение и не заменяет клиническое решение врача.' },
      { heading: 'Не для экстренной помощи', body: 'Luna29 не предназначена для экстренных ситуаций. При риске для жизни немедленно звоните в экстренные службы.' },
      { heading: 'Только информационная поддержка', body: 'Материалы Luna29 носят информационный и рефлексивный характер. Медицинские решения принимаются только с лицензированным врачом.' },
      { heading: 'Нет гарантии клинического мониторинга', body: 'Luna29 не обеспечивает непрерывный медицинский мониторинг и не должна использоваться для срочного меднаблюдения.' },
    ],
  },
};

const getDoc = (lang: Language, doc: LegalDocType): DocContent => {
  if (lang === 'ru' && RU_DOCS[doc]) return RU_DOCS[doc] as DocContent;
  return EN_DOCS[doc];
};

const LEGAL_UI_BY_LANG: LangCopy< {
  back: string;
  modePublic: string;
  modeMember: string;
  effectiveDate: string;
  lastUpdated: string;
  actionsTitle: string;
  actionsBody: string;
  exportData: string;
  deleteHealth: string;
  deleteAll: string;
  legalNotice: string;
  legalNoticeBody: string;
  feedbackServerExport: string;
  feedbackLocalExport: string;
  feedbackServerSupportDelete: string;
  feedbackLocalHealthDelete: string;
  confirmDeleteAll: string;
  feedbackServerAccountDelete: string;
  feedbackAllLocalDelete: string;
}> = {
  en: {
    back: 'Back',
    modePublic: 'PUBLIC LEGAL',
    modeMember: 'MEMBER LEGAL',
    effectiveDate: 'Effective Date',
    lastUpdated: 'Last Updated',
    actionsTitle: 'Self-Service Data Actions',
    actionsBody: 'This device currently uses local storage. You can export or remove local Luna29 data now.',
    exportData: 'Export My Local Data',
    deleteHealth: 'Delete Local Health Data',
    deleteAll: 'Delete All Local Data',
    legalNotice: 'Legal Notice',
    legalNoticeBody: 'This content is a baseline compliance template for U.S.-oriented product disclosures and does not constitute legal advice.',
    feedbackServerExport: 'Server export downloaded.',
    feedbackLocalExport: 'Local data export downloaded.',
    feedbackServerSupportDelete: 'Server support data deletion request completed.',
    feedbackLocalHealthDelete: 'Local health data removed',
    confirmDeleteAll: 'Delete all local Luna29 data on this device? This cannot be undone.',
    feedbackServerAccountDelete: 'Server account deletion request completed.',
    feedbackAllLocalDelete: 'All local data removed',
  },
  ru: {
    back: 'Назад',
    modePublic: 'ПУБЛИЧЕСКОЕ ПРАВО',
    modeMember: 'ПРАВО УЧАСТНИКА',
    effectiveDate: 'Дата вступления',
    lastUpdated: 'Последнее обновление',
    actionsTitle: 'Самостоятельные действия с данными',
    actionsBody: 'На этом устройстве используются локальные данные. Вы можете экспортировать или удалить локальные данные Luna29.',
    exportData: 'Экспорт локальных данных',
    deleteHealth: 'Удалить локальные данные здоровья',
    deleteAll: 'Удалить все локальные данные',
    legalNotice: 'Юридическое уведомление',
    legalNoticeBody: 'Этот текст является базовым шаблоном соответствия требованиям для США и не является юридической консультацией.',
    feedbackServerExport: 'Выгрузка с сервера скачана.',
    feedbackLocalExport: 'Локальная выгрузка данных скачана.',
    feedbackServerSupportDelete: 'Запрос на удаление support-данных на сервере выполнен.',
    feedbackLocalHealthDelete: 'Локальные данные здоровья удалены',
    confirmDeleteAll: 'Удалить все локальные данные Luna29 на этом устройстве? Это действие нельзя отменить.',
    feedbackServerAccountDelete: 'Запрос на удаление аккаунта на сервере выполнен.',
    feedbackAllLocalDelete: 'Все локальные данные удалены',
  },
  uk: {
    back: 'Назад',
    modePublic: 'ПУБЛІЧНІ ПРАВИЛА',
    modeMember: 'ПРАВИЛА УЧАСНИКА',
    effectiveDate: 'Дата набуття чинності',
    lastUpdated: 'Останнє оновлення',
    actionsTitle: 'Самостійні дії з даними',
    actionsBody: 'На цьому пристрої використовується локальне сховище. Ви можете експортувати або видалити локальні дані Luna29.',
    exportData: 'Експортувати мої локальні дані',
    deleteHealth: 'Видалити локальні дані здоровʼя',
    deleteAll: 'Видалити всі локальні дані',
    legalNotice: 'Юридичне повідомлення',
    legalNoticeBody: 'Цей контент є базовим шаблоном комплаєнсу для орієнтованих на США розкриттів і не є юридичною порадою.',
    feedbackServerExport: 'Серверний експорт завантажено.',
    feedbackLocalExport: 'Локальний експорт даних завантажено.',
    feedbackServerSupportDelete: 'Запит на видалення support-даних на сервері виконано.',
    feedbackLocalHealthDelete: 'Локальні дані здоровʼя видалено',
    confirmDeleteAll: 'Видалити всі локальні дані Luna29 на цьому пристрої? Це неможливо скасувати.',
    feedbackServerAccountDelete: 'Запит на видалення акаунта на сервері виконано.',
    feedbackAllLocalDelete: 'Усі локальні дані видалено',
  },
  es: {
    back: 'Volver',
    modePublic: 'LEGAL PÚBLICO',
    modeMember: 'LEGAL DE MIEMBRO',
    effectiveDate: 'Fecha de vigencia',
    lastUpdated: 'Última actualización',
    actionsTitle: 'Acciones de datos de autoservicio',
    actionsBody: 'Este dispositivo usa almacenamiento local. Puedes exportar o eliminar ahora los datos locales de Luna29.',
    exportData: 'Exportar mis datos locales',
    deleteHealth: 'Eliminar datos locales de salud',
    deleteAll: 'Eliminar todos los datos locales',
    legalNotice: 'Aviso legal',
    legalNoticeBody: 'Este contenido es una plantilla base de cumplimiento para divulgaciones orientadas a EE. UU. y no constituye asesoría legal.',
    feedbackServerExport: 'Exportación del servidor descargada.',
    feedbackLocalExport: 'Exportación local de datos descargada.',
    feedbackServerSupportDelete: 'Solicitud de eliminación de datos de soporte en servidor completada.',
    feedbackLocalHealthDelete: 'Datos locales de salud eliminados',
    confirmDeleteAll: '¿Eliminar todos los datos locales de Luna29 en este dispositivo? Esta acción no se puede deshacer.',
    feedbackServerAccountDelete: 'Solicitud de eliminación de cuenta en servidor completada.',
    feedbackAllLocalDelete: 'Todos los datos locales eliminados',
  },
  fr: {
    back: 'Retour',
    modePublic: 'JURIDIQUE PUBLIC',
    modeMember: 'JURIDIQUE MEMBRE',
    effectiveDate: 'Date d’effet',
    lastUpdated: 'Dernière mise à jour',
    actionsTitle: 'Actions de données en libre-service',
    actionsBody: 'Cet appareil utilise un stockage local. Vous pouvez exporter ou supprimer les données locales Luna29.',
    exportData: 'Exporter mes données locales',
    deleteHealth: 'Supprimer les données santé locales',
    deleteAll: 'Supprimer toutes les données locales',
    legalNotice: 'Mentions légales',
    legalNoticeBody: 'Ce contenu est un modèle de conformité de base pour des divulgations orientées U.S. et ne constitue pas un conseil juridique.',
    feedbackServerExport: 'Export serveur téléchargé.',
    feedbackLocalExport: 'Export local des données téléchargé.',
    feedbackServerSupportDelete: 'Demande de suppression des données support sur serveur effectuée.',
    feedbackLocalHealthDelete: 'Données santé locales supprimées',
    confirmDeleteAll: 'Supprimer toutes les données locales Luna29 sur cet appareil ? Cette action est irréversible.',
    feedbackServerAccountDelete: 'Demande de suppression du compte sur serveur effectuée.',
    feedbackAllLocalDelete: 'Toutes les données locales supprimées',
  },
  de: {
    back: 'Zurück',
    modePublic: 'ÖFFENTLICH RECHTLICH',
    modeMember: 'MITGLIED RECHTLICH',
    effectiveDate: 'Gültig ab',
    lastUpdated: 'Zuletzt aktualisiert',
    actionsTitle: 'Self-Service-Datenaktionen',
    actionsBody: 'Dieses Gerät nutzt lokalen Speicher. Sie können lokale Luna29-Daten jetzt exportieren oder entfernen.',
    exportData: 'Meine lokalen Daten exportieren',
    deleteHealth: 'Lokale Gesundheitsdaten löschen',
    deleteAll: 'Alle lokalen Daten löschen',
    legalNotice: 'Rechtlicher Hinweis',
    legalNoticeBody: 'Dieser Inhalt ist eine Basis-Compliance-Vorlage für U.S.-orientierte Offenlegungen und stellt keine Rechtsberatung dar.',
    feedbackServerExport: 'Server-Export heruntergeladen.',
    feedbackLocalExport: 'Lokaler Datenexport heruntergeladen.',
    feedbackServerSupportDelete: 'Anfrage zur Löschung von Support-Daten auf dem Server abgeschlossen.',
    feedbackLocalHealthDelete: 'Lokale Gesundheitsdaten gelöscht',
    confirmDeleteAll: 'Alle lokalen Luna29-Daten auf diesem Gerät löschen? Dies kann nicht rückgängig gemacht werden.',
    feedbackServerAccountDelete: 'Anfrage zur Kontolöschung auf dem Server abgeschlossen.',
    feedbackAllLocalDelete: 'Alle lokalen Daten gelöscht',
  },
  zh: {
    back: '返回',
    modePublic: '公开法律',
    modeMember: '会员法律',
    effectiveDate: '生效日期',
    lastUpdated: '最后更新',
    actionsTitle: '自助数据操作',
    actionsBody: '此设备当前使用本地存储。你可以立即导出或删除 Luna29 本地数据。',
    exportData: '导出我的本地数据',
    deleteHealth: '删除本地健康数据',
    deleteAll: '删除所有本地数据',
    legalNotice: '法律声明',
    legalNoticeBody: '本内容为面向美国披露要求的基础合规模板，不构成法律建议。',
    feedbackServerExport: '服务器导出已下载。',
    feedbackLocalExport: '本地数据导出已下载。',
    feedbackServerSupportDelete: '服务器支持数据删除请求已完成。',
    feedbackLocalHealthDelete: '本地健康数据已删除',
    confirmDeleteAll: '删除此设备上的所有 Luna29 本地数据？此操作无法撤销。',
    feedbackServerAccountDelete: '服务器账户删除请求已完成。',
    feedbackAllLocalDelete: '所有本地数据已删除',
  },
  ja: {
    back: '戻る',
    modePublic: '公開リーガル',
    modeMember: 'メンバーリーガル',
    effectiveDate: '発効日',
    lastUpdated: '最終更新',
    actionsTitle: 'セルフサービスデータ操作',
    actionsBody: 'このデバイスはローカルストレージを使用しています。Luna29のローカルデータをエクスポートまたは削除できます。',
    exportData: 'ローカルデータをエクスポート',
    deleteHealth: 'ローカル健康データを削除',
    deleteAll: 'すべてのローカルデータを削除',
    legalNotice: '法的通知',
    legalNoticeBody: 'この内容は米国向け開示のための基本的なコンプライアンステンプレートであり、法的助言ではありません。',
    feedbackServerExport: 'サーバーエクスポートをダウンロードしました。',
    feedbackLocalExport: 'ローカルデータエクスポートをダウンロードしました。',
    feedbackServerSupportDelete: 'サーバー上のサポートデータ削除リクエストが完了しました。',
    feedbackLocalHealthDelete: 'ローカル健康データを削除しました',
    confirmDeleteAll: 'このデバイス上のLuna29ローカルデータをすべて削除しますか？元に戻せません。',
    feedbackServerAccountDelete: 'サーバー上のアカウント削除リクエストが完了しました。',
    feedbackAllLocalDelete: 'すべてのローカルデータを削除しました',
  },
  pt: {
    back: 'Voltar',
    modePublic: 'LEGAL PÚBLICO',
    modeMember: 'LEGAL DE MEMBRO',
    effectiveDate: 'Data de vigência',
    lastUpdated: 'Última atualização',
    actionsTitle: 'Ações de dados em autoatendimento',
    actionsBody: 'Este dispositivo usa armazenamento local. Você pode exportar ou remover agora os dados locais da Luna29.',
    exportData: 'Exportar meus dados locais',
    deleteHealth: 'Excluir dados locais de saúde',
    deleteAll: 'Excluir todos os dados locais',
    legalNotice: 'Aviso legal',
    legalNoticeBody: 'Este conteúdo é um modelo básico de conformidade para divulgações orientadas aos EUA e não constitui aconselhamento jurídico.',
    feedbackServerExport: 'Exportação do servidor baixada.',
    feedbackLocalExport: 'Exportação local de dados baixada.',
    feedbackServerSupportDelete: 'Solicitação de exclusão de dados de suporte no servidor concluída.',
    feedbackLocalHealthDelete: 'Dados locais de saúde removidos',
    confirmDeleteAll: 'Excluir todos os dados locais da Luna29 neste dispositivo? Esta ação não pode ser desfeita.',
    feedbackServerAccountDelete: 'Solicitação de exclusão de conta no servidor concluída.',
    feedbackAllLocalDelete: 'Todos os dados locais removidos',
  },
  ar: {
    back: 'Back',
    modePublic: 'PUBLIC LEGAL',
    modeMember: 'MEMBER LEGAL',
    effectiveDate: 'Effective Date',
    lastUpdated: 'Last Updated',
    actionsTitle: 'Self-Service Data Actions',
    actionsBody: 'This device currently uses local storage. You can export or remove local Luna29 data now.',
    exportData: 'Export My Local Data',
    deleteHealth: 'Delete Local Health Data',
    deleteAll: 'Delete All Local Data',
    legalNotice: 'Legal Notice',
    legalNoticeBody: 'This content is a baseline compliance template for U.S.-oriented product disclosures and does not constitute legal advice.',
    feedbackServerExport: 'Server export downloaded.',
    feedbackLocalExport: 'Local data export downloaded.',
    feedbackServerSupportDelete: 'Server support data deletion request completed.',
    feedbackLocalHealthDelete: 'Local health data removed',
    confirmDeleteAll: 'Delete all local Luna29 data on this device? This cannot be undone.',
    feedbackServerAccountDelete: 'Server account deletion request completed.',
    feedbackAllLocalDelete: 'All local data removed',
  },
  he: {
    back: 'Back',
    modePublic: 'PUBLIC LEGAL',
    modeMember: 'MEMBER LEGAL',
    effectiveDate: 'Effective Date',
    lastUpdated: 'Last Updated',
    actionsTitle: 'Self-Service Data Actions',
    actionsBody: 'This device currently uses local storage. You can export or remove local Luna29 data now.',
    exportData: 'Export My Local Data',
    deleteHealth: 'Delete Local Health Data',
    deleteAll: 'Delete All Local Data',
    legalNotice: 'Legal Notice',
    legalNoticeBody: 'This content is a baseline compliance template for U.S.-oriented product disclosures and does not constitute legal advice.',
    feedbackServerExport: 'Server export downloaded.',
    feedbackLocalExport: 'Local data export downloaded.',
    feedbackServerSupportDelete: 'Server support data deletion request completed.',
    feedbackLocalHealthDelete: 'Local health data removed',
    confirmDeleteAll: 'Delete all local Luna29 data on this device? This cannot be undone.',
    feedbackServerAccountDelete: 'Server account deletion request completed.',
    feedbackAllLocalDelete: 'All local data removed',
  },};

export const LegalDocumentView: React.FC<LegalDocumentViewProps> = ({ lang, doc, onBack, mode = 'member' }) => {
  const copy = getDoc(lang, doc);
  const ui = LEGAL_UI_BY_LANG[lang] || LEGAL_UI_BY_LANG.en;
  const modeLabel = mode === 'public' ? ui.modePublic : ui.modeMember;
  const meta = DOC_META[doc];
  const effectiveDate = 'March 4, 2026';
  const lastUpdated = 'March 4, 2026';
  const [actionFeedback, setActionFeedback] = useState('');

  const downloadJson = (filename: string, payload: unknown) => {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const exportLocalData = async () => {
    try {
      const response = await fetch('/api/privacy/export', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (response.ok) {
        const payload = await response.json();
        downloadJson(`luna-server-export-${payload.requestId || Date.now()}.json`, payload);
        setActionFeedback(ui.feedbackServerExport);
        return;
      }
    } catch {
      // fallback to local export below
    }

    downloadLunaLocalDataExport();
    setActionFeedback(ui.feedbackLocalExport);
  };

  const deleteHealthData = async () => {
    try {
      const response = await fetch('/api/privacy/delete', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scope: 'support_only' }),
      });
      if (response.ok) {
        setActionFeedback(ui.feedbackServerSupportDelete);
        return;
      }
    } catch {
      // fallback to local delete below
    }
    const removed = clearLunaLocalData(false);
    setActionFeedback(`${ui.feedbackLocalHealthDelete}: ${removed} keys.`);
  };

  const deleteAllData = async () => {
    const confirmed = window.confirm(ui.confirmDeleteAll);
    if (!confirmed) return;

    try {
      const response = await fetch('/api/privacy/delete', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scope: 'account' }),
      });
      if (response.ok) {
        setActionFeedback(ui.feedbackServerAccountDelete);
        window.location.reload();
        return;
      }
    } catch {
      // fallback to local delete below
    }

    const removed = clearLunaLocalData(true);
    setActionFeedback(`${ui.feedbackAllLocalDelete}: ${removed} keys.`);
    window.location.reload();
  };

  return (
    <article className="max-w-5xl mx-auto luna-page-shell luna-page-questions space-y-10 animate-in fade-in duration-700 pb-24 p-8 md:p-10">
      {onBack && (
        <button onClick={onBack} className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-luna-purple transition-all">
          ← {ui.back}
        </button>
      )}
      <header className="rounded-[2rem] border border-slate-200 dark:border-slate-700 luna-vivid-surface p-6 md:p-7 space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{meta.icon}</span>
          <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${meta.accent}`}>{modeLabel}</p>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-slate-100">{copy.title}</h1>
        <p className="text-base font-semibold text-slate-600 dark:text-slate-300">{copy.subtitle}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="rounded-xl luna-vivid-chip p-3 border border-slate-200 dark:border-slate-700">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">{ui.effectiveDate}</p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-100">{effectiveDate}</p>
          </div>
          <div className="rounded-xl luna-vivid-chip p-3 border border-slate-200 dark:border-slate-700">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">{ui.lastUpdated}</p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-100">{lastUpdated}</p>
          </div>
        </div>
      </header>
      <section className="grid grid-cols-1 gap-5">
        {copy.sections.map((section) => (
          <article key={section.heading} className="rounded-[2rem] border border-slate-200 dark:border-slate-700 luna-vivid-card p-6 md:p-7">
            <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-slate-100">{section.heading}</h2>
            <p className="mt-2 text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">{section.body}</p>
          </article>
        ))}
      </section>
      {doc === 'data_rights' && (
        <section className="rounded-[2rem] border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 p-6 md:p-7 space-y-4">
          <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-slate-100">{ui.actionsTitle}</h2>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {ui.actionsBody}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <button onClick={exportLocalData} className="px-4 py-2 rounded-full border border-luna-purple/40 text-luna-purple text-xs font-black uppercase tracking-[0.12em]">
              {ui.exportData}
            </button>
            <button onClick={deleteHealthData} className="px-4 py-2 rounded-full border border-amber-500/40 text-amber-600 text-xs font-black uppercase tracking-[0.12em]">
              {ui.deleteHealth}
            </button>
            <button onClick={deleteAllData} className="px-4 py-2 rounded-full border border-rose-500/40 text-rose-600 text-xs font-black uppercase tracking-[0.12em]">
              {ui.deleteAll}
            </button>
          </div>
          {actionFeedback && <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{actionFeedback}</p>}
        </section>
      )}
      <div className="rounded-2xl border border-slate-300/70 dark:border-slate-700/70 bg-slate-100/85 dark:bg-slate-900/45 p-5">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">{ui.legalNotice}</p>
        <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
          {ui.legalNoticeBody}
        </p>
      </div>
    </article>
  );
};
