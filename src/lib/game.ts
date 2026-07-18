import { z } from "zod";

export type Language = "en" | "es";
export type GamePhase = "welcome" | "house" | "atlas" | "composition" | "launch" | "water";
export type Tempo = 72 | 96 | 120;
export type Contour = "rising" | "falling" | "wave";
export type Instrument = "pluck" | "flute" | "bass" | "percussion";
export type ChordQuality = "major" | "minor";
export type WaterStage = "intro" | "ear" | "harmony" | "complete";

export const WATER_CHORD_IDS = ["C", "Dm", "Em", "F", "G", "Am"] as const;
export const WATER_CHALLENGE_IDS = ["coral-cove", "moon-current", "turtle-bay", "deep-garden"] as const;
export type WaterChordId = (typeof WATER_CHORD_IDS)[number];
export type WaterChallengeId = (typeof WATER_CHALLENGE_IDS)[number];

export interface CompositionConfig {
  tempo: Tempo;
  contour: Contour;
  instruments: Instrument[];
}

export interface GameProgress {
  language: Language;
  phase: GamePhase;
  houseSolved: boolean;
  airRestored: boolean;
  composition?: CompositionConfig;
  mentor?: MentorFeedback;
  water: WaterProgress;
}

export interface WaterProgress {
  stage: WaterStage;
  challengeId: WaterChallengeId;
  earRound: number;
  earCorrect: number;
  currentStreak: number;
  bestStreak: number;
  progressionInput: WaterChordId[];
  progressionAttempts: number;
  bestStars: number;
  completedRuns: number;
}

export interface WaterChallenge {
  id: WaterChallengeId;
  earChords: readonly [WaterChordId, WaterChordId, WaterChordId];
  progression: readonly [WaterChordId, WaterChordId, WaterChordId];
}

export const DEFAULT_COMPOSITION: CompositionConfig = {
  tempo: 96,
  contour: "wave",
  instruments: ["pluck", "bass"],
};

export const STORAGE_KEY = "resonancia:v1";
export const SESSION_STORAGE_KEY = "resonancia:anonymous-player:v1";
export const HOUSE_SEQUENCE = ["clock", "sofa", "trunk"] as const;

export const WATER_CHORDS: Record<
  WaterChordId,
  { notes: readonly [string, string, string]; quality: ChordQuality; roman: string }
> = {
  C: { notes: ["C4", "E4", "G4"], quality: "major", roman: "I" },
  Dm: { notes: ["D4", "F4", "A4"], quality: "minor", roman: "ii" },
  Em: { notes: ["E4", "G4", "B4"], quality: "minor", roman: "iii" },
  F: { notes: ["F4", "A4", "C5"], quality: "major", roman: "IV" },
  G: { notes: ["G4", "B4", "D5"], quality: "major", roman: "V" },
  Am: { notes: ["A3", "C4", "E4"], quality: "minor", roman: "vi" },
};

export const WATER_CHALLENGES: Record<WaterChallengeId, WaterChallenge> = {
  "coral-cove": {
    id: "coral-cove",
    earChords: ["C", "Am", "F"],
    progression: ["C", "F", "G"],
  },
  "moon-current": {
    id: "moon-current",
    earChords: ["Am", "G", "Dm"],
    progression: ["Am", "F", "G"],
  },
  "turtle-bay": {
    id: "turtle-bay",
    earChords: ["Em", "C", "Am"],
    progression: ["C", "G", "Am"],
  },
  "deep-garden": {
    id: "deep-garden",
    earChords: ["F", "Dm", "G"],
    progression: ["Dm", "G", "C"],
  },
};

export function createWaterProgress(
  challengeId: WaterChallengeId,
  previous?: Pick<WaterProgress, "bestStars" | "bestStreak" | "completedRuns">,
): WaterProgress {
  return {
    stage: "intro",
    challengeId,
    earRound: 0,
    earCorrect: 0,
    currentStreak: 0,
    bestStreak: previous?.bestStreak ?? 0,
    progressionInput: [],
    progressionAttempts: 0,
    bestStars: previous?.bestStars ?? 0,
    completedRuns: previous?.completedRuns ?? 0,
  };
}

export const DEFAULT_WATER_PROGRESS = createWaterProgress("coral-cove");

