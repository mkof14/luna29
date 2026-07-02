import { LangCopy } from '../constants';

export type AdminZoneCopy = {
  actionsCopy: string;
  actionsShare: string;
  actionsPrint: string;
  actionsDownload: string;
  actionsPdf: string;
  actionsPreview: string;
  actionsClose: string;
  actionsCopied: string;
  actionsShared: string;
  periodDay: string;
  periodMonth: string;
  periodYear: string;
  clientsIn: string;
  clientsOut: string;
  revenueLabel: string;
  marketingTitle: string;
  marketingHint: string;
  marketingAdd: string;
  marketingName: string;
  marketingChannel: string;
  marketingBody: string;
  marketingSaved: string;
  invitesTitle: string;
  invitesHint: string;
  invitesUserTitle: string;
  invitesUserHint: string;
  invitesAdminTitle: string;
  invitesAdminHint: string;
  invitesEmail: string;
  invitesRole: string;
  invitesSendUser: string;
  invitesSendAdmin: string;
  invitesHistory: string;
  templatesTitle: string;
  templatesHint: string;
  templatesTrigger: string;
  templatesHero: string;
  templatesBrandNote: string;
  templatePickerLabel: string;
  templatePickerSearch: string;
  templatePickerEmpty: string;
  previewPanel: string;
  noPreview: string;
  marketingSubject: string;
  marketingSelectTemplate: string;
  marketingHero: string;
  marketingDraftPreview: string;
  marketingStored: string;
  marketingItemsLabel: string;
  marketingEmpty: string;
  marketingDelete: string;
  marketingDuplicate: string;
  marketingSend: string;
  marketingSendNeedEmail: string;
  templatesSend: string;
  templatesSendHint: string;
  mailSendDelivered: string;
  mailSendNotDelivered: string;
  mailSendFailed: string;
  mailBulkSendFailed: string;
  mailBulkPartialDelivered: string;
  invitesSiteDelivered: string;
  invitesSiteCopied: string;
  invitesAdminDelivered: string;
  invitesAdminCopied: string;
  invitesSiteFailed: string;
  invitesAdminFailed: string;
  marketingScheduleNeedFields: string;
  marketingCampaignScheduled: string;
  marketingScheduleFailed: string;
  marketingProcessResult: string;
  marketingProcessFailed: string;
  marketingExportAll: string;
  marketingExported: string;
  marketingDeleted: string;
  marketingDuplicated: string;
  marketingNameRequired: string;
  commentOverview: string;
  commentFinance: string;
  commentTemplates: string;
  logout: string;
  language: string;
};

