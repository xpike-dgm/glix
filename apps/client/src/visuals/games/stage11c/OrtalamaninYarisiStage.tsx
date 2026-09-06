import { useState } from "react";
import type { JSX } from "react";
import type {
  ClientActionState,
  JsonValue,
  MatchPlayerState,
  OrtalamaninYarisiOwnState,
  OrtalamaninYarisiPublicState,
  RuntimePhaseId
} from "@glix/shared";

export interface OrtalamaninYarisiStageProps {
  readonly publicState: OrtalamaninYarisiPublicState;
  readonly ownState: OrtalamaninYarisiOwnState | null | undefined;
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

export function OrtalamaninYarisiStage({
  publicState,
  ownState,
  selfPlayerId,
  players,
  isSpectator,
  actionState,
  onSubmit
}: OrtalamaninYarisiStageProps): JSX.Element {
  const [localVal, setLocalVal] = useState<number>(() => ownState?.selectedValue ?? 50);

  const hasSubmitted = Boolean(ownState?.hasSubmitted);
  const isPending = actionState?.status === "pending";
  const isRejected = actionState?.status === "rejected";
  const isFinished = publicState.finished;

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
    onSubmit({ kind: "average-value", value: localVal });
  };

  const displayVal = hasSubmitted ? (ownState?.selectedValue ?? localVal) : localVal;
  // Map value 0..100 to arc angle (-180deg to 0deg in semi-circle)
  const needleAngle = -180 + (displayVal / 100) * 180;
  const targetAngle = publicState.target !== null ? -180 + (publicState.target / 100) * 180 : 0;
  const avgAngle = publicState.average !== null ? -180 + (publicState.average / 100) * 180 : 0;

