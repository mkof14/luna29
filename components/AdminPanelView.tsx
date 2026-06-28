import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Language, LangCopy, getLang } from '../constants';
import { AdminRole, AuthSession } from '../types';
import { LocalizedText, localizeFields, localizeText, resolveLocalizedText, seedLocalizedText } from '../utils/contentLocalization';
import { copyTextSafely, shareTextSafely } from '../utils/share';
import { adminService } from '../services/adminService';
import { getAdminPanelLabels } from '../utils/adminPanelLabels';

interface AdminPanelViewProps {
  session: AuthSession | null;
  lang: Language;
  onBack: () => void;
  onLogout: () => void;
  onRoleChange: (role: AdminRole) => void;
}

type ServiceStatus = 'Healthy' | 'Degraded' | 'Down';

type ServiceItem = {
  id: string;
  name: string;
  status: ServiceStatus;
  owner: string;
  uptime: string;
};

type ContentItem = {
  id: string;
  title: LocalizedText;
  body: LocalizedText;
  channel: 'Email' | 'Push' | 'Telegram' | 'Instagram';
  status: 'Draft' | 'Approved' | 'Scheduled';
  scheduledAt: LocalizedText;
};

type EmailTemplate = {
  id: string;
  title: LocalizedText;
  trigger: LocalizedText;
  subject: LocalizedText;
  preheader: LocalizedText;
  body: LocalizedText;
  variables?: string[];
  updatedBy: string;
  updatedAt: string;
};

type TemplateVersion = {
  id: string;
  at: string;
  action: 'created' | 'updated' | 'duplicated' | 'deleted';
  by: string;
  title: string;
  subject: string;
  trigger: string;
  variables: string[];
};

type AdminMember = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  active: boolean;
};

type PreviewState = {
  title: string;
  html: string;
  text: string;
};

type AdminAuditEntry = {
  id: string;
  at: string;
  actorEmail: string;
  actorRole: AdminRole;
  action: string;
  details: string;
};

type StorageBucket = {
  id: string;
  name: string;
  usedGb: number;
  quotaGb: number;
  updatedAt: string;
};

type AdminInvite = {
  id: string;
  email: string;
  role: AdminRole;
  status: 'pending' | 'sent' | 'accepted';
  sentAt: string;
};

type SocialPlatform = 'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'x' | 'telegram' | 'custom';

type SocialAccount = {
  id: string;
  platform: SocialPlatform;
  label: string;
  handle: string;
  connected: boolean;
  followers: number;
  engagement: number;
  lastSyncAt: string;
};

type EmailIntegration = {
  provider: 'sendgrid' | 'mailgun' | 'resend' | 'smtp';
  apiKeyMasked: string;
  fromEmail: string;
  domain: string;
  connected: boolean;
  spf: 'ok' | 'warn';
  dkim: 'ok' | 'warn';
  queuePending: number;
  sentToday: number;
  bouncedToday: number;
  openRate: number;
};

const DEFAULT_FINANCE = {
  mrr: 48240,
  arr: 578880,
  churn: 2.4,
  ltv: 386,
  cac: 59,
  conversion: 6.8,
  activeSubscribers: 2148,
  trialToPaid: 41.7,
};

const DEFAULT_TECHNICAL = {
  apiP95: 183,
  errorRate: 0.31,
  queueLag: 12,
};

const ADMIN_UI_COPY = {
  en: {
    inviteTitle: 'Invitations & Role Access',
    inviteHint: 'Send invite links and assign the starting admin role before first login.',
    inviteEmailPlaceholder: 'Invite email',
    inviteButton: 'Send invite',
    invitePending: 'Pending',
    inviteSent: 'Sent',
    inviteAccepted: 'Accepted',
    usersTitle: 'Users & Audience',
    usersTotal: 'Total users',
    usersActive: 'Active today',
    usersNew7d: 'New in 7 days',
    siteStatsTitle: 'Site Statistics',
    dau: 'DAU',
    wau: 'WAU',
    mau: 'MAU',
    conversion: 'Signup conversion',
    growth: 'Weekly growth',
    storageTitle: 'Storage Vault',
    addFolder: 'Add Folder',
    previewHint: 'Template preview and message preview are available below each item.',
    noPreview: 'Nothing selected yet. Choose a template or campaign preview.',
  },
  ru: {
    inviteTitle: 'Приглашения и доступы',
    inviteHint: 'Отправляйте ссылку-приглашение и назначайте стартовую роль администратора до первого входа.',
    inviteEmailPlaceholder: 'Email для приглашения',
    inviteButton: 'Отправить приглашение',
    invitePending: 'Ожидает',
    inviteSent: 'Отправлено',
    inviteAccepted: 'Принято',
    usersTitle: 'Пользователи и аудитория',
    usersTotal: 'Всего пользователей',
    usersActive: 'Активны сегодня',
    usersNew7d: 'Новые за 7 дней',
    siteStatsTitle: 'Статистика сайта',
    dau: 'DAU',
    wau: 'WAU',
    mau: 'MAU',
    conversion: 'Конверсия регистрации',
    growth: 'Недельный рост',
    storageTitle: 'Хранилище',
    addFolder: 'Добавить папку',
    previewHint: 'Превью шаблонов и сообщений доступно у каждого элемента ниже.',
    noPreview: 'Пока ничего не выбрано. Нажмите Preview у шаблона или кампании.',
  },
  uk: {
    inviteTitle: 'Запрошення та ролі доступу',
    inviteHint: 'Надсилайте запрошення і призначайте стартову роль адміністратора до першого входу.',
    inviteEmailPlaceholder: 'Email для запрошення',
    inviteButton: 'Надіслати запрошення',
    invitePending: 'Очікує',
    inviteSent: 'Надіслано',
    inviteAccepted: 'Прийнято',
    usersTitle: 'Користувачі та аудиторія',
    usersTotal: 'Усього користувачів',
    usersActive: 'Активні сьогодні',
    usersNew7d: 'Нові за 7 днів',
    siteStatsTitle: 'Статистика сайту',
    dau: 'DAU',
    wau: 'WAU',
    mau: 'MAU',
    conversion: 'Конверсія реєстрації',
    growth: 'Тижневий ріст',
    storageTitle: 'Сховище',
    addFolder: 'Додати папку',
    previewHint: 'Прев’ю шаблонів і повідомлень доступне під кожним елементом.',
    noPreview: 'Поки нічого не обрано. Натисніть Preview у шаблоні або кампанії.',
  },
  es: {
    inviteTitle: 'Invitaciones y roles',
    inviteHint: 'Envía enlaces de invitación y asigna el rol inicial antes del primer acceso.',
    inviteEmailPlaceholder: 'Email de invitación',
    inviteButton: 'Enviar invitación',
    invitePending: 'Pendiente',
    inviteSent: 'Enviado',
    inviteAccepted: 'Aceptado',
    usersTitle: 'Usuarios y audiencia',
    usersTotal: 'Usuarios totales',
    usersActive: 'Activos hoy',
    usersNew7d: 'Nuevos en 7 días',
    siteStatsTitle: 'Estadísticas del sitio',
    dau: 'DAU',
    wau: 'WAU',
    mau: 'MAU',
    conversion: 'Conversión de registro',
    growth: 'Crecimiento semanal',
    storageTitle: 'Almacenamiento',
    addFolder: 'Agregar carpeta',
    previewHint: 'La vista previa de plantillas y mensajes está disponible en cada elemento.',
    noPreview: 'Nada seleccionado aún. Elige la vista previa de una plantilla o campaña.',
  },
  fr: {
    inviteTitle: 'Invitations et roles',
    inviteHint: 'Envoyez des invitations et attribuez le role admin initial avant la premiere connexion.',
    inviteEmailPlaceholder: 'Email d’invitation',
    inviteButton: 'Envoyer invitation',
    invitePending: 'En attente',
    inviteSent: 'Envoyé',
    inviteAccepted: 'Accepté',
    usersTitle: 'Utilisatrices et audience',
    usersTotal: 'Total utilisatrices',
    usersActive: 'Actives aujourd’hui',
    usersNew7d: 'Nouvelles en 7 jours',
    siteStatsTitle: 'Statistiques du site',
    dau: 'DAU',
    wau: 'WAU',
    mau: 'MAU',
    conversion: 'Conversion inscription',
    growth: 'Croissance hebdo',
    storageTitle: 'Stockage',
    addFolder: 'Ajouter dossier',
    previewHint: 'L’aperçu des templates et messages est disponible sous chaque élément.',
    noPreview: 'Rien n’est sélectionné. Choisissez Preview sur un template ou une campagne.',
  },
  de: {
    inviteTitle: 'Einladungen und Rollen',
    inviteHint: 'Sende Einladungslinks und vergebe die Startrolle vor dem ersten Login.',
    inviteEmailPlaceholder: 'Einladungs-E-Mail',
    inviteButton: 'Einladung senden',
    invitePending: 'Ausstehend',
    inviteSent: 'Gesendet',
    inviteAccepted: 'Akzeptiert',
    usersTitle: 'Nutzerinnen und Reichweite',
    usersTotal: 'Gesamtnutzerinnen',
    usersActive: 'Heute aktiv',
    usersNew7d: 'Neu in 7 Tagen',
    siteStatsTitle: 'Website-Statistik',
    dau: 'DAU',
    wau: 'WAU',
    mau: 'MAU',
    conversion: 'Signup-Conversion',
    growth: 'Wöchentliches Wachstum',
    storageTitle: 'Speicher',
    addFolder: 'Ordner hinzufügen',
    previewHint: 'Template- und Nachrichten-Vorschau ist pro Element verfügbar.',
    noPreview: 'Noch nichts ausgewählt. Wähle Preview bei Template oder Kampagne.',
  },
  zh: {
    inviteTitle: '邀请与角色权限',
    inviteHint: '发送邀请链接，并在首次登录前分配管理员起始角色。',
    inviteEmailPlaceholder: '邀请邮箱',
    inviteButton: '发送邀请',
    invitePending: '待处理',
    inviteSent: '已发送',
    inviteAccepted: '已接受',
    usersTitle: '用户与站点受众',
    usersTotal: '用户总数',
    usersActive: '今日活跃',
    usersNew7d: '7天新增',
    siteStatsTitle: '站点统计',
    dau: 'DAU',
    wau: 'WAU',
    mau: 'MAU',
    conversion: '注册转化',
    growth: '周增长',
    storageTitle: '存储空间',
    addFolder: '新增文件夹',
    previewHint: '每条模板和活动都可直接预览。',
    noPreview: '尚未选择内容。请点击模板或活动的 Preview。',
  },
  ja: {
    inviteTitle: '招待とロール権限',
    inviteHint: '初回ログイン前に招待リンク送信と初期ロール設定を行います。',
    inviteEmailPlaceholder: '招待メール',
    inviteButton: '招待を送信',
    invitePending: '保留中',
    inviteSent: '送信済み',
    inviteAccepted: '承認済み',
    usersTitle: 'ユーザーとオーディエンス',
    usersTotal: '総ユーザー数',
    usersActive: '本日のアクティブ',
    usersNew7d: '7日間の新規',
    siteStatsTitle: 'サイト統計',
    dau: 'DAU',
    wau: 'WAU',
    mau: 'MAU',
    conversion: '登録コンバージョン',
    growth: '週間成長率',
    storageTitle: 'ストレージ',
    addFolder: 'フォルダ追加',
    previewHint: '各テンプレート/キャンペーンでプレビューを利用できます。',
    noPreview: '未選択です。テンプレートかキャンペーンのPreviewを押してください。',
  },
  pt: {
    inviteTitle: 'Convites e papeis',
    inviteHint: 'Envie links de convite e defina o papel inicial antes do primeiro login.',
    inviteEmailPlaceholder: 'Email para convite',
    inviteButton: 'Enviar convite',
    invitePending: 'Pendente',
    inviteSent: 'Enviado',
    inviteAccepted: 'Aceito',
    usersTitle: 'Usuárias e audiência',
    usersTotal: 'Usuárias totais',
    usersActive: 'Ativas hoje',
    usersNew7d: 'Novas em 7 dias',
    siteStatsTitle: 'Estatísticas do site',
    dau: 'DAU',
    wau: 'WAU',
    mau: 'MAU',
    conversion: 'Conversão de cadastro',
    growth: 'Crescimento semanal',
    storageTitle: 'Armazenamento',
    addFolder: 'Adicionar pasta',
    previewHint: 'Pré-visualização de templates e campanhas está disponível em cada item.',
    noPreview: 'Nada selecionado ainda. Escolha Preview de um template ou campanha.',
  },
};

const STORAGE_STATE_KEY = 'luna_admin_storage_v1';
const INVITES_STATE_KEY = 'luna_admin_invites_v1';
const SOCIAL_STATE_KEY = 'luna_admin_social_v1';
const EMAIL_INTEGRATION_KEY = 'luna_admin_email_integration_v1';

const DEFAULT_STORAGE_BUCKETS: StorageBucket[] = [
  { id: 'st-audio', name: 'Voice Notes', usedGb: 6.4, quotaGb: 20, updatedAt: '2026-03-11' },
  { id: 'st-reports', name: 'Health Reports', usedGb: 3.2, quotaGb: 12, updatedAt: '2026-03-12' },
  { id: 'st-media', name: 'Media Assets', usedGb: 2.1, quotaGb: 10, updatedAt: '2026-03-12' },
];

const DEFAULT_SOCIAL_ACCOUNTS: SocialAccount[] = [
  { id: 'soc-fb', platform: 'facebook', label: 'Facebook', handle: '@luna.women', connected: true, followers: 12840, engagement: 4.2, lastSyncAt: '2026-03-13T08:10:00Z' },
  { id: 'soc-ig', platform: 'instagram', label: 'Instagram', handle: '@luna.rhythm', connected: true, followers: 18620, engagement: 5.7, lastSyncAt: '2026-03-13T08:12:00Z' },
  { id: 'soc-tt', platform: 'tiktok', label: 'TikTok', handle: '@luna.daily', connected: false, followers: 9420, engagement: 7.1, lastSyncAt: '2026-03-10T15:40:00Z' },
  { id: 'soc-yt', platform: 'youtube', label: 'YouTube', handle: '@LunaBalance', connected: true, followers: 5280, engagement: 3.6, lastSyncAt: '2026-03-12T19:25:00Z' },
];

const DEFAULT_EMAIL_INTEGRATION: EmailIntegration = {
  provider: 'resend',
  apiKeyMasked: 're_******************Z8',
  fromEmail: 'care@luna.app',
  domain: 'luna.app',
  connected: true,
  spf: 'ok',
  dkim: 'ok',
  queuePending: 23,
  sentToday: 1482,
  bouncedToday: 7,
  openRate: 46.2,
};

