import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { CSSProperties, JSX, KeyboardEvent as ReactKeyboardEvent } from "react";
import type {
  JsonValue,
  MatchPlayerState,
  SonKisiOwnState,
  SonKisiPublicState,
  SonKisiResultView
} from "@glix/shared";
import "./SonKisiStage.css";

export type SonKisiStagePhase =
  | "tutorial"
  | "preparing"
  | "playing"
  | "results"
  | "transition"
  | "finished";

export type SonKisiActionStatus = "editable" | "pending" | "accepted" | "rejected";

/** The small part of the shared action state that this visual needs. */
export interface SonKisiActionState {
  readonly status: SonKisiActionStatus;
  readonly reason?: string;
  readonly retryable?: boolean;
}

/** Full match rows and minimal reconnect rows are both valid stage inputs. */
export type SonKisiPlayer = Pick<MatchPlayerState, "id" | "nickname"> & Partial<Pick<MatchPlayerState, "currentGameParticipant" | "eliminated">>;

export interface SonKisiStageProps {
  readonly publicState: SonKisiPublicState;
  readonly ownState: SonKisiOwnState | null | undefined;
  readonly phase?: SonKisiStagePhase;
  readonly isSpectator?: boolean;
  readonly selfPlayerId?: string | null;
  readonly players?: readonly SonKisiPlayer[];
  /** Optional reconnect fallback when the roster has not arrived yet. */
  readonly nickname?: string;
  readonly actionState?: SonKisiActionState | null;
  readonly onSubmitAction?: (payload: JsonValue) => void;
  /** Compatibility with the existing Stage 9 game-control surface. */
  readonly onSubmit?: (payload: JsonValue) => void;
  /** Compatibility hook for a host that exposes the escape action directly. */
  readonly onEscape?: () => void;
  /** Accepted for host compatibility; the stage deliberately does not use it. */
  readonly now?: number;
}

type LocalSeal = "open" | "pending" | "accepted" | "rejected" | "locked";

const RETRYABLE_ACK_REASONS = new Set(["offline", "input_phase_locked", "network", "transport", "timeout"]);
const NON_RETRYABLE_ACK_REASONS = new Set([
  "input_late",
  "input_duplicate",
  "input_disabled",
  "input_empty_not_allowed",
  "spectator",
  "invalid_game_input",
  "late",
  "duplicate",
  "phase-locked",
  "invalid"
]);

function isFiniteMilliseconds(value: number | null): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function scoreText(points: number): string {
  return points > 0 ? `+${points}` : String(points);
}

function formatMilliseconds(milliseconds: number | null): string {
  if (!isFiniteMilliseconds(milliseconds)) return "—";
  return `${(milliseconds / 1_000).toFixed(3).replace(".", ",")} sn`;
}

function formatDuration(milliseconds: number | null): string {
  if (!isFiniteMilliseconds(milliseconds)) return "—";
  return `${(milliseconds / 1_000).toFixed(3).replace(".", ",")} sn`;
}

function playerName(players: readonly SonKisiPlayer[], playerId: string | null, fallback?: string): string {
  const nickname = players.find((player) => player.id === playerId)?.nickname.trim();
  return nickname || fallback?.trim() || "Oyuncu";
}

function resultPlayerName(
  players: readonly SonKisiPlayer[],
  playerId: string,
  selfPlayerId: string | null,
  ownNickname?: string
): string {
  return playerName(players, playerId, playerId === selfPlayerId ? ownNickname : undefined);
}

function inferSpectator(
  explicitValue: boolean | undefined,
  selfPlayerId: string | null,
  players: readonly SonKisiPlayer[],
  ownState: SonKisiOwnState | null | undefined
): boolean {
  if (explicitValue !== undefined) return explicitValue;
  if (!selfPlayerId || !ownState) return true;

  const self = players.find((player) => player.id === selfPlayerId);
  if (!self && players.length > 0) return true;
  return Boolean(self && (self.currentGameParticipant === false || self.eliminated === true));
}

function isBeforePlay(phase: SonKisiStagePhase | undefined, started: boolean): boolean {
  return !started || phase === "tutorial" || phase === "preparing";
}

