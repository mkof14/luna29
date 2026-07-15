import { Language, LangCopy, getLang } from '../constants';

export type PublicPilotNotice = {
  badge: string;
  body: string;
};

const PILOT_NOTICE_BY_LANG: LangCopy<PublicPilotNotice> = {
  en: {
    badge: 'Pilot',
    body: 'Luna29 is in a test pilot for now. Features and details may still change as we learn with early members.',
  },
  ru: {
    badge: 'Пилот',
    body: 'Luna29 пока в тестовом пилотном режиме. Функции и детали могут меняться, пока мы учимся вместе с ранними участницами.',
  },
  uk: {
    badge: 'Пілот',
    body: 'Luna29 поки в тестовому пілотному режимі. Функції та деталі можуть змінюватися, поки ми вчимося разом із ранніми учасницями.',
  },
  es: {
    badge: 'Piloto',
    body: 'Luna29 está por ahora en modo piloto de prueba. Funciones y detalles pueden cambiar mientras aprendemos con las primeras socias.',
  },
  fr: {
    badge: 'Pilote',
    body: 'Luna29 est pour l’instant en mode pilote de test. Fonctions et détails peuvent encore évoluer pendant que nous apprenons avec les premières membres.',
  },
  de: {
    badge: 'Pilot',
    body: 'Luna29 befindet sich vorerst im Test-Pilotmodus. Funktionen und Details können sich noch ändern, während wir mit frühen Mitgliedern lernen.',
  },
  zh: {
    badge: '试点',
    body: 'Luna29 目前处于测试试点模式。功能和细节可能随早期成员反馈继续调整。',
  },
  ja: {
    badge: 'パイロット',
    body: 'Luna29 は現在テストパイロットモードです。初期メンバーと学びながら、機能や詳細は変わることがあります。',
  },
  pt: {
    badge: 'Piloto',
    body: 'A Luna29 está por enquanto em modo piloto de teste. Funções e detalhes podem mudar enquanto aprendemos com as primeiras membros.',
  },
  ar: {
    badge: 'تجريبي',
    body: 'Luna29 حاليًا في وضع تجريبي اختباري. قد تتغيّر الميزات والتفاصيل بينما نتعلّم مع العضوات الأوائل.',
  },
  he: {
    badge: 'פיילוט',
    body: 'Luna29 נמצאת כרגע במצב פיילוט ניסיוני. תכונות ופרטים עשויים להשתנות בזמן שאנחנו לומדות עם חברות מוקדמות.',
  },
};

export const getPublicPilotNotice = (lang: Language): PublicPilotNotice =>
  getLang(PILOT_NOTICE_BY_LANG, lang) || PILOT_NOTICE_BY_LANG.en;
