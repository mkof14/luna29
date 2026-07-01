import { Language, LangCopy, getLang } from '../constants';

const sexualUiByLang: Partial<LangCopy< {
  intimacySymptomsTitle: string;
  sexualSnapshotTitle: string;
  libidoTemplate: string;
  intimacyFactors: string;
  sexualSnapshotLabel: string;
  summaryLabel: string;
  stateStable: string;
  stateModerate: string;
  stateHigh: string;
  scoreLabels: { libido: string; arousal: string; comfort: string; closeness: string; pain: string };
}>> = {
  en: {
    intimacySymptomsTitle: 'Intimacy & libido symptoms',
    sexualSnapshotTitle: 'Sexual Wellbeing Snapshot',
    libidoTemplate: 'Libido & Intimacy',
    intimacyFactors: 'Libido & Intimacy Factors',
    sexualSnapshotLabel: 'Current',
    summaryLabel: 'Sexual health snapshot',
    stateStable: 'Stable sexual-health baseline.',
    stateModerate: 'Moderate strain: useful to review hormonal and stress factors.',
    stateHigh: 'High priority: libido/intimacy strain needs structured review.',
    scoreLabels: { libido: 'Libido', arousal: 'Arousal', comfort: 'Comfort', closeness: 'Emotional Closeness', pain: 'Pain During Intimacy' },
  },
  ru: {
    intimacySymptomsTitle: 'Симптомы близости и либидо',
    sexualSnapshotTitle: 'Снимок Сексуального Самочувствия',
    libidoTemplate: 'Либидо И Близость',
    intimacyFactors: 'Факторы Либидо И Близости',
    sexualSnapshotLabel: 'Текущее',
    summaryLabel: 'Снимок сексуального здоровья',
    stateStable: 'Базовое состояние сексуального здоровья стабильное.',
    stateModerate: 'Умеренное напряжение: стоит проверить гормональные и стресс-факторы.',
    stateHigh: 'Высокий приоритет: выраженное напряжение либидо/близости требует структурного разбора.',
    scoreLabels: { libido: 'Либидо', arousal: 'Возбуждение', comfort: 'Комфорт', closeness: 'Эмоциональная Близость', pain: 'Боль При Близости' },
  },
  uk: {
    intimacySymptomsTitle: 'Симптоми близькості та лібідо',
    sexualSnapshotTitle: 'Зріз Сексуального Самопочуття',
    libidoTemplate: 'Лібідо Та Близькість',
    intimacyFactors: 'Фактори Лібідо Та Близькості',
    sexualSnapshotLabel: 'Поточний стан',
    summaryLabel: 'Зріз сексуального здоровʼя',
    stateStable: 'Базовий стан сексуального здоровʼя стабільний.',
    stateModerate: 'Помірне напруження: варто перевірити гормональні та стрес-фактори.',
    stateHigh: 'Високий пріоритет: виражене напруження лібідо/близькості потребує структурного аналізу.',
    scoreLabels: { libido: 'Лібідо', arousal: 'Збудження', comfort: 'Комфорт', closeness: 'Емоційна Близькість', pain: 'Біль Під Час Близькості' },
  },
  es: {
    intimacySymptomsTitle: 'Síntomas de intimidad y libido',
    sexualSnapshotTitle: 'Resumen De Bienestar Sexual',
    libidoTemplate: 'Libido E Intimidad',
    intimacyFactors: 'Factores De Libido E Intimidad',
    sexualSnapshotLabel: 'Actual',
    summaryLabel: 'Resumen de salud sexual',
    stateStable: 'Línea base sexual estable.',
    stateModerate: 'Tensión moderada: conviene revisar factores hormonales y de estrés.',
    stateHigh: 'Alta prioridad: la tensión de libido/intimidad requiere revisión estructurada.',
    scoreLabels: { libido: 'Libido', arousal: 'Excitación', comfort: 'Confort', closeness: 'Cercanía Emocional', pain: 'Dolor En La Intimidad' },
  },
  fr: {
    intimacySymptomsTitle: 'Symptômes d’intimité et de libido',
    sexualSnapshotTitle: 'Aperçu Du Bien-Être Sexuel',
    libidoTemplate: 'Libido Et Intimité',
    intimacyFactors: 'Facteurs Libido Et Intimité',
    sexualSnapshotLabel: 'Actuel',
    summaryLabel: 'Aperçu santé sexuelle',
    stateStable: 'Base de santé sexuelle stable.',
    stateModerate: 'Tension modérée: utile de revoir facteurs hormonaux et stress.',
    stateHigh: 'Priorité élevée: tension libido/intimité à analyser de façon structurée.',
    scoreLabels: { libido: 'Libido', arousal: 'Excitation', comfort: 'Confort', closeness: 'Proximité Émotionnelle', pain: 'Douleur Pendant L’intimité' },
  },
  de: {
    intimacySymptomsTitle: 'Intimitäts- und Libido-Symptome',
    sexualSnapshotTitle: 'Sexuelles Wohlbefinden',
    libidoTemplate: 'Libido & Intimität',
    intimacyFactors: 'Libido- & Intimitätsfaktoren',
    sexualSnapshotLabel: 'Aktuell',
    summaryLabel: 'Sexualgesundheit Snapshot',
    stateStable: 'Stabile sexuelle Ausgangslage.',
    stateModerate: 'Moderate Belastung: hormonelle und Stressfaktoren prüfen.',
    stateHigh: 'Hohe Priorität: Libido/Intimitätsbelastung braucht strukturierte Abklärung.',
    scoreLabels: { libido: 'Libido', arousal: 'Erregung', comfort: 'Komfort', closeness: 'Emotionale Nähe', pain: 'Schmerz Bei Intimität' },
  },
  zh: {
    intimacySymptomsTitle: '亲密与性欲症状',
    sexualSnapshotTitle: '性健康快照',
    libidoTemplate: '性欲与亲密',
    intimacyFactors: '性欲与亲密因素',
    sexualSnapshotLabel: '当前',
    summaryLabel: '性健康快照',
    stateStable: '性健康基线较稳定。',
    stateModerate: '中度压力：建议复查激素与压力因素。',
    stateHigh: '高优先级：性欲/亲密压力明显，需要结构化评估。',
    scoreLabels: { libido: '性欲', arousal: '唤起', comfort: '舒适度', closeness: '情感亲密', pain: '亲密时疼痛' },
  },
  ja: {
    intimacySymptomsTitle: '親密さ・リビドー症状',
    sexualSnapshotTitle: 'セクシャルウェルビーイング',
    libidoTemplate: 'リビドー・親密さ',
    intimacyFactors: 'リビドーと親密さの要因',
    sexualSnapshotLabel: '現在',
    summaryLabel: '性健康スナップショット',
    stateStable: '性健康のベースラインは安定しています。',
    stateModerate: '中等度の負荷: ホルモンとストレス要因の確認が有効です。',
    stateHigh: '高優先度: リビドー/親密さの負荷は構造的な見直しが必要です。',
    scoreLabels: { libido: 'リビドー', arousal: '覚醒', comfort: '快適さ', closeness: '情緒的な近さ', pain: '親密時の痛み' },
  },
  pt: {
    intimacySymptomsTitle: 'Sintomas de intimidade e libido',
    sexualSnapshotTitle: 'Resumo De Bem-Estar Sexual',
    libidoTemplate: 'Libido E Intimidade',
    intimacyFactors: 'Fatores De Libido E Intimidade',
    sexualSnapshotLabel: 'Atual',
    summaryLabel: 'Resumo de saúde sexual',
    stateStable: 'Linha de base sexual estável.',
    stateModerate: 'Tensão moderada: vale revisar fatores hormonais e de estresse.',
    stateHigh: 'Alta prioridade: tensão de libido/intimidade exige revisão estruturada.',
    scoreLabels: { libido: 'Libido', arousal: 'Excitação', comfort: 'Conforto', closeness: 'Proximidade Emocional', pain: 'Dor Na Intimidade' },
  },
};

const visualGuideByLang: Partial<LangCopy< { title: string; cards: Array<{ title: string; body: string }> }>> = {
  en: {
    title: 'Visual Path',
    cards: [
      { title: '1. Collect', body: 'Fill profile + select symptoms + add markers.' },
      { title: '2. Compare', body: 'Match values with reference ranges and cycle phase.' },
      { title: '3. Act', body: 'Use doctor questions and summary for next consultation.' },
    ],
  },
  ru: {
    title: 'Визуальный Путь',
    cards: [
      { title: '1. Сбор', body: 'Заполните профиль + симптомы + маркеры.' },
      { title: '2. Сравнение', body: 'Сопоставьте значения с референсами и фазой цикла.' },
      { title: '3. Действие', body: 'Используйте вопросы врачу и резюме на консультации.' },
    ],
  },
  uk: {
    title: 'Візуальний Маршрут',
    cards: [
      { title: '1. Збір', body: 'Заповніть профіль + симптоми + маркери.' },
      { title: '2. Порівняння', body: 'Зіставте значення з референсами та фазою циклу.' },
      { title: '3. Дія', body: 'Використайте питання до лікаря та підсумок на консультації.' },
    ],
  },
  es: {
    title: 'Ruta Visual',
    cards: [
      { title: '1. Recoger', body: 'Completa perfil + síntomas + marcadores.' },
      { title: '2. Comparar', body: 'Cruza valores con rangos y fase del ciclo.' },
      { title: '3. Actuar', body: 'Usa preguntas médicas y resumen en consulta.' },
    ],
  },
  fr: {
    title: 'Parcours Visuel',
    cards: [
      { title: '1. Collecter', body: 'Profil + symptômes + marqueurs.' },
      { title: '2. Comparer', body: 'Comparer aux références et à la phase du cycle.' },
      { title: '3. Agir', body: 'Utiliser questions médecin et résumé en consultation.' },
    ],
  },
  de: {
    title: 'Visueller Pfad',
    cards: [
      { title: '1. Sammeln', body: 'Profil + Symptome + Marker ausfüllen.' },
      { title: '2. Vergleichen', body: 'Werte mit Referenzen und Zyklusphase abgleichen.' },
      { title: '3. Handeln', body: 'Arztfragen und Zusammenfassung im Termin nutzen.' },
    ],
  },
  zh: {
    title: '可视路径',
    cards: [
      { title: '1. 收集', body: '填写档案 + 选择症状 + 添加指标。' },
      { title: '2. 对照', body: '将数值与参考范围及周期阶段对照。' },
      { title: '3. 行动', body: '带着总结和医生问题去复诊。' },
    ],
  },
  ja: {
    title: 'ビジュアル手順',
    cards: [
      { title: '1. 収集', body: 'プロフィール + 症状 + マーカーを入力。' },
      { title: '2. 比較', body: '基準値と周期フェーズで比較。' },
      { title: '3. 実行', body: '医師への質問と要約を診察で活用。' },
    ],
  },
  pt: {
    title: 'Fluxo Visual',
    cards: [
      { title: '1. Coletar', body: 'Preencha perfil + sintomas + marcadores.' },
      { title: '2. Comparar', body: 'Cruze valores com referências e fase do ciclo.' },
      { title: '3. Agir', body: 'Leve perguntas médicas e resumo para consulta.' },
    ],
  },
};