  return (
    <div className="ortalamanin-stage" role="region" aria-label="Ortalamaya En Yakın oyun alanı">
      <header className="stage11c-game-header">
        <div>
          <span className="stage11c-eyebrow">KALİBRE HEDEF GÖSTERGESİ</span>
          <h2 className="stage11c-game-title">Ortalamaya En Yakın</h2>
        </div>
      </header>

      {/* Action status */}
      {isSpectator ? (
        <div className="stage11c-status-bar is-spectator" role="status">
          <span>İZLEMEDE</span>
          <small>Oyuncular gizli sayılarını seçiyor</small>
        </div>
      ) : isPending ? (
        <div className="stage11c-status-bar is-pending" role="status">
          <span>SİNYAL İLETİLİYOR…</span>
          <small>Tahmin mühürleniyor</small>
        </div>
      ) : isRejected ? (
        <div className="stage11c-status-bar is-rejected" role="alert">
          <span>REDDEDİLDİ</span>
          <small>{actionState?.reason ?? "Lütfen tekrar deneyin"}</small>
        </div>
      ) : hasSubmitted ? (
        <div className="stage11c-status-bar is-accepted" role="status">
          <span>✓ TAHMİNİN MÜHÜRLENDİ ({ownState?.selectedValue})</span>
          <small>Sonuçta ortalamanın yarısı hesaplanacak</small>
        </div>
      ) : null}

      {/* Gauge Apparatus */}
      <section className="stage11c-apparatus" aria-label="Hedef gösterge alanı">
        <div className="ortalamanin-gauge-wrapper">
          <svg className="gauge-svg" viewBox="0 0 200 120" role="img" aria-label="Ortalama gösterge yayı">
            {/* Background Track Arc (radius 75, center 100, 100) */}
            <path
              d="M 25 100 A 75 75 0 0 1 175 100"
              fill="none"
              stroke="rgba(80, 200, 255, 0.2)"
              strokeWidth="12"
              strokeLinecap="round"
            />
            {/* Active Range Arc up to displayVal */}
            {!isFinished && (
              <path
                d="M 25 100 A 75 75 0 0 1 175 100"
                fill="none"
                stroke="url(#neonCyanGrad)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray="235.6"
                strokeDashoffset={235.6 * (1 - displayVal / 100)}
              />
            )}

            {/* Gradients */}
            <defs>
              <linearGradient id="neonCyanGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#00d9ff" />
                <stop offset="100%" stopColor="#00ffa6" />
              </linearGradient>
            </defs>

            {/* Tick marks for 0, 25, 50, 75, 100 */}
            <text x="25" y="118" fill="#72f4ff" fontSize="9" textAnchor="middle">0</text>
            <text x="50" y="55" fill="#72f4ff" fontSize="9" textAnchor="middle">25</text>
            <text x="100" y="20" fill="#72f4ff" fontSize="9" textAnchor="middle">50</text>
            <text x="150" y="55" fill="#72f4ff" fontSize="9" textAnchor="middle">75</text>
            <text x="175" y="118" fill="#72f4ff" fontSize="9" textAnchor="middle">100</text>

            {/* Result Needles */}
            {isFinished ? (
              <>
                {/* Crowd Average Needle (dashed white) */}
                <g transform={`rotate(${avgAngle} 100 100)`}>
                  <line x1="100" y1="100" x2="168" y2="100" stroke="#fff" strokeWidth="2" strokeDasharray="3 3" />
                </g>
                {/* Target Needle (Gold) */}
                <g transform={`rotate(${targetAngle} 100 100)`}>
                  <line x1="100" y1="100" x2="175" y2="100" stroke="#ffd700" strokeWidth="4" />
                  <polygon points="175,100 165,95 165,105" fill="#ffd700" />
                </g>
              </>
            ) : (
              /* Player Needle (Cyan) */
              <g transform={`rotate(${needleAngle} 100 100)`}>
                <line x1="100" y1="100" x2="172" y2="100" stroke="#00e5ff" strokeWidth="3.5" />
                <circle cx="170" cy="100" r="4" fill="#00e5ff" />
              </g>
            )}
            <circle cx="100" cy="100" r="8" fill="#02111d" stroke="#00d9ff" strokeWidth="2" />
          </svg>

          <div className="gauge-needle-center">
            <small>{isFinished ? "HEDEF DEĞER" : "SEÇİLEN SAYI"}</small>
            <strong>{isFinished ? (publicState.target !== null ? publicState.target.toFixed(1) : "—") : displayVal}</strong>
          </div>
        </div>

        {/* Results Screen */}
        {isFinished ? (
          <div className="ortalamanin-derivation-card">
            <div className="derivation-formula">
              <div><span>TOPLAM ORTALAMA</span> <b>{publicState.average?.toFixed(1) ?? "—"}</b></div>
              <div style={{ color: "#72f4ff" }}>÷ 2 =</div>
              <div><span>HEDEF (ORTALAMA / 2)</span> <b style={{ color: "#ffd700" }}>{publicState.target?.toFixed(1) ?? "—"}</b></div>
            </div>

            <div className="acgozluluk-breakdown-list" aria-label="Oyuncu sonuçları">
              {publicState.results?.map((res) => {
                const isSelf = res.playerId === selfPlayerId;
                const pts = publicState.resultPoints?.find((p) => p.playerId === res.playerId)?.points ?? 0;
                return (
                  <div className="acgozluluk-breakdown-item" key={res.playerId}>
                    <span>
                      {playerName(players, res.playerId)}{isSelf ? " (Sen)" : ""}
                      {res.generatedForMissingInput && <small style={{ color: "#ffd000", marginLeft: "4px" }}>[OTOMATİK]</small>}
                    </span>
                    <span>Sayı: <b>{res.value}</b> (Fark: {res.distanceMs.toFixed(1)})</span>
                    <strong style={{ color: pts > 0 ? "#00ffaa" : "#8da4be" }}>
                      {pts > 0 ? `+${pts} Puan` : "0"}
                    </strong>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Playing Controls */
          !isSpectator && (
            <div className="acgozluluk-stepper-rack">
              <input
                type="range"
                className="ortalamanin-range-slider"
                min="0"
                max="100"
                step="1"
                value={displayVal}
                disabled={hasSubmitted || isPending}
                onChange={handleSlider}
                aria-label="Gizli sayı aralığı 0 ile 100"
              />

              <div className="ortalamanin-stepper-grid">
                <button
                  type="button"
                  className="ortalamanin-step-btn"
                  disabled={hasSubmitted || isPending || displayVal <= 9}
                  onClick={() => handleStep(-10)}
                  aria-label="10 azalt"
                >
                  -10
                </button>
                <button
                  type="button"
                  className="ortalamanin-step-btn"
                  disabled={hasSubmitted || isPending || displayVal <= 0}
                  onClick={() => handleStep(-1)}
                  aria-label="1 azalt"
                >
                  -1
                </button>
                <button
                  type="button"
                  className="ortalamanin-step-btn"
                  disabled={hasSubmitted || isPending || displayVal >= 100}
                  onClick={() => handleStep(1)}
                  aria-label="1 artır"
                >
                  +1
                </button>
                <button
                  type="button"
                  className="ortalamanin-step-btn"
                  disabled={hasSubmitted || isPending || displayVal >= 91}
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
                <span aria-hidden="true">◎</span>
                <strong>{hasSubmitted ? "TAHMİNİN KİLİTLENDİ" : "SAYIYI KİLİTLE"}</strong>
              </button>
            </div>
          )
        )}
      </section>
    </div>
  );
}