import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, JSX } from "react";
import type {
  AsiriYuklemeOwnState,
  AsiriYuklemePublicState,
  AsiriYuklemeResultView,
  JsonValue
} from "@glix/shared";
import "./AsiriYuklemeStage.css";

export type AsiriYuklemeStagePhase =
  | "tutorial"
  | "preparing"
  | "playing"
  | "results"
  | "transition"
  | "finished";

/** The stage only needs identity for result copy; the full match roster is compatible. */
export interface AsiriYuklemePlayer {
  readonly id: string;
  readonly nickname: string;
}

/**
 * This deliberately mirrors the shared ACK reducer's useful presentation
 * states without coupling this isolated slice to a later client shell.
 */
export type AsiriYuklemeActionStatus = "editable" | "pending" | "accepted" | "rejected";

export interface AsiriYuklemeActionState {
  readonly status: AsiriYuklemeActionStatus;
  readonly actionId?: string;
  readonly authoritativeVersion?: number;
  readonly observedStateVersion?: number;
  readonly ackStateVersion?: number;
  readonly acceptedActionCount?: number;
  readonly mode?: string;
  readonly scope?: object;
  readonly reason?: string;
}

export interface AsiriYuklemeStageProps {
  readonly publicState: AsiriYuklemePublicState;
  readonly ownState?: AsiriYuklemeOwnState | null;
  readonly phase?: AsiriYuklemeStagePhase;
  readonly isSpectator?: boolean;
  readonly selfPlayerId?: string | null;
  readonly players?: readonly AsiriYuklemePlayer[];
  readonly actionState?: AsiriYuklemeActionState | null;
  readonly isReady?: boolean;
  readonly onReady?: () => void;
  /** Preferred name used by the Stage 11 visual shell. */
  readonly onSubmitAction?: (payload: JsonValue) => void;
  /** Compatibility alias for the existing Stage 7 game-control surface. */
  readonly onSubmit?: (payload: JsonValue) => void;
  readonly className?: string;
}

interface AsiriYuklemeStyle extends CSSProperties {
  "--asiri-energy"?: string;
  "--asiri-tick-angle"?: string;
}

const REJECTION_COPY: Readonly<Record<string, string>> = {
  "input_phase_locked": "BU AŞAMADA HAMLE KAPALI",
  "input_late": "KIRMIZI HAT PENCERESİ KAPANDI",
  "input_duplicate": "HAMLE ZATEN İŞLENDİ",
  "input_disabled": "HAMLE KAPALI",
  spectator: "İZLEYİCİ MODU",
  "invalid_game_input": "GEÇERSİZ HAMLE",
  "phase-locked": "BU AŞAMADA HAMLE KAPALI",
  late: "KIRMIZI HAT PENCERESİ KAPANDI",
  duplicate: "HAMLE ZATEN İŞLENDİ",
  invalid: "GEÇERSİZ HAMLE",
  offline: "BAĞLANTI YOK"
};

const CHAMBER_TICKS = Array.from({ length: 12 }, (_, index) => index);

function clampEnergy(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

function safeClickCount(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.floor(value));
}

function signedPoints(points: number): string {
  return points > 0 ? `+${points}` : String(points);
}

function nicknameFor(
  players: readonly AsiriYuklemePlayer[],
  playerId: string
): string {
  const nickname = players.find((player) => player.id === playerId)?.nickname.trim();
  return nickname || "Oyuncu";
}

function feedbackCopy(
  actionState: AsiriYuklemeActionState | null | undefined,
  isLocalPending: boolean,
  isSpectator: boolean,
  isResultPhase: boolean,
  publicState: AsiriYuklemePublicState
): { readonly tone: "neutral" | "pending" | "accepted" | "rejected"; readonly text: string } {
  if (isResultPhase) {
    return { tone: "neutral", text: "Sonuç açıklandı." };
  }

  if (actionState?.status === "rejected") {
    const reason = actionState.reason ? REJECTION_COPY[actionState.reason] : undefined;
    return {
      tone: "rejected",
      text: `Tekrar dene.${reason ? ` ${reason}` : ""}`
    };
  }

  if (isLocalPending || actionState?.status === "pending") {
    return { tone: "pending", text: "Gönderiliyor… Tekrar tıklayabilirsin." };
  }

  if (actionState?.status === "accepted") {
    return { tone: "accepted", text: "Hamlen kaydedildi. Devam et." };
  }

  if (isSpectator) {
    return { tone: "neutral", text: "Bu turu izliyorsun; ortak basınç akışını takip et." };
  }

  if (!publicState.started) {
    return { tone: "neutral", text: "Reaktör hazırlanıyor." };
  }

  if (publicState.armed) {
    return { tone: "neutral", text: "Kırmızı hat hazır; çekirdek mühürlü." };
  }

  return { tone: "neutral", text: "Ortak enerjiyi doldur." };
}

