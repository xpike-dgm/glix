import type { GameId, JsonValue, MatchPlayerState } from "./index.js";
import type { ScoreDelta } from "./engine.js";

/** Stage 8 contains the social, negotiation and private-information games. */
export type Stage8GameId =
  | "yazi-yaz"
  | "kendim"
  | "sozluk-blofu"
  | "cagrisim-agi"
  | "rusvet-darbe"
  | "karalama-defteri"
  | "ittifak"
  | "kontrol-paneli-kaosu"
  | "zehirli-kadeh";

export const STAGE8_GAME_IDS = [
  "yazi-yaz",
  "kendim",
  "sozluk-blofu",
  "cagrisim-agi",
  "rusvet-darbe",
  "karalama-defteri",
  "ittifak",
  "kontrol-paneli-kaosu",
  "zehirli-kadeh"
] as const satisfies readonly Stage8GameId[];

export type Stage8RandomSource = () => number;

export interface Stage8PointsView {
  readonly playerId: string;
  readonly points: number;
}

export type YaziYazSubPhase = "write" | "discussion" | "guess" | "results";

export interface YaziYazGuessView {
  readonly playerId: string;
  readonly targetWriterId: string | null;
  readonly targetWord: string | null;
  readonly personCorrect: boolean;
  readonly wordCorrect: boolean;
  readonly points: number;
}

export interface YaziYazPublicState {
  readonly gameId: "yazi-yaz";
  readonly kind: "yazi-yaz";
  readonly subPhase: YaziYazSubPhase;
  readonly phaseEndsAt: number | null;
  readonly finished: boolean;
  readonly writerPlayerIds: readonly string[] | null;
  readonly entries: readonly { readonly playerId: string; readonly role: "writer" | "innocent"; readonly word: string | null }[] | null;
  readonly guesses: readonly YaziYazGuessView[] | null;
  readonly resultPoints: readonly Stage8PointsView[] | null;
}

export interface YaziYazOwnState {
  readonly gameId: "yazi-yaz";
  readonly kind: "yazi-yaz";
  readonly role: "writer" | "innocent";
  readonly assignedWord: string | null;
  readonly hasWritten: boolean;
  readonly hasGuessed: boolean;
  readonly canGuess: boolean;
  readonly guessTargetPlayerIds: readonly string[];
  readonly finished: boolean;
}

export type KendimSubPhase = "write" | "match" | "results";

export interface KendimCardView {
  readonly cardId: string;
  readonly word: string;
  readonly ownerId: string | null;
}

export interface KendimMatchResultView {
  readonly guesserId: string;
  readonly cardId: string;
  readonly targetPlayerId: string;
  readonly correct: boolean;
  readonly points: number;
}

export interface KendimPublicState {
  readonly gameId: "kendim";
  readonly kind: "kendim";
  readonly subPhase: KendimSubPhase;
  readonly phaseEndsAt: number | null;
  readonly finished: boolean;
  readonly cards: readonly KendimCardView[] | null;
  readonly matchResults: readonly KendimMatchResultView[] | null;
  readonly ownerBonusPlayerIds: readonly string[] | null;
  readonly resultPoints: readonly Stage8PointsView[] | null;
}

export interface KendimOwnState {
  readonly gameId: "kendim";
  readonly kind: "kendim";
  readonly ownCardId: string | null;
  readonly ownWord: string | null;
  readonly hasWritten: boolean;
  readonly hasSubmittedMatches: boolean;
  readonly finished: boolean;
}

/**
 * Evaluates whether a player in the match is currently eligible as a Kendim target.
 * Required product rule: connected === true, currentGameParticipant === true, eliminated !== true.
 */
export function isEligibleKendimTarget(player: MatchPlayerState): boolean {
  return Boolean(player.connected && player.currentGameParticipant && !player.eliminated);
}

/**
 * Prunes local matches so that only mappings whose target player is currently eligible
 * (connected, currentGameParticipant, not eliminated) are retained.
 * Returns the pruned dictionary and a boolean flag indicating if any mapping was pruned.
 */
export function pruneInvalidLocalMappings(
  matches: Record<string, string>,
  players: readonly MatchPlayerState[]
): {
  readonly prunedMatches: Record<string, string>;
  readonly hasPruned: boolean;
} {
  const eligiblePlayerIds = new Set(
    players.filter(isEligibleKendimTarget).map((p) => p.id)
  );

  let hasPruned = false;
  const prunedMatches: Record<string, string> = {};

  for (const [cardId, targetPlayerId] of Object.entries(matches)) {
    if (eligiblePlayerIds.has(targetPlayerId)) {
      prunedMatches[cardId] = targetPlayerId;
    } else {
      hasPruned = true;
    }
  }

  return { prunedMatches, hasPruned };
}

export type SozlukBlofuSubPhase = "write" | "choose" | "results";

export interface SozlukDefinitionView {
  readonly id: string;
  readonly text: string;
  readonly ownerId: string | null;
  readonly isReal: boolean | null;
  readonly selectedByPlayerIds: readonly string[];
}

export interface SozlukBlofuPublicState {
  readonly gameId: "sozluk-blofu";
  readonly kind: "sozluk-blofu";
  readonly subPhase: SozlukBlofuSubPhase;
  readonly phaseEndsAt: number | null;
  readonly finished: boolean;
  readonly word: string;
  readonly definitions: readonly SozlukDefinitionView[] | null;
  readonly resultPoints: readonly Stage8PointsView[] | null;
}

export interface SozlukBlofuOwnState {
  readonly gameId: "sozluk-blofu";
  readonly kind: "sozluk-blofu";
  readonly hasWritten: boolean;
  readonly bluffText: string | null;
  readonly hasChosen: boolean;
  readonly finished: boolean;
}

export type CagrisimSubPhase = "answer" | "results";

export interface CagrisimGroupView {
  readonly answer: string;
  readonly playerIds: readonly string[];
  readonly points: number;
}

export interface CagrisimAgiPublicState {
  readonly gameId: "cagrisim-agi";
  readonly kind: "cagrisim-agi";
  readonly subPhase: CagrisimSubPhase;
  readonly phaseEndsAt: number | null;
  readonly finished: boolean;
  readonly mainWord: string;
  readonly groups: readonly CagrisimGroupView[] | null;
  readonly resultPoints: readonly Stage8PointsView[] | null;
}

export interface CagrisimAgiOwnState {
  readonly gameId: "cagrisim-agi";
  readonly kind: "cagrisim-agi";
  readonly hasSubmitted: boolean;
  readonly answer: string | null;
  readonly finished: boolean;
}

export type RusvetSubPhase = "election" | "rps" | "distribution" | "results";
export type RpsChoice = "rock" | "paper" | "scissors";

export interface RusvetAllocationView {
  readonly targetPlayerId: string;
  readonly points: number;
}

export interface RusvetDarbePublicState {
  readonly gameId: "rusvet-darbe";
  readonly kind: "rusvet-darbe";
  readonly subPhase: RusvetSubPhase;
  readonly phaseEndsAt: number | null;
  readonly finished: boolean;
  readonly presidentId: string | null;
  readonly presidentVoteCount: number | null;
  readonly rpsCandidateIds: readonly string[];
  readonly rpsRound: number;
  readonly voteCounts: readonly { readonly playerId: string; readonly votes: number }[] | null;
  readonly allocations: readonly RusvetAllocationView[] | null;
  readonly resultPoints: readonly Stage8PointsView[] | null;
}

export interface RusvetDarbeOwnState {
  readonly gameId: "rusvet-darbe";
  readonly kind: "rusvet-darbe";
  readonly hasVoted: boolean;
  readonly isPresident: boolean;
  readonly canChooseRps: boolean;
  readonly hasChosenRps: boolean;
  readonly rpsCandidateIds: readonly string[];
  readonly remainingDistributionPoints: number;
  readonly submittedAllocations: readonly RusvetAllocationView[];
  readonly hasSubmittedDistribution: boolean;
  readonly finished: boolean;
}

export type KaralamaSubPhase = "draw" | "vote" | "results";
export type DrawingColor = "cyan" | "pink" | "yellow" | "lime" | "orange" | "violet";

export interface DrawingPoint {
  readonly x: number;
  readonly y: number;
}

export interface DrawingStroke {
  readonly color: DrawingColor;
  readonly size: number;
  readonly points: readonly DrawingPoint[];
}

export interface KaralamaDrawingView {
  readonly playerId: string;
  readonly strokes: readonly DrawingStroke[];
}

export interface KaralamaDefteriPublicState {
  readonly gameId: "karalama-defteri";
  readonly kind: "karalama-defteri";
  readonly subPhase: KaralamaSubPhase;
  readonly phaseEndsAt: number | null;
  readonly finished: boolean;
  readonly drawings: readonly KaralamaDrawingView[] | null;
  readonly voteCounts: readonly { readonly playerId: string; readonly votes: number }[] | null;
  readonly outsiderPlayerId: string | null;
  readonly commonWord: string | null;
  readonly outsiderWord: string | null;
  readonly outsiderCaught: boolean | null;
  readonly resultPoints: readonly Stage8PointsView[] | null;
}

export interface KaralamaDefteriOwnState {
  readonly gameId: "karalama-defteri";
  readonly kind: "karalama-defteri";
  readonly role: "informed" | "ignorant";
  readonly assignedWord: string | null;
  readonly hasDrawing: boolean;
  readonly hasVoted: boolean;
  readonly finished: boolean;
}

