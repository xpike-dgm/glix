import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { CSSProperties, JSX, KeyboardEvent } from "react";
import type {
  JsonValue,
  KorKronometreOwnState,
  KorKronometrePublicState,
  MatchPlayerState,
  StopwatchResultView
} from "@glix/shared";
import "./KorKronometreStage.css";

const ROUND_DURATION_MS = 18_000;
const HIDDEN_TARGET_MS = 10_000;
const STOP_PAYLOAD = { kind: "stopwatch-stop" } as const;

export type KorKronometreStagePhase =
  | "tutorial"
  | "preparing"
  | "playing"
  | "results"
  | "transition"
  | "finished";

export type KorKronometreActionStatus = "editable" | "pending" | "accepted" | "rejected";

/**
 * The stage only needs the semantic action status. The richer shared action
 * contract can be passed here structurally when the presentation is wired in.
 */
export interface KorKronometreActionState {
  readonly status: KorKronometreActionStatus;
  readonly reason?: string;
}

export interface KorKronometreStageProps {
  readonly publicState: KorKronometrePublicState;
  readonly ownState: KorKronometreOwnState | null | undefined;
  readonly phase: KorKronometreStagePhase;
  readonly isSpectator: boolean;
  readonly selfPlayerId: string | null;
  readonly players?: readonly MatchPlayerState[];
  readonly actionState?: KorKronometreActionState | null;
  readonly onSubmitAction: (payload: JsonValue) => void;
}

type KorKronometreStyle = CSSProperties & {
  "--kk-hand-angle"?: string;
  "--kk-target-angle"?: string;
  "--kk-stop-angle"?: string;
  "--kk-tick-angle"?: string;
};

const TICK_INDICES = Array.from({ length: 18 }, (_, index) => index);

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function formatSeconds(milliseconds: number): string {
  const seconds = Math.max(0, milliseconds) / 1_000;
  return `${seconds.toFixed(3).replace(".", ",")} sn`;
}

function formatPoints(points: number): string {
  return `${points > 0 ? "+" : ""}${points}`;
}

function nicknameFor(players: readonly MatchPlayerState[], playerId: string): string {
  const nickname = players.find((player) => player.id === playerId)?.nickname.trim();
  return nickname || "Oyuncu";
}

function frozenHandAngle(milliseconds: number): number {
  return clamp(milliseconds, 0, ROUND_DURATION_MS) / ROUND_DURATION_MS * 360;
}

function resultStopAngle(result: StopwatchResultView): number {
  const elapsedMs = result.tapped && Number.isFinite(result.elapsedMs)
    ? result.elapsedMs
    : ROUND_DURATION_MS;
  return frozenHandAngle(elapsedMs);
}

function phaseTitle(
  phase: KorKronometreStagePhase,
  isSpectator: boolean,
  isResults: boolean,
  isFrozen: boolean
): string {
  if (isResults) {
    return "Hedef halkası açıldı";
  }

  if (isSpectator) {
    return "Sahneyi izle";
  }

  if (isFrozen) {
    return "STOP kilitlendi";
  }

  if (phase === "playing") {
    return "Anı yakala";
  }

  if (phase === "tutorial") {
    return "Kadran kapalı";
  }

  return "Sahne hazırlanıyor";
}

function statusCopy(
  phase: KorKronometreStagePhase,
  isSpectator: boolean,
  isResults: boolean,
  isStarted: boolean,
  isServerFrozen: boolean,
  isPending: boolean,
  isAcknowledged: boolean,
  isRejected: boolean
): { readonly title: string; readonly detail: string } {
  if (isSpectator) {
    return { title: "GÖZLEM MODU", detail: "Bu sahne nötr; burada hamle gönderemezsin." };
  }

  if (isResults) {
    return { title: "SONUÇLAR HAZIR", detail: "Yakınlık sırası ve mesafeler tur kaydından açıldı." };
  }

  if (isRejected) {
    return { title: "TEKRAR DENE", detail: "Hamle ulaşmadı; uygun fazda yeniden deneyebilirsin." };
  }

  if (isServerFrozen) {
    return { title: "ELİN DONDURULDU", detail: "STOP kaydı alındı. Diğer oyuncular bekleniyor." };
  }

  if (isAcknowledged) {
    return { title: "HAMLE KAYDEDİLDİ", detail: "Elin sabit tutuluyor; bu turda tekrar basamazsın." };
  }

  if (isPending) {
    return { title: "GÖNDERİLİYOR…", detail: "Elin kısa süreliğine sabit; kayıt bekleniyor." };
  }

  if (!isStarted || phase !== "playing") {
    return { title: "KADRAN KAPALI", detail: "Süre penceresi açıldığında tek STOP hakkın hazır olacak." };
  }

  return { title: "TEK STOP HAKKI", detail: "Gerçek sayaç görünmez. İçinden say ve doğru anda durdur." };
}

