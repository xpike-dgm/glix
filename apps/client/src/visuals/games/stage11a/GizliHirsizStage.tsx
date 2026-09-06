import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { JSX, KeyboardEvent } from "react";
import type {
  GizliHirsizOwnState,
  GizliHirsizPublicState,
  JsonValue,
  MatchPlayerState
} from "@glix/shared";
import "./GizliHirsizStage.css";

export type GizliHirsizStagePhase =
  | "tutorial"
  | "preparing"
  | "playing"
  | "results"
  | "transition"
  | "finished";

export type GizliHirsizAckStatus = "editable" | "pending" | "accepted" | "rejected";

/**
 * The visual only needs the reducer's public ACK state. The additional fields
 * carried by the shared Stage 11 action state remain structurally compatible.
 */
export interface GizliHirsizActionState {
  readonly status: GizliHirsizAckStatus;
  readonly actionId?: string;
  readonly acceptedActionCount?: number;
  readonly authoritativeVersion?: number;
  readonly observedStateVersion?: number;
  readonly ackStateVersion?: number;
  readonly mode?: string;
  readonly scope?: object;
  readonly reason?: string;
}

export interface GizliHirsizStageProps {
  readonly publicState: GizliHirsizPublicState;
  readonly ownState: GizliHirsizOwnState | null | undefined;
  readonly phase?: GizliHirsizStagePhase;
  readonly isSpectator?: boolean;
  readonly selfPlayerId?: string | null;
  readonly players?: readonly Pick<MatchPlayerState, "id" | "nickname">[];
  /** Used as a result fallback when a reconnect snapshot has no roster row. */
  readonly nickname?: string;
  readonly now?: number;
  readonly actionState?: GizliHirsizActionState | null;
  readonly isReady?: boolean;
  readonly onReady?: () => void;
  /** Preferred Stage 11 name. */
  readonly onSubmitAction?: (payload: JsonValue) => void;
  /** Compatibility alias for the existing Stage 6–9 control surface. */
  readonly onSubmit?: (payload: JsonValue) => void;
}

type PlayerLabel = Pick<MatchPlayerState, "id" | "nickname">;
type ResultOutcome = "zero" | "one" | "multiple";

const RETRYABLE_REASONS = new Set(["offline", "input_phase_locked"]);

const ACK_REASON_LABELS: Readonly<Record<string, string>> = {
  input_phase_locked: "Bu fazda kasa hamlesi açık değil.",
  input_late: "Kasa penceresi kapandı.",
  input_duplicate: "Bu turda tek bir iz bırakabilirsin.",
  input_disabled: "Bu faz hamle kabul etmiyor.",
  input_empty_not_allowed: "Kasa hamlesi boş bırakılamaz.",
  spectator: "Bu turu yalnızca izleyebilirsin.",
  invalid_game_input: "Kasa izi kabul edilmedi.",
  offline: "Bağlantı yok. Sahne açıksa tekrar deneyebilirsin.",
  invalid: "Kasa izi kabul edilmedi.",
  duplicate: "Bu turda tek bir iz bırakabilirsin.",
  late: "Kasa penceresi kapandı.",
  "phase-locked": "Bu fazda kasa hamlesi açık değil."
};

function formatPoints(points: number): string {
  return `${points > 0 ? "+" : ""}${points}`;
}

function remainingSeconds(deadline: number | null, now: number): number | null {
  if (deadline === null) {
    return null;
  }

  return Math.max(0, Math.ceil((deadline - now) / 1000));
}

function phaseFromState(
  phase: GizliHirsizStagePhase | undefined,
  publicState: GizliHirsizPublicState
): GizliHirsizStagePhase {
  if (phase) {
    return phase;
  }

  if (publicState.finished) {
    return "results";
  }

  return publicState.started ? "playing" : "preparing";
}

function isRetryableRejection(reason: string | undefined): boolean {
  // An omitted reason is still retryable only when the live state below says
  // the single action is legal. Unknown server reasons stay conservative.
  return reason === undefined || RETRYABLE_REASONS.has(reason);
}

function playerNickname(
  playerId: string,
  players: readonly PlayerLabel[],
  selfPlayerId: string | null,
  ownNickname: string | undefined
): string {
  const player = players.find((candidate) => candidate.id === playerId);
  if (player?.nickname.trim()) {
    return player.nickname;
  }

  if (playerId === selfPlayerId && ownNickname?.trim()) {
    return ownNickname.trim();
  }

  return "Anonim oyuncu";
}