export type IttifakSubPhase = "bargain" | "vote" | "results";

export interface IttifakPublicState {
  readonly gameId: "ittifak";
  readonly kind: "ittifak";
  readonly subPhase: IttifakSubPhase;
  readonly phaseEndsAt: number | null;
  readonly finished: boolean;
  readonly voteCounts: readonly { readonly playerId: string; readonly votes: number }[] | null;
  readonly resultPoints: readonly Stage8PointsView[] | null;
}

export interface IttifakOwnState {
  readonly gameId: "ittifak";
  readonly kind: "ittifak";
  readonly hasVoted: boolean;
  readonly finished: boolean;
}

export type PanelColor = "mavi" | "yeşil" | "kırmızı" | "sarı";

export interface PanelResultView {
  readonly playerId: string;
  readonly panelColors: readonly PanelColor[];
  readonly clueHolderId: string;
  readonly cutColor: PanelColor | null;
  readonly correctColor: PanelColor;
  readonly correct: boolean;
  readonly points: number;
}

export interface KontrolPaneliPublicState {
  readonly gameId: "kontrol-paneli-kaosu";
  readonly kind: "kontrol-paneli-kaosu";
  readonly phaseEndsAt: number | null;
  readonly finished: boolean;
  readonly results: readonly PanelResultView[] | null;
  readonly resultPoints: readonly Stage8PointsView[] | null;
}

export interface KontrolPaneliOwnState {
  readonly gameId: "kontrol-paneli-kaosu";
  readonly kind: "kontrol-paneli-kaosu";
  readonly panelColors: readonly PanelColor[];
  readonly clueText: string;
  readonly hasCut: boolean;
  readonly finished: boolean;
}

export interface ZehirliKadehTradeView {
  readonly fromPlayerId: string;
  readonly toPlayerId: string;
}

export interface ZehirliKadehPublicState {
  readonly gameId: "zehirli-kadeh";
  readonly kind: "zehirli-kadeh";
  readonly phaseEndsAt: number | null;
  readonly finished: boolean;
  readonly tradeCount: number;
  readonly poisonedPlayerIds: readonly string[] | null;
  readonly trades: readonly ZehirliKadehTradeView[] | null;
  readonly resultPoints: readonly Stage8PointsView[] | null;
}

export interface ZehirliKadehOwnState {
  readonly gameId: "zehirli-kadeh";
  readonly kind: "zehirli-kadeh";
  /** Poison status is intentionally hidden until the result screen. */
  readonly poisoned: boolean | null;
  readonly hasTraded: boolean;
  readonly canTrade: boolean;
  readonly finished: boolean;
}

export type Stage8PublicState =
  | YaziYazPublicState
  | KendimPublicState
  | SozlukBlofuPublicState
  | CagrisimAgiPublicState
  | RusvetDarbePublicState
  | KaralamaDefteriPublicState
  | IttifakPublicState
  | KontrolPaneliPublicState
  | ZehirliKadehPublicState;

export type Stage8OwnState =
  | YaziYazOwnState
  | KendimOwnState
  | SozlukBlofuOwnState
  | CagrisimAgiOwnState
  | RusvetDarbeOwnState
  | KaralamaDefteriOwnState
  | IttifakOwnState
  | KontrolPaneliOwnState
  | ZehirliKadehOwnState;

export type Stage8InputRejection =
  | "phase-locked"
  | "late"
  | "duplicate"
  | "spectator"
  | "invalid";

export type Stage8SubmitResult =
  | { readonly accepted: true }
  | { readonly accepted: false; readonly reason: Stage8InputRejection };

export interface Stage8GameAdapter {
  readonly gameId: Stage8GameId;
  readonly playerIds: readonly string[];
  readonly isStarted: boolean;
  readonly isFinished: boolean;
  readonly eliminatedPlayerIds: readonly string[];
  start(now: number): void;
  advance(now: number): boolean;
  submit(playerId: string, payload: JsonValue | null, now: number): Stage8SubmitResult;
  /** Updates live targets without removing reconnectable room members. */
  setConnectedPlayerIds?(playerIds: readonly string[]): void;
  removePlayer(playerId: string): void;
  getPublicState(now: number): Stage8PublicState;
  getOwnState(playerId: string, now: number): Stage8OwnState;
  getMiniGameScores(): ReadonlyMap<string, number>;
  getScoreDeltas(): readonly ScoreDelta[];
}

const DEFAULT_RANDOM: Stage8RandomSource = () => Math.random();
const WRITE_THIRTY_SECONDS = 30_000;
const DISCUSSION_SIXTY_SECONDS = 60_000;
const BLUFF_FIFTY_SECONDS = 50_000;
const CHOOSE_THIRTY_SECONDS = 30_000;
const ONE_PHASE_THIRTY_SECONDS = 30_000;
const ELECTION_TWENTY_SECONDS = 20_000;
const DISTRIBUTION_TWENTY_FIVE_SECONDS = 25_000;
const DRAW_SEVENTY_FIVE_SECONDS = 75_000;
const VOTE_TWENTY_SECONDS = 20_000;
const BARGAIN_SIXTY_SECONDS = 60_000;
const VOTE_FIFTEEN_SECONDS = 15_000;
const PANEL_SIXTY_SECONDS = 60_000;
const GLASS_TWENTY_SECONDS = 20_000;
const GLASS_TRADE_EXTENSION = 5_000;

const DICTIONARY_POOL = [
  { word: "MÜLHEM", definition: "Bir düşünceyi veya sözü başka bir anlam katmanına taşıyan eski bir anlatım biçimi." },
  { word: "FÜRUZAN", definition: "Parlaklığı kısa süreli parlayan, gösterişli fakat narin bir süs eşyası." },
  { word: "KÖSNE", definition: "Bir işin en küçük ayrıntısını düzenlemek için kullanılan hayalî ölçü aracı." },
  { word: "TILSIMAK", definition: "Bir nesnenin etrafında dönüp ona alışılmadık bir ritim kazandırmak." },
  { word: "ZÜLVE", definition: "Rüzgârdan sonra yüzeyde kalan ince ve ışıklı toz tabakası." },
  { word: "PÜRSÜ", definition: "Bir topluluğun aynı anda çıkardığı kısa, neşeli uğultu." },
  { word: "NEŞTERE", definition: "Küçük bir kapının kilidini ses çıkarmadan açmaya yarayan eski düzenek." },
  { word: "ŞAKUL", definition: "Bir şeyin dengede durup durmadığını anlamaya yarayan sallantılı işaret." },
  { word: "GÜMRAH", definition: "Yanlış yöne sapmış bir yolun tekrar ana hatta bağlandığı nokta." },
  { word: "PERVAZ", definition: "Bir ışık kaynağının çevresinde oluşan renkli, dar geçiş halkası." }
] as const;

const ASSOCIATION_POOL = ["AY", "KÖPRÜ", "KAHVE", "GÖLGE", "FIRTINA", "KAMERA", "PİZZA", "KUMSAL", "ROKET", "DOSTLUK", "KEDİ", "SİHİR", "GECE", "MÜZİK"] as const;

const DRAWING_POOL = [
  { word: "ELMA", nearby: "ARMUT" },
  { word: "KEDİ", nearby: "KÖPEK" },
  { word: "GÜNEŞ", nearby: "AY" },
  { word: "ROKET", nearby: "UÇAK" },
  { word: "PİZZA", nearby: "TART" },
  { word: "KAMERA", nearby: "TELEFON" },
  { word: "ŞEMSİYE", nearby: "ŞAPKA" },
  { word: "GİTAR", nearby: "KEMAN" }
] as const;

const PANEL_COLORS: readonly PanelColor[] = ["mavi", "yeşil", "kırmızı", "sarı"];
const DRAWING_COLORS: readonly DrawingColor[] = ["cyan", "pink", "yellow", "lime", "orange", "violet"];

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

function randomIndex(length: number, random: Stage8RandomSource): number {
  if (length <= 1) return 0;
  const value = random();
  const normalized = Number.isFinite(value) ? Math.max(0, Math.min(0.999999, value)) : 0;
  return Math.floor(normalized * length);
}

function shuffled<T>(values: readonly T[], random: Stage8RandomSource): T[] {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = randomIndex(index + 1, random);
    [result[index], result[swapIndex]] = [result[swapIndex]!, result[index]!];
  }
  return result;
}

function randomFrom<T>(values: readonly T[], random: Stage8RandomSource): T {
  return values[randomIndex(values.length, random)]!;
}

function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLocaleUpperCase("tr-TR");
}

function cleanFreeText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
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

function inputValue(payload: JsonValue | null, key: string): JsonValue | null {
  return isJsonObject(payload) && key in payload ? payload[key]! : null;
}

function inputArray(payload: JsonValue | null, key: string): readonly JsonValue[] | null {
  const value = inputValue(payload, key);
  return Array.isArray(value) ? value : null;
}

function inputInteger(value: JsonValue | null): number | null {
  return typeof value === "number" && Number.isInteger(value) ? value : null;
}

function pointsView(scores: ReadonlyMap<string, number>): Stage8PointsView[] {
  return [...scores.entries()].map(([playerId, points]) => ({ playerId, points }));
}

