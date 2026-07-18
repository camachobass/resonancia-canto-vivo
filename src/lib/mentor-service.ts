import { createHash } from "node:crypto";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import {
  ensurePlayableVariation,
  mentorModelOutputSchema,
  mockMentorFeedback,
  type MentorFeedback,
  type MentorRequest,
} from "./game";

export const DEFAULT_MENTOR_MODEL = "gpt-5.6-luna";
export const MENTOR_MAX_OUTPUT_TOKENS = 420;
export const MENTOR_TIMEOUT_MS = 8_000;

type MentorGeneration = {
  output: unknown;
  model?: string;
};

export type MentorGenerator = (
  request: MentorRequest,
  signal: AbortSignal,
) => Promise<MentorGeneration>;

type MentorServiceOptions = {
  generate?: MentorGenerator;
  timeoutMs?: number;
};

let openAI: OpenAI | null = null;

function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");
  openAI ??= new OpenAI({ apiKey, maxRetries: 0 });
  return openAI;
}

function safetyIdentifier(playerSessionId: string) {
  return createHash("sha256")
    .update(`resonancia:${playerSessionId}`)
    .digest("hex");
}

export function mentorInstructions(language: MentorRequest["language"]) {
  const responseLanguage = language === "es" ? "Spanish" : "English";
  return [
    "You are Echo, a warm musical mentor for players age 5 and older.",
    `Write every field in ${responseLanguage}.`,
    "Name choices that are present in the supplied composition.",
    "Explain one simple relationship between tempo, melodic contour, or timbre and musical character.",
    "Propose exactly one playable variation using only the allowed schema values.",
    "Never claim to have heard a microphone, recording, voice, or performance.",
    "Keep each field vivid, encouraging, concrete, and under two short sentences.",
  ].join(" ");
}

export const generateWithOpenAI: MentorGenerator = async (request, signal) => {
  const model = process.env.OPENAI_MENTOR_MODEL?.trim() || DEFAULT_MENTOR_MODEL;
  const response = await getOpenAI().responses.parse(
    {
      model,
      instructions: mentorInstructions(request.language),
      input: JSON.stringify({
        scene: request.sceneId,
        composition: request.composition,
      }),
      reasoning: { effort: "none" },
      text: {
        format: zodTextFormat(mentorModelOutputSchema, "echo_mentor_feedback"),
      },
      max_output_tokens: MENTOR_MAX_OUTPUT_TOKENS,
      safety_identifier: safetyIdentifier(request.playerSessionId),
      store: false,
    },
    { signal },
  );

  if (!response.output_parsed) {
    throw new Error(`Mentor response was ${response.status}`);
  }

  return { output: response.output_parsed, model: response.model };
};

export async function getMentorFeedback(
  request: MentorRequest,
  options: MentorServiceOptions = {},
): Promise<MentorFeedback> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new Error("Mentor request timed out"));
    }, options.timeoutMs ?? MENTOR_TIMEOUT_MS);
  });

  try {
    const generation = await Promise.race([
      (options.generate ?? generateWithOpenAI)(request, controller.signal),
      timeout,
    ]);
    const parsed = mentorModelOutputSchema.safeParse(generation.output);
    if (!parsed.success) throw new Error("Mentor returned malformed output");

    return {
      ...parsed.data,
      suggestedVariation: ensurePlayableVariation(
        request.composition,
        parsed.data.suggestedVariation,
      ),
      source: "openai",
      model: generation.model || DEFAULT_MENTOR_MODEL,
    };
  } catch {
    return mockMentorFeedback(request.language, request.composition);
  } finally {
    clearTimeout(timer!);
  }
}
