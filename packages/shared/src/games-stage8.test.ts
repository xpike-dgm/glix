import assert from "node:assert/strict";
import test from "node:test";
import {
  createStage8GameAdapter,
  type DrawingStroke,
  type KendimPublicState,
  type KontrolPaneliPublicState,
  type Stage8GameAdapter,
  type YaziYazOwnState,
  type YaziYazPublicState,
  type ZehirliKadehPublicState
} from "./games-stage8.js";

function submit(adapter: Stage8GameAdapter, playerId: string, payload: Record<string, unknown>, now: number): void {
  assert.deepEqual(adapter.submit(playerId, payload as never, now), { accepted: true });
}

function score(adapter: Stage8GameAdapter, playerId: string): number {
  return adapter.getMiniGameScores().get(playerId) ?? 0;
}

test("Yazı Yaz iki yazanı gizli tutar ve doğru kişi/kelime tahminini ayrı puanlar", () => {
  const adapter = createStage8GameAdapter("yazi-yaz", ["a", "b", "c"], () => 0);
  adapter.start(0);
  const roles = ["a", "b", "c"].map((playerId) => [playerId, adapter.getOwnState(playerId, 1) as YaziYazOwnState] as const);
  assert.equal((adapter.getPublicState(1) as YaziYazPublicState).writerPlayerIds, null);
  roles.forEach(([playerId, own]) => submit(adapter, playerId, own.role === "writer" ? { kind: "yazi-word", word: playerId === "b" ? "MAVİ" : "KIRMIZI" } : { kind: "yazi-masum" }, 1_000));
  adapter.advance(30_000);
  adapter.advance(90_000);
  roles.forEach(([playerId, own]) => {
    const otherWriter = own.guessTargetPlayerIds[0]!;
    submit(adapter, playerId, { kind: "yazi-guess", targetWriterId: otherWriter, targetWord: otherWriter === "b" ? "MAVİ" : "KIRMIZI" }, 90_001);
  });
  adapter.advance(120_000);
  assert.equal(adapter.isFinished, true);
  assert.deepEqual([score(adapter, "a"), score(adapter, "b"), score(adapter, "c")], [2, 2, 2]);
});

test("Kendim doğru/yanlış eşleştirmeyi, tek doğru sahibin bonusunu ve lider bonusunu uygular", () => {
  const adapter = createStage8GameAdapter("kendim", ["a", "b", "c"], () => 0);
  adapter.start(0);
  submit(adapter, "a", { kind: "kendim-word", word: "ALFA" }, 1_000);
  submit(adapter, "b", { kind: "kendim-word", word: "BETA" }, 1_000);
  submit(adapter, "c", { kind: "kendim-word", word: "GAMA" }, 1_000);
  adapter.advance(30_000);
  const cards = (adapter.getPublicState(30_000) as KendimPublicState).cards!;
  const betaCard = cards.find((card) => card.word === "BETA")!;
  const gamaCard = cards.find((card) => card.word === "GAMA")!;
  submit(adapter, "a", { kind: "kendim-matches", matches: [{ cardId: betaCard.cardId, targetPlayerId: "b" }] }, 30_001);
  submit(adapter, "b", { kind: "kendim-matches", matches: [{ cardId: gamaCard.cardId, targetPlayerId: "a" }] }, 30_001);
  adapter.advance(60_000);
  assert.equal(score(adapter, "a"), 1);
  assert.equal(score(adapter, "b"), 0);
  assert.deepEqual((adapter.getPublicState(60_000) as KendimPublicState).ownerBonusPlayerIds, ["b"]);
  assert.equal(adapter.getScoreDeltas().some((delta) => delta.playerId === "a" && delta.reason === "kendim:lider"), true);
});

test("Sözlük Blöfü gerçek tanımı ve seçilen blöf sahibini doğrudan puanlar", () => {
  const adapter = createStage8GameAdapter("sozluk-blofu", ["a", "b", "c"], () => 0);
  adapter.start(0);
  ["a", "b", "c"].forEach((playerId) => submit(adapter, playerId, { kind: "dictionary-bluff", text: `${playerId} sahte tanım` }, 1_000));
  adapter.advance(50_000);
  submit(adapter, "a", { kind: "dictionary-choice", definitionId: "real" }, 50_001);
  submit(adapter, "b", { kind: "dictionary-choice", definitionId: "bluff-a" }, 50_001);
  submit(adapter, "c", { kind: "dictionary-choice", definitionId: "bluff-a" }, 50_001);
  adapter.advance(80_000);
  assert.equal(score(adapter, "a"), 3);
  assert.equal(adapter.isFinished, true);
});

test("Çağrışım Ağı normalleştirilmiş ortak cevabı grup büyüklüğü kadar puanlar", () => {
  const adapter = createStage8GameAdapter("cagrisim-agi", ["a", "b", "c"]);
  adapter.start(0);
  submit(adapter, "a", { kind: "association", answer: "  Ay  " }, 1_000);
  submit(adapter, "b", { kind: "association", answer: "AY" }, 1_000);
  submit(adapter, "c", { kind: "association", answer: "Gölge" }, 1_000);
  adapter.advance(30_000);
  assert.deepEqual([score(adapter, "a"), score(adapter, "b"), score(adapter, "c")], [2, 2, 0]);
});

