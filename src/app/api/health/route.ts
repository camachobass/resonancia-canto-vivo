export function GET() {
  return Response.json({
    status: "ok",
    version: "day-3",
    worlds: ["air", "water"],
    mentor: process.env.OPENAI_API_KEY ? "openai-ready" : "curated-fallback",
    model: process.env.OPENAI_MENTOR_MODEL || "gpt-5.6-luna",
  });
}