const reportUiByLang: Partial<LangCopy< {
  reportTitle: string;
  reportSubtitle: string;
  copy: string;
  print: string;
  share: string;
  download: string;
  pdf: string;
  sampleTitle: string;
  sampleBody: string;
  sampleDownload: string;
  servicePromise: string;
  serviceBullets: string[];
}>> = {
  en: {
    reportTitle: 'Luna29 Branded Report',
    reportSubtitle: 'Visual summary designed for your doctor conversation.',
    copy: 'Copy',
    print: 'Print',
    share: 'Share',
    download: 'Download',
    pdf: 'PDF',
    sampleTitle: 'Sample Report',
    sampleBody: 'Download an example of the report format you receive as a service.',
    sampleDownload: 'Download Sample',
    servicePromise: 'This is what you will have as a premium report service:',
    serviceBullets: ['Branded visual report in Luna29 style.', 'Cycle-aware hormone interpretation.', 'Doctor-ready summary with practical questions.', 'Copy, print, share, download, and PDF-friendly output.'],
  },
  ru: {
    reportTitle: 'Брендированный Отчет Luna29',
    reportSubtitle: 'Визуальное резюме для разговора с врачом.',
    copy: 'Копировать',
    print: 'Печать',
    share: 'Поделиться',
    download: 'Скачать',
    pdf: 'PDF',
    sampleTitle: 'Пример Отчета',
    sampleBody: 'Скачайте образец формата отчета, который вы получаете как сервис.',
    sampleDownload: 'Скачать Образец',
    servicePromise: 'Это то, что вы будете получать как сервис:',
    serviceBullets: ['Фирменный визуальный отчет в стиле Luna29.', 'Интерпретация гормонов с учетом фазы цикла.', 'Готовое резюме и вопросы для врача.', 'Копирование, печать, отправка, скачивание и PDF-формат.'],
  },
  uk: {
    reportTitle: 'Брендований Звіт Luna29',
    reportSubtitle: 'Візуальний підсумок для розмови з лікарем.',
    copy: 'Копіювати',
    print: 'Друк',
    share: 'Поділитися',
    download: 'Завантажити',
    pdf: 'PDF',
    sampleTitle: 'Приклад Звіту',
    sampleBody: 'Завантажте приклад формату звіту, який ви отримаєте як сервіс.',
    sampleDownload: 'Завантажити Приклад',
    servicePromise: 'Це те, що ви матимете як сервіс:',
    serviceBullets: ['Фірмовий візуальний звіт у стилі Luna29.', 'Інтерпретація гормонів з урахуванням фази циклу.', 'Готовий підсумок і питання до лікаря.', 'Копіювання, друк, поширення, завантаження та PDF-формат.'],
  },
  es: {
    reportTitle: 'Reporte De Marca Luna29',
    reportSubtitle: 'Resumen visual para conversación médica.',
    copy: 'Copiar',
    print: 'Imprimir',
    share: 'Compartir',
    download: 'Descargar',
    pdf: 'PDF',
    sampleTitle: 'Reporte De Ejemplo',
    sampleBody: 'Descarga un ejemplo del formato de reporte que tendrás como servicio.',
    sampleDownload: 'Descargar Ejemplo',
    servicePromise: 'Esto es lo que tendrás como servicio:',
    serviceBullets: ['Reporte visual con estilo Luna29.', 'Interpretación hormonal con fase del ciclo.', 'Resumen y preguntas listos para tu médico.', 'Copiar, imprimir, compartir, descargar y salida compatible con PDF.'],
  },
  fr: {
    reportTitle: 'Rapport De Marque Luna29',
    reportSubtitle: 'Résumé visuel pour votre consultation.',
    copy: 'Copier',
    print: 'Imprimer',
    share: 'Partager',
    download: 'Télécharger',
    pdf: 'PDF',
    sampleTitle: 'Exemple De Rapport',
    sampleBody: 'Téléchargez un exemple du format de rapport proposé en service.',
    sampleDownload: 'Télécharger Exemple',
    servicePromise: 'Voici ce que vous aurez en service:',
    serviceBullets: ['Rapport visuel avec identité Luna29.', 'Interprétation hormonale selon la phase du cycle.', 'Résumé et questions prêts pour le médecin.', 'Copier, imprimer, partager, télécharger et sortie compatible PDF.'],
  },
  de: {
    reportTitle: 'Luna29 Markenbericht',
    reportSubtitle: 'Visuelle Zusammenfassung für das Arztgespräch.',
    copy: 'Kopieren',
    print: 'Drucken',
    share: 'Teilen',
    download: 'Herunterladen',
    pdf: 'PDF',
    sampleTitle: 'Beispielbericht',
    sampleBody: 'Lade ein Beispiel des Report-Formats herunter, das du als Service erhältst.',
    sampleDownload: 'Beispiel Laden',
    servicePromise: 'Das erhalten Sie als Service:',
    serviceBullets: ['Visueller Bericht im Luna29-Stil.', 'Hormon-Interpretation nach Zyklusphase.', 'Arztfertige Zusammenfassung mit Fragen.', 'Kopieren, drucken, teilen, herunterladen und PDF-freundliche Ausgabe.'],
  },
  zh: {
    reportTitle: 'Luna29 品牌报告',
    reportSubtitle: '用于就医沟通的可视化总结。',
    copy: '复制',
    print: '打印',
    share: '分享',
    download: '下载',
    pdf: 'PDF',
    sampleTitle: '示例报告',
    sampleBody: '下载示例，查看你将获得的服务报告格式。',
    sampleDownload: '下载示例',
    servicePromise: '你将获得以下服务能力：',
    serviceBullets: ['Luna29 品牌化视觉报告。', '结合周期阶段的激素解读。', '可直接给医生使用的总结与问题。', '支持复制、打印、分享、下载与 PDF。'],
  },
  ja: {
    reportTitle: 'Luna29 ブランドレポート',
    reportSubtitle: '医師との対話に使えるビジュアル要約。',
    copy: 'コピー',
    print: '印刷',
    share: '共有',
    download: 'ダウンロード',
    pdf: 'PDF',
    sampleTitle: 'サンプルレポート',
    sampleBody: 'サービスで受け取るレポート形式のサンプルをダウンロード。',
    sampleDownload: 'サンプルを取得',
    servicePromise: 'このサービスで得られる内容:',
    serviceBullets: ['Luna29スタイルのブランドレポート。', '周期フェーズ連動のホルモン解釈。', '医師向け要約と質問を自動作成。', 'コピー / 印刷 / 共有 / ダウンロード / PDF 対応。'],
  },
  pt: {
    reportTitle: 'Relatório De Marca Luna29',
    reportSubtitle: 'Resumo visual para conversa com seu médico.',
    copy: 'Copiar',
    print: 'Imprimir',
    share: 'Compartilhar',
    download: 'Baixar',
    pdf: 'PDF',
    sampleTitle: 'Relatório Exemplo',
    sampleBody: 'Baixe um exemplo do formato de relatório que você terá como serviço.',
    sampleDownload: 'Baixar Exemplo',
    servicePromise: 'Isto é o que você terá como serviço:',
    serviceBullets: ['Relatório visual com identidade Luna29.', 'Interpretação hormonal por fase do ciclo.', 'Resumo e perguntas prontos para consulta.', 'Copiar, imprimir, compartilhar, baixar e saída compatível com PDF.'],
  },
  ar: {
    reportTitle: 'تقرير Luna29',
    reportSubtitle: 'ملخص بصري لمحادثتك مع الطبيب.',
    copy: 'نسخ',
    print: 'طباعة',
    share: 'مشاركة',
    download: 'تنزيل',
    pdf: 'PDF',
    sampleTitle: 'تقرير نموذجي',
    sampleBody: 'حمّلي مثالاً على تنسيق التقرير الذي تحصلين عليه كخدمة.',
    sampleDownload: 'تنزيل النموذج',
    servicePromise: 'إليك ما ستحصلين عليه كخدمة تقارير:',
    serviceBullets: ['تقرير بصري بأسلوب Luna29.', 'تفسير hormonal مع مراعاة الدورة.', 'ملخص وجاهز للطبيب مع أسئلة عملية.', 'نسخ، طباعة، مشاركة، تنزيل وPDF.'],
  },
  he: {
    reportTitle: 'דוח Luna29',
    reportSubtitle: 'סיכום ויזואלי לשיחה עם הרופא.',
    copy: 'העתקה',
    print: 'הדפסה',
    share: 'שיתוף',
    download: 'הורדה',
    pdf: 'PDF',
    sampleTitle: 'דוח לדוגמה',
    sampleBody: 'הורידי דוגמה לפורמט הדוח שתקבלי כשירות.',
    sampleDownload: 'הורדת דוגמה',
    servicePromise: 'זה מה שיהיה לך כשירות דוחות:',
    serviceBullets: ['דוח ויזואלי בסגנון Luna29.', 'פרשנות הורמונלית לפי מחזור.', 'סיכום ושאלות מוכנים לרופא.', 'העתקה, הדפסה, שיתוף, הורדה ו-PDF.'],
  },
};

const medicalFormByLang: Partial<LangCopy< {
  generatedAt: string;
  patientId: string;
  source: string;
  panel: string;
  allMarkers: string;
  summary: string;
  disclaimerTitle: string;
  disclaimerBody: string;
}>> = {
  en: {
    generatedAt: 'Generated At',
    patientId: 'Patient ID',
    source: 'Analysis Source',
    panel: 'Clinical Panel',
    allMarkers: 'All Lab Indicators',
    summary: 'Clinical Summary',
    disclaimerTitle: 'MEDICAL DISCLAIMER',
    disclaimerBody: 'THIS REPORT IS INFORMATIONAL ONLY AND DOES NOT REPLACE MEDICAL DIAGNOSIS OR TREATMENT. PLEASE CONSULT A LICENSED PHYSICIAN IF SYMPTOMS PERSIST OR WORSEN.',
  },
  ru: {
    generatedAt: 'Дата Генерации',
    patientId: 'ID Пользователя',
    source: 'Источник Анализа',
    panel: 'Клиническая Панель',
    allMarkers: 'Все Лаб Показатели',
    summary: 'Клиническое Резюме',
    disclaimerTitle: 'МЕДИЦИНСКИЙ ДИСКЛЕЙМЕР',
    disclaimerBody: 'ЭТОТ ОТЧЕТ НОСИТ ИНФОРМАЦИОННЫЙ ХАРАКТЕР И НЕ ЗАМЕНЯЕТ МЕДИЦИНСКУЮ ДИАГНОСТИКУ И ЛЕЧЕНИЕ. ПРИ НЕОБХОДИМОСТИ ОБРАТИТЕСЬ К ЛИЦЕНЗИРОВАННОМУ ВРАЧУ.',
  },
  uk: {
    generatedAt: 'Дата Генерації',
    patientId: 'ID Користувача',
    source: 'Джерело Аналізу',
    panel: 'Клінічна Панель',
    allMarkers: 'Усі Лаб Показники',
    summary: 'Клінічний Підсумок',
    disclaimerTitle: 'МЕДИЧНИЙ ДИСКЛЕЙМЕР',
    disclaimerBody: 'ЦЕЙ ЗВІТ МАЄ ІНФОРМАЦІЙНИЙ ХАРАКТЕР І НЕ ЗАМІНЮЄ МЕДИЧНУ ДІАГНОСТИКУ ТА ЛІКУВАННЯ. ЗА ПОТРЕБИ ЗВЕРНІТЬСЯ ДО ЛІЦЕНЗОВАНОГО ЛІКАРЯ.',
  },
  es: {
    generatedAt: 'Fecha De Generación',
    patientId: 'ID De Usuario',
    source: 'Origen Del Análisis',
    panel: 'Panel Clínico',
    allMarkers: 'Todos Los Indicadores',
    summary: 'Resumen Clínico',
    disclaimerTitle: 'DESCARGO MÉDICO',
    disclaimerBody: 'ESTE REPORTE ES SOLO INFORMATIVO Y NO SUSTITUYE DIAGNÓSTICO O TRATAMIENTO MÉDICO. CONSULTE A UN MÉDICO LICENCIADO SI LOS SÍNTOMAS PERSISTEN O EMPEORAN.',
  },
  fr: {
    generatedAt: 'Date De Génération',
    patientId: 'ID Utilisateur',
    source: "Source D'analyse",
    panel: 'Panel Clinique',
    allMarkers: 'Tous Les Indicateurs',
    summary: 'Résumé Clinique',
    disclaimerTitle: 'AVERTISSEMENT MÉDICAL',
    disclaimerBody: 'CE RAPPORT EST INFORMATIF ET NE REMPLACE PAS UN DIAGNOSTIC OU UN TRAITEMENT MÉDICAL. CONSULTEZ UN MÉDECIN AGRÉÉ SI LES SYMPTÔMES PERSISTENT OU S’AGGRAVENT.',
  },
  de: {
    generatedAt: 'Erstellt Am',
    patientId: 'Benutzer-ID',
    source: 'Analysequelle',
    panel: 'Klinisches Panel',
    allMarkers: 'Alle Laborwerte',
    summary: 'Klinische Zusammenfassung',
    disclaimerTitle: 'MEDIZINISCHER HINWEIS',
    disclaimerBody: 'DIESER BERICHT DIENT NUR DER INFORMATION UND ERSETZT KEINE MEDIZINISCHE DIAGNOSE ODER THERAPIE. BITTE WENDEN SIE SICH BEI BEDARF AN EINE ZUGELASSENE ÄRZTIN ODER EINEN ZUGELASSENEN ARZT.',
  },
  zh: {
    generatedAt: '生成时间',
    patientId: '用户ID',
    source: '分析来源',
    panel: '临床面板',
    allMarkers: '全部实验室指标',
    summary: '临床总结',
    disclaimerTitle: '医疗免责声明',
    disclaimerBody: '本报告仅供信息参考，不替代医疗诊断或治疗。如有需要，请咨询持证医生。',
  },
  ja: {
    generatedAt: '生成日時',
    patientId: 'ユーザーID',
    source: '解析ソース',
    panel: '臨床パネル',
    allMarkers: '全ラボ指標',
    summary: '臨床サマリー',
    disclaimerTitle: '医療免責事項',
    disclaimerBody: '本レポートは情報提供のみを目的とし、医療診断や治療の代替ではありません。必要に応じて医師にご相談ください。',
  },
  pt: {
    generatedAt: 'Data De Geração',
    patientId: 'ID Do Usuário',
    source: 'Origem Da Análise',
    panel: 'Painel Clínico',
    allMarkers: 'Todos Os Indicadores',
    summary: 'Resumo Clínico',
    disclaimerTitle: 'AVISO MÉDICO',
    disclaimerBody: 'ESTE RELATÓRIO É APENAS INFORMATIVO E NÃO SUBSTITUI DIAGNÓSTICO OU TRATAMENTO MÉDICO. PROCURE UM MÉDICO LICENCIADO SE NECESSÁRIO.',
  },
};

