import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, JSX } from "react";
import type { JsonValue, MatchPlayerState, ZehirliKadehOwnState, ZehirliKadehPublicState } from "@glix/shared";
import { BlobAvatar, Stage11BIcon, Stage11BReferenceHeader } from "./Stage11BPrimitives";

export interface ZehirliKadehStageProps {
  readonly publicState: unknown;
  readonly ownState: unknown | null;
  readonly players: readonly MatchPlayerState[];
  readonly selfPlayerId: string | null;
  readonly now: number;
  readonly isSpectator: boolean;
  readonly onSubmit: (payload: JsonValue) => void;
}

const AVATAR_ACCENTS = ["#16dfff", "#ff39b4", "#38f35a", "#a633ff"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parsePublic(value: unknown): ZehirliKadehPublicState | null {
  if (!isRecord(value) || value.gameId !== "zehirli-kadeh" || value.kind !== "zehirli-kadeh") return null;
  if (typeof value.finished !== "boolean" || typeof value.tradeCount !== "number") return null;
  if (value.phaseEndsAt !== null && typeof value.phaseEndsAt !== "number") return null;
  return value as unknown as ZehirliKadehPublicState;
}

function parseOwn(value: unknown): ZehirliKadehOwnState | null {
  if (!isRecord(value) || value.gameId !== "zehirli-kadeh" || value.kind !== "zehirli-kadeh") return null;
  if (typeof value.hasTraded !== "boolean" || typeof value.canTrade !== "boolean" || typeof value.finished !== "boolean") return null;
  if (value.poisoned !== null && typeof value.poisoned !== "boolean") return null;
  return value as unknown as ZehirliKadehOwnState;
}

function secondsLeft(deadline: number | null, now: number): number | null {
  return deadline === null ? null : Math.max(0, Math.ceil((deadline - now) / 1000));
}

function clockValue(seconds: number | null): string {
  return `00:${String(seconds ?? 0).padStart(2, "0")}`;
}

function playerName(players: readonly MatchPlayerState[], playerId: string): string {
  return players.find((player) => player.id === playerId)?.nickname ?? "Oyuncu";
}

function accentStyle(color: string): CSSProperties {
  return { "--glass-accent": color } as CSSProperties;
}

function Goblet({ revealed = false }: { readonly revealed?: boolean }): JSX.Element {
  return (
    <span className={`stage11b-goblet ${revealed ? "is-revealed" : ""}`} aria-hidden="true">
      <span className="stage11b-goblet__bowl" />
      <span className="stage11b-goblet__stem" />
      <span className="stage11b-goblet__base" />
    </span>
  );
}

function Results({ state, players }: { readonly state: ZehirliKadehPublicState; readonly players: readonly MatchPlayerState[] }): JSX.Element {
  const revealedIds = new Set(state.poisonedPlayerIds ?? []);
  return (
    <section className="stage11b-glass-result" aria-label="Zehirli Kadeh sonucu">
      <h2>Kadehler açıldı.</h2>
      {players.map((player) => {
        const revealed = revealedIds.has(player.id);
        const points = state.resultPoints?.find((entry) => entry.playerId === player.id)?.points ?? 0;
        return <div className={`stage11b-glass-result-row ${revealed ? "is-poison" : ""}`} key={player.id}><strong>{player.nickname}</strong><span>{revealed ? "ZEHİRLİ" : "TEMİZ"}</span><b>{points > 0 ? `+${points}` : "0"}</b></div>;
      })}
    </section>
  );
}

export function ZehirliKadehStage({ publicState: rawPublicState, ownState: rawOwnState, players, selfPlayerId, now, isSpectator, onSubmit }: ZehirliKadehStageProps): JSX.Element {
  const state = useMemo(() => parsePublic(rawPublicState), [rawPublicState]);
  const own = !isSpectator ? parseOwn(rawOwnState) : null;
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const roster = useMemo(() => players.filter((player) => player.currentGameParticipant), [players]);
  const self = selfPlayerId === null ? undefined : players.find((player) => player.id === selfPlayerId);
  const targets = useMemo(() => roster.filter((player) => player.id !== selfPlayerId && player.connected && !player.eliminated), [roster, selfPlayerId]);
  const targetIds = useMemo(() => new Set(targets.map((player) => player.id)), [targets]);
  const remaining = secondsLeft(state?.phaseEndsAt ?? null, now);
  const finished = state?.finished === true;
  const canTrade = Boolean(!isSpectator && !finished && own?.canTrade && !own.hasTraded && remaining !== null && remaining > 0 && !pending);
  const resetKey = state === null ? "empty" : `${state.phaseEndsAt}-${state.finished}-${own?.hasTraded ?? false}`;

  useEffect(() => {
    setSelectedTargetId(null);
    setPending(false);
  }, [resetKey]);

  useEffect(() => {
    if (selectedTargetId !== null && !targetIds.has(selectedTargetId)) setSelectedTargetId(null);
  }, [selectedTargetId, targetIds]);

  const submitTrade = (): void => {
    if (!canTrade || selectedTargetId === null || !targetIds.has(selectedTargetId)) return;
    setPending(true);
    onSubmit({ kind: "glass-trade", targetPlayerId: selectedTargetId });
  };

  if (state === null) {
    return (
      <section className="stage11b-reference-page stage11b-glass-reference" aria-label="Zehirli Kadeh hazırlanıyor">
        <p className="stage11b-reference-note">Kadeh sahnesi hazırlanıyor…</p>
      </section>
    );
  }

  return (
    <section className="stage11b-reference-page stage11b-glass-reference" aria-label="Zehirli Kadeh">
      <Stage11BReferenceHeader title="Zehirli Kadeh" icon="glass" timerLabel="TAKAS" timerValue={clockValue(remaining ?? (finished ? 0 : 20))} accent="pink" />

      <div className="stage11b-glass-top-roster" aria-label="Oyuncu kadehleri">
        {roster.map((player, index) => {
          const revealed = finished && state.poisonedPlayerIds?.includes(player.id) === true;
          return (
            <div className={`stage11b-glass-player-card ${revealed ? "is-revealed" : ""}`} style={accentStyle(AVATAR_ACCENTS[index % AVATAR_ACCENTS.length]!)} key={player.id}>
              <BlobAvatar player={player} index={index} size="small" muted={player.eliminated} />
              <strong>{player.nickname}</strong>
              <span className="stage11b-glass-player-card__status" aria-hidden="true">{revealed ? "!" : ""}</span>
              <Goblet revealed={revealed} />
            </div>
          );
        })}
      </div>

      <section className="stage11b-glass-scene" aria-label="Senin kadehin">
        <div className="stage11b-glass-self">
          {self ? <BlobAvatar player={self} index={0} size="large" muted={self.eliminated} /> : <BlobAvatar index={0} size="large" muted />}
          <strong>{self?.nickname ?? "Sen"}</strong>
          <small>Senin kadehin</small>
        </div>
        <Goblet />
      </section>

      {!finished && (
        <>
          <h2 className="stage11b-glass-section-title"><span aria-hidden="true">⌁</span> Kime takas yapmak istersin? <span aria-hidden="true">⌁</span></h2>
          <div className="stage11b-glass-target-grid" aria-label="Takas hedefleri">
            {targets.map((player, index) => {
              const selected = selectedTargetId === player.id;
              return (
                <button className={`stage11b-glass-target-card ${selected ? "is-selected" : ""}`} style={accentStyle(AVATAR_ACCENTS[(index + 1) % AVATAR_ACCENTS.length]!)} key={player.id} type="button" disabled={!canTrade} aria-pressed={selected} onClick={() => setSelectedTargetId(player.id)}>
                  <span className="stage11b-glass-target-card__status" aria-hidden="true" />
                  <BlobAvatar player={player} index={index + 1} size="small" />
                  <strong>{player.nickname}</strong>
                </button>
              );
            })}
          </div>
          <button className="stage11b-glass-submit" type="button" disabled={!canTrade || selectedTargetId === null} onClick={submitTrade}><Stage11BIcon kind="swap" /> {pending ? "TAKAS GÖNDERİLİYOR…" : own?.hasTraded ? "TAKAS YAPILDI" : "Takas Yap"}</button>
          {isSpectator && <p className="stage11b-glass-status">İzleyici görünümü · zehir durumu sonuç anına kadar gizli.</p>}
          {!isSpectator && own?.hasTraded && <p className="stage11b-glass-status">Takasın sunucuya işlendi. Süreye beş saniye eklendi.</p>}
          {targets.length === 0 && <p className="stage11b-glass-status">Uygun bir takas hedefi yok.</p>}
        </>
      )}

      {!finished && <p className="stage11b-glass-note"><Stage11BIcon kind="info" /> Bir kez takas hakkın var. Takas zorunlu değil.</p>}
      {finished && <Results state={state} players={roster} />}
      {!finished && !isSpectator && own?.canTrade === false && <p className="stage11b-glass-status">Takas hakkın kullanıldı veya süre sona erdi.</p>}
    </section>
  );
}

export default ZehirliKadehStage;
