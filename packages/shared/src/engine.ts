import type { GameDefinition, GameId } from "./index.js";

/** The common phases every mini game can use. Game-specific adapters may add
 * more detail inside `playing`, but the outer match contract stays the same. */
export type RuntimePhaseId =
  | "tutorial"
  | "preparing"
  | "playing"
  | "results"
  | "transition"
  | "finished";

export type PhaseAdvanceMode = "timer" | "all-ready-or-timeout" | "manual";

export interface GamePhaseDefinition {
  readonly id: Exclude<RuntimePhaseId, "finished">;
  readonly durationMs: number | null;
  readonly advance: PhaseAdvanceMode;
}

export type MiniGameInputPolicy = "single" | "repeatable" | "none";
export type MiniGameInputVisibility = "private" | "public";
export type MiniGameScoreTransfer = "direct" | "ranked";

export interface MiniGameDefinition {
  readonly id: GameId;
  readonly game: GameDefinition;
  readonly phases: readonly GamePhaseDefinition[];
  readonly inputPolicy: MiniGameInputPolicy;
  readonly inputVisibility: MiniGameInputVisibility;
  readonly allowEmptyInput: boolean;
  readonly scoreTransfer: MiniGameScoreTransfer;
}

export const DEMO_PHASE_PLAN = [
  { id: "tutorial", durationMs: 10_000, advance: "timer" },
  { id: "preparing", durationMs: 5_000, advance: "all-ready-or-timeout" },
  { id: "playing", durationMs: 12_000, advance: "timer" },
  { id: "results", durationMs: 5_000, advance: "timer" },
  { id: "transition", durationMs: 3_000, advance: "timer" }
] as const satisfies readonly GamePhaseDefinition[];

const REAL_GAME_PHASES = {
  tutorial: { id: "tutorial", durationMs: 10_000, advance: "timer" },
  preparing: { id: "preparing", durationMs: 5_000, advance: "all-ready-or-timeout" },
  results: { id: "results", durationMs: 6_000, advance: "timer" },
  transition: { id: "transition", durationMs: 3_000, advance: "timer" }
} as const;

const STAGE6_GAME_IDS = new Set<GameId>([
  "butona-bas",
  "sizma",
  "zaman-bombasi-hafizasi"
]);

const STAGE7_GAME_IDS = new Set<GameId>([
  "gizli-hirsiz",
  "kor-kronometre",
  "kor-bomba",
  "acgozluluk-limiti",
  "ortalamanin-yarisi",
  "gizli-kareler",
  "cizgiyi-gecme",
  "gizli-alisveris",
  "asiri-yukleme",
  "capraz-ates"
]);

const STAGE8_GAME_IDS = new Set<GameId>([
  "yazi-yaz",
  "kendim",
  "sozluk-blofu",
  "cagrisim-agi",
  "rusvet-darbe",
  "karalama-defteri",
  "ittifak",
  "kontrol-paneli-kaosu",
  "zehirli-kadeh"
]);

const STAGE9_GAME_IDS = new Set<GameId>([
  "rus-ruleti",
  "son-kisi"
]);

function isStage6GameId(gameId: GameId): boolean {
  return STAGE6_GAME_IDS.has(gameId);
}

function isStage7GameId(gameId: GameId): boolean {
  return STAGE7_GAME_IDS.has(gameId);
}

function isStage8GameId(gameId: GameId): boolean {
  return STAGE8_GAME_IDS.has(gameId);
}

function isStage9GameId(gameId: GameId): boolean {
  return STAGE9_GAME_IDS.has(gameId);
}