const reportLanguageUiByLang: Partial<LangCopy< { label: string; hint: string }>> = {
  en: { label: 'Report Language', hint: 'Generated files use this language.' },
  ru: { label: 'Язык Отчета', hint: 'Сгенерированные файлы будут на этом языке.' },
  uk: { label: 'Мова Звіту', hint: 'Згенеровані файли будуть цією мовою.' },
  es: { label: 'Idioma Del Reporte', hint: 'Los archivos se generan en este idioma.' },
  fr: { label: 'Langue Du Rapport', hint: 'Les fichiers seront générés dans cette langue.' },
  de: { label: 'Berichtssprache', hint: 'Exportdateien werden in dieser Sprache erstellt.' },
  zh: { label: '报告语言', hint: '导出文件将使用该语言。' },
  ja: { label: 'レポート言語', hint: '生成ファイルはこの言語で作成されます。' },
  pt: { label: 'Idioma Do Relatório', hint: 'Os arquivos serão gerados neste idioma.' },
};

const reportLanguageNames: LangCopy<string> = {
  en: 'English',
  ru: 'Русский',
  uk: 'Українська',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  zh: '中文',
  ja: '日本語',
  pt: 'Português',
  ar: 'العربية',
  he: 'עברית',
};

const localeByLang: LangCopy<string> = {
  en: 'en-US',
  ru: 'ru-RU',
  uk: 'uk-UA',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  zh: 'zh-CN',
  ja: 'ja-JP',
  pt: 'pt-PT',
  ar: 'ar-SA',
  he: 'he-IL',
};

const reportSourceByLang: Partial<LangCopy< { textInput: string; manualTable: string; profileOnly: string }>> = {
  en: { textInput: 'text input', manualTable: 'manual table', profileOnly: 'manual profile only' },
  ru: { textInput: 'текстовый ввод', manualTable: 'ручная таблица', profileOnly: 'только профиль' },
  uk: { textInput: 'текстове введення', manualTable: 'ручна таблиця', profileOnly: 'лише профіль' },
  es: { textInput: 'entrada de texto', manualTable: 'tabla manual', profileOnly: 'solo perfil manual' },
  fr: { textInput: 'saisie texte', manualTable: 'tableau manuel', profileOnly: 'profil uniquement' },
  de: { textInput: 'Texteingabe', manualTable: 'manuelle Tabelle', profileOnly: 'nur Profil' },
  zh: { textInput: '文本输入', manualTable: '手动表格', profileOnly: '仅个人资料' },
  ja: { textInput: 'テキスト入力', manualTable: '手動テーブル', profileOnly: 'プロフィールのみ' },
  pt: { textInput: 'entrada de texto', manualTable: 'tabela manual', profileOnly: 'somente perfil' },
};

const markerCategoryByLang: Partial<LangCopy< {
  cycle: string;
  thyroid: string;
  sexual: string;
  metabolic: string;
  nutrient: string;
  other: string;
}>> = {
  en: { cycle: 'Cycle / Ovarian', thyroid: 'Thyroid', sexual: 'Androgen / Sexual Health', metabolic: 'Metabolic', nutrient: 'Nutrient / Reserve', other: 'Other' },
  ru: { cycle: 'Цикл / Яичники', thyroid: 'Щитовидка', sexual: 'Андрогены / Сексуальное здоровье', metabolic: 'Метаболизм', nutrient: 'Дефициты / Резерв', other: 'Другое' },
  uk: { cycle: 'Цикл / Яєчники', thyroid: 'Щитоподібна', sexual: 'Андрогени / Сексуальне здоровʼя', metabolic: 'Метаболізм', nutrient: 'Дефіцити / Резерв', other: 'Інше' },
  es: { cycle: 'Ciclo / Ovario', thyroid: 'Tiroides', sexual: 'Andrógenos / Salud Sexual', metabolic: 'Metabólico', nutrient: 'Nutrientes / Reserva', other: 'Otro' },
  fr: { cycle: 'Cycle / Ovarien', thyroid: 'Thyroïde', sexual: 'Androgènes / Santé Sexuelle', metabolic: 'Métabolique', nutrient: 'Nutriments / Réserve', other: 'Autre' },
  de: { cycle: 'Zyklus / Ovar', thyroid: 'Schilddrüse', sexual: 'Androgen / Sexualgesundheit', metabolic: 'Metabolisch', nutrient: 'Nährstoff / Reserve', other: 'Sonstiges' },
  zh: { cycle: '周期 / 卵巢', thyroid: '甲状腺', sexual: '雄激素 / 性健康', metabolic: '代谢', nutrient: '营养 / 储备', other: '其他' },
  ja: { cycle: '周期 / 卵巣', thyroid: '甲状腺', sexual: 'アンドロゲン / 性健康', metabolic: '代謝', nutrient: '栄養 / 予備', other: 'その他' },
  pt: { cycle: 'Ciclo / Ovário', thyroid: 'Tireoide', sexual: 'Andrógenos / Saúde Sexual', metabolic: 'Metabólico', nutrient: 'Nutrientes / Reserva', other: 'Outro' },
};

const reportActionsByLang: Partial<LangCopy< {
  copied: string;
  copyFailed: string;
  shared: string;
  shareFailed: string;
  printOpened: string;
  printBlocked: string;
  downloaded: string;
  pdfHint: string;
  pdfBlocked: string;
  sampleDownloaded: string;
  clearDraft: string;
  draftCleared: string;
  autosaved: string;
}>> = {
  en: { copied: 'Copied', copyFailed: 'Copy failed', shared: 'Shared', shareFailed: 'Share failed', printOpened: 'Print dialog opened', printBlocked: 'Print blocked', downloaded: 'Downloaded', pdfHint: 'Use Save as PDF in print dialog', pdfBlocked: 'PDF print blocked', sampleDownloaded: 'Sample downloaded', clearDraft: 'Clear Draft', draftCleared: 'Draft cleared', autosaved: 'Autosaved' },
  ru: { copied: 'Скопировано', copyFailed: 'Не удалось скопировать', shared: 'Отправлено', shareFailed: 'Ошибка отправки', printOpened: 'Окно печати открыто', printBlocked: 'Печать заблокирована', downloaded: 'Скачано', pdfHint: 'Сохраните как PDF в окне печати', pdfBlocked: 'PDF-печать заблокирована', sampleDownloaded: 'Образец скачан', clearDraft: 'Очистить Черновик', draftCleared: 'Черновик очищен', autosaved: 'Автосохранено' },
  uk: { copied: 'Скопійовано', copyFailed: 'Не вдалося скопіювати', shared: 'Надіслано', shareFailed: 'Помилка надсилання', printOpened: 'Відкрито вікно друку', printBlocked: 'Друк заблоковано', downloaded: 'Завантажено', pdfHint: 'Збережіть як PDF у вікні друку', pdfBlocked: 'PDF-друк заблоковано', sampleDownloaded: 'Приклад завантажено', clearDraft: 'Очистити Чернетку', draftCleared: 'Чернетку очищено', autosaved: 'Автозбережено' },
  es: { copied: 'Copiado', copyFailed: 'Error al copiar', shared: 'Compartido', shareFailed: 'Error al compartir', printOpened: 'Diálogo de impresión abierto', printBlocked: 'Impresión bloqueada', downloaded: 'Descargado', pdfHint: 'Usa Guardar como PDF en impresión', pdfBlocked: 'PDF bloqueado', sampleDownloaded: 'Ejemplo descargado', clearDraft: 'Borrar Borrador', draftCleared: 'Borrador borrado', autosaved: 'Guardado automático' },
  fr: { copied: 'Copié', copyFailed: 'Échec de copie', shared: 'Partagé', shareFailed: 'Échec du partage', printOpened: 'Fenêtre d’impression ouverte', printBlocked: 'Impression bloquée', downloaded: 'Téléchargé', pdfHint: 'Utilisez Enregistrer en PDF', pdfBlocked: 'PDF bloqué', sampleDownloaded: 'Exemple téléchargé', clearDraft: 'Effacer Brouillon', draftCleared: 'Brouillon effacé', autosaved: 'Enregistré automatiquement' },
  de: { copied: 'Kopiert', copyFailed: 'Kopieren fehlgeschlagen', shared: 'Geteilt', shareFailed: 'Teilen fehlgeschlagen', printOpened: 'Druckdialog geöffnet', printBlocked: 'Drucken blockiert', downloaded: 'Heruntergeladen', pdfHint: 'Im Druckdialog als PDF speichern', pdfBlocked: 'PDF blockiert', sampleDownloaded: 'Beispiel heruntergeladen', clearDraft: 'Entwurf Löschen', draftCleared: 'Entwurf gelöscht', autosaved: 'Automatisch gespeichert' },
  zh: { copied: '已复制', copyFailed: '复制失败', shared: '已分享', shareFailed: '分享失败', printOpened: '已打开打印窗口', printBlocked: '打印被阻止', downloaded: '已下载', pdfHint: '请在打印窗口中保存为 PDF', pdfBlocked: 'PDF 打印被阻止', sampleDownloaded: '示例已下载', clearDraft: '清除草稿', draftCleared: '草稿已清除', autosaved: '已自动保存' },
  ja: { copied: 'コピーしました', copyFailed: 'コピー失敗', shared: '共有しました', shareFailed: '共有失敗', printOpened: '印刷ダイアログを開きました', printBlocked: '印刷がブロックされました', downloaded: 'ダウンロードしました', pdfHint: '印刷画面で PDF 保存してください', pdfBlocked: 'PDF 印刷がブロックされました', sampleDownloaded: 'サンプルをダウンロードしました', clearDraft: '下書きを削除', draftCleared: '下書きを削除しました', autosaved: '自動保存済み' },
  pt: { copied: 'Copiado', copyFailed: 'Falha ao copiar', shared: 'Compartilhado', shareFailed: 'Falha ao compartilhar', printOpened: 'Janela de impressão aberta', printBlocked: 'Impressão bloqueada', downloaded: 'Baixado', pdfHint: 'Use Salvar como PDF na impressão', pdfBlocked: 'PDF bloqueado', sampleDownloaded: 'Exemplo baixado', clearDraft: 'Limpar Rascunho', draftCleared: 'Rascunho limpo', autosaved: 'Salvo automaticamente' },
};

