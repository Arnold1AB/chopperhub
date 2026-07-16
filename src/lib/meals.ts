import { db } from "@/lib/firebase";
import { requireCurrentUser } from "@/lib/profile";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

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
  meal_type?: string;
  portion_label?: string;
  calories_min?: number | null;
  calories_max?: number | null;
  confidence?: string | null;
  ingredients?: string[];
  follow_up_questions?: string[];
  source?: "typed" | "voice" | "photo" | "manual" | string;
  image_url?: string | null;
  voice_transcript?: string | null;
  created_at: string;
  updated_at?: string;
};

export type AddMealInput = {
  name: string;
  quantity: number;
  protein: number;
  carbs: number;
  fat: number;
  fibre: number;
  sugar: number;
  sodium: number;
  water: number;
  meal_type?: string;
  portion_label?: string;
  calories_min?: number | null;
  calories_max?: number | null;
  confidence?: string | null;
  ingredients?: string[];
  follow_up_questions?: string[];
  source?: string;
  image_url?: string | null;
  voice_transcript?: string | null;
};

export type UpdateMealEstimateInput = Pick<
  AddMealInput,
  | "name"
  | "protein"
  | "carbs"
  | "fat"
  | "fibre"
  | "sugar"
  | "sodium"
  | "water"
  | "meal_type"
  | "calories_min"
  | "calories_max"
  | "confidence"
  | "ingredients"
  | "follow_up_questions"
>;

const userMealsCollection = (uid: string) =>
  collection(db, "users", uid, "meals");

const toNumber = (value: unknown) => Number(value) || 0;

const normalizeMeal = (
  id: string,
  userId: string,
  data: Record<string, any>,
): Meal => ({
  id,
  user_id: userId,
  date: data.date ?? data.created_at ?? new Date().toISOString(),
  name: String(data.name ?? ""),
  quantity: toNumber(data.quantity),
  protein: toNumber(data.protein),
  carbs: toNumber(data.carbs),
  fat: toNumber(data.fat),
  fibre: toNumber(data.fibre),
  sugar: toNumber(data.sugar),
  sodium: toNumber(data.sodium),
  water: toNumber(data.water),
  meal_type: data.meal_type,
  portion_label: data.portion_label,
  calories_min: data.calories_min ?? null,
  calories_max: data.calories_max ?? null,
  confidence: data.confidence ?? null,
  ingredients: Array.isArray(data.ingredients) ? data.ingredients : [],
  follow_up_questions: Array.isArray(data.follow_up_questions)
    ? data.follow_up_questions
    : [],
  source: data.source,
  image_url: data.image_url ?? null,
  voice_transcript: data.voice_transcript ?? null,
  created_at: data.created_at ?? new Date().toISOString(),
  updated_at: data.updated_at,
});

export async function getMeals(): Promise<Meal[]> {
  const user = requireCurrentUser();
  const snapshot = await getDocs(
    query(userMealsCollection(user.uid), orderBy("created_at", "desc")),
  );

  return snapshot.docs.map((mealDoc) =>
    normalizeMeal(mealDoc.id, user.uid, mealDoc.data()),
  );
}

export async function addMeal(meal: AddMealInput): Promise<Meal> {
  const user = requireCurrentUser();
  const now = new Date().toISOString();
  const payload = {
    user_id: user.uid,
    name: meal.name.trim(),
    quantity: toNumber(meal.quantity),
    protein: toNumber(meal.protein),
    carbs: toNumber(meal.carbs),
    fat: toNumber(meal.fat),
    fibre: toNumber(meal.fibre),
    sugar: toNumber(meal.sugar),
    sodium: toNumber(meal.sodium),
    water: toNumber(meal.water),
    meal_type: meal.meal_type ?? null,
    portion_label: meal.portion_label ?? null,
    calories_min: meal.calories_min ?? null,
    calories_max: meal.calories_max ?? null,
    confidence: meal.confidence ?? null,
    ingredients: meal.ingredients ?? [],
    follow_up_questions: meal.follow_up_questions ?? [],
    source: meal.source ?? "typed",
    image_url: meal.image_url ?? null,
    voice_transcript: meal.voice_transcript ?? null,
    date: now,
    created_at: now,
    updated_at: now,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const created = await addDoc(userMealsCollection(user.uid), payload);

  return normalizeMeal(created.id, user.uid, payload);
}

export async function updateMealEstimate(
  id: string,
  estimate: UpdateMealEstimateInput,
): Promise<void> {
  const user = requireCurrentUser();

  await updateDoc(doc(db, "users", user.uid, "meals", id), {
    name: estimate.name.trim(),
    protein: toNumber(estimate.protein),
    carbs: toNumber(estimate.carbs),
    fat: toNumber(estimate.fat),
    fibre: toNumber(estimate.fibre),
    sugar: toNumber(estimate.sugar),
    sodium: toNumber(estimate.sodium),
    water: toNumber(estimate.water),
    meal_type: estimate.meal_type ?? null,
    calories_min: estimate.calories_min ?? null,
    calories_max: estimate.calories_max ?? null,
    confidence: estimate.confidence ?? null,
    ingredients: estimate.ingredients ?? [],
    follow_up_questions: estimate.follow_up_questions ?? [],
    updated_at: new Date().toISOString(),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteMeal(id: string): Promise<void> {
  const user = requireCurrentUser();
  await deleteDoc(doc(db, "users", user.uid, "meals", id));
}

export async function clearAllMeals(): Promise<void> {
  const user = requireCurrentUser();
  const snapshot = await getDocs(userMealsCollection(user.uid));
  const batch = writeBatch(db);

  snapshot.docs.forEach((mealDoc) => batch.delete(mealDoc.ref));

  await batch.commit();
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
  const user = requireCurrentUser();
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const snapshot = await getDocs(
    query(
      userMealsCollection(user.uid),
      where("created_at", ">=", start.toISOString()),
      where("created_at", "<", end.toISOString()),
      orderBy("created_at", "desc"),
    ),
  );

  return snapshot.docs.map((mealDoc) =>
    normalizeMeal(mealDoc.id, user.uid, mealDoc.data()),
  );
}

export async function clearTodayMeals() {
  const user = requireCurrentUser();
  const todayMeals = await getTodayMeals();
  const batch = writeBatch(db);

  todayMeals.forEach((meal) =>
    batch.delete(doc(db, "users", user.uid, "meals", meal.id)),
  );

  await batch.commit();
}
