import { useCallback, useId } from "react";
import type { CSSProperties, JSX, KeyboardEvent, PointerEvent } from "react";
import type {
  ButonaBasOwnState,
  ButonaBasPublicState,
  ButonaBasResultView,
  JsonValue,
  MatchPlayerState
} from "@glix/shared";
import "./ButonaBasStage.css";

export type ButonaBasStagePhase =
  | "tutorial"
  | "preparing"
  | "playing"
  | "results"
  | "transition"
  | "finished";

export type ButonaBasActionStatus = "editable" | "pending" | "accepted" | "rejected";

/**
 * The visual only needs the public terminal state of the shared action reducer.
 * Keeping this structural also lets the stage consume the richer shared action
 * state without importing or duplicating the transport reducer.
 */
export interface ButonaBasActionState {
  readonly status: ButonaBasActionStatus;
  readonly actionId?: string;
  readonly authoritativeVersion?: number;
  readonly observedStateVersion?: number;
  readonly ackStateVersion?: number;
  readonly acceptedActionCount?: number;
  readonly mode?: string;
  readonly scope?: object;
  readonly reason?: string;
}

export interface ButonaBasStageProps {
  readonly publicState: ButonaBasPublicState;
  readonly ownState: ButonaBasOwnState | null | undefined;
  readonly phase?: ButonaBasStagePhase;
  /** Server-adjusted clock used only to present the current public window. */
  readonly now?: number;
  readonly isSpectator: boolean;
  readonly selfPlayerId: string | null;
  readonly players?: readonly MatchPlayerState[];
  readonly isReady?: boolean;
  readonly onReady?: () => void;
  readonly actionState?: ButonaBasActionState | null;
  /** Preferred Stage 11 action entry point. */
  readonly onSubmitAction?: (payload: JsonValue) => void;
  /** Compatibility alias for the existing game-control surface. */
  readonly onSubmit?: (payload: JsonValue) => void;
}

interface ApertureStyle extends CSSProperties {
  "--aperture-progress": string;
  "--aperture-angle": string;
  "--heat-level": string;
  "--result-width": string;
}