function sortByPoints(scores: ReadonlyMap<string, number>): string[] {
  return [...scores.keys()].sort((left, right) => (scores.get(right) ?? 0) - (scores.get(left) ?? 0) || left.localeCompare(right));
}

function addGroupScore(scores: Map<string, number>, playerId: string, points: number): void {
  scores.set(playerId, (scores.get(playerId) ?? 0) + points);
}

function allOtherPlayers(playerIds: readonly string[], playerId: string): string[] {
  return playerIds.filter((candidate) => candidate !== playerId);
}

function voteCounts(playerIds: readonly string[], votes: ReadonlyMap<string, string>): { readonly playerId: string; readonly votes: number }[] {
  return playerIds.map((playerId) => ({
    playerId,
    votes: [...votes.values()].filter((target) => target === playerId).length
  }));
}

function mapToAllocations(values: ReadonlyMap<string, number>): RusvetAllocationView[] {
  return [...values.entries()].filter(([, points]) => points > 0).map(([targetPlayerId, points]) => ({ targetPlayerId, points }));
}

function rpsBeats(left: RpsChoice, right: RpsChoice): boolean {
  return (left === "rock" && right === "scissors") || (left === "scissors" && right === "paper") || (left === "paper" && right === "rock");
}

function panelColorLabel(color: PanelColor): string {
  return color.toLocaleUpperCase("tr-TR");
}

function permutations<T>(values: readonly T[]): T[][] {
  if (values.length <= 1) return [[...values]];
  const result: T[][] = [];
  values.forEach((value, index) => {
    const remaining = [...values.slice(0, index), ...values.slice(index + 1)];
    permutations(remaining).forEach((tail) => result.push([value, ...tail]));
  });
  return result;
}

function parseDrawingStrokes(payload: JsonValue | null): DrawingStroke[] | null {
  const values = inputArray(payload, "strokes");
  if (!values || values.length > 180) return null;
  const strokes: DrawingStroke[] = [];
  for (const value of values) {
    if (!isJsonObject(value)) return null;
    const color = typeof value.color === "string" && DRAWING_COLORS.includes(value.color as DrawingColor) ? value.color as DrawingColor : null;
    const size = typeof value.size === "number" && Number.isFinite(value.size) ? Math.max(2, Math.min(40, value.size)) : null;
    const rawPoints = Array.isArray(value.points) ? value.points : null;
    if (!color || size === null || !rawPoints || rawPoints.length < 2 || rawPoints.length > 140) return null;
    const points: DrawingPoint[] = [];
    for (const rawPoint of rawPoints) {
      if (!isJsonObject(rawPoint) || typeof rawPoint.x !== "number" || typeof rawPoint.y !== "number" || !Number.isFinite(rawPoint.x) || !Number.isFinite(rawPoint.y)) return null;
      points.push({ x: Math.max(0, Math.min(1, rawPoint.x)), y: Math.max(0, Math.min(1, rawPoint.y)) });
    }
    strokes.push({ color, size, points });
  }
  return strokes;
}

abstract class Stage8AdapterBase implements Stage8GameAdapter {
  abstract readonly gameId: Stage8GameId;
  playerIds: readonly string[];
  protected readonly miniScores: Map<string, number>;
  protected readonly deltas: ScoreDelta[] = [];
  protected connectedPlayerIds: Set<string>;
  protected startedAt: number | null = null;
  protected finished = false;

  constructor(playerIds: readonly string[]) {
    this.playerIds = uniquePlayerIds(playerIds);
    this.miniScores = copyScores(this.playerIds);
    this.connectedPlayerIds = new Set(this.playerIds);
  }

  get isStarted(): boolean { return this.startedAt !== null; }
  get isFinished(): boolean { return this.finished; }
  get eliminatedPlayerIds(): readonly string[] { return []; }

  setConnectedPlayerIds(playerIds: readonly string[]): void {
    this.connectedPlayerIds = new Set(this.playerIds.filter((candidate) => playerIds.includes(candidate)));
  }

  protected livePlayerIds(): string[] {
    return this.playerIds.filter((playerId) => this.connectedPlayerIds.has(playerId));
  }

  protected isConnected(playerId: string): boolean {
    return this.connectedPlayerIds.has(playerId);
  }

  abstract advance(now: number): boolean;
  abstract submit(playerId: string, payload: JsonValue | null, now: number): Stage8SubmitResult;
  abstract getPublicState(now: number): Stage8PublicState;
  abstract getOwnState(playerId: string, now: number): Stage8OwnState;

  start(now: number): void {
    assertNow(now);
    if (this.startedAt === null) this.startedAt = now;
  }

  protected addMini(playerId: string, points: number): void {
    if (points !== 0 && this.miniScores.has(playerId)) addGroupScore(this.miniScores, playerId, points);
  }

  protected addDirect(playerId: string, points: number, reason: string): void {
    if (points === 0) return;
    this.addMini(playerId, points);
    this.deltas.push({ playerId, points, reason });
  }

  protected addGeneral(playerId: string, points: number, reason: string): void {
    if (points !== 0) this.deltas.push({ playerId, points, reason });
  }

  protected finish(): void { this.finished = true; }

  removePlayer(playerId: string): void {
    this.playerIds = this.playerIds.filter((candidate) => candidate !== playerId);
    this.connectedPlayerIds.delete(playerId);
    this.miniScores.delete(playerId);
  }

  getMiniGameScores(): ReadonlyMap<string, number> { return new Map(this.miniScores); }
  getScoreDeltas(): readonly ScoreDelta[] { return [...this.deltas]; }
}

class YaziYazAdapter extends Stage8AdapterBase {
  readonly gameId = "yazi-yaz" as const;
  private readonly random: Stage8RandomSource;
  private readonly writerIds: string[];
  private readonly roles = new Map<string, "writer" | "innocent">();
  private readonly words = new Map<string, string>();
  private readonly written = new Set<string>();
  private readonly guesses = new Map<string, { targetWriterId: string; targetWord: string }>();
  private subPhase: YaziYazSubPhase = "write";
  private phaseEndsAt: number | null = null;
  private results: YaziYazGuessView[] | null = null;

  constructor(playerIds: readonly string[], random: Stage8RandomSource) {
    super(playerIds);
    this.random = random;
    this.writerIds = shuffled(this.playerIds, random).slice(0, Math.min(2, this.playerIds.length));
    this.playerIds.forEach((playerId) => this.roles.set(playerId, this.writerIds.includes(playerId) ? "writer" : "innocent"));
  }

  override start(now: number): void {
    super.start(now);
    if (this.phaseEndsAt === null) this.phaseEndsAt = now + WRITE_THIRTY_SECONDS;
  }

  private resolve(): void {
    if (this.results || this.finished) return;
    this.results = this.playerIds.map((playerId) => {
      const guess = this.guesses.get(playerId);
      const otherWriterId = this.writerIds.find((candidate) => candidate !== playerId) ?? this.writerIds[0] ?? "";
      const personCorrect = Boolean(guess && guess.targetWriterId === otherWriterId);
      const wordCorrect = Boolean(personCorrect && guess && guess.targetWord === (this.words.get(otherWriterId) ?? ""));
      const points = (personCorrect ? 1 : 0) + (wordCorrect ? 1 : 0);
      if (points > 0) this.addDirect(playerId, points, "yazi-yaz:tahmin");
      return {
        playerId,
        targetWriterId: guess?.targetWriterId ?? null,
        targetWord: guess?.targetWord ?? null,
        personCorrect,
        wordCorrect,
        points
      };
    });
    this.subPhase = "results";
    this.phaseEndsAt = null;
    this.finish();
  }

  advance(now: number): boolean {
    assertNow(now);
    if (!this.isStarted || this.finished || this.phaseEndsAt === null || now < this.phaseEndsAt) return false;
    let changed = false;
    while (!this.finished && this.phaseEndsAt !== null && now >= this.phaseEndsAt) {
      const scheduled: number = this.phaseEndsAt;
      if (this.subPhase === "write") {
        this.subPhase = "discussion";
        this.phaseEndsAt = scheduled + DISCUSSION_SIXTY_SECONDS;
        changed = true;
      } else if (this.subPhase === "discussion") {
        this.subPhase = "guess";
        this.phaseEndsAt = scheduled + WRITE_THIRTY_SECONDS;
        changed = true;
      } else if (this.subPhase === "guess") {
        this.resolve();
        changed = true;
      } else {
        break;
      }
    }
    return changed;
  }

  submit(playerId: string, payload: JsonValue | null, now: number): Stage8SubmitResult {
    assertNow(now);
    if (!this.playerIds.includes(playerId)) return { accepted: false, reason: "invalid" };
    if (!this.isStarted || this.finished) return { accepted: false, reason: "phase-locked" };
    if (this.phaseEndsAt !== null && now >= this.phaseEndsAt) { this.advance(now); return { accepted: false, reason: "late" }; }
    if (this.subPhase === "write") {
      const role = this.roles.get(playerId);
      if (inputKind(payload) === "yazi-word" && role === "writer") {
        const value = inputString(payload, "word");
        if (value === null || normalizeText(value).length === 0) return { accepted: false, reason: "invalid" };
        this.words.set(playerId, normalizeText(value));
        this.written.add(playerId);
        return { accepted: true };
      }
      if (inputKind(payload) === "yazi-masum" && role === "innocent") {
        this.written.add(playerId);
        return { accepted: true };
      }
      return { accepted: false, reason: "invalid" };
    }
    if (this.subPhase !== "guess") return { accepted: false, reason: "phase-locked" };
    if (this.guesses.has(playerId)) return { accepted: false, reason: "duplicate" };
    if (inputKind(payload) !== "yazi-guess") return { accepted: false, reason: "invalid" };
    const targetWriterId = inputString(payload, "targetWriterId");
    const targetWord = inputString(payload, "targetWord");
    if (targetWriterId === null || targetWord === null || !this.writerIds.includes(targetWriterId) || !this.isConnected(targetWriterId) || targetWriterId === playerId || normalizeText(targetWord).length === 0) return { accepted: false, reason: "invalid" };
    this.guesses.set(playerId, { targetWriterId, targetWord: normalizeText(targetWord) });
    return { accepted: true };
  }

