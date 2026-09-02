import type { GameId, JsonValue } from "./index.js";
import type { ScoreDelta } from "./engine.js";

/** Stage 9 closes the catalog with the two risk/timing games. */
export type Stage9GameId = Extract<GameId, "rus-ruleti" | "son-kisi">;

export const STAGE9_GAME_IDS = ["rus-ruleti", "son-kisi"] as const satisfies readonly Stage9GameId[];

export type Stage9RandomSource = () => number;

export interface Stage9PointsView {
  readonly playerId: string;
  readonly points: number;
}

export interface RusRuletiShotView {
  readonly shooterId: string;
  readonly targetPlayerId: string;
  readonly exploded: boolean;
  readonly riskPercent: number;
}

export interface RusRuletiResultView {
  readonly playerId: string;
  readonly survived: boolean;
  readonly points: number;
}

export type RusRuletiSubPhase = "shot" | "results";

export interface RusRuletiPublicState {
  readonly gameId: "rus-ruleti";
  readonly kind: "rus-ruleti";
  readonly started: boolean;
  readonly subPhase: RusRuletiSubPhase;
  readonly phaseEndsAt: number | null;
  readonly currentHolderId: string | null;
  readonly alivePlayerIds: readonly string[];
  readonly eliminatedPlayerIds: readonly string[];
  readonly shotCount: number;
  readonly lastShot: RusRuletiShotView | null;
  readonly results: readonly RusRuletiResultView[] | null;
  readonly resultPoints: readonly Stage9PointsView[] | null;
  readonly finished: boolean;
}

export interface RusRuletiOwnState {
  readonly gameId: "rus-ruleti";
  readonly kind: "rus-ruleti";
  readonly isHolder: boolean;
  /** Risk is private to the player currently holding the weapon. */
  readonly riskPercent: number | null;
  readonly alivePlayerCount: number;
  readonly canShoot: boolean;
  readonly eliminated: boolean;
  readonly finished: boolean;
}

export interface SonKisiResultView {
  readonly playerId: string;
  readonly escaped: boolean;
  readonly elapsedMs: number | null;
  readonly points: number;
}

export interface SonKisiPublicState {
  readonly gameId: "son-kisi";
  readonly kind: "son-kisi";
  readonly started: boolean;
  /** The actual finish deadline is never sent before the result screen. */
  readonly phaseEndsAt: null;
  readonly escapeCount: number;
  readonly escapedPlayerIds: readonly string[];
  readonly durationMs: number | null;
  readonly results: readonly SonKisiResultView[] | null;
  readonly resultPoints: readonly Stage9PointsView[] | null;
  readonly finished: boolean;
}

export interface SonKisiOwnState {
  readonly gameId: "son-kisi";
  readonly kind: "son-kisi";
  readonly hasEscaped: boolean;
  readonly escapedAt: number | null;
  readonly canEscape: boolean;
  readonly finished: boolean;
}

export type Stage9PublicState = RusRuletiPublicState | SonKisiPublicState;
export type Stage9OwnState = RusRuletiOwnState | SonKisiOwnState;

export type Stage9InputRejection =
  | "phase-locked"
  | "late"
  | "duplicate"
  | "spectator"
  | "invalid";

export type Stage9SubmitResult =
  | { readonly accepted: true }
  | { readonly accepted: false; readonly reason: Stage9InputRejection };

export interface Stage9GameAdapter {
  readonly gameId: Stage9GameId;
  readonly playerIds: readonly string[];
  readonly isStarted: boolean;
  readonly isFinished: boolean;
  readonly eliminatedPlayerIds: readonly string[];
  start(now: number): void;
  advance(now: number): boolean;
  submit(playerId: string, payload: JsonValue | null, now: number): Stage9SubmitResult;
  removePlayer(playerId: string): void;
  getPublicState(now: number): Stage9PublicState;
  getOwnState(playerId: string, now: number): Stage9OwnState;
  getMiniGameScores(): ReadonlyMap<string, number>;
  getScoreDeltas(): readonly ScoreDelta[];
}

const DEFAULT_RANDOM: Stage9RandomSource = () => Math.random();
const RUSSIAN_INITIAL_RISK = 16;
const RUSSIAN_MAX_RISK = 76;
const RUSSIAN_RISK_STEP = 10;
const RUSSIAN_DECISION_MS = 18_000;
const LAST_PERSON_MIN_SECONDS = 10;
const LAST_PERSON_MAX_SECONDS = 20;

function assertNow(now: number): void {
  if (!Number.isFinite(now)) {
    throw new Error("Mini oyun zamanı sonlu bir sayı olmalı.");
  }
}

function uniquePlayerIds(playerIds: readonly string[]): string[] {
  return [...new Set(playerIds)];
}

function copyScores(playerIds: readonly string[]): Map<string, number> {
  return new Map(playerIds.map((playerId) => [playerId, 0] as const));
}

