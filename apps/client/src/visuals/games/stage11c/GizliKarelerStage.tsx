import type { JSX } from "react";
import type {
  ClientActionState,
  GizliKarelerOwnState,
  GizliKarelerPublicState,
  JsonValue,
  MatchPlayerState,
  RuntimePhaseId
} from "@glix/shared";

export interface GizliKarelerStageProps {
  readonly publicState: GizliKarelerPublicState;
  readonly ownState: GizliKarelerOwnState | null | undefined;
  readonly phase?: RuntimePhaseId;
  readonly selfPlayerId: string | null;
  readonly players?: readonly MatchPlayerState[];
  readonly now?: number;
  readonly isSpectator: boolean;
  readonly actionState?: ClientActionState | null;
  readonly onSubmit: (payload: JsonValue) => void;
}

function playerName(players: readonly MatchPlayerState[] | undefined, playerId: string): string {
  return players?.find((p) => p.id === playerId)?.nickname ?? "Oyuncu";
}

export function GizliKarelerStage({
  publicState,
  ownState,
  selfPlayerId,
  players,
  isSpectator,
  actionState,
  onSubmit
}: GizliKarelerStageProps): JSX.Element {
  const gridSize = publicState.gridSize ?? 3;
  const cellCount = publicState.cellCount ?? (gridSize * gridSize);
  const isFinished = publicState.finished;
  const isEliminated = Boolean(ownState?.eliminated);
  const canSelect = Boolean(ownState?.canSelect) && !isEliminated && !isFinished && !isSpectator;
  const selectedCell = ownState?.selectedCell ?? null;

  const isPending = actionState?.status === "pending";
  const isRejected = actionState?.status === "rejected";

  const handleCellClick = (cellIndex: number) => {
    if (!canSelect || isPending) return;
    onSubmit({ kind: "grid-cell", cell: cellIndex });
  };

  // Compile round results for post-game visualization
  const lastRoundResult = publicState.results && publicState.results.length > 0
    ? publicState.results[publicState.results.length - 1]
    : null;

  const cellOccupants = new Map<number, string[]>();
  if (lastRoundResult) {
    lastRoundResult.selections.forEach((sel) => {
      const list = cellOccupants.get(sel.cell) ?? [];
      list.push(sel.playerId);
      cellOccupants.set(sel.cell, list);
    });
  }

  return (
    <div className="gizli-kareler-stage" role="region" aria-label="Gizli Kareler oyun alanı">
      <header className="stage11c-game-header">
        <div>
          <span className="stage11c-eyebrow">BASINÇLI IZGARA MÜCADELESİ</span>
          <h2 className="stage11c-game-title">Gizli Kareler</h2>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "#72f4ff", background: "rgba(0,0,0,0.4)", padding: "2px 8px", borderRadius: "6px", border: "1px solid rgba(114,244,255,0.3)" }}>
            RAUNT {publicState.round} / 2
          </span>
        </div>
      </header>

      {/* Action status notification */}
      {isSpectator ? (
        <div className="stage11c-status-bar is-spectator" role="status">
          <span>İZLEMEDE</span>
          <small>Izgara üzerindeki hamleleri izliyorsun</small>
        </div>
      ) : isEliminated ? (
        <div className="stage11c-status-bar is-rejected" role="alert">
          <span>BU RAUNTTAN ELENDİN</span>
          <small>Çakışma yaşadın, diğer oyuncuları izliyorsun</small>
        </div>
      ) : isPending ? (
        <div className="stage11c-status-bar is-pending" role="status">
          <span>SİNYAL İLETİLİYOR…</span>
          <small>Kare seçimi kaydediliyor</small>
        </div>
      ) : isRejected ? (
        <div className="stage11c-status-bar is-rejected" role="alert">
          <span>REDDEDİLDİ</span>
          <small>{actionState?.reason ?? "Lütfen tekrar bir kare seçin"}</small>
        </div>
      ) : selectedCell !== null ? (
        <div className="stage11c-status-bar is-accepted" role="status">
          <span>✓ KARE #{selectedCell + 1} MÜHÜRLENDİ</span>
          <small>Raunt tamamlanınca çakışmalar açıklanacak</small>
        </div>
      ) : null}

      {/* Early finish banner */}
      {isFinished && publicState.earlyFinish && (
        <div className="kareler-early-finish" role="status">
          ⚡ ERKEN BİTİŞ: 1. Rauntta tüm oyuncular aynı kareye bastı ve elendi!
        </div>
      )}

      {/* Grid Apparatus */}
      <section className="stage11c-apparatus" aria-label="Kare ızgarası alanı">
        <div className="kareler-grid-container">
          <div
            className={`kareler-matrix ${gridSize === 4 ? "kareler-matrix-4" : "kareler-matrix-3"}`}
            role="grid"
            aria-label={`${gridSize}x${gridSize} basınç ızgarası`}
          >
            {Array.from({ length: cellCount }, (_, cell) => {
              const isChosen = selectedCell === cell;
              const occupants = cellOccupants.get(cell) ?? [];
              const isSolo = isFinished && occupants.length === 1;
              const isCollision = isFinished && occupants.length > 1;

              return (
                <button
                  key={cell}
                  type="button"
                  className={`kareler-cell-btn ${isChosen ? "is-chosen" : ""} ${isSolo ? "is-solo" : ""} ${isCollision ? "is-collision" : ""}`}
                  disabled={!canSelect || isPending}
                  onClick={() => handleCellClick(cell)}
                  aria-label={`Kare ${cell + 1}${isChosen ? " seçildi" : ""}`}
                >
                  <span className="kareler-cell-glyph" aria-hidden="true">
                    {isCollision ? "💥" : isSolo ? "⭐" : isChosen ? "👣" : "▦"}
                  </span>
                  <span className="kareler-cell-label">
                    {isFinished && occupants.length > 0
                      ? occupants.map((id) => playerName(players, id)).join(", ")
                      : `#${cell + 1}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Screen */}
        {isFinished && (
          <div className="acgozluluk-result-rail" style={{ marginTop: "0.5rem" }}>
            <div className="acgozluluk-breakdown-list" aria-label="Gizli Kareler nihai puanları">
              {publicState.resultPoints?.map((pt) => {
                const isSelf = pt.playerId === selfPlayerId;
                const wasEliminated = publicState.eliminatedPlayerIds.includes(pt.playerId);
                return (
                  <div className="acgozluluk-breakdown-item" key={pt.playerId}>
                    <span>
                      {playerName(players, pt.playerId)}{isSelf ? " (Sen)" : ""}
                      {wasEliminated && <small style={{ color: "#ff6688", marginLeft: "4px" }}>[ELENDİ]</small>}
                    </span>
                    <strong style={{ color: pt.points > 0 ? "#00ffaa" : "#8da4be" }}>
                      {pt.points > 0 ? `+${pt.points} Puan` : "0"}
                    </strong>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}