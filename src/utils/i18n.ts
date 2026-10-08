// 7-Language Client-Side i18n Localization Engine for Arcadex
// Supports instant language switching with 0% server reload

export type LanguageCode = 'en' | 'bn' | 'es' | 'fr' | 'de' | 'hi' | 'ar';

export interface LanguageMeta {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', dir: 'ltr' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩', dir: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', dir: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', dir: 'rtl' },
];

export interface TranslationDict {
  searchPlaceholder: string;
  allGames: string;
  actionCombat: string;
  puzzleLogic: string;
  arcadeSkill: string;
  retroClassic: string;
  strategyBrain: string;
  wordTrivia: string;
  favorites: string;
  trending: string;
  newReleases: string;
  submitGame: string;
  playNow: string;
  loadMore: string;
  multiplayerP2P: string;
  ambientGlow: string;
  aspectRatio: string;
  takeScreenshot: string;
  offlineReady: string;
  controlsGuide: string;
  howToPlay: string;
  features: string;
  relatedGames: string;
  share: string;
  copied: string;
  fullscreen: string;
  restart: string;
  like: string;
  dislike: string;
  serverLoadZero: string;
}

export const TRANSLATIONS: Record<LanguageCode, TranslationDict> = {
  en: {
    searchPlaceholder: 'Search Stickman, Mecha Blaster, Hextris, Dino...',
    allGames: 'All Games',
    actionCombat: 'Action & Combat',
    puzzleLogic: 'Puzzle & Logic',
    arcadeSkill: 'Arcade & Skill',
    retroClassic: 'Retro & Classic',
    strategyBrain: 'Strategy & Brain',
    wordTrivia: 'Word & Trivia',
    favorites: 'Favorites',
    trending: 'Trending Now',
    newReleases: 'New Releases',
    submitGame: 'Submit Game',
    playNow: 'Play Game',
    loadMore: 'Load More Games',
    multiplayerP2P: 'P2P Multiplayer',
    ambientGlow: 'Ambient Glow',
    aspectRatio: 'Aspect Ratio',
    takeScreenshot: 'Clip & Snap',
    offlineReady: '100% Offline Ready',
    controlsGuide: 'Controls Guide',
    howToPlay: 'How to Play',
    features: 'Game Features',
    relatedGames: 'Related Games',
    share: 'Share',
    copied: 'Copied!',
    fullscreen: 'Fullscreen',
    restart: 'Restart',
    like: 'Like',
    dislike: 'Dislike',
    serverLoadZero: '0% Server Load',
  },
  bn: {
    searchPlaceholder: '১,১১৫+ গেম খুঁজুন (যেমন: মেকা ব্লাস্টার, হেক্সট্রিস, ডাইনো)...',
    allGames: 'সব গেম',
    actionCombat: 'অ্যাকশন ও কম্ব্যাট',
    puzzleLogic: 'ধাঁধা ও লজিক',
    arcadeSkill: 'আর্কেড ও স্কিল',
    retroClassic: 'রেট্রো ও ক্লাসিক',
    strategyBrain: 'স্ট্র্যাটেজি ও ব্রেন',
    wordTrivia: 'ওয়ার্ড ও ট্রিভিয়া',
    favorites: 'পছন্দের গেম',
    trending: 'জনপ্রিয় ট্রেন্ডিং',
    newReleases: 'নতুন রিলিজ',
    submitGame: 'গেম সাবমিট করুন',
    playNow: 'প্লে করুন',
    loadMore: 'আরও গেম দেখুন',
    multiplayerP2P: 'পি২পি মাল্টিপ্লেয়ার',
    ambientGlow: 'অ্যাম্বিয়েন্ট গ্লো',
    aspectRatio: 'স্ক্রিন রেশিও',
    takeScreenshot: 'স্ক্রিনশট নিন',
    offlineReady: '১০০% অফলাইন প্লে',
    controlsGuide: 'কন্ট্রোল গাইড',
    howToPlay: 'কীভাবে খেলবেন',
    features: 'গেমের বৈশিষ্ট্য',
    relatedGames: 'সম্পর্কিত গেমস',
    share: 'শেয়ার',
    copied: 'কপি হয়েছে!',
    fullscreen: 'ফুলস্ক্রিন',
    restart: 'রিস্টার্ট',
    like: 'পছন্দ',
    dislike: 'অপছন্দ',
    serverLoadZero: '০% সার্ভার লোড',
  },
  es: {
    searchPlaceholder: 'Buscar más de 1.115 juegos gratis...',
    allGames: 'Todos los Juegos',
    actionCombat: 'Acción y Combate',
    puzzleLogic: 'Puzles y Lógica',
    arcadeSkill: 'Arcade y Habilidad',
    retroClassic: 'Retro y Clásicos',
    strategyBrain: 'Estrategia y Mente',
    wordTrivia: 'Palabras y Trivia',
    favorites: 'Favoritos',
    trending: 'Tendencias',
    newReleases: 'Nuevos Lanzamientos',
    submitGame: 'Publicar Juego',
    playNow: 'Jugar Ahora',
    loadMore: 'Cargar Más Juegos',
    multiplayerP2P: 'Multijugador P2P',
    ambientGlow: 'Brillo Ambiental',
    aspectRatio: 'Relación de Aspecto',
    takeScreenshot: 'Captura de Pantalla',
    offlineReady: '100% Sin Conexión',
    controlsGuide: 'Guía de Controles',
    howToPlay: 'Cómo Jugar',
    features: 'Características',
    relatedGames: 'Juegos Relacionados',
    share: 'Compartir',
    copied: '¡Copiado!',
    fullscreen: 'Pantalla Completa',
    restart: 'Reiniciar',
    like: 'Me Gusta',
    dislike: 'No Me Gusta',
    serverLoadZero: '0% Carga de Servidor',
  },
  fr: {
    searchPlaceholder: 'Rechercher parmi 1 115+ jeux gratuits...',
    allGames: 'Tous les Jeux',
    actionCombat: 'Action & Combat',
    puzzleLogic: 'Puzzle & Logique',
    arcadeSkill: 'Arcade & Adresse',
    retroClassic: 'Rétro & Classique',
    strategyBrain: 'Stratégie & Réflexion',
    wordTrivia: 'Mots & Trivia',
    favorites: 'Favoris',
    trending: 'Tendances',
    newReleases: 'Nouveautés',
    submitGame: 'Publier un Jeu',
    playNow: 'Jouer',
    loadMore: 'Charger Plus de Jeux',
    multiplayerP2P: 'Multijoueur P2P',
    ambientGlow: 'Lumière Ambiante',
    aspectRatio: 'Format d\'Image',
    takeScreenshot: 'Capture d\'Écran',
    offlineReady: '100% Hors-Ligne',
    controlsGuide: 'Guide des Commandes',
    howToPlay: 'Comment Jouer',
    features: 'Fonctionnalités',
    relatedGames: 'Jeux Similaires',
    share: 'Partager',
    copied: 'Copié !',
    fullscreen: 'Plein Écran',
    restart: 'Recommencer',
    like: 'J\'aime',
    dislike: 'Je n\'aime pas',
    serverLoadZero: '0% Charge Serveur',
  },
  de: {
    searchPlaceholder: 'Suche in über 1.115 kostenlosen Spielen...',
    allGames: 'Alle Spiele',
    actionCombat: 'Action & Kampf',
    puzzleLogic: 'Puzzle & Logik',
    arcadeSkill: 'Arcade & Geschick',
    retroClassic: 'Retro & Klassiker',
    strategyBrain: 'Strategie & Gehirn',
    wordTrivia: 'Wort & Quiz',
    favorites: 'Favoriten',
    trending: 'Angesagt',
    newReleases: 'Neuheiten',
    submitGame: 'Spiel Einreichen',
    playNow: 'Jetzt Spielen',
    loadMore: 'Mehr Spiele Laden',
    multiplayerP2P: 'P2P Multiplayer',
    ambientGlow: 'Umgebungslicht',
    aspectRatio: 'Bildformat',
    takeScreenshot: 'Screenshot Erstellen',
    offlineReady: '100% Offline Verfügbar',
    controlsGuide: 'Steuerung',
    howToPlay: 'Spielanleitung',
    features: 'Spielfunktionen',
    relatedGames: 'Ähnliche Spiele',
    share: 'Teilen',
    copied: 'Kopiert!',
    fullscreen: 'Vollbild',
    restart: 'Neustart',
    like: 'Gefällt mir',
    dislike: 'Gefällt mir nicht',
    serverLoadZero: '0% Serverlast',
  },
  hi: {
    searchPlaceholder: '१,११५+ मुफ्त गेम खोजें...',
    allGames: 'सभी खेल',
    actionCombat: 'एक्शन और कॉम्बैट',
    puzzleLogic: 'पहेली और तर्क',
    arcadeSkill: 'आर्केड और कौशल',
    retroClassic: 'रेट्रो और क्लासिक',
    strategyBrain: 'रणनीति और दिमाग',
    wordTrivia: 'शब्द और ट्रिविया',
    favorites: 'पसंदीदा',
    trending: 'ट्रेंडिंग',
    newReleases: 'नई रिलीज़',
    submitGame: 'गेम सबमिट करें',
    playNow: 'अभी खेलें',
    loadMore: 'और गेम लोड करें',
    multiplayerP2P: 'P2P मल्टीप्लेयर',
    ambientGlow: 'एंबिएंट ग्लो',
    aspectRatio: 'स्क्रीन अनुपात',
    takeScreenshot: 'स्क्रीनशॉट लें',
    offlineReady: '१००% ऑफलाइन तैयार',
    controlsGuide: 'नियंत्रण गाइड',
    howToPlay: 'कैसे खेलें',
    features: 'गेम विशेषताएँ',
    relatedGames: 'संबंधित खेल',
    share: 'शेयर करें',
    copied: 'कॉपी हो गया!',
    fullscreen: 'पूर्ण स्क्रीन',
    restart: 'पुनः आरंभ करें',
    like: 'पसंद करें',
    dislike: 'नापसंद करें',
    serverLoadZero: '०% सर्वर लोड',
  },
  ar: {
    searchPlaceholder: 'ابحث في أكثر من 1115 لعبة مجانية...',
    allGames: 'جميع الألعاب',
    actionCombat: 'حركة وقتال',
    puzzleLogic: 'ألغاز ومنطق',
    arcadeSkill: 'آركيد ومهارة',
    retroClassic: 'كلاسيكي وريترو',
    strategyBrain: 'استراتيجية وذكاء',
    wordTrivia: 'كلمات ومعلومات',
    favorites: 'المفضلة',
    trending: 'الأكثر رواجاً',
    newReleases: 'أحدث الألعاب',
    submitGame: 'إرسال لعبة',
    playNow: 'العب الآن',
    loadMore: 'تحميل المزيد',
    multiplayerP2P: 'لعب جماعي P2P',
    ambientGlow: 'الإضاءة المحيطة',
    aspectRatio: 'نسبة العرض',
    takeScreenshot: 'لقطة شاشة',
    offlineReady: 'يعمل 100% بدون إنترنت',
    controlsGuide: 'دليل التحكم',
    howToPlay: 'طريقة اللعب',
    features: 'الميزات',
    relatedGames: 'ألعاب مشابهة',
    share: 'مشاركة',
    copied: 'تم النسخ!',
    fullscreen: 'ملء الشاشة',
    restart: 'إعادة البدء',
    like: 'إعجاب',
    dislike: 'عدم إعجاب',
    serverLoadZero: '0% ضغط على الخادم',
  }
};

const STORAGE_KEY = 'arcadex_language_code';

export function getStoredLanguage(): LanguageCode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved in TRANSLATIONS) {
      return saved as LanguageCode;
    }
  } catch {}
  return 'en';
}

export function setStoredLanguage(lang: LanguageCode): void {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {}
}
