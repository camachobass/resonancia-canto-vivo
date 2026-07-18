import { mentorRequestSchema, mockMentorFeedback } from "@/lib/game";
import { getMentorFeedback } from "@/lib/mentor-service";

const MAX_BODY_BYTES = 4_096;
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 6;
const requestsBySession = new Map<string, { count: number; resetsAt: number }>();

function canCallOpenAI(sessionId: string, now = Date.now()) {
  const current = requestsBySession.get(sessionId);
  if (!current || current.resetsAt <= now) {
    if (requestsBySession.size >= 1_000) {
      for (const [key, value] of requestsBySession) {
        if (value.resetsAt <= now) requestsBySession.delete(key);
      }
      if (requestsBySession.size >= 1_000) return false;
    }
    requestsBySession.set(sessionId, { count: 1, resetsAt: now + WINDOW_MS });
    return true;
  }
  if (current.count >= MAX_REQUESTS_PER_WINDOW) return false;
  current.count += 1;
  return true;
}

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > MAX_BODY_BYTES) {
      return Response.json({ error: "Request too large" }, { status: 413 });
    }

    const parsed = mentorRequestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return Response.json(
        { error: "Invalid composition", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    if (!canCallOpenAI(parsed.data.playerSessionId)) {
      return Response.json(
        mockMentorFeedback(parsed.data.language, parsed.data.composition),
        { headers: { "X-Mentor-Fallback": "rate-limit" } },
      );
    }

    return Response.json(await getMentorFeedback(parsed.data));
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
}