export const gamePhaseSchema = z.enum(["welcome", "house", "atlas", "composition", "launch", "water"]);
export const waterChordSchema = z.enum(WATER_CHORD_IDS);
export const waterChallengeIdSchema = z.enum(WATER_CHALLENGE_IDS);
export const waterProgressSchema = z.object({
  stage: z.enum(["intro", "ear", "harmony", "complete"]),
  challengeId: waterChallengeIdSchema,
  earRound: z.number().int().min(0).max(2),
  earCorrect: z.number().int().min(0).max(3),
  currentStreak: z.number().int().min(0).max(3),
  bestStreak: z.number().int().min(0).max(3),
  progressionInput: z.array(waterChordSchema).max(3),
  progressionAttempts: z.number().int().min(0).max(99),
  bestStars: z.number().int().min(0).max(3),
  completedRuns: z.number().int().min(0).max(999),
});

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

export function parseWaterChallengeId(value: string | null | undefined): WaterChallengeId | null {
  const result = waterChallengeIdSchema.safeParse(value);
  return result.success ? result.data : null;
}

export function dailyWaterChallengeId(date = new Date()): WaterChallengeId {
  const day = Math.floor(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 86_400_000,
  );
  return WATER_CHALLENGE_IDS[day % WATER_CHALLENGE_IDS.length];
}

export function chordQuality(chord: WaterChordId): ChordQuality {
  return WATER_CHORDS[chord].quality;
}

export function progressionMatches(
  input: readonly WaterChordId[],
  target: readonly WaterChordId[],
) {
  return input.length === target.length && input.every((chord, index) => chord === target[index]);
}

export function scoreWaterMission(earCorrect: number, failedProgressionAttempts: number) {
  return Math.min(3, 1 + (earCorrect >= 2 ? 1 : 0) + (failedProgressionAttempts === 0 ? 1 : 0));
}

export function waterChallengeUrl(
  currentUrl: string,
  challengeId: WaterChallengeId,
  language: Language,
) {
  const url = new URL(currentUrl);
  url.search = "";
  url.hash = "";
  url.searchParams.set("challenge", challengeId);
  url.searchParams.set("lang", language);
  return url.toString();
}

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
    restored: "World restored",
    waterAvailable: "New mission",
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
    dayOne: "Build Week · Day 3 living worlds",
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
    restored: "Mundo restaurado",
    waterAvailable: "Nueva misión",
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
    dayOne: "Build Week · Día 3 mundos vivos",
    soundOn: "Sonido activo",
    soundOff: "Sonido apagado",
  },
} as const;

