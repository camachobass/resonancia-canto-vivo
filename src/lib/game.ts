import { z } from "zod";

export type Language = "en" | "es";
export type GamePhase = "welcome" | "house" | "atlas" | "composition" | "launch";
export type Tempo = 72 | 96 | 120;
export type Contour = "rising" | "falling" | "wave";
export type Instrument = "pluck" | "flute" | "bass" | "percussion";

export interface CompositionConfig {
  tempo: Tempo;
  contour: Contour;
  instruments: Instrument[];
}

export interface MentorFeedback {
  interpretation: string;
  concept: string;
  variationChallenge: string;
  worldEffect: string;
  source: "mock";
}

export interface GameProgress {
  language: Language;
  phase: GamePhase;
  houseSolved: boolean;
  composition?: CompositionConfig;
}

export const DEFAULT_COMPOSITION: CompositionConfig = {
  tempo: 96,
  contour: "wave",
  instruments: ["pluck", "bass"],
};

export const STORAGE_KEY = "resonancia:v1";
export const HOUSE_SEQUENCE = ["clock", "sofa", "trunk"] as const;

export const compositionSchema = z.object({
  tempo: z.union([z.literal(72), z.literal(96), z.literal(120)]),
  contour: z.enum(["rising", "falling", "wave"]),
  instruments: z
    .array(z.enum(["pluck", "flute", "bass", "percussion"]))
    .min(1)
    .max(3),
});

export const mentorRequestSchema = z.object({
  sceneId: z.literal("dog-walk"),
  language: z.enum(["en", "es"]),
  composition: compositionSchema,
});

export function melodyFor(config: CompositionConfig): string[] {
  const contours: Record<Contour, string[]> = {
    rising: ["C4", "D4", "E4", "G4", "A4", "G4", "E4", "D4"],
    falling: ["A4", "G4", "E4", "D4", "C4", "D4", "E4", "C4"],
    wave: ["C4", "E4", "G4", "E4", "D4", "F4", "A4", "G4"],
  };
  return contours[config.contour];
}

export function mockMentorFeedback(
  language: Language,
  composition: CompositionConfig,
): MentorFeedback {
  const energetic = composition.tempo === 120;
  const spacious = composition.tempo === 72;
  const manyColors = composition.instruments.length === 3;

  if (language === "es") {
    return {
      interpretation: energetic
        ? "Tu canción corre con el perro y convierte el sendero en energía."
        : spacious
          ? "Tu canción camina con calma y deja respirar cada nota."
          : "Tu canción trota con equilibrio y una curiosidad luminosa.",
      concept: `Usaste un contorno ${composition.contour === "rising" ? "ascendente" : composition.contour === "falling" ? "descendente" : "ondulante"} y ${composition.instruments.length} colores instrumentales.`,
      variationChallenge: manyColors
        ? "Prueba quitar un instrumento: ¿sigue contando la misma historia?"
        : "Añade una nueva voz y haz que responda a la melodía.",
      worldEffect: "El sendero florece y el portal de Aire recupera su canto.",
      source: "mock",
    };
  }

  return {
    interpretation: energetic
      ? "Your song runs with the dog and turns the path into energy."
      : spacious
        ? "Your song walks calmly and gives every note room to breathe."
        : "Your song trots with balance and bright curiosity.",
    concept: `You used a ${composition.contour} contour and ${composition.instruments.length} instrumental colors.`,
    variationChallenge: manyColors
      ? "Try removing one instrument. Does it still tell the same story?"
      : "Add a new voice and let it answer the melody.",
    worldEffect: "The path blooms and the Air portal recovers its song.",
    source: "mock",
  };
}

