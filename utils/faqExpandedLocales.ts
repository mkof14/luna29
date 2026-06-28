export type FAQExpandedCategory = {
  title: string;
  intro?: string;
  items: Array<{ q: string; a: string }>;
};

export const FAQ_EXPANDED_BY_LANG: Partial<
  Record<'uk' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'pt', FAQExpandedCategory[]>
> = {
  uk: [
    {
      title: 'Огляд системи',
      intro:
        'Luna29 Balance — система самоспостереження, орієнтована на фізіологію. Ці відповіді визначають, що платформа собою є — і чим вона навмисно не є.',
      items: [
        {
          q: 'Що таке Luna29 Balance?',
          a: 'Luna29 Balance — візуальне середовище для картографування фізіологічного ритму та внутрішнього стану. Вона об\'єднує контекст циклу, навантаження стресом, метаболічні сигнали та щоденні маркери в цілісну «карту погоди» — допомагаючи бачити патерни в часі, а не ізольовані точки даних.\n\nСистема створена для ясності та мови, а не для клінічної класифікації.',
        },
        {
          q: 'Для кого призначена Luna29?',
          a: 'Для будь-якої жінки, якій потрібен структурований і спокійний спосіб розуміти зміни енергії, мінливість настрою, чутливість і зміни, пов\'язані з циклом — на будь-якому етапі репродуктивного життя, включно з перименопаузу, післяпологовим відновленням або стабільним базисом на гормональній контрацепції.\n\nРегулярний цикл не обов\'язковий. Потрібне чесне спостереження.',
        },
        {
          q: 'Чим Luna29 відрізняється від трекерів циклу?',
          a: 'Застосунки для циклу оптимізують передбачення. Luna29 оптимізує інтерпретацію.\n\nЗамість питання «коли наступна менструація?» Luna29 запитує: «через які умови я проходжу і як вони пов\'язані зі сном, стресом, фокусом і спілкуванням?» Тіло розглядається як пов\'язана мережа — не як календарна подія.',
        },
        {
          q: 'Чи потрібні медичні знання?',
          a: 'Ні. Luna29 перекладає складну фізіологію простою мовою, візуальними шкалами та контекстом фаз. Технічні поняття з короткими визначеннями — у розділі Навчання. Інтерфейс створений для повсякденного життя, а не для клініцистів.',
        },
        {
          q: 'Як пов\'язані публічні сторінки та зона учасника?',
          a: 'Публічні сторінки пояснюють філософію, межі безпеки та орієнтацію в продукті. Авторизована зона учасника містить особисті інструменти: карту ритму, голосові рефлексії, звіти, комунікаційні помічники The Bridge, Ritual Path і контроль експорту.\n\nДля перегляду публічного контенту особистий журнал не потрібен.',
        },
      ],
    },
    {
      title: 'Медичні межі та безпека',
      intro:
        'Luna29 працює в просторі wellness та освіти. Наступні межі захищають користувачів і зберігають довіру.',
      items: [
        {
          q: 'Чи є Luna29 медичною послугою чи пристроєм?',
          a: 'Ні. Luna29 не є медичною послугою, медичним виробом, діагностичним інструментом або постачальником лікування. Система не має клінічної сертифікації і не повинна використовуватися як заміна ліцензованої допомоги.',
        },
        {
          q: 'Чи може Luna29 ставити діагнози?',
          a: 'Ні. Luna29 виявляє кореляції та описові патерни на основі ваших даних. Кореляція — не причинність, а мова патернів — не діагноз. Медичні стани підтверджує лише кваліфікований лікар.',
        },
        {
          q: 'Чи надає Luna29 терапію?',
          a: 'Ні. Голосові рефлексії та мова стану можуть підтримувати емоційну обробку, але Luna29 — не психотерапія, консультування чи психіатрична допомога. За потреби зверніться до ліцензованого фахівця.',
        },
        {
          q: 'Чи може Luna29 замінити лікаря?',
          a: 'Ні. Luna29 — шар підготовки: допомагає прийти на прийом з організованими спостереженнями, хронологією та словником. Медичні рішення — аналізи, ліки, направлення — залишаються виключно між вами та лікарем.',
        },
        {
          q: 'Чи підходить Luna29 для екстрених ситуацій?',
          a: 'Ні. За безпосередньої небезпеки звертайтеся до екстрених служб. Reset Room пропонує лише заземлення — не екстрену відповідь і не кризову клінічну допомогу.',
        },
        {
          q: 'Чи можна змінювати ліки на основі Luna29?',
          a: 'Ніколи без призначившого лікаря. Luna29 не рекомендує зміни дозування, добавки чи плани лікування. Використовуйте звіти як матеріал для розмови, а не як інструкції.',
        },
      ],
    },
    {
      title: 'Ритм, гормони та повсякденність',
      intro: 'Luna29 читає фізіологію як динамічний контекст — не як табель успішності.',
      items: [
        {
          q: 'Чому гормони впливають на настрій і енергію?',
          a: 'Гормони модулюють обробку стресу, нагороди та сигналів втоми нейронними контурами. Вони також впливають на метаболічний потік — наскільки ефективно клітини отримують паливо. Разом це створює базовий «внутрішній клімат», який змінюється за фазами циклу, дефіцитом сну та життєвим навантаженням.',
        },
        {
          q: 'Чому стрес так сильно впливає?',
          a: 'Кортизол — сигнал пріоритету. За тривалого стресу система перерозподіляє ресурси на функції виживання. Травлення, репродуктивна сигналізація та когнітивна гнучкість можуть тимчасово поступитися — тому стрес «згладжує» або спотворює очікувані ритми.',
        },
        {
          q: 'Що означає стан «Strained» (напруження)?',
          a: 'Strained вказує на підвищений попит відносно відновлення: система підтримує функцію під навантаженням. У житті це може відчуватися як дратівливість, сенсорне перевантаження, поверхневий сон або нездатність «вимкнутися». Це прапорець орієнтації — не моральна оцінка.',
        },
        {
          q: 'Що якщо у мене немає класичного 28-денного циклу?',
          a: 'Luna29 залишається корисною. Вирівнюйте карту за фізичними ознаками, дугами енергії та Temporal Scrubber, а не нав\'язуйте календарну симетрію. Чесні нотатки з приблизним вирівнюванням кращі за штучну точність.',
        },
        {
          q: 'Що змінюється на гормональній контрацепції?',
          a: 'Екзогенні гормони часто створюють більш рівний базис із меншою амплітудою хвиль. Ви все одно можете відстежувати чутливість, сон, настрій, лібідо та стрес — багато користувачів знаходять тонкі патерни навіть на «згладженій» карті.',
        },
      ],
    },
    {
      title: 'Дані, приватність і контроль',
      intro: 'Ваша біологія — особисте. Luna29 за замовчуванням використовує local-first архітектуру, де це можливо.',
      items: [
        {
          q: 'Які дані обробляє Luna29?',
          a: 'Дані, які ви вводите або генеруєте: check-in, нотатки про цикл, голосові рефлексії, опціональні імпорти аналізів, контекст профілю та технічні логи для автентифікації та стабільності. Luna29 не збирає приховано сторонні дані пристрою для реклами.',
        },
        {
          q: 'Де зберігаються дані про здоров\'я?',
          a: 'Основні wellness-записи спроєктовані так, щоб залишатися на вашому пристрої (local storage). Облікові дані, процеси безпеки та окремі хмарні функції можуть використовувати захищений backend — завжди з розкриттям у Privacy Notice.',
        },
        {
          q: 'Чи продає Luna29 персональні дані?',
          a: 'Ні. Модель — підписка на доступ до інструментів, а не брокеридж даних. Ми не продаємо поведінкові чи фізіологічні профілі рекламодавцям.',
        },
        {
          q: 'Як працює експорт?',
          a: 'Експорт ініціюєте ви. Health Reports і JSON-експорт створюють файли під вашим контролем. Діліться лише тим, що обираєте — з лікарем, партнером або для особистого архіву.',
        },
        {
          q: 'Що буде при очищенні сховища браузера?',
          a: 'Локальна історія може бути видалена. Рекомендуємо періодичний експорт як особистий бекап. Дані автентифікації можуть зберігатися окремо залежно від конфігурації.',
        },
      ],
    },
    {
      title: 'Участь і інструменти',
      intro: 'Практичні питання про доступ, звіти та щоденне використання Luna29.',
      items: [
        {
          q: 'Що входить у зону учасника?',
          a: 'Інтерактивна карта ритму, структуровані check-in, голосові Voice Note, Health Reports, комунікаційні помічники The Bridge, Ritual Path, Reset Room і контроль експорту/приватності — в одному спокійному інтерфейсі.',
        },
        {
          q: 'Чи можна завантажувати PDF аналізів у звіти?',
          a: 'Так. My Health Reports приймає текст, зображення та PDF для структурованого огляду. Результати організують маркери в розділи для візиту — все ще освітньо, не діагностично.',
        },
        {
          q: 'Чи можуть звіти бути мовою інтерфейсу?',
          a: 'Так. Генерація звітів може слідувати активній мовній налаштуванні Luna29 для багатомовних консультацій.',
        },
        {
          q: 'Де партнеру вчитися підтримуючій комунікації?',
          a: 'Див. Partner FAQ та The Bridge. Обидва дають спокійні формулювання, мову ємності та контекст, що знижує цикли звинувачень у стосунках.',
        },
        {
          q: 'Скільки часу потрібно щодня?',
          a: 'Більшості учасників достатньо 60–90 секунд check-in плюс періодичні голосові нотатки. Luna29 створена для безперервності, а не для нав\'язливого трекінгу.',
        },
      ],
    },
  ],

  es: [
    {
      title: 'Visión general del sistema',
      intro:
        'Luna29 Balance es un sistema de autoobservación orientado a la fisiología. Estas respuestas definen qué es la plataforma — y qué deliberadamente no es.',
      items: [
        {
          q: '¿Qué es Luna29 Balance?',
          a: 'Luna29 Balance es un entorno visual para mapear el ritmo fisiológico y el estado interior. Integra el contexto del ciclo, la carga de estrés, las señales metabólicas y los marcadores diarios en un «mapa del tiempo» coherente — ayudándote a ver patrones a lo largo del tiempo, no puntos de datos aislados.\n\nEstá diseñado para claridad y lenguaje, no para clasificación clínica.',
        },
        {
          q: '¿Para quién está diseñada Luna29?',
          a: 'Para cualquier mujer que quiera una forma estructurada y serena de entender los cambios de energía, la variabilidad del ánimo, la sensibilidad y los cambios relacionados con el ciclo — en cualquier etapa de la vida reproductiva, incluida la perimenopausia, la recuperación posparto o una línea base estable con anticonceptivos hormonales.\n\nNo necesitas un ciclo regular para beneficiarte. Necesitas observación honesta.',
        },
        {
          q: '¿En qué se diferencia Luna29 de los rastreadores de ciclo?',
          a: 'Las apps de ciclo optimizan la predicción. Luna29 optimiza la interpretación.\n\nEn lugar de preguntar «¿cuándo viene la próxima regla?», Luna29 pregunta: «¿por qué condiciones estoy transitando y cómo se relacionan con el sueño, el estrés, el foco y la comunicación?» El cuerpo se trata como una red conectada — no como un evento del calendario.',
        },
        {
          q: '¿Necesito formación médica para usar Luna29?',
          a: 'No. Luna29 traduce la fisiología compleja a lenguaje claro, escalas visuales y contexto de fases. Los conceptos técnicos incluyen definiciones breves en la sección Aprendizaje. La interfaz está pensada para la vida diaria, no para clínicos.',
        },
        {
          q: '¿Cuál es la relación entre las páginas públicas y la zona de miembros?',
          a: 'Las páginas públicas explican la filosofía, los límites de seguridad y la orientación del producto. La zona autenticada de miembros contiene herramientas personales: mapa del ritmo, reflexiones de voz, informes, ayudas de comunicación The Bridge, Ritual Path y controles de exportación.\n\nNada de tu diario privado es necesario para explorar el contenido público.',
        },
      ],
    },
    {
      title: 'Alcance médico y seguridad',
      intro:
        'Luna29 opera en el espacio del bienestar y la educación. Los siguientes límites protegen a las usuarias y preservan la confianza.',
      items: [
        {
          q: '¿Es Luna29 un servicio o dispositivo médico?',
          a: 'No. Luna29 no es un servicio médico, dispositivo médico, instrumento de diagnóstico ni proveedor de tratamiento. No tiene certificación clínica y no debe usarse como sustituto de atención licenciada.',
        },
        {
          q: '¿Puede Luna29 diagnosticar condiciones?',
          a: 'No. Luna29 identifica correlaciones y patrones descriptivos basados en los datos que proporcionas. Correlación no es causalidad, y el lenguaje de patrones no es un diagnóstico. Solo un clínico cualificado puede confirmar condiciones médicas.',
        },
        {
          q: '¿Proporciona Luna29 terapia?',
          a: 'No. Las reflexiones de voz y el lenguaje de estado pueden apoyar el procesamiento emocional, pero Luna29 no es psicoterapia, consejería ni atención psiquiátrica. Si necesitas apoyo en salud mental, contacta a un profesional licenciado.',
        },
        {
          q: '¿Puede Luna29 reemplazar a mi médico?',
          a: 'No. Luna29 es una capa de preparación: te ayuda a llegar a las consultas con observaciones organizadas, cronologías y vocabulario. Las decisiones médicas — análisis, medicamentos y derivaciones — quedan exclusivamente entre tú y tu clínico.',
        },
        {
          q: '¿Es Luna29 apropiada para emergencias?',
          a: 'No. Si puedes estar en peligro inmediato, contacta a los servicios de emergencia locales. Reset Room ofrece solo orientación de anclaje — no respuesta de emergencia ni atención clínica de crisis.',
        },
        {
          q: '¿Puedo cambiar medicamentos según los insights de Luna29?',
          a: 'Nunca sin tu clínico prescriptor. Luna29 no recomienda cambios de dosis, suplementos ni planes de tratamiento. Usa los informes como material de conversación, no como instrucciones.',
        },
      ],
    },
    {
      title: 'Ritmo, hormonas y vida diaria',
      intro: 'Luna29 lee la fisiología como contexto dinámico — no como una tabla de calificaciones.',
      items: [
        {
          q: '¿Por qué las hormonas afectan el ánimo y la energía?',
          a: 'Las hormonas modulan cómo los circuitos neuronales procesan las señales de estrés, recompensa y fatiga. También influyen en el rendimiento metabólico — la eficiencia con que las células acceden al combustible. Juntas crean un «clima interior» base que cambia según las fases del ciclo, la deuda de sueño y la carga vital.',
        },
        {
          q: '¿Por qué el estrés es tan influyente?',
          a: 'El cortisol es una señal de prioridad. Bajo estrés sostenido, el sistema reasigna recursos hacia funciones de supervivencia. La digestión, la señalización reproductiva y la flexibilidad cognitiva pueden quedar temporalmente en segundo plano — por eso el estrés puede aplanar o distorsionar otros ritmos que esperas.',
        },
        {
          q: '¿Qué significa un estado de sensibilidad «Strained»?',
          a: 'Strained indica demanda elevada respecto a la recuperación: tu sistema mantiene la función bajo carga. En la vida diaria puede sentirse como irritabilidad, sobrecarga sensorial, sueño superficial o dificultad para desconectar. Es una bandera de orientación — no un juicio moral.',
        },
        {
          q: '¿Qué pasa si no tengo un ciclo clásico de 28 días?',
          a: 'Luna29 sigue siendo útil. Alinea el mapa usando signos físicos, arcos de energía y el Temporal Scrubber en lugar de forzar simetría calendárica. Notas honestas con alineación aproximada superan la precisión artificial.',
        },
        {
          q: '¿Qué cambia con anticonceptivos hormonales?',
          a: 'Las hormonas exógenas suelen crear una línea base más estable con menor amplitud de onda. Aún puedes rastrear sensibilidad, sueño, ánimo, libido y respuesta al estrés — muchas usuarias descubren patrones sutiles incluso en un mapa aplanado.',
        },
      ],
    },
    {
      title: 'Datos, privacidad y control',
      intro: 'Tu biología es personal. Luna29 prioriza la arquitectura local-first siempre que sea posible.',
      items: [
        {
          q: '¿Qué datos procesa Luna29?',
          a: 'Los datos que introduces o generas: check-ins, notas de ciclo, reflexiones de voz, importaciones opcionales de análisis, contexto de perfil y registros técnicos necesarios para autenticación y estabilidad. Luna29 no recopila silenciosamente datos del dispositivo ajenos con fines publicitarios.',
        },
        {
          q: '¿Dónde se almacenan mis datos de salud?',
          a: 'Los registros principales de bienestar están diseñados para permanecer en tu dispositivo (almacenamiento local). Las credenciales de cuenta, los flujos de seguridad y ciertas funciones en la nube pueden usar infraestructura backend protegida — siempre divulgada en Privacy Notice.',
        },
        {
          q: '¿Vende Luna29 datos personales?',
          a: 'No. El modelo de negocio es acceso por suscripción a herramientas — no corretaje de datos. No vendemos perfiles conductuales o fisiológicos a anunciantes ni a mercados de datos de terceros.',
        },
        {
          q: '¿Cómo funcionan las exportaciones?',
          a: 'Tú inicias las exportaciones manualmente. Health Reports y las exportaciones JSON generan archivos bajo tu control. Comparte solo lo que elijas — con un clínico, pareja o para archivo personal.',
        },
        {
          q: '¿Qué pasa si borro el almacenamiento del navegador?',
          a: 'El historial local puede eliminarse. Recomendamos exportaciones periódicas como respaldo personal. Los datos de autenticación pueden persistir por separado según la configuración.',
        },
      ],
    },
    {
      title: 'Membresía y herramientas',
      intro: 'Preguntas prácticas sobre acceso, informes y uso diario dentro de Luna29.',
      items: [
        {
          q: '¿Qué incluye la zona de miembros?',
          a: 'Mapa interactivo del ritmo, check-ins estructurados, reflexiones Voice Note, Health Reports, ayudas de comunicación The Bridge, Ritual Path, Reset Room y controles de exportación/privacidad — unificados en una interfaz serena.',
        },
        {
          q: '¿Puedo subir PDFs y escaneos de análisis a los informes?',
          a: 'Sí. My Health Reports acepta texto, imágenes y PDF para revisión estructurada. Los resultados organizan marcadores en secciones listas para la consulta — aún educativos, no diagnósticos.',
        },
        {
          q: '¿Pueden los informes coincidir con el idioma de la interfaz?',
          a: 'Sí. La generación de informes puede seguir tu configuración de idioma activa en Luna29, apoyando conversaciones de atención multilingües.',
        },
        {
          q: '¿Dónde pueden aprender las parejas comunicación de apoyo?',
          a: 'Consulta Partner FAQ y The Bridge. Ambos ofrecen frases serenas, lenguaje basado en la capacidad y contexto que reduce ciclos de culpa en las relaciones.',
        },
        {
          q: '¿Cuánto tiempo debo dedicar diariamente?',
          a: 'La mayoría de las miembros mantienen el valor con 60–90 segundos de check-in más notas de voz ocasionales. Luna29 está diseñada para continuidad, no para seguimiento compulsivo.',
        },
      ],
    },
  ],

  fr: [
    {
      title: 'Vue d\'ensemble du système',
      intro:
        'Luna29 Balance est un système d\'auto-observation orienté physiologie. Ces réponses définissent ce qu\'est la plateforme — et ce qu\'elle n\'est délibérément pas.',
      items: [
        {
          q: 'Qu\'est-ce que Luna29 Balance ?',
          a: 'Luna29 Balance est un environnement visuel de cartographie du rythme physiologique et de l\'état intérieur. Il intègre le contexte du cycle, la charge de stress, les signaux métaboliques et les marqueurs quotidiens en une « carte météo » cohérente — pour voir des schémas dans le temps plutôt que des points de données isolés.\n\nIl est conçu pour la clarté et le langage, pas pour la classification clinique.',
        },
        {
          q: 'Pour qui Luna29 est-elle conçue ?',
          a: 'Pour toute femme qui souhaite une façon structurée et calme de comprendre les variations d\'énergie, l\'instabilité de l\'humeur, la sensibilité et les changements liés au cycle — à tout stade de la vie reproductive, y compris la périménopause, la récupération post-partum ou une base stable sous contraception hormonale.\n\nUn cycle régulier n\'est pas nécessaire. Il faut une observation honnête.',
        },
        {
          q: 'En quoi Luna29 diffère-t-elle des apps de cycle ?',
          a: 'Les apps de cycle optimisent la prédiction. Luna29 optimise l\'interprétation.\n\nAu lieu de demander « quand aurai-je mes prochaines règles ? », Luna29 demande : « à travers quelles conditions passe-je et comment sont-elles liées au sommeil, au stress, à la concentration et à la communication ? » Le corps est traité comme un réseau connecté — pas comme un événement de calendrier.',
        },
        {
          q: 'Faut-il une formation médicale pour utiliser Luna29 ?',
          a: 'Non. Luna29 traduit la physiologie complexe en langage simple, échelles visuelles et contexte de phases. Les concepts techniques incluent de courtes définitions dans la section Apprentissage. L\'interface est pensée pour la vie quotidienne, pas pour les cliniciens.',
        },
        {
          q: 'Quel lien entre les pages publiques et la zone membre ?',
          a: 'Les pages publiques expliquent la philosophie, les limites de sécurité et l\'orientation produit. La zone membre authentifiée contient vos outils personnels : carte du rythme, réflexions vocales, rapports, aides à la communication The Bridge, Ritual Path et contrôles d\'export.\n\nVotre journal privé n\'est pas requis pour parcourir le contenu public.',
        },
      ],
    },
    {
      title: 'Périmètre médical et sécurité',
      intro:
        'Luna29 opère dans l\'espace bien-être et éducation. Les limites suivantes protègent les utilisatrices et préservent la confiance.',
      items: [
        {
          q: 'Luna29 est-elle un service ou dispositif médical ?',
          a: 'Non. Luna29 n\'est ni un service médical, ni un dispositif médical, ni un instrument de diagnostic, ni un prestataire de traitement. Elle ne détient pas de certification clinique et ne doit pas remplacer une prise en charge agréée.',
        },
        {
          q: 'Luna29 peut-elle poser des diagnostics ?',
          a: 'Non. Luna29 identifie des corrélations et des schémas descriptifs à partir de vos données. Corrélation n\'est pas causalité, et le langage des schémas n\'est pas un diagnostic. Seul un clinicien qualifié peut confirmer des conditions médicales.',
        },
        {
          q: 'Luna29 propose-t-elle une thérapie ?',
          a: 'Non. Les réflexions vocales et le langage d\'état peuvent soutenir le traitement émotionnel, mais Luna29 n\'est pas une psychothérapie, un counseling ni des soins psychiatriques. Pour un soutien en santé mentale, contactez un professionnel agréé.',
        },
        {
          q: 'Luna29 peut-elle remplacer mon médecin ?',
          a: 'Non. Luna29 est une couche de préparation : elle vous aide à arriver en consultation avec des observations organisées, des chronologies et un vocabulaire. Les décisions médicales — analyses, médicaments, orientations — restent exclusivement entre vous et votre clinicien.',
        },
        {
          q: 'Luna29 convient-elle aux urgences ?',
          a: 'Non. Si vous êtes en danger immédiat, contactez les services d\'urgence locaux. Reset Room propose uniquement une orientation d\'ancrage — pas de réponse d\'urgence ni de soins cliniques de crise.',
        },
        {
          q: 'Puis-je modifier mes médicaments selon Luna29 ?',
          a: 'Jamais sans votre prescripteur. Luna29 ne recommande pas de changements de dosage, de compléments ni de plans de traitement. Utilisez les rapports comme matériel de conversation, pas comme instructions.',
        },
      ],
    },
    {
      title: 'Rythme, hormones et vie quotidienne',
      intro: 'Luna29 lit la physiologie comme un contexte dynamique — pas comme un bulletin de notes.',
      items: [
        {
          q: 'Pourquoi les hormones influencent-elles l\'humeur et l\'énergie ?',
          a: 'Les hormones modulent la façon dont les circuits neuronaux traitent le stress, la récompense et la fatigue. Elles influencent aussi le débit métabolique — l\'efficacité avec laquelle les cellules accèdent au carburant. Ensemble, elles créent un « climat intérieur » de base qui évolue selon les phases du cycle, la dette de sommeil et la charge de vie.',
        },
        {
          q: 'Pourquoi le stress est-il si influent ?',
          a: 'Le cortisol est un signal de priorité. Sous stress prolongé, le système réalloue les ressources vers les fonctions de survie. La digestion, la signalisation reproductive et la flexibilité cognitive peuvent être temporairement reléguées — d\'où le fait que le stress puisse aplatir ou déformer d\'autres rythmes attendus.',
        },
        {
          q: 'Que signifie un état de sensibilité « Strained » ?',
          a: 'Strained indique une demande élevée par rapport à la récupération : votre système maintient la fonction sous charge. Au quotidien, cela peut se ressentir comme irritabilité, surcharge sensorielle, sommeil léger ou difficulté à décrocher. C\'est un repère d\'orientation — pas un jugement moral.',
        },
        {
          q: 'Et si je n\'ai pas un cycle classique de 28 jours ?',
          a: 'Luna29 reste utile. Alignez la carte sur les signes physiques, les arcs d\'énergie et le Temporal Scrubber plutôt que d\'imposer une symétrie calendaire. Des notes honnêtes avec un alignement approximatif valent mieux qu\'une fausse précision.',
        },
        {
          q: 'Que change la contraception hormonale ?',
          a: 'Les hormones exogènes créent souvent une base plus stable avec une amplitude d\'onde réduite. Vous pouvez toujours suivre sensibilité, sommeil, humeur, libido et réponse au stress — beaucoup d\'utilisatrices découvrent des schémas subtils même sur une carte aplatie.',
        },
      ],
    },
    {
      title: 'Données, confidentialité et contrôle',
      intro: 'Votre biologie est personnelle. Luna29 privilégie l\'architecture local-first dès que possible.',
      items: [
        {
          q: 'Quelles données Luna29 traite-t-elle ?',
          a: 'Les données que vous saisissez ou générez : check-ins, notes de cycle, réflexions vocales, importations optionnelles d\'analyses, contexte de profil et journaux techniques requis pour l\'authentification et la stabilité. Luna29 ne collecte pas silencieusement des données d\'appareil sans rapport pour la publicité.',
        },
        {
          q: 'Où sont stockées mes données de santé ?',
          a: 'Les enregistrements wellness principaux sont conçus pour rester sur votre appareil (stockage local). Les identifiants de compte, les flux de sécurité et certaines fonctions cloud peuvent utiliser une infrastructure backend protégée — toujours divulguée dans Privacy Notice.',
        },
        {
          q: 'Luna29 vend-elle des données personnelles ?',
          a: 'Non. Le modèle économique repose sur l\'accès par abonnement aux outils — pas sur le courtage de données. Nous ne vendons pas de profils comportementaux ou physiologiques à des annonceurs ou marchés de données tiers.',
        },
        {
          q: 'Comment fonctionnent les exports ?',
          a: 'Vous initiez les exports manuellement. Health Reports et les exports JSON génèrent des fichiers sous votre contrôle. Partagez uniquement ce que vous choisissez — avec un clinicien, un partenaire ou pour archive personnelle.',
        },
        {
          q: 'Que se passe-t-il si je vide le stockage du navigateur ?',
          a: 'L\'historique local peut être supprimé. Nous recommandons des exports périodiques comme sauvegarde personnelle. Les données d\'authentification peuvent persister séparément selon la configuration.',
        },
      ],
    },
    {
      title: 'Adhésion et outils',
      intro: 'Questions pratiques sur l\'accès, les rapports et l\'usage quotidien dans Luna29.',
      items: [
        {
          q: 'Que contient la zone membre ?',
          a: 'Carte interactive du rythme, check-ins structurés, réflexions Voice Note, Health Reports, aides à la communication The Bridge, Ritual Path, Reset Room et contrôles export/confidentialité — unifiés dans une interface calme.',
        },
        {
          q: 'Puis-je importer des PDF et scans d\'analyses dans les rapports ?',
          a: 'Oui. My Health Reports accepte texte, images et PDF pour une revue structurée. Les sorties organisent les marqueurs en sections prêtes pour la consultation — toujours éducatives, pas diagnostiques.',
        },
        {
          q: 'Les rapports peuvent-ils suivre la langue de l\'interface ?',
          a: 'Oui. La génération de rapports peut suivre votre réglage de langue Luna29 actif, pour des échanges de soins multilingues.',
        },
        {
          q: 'Où les partenaires apprennent-ils une communication de soutien ?',
          a: 'Voir Partner FAQ et The Bridge. Les deux proposent des formulations calmes, un langage basé sur la capacité et un contexte qui réduit les cycles de reproche dans les relations.',
        },
        {
          q: 'Combien de temps par jour ?',
          a: 'La plupart des membres maintiennent la valeur avec 60–90 secondes de check-in plus des notes vocales occasionnelles. Luna29 est conçue pour la continuité, pas le suivi compulsif.',
        },
      ],
    },
  ],

  de: [
    {
      title: 'Systemüberblick',
      intro:
        'Luna29 Balance ist ein physiologieorientiertes Selbstbeobachtungssystem. Diese Antworten definieren, was die Plattform ist — und was sie bewusst nicht ist.',
      items: [
        {
          q: 'Was ist Luna29 Balance?',
          a: 'Luna29 Balance ist eine visuelle Umgebung zur Kartierung physiologischer Rhythmen und innerer Zustände. Sie integriert Zykluskontext, Stressbelastung, metabolische Signale und tägliche Marker in eine kohärente «Wetterkarte» — und hilft, Muster über die Zeit zu sehen statt isolierte Datenpunkte.\n\nSie ist für Klarheit und Sprache konzipiert, nicht für klinische Klassifikation.',
        },
        {
          q: 'Für wen ist Luna29 gedacht?',
          a: 'Für jede Frau, die einen strukturierten, ruhigen Weg sucht, Energieverschiebungen, Stimmungsschwankungen, Sensibilität und zyklusbezogene Veränderungen zu verstehen — in jeder Phase des reproduktiven Lebens, einschließlich Perimenopause, postpartaler Erholung oder stabiler Baseline unter hormoneller Verhütung.\n\nEin regelmäßiger Zyklus ist nicht nötig. Ehrliche Beobachtung schon.',
        },
        {
          q: 'Wie unterscheidet sich Luna29 von Zyklus-Apps?',
          a: 'Zyklus-Apps optimieren Vorhersage. Luna29 optimiert Interpretation.\n\nStatt «wann kommt die nächste Blutung?» fragt Luna29: «durch welche Bedingungen gehe ich und wie hängen sie mit Schlaf, Stress, Fokus und Kommunikation zusammen?» Der Körper wird als vernetztes System behandelt — nicht als Kalenderereignis.',
        },
        {
          q: 'Brauche ich medizinische Ausbildung für Luna29?',
          a: 'Nein. Luna29 übersetzt komplexe Physiologie in klare Sprache, visuelle Skalen und Phasenkontext. Technische Begriffe haben kurze Definitionen im Lernbereich. Die Oberfläche ist für den Alltag gebaut, nicht für Kliniker.',
        },
        {
          q: 'Wie hängen öffentliche Seiten und Mitgliederzone zusammen?',
          a: 'Öffentliche Seiten erklären Philosophie, Sicherheitsgrenzen und Produktorientierung. Die authentifizierte Mitgliederzone enthält persönliche Tools: Rhythmus-Karte, Sprachreflexionen, Berichte, Kommunikationshilfen The Bridge, Ritual Path und Exportkontrollen.\n\nDein privates Journal ist nicht nötig, um öffentliche Inhalte zu durchsuchen.',
        },
      ],
    },
    {
      title: 'Medizinischer Rahmen und Sicherheit',
      intro:
        'Luna29 arbeitet im Wellness- und Bildungsraum. Die folgenden Grenzen schützen Nutzerinnen und bewahren Vertrauen.',
      items: [
        {
          q: 'Ist Luna29 ein medizinischer Dienst oder Gerät?',
          a: 'Nein. Luna29 ist kein medizinischer Dienst, kein Medizinprodukt, kein Diagnoseinstrument und kein Behandlungsanbieter. Es trägt keine klinische Zertifizierung und darf lizenzierte Versorgung nicht ersetzen.',
        },
        {
          q: 'Kann Luna29 Erkrankungen diagnostizieren?',
          a: 'Nein. Luna29 identifiziert Korrelationen und beschreibende Muster aus deinen Daten. Korrelation ist nicht Kausalität, und Mustersprache ist keine Diagnose. Medizinische Zustände bestätigt nur eine qualifizierte Fachkraft.',
        },
        {
          q: 'Bietet Luna29 Therapie?',
          a: 'Nein. Sprachreflexionen und Zustandssprache können emotionale Verarbeitung unterstützen, aber Luna29 ist keine Psychotherapie, Beratung oder psychiatrische Versorgung. Bei Bedarf an psychischer Unterstützung wende dich an eine lizenzierte Fachkraft.',
        },
        {
          q: 'Kann Luna29 meinen Arzt ersetzen?',
          a: 'Nein. Luna29 ist eine Vorbereitungsschicht: Sie hilft dir, mit organisierten Beobachtungen, Zeitlinien und Vokabular zum Termin zu kommen. Medizinische Entscheidungen — Labor, Medikamente, Überweisungen — bleiben ausschließlich zwischen dir und deiner Ärztin oder deinem Arzt.',
        },
        {
          q: 'Ist Luna29 für Notfälle geeignet?',
          a: 'Nein. Bei unmittelbarer Gefahr kontaktiere lokale Notdienste. Reset Room bietet nur Erdungsorientierung — keine Notfallreaktion oder klinische Krisenversorgung.',
        },
        {
          q: 'Kann ich Medikamente nach Luna29-Insights ändern?',
          a: 'Niemals ohne deine verschreibende Fachkraft. Luna29 empfiehlt keine Dosisänderungen, Nahrungsergänzungen oder Behandlungspläne. Nutze Berichte als Gesprächsmaterial, nicht als Anweisungen.',
        },
      ],
    },
    {
      title: 'Rhythmus, Hormone und Alltag',
      intro: 'Luna29 liest Physiologie als dynamischen Kontext — nicht als Zeugnis.',
      items: [
        {
          q: 'Warum beeinflussen Hormone Stimmung und Energie?',
          a: 'Hormone modulieren, wie neuronale Schaltkreise Stress-, Belohnungs- und Müdigkeitssignale verarbeiten. Sie beeinflussen auch den metabolischen Durchsatz — wie effizient Zellen Energie nutzen. Zusammen entsteht ein Basis-«Innenklima», das sich über Zyklusphasen, Schlafdefizit und Lebenslast verschiebt.',
        },
        {
          q: 'Warum ist Stress so einflussreich?',
          a: 'Cortisol ist ein Prioritätssignal. Unter anhaltendem Stress verteilt das System Ressourcen auf Überlebensfunktionen um. Verdauung, reproduktive Signalgebung und kognitive Flexibilität können vorübergehend nachrangig werden — deshalb kann Stress andere erwartete Rhythmen abflachen oder verzerren.',
        },
        {
          q: 'Was bedeutet ein «Strained»-Sensibilitätszustand?',
          a: 'Strained zeigt erhöhte Nachfrage relativ zur Erholung: Dein System hält Funktion unter Last aufrecht. Im Alltag kann sich das wie Reizbarkeit, sensorische Überlastung, flacher Schlaf oder Schwierigkeit beim Abschalten anfühlen. Es ist ein Orientierungsmarker — kein moralisches Urteil.',
        },
        {
          q: 'Was, wenn ich keinen klassischen 28-Tage-Zyklus habe?',
          a: 'Luna29 bleibt nützlich. Richte die Karte an körperlichen Zeichen, Energiebögen und dem Temporal Scrubber aus, statt Kalendersymmetrie zu erzwingen. Ehrliche Notizen mit ungefährer Ausrichtung schlagen künstliche Präzision.',
        },
        {
          q: 'Was ändert sich bei hormoneller Verhütung?',
          a: 'Exogene Hormone erzeugen oft eine stabilere Baseline mit geringerer Wellenamplitude. Du kannst trotzdem Sensibilität, Schlaf, Stimmung, Libido und Stressreaktion verfolgen — viele Nutzerinnen entdecken feine Muster auch auf einer abgeflachten Karte.',
        },
      ],
    },
    {
      title: 'Daten, Datenschutz und Kontrolle',
      intro: 'Deine Biologie ist persönlich. Luna29 setzt wo möglich auf local-first-Architektur.',
      items: [
        {
          q: 'Welche Daten verarbeitet Luna29?',
          a: 'Daten, die du eingibst oder erzeugst: Check-ins, Zyklusnotizen, Sprachreflexionen, optionale Laborimporte, Profilkontext und technische Logs für Authentifizierung und Stabilität. Luna29 sammelt nicht heimlich fremde Gerätedaten für Werbung.',
        },
        {
          q: 'Wo werden meine Gesundheitsdaten gespeichert?',
          a: 'Kern-Wellness-Aufzeichnungen sind so konzipiert, dass sie auf deinem Gerät bleiben (local storage). Kontodaten, Sicherheitsabläufe und ausgewählte Cloud-Funktionen können geschützte Backend-Infrastruktur nutzen — stets offengelegt in Privacy Notice.',
        },
        {
          q: 'Verkauft Luna29 persönliche Daten?',
          a: 'Nein. Das Geschäftsmodell ist abonnementbasierter Toolzugang — kein Datenbrokerage. Wir verkaufen keine Verhaltens- oder Physiologieprofile an Werbetreibende oder Drittmarktplätze.',
        },
        {
          q: 'Wie funktionieren Exporte?',
          a: 'Du startest Exporte manuell. Health Reports und JSON-Exporte erzeugen Dateien unter deiner Kontrolle. Teile nur, was du wählst — mit Kliniker, Partner oder für persönliches Archiv.',
        },
        {
          q: 'Was passiert beim Löschen des Browser-Speichers?',
          a: 'Lokale Historie kann gelöscht werden. Wir empfehlen regelmäßige Exporte als persönliches Backup. Authentifizierungsdaten können je nach Konfiguration separat bestehen bleiben.',
        },
      ],
    },
    {
      title: 'Mitgliedschaft und Tools',
      intro: 'Praktische Fragen zu Zugang, Berichten und täglicher Nutzung in Luna29.',
      items: [
        {
          q: 'Was bietet die Mitgliederzone?',
          a: 'Interaktive Rhythmus-Karte, strukturierte Check-ins, Voice Note-Reflexionen, Health Reports, Kommunikationshilfen The Bridge, Ritual Path, Reset Room und Export-/Datenschutzkontrollen — vereint in einer ruhigen Oberfläche.',
        },
        {
          q: 'Kann ich Labor-PDFs und Scans in Berichte hochladen?',
          a: 'Ja. My Health Reports akzeptiert Text, Bilder und PDF für strukturierte Übersicht. Ausgaben ordnen Marker in besuchsfertige Abschnitte — weiterhin bildend, nicht diagnostisch.',
        },
        {
          q: 'Können Berichte der Oberflächensprache folgen?',
          a: 'Ja. Berichtserstellung kann deiner aktiven Luna29-Spracheinstellung folgen und mehrsprachige Versorgungsgespräche unterstützen.',
        },
        {
          q: 'Wo lernen Partner unterstützende Kommunikation?',
          a: 'Siehe Partner FAQ und The Bridge. Beide bieten ruhige Formulierungen, kapazitätsbasierte Sprache und Kontext, der Schuldzirkeln in Beziehungen vorbeugt.',
        },
        {
          q: 'Wie viel Zeit täglich?',
          a: 'Die meisten Mitglieder halten den Nutzen mit 60–90 Sekunden Check-in plus gelegentlichen Sprachnotizen. Luna29 ist für Kontinuität gedacht, nicht für zwanghaftes Tracking.',
        },
      ],
    },
  ],

  zh: [
    {
      title: '系统概览',
      intro:
        'Luna29 Balance 是一套以生理为导向的自我观察系统。以下回答说明平台是什么——以及它刻意不是什么。',
      items: [
        {
          q: '什么是 Luna29 Balance？',
          a: 'Luna29 Balance 是一个用于映射生理节律与内在状态的可视化环境。它将周期背景、压力负荷、代谢信号与日常标记整合为连贯的「天气图」——帮助你在时间维度上看到模式，而非孤立的数据点。\n\n它面向清晰表达与理解，而非临床分类。',
        },
        {
          q: 'Luna29 面向谁？',
          a: '面向任何希望以结构化、平静的方式理解能量变化、情绪波动、敏感性与周期相关变化的女性——无论处于生殖生命的哪个阶段，包括围绝经期、产后恢复或稳定使用激素避孕的基线状态。\n\n你不需要规律周期也能受益。你需要的是诚实的观察。',
        },
        {
          q: 'Luna29 与经期追踪 App 有何不同？',
          a: '经期 App 优化预测。Luna29 优化解读。\n\n它不问「下次月经何时来」，而问「我正经历哪些条件，它们与睡眠、压力、专注和沟通如何关联？」身体被视为互联网络——而非日历事件。',
        },
        {
          q: '使用 Luna29 需要医学背景吗？',
          a: '不需要。Luna29 将复杂生理机制转化为通俗语言、视觉量表与阶段背景。技术概念在学习板块中有简短定义。界面为日常生活设计，而非面向临床人员。',
        },
        {
          q: '公开页面与会员区是什么关系？',
          a: '公开页面说明理念、安全边界与产品导向。已登录会员区包含个人工具：节律地图、语音反思、报告、The Bridge 沟通辅助、Ritual Path 与导出控制。\n\n浏览公开内容无需使用私人日记。',
        },
      ],
    },
    {
      title: '医疗范围与安全',
      intro: 'Luna29 定位于 wellness 与教育领域。以下边界保护用户并维护信任。',
      items: [
        {
          q: 'Luna29 是医疗服务或医疗器械吗？',
          a: '不是。Luna29 不是医疗服务、医疗器械、诊断工具或治疗提供方。它不具备临床认证，不得替代持证医疗照护。',
        },
        {
          q: 'Luna29 能诊断疾病吗？',
          a: '不能。Luna29 基于你提供的数据识别相关性与描述性模式。相关不等于因果，模式语言不等于诊断。只有合格临床人员才能确认医疗状况。',
        },
        {
          q: 'Luna29 提供心理治疗吗？',
          a: '不提供。语音反思与状态语言可能支持情绪整理，但 Luna29 不是心理治疗、咨询或精神科照护。如需心理健康支持，请联系持证专业人士。',
        },
        {
          q: 'Luna29 能替代医生吗？',
          a: '不能。Luna29 是准备层：帮助你在就诊时带着有条理的观察、时间线与词汇。医疗决策——包括化验、用药与转诊——只能由你与临床医生共同作出。',
        },
        {
          q: 'Luna29 适用于紧急情况吗？',
          a: '不适用。若你可能处于即时危险，请联系当地紧急服务。Reset Room 仅提供落地安抚引导——不提供紧急响应或危机临床照护。',
        },
        {
          q: '能否根据 Luna29 洞察调整用药？',
          a: '绝不可在未咨询处方医生的情况下自行调整。Luna29 不推荐剂量变更、补充剂或治疗方案。请将报告作为对话材料，而非指令。',
        },
      ],
    },
    {
      title: '节律、激素与日常生活',
      intro: 'Luna29 将生理读作动态背景——而非成绩单。',
      items: [
        {
          q: '为什么激素会影响情绪与能量？',
          a: '激素调节神经回路如何处理压力、奖赏与疲劳信号，也影响代谢通量——细胞获取能量的效率。二者共同构成随周期阶段、睡眠负债与生活负荷而变化的基线「室内气候」。',
        },
        {
          q: '为什么压力影响如此之大？',
          a: '皮质醇是优先级信号。在持续压力下，系统会将资源重新分配给生存功能。消化、生殖信号与认知灵活性可能暂时让位——因此压力会压平或扭曲你预期的其他节律。',
        },
        {
          q: '「Strained」敏感状态意味着什么？',
          a: 'Strained 表示相对恢复而言需求升高：系统在负荷下维持功能。日常生活中可能表现为易怒、感官过载、浅睡或难以「关机」。这是方向提示——不是道德评判。',
        },
        {
          q: '如果没有典型的 28 天周期怎么办？',
          a: 'Luna29 仍然有用。请用体征、能量弧线与 Temporal Scrubber 对齐地图，而非强行日历对称。诚实记录加近似对齐，优于人为精确。',
        },
        {
          q: '使用激素避孕时有什么变化？',
          a: '外源激素常形成更平稳的基线、自然波动幅度减小。你仍可追踪敏感性、睡眠、情绪、性欲与应激反应——许多用户即使在被压平的地图上也能发现细微模式。',
        },
      ],
    },
    {
      title: '数据、隐私与控制',
      intro: '你的生理信息属于个人。Luna29 在可行范围内默认采用 local-first 架构。',
      items: [
        {
          q: 'Luna29 处理哪些数据？',
          a: '你输入或生成的数据：check-in、周期笔记、语音反思、可选化验导入、个人资料背景，以及认证与稳定性所需的技术日志。Luna29 不会静默收集无关设备数据用于广告。',
        },
        {
          q: '健康数据存储在哪里？',
          a: '核心 wellness 记录设计为保留在你的设备上（local storage）。账户凭证、安全流程与部分云端功能可能使用受保护的后端基础设施——均在 Privacy Notice 中披露。',
        },
        {
          q: 'Luna29 会出售个人数据吗？',
          a: '不会。商业模式是订阅工具访问——而非数据经纪。我们不会向广告主或第三方数据市场出售行为或生理画像。',
        },
        {
          q: '导出如何工作？',
          a: '由你手动发起导出。Health Reports 与 JSON 导出生成你控制的文件。只分享你选择的内容——给临床医生、伴侣或个人存档。',
        },
        {
          q: '清除浏览器存储会怎样？',
          a: '本地历史可能被删除。建议定期导出作为个人备份。认证数据可能依配置单独保留。',
        },
      ],
    },
    {
      title: '会员与工具',
      intro: '关于 Luna29 内访问、报告与日常使用的实用问题。',
      items: [
        {
          q: '会员区包含什么？',
          a: '交互式节律地图、结构化 check-in、Voice Note 反思、Health Reports、The Bridge 沟通辅助、Ritual Path、Reset Room，以及导出/隐私控制——统一于同一套简洁界面中。',
        },
        {
          q: '能否将化验 PDF 与扫描件上传至报告？',
          a: '可以。My Health Reports 接受文本、图片与 PDF 进行结构化审阅。输出将指标组织为就诊就绪章节——仍为教育性质，非诊断。',
        },
        {
          q: '报告能否匹配界面语言？',
          a: '可以。报告生成可跟随你当前的 Luna29 语言设置，支持多语言就医对话。',
        },
        {
          q: '伴侣在哪里学习支持性沟通？',
          a: '请参阅 Partner FAQ 与 The Bridge。两者提供平和措辞、基于容量的表达方式，以及有助于减少关系中相互指责循环的背景。',
        },
        {
          q: '每天应花多少时间？',
          a: '大多数会员以 60–90 秒 check-in 加偶尔的语音笔记即可持续获得价值。Luna29 为长期连续性而设计，而非强迫式追踪。',
        },
      ],
    },
  ],

  ja: [
    {
      title: 'システム概要',
      intro:
        'Luna29 Balance は生理に焦点を当てた自己観察システムです。以下の回答は、プラットフォームが何であるか——そして意図的に何でないか——を定義します。',
      items: [
        {
          q: 'Luna29 Balance とは？',
          a: 'Luna29 Balance は、生理的リズムと内面状態を可視化する環境です。周期の文脈、ストレス負荷、代謝シグナル、日々のマーカーを一つの「天気図」に統合し、孤立したデータ点ではなく時間軸のパターンを見えるようにします。\n\n明確さと言語のための設計であり、臨床分類のためではありません。',
        },
        {
          q: 'Luna29 は誰のためのもの？',
          a: 'エネルギーの変化、気分の揺れ、感受性、周期に関連する変化を、構造的で落ち着いた方法で理解したいすべての女性のため——周閉経期、産後回復、ホルモン避妊下の安定したベースラインなど、生殖期のどの段階でも。\n\n規則的な周期は不要です。必要なのは正直な観察です。',
        },
        {
          q: '生理アプリとの違いは？',
          a: '生理アプリは予測を最適化します。Luna29 は解釈を最適化します。\n\n「次の出血はいつ？」ではなく「今どんな条件を通過していて、睡眠・ストレス・集中・コミュニケーションとどう関係するか？」を問います。体はカレンダーイベントではなく、つながったネットワークとして扱われます。',
        },
        {
          q: '医学の知識は必要？',
          a: 'いいえ。Luna29 は複雑な生理学を平易な言葉、視覚スケール、フェーズの文脈に翻訳します。技術的概念は学習セクションに短い定義があります。インターフェースは日常のためであり、臨床家向けではありません。',
        },
        {
          q: '公開ページとメンバーゾーンの関係は？',
          a: '公開ページは哲学、安全境界、製品の方向性を説明します。認証済みメンバーゾーンには個人ツール——リズムマップ、音声リフレクション、レポート、The Bridge、Ritual Path、エクスポート管理——が含まれます。\n\n公開コンテンツの閲覧に私的ジャーナルは不要です。',
        },
      ],
    },
    {
      title: '医療的範囲と安全性',
      intro: 'Luna29 は wellness と教育の領域で運営されます。以下の境界はユーザーを保護し、信頼を維持します。',
      items: [
        {
          q: 'Luna29 は医療サービスまたは医療機器ですか？',
          a: 'いいえ。Luna29 は医療サービス、医療機器、診断機器、治療提供者ではありません。臨床認証を持たず、有資格の医療を代替してはなりません。',
        },
        {
          q: 'Luna29 は疾患を診断できますか？',
          a: 'いいえ。Luna29 は提供データに基づく相関と記述的パターンを示します。相関は因果ではなく、パターン言語は診断ではありません。医学的条件の確認は資格を持つ臨床家のみが行います。',
        },
        {
          q: 'Luna29 はセラピーを提供しますか？',
          a: 'いいえ。音声リフレクションと状態言語は感情処理を支援することがありますが、Luna29 は心理療法、カウンセリング、精神科治療ではありません。メンタルヘルス支援が必要な場合は有資格の専門家にご相談ください。',
        },
        {
          q: 'Luna29 は医師の代わりになりますか？',
          a: 'いいえ。Luna29 は準備層です——整理された観察、タイムライン、語彙を持って受診するのに役立ちます。検査、薬、紹介などの医療判断は、あなたと臨床家の間だけで行われます。',
        },
        {
          q: 'Luna29 は緊急時に適していますか？',
          a: 'いいえ。差し迫った危険がある場合は地域の緊急サービスに連絡してください。Reset Room はグラウンディングによる方向づけのみを提供します——緊急対応や危機的臨床ケアではありません。',
        },
        {
          q: 'Luna29 の洞察に基づき薬を変更できますか？',
          a: '処方医なしでは絶対にいけません。Luna29 は用量変更、サプリメント、治療計画を推奨しません。レポートは会話の材料として使い、指示としては使わないでください。',
        },
      ],
    },
    {
      title: 'リズム、ホルモン、日常生活',
      intro: 'Luna29 は生理学を動的な文脈として読み取ります——成績表ではありません。',
      items: [
        {
          q: 'なぜホルモンが気分とエネルギーに影響するの？',
          a: 'ホルモンは、神経回路がストレス・報酬・疲労シグナルを処理する方法を調整します。代謝スループット——細胞が燃料にアクセスする効率——にも影響します。これらが合わさって、周期フェーズ、睡眠負債、生活負荷に応じて変化する基線の「室内気候」を作ります。',
        },
        {
          q: 'なぜストレスの影響が大きいの？',
          a: 'コルチゾールは優先シグナルです。持続的ストレス下では、システムは生存機能へリソースを再配分します。消化、生殖シグナル、認知的柔軟性が一時的に後回しになり——ストレスが期待する他のリズムを平坦化したり歪めたりする理由です。',
        },
        {
          q: '「Strained」感受性状態とは？',
          a: 'Strained は回復に対する需要の上昇を示します——負荷下でも機能を維持している状態です。日常ではイライラ、感覚過負荷、浅い睡眠、「オフ」にできない感覚として現れることがあります。方向づけのフラグであり——道徳的判断ではありません。',
        },
        {
          q: '典型的な28日周期がない場合は？',
          a: 'Luna29 は依然として有用です。カレンダー対称を強制せず、身体徴候、エネルギーアーク、Temporal Scrubber でマップを合わせてください。近似アライメントと正直なメモが、人工的な精度に勝ります。',
        },
        {
          q: 'ホルモン避妊では何が変わる？',
          a: '外因性ホルモンはしばしばより安定したベースラインと、自然波の振幅低下をもたらします。感受性、睡眠、気分、リビドー、ストレス反応は依然追跡可能——多くのユーザーが平坦化したマップでも微細なパターンを発見します。',
        },
      ],
    },
    {
      title: 'データ、プライバシー、管理',
      intro: 'あなたの生物学は個人的なものです。Luna29 は可能な限り local-first アーキテクチャを前提とします。',
      items: [
        {
          q: 'Luna29 はどのデータを処理しますか？',
          a: '入力または生成するデータ：check-in、周期メモ、音声リフレクション、任意の検査インポート、プロフィール文脈、認証と安定性に必要な技術ログ。Luna29 は広告のために無関係なデバイスデータを静かに収集しません。',
        },
        {
          q: '健康データはどこに保存されますか？',
          a: 'コア wellness 記録は端末上（local storage）に留まる設計です。アカウント資格情報、セキュリティフロー、選択的クラウド機能は保護された backend を使用することがあり——常に Privacy Notice で開示されます。',
        },
        {
          q: 'Luna29 は個人データを販売しますか？',
          a: 'いいえ。ビジネスモデルはツールへのサブスクリプションアクセス——データブローカレージではありません。行動・生理プロファイルを広告主や第三者データ市場に販売しません。',
        },
        {
          q: 'エクスポートはどう機能しますか？',
          a: 'エクスポートは手動で開始します。Health Reports と JSON エクスポートはあなたが管理するファイルを生成します。臨床家、パートナー、個人アーカイブ——選んだ分だけ共有してください。',
        },
        {
          q: 'ブラウザストレージを消すと？',
          a: 'ローカル履歴が削除される可能性があります。個人バックアップとして定期的なエクスポートを推奨します。認証データは設定により別途残る場合があります。',
        },
      ],
    },
    {
      title: 'メンバーシップとツール',
      intro: 'Luna29 内のアクセス、レポート、日常使用に関する実用的な質問。',
      items: [
        {
          q: 'メンバーゾーンには何が含まれますか？',
          a: 'インタラクティブなリズムマップ、構造化 check-in、Voice Note リフレクション、Health Reports、The Bridge、Ritual Path、Reset Room、エクスポート/プライバシー管理——落ち着いた一つのインターフェースに統合。',
        },
        {
          q: '検査 PDF やスキャンをレポートにアップロードできますか？',
          a: 'はい。My Health Reports はテキスト、画像、PDF を構造化レビュー用に受け付けます。出力はマーカーを受診向けセクションに整理——依然として教育的であり、診断的ではありません。',
        },
        {
          q: 'レポートはインターフェース言語に合わせられますか？',
          a: 'はい。レポート生成はアクティブな Luna29 言語設定に従え、多言語のケア会話を支援できます。',
        },
        {
          q: 'パートナーはどこで支援的なコミュニケーションを学べますか？',
          a: 'Partner FAQ と The Bridge をご覧ください。穏やかな言い回し、容量ベースの言い回し、関係の相互非難のサイクルを減らす文脈を提供します。',
        },
        {
          q: '毎日どのくらい時間をかけるべき？',
          a: '多くのメンバーは 60–90 秒の check-in と時折の Voice Note で価値を維持します。Luna29 は継続性のためであり、強迫的なトラッキングのためではありません。',
        },
      ],
    },
  ],

  pt: [
    {
      title: 'Visão geral do sistema',
      intro:
        'Luna29 Balance é um sistema de autoobservação orientado à fisiologia. Estas respostas definem o que a plataforma é — e o que deliberadamente não é.',
      items: [
        {
          q: 'O que é Luna29 Balance?',
          a: 'Luna29 Balance é um ambiente visual para mapear o ritmo fisiológico e o estado interior. Integra contexto do ciclo, carga de estresse, sinais metabólicos e marcadores diários num «mapa do tempo» coerente — ajudando a ver padrões ao longo do tempo, não pontos de dados isolados.\n\nFoi concebido para clareza e linguagem, não para classificação clínica.',
        },
        {
          q: 'Para quem a Luna29 foi desenhada?',
          a: 'Para qualquer mulher que queira uma forma estruturada e calma de entender mudanças de energia, variabilidade de humor, sensibilidade e alterações relacionadas ao ciclo — em qualquer fase da vida reprodutiva, incluindo perimenopausa, recuperação pós-parto ou baseline estável com contraceptivos hormonais.\n\nNão precisa de um ciclo regular para beneficiar. Precisa de observação honesta.',
        },
        {
          q: 'Como a Luna29 difere dos rastreadores de ciclo?',
          a: 'Apps de ciclo otimizam previsão. A Luna29 otimiza interpretação.\n\nEm vez de «quando vem a próxima menstruação?», a Luna29 pergunta: «por que condições estou a passar e como se relacionam com sono, estresse, foco e comunicação?» O corpo é tratado como uma rede conectada — não como evento de calendário.',
        },
        {
          q: 'Preciso de formação médica para usar a Luna29?',
          a: 'Não. A Luna29 traduz fisiologia complexa em linguagem clara, escalas visuais e contexto de fases. Conceitos técnicos incluem definições breves na secção Aprendizagem. A interface foi feita para o dia a dia, não para clínicos.',
        },
        {
          q: 'Qual a relação entre páginas públicas e zona de membros?',
          a: 'As páginas públicas explicam filosofia, limites de segurança e orientação do produto. A zona autenticada de membros contém ferramentas pessoais: mapa do ritmo, reflexões de voz, relatórios, auxílios de comunicação The Bridge, Ritual Path e controlos de exportação.\n\nNada do seu diário privado é necessário para explorar conteúdo público.',
        },
      ],
    },
    {
      title: 'Âmbito médico e segurança',
      intro:
        'A Luna29 opera no espaço de wellness e educação. Os seguintes limites protegem utilizadoras e preservam a confiança.',
      items: [
        {
          q: 'A Luna29 é um serviço ou dispositivo médico?',
          a: 'Não. A Luna29 não é serviço médico, dispositivo médico, instrumento de diagnóstico nem prestadora de tratamento. Não possui certificação clínica e não deve substituir cuidados licenciados.',
        },
        {
          q: 'A Luna29 pode diagnosticar condições?',
          a: 'Não. A Luna29 identifica correlações e padrões descritivos com base nos dados que fornece. Correlação não é causalidade, e linguagem de padrões não é diagnóstico. Apenas um clínico qualificado pode confirmar condições médicas.',
        },
        {
          q: 'A Luna29 fornece terapia?',
          a: 'Não. Reflexões de voz e linguagem de estado podem apoiar processamento emocional, mas a Luna29 não é psicoterapia, aconselhamento nem cuidados psiquiátricos. Se precisar de apoio em saúde mental, contacte um profissional licenciado.',
        },
        {
          q: 'A Luna29 pode substituir o meu médico?',
          a: 'Não. A Luna29 é uma camada de preparação: ajuda-a a chegar às consultas com observações organizadas, cronologias e vocabulário. Decisões médicas — análises, medicamentos, encaminhamentos — ficam exclusivamente entre si e o seu clínico.',
        },
        {
          q: 'A Luna29 é adequada para emergências?',
          a: 'Não. Se estiver em perigo imediato, contacte serviços de emergência locais. Reset Room oferece apenas orientação de ancoragem — não resposta de emergência nem cuidados clínicos de crise.',
        },
        {
          q: 'Posso alterar medicamentos com base nos insights da Luna29?',
          a: 'Nunca sem o seu clínico prescritor. A Luna29 não recomenda alterações de dose, suplementos ou planos de tratamento. Use relatórios como material de conversa, não como instruções.',
        },
      ],
    },
    {
      title: 'Ritmo, hormônios e vida diária',
      intro: 'A Luna29 lê a fisiologia como contexto dinâmico — não como boletim de notas.',
      items: [
        {
          q: 'Por que os hormônios afetam humor e energia?',
          a: 'Os hormônios modulam como os circuitos neurais processam sinais de estresse, recompensa e fadiga. Também influenciam o throughput metabólico — a eficiência com que as células acedem ao combustível. Juntos criam um «clima interior» base que muda com fases do ciclo, dívida de sono e carga de vida.',
        },
        {
          q: 'Por que o estresse é tão influente?',
          a: 'O cortisol é um sinal de prioridade. Sob estresse sustentado, o sistema realoca recursos para funções de sobrevivência. Digestão, sinalização reprodutiva e flexibilidade cognitiva podem ficar temporariamente em segundo plano — por isso o estresse pode achatar ou distorcer outros ritmos que espera.',
        },
        {
          q: 'O que significa um estado de sensibilidade «Strained»?',
          a: 'Strained indica demanda elevada relativamente à recuperação: o seu sistema mantém função sob carga. No dia a dia pode sentir-se como irritabilidade, sobrecarga sensorial, sono superficial ou dificuldade em desligar. É um sinal de orientação — não um julgamento moral.',
        },
        {
          q: 'E se não tiver um ciclo clássico de 28 dias?',
          a: 'A Luna29 continua útil. Alinhe o mapa usando sinais físicos, arcos de energia e o Temporal Scrubber em vez de forçar simetria calendárica. Notas honestas com alinhamento aproximado superam precisão artificial.',
        },
        {
          q: 'O que muda com contraceptivos hormonais?',
          a: 'Hormônios exógenos frequentemente criam uma baseline mais estável com menor amplitude de onda. Ainda pode acompanhar sensibilidade, sono, humor, libido e resposta ao estresse — muitas utilizadoras descobrem padrões subtis mesmo num mapa achatado.',
        },
      ],
    },
    {
      title: 'Dados, privacidade e controlo',
      intro: 'A sua biologia é pessoal. A Luna29 prioriza arquitetura local-first sempre que possível.',
      items: [
        {
          q: 'Que dados a Luna29 processa?',
          a: 'Dados que introduz ou gera: check-ins, notas de ciclo, reflexões de voz, importações opcionais de análises, contexto de perfil e registos técnicos necessários para autenticação e estabilidade. A Luna29 não recolhe silenciosamente dados do dispositivo alheios para publicidade.',
        },
        {
          q: 'Onde ficam armazenados os meus dados de saúde?',
          a: 'Registos principais de wellness foram concebidos para permanecer no seu dispositivo (armazenamento local). Credenciais de conta, fluxos de segurança e certas funcionalidades cloud podem usar infraestrutura backend protegida — sempre divulgada em Privacy Notice.',
        },
        {
          q: 'A Luna29 vende dados pessoais?',
          a: 'Não. O modelo de negócio é acesso por subscrição a ferramentas — não corretagem de dados. Não vendemos perfis comportamentais ou fisiológicos a anunciantes ou mercados de dados de terceiros.',
        },
        {
          q: 'Como funcionam as exportações?',
          a: 'Inicia exportações manualmente. Health Reports e exportações JSON geram ficheiros sob o seu controlo. Partilhe apenas o que escolher — com clínico, parceiro ou para arquivo pessoal.',
        },
        {
          q: 'O que acontece se limpar o armazenamento do navegador?',
          a: 'O histórico local pode ser eliminado. Recomendamos exportações periódicas como backup pessoal. Dados de autenticação podem persistir separadamente consoante a configuração.',
        },
      ],
    },
    {
      title: 'Membresia e ferramentas',
      intro: 'Perguntas práticas sobre acesso, relatórios e uso diário dentro da Luna29.',
      items: [
        {
          q: 'O que inclui a zona de membros?',
          a: 'Mapa interativo do ritmo, check-ins estruturados, reflexões Voice Note, Health Reports, auxílios de comunicação The Bridge, Ritual Path, Reset Room e controlos de exportação/privacidade — unificados numa interface calma.',
        },
        {
          q: 'Posso enviar PDFs e scans de análises para relatórios?',
          a: 'Sim. My Health Reports aceita texto, imagens e PDF para revisão estruturada. As saídas organizam marcadores em secções prontas para consulta — ainda educativas, não diagnósticas.',
        },
        {
          q: 'Os relatórios podem seguir o idioma da interface?',
          a: 'Sim. A geração de relatórios pode seguir a sua definição de idioma Luna29 ativa, apoiando conversas de cuidados multilingues.',
        },
        {
          q: 'Onde podem parceiros aprender comunicação de apoio?',
          a: 'Consulte Partner FAQ e The Bridge. Ambos oferecem frases calmas, linguagem baseada na capacidade e contexto que reduz ciclos de culpa nas relações.',
        },
        {
          q: 'Quanto tempo devo dedicar diariamente?',
          a: 'A maioria das membros mantém valor com 60–90 segundos de check-in mais notas de voz ocasionais. A Luna29 foi desenhada para continuidade, não rastreamento compulsivo.',
        },
      ],
    },
  ],
};
