import { describe, expect, it } from "vitest";
import {
  mentorFeedbackSchema,
  mockMentorFeedback,
  sameComposition,
  type CompositionConfig,
  type Language,
} from "./game";

const cases: Array<{
  language: Language;
  composition: CompositionConfig;
  contourWord: string;
}> = [
  { language: "en", composition: { tempo: 72, contour: "rising", instruments: ["flute"] }, contourWord: "rising" },
  { language: "en", composition: { tempo: 96, contour: "wave", instruments: ["pluck", "bass"] }, contourWord: "wave" },
  { language: "en", composition: { tempo: 120, contour: "falling", instruments: ["pluck", "bass", "percussion"] }, contourWord: "falling" },
  { language: "es", composition: { tempo: 72, contour: "falling", instruments: ["bass"] }, contourWord: "descendente" },
  { language: "es", composition: { tempo: 96, contour: "rising", instruments: ["pluck", "flute"] }, contourWord: "ascendente" },
  { language: "es", composition: { tempo: 120, contour: "wave", instruments: ["flute", "bass", "percussion"] }, contourWord: "ondulante" },
];

describe("bilingual pedagogy evaluation set", () => {
  it.each(cases)("keeps $language/$composition.contour feedback grounded and playable", ({ language, composition, contourWord }) => {
    const feedback = mockMentorFeedback(language, composition);
    const allText = Object.values(feedback).filter((value) => typeof value === "string").join(" ").toLowerCase();

    expect(mentorFeedbackSchema.safeParse(feedback).success).toBe(true);
    expect(feedback.concept.toLowerCase()).toContain(contourWord);
    expect(feedback.concept).toContain(String(composition.instruments.length));
    expect(sameComposition(composition, feedback.suggestedVariation)).toBe(false);
    expect(allText).not.toMatch(/microphone|micrófono|recording|grabación/);
  });
});
