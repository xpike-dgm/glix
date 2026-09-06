import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Stage11CAuthoritativeHarness } from "./Stage11CAuthoritativeHarness";
import "../styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Stage11CAuthoritativeHarness />
  </StrictMode>
);