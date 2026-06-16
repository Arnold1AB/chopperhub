import { Meal } from "./meals";

export function groupMealsByDate(meals: Meal[]) {
  const grouped: Record<string, Meal[]> = {};

  meals.forEach((meal) => {
    const date = meal.date || "unknown";

    if (!grouped[date]) {
      grouped[date] = [];
    }

    grouped[date].push(meal);
  });

  return grouped;
}
