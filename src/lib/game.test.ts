import { describe, expect, it } from "vitest";
import {
  copy,
  melodyFor,
  mentorFeedbackSchema,
  mentorRequestSchema,
  mockMentorFeedback,
  sameComposition,
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
});
