import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, JSX } from "react";
import type { JsonValue, MatchPlayerState, SizmaOwnState, SizmaPublicState } from "@glix/shared";
import { BlobAvatar, Stage11BIcon, Stage11BReferenceHeader } from "./Stage11BPrimitives";

interface SizmaStageProps {
  readonly publicState: unknown;
  readonly ownState: unknown | null;
  readonly players: readonly MatchPlayerState[];
  readonly selfPlayerId: string | null;
  readonly now: number;
  readonly isSpectator: boolean;
  readonly onSubmit: (payload: JsonValue) => void;
}

const AVATAR_ACCENTS = ["#17e1ff", "#ff49c8", "#44f56d", "#a345ff"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPublicState(value: unknown): value is SizmaPublicState {
  return isRecord(value)
    && value.gameId === "sizma"
    && value.kind === "sizma"
    && typeof value.started === "boolean"
    && (value.subPhase === "clue" || value.subPhase === "ready-for-vote" || value.subPhase === "vote" || value.subPhase === "results")
    && (value.clueRound === 1 || value.clueRound === 2)
    && (value.clueTurnPlayerId === null || typeof value.clueTurnPlayerId === "string")
    && typeof value.clueTurnIndex === "number"
    && typeof value.clueTurnsCompleted === "number"
    && typeof value.totalClueTurns === "number"
    && Array.isArray(value.clueTokens)
    && Array.isArray(value.readyPlayerIds)
    && value.readyPlayerIds.every((id) => typeof id === "string")
    && (value.voteEndsAt === null || typeof value.voteEndsAt === "number")
    && Array.isArray(value.votedPlayerIds)
    && value.votedPlayerIds.every((id) => typeof id === "string")
    && (value.voteCounts === null || Array.isArray(value.voteCounts))
    && (value.topVotedPlayerIds === null || Array.isArray(value.topVotedPlayerIds))
    && (value.outsiderPlayerId === null || typeof value.outsiderPlayerId === "string")
    && (value.commonWord === null || typeof value.commonWord === "string")
    && (value.outsiderWord === null || typeof value.outsiderWord === "string")
    && (value.outsiderCaught === null || typeof value.outsiderCaught === "boolean")
    && typeof value.finished === "boolean";
}

function isOwnState(value: unknown): value is SizmaOwnState {
  return isRecord(value)
    && value.gameId === "sizma"
    && value.kind === "sizma"
    && (value.role === "normal" || value.role === "outsider")
    && typeof value.assignedWord === "string"
    && (value.clueRound === 1 || value.clueRound === 2)
    && Array.isArray(value.completedClueRounds)
    && value.completedClueRounds.every((round) => typeof round === "number")
    && typeof value.canCompleteClue === "boolean"
    && typeof value.canReadyForVote === "boolean"
    && typeof value.hasVoted === "boolean"
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

function accentStyle(color: string): CSSProperties {
  return { "--player-accent": color } as CSSProperties;
}

function Results({ state, players }: { readonly state: SizmaPublicState; readonly players: readonly MatchPlayerState[] }): JSX.Element {
  const outsider = playerName(players, state.outsiderPlayerId);
  return (
    <section className="stage11b-sizma-result" aria-label="Sızma sonuçları">
      <h2>{state.outsiderCaught ? "Sızma yakalandı." : "Sızma aramızda."}</h2>
      <p>{state.outsiderPlayerId === null ? "Ayrılan koltuk sonucu etkiledi." : `${outsider} ${state.outsiderCaught ? "sızmaydı" : "sızma olarak kaldı"}.`}</p>
      <div className="stage11b-sizma-result-grid">
        {(state.voteCounts ?? []).map((entry) => (
          <div className="stage11b-sizma-result-cell" key={entry.playerId}><span>OY</span><strong>{playerName(players, entry.playerId)}</strong><b>{entry.votes}</b></div>
        ))}
      </div>
      <p>{state.commonWord ? `Ortak kelime: ${state.commonWord}.` : "Ortak kelime sonuçta açıldı."} {state.outsiderWord ? `Sızma kelimesi: ${state.outsiderWord}.` : ""}</p>
    </section>
  );
}

export function SizmaStage({ publicState: rawPublicState, ownState: rawOwnState, players, selfPlayerId, now, isSpectator, onSubmit }: SizmaStageProps): JSX.Element {
  const state = isPublicState(rawPublicState) ? rawPublicState : null;
  const own = !isSpectator && isOwnState(rawOwnState) ? rawOwnState : null;
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const roster = useMemo(() => {
    const participants = players.filter((player) => player.currentGameParticipant);
    return participants.length > 0 ? participants : players;
  }, [players]);
  const participantIds = useMemo(() => new Set(roster.map((player) => player.id)), [roster]);
  const voteRemaining = secondsLeft(state?.voteEndsAt ?? null, now);
  const isResults = state?.subPhase === "results" || state?.finished === true;
  const isVote = state?.subPhase === "vote";
  const isClue = state?.subPhase === "clue";
  const isReadyForVote = state?.subPhase === "ready-for-vote";
  const isCurrentTurn = state?.clueTurnPlayerId !== null && state?.clueTurnPlayerId === selfPlayerId;
  const canCompleteClue = Boolean(isClue && isCurrentTurn && !isSpectator && own?.canCompleteClue && !pending);
  const canReady = Boolean(isReadyForVote && !isSpectator && own?.canReadyForVote && !pending);
  const canVote = Boolean(isVote && !isSpectator && own && !own.hasVoted && voteRemaining !== null && voteRemaining > 0 && !pending);
  const resetKey = state === null ? "empty" : `${state.subPhase}-${state.clueRound}-${state.clueTurnPlayerId}-${state.voteEndsAt}-${own?.hasVoted ?? false}`;

  useEffect(() => {
    setSelectedTargetId(null);
    setPending(false);
  }, [resetKey]);

  useEffect(() => {
    if (selectedTargetId !== null && !participantIds.has(selectedTargetId)) setSelectedTargetId(null);
  }, [participantIds, selectedTargetId]);

  const completeClue = (): void => {
    if (!canCompleteClue) return;
    setPending(true);
    // The adapter needs a non-empty acknowledgement; no clue text is captured or displayed.
    onSubmit({ kind: "clue-complete", clueText: "spoken-clue" });
  };

  const readyForVote = (): void => {
    if (!canReady) return;
    setPending(true);
    onSubmit({ kind: "vote-ready" });
  };

  const submitVote = (): void => {
    if (!canVote || selectedTargetId === null || !participantIds.has(selectedTargetId)) return;
    setPending(true);
    onSubmit({ kind: "vote", targetPlayerId: selectedTargetId });
  };

  if (state === null) {
    return (
      <section className="stage11b-reference-page stage11b-sizma-reference" aria-label="Sızma hazırlanıyor">
        <p className="stage11b-reference-note">Sızma sahnesi hazırlanıyor…</p>
      </section>
    );
  }

  const headerTimerLabel = isVote ? "OY" : isResults ? "SONUÇ" : "İPUCU TURU";
  const headerTimerValue = isVote ? clockValue(voteRemaining) : isResults ? "AÇIK" : `${state.clueRound}/2`;
  const clueTurnName = playerName(players, state.clueTurnPlayerId);

  return (
    <section className="stage11b-reference-page stage11b-sizma-reference" aria-label="Sızma">
      <Stage11BReferenceHeader title="Sızma" icon="clue" timerLabel={headerTimerLabel} timerValue={headerTimerValue} accent="cyan" />

      <section className="stage11b-sizma-word-panel" aria-label="Kişisel gizli kelime">
        <div className="stage11b-sizma-word-label"><Stage11BIcon kind="lock" /> <span>Senin gizli kelimen</span></div>
        <div className={`stage11b-sizma-word ${own ? "" : "is-hidden"}`}>{own ? own.assignedWord : "OYUNCUYA ÖZEL"}</div>
        <div className="stage11b-sizma-divider"><Stage11BIcon kind="star" /></div>
        <p className="stage11b-sizma-clue-copy">
          {isClue ? <><strong>{clueTurnName}</strong> ipucunu yüksek sesle söyler.</> : isReadyForVote ? <>Herkes hazır olduğunda oylama açılır.</> : isVote ? <>Şüphelendiğin bir oyuncuyu seç.</> : <>Oylama sonucu açıldı.</>}
        </p>
        <div className="stage11b-sizma-round-badge"><Stage11BIcon kind="star" /> {isVote ? "OY" : "TUR"} <strong>{isVote ? "30" : state.clueRound}</strong><span>{isVote ? "sn" : "/ 2"}</span></div>
      </section>

      {(isClue || isReadyForVote) && (
        <>
          <div className="stage11b-sizma-players" aria-label="Oyuncular">
            {roster.map((player, index) => {
              const active = player.id === state.clueTurnPlayerId;
              return <div className={`stage11b-sizma-player-card ${active ? "is-selected" : ""}`} style={accentStyle(AVATAR_ACCENTS[index % AVATAR_ACCENTS.length]!)} key={player.id}><span className="stage11b-sizma-player-card__radio" aria-hidden="true" /><BlobAvatar player={player} index={index} size="small" muted={player.eliminated} /><strong>{player.nickname}</strong></div>;
            })}
          </div>
          {isClue && <button className="stage11b-sizma-action" type="button" disabled={!canCompleteClue} onClick={completeClue}><Stage11BIcon kind="clue" /> {pending ? "İPUCU KAYDEDİLİYOR…" : isCurrentTurn ? "İPUCUNU SÖYLEDİM" : `${clueTurnName} sırası`}</button>}
          {isReadyForVote && <button className="stage11b-sizma-action" type="button" disabled={!canReady} onClick={readyForVote}><Stage11BIcon kind="star" /> {pending ? "HAZIRLIK KAYDEDİLİYOR…" : own?.canReadyForVote ? "OYLAMAYA GEÇ" : "HAZIR"}</button>}
          {isReadyForVote && <p className="stage11b-sizma-status">Hazır olanlar: {state.readyPlayerIds.length}/{roster.length}</p>}
        </>
      )}

      {isVote && (
        <section className="stage11b-sizma-vote-panel" aria-label="Oy kullan">
          <div className="stage11b-sizma-vote-head"><h2>Bir oyuncu seç</h2><span className="stage11b-sizma-vote-timer">{clockValue(voteRemaining)}</span></div>
          <div className="stage11b-sizma-vote-grid">
            {roster.map((player, index) => {
              const selected = selectedTargetId === player.id;
              return <button className={`stage11b-sizma-player-card ${selected ? "is-selected" : ""} ${player.id === selfPlayerId ? "is-self" : ""}`} style={accentStyle(AVATAR_ACCENTS[index % AVATAR_ACCENTS.length]!)} key={player.id} type="button" disabled={!canVote} aria-pressed={selected} onClick={() => setSelectedTargetId(player.id)}><span className="stage11b-sizma-player-card__radio" aria-hidden="true" /><BlobAvatar player={player} index={index} size="small" /><strong>{player.id === selfPlayerId ? `${player.nickname} (sen)` : player.nickname}</strong></button>;
            })}
          </div>
          <button className="stage11b-sizma-vote-submit" type="button" disabled={!canVote || selectedTargetId === null} onClick={submitVote}>{pending ? "OY GÖNDERİLİYOR…" : own?.hasVoted ? "OY KULLANILDI" : "OYU GÖNDER"}</button>
          {own?.hasVoted && <p className="stage11b-sizma-status">Oyun kaydedildi. Sonuç açılana kadar seçimin gizli.</p>}
          {isSpectator && <p className="stage11b-sizma-status">İzleyici görünümü · oy kullanamazsın.</p>}
        </section>
      )}

      {isResults && <Results state={state} players={roster} />}

      <div className="stage11b-sizma-info"><Stage11BIcon kind="info" /> Yazılı ipucu ve ses kaydı yok.</div>
      {isClue && !isCurrentTurn && <p className="stage11b-sizma-status">Sözlü ipucu sırası: {clueTurnName}. Sen dinle ve aklında tut.</p>}
      {isClue && isCurrentTurn && !canCompleteClue && <p className="stage11b-sizma-status">Bu turun ipucunu sözlü verdikten sonra düğmeye bas.</p>}
    </section>
  );
}

export default SizmaStage;
