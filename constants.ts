
import { ActorData, Language } from './types';

// UI Translations
export const UI_TEXT = {
  fr: {
    title: "Pucio : Jeux Sonores",
    welcome: "Bienvenue !",
    find: "Cherchons :",
    findQuestion: "Où est",
    freeModeMsg: "Mode libre. Explore le monde de Pucio !",
    playModeMsg: "Jouons à cache-cache !",
    modeFree: "Mode Libre",
    modePlay: "Jouer",
    score: "Score",
    bravo: "BRAVO !",
    wrong: "Non, ça c'est",
    weLookFor: "Nous cherchons",
    comeCloser: "Approche-toi !",
    stickerTitle: "Mon Album",
    collection: "Collection",
    soundOn: "Son activé",
    soundOff: "Son désactivé",
    is: "C'est",
    credits: "Basé sur le personnage Pucio créé par Marta Galewska-Kustra, publié par Nasza Księgarnia.",
    createdBy: "Jeu créé par Lorenzo Alali",
    copyrightNotice: "Les droits d'auteur du personnage Pucio appartiennent à Marta Galewska-Kustra. Ce jeu a été créé uniquement pour le plaisir (fan game) sans aucune ambition commerciale.",
    close: "Fermer"
  },
  en: {
    title: "Pucio: Sound Games",
    welcome: "Welcome!",
    find: "Let's find:",
    findQuestion: "Where is",
    freeModeMsg: "Free mode. Explore Pucio's world!",
    playModeMsg: "Let's play hide and seek!",
    modeFree: "Free Mode",
    modePlay: "Play",
    score: "Score",
    bravo: "BRAVO!",
    wrong: "No, that is",
    weLookFor: "We are looking for",
    comeCloser: "Come closer!",
    stickerTitle: "My Album",
    collection: "Collection",
    soundOn: "Sound On",
    soundOff: "Sound Off",
    is: "It's",
    credits: "Based on the character Pucio created by Marta Galewska-Kustra, published by Nasza Księgarnia.",
    createdBy: "Game created by Lorenzo Alali",
    copyrightNotice: "The copyright of the character Pucio is owned by Marta Galewska-Kustra. This game was created for fun only (fan game) with no commercial ambition.",
    close: "Close"
  },
  pl: {
    title: "Pucio: Zabawy Dźwiękowe",
    welcome: "Witaj!",
    find: "Szukamy:",
    findQuestion: "Gdzie jest",
    freeModeMsg: "Tryb wolny. Odkrywaj świat Pucia!",
    playModeMsg: "Zagrajmy w chowanego!",
    modeFree: "Tryb Wolny",
    modePlay: "Graj",
    score: "Wynik",
    bravo: "BRAWO!",
    wrong: "Nie, to jest",
    weLookFor: "Szukamy",
    comeCloser: "Podejdź bliżej!",
    stickerTitle: "Mój Album",
    collection: "Kolekcja",
    soundOn: "Dźwięk włączony",
    soundOff: "Dźwięk wyłączony",
    is: "To jest",
    credits: "Na podstawie postaci Pucio stworzonej przez Martę Galewską-Kustrę, wydawnictwo Nasza Księgarnia.",
    createdBy: "Gra stworzona przez Lorenzo Alali",
    copyrightNotice: "Prawa autorskie do postaci Pucio należą do Marty Galewskiej-Kustry. Ta gra powstała wyłącznie dla zabawy (fan game) i nie ma celów komercyjnych.",
    close: "Zamknij"
  }
};

