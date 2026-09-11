import React from "react";
import ReactDOM from "react-dom/client";
import { GifMakerApp } from "./gifmaker/GifMakerApp";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GifMakerApp />
  </React.StrictMode>,
);
