import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { PaymentsScreen } from "../screens/PaymentsScreen";
import { renderApp } from "./render";

describe("Payment experience", () => {
  it("explains that online payment needs the real gateway", async () => {
    const user = userEvent.setup();
    renderApp(<PaymentsScreen />, ["/pagamentos"]);
    await user.click(screen.getByRole("button", { name: "Pagar mensalidade" }));
    expect(screen.getByRole("dialog", { name: "Pagamento online" })).toBeInTheDocument();
    expect(screen.getByText(/gateway de pagamento/i)).toBeInTheDocument();
  });
});
