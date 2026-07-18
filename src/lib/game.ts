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

export interface GameProgress {
  language: Language;
  phase: GamePhase;
  houseSolved: boolean;
  composition?: CompositionConfig;
  mentor?: MentorFeedback;
}

export const DEFAULT_COMPOSITION: CompositionConfig = {
  tempo: 96,
  contour: "wave",
  instruments: ["pluck", "bass"],
};

export const STORAGE_KEY = "resonancia:v1";
export const SESSION_STORAGE_KEY = "resonancia:anonymous-player:v1";
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
  playerSessionId: z.string().uuid(),
  composition: compositionSchema,
});

export const suggestedVariationSchema = compositionSchema.extend({
  reason: z.string().min(1).max(160),
});

export const mentorModelOutputSchema = z.object({
  interpretation: z.string().min(1).max(180),
  concept: z.string().min(1).max(180),
  variationChallenge: z.string().min(1).max(180),
  worldEffect: z.string().min(1).max(140),
  suggestedVariation: suggestedVariationSchema,
});

export const mentorFeedbackSchema = mentorModelOutputSchema.extend({
  source: z.enum(["openai", "mock"]),
  model: z.string().min(1).max(80).optional(),
});

export type MentorRequest = z.infer<typeof mentorRequestSchema>;
export type MentorModelOutput = z.infer<typeof mentorModelOutputSchema>;
export type MentorFeedback = z.infer<typeof mentorFeedbackSchema>;

export function sameComposition(a: CompositionConfig, b: CompositionConfig) {
  return (
    a.tempo === b.tempo &&
    a.contour === b.contour &&
    a.instruments.length === b.instruments.length &&
    a.instruments.every((instrument, index) => instrument === b.instruments[index])
  );
}

export function ensurePlayableVariation(
  original: CompositionConfig,
  proposed: z.infer<typeof suggestedVariationSchema>,
) {
  if (!sameComposition(original, proposed)) return proposed;

  const nextContour: Record<Contour, Contour> = {
    rising: "wave",
    wave: "falling",
    falling: "rising",
  };

  return { ...proposed, contour: nextContour[original.contour] };
}

function fallbackVariation(language: Language, composition: CompositionConfig) {
  const nextContour: Record<Contour, Contour> = {
    rising: "wave",
    wave: "falling",
    falling: "rising",
  };

  return {
    ...composition,
    contour: nextContour[composition.contour],
    reason:
      language === "es"
        ? "Cambiar solo la dirección melódica permite oír cómo una decisión transforma el carácter."
        : "Changing only the melodic direction reveals how one choice transforms the character.",
  };
}

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
        : "Compara tu contorno con la nueva dirección que preparé para ti.",
      worldEffect: "El sendero florece y el portal de Aire recupera su canto.",
      suggestedVariation: fallbackVariation(language, composition),
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
      : "Compare your contour with the new direction I prepared for you.",
    worldEffect: "The path blooms and the Air portal recovers its song.",
    suggestedVariation: fallbackVariation(language, composition),
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
    listening: "Echo is listening to your musical choices…",
    listeningHint: "Turning tempo, shape and timbre into a playable idea.",
    openAISource: "GPT-5.6 Luna · live musical mentor",
    fallbackSource: "Curated fallback · the journey stays playable",
    mySong: "My song",
    echoVariation: "Echo’s variation",
    variationReason: "Why this change?",
    launchTitle: "The Air World Awakens",
    launchStory: "Your musical idea became something real. The journey has begun.",
    returnAtlas: "Return to atlas",
    dayOne: "Build Week · Day 2 AI mentor",
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
    listening: "Eco está escuchando tus decisiones musicales…",
    listeningHint: "Convirtiendo tempo, forma y timbre en una idea que podrás tocar.",
    openAISource: "GPT-5.6 Luna · mentor musical en vivo",
    fallbackSource: "Alternativa curada · el viaje siempre puede continuar",
    mySong: "Mi canción",
    echoVariation: "Variación de Eco",
    variationReason: "¿Por qué este cambio?",
    launchTitle: "El mundo de Aire despierta",
    launchStory: "Tu idea musical se convirtió en algo real. El viaje ha comenzado.",
    returnAtlas: "Volver al atlas",
    dayOne: "Build Week · Día 2 con mentor IA",
    soundOn: "Sonido activo",
    soundOff: "Sonido apagado",
  },
} as const;
