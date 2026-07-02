import { Language, LangCopy, getLang } from '../constants';

type Channel = 'Email' | 'Push' | 'Telegram' | 'Instagram';
type CampaignStatus = 'Draft' | 'Approved' | 'Scheduled';
type ServiceStatus = 'Healthy' | 'Degraded' | 'Down';

const channelLabelByLang: LangCopy< Record<Channel, string>> = {
  en: { Email: 'Email', Push: 'Push', Telegram: 'Telegram', Instagram: 'Instagram' },
  ru: { Email: 'Email', Push: 'Push', Telegram: 'Telegram', Instagram: 'Instagram' },
  uk: { Email: 'Email', Push: 'Push', Telegram: 'Telegram', Instagram: 'Instagram' },
  es: { Email: 'Correo', Push: 'Push', Telegram: 'Telegram', Instagram: 'Instagram' },
  fr: { Email: 'Email', Push: 'Push', Telegram: 'Telegram', Instagram: 'Instagram' },
  de: { Email: 'E-Mail', Push: 'Push', Telegram: 'Telegram', Instagram: 'Instagram' },
  zh: { Email: '邮件', Push: '推送', Telegram: 'Telegram', Instagram: 'Instagram' },
  ja: { Email: 'メール', Push: 'プッシュ', Telegram: 'Telegram', Instagram: 'Instagram' },
  pt: { Email: 'Email', Push: 'Push', Telegram: 'Telegram', Instagram: 'Instagram' },
  ar: { Email: 'Email', Push: 'Push', Telegram: 'Telegram', Instagram: 'Instagram' },
  he: { Email: 'Email', Push: 'Push', Telegram: 'Telegram', Instagram: 'Instagram' },};

const campaignStatusByLang: LangCopy< Record<CampaignStatus, string>> = {
  en: { Draft: 'Draft', Approved: 'Approved', Scheduled: 'Scheduled' },
  ru: { Draft: 'Черновик', Approved: 'Одобрено', Scheduled: 'Запланировано' },
  uk: { Draft: 'Чернетка', Approved: 'Схвалено', Scheduled: 'Заплановано' },
  es: { Draft: 'Borrador', Approved: 'Aprobado', Scheduled: 'Programado' },
  fr: { Draft: 'Brouillon', Approved: 'Approuve', Scheduled: 'Planifie' },
  de: { Draft: 'Entwurf', Approved: 'Freigegeben', Scheduled: 'Geplant' },
  zh: { Draft: '草稿', Approved: '已批准', Scheduled: '已排期' },
  ja: { Draft: '下書き', Approved: '承認済み', Scheduled: '予定済み' },
  pt: { Draft: 'Rascunho', Approved: 'Aprovado', Scheduled: 'Agendado' },
  ar: { Draft: 'مسودة', Approved: 'معتمد', Scheduled: 'مجدول' },
  he: { Draft: 'טיוטה', Approved: 'מאושר', Scheduled: 'מתוזמן' },};

const statusLabelByLang: LangCopy< Record<ServiceStatus, string>> = {
  en: { Healthy: 'Healthy', Degraded: 'Degraded', Down: 'Down' },
  ru: { Healthy: 'Стабильно', Degraded: 'Снижение', Down: 'Недоступно' },
  uk: { Healthy: 'Стабільно', Degraded: 'Погіршено', Down: 'Недоступно' },
  es: { Healthy: 'Estable', Degraded: 'Degradado', Down: 'Caido' },
  fr: { Healthy: 'Stable', Degraded: 'Degrade', Down: 'Indisponible' },
  de: { Healthy: 'Stabil', Degraded: 'Beeintraechtigt', Down: 'Ausfall' },
  zh: { Healthy: '正常', Degraded: '降级', Down: '中断' },
  ja: { Healthy: '正常', Degraded: '低下', Down: '停止' },
  pt: { Healthy: 'Estavel', Degraded: 'Degradado', Down: 'Indisponivel' },
  ar: { Healthy: 'مستقر', Degraded: 'متدهور', Down: 'غير متاح' },
  he: { Healthy: 'יציב', Degraded: 'מופחת', Down: 'לא זמין' },};

