import { describe, expect, it } from "vitest";
import { LOCAL_EXERCISES, getExerciseTemplate } from "./local-generator";

describe("Trincado GIF Maker v0.4", () => {
  it("ships the six stable local exercises", () => {
    expect(LOCAL_EXERCISES).toHaveLength(6);
    expect(LOCAL_EXERCISES.map(item => item.key)).toEqual([
      "leg-raise",
      "squat",
      "push-up",
      "crunch",
      "plank",
      "jumping-jack",
    ]);
  });

  it("keeps the leg raise mapped to core", () => {
    const template = getExerciseTemplate("leg-raise");
    expect(template.name).toBe("Elevação de pernas");
    expect(template.category).toBe("core");
    expect(template.target).toBe("abs");
  });
});