export const copy = {
  en: {
    tagline: "A musical adventure where listening changes the world.",
    enter: "Enter the living song",
    continue: "Continue journey",
    newJourney: "Start over",
    houseTitle: "Grandma Luma’s House",
    houseStory: "Three memories are humming. Listen, then awaken them from low to high.",
    listen: "Hear the memory",
    houseHint: "Clock · sofa · trunk",
    wrong: "The house shivers. Listen once more.",
    solved: "The three notes open a hidden atlas!",
    openAtlas: "Open the world atlas",
    atlasTitle: "The Atlas of Living Worlds",
    atlasStory: "Music is the bridge between mind, feeling, will and matter.",
    air: "Air · Imagination",
    water: "Water · Emotion",
    fire: "Fire · Will",
    earth: "Earth · Creation",
    activePortal: "Available mission",
    soon: "Awakening soon",
    composeTitle: "Compose the dog’s walk",
    composeStory: "Shape a four-bar song. Every choice changes how the path moves.",
    tempo: "Movement",
    contour: "Melody shape",
    instruments: "Sound colors · choose up to 3",
    walk: "Walk",
    trot: "Trot",
    run: "Run",
    rising: "Rising",
    falling: "Falling",
    wave: "Wave",
    pluck: "Seed harp",
    flute: "Wind flute",
    bass: "Root bass",
    percussion: "Stone drums",
    preview: "Preview song",
    stop: "Stop",
    commit: "Offer song to the portal",
    mentor: "Echo, your musical guide",
    mockNote: "Prototype guide · curated feedback, no AI call yet",
    launchTitle: "The Air World Awakens",
    launchStory: "Your musical idea became something real. The journey has begun.",
    playAgain: "Play my song",
    returnAtlas: "Return to atlas",
    dayOne: "Build Week · Day 1 prototype",
    soundOn: "Sound on",
    soundOff: "Sound off",
  },
  es: {
    tagline: "Una aventura musical donde escuchar transforma el mundo.",
    enter: "Entrar al canto vivo",
    continue: "Continuar viaje",
    newJourney: "Empezar de nuevo",
    houseTitle: "La casa de la abuela Luma",
    houseStory: "Tres recuerdos están cantando. Escucha y despiértalos de grave a agudo.",
    listen: "Escuchar el recuerdo",
    houseHint: "Reloj · sofá · baúl",
    wrong: "La casa tiembla. Escucha una vez más.",
    solved: "¡Las tres notas abren un atlas secreto!",
    openAtlas: "Abrir el atlas de mundos",
    atlasTitle: "El atlas de los mundos vivos",
    atlasStory: "La música es el puente entre mente, emoción, voluntad y materia.",
    air: "Aire · Imaginación",
    water: "Agua · Emoción",
    fire: "Fuego · Voluntad",
    earth: "Tierra · Creación",
    activePortal: "Misión disponible",
    soon: "Despertará pronto",
    composeTitle: "Compón el paseo del perro",
    composeStory: "Crea una canción de cuatro compases. Cada elección transforma el camino.",
    tempo: "Movimiento",
    contour: "Forma de la melodía",
    instruments: "Colores sonoros · elige hasta 3",
    walk: "Caminar",
    trot: "Trotar",
    run: "Correr",
    rising: "Ascendente",
    falling: "Descendente",
    wave: "Onda",
    pluck: "Arpa semilla",
    flute: "Flauta de viento",
    bass: "Bajo raíz",
    percussion: "Tambores de piedra",
    preview: "Escuchar canción",
    stop: "Detener",
    commit: "Ofrecer canción al portal",
    mentor: "Eco, tu guía musical",
    mockNote: "Guía de prototipo · respuestas curadas, aún sin llamada a IA",
    launchTitle: "El mundo de Aire despierta",
    launchStory: "Tu idea musical se convirtió en algo real. El viaje ha comenzado.",
    playAgain: "Tocar mi canción",
    returnAtlas: "Volver al atlas",
    dayOne: "Build Week · Prototipo Día 1",
    soundOn: "Sonido activo",
    soundOff: "Sonido apagado",
  },
} as const;
