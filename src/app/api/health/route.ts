export function GET() {
  return Response.json({
    status: "ok",
    version: "day-4-final",
    release: "build-week-final",
    worlds: ["air", "water"],
    accessibility: ["keyboard", "touch", "reduced-motion"],
    mentor: process.env.OPENAI_API_KEY ? "openai-ready" : "curated-fallback",
    model: process.env.OPENAI_MENTOR_MODEL || "gpt-5.6-luna",
  });
}
