import type { JSX } from "react";
import type { PanelColor } from "@glix/shared";
import type { VisualPhase } from "../../types";

interface KpkClueDockProps {
  readonly clueText: string;
  readonly isSpectator: boolean;
  readonly phase: VisualPhase;
  readonly isLocked: boolean;
  readonly statusMessage?: string | null;
  readonly myResult?: {
    readonly correct: boolean;
    readonly points: number;
    readonly cutColor: PanelColor | null;
    readonly correctColor: PanelColor;
  } | null;
}

export function KpkClueDock({
  clueText,
  isSpectator,
  phase,
  isLocked,
  statusMessage,
  myResult
}: KpkClueDockProps): JSX.Element {
  const isResultPhase = phase === "results" || phase === "finished";

  let kicker = "GİZLİ ŞİFRE // BAŞKA OYUNCUNUN PANELİ";
  let mainContent: JSX.Element;

  if (isResultPhase && myResult) {
    kicker = "TUR SONUCU";
    mainContent = (
      <div className={`kpk-clue-result-summary ${myResult.correct ? "is-correct" : "is-wrong"}`}>
        <strong>
          {myResult.correct
            ? `DOĞRU KABLO +${myResult.points}`
            : myResult.cutColor
            ? "YANLIŞ KABLO"
            : "KABLO KESİLMEDİ"}
        </strong>
        <p>
          Doğru hedef kablo: <b className="target-name">{myResult.correctColor.toLocaleUpperCase("tr-TR")}</b>
        </p>
      </div>
    );
  } else if (isSpectator) {
    kicker = "İZLEYİCİ TERMİNALİ";
    mainContent = (
      <p className="kpk-clue-spectator-note">
        Sonraki turda katılabilirsin. Oyuncular panellerini çözüyor.
      </p>
    );
  } else {
    mainContent = (
      <div className="kpk-clue-text-frame">
        <p className="kpk-clue-text">
          {clueText ? (
            <span>{clueText}</span>
          ) : (
            <span className="clue-loading">Şifreli ipucu bekleniyor...</span>
          )}
        </p>
      </div>
    );
  }

  return (
    <section className="kpk-clue-dock" aria-label="Kontrol paneli ipucu terminali">
      {/* Smoked glass bevel header with warning stripes */}
      <div className="kpk-clue-dock-header">
        <span className="kpk-hazard-strip" aria-hidden="true" />
        <span className="kpk-clue-kicker">{kicker}</span>
        <span className="kpk-hazard-strip" aria-hidden="true" />
      </div>

      {/* Main Terminal Screen */}
      <div className="kpk-clue-dock-body" role="region" aria-live="polite">
        {mainContent}
      </div>

      {/* Footer / Instruction line */}
      <footer className="kpk-clue-dock-footer">
        <span className="status-indicator-dot" />
        <span className="status-indicator-text">
          {statusMessage ||
            (isSpectator
              ? "CANLI AKIŞ"
              : isLocked
              ? "KABLO KİLİTLENDİ · SUNUCU SENKRONU BEKLENİYOR"
              : "BİR KABLO SEÇİP KESİN · TEK HAKKINIZ VAR")}
        </span>
      </footer>
    </section>
  );
}
