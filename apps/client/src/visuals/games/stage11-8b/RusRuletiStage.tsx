import { useCallback, useEffect, useMemo, useState } from "react";
import type { JSX } from "react";
import type {
  JsonValue,
  MatchPlayerState,
  RusRuletiOwnState,
  RusRuletiPublicState
} from "@glix/shared";

interface RusRuletiStageProps {
  readonly publicState: unknown;
  readonly ownState: unknown | null;
  readonly players: readonly MatchPlayerState[];
  readonly selfPlayerId: string | null;
  readonly now: number;
  readonly isSpectator: boolean;
  readonly onSubmit: (payload: JsonValue) => void;
}

type LocalSubmissionStatus = "idle" | "pending" | "accepted" | "rejected";

interface LocalSubmission {
  readonly status: LocalSubmissionStatus;
  readonly targetPlayerId: string | null;
  readonly shotCount: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readPublicState(value: unknown): RusRuletiPublicState | null {
  if (!isRecord(value) || value.gameId !== "rus-ruleti" || value.kind !== "rus-ruleti") {
    return null;
  }
  return value as unknown as RusRuletiPublicState;
}

function readOwnState(value: unknown | null): RusRuletiOwnState | null {
  if (!isRecord(value) || value.gameId !== "rus-ruleti" || value.kind !== "rus-ruleti") {
    return null;
  }
  return value as unknown as RusRuletiOwnState;
}

function playerName(players: readonly MatchPlayerState[], playerId: string | null): string {
  return players.find((player) => player.id === playerId)?.nickname ?? "Bilinmeyen oyuncu";
}

function initials(nickname: string): string {
  const letters = nickname.trim().split(/\s+/).map((part) => part.slice(0, 1)).join("");
  return (letters || nickname.slice(0, 2) || "?").slice(0, 2).toUpperCase();
}

function secondsLeft(deadline: number | null, now: number): number | null {
  if (deadline === null) return null;
  return Math.max(0, Math.ceil((deadline - now) / 1000));
}

function scoreText(points: number): string {
  return `${points > 0 ? "+" : ""}${points}`;
}

function RailToken({
  player,
  isSelf,
  isHolder,
  isAlive,
  isSelected,
  disabled,
  onSelect
}: {
  readonly player: MatchPlayerState;
  readonly isSelf: boolean;
  readonly isHolder: boolean;
  readonly isAlive: boolean;
  readonly isSelected: boolean;
  readonly disabled: boolean;
  readonly onSelect: (playerId: string) => void;
}): JSX.Element {
  const content = (
    <>
      <span className="rr-token__avatar" aria-hidden="true">{initials(player.nickname)}</span>
      <span className="rr-token__copy">
        <strong>{player.nickname}</strong>
        <small>{isHolder ? "TUTUCU" : isSelf ? "KENDİN" : isAlive ? "CANLI" : "ELENDİ"}</small>
      </span>
      {isSelected && <span className="rr-token__check" aria-hidden="true">✓</span>}
    </>
  );

  if (!isAlive) {
    return <div className="rr-token rr-token--eliminated" aria-label={`${player.nickname}, elendi`}>{content}</div>;
  }

  return (
    <button
      className={`rr-token ${isHolder ? "rr-token--holder" : ""} ${isSelf ? "rr-token--self" : ""} ${isSelected ? "rr-token--selected" : ""}`}
      type="button"
      disabled={disabled}
      aria-pressed={isSelected}
      aria-label={`${player.nickname}${isSelf ? ", kendin" : ""}${isHolder ? ", silah tutucusu" : ""}`}
      onClick={() => onSelect(player.id)}
    >
      {content}
    </button>
  );
}

const RUS_RULES = `
  .rr-stage {
    --rr-bg: #060817;
    --rr-panel: rgba(14, 18, 38, 0.92);
    --rr-panel-soft: rgba(18, 25, 52, 0.72);
    --rr-line: rgba(182, 207, 255, 0.17);
    --rr-text: #f4f7ff;
    --rr-muted: #93a2c5;
    --rr-cyan: #72f4ff;
    --rr-pink: #ff55d8;
    --rr-violet: #9a7bff;
    --rr-amber: #ffc857;
    --rr-lime: #a8f46a;
    --rr-danger: #ff6f91;
    position: relative;
    isolation: isolate;
    display: grid;
    gap: clamp(0.55rem, 1.4vw, 1rem);
    width: 100%;
    min-width: 0;
    min-height: 0;
    padding: clamp(0.6rem, 1.3vw, 1rem);
    overflow: hidden;
    color: var(--rr-text);
    background:
      radial-gradient(circle at 72% 8%, rgba(114, 244, 255, 0.11), transparent 28%),
      radial-gradient(circle at 18% 105%, rgba(154, 123, 255, 0.11), transparent 34%),
      linear-gradient(145deg, #0a0e21, var(--rr-bg));
    border: 1px solid rgba(154, 123, 255, 0.2);
    border-radius: clamp(0.8rem, 2vw, 1.35rem);
    box-shadow: inset 0 1px rgba(255, 255, 255, 0.06), 0 1.4rem 3rem rgba(0, 0, 0, 0.22);
    font-family: inherit;
  }

  .rr-stage::before,
  .rr-stage::after {
    position: absolute;
    z-index: -1;
    border-radius: 50%;
    content: "";
    pointer-events: none;
  }

  .rr-stage::before {
    top: -9rem;
    right: 14%;
    width: 20rem;
    height: 20rem;
    border: 1px solid rgba(114, 244, 255, 0.08);
    box-shadow: 0 0 0 2rem rgba(114, 244, 255, 0.025), 0 0 0 4rem rgba(114, 244, 255, 0.014);
  }

  .rr-stage::after {
    right: 7%;
    bottom: -5rem;
    width: 11rem;
    height: 5rem;
    background: rgba(0, 0, 0, 0.35);
    filter: blur(1.4rem);
  }

  .rr-stage__header,
  .rr-stage__header-copy,
  .rr-stage__header-meta,
  .rr-stage__holder,
  .rr-stage__holder-copy,
  .rr-stage__stats,
  .rr-stage__stat,
  .rr-stage__status,
  .rr-stage__status-copy,
  .rr-cylinder-card,
  .rr-timeline__head,
  .rr-target-head,
  .rr-action-row,
  .rr-token,
  .rr-token__copy,
  .rr-timeline-event,
  .rr-result-row {
    min-width: 0;
  }

  .rr-stage__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.8rem;
  }

  .rr-stage__header-copy {
    display: grid;
    gap: 0.2rem;
  }

  .rr-eyebrow,
  .rr-kicker,
  .rr-stat span,
  .rr-target-head span,
  .rr-timeline__head span,
  .rr-chamber__label {
    color: var(--rr-cyan);
    font-size: clamp(0.47rem, 1.15vw, 0.62rem);
    font-weight: 900;
    letter-spacing: 0.16em;
    line-height: 1;
    text-transform: uppercase;
  }

  .rr-stage__header-copy h2 {
    margin: 0;
    color: var(--rr-text);
    font-size: clamp(1rem, 2.6vw, 1.65rem);
    letter-spacing: -0.045em;
    line-height: 1;
  }

  .rr-stage__header-copy p {
    max-width: 42rem;
    margin: 0.18rem 0 0;
    overflow: hidden;
    color: var(--rr-muted);
    font-size: clamp(0.55rem, 1.1vw, 0.68rem);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .rr-stage__header-meta {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    gap: 0.42rem;
  }

  .rr-live-pill,
  .rr-time-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    min-height: 1.75rem;
    border: 1px solid var(--rr-line);
    border-radius: 999px;
    padding: 0.35rem 0.55rem;
    background: rgba(6, 8, 23, 0.58);
    color: var(--rr-secondary, #c5d0e8);
    font-size: clamp(0.47rem, 1vw, 0.58rem);
    font-weight: 900;
    letter-spacing: 0.1em;
    white-space: nowrap;
  }

  .rr-live-pill::before {
    width: 0.35rem;
    height: 0.35rem;
    border-radius: 50%;
    background: var(--rr-lime);
    box-shadow: 0 0 0.7rem var(--rr-lime);
    content: "";
  }

  .rr-time-pill strong { color: var(--rr-amber); }

  .rr-stage__body {
    display: grid;
    grid-template-columns: minmax(0, 1.13fr) minmax(14rem, 0.87fr);
    gap: clamp(0.6rem, 1.3vw, 1rem);
    min-height: 0;
  }

  .rr-stage__visual,
  .rr-stage__interaction,
  .rr-stage__timeline {
    border: 1px solid var(--rr-line);
    border-radius: clamp(0.7rem, 1.4vw, 1rem);
    background: linear-gradient(145deg, rgba(18, 25, 53, 0.8), rgba(6, 9, 24, 0.84));
    box-shadow: inset 0 1px rgba(255, 255, 255, 0.035);
  }

  .rr-stage__visual {
    display: grid;
    gap: clamp(0.48rem, 1vw, 0.7rem);
    min-height: clamp(13rem, 31vw, 18rem);
    padding: clamp(0.6rem, 1.25vw, 0.85rem);
  }

  .rr-stage__holder {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.55rem;
    padding-bottom: 0.45rem;
    border-bottom: 1px solid rgba(182, 207, 255, 0.11);
  }

  .rr-stage__holder-copy { display: grid; gap: 0.22rem; }
  .rr-stage__holder-copy small { color: var(--rr-muted); font-size: 0.52rem; font-weight: 800; letter-spacing: 0.1em; }
  .rr-stage__holder-copy strong { overflow: hidden; color: var(--rr-text); font-size: clamp(0.73rem, 1.5vw, 0.9rem); text-overflow: ellipsis; white-space: nowrap; }

  .rr-holder-badge {
    flex: 0 0 auto;
    border: 1px solid rgba(255, 200, 87, 0.34);
    border-radius: 0.42rem;
    padding: 0.35rem 0.5rem;
    color: var(--rr-amber);
    background: rgba(255, 200, 87, 0.08);
    font-size: 0.5rem;
    font-weight: 1000;
    letter-spacing: 0.12em;
  }

  .rr-cylinder-card {
    position: relative;
    display: grid;
    min-height: 0;
    place-items: center;
    overflow: hidden;
    border: 1px solid rgba(114, 244, 255, 0.15);
    border-radius: 0.72rem;
    background: radial-gradient(ellipse at 50% 48%, rgba(114, 244, 255, 0.1), transparent 49%), #070b1c;
  }

  .rr-cylinder-card::before {
    position: absolute;
    inset: 12% 4%;
    border: 1px solid rgba(154, 123, 255, 0.12);
    border-radius: 50%;
    content: "";
    transform: rotate(-5deg);
  }

  .rr-cylinder-svg {
    width: min(100%, 31rem);
    height: auto;
    overflow: visible;
  }

  .rr-cylinder-back { fill: #111a37; stroke: rgba(182, 207, 255, 0.38); stroke-width: 2; }
  .rr-cylinder-shell { fill: #17244a; stroke: rgba(114, 244, 255, 0.55); stroke-width: 2; }
  .rr-cylinder-shell-dark { fill: #0b1128; stroke: rgba(182, 207, 255, 0.3); stroke-width: 2; }
  .rr-cylinder-rib { fill: none; stroke: rgba(114, 244, 255, 0.34); stroke-width: 1.5; }
  .rr-cylinder-rib--pink { stroke: rgba(255, 85, 216, 0.4); }
  .rr-cylinder-cap { fill: #0d1530; stroke: rgba(154, 123, 255, 0.68); stroke-width: 2; }
  .rr-cylinder-seal { fill: var(--rr-amber); stroke: #fff0b2; stroke-width: 1.2; }
  .rr-cylinder-glyph { fill: #0b1023; font-size: 13px; font-weight: 900; letter-spacing: 1px; }
  .rr-stage--exploded .rr-cylinder-cap { fill: rgba(255, 111, 145, 0.32); stroke: var(--rr-danger); }
  .rr-stage--exploded .rr-cylinder-seal { fill: var(--rr-danger); stroke: #ffd2da; }

  .rr-chamber {
    position: absolute;
    right: clamp(0.55rem, 2vw, 1.2rem);
    bottom: clamp(0.5rem, 1.5vw, 0.8rem);
    display: grid;
    gap: 0.16rem;
    width: clamp(6.7rem, 16vw, 9.8rem);
    border: 1px solid rgba(255, 200, 87, 0.28);
    border-radius: 0.58rem;
    padding: 0.48rem 0.58rem;
    background: rgba(5, 8, 20, 0.86);
    box-shadow: 0 0.65rem 1.4rem rgba(0, 0, 0, 0.26);
  }

  .rr-chamber strong { color: var(--rr-text); font-size: clamp(0.62rem, 1.3vw, 0.76rem); letter-spacing: 0.08em; }
  .rr-chamber small { color: var(--rr-muted); font-size: 0.48rem; font-weight: 800; line-height: 1.3; }
  .rr-chamber__lock { color: var(--rr-amber); font-size: 0.9rem; }
  .rr-chamber__risk { color: var(--rr-amber); font-size: 0.6rem; font-weight: 900; }

  .rr-stage__stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.4rem;
  }

  .rr-stat {
    display: grid;
    gap: 0.23rem;
    border-left: 2px solid rgba(114, 244, 255, 0.32);
    padding-left: 0.45rem;
  }

  .rr-stat b { overflow: hidden; color: var(--rr-text); font-size: clamp(0.68rem, 1.5vw, 0.83rem); text-overflow: ellipsis; white-space: nowrap; }
  .rr-stat--safe { border-left-color: var(--rr-lime); }
  .rr-stat--safe b { color: var(--rr-lime); }
  .rr-stat--danger { border-left-color: var(--rr-danger); }
  .rr-stat--danger b { color: var(--rr-danger); }

  .rr-stage__interaction {
    display: grid;
    align-content: start;
    gap: 0.68rem;
    padding: clamp(0.6rem, 1.25vw, 0.85rem);
  }

  .rr-target-head { display: flex; align-items: end; justify-content: space-between; gap: 0.45rem; }
  .rr-target-head strong { color: var(--rr-text); font-size: clamp(0.72rem, 1.5vw, 0.9rem); letter-spacing: -0.02em; }
  .rr-target-head small { color: var(--rr-muted); font-size: 0.5rem; font-weight: 800; text-align: right; }

  .rr-token-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.4rem;
    max-height: clamp(8.2rem, 20vw, 12.2rem);
    overflow: auto;
    padding: 0.1rem;
    scrollbar-width: thin;
  }

  .rr-token {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    min-height: 2.85rem;
    border: 1px solid rgba(182, 207, 255, 0.16);
    border-radius: 0.62rem;
    padding: 0.38rem;
    color: var(--rr-text);
    background: rgba(10, 15, 35, 0.78);
    text-align: left;
  }

  button.rr-token { cursor: pointer; font: inherit; }
  button.rr-token:hover:not(:disabled) { border-color: rgba(114, 244, 255, 0.58); background: rgba(114, 244, 255, 0.1); }
  button.rr-token:focus-visible,
  .rr-fire-button:focus-visible { outline: 3px solid var(--rr-amber); outline-offset: 2px; }
  button.rr-token:disabled { cursor: not-allowed; opacity: 0.54; }
  .rr-token--selected { border-color: var(--rr-cyan) !important; background: rgba(114, 244, 255, 0.14) !important; box-shadow: inset 0 0 0 1px rgba(114, 244, 255, 0.2); }
  .rr-token--holder { border-color: rgba(255, 200, 87, 0.38); }
  .rr-token--self .rr-token__avatar { color: #0b1023; background: var(--rr-violet); }
  .rr-token--eliminated { opacity: 0.46; filter: saturate(0.45); }
  .rr-token__avatar { display: grid; flex: 0 0 auto; width: 1.7rem; height: 1.7rem; place-items: center; border-radius: 0.45rem; color: #06101b; background: var(--rr-cyan); font-size: 0.55rem; font-weight: 1000; }
  .rr-token__copy { display: grid; gap: 0.18rem; overflow: hidden; }
  .rr-token__copy strong { overflow: hidden; font-size: 0.59rem; text-overflow: ellipsis; white-space: nowrap; }
  .rr-token__copy small { color: var(--rr-muted); font-size: 0.45rem; font-weight: 900; letter-spacing: 0.08em; }
  .rr-token__check { margin-left: auto; color: var(--rr-cyan); font-weight: 1000; }

  .rr-action-row { display: grid; gap: 0.45rem; }
  .rr-fire-button {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.6rem;
    min-height: 2.9rem;
    border: 1px solid rgba(255, 85, 216, 0.6);
    border-radius: 0.62rem;
    padding: 0.55rem 0.7rem;
    color: #fff3fc;
    background: linear-gradient(135deg, rgba(255, 85, 216, 0.85), rgba(154, 123, 255, 0.86));
    box-shadow: 0 0.7rem 1.4rem rgba(255, 85, 216, 0.14), inset 0 1px rgba(255, 255, 255, 0.5);
    cursor: pointer;
    font: inherit;
    font-size: 0.7rem;
    font-weight: 1000;
    letter-spacing: 0.09em;
    text-align: left;
  }

  .rr-fire-button span { color: rgba(255, 255, 255, 0.72); font-size: 0.48rem; letter-spacing: 0.11em; }
  .rr-fire-button:hover:not(:disabled) { filter: brightness(1.1); }
  .rr-fire-button:disabled { cursor: not-allowed; opacity: 0.42; }

  .rr-stage__status {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    min-height: 2.3rem;
    border: 1px solid rgba(182, 207, 255, 0.14);
    border-radius: 0.58rem;
    padding: 0.42rem 0.55rem;
    background: rgba(6, 9, 24, 0.72);
  }

  .rr-status-icon { display: grid; flex: 0 0 auto; width: 1.55rem; height: 1.55rem; place-items: center; border-radius: 0.42rem; color: #071023; background: var(--rr-cyan); font-size: 0.8rem; font-weight: 1000; }
  .rr-stage__status-copy { display: grid; gap: 0.15rem; }
  .rr-stage__status-copy strong { color: var(--rr-text); font-size: 0.59rem; letter-spacing: 0.08em; }
  .rr-stage__status-copy small { color: var(--rr-muted); font-size: 0.49rem; line-height: 1.3; }
  .rr-stage__status--pending .rr-status-icon { color: #17110a; background: var(--rr-amber); }
  .rr-stage__status--accepted .rr-status-icon { background: var(--rr-lime); }
  .rr-stage__status--rejected { border-color: rgba(255, 111, 145, 0.35); }
  .rr-stage__status--rejected .rr-status-icon { color: #280914; background: var(--rr-danger); }
  .rr-stage__status--spectator .rr-status-icon { color: #0a1024; background: var(--rr-violet); }

  .rr-stage__timeline {
    display: grid;
    gap: 0.55rem;
    padding: clamp(0.55rem, 1.1vw, 0.75rem);
  }

  .rr-timeline__head { display: flex; align-items: center; justify-content: space-between; gap: 0.45rem; }
  .rr-timeline__head strong { color: var(--rr-text); font-size: 0.67rem; letter-spacing: 0.06em; }
  .rr-timeline__head small { color: var(--rr-muted); font-size: 0.48rem; font-weight: 800; }
  .rr-timeline-track { display: flex; gap: 0.46rem; min-height: 3.3rem; overflow-x: auto; padding: 0.15rem 0 0.22rem; scrollbar-width: thin; }
  .rr-timeline-event { position: relative; display: grid; flex: 0 0 min(12rem, 32vw); align-content: center; gap: 0.18rem; border-left: 2px solid var(--rr-cyan); border-radius: 0.48rem; padding: 0.42rem 0.52rem; background: rgba(8, 13, 31, 0.82); }
  .rr-timeline-event::before { position: absolute; top: -0.35rem; left: -0.34rem; width: 0.55rem; height: 0.55rem; border: 2px solid #0a0e20; border-radius: 50%; background: var(--rr-cyan); content: ""; }
  .rr-timeline-event strong { overflow: hidden; color: var(--rr-text); font-size: 0.56rem; letter-spacing: 0.07em; text-overflow: ellipsis; white-space: nowrap; }
  .rr-timeline-event small { overflow: hidden; color: var(--rr-muted); font-size: 0.49rem; text-overflow: ellipsis; white-space: nowrap; }
  .rr-timeline-event--explosion { border-left-color: var(--rr-danger); background: rgba(255, 111, 145, 0.1); }
  .rr-timeline-event--explosion::before { background: var(--rr-danger); box-shadow: 0 0 0.8rem var(--rr-danger); }
  .rr-timeline-event--explosion strong { color: #ffabbc; }
  .rr-timeline-event--survivor { border-left-color: var(--rr-lime); }
  .rr-timeline-event--survivor::before { background: var(--rr-lime); }
  .rr-timeline-event--survivor strong { color: var(--rr-lime); }
  .rr-timeline-empty { color: var(--rr-muted); font-size: 0.55rem; }

  .rr-result-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr)); gap: 0.38rem; }
  .rr-result-row { display: grid; grid-template-columns: minmax(0, 1fr) auto auto; align-items: center; gap: 0.42rem; border: 1px solid rgba(182, 207, 255, 0.12); border-radius: 0.45rem; padding: 0.38rem 0.48rem; background: rgba(8, 13, 31, 0.68); }
  .rr-result-row strong { overflow: hidden; font-size: 0.55rem; text-overflow: ellipsis; white-space: nowrap; }
  .rr-result-row span { color: var(--rr-muted); font-size: 0.45rem; font-weight: 900; letter-spacing: 0.08em; }
  .rr-result-row b { color: var(--rr-cyan); font-size: 0.58rem; }
  .rr-result-row--survivor { border-color: rgba(168, 244, 106, 0.28); }
  .rr-result-row--survivor span,
  .rr-result-row--survivor b { color: var(--rr-lime); }
  .rr-result-row--eliminated span,
  .rr-result-row--eliminated b { color: var(--rr-danger); }

  .rr-rotate-note { display: none; }
  .rr-stage--loading { min-height: 12rem; place-items: center; color: var(--rr-muted); font-size: 0.7rem; }

  @media (max-width: 700px) {
    .rr-stage__body { grid-template-columns: minmax(0, 1fr) minmax(12.5rem, 0.82fr); }
    .rr-stage__visual { min-height: 12rem; }
    .rr-token-list { grid-template-columns: minmax(0, 1fr); }
  }

  @media (orientation: portrait) {
    .rr-stage { overflow: auto; }
    .rr-stage__body { grid-template-columns: minmax(0, 1fr); }
    .rr-stage__visual { min-height: 11.7rem; }
    .rr-token-list { max-height: none; grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .rr-rotate-note { display: block; margin: -0.18rem 0 0; color: var(--rr-muted); font-size: 0.48rem; font-weight: 800; letter-spacing: 0.08em; text-align: center; }
  }

  @media (max-height: 430px) and (orientation: landscape) {
    .rr-stage { gap: 0.48rem; padding: 0.55rem 0.7rem; }
    .rr-stage__visual { min-height: 10.4rem; }
    .rr-stage__interaction { gap: 0.45rem; padding: 0.58rem; }
    .rr-token { min-height: 2.38rem; padding: 0.28rem; }
    .rr-token__avatar { width: 1.45rem; height: 1.45rem; }
    .rr-target-head small { display: none; }
    .rr-fire-button { min-height: 2.35rem; }
  }

  @media (max-width: 560px) {
    .rr-stage { padding: 0.55rem; }
    .rr-stage__header p { white-space: normal; }
    .rr-stage__header-meta { gap: 0.25rem; }
    .rr-time-pill { padding-inline: 0.42rem; }
    .rr-stage__stats { gap: 0.3rem; }
    .rr-stat { padding-left: 0.34rem; }
    .rr-result-list { grid-template-columns: 1fr; }
  }

  @media (prefers-reduced-motion: reduce) {
    .rr-stage *, .rr-stage *::before, .rr-stage *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
  }
`;

export function RusRuletiStage({
  publicState: rawPublicState,
  ownState: rawOwnState,
  players,
  selfPlayerId,
  now,
  isSpectator,
  onSubmit
}: RusRuletiStageProps): JSX.Element {
  const publicState = readPublicState(rawPublicState);
  const ownState = !isSpectator ? readOwnState(rawOwnState) : null;
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [submission, setSubmission] = useState<LocalSubmission>({ status: "idle", targetPlayerId: null, shotCount: 0 });

  const livePlayers = useMemo(() => {
    if (!publicState) return [];
    const alive = new Set(publicState.alivePlayerIds);
    return players.filter((player) => alive.has(player.id) && player.connected && player.currentGameParticipant && !player.eliminated);
  }, [players, publicState]);

  const livePlayerIds = useMemo(() => new Set(livePlayers.map((player) => player.id)), [livePlayers]);
  const selectedTarget = selectedTargetId && livePlayerIds.has(selectedTargetId) ? selectedTargetId : null;
  const holderName = playerName(players, publicState?.currentHolderId ?? null);
  const isHolder = Boolean(ownState?.isHolder && selfPlayerId && publicState?.currentHolderId === selfPlayerId);
  const canShowRisk = Boolean(!isSpectator && isHolder && ownState && typeof ownState.riskPercent === "number");
  const seconds = secondsLeft(publicState?.phaseEndsAt ?? null, now);
  const isResults = Boolean(publicState?.finished || publicState?.subPhase === "results");
  const hasLiveTarget = livePlayers.length > 0;

  useEffect(() => {
    setSelectedTargetId(null);
    setSubmission((current) => current.status === "pending" ? { status: "accepted", targetPlayerId: current.targetPlayerId, shotCount: current.shotCount } : { status: "idle", targetPlayerId: null, shotCount: publicState?.shotCount ?? 0 });
  }, [publicState?.currentHolderId, publicState?.shotCount]);

  useEffect(() => {
    if (submission.status !== "pending" || !publicState || !submission.targetPlayerId) return;
    const shot = publicState.lastShot;
    if (shot?.shooterId === selfPlayerId && shot.targetPlayerId === submission.targetPlayerId) {
      setSubmission((current) => ({ ...current, status: "accepted" }));
    }
  }, [publicState, selfPlayerId, submission.status, submission.targetPlayerId]);

  const handleSelectTarget = useCallback((targetPlayerId: string): void => {
    if (isSpectator || !isHolder || isResults || submission.status === "pending") return;
    if (!livePlayerIds.has(targetPlayerId)) {
      setSubmission({ status: "rejected", targetPlayerId: null, shotCount: publicState?.shotCount ?? 0 });
      return;
    }
    setSelectedTargetId(targetPlayerId);
    if (submission.status !== "idle") setSubmission({ status: "idle", targetPlayerId: null, shotCount: publicState?.shotCount ?? 0 });
  }, [isHolder, isResults, isSpectator, livePlayerIds, publicState?.shotCount, submission.status]);

  const handleSubmit = useCallback((): void => {
    if (isSpectator || !isHolder || isResults || !selectedTarget || !livePlayerIds.has(selectedTarget) || ownState?.canShoot !== true) {
      if (selectedTarget && !livePlayerIds.has(selectedTarget)) {
        setSelectedTargetId(null);
        setSubmission({ status: "rejected", targetPlayerId: null, shotCount: publicState?.shotCount ?? 0 });
      }
      return;
    }
    setSubmission({ status: "pending", targetPlayerId: selectedTarget, shotCount: publicState?.shotCount ?? 0 });
    onSubmit({ kind: "russian-shot", targetPlayerId: selectedTarget });
  }, [isHolder, isResults, isSpectator, livePlayerIds, onSubmit, ownState?.canShoot, publicState?.shotCount, selectedTarget]);

  if (!publicState) {
    return <div className="rr-stage rr-stage--loading" aria-label="Rus Ruleti sahnesi hazırlanıyor"><style>{RUS_RULES}</style><span>SİLİNDİR KALİBRE EDİLİYOR…</span></div>;
  }

  const status = isSpectator
    ? { kind: "spectator" as const, icon: "◌", title: "CANLI İZLEME", detail: "Risk bilgisi ve kararlar yalnızca ilgili oyuncuya açıktır." }
    : submission.status === "pending"
      ? { kind: "pending" as const, icon: "…", title: "ATIŞ GÖNDERİLİYOR", detail: "Sunucu kararı bekleniyor." }
      : submission.status === "accepted"
        ? { kind: "accepted" as const, icon: "✓", title: "ATIŞ KABUL EDİLDİ", detail: "Yeni holder ve sonuçlar senkronize ediliyor." }
        : submission.status === "rejected"
          ? { kind: "rejected" as const, icon: "!", title: "SEÇİM REDDEDİLDİ", detail: "Hedef artık canlı olmayabilir; canlı token seç." }
          : isResults
            ? { kind: "accepted" as const, icon: "✦", title: "SONUÇLAR AÇIK", detail: "Atış izi ve hayatta kalanlar aşağıda." }
            : isHolder
              ? { kind: "ready" as const, icon: "◎", title: "HEDEF SEÇ", detail: "Kendin dahil canlı bir oyuncu seçebilirsin." }
              : { kind: "ready" as const, icon: "◉", title: `${holderName.toUpperCase()} KARAR VERİYOR`, detail: "Silah sana geçtiğinde hedef seçebilirsin." };

  const lastShot = publicState.lastShot;
  const lastShotTarget = lastShot ? playerName(players, lastShot.targetPlayerId) : null;
  const results = publicState.results ?? [];

  return (
    <div className={`rr-stage ${lastShot?.exploded ? "rr-stage--exploded" : ""}`} aria-label="Rus Ruleti premium risk sahnesi" aria-live="polite">
      <style>{RUS_RULES}</style>

      <header className="rr-stage__header">
        <div className="rr-stage__header-copy">
          <span className="rr-eyebrow">STAGE 11.8B / RUS RULETİ</span>
          <h2>{isResults ? "Risk açıldı. İz bırakıldı." : isHolder ? "Silah sende." : `${holderName} karar veriyor.`}</h2>
          <p>Kapalı hazne, tek karar, herkese açık sonuç.</p>
        </div>
        <div className="rr-stage__header-meta">
          <span className="rr-live-pill">{publicState.finished ? "SONUÇ" : "CANLI"}</span>
          {seconds !== null && !isResults && <span className="rr-time-pill"><span>SÜRE</span><strong>{seconds} sn</strong></span>}
        </div>
      </header>

      <div className="rr-stage__body">
        <section className="rr-stage__visual" aria-label="Kapalı risk haznesi ve holder durumu">
          <div className="rr-stage__holder">
            <div className="rr-stage__holder-copy">
              <small>SİLAH TUTUCUSU</small>
              <strong>{publicState.finished ? "Tur tamamlandı" : holderName}</strong>
            </div>
            <span className="rr-holder-badge">{publicState.finished ? "KİLİTLİ" : isHolder ? "SIRA SENDE" : "BEKLE"}</span>
          </div>

          <div className="rr-cylinder-card">
            <svg className="rr-cylinder-svg" viewBox="0 0 520 180" role="img" aria-label="Mühürlü silindir ve kapalı risk haznesi">
              <ellipse className="rr-cylinder-back" cx="261" cy="104" rx="172" ry="40" />
              <path className="rr-cylinder-shell" d="M88 50c0-22 77-39 172-39s172 17 172 39v58c0 22-77 40-172 40S88 130 88 108Z" />
              <ellipse className="rr-cylinder-shell-dark" cx="260" cy="50" rx="172" ry="40" />
              <ellipse className="rr-cylinder-rib" cx="260" cy="50" rx="144" ry="31" />
              <path className="rr-cylinder-rib" d="M132 32v76M172 20v112M213 13v142M307 13v142M348 20v132M388 32v76" />
              <path className="rr-cylinder-rib rr-cylinder-rib--pink" d="M104 70c42 17 97 25 156 25s114-8 156-25M105 82c42 17 96 24 155 24s113-7 155-24" />
              <ellipse className="rr-cylinder-cap" cx="426" cy="83" rx="25" ry="38" />
              <circle className="rr-cylinder-seal" cx="426" cy="83" r="11" />
              <text className="rr-cylinder-glyph" x="426" y="87" textAnchor="middle">RR</text>
            </svg>
            <div className="rr-chamber" aria-label="Risk haznesi mühürlü">
              <span className="rr-chamber__lock" aria-hidden="true">▣</span>
              <span className="rr-chamber__label">RİSK HAZNESİ</span>
              {canShowRisk ? <strong>%{ownState?.riskPercent}</strong> : <strong>MÜHÜRLÜ</strong>}
              <small>{canShowRisk ? "Bu bilgi yalnızca holder ekranında görünür." : "İçerik sonuç anına kadar kapalı."}</small>
            </div>
          </div>

          <div className="rr-stage__stats" aria-label="Tur istatistikleri">
            <div className="rr-stat rr-stat--safe"><span>HAYATTA</span><b>{publicState.alivePlayerIds.length} / {players.length}</b></div>
            <div className="rr-stat"><span>ATIŞ</span><b>{publicState.shotCount}</b></div>
            <div className={`rr-stat ${lastShot?.exploded ? "rr-stat--danger" : ""}`}><span>HAZNE</span><b>{lastShot ? lastShot.exploded ? "AÇILDI" : "KAPALI" : "SEALED"}</b></div>
          </div>
        </section>

        <section className="rr-stage__interaction" aria-label={isSpectator ? "Rus Ruleti canlı durum" : "Rus Ruleti hedef seçimi"}>
          <div className="rr-target-head">
            <div><span>HAYATTA KALANLAR</span><strong>Hedef tokenları</strong></div>
            <small>{hasLiveTarget ? `${livePlayers.length} canlı seçenek` : "Seçenek yok"}</small>
          </div>

          <div className="rr-token-list" role="list" aria-label="Canlı oyuncu tokenları">
            {players.map((player) => {
              const alive = livePlayerIds.has(player.id);
              return (
                <RailToken
                  key={player.id}
                  player={player}
                  isSelf={player.id === selfPlayerId}
                  isHolder={player.id === publicState.currentHolderId}
                  isAlive={alive}
                  isSelected={alive && selectedTarget === player.id}
                  disabled={isSpectator || !isHolder || isResults || submission.status === "pending"}
                  onSelect={handleSelectTarget}
                />
              );
            })}
          </div>

          {!isSpectator && isHolder && !isResults && (
            <div className="rr-action-row">
              <button className="rr-fire-button" type="button" disabled={!selectedTarget || ownState?.canShoot !== true || submission.status === "pending"} onClick={handleSubmit}>
                <span>{submission.status === "pending" ? "BEKLENİYOR…" : "ATIŞI KİLİTLE"}</span>
                <span>{selectedTarget ? playerName(players, selectedTarget) : "HEDEF SEÇ"}</span>
              </button>
            </div>
          )}

          <div className={`rr-stage__status rr-stage__status--${status.kind}`} role="status">
            <span className="rr-status-icon" aria-hidden="true">{status.icon}</span>
            <div className="rr-stage__status-copy"><strong>{status.title}</strong><small>{status.detail}</small></div>
          </div>
        </section>
      </div>

      <section className="rr-stage__timeline" aria-label="Atış sonuç zaman çizelgesi">
        <div className="rr-timeline__head"><div><span>SHOT TIMELINE</span><strong>Patlamalar ve hayatta kalanlar</strong></div><small>{results.length > 0 ? `${results.length} sonuç` : "İlk atış bekleniyor"}</small></div>
        <div className="rr-timeline-track" role="list" aria-label="Atış ve sonuç olayları">
          {lastShot && (
            <div className={`rr-timeline-event ${lastShot.exploded ? "rr-timeline-event--explosion" : ""}`} role="listitem">
              <strong>{lastShot.exploded ? "✦ PATLAMA" : "○ GÜVENLİ ATIŞ"}</strong>
              <small>{playerName(players, lastShot.shooterId)} → {lastShotTarget}</small>
            </div>
          )}
          {results.map((result) => (
            <div className={`rr-timeline-event ${result.survived ? "rr-timeline-event--survivor" : "rr-timeline-event--explosion"}`} key={result.playerId} role="listitem">
              <strong>{result.survived ? "✓ HAYATTA" : "✦ ELENDİ"}</strong>
              <small>{playerName(players, result.playerId)} · {scoreText(result.points)}</small>
            </div>
          ))}
          {!lastShot && results.length === 0 && <span className="rr-timeline-empty">Mühürlü silindir ilk kararı bekliyor.</span>}
        </div>
        {isResults && results.length > 0 && (
          <div className="rr-result-list" aria-label="Oyuncu sonuçları">
            {results.map((result) => (
              <div className={`rr-result-row ${result.survived ? "rr-result-row--survivor" : "rr-result-row--eliminated"}`} key={result.playerId}>
                <strong>{playerName(players, result.playerId)}</strong>
                <span>{result.survived ? "HAYATTA" : "ELENDİ"}</span>
                <b>{scoreText(result.points)}</b>
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="rr-rotate-note">YATAYDA EN İYİ DENEYİM · DİKEYDE KAYDIRARAK DEVAM ET</p>
    </div>
  );
}
