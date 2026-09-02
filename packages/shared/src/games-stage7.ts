import type { GameId, JsonValue } from "./index.js";
import type { ScoreDelta } from "./engine.js";

export type Stage7GameId =
  | "gizli-hirsiz"
  | "kor-kronometre"
  | "kor-bomba"
  | "acgozluluk-limiti"
  | "ortalamanin-yarisi"
  | "gizli-kareler"
  | "cizgiyi-gecme"
  | "gizli-alisveris"
  | "asiri-yukleme"
  | "capraz-ates";

export const STAGE7_GAME_IDS = [
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
] as const satisfies readonly Stage7GameId[];

export type Stage7RandomSource = () => number;

export interface Stage7PointsView {
  readonly playerId: string;
  readonly points: number;
}

export interface GizliHirsizPublicState {
  readonly gameId: "gizli-hirsiz";
  readonly kind: "gizli-hirsiz";
  readonly started: boolean;
  readonly endsAt: number | null;
  readonly finished: boolean;
  readonly pressedPlayerIds: readonly string[] | null;
  readonly pressCount: number | null;
  readonly resultPoints: readonly Stage7PointsView[] | null;
}

export interface GizliHirsizOwnState {
  readonly gameId: "gizli-hirsiz";
  readonly kind: "gizli-hirsiz";
  readonly hasPressed: boolean;
  readonly finished: boolean;
}

export interface StopwatchResultView {
  readonly playerId: string;
  readonly elapsedMs: number;
  readonly distanceMs: number;
  readonly tapped: boolean;
}

export interface KorKronometrePublicState {
  readonly gameId: "kor-kronometre";
  readonly kind: "kor-kronometre";
  readonly started: boolean;
  readonly endsAt: number | null;
  readonly finished: boolean;
  readonly targetMs: number | null;
  readonly results: readonly StopwatchResultView[] | null;
  readonly resultPoints: readonly Stage7PointsView[] | null;
}

export interface KorKronometreOwnState {
  readonly gameId: "kor-kronometre";
  readonly kind: "kor-kronometre";
  readonly hasTapped: boolean;
  readonly elapsedMs: number | null;
  readonly finished: boolean;
}

export interface KorBombaPublicState {
  readonly gameId: "kor-bomba";
  readonly kind: "kor-bomba";
  readonly started: boolean;
  readonly bombHolderId: string | null;
  readonly passCount: number;
  readonly finished: boolean;
  readonly explodedPlayerId: string | null;
  readonly resultPoints: readonly Stage7PointsView[] | null;
}

export interface KorBombaOwnState {
  readonly gameId: "kor-bomba";
  readonly kind: "kor-bomba";
  readonly hasBomb: boolean;
  /** Bomb carrier intentionally receives null; other players see the real remaining time. */
  readonly visibleRemainingMs: number | null;
  readonly targetPlayerIds: readonly string[];
  readonly canPass: boolean;
  readonly finished: boolean;
}

export interface AcgozlulukPublicState {
  readonly gameId: "acgozluluk-limiti";
  readonly kind: "acgozluluk-limiti";
  readonly started: boolean;
  readonly endsAt: number | null;
  readonly limit: number;
  readonly maxChoice: number;
  readonly finished: boolean;
  readonly choices: readonly { readonly playerId: string; readonly value: number }[] | null;
  readonly total: number | null;
  readonly withinLimit: boolean | null;
  readonly resultPoints: readonly Stage7PointsView[] | null;
}

export interface AcgozlulukOwnState {
  readonly gameId: "acgozluluk-limiti";
  readonly kind: "acgozluluk-limiti";
  readonly selectedValue: number;
  readonly hasSubmitted: boolean;
  readonly finished: boolean;
}

export interface AverageResultView {
  readonly playerId: string;
  readonly value: number;
  readonly distanceMs: number;
  readonly generatedForMissingInput: boolean;
}

export interface OrtalamaninYarisiPublicState {
  readonly gameId: "ortalamanin-yarisi";
  readonly kind: "ortalamanin-yarisi";
  readonly started: boolean;
  readonly endsAt: number | null;
  readonly finished: boolean;
  readonly target: number | null;
  readonly average: number | null;
  readonly results: readonly AverageResultView[] | null;
  readonly resultPoints: readonly Stage7PointsView[] | null;
}

export interface OrtalamaninYarisiOwnState {
  readonly gameId: "ortalamanin-yarisi";
  readonly kind: "ortalamanin-yarisi";
  readonly selectedValue: number | null;
  readonly hasSubmitted: boolean;
  readonly finished: boolean;
}

export interface GizliKareRoundResult {
  readonly round: 1 | 2;
  readonly selections: readonly { readonly playerId: string; readonly cell: number }[];
  readonly soloPlayerIds: readonly string[];
  readonly collidedPlayerIds: readonly string[];
}

export interface GizliKarelerPublicState {
  readonly gameId: "gizli-kareler";
  readonly kind: "gizli-kareler";
  readonly started: boolean;
  readonly round: 1 | 2;
  readonly roundEndsAt: number | null;
  readonly gridSize: 3 | 4;
  readonly cellCount: number;
  readonly finished: boolean;
  readonly earlyFinish: boolean;
  readonly eliminatedPlayerIds: readonly string[];
  readonly results: readonly GizliKareRoundResult[] | null;
  readonly resultPoints: readonly Stage7PointsView[] | null;
}

export interface GizliKarelerOwnState {
  readonly gameId: "gizli-kareler";
  readonly kind: "gizli-kareler";
  readonly selectedCell: number | null;
  readonly canSelect: boolean;
  readonly eliminated: boolean;
  readonly finished: boolean;
}

export interface CizgiyiGecmePublicState {
  readonly gameId: "cizgiyi-gecme";
  readonly kind: "cizgiyi-gecme";
  readonly started: boolean;
  readonly endsAt: number | null;
  readonly finished: boolean;
  readonly results: readonly {
    readonly playerId: string;
    readonly value: number | null;
    readonly bucket: number | null;
    readonly evaluated: boolean;
    readonly points: number;
  }[] | null;
  readonly resultPoints: readonly Stage7PointsView[] | null;
}

export interface CizgiyiGecmeOwnState {
  readonly gameId: "cizgiyi-gecme";
  readonly kind: "cizgiyi-gecme";
  readonly selectedValue: number | null;
  readonly hasSubmitted: boolean;
  readonly finished: boolean;
}

export interface ShoppingProduct {
  readonly id: string;
  readonly name: string;
  readonly price: number;
}

export interface ShoppingResultView {
  readonly playerId: string;
  readonly basketValue: number;
  readonly productIds: readonly string[];
}

export interface GizliAlisverisPublicState {
  readonly gameId: "gizli-alisveris";
  readonly kind: "gizli-alisveris";
  readonly started: boolean;
  readonly endsAt: number | null;
  readonly budget: number;
  readonly products: readonly ShoppingProduct[];
  readonly finished: boolean;
  readonly productBuyerCounts: Readonly<Record<string, number>> | null;
  readonly results: readonly ShoppingResultView[] | null;
  readonly resultPoints: readonly Stage7PointsView[] | null;
}

export interface GizliAlisverisOwnState {
  readonly gameId: "gizli-alisveris";
  readonly kind: "gizli-alisveris";
  readonly cartProductIds: readonly string[];
  readonly spent: number;
  readonly remainingBudget: number;
  readonly finished: boolean;
}