const ACTION_REASON_COPY: Readonly<Record<string, string>> = {
  offline: "Bağlantı bekleniyor",
  input_late: "Pencere kapandı",
  input_phase_locked: "Oyun fazı kapandı",
  input_duplicate: "Bu sinyal zaten işlendi",
  input_disabled: "Bu fazda sinyal alınmıyor",
  spectator: "Seyirci modundasın",
  invalid_game_input: "Sinyal doğrulanamadı"
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function formatScore(score: number): string {
  return `${score > 0 ? "+" : ""}${score}`;
}

function formatWindowTime(milliseconds: number): string {
  return `${(milliseconds / 1000).toFixed(2).replace(".", ",")} sn`;
}

function actionReason(reason: string | undefined): string {
  if (!reason) {
    return "Tekrar dene";
  }

  return ACTION_REASON_COPY[reason] ?? "Hamle kabul edilmedi.";
}

function actionStatusMessage({
  actionState,
  hasTappedThisWindow,
  isSpectator,
  phase,
  started
}: {
  readonly actionState: ButonaBasActionState | null | undefined;
  readonly hasTappedThisWindow: boolean;
  readonly isSpectator: boolean;
  readonly phase: ButonaBasStagePhase;
  readonly started: boolean;
}): string {
  if (isSpectator) {
    return "Bu turu izliyorsun.";
  }

  if (phase === "preparing") {
    return "Hazırlık · oyun alanı açılıyor.";
  }

  if (!started && phase === "playing") {
    return "Saat eşitleniyor…";
  }

  if (actionState?.status === "pending") {
    return "Gönderiliyor…";
  }

  if (actionState?.status === "rejected") {
    return `Tekrar dene. ${actionReason(actionState.reason)}`;
  }

  if (actionState?.status === "accepted") {
    return hasTappedThisWindow
      ? "Hamlen kaydedildi. Bu penceredesin."
      : "Hamlen kaydedildi. Yeni pencereyi yakala.";
  }

  return hasTappedThisWindow
    ? "Bu penceredesin · sonraki ritmi bekle."
    : "Aynı anda yakala · istediğin pencerede bas.";
}

function phaseFromPublicState(
  phase: ButonaBasStagePhase | undefined,
  publicState: ButonaBasPublicState
): ButonaBasStagePhase {
  if (phase) {
    return phase;
  }

  return publicState.finished ? "results" : publicState.started ? "playing" : "preparing";
}

function ResultComposition({
  publicState,
  ownState,
  players,
  selfPlayerId,
  isSpectator
}: {
  readonly publicState: ButonaBasPublicState;
  readonly ownState: ButonaBasOwnState | null;
  readonly players: readonly MatchPlayerState[];
  readonly selfPlayerId: string | null;
  readonly isSpectator: boolean;
}): JSX.Element {
  const results: readonly ButonaBasResultView[] = publicState.results ?? [];
  const maximumMagnitude = Math.max(
    1,
    ...results.map((result) => Math.abs(result.score))
  );
  const selfResult = results.find((result) => result.playerId === selfPlayerId) ?? null;
  const selfScore = selfResult?.score ?? (!isSpectator ? ownState?.miniScore : undefined);
  const resultSummary = publicState.resultSummary;

  return (
    <section className="butona-bas-result" aria-labelledby="butona-bas-result-title">
      <div className="butona-bas-result-heading">
        <div>
          <span className="butona-bas-kicker">RİTİM SONUCU / PENCERE KİLİTLİ</span>
          <h3 id="butona-bas-result-title">Ritim çözüldü.</h3>
          <p>
            {resultSummary
              ? `${resultSummary.acceptedWindowCount} kabul penceresi, ${resultSummary.singletonWindowCount} tekli ceza ve ${resultSummary.multiPlayerWindowCount} çoklu buluşma oyun kaydında çözüldü.`
              : `${publicState.windowCount} kısa pencere, ${publicState.windowMs} ms aralıkla oyun kaydında çözüldü.`}
          </p>
        </div>
        <span className="butona-bas-result-mark" aria-hidden="true">✦</span>
      </div>

      <div className="butona-bas-result-facts" aria-label="Butona Bas tur özeti">
        <span><b>{publicState.windowCount}</b><small>TOPLAM PENCERE</small></span>
        <span><b>{publicState.windowMs}<em> ms</em></b><small>PENCERE ARALIĞI</small></span>
        <span><b>{resultSummary?.acceptedWindowCount ?? "—"}</b><small>KABUL PENCERESİ</small></span>
        <span><b>{resultSummary?.singletonWindowCount ?? "—"}</b><small>TEKLİ CEZA</small></span>
        <span><b>{resultSummary?.multiPlayerWindowCount ?? "—"}</b><small>ÇOKLU BULUŞMA</small></span>
        <span><b>{resultSummary?.emptyWindowCount ?? "—"}</b><small>BOŞ PENCERE</small></span>
        <span><b>{resultSummary?.longestWindowCombo ?? "—"}</b><small>EN UZUN SERİ</small></span>
        <span><b>{results.length || "—"}</b><small>OYUNCU SAYISI</small></span>
      </div>

      {results.length > 0 ? (
        <ol className="butona-bas-rank-list" aria-label="Butona Bas tur puanı sıralaması">
          {results.map((result) => {
            const score = result.score;
            const width = clamp((Math.abs(score) / maximumMagnitude) * 100, 12, 100);
            const resultStyle: ApertureStyle = { "--result-width": `${width}%` } as ApertureStyle;
            const nickname = players.find((player) => player.id === result.playerId)?.nickname ?? "Oyuncu";

            return (
              <li className={`butona-bas-rank-row ${result.playerId === selfPlayerId ? "is-self" : ""}`} key={result.playerId}>
                <span className="butona-bas-rank-number">{String(result.rank).padStart(2, "0")}</span>
                <span className="butona-bas-rank-player">
                  <strong>{nickname}</strong>
                  <small>{result.rank === 1 ? "EN YÜKSEK PUAN" : "TUR PUANI"}</small>
                </span>
                <span className={`butona-bas-rank-bar ${score < 0 ? "is-negative" : ""}`} aria-hidden="true">
                  <i style={resultStyle} />
                </span>
                <b className={score < 0 ? "is-negative" : ""}>{formatScore(score)}</b>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="butona-bas-result-empty">Tur puanları senkronize ediliyor…</p>
      )}

      {!isSpectator && selfScore !== undefined && (
        <output className="butona-bas-self-result" aria-label={`Senin mini skorun ${formatScore(selfScore)}`}>
          <span>SENİN SONUCUN</span>
          <strong>{formatScore(selfScore)}</strong>
          <small>{selfResult ? `${selfResult.rank}. sıra · ` : "Sıra bekleniyor · "}puan bu turun kaydı</small>
        </output>
      )}

      {!isSpectator && ownState && (
        <div className="butona-bas-own-window-summary" aria-label="Senin pencere özeti">
          <span><b>{ownState.acceptedWindowCount}</b><small>SENİN KABUL PENCEREN</small></span>
          <span><b>{ownState.longestWindowCombo}</b><small>SENİN EN UZUN SERİN</small></span>
        </div>
      )}

      <p className="butona-bas-result-note">
        Sıra, pencere cezaları ve beraberlik ödülleri bu ekranda yeniden hesaplanmaz;
        gösterilen puanlar oyun kaydındaki tur sonucudur.
      </p>
    </section>
  );
}

export function ButonaBasStage({
  publicState,
  ownState,
  phase: requestedPhase,
  now = 0,
  isSpectator,
  selfPlayerId,
  players = [],
  isReady = false,
  onReady,
  actionState,
  onSubmitAction,
  onSubmit
}: ButonaBasStageProps): JSX.Element {
  const statusId = useId();
  const phase = phaseFromPublicState(requestedPhase, publicState);
  const isResultPhase = phase === "results" || phase === "finished" || publicState.finished;
  const participantOwnState = !isSpectator && ownState?.gameId === "butona-bas" ? ownState : null;
  const serverRemainingMs = publicState.currentWindowEndsAt === null
    ? 0
    : Math.max(0, publicState.currentWindowEndsAt - now);
  const windowProgress = isResultPhase
    ? 1
    : publicState.currentWindowEndsAt === null
      ? 0
      : clamp(1 - serverRemainingMs / publicState.windowMs, 0, 1);
  const acceptedActionCount = Number.isSafeInteger(actionState?.acceptedActionCount)
    ? Math.max(0, actionState?.acceptedActionCount ?? 0)
    : 0;
  const hasTappedThisWindow = participantOwnState?.lastTapWindowIndex === publicState.windowIndex;
  const heatPercent = isResultPhase
    ? 100
    : Math.round(clamp(Math.max(windowProgress * 100, hasTappedThisWindow ? 72 : acceptedActionCount > 0 ? 18 : 0), 0, 100));
  const overallProgress = isResultPhase
    ? 1
    : clamp((publicState.windowIndex + windowProgress) / Math.max(1, publicState.windowCount), 0, 1);
  const isPending = actionState?.status === "pending";
  const submitAction = onSubmitAction ?? onSubmit;
  const canTap = phase === "playing" &&
    publicState.started &&
    !isResultPhase &&
    !isSpectator &&
    participantOwnState !== null &&
    !participantOwnState.finished &&
    Boolean(submitAction);
  const apertureStyle: ApertureStyle = {
    "--aperture-progress": `${Math.round(windowProgress * 100)}%`,
    "--aperture-angle": `${Math.round(windowProgress * 360)}deg`,
    "--heat-level": `${heatPercent}%`,
    "--result-width": "0%"
  };
  const statusMessage = actionStatusMessage({
    actionState,
    hasTappedThisWindow,
    isSpectator,
    phase,
    started: publicState.started
  });
  const buttonReadout = isResultPhase
    ? "END"
    : !publicState.started
      ? "RDY"
      : String(Math.round(serverRemainingMs)).padStart(3, "0");

  const submitTap = useCallback((): void => {
    if (!canTap) {
      return;
    }

    submitAction?.({ kind: "button-tap" });
  }, [canTap, submitAction]);

  const handlePointerDown = useCallback((event: PointerEvent<HTMLButtonElement>): void => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    submitTap();
  }, [submitTap]);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLButtonElement>): void => {
    if ((event.key !== "Enter" && event.key !== " ") || event.repeat) {
      return;
    }

    event.preventDefault();
    submitTap();
  }, [submitTap]);

  return (
    <section
      className={`butona-bas-stage ${isResultPhase ? "is-result" : "is-playing"} ${isSpectator ? "is-spectator" : ""}`}
      aria-label="Butona Bas neon arcade zamanlama sahnesi"
    >
      <header className="butona-bas-stage-header">
        <div>
          <span className="butona-bas-kicker">HIZLI RİTİM / ZAMANLAMA</span>
          <h2>Butona Bas<span aria-hidden="true">.</span></h2>
        </div>
        <div className="butona-bas-window-readout" aria-label={`${publicState.windowCount} zaman penceresinden ${Math.min(publicState.windowCount, publicState.windowIndex + 1)}. pencere`}>
          <small>PENCERE</small>
          <strong>{String(Math.min(publicState.windowCount, publicState.windowIndex + 1)).padStart(3, "0")}<em>/{publicState.windowCount}</em></strong>
        </div>
      </header>

      <div className="butona-bas-status-line" id={statusId} role="status" aria-live="polite" aria-atomic="true">
        <span className="butona-bas-status-lamp" aria-hidden="true" />
        {isResultPhase ? "Sonuç açıklandı." : statusMessage}
      </div>

      {!isResultPhase ? (
        <div className="butona-bas-play-layout">
          <div className="butona-bas-machine" style={apertureStyle}>
            <div className="butona-bas-aperture-wrap">
              <div
                className="butona-bas-aperture"
                role="progressbar"
                aria-label="300 milisaniyelik zaman penceresi"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(windowProgress * 100)}
                aria-valuetext={publicState.started ? `${formatWindowTime(serverRemainingMs)} kaldı` : "Başlamaya hazır"}
              >
                <span className="butona-bas-aperture-grid" aria-hidden="true" />
                <span className="butona-bas-aperture-scan" aria-hidden="true" />
                <span className="butona-bas-aperture-tick tick-one" aria-hidden="true" />
                <span className="butona-bas-aperture-tick tick-two" aria-hidden="true" />
                <span className="butona-bas-aperture-tick tick-three" aria-hidden="true" />
                <span className="butona-bas-aperture-core">
                  <strong>{buttonReadout}</strong>
                  <small>{isResultPhase ? "SONUÇ" : "MS / AÇIKLIK"}</small>
                </span>
              </div>
              <span className="butona-bas-aperture-label">HAREKETLİ AÇIKLIK / {publicState.windowMs} MS</span>
            </div>

            <div className="butona-bas-button-well">
              <span className="butona-bas-button-bolt bolt-one" aria-hidden="true" />
              <span className="butona-bas-button-bolt bolt-two" aria-hidden="true" />
              {isSpectator ? (
                <div className="butona-bas-spectator-control" aria-label="Seyirci modu; buton kapalı">
                  <span aria-hidden="true">◌</span>
                  <strong>İZLE</strong>
                  <small>HAMLELER GİZLİ</small>
                </div>
              ) : (
                <button
                  className="butona-bas-action-button"
                  type="button"
                  disabled={!canTap}
                  aria-describedby={statusId}
                aria-label="Ritmi yakala"
                  onPointerDown={handlePointerDown}
                  onKeyDown={handleKeyDown}
                >
                  <span className="butona-bas-button-halo" aria-hidden="true" />
                  <span className="butona-bas-button-cap">BAS</span>
                  <small>{isPending ? "SİNYAL GİDİYOR" : hasTappedThisWindow ? "PENCERE YAKALANDI" : "RİTMİ YAKALA"}</small>
                </button>
              )}
            </div>

            {phase === "preparing" && !isSpectator && onReady && (
              <button className="butona-bas-ready-button" type="button" disabled={isReady} onClick={onReady}>
                <span aria-hidden="true">{isReady ? "✓" : "→"}</span>
                <strong>{isReady ? "HAZIRSIN" : "HAZIRIM"}</strong>
                <small>{isReady ? "DİĞER OYUNCULAR BEKLENİYOR" : "ZAMANLAMA ÇEKİRDEĞİNİ AÇ"}</small>
              </button>
            )}
          </div>

          <aside className="butona-bas-telemetry" aria-label="Zamanlama göstergesi">
            <div className="butona-bas-telemetry-heading">
              <div><span className="butona-bas-kicker">CANLI GÖSTERGE</span><strong>Açıklığı ısıt.</strong></div>
              <span className="butona-bas-telemetry-pulse" aria-hidden="true" />
            </div>

            <div className="butona-bas-heat-gauge">
              <div className="butona-bas-gauge-heading"><span>ISI / RİTİM</span><strong>{heatPercent}<em>%</em></strong></div>
              <div
                className="butona-bas-gauge-track"
                role="progressbar"
                aria-label="Açıklık ısı seviyesi"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={heatPercent}
                aria-valuetext={`${heatPercent} yüzde ritim ısısı`}
              >
                <span style={{ width: `${heatPercent}%` }} />
              </div>
              <div className="butona-bas-gauge-scale" aria-hidden="true"><span>SOĞUK</span><i /><span>REDLINE</span></div>
            </div>

            <div className="butona-bas-signal-readout">
              <span><small>BU PENCERE</small><strong>{hasTappedThisWindow ? "YAKALANDI" : "AÇIK"}</strong></span>
              <span><small>PENCERE SÜRESİ</small><strong>{publicState.started ? formatWindowTime(serverRemainingMs) : "HAZIR"}</strong></span>
            </div>

            <div className="butona-bas-window-rail" aria-hidden="true">
              {Array.from({ length: 20 }, (_, index) => (
                <span key={index} className={index / 20 <= overallProgress ? "is-lit" : ""} />
              ))}
            </div>
            <p className="butona-bas-rule-note">Aynı 300 ms penceresinde iki farklı oyuncu buluşursa herkes +1 alır. Tek kalan sinyal −1; boş pencere nötrdür.</p>
          </aside>
        </div>
      ) : (
        <ResultComposition
          publicState={publicState}
          ownState={participantOwnState}
          players={players}
          selfPlayerId={selfPlayerId}
          isSpectator={isSpectator}
        />
      )}
    </section>
  );
}
