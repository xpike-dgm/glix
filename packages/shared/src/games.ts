import type { GameId, JsonValue } from "./index.js";
import {
  awardMapToDeltas,
  createRankAwards,
  rankScores,
  type ScoreDelta
} from "./engine.js";

export type Stage6GameId = Extract<
  GameId,
  "butona-bas" | "sizma" | "zaman-bombasi-hafizasi"
>;

export const STAGE6_GAME_IDS = [
  "butona-bas",
  "sizma",
  "zaman-bombasi-hafizasi"
] as const satisfies readonly Stage6GameId[];

export type MemoryColor = "cyan" | "magenta" | "amber" | "lime";

export interface Stage6VoteCount {
  readonly playerId: string;
  readonly votes: number;
}

export interface ButonaBasResultSummary {
  /** Windows with one or more unique participants. */
  readonly acceptedWindowCount: number;
  /** Windows with exactly one unique participant; each received the -1 penalty. */
  readonly singletonWindowCount: number;
  /** Windows with at least two unique participants; each received +1. */
  readonly multiPlayerWindowCount: number;
  /** Windows in which nobody submitted a tap. */
  readonly emptyWindowCount: number;
  /** Longest consecutive run of windows containing at least one participant. */
  readonly longestWindowCombo: number;
}

export interface ButonaBasResultView {
  readonly playerId: string;
  readonly score: number;
  readonly rank: number;
}

export interface ButonaBasPublicState {
  readonly gameId: "butona-bas";
  readonly kind: "butona-bas";
  readonly started: boolean;
  readonly windowMs: 300;
  readonly totalDurationMs: 45_000;
  readonly windowCount: 150;
  readonly windowIndex: number;
  readonly currentWindowEndsAt: number | null;
  /** Revealed only after all 150 timing windows have resolved. */
  readonly resultSummary: ButonaBasResultSummary | null;
  /** Server-ordered final scores, revealed only after the timing windows resolve. */
  readonly results: readonly ButonaBasResultView[] | null;
  readonly finished: boolean;
}

export interface ButonaBasOwnState {
  readonly gameId: "butona-bas";
  readonly kind: "butona-bas";
  readonly miniScore: number;
  readonly currentWindowIndex: number;
  readonly lastTapWindowIndex: number | null;
  readonly acceptedWindowCount: number;
  readonly longestWindowCombo: number;
  readonly finished: boolean;
}

export type SizmaSubPhase = "clue" | "ready-for-vote" | "vote" | "results";

export interface SizmaPublicState {
  readonly gameId: "sizma";
  readonly kind: "sizma";
  readonly started: boolean;
  readonly subPhase: SizmaSubPhase;
  readonly clueRound: 1 | 2;
  readonly clueTurnPlayerId: string | null;
  readonly clueTurnIndex: number;
  readonly clueTurnsCompleted: number;
  readonly totalClueTurns: number;
  readonly readyPlayerIds: readonly string[];
  readonly voteEndsAt: number | null;
  readonly votedPlayerIds: readonly string[];
  readonly voteCounts: readonly Stage6VoteCount[] | null;
  readonly topVotedPlayerIds: readonly string[] | null;
  readonly outsiderPlayerId: string | null;
  readonly commonWord: string | null;
  readonly outsiderWord: string | null;
  readonly outsiderCaught: boolean | null;
  readonly finished: boolean;
}

export interface SizmaOwnState {
  readonly gameId: "sizma";
  readonly kind: "sizma";
  readonly role: "normal" | "outsider";
  readonly assignedWord: string;
  readonly clueRound: 1 | 2;
  readonly completedClueRounds: readonly number[];
  readonly canCompleteClue: boolean;
  readonly canReadyForVote: boolean;
  readonly hasVoted: boolean;
  readonly finished: boolean;
}

export type MemorySubPhase = "display" | "input" | "results";

export interface MemoryPublicState {
  readonly gameId: "zaman-bombasi-hafizasi";
  readonly kind: "zaman-bombasi-hafizasi";
  readonly started: boolean;
  readonly subPhase: MemorySubPhase;
  /** The recall answer is public only while the sequence is being displayed. */
  readonly sequence: readonly MemoryColor[];
  readonly sequenceIndex: number;
  readonly sequenceLength: number;
  readonly activePlayerId: string | null;
  readonly inputDeadline: number | null;
  readonly displayUntil: number | null;
  readonly order: readonly string[];
  readonly eliminatedPlayerIds: readonly string[];
  readonly lastFailedPlayerId: string | null;
  readonly initialPlayerCount: number;
  readonly eliminationThreshold: number;
  readonly finished: boolean;
}

export interface MemoryOwnState {
  readonly gameId: "zaman-bombasi-hafizasi";
  readonly kind: "zaman-bombasi-hafizasi";
  readonly isActive: boolean;
  readonly eliminated: boolean;
  readonly inputIndex: number;
  readonly sequenceLength: number;
  readonly inputDeadline: number | null;
  readonly finished: boolean;
}

export type Stage6PublicState =
  | ButonaBasPublicState
  | SizmaPublicState
  | MemoryPublicState;