function randomIndex(length: number, random: Stage9RandomSource): number {
  if (length <= 1) return 0;
  const value = random();
  const normalized = Number.isFinite(value) ? Math.max(0, Math.min(0.999999, value)) : 0;
  return Math.floor(normalized * length);
}

function randomFrom<T>(values: readonly T[], random: Stage9RandomSource): T | null {
  return values.length === 0 ? null : values[randomIndex(values.length, random)] ?? null;
}

function isJsonObject(value: JsonValue | null): value is { readonly [key: string]: JsonValue } {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function inputKind(payload: JsonValue | null): string | null {
  return isJsonObject(payload) && typeof payload.kind === "string" ? payload.kind : null;
}

function inputString(payload: JsonValue | null, key: string): string | null {
  return isJsonObject(payload) && typeof payload[key] === "string" ? payload[key] as string : null;
}

function pointsView(scores: ReadonlyMap<string, number>): Stage9PointsView[] {
  return [...scores.entries()].map(([playerId, points]) => ({ playerId, points }));
}

abstract class Stage9AdapterBase implements Stage9GameAdapter {
  abstract readonly gameId: Stage9GameId;
  readonly initialPlayerIds: readonly string[];
  playerIds: readonly string[];
  protected readonly miniScores: Map<string, number>;
  protected readonly deltas: ScoreDelta[] = [];
  protected startedAt: number | null = null;
  protected finished = false;

  constructor(playerIds: readonly string[]) {
    this.initialPlayerIds = uniquePlayerIds(playerIds);
    this.playerIds = [...this.initialPlayerIds];
    this.miniScores = copyScores(this.initialPlayerIds);
  }

  get isStarted(): boolean { return this.startedAt !== null; }
  get isFinished(): boolean { return this.finished; }
  get eliminatedPlayerIds(): readonly string[] { return []; }

  abstract advance(now: number): boolean;
  abstract submit(playerId: string, payload: JsonValue | null, now: number): Stage9SubmitResult;
  abstract getPublicState(now: number): Stage9PublicState;
  abstract getOwnState(playerId: string, now: number): Stage9OwnState;

  start(now: number): void {
    assertNow(now);
    if (this.startedAt === null) this.startedAt = now;
  }

  protected addMini(playerId: string, points: number): void {
    if (points !== 0 && this.miniScores.has(playerId)) {
      this.miniScores.set(playerId, (this.miniScores.get(playerId) ?? 0) + points);
    }
  }

  protected addDirect(playerId: string, points: number, reason: string): void {
    if (points === 0 || !this.miniScores.has(playerId)) return;
    this.addMini(playerId, points);
    this.deltas.push({ playerId, points, reason });
  }

  protected finish(): void { this.finished = true; }

  removePlayer(playerId: string): void {
    this.playerIds = this.playerIds.filter((candidate) => candidate !== playerId);
    this.miniScores.delete(playerId);
  }

  getMiniGameScores(): ReadonlyMap<string, number> { return new Map(this.miniScores); }
  getScoreDeltas(): readonly ScoreDelta[] { return [...this.deltas]; }
}

class RusRuletiAdapter extends Stage9AdapterBase {
  readonly gameId = "rus-ruleti" as const;
  private readonly random: Stage9RandomSource;
  private readonly alive = new Set<string>();
  private readonly eliminated = new Set<string>();
  private readonly shots: RusRuletiShotView[] = [];
  private readonly resultsCache: RusRuletiResultView[] = [];
  private currentHolderId: string | null;
  private riskPercent = RUSSIAN_INITIAL_RISK;
  private phaseEndsAt: number | null = null;
  private lastShot: RusRuletiShotView | null = null;
  private subPhase: RusRuletiSubPhase = "shot";

  constructor(playerIds: readonly string[], random: Stage9RandomSource) {
    super(playerIds);
    this.random = random;
    this.initialPlayerIds.forEach((playerId) => this.alive.add(playerId));
    this.currentHolderId = randomFrom(this.initialPlayerIds, random);
  }

  override get eliminatedPlayerIds(): readonly string[] { return [...this.eliminated]; }

  override start(now: number): void {
    super.start(now);
    if (this.phaseEndsAt === null && !this.finished) this.phaseEndsAt = now + RUSSIAN_DECISION_MS;
  }

  private aliveIds(): string[] {
    return this.initialPlayerIds.filter((playerId) => this.alive.has(playerId));
  }

  private eliminationThreshold(): number {
    return Math.floor(this.initialPlayerIds.length / 2);
  }

  private finishGame(): void {
    if (this.finished) return;

    const aliveIds = new Set(this.aliveIds());
    this.resultsCache.push(...this.initialPlayerIds.map((playerId) => {
      const survived = aliveIds.has(playerId);
      const points = survived ? 1 : 0;
      if (points > 0) this.addDirect(playerId, points, "rus-ruleti:hayatta-kalan");
      return { playerId, survived, points };
    }));

    this.currentHolderId = null;
    this.phaseEndsAt = null;
    this.subPhase = "results";
    this.finish();
  }

  private fire(shooterId: string, targetPlayerId: string, shotAt: number): void {
    const riskBeforeShot = this.riskPercent;
    const roll = this.random();
    const exploded = Number.isFinite(roll) && roll * 100 < riskBeforeShot;
    const shot: RusRuletiShotView = {
      shooterId,
      targetPlayerId,
      exploded,
      riskPercent: riskBeforeShot
    };

    this.lastShot = shot;
    this.shots.push(shot);

    if (exploded) {
      this.alive.delete(targetPlayerId);
      this.eliminated.add(targetPlayerId);
      this.riskPercent = RUSSIAN_INITIAL_RISK;

      if (this.alive.size <= this.eliminationThreshold()) {
        this.finishGame();
        return;
      }

      this.currentHolderId = randomFrom(this.aliveIds(), this.random);
      this.phaseEndsAt = shotAt + RUSSIAN_DECISION_MS;
      return;
    }

    this.riskPercent = Math.min(RUSSIAN_MAX_RISK, riskBeforeShot + RUSSIAN_RISK_STEP);
    this.currentHolderId = targetPlayerId;
    this.phaseEndsAt = shotAt + RUSSIAN_DECISION_MS;
  }

  advance(now: number): boolean {
    assertNow(now);
    if (!this.isStarted || this.finished || this.phaseEndsAt === null) return false;

    let changed = false;
    while (!this.finished && this.phaseEndsAt !== null && now >= this.phaseEndsAt) {
      const shooterId = this.currentHolderId;
      if (!shooterId || !this.alive.has(shooterId)) {
        this.currentHolderId = randomFrom(this.aliveIds(), this.random);
      }

      const activeShooterId = this.currentHolderId;
      if (!activeShooterId) {
        this.finishGame();
        return true;
      }

      const targets = this.aliveIds().filter((playerId) => playerId !== activeShooterId);
      const targetPlayerId = randomFrom(targets.length > 0 ? targets : this.aliveIds(), this.random);
      if (!targetPlayerId) {
        this.finishGame();
        return true;
      }

      const shotAt = this.phaseEndsAt;
      this.fire(activeShooterId, targetPlayerId, shotAt);
      changed = true;
    }

    return changed;
  }

  submit(playerId: string, payload: JsonValue | null, now: number): Stage9SubmitResult {
    assertNow(now);
    if (!this.initialPlayerIds.includes(playerId)) return { accepted: false, reason: "invalid" };
    if (this.eliminated.has(playerId)) return { accepted: false, reason: "spectator" };
    if (!this.isStarted || this.finished || this.subPhase !== "shot") return { accepted: false, reason: "phase-locked" };
    if (this.phaseEndsAt !== null && now >= this.phaseEndsAt) {
      this.advance(now);
      return { accepted: false, reason: "late" };
    }
    if (playerId !== this.currentHolderId) return { accepted: false, reason: "phase-locked" };
    if (inputKind(payload) !== "russian-shot") return { accepted: false, reason: "invalid" };

    const targetPlayerId = inputString(payload, "targetPlayerId");
    if (targetPlayerId === null || !this.alive.has(targetPlayerId)) {
      return { accepted: false, reason: "invalid" };
    }

    this.fire(playerId, targetPlayerId, now);
    return { accepted: true };
  }

  override removePlayer(playerId: string): void {
    if (!this.initialPlayerIds.includes(playerId)) return;
    this.alive.delete(playerId);
    this.eliminated.add(playerId);
    super.removePlayer(playerId);

    if (this.finished) return;
    if (this.alive.size <= this.eliminationThreshold()) {
      this.finishGame();
      return;
    }

    if (this.currentHolderId === playerId) {
      this.currentHolderId = randomFrom(this.aliveIds(), this.random);
      this.phaseEndsAt = Date.now() + RUSSIAN_DECISION_MS;
    }
  }

  getPublicState(_now: number): RusRuletiPublicState {
    return {
      gameId: this.gameId,
      kind: this.gameId,
      started: this.isStarted,
      subPhase: this.subPhase,
      phaseEndsAt: this.phaseEndsAt,
      currentHolderId: this.currentHolderId,
      alivePlayerIds: this.aliveIds(),
      eliminatedPlayerIds: [...this.eliminated],
      shotCount: this.shots.length,
      lastShot: this.lastShot,
      results: this.finished ? [...this.resultsCache] : null,
      resultPoints: this.finished ? pointsView(this.miniScores) : null,
      finished: this.finished
    };
  }

  getOwnState(playerId: string, _now: number): RusRuletiOwnState {
    const isHolder = this.currentHolderId === playerId && this.alive.has(playerId);
    return {
      gameId: this.gameId,
      kind: this.gameId,
      isHolder,
      riskPercent: isHolder && !this.finished ? this.riskPercent : null,
      alivePlayerCount: this.alive.size,
      canShoot: isHolder && !this.finished && this.subPhase === "shot",
      eliminated: this.eliminated.has(playerId),
      finished: this.finished
    };
  }
}

class SonKisiAdapter extends Stage9AdapterBase {
  readonly gameId = "son-kisi" as const;
  private readonly random: Stage9RandomSource;
  private readonly escapedAtByPlayer = new Map<string, number>();
  private readonly resultsCache: SonKisiResultView[] = [];
  private secretFinishAt: number | null = null;
  private secretDurationMs: number | null = null;

  constructor(playerIds: readonly string[], random: Stage9RandomSource) {
    super(playerIds);
    this.random = random;
  }

  override start(now: number): void {
    super.start(now);
    if (this.secretFinishAt !== null) return;
    const seconds = LAST_PERSON_MIN_SECONDS + randomIndex(LAST_PERSON_MAX_SECONDS - LAST_PERSON_MIN_SECONDS + 1, this.random);
    this.secretDurationMs = seconds * 1_000;
    this.secretFinishAt = now + this.secretDurationMs;
  }

  private resolve(): void {
    if (this.finished) return;

    const escapeTimes = [...this.escapedAtByPlayer.values()];
    const lastEscapeAt = escapeTimes.length > 0 ? Math.max(...escapeTimes) : null;

    this.resultsCache.push(...this.initialPlayerIds.map((playerId) => {
      const escapedAt = this.escapedAtByPlayer.get(playerId) ?? null;
      const escaped = escapedAt !== null;
      const points = !escaped ? -1 : escapedAt === lastEscapeAt ? 1 : 0;
      this.addDirect(playerId, points, points > 0 ? "son-kisi:son-kacan" : "son-kisi:puanlama");
      return {
        playerId,
        escaped,
        elapsedMs: escapedAt === null || this.startedAt === null ? null : escapedAt - this.startedAt,
        points
      };
    }));

    this.secretFinishAt = null;
    this.finish();
  }

  advance(now: number): boolean {
    assertNow(now);
    if (!this.isStarted || this.finished || this.secretFinishAt === null || now < this.secretFinishAt) return false;
    this.resolve();
    return true;
  }

  submit(playerId: string, payload: JsonValue | null, now: number): Stage9SubmitResult {
    assertNow(now);
    if (!this.initialPlayerIds.includes(playerId)) return { accepted: false, reason: "invalid" };
    if (!this.isStarted || this.finished) return { accepted: false, reason: "phase-locked" };
    if (this.secretFinishAt !== null && now >= this.secretFinishAt) {
      this.resolve();
      return { accepted: false, reason: "late" };
    }
    if (this.escapedAtByPlayer.has(playerId)) return { accepted: false, reason: "duplicate" };
    if (inputKind(payload) !== "escape") return { accepted: false, reason: "invalid" };

    this.escapedAtByPlayer.set(playerId, now);
    return { accepted: true };
  }

  override removePlayer(playerId: string): void {
    this.escapedAtByPlayer.delete(playerId);
    super.removePlayer(playerId);
  }

  getPublicState(_now: number): SonKisiPublicState {
    return {
      gameId: this.gameId,
      kind: this.gameId,
      started: this.isStarted,
      phaseEndsAt: null,
      escapeCount: this.escapedAtByPlayer.size,
      escapedPlayerIds: [...this.escapedAtByPlayer.keys()],
      durationMs: this.finished ? this.secretDurationMs : null,
      results: this.finished ? [...this.resultsCache] : null,
      resultPoints: this.finished ? pointsView(this.miniScores) : null,
      finished: this.finished
    };
  }

  getOwnState(playerId: string, _now: number): SonKisiOwnState {
    const escapedAt = this.escapedAtByPlayer.get(playerId) ?? null;
    return {
      gameId: this.gameId,
      kind: this.gameId,
      hasEscaped: escapedAt !== null,
      escapedAt,
      canEscape: !this.finished && escapedAt === null,
      finished: this.finished
    };
  }
}

export function isStage9Game(gameId: GameId): gameId is Stage9GameId {
  return STAGE9_GAME_IDS.includes(gameId as Stage9GameId);
}

export function createStage9GameAdapter(
  gameId: Stage9GameId,
  playerIds: readonly string[],
  random: Stage9RandomSource = DEFAULT_RANDOM
): Stage9GameAdapter {
  switch (gameId) {
    case "rus-ruleti": return new RusRuletiAdapter(playerIds, random);
    case "son-kisi": return new SonKisiAdapter(playerIds, random);
  }
}