function getRealGameOptions(gameId: GameId): MiniGameDefinitionOptions | null {
  if (gameId === "butona-bas") {
    return {
      phases: [
        REAL_GAME_PHASES.tutorial,
        REAL_GAME_PHASES.preparing,
        { id: "playing", durationMs: 45_000, advance: "timer" },
        REAL_GAME_PHASES.results,
        REAL_GAME_PHASES.transition
      ],
      inputPolicy: "repeatable",
      inputVisibility: "private",
      allowEmptyInput: false,
      scoreTransfer: "ranked"
    };
  }

  if (gameId === "gizli-hirsiz" || gameId === "kor-kronometre" || gameId === "acgozluluk-limiti" || gameId === "ortalamanin-yarisi" || gameId === "cizgiyi-gecme" || gameId === "gizli-alisveris" || gameId === "capraz-ates") {
    const durationMs = gameId === "kor-kronometre"
      ? 18_000
      : gameId === "acgozluluk-limiti" || gameId === "ortalamanin-yarisi"
        ? 20_000
        : gameId === "cizgiyi-gecme" || gameId === "gizli-alisveris"
          ? 30_000
          : gameId === "capraz-ates"
            ? 25_000
            : 30_000;

    return {
      phases: [
        REAL_GAME_PHASES.tutorial,
        REAL_GAME_PHASES.preparing,
        { id: "playing", durationMs, advance: "timer" },
        REAL_GAME_PHASES.results,
        REAL_GAME_PHASES.transition
      ],
      inputPolicy: gameId === "gizli-alisveris" ? "repeatable" : "single",
      inputVisibility: "private",
      allowEmptyInput: false,
      scoreTransfer: "direct"
    };
  }

  if (gameId === "kor-bomba" || gameId === "gizli-kareler" || gameId === "asiri-yukleme") {
    return {
      phases: [
        REAL_GAME_PHASES.tutorial,
        REAL_GAME_PHASES.preparing,
        { id: "playing", durationMs: null, advance: "manual" },
        REAL_GAME_PHASES.results,
        REAL_GAME_PHASES.transition
      ],
      inputPolicy: "repeatable",
      inputVisibility: "private",
      allowEmptyInput: false,
      scoreTransfer: "direct"
    };
  }

  if (isStage6GameId(gameId) || isStage7GameId(gameId)) {
    return {
      phases: [
        REAL_GAME_PHASES.tutorial,
        REAL_GAME_PHASES.preparing,
        { id: "playing", durationMs: null, advance: "manual" },
        REAL_GAME_PHASES.results,
        REAL_GAME_PHASES.transition
      ],
      inputPolicy: "repeatable",
      inputVisibility: "private",
      allowEmptyInput: false,
      scoreTransfer: "direct"
    };
  }

  if (isStage8GameId(gameId)) {
    return {
      phases: [
        REAL_GAME_PHASES.tutorial,
        REAL_GAME_PHASES.preparing,
        { id: "playing", durationMs: null, advance: "manual" },
        REAL_GAME_PHASES.results,
        REAL_GAME_PHASES.transition
      ],
      inputPolicy: "repeatable",
      inputVisibility: "private",
      allowEmptyInput: false,
      scoreTransfer: "direct"
    };
  }

  if (isStage9GameId(gameId)) {
    return {
      phases: [
        REAL_GAME_PHASES.tutorial,
        REAL_GAME_PHASES.preparing,
        { id: "playing", durationMs: null, advance: "manual" },
        REAL_GAME_PHASES.results,
        REAL_GAME_PHASES.transition
      ],
      inputPolicy: "repeatable",
      inputVisibility: "private",
      allowEmptyInput: false,
      scoreTransfer: "direct"
    };
  }

  return null;
}

export interface MiniGameDefinitionOptions {
  readonly phases?: readonly GamePhaseDefinition[];
  readonly inputPolicy?: MiniGameInputPolicy;
  readonly inputVisibility?: MiniGameInputVisibility;
  readonly allowEmptyInput?: boolean;
  readonly scoreTransfer?: MiniGameScoreTransfer;
}

export function createMiniGameDefinition(
  game: GameDefinition,
  options: MiniGameDefinitionOptions = {}
): MiniGameDefinition {
  return {
    id: game.id as GameId,
    game,
    phases: options.phases ?? DEMO_PHASE_PLAN,
    inputPolicy: options.inputPolicy ?? "single",
    inputVisibility: options.inputVisibility ?? "private",
    allowEmptyInput: options.allowEmptyInput ?? true,
    scoreTransfer: options.scoreTransfer ?? "direct"
  };
}

export function createMiniGameRegistry(
  catalog: readonly GameDefinition[]
): ReadonlyMap<GameId, MiniGameDefinition> {
  return new Map(
    catalog.map((game) => {
      const gameId = game.id as GameId;
      const options = getRealGameOptions(gameId);
      return [gameId, createMiniGameDefinition(game, options ?? undefined)] as const;
    })
  );
}

export interface MiniGameInputRecord<T = unknown> {
  readonly playerId: string;
  readonly sequence: number;
  readonly receivedAt: number;
  readonly clientTime: number | null;
  readonly payload: T | null;
  readonly empty: boolean;
}

