import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AppStateProvider } from "../state/AppState";
import type { ReactElement } from "react";

export function renderApp(ui: ReactElement, initialEntries=["/"]) {
  return render(<MemoryRouter initialEntries={initialEntries}><AppStateProvider>{ui}</AppStateProvider></MemoryRouter>);
}