const CHANNELS_COPY = {
  en: { title: 'Channels & Integrations', socialTitle: 'Social Media Administration', socialHint: 'Connect accounts, monitor sync status, and keep channel performance in one place.', emailTitle: 'Email System Connection', emailHint: 'Control provider status, delivery quality, and queue health for system emails.', connect: 'Connect', disconnect: 'Disconnect', syncNow: 'Sync now', addChannel: 'Add channel', channelName: 'Channel name', handle: 'Handle', followers: 'Followers', engagement: 'Engagement', statusConnected: 'Connected', statusDisconnected: 'Disconnected', provider: 'Provider', fromEmail: 'From email', domain: 'Domain', queue: 'Queue', sentToday: 'Sent today', bounced: 'Bounced', openRate: 'Open rate', testConnection: 'Test connection', spf: 'SPF', dkim: 'DKIM', connectedNow: 'Channel connected.', disconnectedNow: 'Channel disconnected.' },
  ru: { title: 'Каналы и интеграции', socialTitle: 'Администрирование соцсетей', socialHint: 'Подключайте аккаунты, следите за синхронизацией и метриками каналов в одном месте.', emailTitle: 'Подключение Email-системы', emailHint: 'Управляйте провайдером, качеством доставки и очередями системных писем.', connect: 'Подключить', disconnect: 'Отключить', syncNow: 'Синхронизировать', addChannel: 'Добавить канал', channelName: 'Название канала', handle: 'Аккаунт', followers: 'Подписчики', engagement: 'Вовлеченность', statusConnected: 'Подключен', statusDisconnected: 'Отключен', provider: 'Провайдер', fromEmail: 'Email отправителя', domain: 'Домен', queue: 'Очередь', sentToday: 'Отправлено сегодня', bounced: 'Отказы', openRate: 'Открываемость', testConnection: 'Проверить подключение', spf: 'SPF', dkim: 'DKIM', connectedNow: 'Канал подключен.', disconnectedNow: 'Канал отключен.' },
  uk: { title: 'Канали та інтеграції', socialTitle: 'Адміністрування соцмереж', socialHint: 'Підключайте акаунти, відстежуйте синхронізацію та метрики каналів в одному місці.', emailTitle: 'Підключення Email-системи', emailHint: 'Керуйте провайдером, якістю доставки та чергами системних листів.', connect: 'Підключити', disconnect: 'Відключити', syncNow: 'Синхронізувати', addChannel: 'Додати канал', channelName: 'Назва каналу', handle: 'Акаунт', followers: 'Підписники', engagement: 'Залученість', statusConnected: 'Підключено', statusDisconnected: 'Відключено', provider: 'Провайдер', fromEmail: 'Email відправника', domain: 'Домен', queue: 'Черга', sentToday: 'Надіслано сьогодні', bounced: 'Відмови', openRate: 'Відкриття', testConnection: 'Перевірити з’єднання', spf: 'SPF', dkim: 'DKIM', connectedNow: 'Канал підключено.', disconnectedNow: 'Канал відключено.' },
  es: { title: 'Canales e integraciones', socialTitle: 'Administración de redes sociales', socialHint: 'Conecta cuentas, controla sincronización y rendimiento de canales en un solo panel.', emailTitle: 'Conexión del sistema de email', emailHint: 'Gestiona proveedor, calidad de entrega y estado de la cola de mensajes.', connect: 'Conectar', disconnect: 'Desconectar', syncNow: 'Sincronizar', addChannel: 'Agregar canal', channelName: 'Nombre del canal', handle: 'Cuenta', followers: 'Seguidores', engagement: 'Interacción', statusConnected: 'Conectado', statusDisconnected: 'Desconectado', provider: 'Proveedor', fromEmail: 'Email remitente', domain: 'Dominio', queue: 'Cola', sentToday: 'Enviados hoy', bounced: 'Rebotes', openRate: 'Apertura', testConnection: 'Probar conexión', spf: 'SPF', dkim: 'DKIM', connectedNow: 'Canal conectado.', disconnectedNow: 'Canal desconectado.' },
  fr: { title: 'Canaux et integrations', socialTitle: 'Administration des reseaux sociaux', socialHint: 'Connectez les comptes, suivez la synchro et les performances dans un seul espace.', emailTitle: 'Connexion du systeme email', emailHint: 'Pilotez le fournisseur, la delivrabilite et la file d envoi des emails systeme.', connect: 'Connecter', disconnect: 'Deconnecter', syncNow: 'Synchroniser', addChannel: 'Ajouter canal', channelName: 'Nom du canal', handle: 'Compte', followers: 'Abonnes', engagement: 'Engagement', statusConnected: 'Connecte', statusDisconnected: 'Deconnecte', provider: 'Fournisseur', fromEmail: 'Email expediteur', domain: 'Domaine', queue: 'File', sentToday: 'Envoyes aujourd hui', bounced: 'Rejets', openRate: 'Taux d ouverture', testConnection: 'Tester connexion', spf: 'SPF', dkim: 'DKIM', connectedNow: 'Canal connecte.', disconnectedNow: 'Canal deconnecte.' },
  de: { title: 'Kanaele und Integrationen', socialTitle: 'Social-Media-Administration', socialHint: 'Konten verbinden, Sync-Status beobachten und Kanal-Performance zentral steuern.', emailTitle: 'E-Mail-System Verbindung', emailHint: 'Provider, Zustellqualitaet und Queue-Gesundheit fuer Systemmails verwalten.', connect: 'Verbinden', disconnect: 'Trennen', syncNow: 'Jetzt syncen', addChannel: 'Kanal hinzufuegen', channelName: 'Kanalname', handle: 'Handle', followers: 'Follower', engagement: 'Engagement', statusConnected: 'Verbunden', statusDisconnected: 'Getrennt', provider: 'Provider', fromEmail: 'Absender-Email', domain: 'Domain', queue: 'Queue', sentToday: 'Heute gesendet', bounced: 'Bounces', openRate: 'Oeffnungsrate', testConnection: 'Verbindung testen', spf: 'SPF', dkim: 'DKIM', connectedNow: 'Kanal verbunden.', disconnectedNow: 'Kanal getrennt.' },
  zh: { title: '渠道与集成', socialTitle: '社交媒体管理', socialHint: '统一管理账号连接、同步状态与渠道表现。', emailTitle: 'Email 系统连接', emailHint: '管理邮件服务商、投递质量与队列健康状态。', connect: '连接', disconnect: '断开', syncNow: '立即同步', addChannel: '添加渠道', channelName: '渠道名称', handle: '账号', followers: '关注者', engagement: '互动率', statusConnected: '已连接', statusDisconnected: '未连接', provider: '服务商', fromEmail: '发件邮箱', domain: '域名', queue: '队列', sentToday: '今日发送', bounced: '退信', openRate: '打开率', testConnection: '测试连接', spf: 'SPF', dkim: 'DKIM', connectedNow: '渠道已连接。', disconnectedNow: '渠道已断开。' },
  ja: { title: 'チャネルと連携', socialTitle: 'SNS 管理', socialHint: 'アカウント接続、同期状況、チャネル成果を一元管理します。', emailTitle: 'メールシステム接続', emailHint: '配信プロバイダ、到達率、キュー状況を管理します。', connect: '接続', disconnect: '切断', syncNow: '今すぐ同期', addChannel: 'チャネル追加', channelName: 'チャネル名', handle: 'アカウント', followers: 'フォロワー', engagement: 'エンゲージ', statusConnected: '接続済み', statusDisconnected: '未接続', provider: 'プロバイダ', fromEmail: '送信元メール', domain: 'ドメイン', queue: 'キュー', sentToday: '本日送信', bounced: 'バウンス', openRate: '開封率', testConnection: '接続テスト', spf: 'SPF', dkim: 'DKIM', connectedNow: 'チャネルを接続しました。', disconnectedNow: 'チャネルを切断しました。' },
  pt: { title: 'Canais e integrações', socialTitle: 'Administração de redes sociais', socialHint: 'Conecte contas, acompanhe sincronização e desempenho dos canais em um painel.', emailTitle: 'Conexão do sistema de email', emailHint: 'Gerencie provedor, qualidade de entrega e saúde da fila de emails.', connect: 'Conectar', disconnect: 'Desconectar', syncNow: 'Sincronizar agora', addChannel: 'Adicionar canal', channelName: 'Nome do canal', handle: 'Conta', followers: 'Seguidores', engagement: 'Engajamento', statusConnected: 'Conectado', statusDisconnected: 'Desconectado', provider: 'Provedor', fromEmail: 'Email remetente', domain: 'Domínio', queue: 'Fila', sentToday: 'Enviados hoje', bounced: 'Rejeitados', openRate: 'Taxa de abertura', testConnection: 'Testar conexão', spf: 'SPF', dkim: 'DKIM', connectedNow: 'Canal conectado.', disconnectedNow: 'Canal desconectado.' },
};

const defaultMarketingBody = 'A calm Luna29 update for your rhythm. Gentle reminder with clear next action.';
const defaultTemplateBody = 'You are in a safe Luna29 space. Observe your rhythm softly and stay connected with your body.';
const defaultTemplateVariables = ['{{first_name}}', '{{support_link}}', '{{app_link}}'];

const variablePresets: Array<{ key: string; match: RegExp; variables: string[] }> = [
  { key: 'welcome', match: /welcome|onboarding|trial started/i, variables: ['{{first_name}}', '{{onboarding_link}}', '{{app_link}}'] },
  { key: 'security', match: /password|verification|magic link|device/i, variables: ['{{first_name}}', '{{security_link}}', '{{expires_at}}'] },
  { key: 'billing', match: /renewal|invoice|payment|billing|trial ending/i, variables: ['{{first_name}}', '{{plan_name}}', '{{amount}}', '{{renewal_date}}', '{{billing_link}}'] },
  { key: 'retention', match: /cancel|win-back|reactivation/i, variables: ['{{first_name}}', '{{offer_link}}', '{{offer_expires_at}}'] },
  { key: 'product', match: /feature|digest|weekly/i, variables: ['{{first_name}}', '{{insight_link}}', '{{week_range}}'] },
  { key: 'support', match: /support/i, variables: ['{{first_name}}', '{{ticket_id}}', '{{support_link}}'] },
  { key: 'legal', match: /privacy|deletion/i, variables: ['{{first_name}}', '{{policy_link}}', '{{request_id}}'] },
];

const parseVariableInput = (value: string): string[] =>
  Array.from(
    new Set(
      value
        .split(',')
        .map((token) => token.trim())
        .filter(Boolean)
    )
  );

const toVariableInput = (variables: string[]): string => variables.join(', ');

const inferVariables = (title: string, trigger: string): string[] => {
  const source = `${title} ${trigger}`.trim();
  const matched = variablePresets.find((preset) => preset.match.test(source));
  return matched ? matched.variables : defaultTemplateVariables;
};

const normalizeLocalized = (value: unknown, fallback: string): LocalizedText => {
  if (typeof value === 'string') return seedLocalizedText(value, 'en');
  if (!value || typeof value !== 'object') return seedLocalizedText(fallback, 'en');

  const record = value as Partial<LangCopy< string>>;
  return {
    en: record.en || fallback,
    ru: record.ru || record.en || fallback,
    uk: record.uk || record.en || fallback,
    es: record.es || record.en || fallback,
    fr: record.fr || record.en || fallback,
    de: record.de || record.en || fallback,
    zh: record.zh || record.en || fallback,
    ja: record.ja || record.en || fallback,
    pt: record.pt || record.en || fallback,
  };
};

const DEFAULT_CONTENT: ContentItem[] = [
  {
    id: 'cnt-001',
    title: seedLocalizedText('March Retention Sequence', 'en'),
    body: seedLocalizedText('Luna29 check-in reminder. Pause for one breath and mark your current state.', 'en'),
    channel: 'Email',
    status: 'Scheduled',
    scheduledAt: seedLocalizedText('2026-03-05 09:00', 'en'),
  },
  {
    id: 'cnt-002',
    title: seedLocalizedText('Cycle Tips Carousel', 'en'),
    body: seedLocalizedText('Three practical rhythm tips for this phase: rest, hydration, and soft planning.', 'en'),
    channel: 'Instagram',
    status: 'Approved',
    scheduledAt: seedLocalizedText('2026-03-04 18:00', 'en'),
  },
  {
    id: 'cnt-003',
    title: seedLocalizedText('Check-in Reminder Wave A', 'en'),
    body: seedLocalizedText('Daily check-in wave for members who skipped two days in a row.', 'en'),
    channel: 'Push',
    status: 'Draft',
    scheduledAt: seedLocalizedText('Not set', 'en'),
  },
];

