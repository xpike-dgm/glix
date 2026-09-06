import { useCallback, useEffect, useMemo, useState } from "react";
import type { CSSProperties, JSX } from "react";
import type {
  JsonValue,
  MatchPlayerState,
  ZehirliKadehOwnState,
  ZehirliKadehPublicState
} from "@glix/shared";

export interface ZehirliKadehStageProps {
  readonly publicState: unknown;
  readonly ownState: unknown | null;
  readonly players: readonly MatchPlayerState[];
  readonly selfPlayerId: string | null;
  readonly now: number;
  readonly isSpectator: boolean;
  readonly onSubmit: (payload: JsonValue) => void;
}

type SubmissionState =
  | { readonly kind: "pending"; readonly targetPlayerId: string; readonly sentAt: number }
  | { readonly kind: "rejected"; readonly targetPlayerId: string | null }
  | null;

const EMPTY_PUBLIC_STATE: ZehirliKadehPublicState = {
  gameId: "zehirli-kadeh",
  kind: "zehirli-kadeh",
  phaseEndsAt: null,
  finished: false,
  tradeCount: 0,
  poisonedPlayerIds: null,
  trades: null,
  resultPoints: null
};

const EMPTY_OWN_STATE: ZehirliKadehOwnState = {
  gameId: "zehirli-kadeh",
  kind: "zehirli-kadeh",
  poisoned: null,
  hasTraded: false,
  canTrade: false,
  finished: false
};

