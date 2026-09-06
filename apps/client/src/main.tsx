import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { Stage11CQAHarness } from "./visuals/games/stage11c/Stage11CQAHarness";
import "./styles.css";

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/sw.js");
  });
}

const isStage11CQa = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("qa") === "stage11c";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {isStage11CQa ? <Stage11CQAHarness /> : <App />}
  </StrictMode>
);