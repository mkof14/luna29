import { LangCopy } from '../constants';

export type AdminWorkspaceTab =
  | 'overview'
  | 'services'
  | 'integrations'
  | 'analytics'
  | 'finance'
  | 'mail'
  | 'campaigns'
  | 'templates'
  | 'team'
  | 'contacts'
  | 'audit'
  | 'settings';

export type AdminNavGroup = 'main' | 'platform' | 'content' | 'people' | 'reports';

export type AdminWorkspaceCopy = {
  brandTitle: string;
  brandSubtitle: string;
  navMain: string;
  navPlatform: string;
  navContent: string;
  navPeople: string;
  navReports: string;
  tabOverview: string;
  tabServices: string;
  tabIntegrations: string;
  tabAnalytics: string;
  tabFinance: string;
  tabMail: string;
  tabCampaigns: string;
  tabTemplates: string;
  tabTeam: string;
  tabContacts: string;
  tabAudit: string;
  tabSettings: string;
  overviewTitle: string;
  overviewHint: string;
  productionHealth: string;
  membersTotal: string;
  membersNew7d: string;
  contactsTotal: string;
  contacts24h: string;
  refreshOps: string;
  runHealthProbe: string;
  openSite: string;
  exportAudit: string;
  integrationsTitle: string;
  integrationsHint: string;
  postgres: string;
  rateLimit: string;
  resend: string;
  gemini: string;
  billing: string;
  testEmail: string;
  teamTitle: string;
  teamHint: string;
  assignRole: string;
  inviteAdmin: string;
  contactsTitle: string;
  contactsHint: string;
  servicesTitle: string;
  servicesHint: string;
  settingsTitle: string;
  settingsHint: string;
  finTitle: string;
  finHint: string;
  finMrr: string;
  finArr: string;
  finSubscribers: string;
  finChurn: string;
  finLtv: string;
  finCac: string;
  finConversion: string;
  finTrialPaid: string;
  finLtvCac: string;
  finNetMonthly: string;
  finMonthly: string;
  finYearly: string;
  finActivePlans: string;
  finMonthlyChurn: string;
  finSignupConversion: string;
  finTrialConversion: string;
  finUnitEconomics: string;
  finAfterChurn: string;
  finTrend: string;
  finNoHistory: string;
  exportFinance: string;
  mailTitle: string;
  mailHint: string;
  mailSingle: string;
  mailBulk: string;
  mailSiteInvite: string;
  mailSendOne: string;
  mailSendBulk: string;
  mailInviteSend: string;
  themeLight: string;
  themeDark: string;
  backToSite: string;
  loading: string;
  ok: string;
  warn: string;
  fail: string;
  configured: string;
  missing: string;
  lastUpdated: string;
};

