import { screen } from "@testing-library/react";
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
});
