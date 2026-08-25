import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { App } from "./App";
import { AppStateProvider } from "./state/AppState";
import { AccountProvider } from "./state/AccountContext";
import "./styles.css";
import "./phase2.css";
import "./account.css";
import "./turnstile.css";
import "./trainer.css";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js", { updateViaCache: "none" })
      .then((registration) => registration.update())
      .catch(() => undefined);

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      const key = "corpus-fit-sw-reloaded";
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
      window.location.reload();
    });
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
      <AppStateProvider>
        <AccountProvider>
          <App />
        </AccountProvider>
      </AppStateProvider>
    </HashRouter>
  </React.StrictMode>,
);
