import { supabase } from "../lib/supabase";

export type NutritionMealItem = {
  id: string;
  position: number;
  food_name: string;
  quantity: number | null;
  unit: string;
  notes: string;
};

export type NutritionMeal = {
  id: string;
  position: number;
  name: string;
  time_label: string;
  notes: string;
  nutrition_meal_items: NutritionMealItem[];
};

export type NutritionPlan = {
  id: string;
  title: string;
  objective: string;
  calories_target: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  water_ml: number | null;
  notes: string;
  status: "active" | "archived";
  nutrition_meals: NutritionMeal[];
};

export type CardioSession = {
  id: string;
  position: number;
  weekday: number;
  activity: string;
  duration_min: number;
  intensity: "light" | "moderate" | "vigorous";
  notes: string;
};

export type CardioPlan = {
  id: string;
  title: string;
  objective: string;
  notes: string;
  status: "active" | "archived";
  cardio_sessions: CardioSession[];
};

export type BodyMeasurement = {
  id: string;
  student_id: string;
  measured_at: string;
  weight_kg: number | null;
  waist_cm: number | null;
  body_fat_percent: number | null;
  notes: string;
  created_at: string;
  updated_at: string;
};

export type HealthDashboard = {
  nutritionPlan: NutritionPlan | null;
  cardioPlan: CardioPlan | null;
  measurements: BodyMeasurement[];
};

function client() {
  if (!supabase) throw new Error("Supabase não configurado.");
  return supabase;
}

async function currentUserId() {
  const api = client();
  const { data, error } = await api.auth.getUser();
  if (error || !data.user) throw new Error("Sessão do aluno não encontrada.");
  return data.user.id;
}

function normalizeNutritionPlan(row: Record<string, unknown> | null): NutritionPlan | null {
  if (!row) return null;
  const meals = ((row.nutrition_meals ?? []) as NutritionMeal[])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((meal) => ({
      ...meal,
      nutrition_meal_items: (meal.nutrition_meal_items ?? []).slice().sort((a, b) => a.position - b.position),
    }));
  return { ...(row as unknown as NutritionPlan), nutrition_meals: meals };
}

function normalizeCardioPlan(row: Record<string, unknown> | null): CardioPlan | null {
  if (!row) return null;
  const sessions = ((row.cardio_sessions ?? []) as CardioSession[]).slice().sort((a, b) => a.position - b.position);
  return { ...(row as unknown as CardioPlan), cardio_sessions: sessions };
}

export async function fetchOwnHealthDashboard(): Promise<HealthDashboard> {
  const api = client();
  const userId = await currentUserId();

  const [nutritionResult, cardioResult, measurementResult] = await Promise.all([
    api
      .from("nutrition_plans")
      .select("*, nutrition_meals(*, nutrition_meal_items(*))")
      .eq("student_id", userId)
      .eq("status", "active")
      .maybeSingle(),
    api
      .from("cardio_plans")
      .select("*, cardio_sessions(*)")
      .eq("student_id", userId)
      .eq("status", "active")
      .maybeSingle(),
    api
      .from("body_measurements")
      .select("*")
      .eq("student_id", userId)
      .order("measured_at", { ascending: false })
      .limit(12),
  ]);

  if (nutritionResult.error) throw nutritionResult.error;
  if (cardioResult.error) throw cardioResult.error;
  if (measurementResult.error) throw measurementResult.error;

  return {
    nutritionPlan: normalizeNutritionPlan((nutritionResult.data ?? null) as Record<string, unknown> | null),
    cardioPlan: normalizeCardioPlan((cardioResult.data ?? null) as Record<string, unknown> | null),
    measurements: (measurementResult.data ?? []) as BodyMeasurement[],
  };
}

export async function saveOwnMeasurement(input: {
  measuredAt: string;
  weightKg: number | null;
  waistCm: number | null;
  bodyFatPercent: number | null;
  notes?: string;
}): Promise<BodyMeasurement> {
  const api = client();
  const userId = await currentUserId();
  if (input.weightKg == null && input.waistCm == null && input.bodyFatPercent == null) {
    throw new Error("Informe pelo menos peso, cintura ou percentual de gordura.");
  }

  const { data, error } = await api
    .from("body_measurements")
    .upsert({
      student_id: userId,
      measured_at: input.measuredAt,
      weight_kg: input.weightKg,
      waist_cm: input.waistCm,
      body_fat_percent: input.bodyFatPercent,
      notes: input.notes?.trim() ?? "",
      created_by: userId,
    }, { onConflict: "student_id,measured_at" })
    .select("*")
    .single();

  if (error) throw error;
  return data as BodyMeasurement;
}