const base = (overrides: Partial<AdminZoneCopy>): AdminZoneCopy => ({
  actionsCopy: 'Copy',
  actionsShare: 'Share',
  actionsPrint: 'Print',
  actionsDownload: 'Download',
  actionsPdf: 'PDF',
  actionsPreview: 'Preview',
  actionsClose: 'Close',
  actionsCopied: 'Copied to clipboard.',
  actionsShared: 'Share dialog opened.',
  periodDay: 'Today',
  periodMonth: 'This month',
  periodYear: 'This year',
  clientsIn: 'Clients joined',
  clientsOut: 'Clients churned',
  revenueLabel: 'Revenue signal',
  marketingTitle: 'Marketing vault',
  marketingHint: 'Store campaign copy, hero theme, and channel — then send with branded Luna29 email.',
  marketingAdd: 'Save material',
  marketingName: 'Campaign name',
  marketingChannel: 'Channel',
  marketingBody: 'Message body',
  marketingSaved: 'Marketing material saved.',
  invitesTitle: 'Invitations',
  invitesHint: 'Invite new members to the site or grant admin console access with a branded email.',
  invitesUserTitle: 'New member invitations',
  invitesUserHint: 'Send a welcome invite link — important for growing the Luna29 community.',
  invitesAdminTitle: 'Admin team invitations',
  invitesAdminHint: 'Assign a starting role before first login to the admin workspace.',
  invitesEmail: 'Email address',
  invitesRole: 'Admin role',
  invitesSendUser: 'Send site invite',
  invitesSendAdmin: 'Send admin invite',
  invitesHistory: 'Recent invites',
  templatesTitle: 'Email templates',
  templatesHint: 'Every template includes Luna logo, studio address, copyright, and themed hero art.',
  templatesTrigger: 'Trigger',
  templatesHero: 'Hero image',
  templatesBrandNote: 'Moon lockup · purple Luna script · coral accent · themed hero JPEG from /images/heroes/email/',
  templatePickerLabel: 'Choose email template',
  templatePickerSearch: 'Search templates…',
  templatePickerEmpty: 'No templates match your search.',
  previewPanel: 'Live preview',
  noPreview: 'Select a template or campaign to preview.',
  marketingSubject: 'Email subject line',
  marketingSelectTemplate: 'Base template',
  marketingHero: 'Hero illustration',
  marketingDraftPreview: 'Draft preview (branded)',
  marketingStored: 'Saved materials',
  marketingItemsLabel: 'items in vault',
  marketingEmpty: 'No materials yet — create your first campaign above.',
  marketingDelete: 'Delete',
  marketingDuplicate: 'Duplicate',
  marketingSend: 'Send email',
  marketingSendNeedEmail: 'Enter a valid recipient email.',
  templatesSend: 'Send live email',
  templatesSendHint: 'Delivers branded HTML via Resend — Luna logo, themed hero, and CTA button.',
  mailSendDelivered: 'Branded email sent to {email}.',
  mailSendNotDelivered: 'Email not delivered — configure RESEND_API_KEY in production for live sending.',
  mailSendFailed: 'Send failed.',
  mailBulkSendFailed: 'Bulk send failed.',
  mailBulkPartialDelivered: '{delivered}/{total} delivered. {hint}',
  invitesSiteDelivered: 'Site invite sent to {email}.',
  invitesSiteCopied: 'Invite link copied for {email} (configure Resend for delivery).',
  invitesAdminDelivered: 'Admin invite sent to {email}.',
  invitesAdminCopied: 'Admin link copied for {email} (configure Resend for delivery).',
  invitesSiteFailed: 'Site invite failed.',
  invitesAdminFailed: 'Admin invite failed.',
  marketingScheduleNeedFields: 'Subject, body, and at least one recipient are required.',
  marketingCampaignScheduled: 'Campaign scheduled.',
  marketingScheduleFailed: 'Schedule failed.',
  marketingProcessResult: 'Processed {processed} · sent {sent} · failed {failed}',
  marketingProcessFailed: 'Process failed.',
  marketingExportAll: 'Export vault JSON',
  marketingExported: 'Vault exported.',
  marketingDeleted: 'Material removed.',
  marketingDuplicated: 'Material duplicated.',
  marketingNameRequired: 'Enter a campaign name.',
  commentOverview: 'Snapshot of members, revenue signals, and production health.',
  commentFinance: 'Track joins, churn, and money indicators by day, month, and year.',
  commentTemplates: 'Corporate HTML ready for Resend — edit copy per language before sending.',
  logout: 'Logout',
  language: 'Language',
  ...overrides,
});

