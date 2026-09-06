import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, JSX, KeyboardEvent } from "react";
import type {
  JsonValue,
  MatchPlayerState,
  SizmaOwnState,
  SizmaPublicState
} from "@glix/shared";

interface SizmaStageProps {
  readonly publicState: unknown;
  readonly ownState: unknown | null;
  readonly players: readonly MatchPlayerState[];
  readonly selfPlayerId: string | null;
  readonly now: number;
  readonly isSpectator: boolean;
  readonly onSubmit: (payload: JsonValue) => void;
}

type PendingAction =
  | { readonly kind: "clue"; readonly round: 1 | 2; readonly submittedAt: number }
  | { readonly kind: "ready"; readonly submittedAt: number }
  | { readonly kind: "vote"; readonly targetPlayerId: string; readonly submittedAt: number }
  | null;

const MAX_CLUE_LENGTH = 72;
const VOTE_DURATION_MS = 30_000;

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isStringArray(value: unknown): value is readonly string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isNumberArray(value: unknown): value is readonly number[] {
  return Array.isArray(value) && value.every((item) => typeof item === "number");
}

function isClueTokenArray(value: unknown): value is SizmaPublicState["clueTokens"] {
  return Array.isArray(value) && value.every((item) => isObject(item) && typeof item.playerId === "string" && (item.round === 1 || item.round === 2) && typeof item.text === "string");
}

function isSizmaPublicState(value: unknown): value is SizmaPublicState {
  if (!isObject(value) || value.gameId !== "sizma" || value.kind !== "sizma") return false;
  const subPhase = value.subPhase;
  const voteCounts = value.voteCounts;
  const topVotedPlayerIds = value.topVotedPlayerIds;
  return (
    typeof value.started === "boolean" &&
    (subPhase === "clue" || subPhase === "ready-for-vote" || subPhase === "vote" || subPhase === "results") &&
    (value.clueRound === 1 || value.clueRound === 2) &&
    (typeof value.clueTurnPlayerId === "string" || value.clueTurnPlayerId === null) &&
    typeof value.clueTurnIndex === "number" &&
    typeof value.clueTurnsCompleted === "number" &&
    typeof value.totalClueTurns === "number" &&
    isClueTokenArray(value.clueTokens) &&
    isStringArray(value.readyPlayerIds) &&
    (typeof value.voteEndsAt === "number" || value.voteEndsAt === null) &&
    isStringArray(value.votedPlayerIds) &&
    (voteCounts === null || (Array.isArray(voteCounts) && voteCounts.every((item) => isObject(item) && typeof item.playerId === "string" && typeof item.votes === "number"))) &&
    (topVotedPlayerIds === null || isStringArray(topVotedPlayerIds)) &&
    (typeof value.outsiderPlayerId === "string" || value.outsiderPlayerId === null) &&
    (typeof value.commonWord === "string" || value.commonWord === null) &&
    (typeof value.outsiderWord === "string" || value.outsiderWord === null) &&
    (typeof value.outsiderCaught === "boolean" || value.outsiderCaught === null) &&
    typeof value.finished === "boolean"
  );
}

function isSizmaOwnState(value: unknown): value is SizmaOwnState {
  return isObject(value) && value.gameId === "sizma" && value.kind === "sizma" &&
    (value.role === "normal" || value.role === "outsider") &&
    typeof value.assignedWord === "string" &&
    (value.clueRound === 1 || value.clueRound === 2) &&
    isNumberArray(value.completedClueRounds) &&
    typeof value.canCompleteClue === "boolean" &&
    typeof value.canReadyForVote === "boolean" &&
    typeof value.hasVoted === "boolean" &&
    typeof value.finished === "boolean";
}

function playerName(players: readonly MatchPlayerState[], playerId: string | null): string {
  if (!playerId) return "Oyuncu";
  return players.find((player) => player.id === playerId)?.nickname ?? "Oyuncu";
}

function initials(nickname: string): string {
  const letters = nickname.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  return letters.map((part) => part[0] ?? "?").join("").toLocaleUpperCase("tr-TR");
}

function secondsLeft(deadline: number | null, now: number): number {
  return deadline === null ? 0 : Math.max(0, Math.ceil((deadline - now) / 1000));
}

function phaseLabel(publicState: SizmaPublicState): string {
  if (!publicState.started) return "BORU AĞI BEKLİYOR";
  if (publicState.subPhase === "clue") return `İPUCU TURU ${publicState.clueRound}/2`;
  if (publicState.subPhase === "ready-for-vote") return "OYLAMAYA HAZIRLIK";
  if (publicState.subPhase === "vote") return "OYLAMA · 30 SN";
  return "SONUÇ";
}

