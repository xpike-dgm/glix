import { useCallback, useEffect, useMemo, useState } from "react";
import type { JSX, KeyboardEvent } from "react";
import type { JsonValue, MatchPlayerState, MemoryColor, MemoryOwnState, MemoryPublicState } from "@glix/shared";
import { BlobAvatar, Stage11BIcon, Stage11BReferenceHeader } from "./Stage11BPrimitives";

export interface MemoryStageProps {
  readonly publicState: unknown;
  readonly ownState: unknown | null;
  readonly players: readonly MatchPlayerState[];
  readonly selfPlayerId: string | null;
  readonly now: number;
  readonly isSpectator: boolean;
  readonly onSubmit: (payload: JsonValue) => void;
}

const MEMORY_COLORS: readonly MemoryColor[] = ["cyan", "magenta", "amber", "lime"];
const COLOR_META: Readonly<Record<MemoryColor, { readonly label: string; readonly tone: string }>> = {
  cyan: { label: "MAVİ", tone: "is-cyan" },
  magenta: { label: "PEMBE", tone: "is-pink" },
  amber: { label: "YEŞİL", tone: "is-green" },
  lime: { label: "MOR", tone: "is-violet" }
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isMemoryColor(value: unknown): value is MemoryColor {
  return typeof value === "string" && MEMORY_COLORS.includes(value as MemoryColor);
}

function isMemoryPublicState(value: unknown): value is MemoryPublicState {
  return isRecord(value)
    && value.gameId === "zaman-bombasi-hafizasi"
    && value.kind === "zaman-bombasi-hafizasi"
    && typeof value.started === "boolean"
    && (value.subPhase === "display" || value.subPhase === "input" || value.subPhase === "results")
    && Array.isArray(value.sequence)
    && value.sequence.every(isMemoryColor)
    && typeof value.sequenceIndex === "number"
    && typeof value.sequenceLength === "number"
    && Array.isArray(value.resultSequence)
    && value.resultSequence.every(isMemoryColor)
    && (value.activePlayerId === null || typeof value.activePlayerId === "string")
    && (value.inputDeadline === null || typeof value.inputDeadline === "number")
    && (value.displayUntil === null || typeof value.displayUntil === "number")
    && Array.isArray(value.order)
    && value.order.every((id) => typeof id === "string")
    && Array.isArray(value.eliminatedPlayerIds)
    && value.eliminatedPlayerIds.every((id) => typeof id === "string")
    && (value.lastFailedPlayerId === null || typeof value.lastFailedPlayerId === "string")
    && typeof value.mistakeCount === "number"
    && typeof value.initialPlayerCount === "number"
    && typeof value.eliminationThreshold === "number"
    && typeof value.finished === "boolean";
}

function isMemoryOwnState(value: unknown): value is MemoryOwnState {
  return isRecord(value)
    && value.gameId === "zaman-bombasi-hafizasi"
    && value.kind === "zaman-bombasi-hafizasi"
    && typeof value.isActive === "boolean"
    && typeof value.eliminated === "boolean"
    && typeof value.inputIndex === "number"
    && typeof value.sequenceLength === "number"
    && (value.inputDeadline === null || typeof value.inputDeadline === "number")
    && typeof value.finished === "boolean";
}

function secondsLeft(deadline: number | null, now: number): number | null {
  return deadline === null ? null : Math.max(0, Math.ceil((deadline - now) / 1000));
}

function clockValue(seconds: number | null): string {
  return `00:${String(seconds ?? 0).padStart(2, "0")}`;
}

function playerName(players: readonly MatchPlayerState[], playerId: string | null): string {
  return playerId === null ? "Bekleniyor" : players.find((player) => player.id === playerId)?.nickname ?? "Oyuncu";
}

function sequenceLabel(color: MemoryColor): string {
  return COLOR_META[color].label;
}

function SequenceOrbs({ sequence }: { readonly sequence: readonly MemoryColor[] }): JSX.Element {
  return (
    <div className="stage11b-memory-sequence-strip" aria-label={`${sequence.length} renkli dizi`}>
      {sequence.map((color, index) => (
        <span className={`stage11b-memory-sequence-orb ${COLOR_META[color].tone}`} key={`${color}-${index}`} aria-label={sequenceLabel(color)} />
      ))}
    </div>
  );
}

export function MemoryStage({ publicState: rawPublicState, ownState: rawOwnState, players, selfPlayerId, now, isSpectator, onSubmit }: MemoryStageProps): JSX.Element {
  const state = isMemoryPublicState(rawPublicState) ? rawPublicState : null;
  const own = !isSpectator && isMemoryOwnState(rawOwnState) ? rawOwnState : null;
  const [draft, setDraft] = useState<MemoryColor[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetKey = state === null ? "empty" : `${state.subPhase}-${state.sequenceLength}-${state.activePlayerId}-${state.finished}`;
  useEffect(() => {
    setDraft([]);
    setPending(false);
    setError(null);
  }, [resetKey]);

  const roster = useMemo(() => {
    if (state === null) return players.filter((player) => player.currentGameParticipant);
    const byId = new Map(players.map((player) => [player.id, player]));
    const ordered = state.order.map((playerId) => byId.get(playerId)).filter((player): player is MatchPlayerState => player !== undefined);
    const included = new Set(ordered.map((player) => player.id));
    return [...ordered, ...players.filter((player) => player.currentGameParticipant && !included.has(player.id))];
  }, [players, state]);

  const sequenceLength = Math.max(2, state?.sequenceLength ?? 2);
  const isDisplay = state?.subPhase === "display";
  const isResults = state?.subPhase === "results" || state?.finished === true;
  const timer = secondsLeft(isDisplay ? state?.displayUntil ?? null : own?.inputDeadline ?? state?.inputDeadline ?? null, now);
  const activePlayerId = state?.activePlayerId ?? null;
  const activeName = playerName(players, activePlayerId);
  const canInput = Boolean(
    state
      && state.subPhase === "input"
      && own?.isActive
      && !own.eliminated
      && timer !== null
      && timer > 0
      && !pending
      && !isSpectator
  );

  const addColor = useCallback((color: MemoryColor): void => {
    if (!canInput || draft.length >= sequenceLength) return;
    setError(null);
    setDraft((current) => [...current, color]);
  }, [canInput, draft.length, sequenceLength]);

  const submit = useCallback((): void => {
    if (!canInput || draft.length !== sequenceLength) {
      if (canInput) setError(`Dizi ${sequenceLength} renkten oluşuyor.`);
      return;
    }
    setPending(true);
    setError(null);
    onSubmit({ kind: "memory-sequence", sequence: [...draft] });
  }, [canInput, draft, onSubmit, sequenceLength]);

  const onKeyDown = useCallback((event: KeyboardEvent<HTMLElement>): void => {
    if (!canInput) return;
    const index = Number(event.key) - 1;
    if (index >= 0 && index < MEMORY_COLORS.length) {
      event.preventDefault();
      addColor(MEMORY_COLORS[index]!);
    } else if ((event.key === "Enter" || event.key === " ") && draft.length === sequenceLength) {
      event.preventDefault();
      submit();
    }
  }, [addColor, canInput, draft.length, sequenceLength, submit]);

  if (state === null) {
    return (
      <section className="stage11b-reference-page stage11b-memory-reference" aria-label="Zaman Bombası Hafızası hazırlanıyor">
        <p className="stage11b-reference-note">Hafıza sahnesi hazırlanıyor…</p>
      </section>
    );
  }

  return (
    <section className="stage11b-reference-page stage11b-memory-reference" aria-label="Zaman Bombası Hafızası" onKeyDown={onKeyDown}>
      <Stage11BReferenceHeader title="Zaman Bombası Hafızası" icon="memory" timerLabel="SIRA" timerValue={clockValue(timer)} accent="pink" />

      <p className="stage11b-reference-instruction"><strong>{sequenceLength} rengi</strong> <strong>sırayla</strong> tekrar et.</p>

      <section className="stage11b-memory-lock-card" aria-label={isDisplay ? "Renk dizisi gösteriliyor" : "Renk dizisi gizli"}>
        <span className="stage11b-memory-lock-icon"><Stage11BIcon kind="lock" /></span>
        {isDisplay ? (
          <>
            <strong>Diziyi ezberle.</strong>
            <SequenceOrbs sequence={state.sequence} />
          </>
        ) : isResults ? (
          <>
            <strong>Tur tamamlandı.</strong>
            <SequenceOrbs sequence={state.resultSequence} />
          </>
        ) : (
          <>
            <strong>Dizi gizli — aynı sırayla bas.</strong>
            <span className="stage11b-reference-note">Sıra sende olduğunda renkleri seç.</span>
          </>
        )}
      </section>

      <p className="stage11b-memory-active">Aktif oyuncu: <strong>{activeName}</strong></p>

      <div className="stage11b-memory-roster" aria-label="Oyuncular">
        {roster.map((player, index) => {
          const eliminated = state.eliminatedPlayerIds.includes(player.id) || player.eliminated;
          return (
            <div className={`stage11b-memory-roster-card ${player.id === activePlayerId ? "is-active" : ""} ${eliminated ? "is-eliminated" : ""}`} key={player.id}>
              <BlobAvatar player={player} index={index} size="small" muted={eliminated} />
              <span>{player.nickname}</span>
            </div>
          );
        })}
      </div>

      {isResults ? (
        <section className="stage11b-memory-results" aria-label="Hafıza sonuçları">
          <h2>Son dizi</h2>
          <SequenceOrbs sequence={state.resultSequence} />
          <div>
            {roster.map((player) => {
              const eliminated = state.eliminatedPlayerIds.includes(player.id) || player.eliminated;
              return <div className={`stage11b-memory-result-row ${eliminated ? "is-out" : ""}`} key={player.id}><strong>{player.nickname}</strong><span>{eliminated ? "ELENDİ" : "HAYATTA"}</span></div>;
            })}
          </div>
        </section>
      ) : (
        <>
          <section className="stage11b-memory-color-grid" aria-label="Hafıza renkleri">
            {MEMORY_COLORS.map((color) => {
              const picked = draft.includes(color);
              const meta = COLOR_META[color];
              return (
                <button className={`stage11b-memory-color-card ${picked ? "is-selected" : ""}`} key={color} type="button" disabled={!canInput || draft.length >= sequenceLength} aria-pressed={picked} onClick={() => addColor(color)}>
                  <span className={`stage11b-memory-color-orb ${meta.tone}`} aria-hidden="true" />
                  <strong>{meta.label}</strong>
                </button>
              );
            })}
          </section>
          <button className="stage11b-memory-submit" type="button" disabled={!canInput || draft.length !== sequenceLength} onClick={submit}>
            {pending ? "DİZİ GÖNDERİLİYOR…" : "DİZİYİ KİLİTLE"}
          </button>
          {canInput && <p className="stage11b-memory-status"><strong>{draft.length}/{sequenceLength}</strong> · Doğru dizide sistem otomatik devam eder.</p>}
          {!isSpectator && own?.eliminated && <p className="stage11b-memory-status">Elendin; bu turu izleyebilirsin.</p>}
          {!isSpectator && own && !own.isActive && !own.eliminated && <p className="stage11b-memory-status">Sıra sende değil; aktif oyuncuyu bekle.</p>}
          {isSpectator && <p className="stage11b-memory-status">İzleyici görünümü · yalnızca aktif oyuncu renk girebilir.</p>}
          {error && <p className="stage11b-memory-status is-error" role="alert">{error}</p>}
        </>
      )}

      <p className="stage11b-reference-footnote"><Stage11BIcon kind="info" /> Doğru dizide sistem otomatik devam eder.</p>
      <span className="stage11b-reference-kicker" aria-hidden="true">{selfPlayerId ? "KENDİ CİHAZINDAN OYNA" : "OYUNCU GÖRÜNÜMÜ"}</span>
    </section>
  );
}

export default MemoryStage;