export const ADMIN_ZONE_COPY: LangCopy<AdminZoneCopy> = {
  en: base({}),
  ru: base({
    actionsCopy: 'Копировать', actionsShare: 'Поделиться', actionsPrint: 'Печать', actionsDownload: 'Скачать', actionsPdf: 'PDF',
    actionsPreview: 'Превью', actionsClose: 'Закрыть', actionsCopied: 'Скопировано.', actionsShared: 'Диалог «Поделиться».',
    periodDay: 'Сегодня', periodMonth: 'Месяц', periodYear: 'Год',
    clientsIn: 'Пришло клиентов', clientsOut: 'Ушло клиентов', revenueLabel: 'Доход',
    marketingTitle: 'Маркетинговое хранилище', marketingHint: 'Храните тексты кампаний и отправляйте с брендингом Luna29.',
    marketingAdd: 'Сохранить материал', marketingName: 'Название кампании', marketingChannel: 'Канал', marketingBody: 'Текст сообщения',
    invitesTitle: 'Приглашения', invitesHint: 'Приглашайте новых участников и администраторов с фирменным письмом.',
    invitesUserTitle: 'Приглашения новых пользователей', invitesUserHint: 'Важный блок — отправка welcome-ссылки новым участникам.',
    invitesAdminTitle: 'Приглашения в админку', invitesAdminHint: 'Назначьте роль до первого входа в консоль.',
    invitesEmail: 'Email', invitesRole: 'Роль', invitesSendUser: 'Отправить на сайт', invitesSendAdmin: 'Отправить в админку',
    templatesTitle: 'Шаблоны писем', templatesHint: 'Лого, адрес, копирайт и hero-картинка по теме каждого письма.',
    templatesBrandNote: 'Лого · адрес · © Luna29 · hero JPEG из /images/heroes/email/ по теме письма',
    templatePickerLabel: 'Выбор шаблона письма',
    templatePickerSearch: 'Поиск шаблонов…',
    templatePickerEmpty: 'Шаблоны не найдены.',
    marketingSubject: 'Тема письма',
    marketingSelectTemplate: 'Базовый шаблон',
    marketingHero: 'Hero-иллюстрация',
    marketingDraftPreview: 'Превью черновика',
    marketingStored: 'Сохранённые материалы',
    marketingItemsLabel: 'материалов',
    marketingEmpty: 'Пока пусто — создайте первую кампанию выше.',
    marketingDelete: 'Удалить',
    marketingDuplicate: 'Дублировать',
    marketingSend: 'Отправить',
    marketingSendNeedEmail: 'Укажите корректный email получателя.',
    templatesSend: 'Отправить письмо',
    templatesSendHint: 'Отправка живого HTML через Resend — лого Luna, hero-картинка и кнопка CTA.',
    mailSendDelivered: 'Письмо отправлено на {email}.',
    mailSendNotDelivered: 'Письмо не доставлено — добавьте RESEND_API_KEY в production для живой отправки.',
    mailSendFailed: 'Не удалось отправить.',
    mailBulkSendFailed: 'Массовая отправка не удалась.',
    mailBulkPartialDelivered: '{delivered}/{total} доставлено. {hint}',
    invitesSiteDelivered: 'Приглашение на сайт отправлено на {email}.',
    invitesSiteCopied: 'Ссылка скопирована для {email} (настройте Resend для доставки).',
    invitesAdminDelivered: 'Админ-приглашение отправлено на {email}.',
    invitesAdminCopied: 'Админ-ссылка скопирована для {email} (настройте Resend для доставки).',
    invitesSiteFailed: 'Не удалось отправить приглашение на сайт.',
    invitesAdminFailed: 'Не удалось отправить админ-приглашение.',
    marketingScheduleNeedFields: 'Нужны тема, текст и хотя бы один получатель.',
    marketingCampaignScheduled: 'Кампания запланирована.',
    marketingScheduleFailed: 'Не удалось запланировать.',
    marketingProcessResult: 'Обработано {processed} · отправлено {sent} · ошибок {failed}',
    marketingProcessFailed: 'Не удалось обработать очередь.',
    marketingExportAll: 'Экспорт JSON',
    marketingExported: 'Хранилище экспортировано.',
    marketingDeleted: 'Материал удалён.',
    marketingDuplicated: 'Копия создана.',
    marketingNameRequired: 'Укажите название кампании.',
    previewPanel: 'Живое превью', noPreview: 'Выберите шаблон для превью.',
    commentOverview: 'Сводка участников, дохода и состояния production.', commentFinance: 'Приход/уход и деньги по дням, месяцам, годам.',
    language: 'Язык', logout: 'Выход',
  }),
  uk: base({ actionsCopy: 'Копіювати', actionsShare: 'Поділитися', invitesUserTitle: 'Запрошення нових користувачів', language: 'Мова', marketingTitle: 'Маркетингове сховище', templatesTitle: 'Шаблони листів' }),
  es: base({ actionsCopy: 'Copiar', actionsShare: 'Compartir', invitesUserTitle: 'Invitaciones a nuevas usuarias', language: 'Idioma', marketingTitle: 'Almacén de marketing', templatesTitle: 'Plantillas de email' }),
  fr: base({ actionsCopy: 'Copier', actionsShare: 'Partager', invitesUserTitle: 'Invitations nouvelles membres', language: 'Langue', marketingTitle: 'Vault marketing', templatesTitle: 'Modeles email' }),
  de: base({ actionsCopy: 'Kopieren', actionsShare: 'Teilen', invitesUserTitle: 'Einladungen neue Mitglieder', language: 'Sprache', marketingTitle: 'Marketing-Tresor', templatesTitle: 'E-Mail-Vorlagen' }),
  zh: base({ actionsCopy: '复制', actionsShare: '分享', invitesUserTitle: '新用户邀请', language: '语言', marketingTitle: '营销素材库', templatesTitle: '邮件模板' }),
  ja: base({ actionsCopy: 'コピー', actionsShare: '共有', invitesUserTitle: '新規ユーザー招待', language: '言語', marketingTitle: 'マーケティング保管庫', templatesTitle: 'メールテンプレート' }),
  pt: base({ actionsCopy: 'Copiar', actionsShare: 'Compartilhar', invitesUserTitle: 'Convites novas usuarias', language: 'Idioma', marketingTitle: 'Cofre de marketing', templatesTitle: 'Modelos de email' }),
  ar: base({ actionsCopy: 'نسخ', actionsShare: 'مشاركة', invitesUserTitle: 'دعوات أعضاء جدد', language: 'اللغة', marketingTitle: 'مخزن التسويق', templatesTitle: 'قوالب البريد' }),
  he: base({ actionsCopy: 'העתק', actionsShare: 'שיתוף', invitesUserTitle: 'הזמנות משתמשות חדשות', language: 'שפה', marketingTitle: 'מאגר שיווק', templatesTitle: 'תבניות דוא״ל' }),
};
