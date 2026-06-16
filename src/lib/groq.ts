const API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;

console.log(
  "GROQ API KEY:",
  API_KEY ? API_KEY.substring(0, 8) + "..." : "NOT FOUND",
);

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

export async function getTrackerSummary(data: TrackerData) {
  try {
    if (!API_KEY) {
      return "Groq API key is missing.";
    }

    const prompt = `
You are ChopperHub Assistant.

Analyze today's nutrition log and provide a short nutrition insight.

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
- Start with a cordial welcome and mention user name and thank them to keep track.
- Keep the response under 200 words.
- Use only one paragraph.
- Be supportive and practical.
- Mention one positive observation.
- Mention one improvement suggestion.
- Mention hydration if water intake appears low.
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
                "You are ChopperHub Assistant. Summarize only the nutrition data provided. Do not give medical advice or recommendations.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.4,
          max_completion_tokens: 150,
        }),
      },
    );

    const json = await response.json();

    console.log("GROQ STATUS:", response.status);
    console.log("GROQ RESPONSE:", JSON.stringify(json, null, 2));

    if (!response.ok) {
      return `Groq Error (${response.status})`;
    }

    return (
      json?.choices?.[0]?.message?.content ??
      "No assistant summary was returned."
    );
  } catch (error) {
    console.error("Error fetching from Groq:", error);
    return "An error occurred while processing your nutrition data.";
  }
}