const reportConflictsByLang: Partial<LangCopy< {
  title: string;
  hint: string;
  choose: string;
  confidence: string;
  source: string;
  manual: string;
  text: string;
  ocr: string;
  pdf: string;
}>> = {
  en: { title: 'Data Conflicts', hint: 'Multiple values found for the same marker. Choose which value goes into the final report.', choose: 'Use for report', confidence: 'Confidence', source: 'Source', manual: 'Manual', text: 'Text', ocr: 'OCR scan', pdf: 'PDF scan' },
  ru: { title: 'Конфликты Данных', hint: 'Для одного маркера найдено несколько значений. Выберите, какое пойдет в итоговый отчет.', choose: 'В отчет', confidence: 'Надежность', source: 'Источник', manual: 'Ручной ввод', text: 'Текст', ocr: 'OCR-скан', pdf: 'PDF-скан' },
  uk: { title: 'Конфлікти Даних', hint: 'Для одного маркера знайдено кілька значень. Оберіть, яке піде у фінальний звіт.', choose: 'У звіт', confidence: 'Надійність', source: 'Джерело', manual: 'Ручне введення', text: 'Текст', ocr: 'OCR-скан', pdf: 'PDF-скан' },
  es: { title: 'Conflictos De Datos', hint: 'Se encontraron varios valores para el mismo marcador. Elige cuál usar en el reporte final.', choose: 'Usar en reporte', confidence: 'Confianza', source: 'Fuente', manual: 'Manual', text: 'Texto', ocr: 'Escaneo OCR', pdf: 'Escaneo PDF' },
  fr: { title: 'Conflits De Données', hint: 'Plusieurs valeurs détectées pour le même marqueur. Choisissez celle à utiliser dans le rapport final.', choose: 'Utiliser', confidence: 'Confiance', source: 'Source', manual: 'Saisie manuelle', text: 'Texte', ocr: 'Scan OCR', pdf: 'Scan PDF' },
  de: { title: 'Datenkonflikte', hint: 'Mehrere Werte für denselben Marker gefunden. Wählen Sie den Wert für den finalen Bericht.', choose: 'Für Bericht nutzen', confidence: 'Sicherheit', source: 'Quelle', manual: 'Manuell', text: 'Text', ocr: 'OCR-Scan', pdf: 'PDF-Scan' },
  zh: { title: '数据冲突', hint: '同一指标检测到多个数值。请选择用于最终报告的数值。', choose: '用于报告', confidence: '置信度', source: '来源', manual: '手动输入', text: '文本', ocr: 'OCR 扫描', pdf: 'PDF 扫描' },
  ja: { title: 'データ競合', hint: '同じマーカーに複数の値があります。最終レポートに使う値を選択してください。', choose: 'レポートに使用', confidence: '信頼度', source: 'ソース', manual: '手入力', text: 'テキスト', ocr: 'OCRスキャン', pdf: 'PDFスキャン' },
  pt: { title: 'Conflitos De Dados', hint: 'Foram encontrados vários valores para o mesmo marcador. Escolha qual usar no relatório final.', choose: 'Usar no relatório', confidence: 'Confiabilidade', source: 'Fonte', manual: 'Manual', text: 'Texto', ocr: 'Scan OCR', pdf: 'Scan PDF' },
};

type ReportsUiCopy = {
  badge: string;
  title: string;
  titleAccent: string;
  workflow: string;
  identityTitle: string;
  includeId: string;
  includeName: string;
  userIdOverride: string;
  current: string;
  privateIdentity: string;
  profileTitle: string;
  goals: string;
  symptomsQuick: string;
  labTable: string;
  marker: string;
  value: string;
  unit: string;
  reference: string;
  date: string;
  note: string;
  delete: string;
  workflowTitle: string;
  loadingGuide: string;
  workflowReportStep: string;
  labsRequiredHint: string;
  profileBirthYear: string;
  profileCycleLength: string;
  profileCycleDay: string;
  profileMedications: string;
  profileKnownConditions: string;
  addRow: string;
  uploadTitle: string;
  uploadFile: string;
  uploadPlaceholder: string;
  readyExtraction: string;
  generate: string;
  reading: string;
  quickOverview: string;
  withinRange: string;
  outOfRange: string;
  hormoneInfographic: string;
  unlockInfographic: string;
  day: string;
  hormoneSignals: string;
  questionsDoctor: string;
  detectedMarkers: string;
  refShort: string;
  status: string;
  na: string;
  summaryTitle: string;
  copyDoctor: string;
  reportReadyTitle: string;
  reportReadyBody: string;
  safetyTitle: string;
  safetyBody: string;
  unsupportedFormat: string;
  extractFailed: string;
  aiScan: string;
};

