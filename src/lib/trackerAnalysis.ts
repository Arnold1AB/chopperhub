import { postToApi } from "@/lib/apiClient";
import { Meal } from "@/lib/meals";

export type TrackerAnalysisInput = {
  generatedAt: string;
  windowDays: number;
  mealsLogged: number;
  loggedDays: number;
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fibre: number;
    sugar: number;
    sodium: number;
    water: number;
  };
  averages: {
    mealsPerLoggedDay: number;
    caloriesPerLoggedDay: number;
    proteinPerLoggedDay: number;
    waterPerLoggedDay: number;
  };
  recentMealNames: string[];
};

export type TrackerAnalysis = {
  summary: string;
  strengths: string[];
  nutrientGaps: string[];
  patterns: string[];
  nextActions: string[];
  exportText: string;
};

type Totals = TrackerAnalysisInput["totals"];

const emptyTotals: Totals = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  fibre: 0,
  sugar: 0,
  sodium: 0,
  water: 0,
};

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const getCalories = (meal: Meal) =>
  Number(meal.protein || 0) * 4 +
  Number(meal.carbs || 0) * 4 +
  Number(meal.fat || 0) * 9;

export function getMealsInLastDays(meals: Meal[], days: number) {
  const now = new Date();
  const start = startOfDay(
    new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1)),
  );

  return meals.filter((meal) => new Date(meal.created_at) >= start);
}

export function calculateMealTotals(meals: Meal[]): Totals {
  return meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + getCalories(meal),
      protein: acc.protein + Number(meal.protein || 0),
      carbs: acc.carbs + Number(meal.carbs || 0),
      fat: acc.fat + Number(meal.fat || 0),
      fibre: acc.fibre + Number(meal.fibre || 0),
      sugar: acc.sugar + Number(meal.sugar || 0),
      sodium: acc.sodium + Number(meal.sodium || 0),
      water: acc.water + Number(meal.water || 0),
    }),
    { ...emptyTotals },
  );
}

export function buildTrackerAnalysisInput(
  meals: Meal[],
  windowDays = 30,
): TrackerAnalysisInput {
  const windowMeals = getMealsInLastDays(meals, windowDays);
  const totals = calculateMealTotals(windowMeals);
  const loggedDayKeys = new Set(
    windowMeals.map((meal) =>
      startOfDay(new Date(meal.created_at)).toISOString(),
    ),
  );
  const loggedDays = loggedDayKeys.size;
  const divisor = Math.max(loggedDays, 1);

  return {
    generatedAt: new Date().toISOString(),
    windowDays,
    mealsLogged: windowMeals.length,
    loggedDays,
    totals,
    averages: {
      mealsPerLoggedDay: windowMeals.length / divisor,
      caloriesPerLoggedDay: totals.calories / divisor,
      proteinPerLoggedDay: totals.protein / divisor,
      waterPerLoggedDay: totals.water / divisor,
    },
    recentMealNames: windowMeals.slice(0, 12).map((meal) => meal.name),
  };
}

export async function getTrackerAnalysis(input: TrackerAnalysisInput) {
  const data = await postToApi<{
    analysis?: TrackerAnalysis;
    error?: string;
  }>("/.netlify/functions/tracker-analysis", { data: input });

  if (!data?.analysis) {
    throw new Error(data?.error ?? "No tracker analysis was returned.");
  }

  return data.analysis;
}