function outcomeForCount(count: number): ResultOutcome {
  if (count === 0) {
    return "zero";
  }

  return count === 1 ? "one" : "multiple";
}

function outcomeCopy(outcome: ResultOutcome): {
  readonly kicker: string;
  readonly title: string;
  readonly description: string;
} {
  if (outcome === "zero") {
    return {
      kicker: "TUR SONUCU / 0 İZ / KASA KAPALI",
      title: "Kimse hamle yapmadı",
      description: "Güvenlik çekirdeği kilitli kaldı; bu turda puan değişmedi."
    };
  }

  if (outcome === "one") {
    return {
      kicker: "TUR SONUCU / 1 İZ / TEMİZ KAÇIŞ",
      title: "Kasa tek bir hırsıza açıldı",
      description: "Tek kalan anonim iz, çekirdeği sessizce açtı."
    };
  }

  return {
    kicker: "TUR SONUCU / ÇOKLU İZ / ALARM",
    title: "Birden fazla hırsız yakalandı",
    description: "Aynı turda birden fazla iz bırakıldığı için basanlar ceza aldı."
  };
}

function resultPointsForPlayer(
  publicState: GizliHirsizPublicState,
  selfPlayerId: string | null
): number | null {
  if (!publicState.finished || !selfPlayerId) {
    return null;
  }

  return publicState.resultPoints?.find((entry) => entry.playerId === selfPlayerId)?.points ?? 0;
}

function FingerprintMark({ visible }: { readonly visible: boolean }): JSX.Element {
  if (!visible) {
    return <span className="gizli-hirsiz-fingerprint-mark" aria-hidden="true" />;
  }

  return (
    <span className="gizli-hirsiz-fingerprint-mark" aria-hidden="true">
      <svg viewBox="0 0 64 64" focusable="false">
        <path d="M32 10c-11.6 0-21 9.4-21 21 0 4.9 1.7 9.7 4.8 13.5" />
        <path d="M32 16c-8.3 0-15 6.7-15 15 0 6.3 2.1 11.7 5.9 16.1" />
        <path d="M32 22c-5 0-9 4-9 9 0 7.3 2.8 13.4 7.8 18.4" />
        <path d="M32 28c-1.7 0-3 1.3-3 3 0 8.1 3.5 14.7 9.4 20" />
        <path d="M32 10c11.6 0 21 9.4 21 21 0 6.6-2.9 12.7-7.8 16.7" />
        <path d="M32 16c8.3 0 15 6.7 15 15 0 5.2-1.5 9.2-4.2 12.9" />
        <path d="M32 22c5 0 9 4 9 9 0 3.9-.7 6.9-2.1 9.7" />
      </svg>
    </span>
  );
}

function AlarmLamp({ outcome }: { readonly outcome: "armed" | ResultOutcome }): JSX.Element {
  const label = outcome === "armed"
    ? "Alarm lambası hazır; sonuç gizli"
    : outcome === "zero"
      ? "Alarm lambası sönük; kimse hamle yapmadı"
      : outcome === "one"
        ? "Alarm lambası yeşil; tek iz bulundu"
        : "Alarm lambası kırmızı; çoklu iz bulundu";

  return (
    <div className={`gizli-hirsiz-alarm-lamp is-${outcome}`} role="img" aria-label={label}>
      <span className="gizli-hirsiz-alarm-lamp__bezel" aria-hidden="true" />
      <span className="gizli-hirsiz-alarm-lamp__bulb" aria-hidden="true" />
      <span className="gizli-hirsiz-alarm-lamp__glow" aria-hidden="true" />
    </div>
  );
}

