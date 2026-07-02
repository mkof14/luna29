import { Language } from '../constants';

/** Hero art filename under /images/heroes/r2/ — one visual theme per email type. */
export type AdminTemplateDef = {
  id: string;
  hero: string;
  trigger: Record<Language, string>;
  subject: Record<Language, string>;
  preheader: Record<Language, string>;
  body: Record<Language, string>;
  ctaLabel: Record<Language, string>;
};

const L: Language[] = ['en', 'ru', 'uk', 'es', 'fr', 'de', 'zh', 'ja', 'pt', 'ar', 'he'];

const fill = (en: string, ru: string, uk: string, es: string, fr: string, de: string, zh: string, ja: string, pt: string, ar: string, he: string): Record<Language, string> => ({
  en, ru, uk, es, fr, de, zh, ja, pt, ar, he,
});

const pickLang = (map: Record<Language, string>, lang: Language) => map[lang] || map.en;

export const getTemplateLocalized = (tpl: AdminTemplateDef, lang: Language) => ({
  trigger: pickLang(tpl.trigger, lang),
  subject: pickLang(tpl.subject, lang),
  preheader: pickLang(tpl.preheader, lang),
  body: pickLang(tpl.body, lang),
  ctaLabel: pickLang(tpl.ctaLabel, lang),
});

