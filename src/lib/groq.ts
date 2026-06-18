const API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;

type TrackerData = {
  meals: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fibre: number;
  sugar: number;
  sodium: number;
  water: number;
};

const ensureTerminalPunctuation = (text: string) => {
  const cleaned = text.trim();

  if (!cleaned) return cleaned;

  return /[.!?]$/.test(cleaned) ? cleaned : `${cleaned}.`;
};

export async function getTrackerSummary(data: TrackerData) {
  try {
    if (!API_KEY) {
      return "Groq API key is missing.";
    }

    const prompt = `
You are Meal-lysis, a premium nutrition analysis feature inside ChopperHub.

Analyze today's nutrition log like a thoughtful nutrition coach reviewing a daily dashboard. Go beyond repeating the numbers: infer the pattern, explain what it may mean for energy, balance, satiety, hydration, and next-meal planning, then give one practical next action.

Today's totals:

Meals Logged: ${data.meals}
Calories: ${data.calories}
Protein: ${data.protein}g
Carbohydrates: ${data.carbs}g
Fat: ${data.fat}g
Fibre: ${data.fibre}g
Sugar: ${data.sugar}g
Sodium: ${data.sodium}mg
Water: ${data.water}L

Rules:
- Keep the response between 70 and 120 words.
- Use only one paragraph.
- Sound polished, premium, specific, and calm.
- Do not simply restate the totals.
- Mention the strongest pattern you can infer from the data.
- Include one positive observation.
- Include one precise improvement suggestion for the next meal or the rest of the day.
- Mention hydration as it very useful from the water total entered.
- End with a complete sentence and terminal punctuation.
- Do not use bullet points.
- Do not use headings.
- Do not use medical advice.
- Do not mention being an AI.
- Speak directly to the user.
`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content:
                "You are Meal-lysis, a premium nutrition analyst for daily meal logs. Provide concise, data-grounded coaching from only the supplied totals. Avoid diagnosis, treatment claims, generic encouragement, and long disclaimers. Always end with terminal punctuation.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.55,
          max_completion_tokens: 180,
        }),
      },
    );

    const json = await response.json();

    if (!response.ok) {
      return "Meal-lysis is unavailable right now. Your tracker data is still saved.";
    }

    return ensureTerminalPunctuation(
      json?.choices?.[0]?.message?.content ??
        "No Meal-lysis summary was returned.",
    );
  } catch (error) {
    console.error("Error fetching from Groq:", error);
    return "An error occurred while processing your nutrition data.";
  }
}
