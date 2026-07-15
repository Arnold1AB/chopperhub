const { callGroqJson, cleanText, withHandler } = require("./_shared/backend");

exports.handler = withHandler(async ({ body }) => {
  const description = cleanText(body.description);
  const mealType = cleanText(body.mealType, 40) || "unknown";
  const portion = cleanText(body.portion, 40) || "unknown";
  const imageUrl = cleanText(body.imageUrl, 1000);

  if (!description && !imageUrl) {
    const error = new Error("Provide a meal description or image URL.");
    error.statusCode = 400;
    throw error;
  }

  const draft = await callGroqJson({
    model: process.env.GROQ_MEAL_MODEL || "openai/gpt-oss-120b",
    system:
      "You create estimated meal drafts for ChopperHub. Return only valid JSON. Nutrition values are practical estimates, not medical advice. Preserve Nigerian and African meal names naturally.",
    user: `Return JSON with this exact shape: {"draft":{"name":"string","mealType":"breakfast|lunch|dinner|snack|drink|unknown","portion":"small|regular|large|custom|unknown","ingredients":["string"],"confidence":"low|medium|high","caloriesEstimateMin":number|null,"caloriesEstimateMax":number|null,"protein":number,"carbs":number,"fat":number,"fibre":number,"sugar":number,"sodium":number,"water":number,"followUpQuestions":["string"],"warnings":["string"]}}.

Meal description: ${description || "not provided"}
Meal type selected by user: ${mealType}
Portion selected by user: ${portion}
Image URL: ${imageUrl || "not provided"}

If details are missing, ask concise follow-up questions. If a nutrient cannot be reasonably inferred, use 0 for that nutrient instead of inventing precision.`,
  });

  return { draft: draft.draft ?? draft };
});
