import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { ProfileScreen } from "../screens/ProfileScreen";
import { renderApp } from "./render";

describe("Local persistence", () => {
  beforeEach(() => window.localStorage.clear());

  it("keeps profile bio after remount", async () => {
    const user = userEvent.setup();
    const first = renderApp(<ProfileScreen />, ["/perfil"]);
    const bio = screen.getByRole("textbox");
    await user.clear(bio);
    await user.type(bio, "Treino salvo no aparelho");
    first.unmount();

    renderApp(<ProfileScreen />, ["/perfil"]);
    expect(screen.getByRole("textbox")).toHaveValue("Treino salvo no aparelho");
  });
});