const reportsUiByLang: Partial<LangCopy<Partial<ReportsUiCopy>>> = {
  en: { badge: 'My Health Reports', title: 'Reports', titleAccent: 'That Explain', workflow: 'Simple workflow: choose report identity, fill your markers, upload image/text, and get a clear hormone-focused summary.', identityTitle: 'Report Identity', includeId: 'Include ID in report', includeName: 'Include Name in report', userIdOverride: 'User ID (optional override)', current: 'Current', privateIdentity: 'Private (no name/ID in summary)', profileTitle: 'Personal Health Profile', goals: 'Goals / Symptoms Priority', symptomsQuick: 'Today symptoms (quick select)', labTable: 'Lab Table', addRow: 'Add Row', uploadTitle: 'Upload scan/text', uploadFile: 'Upload File', uploadPlaceholder: 'Paste report text here or upload an image/text/PDF file...', readyExtraction: 'Ready for extraction', generate: 'Generate Report', reading: 'Reading...', quickOverview: 'Quick Overview', withinRange: 'Within range', outOfRange: 'Out of range', hormoneInfographic: 'Hormone Infographic', unlockInfographic: 'Add markers to unlock infographic.', day: 'day', hormoneSignals: 'Hormone Signals', questionsDoctor: 'Questions for Doctor', detectedMarkers: 'Detected Markers', refShort: 'Ref', status: 'Status', na: 'n/a', summaryTitle: 'Clinical-Friendly Summary', copyDoctor: 'Copy for doctor', reportReadyTitle: 'Report ready zone', reportReadyBody: 'Choose identity, fill profile + table, then Generate Report.', safetyTitle: 'Safety note', safetyBody: 'Luna29 provides educational interpretation only. Final diagnosis and treatment decisions require a licensed clinician.', unsupportedFormat: 'Unsupported format. Use text, image, or PDF files.', extractFailed: 'Could not extract text from file.', aiScan: 'AI scan' },
  ru: { badge: 'Отчеты здоровья', title: 'Отчеты', titleAccent: 'С Пояснением', workflow: 'Простой процесс: выберите идентификацию отчета, заполните маркеры, загрузите фото/текст и получите понятное гормональное резюме.', identityTitle: 'Идентификация Отчета', includeId: 'Включить ID в отчет', includeName: 'Включить имя в отчет', userIdOverride: 'ID пользователя (опционально)', current: 'Текущее', privateIdentity: 'Приватно (без имени/ID в резюме)', profileTitle: 'Персональный Профиль Здоровья', goals: 'Цели / Приоритет симптомов', symptomsQuick: 'Симптомы сегодня (быстрый выбор)', labTable: 'Таблица Анализов', marker: 'Маркер', value: 'Значение', unit: 'Ед.', reference: 'Референс', date: 'Дата', note: 'Заметка', delete: 'Удалить', workflowTitle: 'Маршрут отчёта', loadingGuide: 'Загрузка справки...', workflowReportStep: 'Сгенерировать отчёт', labsRequiredHint: 'Добавьте хотя бы один маркер или вставьте текст анализа перед генерацией.', profileBirthYear: 'Год рождения', profileCycleLength: 'Длина цикла', profileCycleDay: 'День цикла', profileMedications: 'Текущие препараты', profileKnownConditions: 'Известные состояния', addRow: 'Добавить Строку', uploadTitle: 'Загрузка скана/текста', uploadFile: 'Загрузить Файл', uploadPlaceholder: 'Вставьте текст отчета или загрузите файл изображения/текста/PDF...', readyExtraction: 'Готово к распознаванию', generate: 'Сгенерировать Отчет', reading: 'Чтение...', quickOverview: 'Быстрый Обзор', withinRange: 'В норме', outOfRange: 'Вне нормы', hormoneInfographic: 'Гормональная Инфографика', unlockInfographic: 'Добавьте маркеры, чтобы открыть инфографику.', day: 'день', hormoneSignals: 'Гормональные Сигналы', questionsDoctor: 'Вопросы Врачу', detectedMarkers: 'Обнаруженные Маркеры', refShort: 'Реф.', status: 'Статус', na: 'н/д', summaryTitle: 'Клинически Понятное Резюме', copyDoctor: 'Скопировать для врача', reportReadyTitle: 'Зона готовности отчета', reportReadyBody: 'Выберите идентификацию, заполните профиль и таблицу, затем сгенерируйте отчет.', safetyTitle: 'Важное примечание', safetyBody: 'Luna29 дает образовательную интерпретацию. Окончательный диагноз и лечение определяет лицензированный врач.', unsupportedFormat: 'Неподдерживаемый формат. Используйте текст, изображение или PDF.', extractFailed: 'Не удалось извлечь текст из файла.', aiScan: 'AI-скан' },
  uk: { badge: 'Звіти здоров\u2019я', title: 'Звіти', titleAccent: 'З Поясненням', workflow: 'Простий процес: оберіть ідентифікацію звіту, заповніть маркери, завантажте фото/текст і отримайте зрозумілий гормональний підсумок.', identityTitle: 'Ідентифікація Звіту', includeId: 'Додати ID у звіт', includeName: 'Додати імʼя у звіт', userIdOverride: 'ID користувача (опціонально)', current: 'Поточне', privateIdentity: 'Приватно (без імені/ID у підсумку)', profileTitle: 'Персональний Профіль Здоровʼя', goals: 'Цілі / Пріоритет симптомів', symptomsQuick: 'Симптоми сьогодні (швидкий вибір)', labTable: 'Таблиця Аналізів', marker: 'Маркер', value: 'Значення', unit: 'Од.', reference: 'Референс', date: 'Дата', note: 'Нотатка', delete: 'Видалити', workflowTitle: 'Маршрут звіту', loadingGuide: 'Завантаження довідки...', workflowReportStep: 'Згенерувати звіт', labsRequiredHint: 'Додайте хоча б один маркер або вставте текст аналізів перед генерацією.', profileBirthYear: 'Рік народження', profileCycleLength: 'Довжина циклу', profileCycleDay: 'День циклу', profileMedications: 'Поточні препарати', profileKnownConditions: 'Відомі стани', addRow: 'Додати Рядок', uploadTitle: 'Завантаження скану/тексту', uploadFile: 'Завантажити Файл', uploadPlaceholder: 'Вставте текст звіту або завантажте файл зображення/тексту/PDF...', readyExtraction: 'Готово до розпізнавання', generate: 'Згенерувати Звіт', reading: 'Зчитування...', quickOverview: 'Швидкий Огляд', withinRange: 'У нормі', outOfRange: 'Поза нормою', hormoneInfographic: 'Гормональна Інфографіка', unlockInfographic: 'Додайте маркери, щоб відкрити інфографіку.', day: 'день', hormoneSignals: 'Гормональні Сигнали', questionsDoctor: 'Питання До Лікаря', detectedMarkers: 'Виявлені Маркери', refShort: 'Реф.', status: 'Статус', na: 'н/д', summaryTitle: 'Клінічно Зрозумілий Підсумок', copyDoctor: 'Скопіювати для лікаря', reportReadyTitle: 'Зона готовності звіту', reportReadyBody: 'Оберіть ідентифікацію, заповніть профіль і таблицю, потім згенеруйте звіт.', safetyTitle: 'Важлива примітка', safetyBody: 'Luna29 надає освітню інтерпретацію. Остаточний діагноз і лікування визначає ліцензований лікар.', unsupportedFormat: 'Непідтримуваний формат. Використовуйте текст, зображення або PDF.', extractFailed: 'Не вдалося зчитати текст із файлу.', aiScan: 'AI-скан' },
  es: { badge: 'Informes de salud', title: 'Reportes', titleAccent: 'Que Explican', workflow: 'Flujo simple: elige identidad del reporte, completa marcadores, sube imagen/texto y obtén un resumen hormonal claro.', identityTitle: 'Identidad Del Reporte', includeId: 'Incluir ID en el reporte', includeName: 'Incluir nombre en el reporte', userIdOverride: 'ID de usuario (opcional)', current: 'Actual', privateIdentity: 'Privado (sin nombre/ID en el resumen)', profileTitle: 'Perfil Personal De Salud', goals: 'Objetivos / Prioridad de síntomas', symptomsQuick: 'Síntomas de hoy (selección rápida)', labTable: 'Tabla De Laboratorio', addRow: 'Agregar Fila', uploadTitle: 'Subir escaneo/texto', uploadFile: 'Subir Archivo', uploadPlaceholder: 'Pega texto del reporte o sube un archivo de imagen/texto/PDF...', readyExtraction: 'Listo para extracción', generate: 'Generar Reporte', reading: 'Leyendo...', quickOverview: 'Resumen Rápido', withinRange: 'En rango', outOfRange: 'Fuera de rango', hormoneInfographic: 'Infografía Hormonal', unlockInfographic: 'Agrega marcadores para activar la infografía.', day: 'día', hormoneSignals: 'Señales Hormonales', questionsDoctor: 'Preguntas Para El Médico', detectedMarkers: 'Marcadores Detectados', refShort: 'Ref', status: 'Estado', na: 'n/d', summaryTitle: 'Resumen Clínico Claro', copyDoctor: 'Copiar para el médico', reportReadyTitle: 'Zona lista para reporte', reportReadyBody: 'Elige identidad, completa perfil + tabla y luego genera el reporte.', safetyTitle: 'Nota de seguridad', safetyBody: 'Luna29 ofrece interpretación educativa. El diagnóstico y tratamiento final requiere personal médico licenciado.', unsupportedFormat: 'Formato no compatible. Usa archivos de texto, imagen o PDF.', extractFailed: 'No se pudo extraer texto del archivo.', aiScan: 'escaneo AI' },
  fr: { badge: 'Rapports santé', title: 'Rapports', titleAccent: 'Qui Expliquent', workflow: 'Flux simple: choisissez l identité, remplissez les marqueurs, chargez image/texte et obtenez un résumé hormonal clair.', identityTitle: 'Identité Du Rapport', includeId: 'Inclure ID dans le rapport', includeName: 'Inclure le nom dans le rapport', userIdOverride: 'ID utilisateur (optionnel)', current: 'Actuel', privateIdentity: 'Privé (sans nom/ID dans le résumé)', profileTitle: 'Profil Personnel De Santé', goals: 'Objectifs / Priorité des symptômes', symptomsQuick: 'Symptômes du jour (sélection rapide)', labTable: 'Tableau De Laboratoire', addRow: 'Ajouter Ligne', uploadTitle: 'Téléverser scan/texte', uploadFile: 'Téléverser Fichier', uploadPlaceholder: 'Collez le texte du rapport ou téléversez un fichier image/texte/PDF...', readyExtraction: 'Prêt pour extraction', generate: 'Générer Rapport', reading: 'Lecture...', quickOverview: 'Aperçu Rapide', withinRange: 'Dans la norme', outOfRange: 'Hors norme', hormoneInfographic: 'Infographie Hormonale', unlockInfographic: 'Ajoutez des marqueurs pour activer l infographie.', day: 'jour', hormoneSignals: 'Signaux Hormonaux', questionsDoctor: 'Questions Pour Le Médecin', detectedMarkers: 'Marqueurs Détectés', refShort: 'Réf', status: 'Statut', na: 'n/d', summaryTitle: 'Résumé Clinique Lisible', copyDoctor: 'Copier pour le médecin', reportReadyTitle: 'Zone de rapport prête', reportReadyBody: 'Choisissez l identité, complétez profil + tableau, puis générez le rapport.', safetyTitle: 'Note de sécurité', safetyBody: 'Luna29 fournit une interprétation éducative. Le diagnostic et le traitement final nécessitent un médecin agréé.', unsupportedFormat: 'Format non pris en charge. Utilisez un fichier texte, image ou PDF.', extractFailed: 'Impossible d extraire le texte du fichier.', aiScan: 'scan AI' },
  de: { badge: 'Gesundheitsberichte', title: 'Berichte', titleAccent: 'Die Erklären', workflow: 'Einfacher Ablauf: Berichtsidentität wählen, Marker ausfüllen, Bild/Text hochladen und klare hormonfokussierte Zusammenfassung erhalten.', identityTitle: 'Berichtsidentität', includeId: 'ID im Bericht anzeigen', includeName: 'Name im Bericht anzeigen', userIdOverride: 'Benutzer-ID (optional)', current: 'Aktuell', privateIdentity: 'Privat (kein Name/ID in der Zusammenfassung)', profileTitle: 'Persönliches Gesundheitsprofil', goals: 'Ziele / Symptom-Priorität', symptomsQuick: 'Heutige Symptome (Schnellauswahl)', labTable: 'Labortabelle', addRow: 'Zeile Hinzufügen', uploadTitle: 'Scan/Text hochladen', uploadFile: 'Datei Hochladen', uploadPlaceholder: 'Berichtstext einfügen oder Bild/Text/PDF-Datei hochladen...', readyExtraction: 'Bereit für Extraktion', generate: 'Bericht Erstellen', reading: 'Lese...', quickOverview: 'Schnellübersicht', withinRange: 'Im Bereich', outOfRange: 'Außerhalb', hormoneInfographic: 'Hormon-Infografik', unlockInfographic: 'Marker hinzufügen, um die Infografik freizuschalten.', day: 'Tag', hormoneSignals: 'Hormonsignale', questionsDoctor: 'Fragen Für Den Arzt', detectedMarkers: 'Erkannte Marker', refShort: 'Ref', status: 'Status', na: 'k.A.', summaryTitle: 'Klinisch Verständliche Zusammenfassung', copyDoctor: 'Für Arzt kopieren', reportReadyTitle: 'Bericht bereit', reportReadyBody: 'Identität wählen, Profil + Tabelle ausfüllen und dann Bericht erzeugen.', safetyTitle: 'Sicherheitshinweis', safetyBody: 'Luna29 bietet eine edukative Interpretation. Endgültige Diagnose und Therapie erfordern medizinisches Fachpersonal.', unsupportedFormat: 'Nicht unterstütztes Format. Bitte Text-, Bild- oder PDF-Datei verwenden.', extractFailed: 'Text konnte aus der Datei nicht extrahiert werden.', aiScan: 'AI-Scan' },
  zh: { badge: '健康报告', title: '报告', titleAccent: '可解释', workflow: '简单流程：选择报告身份、填写指标、上传图片/文本，获得清晰的激素重点总结。', identityTitle: '报告身份', includeId: '在报告中包含ID', includeName: '在报告中包含姓名', userIdOverride: '用户ID（可选）', current: '当前', privateIdentity: '私密（摘要中不含姓名/ID）', profileTitle: '个人健康档案', goals: '目标 / 症状优先级', symptomsQuick: '今日症状（快速选择）', labTable: '化验表', addRow: '添加行', uploadTitle: '上传扫描/文本', uploadFile: '上传文件', uploadPlaceholder: '粘贴报告文本或上传图片/文本/PDF文件...', readyExtraction: '可开始提取', generate: '生成报告', reading: '读取中...', quickOverview: '快速概览', withinRange: '范围内', outOfRange: '超出范围', hormoneInfographic: '激素信息图', unlockInfographic: '添加指标以解锁信息图。', day: '天', hormoneSignals: '激素信号', questionsDoctor: '给医生的问题', detectedMarkers: '已识别指标', refShort: '参考', status: '状态', na: '无', summaryTitle: '临床友好总结', copyDoctor: '复制给医生', reportReadyTitle: '报告准备区', reportReadyBody: '先选择身份，填写档案和表格，再生成报告。', safetyTitle: '安全说明', safetyBody: 'Luna29 仅提供教育性解读。最终诊断与治疗需由持证医生完成。', unsupportedFormat: '不支持该格式。请使用文本、图片或 PDF 文件。', extractFailed: '无法从文件中提取文本。', aiScan: 'AI 扫描' },
  ja: { badge: '健康レポート', title: 'レポート', titleAccent: 'を明確化', workflow: 'シンプルな流れ: レポート識別を選択し、マーカーを入力、画像/テキストをアップロードして、ホルモン重視の明確な要約を取得。', identityTitle: 'レポート識別', includeId: 'レポートにIDを含める', includeName: 'レポートに名前を含める', userIdOverride: 'ユーザーID（任意）', current: '現在', privateIdentity: '非公開（要約に名前/IDなし）', profileTitle: '個人健康プロフィール', goals: '目標 / 症状優先度', symptomsQuick: '本日の症状（クイック選択）', labTable: '検査テーブル', addRow: '行を追加', uploadTitle: 'スキャン/テキストをアップロード', uploadFile: 'ファイルをアップロード', uploadPlaceholder: 'レポート本文を貼り付けるか、画像/テキスト/PDFファイルをアップロードしてください...', readyExtraction: '抽出の準備完了', generate: 'レポート生成', reading: '読み取り中...', quickOverview: 'クイック概要', withinRange: '基準内', outOfRange: '基準外', hormoneInfographic: 'ホルモン・インフォグラフィック', unlockInfographic: 'マーカーを追加してインフォグラフィックを表示。', day: '日', hormoneSignals: 'ホルモンシグナル', questionsDoctor: '医師への質問', detectedMarkers: '検出マーカー', refShort: '基準', status: '状態', na: 'N/A', summaryTitle: '臨床向けサマリー', copyDoctor: '医師向けにコピー', reportReadyTitle: 'レポート準備ゾーン', reportReadyBody: '識別を選び、プロフィールと表を入力後、レポートを生成してください。', safetyTitle: '安全メモ', safetyBody: 'Luna29 は教育的解釈を提供します。最終診断と治療判断は医師が行ってください。', unsupportedFormat: '未対応形式です。テキスト、画像、または PDF ファイルをご利用ください。', extractFailed: 'ファイルからテキストを抽出できませんでした。', aiScan: 'AIスキャン' },
  pt: { badge: 'Relatórios de saúde', title: 'Relatórios', titleAccent: 'Que Explicam', workflow: 'Fluxo simples: escolha identidade do relatório, preencha marcadores, envie imagem/texto e obtenha um resumo hormonal claro.', identityTitle: 'Identidade Do Relatório', includeId: 'Incluir ID no relatório', includeName: 'Incluir nome no relatório', userIdOverride: 'ID do usuário (opcional)', current: 'Atual', privateIdentity: 'Privado (sem nome/ID no resumo)', profileTitle: 'Perfil Pessoal De Saúde', goals: 'Metas / Prioridade de sintomas', symptomsQuick: 'Sintomas de hoje (seleção rápida)', labTable: 'Tabela Laboratorial', addRow: 'Adicionar Linha', uploadTitle: 'Enviar scan/texto', uploadFile: 'Enviar Arquivo', uploadPlaceholder: 'Cole o texto do relatório ou envie um arquivo de imagem/texto/PDF...', readyExtraction: 'Pronto para extração', generate: 'Gerar Relatório', reading: 'Lendo...', quickOverview: 'Visão Rápida', withinRange: 'Na faixa', outOfRange: 'Fora da faixa', hormoneInfographic: 'Infográfico Hormonal', unlockInfographic: 'Adicione marcadores para liberar o infográfico.', day: 'dia', hormoneSignals: 'Sinais Hormonais', questionsDoctor: 'Perguntas Para O Médico', detectedMarkers: 'Marcadores Detectados', refShort: 'Ref', status: 'Status', na: 'n/d', summaryTitle: 'Resumo Clínico Claro', copyDoctor: 'Copiar para o médico', reportReadyTitle: 'Zona pronta para relatório', reportReadyBody: 'Escolha identidade, preencha perfil + tabela e depois gere o relatório.', safetyTitle: 'Nota de segurança', safetyBody: 'A Luna29 fornece interpretação educacional. Diagnóstico e tratamento finais exigem profissional de saúde licenciado.', unsupportedFormat: 'Formato não suportado. Use arquivos de texto, imagem ou PDF.', extractFailed: 'Não foi possível extrair texto do arquivo.', aiScan: 'scan AI' },
  ar: { badge: 'تقارير الصحة', title: 'تقارير', titleAccent: 'بشرح', workflow: 'Simple workflow: choose report identity, fill your markers, upload image/text, and get a clear hormone-focused summary.', identityTitle: 'Report Identity', includeId: 'Include ID in report', includeName: 'Include Name in report', userIdOverride: 'User ID (optional override)', current: 'Current', privateIdentity: 'Private (no name/ID in summary)', profileTitle: 'Personal Health Profile', goals: 'Goals / Symptoms Priority', symptomsQuick: 'Today symptoms (quick select)', labTable: 'Lab Table', addRow: 'Add Row', uploadTitle: 'Upload scan/text', uploadFile: 'Upload File', uploadPlaceholder: 'Paste report text here or upload an image/text/PDF file...', readyExtraction: 'Ready for extraction', generate: 'Generate Report', reading: 'Reading...', quickOverview: 'Quick Overview', withinRange: 'Within range', outOfRange: 'Out of range', hormoneInfographic: 'Hormone Infographic', unlockInfographic: 'Add markers to unlock infographic.', day: 'day', hormoneSignals: 'Hormone Signals', questionsDoctor: 'Questions for Doctor', detectedMarkers: 'Detected Markers', refShort: 'Ref', status: 'Status', na: 'n/a', summaryTitle: 'Clinical-Friendly Summary', copyDoctor: 'Copy for doctor', reportReadyTitle: 'Report ready zone', reportReadyBody: 'Choose identity, fill profile + table, then Generate Report.', safetyTitle: 'Safety note', safetyBody: 'Luna29 provides educational interpretation only. Final diagnosis and treatment decisions require a licensed clinician.', unsupportedFormat: 'Unsupported format. Use text, image, or PDF files.', extractFailed: 'Could not extract text from file.', aiScan: 'AI scan' },
  he: { badge: 'דוחות בריאות', title: 'דוחות', titleAccent: 'שמסבירים', workflow: 'Simple workflow: choose report identity, fill your markers, upload image/text, and get a clear hormone-focused summary.', identityTitle: 'Report Identity', includeId: 'Include ID in report', includeName: 'Include Name in report', userIdOverride: 'User ID (optional override)', current: 'Current', privateIdentity: 'Private (no name/ID in summary)', profileTitle: 'Personal Health Profile', goals: 'Goals / Symptoms Priority', symptomsQuick: 'Today symptoms (quick select)', labTable: 'Lab Table', addRow: 'Add Row', uploadTitle: 'Upload scan/text', uploadFile: 'Upload File', uploadPlaceholder: 'Paste report text here or upload an image/text/PDF file...', readyExtraction: 'Ready for extraction', generate: 'Generate Report', reading: 'Reading...', quickOverview: 'Quick Overview', withinRange: 'Within range', outOfRange: 'Out of range', hormoneInfographic: 'Hormone Infographic', unlockInfographic: 'Add markers to unlock infographic.', day: 'day', hormoneSignals: 'Hormone Signals', questionsDoctor: 'Questions for Doctor', detectedMarkers: 'Detected Markers', refShort: 'Ref', status: 'Status', na: 'n/a', summaryTitle: 'Clinical-Friendly Summary', copyDoctor: 'Copy for doctor', reportReadyTitle: 'Report ready zone', reportReadyBody: 'Choose identity, fill profile + table, then Generate Report.', safetyTitle: 'Safety note', safetyBody: 'Luna29 provides educational interpretation only. Final diagnosis and treatment decisions require a licensed clinician.', unsupportedFormat: 'Unsupported format. Use text, image, or PDF files.', extractFailed: 'Could not extract text from file.', aiScan: 'AI scan' },
};

