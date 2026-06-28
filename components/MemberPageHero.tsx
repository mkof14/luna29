import React from 'react';
import { Language, TranslationSchema, LangCopy, getLang } from '../constants';
import { TabType } from '../utils/navigation';

type HeroConfig = {
  image: string;
  title: string;
  subtitle?: string;
  description?: string;
  objectPositionClass?: string;
};

type DescriptionKey =
  | 'home'
  | 'about'
  | 'cycle'
  | 'labs'
  | 'history'
  | 'create'
  | 'profile'
  | 'privacy'
  | 'bridge'
  | 'family'
  | 'voice'
  | 'voice_files'
  | 'knowledge'
  | 'faq'
  | 'support'
  | 'meds'
  | 'reset'
  | 'partner'
  | 'relationships'
  | 'admin'
  | 'how'
  | 'terms'
  | 'disclaimer'
  | 'cookies'
  | 'data_rights';

const subtitleByLang: LangCopy< string> = {
  en: 'Member Zone',
  ru: 'Member Зона',
  uk: 'Member Зона',
  es: 'Zona Member',
  fr: 'Zone Member',
  de: 'Member Zone',
  zh: '会员区',
  ja: 'メンバーゾーン',
  pt: 'Zona Member',
};

export const MemberPageHero: React.FC<{
  activeTab: TabType;
  lang: Language;
  ui: TranslationSchema;
}> = ({ activeTab, lang, ui }) => {
  const legalTitleByLang: LangCopy< Record<'about' | 'how_it_works' | 'terms' | 'medical' | 'cookies' | 'data_rights', string>> = {
    en: { about: 'About', how_it_works: 'How It Works', terms: 'Terms', medical: 'Disclaimer', cookies: 'Cookies', data_rights: 'Data Rights' },
    ru: { about: 'О проекте', how_it_works: 'Как Это Работает', terms: 'Условия', medical: 'Дисклеймер', cookies: 'Cookies', data_rights: 'Права на данные' },
    uk: { about: 'Про проект', how_it_works: 'Як Це Працює', terms: 'Умови', medical: 'Дисклеймер', cookies: 'Cookies', data_rights: 'Права на дані' },
    es: { about: 'Acerca', how_it_works: 'Como Funciona', terms: 'Terminos', medical: 'Descargo', cookies: 'Cookies', data_rights: 'Derechos De Datos' },
    fr: { about: 'A Propos', how_it_works: 'Comment Ca Marche', terms: 'Conditions', medical: 'Avertissement', cookies: 'Cookies', data_rights: 'Droits Sur Les Donnees' },
    de: { about: 'Uber', how_it_works: 'So Funktioniert Es', terms: 'Nutzungsbedingungen', medical: 'Hinweis', cookies: 'Cookie-Hinweis', data_rights: 'Datenrechte' },
    zh: { about: '关于', how_it_works: '如何使用', terms: '服务条款', medical: '免责声明', cookies: 'Cookie 声明', data_rights: '数据权利' },
    ja: { about: '概要', how_it_works: '使い方', terms: '利用規約', medical: '免責', cookies: 'Cookie 通知', data_rights: 'データ権利' },
    pt: { about: 'Sobre', how_it_works: 'Como Funciona', terms: 'Termos De Servico', medical: 'Aviso', cookies: 'Aviso De Cookies', data_rights: 'Direitos De Dados' },
  };
  const legal = getLang(legalTitleByLang, lang) || legalTitleByLang.en;
  const subtitle = getLang(subtitleByLang, lang) || subtitleByLang.en;
  const descriptionByLang: LangCopy< Record<DescriptionKey, string>> = {
    en: {
      home: 'Your daily orientation layer with the most important signals, focus points, and next actions.',
      about: 'Background of Luna29 and BioMath context with the purpose and boundaries of the system.',
      cycle: 'Visual map of physiological rhythms across energy, mood, focus, and recovery.',
      labs: 'Track metrics, trends, and practical interpretations of your health signals over time.',
      history: 'Review timeline, repeated patterns, and what changed across recent cycles and days.',
      create: 'Generate guided reflections, drafts, and supportive communication artifacts.',
      profile: 'Manage your personal settings, preferences, and profile information.',
      privacy: 'Control data visibility, consent settings, and personal privacy boundaries.',
      bridge: 'Turn internal states into clear, respectful messages for yourself or close people.',
      family: 'Adaptive home rhythm tools for load planning, conflict forecast, and shared check-ins.',
      voice: 'Capture thoughts by voice, convert to structured reflection, and receive focused responses.',
      voice_files: 'Access, review, and manage saved voice records and transcripts.',
      knowledge: 'Reference materials and practical guidance for understanding your internal patterns.',
      faq: 'Quick answers to common questions about scope, safety, data, and usage.',
      support: 'Communication and support channels for practical help and service feedback.',
      meds: 'Medication tracking context and supportive notes for daily adherence routines.',
      reset: 'Short stabilization protocols to reduce overload and restore functional calm.',
      partner: 'Guidance for partners: how to support without pressure and communicate with clarity.',
      relationships: 'Relationship regulation tools aligned with capacity, timing, and emotional load.',
      admin: 'Private workspace for managing content, team access, and key account insights.',
      how: 'Step-by-step flow of Luna29 usage from public orientation to private member tools.',
      terms: 'Legal terms describing use conditions, account rules, and service limitations.',
      disclaimer: 'Service boundary notice: Luna29 is informational support, not medical diagnosis or treatment.',
      cookies: 'Cookie usage details and controls for session, preferences, and analytics.',
      data_rights: 'Your rights over access, export, correction, and deletion of personal data.',
    },
    ru: {
      home: 'Ежедневная ориентация: ключевые сигналы состояния, фокус и следующие шаги.',
      about: 'Контекст Luna29 и BioMath: происхождение, назначение и границы системы.',
      cycle: 'Визуальная карта физиологических ритмов: энергия, настроение, фокус и восстановление.',
      labs: 'Отслеживание метрик, трендов и прикладной интерпретации сигналов во времени.',
      history: 'Хронология повторяющихся паттернов и изменений по дням и циклам.',
      create: 'Создание структурированных рефлексий, заготовок и поддерживающих формулировок.',
      profile: 'Настройки профиля, персональные параметры и предпочтения использования.',
      privacy: 'Управление видимостью данных, согласиями и приватными границами.',
      bridge: 'Преобразование внутреннего состояния в ясные и бережные сообщения.',
      family: 'Инструменты домашнего ритма: план нагрузки, прогноз конфликтности и check-in.',
      voice: 'Голосовая фиксация состояния, структурирование мысли и сфокусированный ответ.',
      voice_files: 'Просмотр, хранение и управление сохраненными голосовыми файлами и текстами.',
      knowledge: 'База знаний и практические пояснения для понимания ваших паттернов.',
      faq: 'Краткие ответы о границах сервиса, безопасности, данных и использовании.',
      support: 'Каналы связи и поддержки для решения практических вопросов.',
      meds: 'Контекст приема препаратов и поддерживающие заметки для ежедневной рутины.',
      reset: 'Короткие протоколы стабилизации для снижения перегрузки и возврата устойчивости.',
      partner: 'Раздел для партнера: как поддерживать без давления и общаться яснее.',
      relationships: 'Инструменты регулирования отношений с учетом ресурса и эмоциональной нагрузки.',
      admin: 'Приватное пространство для управления контентом, доступами команды и ключевыми показателями.',
      how: 'Пошаговая логика использования Luna29: от публичной части к member-инструментам.',
      terms: 'Юридические условия использования, правила аккаунта и ограничения сервиса.',
      disclaimer: 'Границы сервиса: Luna29 — информационная поддержка, не диагностика и не лечение.',
      cookies: 'Информация о cookie и управление настройками сессии и аналитики.',
      data_rights: 'Ваши права на доступ, экспорт, исправление и удаление персональных данных.',
    },
    uk: {
      home: 'Щоденна орієнтація: ключові сигнали стану, фокус і наступні кроки.',
      about: 'Контекст Luna29 і BioMath: походження, призначення та межі системи.',
      cycle: 'Візуальна карта фізіологічних ритмів: енергія, настрій, фокус, відновлення.',
      labs: 'Відстеження метрик, трендів і прикладного тлумачення сигналів у часі.',
      history: 'Хронологія патернів, що повторюються, та змін між днями і циклами.',
      create: 'Створення структурованих рефлексій, заготовок і підтримуючих формулювань.',
      profile: 'Налаштування профілю, персональні параметри та вподобання.',
      privacy: 'Керування видимістю даних, згодами та приватними межами.',
      bridge: 'Перетворення внутрішнього стану на чіткі та поважні повідомлення.',
      family: 'Інструменти домашнього ритму: план навантаження, прогноз конфліктів і check-in.',
      voice: 'Голосова фіксація стану, структуризація думок і сфокусована відповідь.',
      voice_files: 'Перегляд і керування збереженими голосовими файлами та транскриптами.',
      knowledge: 'База знань і практичні пояснення для розуміння ваших патернів.',
      faq: 'Короткі відповіді про межі сервісу, безпеку, дані та використання.',
      support: 'Канали звʼязку і підтримки для практичних запитів.',
      meds: 'Контекст прийому препаратів і підтримуючі нотатки щоденної рутини.',
      reset: 'Короткі протоколи стабілізації для зниження перевантаження.',
      partner: 'Розділ для партнера: як підтримувати без тиску та говорити ясніше.',
      relationships: 'Інструменти регуляції стосунків з урахуванням ресурсу та емоційної напруги.',
      admin: 'Приватний простір для керування контентом, доступами команди та ключовими показниками.',
      how: 'Покрокова логіка Luna29: від публічної орієнтації до member-інструментів.',
      terms: 'Юридичні умови використання, правила акаунта й обмеження сервісу.',
      disclaimer: 'Межі сервісу: Luna29 — інформаційна підтримка, не діагностика і не лікування.',
      cookies: 'Інформація про cookie та керування налаштуваннями сесії й аналітики.',
      data_rights: 'Ваші права на доступ, експорт, виправлення та видалення даних.',
    },
    es: {
      home: 'Capa diaria de orientacion con señales clave, foco y siguientes acciones.',
      about: 'Contexto de Luna29 y BioMath con el proposito y limites del sistema.',
      cycle: 'Mapa visual de ritmos fisiologicos: energia, estado de animo, foco y recuperacion.',
      labs: 'Seguimiento de metricas, tendencias e interpretacion practica de señales.',
      history: 'Revision de patrones repetidos y cambios por dias y ciclos.',
      create: 'Creacion de reflexiones guiadas y borradores de comunicacion clara.',
      profile: 'Gestion de perfil, preferencias y configuracion personal.',
      privacy: 'Control de visibilidad de datos, consentimientos y limites de privacidad.',
      bridge: 'Convierte estados internos en mensajes claros y respetuosos.',
      family: 'Herramientas de ritmo del hogar: carga, conflicto y check-in compartido.',
      voice: 'Captura por voz, reflexion estructurada y respuesta enfocada.',
      voice_files: 'Acceso y gestion de archivos de voz guardados y transcripciones.',
      knowledge: 'Material de referencia para entender tus patrones internos.',
      faq: 'Respuestas rapidas sobre alcance, seguridad, datos y uso.',
      support: 'Canales de ayuda y contacto para soporte practico.',
      meds: 'Contexto de medicacion y notas de apoyo para adherencia diaria.',
      reset: 'Protocolos breves para bajar sobrecarga y recuperar estabilidad.',
      partner: 'Guia para pareja: como apoyar sin presion y con claridad.',
      relationships: 'Regulacion de relaciones segun capacidad y carga emocional.',
      admin: 'Espacio privado para gestionar contenido, accesos del equipo y métricas clave.',
      how: 'Flujo paso a paso de uso de Luna29.',
      terms: 'Terminos legales de uso, reglas de cuenta y limites del servicio.',
      disclaimer: 'Luna29 es apoyo informativo, no diagnostico ni tratamiento medico.',
      cookies: 'Uso de cookies y control de preferencias de sesion y analitica.',
      data_rights: 'Derechos sobre acceso, exportacion, correccion y eliminacion de datos.',
    },
    fr: {
      home: 'Couche d orientation quotidienne avec signaux cles, focus et actions suivantes.',
      about: 'Contexte Luna29 et BioMath: finalite, origine et limites du systeme.',
      cycle: 'Carte visuelle des rythmes physiologiques: energie, humeur, concentration, recuperation.',
      labs: 'Suivi des metriques, tendances et interpretation pratique des signaux.',
      history: 'Chronologie des motifs repetitifs et des changements recents.',
      create: 'Creation de reflexions guidees et brouillons de communication claire.',
      profile: 'Gestion du profil, des preferences et des reglages personnels.',
      privacy: 'Controle de la visibilite des donnees et des limites de confidentialite.',
      bridge: 'Transformer l etat interieur en message clair et respectueux.',
      family: 'Outils de rythme du foyer: charge, risque de conflit, check-in partage.',
      voice: 'Capture vocale, structuration de la reflexion et reponse ciblee.',
      voice_files: 'Acces et gestion des enregistrements vocaux sauvegardes.',
      knowledge: 'Base de connaissances pour comprendre vos dynamiques internes.',
      faq: 'Reponses rapides sur le cadre, la securite, les donnees et l usage.',
      support: 'Canaux de support et de contact pour aide pratique.',
      meds: 'Contexte medicaments et notes de soutien pour la routine quotidienne.',
      reset: 'Protocoles courts pour diminuer la surcharge et retrouver de la stabilite.',
      partner: 'Guide partenaire: soutenir sans pression, communiquer avec clarte.',
      relationships: 'Regulation relationnelle selon la capacite et la charge emotionnelle.',
      admin: 'Espace prive pour gerer le contenu, les acces equipe et les indicateurs cles.',
      how: 'Parcours pas a pas de Luna29.',
      terms: 'Conditions legales d utilisation et limites du service.',
      disclaimer: 'Luna29 est un support informatif, pas un diagnostic ni un traitement.',
      cookies: 'Utilisation des cookies et controle des preferences de session.',
      data_rights: 'Droits d acces, export, correction et suppression des donnees.',
    },
    de: {
      home: 'Tagliche Orientierung mit Schlusssignalen, Fokus und nachsten Schritten.',
      about: 'Hintergrund zu Luna29 und BioMath sowie Zweck und Grenzen des Systems.',
      cycle: 'Visuelle Karte physiologischer Rhythmen: Energie, Stimmung, Fokus, Erholung.',
      labs: 'Verlauf von Metriken, Trends und praktischer Signalinterpretation.',
      history: 'Zeitleiste wiederkehrender Muster und Veranderungen im Verlauf.',
      create: 'Erstellung gefuhrter Reflexionen und klarer Kommunikationsentwurfe.',
      profile: 'Verwaltung von Profil, Einstellungen und personlichen Praferenzen.',
      privacy: 'Kontrolle uber Datensichtbarkeit, Einwilligungen und Privatsphare.',
      bridge: 'Innere Zustande in klare und respektvolle Botschaften ubersetzen.',
      family: 'Hausrhythmus-Tools fur Lastplanung, Konfliktprognose und Check-ins.',
      voice: 'Sprachaufnahme, strukturierte Reflexion und fokussierte Antworten.',
      voice_files: 'Zugriff auf gespeicherte Sprachdateien und Transkripte.',
      knowledge: 'Wissensbereich zur Einordnung innerer Muster.',
      faq: 'Kurzantworten zu Umfang, Sicherheit, Daten und Nutzung.',
      support: 'Support- und Kontaktkanale fur praktische Hilfe.',
      meds: 'Kontext zur Medikation und alltagstaugliche Adharenz-Notizen.',
      reset: 'Kurze Stabilisierungsprotokolle zur Senkung von Uberlastung.',
      partner: 'Partnerleitfaden: unterstutzen ohne Druck, klar kommunizieren.',
      relationships: 'Beziehungsregulation nach Kapazitat, Timing und emotionaler Last.',
      admin: 'Privater Bereich fur Inhalte, Teamzugange und wichtige Kennzahlen.',
      how: 'Schritt-fur-Schritt-Nutzung von Luna29.',
      terms: 'Rechtliche Nutzungsbedingungen und Servicegrenzen.',
      disclaimer: 'Luna29 ist informativ, keine medizinische Diagnose oder Behandlung.',
      cookies: 'Cookie-Nutzung und Steuerung von Sitzungs- und Analyseoptionen.',
      data_rights: 'Rechte auf Zugriff, Export, Berichtigung und Loschung von Daten.',
    },
    zh: {
      home: '每日导向层：查看关键状态信号、重点与下一步行动。',
      about: '了解 Luna29 与 BioMath 背景，以及系统目标与边界。',
      cycle: '生理节律可视化地图：能量、情绪、专注与恢复。',
      labs: '跟踪指标与趋势，并获得可执行的信号解释。',
      history: '回顾时间线、重复模式与近期变化。',
      create: '生成结构化反思与清晰沟通草稿。',
      profile: '管理个人资料、偏好与账户设置。',
      privacy: '控制数据可见性、授权与隐私边界。',
      bridge: '将内在状态转化为清晰、尊重的表达。',
      family: '家庭节律工具：负荷规划、冲突预测与共享 check-in。',
      voice: '语音记录状态，转为结构化反思并获得聚焦回应。',
      voice_files: '查看与管理已保存语音文件和转写。',
      knowledge: '知识资料库：帮助理解你的内在模式。',
      faq: '快速解答范围、安全、数据与使用问题。',
      support: '联系与支持渠道，用于实际问题处理。',
      meds: '用药背景与日常依从性支持记录。',
      reset: '短时稳定协议：降低过载，恢复可用状态。',
      partner: '伴侣指南：如何在不施压下提供支持与沟通。',
      relationships: '根据容量与情绪负荷进行关系调节。',
      admin: '私密工作区：管理内容、团队权限与关键洞察。',
      how: 'Luna29 使用路径与核心步骤说明。',
      terms: '服务条款：账户规则、使用条件与限制。',
      disclaimer: 'Luna29 为信息支持工具，不提供医疗诊断或治疗。',
      cookies: 'Cookie 使用说明与会话/分析偏好控制。',
      data_rights: '你的数据权利：访问、导出、更正与删除。',
    },
    ja: {
      home: '日々の状態把握レイヤー。重要シグナル、優先点、次の一歩を確認。',
      about: 'Luna29 と BioMath の背景、目的、システムの境界を説明。',
      cycle: '生理リズムの可視化マップ（エネルギー・気分・集中・回復）。',
      labs: '指標とトレンドを追跡し、実用的に解釈します。',
      history: '時系列での反復パターンと変化を振り返ります。',
      create: '構造化された内省メモと伝達文案を作成します。',
      profile: 'プロフィール、設定、利用プリファレンスを管理します。',
      privacy: 'データ可視性、同意、プライバシー境界を管理します。',
      bridge: '内的状態を明確で尊重あるメッセージに変換します。',
      family: '家庭リズム支援：負荷計画、衝突予測、共有チェックイン。',
      voice: '音声で状態を記録し、構造化内省と要点回答を得ます。',
      voice_files: '保存済み音声ファイルと書き起こしを管理します。',
      knowledge: '内的パターン理解のための知識リファレンス。',
      faq: '範囲・安全・データ・使い方のよくある質問。',
      support: '実務的なサポートと連絡チャネル。',
      meds: '服薬コンテキストと日次ルーティン支援メモ。',
      reset: '過負荷を下げる短時間の安定化プロトコル。',
      partner: 'パートナー向け：圧をかけずに支えるための指針。',
      relationships: '容量と感情負荷に合わせた関係調整ツール。',
      admin: '非公開ワークスペース（コンテンツ管理、チーム権限、主要インサイト）。',
      how: 'Luna29 の利用手順を段階的に説明します。',
      terms: '利用規約、アカウントルール、サービス制限。',
      disclaimer: 'Luna29 は情報支援であり、医療診断・治療ではありません。',
      cookies: 'Cookie 利用とセッション/分析設定の管理。',
      data_rights: 'データ権利：アクセス、エクスポート、訂正、削除。',
    },
    pt: {
      home: 'Camada diaria de orientacao com sinais-chave, foco e proximas acoes.',
      about: 'Contexto de Luna29 e BioMath com proposito e limites do sistema.',
      cycle: 'Mapa visual dos ritmos fisiologicos: energia, humor, foco e recuperacao.',
      labs: 'Acompanhe metricas, tendencias e leitura pratica dos sinais.',
      history: 'Revise linha do tempo, padroes recorrentes e mudancas recentes.',
      create: 'Crie reflexoes guiadas e rascunhos de comunicacao clara.',
      profile: 'Gerencie perfil, preferencias e configuracoes pessoais.',
      privacy: 'Controle visibilidade de dados, consentimentos e limites de privacidade.',
      bridge: 'Transforme estados internos em mensagens claras e respeitosas.',
      family: 'Ferramentas de ritmo da casa: carga, conflito e check-ins compartilhados.',
      voice: 'Capture por voz, estruture reflexoes e receba respostas focadas.',
      voice_files: 'Acesse e gerencie arquivos de voz e transcricoes salvos.',
      knowledge: 'Base de conhecimento para entender seus padroes internos.',
      faq: 'Respostas rapidas sobre escopo, seguranca, dados e uso.',
      support: 'Canais de suporte e contato para ajuda pratica.',
      meds: 'Contexto de medicacao e notas de apoio para rotina diaria.',
      reset: 'Protocolos curtos para reduzir sobrecarga e recuperar estabilidade.',
      partner: 'Guia para parceiro: apoiar sem pressao e comunicar com clareza.',
      relationships: 'Regulacao de relacionamentos por capacidade e carga emocional.',
      admin: 'Espaco privado para gerir conteudo, acessos da equipe e indicadores-chave.',
      how: 'Fluxo passo a passo de uso do Luna29.',
      terms: 'Termos legais de uso, regras de conta e limites do servico.',
      disclaimer: 'Luna29 e suporte informativo, nao diagnostico ou tratamento medico.',
      cookies: 'Uso de cookies e controle de preferencias de sessao e analise.',
      data_rights: 'Direitos sobre acesso, exportacao, correcao e exclusao de dados.',
    },
  };
  const descriptionKeyByTab: Record<TabType, DescriptionKey> = {
    dashboard: 'home',
    today_mirror: 'home',
    my_day: 'home',
    monthly_reflection: 'home',
    insights_paywall: 'home',
    about: 'about',
    cycle: 'cycle',
    labs: 'labs',
    history: 'history',
    creative: 'create',
    profile: 'profile',
    privacy: 'privacy',
    bridge: 'bridge',
    family: 'family',
    reflections: 'voice',
    voice_files: 'voice_files',
    library: 'knowledge',
    faq: 'faq',
    contact: 'support',
    meds: 'meds',
    crisis: 'reset',
    partner_faq: 'partner',
    relationships: 'relationships',
    admin: 'admin',
    how_it_works: 'how',
    terms: 'terms',
    medical: 'disclaimer',
    cookies: 'cookies',
    data_rights: 'data_rights',
  };
  const descriptions = getLang(descriptionByLang, lang) || descriptionByLang.en;

  const configs: Record<TabType, HeroConfig> = {
    dashboard: { image: '/images/luna_banner_1.jpg', title: ui.navigation.home || 'Home', subtitle, description: descriptions[descriptionKeyByTab.dashboard] },
    today_mirror: { image: '/images/luna_banner_1.jpg', title: 'Today', subtitle, description: descriptions[descriptionKeyByTab.today_mirror] },
    my_day: { image: '/images/luna_banner_1.jpg', title: 'My Day with Luna29', subtitle, description: descriptions[descriptionKeyByTab.my_day] },
    monthly_reflection: { image: '/images/luna_banner_1.jpg', title: 'Your month with Luna29', subtitle, description: descriptions[descriptionKeyByTab.monthly_reflection] },
    insights_paywall: { image: '/images/luna_banner_1.jpg', title: 'Unlock Insights', subtitle, description: descriptions[descriptionKeyByTab.insights_paywall] },
    about: { image: '/images/Luna L 44.png', title: legal.about, subtitle, description: descriptions[descriptionKeyByTab.about] },
    cycle: { image: '/images/luna_banner_10.jpg', title: ui.navigation.cycle || 'Luna29 Balance', subtitle, description: descriptions[descriptionKeyByTab.cycle] },
    labs: { image: '/images/luna_banner_5.jpg', title: ui.navigation.labs || 'Labs', subtitle, description: descriptions[descriptionKeyByTab.labs] },
    history: { image: '/images/luna_banner_11.jpg', title: ui.navigation.history || 'History', subtitle, description: descriptions[descriptionKeyByTab.history] },
    creative: { image: '/images/crescent_moon_mist.webp', title: ui.navigation.creative || 'Create', subtitle, description: descriptions[descriptionKeyByTab.creative] },
    profile: { image: '/images/portrait_collection.webp', title: ui.navigation.profile || 'Profile', subtitle, description: descriptions[descriptionKeyByTab.profile] },
    privacy: { image: '/images/window_reflection_portrait.webp', title: 'Privacy', subtitle, description: descriptions[descriptionKeyByTab.privacy] },
    bridge: { image: '/images/luna_banner_6.jpg', title: ui.navigation.bridge || 'The Bridge', subtitle, description: descriptions[descriptionKeyByTab.bridge] },
    family: { image: '/images/luna_banner_12.jpg', title: ui.navigation.family || 'Relationships', subtitle, description: descriptions[descriptionKeyByTab.family] },
    reflections: { image: '/images/luna_banner_3.jpg', title: ui.navigation.reflections || 'Voice Note', subtitle, description: descriptions[descriptionKeyByTab.reflections] },
    voice_files: { image: '/images/luna_banner_4.jpg', title: ui.navigation.voiceFiles || 'My Voice Files', subtitle, description: descriptions[descriptionKeyByTab.voice_files] },
    library: { image: '/images/crescent_moon_mist.webp', title: ui.navigation.library || 'Knowledge', subtitle, description: descriptions[descriptionKeyByTab.library] },
    faq: { image: '/images/moon_phases_arc.webp', title: ui.navigation.faq || 'Questions', subtitle, description: descriptions[descriptionKeyByTab.faq] },
    contact: { image: '/images/luna_banner_9.jpg', title: ui.navigation.contact || 'Contact', subtitle, description: descriptions[descriptionKeyByTab.contact], objectPositionClass: 'object-[44%_center]' },
    meds: { image: '/images/luna_banner_9.jpg', title: ui.navigation.meds || 'Medications', subtitle, description: descriptions[descriptionKeyByTab.meds], objectPositionClass: 'object-[44%_center]' },
    crisis: { image: '/images/luna_banner_13.jpg', title: ui.navigation.crisis || 'Reset Room', subtitle, description: descriptions[descriptionKeyByTab.crisis] },
    partner_faq: { image: '/images/couple_conversation.webp', title: ui.navigation.partner || 'PARTNER FAQ', subtitle, description: descriptions[descriptionKeyByTab.partner_faq] },
    relationships: { image: '/images/luna_banner_14.jpg', title: 'Relationships', subtitle, description: descriptions[descriptionKeyByTab.relationships], objectPositionClass: 'object-[center_38%]' },
    admin: { image: '/images/Luna logo3.png', title: ui.navigation.admin || 'Admin', subtitle, description: descriptions[descriptionKeyByTab.admin] },
    how_it_works: { image: '/images/portrait_collection.webp', title: legal.how_it_works, subtitle, description: descriptions[descriptionKeyByTab.how_it_works] },
    terms: { image: '/images/night_window_portrait.webp', title: legal.terms, subtitle, description: descriptions[descriptionKeyByTab.terms] },
    medical: { image: '/images/night_window_portrait.webp', title: legal.medical, subtitle, description: descriptions[descriptionKeyByTab.medical] },
    cookies: { image: '/images/night_window_portrait.webp', title: legal.cookies, subtitle, description: descriptions[descriptionKeyByTab.cookies] },
    data_rights: { image: '/images/night_window_portrait.webp', title: legal.data_rights, subtitle, description: descriptions[descriptionKeyByTab.data_rights] },
  };

  const config = configs[activeTab];

  return (
    <section className="mb-8 md:mb-10 rounded-[2.5rem] border border-slate-200/70 dark:border-slate-700/70 overflow-hidden shadow-[0_30px_75px_rgba(71,62,105,0.22)] dark:shadow-[0_34px_84px_rgba(0,0,0,0.58)] relative">
      <div className="absolute inset-0 bg-slate-100 dark:bg-[#071631]" />
      <img
        src={config.image}
        alt={config.title}
        className={`relative z-10 h-[230px] md:h-[260px] object-cover w-[calc(100%+3mm)] max-w-none -translate-x-[3mm] ${config.objectPositionClass || 'object-center'} [mask-image:linear-gradient(to_bottom,black_0%,black_78%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_0%,black_78%,transparent_100%)]`}
      />
      <div className="absolute inset-0 z-20 bg-gradient-to-br from-white/15 via-transparent to-white/5 dark:from-[#031024]/20 dark:to-transparent" />
      <div className="absolute inset-x-0 top-0 z-30 h-28 bg-gradient-to-b from-black/28 to-transparent dark:from-black/48 dark:to-transparent" />
      <div className="absolute left-6 right-6 bottom-5 z-40 space-y-1">
        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-white/85 dark:text-slate-200/90">{config.subtitle}</p>
        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white dark:text-slate-100 drop-shadow-[0_3px_16px_rgba(0,0,0,0.42)]">
          {config.title}
        </h2>
        {config.description && (
          <p className="max-w-3xl text-[11px] md:text-[12px] leading-relaxed font-semibold text-white/86 dark:text-slate-200/90 drop-shadow-[0_2px_10px_rgba(0,0,0,0.42)]">
            {config.description}
          </p>
        )}
      </div>
    </section>
  );
};
