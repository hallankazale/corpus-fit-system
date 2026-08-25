import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HomeScreen } from "../screens/HomeScreen";
import { renderApp } from "./render";

describe("Bottom navigation", () => {
  it("shows all primary destinations", () => {
    renderApp(<HomeScreen />);
    ["Início","Treinos","Aulas","Evolução","Perfil"].forEach((label) => expect(screen.getAllByText(label).length).toBeGreaterThan(0));
  });
});
