import { useState } from "react";
import type { JSX } from "react";
import type {
  CizgiyiGecmeOwnState,
  CizgiyiGecmePublicState,
  ClientActionState,
  JsonValue,
  MatchPlayerState,
  RuntimePhaseId
} from "@glix/shared";

export interface CizgiyiGecmeStageProps {
  readonly publicState: CizgiyiGecmePublicState;
  readonly ownState: CizgiyiGecmeOwnState | null | undefined;
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

function calculateBucket(val: number): number {
  return val === 100 ? 10 : Math.floor(val / 10);
}

function bucketRangeLabel(bucket: number): string {
  if (bucket === 10) return "100 (Özel Çizgi)";
  return `${bucket * 10}–${bucket * 10 + 9}`;
}

export function CizgiyiGecmeStage({
  publicState,
  ownState,
  selfPlayerId,
  players,
  isSpectator,
  actionState,
  onSubmit
}: CizgiyiGecmeStageProps): JSX.Element {
  const [localVal, setLocalVal] = useState<number>(() => ownState?.selectedValue ?? 70);

  const hasSubmitted = Boolean(ownState?.hasSubmitted);
  const isPending = actionState?.status === "pending";
  const isRejected = actionState?.status === "rejected";
  const isFinished = publicState.finished;

  const currentVal = hasSubmitted ? (ownState?.selectedValue ?? localVal) : localVal;
  const currentBucket = calculateBucket(currentVal);

  const handleStep = (delta: number) => {
    if (hasSubmitted || isPending || isFinished || isSpectator) return;
    setLocalVal((prev) => Math.max(0, Math.min(100, prev + delta)));
  };

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (hasSubmitted || isPending || isFinished || isSpectator) return;
    setLocalVal(Number(e.target.value));
  };

  const handleSubmit = () => {
    if (hasSubmitted || isPending || isFinished || isSpectator) return;
    onSubmit({ kind: "risk-value", value: localVal });
  };

  // Build bucket occupancy from results
  const laneOccupants = new Map<number, { playerId: string; value: number | null; points: number; evaluated: boolean }[]>();
  if (isFinished && publicState.results) {
    publicState.results.forEach((res) => {
      if (res.bucket !== null) {
        const list = laneOccupants.get(res.bucket) ?? [];
        list.push(res);
        laneOccupants.set(res.bucket, list);
      }
    });
  }