  override removePlayer(playerId: string): void {
    super.removePlayer(playerId);
    this.words.delete(playerId);
    this.written.delete(playerId);
    this.guesses.delete(playerId);
  }

  getPublicState(_now: number): YaziYazPublicState {
    return {
      gameId: this.gameId,
      kind: this.gameId,
      subPhase: this.subPhase,
      phaseEndsAt: this.phaseEndsAt,
      finished: this.finished,
      writerPlayerIds: this.finished ? [...this.writerIds] : null,
      entries: this.finished ? this.playerIds.map((playerId) => ({ playerId, role: this.roles.get(playerId) ?? "innocent", word: this.roles.get(playerId) === "writer" ? this.words.get(playerId) ?? "" : null })) : null,
      guesses: this.finished ? this.results : null,
      resultPoints: this.finished ? pointsView(this.miniScores) : null
    };
  }

  getOwnState(playerId: string, _now: number): YaziYazOwnState {
    const role = this.roles.get(playerId) ?? "innocent";
    return {
      gameId: this.gameId,
      kind: this.gameId,
      role,
      assignedWord: role === "writer" ? this.words.get(playerId) ?? null : null,
      hasWritten: this.written.has(playerId),
      hasGuessed: this.guesses.has(playerId),
      canGuess: this.subPhase === "guess" && !this.guesses.has(playerId) && !this.finished,
      guessTargetPlayerIds: allOtherPlayers(this.livePlayerIds(), playerId),
      finished: this.finished
    };
  }
}

class KendimAdapter extends Stage8AdapterBase {
  readonly gameId = "kendim" as const;
  private readonly random: Stage8RandomSource;
  private readonly words = new Map<string, string>();
  private readonly cards = new Map<string, { cardId: string; word: string; ownerId: string }>();
  private readonly matches = new Map<string, readonly { cardId: string; targetPlayerId: string }[]>();
  private subPhase: KendimSubPhase = "write";
  private phaseEndsAt: number | null = null;
  private matchResults: KendimMatchResultView[] | null = null;
  private ownerBonusPlayerIds: string[] | null = null;

  constructor(playerIds: readonly string[], random: Stage8RandomSource) { super(playerIds); this.random = random; }

  override start(now: number): void { super.start(now); if (this.phaseEndsAt === null) this.phaseEndsAt = now + WRITE_THIRTY_SECONDS; }

  private createCards(): void {
    const cardValues = shuffled(this.playerIds, this.random);
    cardValues.forEach((playerId, index) => {
      const cardId = `kendim-card-${index + 1}`;
      this.cards.set(cardId, { cardId, word: this.words.get(playerId) ?? "", ownerId: playerId });
    });
  }

  private resolve(): void {
    if (this.finished) return;
    const results: KendimMatchResultView[] = [];
    const correctByCard = new Map<string, string[]>();
    this.matches.forEach((guesses, guesserId) => guesses.forEach((guess) => {
      const card = this.cards.get(guess.cardId);
      if (!card) return;
      const correct = card.ownerId === guess.targetPlayerId;
      const points = correct ? 1 : -1;
      this.addMini(guesserId, points);
      if (correct) correctByCard.set(guess.cardId, [...(correctByCard.get(guess.cardId) ?? []), guesserId]);
      results.push({ guesserId, cardId: guess.cardId, targetPlayerId: guess.targetPlayerId, correct, points });
    }));
    this.ownerBonusPlayerIds = [];
    correctByCard.forEach((guessers, cardId) => {
      if (guessers.length === 1) {
        const owner = this.cards.get(cardId)?.ownerId;
        if (owner) { this.addMini(owner, 1); this.ownerBonusPlayerIds!.push(owner); }
      }
    });
    const topScore = Math.max(...this.miniScores.values(), 0);
    for (const playerId of this.playerIds) {
      if ((this.miniScores.get(playerId) ?? 0) === topScore) this.addGeneral(playerId, 1, "kendim:lider");
    }
    this.matchResults = results;
    this.subPhase = "results";
    this.phaseEndsAt = null;
    this.finish();
  }

  advance(now: number): boolean {
    assertNow(now);
    if (!this.isStarted || this.finished || this.phaseEndsAt === null || now < this.phaseEndsAt) return false;
    const scheduled = this.phaseEndsAt;
    if (this.subPhase === "write") {
      this.createCards();
      this.subPhase = "match";
      this.phaseEndsAt = scheduled + CHOOSE_THIRTY_SECONDS;
      return true;
    }
    if (this.subPhase === "match") { this.resolve(); return true; }
    return false;
  }

  submit(playerId: string, payload: JsonValue | null, now: number): Stage8SubmitResult {
    assertNow(now);
    if (!this.playerIds.includes(playerId)) return { accepted: false, reason: "invalid" };
    if (!this.isStarted || this.finished) return { accepted: false, reason: "phase-locked" };
    if (this.phaseEndsAt !== null && now >= this.phaseEndsAt) { this.advance(now); return { accepted: false, reason: "late" }; }
    if (this.subPhase === "write") {
      if (this.words.has(playerId)) return { accepted: false, reason: "duplicate" };
      if (inputKind(payload) !== "kendim-word") return { accepted: false, reason: "invalid" };
      const word = inputString(payload, "word");
      if (word === null || normalizeText(word).length === 0) return { accepted: false, reason: "invalid" };
      this.words.set(playerId, cleanFreeText(word));
      return { accepted: true };
    }
    if (this.subPhase !== "match" || this.matches.has(playerId)) return { accepted: false, reason: this.matches.has(playerId) ? "duplicate" : "phase-locked" };
    if (inputKind(payload) !== "kendim-matches") return { accepted: false, reason: "invalid" };
    const rawMatches = inputArray(payload, "matches");
    if (!rawMatches || rawMatches.length > this.cards.size) return { accepted: false, reason: "invalid" };
    const guesses: { cardId: string; targetPlayerId: string }[] = [];
    const seenCards = new Set<string>();
    for (const raw of rawMatches) {
      if (!isJsonObject(raw) || typeof raw.cardId !== "string" || typeof raw.targetPlayerId !== "string" || seenCards.has(raw.cardId) || !this.cards.has(raw.cardId) || !this.playerIds.includes(raw.targetPlayerId)) return { accepted: false, reason: "invalid" };
      const card = this.cards.get(raw.cardId)!;
      if (!this.isConnected(raw.targetPlayerId) || card.ownerId === playerId && raw.targetPlayerId === playerId) return { accepted: false, reason: "invalid" };
      seenCards.add(raw.cardId);
      guesses.push({ cardId: raw.cardId, targetPlayerId: raw.targetPlayerId });
    }
    this.matches.set(playerId, guesses);
    return { accepted: true };
  }

  override removePlayer(playerId: string): void { super.removePlayer(playerId); this.words.delete(playerId); this.matches.delete(playerId); }

  getPublicState(_now: number): KendimPublicState {
    return {
      gameId: this.gameId,
      kind: this.gameId,
      subPhase: this.subPhase,
      phaseEndsAt: this.phaseEndsAt,
      finished: this.finished,
      cards: this.subPhase === "write" ? null : [...this.cards.values()].map((card) => ({ cardId: card.cardId, word: card.word, ownerId: this.finished ? card.ownerId : null })),
      matchResults: this.finished ? this.matchResults : null,
      ownerBonusPlayerIds: this.finished ? this.ownerBonusPlayerIds : null,
      resultPoints: this.finished ? pointsView(this.miniScores) : null
    };
  }

  getOwnState(playerId: string, _now: number): KendimOwnState {
    const ownCard = [...this.cards.values()].find((card) => card.ownerId === playerId);
    return { gameId: this.gameId, kind: this.gameId, ownCardId: ownCard?.cardId ?? null, ownWord: this.words.get(playerId) ?? null, hasWritten: this.words.has(playerId), hasSubmittedMatches: this.matches.has(playerId), finished: this.finished };
  }
}

class SozlukBlofuAdapter extends Stage8AdapterBase {
  readonly gameId = "sozluk-blofu" as const;
  private readonly random: Stage8RandomSource;
  private readonly entry: { readonly word: string; readonly definition: string };
  private readonly bluffs = new Map<string, string>();
  private readonly choices = new Map<string, string>();
  private readonly definitions = new Map<string, { readonly text: string; readonly ownerId: string | null; readonly isReal: boolean }>();
  private readonly definitionOrder: string[] = [];
  private subPhase: SozlukBlofuSubPhase = "write";
  private phaseEndsAt: number | null = null;
  private results: SozlukDefinitionView[] | null = null;

