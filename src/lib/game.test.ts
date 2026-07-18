import { describe, expect, it } from "vitest";
import { copy, melodyFor, mentorRequestSchema, mockMentorFeedback } from "./game";

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
      composition: { tempo: 96, contour: "wave", instruments: ["pluck", "bass"] },
    });
    expect(result.success).toBe(true);
  });

  it("rejects more than three instruments", () => {
    const result = mentorRequestSchema.safeParse({
      sceneId: "dog-walk",
      language: "en",
      composition: { tempo: 96, contour: "wave", instruments: ["pluck", "flute", "bass", "percussion"] },
    });
    expect(result.success).toBe(false);
  });
});

describe("bilingual prototype", () => {
  it("contains the same UI keys in English and Spanish", () => {
    expect(Object.keys(copy.en).sort()).toEqual(Object.keys(copy.es).sort());
  });

  it("labels mentor feedback honestly as mock", () => {
    expect(mockMentorFeedback("es", { tempo: 72, contour: "rising", instruments: ["flute"] }).source).toBe("mock");
  });
});
