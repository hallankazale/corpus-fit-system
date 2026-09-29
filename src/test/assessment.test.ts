import { describe, expect, it } from "vitest";
import { buildAssessmentRecommendation, type FitnessAssessmentInput } from "../services/assessmentService";

const base: FitnessAssessmentInput = {
  age: 35,
  weight_kg: 83,
  height_cm: 176,
  goal: "recomposition",
  experience: "beginner",
  training_days: 3,
  session_minutes: 60,
  equipment_access: "full_gym",
  training_style: "mixed",
  daily_activity: "moderate",
  sleep_hours: 7,
  dietary_pattern: "no_preference",
  meals_per_day: 4,
  allergies: "",
  foods_avoid: "",
  injury_or_pain: false,
  injury_details: "",
  medical_restriction: false,
  medical_details: "",
  exertion_warning_signs: false,
  warning_details: "",
  consent_sensitive_data: true,
};

describe("fitness assessment recommendation", () => {
  it("allows a standard beginner profile and chooses a 3-day split", () => {
    const result = buildAssessmentRecommendation(base);
    expect(result.autoPlanStatus).toBe("allowed");
    expect(result.trainingRecommendation).toContain("Full Body A/B/C");
    expect(result.nutritionRecommendation).toContain("proteína alta");
  });

  it("requires review when there is a medical restriction", () => {
    const result = buildAssessmentRecommendation({
      ...base,
      medical_restriction: true,
      medical_details: "Restrição informada por profissional.",
    });
    expect(result.autoPlanStatus).toBe("review_required");
    expect(result.trainingRecommendation).toContain("Revisão profissional");
  });

  it("requires review for minors", () => {
    const result = buildAssessmentRecommendation({ ...base, age: 17 });
    expect(result.autoPlanStatus).toBe("review_required");
  });

  it("keeps dietary preferences in the nutrition strategy", () => {
    const result = buildAssessmentRecommendation({
      ...base,
      dietary_pattern: "vegan",
      allergies: "amendoim",
    });
    expect(result.nutritionRecommendation).toContain("vegano");
    expect(result.nutritionRecommendation).toContain("alergias");
  });
});
