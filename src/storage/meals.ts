import AsyncStorage from "@react-native-async-storage/async-storage";

export type Meal = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  createdAt: string;
};

const MEALS_KEY = "meals";

export const getMeals = async (): Promise<Meal[]> => {
  try {
    const data = await AsyncStorage.getItem(MEALS_KEY);

    if (!data) {
      return [];
    }

    return JSON.parse(data);
  } catch (error) {
    console.error("Error getting meals:", error);
    return [];
  }
};

export const addMeal = async (
  meal: Omit<Meal, "id" | "createdAt">,
): Promise<Meal> => {
  try {
    const meals = await getMeals();

    const newMeal: Meal = {
      ...meal,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    const updatedMeals = [newMeal, ...meals];

    await AsyncStorage.setItem(MEALS_KEY, JSON.stringify(updatedMeals));

    console.log("Meal saved successfully:");
    console.log(newMeal);

    return newMeal;
  } catch (error) {
    console.error("Error saving meal:", error);
    throw error;
  }
};

export const clearMeals = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(MEALS_KEY);

    console.log("All meals cleared");
  } catch (error) {
    console.error("Error clearing meals:", error);
  }
};

export const deleteMeal = async (id: string): Promise<void> => {
  const meals = await getMeals();
  const filtered = meals.filter((meal) => meal.id !== id);
  await AsyncStorage.setItem(MEALS_KEY, JSON.stringify(filtered));
};

export const clearAllMeals = async (): Promise<void> => {
  await AsyncStorage.removeItem(MEALS_KEY);
};
