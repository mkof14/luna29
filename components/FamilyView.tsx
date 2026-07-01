import React, { useEffect, useMemo, useState } from 'react';
import { CyclePhase } from '../types';
import { Language, LangCopy, getLang } from '../constants';
import { MemberIconBackButton } from './member/MemberIconBackButton';
import { LunaPageHeroSection } from './shared/LunaPageHeroSection';
import { LunaPageContentSection } from './shared/LunaPageContentSection';
import { PUBLIC_PAGE_STACK } from './public/publicPageStyles';
import { MEMBER_PAGE_ROOT } from '../utils/memberPageStyles';
import { getLunaPageTheme } from '../utils/lunaPageThemes';
import { getMemberHeroImage } from '../utils/memberHeroImages';

type CapacityLevel = 'low' | 'medium' | 'high';
type RiskLevel = 'low' | 'moderate' | 'high';
type TaskWeight = 'light' | 'medium' | 'heavy';

type Ritual = {
  id: string;
  minutes: number;
  emoji: string;
};

type LocalizedTask = {
  id: string;
  label: string;
  weight: TaskWeight;
};

type HomeSeasonsStoredState = {
  energy: number;
  mood: number;
  focus: number;
  homeLoad: number;
  noisePressure: number;
  lastPhase: CyclePhase;
  lastLang: Language;
};

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const HOME_SEASONS_STORAGE_KEY = 'luna_home_seasons_state_v1';

const readStoredState = (): Partial<HomeSeasonsStoredState> | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(HOME_SEASONS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed as Partial<HomeSeasonsStoredState>;
  } catch {
    return null;
  }
};

const phaseBonus: Record<CyclePhase, number> = {
  [CyclePhase.MENSTRUAL]: -10,
  [CyclePhase.FOLLICULAR]: 10,
  [CyclePhase.OVULATORY]: 14,
  [CyclePhase.LUTEAL]: -6,
};

const rituals: Ritual[] = [
  { id: 'reset', minutes: 3, emoji: '🌬️' },
  { id: 'focus', minutes: 5, emoji: '🎯' },
  { id: 'decompress', minutes: 7, emoji: '🫶' },
];