const copyByLang: LangCopy< {
  dashboard: string;
  logout: string;
  noSession: string;
  role: string;
  campaignPlaceholder: string;
  campaignBodyPlaceholder: string;
  templatePlaceholder: string;
  templateBodyPlaceholder: string;
  triggerPlaceholder: string;
  subjectPlaceholder: string;
  preheaderPlaceholder: string;
  add: string;
  create: string;
  autoTranslating: string;
  trigger: string;
  updatedBy: string;
  onDate: string;
  preview: string;
  copyAction: string;
  shareAction: string;
  pdfAction: string;
  downloadAction: string;
  printAction: string;
  feedbackCopied: string;
  feedbackShared: string;
  feedbackDownloaded: string;
  feedbackPrint: string;
  feedbackError: string;
  closePreview: string;
  channel: string;
  status: string;
  subject: string;
  preheader: string;
}> = {
  en: {
    dashboard: 'Home', logout: 'Logout', noSession: 'No session', role: 'Role',
    campaignPlaceholder: 'New campaign name', campaignBodyPlaceholder: 'Campaign message/body',
    templatePlaceholder: 'Template title', templateBodyPlaceholder: 'Template body',
    triggerPlaceholder: 'Trigger (e.g. New signup)', subjectPlaceholder: 'Email subject', preheaderPlaceholder: 'Email preheader',
    add: 'Add', create: 'Create', autoTranslating: 'Auto-translating...', trigger: 'Trigger', updatedBy: 'Updated by', onDate: 'on',
    preview: 'Preview', copyAction: 'Copy', shareAction: 'Share', pdfAction: 'PDF', downloadAction: 'Download', printAction: 'Print',
    feedbackCopied: 'Copied to clipboard.', feedbackShared: 'Shared successfully.', feedbackDownloaded: 'File downloaded.', feedbackPrint: 'Print window opened.', feedbackError: 'Action failed on this browser.',
    closePreview: 'Close', channel: 'Channel', status: 'Status', subject: 'Subject', preheader: 'Preheader'
  },
  ru: {
    dashboard: 'Главная', logout: 'Выйти', noSession: 'Нет сессии', role: 'Роль',
    campaignPlaceholder: 'Название кампании', campaignBodyPlaceholder: 'Текст кампании',
    templatePlaceholder: 'Название шаблона', templateBodyPlaceholder: 'Текст шаблона',
    triggerPlaceholder: 'Триггер (например New signup)', subjectPlaceholder: 'Тема письма', preheaderPlaceholder: 'Преheader письма',
    add: 'Добавить', create: 'Создать', autoTranslating: 'Автоперевод...', trigger: 'Триггер', updatedBy: 'Обновил', onDate: 'дата',
    preview: 'Просмотр', copyAction: 'Copy', shareAction: 'Share', pdfAction: 'PDF', downloadAction: 'Download', printAction: 'Print',
    feedbackCopied: 'Скопировано.', feedbackShared: 'Отправлено.', feedbackDownloaded: 'Файл скачан.', feedbackPrint: 'Окно печати открыто.', feedbackError: 'Действие недоступно в этом браузере.',
    closePreview: 'Закрыть', channel: 'Канал', status: 'Статус', subject: 'Тема', preheader: 'Преheader'
  },
  uk: {
    dashboard: 'Головна', logout: 'Вийти', noSession: 'Немає сесії', role: 'Роль',
    campaignPlaceholder: 'Назва кампанії', campaignBodyPlaceholder: 'Текст кампанії',
    templatePlaceholder: 'Назва шаблону', templateBodyPlaceholder: 'Текст шаблону',
    triggerPlaceholder: 'Тригер (наприклад New signup)', subjectPlaceholder: 'Тема листа', preheaderPlaceholder: 'Преheader листа',
    add: 'Додати', create: 'Створити', autoTranslating: 'Автопереклад...', trigger: 'Тригер', updatedBy: 'Оновив', onDate: 'дата',
    preview: 'Перегляд', copyAction: 'Copy', shareAction: 'Share', pdfAction: 'PDF', downloadAction: 'Download', printAction: 'Print',
    feedbackCopied: 'Скопійовано.', feedbackShared: 'Відправлено.', feedbackDownloaded: 'Файл завантажено.', feedbackPrint: 'Вікно друку відкрито.', feedbackError: 'Дія недоступна у цьому браузері.',
    closePreview: 'Закрити', channel: 'Канал', status: 'Статус', subject: 'Тема', preheader: 'Преheader'
  },
  es: {
    dashboard: 'Inicio', logout: 'Cerrar sesion', noSession: 'Sin sesion', role: 'Rol',
    campaignPlaceholder: 'Nombre de campana', campaignBodyPlaceholder: 'Texto de campana',
    templatePlaceholder: 'Titulo de plantilla', templateBodyPlaceholder: 'Texto de plantilla',
    triggerPlaceholder: 'Disparador', subjectPlaceholder: 'Asunto', preheaderPlaceholder: 'Preheader',
    add: 'Anadir', create: 'Crear', autoTranslating: 'Traduccion automatica...', trigger: 'Disparador', updatedBy: 'Actualizado por', onDate: 'el',
    preview: 'Preview', copyAction: 'Copy', shareAction: 'Share', pdfAction: 'PDF', downloadAction: 'Download', printAction: 'Print',
    feedbackCopied: 'Copiado.', feedbackShared: 'Compartido.', feedbackDownloaded: 'Archivo descargado.', feedbackPrint: 'Ventana de impresion abierta.', feedbackError: 'Accion no disponible.',
    closePreview: 'Cerrar', channel: 'Canal', status: 'Estado', subject: 'Asunto', preheader: 'Preheader'
  },
  fr: {
    dashboard: 'Accueil', logout: 'Deconnexion', noSession: 'Aucune session', role: 'Role',
    campaignPlaceholder: 'Nom de campagne', campaignBodyPlaceholder: 'Texte de campagne',
    templatePlaceholder: 'Titre du modele', templateBodyPlaceholder: 'Corps du modele',
    triggerPlaceholder: 'Declencheur', subjectPlaceholder: 'Sujet', preheaderPlaceholder: 'Preheader',
    add: 'Ajouter', create: 'Creer', autoTranslating: 'Traduction automatique...', trigger: 'Declencheur', updatedBy: 'Mis a jour par', onDate: 'le',
    preview: 'Preview', copyAction: 'Copy', shareAction: 'Share', pdfAction: 'PDF', downloadAction: 'Download', printAction: 'Print',
    feedbackCopied: 'Copie.', feedbackShared: 'Partage.', feedbackDownloaded: 'Fichier telecharge.', feedbackPrint: 'Fenetre impression ouverte.', feedbackError: 'Action indisponible.',
    closePreview: 'Fermer', channel: 'Canal', status: 'Statut', subject: 'Sujet', preheader: 'Preheader'
  },
  de: {
    dashboard: 'Start', logout: 'Abmelden', noSession: 'Keine Sitzung', role: 'Rolle',
    campaignPlaceholder: 'Kampagnenname', campaignBodyPlaceholder: 'Kampagnentext',
    templatePlaceholder: 'Vorlagentitel', templateBodyPlaceholder: 'Vorlageninhalt',
    triggerPlaceholder: 'Ausloeser', subjectPlaceholder: 'Betreff', preheaderPlaceholder: 'Preheader',
    add: 'Hinzufugen', create: 'Erstellen', autoTranslating: 'Automatische Ubersetzung...', trigger: 'Ausloeser', updatedBy: 'Aktualisiert von', onDate: 'am',
    preview: 'Preview', copyAction: 'Copy', shareAction: 'Share', pdfAction: 'PDF', downloadAction: 'Download', printAction: 'Print',
    feedbackCopied: 'Kopiert.', feedbackShared: 'Geteilt.', feedbackDownloaded: 'Datei heruntergeladen.', feedbackPrint: 'Druckfenster geoffnet.', feedbackError: 'Aktion nicht verfugbar.',
    closePreview: 'Schliessen', channel: 'Kanal', status: 'Status', subject: 'Betreff', preheader: 'Preheader'
  },
  zh: {
    dashboard: '首页', logout: '退出', noSession: '无会话', role: '角色',
    campaignPlaceholder: '活动名称', campaignBodyPlaceholder: '活动内容',
    templatePlaceholder: '模板标题', templateBodyPlaceholder: '模板正文',
    triggerPlaceholder: '触发条件', subjectPlaceholder: '邮件主题', preheaderPlaceholder: '预览摘要',
    add: '添加', create: '创建', autoTranslating: '自动翻译中...', trigger: '触发', updatedBy: '更新人', onDate: '日期',
    preview: '预览', copyAction: 'Copy', shareAction: 'Share', pdfAction: 'PDF', downloadAction: 'Download', printAction: 'Print',
    feedbackCopied: '已复制。', feedbackShared: '已分享。', feedbackDownloaded: '已下载文件。', feedbackPrint: '已打开打印窗口。', feedbackError: '当前浏览器不支持此操作。',
    closePreview: '关闭', channel: '渠道', status: '状态', subject: '主题', preheader: '预览摘要'
  },
  ja: {
    dashboard: 'ホーム', logout: 'ログアウト', noSession: 'セッションなし', role: 'ロール',
    campaignPlaceholder: 'キャンペーン名', campaignBodyPlaceholder: 'キャンペーン本文',
    templatePlaceholder: 'テンプレート名', templateBodyPlaceholder: 'テンプレート本文',
    triggerPlaceholder: 'トリガー', subjectPlaceholder: '件名', preheaderPlaceholder: 'プレヘッダー',
    add: '追加', create: '作成', autoTranslating: '自動翻訳中...', trigger: 'トリガー', updatedBy: '更新者', onDate: '日付',
    preview: 'プレビュー', copyAction: 'Copy', shareAction: 'Share', pdfAction: 'PDF', downloadAction: 'Download', printAction: 'Print',
    feedbackCopied: 'コピーしました。', feedbackShared: '共有しました。', feedbackDownloaded: 'ダウンロードしました。', feedbackPrint: '印刷画面を開きました。', feedbackError: 'このブラウザでは利用できません。',
    closePreview: '閉じる', channel: 'チャネル', status: 'ステータス', subject: '件名', preheader: 'プレヘッダー'
  },
  pt: {
    dashboard: 'Painel', logout: 'Sair', noSession: 'Sem sessao', role: 'Funcao',
    campaignPlaceholder: 'Nome da campanha', campaignBodyPlaceholder: 'Texto da campanha',
    templatePlaceholder: 'Titulo do template', templateBodyPlaceholder: 'Corpo do template',
    triggerPlaceholder: 'Gatilho', subjectPlaceholder: 'Assunto', preheaderPlaceholder: 'Preheader',
    add: 'Adicionar', create: 'Criar', autoTranslating: 'Traducao automatica...', trigger: 'Gatilho', updatedBy: 'Atualizado por', onDate: 'em',
    preview: 'Preview', copyAction: 'Copy', shareAction: 'Share', pdfAction: 'PDF', downloadAction: 'Download', printAction: 'Print',
    feedbackCopied: 'Copiado.', feedbackShared: 'Compartilhado.', feedbackDownloaded: 'Arquivo baixado.', feedbackPrint: 'Janela de impressao aberta.', feedbackError: 'Acao indisponivel.',
    closePreview: 'Fechar', channel: 'Canal', status: 'Status', subject: 'Assunto', preheader: 'Preheader'
  },
  ar: {
    dashboard: 'الرئيسية', logout: 'تسجيل الخروج', noSession: 'لا توجد جلسة', role: 'الدور',
    campaignPlaceholder: 'اسم الحملة الجديدة', campaignBodyPlaceholder: 'نص/محتوى الحملة',
    templatePlaceholder: 'عنوان القالب', templateBodyPlaceholder: 'نص القالب',
    triggerPlaceholder: 'المُحفّز (مثلاً: تسجيل جديد)', subjectPlaceholder: 'موضوع البريد', preheaderPlaceholder: 'النص التمهيدي للبريد',
    add: 'إضافة', create: 'إنشاء', autoTranslating: 'ترجمة تلقائية...', trigger: 'المُحفّز', updatedBy: 'حدّثه', onDate: 'في',
    preview: 'معاينة', copyAction: 'Copy', shareAction: 'Share', pdfAction: 'PDF', downloadAction: 'Download', printAction: 'Print',
    feedbackCopied: 'تم النسخ.', feedbackShared: 'تمت المشاركة.', feedbackDownloaded: 'تم تنزيل الملف.', feedbackPrint: 'فُتحت نافذة الطباعة.', feedbackError: 'الإجراء غير متاح في هذا المتصفح.',
    closePreview: 'إغلاق', channel: 'القناة', status: 'الحالة', subject: 'الموضوع', preheader: 'النص التمهيدي'
  },
  he: {
    dashboard: 'בית', logout: 'יציאה', noSession: 'אין סשן', role: 'תפקיד',
    campaignPlaceholder: 'שם קמפיין חדש', campaignBodyPlaceholder: 'טקסט/גוף הקמפיין',
    templatePlaceholder: 'כותרת תבנית', templateBodyPlaceholder: 'גוף התבנית',
    triggerPlaceholder: 'טריגר (למשל הרשמה חדשה)', subjectPlaceholder: 'נושא המייל', preheaderPlaceholder: 'Preheader למייל',
    add: 'הוספה', create: 'יצירה', autoTranslating: 'תרגום אוטומטי...', trigger: 'טריגר', updatedBy: 'עודכן על ידי', onDate: 'ב',
    preview: 'תצוגה מקדימה', copyAction: 'Copy', shareAction: 'Share', pdfAction: 'PDF', downloadAction: 'Download', printAction: 'Print',
    feedbackCopied: 'הועתק.', feedbackShared: 'שותף.', feedbackDownloaded: 'הקובץ הורד.', feedbackPrint: 'חלון ההדפסה נפתח.', feedbackError: 'הפעולה לא זמינה בדפדפן זה.',
    closePreview: 'סגירה', channel: 'ערוץ', status: 'סטטוס', subject: 'נושא', preheader: 'Preheader'
  },};


export interface AdminPanelLabels {
  channelLabels: Record<Channel, string>;
  campaignStatusLabels: Record<CampaignStatus, string>;
  statusLabels: Record<ServiceStatus, string>;
  copy: typeof copyByLang.en;
}

export function getAdminPanelLabels(lang: Language): AdminPanelLabels {
  return {
    channelLabels: getLang(channelLabelByLang, lang) || channelLabelByLang.en,
    campaignStatusLabels: getLang(campaignStatusByLang, lang) || campaignStatusByLang.en,
    statusLabels: getLang(statusLabelByLang, lang) || statusLabelByLang.en,
    copy: getLang(copyByLang, lang) || copyByLang.en,
  };
}
