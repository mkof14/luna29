import React, { useMemo, useState } from 'react';
import {Language, LangCopy } from '../constants';
import {
  acceptAllPrivacyScopes,
  acceptEssentialOnly,
  clearLunaLocalData,
  downloadLunaLocalDataExport,
  readPrivacyConsent,
  savePrivacyConsent,
} from '../utils/privacyCompliance';
import { refreshAnalyticsConsent } from '../services/analyticsService';

type Copy = {
  bannerTitle: string;
  bannerBody: string;
  acceptAll: string;
  essentialOnly: string;
  manage: string;
  controls: string;
  panelTitle: string;
  panelBody: string;
  essential: string;
  analytics: string;
  aiProcessing: string;
  personalization: string;
  alwaysOn: string;
  save: string;
  close: string;
  exportData: string;
  deleteHealth: string;
  deleteAll: string;
  done: string;
  caution: string;
};

const COPY_BY_LANG: LangCopy< Copy> = {
  en: {
    bannerTitle: 'Privacy Controls',
    bannerBody: 'Health data stays on your device. Choose optional analytics and AI processing.',
    acceptAll: 'Accept All',
    essentialOnly: 'Essential Only',
    manage: 'Manage',
    controls: 'Privacy',
    panelTitle: 'Privacy Controls',
    panelBody: 'You can change these settings anytime. Essential storage stays enabled.',
    essential: 'Essential Storage',
    analytics: 'Analytics',
    aiProcessing: 'AI Processing',
    personalization: 'Personalization',
    alwaysOn: 'Always on',
    save: 'Save Settings',
    close: 'Close',
    exportData: 'Export My Local Data',
    deleteHealth: 'Delete Local Health Data',
    deleteAll: 'Delete All Local Data',
    done: 'Done',
    caution: 'Local deletion cannot be undone.',
  },
  ru: {
    bannerTitle: 'Контроль Приватности',
    bannerBody: 'Данные здоровья остаются на устройстве. Выберите опциональную аналитику и AI-обработку.',
    acceptAll: 'Разрешить Все',
    essentialOnly: 'Только Базовые',
    manage: 'Настроить',
    controls: 'Приватность',
    panelTitle: 'Контроль Приватности',
    panelBody: 'Эти настройки можно изменить в любое время. Базовое хранилище всегда включено.',
    essential: 'Базовое Хранилище',
    analytics: 'Аналитика',
    aiProcessing: 'AI Обработка',
    personalization: 'Персонализация',
    alwaysOn: 'Всегда включено',
    save: 'Сохранить',
    close: 'Закрыть',
    exportData: 'Экспорт Моих Локальных Данных',
    deleteHealth: 'Удалить Локальные Данные Здоровья',
    deleteAll: 'Удалить Все Локальные Данные',
    done: 'Готово',
    caution: 'Локальное удаление нельзя отменить.',
  },
  uk: {
    bannerTitle: 'Контроль Приватності',
    bannerBody: 'Оберіть, як Luna29 обробляє локальні та додаткові дані.',
    acceptAll: 'Дозволити Все',
    essentialOnly: 'Лише Базові',
    manage: 'Налаштувати',
    controls: 'Приватність',
    panelTitle: 'Контроль Приватності',
    panelBody: 'Ці параметри можна змінити у будь-який момент. Базове сховище завжди активне.',
    essential: 'Базове Сховище',
    analytics: 'Аналітика',
    aiProcessing: 'AI Обробка',
    personalization: 'Персоналізація',
    alwaysOn: 'Завжди увімкнено',
    save: 'Зберегти',
    close: 'Закрити',
    exportData: 'Експорт Моїх Локальних Даних',
    deleteHealth: 'Видалити Локальні Дані Здоровʼя',
    deleteAll: 'Видалити Усі Локальні Дані',
    done: 'Готово',
    caution: 'Локальне видалення неможливо скасувати.',
  },
  es: {
    bannerTitle: 'Controles de Privacidad',
    bannerBody: 'Elige cómo Luna29 procesa datos locales y opcionales.',
    acceptAll: 'Aceptar Todo',
    essentialOnly: 'Solo Esencial',
    manage: 'Gestionar',
    controls: 'Privacidad',
    panelTitle: 'Controles de Privacidad',
    panelBody: 'Puedes cambiar estos ajustes en cualquier momento. El almacenamiento esencial permanece activo.',
    essential: 'Almacenamiento Esencial',
    analytics: 'Analítica',
    aiProcessing: 'Procesamiento AI',
    personalization: 'Personalización',
    alwaysOn: 'Siempre activo',
    save: 'Guardar Ajustes',
    close: 'Cerrar',
    exportData: 'Exportar Mis Datos Locales',
    deleteHealth: 'Eliminar Datos Locales de Salud',
    deleteAll: 'Eliminar Todos Los Datos Locales',
    done: 'Listo',
    caution: 'La eliminación local no se puede deshacer.',
  },
  fr: {
    bannerTitle: 'Contrôles de Confidentialité',
    bannerBody: 'Choisissez comment Luna29 traite les données locales et optionnelles.',
    acceptAll: 'Tout Accepter',
    essentialOnly: 'Essentiel Uniquement',
    manage: 'Gérer',
    controls: 'Confidentialité',
    panelTitle: 'Contrôles de Confidentialité',
    panelBody: 'Vous pouvez modifier ces paramètres à tout moment. Le stockage essentiel reste activé.',
    essential: 'Stockage Essentiel',
    analytics: 'Analytique',
    aiProcessing: 'Traitement AI',
    personalization: 'Personnalisation',
    alwaysOn: 'Toujours activé',
    save: 'Enregistrer',
    close: 'Fermer',
    exportData: 'Exporter Mes Données Locales',
    deleteHealth: 'Supprimer Les Données Santé Locales',
    deleteAll: 'Supprimer Toutes Les Données Locales',
    done: 'Terminé',
    caution: 'La suppression locale est irréversible.',
  },
  de: {
    bannerTitle: 'Datenschutz-Steuerung',
    bannerBody: 'Wählen Sie, wie Luna29 lokale und optionale Nutzungsdaten verarbeitet.',
    acceptAll: 'Alles Akzeptieren',
    essentialOnly: 'Nur Essenziell',
    manage: 'Verwalten',
    controls: 'Datenschutz',
    panelTitle: 'Datenschutz-Steuerung',
    panelBody: 'Sie können diese Einstellungen jederzeit ändern. Essenzieller Speicher bleibt aktiviert.',
    essential: 'Essenzieller Speicher',
    analytics: 'Analytik',
    aiProcessing: 'AI-Verarbeitung',
    personalization: 'Personalisierung',
    alwaysOn: 'Immer aktiv',
    save: 'Einstellungen Speichern',
    close: 'Schließen',
    exportData: 'Meine Lokalen Daten Exportieren',
    deleteHealth: 'Lokale Gesundheitsdaten Löschen',
    deleteAll: 'Alle Lokalen Daten Löschen',
    done: 'Fertig',
    caution: 'Lokales Löschen kann nicht rückgängig gemacht werden.',
  },
  zh: {
    bannerTitle: '隐私控制',
    bannerBody: '选择 Luna29 如何处理本地与可选使用数据。',
    acceptAll: '全部接受',
    essentialOnly: '仅必要项',
    manage: '管理',
    controls: '隐私',
    panelTitle: '隐私控制',
    panelBody: '你可以随时更改设置。必要存储始终保持开启。',
    essential: '必要存储',
    analytics: '分析',
    aiProcessing: 'AI 处理',
    personalization: '个性化',
    alwaysOn: '始终开启',
    save: '保存设置',
    close: '关闭',
    exportData: '导出我的本地数据',
    deleteHealth: '删除本地健康数据',
    deleteAll: '删除所有本地数据',
    done: '完成',
    caution: '本地删除无法撤销。',
  },
  ja: {
    bannerTitle: 'プライバシー設定',
    bannerBody: 'Luna29がローカルおよび任意データをどう処理するかを選択します。',
    acceptAll: 'すべて許可',
    essentialOnly: '必須のみ',
    manage: '管理',
    controls: 'プライバシー',
    panelTitle: 'プライバシー設定',
    panelBody: 'この設定はいつでも変更できます。必須ストレージは常に有効です。',
    essential: '必須ストレージ',
    analytics: '分析',
    aiProcessing: 'AI 処理',
    personalization: 'パーソナライズ',
    alwaysOn: '常に有効',
    save: '設定を保存',
    close: '閉じる',
    exportData: 'ローカルデータをエクスポート',
    deleteHealth: 'ローカル健康データを削除',
    deleteAll: 'すべてのローカルデータを削除',
    done: '完了',
    caution: 'ローカル削除は元に戻せません。',
  },
  pt: {
    bannerTitle: 'Controles de Privacidade',
    bannerBody: 'Escolha como a Luna29 processa dados locais e opcionais.',
    acceptAll: 'Aceitar Tudo',
    essentialOnly: 'Somente Essencial',
    manage: 'Gerenciar',
    controls: 'Privacidade',
    panelTitle: 'Controles de Privacidade',
    panelBody: 'Você pode alterar essas configurações a qualquer momento. O armazenamento essencial permanece ativo.',
    essential: 'Armazenamento Essencial',
    analytics: 'Analítica',
    aiProcessing: 'Processamento AI',
    personalization: 'Personalização',
    alwaysOn: 'Sempre ativo',
    save: 'Salvar Configurações',
    close: 'Fechar',
    exportData: 'Exportar Meus Dados Locais',
    deleteHealth: 'Excluir Dados Locais de Saúde',
    deleteAll: 'Excluir Todos os Dados Locais',
    done: 'Concluído',
    caution: 'A exclusão local não pode ser desfeita.',
  },
};