const detailedReportByLang: Partial<LangCopy< {
  title: string;
  subtitle: string;
  keyFindings: string;
  detailedInterpretation: string;
  explanation: string;
  whatHappening: string;
  doctorQuestions: string;
  noQuestions: string;
  noMarkers: string;
  statusLow: string;
  statusNormal: string;
  statusHigh: string;
  statusUnknown: string;
  copyright: string;
}>> = {
  en: {
    title: 'Luna29 Clinical Report',
    subtitle: 'Detailed physiological interpretation for care discussion',
    keyFindings: 'Key Findings',
    detailedInterpretation: 'Detailed Interpretation',
    explanation: 'Explanation',
    whatHappening: 'What Is Happening In Your Body',
    doctorQuestions: 'Questions To Discuss With Your Doctor',
    noQuestions: 'No priority questions generated yet. Add more markers for deeper interpretation.',
    noMarkers: 'No markers added yet.',
    statusLow: 'Below reference range: possible reduced reserve or low pathway activity.',
    statusNormal: 'Within reference range: currently aligned with expected physiological corridor.',
    statusHigh: 'Above reference range: possible overstimulation, compensation, or timing-related peak.',
    statusUnknown: 'Reference is incomplete: marker requires manual clinical context.',
    copyright: 'Copyright © Luna29 Balance. All rights reserved.',
  },
  ru: {
    title: 'Клинический Отчет Luna29',
    subtitle: 'Детальная физиологическая интерпретация для обсуждения с врачом',
    keyFindings: 'Ключевые Наблюдения',
    detailedInterpretation: 'Детальная Интерпретация',
    explanation: 'Пояснение',
    whatHappening: 'Что Сейчас Происходит В Организме',
    doctorQuestions: 'Вопросы Для Обсуждения С Врачом',
    noQuestions: 'Пока нет приоритетных вопросов. Добавьте больше маркеров для глубокой интерпретации.',
    noMarkers: 'Пока нет добавленных маркеров.',
    statusLow: 'Ниже референса: возможно снижение резерва или активности соответствующего пути.',
    statusNormal: 'В пределах референса: показатель находится в ожидаемом физиологическом диапазоне.',
    statusHigh: 'Выше референса: возможно перенапряжение оси, компенсация или пик по таймингу.',
    statusUnknown: 'Референс неполный: требуется ручная клиническая интерпретация.',
    copyright: 'Copyright © Luna29 Balance. Все права защищены.',
  },
  uk: {
    title: 'Клінічний Звіт Luna29',
    subtitle: 'Детальна фізіологічна інтерпретація для обговорення з лікарем',
    keyFindings: 'Ключові Спостереження',
    detailedInterpretation: 'Детальна Інтерпретація',
    explanation: 'Пояснення',
    whatHappening: 'Що Зараз Відбувається В Організмі',
    doctorQuestions: 'Питання Для Обговорення З Лікарем',
    noQuestions: 'Поки немає пріоритетних питань. Додайте більше маркерів для глибшої інтерпретації.',
    noMarkers: 'Поки немає доданих маркерів.',
    statusLow: 'Нижче референсу: можливе зниження резерву або активності шляху.',
    statusNormal: 'У межах референсу: показник у очікуваному фізіологічному коридорі.',
    statusHigh: 'Вище референсу: можливе перенапруження осі, компенсація або піковий момент.',
    statusUnknown: 'Референс неповний: потрібна ручна клінічна інтерпретація.',
    copyright: 'Copyright © Luna29 Balance. Усі права захищені.',
  },
  es: { title: 'Informe Clínico Luna29', subtitle: 'Interpretación fisiológica detallada para consulta médica', keyFindings: 'Hallazgos Clave', detailedInterpretation: 'Interpretación Detallada', explanation: 'Explicación', whatHappening: 'Qué Está Pasando En Tu Cuerpo', doctorQuestions: 'Preguntas Para Tu Médica/o', noQuestions: 'Aún no hay preguntas prioritarias. Agrega más marcadores.', noMarkers: 'No hay marcadores aún.', statusLow: 'Bajo rango: posible baja reserva o actividad reducida.', statusNormal: 'En rango: alineado con el corredor fisiológico esperado.', statusHigh: 'Sobre rango: posible sobreestimulación, compensación o pico temporal.', statusUnknown: 'Referencia incompleta: requiere contexto clínico manual.', copyright: 'Copyright © Luna29 Balance. Todos los derechos reservados.' },
  fr: { title: 'Rapport Clinique Luna29', subtitle: 'Interprétation physiologique détaillée pour la consultation', keyFindings: 'Constats Clés', detailedInterpretation: 'Interprétation Détaillée', explanation: 'Explication', whatHappening: 'Ce Qui Se Passe Dans Votre Corps', doctorQuestions: 'Questions À Discuter Avec Le Médecin', noQuestions: 'Aucune question prioritaire pour le moment. Ajoutez plus de marqueurs.', noMarkers: 'Aucun marqueur ajouté.', statusLow: 'Sous la référence : réserve ou activité possiblement réduite.', statusNormal: 'Dans la référence : couloir physiologique attendu.', statusHigh: 'Au-dessus de la référence : possible surstimulation, compensation ou pic temporel.', statusUnknown: 'Référence incomplète : contexte clinique requis.', copyright: 'Copyright © Luna29 Balance. Tous droits réservés.' },
  de: { title: 'Luna29 Klinischer Bericht', subtitle: 'Detaillierte physiologische Interpretation für das Arztgespräch', keyFindings: 'Kernaussagen', detailedInterpretation: 'Detaillierte Interpretation', explanation: 'Erklärung', whatHappening: 'Was In Ihrem Körper Passiert', doctorQuestions: 'Fragen Für Das Arztgespräch', noQuestions: 'Noch keine Prioritätsfragen. Fügen Sie mehr Marker hinzu.', noMarkers: 'Noch keine Marker vorhanden.', statusLow: 'Unter Referenz: mögliche reduzierte Reserve oder Aktivität.', statusNormal: 'Im Referenzbereich: im erwarteten physiologischen Korridor.', statusHigh: 'Über Referenz: mögliche Überstimulation, Kompensation oder Zeitfenster-Peak.', statusUnknown: 'Referenz unvollständig: klinischer Kontext erforderlich.', copyright: 'Copyright © Luna29 Balance. Alle Rechte vorbehalten.' },
  zh: { title: 'Luna29 临床报告', subtitle: '用于医疗沟通的详细生理解读', keyFindings: '关键发现', detailedInterpretation: '详细解读', explanation: '解释', whatHappening: '你体内正在发生什么', doctorQuestions: '建议与医生讨论的问题', noQuestions: '暂未生成重点问题。请添加更多指标。', noMarkers: '尚未添加指标。', statusLow: '低于参考范围：可能提示储备不足或通路活性降低。', statusNormal: '在参考范围内：当前符合预期生理区间。', statusHigh: '高于参考范围：可能存在代偿、过度激活或时间窗峰值。', statusUnknown: '参考区间不完整：需结合临床手动判断。', copyright: 'Copyright © Luna29 Balance. 保留所有权利。' },
  ja: { title: 'Luna29 臨床レポート', subtitle: '医師相談のための詳細な生理学的解釈', keyFindings: '主要所見', detailedInterpretation: '詳細解釈', explanation: '解説', whatHappening: '体内で起きていること', doctorQuestions: '医師に確認する質問', noQuestions: '優先質問はまだありません。マーカーを追加してください。', noMarkers: 'マーカーはまだありません。', statusLow: '基準値未満: 予備力低下または経路活性低下の可能性。', statusNormal: '基準範囲内: 想定される生理学的レンジ内。', statusHigh: '基準値超え: 過活動、代償、タイミング要因の可能性。', statusUnknown: '基準が不十分: 臨床文脈での手動評価が必要。', copyright: 'Copyright © Luna29 Balance. All rights reserved.' },
  pt: { title: 'Relatório Clínico Luna29', subtitle: 'Interpretação fisiológica detalhada para consulta médica', keyFindings: 'Achados-Chave', detailedInterpretation: 'Interpretação Detalhada', explanation: 'Explicação', whatHappening: 'O Que Está Acontecendo No Seu Corpo', doctorQuestions: 'Perguntas Para Discutir Com Seu Médico', noQuestions: 'Ainda sem perguntas prioritárias. Adicione mais marcadores.', noMarkers: 'Nenhum marcador adicionado.', statusLow: 'Abaixo da referência: possível reserva reduzida ou baixa atividade.', statusNormal: 'Dentro da referência: alinhado ao corredor fisiológico esperado.', statusHigh: 'Acima da referência: possível sobrecarga, compensação ou pico temporal.', statusUnknown: 'Referência incompleta: requer contexto clínico manual.', copyright: 'Copyright © Luna29 Balance. Todos os direitos reservados.' },
};