test("Rüşvet ve Darbe başkanı seçer, başkan jetonlarını dağıtır ve eksik dağıtımı tamamlar", () => {
  const adapter = createStage8GameAdapter("rusvet-darbe", ["a", "b", "c"]);
  adapter.start(0);
  submit(adapter, "a", { kind: "president-vote", targetPlayerId: "b" }, 1_000);
  submit(adapter, "b", { kind: "president-vote", targetPlayerId: "a" }, 1_000);
  submit(adapter, "c", { kind: "president-vote", targetPlayerId: "a" }, 1_000);
  adapter.advance(20_000);
  submit(adapter, "a", { kind: "president-distribution", allocations: [{ targetPlayerId: "b", points: 2 }] }, 20_001);
  adapter.advance(45_001);
  assert.equal(score(adapter, "a"), 1);
  assert.equal(score(adapter, "b"), 2);
  assert.equal((adapter.getPublicState(45_001) as { presidentId: string | null }).presidentId, "a");
});

test("Karalama Defteri bilgisiz oyuncu benzersiz şekilde en çok oy alırsa bilenleri puanlar", () => {
  const adapter = createStage8GameAdapter("karalama-defteri", ["a", "b", "c"], () => 0);
  adapter.start(0);
  const stroke: DrawingStroke = { color: "cyan", size: 8, points: [{ x: 0.1, y: 0.1 }, { x: 0.8, y: 0.8 }] };
  ["a", "b", "c"].forEach((playerId) => submit(adapter, playerId, { kind: "drawing-save", strokes: [{ color: stroke.color, size: stroke.size, points: [...stroke.points] }] }, 1_000));
  adapter.advance(75_000);
  submit(adapter, "a", { kind: "drawing-vote", targetPlayerId: "b" }, 75_001);
  submit(adapter, "b", { kind: "drawing-vote", targetPlayerId: "a" }, 75_001);
  submit(adapter, "c", { kind: "drawing-vote", targetPlayerId: "a" }, 75_001);
  adapter.advance(95_000);
  assert.equal(score(adapter, "a"), 0);
  assert.equal(score(adapter, "b"), 1);
  assert.equal(score(adapter, "c"), 1);
});

test("İttifak pazarlık fazından gizli oylamaya geçer ve oyları hedefin genel skoruna yazar", () => {
  const adapter = createStage8GameAdapter("ittifak", ["a", "b", "c"]);
  adapter.start(0);
  adapter.advance(60_000);
  submit(adapter, "a", { kind: "alliance-vote", targetPlayerId: "b" }, 60_001);
  submit(adapter, "b", { kind: "alliance-vote", targetPlayerId: "c" }, 60_001);
  submit(adapter, "c", { kind: "alliance-vote", targetPlayerId: "b" }, 60_001);
  adapter.advance(75_000);
  assert.deepEqual([score(adapter, "a"), score(adapter, "b"), score(adapter, "c")], [0, 2, 1]);
});

test("Kontrol Paneli Kaosu oyun sırasında yalnızca özel paneli ve ipucunu verir", () => {
  const adapter = createStage8GameAdapter("kontrol-paneli-kaosu", ["a", "b", "c"], () => 0);
  adapter.start(0);
  const own = adapter.getOwnState("a", 1) as { panelColors: readonly string[]; clueText: string };
  const publicState = adapter.getPublicState(1) as KontrolPaneliPublicState;
  assert.equal(own.panelColors.length, 4);
  assert.equal(own.clueText.length > 0, true);
  assert.equal(publicState.results, null);
  submit(adapter, "a", { kind: "panel-cut", color: own.panelColors[0] }, 1_000);
  adapter.advance(60_000);
  assert.equal((adapter.getPublicState(60_000) as KontrolPaneliPublicState).results?.length, 3);
});

test("Zehirli Kadeh kendi zehrini gizler, takası anında uygular ve süreyi uzatır", () => {
  const adapter = createStage8GameAdapter("zehirli-kadeh", ["a", "b", "c"], () => 0);
  adapter.start(0);
  assert.equal((adapter.getOwnState("a", 1) as { poisoned: boolean | null }).poisoned, null);
  submit(adapter, "a", { kind: "glass-trade", targetPlayerId: "b" }, 1_000);
  assert.equal((adapter.getPublicState(1) as ZehirliKadehPublicState).phaseEndsAt, 25_000);
  adapter.advance(25_000);
  const publicState = adapter.getPublicState(25_000) as ZehirliKadehPublicState;
  assert.equal(publicState.poisonedPlayerIds?.includes("a"), true);
  assert.equal(score(adapter, "b"), 1);
  assert.equal(score(adapter, "c"), 1);
});
