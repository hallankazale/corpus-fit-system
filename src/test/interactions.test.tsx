import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LoginScreen } from "../screens/LoginScreen";
import { ActiveWorkoutScreen } from "../screens/ActiveWorkoutScreen";
import { renderApp } from "./render";

vi.mock("../services/workoutService", () => ({
  fetchOwnWorkoutProgram: vi.fn().mockResolvedValue({
    id: "program-1",
    student_id: "test-user",
    trainer_id: "trainer-1",
    code: "B",
    title: "Treino B",
    subtitle: "Peito e tríceps",
    notes: "",
    status: "active",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    workout_exercises: [
      { id: "ex-1", program_id: "program-1", position: 1, name: "Supino reto", muscle_group: "Peitoral", sets: 4, reps_min: 10, reps_max: 10, suggested_load_kg: 40, rest_seconds: 60, notes: "" },
      { id: "ex-2", program_id: "program-1", position: 2, name: "Crucifixo inclinado", muscle_group: "Peitoral superior", sets: 3, reps_min: 10, reps_max: 12, suggested_load_kg: 14, rest_seconds: 45, notes: "" },
    ],
  }),
  startWorkoutSession: vi.fn().mockResolvedValue({ id: "session-1", student_id: "test-user", program_id: "program-1", status: "in_progress", started_at: "2026-01-01T00:00:00Z", completed_at: null }),
  saveWorkoutSet: vi.fn().mockResolvedValue(undefined),
  completeWorkoutSession: vi.fn().mockResolvedValue(undefined),
}));

describe("Primary interactions", () => {
  it("opens password recovery feedback", async () => {
    const user = userEvent.setup();
    renderApp(<LoginScreen />, ["/login"]);
    await user.click(screen.getByRole("button", { name: "Esqueci minha senha" }));
    expect(screen.getByRole("dialog", { name: "Recuperar senha" })).toBeInTheDocument();
  });

  it("moves to the next prescribed exercise", async () => {
    const user = userEvent.setup();
    renderApp(<ActiveWorkoutScreen />, ["/treinos/ativo?program=program-1"]);
    expect(await screen.findByRole("heading", { level: 1, name: "Supino reto" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Próximo exercício/i }));
    expect(await screen.findByRole("heading", { level: 1, name: "Crucifixo inclinado" })).toBeInTheDocument();
  });
});