// Base properties for actors (positions, emojis, etc.)
const ACTOR_BASE: Omit<ActorData, 'name' | 'sound' | 'gender'>[] = [
  // --- SKY ZONE ---
  {
    id: 'sun',
    emoji: '☀️',
    defaultPos: { x: 92, y: 12 },
    scale: 1.8,
    placement: 'sky',
    animation: 'animate-spin-slow',
    isObstacle: false,
  },
  {
    id: 'plane',
    emoji: '✈️',
    defaultPos: { x: 15, y: 15 },
    rotation: -10,
    scale: 1.2,
    placement: 'sky',
    animation: 'animate-float-slow',
  },
  {
    id: 'bee',
    emoji: '🐝',
    defaultPos: { x: 45, y: 20 },
    scale: 0.8,
    placement: 'sky',
    animation: 'animate-wobble',
    flip: true,
  },
  {
    id: 'bird',
    emoji: '🐦',
    defaultPos: { x: 65, y: 25 },
    flip: true,
    placement: 'sky',
    animation: 'animate-float',
  },
  // --- ROAD ZONE ---
  {
    id: 'car',
    emoji: '🚗',
    defaultPos: { x: 20, y: 34 },
    placement: 'ground',
    scale: 1.3,
  },
  {
    id: 'motorcycle',
    emoji: '🏍️',
    defaultPos: { x: 35, y: 38 },
    placement: 'ground',
    scale: 1.1,
  },
  {
    id: 'bike1',
    emoji: '🚲',
    defaultPos: { x: 50, y: 31 },
    placement: 'ground',
    scale: 1.0,
    flip: true,
  },
  {
    id: 'scooter',
    emoji: '🛴',
    defaultPos: { x: 62, y: 35 },
    placement: 'ground',
    scale: 0.9,
  },
  {
    id: 'bus',
    emoji: '🚌',
    defaultPos: { x: 80, y: 36 },
    placement: 'ground',
    flip: true,
    scale: 1.4,
  },
  // --- GARDEN ZONE ---
  {
    id: 'horse',
    emoji: '🐎',
    defaultPos: { x: 88, y: 52 },
    placement: 'ground',
    scale: 1.4,
    flip: true,
  },
  {
    id: 'tree',
    emoji: '🌳',
    defaultPos: { x: 10, y: 65 },
    scale: 2.4,
    placement: 'ground',
    isObstacle: true,
    collisionRadius: 12,
  },
  {
    id: 'squirrel',
    emoji: '🐿️',
    defaultPos: { x: 25, y: 68 },
    placement: 'ground',
    scale: 0.85,
    flip: true,
    animation: 'animate-bounce-slight',
  },
  {
    id: 'dog',
    emoji: '🐶',
    defaultPos: { x: 35, y: 60 },
    placement: 'ground',
  },
  {
    id: 'cat',
    emoji: '🐱',
    defaultPos: { x: 25, y: 85 },
    placement: 'ground',
  },
  {
    id: 'rabbit',
    emoji: '🐇',
    defaultPos: { x: 55, y: 70 },
    placement: 'ground',
    scale: 0.9,
  },
  {
    id: 'flower',
    emoji: '🌻',
    defaultPos: { x: 45, y: 90 },
    placement: 'ground',
    scale: 1.0,
  },
  // --- POND ZONE ---
  {
    id: 'duck',
    emoji: '🦆',
    defaultPos: { x: 82, y: 80 },
    placement: 'ground',
    flip: true,
    scale: 1.1,
  },
  {
    id: 'frog',
    emoji: '🐸',
    defaultPos: { x: 75, y: 88 },
    placement: 'ground',
    scale: 0.8,
  },
];

