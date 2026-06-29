import React from 'react';
import { Language, LangCopy, getLang } from '../../constants';
import { PUBLIC_BTN_PRIMARY, PUBLIC_BTN_PRIMARY_GLOW, PUBLIC_BTN_SECONDARY } from './publicButtonStyles';

interface PublicBridgeSectionProps {
  onSignIn: () => void;
  lang: Language;
}

export const PublicBridgeSection: React.FC<PublicBridgeSectionProps> = ({
  onSignIn,
  lang,
}) => {
  const bridgePublicByLang: LangCopy< { eyebrow: string; title: string; problemTitle: string; problemBody: string; helpsTitle: string; helps: [string, string, string]; unique: string; memberLinkTitle: string; memberLinkBody: string }> = {
    en: { eyebrow: 'THE BRIDGE', title: 'Say Your State Clearly', problemTitle: 'Problem', problemBody: 'Sometimes it is hard to explain your state to a partner or even to yourself.', helpsTitle: 'Bridge helps', helps: ['formulate your state', 'explain it calmly', 'preserve respect in conversation'], unique: 'This is one of Luna29’s unique functions.', memberLinkTitle: 'Connected to Member Logic', memberLinkBody: 'In the member zone, The Bridge runs the guided 3-question flow and forms a calm note you can keep or share.' },
    ru: { eyebrow: 'МОСТ', title: 'Ясно выразить свое состояние', problemTitle: 'Проблема', problemBody: 'Иногда трудно объяснить партнёру или себе своё состояние.', helpsTitle: 'Мост помогает', helps: ['сформулировать состояние', 'объяснить его спокойно', 'сохранить уважение в разговоре'], unique: 'Это одна из уникальных функций Luna29.', memberLinkTitle: 'Связано с логикой зоны участника', memberLinkBody: 'В зоне участника Мост использует поток из 3 вопросов и формирует спокойное сообщение-заметку, которое можно сохранить или отправить.' },
    uk: { eyebrow: 'МІСТ', title: 'Чітко сформулювати свій стан', problemTitle: 'Проблема', problemBody: 'Іноді важко пояснити партнеру або собі свій стан.', helpsTitle: 'Міст допомагає', helps: ['сформулювати стан', 'пояснити його спокійно', 'зберегти повагу в розмові'], unique: 'Це одна з унікальних функцій Luna29.', memberLinkTitle: 'Повʼязано з логікою зони учасника', memberLinkBody: 'У зоні учасника Міст запускає сценарій із 3 питань та формує спокійне повідомлення-нотатку, яке можна зберегти або надіслати.' },
    es: { eyebrow: 'PUENTE', title: 'Expresa tu estado con claridad', problemTitle: 'Problema', problemBody: 'A veces es difícil explicar tu estado a tu pareja o incluso a ti misma.', helpsTitle: 'El puente ayuda a', helps: ['formular tu estado', 'explicarlo con calma', 'preservar el respeto en la conversación'], unique: 'Esta es una de las funciones únicas de Luna29.', memberLinkTitle: 'Conectado con la lógica de la zona de miembros', memberLinkBody: 'En la zona de miembros, el Puente ejecuta el flujo guiado de 3 preguntas y forma un mensaje de reflexión calmado para guardar o compartir.' },
    fr: { eyebrow: 'LE PONT', title: 'Exprimer votre état avec clarté', problemTitle: 'Problème', problemBody: "Parfois, il est difficile d'expliquer votre état à votre partenaire ou même à vous-même.", helpsTitle: 'Le Pont aide à', helps: ['formuler votre état', 'l’expliquer calmement', 'préserver le respect dans la conversation'], unique: 'C’est une des fonctions uniques de Luna29.', memberLinkTitle: 'Connecté à la logique de la zone membre', memberLinkBody: 'Dans la zone membre, le Pont lance le flux guidé en 3 questions et crée un message de réflexion calme à conserver ou partager.' },
    de: { eyebrow: 'DIE BRÜCKE', title: 'Den eigenen Zustand klar ausdrücken', problemTitle: 'Problem', problemBody: 'Manchmal ist es schwer, den eigenen Zustand der Partnerperson oder sich selbst zu erklären.', helpsTitle: 'Die Brücke hilft dabei', helps: ['den Zustand zu formulieren', 'ihn ruhig zu erklären', 'Respekt im Gespräch zu bewahren'], unique: 'Das ist eine der einzigartigen Funktionen von Luna29.', memberLinkTitle: 'Mit der Logik der Mitgliederzone verbunden', memberLinkBody: 'In der Mitgliederzone läuft die Brücke durch den geführten 3-Fragen-Flow und erstellt eine ruhige Reflexionsnachricht zum Behalten oder Teilen.' },
    zh: { eyebrow: '连接桥', title: '清晰表达你的状态', problemTitle: '问题', problemBody: '有时很难向伴侣，甚至向自己解释当前状态。', helpsTitle: '连接桥帮你', helps: ['组织你的状态表达', '平静地说明感受', '在对话中保留尊重'], unique: '这是 Luna29 的独特功能之一。', memberLinkTitle: '与会员区逻辑联动', memberLinkBody: '在会员区，连接桥会运行 3 个引导问题流程，并生成可保存或分享的平静反思信息。' },
    ja: { eyebrow: 'ブリッジ', title: '状態を明確に伝える', problemTitle: '課題', problemBody: 'ときに、自分の状態をパートナーや自分自身に説明するのは難しいです。', helpsTitle: 'ブリッジは次を助けます', helps: ['状態を言語化する', '落ち着いて説明する', '会話の尊重を保つ'], unique: 'これは Luna29 のユニークな機能の一つです。', memberLinkTitle: 'メンバーゾーンのロジックと接続', memberLinkBody: 'メンバーゾーンではブリッジが3つの質問フローを実行し、保存・共有できる落ち着いたリフレクション文を生成します。' },
    pt: { eyebrow: 'A PONTE', title: 'Expresse seu estado com clareza', problemTitle: 'Problema', problemBody: 'Às vezes é difícil explicar seu estado ao parceiro ou até para si mesma.', helpsTitle: 'A Ponte ajuda a', helps: ['formular seu estado', 'explicar com calma', 'preservar o respeito na conversa'], unique: 'Esta é uma das funções únicas da Luna29.', memberLinkTitle: 'Conectado à lógica da zona de membros', memberLinkBody: 'Na área de membros, a Ponte executa o fluxo guiado de 3 perguntas e forma uma mensagem de reflexão calma para manter ou compartilhar.' },
  ar: { eyebrow: 'THE BRIDGE', title: 'Say Your State Clearly', problemTitle: 'Problem', problemBody: 'Sometimes it is hard to explain your state to a partner or even to yourself.', helpsTitle: 'Bridge helps', helps: ['formulate your state', 'explain it calmly', 'preserve respect in conversation'], unique: 'This is one of Luna29’s unique functions.', memberLinkTitle: 'Connected to Member Logic', memberLinkBody: 'In the member zone, The Bridge runs the guided 3-question flow and forms a calm note you can keep or share.' },
  he: { eyebrow: 'THE BRIDGE', title: 'Say Your State Clearly', problemTitle: 'Problem', problemBody: 'Sometimes it is hard to explain your state to a partner or even to yourself.', helpsTitle: 'Bridge helps', helps: ['formulate your state', 'explain it calmly', 'preserve respect in conversation'], unique: 'This is one of Luna29’s unique functions.', memberLinkTitle: 'Connected to Member Logic', memberLinkBody: 'In the member zone, The Bridge runs the guided 3-question flow and forms a calm note you can keep or share.' },};
  const actionByLang: LangCopy< { enterMember: string; memberSignIn: string }> = {
    en: { enterMember: 'Enter Member Zone', memberSignIn: 'Already a member? Sign in' },
    ru: { enterMember: 'Перейти в зону участника', memberSignIn: 'Уже участник? Войти' },
    uk: { enterMember: 'Увійти в зону учасника', memberSignIn: 'Вже учасниця? Увійти' },
    es: { enterMember: 'Entrar a zona de miembro', memberSignIn: '¿Ya eres miembro? Iniciar sesión' },
    fr: { enterMember: 'Entrer dans la zone membre', memberSignIn: 'Déjà membre ? Se connecter' },
    de: { enterMember: 'Zur Mitgliederzone', memberSignIn: 'Schon Mitglied? Anmelden' },
    zh: { enterMember: '进入会员区', memberSignIn: '已有会员？登录' },
    ja: { enterMember: 'メンバーゾーンへ', memberSignIn: 'メンバーですか？ サインイン' },
    pt: { enterMember: 'Entrar na zona de membro', memberSignIn: 'Ja e membro? Entrar' },
  ar: { enterMember: 'Enter Member Zone', memberSignIn: 'Already a member? Sign in' },
  he: { enterMember: 'Enter Member Zone', memberSignIn: 'Already a member? Sign in' },};
  const bridgePublic = getLang(bridgePublicByLang, lang) || bridgePublicByLang.en;
  const actions = getLang(actionByLang, lang) || actionByLang.en;
  return (
    <section className="max-w-[1100px] mx-auto animate-in fade-in duration-500">
      <div className="luna-page-shell luna-page-bridge rounded-[3rem] border border-slate-200/70 dark:border-slate-800/85 bg-gradient-to-br from-[#f9eef5]/92 via-[#f0eaf6]/88 to-[#e6eef9]/84 dark:from-[#061125]/95 dark:via-[#0a1731]/93 dark:to-[#0f2242]/91 p-8 md:p-12 shadow-[0_24px_66px_rgba(89,69,128,0.18)] dark:shadow-[0_24px_66px_rgba(0,0,0,0.54)] space-y-10">
        <header className="space-y-4 max-w-3xl">
          <p className="text-[10px] font-black uppercase tracking-[0.48em] text-luna-purple">{bridgePublic.eyebrow}</p>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-slate-100">{bridgePublic.title}</h1>
        </header>

        <div className="relative rounded-[2.4rem] overflow-hidden border border-slate-200/75 dark:border-slate-800/88 h-64 md:h-80 shadow-[0_18px_44px_rgba(88,70,126,0.16)] dark:shadow-[0_22px_52px_rgba(0,0,0,0.5)]">
          <img
            src="/images/couple_conversation.webp"
            alt="Couple conversation"
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: '50% 38%' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(250,244,249,0.35)] via-[rgba(236,231,244,0.25)] to-[rgba(228,236,248,0.42)] dark:from-[rgba(8,14,30,0.48)] dark:via-[rgba(11,19,36,0.5)] dark:to-[rgba(8,14,30,0.58)]" />
        </div>

        <article className="rounded-[2rem] border border-slate-200/75 dark:border-slate-800/88 bg-white/72 dark:bg-[#09152d]/78 p-6 md:p-7 shadow-[0_14px_34px_rgba(88,70,126,0.14)] dark:shadow-[0_18px_42px_rgba(0,0,0,0.44)]">
          <p className="text-base md:text-lg font-black uppercase tracking-[0.2em] text-luna-purple mb-3">{bridgePublic.problemTitle}</p>
          <p className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">{bridgePublic.problemBody}</p>
        </article>

        <article className="rounded-[2rem] border border-slate-200/75 dark:border-slate-800/88 bg-white/72 dark:bg-[#09152d]/78 p-6 md:p-7 shadow-[0_14px_34px_rgba(88,70,126,0.14)] dark:shadow-[0_18px_42px_rgba(0,0,0,0.44)]">
          <p className="text-base md:text-lg font-black uppercase tracking-[0.2em] text-luna-purple mb-3">{bridgePublic.helpsTitle}</p>
          <ul className="space-y-2">
            <li className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">• {bridgePublic.helps[0]}</li>
            <li className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">• {bridgePublic.helps[1]}</li>
            <li className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">• {bridgePublic.helps[2]}</li>
          </ul>
          <p className="mt-4 text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200">{bridgePublic.unique}</p>
        </article>

        <article className="rounded-[2rem] border border-slate-200/75 dark:border-slate-800/88 bg-gradient-to-br from-[#f2e6f2]/86 via-[#e8e3f1]/82 to-[#e1e9f7]/78 dark:from-[#07132a]/90 dark:via-[#0b1a36]/88 dark:to-[#102546]/86 p-6 md:p-7 shadow-[0_14px_34px_rgba(88,70,126,0.14)] dark:shadow-[0_18px_42px_rgba(0,0,0,0.44)]">
          <p className="text-base md:text-lg font-black uppercase tracking-[0.2em] text-luna-purple mb-3">{bridgePublic.memberLinkTitle}</p>
          <p className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">{bridgePublic.memberLinkBody}</p>
        </article>

        <div className="flex flex-col items-start gap-4">
          <button
            onClick={onSignIn}
            className={`${PUBLIC_BTN_PRIMARY} px-8 py-4 text-[11px] tracking-[0.22em]`}
          >
            <span className={PUBLIC_BTN_PRIMARY_GLOW} />
            <span className="relative z-10">{actions.enterMember}</span>
          </button>
          <button
            onClick={onSignIn}
            className={`${PUBLIC_BTN_SECONDARY} px-5 py-2.5 text-[11px] tracking-[0.14em]`}
          >
            {actions.memberSignIn}
          </button>
        </div>
      </div>
    </section>
  );
};