export function KorKronometreStage({
  publicState,
  ownState,
  phase,
  isSpectator,
  selfPlayerId,
  players = [],
  actionState = null,
  onSubmitAction
}: KorKronometreStageProps): JSX.Element {
  const [localStopRequested, setLocalStopRequested] = useState(false);
  const hasFiredStopRef = useRef(false);
  const instructionsId = useId();
  const liveStatusId = useId();

  const isResults = publicState.finished || phase === "results" || phase === "finished";
  const isServerFrozen = Boolean(ownState?.hasTapped);
  const isPendingAction = actionState?.status === "pending";
  const isAcknowledgedAction = actionState?.status === "accepted" && !isServerFrozen;
  const isRejected = actionState?.status === "rejected" && !isServerFrozen;
  const isPending = !isServerFrozen && (localStopRequested || isPendingAction);
  const isFrozen = isServerFrozen || isPending || isAcknowledgedAction || isResults;
  const isLive = phase === "playing" && publicState.started && !publicState.finished;
  const canStop = isLive && !isSpectator && !isFrozen && !ownState?.finished && !hasFiredStopRef.current;
  const targetVisible = isResults && publicState.targetMs !== null;
  const rankings = isResults ? publicState.results ?? [] : [];

  const authoritativeHandAngle = ownState?.hasTapped && ownState.elapsedMs !== null && Number.isFinite(ownState.elapsedMs)
    ? frozenHandAngle(ownState.elapsedMs)
    : null;
  const targetAngle = targetVisible && Number.isFinite(publicState.targetMs)
    ? clamp(publicState.targetMs, 0, ROUND_DURATION_MS) / ROUND_DURATION_MS * 360
    : 0;
  const handStyle: KorKronometreStyle | undefined = authoritativeHandAngle === null
    ? undefined
    : { "--kk-hand-angle": `${authoritativeHandAngle}deg` };
  const targetStyle: KorKronometreStyle = { "--kk-target-angle": `${targetAngle}deg` };

  useEffect(() => {
    if (phase === "tutorial" || phase === "preparing" || !publicState.started) {
      hasFiredStopRef.current = false;
      setLocalStopRequested(false);
    }
  }, [phase, publicState.started]);

  useEffect(() => {
    if (isRejected) {
      hasFiredStopRef.current = false;
      setLocalStopRequested(false);
    }
  }, [isRejected]);

  const submitStop = useCallback((): void => {
    if (!canStop || hasFiredStopRef.current) {
      return;
    }

    hasFiredStopRef.current = true;
    setLocalStopRequested(true);
    onSubmitAction(STOP_PAYLOAD);
  }, [canStop, onSubmitAction]);

  const handleStopKeyDown = useCallback((event: KeyboardEvent<HTMLButtonElement>): void => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();

    if (!event.repeat) {
      submitStop();
    }
  }, [submitStop]);

  const liveMessage = isSpectator
    ? "Gözlem modu: sahne nötr, hamle kapalı."
    : isResults
      ? "Kör Kronometre sonuçları açıldı; isimler, yakınlık mesafeleri ve sıralar gösteriliyor."
      : isRejected
        ? "STOP reddedildi; hamlen tekrar için açık."
        : isServerFrozen
          ? "STOP kaydedildi; kişisel elin dondu."
          : isPending
            ? "STOP gönderiliyor; kişisel elin yerel olarak dondu."
            : isLive
              ? "Kadran kapalı; tek STOP hakkın hazır."
              : "Kronometre sahnesi hazırlanıyor.";
  const feedback = statusCopy(
    phase,
    isSpectator,
    isResults,
    publicState.started,
    isServerFrozen,
    isPending,
    isAcknowledgedAction,
    isRejected
  );

  const dialAriaLabel = targetVisible
    ? `Sonuç kadranı: hedef halkası ve ${(publicState.results ?? []).length} oyuncu duruş işareti açıldı.`
    : isSpectator
      ? "Nötr gözlem kadranı; oyuncu eli gizli."
      : "Kapalı analog kronometre kadranı; sayaç ve hedef görünmüyor.";

  return (
    <section
      className={`kk-stage ${isSpectator ? "is-spectator" : ""} ${isResults ? "is-results" : ""}`}
      aria-label="Kör Kronometre premium oyun sahnesi"
    >
      <div className="kk-stage-shell">
        <header className="kk-stage-header">
          <div className="kk-stage-heading">
            <span className="kk-eyebrow">KÖR KRONOMETRE</span>
            <h2>{phaseTitle(phase, isSpectator, isResults, isFrozen)}</h2>
          </div>
          <div className="kk-contract-badge" aria-label="18 saniyelik faz, tek STOP hakkı">
            <span>18 SN</span>
            <i aria-hidden="true" />
            <span>TEK STOP</span>
          </div>
        </header>

        <div className="kk-stage-grid">
          <div className="kk-stopwatch-column">
            <div className="kk-stopwatch-wrap">
              <span className="kk-crown kk-crown-top" aria-hidden="true" />
              <span className="kk-crown kk-crown-side" aria-hidden="true" />
              <div className={`kk-stopwatch ${targetVisible ? "has-target" : ""}`}>
                <div className="kk-bezel">
                  <div className="kk-dial" role="img" aria-label={dialAriaLabel}>
                    <span className="kk-dial-rim kk-dial-rim-outer" aria-hidden="true" />
                    <span className="kk-dial-rim kk-dial-rim-inner" aria-hidden="true" />
                    <span className="kk-dial-ticks" aria-hidden="true">
                      {TICK_INDICES.map((index) => (
                        <i
                          className={`kk-dial-tick ${index % 3 === 0 ? "is-major" : ""}`}
                          key={index}
                          style={{ "--kk-tick-angle": `${index * 20}deg` } as KorKronometreStyle}
                        />
                      ))}
                    </span>

                    {targetVisible && (
                      <span className="kk-target-ring" aria-hidden="true" style={targetStyle}>
                        <i className="kk-target-marker" />
                      </span>
                    )}

                    {isResults && publicState.results?.map((result) => (
                      <span
                        className={`kk-result-stop-marker ${result.tapped ? "" : "is-missing"} ${result.playerId === selfPlayerId ? "is-self" : ""}`}
                        key={`stop-${result.playerId}`}
                        aria-hidden="true"
                        style={{ "--kk-stop-angle": `${resultStopAngle(result)}deg` } as KorKronometreStyle}
                      />
                    ))}

                    {!isSpectator && (
                      <span
                        className="kk-private-hand"
                        aria-hidden="true"
                        style={handStyle}
                      >
                        <i />
                      </span>
                    )}

                    <span className="kk-dial-hub" aria-hidden="true"><i /></span>
                    <span className="kk-dial-readout">
                      <small>{isResults ? "SONUÇ KADRANI" : isSpectator ? "NÖTR GÖRÜNÜM" : "KAPALI KADRAN"}</small>
                      <strong>{isResults ? "AÇIK" : isFrozen ? "KİLİTLİ" : "—"}</strong>
                      <em>{targetVisible ? "HEDEF HALKASI" : isSpectator ? "EL GİZLİ" : "SAYAÇ GİZLİ"}</em>
                    </span>
                    <span className="kk-glass-cover" aria-hidden="true" />
                    <span className="kk-cover-stamp" aria-hidden="true">SAAT GÖRÜNMEZ</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="kk-stopwatch-caption" aria-hidden="true">
              <span className="kk-caption-line" />
              <span>{isResults ? "DURUŞLAR / SONUÇ AÇIK" : isSpectator ? "İZLEME / NÖTR SAHNE" : "KİŞİSEL EL / HAMLE DURUMU"}</span>
              <span className="kk-caption-line" />
            </div>
          </div>

          <div className="kk-action-column">
            <div className="kk-feedback" aria-live="polite">
              <span className="kk-feedback-light" aria-hidden="true" />
              <div>
                <strong>{feedback.title}</strong>
                <small>{feedback.detail}</small>
              </div>
            </div>

            {!isResults && !isSpectator && (
              <div className="kk-stop-panel">
                <button
                  className="kk-stop-button"
                  type="button"
                  disabled={!canStop}
                  aria-describedby={`${instructionsId} ${liveStatusId}`}
                  aria-label="Kronometreyi durdur"
                  onClick={submitStop}
                  onKeyDown={handleStopKeyDown}
                >
                  <span className="kk-stop-button-glow" aria-hidden="true" />
                  <span className="kk-stop-button-mark" aria-hidden="true">■</span>
                  <strong>STOP</strong>
                  <small>{isPending ? "EL DONDURULUYOR" : isServerFrozen ? "KAYIT ALINDI" : "TEK HAK · SPACE / ENTER"}</small>
                </button>
                <p className="kk-stop-instructions" id={instructionsId}>
                  Sayaç ve hedef kapalı. Tek STOP hakkını kullan; Space veya Enter da aynı hamleyi gönderir.
                </p>
              </div>
            )}

            {isSpectator && !isResults && (
              <div className="kk-neutral-card">
                <span className="kk-neutral-mark" aria-hidden="true">◌</span>
                <strong>SAHNE NÖTR</strong>
                <small>Oyuncuların özel elleri ve yerel zamanları sana gösterilmez.</small>
              </div>
            )}

            {isResults && (
              <div className="kk-results" aria-label="Kör Kronometre tur sonuçları">
                <div className="kk-results-header">
                  <span>YAKINLIK SIRASI</span>
                  <span>MESAFE · PUAN</span>
                </div>
                {rankings.length > 0 ? (
                  <ol className="kk-results-list">
                    {rankings.map((result) => {
                      const isSelf = result.playerId === selfPlayerId;
                      return (
                        <li className={`kk-result-row ${isSelf ? "is-self" : ""}`} key={result.playerId}>
                          <span className="kk-result-rank" aria-label={`${result.rank}. sıra`}>#{result.rank}</span>
                          <span className="kk-result-player">
                            <strong>{nicknameFor(players, result.playerId)}</strong>
                            <small>{isSelf ? "SEN" : result.tapped ? "STOP KAYDI" : "BASMADI · 18 SN KABULÜ"}</small>
                          </span>
                          <span className="kk-result-distance" aria-label={`${formatSeconds(result.distanceMs)} uzaklık`}>
                            {formatSeconds(result.distanceMs)}
                          </span>
                          <b className="kk-result-points" aria-label={`${formatPoints(result.points)} puan`}>
                            {formatPoints(result.points)}
                          </b>
                        </li>
                      );
                    })}
                  </ol>
                ) : (
                  <p className="kk-results-empty">Sonuçlar hesaplanıyor…</p>
                )}
                <p className="kk-results-rule">
                  {targetVisible
                    ? `Hedef: ${formatSeconds(HIDDEN_TARGET_MS)} · Halkadaki işaretler tur duruşlarını gösterir · En yakın +2 · ikinci +1 · basmayan 18,000 sn kabul edilir.`
                    : "Hedef halkası tur kaydını bekliyor."}
                </p>
              </div>
            )}

            {!isResults && !isSpectator && (
              <p className="kk-rule-note">
                Gerçek süre bu fazda açılmaz. Tur kaydı ilk geçerli STOP hamlesini saklar; eksik hamle tur sonunda 18 saniye kabul edilir.
              </p>
            )}
          </div>
        </div>

        <p className="kk-live-status" id={liveStatusId} role="status" aria-live="polite" aria-atomic="true">
          {liveMessage}
        </p>
      </div>
    </section>
  );
}