const womenReportInsightsByLang: Partial<LangCopy< {
  clinicalFocusTitle: string;
  clinicalFocusLead: string;
  combinationsTitle: string;
  effectsTitle: string;
  risksTitle: string;
  recommendationsTitle: string;
  noData: string;
  highPriority: string;
  watch: string;
  stable: string;
  estProgTitle: string;
  estProgBody: string;
  thyroidTitle: string;
  thyroidBody: string;
  insulinAndrogenTitle: string;
  insulinAndrogenBody: string;
  prolactinTitle: string;
  prolactinBody: string;
  ferritinTitle: string;
  ferritinBody: string;
  cortisolTitle: string;
  cortisolBody: string;
  recCycle: string;
  recRepeat: string;
  recDoctor: string;
  recLifestyle: string;
}>> = {
  en: {
    clinicalFocusTitle: 'Women-Specific Clinical Focus',
    clinicalFocusLead: 'This section explains hormone combinations, expected effects, potential risks, and practical next steps.',
    combinationsTitle: 'Hormone Combinations',
    effectsTitle: 'Potential Effects',
    risksTitle: 'Potential Risks',
    recommendationsTitle: 'Actionable Recommendations',
    noData: 'Not enough markers yet for advanced pattern interpretation.',
    highPriority: 'High Priority',
    watch: 'Watch',
    stable: 'Stable',
    estProgTitle: 'Estrogen-Progesterone Balance Pattern',
    estProgBody: 'Possible luteal imbalance pattern that may correlate with PMS intensity, breast tenderness, mood instability, and sleep disruption.',
    thyroidTitle: 'Thyroid Slowdown Pattern',
    thyroidBody: 'Thyroid axis pattern can be linked to fatigue, low motivation, cold sensitivity, dry skin, and cycle changes.',
    insulinAndrogenTitle: 'Metabolic-Androgen Pattern',
    insulinAndrogenBody: 'Combined insulin/glucose and androgen strain may influence acne, weight changes, cycle irregularity, and libido fluctuation.',
    prolactinTitle: 'Prolactin-Libido Pattern',
    prolactinBody: 'Elevated prolactin may suppress sexual desire, reduce arousal quality, and impact ovulatory rhythm.',
    ferritinTitle: 'Iron Reserve Pattern',
    ferritinBody: 'Lower ferritin may reduce cellular resilience and contribute to fatigue, low focus, and poor recovery.',
    cortisolTitle: 'Stress-Cortisol Pattern',
    cortisolBody: 'Stress-axis elevation may amplify anxiety, sleep fragmentation, cravings, and hormone instability.',
    recCycle: 'Repeat key cycle hormones in phase-specific windows (follicular and luteal) for clearer trend interpretation.',
    recRepeat: 'Retest out-of-range markers in 6-10 weeks with the same lab method for reliable comparison.',
    recDoctor: 'Bring this report to your clinician and review pattern-level findings, not isolated values only.',
    recLifestyle: 'Prioritize sleep regularity, protein-first meals, gentle movement, and stress recovery habits to stabilize endocrine load.',
  },
  ru: {
    clinicalFocusTitle: 'Клинический Фокус Для Женщины',
    clinicalFocusLead: 'Раздел объясняет сочетания гормонов, вероятные эффекты, потенциальные риски и практические шаги.',
    combinationsTitle: 'Гормональные Сочетания',
    effectsTitle: 'Потенциальные Эффекты',
    risksTitle: 'Потенциальные Риски',
    recommendationsTitle: 'Практические Рекомендации',
    noData: 'Пока недостаточно маркеров для расширенной интерпретации паттернов.',
    highPriority: 'Высокий Приоритет',
    watch: 'Наблюдать',
    stable: 'Стабильно',
    estProgTitle: 'Паттерн Баланса Эстроген-Прогестерон',
    estProgBody: 'Возможен лютеиновый дисбаланс, связанный с выраженным ПМС, болезненностью груди, нестабильностью настроения и ухудшением сна.',
    thyroidTitle: 'Паттерн Замедления Щитовидной Оси',
    thyroidBody: 'Паттерн щитовидной оси может быть связан с усталостью, снижением мотивации, зябкостью, сухостью кожи и изменениями цикла.',
    insulinAndrogenTitle: 'Метаболико-Андрогенный Паттерн',
    insulinAndrogenBody: 'Сочетание метаболической и андрогенной нагрузки может усиливать акне, колебания веса, нерегулярность цикла и колебания либидо.',
    prolactinTitle: 'Паттерн Пролактин-Либидо',
    prolactinBody: 'Повышенный пролактин может снижать сексуальное желание, качество возбуждения и влиять на овуляторный ритм.',
    ferritinTitle: 'Паттерн Железного Резерва',
    ferritinBody: 'Снижение ферритина может уменьшать клеточный ресурс и усиливать усталость, снижение концентрации и медленное восстановление.',
    cortisolTitle: 'Стресс-Кортизоловый Паттерн',
    cortisolBody: 'Повышение стресс-оси может усиливать тревожность, фрагментацию сна, тягу к еде и гормональную нестабильность.',
    recCycle: 'Пересдавайте ключевые половые гормоны в фазовых окнах цикла (фолликулярная и лютеиновая фазы).',
    recRepeat: 'Перепроверьте маркеры вне референса через 6-10 недель тем же лабораторным методом.',
    recDoctor: 'Покажите этот отчет врачу и обсудите паттерны, а не только отдельные цифры.',
    recLifestyle: 'Приоритет: стабильный сон, белок в начале приема пищи, мягкая физическая активность и восстановление после стресса.',
  },
  uk: {
    clinicalFocusTitle: 'Клінічний Фокус Для Жінки',
    clinicalFocusLead: 'Розділ пояснює гормональні поєднання, можливі ефекти, ризики та практичні кроки.',
    combinationsTitle: 'Гормональні Поєднання',
    effectsTitle: 'Потенційні Ефекти',
    risksTitle: 'Потенційні Ризики',
    recommendationsTitle: 'Практичні Рекомендації',
    noData: 'Поки недостатньо маркерів для розширеної інтерпретації патернів.',
    highPriority: 'Високий Пріоритет',
    watch: 'Спостерігати',
    stable: 'Стабільно',
    estProgTitle: 'Патерн Балансу Естроген-Прогестерон',
    estProgBody: 'Можливий лютеїновий дисбаланс, повʼязаний із ПМС, чутливістю грудей, коливаннями настрою та сном.',
    thyroidTitle: 'Патерн Сповільнення Щитоподібної Осі',
    thyroidBody: 'Такий патерн може бути повʼязаний із втомою, холодовою чутливістю, сухістю шкіри та змінами циклу.',
    insulinAndrogenTitle: 'Метаболічно-Андрогенний Патерн',
    insulinAndrogenBody: 'Поєднання метаболічного й андрогенного навантаження може впливати на акне, вагу, цикл і лібідо.',
    prolactinTitle: 'Патерн Пролактин-Лібідо',
    prolactinBody: 'Підвищений пролактин може знижувати сексуальне бажання, якість збудження й овуляторний ритм.',
    ferritinTitle: 'Патерн Залізного Резерву',
    ferritinBody: 'Низький феритин може погіршувати витривалість, фокус і відновлення.',
    cortisolTitle: 'Стрес-Кортизоловий Патерн',
    cortisolBody: 'Підвищена стрес-вісь може посилювати тривожність, порушення сну, тягу до їжі та гормональну нестабільність.',
    recCycle: 'Перевіряйте ключові статеві гормони у фазових вікнах циклу (фолікулярна/лютеїнова фази).',
    recRepeat: 'Повторюйте маркери поза референсом через 6-10 тижнів тим самим методом лабораторії.',
    recDoctor: 'Покажіть звіт лікарю і обговорюйте патерни, а не лише окремі числа.',
    recLifestyle: 'Пріоритет: стабільний сон, білок на початку прийому їжі, мʼякий рух і відновлення після стресу.',
  },
  es: {
    clinicalFocusTitle: 'Enfoque Clínico Femenino',
    clinicalFocusLead: 'Esta sección explica combinaciones hormonales, efectos, riesgos y pasos prácticos.',
    combinationsTitle: 'Combinaciones Hormonales',
    effectsTitle: 'Efectos Potenciales',
    risksTitle: 'Riesgos Potenciales',
    recommendationsTitle: 'Recomendaciones Prácticas',
    noData: 'Aún faltan marcadores para una interpretación avanzada.',
    highPriority: 'Alta Prioridad',
    watch: 'Vigilar',
    stable: 'Estable',
    estProgTitle: 'Patrón Estrógeno-Progesterona',
    estProgBody: 'Posible desequilibrio lúteo relacionado con SPM, sensibilidad mamaria, cambios de ánimo y sueño.',
    thyroidTitle: 'Patrón Tiroideo Lento',
    thyroidBody: 'Puede asociarse con fatiga, baja motivación, sensibilidad al frío, piel seca y cambios del ciclo.',
    insulinAndrogenTitle: 'Patrón Metabólico-Androgénico',
    insulinAndrogenBody: 'La carga combinada puede influir en acné, peso, irregularidad menstrual y libido.',
    prolactinTitle: 'Patrón Prolactina-Libido',
    prolactinBody: 'Prolactina elevada puede reducir deseo sexual, excitación y ritmo ovulatorio.',
    ferritinTitle: 'Patrón De Reserva De Hierro',
    ferritinBody: 'Ferritina baja puede contribuir a fatiga, baja concentración y recuperación lenta.',
    cortisolTitle: 'Patrón Estrés-Cortisol',
    cortisolBody: 'Estrés elevado puede aumentar ansiedad, sueño fragmentado, antojos e inestabilidad hormonal.',
    recCycle: 'Repite hormonas clave en ventanas de fase del ciclo para interpretar tendencias.',
    recRepeat: 'Recontrola marcadores fuera de rango en 6-10 semanas con el mismo método.',
    recDoctor: 'Lleva este reporte a tu médica/o y revisen patrones, no solo números aislados.',
    recLifestyle: 'Prioriza sueño estable, comidas con proteína, movimiento suave y recuperación del estrés.',
  },
  fr: {
    clinicalFocusTitle: 'Focus Clinique Féminin',
    clinicalFocusLead: 'Cette section explique les combinaisons hormonales, effets, risques et actions utiles.',
    combinationsTitle: 'Combinaisons Hormonales',
    effectsTitle: 'Effets Potentiels',
    risksTitle: 'Risques Potentiels',
    recommendationsTitle: 'Recommandations Pratiques',
    noData: 'Pas assez de marqueurs pour une interprétation avancée.',
    highPriority: 'Haute Priorité',
    watch: 'À Surveiller',
    stable: 'Stable',
    estProgTitle: 'Profil Œstrogène-Progestérone',
    estProgBody: 'Possible déséquilibre lutéal lié au SPM, sensibilité mammaire, variabilité émotionnelle et sommeil.',
    thyroidTitle: 'Profil Thyroïdien Ralenti',
    thyroidBody: 'Peut être associé à fatigue, baisse d’élan, sensibilité au froid, peau sèche et cycle modifié.',
    insulinAndrogenTitle: 'Profil Métabolique-Androgénique',
    insulinAndrogenBody: 'Cette combinaison peut influencer acné, poids, irrégularité du cycle et libido.',
    prolactinTitle: 'Profil Prolactine-Libido',
    prolactinBody: 'Une prolactine élevée peut réduire désir sexuel, qualité d’excitation et rythme ovulatoire.',
    ferritinTitle: 'Profil Réserve En Fer',
    ferritinBody: 'Une ferritine basse peut réduire la résilience, la concentration et la récupération.',
    cortisolTitle: 'Profil Stress-Cortisol',
    cortisolBody: 'Un axe stress élevé peut majorer anxiété, fragmentation du sommeil, envies sucrées et instabilité hormonale.',
    recCycle: 'Répétez les hormones clés selon les fenêtres de phase du cycle pour lire la tendance.',
    recRepeat: 'Recontrôlez les marqueurs hors norme à 6-10 semaines avec la même méthode.',
    recDoctor: 'Apportez ce rapport au médecin et discutez les profils, pas seulement des valeurs isolées.',
    recLifestyle: 'Priorité au sommeil régulier, protéines, mouvement doux et récupération du stress.',
  },
  de: {
    clinicalFocusTitle: 'Klinischer Fokus Für Frauen',
    clinicalFocusLead: 'Dieser Abschnitt erklärt Hormonkombinationen, mögliche Effekte, Risiken und nächste Schritte.',
    combinationsTitle: 'Hormon-Kombinationen',
    effectsTitle: 'Mögliche Effekte',
    risksTitle: 'Mögliche Risiken',
    recommendationsTitle: 'Konkrete Empfehlungen',
    noData: 'Noch zu wenige Marker für eine erweiterte Musteranalyse.',
    highPriority: 'Hohe Priorität',
    watch: 'Beobachten',
    stable: 'Stabil',
    estProgTitle: 'Östrogen-Progesteron-Muster',
    estProgBody: 'Mögliches luteales Ungleichgewicht mit PMS-Intensität, Brustspannen, Stimmungsschwankungen und Schlafproblemen.',
    thyroidTitle: 'Schilddrüsen-Verlangsamungsmuster',
    thyroidBody: 'Kann mit Müdigkeit, Kälteempfindlichkeit, trockener Haut und Zyklusveränderungen verbunden sein.',
    insulinAndrogenTitle: 'Metabolisch-Androgenes Muster',
    insulinAndrogenBody: 'Kombinierte Belastung kann Akne, Gewichtsschwankungen, Zyklusunregelmäßigkeit und Libido beeinflussen.',
    prolactinTitle: 'Prolaktin-Libido-Muster',
    prolactinBody: 'Erhöhtes Prolaktin kann sexuelles Verlangen und Erregungsqualität reduzieren.',
    ferritinTitle: 'Eisenreserve-Muster',
    ferritinBody: 'Niedriges Ferritin kann Erschöpfung, geringe Konzentration und langsamere Erholung fördern.',
    cortisolTitle: 'Stress-Cortisol-Muster',
    cortisolBody: 'Erhöhter Stress kann Angst, Schlafunterbrechungen, Heißhunger und Hormoninstabilität verstärken.',
    recCycle: 'Wichtige Zyklushormone in phasenspezifischen Zeitfenstern kontrollieren.',
    recRepeat: 'Auffällige Marker in 6-10 Wochen mit derselben Labormethode erneut prüfen.',
    recDoctor: 'Bericht zur Ärztin/zum Arzt mitnehmen und Muster statt Einzelwerte besprechen.',
    recLifestyle: 'Schlafrhythmus, proteinreiche Mahlzeiten, sanfte Bewegung und Stress-Erholung priorisieren.',
  },
  zh: {
    clinicalFocusTitle: '女性临床重点',
    clinicalFocusLead: '本节解释激素组合、潜在影响、风险与可执行建议。',
    combinationsTitle: '激素组合模式',
    effectsTitle: '潜在影响',
    risksTitle: '潜在风险',
    recommendationsTitle: '可执行建议',
    noData: '当前指标不足，暂无法做高级模式解读。',
    highPriority: '高优先级',
    watch: '需观察',
    stable: '稳定',
    estProgTitle: '雌激素-孕激素平衡模式',
    estProgBody: '可能与经前症状加重、乳房不适、情绪波动和睡眠问题相关。',
    thyroidTitle: '甲状腺减速模式',
    thyroidBody: '可能关联疲劳、畏寒、皮肤干燥、动力下降及周期变化。',
    insulinAndrogenTitle: '代谢-雄激素模式',
    insulinAndrogenBody: '组合负担可能影响痤疮、体重、周期规律和性欲波动。',
    prolactinTitle: '泌乳素-性欲模式',
    prolactinBody: '泌乳素偏高可能降低性欲、唤起质量并影响排卵节律。',
    ferritinTitle: '铁储备模式',
    ferritinBody: '铁蛋白偏低可能导致疲劳、专注下降和恢复变慢。',
    cortisolTitle: '压力-皮质醇模式',
    cortisolBody: '压力轴偏高可能加重焦虑、睡眠碎片化、食欲波动和激素不稳。',
    recCycle: '在周期不同阶段复查关键激素，便于判断趋势。',
    recRepeat: '超出参考范围的指标建议 6-10 周后同方法复测。',
    recDoctor: '就诊时携带报告，重点讨论“模式变化”而非单点数值。',
    recLifestyle: '优先保证睡眠规律、蛋白质摄入、温和运动与压力恢复。',
  },
  ja: {
    clinicalFocusTitle: '女性向け臨床フォーカス',
    clinicalFocusLead: 'このセクションではホルモンの組み合わせ、影響、リスク、実行可能な対策を示します。',
    combinationsTitle: 'ホルモン組み合わせパターン',
    effectsTitle: '想定される影響',
    risksTitle: '想定リスク',
    recommendationsTitle: '実行可能な提案',
    noData: '高度なパターン解釈に十分なマーカーがまだありません。',
    highPriority: '高優先',
    watch: '要観察',
    stable: '安定',
    estProgTitle: 'エストロゲン-プロゲステロンパターン',
    estProgBody: 'PMS増悪、乳房不快、気分変動、睡眠質低下に関連する可能性があります。',
    thyroidTitle: '甲状腺低下パターン',
    thyroidBody: '疲労、冷え、乾燥肌、意欲低下、周期変化との関連が考えられます。',
    insulinAndrogenTitle: '代謝-アンドロゲンパターン',
    insulinAndrogenBody: 'この組み合わせはニキビ、体重変動、周期不整、性欲変動に影響する可能性があります。',
    prolactinTitle: 'プロラクチン-リビドーパターン',
    prolactinBody: '高プロラクチンは性欲・覚醒の質低下、排卵リズムへの影響につながる可能性があります。',
    ferritinTitle: '鉄貯蔵パターン',
    ferritinBody: '低フェリチンは疲労、集中力低下、回復遅延を招きやすくなります。',
    cortisolTitle: 'ストレス-コルチゾールパターン',
    cortisolBody: 'ストレス軸上昇は不安、睡眠分断、食欲変動、ホルモン不安定を強める可能性があります。',
    recCycle: '周期フェーズ別に主要ホルモンを再検して傾向を確認してください。',
    recRepeat: '基準外マーカーは6-10週間後に同一法で再検を推奨します。',
    recDoctor: '受診時は単一値ではなく、パターン全体を医師と確認してください。',
    recLifestyle: '睡眠の規則性、タンパク質中心の食事、軽い運動、ストレス回復を優先してください。',
  },
  pt: {
    clinicalFocusTitle: 'Foco Clínico Feminino',
    clinicalFocusLead: 'Esta seção explica combinações hormonais, efeitos, riscos e próximos passos práticos.',
    combinationsTitle: 'Combinações Hormonais',
    effectsTitle: 'Efeitos Potenciais',
    risksTitle: 'Riscos Potenciais',
    recommendationsTitle: 'Recomendações Práticas',
    noData: 'Ainda há poucos marcadores para interpretação avançada de padrões.',
    highPriority: 'Alta Prioridade',
    watch: 'Monitorar',
    stable: 'Estável',
    estProgTitle: 'Padrão Estrogênio-Progesterona',
    estProgBody: 'Possível desequilíbrio lúteo associado a TPM, sensibilidade mamária, oscilação de humor e sono.',
    thyroidTitle: 'Padrão De Lentidão Tireoidiana',
    thyroidBody: 'Pode estar relacionado a fadiga, baixa motivação, sensibilidade ao frio, pele seca e mudanças no ciclo.',
    insulinAndrogenTitle: 'Padrão Metabólico-Androgênico',
    insulinAndrogenBody: 'A combinação pode influenciar acne, peso, irregularidade menstrual e variação de libido.',
    prolactinTitle: 'Padrão Prolactina-Libido',
    prolactinBody: 'Prolactina alta pode reduzir desejo sexual, qualidade de excitação e ritmo ovulatório.',
    ferritinTitle: 'Padrão De Reserva De Ferro',
    ferritinBody: 'Ferritina baixa pode aumentar fadiga, reduzir foco e atrasar recuperação.',
    cortisolTitle: 'Padrão Estresse-Cortisol',
    cortisolBody: 'Estresse elevado pode aumentar ansiedade, fragmentar o sono, elevar cravings e instabilidade hormonal.',
    recCycle: 'Repita hormônios-chave em janelas de fase do ciclo para melhor leitura de tendência.',
    recRepeat: 'Reavalie marcadores fora da faixa em 6-10 semanas usando o mesmo método.',
    recDoctor: 'Leve este relatório para consulta e discuta padrões, não apenas valores isolados.',
    recLifestyle: 'Priorize sono regular, refeições com proteína, movimento suave e recuperação do estresse.',
  },
};