const fallbackCopy = COPY_BY_LANG.en;

export const PrivacyControls: React.FC<{ lang: Language; isAuthenticated: boolean }> = ({ lang, isAuthenticated }) => {
  const copy = useMemo(() => {
    const byLang = COPY_BY_LANG[lang];
    return byLang?.bannerTitle ? byLang : fallbackCopy;
  }, [lang]);

  const initialConsent = readPrivacyConsent();
  const [showBanner, setShowBanner] = useState(!initialConsent);
  const [showPanel, setShowPanel] = useState(false);
  const [analytics, setAnalytics] = useState(initialConsent?.scopes.analytics ?? false);
  const [aiProcessing, setAiProcessing] = useState(initialConsent?.scopes.ai_processing ?? true);
  const [personalization, setPersonalization] = useState(initialConsent?.scopes.personalization ?? true);
  const [feedback, setFeedback] = useState('');

  const onAcceptAll = () => {
    const next = acceptAllPrivacyScopes();
    setAnalytics(next.scopes.analytics);
    setAiProcessing(next.scopes.ai_processing);
    setPersonalization(next.scopes.personalization);
    setShowBanner(false);
    setFeedback(copy.done);
    refreshAnalyticsConsent().catch(() => undefined);
  };

  const onEssentialOnly = () => {
    const next = acceptEssentialOnly();
    setAnalytics(next.scopes.analytics);
    setAiProcessing(next.scopes.ai_processing);
    setPersonalization(next.scopes.personalization);
    setShowBanner(false);
    setFeedback(copy.done);
    refreshAnalyticsConsent().catch(() => undefined);
  };

  const onSave = () => {
    savePrivacyConsent({ analytics, ai_processing: aiProcessing, personalization });
    setShowBanner(false);
    setFeedback(copy.done);
    refreshAnalyticsConsent().catch(() => undefined);
  };

  const handleExport = () => {
    downloadLunaLocalDataExport();
    setFeedback(copy.done);
  };

  const handleDeleteHealth = () => {
    const removed = clearLunaLocalData(false);
    setFeedback(`${copy.done}: ${removed}`);
    window.location.reload();
  };

  const handleDeleteAll = () => {
    if (!window.confirm(copy.caution)) return;
    clearLunaLocalData(true);
    if (isAuthenticated) {
      window.location.reload();
      return;
    }
    setFeedback(copy.done);
    window.location.reload();
  };

  return (
    <>
      {showBanner && (
        <div className="fixed bottom-4 left-4 right-4 md:right-auto md:w-[520px] z-[120] rounded-3xl border border-slate-300/70 dark:border-slate-700/70 bg-white/95 dark:bg-slate-900/95 backdrop-blur p-5 shadow-2xl space-y-3">
          <p className="text-sm md:text-base font-black uppercase tracking-[0.16em] text-luna-purple">{copy.bannerTitle}</p>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{copy.bannerBody}</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={onAcceptAll} className="px-4 py-2 rounded-full bg-luna-purple text-white text-xs font-black uppercase tracking-[0.12em]">{copy.acceptAll}</button>
            <button onClick={onEssentialOnly} className="px-4 py-2 rounded-full border border-slate-300 dark:border-slate-700 text-xs font-black uppercase tracking-[0.12em] text-slate-700 dark:text-slate-200">{copy.essentialOnly}</button>
            <button onClick={() => setShowPanel(true)} className="px-4 py-2 rounded-full border border-luna-purple/40 text-luna-purple text-xs font-black uppercase tracking-[0.12em]">{copy.manage}</button>
          </div>
        </div>
      )}

      <button
        onClick={() => setShowPanel(true)}
        className="fixed bottom-4 right-4 z-[110] px-4 py-2 rounded-full border border-slate-300/70 dark:border-slate-700/70 bg-white/95 dark:bg-slate-900/95 text-xs font-black uppercase tracking-[0.12em] text-slate-700 dark:text-slate-200"
      >
        {copy.controls}
      </button>

      {showPanel && (
        <div className="fixed inset-0 z-[130] bg-slate-950/55 backdrop-blur-sm p-4 md:p-8 flex items-end md:items-center justify-center">
          <div className="w-full max-w-2xl rounded-[2rem] border border-slate-300/70 dark:border-slate-700/70 bg-white dark:bg-slate-900 p-6 md:p-7 shadow-2xl space-y-5">
            <p className="text-base md:text-lg font-black uppercase tracking-[0.14em] text-luna-purple">{copy.panelTitle}</p>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{copy.panelBody}</p>

            <div className="space-y-3">
              <label className="flex items-center justify-between rounded-xl border border-slate-200/80 dark:border-slate-700/70 p-3">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{copy.essential}</span>
                <span className="text-xs font-black uppercase tracking-[0.12em] text-emerald-600">{copy.alwaysOn}</span>
              </label>
              <label className="flex items-center justify-between rounded-xl border border-slate-200/80 dark:border-slate-700/70 p-3">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{copy.analytics}</span>
                <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} />
              </label>
              <label className="flex items-center justify-between rounded-xl border border-slate-200/80 dark:border-slate-700/70 p-3">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{copy.aiProcessing}</span>
                <input type="checkbox" checked={aiProcessing} onChange={(e) => setAiProcessing(e.target.checked)} />
              </label>
              <label className="flex items-center justify-between rounded-xl border border-slate-200/80 dark:border-slate-700/70 p-3">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{copy.personalization}</span>
                <input type="checkbox" checked={personalization} onChange={(e) => setPersonalization(e.target.checked)} />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <button onClick={handleExport} className="px-3 py-2 rounded-full border border-luna-purple/40 text-luna-purple text-xs font-black uppercase tracking-[0.11em]">{copy.exportData}</button>
              <button onClick={handleDeleteHealth} className="px-3 py-2 rounded-full border border-amber-500/40 text-amber-600 text-xs font-black uppercase tracking-[0.11em]">{copy.deleteHealth}</button>
              <button onClick={handleDeleteAll} className="px-3 py-2 rounded-full border border-rose-500/40 text-rose-600 text-xs font-black uppercase tracking-[0.11em]">{copy.deleteAll}</button>
            </div>

            {feedback && <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{feedback}</p>}

            <div className="flex items-center gap-2">
              <button onClick={onSave} className="px-4 py-2 rounded-full bg-luna-purple text-white text-xs font-black uppercase tracking-[0.12em]">{copy.save}</button>
              <button onClick={() => setShowPanel(false)} className="px-4 py-2 rounded-full border border-slate-300 dark:border-slate-700 text-xs font-black uppercase tracking-[0.12em] text-slate-700 dark:text-slate-200">{copy.close}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