function resultExplanation(row: AsiriYuklemeResultView): string {
  if (row.exploded) {
    return "PATLAMA · TAŞMA TIKLAMASI · −1";
  }

  if (row.points >= 2) {
    return `TAŞMA YOK · SIRA ${row.rank ?? "—"} · +2 BONUS`;
  }

  if (row.points === 1) {
    return `TAŞMA YOK · SIRA ${row.rank ?? "—"} · +1 BONUS`;
  }

  return `TAŞMA YOK · SIRA ${row.rank ?? "—"} · BONUS YOK`;
}

function ResultPanel({
  publicState,
  players,
  selfPlayerId
}: {
  readonly publicState: AsiriYuklemePublicState;
  readonly players: readonly AsiriYuklemePlayer[];
  readonly selfPlayerId: string | null | undefined;
}): JSX.Element {
  const hasResultData = publicState.finished && publicState.results !== null;

  if (!hasResultData) {
    return (
      <section className="asiri-yukleme-results asiri-yukleme-results-placeholder" aria-label="Aşırı Yükleme sonuçları">
        <span className="asiri-yukleme-results-kicker">SONUÇ HAZIRLANIYOR</span>
        <strong>Sonuçlar bekleniyor…</strong>
      </section>
    );
  }

  const rows: readonly AsiriYuklemeResultView[] = publicState.results ?? [];
  const rupturedPlayer = publicState.explodedPlayerId
    ? nicknameFor(players, publicState.explodedPlayerId)
    : null;
  const summary = rupturedPlayer
    ? `${rupturedPlayer} taşma tıklamasıyla çekirdeği patlattı.`
    : "Kimse kırmızı hattı aşmadı; çekirdek güvenle kapandı.";

  return (
    <section className="asiri-yukleme-results" aria-labelledby="asiri-yukleme-results-title" aria-live="polite">
      <div className="asiri-yukleme-results-heading">
        <div>
          <span className="asiri-yukleme-results-kicker">TUR SONUCU / REAKTÖR KAYDI</span>
          <h2 id="asiri-yukleme-results-title">{rupturedPlayer ? "REAKTÖR PATLADI" : "TAŞMA YOK"}</h2>
        </div>
        <span className={`asiri-yukleme-result-seal ${rupturedPlayer ? "is-rupture" : "is-safe"}`}>
          {rupturedPlayer ? "PATLAMA" : "MÜHÜRLÜ"}
        </span>
      </div>

      <p className="asiri-yukleme-result-summary">{summary}</p>

      <div className="asiri-yukleme-result-legend" aria-label="Sonuç açıklaması">
        <span><b>PATLAMA</b> taşma tıklaması</span>
        <span><b>SIRA</b> tık sıralaması</span>
        <span><b>TAŞMA YOK</b> çekirdek güvende</span>
      </div>

      {rows.length > 0 ? (
        <ol className="asiri-yukleme-result-list" aria-label="Oyuncu tık sıralaması">
          {rows.map((row) => (
            <li
              className={`asiri-yukleme-result-row ${row.exploded ? "is-ruptured" : ""} ${row.playerId === selfPlayerId ? "is-self" : ""}`}
              key={row.playerId}
            >
              <span className="asiri-yukleme-result-rank" aria-label={row.exploded ? "Taşma tıklaması" : `Sıra ${row.rank ?? "—"}`}>
                {row.exploded ? "×" : `#${row.rank ?? "—"}`}
              </span>
              <span className="asiri-yukleme-result-player">
                <strong>{nicknameFor(players, row.playerId)}</strong>
                {row.playerId === selfPlayerId && <small>SEN</small>}
                <small>{resultExplanation(row)}</small>
              </span>
              <span className="asiri-yukleme-result-clicks">{row.clickCount} TIK</span>
              <b className="asiri-yukleme-result-points">{signedPoints(row.points)}</b>
            </li>
          ))}
        </ol>
      ) : (
        <p className="asiri-yukleme-result-summary">Oyuncu sonucu bulunamadı.</p>
      )}
    </section>
  );
}

