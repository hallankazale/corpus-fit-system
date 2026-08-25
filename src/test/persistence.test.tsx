import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ProfileScreen } from "../screens/ProfileScreen";
import { renderApp } from "./render";

describe("Real profile state", () => {
  it("saves profile changes through the account provider", async () => {
    const user = userEvent.setup();
    renderApp(<ProfileScreen />, ["/perfil"]);
    const label = screen.getByText("Bio").closest("label");
    const bio = label?.querySelector("textarea");
    expect(bio).toBeTruthy();
    await user.clear(bio!);
    await user.type(bio!, "Perfil atualizado no banco");
    await user.click(screen.getByRole("button", { name: /salvar perfil/i }));
    expect(await screen.findByText("Perfil salvo no banco de dados.")).toBeInTheDocument();
  });
});
