import {Language, LangCopy } from '../constants';
import { ABOUT_COPY } from './aboutContent';
const REPORT_EXPLAINER_BY_LANG: LangCopy< { title: string; body1: string; body2: string; bullets: string[] }> = {
  en: {
    title: 'Why My Health Reports Matter',
    body1: 'My Health Reports convert raw lab values into a structured women-focused explanation: cycle context, thyroid/metabolic links, libido-related signals, and actionable next steps.',
    body2: 'You can include only ID or keep identity private, pick report language, and export in doctor-ready format for discussion.',
    bullets: ['Pattern logic, not isolated numbers.', 'Clear categories, risks, and recommendations.', 'Copy, print, share, download, and PDF workflow.'],
  },
  ru: {
    title: 'Почему важны мои отчёты о здоровье',
    body1: 'Мои отчёты о здоровье превращают сырые лабораторные значения в структурированное объяснение для женщин: контекст цикла, связи щитовидки/метаболизма, сигналы либидо и понятные следующие шаги.',
    body2: 'Можно включать только ID или оставить личность приватной, выбирать язык отчета и экспортировать формат для обсуждения с врачом.',
    bullets: ['Логика паттернов, а не изолированные цифры.', 'Понятные категории, риски и рекомендации.', 'Copy, print, share, download и PDF-процесс.'],
  },
  uk: {
    title: 'Чому важливі мої звіти про здоров’я',
    body1: 'Мої звіти про здоров’я перетворюють сирі лабораторні значення на структуроване пояснення для жінки: контекст циклу, звʼязки щитоподібної/метаболізму, сигнали лібідо та практичні кроки.',
    body2: 'Можна додати лише ID або залишити приватність, обрати мову звіту та експортувати формат для розмови з лікарем.',
    bullets: ['Логіка патернів, а не окремі числа.', 'Зрозумілі категорії, ризики та рекомендації.', 'Copy, print, share, download і PDF-процес.'],
  },
  es: {
    title: 'Por qué importan mis informes de salud',
    body1: 'Mis informes de salud transforman valores de laboratorio en una explicación estructurada para mujeres: contexto del ciclo, vínculos tiroideos/metabólicos, señales de libido y próximos pasos claros.',
    body2: 'Puedes mostrar solo ID o mantener privacidad, elegir idioma del reporte y exportarlo en formato listo para consulta médica.',
    bullets: ['Lógica de patrones, no números aislados.', 'Categorías, riesgos y recomendaciones claras.', 'Flujo de copy, print, share, download y PDF.'],
  },
  fr: {
    title: 'Pourquoi mes rapports de santé sont essentiels',
    body1: 'Mes rapports de santé transforment des valeurs de laboratoire brutes en explication structurée orientée femme: contexte du cycle, liens thyroïde/métabolisme, signaux de libido et actions concrètes.',
    body2: 'Vous pouvez afficher seulement l ID, garder la confidentialité, choisir la langue du rapport et exporter un format prêt pour consultation.',
    bullets: ['Analyse des schémas, pas des chiffres isolés.', 'Catégories, risques et recommandations clairs.', 'Flux copy, print, share, download et PDF.'],
  },
  de: {
    title: 'Warum meine Gesundheitsberichte wichtig sind',
    body1: 'Meine Gesundheitsberichte wandeln rohe Laborwerte in eine strukturierte frauenfokussierte Erklärung um: Zykluskontext, Schilddrüsen/Metabolik-Verbindungen, Libido-Signale und konkrete nächste Schritte.',
    body2: 'Sie können nur die ID zeigen oder privat bleiben, die Berichtssprache wählen und ein arztfertiges Format exportieren.',
    bullets: ['Musterlogik statt Einzelwerte.', 'Klare Kategorien, Risiken und Empfehlungen.', 'Copy, print, share, download und PDF-Workflow.'],
  },
  zh: {
    title: '为什么我的健康报告很重要',
    body1: '我的健康报告会把原始化验值转成面向女性的结构化解读：周期背景、甲状腺/代谢关联、性欲相关信号和可执行下一步。',
    body2: '你可以只显示 ID 或保持隐私，选择报告语言，并导出医生可直接使用的格式。',
    bullets: ['强调模式逻辑，而非孤立数字。', '分类、风险与建议更清晰。', '支持 copy、print、share、download 与 PDF。'],
  },
  ja: {
    title: 'マイヘルスレポートが重要な理由',
    body1: 'マイヘルスレポートは生データの検査値を、女性向けの構造化説明に変換します。周期文脈、甲状腺/代謝の関連、リビドー関連シグナル、次の行動まで示します。',
    body2: 'IDのみ表示やプライバシー維持、レポート言語選択、医師相談向け形式でのエクスポートが可能です。',
    bullets: ['単独数値ではなくパターンで理解。', 'カテゴリ、リスク、推奨が明確。', 'copy、print、share、download、PDFに対応。'],
  },
  pt: {
    title: 'Por que meus relatórios de saúde são importantes',
    body1: 'Meus relatórios de saúde convertem valores brutos de laboratório em explicação estruturada para mulheres: contexto do ciclo, ligações tireoide/metabolismo, sinais de libido e próximos passos práticos.',
    body2: 'Você pode mostrar apenas o ID ou manter privacidade, escolher o idioma do relatório e exportar em formato pronto para consulta.',
    bullets: ['Lógica de padrões, não números soltos.', 'Categorias, riscos e recomendações claras.', 'Fluxo de copy, print, share, download e PDF.'],
  },
  ar: {
    title: 'لماذا تقاريري الصحية مهمة',
    body1: 'تقاريري الصحية تحوّل قيم المختبر الخام إلى شرح منظّم موجّه للنساء: سياق الدورة، روابط الغدة الدرقية/الأيض، إشارات مرتبطة بالرغبة، وخطوات تالية واضحة.',
    body2: 'يمكنكِ إظهار المعرّف فقط أو الحفاظ على الخصوصية، واختيار لغة التقرير، وتصديره بصيغة جاهزة للنقاش مع الطبيب.',
    bullets: ['منطق الأنماط، لا أرقام معزولة.', 'فئات واضحة ومخاطر وتوصيات.', 'سير عمل Copy وPrint وShare وDownload وPDF.'],
  },
  he: {
    title: 'למה דוחות הבריאות שלי חשובים',
    body1: 'דוחות הבריאות שלי ממירים ערכי מעבדה גולמיים להסבר מובנה ממוקד נשים: הקשר מחזורי, קשרים בבלוטת התריס/חילוף חומרים, אותות הקשורים ל-libido וצעדים מעשיים הבאים.',
    body2: 'אפשר להציג רק מזהה או לשמור על פרטיות, לבחור שפת דוח ולייצא בפורמט מוכן לרופא.',
    bullets: ['לוגיקת דפוסים, לא מספרים בודדים.', 'קטגוריות, סיכונים והמלצות ברורים.', 'תהליך Copy, print, share, download ו-PDF.'],
  },};


export const getAboutViewContent = (lang: Language) => ({
  about: ABOUT_COPY[lang] || ABOUT_COPY.en,
  reportExplainer: REPORT_EXPLAINER_BY_LANG[lang] || REPORT_EXPLAINER_BY_LANG.en,
});
