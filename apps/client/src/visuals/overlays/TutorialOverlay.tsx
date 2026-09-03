import type { JSX } from "react";

interface TutorialOverlayProps {
  readonly gameName: string;
  readonly steps: readonly string[];
  readonly progress: number;
  readonly remainingLabel: string;
}

export function TutorialOverlay({
  gameName,
  steps,
  progress,
  remainingLabel
}: TutorialOverlayProps): JSX.Element {
  return (
    <div className="glix-tutorial-overlay" aria-live="polite">
      <div className="glix-tutorial-panel">
        <div className="glix-overlay-kicker"><span /> SAHNE PROVASI <b>{remainingLabel}</b></div>
        <div className="glix-tutorial-heading">
          <span className="glix-tutorial-seal" aria-hidden="true">01</span>
          <div><span>KURAL ÖNİZLEMESİ</span><h2>{gameName}</h2></div>
        </div>
        <ol>
          {steps.slice(0, 3).map((step, index) => (
            <li key={step}><span>{String(index + 1).padStart(2, "0")}</span><strong>{step}</strong></li>
          ))}
        </ol>
        <div className="glix-tutorial-progress" aria-hidden="true"><span style={{ width: `${Math.round(progress * 100)}%` }} /></div>
      </div>
    </div>
  );
}