const base = (overrides: Partial<AdminWorkspaceCopy>): AdminWorkspaceCopy => ({
  brandTitle: 'Luna29',
  brandSubtitle: 'Admin console',
  navMain: 'Main',
  navPlatform: 'Platform',
  navContent: 'Content',
  navPeople: 'People',
  navReports: 'Reports',
  tabOverview: 'Overview',
  tabServices: 'Services',
  tabIntegrations: 'Integrations',
  tabAnalytics: 'Analytics',
  tabFinance: 'Finance',
  tabMail: 'Mail & invites',
  tabCampaigns: 'Campaigns',
  tabTemplates: 'Templates',
  tabTeam: 'Team',
  tabContacts: 'Contacts',
  tabAudit: 'Audit & metrics',
  tabSettings: 'Settings',
  overviewTitle: 'Operations overview',
  overviewHint: 'Live production signals from the Luna29 API and member database.',
  productionHealth: 'Production health',
  membersTotal: 'Registered members',
  membersNew7d: 'New (7 days)',
  contactsTotal: 'Contact messages',
  contacts24h: 'Messages (24h)',
  refreshOps: 'Refresh',
  runHealthProbe: 'Run health probe',
  openSite: 'Open site',
  exportAudit: 'Export audit CSV',
  integrationsTitle: 'Infrastructure',
  integrationsHint: 'Connected services for email, persistence, rate limits, and auth.',
  postgres: 'Postgres (Neon)',
  rateLimit: 'Rate limits',
  resend: 'Resend email',
  gemini: 'Gemini AI',
  billing: 'Stripe billing',
  testEmail: 'Send test email',
  teamTitle: 'Team & access',
  teamHint: 'Member accounts, admin roles, and invite links stored on the server.',
  assignRole: 'Assign role',
  inviteAdmin: 'Send admin invite',
  contactsTitle: 'Contact inbox',
  contactsHint: 'Support messages submitted through the Luna29 contact form.',
  servicesTitle: 'Service health',
  servicesHint: 'Monitor and annotate internal Luna29 service status.',
  settingsTitle: 'Workspace settings',
  settingsHint: 'Appearance, shortcuts, and admin preferences.',
  finTitle: 'Financial monitoring',
  finHint: 'Revenue, subscribers, churn, and unit economics for Luna29.',
  finMrr: 'MRR',
  finArr: 'ARR',
  finSubscribers: 'Active subscribers',
  finChurn: 'Churn rate',
  finLtv: 'LTV',
  finCac: 'CAC',
  finConversion: 'Conversion',
  finTrialPaid: 'Trial → paid',
  finLtvCac: 'LTV / CAC',
  finNetMonthly: 'Net MRR est.',
  finMonthly: 'Monthly recurring',
  finYearly: 'Annual run rate',
  finActivePlans: 'Paid plans',
  finMonthlyChurn: 'Monthly churn',
  finSignupConversion: 'Signup conversion',
  finTrialConversion: 'Trial conversion',
  finUnitEconomics: 'Unit economics',
  finAfterChurn: 'After churn adjustment',
  finTrend: 'Revenue trend',
  finNoHistory: 'Run a health check to populate history.',
  exportFinance: 'Export finance CSV',
  mailTitle: 'Mail & invitations',
  mailHint: 'Send branded Luna29 emails to one person, many at once, or invite someone to the site.',
  mailSingle: 'Send to one recipient',
  mailBulk: 'Bulk send (one email per line)',
  mailSiteInvite: 'Site invitation with branded email',
  mailSendOne: 'Send email',
  mailSendBulk: 'Send bulk',
  mailInviteSend: 'Send site invite',
  themeLight: 'Light theme',
  themeDark: 'Dark theme',
  backToSite: 'Back to site',
  loading: 'Loading…',
  ok: 'OK',
  warn: 'Warn',
  fail: 'Fail',
  configured: 'Configured',
  missing: 'Missing',
  lastUpdated: 'Updated',
  ...overrides,
});