export type InputRejectionReason =
  | "unknown-player"
  | "spectator"
  | "phase-locked"
  | "late"
  | "duplicate"
  | "input-disabled"
  | "empty-not-allowed";

export type SubmitInputResult<T = unknown> =
  | { readonly accepted: true; readonly record: MiniGameInputRecord<T> }
  | { readonly accepted: false; readonly reason: InputRejectionReason };

export interface PreparedMiniGameInput<T = unknown> {
  readonly playerId: string;
  readonly payload: T | null;
  readonly receivedAt: number;
  readonly clientTime: number | null;
  readonly empty: boolean;
  readonly phaseIndex: number;
}

export type PrepareInputResult<T = unknown> =
  | { readonly accepted: true; readonly prepared: PreparedMiniGameInput<T> }
  | { readonly accepted: false; readonly reason: InputRejectionReason };

export interface MiniGameEngineSnapshot {
  readonly gameId: GameId;
  readonly phase: RuntimePhaseId;
  readonly phaseIndex: number;
  readonly phaseStartedAt: number;
  readonly phaseEndsAt: number | null;
  readonly readyPlayerIds: readonly string[];
  readonly eliminatedPlayerIds: readonly string[];
  readonly inputCount: number;
  readonly nextInputSequence: number;
}

function assertTimestamp(timestamp: number): void {
  if (!Number.isFinite(timestamp)) {
    throw new Error("Motor zamanı sonlu bir sayı olmalı.");
  }
}

function validatePhasePlan(phases: readonly GamePhaseDefinition[]): void {
  if (phases.length === 0) {
    throw new Error("Mini oyun en az bir faz içermeli.");
  }

  const seen = new Set<string>();

  phases.forEach((phase) => {
    if (seen.has(phase.id)) {
      throw new Error(`Mini oyun fazı tekrar ediyor: ${phase.id}`);
    }

    seen.add(phase.id);

    if (
      phase.durationMs !== null &&
      (!Number.isFinite(phase.durationMs) || phase.durationMs < 0)
    ) {
      throw new Error(`Geçersiz faz süresi: ${phase.id}`);
    }

    if (phase.advance !== "manual" && phase.durationMs === null) {
      throw new Error(`Zamanla ilerleyen fazın süresi olmalı: ${phase.id}`);
    }
  });
}

export class MiniGameEngine {
  readonly definition: MiniGameDefinition;
  readonly playerIds: readonly string[];

  private readonly playerSet: ReadonlySet<string>;
  private readonly readyPlayerSet = new Set<string>();
  private readonly eliminatedPlayerSet = new Set<string>();
  private readonly inputs: MiniGameInputRecord[] = [];
  private readonly submittedPlayerSet = new Set<string>();
  private phaseIndex = 0;
  private phaseStartedAt: number;
  private nextInputSequence = 1;

  constructor(
    definition: MiniGameDefinition,
    playerIds: readonly string[],
    startedAt: number
  ) {
    assertTimestamp(startedAt);
    validatePhasePlan(definition.phases);

    const uniquePlayerIds = [...new Set(playerIds)];

    if (uniquePlayerIds.length === 0) {
      throw new Error("Mini oyun en az bir oyuncu gerektirir.");
    }

    this.definition = definition;
    this.playerIds = uniquePlayerIds;
    this.playerSet = new Set(uniquePlayerIds);
    this.phaseStartedAt = startedAt;
  }

  get currentPhase(): RuntimePhaseId {
    return this.phaseIndex >= this.definition.phases.length
      ? "finished"
      : this.definition.phases[this.phaseIndex]!.id;
  }

  get currentPhaseDefinition(): GamePhaseDefinition | null {
    return this.definition.phases[this.phaseIndex] ?? null;
  }

  get isFinished(): boolean {
    return this.currentPhase === "finished";
  }

  get activePlayerIds(): readonly string[] {
    return this.playerIds.filter((playerId) => !this.eliminatedPlayerSet.has(playerId));
  }

  private currentPhaseEndsAt(): number | null {
    const phase = this.currentPhaseDefinition;

    if (!phase || phase.durationMs === null) {
      return null;
    }

    return this.phaseStartedAt + phase.durationMs;
  }

