import { LangCopy } from '../../constants';
import { LegalDocContent } from './types';

export const LEGAL_MEDICAL: LangCopy<LegalDocContent> = {
  en: {
    title: 'Wellness Notice',
    subtitle: 'Important wellness scope and safety guidance for Luna29—not a medical service or regulated device.',
    sections: [
      { heading: 'Not a Medical Service or Device', body: 'Luna29 is a wellness and cycle-awareness application. It is not a medical service, medical device, diagnostic instrument, or treatment provider. Luna29 has not been evaluated or cleared by the U.S. FDA or any regulatory authority as a medical product.' },
      { heading: 'No Diagnosis, Treatment, or Prescription', body: 'Luna29 does not diagnose medical conditions, prescribe treatments, recommend medications, interpret laboratory results for clinical decision-making, or replace the judgment of a licensed healthcare professional. Any patterns or suggestions are reflective and informational only.' },
      { heading: 'Not for Emergency or Urgent Care', body: 'Luna29 is not designed for emergency response, crisis intervention, or urgent medical supervision. If you believe you or someone else may be in immediate danger, call local emergency services (such as 911 in the U.S.) or go to the nearest emergency department.' },
      { heading: 'Informational and Reflective Use Only', body: 'Content, insights, AI-assisted outputs, and educational materials are provided for personal wellness reflection. They may be incomplete, outdated, or inaccurate. Medical decisions—including about contraception, fertility, pregnancy, mental health, or chronic conditions—must be made with qualified professionals.' },
      { heading: 'AI and Automated Outputs', body: 'Optional AI features generate probabilistic text based on limited inputs. AI outputs can be wrong, biased, or inappropriate for your situation. Do not rely on AI responses for medical decisions. Always verify important health information with a licensed clinician.' },
      { heading: 'Seek Professional Care', body: 'Consult a physician or other qualified provider before starting, stopping, or changing any health regimen. Luna29 does not provide continuous clinical monitoring and must not be used as a substitute for professional medical advice, diagnosis, or treatment.' },
    ],
  },
  ru: {
    title: 'Уведомление о wellness',
    subtitle: 'Важные указания по области wellness и безопасности Luna29 — не медицинский сервис и не регулируемое устройство.',
    sections: [
      { heading: 'Не медицинский сервис и не устройство', body: 'Luna29 — приложение для wellness и осознанности цикла. Это не медицинский сервис, медицинское устройство, диагностический инструмент или поставщик лечения. Luna29 не оценивалась и не одобрена FDA США или иным регулятором как медицинский продукт.' },
      { heading: 'Без диагностики, лечения и назначений', body: 'Luna29 не ставит диагнозы, не назначает лечение, не рекомендует лекарства, не интерпретирует лабораторные результаты для клинических решений и не заменяет суждение лицензированного медработника. Любые паттерны и подсказки носят рефлексивный и информационный характер.' },
      { heading: 'Не для экстренной и срочной помощи', body: 'Luna29 не предназначена для экстренного реагирования, кризисного вмешательства или срочного меднаблюдения. При угрозе жизни немедленно звоните в местные экстренные службы (например, 911 в США) или обратитесь в отделение неотложной помощи.' },
      { heading: 'Только информационное и рефлексивное использование', body: 'Контент, инсайты, AI-выводы и образовательные материалы предназначены для личной wellness-рефлексии. Они могут быть неполными, устаревшими или неточными. Медицинские решения—включая контрацепцию, фертильность, беременность, психическое здоровье и хронические состояния—принимаются только с квалифицированными специалистами.' },
      { heading: 'AI и автоматизированные выводы', body: 'Опциональные AI-функции генерируют вероятностный текст на основе ограниченных входных данных. AI может ошибаться, быть предвзятым или неподходящим для вашей ситуации. Не полагайтесь на AI для медицинских решений. Важную информацию о здоровье всегда проверяйте у лицензированного врача.' },
      { heading: 'Обращайтесь к специалистам', body: 'Проконсультируйтесь с врачом или иным квалифицированным специалистом перед началом, прекращением или изменением любого режима здоровья. Luna29 не обеспечивает непрерывный клинический мониторинг и не должна заменять профессиональную медконсультацию, диагностику или лечение.' },
    ],
  },
  uk: {
    title: 'Повідомлення про wellness',
    subtitle: 'Важливі вказівки щодо сфери wellness і безпеки Luna29 — не медичний сервіс і не регульований виріб.',
    sections: [
      { heading: 'Не медичний сервіс і не виріб', body: 'Luna29 — додаток для wellness і усвідомленості циклу. Це не медичний сервіс, медичний виріб, діагностичний інструмент або постачальник лікування. Luna29 не оцінювалася і не схвалена FDA США чи іншим регулятором як медичний продукт.' },
      { heading: 'Без діагностики, лікування та призначень', body: 'Luna29 не ставить діагнози, не призначає лікування, не рекомендує ліки, не інтерпретує лабораторні результати для клінічних рішень і не замінює судження ліцензованого медпрацівника. Будь-які патерни та підказки мають рефлексивний і інформаційний характер.' },
      { heading: 'Не для екстреної та невідкладної допомоги', body: 'Luna29 не призначена для екстреного реагування, кризового втручання чи невідкладного меднагляду. За загрозою життя негайно телефонуйте до місцевих екстрених служб (наприклад, 911 у США) або зверніться до відділення невідкладної допомоги.' },
      { heading: 'Лише інформаційне та рефлексивне використання', body: 'Контент, інсайти, AI-висновки та освітні матеріали призначені для особистої wellness-рефлексії. Вони можуть бути неповними, застарілими або неточними. Медичні рішення—including контрацепція, фертильність, вагітність, психічне здоровʼя та хронічні стани—приймаються лише з кваліфікованими фахівцями.' },
      { heading: 'AI та автоматизовані висновки', body: 'Опціональні AI-функції генерують ймовірнісний текст на основі обмежених вхідних даних. AI може помилятися, бути упередженим або непридатним для вашої ситуації. Не покладайтеся на AI для медичних рішень. Важливу інформацію про здоровʼя завжди перевіряйте у ліцензованого лікаря.' },
      { heading: 'Звертайтеся до фахівців', body: 'Проконсультуйтеся з лікарем або іншим кваліфікованим фахівцем перед початком, припиненням або зміною будь-якого режиму здоровʼя. Luna29 не забезпечує безперервний клінічний моніторинг і не повинна замінювати професійну медконсультацію, діагностику чи лікування.' },
    ],
  },
  es: {
    title: 'Aviso de bienestar',
    subtitle: 'Orientación importante sobre el alcance de bienestar y seguridad de Luna29—no es un servicio médico ni dispositivo regulado.',
    sections: [
      { heading: 'No es un servicio ni dispositivo médico', body: 'Luna29 es una aplicación de bienestar y conciencia del ciclo. No es un servicio médico, dispositivo médico, instrumento diagnóstico ni proveedor de tratamiento. Luna29 no ha sido evaluada ni autorizada por la FDA de EE. UU. u otra autoridad reguladora como producto médico.' },
      { heading: 'Sin diagnóstico, tratamiento ni prescripción', body: 'Luna29 no diagnostica condiciones médicas, prescribe tratamientos, recomienda medicamentos, interpreta resultados de laboratorio para decisiones clínicas ni sustituye el criterio de un profesional de salud licenciado. Cualquier patrón o sugerencia es reflexivo e informativo únicamente.' },
      { heading: 'No para emergencias ni atención urgente', body: 'Luna29 no está diseñada para respuesta de emergencia, intervención en crisis ni supervisión médica urgente. Si cree que usted u otra persona está en peligro inmediato, llame a servicios de emergencia locales (como el 911 en EE. UU.) o acuda al servicio de urgencias más cercano.' },
      { heading: 'Uso informativo y reflexivo únicamente', body: 'Contenido, insights, salidas asistidas por IA y materiales educativos se ofrecen para reflexión personal de bienestar. Pueden ser incompletos, desactualizados o inexactos. Las decisiones médicas—incluida anticoncepción, fertilidad, embarazo, salud mental o condiciones crónicas—deben tomarse con profesionales calificados.' },
      { heading: 'IA y salidas automatizadas', body: 'Las funciones opcionales de IA generan texto probabilístico basado en entradas limitadas. Las salidas de IA pueden ser incorrectas, sesgadas o inapropiadas para su situación. No confíe en respuestas de IA para decisiones médicas. Verifique siempre información importante de salud con un clínico licenciado.' },
      { heading: 'Busque atención profesional', body: 'Consulte a un médico u otro proveedor calificado antes de iniciar, suspender o cambiar cualquier régimen de salud. Luna29 no proporciona monitoreo clínico continuo y no debe usarse como sustituto de consejo, diagnóstico o tratamiento médico profesional.' },
    ],
  },
  fr: {
    title: 'Avis bien-être',
    subtitle: 'Orientation importante sur la portée bien-être et la sécurité de Luna29—pas un service médical ni dispositif réglementé.',
    sections: [
      { heading: 'Pas un service ni dispositif médical', body: 'Luna29 est une application de bien-être et de conscience du cycle. Ce n\'est pas un service médical, un dispositif médical, un instrument diagnostique ou un prestataire de traitement. Luna29 n\'a pas été évaluée ni autorisée par la FDA U.S. ou toute autorité réglementaire comme produit médical.' },
      { heading: 'Pas de diagnostic, traitement ou prescription', body: 'Luna29 ne diagnostique pas de conditions médicales, ne prescrit pas de traitements, ne recommande pas de médicaments, n\'interprète pas de résultats de laboratoire pour des décisions cliniques et ne remplace pas le jugement d\'un professionnel de santé agréé. Tout modèle ou suggestion est uniquement réflexif et informatif.' },
      { heading: 'Pas pour urgences ou soins urgents', body: 'Luna29 n\'est pas conçue pour la réponse d\'urgence, l\'intervention de crise ou la supervision médicale urgente. Si vous pensez être en danger immédiat, appelez les services d\'urgence locaux (comme le 911 aux U.S.) ou rendez-vous aux urgences les plus proches.' },
      { heading: 'Usage informatif et réflexif uniquement', body: 'Contenu, insights, sorties assistées par IA et matériels éducatifs sont fournis pour la réflexion personnelle bien-être. Ils peuvent être incomplets, obsolètes ou inexacts. Les décisions médicales—including contraception, fertilité, grossesse, santé mentale ou maladies chroniques—doivent être prises avec des professionnels qualifiés.' },
      { heading: 'IA et sorties automatisées', body: 'Les fonctions IA optionnelles génèrent du texte probabiliste à partir d\'entrées limitées. Les sorties IA peuvent être erronées, biaisées ou inappropriées. Ne vous fiez pas aux réponses IA pour des décisions médicales. Vérifiez toujours les informations de santé importantes avec un clinicien agréé.' },
      { heading: 'Consultez un professionnel', body: 'Consultez un médecin ou autre professionnel qualifié avant de commencer, arrêter ou modifier tout régime de santé. Luna29 ne fournit pas de surveillance clinique continue et ne doit pas remplacer un avis, diagnostic ou traitement médical professionnel.' },
    ],
  },
  de: {
    title: 'Wellness-Hinweis',
    subtitle: 'Wichtige Hinweise zum Wellness-Umfang und zur Sicherheit von Luna29—kein medizinischer Dienst und kein reguliertes Gerät.',
    sections: [
      { heading: 'Kein medizinischer Dienst oder Gerät', body: 'Luna29 ist eine Wellness- und Zyklus-Bewusstseins-App. Sie ist kein medizinischer Dienst, Medizinprodukt, Diagnoseinstrument oder Behandlungsanbieter. Luna29 wurde nicht von der U.S.-FDA oder einer Behörde als Medizinprodukt bewertet oder zugelassen.' },
      { heading: 'Keine Diagnose, Behandlung oder Verschreibung', body: 'Luna29 diagnostiziert keine Erkrankungen, verschreibt keine Behandlungen, empfiehlt keine Medikamente, interpretiert Laborergebnisse nicht für klinische Entscheidungen und ersetzt nicht das Urteil eines zugelassenen Gesundheitsfachpersonals. Muster oder Vorschläge sind nur reflektierend und informativ.' },
      { heading: 'Nicht für Notfall oder dringende Versorgung', body: 'Luna29 ist nicht für Notfallreaktion, Krisenintervention oder dringende medizinische Überwachung konzipiert. Wenn Sie unmittelbare Gefahr vermuten, rufen Sie den örtlichen Notruf (z. B. 911 in den USA) oder suchen Sie die nächste Notaufnahme auf.' },
      { heading: 'Nur informative und reflektierende Nutzung', body: 'Inhalte, Einblicke, KI-gestützte Ausgaben und Bildungsmaterialien dienen der persönlichen Wellness-Reflexion. Sie können unvollständig, veraltet oder ungenau sein. Medizinische Entscheidungen—einschließlich Verhütung, Fruchtbarkeit, Schwangerschaft, psychische Gesundheit oder chronische Erkrankungen—erfordern qualifizierte Fachpersonen.' },
      { heading: 'KI und automatisierte Ausgaben', body: 'Optionale KI-Funktionen erzeugen probabilistischen Text aus begrenzten Eingaben. KI-Ausgaben können falsch, voreingenommen oder unpassend sein. Verlassen Sie sich nicht auf KI-Antworten für medizinische Entscheidungen. Wichtige Gesundheitsinformationen immer bei zugelassenem Kliniker verifizieren.' },
      { heading: 'Professionelle Versorgung suchen', body: 'Konsultieren Sie einen Arzt oder andere qualifizierte Fachperson, bevor Sie ein Gesundheitsregime beginnen, beenden oder ändern. Luna29 bietet keine kontinuierliche klinische Überwachung und darf professionelle medizinische Beratung, Diagnose oder Behandlung nicht ersetzen.' },
    ],
  },
  zh: {
    title: 'Wellness 须知',
    subtitle: 'Luna29 wellness 适用范围与安全指引——非医疗服务或受监管医疗器械。',
    sections: [
      { heading: '非医疗服务或医疗器械', body: 'Luna29 是 wellness 与周期觉察应用，不是医疗服务、医疗器械、诊断工具或治疗提供者。Luna29 未经美国 FDA 或任何监管机构评估或批准为医疗产品。' },
      { heading: '不提供诊断、治疗或处方', body: 'Luna29 不诊断疾病、不开具治疗、不推荐药物、不为临床决策解读实验室结果，也不替代持证医疗专业人员的专业判断。任何模式或建议仅供反思与信息参考。' },
      { heading: '不用于紧急或 urgent 护理', body: 'Luna29 不用于 emergency 响应、危机干预或 urgent 医疗监护。若您或他人可能处于 immediate 危险，请拨打当地 emergency 服务（如美国 911）或前往最近 emergency 科室。' },
      { heading: '仅供信息与反思使用', body: '内容、洞察、AI 辅助输出及教育材料仅供个人 wellness 反思，可能不完整、过时或不准确。医疗决策——包括避孕、生育、怀孕、心理健康或慢性病——须由合格专业人员作出。' },
      { heading: 'AI 与自动化输出', body: '可选 AI 功能基于有限输入生成概率性文本。AI 输出可能错误、有偏见或不适合您的情况。请勿依赖 AI 回复作医疗决策。重要健康信息务必向持证临床人员核实。' },
      { heading: '寻求专业护理', body: '在开始、停止或改变任何健康方案前，请咨询医生或其他合格提供者。Luna29 不提供持续临床监测，不得替代专业医疗建议、诊断或治疗。' },
    ],
  },
  ja: {
    title: 'ウェルネス通知',
    subtitle: 'Luna29 のウェルネス範囲と安全に関する重要な案内—医療サービスでも規制医療機器でもありません。',
    sections: [
      { heading: '医療サービス・医療機器ではない', body: 'Luna29 はウェルネスおよびサイクル認識アプリです。医療サービス、医療機器、診断機器、治療提供者ではありません。Luna29 は米国 FDA または規制当局による医療製品としての評価・承認を受けていません。' },
      { heading: '診断・治療・処方は行わない', body: 'Luna29 は疾患を診断せず、治療を処方せず、薬を推奨せず、臨床判断のための検査結果を解釈せず、有資格の医療専門家の判断に代わりません。パターンや提案は内省的・情報提供のみです。' },
      { heading: '緊急・至急のケアには使用しない', body: 'Luna29 は緊急対応、危機介入、至急の医療監視向けではありません。自身または他者が immediate に危険にあると思われる場合は、地域の緊急サービス（米国では 911 等）に連絡するか、最寄りの救急へ行ってください。' },
      { heading: '情報提供および内省のみ', body: 'コンテンツ、インサイト、AI 支援出力、教材は個人的ウェルネス内省のために提供されます。不完全、 outdated、不正確な場合があります。避妊、生殖、妊娠、メンタルヘルス、慢性疾患等の医療判断は資格を有する専門家と行ってください。' },
      { heading: 'AI および自動出力', body: '任意の AI 機能は限定的入力に基づく確率的テキストを生成します。AI 出力は誤り、偏り、不適切な場合があります。医療判断に AI 回答を依存しないでください。重要な健康情報は必ず有資格の臨床医に確認してください。' },
      { heading: '専門的ケアを受ける', body: '健康レジメンの開始、中止、変更前に医師または資格を有する提供者に相談してください。Luna29 は継続的臨床モニタリングを提供せず、専門的医療助言、診断、治療の代替として使用してはなりません。' },
    ],
  },
  pt: {
    title: 'Aviso de bem-estar',
    subtitle: 'Orientação importante sobre escopo de bem-estar e segurança da Luna29—não é serviço médico nem dispositivo regulado.',
    sections: [
      { heading: 'Não é serviço nem dispositivo médico', body: 'A Luna29 é um aplicativo de bem-estar e consciência do ciclo. Não é serviço médico, dispositivo médico, instrumento diagnóstico ou provedor de tratamento. A Luna29 não foi avaliada nem aprovada pela FDA dos EUA ou outra autoridade reguladora como produto médico.' },
      { heading: 'Sem diagnóstico, tratamento ou prescrição', body: 'A Luna29 não diagnostica condições médicas, prescreve tratamentos, recomenda medicamentos, interpreta resultados laboratoriais para decisões clínicas nem substitui o julgamento de profissional de saúde licenciado. Padrões ou sugestões são apenas reflexivos e informativos.' },
      { heading: 'Não para emergência ou cuidado urgente', body: 'A Luna29 não foi projetada para resposta de emergência, intervenção em crise ou supervisão médica urgente. Se acreditar que você ou outra pessoa está em perigo imediato, ligue para serviços de emergência locais (como 911 nos EUA) ou vá ao pronto-socorro mais próximo.' },
      { heading: 'Uso informativo e reflexivo apenas', body: 'Conteúdo, insights, saídas assistidas por IA e materiais educacionais são fornecidos para reflexão pessoal de bem-estar. Podem ser incompletos, desatualizados ou imprecisos. Decisões médicas—incluindo contracepção, fertilidade, gravidez, saúde mental ou condições crônicas—devem ser tomadas com profissionais qualificados.' },
      { heading: 'IA e saídas automatizadas', body: 'Recursos opcionais de IA geram texto probabilístico com base em entradas limitadas. Saídas de IA podem estar erradas, enviesadas ou inadequadas. Não confie em respostas de IA para decisões médicas. Sempre verifique informações importantes de saúde com clínico licenciado.' },
      { heading: 'Busque cuidado profissional', body: 'Consulte médico ou outro provedor qualificado antes de iniciar, interromper ou alterar qualquer regime de saúde. A Luna29 não fornece monitoramento clínico contínuo e não deve substituir aconselhamento, diagnóstico ou tratamento médico profissional.' },
    ],
  },
  ar: {
    title: 'إشعار العافية',
    subtitle: 'إرشادات مهمة حول نطاق العافية والسلامة في Luna29—ليست خدمة طبية ولا جهازاً خاضعاً للتنظيم.',
    sections: [
      { heading: 'ليست خدمة طبية ولا جهازاً طبياً', body: 'Luna29 تطبيق للعافية ووعي الدورة. ليست خدمة طبية أو جهازاً طبياً أو أداة تشخيص أو مقدّم علاج. لم تُقيَّم Luna29 ولم تُعتمد من FDA الأمريكية أو أي جهة تنظيمية كمنتج طبي.' },
      { heading: 'لا تشخيص ولا علاج ولا وصفة', body: 'Luna29 لا تشخّص الحالات الطبية ولا تصف العلاج ولا توصي بالأدوية ولا تفسّر نتائج المختبر للقرارات السريرية ولا تحل محل حكم أخصائي رعاية صحية مرخّص. أي أنماط أو اقتراحات reflective ومعلوماتية فقط.' },
      { heading: 'ليست للطوارئ أو الرعاية العاجلة', body: 'Luna29 غير مصممة للاستجابة للطوارئ أو التدخل في الأزمات أو الإ supervision الطبي العاجل. إذا اعتقدتم أنك أو غيرك في خطر فوري، اتصل بخدمات الطوارئ المحلية (مثل 911 في أمريكا) أو توجه لأقرب قسم طوارئ.' },
      { heading: 'للاستخدام المعلوماتي والتأملي فقط', body: 'المحتوى والرؤى ومخرجات الذكاء الاصطناعي والمواد التعليمية للتأمل الشخصي في العافية. قد تكون ناقصة أو outdated أو غير دقيقة. القرارات الطبية—including منع الحمل والخصوبة والحمل والصحة النفسية والحالات المزمنة—يجب اتخاذها مع متخصصين مؤهلين.' },
      { heading: 'الذكاء الاصطناعي والمخرجات الآلية', body: 'الميزات الاختيارية للذكاء الاصطناعي تولّد نصاً احتمالياً من مدخلات محدودة. قد تكون المخرجات خاطئة أو متحيزة أو غير مناسبة. لا تعتمد على ردود AI للقرارات الطبية. تحقق دائماً من معلومات الصحة المهمة مع طبيب مرخّص.' },
      { heading: 'اطلب رعاية مهنية', body: 'استشر طبيباً أو مقدّم رعاية مؤهل قبل بدء أو إيقاف أو تغيير أي نظام صحي. Luna29 لا توفر مراقبة سريرية مستمرة ولا يجب استخدامها بديلاً عن المشورة أو التشخيص أو العلاج الطبي المهني.' },
    ],
  },
  he: {
    title: 'הודעת wellness',
    subtitle: 'הנחיות חשובות לגבי היקף wellness ובטיחות של Luna29 — לא שירות רפואי ולא מכשיר מוסדר.',
    sections: [
      { heading: 'לא שירות רפואי ולא מכשיר רפואי', body: 'Luna29 היא אפליקציית wellness ומודעות מחזור. היא אינה שירות רפואי, מכשיר רפואי, כלי אבחון או ספק טיפול. Luna29 לא הוערכה או אושרה על ידי FDA האמריקאית או רגulator כמוצר רפואי.' },
      { heading: 'ללא אבחון, טיפול או מרשם', body: 'Luna29 אינה מאבחנת מצבים רפואיים, אינה ממליצה על טיפולים או תרופות, אינה מפרשת תוצאות מעבדה להחלטות קlinיות ואינה מחליפה שיקול דעת של איש מקצוע מורשה. דפוסים או הצעות הם reflective ומידעיים בלבד.' },
      { heading: 'לא לחירום או טיפול דחוף', body: 'Luna29 לא מיועדת לתגובת חירום, התערבות במשבר או פיקוח רפואי דחוף. אם אתם сч счים שאתם או אחר נמצאים בסכנה מיידית, התקשרו לשירותי חירום מקומיים (כמו 911 בארה"ב) או פנו למיון הקרוב.' },
      { heading: 'שימוש מידעי והתבונני בלבד', body: 'תוכן, תובנות, פלטי AI וחומרים חינוכיים מסופקים להתבוננות wellness אישית. הם עלולים להיות incomplete, outdated או inaccurate. החלטות רפואיות—including contraception, fertility, הריון, בריאות נפשית או מצבים כרוניים—יש לקבל עם אנשי מקצוע מורשים מוסמכים.' },
      { heading: 'AI ופלטים אוטומטיים', body: 'תכונות AI אופציונליות מייצרות טקסט הסתברותי מקלט מוגבל. פלטי AI עלולים להיות שגויים, מוטים או לא מתאימים. אל תסתמכו על תשובות AI להחלטות רפואיות. אמתו תמיד מידע בריאותי חשוב עם קlinician מורשה.' },
      { heading: 'פנו לטיפול מקצועי', body: 'התייעצו עם רופא או ספק מורשים מוסמכים לפני התחלה, הפסקה או שינוי של regimen בריאותי. Luna29 אינה מספקת ניטור קlinי רציף ואין להשתמש בה כתחליף לייעוץ, אבחון או טיפול רפואי מקצועי.' },
    ],
  },
};
