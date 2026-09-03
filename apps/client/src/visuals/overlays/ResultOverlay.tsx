import type { JSX, ReactNode } from "react";

interface ResultOverlayProps {
  readonly gameName: string;
  readonly final?: boolean;
  readonly children?: ReactNode;
}

export function ResultOverlay({ gameName, final = false, children }: ResultOverlayProps): JSX.Element {
  return (
    <div className={`glix-result-overlay ${final ? "is-final" : ""}`} aria-live="polite">
      <div className="glix-result-panel">
        <div className="glix-result-stamp" aria-hidden="true"><span>{final ? "★" : "✓"}</span></div>
        <div className="glix-overlay-kicker"><span /> {final ? "ROTA SONU" : "ROUND RESOLVED"}</div>
        <h2>{final ? "Rota tamamlandı." : "Sonuç sahnede."}</h2>
        <p><strong>{gameName}</strong> hamleleri kilitlendi. Skor ve açılım sunucudan geliyor.</p>
        {children && <div className="glix-result-slot">{children}</div>}
      </div>
    </div>
  );
}
