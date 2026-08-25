import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { LoginScreen } from "../screens/LoginScreen";
import { renderApp } from "./render";

describe("LoginScreen", () => {
  it("renders core login controls", () => {
    renderApp(<LoginScreen />, ["/login"]);
    expect(screen.getByText("Bem-vindo de volta")).toBeInTheDocument();
    expect(screen.getByLabelText("E-mail ou CPF")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Entrar" })).toBeInTheDocument();
  });

  it("rejects invalid credentials", async () => {
    const user = userEvent.setup();
    renderApp(<LoginScreen />, ["/login"]);
    await user.type(screen.getByLabelText("E-mail ou CPF"), "qualquer@email.com");
    await user.type(screen.getByLabelText("Senha"), "senhaerrada");
    await user.click(screen.getByRole("button", { name: "Entrar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("E-mail/telefone ou senha incorretos.");
  });
});
