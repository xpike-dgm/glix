import type { GameId, JsonValue } from "./index.js";

export type GameActionMode = "single" | "repeatable" | "batch" | "turn" | "none";

export interface SubmissionStatus {
  readonly mode: GameActionMode;
  readonly canAct: boolean;
  readonly completed: boolean;
  readonly acceptedActionCount: number;
  readonly locked: boolean;
}

export type TargetExtraction =
  | { readonly kind: "none" }
  | { readonly kind: "targets"; readonly targetPlayerIds: readonly string[] }
  | { readonly kind: "malformed" };

interface TargetFieldContract {
  readonly actionKind: string;
  readonly field: string;
  readonly collectionField?: string;
}

export interface GameRuntimeContract {
  readonly actionMode: GameActionMode;
  readonly targets: readonly TargetFieldContract[];
  readonly disconnectPolicy: "retain-until-timeout" | "skip-disconnected" | "neutral-missing";
}

const ACTION_SCOPE_FIELDS: Readonly<Record<GameId, readonly string[]>> = {
  "yazi-yaz": ["subPhase"], kendim: ["subPhase"], sizma: ["subPhase", "clueRound", "clueTurnIndex"],
  "sozluk-blofu": ["subPhase"], "cagrisim-agi": ["subPhase"], "butona-bas": [],
  "rus-ruleti": ["subPhase", "currentHolderId", "shotCount"], "gizli-hirsiz": [], "kor-kronometre": [],
  "kor-bomba": ["bombHolderId", "passCount"], "rusvet-darbe": ["subPhase", "rpsRound"],
  "acgozluluk-limiti": [], "ortalamanin-yarisi": [], "gizli-kareler": ["round"],
  "karalama-defteri": ["subPhase"], ittifak: ["subPhase"], "son-kisi": [], "cizgiyi-gecme": [],
  "gizli-alisveris": [], "asiri-yukleme": [], "kontrol-paneli-kaosu": [], "zehirli-kadeh": [],
  "capraz-ates": [], "zaman-bombasi-hafizasi": ["subPhase", "sequenceLength", "activePlayerId"]
};

const NO_TARGETS: readonly TargetFieldContract[] = [];

const CONTRACTS: Readonly<Record<GameId, GameRuntimeContract>> = {
  "yazi-yaz": { actionMode: "turn", targets: [{ actionKind: "yazi-guess", field: "targetWriterId" }], disconnectPolicy: "skip-disconnected" },
  kendim: { actionMode: "batch", targets: [{ actionKind: "kendim-matches", field: "targetPlayerId", collectionField: "matches" }], disconnectPolicy: "skip-disconnected" },
  sizma: { actionMode: "turn", targets: [{ actionKind: "vote", field: "targetPlayerId" }], disconnectPolicy: "skip-disconnected" },
  "sozluk-blofu": { actionMode: "turn", targets: NO_TARGETS, disconnectPolicy: "skip-disconnected" },
  "cagrisim-agi": { actionMode: "single", targets: NO_TARGETS, disconnectPolicy: "retain-until-timeout" },
  "butona-bas": { actionMode: "repeatable", targets: NO_TARGETS, disconnectPolicy: "retain-until-timeout" },
  "rus-ruleti": { actionMode: "turn", targets: [{ actionKind: "russian-shot", field: "targetPlayerId" }], disconnectPolicy: "skip-disconnected" },
  "gizli-hirsiz": { actionMode: "single", targets: NO_TARGETS, disconnectPolicy: "retain-until-timeout" },
  "kor-kronometre": { actionMode: "single", targets: NO_TARGETS, disconnectPolicy: "neutral-missing" },
  "kor-bomba": { actionMode: "repeatable", targets: [{ actionKind: "bomb-pass", field: "targetPlayerId" }], disconnectPolicy: "skip-disconnected" },
  "rusvet-darbe": { actionMode: "turn", targets: [{ actionKind: "president-vote", field: "targetPlayerId" }, { actionKind: "president-distribution", field: "targetPlayerId", collectionField: "allocations" }], disconnectPolicy: "skip-disconnected" },
  "acgozluluk-limiti": { actionMode: "single", targets: NO_TARGETS, disconnectPolicy: "neutral-missing" },
  "ortalamanin-yarisi": { actionMode: "single", targets: NO_TARGETS, disconnectPolicy: "neutral-missing" },
  "gizli-kareler": { actionMode: "turn", targets: NO_TARGETS, disconnectPolicy: "neutral-missing" },
  "karalama-defteri": { actionMode: "turn", targets: [{ actionKind: "drawing-vote", field: "targetPlayerId" }], disconnectPolicy: "skip-disconnected" },
  ittifak: { actionMode: "single", targets: [{ actionKind: "alliance-vote", field: "targetPlayerId" }], disconnectPolicy: "neutral-missing" },
  "son-kisi": { actionMode: "single", targets: NO_TARGETS, disconnectPolicy: "retain-until-timeout" },
  "cizgiyi-gecme": { actionMode: "single", targets: NO_TARGETS, disconnectPolicy: "neutral-missing" },
  "gizli-alisveris": { actionMode: "repeatable", targets: NO_TARGETS, disconnectPolicy: "retain-until-timeout" },
  "asiri-yukleme": { actionMode: "repeatable", targets: NO_TARGETS, disconnectPolicy: "retain-until-timeout" },
  "kontrol-paneli-kaosu": { actionMode: "single", targets: NO_TARGETS, disconnectPolicy: "retain-until-timeout" },
  "zehirli-kadeh": { actionMode: "single", targets: [{ actionKind: "glass-trade", field: "targetPlayerId" }], disconnectPolicy: "skip-disconnected" },
  "capraz-ates": { actionMode: "single", targets: [{ actionKind: "crossfire-target", field: "targetPlayerId" }], disconnectPolicy: "neutral-missing" },
  "zaman-bombasi-hafizasi": { actionMode: "turn", targets: NO_TARGETS, disconnectPolicy: "skip-disconnected" }
};

