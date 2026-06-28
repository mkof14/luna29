import React, { useState } from 'react';
import { Language, LangCopy, getLang } from '../constants';

interface HormoneTestingGuideProps {
  lang: Language;
}

type GuideCopy = {
  title: string;
  subtitle: string;
  focusTitle: string;
  focusItems: string[];
  focusPrivate: string;
  focusExpand: string;
  focusCollapse: string;
  focusSignalsTitle: string;
  focusSignals: string[];
  focusActionsTitle: string;
  focusActions: string[];
  focusRedFlagsTitle: string;
  focusRedFlags: string[];
  markerNote: string;
  columns: { hormone: string; tests: string; timing: string; why: string };
  rows: Array<{ hormone: string; tests: string; timing: string; why: string }>;
};

const baseRows: GuideCopy['rows'] = [
  {
    hormone: 'Estrogen / Progesterone',
    tests: 'Estradiol (E2), Progesterone',
    timing: 'E2 day 2-5; Progesterone ~7 days after ovulation',
    why: 'Cycle quality, PMS intensity, mood and sleep stability.',
  },
  {
    hormone: 'Ovulation Axis',
    tests: 'LH, FSH, Prolactin',
    timing: 'Day 2-5 (fasting, morning for prolactin)',
    why: 'Ovulation reserve, irregular cycles, fertility signaling.',
  },
  {
    hormone: 'Thyroid Axis',
    tests: 'TSH, FT4, FT3, Anti-TPO, Anti-Tg',
    timing: 'Morning, stable routine; repeat with symptoms',
    why: 'Energy, cold sensitivity, weight shifts, hair and mood.',
  },
  {
    hormone: 'Stress Axis',
    tests: 'Cortisol (AM ± PM), DHEA-S',
    timing: 'Morning baseline; optional daytime profile',
    why: 'Stress resilience, burnout risk, sleep disruption.',
  },
  {
    hormone: 'Metabolic Axis',
    tests: 'Fasting glucose, fasting insulin, HbA1c',
    timing: 'Morning fasting 8-12h',
    why: 'Energy crashes, cravings, inflammation and PCOS risk.',
  },
  {
    hormone: 'Nutrient Support',
    tests: 'Ferritin, Vitamin D, B12, CBC',
    timing: 'Any morning; re-check after treatment',
    why: 'Fatigue, recovery speed, immune and cognitive support.',
  },
  {
    hormone: 'Libido / Intimacy Panel',
    tests: 'Total + Free Testosterone, SHBG, Estradiol, Prolactin, DHEA-S',
    timing: 'Day 2-5 baseline; repeat in symptomatic phase',
    why: 'Desire, arousal, lubrication, orgasm responsiveness, relational closeness capacity.',
  },
];

