const { callGroqJson, withHandler } = require("./_shared/backend");

exports.handler = withHandler(async ({ body }) => {
  const data = body.data;

  if (!data || Number(data.mealsLogged ?? 0) <= 0) {
    const error = new Error("At least one logged meal is required for tracker analysis.");
    error.statusCode = 400;
    throw error;
  }

  const analysis = await callGroqJson({
    model: process.env.GROQ_TRACKER_MODEL || "openai/gpt-oss-120b",
    system:
      "You create practical nutrition tracker analysis for ChopperHub. Use only supplied meal totals. Return only valid JSON. Do not diagnose, prescribe, or make medical claims.",
    user: `Return JSON with this exact shape: {"analysis":{"summary":"string","strengths":["string"],"nutrientGaps":["string"],"patterns":["string"],"nextActions":["string"],"exportText":"string"}}.

Analyze this ChopperHub 30-day tracker input:
${JSON.stringify(data, null, 2)}

Rules:
- Summary: 45-80 words.
- Strengths: 2 short bullets.
- Nutrient gaps: 2 short bullets.
- Patterns: 2 short bullets.
- Next actions: 2 short practical actions.
- Export text: polished shareable report under 220 words.
- Mention that nutrition values are estimates.
- Do not list all meals or all 30 days.`,
  });

  return { analysis: analysis.analysis ?? analysis };
});
