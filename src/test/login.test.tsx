import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LoginScreen } from "../screens/LoginScreen";
import { renderApp } from "./render";

vi.mock("../services/authService", () => ({
  signInWithEmail: vi.fn().mockResolvedValue({ ok: false, error: "E-mail ou senha incorretos." }),
  requestPasswordReset: vi.fn().mockResolvedValue({ ok: true, error: null }),
}));

describe("LoginScreen", () => {
  it("renders core login controls", () => {
    renderApp(<LoginScreen />, ["/login"]);
    expect(screen.getByText("Bem-vindo de volta")).toBeInTheDocument();
    expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Entrar" })).toBeInTheDocument();
  });

  it("rejects invalid credentials", async () => {
    const user = userEvent.setup();
    renderApp(<LoginScreen />, ["/login"]);
    await user.type(screen.getByLabelText("E-mail"), "alguem@teste.com");
    await user.type(screen.getByLabelText("Senha"), "senhaerrada");
    await user.click(screen.getByRole("button", { name: "Entrar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("E-mail ou senha incorretos");
  });
});
