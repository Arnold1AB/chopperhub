import { supabase } from "@/lib/supabase";

export type MealDraft = {
  name: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack" | "drink" | "unknown";
  portion: "small" | "regular" | "large" | "custom" | "unknown";
  ingredients: string[];
  confidence: "low" | "medium" | "high";
  caloriesEstimateMin: number | null;
  caloriesEstimateMax: number | null;
  protein: number;
  carbs: number;
  fat: number;
  fibre: number;
  sugar: number;
  sodium: number;
  followUpQuestions: string[];
  warnings: string[];
};

export type AnalyzeMealInput = {
  description: string;
  mealType: string;
  portion: string;
  imageUrl?: string;
};

export async function analyzeMealDraft(input: AnalyzeMealInput) {
  const { data, error } = await supabase.functions.invoke<{
    draft?: MealDraft;
    error?: string;
  }>("analyze-meal", {
    body: input,
  });

  if (error) {
    console.log("ANALYZE MEAL FUNCTION ERROR:", error);
    throw new Error("Meal analysis is unavailable right now.");
  }

  if (!data?.draft) {
    throw new Error(data?.error ?? "No meal draft was returned.");
  }

  return data.draft;
}