  private shouldAdvance(now: number): boolean {
    const phase = this.currentPhaseDefinition;

    if (!phase) {
      return false;
    }

    if (phase.advance === "manual") {
      return false;
    }

    if (phase.advance === "all-ready-or-timeout") {
      const allActiveReady = this.activePlayerIds.every((playerId) =>
        this.readyPlayerSet.has(playerId)
      );

      if (allActiveReady) {
        return true;
      }
    }

    const phaseEndsAt = this.currentPhaseEndsAt();
    return phaseEndsAt !== null && now >= phaseEndsAt;
  }

  private enterNextPhase(now: number): void {
    const current = this.currentPhaseDefinition;
    const scheduledStart = this.currentPhaseEndsAt();

    this.phaseIndex += 1;
    this.readyPlayerSet.clear();
    this.submittedPlayerSet.clear();
    this.phaseStartedAt =
      current?.advance === "timer" && scheduledStart !== null && scheduledStart <= now
        ? scheduledStart
        : now;
  }

  /** Advances only from server time. Calling it repeatedly with the same time is safe. */
  advance(now: number): MiniGameEngineSnapshot {
    assertTimestamp(now);

    while (!this.isFinished && this.shouldAdvance(now)) {
      this.enterNextPhase(now);
    }

    return this.snapshot(now);
  }

  advanceManually(now: number): MiniGameEngineSnapshot {
    assertTimestamp(now);

    if (this.currentPhaseDefinition?.advance === "manual") {
      this.enterNextPhase(now);
    }

    return this.advance(now);
  }

  markReady(playerId: string, now: number): boolean {
    assertTimestamp(now);

    if (
      !this.playerSet.has(playerId) ||
      this.eliminatedPlayerSet.has(playerId) ||
      this.currentPhase !== "preparing"
    ) {
      return false;
    }

    this.readyPlayerSet.add(playerId);
    this.advance(now);
    return true;
  }

  eliminatePlayer(playerId: string): boolean {
    if (!this.playerSet.has(playerId)) {
      return false;
    }

    this.eliminatedPlayerSet.add(playerId);
    this.readyPlayerSet.delete(playerId);
    return true;
  }

  prepareInput<T = unknown>(
    playerId: string,
    payload: T | null,
    now: number,
    clientTime: number | null = null
  ): PrepareInputResult<T> {
    assertTimestamp(now);

    if (!this.playerSet.has(playerId)) {
      return { accepted: false, reason: "unknown-player" };
    }

    if (this.eliminatedPlayerSet.has(playerId)) {
      return { accepted: false, reason: "spectator" };
    }

    if (this.currentPhase === "playing") {
      const phaseEndsAt = this.currentPhaseEndsAt();

      if (phaseEndsAt !== null && now >= phaseEndsAt) {
        this.advance(now);
        return { accepted: false, reason: "late" };
      }
    } else {
      return { accepted: false, reason: "phase-locked" };
    }

    if (this.definition.inputPolicy === "none") {
      return { accepted: false, reason: "input-disabled" };
    }

    if (
      this.definition.inputPolicy === "single" &&
      this.submittedPlayerSet.has(playerId)
    ) {
      return { accepted: false, reason: "duplicate" };
    }

    const empty = payload === null;

    if (empty && !this.definition.allowEmptyInput) {
      return { accepted: false, reason: "empty-not-allowed" };
    }

    return {
      accepted: true,
      prepared: { playerId, payload, receivedAt: now, clientTime, empty, phaseIndex: this.phaseIndex }
    };
  }

  commitPreparedInput<T = unknown>(prepared: PreparedMiniGameInput<T>): MiniGameInputRecord<T> {
    if (prepared.phaseIndex !== this.phaseIndex) {
      throw new Error("Prepared input crossed an authoritative phase boundary.");
    }
    const record: MiniGameInputRecord<T> = {
      playerId: prepared.playerId,
      sequence: this.nextInputSequence,
      receivedAt: prepared.receivedAt,
      clientTime: prepared.clientTime,
      payload: prepared.payload,
      empty: prepared.empty
    };
    this.nextInputSequence += 1;
    this.inputs.push(record);
    this.submittedPlayerSet.add(prepared.playerId);
    return record;
  }

  submitInput<T = unknown>(playerId: string, payload: T | null, now: number, clientTime: number | null = null): SubmitInputResult<T> {
    const result = this.prepareInput(playerId, payload, now, clientTime);
    return result.accepted
      ? { accepted: true, record: this.commitPreparedInput(result.prepared) }
      : result;
  }