export interface AsiriYuklemePublicState {
  readonly gameId: "asiri-yukleme";
  readonly kind: "asiri-yukleme";
  readonly started: boolean;
  readonly energy: number;
  readonly armed: boolean;
  readonly finished: boolean;
  readonly explodedPlayerId: string | null;
  readonly clickCounts: Readonly<Record<string, number>> | null;
  readonly resultPoints: readonly Stage7PointsView[] | null;
}

export interface AsiriYuklemeOwnState {
  readonly gameId: "asiri-yukleme";
  readonly kind: "asiri-yukleme";
  readonly clickCount: number;
  readonly armed: boolean;
  readonly exploded: boolean;
  readonly finished: boolean;
}

export interface CaprazAtesResultView {
  readonly playerId: string;
  readonly targetPlayerId: string | null;
  readonly incomingCount: number;
  readonly points: number;
}

export interface CaprazAtesPublicState {
  readonly gameId: "capraz-ates";
  readonly kind: "capraz-ates";
  readonly started: boolean;
  readonly endsAt: number | null;
  readonly finished: boolean;
  readonly results: readonly CaprazAtesResultView[] | null;
  readonly resultPoints: readonly Stage7PointsView[] | null;
}

export interface CaprazAtesOwnState {
  readonly gameId: "capraz-ates";
  readonly kind: "capraz-ates";
  readonly selectedTargetId: string | null;
  readonly availableTargetIds: readonly string[];
  readonly hasSubmitted: boolean;
  readonly finished: boolean;
}

export type Stage7PublicState =
  | GizliHirsizPublicState
  | KorKronometrePublicState
  | KorBombaPublicState
  | AcgozlulukPublicState
  | OrtalamaninYarisiPublicState
  | GizliKarelerPublicState
  | CizgiyiGecmePublicState
  | GizliAlisverisPublicState
  | AsiriYuklemePublicState
  | CaprazAtesPublicState;

export type Stage7OwnState =
  | GizliHirsizOwnState
  | KorKronometreOwnState
  | KorBombaOwnState
  | AcgozlulukOwnState
  | OrtalamaninYarisiOwnState
  | GizliKarelerOwnState
  | CizgiyiGecmeOwnState
  | GizliAlisverisOwnState
  | AsiriYuklemeOwnState
  | CaprazAtesOwnState;

export type Stage7InputRejection =
  | "phase-locked"
  | "late"
  | "duplicate"
  | "spectator"
  | "invalid";

export type Stage7SubmitResult =
  | { readonly accepted: true }
  | { readonly accepted: false; readonly reason: Stage7InputRejection };

export interface Stage7GameAdapter {
  readonly gameId: Stage7GameId;
  readonly playerIds: readonly string[];
  readonly isStarted: boolean;
  readonly isFinished: boolean;
  readonly eliminatedPlayerIds: readonly string[];
  start(now: number): void;
  advance(now: number): boolean;
  submit(playerId: string, payload: JsonValue | null, now: number): Stage7SubmitResult;
  removePlayer(playerId: string): void;
  getPublicState(now: number): Stage7PublicState;
  getOwnState(playerId: string, now: number): Stage7OwnState;
  getMiniGameScores(): ReadonlyMap<string, number>;
  getScoreDeltas(): readonly ScoreDelta[];
}

const DEFAULT_RANDOM: Stage7RandomSource = () => Math.random();
const THIRTY_SECONDS = 30_000;
const TWENTY_SECONDS = 20_000;
const EIGHTEEN_SECONDS = 18_000;
const TWENTY_FIVE_SECONDS = 25_000;

const LIMIT_BY_PLAYER_COUNT: Readonly<Record<number, number>> = {
  3: 6,
  4: 11,
  5: 17,
  6: 24,
  7: 33,
  8: 43
};

export const GIZLI_ALISVERIS_PRODUCTS: readonly ShoppingProduct[] = [
  { id: "hologram-sticker", name: "Hologram Sticker", price: 8 },
  { id: "enerji-icecegi", name: "Enerji İçeceği", price: 10 },
  { id: "neon-rozet", name: "Neon Rozet", price: 12 },
  { id: "retro-kartus", name: "Retro Kartuş", price: 15 },
  { id: "mini-hoparlor", name: "Mini Hoparlör", price: 18 },
  { id: "arcade-eldiveni", name: "Arcade Eldiveni", price: 20 },
  { id: "piksel-kamera", name: "Piksel Kamera", price: 22 },
  { id: "jet-canta", name: "Jet Çanta", price: 24 },
  { id: "kristal-kulaklik", name: "Kristal Kulaklık", price: 26 },
  { id: "holo-kask", name: "Holo Kask", price: 28 },
  { id: "mini-drone", name: "Mini Drone", price: 32 },
  { id: "gizli-sandik", name: "Gizli Sandık", price: 36 }
] as const;

function assertNow(now: number): void {
  if (!Number.isFinite(now)) {
    throw new Error("Mini oyun zamanı sonlu bir sayı olmalı.");
  }
}

function randomIndex(length: number, random: Stage7RandomSource): number {
  if (length <= 1) {
    return 0;
  }

  const value = random();
  const normalized = Number.isFinite(value) ? Math.max(0, Math.min(0.999999, value)) : 0;
  return Math.floor(normalized * length);
}

function randomInteger(min: number, max: number, random: Stage7RandomSource): number {
  return min + randomIndex(max - min + 1, random);
}

function uniquePlayerIds(playerIds: readonly string[]): string[] {
  return [...new Set(playerIds)];
}

function copyScores(playerIds: readonly string[]): Map<string, number> {
  return new Map(playerIds.map((playerId) => [playerId, 0] as const));
}

function scoreDelta(
  scores: Map<string, number>,
  deltas: ScoreDelta[],
  playerId: string,
  points: number,
  reason: string
): void {
  scores.set(playerId, (scores.get(playerId) ?? 0) + points);
  deltas.push({ playerId, points, reason });
}

function resultPoints(scores: ReadonlyMap<string, number>): Stage7PointsView[] {
  return [...scores.entries()].map(([playerId, points]) => ({ playerId, points }));
}

function scoresAsRecord(scores: ReadonlyMap<string, number>): Record<string, number> {
  return Object.fromEntries(scores.entries());
}

