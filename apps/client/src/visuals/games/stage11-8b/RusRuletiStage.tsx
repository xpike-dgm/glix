import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, JSX } from "react";
import type { JsonValue, MatchPlayerState, RusRuletiOwnState, RusRuletiPublicState } from "@glix/shared";
import { BlobAvatar, Stage11BIcon, Stage11BReferenceHeader } from "./Stage11BPrimitives";

interface RusRuletiStageProps {
  readonly publicState: unknown;
  readonly ownState: unknown | null;
  readonly players: readonly MatchPlayerState[];
  readonly selfPlayerId: string | null;
  readonly now: number;
  readonly isSpectator: boolean;
  readonly onSubmit: (payload: JsonValue) => void;
}

const AVATAR_ACCENTS = ["#14ddff", "#ff3dbb", "#44f56d", "#9949ff"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is readonly string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string");
}

function isPublicState(value: unknown): value is RusRuletiPublicState {
  return isRecord(value)
    && value.gameId === "rus-ruleti"
    && value.kind === "rus-ruleti"
    && typeof value.started === "boolean"
    && (value.subPhase === "shot" || value.subPhase === "results")
    && (value.phaseEndsAt === null || typeof value.phaseEndsAt === "number")
    && (value.currentHolderId === null || typeof value.currentHolderId === "string")
    && isStringArray(value.alivePlayerIds)
    && isStringArray(value.eliminatedPlayerIds)
    && typeof value.shotCount === "number"
    && (value.lastShot === null || isRecord(value.lastShot))
    && (value.results === null || Array.isArray(value.results))
    && (value.resultPoints === null || Array.isArray(value.resultPoints))
    && typeof value.finished === "boolean";
}

function isOwnState(value: unknown): value is RusRuletiOwnState {
  return isRecord(value)
    && value.gameId === "rus-ruleti"
    && value.kind === "rus-ruleti"
    && typeof value.isHolder === "boolean"
    && (value.riskPercent === null || typeof value.riskPercent === "number")
    && typeof value.alivePlayerCount === "number"
    && typeof value.canShoot === "boolean"
    && typeof value.eliminated === "boolean"
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
  return { "--russian-player-accent": color } as CSSProperties;
}

function targetAccentStyle(color: string): CSSProperties {
  return { "--russian-target-accent": color } as CSSProperties;
}

function RussianResults({ state, players }: { readonly state: RusRuletiPublicState; readonly players: readonly MatchPlayerState[] }): JSX.Element {
  const results = state.results ?? [];
  return (
    <section className="stage11b-russian-results" aria-label="Rus Ruleti sonuçları">
      <h2>Karar tamamlandı.</h2>
      {results.map((result) => (
        <div className={`stage11b-russian-result-row ${result.survived ? "is-survivor" : ""}`} key={result.playerId}>
          <span>{playerName(players, result.playerId)}</span>
          <b>{result.survived ? "HAYATTA" : "ELENDİ"} · {result.points > 0 ? `+${result.points}` : "0"}</b>
        </div>
      ))}
    </section>
  );
}

