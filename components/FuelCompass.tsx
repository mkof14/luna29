
import React, { useState, useMemo } from 'react';
import { CyclePhase, HealthEvent } from '../types';
import { FUEL_DATA, TRANSLATIONS, Language, LangCopy, getLang } from '../constants';
import { dataService } from '../services/dataService';
import { generateCulinaryInsight } from '../services/geminiService';

interface FuelCompassProps {
  phase: CyclePhase;
  lang: Language;
}

export const FuelCompass: React.FC<FuelCompassProps> = ({ phase, lang }) => {
  const data = FUEL_DATA[phase];
  const ui = TRANSLATIONS[lang];
  const phaseByLang: LangCopy< Record<CyclePhase, string>> = {
    en: { Menstrual: 'Menstrual', Follicular: 'Follicular', Ovulatory: 'Ovulatory', Luteal: 'Luteal' },
    ru: { Menstrual: 'Менструальная', Follicular: 'Фолликулярная', Ovulatory: 'Овуляторная', Luteal: 'Лютеиновая' },
    uk: { Menstrual: 'Менструальна', Follicular: 'Фолікулярна', Ovulatory: 'Овуляторна', Luteal: 'Лютеїнова' },
    es: { Menstrual: 'Menstrual', Follicular: 'Folicular', Ovulatory: 'Ovulatoria', Luteal: 'Lútea' },
    fr: { Menstrual: 'Menstruelle', Follicular: 'Folliculaire', Ovulatory: 'Ovulatoire', Luteal: 'Lutéale' },
    de: { Menstrual: 'Menstruell', Follicular: 'Follikulär', Ovulatory: 'Ovulatorisch', Luteal: 'Luteal' },
    zh: { Menstrual: '经期', Follicular: '卵泡期', Ovulatory: '排卵期', Luteal: '黄体期' },
    ja: { Menstrual: '月経期', Follicular: '卵胞期', Ovulatory: '排卵期', Luteal: '黄体期' },
    pt: { Menstrual: 'Menstrual', Follicular: 'Folicular', Ovulatory: 'Ovulatória', Luteal: 'Lútea' },
  ar: { Menstrual: 'الحيض', Follicular: 'الجُريبية', Ovulatory: 'الإباضة', Luteal: 'الأصفرية' },
  he: { Menstrual: 'וסת', Follicular: 'פוליקולרי', Ovulatory: 'ביוץ', Luteal: 'לוטאי' },};
  const phaseLabel = getLang(phaseByLang, lang)[phase] || phase;
  const reasonByLang: LangCopy< Record<CyclePhase, string>> = {
    en: {
      Menstrual: 'Your body is renewing itself. Focus on warmth and minerals.',
      Follicular: 'Energy is rising. Support your body with fiber and fresh foods.',
      Ovulatory: 'Your energy is at its peak. Stay hydrated and eat healthy fats.',
      Luteal: 'Your body is slowing down. Focus on steady energy and calming minerals.'
    },
    ru: {
      Menstrual: 'Тело обновляется. Делайте акцент на тепле и минералах.',
      Follicular: 'Энергия растет. Поддержите тело клетчаткой и свежими продуктами.',
      Ovulatory: 'Энергия на пике. Держите водный баланс и добавляйте полезные жиры.',
      Luteal: 'Тело замедляется. Нужны стабильная энергия и успокаивающие минералы.'
    },
    uk: {
      Menstrual: 'Тіло оновлюється. Зосередьтесь на теплі та мінералах.',
      Follicular: 'Енергія зростає. Підтримайте тіло клітковиною та свіжою їжею.',
      Ovulatory: 'Енергія на піку. Пийте достатньо води та додавайте корисні жири.',
      Luteal: 'Тіло сповільнюється. Потрібні стабільна енергія та заспокійливі мінерали.'
    },
    es: {
      Menstrual: 'Tu cuerpo se está renovando. Prioriza calor y minerales.',
      Follicular: 'La energía está subiendo. Apoya tu cuerpo con fibra y alimentos frescos.',
      Ovulatory: 'Tu energía está en su punto máximo. Hidrátate y consume grasas saludables.',
      Luteal: 'Tu cuerpo se desacelera. Enfócate en energía estable y minerales calmantes.'
    },
    fr: {
      Menstrual: 'Votre corps se renouvelle. Priorisez chaleur et minéraux.',
      Follicular: "L'énergie monte. Soutenez votre corps avec fibres et aliments frais.",
      Ovulatory: "Votre énergie est au pic. Hydratez-vous et privilégiez les bons lipides.",
      Luteal: 'Votre corps ralentit. Visez une énergie stable et des minéraux apaisants.'
    },
    de: {
      Menstrual: 'Dein Körper erneuert sich. Fokus auf Wärme und Mineralstoffe.',
      Follicular: 'Die Energie steigt. Unterstütze deinen Körper mit Ballaststoffen und frischen Lebensmitteln.',
      Ovulatory: 'Deine Energie ist auf dem Höhepunkt. Trinke genug und iss gesunde Fette.',
      Luteal: 'Dein Körper wird langsamer. Fokus auf stabile Energie und beruhigende Mineralstoffe.'
    },
    zh: {
      Menstrual: '身体正在更新。重点补充温热食物和矿物质。',
      Follicular: '能量正在上升。用膳食纤维和新鲜食物支持身体。',
      Ovulatory: '你的能量达到高峰。注意补水并摄入健康脂肪。',
      Luteal: '身体开始放慢节奏。关注稳定能量和镇静型矿物质。'
    },
    ja: {
      Menstrual: '体はリニューアル中。温かさとミネラルを重視しましょう。',
      Follicular: 'エネルギーが上昇中。食物繊維と新鮮な食材でサポート。',
      Ovulatory: 'エネルギーはピーク。しっかり水分補給し、良質な脂質を。',
      Luteal: '体はゆるやかに減速。安定したエネルギーと鎮静系ミネラルを。'
    },
    pt: {
      Menstrual: 'Seu corpo está se renovando. Foque em calor e minerais.',
      Follicular: 'A energia está subindo. Apoie seu corpo com fibras e alimentos frescos.',
      Ovulatory: 'Sua energia está no auge. Hidrate-se e inclua gorduras saudáveis.',
      Luteal: 'Seu corpo desacelera. Foque em energia estável e minerais calmantes.'
    },
  ar: {
      Menstrual: 'جسمكِ يتجدّد. ركّزي على الدفء والمعادن.',
      Follicular: 'طاقتكِ ترتفع. ادعمي جسمكِ بالألياف والأطعمة الطازجة.',
      Ovulatory: 'طاقتكِ في ذروتها. حافظي على الترطيب وتناولي الدهون الصحية.',
      Luteal: 'جسمكِ يبطئ. ركّزي على طاقة ثابتة ومعادن مهدّئة.'
    },
  he: {
      Menstrual: 'הגוף שלך מתחדש. התמקדי בחום ומינרלים.',
      Follicular: 'האנרגיה עולה. תמכי בגוף עם סיבים ומזון טרי.',
      Ovulatory: 'האנרגיה בשיא. שמרי על הידרציה ואכלי שומנים בריאים.',
      Luteal: 'הגוף מאט. התמקדי באנרגיה יציבה ומינרלים מרגיעים.'
    },};
  const tokenMapByLang: LangCopy< Record<string, string>> = {
    en: {},
    ru: { Iron: 'Железо', Zinc: 'Цинк', 'Warm Soups': 'Теплые супы', 'Vitamin C': 'Витамин C', Magnesium: 'Магний', 'Cold Drinks': 'Холодные напитки', 'Too much Caffeine': 'Много кофеина', Sugar: 'Сахар', 'Salty Snacks': 'Соленые снеки', 'Vitamin B12': 'Витамин B12', 'Lentils or Red Meat': 'Чечевица или красное мясо', 'Spinach & Kale': 'Шпинат и кейл', Beets: 'Свекла', 'Warm Broth': 'Теплый бульон', 'Dark Chocolate': 'Темный шоколад', Seaweed: 'Морские водоросли', Beans: 'Бобовые', 'Warm herbal tea': 'Теплый травяной чай', 'Gentle warmth': 'Мягкое тепло', 'Slow breathing': 'Медленное дыхание', 'Stay hydrated': 'Поддерживать гидратацию', 'B-Vitamins': 'Витамины группы B', 'Fresh Veggies': 'Свежие овощи', Probiotics: 'Пробиотики', 'Vitamin E': 'Витамин E', Folate: 'Фолат', Alcohol: 'Алкоголь', 'Heavy Fats': 'Тяжелые жиры', 'Heavy Dairy': 'Тяжелая молочка', CoQ10: 'Коэнзим Q10', Selenium: 'Селен', 'Kimchi or Kraut': 'Кимчи или квашеная капуста', Kefir: 'Кефир', 'Broccoli & Cauliflower': 'Брокколи и цветная капуста', Seeds: 'Семена', Citrus: 'Цитрусовые', 'Chicken or Fish': 'Курица или рыба', Nuts: 'Орехи', 'Try something creative': 'Сделать что-то творческое', 'Lemon water': 'Вода с лимоном', 'Morning sun': 'Утреннее солнце', 'Start a new habit': 'Начать новую привычку', 'Omega-3': 'Омега-3', Fiber: 'Клетчатка', 'Healthy Fats': 'Полезные жиры', Hydration: 'Гидратация', 'Vitamin A': 'Витамин A', 'Too much Salt': 'Много соли', 'Fried Foods': 'Жареная еда', 'White Bread': 'Белый хлеб', NAC: 'NAC', 'Vitamin D3': 'Витамин D3', Antioxidants: 'Антиоксиданты', Salmon: 'Лосось', Avocado: 'Авокадо', Quinoa: 'Киноа', Berries: 'Ягоды', Sprouts: 'Проростки', Peppers: 'Перец', 'Flax Seeds': 'Семена льна', Walnuts: 'Грецкие орехи', 'Dinner with friends': 'Ужин с друзьями', 'Active movement': 'Активное движение', 'Cool showers': 'Прохладный душ', 'Talk and connect': 'Общение и контакт', 'Slow Carbs': 'Медленные углеводы', Calcium: 'Кальций', 'Vitamin B6': 'Витамин B6', 'White Flour': 'Белая мука', Stimulants: 'Стимуляторы', 'Late-night Snacks': 'Поздние перекусы', Inositol: 'Инозитол', 'GABA support': 'Поддержка GABA', 'Roasted Veggies': 'Запеченные овощи', Oats: 'Овсянка', Bananas: 'Бананы', 'Sesame Seeds': 'Кунжут', 'Sunflower Seeds': 'Семечки подсолнечника', 'Tofu or Beef': 'Тофу или говядина', Spinach: 'Шпинат', 'Peppermint Tea': 'Мятный чай', 'Early screen-off': 'Ранний отказ от экранов', Journaling: 'Дневник', 'Warm baths': 'Теплые ванны', 'Keep things simple': 'Упростить день' },
    uk: {},
    es: {},
    fr: {},
    de: {},
    zh: {},
    ja: {},
    pt: {},
  ar: {},
  he: {},};
  const tokenMap = getLang(tokenMapByLang, lang);
  const wordMapByLang: LangCopy< Record<string, string>> = {
    en: {},
    ru: {},
    uk: { Warm: 'Теплі', Soups: 'супи', Vitamin: 'Вітамін', Fresh: 'Свіжі', Veggies: 'овочі', Healthy: 'Корисні', Fats: 'жири', Foods: 'продукти', Hydration: 'Гідратація', Stress: 'Стрес', Sleep: 'Сон', Energy: 'Енергія', Tea: 'чай', Water: 'вода', Seeds: 'насіння', Fish: 'риба', Nuts: 'горіхи', Fiber: 'Клітковина', Magnesium: 'Магній', Calcium: 'Кальцій', Protein: 'Білок', Sugar: 'Цукор', Salt: 'Сіль' },
    es: { Warm: 'Calientes', Soups: 'sopas', Vitamin: 'Vitamina', Fresh: 'Frescas', Veggies: 'verduras', Healthy: 'Saludables', Fats: 'grasas', Foods: 'alimentos', Hydration: 'Hidratación', Stress: 'Estrés', Sleep: 'Sueño', Energy: 'Energía', Tea: 'té', Water: 'agua', Seeds: 'semillas', Fish: 'pescado', Nuts: 'frutos secos', Fiber: 'Fibra', Magnesium: 'Magnesio', Calcium: 'Calcio', Protein: 'Proteína', Sugar: 'Azúcar', Salt: 'Sal' },
    fr: { Warm: 'Chaudes', Soups: 'soupes', Vitamin: 'Vitamine', Fresh: 'Frais', Veggies: 'légumes', Healthy: 'Sains', Fats: 'lipides', Foods: 'aliments', Hydration: 'Hydratation', Stress: 'Stress', Sleep: 'Sommeil', Energy: 'Énergie', Tea: 'thé', Water: 'eau', Seeds: 'graines', Fish: 'poisson', Nuts: 'noix', Fiber: 'Fibres', Magnesium: 'Magnésium', Calcium: 'Calcium', Protein: 'Protéine', Sugar: 'Sucre', Salt: 'Sel' },
    de: { Warm: 'Warme', Soups: 'Suppen', Vitamin: 'Vitamin', Fresh: 'Frisches', Veggies: 'Gemüse', Healthy: 'Gesunde', Fats: 'Fette', Foods: 'Lebensmittel', Hydration: 'Hydration', Stress: 'Stress', Sleep: 'Schlaf', Energy: 'Energie', Tea: 'Tee', Water: 'Wasser', Seeds: 'Samen', Fish: 'Fisch', Nuts: 'Nüsse', Fiber: 'Ballaststoffe', Magnesium: 'Magnesium', Calcium: 'Kalzium', Protein: 'Protein', Sugar: 'Zucker', Salt: 'Salz' },
    zh: { Warm: '温热', Soups: '汤', Vitamin: '维生素', Fresh: '新鲜', Veggies: '蔬菜', Healthy: '健康', Fats: '脂肪', Foods: '食物', Hydration: '补水', Stress: '压力', Sleep: '睡眠', Energy: '能量', Tea: '茶', Water: '水', Seeds: '种子', Fish: '鱼', Nuts: '坚果', Fiber: '纤维', Magnesium: '镁', Calcium: '钙', Protein: '蛋白质', Sugar: '糖', Salt: '盐' },
    ja: { Warm: '温かい', Soups: 'スープ', Vitamin: 'ビタミン', Fresh: '新鮮な', Veggies: '野菜', Healthy: '良質な', Fats: '脂質', Foods: '食品', Hydration: '水分補給', Stress: 'ストレス', Sleep: '睡眠', Energy: 'エネルギー', Tea: 'お茶', Water: '水', Seeds: '種子', Fish: '魚', Nuts: 'ナッツ', Fiber: '食物繊維', Magnesium: 'マグネシウム', Calcium: 'カルシウム', Protein: 'たんぱく質', Sugar: '糖', Salt: '塩' },
    pt: { Warm: 'Quentes', Soups: 'sopas', Vitamin: 'Vitamina', Fresh: 'Frescos', Veggies: 'vegetais', Healthy: 'Saudáveis', Fats: 'gorduras', Foods: 'alimentos', Hydration: 'Hidratação', Stress: 'Estresse', Sleep: 'Sono', Energy: 'Energia', Tea: 'chá', Water: 'água', Seeds: 'sementes', Fish: 'peixe', Nuts: 'nozes', Fiber: 'Fibra', Magnesium: 'Magnésio', Calcium: 'Cálcio', Protein: 'Proteína', Sugar: 'Açúcar', Salt: 'Sal' },
  ar: { Warm: 'دافئة', Soups: 'حساء', Vitamin: 'فيتامين', Fresh: 'طازجة', Veggies: 'خضار', Healthy: 'صحية', Fats: 'دهون', Foods: 'أطعمة', Hydration: 'ترطيب', Stress: 'توتر', Sleep: 'نوم', Energy: 'طاقة', Tea: 'شاي', Water: 'ماء', Seeds: 'بذور', Fish: 'سمك', Nuts: 'مكسرات', Fiber: 'ألياف', Magnesium: 'مغنيسيوم', Calcium: 'كالسيوم', Protein: 'بروتين', Sugar: 'سكر', Salt: 'ملح' },
  he: { Warm: 'חמות', Soups: 'מרקים', Vitamin: 'ויטמין', Fresh: 'טריים', Veggies: 'ירקות', Healthy: 'בריאים', Fats: 'שומנים', Foods: 'מזונות', Hydration: 'הידרציה', Stress: 'לחץ', Sleep: 'שינה', Energy: 'אנרגיה', Tea: 'תה', Water: 'מים', Seeds: 'זרעים', Fish: 'דג', Nuts: 'אגוזים', Fiber: 'סיבים', Magnesium: 'מגנזיום', Calcium: 'סידן', Protein: 'חלבון', Sugar: 'סוכר', Salt: 'מלח' },};
  const tItem = (item: string) => {
    if (tokenMap[item]) return tokenMap[item];
    if (lang === 'en' || lang === 'ru') return item;
    return item
      .split(/(\s+|&|-|\/|,)/)
      .map((part) => getLang(wordMapByLang, lang)[part] || part)
      .join('');
  };
  const copyByLang: LangCopy< { done: string; mealIdea: string; mealHint: string; thinking: string; generate: string; suggestion: string; reset: string }> = {
    en: { done: 'Done', mealIdea: 'Meal Idea', mealHint: `Get a meal idea that fits your ${phaseLabel} phase.`, thinking: 'Thinking...', generate: 'Generate Recipe', suggestion: "Luna29's Suggestion", reset: 'Reset' },
    ru: { done: 'Готово', mealIdea: 'Идея для обеда', mealHint: `Получите идею питания для ${phaseLabel} фазы.`, thinking: 'Думаю...', generate: 'Создать рецепт', suggestion: 'Рекомендация Luna29', reset: 'Сбросить' },
    uk: { done: 'Готово', mealIdea: 'Ідея для обіду', mealHint: `Отримайте ідею харчування для ${phaseLabel} фази.`, thinking: 'Думаю...', generate: 'Створити рецепт', suggestion: 'Пропозиція Luna29', reset: 'Скинути' },
    es: { done: 'Hecho', mealIdea: 'Idea de comida', mealHint: `Obtén una idea de comida para la fase ${phaseLabel}.`, thinking: 'Pensando...', generate: 'Generar receta', suggestion: 'Sugerencia de Luna29', reset: 'Reiniciar' },
    fr: { done: 'Fait', mealIdea: 'Idée repas', mealHint: `Obtenez une idée de repas pour la phase ${phaseLabel}.`, thinking: 'Réflexion...', generate: 'Générer une recette', suggestion: 'Suggestion de Luna29', reset: 'Réinitialiser' },
    de: { done: 'Erledigt', mealIdea: 'Essensidee', mealHint: `Erhalte eine Essensidee für die ${phaseLabel}-Phase.`, thinking: 'Denke...', generate: 'Rezept erstellen', suggestion: 'Luna29 Vorschlag', reset: 'Zurücksetzen' },
    zh: { done: '完成', mealIdea: '餐食建议', mealHint: `获取适合${phaseLabel}的餐食建议。`, thinking: '思考中...', generate: '生成食谱', suggestion: 'Luna29 建议', reset: '重置' },
    ja: { done: '完了', mealIdea: '食事アイデア', mealHint: `${phaseLabel}に合う食事アイデアを取得します。`, thinking: '考え中...', generate: 'レシピ生成', suggestion: 'Luna29の提案', reset: 'リセット' },
    pt: { done: 'Concluído', mealIdea: 'Ideia de refeição', mealHint: `Receba uma ideia de refeição para a fase ${phaseLabel}.`, thinking: 'Pensando...', generate: 'Gerar receita', suggestion: 'Sugestão da Luna29', reset: 'Redefinir' },
  ar: { done: 'تم', mealIdea: 'فكرة وجبة', mealHint: `احصلي على فكرة وجبة تناسب مرحلة ${phaseLabel}.`, thinking: 'أفكّر...', generate: 'إنشاء وصفة', suggestion: 'اقتراح Luna29', reset: 'إعادة ضبط' },
  he: { done: 'בוצע', mealIdea: 'רעיון לארוחה', mealHint: `קבלי רעיון לארוחה שמתאים לשלב ${phaseLabel}.`, thinking: 'חושבת...', generate: 'יצירת מתכון', suggestion: 'הצעה של Luna29', reset: 'איפוס' },};
  const copy = getLang(copyByLang, lang);
  type FuelCategoryKey = keyof typeof ui.fuel.categories;
  
  const [log, setLog] = useState(() => dataService.getLog());
  const state = dataService.projectState(log);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiRecipe, setAiRecipe] = useState<string | null>(null);
  const [showFullProtocol, setShowFullProtocol] = useState(false);

  const nutrientsConsumed = useMemo(() => {
    return state.fuelLogs || [];
  }, [state.fuelLogs]);

  const toggleNutrient = (nutrient: string) => {
    dataService.logEvent('FUEL_LOG', { nutrient });
    setLog(dataService.getLog());
    if ('vibrate' in navigator) navigator.vibrate(10);
  };

  const handleGenerateRecipe = async () => {
    setIsGenerating(true);
    try {
      const recipe = await generateCulinaryInsight(phase, data.priorities, state.profile.sensitivities, lang);
      setAiRecipe(recipe || "A balanced meal suggestion is being prepared.");
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const allItems = [
    ...data.protocol.micronutrients,
    ...data.protocol.foods,
    ...data.protocol.ritual
  ];

  const totalPossible = allItems.length;
  const totalConsumed = allItems.filter(item => nutrientsConsumed.includes(item)).length;
  const progress = Math.min(100, (totalConsumed / totalPossible) * 100);
  const getFuelCategoryLabel = (key: string) => {
    if (key in ui.fuel.categories) {
      return ui.fuel.categories[key as FuelCategoryKey];
    }
    return key;
  };

  return (
    <div className="bg-white dark:bg-[#071631] p-8 md:p-12 rounded-[4rem] shadow-luna-rich border-2 border-slate-200 dark:border-[#2a4670] space-y-12 animate-in fade-in duration-700 relative overflow-hidden group">
      {/* Background layer to give depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-50/30 to-indigo-50/30 dark:from-slate-900 dark:to-slate-900 pointer-events-none" />
      
      <header className="flex justify-between items-start relative z-10">
        <div className="space-y-2">
          <h3 className="text-3xl font-black uppercase tracking-tight leading-none text-slate-900 dark:text-white">{ui.fuel.title}</h3>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">{ui.fuel.subtitle}</p>
        </div>
        <div className="relative w-16 h-16 flex items-center justify-center bg-white dark:bg-[#0d2146] rounded-2xl shadow-luna border border-slate-100 dark:border-[#2a4670]">
           <svg className="w-12 h-12 -rotate-90">
             <circle cx="50%" cy="50%" r="40%" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-100 dark:text-slate-800" />
             <circle cx="50%" cy="50%" r="40%" fill="none" stroke="#ff5a40" strokeWidth="3" strokeDasharray="100" strokeDashoffset={100 - progress} strokeLinecap="round" className="transition-all duration-1000" />
           </svg>
           <span className="absolute text-lg">🍎</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
        <div className="space-y-8">
          <div className="flex justify-between items-end border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="text-[10px] font-black uppercase text-luna-teal tracking-[0.2em]">{ui.fuel.priorities}</h4>
            <span className="text-[9px] font-black uppercase text-slate-400">{totalConsumed} / {totalPossible} {copy.done}</span>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {data.priorities.map((item, i) => {
              const isFueled = nutrientsConsumed.includes(item);
              return (
                <button 
                  key={i} 
                  onClick={() => toggleNutrient(item)}
                  className={`px-5 py-3 rounded-full text-xs font-bold border-2 transition-all active:scale-95 flex items-center gap-3 ${
                    isFueled 
                      ? 'bg-luna-teal border-luna-teal text-white shadow-lg shadow-luna-teal/30' 
                      : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-luna-teal/40 shadow-sm'
                  }`}
                >
                  {isFueled && <span className="text-[10px]">✓</span>}
                  {tItem(item)}
                </button>
              );
            })}
          </div>
          
          <div className="p-8 bg-slate-100/50 dark:bg-slate-950 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-luna-inset">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 italic leading-relaxed">
               "{getLang(reasonByLang, lang)[phase] || data.reason}"
            </p>
          </div>

          <button 
            onClick={() => setShowFullProtocol(!showFullProtocol)}
            className="w-full py-5 border-2 border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between px-8 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
          >
            {ui.fuel.fullProtocol}
            <span className={`transition-transform duration-300 ${showFullProtocol ? 'rotate-180' : ''}`}>▼</span>
          </button>

          {showFullProtocol && (
            <div className="space-y-10 animate-in slide-in-from-top-4 duration-500">
               {Object.entries(data.protocol).map(([key, items]) => (
                 <div key={key} className="space-y-4">
                    <h5 className="text-[9px] font-black uppercase text-slate-400 tracking-[0.3em]">
                      {getFuelCategoryLabel(key)}
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(items as string[]).map((item, idx) => {
                        const isFueled = nutrientsConsumed.includes(item);
                        return (
                          <button 
                            key={idx}
                            onClick={() => toggleNutrient(item)}
                            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left shadow-sm ${
                              isFueled 
                                ? 'bg-luna-purple/5 border-luna-purple/30 text-luna-purple font-bold' 
                                : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 text-[11px] font-medium'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${isFueled ? 'bg-luna-purple border-luna-purple text-white shadow-inner' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'}`}>
                              {isFueled && <span className="text-[10px]">✓</span>}
                            </div>
                            <span className="text-[11px] truncate">{tItem(item)}</span>
                          </button>
                        );
                      })}
                    </div>
                 </div>
               ))}
            </div>
          )}
        </div>

        <div className="space-y-8">
          <h4 className="text-[10px] font-black uppercase text-rose-500 tracking-[0.2em] border-b border-rose-100 pb-3">{copy.mealIdea}</h4>
          
          {!aiRecipe ? (
            <div className="h-full flex flex-col justify-center items-center gap-8 p-12 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-[3rem] text-center bg-slate-50/30 dark:bg-slate-900/40">
              <p className="text-sm font-bold text-slate-400 italic max-w-xs">{copy.mealHint}</p>
              <button 
                onClick={handleGenerateRecipe}
                disabled={isGenerating}
                className="px-10 py-5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-black uppercase tracking-widest rounded-full hover:scale-105 active:scale-95 transition-all shadow-luna-deep disabled:opacity-30 flex items-center gap-4"
              >
                {isGenerating ? (
                   <>
                     <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                     {copy.thinking}
                   </>
                ) : (
                  copy.generate
                )}
              </button>
            </div>
          ) : (
            <div className="bg-slate-950 dark:bg-[#0a1d40] text-white dark:text-slate-100 p-10 rounded-[3rem] shadow-luna-deep animate-in zoom-in-95 duration-500 space-y-8 relative overflow-hidden group/recipe">
               <div className="absolute top-0 right-0 p-8 opacity-10 text-7xl group-hover/recipe:rotate-12 transition-transform">🥗</div>
               <div className="space-y-4 relative z-10">
                 <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40">{copy.suggestion}</p>
                 <div className="text-2xl font-black leading-tight italic tracking-tight whitespace-pre-line">
                   {aiRecipe}
                 </div>
               </div>
               <button 
                 onClick={() => setAiRecipe(null)}
                 className="text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity border-b border-current pb-1"
               >
                 {copy.reset}
               </button>
            </div>
          )}

          <div className="space-y-5 pt-4">
             <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">{ui.fuel.avoid}</h4>
             <div className="flex flex-wrap gap-3">
                {data.avoid.map((item, i) => (
                  <span key={i} className="px-5 py-2.5 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-full text-[10px] font-black border-2 border-rose-100/50 dark:border-rose-900/40 shadow-sm uppercase tracking-widest">
                    {tItem(item)}
                  </span>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