const stageStyles = `
.stage11b-poison-shell {
  --stage11b-poison-ink: #eaf2f7;
  --stage11b-poison-muted: #92a6b4;
  --stage11b-poison-line: rgba(188, 220, 234, .16);
  --stage11b-poison-cyan: #70e7e6;
  --stage11b-poison-amber: #f1ad67;
  --stage11b-poison-rose: #f07d8e;
  box-sizing: border-box;
  width: min(100%, 720px);
  margin: 0 auto;
  padding: clamp(12px, 2.2vw, 22px);
  color: var(--stage11b-poison-ink);
  background:
    radial-gradient(circle at 72% 8%, rgba(52, 136, 151, .16), transparent 34%),
    linear-gradient(145deg, #0b1720 0%, #0d202a 54%, #101920 100%);
  border: 1px solid rgba(172, 220, 232, .18);
  border-radius: 24px;
  box-shadow: 0 18px 60px rgba(0, 0, 0, .32), inset 0 1px 0 rgba(255, 255, 255, .06);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  overflow: visible;
}

.stage11b-poison-shell *,
.stage11b-poison-shell *::before,
.stage11b-poison-shell *::after { box-sizing: border-box; }

.stage11b-poison-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 12px;
}

.stage11b-poison-kicker {
  margin: 0 0 5px;
  color: var(--stage11b-poison-cyan);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .2em;
  text-transform: uppercase;
}

.stage11b-poison-title {
  margin: 0;
  font-size: clamp(21px, 5vw, 30px);
  font-weight: 760;
  letter-spacing: -.04em;
}

.stage11b-poison-phase {
  flex: 0 0 auto;
  padding: 7px 9px;
  border: 1px solid var(--stage11b-poison-line);
  border-radius: 999px;
  color: var(--stage11b-poison-muted);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .11em;
  text-transform: uppercase;
  white-space: nowrap;
}

.stage11b-poison-scene {
  position: relative;
  min-height: 218px;
  padding: 8px 4px 0;
  border: 1px solid var(--stage11b-poison-line);
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(7, 15, 21, .22), rgba(4, 11, 15, .56));
}

.stage11b-poison-scene::after {
  position: absolute;
  right: 9%;
  bottom: 12px;
  left: 9%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(112, 231, 230, .34), transparent);
  content: "";
}

.stage11b-poison-diagram {
  display: block;
  width: 100%;
  height: 198px;
}

.stage11b-poison-tray {
  fill: rgba(19, 38, 48, .96);
  stroke: rgba(162, 219, 230, .42);
  stroke-width: 1.5;
}

.stage11b-poison-tray-inner {
  fill: none;
  stroke: rgba(112, 231, 230, .22);
  stroke-width: 1.2;
}

.stage11b-poison-cord {
  fill: none;
  stroke: rgba(211, 238, 241, .7);
  stroke-linecap: round;
  stroke-width: 2.2;
}

.stage11b-poison-cord-light {
  fill: none;
  stroke: rgba(112, 231, 230, .7);
  stroke-linecap: round;
  stroke-width: 1;
}

.stage11b-poison-magnet {
  fill: #172e39;
  stroke: var(--stage11b-poison-cyan);
  stroke-width: 1.5;
}

.stage11b-poison-glass {
  fill: rgba(122, 203, 216, .12);
  stroke: rgba(205, 242, 246, .78);
  stroke-width: 1.5;
}

.stage11b-poison-liquid {
  fill: #9c593d;
  opacity: .98;
}

.stage11b-poison-liquid-sheen {
  fill: rgba(255, 221, 177, .34);
}

.stage11b-poison-glint {
  fill: none;
  stroke: rgba(255, 255, 255, .75);
  stroke-linecap: round;
  stroke-width: 2;
}

.stage11b-poison-scene-caption {
  position: absolute;
  right: 15px;
  bottom: 12px;
  left: 15px;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  color: var(--stage11b-poison-muted);
  font-size: 10px;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.stage11b-poison-scene-caption strong { color: var(--stage11b-poison-ink); font-weight: 750; }

.stage11b-poison-panel {
  margin-top: 12px;
  padding: clamp(13px, 3vw, 18px);
  border: 1px solid var(--stage11b-poison-line);
  border-radius: 18px;
  background: rgba(4, 12, 17, .4);
}

.stage11b-poison-panel-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.stage11b-poison-panel-heading h3,
.stage11b-poison-panel-heading p { margin: 0; }

.stage11b-poison-panel-heading h3 {
  font-size: 13px;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.stage11b-poison-panel-heading p {
  color: var(--stage11b-poison-muted);
  font-size: 11px;
  text-align: right;
}

.stage11b-poison-target-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 132px), 1fr));
  gap: 8px;
}

.stage11b-poison-target-button,
.stage11b-poison-submit {
  appearance: none;
  border: 1px solid rgba(165, 218, 227, .18);
  color: var(--stage11b-poison-ink);
  font: inherit;
  cursor: pointer;
}

.stage11b-poison-target-button {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr);
  grid-template-rows: auto auto;
  gap: 0 8px;
  align-items: center;
  min-width: 0;
  padding: 9px;
  border-radius: 12px;
  background: rgba(15, 35, 44, .78);
  text-align: left;
  transition: border-color .16s ease, background-color .16s ease, transform .16s ease;
}

.stage11b-poison-target-button:hover:not(:disabled) {
  border-color: rgba(112, 231, 230, .7);
  background: rgba(20, 53, 62, .9);
  transform: translateY(-1px);
}

.stage11b-poison-target-button:disabled { cursor: not-allowed; opacity: .56; }

.stage11b-poison-avatar {
  display: grid;
  grid-row: 1 / span 2;
  place-items: center;
  width: 28px;
  height: 28px;
  border: 1px solid rgba(112, 231, 230, .38);
  border-radius: 50%;
  color: var(--stage11b-poison-cyan);
  font-size: 12px;
  font-weight: 850;
}

.stage11b-poison-target-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  font-weight: 700;
}

.stage11b-poison-target-note {
  color: var(--stage11b-poison-muted);
  font-size: 9px;
  letter-spacing: .06em;
  text-transform: uppercase;
}

.stage11b-poison-submit-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 11px;
}

.stage11b-poison-submit {
  min-height: 40px;
  padding: 9px 14px;
  border-color: rgba(112, 231, 230, .55);
  border-radius: 11px;
  background: linear-gradient(135deg, #2a777d, #21555e);
  font-size: 11px;
  font-weight: 850;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.stage11b-poison-submit:disabled { cursor: not-allowed; opacity: .45; }

.stage11b-poison-hint {
  flex: 1 1 auto;
  margin: 0;
  color: var(--stage11b-poison-muted);
  font-size: 11px;
  line-height: 1.45;
}

.stage11b-poison-message {
  margin: 10px 0 0;
  padding: 9px 10px;
  border-left: 2px solid var(--stage11b-poison-cyan);
  color: #c8e5e9;
  background: rgba(112, 231, 230, .07);
  font-size: 11px;
  line-height: 1.45;
}

.stage11b-poison-message.stage11b-poison-message-warning {
  border-left-color: var(--stage11b-poison-amber);
  background: rgba(241, 173, 103, .08);
}

.stage11b-poison-empty {
  margin: 0;
  color: var(--stage11b-poison-muted);
  font-size: 12px;
  line-height: 1.5;
}

.stage11b-poison-private-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 12px;
  padding: 13px 14px;
  border: 1px solid rgba(112, 231, 230, .32);
  border-radius: 15px;
  background: rgba(112, 231, 230, .08);
}

.stage11b-poison-private-status strong { font-size: 15px; letter-spacing: .05em; }
.stage11b-poison-private-status small { color: var(--stage11b-poison-muted); font-size: 10px; text-align: right; }

.stage11b-poison-results {
  margin-top: 12px;
  padding: clamp(13px, 3vw, 18px);
  border: 1px solid rgba(241, 173, 103, .24);
  border-radius: 18px;
  background: linear-gradient(145deg, rgba(45, 36, 28, .5), rgba(10, 18, 22, .48));
}

.stage11b-poison-results-title {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 13px;
}

.stage11b-poison-results-title h3,
.stage11b-poison-results-title p { margin: 0; }
.stage11b-poison-results-title h3 { font-size: 13px; letter-spacing: .09em; text-transform: uppercase; }
.stage11b-poison-results-title p { color: var(--stage11b-poison-amber); font-size: 10px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }

.stage11b-poison-score-list { display: grid; gap: 9px; }

.stage11b-poison-score-row {
  display: grid;
  grid-template-columns: minmax(72px, 22%) minmax(0, 1fr) auto;
  gap: 9px;
  align-items: center;
  min-width: 0;
}

.stage11b-poison-score-name {
  min-width: 0;
  overflow: hidden;
  color: #d6e4e8;
  font-size: 11px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stage11b-poison-score-track {
  height: 9px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, .12);
  border-radius: 999px;
  background: rgba(255, 255, 255, .07);
}

.stage11b-poison-score-fill {
  height: 100%;
  min-width: 3px;
  border-radius: inherit;
  background: linear-gradient(90deg, #d27b4d, #f1b46f);
}

.stage11b-poison-score-value { color: #f6c383; font-size: 12px; font-weight: 850; }

.stage11b-poison-route {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--stage11b-poison-line);
}

.stage11b-poison-route-chip {
  padding: 5px 7px;
  border: 1px solid rgba(112, 231, 230, .22);
  border-radius: 7px;
  color: #bdd7dc;
  font-size: 10px;
}

.stage11b-poison-focus:focus-visible,
.stage11b-poison-target-button:focus-visible,
.stage11b-poison-submit:focus-visible {
  outline: 3px solid rgba(241, 173, 103, .85);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  .stage11b-poison-target-button { transition: none; }
  .stage11b-poison-target-button:hover:not(:disabled) { transform: none; }
}

@media (max-width: 390px) {
  .stage11b-poison-shell { padding: 10px; border-radius: 18px; }
  .stage11b-poison-scene { min-height: 188px; }
  .stage11b-poison-diagram { height: 170px; }
  .stage11b-poison-submit-row { align-items: stretch; flex-direction: column; }
  .stage11b-poison-submit { width: 100%; }
  .stage11b-poison-hint { text-align: center; }
}

@media (max-width: 330px) {
  .stage11b-poison-head { display: block; }
  .stage11b-poison-phase { display: inline-block; margin-top: 8px; }
  .stage11b-poison-score-row { grid-template-columns: minmax(58px, 27%) minmax(0, 1fr) auto; gap: 6px; }
}
`;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function numberValue(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function parsePublicState(value: unknown): ZehirliKadehPublicState {
  if (!isRecord(value) || value.gameId !== "zehirli-kadeh" || value.kind !== "zehirli-kadeh") {
    return EMPTY_PUBLIC_STATE;
  }

  const poisonedPlayerIds = value.poisonedPlayerIds === null
    ? null
    : Array.isArray(value.poisonedPlayerIds)
      ? value.poisonedPlayerIds.map(stringValue).filter((id): id is string => id !== null)
      : null;
  const trades = value.trades === null
    ? null
    : Array.isArray(value.trades)
      ? value.trades
        .filter(isRecord)
        .map((trade) => ({ fromPlayerId: stringValue(trade.fromPlayerId), toPlayerId: stringValue(trade.toPlayerId) }))
        .filter((trade): trade is { fromPlayerId: string; toPlayerId: string } => trade.fromPlayerId !== null && trade.toPlayerId !== null)
      : null;
  const resultPoints = value.resultPoints === null
    ? null
    : Array.isArray(value.resultPoints)
      ? value.resultPoints
        .filter(isRecord)
        .map((point) => ({ playerId: stringValue(point.playerId), points: numberValue(point.points) }))
        .filter((point): point is { playerId: string; points: number } => point.playerId !== null && point.points !== null)
      : null;

  return {
    gameId: "zehirli-kadeh",
    kind: "zehirli-kadeh",
    phaseEndsAt: value.phaseEndsAt === null ? null : numberValue(value.phaseEndsAt),
    finished: value.finished === true,
    tradeCount: Math.max(0, Math.floor(numberValue(value.tradeCount) ?? 0)),
    poisonedPlayerIds,
    trades,
    resultPoints
  };
}

function parseOwnState(value: unknown): ZehirliKadehOwnState {
  if (!isRecord(value) || value.gameId !== "zehirli-kadeh" || value.kind !== "zehirli-kadeh") {
    return EMPTY_OWN_STATE;
  }

  return {
    gameId: "zehirli-kadeh",
    kind: "zehirli-kadeh",
    poisoned: typeof value.poisoned === "boolean" ? value.poisoned : null,
    hasTraded: value.hasTraded === true,
    canTrade: value.canTrade === true,
    finished: value.finished === true
  };
}

function playerInitial(nickname: string): string {
  const initial = nickname.trim().slice(0, 1).toLocaleUpperCase("tr-TR");
  return initial || "?";
}

function playerLabel(players: readonly MatchPlayerState[], playerId: string): string {
  return players.find((player) => player.id === playerId)?.nickname ?? "Oyuncu";
}

function scoreWidth(points: number, maximum: number): string {
  if (maximum <= 0 || points <= 0) return "0%";
  return `${Math.min(100, Math.max(4, (points / maximum) * 100))}%`;
}

function GlassChain({ players }: { readonly players: readonly MatchPlayerState[] }): JSX.Element {
  const chainPlayers = players.slice(0, 8);
  const anchorPoints = chainPlayers.length <= 2
    ? [{ x: 114, y: 84 }, { x: 286, y: 84 }]
    : chainPlayers.map((_, index) => ({ x: 70 + (index * 260) / Math.max(1, chainPlayers.length - 1), y: 84 }));

  return (
    <div className="stage11b-poison-scene" aria-hidden="true">
      <svg className="stage11b-poison-diagram" viewBox="0 0 400 198" role="presentation">
        <path className="stage11b-poison-cord" d="M 24 84 C 84 38, 108 133, 174 84 S 285 37, 376 84" />
        <path className="stage11b-poison-cord-light" d="M 24 84 C 84 38, 108 133, 174 84 S 285 37, 376 84" />
        <path className="stage11b-poison-tray" d="M 50 132 Q 200 164 350 132 L 335 165 Q 200 190 65 165 Z" />
        <path className="stage11b-poison-tray-inner" d="M 66 143 Q 200 169 334 143" />
        <circle className="stage11b-poison-magnet" cx="24" cy="84" r="7" />
        <circle className="stage11b-poison-magnet" cx="376" cy="84" r="7" />
        {chainPlayers.map((player, index) => {
          const point = anchorPoints[index] ?? { x: 200, y: 84 };
          return (
            <g key={player.id}>
              <path className="stage11b-poison-glass" d={`M ${point.x - 12} ${point.y - 22} L ${point.x - 9} ${point.y + 16} Q ${point.x} ${point.y + 22} ${point.x + 9} ${point.y + 16} L ${point.x + 12} ${point.y - 22} Z`} />
              <path className="stage11b-poison-liquid" d={`M ${point.x - 9} ${point.y + 3} L ${point.x + 9} ${point.y + 3} L ${point.x + 8} ${point.y + 15} Q ${point.x} ${point.y + 20} ${point.x - 8} ${point.y + 15} Z`} />
              <path className="stage11b-poison-liquid-sheen" d={`M ${point.x - 6} ${point.y + 6} Q ${point.x} ${point.y + 3} ${point.x + 6} ${point.y + 6} L ${point.x + 5} ${point.y + 9} Q ${point.x} ${point.y + 7} ${point.x - 5} ${point.y + 9} Z`} />
              <path className="stage11b-poison-glint" d={`M ${point.x - 6} ${point.y - 15} L ${point.x - 4} ${point.y - 4}`} />
              <circle className="stage11b-poison-magnet" cx={point.x} cy={point.y - 25} r="4" />
            </g>
          );
        })}
      </svg>
      <div className="stage11b-poison-scene-caption">
        <span>manyetik kordon</span>
        <strong>{chainPlayers.length || 0} bağlı kadeh</strong>
      </div>
    </div>
  );
}

function ResultGraph({ publicState, players }: { readonly publicState: ZehirliKadehPublicState; readonly players: readonly MatchPlayerState[] }): JSX.Element {
  const points = publicState.resultPoints ?? [];
  const playerRows = players.length > 0
    ? players.slice(0, 8).map((player) => ({ playerId: player.id, nickname: player.nickname, points: points.find((point) => point.playerId === player.id)?.points ?? 0 }))
    : points.slice(0, 8).map((point) => ({ playerId: point.playerId, nickname: "Oyuncu", points: point.points }));
  const maximum = Math.max(1, ...playerRows.map((row) => row.points));
  const publicPoisoned = new Set(publicState.poisonedPlayerIds ?? []);

  return (
    <section className="stage11b-poison-results" aria-label="Tur sonuçları">
      <div className="stage11b-poison-results-title">
        <h3>Sonuç grafiği</h3>
        <p>{publicPoisoned.size} işaretli kadeh</p>
      </div>
      <div className="stage11b-poison-score-list">
        {playerRows.map((row) => (
          <div className="stage11b-poison-score-row" key={row.playerId}>
            <span className="stage11b-poison-score-name">{row.nickname}</span>
            <span className="stage11b-poison-score-track"><span className="stage11b-poison-score-fill" style={{ width: scoreWidth(row.points, maximum) }} /></span>
            <span className="stage11b-poison-score-value">{row.points > 0 ? `+${row.points}` : "0"}</span>
          </div>
        ))}
      </div>
      {publicState.trades && publicState.trades.length > 0 && (
        <div className="stage11b-poison-route" aria-label="Kamuya açık kadeh rotası">
          {publicState.trades.map((trade, index) => (
            <span className="stage11b-poison-route-chip" key={`${trade.fromPlayerId}-${trade.toPlayerId}-${index}`}>
              {playerLabel(players, trade.fromPlayerId)} → {playerLabel(players, trade.toPlayerId)}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}

export function ZehirliKadehStage({
  publicState: rawPublicState,
  ownState: rawOwnState,
  players,
  selfPlayerId,
  now,
  isSpectator,
  onSubmit
}: ZehirliKadehStageProps): JSX.Element {
  const publicState = useMemo(() => parsePublicState(rawPublicState), [rawPublicState]);
  // Spectators intentionally receive no private-state read path at all.
  const ownState = useMemo(() => (isSpectator ? EMPTY_OWN_STATE : parseOwnState(rawOwnState)), [isSpectator, rawOwnState]);
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [submission, setSubmission] = useState<SubmissionState>(null);

  const livePlayers = useMemo(
    () => players.filter((player) => player.connected && player.currentGameParticipant && !player.eliminated).slice(0, 8),
    [players]
  );
  const targets = useMemo(
    () => livePlayers.filter((player) => player.id !== selfPlayerId),
    [livePlayers, selfPlayerId]
  );
  const targetIds = useMemo(() => new Set(targets.map((player) => player.id)), [targets]);
  const isFinished = publicState.finished;
  const isAccepted = !isSpectator && ownState.hasTraded;
  const isPending = submission?.kind === "pending";
  const canTrade = !isSpectator && !isFinished && ownState.canTrade && !isAccepted;
  const timeRemaining = publicState.phaseEndsAt === null
    ? null
    : Math.max(0, Math.ceil((publicState.phaseEndsAt - now) / 1000));

  useEffect(() => {
    if (selectedTargetId !== null && !targetIds.has(selectedTargetId)) {
      setSelectedTargetId(null);
      if (submission?.kind === "pending") {
        setSubmission({ kind: "rejected", targetPlayerId: submission.targetPlayerId });
      }
    }
  }, [selectedTargetId, submission, targetIds]);

  useEffect(() => {
    if (isAccepted || isFinished) {
      setSubmission(null);
      if (isAccepted) setSelectedTargetId(null);
      return;
    }
    if (submission?.kind === "pending" && now - submission.sentAt >= 5000) {
      setSubmission({ kind: "rejected", targetPlayerId: submission.targetPlayerId });
    }
  }, [isAccepted, isFinished, now, submission]);

  useEffect(() => {
    if (!canTrade) setSelectedTargetId(null);
  }, [canTrade]);

  const chooseTarget = useCallback((targetPlayerId: string): void => {
    if (!canTrade || !targetIds.has(targetPlayerId)) return;
    setSelectedTargetId((current) => current === targetPlayerId ? null : targetPlayerId);
    setSubmission((current) => current?.kind === "rejected" ? null : current);
  }, [canTrade, targetIds]);

  const submitTrade = useCallback((): void => {
    if (!canTrade || isPending || selectedTargetId === null || !targetIds.has(selectedTargetId)) {
      if (selectedTargetId !== null && !targetIds.has(selectedTargetId)) {
        setSelectedTargetId(null);
        setSubmission({ kind: "rejected", targetPlayerId: selectedTargetId });
      }
      return;
    }
    setSubmission({ kind: "pending", targetPlayerId: selectedTargetId, sentAt: now });
    onSubmit({ kind: "glass-trade", targetPlayerId: selectedTargetId });
  }, [canTrade, isPending, now, onSubmit, selectedTargetId, targetIds]);

  const privateStatus = !isSpectator && isFinished && ownState.finished && typeof ownState.poisoned === "boolean"
    ? ownState.poisoned
    : null;
  const selectedTarget = selectedTargetId === null ? null : targets.find((player) => player.id === selectedTargetId) ?? null;
  const selfStyle = { borderColor: "rgba(241, 173, 103, .75)" } satisfies CSSProperties;

  return (
    <section className="stage11b-poison-shell" aria-label="Zehirli Kadeh oyun alanı">
      <style>{stageStyles}</style>
      <header className="stage11b-poison-head">
        <div>
          <p className="stage11b-poison-kicker">kapalı devre · sahne 11.8B</p>
          <h2 className="stage11b-poison-title">Zehirli Kadeh</h2>
        </div>
        <span className="stage11b-poison-phase">
          {isFinished ? "tur tamamlandı" : timeRemaining === null ? "bağlantı açık" : `${timeRemaining}s kaldı`}
        </span>
      </header>

      <GlassChain players={livePlayers} />

      {!isFinished && !isSpectator && (
        <section className="stage11b-poison-panel" aria-label="Kadeh seçimi">
          <div className="stage11b-poison-panel-heading">
            <h3>Manyetik takas</h3>
            <p>{isAccepted ? "sunucu onayladı" : `${targets.length} uygun hedef`}</p>
          </div>

          {isAccepted ? (
            <p className="stage11b-poison-message">Takas kabul edildi. Sunucu tur süresini uzattı.</p>
          ) : targets.length === 0 ? (
            <p className="stage11b-poison-empty">Şu an bağlı ve oyunda olan başka oyuncu yok.</p>
          ) : (
            <>
              <div className="stage11b-poison-target-grid">
                {targets.map((player) => {
                  const isSelected = selectedTargetId === player.id;
                  return (
                    <button
                      className="stage11b-poison-target-button"
                      type="button"
                      key={player.id}
                      disabled={!canTrade}
                      onClick={() => chooseTarget(player.id)}
                      style={isSelected ? selfStyle : undefined}
                    >
                      <span className="stage11b-poison-avatar">{playerInitial(player.nickname)}</span>
                      <span className="stage11b-poison-target-name">{player.nickname}</span>
                      <small className="stage11b-poison-target-note">{isSelected ? "seçildi · değiştir" : "kadehi bağla"}</small>
                    </button>
                  );
                })}
              </div>
              <div className="stage11b-poison-submit-row">
                <p className="stage11b-poison-hint">
                  {selectedTarget ? `${selectedTarget.nickname} ile kadeh bağlantısı hazır.` : "Bir hedef seç; kararını göndermeden önce değiştirebilirsin."}
                </p>
                <button className="stage11b-poison-submit" type="button" disabled={!canTrade || isPending || selectedTarget === null} onClick={submitTrade}>
                  {isPending ? "İletiliyor…" : "Takas et"}
                </button>
              </div>
              {submission?.kind === "rejected" && (
                <p className="stage11b-poison-message stage11b-poison-message-warning">İstek güncelliğini yitirdi. Hedefi yeniden seçebilirsin.</p>
              )}
            </>
          )}
        </section>
      )}

      {!isFinished && isSpectator && (
        <section className="stage11b-poison-panel" aria-label="Seyirci görünümü">
          <p className="stage11b-poison-empty">Seyirci görünümü: zincir sürüyor. Tur sonucu açıklanana kadar özel durumlar gösterilmez.</p>
        </section>
      )}

      {!isSpectator && privateStatus !== null && (
        <div className="stage11b-poison-private-status">
          <strong style={{ color: privateStatus ? "var(--stage11b-poison-rose)" : "var(--stage11b-poison-cyan)" }}>
            {privateStatus ? "ZEHİRLİ" : "TEMİZ"}
          </strong>
          <small>Bu bilgi yalnızca senin kadehin için.</small>
        </div>
      )}

      {isFinished && <ResultGraph publicState={publicState} players={players} />}
    </section>
  );
}

export default ZehirliKadehStage;