export const waterCopy = {
  en: {
    worldLabel: "Water world · listening & harmony",
    introTitle: "Octavia and the hidden current",
    introStory:
      "The reef has forgotten how bright and deep sounds belong together. Listen with Octavia, then rebuild its three-chord current.",
    challenge: "Current challenge",
    friendChallenge: "A friend sent you this musical current",
    start: "Dive into the listening trial",
    exit: "Return to atlas",
    earLabel: "Trial 01 · chord color",
    earTitle: "Where does this chord lead?",
    earStory:
      "Hear the hidden chord. Major chords swim toward the bright coral; minor chords descend toward the quiet deep.",
    listenChord: "Hear hidden chord",
    replayChord: "Hear it again",
    chooseCurrent: "Choose the current you hear",
    coral: "Bright coral",
    coralHint: "Major color",
    depth: "Quiet deep",
    depthHint: "Minor color",
    correctMajor: "Yes — the major third opens the sound toward the coral.",
    correctMinor: "Yes — the minor third gives the sound a deeper color.",
    wrongMajor: "This chord was major. Listen for the wider, brighter third.",
    wrongMinor: "This chord was minor. Listen for the closer, darker third.",
    nextChord: "Follow the next bubble",
    buildCurrent: "Build the current",
    round: "Chord",
    streak: "Listening streak",
    harmonyLabel: "Trial 02 · harmony",
    harmonyTitle: "Wake the six tentacles",
    harmonyStory:
      "Each tentacle holds a chord from C major. Hear Octavia’s current, then touch the same three chords in order.",
    hearProgression: "Hear Octavia’s current",
    selectedChords: "Your three chords",
    emptySlot: "Empty",
    undo: "Undo",
    clear: "Clear",
    check: "Send the current",
    harmonyWrong: "The current changed course. Hear it once more and rebuild the three chords.",
    harmonyCorrect: "The six tentacles resonate — your harmony has reached the reef.",
    tryAgain: "Rebuild current",
    completeLabel: "Mission complete · Water restored",
    completeTitle: "The reef remembers its harmony",
    completeStory:
      "You listened for chord color and turned three separate sounds into one musical journey.",
    pearls: "Harmony pearls",
    earPearl: "Recognized at least two chord colors",
    harmonyPearl: "Completed Octavia’s progression",
    firstTryPearl: "Rebuilt the current on the first try",
    best: "Personal best",
    share: "Challenge a friend",
    shareTitle: "Can you restore Octavia’s musical current?",
    shared: "Challenge link ready",
    copied: "Challenge link copied",
    replay: "Play another current",
    atlas: "Return to the world atlas",
    challengeNames: {
      "coral-cove": "Coral Cove",
      "moon-current": "Moon Current",
      "turtle-bay": "Turtle Bay",
      "deep-garden": "Deep Garden",
    },
  },
  es: {
    worldLabel: "Mundo de Agua · escucha y armonía",
    introTitle: "Octavia y la corriente escondida",
    introStory:
      "El arrecife olvidó cómo conviven los sonidos luminosos y profundos. Escucha con Octavia y reconstruye su corriente de tres acordes.",
    challenge: "Reto de la corriente",
    friendChallenge: "Una amistad te envió esta corriente musical",
    start: "Sumergirme en la prueba auditiva",
    exit: "Volver al atlas",
    earLabel: "Prueba 01 · color del acorde",
    earTitle: "¿Hacia dónde viaja este acorde?",
    earStory:
      "Escucha el acorde oculto. Los acordes mayores nadan hacia el coral luminoso; los menores descienden a la profundidad tranquila.",
    listenChord: "Escuchar acorde oculto",
    replayChord: "Escucharlo otra vez",
    chooseCurrent: "Elige la corriente que escuchas",
    coral: "Coral luminoso",
    coralHint: "Color mayor",
    depth: "Profundidad tranquila",
    depthHint: "Color menor",
    correctMajor: "Sí: la tercera mayor abre el sonido hacia el coral.",
    correctMinor: "Sí: la tercera menor le da un color más profundo.",
    wrongMajor: "Este acorde era mayor. Escucha su tercera más amplia y luminosa.",
    wrongMinor: "Este acorde era menor. Escucha su tercera más cercana y oscura.",
    nextChord: "Seguir la próxima burbuja",
    buildCurrent: "Construir la corriente",
    round: "Acorde",
    streak: "Racha auditiva",
    harmonyLabel: "Prueba 02 · armonía",
    harmonyTitle: "Despierta los seis tentáculos",
    harmonyStory:
      "Cada tentáculo guarda un acorde de Do mayor. Escucha la corriente de Octavia y toca los mismos tres acordes en orden.",
    hearProgression: "Escuchar la corriente de Octavia",
    selectedChords: "Tus tres acordes",
    emptySlot: "Vacío",
    undo: "Deshacer",
    clear: "Limpiar",
    check: "Enviar la corriente",
    harmonyWrong: "La corriente cambió de rumbo. Escúchala de nuevo y reconstruye los tres acordes.",
    harmonyCorrect: "Los seis tentáculos resuenan: tu armonía llegó al arrecife.",
    tryAgain: "Reconstruir corriente",
    completeLabel: "Misión completa · Agua restaurada",
    completeTitle: "El arrecife recuerda su armonía",
    completeStory:
      "Escuchaste el color de los acordes y convertiste tres sonidos separados en un viaje musical.",
    pearls: "Perlas de armonía",
    earPearl: "Reconociste al menos dos colores de acorde",
    harmonyPearl: "Completaste la progresión de Octavia",
    firstTryPearl: "Reconstruiste la corriente al primer intento",
    best: "Mejor resultado",
    share: "Retar a una amistad",
    shareTitle: "¿Puedes restaurar la corriente musical de Octavia?",
    shared: "Enlace del reto listo",
    copied: "Enlace del reto copiado",
    replay: "Jugar otra corriente",
    atlas: "Volver al atlas de mundos",
    challengeNames: {
      "coral-cove": "Ensenada Coral",
      "moon-current": "Corriente Lunar",
      "turtle-bay": "Bahía Tortuga",
      "deep-garden": "Jardín Profundo",
    },
  },
} as const;