// Translations for actors
const ACTOR_TRANSLATIONS: Record<string, Record<Language, { name: string, sound: string, gender?: 'M'|'F' }>> = {
  sun: {
    fr: { name: 'Soleil', sound: 'BRILLE !', gender: 'M' },
    en: { name: 'Sun', sound: 'SHINE !' },
    pl: { name: 'Słońce', sound: 'ŚWIECI !' },
  },
  plane: {
    fr: { name: 'Avion', sound: 'VROUM !', gender: 'M' },
    en: { name: 'Plane', sound: 'ZOOM !' },
    pl: { name: 'Samolot', sound: 'WRUM !' },
  },
  bee: {
    fr: { name: 'Abeille', sound: 'BZZZZ', gender: 'F' },
    en: { name: 'Bee', sound: 'BZZZZ' },
    pl: { name: 'Pszczoła', sound: 'BZZZZ' },
  },
  bird: {
    fr: { name: 'Oiseau', sound: 'CUI CUI', gender: 'M' },
    en: { name: 'Bird', sound: 'TWEET' },
    pl: { name: 'Ptak', sound: 'ĆWIR ĆWIR' },
  },
  car: {
    fr: { name: 'Voiture', sound: 'TUT TUT !', gender: 'F' },
    en: { name: 'Car', sound: 'BEEP BEEP!' },
    pl: { name: 'Auto', sound: 'BIP BIP!' },
  },
  motorcycle: {
    fr: { name: 'Moto', sound: 'VROUM VROUM !', gender: 'F' },
    en: { name: 'Motorcycle', sound: 'VROOM VROOM !' },
    pl: { name: 'Motocykl', sound: 'BRUM BRUM !' },
  },
  bike1: {
    fr: { name: 'Vélo', sound: 'DRING DRING !', gender: 'M' },
    en: { name: 'Bicycle', sound: 'RING RING !' },
    pl: { name: 'Rower', sound: 'DZYŃ DZYŃ !' },
  },
  scooter: {
    fr: { name: 'Trottinette', sound: 'WIZZ !', gender: 'F' },
    en: { name: 'Scooter', sound: 'WHOOSH !' },
    pl: { name: 'Hulajnoga', sound: 'WZIUUU !' },
  },
  bus: {
    fr: { name: 'Autobus', sound: 'HONK HONK !', gender: 'M' },
    en: { name: 'Bus', sound: 'HONK HONK!' },
    pl: { name: 'Autobus', sound: 'HONK HONK!' },
  },
  horse: {
    fr: { name: 'Cheval', sound: 'HIIII !', gender: 'M' },
    en: { name: 'Horse', sound: 'NEIGH !' },
    pl: { name: 'Koń', sound: 'IHAA !' },
  },
  tree: {
    fr: { name: 'Arbre', sound: 'CHUUUT...', gender: 'M' },
    en: { name: 'Tree', sound: 'SHHH...' },
    pl: { name: 'Drzewo', sound: 'SZUM...' },
  },
  squirrel: {
    fr: { name: 'Écureuil', sound: 'CRIC CRAC', gender: 'M' },
    en: { name: 'Squirrel', sound: 'CRUNCH' },
    pl: { name: 'Wiewiórka', sound: 'CHRUP' },
  },
  dog: {
    fr: { name: 'Chien', sound: 'OUAF OUAF !', gender: 'M' },
    en: { name: 'Dog', sound: 'WOOF WOOF!' },
    pl: { name: 'Pies', sound: 'HAU HAU!' },
  },
  cat: {
    fr: { name: 'Chat', sound: 'MIAOU !', gender: 'M' },
    en: { name: 'Cat', sound: 'MEOW !' },
    pl: { name: 'Kot', sound: 'MIAU !' },
  },
  rabbit: {
    fr: { name: 'Lapin', sound: 'SNIF SNIF', gender: 'M' },
    en: { name: 'Rabbit', sound: 'SNIFF SNIFF' },
    pl: { name: 'Królik', sound: 'KIC KIC' },
  },
  flower: {
    fr: { name: 'Fleur', sound: 'PARFUM...', gender: 'F' },
    en: { name: 'Flower', sound: 'SMELL...' },
    pl: { name: 'Kwiat', sound: 'PACHNIE...' },
  },
  duck: {
    fr: { name: 'Canard', sound: 'COIN COIN', gender: 'M' },
    en: { name: 'Duck', sound: 'QUACK' },
    pl: { name: 'Kaczka', sound: 'KWA KWA' },
  },
  frog: {
    fr: { name: 'Grenouille', sound: 'COÂ COÂ', gender: 'F' },
    en: { name: 'Frog', sound: 'RIBBIT' },
    pl: { name: 'Żaba', sound: 'KUM KUM' },
  },
};

export const getActors = (lang: Language): ActorData[] => {
  return ACTOR_BASE.map(base => {
    const trans = ACTOR_TRANSLATIONS[base.id]?.[lang] || ACTOR_TRANSLATIONS[base.id]?.['fr'];
    return {
      ...base,
      ...trans,
    } as ActorData;
  });
};
