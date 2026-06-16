import { supabase } from "@/lib/supabase";

export type Meal = {
  date: string;
  id: string;
  user_id: string;

  name: string;

  quantity: number;

  protein: number;
  carbs: number;
  fat: number;

  fibre: number;
  sugar: number;
  sodium: number;

  water: number;

  created_at: string;
};

async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  return user;
}

export async function getMeals(): Promise<Meal[]> {
  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from("meals")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("GET MEALS ERROR:", error);
    throw error;
  }

  return data ?? [];
}

export async function addMeal(meal: {
  name: string;

  quantity: number;

  protein: number;
  carbs: number;
  fat: number;

  fibre: number;
  sugar: number;
  sodium: number;

  water: number;
}): Promise<Meal> {
  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from("meals")
    .insert({
      user_id: user.id,

      name: meal.name.trim(),

      quantity: Number(meal.quantity) || 0,

      protein: Number(meal.protein) || 0,
      carbs: Number(meal.carbs) || 0,
      fat: Number(meal.fat) || 0,

      fibre: Number(meal.fibre) || 0,
      sugar: Number(meal.sugar) || 0,
      sodium: Number(meal.sodium) || 0,

      water: Number(meal.water) || 0,
    })
    .select()
    .single();

  if (error) {
    console.error("ADD MEAL ERROR:", error);
    throw error;
  }

  return data;
}

export async function deleteMeal(id: string): Promise<void> {
  const { error } = await supabase.from("meals").delete().eq("id", id);

  if (error) {
    console.error("DELETE MEAL ERROR:", error);
    throw error;
  }
}

export async function clearAllMeals(): Promise<void> {
  const user = await getCurrentUser();

  const { error } = await supabase
    .from("meals")
    .delete()
    .eq("user_id", user.id);

  if (error) {
    console.error("CLEAR MEALS ERROR:", error);
    throw error;
  }
}

export async function getMealTotals() {
  const meals = await getMeals();

  return meals.reduce(
    (acc, meal) => ({
      quantity: acc.quantity + Number(meal.quantity),

      protein: acc.protein + Number(meal.protein),
      carbs: acc.carbs + Number(meal.carbs),
      fat: acc.fat + Number(meal.fat),

      fibre: acc.fibre + Number(meal.fibre),
      sugar: acc.sugar + Number(meal.sugar),
      sodium: acc.sodium + Number(meal.sodium),

      water: acc.water + Number(meal.water),
    }),
    {
      quantity: 0,

      protein: 0,
      carbs: 0,
      fat: 0,

      fibre: 0,
      sugar: 0,
      sodium: 0,

      water: 0,
    },
  );
}

export async function getNutritionSummary() {
  const totals = await getMealTotals();

  const estimatedCalories =
    totals.protein * 4 + totals.carbs * 4 + totals.fat * 9;

  return {
    estimatedCalories,

    quantity: totals.quantity,

    protein: totals.protein,
    carbs: totals.carbs,
    fat: totals.fat,

    fibre: totals.fibre,
    sugar: totals.sugar,
    sodium: totals.sodium,

    water: totals.water,
  };
}

export async function getTodayMeals() {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("meals")
    .select("*")
    .gte("created_at", `${today}T00:00:00`)
    .lt("created_at", `${today}T23:59:59`);

  if (error) throw error;

  return data;
}

export async function clearTodayMeals() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User not found");

  const now = new Date();

  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  console.log("USER ID:", user.id);
  console.log("START:", start.toISOString());
  console.log("END:", end.toISOString());

  const { data, error } = await supabase
    .from("meals")
    .delete()
    .eq("user_id", user.id)
    .gte("created_at", start.toISOString())
    .lt("created_at", end.toISOString())
    .select();

  console.log("DELETED ROWS:", data);
  console.log("DELETE ERROR:", error);

  if (error) {
    throw error;
  }
}