/** Full catalog — lifecycle emails with themed hero illustrations. */
export const ADMIN_EMAIL_TEMPLATES: AdminTemplateDef[] = [
  {
    id: 'tpl-welcome',
    hero: 'dashboard.webp',
    trigger: fill('New signup', 'Новая регистрация', 'Нова реєстрація', 'Nuevo registro', 'Nouvelle inscription', 'Neue Anmeldung', '新用户注册', '新規登録', 'Novo cadastro', 'تسجيل جديد', 'הרשמה חדשה'),
    subject: fill('Welcome', 'Добро пожаловать', 'Ласкаво просимо', 'Bienvenida', 'Bienvenue', 'Willkommen', '欢迎', 'ようこそ', 'Bem-vinda', 'مرحبًا بك', 'ברוכה הבאה'),
    preheader: fill('Your rhythm starts here.', 'Ваш ритм начинается здесь.', 'Ваш ритм починається тут.', 'Tu ritmo empieza aquí.', 'Votre rythme commence ici.', 'Ihr Rhythmus beginnt hier.', '您的节奏从这里开始。', 'あなたのリズムはここから。', 'Seu ritmo começa aqui.', 'إيقاعك يبدأ هنا.', 'הקצב שלך מתחיל כאן.'),
    body: fill(
      'Your private rhythm map is ready — start with one gentle check-in today.',
      'Ваша карта ритма готова — начните с одного спокойного чек-ина сегодня.',
      'Ваша карта ритму готова — почніть з одного спокійного чек-іну сьогодні.',
      'Tu mapa de ritmo privado está listo — empieza con un check-in suave hoy.',
      'Votre carte de rythme privée est prête — commencez par un check-in doux aujourd’hui.',
      'Ihre private Rhythmus-Karte ist bereit — beginnen Sie heute mit einem sanften Check-in.',
      '您的私人节奏地图已就绪——今天从一个温和的签到开始。',
      'あなた専用のリズムマップの準備ができました。今日はやさしいチェックインから。',
      'Seu mapa de ritmo privado está pronto — comece com um check-in suave hoje.',
      'خريطة إيقاعك الخاصة جاهزة — ابدئي بتسجيل هادئ اليوم.',
      'מפת הקצב הפרטית שלך מוכנה — התחילי בצ’ק-אין עדין היום.',
    ),
    ctaLabel: fill('Get started', 'Начать', 'Почати', 'Empezar', 'Commencer', 'Loslegen', '开始', '始める', 'Começar', 'ابدئي', 'התחילי'),
  },
  {
    id: 'tpl-site-invite',
    hero: 'dashboard.webp',
    trigger: fill('Site invitation', 'Приглашение на сайт', 'Запрошення на сайт', 'Invitación al sitio', 'Invitation au site', 'Site-Einladung', '网站邀请', 'サイト招待', 'Convite ao site', 'دعوة للموقع', 'הזמנה לאתר'),
    subject: fill('You are invited', 'Вас приглашают', 'Вас запрошують', 'Te invitamos', 'Invitation', 'Einladung', '您受邀加入', 'ご招待', 'Convite', 'أنت مدعوة', 'הוזמנת'),
    preheader: fill('Join with a calm first step.', 'Присоединяйтесь с первого спокойного шага.', 'Приєднуйтесь із першого спокійного кроку.', 'Únete con un primer paso calmado.', 'Rejoignez-nous en douceur.', 'Starten Sie mit einem ruhigen ersten Schritt.', '以平静的第一步加入。', '穏やかな第一歩で参加。', 'Entre com um primeiro passo calmo.', 'انضمي بخطوة هادئة أولى.', 'הצטרפי בצעד ראשון רגוע.'),
    body: fill(
      'Someone invited you to a private space for rhythm awareness. Create your account and explore at your pace.',
      'Вас пригласили в личное пространство для осознанности ритма. Создайте аккаунт и исследуйте в своём темпе.',
      'Вас запросили до приватного простору для усвідомлення ритму. Створіть акаунт і досліджуйте у своєму темпі.',
      'Te invitaron a un espacio privado para la conciencia del ritmo. Crea tu cuenta y explora a tu ritmo.',
      'Vous êtes invitée dans un espace privé pour la conscience du rythme. Créez votre compte à votre rythme.',
      'Sie wurden in einen privaten Raum für Rhythmus-Bewusstsein eingeladen. Erstellen Sie Ihr Konto in Ihrem Tempo.',
      '有人邀请您加入一个私密的节奏觉察空间。创建账户，按自己的节奏探索。',
      'リズムを意識するプライベート空間にご招待されました。アカウントを作成し、自分のペースで。',
      'Alguém convidou você para um espaço privado de consciência do ritmo. Crie sua conta no seu ritmo.',
      'تمت دعوتك إلى مساحة خاصة لوعي الإيقاع. أنشئي حسابك واستكشفي براحتك.',
      'הוזמנת למרחב פרטי למודעות קצב. צרי חשבון וחקי בקצב שלך.',
    ),
    ctaLabel: fill('Accept invitation', 'Принять приглашение', 'Прийняти запрошення', 'Aceptar invitación', 'Accepter l’invitation', 'Einladung annehmen', '接受邀请', '招待を受ける', 'Aceitar convite', 'قبول الدعوة', 'קבלי הזמנה'),
  },
  {
    id: 'tpl-admin-invite',
    hero: 'admin.webp',
    trigger: fill('Admin console invite', 'Приглашение в админку', 'Запрошення в адмінку', 'Invitación admin', 'Invitation admin', 'Admin-Einladung', '管理后台邀请', '管理コンソール招待', 'Convite admin', 'دعوة الإدارة', 'הזמנה לניהול'),
    subject: fill('Admin Console invitation', 'Приглашение в админ-консоль', 'Запрошення до адмін-консолі', 'Invitación a la consola admin', 'Invitation console admin', 'Admin-Konsole Einladung', '管理控制台邀请', '管理コンソールへの招待', 'Convite console admin', 'دعوة لوحة الإدارة', 'הזמנה לקונסולת ניהול'),
    preheader: fill('Workspace access prepared for you.', 'Доступ к рабочей области подготовлен.', 'Доступ до робочої області підготовлено.', 'Acceso al workspace preparado.', 'Accès workspace préparé.', 'Workspace-Zugang vorbereitet.', '已为您准备工作区访问。', 'ワークスペースアクセスを準備しました。', 'Acesso ao workspace preparado.', 'تم تجهيز وصول لوحة العمل.', 'גישת workspace מוכנה.'),
    body: fill(
      'You have been invited to the Admin Console. Sign in with this secure link to activate your role and permissions.',
      'Вас пригласили в админ-консоль. Войдите по защищённой ссылке, чтобы активировать роль и права.',
      'Вас запросили до адмін-консолі. Увійдіть за захищеним посиланням, щоб активувати роль і права.',
      'Te invitaron a la consola admin. Inicia sesión con este enlace seguro para activar tu rol.',
      'Vous êtes invitée à la console admin. Connectez-vous via ce lien sécurisé pour activer votre rôle.',
      'Sie wurden zur Admin-Konsole eingeladen. Melden Sie sich über diesen sicheren Link an.',
      '您已被邀请加入管理控制台。请通过此安全链接登录以激活角色和权限。',
      '管理コンソールに招待されました。この安全なリンクでサインインし、ロールを有効化してください。',
      'Você foi convidada à console admin. Entre com este link seguro para ativar seu papel.',
      'تمت دعوتك إلى لوحة الإدارة. سجّلي الدخول عبر هذا الرابط الآمن.',
      'הוזמנת לקונסולת הניהול. התחברי בקישור מאובטח זה.',
    ),
    ctaLabel: fill('Open Admin invite', 'Открыть приглашение', 'Відкрити запрошення', 'Abrir invitación', 'Ouvrir invitation', 'Einladung öffnen', '打开管理邀请', '管理招待を開く', 'Abrir convite', 'فتح دعوة الإدارة', 'פתחי הזמנה'),
  },
  {
    id: 'tpl-reset',
    hero: 'profile.webp',
    trigger: fill('Password reset', 'Сброс пароля', 'Скидання пароля', 'Restablecer contraseña', 'Réinitialisation mot de passe', 'Passwort zurücksetzen', '重置密码', 'パスワード再設定', 'Redefinir senha', 'إعادة تعيين كلمة المرور', 'איפוס סיסמה'),
    subject: fill('Reset your password', 'Сброс пароля', 'Скидання пароля', 'Restablece tu contraseña', 'Réinitialisez votre mot de passe', 'Passwort zurücksetzen', '重置密码', 'パスワード再設定', 'Redefinir senha', 'إعادة تعيين كلمة المرور', 'איפוס סיסמה'),
    preheader: fill('Secure recovery route prepared.', 'Подготовлен безопасный маршрут восстановления.', 'Підготовлено безпечний маршрут відновлення.', 'Ruta segura de recuperación.', 'Route de récupération sécurisée.', 'Sicherer Wiederherstellungsweg.', '已准备安全恢复路径。', '安全な復旧ルートを準備しました。', 'Rota segura de recuperação.', 'مسار استRecovery آمن.', 'מסלול שחזור מאובטח.'),
    body: fill('Use the button below to set a new password and continue securely.', 'Нажмите кнопку ниже, чтобы задать новый пароль и безопасно продолжить.', 'Натисніть кнопку нижче, щоб задати новий пароль.', 'Usa el botón para establecer una nueva contraseña.', 'Utilisez le bouton pour définir un nouveau mot de passe.', 'Nutzen Sie die Schaltfläche für ein neues Passwort.', '使用下方按钮设置新密码。', '下のボタンで新しいパスワードを設定してください。', 'Use o botão para definir uma nova senha.', 'استخدمي الزر لتعيين كلمة مرور جديدة.', 'השתמשי בכפתור לקביעת סיסמה חדשה.'),
    ctaLabel: fill('Reset password', 'Сбросить пароль', 'Скинути пароль', 'Restablecer', 'Réinitialiser', 'Zurücksetzen', '重置密码', '再設定', 'Redefinir', 'إعادة التعيين', 'איפוס'),
  },
  {
    id: 'tpl-trial-start',
    hero: 'today_mirror.webp',
    trigger: fill('Trial started', 'Старт пробного периода', 'Старт пробного періоду', 'Prueba iniciada', 'Essai démarré', 'Test gestartet', '试用开始', 'トライアル開始', 'Teste iniciado', 'بدء التجربة', 'תחילת ניסיון'),
    subject: fill('Your trial has started', 'Ваш пробный период начался', 'Ваш пробний період розпочався', 'Tu prueba comenzó', 'Votre essai a commencé', 'Ihre Testphase hat begonnen', '试用已开始', 'トライアル開始', 'Seu teste começou', 'بدأت تجربتك', 'ניסיון התחיל'),
    preheader: fill('Make the most of your first rhythm week.', 'Используйте первую неделю ритма.', 'Скористайтеся першим тижнем ритму.', 'Aprovecha tu primera semana.', 'Profitez de votre première semaine.', 'Nutzen Sie Ihre erste Rhythmuswoche.', '充分利用第一个节奏周。', '最初のリズム週を活用を。', 'Aproveite sua primeira semana.', 'استفيدي من أسبوعك الأول.', 'נצלי את שבוע הקצב הראשון.'),
    body: fill('Your trial is active. Daily check-ins help patterns become clear — one minute at a time.', 'Пробный период активен. Ежедневные чек-ины помогают увидеть паттерны — минута за минутой.', 'Пробний період активний. Щоденні чек-іни допомагають побачити патерни.', 'Tu prueba está activa. Los check-ins diarios aclaran patrones.', 'Votre essai est actif. Les check-ins quotidiens clarifient les patterns.', 'Ihre Testphase ist aktiv. Tägliche Check-ins klären Muster.', '试用已激活。每日签到帮助看清模式。', 'トライアルが有効です。毎日のチェックインでパターンが見えます。', 'Seu teste está ativo. Check-ins diários revelam padrões.', 'تجربتك نشطة. التسجيلات اليومية توضح الأنماط.', 'הניסיון פעיל. צ’ק-אין יומי מבהיר דפוסים.'),
    ctaLabel: fill('Start check-in', 'Начать чек-ин', 'Почати чек-ін', 'Empezar check-in', 'Commencer check-in', 'Check-in starten', '开始签到', 'チェックイン開始', 'Iniciar check-in', 'بدء التسجيل', 'התחילי צ’ק-אין'),
  },
  {
    id: 'tpl-renewal',
    hero: 'insights_paywall.webp',
    trigger: fill('Renewal reminder', 'Напоминание о продлении', 'Нагадування про поновлення', 'Recordatorio de renovación', 'Rappel de renouvellement', 'Verlängerungserinnerung', '续费提醒', '更新リマインダー', 'Lembrete de renovação', 'تذكير بالتجديد', 'תזכורת חידוש'),
    subject: fill('Your renewal is coming up', 'Скоро продление', 'Незабаром поновлення', 'Tu renovación se acerca', 'Votre renouvellement approche', 'Ihre Verlängerung steht bevor', '即将续费', '更新のお知らせ', 'Renovação se aproxima', 'اقتراب التجديد', 'חידוש מתקרב'),
    preheader: fill('Keep your rhythm continuity active.', 'Сохраните непрерывность ритма.', 'Збережіть безперервність ритму.', 'Mantén la continuidad de tu ritmo.', 'Gardez la continuité de votre rythme.', 'Behalten Sie Ihre Rhythmus-Kontinuität.', '保持节奏连续性。', 'リズムの連続性を保ちましょう。', 'Mantenha a continuidade do ritmo.', 'حافظي على استمرارية إيقاعك.', 'שמרי על רצף הקצב.'),
    body: fill('Your membership renews soon. Review your plan to continue tracking without interruption.', 'Подписка скоро продлится. Проверьте план, чтобы продолжить без перерыва.', 'Підписка скоро поновиться. Перевірте план.', 'Tu membresía se renueva pronto. Revisa tu plan.', 'Votre abonnement se renouvelle bientôt. Vérifiez votre plan.', 'Ihre Mitgliedschaft verlängert sich bald.', '会员即将续费。请查看计划。', 'まもなく更新されます。プランをご確認ください。', 'Sua assinatura renova em breve. Revise seu plano.', 'عضويتك تتجدد قريبًا.', 'המנוי שלך מתחדש בקרוב.'),
    ctaLabel: fill('Review plan', 'Проверить план', 'Перевірити план', 'Revisar plan', 'Voir le plan', 'Plan prüfen', '查看计划', 'プラン確認', 'Revisar plano', 'مراجعة الخطة', 'בדיקת תוכנית'),
  },
  {
    id: 'tpl-report-ready',
    hero: 'labs.webp',
    trigger: fill('Health report ready', 'Отчёт готов', 'Звіт готовий', 'Informe listo', 'Rapport prêt', 'Bericht bereit', '健康报告就绪', 'レポート完成', 'Relatório pronto', 'التقرير جاهز', 'דוח מוכן'),
    subject: fill('Your health report is ready', 'Ваш отчёт готов', 'Ваш звіт готовий', 'Tu informe está listo', 'Votre rapport est prêt', 'Ihr Bericht ist bereit', '健康报告已就绪', 'レポート完成', 'Seu relatório está pronto', 'تقريرك جاهز', 'דוח מוכן'),
    preheader: fill('Review insights in your private space.', 'Просмотрите инсайты в личном пространстве.', 'Перегляньте інсайти у приватному просторі.', 'Revisa insights en tu espacio privado.', 'Consultez vos insights en privé.', 'Einblicke in Ihrem privaten Bereich.', '在私人空间查看洞察。', 'プライベート空間で確認。', 'Revise insights no seu espaço privado.', 'راجعي الرؤى في مساحتك الخاصة.', 'עייני בתובנות במרחב הפרטי.'),
    body: fill('A new health report snapshot is available. Open it when you feel ready — no rush.', 'Новый снимок отчёта доступен. Откройте, когда будете готовы — без спешки.', 'Новий знімок звіту доступний.', 'Un nuevo informe está disponible.', 'Un nouveau rapport est disponible.', 'Ein neuer Bericht ist verfügbar.', '新的健康报告快照已可用。', '新しいレポートが利用可能です。', 'Um novo relatório está disponível.', 'لقطة تقرير جديدة متاحة.', 'צילום דוח חדש זמין.'),
    ctaLabel: fill('Open report', 'Открыть отчёт', 'Відкрити звіт', 'Abrir informe', 'Ouvrir rapport', 'Bericht öffnen', '打开报告', 'レポートを開く', 'Abrir relatório', 'فتح التقرير', 'פתיחת דוח'),
  },
  {
    id: 'tpl-newsletter',
    hero: 'library.webp',
    trigger: fill('Newsletter / campaign', 'Рассылка / кампания', 'Розсилка / кампанія', 'Newsletter / campaña', 'Newsletter / campagne', 'Newsletter / Kampagne', '通讯 / 活动', 'ニュースレター', 'Newsletter / campanha', 'نشرة / حملة', 'ניוזלטר / קמפיין'),
    subject: fill('A note from us', 'Письмо от нас', 'Лист від нас', 'Una nota nuestra', 'Un mot de nous', 'Eine Nachricht von uns', '来自我们的消息', 'お知らせ', 'Uma nota nossa', 'رسالة منا', 'הודעה מאיתנו'),
    preheader: fill('Rhythm-aware care, delivered gently.', 'Забота о ритме — мягко и бережно.', 'Турбота про ритм — м’яко та делікатно.', 'Cuidado consciente del ritmo.', 'Soin conscient du rythme.', 'Rhythmus-bewusste Fürsorge.', '节奏觉察式关怀。', 'リズムに寄り添うケア。', 'Cuidado consciente do ritmo.', 'رعاية واعية للإيقاع.', 'טיפול מודע לקצב.'),
    body: fill('This message was prepared in the marketing workspace. Edit the body before sending to match your campaign.', 'Это сообщение подготовлено в маркетинговом разделе. Отредактируйте текст перед отправкой.', 'Це повідомлення підготовлено в маркетинговому розділі.', 'Mensaje preparado en el workspace de marketing.', 'Message préparé dans l’espace marketing.', 'Nachricht im Marketing-Workspace vorbereitet.', '此消息在营销工作区准备。', 'マーケティングワークスペースで準備。', 'Mensagem preparada no workspace de marketing.', 'تم إعداد هذه الرسالة في مساحة التسويق.', 'הודעה זו הוכנה באזור השיווק.'),
    ctaLabel: fill('Learn more', 'Подробнее', 'Детальніше', 'Saber más', 'En savoir plus', 'Mehr erfahren', '了解更多', '詳しく', 'Saiba mais', 'اعرفي المزيد', 'למידע נוסף'),
  },
  {
    id: 'tpl-cycle-reminder',
    hero: 'cycle.webp',
    trigger: fill('Cycle phase reminder', 'Напоминание о фазе цикла', 'Нагадування про фазу циклу', 'Recordatorio de fase', 'Rappel de phase', 'Zyklusphasen-Erinnerung', '周期阶段提醒', 'サイクルフェーズリマインダー', 'Lembrete de fase', 'تذكير بمرحلة الدورة', 'תזכורת לשלב במחזור'),
    subject: fill('Your rhythm check-in', 'Проверка ритма', 'Перевірка ритму', 'Tu check-in de ritmo', 'Votre check-in rythme', 'Ihr Rhythmus-Check-in', '节奏签到', 'リズムチェックイン', 'Seu check-in de ritmo', 'تسجيل إيقاعك', 'צ’ק-אין קצב'),
    preheader: fill('A gentle nudge for today’s phase.', 'Мягкое напоминание для сегодняшней фазы.', 'М’яке нагадування для сьогоднішньої фази.', 'Un empujón suave para la fase de hoy.', 'Un rappel doux pour la phase du jour.', 'Sanfte Erinnerung für die heutige Phase.', '今日阶段的温和提醒。', '今日のフェーズへのやさしいリマインダー。', 'Um lembrete suave para a fase de hoje.', 'تذكير لطيف لمرحلة اليوم.', 'תזכורת עדינה לשלב של היום.'),
    body: fill(
      'Your cycle map suggests a good moment for a short check-in. One honest note is enough — no pressure.',
      'Карта цикла подсказывает: сейчас хороший момент для короткого чек-ина. Одной честной заметки достаточно — без давления.',
      'Карта циклу підказує: зараз гарний момент для короткого чек-іну. Однієї чесної нотатки достатньо — без тиску.',
      'Tu mapa de ciclo sugiere un buen momento para un check-in breve. Una nota honesta basta — sin presión.',
      'Votre carte de cycle suggère un bon moment pour un court check-in. Une note honnête suffit — sans pression.',
      'Ihre Zykluskarte deutet auf einen guten Moment für einen kurzen Check-in. Eine ehrliche Notiz reicht — ohne Druck.',
      '您的周期地图提示现在是简短签到的好时机。一句真实记录就够——无需压力。',
      'サイクルマップから、短いチェックインに適したタイミングです。正直な一言で十分 — プレッシャーは不要。',
      'Seu mapa de ciclo sugere um bom momento para um check-in curto. Uma nota honesta basta — sem pressão.',
      'خريطة دورتك تشير إلى لحظة مناسبة لتسجيل قصير. ملاحظة صادقة كافية — دون ضغط.',
      'מפת המחזור מציעה רגע טוב לצ’ק-אין קצר. הערה כנה אחת מספיקה — בלי לחץ.',
    ),
    ctaLabel: fill('Open check-in', 'Открыть чек-ин', 'Відкрити чек-ін', 'Abrir check-in', 'Ouvrir check-in', 'Check-in öffnen', '打开签到', 'チェックインを開く', 'Abrir check-in', 'فتح التسجيل', 'פתיחת צ’ק-אין'),
  },
];

export const getTemplateById = (id: string) => ADMIN_EMAIL_TEMPLATES.find((t) => t.id === id);

export const templateHeroUrl = (heroFile: string, baseUrl: string) =>
  `${baseUrl.replace(/\/$/, '')}/images/heroes/r2/${heroFile}`;

// Silence unused L warning
void L;
