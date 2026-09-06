import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, JSX } from "react";
import type {
  CaprazAtesOwnState,
  CaprazAtesPublicState,
  JsonValue,
  MatchPlayerState
} from "@glix/shared";

export interface CaprazAtesStageProps {
  readonly publicState: unknown;
  readonly ownState: unknown | null;
  readonly players: readonly MatchPlayerState[];
  readonly selfPlayerId: string | null;
  readonly now: number;
  readonly isSpectator: boolean;
  readonly onSubmit: (payload: JsonValue) => void;
}

interface LocalChoice {
  readonly targetPlayerId: string | null;
  readonly sentAt: number;
  readonly token: number;
}

interface ArenaPoint {
  readonly x: number;
  readonly y: number;
}

const CROSSfire_STYLE = `
.stage11b-crossfire { --cf-ink: #f7f9ff; --cf-dim: #8f9bb8; --cf-muted: #55617e; --cf-bg: #060918; --cf-panel: rgba(11, 17, 39, .86); --cf-cyan: #5ce7ff; --cf-pink: #ff5fcf; --cf-gold: #ffd166; --cf-red: #ff718d; position: relative; display: grid; gap: clamp(.65rem, 2.5vw, 1rem); width: 100%; min-width: 0; color: var(--cf-ink); font-family: inherit; isolation: isolate; }
.stage11b-crossfire::before { position: absolute; z-index: -1; inset: 8% 4% 10%; border: 1px solid rgba(92, 231, 255, .08); border-radius: 2rem; background: radial-gradient(circle at 50% 42%, rgba(54, 103, 188, .15), transparent 53%), linear-gradient(135deg, rgba(255, 95, 207, .035), transparent 42%); content: ""; pointer-events: none; }
.stage11b-crossfire * { box-sizing: border-box; }
.stage11b-crossfire button { font: inherit; }
.stage11b-crossfire__header { display: flex; align-items: flex-start; justify-content: space-between; gap: .8rem; padding: .15rem .15rem 0; }
.stage11b-crossfire__eyebrow { display: block; color: var(--cf-cyan); font-size: clamp(.52rem, 1.6vw, .67rem); font-weight: 900; letter-spacing: .22em; line-height: 1.2; }
.stage11b-crossfire__title { display: block; margin-top: .28rem; font-size: clamp(1.04rem, 3.7vw, 1.5rem); font-weight: 950; letter-spacing: -.03em; line-height: 1.05; }
.stage11b-crossfire__subline { display: block; max-width: 34rem; margin-top: .35rem; color: var(--cf-dim); font-size: clamp(.58rem, 1.7vw, .72rem); line-height: 1.4; }
.stage11b-crossfire__timer { flex: 0 0 auto; min-width: 4.15rem; padding: .42rem .55rem .35rem; border: 1px solid rgba(92, 231, 255, .28); border-radius: .75rem; background: rgba(11, 23, 50, .72); box-shadow: 0 0 1.4rem rgba(92, 231, 255, .09); text-align: center; }
.stage11b-crossfire__timer strong { display: block; color: var(--cf-cyan); font-size: clamp(.98rem, 3.5vw, 1.35rem); font-variant-numeric: tabular-nums; line-height: 1; }
.stage11b-crossfire__timer small { display: block; margin-top: .22rem; color: var(--cf-dim); font-size: .45rem; font-weight: 900; letter-spacing: .14em; }
.stage11b-crossfire__timer.is-critical { border-color: rgba(255, 113, 141, .65); box-shadow: 0 0 1.4rem rgba(255, 113, 141, .14); }
.stage11b-crossfire__timer.is-critical strong { color: var(--cf-red); }
.stage11b-crossfire__reticle { position: relative; display: grid; place-items: center; min-height: clamp(10rem, 42vw, 17.5rem); overflow: hidden; border: 1px solid rgba(92, 231, 255, .18); border-radius: 1.35rem; background: radial-gradient(circle, rgba(54, 121, 174, .16), transparent 28%), repeating-linear-gradient(0deg, transparent 0 1.25rem, rgba(92, 231, 255, .035) 1.3rem 1.34rem), repeating-linear-gradient(90deg, transparent 0 1.25rem, rgba(92, 231, 255, .035) 1.3rem 1.34rem), #070b1d; box-shadow: inset 0 0 3rem rgba(0, 0, 0, .35); }
.stage11b-crossfire__reticle::before, .stage11b-crossfire__reticle::after { position: absolute; width: 72%; height: 72%; border: 1px solid rgba(92, 231, 255, .17); border-radius: 50%; content: ""; }
.stage11b-crossfire__reticle::after { width: 46%; height: 46%; border-color: rgba(255, 95, 207, .2); }
.stage11b-crossfire__reticle-lines { position: absolute; inset: 16% 8%; background: linear-gradient(90deg, transparent calc(50% - .5px), rgba(92, 231, 255, .18) calc(50% - .5px), rgba(92, 231, 255, .18) calc(50% + .5px), transparent calc(50% + .5px)), linear-gradient(0deg, transparent calc(50% - .5px), rgba(92, 231, 255, .18) calc(50% - .5px), rgba(92, 231, 255, .18) calc(50% + .5px), transparent calc(50% + .5px)); }
.stage11b-crossfire__reticle-core { position: relative; z-index: 1; display: grid; place-items: center; width: clamp(4.3rem, 20vw, 7rem); aspect-ratio: 1; border: 1px solid rgba(255, 95, 207, .7); border-radius: 50%; background: radial-gradient(circle, rgba(255, 95, 207, .2), rgba(7, 11, 29, .9) 66%); box-shadow: 0 0 1.7rem rgba(255, 95, 207, .23), inset 0 0 1rem rgba(92, 231, 255, .16); }
.stage11b-crossfire__reticle-core::before, .stage11b-crossfire__reticle-core::after { position: absolute; background: var(--cf-cyan); box-shadow: 0 0 .7rem var(--cf-cyan); content: ""; }
.stage11b-crossfire__reticle-core::before { width: 1.2rem; height: 1px; }
.stage11b-crossfire__reticle-core::after { width: 1px; height: 1.2rem; }
.stage11b-crossfire__reticle-label { position: relative; z-index: 2; display: grid; gap: .2rem; text-align: center; }
.stage11b-crossfire__reticle-label strong { font-size: clamp(.7rem, 2.4vw, .88rem); letter-spacing: .13em; }
.stage11b-crossfire__reticle-label small { color: var(--cf-dim); font-size: .45rem; font-weight: 900; letter-spacing: .16em; }
.stage11b-crossfire__reticle-corner { position: absolute; width: 1rem; height: 1rem; border-color: rgba(92, 231, 255, .62); border-style: solid; }
.stage11b-crossfire__reticle-corner:nth-child(1) { top: .8rem; left: .8rem; border-width: 1px 0 0 1px; }
.stage11b-crossfire__reticle-corner:nth-child(2) { top: .8rem; right: .8rem; border-width: 1px 1px 0 0; }
.stage11b-crossfire__reticle-corner:nth-child(3) { right: .8rem; bottom: .8rem; border-width: 0 1px 1px 0; }
.stage11b-crossfire__reticle-corner:nth-child(4) { bottom: .8rem; left: .8rem; border-width: 0 0 1px 1px; }
.stage11b-crossfire__controls { display: grid; gap: .62rem; padding: .78rem; border: 1px solid rgba(143, 155, 184, .18); border-radius: 1.1rem; background: var(--cf-panel); box-shadow: 0 .9rem 2.3rem rgba(0, 0, 0, .24); }
.stage11b-crossfire__control-heading { display: flex; align-items: baseline; justify-content: space-between; gap: .6rem; }
.stage11b-crossfire__control-heading strong { font-size: clamp(.68rem, 2.5vw, .86rem); letter-spacing: .04em; }
.stage11b-crossfire__control-heading small { color: var(--cf-dim); font-size: .48rem; font-weight: 900; letter-spacing: .11em; text-align: right; }
.stage11b-crossfire__targets { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .45rem; }
.stage11b-crossfire__target { display: grid; grid-template-columns: 1.65rem minmax(0, 1fr); grid-template-rows: auto auto; align-items: center; gap: .14rem .45rem; min-width: 0; min-height: 3.15rem; padding: .45rem .52rem; border: 1px solid rgba(143, 155, 184, .23); border-radius: .72rem; color: var(--cf-ink); background: rgba(5, 9, 25, .72); cursor: pointer; text-align: left; transition: border-color .16s ease, background-color .16s ease, box-shadow .16s ease, transform .16s ease; }
.stage11b-crossfire__target:hover:not(:disabled), .stage11b-crossfire__target:focus-visible:not(:disabled) { border-color: var(--cf-cyan); background: rgba(20, 38, 70, .82); box-shadow: 0 0 .9rem rgba(92, 231, 255, .14); outline: none; transform: translateY(-1px); }
.stage11b-crossfire__target:disabled { cursor: not-allowed; opacity: .55; }
.stage11b-crossfire__target-mark { display: grid; grid-row: span 2; place-items: center; width: 1.65rem; height: 1.65rem; border: 1px solid rgba(255, 95, 207, .45); border-radius: .52rem; color: var(--cf-pink); background: rgba(255, 95, 207, .1); font-size: .72rem; font-weight: 950; }
.stage11b-crossfire__target-name { min-width: 0; overflow: hidden; font-size: clamp(.57rem, 1.9vw, .72rem); font-weight: 900; text-overflow: ellipsis; white-space: nowrap; }
.stage11b-crossfire__target-hint { color: var(--cf-dim); font-size: .43rem; font-weight: 900; letter-spacing: .12em; }
.stage11b-crossfire__target.is-confirmed { border-color: rgba(255, 95, 207, .78); background: rgba(79, 24, 75, .4); box-shadow: 0 0 .9rem rgba(255, 95, 207, .14); }
.stage11b-crossfire__target.is-confirmed .stage11b-crossfire__target-hint { color: var(--cf-pink); }
.stage11b-crossfire__miss { min-height: 2.45rem; border: 1px dashed rgba(143, 155, 184, .38); border-radius: .72rem; color: var(--cf-dim); background: rgba(5, 9, 25, .42); cursor: pointer; font-size: .56rem; font-weight: 950; letter-spacing: .14em; }
.stage11b-crossfire__miss:hover:not(:disabled), .stage11b-crossfire__miss:focus-visible:not(:disabled) { border-color: var(--cf-gold); color: var(--cf-gold); outline: none; }
.stage11b-crossfire__miss:disabled { cursor: not-allowed; opacity: .5; }
.stage11b-crossfire__status { min-height: 1.05rem; margin: 0; color: var(--cf-dim); font-size: .55rem; font-weight: 800; line-height: 1.35; }
.stage11b-crossfire__status.is-pending { color: var(--cf-cyan); }
.stage11b-crossfire__status.is-rejected { color: var(--cf-gold); }
.stage11b-crossfire__status.is-confirmed { color: var(--cf-pink); }
.stage11b-crossfire__status.is-spectator { color: var(--cf-dim); }
.stage11b-crossfire__selection { margin: 0; color: var(--cf-ink); font-size: .62rem; line-height: 1.35; }
.stage11b-crossfire__selection strong { color: var(--cf-pink); }
.stage11b-crossfire__result-shell { display: grid; gap: .72rem; }
.stage11b-crossfire__result-heading { display: flex; align-items: end; justify-content: space-between; gap: .8rem; }
.stage11b-crossfire__result-heading strong { display: block; font-size: clamp(.88rem, 3vw, 1.15rem); letter-spacing: -.02em; }
.stage11b-crossfire__result-heading small { color: var(--cf-dim); font-size: .5rem; font-weight: 900; letter-spacing: .13em; text-align: right; }
.stage11b-crossfire__arena { position: relative; width: 100%; min-width: 0; aspect-ratio: 1.62; overflow: hidden; border: 1px solid rgba(92, 231, 255, .2); border-radius: 1.35rem; background: radial-gradient(circle at 50% 48%, rgba(76, 45, 128, .18), transparent 31%), radial-gradient(circle at 50% 50%, rgba(35, 116, 149, .12), transparent 64%), #06091a; box-shadow: inset 0 0 3rem rgba(0, 0, 0, .35), 0 0 1.2rem rgba(92, 231, 255, .06); }
.stage11b-crossfire__arena::before { position: absolute; inset: 9%; border: 1px solid rgba(92, 231, 255, .11); border-radius: 50%; box-shadow: 0 0 0 2.2rem rgba(92, 231, 255, .025), 0 0 0 4.4rem rgba(255, 95, 207, .018); content: ""; }
.stage11b-crossfire__arena svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.stage11b-crossfire__beam { fill: none; stroke-linecap: round; stroke-width: .7; }
.stage11b-crossfire__beam.is-mutual { stroke: #718099; opacity: .4; stroke-dasharray: 1.5 1.8; }
.stage11b-crossfire__beam.is-penalty { stroke: var(--cf-red); opacity: .88; filter: drop-shadow(0 0 2px rgba(255, 113, 141, .62)); }
.stage11b-crossfire__beam.is-reward { stroke: var(--cf-cyan); opacity: .92; filter: drop-shadow(0 0 2px rgba(92, 231, 255, .72)); }
.stage11b-crossfire__beam.is-miss { stroke: var(--cf-gold); opacity: .8; stroke-dasharray: 1 2; filter: drop-shadow(0 0 2px rgba(255, 209, 102, .62)); }
.stage11b-crossfire__node { position: absolute; display: grid; place-items: center; width: clamp(2.8rem, 11vw, 4rem); aspect-ratio: 1; transform: translate(-50%, -50%); border: 1px solid rgba(143, 155, 184, .62); border-radius: 50%; background: rgba(7, 12, 31, .94); box-shadow: 0 0 0 .28rem rgba(92, 231, 255, .035), 0 0 1rem rgba(92, 231, 255, .17); text-align: center; }
.stage11b-crossfire__node::after { position: absolute; inset: .28rem; border: 1px solid rgba(92, 231, 255, .2); border-radius: 50%; content: ""; }
.stage11b-crossfire__node.is-mutual { border-color: rgba(113, 128, 153, .68); box-shadow: 0 0 0 .28rem rgba(113, 128, 153, .03); opacity: .72; }
.stage11b-crossfire__node.is-penalty { border-color: var(--cf-red); box-shadow: 0 0 0 .28rem rgba(255, 113, 141, .06), 0 0 1.2rem rgba(255, 113, 141, .3); }
.stage11b-crossfire__node.is-reward { border-color: var(--cf-cyan); box-shadow: 0 0 0 .28rem rgba(92, 231, 255, .07), 0 0 1.2rem rgba(92, 231, 255, .3); }
.stage11b-crossfire__node.is-miss { border-color: var(--cf-gold); box-shadow: 0 0 0 .28rem rgba(255, 209, 102, .06), 0 0 1.2rem rgba(255, 209, 102, .25); }
.stage11b-crossfire__node-name { position: relative; z-index: 1; max-width: 86%; overflow: hidden; font-size: clamp(.42rem, 1.55vw, .58rem); font-weight: 950; text-overflow: ellipsis; white-space: nowrap; }
.stage11b-crossfire__node-score { position: absolute; z-index: 2; right: -.38rem; bottom: -.18rem; min-width: 1.25rem; padding: .18rem .22rem; border: 1px solid rgba(6, 9, 24, .9); border-radius: .45rem; color: var(--cf-ink); background: #202b4b; font-size: .48rem; font-weight: 950; line-height: 1; }
.stage11b-crossfire__node-score.is-positive { color: #03131b; background: var(--cf-cyan); }
.stage11b-crossfire__node-score.is-negative { color: #26040c; background: var(--cf-red); }
.stage11b-crossfire__miss-ray-label { position: absolute; z-index: 2; color: var(--cf-gold); font-size: .47rem; font-weight: 950; letter-spacing: .12em; pointer-events: none; }
.stage11b-crossfire__result-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .42rem; }
.stage11b-crossfire__result-card { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: .45rem; min-width: 0; padding: .48rem .55rem; border: 1px solid rgba(143, 155, 184, .18); border-radius: .7rem; background: rgba(11, 17, 39, .7); }
.stage11b-crossfire__result-card.is-mutual { border-color: rgba(113, 128, 153, .22); opacity: .72; }
.stage11b-crossfire__result-card.is-penalty { border-color: rgba(255, 113, 141, .32); }
.stage11b-crossfire__result-card.is-reward { border-color: rgba(92, 231, 255, .32); }
.stage11b-crossfire__result-card.is-miss { border-color: rgba(255, 209, 102, .32); }
.stage11b-crossfire__result-card-name { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.stage11b-crossfire__result-card-name strong { display: block; overflow: hidden; font-size: .58rem; text-overflow: ellipsis; white-space: nowrap; }
.stage11b-crossfire__result-card-name small { display: block; overflow: hidden; margin-top: .14rem; color: var(--cf-dim); font-size: .42rem; font-weight: 900; text-overflow: ellipsis; white-space: nowrap; }
.stage11b-crossfire__result-points { color: var(--cf-dim); font-size: .68rem; font-weight: 950; }
.stage11b-crossfire__result-points.is-positive { color: var(--cf-cyan); }
.stage11b-crossfire__result-points.is-negative { color: var(--cf-red); }
@media (max-width: 350px) { .stage11b-crossfire__targets, .stage11b-crossfire__result-list { grid-template-columns: 1fr; } .stage11b-crossfire__controls { padding: .62rem; } .stage11b-crossfire__target { min-height: 2.8rem; } }
@media (min-width: 650px) { .stage11b-crossfire { grid-template-columns: minmax(0, 1.2fr) minmax(15rem, .8fr); align-items: start; } .stage11b-crossfire__header, .stage11b-crossfire__result-shell { grid-column: 1 / -1; } .stage11b-crossfire__reticle { min-height: 22rem; } .stage11b-crossfire__controls { min-height: 100%; } }
@media (prefers-reduced-motion: reduce) { .stage11b-crossfire *, .stage11b-crossfire *::before, .stage11b-crossfire *::after { animation-duration: .001ms !important; animation-iteration-count: 1 !important; scroll-behavior: auto !important; transition-duration: .001ms !important; } }
`;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCaprazAtesPublicState(value: unknown): value is CaprazAtesPublicState {
  return isObject(value) && value.gameId === "capraz-ates" && value.kind === "capraz-ates" && typeof value.started === "boolean" && typeof value.finished === "boolean" && (value.endsAt === null || typeof value.endsAt === "number") && (value.results === null || Array.isArray(value.results));
}