export const ADMIN_WORKSPACE_COPY: LangCopy<AdminWorkspaceCopy> = {
  en: base({}),
  ru: base({
    brandTitle: 'Luna29',
    brandSubtitle: 'Админ-панель',
    navMain: 'Главное',
    navPlatform: 'Платформа',
    navContent: 'Контент',
    navPeople: 'Люди',
    navReports: 'Отчёты',
    tabOverview: 'Обзор',
    tabServices: 'Сервисы',
    tabIntegrations: 'Интеграции',
    tabAnalytics: 'Аналитика',
    tabFinance: 'Финансы',
    tabMail: 'Почта и приглашения',
    tabCampaigns: 'Кампании',
    tabTemplates: 'Шаблоны',
    tabTeam: 'Команда',
    tabContacts: 'Контакты',
    tabAudit: 'Аудит',
    tabSettings: 'Настройки',
    overviewTitle: 'Операционный обзор',
    overviewHint: 'Живые сигналы production из API Luna29 и базы участников.',
    contactsTitle: 'Входящие сообщения',
    contactsHint: 'Обращения через форму контактов Luna29.',
    servicesTitle: 'Состояние сервисов',
    servicesHint: 'Мониторинг внутренних сервисов Luna29.',
    settingsTitle: 'Настройки',
    settingsHint: 'Тема, быстрые ссылки и предпочтения.',
    themeLight: 'Светлая тема',
    themeDark: 'Тёмная тема',
    backToSite: 'На сайт',
    teamTitle: 'Команда и доступы',
    teamHint: 'Аккаунты, роли и invite-ссылки на сервере.',
    configured: 'Настроено',
    missing: 'Не настроено',
  }),
  uk: base({ tabOverview: 'Огляд', tabServices: 'Сервіси', tabIntegrations: 'Інтеграції', tabAnalytics: 'Аналітика', tabCampaigns: 'Кампанії', tabTemplates: 'Шаблони', tabTeam: 'Команда', tabContacts: 'Контакти', tabAudit: 'Аудит', tabSettings: 'Налаштування', brandTitle: 'Luna29' }),
  es: base({ tabOverview: 'Resumen', tabServices: 'Servicios', tabIntegrations: 'Integraciones', tabAnalytics: 'Analitica', tabCampaigns: 'Campanas', tabTemplates: 'Plantillas', tabTeam: 'Equipo', tabContacts: 'Contactos', tabAudit: 'Auditoria', tabSettings: 'Ajustes', brandTitle: 'Luna29' }),
  fr: base({ tabOverview: 'Apercu', tabServices: 'Services', tabIntegrations: 'Integrations', tabAnalytics: 'Analytique', tabCampaigns: 'Campagnes', tabTemplates: 'Modeles', tabTeam: 'Equipe', tabContacts: 'Contacts', tabAudit: 'Audit', tabSettings: 'Parametres', brandTitle: 'Luna29' }),
  de: base({ tabOverview: 'Ueberblick', tabServices: 'Dienste', tabIntegrations: 'Integrationen', tabAnalytics: 'Analytik', tabCampaigns: 'Kampagnen', tabTemplates: 'Vorlagen', tabTeam: 'Team', tabContacts: 'Kontakte', tabAudit: 'Audit', tabSettings: 'Einstellungen', brandTitle: 'Luna29' }),
  zh: base({ tabOverview: '概览', tabServices: '服务', tabIntegrations: '集成', tabAnalytics: '分析', tabCampaigns: '活动', tabTemplates: '模板', tabTeam: '团队', tabContacts: '联系', tabAudit: '审计', tabSettings: '设置', brandTitle: 'Luna29' }),
  ja: base({ tabOverview: '概要', tabServices: 'サービス', tabIntegrations: '連携', tabAnalytics: '分析', tabCampaigns: 'キャンペーン', tabTemplates: 'テンプレート', tabTeam: 'チーム', tabContacts: 'お問い合わせ', tabAudit: '監査', tabSettings: '設定', brandTitle: 'Luna29' }),
  pt: base({ tabOverview: 'Visao geral', tabServices: 'Servicos', tabIntegrations: 'Integracoes', tabAnalytics: 'Analitica', tabCampaigns: 'Campanhas', tabTemplates: 'Modelos', tabTeam: 'Equipe', tabContacts: 'Contatos', tabAudit: 'Auditoria', tabSettings: 'Configuracoes', brandTitle: 'Luna29' }),
  ar: base({ tabOverview: 'نظرة عامة', tabServices: 'الخدمات', tabIntegrations: 'التكاملات', tabAnalytics: 'التحليلات', tabCampaigns: 'الحملات', tabTemplates: 'القوالب', tabTeam: 'الفريق', tabContacts: 'الرسائل', tabAudit: 'التدقيق', tabSettings: 'الإعدادات', brandTitle: 'Luna29' }),
  he: base({ tabOverview: 'סקירה', tabServices: 'שירותים', tabIntegrations: 'אינטגרציות', tabAnalytics: 'אנליטיקה', tabCampaigns: 'קמפיינים', tabTemplates: 'תבניות', tabTeam: 'צוות', tabContacts: 'פניות', tabAudit: 'ביקורת', tabSettings: 'הגדרות', brandTitle: 'Luna29' }),
};

export const ADMIN_NAV: Array<{ tab: AdminWorkspaceTab; group: AdminNavGroup }> = [
  { tab: 'overview', group: 'main' },
  { tab: 'services', group: 'main' },
  { tab: 'finance', group: 'main' },
  { tab: 'integrations', group: 'platform' },
  { tab: 'analytics', group: 'platform' },
  { tab: 'mail', group: 'platform' },
  { tab: 'campaigns', group: 'content' },
  { tab: 'templates', group: 'content' },
  { tab: 'team', group: 'people' },
  { tab: 'contacts', group: 'people' },
  { tab: 'audit', group: 'reports' },
  { tab: 'settings', group: 'reports' },
];

export const tabLabel = (copy: AdminWorkspaceCopy, tab: AdminWorkspaceTab): string => {
  const map: Record<AdminWorkspaceTab, string> = {
    overview: copy.tabOverview,
    services: copy.tabServices,
    integrations: copy.tabIntegrations,
    analytics: copy.tabAnalytics,
    finance: copy.tabFinance,
    mail: copy.tabMail,
    campaigns: copy.tabCampaigns,
    templates: copy.tabTemplates,
    team: copy.tabTeam,
    contacts: copy.tabContacts,
    audit: copy.tabAudit,
    settings: copy.tabSettings,
  };
  return map[tab] || tab;
};

export const groupLabel = (copy: AdminWorkspaceCopy, group: AdminNavGroup): string => {
  const map: Record<AdminNavGroup, string> = {
    main: copy.navMain,
    platform: copy.navPlatform,
    content: copy.navContent,
    people: copy.navPeople,
    reports: copy.navReports,
  };
  return map[group];
};
