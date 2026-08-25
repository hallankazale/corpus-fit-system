import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { LoginScreen } from "../screens/LoginScreen";
import { ActiveWorkoutScreen } from "../screens/ActiveWorkoutScreen";
import { renderApp } from "./render";

describe("Primary interactions", () => {
  it("opens password recovery feedback", async () => {
    const user = userEvent.setup();
    renderApp(<LoginScreen />, ["/login"]);
    await user.click(screen.getByRole("button", { name: "Esqueci minha senha" }));
    expect(screen.getByRole("dialog", { name: "Recuperar senha" })).toBeInTheDocument();
  });

  it("moves to the next exercise", async () => {
    const user = userEvent.setup();
    renderApp(<ActiveWorkoutScreen />, ["/treinos/ativo"]);
    await user.click(screen.getByRole("button", { name: /Próximo exercício/i }));
    expect(screen.getByText("Crucifixo inclinado")).toBeInTheDocument();
  });
});
