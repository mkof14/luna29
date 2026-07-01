import { LangCopy } from '../../constants';
import { LegalDocContent } from './types';
import { LEGAL_ENTITY_NAME, LEGAL_PRIVACY_EMAIL, LEGAL_WEBSITE } from './entity';

export const LEGAL_HUB: LangCopy<LegalDocContent> = {
  en: {
    title: 'Legal',
    subtitle: `${LEGAL_ENTITY_NAME} publishes the policies below for the Luna29 wellness application and related services.`,
    sections: [
      {
        heading: 'Overview',
        body: 'This legal center brings together the principal policies governing your use of Luna29, our wellness and cycle-awareness application, public website, and optional member services. These documents describe how we operate the service, handle personal information, set expectations for responsible use, and explain the wellness scope of our tools. English is the controlling language for legal interpretation unless applicable law requires otherwise.',
      },
      {
        heading: 'Privacy',
        body: 'Our Privacy Notice explains how Luna29 collects, stores, uses, shares, and protects personal information. It covers account and billing metadata, voluntary wellness inputs, local-first storage design, optional AI features, service providers, retention, security, and children\'s privacy. For the full policy, open the Privacy Notice document in this legal center.',
      },
      {
        heading: 'Terms of Use',
        body: 'Our Terms of Use govern access to Luna29, eligibility, acceptable use, subscriptions processed through Stripe, intellectual property, disclaimers, limitation of liability, termination, and dispute resolution. By using Luna29 you agree to these terms and our Privacy Notice. For complete service terms, open the Terms of Use document.',
      },
      {
        heading: 'Wellness Notice',
        body: 'Luna29 is a wellness application—not a medical service, medical device, diagnostic instrument, or treatment provider. It has not been evaluated or cleared by the U.S. FDA or any regulatory authority as a medical product. Our Wellness Notice describes scope limitations, the informational nature of insights and AI outputs, and when to seek professional care. Luna29 must not be used for emergency or urgent medical decisions.',
      },
      {
        heading: 'Cookies',
        body: 'Our Cookies and Tracking Notice describes how we use browser storage, cookies, session storage, analytics, and similar technologies on our website and web app. Luna29 does not sell personal information or use cookies for cross-context behavioral advertising. You may manage storage through browser settings or in-app privacy controls. See the Cookies notice for details.',
      },
      {
        heading: 'Your Data',
        body: 'Our Your Data notice describes consumer privacy rights that may apply to you, including access, deletion, and correction requests. Luna29 uses a local-first architecture: core wellness records remain on your device unless you enable optional server-linked features. You can export or delete local data through in-app controls; verified requests may be submitted as described in the Your Data notice, including rights aligned with CCPA/CPRA where applicable.',
      },
      {
        heading: 'Contact',
        body: `For privacy, data-rights, or legal inquiries, contact ${LEGAL_ENTITY_NAME} at ${LEGAL_PRIVACY_EMAIL}. Website: ${LEGAL_WEBSITE}. We respond to verified privacy and data-rights requests within timeframes required by applicable law.`,
      },
    ],
  },
  ru: {
    title: 'Юридическая информация',
    subtitle: `${LEGAL_ENTITY_NAME} публикует приведённые ниже политики для wellness-приложения Luna29 и связанных сервисов.`,
    sections: [
      {
        heading: 'Обзор',
        body: 'Этот юридический центр объединяет основные политики, регулирующие использование Luna29 — приложения для wellness и осознанности цикла, публичного сайта и опциональных сервисов для участников. Документы описывают работу сервиса, обработку персональных данных, правила ответственного использования и wellness-область наших инструментов. Английская версия является приоритетной для юридической трактовки, если иное не требуется применимым правом.',
      },
      {
        heading: 'Конфиденциальность',
        body: 'Уведомление о конфиденциальности объясняет, как Luna29 собирает, хранит, использует, передаёт и защищает персональные данные. Оно охватывает метаданные аккаунта и биллинга, добровольные wellness-данные, local-first архитектуру, опциональные AI-функции, провайдеров, хранение, безопасность и конфиденциальность детей. Полный текст — в документе «Уведомление о конфиденциальности».',
      },
      {
        heading: 'Условия использования',
        body: 'Условия использования регулируют доступ к Luna29, право на использование, допустимое поведение, подписки через Stripe, интеллектуальную собственность, отказ от гарантий, ограничение ответственности, прекращение доступа и разрешение споров. Используя Luna29, вы соглашаетесь с этими условиями и Уведомлением о конфиденциальности. Полный текст — в документе «Условия использования».',
      },
      {
        heading: 'Уведомление о wellness',
        body: 'Luna29 — wellness-приложение, а не медицинский сервис, медицинское устройство, диагностический инструмент или поставщик лечения. Оно не оценивалось и не одобрено FDA США или иным регулятором как медицинский продукт. Уведомление о wellness описывает ограничения области применения, информационный характер инсайтов и AI-выводов, а также необходимость обращения к специалистам. Luna29 нельзя использовать для экстренных или срочных медицинских решений.',
      },
      {
        heading: 'Cookies',
        body: 'Уведомление о cookies и отслеживании описывает использование хранилища браузера, cookies, session storage, аналитики и аналогичных технологий на сайте и в веб-приложении. Luna29 не продаёт персональные данные и не использует cookies для поведенческой рекламы между контекстами. Управление хранилищем — через настройки браузера или элементы конфиденциальности в приложении. Подробности — в уведомлении о cookies.',
      },
      {
        heading: 'Ваши данные',
        body: 'Документ «Ваши данные» описывает права потребителей на конфиденциальность, которые могут к вам применяться, включая запросы на доступ, удаление и исправление. Luna29 использует local-first архитектуру: основные wellness-записи остаются на устройстве, если вы не включаете опциональные серверные функции. Экспорт и удаление локальных данных доступны в приложении; верифицированные запросы подаются согласно документу «Ваши данные», включая права в духе CCPA/CPRA, где применимо.',
      },
      {
        heading: 'Контакты',
        body: `По вопросам конфиденциальности, прав на данные или юридическим запросам обращайтесь в ${LEGAL_ENTITY_NAME}: ${LEGAL_PRIVACY_EMAIL}. Сайт: ${LEGAL_WEBSITE}. На верифицированные запросы отвечаем в сроки, установленные применимым правом.`,
      },
    ],
  },
  uk: {
    title: 'Юридична інформація',
    subtitle: `${LEGAL_ENTITY_NAME} публікує наведені нижче політики для wellness-додатку Luna29 та повʼязаних сервісів.`,
    sections: [
      {
        heading: 'Огляд',
        body: 'Цей юридичний центр обʼєднує основні політики, що регулюють використання Luna29 — додатку для wellness і усвідомленості циклу, публічного сайту та опціональних сервісів для учасниць. Документи описують роботу сервісу, обробку персональних даних, правила відповідального використання та wellness-сферу наших інструментів. Англійська версія є пріоритетною для юридичної трактовки, якщо інше не вимагає застосовне право.',
      },
      {
        heading: 'Конфіденційність',
        body: 'Повідомлення про конфіденційність пояснює, як Luna29 збирає, зберігає, використовує, передає та захищає персональні дані. Воно охоплює метадані акаунта та білінгу, добровільні wellness-дані, local-first архітектуру, опціональні AI-функції, провайдерів, зберігання, безпеку та конфіденційність дітей. Повний текст — у документі «Повідомлення про конфіденційність».',
      },
      {
        heading: 'Умови використання',
        body: 'Умови використання регулюють доступ до Luna29, право на використання, допустиму поведінку, підписки через Stripe, інтелектуальну власність, відмову від гарантій, обмеження відповідальності, припинення доступу та вирішення спорів. Використовуючи Luna29, ви погоджуєтеся з цими умовами та Повідомленням про конфіденційність. Повний текст — у документі «Умови використання».',
      },
      {
        heading: 'Повідомлення про wellness',
        body: 'Luna29 — wellness-додаток, а не медичний сервіс, медичний виріб, діагностичний інструмент або постачальник лікування. Він не оцінювався і не схвалений FDA США чи іншим регулятором як медичний продукт. Повідомлення про wellness описує обмеження сфери застосування, інформаційний характер інсайтів і AI-висновків, а також необхідність звернення до фахівців. Luna29 не слід використовувати для екстрених або невідкладних медичних рішень.',
      },
      {
        heading: 'Cookies',
        body: 'Повідомлення про cookies та відстеження описує використання сховища браузера, cookies, session storage, аналітики та подібних технологій на сайті та у веб-додатку. Luna29 не продає персональні дані і не використовує cookies для поведінкової реклами між контекстами. Керування сховищем — через налаштування браузера або елементи конфіденційності в додатку. Деталі — у повідомленні про cookies.',
      },
      {
        heading: 'Ваші дані',
        body: 'Документ «Ваші дані» описує права споживачів на конфіденційність, які можуть до вас застосовуватися, включно із запитами на доступ, видалення та виправлення. Luna29 використовує local-first архітектуру: основні wellness-записи залишаються на пристрої, якщо ви не вмикаєте опціональні серверні функції. Експорт і видалення локальних даних доступні в додатку; верифіковані запити подаються згідно з документом «Ваші дані», включно з правами в дусі CCPA/CPRA, де це застосовно.',
      },
      {
        heading: 'Контакти',
        body: `З питань конфіденційності, прав на дані або юридичних запитів звертайтеся до ${LEGAL_ENTITY_NAME}: ${LEGAL_PRIVACY_EMAIL}. Сайт: ${LEGAL_WEBSITE}. На верифіковані запити відповідаємо у строки, передбачені застосовним правом.`,
      },
    ],
  },
  es: {
    title: 'Información legal',
    subtitle: `${LEGAL_ENTITY_NAME} publica las políticas siguientes para la aplicación de bienestar Luna29 y servicios relacionados.`,
    sections: [
      {
        heading: 'Resumen',
        body: 'Este centro legal reúne las políticas principales que rigen su uso de Luna29, nuestra aplicación de bienestar y conciencia del ciclo, sitio público y servicios opcionales para miembros. Estos documentos describen cómo operamos el servicio, tratamos la información personal, establecemos expectativas de uso responsable y explican el alcance de bienestar de nuestras herramientas. El inglés es el idioma de referencia para interpretación legal salvo que la ley aplicable exija lo contrario.',
      },
      {
        heading: 'Privacidad',
        body: 'Nuestro Aviso de privacidad explica cómo Luna29 recopila, almacena, usa, comparte y protege la información personal. Cubre metadatos de cuenta y facturación, entradas voluntarias de bienestar, diseño local-first, funciones opcionales de IA, proveedores, conservación, seguridad y privacidad de menores. Consulte el documento Aviso de privacidad para el texto completo.',
      },
      {
        heading: 'Términos de uso',
        body: 'Nuestros Términos de uso rigen el acceso a Luna29, elegibilidad, uso aceptable, suscripciones procesadas por Stripe, propiedad intelectual, descargos de responsabilidad, limitación de responsabilidad, terminación y resolución de disputas. Al usar Luna29 acepta estos términos y nuestro Aviso de privacidad. Consulte el documento Términos de uso para el texto completo.',
      },
      {
        heading: 'Aviso de bienestar',
        body: 'Luna29 es una aplicación de bienestar—no un servicio médico, dispositivo médico, instrumento diagnóstico ni proveedor de tratamiento. No ha sido evaluada ni autorizada por la FDA de EE. UU. u otra autoridad reguladora como producto médico. Nuestro Aviso de bienestar describe limitaciones de alcance, la naturaleza informativa de insights y salidas de IA, y cuándo buscar atención profesional. Luna29 no debe usarse para decisiones médicas de emergencia o urgentes.',
      },
      {
        heading: 'Cookies',
        body: 'Nuestro Aviso de cookies y seguimiento describe cómo usamos almacenamiento del navegador, cookies, almacenamiento de sesión, analítica y tecnologías similares en nuestro sitio y aplicación web. Luna29 no vende información personal ni usa cookies para publicidad conductual entre contextos. Puede gestionar el almacenamiento mediante la configuración del navegador o controles de privacidad en la aplicación. Consulte el aviso de Cookies para más detalles.',
      },
      {
        heading: 'Sus datos',
        body: 'Nuestro aviso Sus datos describe derechos de privacidad del consumidor que pueden aplicarle, incluidas solicitudes de acceso, eliminación y corrección. Luna29 usa arquitectura local-first: los registros principales de bienestar permanecen en su dispositivo salvo que habilite funciones opcionales vinculadas al servidor. Puede exportar o eliminar datos locales mediante controles en la aplicación; las solicitudes verificadas se envían según el aviso Sus datos, incluidos derechos alineados con CCPA/CPRA cuando corresponda.',
      },
      {
        heading: 'Contacto',
        body: `Para consultas de privacidad, derechos de datos o asuntos legales, contacte a ${LEGAL_ENTITY_NAME} en ${LEGAL_PRIVACY_EMAIL}. Sitio web: ${LEGAL_WEBSITE}. Respondemos solicitudes verificadas de privacidad y derechos de datos en los plazos exigidos por la ley aplicable.`,
      },
    ],
  },
  fr: {
    title: 'Informations juridiques',
    subtitle: `${LEGAL_ENTITY_NAME} publie les politiques ci-dessous pour l'application bien-être Luna29 et les services associés.`,
    sections: [
      {
        heading: 'Aperçu',
        body: 'Ce centre juridique regroupe les principales politiques régissant votre utilisation de Luna29, notre application de bien-être et de conscience du cycle, site public et services membres optionnels. Ces documents décrivent notre fonctionnement, le traitement des données personnelles, les attentes d\'usage responsable et la portée bien-être de nos outils. L\'anglais est la langue de référence pour l\'interprétation juridique sauf exigence contraire de la loi applicable.',
      },
      {
        heading: 'Confidentialité',
        body: 'Notre Notice de confidentialité explique comment Luna29 collecte, stocke, utilise, partage et protège les informations personnelles. Elle couvre les métadonnées de compte et de facturation, les entrées bien-être volontaires, l\'architecture local-first, les fonctions IA optionnelles, les prestataires, la conservation, la sécurité et la vie privée des enfants. Consultez le document Notice de confidentialité pour le texte intégral.',
      },
      {
        heading: 'Conditions d\'utilisation',
        body: 'Nos Conditions d\'utilisation régissent l\'accès à Luna29, l\'éligibilité, l\'usage acceptable, les abonnements traités par Stripe, la propriété intellectuelle, les clauses de non-responsabilité, la limitation de responsabilité, la résiliation et le règlement des litiges. En utilisant Luna29, vous acceptez ces conditions et notre Notice de confidentialité. Consultez le document Conditions d\'utilisation pour le texte intégral.',
      },
      {
        heading: 'Avis bien-être',
        body: 'Luna29 est une application bien-être—pas un service médical, dispositif médical, instrument diagnostique ou prestataire de traitement. Elle n\'a pas été évaluée ni autorisée par la FDA U.S. ou toute autorité réglementaire comme produit médical. Notre Avis bien-être décrit les limites de portée, la nature informative des insights et sorties IA, et quand consulter un professionnel. Luna29 ne doit pas être utilisée pour des décisions médicales d\'urgence ou urgentes.',
      },
      {
        heading: 'Cookies',
        body: 'Notre Notice cookies et suivi décrit l\'utilisation du stockage navigateur, cookies, stockage de session, analytique et technologies similaires sur notre site et application web. Luna29 ne vend pas d\'informations personnelles et n\'utilise pas de cookies pour la publicité comportementale intercontextes. Vous pouvez gérer le stockage via les paramètres du navigateur ou les contrôles de confidentialité intégrés. Voir la notice Cookies pour les détails.',
      },
      {
        heading: 'Vos données',
        body: 'Notre notice Vos données décrit les droits de confidentialité des consommateurs qui peuvent s\'appliquer, y compris les demandes d\'accès, de suppression et de rectification. Luna29 utilise une architecture local-first : les enregistrements bien-être principaux restent sur votre appareil sauf activation de fonctions optionnelles liées au serveur. Vous pouvez exporter ou supprimer les données locales via les contrôles intégrés ; les demandes vérifiées se soumettent selon la notice Vos données, y compris des droits alignés sur CCPA/CPRA le cas échéant.',
      },
      {
        heading: 'Contact',
        body: `Pour les questions de confidentialité, droits relatifs aux données ou demandes juridiques, contactez ${LEGAL_ENTITY_NAME} à ${LEGAL_PRIVACY_EMAIL}. Site : ${LEGAL_WEBSITE}. Nous répondons aux demandes vérifiées dans les délais requis par la loi applicable.`,
      },
    ],
  },
  de: {
    title: 'Rechtliche Informationen',
    subtitle: `${LEGAL_ENTITY_NAME} veröffentlicht die nachstehenden Richtlinien für die Wellness-App Luna29 und zugehörige Dienste.`,
    sections: [
      {
        heading: 'Überblick',
        body: 'Dieses Rechtszentrum fasst die wesentlichen Richtlinien zusammen, die Ihre Nutzung von Luna29, unserer Wellness- und Zyklus-Bewusstseins-App, öffentlichen Website und optionalen Mitgliederdiensten regeln. Diese Dokumente beschreiben unseren Betrieb, den Umgang mit personenbezogenen Daten, Erwartungen an verantwortungsvolle Nutzung und den Wellness-Umfang unserer Tools. Englisch ist die maßgebliche Sprache für die rechtliche Auslegung, sofern geltendes Recht nichts anderes verlangt.',
      },
      {
        heading: 'Datenschutz',
        body: 'Unser Datenschutzhinweis erläutert, wie Luna29 personenbezogene Daten erhebt, speichert, nutzt, weitergibt und schützt. Er umfasst Konto- und Abrechnungsmetadaten, freiwillige Wellness-Eingaben, Local-First-Architektur, optionale KI-Funktionen, Dienstleister, Aufbewahrung, Sicherheit und Kinderschutz. Den vollständigen Text finden Sie im Dokument Datenschutzhinweis.',
      },
      {
        heading: 'Nutzungsbedingungen',
        body: 'Unsere Nutzungsbedingungen regeln den Zugang zu Luna29, Berechtigung, zulässige Nutzung, über Stripe abgewickelte Abonnements, geistiges Eigentum, Haftungsausschlüsse, Haftungsbeschränkung, Kündigung und Streitbeilegung. Mit der Nutzung von Luna29 stimmen Sie diesen Bedingungen und unserem Datenschutzhinweis zu. Den vollständigen Text finden Sie im Dokument Nutzungsbedingungen.',
      },
      {
        heading: 'Wellness-Hinweis',
        body: 'Luna29 ist eine Wellness-App—kein medizinischer Dienst, Medizinprodukt, Diagnoseinstrument oder Behandlungsanbieter. Sie wurde nicht von der U.S.-FDA oder einer Behörde als Medizinprodukt bewertet oder zugelassen. Unser Wellness-Hinweis beschreibt Anwendungsgrenzen, den informativen Charakter von Einblicken und KI-Ausgaben sowie wann professionelle Versorgung gesucht werden sollte. Luna29 darf nicht für Notfall- oder dringende medizinische Entscheidungen verwendet werden.',
      },
      {
        heading: 'Cookies',
        body: 'Unser Hinweis zu Cookies und Tracking beschreibt die Nutzung von Browser-Speicher, Cookies, Session Storage, Analytik und ähnlichen Technologien auf Website und Web-App. Luna29 verkauft keine personenbezogenen Daten und setzt Cookies nicht für kontextübergreifende Verhaltenswerbung ein. Speicher können Sie über Browser-Einstellungen oder In-App-Datenschutzkontrollen verwalten. Details im Cookie-Hinweis.',
      },
      {
        heading: 'Ihre Daten',
        body: 'Unser Hinweis Ihre Daten beschreibt Verbraucher-Datenschutzrechte, die für Sie gelten können, einschließlich Auskunfts-, Lösch- und Berichtigungsanfragen. Luna29 nutzt Local-First-Architektur: Kern-Wellness-Daten verbleiben auf Ihrem Gerät, sofern Sie keine optionalen servergebundenen Funktionen aktivieren. Lokale Daten können Sie über In-App-Steuerungen exportieren oder löschen; verifizierte Anfragen richten Sie gemäß dem Hinweis Ihre Daten ein, einschließlich Rechten im Sinne von CCPA/CPRA, soweit anwendbar.',
      },
      {
        heading: 'Kontakt',
        body: `Bei Fragen zu Datenschutz, Datenrechten oder rechtlichen Anliegen wenden Sie sich an ${LEGAL_ENTITY_NAME} unter ${LEGAL_PRIVACY_EMAIL}. Website: ${LEGAL_WEBSITE}. Wir beantworten verifizierte Anfragen innerhalb der gesetzlich vorgeschriebenen Fristen.`,
      },
    ],
  },
  zh: {
    title: '法律信息',
    subtitle: `${LEGAL_ENTITY_NAME} 为 Luna29 wellness 应用及相关服务发布以下政策。`,
    sections: [
      {
        heading: '概述',
        body: '本法律中心汇总规范您使用 Luna29（wellness 与周期觉察应用、公开网站及可选会员服务）的主要政策。这些文件说明我们的运营方式、个人信息处理、负责任使用预期以及工具的 wellness 适用范围。除非适用法律另有要求，英文为法律解释的权威语言。',
      },
      {
        heading: '隐私',
        body: '我们的隐私声明说明 Luna29 如何收集、存储、使用、共享和保护个人信息，涵盖账户与账单元数据、自愿 wellness 输入、本地优先架构、可选 AI 功能、服务提供商、保留、安全及儿童隐私。完整文本请参阅隐私声明文档。',
      },
      {
        heading: '使用条款',
        body: '我们的使用条款规范对 Luna29 的访问、资格、可接受使用、通过 Stripe 处理的订阅、知识产权、免责声明、责任限制、终止及争议解决。使用 Luna29 即表示您同意这些条款及我们的隐私声明。完整文本请参阅使用条款文档。',
      },
      {
        heading: 'Wellness 须知',
        body: 'Luna29 是 wellness 应用——不是医疗服务、医疗器械、诊断工具或治疗提供者，未经美国 FDA 或任何监管机构评估或批准为医疗产品。Wellness 须知说明适用范围限制、洞察与 AI 输出的信息性质，以及何时应寻求专业护理。Luna29 不得用于紧急或 urgent 医疗决策。',
      },
      {
        heading: 'Cookie',
        body: '我们的 Cookie 与跟踪声明说明如何在网站及 Web 应用中使用浏览器存储、Cookie、session storage、分析及类似技术。Luna29 不出售个人信息，也不将 Cookie 用于跨情境行为广告。您可通过浏览器设置或应用内隐私控件管理存储。详情见 Cookie 声明。',
      },
      {
        heading: '您的数据',
        body: '我们的「您的数据」说明描述可能适用于您的消费者隐私权利，包括访问、删除与更正请求。Luna29 采用 local-first 架构：除非您启用可选服务器关联功能，核心 wellness 记录保留在设备本地。您可通过应用内控件导出或删除本地数据；经核实的请求按「您的数据」说明提交，包括在适用情况下与 CCPA/CPRA 一致的权利。',
      },
      {
        heading: '联系方式',
        body: `有关隐私、数据权利或法律事宜，请联系 ${LEGAL_ENTITY_NAME}：${LEGAL_PRIVACY_EMAIL}。网站：${LEGAL_WEBSITE}。我们将在适用法律要求的期限内回复经核实的隐私与数据权利请求。`,
      },
    ],
  },
  ja: {
    title: '法的情報',
    subtitle: `${LEGAL_ENTITY_NAME} は Luna29 ウェルネスアプリおよび関連サービス向けに以下のポリシーを公開しています。`,
    sections: [
      {
        heading: '概要',
        body: '本リーガルセンターは、Luna29（ウェルネスおよびサイクル認識アプリ、公開サイト、任意のメンバーサービス）の利用を規定する主要ポリシーをまとめたものです。これらの文書は、サービスの運営、個人情報の取扱い、責任ある利用の期待、ツールのウェルネス範囲を説明します。適用法が別段要求しない限り、法的解釈の基準言語は英語です。',
      },
      {
        heading: 'プライバシー',
        body: 'プライバシー通知は、Luna29 が個人情報を収集・保存・利用・共有・保護する方法を説明します。アカウントおよび請求メタデータ、任意のウェルネス入力、ローカルファースト設計、任意の AI 機能、サービス提供者、保存、セキュリティ、児童のプライバシーを含みます。全文はプライバシー通知ドキュメントをご覧ください。',
      },
      {
        heading: '利用規約',
        body: '利用規約は、Luna29 へのアクセス、資格、許容される利用、Stripe 経由のサブスクリプション、知的財産、免責、責任制限、解約、紛争解決を規定します。Luna29 を利用することで、本規約およびプライバシー通知に同意したものとみなされます。全文は利用規約ドキュメントをご覧ください。',
      },
      {
        heading: 'ウェルネス通知',
        body: 'Luna29 はウェルネスアプリであり、医療サービス、医療機器、診断機器、治療提供者ではありません。米国 FDA または規制当局による医療製品としての評価・承認を受けていません。ウェルネス通知は適用範囲の制限、インサイトおよび AI 出力の情報提供的性格、専門的ケアを受けるべき場合を説明します。緊急または至急の医療判断に Luna29 を使用しないでください。',
      },
      {
        heading: 'Cookie',
        body: 'Cookie およびトラッキング通知は、ウェブサイトおよび Web アプリにおけるブラウザストレージ、Cookie、session storage、分析および類似技術の使用を説明します。Luna29 は個人情報を販売せず、クロスコンテキスト行動広告に Cookie を使用しません。ブラウザ設定またはアプリ内プライバシーコントロールでストレージを管理できます。詳細は Cookie 通知を参照してください。',
      },
      {
        heading: 'お客様のデータ',
        body: '「お客様のデータ」通知は、アクセス、削除、訂正請求など、適用され得る消費者プライバシー権を説明します。Luna29 は local-first アーキテクチャを採用しており、任意のサーバー連携機能を有効にしない限り、コアのウェルネス記録は端末に残ります。アプリ内コントロールでローカルデータをエクスポートまたは削除できます。確認済みの請求は「お客様のデータ」通知に従い提出し、該当する場合は CCPA/CPRA に沿った権利を含みます。',
      },
      {
        heading: 'お問い合わせ',
        body: `プライバシー、データ権利、または法的事項については、${LEGAL_ENTITY_NAME}（${LEGAL_PRIVACY_EMAIL}）までご連絡ください。ウェブサイト：${LEGAL_WEBSITE}。確認済みのプライバシーおよびデータ権利請求には、適用法で要求される期間内に回答します。`,
      },
    ],
  },
  pt: {
    title: 'Informações legais',
    subtitle: `${LEGAL_ENTITY_NAME} publica as políticas abaixo para o aplicativo de bem-estar Luna29 e serviços relacionados.`,
    sections: [
      {
        heading: 'Visão geral',
        body: 'Este centro jurídico reúne as principais políticas que regem seu uso da Luna29, nosso aplicativo de bem-estar e consciência do ciclo, site público e serviços opcionais para membros. Estes documentos descrevem como operamos o serviço, tratamos informações pessoais, estabelecemos expectativas de uso responsável e explicam o escopo de bem-estar de nossas ferramentas. O inglês é o idioma de referência para interpretação legal, salvo exigência em contrário da lei aplicável.',
      },
      {
        heading: 'Privacidade',
        body: 'Nosso Aviso de privacidade explica como a Luna29 coleta, armazena, usa, compartilha e protege informações pessoais. Abrange metadados de conta e cobrança, entradas voluntárias de bem-estar, arquitetura local-first, recursos opcionais de IA, prestadores, retenção, segurança e privacidade de crianças. Consulte o documento Aviso de privacidade para o texto completo.',
      },
      {
        heading: 'Termos de uso',
        body: 'Nossos Termos de uso regem o acesso à Luna29, elegibilidade, uso aceitável, assinaturas processadas pela Stripe, propriedade intelectual, isenções, limitação de responsabilidade, rescisão e resolução de disputas. Ao usar a Luna29, você concorda com estes termos e nosso Aviso de privacidade. Consulte o documento Termos de uso para o texto completo.',
      },
      {
        heading: 'Aviso de bem-estar',
        body: 'A Luna29 é um aplicativo de bem-estar—não um serviço médico, dispositivo médico, instrumento diagnóstico ou provedor de tratamento. Não foi avaliada nem aprovada pela FDA dos EUA ou outra autoridade reguladora como produto médico. Nosso Aviso de bem-estar descreve limitações de escopo, a natureza informativa de insights e saídas de IA, e quando buscar cuidado profissional. A Luna29 não deve ser usada para decisões médicas de emergência ou urgentes.',
      },
      {
        heading: 'Cookies',
        body: 'Nosso Aviso de cookies e rastreamento descreve como usamos armazenamento do navegador, cookies, armazenamento de sessão, análise e tecnologias similares em nosso site e aplicativo web. A Luna29 não vende informações pessoais nem usa cookies para publicidade comportamental entre contextos. Você pode gerenciar o armazenamento pelas configurações do navegador ou controles de privacidade no app. Veja o aviso de Cookies para detalhes.',
      },
      {
        heading: 'Seus dados',
        body: 'Nosso aviso Seus dados descreve direitos de privacidade do consumidor que podem se aplicar a você, incluindo solicitações de acesso, exclusão e correção. A Luna29 usa arquitetura local-first: registros principais de bem-estar permanecem no seu dispositivo salvo uso de recursos opcionais vinculados ao servidor. Você pode exportar ou excluir dados locais pelos controles no app; solicitações verificadas são enviadas conforme o aviso Seus dados, incluindo direitos alinhados ao CCPA/CPRA quando aplicável.',
      },
      {
        heading: 'Contato',
        body: `Para questões de privacidade, direitos de dados ou assuntos jurídicos, contacte ${LEGAL_ENTITY_NAME} em ${LEGAL_PRIVACY_EMAIL}. Site: ${LEGAL_WEBSITE}. Respondemos solicitações verificadas de privacidade e direitos de dados nos prazos exigidos pela lei aplicável.`,
      },
    ],
  },
  ar: {
    title: 'المعلومات القانونية',
    subtitle: `${LEGAL_ENTITY_NAME} تنشر السياسات التالية لتطبيق العافية Luna29 والخدمات ذات الصلة.`,
    sections: [
      {
        heading: 'نظرة عامة',
        body: 'يجمع هذا المركز القانوني السياسات الرئيسية التي تحكم استخدامكم لـ Luna29 — تطبيق العافية ووعي الدورة، والموقع العام، والخدمات الاختيارية للأعضاء. تصف هذه المستندات كيفية تشغيل الخدمة، ومعالجة المعلومات الشخصية، وتوقعات الاستخدام المسؤول، ونطاق العافية لأدواتنا. الإنجليزية هي اللغة المرجعية للتفسير القانوني ما لم يقتضِ القانون المعمول به خلاف ذلك.',
      },
      {
        heading: 'الخصوصية',
        body: 'يشرح إشعار الخصوصية كيف تجمع Luna29 المعلومات الشخصية وتخزّنها وتستخدمها وتشاركها وتحميها. يغطي بيانات الحساب والفوترة، ومدخلات العافية الطوعية، وتصميم local-first، وميزات الذكاء الاصطناعي الاختيارية، ومقدّمي الخدمات، والاحتفاظ، والأمن، وخصوصية الأطفال. للنص الكامل، راجع مستند إشعار الخصوصية.',
      },
      {
        heading: 'شروط الاستخدام',
        body: 'تحكم شروط الاستخدام الوصول إلى Luna29، والأهلية، والاستخدام المقبول، والاشتراكات المعالجة عبر Stripe، والملكية الفكرية، وإخلاء المسؤولية، وتحديد المسؤولية، وإنهاء الخدمة، وتسوية النزاعات. باستخدام Luna29، فإنكم توافقون على هذه الشروط وإشعار الخصوصية. للنص الكامل، راجع مستند شروط الاستخدام.',
      },
      {
        heading: 'إشعار العافية',
        body: 'Luna29 تطبيق عافية—وليست خدمة طبية ولا جهازاً طبياً ولا أداة تشخيص ولا مقدّم علاج. لم تُقيَّم ولم تُعتمد من FDA الأمريكية أو أي جهة تنظيمية كمنتج طبي. يصف إشعار العافية قيود النطاق، والطابع المعلوماتي للرؤى ومخرجات الذكاء الاصطناعي، ومتى يجب طلب رعاية مهنية. لا يجب استخدام Luna29 لقرارات طبية طارئة أو عاجلة.',
      },
      {
        heading: 'ملفات تعريف الارتباط',
        body: 'يشرح إشعار ملفات تعريف الارتباط والتتبع كيف نستخدم تخزين المتصفح وملفات تعريف الارتباط وتخزين الجلسة والتحليلات والتقنيات المماثلة على موقعنا وتطبيق الويب. لا تبيع Luna29 المعلومات الشخصية ولا تستخدم ملفات تعريف الارتباط للإعلان السلوكي عبر السياقات. يمكنكم إدارة التخزين عبر إعدادات المتصفح أو عناصر التحكم في التطبيق. راجع إشعار ملفات تعريف الارتباط للتفاصيل.',
      },
      {
        heading: 'بياناتك',
        body: 'يصف إشعار «بياناتك» حقوق خصوصية المستهلك التي قد تنطبق عليكم، بما في ذلك طلبات الوصول والحذف والتصحيح. تستخدم Luna29 بنية local-first: تبقى سجلات العافية الأساسية على جهازكم ما لم تفعّلوا ميزات اختيارية مرتبطة بالخادم. يمكنكم تصدير أو حذف البيانات المحلية عبر عناصر التحكم في التطبيق؛ تُقدَّم الطلبات الموثّقة وفق إشعار «بياناتك»، بما في ذلك حقوق متوافقة مع CCPA/CPRA حيث ينطبق.',
      },
      {
        heading: 'التواصل',
        body: `للاستفسارات المتعلقة بالخصوصية أو حقوق البيانات أو الأمور القانونية، تواصلوا مع ${LEGAL_ENTITY_NAME} على ${LEGAL_PRIVACY_EMAIL}. الموقع: ${LEGAL_WEBSITE}. نرد على طلبات الخصوصية وحقوق البيانات الموثّقة ضمن المهل التي يفرضها القانون المعمول به.`,
      },
    ],
  },
  he: {
    title: 'מידע משפטי',
    subtitle: `${LEGAL_ENTITY_NAME} מפרסמת את המדיניות שלהלן עבור אפליקציית ה-wellness Luna29 ושירותים קשורים.`,
    sections: [
      {
        heading: 'סקירה',
        body: 'מרכז משפטי זה מאגד את המדיניות העיקרית המסדירה את השימוש שלכם ב-Luna29 — אפליקציית wellness ומודעות מחזור, אתר ציבורי ושירותי חברות אופציונליים. מסמכים אלה מתארים כיצד אנו מפעילים את השירות, מטפלים במידע אישי, קובעים ציפיות לשימוש אחראי ומסבירים את היקף ה-wellness של הכלים שלנו. אנגלית היא שפת הייחוס לפרשנות משפטית, אלא אם דין חל דורש אחרת.',
      },
      {
        heading: 'פרטיות',
        body: 'הודעת הפרטיות שלנו מסבירה כיצד Luna29 אוספת, מאחסנת, משתמשת, משתפת ומגינה על מידע אישי. היא מכסה מטא-נתוני חשבון וחיוב, קלט wellness מרצון, ארכיטקטורת local-first, תכונות AI אופציונליות, ספקי שירות, שמירה, אבטחה ופרטיות ילדים. לטקסט המלא, פתחו את מסמך הודעת הפרטיות.',
      },
      {
        heading: 'תנאי שימוש',
        body: 'תנאי השימוש שלנו מסדירים גישה ל-Luna29, זכאות, שימוש מקובל, מנויים המעובדים דרך Stripe, קניין רוחני, הצהרות אחריות, הגבלת אחריות, סיום שירות ויישוב סכסוכים. בשימוש ב-Luna29 אתם מסכימים לתנאים אלה ולהודעת הפרטיות. לטקסט המלא, פתחו את מסמך תנאי השימוש.',
      },
      {
        heading: 'הודעת wellness',
        body: 'Luna29 היא אפליקציית wellness — לא שירות רפואי, מכשיר רפואי, כלי אבחון או ספק טיפול. היא לא הוערכה או אושרה על ידי FDA האמריקאית או רגulator כמוצר רפואי. הודעת ה-wellness שלנו מתארת מגבלות היקף, את האופי המידעי של תובנות ופלטי AI, ומתי לפנות לטיפול מקצועי. אין להשתמש ב-Luna29 להחלטות רפואיות דחופות או בחירום.',
      },
      {
        heading: 'Cookies',
        body: 'הודעת ה-cookies והמעקב שלנו מתארת שימוש באחסון דפדפן, cookies, session storage, אנליטיקה וטכנולוגיות דומות באתר ובאפליקציית ה-web. Luna29 אינה מוכרת מידע אישי ואינה משתמשת ב-cookies לפרסום התנהגותי חוצה-הקשרים. ניתן לנהל אחסון בהגדרות הדפדפן או בבקרות הפרטיות באפליקציה. לפרטים, ראו את הודעת ה-cookies.',
      },
      {
        heading: 'הנתונים שלכם',
        body: 'הודעת «הנתונים שלכם» שלנו מתארת זכויות פרטיות צרכן שעשויות לחול עליכם, כולל בקשות גישה, מחיקה ותיקון. Luna29 משתמשת בארכיטקטורת local-first: רשומות wellness מרכזיות נשארות במכשיר אלא אם מפעילים תכונות אופציונליות מקושרות לשרת. ניתן לייצא או למחוק נתונים מקומיים דרך בקרות באפליקציה; בקשות מאומתות מוגשות לפי הודעת «הנתונים שלכם», כולל זכויות בהתאם ל-CCPA/CPRA במידת החלות.',
      },
      {
        heading: 'יצירת קשר',
        body: `לשאלות פרטיות, זכויות נתונים או עניינים משפטיים, פנו ל-${LEGAL_ENTITY_NAME} ב-${LEGAL_PRIVACY_EMAIL}. אתר: ${LEGAL_WEBSITE}. אנו מגיבים לבקשות פרטיות וזכויות נתונים מאומתות בתוך המועדים הנדרשים על פי דין.`,
      },
    ],
  },
};
