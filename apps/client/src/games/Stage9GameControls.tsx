import { useEffect, useState } from "react";
import type { JSX } from "react";
import type {
  JsonValue,
  MatchPlayerState,
  RusRuletiOwnState,
  RusRuletiPublicState,
  SonKisiOwnState,
  SonKisiPublicState,
  Stage9GameId,
  Stage9OwnState,
  Stage9PublicState
} from "@glix/shared";

interface Stage9GameControlsProps {
  readonly gameId: Stage9GameId;
  readonly publicState: unknown;
  readonly ownState: unknown;
  readonly selfPlayerId: string | null;
  readonly players: readonly MatchPlayerState[];
  readonly now: number;
  readonly onSubmit: (payload: JsonValue) => void;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStage9PublicState(value: unknown): value is Stage9PublicState {
  return isRecord(value) && typeof value.gameId === "string" && typeof value.kind === "string";
}

function isStage9OwnState(value: unknown): value is Stage9OwnState {
  return isRecord(value) && typeof value.gameId === "string" && typeof value.kind === "string";
}

function playerName(players: readonly MatchPlayerState[], playerId: string | null): string {
  return players.find((player) => player.id === playerId)?.nickname ?? "Oyuncu";
}

function secondsLeft(deadline: number | null, now: number): number {
  return deadline === null ? 0 : Math.max(0, Math.ceil((deadline - now) / 1000));
}

function scoreText(points: number): string {
  return `${points > 0 ? "+" : ""}${points}`;
}

function Stage9Timer({ deadline, now }: { readonly deadline: number | null; readonly now: number }): JSX.Element {
  return <span className="stage9-game-timer"><small>SÜRE</small><b>{secondsLeft(deadline, now)}<em> sn</em></b></span>;
}

function Stage9Heading({ label, title, deadline, now }: { readonly label: string; readonly title: string; readonly deadline: number | null; readonly now: number }): JSX.Element {
  return <div className="stage9-game-heading"><div><span className="stage9-eyebrow">{label}</span><strong>{title}</strong></div>{deadline !== null && <Stage9Timer deadline={deadline} now={now} />}</div>;
}

function ResultPills({ points }: { readonly points: readonly { readonly playerId: string; readonly points: number }[] }): JSX.Element {
  return <div className="stage9-result-pills">{points.map((entry) => <span key={entry.playerId}><b>{scoreText(entry.points)}</b><small>{entry.playerId.slice(0, 4).toUpperCase()}</small></span>)}</div>;
}

export function Stage9GameControls({ gameId, publicState, ownState, selfPlayerId, players, now, onSubmit }: Stage9GameControlsProps): JSX.Element {
  if (!isStage9PublicState(publicState) || !isStage9OwnState(ownState) || publicState.gameId !== gameId || ownState.gameId !== gameId) {
    return <div className="stage9-controls stage9-empty-state">Oyun sahnesi hazırlanıyor…</div>;
  }

  if (gameId === "rus-ruleti") {
    return <RusRuletiControls publicState={publicState as RusRuletiPublicState} ownState={ownState as RusRuletiOwnState} players={players} selfPlayerId={selfPlayerId} now={now} onSubmit={onSubmit} />;
  }

  return <SonKisiControls publicState={publicState as SonKisiPublicState} ownState={ownState as SonKisiOwnState} players={players} selfPlayerId={selfPlayerId} now={now} onSubmit={onSubmit} />;
}

function RusRuletiControls({ publicState, ownState, players, selfPlayerId, now, onSubmit }: { readonly publicState: RusRuletiPublicState; readonly ownState: RusRuletiOwnState; readonly players: readonly MatchPlayerState[]; readonly selfPlayerId: string | null; readonly now: number; readonly onSubmit: (payload: JsonValue) => void }): JSX.Element {
  const [targetPlayerId, setTargetPlayerId] = useState<string | null>(null);
  const alivePlayers = players.filter((player) => publicState.alivePlayerIds.includes(player.id) && !player.eliminated);
  const currentHolderName = playerName(players, publicState.currentHolderId);
  const selectedTarget = alivePlayers.some((player) => player.id === targetPlayerId) ? targetPlayerId : null;

  useEffect(() => {
    setTargetPlayerId(null);
  }, [publicState.currentHolderId, publicState.shotCount]);

  return <div className={`stage9-controls stage9-russian-controls ${ownState.isHolder ? "is-holder" : ""} ${ownState.eliminated ? "is-spectator" : ""}`} aria-live="polite">
    <Stage9Heading label="RUS RULETİ" title={publicState.finished ? "Hayatta kalanlar" : ownState.isHolder ? "Silah sende" : `${currentHolderName} karar veriyor`} deadline={publicState.phaseEndsAt} now={now} />

    <div className="stage9-russian-status">
      <div className="stage9-risk-orb"><span className="stage9-risk-ring" /><strong>{ownState.riskPercent === null ? "??" : `%${ownState.riskPercent}`}</strong><small>{ownState.riskPercent === null ? "RİSKİ SAHİBİ GÖRÜR" : "PATLAMA RİSKİ"}</small></div>
      <div className="stage9-russian-stats"><span><small>SİLAH</small><b>{publicState.finished ? "—" : currentHolderName}</b></span><span><small>HAYATTA</small><b>{publicState.alivePlayerIds.length} / {players.length}</b></span><span><small>ATIŞ</small><b>{publicState.shotCount}</b></span></div>
    </div>

    {!publicState.finished && ownState.isHolder && <div className="stage9-target-panel"><span className="stage9-panel-kicker">HEDEFİNİ SEÇ</span><div className="stage9-target-grid">{alivePlayers.map((player, index) => <button className={`stage9-target-button ${selectedTarget === player.id ? "is-selected" : ""}`} type="button" key={player.id} onClick={() => setTargetPlayerId(player.id)}><span className={`avatar avatar-${(index % 8) + 1}`}>{player.nickname.slice(0, 1).toUpperCase()}</span><strong>{player.nickname}</strong><small>{player.id === selfPlayerId ? "KENDİN" : "HEDEF"}</small></button>)}</div><button className="stage9-action-button stage9-fire-button" type="button" disabled={!selectedTarget} onClick={() => selectedTarget && onSubmit({ kind: "russian-shot", targetPlayerId: selectedTarget })}>ATEŞ ET<span>RİSKİ GÖZE AL</span></button><p className="stage9-rule-note">Kendini veya hayatta olan başka bir oyuncuyu seçebilirsin. Süre dolarsa sunucu rastgele hedef seçer.</p></div>}

    {!publicState.finished && !ownState.isHolder && !ownState.eliminated && <div className="stage9-wait-card"><span className="stage9-wait-orbit">◉</span><strong>{currentHolderName} ateş edecek</strong><small>Silah sana geçerse hedef seçebileceksin.</small></div>}
    {ownState.eliminated && !publicState.finished && <div className="stage9-spectator-card"><strong>ELENDİN</strong><small>Bu turu izliyorsun. Sonuçları bekle.</small></div>}

    {publicState.lastShot && !publicState.finished && <div className={`stage9-shot-feed ${publicState.lastShot.exploded ? "is-exploded" : "is-safe"}`}><strong>{publicState.lastShot.exploded ? "PATLAMA" : "GÜVENLİ ATIŞ"}</strong><span>{playerName(players, publicState.lastShot.targetPlayerId)} hedeflendi · risk %{publicState.lastShot.riskPercent}</span></div>}

    {publicState.finished && <div className="stage9-result-list">{(publicState.results ?? []).map((result) => <div className={`stage9-result-row ${result.survived ? "is-survivor" : "is-eliminated"}`} key={result.playerId}><strong>{playerName(players, result.playerId)}</strong><span>{result.survived ? "HAYATTA" : "ELENDİ"}</span><b>{scoreText(result.points)}</b></div>)}</div>}
    {publicState.finished && <ResultPills points={publicState.resultPoints ?? []} />}
  </div>;
}

function SonKisiControls({ publicState, ownState, players, selfPlayerId, now, onSubmit }: { readonly publicState: SonKisiPublicState; readonly ownState: SonKisiOwnState; readonly players: readonly MatchPlayerState[]; readonly selfPlayerId: string | null; readonly now: number; readonly onSubmit: (payload: JsonValue) => void }): JSX.Element {
  const escapedNames = publicState.escapedPlayerIds.map((playerId) => playerName(players, playerId));
  return <div className={`stage9-controls stage9-last-person-controls ${ownState.hasEscaped ? "is-escaped" : ""}`} aria-live="polite">
    <Stage9Heading label="SON KİŞİ" title={publicState.finished ? "Alarm çaldı" : ownState.hasEscaped ? "Kaçış kaydedildi" : "Doğru anı bekle"} deadline={null} now={now} />
    <div className="stage9-corridor"><span className="stage9-corridor-light" /><span className="stage9-corridor-shadow" /><span className="stage9-corridor-alarm" /><strong>{publicState.finished ? "BİTTİ" : "?"}</strong><small>{publicState.escapeCount} KAÇIŞ KAYITLI</small></div>
    {!publicState.finished && <div className="stage9-escape-panel"><p>Bitiş zamanını göremezsin. İstediğin anda bir kez kaç; son kaçan puanı alır.</p><button className="stage9-action-button stage9-escape-button" type="button" disabled={!ownState.canEscape} onClick={() => onSubmit({ kind: "escape" })}>{ownState.hasEscaped ? "KAÇIŞ KAYITLI" : "KAÇ"}<span>{ownState.hasEscaped ? "BİR KEZ BASABİLİRSİN" : "ZAMANI SEN SEÇ"}</span></button>{escapedNames.length > 0 && <small className="stage9-escape-count">{escapedNames.length} kişi kaçtı; sen hâlâ bekliyorsun.</small>}</div>}
    {publicState.finished && <div className="stage9-result-list">{(publicState.results ?? []).map((result) => <div className={`stage9-result-row ${result.points > 0 ? "is-winner" : result.points < 0 ? "is-penalty" : ""}`} key={result.playerId}><strong>{playerName(players, result.playerId)}</strong><span>{result.escaped ? result.elapsedMs === null ? "KAÇTI" : `${(result.elapsedMs / 1000).toFixed(3).replace(".", ",")} sn` : "KAÇMADI"}</span><b>{scoreText(result.points)}</b></div>)}</div>}
    {publicState.finished && <p className="stage9-rule-note">Son kaçış zamanını paylaşan herkes +1 aldı. Kaçmayanlar −1, erken kaçanlar 0.</p>}
    {publicState.finished && <ResultPills points={publicState.resultPoints ?? []} />}
    {selfPlayerId && ownState.hasEscaped && !publicState.finished && <div className="stage9-self-note">Kaçışın kaydedildi. Diğerlerini bekliyorsun.</div>}
  </div>;
}