const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: 'tpl-welcome',
    title: seedLocalizedText('Welcome + Onboarding', 'en'),
    trigger: seedLocalizedText('New signup', 'en'),
    subject: seedLocalizedText('Welcome to Luna29', 'en'),
    preheader: seedLocalizedText('Your rhythm starts here.', 'en'),
    body: seedLocalizedText('Welcome to Luna29. Your private rhythm map is ready. Start with one gentle check-in today.', 'en'),
    updatedBy: 'Growth Ops',
    updatedAt: '2026-03-01',
  },
  {
    id: 'tpl-reset',
    title: seedLocalizedText('Password Recovery', 'en'),
    trigger: seedLocalizedText('Forgot password', 'en'),
    subject: seedLocalizedText('Reset your Luna29 password', 'en'),
    preheader: seedLocalizedText('Secure recovery route prepared.', 'en'),
    body: seedLocalizedText('Use the secure button below to set a new password and continue your Luna29 journey.', 'en'),
    updatedBy: 'Security',
    updatedAt: '2026-02-27',
  },
  {
    id: 'tpl-renewal',
    title: seedLocalizedText('Subscription Renewal', 'en'),
    trigger: seedLocalizedText('7 days before renewal', 'en'),
    subject: seedLocalizedText('Your Luna29 renewal is coming up', 'en'),
    preheader: seedLocalizedText('Keep your rhythm continuity active.', 'en'),
    body: seedLocalizedText('Your Luna29 membership renews in 7 days. Review your plan and continue tracking with no interruption.', 'en'),
    updatedBy: 'Finance Team',
    updatedAt: '2026-02-25',
  },
  {
    id: 'tpl-churn-save',
    title: seedLocalizedText('Cancellation Save Offer', 'en'),
    trigger: seedLocalizedText('Cancel intent', 'en'),
    subject: seedLocalizedText('Stay with Luna29 for one more cycle', 'en'),
    preheader: seedLocalizedText('A softer plan can help.', 'en'),
    body: seedLocalizedText('Before you leave, we prepared a gentle continuity option with reduced pricing for one cycle.', 'en'),
    updatedBy: 'Retention Team',
    updatedAt: '2026-02-28',
  },
  {
    id: 'tpl-verify-email',
    title: seedLocalizedText('Email Verification', 'en'),
    trigger: seedLocalizedText('Account created, email not verified', 'en'),
    subject: seedLocalizedText('Verify your Luna29 email', 'en'),
    preheader: seedLocalizedText('One secure step to activate your account.', 'en'),
    body: seedLocalizedText('Confirm your email to secure your Luna29 account and unlock member features.', 'en'),
    updatedBy: 'Security',
    updatedAt: '2026-03-02',
  },
  {
    id: 'tpl-magic-link',
    title: seedLocalizedText('Magic Link Login', 'en'),
    trigger: seedLocalizedText('Passwordless login requested', 'en'),
    subject: seedLocalizedText('Your Luna29 sign-in link', 'en'),
    preheader: seedLocalizedText('This link expires shortly for your safety.', 'en'),
    body: seedLocalizedText('Use this secure sign-in link to access Luna29. If you did not request it, ignore this email.', 'en'),
    updatedBy: 'Security',
    updatedAt: '2026-03-02',
  },
  {
    id: 'tpl-new-device-alert',
    title: seedLocalizedText('New Device Alert', 'en'),
    trigger: seedLocalizedText('Login from unknown device', 'en'),
    subject: seedLocalizedText('New sign-in detected on your Luna29 account', 'en'),
    preheader: seedLocalizedText('Review activity and secure your account if needed.', 'en'),
    body: seedLocalizedText('We noticed a sign-in from a new device. If this was not you, reset your password immediately.', 'en'),
    updatedBy: 'Security',
    updatedAt: '2026-03-02',
  },
  {
    id: 'tpl-trial-start',
    title: seedLocalizedText('Trial Started', 'en'),
    trigger: seedLocalizedText('Trial activated', 'en'),
    subject: seedLocalizedText('Your Luna29 trial has started', 'en'),
    preheader: seedLocalizedText('Make the most of your first rhythm week.', 'en'),
    body: seedLocalizedText('Welcome to your Luna29 trial. Start with daily check-ins and watch patterns become clear.', 'en'),
    updatedBy: 'Growth Ops',
    updatedAt: '2026-03-02',
  },
  {
    id: 'tpl-trial-ending',
    title: seedLocalizedText('Trial Ending Reminder', 'en'),
    trigger: seedLocalizedText('3 days before trial ends', 'en'),
    subject: seedLocalizedText('Your Luna29 trial ends soon', 'en'),
    preheader: seedLocalizedText('Keep your progress and continue your map.', 'en'),
    body: seedLocalizedText('Your trial ends in 3 days. Upgrade now to keep your entries, insights, and continuity.', 'en'),
    updatedBy: 'Growth Ops',
    updatedAt: '2026-03-02',
  },
  {
    id: 'tpl-payment-failed',
    title: seedLocalizedText('Payment Failed', 'en'),
    trigger: seedLocalizedText('Billing charge failed', 'en'),
    subject: seedLocalizedText('We could not process your Luna29 payment', 'en'),
    preheader: seedLocalizedText('Update your billing method to avoid interruption.', 'en'),
    body: seedLocalizedText('Your last payment attempt failed. Please update your payment method to keep full access.', 'en'),
    updatedBy: 'Finance Team',
    updatedAt: '2026-03-02',
  },
  {
    id: 'tpl-payment-recovered',
    title: seedLocalizedText('Payment Recovered', 'en'),
    trigger: seedLocalizedText('Billing method updated after failure', 'en'),
    subject: seedLocalizedText('Your Luna29 billing is active again', 'en'),
    preheader: seedLocalizedText('Thank you, your membership continues normally.', 'en'),
    body: seedLocalizedText('We successfully processed your payment. Your Luna29 access continues with no interruption.', 'en'),
    updatedBy: 'Finance Team',
    updatedAt: '2026-03-02',
  },
  {
    id: 'tpl-invoice',
    title: seedLocalizedText('Invoice Receipt', 'en'),
    trigger: seedLocalizedText('Successful monthly or yearly payment', 'en'),
    subject: seedLocalizedText('Your Luna29 invoice and receipt', 'en'),
    preheader: seedLocalizedText('Payment confirmation for your records.', 'en'),
    body: seedLocalizedText('Thank you for your payment. Your invoice is attached and your membership remains active.', 'en'),
    updatedBy: 'Finance Team',
    updatedAt: '2026-03-02',
  },
  {
    id: 'tpl-winback',
    title: seedLocalizedText('Win-back Reactivation', 'en'),
    trigger: seedLocalizedText('Inactive for 30 days', 'en'),
    subject: seedLocalizedText('Your Luna29 space is still here for you', 'en'),
    preheader: seedLocalizedText('Return with a gentle restart plan.', 'en'),
    body: seedLocalizedText('Come back when you are ready. We prepared a simple re-entry flow to restart in under 2 minutes.', 'en'),
    updatedBy: 'Retention Team',
    updatedAt: '2026-03-02',
  },
  {
    id: 'tpl-weekly-digest',
    title: seedLocalizedText('Weekly Rhythm Digest', 'en'),
    trigger: seedLocalizedText('Weekly summary schedule', 'en'),
    subject: seedLocalizedText('Your weekly Luna29 rhythm summary', 'en'),
    preheader: seedLocalizedText('Patterns, shifts, and one practical focus.', 'en'),
    body: seedLocalizedText('Here is your weekly rhythm digest: key shifts, strongest pattern, and one gentle next step.', 'en'),
    updatedBy: 'Product Team',
    updatedAt: '2026-03-02',
  },
  {
    id: 'tpl-feature-release',
    title: seedLocalizedText('New Feature Release', 'en'),
    trigger: seedLocalizedText('Feature flag rollout', 'en'),
    subject: seedLocalizedText('New in Luna29: your latest tools', 'en'),
    preheader: seedLocalizedText('Explore new capabilities in your member space.', 'en'),
    body: seedLocalizedText('We shipped a new Luna29 feature to help you track and reflect with less effort and more clarity.', 'en'),
    updatedBy: 'Product Team',
    updatedAt: '2026-03-02',
  },
  {
    id: 'tpl-support-followup',
    title: seedLocalizedText('Support Follow-up', 'en'),
    trigger: seedLocalizedText('Support ticket resolved', 'en'),
    subject: seedLocalizedText('Your Luna29 support request was resolved', 'en'),
    preheader: seedLocalizedText('Please confirm everything works as expected.', 'en'),
    body: seedLocalizedText('We marked your support request as resolved. Reply directly if anything still needs attention.', 'en'),
    updatedBy: 'Support Team',
    updatedAt: '2026-03-02',
  },
  {
    id: 'tpl-privacy-update',
    title: seedLocalizedText('Privacy Policy Update', 'en'),
    trigger: seedLocalizedText('Privacy terms updated', 'en'),
    subject: seedLocalizedText('Important update to Luna29 privacy terms', 'en'),
    preheader: seedLocalizedText('Review what changed and why.', 'en'),
    body: seedLocalizedText('We updated our privacy policy to improve clarity and compliance. Review the summary of changes.', 'en'),
    updatedBy: 'Legal Team',
    updatedAt: '2026-03-02',
  },
  {
    id: 'tpl-account-deletion',
    title: seedLocalizedText('Account Deletion Confirmation', 'en'),
    trigger: seedLocalizedText('Deletion request completed', 'en'),
    subject: seedLocalizedText('Your Luna29 account was deleted', 'en'),
    preheader: seedLocalizedText('Confirmation of data deletion request.', 'en'),
    body: seedLocalizedText('Your account deletion request has been completed according to our policy. This action is now final.', 'en'),
    updatedBy: 'Legal Team',
    updatedAt: '2026-03-02',
  },
  {
    id: 'tpl-evening-reflection-reminder',
    title: seedLocalizedText('Evening Reflection Reminder', 'en'),
    trigger: seedLocalizedText('20:30 local time (if no reflection today)', 'en'),
    subject: seedLocalizedText('A quiet minute with Luna29 tonight', 'en'),
    preheader: seedLocalizedText('One short note can make tomorrow clearer.', 'en'),
    body: seedLocalizedText('Take one gentle minute with Luna29 tonight. A few honest words are enough.', 'en'),
    updatedBy: 'Product Team',
    updatedAt: '2026-03-12',
  },
  {
    id: 'tpl-partner-brief-ready',
    title: seedLocalizedText('Partner Brief Ready', 'en'),
    trigger: seedLocalizedText('User generated partner message', 'en'),
    subject: seedLocalizedText('Your “Explain today” brief is ready', 'en'),
    preheader: seedLocalizedText('Share your day in calm and clear language.', 'en'),
    body: seedLocalizedText('Your partner brief is ready to share. Review and send it when you feel ready.', 'en'),
    updatedBy: 'Bridge Team',
    updatedAt: '2026-03-12',
  },
  {
    id: 'tpl-weekly-continuity',
    title: seedLocalizedText('Weekly Continuity Note', 'en'),
    trigger: seedLocalizedText('Every Sunday evening', 'en'),
    subject: seedLocalizedText('Your week with Luna29', 'en'),
    preheader: seedLocalizedText('A small view of your rhythm continuity.', 'en'),
    body: seedLocalizedText('You kept showing up this week. Here is a simple continuity view of your days.', 'en'),
    updatedBy: 'Insights Team',
    updatedAt: '2026-03-12',
  },
];

const TEMPLATE_PACK_ADVANCED: EmailTemplate[] = [
  {
    id: 'tpl-voice-streak-nudge',
    title: seedLocalizedText('Voice Note Streak Nudge', 'en'),
    trigger: seedLocalizedText('2 missed evening voice notes', 'en'),
    subject: seedLocalizedText('Come back for one calm minute', 'en'),
    preheader: seedLocalizedText('No pressure. Just one small check-in.', 'en'),
    body: seedLocalizedText('You can return with a single minute tonight. Luna29 will continue from where you left.', 'en'),
    updatedBy: 'Retention Team',
    updatedAt: '2026-03-12',
  },
  {
    id: 'tpl-monthly-insight-release',
    title: seedLocalizedText('Monthly Insight Published', 'en'),
    trigger: seedLocalizedText('Monthly summary generated', 'en'),
    subject: seedLocalizedText('Your month with Luna29 is ready', 'en'),
    preheader: seedLocalizedText('See what became clearer this month.', 'en'),
    body: seedLocalizedText('Your monthly rhythm summary is ready. Open it to review your strongest insight signals.', 'en'),
    updatedBy: 'Insights Team',
    updatedAt: '2026-03-12',
  },
  {
    id: 'tpl-soft-reactivation',
    title: seedLocalizedText('Soft Reactivation Journey', 'en'),
    trigger: seedLocalizedText('Inactive for 10 days', 'en'),
    subject: seedLocalizedText('Your Luna29 space is still open', 'en'),
    preheader: seedLocalizedText('Resume gently, one evening at a time.', 'en'),
    body: seedLocalizedText('Return gently with one short evening note. Your continuity timeline is waiting for you.', 'en'),
    updatedBy: 'Lifecycle Team',
    updatedAt: '2026-03-12',
  },
];

const parseContent = (value: unknown): ContentItem[] => {
  if (!Array.isArray(value)) return DEFAULT_CONTENT;
  return value.map((raw, index) => {
    const item = (raw || {}) as Partial<ContentItem>;
    return {
      id: item.id || `cnt-fallback-${index}`,
      title: normalizeLocalized(item.title, 'Campaign'),
      body: normalizeLocalized(item.body, defaultMarketingBody),
      channel: item.channel || 'Email',
      status: item.status || 'Draft',
      scheduledAt: normalizeLocalized(item.scheduledAt, 'Not set'),
    };
  });
};

const parseTemplates = (value: unknown): EmailTemplate[] => {
  if (!Array.isArray(value)) return DEFAULT_TEMPLATES;
  return value.map((raw, index) => {
    const item = (raw || {}) as Partial<EmailTemplate>;
    const title = normalizeLocalized(item.title, 'Template');
    const trigger = normalizeLocalized(item.trigger, 'Manual dispatch');
    const inferred = inferVariables(title.en, trigger.en);
    const providedVariables = Array.isArray(item.variables)
      ? item.variables.map((value) => String(value).trim()).filter(Boolean)
      : [];
    return {
      id: item.id || `tpl-fallback-${index}`,
      title,
      trigger,
      subject: normalizeLocalized(item.subject, 'Luna29 update'),
      preheader: normalizeLocalized(item.preheader, 'Luna29 email'),
      body: normalizeLocalized(item.body, defaultTemplateBody),
      variables: providedVariables.length > 0 ? providedVariables : inferred,
      updatedBy: item.updatedBy || 'Admin',
      updatedAt: item.updatedAt || new Date().toISOString().slice(0, 10),
    };
  });
};

const parseTemplateHistory = (value: unknown): Record<string, TemplateVersion[]> => {
  if (!value || typeof value !== 'object') return {};
  const source = value as Record<string, unknown>;
  return Object.entries(source).reduce((acc, [templateId, items]) => {
    if (!Array.isArray(items)) return acc;
    acc[templateId] = items
      .map((item) => {
        const raw = (item || {}) as Partial<TemplateVersion>;
        if (!raw.id || !raw.at || !raw.action) return null;
        return {
          id: String(raw.id),
          at: String(raw.at),
          action: raw.action,
          by: String(raw.by || 'Admin'),
          title: String(raw.title || ''),
          subject: String(raw.subject || ''),
          trigger: String(raw.trigger || ''),
          variables: Array.isArray(raw.variables) ? raw.variables.map((v) => String(v)) : [],
        } as TemplateVersion;
      })
      .filter((entry): entry is TemplateVersion => Boolean(entry))
      .slice(0, 20);
    return acc;
  }, {} as Record<string, TemplateVersion[]>);
};

const parseServices = (value: unknown): ServiceItem[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((raw, index) => {
      const item = (raw || {}) as Partial<ServiceItem>;
      const status: ServiceStatus = item.status === 'Degraded' || item.status === 'Down' ? item.status : 'Healthy';
      return {
        id: item.id || `svc-${index}`,
        name: String(item.name || 'Service'),
        status,
        owner: String(item.owner || 'Ops'),
        uptime: String(item.uptime || '99.00%'),
      };
    })
    .slice(0, 64);
};

const parseAdmins = (value: unknown): AdminMember[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((raw, index) => {
      const item = (raw || {}) as Partial<AdminMember>;
      const role: AdminRole = (['viewer', 'operator', 'content_manager', 'finance_manager', 'super_admin'] as AdminRole[]).includes(item.role as AdminRole)
        ? (item.role as AdminRole)
        : 'viewer';
      return {
        id: item.id || `adm-${index}`,
        name: String(item.name || 'Admin'),
        email: String(item.email || ''),
        role,
        active: Boolean(item.active),
      };
    })
    .slice(0, 128);
};

