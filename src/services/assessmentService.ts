import { supabase } from "../lib/supabase";

export type FitnessGoal = "lose_fat" | "gain_muscle" | "recomposition" | "conditioning";
export type ExperienceLevel = "beginner" | "intermediate" | "advanced";
export type EquipmentAccess = "full_gym" | "basic_gym" | "home";
export type TrainingStyle = "machines" | "free_weights" | "mixed" | "no_preference";
export type DailyActivity = "sedentary" | "light" | "moderate" | "high";
export type DietaryPattern = "omnivore" | "vegetarian" | "vegan" | "low_carb" | "no_preference";
export type AutoPlanStatus = "allowed" | "review_required";

export type FitnessAssessment = {
  id: string;
  user_id: string;
  age: number;
  weight_kg: number;
  height_cm: number;
  goal: FitnessGoal;
  experience: ExperienceLevel;
  training_days: number;
  session_minutes: number;
  equipment_access: EquipmentAccess;
  training_style: TrainingStyle;
  daily_activity: DailyActivity;
  sleep_hours: number | null;
  dietary_pattern: DietaryPattern;
  meals_per_day: number;
  allergies: string;
  foods_avoid: string;
  injury_or_pain: boolean;
  injury_details: string;
  medical_restriction: boolean;
  medical_details: string;
  exertion_warning_signs: boolean;
  warning_details: string;
  consent_sensitive_data: boolean;
  auto_plan_status: AutoPlanStatus;
  training_recommendation: string;
  nutrition_recommendation: string;
  created_at: string;
  updated_at: string;
};

export type FitnessAssessmentInput = Omit<FitnessAssessment,
  "id" | "user_id" | "auto_plan_status" | "training_recommendation" |
  "nutrition_recommendation" | "created_at" | "updated_at"
>;

function client() {
  if (!supabase) throw new Error("Supabase não configurado.");
  return supabase;
}

async function currentUserId() {
  const api = client();
  const { data, error } = await api.auth.getUser();
  if (error || !data.user) throw new Error("Sessão não encontrada.");
  return data.user.id;
}

export function buildAssessmentRecommendation(input: FitnessAssessmentInput) {
  const requiresReview =
    input.age < 18 ||
    input.injury_or_pain ||
    input.medical_restriction ||
    input.exertion_warning_signs;

  const training = requiresReview
    ? "Revisão profissional recomendada antes de gerar treino automático."
    : chooseTrainingSplit(input.experience, input.training_days, input.session_minutes, input.goal);

  const nutrition = chooseNutritionStrategy(input.goal, input.dietary_pattern, input.allergies, input.foods_avoid);

  return {
    autoPlanStatus: requiresReview ? "review_required" as const : "allowed" as const,
    trainingRecommendation: training,
    nutritionRecommendation: nutrition,
  };
}

function chooseTrainingSplit(level: ExperienceLevel, days: number, minutes: number, goal: FitnessGoal) {
  let split = "";
  if (level === "beginner") {
    if (days <= 2) split = "Full Body A/B";
    else if (days === 3) split = "Full Body A/B/C";
    else split = "Upper/Lower 4x + 1 dia leve opcional";
  } else {
    if (days <= 2) split = "Upper/Lower";
    else if (days === 3) split = "Upper/Lower/Full Body";
    else if (days === 4) split = "Upper/Lower 2x";
    else if (days === 5) split = "Push/Pull/Legs/Upper/Lower";
    else split = "Push/Pull/Legs 2x";
  }

  const exerciseCount = minutes <= 35 ? "4–5" : minutes <= 50 ? "5–6" : minutes <= 70 ? "6–7" : "7–8";
  const focus = goal === "conditioning"
    ? "com cardio e condicionamento integrados"
    : goal === "gain_muscle"
      ? "com foco em hipertrofia e progressão de carga"
      : goal === "lose_fat"
        ? "com musculação como base e cardio complementar"
        : "com foco em recomposição corporal";

  return `${split}, ${exerciseCount} exercícios por sessão, ${focus}.`;
}

function chooseNutritionStrategy(goal: FitnessGoal, pattern: DietaryPattern, allergies: string, foodsAvoid: string) {
  const strategy = goal === "lose_fat"
    ? "Déficit calórico leve, proteína alta e alimentos minimamente processados."
    : goal === "gain_muscle"
      ? "Leve superávit calórico, proteína adequada e carboidratos suficientes para sustentar o treino."
      : goal === "recomposition"
        ? "Calorias próximas da manutenção ou leve déficit, proteína alta e distribuição de carboidratos ao redor do treino."
        : "Calorias próximas da manutenção, alimentação equilibrada e carboidratos suficientes para desempenho.";

  const patternText = pattern === "vegetarian"
    ? " Adaptar fontes proteicas para padrão vegetariano."
    : pattern === "vegan"
      ? " Adaptar fontes proteicas e micronutrientes para padrão vegano."
      : pattern === "low_carb"
        ? " Respeitar preferência por carboidrato reduzido sem comprometer desempenho e variedade alimentar."
        : "";

  const restrictions = allergies.trim() || foodsAvoid.trim()
    ? " O plano deve excluir alergias, intolerâncias e alimentos informados pelo usuário."
    : "";

  return strategy + patternText + restrictions;
}

export async function fetchOwnAssessment(): Promise<FitnessAssessment | null> {
  const api = client();
  const userId = await currentUserId();
  const { data, error } = await api
    .from("fitness_assessments")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return (data as FitnessAssessment | null) ?? null;
}

export async function saveOwnAssessment(input: FitnessAssessmentInput): Promise<FitnessAssessment> {
  const api = client();
  const userId = await currentUserId();
  const recommendation = buildAssessmentRecommendation(input);

  const { data, error } = await api
    .from("fitness_assessments")
    .upsert({
      user_id: userId,
      ...input,
      auto_plan_status: recommendation.autoPlanStatus,
      training_recommendation: recommendation.trainingRecommendation,
      nutrition_recommendation: recommendation.nutritionRecommendation,
    }, { onConflict: "user_id" })
    .select("*")
    .single();

  if (error) throw error;
  return data as FitnessAssessment;
}