  constructor(playerIds: readonly string[], random: Stage8RandomSource) { super(playerIds); this.random = random; this.entry = randomFrom(DICTIONARY_POOL, random); }

  override start(now: number): void { super.start(now); if (this.phaseEndsAt === null) this.phaseEndsAt = now + BLUFF_FIFTY_SECONDS; }

  private createDefinitions(): void {
    const definitions = [
      { text: this.entry.definition, ownerId: null as string | null, isReal: true },
      ...this.playerIds
        .filter((playerId) => this.bluffs.has(playerId))
        .map((playerId) => ({ text: this.bluffs.get(playerId)!, ownerId: playerId, isReal: false }))
    ];
    shuffled(definitions, this.random).forEach((definition, index) => {
      const id = `definition-${index + 1}`;
      this.definitions.set(id, definition);
      this.definitionOrder.push(id);
    });
  }

  private resolve(): void {
    if (this.finished) return;
    for (const playerId of this.choices.keys()) {
      const chosenId = this.choices.get(playerId)!;
      const definition = this.definitions.get(chosenId);
      if (!definition) continue;
      if (definition.isReal) this.addDirect(playerId, 1, "sozluk-blofu:gercek-tanim");
      else if (definition.ownerId !== null && this.playerIds.includes(definition.ownerId)) this.addDirect(definition.ownerId, 1, "sozluk-blofu:blof-secildi");
    }
    this.results = this.definitionOrder.map((id) => {
      const definition = this.definitions.get(id)!;
      return { id, text: definition.text, ownerId: definition.ownerId, isReal: definition.isReal, selectedByPlayerIds: [...this.choices.entries()].filter(([, choice]) => choice === id).map(([playerId]) => playerId) };
    });
    this.subPhase = "results";
    this.phaseEndsAt = null;
    this.finish();
  }

  advance(now: number): boolean {
    assertNow(now);
    if (!this.isStarted || this.finished || this.phaseEndsAt === null || now < this.phaseEndsAt) return false;
    const scheduled = this.phaseEndsAt;
    if (this.subPhase === "write") { this.createDefinitions(); this.subPhase = "choose"; this.phaseEndsAt = scheduled + CHOOSE_THIRTY_SECONDS; return true; }
    if (this.subPhase === "choose") { this.resolve(); return true; }
    return false;
  }

  submit(playerId: string, payload: JsonValue | null, now: number): Stage8SubmitResult {
    assertNow(now);
    if (!this.playerIds.includes(playerId)) return { accepted: false, reason: "invalid" };
    if (!this.isStarted || this.finished) return { accepted: false, reason: "phase-locked" };
    if (this.phaseEndsAt !== null && now >= this.phaseEndsAt) { this.advance(now); return { accepted: false, reason: "late" }; }
    if (this.subPhase === "write") {
      if (inputKind(payload) !== "dictionary-bluff") return { accepted: false, reason: "invalid" };
      const value = inputString(payload, "text");
      if (value === null || normalizeText(value).length === 0 || value.trim().length > 100) return { accepted: false, reason: "invalid" };
      this.bluffs.set(playerId, cleanFreeText(value).slice(0, 100));
      return { accepted: true };
    }
    if (this.subPhase !== "choose" || this.choices.has(playerId)) return { accepted: false, reason: this.choices.has(playerId) ? "duplicate" : "phase-locked" };
    if (inputKind(payload) !== "dictionary-choice") return { accepted: false, reason: "invalid" };
    const definitionId = inputString(payload, "definitionId");
    const definition = definitionId === null ? null : this.definitions.get(definitionId);
    if (definitionId === null || !definition || definition.ownerId === playerId || definition.ownerId !== null && !this.isConnected(definition.ownerId)) return { accepted: false, reason: "invalid" };
    this.choices.set(playerId, definitionId);
    return { accepted: true };
  }

  override removePlayer(playerId: string): void { super.removePlayer(playerId); this.bluffs.delete(playerId); this.choices.delete(playerId); }

  getPublicState(_now: number): SozlukBlofuPublicState {
    const definitions = this.subPhase === "write" ? null : this.definitionOrder.map((id) => {
      const definition = this.definitions.get(id)!;
      const result = this.finished ? this.results?.find((entry) => entry.id === id) : null;
      return { id, text: definition.text, ownerId: this.finished ? definition.ownerId : null, isReal: this.finished ? definition.isReal : null, selectedByPlayerIds: result?.selectedByPlayerIds ?? [] };
    });
    return { gameId: this.gameId, kind: this.gameId, subPhase: this.subPhase, phaseEndsAt: this.phaseEndsAt, finished: this.finished, word: this.entry.word, definitions, resultPoints: this.finished ? pointsView(this.miniScores) : null };
  }

  getOwnState(playerId: string, _now: number): SozlukBlofuOwnState { return { gameId: this.gameId, kind: this.gameId, hasWritten: this.bluffs.has(playerId), bluffText: this.bluffs.get(playerId) ?? null, hasChosen: this.choices.has(playerId), finished: this.finished }; }
}

class CagrisimAgiAdapter extends Stage8AdapterBase {
  readonly gameId = "cagrisim-agi" as const;
  private readonly random: Stage8RandomSource;
  private readonly mainWord: string;
  private readonly answers = new Map<string, string>();
  private phaseEndsAt: number | null = null;
  private groups: CagrisimGroupView[] | null = null;
  private subPhase: CagrisimSubPhase = "answer";

  constructor(playerIds: readonly string[], random: Stage8RandomSource) { super(playerIds); this.random = random; this.mainWord = randomFrom(ASSOCIATION_POOL, random); }
  override start(now: number): void { super.start(now); if (this.phaseEndsAt === null) this.phaseEndsAt = now + ONE_PHASE_THIRTY_SECONDS; }

  private resolve(): void {
    if (this.finished) return;
    const byAnswer = new Map<string, string[]>();
    this.answers.forEach((answer, playerId) => byAnswer.set(answer, [...(byAnswer.get(answer) ?? []), playerId]));
    this.groups = [...byAnswer.entries()].map(([answer, playerIds]) => { const points = playerIds.length >= 2 ? playerIds.length : 0; playerIds.forEach((playerId) => { if (points > 0) this.addDirect(playerId, points, "cagrisim-agi:grup"); }); return { answer, playerIds, points }; });
    this.subPhase = "results";
    this.phaseEndsAt = null;
    this.finish();
  }

  advance(now: number): boolean { assertNow(now); if (!this.isStarted || this.finished || this.phaseEndsAt === null || now < this.phaseEndsAt) return false; this.resolve(); return true; }

  submit(playerId: string, payload: JsonValue | null, now: number): Stage8SubmitResult {
    assertNow(now);
    if (!this.playerIds.includes(playerId)) return { accepted: false, reason: "invalid" };
    if (!this.isStarted || this.finished) return { accepted: false, reason: "phase-locked" };
    if (this.phaseEndsAt !== null && now >= this.phaseEndsAt) { this.advance(now); return { accepted: false, reason: "late" }; }
    if (this.answers.has(playerId)) return { accepted: false, reason: "duplicate" };
    if (inputKind(payload) !== "association") return { accepted: false, reason: "invalid" };
    const answer = inputString(payload, "answer");
    if (answer === null || normalizeText(answer).length === 0) return { accepted: false, reason: "invalid" };
    this.answers.set(playerId, normalizeText(answer));
    return { accepted: true };
  }

  override removePlayer(playerId: string): void { super.removePlayer(playerId); this.answers.delete(playerId); }

  getPublicState(_now: number): CagrisimAgiPublicState { return { gameId: this.gameId, kind: this.gameId, subPhase: this.subPhase, phaseEndsAt: this.phaseEndsAt, finished: this.finished, mainWord: this.mainWord, groups: this.groups, resultPoints: this.finished ? pointsView(this.miniScores) : null }; }
  getOwnState(playerId: string, _now: number): CagrisimAgiOwnState { return { gameId: this.gameId, kind: this.gameId, hasSubmitted: this.answers.has(playerId), answer: this.answers.get(playerId) ?? null, finished: this.finished }; }
}

class RusvetDarbeAdapter extends Stage8AdapterBase {
  readonly gameId = "rusvet-darbe" as const;
  private readonly random: Stage8RandomSource;
  private readonly votes = new Map<string, string>();
  private readonly rpsChoices = new Map<string, RpsChoice>();
  private readonly allocations = new Map<string, number>();
  private distributionSubmitted = false;
  private subPhase: RusvetSubPhase = "election";
  private phaseEndsAt: number | null = null;
  private presidentId: string | null = null;
  private presidentVoteCount = 0;
  private rpsCandidates: string[] = [];
  private rpsRound = 1;
  private voteResults: { readonly playerId: string; readonly votes: number }[] | null = null;
  private allocationResults: RusvetAllocationView[] | null = null;

  constructor(playerIds: readonly string[], random: Stage8RandomSource) { super(playerIds); this.random = random; }
  override start(now: number): void { super.start(now); if (this.phaseEndsAt === null) this.phaseEndsAt = now + ELECTION_TWENTY_SECONDS; }

  private randomOpponent(playerId: string): string | null { return randomFrom(allOtherPlayers(this.livePlayerIds(), playerId), this.random) ?? null; }