const parseTestHistory = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item)).filter(Boolean).slice(0, 100);
};

const parseFinancialMetrics = (value: unknown) => {
  if (!value || typeof value !== 'object') return DEFAULT_FINANCE;
  const item = value as Partial<typeof DEFAULT_FINANCE>;
  return {
    mrr: Number(item.mrr) || DEFAULT_FINANCE.mrr,
    arr: Number(item.arr) || DEFAULT_FINANCE.arr,
    churn: Number(item.churn) || DEFAULT_FINANCE.churn,
    ltv: Number(item.ltv) || DEFAULT_FINANCE.ltv,
    cac: Number(item.cac) || DEFAULT_FINANCE.cac,
    conversion: Number(item.conversion) || DEFAULT_FINANCE.conversion,
    activeSubscribers: Number(item.activeSubscribers) || DEFAULT_FINANCE.activeSubscribers,
    trialToPaid: Number(item.trialToPaid) || DEFAULT_FINANCE.trialToPaid,
  };
};

const parseTechnicalMetrics = (value: unknown) => {
  if (!value || typeof value !== 'object') return DEFAULT_TECHNICAL;
  const item = value as Partial<typeof DEFAULT_TECHNICAL>;
  return {
    apiP95: Number(item.apiP95) || DEFAULT_TECHNICAL.apiP95,
    errorRate: Number(item.errorRate) || DEFAULT_TECHNICAL.errorRate,
    queueLag: Number(item.queueLag) || DEFAULT_TECHNICAL.queueLag,
  };
};

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const downloadFile = (filename: string, content: string, mime: string) => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const downloadBlob = (filename: string, blob: Blob) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const openPrintPreview = (title: string, htmlBody: string): boolean => {
  const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=980,height=760');
  if (!printWindow) return false;

  printWindow.document.open();
  printWindow.document.write(`<!doctype html><html><head><meta charset="utf-8"/><title>${escapeHtml(title)}</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#0f172a;} .luna-print-wrap{max-width:760px;margin:0 auto;} pre{white-space:pre-wrap;}</style></head><body><div class="luna-print-wrap">${htmlBody}</div></body></html>`);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  return true;
};

