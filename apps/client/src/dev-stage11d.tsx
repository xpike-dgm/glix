import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Stage11DPreviewHarness } from "./visuals/games/stage11-8d/Stage11DPreviewHarness";
import "./styles.css";

const query = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
const game = query.get("game") || query.get("stage11d_preview") || "yazi-yaz";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Stage11DPreviewHarness gameId={game} />
  </StrictMode>
);
