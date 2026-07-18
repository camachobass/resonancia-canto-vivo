import { describe, expect, it, vi } from "vitest";
import { mentorFeedbackSchema } from "@/lib/game";
import { POST } from "./route";

const validRequest = {
  sceneId: "dog-walk",
  language: "es",
  playerSessionId: "61381960-4fbd-46d6-bc2a-2870607ecfea",
  composition: {
    tempo: 120,
    contour: "rising",
    instruments: ["flute"],
  },
};

describe("POST /api/mentor/feedback", () => {
  it("returns the validated fallback when OpenAI is unavailable", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    const response = await POST(new Request("http://localhost/api/mentor/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validRequest),
    }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.source).toBe("mock");
    expect(mentorFeedbackSchema.safeParse(body).success).toBe(true);
    vi.unstubAllEnvs();
  });

  it("rejects malformed requests before a model call", async () => {
    const response = await POST(new Request("http://localhost/api/mentor/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...validRequest, playerSessionId: "a child name" }),
    }));
    expect(response.status).toBe(400);
  });

  it("rejects oversized bodies", async () => {
    const response = await POST(new Request("http://localhost/api/mentor/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": "5000" },
      body: JSON.stringify(validRequest),
    }));
    expect(response.status).toBe(413);
  });
});
