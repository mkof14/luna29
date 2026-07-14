import { Language, LangCopy, getLang } from '../constants';

/** Shared public chrome labels used across knowledge pages and sample report. */
export type PublicChromeCopy = {
  back: string;
  healthReportsTitle: string;
  healthProfileTitle: string;
  healthProfileBody: string;
  healthProfileBullets: string[];
  cycleVisualLabel: string;
  siteAddressLabel: string;
  sampleCopyright: string;
};

const PUBLIC_CHROME_BY_LANG: LangCopy<PublicChromeCopy> = {
  en: {
    back: '← Back',
    healthReportsTitle: 'My Health Reports',
    healthProfileTitle: 'Personal Health Profile',
    healthProfileBody: 'A calm place to record what your clinician already knows — so Luna29 can mirror your rhythm more accurately over time.',
    healthProfileBullets: [
      'Medications, cycle notes, and clinician context stay private by design.',
      'You control what is saved and can update it anytime.',
      'Used to personalize reflections — never sold as advertising data.',
    ],
    cycleVisualLabel: 'Cycle visual',
    siteAddressLabel: 'Website',
    sampleCopyright: 'Sample preview · Not a medical diagnosis · For illustration only',
  },
  ru: {
    back: '← Назад',
    healthReportsTitle: 'Мои отчёты о здоровье',
    healthProfileTitle: 'Анкета здоровья',
    healthProfileBody: 'Спокойное место для того, что уже знает ваш врач — чтобы Luna29 точнее отражала ваш ритм со временем.',
    healthProfileBullets: [
      'Лекарства, заметки о цикле и контекст врача остаются приватными по замыслу.',
      'Вы контролируете, что сохраняется, и можете обновлять это в любой момент.',
      'Используется для персонализации отражений — никогда не продаётся как рекламные данные.',
    ],
    cycleVisualLabel: 'Визуал цикла',
    siteAddressLabel: 'Сайт',
    sampleCopyright: 'Образец · Не медицинский диагноз · Только для иллюстрации',
  },
  uk: {
    back: '← Назад',
    healthReportsTitle: 'Мої звіти про здоров’я',
    healthProfileTitle: 'Анкета здоровʼя',
    healthProfileBody: 'Спокійне місце для того, що вже знає ваш лікар — щоб Luna29 точніше відображала ваш ритм з часом.',
    healthProfileBullets: [
      'Ліки, нотатки про цикл і контекст лікаря залишаються приватними за задумом.',
      'Ви контролюєте, що зберігається, і можете оновлювати це будь-коли.',
      'Використовується для персоналізації відображень — ніколи не продається як рекламні дані.',
    ],
    cycleVisualLabel: 'Візуал циклу',
    siteAddressLabel: 'Сайт',
    sampleCopyright: 'Зразок · Не медичний діагноз · Лише для ілюстрації',
  },
  es: {
    back: '← Atrás',
    healthReportsTitle: 'Mis informes de salud',
    healthProfileTitle: 'Perfil de salud personal',
    healthProfileBody: 'Un espacio tranquilo para lo que tu clínica ya conoce — para que Luna29 refleje tu ritmo con más precisión con el tiempo.',
    healthProfileBullets: [
      'Medicación, notas del ciclo y contexto clínico siguen siendo privados por diseño.',
      'Tú controlas lo que se guarda y puedes actualizarlo en cualquier momento.',
      'Se usa para personalizar reflexiones — nunca se vende como datos publicitarios.',
    ],
    cycleVisualLabel: 'Visual del ciclo',
    siteAddressLabel: 'Sitio web',
    sampleCopyright: 'Vista previa de ejemplo · No es un diagnóstico médico · Solo ilustrativo',
  },
  fr: {
    back: '← Retour',
    healthReportsTitle: 'Mes rapports de santé',
    healthProfileTitle: 'Profil de santé personnel',
    healthProfileBody: 'Un espace calme pour ce que votre clinicien connaît déjà — afin que Luna29 reflète votre rythme plus précisément au fil du temps.',
    healthProfileBullets: [
      'Médicaments, notes de cycle et contexte clinique restent privés par conception.',
      'Vous contrôlez ce qui est enregistré et pouvez le mettre à jour à tout moment.',
      'Utilisé pour personnaliser les réflexions — jamais vendu comme données publicitaires.',
    ],
    cycleVisualLabel: 'Visuel du cycle',
    siteAddressLabel: 'Site web',
    sampleCopyright: 'Aperçu d’exemple · Pas un diagnostic médical · À titre illustratif uniquement',
  },
  de: {
    back: '← Zurück',
    healthReportsTitle: 'Meine Gesundheitsberichte',
    healthProfileTitle: 'Persönliches Gesundheitsprofil',
    healthProfileBody: 'Ein ruhiger Ort für das, was Ihre Klinik bereits weiß — damit Luna29 Ihren Rhythmus mit der Zeit genauer spiegeln kann.',
    healthProfileBullets: [
      'Medikamente, Zyklusnotizen und klinischer Kontext bleiben standardmäßig privat.',
      'Sie steuern, was gespeichert wird, und können es jederzeit aktualisieren.',
      'Dient der Personalisierung von Reflexionen — wird nie als Werbedaten verkauft.',
    ],
    cycleVisualLabel: 'Zyklusvisual',
    siteAddressLabel: 'Website',
    sampleCopyright: 'Beispielvorschau · Keine medizinische Diagnose · Nur zur Veranschaulichung',
  },
  zh: {
    back: '← 返回',
    healthReportsTitle: '我的健康报告',
    healthProfileTitle: '个人健康档案',
    healthProfileBody: '一个平静的空间，记录医生已知的信息——帮助 Luna29 随时间更准确地映照你的节律。',
    healthProfileBullets: [
      '用药、周期记录与临床背景默认保持私密。',
      '你可控制保存内容，并可随时更新。',
      '用于个性化反思——绝不会作为广告数据出售。',
    ],
    cycleVisualLabel: '周期视觉',
    siteAddressLabel: '网站',
    sampleCopyright: '示例预览 · 非医疗诊断 · 仅供说明',
  },
  ja: {
    back: '← 戻る',
    healthReportsTitle: 'マイヘルスレポート',
    healthProfileTitle: 'パーソナルヘルスプロフィール',
    healthProfileBody: 'すでに医師が把握している内容を落ち着いて記録する場所——Luna29 が時間とともにリズムをより正確に映せるように。',
    healthProfileBullets: [
      '薬、周期メモ、臨床コンテキストは設計上プライベートのままです。',
      '保存内容はあなたが管理し、いつでも更新できます。',
      '内省のパーソナライズに使用——広告データとして販売しません。',
    ],
    cycleVisualLabel: 'サイクルビジュアル',
    siteAddressLabel: 'ウェブサイト',
    sampleCopyright: 'サンプルプレビュー · 医療診断ではありません · 説明用のみ',
  },
  pt: {
    back: '← Voltar',
    healthReportsTitle: 'Meus relatórios de saúde',
    healthProfileTitle: 'Perfil de saúde pessoal',
    healthProfileBody: 'Um espaço calmo para o que sua clínica já sabe — para a Luna29 espelhar seu ritmo com mais precisão ao longo do tempo.',
    healthProfileBullets: [
      'Medicamentos, notas do ciclo e contexto clínico permanecem privados por design.',
      'Você controla o que é salvo e pode atualizar a qualquer momento.',
      'Usado para personalizar reflexões — nunca vendido como dados de publicidade.',
    ],
    cycleVisualLabel: 'Visual do ciclo',
    siteAddressLabel: 'Site',
    sampleCopyright: 'Prévia de exemplo · Não é diagnóstico médico · Apenas ilustrativo',
  },
  ar: {
    back: '← رجوع',
    healthReportsTitle: 'تقاريري الصحية',
    healthProfileTitle: 'الملف الصحي الشخصي',
    healthProfileBody: 'مكان هادئ لما يعرفه طبيبك بالفعل — حتى تعكس Luna29 إيقاعك بدقة أكبر مع الوقت.',
    healthProfileBullets: [
      'الأدوية وملاحظات الدورة والسياق السريري تبقى خاصة حسب التصميم.',
      'أنتِ تتحكمين بما يُحفظ ويمكنكِ تحديثه في أي وقت.',
      'يُستخدم لتخصيص التأملات — ولا يُباع أبدًا كبيانات إعلانية.',
    ],
    cycleVisualLabel: 'تصور الدورة',
    siteAddressLabel: 'الموقع',
    sampleCopyright: 'معاينة نموذجية · ليست تشخيصًا طبيًا · للتوضيح فقط',
  },
  he: {
    back: '← חזרה',
    healthReportsTitle: 'דוחות הבריאות שלי',
    healthProfileTitle: 'פרופיל בריאות אישי',
    healthProfileBody: 'מקום רגוע למה שהקלינאי כבר יודע — כדי ש-Luna29 תשקף את הקצב שלך בדיוק רב יותר לאורך זמן.',
    healthProfileBullets: [
      'תרופות, הערות מחזור והקשר קליני נשארים פרטיים לפי עיצוב.',
      'את שולטת במה שנשמר ויכולה לעדכן בכל עת.',
      'משמש להתאמה אישית של רפלקציות — לעולם לא נמכר כנתוני פרסום.',
    ],
    cycleVisualLabel: 'ויזואל מחזור',
    siteAddressLabel: 'אתר',
    sampleCopyright: 'תצוגה לדוגמה · לא אבחנה רפואית · להמחשה בלבד',
  },
};

export const getPublicChromeCopy = (lang: Language): PublicChromeCopy =>
  getLang(PUBLIC_CHROME_BY_LANG, lang) || PUBLIC_CHROME_BY_LANG.en;
