import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ClassesScreen } from "../screens/ClassesScreen";
import { renderApp } from "./render";

describe("Class reservation", () => {
  it("changes available class to reserved", async () => {
    const user = userEvent.setup();
    renderApp(<ClassesScreen />, ["/aulas"]);
    const buttons = screen.getAllByRole("button", { name: "Reservar" });
    await user.click(buttons[0]);
    expect(screen.getByRole("button", { name: "Reservada" })).toBeInTheDocument();
  });
});
