import { useState } from "react";
import type { JSX } from "react";
import type {
  AcgozlulukOwnState,
  AcgozlulukPublicState,
  ClientActionState,
  JsonValue,
  MatchPlayerState,
  RuntimePhaseId
} from "@glix/shared";

export interface AcgozlulukLimitiStageProps {
  readonly publicState: AcgozlulukPublicState;
  readonly ownState: AcgozlulukOwnState | null | undefined;
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

export function AcgozlulukLimitiStage({
  publicState,
  ownState,
  selfPlayerId,
  players,
  isSpectator,
  actionState,
  onSubmit
}: AcgozlulukLimitiStageProps): JSX.Element {
  const maxChoice = publicState.maxChoice ?? 3;
  const [localVal, setLocalVal] = useState<number>(() => ownState?.selectedValue ?? 0);

  const hasSubmitted = Boolean(ownState?.hasSubmitted);
  const isPending = actionState?.status === "pending";
  const isRejected = actionState?.status === "rejected";
  const isFinished = publicState.finished;

  const handleStep = (delta: number) => {
    if (hasSubmitted || isPending || isFinished || isSpectator) return;
    setLocalVal((prev) => Math.max(0, Math.min(maxChoice, prev + delta)));
  };

  const handleSelectToken = (val: number) => {
    if (hasSubmitted || isPending || isFinished || isSpectator) return;
    setLocalVal(val);
  };

  const handleSubmit = () => {
    if (hasSubmitted || isPending || isFinished || isSpectator) return;
    onSubmit({ kind: "limit-value", value: localVal });
  };

  const total = publicState.total ?? 0;
  const limit = publicState.limit;
  const withinLimit = publicState.withinLimit;

  // Visual scale calculation
  const maxPossible = Math.max(1, limit * 1.4);
  const fillPercent = isFinished
    ? Math.min(100, Math.max(8, (total / maxPossible) * 100))
    : Math.min(100, Math.max(8, ((hasSubmitted ? ownState?.selectedValue ?? 0 : localVal) / maxPossible) * 100));
  const thresholdPercent = Math.min(95, Math.max(15, (limit / maxPossible) * 100));

  return (
    <div className="acgozluluk-stage" role="region" aria-label="Açgözlülük Limiti oyun alanı">
      <header className="stage11c-game-header">
        <div>
          <span className="stage11c-eyebrow">TOPLU BASINÇ TERAZİSİ</span>
          <h2 className="stage11c-game-title">Açgözlülük Limiti</h2>
        </div>
      </header>

      {/* Action status notification */}
      {isSpectator ? (
        <div className="stage11c-status-bar is-spectator" role="status">
          <span>İZLEMEDE</span>
          <small>Seçimler gizli havuzda toplanıyor</small>
        </div>
      ) : isPending ? (
        <div className="stage11c-status-bar is-pending" role="status">
          <span>SİNYAL İLETİLİYOR…</span>
          <small>Değer mühürleniyor</small>
        </div>
      ) : isRejected ? (
        <div className="stage11c-status-bar is-rejected" role="alert">
          <span>REDDEDİLDİ</span>
          <small>{actionState?.reason ?? "Lütfen tekrar deneyin"}</small>
        </div>
      ) : hasSubmitted ? (
        <div className="stage11c-status-bar is-accepted" role="status">
          <span>✓ MÜHÜRLENDİ ({ownState?.selectedValue} PUAN)</span>
          <small>Diğer oyuncuların kararı bekleniyor</small>
        </div>
      ) : null}

      {/* Apparatus: The Communal Scale & Cylinder */}
      <section className="stage11c-apparatus acgozluluk-column-apparatus" aria-label="Ortak terazi göstergesi">
        <div className="acgozluluk-scale-display">
          <div className="acgozluluk-scale-cylinder" aria-hidden="true">
            <div
              className={`scale-fill-level ${isFinished && withinLimit === false ? "is-overload" : ""}`}
              style={{ height: `${fillPercent}%` }}
            />
            <div
              className="scale-threshold-line"
              style={{ bottom: `${thresholdPercent}%` }}
            />
          </div>

          <div className="acgozluluk-chamber-info">
            <div className="acgozluluk-metric-box">
              <small>ORTAK TEHLİKE LİMİTİ</small>
              <strong>{limit} PUAN</strong>
            </div>

            <div className="acgozluluk-metric-box">
              <small>{isFinished ? "GERÇEKLEŞEN TOPLAM" : "SEÇİLEBİLİR MAKS"}</small>
              <strong>{isFinished ? `${total} PUAN` : `${maxChoice} PUAN`}</strong>
            </div>

            {!isFinished && (
              <div className="acgozluluk-metric-box">
                <small>SENİN SEÇİMİN</small>
                <strong>{hasSubmitted ? ownState?.selectedValue : localVal} PUAN</strong>
              </div>
            )}
          </div>
        </div>

        {/* Results Screen */}
        {isFinished ? (
          <div className="acgozluluk-result-rail">
            <div
              className={`acgozluluk-result-banner ${withinLimit ? "is-success" : "is-fail"}`}
              role="status"
            >
              <strong>
                {withinLimit
                  ? `LİMİT AŞILMADI (${total} ≤ ${limit})`
                  : `LİMİT AŞILDI (${total} > ${limit})`}
              </strong>
              <small>
                {withinLimit
                  ? "Her oyuncu kendi yazdığı değer kadar puan kazandı."
                  : "Açgözlülük eşiği kırıldı! Hiç kimse puan alamadı (0 puan)."}
              </small>
            </div>

            <div className="acgozluluk-breakdown-list" aria-label="Oyuncu seçim dökümü">
              {publicState.choices?.map((item) => {
                const points = publicState.resultPoints?.find((p) => p.playerId === item.playerId)?.points ?? 0;
                const isSelf = item.playerId === selfPlayerId;
                return (
                  <div className="acgozluluk-breakdown-item" key={item.playerId}>
                    <span>{playerName(players, item.playerId)}{isSelf ? " (Sen)" : ""}</span>
                    <span>Seçim: <b>{item.value}</b></span>
                    <strong style={{ color: points > 0 ? "#00ffaa" : "#ff6688" }}>
                      {points > 0 ? `+${points}` : "0"}
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
              <div className="acgozluluk-stepper-row">
                <button
                  type="button"
                  className="acgozluluk-stepper-btn"
                  disabled={hasSubmitted || isPending || localVal <= 0}
                  onClick={() => handleStep(-1)}
                  aria-label="Değeri bir azalt"
                >
                  −
                </button>

                <div className="acgozluluk-value-badge">
                  <small>GİZLİ SEÇİMİN</small>
                  <b>{hasSubmitted ? ownState?.selectedValue : localVal}</b>
                </div>

                <button
                  type="button"
                  className="acgozluluk-stepper-btn"
                  disabled={hasSubmitted || isPending || localVal >= maxChoice}
                  onClick={() => handleStep(1)}
                  aria-label="Değeri bir artır"
                >
                  +
                </button>
              </div>

              {/* Direct token rack */}
              <div className="acgozluluk-tokens-grid" role="group" aria-label="Sayı tuşları">
                {Array.from({ length: maxChoice + 1 }, (_, val) => (
                  <button
                    key={val}
                    type="button"
                    className={`acgozluluk-token-btn ${(hasSubmitted ? ownState?.selectedValue : localVal) === val ? "is-active" : ""}`}
                    disabled={hasSubmitted || isPending}
                    onClick={() => handleSelectToken(val)}
                  >
                    {val}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="stage11c-submit-button"
                disabled={hasSubmitted || isPending}
                onClick={handleSubmit}
              >
                <span aria-hidden="true">⚖</span>
                <strong>{hasSubmitted ? "SEÇİMİN KİLİTLENDİ" : "AÇGÖZLÜLÜĞÜ KİLİTLE"}</strong>
              </button>
            </div>
          )
        )}
      </section>
    </div>
  );
}