export type Stage6OwnState =
  | ButonaBasOwnState
  | SizmaOwnState
  | MemoryOwnState;

export type Stage6InputRejection =
  | "phase-locked"
  | "late"
  | "duplicate"
  | "spectator"
  | "invalid";

export type Stage6SubmitResult =
  | { readonly accepted: true }
  | { readonly accepted: false; readonly reason: Stage6InputRejection };

export interface Stage6GameAdapter {
  readonly gameId: Stage6GameId;
  readonly playerIds: readonly string[];
  readonly isStarted: boolean;
  readonly isFinished: boolean;
  readonly eliminatedPlayerIds: readonly string[];
  start(now: number): void;
  advance(now: number): boolean;
  submit(playerId: string, payload: JsonValue | null, now: number): Stage6SubmitResult;
  /** Updates live targets without removing reconnectable room members. */
  setConnectedPlayerIds?(playerIds: readonly string[], now?: number): void;
  removePlayer(playerId: string): void;
  getPublicState(now: number): Stage6PublicState;
  getOwnState(playerId: string, now: number): Stage6OwnState;
  getMiniGameScores(): ReadonlyMap<string, number>;
  getScoreDeltas(): readonly ScoreDelta[];
}

export type RandomSource = () => number;

const DEFAULT_RANDOM: RandomSource = () => Math.random();
const MEMORY_COLORS: readonly MemoryColor[] = ["cyan", "magenta", "amber", "lime"];

const SIZMA_WORD_PAIRS = [
  ["KÖPRÜ", "TÜNEL"],
  ["KAHVE", "ÇAY"],
  ["KUMSAL", "ORMAN"],
  ["FENER", "DENİZ"],
  ["PİYANO", "GİTAR"],
  ["BULUT", "SİS"],
  ["KARPUZ", "KAVUN"],
  ["ASANSÖR", "MERDİVEN"],
  ["KÜTÜPHANE", "MÜZE"],
  ["BİSİKLET", "SCOOTER"],
  ["YILDIRIM", "GÖK GÜRÜLTÜSÜ"],
  ["KAMERA", "AYNA"],
  ["ÇADIR", "KARAVAN"],
  ["PUSULA", "HARİTA"],
  ["KURABİYE", "KEK"],
  ["KUM SAATİ", "KRONOMETRE"],
  ["BALON", "UÇURTMA"],
  ["KORSAN", "KAŞİF"],
  ["ROKET", "UÇAK"],
  ["KAR", "DOLU"],
  ["MİKROFON", "HOPARLÖR"],
  ["KİLİT", "ANAHTAR"],
  ["GÖL", "NEHİR"],
  ["ÇORBA", "SALATA"],
  ["GÖZLÜK", "ŞAPKA"],
  ["DOKTOR", "HEMŞİRE"],
  ["KAPTAN", "PİLOT"],
  ["KUM SAATİ", "TAKVİM"],
  ["MAĞARA", "KALE"],
  ["ŞİMŞEK", "VOLKAN"],
  ["KARINCA", "ÖRÜMCEK"],
  ["KAKTÜS", "PALMİYE"],
  ["FİLM", "DİZİ"],
  ["KULAKLIK", "RADYO"],
  ["MIZIKA", "DAVUL"],
  ["SANDALYE", "KOLTUK"],
  ["PENCERE", "BALKON"],
  ["BATTANİYE", "YASTIK"],
  ["DONDURMA", "PUDİNG"],
  ["ÇANTA", "VALİZ"],
  ["KİTAP", "DERGİ"],
  ["BİLET", "DAVETİYE"],
  ["DÜRBÜN", "TELESKOP"],
  ["KAZAK", "MONT"],
  ["KÜREK", "PALA"],
  ["KIRMIZI", "TURUNCU"],
  ["KEDİ", "KÖPEK"],
  ["YÜZÜK", "KOLYE"],
  ["ŞELALE", "ÇEŞME"],
  ["KAMP", "PİKNİK"]
] as const;

function assertNow(now: number): void {
  if (!Number.isFinite(now)) {
    throw new Error("Mini oyun zamanı sonlu bir sayı olmalı.");
  }
}

function randomIndex(length: number, random: RandomSource): number {
  if (length <= 1) {
    return 0;
  }

  const value = random();
  const normalized = Number.isFinite(value) ? Math.max(0, Math.min(0.999999, value)) : 0;
  return Math.floor(normalized * length);
}

function randomColor(random: RandomSource): MemoryColor {
  return MEMORY_COLORS[randomIndex(MEMORY_COLORS.length, random)]!;
}

function shuffle<T>(values: readonly T[], random: RandomSource): T[] {
  const result = [...values];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = randomIndex(index + 1, random);
    [result[index], result[swapIndex]] = [result[swapIndex]!, result[index]!];
  }

  return result;
}

function readInputKind(payload: JsonValue | null): string | null {
  if (!isJsonObject(payload)) {
    return null;
  }

  const kind = payload.kind;
  return typeof kind === "string" ? kind : null;
}