  private beginDistribution(now: number): void {
    this.subPhase = "distribution";
    this.phaseEndsAt = now + DISTRIBUTION_TWENTY_FIVE_SECONDS;
  }

  private resolveElection(now: number): void {
    for (const [voterId, targetId] of this.votes) {
      if (!this.isConnected(voterId) || !this.isConnected(targetId) || !this.playerIds.includes(voterId) || !this.playerIds.includes(targetId) || voterId === targetId) {
        this.votes.delete(voterId);
      }
    }
    for (const playerId of this.livePlayerIds()) if (!this.votes.has(playerId)) { const target = this.randomOpponent(playerId); if (target) this.votes.set(playerId, target); }
    const counts = voteCounts(this.playerIds, this.votes);
    const top = Math.max(...counts.map((entry) => entry.votes), 0);
    const liveIds = new Set(this.livePlayerIds());
    this.rpsCandidates = counts.filter((entry) => entry.votes === top && liveIds.has(entry.playerId)).map((entry) => entry.playerId);
    this.voteResults = counts;
    if (this.rpsCandidates.length === 1) {
      this.presidentId = this.rpsCandidates[0]!;
      this.presidentVoteCount = top;
      this.beginDistribution(now);
    } else {
      this.subPhase = "rps";
      this.rpsRound = 1;
      this.rpsChoices.clear();
      this.phaseEndsAt = now + ELECTION_TWENTY_SECONDS;
    }
  }

  private evaluateRps(now: number): void {
    this.rpsCandidates = this.rpsCandidates.filter((playerId) => this.isConnected(playerId) && this.playerIds.includes(playerId));
    for (const playerId of this.rpsChoices.keys()) {
      if (!this.rpsCandidates.includes(playerId)) this.rpsChoices.delete(playerId);
    }
    if (this.rpsCandidates.length === 0) {
      this.presidentId = null;
      this.presidentVoteCount = 0;
      this.beginDistribution(now);
      return;
    }
    if (this.rpsCandidates.length === 1) {
      this.presidentId = this.rpsCandidates[0]!;
      this.presidentVoteCount = this.voteResults?.find((entry) => entry.playerId === this.presidentId)?.votes ?? 0;
      this.beginDistribution(now);
      return;
    }
    const choices = new Map(this.rpsChoices);
    if (choices.size < this.rpsCandidates.length && this.phaseEndsAt !== null && now < this.phaseEndsAt) return;
    for (const playerId of this.rpsCandidates) if (!choices.has(playerId)) choices.set(playerId, randomFrom(["rock", "paper", "scissors"] as const, this.random));
    const signs = [...new Set(choices.values())];
    if (signs.length === 1 || signs.length === 3) {
      this.rpsRound += 1;
      this.rpsChoices.clear();
      this.phaseEndsAt = now + ELECTION_TWENTY_SECONDS;
      return;
    }
    const winningSign = signs.find((sign) => signs.some((other) => sign !== other && rpsBeats(sign, other)));
    const winners = winningSign ? this.rpsCandidates.filter((playerId) => choices.get(playerId) === winningSign) : [];
    if (winners.length === 1) {
      this.presidentId = winners[0]!;
      this.presidentVoteCount = this.voteResults?.find((entry) => entry.playerId === this.presidentId)?.votes ?? 0;
      this.beginDistribution(now);
      return;
    }
    this.rpsCandidates = winners.length > 0 ? winners : this.rpsCandidates;
    this.rpsRound += 1;
    this.rpsChoices.clear();
    this.phaseEndsAt = now + ELECTION_TWENTY_SECONDS;
  }

  private fillRandomAllocations(): void {
    if (!this.presidentId) return;
    for (const [targetId] of this.allocations) {
      if (!this.isConnected(targetId) || !this.playerIds.includes(targetId) || targetId === this.presidentId) this.allocations.delete(targetId);
    }
    const allocated = [...this.allocations.values()].reduce((sum, points) => sum + points, 0);
    let remaining = Math.max(0, this.presidentVoteCount - allocated);
    const targets = shuffled(allOtherPlayers(this.livePlayerIds(), this.presidentId), this.random);
    while (remaining > 0 && targets.length > 0) {
      const available = targets.filter((target) => (this.allocations.get(target) ?? 0) < 2);
      if (available.length === 0) break;
      const target = randomFrom(available, this.random);
      this.allocations.set(target, (this.allocations.get(target) ?? 0) + 1);
      remaining -= 1;
    }
  }

  private resolveDistribution(): void {
    if (this.finished) return;
    if (this.presidentId !== null && !this.isConnected(this.presidentId)) {
      this.presidentId = null;
      this.presidentVoteCount = 0;
      this.allocations.clear();
    }
    this.fillRandomAllocations();
    if (this.presidentId) this.addDirect(this.presidentId, 1, "rusvet-darbe:baskan");
    this.allocations.forEach((points, playerId) => this.addDirect(playerId, points, "rusvet-darbe:rüsvet"));
    this.allocationResults = mapToAllocations(this.allocations);
    this.subPhase = "results";
    this.phaseEndsAt = null;
    this.finish();
  }

  advance(now: number): boolean {
    assertNow(now);
    if (!this.isStarted || this.finished || this.phaseEndsAt === null || now < this.phaseEndsAt) return false;
    if (this.subPhase === "election") { this.resolveElection(now); return true; }
    if (this.subPhase === "rps") { this.evaluateRps(now); return true; }
    if (this.subPhase === "distribution") { this.resolveDistribution(); return true; }
    return false;
  }

  submit(playerId: string, payload: JsonValue | null, now: number): Stage8SubmitResult {
    assertNow(now);
    if (!this.playerIds.includes(playerId) || !this.isConnected(playerId)) return { accepted: false, reason: "invalid" };
    if (!this.isStarted || this.finished) return { accepted: false, reason: "phase-locked" };
    if (this.phaseEndsAt !== null && now >= this.phaseEndsAt) { this.advance(now); if (this.finished || this.subPhase !== "distribution" && this.subPhase !== "rps") return { accepted: false, reason: "late" }; }
    if (this.subPhase === "election") {
      if (this.votes.has(playerId) || inputKind(payload) !== "president-vote") return { accepted: false, reason: this.votes.has(playerId) ? "duplicate" : "invalid" };
      const target = inputString(payload, "targetPlayerId");
      if (target === null || target === playerId || !this.playerIds.includes(target) || !this.isConnected(target)) return { accepted: false, reason: "invalid" };
      this.votes.set(playerId, target);
      return { accepted: true };
    }
    if (this.subPhase === "rps") {
      if (!this.rpsCandidates.includes(playerId) || this.rpsChoices.has(playerId) || inputKind(payload) !== "rps-choice") return { accepted: false, reason: this.rpsChoices.has(playerId) ? "duplicate" : "invalid" };
      const choice = inputString(payload, "choice");
      if (choice !== "rock" && choice !== "paper" && choice !== "scissors") return { accepted: false, reason: "invalid" };
      this.rpsChoices.set(playerId, choice);
      if (this.rpsChoices.size === this.rpsCandidates.length) this.evaluateRps(now);
      return { accepted: true };
    }
    if (this.subPhase !== "distribution" || playerId !== this.presidentId) return { accepted: false, reason: "phase-locked" };
    if (this.distributionSubmitted || inputKind(payload) !== "president-distribution") return { accepted: false, reason: this.distributionSubmitted ? "duplicate" : "invalid" };
    const rawAllocations = inputArray(payload, "allocations");
    if (!rawAllocations) return { accepted: false, reason: "invalid" };
    let total = 0;
    const next = new Map<string, number>();
    for (const raw of rawAllocations) {
      if (!isJsonObject(raw) || typeof raw.targetPlayerId !== "string") return { accepted: false, reason: "invalid" };
      const points = inputInteger(raw.points ?? null);
      if (points === null || points < 1 || points > 2 || raw.targetPlayerId === playerId || !this.playerIds.includes(raw.targetPlayerId) || !this.isConnected(raw.targetPlayerId) || next.has(raw.targetPlayerId)) return { accepted: false, reason: "invalid" };
      total += points;
      next.set(raw.targetPlayerId, points);
    }
    if (total > this.presidentVoteCount) return { accepted: false, reason: "invalid" };
    next.forEach((points, target) => this.allocations.set(target, points));
    this.distributionSubmitted = true;
    return { accepted: true };
  }

  override removePlayer(playerId: string): void {
    super.removePlayer(playerId);
    this.votes.delete(playerId);
    for (const [voterId, targetId] of this.votes) if (targetId === playerId) this.votes.delete(voterId);
    this.rpsChoices.delete(playerId);
    this.allocations.delete(playerId);
    this.rpsCandidates = this.rpsCandidates.filter((candidate) => candidate !== playerId);
    if (this.presidentId === playerId) {
      this.presidentId = null;
      this.presidentVoteCount = 0;
      this.allocations.clear();
    }
  }

