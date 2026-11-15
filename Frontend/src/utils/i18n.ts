import React, { createContext, useContext, useState, useEffect } from 'react';

export type LanguageCode = 'en' | 'te' | 'hi';

export const LANGUAGE_LABELS: Record<LanguageCode, { short: string; native: string }> = {
  en: { short: 'EN', native: 'English' },
  te: { short: 'తె', native: 'తెలుగు' },
  hi: { short: 'हि', native: 'हिन्दी' },
};

const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  en: {
    app_tagline: 'Log every bite. Stay on track.',
    nav_dashboard: 'Dashboard',
    nav_add_entry: 'Add Entry',
    nav_calendar: 'Calendar',
    nav_reports: 'Reports',
    nav_weight: 'Weight & Goals',
    nav_settings: 'Settings',
    nav_more: 'More',
    sign_in: 'Sign In',
    calories: 'Calories',
    protein: 'Protein',
    carbs: 'Carbs',
    fats: 'Fats',
    fiber: 'Fiber',
    left: 'left',
    of: 'of',
    todays_meals: "TODAY'S MEALS",
    no_meals_today: 'No meals logged today yet.',
    open_camera: 'Open Camera',
    upload_image: 'Upload Image',
    food_plate: 'Food Plate',
    protein_packet: 'Protein Bar / Packet',
    browse_dishes: 'Browse Dishes',
    log_which_meal: 'LOG FOR WHICH MEAL?',
    confirm_intake: 'CONFIRM INTAKE VALUES',
    auto_log: 'Auto-Log',
    breakfast: 'Breakfast',
    morning_snacks: 'Morning Snacks',
    lunch: 'Lunch',
    evening_snacks: 'Evening Snacks',
    dinner: 'Dinner',
    midnight_craving: 'Midnight Craving',
    plate_size: '1. Plate Size',
    cooking_style: '2. Cooking Style',
    small: 'Small',
    medium: 'Medium',
    large: 'Large',
    lean: 'Lean / Steamed',
    home_style: 'Home Style',
    restaurant: 'Restaurant / Rich',
    health_benefits: '🌿 Health Benefits & Nutrition Insight',
    health_advisory: '⚠️ Health Advisory: Take in Small Portions',
    mixed_with: 'Mixed With (Liquid):',
    water: '💧 Water',
    milk: '🥛 Milk',
    skim_milk: '🥛 Skim Milk',
    date_time: 'Date & Time',
  },
  te: {
    app_tagline: 'ప్రతి ముద్దను లెక్కించండి. ఆరోగ్యంగా ఉండండి.',
    nav_dashboard: 'డ్యాష్‌బోర్డ్',
    nav_add_entry: 'భోజనం చేర్చు',
    nav_calendar: 'క్యాలెండర్',
    nav_reports: 'నివేదికలు',
    nav_weight: 'బరువు & లక్ష్యాలు',
    nav_settings: 'సెట్టింగ్‌లు',
    nav_more: 'మరిన్ని',
    sign_in: 'సైన్ ఇన్',
    calories: 'కేలరీలు',
    protein: 'ప్రోటీన్',
    carbs: 'కార్బ్స్',
    fats: 'కొవ్వులు',
    fiber: 'ఫైబర్',
    left: 'మిగిలింది',
    of: 'లో',
    todays_meals: 'నేటి భోజనాలు',
    no_meals_today: 'ఈరోజు ఇంకా భోజనం నమోదు కాలేదు.',
    open_camera: 'కెమెరా తెరవండి',
    upload_image: 'ఫోటో అప్‌లోడ్',
    food_plate: 'భోజన ప్లేట్',
    protein_packet: 'ప్రోటీన్ బార్ / పౌడర్',
    browse_dishes: 'వంటకాలు చూడండి',
    log_which_meal: 'ఏ భోజనం కోసం?',
    confirm_intake: 'పోషక విలువలు నిర్ధారించండి',
    auto_log: 'నమోదు చేయండి',
    breakfast: 'టిఫిన్ / అల్పాహారం',
    morning_snacks: 'ఉదయం స్నాక్స్',
    lunch: 'మధ్యాహ్న భోజనం',
    evening_snacks: 'సాయంత్రం స్నాక్స్',
    dinner: 'రాత్రి భోజనం',
    midnight_craving: 'అర్ధరాత్రి ఆహారం',
    plate_size: '1. ప్లేట్ పరిమాణం',
    cooking_style: '2. వంట విధానం',
    small: 'చిన్నది',
    medium: 'మధ్యస్థం',
    large: 'పెద్దది',
    lean: 'ఆవిరి / తక్కువ నూనె',
    home_style: 'ఇంటి వంట',
    restaurant: 'హోటల్ / ఎక్కువ నూనె',
    health_benefits: '🌿 ఆరోగ్య ప్రయోజనాలు & పోషక సమాచారం',
    health_advisory: '⚠️ ఆరోగ్య సూచన: తక్కువ మోతాదులో తీసుకోండి',
    mixed_with: 'కలిపిన ద్రవం:',
    water: '💧 నీరు',
    milk: '🥛 పాలు',
    skim_milk: '🥛 స్కిమ్ పాలు',
    date_time: 'తేదీ & సమయం',
  },
  hi: {
    app_tagline: 'हर निवाले को ट्रैक करें। स्वस्थ रहें।',
    nav_dashboard: 'डैशबोर्ड',
    nav_add_entry: 'भोजन जोड़ें',
    nav_calendar: 'कैलेंडर',
    nav_reports: 'रिपोर्ट्स',
    nav_weight: 'वज़न और लक्ष्य',
    nav_settings: 'सेटिंग्स',
    nav_more: 'अधिक',
    sign_in: 'साइन इन',
    calories: 'कैलोरी',
    protein: 'प्रोटीन',
    carbs: 'कार्ब्स',
    fats: 'फैट्स',
    fiber: 'फाइबर',
    left: 'बाकी',
    of: 'में से',
    todays_meals: 'आज का भोजन',
    no_meals_today: 'आज अभी तक कोई भोजन दर्ज नहीं है।',
    open_camera: 'कैमरा खोलें',
    upload_image: 'फोटो अपलोड करें',
    food_plate: 'भोजन की थाली',
    protein_packet: 'प्रोटीन बार / पाउडर',
    browse_dishes: 'व्यंजन देखें',
    log_which_meal: 'किस भोजन के लिए?',
    confirm_intake: 'पोषण मान की पुष्टि करें',
    auto_log: 'लॉग करें',
    breakfast: 'नाश्ता',
    morning_snacks: 'सुबह का स्नैक',
    lunch: 'दोपहर का भोजन',
    evening_snacks: 'शाम का स्नैक',
    dinner: 'रात का खाना',
    midnight_craving: 'देर रात का खाना',
    plate_size: '1. प्लेट का आकार',
    cooking_style: '2. पकाने का तरीका',
    small: 'छोटी',
    medium: 'मध्यम',
    large: 'बड़ी',
    lean: 'उबला / कम तेल',
    home_style: 'घर का बना',
    restaurant: 'रेस्टोरेंट / ज़्यादा तेल',
    health_benefits: '🌿 स्वास्थ्य लाभ और पोषण जानकारी',
    health_advisory: '⚠️ स्वास्थ्य सलाह: कम मात्रा में ही लें',
    mixed_with: 'किसमें मिलाया (तरल):',
    water: '💧 पानी',
    milk: '🥛 दूध',
    skim_milk: '🥛 स्किम दूध',
    date_time: 'तारीख और समय',
  },
};

interface LanguageContextValue {
  lang: LanguageCode;
  setLang: (l: LanguageCode) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  setLang: () => {},
  t: (key) => TRANSLATIONS.en[key] || key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('bitelog_lang') as LanguageCode | null;
    return saved && ['en', 'te', 'hi'].includes(saved) ? saved : 'en';
  });

  const setLang = (newLang: LanguageCode) => {
    setLangState(newLang);
    localStorage.setItem('bitelog_lang', newLang);
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key: string): string => {
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en[key] || key;
  };

  return React.createElement(
    LanguageContext.Provider,
    { value: { lang, setLang, t } },
    children
  );
};

export const useLanguage = () => useContext(LanguageContext);
