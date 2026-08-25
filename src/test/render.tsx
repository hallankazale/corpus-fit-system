import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AppStateProvider } from "../state/AppState";
import { AccountProvider } from "../state/AccountContext";
import type { ReactElement } from "react";

export function renderApp(ui: ReactElement, initialEntries=["/"]) {
  return render(<MemoryRouter initialEntries={initialEntries}><AppStateProvider><AccountProvider>{ui}</AccountProvider></AppStateProvider></MemoryRouter>);
}
