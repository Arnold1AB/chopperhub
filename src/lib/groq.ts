import { supabase } from "@/lib/supabase";

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
    const { data: result, error } = await supabase.functions.invoke<{
      summary?: string;
      error?: string;
    }>("mealysis", {
      body: { data },
    });

    if (error) {
      console.log("MEALYSIS FUNCTION ERROR:", error);
      return "Meal-lysis is unavailable right now. Your tracker data is still saved.";
    }

    if (!result?.summary) {
      return (
        result?.error ??
        "Meal-lysis is unavailable right now. Your tracker data is still saved."
      );
    }

    return result.summary;
  } catch (error) {
    console.log("MEALYSIS REQUEST ERROR:", error);
    return "Meal-lysis is unavailable right now. Your tracker data is still saved.";
  }
}