export function AsiriYuklemeStage({
  publicState,
  ownState,
  phase,
  isSpectator: isSpectatorProp,
  selfPlayerId,
  players = [],
  actionState,
  isReady = false,
  onReady,
  onSubmitAction,
  onSubmit,
  className
}: AsiriYuklemeStageProps): JSX.Element {
  const [isLocalPending, setIsLocalPending] = useState(false);
  const previousClickCount = useRef<number | null>(ownState?.clickCount ?? null);
  const isSpectator = isSpectatorProp ?? ownState == null;
  const isResultPhase = publicState.finished || phase === "results" || phase === "finished";
  const hasAuthoritativeRupture = publicState.finished && publicState.explodedPlayerId !== null;
  const energy = clampEnergy(publicState.energy);
  const canSubmit = Boolean(
    !isSpectator &&
      publicState.started &&
      !publicState.finished &&
      phase !== "tutorial" &&
      phase !== "preparing" &&
      phase !== "transition" &&
      !ownState?.exploded
  );
  const submitAction = onSubmitAction ?? onSubmit;
  const feedback = feedbackCopy(actionState, isLocalPending, isSpectator, isResultPhase, publicState);
  const reactorState = hasAuthoritativeRupture
    ? "is-ruptured"
    : publicState.armed
      ? "is-sealed"
      : "is-charging";
  const stageStyle: AsiriYuklemeStyle = { "--asiri-energy": `${energy}%` };

  useEffect(() => {
    const currentClickCount = ownState?.clickCount ?? null;
    if (currentClickCount !== previousClickCount.current) {
      setIsLocalPending(false);
    }
    previousClickCount.current = currentClickCount;
  }, [ownState?.clickCount]);

  useEffect(() => {
    if (actionState?.status === "accepted" || actionState?.status === "rejected" || isResultPhase) {
      setIsLocalPending(false);
    }
  }, [actionState?.status, isResultPhase]);

  useEffect(() => {
    if (phase === "tutorial" || phase === "preparing") {
      setIsLocalPending(false);
    }
  }, [phase]);

  const handleOverloadClick = useCallback((): void => {
    if (!canSubmit || !submitAction) {
      return;
    }

    // Pending is presentation-only. It never changes the reactor or invents a rupture.
    setIsLocalPending(true);
    submitAction({ kind: "overload-click" });
  }, [canSubmit, submitAction]);

  return (
    <section
      className={`asiri-yukleme-stage ${publicState.armed && !isResultPhase ? "is-armed" : ""} ${isResultPhase ? "is-results" : ""} ${isSpectator ? "is-spectator" : ""} ${className ?? ""}`.trim()}
      style={stageStyle}
      aria-label="Aşırı Yükleme basınç reaktörü"
    >
      <div className="asiri-yukleme-stage-grid" aria-hidden="true" />

      <header className="asiri-yukleme-masthead">
        <div>
          <span className="asiri-yukleme-eyebrow">GLIX / BASINÇ ODASI</span>
          <h1>Aşırı Yükleme<span>.</span></h1>
          <p>Ortak enerjiyi kırmızı hatta taşı. Reaktörün kaderi herkesin tıkında.</p>
        </div>
        <div className="asiri-yukleme-masthead-badge" aria-label="Basınç göstergesi">
          <span className="asiri-yukleme-badge-led" aria-hidden="true" />
          <strong>BASINÇ</strong>
          <small>CANLI ÇEKİRDEK</small>
        </div>
      </header>

      <div className="asiri-yukleme-reactor-layout">
        <section className={`asiri-yukleme-reactor-shell ${reactorState}`} aria-label="Halka açık enerji odası ve mühürlü kırmızı hat çekirdeği">
          <div className="asiri-yukleme-reactor-topline">
            <span>ORTAK ENERJİ ODASI</span>
            <span className={`asiri-yukleme-reactor-state ${publicState.armed && !isResultPhase ? "is-redline" : ""}`}>
              {hasAuthoritativeRupture ? "PATLADI" : publicState.armed ? "KIRMIZI HAT HAZIR" : "DOLUYOR"}
            </span>
          </div>

          <div className="asiri-yukleme-chamber">
            <div className="asiri-yukleme-chamber-glow" aria-hidden="true" />
            <div className="asiri-yukleme-chamber-ring chamber-ring-outer" aria-hidden="true" />
            <div className="asiri-yukleme-chamber-ring chamber-ring-inner" aria-hidden="true" />
            <div className="asiri-yukleme-chamber-ticks" aria-hidden="true">
              {CHAMBER_TICKS.map((tick) => (
                <span key={tick} style={{ "--asiri-tick-angle": `${tick * 30}deg` } as AsiriYuklemeStyle} />
              ))}
            </div>
            <div className="asiri-yukleme-energy-liquid" aria-hidden="true" />

            <div className="asiri-yukleme-redline-core" aria-hidden="true">
              <span className="asiri-yukleme-core-seal" />
              <span className="asiri-yukleme-core-lock">{hasAuthoritativeRupture ? "×" : "◆"}</span>
              <span className="asiri-yukleme-core-label">MÜHÜRLÜ KIRMIZI ÇEKİRDEK</span>
            </div>

            <output className="asiri-yukleme-energy-output" aria-label={`Halka açık ortak enerji: ${energy} yüzde`}>
              <strong>{energy}</strong>
              <span>/ 100</span>
              <small>ORTAK ENERJİ</small>
            </output>
          </div>

          <div className="asiri-yukleme-public-meter-wrap">
            <div className="asiri-yukleme-public-meter-label">
              <span>ORTAK BASINÇ</span>
              <strong>{energy}%</strong>
            </div>
            <div
              className="asiri-yukleme-public-meter"
              role="progressbar"
              aria-label="Halka açık ortak enerji"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={energy}
              aria-valuetext={`${energy} yüzde ortak enerji`}
            >
              <span />
            </div>
          </div>

          <p className="asiri-yukleme-reactor-note">
            {hasAuthoritativeRupture
              ? "Patlama kayda geçti. Aşağıdaki sonuç bu turun oyun kaydıdır."
              : publicState.armed
                ? "Kırmızı hat mühürlü. Kesin tetik zamanı gösterilmez."
                : "Enerji seviyesi herkes için açıktır; tık ayrıntıları sonuçta açılır."}
          </p>
        </section>

        <aside className="asiri-yukleme-readout" aria-label="Oyuncu basınç göstergesi">
          <div className="asiri-yukleme-readout-topline">
            <span>KİŞİSEL GÖSTERGE</span>
            <span>YALNIZCA SEN</span>
          </div>
          <div className="asiri-yukleme-own-readout">
            <span>TIKLARIN</span>
            <strong>{ownState ? safeClickCount(ownState.clickCount) : "—"}</strong>
            <small>YALNIZCA SENİN EKRANINDA</small>
          </div>
          <div className="asiri-yukleme-readout-divider" aria-hidden="true" />
          <p>
            {isSpectator
              ? "Bu koltuk izleyici. Ortak enerji odası herkese açık; hamle gönderilemez."
              : "Tıkların tekrar edilebilir. Kayıt gelene kadar reaktör yalnızca ortak enerjiyi gösterir."}
          </p>
          <span className="asiri-yukleme-readout-tag">BAŞKALARININ TIKLARI GİZLİ</span>
        </aside>
      </div>

      <div className="asiri-yukleme-action-dock">
        <div className="asiri-yukleme-action-heading">
          <span className="asiri-yukleme-action-kicker">AŞIRI YÜKLEME / TEKRARLANABİLİR</span>
          <strong>{publicState.armed && !isResultPhase ? "KIRMIZI HATTA DOKUN" : "BASINCI YÜKLE"}</strong>
        </div>
        <button
          className="asiri-yukleme-overload-button"
          type="button"
          disabled={!canSubmit}
          aria-label="Aşırı Yükleme düğmesi"
          onClick={handleOverloadClick}
        >
          <span className="asiri-yukleme-button-halo" aria-hidden="true" />
          <span className="asiri-yukleme-button-core" aria-hidden="true">＋</span>
          <span className="asiri-yukleme-button-copy">
            <strong>{isResultPhase ? "HAMLELER KAPALI" : isSpectator ? "İZLE" : "TIKLA"}</strong>
            <small>{isResultPhase ? "SONUÇ BU TURUN KAYDI" : "BASINÇ TIKLAMASI · TEKRARLANABİLİR"}</small>
          </span>
        </button>
        <p className="asiri-yukleme-action-note">
          {isResultPhase
            ? "Sonuç yalnızca oyun kaydından okunur."
            : publicState.armed
              ? "Kırmızı hat görünür; kesin tetik zamanı gösterilmez."
              : "Hızlı tıklarla ortak enerji odasını doldur. Tık ayrıntın gizli kalır."}
        </p>
      </div>

      <div className="asiri-yukleme-feedback" role="status" aria-live="polite" aria-atomic="true">
        <span className="asiri-yukleme-feedback-led" aria-hidden="true" />
        <span>{feedback.text}</span>
      </div>

      {phase === "preparing" && !isSpectator && onReady && (
        <div className="asiri-yukleme-ready-overlay">
          <button className="asiri-yukleme-ready-button" type="button" disabled={isReady} onClick={onReady}>
            <strong>{isReady ? "HAZIRSIN" : "HAZIRIM"}</strong>
            <small>{isReady ? "DİĞERLERİ BEKLENİYOR" : "REAKTÖRÜ AÇ"}</small>
          </button>
        </div>
      )}

      {isResultPhase && (
        <ResultPanel publicState={publicState} players={players} selfPlayerId={selfPlayerId} />
      )}
    </section>
  );
}