function isCaprazAtesOwnState(value: unknown): value is CaprazAtesOwnState {
  return isObject(value) && value.gameId === "capraz-ates" && value.kind === "capraz-ates" && typeof value.hasSubmitted === "boolean" && Array.isArray(value.availableTargetIds) && (value.selectedTargetId === null || typeof value.selectedTargetId === "string") && typeof value.finished === "boolean";
}

function playerName(players: readonly MatchPlayerState[], playerId: string | null): string {
  if (!playerId) return "BOŞ ATIŞ";
  return players.find((player) => player.id === playerId)?.nickname ?? "BİLİNMİYOR";
}

function initials(nickname: string): string {
  const parts = nickname.trim().split(/\s+/).filter(Boolean);
  return (parts.length > 1 ? `${parts[0]?.[0] ?? ""}${parts.at(-1)?.[0] ?? ""}` : nickname.slice(0, 2)).toLocaleUpperCase("tr-TR");
}

function secondsLeft(deadline: number | null, now: number): number | null {
  return deadline === null ? null : Math.max(0, Math.ceil((deadline - now) / 1000));
}

function pointFor(index: number, total: number): ArenaPoint {
  const angle = -Math.PI / 2 + (Math.PI * 2 * index) / Math.max(1, total);
  return { x: 50 + Math.cos(angle) * 37, y: 50 + Math.sin(angle) * 35 };
}