export const AdminPanelView: React.FC<AdminPanelViewProps> = ({ session, lang, onBack, onLogout, onRoleChange }) => {
  const labels = getAdminPanelLabels(lang);
  const { copy, channelLabels, campaignStatusLabels, statusLabels } = labels;
  const adminUi = getLang(ADMIN_UI_COPY as LangCopy<(typeof ADMIN_UI_COPY)['en']>, lang);
  const channelsCopy = getLang(CHANNELS_COPY as LangCopy<(typeof CHANNELS_COPY)['en']>, lang);
  const templateBodyRef = useRef<HTMLTextAreaElement | null>(null);

  const [services, setServices] = useState<ServiceItem[]>([
    { id: 'svc-auth', name: 'Auth Gateway', status: 'Healthy', owner: 'Ops', uptime: '99.98%' },
    { id: 'svc-ai', name: 'Narrative Engine', status: 'Healthy', owner: 'AI', uptime: '99.87%' },
    { id: 'svc-sync', name: 'Sync Queue', status: 'Degraded', owner: 'Platform', uptime: '98.62%' },
    { id: 'svc-mail', name: 'Mail Dispatch', status: 'Healthy', owner: 'Growth', uptime: '99.91%' },
  ]);

  const [content, setContent] = useState<ContentItem[]>(DEFAULT_CONTENT);
  const [templates, setTemplates] = useState<EmailTemplate[]>(DEFAULT_TEMPLATES);
  const [templateHistory, setTemplateHistory] = useState<Record<string, TemplateVersion[]>>({});

  const [admins, setAdmins] = useState<AdminMember[]>([
    { id: 'adm-1', name: 'Luna29 Owner', email: 'owner@luna.app', role: 'super_admin', active: true },
    { id: 'adm-2', name: 'Ops Control', email: 'ops@luna.app', role: 'operator', active: true },
    { id: 'adm-3', name: 'Growth Team', email: 'marketing@luna.app', role: 'content_manager', active: true },
    { id: 'adm-4', name: 'Finance Board', email: 'finance@luna.app', role: 'finance_manager', active: true },
  ]);

  const [testHistory, setTestHistory] = useState<string[]>([
    'Smoke tests: PASS (2026-03-03 08:20)',
    'Email template lint: PASS (2026-03-03 08:16)',
    'Analytics sync check: WARN (2026-03-03 07:54)',
  ]);
  const [financialMetrics, setFinancialMetrics] = useState(DEFAULT_FINANCE);
  const [technicalMetrics, setTechnicalMetrics] = useState(DEFAULT_TECHNICAL);
  const [auditEntries, setAuditEntries] = useState<AdminAuditEntry[]>([]);
  const [isServerStateReady, setIsServerStateReady] = useState(false);
  const [storageBuckets, setStorageBuckets] = useState<StorageBucket[]>(DEFAULT_STORAGE_BUCKETS);
  const [newStorageName, setNewStorageName] = useState('');
  const [newStorageQuota, setNewStorageQuota] = useState('8');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<AdminRole>('operator');
  const [invites, setInvites] = useState<AdminInvite[]>([]);
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>(DEFAULT_SOCIAL_ACCOUNTS);
  const [customChannelName, setCustomChannelName] = useState('');
  const [customChannelHandle, setCustomChannelHandle] = useState('');
  const [emailIntegration, setEmailIntegration] = useState<EmailIntegration>(DEFAULT_EMAIL_INTEGRATION);

  const [newCampaignTitle, setNewCampaignTitle] = useState('');
  const [newCampaignBody, setNewCampaignBody] = useState('');
  const [newCampaignChannel, setNewCampaignChannel] = useState<ContentItem['channel']>('Email');
  const [newCampaignStatus, setNewCampaignStatus] = useState<ContentItem['status']>('Draft');

  const [newTemplateTitle, setNewTemplateTitle] = useState('');
  const [newTemplateTrigger, setNewTemplateTrigger] = useState('Manual dispatch');
  const [newTemplateSubject, setNewTemplateSubject] = useState('A calm Luna29 update');
  const [newTemplatePreheader, setNewTemplatePreheader] = useState('Gentle insight for your rhythm.');
  const [newTemplateBody, setNewTemplateBody] = useState('Luna29 note: take one breath, open your map, and choose one small caring step for today.');
  const [newTemplateVariables, setNewTemplateVariables] = useState('{{first_name}}, {{app_link}}, {{support_link}}');
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

  const [isCampaignLocalizing, setIsCampaignLocalizing] = useState(false);
  const [isTemplateLocalizing, setIsTemplateLocalizing] = useState(false);
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);
  const availableVariableTokens = useMemo(() => {
    const tokens = parseVariableInput(newTemplateVariables);
    return tokens.length > 0 ? tokens : defaultTemplateVariables;
  }, [newTemplateVariables]);
  const storageTotals = useMemo(() => {
    const used = storageBuckets.reduce((sum, item) => sum + item.usedGb, 0);
    const quota = storageBuckets.reduce((sum, item) => sum + item.quotaGb, 0);
    const utilization = quota > 0 ? Math.round((used / quota) * 100) : 0;
    return { used, quota, utilization };
  }, [storageBuckets]);
  const userStats = useMemo(() => {
    const totalUsers = Math.max(120, financialMetrics.activeSubscribers + 380);
    const activeToday = Math.max(60, Math.round(financialMetrics.activeSubscribers * 0.31));
    const new7d = Math.max(10, Math.round(financialMetrics.activeSubscribers * 0.045));
    return { totalUsers, activeToday, new7d };
  }, [financialMetrics.activeSubscribers]);
  const siteStats = useMemo(() => {
    const dau = Math.max(120, Math.round(financialMetrics.activeSubscribers * 0.32));
    const wau = Math.max(240, Math.round(financialMetrics.activeSubscribers * 0.66));
    const mau = Math.max(420, Math.round(financialMetrics.activeSubscribers * 1.05));
    const conversion = Number(financialMetrics.conversion.toFixed(1));
    const growth = Number((Math.max(0.6, 3.4 - financialMetrics.churn * 0.45)).toFixed(1));
    return { dau, wau, mau, conversion, growth };
  }, [financialMetrics.activeSubscribers, financialMetrics.churn, financialMetrics.conversion]);
  const socialTotals = useMemo(() => {
    const connected = socialAccounts.filter((item) => item.connected).length;
    const totalFollowers = socialAccounts.reduce((sum, item) => sum + item.followers, 0);
    const avgEngagement = socialAccounts.length > 0
      ? Number((socialAccounts.reduce((sum, item) => sum + item.engagement, 0) / socialAccounts.length).toFixed(1))
      : 0;
    return { connected, totalFollowers, avgEngagement };
  }, [socialAccounts]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_STATE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as StorageBucket[];
      if (!Array.isArray(parsed) || parsed.length === 0) return;
      const normalized = parsed
        .map((item, index) => ({
          id: String(item.id || `st-${index}`),
          name: String(item.name || `Storage ${index + 1}`),
          usedGb: Math.max(0, Number(item.usedGb) || 0),
          quotaGb: Math.max(1, Number(item.quotaGb) || 8),
          updatedAt: String(item.updatedAt || new Date().toISOString().slice(0, 10)),
        }))
        .slice(0, 50);
      if (normalized.length > 0) setStorageBuckets(normalized);
    } catch {
      // keep default storage map
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_STATE_KEY, JSON.stringify(storageBuckets));
    } catch {
      // ignore storage errors
    }
  }, [storageBuckets]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(INVITES_STATE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as AdminInvite[];
      if (!Array.isArray(parsed)) return;
      const normalized = parsed
        .map((item, index) => ({
          id: String(item.id || `inv-${index}`),
          email: String(item.email || '').toLowerCase(),
          role: (['viewer', 'operator', 'content_manager', 'finance_manager', 'super_admin'] as AdminRole[]).includes(item.role)
            ? item.role
            : 'viewer',
          status: (item.status === 'accepted' ? 'accepted' : item.status === 'sent' ? 'sent' : 'pending') as AdminInvite['status'],
          sentAt: String(item.sentAt || new Date().toISOString()),
        }))
        .slice(0, 100);
      setInvites(normalized);
    } catch {
      // ignore malformed invite storage
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(INVITES_STATE_KEY, JSON.stringify(invites));
    } catch {
      // ignore storage failures
    }
  }, [invites]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SOCIAL_STATE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as SocialAccount[];
      if (!Array.isArray(parsed)) return;
      const normalized = parsed
        .map((item, index) => ({
          id: String(item.id || `soc-${index}`),
          platform: (['facebook', 'instagram', 'tiktok', 'youtube', 'x', 'telegram', 'custom'] as SocialPlatform[]).includes(item.platform)
            ? item.platform
            : 'custom',
          label: String(item.label || 'Channel'),
          handle: String(item.handle || '@luna'),
          connected: Boolean(item.connected),
          followers: Math.max(0, Number(item.followers) || 0),
          engagement: Number(item.engagement) || 0,
          lastSyncAt: String(item.lastSyncAt || new Date().toISOString()),
        }))
        .slice(0, 30);
      if (normalized.length > 0) setSocialAccounts(normalized);
    } catch {
      // ignore malformed social storage
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(SOCIAL_STATE_KEY, JSON.stringify(socialAccounts));
    } catch {
      // ignore storage failures
    }
  }, [socialAccounts]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(EMAIL_INTEGRATION_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as EmailIntegration;
      if (!parsed || typeof parsed !== 'object') return;
      setEmailIntegration({
        provider: (['sendgrid', 'mailgun', 'resend', 'smtp'] as EmailIntegration['provider'][]).includes(parsed.provider)
          ? parsed.provider
          : 'resend',
        apiKeyMasked: String(parsed.apiKeyMasked || DEFAULT_EMAIL_INTEGRATION.apiKeyMasked),
        fromEmail: String(parsed.fromEmail || DEFAULT_EMAIL_INTEGRATION.fromEmail),
        domain: String(parsed.domain || DEFAULT_EMAIL_INTEGRATION.domain),
        connected: Boolean(parsed.connected),
        spf: parsed.spf === 'warn' ? 'warn' : 'ok',
        dkim: parsed.dkim === 'warn' ? 'warn' : 'ok',
        queuePending: Math.max(0, Number(parsed.queuePending) || 0),
        sentToday: Math.max(0, Number(parsed.sentToday) || 0),
        bouncedToday: Math.max(0, Number(parsed.bouncedToday) || 0),
        openRate: Math.max(0, Number(parsed.openRate) || 0),
      });
    } catch {
      // ignore malformed integration storage
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(EMAIL_INTEGRATION_KEY, JSON.stringify(emailIntegration));
    } catch {
      // ignore storage failures
    }
  }, [emailIntegration]);

  useEffect(() => {
    let active = true;
    const loadAdminState = async () => {
      try {
        const [state, audit, metrics] = await Promise.all([
          adminService.getState(),
          adminService.getAudit().catch(() => []),
          adminService.getMetrics().catch(() => null),
        ]);
        if (!active) return;

        const nextServices = parseServices(state.services);
        const nextContent = parseContent(state.content);
        const nextTemplates = parseTemplates(state.templates);
        const nextHistory = parseTemplateHistory(state.templateHistory);
        const nextAdmins = parseAdmins(state.admins);
        const nextTests = parseTestHistory(state.testHistory);

        setServices(nextServices.length > 0 ? nextServices : [
          { id: 'svc-auth', name: 'Auth Gateway', status: 'Healthy', owner: 'Ops', uptime: '99.98%' },
          { id: 'svc-ai', name: 'Narrative Engine', status: 'Healthy', owner: 'AI', uptime: '99.87%' },
          { id: 'svc-sync', name: 'Sync Queue', status: 'Degraded', owner: 'Platform', uptime: '98.62%' },
          { id: 'svc-mail', name: 'Mail Dispatch', status: 'Healthy', owner: 'Growth', uptime: '99.91%' },
        ]);
        setContent(nextContent.length > 0 ? nextContent : DEFAULT_CONTENT);
        setTemplates(nextTemplates.length > 0 ? nextTemplates : DEFAULT_TEMPLATES);
        setTemplateHistory(nextHistory);
        if (nextAdmins.length > 0) setAdmins(nextAdmins);
        if (nextTests.length > 0) setTestHistory(nextTests);
        if (metrics) {
          setFinancialMetrics(parseFinancialMetrics(metrics.financial));
          setTechnicalMetrics(parseTechnicalMetrics(metrics.technical));
        } else {
          setFinancialMetrics(parseFinancialMetrics(state.financialMetrics));
          setTechnicalMetrics(parseTechnicalMetrics(state.technicalMetrics));
        }
        setAuditEntries(Array.isArray(audit) ? audit.slice(0, 40) : []);
      } catch {
        if (active) {
          setActionFeedback('Server sync unavailable. Local state is active.');
        }
      } finally {
        if (active) setIsServerStateReady(true);
      }
    };
    loadAdminState();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isServerStateReady) return;
    const timer = window.setTimeout(() => {
      adminService
        .saveState({ services, content, templates, templateHistory, admins, testHistory })
        .catch(() => setActionFeedback('Server sync failed. Changes stay in current session.'));
    }, 700);
    return () => window.clearTimeout(timer);
  }, [isServerStateReady, services, content, templates, templateHistory, admins, testHistory]);

  useEffect(() => {
    if (!actionFeedback) return;
    const timer = window.setTimeout(() => setActionFeedback(null), 5200);
    return () => window.clearTimeout(timer);
  }, [actionFeedback]);

  const totals = useMemo(() => {
    const healthy = services.filter((service) => service.status === 'Healthy').length;
    const degraded = services.filter((service) => service.status === 'Degraded').length;
    const down = services.filter((service) => service.status === 'Down').length;
    return { healthy, degraded, down };
  }, [services]);

  const roleOptions: AdminRole[] = ['viewer', 'operator', 'content_manager', 'finance_manager', 'super_admin'];
  const roleLabelByLang: LangCopy< Record<AdminRole, string>> = {
    en: { viewer: 'Observer', operator: 'Coordinator', content_manager: 'Content Lead', finance_manager: 'Finance Lead', super_admin: 'Super Admin' },
    ru: { viewer: 'Наблюдатель', operator: 'Координатор', content_manager: 'Контент-лид', finance_manager: 'Финансовый лид', super_admin: 'Супер админ' },
    uk: { viewer: 'Спостерігач', operator: 'Координатор', content_manager: 'Контент-лід', finance_manager: 'Фінансовий лід', super_admin: 'Супер адмін' },
    es: { viewer: 'Observador', operator: 'Coordinador', content_manager: 'Lider de contenido', finance_manager: 'Lider financiero', super_admin: 'Super Admin' },
    fr: { viewer: 'Observateur', operator: 'Coordinateur', content_manager: 'Responsable contenu', finance_manager: 'Responsable finance', super_admin: 'Super Admin' },
    de: { viewer: 'Beobachter', operator: 'Koordinator', content_manager: 'Content Lead', finance_manager: 'Finance Lead', super_admin: 'Super Admin' },
    zh: { viewer: '观察者', operator: '协调员', content_manager: '内容负责人', finance_manager: '财务负责人', super_admin: '超级管理员' },
    ja: { viewer: 'オブザーバー', operator: 'コーディネーター', content_manager: 'コンテンツ担当', finance_manager: '財務担当', super_admin: 'スーパー管理者' },
    pt: { viewer: 'Observador', operator: 'Coordenador', content_manager: 'Lider de conteudo', finance_manager: 'Lider financeiro', super_admin: 'Super Admin' },
  };
  const roleLabel = (role: AdminRole) => (getLang(roleLabelByLang, lang) || roleLabelByLang.en)[role];

  const runTechChecks = async () => {
    try {
      const result = await adminService.runTechChecks();
      setTechnicalMetrics(parseTechnicalMetrics(result.technical));
      setTestHistory(parseTestHistory(result.testHistory));
      const audit = await adminService.getAudit().catch(() => []);
      setAuditEntries(Array.isArray(audit) ? audit.slice(0, 40) : []);
      setActionFeedback('Health checks completed.');
    } catch (error) {
      setActionFeedback(error instanceof Error ? error.message : 'Health check failed.');
    }
  };

  const exportAdminData = async (type: 'audit' | 'metrics', format: 'json' | 'csv') => {
    try {
      const blob = await adminService.exportBlob(type, format);
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      downloadBlob(`luna-${type}-${timestamp}.${format}`, blob);
      setActionFeedback(`${type} export downloaded.`);
    } catch (error) {
      setActionFeedback(error instanceof Error ? error.message : 'Export failed.');
    }
  };

  const assignAdminRole = async (member: AdminMember, role: AdminRole) => {
    setAdmins((prev) => prev.map((item) => item.id === member.id ? { ...item, role } : item));
    try {
      await adminService.assignRole(member.email, role);
      setActionFeedback('Admin role updated on server.');
      const audit = await adminService.getAudit().catch(() => []);
      setAuditEntries(Array.isArray(audit) ? audit.slice(0, 40) : []);
    } catch (error) {
      setActionFeedback(error instanceof Error ? error.message : 'Role update failed.');
    }
  };

  const appendTemplateHistory = (template: EmailTemplate, action: TemplateVersion['action']) => {
    const title = resolveLocalizedText(template.title, lang);
    const subject = resolveLocalizedText(template.subject, lang);
    const trigger = resolveLocalizedText(template.trigger, lang);
    const variables = template.variables || inferVariables(title, trigger);
    const entry: TemplateVersion = {
      id: `ver-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      at: new Date().toISOString(),
      action,
      by: session?.name || 'Admin',
      title,
      subject,
      trigger,
      variables,
    };
    setTemplateHistory((prev) => ({
      ...prev,
      [template.id]: [entry, ...(prev[template.id] || [])].slice(0, 20),
    }));
  };

  const buildCampaignText = (item: ContentItem) => {
    const title = resolveLocalizedText(item.title, lang);
    const body = resolveLocalizedText(item.body, lang);
    return [
      `Luna29 Marketing`,
      `Title: ${title}`,
      `Channel: ${channelLabels[item.channel]}`,
      `Status: ${campaignStatusLabels[item.status]}`,
      `Scheduled: ${resolveLocalizedText(item.scheduledAt, lang)}`,
      '',
      body,
    ].join('\n');
  };

  const buildCampaignHtml = (item: ContentItem) => {
    const title = resolveLocalizedText(item.title, lang);
    const body = resolveLocalizedText(item.body, lang);
    return `<section style="border:1px solid #e2e8f0;border-radius:20px;padding:24px;background:#ffffff;max-width:760px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><strong style="font-size:24px;letter-spacing:-0.01em;color:#0f172a">Luna29 Marketing</strong><span style="font-size:12px;color:#7c3aed;font-weight:700">${escapeHtml(channelLabels[item.channel])}</span></div><h1 style="margin:0 0 8px;font-size:28px;color:#0f172a">${escapeHtml(title)}</h1><p style="margin:0 0 12px;color:#64748b">${escapeHtml(campaignStatusLabels[item.status])} • ${escapeHtml(resolveLocalizedText(item.scheduledAt, lang))}</p><p style="margin:0;font-size:16px;line-height:1.7;color:#1e293b">${escapeHtml(body)}</p></section>`;
  };

  const buildEmailHtml = (template: EmailTemplate) => {
    const title = resolveLocalizedText(template.title, lang);
    const subject = resolveLocalizedText(template.subject, lang);
    const preheader = resolveLocalizedText(template.preheader, lang);
    const body = resolveLocalizedText(template.body, lang);
    const variables = (template.variables && template.variables.length > 0)
      ? template.variables
      : inferVariables(title, resolveLocalizedText(template.trigger, lang));
    const variableBadges = variables
      .map((token) => `<span style="display:inline-block;padding:6px 10px;margin:4px 6px 0 0;border-radius:999px;background:#ede9fe;color:#6d28d9;font-size:11px;font-weight:700">${escapeHtml(token)}</span>`)
      .join('');

    return `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${escapeHtml(subject)}</title></head><body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;color:#0f172a"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px"><tr><td align="center"><table role="presentation" width="640" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:28px;border:1px solid #e2e8f0;overflow:hidden"><tr><td style="padding:28px;background:linear-gradient(135deg,#f0f9ff,#f5f3ff)"><div style="display:flex;justify-content:space-between;align-items:center"><div style="font-size:34px;font-weight:800;letter-spacing:-0.02em;color:#7c3aed">Luna29</div><div style="font-size:26px">🌙</div></div><p style="margin:6px 0 0;font-size:12px;letter-spacing:0.24em;text-transform:uppercase;color:#64748b">Luna29 System Email</p></td></tr><tr><td style="padding:28px"><p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:0.2em;color:#64748b">${escapeHtml(preheader)}</p><h1 style="margin:0 0 12px;font-size:30px;line-height:1.2;color:#0f172a">${escapeHtml(title)}</h1><h2 style="margin:0 0 16px;font-size:18px;color:#7c3aed">${escapeHtml(subject)}</h2><p style="margin:0 0 20px;font-size:16px;line-height:1.75;color:#1e293b">${escapeHtml(body)}</p><div style="margin:0 0 20px"><p style="margin:0 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:0.18em;color:#64748b">Variables</p>${variableBadges}</div><a href="#" style="display:inline-block;padding:12px 20px;background:#7c3aed;color:#ffffff;text-decoration:none;border-radius:999px;font-weight:700;font-size:12px;letter-spacing:0.08em;text-transform:uppercase">Open Luna29</a></td></tr><tr><td style="padding:20px 28px;background:#0f172a;color:#cbd5e1"><p style="margin:0;font-size:12px;line-height:1.6">Luna29 — private reflective space for rhythm awareness.</p></td></tr></table></td></tr></table></body></html>`;
  };

  const buildTemplateText = (template: EmailTemplate) => {
    const title = resolveLocalizedText(template.title, lang);
    const subject = resolveLocalizedText(template.subject, lang);
    const preheader = resolveLocalizedText(template.preheader, lang);
    const trigger = resolveLocalizedText(template.trigger, lang);
    const body = resolveLocalizedText(template.body, lang);
    const variables = (template.variables && template.variables.length > 0)
      ? template.variables
      : inferVariables(title, trigger);

    return [
      'Luna29 Email Template',
      `Title: ${title}`,
      `Trigger: ${trigger}`,
      `Subject: ${subject}`,
      `Preheader: ${preheader}`,
      `Variables: ${variables.join(', ')}`,
      '',
      body,
    ].join('\n');
  };

  const reportActionResult = (ok: boolean, okText: string) => {
    setActionFeedback(ok ? okText : copy.feedbackError);
  };

  const handleCopy = async (text: string) => {
    const ok = await copyTextSafely(text);
    reportActionResult(ok, copy.feedbackCopied);
  };

  const handleShare = async (text: string, title: string) => {
    const result = await shareTextSafely(text, title);
    reportActionResult(result !== 'failed', copy.feedbackShared);
  };

  const handleDownload = (filename: string, contentValue: string, mime: string) => {
    try {
      downloadFile(filename, contentValue, mime);
      setActionFeedback(copy.feedbackDownloaded);
    } catch {
      setActionFeedback(copy.feedbackError);
    }
  };

  const handlePrint = (title: string, html: string) => {
    const ok = openPrintPreview(title, html);
    reportActionResult(ok, copy.feedbackPrint);
  };

  const handlePdf = (title: string, html: string) => {
    const ok = openPrintPreview(title, html);
    reportActionResult(ok, copy.feedbackPrint);
  };

  const openTemplatePreview = (template: EmailTemplate) => {
    const title = resolveLocalizedText(template.title, lang);
    setPreview({ title, html: buildEmailHtml(template), text: buildTemplateText(template) });
  };

  const openCampaignPreview = (item: ContentItem) => {
    const title = resolveLocalizedText(item.title, lang);
    setPreview({ title, html: buildCampaignHtml(item), text: buildCampaignText(item) });
  };

  const applyVariablePreset = () => {
    const title = newTemplateTitle.trim();
    const trigger = newTemplateTrigger.trim();
    const variables = inferVariables(title, trigger);
    setNewTemplateVariables(toVariableInput(variables));
  };

  const insertVariableToken = (token: string) => {
    const textarea = templateBodyRef.current;
    if (!textarea) {
      setNewTemplateBody((prev) => `${prev}${prev.endsWith(' ') || prev.length === 0 ? '' : ' '}${token}`);
      return;
    }

    const start = textarea.selectionStart ?? newTemplateBody.length;
    const end = textarea.selectionEnd ?? start;
    const before = newTemplateBody.slice(0, start);
    const after = newTemplateBody.slice(end);
    const needsSpaceBefore = before.length > 0 && !/\s$/.test(before);
    const insertion = `${needsSpaceBefore ? ' ' : ''}${token}`;
    const next = `${before}${insertion}${after}`;
    const nextCaret = before.length + insertion.length;
    setNewTemplateBody(next);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(nextCaret, nextCaret);
    });
  };

  const scheduleCampaign = async () => {
    const title = newCampaignTitle.trim();
    const body = newCampaignBody.trim() || defaultMarketingBody;
    if (!title || isCampaignLocalizing) return;

    setIsCampaignLocalizing(true);
    try {
      const localized = await localizeFields({ title, body }, lang);
      setContent((prev) => [
        {
          id: `cnt-${Date.now()}`,
          title: localized.title,
          body: localized.body,
          channel: newCampaignChannel,
          status: newCampaignStatus,
          scheduledAt: seedLocalizedText('Not set', 'en'),
        },
        ...prev,
      ]);
      setNewCampaignTitle('');
      setNewCampaignBody('');
    } catch {
      setContent((prev) => [
        {
          id: `cnt-${Date.now()}`,
          title: seedLocalizedText(title, lang),
          body: seedLocalizedText(body, lang),
          channel: newCampaignChannel,
          status: newCampaignStatus,
          scheduledAt: seedLocalizedText('Not set', 'en'),
        },
        ...prev,
      ]);
      setNewCampaignTitle('');
      setNewCampaignBody('');
    } finally {
      setIsCampaignLocalizing(false);
    }
  };

  const resetTemplateForm = () => {
    setEditingTemplateId(null);
    setNewTemplateTitle('');
    setNewTemplateTrigger('Manual dispatch');
    setNewTemplateSubject('A calm Luna29 update');
    setNewTemplatePreheader('Gentle insight for your rhythm.');
    setNewTemplateBody('Luna29 note: take one breath, open your map, and choose one small caring step for today.');
    setNewTemplateVariables('{{first_name}}, {{app_link}}, {{support_link}}');
  };

  const loadTemplateToForm = (template: EmailTemplate) => {
    const title = resolveLocalizedText(template.title, lang);
    const trigger = resolveLocalizedText(template.trigger, lang);
    const subject = resolveLocalizedText(template.subject, lang);
    const preheader = resolveLocalizedText(template.preheader, lang);
    const body = resolveLocalizedText(template.body, lang);
    const vars = (template.variables && template.variables.length > 0)
      ? template.variables
      : inferVariables(title, trigger);

    setEditingTemplateId(template.id);
    setNewTemplateTitle(title);
    setNewTemplateTrigger(trigger);
    setNewTemplateSubject(subject);
    setNewTemplatePreheader(preheader);
    setNewTemplateBody(body);
    setNewTemplateVariables(toVariableInput(vars));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const duplicateTemplate = (template: EmailTemplate) => {
    const title = resolveLocalizedText(template.title, lang);
    const trigger = resolveLocalizedText(template.trigger, lang);
    const subject = resolveLocalizedText(template.subject, lang);
    const preheader = resolveLocalizedText(template.preheader, lang);
    const body = resolveLocalizedText(template.body, lang);
    const vars = (template.variables && template.variables.length > 0)
      ? template.variables
      : inferVariables(title, trigger);

    const duplicated: EmailTemplate = {
      id: `tpl-${Date.now()}`,
      title: seedLocalizedText(`${title} Copy`, lang),
      trigger: seedLocalizedText(trigger, lang),
      subject: seedLocalizedText(subject, lang),
      preheader: seedLocalizedText(preheader, lang),
      body: seedLocalizedText(body, lang),
      variables: vars,
      updatedBy: session?.name || 'Admin',
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    setTemplates((prev) => [duplicated, ...prev]);
    appendTemplateHistory(duplicated, 'duplicated');
    setActionFeedback('Template duplicated.');
  };

  const deleteTemplate = (template: EmailTemplate) => {
    const title = resolveLocalizedText(template.title, lang);
    const confirmed = window.confirm(`Delete template "${title}"? This action cannot be undone.`);
    if (!confirmed) return;
    appendTemplateHistory(template, 'deleted');
    setTemplates((prev) => prev.filter((item) => item.id !== template.id));
    if (editingTemplateId === template.id) {
      resetTemplateForm();
    }
    if (expandedHistoryId === template.id) {
      setExpandedHistoryId(null);
    }
    setActionFeedback('Template deleted.');
  };

  const addTemplate = async () => {
    const title = newTemplateTitle.trim();
    if (!title || isTemplateLocalizing) return;

    setIsTemplateLocalizing(true);
    const triggerValue = newTemplateTrigger.trim() || 'Manual dispatch';
    const parsedVariables = parseVariableInput(newTemplateVariables);
    const variables = parsedVariables.length > 0 ? parsedVariables : inferVariables(title, triggerValue);
    try {
      const localized = await localizeFields(
        {
          title,
          trigger: triggerValue,
          subject: newTemplateSubject.trim() || 'Luna29 update',
          preheader: newTemplatePreheader.trim() || 'Luna29 email',
          body: newTemplateBody.trim() || defaultTemplateBody,
        },
        lang
      );

      if (editingTemplateId) {
        let updatedTemplate: EmailTemplate | null = null;
        setTemplates((prev) => prev.map((template) => {
          if (template.id !== editingTemplateId) return template;
          const nextTemplate: EmailTemplate = {
            ...template,
            title: localized.title,
            trigger: localized.trigger,
            subject: localized.subject,
            preheader: localized.preheader,
            body: localized.body,
            variables,
            updatedBy: session?.name || 'Admin',
            updatedAt: new Date().toISOString().slice(0, 10),
          };
          updatedTemplate = nextTemplate;
          return nextTemplate;
        }));
        if (updatedTemplate) appendTemplateHistory(updatedTemplate, 'updated');
        setActionFeedback('Template updated.');
      } else {
        const createdTemplate: EmailTemplate = {
          id: `tpl-${Date.now()}`,
          title: localized.title,
          trigger: localized.trigger,
          subject: localized.subject,
          preheader: localized.preheader,
          body: localized.body,
          variables,
          updatedBy: session?.name || 'Admin',
          updatedAt: new Date().toISOString().slice(0, 10),
        };
        setTemplates((prev) => [createdTemplate, ...prev]);
        appendTemplateHistory(createdTemplate, 'created');
        setActionFeedback('Template created.');
      }

      resetTemplateForm();
    } catch {
      if (editingTemplateId) {
        let updatedTemplate: EmailTemplate | null = null;
        setTemplates((prev) => prev.map((template) => {
          if (template.id !== editingTemplateId) return template;
          const nextTemplate: EmailTemplate = {
            ...template,
            title: seedLocalizedText(title, lang),
            trigger: seedLocalizedText(triggerValue, lang),
            subject: seedLocalizedText(newTemplateSubject.trim() || 'Luna29 update', lang),
            preheader: seedLocalizedText(newTemplatePreheader.trim() || 'Luna29 email', lang),
            body: seedLocalizedText(newTemplateBody.trim() || defaultTemplateBody, lang),
            variables,
            updatedBy: session?.name || 'Admin',
            updatedAt: new Date().toISOString().slice(0, 10),
          };
          updatedTemplate = nextTemplate;
          return nextTemplate;
        }));
        if (updatedTemplate) appendTemplateHistory(updatedTemplate, 'updated');
        setActionFeedback('Template updated.');
      } else {
        const createdTemplate: EmailTemplate = {
          id: `tpl-${Date.now()}`,
          title: seedLocalizedText(title, lang),
          trigger: seedLocalizedText(triggerValue, lang),
          subject: seedLocalizedText(newTemplateSubject.trim() || 'Luna29 update', lang),
          preheader: seedLocalizedText(newTemplatePreheader.trim() || 'Luna29 email', lang),
          body: seedLocalizedText(newTemplateBody.trim() || defaultTemplateBody, lang),
          variables,
          updatedBy: session?.name || 'Admin',
          updatedAt: new Date().toISOString().slice(0, 10),
        };
        setTemplates((prev) => [createdTemplate, ...prev]);
        appendTemplateHistory(createdTemplate, 'created');
        setActionFeedback('Template created.');
      }
      resetTemplateForm();
    } finally {
      setIsTemplateLocalizing(false);
    }
  };

  const installAdvancedTemplatePack = () => {
    const existingIds = new Set(templates.map((item) => item.id));
    const toInstall = TEMPLATE_PACK_ADVANCED.filter((item) => !existingIds.has(item.id));
    if (toInstall.length === 0) {
      setActionFeedback('Advanced template pack already installed.');
      return;
    }
    setTemplates((prev) => [...toInstall, ...prev]);
    toInstall.forEach((template) => appendTemplateHistory(template, 'created'));
    setActionFeedback(`Installed ${toInstall.length} new templates.`);
  };

  const addStorageFolder = () => {
    const name = newStorageName.trim() || `Storage ${storageBuckets.length + 1}`;
    const quota = Math.max(1, Number(newStorageQuota) || 8);
    const next: StorageBucket = {
      id: `st-${Date.now()}`,
      name,
      usedGb: 0,
      quotaGb: quota,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    setStorageBuckets((prev) => [next, ...prev].slice(0, 50));
    setNewStorageName('');
    setNewStorageQuota('8');
    setActionFeedback('Storage folder created.');
  };

  const sendInvite = async () => {
    const email = inviteEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      setActionFeedback('Enter a valid email to send invite.');
      return;
    }
    const invite: AdminInvite = {
      id: `inv-${Date.now()}`,
      email,
      role: inviteRole,
      status: 'sent',
      sentAt: new Date().toISOString(),
    };
    setInvites((prev) => [invite, ...prev].slice(0, 100));
    setInviteEmail('');
    setActionFeedback(`Invite sent to ${email}.`);
    const inviteLink = `${window.location.origin}/?invite=${encodeURIComponent(invite.id)}`;
    await copyTextSafely(inviteLink).catch(() => undefined);
  };

  const toggleSocialConnection = (accountId: string) => {
    let nextConnected = false;
    setSocialAccounts((prev) =>
      prev.map((item) => {
        if (item.id !== accountId) return item;
        nextConnected = !item.connected;
        return {
          ...item,
          connected: nextConnected,
          lastSyncAt: new Date().toISOString(),
        };
      })
    );
    setActionFeedback(nextConnected ? channelsCopy.connectedNow : channelsCopy.disconnectedNow);
  };

  const syncSocialChannel = (accountId: string) => {
    setSocialAccounts((prev) =>
      prev.map((item) => {
        if (item.id !== accountId) return item;
        if (!item.connected) return item;
        const nextFollowers = item.followers + Math.max(3, Math.round(Math.random() * 35));
        const nextEngagement = Number(Math.max(0.8, Math.min(12, item.engagement + (Math.random() * 0.8 - 0.2))).toFixed(1));
        return {
          ...item,
          followers: nextFollowers,
          engagement: nextEngagement,
          lastSyncAt: new Date().toISOString(),
        };
      })
    );
    setActionFeedback('Social channel synced.');
  };

  const addCustomSocialChannel = () => {
    const label = customChannelName.trim();
    const handle = customChannelHandle.trim();
    if (!label) {
      setActionFeedback('Enter channel name.');
      return;
    }
    const next: SocialAccount = {
      id: `soc-custom-${Date.now()}`,
      platform: 'custom',
      label,
      handle: handle || `@${label.toLowerCase().replace(/\s+/g, '')}`,
      connected: false,
      followers: 0,
      engagement: 0,
      lastSyncAt: new Date().toISOString(),
    };
    setSocialAccounts((prev) => [next, ...prev].slice(0, 30));
    setCustomChannelName('');
    setCustomChannelHandle('');
    setActionFeedback('Custom channel added.');
  };

  const testEmailIntegration = () => {
    const providerBoost = emailIntegration.provider === 'smtp' ? -0.4 : 0.5;
    const spfOk = Math.random() > 0.12;
    const dkimOk = Math.random() > 0.16;
    setEmailIntegration((prev) => ({
      ...prev,
      connected: true,
      spf: spfOk ? 'ok' : 'warn',
      dkim: dkimOk ? 'ok' : 'warn',
      queuePending: Math.max(0, prev.queuePending + Math.round(Math.random() * 5 - 2)),
      sentToday: prev.sentToday + Math.round(Math.random() * 26 + 8),
      bouncedToday: Math.max(0, prev.bouncedToday + Math.round(Math.random() * 3 - 1)),
      openRate: Number(Math.max(18, Math.min(72, prev.openRate + providerBoost + (Math.random() * 0.8 - 0.3))).toFixed(1)),
    }));
    setActionFeedback('Email integration test completed.');
  };

  const connectAllSocialChannels = () => {
    setSocialAccounts((prev) =>
      prev.map((item) => ({
        ...item,
        connected: true,
        lastSyncAt: new Date().toISOString(),
      }))
    );
    setActionFeedback('All channels connected.');
  };

  const syncAllSocialChannels = () => {
    setSocialAccounts((prev) =>
      prev.map((item) => {
        if (!item.connected) return item;
        return {
          ...item,
          followers: item.followers + Math.max(3, Math.round(Math.random() * 45)),
          engagement: Number(Math.max(0.8, Math.min(12, item.engagement + (Math.random() * 1 - 0.2))).toFixed(1)),
          lastSyncAt: new Date().toISOString(),
        };
      })
    );
    setActionFeedback('All connected channels synced.');
  };

  const exportSocialAnalyticsCsv = () => {
    const header = ['platform', 'label', 'handle', 'connected', 'followers', 'engagement', 'lastSyncAt'];
    const rows = socialAccounts.map((item) =>
      [item.platform, item.label, item.handle, item.connected ? 'yes' : 'no', String(item.followers), String(item.engagement), item.lastSyncAt]
        .map((token) => `"${String(token).replace(/"/g, '""')}"`)
        .join(',')
    );
    const csv = [header.join(','), ...rows].join('\n');
    const stamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    downloadFile(`luna-social-analytics-${stamp}.csv`, csv, 'text/csv;charset=utf-8');
    setActionFeedback('Social analytics CSV exported.');
  };

  const simulateUpload = (bucketId: string) => {
    setStorageBuckets((prev) =>
      prev.map((bucket) => {
        if (bucket.id !== bucketId) return bucket;
        const delta = Number((Math.random() * 0.65 + 0.1).toFixed(2));
        const usedGb = Math.min(bucket.quotaGb, Number((bucket.usedGb + delta).toFixed(2)));
        return { ...bucket, usedGb, updatedAt: new Date().toISOString().slice(0, 10) };
      })
    );
    setActionFeedback('Upload simulation completed.');
  };

  const archiveStorage = (bucketId: string) => {
    setStorageBuckets((prev) =>
      prev.map((bucket) => {
        if (bucket.id !== bucketId) return bucket;
        const usedGb = Number(Math.max(0, bucket.usedGb * 0.82).toFixed(2));
        return { ...bucket, usedGb, updatedAt: new Date().toISOString().slice(0, 10) };
      })
    );
    setActionFeedback('Archive completed. Storage usage optimized.');
  };

  return (
    <article className="max-w-7xl mx-auto space-y-12 pb-40 animate-in fade-in duration-700">
      <header className="p-8 md:p-12 rounded-[3rem] bg-white/75 dark:bg-[#111c33]/72 backdrop-blur-xl border border-white/60 dark:border-white/12 shadow-[0_26px_80px_rgba(17,24,39,0.16)] dark:shadow-[0_28px_80px_rgba(2,6,23,0.55)] space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button onClick={onBack} className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-luna-purple transition-all">← {copy.dashboard}</button>
          <button onClick={onLogout} className="px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-luna-purple transition-colors">{copy.logout}</button>
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight uppercase text-slate-900 dark:text-slate-100">Luna29 Care Studio</h1>
          <p className="text-slate-600 dark:text-slate-300 font-semibold">Private space for team flow, content quality, account stability, and service wellbeing.</p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <span className="px-4 py-2 rounded-full bg-luna-purple/10 text-luna-purple text-[10px] font-black uppercase tracking-widest">{session?.email || copy.noSession}</span>
          <span className="px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest">{copy.role}: {roleLabel((session?.role || 'viewer') as AdminRole)}</span>
          <select
            value={session?.role || 'viewer'}
            onChange={(e) => onRoleChange(e.target.value as AdminRole)}
            className="px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[10px] font-black uppercase tracking-widest"
          >
            {roleOptions.map((role) => (
              <option key={role} value={role}>{roleLabel(role)}</option>
            ))}
          </select>
        </div>
        {actionFeedback && <p className="text-xs font-bold text-luna-purple">{actionFeedback}</p>}
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-[2rem] bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200/60 dark:border-emerald-700/30">
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-300">{statusLabels.Healthy}</p>
          <p className="text-4xl font-black text-emerald-900 dark:text-emerald-100">{totals.healthy}</p>
        </div>
        <div className="p-6 rounded-[2rem] bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-700/30">
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-300">{statusLabels.Degraded}</p>
          <p className="text-4xl font-black text-amber-900 dark:text-amber-100">{totals.degraded}</p>
        </div>
        <div className="p-6 rounded-[2rem] bg-rose-50 dark:bg-rose-900/20 border border-rose-200/60 dark:border-rose-700/30">
          <p className="text-[10px] font-black uppercase tracking-widest text-rose-700 dark:text-rose-300">{statusLabels.Down}</p>
          <p className="text-4xl font-black text-rose-900 dark:text-rose-100">{totals.down}</p>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="space-y-4 p-8 rounded-[2.5rem] bg-white/75 dark:bg-[#111c33]/72 backdrop-blur-xl border border-white/60 dark:border-white/12 shadow-luna-rich">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-black uppercase tracking-wider">{channelsCopy.socialTitle}</h2>
            <span className="px-3 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-300">
              {socialTotals.connected}/{socialAccounts.length} {channelsCopy.statusConnected}
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{channelsCopy.socialHint}</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={connectAllSocialChannels} className="px-3 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest">
              Connect all
            </button>
            <button type="button" onClick={syncAllSocialChannels} className="px-3 py-2 rounded-full bg-luna-purple text-white text-[10px] font-black uppercase tracking-widest">
              Sync all
            </button>
            <button type="button" onClick={exportSocialAnalyticsCsv} className="px-3 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest">
              Export analytics CSV
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50">
              <p className="text-[10px] uppercase tracking-widest text-slate-500">{channelsCopy.followers}</p>
              <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{socialTotals.totalFollowers.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50">
              <p className="text-[10px] uppercase tracking-widest text-slate-500">{channelsCopy.engagement}</p>
              <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{socialTotals.avgEngagement}%</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50">
              <p className="text-[10px] uppercase tracking-widest text-slate-500">{channelsCopy.statusConnected}</p>
              <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{socialTotals.connected}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              value={customChannelName}
              onChange={(e) => setCustomChannelName(e.target.value)}
              placeholder={channelsCopy.channelName}
              className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
            />
            <input
              value={customChannelHandle}
              onChange={(e) => setCustomChannelHandle(e.target.value)}
              placeholder={channelsCopy.handle}
              className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
            />
            <button type="button" onClick={addCustomSocialChannel} className="md:col-span-2 w-full px-4 py-3 rounded-2xl bg-luna-purple text-white text-[10px] font-black uppercase tracking-widest text-center whitespace-normal leading-snug">
              {channelsCopy.addChannel}
            </button>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50">
            <p className="text-[10px] uppercase tracking-widest text-slate-500">Top channel by engagement</p>
            {socialAccounts.length > 0 ? (
              <p className="mt-1 text-sm font-bold text-slate-700 dark:text-slate-200">
                {[...socialAccounts].sort((a, b) => b.engagement - a.engagement)[0].label} · {[...socialAccounts].sort((a, b) => b.engagement - a.engagement)[0].engagement}%
              </p>
            ) : (
              <p className="mt-1 text-sm text-slate-500">No channels yet.</p>
            )}
            <div className="mt-3 grid grid-cols-6 gap-2 items-end h-16">
              {socialAccounts.slice(0, 6).map((item) => (
                <div key={`eng-${item.id}`} className="rounded-lg bg-slate-200 dark:bg-slate-700 overflow-hidden h-full flex items-end">
                  <div className="w-full bg-gradient-to-t from-luna-purple to-luna-teal" style={{ height: `${Math.max(8, Math.min(100, item.engagement * 8))}%` }} />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-3 max-h-80 overflow-auto pr-1">
            {socialAccounts.map((account) => (
              <div key={account.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-black text-sm">{account.label}</p>
                    <p className="text-xs text-slate-500">{account.handle}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${account.connected ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                    {account.connected ? channelsCopy.statusConnected : channelsCopy.statusDisconnected}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <p>{channelsCopy.followers}: <strong>{account.followers.toLocaleString()}</strong></p>
                  <p>{channelsCopy.engagement}: <strong>{account.engagement}%</strong></p>
                  <p>Sync: <strong>{new Date(account.lastSyncAt).toLocaleString()}</strong></p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => toggleSocialConnection(account.id)} className="px-3 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest">
                    {account.connected ? channelsCopy.disconnect : channelsCopy.connect}
                  </button>
                  <button type="button" onClick={() => syncSocialChannel(account.id)} disabled={!account.connected} className="px-3 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest disabled:opacity-50">
                    {channelsCopy.syncNow}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 p-8 rounded-[2.5rem] bg-white/75 dark:bg-[#111c33]/72 backdrop-blur-xl border border-white/60 dark:border-white/12 shadow-luna-rich">
          <h2 className="text-xl font-black uppercase tracking-wider">{channelsCopy.emailTitle}</h2>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{channelsCopy.emailHint}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {channelsCopy.provider}
              <select
                value={emailIntegration.provider}
                onChange={(e) => setEmailIntegration((prev) => ({ ...prev, provider: e.target.value as EmailIntegration['provider'] }))}
                className="mt-1 w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
              >
                <option value="resend">Resend</option>
                <option value="sendgrid">SendGrid</option>
                <option value="mailgun">Mailgun</option>
                <option value="smtp">SMTP</option>
              </select>
            </label>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
              API Key
              <input
                value={emailIntegration.apiKeyMasked}
                onChange={(e) => setEmailIntegration((prev) => ({ ...prev, apiKeyMasked: e.target.value }))}
                className="mt-1 w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
              />
            </label>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {channelsCopy.fromEmail}
              <input
                value={emailIntegration.fromEmail}
                onChange={(e) => setEmailIntegration((prev) => ({ ...prev, fromEmail: e.target.value }))}
                className="mt-1 w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
              />
            </label>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {channelsCopy.domain}
              <input
                value={emailIntegration.domain}
                onChange={(e) => setEmailIntegration((prev) => ({ ...prev, domain: e.target.value }))}
                className="mt-1 w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
              />
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={testEmailIntegration} className="px-4 py-2 rounded-full bg-luna-teal text-white text-[10px] font-black uppercase tracking-widest">
              {channelsCopy.testConnection}
            </button>
            <button type="button" onClick={() => setEmailIntegration((prev) => ({ ...prev, connected: !prev.connected }))} className="px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest">
              {emailIntegration.connected ? channelsCopy.disconnect : channelsCopy.connect}
            </button>
            <span className={`px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${emailIntegration.connected ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
              {emailIntegration.connected ? channelsCopy.statusConnected : channelsCopy.statusDisconnected}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50"><p className="text-[10px] uppercase tracking-widest text-slate-500">{channelsCopy.queue}</p><p className="text-lg font-black">{emailIntegration.queuePending}</p></div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50"><p className="text-[10px] uppercase tracking-widest text-slate-500">{channelsCopy.sentToday}</p><p className="text-lg font-black">{emailIntegration.sentToday.toLocaleString()}</p></div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50"><p className="text-[10px] uppercase tracking-widest text-slate-500">{channelsCopy.bounced}</p><p className="text-lg font-black">{emailIntegration.bouncedToday}</p></div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50"><p className="text-[10px] uppercase tracking-widest text-slate-500">{channelsCopy.openRate}</p><p className="text-lg font-black">{emailIntegration.openRate}%</p></div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50">
              <p className="text-[10px] uppercase tracking-widest text-slate-500">{channelsCopy.spf}/{channelsCopy.dkim}</p>
              <p className="text-sm font-black">{emailIntegration.spf.toUpperCase()} · {emailIntegration.dkim.toUpperCase()}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-luna-purple to-luna-teal" style={{ width: `${Math.min(100, emailIntegration.openRate)}%` }} />
            </div>
            <p className="text-xs text-slate-500">Delivery quality visualization based on open rate and bounce trends.</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="space-y-4 p-8 rounded-[2.5rem] bg-white/75 dark:bg-[#111c33]/72 backdrop-blur-xl border border-white/60 dark:border-white/12 shadow-luna-rich">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-black uppercase tracking-wider">{adminUi.storageTitle}</h2>
            <span className="px-3 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-300">
              {storageTotals.used.toFixed(1)}GB / {storageTotals.quota.toFixed(1)}GB
            </span>
          </div>
          <div className="space-y-2">
            <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-luna-purple to-luna-teal" style={{ width: `${Math.min(storageTotals.utilization, 100)}%` }} />
            </div>
            <p className="text-xs font-semibold text-slate-500">Total utilization: {storageTotals.utilization}%</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_120px_auto] gap-3">
            <input
              value={newStorageName}
              onChange={(e) => setNewStorageName(e.target.value)}
              placeholder="Folder name"
              className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
            />
            <input
              value={newStorageQuota}
              onChange={(e) => setNewStorageQuota(e.target.value)}
              placeholder="Quota GB"
              className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
            />
            <button type="button" onClick={addStorageFolder} className="px-5 py-3 rounded-2xl bg-luna-teal text-white text-[10px] font-black uppercase tracking-widest">
              {adminUi.addFolder}
            </button>
          </div>
          <div className="space-y-3 max-h-80 overflow-auto pr-1">
            {storageBuckets.map((bucket) => {
              const usage = Math.round((bucket.usedGb / bucket.quotaGb) * 100);
              return (
                <div key={bucket.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-black text-sm">{bucket.name}</p>
                    <p className="text-xs text-slate-500">{bucket.usedGb.toFixed(2)}GB / {bucket.quotaGb.toFixed(2)}GB</p>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div className={`h-full ${usage > 85 ? 'bg-rose-500' : 'bg-luna-purple'}`} style={{ width: `${Math.min(usage, 100)}%` }} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => simulateUpload(bucket.id)} className="px-3 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest">Upload Sample</button>
                    <button onClick={() => archiveStorage(bucket.id)} className="px-3 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest">Archive 18%</button>
                    <button
                      onClick={() => {
                        setStorageBuckets((prev) => prev.filter((item) => item.id !== bucket.id));
                        setActionFeedback('Storage folder removed.');
                      }}
                      className="px-3 py-2 rounded-full border border-rose-300 text-rose-600 text-[10px] font-black uppercase tracking-widest"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4 p-8 rounded-[2.5rem] bg-white/75 dark:bg-[#111c33]/72 backdrop-blur-xl border border-white/60 dark:border-white/12 shadow-luna-rich">
          <h2 className="text-xl font-black uppercase tracking-wider">Live Operations</h2>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Run quick actions to keep admin services responsive and clean.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => {
                setTestHistory((prev) => [`Indexes rebuilt: PASS (${new Date().toLocaleString()})`, ...prev].slice(0, 100));
                setActionFeedback('Content indexes rebuilt.');
              }}
              className="px-4 py-3 rounded-2xl bg-luna-purple text-white text-[10px] font-black uppercase tracking-widest"
            >
              Rebuild Indexes
            </button>
            <button
              onClick={() => {
                setTestHistory((prev) => [`Template cache warmed: PASS (${new Date().toLocaleString()})`, ...prev].slice(0, 100));
                setActionFeedback('Template cache warmed.');
              }}
              className="px-4 py-3 rounded-2xl bg-luna-teal text-white text-[10px] font-black uppercase tracking-widest"
            >
              Warm Cache
            </button>
            <button
              onClick={() => {
                setServices((prev) => prev.map((item) => ({ ...item, status: 'Healthy' })));
                setActionFeedback('All services moved to Healthy baseline.');
              }}
              className="px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest"
            >
              Normalize Services
            </button>
            <button
              onClick={() => {
                setAuditEntries((prev) => (prev.length > 1 ? prev.slice(0, Math.max(1, Math.floor(prev.length * 0.7))) : prev));
                setActionFeedback('Audit log compressed.');
              }}
              className="px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest"
            >
              Compress Log
            </button>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Ops Tip</p>
            <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
              Keep storage below 80% and warm template cache after large content updates to avoid admin slowdowns.
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="space-y-4 p-8 rounded-[2.5rem] bg-white/75 dark:bg-[#111c33]/72 backdrop-blur-xl border border-white/60 dark:border-white/12 shadow-luna-rich">
          <h2 className="text-xl font-black uppercase tracking-wider">Service Health</h2>
          <div className="space-y-3">
            {services.map((service) => (
              <div key={service.id} className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50">
                <div>
                  <p className="font-black text-sm">{service.name}</p>
                  <p className="text-xs text-slate-500">Owner: {service.owner} • Uptime: {service.uptime}</p>
                </div>
                <select
                  value={service.status}
                  onChange={(e) => setServices((prev) => prev.map((item) => item.id === service.id ? { ...item, status: e.target.value as ServiceStatus } : item))}
                  className="text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  <option value="Healthy">{statusLabels.Healthy}</option>
                  <option value="Degraded">{statusLabels.Degraded}</option>
                  <option value="Down">{statusLabels.Down}</option>
                </select>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 p-8 rounded-[2.5rem] bg-white/75 dark:bg-[#111c33]/72 backdrop-blur-xl border border-white/60 dark:border-white/12 shadow-luna-rich">
          <h2 className="text-xl font-black uppercase tracking-wider">Content Flow</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              value={newCampaignTitle}
              onChange={(e) => setNewCampaignTitle(e.target.value)}
              placeholder={copy.campaignPlaceholder}
              className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
            />
            <select
              value={newCampaignChannel}
              onChange={(e) => setNewCampaignChannel(e.target.value as ContentItem['channel'])}
              className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm"
            >
              <option value="Email">Email</option>
              <option value="Push">Push</option>
              <option value="Telegram">Telegram</option>
              <option value="Instagram">Instagram</option>
            </select>
            <textarea
              value={newCampaignBody}
              onChange={(e) => setNewCampaignBody(e.target.value)}
              placeholder={copy.campaignBodyPlaceholder}
              rows={3}
              className="md:col-span-2 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
            />
            <select
              value={newCampaignStatus}
              onChange={(e) => setNewCampaignStatus(e.target.value as ContentItem['status'])}
              className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm"
            >
              <option value="Draft">Draft</option>
              <option value="Approved">Approved</option>
              <option value="Scheduled">Scheduled</option>
            </select>
            <button onClick={scheduleCampaign} disabled={isCampaignLocalizing} className="px-5 py-3 rounded-2xl bg-luna-purple text-white text-[10px] font-black uppercase tracking-widest disabled:opacity-60">
              {isCampaignLocalizing ? copy.autoTranslating : copy.add}
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-auto pr-1">
            {content.map((item) => {
              const title = resolveLocalizedText(item.title, lang);
              const text = buildCampaignText(item);
              const html = buildCampaignHtml(item);
              return (
                <div key={item.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50 space-y-2">
                  <p className="font-black text-sm">{title}</p>
                  <p className="text-xs text-slate-500">{copy.channel}: {channelLabels[item.channel]} • {copy.status}: {campaignStatusLabels[item.status]} • {resolveLocalizedText(item.scheduledAt, lang)}</p>
                  <p className="text-xs text-slate-600 line-clamp-2">{resolveLocalizedText(item.body, lang)}</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button onClick={() => openCampaignPreview(item)} className="px-3 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest">{copy.preview}</button>
                    <button onClick={() => handleCopy(text)} className="px-3 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest">{copy.copyAction}</button>
                    <button onClick={() => handleShare(text, title)} className="px-3 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest">{copy.shareAction}</button>
                    <button onClick={() => handlePdf(title, html)} className="px-3 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest">{copy.pdfAction}</button>
                    <button onClick={() => handleDownload(`${item.id}.txt`, text, 'text/plain;charset=utf-8')} className="px-3 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest">{copy.downloadAction}</button>
                    <button onClick={() => handlePrint(title, html)} className="px-3 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest">{copy.printAction}</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="space-y-4 p-8 rounded-[2.5rem] bg-white/75 dark:bg-[#111c33]/72 backdrop-blur-xl border border-white/60 dark:border-white/12 shadow-luna-rich">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-black uppercase tracking-wider">Message Templates</h2>
            <button
              type="button"
              onClick={installAdvancedTemplatePack}
              className="px-4 py-2 rounded-full bg-luna-purple/10 border border-luna-purple/35 text-luna-purple text-[10px] font-black uppercase tracking-widest hover:bg-luna-purple/20 transition-colors"
            >
              Install Advanced Pack
            </button>
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-300">{adminUi.previewHint}</p>
          <div className="px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Preview state</p>
            <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">{preview?.title || adminUi.noPreview}</p>
          </div>
          {editingTemplateId && (
            <div className="px-4 py-3 rounded-2xl bg-luna-purple/10 border border-luna-purple/30 flex items-center justify-between gap-3">
              <p className="text-xs font-black text-luna-purple uppercase tracking-widest">Edit mode active</p>
              <button
                type="button"
                onClick={resetTemplateForm}
                className="px-3 py-2 rounded-full border border-luna-purple/40 text-[10px] font-black uppercase tracking-widest text-luna-purple hover:bg-luna-purple/10"
              >
                Cancel edit
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              value={newTemplateTitle}
              onChange={(e) => setNewTemplateTitle(e.target.value)}
              placeholder={copy.templatePlaceholder}
              className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
            />
            <input
              value={newTemplateTrigger}
              onChange={(e) => setNewTemplateTrigger(e.target.value)}
              placeholder={copy.triggerPlaceholder}
              className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
            />
            <input
              value={newTemplateSubject}
              onChange={(e) => setNewTemplateSubject(e.target.value)}
              placeholder={copy.subjectPlaceholder}
              className="md:col-span-2 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
            />
            <input
              value={newTemplatePreheader}
              onChange={(e) => setNewTemplatePreheader(e.target.value)}
              placeholder={copy.preheaderPlaceholder}
              className="md:col-span-2 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
            />
            <textarea
              ref={templateBodyRef}
              value={newTemplateBody}
              onChange={(e) => setNewTemplateBody(e.target.value)}
              placeholder={copy.templateBodyPlaceholder}
              rows={4}
              className="md:col-span-2 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
            />
            <input
              value={newTemplateVariables}
              onChange={(e) => setNewTemplateVariables(e.target.value)}
              placeholder="{{first_name}}, {{app_link}}, {{support_link}}"
              className="md:col-span-2 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
            />
            <button
              onClick={applyVariablePreset}
              type="button"
              className="md:col-span-2 px-5 py-3 rounded-2xl border border-luna-purple/40 bg-luna-purple/10 text-luna-purple text-[10px] font-black uppercase tracking-widest hover:bg-luna-purple/15 transition-colors"
            >
              Use Variables Preset
            </button>
            <div className="md:col-span-2 flex flex-wrap gap-2">
              {availableVariableTokens.map((token) => (
                <button
                  key={`insert-${token}`}
                  type="button"
                  onClick={() => insertVariableToken(token)}
                  className="px-3 py-2 rounded-full bg-luna-teal/10 text-luna-teal border border-luna-teal/30 text-[10px] font-black tracking-wide hover:bg-luna-teal/20 transition-colors"
                >
                  Add {token}
                </button>
              ))}
            </div>
            <button onClick={addTemplate} disabled={isTemplateLocalizing} className="md:col-span-2 px-5 py-3 rounded-2xl bg-luna-teal text-white text-[10px] font-black uppercase tracking-widest disabled:opacity-60">
              {isTemplateLocalizing ? copy.autoTranslating : editingTemplateId ? 'Save Changes' : copy.create}
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-auto pr-1">
            {templates.map((template) => {
              const title = resolveLocalizedText(template.title, lang);
              const html = buildEmailHtml(template);
              const text = buildTemplateText(template);
              const vars = (template.variables && template.variables.length > 0)
                ? template.variables
                : inferVariables(title, resolveLocalizedText(template.trigger, lang));
              return (
                <div key={template.id} className="p-4 rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800/60 border border-luna-purple/20 dark:border-luna-purple/30 space-y-2">
                  <p className="font-black text-sm">{title}</p>
                  <p className="text-xs text-slate-500">{copy.trigger}: {resolveLocalizedText(template.trigger, lang)}</p>
                  <p className="text-xs text-slate-500">{copy.subject}: {resolveLocalizedText(template.subject, lang)}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {vars.map((token) => (
                      <span key={`${template.id}-${token}`} className="px-2 py-1 rounded-full bg-luna-purple/10 text-luna-purple text-[10px] font-black tracking-wide">
                        {token}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400">{copy.updatedBy} {template.updatedBy} {copy.onDate} {template.updatedAt}</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button onClick={() => openTemplatePreview(template)} className="px-3 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest">{copy.preview}</button>
                    <button onClick={() => loadTemplateToForm(template)} className="px-3 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest">Edit</button>
                    <button onClick={() => duplicateTemplate(template)} className="px-3 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest">Duplicate</button>
                    <button onClick={() => setExpandedHistoryId((prev) => prev === template.id ? null : template.id)} className="px-3 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest">History</button>
                    <button onClick={() => deleteTemplate(template)} className="px-3 py-2 rounded-full border border-rose-300 text-rose-600 text-[10px] font-black uppercase tracking-widest">Delete</button>
                    <button onClick={() => handleCopy(text)} className="px-3 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest">{copy.copyAction}</button>
                    <button onClick={() => handleShare(text, title)} className="px-3 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest">{copy.shareAction}</button>
                    <button onClick={() => handlePdf(title, html)} className="px-3 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest">{copy.pdfAction}</button>
                    <button onClick={() => handleDownload(`${template.id}.html`, html, 'text/html;charset=utf-8')} className="px-3 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest">{copy.downloadAction}</button>
                    <button onClick={() => handlePrint(title, html)} className="px-3 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest">{copy.printAction}</button>
                  </div>
                  {expandedHistoryId === template.id && (
                    <div className="mt-2 p-3 rounded-xl border border-slate-200/70 dark:border-slate-700/50 bg-white/70 dark:bg-slate-900/40 space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Change History</p>
                      {(templateHistory[template.id] || []).length === 0 ? (
                        <p className="text-xs text-slate-400">No updates yet.</p>
                      ) : (
                        (templateHistory[template.id] || []).map((entry) => (
                          <div key={entry.id} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50">
                            <p className="text-[10px] font-black uppercase tracking-widest text-luna-purple">
                              {entry.action} • {new Date(entry.at).toLocaleString()}
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-300">
                              {entry.by} • {entry.subject}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-5 p-8 rounded-[2.5rem] bg-white/75 dark:bg-[#111c33]/72 backdrop-blur-xl border border-white/60 dark:border-white/12 shadow-luna-rich">
          <h2 className="text-xl font-black uppercase tracking-wider">{adminUi.inviteTitle}</h2>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{adminUi.inviteHint}</p>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_220px_auto] gap-3">
            <input
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder={adminUi.inviteEmailPlaceholder}
              className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as AdminRole)}
              className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-[11px] font-black uppercase tracking-widest"
            >
              {roleOptions.map((role) => (
                <option key={role} value={role}>{roleLabel(role)}</option>
              ))}
            </select>
            <button type="button" onClick={sendInvite} className="px-4 py-3 rounded-2xl bg-luna-purple text-white text-[10px] font-black uppercase tracking-widest">
              {adminUi.inviteButton}
            </button>
          </div>
          <div className="space-y-2 max-h-36 overflow-auto pr-1">
            {invites.length === 0 ? (
              <p className="text-xs text-slate-500">No invites yet.</p>
            ) : (
              invites.map((invite) => (
                <div key={invite.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50">
                  <div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{invite.email}</p>
                    <p className="text-[11px] text-slate-500">{roleLabel(invite.role)} • {new Date(invite.sentAt).toLocaleString()}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-luna-purple/10 text-luna-purple">
                    {invite.status === 'accepted' ? adminUi.inviteAccepted : invite.status === 'sent' ? adminUi.inviteSent : adminUi.invitePending}
                  </span>
                </div>
              ))
            )}
          </div>
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">{copy.role} Assignment</h3>
          <div className="space-y-3 max-h-80 overflow-auto pr-1">
            {admins.map((member) => (
              <div key={member.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-black text-sm">{member.name}</p>
                  <p className="text-xs text-slate-500">{member.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={member.role}
                    onChange={(e) => assignAdminRole(member, e.target.value as AdminRole)}
                    className="text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  >
                    {roleOptions.map((role) => (
                      <option key={role} value={role}>{roleLabel(role)}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => setAdmins((prev) => prev.map((item) => item.id === member.id ? { ...item, active: !item.active } : item))}
                    className={`px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${member.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}
                  >
                    {member.active ? 'Active' : 'Disabled'}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{adminUi.usersTotal}</p>
              <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{userStats.totalUsers.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{adminUi.usersActive}</p>
              <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{userStats.activeToday.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{adminUi.usersNew7d}</p>
              <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{userStats.new7d.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="space-y-5 p-8 rounded-[2.5rem] bg-[#15182a] text-white border border-white/12 shadow-luna-deep">
          <h2 className="text-xl font-black uppercase tracking-wider">{adminUi.siteStatsTitle}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-[10px] uppercase tracking-widest opacity-60">{adminUi.dau}</p>
              <p className="text-xl font-black">{siteStats.dau.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-[10px] uppercase tracking-widest opacity-60">{adminUi.wau}</p>
              <p className="text-xl font-black">{siteStats.wau.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-[10px] uppercase tracking-widest opacity-60">{adminUi.mau}</p>
              <p className="text-xl font-black">{siteStats.mau.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-[10px] uppercase tracking-widest opacity-60">{adminUi.conversion}</p>
              <p className="text-xl font-black">{siteStats.conversion}%</p>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-[10px] uppercase tracking-widest opacity-60">{adminUi.growth}</p>
              <p className="text-xl font-black">+{siteStats.growth}%</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-widest opacity-70">
              <span>Usage trend</span>
              <span>Last 7 days</span>
            </div>
            <div className="grid grid-cols-7 gap-2 items-end h-20">
              {[42, 51, 48, 66, 61, 74, 69].map((value, idx) => (
                <div key={`trend-${idx}`} className="rounded-xl bg-white/10 overflow-hidden h-full flex items-end">
                  <div className="w-full bg-gradient-to-t from-luna-purple to-luna-teal rounded-xl" style={{ height: `${value}%` }} />
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10"><p className="text-[10px] uppercase tracking-widest opacity-60">Monthly Revenue</p><p className="text-2xl font-black">${financialMetrics.mrr.toLocaleString()}</p></div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10"><p className="text-[10px] uppercase tracking-widest opacity-60">Yearly Revenue</p><p className="text-2xl font-black">${financialMetrics.arr.toLocaleString()}</p></div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10"><p className="text-[10px] uppercase tracking-widest opacity-60">Churn</p><p className="text-2xl font-black">{financialMetrics.churn}%</p></div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10"><p className="text-[10px] uppercase tracking-widest opacity-60">Value Ratio</p><p className="text-2xl font-black">{(financialMetrics.ltv / financialMetrics.cac).toFixed(2)}x</p></div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10"><p className="text-[10px] uppercase tracking-widest opacity-60">Subscribers</p><p className="text-2xl font-black">{financialMetrics.activeSubscribers.toLocaleString()}</p></div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10"><p className="text-[10px] uppercase tracking-widest opacity-60">Trial to Paid</p><p className="text-2xl font-black">{financialMetrics.trialToPaid}%</p></div>
          </div>
        </div>

        <div className="space-y-4 p-8 rounded-[2.5rem] bg-white/75 dark:bg-[#111c33]/72 backdrop-blur-xl border border-white/60 dark:border-white/12 shadow-luna-rich">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-black uppercase tracking-wider">Reliability & Checks</h2>
            <button onClick={runTechChecks} className="px-4 py-2 rounded-full bg-luna-purple text-white text-[10px] font-black uppercase tracking-widest">Run health check</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50"><p className="text-[10px] uppercase tracking-widest text-slate-500">Response Speed</p><p className="text-2xl font-black">{technicalMetrics.apiP95}ms</p></div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50"><p className="text-[10px] uppercase tracking-widest text-slate-500">Stability Issues</p><p className="text-2xl font-black">{technicalMetrics.errorRate}%</p></div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50"><p className="text-[10px] uppercase tracking-widest text-slate-500">Queue Delay</p><p className="text-2xl font-black">{technicalMetrics.queueLag}s</p></div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => exportAdminData('metrics', 'csv')} className="px-3 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest">Health CSV</button>
            <button onClick={() => exportAdminData('metrics', 'json')} className="px-3 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest">Health JSON</button>
            <button onClick={() => exportAdminData('audit', 'csv')} className="px-3 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest">Activity CSV</button>
            <button onClick={() => exportAdminData('audit', 'json')} className="px-3 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest">Activity JSON</button>
          </div>
          <div className="space-y-2 max-h-56 overflow-auto pr-1">
            {testHistory.map((entry) => (
              <div key={entry} className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50 text-sm font-semibold text-slate-700 dark:text-slate-300">
                {entry}
              </div>
            ))}
          </div>
          <div className="space-y-2 max-h-56 overflow-auto pr-1 pt-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Activity Log</p>
            {auditEntries.length === 0 ? (
              <div className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50 text-xs font-semibold text-slate-500">
                No activity records yet.
              </div>
            ) : (
              auditEntries.map((entry) => (
                <div key={entry.id} className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50 space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-luna-purple">{entry.action}</p>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{entry.details}</p>
                  <p className="text-[10px] text-slate-400">{entry.actorEmail} • {new Date(entry.at).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {preview && (
        <div className="fixed inset-0 z-[600] bg-slate-950/70 backdrop-blur-sm p-6 flex items-center justify-center">
          <div className="w-full max-w-4xl max-h-[88vh] overflow-hidden rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">{preview.title}</h3>
              <button onClick={() => setPreview(null)} className="px-3 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest">{copy.closePreview}</button>
            </div>
            <div className="p-6 overflow-auto max-h-[calc(88vh-82px)] space-y-5">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/40">
                <iframe title="preview" srcDoc={preview.html} className="w-full min-h-[440px] bg-white rounded-xl" />
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/40">
                <pre className="text-xs whitespace-pre-wrap text-slate-700 dark:text-slate-200">{preview.text}</pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};