const copyByLang: LangCopy< GuideCopy> = {
  en: {
    title: 'Hormones + Required Tests',
    subtitle: 'Clear test map for more accurate women health analysis.',
    focusTitle: 'Sexual Health Focus',
    focusItems: [
      'Libido and arousal: Estradiol, free testosterone, SHBG.',
      'Comfort and lubrication: Estradiol + thyroid + stress axis.',
      'Closeness and emotional receptivity: Progesterone + cortisol balance.',
      'Desire suppression signals: high prolactin, high stress load, low ferritin.',
    ],
    focusPrivate: 'Private section. Expand only when needed.',
    focusExpand: 'Show Sexual Health Focus',
    focusCollapse: 'Hide Sexual Health Focus',
    focusSignalsTitle: 'What to monitor',
    focusSignals: ['Desire level across cycle phases.', 'Arousal and lubrication quality.', 'Comfort and pain during intimacy.', 'Emotional closeness and recovery after intimacy.'],
    focusActionsTitle: 'Practical actions',
    focusActions: ['Track 2-3 cycles before conclusions.', 'Compare symptoms with lab timing.', 'Review stress/sleep before changing treatment.', 'Take report summary to clinician.'],
    focusRedFlagsTitle: 'When to consult faster',
    focusRedFlags: ['Persistent pain during intimacy.', 'Sudden loss of libido with distress.', 'Cycle disruption with androgen symptoms.', 'Severe dryness or bleeding after intimacy.'],
    markerNote: 'Markers keep international lab notation for consistency.',
    columns: { hormone: 'Hormone Axis', tests: 'Key Tests', timing: 'Best Timing', why: 'Why It Matters' },
    rows: baseRows,
  },
  ru: {
    title: 'Гормоны И Нужные Анализы',
    subtitle: 'Наглядная карта анализов для более точного анализа женского состояния.',
    focusTitle: 'Фокус Сексуального Здоровья',
    focusItems: [
      'Либидо и возбуждение: эстрадиол, свободный тестостерон, SHBG.',
      'Комфорт и увлажнение: эстрадиол + щитовидка + стресс-ось.',
      'Близость и эмоциональная открытость: баланс прогестерона и кортизола.',
      'Снижение желания: высокий пролактин, стресс, низкий ферритин.',
    ],
    focusPrivate: 'Приватный раздел. Раскрывайте только при необходимости.',
    focusExpand: 'Показать Фокус Сексуального Здоровья',
    focusCollapse: 'Скрыть Фокус Сексуального Здоровья',
    focusSignalsTitle: 'Что отслеживать',
    focusSignals: ['Уровень желания по фазам цикла.', 'Качество возбуждения и увлажнения.', 'Комфорт и боль во время близости.', 'Эмоциональная близость и восстановление после близости.'],
    focusActionsTitle: 'Практические шаги',
    focusActions: ['Отследить 2-3 цикла до выводов.', 'Сопоставлять симптомы с датой анализов.', 'Оценить стресс/сон до смены терапии.', 'Показывать summary врачу.'],
    focusRedFlagsTitle: 'Когда обращаться быстрее',
    focusRedFlags: ['Стойкая боль при близости.', 'Резкая потеря либидо с выраженным дистрессом.', 'Сбой цикла с андрогенными симптомами.', 'Выраженная сухость или кровянистые выделения после близости.'],
    markerNote: 'Названия анализов даны в международной лабораторной нотации.',
    columns: { hormone: 'Гормональная Ось', tests: 'Ключевые Анализы', timing: 'Когда Сдавать', why: 'Почему Важно' },
    rows: baseRows,
  },
  uk: {
    title: 'Гормони Та Потрібні Аналізи',
    subtitle: 'Зрозуміла карта аналізів для точнішого аналізу жіночого здоровʼя.',
    focusTitle: 'Фокус Сексуального Здоровʼя',
    focusItems: [
      'Лібідо та збудження: естрадіол, вільний тестостерон, SHBG.',
      'Комфорт і зволоження: естрадіол + щитоподібна вісь + стрес-вісь.',
      'Близькість і емоційна відкритість: баланс прогестерону та кортизолу.',
      'Сигнали зниження бажання: високий пролактин, високий стрес, низький феритин.',
    ],
    focusPrivate: 'Приватний блок. Відкривайте лише за потреби.',
    focusExpand: 'Показати Фокус Сексуального Здоровʼя',
    focusCollapse: 'Сховати Фокус Сексуального Здоровʼя',
    focusSignalsTitle: 'Що відстежувати',
    focusSignals: ['Рівень бажання за фазами циклу.', 'Якість збудження та зволоження.', 'Комфорт і біль під час близькості.', 'Емоційна близькість і відновлення після близькості.'],
    focusActionsTitle: 'Практичні кроки',
    focusActions: ['Відстежити 2-3 цикли до висновків.', 'Зіставляти симптоми з датою аналізів.', 'Перевірити стрес/сон до зміни лікування.', 'Показувати summary лікарю.'],
    focusRedFlagsTitle: 'Коли звертатись швидше',
    focusRedFlags: ['Стійкий біль під час близькості.', 'Раптова втрата лібідо з вираженим дистресом.', 'Збій циклу з андрогенними симптомами.', 'Сильна сухість або кровʼянисті виділення після близькості.'],
    markerNote: 'Назви аналізів подані в міжнародній лабораторній нотації.',
    columns: { hormone: 'Гормональна Вісь', tests: 'Ключові Аналізи', timing: 'Коли Здавати', why: 'Чому Це Важливо' },
    rows: baseRows,
  },
  es: {
    title: 'Hormonas Y Pruebas Clave',
    subtitle: 'Mapa claro de pruebas para un análisis femenino más preciso.',
    focusTitle: 'Enfoque De Salud Sexual',
    focusItems: [
      'Libido y excitación: estradiol, testosterona libre, SHBG.',
      'Comodidad y lubricación: estradiol + eje tiroideo + eje de estrés.',
      'Cercanía y receptividad emocional: balance de progesterona y cortisol.',
      'Señales de deseo bajo: prolactina alta, estrés alto, ferritina baja.',
    ],
    focusPrivate: 'Sección privada. Ábrela solo cuando la necesites.',
    focusExpand: 'Mostrar Salud Sexual',
    focusCollapse: 'Ocultar Salud Sexual',
    focusSignalsTitle: 'Qué monitorear',
    focusSignals: ['Nivel de deseo por fases del ciclo.', 'Calidad de excitación y lubricación.', 'Comodidad y dolor en la intimidad.', 'Cercanía emocional y recuperación después.'],
    focusActionsTitle: 'Acciones prácticas',
    focusActions: ['Seguir 2-3 ciclos antes de concluir.', 'Cruzar síntomas con fecha de análisis.', 'Revisar estrés/sueño antes de cambiar tratamiento.', 'Llevar el resumen al médico.'],
    focusRedFlagsTitle: 'Cuándo consultar antes',
    focusRedFlags: ['Dolor persistente en la intimidad.', 'Pérdida súbita de libido con malestar.', 'Alteración del ciclo con síntomas androgénicos.', 'Sequedad severa o sangrado post-intimidad.'],
    markerNote: 'Los marcadores se mantienen en notación internacional de laboratorio.',
    columns: { hormone: 'Eje Hormonal', tests: 'Pruebas Clave', timing: 'Mejor Momento', why: 'Por Qué Importa' },
    rows: baseRows,
  },
  fr: {
    title: 'Hormones Et Analyses Clés',
    subtitle: 'Carte claire des tests pour une analyse féminine plus précise.',
    focusTitle: 'Focus Santé Sexuelle',
    focusItems: [
      'Libido et excitation: estradiol, testostérone libre, SHBG.',
      'Confort et lubrification: estradiol + thyroïde + axe du stress.',
      'Proximité et réceptivité émotionnelle: équilibre progestérone/cortisol.',
      'Baisse du désir: prolactine élevée, stress élevé, ferritine basse.',
    ],
    focusPrivate: 'Section privée. Ouvrez-la uniquement si nécessaire.',
    focusExpand: 'Afficher Santé Sexuelle',
    focusCollapse: 'Masquer Santé Sexuelle',
    focusSignalsTitle: 'À surveiller',
    focusSignals: ['Niveau de désir selon les phases du cycle.', 'Qualité de l’excitation et de la lubrification.', 'Confort et douleur pendant l’intimité.', 'Proximité émotionnelle et récupération ensuite.'],
    focusActionsTitle: 'Actions pratiques',
    focusActions: ['Suivre 2-3 cycles avant conclusion.', 'Relier symptômes et date des analyses.', 'Vérifier stress/sommeil avant de modifier le traitement.', 'Apporter le résumé au clinicien.'],
    focusRedFlagsTitle: 'Quand consulter plus vite',
    focusRedFlags: ['Douleur persistante pendant l’intimité.', 'Perte brutale de libido avec détresse.', 'Perturbation du cycle avec signes androgéniques.', 'Sécheresse sévère ou saignement après intimité.'],
    markerNote: 'Les marqueurs gardent une notation internationale de laboratoire.',
    columns: { hormone: 'Axe Hormonal', tests: 'Analyses Clés', timing: 'Meilleur Moment', why: 'Pourquoi Cest Important' },
    rows: baseRows,
  },
  de: {
    title: 'Hormone Und Wichtige Tests',
    subtitle: 'Klarer Testplan für eine präzisere Analyse der Frauengesundheit.',
    focusTitle: 'Sexualgesundheit Fokus',
    focusItems: [
      'Libido und Erregung: Estradiol, freies Testosteron, SHBG.',
      'Komfort und Lubrikation: Estradiol + Schilddrüse + Stressachse.',
      'Nähe und emotionale Offenheit: Progesteron/Cortisol-Balance.',
      'Signal für niedriges Verlangen: hohes Prolaktin, hoher Stress, niedriges Ferritin.',
    ],
    focusPrivate: 'Privater Bereich. Nur bei Bedarf öffnen.',
    focusExpand: 'Sexualgesundheit Anzeigen',
    focusCollapse: 'Sexualgesundheit Verbergen',
    focusSignalsTitle: 'Was beobachten',
    focusSignals: ['Libido-Verlauf über Zyklusphasen.', 'Erregung und Lubrikationsqualität.', 'Komfort und Schmerz bei Intimität.', 'Emotionale Nähe und Erholung danach.'],
    focusActionsTitle: 'Praktische Schritte',
    focusActions: ['2-3 Zyklen verfolgen, dann bewerten.', 'Symptome mit Testzeitpunkt abgleichen.', 'Stress/Schlaf vor Therapieänderung prüfen.', 'Zusammenfassung zum Arzttermin mitnehmen.'],
    focusRedFlagsTitle: 'Wann schneller abklären',
    focusRedFlags: ['Anhaltende Schmerzen bei Intimität.', 'Plötzlicher Libidoverlust mit Belastung.', 'Zyklusstörung mit androgenen Symptomen.', 'Starke Trockenheit oder Blutung nach Intimität.'],
    markerNote: 'Marker bleiben in internationaler Labornotation.',
    columns: { hormone: 'Hormonachse', tests: 'Wichtige Tests', timing: 'Bester Zeitpunkt', why: 'Warum Wichtig' },
    rows: baseRows,
  },
  zh: {
    title: '激素与关键检测',
    subtitle: '更清晰的检测地图，帮助更准确评估女性健康。',
    focusTitle: '性健康重点',
    focusItems: [
      '性欲与唤起：雌二醇、游离睾酮、SHBG。',
      '舒适与润滑：雌二醇 + 甲状腺轴 + 压力轴。',
      '亲密与情感接纳：孕酮与皮质醇平衡。',
      '性欲下降信号：泌乳素高、压力高、铁蛋白低。',
    ],
    focusPrivate: '隐私内容。仅在需要时展开。',
    focusExpand: '展开性健康重点',
    focusCollapse: '收起性健康重点',
    focusSignalsTitle: '建议观察',
    focusSignals: ['不同周期阶段的性欲变化。', '唤起与润滑质量。', '亲密时舒适度与疼痛。', '情感亲密与事后恢复。'],
    focusActionsTitle: '实用动作',
    focusActions: ['先连续跟踪2-3个周期。', '将症状与检测时间对照。', '调整治疗前先评估压力与睡眠。', '将总结带给医生讨论。'],
    focusRedFlagsTitle: '需更快就医',
    focusRedFlags: ['亲密时持续疼痛。', '突发明显性欲下降并造成困扰。', '周期紊乱伴雄激素症状。', '严重干涩或亲密后出血。'],
    markerNote: '检测项目保留国际实验室命名，便于对照。',
    columns: { hormone: '激素轴', tests: '关键检测', timing: '最佳时间', why: '重要原因' },
    rows: baseRows,
  },
  ja: {
    title: 'ホルモンと必要検査',
    subtitle: '女性の状態をより正確に見るための検査マップ。',
    focusTitle: 'セクシャルヘルス フォーカス',
    focusItems: [
      'リビドーと覚醒: エストラジオール、遊離テストステロン、SHBG。',
      '快適さと潤滑: エストラジオール + 甲状腺軸 + ストレス軸。',
      '親密さと感情受容: プロゲステロンとコルチゾールのバランス。',
      '欲求低下サイン: 高プロラクチン、高ストレス、低フェリチン。',
    ],
    focusPrivate: 'プライベート項目です。必要な時だけ展開してください。',
    focusExpand: 'セクシャルヘルスを表示',
    focusCollapse: 'セクシャルヘルスを非表示',
    focusSignalsTitle: '観察ポイント',
    focusSignals: ['周期フェーズごとの欲求レベル。', '覚醒と潤滑の質。', '親密時の快適さと痛み。', '情緒的な近さとその後の回復。'],
    focusActionsTitle: '実践アクション',
    focusActions: ['2-3周期を追跡してから判断。', '症状と検査タイミングを照合。', '治療変更前にストレス/睡眠を確認。', '要約を医師に共有。'],
    focusRedFlagsTitle: '早めに受診する目安',
    focusRedFlags: ['親密時の持続する痛み。', '苦痛を伴う急なリビドー低下。', 'アンドロゲン症状を伴う周期乱れ。', '強い乾燥や親密後の出血。'],
    markerNote: 'マーカー名は国際的な検査表記を維持しています。',
    columns: { hormone: 'ホルモン軸', tests: '主要検査', timing: '推奨タイミング', why: '重要性' },
    rows: baseRows,
  },
  pt: {
    title: 'Hormônios E Exames Necessários',
    subtitle: 'Mapa claro de exames para análise feminina mais precisa.',
    focusTitle: 'Foco Em Saúde Sexual',
    focusItems: [
      'Libido e excitação: estradiol, testosterona livre, SHBG.',
      'Conforto e lubrificação: estradiol + eixo tireoidiano + eixo do estresse.',
      'Proximidade e abertura emocional: equilíbrio progesterona/cortisol.',
      'Sinais de baixa de desejo: prolactina alta, estresse alto, ferritina baixa.',
    ],
    focusPrivate: 'Seção privada. Expanda somente quando necessário.',
    focusExpand: 'Mostrar Saúde Sexual',
    focusCollapse: 'Ocultar Saúde Sexual',
    focusSignalsTitle: 'O que monitorar',
    focusSignals: ['Nível de desejo nas fases do ciclo.', 'Qualidade de excitação e lubrificação.', 'Conforto e dor na intimidade.', 'Proximidade emocional e recuperação depois.'],
    focusActionsTitle: 'Ações práticas',
    focusActions: ['Acompanhar 2-3 ciclos antes de concluir.', 'Cruzar sintomas com data dos exames.', 'Rever estresse/sono antes de mudar tratamento.', 'Levar o resumo para consulta.'],
    focusRedFlagsTitle: 'Quando acelerar consulta',
    focusRedFlags: ['Dor persistente na intimidade.', 'Perda súbita de libido com sofrimento.', 'Desregulação do ciclo com sinais androgênicos.', 'Secura severa ou sangramento após intimidade.'],
    markerNote: 'Os marcadores mantêm notação laboratorial internacional.',
    columns: { hormone: 'Eixo Hormonal', tests: 'Exames Chave', timing: 'Melhor Momento', why: 'Por Que Importa' },
    rows: baseRows,
  },
};