function Vault({
  hasPressed,
  isAccepted,
  outcome
}: {
  readonly hasPressed: boolean;
  readonly isAccepted: boolean;
  readonly outcome: "armed" | ResultOutcome;
}): JSX.Element {
  return (
    <div className={`gizli-hirsiz-vault gizli-hirsiz-vault--${outcome}`}>
      <div className="gizli-hirsiz-vault__halo" aria-hidden="true" />
      <div className="gizli-hirsiz-vault__crown" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="gizli-hirsiz-vault__door">
        <span className="gizli-hirsiz-vault__edge gizli-hirsiz-vault__edge--top" aria-hidden="true" />
        <span className="gizli-hirsiz-vault__edge gizli-hirsiz-vault__edge--bottom" aria-hidden="true" />
        <span className="gizli-hirsiz-vault__edge gizli-hirsiz-vault__edge--left" aria-hidden="true" />
        <span className="gizli-hirsiz-vault__edge gizli-hirsiz-vault__edge--right" aria-hidden="true" />
        <div className="gizli-hirsiz-vault__ring" aria-hidden="true">
          <span className="gizli-hirsiz-vault__ring-inner" />
          <span className="gizli-hirsiz-vault__ring-core">GLIX</span>
        </div>
        <div className="gizli-hirsiz-fingerprint-slot" aria-label="Kendi ekranındaki parmak izi durumu">
          <FingerprintMark visible={hasPressed || isAccepted} />
          <span className="gizli-hirsiz-fingerprint-slot__label">ANONİM İZ</span>
        </div>
        <span className="gizli-hirsiz-vault__screw screw-one" aria-hidden="true" />
        <span className="gizli-hirsiz-vault__screw screw-two" aria-hidden="true" />
        <span className="gizli-hirsiz-vault__screw screw-three" aria-hidden="true" />
        <span className="gizli-hirsiz-vault__screw screw-four" aria-hidden="true" />
      </div>
      <div className="gizli-hirsiz-vault__base" aria-hidden="true"><span /><span /><span /></div>
      <div className="gizli-hirsiz-vault__caption">
        <span>GÜVENLİK ÇEKİRDEĞİ</span>
        <strong>{outcome === "armed" ? "KİLİTLİ" : outcome === "zero" ? "SESSİZ" : outcome === "one" ? "AÇILDI" : "ALARM"}</strong>
      </div>
    </div>
  );
}

function ResultPanel({
  publicState,
  players,
  selfPlayerId,
  nickname
}: {
  readonly publicState: GizliHirsizPublicState;
  readonly players: readonly PlayerLabel[];
  readonly selfPlayerId: string | null;
  readonly nickname: string | undefined;
}): JSX.Element {
  // These fields are intentionally read only inside the result boundary. The
  // adapter redacts them with null during play.
  const count = publicState.finished
    ? publicState.pressCount ?? publicState.pressedPlayerIds?.length ?? 0
    : 0;
  const outcome = outcomeForCount(count);
  const copy = outcomeCopy(outcome);
  const pressedIds = publicState.finished ? publicState.pressedPlayerIds ?? [] : [];
  const names = pressedIds.map((playerId) => playerNickname(playerId, players, selfPlayerId, nickname));
  const ownPoints = resultPointsForPlayer(publicState, selfPlayerId);

  return (
    <section className={`gizli-hirsiz-result gizli-hirsiz-result--${outcome}`} aria-labelledby="gizli-hirsiz-result-title">
      <div className="gizli-hirsiz-result__heading">
        <span className="gizli-hirsiz-result__kicker">{copy.kicker}</span>
        <h3 id="gizli-hirsiz-result-title">{copy.title}</h3>
        <p>{copy.description}</p>
      </div>

      <div className="gizli-hirsiz-result__evidence" aria-label={count === 0 ? "Turda hamle yok" : "Sonuçta açılan anonim izler"}>
        {count === 0 ? (
          <span className="gizli-hirsiz-result__empty">İZ KAYDI YOK</span>
        ) : (
          <div className="gizli-hirsiz-result__names">
            {names.length > 0 ? names.map((name, index) => <span key={`${name}-${index}`}>{name}</span>) : <span>Anonim iz sahibi</span>}
          </div>
        )}
        <span className="gizli-hirsiz-result__count">{count} SONUÇ</span>
      </div>

      <div className="gizli-hirsiz-result__points" aria-label={ownPoints === null ? "Kendi tur puanın bekleniyor" : `Kendi tur puanın ${formatPoints(ownPoints)}`}>
        <span>SENİN TUR PUANIN</span>
        <strong>{ownPoints === null ? "—" : formatPoints(ownPoints)}</strong>
      </div>
    </section>
  );
}

