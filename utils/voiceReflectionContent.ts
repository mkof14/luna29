import { Language, LangCopy, getLang } from '../constants';

export type VoiceReflectionCopy = {
  unsupported: string;
  listening: string;
  micDenied: string;
  errorPrefix: string;
  micAccess: string;
  noSpeech: string;
  unavailable: string;
  back: string;
  reflectionLabel: string;
  subtitle: string;
  holdToSpeak: string;
  stopListening: string;
  lunaReflecting: string;
  yourReflection: string;
  lunaResponse: string;
  reflecting: string;
  listenAgain: string;
  save: string;
  redo: string;
  recording: string;
};

export type VoiceReflectionExplanation = {
  title: string;
  lead: string;
  line1: string;
  line2: string;
};

  const copyByLang: LangCopy< {
    unsupported: string; listening: string; micDenied: string; errorPrefix: string; micAccess: string; noSpeech: string; unavailable: string;
    back: string; reflectionLabel: string; subtitle: string; holdToSpeak: string; stopListening: string; lunaReflecting: string; yourReflection: string;
    lunaResponse: string; reflecting: string; listenAgain: string; save: string; redo: string; recording: string;
  }> = {
    en: { unsupported: 'Your browser does not support voice recognition. Please try Chrome or Safari.', listening: 'Listening...', micDenied: 'Microphone access denied. Check browser settings.', errorPrefix: 'Error', micAccess: 'Could not access microphone.', noSpeech: "I didn't catch that. Please try again.", unavailable: 'Luna29 is temporarily unavailable. Please try again.', back: 'Back to Journal', reflectionLabel: 'Live Reflection', subtitle: 'Speak your state. Luna29 is here to listen, understand, and respond.', holdToSpeak: 'Tap to speak', stopListening: 'Stop Listening', lunaReflecting: 'Luna29 is reflecting...', yourReflection: 'Your Reflection', lunaResponse: "Luna29's Response", reflecting: 'Reflecting...', listenAgain: 'Listen Again', save: 'Save to Journal', redo: 'Redo', recording: 'Recording...' },
    ru: { unsupported: 'Ваш браузер не поддерживает распознавание речи. Попробуйте Chrome или Safari.', listening: 'Слушаю...', micDenied: 'Доступ к микрофону запрещен. Проверьте настройки браузера.', errorPrefix: 'Ошибка', micAccess: 'Не удалось получить доступ к микрофону.', noSpeech: 'Я не расслышала. Пожалуйста, попробуйте еще раз.', unavailable: 'Luna29 временно недоступна. Попробуйте еще раз.', back: 'Назад в дневник', reflectionLabel: 'Голосовая рефлексия', subtitle: 'Говорите. Luna29 здесь, чтобы слушать и понимать.', holdToSpeak: 'Нажмите, чтобы говорить', stopListening: 'Остановить', lunaReflecting: 'Luna29 размышляет...', yourReflection: 'Ваши слова', lunaResponse: 'Ответ Luna29', reflecting: 'Размышляю...', listenAgain: 'Послушать еще раз', save: 'Сохранить в дневник', redo: 'Заново', recording: 'Запись...' },
    uk: { unsupported: 'Ваш браузер не підтримує розпізнавання мовлення. Спробуйте Chrome або Safari.', listening: 'Слухаю...', micDenied: 'Доступ до мікрофона заборонено. Перевірте налаштування браузера.', errorPrefix: 'Помилка', micAccess: 'Не вдалося отримати доступ до мікрофона.', noSpeech: 'Я не розчула. Спробуйте ще раз.', unavailable: 'Luna29 тимчасово недоступна. Спробуйте ще раз.', back: 'Назад до щоденника', reflectionLabel: 'Голосова рефлексія', subtitle: 'Говоріть. Luna29 тут, щоб слухати і розуміти.', holdToSpeak: 'Натисніть, щоб говорити', stopListening: 'Зупинити', lunaReflecting: 'Luna29 розмірковує...', yourReflection: 'Ваші слова', lunaResponse: 'Відповідь Luna29', reflecting: 'Розмірковую...', listenAgain: 'Прослухати ще раз', save: 'Зберегти в щоденник', redo: 'Заново', recording: 'Запис...' },
    es: { unsupported: 'Tu navegador no admite reconocimiento de voz. Prueba Chrome o Safari.', listening: 'Escuchando...', micDenied: 'Acceso al micrófono denegado. Revisa la configuración del navegador.', errorPrefix: 'Error', micAccess: 'No se pudo acceder al micrófono.', noSpeech: 'No te entendí. Inténtalo de nuevo.', unavailable: 'Luna29 no está disponible temporalmente. Inténtalo de nuevo.', back: 'Volver al diario', reflectionLabel: 'Reflexión de voz', subtitle: 'Habla tu estado. Luna29 está aquí para escuchar y comprender.', holdToSpeak: 'Toca para hablar', stopListening: 'Detener', lunaReflecting: 'Luna29 está reflexionando...', yourReflection: 'Tu reflexión', lunaResponse: 'Respuesta de Luna29', reflecting: 'Reflexionando...', listenAgain: 'Escuchar de nuevo', save: 'Guardar en diario', redo: 'Rehacer', recording: 'Grabando...' },
    fr: { unsupported: 'Votre navigateur ne prend pas en charge la reconnaissance vocale. Essayez Chrome ou Safari.', listening: 'J’écoute...', micDenied: 'Accès au microphone refusé. Vérifiez les paramètres du navigateur.', errorPrefix: 'Erreur', micAccess: 'Impossible d’accéder au microphone.', noSpeech: "Je n'ai pas bien entendu. Veuillez réessayer.", unavailable: 'Luna29 est temporairement indisponible. Réessayez.', back: 'Retour au journal', reflectionLabel: 'Réflexion vocale', subtitle: 'Exprimez votre état. Luna29 est là pour écouter et comprendre.', holdToSpeak: 'Touchez pour parler', stopListening: 'Arrêter', lunaReflecting: 'Luna29 réfléchit...', yourReflection: 'Votre réflexion', lunaResponse: 'Réponse de Luna29', reflecting: 'Réflexion...', listenAgain: 'Réécouter', save: 'Enregistrer dans le journal', redo: 'Recommencer', recording: 'Enregistrement...' },
    de: { unsupported: 'Dein Browser unterstützt keine Spracherkennung. Bitte nutze Chrome oder Safari.', listening: 'Ich höre zu...', micDenied: 'Mikrofonzugriff verweigert. Bitte Browser-Einstellungen prüfen.', errorPrefix: 'Fehler', micAccess: 'Kein Zugriff auf das Mikrofon möglich.', noSpeech: 'Ich habe dich nicht verstanden. Bitte versuche es erneut.', unavailable: 'Luna29 ist vorübergehend nicht verfügbar. Bitte versuche es erneut.', back: 'Zurück zum Journal', reflectionLabel: 'Sprachreflexion', subtitle: 'Sprich deinen Zustand aus. Luna29 hört zu, versteht und antwortet.', holdToSpeak: 'Tippen zum Sprechen', stopListening: 'Stoppen', lunaReflecting: 'Luna29 reflektiert...', yourReflection: 'Deine Reflexion', lunaResponse: 'Antwort von Luna29', reflecting: 'Reflektiere...', listenAgain: 'Erneut anhören', save: 'Im Journal speichern', redo: 'Neu', recording: 'Aufnahme...' },
    zh: { unsupported: '你的浏览器不支持语音识别。请尝试 Chrome 或 Safari。', listening: '正在聆听...', micDenied: '麦克风访问被拒绝。请检查浏览器设置。', errorPrefix: '错误', micAccess: '无法访问麦克风。', noSpeech: '我没有听清，请再试一次。', unavailable: 'Luna29 暂时不可用，请稍后再试。', back: '返回日记', reflectionLabel: '语音反思', subtitle: '说出你的状态。Luna29 会倾听、理解并回应。', holdToSpeak: '点击说话', stopListening: '停止', lunaReflecting: 'Luna29 正在思考...', yourReflection: '你的表达', lunaResponse: 'Luna29 的回应', reflecting: '思考中...', listenAgain: '再听一次', save: '保存到日记', redo: '重来', recording: '录音中...' },
    ja: { unsupported: 'お使いのブラウザは音声認識に対応していません。ChromeまたはSafariをお試しください。', listening: '聞いています...', micDenied: 'マイクへのアクセスが拒否されました。ブラウザ設定を確認してください。', errorPrefix: 'エラー', micAccess: 'マイクにアクセスできませんでした。', noSpeech: '聞き取れませんでした。もう一度お試しください。', unavailable: 'Luna29は一時的に利用できません。再度お試しください。', back: 'ジャーナルに戻る', reflectionLabel: '音声リフレクション', subtitle: '今の状態を話してください。Luna29が聴き、理解し、応答します。', holdToSpeak: 'タップして話す', stopListening: '停止', lunaReflecting: 'Luna29が考えています...', yourReflection: 'あなたの言葉', lunaResponse: 'Luna29の応答', reflecting: '思考中...', listenAgain: 'もう一度聞く', save: 'ジャーナルに保存', redo: 'やり直し', recording: '録音中...' },
    pt: { unsupported: 'Seu navegador não oferece suporte a reconhecimento de voz. Tente Chrome ou Safari.', listening: 'Ouvindo...', micDenied: 'Acesso ao microfone negado. Verifique as configurações do navegador.', errorPrefix: 'Erro', micAccess: 'Não foi possível acessar o microfone.', noSpeech: 'Não consegui entender. Tente novamente.', unavailable: 'Luna29 está temporariamente indisponível. Tente novamente.', back: 'Voltar ao diário', reflectionLabel: 'Reflexão por voz', subtitle: 'Fale seu estado. Luna29 está aqui para ouvir e compreender.', holdToSpeak: 'Toque para falar', stopListening: 'Parar', lunaReflecting: 'Luna29 está refletindo...', yourReflection: 'Sua reflexão', lunaResponse: 'Resposta da Luna29', reflecting: 'Refletindo...', listenAgain: 'Ouvir novamente', save: 'Salvar no diário', redo: 'Refazer', recording: 'Gravando...' }
  };
  const explanationByLang: LangCopy< { title: string; lead: string; line1: string; line2: string }> = {
    en: {
      title: 'Short explanation: Why voice matters.',
      lead: 'Reason is simple:',
      line1: 'People think faster than they write.',
      line2: 'Voice Note lets you capture your state immediately.',
    },
    ru: {
      title: 'Короткое объяснение: Почему голос важен.',
      lead: 'Причина простая:',
      line1: 'Люди думают быстрее, чем пишут.',
      line2: 'Voice Note позволяет фиксировать состояние сразу.',
    },
    uk: {
      title: 'Коротке пояснення: Чому голос важливий.',
      lead: 'Причина проста:',
      line1: 'Люди думають швидше, ніж пишуть.',
      line2: 'Voice Note дозволяє фіксувати стан одразу.',
    },
    es: {
      title: 'Explicación breve: por qué la voz importa.',
      lead: 'La razón es simple:',
      line1: 'Las personas piensan más rápido de lo que escriben.',
      line2: 'Voice Note te permite registrar tu estado de inmediato.',
    },
    fr: {
      title: 'Explication courte : pourquoi la voix est importante.',
      lead: 'La raison est simple :',
      line1: 'On pense plus vite qu’on n’écrit.',
      line2: 'Voice Note permet de capter votre état immédiatement.',
    },
    de: {
      title: 'Kurze Erklärung: Warum Stimme wichtig ist.',
      lead: 'Der Grund ist einfach:',
      line1: 'Menschen denken schneller, als sie schreiben.',
      line2: 'Voice Note hilft, deinen Zustand sofort festzuhalten.',
    },
    zh: {
      title: '简短说明：为什么语音很重要。',
      lead: '原因很简单：',
      line1: '人思考的速度比书写更快。',
      line2: 'Voice Note 让你立即记录当下状态。',
    },
    ja: {
      title: '短い説明：なぜ音声が重要か。',
      lead: '理由はシンプルです：',
      line1: '人は書くより速く考えます。',
      line2: 'Voice Note は状態をすぐに記録できます。',
    },
    pt: {
      title: 'Explicação curta: por que a voz importa.',
      lead: 'A razão é simples:',
      line1: 'As pessoas pensam mais rápido do que escrevem.',
      line2: 'Voice Note permite registrar seu estado na hora.',
    },
  };

export function getVoiceReflectionContent(lang: Language): {
  copy: VoiceReflectionCopy;
  explanation: VoiceReflectionExplanation;
} {
  return {
    copy: getLang(copyByLang, lang) || copyByLang.en,
    explanation: getLang(explanationByLang, lang) || explanationByLang.en,
  };
}