function isPlayingPhase(phase: SonKisiStagePhase | undefined): boolean {
  return phase === undefined || phase === "playing";
}

function canRetryRejectedAction(
  actionState: SonKisiActionState,
  legalNow: boolean
): boolean {
  if (!legalNow) return false;
  if (actionState.retryable === true) return true;
  if (!actionState.reason) return true;
  if (NON_RETRYABLE_ACK_REASONS.has(actionState.reason)) return false;
  return RETRYABLE_ACK_REASONS.has(actionState.reason);
}

function authoritativeLastEscapeMilliseconds(results: readonly SonKisiResultView[]): number | null {
  const lastEscape = results.find((result) => result.escaped && result.points > 0);
  return lastEscape && isFiniteMilliseconds(lastEscape.elapsedMs) ? lastEscape.elapsedMs : null;
}

function markerPosition(elapsedMs: number | null, durationMs: number | null): number | null {
  if (!isFiniteMilliseconds(elapsedMs)) return null;

  const span = isFiniteMilliseconds(durationMs) && durationMs > 0
    ? durationMs
    : Math.max(elapsedMs, 1);
  return Math.max(2, Math.min(98, (elapsedMs / span) * 100));
}

function markerStyle(position: number | null): CSSProperties | undefined {
  return position === null
    ? undefined
    : ({ "--son-kisi-marker-position": `${position}%` } as CSSProperties);
}

function sealCopy(
  seal: LocalSeal,
  legalNow: boolean,
  rejectionReason?: string
): { readonly title: string; readonly detail: string } {
  switch (seal) {
    case "pending":
      return { title: "GÖNDERİLİYOR…", detail: "Çıkış kolu kaydın tamamlanmasını bekliyor." };
    case "accepted":
      return { title: "HAMLE KAYDEDİLDİ", detail: "Bu turda tekrar basamazsın." };
    case "rejected":
      return legalNow
        ? { title: "TEKRAR DENE", detail: "Hamle ulaşmadı; çıkış hâlâ açık." }
        : rejectionReason === "input_late" || rejectionReason === "late"
          ? { title: "KAÇIŞ GEÇ KALDI", detail: "Oda kapandı; bu hamle yeniden gönderilemez." }
        : { title: "ÇIKIŞ KAPALI", detail: "Bu hamle yeniden gönderilemez." };
    case "locked":
      return rejectionReason === "input_late" || rejectionReason === "late"
        ? { title: "ÇIKIŞ GEÇ KALDI", detail: "Oda kapandı; yeni hamle kabul edilmiyor." }
        : { title: "ÇIKIŞ KAPALI", detail: "Bu turda yeni hamle kabul edilmiyor." };
    case "open":
      return { title: "KOL HAZIR", detail: "Tek hakkını doğru anda kullan." };
  }
}

function ResultScoreRail({
  publicState,
  players,
  selfPlayerId,
  ownNickname
}: {
  readonly publicState: SonKisiPublicState;
  readonly players: readonly SonKisiPlayer[];
  readonly selfPlayerId: string | null;
  readonly ownNickname: string | undefined;
}): JSX.Element | null {
  const points = publicState.resultPoints ?? [];
  if (points.length === 0) return null;

  return (
    <div className="son-kisi-score-rail" aria-label="Tur puanları">
      {points.map((entry) => (
        <span className="son-kisi-score-chip" key={entry.playerId}>
          <strong>{resultPlayerName(players, entry.playerId, selfPlayerId, ownNickname)}</strong>
          <b className={entry.points < 0 ? "is-negative" : entry.points > 0 ? "is-positive" : ""}>
            {scoreText(entry.points)}
          </b>
        </span>
      ))}
    </div>
  );
}

