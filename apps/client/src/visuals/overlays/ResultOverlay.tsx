import type { JSX, ReactNode } from "react";

interface ResultOverlayProps {
  readonly gameName: string;
  readonly final?: boolean;
  readonly children?: ReactNode;
  readonly disableInteraction?: boolean;
}

export function ResultOverlay({
  gameName,
  final = false,
  children,
  disableInteraction = false,
}: ResultOverlayProps): JSX.Element {
  return (
    <div className={`glix-result-overlay ${final ? "is-final" : ""}`} aria-live="polite">
      <div className="glix-result-panel">
        <div className="glix-result-stamp" aria-hidden="true"><span>{final ? "★" : "✓"}</span></div>
        <div className="glix-overlay-kicker"><span /> {final ? "ROTA SONU" : "TUR SONUCU"}</div>
        <h2>{final ? "Rota tamamlandı." : "Sonuç sahnede."}</h2>
        <p><strong>{gameName}</strong> turu tamamlandı. Puanlar ve sonuçlar sahnede.</p>
        {children &&
          (disableInteraction ? (
            <fieldset className="glix-result-slot" disabled aria-label="Sonuç özeti; etkileşim kapalı">
              {children}
            </fieldset>
          ) : (
            <div className="glix-result-slot">{children}</div>
          ))}
      </div>
    </div>
  );
}