  getMissingActivePlayerIds(): readonly string[] {
    return this.activePlayerIds.filter((playerId) => !this.submittedPlayerSet.has(playerId));
  }

  getAllInputs<T = unknown>(): readonly MiniGameInputRecord<T>[] {
    return [...(this.inputs as MiniGameInputRecord<T>[])].sort(
      (left, right) => left.receivedAt - right.receivedAt || left.sequence - right.sequence
    );
  }

  /** Private inputs are only returned to their owner; public games can expose all records. */
  getVisibleInputs<T = unknown>(viewerId: string): readonly MiniGameInputRecord<T>[] {
    const inputs = this.getAllInputs<T>();

    if (this.definition.inputVisibility === "public") {
      return inputs;
    }

    return inputs.filter((input) => input.playerId === viewerId);
  }

  isEliminated(playerId: string): boolean {
    return this.eliminatedPlayerSet.has(playerId);
  }

  snapshot(now: number): MiniGameEngineSnapshot {
    assertTimestamp(now);

    return {
      gameId: this.definition.id,
      phase: this.currentPhase,
      phaseIndex: this.phaseIndex,
      phaseStartedAt: this.phaseStartedAt,
      phaseEndsAt: this.currentPhaseEndsAt(),
      readyPlayerIds: [...this.readyPlayerSet],
      eliminatedPlayerIds: [...this.eliminatedPlayerSet],
      inputCount: this.inputs.length,
      nextInputSequence: this.nextInputSequence
    };
  }
}

export interface RankedScore {
  readonly playerId: string;
  readonly score: number;
  readonly rank: number;
}

export function rankScores(scoreByPlayer: Readonly<Record<string, number>>): readonly RankedScore[] {
  const sorted = Object.entries(scoreByPlayer)
    .map(([playerId, score]) => ({ playerId, score }))
    .sort((left, right) => right.score - left.score || left.playerId.localeCompare(right.playerId));

  let previousScore: number | undefined;
  let previousRank = 0;

  return sorted.map((entry, index) => {
    const rank = entry.score === previousScore ? previousRank : index + 1;
    previousScore = entry.score;
    previousRank = rank;
    return { ...entry, rank };
  });
}

export interface RankAwardOptions {
  readonly uniqueLeaderPoints: number;
  readonly nextRankPoints: number;
  readonly tiedLeaderPoints: number;
  readonly awardAllTiedNextRank?: boolean;
}

export function createRankAwards(
  scoreByPlayer: Readonly<Record<string, number>>,
  options: RankAwardOptions
): Readonly<Record<string, number>> {
  const ranked = rankScores(scoreByPlayer);

  if (ranked.length === 0) {
    return {};
  }

  const topScore = ranked[0]!.score;
  const leaders = ranked.filter((entry) => entry.score === topScore);
  const awards: Record<string, number> = {};

  if (leaders.length > 1) {
    leaders.forEach((entry) => {
      awards[entry.playerId] = options.tiedLeaderPoints;
    });
    return awards;
  }

  awards[leaders[0]!.playerId] = options.uniqueLeaderPoints;
  const nextScore = ranked.find((entry) => entry.score < topScore)?.score;

  if (nextScore === undefined) {
    return awards;
  }

  const nextPlayers = ranked.filter((entry) => entry.score === nextScore);

  if (nextPlayers.length === 1 || options.awardAllTiedNextRank) {
    nextPlayers.forEach((entry) => {
      awards[entry.playerId] = options.nextRankPoints;
    });
  }

  return awards;
}

export interface ScoreDelta {
  readonly playerId: string;
  readonly points: number;
  readonly reason: string;
}

export function applyScoreDeltas(
  currentScores: Readonly<Record<string, number>>,
  deltas: readonly ScoreDelta[]
): Readonly<Record<string, number>> {
  const nextScores: Record<string, number> = { ...currentScores };

  deltas.forEach((delta) => {
    nextScores[delta.playerId] = (nextScores[delta.playerId] ?? 0) + delta.points;
  });

  return nextScores;
}

export function awardMapToDeltas(
  awards: Readonly<Record<string, number>>,
  reason: string
): readonly ScoreDelta[] {
  return Object.entries(awards)
    .filter(([, points]) => points !== 0)
    .map(([playerId, points]) => ({ playerId, points, reason }));
}