const reportsUiDefaults: Pick<
  ReportsUiCopy,
  | 'marker'
  | 'value'
  | 'unit'
  | 'reference'
  | 'date'
  | 'note'
  | 'delete'
  | 'workflowTitle'
  | 'loadingGuide'
  | 'workflowReportStep'
  | 'labsRequiredHint'
  | 'profileBirthYear'
  | 'profileCycleLength'
  | 'profileCycleDay'
  | 'profileMedications'
  | 'profileKnownConditions'
> = {
  marker: 'Marker',
  value: 'Value',
  unit: 'Unit',
  reference: 'Reference',
  date: 'Date',
  note: 'Note',
  delete: 'Delete',
  workflowTitle: 'Report Workflow',
  loadingGuide: 'Loading guide...',
  workflowReportStep: 'Generate Report',
  labsRequiredHint: 'Add at least one marker value or paste lab text before generating.',
  profileBirthYear: 'Birth Year',
  profileCycleLength: 'Cycle Length',
  profileCycleDay: 'Cycle Day',
  profileMedications: 'Current Medications',
  profileKnownConditions: 'Known Conditions',
};

const mergeReportsUi = (lang: Language): ReportsUiCopy => ({
  ...reportsUiDefaults,
  ...(getLang(reportsUiByLang, lang) || reportsUiByLang.en || {}),
} as ReportsUiCopy);

export interface LabsViewExportContent {
  reportUi: NonNullable<(typeof reportUiByLang)['en']>;
  medForm: NonNullable<(typeof medicalFormByLang)['en']>;
  reportSourcesUi: NonNullable<(typeof reportSourceByLang)['en']>;
  reportCategories: NonNullable<(typeof markerCategoryByLang)['en']>;
  detailedUi: NonNullable<(typeof detailedReportByLang)['en']>;
  womenUi: NonNullable<(typeof womenReportInsightsByLang)['en']>;
  locale: string;
}

export interface LabsViewLocalizedContent {
  sexualUi: NonNullable<(typeof sexualUiByLang)['en']>;
  visualGuide: NonNullable<(typeof visualGuideByLang)['en']>;
  reportUi: NonNullable<(typeof reportUiByLang)['en']>;
  reportLangUi: NonNullable<(typeof reportLanguageUiByLang)['en']>;
  reportCategories: NonNullable<(typeof markerCategoryByLang)['en']>;
  reportActions: NonNullable<(typeof reportActionsByLang)['en']>;
  conflictsUi: NonNullable<(typeof reportConflictsByLang)['en']>;
  reportsUi: ReportsUiCopy;
  reportLanguageNames: typeof reportLanguageNames;
  locale: string;
  export: LabsViewExportContent;
}

export function getLabsViewExportContent(reportLang: Language): LabsViewExportContent {
  return {
    reportUi: getLang(reportUiByLang, reportLang) || reportUiByLang.en!,
    medForm: getLang(medicalFormByLang, reportLang) || medicalFormByLang.en!,
    reportSourcesUi: getLang(reportSourceByLang, reportLang) || reportSourceByLang.en!,
    reportCategories: getLang(markerCategoryByLang, reportLang) || markerCategoryByLang.en!,
    detailedUi: getLang(detailedReportByLang, reportLang) || detailedReportByLang.en!,
    womenUi: getLang(womenReportInsightsByLang, reportLang) || womenReportInsightsByLang.en!,
    locale: localeByLang[reportLang] || localeByLang.en,
  };
}

/** UI copy follows interface `lang`; exported HTML/PDF copy follows `reportLang`. */
export function getLabsViewLocalizedContent(lang: Language, reportLang: Language = lang): LabsViewLocalizedContent {
  return {
    sexualUi: getLang(sexualUiByLang, lang) || sexualUiByLang.en!,
    visualGuide: getLang(visualGuideByLang, lang) || visualGuideByLang.en!,
    reportUi: getLang(reportUiByLang, lang) || reportUiByLang.en!,
    reportLangUi: getLang(reportLanguageUiByLang, lang) || reportLanguageUiByLang.en!,
    reportCategories: getLang(markerCategoryByLang, lang) || markerCategoryByLang.en!,
    reportActions: getLang(reportActionsByLang, lang) || reportActionsByLang.en!,
    conflictsUi: getLang(reportConflictsByLang, lang) || reportConflictsByLang.en!,
    reportsUi: mergeReportsUi(lang),
    reportLanguageNames,
    locale: localeByLang[lang] || localeByLang.en,
    export: getLabsViewExportContent(reportLang),
  };
}
