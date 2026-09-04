import assert from "node:assert/strict";
import test from "node:test";
import {
  createStage8GameAdapter,
  type DrawingStroke,
  type KendimPublicState,
  type KontrolPaneliPublicState,
  type RusvetDarbePublicState,
  type SozlukBlofuPublicState,
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
  const writerIds = roles.filter(([, own]) => own.role === "writer").map(([playerId]) => playerId);
  assert.equal((adapter.getPublicState(1) as YaziYazPublicState).writerPlayerIds, null);
  roles.forEach(([playerId, own]) => assert.deepEqual(own.guessTargetPlayerIds, ["a", "b", "c"].filter((candidate) => candidate !== playerId)));
  roles.forEach(([playerId, own]) => submit(adapter, playerId, own.role === "writer" ? { kind: "yazi-word", word: playerId === "b" ? "MAVİ" : "KIRMIZI" } : { kind: "yazi-masum" }, 1_000));
  adapter.advance(30_000);
  adapter.advance(90_000);
  roles.forEach(([playerId, own]) => {
    const otherWriter = writerIds.find((candidate) => candidate !== playerId) ?? writerIds[0]!;
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

test("Kendim write fazında ikinci kelime gönderimini duplicate olarak reddeder ve ilk kelimeyi korur", () => {
  const adapter = createStage8GameAdapter("kendim", ["a", "b", "c"], () => 0);
  adapter.start(0);
  assert.deepEqual(adapter.submit("a", { kind: "kendim-word", word: "İLK KELİME" }, 1_000), { accepted: true });
  assert.deepEqual(adapter.submit("a", { kind: "kendim-word", word: "İKİNCİ KELİME" }, 2_000), { accepted: false, reason: "duplicate" });
  adapter.advance(30_000);
  const publicCards = (adapter.getPublicState(30_000) as KendimPublicState).cards!;
  const cardForA = publicCards.find((card) => card.word === "İLK KELİME");
  assert.ok(cardForA, "İlk kelime korunmalı");
  const wrongCardForA = publicCards.find((card) => card.word === "İKİNCİ KELİME");
  assert.equal(wrongCardForA, undefined, "İkinci kelime kaydedilmemeli");
});

test("Sözlük Blöfü gerçek tanımı ve seçilen blöf sahibini doğrudan puanlar", () => {
  const adapter = createStage8GameAdapter("sozluk-blofu", ["a", "b", "c"], () => 0);
  adapter.start(0);
  ["a", "b", "c"].forEach((playerId) => submit(adapter, playerId, { kind: "dictionary-bluff", text: `${playerId} sahte tanım` }, 1_000));
  adapter.advance(50_000);
  const chooseState = adapter.getPublicState(50_001) as SozlukBlofuPublicState;
  const definitions = chooseState.definitions!;
  definitions.forEach((definition) => {
    assert.doesNotMatch(definition.id, /^bluff-/);
    assert.notEqual(definition.id, "real");
    assert.equal(definition.ownerId, null);
    assert.equal(definition.isReal, null);
  });
  const aDefinition = definitions.find((definition) => definition.text === "a sahte tanım")!;
  const realDefinition = definitions.find((definition) => definition.text !== "a sahte tanım" && !definition.text.includes(" sahte tanım"))!;
  assert.deepEqual(adapter.submit("a", { kind: "dictionary-choice", definitionId: aDefinition.id }, 50_001), { accepted: false, reason: "invalid" });
  submit(adapter, "a", { kind: "dictionary-choice", definitionId: realDefinition.id }, 50_001);
  submit(adapter, "b", { kind: "dictionary-choice", definitionId: aDefinition.id }, 50_001);
  submit(adapter, "c", { kind: "dictionary-choice", definitionId: aDefinition.id }, 50_001);
  adapter.advance(80_000);
  assert.equal(score(adapter, "a"), 3);
  assert.equal((adapter.getPublicState(80_000) as SozlukBlofuPublicState).definitions?.find((definition) => definition.id === aDefinition.id)?.ownerId, "a");
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
  const allocations = (adapter.getPublicState(45_001) as RusvetDarbePublicState).allocations!;
  assert.equal(allocations.reduce((sum, allocation) => sum + allocation.points, 0), 2);
});

test("Rüşvet ve Darbe manuel dağıtım bütçesini ikinci kez doldurmaz", () => {
  const adapter = createStage8GameAdapter("rusvet-darbe", ["a", "b", "c"], () => 0);
  adapter.start(0);
  submit(adapter, "a", { kind: "president-vote", targetPlayerId: "b" }, 1_000);
  submit(adapter, "b", { kind: "president-vote", targetPlayerId: "a" }, 1_000);
  submit(adapter, "c", { kind: "president-vote", targetPlayerId: "a" }, 1_000);
  adapter.advance(20_000);
  submit(adapter, "a", { kind: "president-distribution", allocations: [{ targetPlayerId: "b", points: 1 }] }, 20_001);
  assert.deepEqual(adapter.submit("a", { kind: "president-distribution", allocations: [{ targetPlayerId: "c", points: 2 }] }, 20_002), { accepted: false, reason: "duplicate" });
  adapter.advance(45_001);
  const state = adapter.getPublicState(45_001) as RusvetDarbePublicState;
  assert.equal(state.allocations!.reduce((sum, allocation) => sum + allocation.points, 0), 2);
  assert.equal(state.allocations!.every((allocation) => Number.isInteger(allocation.points) && allocation.points >= 1 && allocation.points <= 2), true);
});

test("Rüşvet ve Darbe bağlantısı kesilen adayın eski RPS seçimini yeni havuza taşımaz", () => {
  const adapter = createStage8GameAdapter("rusvet-darbe", ["a", "b", "c"], () => 0);
  adapter.start(0);
  submit(adapter, "a", { kind: "president-vote", targetPlayerId: "b" }, 1_000);
  submit(adapter, "b", { kind: "president-vote", targetPlayerId: "c" }, 1_000);
  submit(adapter, "c", { kind: "president-vote", targetPlayerId: "a" }, 1_000);
  adapter.advance(20_000);

  submit(adapter, "c", { kind: "rps-choice", choice: "paper" }, 20_001);
  adapter.setConnectedPlayerIds?.(["a", "b"]);
  submit(adapter, "a", { kind: "rps-choice", choice: "rock" }, 20_001);
  submit(adapter, "b", { kind: "rps-choice", choice: "scissors" }, 20_001);
  adapter.advance(40_000);

  const state = adapter.getPublicState(40_000) as RusvetDarbePublicState;
  assert.equal(state.subPhase, "distribution");
  assert.equal(state.presidentId, "a");
});

test("Kontrol Paneli Kaosu ayrılan ipucu sahibine hayalet bonus yazmaz", () => {
  const adapter = createStage8GameAdapter("kontrol-paneli-kaosu", ["a", "b"], () => 0);
  adapter.start(0);
  assert.equal((adapter.getOwnState("a", 1) as { clueText: string }).clueText.length > 0, true);
  adapter.removePlayer("a");
  assert.equal((adapter.getOwnState("b", 1) as { clueText: string }).clueText, "");
  const bPanel = (adapter.getOwnState("b", 1) as { panelColors: readonly string[] }).panelColors;
  submit(adapter, "b", { kind: "panel-cut", color: bPanel[0]! }, 1_000);
  adapter.advance(60_000);
  const state = adapter.getPublicState(60_000) as KontrolPaneliPublicState;
  assert.deepEqual(state.results?.map((result) => result.playerId), ["b"]);
  assert.equal(state.results?.some((result) => result.clueHolderId === "a"), false);
  assert.equal(state.resultPoints?.some((points) => points.playerId === "a"), false);
  assert.equal(adapter.getScoreDeltas().some((delta) => delta.playerId === "a"), false);
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

test("Zehirli Kadeh bağlı olmayan hedefe takası reddeder", () => {
  const adapter = createStage8GameAdapter("zehirli-kadeh", ["a", "b", "c"], () => 0);
  adapter.start(0);
  adapter.setConnectedPlayerIds?.(["a", "b"]);
  assert.deepEqual(adapter.submit("a", { kind: "glass-trade", targetPlayerId: "c" }, 1_000), { accepted: false, reason: "invalid" });
});