export function RusRuletiStage({ publicState: rawPublicState, ownState: rawOwnState, players, selfPlayerId, now, isSpectator, onSubmit }: RusRuletiStageProps): JSX.Element {
  const state = isPublicState(rawPublicState) ? rawPublicState : null;
  const own = !isSpectator && isOwnState(rawOwnState) ? rawOwnState : null;
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const roster = useMemo(() => {
    if (state === null) return players.filter((player) => player.currentGameParticipant);
    const publicIds = new Set([...state.alivePlayerIds, ...state.eliminatedPlayerIds, ...(state.currentHolderId ? [state.currentHolderId] : [])]);
    return players.filter((player) => player.currentGameParticipant || publicIds.has(player.id));
  }, [players, state]);
  const aliveIds = useMemo(() => new Set(state?.alivePlayerIds ?? []), [state?.alivePlayerIds]);
  const targets = useMemo(() => roster.filter((player) => aliveIds.has(player.id) && player.connected), [aliveIds, roster]);
  const remaining = secondsLeft(state?.phaseEndsAt ?? null, now);
  const isFinished = state?.finished === true || state?.subPhase === "results";
  const canShoot = Boolean(!isSpectator && !isFinished && own?.isHolder && own.canShoot && remaining !== null && remaining > 0 && !pending);
  const resetKey = state === null ? "empty" : `${state.phaseEndsAt}-${state.currentHolderId}-${state.shotCount}-${state.finished}`;

  useEffect(() => {
    setSelectedTargetId(null);
    setPending(false);
  }, [resetKey]);

  useEffect(() => {
    if (selectedTargetId !== null && !aliveIds.has(selectedTargetId)) setSelectedTargetId(null);
  }, [aliveIds, selectedTargetId]);

  const shoot = (): void => {
    if (!canShoot || selectedTargetId === null || !aliveIds.has(selectedTargetId)) return;
    setPending(true);
    onSubmit({ kind: "russian-shot", targetPlayerId: selectedTargetId });
  };

  if (state === null) {
    return (
      <section className="stage11b-reference-page stage11b-russian-reference" aria-label="Rus Ruleti hazırlanıyor">
        <p className="stage11b-reference-note">Rus Ruleti sahnesi hazırlanıyor…</p>
      </section>
    );
  }

  const holderName = playerName(players, state.currentHolderId);
  const ownRiskVisible = own?.isHolder === true && own.riskPercent !== null && !isFinished;
  const lastShot = state.lastShot;

  return (
    <section className="stage11b-russian-reference" aria-label="Rus Ruleti">
      <div className="stage11b-reference-page">
        <Stage11BReferenceHeader title="Rus Ruleti" icon="gun" timerLabel="KARAR" timerValue={clockValue(remaining ?? (isFinished ? 0 : 18))} accent="amber" />

        <div className="stage11b-russian-layout">
          <section className="stage11b-russian-roster" aria-label="Oyuncular">
            <div className="stage11b-russian-panel-heading"><span>Oyuncular</span><Stage11BIcon kind="crosshair" /></div>
            {state.currentHolderId && !isFinished && <div className="stage11b-russian-holder-banner">SİLAH: {holderName}</div>}
            <div className="stage11b-russian-player-list">
              {roster.map((player, index) => {
                const isHolder = player.id === state.currentHolderId;
                const eliminated = state.eliminatedPlayerIds.includes(player.id) || player.eliminated;
                return (
                  <div className={`stage11b-russian-player-card ${isHolder ? "is-holder" : ""} ${eliminated ? "is-eliminated" : ""}`} style={accentStyle(AVATAR_ACCENTS[index % AVATAR_ACCENTS.length]!)} key={player.id}>
                    <BlobAvatar player={player} index={index} size="small" muted={eliminated} />
                    <span className="stage11b-russian-player-card__copy"><strong>{player.nickname}</strong><small>{isHolder ? "SİLAH SENDE" : eliminated ? "ELENDİ" : aliveIds.has(player.id) ? "HAYATTA" : "BEKLEMEDE"}</small></span>
                    <span className="stage11b-russian-player-card__state" aria-hidden="true" />
                  </div>
                );
              })}
            </div>
          </section>

          <section className="stage11b-russian-gun-panel" aria-label="Rus Ruleti silahı">
            <div className="stage11b-russian-panel-heading"><span>{lastShot ? (lastShot.exploded ? "Patlama" : "Güvenli atış") : "Karar anı"}</span><span>{state.shotCount}. ATIŞ</span></div>
            <div className="stage11b-russian-gun-stage"><div className="stage11b-russian-gun" aria-hidden="true"><span className="stage11b-russian-gun-chamber"><span /></span></div></div>
            <div className="stage11b-russian-risk">
              {ownRiskVisible ? <><strong>RİSK <b>%{own.riskPercent}</b></strong><span>Güvenli atışta risk on puan artar.</span></> : <><strong>RİSK <b>GİZLİ</b></strong><span>Risk yalnızca silah sende olduğunda görünür.</span></>}
            </div>
            <p className="stage11b-russian-shot-status">{lastShot ? `${playerName(players, lastShot.targetPlayerId)} hedeflendi.` : "Silahı taşıyan oyuncu hedef seçer."}</p>
          </section>

          <section className="stage11b-russian-target-panel" aria-label="Hedefini seç">
            <div className="stage11b-russian-target-heading"><Stage11BIcon kind="crosshair" /> <span>Hedefini seç</span> <Stage11BIcon kind="crosshair" /></div>
            <p className="stage11b-russian-target-subtitle">Kendin veya yaşayan başka bir oyuncu.</p>
            <div className="stage11b-russian-target-grid">
              {targets.map((player, index) => {
                const selected = selectedTargetId === player.id;
                return (
                  <button className={`stage11b-russian-target-card ${selected ? "is-selected" : ""}`} style={targetAccentStyle(AVATAR_ACCENTS[index % AVATAR_ACCENTS.length]!)} key={player.id} type="button" disabled={!canShoot} aria-pressed={selected} onClick={() => setSelectedTargetId(player.id)}>
                    <span className="stage11b-russian-target-card__check" aria-hidden="true">✓</span>
                    <BlobAvatar player={player} index={index} size="small" />
                    <strong>{player.id === selfPlayerId ? `${player.nickname} (sen)` : player.nickname}</strong>
                  </button>
                );
              })}
            </div>
            <button className="stage11b-russian-fire" type="button" disabled={!canShoot || selectedTargetId === null} onClick={shoot}><Stage11BIcon kind="crosshair" /> {pending ? "ATEŞLENİYOR…" : "ATEŞ ET"}</button>
            {!isSpectator && !canShoot && !isFinished && <p className="stage11b-russian-status">Sıra silahı taşıyan oyuncuda.</p>}
            {isSpectator && !isFinished && <p className="stage11b-russian-status">İzleyici görünümü · hedef seçimi kapalı.</p>}
          </section>

          {isFinished && <RussianResults state={state} players={roster} />}
        </div>

        <p className="stage11b-reference-footnote"><Stage11BIcon kind="info" /> Elenen oyuncular izler; yaşayanlar sırayı devralır.</p>
      </div>
    </section>
  );
}

export default RusRuletiStage;