  return (
    <div className="cizgiyi-stage" role="region" aria-label="Çizgiyi Geçme oyun alanı">
      <header className="stage11c-game-header">
        <div>
          <span className="stage11c-eyebrow">BENZERSİZ BÖLGE YARIŞI</span>
          <h2 className="stage11c-game-title">Çizgiyi Geçme</h2>
        </div>
      </header>

      {/* Action status notification */}
      {isSpectator ? (
        <div className="stage11c-status-bar is-spectator" role="status">
          <span>İZLEMEDE</span>
          <small>Oyuncuların risk şeridi kararı bekleniyor</small>
        </div>
      ) : isPending ? (
        <div className="stage11c-status-bar is-pending" role="status">
          <span>SİNYAL İLETİLİYOR…</span>
          <small>Risk değeri şeride işleniyor</small>
        </div>
      ) : isRejected ? (
        <div className="stage11c-status-bar is-rejected" role="alert">
          <span>REDDEDİLDİ</span>
          <small>{actionState?.reason ?? "Lütfen tekrar deneyin"}</small>
        </div>
      ) : hasSubmitted ? (
        <div className="stage11c-status-bar is-accepted" role="status">
          <span>✓ RİSK MÜHÜRLENDİ ({ownState?.selectedValue} · {currentBucket}. ŞERİT)</span>
          <small>Çakışmayan en yüksek şeritler kazanacak</small>
        </div>
      ) : null}

      {/* Lanes Apparatus */}
      <section className="stage11c-apparatus" aria-label="Yarış şeritleri">
        <div className="cizgiyi-lanes-apparatus" role="list">
          {Array.from({ length: 11 }, (_, i) => 10 - i).map((lane) => {
            const isMyLane = !isFinished && currentBucket === lane;
            const occupants = laneOccupants.get(lane) ?? [];
            const isOccupied = occupants.length > 0;
            const isDuplicate = occupants.length > 1;
            const topPoint = Math.max(0, ...occupants.map((o) => o.points));
            const isTop1 = isFinished && topPoint === 2;
            const isTop2 = isFinished && topPoint === 1;

            return (
              <div
                key={lane}
                className={`cizgiyi-lane-bar ${isMyLane ? "is-private-selected" : ""} ${isTop1 ? "is-unique-top1" : ""} ${isTop2 ? "is-unique-top2" : ""} ${isDuplicate ? "is-duplicate-passive" : ""}`}
                role="listitem"
              >
                <div className="lane-badge">
                  <span className="lane-num">{lane}</span>
                  <span>{bucketRangeLabel(lane)}</span>
                </div>

                <div className="lane-status-text">
                  {isFinished ? (
                    isOccupied ? (
                      isDuplicate ? (
                        <span style={{ color: "#ff7788" }}>💥 {occupants.map((o) => `${playerName(players, o.playerId)} (${o.value})`).join(", ")} (Pasif)</span>
                      ) : (
                        <span style={{ color: isTop1 ? "#ffd700" : isTop2 ? "#00ffcc" : "#e6f6ff" }}>
                          {isTop1 ? "👑 " : isTop2 ? "🥈 " : "👤 "}
                          {playerName(players, occupants[0]!.playerId)} ({occupants[0]!.value})
                          {occupants[0]!.points > 0 ? ` (+${occupants[0]!.points})` : ""}
                        </span>
                      )
                    ) : (
                      <small style={{ opacity: 0.4 }}>Boş</small>
                    )
                  ) : isMyLane ? (
                    <span style={{ color: "#00d9ff", fontWeight: 900 }}>⚡ SENİN ŞERİDİN</span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        {/* Results Screen */}
        {isFinished ? (
          <div className="acgozluluk-result-rail" style={{ marginTop: "0.6rem" }}>
            <div className="acgozluluk-breakdown-list" aria-label="Nihai skorlar">
              {publicState.results?.map((res) => {
                const isSelf = res.playerId === selfPlayerId;
                return (
                  <div className="acgozluluk-breakdown-item" key={res.playerId}>
                    <span>{playerName(players, res.playerId)}{isSelf ? " (Sen)" : ""}</span>
                    <span>Değer: <b>{res.value ?? "—"}</b> ({res.bucket !== null ? `${res.bucket}. Şerit` : "—"})</span>
                    <strong style={{ color: res.points > 0 ? "#00ffaa" : "#8da4be" }}>
                      {res.points > 0 ? `+${res.points} Puan` : "0"}
                    </strong>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Playing Controls */
          !isSpectator && (
            <div className="acgozluluk-stepper-rack" style={{ marginTop: "0.5rem" }}>
              <input
                type="range"
                className="ortalamanin-range-slider"
                min="0"
                max="100"
                step="1"
                value={currentVal}
                disabled={hasSubmitted || isPending}
                onChange={handleSlider}
                aria-label="Risk değeri 0 ile 100"
              />

              <div className="ortalamanin-stepper-grid">
                <button
                  type="button"
                  className="ortalamanin-step-btn"
                  disabled={hasSubmitted || isPending || currentVal <= 9}
                  onClick={() => handleStep(-10)}
                  aria-label="10 azalt"
                >
                  -10
                </button>
                <button
                  type="button"
                  className="ortalamanin-step-btn"
                  disabled={hasSubmitted || isPending || currentVal <= 0}
                  onClick={() => handleStep(-1)}
                  aria-label="1 azalt"
                >
                  -1
                </button>
                <button
                  type="button"
                  className="ortalamanin-step-btn"
                  disabled={hasSubmitted || isPending || currentVal >= 100}
                  onClick={() => handleStep(1)}
                  aria-label="1 artır"
                >
                  +1
                </button>
                <button
                  type="button"
                  className="ortalamanin-step-btn"
                  disabled={hasSubmitted || isPending || currentVal >= 91}
                  onClick={() => handleStep(10)}
                  aria-label="10 artır"
                >
                  +10
                </button>
              </div>

              <button
                type="button"
                className="stage11c-submit-button"
                disabled={hasSubmitted || isPending}
                onClick={handleSubmit}
              >
                <span aria-hidden="true">🏁</span>
                <strong>{hasSubmitted ? "RİSK KİLİTLENDİ" : "RİSKİ KİLİTLE"}</strong>
              </button>
            </div>
          )
        )}
      </section>
    </div>
  );
}