export function GizliHirsizStage({
  publicState,
  ownState,
  phase,
  isSpectator = false,
  selfPlayerId = null,
  players = [],
  nickname,
  now = Date.now(),
  actionState = null,
  isReady = false,
  onReady,
  onSubmitAction,
  onSubmit
}: GizliHirsizStageProps): JSX.Element {
  const [localPending, setLocalPending] = useState(false);
  const hasSubmittedRef = useRef(false);
  const feedbackId = useId();
  const resolvedPhase = phaseFromState(phase, publicState);
  const isResultPhase = publicState.finished;
  const isPlaying = resolvedPhase === "playing" && !isResultPhase;
  const hasPressed = Boolean(ownState?.hasPressed);
  const isAccepted = actionState?.status === "accepted";
  const isRejected = actionState?.status === "rejected";
  const isPending = localPending || actionState?.status === "pending";
  const spectator = isSpectator || !ownState;
  const rejectionCanRetry = isRejected && isRetryableRejection(actionState?.reason);
  const submitAction = onSubmitAction ?? onSubmit;
  const canPress = Boolean(
    submitAction &&
      isPlaying &&
      !spectator &&
      !hasPressed &&
      !isPending &&
      !isAccepted &&
      (!isRejected || rejectionCanRetry)
  );
  const timer = remainingSeconds(publicState.endsAt, now);
  const resultCount = isResultPhase
    ? publicState.pressCount ?? publicState.pressedPlayerIds?.length ?? 0
    : null;
  const resultOutcome: "armed" | ResultOutcome = isResultPhase ? outcomeForCount(resultCount ?? 0) : "armed";
  const resolvedSelfPlayerId = useMemo(
    () => selfPlayerId ?? (nickname ? players.find((player) => player.nickname === nickname)?.id ?? null : null),
    [nickname, players, selfPlayerId]
  );

  useEffect(() => {
    if (
      !actionState ||
      hasPressed ||
      isResultPhase ||
      resolvedPhase !== "playing" ||
      actionState?.status === "accepted" ||
      actionState?.status === "rejected" ||
      actionState?.status === "editable"
    ) {
      hasSubmittedRef.current = false;
      setLocalPending(false);
    }
  }, [actionState?.status, hasPressed, isResultPhase, resolvedPhase]);

  useEffect(() => {
    if (resolvedPhase === "preparing" || resolvedPhase === "tutorial") {
      setLocalPending(false);
    }
  }, [resolvedPhase]);

  const handlePress = useCallback((): void => {
    if (!canPress || !submitAction || hasSubmittedRef.current) {
      return;
    }

    // A click is deliberately the only input handler. Native button keyboard
    // activation is guarded below so Enter/Space cannot double-submit.
    hasSubmittedRef.current = true;
    setLocalPending(true);
    submitAction({ kind: "steal" });
  }, [canPress, submitAction]);

  const handlePressKeyDown = useCallback((event: KeyboardEvent<HTMLButtonElement>): void => {
    if ((event.key !== "Enter" && event.key !== " ") || event.repeat) {
      return;
    }

    // Prevent the browser's follow-up click; handlePress owns this activation.
    event.preventDefault();
    handlePress();
  }, [handlePress]);

  const feedback = useMemo(() => {
    if (isResultPhase) {
      return "Tur sonucu açıldı. Kasa kayıtları artık herkes için görünür.";
    }

    if (spectator) {
      return "İzleyici modu: anonim kasa izi yalnızca katılımcı ekranında bırakılır.";
    }

    if (isPending) {
      return "Gönderiliyor… Diğer oyuncular bu hareketi göremez.";
    }

    if (hasPressed || isAccepted) {
      return "İzin kilitlendi. Sonuç bitişte açılacak.";
    }

    if (isRejected) {
      const reason = actionState?.reason;
      const label = reason ? ACK_REASON_LABELS[reason] ?? "Tekrar dene." : "Tekrar dene.";
      return rejectionCanRetry ? `${label} Sahne hâlâ açıksa yeniden deneyebilirsin.` : label;
    }

    if (resolvedPhase === "preparing") {
      return "Hazır olduğunda oyuna geç; doğru anı yalnızca kendi ekranında seç.";
    }

    if (resolvedPhase === "tutorial") {
      return "Tek gizli ÇAL hamlesi yap. Basışlar sonuç ekranına kadar saklı kalır.";
    }

    return "Diğer oyuncuların izlerini göremezsin. İçinden geldiğinde yalnızca bir kez bas.";
  }, [actionState?.reason, hasPressed, isAccepted, isPending, isRejected, isResultPhase, rejectionCanRetry, resolvedPhase, spectator]);

  const buttonLabel = spectator
    ? "İZLEME MODU"
    : isPending
      ? "İZ GÖNDERİLİYOR"
      : hasPressed || isAccepted
        ? "İZ KİLİTLENDİ"
        : isRejected && rejectionCanRetry
          ? "YENİDEN DENE"
          : "ÇAL";

  const buttonHint = isPending
    ? "KAYDIN BEKLENİYOR"
    : hasPressed || isAccepted
      ? "SONUÇ EKRANINI BEKLE"
      : isRejected && !rejectionCanRetry
        ? "BU TURDA TEKRAR YOK"
        : "TEK GİZLİ BASIŞ";
  return (
    <section
      className={`gizli-hirsiz-stage gizli-hirsiz-stage--${resolvedPhase} gizli-hirsiz-stage--${resultOutcome} ${spectator ? "is-spectator" : ""}`}
      aria-label="Gizli Hırsız neon kasa sahnesi"
    >
      <div className="gizli-hirsiz-stage__scanlines" aria-hidden="true" />
      <div className="gizli-hirsiz-stage__header">
        <div>
          <span className="gizli-hirsiz-stage__eyebrow">GLIX / GİZLİ KASA</span>
          <h2>GİZLİ HIRSIZ</h2>
          <p>Tek anonim iz. Kasa sessiz. Alarm herkes için kapalı.</p>
        </div>
        <div className="gizli-hirsiz-stage__timer" aria-label={timer === null ? "Süre görünmüyor" : `${timer} saniye kaldı`}>
          <span>{isResultPhase ? "SONUÇ" : "KASA PENCERESİ"}</span>
          <strong>
            {isResultPhase ? "AÇIK" : timer === null ? "—" : <>{timer}<small>SN</small></>}
          </strong>
        </div>
      </div>

      <div className="gizli-hirsiz-stage__apparatus">
        <AlarmLamp outcome={resultOutcome} />
        <Vault
          hasPressed={hasPressed}
          isAccepted={isAccepted}
          outcome={resultOutcome}
        />
        <div className="gizli-hirsiz-stage__floor" aria-hidden="true"><span /><span /><span /><span /></div>
      </div>

      {resolvedPhase === "preparing" && !spectator && onReady && (
        <div className="gizli-hirsiz-ready" aria-label="Gizli Hırsız hazırlık onayı">
          <button className="gizli-hirsiz-ready__button" type="button" disabled={isReady} onClick={onReady}>
            <span aria-hidden="true">{isReady ? "✓" : "→"}</span>
            <strong>{isReady ? "HAZIRSIN" : "HAZIRIM"}</strong>
            <small>{isReady ? "DİĞERLERİ BEKLENİYOR" : "KASAYI AÇ"}</small>
          </button>
        </div>
      )}

      {isPlaying && !spectator && (
        <div className="gizli-hirsiz-action-panel" aria-label="Gizli Hırsız hamle alanı">
          <div className="gizli-hirsiz-action-panel__private-note">
            <span className="gizli-hirsiz-action-panel__private-dot" aria-hidden="true" />
            <span>ÖZEL EKRAN / SADECE SENİN İZİN</span>
          </div>
          <button
            className="gizli-hirsiz-press-button"
            type="button"
            disabled={!canPress}
            aria-describedby={feedbackId}
            aria-label="Gizli Hırsız hamlesini yap"
            onClick={handlePress}
            onKeyDown={handlePressKeyDown}
          >
            <span className="gizli-hirsiz-press-button__halo" aria-hidden="true" />
            <span className="gizli-hirsiz-press-button__icon" aria-hidden="true">✦</span>
            <strong>{buttonLabel}</strong>
            <small>{buttonHint}</small>
          </button>
        </div>
      )}

      {spectator && !isResultPhase && (
        <div className="gizli-hirsiz-spectator-note" role="note">
          <span aria-hidden="true">◌</span>
          <div><strong>İZLEME MODU</strong><small>Diğer oyuncuların basışları sonuç ekranına kadar sana gösterilmez.</small></div>
        </div>
      )}

      <p id={feedbackId} className="gizli-hirsiz-feedback" role="status" aria-live="polite" aria-atomic="true">
        <span aria-hidden="true" />
        {feedback}
      </p>

      {isResultPhase && (
        <ResultPanel
          publicState={publicState}
          players={players}
          selfPlayerId={resolvedSelfPlayerId}
          nickname={nickname}
        />
      )}

      <p className="gizli-hirsiz-rule-note">
        {isResultPhase
          ? "Tek kalan iz +1. Birden fazla izde basanların her biri −1. Basış yapmayanlar 0 alır."
          : "Tek basış hakkın var. Basışın ve başkalarının basışları tur bitene kadar gizli kalır."}
      </p>
    </section>
  );
}
