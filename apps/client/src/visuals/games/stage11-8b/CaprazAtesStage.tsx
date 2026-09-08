import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, JSX } from "react";
import type { CaprazAtesOwnState, CaprazAtesPublicState, JsonValue, MatchPlayerState } from "@glix/shared";
import { BlobAvatar, Stage11BIcon, Stage11BReferenceHeader } from "./Stage11BPrimitives";

export interface CaprazAtesStageProps {
  readonly publicState: unknown;
  readonly ownState: unknown | null;
  readonly players: readonly MatchPlayerState[];
  readonly selfPlayerId: string | null;
  readonly now: number;
  readonly isSpectator: boolean;
  readonly onSubmit: (payload: JsonValue) => void;
}

const AVATAR_ACCENTS = ["#12e6ff", "#ff37b7", "#35ef70", "#a345ff"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPublicState(value: unknown): value is CaprazAtesPublicState {
  return isRecord(value)
    && value.gameId === "capraz-ates"
    && value.kind === "capraz-ates"
    && typeof value.started === "boolean"
    && (value.endsAt === null || typeof value.endsAt === "number")
    && (value.results === null || Array.isArray(value.results))
    && (value.resultPoints === null || Array.isArray(value.resultPoints))
    && typeof value.finished === "boolean";
}

function isOwnState(value: unknown): value is CaprazAtesOwnState {
  return isRecord(value)
    && value.gameId === "capraz-ates"
    && value.kind === "capraz-ates"
    && Array.isArray(value.availableTargetIds)
    && value.availableTargetIds.every((id) => typeof id === "string")
    && (value.selectedTargetId === null || typeof value.selectedTargetId === "string")
    && typeof value.hasSubmitted === "boolean"
    && typeof value.finished === "boolean";
}

function secondsLeft(deadline: number | null, now: number): number | null {
  return deadline === null ? null : Math.max(0, Math.ceil((deadline - now) / 1000));
}

function clockValue(seconds: number | null): string {
  return `00:${String(seconds ?? 0).padStart(2, "0")}`;
}

function playerName(players: readonly MatchPlayerState[], playerId: string | null): string {
  return playerId === null ? "Boş atış" : players.find((player) => player.id === playerId)?.nickname ?? "Oyuncu";
}

function accentStyle(color: string): CSSProperties {
  return { "--card-accent": color } as CSSProperties;
}

function CrossfireResult({ state, players }: { readonly state: CaprazAtesPublicState; readonly players: readonly MatchPlayerState[] }): JSX.Element {
  const results = state.results ?? [];
  return (
    <section className="stage11b-crossfire-result" aria-label="Çapraz Ateş sonucu">
      <h2>Hedefler açıldı.</h2>
      <div className="stage11b-crossfire-result-arena" aria-hidden="true"><Stage11BIcon kind="crosshair" /></div>
      <div className="stage11b-crossfire-result-list">
        {results.map((result) => (
          <div className="stage11b-crossfire-result-row" key={result.playerId}>
            <strong>{playerName(players, result.playerId)}</strong>
            <small>{result.targetPlayerId === null ? "BOŞ ATIŞ" : `HEDEF · ${playerName(players, result.targetPlayerId)}`}</small>
            <b className={result.points < 0 ? "is-negative" : "is-positive"}>{result.points > 0 ? `+${result.points}` : result.points}</b>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CaprazAtesStage({ publicState: rawPublicState, ownState: rawOwnState, players, selfPlayerId, now, isSpectator, onSubmit }: CaprazAtesStageProps): JSX.Element {
  const state = isPublicState(rawPublicState) ? rawPublicState : null;
  const own = !isSpectator && isOwnState(rawOwnState) ? rawOwnState : null;
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const roster = useMemo(() => players.filter((player) => player.currentGameParticipant), [players]);
  const availableTargetIds = useMemo(() => new Set(own?.availableTargetIds ?? []), [own?.availableTargetIds]);
  const remaining = secondsLeft(state?.endsAt ?? null, now);
  const canEdit = Boolean(state && !state.finished && !isSpectator && own && !own.hasSubmitted && remaining !== null && remaining > 0 && !pending);
  const resetKey = state === null ? "empty" : `${state.endsAt}-${state.finished}-${own?.hasSubmitted ?? false}-${own?.selectedTargetId ?? ""}`;

  useEffect(() => {
    setSelectedTargetId(own?.selectedTargetId ?? null);
    setPending(false);
  }, [resetKey]);

  useEffect(() => {
    if (selectedTargetId !== null && !availableTargetIds.has(selectedTargetId)) setSelectedTargetId(null);
  }, [availableTargetIds, selectedTargetId]);

  const submitTarget = (): void => {
    if (!canEdit || selectedTargetId === null || !availableTargetIds.has(selectedTargetId)) return;
    setPending(true);
    onSubmit({ kind: "crossfire-target", targetPlayerId: selectedTargetId });
  };

  if (state === null) {
    return (
      <section className="stage11b-reference-page stage11b-crossfire-reference" aria-label="Çapraz Ateş hazırlanıyor">
        <p className="stage11b-reference-note">Nişan sahnesi hazırlanıyor…</p>
      </section>
    );
  }

  const isResults = state.finished || state.results !== null;

  return (
    <section className="stage11b-reference-page stage11b-crossfire-reference" aria-label="Çapraz Ateş">
      <Stage11BReferenceHeader title="Çapraz Ateş" icon="crosshair" timerLabel="HEDEF" timerValue={clockValue(remaining ?? (isResults ? 0 : 25))} accent="cyan" />

      <p className="stage11b-reference-instruction"><span>Kendin </span><strong>dışındaki</strong><span> bir oyuncuyu </span><strong>hedefle.</strong></p>

      {isResults ? (
        <CrossfireResult state={state} players={roster} />
      ) : (
        <>
          <div className="stage11b-crossfire-card-grid" aria-label="Oyuncu hedefleri">
            {roster.map((player, index) => {
              const isSelf = player.id === selfPlayerId;
              const selectable = !isSelf && !player.eliminated && player.connected && availableTargetIds.has(player.id);
              const selected = selectedTargetId === player.id;
              return (
                <button className={`stage11b-crossfire-player-card ${isSelf ? "is-self" : ""} ${selected ? "is-selected" : ""}`} style={accentStyle(AVATAR_ACCENTS[index % AVATAR_ACCENTS.length]!)} key={player.id} type="button" disabled={!canEdit || !selectable} aria-pressed={selected} onClick={() => setSelectedTargetId(player.id)}>
                  <span className="stage11b-crossfire-player-card__radio" aria-hidden="true" />
                  <BlobAvatar player={player} index={index} size="regular" muted={player.eliminated} />
                  <span className="stage11b-crossfire-player-card__copy"><strong>{isSelf ? `${player.nickname} — SEN` : player.nickname}</strong><small>{isSelf ? "KENDİNİ HEDEFLEYEMEZSİN" : selected ? "HEDEF SEÇİLDİ" : !player.connected ? "BAĞLANTI BEKLENİYOR" : isSpectator ? "HEDEF KARTI" : selectable ? "HEDEFLE" : "HEDEF UYGUN DEĞİL"}</small></span>
                </button>
              );
            })}
          </div>

          <div className="stage11b-crossfire-target-area">
            <div className="stage11b-crossfire-hidden-note"><Stage11BIcon kind="lock" /> Hedefler süre bitene kadar görünmez.</div>
            <div className="stage11b-crossfire-actions">
              <button className="stage11b-crossfire-submit" type="button" disabled={!canEdit || selectedTargetId === null} onClick={submitTarget}><Stage11BIcon kind="plane" /> {pending ? "HEDEF GÖNDERİLİYOR…" : own?.hasSubmitted ? "HEDEF GÖNDERİLDİ" : "Hedef Gönder"}</button>
            </div>
          </div>

          {isSpectator && <p className="stage11b-crossfire-status">İzleyici görünümü · canlı hedefler gizli.</p>}
          {!isSpectator && own?.hasSubmitted && <p className="stage11b-crossfire-status">Hedefin kilitlendi. Sonuç açılana kadar seçim gizli kalır.</p>}
          {!isSpectator && own && !own.hasSubmitted && selectedTargetId === null && <p className="stage11b-crossfire-status">Kendin dışındaki bir oyuncu kartını seç.</p>}
        </>
      )}

      <p className="stage11b-reference-footnote"><Stage11BIcon kind="info" /> Hedef seçimi sonuç anına kadar yalnızca sana görünür.</p>
    </section>
  );
}

export default CaprazAtesStage;