function readInputString(payload: JsonValue | null, key: string): string | null {
  if (!isJsonObject(payload)) {
    return null;
  }

  const value = payload[key];
  return typeof value === "string" ? value : null;
}

function isJsonObject(
  value: JsonValue | null
): value is { readonly [key: string]: JsonValue } {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function copyScores(playerIds: readonly string[]): Map<string, number> {
  return new Map(playerIds.map((playerId) => [playerId, 0] as const));
}

function scoresAsRecord(scores: ReadonlyMap<string, number>): Record<string, number> {
  return Object.fromEntries(scores.entries());
}

function rankedButonaResults(scores: ReadonlyMap<string, number>): ButonaBasResultView[] {
  return rankScores(scoresAsRecord(scores)).map(({ playerId, score, rank }) => ({
    playerId,
    score,
    rank
  }));
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

class ButonaBasAdapter implements Stage6GameAdapter {
  readonly gameId = "butona-bas" as const;
  playerIds: readonly string[];
  private readonly miniScores: Map<string, number>;
  private readonly deltas: ScoreDelta[] = [];
  private readonly windowPlayers = new Map<number, Set<string>>();
  private readonly resolvedWindowParticipants = new Map<number, ReadonlySet<string>>();
  private connectedPlayerIds: Set<string>;
  private startedAt: number | null = null;
  private lastResolvedWindow = 0;
  private lastTapByPlayer = new Map<string, number>();
  private finished = false;
  private finalAwardsApplied = false;

  constructor(playerIds: readonly string[], random: RandomSource) {
    this.playerIds = [...new Set(playerIds)];
    this.miniScores = copyScores(this.playerIds);
    this.connectedPlayerIds = new Set(this.playerIds);
  }

  get isStarted(): boolean {
    return this.startedAt !== null;
  }

  get isFinished(): boolean {
    return this.finished;
  }

  get eliminatedPlayerIds(): readonly string[] {
    return [];
  }

  start(now: number): void {
    assertNow(now);

    if (this.startedAt === null) {
      this.startedAt = now;
    }
  }

  private resolveClosedWindows(exclusiveEnd: number): boolean {
    let changed = false;

    while (this.lastResolvedWindow < exclusiveEnd && this.lastResolvedWindow < 150) {
      const participants = this.windowPlayers.get(this.lastResolvedWindow) ?? new Set<string>();
      this.resolvedWindowParticipants.set(this.lastResolvedWindow, new Set(participants));

      if (participants.size >= 2) {
        participants.forEach((playerId) => {
          scoreDelta(this.miniScores, this.deltas, playerId, 1, "butona-bas:pencere-coklu");
        });
        changed = true;
      } else if (participants.size === 1) {
        const playerId = [...participants][0]!;
        scoreDelta(this.miniScores, this.deltas, playerId, -1, "butona-bas:pencere-tek");
        changed = true;
      }

      this.windowPlayers.delete(this.lastResolvedWindow);
      this.lastResolvedWindow += 1;
    }

    return changed;
  }

  private getResultSummary(): ButonaBasResultSummary {
    let acceptedWindowCount = 0;
    let singletonWindowCount = 0;
    let multiPlayerWindowCount = 0;
    let emptyWindowCount = 0;
    let longestWindowCombo = 0;
    let currentWindowCombo = 0;

    for (let windowIndex = 0; windowIndex < 150; windowIndex += 1) {
      const participantCount = this.resolvedWindowParticipants.get(windowIndex)?.size ?? 0;

      if (participantCount === 0) {
        emptyWindowCount += 1;
        currentWindowCombo = 0;
        continue;
      }

      acceptedWindowCount += 1;
      currentWindowCombo += 1;
      longestWindowCombo = Math.max(longestWindowCombo, currentWindowCombo);

      if (participantCount === 1) {
        singletonWindowCount += 1;
      } else {
        multiPlayerWindowCount += 1;
      }
    }

    return {
      acceptedWindowCount,
      singletonWindowCount,
      multiPlayerWindowCount,
      emptyWindowCount,
      longestWindowCombo
    };
  }

  private getPlayerWindowSummary(playerId: string): Pick<ButonaBasOwnState, "acceptedWindowCount" | "longestWindowCombo"> {
    let acceptedWindowCount = 0;
    let longestWindowCombo = 0;
    let currentWindowCombo = 0;

    for (let windowIndex = 0; windowIndex < 150; windowIndex += 1) {
      const resolvedParticipants = this.resolvedWindowParticipants.get(windowIndex);
      const currentParticipants = this.windowPlayers.get(windowIndex);
      const participated = resolvedParticipants?.has(playerId) ?? currentParticipants?.has(playerId) ?? false;

      if (!participated) {
        currentWindowCombo = 0;
        continue;
      }

      acceptedWindowCount += 1;
      currentWindowCombo += 1;
      longestWindowCombo = Math.max(longestWindowCombo, currentWindowCombo);
    }

    return { acceptedWindowCount, longestWindowCombo };
  }

  private finishGame(): boolean {
    if (this.finished) {
      return false;
    }

    this.finished = true;

    if (!this.finalAwardsApplied) {
      const awards = createRankAwards(scoresAsRecord(this.miniScores), {
        uniqueLeaderPoints: 2,
        nextRankPoints: 1,
        tiedLeaderPoints: 1,
        awardAllTiedNextRank: true
      });
      this.deltas.push(...awardMapToDeltas(awards, "butona-bas:genel-siralama"));
      this.finalAwardsApplied = true;
    }

    return true;
  }

  advance(now: number): boolean {
    assertNow(now);

    if (this.startedAt === null || this.finished) {
      return false;
    }

    const elapsed = now - this.startedAt;
    const closedWindows = elapsed >= 45_000
      ? 150
      : Math.max(0, Math.min(150, Math.floor(elapsed / 300)));
    const changed = this.resolveClosedWindows(closedWindows);

    if (elapsed >= 45_000) {
      return this.finishGame() || changed;
    }

    return changed;
  }

  submit(playerId: string, payload: JsonValue | null, now: number): Stage6SubmitResult {
    assertNow(now);

    if (!this.playerIds.includes(playerId)) {
      return { accepted: false, reason: "invalid" };
    }

    if (!this.connectedPlayerIds.has(playerId)) {
      return { accepted: false, reason: "invalid" };
    }

    if (!this.isStarted || this.finished) {
      return { accepted: false, reason: "phase-locked" };
    }

    if (now >= this.startedAt! + 45_000) {
      this.advance(now);
      return { accepted: false, reason: "late" };
    }

    if (readInputKind(payload) !== "button-tap") {
      return { accepted: false, reason: "invalid" };
    }

    const windowIndex = Math.floor((now - this.startedAt!) / 300);
    const participants = this.windowPlayers.get(windowIndex) ?? new Set<string>();
    participants.add(playerId);
    this.windowPlayers.set(windowIndex, participants);
    this.lastTapByPlayer.set(playerId, windowIndex);
    return { accepted: true };
  }

  removePlayer(playerId: string): void {
    this.playerIds = this.playerIds.filter((candidate) => candidate !== playerId);
    this.connectedPlayerIds.delete(playerId);
    for (const participants of this.windowPlayers.values()) {
      participants.delete(playerId);
    }
    this.lastTapByPlayer.delete(playerId);
  }

  setConnectedPlayerIds(playerIds: readonly string[]): void {
    this.connectedPlayerIds = new Set(this.playerIds.filter((playerId) => playerIds.includes(playerId)));
  }

  getPublicState(now: number): ButonaBasPublicState {
    const elapsed = this.startedAt === null ? 0 : Math.max(0, now - this.startedAt);
    const windowIndex = this.finished
      ? 149
      : Math.min(149, Math.max(0, Math.floor(elapsed / 300)));

    return {
      gameId: this.gameId,
      kind: this.gameId,
      started: this.isStarted,
      windowMs: 300,
      totalDurationMs: 45_000,
      windowCount: 150,
      windowIndex,
      currentWindowEndsAt: this.startedAt === null || this.finished
        ? null
        : Math.min(this.startedAt + 45_000, this.startedAt + (windowIndex + 1) * 300),
      resultSummary: this.finished ? this.getResultSummary() : null,
      results: this.finished ? rankedButonaResults(this.miniScores) : null,
      finished: this.finished
    };
  }

  getOwnState(playerId: string, now: number): ButonaBasOwnState {
    const publicState = this.getPublicState(now);
    const windowSummary = this.getPlayerWindowSummary(playerId);
    return {
      gameId: this.gameId,
      kind: this.gameId,
      miniScore: this.miniScores.get(playerId) ?? 0,
      currentWindowIndex: publicState.windowIndex,
      lastTapWindowIndex: this.lastTapByPlayer.get(playerId) ?? null,
      acceptedWindowCount: windowSummary.acceptedWindowCount,
      longestWindowCombo: windowSummary.longestWindowCombo,
      finished: this.finished
    };
  }

  getMiniGameScores(): ReadonlyMap<string, number> {
    return new Map(this.miniScores);
  }

  getScoreDeltas(): readonly ScoreDelta[] {
    return [...this.deltas];
  }
}

class SizmaAdapter implements Stage6GameAdapter {
  readonly gameId = "sizma" as const;
  playerIds: readonly string[];
  private readonly random: RandomSource;
  private readonly outsiderPlayerId: string;
  private readonly commonWord: string;
  private readonly outsiderWord: string;
  private readonly roles: ReadonlyMap<string, "normal" | "outsider">;
  private readonly assignedWords: ReadonlyMap<string, string>;
  private readonly completedClueRounds = new Map<string, Set<number>>();
  private readonly readyPlayerIds = new Set<string>();
  private readonly votes = new Map<string, string>();
  private readonly miniScores: Map<string, number>;
  private connectedPlayerIds: Set<string>;
  private allDisconnectedAt: number | null = null;
  private readonly deltas: ScoreDelta[] = [];
  private started = false;
  private subPhase: SizmaSubPhase = "clue";
  private clueRound: 1 | 2 = 1;
  private clueTurnIndex = 0;
  private clueTurnsCompleted = 0;
  private voteEndsAt: number | null = null;
  private topVotedPlayerIds: readonly string[] | null = null;
  private outsiderCaught: boolean | null = null;
  private finished = false;
  private scoreApplied = false;

  constructor(playerIds: readonly string[], random: RandomSource) {
    this.playerIds = [...new Set(playerIds)];
    this.random = random;
    this.miniScores = copyScores(this.playerIds);
    this.connectedPlayerIds = new Set(this.playerIds);
    const outsiderIndex = randomIndex(this.playerIds.length, this.random);
    this.outsiderPlayerId = this.playerIds[outsiderIndex] ?? this.playerIds[0] ?? "";
    const pair = SIZMA_WORD_PAIRS[randomIndex(SIZMA_WORD_PAIRS.length, this.random)]!;
    this.commonWord = pair[0];
    this.outsiderWord = pair[1];

    const roleMap = new Map<string, "normal" | "outsider">();
    const wordMap = new Map<string, string>();
    this.playerIds.forEach((playerId) => {
      const outsider = playerId === this.outsiderPlayerId;
      roleMap.set(playerId, outsider ? "outsider" : "normal");
      wordMap.set(playerId, outsider ? this.outsiderWord : this.commonWord);
      this.completedClueRounds.set(playerId, new Set());
    });
    this.roles = roleMap;
    this.assignedWords = wordMap;
  }

  get isStarted(): boolean {
    return this.started;
  }

  get isFinished(): boolean {
    return this.finished;
  }

  get eliminatedPlayerIds(): readonly string[] {
    return [];
  }

  start(now: number): void {
    assertNow(now);
    this.started = true;
  }

  setConnectedPlayerIds(playerIds: readonly string[], now = Date.now()): void {
    const hadConnected = this.connectedPlayerIds.size > 0;
    this.connectedPlayerIds = new Set(this.playerIds.filter((playerId) => playerIds.includes(playerId)));
    if (this.connectedPlayerIds.size === 0) {
      if (hadConnected) this.allDisconnectedAt = now;
      return;
    }
    if (this.allDisconnectedAt !== null) {
      if (this.voteEndsAt !== null) this.voteEndsAt += Math.max(0, now - this.allDisconnectedAt);
      this.allDisconnectedAt = null;
    }
    this.normalizeClueTurn();
    this.normalizeReadyForVote(now);
  }

  private normalizeClueTurn(): void {
    if (this.subPhase !== "clue") {
      return;
    }

    if (this.connectedPlayerIds.size === 0) return;

    if (this.playerIds.length === 0) {
      this.subPhase = "results";
      this.finished = true;
      this.outsiderCaught = null;
      this.scoreApplied = true;
      return;
    }

    this.clueTurnsCompleted = this.playerIds.reduce((count, candidate) => {
      const completed = this.completedClueRounds.get(candidate);
      return count + (completed?.has(1) ? 1 : 0) + (completed?.has(2) ? 1 : 0);
    }, 0);

    this.clueTurnIndex = ((this.clueTurnIndex % this.playerIds.length) + this.playerIds.length) % this.playerIds.length;

    let checked = 0;
    while (
      checked < this.playerIds.length &&
      (!this.connectedPlayerIds.has(this.playerIds[this.clueTurnIndex]!) ||
        (this.completedClueRounds.get(this.playerIds[this.clueTurnIndex]!)?.has(this.clueRound) ?? false))
    ) {
      this.clueTurnIndex = (this.clueTurnIndex + 1) % this.playerIds.length;
      checked += 1;
    }

    if (checked < this.playerIds.length) {
      return;
    }

    if (this.clueRound === 1) {
      this.clueRound = 2;
      this.clueTurnIndex = 0;
      return;
    }

    this.subPhase = "ready-for-vote";
    this.clueTurnIndex = this.playerIds.length;
  }

  private normalizeReadyForVote(now: number): void {
    if (this.subPhase !== "ready-for-vote") {
      return;
    }

    if (this.connectedPlayerIds.size > 0 && [...this.connectedPlayerIds].every((playerId) => this.readyPlayerIds.has(playerId))) {
      this.subPhase = "vote";
      this.voteEndsAt = now + 30_000;
    }
  }

  private finishVote(): void {
    if (this.finished) {
      return;
    }

    const counts = new Map<string, number>();
    this.votes.forEach((target) => counts.set(target, (counts.get(target) ?? 0) + 1));
    const highest = Math.max(0, ...counts.values());
    const top = this.playerIds.filter((playerId) => (counts.get(playerId) ?? 0) === highest && highest > 0);
    this.topVotedPlayerIds = top;
    this.outsiderCaught = top.length === 1 && top[0] === this.outsiderPlayerId;
    this.subPhase = "results";
    this.finished = true;

    if (!this.scoreApplied) {
      if (this.outsiderCaught) {
        this.playerIds.forEach((playerId) => {
          if (this.roles.get(playerId) === "normal") {
            scoreDelta(this.miniScores, this.deltas, playerId, 1, "sizma:normal-bulundu");
          }
        });
      } else {
        scoreDelta(this.miniScores, this.deltas, this.outsiderPlayerId, 2, "sizma:sizma-kazandi");
      }
      this.scoreApplied = true;
    }
  }

  advance(now: number): boolean {
    assertNow(now);

    if (!this.started || this.finished || this.connectedPlayerIds.size === 0 || this.subPhase !== "vote" || this.voteEndsAt === null) {
      return false;
    }

    if (now < this.voteEndsAt) {
      return false;
    }

    this.finishVote();
    return true;
  }

  submit(playerId: string, payload: JsonValue | null, now: number): Stage6SubmitResult {
    assertNow(now);

    if (!this.playerIds.includes(playerId)) {
      return { accepted: false, reason: "invalid" };
    }

    if (!this.started || this.finished) {
      return { accepted: false, reason: "phase-locked" };
    }

    const kind = readInputKind(payload);

    if (this.subPhase === "clue") {
      if (kind !== "clue-complete" || this.playerIds[this.clueTurnIndex] !== playerId) {
        return { accepted: false, reason: "invalid" };
      }

      const completed = this.completedClueRounds.get(playerId) ?? new Set<number>();
      if (completed.has(this.clueRound)) {
        return { accepted: false, reason: "duplicate" };
      }

      completed.add(this.clueRound);
      this.completedClueRounds.set(playerId, completed);
      this.clueTurnsCompleted += 1;
      this.clueTurnIndex += 1;
      this.normalizeClueTurn();

      return { accepted: true };
    }

    if (this.subPhase === "ready-for-vote") {
      if (kind !== "vote-ready") {
        return { accepted: false, reason: "invalid" };
      }

      if (this.readyPlayerIds.has(playerId)) {
        return { accepted: false, reason: "duplicate" };
      }

      this.readyPlayerIds.add(playerId);
      this.normalizeReadyForVote(now);

      return { accepted: true };
    }

    if (this.subPhase === "vote") {
      if (kind !== "vote") {
        return { accepted: false, reason: "invalid" };
      }

      if (this.voteEndsAt !== null && now >= this.voteEndsAt) {
        this.advance(now);
        return { accepted: false, reason: "late" };
      }

      if (this.votes.has(playerId)) {
        return { accepted: false, reason: "duplicate" };
      }

      const targetPlayerId = readInputString(payload, "targetPlayerId");
      if (!targetPlayerId || !this.playerIds.includes(targetPlayerId) || !this.connectedPlayerIds.has(targetPlayerId)) {
        return { accepted: false, reason: "invalid" };
      }

      this.votes.set(playerId, targetPlayerId);
      return { accepted: true };
    }

    return { accepted: false, reason: "phase-locked" };
  }

  removePlayer(playerId: string): void {
    const removedIndex = this.playerIds.indexOf(playerId);

    if (removedIndex < 0) {
      return;
    }

    this.playerIds = this.playerIds.filter((candidate) => candidate !== playerId);
    this.connectedPlayerIds.delete(playerId);
    this.completedClueRounds.delete(playerId);
    this.readyPlayerIds.delete(playerId);
    this.votes.delete(playerId);
    for (const [voterId, targetPlayerId] of this.votes) {
      if (targetPlayerId === playerId) {
        this.votes.delete(voterId);
      }
    }

    if (this.subPhase === "clue") {
      if (removedIndex < this.clueTurnIndex) {
        this.clueTurnIndex -= 1;
      }

      this.normalizeClueTurn();
    } else if (this.subPhase === "ready-for-vote") {
      this.normalizeReadyForVote(Date.now());
    }
  }

  getPublicState(_now: number): SizmaPublicState {
    const voteCounts = this.finished
      ? this.playerIds.map((playerId) => ({
          playerId,
          votes: [...this.votes.values()].filter((target) => target === playerId).length
        }))
      : null;

    return {
      gameId: this.gameId,
      kind: this.gameId,
      started: this.started,
      subPhase: this.subPhase,
      clueRound: this.clueRound,
      clueTurnPlayerId: this.subPhase === "clue" ? this.playerIds[this.clueTurnIndex] ?? null : null,
      clueTurnIndex: this.clueTurnIndex,
      clueTurnsCompleted: this.clueTurnsCompleted,
      totalClueTurns: this.playerIds.length * 2,
      readyPlayerIds: [...this.readyPlayerIds],
      voteEndsAt: this.voteEndsAt,
      votedPlayerIds: [...this.votes.keys()],
      voteCounts,
      topVotedPlayerIds: this.topVotedPlayerIds,
      outsiderPlayerId: this.finished ? this.outsiderPlayerId : null,
      commonWord: this.finished ? this.commonWord : null,
      outsiderWord: this.finished ? this.outsiderWord : null,
      outsiderCaught: this.outsiderCaught,
      finished: this.finished
    };
  }

  getOwnState(playerId: string, _now: number): SizmaOwnState {
    const completed = [...(this.completedClueRounds.get(playerId) ?? new Set<number>())].sort();
    const role = this.roles.get(playerId) ?? "normal";
    return {
      gameId: this.gameId,
      kind: this.gameId,
      role,
      assignedWord: this.assignedWords.get(playerId) ?? this.commonWord,
      clueRound: this.clueRound,
      completedClueRounds: completed,
      canCompleteClue: this.subPhase === "clue" && this.playerIds[this.clueTurnIndex] === playerId,
      canReadyForVote: this.subPhase === "ready-for-vote" && !this.readyPlayerIds.has(playerId),
      hasVoted: this.votes.has(playerId),
      finished: this.finished
    };
  }

  getMiniGameScores(): ReadonlyMap<string, number> {
    return new Map(this.miniScores);
  }

  getScoreDeltas(): readonly ScoreDelta[] {
    return [...this.deltas];
  }
}

class MemoryAdapter implements Stage6GameAdapter {
  readonly gameId = "zaman-bombasi-hafizasi" as const;
  readonly playerIds: readonly string[];
  private readonly random: RandomSource;
  private readonly initialPlayerCount: number;
  private readonly eliminationThreshold: number;
  private readonly miniScores: Map<string, number>;
  private readonly deltas: ScoreDelta[] = [];
  private readonly order: string[];
  private readonly eliminated = new Set<string>();
  private connectedPlayerIds: Set<string>;
  private allDisconnectedAt: number | null = null;
  private sequence: MemoryColor[] = [];
  private sequenceIndex = 0;
  private activePlayerId: string | null = null;
  private currentOrderIndex = -1;
  private started = false;
  private subPhase: MemorySubPhase = "display";
  private displayUntil: number | null = null;
  private inputDeadline: number | null = null;
  private lastFailedPlayerId: string | null = null;
  private finished = false;
  constructor(playerIds: readonly string[], random: RandomSource) {
    this.playerIds = [...new Set(playerIds)];
    this.random = random;
    this.initialPlayerCount = this.playerIds.length;
    this.eliminationThreshold = Math.max(1, Math.ceil(this.initialPlayerCount / 2));
    this.miniScores = copyScores(this.playerIds);
    this.order = shuffle(this.playerIds, this.random);
    this.connectedPlayerIds = new Set(this.playerIds);
  }

  get isStarted(): boolean {
    return this.started;
  }

  get isFinished(): boolean {
    return this.finished;
  }

  get eliminatedPlayerIds(): readonly string[] {
    return [...this.eliminated];
  }

  start(now: number): void {
    assertNow(now);
    if (this.started) {
      return;
    }

    this.started = true;
    this.activePlayerId = this.order[0] ?? null;
    this.currentOrderIndex = this.activePlayerId === null ? -1 : 0;
    this.resetSequence(now);
  }

  private resetSequence(now: number): void {
    this.sequence = [randomColor(this.random), randomColor(this.random)];
    this.sequenceIndex = 0;
    this.showSequence(now);
  }

  private showSequence(now: number): void {
    this.subPhase = "display";
    this.displayUntil = now + this.sequence.length * 500 + 500;
    this.inputDeadline = null;
  }

  private beginInput(now: number): void {
    this.subPhase = "input";
    this.displayUntil = null;
    this.inputDeadline = now + this.sequence.length * 3_000;
  }

  private nextActivePlayer(): string | null {
    if (this.order.length === 0) {
      return null;
    }

    for (let offset = 1; offset <= this.order.length; offset += 1) {
      const index = (this.currentOrderIndex + offset + this.order.length) % this.order.length;
      const playerId = this.order[index]!;
      if (!this.eliminated.has(playerId) && this.connectedPlayerIds.has(playerId)) {
        this.currentOrderIndex = index;
        return playerId;
      }
    }

    return null;
  }

  private prepareNextTurn(now: number, keepSequence: boolean): void {
    this.activePlayerId = this.nextActivePlayer();
    if (this.activePlayerId === null) {
      this.finished = true;
      this.subPhase = "results";
      this.displayUntil = null;
      this.inputDeadline = null;
      return;
    }
    if (keepSequence) {
      this.sequenceIndex = 0;
      this.showSequence(now);
    } else {
      this.resetSequence(now);
    }
  }

  private failActivePlayer(now: number): void {
    const failed = this.activePlayerId;
    if (failed === null || this.eliminated.has(failed)) {
      return;
    }

    const activeBefore = this.order.filter((playerId) => !this.eliminated.has(playerId));
    this.eliminated.add(failed);
    this.lastFailedPlayerId = failed;
    scoreDelta(this.miniScores, this.deltas, failed, -1, "zaman-bombasi-hafizasi:elenme");
    activeBefore.forEach((playerId) => {
      if (playerId !== failed) {
        scoreDelta(this.miniScores, this.deltas, playerId, 1, "zaman-bombasi-hafizasi:hayatta-kalan");
      }
    });

    if (this.eliminated.size >= this.eliminationThreshold) {
      this.activePlayerId = null;
      this.subPhase = "results";
      this.displayUntil = null;
      this.inputDeadline = null;
      this.finished = true;
      return;
    }

    this.prepareNextTurn(now, false);
  }

  private completeActiveTurn(now: number): void {
    this.sequence.push(randomColor(this.random));
    this.sequenceIndex = 0;
    this.prepareNextTurn(now, true);
  }

  advance(now: number): boolean {
    assertNow(now);

    if (!this.started || this.finished || this.connectedPlayerIds.size === 0) {
      return false;
    }

    if (this.subPhase === "display" && this.displayUntil !== null && now >= this.displayUntil) {
      this.beginInput(now);
      return true;
    }

    if (this.subPhase === "input" && this.inputDeadline !== null && now >= this.inputDeadline) {
      this.failActivePlayer(now);
      return true;
    }

    return false;
  }

  setConnectedPlayerIds(playerIds: readonly string[], now = Date.now()): void {
    const hadConnected = this.connectedPlayerIds.size > 0;
    this.connectedPlayerIds = new Set(this.playerIds.filter((playerId) => playerIds.includes(playerId)));
    if (this.connectedPlayerIds.size === 0) {
      if (hadConnected) this.allDisconnectedAt = now;
      return;
    }
    if (this.allDisconnectedAt !== null) {
      const pausedFor = Math.max(0, now - this.allDisconnectedAt);
      if (this.displayUntil !== null) this.displayUntil += pausedFor;
      if (this.inputDeadline !== null) this.inputDeadline += pausedFor;
      this.allDisconnectedAt = null;
    }
    if (this.started && !this.finished && this.activePlayerId !== null && !this.connectedPlayerIds.has(this.activePlayerId)) {
      this.prepareNextTurn(now, false);
    }
  }

  submit(playerId: string, payload: JsonValue | null, now: number): Stage6SubmitResult {
    assertNow(now);

    if (!this.playerIds.includes(playerId)) {
      return { accepted: false, reason: "invalid" };
    }
    if (this.eliminated.has(playerId)) {
      return { accepted: false, reason: "spectator" };
    }
    if (!this.started || this.finished || this.subPhase !== "input" || this.activePlayerId !== playerId) {
      return { accepted: false, reason: "phase-locked" };
    }
    if (this.inputDeadline !== null && now >= this.inputDeadline) {
      this.failActivePlayer(now);
      return { accepted: false, reason: "late" };
    }

    const kind = readInputKind(payload);
    const color = readInputString(payload, "color") as MemoryColor | null;
    if (kind !== "memory-color" || color === null || !MEMORY_COLORS.includes(color)) {
      return { accepted: false, reason: "invalid" };
    }

    const expected = this.sequence[this.sequenceIndex];
    if (color !== expected) {
      this.failActivePlayer(now);
      return { accepted: true };
    }

    this.sequenceIndex += 1;
    if (this.sequenceIndex >= this.sequence.length) {
      this.completeActiveTurn(now);
    }

    return { accepted: true };
  }

  removePlayer(playerId: string): void {
    this.eliminated.add(playerId);
    if (this.activePlayerId === playerId && !this.finished) {
      this.prepareNextTurn(Date.now(), false);
    }
  }

  getPublicState(_now: number): MemoryPublicState {
    return {
      gameId: this.gameId,
      kind: this.gameId,
      started: this.started,
      subPhase: this.subPhase,
      sequence: this.subPhase === "display" ? [...this.sequence] : [],
      sequenceIndex: this.sequenceIndex,
      sequenceLength: this.sequence.length,
      activePlayerId: this.activePlayerId,
      inputDeadline: this.inputDeadline,
      displayUntil: this.displayUntil,
      order: [...this.order],
      eliminatedPlayerIds: [...this.eliminated],
      lastFailedPlayerId: this.lastFailedPlayerId,
      initialPlayerCount: this.initialPlayerCount,
      eliminationThreshold: this.eliminationThreshold,
      finished: this.finished
    };
  }

  getOwnState(playerId: string, _now: number): MemoryOwnState {
    const active = this.activePlayerId === playerId;
    return {
      gameId: this.gameId,
      kind: this.gameId,
      isActive: active,
      eliminated: this.eliminated.has(playerId),
      inputIndex: active ? this.sequenceIndex : 0,
      sequenceLength: this.sequence.length,
      inputDeadline: active ? this.inputDeadline : null,
      finished: this.finished
    };
  }

  getMiniGameScores(): ReadonlyMap<string, number> {
    return new Map(this.miniScores);
  }

  getScoreDeltas(): readonly ScoreDelta[] {
    return [...this.deltas];
  }
}

export function isStage6Game(gameId: GameId): gameId is Stage6GameId {
  return STAGE6_GAME_IDS.includes(gameId as Stage6GameId);
}

export function createStage6GameAdapter(
  gameId: Stage6GameId,
  playerIds: readonly string[],
  random: RandomSource = DEFAULT_RANDOM
): Stage6GameAdapter {
  switch (gameId) {
    case "butona-bas":
      return new ButonaBasAdapter(playerIds, random);
    case "sizma":
      return new SizmaAdapter(playerIds, random);
    case "zaman-bombasi-hafizasi":
      return new MemoryAdapter(playerIds, random);
  }
}
