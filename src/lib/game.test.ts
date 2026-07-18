import { describe, expect, it } from "vitest";
import {
  WATER_CHALLENGE_IDS,
  WATER_CHALLENGES,
  WATER_CHORD_IDS,
  chordQuality,
  copy,
  createWaterProgress,
  dailyWaterChallengeId,
  melodyFor,
  mentorFeedbackSchema,
  mentorRequestSchema,
  mockMentorFeedback,
  parseWaterChallengeId,
  progressionMatches,
  sameComposition,
  scoreWaterMission,
  waterChallengeUrl,
  waterCopy,
  type CompositionConfig,
} from "./game";

const playerSessionId = "2f01f4ae-69cb-4cc8-bc96-0775a21cc7ae";

describe("musical composition", () => {
  it("maps every contour to a deterministic eight-note melody", () => {
    for (const contour of ["rising", "falling", "wave"] as const) {
      expect(melodyFor({ tempo: 96, contour, instruments: ["pluck"] })).toHaveLength(8);
    }
  });

  it("validates the public mentor contract", () => {
    const result = mentorRequestSchema.safeParse({
      sceneId: "dog-walk",
      language: "en",
      playerSessionId,
      composition: { tempo: 96, contour: "wave", instruments: ["pluck", "bass"] },
    });
    expect(result.success).toBe(true);
  });

  it("rejects more than three instruments", () => {
    const result = mentorRequestSchema.safeParse({
      sceneId: "dog-walk",
      language: "en",
      playerSessionId,
      composition: { tempo: 96, contour: "wave", instruments: ["pluck", "flute", "bass", "percussion"] },
    });
    expect(result.success).toBe(false);
  });
});

describe("bilingual prototype", () => {
  it("contains the same UI keys in English and Spanish", () => {
    expect(Object.keys(copy.en).sort()).toEqual(Object.keys(copy.es).sort());
  });

  it("returns a disclosed, playable fallback variation", () => {
    const composition: CompositionConfig = { tempo: 72, contour: "rising", instruments: ["flute"] };
    const feedback = mockMentorFeedback("es", composition);
    expect(feedback.source).toBe("mock");
    expect(mentorFeedbackSchema.safeParse(feedback).success).toBe(true);
    expect(sameComposition(composition, feedback.suggestedVariation)).toBe(false);
    expect(melodyFor(feedback.suggestedVariation)).toHaveLength(8);
  });

  it("contains the same Water World UI keys in English and Spanish", () => {
    expect(Object.keys(waterCopy.en).sort()).toEqual(Object.keys(waterCopy.es).sort());
    expect(Object.keys(waterCopy.en.challengeNames).sort()).toEqual(
      Object.keys(waterCopy.es.challengeNames).sort(),
    );
  });
});

describe("Water World challenge", () => {
  it("maps every diatonic tentacle to a playable major or minor triad", () => {
    expect(WATER_CHORD_IDS).toHaveLength(6);
    expect(WATER_CHORD_IDS.map(chordQuality)).toEqual([
      "major",
      "minor",
      "minor",
      "major",
      "major",
      "minor",
    ]);
  });

  it("provides four deterministic three-chord challenges", () => {
    for (const challengeId of WATER_CHALLENGE_IDS) {
      expect(WATER_CHALLENGES[challengeId].earChords).toHaveLength(3);
      expect(WATER_CHALLENGES[challengeId].progression).toHaveLength(3);
    }
    expect(WATER_CHALLENGE_IDS).toContain(dailyWaterChallengeId(new Date("2026-07-18T12:00:00Z")));
  });

  it("matches a progression only when chord order is exact", () => {
    expect(progressionMatches(["C", "F", "G"], ["C", "F", "G"])).toBe(true);
    expect(progressionMatches(["C", "G", "F"], ["C", "F", "G"])).toBe(false);
    expect(progressionMatches(["C", "F"], ["C", "F", "G"])).toBe(false);
  });

  it("awards one completion pearl plus listening and first-try pearls", () => {
    expect(scoreWaterMission(0, 2)).toBe(1);
    expect(scoreWaterMission(2, 1)).toBe(2);
    expect(scoreWaterMission(1, 0)).toBe(2);
    expect(scoreWaterMission(3, 0)).toBe(3);
  });

  it("resets a replay while preserving personal bests", () => {
    const replay = createWaterProgress("moon-current", {
      bestStars: 3,
      bestStreak: 2,
      completedRuns: 4,
    });
    expect(replay).toMatchObject({
      stage: "intro",
      challengeId: "moon-current",
      earCorrect: 0,
      progressionInput: [],
      bestStars: 3,
      bestStreak: 2,
      completedRuns: 4,
    });
  });

  it("creates anonymous bilingual challenge links and rejects unknown ids", () => {
    const link = new URL(
      waterChallengeUrl("https://resonance.test/?old=value#result", "turtle-bay", "es"),
    );
    expect(link.searchParams.get("challenge")).toBe("turtle-bay");
    expect(link.searchParams.get("lang")).toBe("es");
    expect(link.searchParams.has("old")).toBe(false);
    expect(link.hash).toBe("");
    expect(parseWaterChallengeId("turtle-bay")).toBe("turtle-bay");
    expect(parseWaterChallengeId("unknown-current")).toBeNull();
  });
});
