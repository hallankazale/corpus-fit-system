import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { PaymentsScreen } from "../screens/PaymentsScreen";
import { renderApp } from "./render";

describe("PIX payment", () => {
  it("opens the PIX modal", async () => {
    const user = userEvent.setup();
    renderApp(<PaymentsScreen />, ["/pagamentos"]);
    await user.click(screen.getByRole("button", { name: "Gerar PIX" }));
    expect(screen.getByRole("dialog", { name: "Pagamento via PIX" })).toBeInTheDocument();
    expect(screen.getByText(/CORPUSFIT/)).toBeInTheDocument();
  });
});
