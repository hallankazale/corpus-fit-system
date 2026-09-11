import { describe, expect, it } from "vitest";
import { getTodayWorkoutCode, getWorkoutByCode, trincadoPlan } from "./workoutPlan";

describe("Projeto Trincado workout plan", () => {
  it("contains six training days", () => {
    expect(trincadoPlan).toHaveLength(6);
  });

  it("maps weekdays to the expected workout", () => {
    expect(getTodayWorkoutCode(new Date("2026-09-07T12:00:00"))).toBe("A");
    expect(getTodayWorkoutCode(new Date("2026-09-08T12:00:00"))).toBe("B");
    expect(getTodayWorkoutCode(new Date("2026-09-12T12:00:00"))).toBe("F");
  });

  it("keeps every exercise installable offline with a local GIF", () => {
    for (const workout of trincadoPlan) {
      for (const exercise of workout.exercises) {
        expect(exercise.gif.endsWith(".gif")).toBe(true);
        expect(exercise.gif.startsWith("http")).toBe(false);
      }
    }
  });

  it("returns a valid workout by code", () => {
    expect(getWorkoutByCode("C").title).toContain("Pernas");
  });
});
