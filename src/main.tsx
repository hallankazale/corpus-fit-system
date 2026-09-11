import React from "react";
import ReactDOM from "react-dom/client";
import { Capacitor } from "@capacitor/core";
import { HashRouter } from "react-router-dom";
import { App } from "./App";
import { AppStateProvider } from "./state/AppState";
import { AccountProvider } from "./state/AccountContext";
import { TrincadoApp } from "./trincado/TrincadoApp";
import "./styles.css";
import "./phase2.css";
import "./account.css";
import "./turnstile.css";
import "./trainer.css";
import "./student-workouts.css";
import "./health.css";
import "./trincado/anatomical.css";

const isNativeApp = Capacitor.isNativePlatform();
const isTrincadoBrowserPreview =
  new URLSearchParams(window.location.search).get("trincado") === "1";

if (!isNativeApp && !isTrincadoBrowserPreview && "serviceWorker" in navigator) {
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
    {isNativeApp || isTrincadoBrowserPreview ? (
      <TrincadoApp />
    ) : (
      <HashRouter>
        <AppStateProvider>
          <AccountProvider>
            <App />
          </AccountProvider>
        </AppStateProvider>
      </HashRouter>
    )}
  </React.StrictMode>,
);
