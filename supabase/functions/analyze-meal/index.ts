import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

type MealDraftRequest = {
  description?: string;
  mealType?: string;
  portion?: string;
  imageUrl?: string;
};

const mealDraftSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "name",
    "mealType",
    "portion",
    "ingredients",
    "confidence",
    "caloriesEstimateMin",
    "caloriesEstimateMax",
    "protein",
    "carbs",
    "fat",
    "fibre",
    "sugar",
    "sodium",
    "followUpQuestions",
    "warnings",
  ],
  properties: {
    name: { type: "string" },
    mealType: {
      type: "string",
      enum: ["breakfast", "lunch", "dinner", "snack", "drink", "unknown"],
    },
    portion: {
      type: "string",
      enum: ["small", "regular", "large", "custom", "unknown"],
    },
    ingredients: {
      type: "array",
      items: { type: "string" },
    },
    confidence: {
      type: "string",
      enum: ["low", "medium", "high"],
    },
    caloriesEstimateMin: { type: ["number", "null"] },
    caloriesEstimateMax: { type: ["number", "null"] },
    protein: { type: "number" },
    carbs: { type: "number" },
    fat: { type: "number" },
    fibre: { type: "number" },
    sugar: { type: "number" },
    sodium: { type: "number" },
    followUpQuestions: {
      type: "array",
      items: { type: "string" },
    },
    warnings: {
      type: "array",
      items: { type: "string" },
    },
  },
};

const cleanText = (value: unknown, maxLength = 600) =>
  typeof value === "string" ? value.trim().slice(0, maxLength) : "";

const parseMealDraft = (payload: unknown) => {
  const outputText =
    typeof (payload as { output_text?: unknown })?.output_text === "string"
      ? (payload as { output_text: string }).output_text
      : undefined;

  if (outputText) {
    return JSON.parse(outputText);
  }

  const output = (payload as { output?: unknown[] })?.output;
  const message = output?.find(
    (item) => (item as { type?: string })?.type === "message",
  ) as { content?: unknown[] } | undefined;
  const content = message?.content?.find(
    (item) => (item as { type?: string })?.type === "output_text",
  ) as { text?: string } | undefined;

  if (!content?.text) {
    throw new Error("No structured meal draft was returned.");
  }

  return JSON.parse(content.text);
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  try {
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!openaiApiKey || !supabaseUrl || !supabaseAnonKey) {
      return jsonResponse({ error: "Meal analysis is not configured." }, 500);
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

    const body = (await req.json()) as MealDraftRequest;
    const description = cleanText(body.description);
    const mealType = cleanText(body.mealType, 40) || "unknown";
    const portion = cleanText(body.portion, 40) || "unknown";
    const imageUrl = cleanText(body.imageUrl, 1000);

    if (!description && !imageUrl) {
      return jsonResponse(
        { error: "Provide a meal description or image URL." },
        400,
      );
    }

    const model = Deno.env.get("OPENAI_MEAL_MODEL") ?? "gpt-5.5";

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model,
        input: [
          {
            role: "developer",
            content:
              "You create estimated meal drafts for ChopperHub. Return only structured data that matches the schema. Nutrition values are practical estimates, not medical advice. Prefer ranges and follow-up questions when uncertain. Preserve Nigerian and African meal names naturally.",
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `Meal description: ${description || "not provided"}\nMeal type selected by user: ${mealType}\nPortion selected by user: ${portion}\nImage URL: ${
                  imageUrl || "not provided"
                }\n\nEstimate ingredients, calories, macros, confidence, warnings, and follow-up questions. If the user already selected meal type or portion, use it unless it clearly conflicts with the description.`,
              },
            ],
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "meal_draft",
            strict: true,
            schema: mealDraftSchema,
          },
        },
      }),
    });

    const payload = await response.json();

    if (!response.ok) {
      console.error("ANALYZE MEAL OPENAI ERROR:", payload);
      return jsonResponse({ error: "Meal analysis is unavailable." }, 502);
    }

    const draft = parseMealDraft(payload);

    return jsonResponse({ draft });
  } catch (error) {
    console.error("ANALYZE MEAL ERROR:", error);
    return jsonResponse({ error: "Unable to analyze meal." }, 500);
  }
});