export const HormoneTestingGuide: React.FC<HormoneTestingGuideProps> = ({ lang }) => {
  const [showFocus, setShowFocus] = useState(false);
  const copy = getLang(copyByLang, lang) || copyByLang.en;

  return (
    <section className="rounded-[2.2rem] border border-slate-200/80 dark:border-slate-700/70 bg-[radial-gradient(circle_at_12%_20%,rgba(255,255,255,0.45),transparent_42%),radial-gradient(circle_at_84%_78%,rgba(251,113,133,0.18),transparent_40%),linear-gradient(135deg,rgba(245,225,235,0.95),rgba(220,230,244,0.92))] dark:bg-[radial-gradient(circle_at_15%_20%,rgba(124,58,237,0.18),transparent_42%),radial-gradient(circle_at_82%_78%,rgba(20,184,166,0.16),transparent_42%),linear-gradient(135deg,rgba(8,22,47,0.94),rgba(12,36,70,0.92))] p-6 md:p-7 shadow-luna-rich space-y-4">
      <div className="space-y-1">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-luna-purple">{copy.title}</p>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{copy.subtitle}</p>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-white/55 dark:border-white/10 bg-white/62 dark:bg-slate-900/35">
        <table className="w-full min-w-[760px] text-xs">
          <thead>
            <tr className="text-left uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
              <th className="py-2 px-3">{copy.columns.hormone}</th>
              <th className="py-2 px-3">{copy.columns.tests}</th>
              <th className="py-2 px-3">{copy.columns.timing}</th>
              <th className="py-2 px-3">{copy.columns.why}</th>
            </tr>
          </thead>
          <tbody>
            {copy.rows.map((row) => (
              <tr key={`${row.hormone}-${row.tests}`} className="border-t border-slate-200/70 dark:border-slate-700/70 align-top">
                <td className="py-2 px-3 font-black text-slate-800 dark:text-slate-100">{row.hormone}</td>
                <td className="py-2 px-3 font-semibold text-slate-700 dark:text-slate-300">{row.tests}</td>
                <td className="py-2 px-3 font-semibold text-slate-700 dark:text-slate-300">{row.timing}</td>
                <td className="py-2 px-3 font-semibold text-slate-600 dark:text-slate-400">{row.why}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">{copy.markerNote}</p>
      <div className="rounded-2xl border border-slate-200/70 dark:border-slate-700/70 bg-gradient-to-r from-white/78 via-rose-50/70 to-teal-50/65 dark:from-slate-900/55 dark:via-violet-900/25 dark:to-teal-900/20 p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-luna-purple">{copy.focusTitle}</p>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{copy.focusPrivate}</p>
          </div>
          <button
            onClick={() => setShowFocus((prev) => !prev)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-luna-purple/35 bg-white/75 dark:bg-slate-900/70 text-[10px] font-black uppercase tracking-[0.14em] text-luna-purple hover:bg-luna-purple/10 transition-colors"
            aria-expanded={showFocus}
          >
            <span>{showFocus ? '▾' : '▸'}</span>
            <span>{showFocus ? copy.focusCollapse : copy.focusExpand}</span>
          </button>
        </div>
        {showFocus && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {copy.focusItems.map((item) => (
                <p key={item} className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">• {item}</p>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-200/70 dark:border-slate-700/70 bg-white/70 dark:bg-slate-900/45 p-3 space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-luna-purple">{copy.focusSignalsTitle}</p>
                {copy.focusSignals.map((item) => (
                  <p key={item} className="text-xs font-semibold text-slate-700 dark:text-slate-300">• {item}</p>
                ))}
              </div>
              <div className="rounded-xl border border-slate-200/70 dark:border-slate-700/70 bg-white/70 dark:bg-slate-900/45 p-3 space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-luna-purple">{copy.focusActionsTitle}</p>
                {copy.focusActions.map((item) => (
                  <p key={item} className="text-xs font-semibold text-slate-700 dark:text-slate-300">• {item}</p>
                ))}
              </div>
              <div className="rounded-xl border border-rose-200/80 dark:border-rose-800/40 bg-rose-50/70 dark:bg-rose-900/15 p-3 space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-rose-600 dark:text-rose-300">{copy.focusRedFlagsTitle}</p>
                {copy.focusRedFlags.map((item) => (
                  <p key={item} className="text-xs font-semibold text-rose-700 dark:text-rose-200">• {item}</p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