  getPublicState(_now: number): RusvetDarbePublicState { return { gameId: this.gameId, kind: this.gameId, subPhase: this.subPhase, phaseEndsAt: this.phaseEndsAt, finished: this.finished, presidentId: this.presidentId, presidentVoteCount: this.finished ? this.presidentVoteCount : null, rpsCandidateIds: [...this.rpsCandidates], rpsRound: this.rpsRound, voteCounts: this.finished ? this.voteResults : null, allocations: this.finished ? this.allocationResults : null, resultPoints: this.finished ? pointsView(this.miniScores) : null }; }
  getOwnState(playerId: string, _now: number): RusvetDarbeOwnState { return { gameId: this.gameId, kind: this.gameId, hasVoted: this.votes.has(playerId), isPresident: this.presidentId === playerId, canChooseRps: this.subPhase === "rps" && this.rpsCandidates.includes(playerId), hasChosenRps: this.rpsChoices.has(playerId), rpsCandidateIds: [...this.rpsCandidates], remainingDistributionPoints: this.presidentId === playerId ? Math.max(0, this.presidentVoteCount - [...this.allocations.values()].reduce((sum, points) => sum + points, 0)) : 0, submittedAllocations: this.presidentId === playerId ? mapToAllocations(this.allocations) : [], hasSubmittedDistribution: this.distributionSubmitted, finished: this.finished }; }
}

class KaralamaDefteriAdapter extends Stage8AdapterBase {
  readonly gameId = "karalama-defteri" as const;
  private readonly random: Stage8RandomSource;
  private readonly outsiderId: string;
  private readonly commonWord: string;
  private readonly outsiderWord: string;
  private readonly drawings = new Map<string, DrawingStroke[]>();
  private readonly votes = new Map<string, string>();
  private subPhase: KaralamaSubPhase = "draw";
  private phaseEndsAt: number | null = null;
  private caught: boolean | null = null;

  constructor(playerIds: readonly string[], random: Stage8RandomSource) { super(playerIds); this.random = random; this.outsiderId = randomFrom(this.playerIds, random); const words = randomFrom(DRAWING_POOL, random); this.commonWord = words.word; this.outsiderWord = words.nearby; }
  override start(now: number): void { super.start(now); if (this.phaseEndsAt === null) this.phaseEndsAt = now + DRAW_SEVENTY_FIVE_SECONDS; }

  private resolve(): void {
    if (this.finished) return;
    const countByTarget = new Map<string, number>();
    this.votes.forEach((target) => countByTarget.set(target, (countByTarget.get(target) ?? 0) + 1));
    const top = Math.max(...countByTarget.values(), 0);
    const leaders = [...countByTarget.entries()].filter(([, count]) => count === top && top > 0).map(([playerId]) => playerId);
    this.caught = leaders.length === 1 && leaders[0] === this.outsiderId;
    if (this.caught) this.playerIds.filter((playerId) => playerId !== this.outsiderId).forEach((playerId) => this.addDirect(playerId, 1, "karalama-defteri:bilgisiz-bulundu"));
    else this.addDirect(this.outsiderId, 1, "karalama-defteri:bilgisiz-kurtuldu");
    this.subPhase = "results";
    this.phaseEndsAt = null;
    this.finish();
  }

  advance(now: number): boolean {
    assertNow(now);
    if (!this.isStarted || this.finished || this.phaseEndsAt === null || now < this.phaseEndsAt) return false;
    const scheduled = this.phaseEndsAt;
    if (this.subPhase === "draw") { this.subPhase = "vote"; this.phaseEndsAt = scheduled + VOTE_TWENTY_SECONDS; return true; }
    if (this.subPhase === "vote") { this.resolve(); return true; }
    return false;
  }

  submit(playerId: string, payload: JsonValue | null, now: number): Stage8SubmitResult {
    assertNow(now);
    if (!this.playerIds.includes(playerId)) return { accepted: false, reason: "invalid" };
    if (!this.isStarted || this.finished) return { accepted: false, reason: "phase-locked" };
    if (this.phaseEndsAt !== null && now >= this.phaseEndsAt) { this.advance(now); return { accepted: false, reason: "late" }; }
    if (this.subPhase === "draw") {
      if (inputKind(payload) !== "drawing-save") return { accepted: false, reason: "invalid" };
      const strokes = parseDrawingStrokes(payload);
      if (strokes === null) return { accepted: false, reason: "invalid" };
      this.drawings.set(playerId, strokes);
      return { accepted: true };
    }
    if (this.subPhase !== "vote" || this.votes.has(playerId)) return { accepted: false, reason: this.votes.has(playerId) ? "duplicate" : "phase-locked" };
    if (inputKind(payload) !== "drawing-vote") return { accepted: false, reason: "invalid" };
    const target = inputString(payload, "targetPlayerId");
    if (target === null || target === playerId || !this.playerIds.includes(target) || !this.isConnected(target)) return { accepted: false, reason: "invalid" };
    this.votes.set(playerId, target);
    return { accepted: true };
  }

  override removePlayer(playerId: string): void { super.removePlayer(playerId); this.drawings.delete(playerId); this.votes.delete(playerId); }

  getPublicState(_now: number): KaralamaDefteriPublicState {
    return { gameId: this.gameId, kind: this.gameId, subPhase: this.subPhase, phaseEndsAt: this.phaseEndsAt, finished: this.finished, drawings: this.subPhase === "draw" ? null : this.playerIds.map((playerId) => ({ playerId, strokes: this.drawings.get(playerId) ?? [] })), voteCounts: this.finished ? this.playerIds.map((playerId) => ({ playerId, votes: [...this.votes.values()].filter((target) => target === playerId).length })) : null, outsiderPlayerId: this.finished ? this.outsiderId : null, commonWord: this.finished ? this.commonWord : null, outsiderWord: this.finished ? this.outsiderWord : null, outsiderCaught: this.finished ? this.caught : null, resultPoints: this.finished ? pointsView(this.miniScores) : null };
  }

  getOwnState(playerId: string, _now: number): KaralamaDefteriOwnState { const ignorant = this.outsiderId === playerId; return { gameId: this.gameId, kind: this.gameId, role: ignorant ? "ignorant" : "informed", assignedWord: ignorant ? this.outsiderWord : this.commonWord, hasDrawing: this.drawings.has(playerId), hasVoted: this.votes.has(playerId), finished: this.finished }; }
}

class IttifakAdapter extends Stage8AdapterBase {
  readonly gameId = "ittifak" as const;
  private readonly random: Stage8RandomSource;
  private readonly votes = new Map<string, string>();
  private subPhase: IttifakSubPhase = "bargain";
  private phaseEndsAt: number | null = null;
  private results: { readonly playerId: string; readonly votes: number }[] | null = null;

  constructor(playerIds: readonly string[], random: Stage8RandomSource) { super(playerIds); this.random = random; }
  override start(now: number): void { super.start(now); if (this.phaseEndsAt === null) this.phaseEndsAt = now + BARGAIN_SIXTY_SECONDS; }

  private resolve(): void {
    for (const playerId of this.livePlayerIds()) if (!this.votes.has(playerId)) { const target = randomFrom(allOtherPlayers(this.livePlayerIds(), playerId), this.random); if (target) this.votes.set(playerId, target); }
    this.results = voteCounts(this.playerIds, this.votes);
    this.results.forEach((entry) => { if (entry.votes > 0) this.addDirect(entry.playerId, entry.votes, "ittifak:oy"); });
    this.subPhase = "results";
    this.phaseEndsAt = null;
    this.finish();
  }

  advance(now: number): boolean { assertNow(now); if (!this.isStarted || this.finished || this.phaseEndsAt === null || now < this.phaseEndsAt) return false; const scheduled = this.phaseEndsAt; if (this.subPhase === "bargain") { this.subPhase = "vote"; this.phaseEndsAt = scheduled + VOTE_FIFTEEN_SECONDS; return true; } if (this.subPhase === "vote") { this.resolve(); return true; } return false; }

  submit(playerId: string, payload: JsonValue | null, now: number): Stage8SubmitResult {
    assertNow(now);
    if (!this.playerIds.includes(playerId)) return { accepted: false, reason: "invalid" };
    if (!this.isStarted || this.finished) return { accepted: false, reason: "phase-locked" };
    if (this.phaseEndsAt !== null && now >= this.phaseEndsAt) { this.advance(now); return { accepted: false, reason: "late" }; }
    if (this.subPhase !== "vote" || this.votes.has(playerId)) return { accepted: false, reason: this.votes.has(playerId) ? "duplicate" : "phase-locked" };
    if (inputKind(payload) !== "alliance-vote") return { accepted: false, reason: "invalid" };
    const target = inputString(payload, "targetPlayerId");
    if (target === null || target === playerId || !this.playerIds.includes(target) || !this.isConnected(target)) return { accepted: false, reason: "invalid" };
    this.votes.set(playerId, target);
    return { accepted: true };
  }

  override removePlayer(playerId: string): void { super.removePlayer(playerId); this.votes.delete(playerId); }
  getPublicState(_now: number): IttifakPublicState { return { gameId: this.gameId, kind: this.gameId, subPhase: this.subPhase, phaseEndsAt: this.phaseEndsAt, finished: this.finished, voteCounts: this.finished ? this.results : null, resultPoints: this.finished ? pointsView(this.miniScores) : null }; }
  getOwnState(playerId: string, _now: number): IttifakOwnState { return { gameId: this.gameId, kind: this.gameId, hasVoted: this.votes.has(playerId), finished: this.finished }; }
}

class KontrolPaneliAdapter extends Stage8AdapterBase {
  readonly gameId = "kontrol-paneli-kaosu" as const;
  private readonly random: Stage8RandomSource;
  private readonly panels = new Map<string, PanelColor[]>();
  private readonly clueHolderByTarget = new Map<string, string>();
  private readonly clueTexts = new Map<string, string>();
  private readonly cuts = new Map<string, PanelColor>();
  private readonly correctColors = new Map<string, PanelColor>();
  private phaseEndsAt: number | null = null;
  private results: PanelResultView[] | null = null;