function isObject(value: JsonValue | null): value is { readonly [key: string]: JsonValue } {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function getGameRuntimeContract(gameId: GameId): GameRuntimeContract {
  return CONTRACTS[gameId];
}

/** Public, non-secret adapter epoch used to fence delayed actions across internal rounds/turns. */
export function deriveActionScope(gameId: GameId, publicState: JsonValue | null): string {
  if (!isObject(publicState)) return "adapter";
  return JSON.stringify(ACTION_SCOPE_FIELDS[gameId].map((field) => [field, publicState[field] ?? null]));
}

export function extractGameTargets(gameId: GameId, payload: JsonValue | null): TargetExtraction {
  if (!isObject(payload) || typeof payload.kind !== "string") return { kind: "none" };
  const target = CONTRACTS[gameId].targets.find((entry) => entry.actionKind === payload.kind);
  if (!target) return { kind: "none" };

  if (target.collectionField) {
    const entries = payload[target.collectionField];
    if (!Array.isArray(entries)) return { kind: "malformed" };
    const ids: string[] = [];
    for (const entry of entries) {
      const value = isObject(entry) ? entry[target.field] : null;
      if (typeof value !== "string" || value.length === 0) {
        return { kind: "malformed" };
      }
      ids.push(value);
    }
    return { kind: "targets", targetPlayerIds: ids };
  }

  const value = payload[target.field];
  return typeof value === "string" && value.length > 0
    ? { kind: "targets", targetPlayerIds: [value] }
    : { kind: "malformed" };
}

export interface TargetRosterSeat {
  readonly id: string;
  readonly connected: boolean;
  readonly currentGameParticipant: boolean;
  readonly eliminated: boolean;
}

export function areExtractedTargetsEligible(extraction: TargetExtraction, roster: readonly TargetRosterSeat[]): boolean {
  if (extraction.kind === "none") return true;
  if (extraction.kind === "malformed") return false;
  const seats = new Map(roster.map((seat) => [seat.id, seat] as const));
  return extraction.targetPlayerIds.every((id) => {
    const seat = seats.get(id);
    return Boolean(seat?.connected && seat.currentGameParticipant && !seat.eliminated);
  });
}

function bool(state: { readonly [key: string]: JsonValue }, key: string): boolean {
  return state[key] === true;
}

/** Explicit per-game semantic status; only booleans/counts leave the authoritative adapter boundary. */
export function deriveSubmissionStatus(gameId: GameId, ownState: JsonValue | null, publicState: JsonValue | null, isPlaying = true): SubmissionStatus {
  const mode = CONTRACTS[gameId].actionMode;
  if (!isObject(ownState)) return { mode: "none", canAct: false, completed: false, acceptedActionCount: 0, locked: true };
  const subPhase = isObject(publicState) && typeof publicState.subPhase === "string" ? publicState.subPhase : null;
  let completed = false;
  let explicitCan = false;
  switch (gameId) {
    case "yazi-yaz": completed = subPhase === "write" ? bool(ownState, "hasWritten") : subPhase === "guess" ? bool(ownState, "hasGuessed") : false; explicitCan = subPhase === "write" ? ownState.role === "writer" && !completed : subPhase === "guess" && bool(ownState, "canGuess"); break;
    case "kendim": completed = subPhase === "write" ? bool(ownState, "hasWritten") : subPhase === "match" ? bool(ownState, "hasSubmittedMatches") : false; explicitCan = (subPhase === "write" || subPhase === "match") && !completed; break;
    case "sizma": {
      const clueRound = isObject(publicState) && typeof publicState.clueRound === "number" ? publicState.clueRound : null;
      const completedRounds = Array.isArray(ownState.completedClueRounds) ? ownState.completedClueRounds : [];
      completed = subPhase === "clue" ? clueRound !== null && completedRounds.includes(clueRound) : subPhase === "ready-for-vote" ? !bool(ownState, "canReadyForVote") : subPhase === "vote" ? bool(ownState, "hasVoted") : false;
      explicitCan = bool(ownState, "canCompleteClue") || bool(ownState, "canReadyForVote") || (subPhase === "vote" && !completed);
      break;
    }
    case "sozluk-blofu": completed = subPhase === "write" ? bool(ownState, "hasWritten") : subPhase === "choose" ? bool(ownState, "hasChosen") : false; explicitCan = (subPhase === "write" || subPhase === "choose") && !completed; break;
    case "rusvet-darbe": completed = subPhase === "election" ? bool(ownState, "hasVoted") : subPhase === "rps" ? bool(ownState, "hasChosenRps") : subPhase === "distribution" ? bool(ownState, "hasSubmittedDistribution") : false; explicitCan = subPhase === "election" ? !completed : subPhase === "rps" ? bool(ownState, "canChooseRps") && !completed : subPhase === "distribution" ? ownState.isPresident === true && !completed : false; break;
    case "karalama-defteri": completed = subPhase === "draw" ? bool(ownState, "hasDrawing") : subPhase === "vote" ? bool(ownState, "hasVoted") : false; explicitCan = (subPhase === "draw" || subPhase === "vote") && !completed; break;
    case "ittifak": completed = subPhase === "vote" && bool(ownState, "hasVoted"); explicitCan = subPhase === "vote" && !completed; break;
    case "zaman-bombasi-hafizasi": completed = false; explicitCan = subPhase === "input" && bool(ownState, "isActive"); break;
    case "rus-ruleti": completed = false; explicitCan = bool(ownState, "canShoot"); break;
    case "kor-bomba": completed = false; explicitCan = bool(ownState, "canPass"); break;
    case "gizli-kareler": completed = ownState.selectedCell !== null; explicitCan = bool(ownState, "canSelect"); break;
    case "zehirli-kadeh": completed = bool(ownState, "hasTraded"); explicitCan = bool(ownState, "canTrade"); break;
    case "butona-bas": completed = false; explicitCan = true; break;
    case "gizli-alisveris": case "asiri-yukleme": completed = false; explicitCan = true; break;
    case "gizli-hirsiz": completed = bool(ownState, "hasPressed"); explicitCan = !completed; break;
    case "kor-kronometre": completed = bool(ownState, "hasTapped"); explicitCan = !completed; break;
    case "son-kisi": completed = bool(ownState, "hasEscaped"); explicitCan = !completed; break;
    case "cagrisim-agi": case "acgozluluk-limiti": case "ortalamanin-yarisi": case "cizgiyi-gecme": case "capraz-ates": completed = bool(ownState, "hasSubmitted"); explicitCan = !completed; break;
    case "kontrol-paneli-kaosu": completed = bool(ownState, "hasCut"); explicitCan = !completed; break;
  }
  const finished = bool(ownState, "finished") || bool(ownState, "eliminated");
  const canAct = isPlaying && !finished && explicitCan;
  const safeCount = typeof ownState.clickCount === "number" && Number.isSafeInteger(ownState.clickCount)
    ? ownState.clickCount
    : completed ? 1 : 0;
  return {
    mode,
    canAct,
    completed,
    acceptedActionCount: Math.max(0, safeCount),
    locked: finished || (!canAct && (completed || mode === "none"))
  };
}

export interface ClientActionScope {
  readonly matchId: string;
  readonly gameId: GameId;
  readonly phaseIndex: number;
  readonly actionScope: string;
  readonly sessionId: string;
  readonly spectator: boolean;
}

export type ClientActionState =
  | { readonly status: "editable"; readonly scope: ClientActionScope; readonly authoritativeVersion: number; readonly mode: GameActionMode }
  | { readonly status: "pending"; readonly scope: ClientActionScope; readonly authoritativeVersion: number; readonly mode: GameActionMode; readonly actionId: string; readonly observedStateVersion: number }
  | { readonly status: "accepted" | "rejected"; readonly scope: ClientActionScope; readonly authoritativeVersion: number; readonly mode: GameActionMode; readonly actionId: string; readonly ackStateVersion: number; readonly reason?: string };

export type ClientActionEvent =
  | { readonly type: "scope"; readonly scope: ClientActionScope; readonly stateVersion: number; readonly mode: GameActionMode; readonly completed: boolean }
  | { readonly type: "submit"; readonly actionId: string; readonly observedStateVersion: number }
  | { readonly type: "ack"; readonly actionId: string; readonly accepted: boolean; readonly stateVersion: number; readonly reason?: string };

function sameScope(a: ClientActionScope, b: ClientActionScope): boolean {
  return a.matchId === b.matchId && a.gameId === b.gameId && a.phaseIndex === b.phaseIndex && a.actionScope === b.actionScope && a.sessionId === b.sessionId && a.spectator === b.spectator;
}

export function reduceClientActionState(state: ClientActionState | null, event: ClientActionEvent): ClientActionState {
  if (event.type === "scope") {
    if (!state || !sameScope(state.scope, event.scope)) {
      return { status: event.completed ? "accepted" : "editable", scope: event.scope, authoritativeVersion: event.stateVersion, mode: event.mode, ...(event.completed ? { actionId: "authoritative", ackStateVersion: event.stateVersion } : {}) } as ClientActionState;
    }
    if (event.stateVersion < state.authoritativeVersion) return state;
    if (event.stateVersion === state.authoritativeVersion) return state;
    if (event.completed && state.mode !== "repeatable") {
      return { status: "accepted", scope: event.scope, authoritativeVersion: event.stateVersion, mode: event.mode, actionId: state.status === "pending" ? state.actionId : "authoritative", ackStateVersion: event.stateVersion };
    }
    return { ...state, authoritativeVersion: event.stateVersion };
  }
  if (!state) throw new Error("Action state requires an authoritative scope before use.");
  if (event.type === "submit") {
    return { status: "pending", scope: state.scope, authoritativeVersion: state.authoritativeVersion, mode: state.mode, actionId: event.actionId, observedStateVersion: event.observedStateVersion };
  }
  if (state.status !== "pending" || state.actionId !== event.actionId || event.stateVersion < state.authoritativeVersion) return state;
  return { status: event.accepted ? "accepted" : "rejected", scope: state.scope, authoritativeVersion: Math.max(state.authoritativeVersion, event.stateVersion), mode: state.mode, actionId: event.actionId, ackStateVersion: event.stateVersion, ...(event.reason ? { reason: event.reason } : {}) };
}