function ResultTimeline({
  results,
  players,
  durationMs,
  latestEscapeMs,
  tie,
  selfPlayerId,
  ownNickname
}: {
  readonly results: readonly SonKisiResultView[];
  readonly players: readonly SonKisiPlayer[];
  readonly durationMs: number | null;
  readonly latestEscapeMs: number | null;
  readonly tie: boolean;
  readonly selfPlayerId: string | null;
  readonly ownNickname: string | undefined;
}): JSX.Element {
  return (
    <section className="son-kisi-timeline-panel" aria-labelledby="son-kisi-timeline-title">
      <div className="son-kisi-section-heading">
        <div>
          <span className="son-kisi-section-kicker">KAYITLI KAÇIŞLAR</span>
          <h3 id="son-kisi-timeline-title">Sonuç zaman çizelgesi</h3>
        </div>
        <span className="son-kisi-duration-chip">TUR / {formatDuration(durationMs)}</span>
      </div>

      <div className="son-kisi-timeline-ruler" aria-hidden="true">
        <span>0,000 sn</span>
        {latestEscapeMs !== null && (
          <span
            className="son-kisi-last-marker"
            style={markerStyle(markerPosition(latestEscapeMs, durationMs))}
          >
            <i />
            <b>{tie ? "AYNI ANDA" : "SON KAÇIŞ"}</b>
          </span>
        )}
        <span>{formatDuration(durationMs)}</span>
      </div>

      <ol className="son-kisi-timeline-list">
        {results.map((result) => {
          const resultMilliseconds = isFiniteMilliseconds(result.elapsedMs) ? result.elapsedMs : null;
          const isLastEscape = result.escaped && result.points > 0;
          const position = markerPosition(resultMilliseconds, durationMs);
          const name = resultPlayerName(players, result.playerId, selfPlayerId, ownNickname);

          return (
            <li
              className={`son-kisi-timeline-row ${isLastEscape ? "is-last" : ""} ${!result.escaped ? "is-no-escape" : ""}`}
              key={result.playerId}
            >
              <div className="son-kisi-timeline-track" aria-hidden="true">
                <span className="son-kisi-timeline-line" />
                <span className="son-kisi-timeline-dot" style={markerStyle(position)} />
              </div>
              <div className="son-kisi-timeline-copy">
                <strong>{name}</strong>
                <span>
                  {!result.escaped
                    ? "KAÇMADI"
                    : resultMilliseconds === null
                      ? "KAÇTI"
                      : formatMilliseconds(resultMilliseconds)}
                </span>
              </div>
              <div className="son-kisi-timeline-outcome">
                {isLastEscape && <small>{tie ? "AYNI MİLİSANİYE / SON KAÇIŞ" : "SON KAÇIŞ"}</small>}
                {!result.escaped && <small>−1 / KAÇIŞ YOK</small>}
                {result.escaped && !isLastEscape && <small>ERKEN KAÇIŞ</small>}
                <b className={result.points < 0 ? "is-negative" : result.points > 0 ? "is-positive" : ""}>
                  {scoreText(result.points)}
                </b>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function ResultPanel({
  publicState,
  players,
  selfPlayerId,
  isSpectator,
  nickname
}: {
  readonly publicState: SonKisiPublicState;
  readonly players: readonly SonKisiPlayer[];
  readonly selfPlayerId: string | null;
  readonly isSpectator: boolean;
  readonly nickname: string | undefined;
}): JSX.Element {
  const results = publicState.results ?? [];
  const lastEscapeEntries = results.filter((result) => result.escaped && result.points > 0);
  const latestEscapeMs = authoritativeLastEscapeMilliseconds(results);
  const tie = lastEscapeEntries.length > 1;
  const ownResult = !isSpectator && selfPlayerId !== null
    ? results.find((result) => result.playerId === selfPlayerId) ?? null
    : null;
  const lastEscapeNames = lastEscapeEntries.map((result) => resultPlayerName(players, result.playerId, selfPlayerId, nickname));
  const lastEscapeLabel = tie
    ? `${lastEscapeNames.join(" ve ")} aynı milisaniyede son kaçışı paylaştı.`
    : lastEscapeNames[0]
      ? `${lastEscapeNames[0]} son kaçış işaretini aldı.`
      : "Bu turda kayıtlı kaçış yok.";

  return (
    <div className="son-kisi-result-view">
      <div className="son-kisi-result-hero">
        <div>
          <span className="son-kisi-section-kicker">GİZLİ ODA AÇILDI</span>
          <h3>Tur sonucu</h3>
          <p>Tur kaydındaki süre ve kaçış kayıtları açıldı.</p>
        </div>
        <div className="son-kisi-result-duration">
          <span>TUR SÜRESİ</span>
          <strong>{formatDuration(publicState.durationMs)}</strong>
        </div>
      </div>

      <div className={`son-kisi-last-callout ${tie ? "is-tie" : ""}`} role="status" aria-live="polite">
        <span className="son-kisi-last-callout-mark" aria-hidden="true">✦</span>
        <div>
          <strong>{tie ? "AYNI MİLİSANİYE BERABERLİĞİ" : latestEscapeMs === null ? "KAÇIŞ YOK" : "SON KAÇIŞ İŞARETİ"}</strong>
          <span>{lastEscapeLabel}</span>
        </div>
      </div>

      <ResultTimeline
        results={results}
        players={players}
        durationMs={publicState.durationMs}
        latestEscapeMs={latestEscapeMs}
        tie={tie}
        selfPlayerId={selfPlayerId}
        ownNickname={nickname}
      />

      <div className="son-kisi-result-explanation">
        <span className="son-kisi-section-kicker">PUANLAMA ANAHTARI</span>
        <p>
          Son kaçış işaretini paylaşan kaçışlar <b>+1</b>, erken kaçışlar <b>0</b> alır.
          Kaçmayan her oyuncu <b>−1</b> alır; kaçış yapmama sonucu çizelgede açıkça gösterilir.
        </p>
      </div>

      {ownResult && (
        <div className="son-kisi-own-result" aria-label={`${playerName(players, selfPlayerId, nickname)} tur puanı`}>
          <div>
            <span className="son-kisi-section-kicker">SENİN TUR PUANIN</span>
            <strong>{playerName(players, selfPlayerId, nickname)}</strong>
          </div>
          <b className={ownResult.points < 0 ? "is-negative" : ownResult.points > 0 ? "is-positive" : ""}>
            {scoreText(ownResult.points)}
          </b>
        </div>
      )}

      <ResultScoreRail
        publicState={publicState}
        players={players}
        selfPlayerId={selfPlayerId}
        ownNickname={nickname}
      />
    </div>
  );
}

export function SonKisiStage({
  publicState,
  ownState,
  phase,
  isSpectator: explicitSpectator,
  selfPlayerId,
  players = [],
  nickname,
  actionState,
  onSubmitAction,
  onSubmit,
  onEscape
}: SonKisiStageProps): JSX.Element {
  const nicknameKey = nickname?.trim();
  const resolvedSelfPlayerId = selfPlayerId ?? (nicknameKey
    ? players.find((player) => player.nickname.trim() === nicknameKey)?.id ?? null
    : null);
  const isSpectator = inferSpectator(explicitSpectator, resolvedSelfPlayerId, players, ownState);
  const beforePlay = isBeforePlay(phase, publicState.started);
  const playingPhase = isPlayingPhase(phase);
  const showResult = publicState.finished;
  const legalNow = Boolean(
    !isSpectator &&
      !beforePlay &&
      playingPhase &&
      ownState &&
      publicState.started &&
      !publicState.finished &&
      ownState.canEscape &&
      !ownState.hasEscaped
  );

  const [localSeal, setLocalSeal] = useState<LocalSeal>("open");
  const [localRejectionReason, setLocalRejectionReason] = useState<string | undefined>();
  const localSealRef = useRef<LocalSeal>("open");
  const submitLockRef = useRef(false);
  const keyboardActivationRef = useRef(false);
  const latchHelpId = useId();
  const sealStatusId = useId();
  const submitAction = onSubmitAction ?? onSubmit;

  const setSeal = useCallback((nextSeal: LocalSeal): void => {
    localSealRef.current = nextSeal;
    setLocalSeal(nextSeal);
  }, []);

  useEffect(() => {
    if (!beforePlay) return;
    submitLockRef.current = false;
    keyboardActivationRef.current = false;
    setLocalRejectionReason(undefined);
    setSeal("open");
  }, [beforePlay, setSeal]);

  useEffect(() => {
    if (beforePlay) return;

    if (!ownState) {
      submitLockRef.current = true;
      setLocalRejectionReason(undefined);
      setSeal("locked");
      return;
    }

    if (ownState.hasEscaped) {
      submitLockRef.current = true;
      setLocalRejectionReason(undefined);
      setSeal("accepted");
      return;
    }

    if (isSpectator || publicState.finished || !playingPhase || !ownState.canEscape) {
      submitLockRef.current = true;
      if (actionState?.status === "rejected") {
        setLocalRejectionReason(actionState.reason);
      } else {
        setLocalRejectionReason(undefined);
      }
      setSeal("locked");
      return;
    }

    if (!actionState) return;

    if (actionState.status === "pending") {
      submitLockRef.current = true;
      setLocalRejectionReason(undefined);
      setSeal("pending");
      return;
    }

    if (actionState.status === "accepted") {
      submitLockRef.current = true;
      setLocalRejectionReason(undefined);
      setSeal("accepted");
      return;
    }

    if (actionState.status === "rejected") {
      const mayRetry = canRetryRejectedAction(actionState, legalNow);
      submitLockRef.current = !mayRetry;
      setLocalRejectionReason(actionState.reason);
      setSeal(mayRetry ? "rejected" : "locked");
      return;
    }

    submitLockRef.current = false;
    setLocalRejectionReason(undefined);
    if (localSealRef.current === "pending" || localSealRef.current === "locked") {
      setSeal("open");
    }
  }, [actionState, beforePlay, isSpectator, legalNow, ownState, playingPhase, publicState.finished, setSeal]);

  const handleEscape = useCallback((): void => {
    if (!legalNow || submitLockRef.current) return;
    if (localSealRef.current === "pending" || localSealRef.current === "accepted" || localSealRef.current === "locked") return;

    if (!submitAction && !onEscape) return;

    submitLockRef.current = true;
    setSeal("pending");

    if (submitAction) {
      submitAction({ kind: "escape" });
    } else {
      onEscape?.();
    }
  }, [legalNow, onEscape, setSeal, submitAction]);

  const handleLatchClick = useCallback((): void => {
    if (keyboardActivationRef.current) {
      keyboardActivationRef.current = false;
      return;
    }
    handleEscape();
  }, [handleEscape]);

  const handleLatchKeyDown = useCallback((event: ReactKeyboardEvent<HTMLButtonElement>): void => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    if (event.repeat) return;
    keyboardActivationRef.current = true;
    handleEscape();
  }, [handleEscape]);

  const handleLatchKeyUp = useCallback((event: ReactKeyboardEvent<HTMLButtonElement>): void => {
    if (event.key === "Enter" || event.key === " ") {
      keyboardActivationRef.current = false;
    }
  }, []);

  const handleLatchBlur = useCallback((): void => {
    keyboardActivationRef.current = false;
  }, []);

  const seal = sealCopy(localSeal, legalNow, localRejectionReason);
  const latchIsDisabled = !legalNow || localSeal === "pending" || localSeal === "accepted" || localSeal === "locked";
  const latchLabel = localSeal === "rejected" && legalNow
    ? "TEKRAR DENE"
    : localSeal === "pending"
      ? "MÜHÜR BEKLENİYOR"
        : localSeal === "accepted"
          ? "KAÇIŞ MÜHÜRLENDİ"
          : "ÇIKIŞ KOLUNU ÇEK";
  const stageClassName = [
    "son-kisi-stage",
    isSpectator ? "is-spectator" : "",
    showResult ? "is-result" : ""
  ].filter(Boolean).join(" ");

  return (
    <section
      className={stageClassName}
      aria-label="Son Kişi neon oyun sahnesi"
      aria-live="polite"
    >
      <div className="son-kisi-room" aria-hidden="true">
        <span className="son-kisi-room-ceiling" />
        <span className="son-kisi-room-wall" />
        <span className="son-kisi-room-floor" />
        <span className="son-kisi-door-frame" />
        <span className="son-kisi-door-panel" />
        <span className="son-kisi-door-seam" />
        <span className="son-kisi-door-light" />
        <span className="son-kisi-clock-shadow" />
      </div>

      <div className="son-kisi-stage-content">
        <header className="son-kisi-stage-header">
          <div>
            <span className="son-kisi-eyebrow">GLIX / GİZLİ ÇIKIŞ</span>
            <h2>{showResult ? "Oda açıldı" : isSpectator ? "İzleme modu" : "Doğru anı bekle"}</h2>
          </div>
          <div className="son-kisi-public-signal" aria-label={`${publicState.escapeCount} kaçış sinyali`}>
            <span>KAÇIŞ SİNYALİ</span>
            <strong>{publicState.escapeCount}</strong>
          </div>
        </header>

        {!showResult && isSpectator && (
          <div className="son-kisi-neutral-panel" role="status">
            <div className="son-kisi-neutral-latch" aria-hidden="true"><span /></div>
            <span className="son-kisi-section-kicker">SAHNE NÖTR</span>
            <h3>Bu turu izliyorsun</h3>
            <p>Çıkış kolu yalnızca aktif oyuncular için kullanılabilir. Sonuç tüm kayıtlar açıldığında görünür.</p>
          </div>
        )}

        {!showResult && !isSpectator && beforePlay && (
          <div className="son-kisi-neutral-panel" role="status">
            <div className="son-kisi-neutral-latch" aria-hidden="true"><span /></div>
            <span className="son-kisi-section-kicker">KAPI KİLİTLİ</span>
            <h3>Sahne hazırlanıyor</h3>
            <p>Oyun başladığında tek çıkış hakkın için bu kolu kullanacaksın.</p>
          </div>
        )}

        {!showResult && !isSpectator && !beforePlay && !playingPhase && (
          <div className="son-kisi-neutral-panel" role="status">
            <div className="son-kisi-neutral-latch" aria-hidden="true"><span /></div>
            <span className="son-kisi-section-kicker">SİNYAL BEKLENİYOR</span>
            <h3>Oda senkronize ediliyor</h3>
            <p>Çıkış kolu, oynama sinyali geldiğinde açılacak.</p>
          </div>
        )}

        {!showResult && !isSpectator && !beforePlay && playingPhase && (
          <div className="son-kisi-play-view">
            <div className="son-kisi-latch-bay">
              <span className="son-kisi-latch-caption">TEK ÇIKIŞ / TEK HAK</span>
              <button
                className="son-kisi-latch"
                type="button"
                disabled={latchIsDisabled}
                aria-describedby={`${latchHelpId} ${sealStatusId}`}
                aria-label="Çıkış kolunu çek"
                onClick={handleLatchClick}
                onKeyDown={handleLatchKeyDown}
                onKeyUp={handleLatchKeyUp}
                onBlur={handleLatchBlur}
              >
                <span className="son-kisi-latch-halo" aria-hidden="true" />
                <span className="son-kisi-latch-handle" aria-hidden="true"><i /></span>
                <span className="son-kisi-latch-label">
                  <strong>{latchLabel}</strong>
                  <small>{localSeal === "rejected" && legalNow ? "YENİDEN DENEYEBİLİRSİN" : "ZAMANI SEN SEÇ"}</small>
                </span>
              </button>
            </div>

            <div className="son-kisi-play-copy">
              <div className="son-kisi-rule-card">
                <span className="son-kisi-rule-icon" aria-hidden="true">◌</span>
                <div>
                  <strong>Gizli eşik</strong>
                  <p>Bitiş anı görünmez. İstediğin anda bir kez kaç; son kaçışı paylaşanlar kazanır.</p>
                </div>
              </div>
              <div className="son-kisi-seal" id={sealStatusId} role="status" aria-live="polite">
                <span className="son-kisi-seal-dot" aria-hidden="true" />
                <div><strong>{seal.title}</strong><small>{seal.detail}</small></div>
              </div>
              <p className="son-kisi-help" id={latchHelpId}>Kaçış kayıtları ve süre bilgisi sonuç ekranına kadar gizli kalır.</p>
            </div>
          </div>
        )}

        {showResult && (
          <ResultPanel
            publicState={publicState}
            players={players}
            selfPlayerId={resolvedSelfPlayerId}
            isSpectator={isSpectator}
            nickname={nickname}
          />
        )}
      </div>
    </section>
  );
}