  constructor(playerIds: readonly string[], random: Stage8RandomSource) {
    super(playerIds);
    this.random = random;
    const panelPermutations = shuffled(permutations(PANEL_COLORS), random);
    this.playerIds.forEach((playerId, index) => this.panels.set(playerId, [...panelPermutations[index % panelPermutations.length]!].map((color) => color)));
    const cycle = shuffled(this.playerIds, random);
    cycle.forEach((holder, index) => {
      const target = cycle[(index + 1) % cycle.length]!;
      this.clueHolderByTarget.set(target, holder);
      const panel = this.panels.get(target)!;
      const firstPosition = index % 2;
      const secondPosition = (firstPosition + 2) % 4;
      const correctColor = panel[(firstPosition + 1) % 4]!;
      this.correctColors.set(target, correctColor);
      this.clueTexts.set(holder, `${firstPosition + 1}. sırada ${panel[firstPosition]} ve ${secondPosition + 1}. sırada ${panel[secondPosition]} varsa ${panelColorLabel(correctColor)} kablosunu kes.`);
    });
  }

  override start(now: number): void { super.start(now); if (this.phaseEndsAt === null) this.phaseEndsAt = now + PANEL_SIXTY_SECONDS; }

  private resolve(): void {
    if (this.finished) return;
    this.results = this.playerIds.map((playerId) => {
      const cutColor = this.cuts.get(playerId) ?? null;
      const correctColor = this.correctColors.get(playerId)!;
      const correct = cutColor === correctColor;
      let points = 0;
      if (correct) {
        this.addDirect(playerId, 1, "kontrol-paneli-kaosu:dogru-kablo");
        const clueHolder = this.clueHolderByTarget.get(playerId);
        if (clueHolder && this.playerIds.includes(clueHolder)) this.addDirect(clueHolder, 1, "kontrol-paneli-kaosu:ipucu-bonusu");
        points = 1;
      }
      return { playerId, panelColors: this.panels.get(playerId) ?? [], clueHolderId: this.clueHolderByTarget.get(playerId) ?? "", cutColor, correctColor, correct, points };
    });
    this.phaseEndsAt = null;
    this.finish();
  }

  advance(now: number): boolean { assertNow(now); if (!this.isStarted || this.finished || this.phaseEndsAt === null || now < this.phaseEndsAt) return false; this.resolve(); return true; }
  submit(playerId: string, payload: JsonValue | null, now: number): Stage8SubmitResult {
    assertNow(now);
    if (!this.playerIds.includes(playerId)) return { accepted: false, reason: "invalid" };
    if (!this.isStarted || this.finished) return { accepted: false, reason: "phase-locked" };
    if (this.phaseEndsAt !== null && now >= this.phaseEndsAt) { this.advance(now); return { accepted: false, reason: "late" }; }
    if (this.cuts.has(playerId)) return { accepted: false, reason: "duplicate" };
    if (inputKind(payload) !== "panel-cut") return { accepted: false, reason: "invalid" };
    const color = inputString(payload, "color");
    if (color === null || !PANEL_COLORS.includes(color as PanelColor)) return { accepted: false, reason: "invalid" };
    this.cuts.set(playerId, color as PanelColor);
    return { accepted: true };
  }

  override removePlayer(playerId: string): void {
    super.removePlayer(playerId);
    this.panels.delete(playerId);
    for (const [targetId, holderId] of this.clueHolderByTarget) {
      if (targetId === playerId || holderId === playerId) {
        this.clueHolderByTarget.delete(targetId);
        this.clueTexts.delete(holderId);
      }
    }
    this.clueTexts.delete(playerId);
    this.cuts.delete(playerId);
    this.correctColors.delete(playerId);
  }
  getPublicState(_now: number): KontrolPaneliPublicState { return { gameId: this.gameId, kind: this.gameId, phaseEndsAt: this.phaseEndsAt, finished: this.finished, results: this.results, resultPoints: this.finished ? pointsView(this.miniScores) : null }; }
  getOwnState(playerId: string, _now: number): KontrolPaneliOwnState { return { gameId: this.gameId, kind: this.gameId, panelColors: this.panels.get(playerId) ?? [], clueText: this.clueTexts.get(playerId) ?? "", hasCut: this.cuts.has(playerId), finished: this.finished }; }
}

class ZehirliKadehAdapter extends Stage8AdapterBase {
  readonly gameId = "zehirli-kadeh" as const;
  private readonly random: Stage8RandomSource;
  private readonly poisoned = new Set<string>();
  private readonly traded = new Set<string>();
  private readonly trades: ZehirliKadehTradeView[] = [];
  private phaseEndsAt: number | null = null;

  constructor(playerIds: readonly string[], random: Stage8RandomSource) { super(playerIds); this.random = random; }

  override start(now: number): void {
    super.start(now);
    if (this.phaseEndsAt !== null) return;
    const count = this.playerIds.length <= 3 ? 1 : this.playerIds.length <= 5 ? 2 : 3;
    shuffled(this.playerIds, this.random).slice(0, count).forEach((playerId) => this.poisoned.add(playerId));
    this.phaseEndsAt = now + GLASS_TWENTY_SECONDS;
  }

  private resolve(): void {
    if (this.finished) return;
    this.playerIds.forEach((playerId) => { if (!this.poisoned.has(playerId)) this.addDirect(playerId, 1, "zehirli-kadeh:temiz"); });
    this.phaseEndsAt = null;
    this.finish();
  }

  advance(now: number): boolean { assertNow(now); if (!this.isStarted || this.finished || this.phaseEndsAt === null || now < this.phaseEndsAt) return false; this.resolve(); return true; }

  submit(playerId: string, payload: JsonValue | null, now: number): Stage8SubmitResult {
    assertNow(now);
    if (!this.playerIds.includes(playerId)) return { accepted: false, reason: "invalid" };
    if (!this.isStarted || this.finished) return { accepted: false, reason: "phase-locked" };
    if (this.phaseEndsAt !== null && now >= this.phaseEndsAt) { this.advance(now); return { accepted: false, reason: "late" }; }
    if (this.traded.has(playerId)) return { accepted: false, reason: "duplicate" };
    if (inputKind(payload) !== "glass-trade") return { accepted: false, reason: "invalid" };
    const target = inputString(payload, "targetPlayerId");
    if (target === null || target === playerId || !this.playerIds.includes(target) || !this.isConnected(target)) return { accepted: false, reason: "invalid" };
    const sourcePoisoned = this.poisoned.has(playerId);
    const targetPoisoned = this.poisoned.has(target);
    if (sourcePoisoned !== targetPoisoned) {
      if (sourcePoisoned) { this.poisoned.delete(playerId); this.poisoned.add(target); }
      else { this.poisoned.add(playerId); this.poisoned.delete(target); }
    }
    this.traded.add(playerId);
    this.trades.push({ fromPlayerId: playerId, toPlayerId: target });
    const phaseEndsAt = this.phaseEndsAt;
    if (phaseEndsAt === null) return { accepted: false, reason: "phase-locked" };
    this.phaseEndsAt = phaseEndsAt + GLASS_TRADE_EXTENSION;
    return { accepted: true };
  }

  override removePlayer(playerId: string): void { super.removePlayer(playerId); this.poisoned.delete(playerId); this.traded.delete(playerId); }
  getPublicState(_now: number): ZehirliKadehPublicState { return { gameId: this.gameId, kind: this.gameId, phaseEndsAt: this.phaseEndsAt, finished: this.finished, tradeCount: this.trades.length, poisonedPlayerIds: this.finished ? [...this.poisoned] : null, trades: this.finished ? [...this.trades] : null, resultPoints: this.finished ? pointsView(this.miniScores) : null }; }
  getOwnState(playerId: string, _now: number): ZehirliKadehOwnState { return { gameId: this.gameId, kind: this.gameId, poisoned: this.finished ? this.poisoned.has(playerId) : null, hasTraded: this.traded.has(playerId), canTrade: !this.finished && !this.traded.has(playerId), finished: this.finished }; }
}

export function isStage8Game(gameId: GameId): gameId is Stage8GameId {
  return STAGE8_GAME_IDS.includes(gameId as Stage8GameId);
}

export function createStage8GameAdapter(gameId: Stage8GameId, playerIds: readonly string[], random: Stage8RandomSource = DEFAULT_RANDOM): Stage8GameAdapter {
  switch (gameId) {
    case "yazi-yaz": return new YaziYazAdapter(playerIds, random);
    case "kendim": return new KendimAdapter(playerIds, random);
    case "sozluk-blofu": return new SozlukBlofuAdapter(playerIds, random);
    case "cagrisim-agi": return new CagrisimAgiAdapter(playerIds, random);
    case "rusvet-darbe": return new RusvetDarbeAdapter(playerIds, random);
    case "karalama-defteri": return new KaralamaDefteriAdapter(playerIds, random);
    case "ittifak": return new IttifakAdapter(playerIds, random);
    case "kontrol-paneli-kaosu": return new KontrolPaneliAdapter(playerIds, random);
    case "zehirli-kadeh": return new ZehirliKadehAdapter(playerIds, random);
  }
}