function isJsonObject(value: JsonValue | null): value is { readonly [key: string]: JsonValue } {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function inputKind(payload: JsonValue | null): string | null {
  if (!isJsonObject(payload) || typeof payload.kind !== "string") {
    return null;
  }

  return payload.kind;
}

function inputString(payload: JsonValue | null, key: string): string | null {
  if (!isJsonObject(payload) || typeof payload[key] !== "string") {
    return null;
  }

  return payload[key] as string;
}

function inputInteger(payload: JsonValue | null, key: string): number | null {
  if (!isJsonObject(payload) || typeof payload[key] !== "number") {
    return null;
  }

  const value = payload[key] as number;
  return Number.isInteger(value) ? value : null;
}

function sortedPlayerIds(playerIds: readonly string[], values: ReadonlyMap<string, number>): string[] {
  return [...playerIds].sort(
    (left, right) => (values.get(right) ?? 0) - (values.get(left) ?? 0) || left.localeCompare(right)
  );
}

function awardMetricRanks(
  entries: readonly { readonly playerId: string; readonly metric: number }[],
  scores: Map<string, number>,
  deltas: ScoreDelta[],
  reason: string,
  ascending: boolean,
  tiedLeaderPoints: number,
  uniqueLeaderPoints: number,
  nextRankPoints: number
): void {
  const sorted = [...entries].sort(
    (left, right) => (ascending ? left.metric - right.metric : right.metric - left.metric) || left.playerId.localeCompare(right.playerId)
  );

  if (sorted.length === 0) {
    return;
  }

  const firstMetric = sorted[0]!.metric;
  const first = sorted.filter((entry) => entry.metric === firstMetric);

  if (first.length > 1) {
    first.forEach((entry) => scoreDelta(scores, deltas, entry.playerId, tiedLeaderPoints, reason));
    return;
  }

  scoreDelta(scores, deltas, first[0]!.playerId, uniqueLeaderPoints, reason);

  const secondMetric = sorted.find((entry) => entry.metric !== firstMetric)?.metric;
  if (secondMetric === undefined) {
    return;
  }

  sorted
    .filter((entry) => entry.metric === secondMetric)
    .forEach((entry) => scoreDelta(scores, deltas, entry.playerId, nextRankPoints, reason));
}

class GizliHirsizAdapter implements Stage7GameAdapter {
  readonly gameId = "gizli-hirsiz" as const;
  playerIds: readonly string[];
  private readonly pressed = new Set<string>();
  private readonly miniScores: Map<string, number>;
  private readonly deltas: ScoreDelta[] = [];
  private startedAt: number | null = null;
  private finished = false;
  private scoreApplied = false;

  constructor(playerIds: readonly string[]) {
    this.playerIds = uniquePlayerIds(playerIds);
    this.miniScores = copyScores(this.playerIds);
  }

  get isStarted(): boolean { return this.startedAt !== null; }
  get isFinished(): boolean { return this.finished; }
  get eliminatedPlayerIds(): readonly string[] { return []; }

  start(now: number): void {
    assertNow(now);
    if (this.startedAt === null) this.startedAt = now;
  }

  private resolve(): void {
    if (this.finished) return;
    this.finished = true;
    if (this.scoreApplied) return;
    if (this.pressed.size === 1) {
      scoreDelta(this.miniScores, this.deltas, [...this.pressed][0]!, 1, "gizli-hirsiz:tek-hirsiz");
    } else if (this.pressed.size > 1) {
      this.pressed.forEach((playerId) => scoreDelta(this.miniScores, this.deltas, playerId, -1, "gizli-hirsiz:coklu-hirsiz"));
    }
    this.scoreApplied = true;
  }

  advance(now: number): boolean {
    assertNow(now);
    if (!this.isStarted || this.finished || now < this.startedAt! + THIRTY_SECONDS) return false;
    this.resolve();
    return true;
  }

  submit(playerId: string, payload: JsonValue | null, now: number): Stage7SubmitResult {
    assertNow(now);
    if (!this.playerIds.includes(playerId)) return { accepted: false, reason: "invalid" };
    if (!this.isStarted || this.finished) return { accepted: false, reason: "phase-locked" };
    if (now >= this.startedAt! + THIRTY_SECONDS) {
      this.advance(now);
      return { accepted: false, reason: "late" };
    }
    if (inputKind(payload) !== "steal") return { accepted: false, reason: "invalid" };
    if (this.pressed.has(playerId)) return { accepted: false, reason: "duplicate" };
    this.pressed.add(playerId);
    return { accepted: true };
  }

  removePlayer(playerId: string): void {
    this.playerIds = this.playerIds.filter((candidate) => candidate !== playerId);
    this.pressed.delete(playerId);
  }

  getPublicState(now: number): GizliHirsizPublicState {
    return {
      gameId: this.gameId,
      kind: this.gameId,
      started: this.isStarted,
      endsAt: this.startedAt === null ? null : this.startedAt + THIRTY_SECONDS,
      finished: this.finished,
      pressedPlayerIds: this.finished ? this.playerIds.filter((playerId) => this.pressed.has(playerId)) : null,
      pressCount: this.finished ? this.pressed.size : null,
      resultPoints: this.finished ? resultPoints(this.miniScores) : null
    };
  }

  getOwnState(playerId: string, _now: number): GizliHirsizOwnState {
    return { gameId: this.gameId, kind: this.gameId, hasPressed: this.pressed.has(playerId), finished: this.finished };
  }

  getMiniGameScores(): ReadonlyMap<string, number> { return new Map(this.miniScores); }
  getScoreDeltas(): readonly ScoreDelta[] { return [...this.deltas]; }
}

class KorKronometreAdapter implements Stage7GameAdapter {
  readonly gameId = "kor-kronometre" as const;
  playerIds: readonly string[];
  private readonly taps = new Map<string, number>();
  private readonly miniScores: Map<string, number>;
  private readonly deltas: ScoreDelta[] = [];
  private startedAt: number | null = null;
  private finished = false;
  private results: StopwatchResultView[] | null = null;

  constructor(playerIds: readonly string[]) {
    this.playerIds = uniquePlayerIds(playerIds);
    this.miniScores = copyScores(this.playerIds);
  }

  get isStarted(): boolean { return this.startedAt !== null; }
  get isFinished(): boolean { return this.finished; }
  get eliminatedPlayerIds(): readonly string[] { return []; }

  start(now: number): void {
    assertNow(now);
    if (this.startedAt === null) this.startedAt = now;
  }

  private resolve(): void {
    if (this.finished) return;
    this.results = this.playerIds.map((playerId) => {
      const elapsedMs = Math.max(0, Math.min(EIGHTEEN_SECONDS, this.taps.get(playerId) ?? EIGHTEEN_SECONDS));
      return { playerId, elapsedMs, distanceMs: Math.abs(elapsedMs - 10_000), tapped: this.taps.has(playerId) };
    });
    awardMetricRanks(
      this.results.map((entry) => ({ playerId: entry.playerId, metric: entry.distanceMs })),
      this.miniScores,
      this.deltas,
      "kor-kronometre:siralama",
      true,
      2,
      2,
      1
    );
    this.finished = true;
  }

  advance(now: number): boolean {
    assertNow(now);
    if (!this.isStarted || this.finished || now < this.startedAt! + EIGHTEEN_SECONDS) return false;
    this.resolve();
    return true;
  }

  submit(playerId: string, payload: JsonValue | null, now: number): Stage7SubmitResult {
    assertNow(now);
    if (!this.playerIds.includes(playerId)) return { accepted: false, reason: "invalid" };
    if (!this.isStarted || this.finished) return { accepted: false, reason: "phase-locked" };
    if (now >= this.startedAt! + EIGHTEEN_SECONDS) {
      this.advance(now);
      return { accepted: false, reason: "late" };
    }
    if (inputKind(payload) !== "stopwatch-stop") return { accepted: false, reason: "invalid" };
    if (this.taps.has(playerId)) return { accepted: false, reason: "duplicate" };
    this.taps.set(playerId, Math.max(0, now - this.startedAt!));
    return { accepted: true };
  }

  removePlayer(playerId: string): void {
    this.playerIds = this.playerIds.filter((candidate) => candidate !== playerId);
    this.taps.delete(playerId);
  }

  getPublicState(_now: number): KorKronometrePublicState {
    return {
      gameId: this.gameId,
      kind: this.gameId,
      started: this.isStarted,
      endsAt: this.startedAt === null ? null : this.startedAt + EIGHTEEN_SECONDS,
      finished: this.finished,
      targetMs: this.finished ? 10_000 : null,
      results: this.finished ? this.results : null,
      resultPoints: this.finished ? resultPoints(this.miniScores) : null
    };
  }

  getOwnState(playerId: string, _now: number): KorKronometreOwnState {
    return {
      gameId: this.gameId,
      kind: this.gameId,
      hasTapped: this.taps.has(playerId),
      elapsedMs: this.taps.get(playerId) ?? null,
      finished: this.finished
    };
  }

  getMiniGameScores(): ReadonlyMap<string, number> { return new Map(this.miniScores); }
  getScoreDeltas(): readonly ScoreDelta[] { return [...this.deltas]; }
}

class KorBombaAdapter implements Stage7GameAdapter {
  readonly gameId = "kor-bomba" as const;
  playerIds: readonly string[];
  private readonly random: Stage7RandomSource;
  private readonly miniScores: Map<string, number>;
  private readonly deltas: ScoreDelta[] = [];
  private startedAt: number | null = null;
  private explosionAt: number | null = null;
  private bombHolderId: string | null = null;
  private passCount = 0;
  private explodedPlayerId: string | null = null;
  private finished = false;

  constructor(playerIds: readonly string[], random: Stage7RandomSource) {
    this.playerIds = uniquePlayerIds(playerIds);
    this.random = random;
    this.miniScores = copyScores(this.playerIds);
  }

  get isStarted(): boolean { return this.startedAt !== null; }
  get isFinished(): boolean { return this.finished; }
  get eliminatedPlayerIds(): readonly string[] { return []; }

  start(now: number): void {
    assertNow(now);
    if (this.startedAt !== null) return;
    this.startedAt = now;
    this.bombHolderId = this.playerIds[randomIndex(this.playerIds.length, this.random)] ?? null;
    this.explosionAt = now + randomInteger(15_000, 20_000, this.random);
  }

  private resolve(): void {
    if (this.finished) return;
    this.finished = true;
    this.explodedPlayerId = this.bombHolderId;
    if (this.explodedPlayerId !== null) {
      scoreDelta(this.miniScores, this.deltas, this.explodedPlayerId, -1, "kor-bomba:patlama");
    }
  }

  advance(now: number): boolean {
    assertNow(now);
    if (!this.isStarted || this.finished || this.explosionAt === null || now < this.explosionAt) return false;
    this.resolve();
    return true;
  }

  submit(playerId: string, payload: JsonValue | null, now: number): Stage7SubmitResult {
    assertNow(now);
    if (!this.playerIds.includes(playerId)) return { accepted: false, reason: "invalid" };
    if (!this.isStarted || this.finished) return { accepted: false, reason: "phase-locked" };
    if (this.explosionAt !== null && now >= this.explosionAt) {
      this.advance(now);
      return { accepted: false, reason: "late" };
    }
    if (this.bombHolderId !== playerId || inputKind(payload) !== "bomb-pass") {
      return { accepted: false, reason: "phase-locked" };
    }
    const targetId = inputString(payload, "targetPlayerId");
    if (targetId === null || targetId === playerId || !this.playerIds.includes(targetId)) {
      return { accepted: false, reason: "invalid" };
    }
    this.bombHolderId = targetId;
    this.passCount += 1;
    this.explosionAt = (this.explosionAt ?? now) + randomInteger(1_000, 4_000, this.random);
    return { accepted: true };
  }

  removePlayer(playerId: string): void {
    this.playerIds = this.playerIds.filter((candidate) => candidate !== playerId);
    if (this.bombHolderId === playerId) {
      this.bombHolderId = this.playerIds[0] ?? null;
    }
    if (this.playerIds.length === 0 && !this.finished) this.resolve();
  }

  getPublicState(_now: number): KorBombaPublicState {
    return {
      gameId: this.gameId,
      kind: this.gameId,
      started: this.isStarted,
      bombHolderId: this.bombHolderId,
      passCount: this.passCount,
      finished: this.finished,
      explodedPlayerId: this.explodedPlayerId,
      resultPoints: this.finished ? resultPoints(this.miniScores) : null
    };
  }

  getOwnState(playerId: string, now: number): KorBombaOwnState {
    const hasBomb = this.bombHolderId === playerId && !this.finished;
    return {
      gameId: this.gameId,
      kind: this.gameId,
      hasBomb,
      visibleRemainingMs: this.finished ? 0 : hasBomb ? null : this.explosionAt === null ? null : Math.max(0, this.explosionAt - now),
      targetPlayerIds: hasBomb ? this.playerIds.filter((candidate) => candidate !== playerId) : [],
      canPass: hasBomb,
      finished: this.finished
    };
  }

  getMiniGameScores(): ReadonlyMap<string, number> { return new Map(this.miniScores); }
  getScoreDeltas(): readonly ScoreDelta[] { return [...this.deltas]; }
}

class AcgozlulukAdapter implements Stage7GameAdapter {
  readonly gameId = "acgozluluk-limiti" as const;
  playerIds: readonly string[];
  private readonly configuredLimit: number;
  private readonly configuredMaxChoice: number;
  private readonly miniScores: Map<string, number>;
  private readonly deltas: ScoreDelta[] = [];
  private readonly choices = new Map<string, number>();
  private startedAt: number | null = null;
  private finished = false;
  private total: number | null = null;
  private withinLimit: boolean | null = null;

  constructor(playerIds: readonly string[]) {
    this.playerIds = uniquePlayerIds(playerIds);
    this.configuredLimit = LIMIT_BY_PLAYER_COUNT[this.playerIds.length] ?? 0;
    this.configuredMaxChoice = this.playerIds.length;
    this.miniScores = copyScores(this.playerIds);
  }

  get isStarted(): boolean { return this.startedAt !== null; }
  get isFinished(): boolean { return this.finished; }
  get eliminatedPlayerIds(): readonly string[] { return []; }
  private get limit(): number { return this.configuredLimit; }

  start(now: number): void { assertNow(now); if (this.startedAt === null) this.startedAt = now; }

  private resolve(): void {
    if (this.finished) return;
    this.total = this.playerIds.reduce((sum, playerId) => sum + (this.choices.get(playerId) ?? 0), 0);
    this.withinLimit = this.total <= this.limit;
    if (this.withinLimit) {
      this.playerIds.forEach((playerId) => {
        const value = this.choices.get(playerId) ?? 0;
        if (value > 0) scoreDelta(this.miniScores, this.deltas, playerId, value, "acgozluluk-limiti:secim");
      });
    }
    this.finished = true;
  }

  advance(now: number): boolean {
    assertNow(now);
    if (!this.isStarted || this.finished || now < this.startedAt! + TWENTY_SECONDS) return false;
    this.resolve();
    return true;
  }

  submit(playerId: string, payload: JsonValue | null, now: number): Stage7SubmitResult {
    assertNow(now);
    if (!this.playerIds.includes(playerId)) return { accepted: false, reason: "invalid" };
    if (!this.isStarted || this.finished) return { accepted: false, reason: "phase-locked" };
    if (now >= this.startedAt! + TWENTY_SECONDS) { this.advance(now); return { accepted: false, reason: "late" }; }
    if (inputKind(payload) !== "limit-value") return { accepted: false, reason: "invalid" };
    const value = inputInteger(payload, "value");
    if (value === null || value < 0 || value > this.playerIds.length) return { accepted: false, reason: "invalid" };
    this.choices.set(playerId, value);
    return { accepted: true };
  }

  removePlayer(playerId: string): void {
    this.playerIds = this.playerIds.filter((candidate) => candidate !== playerId);
    this.choices.delete(playerId);
  }

  getPublicState(_now: number): AcgozlulukPublicState {
    return {
      gameId: this.gameId,
      kind: this.gameId,
      started: this.isStarted,
      endsAt: this.startedAt === null ? null : this.startedAt + TWENTY_SECONDS,
      limit: this.limit,
      maxChoice: this.configuredMaxChoice,
      finished: this.finished,
      choices: this.finished ? this.playerIds.map((playerId) => ({ playerId, value: this.choices.get(playerId) ?? 0 })) : null,
      total: this.total,
      withinLimit: this.withinLimit,
      resultPoints: this.finished ? resultPoints(this.miniScores) : null
    };
  }

  getOwnState(playerId: string, _now: number): AcgozlulukOwnState {
    return {
      gameId: this.gameId,
      kind: this.gameId,
      selectedValue: this.choices.get(playerId) ?? 0,
      hasSubmitted: this.choices.has(playerId),
      finished: this.finished
    };
  }

  getMiniGameScores(): ReadonlyMap<string, number> { return new Map(this.miniScores); }
  getScoreDeltas(): readonly ScoreDelta[] { return [...this.deltas]; }
}

class OrtalamaninYarisiAdapter implements Stage7GameAdapter {
  readonly gameId = "ortalamanin-yarisi" as const;
  playerIds: readonly string[];
  private readonly random: Stage7RandomSource;
  private readonly miniScores: Map<string, number>;
  private readonly deltas: ScoreDelta[] = [];
  private readonly choices = new Map<string, number>();
  private startedAt: number | null = null;
  private finished = false;
  private average: number | null = null;
  private target: number | null = null;
  private results: AverageResultView[] | null = null;

  constructor(playerIds: readonly string[], random: Stage7RandomSource) {
    this.playerIds = uniquePlayerIds(playerIds);
    this.random = random;
    this.miniScores = copyScores(this.playerIds);
  }

  get isStarted(): boolean { return this.startedAt !== null; }
  get isFinished(): boolean { return this.finished; }
  get eliminatedPlayerIds(): readonly string[] { return []; }

  start(now: number): void { assertNow(now); if (this.startedAt === null) this.startedAt = now; }

  private resolve(): void {
    if (this.finished) return;
    const values = this.playerIds.map((playerId) => ({
      playerId,
      value: this.choices.get(playerId) ?? randomIndex(101, this.random),
      generatedForMissingInput: !this.choices.has(playerId)
    }));
    this.average = values.reduce((sum, entry) => sum + entry.value, 0) / Math.max(1, values.length);
    this.target = this.average / 2;
    this.results = values.map((entry) => ({
      ...entry,
      distanceMs: Math.abs(entry.value - this.target!)
    }));
    awardMetricRanks(
      this.results.map((entry) => ({ playerId: entry.playerId, metric: entry.distanceMs })),
      this.miniScores,
      this.deltas,
      "ortalamanin-yarisi:hedef",
      true,
      1,
      2,
      1
    );
    this.finished = true;
  }

  advance(now: number): boolean {
    assertNow(now);
    if (!this.isStarted || this.finished || now < this.startedAt! + TWENTY_SECONDS) return false;
    this.resolve();
    return true;
  }

  submit(playerId: string, payload: JsonValue | null, now: number): Stage7SubmitResult {
    assertNow(now);
    if (!this.playerIds.includes(playerId)) return { accepted: false, reason: "invalid" };
    if (!this.isStarted || this.finished) return { accepted: false, reason: "phase-locked" };
    if (now >= this.startedAt! + TWENTY_SECONDS) { this.advance(now); return { accepted: false, reason: "late" }; }
    if (inputKind(payload) !== "average-value") return { accepted: false, reason: "invalid" };
    const value = inputInteger(payload, "value");
    if (value === null || value < 0 || value > 100) return { accepted: false, reason: "invalid" };
    this.choices.set(playerId, value);
    return { accepted: true };
  }

  removePlayer(playerId: string): void {
    this.playerIds = this.playerIds.filter((candidate) => candidate !== playerId);
    this.choices.delete(playerId);
  }

  getPublicState(_now: number): OrtalamaninYarisiPublicState {
    return {
      gameId: this.gameId,
      kind: this.gameId,
      started: this.isStarted,
      endsAt: this.startedAt === null ? null : this.startedAt + TWENTY_SECONDS,
      finished: this.finished,
      target: this.target,
      average: this.average,
      results: this.results,
      resultPoints: this.finished ? resultPoints(this.miniScores) : null
    };
  }

  getOwnState(playerId: string, _now: number): OrtalamaninYarisiOwnState {
    return {
      gameId: this.gameId,
      kind: this.gameId,
      selectedValue: this.choices.get(playerId) ?? null,
      hasSubmitted: this.choices.has(playerId),
      finished: this.finished
    };
  }

  getMiniGameScores(): ReadonlyMap<string, number> { return new Map(this.miniScores); }
  getScoreDeltas(): readonly ScoreDelta[] { return [...this.deltas]; }
}

class GizliKarelerAdapter implements Stage7GameAdapter {
  readonly gameId = "gizli-kareler" as const;
  playerIds: readonly string[];
  private readonly configuredGridSize: 3 | 4;
  private readonly miniScores: Map<string, number>;
  private readonly deltas: ScoreDelta[] = [];
  private readonly selections = new Map<1 | 2, Map<string, number>>([
    [1, new Map()],
    [2, new Map()]
  ]);
  private readonly eliminated = new Set<string>();
  private readonly roundResults: GizliKareRoundResult[] = [];
  private startedAt: number | null = null;
  private currentRound: 1 | 2 = 1;
  private roundEndsAt: number | null = null;
  private finished = false;
  private earlyFinish = false;

  constructor(playerIds: readonly string[]) {
    this.playerIds = uniquePlayerIds(playerIds);
    this.configuredGridSize = this.playerIds.length <= 4 ? 3 : 4;
    this.miniScores = copyScores(this.playerIds);
  }

  get isStarted(): boolean { return this.startedAt !== null; }
  get isFinished(): boolean { return this.finished; }
  get eliminatedPlayerIds(): readonly string[] { return [...this.eliminated]; }
  private get gridSize(): 3 | 4 { return this.configuredGridSize; }
  private get cellCount(): number { return this.gridSize * this.gridSize; }

  start(now: number): void {
    assertNow(now);
    if (this.startedAt !== null) return;
    this.startedAt = now;
    this.currentRound = 1;
    this.roundEndsAt = now + TWENTY_SECONDS;
  }

  private resolveRound(now: number): void {
    if (this.finished || this.roundEndsAt === null) return;
    const selected = this.selections.get(this.currentRound)!;
    const eligible = this.playerIds.filter((playerId) => !this.eliminated.has(playerId));
    const groups = new Map<number, string[]>();
    selected.forEach((cell, playerId) => {
      const group = groups.get(cell) ?? [];
      group.push(playerId);
      groups.set(cell, group);
    });

    const allSelected = eligible.length > 0 && eligible.every((playerId) => selected.has(playerId));
    const allSame = allSelected && new Set([...selected.values()]).size === 1;
    const soloPlayerIds: string[] = [];
    const collidedPlayerIds: string[] = [];

    if (this.currentRound === 1 && allSame) {
      this.earlyFinish = true;
      this.roundResults.push({
        round: this.currentRound,
        selections: [...selected.entries()].map(([playerId, cell]) => ({ playerId, cell })),
        soloPlayerIds,
        collidedPlayerIds: [...eligible]
      });
      this.finished = true;
      this.roundEndsAt = null;
      return;
    }

    groups.forEach((group, cell) => {
      if (group.length === 1) {
        soloPlayerIds.push(group[0]!);
        scoreDelta(this.miniScores, this.deltas, group[0]!, 1, `gizli-kareler:raunt-${this.currentRound}-tek`);
      } else {
        group.forEach((playerId) => {
          this.eliminated.add(playerId);
          collidedPlayerIds.push(playerId);
        });
      }
      void cell;
    });

    this.roundResults.push({
      round: this.currentRound,
      selections: [...selected.entries()].map(([playerId, cell]) => ({ playerId, cell })),
      soloPlayerIds: [...soloPlayerIds],
      collidedPlayerIds: [...collidedPlayerIds]
    });

    if (this.currentRound === 1) {
      const alive = this.playerIds.filter((playerId) => !this.eliminated.has(playerId));
      if (alive.length <= 1) {
        if (alive.length === 1) scoreDelta(this.miniScores, this.deltas, alive[0]!, 1, "gizli-kareler:rakipsiz-ikinci-raunt");
        this.finished = true;
        this.roundEndsAt = null;
        return;
      }
      this.currentRound = 2;
      this.roundEndsAt = now + TWENTY_SECONDS;
      return;
    }

    this.finished = true;
    this.roundEndsAt = null;
  }

  advance(now: number): boolean {
    assertNow(now);
    if (!this.isStarted || this.finished || this.roundEndsAt === null || now < this.roundEndsAt) return false;
    this.resolveRound(now);
    return true;
  }

  submit(playerId: string, payload: JsonValue | null, now: number): Stage7SubmitResult {
    assertNow(now);
    if (!this.playerIds.includes(playerId)) return { accepted: false, reason: "invalid" };
    if (this.eliminated.has(playerId)) return { accepted: false, reason: "spectator" };
    if (!this.isStarted || this.finished || this.roundEndsAt === null) return { accepted: false, reason: "phase-locked" };
    if (now >= this.roundEndsAt) { this.advance(now); return { accepted: false, reason: "late" }; }
    if (inputKind(payload) !== "grid-cell") return { accepted: false, reason: "invalid" };
    const cell = inputInteger(payload, "cell");
    if (cell === null || cell < 0 || cell >= this.cellCount) return { accepted: false, reason: "invalid" };
    const selected = this.selections.get(this.currentRound)!;
    if (selected.has(playerId)) return { accepted: false, reason: "duplicate" };
    selected.set(playerId, cell);

    const eligible = this.playerIds.filter((candidate) => !this.eliminated.has(candidate));
    if (this.currentRound === 1 && eligible.every((candidate) => selected.has(candidate))) {
      const cells = new Set([...selected.values()]);
      if (cells.size === 1) this.resolveRound(now);
    }
    return { accepted: true };
  }

  removePlayer(playerId: string): void {
    this.playerIds = this.playerIds.filter((candidate) => candidate !== playerId);
    this.eliminated.delete(playerId);
    this.selections.forEach((selection) => selection.delete(playerId));
  }

  getPublicState(_now: number): GizliKarelerPublicState {
    return {
      gameId: this.gameId,
      kind: this.gameId,
      started: this.isStarted,
      round: this.currentRound,
      roundEndsAt: this.roundEndsAt,
      gridSize: this.gridSize,
      cellCount: this.cellCount,
      finished: this.finished,
      earlyFinish: this.earlyFinish,
      eliminatedPlayerIds: [...this.eliminated],
      results: this.finished ? [...this.roundResults] : null,
      resultPoints: this.finished ? resultPoints(this.miniScores) : null
    };
  }

  getOwnState(playerId: string, _now: number): GizliKarelerOwnState {
    return {
      gameId: this.gameId,
      kind: this.gameId,
      selectedCell: this.selections.get(this.currentRound)?.get(playerId) ?? null,
      canSelect: this.isStarted && !this.finished && !this.eliminated.has(playerId) && !this.selections.get(this.currentRound)!.has(playerId),
      eliminated: this.eliminated.has(playerId),
      finished: this.finished
    };
  }

  getMiniGameScores(): ReadonlyMap<string, number> { return new Map(this.miniScores); }
  getScoreDeltas(): readonly ScoreDelta[] { return [...this.deltas]; }
}

class CizgiyiGecmeAdapter implements Stage7GameAdapter {
  readonly gameId = "cizgiyi-gecme" as const;
  playerIds: readonly string[];
  private readonly miniScores: Map<string, number>;
  private readonly deltas: ScoreDelta[] = [];
  private readonly choices = new Map<string, number>();
  private startedAt: number | null = null;
  private finished = false;
  private results: CizgiyiGecmePublicState["results"] = null;

  constructor(playerIds: readonly string[]) {
    this.playerIds = uniquePlayerIds(playerIds);
    this.miniScores = copyScores(this.playerIds);
  }

  get isStarted(): boolean { return this.startedAt !== null; }
  get isFinished(): boolean { return this.finished; }
  get eliminatedPlayerIds(): readonly string[] { return []; }

  start(now: number): void { assertNow(now); if (this.startedAt === null) this.startedAt = now; }

  private resolve(): void {
    if (this.finished) return;
    const buckets = new Map<number, string[]>();
    this.choices.forEach((value, playerId) => {
      const bucket = value === 100 ? 10 : Math.floor(value / 10);
      const group = buckets.get(bucket) ?? [];
      group.push(playerId);
      buckets.set(bucket, group);
    });
    const uniqueBuckets = new Set([...buckets.entries()].filter(([, group]) => group.length === 1).map(([bucket]) => bucket));
    const eligible = [...this.choices.entries()]
      .filter(([playerId, value]) => {
        const bucket = value === 100 ? 10 : Math.floor(value / 10);
        return uniqueBuckets.has(bucket) && this.playerIds.includes(playerId);
      })
      .sort((left, right) => right[1] - left[1]);

    const pointByPlayer = new Map<string, number>();
    if (eligible[0]) pointByPlayer.set(eligible[0][0], 2);
    if (eligible[1]) pointByPlayer.set(eligible[1][0], 1);
    pointByPlayer.forEach((points, playerId) => scoreDelta(this.miniScores, this.deltas, playerId, points, "cizgiyi-gecme:benzersiz-risk"));

    this.results = this.playerIds.map((playerId) => {
      const value = this.choices.get(playerId) ?? null;
      const bucket = value === null ? null : value === 100 ? 10 : Math.floor(value / 10);
      return { playerId, value, bucket, evaluated: value !== null && uniqueBuckets.has(bucket!), points: pointByPlayer.get(playerId) ?? 0 };
    });
    this.finished = true;
  }

  advance(now: number): boolean {
    assertNow(now);
    if (!this.isStarted || this.finished || now < this.startedAt! + THIRTY_SECONDS) return false;
    this.resolve();
    return true;
  }

  submit(playerId: string, payload: JsonValue | null, now: number): Stage7SubmitResult {
    assertNow(now);
    if (!this.playerIds.includes(playerId)) return { accepted: false, reason: "invalid" };
    if (!this.isStarted || this.finished) return { accepted: false, reason: "phase-locked" };
    if (now >= this.startedAt! + THIRTY_SECONDS) { this.advance(now); return { accepted: false, reason: "late" }; }
    if (inputKind(payload) !== "risk-value") return { accepted: false, reason: "invalid" };
    const value = inputInteger(payload, "value");
    if (value === null || value < 0 || value > 100) return { accepted: false, reason: "invalid" };
    if (this.choices.has(playerId)) return { accepted: false, reason: "duplicate" };
    this.choices.set(playerId, value);
    return { accepted: true };
  }

  removePlayer(playerId: string): void {
    this.playerIds = this.playerIds.filter((candidate) => candidate !== playerId);
    this.choices.delete(playerId);
  }

  getPublicState(_now: number): CizgiyiGecmePublicState {
    return {
      gameId: this.gameId,
      kind: this.gameId,
      started: this.isStarted,
      endsAt: this.startedAt === null ? null : this.startedAt + THIRTY_SECONDS,
      finished: this.finished,
      results: this.results,
      resultPoints: this.finished ? resultPoints(this.miniScores) : null
    };
  }

  getOwnState(playerId: string, _now: number): CizgiyiGecmeOwnState {
    return { gameId: this.gameId, kind: this.gameId, selectedValue: this.choices.get(playerId) ?? null, hasSubmitted: this.choices.has(playerId), finished: this.finished };
  }

  getMiniGameScores(): ReadonlyMap<string, number> { return new Map(this.miniScores); }
  getScoreDeltas(): readonly ScoreDelta[] { return [...this.deltas]; }
}

class GizliAlisverisAdapter implements Stage7GameAdapter {
  readonly gameId = "gizli-alisveris" as const;
  playerIds: readonly string[];
  private readonly miniScores: Map<string, number>;
  private readonly deltas: ScoreDelta[] = [];
  private readonly carts = new Map<string, Set<string>>();
  private startedAt: number | null = null;
  private finished = false;
  private buyerCounts: Record<string, number> | null = null;
  private results: ShoppingResultView[] | null = null;

  constructor(playerIds: readonly string[]) {
    this.playerIds = uniquePlayerIds(playerIds);
    this.miniScores = copyScores(this.playerIds);
    this.playerIds.forEach((playerId) => this.carts.set(playerId, new Set()));
  }

  get isStarted(): boolean { return this.startedAt !== null; }
  get isFinished(): boolean { return this.finished; }
  get eliminatedPlayerIds(): readonly string[] { return []; }

  start(now: number): void { assertNow(now); if (this.startedAt === null) this.startedAt = now; }

  private product(productId: string): ShoppingProduct | undefined {
    return GIZLI_ALISVERIS_PRODUCTS.find((candidate) => candidate.id === productId);
  }

  private spent(playerId: string): number {
    return [...(this.carts.get(playerId) ?? [])].reduce((sum, productId) => sum + (this.product(productId)?.price ?? 0), 0);
  }

  private resolve(): void {
    if (this.finished) return;
    const counts: Record<string, number> = {};
    GIZLI_ALISVERIS_PRODUCTS.forEach((product) => { counts[product.id] = 0; });
    this.carts.forEach((cart) => cart.forEach((productId) => { counts[productId] = (counts[productId] ?? 0) + 1; }));
    this.buyerCounts = counts;
    this.results = this.playerIds.map((playerId) => {
      const productIds = [...(this.carts.get(playerId) ?? [])];
      const basketValue = productIds.reduce((sum, productId) => {
        const product = this.product(productId);
        const buyers = counts[productId] ?? 0;
        return sum + (product && buyers > 0 ? product.price / buyers : 0);
      }, 0);
      return { playerId, basketValue, productIds };
    });
    const highest = Math.max(0, ...this.results.map((entry) => entry.basketValue));
    this.results.forEach((entry) => {
      if (Math.abs(entry.basketValue - highest) < 1e-9) scoreDelta(this.miniScores, this.deltas, entry.playerId, 1, "gizli-alisveris:en-degerli-sepet");
    });
    this.finished = true;
  }

  advance(now: number): boolean {
    assertNow(now);
    if (!this.isStarted || this.finished || now < this.startedAt! + THIRTY_SECONDS) return false;
    this.resolve();
    return true;
  }

  submit(playerId: string, payload: JsonValue | null, now: number): Stage7SubmitResult {
    assertNow(now);
    if (!this.playerIds.includes(playerId)) return { accepted: false, reason: "invalid" };
    if (!this.isStarted || this.finished) return { accepted: false, reason: "phase-locked" };
    if (now >= this.startedAt! + THIRTY_SECONDS) { this.advance(now); return { accepted: false, reason: "late" }; }
    if (inputKind(payload) !== "shopping-toggle") return { accepted: false, reason: "invalid" };
    const productId = inputString(payload, "productId");
    const product = productId === null ? undefined : this.product(productId);
    if (!product) return { accepted: false, reason: "invalid" };
    const cart = this.carts.get(playerId)!;
    if (cart.has(product.id)) {
      cart.delete(product.id);
      return { accepted: true };
    }
    if (this.spent(playerId) + product.price > 60) return { accepted: false, reason: "invalid" };
    cart.add(product.id);
    return { accepted: true };
  }

  removePlayer(playerId: string): void {
    this.playerIds = this.playerIds.filter((candidate) => candidate !== playerId);
    this.carts.delete(playerId);
  }

  getPublicState(_now: number): GizliAlisverisPublicState {
    return {
      gameId: this.gameId,
      kind: this.gameId,
      started: this.isStarted,
      endsAt: this.startedAt === null ? null : this.startedAt + THIRTY_SECONDS,
      budget: 60,
      products: GIZLI_ALISVERIS_PRODUCTS,
      finished: this.finished,
      productBuyerCounts: this.buyerCounts,
      results: this.results,
      resultPoints: this.finished ? resultPoints(this.miniScores) : null
    };
  }

  getOwnState(playerId: string, _now: number): GizliAlisverisOwnState {
    const cartProductIds = [...(this.carts.get(playerId) ?? [])];
    const spent = this.spent(playerId);
    return { gameId: this.gameId, kind: this.gameId, cartProductIds, spent, remainingBudget: 60 - spent, finished: this.finished };
  }

  getMiniGameScores(): ReadonlyMap<string, number> { return new Map(this.miniScores); }
  getScoreDeltas(): readonly ScoreDelta[] { return [...this.deltas]; }
}

class AsiriYuklemeAdapter implements Stage7GameAdapter {
  readonly gameId = "asiri-yukleme" as const;
  playerIds: readonly string[];
  private readonly miniScores: Map<string, number>;
  private readonly deltas: ScoreDelta[] = [];
  private readonly clicks = new Map<string, number>();
  private startedAt: number | null = null;
  private energy = 0;
  private armingEndsAt: number | null = null;
  private explodedPlayerId: string | null = null;
  private finished = false;

  constructor(playerIds: readonly string[]) {
    this.playerIds = uniquePlayerIds(playerIds);
    this.miniScores = copyScores(this.playerIds);
    this.playerIds.forEach((playerId) => this.clicks.set(playerId, 0));
  }

  get isStarted(): boolean { return this.startedAt !== null; }
  get isFinished(): boolean { return this.finished; }
  get eliminatedPlayerIds(): readonly string[] { return this.explodedPlayerId === null ? [] : [this.explodedPlayerId]; }

  start(now: number): void { assertNow(now); if (this.startedAt === null) this.startedAt = now; }

  private resolve(explodedPlayerId: string | null): void {
    if (this.finished) return;
    this.explodedPlayerId = explodedPlayerId;
    const eligible = this.playerIds.filter((playerId) => playerId !== explodedPlayerId);
    if (explodedPlayerId !== null) scoreDelta(this.miniScores, this.deltas, explodedPlayerId, -1, "asiri-yukleme:patlama");
    awardMetricRanks(
      eligible.map((playerId) => ({ playerId, metric: this.clicks.get(playerId) ?? 0 })),
      this.miniScores,
      this.deltas,
      "asiri-yukleme:tik-siralama",
      false,
      1,
      2,
      1
    );
    this.finished = true;
  }

  advance(now: number): boolean {
    assertNow(now);
    if (!this.isStarted || this.finished || this.armingEndsAt === null || now < this.armingEndsAt) return false;
    this.resolve(null);
    return true;
  }

  submit(playerId: string, payload: JsonValue | null, now: number): Stage7SubmitResult {
    assertNow(now);
    if (!this.playerIds.includes(playerId)) return { accepted: false, reason: "invalid" };
    if (!this.isStarted || this.finished) return { accepted: false, reason: "phase-locked" };
    if (inputKind(payload) !== "overload-click") return { accepted: false, reason: "invalid" };
    if (this.armingEndsAt !== null && now >= this.armingEndsAt) {
      this.advance(now);
      return { accepted: false, reason: "late" };
    }
    this.clicks.set(playerId, (this.clicks.get(playerId) ?? 0) + 1);
    if (this.energy < 100) {
      this.energy += 1;
      if (this.energy === 100) this.armingEndsAt = now + 3_000;
      return { accepted: true };
    }
    this.resolve(playerId);
    return { accepted: true };
  }

  removePlayer(playerId: string): void {
    this.playerIds = this.playerIds.filter((candidate) => candidate !== playerId);
    this.clicks.delete(playerId);
    if (this.explodedPlayerId === playerId) this.explodedPlayerId = null;
  }

  getPublicState(_now: number): AsiriYuklemePublicState {
    return {
      gameId: this.gameId,
      kind: this.gameId,
      started: this.isStarted,
      energy: this.energy,
      armed: this.armingEndsAt !== null,
      finished: this.finished,
      explodedPlayerId: this.explodedPlayerId,
      clickCounts: this.finished ? scoresAsRecord(this.clicks) : null,
      resultPoints: this.finished ? resultPoints(this.miniScores) : null
    };
  }

  getOwnState(playerId: string, _now: number): AsiriYuklemeOwnState {
    return {
      gameId: this.gameId,
      kind: this.gameId,
      clickCount: this.clicks.get(playerId) ?? 0,
      armed: this.armingEndsAt !== null,
      exploded: this.explodedPlayerId === playerId,
      finished: this.finished
    };
  }

  getMiniGameScores(): ReadonlyMap<string, number> { return new Map(this.miniScores); }
  getScoreDeltas(): readonly ScoreDelta[] { return [...this.deltas]; }
}

class CaprazAtesAdapter implements Stage7GameAdapter {
  readonly gameId = "capraz-ates" as const;
  playerIds: readonly string[];
  private readonly miniScores: Map<string, number>;
  private readonly deltas: ScoreDelta[] = [];
  private readonly targets = new Map<string, string | null>();
  private startedAt: number | null = null;
  private finished = false;
  private results: CaprazAtesResultView[] | null = null;

  constructor(playerIds: readonly string[]) {
    this.playerIds = uniquePlayerIds(playerIds);
    this.miniScores = copyScores(this.playerIds);
  }

  get isStarted(): boolean { return this.startedAt !== null; }
  get isFinished(): boolean { return this.finished; }
  get eliminatedPlayerIds(): readonly string[] { return []; }

  start(now: number): void { assertNow(now); if (this.startedAt === null) this.startedAt = now; }

  private resolve(): void {
    if (this.finished) return;
    this.results = this.playerIds.map((playerId) => {
      const target = this.targets.get(playerId) ?? null;
      const incoming = this.playerIds.filter((candidate) => this.targets.get(candidate) === playerId);
      const mutual = target !== null && this.targets.get(target) === playerId;
      const points = mutual ? 0 : incoming.length > 0 ? -1 : target === null ? 0 : 1;
      if (points !== 0) scoreDelta(this.miniScores, this.deltas, playerId, points, "capraz-ates:hedef-sonucu");
      return { playerId, targetPlayerId: target, incomingCount: incoming.length, points };
    });
    this.finished = true;
  }

  advance(now: number): boolean {
    assertNow(now);
    if (!this.isStarted || this.finished || now < this.startedAt! + TWENTY_FIVE_SECONDS) return false;
    this.resolve();
    return true;
  }

  submit(playerId: string, payload: JsonValue | null, now: number): Stage7SubmitResult {
    assertNow(now);
    if (!this.playerIds.includes(playerId)) return { accepted: false, reason: "invalid" };
    if (!this.isStarted || this.finished) return { accepted: false, reason: "phase-locked" };
    if (now >= this.startedAt! + TWENTY_FIVE_SECONDS) { this.advance(now); return { accepted: false, reason: "late" }; }
    if (this.targets.has(playerId)) return { accepted: false, reason: "duplicate" };
    const kind = inputKind(payload);
    if (kind === "crossfire-miss") {
      this.targets.set(playerId, null);
      return { accepted: true };
    }
    if (kind !== "crossfire-target") return { accepted: false, reason: "invalid" };
    const target = inputString(payload, "targetPlayerId");
    if (target === null || target === playerId || !this.playerIds.includes(target)) return { accepted: false, reason: "invalid" };
    this.targets.set(playerId, target);
    return { accepted: true };
  }

  removePlayer(playerId: string): void {
    this.playerIds = this.playerIds.filter((candidate) => candidate !== playerId);
    this.targets.delete(playerId);
    this.targets.forEach((target, shooter) => { if (target === playerId) this.targets.set(shooter, null); });
  }

  getPublicState(_now: number): CaprazAtesPublicState {
    return {
      gameId: this.gameId,
      kind: this.gameId,
      started: this.isStarted,
      endsAt: this.startedAt === null ? null : this.startedAt + TWENTY_FIVE_SECONDS,
      finished: this.finished,
      results: this.results,
      resultPoints: this.finished ? resultPoints(this.miniScores) : null
    };
  }

  getOwnState(playerId: string, _now: number): CaprazAtesOwnState {
    return {
      gameId: this.gameId,
      kind: this.gameId,
      selectedTargetId: this.targets.get(playerId) ?? null,
      availableTargetIds: this.playerIds.filter((candidate) => candidate !== playerId),
      hasSubmitted: this.targets.has(playerId),
      finished: this.finished
    };
  }

  getMiniGameScores(): ReadonlyMap<string, number> { return new Map(this.miniScores); }
  getScoreDeltas(): readonly ScoreDelta[] { return [...this.deltas]; }
}

export function isStage7Game(gameId: GameId): gameId is Stage7GameId {
  return STAGE7_GAME_IDS.includes(gameId as Stage7GameId);
}

export function createStage7GameAdapter(
  gameId: Stage7GameId,
  playerIds: readonly string[],
  random: Stage7RandomSource = DEFAULT_RANDOM
): Stage7GameAdapter {
  switch (gameId) {
    case "gizli-hirsiz": return new GizliHirsizAdapter(playerIds);
    case "kor-kronometre": return new KorKronometreAdapter(playerIds);
    case "kor-bomba": return new KorBombaAdapter(playerIds, random);
    case "acgozluluk-limiti": return new AcgozlulukAdapter(playerIds);
    case "ortalamanin-yarisi": return new OrtalamaninYarisiAdapter(playerIds, random);
    case "gizli-kareler": return new GizliKarelerAdapter(playerIds);
    case "cizgiyi-gecme": return new CizgiyiGecmeAdapter(playerIds);
    case "gizli-alisveris": return new GizliAlisverisAdapter(playerIds);
    case "asiri-yukleme": return new AsiriYuklemeAdapter(playerIds);
    case "capraz-ates": return new CaprazAtesAdapter(playerIds);
  }
}
