import { describe, expect, it } from "vitest";
import {
  mentorFeedbackSchema,
  sameComposition,
  type MentorModelOutput,
  type MentorRequest,
} from "./game";
import { getMentorFeedback, mentorInstructions } from "./mentor-service";

const request: MentorRequest = {
  sceneId: "dog-walk",
  language: "en",
  playerSessionId: "2f01f4ae-69cb-4cc8-bc96-0775a21cc7ae",
  composition: {
    tempo: 96,
    contour: "wave",
    instruments: ["pluck", "bass"],
  },
};

const validOutput: MentorModelOutput = {
  interpretation: "Your 96 BPM song trots with a curious pulse.",
  concept: "The wave contour rises and falls, creating a sense of travel.",
  variationChallenge: "Compare the wave with a falling melody.",
  worldEffect: "The path bends toward the waking Air portal.",
  suggestedVariation: {
    tempo: 96,
    contour: "falling",
    instruments: ["pluck", "bass"],
    reason: "Changing one element makes the contour easy to compare.",
  },
};

describe("AI mentor service", () => {
  it("accepts valid structured output from OpenAI", async () => {
    const feedback = await getMentorFeedback(request, {
      generate: async () => ({ output: validOutput, model: "gpt-5.6-luna" }),
    });

    expect(feedback.source).toBe("openai");
    expect(feedback.model).toBe("gpt-5.6-luna");
    expect(mentorFeedbackSchema.safeParse(feedback).success).toBe(true);
  });

  it("repairs an unchanged suggestion so the comparison is audible", async () => {
    const feedback = await getMentorFeedback(request, {
      generate: async () => ({
        output: {
          ...validOutput,
          suggestedVariation: {
            ...request.composition,
            reason: "Change the melodic direction.",
          },
        },
      }),
    });

    expect(sameComposition(request.composition, feedback.suggestedVariation)).toBe(false);
  });

  it.each([
    ["a refusal", async () => { throw new Error("refusal"); }],
    ["malformed output", async () => ({ output: { concept: "missing fields" } })],
  ])("uses the curated fallback after %s", async (_label, generate) => {
    const feedback = await getMentorFeedback(request, { generate });
    expect(feedback.source).toBe("mock");
    expect(mentorFeedbackSchema.safeParse(feedback).success).toBe(true);
  });

  it("times out into the curated fallback", async () => {
    const feedback = await getMentorFeedback(request, {
      generate: async () => new Promise(() => undefined),
      timeoutMs: 5,
    });
    expect(feedback.source).toBe("mock");
  });

  it("pins the requested response language and microphone boundary", () => {
    expect(mentorInstructions("es")).toContain("Spanish");
    expect(mentorInstructions("es")).toContain("Never claim to have heard a microphone");
  });
});