const STYLES = `
  .stage11b-sizma {
    --stage11b-sizma-bg: #070b15;
    --stage11b-sizma-panel: rgba(15, 23, 39, 0.88);
    --stage11b-sizma-panel-soft: rgba(24, 35, 57, 0.72);
    --stage11b-sizma-line: rgba(151, 174, 208, 0.18);
    --stage11b-sizma-muted: #8f9db4;
    --stage11b-sizma-text: #edf5ff;
    --stage11b-sizma-cyan: #5de8ff;
    --stage11b-sizma-violet: #a993ff;
    --stage11b-sizma-amber: #ffcc78;
    --stage11b-sizma-red: #ff7182;
    box-sizing: border-box;
    width: 100%;
    min-height: min(760px, 100%);
    padding: clamp(12px, 2.5vw, 28px);
    color: var(--stage11b-sizma-text);
    background:
      radial-gradient(circle at 50% 0%, rgba(78, 102, 168, 0.22), transparent 42%),
      linear-gradient(150deg, #080c16 0%, var(--stage11b-sizma-bg) 58%, #0b1220 100%);
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    overflow: hidden;
  }

  .stage11b-sizma *,
  .stage11b-sizma *::before,
  .stage11b-sizma *::after { box-sizing: border-box; }

  .stage11b-sizma-shell {
    width: min(1180px, 100%);
    margin: 0 auto;
    display: grid;
    gap: 14px;
  }

  .stage11b-sizma-topbar,
  .stage11b-sizma-panel,
  .stage11b-sizma-secret,
  .stage11b-sizma-player-card,
  .stage11b-sizma-result-card {
    border: 1px solid var(--stage11b-sizma-line);
    background: linear-gradient(145deg, rgba(24, 36, 59, 0.9), var(--stage11b-sizma-panel));
    box-shadow: 0 18px 50px rgba(0, 0, 0, 0.24), inset 0 1px rgba(255, 255, 255, 0.05);
  }

  .stage11b-sizma-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 13px 16px;
    border-radius: 18px;
  }

  .stage11b-sizma-brand { display: grid; gap: 3px; min-width: 0; }
  .stage11b-sizma-kicker,
  .stage11b-sizma-micro {
    color: var(--stage11b-sizma-cyan);
    font-size: 0.64rem;
    font-weight: 800;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }
  .stage11b-sizma-title { margin: 0; font-size: clamp(1rem, 2.2vw, 1.35rem); letter-spacing: -0.03em; }
  .stage11b-sizma-phase-chip {
    flex: 0 0 auto;
    padding: 8px 11px;
    border: 1px solid rgba(93, 232, 255, 0.28);
    border-radius: 999px;
    color: #d9fbff;
    background: rgba(37, 116, 135, 0.2);
    font-size: 0.66rem;
    font-weight: 800;
    letter-spacing: 0.11em;
    white-space: nowrap;
  }

  .stage11b-sizma-board {
    position: relative;
    isolation: isolate;
    min-height: 260px;
    overflow: hidden;
    border: 1px solid rgba(121, 153, 201, 0.18);
    border-radius: 24px;
    background:
      radial-gradient(circle at 50% 46%, rgba(70, 102, 168, 0.18), transparent 25%),
      linear-gradient(160deg, rgba(11, 18, 33, 0.96), rgba(6, 10, 20, 0.98));
  }
  .stage11b-sizma-board::before,
  .stage11b-sizma-board::after {
    content: "";
    position: absolute;
    z-index: -1;
    border-radius: 50%;
    filter: blur(1px);
    pointer-events: none;
  }
  .stage11b-sizma-board::before { inset: 18% 35%; background: rgba(93, 232, 255, 0.09); box-shadow: 0 0 100px rgba(93, 232, 255, 0.16); }
  .stage11b-sizma-board::after { inset: auto 15% 10%; height: 1px; background: rgba(93, 232, 255, 0.2); box-shadow: 0 0 28px rgba(93, 232, 255, 0.35); }
  .stage11b-sizma-pipes { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0.9; pointer-events: none; }
  .stage11b-sizma-pipe-shadow { stroke: rgba(0, 0, 0, 0.62); stroke-width: 17; fill: none; stroke-linecap: round; stroke-linejoin: round; }
  .stage11b-sizma-pipe { stroke: rgba(126, 157, 194, 0.64); stroke-width: 11; fill: none; stroke-linecap: round; stroke-linejoin: round; }
  .stage11b-sizma-pipe-glow { stroke: rgba(93, 232, 255, 0.3); stroke-width: 2; fill: none; stroke-linecap: round; stroke-linejoin: round; }
  .stage11b-sizma-node { fill: #121e31; stroke: rgba(93, 232, 255, 0.52); stroke-width: 2; }
  .stage11b-sizma-board-copy { position: absolute; inset: 20px 22px auto; display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; }
  .stage11b-sizma-board-copy strong { display: block; margin-top: 4px; font-size: clamp(0.92rem, 2vw, 1.1rem); }
  .stage11b-sizma-board-copy-right { color: var(--stage11b-sizma-muted); text-align: right; font-size: 0.74rem; line-height: 1.45; }
  .stage11b-sizma-valve-wrap { position: absolute; inset: 50% auto auto 50%; transform: translate(-50%, -43%); display: grid; justify-items: center; gap: 9px; }
  .stage11b-sizma-valve {
    position: relative;
    display: grid;
    place-items: center;
    width: clamp(84px, 14vw, 112px);
    aspect-ratio: 1;
    border: 10px solid #283952;
    border-radius: 50%;
    color: #dffbff;
    background: radial-gradient(circle at 36% 30%, #355d7c, #122235 58%, #0b1423);
    box-shadow: 0 0 0 3px rgba(93, 232, 255, 0.16), 0 0 34px rgba(93, 232, 255, 0.2), inset 0 5px 8px rgba(255,255,255,0.1), inset 0 -10px 15px rgba(0,0,0,0.4);
    cursor: pointer;
    transition: transform 150ms ease, filter 150ms ease, box-shadow 150ms ease;
  }
  .stage11b-sizma-valve::before { content: ""; position: absolute; width: 70%; height: 12px; border-radius: 99px; background: #6f9bb7; transform: rotate(-28deg); box-shadow: 0 2px 4px rgba(0,0,0,0.4); }
  .stage11b-sizma-valve::after { content: ""; position: absolute; width: 12px; height: 70%; border-radius: 99px; background: #6f9bb7; transform: rotate(-28deg); box-shadow: 0 2px 4px rgba(0,0,0,0.4); }
  .stage11b-sizma-valve span { position: relative; z-index: 1; display: grid; place-items: center; width: 30px; aspect-ratio: 1; border: 1px solid rgba(255,255,255,0.25); border-radius: 50%; background: #15263b; font-size: 0.62rem; font-weight: 900; }
  .stage11b-sizma-valve:not(:disabled):hover { filter: brightness(1.15); transform: scale(1.04); }
  .stage11b-sizma-valve:not(:disabled):active { transform: scale(0.95) rotate(4deg); box-shadow: 0 0 0 3px rgba(93, 232, 255, 0.24), 0 0 48px rgba(93, 232, 255, 0.32), inset 0 5px 8px rgba(255,255,255,0.1); }
  .stage11b-sizma-valve:focus-visible { outline: 3px solid var(--stage11b-sizma-amber); outline-offset: 5px; }
  .stage11b-sizma-valve:disabled { cursor: not-allowed; filter: saturate(0.35); opacity: 0.72; }
  .stage11b-sizma-valve-caption { color: var(--stage11b-sizma-muted); font-size: 0.67rem; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; }

  .stage11b-sizma-grid { display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(270px, 0.65fr); gap: 14px; align-items: start; }
  .stage11b-sizma-panel { border-radius: 20px; padding: clamp(15px, 2vw, 22px); }
  .stage11b-sizma-panel-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 15px; }
  .stage11b-sizma-panel-heading h2 { margin: 3px 0 0; font-size: clamp(1.05rem, 2.4vw, 1.4rem); letter-spacing: -0.03em; }
  .stage11b-sizma-round-badge { flex: 0 0 auto; min-width: 42px; padding: 8px 9px; border: 1px solid rgba(169, 147, 255, 0.34); border-radius: 12px; color: #e9e2ff; background: rgba(93, 71, 168, 0.2); text-align: center; font-size: 0.78rem; font-weight: 900; }
  .stage11b-sizma-instruction { margin: 0 0 15px; color: #b8c5d8; font-size: 0.84rem; line-height: 1.6; }
  .stage11b-sizma-form { display: grid; gap: 10px; }
  .stage11b-sizma-textarea { width: 100%; min-height: 88px; resize: vertical; border: 1px solid rgba(135, 162, 201, 0.25); border-radius: 14px; padding: 13px 14px; color: var(--stage11b-sizma-text); background: rgba(5, 10, 19, 0.65); font: inherit; line-height: 1.45; outline: none; }
  .stage11b-sizma-textarea::placeholder { color: #6e7b91; }
  .stage11b-sizma-textarea:focus { border-color: rgba(93, 232, 255, 0.8); box-shadow: 0 0 0 3px rgba(93, 232, 255, 0.12); }
  .stage11b-sizma-textarea:disabled { cursor: not-allowed; opacity: 0.65; }
  .stage11b-sizma-form-meta { display: flex; justify-content: space-between; gap: 8px; color: var(--stage11b-sizma-muted); font-size: 0.7rem; }
  .stage11b-sizma-button { min-height: 44px; border: 1px solid rgba(93, 232, 255, 0.4); border-radius: 12px; padding: 10px 14px; color: #061119; background: linear-gradient(135deg, #83f0ff, #8eafff); font: inherit; font-weight: 900; letter-spacing: 0.05em; cursor: pointer; box-shadow: 0 9px 22px rgba(46, 158, 185, 0.18); }
  .stage11b-sizma-button:hover:not(:disabled) { filter: brightness(1.08); }
  .stage11b-sizma-button:active:not(:disabled) { transform: translateY(1px); }
  .stage11b-sizma-button:focus-visible,
  .stage11b-sizma-player-card:focus-visible { outline: 3px solid var(--stage11b-sizma-amber); outline-offset: 3px; }
  .stage11b-sizma-button:disabled { cursor: not-allowed; color: #8d9aae; background: #263346; box-shadow: none; }
  .stage11b-sizma-button-secondary { color: #dbe6f7; background: rgba(52, 69, 96, 0.64); box-shadow: none; }
  .stage11b-sizma-lock-note { display: flex; align-items: center; gap: 8px; margin: 0; padding: 11px 12px; border: 1px solid rgba(143, 157, 180, 0.17); border-radius: 12px; color: #abb9ce; background: rgba(12, 20, 33, 0.52); font-size: 0.78rem; line-height: 1.45; }
  .stage11b-sizma-lock-note span { color: var(--stage11b-sizma-amber); font-size: 1rem; }
  .stage11b-sizma-progress { display: grid; gap: 7px; margin-top: 16px; }
  .stage11b-sizma-progress-top { display: flex; justify-content: space-between; gap: 10px; color: var(--stage11b-sizma-muted); font-size: 0.7rem; }
  .stage11b-sizma-progress-track { height: 6px; overflow: hidden; border-radius: 99px; background: rgba(122, 143, 178, 0.18); }
  .stage11b-sizma-progress-fill { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--stage11b-sizma-cyan), var(--stage11b-sizma-violet)); transition: width 220ms ease; }
  .stage11b-sizma-clue-stream { display: grid; gap: 5px; max-height: 108px; margin-top: 12px; overflow: hidden; }
  .stage11b-sizma-clue-stream > span { display: grid; grid-template-columns: minmax(0, auto) auto minmax(0, 1fr); align-items: baseline; gap: 6px; min-width: 0; padding: 6px 8px; border-left: 2px solid rgba(93, 232, 255, 0.35); color: #b9c7d8; background: rgba(11, 25, 40, 0.42); font-size: 0.66rem; line-height: 1.35; }
  .stage11b-sizma-clue-stream b { overflow: hidden; color: #f1f6ff; text-overflow: ellipsis; white-space: nowrap; }
  .stage11b-sizma-clue-stream small { color: var(--stage11b-sizma-cyan); font-size: 0.54rem; font-weight: 900; }
  .stage11b-sizma-clue-stream > span:last-child { color: #f5dcaa; }

  .stage11b-sizma-secret { display: grid; gap: 8px; padding: 17px; border-color: rgba(255, 204, 120, 0.27); background: linear-gradient(145deg, rgba(61, 45, 31, 0.62), rgba(24, 28, 41, 0.92)); }
  .stage11b-sizma-personal-word { font-size: clamp(1.55rem, 4vw, 2.2rem); letter-spacing: 0.08em; color: #fff1d3; }
  .stage11b-sizma-secret-note { color: #bca987; font-size: 0.72rem; line-height: 1.45; }
  .stage11b-sizma-secret-divider { width: 100%; height: 1px; background: rgba(255, 204, 120, 0.18); }
  .stage11b-sizma-observer-card { display: grid; gap: 8px; padding: 17px; border: 1px dashed rgba(143, 157, 180, 0.24); border-radius: 16px; color: #b7c4d7; background: rgba(8, 14, 25, 0.52); }
  .stage11b-sizma-observer-card strong { color: #eff6ff; font-size: 0.98rem; }
  .stage11b-sizma-observer-card p { margin: 0; font-size: 0.78rem; line-height: 1.5; }
  .stage11b-sizma-status { margin: 12px 0 0; color: var(--stage11b-sizma-amber); font-size: 0.76rem; line-height: 1.45; }

  .stage11b-sizma-ready-list { display: grid; gap: 8px; margin-top: 15px; }
  .stage11b-sizma-ready-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 12px; border: 1px solid rgba(135, 162, 201, 0.15); border-radius: 12px; background: rgba(7, 13, 24, 0.4); font-size: 0.8rem; }
  .stage11b-sizma-ready-state { color: var(--stage11b-sizma-muted); font-size: 0.68rem; font-weight: 900; letter-spacing: 0.08em; }
  .stage11b-sizma-ready-state.is-ready { color: var(--stage11b-sizma-cyan); }
  .stage11b-sizma-vote-meter { display: flex; align-items: center; gap: 10px; margin: 0 0 15px; }
  .stage11b-sizma-countdown { display: grid; place-items: center; min-width: 58px; padding: 8px 6px; border: 1px solid rgba(255, 113, 130, 0.34); border-radius: 12px; color: #ffd8de; background: rgba(126, 35, 56, 0.27); font-size: 1.35rem; font-weight: 900; line-height: 1; }
  .stage11b-sizma-countdown small { display: block; margin-top: 4px; color: #cc8996; font-size: 0.58rem; letter-spacing: 0.08em; }
  .stage11b-sizma-vote-meter-copy { display: grid; gap: 4px; color: #bdcbe0; font-size: 0.76rem; line-height: 1.35; }
  .stage11b-sizma-vote-meter-copy strong { color: #f3f7ff; font-size: 0.88rem; }
  .stage11b-sizma-vote-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(135px, 1fr)); gap: 9px; }
  .stage11b-sizma-player-card { display: grid; grid-template-columns: auto 1fr; align-items: center; gap: 9px; min-height: 66px; padding: 10px; border-radius: 15px; color: var(--stage11b-sizma-text); text-align: left; cursor: pointer; }
  .stage11b-sizma-player-card:hover:not(:disabled) { border-color: rgba(93, 232, 255, 0.56); transform: translateY(-1px); }
  .stage11b-sizma-player-card.is-selected { border-color: var(--stage11b-sizma-cyan); background: linear-gradient(145deg, rgba(24, 86, 105, 0.65), rgba(24, 35, 57, 0.92)); box-shadow: 0 0 0 2px rgba(93, 232, 255, 0.12), 0 14px 25px rgba(23, 150, 178, 0.14); }
  .stage11b-sizma-player-card.is-locked { cursor: not-allowed; opacity: 0.6; }
  .stage11b-sizma-player-avatar { display: grid; place-items: center; width: 34px; aspect-ratio: 1; border: 1px solid rgba(169, 147, 255, 0.42); border-radius: 11px; color: #e6ddff; background: rgba(93, 71, 168, 0.26); font-size: 0.73rem; font-weight: 900; }
  .stage11b-sizma-player-copy { min-width: 0; display: grid; gap: 4px; }
  .stage11b-sizma-player-copy strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.78rem; }
  .stage11b-sizma-player-copy small { color: var(--stage11b-sizma-muted); font-size: 0.63rem; }
  .stage11b-sizma-vote-actions { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 14px; }
  .stage11b-sizma-vote-selection { min-height: 18px; color: var(--stage11b-sizma-muted); font-size: 0.73rem; }

  .stage11b-sizma-result-card { display: grid; gap: 14px; padding: clamp(17px, 3vw, 28px); border-color: rgba(169, 147, 255, 0.32); border-radius: 20px; background: radial-gradient(circle at 86% 8%, rgba(169, 147, 255, 0.16), transparent 36%), linear-gradient(145deg, rgba(33, 33, 68, 0.94), rgba(16, 23, 42, 0.94)); }
  .stage11b-sizma-result-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .stage11b-sizma-result-head h2 { margin: 0; font-size: clamp(1.2rem, 3.5vw, 1.8rem); letter-spacing: -0.04em; }
  .stage11b-sizma-result-state { padding: 7px 10px; border-radius: 999px; color: #cbffec; background: rgba(39, 143, 111, 0.28); font-size: 0.66rem; font-weight: 900; letter-spacing: 0.09em; white-space: nowrap; }
  .stage11b-sizma-result-state.is-escaped { color: #ffe0e6; background: rgba(157, 47, 72, 0.32); }
  .stage11b-sizma-result-copy { margin: 0; color: #c4cde0; font-size: 0.86rem; line-height: 1.55; }
  .stage11b-sizma-reveal-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .stage11b-sizma-reveal-cell { display: grid; gap: 5px; padding: 12px; border: 1px solid rgba(164, 182, 214, 0.16); border-radius: 13px; background: rgba(5, 10, 19, 0.35); }
  .stage11b-sizma-reveal-cell span { color: var(--stage11b-sizma-muted); font-size: 0.63rem; font-weight: 800; letter-spacing: 0.11em; }
  .stage11b-sizma-reveal-cell strong { color: #f5f8ff; font-size: 1rem; letter-spacing: 0.04em; }
  .stage11b-sizma-results-list { display: grid; gap: 7px; }
  .stage11b-sizma-results-row { display: flex; justify-content: space-between; gap: 10px; padding: 9px 11px; border-bottom: 1px solid rgba(164, 182, 214, 0.1); color: #cbd6e8; font-size: 0.77rem; }
  .stage11b-sizma-results-row strong { color: #f7fbff; }
  .stage11b-sizma-results-row span { color: var(--stage11b-sizma-cyan); font-weight: 900; }
  .stage11b-sizma-empty { display: grid; place-items: center; min-height: 240px; border: 1px dashed rgba(143, 157, 180, 0.24); border-radius: 22px; color: #aab8cc; text-align: center; }
  .stage11b-sizma-empty p { max-width: 30ch; margin: 8px 20px 0; line-height: 1.5; }

  @media (max-width: 760px) {
    .stage11b-sizma { padding: 10px; overflow: visible; }
    .stage11b-sizma-grid { grid-template-columns: 1fr; }
    .stage11b-sizma-board { min-height: 225px; }
    .stage11b-sizma-board-copy { inset: 15px 16px auto; }
    .stage11b-sizma-board-copy-right { max-width: 135px; }
  }
  @media (max-width: 420px) {
    .stage11b-sizma-topbar { align-items: flex-start; padding: 12px; }
    .stage11b-sizma-phase-chip { max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .stage11b-sizma-board { min-height: 205px; border-radius: 18px; }
    .stage11b-sizma-board-copy-right { display: none; }
    .stage11b-sizma-panel { padding: 14px; border-radius: 17px; }
    .stage11b-sizma-vote-actions { align-items: stretch; flex-direction: column; }
    .stage11b-sizma-vote-actions .stage11b-sizma-button { width: 100%; }
    .stage11b-sizma-reveal-grid { grid-template-columns: 1fr; }
  }
`;