function signedPoints(points: number): string {
  return points > 0 ? `+${points}` : String(points);
}

type CaprazAtesResult = NonNullable<CaprazAtesPublicState["results"]>[number];

function resultKind(result: CaprazAtesResult, resultByPlayer: ReadonlyMap<string, CaprazAtesResult>): "mutual" | "penalty" | "reward" | "miss" {
  if (result.targetPlayerId === null) return "miss";
  const targetResult = resultByPlayer.get(result.targetPlayerId);
  if (targetResult?.targetPlayerId === result.playerId) return "mutual";
  if (result.points < 0 || result.incomingCount > 0) return "penalty";
  return "reward";
}

function StatusLine({ kind, children }: { readonly kind: "pending" | "rejected" | "confirmed" | "spectator" | "neutral"; readonly children: string }): JSX.Element {
  const color = kind === "pending" ? "var(--cf-cyan)" : kind === "rejected" ? "var(--cf-gold)" : kind === "confirmed" ? "var(--cf-pink)" : undefined;
  return <p className="stage11b-crossfire__status" style={color ? { color } : undefined}>{children}</p>;
}

function ResultArena({ publicState, players }: { readonly publicState: CaprazAtesPublicState; readonly players: readonly MatchPlayerState[] }): JSX.Element {
  const results = publicState.results ?? [];
  const resultByPlayer = useMemo(() => new Map(results.map((result) => [result.playerId, result])), [results]);
  const positions = useMemo(() => new Map(results.map((result, index) => [result.playerId, pointFor(index, results.length)])), [results]);

  return (
    <div className="stage11b-crossfire__result-shell">
      <div className="stage11b-crossfire__result-heading">
        <div>
          <span className="stage11b-crossfire__eyebrow">ATEŞ HATTI AÇILDI</span>
          <strong>Çapraz bağlantılar çözüldü.</strong>
        </div>
        <small>{results.length} OYUNCU · SONUÇ ARENASI</small>
      </div>

      <div className="stage11b-crossfire__arena" aria-label="Çapraz Ateş sonuç arenası">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          {results.map((result) => {
            if (!result.targetPlayerId) {
              const from = positions.get(result.playerId);
              if (!from) return null;
              return <line key={`miss-${result.playerId}`} className="stage11b-crossfire__beam is-miss" x1={from.x} y1={from.y} x2="50" y2="50" />;
            }
            const from = positions.get(result.playerId);
            const to = positions.get(result.targetPlayerId);
            if (!from || !to) return null;
            const targetResult = resultByPlayer.get(result.targetPlayerId);
            const mutual = targetResult?.targetPlayerId === result.playerId;
            if (mutual && result.playerId > result.targetPlayerId) return null;
            const kind = mutual ? "mutual" : result.points < 0 || result.incomingCount > 0 ? "penalty" : "reward";
            return <line key={`beam-${result.playerId}-${result.targetPlayerId}`} className={`stage11b-crossfire__beam is-${kind}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} />;
          })}
        </svg>

        {results.map((result, index) => {
          const point = positions.get(result.playerId) ?? pointFor(index, results.length);
          const kind = resultKind(result, resultByPlayer);
          const name = playerName(players, result.playerId);
          const scoreClass = result.points > 0 ? "is-positive" : result.points < 0 ? "is-negative" : "";
          const style = { left: `${point.x}%`, top: `${point.y}%` } satisfies CSSProperties;
          return (
            <div key={result.playerId} className={`stage11b-crossfire__node is-${kind}`} style={style}>
              <span className="stage11b-crossfire__node-name">{name}</span>
              <span className={`stage11b-crossfire__node-score ${scoreClass}`}>{signedPoints(result.points)}</span>
            </div>
          );
        })}

        {results.map((result, index) => {
          if (result.targetPlayerId !== null) return null;
          const point = positions.get(result.playerId) ?? pointFor(index, results.length);
          const style = { left: `${point.x + (point.x < 50 ? -7 : 7)}%`, top: `${point.y + (point.y < 50 ? -4 : 4)}%` } satisfies CSSProperties;
          return <span key={`miss-label-${result.playerId}`} className="stage11b-crossfire__miss-ray-label" style={style}>BOŞ ATIŞ</span>;
        })}
      </div>

      <div className="stage11b-crossfire__result-list">
        {results.map((result) => {
          const kind = resultKind(result, resultByPlayer);
          const targetText = result.targetPlayerId === null ? "BOŞ ATIŞ" : `HEDEF · ${playerName(players, result.targetPlayerId)}`;
          const scoreClass = result.points > 0 ? "is-positive" : result.points < 0 ? "is-negative" : "";
          return (
            <div key={`result-${result.playerId}`} className={`stage11b-crossfire__result-card is-${kind}`}>
              <span className="stage11b-crossfire__result-card-name"><strong>{playerName(players, result.playerId)}</strong><small>{kind === "mutual" ? "KARŞILIKLI · SÖNÜMLENDİ" : kind === "penalty" ? "GELEN ATEŞ · CEZA" : kind === "reward" ? "HAT TEMİZ · ÖDÜL" : `${targetText} · GÜVENLİK ÖDÜLÜ`}</small></span>
              <b className={`stage11b-crossfire__result-points ${scoreClass}`}>{signedPoints(result.points)}</b>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CaprazAtesStage({ publicState, ownState, players, selfPlayerId, now, isSpectator, onSubmit }: CaprazAtesStageProps): JSX.Element {
  const state = isCaprazAtesPublicState(publicState) ? publicState : null;
  const privateState = !isSpectator && isCaprazAtesOwnState(ownState) ? ownState : null;
  const [localChoice, setLocalChoice] = useState<LocalChoice | null>(null);
  const [rejectedToken, setRejectedToken] = useState<number | null>(null);
  const [nextToken, setNextToken] = useState(0);

  const eligibleTargets = useMemo(
    () => players.filter((player) => player.id !== selfPlayerId && player.connected && player.currentGameParticipant && !player.eliminated),
    [players, selfPlayerId]
  );
  const eligibleTargetIds = useMemo(() => new Set(eligibleTargets.map((player) => player.id)), [eligibleTargets]);
  const serverHasSubmitted = Boolean(privateState?.hasSubmitted);
  const isFinished = Boolean(state?.finished || privateState?.finished);
  const remaining = secondsLeft(state?.endsAt ?? null, now);
  const isResult = Boolean(state?.finished && state.results);
  const roundKey = state ? `${state.started}:${state.endsAt ?? "none"}:${state.finished}` : "invalid";

  useEffect(() => {
    setLocalChoice(null);
    setRejectedToken(null);
  }, [roundKey]);

  useEffect(() => {
    if (!localChoice) return;
    if (serverHasSubmitted || isFinished) {
      setLocalChoice(null);
      setRejectedToken(null);
      return;
    }
    if (now - localChoice.sentAt > 1800) {
      setRejectedToken(localChoice.token);
      setLocalChoice(null);
    }
  }, [isFinished, localChoice, now, serverHasSubmitted]);

  if (!state) {
    return <section className="stage11b-crossfire" aria-label="Çapraz Ateş oyun alanı"><style>{CROSSfire_STYLE}</style><StatusLine kind="neutral">Oyun durumu bekleniyor.</StatusLine></section>;
  }

  const authoritativeTarget = serverHasSubmitted && privateState ? privateState.selectedTargetId : null;
  const draftTarget = localChoice && localChoice.targetPlayerId !== null && eligibleTargetIds.has(localChoice.targetPlayerId) ? localChoice.targetPlayerId : null;
  const visibleTarget = serverHasSubmitted ? authoritativeTarget : draftTarget;
  const isPending = Boolean(localChoice && !serverHasSubmitted && !isFinished);
  const isRejected = Boolean(rejectedToken !== null && !serverHasSubmitted && !isFinished);
  const canEdit = !isSpectator && !serverHasSubmitted && !isFinished;
  const timerCritical = remaining !== null && remaining <= 5;
  const timerLabel = remaining === null ? "—" : String(remaining).padStart(2, "0");
  const targetLabel = serverHasSubmitted
    ? authoritativeTarget ? playerName(players, authoritativeTarget) : "BOŞ ATIŞ"
    : visibleTarget ? playerName(players, visibleTarget) : localChoice?.targetPlayerId === null ? "BOŞ ATIŞ" : null;

  const submitChoice = (targetPlayerId: string | null): void => {
    if (!canEdit) return;
    if (targetPlayerId !== null && !eligibleTargetIds.has(targetPlayerId)) return;
    const token = nextToken + 1;
    setNextToken(token);
    setRejectedToken(null);
    setLocalChoice({ targetPlayerId, sentAt: now, token });
    onSubmit(targetPlayerId === null ? { kind: "crossfire-miss" } : { kind: "crossfire-target", targetPlayerId });
  };

  return (
    <section className="stage11b-crossfire" aria-label="Çapraz Ateş oyun alanı">
      <style>{CROSSfire_STYLE}</style>
      <header className="stage11b-crossfire__header">
        <div>
          <span className="stage11b-crossfire__eyebrow">STAGE 11.8B · ÇAPRAZ ATEŞ</span>
          <strong className="stage11b-crossfire__title">Hattını seç. İzini sakla.</strong>
          <span className="stage11b-crossfire__subline">Bağlantılar sonuç açılana kadar görünmez. Sadece canlı, oyunda ve kendin olmayan oyuncular seçilebilir.</span>
        </div>
        <div className={`stage11b-crossfire__timer${timerCritical ? " is-critical" : ""}`}>
          <strong>{timerLabel}</strong>
          <small>{remaining === null ? "BEKLE" : "SANİYE"}</small>
        </div>
      </header>

      {isResult ? (
        <ResultArena publicState={state} players={players} />
      ) : (
        <>
          <div className="stage11b-crossfire__reticle" aria-label="Gizli hedef retikülü">
            <span className="stage11b-crossfire__reticle-corner" aria-hidden="true" />
            <span className="stage11b-crossfire__reticle-corner" aria-hidden="true" />
            <span className="stage11b-crossfire__reticle-corner" aria-hidden="true" />
            <span className="stage11b-crossfire__reticle-corner" aria-hidden="true" />
            <span className="stage11b-crossfire__reticle-lines" aria-hidden="true" />
            <div className="stage11b-crossfire__reticle-core">
              <div className="stage11b-crossfire__reticle-label"><strong>{isSpectator ? "GÖZLEM" : visibleTarget ? "KİLİTLİ" : "HEDEF"}</strong><small>{isSpectator ? "ÖZEL NİYETLER GİZLİ" : "AĞ GİZLİ"}</small></div>
            </div>
          </div>

          {isSpectator ? (
            <div className="stage11b-crossfire__controls">
              <div className="stage11b-crossfire__control-heading"><strong>GİZLİ ATIŞ FAZI</strong><small>PUBLIC VIEW</small></div>
              <StatusLine kind="spectator">Oyuncu hedefleri sonuç açılana kadar gizlidir.</StatusLine>
            </div>
          ) : (
            <div className="stage11b-crossfire__controls">
              <div className="stage11b-crossfire__control-heading"><strong>HEDEF MATRİSİ</strong><small>{eligibleTargets.length} CANLI HEDEF</small></div>
              <div className="stage11b-crossfire__targets">
                {eligibleTargets.map((player) => {
                  const isCurrent = visibleTarget === player.id;
                  const style = isCurrent ? { borderColor: "rgba(255, 95, 207, .78)", backgroundColor: "rgba(79, 24, 75, .4)", boxShadow: "0 0 .9rem rgba(255, 95, 207, .14)" } satisfies CSSProperties : undefined;
                  return (
                    <button key={player.id} className="stage11b-crossfire__target" type="button" disabled={!canEdit} style={style} onClick={() => submitChoice(player.id)}>
                      <span className="stage11b-crossfire__target-mark">{initials(player.nickname)}</span>
                      <strong className="stage11b-crossfire__target-name">{player.nickname}</strong>
                      <small className="stage11b-crossfire__target-hint">{isCurrent ? "HEDEF GEÇİCİ KİLİTLİ" : "HEDEFLE"}</small>
                    </button>
                  );
                })}
              </div>
              <button className="stage11b-crossfire__miss" type="button" disabled={!canEdit} onClick={() => submitChoice(null)}>BOŞA SIK · İZ BIRAKMA</button>
              {isPending && <StatusLine kind="pending">Seçimin iletiliyor… Bu panel eski ağ yanıtında yeniden düzenlenebilir.</StatusLine>}
              {isRejected && <StatusLine kind="rejected">Seçim kabul edilmedi veya eskidi. Hedefleri yeniden seçebilirsin.</StatusLine>}
              {serverHasSubmitted && <StatusLine kind="confirmed">Atış kaydedildi. Sonuç açılana kadar hedefin gizli.</StatusLine>}
              {!isPending && !isRejected && !serverHasSubmitted && <StatusLine kind="neutral">Bir hedef seçebilir veya güvenli bir boşa atış yapabilirsin.</StatusLine>}
              {targetLabel && <p className="stage11b-crossfire__selection">Geçerli özel seçim: <strong>{targetLabel}</strong></p>}
            </div>
          )}
        </>
      )}
    </section>
  );
}
