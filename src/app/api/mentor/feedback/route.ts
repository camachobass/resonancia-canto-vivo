import { mentorRequestSchema, mockMentorFeedback } from "@/lib/game";

export async function POST(request: Request) {
  try {
    const parsed = mentorRequestSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: "Invalid composition", issues: parsed.error.issues }, { status: 400 });
    return Response.json(mockMentorFeedback(parsed.data.language, parsed.data.composition));
  } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
}