export function SizmaStage({
  publicState: publicStateInput,
  ownState: ownStateInput,
  players,
  selfPlayerId,
  now,
  isSpectator,
  onSubmit
}: SizmaStageProps): JSX.Element {
  const publicState = isSizmaPublicState(publicStateInput) ? publicStateInput : null;
  const ownState = !isSpectator && isSizmaOwnState(ownStateInput) ? ownStateInput : null;
  const [clueDraft, setClueDraft] = useState("");
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const clueFormRef = useRef<HTMLFormElement | null>(null);

  const selfPlayer = selfPlayerId ? players.find((player) => player.id === selfPlayerId) : undefined;
  const isDisconnected = Boolean(selfPlayer && !selfPlayer.connected);
  const isInteractive = !isSpectator && !isDisconnected && Boolean(selfPlayerId) && Boolean(publicState);
  const participants = useMemo(
    () => players.filter((player) => player.currentGameParticipant && !player.eliminated),
    [players]
  );
  const voteCandidates = useMemo(
    () => participants.filter((player) => player.connected),
    [participants]
  );

  useEffect(() => {
    if (!publicState) return;

    if (pendingAction?.kind === "clue" && publicState.subPhase !== "clue") {
      setPendingAction(null);
      setClueDraft("");
      setStatusMessage("İpucun kaydedildi. Oylama hazırlığı başladı.");
    } else if (pendingAction?.kind === "ready" && publicState.subPhase === "vote") {
      setPendingAction(null);
      setStatusMessage("Hazır sinyalin alındı. Oylama başladı.");
    } else if (pendingAction?.kind === "vote" && publicState.subPhase === "results") {
      setPendingAction(null);
      setSelectedTargetId(null);
      setStatusMessage("Oyun kaydedildi. Sonuç sinyali geldi.");
    } else if (pendingAction?.kind === "clue" && ownState?.completedClueRounds.includes(pendingAction.round)) {
      setPendingAction(null);
      setClueDraft("");
      setStatusMessage("İpucun kaydedildi. Sıradaki sesi dinle.");
    } else if (pendingAction?.kind === "ready" && selfPlayerId && publicState.readyPlayerIds.includes(selfPlayerId)) {
      setPendingAction(null);
      setStatusMessage("Hazır sinyalin alındı. Diğer oyuncular bekleniyor.");
    } else if (pendingAction?.kind === "vote" && ownState?.hasVoted) {
      setPendingAction(null);
      setSelectedTargetId(null);
      setStatusMessage("Oyun kaydedildi. Sonuç sinyali bekleniyor.");
    } else if (pendingAction && now - pendingAction.submittedAt > 4_500) {
      setPendingAction(null);
      setStatusMessage("Sunucudan yanıt gecikti. Kontrolünü düzenleyip yeniden deneyebilirsin.");
    }
  }, [now, ownState, pendingAction, publicState, selfPlayerId]);

  useEffect(() => {
    if (publicState?.subPhase !== "clue" || publicState.clueTurnPlayerId !== selfPlayerId) {
      setClueDraft("");
    }
  }, [publicState?.clueTurnPlayerId, publicState?.subPhase, selfPlayerId]);

  useEffect(() => {
    if (!publicState || publicState.subPhase !== "vote") {
      setSelectedTargetId(null);
      return;
    }

    if (selectedTargetId && !voteCandidates.some((player) => player.id === selectedTargetId)) {
      setSelectedTargetId(null);
    }
  }, [publicState, selectedTargetId, voteCandidates]);

  useEffect(() => {
    if (publicState?.subPhase === "clue" && pendingAction?.kind === "clue" && pendingAction.round !== publicState.clueRound) {
      setPendingAction(null);
      setClueDraft("");
    }
  }, [pendingAction, publicState]);

  const submit = useCallback((payload: JsonValue, pending: Exclude<PendingAction, null>): void => {
    try {
      onSubmit(payload);
      setPendingAction(pending);
      setStatusMessage("Sinyal gönderiliyor…");
    } catch {
      setPendingAction(null);
      setStatusMessage("Sinyal gönderilemedi. Alanı düzenleyip yeniden deneyebilirsin.");
    }
  }, [onSubmit]);

  const canSubmitClue = Boolean(
    publicState?.subPhase === "clue" &&
      ownState?.canCompleteClue &&
      clueDraft.trim().length > 0 &&
      isInteractive &&
      !pendingAction
  );

  const handleClueSubmit = useCallback((event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!publicState || !canSubmitClue) return;
    const clueText = clueDraft.trim();
    if (!clueText) return;
    submit(
      { kind: "clue-complete", clueText },
      { kind: "clue", round: publicState.clueRound, submittedAt: now }
    );
  }, [canSubmitClue, clueDraft, now, publicState, submit]);

  const handleClueKeyDown = useCallback((event: KeyboardEvent<HTMLTextAreaElement>): void => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }, []);

  const handleReady = useCallback((): void => {
    if (!publicState || !ownState?.canReadyForVote || !isInteractive || pendingAction) return;
    submit({ kind: "vote-ready" }, { kind: "ready", submittedAt: now });
  }, [isInteractive, now, ownState, pendingAction, publicState, submit]);

  const handleVote = useCallback((): void => {
    if (!selectedTargetId || !publicState || ownState?.hasVoted || !isInteractive || pendingAction) return;
    if (!voteCandidates.some((player) => player.id === selectedTargetId)) return;
    submit(
      { kind: "vote", targetPlayerId: selectedTargetId },
      { kind: "vote", targetPlayerId: selectedTargetId, submittedAt: now }
    );
  }, [isInteractive, now, ownState, pendingAction, publicState, selectedTargetId, submit, voteCandidates]);

  if (!publicState) {
    return (
      <div className="stage11b-sizma">
        <style>{STYLES}</style>
        <div className="stage11b-sizma-shell">
          <div className="stage11b-sizma-empty" aria-live="polite">
            <div>
              <span className="stage11b-sizma-kicker">BORU AĞI / BAĞLANTI</span>
              <p>Sahne sinyali bekleniyor. Oyun verisi geldiğinde boru ağı açılacak.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const turnName = playerName(players, publicState.clueTurnPlayerId);
  const clueProgress = publicState.totalClueTurns > 0
    ? Math.min(100, Math.round((publicState.clueTurnsCompleted / publicState.totalClueTurns) * 100))
    : 0;
  const voteSeconds = secondsLeft(publicState.voteEndsAt, now);
  const voteProgress = publicState.voteEndsAt === null
    ? 0
    : Math.min(100, Math.max(0, Math.round((1 - Math.max(0, publicState.voteEndsAt - now) / VOTE_DURATION_MS) * 100)));
  const isOwnTurn = publicState.subPhase === "clue" && ownState?.canCompleteClue === true;
  const isClueLocked = publicState.subPhase !== "clue" || !isOwnTurn || Boolean(pendingAction);
  const isReadyLocked = publicState.subPhase !== "ready-for-vote" || !ownState?.canReadyForVote || Boolean(pendingAction);
  const isVoteLocked = publicState.subPhase !== "vote" || Boolean(ownState?.hasVoted) || Boolean(pendingAction);
  const votedCount = ownState?.hasVoted ? 1 : 0;

  return (
    <div className="stage11b-sizma" aria-label="Sızma boru ağı sahnesi">
      <style>{STYLES}</style>
      <div className="stage11b-sizma-shell">
        <header className="stage11b-sizma-topbar">
          <div className="stage11b-sizma-brand">
            <span className="stage11b-sizma-kicker">ŞÜPHELİ FREKANS</span>
            <h1 className="stage11b-sizma-title">Sızma</h1>
          </div>
          <span className="stage11b-sizma-phase-chip">{phaseLabel(publicState)}</span>
        </header>

        <section className="stage11b-sizma-board" aria-label="Boru ağı ve vana durumu">
          <svg className="stage11b-sizma-pipes" viewBox="0 0 1000 320" preserveAspectRatio="none" aria-hidden="true" focusable="false">
            <path className="stage11b-sizma-pipe-shadow" d="M-20 244 H210 V105 H386 M1020 244 H790 V105 H614 M-20 70 H115 V154 H386 M1020 70 H885 V154 H614" />
            <path className="stage11b-sizma-pipe" d="M-20 244 H210 V105 H386 M1020 244 H790 V105 H614 M-20 70 H115 V154 H386 M1020 70 H885 V154 H614" />
            <path className="stage11b-sizma-pipe-glow" d="M-20 244 H210 V105 H386 M1020 244 H790 V105 H614 M-20 70 H115 V154 H386 M1020 70 H885 V154 H614" />
            <circle className="stage11b-sizma-node" cx="210" cy="244" r="12" />
            <circle className="stage11b-sizma-node" cx="790" cy="244" r="12" />
            <circle className="stage11b-sizma-node" cx="115" cy="70" r="12" />
            <circle className="stage11b-sizma-node" cx="885" cy="70" r="12" />
          </svg>
          <div className="stage11b-sizma-board-copy">
            <div>
              <span className="stage11b-sizma-micro">BORU AĞI</span>
              <strong>{publicState.subPhase === "results" ? "Gizli bağlantı çözüldü" : "Bütün sinyaller dinleniyor"}</strong>
            </div>
            <div className="stage11b-sizma-board-copy-right">
              {isSpectator ? "İzleyici görünümü · özel panel kapalı" : "Kendi panelin yalnızca sana ait"}
            </div>
          </div>
          <div className="stage11b-sizma-valve-wrap">
            <button
              className="stage11b-sizma-valve"
              type="button"
              disabled={isClueLocked || !isInteractive || clueDraft.trim().length === 0}
              onClick={() => {
                if (publicState.subPhase === "clue") {
                  clueFormRef.current?.requestSubmit();
                }
              }}
              aria-label={isOwnTurn ? "İpucunu tamamla" : "Vana kilitli"}
            >
              <span aria-hidden="true">{isOwnTurn ? "GO" : "LOCK"}</span>
            </button>
            <span className="stage11b-sizma-valve-caption">{isOwnTurn ? "vana sende" : "sıra bekleniyor"}</span>
          </div>
        </section>

        <main className="stage11b-sizma-grid">
          <section className="stage11b-sizma-panel" aria-live="polite">
            {publicState.subPhase === "clue" && (
              <>
                <div className="stage11b-sizma-panel-heading">
                  <div>
                    <span className="stage11b-sizma-kicker">AÇIK KANAL</span>
                    <h2>{isOwnTurn ? "Sinyalini bırak" : `${turnName} konuşuyor`}</h2>
                  </div>
                  <span className="stage11b-sizma-round-badge">{publicState.clueRound}/2</span>
                </div>
                <p className="stage11b-sizma-instruction">
                  Kelimenle ilişkili kısa ve doğal bir ipucu yaz. Masada söyledikten sonra cyan vanaya basarak turu kilitle.
                </p>
                {isOwnTurn ? (
                  <form ref={clueFormRef} className="stage11b-sizma-form" onSubmit={handleClueSubmit}>
                    <textarea
                      className="stage11b-sizma-textarea"
                      value={clueDraft}
                      maxLength={MAX_CLUE_LENGTH}
                      disabled={!isInteractive || Boolean(pendingAction)}
                      placeholder="İpucunu buraya yaz…"
                      onChange={(event) => setClueDraft(event.target.value)}
                      onKeyDown={handleClueKeyDown}
                      aria-label="İpucu metni"
                    />
                    <div className="stage11b-sizma-form-meta">
                      <span>Enter yeni satır · Ctrl/⌘ + Enter gönder</span>
                      <span>{clueDraft.length}/{MAX_CLUE_LENGTH}</span>
                    </div>
                    <button className="stage11b-sizma-button" type="submit" disabled={!canSubmitClue}>
                      {pendingAction?.kind === "clue" ? "SİNYAL GÖNDERİLİYOR…" : "İPUCUMU KİLİTLE"}
                    </button>
                  </form>
                ) : (
                  <p className="stage11b-sizma-lock-note"><span aria-hidden="true">◌</span>{isSpectator ? "Bu kanal yalnızca sırası gelen oyuncunun girişine açık." : `${turnName} ipucunu kilitleyene kadar kanal dinlemede.`}</p>
                )}
                <div className="stage11b-sizma-progress">
                  <div className="stage11b-sizma-progress-top"><span>İPUCU AKIŞI</span><strong>{publicState.clueTurnsCompleted} / {publicState.totalClueTurns}</strong></div>
                  <div className="stage11b-sizma-progress-track"><span className="stage11b-sizma-progress-fill" style={{ width: `${clueProgress}%` }} /></div>
                </div>
                <div className="stage11b-sizma-clue-stream" aria-label="Açık ipucu akışı">
                  {publicState.clueTokens.length === 0 ? <span>İlk ipucu açık kanala düşecek.</span> : publicState.clueTokens.slice(-6).map((token) => (
                    <span key={`${token.playerId}-${token.round}`}><b>{playerName(players, token.playerId)}</b><small>TUR {token.round}</small>{token.text}</span>
                  ))}
                </div>
              </>
            )}

            {publicState.subPhase === "ready-for-vote" && (
              <>
                <div className="stage11b-sizma-panel-heading">
                  <div><span className="stage11b-sizma-kicker">İPUÇLARI TAMAM</span><h2>Oylamaya hazırlan</h2></div>
                  <span className="stage11b-sizma-round-badge">✓</span>
                </div>
                <p className="stage11b-sizma-instruction">İki ipucu turu tamamlandı. Masadaki tartışmayı bitirince kendi hazır sinyalini ver; herkes hazır olduğunda oylama başlar.</p>
                {isSpectator ? (
                  <p className="stage11b-sizma-lock-note"><span aria-hidden="true">◌</span>İzleyici olarak hazırlık durumunu görüyorsun; hazır sinyali gönderemezsin.</p>
                ) : (
                  <button className="stage11b-sizma-button" type="button" disabled={isReadyLocked || !isInteractive} onClick={handleReady}>
                    {pendingAction?.kind === "ready" ? "HAZIR SİNYALİ GÖNDERİLİYOR…" : ownState?.canReadyForVote ? "OYLAMAYA HAZIRIM" : "HAZIR SİNYALİ ALINDI"}
                  </button>
                )}
                <div className="stage11b-sizma-ready-list">
                  {participants.map((player) => {
                    const ready = publicState.readyPlayerIds.includes(player.id);
                    return <div className="stage11b-sizma-ready-row" key={player.id}><span>{player.nickname}</span><span className={`stage11b-sizma-ready-state ${ready ? "is-ready" : ""}`}>{ready ? "HAZIR" : "BEKLEMEDE"}</span></div>;
                  })}
                </div>
              </>
            )}

            {publicState.subPhase === "vote" && (
              <>
                <div className="stage11b-sizma-panel-heading">
                  <div><span className="stage11b-sizma-kicker">KAPALI OYLAMA</span><h2>Şüpheliyi seç</h2></div>
                  <span className="stage11b-sizma-round-badge">{votedCount}/{participants.length}</span>
                </div>
                <div className="stage11b-sizma-vote-meter">
                  <span className="stage11b-sizma-countdown">{voteSeconds}<small>SN</small></span>
                  <div className="stage11b-sizma-vote-meter-copy"><strong>Bağlantıyı kesmeden karar ver</strong><span>Bir oyuncu kartını seç, sonra oyu kilitle. Oyunu gönderdikten sonra kartlar kapanır.</span></div>
                </div>
                <div className="stage11b-sizma-progress-track" aria-hidden="true"><span className="stage11b-sizma-progress-fill" style={{ width: `${voteProgress}%` }} /></div>
                <div className="stage11b-sizma-vote-grid" role="group" aria-label="Oyuncu seçimi">
                  {voteCandidates.map((player) => {
                    const selected = player.id === selectedTargetId;
                    const self = player.id === selfPlayerId;
                    return (
                      <button
                        className={`stage11b-sizma-player-card ${selected ? "is-selected" : ""} ${isVoteLocked ? "is-locked" : ""}`}
                        type="button"
                        key={player.id}
                        disabled={isVoteLocked || !isInteractive}
                        aria-pressed={selected}
                        onClick={() => setSelectedTargetId(player.id)}
                      >
                        <span className="stage11b-sizma-player-avatar" aria-hidden="true">{initials(player.nickname)}</span>
                        <span className="stage11b-sizma-player-copy"><strong>{player.nickname}</strong><small>{self ? "SEN" : selected ? "SEÇİLDİ" : "ŞÜPHELİ ADAYI"}</small></span>
                      </button>
                    );
                  })}
                </div>
                <div className="stage11b-sizma-vote-actions">
                  <span className="stage11b-sizma-vote-selection">{selectedTargetId ? `${playerName(players, selectedTargetId)} seçildi` : "Bir oyuncu kartı seç"}</span>
                  <button className="stage11b-sizma-button" type="button" disabled={isVoteLocked || !selectedTargetId || !isInteractive} onClick={handleVote}>
                    {pendingAction?.kind === "vote" ? "OY GÖNDERİLİYOR…" : ownState?.hasVoted ? "OY KAYDEDİLDİ" : "OYU KİLİTLE"}
                  </button>
                </div>
              </>
            )}

            {publicState.subPhase === "results" && (
              <ResultPanel publicState={publicState} players={players} />
            )}

            {statusMessage && <p className="stage11b-sizma-status" role="status">{statusMessage}</p>}
            {isDisconnected && <p className="stage11b-sizma-status" role="alert">Bağlantı yok. Yeniden bağlanınca bu panel otomatik olarak güncellenecek.</p>}
          </section>

          <aside className="stage11b-sizma-side-column">
            {!isSpectator && ownState ? (
              <div className="stage11b-sizma-secret" aria-label="Kişisel kelime paneli">
                <span className="stage11b-sizma-kicker">KİŞİSEL FREKANS · SADECE SEN</span>
                <strong className="stage11b-sizma-personal-word">{ownState.assignedWord}</strong>
                <div className="stage11b-sizma-secret-divider" />
                <span className="stage11b-sizma-secret-note">Bu kelimeyi açık kanalda doğrudan söyleme. İpucunu kendi kelimene göre üret.</span>
              </div>
            ) : (
              <div className="stage11b-sizma-observer-card">
                <span className="stage11b-sizma-kicker">GÖZLEM MODU</span>
                <strong>Özel frekans kapalı</strong>
                <p>İzleyici görünümünde hiçbir kişisel kelime veya rol gösterilmez. Yalnızca ortak oyun akışını izliyorsun.</p>
              </div>
            )}
            <div className="stage11b-sizma-panel">
              <div className="stage11b-sizma-panel-heading">
                <div><span className="stage11b-sizma-kicker">MASA RADARI</span><h2>Oyuncular</h2></div>
                <span className="stage11b-sizma-round-badge">{participants.length}</span>
              </div>
              <div className="stage11b-sizma-ready-list">
                {participants.map((player) => (
                  <div className="stage11b-sizma-ready-row" key={player.id}>
                    <span>{player.nickname}{player.id === selfPlayerId ? " · sen" : ""}</span>
                    <span className={`stage11b-sizma-ready-state ${player.connected ? "is-ready" : ""}`}>{player.connected ? "BAĞLI" : "BAĞLANTI YOK"}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}

function ResultPanel({ publicState, players }: { readonly publicState: SizmaPublicState; readonly players: readonly MatchPlayerState[] }): JSX.Element {
  const outsiderName = playerName(players, publicState.outsiderPlayerId);
  const topNames = (publicState.topVotedPlayerIds ?? []).map((playerId) => playerName(players, playerId));

  return (
    <div className="stage11b-sizma-result-card">
      <div className="stage11b-sizma-result-head">
        <div><span className="stage11b-sizma-kicker">SIZMA SONUCU</span><h2>{publicState.outsiderCaught ? "Boru temiz" : "Sinyal sızdı"}</h2></div>
        <span className={`stage11b-sizma-result-state ${publicState.outsiderCaught ? "" : "is-escaped"}`}>{publicState.outsiderCaught ? "YAKALANDI" : "KAÇTI"}</span>
      </div>
      <p className="stage11b-sizma-result-copy">{publicState.outsiderCaught ? `${outsiderName} sızma olarak bulundu.` : `${outsiderName} sızma frekansını korudu.`}{topNames.length > 0 ? ` En çok oy: ${topNames.join(", ")}.` : ""}</p>
      <div className="stage11b-sizma-reveal-grid">
        <div className="stage11b-sizma-reveal-cell"><span>ORTAK KELİME</span><strong>{publicState.commonWord ?? "—"}</strong></div>
        <div className="stage11b-sizma-reveal-cell"><span>SIZMA KELİMESİ</span><strong>{publicState.outsiderWord ?? "—"}</strong></div>
      </div>
      {publicState.voteCounts && publicState.voteCounts.length > 0 && (
        <div className="stage11b-sizma-results-list" aria-label="Oy sonuçları">
          {publicState.voteCounts.map((result) => (
            <div className="stage11b-sizma-results-row" key={result.playerId}><strong>{playerName(players, result.playerId)}</strong><span>{result.votes} oy</span></div>
          ))}
        </div>
      )}
    </div>
  );
}
