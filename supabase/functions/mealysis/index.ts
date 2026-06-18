import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

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

const metricKeys: Array<keyof TrackerData> = [
  "meals",
  "calories",
  "protein",
  "carbs",
  "fat",
  "fibre",
  "sugar",
  "sodium",
  "water",
];

const ensureTerminalPunctuation = (text: string) => {
  const cleaned = text.trim();

  if (!cleaned) return cleaned;

  return /[.!?]$/.test(cleaned) ? cleaned : `${cleaned}.`;
};

const normalizeTrackerData = (input: Partial<TrackerData>): TrackerData =>
  metricKeys.reduce(
    (acc, key) => {
      const value = Number(input[key] ?? 0);
      acc[key] = Number.isFinite(value) ? value : 0;
      return acc;
    },
    {} as TrackerData,
  );

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  try {
    const groqApiKey = Deno.env.get("GROQ_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!groqApiKey || !supabaseUrl || !supabaseAnonKey) {
      return jsonResponse({ error: "Meal-lysis service is not configured." }, 500);
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return jsonResponse({ error: "Unauthorized." }, 401);
    }

    const { data: rawData } = (await req.json()) as {
      data?: Partial<TrackerData>;
    };
    const data = normalizeTrackerData(rawData ?? {});

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
- Mention hydration as it is useful from the water total entered.
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
          Authorization: `Bearer ${groqApiKey}`,
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

    const payload = await response.json();

    if (!response.ok) {
      console.error("MEALYSIS GROQ ERROR:", payload);
      return jsonResponse({ error: "Meal-lysis is unavailable right now." }, 502);
    }

    const summary = payload?.choices?.[0]?.message?.content;

    if (typeof summary !== "string" || !summary.trim()) {
      return jsonResponse({ error: "No Meal-lysis summary was returned." }, 502);
    }

    return jsonResponse({ summary: ensureTerminalPunctuation(summary) });
  } catch (error) {
    console.error("MEALYSIS ERROR:", error);
    return jsonResponse({ error: "Unable to generate Meal-lysis analysis." }, 500);
  }
});
