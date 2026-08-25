import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { PaymentsScreen } from "../screens/PaymentsScreen";
import { renderApp } from "./render";

describe("Payment experience", () => {
  it("opens a PIX charge with copy-and-paste code", async () => {
    const user = userEvent.setup();
    renderApp(<PaymentsScreen />, ["/pagamentos"]);
    await user.click(screen.getByRole("button", { name: "Pagar mensalidade" }));
    expect(await screen.findByRole("dialog", { name: "Pagamento via PIX" })).toBeInTheDocument();
    expect(await screen.findByText(/00020126TESTE-CORPUS-FIT-PIX/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copiar PIX" })).toBeInTheDocument();
  });
});