export const FamilyView: React.FC<{ phase: CyclePhase; lang: Language; onBack: () => void }> = ({ phase, lang, onBack }) => {
  const copyByLang: LangCopy< {
    back: string;
    season: string;
    title: string;
    subtitle: string;
    plannerTitle: string;
    plannerSubtitle: string;
    energy: string;
    mood: string;
    focus: string;
    homeLoad: string;
    available: string;
    capacityLow: string;
    capacityMedium: string;
    capacityHigh: string;
    suggested: string;
    noHeavy: string;
    riskTitle: string;
    riskSubtitle: string;
    noise: string;
    conflictLow: string;
    conflictModerate: string;
    conflictHigh: string;
    riskAdviceLow: string;
    riskAdviceModerate: string;
    riskAdviceHigh: string;
    ritualTitle: string;
    ritualSubtitle: string;
    start: string;
    running: string;
    done: string;
    checkinTitle: string;
    checkinSubtitle: string;
    forPartner: string;
    forFamily: string;
    copy: string;
    copied: string;
    forecast: string;
    phaseTipsTitle: string;
    phaseTips: Record<CyclePhase, string>;
    taskBank: LocalizedTask[];
    ritualLabels: Record<string, string>;
  }> = {
    en: {
      back: 'Back', season: 'Season', title: 'Home Seasons', subtitle: 'A living home rhythm, not a checklist.',
      plannerTitle: 'Home Load Planner', plannerSubtitle: 'Match household demand to your real bandwidth.',
      energy: 'Energy', mood: 'Mood', focus: 'Focus', homeLoad: 'Home Load', available: 'Available Capacity',
      capacityLow: 'Low capacity: protect essentials only.', capacityMedium: 'Medium capacity: do essentials + one support task.', capacityHigh: 'High capacity: good window for heavier household tasks.',
      suggested: 'Suggested tasks for today', noHeavy: 'Skip heavy logistics today. Keep it light and stable.',
      riskTitle: 'Conflict Forecast', riskSubtitle: 'Predict communication pressure before it spikes.', noise: 'Noise / Clutter Pressure',
      conflictLow: 'Low conflict risk', conflictModerate: 'Moderate conflict risk', conflictHigh: 'High conflict risk',
      riskAdviceLow: 'Good window for conversations and coordination.',
      riskAdviceModerate: 'Use shorter sentences and set one clear boundary first.',
      riskAdviceHigh: 'Delay sensitive talks. Use a reset script before discussion.',
      ritualTitle: 'Micro-Rituals', ritualSubtitle: 'Short protocols to reset home atmosphere in real time.',
      start: 'Start', running: 'Running', done: 'Done',
      checkinTitle: 'Shared Check-in', checkinSubtitle: 'Send one clear status to partner or family.', forPartner: 'For Partner', forFamily: 'For Family', copy: 'Copy', copied: 'Copied', forecast: 'Forecast',
      phaseTipsTitle: 'Phase Guidance',
      phaseTips: {
        [CyclePhase.MENSTRUAL]: 'Keep the home quiet, warm, and predictable. Delegate non-essential tasks.',
        [CyclePhase.FOLLICULAR]: 'Use this window for planning and light organization while motivation rises.',
        [CyclePhase.OVULATORY]: 'Best phase for social/home coordination and collaborative tasks.',
        [CyclePhase.LUTEAL]: 'Reduce visual noise and sudden changes. Protect transitions and rest blocks.',
      },
      taskBank: [
        { id: 'dishwasher', label: 'Run dishwasher + clear sink', weight: 'light' },
        { id: 'laundry-sort', label: 'Sort one laundry batch', weight: 'light' },
        { id: 'meal-simple', label: 'Simple meal prep for one day', weight: 'medium' },
        { id: 'kids-plan', label: 'Align kids schedule for tomorrow', weight: 'medium' },
        { id: 'deep-clean', label: 'Deep clean one zone', weight: 'heavy' },
        { id: 'admin-home', label: 'Household admin and bills', weight: 'heavy' },
      ],
      ritualLabels: { reset: '3-min Nervous System Reset', focus: '5-min Quiet Focus Block', decompress: '7-min Evening Decompression' },
    },
    ru: {
      back: 'Назад', season: 'Сезон', title: 'Home Seasons', subtitle: 'Живая домашняя ритмика, а не чеклист.',
      plannerTitle: 'Планировщик домашней нагрузки', plannerSubtitle: 'Сопоставьте бытовые задачи с реальным ресурсом.',
      energy: 'Энергия', mood: 'Настроение', focus: 'Фокус', homeLoad: 'Домашняя нагрузка', available: 'Доступный ресурс',
      capacityLow: 'Низкий ресурс: только базовые задачи.', capacityMedium: 'Средний ресурс: база + одна поддерживающая задача.', capacityHigh: 'Высокий ресурс: можно делать более сложные задачи.',
      suggested: 'Рекомендованные задачи на сегодня', noHeavy: 'Тяжелую логистику лучше отложить. Сохраните стабильность.',
      riskTitle: 'Прогноз конфликтности', riskSubtitle: 'Оценка риска перегрузки в коммуникации заранее.', noise: 'Шум / Визуальный беспорядок',
      conflictLow: 'Низкий риск конфликта', conflictModerate: 'Средний риск конфликта', conflictHigh: 'Высокий риск конфликта',
      riskAdviceLow: 'Хорошее окно для разговоров и согласования.',
      riskAdviceModerate: 'Говорите короче и сначала обозначьте одну границу.',
      riskAdviceHigh: 'Отложите чувствительные разговоры. Сначала короткий reset-скрипт.',
      ritualTitle: 'Микро-ритуалы', ritualSubtitle: 'Короткие протоколы для стабилизации атмосферы дома.',
      start: 'Старт', running: 'Идет', done: 'Готово',
      checkinTitle: 'Быстрый статус для близких', checkinSubtitle: 'Отправьте один ясный статус партнеру или семье.', forPartner: 'Для партнера', forFamily: 'Для семьи', copy: 'Копировать', copied: 'Скопировано', forecast: 'Прогноз',
      phaseTipsTitle: 'Рекомендации по фазе',
      phaseTips: {
        [CyclePhase.MENSTRUAL]: 'Сделайте дом тише и мягче. Небазовые задачи лучше делегировать.',
        [CyclePhase.FOLLICULAR]: 'Хороший период для планирования и легкой организации пространства.',
        [CyclePhase.OVULATORY]: 'Лучшее окно для семейной координации и совместных задач.',
        [CyclePhase.LUTEAL]: 'Уменьшите визуальный шум и резкие изменения. Берегите переходы и отдых.',
      },
      taskBank: [
        { id: 'dishwasher', label: 'Посудомойка + освободить раковину', weight: 'light' },
        { id: 'laundry-sort', label: 'Разобрать одну партию стирки', weight: 'light' },
        { id: 'meal-simple', label: 'Простая заготовка еды на день', weight: 'medium' },
        { id: 'kids-plan', label: 'Согласовать план детей на завтра', weight: 'medium' },
        { id: 'deep-clean', label: 'Глубокая уборка одной зоны', weight: 'heavy' },
        { id: 'admin-home', label: 'Домашние админ-задачи и счета', weight: 'heavy' },
      ],
      ritualLabels: { reset: '3 мин: reset нервной системы', focus: '5 мин: тихий фокус', decompress: '7 мин: вечерняя декомпрессия' },
    },
    uk: {
      back: 'Назад', season: 'Сезон', title: 'Home Seasons', subtitle: 'Живий домашній ритм, а не чеклист.',
      plannerTitle: 'Планувальник домашнього навантаження', plannerSubtitle: 'Співставте побут із реальним ресурсом.',
      energy: 'Енергія', mood: 'Настрій', focus: 'Фокус', homeLoad: 'Домашнє навантаження', available: 'Доступний ресурс',
      capacityLow: 'Низький ресурс: тільки базове.', capacityMedium: 'Середній ресурс: база + одна додаткова задача.', capacityHigh: 'Високий ресурс: вікно для складніших справ.',
      suggested: 'Рекомендовані задачі на сьогодні', noHeavy: 'Важку логістику краще відкласти.',
      riskTitle: 'Прогноз конфліктності', riskSubtitle: 'Оцініть ризик перевантаження в розмовах.', noise: 'Шум / Візуальний безлад',
      conflictLow: 'Низький ризик', conflictModerate: 'Середній ризик', conflictHigh: 'Високий ризик',
      riskAdviceLow: 'Добре вікно для розмов і координації.', riskAdviceModerate: 'Короткі фрази і одна чітка межа спочатку.', riskAdviceHigh: 'Відкладіть чутливі розмови, спершу короткий reset.',
      ritualTitle: 'Мікро-ритуали', ritualSubtitle: 'Короткі протоколи для стабілізації атмосфери вдома.',
      start: 'Старт', running: 'Триває', done: 'Готово',
      checkinTitle: 'Швидкий статус для близьких', checkinSubtitle: 'Надішліть один ясний статус партнеру або родині.', forPartner: 'Для партнера', forFamily: 'Для родини', copy: 'Копіювати', copied: 'Скопійовано', forecast: 'Прогноз',
      phaseTipsTitle: 'Поради за фазою',
      phaseTips: {
        [CyclePhase.MENSTRUAL]: 'Зробіть простір тихішим і мʼякшим. Небазові задачі делегуйте.',
        [CyclePhase.FOLLICULAR]: 'Добрий період для планування і легкої організації.',
        [CyclePhase.OVULATORY]: 'Найкраще вікно для сімейної координації та спільних задач.',
        [CyclePhase.LUTEAL]: 'Менше візуального шуму та різких змін. Захищайте відпочинок.',
      },
      taskBank: [
        { id: 'dishwasher', label: 'Посудомийка + очистити мийку', weight: 'light' },
        { id: 'laundry-sort', label: 'Розібрати одну партію прання', weight: 'light' },
        { id: 'meal-simple', label: 'Проста заготовка їжі на день', weight: 'medium' },
        { id: 'kids-plan', label: 'Узгодити план дітей на завтра', weight: 'medium' },
        { id: 'deep-clean', label: 'Глибоке прибирання однієї зони', weight: 'heavy' },
        { id: 'admin-home', label: 'Домашні адмін-задачі і рахунки', weight: 'heavy' },
      ],
      ritualLabels: { reset: '3 хв: reset нервової системи', focus: '5 хв: тихий фокус', decompress: '7 хв: вечірня декомпресія' },
    },
    es: {
      back: 'Atras', season: 'Temporada', title: 'Home Seasons', subtitle: 'Ritmo vivo del hogar, no checklist.',
      plannerTitle: 'Planificador de Carga del Hogar', plannerSubtitle: 'Ajusta demanda del hogar a tu capacidad real.',
      energy: 'Energia', mood: 'Estado de animo', focus: 'Enfoque', homeLoad: 'Carga del hogar', available: 'Capacidad disponible',
      capacityLow: 'Capacidad baja: solo lo esencial.', capacityMedium: 'Capacidad media: esencial + una tarea de apoyo.', capacityHigh: 'Capacidad alta: ventana para tareas pesadas.',
      suggested: 'Tareas sugeridas para hoy', noHeavy: 'Evita logistica pesada hoy.',
      riskTitle: 'Pronostico de Conflicto', riskSubtitle: 'Preve la presion en comunicacion.', noise: 'Ruido / Desorden visual',
      conflictLow: 'Riesgo bajo', conflictModerate: 'Riesgo moderado', conflictHigh: 'Riesgo alto',
      riskAdviceLow: 'Buena ventana para conversar.', riskAdviceModerate: 'Frases cortas y un limite claro primero.', riskAdviceHigh: 'Posponer temas sensibles y hacer reset breve.',
      ritualTitle: 'Micro-Rituales', ritualSubtitle: 'Protocolos cortos para regular el hogar.',
      start: 'Iniciar', running: 'Activo', done: 'Listo',
      checkinTitle: 'Check-in Compartido', checkinSubtitle: 'Envia un estado claro a pareja o familia.', forPartner: 'Para pareja', forFamily: 'Para familia', copy: 'Copiar', copied: 'Copiado', forecast: 'Pronostico',
      phaseTipsTitle: 'Guia por Fase',
      phaseTips: {
        [CyclePhase.MENSTRUAL]: 'Mantener casa calmada y calida. Delegar tareas no esenciales.',
        [CyclePhase.FOLLICULAR]: 'Buen momento para planificar y organizar.',
        [CyclePhase.OVULATORY]: 'Ventana ideal para coordinacion social/familiar.',
        [CyclePhase.LUTEAL]: 'Reducir cambios bruscos y ruido visual.',
      },
      taskBank: [
        { id: 'dishwasher', label: 'Lavavajillas + despejar fregadero', weight: 'light' },
        { id: 'laundry-sort', label: 'Separar una carga de ropa', weight: 'light' },
        { id: 'meal-simple', label: 'Preparar comida simple para 1 dia', weight: 'medium' },
        { id: 'kids-plan', label: 'Alinear plan de ninos para manana', weight: 'medium' },
        { id: 'deep-clean', label: 'Limpieza profunda de una zona', weight: 'heavy' },
        { id: 'admin-home', label: 'Administracion del hogar y pagos', weight: 'heavy' },
      ],
      ritualLabels: { reset: '3 min: reset del sistema nervioso', focus: '5 min: bloque de foco tranquilo', decompress: '7 min: descompresion nocturna' },
    },
    fr: {
      back: 'Retour', season: 'Saison', title: 'Home Seasons', subtitle: 'Un rythme vivant du foyer, pas une checklist.',
      plannerTitle: 'Planificateur de Charge Domestique', plannerSubtitle: 'Ajustez la demande du foyer a votre capacite reelle.',
      energy: 'Energie', mood: 'Humeur', focus: 'Concentration', homeLoad: 'Charge domestique', available: 'Capacite disponible',
      capacityLow: 'Capacite basse: uniquement l essentiel.', capacityMedium: 'Capacite moyenne: essentiel + une tache de soutien.', capacityHigh: 'Capacite haute: fenetre pour taches plus lourdes.',
      suggested: 'Taches recommandees aujourd hui', noHeavy: 'Evitez la logistique lourde aujourd hui.',
      riskTitle: 'Prevision de Conflit', riskSubtitle: 'Anticipez la pression relationnelle.', noise: 'Bruit / Desordre visuel',
      conflictLow: 'Risque faible', conflictModerate: 'Risque modere', conflictHigh: 'Risque eleve',
      riskAdviceLow: 'Bonne fenetre pour coordination et dialogue.', riskAdviceModerate: 'Phrases courtes + une limite claire en premier.', riskAdviceHigh: 'Reporter sujets sensibles, faire un reset court.',
      ritualTitle: 'Micro-Rituels', ritualSubtitle: 'Protocoles courts pour stabiliser l ambiance du foyer.',
      start: 'Demarrer', running: 'En cours', done: 'Termine',
      checkinTitle: 'Check-in Partage', checkinSubtitle: 'Envoyez un statut clair au partenaire/famille.', forPartner: 'Pour partenaire', forFamily: 'Pour famille', copy: 'Copier', copied: 'Copie', forecast: 'Prevision',
      phaseTipsTitle: 'Guidage de Phase',
      phaseTips: {
        [CyclePhase.MENSTRUAL]: 'Rendre le foyer calme et previsible. Deleguer le non-essentiel.',
        [CyclePhase.FOLLICULAR]: 'Bonne fenetre pour planifier et organiser.',
        [CyclePhase.OVULATORY]: 'Phase ideale pour coordination sociale/familiale.',
        [CyclePhase.LUTEAL]: 'Reduire les changements soudains et le bruit visuel.',
      },
      taskBank: [
        { id: 'dishwasher', label: 'Lancer le lave-vaisselle + evier clair', weight: 'light' },
        { id: 'laundry-sort', label: 'Trier une lessive', weight: 'light' },
        { id: 'meal-simple', label: 'Preparer un repas simple pour 1 jour', weight: 'medium' },
        { id: 'kids-plan', label: 'Aligner le planning enfants de demain', weight: 'medium' },
        { id: 'deep-clean', label: 'Nettoyage profond d une zone', weight: 'heavy' },
        { id: 'admin-home', label: 'Administration domestique et factures', weight: 'heavy' },
      ],
      ritualLabels: { reset: '3 min: reset du systeme nerveux', focus: '5 min: bloc de focus calme', decompress: '7 min: decompression du soir' },
    },
    de: {
      back: 'Zuruck', season: 'Saison', title: 'Home Seasons', subtitle: 'Lebendiger Haushaltsrhythmus statt Checkliste.',
      plannerTitle: 'Haushaltslast-Planer', plannerSubtitle: 'Passe Haushaltsanforderungen an echte Kapazitat an.',
      energy: 'Energie', mood: 'Stimmung', focus: 'Fokus', homeLoad: 'Haushaltslast', available: 'Verfugbare Kapazitat',
      capacityLow: 'Niedrige Kapazitat: nur das Wesentliche.', capacityMedium: 'Mittlere Kapazitat: Wesentliches + eine Zusatzausgabe.', capacityHigh: 'Hohe Kapazitat: Zeitfenster fur schwere Aufgaben.',
      suggested: 'Empfohlene Aufgaben fur heute', noHeavy: 'Heute keine schwere Logistik.',
      riskTitle: 'Konfliktprognose', riskSubtitle: 'Kommunikationsdruck fruh erkennen.', noise: 'Larm / visuelle Unordnung',
      conflictLow: 'Niedriges Risiko', conflictModerate: 'Mittleres Risiko', conflictHigh: 'Hohes Risiko',
      riskAdviceLow: 'Gutes Fenster fur Gesprache und Koordination.', riskAdviceModerate: 'Kurze Satze, zuerst eine klare Grenze.', riskAdviceHigh: 'Sensible Themen verschieben, kurz resetten.',
      ritualTitle: 'Mikro-Rituale', ritualSubtitle: 'Kurze Protokolle fur stabile Haushaltsatmosphare.',
      start: 'Start', running: 'Lauft', done: 'Fertig',
      checkinTitle: 'Gemeinsamer Check-in', checkinSubtitle: 'Sende einen klaren Status an Partner/Familie.', forPartner: 'Fur Partner', forFamily: 'Fur Familie', copy: 'Kopieren', copied: 'Kopiert', forecast: 'Prognose',
      phaseTipsTitle: 'Phasen-Hinweise',
      phaseTips: {
        [CyclePhase.MENSTRUAL]: 'Ruhige, warme und planbare Umgebung priorisieren.',
        [CyclePhase.FOLLICULAR]: 'Gutes Zeitfenster fur Planung und Organisation.',
        [CyclePhase.OVULATORY]: 'Ideal fur soziale/familiare Koordination.',
        [CyclePhase.LUTEAL]: 'Weniger abrupte Anderungen und visuelle Reize.',
      },
      taskBank: [
        { id: 'dishwasher', label: 'Spulmaschine + Spule freimachen', weight: 'light' },
        { id: 'laundry-sort', label: 'Eine Wascheladung sortieren', weight: 'light' },
        { id: 'meal-simple', label: 'Einfache Mahlzeit fur einen Tag vorbereiten', weight: 'medium' },
        { id: 'kids-plan', label: 'Kinderplan fur morgen abstimmen', weight: 'medium' },
        { id: 'deep-clean', label: 'Tiefenreinigung einer Zone', weight: 'heavy' },
        { id: 'admin-home', label: 'Haushaltsadmin und Rechnungen', weight: 'heavy' },
      ],
      ritualLabels: { reset: '3 Min: Nervensystem-Reset', focus: '5 Min: ruhiger Fokusblock', decompress: '7 Min: Abend-Dekompression' },
    },
    zh: {
      back: '返回', season: '阶段', title: 'Home Seasons', subtitle: '家庭节律是动态系统，不是待办清单。',
      plannerTitle: '家庭负荷规划', plannerSubtitle: '让家庭任务匹配你的真实带宽。',
      energy: '精力', mood: '情绪', focus: '专注', homeLoad: '家庭负荷', available: '可用容量',
      capacityLow: '低容量：只做必要事项。', capacityMedium: '中容量：必要事项 + 一项支持任务。', capacityHigh: '高容量：可处理较重任务。',
      suggested: '今日建议任务', noHeavy: '今天避免重负荷家务。',
      riskTitle: '冲突预测', riskSubtitle: '在沟通升级前预判压力。', noise: '噪音 / 杂乱压力',
      conflictLow: '低风险', conflictModerate: '中风险', conflictHigh: '高风险',
      riskAdviceLow: '适合沟通与协作。', riskAdviceModerate: '先说短句，再设一个明确边界。', riskAdviceHigh: '敏感话题先延后，先做短时 reset。',
      ritualTitle: '微型仪式', ritualSubtitle: '用短协议实时稳定家庭氛围。',
      start: '开始', running: '进行中', done: '完成',
      checkinTitle: '共享状态', checkinSubtitle: '向伴侣/家人发送一个清晰状态。', forPartner: '给伴侣', forFamily: '给家人', copy: '复制', copied: '已复制', forecast: '预测',
      phaseTipsTitle: '阶段建议',
      phaseTips: {
        [CyclePhase.MENSTRUAL]: '保持安静、温和、可预期，非必要事务尽量委托。',
        [CyclePhase.FOLLICULAR]: '适合规划与轻组织。',
        [CyclePhase.OVULATORY]: '适合社交与家庭协作。',
        [CyclePhase.LUTEAL]: '减少突发变化与视觉噪音。',
      },
      taskBank: [
        { id: 'dishwasher', label: '洗碗机 + 清理水槽', weight: 'light' },
        { id: 'laundry-sort', label: '整理一批衣物', weight: 'light' },
        { id: 'meal-simple', label: '准备一天的简餐', weight: 'medium' },
        { id: 'kids-plan', label: '同步孩子明日安排', weight: 'medium' },
        { id: 'deep-clean', label: '深度清洁一个区域', weight: 'heavy' },
        { id: 'admin-home', label: '家庭行政与账单', weight: 'heavy' },
      ],
      ritualLabels: { reset: '3分钟：神经系统重置', focus: '5分钟：安静专注块', decompress: '7分钟：夜间减压' },
    },
    ja: {
      back: '戻る', season: 'シーズン', title: 'Home Seasons', subtitle: '家のリズムはチェックリストではなく動的システム。',
      plannerTitle: 'ホーム負荷プランナー', plannerSubtitle: '家事負荷を実際の帯域に合わせる。',
      energy: 'エネルギー', mood: '気分', focus: '集中', homeLoad: '家事負荷', available: '利用可能容量',
      capacityLow: '低容量: 必須のみ。', capacityMedium: '中容量: 必須 + 補助タスク1つ。', capacityHigh: '高容量: 重めのタスクに向く。',
      suggested: '本日の推奨タスク', noHeavy: '今日は重い家事を避ける。',
      riskTitle: 'コンフリクト予測', riskSubtitle: '会話の圧力を先に可視化。', noise: '騒音 / 視覚ノイズ',
      conflictLow: '低リスク', conflictModerate: '中リスク', conflictHigh: '高リスク',
      riskAdviceLow: '会話と調整に良い時間帯。', riskAdviceModerate: '短文で、先に境界を1つ示す。', riskAdviceHigh: '敏感な話題は延期し、先に短いreset。',
      ritualTitle: 'マイクロリチュアル', ritualSubtitle: '家の空気を整える短いプロトコル。',
      start: '開始', running: '進行中', done: '完了',
      checkinTitle: '共有チェックイン', checkinSubtitle: 'パートナー/家族へ明確な状態を送る。', forPartner: 'パートナー向け', forFamily: '家族向け', copy: 'コピー', copied: 'コピー済み', forecast: '予測',
      phaseTipsTitle: 'フェーズガイド',
      phaseTips: {
        [CyclePhase.MENSTRUAL]: '静かで予測可能な環境を優先。非必須は委任。',
        [CyclePhase.FOLLICULAR]: '計画と軽い整理に向く。',
        [CyclePhase.OVULATORY]: '家庭内外の調整に最適。',
        [CyclePhase.LUTEAL]: '急な変更と視覚ノイズを減らす。',
      },
      taskBank: [
        { id: 'dishwasher', label: '食洗機 + シンク整理', weight: 'light' },
        { id: 'laundry-sort', label: '洗濯1バッチを仕分け', weight: 'light' },
        { id: 'meal-simple', label: '1日分の簡単な食事準備', weight: 'medium' },
        { id: 'kids-plan', label: '子どもの明日予定を調整', weight: 'medium' },
        { id: 'deep-clean', label: '1エリアを重点清掃', weight: 'heavy' },
        { id: 'admin-home', label: '家事管理・支払い処理', weight: 'heavy' },
      ],
      ritualLabels: { reset: '3分: 神経系リセット', focus: '5分: 静かな集中ブロック', decompress: '7分: 夜のデコンプレス' },
    },
    pt: {
      back: 'Voltar', season: 'Estacao', title: 'Home Seasons', subtitle: 'Ritmo da casa vivo, nao checklist.',
      plannerTitle: 'Planejador de Carga da Casa', plannerSubtitle: 'Ajuste demanda da casa a sua banda real.',
      energy: 'Energia', mood: 'Humor', focus: 'Foco', homeLoad: 'Carga da casa', available: 'Capacidade disponivel',
      capacityLow: 'Capacidade baixa: apenas o essencial.', capacityMedium: 'Capacidade media: essencial + uma tarefa de apoio.', capacityHigh: 'Capacidade alta: janela para tarefas pesadas.',
      suggested: 'Tarefas sugeridas para hoje', noHeavy: 'Evite logistica pesada hoje.',
      riskTitle: 'Previsao de Conflito', riskSubtitle: 'Antecipe pressao na comunicacao.', noise: 'Ruido / Desordem visual',
      conflictLow: 'Risco baixo', conflictModerate: 'Risco moderado', conflictHigh: 'Risco alto',
      riskAdviceLow: 'Boa janela para conversa e coordenacao.', riskAdviceModerate: 'Frases curtas e um limite claro primeiro.', riskAdviceHigh: 'Adie temas sensiveis e faca reset curto.',
      ritualTitle: 'Micro-Rituais', ritualSubtitle: 'Protocolos curtos para regular o clima da casa.',
      start: 'Iniciar', running: 'Rodando', done: 'Concluido',
      checkinTitle: 'Check-in Compartilhado', checkinSubtitle: 'Envie um status claro para parceiro/familia.', forPartner: 'Para parceiro', forFamily: 'Para familia', copy: 'Copiar', copied: 'Copiado', forecast: 'Previsao',
      phaseTipsTitle: 'Guia por Fase',
      phaseTips: {
        [CyclePhase.MENSTRUAL]: 'Mantenha casa calma e previsivel. Delegue o nao essencial.',
        [CyclePhase.FOLLICULAR]: 'Boa fase para planejamento e organizacao leve.',
        [CyclePhase.OVULATORY]: 'Janela ideal para coordenacao social/familiar.',
        [CyclePhase.LUTEAL]: 'Menos mudancas bruscas e menos ruido visual.',
      },
      taskBank: [
        { id: 'dishwasher', label: 'Lavar louca + pia livre', weight: 'light' },
        { id: 'laundry-sort', label: 'Separar uma carga de roupa', weight: 'light' },
        { id: 'meal-simple', label: 'Preparo simples de refeicao para 1 dia', weight: 'medium' },
        { id: 'kids-plan', label: 'Alinhar agenda das criancas para amanha', weight: 'medium' },
        { id: 'deep-clean', label: 'Limpeza profunda de uma area', weight: 'heavy' },
        { id: 'admin-home', label: 'Administracao da casa e contas', weight: 'heavy' },
      ],
      ritualLabels: { reset: '3 min: reset do sistema nervoso', focus: '5 min: bloco de foco calmo', decompress: '7 min: descompressao da noite' },
    },
  ar: {
      back: 'رجوع', season: 'موسم', title: 'مواسم المنزل', subtitle: 'إيقاع منزلي حيّ، لا قائمة مهام.',
      plannerTitle: 'مخطّط حِمل المنزل', plannerSubtitle: 'وائمي طلبات المنزل مع طاقتكِ الحقيقية.',
      energy: 'الطاقة', mood: 'المزاج', focus: 'التركيز', homeLoad: 'حِمل المنزل', available: 'القدرة المتاحة',
      capacityLow: 'قدرة منخفضة: احمي الأساسيات فقط.', capacityMedium: 'قدرة متوسطة: الأساسيات + مهمة دعم واحدة.', capacityHigh: 'قدرة عالية: نافذة جيدة للمهام المنزلية الأثقل.',
      suggested: 'مهام مقترحة لليوم', noHeavy: 'تخطّي اللوجستيات الثقيلة اليوم. حافظي على خفة واستقرار.',
      riskTitle: 'توقّع التعارض', riskSubtitle: 'توقّي ضغط التواصل قبل أن يتصاعد.', noise: 'ضغط الضوضاء / الفوضى',
      conflictLow: 'خطر تعارض منخفض', conflictModerate: 'خطر تعارض متوسط', conflictHigh: 'خطر تعارض مرتفع',
      riskAdviceLow: 'نافذة جيدة للمحادثات والتنسيق.',
      riskAdviceModerate: 'استخدمي جملاً أقصر وحدّدي حداً واحداً واضحاً أولاً.',
      riskAdviceHigh: 'أجّلي الحديث الحساس. استخدمي بروتوكول إعادة ضبط قبل النقاش.',
      ritualTitle: 'طقوس صغيرة', ritualSubtitle: 'بروتوكولات قصيرة لإعادة ضبط أجواء المنزل فوراً.',
      start: 'بدء', running: 'قيد التشغيل', done: 'تم',
      checkinTitle: 'check-in مشترك', checkinSubtitle: 'أرسلي حالة واضحة للشريكة أو العائلة.', forPartner: 'للشريكة', forFamily: 'للعائلة', copy: 'نسخ', copied: 'تم النسخ', forecast: 'توقّع',
      phaseTipsTitle: 'إرشاد المرحلة',
      phaseTips: {
        [CyclePhase.MENSTRUAL]: 'حافظي على المنزل هادئاً ودافئاً ومتوقّعاً. فوّضي المهام غير الأساسية.',
        [CyclePhase.FOLLICULAR]: 'استثمري هذه النافذة للتخطيط والتنظيم الخفيف مع ارتفاع الدافع.',
        [CyclePhase.OVULATORY]: 'أفضل مرحلة للتنسيق الاجتماعي/المنزلي والمهام التعاونية.',
        [CyclePhase.LUTEAL]: 'قلّلي الضوضاء البصرية والتغييرات المفاجئة. احمي فترات الانتقال والراحة.',
      },
      taskBank: [
        { id: 'dishwasher', label: 'تشغيل غسالة الصحون + تفريغ الحوض', weight: 'light' },
        { id: 'laundry-sort', label: 'فرز دفعة غسيل واحدة', weight: 'light' },
        { id: 'meal-simple', label: 'تحضير وجبة بسيطة ليوم واحد', weight: 'medium' },
        { id: 'kids-plan', label: 'مواءمة جدول الأطفال للغد', weight: 'medium' },
        { id: 'deep-clean', label: 'تنظيف عميق لمنطقة واحدة', weight: 'heavy' },
        { id: 'admin-home', label: 'إدارة المنزل والفواتير', weight: 'heavy' },
      ],
      ritualLabels: { reset: '3 د: إعادة ضبط الجهاز العصبي', focus: '5 د: كتلة تركيز هادئة', decompress: '7 د: استرخاء مسائي' },
    },
  he: {
      back: 'חזרה', season: 'עונה', title: 'עונות הבית', subtitle: 'קצב ביתי חי, לא רשימת משימות.',
      plannerTitle: 'מתכננת עומס הבית', plannerSubtitle: 'התאימי את דרישות הבית לרוחב הפס האמיתי שלך.',
      energy: 'אנרגיה', mood: 'מצב רוח', focus: 'ריכוז', homeLoad: 'עומס בית', available: 'קיבולת זמינה',
      capacityLow: 'קיבולת נמוכה: שמרי רק על הדברים החיוניים.', capacityMedium: 'קיבולת בינונית: חיוניים + משימת תמיכה אחת.', capacityHigh: 'קיבולת גבוהה: חלון טוב למשימות בית כבדות.',
      suggested: 'משימות מוצעות להיום', noHeavy: 'דלגי על לוגיסטיקה כבדה היום. שמרי על קלילות ויציבות.',
      riskTitle: 'תחזית מתח', riskSubtitle: 'חזי לחץ תקשורת לפני שהוא עולה.', noise: 'לחץ רעש / בלגן',
      conflictLow: 'סיכון סכסוך נמוך', conflictModerate: 'סיכון סכסוך בינוני', conflictHigh: 'סיכון סכסוך גבוה',
      riskAdviceLow: 'חלון טוב לשיחות ולתיאום.',
      riskAdviceModerate: 'השתמשי במשפטים קצרים וקבעי גבול ברור אחד קודם.',
      riskAdviceHigh: 'דחי שיחות רגישות. השתמשי בפרוטוקול reset לפני הדיון.',
      ritualTitle: 'מיקרו-טקסים', ritualSubtitle: 'פרוטוקולים קצרים לאיפוס אווירת הבית בזמן אמת.',
      start: 'התחלה', running: 'פועל', done: 'בוצע',
      checkinTitle: 'check-in משותף', checkinSubtitle: 'שלחי סטטוס ברור לבן/בת הזוג או למשפחה.', forPartner: 'לבן/בת הזוג', forFamily: 'למשפחה', copy: 'העתק', copied: 'הועתק', forecast: 'תחזית',
      phaseTipsTitle: 'הדרכה לפי שלב',
      phaseTips: {
        [CyclePhase.MENSTRUAL]: 'שמרי על בית שקט, חם וצפוי. הפקידי משימות לא חיוניות.',
        [CyclePhase.FOLLICULAR]: 'נצלי את החלון הזה לתכנון וארגון קל כשהמוטיבציה עולה.',
        [CyclePhase.OVULATORY]: 'השלב הטוב ביותר לתיאום חברתי/ביתי ולמשימות משותפות.',
        [CyclePhase.LUTEAL]: 'הפחיתי רעש חזותי ושינויים פתאומיים. הגני על מעברים וזמני מנוחה.',
      },
      taskBank: [
        { id: 'dishwasher', label: 'הפעילי מדיח + רוקני כיור', weight: 'light' },
        { id: 'laundry-sort', label: 'מייני מכבסה אחת', weight: 'light' },
        { id: 'meal-simple', label: 'הכיני ארוחה פשוטה ליום אחד', weight: 'medium' },
        { id: 'kids-plan', label: 'תאמי לוח ילדים למחר', weight: 'medium' },
        { id: 'deep-clean', label: 'ניקוי עמוק באזור אחד', weight: 'heavy' },
        { id: 'admin-home', label: 'ניהול בית וחשבונות', weight: 'heavy' },
      ],
      ritualLabels: { reset: '3 דק: reset למערכת העצבים', focus: '5 דק: בלוק ריכוז שקט', decompress: '7 דק: הרפיה ערבית' },
    },};

  const copy = getLang(copyByLang, lang) || copyByLang.en;

  const initialStored = useMemo(() => {
    const saved = readStoredState();
    return {
      energy: clamp(Number(saved?.energy ?? 58), 0, 100),
      mood: clamp(Number(saved?.mood ?? 55), 0, 100),
      focus: clamp(Number(saved?.focus ?? 52), 0, 100),
      homeLoad: clamp(Number(saved?.homeLoad ?? 50), 0, 100),
      noisePressure: clamp(Number(saved?.noisePressure ?? 45), 0, 100),
    };
  }, []);

  const [energy, setEnergy] = useState(initialStored.energy);
  const [mood, setMood] = useState(initialStored.mood);
  const [focus, setFocus] = useState(initialStored.focus);
  const [homeLoad, setHomeLoad] = useState(initialStored.homeLoad);
  const [noisePressure, setNoisePressure] = useState(initialStored.noisePressure);
  const [activeRitualId, setActiveRitualId] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [copiedKey, setCopiedKey] = useState<'partner' | 'family' | null>(null);

  const availableCapacity = useMemo(() => {
    const weighted = energy * 0.4 + mood * 0.3 + focus * 0.3;
    const loadPenalty = homeLoad * 0.55;
    return clamp(Math.round(weighted - loadPenalty + phaseBonus[phase]), 0, 100);
  }, [energy, mood, focus, homeLoad, phase]);

  const capacityLevel: CapacityLevel = availableCapacity < 35 ? 'low' : availableCapacity < 68 ? 'medium' : 'high';

  const riskScore = useMemo(() => {
    const reactivity = (100 - mood) * 0.42 + (100 - focus) * 0.28 + noisePressure * 0.3;
    const phaseStress = phase === CyclePhase.LUTEAL ? 10 : phase === CyclePhase.MENSTRUAL ? 8 : 0;
    return clamp(Math.round(reactivity + phaseStress - energy * 0.12), 0, 100);
  }, [mood, focus, noisePressure, phase, energy]);

  const riskLevel: RiskLevel = riskScore < 38 ? 'low' : riskScore < 70 ? 'moderate' : 'high';

  const suggestedTasks = useMemo(() => {
    const allowedWeight = capacityLevel === 'low' ? ['light'] : capacityLevel === 'medium' ? ['light', 'medium'] : ['light', 'medium', 'heavy'];
    return copy.taskBank.filter((task) => allowedWeight.includes(task.weight)).slice(0, 4);
  }, [capacityLevel, copy.taskBank]);

  const partnerCheckin = useMemo(() => {
    return `Luna29 Home Seasons: ${copy.forecast} ${riskScore}/100 (${riskLevel}). ${copy.season}: ${phase}. ${copy.available}: ${availableCapacity}/100. I need a calmer communication pace and one clear priority for the next hour.`;
  }, [copy.forecast, copy.season, copy.available, riskScore, riskLevel, phase, availableCapacity]);

  const familyCheckin = useMemo(() => {
    return `Luna29 Home Seasons update: ${copy.season} ${phase}. ${copy.available}: ${availableCapacity}/100. Today we keep home rhythm simple: lower noise, shorter requests, and one shared essential task.`;
  }, [copy.season, phase, copy.available, availableCapacity]);

  useEffect(() => {
    if (!activeRitualId || secondsLeft <= 0) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [activeRitualId, secondsLeft]);

  useEffect(() => {
    if (secondsLeft === 0 && activeRitualId) {
      setActiveRitualId(null);
    }
  }, [secondsLeft, activeRitualId]);

  useEffect(() => {
    try {
      const payload: HomeSeasonsStoredState = {
        energy,
        mood,
        focus,
        homeLoad,
        noisePressure,
        lastPhase: phase,
        lastLang: lang,
      };
      window.localStorage.setItem(HOME_SEASONS_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // no-op
    }
  }, [energy, mood, focus, homeLoad, noisePressure, phase, lang]);

  const startRitual = (ritual: Ritual) => {
    setActiveRitualId(ritual.id);
    setSecondsLeft(ritual.minutes * 60);
  };

  const copyToClipboard = async (text: string, key: 'partner' | 'family') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 1400);
    } catch {
      setCopiedKey(null);
    }
  };

  const capacityText = capacityLevel === 'low' ? copy.capacityLow : capacityLevel === 'medium' ? copy.capacityMedium : copy.capacityHigh;
  const riskText = riskLevel === 'low' ? copy.conflictLow : riskLevel === 'moderate' ? copy.conflictModerate : copy.conflictHigh;
  const riskAdvice = riskLevel === 'low' ? copy.riskAdviceLow : riskLevel === 'moderate' ? copy.riskAdviceModerate : copy.riskAdviceHigh;

  const themeClass = getLunaPageTheme('family').shellClass;

  return (
    <section className={`${MEMBER_PAGE_ROOT} ${themeClass}`} data-testid="family-root">
      <div className="flex justify-between items-center gap-4">
        <MemberIconBackButton lang={lang} onClick={onBack} className="mb-0" />
        <div className="px-4 py-1.5 bg-luna-purple/10 rounded-full border border-luna-purple/20">
          <span className="text-sm font-black uppercase text-luna-purple tracking-[0.16em]">{copy.season}: {phase}</span>
        </div>
      </div>

      <div className={PUBLIC_PAGE_STACK}>
        <LunaPageHeroSection
          themeClass={themeClass}
          eyebrow={copy.season}
          title={copy.title}
          subtitle={copy.subtitle}
          image={getMemberHeroImage('family')}
          imageAlt={copy.title}
        />

        <LunaPageContentSection themeClass={themeClass} padded={false} className="space-y-8">
      <section className="luna-vivid-surface rounded-[2.5rem] p-8 md:p-10 border border-slate-200/80 dark:border-slate-800/80 shadow-[0_28px_80px_rgba(88,63,128,0.28)]">
        <div className="p-5 rounded-3xl luna-vivid-card-soft border border-slate-200/90 dark:border-slate-700/60 shadow-[0_12px_30px_rgba(118,96,153,0.18)]">
          <p className="text-base md:text-lg font-black uppercase tracking-[0.16em] text-luna-purple mb-2">{copy.phaseTipsTitle}</p>
          <p className="text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">{copy.phaseTips[phase]}</p>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <article className="luna-vivid-card-alt-1 rounded-[2rem] p-6 border border-slate-200/90 dark:border-slate-700/60 shadow-[0_18px_45px_rgba(109,84,149,0.24)] space-y-5">
          <div>
            <p className="text-base md:text-lg font-black uppercase tracking-[0.16em] text-luna-purple">{copy.plannerTitle}</p>
            <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">{copy.plannerSubtitle}</p>
          </div>

          {[
            { label: copy.energy, value: energy, set: setEnergy },
            { label: copy.mood, value: mood, set: setMood },
            { label: copy.focus, value: focus, set: setFocus },
            { label: copy.homeLoad, value: homeLoad, set: setHomeLoad },
          ].map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
                <span>{item.label}</span>
                <span>{item.value}</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={item.value}
                onChange={(e) => item.set(Number(e.target.value))}
                className="luna-range"
              />
            </div>
          ))}

          <div className="rounded-2xl p-4 bg-slate-900 text-slate-100 dark:bg-[#0a1d3f] border border-slate-700">
            <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-300">{copy.available}</p>
            <p className="mt-1 text-3xl font-black">{availableCapacity}/100</p>
            <p className="mt-2 text-sm font-semibold text-slate-300">{capacityText}</p>
          </div>

          <div>
            <p className="text-sm font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-300 mb-2">{copy.suggested}</p>
            <div className="space-y-2">
              {suggestedTasks.map((task) => (
                <div key={task.id} className="rounded-xl px-3 py-2 bg-white/70 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {task.label}
                </div>
              ))}
              {capacityLevel === 'low' && <p className="text-xs font-semibold text-rose-600 dark:text-rose-300">{copy.noHeavy}</p>}
            </div>
          </div>
        </article>

        <article className="luna-vivid-card-alt-3 rounded-[2rem] p-6 border border-slate-200/90 dark:border-slate-700/60 shadow-[0_18px_45px_rgba(83,112,153,0.24)] space-y-5">
          <div>
            <p className="text-base md:text-lg font-black uppercase tracking-[0.16em] text-cyan-600 dark:text-cyan-300">{copy.riskTitle}</p>
            <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">{copy.riskSubtitle}</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
              <span>{copy.noise}</span>
              <span>{noisePressure}</span>
            </div>
            <input type="range" min={0} max={100} value={noisePressure} onChange={(e) => setNoisePressure(Number(e.target.value))} className="luna-range luna-range-cyan" />
          </div>

          <div className="rounded-2xl p-4 bg-slate-900 text-slate-100 dark:bg-[#071c3d] border border-slate-700">
            <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-300">{copy.forecast}</p>
            <p className="mt-1 text-3xl font-black">{riskScore}/100</p>
            <p className={`mt-2 text-sm font-semibold ${riskLevel === 'high' ? 'text-rose-300' : riskLevel === 'moderate' ? 'text-amber-300' : 'text-emerald-300'}`}>{riskText}</p>
            <p className="mt-2 text-sm font-semibold text-slate-300">{riskAdvice}</p>
          </div>

          <div className="rounded-2xl p-4 bg-white/70 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700">
            <p className="text-sm md:text-base font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-300 mb-2">{copy.ritualTitle}</p>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-4">{copy.ritualSubtitle}</p>
            <div className="space-y-2">
              {rituals.map((ritual) => {
                const active = activeRitualId === ritual.id;
                const label = copy.ritualLabels[ritual.id] || ritual.id;
                return (
                  <button
                    key={ritual.id}
                    onClick={() => startRitual(ritual)}
                    className={`w-full text-left rounded-xl px-3 py-2 border transition-all ${active ? 'bg-luna-purple text-white border-luna-purple shadow-lg shadow-luna-purple/25' : 'bg-white/80 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold">{ritual.emoji} {label}</span>
                      <span className="text-xs font-black uppercase tracking-wider">{active ? `${copy.running}: ${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, '0')}` : copy.start}</span>
                    </div>
                  </button>
                );
              })}
              {!activeRitualId && secondsLeft === 0 && <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-300">{copy.done}</p>}
            </div>
          </div>
        </article>
      </section>

      <section className="luna-vivid-card-alt-4 rounded-[2rem] p-6 border border-slate-200/90 dark:border-slate-700/60 shadow-[0_18px_45px_rgba(104,86,146,0.24)]">
        <p className="text-base md:text-lg font-black uppercase tracking-[0.16em] text-luna-purple">{copy.checkinTitle}</p>
        <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">{copy.checkinSubtitle}</p>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl p-4 bg-white/75 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700 space-y-3">
            <p className="text-sm font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-300">{copy.forPartner}</p>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">{partnerCheckin}</p>
            <button onClick={() => copyToClipboard(partnerCheckin, 'partner')} className="px-3 py-2 rounded-full bg-luna-purple text-white text-[11px] font-black uppercase tracking-wider">
              {copiedKey === 'partner' ? copy.copied : copy.copy}
            </button>
          </div>

          <div className="rounded-2xl p-4 bg-white/75 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700 space-y-3">
            <p className="text-sm font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-300">{copy.forFamily}</p>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">{familyCheckin}</p>
            <button onClick={() => copyToClipboard(familyCheckin, 'family')} className="px-3 py-2 rounded-full bg-cyan-600 text-white text-[11px] font-black uppercase tracking-wider">
              {copiedKey === 'family' ? copy.copied : copy.copy}
            </button>
          </div>
        </div>
      </section>
        </LunaPageContentSection>
      </div>
    </section>
  );
};
